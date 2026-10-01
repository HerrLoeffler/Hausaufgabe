import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

const root = path.resolve(import.meta.dirname, "..");
const assessmentMain = path.join(root, "assessment-functions", "main.js");
const hasAssessmentFunctions = fs.existsSync(assessmentMain);
const projectId = process.env.GC_EMULATOR_PROJECT_ID || "gradecrew-emulator-ci";
const [firestoreHost, firestorePortRaw] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");
const firestorePort = Number(firestorePortRaw || 8080);
const functionsHost = process.env.FUNCTIONS_EMULATOR_HOST || "127.0.0.1:5001";
const region = process.env.GC_ASSESSMENT_REGION || "europe-west1";
let env;

function callableUrl(name) {
  return `http://${functionsHost}/${projectId}/${region}/${name}`;
}

async function callFunction(name, data) {
  const response = await fetch(callableUrl(name), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data })
  });
  const body = await response.json();
  return { status: response.status, body, result: body.result ?? body.data, error: body.error ?? null };
}

function assertSuccess(response, label) {
  assert.equal(response.status, 200, `${label}: HTTP ${response.status} ${JSON.stringify(response.body)}`);
  assert.equal(response.error, null, `${label}: ${JSON.stringify(response.error)}`);
  return response.result;
}

function assertCallableError(response, expectedStatus) {
  assert.ok(response.error, `Erwarteter Callable-Fehler fehlt: ${JSON.stringify(response.body)}`);
  const actual = String(response.error.status || response.error.code || "").toUpperCase().replaceAll("-", "_");
  assert.equal(actual, expectedStatus);
}

function findForbiddenSolutionKey(value, trail = "root") {
  const forbidden = new Set([
    "correct", "correctBoolean", "acceptedAnswers", "numericAnswer", "tolerance",
    "targetWords", "acceptedOrders", "gradingKey", "answerKey", "solutions"
  ]);
  if (!value || typeof value !== "object") return null;
  for (const [key, child] of Object.entries(value)) {
    if (forbidden.has(key)) return `${trail}.${key}`;
    const nested = findForbiddenSolutionKey(child, `${trail}.${key}`);
    if (nested) return nested;
  }
  return null;
}

async function seedAssessment() {
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, "users", "teacher-a"), {
      role: "teacher",
      status: "active",
      aiBetaEnabled: false
    });
    await setDoc(doc(db, "quizzes", "EMU1234"), {
      ownerId: "teacher-a",
      title: "Emulator Mathematik",
      subject: "Mathematik",
      grade: "9",
      description: "Nur lokale Emulator-Testdaten",
      published: true,
      ended: false,
      isDeleted: false,
      rightsHold: false,
      questionCount: 1,
      totalPoints: 1,
      timeLimitMinutes: 15,
      startMode: "student",
      sessionState: "open",
      resultMode: "points_grade",
      showSolutions: false,
      shuffleQuestions: false,
      shuffleAnswers: false,
      publishedAt: new Date(),
      createdAt: new Date()
    });
    await setDoc(doc(db, "quizzes", "EMU1234", "questions", "q1"), {
      id: "q1",
      position: 1,
      type: "single",
      text: "Wie viel ist 2 + 2?",
      points: 1,
      options: [
        { text: "3", correct: false },
        { text: "4", correct: true }
      ]
    });
  });
}

before(async () => {
  if (!hasAssessmentFunctions) return;
  env = await initializeTestEnvironment({
    projectId,
    firestore: { host: firestoreHost, port: firestorePort }
  });
});

beforeEach(async () => {
  if (!hasAssessmentFunctions) return;
  await env.clearFirestore();
  await seedAssessment();
});

after(async () => {
  if (env) await env.cleanup();
});

