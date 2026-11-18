"use strict";
const test = require("node:test"), assert = require("node:assert/strict"), fs = require("node:fs");
const { initializeTestEnvironment, assertFails, assertSucceeds } = require("@firebase/rules-unit-testing");
const { doc, setDoc, updateDoc, getDoc, deleteDoc } = require("firebase/firestore");
assert.match(process.env.FIRESTORE_EMULATOR_HOST || "", /^(127\.0\.0\.1|localhost):\d+$/);
let env;
test.before(async () => { env = await initializeTestEnvironment({ projectId: "demo-gradecrew-billing", firestore: { rules: fs.readFileSync("firestore.secure-assessment.rules", "utf8") } }); });
test.after(async () => { await env.cleanup(); });
const personal = { kind: "personal", id: "teacher" };
async function seed(until = Date.now() + 86400000) {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users/teacher"), { role: "teacher", status: "active" });
    await setDoc(doc(db, "appConfig/billingProduct"), { enabled: true, allowedUids: ["teacher"] });
    await setDoc(doc(db, "billingV2Accounts/teacher"), { version: 2, writesUntilMs: until, createdCount: 5, emailVerified: true });
    await setDoc(doc(db, "quizzes/PAIDCODE"), { ownerId: "teacher", title: "Existing", published: false, ended: false, isDeleted: false, rightsHold: false, billingCreationState: "committed", billingLedgerId: "opaque", billingScope: personal });
    await setDoc(doc(db, "quizzes/PAIDCODE/questions/q1"), { text: "Existing question", points: 1 });
  });
}
test("an enrolled teacher cannot bypass the server by creating a quiz directly", async () => {
  await seed(); const db = env.authenticatedContext("teacher", {email_verified:true}).firestore();
  await assertFails(setDoc(doc(db, "quizzes/BYPASS01"), { ownerId: "teacher", title: "Bypass", published: false, rightsHold: false }));
});
test("client cannot reset trial counters or write a manual premium grant", async () => {
  await seed(); const db = env.authenticatedContext("teacher", {email_verified:true}).firestore();
  await assertFails(updateDoc(doc(db, "billingV2Accounts/teacher"), { createdCount: 0, writesUntilMs: Date.now() + 1000000000 }));
  await assertFails(setDoc(doc(db, "billingV2Grants/self"), { personId: "teacher", status: "active", source: "manual" }));
});
test("existing tests remain editable during trial even when all five files are used", async () => {
  await seed(); const db = env.authenticatedContext("teacher", {email_verified:true}).firestore();
  await assertSucceeds(updateDoc(doc(db, "quizzes/PAIDCODE"), { title: "Revised" }));
  await assertSucceeds(updateDoc(doc(db, "quizzes/PAIDCODE/questions/q1"), { text: "Revised question" }));
});
test("expired access is read-only but allows ending and deleting into trash", async () => {
  await seed(Date.now() - 1000); const db = env.authenticatedContext("teacher", {email_verified:true}).firestore();
  await assertSucceeds(getDoc(doc(db, "quizzes/PAIDCODE")));
  await assertFails(updateDoc(doc(db, "quizzes/PAIDCODE"), { title: "Paid edit" }));
  await assertFails(updateDoc(doc(db, "quizzes/PAIDCODE/questions/q1"), { text: "Paid edit" }));
  await assertSucceeds(updateDoc(doc(db, "quizzes/PAIDCODE"), { isDeleted: true, published: false, ended: true, deletedBy: "teacher" }));
  await assertSucceeds(deleteDoc(doc(db, "quizzes/PAIDCODE/questions/q1")));
});
test("billing ownership and creation receipt cannot be rewritten during trial", async () => {
  await seed(); const db = env.authenticatedContext("teacher", {email_verified:true}).firestore();
  await assertFails(updateDoc(doc(db, "quizzes/PAIDCODE"), { billingScope: { kind: "school", id: "foreign" } }));
  await assertFails(updateDoc(doc(db, "quizzes/PAIDCODE"), { billingCreationState: "free" }));
});
test("unenrolled accounts retain their previous creation path during controlled rollout", async () => {
  await seed();
  await env.withSecurityRulesDisabled(ctx => setDoc(doc(ctx.firestore(), "users/legacy"), { role: "teacher", status: "active" }));
  const db = env.authenticatedContext("legacy").firestore();
  await assertSucceeds(setDoc(doc(db, "quizzes/LEGACY01"), { ownerId: "legacy", title: "Legacy", published: false, rightsHold: false }));
});
test("school membership grants editing of own existing files and removal takes effect without refresh", async () => {
  await seed(Date.now() - 1000);
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await updateDoc(doc(db, "billingV2Accounts/teacher"), { primarySchoolMembershipId: "member-one" });
    await setDoc(doc(db, "billingV2Memberships/member-one"), { personId: "teacher", schoolId: "school-one", status: "active", role: "teacher", seatAssigned: true });
    await setDoc(doc(db, "billingV2Schools/school-one"), { status: "active", currentPeriodId: "period-one" });
    await setDoc(doc(db, "billingV2Periods/period-one"), { schoolId: "school-one", paymentStatus: "paid", startsAtMs: Date.now() - 10000, endsAtMs: Date.now() + 86400000 });
  });
  const db = env.authenticatedContext("teacher", {email_verified:true}).firestore();
  await assertSucceeds(updateDoc(doc(db, "quizzes/PAIDCODE"), { title: "School supplies Premium" }));
  await env.withSecurityRulesDisabled(ctx => updateDoc(doc(ctx.firestore(), "billingV2Memberships/member-one"), { status: "left", seatAssigned: false }));
  await assertFails(updateDoc(doc(db, "quizzes/PAIDCODE"), { title: "Stale seat" }));
  await assertSucceeds(getDoc(doc(db, "quizzes/PAIDCODE")));
});
test("pre-pilot files remain editable without a new creation receipt or another credit", async () => {
  await seed();await env.withSecurityRulesDisabled(ctx=>setDoc(doc(ctx.firestore(),'quizzes/LEGACY02'),{ownerId:'teacher',title:'Old',published:false,ended:false,rightsHold:false}));
  await assertSucceeds(updateDoc(doc(env.authenticatedContext('teacher',{email_verified:true}).firestore(),'quizzes/LEGACY02'),{title:'Revised old file'}));
});
test("moderation works independently of an expired owner but cannot smuggle paid edits",async()=>{
  await seed(Date.now()-1000);await env.withSecurityRulesDisabled(ctx=>setDoc(doc(ctx.firestore(),'users/admin'),{role:'admin',status:'active'}));
  const db=env.authenticatedContext('admin',{email_verified:true}).firestore();
  await assertSucceeds(updateDoc(doc(db,'quizzes/PAIDCODE'),{rightsHold:true,rightsHoldBy:'admin',rightsHoldAt:new Date()}));
  await assertFails(updateDoc(doc(db,'quizzes/PAIDCODE'),{title:'Unrelated edit'}));
});
test("an expired owner can end a shared running assessment without expanding sharing",async()=>{
  await seed(Date.now()-1000);await env.withSecurityRulesDisabled(ctx=>updateDoc(doc(ctx.firestore(),'quizzes/PAIDCODE'),{published:true,ended:false,shareEnabled:true}));
  const db=env.authenticatedContext('teacher',{email_verified:true}).firestore();
  await assertSucceeds(updateDoc(doc(db,'quizzes/PAIDCODE'),{ended:true,endedAt:new Date()}));
  await assertFails(updateDoc(doc(db,'quizzes/PAIDCODE'),{shareEnabled:false,ended:false}));
});
test("own school-funded file accepts remaining personal Premium after leaving",async()=>{
  await seed();await env.withSecurityRulesDisabled(ctx=>updateDoc(doc(ctx.firestore(),'quizzes/PAIDCODE'),{billingScope:{kind:'school',id:'gone',membershipId:'gone-member'}}));
  await assertSucceeds(updateDoc(doc(env.authenticatedContext('teacher',{email_verified:true}).firestore(),'quizzes/PAIDCODE'),{title:'Still my file'}));
});
test("current unverified identity cannot use cached personal or school write rights",async()=>{
  await seed();const db=env.authenticatedContext('teacher',{email_verified:false}).firestore();
  await assertFails(updateDoc(doc(db,'quizzes/PAIDCODE'),{title:'Unverified'}));
});
