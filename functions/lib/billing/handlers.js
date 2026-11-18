"use strict";
const { BillingError } = require("./application");

function createPilotHandler(service) {
  const actions = new Map([
    ["access", "getAccess"], ["inspectAccess", "inspectAccess"], ["createQuiz", "createQuiz"],
    ["grantPremium", "grantPremium"], ["revokePremium", "revokePremium"],
    ...["createSchoolJoinCode", "revokeSchoolJoinCode", "previewSchoolJoinCode", "redeemSchoolJoinCode", "createSchool", "getSchool", "listSchools", "inviteSchoolMember", "previewSchoolInvitation", "acceptSchoolInvitation", "revokeSchoolInvitation", "removeSchoolMember", "assignSchoolMember"].map(name => [name, name])
  ]);
  return async request => {
    if (!request?.auth?.uid) throw new BillingError("unauthenticated", "Bitte anmelden.");
    const action = request.data?.action;
    if (typeof action !== "string" || !actions.has(action)) throw new BillingError("invalid-argument", "Unbekannte Abrechnungsaktion.");
    return service[actions.get(action)](request);
  };
}
function createPaymentHandler(service) {
  const actions = new Set(["checkout", "portal", "schoolInvoice"]);
  return async request => {
    if (!request?.auth?.uid) throw new BillingError("unauthenticated", "Bitte anmelden.");
    if (!actions.has(request.data?.action)) throw new BillingError("invalid-argument", "Unbekannte Zahlungsaktion.");
    return service[request.data.action](request);
  };
}
module.exports = { createPilotHandler, createPaymentHandler };
