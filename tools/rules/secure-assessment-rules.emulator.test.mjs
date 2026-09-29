import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const rules = fs.readFileSync(path.join(root, "firestore.secure-assessment.rules"), "utf8");
const emulator = String(process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085");
const [host, rawPort] = emulator.split(":");
const port = Number(rawPort || 8085);

const env = await initializeTestEnvironment({
  projectId: "demo-gradecrew-secure",
  firestore: { host, port, rules }
});

const quizId = "ABCD1234";

async function seed() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, "users", "owner"), { role: "teacher", status: "active", aiBetaEnabled: false }),
      setDoc(doc(db, "users", "other"), { role: "teacher", status: "active", aiBetaEnabled: false }),
      setDoc(doc(db, "users", "admin"), { role: "admin", status: "active", aiBetaEnabled: false })
    ]);
    await setDoc(doc(db, "quizzes", quizId), {
      ownerId: "owner",
      title: "Secure rules test",
      published: true,
      ended: false,
      isDeleted: false,
      rightsHold: false,
      shareEnabled: false,
      startMode: "teacher",
      sessionState: "waiting",
      sessionRunId: "run_secure_1"
    });
    await setDoc(doc(db, "quizzes", quizId, "questions", "q1"), {
      id: "q1",
      position: 1,
      type: "single",
      text: "Welche Farbe?",
      points: 1,
      options: [
        { text: "Rot", correct: false },
        { text: "Blau", correct: true }
      ]
    });
    await setDoc(doc(db, "quizzes", quizId, "submissions", "secure-sub"), {
      attemptId: "secure-sub",
      studentName: "S01",
      answers: { q1: "1" },
      grading: { q1: { awardedPoints: 1, maxPoints: 1, needsReview: false } },
      totalPoints: 1,
      maxPoints: 1,
      percent: 100,
      grade: 1,
      gradeScaleSnapshot: { thresholds: [91, 77, 57, 39, 25, 0] },
      status: "graded",
      secureAnswerDigest: "abc123",
      sessionRunId: "run_secure_1"
    });
    await setDoc(doc(db, "assessmentPrivate", `${quizId}_secure-sub`), {
      quizId,
      attemptId: "secure-sub",
      tokenHash: "secret"
    });
    await setDoc(doc(db, "assessmentRateLimits", "rate1"), { quizId, count: 1 });
  });
}

test("secure assessment Firestore rules enforce the real access matrix", async t => {
  await seed();
  const anonymous = env.unauthenticatedContext().firestore();
  const owner = env.authenticatedContext("owner").firestore();
  const other = env.authenticatedContext("other").firestore();
  const admin = env.authenticatedContext("admin").firestore();

  await t.test("anonymous pupil has no direct quiz/question read path", async () => {
    await assertFails(getDoc(doc(anonymous, "quizzes", quizId)));
    await assertFails(getDoc(doc(anonymous, "quizzes", quizId, "questions", "q1")));
  });

  await t.test("anonymous pupil cannot create attempts or submissions", async () => {
    await assertFails(setDoc(doc(anonymous, "quizzes", quizId, "attempts", "anon-attempt"), {
      studentName: "S02"
    }));
    await assertFails(setDoc(doc(anonymous, "quizzes", quizId, "submissions", "anon-sub"), {
      studentName: "S02",
      answers: { q1: "1" }
    }));
  });

  await t.test("owner can read own authoring data while another teacher cannot", async () => {
    await assertSucceeds(getDoc(doc(owner, "quizzes", quizId)));
    await assertSucceeds(getDoc(doc(owner, "quizzes", quizId, "questions", "q1")));
    await assertFails(getDoc(doc(other, "quizzes", quizId)));
    await assertFails(getDoc(doc(other, "quizzes", quizId, "questions", "q1")));
    await assertSucceeds(getDoc(doc(admin, "quizzes", quizId)));
  });

  await t.test("owner self-test exception stays available only on own active test", async () => {
    await assertSucceeds(setDoc(doc(owner, "quizzes", quizId, "attempts", "owner-attempt"), {
      studentName: "Eigentest"
    }));
    await assertSucceeds(setDoc(doc(owner, "quizzes", quizId, "submissions", "owner-sub"), {
      studentName: "Eigentest",
      answers: { q1: "1" }
    }));
    await assertFails(setDoc(doc(other, "quizzes", quizId, "attempts", "other-attempt"), {
      studentName: "Fremd"
    }));
  });

  await t.test("active question content is immutable even for the owner", async () => {
    await assertFails(updateDoc(doc(owner, "quizzes", quizId, "questions", "q1"), {
      text: "Geänderte Frage"
    }));
  });

  await t.test("active test may start but cannot return to draft", async () => {
    await assertSucceeds(updateDoc(doc(owner, "quizzes", quizId), {
      sessionState: "running",
      sessionStartedAt: new Date(),
      updatedAt: new Date()
    }));
    await assertFails(updateDoc(doc(owner, "quizzes", quizId), {
      published: false,
      updatedAt: new Date()
    }));
  });

  await t.test("teacher review may change grading but not original answers or secure metadata", async () => {
    const submission = doc(owner, "quizzes", quizId, "submissions", "secure-sub");
    await assertSucceeds(updateDoc(submission, {
      grading: { q1: { awardedPoints: 0.5, maxPoints: 1, needsReview: false } },
      totalPoints: 0.5,
      maxPoints: 1,
      percent: 50,
      grade: 4,
      status: "graded",
      reviewedAt: new Date(),
      reviewedBy: "owner"
    }));
    await assertFails(updateDoc(submission, {
      answers: { q1: "0" }
    }));
    await assertFails(updateDoc(submission, {
      secureAnswerDigest: "tampered"
    }));
  });

  await t.test("server-only collections stay closed even to owner and admin", async () => {
    for (const db of [owner, admin]) {
      await assertFails(getDoc(doc(db, "assessmentPrivate", `${quizId}_secure-sub`)));
      await assertFails(getDoc(doc(db, "assessmentRateLimits", "rate1")));
    }
  });

  await t.test("ending the test is allowed and only then may owner edit questions", async () => {
    await assertSucceeds(updateDoc(doc(owner, "quizzes", quizId), {
      ended: true,
      endedAt: new Date(),
      updatedAt: new Date()
    }));
    await assertSucceeds(updateDoc(doc(owner, "quizzes", quizId, "questions", "q1"), {
      text: "Nach Testende editierbar"
    }));
    await assertFails(setDoc(doc(owner, "quizzes", quizId, "attempts", "owner-after-end"), {
      studentName: "Zu spät"
    }));
  });

  assert.ok(true);
});

await env.cleanup();
