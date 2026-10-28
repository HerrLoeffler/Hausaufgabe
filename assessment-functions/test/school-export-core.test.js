"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { validateCorrection, buildExportRecord } = require("../lib/school-export-core");

const questions = [
  { id: "q1", position: 0, type: "text", text: "Was ist 2 + 2?", points: 2, acceptedAnswers: ["4"] },
  { id: "q2", position: 1, type: "text", text: "Begründe.", points: 3, manualReview: true }
];
const submission = {
  studentName: "Testkind A", classroom: { schoolId: "school-1", studentId: "student-1", assignmentId: "assignment-1" },
  answers: { q1: "4", q2: "Weil zwei Paare." },
  grading: { q1: { awardedPoints: 2, maxPoints: 2, needsReview: false }, q2: { awardedPoints: 0, maxPoints: 3, needsReview: true } },
  totalPoints: 2, maxPoints: 5, percent: 40, status: "review", grade: null,
  gradeScaleSnapshot: { thresholds: [92, 81, 67, 50, 30, 0], name: "Testskala" },
  submittedAt: { toMillis: () => 1_800_000_000_000 }, secureAssessmentVersion: 2
};

test("correction rejects missing, excess, fractional and out-of-range points", () => {
  for (const points of [{ q1: 2 }, { q1: 2, q2: 3, extra: 1 }, { q1: 2, q2: 3.1 }, { q1: 2, q2: 4 }, { q1: "2", q2: 3 }]) {
    assert.throws(() => validateCorrection(questions, points, submission), /Punkte/);
  }
  const next = validateCorrection(questions, { q1: 2, q2: 2.5 }, submission);
  assert.equal(next.totalPoints, 4.5);
  assert.equal(next.percent, 90);
  assert.equal(next.grading.q2.awardedPoints, 2.5);
  assert.equal(next.grading.q2.needsReview, false);
});

test("record keeps frozen questions, correction history and explicit absent historical facts", () => {
  const record = buildExportRecord({ quizId: "QUIZ1", submissionId: "sub-1", quiz: { title: "Probe", ownerId: "teacher-1" }, submission,
    questions: [{ id: "q1", data: questions[0], source: "submission-snapshot", recordedAtMillis: 1_800_000_000_000 }, { id: "q2", data: questions[1], source: "submission-snapshot", recordedAtMillis: 1_800_000_000_000 }],
    events: [{ id: "op-1", atMillis: 1_800_000_100_000, actorUid: "teacher-1", reason: "Nachprüfung", before: { totalPoints: 2 }, after: { totalPoints: 4.5 } }],
    exportedAtMillis: 1_800_000_200_000 });
  assert.equal(record.schemaVersion, 1);
  assert.equal(record.questions[0].source, "submission-snapshot");
  assert.equal(record.questions[0].data.text, "Was ist 2 + 2?");
  assert.equal(record.events[0].reason, "Nachprüfung");
  assert.equal(record.submission.answers.q2, "Weil zwei Paare.");
  assert.equal(record.submission.submittedAtMillis, 1_800_000_000_000);
  assert.equal(record.gaps.some(x => x.field === "aiSuggestions" && x.reason === "not-recorded"), true);
  assert.equal(record.gaps.some(x => x.field === "questionSnapshot"), false);
  assert.equal(JSON.stringify(record).includes("ownerId"), false);
});

test("legacy record labels current question content as unverified and does not invent history", () => {
  const record = buildExportRecord({ quizId: "QUIZ1", submissionId: "sub-1", quiz: { title: "Alt" }, submission: { ...submission, submittedAt: null, secureAssessmentVersion: undefined },
    questions: [{ id: "q1", data: questions[0], source: "current-authoring" }], events: [], exportedAtMillis: 1_800_000_200_000 });
  assert.equal(record.questions[0].source, "current-authoring-unverified");
  assert.equal(record.gaps.some(x => x.field === "questionSnapshot"), true);
  assert.equal(record.gaps.some(x => x.field === "submittedAtServer"), true);
  assert.equal(record.events.length, 0);
});
