"use strict";

const { offerAmount, offerWindow, addMonths } = require("./domain/offers");
const { isPaymentReady } = require("./payments");
const FIVE_MINUTES = 5 * 60000;
const MAX_RECOVERY_AGE = 20 * 3600000;
const objectId = value => typeof value === "string" ? value : value?.id;

function createOfferAmendmentOperations({ store, now, caller, context, admin, provider, fail, key, identifier, requestId }) {
  const path = (collection, id) => collection + "/" + identifier(id);
  const previewPath = id => path("billingV2OfferAmendmentPreviews", id);
  const orderPath = id => path("billingV2Orders", id);
  const amendmentPath = id => path("billingV2OfferAmendments", id);
  const lockPath = id => path("billingV2OfferAmendmentLocks", id);
  const offerPath = id => path("billingV2Offers", id);
  const check = (condition, message = "Die Vorschau hat sich geändert. Bitte erneut prüfen.") => { if (!condition) fail("failed-precondition", message); };
  const configFingerprint = config => key(config.payments, [...config.allowedUids].sort());
  const offerFingerprint = offer => {
    if (!offer) return null;
    const { status: _status, reservedCount: _reserved, redemptionCount: _redeemed, endedAtMs: _ended, ...immutable } = offer;
    return key(immutable);
  };
  async function authorize(tx, actor, request) {
    const ctx = await context(tx, actor); admin(ctx, request, now());
    check(provider && typeof provider.retrieveSubscription === "function" && typeof provider.scheduleOffer === "function" && typeof provider.createOfferCoupon === "function" &&
      ctx.config.payments?.offersReady === true && isPaymentReady(ctx.config.payments), "Angebote sind im Zahlungstest noch nicht freigegeben.");
    return ctx;
  }
  function activeOffer(offer, expectedId) {
    check(offer && offer.id === expectedId && ["public", "accounts", "code"].includes(offer.audience) && (offer.audience !== "accounts" || Array.isArray(offer.targetIds) && offer.targetIds.length > 0) && offer.status === "active" && typeof offer.providerCouponId === "string" && offer.planCode !== "school-yearly" && offerWindow(offer, now()), "Das Angebot kann aktuell nicht neu zugewiesen werden.");
  }
  function targetOrder(order, config, offer) {
    check(order && order.kind === "personal" && order.personId === order.ownerId && config.allowedUids.includes(order.personId) &&
      ["personal-monthly", "personal-yearly"].includes(order.planCode) && ["paid", "subscription_bound"].includes(order.state) &&
      order.quantity === 1 && order.unitAmount === (order.planCode === "personal-yearly" ? 12000 : 1500) && order.priceId === config.payments.prices[order.planCode] &&
      typeof order.customerId === "string" && typeof order.subscriptionId === "string" && (!order.offerChanges || Array.isArray(order.offerChanges) && order.offerChanges.length < 50));
    [order.id, order.personId, order.customerId, order.subscriptionId, order.priceId].forEach(identifier);
    if (offer) check(offer.planCode === order.planCode && (!offer.targetIds?.length || offer.targetIds.includes(order.personId)) && offer.firstTimeOnly !== true,
      "Das Angebot gilt nicht für dieses bestehende Abonnement.");
    return order;
  }
  async function activeTarget(tx, personId) {
    const profile = await tx.get("users/" + identifier(personId)), deletion = await tx.get("accountDeletions/" + personId);
    check(profile && !deletion && !profile.accountDeletionId && !profile.isTestAccountArchived && (!profile.status || profile.status === "active") && ["teacher", "admin"].includes(profile.role), "Das ausgewählte Konto ist nicht aktiv.");
  }
  function subscriptionSnapshot(subscription, order) {
    const item = subscription?.items?.data?.[0], price = item?.price;
    check(subscription?.id === order.subscriptionId && subscription.livemode === false && objectId(subscription.customer) === order.customerId &&
      subscription.metadata?.gc_order_id === order.id && subscription.status === "active" && !subscription.cancel_at && !subscription.cancel_at_period_end &&
      !subscription.canceled_at && !subscription.ended_at && !subscription.pause_collection && !subscription.pending_update &&
      subscription.items?.has_more === false && subscription.items.data.length === 1 && item.quantity === 1 && objectId(price) === order.priceId &&
      price.livemode === false && price.active === true && price.unit_amount === order.unitAmount && price.currency === "eur" && price.tax_behavior === "inclusive" &&
      price.recurring?.interval === (order.planCode === "personal-yearly" ? "year" : "month") && price.recurring.interval_count === 1 &&
      Number.isSafeInteger(item.current_period_start) && Number.isSafeInteger(item.current_period_end) && item.current_period_start > 0 && item.current_period_end > item.current_period_start,
      "Das Abonnement ist nicht unverändert der Bestellung zugeordnet.");
    return { personId: order.personId, orderId: order.id, subscriptionId: order.subscriptionId, customerId: order.customerId, priceId: order.priceId,
      planCode: order.planCode, baseAmountMinor: order.unitAmount, effectiveAtMs: item.current_period_end * 1000, periodStartMs: item.current_period_start * 1000, periodEndMs: item.current_period_end * 1000 };
  }
  async function previewExistingOffer(request) {
    const actor = await caller(request), data = request.data || {};
    const offerId = data.offerId === null ? null : identifier(data.offerId);
    const selected = data.personIds ?? data.targets;
    if (selected !== "all" && (!Array.isArray(selected) || selected.length < 1 || selected.length > 100 || new Set(selected).size !== selected.length)) fail("invalid-argument", "Bis zu 100 eindeutige Konten auswählen.");
    if (Array.isArray(selected)) selected.forEach(identifier);
    const prepared = await store.transaction(async tx => {
      const ctx = await authorize(tx, actor, request), offer = offerId ? await tx.get(offerPath(offerId)) : null;
      if (offerId) activeOffer(offer, offerId);
      const allowed = ctx.config.allowedUids;
      check(selected === "all" || selected.every(personId => allowed.includes(personId)), "Nur bereits freigegebene Testkonten auswählen.");
      const targetIds = selected === "all" ? [...new Set(allowed)] : selected;
      check(targetIds.length <= 100, "Höchstens 100 freigegebene Konten gleichzeitig prüfen.");
      const candidates = [];
      for (const personId of targetIds) {
        identifier(personId);
        candidates.push(...await tx.find("billingV2Orders", [["kind", "==", "personal"], ["personId", "==", personId]], 101));
        check(candidates.length <= 100, "Zu viele Bestellungen. Die Zielgruppe muss enger geprüft werden.");
      }
      const orders = candidates.filter(order => allowed.includes(order.personId) && order.subscriptionId && ["paid", "subscription_bound"].includes(order.state) &&
        (selected === "all" || selected.includes(order.personId)) && (!offer || order.planCode === offer.planCode) &&
        (selected !== "all" || !offer?.targetIds?.length || offer.targetIds.includes(order.personId)));
      check(orders.length > 0 && orders.length <= 100 && new Set(orders.map(order => order.personId)).size === orders.length, "Keine eindeutigen berechtigten Abonnements gefunden.");
      if (selected !== "all") check(selected.every(personId => orders.some(order => order.personId === personId)), "Nicht jedes ausgewählte Konto besitzt ein passendes Abonnement.");
      for (const order of orders) { targetOrder(order, ctx.config, offer); await activeTarget(tx, order.personId); }
      return { config: ctx.config, configFingerprint: configFingerprint(ctx.config), offer, offerFingerprint: offerFingerprint(offer), orders };
    });
    const subscriptions = [];
    for (const order of prepared.orders) {
      const snapshot = subscriptionSnapshot(await provider.retrieveSubscription(order.subscriptionId), order);
      const amount = prepared.offer ? offerAmount(prepared.offer, order) : { totalMinor: order.unitAmount };
      subscriptions.push({ ...snapshot, totalMinor: amount.totalMinor, discountEndsAtMs: !prepared.offer ? snapshot.effectiveAtMs : prepared.offer.duration === "forever" ? null : addMonths(snapshot.effectiveAtMs, prepared.offer.duration === "months" ? prepared.offer.durationMonths : order.planCode === "personal-yearly" ? 12 : 1) });
    }
    const createdAtMs = now(), expiresAtMs = createdAtMs + FIVE_MINUTES;
    const id = key("offer-amendment-preview", actor.uid, offerId, subscriptions, createdAtMs);
    await store.transaction(async tx => {
      const ctx = await authorize(tx, actor, request), existing = await tx.get(previewPath(id));
      const currentOffer = offerId ? await tx.get(offerPath(offerId)) : null;
      check(configFingerprint(ctx.config) === prepared.configFingerprint && offerFingerprint(currentOffer) === prepared.offerFingerprint);
      if (currentOffer) activeOffer(currentOffer, offerId);
      for (const order of prepared.orders) { check(key(await tx.get(orderPath(order.id))) === key(order)); await activeTarget(tx, order.personId); }
      if (!existing) tx.create(previewPath(id), { id, createdBy: actor.uid, createdAtMs, expiresAtMs, offer: prepared.offer, offerFingerprint: prepared.offerFingerprint,
        configFingerprint: prepared.configFingerprint, subscriptions, orders: prepared.orders.map(order => ({ orderId: order.id, fingerprint: key(order) })) });
    });
    return { preview: { id, count: subscriptions.length, subscriptions, expiresAtMs } };
  }
  function providerInput(amendment) {
    const target = amendment.target;
    return { amendmentId: amendment.id, subscriptionId: target.subscriptionId, customerId: target.customerId, priceId: target.priceId,
      offer: amendment.offer, couponId: amendment.couponId ?? null, expectedOrderId: target.orderId,
      expectedPeriodStartMs: target.periodStartMs, expectedPeriodEndMs: target.periodEndMs, scheduleId: amendment.scheduleId };
  }
  async function completeAmendment(amendmentId, scheduled, authorizeFinal) {
    return store.transaction(async tx => {
      if (authorizeFinal) await authorizeFinal(tx);
      const current = await tx.get(amendmentPath(amendmentId)); check(current);
      const order = await tx.get(orderPath(current.orderId)), lock = await tx.get(lockPath(current.orderId));
      const currentOffer = current.offer ? await tx.get(offerPath(current.offer.id)) : null;
      if (current.state === "scheduled") return order;
      check(current.state === "pending" && lock?.amendmentId === amendmentId && key(order) === current.orderFingerprint && order.state !== "canceled" &&
        scheduled.scheduleId === current.scheduleId && scheduled.effectiveAtMs === current.target.periodEndMs && scheduled.discountStartsAtMs === current.target.periodEndMs && (order.offerChanges || []).length < 50);
      const { promotionCodeId: _customerPromotion, ...couponOffer } = current.offer || {};
      const boundOffer = current.offer ? { ...couponOffer, couponId: current.couponId, applicationStartMs: scheduled.effectiveAtMs, applicationChannel: "admin_assignment" } : null;
      const changes = [...(order.offerChanges || []), { effectiveAtMs: scheduled.effectiveAtMs, offer: boundOffer }];
      if (current.offer) {
        check(currentOffer && current.reserved && currentOffer.reservedCount > 0);
        tx.patch(offerPath(currentOffer.id), { reservedCount: currentOffer.reservedCount - 1, redemptionCount: (currentOffer.redemptionCount || 0) + 1 });
      }
      tx.patch(orderPath(current.orderId), { offerChanges: changes });
      tx.patch(amendmentPath(amendmentId), { state: "scheduled", reserved: false, effectiveAtMs: scheduled.effectiveAtMs, completedAtMs: now() });
      tx.patch(lockPath(current.orderId), { state: "scheduled", completedAtMs: now() });
      return { ...order, offerChanges: changes };
    });
  }
  async function recoverOrderAmendment(order) {
    const pending = await store.transaction(async tx => {
      const lock = await tx.get(lockPath(order.id));
      const amendment = lock?.state === "pending" ? await tx.get(amendmentPath(lock.amendmentId)) : null;
      return amendment?.state === "pending" && amendment.scheduleId && amendment.target && (amendment.offer === null || amendment.couponId) ? amendment : null;
    });
    if (!pending) return order;
    check(pending.orderId === order.id && pending.target.customerId === order.customerId && pending.target.subscriptionId === order.subscriptionId);
    // Read-only proof survives preview expiry, campaign end, an invoice webhook
    // racing the admin response, and the original subscription period rolling.
    const scheduled = await provider.inspectOfferSchedule(providerInput(pending));
    return scheduled?.applied === false ? order : completeAmendment(pending.id, scheduled);
  }
  async function applyExistingOffer(request) {
    const actor = await caller(request), data = request.data || {}, previewId = identifier(data.previewId), rid = requestId(data.requestId);
    if (typeof data.reason !== "string" || data.reason.trim().length < 3 || data.reason.trim().length > 500) fail("invalid-argument", "Einen nachvollziehbaren Änderungsgrund angeben.");
    const reason = data.reason.trim();
    const preview = await store.transaction(async tx => {
      const ctx = await authorize(tx, actor, request), value = await tx.get(previewPath(previewId));
      check(value && value.createdBy === actor.uid && value.configFingerprint === configFingerprint(ctx.config));
      if (value.applyRequestId) check(value.applyRequestId === rid && value.reason === reason, "Die Vorschau wurde bereits mit einer anderen Anfrage bestätigt.");
      else { check(value.expiresAtMs > now(), "Die Vorschau ist abgelaufen. Bitte neu erstellen."); tx.patch(previewPath(previewId), { applyRequestId: rid, reason, appliedAtMs: now(), state: "pending" }); }
      return value;
    });
    const results = [];
    for (const target of preview.subscriptions) {
      const amendmentId = key(previewId, target.orderId), ap = amendmentPath(amendmentId);
      let pending = false;
      try {
        const savedOrder = await store.transaction(tx => tx.get(orderPath(target.orderId)));
        if (savedOrder) await recoverOrderAmendment(savedOrder);
        const inspection = await store.transaction(async tx => {
          const ctx = await authorize(tx, actor, request);
          check(configFingerprint(ctx.config) === preview.configFingerprint && ctx.config.allowedUids.includes(target.personId));
          const amendment = await tx.get(ap), order = await tx.get(orderPath(target.orderId)), lock = await tx.get(lockPath(target.orderId)); await activeTarget(tx, target.personId);
          if (amendment?.state === "scheduled") return { completed: amendment };
          pending = !!amendment;
          check(!amendment || amendment.previewId === previewId && amendment.orderFingerprint === key(order) && lock?.amendmentId === amendmentId);
          check(!lock || lock.state === "scheduled" || lock.amendmentId === amendmentId, "Eine andere Änderung dieses Abonnements muss zuerst abgeschlossen werden.");
          const snapshot = preview.orders.find(value => value.orderId === target.orderId);
          check(snapshot && snapshot.fingerprint === key(order)); targetOrder(order, ctx.config, preview.offer);
          if (amendment) check(now() >= amendment.createdAtMs && now() - amendment.createdAtMs < MAX_RECOVERY_AGE, "Der unterbrochene Vorgang muss geprüft werden.");
          return { order, amendment };
        });
        if (inspection.completed) { results.push({ personId: target.personId, state: "scheduled", effectiveAtMs: inspection.completed.effectiveAtMs }); continue; }
        const actual = subscriptionSnapshot(await provider.retrieveSubscription(target.subscriptionId), inspection.order);
        check(actual.periodStartMs === target.periodStartMs && actual.periodEndMs === target.periodEndMs);
        const amendment = await store.transaction(async tx => {
          const ctx = await authorize(tx, actor, request);
          check(configFingerprint(ctx.config) === preview.configFingerprint && ctx.config.allowedUids.includes(target.personId));
          const order = await tx.get(orderPath(target.orderId)), existing = await tx.get(ap), lock = await tx.get(lockPath(target.orderId));
          const currentOffer = preview.offer ? await tx.get(offerPath(preview.offer.id)) : null;
          await activeTarget(tx, target.personId);
          check(configFingerprint(ctx.config) === preview.configFingerprint && key(order) === key(inspection.order));
          check(!lock || lock.state === "scheduled" || lock.amendmentId === amendmentId, "Eine andere Änderung dieses Abonnements ist noch offen.");
          if (existing) { check(existing.previewId === previewId && existing.orderFingerprint === key(order)); return existing; }
          check(preview.expiresAtMs > now(), "Die Vorschau ist abgelaufen.");
          if (preview.offer) {
            activeOffer(currentOffer, preview.offer.id); check(offerFingerprint(currentOffer) === preview.offerFingerprint);
            const redeemed = currentOffer.redemptionCount || 0, reserved = currentOffer.reservedCount || 0;
            check(Number.isSafeInteger(redeemed) && Number.isSafeInteger(reserved) && redeemed >= 0 && reserved >= 0 &&
              (currentOffer.maxRedemptions == null || redeemed + reserved < currentOffer.maxRedemptions), "Die Einlösegrenze ist erreicht.");
            tx.patch(offerPath(currentOffer.id), { reservedCount: reserved + 1 });
          }
          const record = { id: amendmentId, previewId, target, personId: target.personId, orderId: target.orderId, orderFingerprint: key(order), offer: preview.offer,
            createdBy: actor.uid, createdAtMs: now(), reason, applicationChannel: "admin_assignment", state: "pending", reserved: !!preview.offer };
          tx.create(ap, record); tx.put(lockPath(target.orderId), { amendmentId, previewId, state: "pending", createdAtMs: now() });
          return record;
        });
        if (amendment.state === "scheduled") { results.push({ personId: target.personId, state: "scheduled", effectiveAtMs: amendment.effectiveAtMs }); continue; }
        pending = true;
        const couponId = preview.offer ? identifier((await provider.createOfferCoupon({ offer: preview.offer, quantity: 1 })).couponId) : null;
        await store.transaction(async tx => {
          const current = await tx.get(ap); check(current?.state === "pending" && (current.couponId == null || current.couponId === couponId));
          tx.patch(ap, { couponId });
        });
        let currentOffer = inspection.order.offer || null;
        for (const change of [...(inspection.order.offerChanges || [])].sort((a, b) => a.effectiveAtMs - b.effectiveAtMs)) if (change.effectiveAtMs <= target.periodStartMs) currentOffer = change.offer;
        if (currentOffer && currentOffer.applicationStartMs == null) {
          const subscription = await provider.retrieveSubscription(target.subscriptionId);
          currentOffer = { ...currentOffer, applicationStartMs: subscription.start_date * 1000 };
        }
        const scheduled = await provider.scheduleOffer({ amendmentId, subscriptionId: target.subscriptionId, customerId: target.customerId, priceId: target.priceId,
          offer: preview.offer, couponId, currentOffer, expectedOrderId: target.orderId, expectedPeriodStartMs: target.periodStartMs, expectedPeriodEndMs: target.periodEndMs,
          onSchedule: async scheduleId => {
            identifier(scheduleId);
            await store.transaction(async tx => {
              const current = await tx.get(ap); check(current?.state === "pending" && (!current.scheduleId || current.scheduleId === scheduleId));
              tx.patch(ap, { scheduleId });
            });
          }
        });
        identifier(scheduled.scheduleId);
        await completeAmendment(amendmentId, scheduled, async tx => {
          const ctx = await authorize(tx, actor, request); check(configFingerprint(ctx.config) === preview.configFingerprint); await activeTarget(tx, target.personId);
        });
        results.push({ personId: target.personId, state: "scheduled", effectiveAtMs: scheduled.effectiveAtMs });
      } catch {
        results.push({ personId: target.personId, state: pending ? "pending" : "failed", error: pending ? "Die Änderung muss mit derselben Anfrage erneut abgeglichen werden." : "Das Abonnement oder die Berechtigung hat sich geändert. Bitte neu prüfen." });
      }
    }
    const completedCount = results.filter(result => result.state === "scheduled").length;
    if (completedCount === results.length) await store.transaction(async tx => { const value = await tx.get(previewPath(previewId)); if (value?.applyRequestId === rid) tx.patch(previewPath(previewId), { state: "scheduled" }); });
    return { status: completedCount === results.length ? "scheduled" : completedCount ? "partial" : "pending", count: results.length, completedCount, results };
  }
  return { previewExistingOffer, applyExistingOffer, recoverOrderAmendment };
}

module.exports = { createOfferAmendmentOperations };