test("Secure Assessment: Start ist atomar/idempotent und leakt keinen Lösungsschlüssel", { skip: !hasAssessmentFunctions }, async () => {
  const payload = {
    quizId: "EMU1234",
    studentName: "S1",
    clientAttemptId: "client_attempt_000001",
    attemptToken: "A".repeat(40)
  };
  const first = assertSuccess(await callFunction("getAssessmentInfo", { quizId: "EMU1234" }), "info");
  assert.equal(first.quiz.id, "EMU1234");
  assert.equal(first.quiz.published, true);

  const started = assertSuccess(await callFunction("startAssessmentAttempt", payload), "start");
  assert.match(started.attemptId, /^a_[a-f0-9]{28}$/);
  assert.equal(started.status, "running");
  assert.equal(started.paper.length, 1);
  assert.equal(findForbiddenSolutionKey(started.paper), null);

  const repeated = assertSuccess(await callFunction("startAssessmentAttempt", payload), "repeat start");
  assert.equal(repeated.attemptId, started.attemptId);

  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    const attempt = await getDoc(doc(db, "quizzes", "EMU1234", "attempts", started.attemptId));
    const privateDoc = await getDoc(doc(db, "assessmentPrivate", `EMU1234_${started.attemptId}`));
    assert.equal(attempt.exists(), true);
    assert.equal(privateDoc.exists(), true);
    assert.equal(attempt.data().status, "running");
    assert.equal(typeof privateDoc.data().tokenHash, "string");
  });
});

test("Secure Assessment: falscher Token und kollidierende Client-ID werden abgewiesen", { skip: !hasAssessmentFunctions }, async () => {
  const payload = {
    quizId: "EMU1234",
    studentName: "S1",
    clientAttemptId: "client_attempt_000002",
    attemptToken: "B".repeat(40)
  };
  const started = assertSuccess(await callFunction("startAssessmentAttempt", payload), "start");

  const wrongToken = await callFunction("resumeAssessmentAttempt", {
    quizId: "EMU1234",
    attemptId: started.attemptId,
    attemptToken: "C".repeat(40)
  });
  assertCallableError(wrongToken, "PERMISSION_DENIED");

  const nameCollision = await callFunction("startAssessmentAttempt", {
    ...payload,
    studentName: "Anderes Kürzel"
  });
  assertCallableError(nameCollision, "PERMISSION_DENIED");
});

test("Secure Assessment: parallele/repetierte Abgabe bleibt genau eine Submission", { skip: !hasAssessmentFunctions }, async () => {
  const attemptToken = "D".repeat(40);
  const started = assertSuccess(await callFunction("startAssessmentAttempt", {
    quizId: "EMU1234",
    studentName: "S2",
    clientAttemptId: "client_attempt_000003",
    attemptToken
  }), "start");

  const correctOptionId = started.paper[0].options[1].id;
  const submitPayload = {
    quizId: "EMU1234",
    attemptId: started.attemptId,
    attemptToken,
    answers: { q1: correctOptionId }
  };

  const [left, right] = await Promise.all([
    callFunction("submitAssessmentAttempt", submitPayload),
    callFunction("submitAssessmentAttempt", submitPayload)
  ]);
  const receipts = [assertSuccess(left, "parallel submit A"), assertSuccess(right, "parallel submit B")];
  for (const result of receipts) {
    assert.equal(result.receipt.attemptId, started.attemptId);
  }

  const third = assertSuccess(await callFunction("submitAssessmentAttempt", submitPayload), "repeat submit");
  assert.equal(third.receipt.attemptId, started.attemptId);

  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    const submission = await getDoc(doc(db, "quizzes", "EMU1234", "submissions", started.attemptId));
    const attempt = await getDoc(doc(db, "quizzes", "EMU1234", "attempts", started.attemptId));
    const privateDoc = await getDoc(doc(db, "assessmentPrivate", `EMU1234_${started.attemptId}`));
    assert.equal(submission.exists(), true);
    assert.equal(attempt.data().status, "submitted");
    assert.equal(submission.data().totalPoints, 1);
    assert.equal(privateDoc.data().gradingKey, undefined);
    assert.equal(privateDoc.data().paperSecret, undefined);
  });
});
