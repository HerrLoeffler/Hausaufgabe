"use strict";
const {HttpsError}=require("firebase-functions/v2/https");
// Only the isolated pilot is affected. This package is deployed separately from
// the authoring Functions; read the same protected write projection in the
// publication transaction, including the current school membership/period.
async function requireBillingPublish(tx,db,request,personId){
  if(!["gradecrew-staging-2026","demo-gradecrew-billing"].includes(db.projectId))return;
  if(db.projectId.startsWith("demo-")&&!process.env.FIRESTORE_EMULATOR_HOST)throw new HttpsError("failed-precondition","Lokaler Testzugriff fehlt.");
  const config=(await tx.get(db.doc("appConfig/billingProduct"))).data();
  if(config?.enabled!==true||!Array.isArray(config.allowedUids)||!config.allowedUids.includes(personId))return;
  const denied=()=>{throw new HttpsError("permission-denied","Für eine neue Veröffentlichung brauchst du einen gültigen Zugang.");};
  const account=(await tx.get(db.doc("billingV2Accounts/"+personId))).data();
  if(request.auth?.token?.email_verified!==true||account?.emailVerified!==true)denied();
  if(Number.isSafeInteger(account.writesUntilMs)&&account.writesUntilMs>Date.now())return;
  const id=account.primarySchoolMembershipId;
  if(typeof id!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(id))denied();
  const member=(await tx.get(db.doc("billingV2Memberships/"+id))).data();
  if(!member||member.personId!==personId||member.status!=="active"||!member.seatAssigned||!["teacher","school_admin"].includes(member.role)||!/^[A-Za-z0-9_-]{1,128}$/.test(member.schoolId))denied();
  const school=(await tx.get(db.doc("billingV2Schools/"+member.schoolId))).data();
  if(school?.status!=="active"||typeof school.currentPeriodId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(school.currentPeriodId))denied();
  const period=(await tx.get(db.doc("billingV2Periods/"+school.currentPeriodId))).data();
  if(period?.schoolId!==member.schoolId||period.paymentStatus!=="paid"||!Number.isSafeInteger(period.startsAtMs)||!Number.isSafeInteger(period.endsAtMs)||period.startsAtMs>Date.now()||period.endsAtMs<=Date.now())denied();
}
module.exports={requireBillingPublish};
