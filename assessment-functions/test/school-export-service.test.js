"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createSchoolExportService } = require("../lib/school-export-service");

function fixture() {
  const rows = new Map([
    ["users/teacher", { role: "teacher", status: "active" }],
    ["users/other", { role: "teacher", status: "active" }],
    ["classroomMembers/teacher", { schoolId: "school", role: "admin" }],
    ["classroomSchools/school", { name: "Beispielschule", schoolExportSynthetic: true }],
    ["quizzes/QUIZ1", { ownerId: "teacher", title: "Probe", subject: "Mathe", schoolExportSynthetic: true }],
    ["classroomSchools/school/students/student", { classId: "class", status: "active", schoolExportSynthetic: true }],
    ["classroomSchools/school/assignments/assignment", { quizId: "QUIZ1", classId: "class", ownerId: "teacher", recipientIds: ["student"], schoolExportSynthetic: true }],
    ["quizzes/QUIZ1/submissions/sub1", { studentName: "Testkind", classroom: { schoolId: "school", studentId: "student", assignmentId: "assignment", generation: 0 },
      answers: { q1: "4" }, grading: { q1: { awardedPoints: 2, maxPoints: 2, needsReview: false } }, totalPoints: 2, maxPoints: 2, percent: 100, grade: 1,
      gradeScaleSnapshot: { thresholds: [92, 81, 67, 50, 30, 0] }, status: "graded", secureAssessmentVersion: 2, questionSnapshotCount: 1, submittedAt: 1_800_000_000_000 }],
    ["quizzes/QUIZ1/submissions/sub1/questionSnapshots/q1", { position: 0, data: { id: "q1", text: "2 + 2?", points: 2, type: "text" }, recordedAtMillis: 1_800_000_000_000 }]
  ]);
  const clone = value => value === undefined ? undefined : structuredClone(value);
  const tx = {
    get: async path => clone(rows.get(path)),
    list: async path => [...rows].filter(([key]) => key.startsWith(path + "/") && !key.slice(path.length + 1).includes("/")).map(([key, value]) => ({ id: key.split("/").at(-1), data: clone(value) })),
    create: (path, value) => { if (rows.has(path)) throw Error("exists"); rows.set(path, clone(value)); },
    update: (path, value) => { if (!rows.has(path)) throw Error("missing"); rows.set(path, { ...rows.get(path), ...clone(value) }); }
  };
  const store = { transaction: async fn => fn(tx) };
  return { rows, service: createSchoolExportService({ store, projectId: "gradecrew-staging-2026", now: () => 1_800_000_100_000 }) };
}

test("export rejects another teacher, missing auth, wrong school and production project", async () => {
  const { rows, service } = fixture();
  const request = { quizId: "QUIZ1", submissionId: "sub1" };
  await assert.rejects(service.exportWork({ ...request, uid: "other" }), /Berechtigung/);
  await assert.rejects(service.exportWork(request), /anmelden/);
  rows.set("classroomMembers/teacher", { schoolId: "another", role: "teacher" });
  await assert.rejects(service.exportWork({ ...request, uid: "teacher" }), /Berechtigung/);
  const prod = createSchoolExportService({ store: { transaction: async () => { throw Error("must not read"); } }, projectId: "gradecrew-prod", now: Date.now });
  await assert.rejects(prod.exportWork({ ...request, uid: "teacher" }), /Testumgebung/);
});

test("export blocks a suspended teacher and a class assignment without this pupil", async () => {
  const { rows, service } = fixture();
  const request = { uid: "teacher", quizId: "QUIZ1", submissionId: "sub1" };
  rows.get("users/teacher").status = "suspended";
  await assert.rejects(service.exportWork(request), /Berechtigung/);
  rows.get("users/teacher").status = "active";
  rows.get("classroomSchools/school/assignments/assignment").recipientIds = [];
  await assert.rejects(service.exportWork(request), /Berechtigung/);
});

