"use strict";

const { validateCorrection, buildExportRecord } = require("./school-export-core");
const { isDeepStrictEqual } = require("node:util");
const { createHash } = require("node:crypto");

const safeId = value => typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
function fail(code, message) { const error = Error(message); error.code = code; throw error; }
function requireId(value) { if (!safeId(value)) fail("invalid-argument", "Ungültige Kennung."); return value; }
function plain(value) {
  if (value == null || typeof value !== "object") return value;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (Array.isArray(value)) return value.map(plain);
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).map(([key, item]) => [key, plain(item)]));
}
function requestHash(kind, reason, points = null) {
  const ordered = points && Object.fromEntries(Object.keys(points).sort().map(key => [key, points[key]]));
  return createHash("sha256").update(JSON.stringify({ kind, reason: reason.trim(), points: ordered })).digest("hex");
}
function matchingRetry(existing, kind, digest) {
  if (existing.kind !== kind || existing.requestHash !== digest) fail("already-exists", "Diese Vorgangskennung wurde bereits für eine andere Änderung verwendet.");
  return { operationId: existing.operationId, after: plain(existing.after), atMillis: existing.atMillis, repeated: true };
}
function nextSequence(submission) {
  const prior = submission.schoolReviewSequence ?? 0;
  if (!Number.isSafeInteger(prior) || prior < 0 || prior >= Number.MAX_SAFE_INTEGER) fail("failed-precondition", "Der Korrekturverlauf ist ungültig.");
  return prior + 1;
}

