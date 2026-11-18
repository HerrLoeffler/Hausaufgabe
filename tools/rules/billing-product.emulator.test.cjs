"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const requireFunctions = require("node:module").createRequire(require("node:path").resolve(__dirname, "../../functions/package.json"));
const { initializeApp, deleteApp } = requireFunctions("firebase-admin/app");
const { getFirestore } = requireFunctions("firebase-admin/firestore");
const { createBillingService } = requireFunctions("./lib/billing/application");
const { createPilotHandler } = requireFunctions("./lib/billing/handlers");
const { createFirestoreBillingStore } = requireFunctions("./lib/billing/firestore-store");
assert.match(process.env.FIRESTORE_EMULATOR_HOST || "", /^(127\.0\.0\.1|localhost):\d+$/);
const app = initializeApp({ projectId: "demo-gradecrew-billing" }, "billing-service");
const db = getFirestore(app);
const start = Date.UTC(2026, 10, 1);
let time = start + 86400000;
const identities = new Map();
const service = createBillingService({ store: createFirestoreBillingStore(db), now: () => time, projectId: "demo-gradecrew-billing", getIdentity: async uid => {
  const identity = identities.get(uid);
  if (!identity) throw new Error("Unknown identity");
  return identity;
} });
const request = (uid, data = {}) => ({ auth: { uid, token: { auth_time: Math.floor(time / 1000) } }, data });
async function seed() {
  time = start + 86400000;
  for (const collection of ["users", "accountDeletions", "appConfig", "billingV2Accounts", "billingV2Grants", "billingV2Ledger", "billingV2Schools", "billingV2Memberships", "billingV2Periods", "billingV2Invitations", "billingV2Audit", "quizzes"]) await db.recursiveDelete(db.collection(collection));
  identities.clear();
  for (const uid of ["admin", "teacher", "other", "third"]) {
    identities.set(uid, { uid, emailVerified: true, disabled: false, email: uid + "@example.invalid", metadata: { creationTime: new Date(start).toISOString() } });
    await db.doc("users/" + uid).set({ role: uid === "admin" ? "admin" : "teacher", status: "active", email: uid + "@example.invalid" });
  }
  await db.doc("appConfig/billingProduct").set({ enabled: true, allowedUids: ["admin", "teacher", "other", "third"] });
}
test.after(async () => { await db.terminate(); await deleteApp(app); });
test("school cleanup can release a deleted member without recreating an authentication account",async()=>{
 await seed();const school=await service.createSchool(request('admin',schoolOrder()));await service.assignSchoolMember(request('admin',{schoolId:school.schoolId,personId:'other',role:'teacher',requestId:'removed-auth-seat',reason:'Synthetic'}));
 identities.delete('other');await db.doc('accountDeletions/other').set({state:'deleted'});await db.doc('users/other').delete();
 await service.removeSchoolMember(request('teacher',{schoolId:school.schoolId,personId:'other',reason:'Deleted colleague'}));
 assert.equal((await service.getSchool(request('teacher',{schoolId:school.schoolId}))).school.usedSeats,1);assert.equal((await db.doc('users/other').get()).exists,false);
});
test("leaving one of two paid schools updates remaining write rights without a status refresh",async()=>{
 await seed();const first=await service.createSchool(request('admin',schoolOrder()));const second=await service.createSchool(request('admin',{...schoolOrder(),ownerId:'third',requestId:'second-school-order',startDate:'2026-11-03'}));
 for(const id of[first.periodId,second.periodId])await db.doc('billingV2Periods/'+id).update({paymentStatus:'paid'});
 await service.assignSchoolMember(request('admin',{schoolId:second.schoolId,personId:'teacher',role:'teacher',requestId:'second-school-seat',reason:'Synthetic'}));
 time=start+20*86400000;await service.getAccess(request('teacher'));
 const key=requireFunctions('./lib/billing/application').key;
 assert.equal((await db.doc('billingV2Accounts/teacher').get()).data().primarySchoolMembershipId,key(second.schoolId,'teacher'));
 await service.removeSchoolMember(request('third',{schoolId:second.schoolId,personId:'teacher',reason:'Synthetic leave'}));
 assert.equal((await db.doc('billingV2Accounts/teacher').get()).data().primarySchoolMembershipId,key(first.schoolId,'teacher'));
 assert.equal((await db.doc('billingV2Accounts/teacher').get()).data().writesUntilMs,0);
});
test("a copied question bundle commits atomically with one credit and private audio drafts",async()=>{
 await seed();const payload={requestId:'complete-copy-request',kind:'copy',quiz:{title:'Complete copy'},questions:[{text:'One',points:1,audioScript:'Private heard question',solutionAudioScript:'Private solution',solutionAudioDataUrl:'data:audio/mpeg;base64,AAAA'},{text:'Two',points:1}]};
 const made=await service.createQuiz(request('teacher',payload));await service.createQuiz(request('teacher',payload));
 const questions=await db.collection('quizzes/'+made.code+'/questions').get();assert.equal(questions.size,2);
 assert.equal(JSON.stringify(questions.docs.map(d=>d.data())).includes('Private solution'),false);
 assert.equal((await db.doc('quizzes/'+made.code+'/audioScripts/q001').get()).data().solutionScript,'Private solution');
 assert.equal((await db.doc('billingV2Accounts/teacher').get()).data().createdCount,1);
});
test("a failed bundled write cannot leave a charged empty copied file",async()=>{
 await seed();const adapter=createFirestoreBillingStore(db),failing={transaction:work=>adapter.transaction(tx=>work({...tx,create:(path,data)=>{if(path.includes('/questions/'))throw new Error('Synthetic failed question write');return tx.create(path,data);}}))};
 const svc=createBillingService({store:failing,projectId:'demo-gradecrew-billing',now:()=>time,getIdentity:async uid=>identities.get(uid)});
 await assert.rejects(svc.createQuiz(request('teacher',{requestId:'atomic-copy-failure',kind:'copy',quiz:{title:'No partial'},questions:[{text:'One',points:1}]})),/Synthetic failed/);
 assert.equal((await db.collection('quizzes').get()).size,0);assert.equal((await db.doc('billingV2Accounts/teacher').get()).exists,false);
});
test("stale job replacement releases its credit in the same reservation transaction",async()=>{
 await seed();for(let i=0;i<5;i++)await service.reserveGeneration('teacher','stale'+i);
 await createFirestoreBillingStore(db).transaction(async tx=>{const apply=await service.prepareGenerationReservation('teacher','replacement',tx,{expiredJobIds:['stale0']});apply();});
 assert.equal((await db.doc('billingV2Accounts/teacher').get()).data().reservedCount,5);
 assert.equal((await db.doc('billingV2Ledger/'+requireFunctions('./lib/billing/application').key('teacher','generation','stale0')).get()).data().state,'released');
});
test("ready quiz, job and credit commit together and failure recovery never downgrades that result",async()=>{
 await seed();await service.reserveGeneration('teacher','atomic-job');
 await db.doc('aiJobs/atomic-job').set({ownerId:'teacher',status:'running'});await db.doc('quizzes/ATOMIC01').set({ownerId:'teacher',generationJobId:'atomic-job',generationStatus:'running'});
 await service.finalizeGeneration('teacher','atomic-job','ATOMIC01',{generationStatus:'ready'},{status:'ready',stage:'ready'});
 assert.equal((await db.doc('aiJobs/atomic-job').get()).data().status,'ready');
 await service.failGeneration('teacher','atomic-job','ATOMIC01',{status:'failed',stage:'failed'});
 assert.equal((await db.doc('quizzes/ATOMIC01').get()).data().generationStatus,'ready');
 assert.equal((await db.doc('billingV2Accounts/teacher').get()).data().createdCount,1);
});
test("personal revocation preserves a paid school pointer, and explicit school files use other personal sources", async()=>{
 await seed();const school=await service.createSchool(request('admin',schoolOrder()));await db.doc('billingV2Periods/'+school.periodId).update({paymentStatus:'paid'});
 const scope={kind:'school',id:school.schoolId};await service.createQuiz(request('teacher',{scope,kind:'manual',requestId:'explicit-school-file',quiz:{title:'Own school file'}}));
 const grant=await service.grantPremium(request('admin',{personId:'teacher',requestId:'overlapping-free',reason:'Synthetic',endsAtMs:null}));
 await service.revokePremium(request('admin',{grantId:grant.grantId,reason:'Keep school'}));
 assert.ok((await db.doc('billingV2Accounts/teacher').get()).data().primarySchoolMembershipId);
 await service.grantPremium(request('admin',{personId:'teacher',requestId:'other-source-free',reason:'Synthetic',endsAtMs:null}));
 time=start+20*86400000;await db.doc('billingV2Schools/'+school.schoolId).update({status:'suspended'});
 assert.ok((await service.requireFeature('teacher','test.edit',scope)).featureCodes.includes('test.edit'));
});
test("the twenty-school reader bound cannot be exceeded by school creation",async()=>{
 await seed();const batch=db.batch();for(let i=0;i<20;i++)batch.set(db.doc('billingV2Memberships/cap'+i),{personId:'teacher',schoolId:'absent'+i,status:'active',role:'teacher',seatAssigned:true});await batch.commit();
 await assert.rejects(service.createSchool(request('admin',schoolOrder())),{code:'resource-exhausted'});
});
test("an invitation cannot create the 501st pending row and lock out cleanup",async()=>{
 await seed();const school=await service.createSchool(request('admin',schoolOrder())),batch=db.batch();
 for(let i=0;i<500;i++)batch.set(db.doc('billingV2Invitations/cap'+i),{schoolId:school.schoolId,email:'billing'+i+'@example.invalid',role:'billing',status:'pending',reservesSeat:false,expiresAtMs:time+86400000});await batch.commit();
 await assert.rejects(service.inviteSchoolMember(request('teacher',{schoolId:school.schoolId,email:'overflow@example.invalid',role:'billing',requestId:'overflow-request'})),{code:'resource-exhausted'});
});
test("only a platform administrator can directly assign an existing teacher without exceeding reserved seats", async () => {
  await seed();
  const made = await service.createSchool(request("admin", schoolOrder()));
  const assignment = { schoolId: made.schoolId, personId: "other", role: "teacher", requestId: "direct-assignment", reason: "Synthetic assignment" };
  await assert.rejects(service.assignSchoolMember(request("teacher", assignment)), { code: "permission-denied" });
  await service.assignSchoolMember(request("admin", assignment));
  assert.equal((await service.getSchool(request("teacher", { schoolId: made.schoolId }))).school.usedSeats, 2);
  await assert.rejects(service.assignSchoolMember(request("admin", { ...assignment, personId: "third", requestId: "too-many-seats" })), { code: "resource-exhausted" });
  assert.equal((await service.getSchool(request("other", { schoolId: made.schoolId }))).myRole, "teacher");
});
test("a paid school seat supplies the existing personal account without consuming trial files", async () => {
  await seed();
  const made = await service.createSchool(request("admin", schoolOrder()));
  await db.doc("billingV2Periods/" + made.periodId).update({ paymentStatus: "paid" });
  time = start + 20 * 86400000;
  assert.equal((await service.getAccess(request("teacher"))).tier, "school");
  const quiz = await service.createQuiz(request("teacher", { requestId: "school-funded", kind: "manual", quiz: { title: "Own file" } }));
  const record = (await db.doc("quizzes/" + quiz.code).get()).data();
  assert.equal(record.ownerId, "teacher");
  assert.equal((await service.getAccess(request("teacher"))).trialCreationsUsed, 0);
  await db.doc("billingV2Schools/" + made.schoolId).update({ status: "suspended" });
  assert.equal((await service.getAccess(request("teacher"))).tier, "free");
  assert.equal((await service.getAccess(request("teacher", { scope: { kind: "school", id: made.schoolId } }))).featureCodes.includes("test.create"), false);
});
test("leaving a school invalidates that source while a personal grant remains", async () => {
  await seed();
  const made = await service.createSchool(request("admin", schoolOrder()));
  await db.doc("billingV2Periods/" + made.periodId).update({ paymentStatus: "paid" });
  const invite = await service.inviteSchoolMember(request("teacher", { schoolId: made.schoolId, email: "other@example.invalid", role: "teacher", requestId: "other-invitation" }));
  await service.acceptSchoolInvitation(request("other", { token: invite.token }));
  time = start + 20 * 86400000;
  assert.equal((await service.getAccess(request("other"))).tier, "school");
  await service.grantPremium(request("admin", { personId: "other", requestId: "keep-personal", reason: "Synthetic", endsAtMs: null }));
  await service.removeSchoolMember(request("teacher", { schoolId: made.schoolId, personId: "other", reason: "Synthetic departure" }));
  assert.equal((await service.getAccess(request("other"))).tier, "complimentary");
});
test("normal account gets an anchored fourteen-day trial, which cannot reset on login", async () => {
  await seed();
  assert.equal((await service.getAccess(request("teacher"))).freeCreationsRemaining, 5);
  time = start + 15 * 86400000;
  const access = await service.getAccess(request("teacher"));
  assert.equal(access.reasonCode, "trial_ended");
  assert.equal(access.trialEndsAtMs, start + 14 * 86400000);
});
test("five files including copies and imports consume credit, deleting one never refunds it", async () => {
  await seed();
  for (let i = 0; i < 5; i++) {
    const made = await service.createQuiz(request("teacher", { requestId: "new-test-" + i, kind: ["manual", "copy", "import", "ai", "manual"][i], quiz: { title: "Synthetic " + i } }));
    if (i === 0) await db.doc("quizzes/" + made.code).delete();
  }
  await assert.rejects(service.createQuiz(request("teacher", { requestId: "sixth-test", kind: "manual", quiz: { title: "Denied" } })), error => error.details?.reasonCode === "quota_exhausted");
  assert.equal((await service.getAccess(request("teacher"))).trialCreationsUsed, 5);
});
test("concurrent last-slot creations cannot create a sixth file", async () => {
  await seed();
  for (let i = 0; i < 4; i++) await service.createQuiz(request("teacher", { requestId: "seed-test-" + i, kind: "manual", quiz: { title: "Synthetic" } }));
  const results = await Promise.allSettled(["one", "two"].map(id => service.createQuiz(request("teacher", { requestId: "last-test-" + id, kind: "manual", quiz: { title: id } }))));
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal((await db.collection("quizzes").get()).size, 5);
});
test("replayed creation returns the same file and rejects a different payload", async () => {
  await seed();
  const req = request("teacher", { requestId: "same-request", kind: "manual", quiz: { title: "Once" } });
  const [a, b] = await Promise.all([service.createQuiz(req), service.createQuiz(req)]);
  assert.equal(a.code, b.code);
  assert.equal((await service.getAccess(request("teacher"))).trialCreationsUsed, 1);
  await assert.rejects(service.createQuiz(request("teacher", { ...req.data, quiz: { title: "Different" } })), { code: "already-exists" });
});
test("reserved AI job releases credit on failure and commits exactly once with the ready quiz", async () => {
  await seed();
  await service.reserveGeneration("teacher", "job-one");
  assert.equal((await service.getAccess(request("teacher"))).freeCreationsRemaining, 4);
  await service.releaseGeneration("teacher", "job-one");
  assert.equal((await service.getAccess(request("teacher"))).freeCreationsRemaining, 5);
  await service.reserveGeneration("teacher", "job-two");
  await db.doc("quizzes/READYABC").set({ ownerId: "teacher", generationJobId: "job-two", generationStatus: "running" });
  await service.finalizeGeneration("teacher", "job-two", "READYABC", { generationStatus: "ready", questionCount: 2 });
  await service.finalizeGeneration("teacher", "job-two", "READYABC", { generationStatus: "ready", questionCount: 2 });
  assert.equal((await service.getAccess(request("teacher"))).trialCreationsUsed, 1);
  assert.equal((await db.doc("quizzes/READYABC").get()).data().billingCreationState, "committed");
});
test("unverified, suspended, unenrolled and spoofed profile users cannot create", async () => {
  await seed();
  identities.get("teacher").emailVerified = false;
  await assert.rejects(service.createQuiz(request("teacher", { requestId: "blocked-one", kind: "manual", quiz: { title: "No" } })), { code: "permission-denied" });
  identities.get("teacher").emailVerified = true;
  await db.doc("users/teacher").update({ status: "suspended" });
  await assert.rejects(service.getAccess(request("teacher")), { code: "permission-denied" });
  await db.doc("appConfig/billingProduct").update({ allowedUids: ["admin"] });
  await assert.rejects(service.getAccess(request("other")), { code: "failed-precondition" });
});
test("only an active fresh administrator can grant complimentary Premium", async () => {
  await seed();
  const data = { personId: "teacher", requestId: "colleague-grant", reason: "Synthetic colleague", endsAtMs: null };
  await assert.rejects(service.grantPremium(request("other", data)), { code: "permission-denied" });
  const stale = request("admin", data); stale.auth.token.auth_time -= 3600;
  await assert.rejects(service.grantPremium(stale), { code: "permission-denied" });
  const grant = await service.grantPremium(request("admin", data));
  time = start + 40 * 86400000;
  assert.equal((await service.getAccess(request("teacher"))).tier, "complimentary");
  assert.equal((await db.collection("billingV2Audit").get()).size, 1);
  await service.revokePremium(request("admin", { grantId: grant.grantId, reason: "Synthetic end" }));
  assert.equal((await service.getAccess(request("teacher"))).tier, "free");
});
test("new quiz strips privileged and supplied owner fields", async () => {
  await seed();
  const made = await service.createQuiz(request("teacher", { requestId: "safe-fields", kind: "manual", quiz: { title: "Safe", ownerId: "other", published: true, billingCreationState: "committed", accessCode: "GUESS" } }));
  const data = (await db.doc("quizzes/" + made.code).get()).data();
  assert.equal(data.ownerId, "teacher"); assert.equal(data.published, false); assert.equal(data.accessCode, made.code);
});
test("write permission projection expires and is immediately removed when a grant is revoked", async () => {
  await seed();
  await service.getAccess(request("teacher"));
  assert.equal((await db.doc("billingV2Accounts/teacher").get()).data().writesUntilMs, start + 14 * 86400000);
  const grant = await service.grantPremium(request("admin", { personId: "teacher", requestId: "projection-grant", reason: "Synthetic", endsAtMs: null }));
  time = start + 40 * 86400000;
  assert.ok((await db.doc("billingV2Accounts/teacher").get()).data().writesUntilMs > time);
  await service.revokePremium(request("admin", { grantId: grant.grantId, reason: "Synthetic revoked" }));
  assert.equal((await db.doc("billingV2Accounts/teacher").get()).data().writesUntilMs, 0);
});
test("malformed and foreign scopes are rejected without changing credit", async () => {
  await seed();
  for (const scope of [null, {}, {kind:"personal",id:"other"}, {kind:"school",id:"../escape"}]) {
    await assert.rejects(service.getAccess(request("teacher", { scope })), error => ["invalid-argument","permission-denied"].includes(error.code));
  }
  assert.equal((await service.getAccess(request("teacher"))).freeCreationsRemaining, 5);
});
test("pilot actions use the authenticated identity and reject arbitrary method dispatch", async () => {
  await seed();
  const handle = createPilotHandler(service);
  const made = await handle(request("teacher", { action: "createQuiz", personId: "other", ownerId: "other", requestId: "handler-new-test", kind: "manual", quiz: { title: "Own" } }));
  assert.equal((await db.doc("quizzes/" + made.code).get()).data().ownerId, "teacher");
  for (const action of ["constructor", "__proto__", "reserveGeneration", "setPaid"]) {
    await assert.rejects(handle(request("teacher", { action })), { code: "invalid-argument" });
  }
  await assert.rejects(handle({ data: { action: "access" } }), { code: "unauthenticated" });
});
test("only administrators can inspect a teacher's trial and complimentary sources, even when suspended", async () => {
  await seed();
  await assert.rejects(service.inspectAccess(request("other", {personId:"teacher"})), {code:"permission-denied"});
  const detail=await service.inspectAccess(request("admin", {personId:"teacher"}));
  assert.equal(detail.access.tier,"trial");
  await db.doc("users/teacher").update({status:"suspended"});
  const suspended=await service.inspectAccess(request("admin", {personId:"teacher"}));
  assert.equal(suspended.access.reasonCode,"account_suspended");
  assert.deepEqual(suspended.access.featureCodes,[]);
});
const schoolOrder = () => ({requestId:"school-contract-one",name:"Synthetic School",ownerId:"teacher",seats:2,startDate:"2026-11-02"});
test("school creation separates membership from an unpaid annual period",async()=>{
  await seed();await assert.rejects(service.createSchool(request("other",schoolOrder())),{code:"permission-denied"});
  const school=await service.createSchool(request("admin",schoolOrder()));
  const replay=await service.createSchool(request("admin",schoolOrder()));assert.equal(replay.schoolId,school.schoolId);
  const details=await service.getSchool(request("teacher",{schoolId:school.schoolId}));
  assert.equal(details.school.usedSeats,1);assert.equal(details.school.seats,2);assert.equal(details.period.amountMinor,10000);assert.equal(details.period.paymentStatus,"open");
  assert.equal(details.period.endDateExclusive,"2027-11-02");
  const access=await service.getAccess(request("teacher",{scope:{kind:"school",id:school.schoolId}}));
  assert.equal(access.featureCodes.includes("test.create"),false);
});
test("concurrent invitations cannot reserve the same last seat twice",async()=>{
  await seed();const school=await service.createSchool(request("admin",schoolOrder()));
  const results=await Promise.allSettled(["other","third"].map(person=>service.inviteSchoolMember(request("teacher",{schoolId:school.schoolId,email:person+"@example.invalid",role:"teacher",requestId:"invite-person-"+person}))));
  assert.equal(results.filter(r=>r.status==="fulfilled").length,1);
  const winner=results[0].status==="fulfilled"?"other":"third",loser=winner==="other"?"third":"other";
  const invitation=results.find(r=>r.status==="fulfilled").value;
  await assert.rejects(service.acceptSchoolInvitation(request(loser,{token:invitation.token})),{code:"permission-denied"});
  await service.acceptSchoolInvitation(request(winner,{token:invitation.token}));
  await service.acceptSchoolInvitation(request(winner,{token:invitation.token}));
  const detail=await service.getSchool(request("teacher",{schoolId:school.schoolId}));assert.equal(detail.school.usedSeats,2);assert.equal(detail.school.reservedSeats,0);
  const stored=(await db.doc("billingV2Invitations/"+invitation.invitationId).get()).data();assert.equal(JSON.stringify(stored).includes(invitation.token),false);
});
test("school access starts only with payment and ends at the common anniversary",async()=>{
  await seed();const school=await service.createSchool(request("admin",schoolOrder()));
  await db.doc("billingV2Periods/"+school.periodId).update({paymentStatus:"paid"});
  const scope={kind:"school",id:school.schoolId};
  assert.equal((await service.getAccess(request("teacher",{scope}))).tier,"school");
  time=Date.parse("2027-11-01T23:00:00Z");
  assert.equal((await service.getAccess(request("teacher",{scope}))).featureCodes.includes("test.create"),false);
});
test("a last school administrator cannot be removed, and members see no other finances",async()=>{
  await seed();const school=await service.createSchool(request("admin",schoolOrder()));
  await assert.rejects(service.removeSchoolMember(request("teacher",{schoolId:school.schoolId,personId:"teacher",reason:"Synthetic departure"})),{code:"failed-precondition"});
  const invitation=await service.inviteSchoolMember(request("teacher",{schoolId:school.schoolId,email:"other@example.invalid",role:"teacher",requestId:"member-finance-test"}));
  await service.acceptSchoolInvitation(request("other",{token:invitation.token}));
  const memberView=await service.getSchool(request("other",{schoolId:school.schoolId}));assert.equal(memberView.period.amountMinor,undefined);assert.equal(memberView.invitations,undefined);
  await assert.rejects(service.getSchool(request("third",{schoolId:school.schoolId})),{code:"permission-denied"});
});
test("expired invitations return reserved capacity and cannot be redeemed",async()=>{
  await seed();const school=await service.createSchool(request("admin",schoolOrder()));
  const first=await service.inviteSchoolMember(request("teacher",{schoolId:school.schoolId,email:"other@example.invalid",role:"teacher",requestId:"expiring-invitation"}));
  time+=8*86400000;
  await assert.rejects(service.acceptSchoolInvitation(request("other",{token:first.token})),{code:"failed-precondition"});
  const second=await service.inviteSchoolMember(request("teacher",{schoolId:school.schoolId,email:"third@example.invalid",role:"teacher",requestId:"replacement-invite"}));
  assert.ok(second.token);
});
