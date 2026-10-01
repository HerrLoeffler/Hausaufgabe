import fs from "node:fs";
import path from "node:path";
import { after, before, beforeEach, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from "firebase/firestore";

const root = path.resolve(import.meta.dirname, "..");
const rulesPath = path.join(root, "firestore.rules");
const projectId = process.env.GC_EMULATOR_PROJECT_ID || "gradecrew-emulator-ci";
const [host, rawPort] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");
const port = Number(rawPort || 8080);
let env;

async function seedBaseline() {
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, "users", "teacher-a"), {
      role: "teacher",
      status: "active",
      aiBetaEnabled: false
    });
    await setDoc(doc(db, "users", "teacher-b"), {
      role: "teacher",
      status: "active",
      aiBetaEnabled: false
    });
    await setDoc(doc(db, "users", "admin-a"), {
      role: "admin",
      status: "active",
      aiBetaEnabled: false
    });
    await setDoc(doc(db, "quizzes", "PRIVATE1"), {
      ownerId: "teacher-a",
      title: "Privater Test",
      published: false,
      ended: false,
      isDeleted: false,
      rightsHold: false
    });
    await setDoc(doc(db, "quizzes", "PUBLIC1"), {
      ownerId: "teacher-a",
      title: "Veröffentlichter Test",
      published: true,
      ended: false,
      isDeleted: false,
      rightsHold: false
    });
    await setDoc(doc(db, "assessmentPrivate", "secret-1"), {
      quizId: "PUBLIC1",
      tokenHash: "not-client-readable"
    });
    await setDoc(doc(db, "assessmentRateLimits", "rate-1"), {
      count: 1
    });
    await setDoc(doc(db, "submissions", "legacy-1"), {
      studentName: "Legacy",
      answers: { q1: "secret" }
    });
  });
}

before(async () => {
  if (!fs.existsSync(rulesPath)) throw new Error("firestore.rules fehlt im geprüften Stand.");
  env = await initializeTestEnvironment({
    projectId,
    firestore: {
      host,
      port,
      rules: fs.readFileSync(rulesPath, "utf8")
    }
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await seedBaseline();
});

after(async () => {
  if (env) await env.cleanup();
});

test("anonymer Client kann privaten Test nicht lesen, veröffentlichten Test aber laden", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, "quizzes", "PRIVATE1")));
  await assertSucceeds(getDoc(doc(db, "quizzes", "PUBLIC1")));
});

test("Lehrkraft kann eigenen privaten Test lesen, aber nicht den privaten Test einer anderen Lehrkraft", async () => {
  const ownerDb = env.authenticatedContext("teacher-a").firestore();
  const strangerDb = env.authenticatedContext("teacher-b").firestore();
  await assertSucceeds(getDoc(doc(ownerDb, "quizzes", "PRIVATE1")));
  await assertFails(getDoc(doc(strangerDb, "quizzes", "PRIVATE1")));
});

test("Lehrkraft kann nur die eigene Quiz-Liste abfragen", async () => {
  const db = env.authenticatedContext("teacher-a").firestore();
  const own = query(collection(db, "quizzes"), where("ownerId", "==", "teacher-a"));
  await assertSucceeds(getDocs(own));
  await assertFails(getDocs(collection(db, "quizzes")));
});

test("serverprivate Collections und Legacy-Abgaben bleiben clientseitig gesperrt", async () => {
  const anonDb = env.unauthenticatedContext().firestore();
  const teacherDb = env.authenticatedContext("teacher-a").firestore();
  for (const target of [
    doc(anonDb, "assessmentPrivate", "secret-1"),
    doc(teacherDb, "assessmentPrivate", "secret-1"),
    doc(teacherDb, "assessmentRateLimits", "rate-1"),
    doc(teacherDb, "submissions", "legacy-1")
  ]) {
    await assertFails(getDoc(target));
  }
});

test("Admin darf private Quiz-Metadaten lesen", async () => {
  const db = env.authenticatedContext("admin-a").firestore();
  await assertSucceeds(getDoc(doc(db, "quizzes", "PRIVATE1")));
});