test("server rejects real or incompletely marked staging records", async () => {
  const { rows, service } = fixture();
  const request = { uid: "teacher", quizId: "QUIZ1", submissionId: "sub1" };
  for (const path of ["classroomSchools/school", "quizzes/QUIZ1", "classroomSchools/school/students/student", "classroomSchools/school/assignments/assignment"]) {
    rows.get(path).schoolExportSynthetic = false;
    await assert.rejects(service.exportWork(request), /synthetische Testdaten/);
    rows.get(path).schoolExportSynthetic = true;
  }
});

test("review operation is idempotent and export includes one before/after event", async () => {
  const { rows, service } = fixture();
  const input = { uid: "teacher", quizId: "QUIZ1", submissionId: "sub1", operationId: "op_1234567890abcdef", reason: "Nachprüfung", points: { q1: 1.5 } };
  const first = await service.saveReview(input);
  const second = await service.saveReview(input);
  assert.deepEqual(second.after, first.after);
  assert.equal(second.repeated, true);
  assert.equal(rows.get("quizzes/QUIZ1/submissions/sub1").totalPoints, 1.5);
  const record = await service.exportWork({ uid: "teacher", quizId: "QUIZ1", submissionId: "sub1" });
  assert.equal(record.events.length, 1);
  assert.equal(record.events[0].before.totalPoints, 2);
  assert.equal(record.events[0].after.totalPoints, 1.5);
  assert.equal(record.questions[0].source, "submission-snapshot");
  await assert.rejects(service.saveReview({ ...input, points: { q1: 2 } }), /Vorgangskennung/);
  await assert.rejects(service.undoReview({ ...input, reason: "Anderer Vorgang" }), /Vorgangskennung/);
});

test("undo restores prior points once and records its own reason", async () => {
  const { rows, service } = fixture();
  await service.saveReview({ uid: "teacher", quizId: "QUIZ1", submissionId: "sub1", operationId: "op_1234567890abcdef", reason: "Nachprüfung", points: { q1: 1.5 } });
  const undo = { uid: "teacher", quizId: "QUIZ1", submissionId: "sub1", operationId: "op_abcdef1234567890", reason: "Korrektur zurückgenommen" };
  const first = await service.undoReview(undo);
  const repeat = await service.undoReview(undo);
  assert.equal(first.after.totalPoints, 2);
  assert.equal(repeat.repeated, true);
  assert.equal(rows.get("quizzes/QUIZ1/submissions/sub1").totalPoints, 2);
  const record = await service.exportWork({ uid: "teacher", quizId: "QUIZ1", submissionId: "sub1" });
  assert.equal(record.events.length, 2);
  assert.equal(record.events[1].reason, "Korrektur zurückgenommen");
  await assert.rejects(service.undoReview({ ...undo, operationId: "op_abcdef1234567891" }), /bereits zurückgenommen/);
  await assert.rejects(service.undoReview({ ...undo, reason: "Andere Rücknahme" }), /Vorgangskennung/);
});

test("undo uses transaction sequence when two reviews share the same millisecond", async () => {
  const { rows, service } = fixture();
  const base = { uid: "teacher", quizId: "QUIZ1", submissionId: "sub1", reason: "Nachprüfung" };
  await service.saveReview({ ...base, operationId: "op_zzzzzzzzzzzzzzzz", points: { q1: 1.5 } });
  await service.saveReview({ ...base, operationId: "op_aaaaaaaaaaaaaaaa", points: { q1: 1 } });
  await service.undoReview({ ...base, operationId: "op_undo123456789012" });
  assert.equal(rows.get("quizzes/QUIZ1/submissions/sub1").totalPoints, 1.5);
  assert.equal(rows.get("quizzes/QUIZ1/submissions/sub1/reviewEvents/op_undo123456789012").undoOf, "op_aaaaaaaaaaaaaaaa");
});

test("empty frozen and current questions are disclosed as missing", async () => {
  const { rows, service } = fixture();
  rows.delete("quizzes/QUIZ1/submissions/sub1/questionSnapshots/q1");
  const record = await service.exportWork({ uid: "teacher", quizId: "QUIZ1", submissionId: "sub1" });
  assert.equal(record.questions.length, 0);
  assert.ok(record.gaps.some(gap => gap.field === "questionSnapshot"));
});