function createSchoolExportService({ store, projectId, now = Date.now }) {
  function environment() { if (projectId !== "gradecrew-staging-2026") fail("failed-precondition", "Der Schulexport ist nur in der Testumgebung verfügbar."); }
  async function context(tx, uid, quizId, submissionId) {
    if (!uid) fail("unauthenticated", "Bitte als Lehrkraft anmelden.");
    requireId(uid); requireId(quizId); requireId(submissionId);
    const [user, deletion, quiz, submission] = await Promise.all([
      tx.get(`users/${uid}`), tx.get(`accountDeletions/${uid}`), tx.get(`quizzes/${quizId}`), tx.get(`quizzes/${quizId}/submissions/${submissionId}`)
    ]);
    if (!user || deletion || user.accountDeletionId || (user.status || "active") !== "active" || !["teacher", "admin"].includes(user.role || "teacher") || !quiz || quiz.ownerId !== uid || quiz.isDeleted || quiz.rightsHold || !submission) fail("permission-denied", "Berechtigung für diese Arbeit fehlt.");
    const binding = submission.classroom;
    if (!binding || !safeId(binding.schoolId) || !safeId(binding.studentId) || !safeId(binding.assignmentId)) fail("failed-precondition", "Nur persönlich zugewiesene Klassenarbeiten sind für diesen Prototyp freigegeben.");
    const base = `classroomSchools/${binding.schoolId}`;
    const [member, school, pupil, assignment] = await Promise.all([
      tx.get(`classroomMembers/${uid}`), tx.get(base), tx.get(`${base}/students/${binding.studentId}`), tx.get(`${base}/assignments/${binding.assignmentId}`)
    ]);
    if (!member || member.schoolId !== binding.schoolId || !["teacher", "admin"].includes(member.role) || !school || !pupil || pupil.status !== "active" || pupil.classId !== assignment?.classId || !assignment || assignment.quizId !== quizId || assignment.ownerId !== uid || !assignment.recipientIds?.includes(binding.studentId)) fail("permission-denied", "Berechtigung für diese Klasse fehlt.");
    if ([school, quiz, pupil, assignment].some(item => item.schoolExportSynthetic !== true)) fail("permission-denied", "Der Schulexport ist nur für gekennzeichnete synthetische Testdaten verfügbar.");
    return { quiz, submission, binding };
  }

  async function questions(tx, quizId, submissionId, submission) {
    const saved = await tx.list(`quizzes/${quizId}/submissions/${submissionId}/questionSnapshots`, 200);
    if (saved.length > 100) fail("resource-exhausted", "Zu viele Aufgaben für den Einzel-Export.");
    const complete = Number.isSafeInteger(submission.questionSnapshotCount) && submission.questionSnapshotCount === saved.length;
    if (saved.length) return saved.map(row => ({ id: row.id, data: plain(row.data.data), source: complete ? "submission-snapshot" : "submission-snapshot-incomplete", recordedAtMillis: row.data.recordedAtMillis ?? null })).sort((a, b) => (a.data.position || 0) - (b.data.position || 0));
    const current = await tx.list(`quizzes/${quizId}/questions`, 200);
    if (current.length > 100) fail("resource-exhausted", "Zu viele Aufgaben für den Einzel-Export.");
    return current.map(row => ({ id: row.id, data: plain(row.data), source: "current-authoring" })).sort((a, b) => (a.data.position || 0) - (b.data.position || 0));
  }

  async function saveReview({ uid, quizId, submissionId, operationId, reason, points }) {
    environment(); requireId(operationId);
    if (operationId.length < 16 || operationId.length > 80 || typeof reason !== "string" || reason.trim().length < 4 || reason.trim().length > 500) fail("invalid-argument", "Bitte einen Korrekturgrund mit mindestens vier Zeichen angeben.");
    return store.transaction(async tx => {
      const { submission } = await context(tx, uid, quizId, submissionId);
      const digest = requestHash("review", reason, points);
      const eventPath = `quizzes/${quizId}/submissions/${submissionId}/reviewEvents/${operationId}`;
      const existing = await tx.get(eventPath);
      if (existing) return matchingRetry(existing, "review", digest);
      const frozen = await questions(tx, quizId, submissionId, submission);
      if (!frozen.length || frozen.some(q => q.source !== "submission-snapshot")) fail("failed-precondition", "Für diese Arbeit fehlt der eingefrorene Aufgabenstand; Korrektur über den neuen Prüfpfad gesperrt.");
      let after;
      try { after = validateCorrection(frozen.map(q => ({ id: q.id, ...q.data })), points, submission); }
      catch (error) { fail("invalid-argument", error.message); }
      const before = plain({ grading: submission.grading || {}, totalPoints: submission.totalPoints ?? null, maxPoints: submission.maxPoints ?? null, percent: submission.percent ?? null, grade: submission.grade ?? null, status: submission.status || null, reviewedAt: submission.reviewedAt || null, reviewedBy: submission.reviewedBy || null });
      const atMillis = now();
      const sequence = nextSequence(submission);
      const projection = { ...after, reviewedAt: store.timestamp ? store.timestamp(atMillis) : atMillis, reviewedBy: uid, schoolReviewLastKind: "review", schoolReviewSequence: sequence };
      tx.create(eventPath, { operationId, kind: "review", actorUid: uid, reason: reason.trim(), requestHash: digest, atMillis, sequence, before, after: plain(projection), schemaVersion: 1 });
      tx.update(`quizzes/${quizId}/submissions/${submissionId}`, projection);
      return { operationId, after: plain(projection), atMillis, repeated: false };
    });
  }

  async function undoReview({ uid, quizId, submissionId, operationId, reason }) {
    environment(); requireId(operationId);
    if (operationId.length < 16 || operationId.length > 80 || typeof reason !== "string" || reason.trim().length < 4 || reason.trim().length > 500) fail("invalid-argument", "Bitte einen Rücknahmegrund angeben.");
    return store.transaction(async tx => {
      const { submission } = await context(tx, uid, quizId, submissionId);
      const digest = requestHash("undo", reason);
      const base = `quizzes/${quizId}/submissions/${submissionId}`;
      const eventPath = `${base}/reviewEvents/${operationId}`;
      const existing = await tx.get(eventPath);
      if (existing) return matchingRetry(existing, "undo", digest);
      const events = await tx.list(`${base}/reviewEvents`, 1001);
      if (!events.length || events.length > 1000) fail("failed-precondition", "Keine eindeutige letzte Korrektur zum Zurücknehmen vorhanden.");
      const latest = events.map(row => ({ id: row.id, ...plain(row.data) })).sort((a, b) => (b.sequence ?? 0) - (a.sequence ?? 0) || b.atMillis - a.atMillis || b.id.localeCompare(a.id))[0];
      if (latest.kind === "undo") fail("failed-precondition", "Die letzte Korrektur ist bereits zurückgenommen.");
      const fields = ["grading", "totalPoints", "maxPoints", "percent", "grade", "status"];
      if (!latest.before || fields.some(key => !isDeepStrictEqual(plain(submission[key] ?? null), latest.after?.[key] ?? null))) fail("aborted", "Die Bewertung wurde inzwischen geändert. Bitte neu laden.");
      const before = plain(Object.fromEntries(fields.map(key => [key, submission[key] ?? null])));
      const atMillis = now();
      const after = Object.fromEntries(fields.map(key => [key, latest.before[key] ?? null]));
      const sequence = nextSequence(submission);
      const projection = { ...after, reviewedAt: store.timestamp ? store.timestamp(atMillis) : atMillis, reviewedBy: uid, schoolReviewLastKind: "undo", schoolReviewSequence: sequence };
      tx.create(eventPath, { operationId, kind: "undo", undoOf: latest.id, actorUid: uid, reason: reason.trim(), requestHash: digest, atMillis, sequence, before, after: plain(projection), schemaVersion: 1 });
      tx.update(base, projection);
      return { operationId, after: plain(projection), atMillis, repeated: false };
    });
  }

  async function exportWork({ uid, quizId, submissionId }) {
    environment();
    return store.transaction(async tx => {
      const { quiz, submission } = await context(tx, uid, quizId, submissionId);
      const [frozen, events] = await Promise.all([
        questions(tx, quizId, submissionId, submission),
        tx.list(`quizzes/${quizId}/submissions/${submissionId}/reviewEvents`, 1001)
      ]);
      if (events.length > 1000) fail("resource-exhausted", "Zu viele Korrekturereignisse für den Einzel-Export.");
      const record = buildExportRecord({ quizId, submissionId, quiz: plain(quiz), submission: plain(submission), questions: frozen,
        events: events.map(row => ({ id: row.id, ...plain(row.data) })).sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0) || a.atMillis - b.atMillis || a.id.localeCompare(b.id)), exportedAtMillis: now() });
      if (Buffer.byteLength(JSON.stringify(record)) > 8_000_000) fail("resource-exhausted", "Diese Einzelarbeit ist für den Testexport zu groß.");
      return record;
    });
  }
  return { saveReview, undoReview, exportWork };
}

module.exports = { createSchoolExportService };
