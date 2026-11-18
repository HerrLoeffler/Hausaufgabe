"use strict";
const { normalizeInvoice, mergePaidPeriods } = require("./domain/stripe-contracts");
const { PERSONAL_PLANS, SCHOOL_ANNUAL_SEAT_MINOR } = require("./domain/catalog");
const { SANDBOX_ACCOUNT } = require("./stripe-provider");
const { URL } = require("node:url");
const objectId = value => typeof value === "string" ? value : value?.id;
const MAX_UNCERTAIN_AGE_MS = 20 * 3600000;
function isPaymentReady(c) {
    if (c?.enabled !== true || c.ready !== true || c.accountId !== SANDBOX_ACCOUNT || typeof c.portalConfigurationId !== "string" || !/^bpc_[A-Za-z0-9]+$/.test(c.portalConfigurationId) || typeof c.personalTestClockId !== "string" || !/^clock_[A-Za-z0-9]+$/.test(c.personalTestClockId) || !["personal-monthly", "personal-yearly", "school-yearly"].every(code => typeof c.prices?.[code] === "string" && /^price_[A-Za-z0-9]+$/.test(c.prices[code]))) return false;
    try { const u = new URL(c.returnUrl); return u.protocol === "https:" && !u.username && !u.password && !u.port && /^gradecrew-staging-2026--billing-(product|plan-01)-[a-z0-9-]+\.web\.app$/.test(u.hostname); } catch { return false; }
  }
