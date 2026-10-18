"use strict";
const test = require("node:test");
const { after } = test;
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const { createHash } = require("node:crypto");
const path = require("node:path");

// This test must never discover credentials or contact a live Firestore project.
assert.match(process.env.FIRESTORE_EMULATOR_HOST || "", /^(127\.0\.0\.1|localhost):\d+$/);
const requireAssessment = createRequire(path.resolve(__dirname, "../../assessment-functions/package.json"));
const { initializeApp, deleteApp } = requireAssessment("firebase-admin/app");
const { getFirestore } = requireAssessment("firebase-admin/firestore");
const app = initializeApp({ projectId: "demo-gradecrew-secure" });
const db = getFirestore(app);
const { getAssessmentInfo, startAssessmentAttempt, submitAssessmentAttempt } = requireAssessment("./lib/secure-lifecycle");
const token = "A".repeat(43);

after(async () => { await db.terminate(); await deleteApp(app); });

async function seed(quizId, count = 0) {
  const day = new Date().toISOString().slice(0, 10);
  const hash = createHash("sha256").update(`assessment-start:v1:${day}:${quizId}:127.0.0.1`).digest("hex");
  const quota = db.doc(`assessmentRateLimits/${day}-${hash}`);
  const quiz = db.doc(`quizzes/${quizId}`);
  await db.recursiveDelete(quiz);
  await quiz.set({ published: true, ended: false, startMode: "teacher", sessionRunId: "run1",
    sessionState: "running", sessionStartedAt: Date.now(), resultMode: "points_grade", showSolutions: true });
  await quiz.collection("questions").doc("q1").set({ id: "q1", position: 1, type: "single", text: "Pick",
    points: 1, options: [{ text: "A", correct: true }, { text: "B", correct: false }] });
  // Private attempt records are scoped to this test's quiz, including repeated local runs.
  const previous = await db.collection("assessmentPrivate").where("quizId", "==", quizId).get();
  for (const doc of previous.docs) await doc.ref.delete();
  await quota.set({ count, quizId, day });
  const start = (id, overrides = {}) => startAssessmentAttempt.run({
    data: { quizId, studentName: id, clientAttemptId: id.padEnd(20, "_"), attemptToken: token, ...overrides },
    rawRequest: { ip: "127.0.0.1" }
  });
  return { quiz, quota, start };
}

test("concurrent identical starts persist one quota charge and return the committed opaque paper", async () => {
  const f = await seed("STARTSAME");
  const attempts = await Promise.all(Array.from({ length: 4 }, () => f.start("same")));
  for (const attempt of attempts) {
    assert.equal(attempt.attemptId, attempts[0].attemptId);
    assert.deepEqual(attempt.paper, attempts[0].paper);
  }
  assert.equal((await f.quota.get()).data().count, 1);
  assert.equal((await f.quiz.collection("attempts").get()).size, 1);
  const privateData = (await db.doc(`assessmentPrivate/STARTSAME_${attempts[0].attemptId}`).get()).data();
  const { buildAssessmentContract } = requireAssessment("./lib/assessment-core");
  const questions = await f.quiz.collection("questions").orderBy("position").get();
  // Check returned identifiers against the committed secret, not another request's secret.
  const committed = buildAssessmentContract(questions.docs.map(doc => doc.data()), privateData.paperSecret);
  assert.deepEqual(attempts[0].paper, committed.paper);
});

test("concurrent distinct starts cannot overspend the last daily quota slot", async () => {
  const f = await seed("STARTLIMIT", 249);
  const results = await Promise.allSettled(["one", "two", "three", "four"].map(id => f.start(id)));
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  for (const result of results.filter(r => r.status === "rejected")) assert.equal(result.reason.code, "resource-exhausted");
  assert.equal((await f.quota.get()).data().count, 250);
  assert.equal((await f.quiz.collection("attempts").get()).size, 1);
});

test("committed attempt can resume at exhausted quota while another token is rejected", async () => {
  const f = await seed("STARTRESUME", 249);
  const first = await f.start("same");
  assert.deepEqual((await f.start("same")).paper, first.paper);
  await assert.rejects(f.start("same", { attemptToken: "B".repeat(43) }), { code: "permission-denied" });
  assert.equal((await f.quota.get()).data().count, 250);
});

test("failed question validation rolls back quota and both attempt documents", async () => {
  const f = await seed("STARTEMPTY", 249);
  await f.quiz.collection("questions").doc("q1").delete();
  await assert.rejects(f.start("same"), { code: "failed-precondition" });
  assert.equal((await f.quota.get()).data().count, 249);
  assert.equal((await f.quiz.collection("attempts").get()).size, 0);
  assert.equal((await db.collection("assessmentPrivate").where("quizId", "==", "STARTEMPTY").get()).size, 0);
});

