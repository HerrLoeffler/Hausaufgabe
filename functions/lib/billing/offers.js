"use strict";
const { randomBytes } = require("node:crypto");
const { normalizeOffer, offerAmount, offerWindow, addMonths } = require("./domain/offers");
const { PERSONAL_PLANS, SCHOOL_ANNUAL_SEAT_MINOR } = require("./domain/catalog");
const { isPaymentReady } = require("./payments");

function createOfferOperations({ store, now, caller, context, admin, identity, provider, fail, key, identifier, requestId }) {
  const path = id => "billingV2Offers/" + identifier(id);
  const enabled = ctx => ctx.config?.payments?.offersReady === true && isPaymentReady(ctx.config.payments);
  function requireEnabled(ctx) { if (!enabled(ctx)) fail("failed-precondition", "Die Angebotsverwaltung ist noch nicht freigegeben."); }
  async function requireAdmin(tx, actor, request) { const ctx = await context(tx, actor); requireEnabled(ctx); admin(ctx, request, now()); return ctx; }
  function clean(input) { try { return normalizeOffer(input); } catch { fail("invalid-argument", "Bitte Rabatt, Zielgruppe, Zeitraum und Laufzeit vollständig prüfen."); } }
  async function rows(tx, planCode) {
    const result = await tx.find("billingV2Offers", [["planCode", "==", planCode]], 101);
    if (result.length > 100) fail("resource-exhausted", "Zu viele Angebotsversionen für diesen Tarif. Bitte prüfen lassen."); return result;
  }
  const active = record => record.status === "active" && offerWindow(record, now());
  const customerView = (record, amount) => ({ id: record.id, offerId: record.id, planCode: record.planCode, title: record.title,
    ...amount, duration: record.duration, durationMonths: record.durationMonths, endsAtMs: record.endsAtMs });
  function available(record) { return active(record) && (!record.maxRedemptions || record.redemptionCount + record.reservedCount < record.maxRedemptions); }
  function eligible(record, ownerId, firstTime) { return available(record) && (!record.firstTimeOnly || firstTime) && (!record.targetIds?.length || record.targetIds.includes(ownerId)); }
  function select(records, ownerId, firstTime, code) {
    const available = records.filter(record => eligible(record, ownerId, firstTime));
    if (code) {
      const matches = available.filter(record => record.audience === "code" && record.code === code);
      if (!matches.length) fail("not-found", "Dieser Code ist für dieses Konto und diesen Tarif nicht gültig.");
      if (matches.length > 1) fail("failed-precondition", "Für diesen Code bestehen widersprüchliche Aktionen."); return matches[0];
    }
    const personal = available.filter(record => record.audience === "accounts");
    const matches = personal.length ? personal : available.filter(record => record.audience === "public");
    if (matches.length > 1) fail("failed-precondition", "Mehrere persönliche Angebote gelten gleichzeitig. Bitte die Verwaltung um Klärung bitten.");
    return matches[0] || null;
  }
  async function publicOffers() {
    return store.transaction(async tx => {
      const config = await tx.get("appConfig/billingProduct");
      if (config?.enabled !== true || config.payments?.offersReady !== true || !isPaymentReady(config.payments)) return { offers: [] };
      const records = await tx.find("billingV2Offers", [["audience", "==", "public"]], 301);
      if (records.length > 300) fail("unavailable", "Angebote vorübergehend nicht verfügbar.");
      return { offers: records.filter(available).map(record => customerView(record, offerAmount(record, {
        unitAmount: record.planCode === "school-yearly" ? SCHOOL_ANNUAL_SEAT_MINOR : PERSONAL_PLANS.find(p => p.code === record.planCode)?.amountMinor, quantity: 1
      }))) };
    });
  }
  async function describeOffers(tx, ctx, actor) {
    if (!enabled(ctx)) return { offersEnabled: false, canManageOffers: false, offerViews: [] };
    const buyer = await tx.get("billingV2Buyers/" + key("personal", actor.uid));
    const views = [];
    for (const plan of PERSONAL_PLANS) {
      const records = await rows(tx, plan.code);
      let chosen = null;
      try { chosen = select(records, actor.uid, !buyer?.customerId, null); } catch (error) { if (error.code !== "failed-precondition") throw error; }
      if (chosen) views.push(customerView(chosen, offerAmount(chosen, { unitAmount: plan.amountMinor, quantity: 1 })));
    }
    return { offersEnabled: true, canManageOffers: ctx.person.role === "admin" && ctx.person.emailVerified === true, offerViews: views };
  }
  async function offerTargets(request) {
    const actor = await caller(request), data = request.data || {};
    const query = String(data.query || "").trim().toLowerCase();
    if (query.length < 2 || query.length > 100 || !["person", "school"].includes(data.kind)) fail("invalid-argument", "Mindestens zwei Zeichen und eine gültige Auswahl eingeben.");
    const result = await store.transaction(async tx => {
      const ctx = await requireAdmin(tx, actor, request);
      if (data.kind === "school") {
        const schools = await tx.find("billingV2Schools", [["status", "==", "active"]], 101);
        const matches = schools.filter(school => String(school.name || "").toLowerCase().includes(query));
        return { targets: matches.slice(0, 20).map(school => ({ id: school.id, label: school.name, kind: "school" })), hasMore: schools.length > 100 || matches.length > 20 };
      }
      if (ctx.config.allowedUids.length > 100) fail("resource-exhausted", "Die Kontosuche muss für einen größeren Bestand erweitert werden.");
      const profiles = [];
      for (const uid of ctx.config.allowedUids) {
        const profile = await tx.get("users/" + identifier(uid));
        if (profile && ["teacher", "admin"].includes(profile.role) && (!profile.status || profile.status === "active") && !profile.accountDeletionId && !profile.isTestAccountArchived) profiles.push({ uid, label: profile.displayName || profile.name || "" });
      }
      return profiles;
    });
    if (!Array.isArray(result)) return result;
    const targets = [];
    for (const profile of result) {
      let person;
      try { person = await identity(profile.uid); } catch { continue; }
      if (person.disabled || !person.emailVerified) continue;
      const label = profile.label || person.email;
      if ((label + " " + person.email).toLowerCase().includes(query)) targets.push({ id: profile.uid, label, email: person.email, kind: "person" });
    }
    return { targets: targets.slice(0, 20), hasMore: targets.length > 20 };
  }
  async function listOffers(request) {
    const actor = await caller(request);
    return store.transaction(async tx => { await requireAdmin(tx, actor, request); const records = await tx.find("billingV2Offers", [], 101);
      const previews = await tx.find("billingV2OfferAmendmentPreviews", [["createdBy", "==", actor.uid], ["state", "==", "pending"]], 101);
      if (records.length > 100) fail("resource-exhausted", "Bitte die Angebotsversionen zuerst bereinigen lassen."); return { offers: records, pendingApplications: previews.slice(0,100).map(value => ({ previewId: value.id, requestId: value.applyRequestId, reason: value.reason, count: value.subscriptions.length })) }; });
  }
  async function saveOffer(request) {
    const actor = await caller(request), data = request.data || {}, rid = requestId(data.requestId), offer = clean(data.offer);
    const id = key("offer", actor.uid, rid), previousOfferId = data.previousOfferId ? identifier(data.previousOfferId) : null, fingerprint = key(offer, previousOfferId);
    return store.transaction(async tx => {
      await requireAdmin(tx, actor, request); const previous = await tx.get(path(id)), original = previousOfferId ? await tx.get(path(previousOfferId)) : null;
      if (previous) { if (previous.fingerprint !== fingerprint) fail("already-exists", "Diese Anfragekennung gehört bereits zu einem anderen Entwurf."); return { offer: previous }; }
      if (previousOfferId && (!original || original.planCode !== offer.planCode)) fail("failed-precondition", "Die ursprüngliche Angebotsversion passt nicht zum Tarif.");
      const record = { ...offer, id, fingerprint, previousOfferId, status: "draft", createdBy: actor.uid, createdAtMs: now(), redemptionCount: 0, reservedCount: 0 };
      tx.create(path(id), record); tx.create("billingV2Audit/" + key("offer_draft", id), { action: "offer_draft", actorId: actor.uid, reference: id, reason: offer.reason, atMs: now() }); return { offer: record };
    });
  }
  async function publishOffer(request) {
    const actor = await caller(request), id = identifier(request.data?.offerId); requestId(request.data?.requestId);
    const prepared = await store.transaction(async tx => {
      await requireAdmin(tx, actor, request); const record = await tx.get(path(id));
      if (!record) fail("not-found", "Angebot nicht gefunden."); if (record.status === "active") return record;
      if (!["draft", "syncing", "sync_error"].includes(record.status) || record.endsAtMs <= now()) fail("failed-precondition", "Dieses Angebot kann nicht mehr veröffentlicht werden.");
      if (record.syncStartedAtMs && now() - record.syncStartedAtMs >= 20 * 3600000) fail("failed-precondition", "Die unterbrochene Veröffentlichung muss geprüft werden.");
      const others = await rows(tx, record.planCode);
      if (record.audience === "public" && others.some(other => other.id !== id && other.audience === "public" && ["active", "syncing", "sync_error"].includes(other.status) && record.startsAtMs < other.endsAtMs && other.startsAtMs < record.endsAtMs)) fail("already-exists", "In diesem Zeitraum besteht bereits eine öffentliche Aktion für den Tarif.");
      tx.patch(path(id), { status: "syncing", syncStartedAtMs: record.syncStartedAtMs || now() }); return record;
    });
    if (prepared.status === "active") return { offer: prepared };
    if (!provider?.createOfferCoupon) fail("failed-precondition", "Der Zahlungsadapter für Aktionen fehlt.");
    let coupon;
    try { coupon = await provider.createOfferCoupon({ offer: prepared, quantity: 1 }); identifier(coupon?.couponId); }
    catch (error) { await store.transaction(async tx => { const current = await tx.get(path(id)); if (current?.status === "syncing") tx.patch(path(id), { status: "sync_error" }); }); throw error; }
    return store.transaction(async tx => {
      await requireAdmin(tx, actor, request);
      const current = await tx.get(path(id)), others = await rows(tx, prepared.planCode);
      if (prepared.audience === "public" && others.some(other => other.id !== id && other.audience === "public" && ["active", "syncing", "sync_error"].includes(other.status) && prepared.startsAtMs < other.endsAtMs && other.startsAtMs < prepared.endsAtMs)) fail("already-exists", "Der öffentliche Aktionszeitraum ist bereits vergeben.");
      if (current?.status === "ended") fail("failed-precondition", "Die Aktion wurde während der Synchronisierung beendet.");
      if (!current || current.fingerprint !== prepared.fingerprint || current.providerCouponId && current.providerCouponId !== coupon.couponId) fail("failed-precondition", "Die Angebotsversion wurde verändert.");
      const result = { ...current, status: "active", providerCouponId: coupon.couponId, publishedAtMs: current.publishedAtMs || now() };
      tx.put(path(id), result); return { offer: result };
    });
  }
  async function endOffer(request) {
    const actor = await caller(request), data = request.data || {}, id = identifier(data.offerId), rid = requestId(data.requestId), reason = String(data.reason || "").trim();
    if (reason.length < 3 || reason.length > 500) fail("invalid-argument", "Grund für das Beenden erforderlich.");
    return store.transaction(async tx => { await requireAdmin(tx, actor, request); const record = await tx.get(path(id)), auditPath = "billingV2Audit/" + key("offer_ended", id, rid), audit = await tx.get(auditPath);
      if (!record) fail("not-found", "Angebot nicht gefunden.");
      if (audit) return { offer: record };
      const result = { ...record, status: "ended", endedAtMs: now() }; tx.put(path(id), result);
      tx.create(auditPath, { action: "offer_ended", actorId: actor.uid, reference: id, reason, atMs: now() }); return { offer: result };
    });
  }
  async function quoteBase(tx, actor, ctx, data) {
    if (data.planCode === "school-yearly") {
      const schoolId = identifier(data.schoolId), school = await tx.get("billingV2Schools/" + schoolId), member = await tx.get("billingV2Memberships/" + key(schoolId, actor.uid));
      if (!school || school.status !== "active" || (ctx.person.role !== "admin" && !(member?.status === "active" && ["school_admin", "billing"].includes(member.role)))) fail("permission-denied", "Keine Berechtigung für die Schulabrechnung.");
      const period = await tx.get("billingV2Periods/" + identifier(school.currentPeriodId));
      if (!period || period.schoolId !== schoolId || period.orderId || period.paymentStatus !== "open" || period.unitAmountMinor !== SCHOOL_ANNUAL_SEAT_MINOR || !Number.isInteger(period.quantity) || period.quantity < 1 || period.quantity > 500) fail("failed-precondition", "Diese Schulrechnung ist bereits gebunden oder muss geprüft werden.");
      return { kind: "school", ownerId: schoolId, planCode: data.planCode, priceId: ctx.config.payments.prices[data.planCode], quantity: period.quantity, unitAmount: SCHOOL_ANNUAL_SEAT_MINOR, periodId: school.currentPeriodId, startsAtMs: period.startsAtMs };
    }
    const plan = PERSONAL_PLANS.find(p => p.code === data.planCode); if (!plan) fail("invalid-argument", "Gültigen Tarif auswählen.");
    return { kind: "personal", ownerId: actor.uid, planCode: plan.code, priceId: ctx.config.payments.prices[plan.code], quantity: 1, unitAmount: plan.amountMinor };
  }
  async function offerQuote(request) {
    const actor = await caller(request), data = request.data || {};
    await store.transaction(async tx => {
      const ctx = await context(tx, actor); if (!isPaymentReady(ctx.config.payments)) fail("failed-precondition", "Zahlungstest noch nicht verfügbar."); if (!ctx.person.emailVerified) fail("permission-denied", "Bitte die E-Mail-Adresse bestätigen.");
      const ratePath = "billingV2OfferAttempts/" + key(actor.uid), rate = await tx.get(ratePath), ongoing = rate && rate.startMs <= now() && rate.startMs + 600000 > now();
      if (ongoing && rate.count >= 30) fail("resource-exhausted", "Zu viele Preisabfragen. Bitte einige Minuten warten.");
      tx.put(ratePath, { startMs: ongoing ? rate.startMs : now(), count: ongoing ? rate.count + 1 : 1 });
    });
    return store.transaction(async tx => {
      const ctx = await context(tx, actor); if (!isPaymentReady(ctx.config.payments)) fail("failed-precondition", "Zahlungstest noch nicht verfügbar."); const base = await quoteBase(tx, actor, ctx, data), buyer = await tx.get("billingV2Buyers/" + key(base.kind, base.ownerId));
      const code = data.code ? String(data.code).trim().toUpperCase() : null;
      if (code && !/^[A-Z0-9][A-Z0-9-]{2,31}$/.test(code)) fail("invalid-argument", "Gültigen Aktionscode eingeben.");
      if (code && !enabled(ctx)) fail("failed-precondition", "Aktionscodes sind noch nicht freigegeben.");
      const agreement = base.kind === "school" ? (await tx.get("billingV2Schools/" + base.ownerId))?.discountAgreement : null;
      const inherited = !code && agreement && agreement.offer.duration !== "once" && (agreement.endsAtMs === null || Math.max(now(), base.startsAtMs) < agreement.endsAtMs);
      const record = inherited ? { ...agreement.offer, applicationChannel: "school_agreement", schoolAgreementId: agreement.id } : enabled(ctx) ? select(await rows(tx, base.planCode), base.ownerId, !buyer?.customerId, code) : null;
      const amount = record ? offerAmount(record, base) : { baseAmountMinor: base.unitAmount * base.quantity, discountAmountMinor: 0, totalMinor: base.unitAmount * base.quantity };
      const id = key("offer_quote", actor.uid, randomBytes(16).toString("hex")), result = { ...base, ...amount, id, personId: actor.uid, offer: record, createdAtMs: now(), expiresAtMs: now() + 300000, state: "quoted" };
      tx.create("billingV2OfferQuotes/" + id, result);
      return { eligible: true, quote: { ...base, ...amount, id, createdAtMs: result.createdAtMs, expiresAtMs: result.expiresAtMs, offer: record ? { ...customerView(record, amount), discountType: record.discountType, percentOff: record.percentOff, amountOffMinor: record.amountOffMinor, fixedBasis: record.fixedBasis } : null } };
    });
  }
  async function prepareQuoteUse(tx, actor, ctx, data, base) {
    if (!enabled(ctx) && !data.quoteId) return { offer: null, totalMinor: base.unitAmount * base.quantity, write: () => {} };
    if (!data.quoteId) {
      const buyer = await tx.get("billingV2Buyers/" + key(base.kind, base.ownerId));
      if (enabled(ctx) && select(await rows(tx, base.planCode), base.ownerId, !buyer?.customerId, null)) fail("failed-precondition", "Bitte zuerst den aktuellen Aktionspreis prüfen.");
      return { offer: null, totalMinor: base.unitAmount * base.quantity, write: () => {} };
    }
    const id = identifier(data.quoteId), q = await tx.get("billingV2OfferQuotes/" + id);
    if (!q || q.personId !== actor.uid || q.ownerId !== base.ownerId) fail("permission-denied", "Diese Preisvorschau gehört zu einem anderen Konto.");
    if (q.state !== "quoted" || q.expiresAtMs <= now() || ["kind", "planCode", "priceId", "quantity", "unitAmount"].some(field => q[field] !== base[field]) || (base.periodId && q.periodId !== base.periodId)) fail("failed-precondition", "Die Preisvorschau ist abgelaufen oder der Tarif hat sich geändert.");
    let record = null, reservationId = null;
    if (q.offer?.schoolAgreementId) {
      const school = await tx.get("billingV2Schools/" + base.ownerId), period = await tx.get("billingV2Periods/" + base.periodId);
      if (base.kind !== "school" || school?.discountAgreement?.id !== q.offer.schoolAgreementId || !period || school.discountAgreement.endsAtMs !== null && Math.max(now(), period.startsAtMs) >= school.discountAgreement.endsAtMs) fail("failed-precondition", "Die Schulvereinbarung muss erneut geprüft werden.");
    } else if (q.offer) {
      if (!enabled(ctx)) fail("failed-precondition", "Angebote sind noch nicht freigegeben.");
      record = await tx.get(path(q.offer.id));
      if (!record || record.fingerprint !== q.offer.fingerprint || !active(record)) fail("failed-precondition", "Dieses Angebot ist nicht mehr neu einlösbar.");
      reservationId = key(record.id, base.kind, base.ownerId); const previous = await tx.get("billingV2OfferReservations/" + reservationId);
      if (previous && previous.state !== "released") fail("already-exists", "Dieser Vorteil ist für das Zahlungskonto bereits eingelöst oder reserviert.");
      if (record.maxRedemptions && record.redemptionCount + record.reservedCount >= record.maxRedemptions) fail("resource-exhausted", "Die Aktion ist bereits vollständig vergeben.");
    }
    return { offer: q.offer, quoteId: id, totalMinor: q.totalMinor, reservationId, write: orderId => {
      tx.patch("billingV2OfferQuotes/" + id, { state: "bound", orderId });
      if (record) {
        tx.patch(path(record.id), { reservedCount: record.reservedCount + 1 });
        tx.put("billingV2OfferReservations/" + reservationId, { id: reservationId, offerId: record.id, kind: base.kind, ownerId: base.ownerId, orderId, state: "reserved", createdAtMs: now() });
      }
    } };
  }
  async function materializeOrderOffer(order) {
    if (!order.offer) return {};
    const coded = order.offer.audience === "code" && order.offer.applicationChannel !== "school_agreement";
    const discount = (couponId, promotionCodeId) => promotionCodeId ? { promotionCodeId } : { couponId };
    if (order.offer.couponId && (!coded || order.offer.promotionCodeId)) return discount(order.offer.couponId, order.offer.promotionCodeId);
    if (now() - order.createdAtMs >= 20 * 3600000) fail("failed-precondition", "Die unterbrochene Rabatteinlösung muss geprüft werden.");
    const coupon = await provider.createOfferCoupon({ offer: order.offer, quantity: order.quantity }); identifier(coupon?.couponId);
    let promotionCodeId = order.offer.promotionCodeId || null;
    if (coded && !promotionCodeId) { const promotion = await provider.createOfferPromotion({ offer: order.offer, quantity: order.quantity, customerId: order.customerId, couponId: coupon.couponId, reservationEndsAtMs: order.offerReservationEndsAtMs || order.checkoutExpiresAtMs }); promotionCodeId = identifier(promotion?.promotionCodeId); }
    const next = { ...order.offer, couponId: coupon.couponId, ...(promotionCodeId ? { promotionCodeId } : {}) };
    await store.transaction(async tx => { const current = await tx.get("billingV2Orders/" + order.id);
      if (!current || current.offer?.id !== order.offer.id || current.customerId !== order.customerId || current.offer.couponId && current.offer.couponId !== coupon.couponId || current.offer.promotionCodeId && current.offer.promotionCodeId !== promotionCodeId) fail("failed-precondition", "Die Rabattbindung ist widersprüchlich."); tx.patch("billingV2Orders/" + order.id, { offer: next }); });
    return discount(coupon.couponId, promotionCodeId);
  }
  async function prepareSettlement(tx, order, paid) {
    if (!paid) return () => {};
    const school = order.kind === "school" && order.offer ? await tx.get("billingV2Schools/" + order.schoolId) : null;
    const preserveAgreement = () => {
      if (school && !order.offer.schoolAgreementId && school.discountAgreement?.sourceOrderId !== order.id) {
        const { couponId: _coupon, promotionCodeId: _promo, ...agreementOffer } = order.offer;
        const applicationStartMs = order.offerAgreementStartMs;
        if (!Number.isSafeInteger(applicationStartMs)) fail("failed-precondition", "Beginn der Schulvereinbarung fehlt.");
        tx.patch("billingV2Schools/" + order.schoolId, { discountAgreement: { id: key("school-agreement", order.id), sourceOrderId: order.id, offer: agreementOffer,
          applicationStartMs, endsAtMs: order.offer.duration === "forever" ? null : addMonths(applicationStartMs, order.offer.duration === "months" ? order.offer.durationMonths : 12) } });
      }
    };
    if (!order.offerReservationId) return preserveAgreement;
    const reservation = await tx.get("billingV2OfferReservations/" + order.offerReservationId), record = reservation ? await tx.get(path(reservation.offerId)) : null;
    if (!reservation || reservation.orderId !== order.id || !record) fail("failed-precondition", "Einlösebeleg fehlt.");
    if (reservation.state === "redeemed") return preserveAgreement;
    if (reservation.state !== "reserved" || record.reservedCount < 1) fail("failed-precondition", "Einlösebeleg muss geprüft werden.");
    return () => { preserveAgreement(); tx.patch("billingV2OfferReservations/" + order.offerReservationId, { state: "redeemed", redeemedAtMs: now() }); tx.patch(path(record.id), { reservedCount: record.reservedCount - 1, redemptionCount: record.redemptionCount + 1 }); };
  }
  async function prepareExpiry(tx, order) {
    if (!order.offerReservationId) return () => {};
    const reservation = await tx.get("billingV2OfferReservations/" + order.offerReservationId), record = reservation ? await tx.get(path(reservation.offerId)) : null;
    if (!reservation || reservation.orderId !== order.id || !record || reservation.state !== "reserved") return () => {};
    if (record.reservedCount < 1) fail("failed-precondition", "Einlösebeleg muss geprüft werden.");
    return () => { tx.patch("billingV2OfferReservations/" + order.offerReservationId, { state: "released", releasedAtMs: now() }); tx.patch(path(record.id), { reservedCount: record.reservedCount - 1 }); };
  }
  return { actions: { publicOffers, offerTargets, listOffers, saveOffer, publishOffer, endOffer, offerQuote }, describeOffers, prepareQuoteUse, materializeOrderOffer, prepareSettlement, prepareExpiry };
}
module.exports = { createOfferOperations };
