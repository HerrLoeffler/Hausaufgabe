"use strict";

// Only this adapter knows Stripe's coupon and schedule representation. Campaign
// eligibility/capacity remain GradeCrew transactions, outside provider requests.
function createStripeOffersProvider({ client, guarded, testObject, id, idem }) {
  const ref = value => id(typeof value === "string" ? value : value?.id);
  const fail = () => { throw new TypeError("Nicht unterstützte oder veränderte Rabattvereinbarung."); };
  const positive = value => Number.isSafeInteger(value) && value > 0;
  function couponParams(offer, quantity) {
    id(offer?.id);
    if (!positive(quantity) || !["once", "months", "forever"].includes(offer.duration)) fail();
    const params = { id: idem("offer-coupon", offer.id, quantity), metadata: { gc_offer_id: offer.id, gc_quantity: String(quantity) },
      duration: offer.duration === "months" ? "repeating" : offer.duration };
    if (offer.duration === "months") {
      if (!positive(offer.durationMonths) || offer.durationMonths > 36) fail();
      params.duration_in_months = offer.durationMonths;
    }
    if (offer.discountType === "percent") {
      if (!positive(offer.percentOff) || offer.percentOff > 100) fail();
      params.percent_off = offer.percentOff;
    } else if (offer.discountType === "fixed") {
      if (!positive(offer.amountOffMinor) || !["invoice", "seat"].includes(offer.fixedBasis)) fail();
      if (offer.fixedBasis === "seat" && offer.planCode !== "school-yearly") fail();
      const amount = offer.amountOffMinor * (offer.fixedBasis === "seat" ? quantity : 1);
      if (!positive(amount)) fail();
      params.amount_off = amount; params.currency = "eur";
    } else fail();
    return params;
  }
  function checkCoupon(coupon, offer, quantity, couponId) {
    testObject(coupon, couponId);
    const params = couponParams(offer, quantity);
    if (coupon.deleted || !coupon.valid || coupon.id !== params.id || coupon.metadata?.gc_offer_id !== offer.id || coupon.metadata?.gc_quantity !== String(quantity) ||
      coupon.duration !== params.duration || (coupon.duration_in_months ?? null) !== (params.duration_in_months ?? null) ||
      (coupon.percent_off ?? null) !== (params.percent_off ?? null) || (coupon.amount_off ?? null) !== (params.amount_off ?? null) ||
      (params.amount_off && coupon.currency !== "eur") || coupon.redeem_by != null || coupon.max_redemptions != null || coupon.applies_to?.products?.length || coupon.currency_options && Object.keys(coupon.currency_options).some(currency => currency !== "eur")) fail();
    return coupon;
  }
  async function createOfferCoupon({ offer, quantity = 1 }) {
    const params = couponParams(offer, quantity);
    return guarded(async () => {
      let existing;
      try { existing = await client.coupons.retrieve(params.id); }
      catch (error) { if (error.statusCode !== 404 || error.code !== "resource_missing") throw error; }
      let coupon;
      if (existing) coupon = checkCoupon(existing, offer, quantity, params.id);
      else {
        try { coupon = await client.coupons.create(params, { idempotencyKey: idem("offer-coupon-create", offer.id, quantity) }); }
        catch (error) {
          // Concurrent creators may outlive Stripe's idempotency cache. The
          // deterministic resource must still match every promised parameter.
          if (error.statusCode !== 400 || error.code !== "resource_already_exists") throw error;
          coupon = await client.coupons.retrieve(params.id);
        }
        coupon = checkCoupon(coupon, offer, quantity, params.id);
      }
      return { couponId: coupon.id };
    });
  }
  async function createOfferPromotion({ offer, quantity = 1, customerId, couponId, reservationEndsAtMs }) {
    couponParams(offer, quantity); id(customerId); id(couponId);
    if (!positive(reservationEndsAtMs)) fail();
    return guarded(async () => {
      const result = testObject(await client.promotionCodes.create({ promotion: { type: "coupon", coupon: couponId }, customer: customerId,
        max_redemptions: 1, expires_at: Math.floor(reservationEndsAtMs / 1000),
        metadata: { gc_offer_id: offer.id, gc_quantity: String(quantity) },
        restrictions: { first_time_transaction: offer.firstTimeOnly === true }
      }, { idempotencyKey: idem("offer-promotion", offer.id, quantity, customerId, couponId, reservationEndsAtMs) }));
      return { promotionCodeId: ref(result) };
    });
  }
  async function retrieveOfferCoupon(couponId) {
    id(couponId); return guarded(async () => testObject(await client.coupons.retrieve(couponId), couponId));
  }
  function meaningful(value) { return value != null && !(Array.isArray(value) && value.length === 0) && !(typeof value === "object" && Object.keys(value).length === 0); }
  function onlyKeys(object, allowed) {
    if (!object || typeof object !== "object" || Object.entries(object).some(([key, value]) => !allowed.includes(key) && meaningful(value))) fail();
  }
  function clean(object) {
    return Object.fromEntries(Object.entries(object).filter(([, value]) => value != null).map(([key, value]) => [key,
      Array.isArray(value) ? value : typeof value === "object" ? clean(value) : value]));
  }
  function phaseParams(phase, priceId) {
    onlyKeys(phase, ["start_date", "end_date", "currency", "items", "default_payment_method", "default_tax_rates", "description", "metadata", "automatic_tax", "discounts", "proration_behavior", "billing_cycle_anchor", "collection_method", "invoice_settings", "add_invoice_items", "application_fee_percent", "billing_thresholds", "on_behalf_of", "transfer_data", "trial_end"]);
    if (phase.add_invoice_items?.length || phase.application_fee_percent != null || phase.billing_thresholds || phase.on_behalf_of || phase.transfer_data || phase.trial_end || phase.items?.length !== 1) fail();
    const item = phase.items[0];
    onlyKeys(item, ["price", "plan", "quantity", "metadata", "tax_rates", "discounts", "billing_thresholds"]);
    if (ref(item.price) !== priceId || item.quantity !== 1 || item.billing_thresholds || item.discounts?.length || phase.currency !== "eur") fail();
    const result = {};
    for (const key of ["start_date", "end_date", "currency", "description", "metadata", "billing_cycle_anchor", "collection_method", "proration_behavior"]) if (phase[key] != null) result[key] = phase[key];
    if (phase.default_payment_method) result.default_payment_method = ref(phase.default_payment_method);
    if (phase.default_tax_rates?.length) result.default_tax_rates = phase.default_tax_rates.map(ref);
    if (phase.automatic_tax) {
      onlyKeys(phase.automatic_tax, ["enabled", "liability", "disabled_reason"]);
      if (phase.automatic_tax.liability || phase.automatic_tax.disabled_reason) fail();
      result.automatic_tax = { enabled: phase.automatic_tax.enabled };
    }
    if (phase.invoice_settings) {
      onlyKeys(phase.invoice_settings, ["account_tax_ids", "custom_fields", "days_until_due", "description", "footer", "issuer"]);
      if (phase.invoice_settings.issuer && phase.invoice_settings.issuer.type !== "self") fail();
      result.invoice_settings = clean(phase.invoice_settings);
      if (phase.invoice_settings.account_tax_ids) result.invoice_settings.account_tax_ids = phase.invoice_settings.account_tax_ids.map(ref);
    }
    const discounts = phase.discounts || [];
    if (discounts.length > 1) fail();
    result.discounts = discounts.length ? discounts.map(discount => {
      // Reuse the existing Discount instead of redeeming the coupon again. This
      // preserves the original once/repeating start/end through schedule edits.
      if (discount.discount) return { discount: ref(discount.discount) };
      if (discount.promotion_code) return { promotion_code: ref(discount.promotion_code) };
      if (discount.coupon) return { coupon: ref(discount.coupon) };
      return fail();
    }) : "";
    result.items = [{ price: priceId, quantity: 1, ...(item.metadata ? { metadata: item.metadata } : {}), ...(item.tax_rates?.length ? { tax_rates: item.tax_rates.map(ref) } : {}) }];
    return result;
  }
  function addMonths(atMs, months) {
    const date = new Date(atMs); const day = date.getUTCDate();
    date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + months);
    const month = date.getUTCMonth(); date.setUTCDate(day);
    if (date.getUTCMonth() !== month) date.setUTCDate(0);
    return date.getTime();
  }
  function inspectSchedule(schedule, input) {
    const { amendmentId, subscriptionId, customerId, priceId, offer, couponId, expectedOrderId, expectedPeriodEndMs } = input;
    const metadata = schedule.metadata || {}, removal = offer === null && couponId === null;
    const effectiveAtMs = expectedPeriodEndMs;
    const phase = schedule.phases?.find(value => value.start_date * 1000 === effectiveAtMs);
    if (metadata.gc_order_id !== expectedOrderId || metadata.gc_offer_amendment_id !== amendmentId || metadata.gc_amendment_id !== amendmentId ||
      (metadata.gc_offer_id || null) !== (offer?.id || null) || (metadata.gc_coupon_id || null) !== (couponId || null) ||
      ref(schedule.customer) !== customerId || !["active", "released", "completed"].includes(schedule.status) ||
      (schedule.subscription ? ref(schedule.subscription) : ref(schedule.released_subscription)) !== subscriptionId || schedule.end_behavior !== "release" ||
      !phase || phase.end_date * 1000 !== addMonths(effectiveAtMs, 12) || phase.billing_cycle_anchor !== "automatic" || phase.proration_behavior !== "none" ||
      phase.items?.length !== 1 || ref(phase.items[0].price) !== priceId || phase.items[0].quantity !== 1 || phase.items[0].discounts?.length || phase.add_invoice_items?.length ||
      (removal ? phase.discounts?.length : phase.discounts?.length !== 1 || ref(phase.discounts[0].coupon) !== couponId)) fail();
    return { scheduleId: ref(schedule), effectiveAtMs, discountStartsAtMs: effectiveAtMs,
      discountEndsAtMs: removal || offer.duration === "forever" ? null : addMonths(effectiveAtMs, offer.duration === "months" ? offer.durationMonths : offer.planCode === "personal-yearly" ? 12 : 1) };
  }
  async function inspectOfferSchedule(input) {
    [input.scheduleId, input.amendmentId, input.subscriptionId, input.customerId, input.priceId, input.expectedOrderId].forEach(id);
    if (!positive(input.expectedPeriodEndMs)) fail();
    return guarded(async () => {
      if (input.offer) checkCoupon(await client.coupons.retrieve(input.couponId), input.offer, 1, input.couponId);
      const schedule = testObject(await client.subscriptionSchedules.retrieve(input.scheduleId), input.scheduleId);
      const metadata = schedule.metadata || {};
      if (metadata.gc_offer_amendment_id !== input.amendmentId) {
        if (ref(schedule.customer) !== input.customerId || ref(schedule.subscription) !== input.subscriptionId || schedule.status !== "active" ||
          Object.keys(metadata).length && metadata.gc_order_id !== input.expectedOrderId) fail();
        return { applied: false };
      }
      return inspectSchedule(schedule, input);
    });
  }
  function ownedCurrentDiscount(subscription, offer) {
    if (!(subscription.discounts || []).length) return false;
    if (!offer || subscription.discounts.length !== 1) fail();
    const discount = subscription.discounts[0], coupon = discount?.source?.coupon;
    checkCoupon(coupon, offer, 1, offer.couponId);
    if (coupon.id !== offer.couponId || discount.object !== "discount" || !discount.id ||
      discount.customer && ref(discount.customer) !== ref(subscription.customer) || discount.subscription && ref(discount.subscription) !== subscription.id ||
      (offer.promotionCodeId ? ref(discount.promotion_code) !== offer.promotionCodeId : !!discount.promotion_code)) fail();
    if (offer.applicationStartMs != null && discount.start * 1000 !== offer.applicationStartMs) fail();
    return true;
  }
  async function scheduleOffer(input) {
    const { amendmentId, subscriptionId, customerId, priceId, offer, couponId, expectedOrderId, expectedPeriodStartMs, expectedPeriodEndMs } = input;
    [amendmentId, subscriptionId, customerId, priceId].forEach(id);
    const removal = offer === null && couponId === null;
    if (!removal) { couponParams(offer, 1); id(couponId); }
    if (expectedOrderId != null) id(expectedOrderId);
    if ([expectedPeriodStartMs, expectedPeriodEndMs].some(value => value != null && !positive(value))) fail();
    return guarded(async () => {
      const subscription = testObject(await client.subscriptions.retrieve(subscriptionId, { expand: ["discounts.source.coupon", "discounts.promotion_code"] }), subscriptionId);
      const item = subscription.items?.data?.[0]; const price = item?.price;
      const preexistingSchedule = subscription.schedule ? testObject(await client.subscriptionSchedules.retrieve(ref(subscription.schedule)), ref(subscription.schedule)) : null;
      if (preexistingSchedule?.metadata?.gc_offer_amendment_id === amendmentId) {
        if (subscription.cancel_at || subscription.cancel_at_period_end || subscription.status !== "active" || ref(subscription.customer) !== customerId || subscription.metadata?.gc_order_id !== expectedOrderId || subscription.items?.data?.length !== 1 || item.quantity !== 1 || ref(price) !== priceId) fail();
        return inspectSchedule(preexistingSchedule, input);
      }
      const interval = price?.recurring?.interval;
      if (ref(subscription.customer) !== customerId || !subscription.metadata?.gc_order_id || expectedOrderId && subscription.metadata.gc_order_id !== expectedOrderId ||
        subscription.status !== "active" || subscription.currency !== "eur" || subscription.collection_method !== "charge_automatically" ||
        subscription.application_fee_percent != null || subscription.on_behalf_of || subscription.transfer_data || subscription.automatic_tax?.enabled || subscription.cancel_at || subscription.cancel_at_period_end || subscription.canceled_at || subscription.ended_at ||
        subscription.pause_collection || subscription.pending_update || subscription.pending_invoice_item_interval || subscription.billing_thresholds || subscription.billing_schedules?.length || subscription.trial_end && subscription.trial_end > item?.current_period_start ||
        subscription.items?.has_more || subscription.items?.data?.length !== 1 || item?.quantity !== 1 || item.discounts?.length || item.billing_thresholds ||
        !["month", "year"].includes(interval) || price.recurring.interval_count !== 1 || price.recurring.usage_type && price.recurring.usage_type !== "licensed" ||
        ref(price) !== priceId || !price.active || price.livemode !== false || price.currency !== "eur" || price.tax_behavior !== "inclusive" || price.unit_amount !== (interval === "year" ? 12000 : 1500) ||
        !positive(item.current_period_start) || !positive(item.current_period_end) || item.current_period_start >= item.current_period_end ||
        expectedPeriodStartMs != null && expectedPeriodStartMs !== item.current_period_start * 1000 || expectedPeriodEndMs != null && expectedPeriodEndMs !== item.current_period_end * 1000) fail();
      id(subscription.metadata.gc_order_id);
      if (!removal) {
        if (offer.planCode !== (interval === "year" ? "personal-yearly" : "personal-monthly")) fail();
        checkCoupon(await client.coupons.retrieve(couponId), offer, 1, couponId);
      }
      let schedule = null;
      const scheduleId = subscription.schedule ? ref(subscription.schedule) : null;
      if (scheduleId) {
        schedule = preexistingSchedule;
        const metadata = schedule.metadata || {};
        if (metadata.gc_offer_amendment_id || metadata.gc_amendment_id) {
          if (metadata.gc_order_id !== subscription.metadata.gc_order_id || ref(schedule.customer) !== customerId || ref(schedule.subscription) !== subscriptionId) fail();
        } else {
          if (Object.keys(metadata).length) fail();
          // from_subscription cannot carry metadata. Replay the original create
          // key to recover a lost response; a foreign schedule cannot be created
          // from an already scheduled subscription and is therefore rejected.
          const recovered = testObject(await client.subscriptionSchedules.create({ from_subscription: subscriptionId }, { idempotencyKey: idem("offer-schedule-create", amendmentId, subscriptionId) }));
          if (recovered.id !== scheduleId) fail();
          schedule = recovered;
        }
      } else {
        if (subscription.discounts?.length) ownedCurrentDiscount(subscription, input.currentOffer);
        else if (removal && !input.currentOffer) fail();
        schedule = testObject(await client.subscriptionSchedules.create({ from_subscription: subscriptionId }, { idempotencyKey: idem("offer-schedule-create", amendmentId, subscriptionId) }));
      }
      if (schedule.status !== "active" || ref(schedule.customer) !== customerId || ref(schedule.subscription) !== subscriptionId || schedule.pause_schedules?.length || schedule.end_behavior !== "release") fail();
      const ownAmendment = schedule.metadata?.gc_offer_amendment_id || schedule.metadata?.gc_amendment_id;
      if (!ownAmendment && schedule.phases?.length !== 1) fail();
      if (!ownAmendment && subscription.discounts?.length) ownedCurrentDiscount(subscription, input.currentOffer);
      if (input.onSchedule) await input.onSchedule(ref(schedule));
      if (ownAmendment && ownAmendment !== amendmentId && !expectedOrderId) fail();
      const current = schedule.phases?.find(phase => phase.start_date <= item.current_period_start && phase.end_date > item.current_period_start);
      if (!current || current.start_date !== schedule.current_phase?.start_date || current.end_date !== schedule.current_phase?.end_date) fail();
      if (!ownAmendment && (current.start_date !== item.current_period_start || current.end_date !== item.current_period_end)) fail();
      const original = phaseParams(current, priceId);
      if (!ownAmendment && original.discounts !== "" && !input.currentOffer) fail();
      if (original.discounts !== "") {
        original.discounts = original.discounts.map(discount => {
          if (discount.discount) { if (!(subscription.discounts || []).some(value => typeof value === "object" && value.id === discount.discount)) fail(); return discount; }
          const applied = (subscription.discounts || []).find(value => typeof value === "object" &&
            (discount.coupon && ref(value.source?.coupon) === discount.coupon || discount.promotion_code && ref(value.promotion_code) === discount.promotion_code));
          // Re-redeeming an expired/unknown coupon would restart its duration.
          // An ambiguous existing agreement needs a fresh authoritative review.
          if (!applied) fail();
          return { discount: ref(applied) };
        });
      }
      const effectiveAtMs = item.current_period_end * 1000;
      const result = { scheduleId: ref(schedule), effectiveAtMs, discountStartsAtMs: effectiveAtMs,
        discountEndsAtMs: removal || offer.duration === "forever" ? null : addMonths(effectiveAtMs, offer.duration === "months" ? offer.durationMonths : interval === "year" ? 12 : 1) };
      if (ownAmendment === amendmentId) {
        const future = schedule.phases.find(phase => phase.start_date === item.current_period_end);
        if (schedule.metadata.gc_offer_id !== (offer?.id || "") || schedule.metadata.gc_coupon_id !== (couponId || "") || !future || future.end_date * 1000 !== addMonths(effectiveAtMs, 12) || future.billing_cycle_anchor !== "automatic" || future.proration_behavior !== "none" || future.items?.length !== 1 || ref(future.items[0].price) !== priceId || future.items[0].quantity !== 1 ||
          (removal ? future.discounts?.length : future.discounts?.length !== 1 || ref(future.discounts[0].coupon) !== couponId)) fail();
        return result;
      }
      const next = { ...original, start_date: item.current_period_end, billing_cycle_anchor: "automatic", proration_behavior: "none",
        duration: { interval, interval_count: interval === "year" ? 1 : 12 }, discounts: removal ? "" : [{ coupon: couponId }] };
      delete next.end_date;
      // Current phase values are copied in full; only its boundary is extended
      // or shortened to the already agreed next billing boundary. No paid time
      // changes and no annual anchor reset occur.
      const phases = [{ ...original, end_date: item.current_period_end }, next];
      testObject(await client.subscriptionSchedules.update(schedule.id, { phases, end_behavior: "release", proration_behavior: "none",
        metadata: { ...(schedule.metadata || {}), gc_order_id: subscription.metadata.gc_order_id, gc_amendment_id: amendmentId, gc_offer_amendment_id: amendmentId, gc_offer_id: offer?.id || "", gc_coupon_id: couponId || "" }
      }, { idempotencyKey: idem("offer-schedule-update", amendmentId, subscriptionId) }), schedule.id);
      return result;
    });
  }
  return { createOfferCoupon, createOfferPromotion, retrieveOfferCoupon, scheduleOffer, inspectOfferSchedule };
}

module.exports = { createStripeOffersProvider };