function createPaymentOperations({ store, now, caller, context, projectWrites, provider, fail, key, identifier, requestId }) {
  const orderPath = id => "billingV2Orders/" + identifier(id);
  const buyerPath = id => "billingV2Buyers/" + identifier(id);
  const lockPath = uid => "billingV2PurchaseLocks/" + identifier(uid);
  async function describeState(tx, ctx, actor) {
    const buyer = await tx.get(buyerPath(key("personal", actor.uid))), lock = await tx.get(lockPath(actor.uid)), order = lock ? await tx.get(orderPath(lock.orderId)) : null;
    const invoices = await tx.find("billingV2Invoices", [["kind", "==", "personal"], ["ownerId", "==", actor.uid]], 51);
    return { purchasingEnabled: isPaymentReady(ctx.config.payments) && ctx.person.emailVerified === true,
      payments: { portalAvailable: !!buyer?.customerId && isPaymentReady(ctx.config.payments), hasSubscription: !!order?.subscriptionId,
        invoices: invoices.slice(0, 50).map(i => ({ id: i.id, invoiceNumber: i.invoiceNumber || null, total: i.total, remaining: i.remaining, status: i.status })), hasMoreInvoices: invoices.length > 50 } };
  }
  function configuration(ctx) {
    const c = ctx.config.payments;
    if (!provider || !ctx.person.emailVerified || !isPaymentReady(c)) fail("failed-precondition", "Zahlungstest noch nicht verfügbar.");
    return c;
  }
  function checkedObject(value) {
    if (!value?.id || value.livemode !== false) fail("failed-precondition", "Unstimmiges Stripe-Testobjekt.");
    identifier(value.id); return value;
  }
  function checkedUrl(value, kind) {
    let url;
    try { url = new URL(value); } catch { fail("failed-precondition", "Zahlungsadresse fehlt."); }
    const host = { checkout: "checkout.stripe.com", invoice: "invoice.stripe.com", portal: "billing.stripe.com" }[kind];
    if (url.protocol !== "https:" || url.hostname !== host || url.username || url.password || url.port) fail("failed-precondition", "Unstimmige Zahlungsadresse.");
    return url.href;
  }
  function resumeWindow(at) {
    if (!Number.isSafeInteger(at) || now() - at >= MAX_UNCERTAIN_AGE_MS || at > now()) fail("failed-precondition", "Unterbrochener Zahlungsvorgang muss geprüft werden, bevor ein neuer Kauf beginnt.");
  }
  async function ensureCustomer(order) {
    const buyer = await store.transaction(tx => tx.get(buyerPath(order.buyerKey)));
    if (!buyer || buyer.kind !== order.kind || buyer.ownerId !== order.ownerId) fail("failed-precondition", "Käuferbindung fehlt.");
    if (buyer.customerId) return buyer.customerId;
    resumeWindow(buyer.createdAtMs);
    const customer = checkedObject(await provider.createCustomer({ buyerKey: order.buyerKey, testClockId: buyer.testClockId || null }));
    await store.transaction(async tx => {
      const current = await tx.get(buyerPath(order.buyerKey));
      if (!current || (current.customerId && current.customerId !== customer.id)) fail("failed-precondition", "Käuferbindung widersprüchlich.");
      tx.patch(buyerPath(order.buyerKey), { customerId: customer.id });
    });
    return customer.id;
  }
  async function checkout(request) {
    const actor = await caller(request), data = request.data || {}, rid = requestId(data.requestId);
    const plan = PERSONAL_PLANS.find(p => p.code === data.planCode);
    if (!plan) fail("invalid-argument", "Gültigen Tarif auswählen.");
    const prepared = await store.transaction(async tx => {
      const ctx = await context(tx, actor), config = configuration(ctx);
      const lock = await tx.get(lockPath(actor.uid));
      const previous = lock ? await tx.get(orderPath(lock.orderId)) : null;
      if (lock && !previous) fail("failed-precondition", "Kaufvorgang bitte prüfen.");
      if (previous) {
        if (previous.planCode !== plan.code || ["subscription_bound", "paid", "canceled"].includes(previous.state)) fail("failed-precondition", "Es besteht bereits ein Abo oder Kaufvorgang. Bitte die Aboverwaltung verwenden.");
        return previous;
      }
      const id = key(actor.uid, "personal-order", rid), buyerKey = key("personal", actor.uid), buyer = await tx.get(buyerPath(buyerKey));
      const priceId = identifier(config.prices?.[plan.code]);
      const order = { id, kind: "personal", ownerId: actor.uid, buyerKey, personId: actor.uid, planCode: plan.code, priceId, unitAmount: plan.amountMinor, quantity: 1, interval: plan.interval,
        returnUrl: config.returnUrl, createdAtMs: now(), state: "creating" };
      ctx.saveAccount();
      if (!buyer) tx.create(buyerPath(buyerKey), { kind: "personal", ownerId: actor.uid, createdAtMs: now(), customerId: null, testClockId: config.personalTestClockId });
      tx.create(orderPath(id), order); tx.create(lockPath(actor.uid), { orderId: id });
      return order;
    });
    if (prepared.checkoutUrl) {
      if (!Number.isSafeInteger(prepared.checkoutExpiresAtMs) || prepared.checkoutExpiresAtMs <= now()) fail("failed-precondition", "Der Testcheckout ist abgelaufen. Bitte den Vorgang prüfen lassen.");
      return { orderId: prepared.id, url: prepared.checkoutUrl, replayed: true };
    }
    resumeWindow(prepared.createdAtMs);
    const customerId = await ensureCustomer(prepared);
    await store.transaction(async tx => {
      const order = await tx.get(orderPath(prepared.id));
      if (order.customerId && order.customerId !== customerId) fail("failed-precondition", "Käuferbindung widersprüchlich.");
      tx.patch(orderPath(prepared.id), { customerId });
    });
    const session = checkedObject(await provider.createCheckout({ ...prepared, orderId: prepared.id, customerId }));
    const url = checkedUrl(session.url, "checkout");
    await store.transaction(async tx => {
      const current = await tx.get(orderPath(prepared.id));
      if (current.checkoutId && current.checkoutId !== session.id) fail("failed-precondition", "Checkoutbindung widersprüchlich.");
      tx.patch(orderPath(prepared.id), { checkoutId: session.id, checkoutUrl: url, checkoutExpiresAtMs: session.expires_at * 1000,
        state: current.state === "creating" ? "checkout_ready" : current.state });
    });
    return { orderId: prepared.id, url, replayed: false };
  }
  async function portal(request) {
    const actor = await caller(request);
    const data = await store.transaction(async tx => {
      const ctx = await context(tx, actor), config = configuration(ctx);
      const buyer = await tx.get(buyerPath(key("personal", actor.uid)));
      if (!buyer?.customerId || buyer.kind !== "personal" || buyer.ownerId !== actor.uid) fail("not-found", "Noch kein persönliches Zahlungskonto vorhanden.");
      return { customerId: buyer.customerId, returnUrl: config.returnUrl, configurationId: config.portalConfigurationId };
    });
    const result = await provider.createPortal(data);
    return { url: checkedUrl(result.url, "portal") };
  }
  async function schoolInvoice(request) {
    const actor = await caller(request), data = request.data || {}, schoolId = identifier(data.schoolId);
    requestId(data.requestId);
    const prepared = await store.transaction(async tx => {
      const ctx = await context(tx, actor), config = configuration(ctx);
      const school = await tx.get("billingV2Schools/" + schoolId), member = await tx.get("billingV2Memberships/" + key(schoolId, actor.uid));
      if (!school || school.status !== "active") fail("not-found", "Schule nicht verfügbar.");
      if (ctx.person.role !== "admin" && !(member?.status === "active" && ["school_admin", "billing"].includes(member.role))) fail("permission-denied", "Nur für die Schulabrechnung.");
      const periodId = identifier(school.currentPeriodId), period = await tx.get("billingV2Periods/" + periodId);
      if (!period || period.schoolId !== schoolId || period.unitAmountMinor !== SCHOOL_ANNUAL_SEAT_MINOR || !Number.isInteger(period.quantity) || period.quantity < 1 || period.quantity > 500 || period.amountMinor !== period.quantity * SCHOOL_ANNUAL_SEAT_MINOR || period.currency !== "eur") fail("failed-precondition", "Schulzeitraum bitte prüfen.");
      const id = key("school-order", schoolId, periodId), previous = await tx.get(orderPath(id)), buyerKey = key("school", schoolId), buyer = await tx.get(buyerPath(buyerKey));
      if (previous) {
        if (previous.kind !== "school" || previous.schoolId !== schoolId || previous.periodId !== periodId || previous.quantity !== period.quantity || previous.unitAmount !== period.unitAmountMinor || previous.startsAtMs !== period.startsAtMs || previous.endsAtMs !== period.endsAtMs) fail("failed-precondition", "Schulbestellung widersprüchlich.");
        return previous;
      }
      if (period.paymentStatus !== "open") fail("failed-precondition", "Schulzeitraum bereits abgeschlossen.");
      const order = { id, kind: "school", ownerId: schoolId, schoolId, periodId, buyerKey, priceId: identifier(config.prices?.["school-yearly"]), unitAmount: SCHOOL_ANNUAL_SEAT_MINOR,
        quantity: period.quantity, startsAtMs: period.startsAtMs, endsAtMs: period.endsAtMs, createdAtMs: now(), state: "creating" };
      if (!buyer) tx.create(buyerPath(buyerKey), { kind: "school", ownerId: schoolId, createdAtMs: now(), customerId: null });
      tx.create(orderPath(id), order); tx.patch("billingV2Periods/" + periodId, { orderId: id });
      return order;
    });
    if (prepared.invoiceId && prepared.invoiceUrl) return { orderId: prepared.id, invoiceId: prepared.invoiceId, url: prepared.invoiceUrl, replayed: true };
    async function saveInvoice(invoice, replayed) {
      const url = checkedUrl(invoice.hosted_invoice_url, "invoice");
      await store.transaction(async tx => {
        const current = await tx.get(orderPath(prepared.id));
        if (current.invoiceId && current.invoiceId !== invoice.id) fail("failed-precondition", "Rechnungsbindung widersprüchlich.");
        tx.patch(orderPath(prepared.id), { invoiceId: invoice.id, invoiceUrl: url, state: current.state === "creating" ? "invoice_open" : current.state });
        tx.patch("billingV2Periods/" + prepared.periodId, { invoiceId: invoice.id });
      });
      return { orderId: prepared.id, invoiceId: invoice.id, url, replayed };
    }
    if (prepared.invoiceId) {
      const existing = checkedObject(await provider.retrieveInvoice(prepared.invoiceId));
      if (existing.status !== "draft") {
        normalizeInvoice(existing, { ...prepared, orderId: prepared.id });
        return saveInvoice(existing, true);
      }
    }
    resumeWindow(prepared.createdAtMs);
    const customerId = await ensureCustomer(prepared);
    await store.transaction(async tx => { const current = await tx.get(orderPath(prepared.id)); if (current.customerId && current.customerId !== customerId) fail("failed-precondition", "Käuferbindung widersprüchlich."); tx.patch(orderPath(prepared.id), { customerId }); });
    const invoice = checkedObject(await provider.createSchoolInvoice({ ...prepared, customerId, orderId: prepared.id,
      onDraft: async invoiceId => {
        identifier(invoiceId);
        await store.transaction(async tx => {
          const current = await tx.get(orderPath(prepared.id));
          if (current.invoiceId && current.invoiceId !== invoiceId) fail("failed-precondition", "Rechnungsbindung widersprüchlich.");
          tx.patch(orderPath(prepared.id), { invoiceId }); tx.patch("billingV2Periods/" + prepared.periodId, { invoiceId });
        });
      }
    }));
    return saveInvoice(invoice, false);
  }
  function validateSubscription(subscription, order) {
    checkedObject(subscription);
    if (objectId(subscription.customer) !== order.customerId || subscription.metadata?.gc_order_id !== order.id || subscription.items?.has_more !== false || subscription.items.data?.length !== 1 ||
      objectId(subscription.items.data[0].price) !== order.priceId || subscription.items.data[0].quantity !== 1) fail("failed-precondition", "Abonnement nicht der Bestellung zugeordnet.");
  }
  async function processStripeEvent(event) {
    if (!provider || event?.object !== "event" || event.livemode !== false || (event.account && event.account !== SANDBOX_ACCOUNT) || typeof event.type !== "string") fail("failed-precondition", "Ungültiges Stripe-Testereignis.");
    identifier(event.id); const objectIdValue = identifier(event.data?.object?.id), eventPath = "billingV2StripeEvents/" + event.id;
    const previousEvent = await store.transaction(tx => tx.get(eventPath));
    const sameEvent = previous => { if (previous.type !== event.type || previous.objectId !== objectIdValue) fail("failed-precondition", "Ereigniskennung widersprüchlich."); return { replayed: true }; };
    if (previousEvent) return sameEvent(previousEvent);
    const receipt = { type: event.type, objectId: objectIdValue, receivedAtMs: now(), state: "processed" };
    if (/^(charge\.refunded|charge\.dispute\.|refund\.)/.test(event.type)) {
      return store.transaction(async tx => { const seen = await tx.get(eventPath); if (seen) return sameEvent(seen);
        tx.create(eventPath, { ...receipt, state: "review" }); tx.create("billingV2Reviews/" + event.id, { type: event.type, objectId: objectIdValue, state: "open", createdAtMs: now() }); return { review: true }; });
    }
    if (event.type === "checkout.session.completed") {
      const session = checkedObject(await provider.retrieveCheckout(objectIdValue));
      if (!session.metadata?.gc_order_id) return { unmanaged: true };
      const orderId = identifier(session.metadata.gc_order_id);
      const order = await store.transaction(tx => tx.get(orderPath(orderId)));
      if (!order || order.kind !== "personal" || session.id !== order.checkoutId || objectId(session.customer) !== order.customerId) fail("failed-precondition", "Checkout nicht zugeordnet.");
      const subscription = await provider.retrieveSubscription(identifier(objectId(session.subscription))); validateSubscription(subscription, order);
      return store.transaction(async tx => {
        const seen = await tx.get(eventPath), current = await tx.get(orderPath(orderId)); if (seen) return sameEvent(seen);
        if (current.subscriptionId && current.subscriptionId !== subscription.id) fail("failed-precondition", "Abonnementbindung widersprüchlich.");
        tx.patch(orderPath(orderId), { subscriptionId: subscription.id, state: current.state === "paid" ? "paid" : "subscription_bound" }); tx.create(eventPath, receipt); return { bound: true };
      });
    }
    if (!/^invoice\.(paid|payment_succeeded|payment_failed|updated|finalized|voided|marked_uncollectible)$/.test(event.type)) {
      return store.transaction(async tx => { const seen = await tx.get(eventPath); if (seen) return sameEvent(seen); tx.create(eventPath, { ...receipt, state: "ignored" }); return { ignored: true }; });
    }
    const invoice = checkedObject(await provider.retrieveInvoice(objectIdValue));
    const mappedOrderId = invoice.parent?.subscription_details?.metadata?.gc_order_id || invoice.metadata?.gc_order_id;
    if (!mappedOrderId) return { unmanaged: true };
    const orderId = identifier(mappedOrderId);
    const order = await store.transaction(tx => tx.get(orderPath(orderId)));
    if (!order?.customerId) fail("failed-precondition", "Rechnung nicht zugeordnet.");
    const subscriptionId = order.kind === "personal" ? identifier(objectId(invoice.parent?.subscription_details?.subscription)) : null;
    if (subscriptionId) validateSubscription(await provider.retrieveSubscription(subscriptionId), order);
    const normalized = normalizeInvoice(invoice, { ...order, orderId, subscriptionId });
    const schoolInvoiceUrl = order.kind === "school" && invoice.hosted_invoice_url ? checkedUrl(invoice.hosted_invoice_url, "invoice") : null;
    return store.transaction(async tx => {
      const seen = await tx.get(eventPath), current = await tx.get(orderPath(orderId)), previous = await tx.get("billingV2Invoices/" + invoice.id);
      if (seen) return sameEvent(seen);
      if (!current || current.customerId !== normalized.customerId || (current.subscriptionId && current.subscriptionId !== subscriptionId) || (current.kind === "school" && current.invoiceId && current.invoiceId !== invoice.id)) fail("failed-precondition", "Zahlungsbindung widersprüchlich.");
      let account, profile, deletion, grants, grant, grantId, period;
      if (current.kind === "personal" && normalized.paid) {
        grantId = key("stripe-subscription", subscriptionId);
        grant = await tx.get("billingV2Grants/" + grantId);
        if (grant && (grant.personId !== current.personId || grant.orderId !== orderId)) fail("failed-precondition", "Zugangsquelle widersprüchlich.");
        account = await tx.get("billingV2Accounts/" + current.personId); profile = await tx.get("users/" + current.personId); deletion = await tx.get("accountDeletions/" + current.personId);
        grants = await tx.find("billingV2Grants", [["personId", "==", current.personId], ["status", "==", "active"]], 51);
        if (grants.length > 50) fail("failed-precondition", "Zu viele Zugangsquellen, bitte prüfen.");
      }
      if (current.kind === "school") {
        period = await tx.get("billingV2Periods/" + current.periodId);
        if (!period || period.schoolId !== current.schoolId || period.orderId !== orderId || period.amountMinor !== normalized.total || period.startsAtMs !== current.startsAtMs || period.endsAtMs !== current.endsAtMs) fail("failed-precondition", "Schulzeitraum nicht zugeordnet.");
      }
      const saved = previous?.paid || (previous && previous.paidAmount > normalized.paidAmount) ? previous : normalized;
      tx.put("billingV2Invoices/" + invoice.id, { ...saved, kind: current.kind, ownerId: current.ownerId, updatedAtMs: now() });
      if (subscriptionId || normalized.paid || current.kind === "school") tx.patch(orderPath(orderId), {
        ...(subscriptionId ? { subscriptionId } : {}), ...(normalized.paid ? { state: "paid" } : {}),
        ...(current.kind === "school" ? { invoiceId: invoice.id, ...(schoolInvoiceUrl ? { invoiceUrl: schoolInvoiceUrl } : {}) } : {})
      });
      if (current.kind === "school" && normalized.paid) tx.patch("billingV2Periods/" + current.periodId, { paymentStatus: "paid", invoiceId: invoice.id, paidAtMs: now() });
      if (current.kind === "personal" && normalized.paid) {
        const next = { personId: current.personId, scope: { kind: "personal", id: current.personId }, source: "stripe", status: "active", orderId, subscriptionId,
          paidPeriods: mergePaidPeriods([...(grant?.paidPeriods || []), normalized.period]), updatedAtMs: now() };
        tx.put("billingV2Grants/" + grantId, next);
        if (account) projectWrites(tx, current.personId, account, { ...profile, id: current.personId, role: profile?.role || "missing", emailVerified: account.emailVerified === true,
          ...(deletion ? { accountDeletionId: "deleted" } : {}) }, [...grants.filter(g => g.id !== grantId), { ...next, id: grantId }]);
      }
      tx.create(eventPath, receipt); return { paid: normalized.paid, remaining: normalized.remaining };
    });
  }
  return { checkout, portal, schoolInvoice, processStripeEvent, describeState };
}

module.exports = { createPaymentOperations, isPaymentReady };