test("ordering assessments persist their grading key and award primary and alternative orders", async () => {
  const f = await seed("STARTORDER");
  await f.quiz.collection("questions").doc("q1").set({ id: "q1", position: 1, type: "ordering", text: "Order the steps",
    points: 1, items: ["one", "two", "three"], acceptedOrders: [{ indices: [2, 1, 0] }] });
  for (const [name, values] of [["primary", ["one", "two", "three"]], ["alternative", ["three", "two", "one"]]]) {
    const started = await f.start(name);
    const options = new Map(started.paper[0].items.map(item => [item.text, item.id]));
    const submitted = await submitAssessmentAttempt.run({ data: { quizId: "STARTORDER", attemptId: started.attemptId,
      attemptToken: token, answers: { q1: values.map(value => options.get(value)) } }, rawRequest: { ip: "127.0.0.1" } });
    assert.equal(submitted.receipt.totalPoints, 1);
    assert.equal(submitted.receipt.maxPoints, 1);
    assert.doesNotMatch(JSON.stringify(started.paper), /acceptedOrders|gradingKey/);
  }
});

test('offline recovery stores late work once for teacher review and never claims an on-time grade', async () => {
  const f=await seed('OFFLINELATE');
  const first=await f.start('offline');
  const ref=f.quiz.collection('attempts').doc(first.attemptId);
  await ref.update({startedAt:new Date(Date.now()-600000),deadlineAt:new Date(Date.now()-60000)});
  const payload={quizId:'OFFLINELATE',attemptId:first.attemptId,attemptToken:token,answers:{q1:first.paper[0].options[0].id}};
  const submit=data=>submitAssessmentAttempt.run({data,rawRequest:{ip:'127.0.0.1'}});
  await assert.rejects(submit(payload),{code:'deadline-exceeded'});
  await assert.rejects(submit({...payload,recoverySubmission:true,attemptToken:'B'.repeat(43)}),{code:'permission-denied'});
  const result=await submit({...payload,recoverySubmission:true});
  assert.equal(result.receipt.status,'review');assert.equal(result.receipt.needsReview,true);assert.equal(result.receipt.grade,undefined);
  const stored=(await f.quiz.collection('submissions').doc(first.attemptId).get()).data();
  assert.equal(stored.recoveryReviewRequired,true);assert.equal(stored.recoveryReason,'late_delivery');assert.equal(stored.grade,null);
  const second=await submit({...payload,recoverySubmission:true,answers:{q1:first.paper[0].options[1].id}});
  assert.deepEqual(second.receipt,result.receipt);assert.equal((await f.quiz.collection('submissions').get()).size,1);
});

test('ended-round offline delivery cannot reveal solutions or restore held data', async () => {
  const f=await seed('OFFLINEEND');const first=await f.start('ended');
  await f.quiz.update({ended:true,endedAt:new Date(Date.now()-180000)});
  const data={quizId:'OFFLINEEND',attemptId:first.attemptId,attemptToken:token,recoverySubmission:true,answers:{}};
  const submit=()=>submitAssessmentAttempt.run({data,rawRequest:{ip:'127.0.0.1'}});
  await f.quiz.update({rightsHold:true});await assert.rejects(submit(),{code:'failed-precondition'});
  await f.quiz.update({rightsHold:false});
  const result=await submit();assert.equal(result.receipt.status,'review');assert.equal(result.receipt.solutionsReleased,false);
});

test('offline recovery after seven days preserves the attempt without accepting late work', async()=>{
  const f=await seed('OFFLINEOLD');const first=await f.start('old');
  await f.quiz.collection('attempts').doc(first.attemptId).update({startedAt:new Date(Date.now()-8*86400000),deadlineAt:new Date(Date.now()-8*86400000+300000)});
  await assert.rejects(submitAssessmentAttempt.run({data:{quizId:'OFFLINEOLD',attemptId:first.attemptId,attemptToken:token,recoverySubmission:true,answers:{}},rawRequest:{ip:'127.0.0.1'}}),{code:'deadline-exceeded'});
  assert.equal((await f.quiz.collection('submissions').get()).size,0);
});


test('real assessment preflight advertises the recovery contract required by the native school build', async()=>{
 await seed('SCHOOLINFO');
 const info=await getAssessmentInfo.run({data:{quizId:'SCHOOLINFO'},rawRequest:{ip:'127.0.0.1'}});
 assert.equal(info.capabilities?.offlineRecovery,1);
 assert.equal(info.quiz.id || info.quiz.quizId,'SCHOOLINFO');
 assert.equal((await db.collection('assessmentPrivate').where('quizId','==','SCHOOLINFO').get()).size,0);
});
