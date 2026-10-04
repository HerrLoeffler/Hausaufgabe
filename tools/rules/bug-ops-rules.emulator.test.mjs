import test, { after } from "node:test";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const rules = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const emulator = String(process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8086");
const [host, rawPort] = emulator.split(":");
const port = Number(rawPort || 8086);

const env = await initializeTestEnvironment({
  projectId: "demo-gradecrew-bugops",
  firestore: { host, port, rules }
});

after(async () => {
  await env.cleanup();
});

async function seed() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, "users", "teacher"), { role: "teacher", status: "active", aiBetaEnabled: false }),
      setDoc(doc(db, "users", "admin"), { role: "admin", status: "active", aiBetaEnabled: false }),
      setDoc(doc(db, "bugIncidents", "bug-abc"), {
        fingerprint: "abc1234",
        priority: "P1",
        needsAttention: true,
        uniqueReporters: 7,
        occurrences: 12
      }),
      setDoc(doc(db, "bugIncidents", "bug-abc", "_sources", "feedback-1"), {
        versionHash: "private-marker"
      }),
      setDoc(doc(db, "bugIncidents", "bug-abc", "_reporters", "hash-1"), {
        createdAt: new Date()
      })
    ]);
  });
}

test("BugOps rules expose only incident summaries to admins", async t => {
  await seed();
  const teacher = env.authenticatedContext("teacher").firestore();
  const admin = env.authenticatedContext("admin").firestore();

  await t.test("incident summaries stay server-only even for admins", async () => {
    await assertFails(getDoc(doc(admin, "bugIncidents", "bug-abc")));
    await assertFails(getDoc(doc(teacher, "bugIncidents", "bug-abc")));
  });

  await t.test("no client can create, update or delete incident summaries", async () => {
    for (const db of [teacher, admin]) {
      await assertFails(setDoc(doc(db, "bugIncidents", "bug-client"), { priority: "P0" }));
      await assertFails(updateDoc(doc(db, "bugIncidents", "bug-abc"), { priority: "P3" }));
      await assertFails(deleteDoc(doc(db, "bugIncidents", "bug-abc")));
    }
  });

  await t.test("deduplication and reporter markers stay server-only even for admins", async () => {
    await assertFails(getDoc(doc(admin, "bugIncidents", "bug-abc", "_sources", "feedback-1")));
    await assertFails(getDoc(doc(admin, "bugIncidents", "bug-abc", "_reporters", "hash-1")));
  });

  await t.test("active teacher can still submit a technical feedback report", async () => {
    await assertSucceeds(setDoc(doc(teacher, "feedback", "report-1"), {
      category: "app_error",
      userId: "teacher",
      message: "Technischer Fehler gemeldet.",
      status: "new",
      fingerprint: "abc1234",
      errorCode: "APP-UNEXPECTED-001",
      createdAt: new Date()
    }));
  });
});
