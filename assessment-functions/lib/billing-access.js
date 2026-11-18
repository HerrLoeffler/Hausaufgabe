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
  const at=Date.now();
  async function paidSeat(member){
    if(!member||member.personId!==personId||member.status!=="active"||member.seatAssigned!==true||!["teacher","school_admin"].includes(member.role)||typeof member.schoolId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(member.schoolId))return false;
    const school=(await tx.get(db.doc("billingV2Schools/"+member.schoolId))).data();
    if(school?.status!=="active"||typeof school.currentPeriodId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(school.currentPeriodId))return false;
    const period=(await tx.get(db.doc("billingV2Periods/"+school.currentPeriodId))).data();
    return period?.schoolId===member.schoolId&&period.paymentStatus==="paid"&&Number.isSafeInteger(period.startsAtMs)&&Number.isSafeInteger(period.endsAtMs)&&period.startsAtMs<=at&&period.endsAtMs>at;
  }
  const id=account.primarySchoolMembershipId;
  if(typeof id==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(id)&&await paidSeat((await tx.get(db.doc("billingV2Memberships/"+id))).data()))return;
  // Payment changes the period itself. A teacher must not need a separate
  // account refresh before this independently deployed publication handler.
  const members=await tx.get(db.collection("billingV2Memberships").where("personId","==",personId).where("status","==","active").limit(21));
  if(members.docs.length>20)denied();
  for(const member of members.docs){if(member.id!==id&&await paidSeat(member.data()))return;}
  denied();
}
module.exports={requireBillingPublish};
