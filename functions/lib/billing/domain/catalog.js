"use strict";
// Current user-selected draft prices. These are not Stripe Live price IDs.
const PERSONAL_PLANS = Object.freeze([
  Object.freeze({ code: "personal-monthly", interval: "month", amountMinor: 1500, currency: "eur", draft: true }),
  Object.freeze({ code: "personal-yearly", interval: "year", amountMinor: 12000, currency: "eur", draft: true })
]);
const SCHOOL_ANNUAL_SEAT_MINOR = 5000;
module.exports = { PERSONAL_PLANS, SCHOOL_ANNUAL_SEAT_MINOR };
