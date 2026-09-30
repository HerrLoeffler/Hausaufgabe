#!/usr/bin/env node

import { assertReceiptMatches } from "../assessment-receipt-check.mjs";
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";

const PROJECT_ID = "hausaufgabe-staging";
const REGION = "europe-west1";
const MAX_PARTICIPANTS = 50;
const DEFAULT_PARTICIPANTS = 30;
const DEFAULT_POLL_ROUNDS = 3;
const DEFAULT_TIMEOUT_MS = 25_000;

function usage() {
  console.log(`GradeCrew Gate E load test\n\nUsage:\n  node tools/gate-e-load-test.mjs --quiz=TESTCODE [options]\n\nOptions:\n  --participants=N      virtual pupils (default ${DEFAULT_PARTICIPANTS}, max ${MAX_PARTICIPANTS})\n  --poll-rounds=N       authenticated state polls per pupil before submit (default ${DEFAULT_POLL_ROUNDS})\n  --timeout-ms=N        timeout per callable (default ${DEFAULT_TIMEOUT_MS})\n  --output=FILE         JSON report path (default gate-e-report-<code>-<timestamp>.json)\n  --no-duplicate-submit skip the idempotency double-submit race\n  --help                show this help\n\nSafety:\n  This tool is hard-wired to ${PROJECT_ID} in ${REGION}. It refuses other Firebase projects.\n  Use only a published STAGING test with student self-start. Test data only.\n`);
}

function parseArgs(argv) {
  const out = { participants: DEFAULT_PARTICIPANTS, pollRounds: DEFAULT_POLL_ROUNDS, timeoutMs: DEFAULT_TIMEOUT_MS, duplicateSubmit: true };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--no-duplicate-submit") out.duplicateSubmit = false;
    else if (arg.startsWith("--quiz=")) out.quizId = arg.slice(7);
    else if (arg.startsWith("--participants=")) out.participants = Number(arg.slice(15));
    else if (arg.startsWith("--poll-rounds=")) out.pollRounds = Number(arg.slice(14));
    else if (arg.startsWith("--timeout-ms=")) out.timeoutMs = Number(arg.slice(13));
    else if (arg.startsWith("--output=")) out.output = arg.slice(9);
    else throw new Error(`Unbekannte Option: ${arg}`);
  }
  return out;
}

function cleanQuizId(value) {
  const id = String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z0-9]{4,16}$/.test(id)) throw new Error("--quiz muss 4–16 Buchstaben/Ziffern enthalten.");
  return id;
}

function positiveInt(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${label} muss zwischen ${min} und ${max} liegen.`);
  return value;
}

function urlSafe(bytes) {
  return randomBytes(bytes).toString("base64url");
}

function endpoint(name) {
  return `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${name}`;
}

function callableError(payload, statusCode, bodyText) {
  const error = payload?.error || {};
  const status = String(error.status || `HTTP_${statusCode}`);
  const code = status.toLowerCase().replace(/_/g, "-");
  const wrapped = new Error(String(error.message || bodyText || `HTTP ${statusCode}`).slice(0, 500));
  wrapped.code = code;
  wrapped.reference = /^[A-Za-z0-9-]{1,100}$/.test(String(error.details?.reference || "")) ? String(error.details.reference) : "";
  wrapped.httpStatus = statusCode;
  return wrapped;
}

const latencies = new Map();
const responseSizes = new Map();

function recordMetric(map, name, value) {
  const list = map.get(name) || [];
  list.push(value);
  map.set(name, list);
}

async function call(name, data, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  let response;
  let text = "";
  try {
    response = await fetch(endpoint(name), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data }),
      signal: controller.signal
    });
    text = await response.text();
  } catch (error) {
    const wrapped = new Error(error?.name === "AbortError" ? `Timeout nach ${timeoutMs} ms` : String(error?.message || error));
    wrapped.code = error?.name === "AbortError" ? "timeout" : "network";
    throw wrapped;
  } finally {
    clearTimeout(timeout);
    recordMetric(latencies, name, performance.now() - started);
  }

  const bytes = Buffer.byteLength(text, "utf8");
  recordMetric(responseSizes, name, bytes);
  let payload;
  try { payload = text ? JSON.parse(text) : {}; }
  catch { throw callableError(null, response.status, "Ungültige JSON-Antwort vom Callable."); }
  if (!response.ok || payload?.error) throw callableError(payload, response.status, text);
  return { data: payload?.result ?? payload?.data ?? {}, bytes };
}

function percentile(values, fraction) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1));
  return Math.round(sorted[index] * 10) / 10;
}

function metricSummary(map) {
  return Object.fromEntries([...map.entries()].map(([name, values]) => [name, {
    count: values.length,
    min: Math.round(Math.min(...values) * 10) / 10,
    p50: percentile(values, 0.50),
    p95: percentile(values, 0.95),
    p99: percentile(values, 0.99),
    max: Math.round(Math.max(...values) * 10) / 10
  }]));
}

function sizeSummary(map) {
  return Object.fromEntries([...map.entries()].map(([name, values]) => [name, {
    count: values.length,
    maxBytes: Math.max(...values),
    p95Bytes: percentile(values, 0.95)
  }]));
}

function forbiddenPaperPaths(value, path = "$", findings = []) {
  if (!value || typeof value !== "object") return findings;
  const forbidden = new Set([
    "correct", "correctBoolean", "correctOptionIds", "acceptedAnswers", "acceptedOrders",
    "numericAnswer", "tolerance", "targetWords", "gradingKey", "decoderShape", "paperSecret",
    "tokenHash", "solutionSnapshot", "solutions", "sourceFingerprint", "authoringFingerprint"
  ]);
  if (Array.isArray(value)) {
    value.forEach((item, index) => forbiddenPaperPaths(item, `${path}[${index}]`, findings));
    return findings;
  }
  for (const [key, child] of Object.entries(value)) {
    if (forbidden.has(key)) findings.push(`${path}.${key}`);
    forbiddenPaperPaths(child, `${path}.${key}`, findings);
  }
  return findings;
}

function tokenizedWordCount(text) {
  const pieces = String(text || "").split(/([\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*)/gu).filter(Boolean);
  return pieces.filter(piece => /[\p{L}\p{N}]/u.test(piece[0] || "")).length;
}

function syntheticAnswers(paper, studentIndex) {
  const answers = {};
  for (const question of Array.isArray(paper) ? paper : []) {
    const type = String(question?.type || "");
    let value = null;
    if (["single", "dropdown"].includes(type)) value = question.options?.[0]?.id || "";
    else if (type === "multi") value = (question.options || []).slice(0, Math.min(2, question.options?.length || 0)).map(option => option.id);
    else if (type === "truefalse") value = studentIndex % 2 ? "false" : "true";
    else if (type === "text") value = `Gate-E-${studentIndex + 1}`;
    else if (type === "number") value = String(studentIndex % 7);
    else if (type === "gapfill") value = (question.segments || []).filter(segment => segment.type === "gap").map((_, index) => `gap-${index + 1}`);
    else if (type === "matching") {
      const rights = question.rightItems || [];
      value = Object.fromEntries((question.leftItems || []).map((left, index) => [left.id, rights.length ? rights[index % rights.length].id : ""]));
    } else if (type === "ordering") value = (question.items || []).map(item => item.id);
    else if (type === "grouping") {
      const groups = question.groups || [];
      value = Object.fromEntries((question.items || []).map((item, index) => [item.id, groups.length ? groups[index % groups.length].id : ""]));
    } else if (type === "markwords") {
      const count = tokenizedWordCount(question.passage);
      value = count ? [String(studentIndex % count)] : [];
    }
    answers[String(question?.id || "")] = value;
  }
  return answers;
}

function safeError(error) {
  return {
    code: String(error?.code || "unknown").slice(0, 80),
    message: String(error?.message || error || "Unbekannter Fehler").slice(0, 500),
    reference: String(error?.reference || "").slice(0, 100)
  };
}

function receiptKey(response) {
  const receipt = response?.receipt || response || {};
  return String(receipt.submissionId || receipt.id || receipt.attemptId || "");
}

function hasSolutions(response) {
  const receipt = response?.receipt || response || {};
  return Object.prototype.hasOwnProperty.call(receipt, "solutions") && receipt.solutions != null;
}

function shortId(id) {
  const value = String(id || "");
  return value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
}

async function mapConcurrent(items, worker) {
  return Promise.all(items.map(async (item, index) => {
    try { return { ok: true, value: await worker(item, index) }; }
    catch (error) { return { ok: false, error: safeError(error) }; }
  }));
}

function errorCounts(results) {
  const counts = {};
  for (const result of results) {
    if (result.ok) continue;
    const code = result.error?.code || "unknown";
    counts[code] = (counts[code] || 0) + 1;
  }
  return counts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { usage(); return; }
  const quizId = cleanQuizId(args.quizId);
  const participants = positiveInt(args.participants, "--participants", { min: 1, max: MAX_PARTICIPANTS });
  const pollRounds = positiveInt(args.pollRounds, "--poll-rounds", { min: 0, max: 10 });
  const timeoutMs = positiveInt(args.timeoutMs, "--timeout-ms", { min: 1000, max: 120000 });
  const startedAt = new Date();
  const reportPath = args.output || `gate-e-report-${quizId}-${startedAt.toISOString().replace(/[:.]/g, "-")}.json`;

  console.log("============================================================");
  console.log(" GradeCrew · Gate E · 30-Teilnehmer-/Payloadtest");
  console.log("============================================================");
  console.log(`Projekt:       ${PROJECT_ID}`);
  console.log(`Region:        ${REGION}`);
  console.log(`Testcode:      ${quizId}`);
  console.log(`Teilnehmer:    ${participants}`);
  console.log(`Status-Polls:  ${pollRounds} pro Teilnehmer`);
  console.log(`Doppel-Submit: ${args.duplicateSubmit ? "ja" : "nein"}`);
  console.log("Hinweis: Nur STAGING-Testdaten verwenden. Tokens werden nicht protokolliert.\n");

  const infoCall = await call("getAssessmentInfo", { quizId }, timeoutMs);
  const quiz = infoCall.data?.quiz || {};
  if (quiz.startMode !== "student") {
    throw new Error(`Gate E benötigt für diesen automatischen Lauf Start durch Schüler. Aktuell: ${quiz.startMode || "unbekannt"}.`);
  }
  if (quiz.ended === true) throw new Error("Der Test ist bereits beendet. Bitte einen neuen Staging-Test veröffentlichen.");
  console.log(`Preflight OK: ${quiz.title || "Test"} · ${quiz.questionCount || "?"} Aufgaben · ${quiz.totalPoints || "?"} Punkte`);

  const students = Array.from({ length: participants }, (_, index) => ({
    index,
    name: `GateE-${String(index + 1).padStart(2, "0")}`,
    clientAttemptId: urlSafe(24),
    attemptToken: urlSafe(32)
  }));

  console.log(`\n[1/4] Starte ${participants} Teilnehmer gleichzeitig …`);
  const startResults = await mapConcurrent(students, async student => {
    const response = (await call("startAssessmentAttempt", {
      quizId,
      studentName: student.name,
      clientAttemptId: student.clientAttemptId,
      attemptToken: student.attemptToken
    }, timeoutMs)).data;
    if (!/^a_[a-f0-9]{28}$/.test(String(response.attemptId || ""))) throw Object.assign(new Error("Ungültige Attempt-ID in Startantwort."), { code: "invalid-attempt-id" });
    if (response.status !== "running") throw Object.assign(new Error(`Unerwarteter Status: ${response.status}`), { code: "unexpected-status" });
    if (!Array.isArray(response.paper) || !response.paper.length) throw Object.assign(new Error("Kein Aufgabenpapier erhalten."), { code: "missing-paper" });
    const leaks = forbiddenPaperPaths(response.paper);
    if (leaks.length) throw Object.assign(new Error(`Verbotene Lösungsfelder im Schülerpapier: ${leaks.slice(0, 5).join(", ")}`), { code: "solution-leak" });
    return {
      attemptId: response.attemptId,
      status: response.status,
      sessionRunId: response.sessionRunId || null,
      paper: response.paper,
      paperBytes: Buffer.byteLength(JSON.stringify(response.paper), "utf8"),
      questionCount: response.paper.length
    };
  });

  const active = [];
  startResults.forEach((result, index) => {
    if (result.ok) active.push({ ...students[index], ...result.value });
  });
  const uniqueAttempts = new Set(active.map(item => item.attemptId));
  console.log(`Starts: ${active.length}/${participants} erfolgreich · eindeutige Attempts: ${uniqueAttempts.size}/${active.length}`);

  console.log(`\n[2/4] ${pollRounds} Status-Poll-Runden mit allen gestarteten Teilnehmern …`);
  const pollResults = [];
  for (let round = 0; round < pollRounds; round += 1) {
    const roundResults = await mapConcurrent(active, async student => {
      const response = (await call("resumeAssessmentAttempt", {
        quizId,
        attemptId: student.attemptId,
        attemptToken: student.attemptToken,
        stateOnly: true
      }, timeoutMs)).data;
      if (response.paper != null) throw Object.assign(new Error("stateOnly hat unerwartet Aufgaben ausgeliefert."), { code: "state-only-paper-leak" });
      if (response.status !== "running") throw Object.assign(new Error(`Status-Poll meldet ${response.status}`), { code: "poll-status" });
      return { status: response.status };
    });
    pollResults.push(...roundResults);
    console.log(`Poll ${round + 1}/${pollRounds}: ${roundResults.filter(result => result.ok).length}/${active.length} erfolgreich`);
    if (round + 1 < pollRounds) await new Promise(resolve => setTimeout(resolve, 250));
  }

  console.log(`\n[3/4] Abgaben${args.duplicateSubmit ? " + idempotenter Doppel-Submit" : ""} …`);
  const submitResults = await mapConcurrent(active, async student => {
    const answers = syntheticAnswers(student.paper, student.index);
    const payload = {
      quizId,
      attemptId: student.attemptId,
      attemptToken: student.attemptToken,
      answers,
      autoSubmitted: false
    };
    if (!args.duplicateSubmit) {
      const first = (await call("submitAssessmentAttempt", payload, timeoutMs)).data;
      assertReceiptMatches(first, student.attemptId);
      if (hasSolutions(first)) throw Object.assign(new Error("Lösungen wurden vor Testende im Receipt ausgeliefert."), { code: "early-solutions" });
      return { keyA: receiptKey(first), keyB: "", duplicateOk: true, needsReview: Boolean(first.receipt?.needsReview) };
    }
    const [a, b] = await Promise.all([
      call("submitAssessmentAttempt", payload, timeoutMs),
      call("submitAssessmentAttempt", payload, timeoutMs)
    ]);
    const first = a.data;
    const second = b.data;
    assertReceiptMatches(first, student.attemptId);
    assertReceiptMatches(second, student.attemptId);
    if (hasSolutions(first) || hasSolutions(second)) throw Object.assign(new Error("Lösungen wurden vor Testende im Receipt ausgeliefert."), { code: "early-solutions" });
    const keyA = receiptKey(first);
    const keyB = receiptKey(second);
    if (!keyA || !keyB || keyA !== keyB) throw Object.assign(new Error(`Doppel-Submit lieferte unterschiedliche Receipts (${shortId(keyA)} / ${shortId(keyB)}).`), { code: "non-idempotent-receipt" });
    return { keyA, keyB, duplicateOk: true, needsReview: Boolean(first.receipt?.needsReview) };
  });
  console.log(`Abgaben: ${submitResults.filter(result => result.ok).length}/${active.length} erfolgreich`);

  console.log("\n[4/4] Receipt-Nachprüfung …");
  const receiptCandidates = active.filter((_, index) => submitResults[index]?.ok);
  const receiptResults = await mapConcurrent(receiptCandidates, async student => {
    const response = (await call("getAssessmentReceipt", {
      quizId,
      attemptId: student.attemptId,
      attemptToken: student.attemptToken
    }, timeoutMs)).data;
    assertReceiptMatches(response, student.attemptId);
    if (hasSolutions(response)) throw Object.assign(new Error("Receipt-Nachprüfung enthält vor Testende Lösungen."), { code: "early-solutions" });
    const key = receiptKey(response);
    if (!key) throw Object.assign(new Error("Receipt enthält keine Submission-/Attempt-Kennung."), { code: "missing-receipt-id" });
    return { key };
  });
  console.log(`Receipts: ${receiptResults.filter(result => result.ok).length}/${receiptCandidates.length} erfolgreich`);

  const startOk = active.length;
  const pollOk = pollResults.filter(result => result.ok).length;
  const expectedPolls = active.length * pollRounds;
  const submitOk = submitResults.filter(result => result.ok).length;
  const receiptOk = receiptResults.filter(result => result.ok).length;
  const maxPaperBytes = active.length ? Math.max(...active.map(item => item.paperBytes)) : 0;
  const pass = startOk === participants
    && uniqueAttempts.size === participants
    && pollOk === expectedPolls
    && submitOk === participants
    && receiptOk === participants;

  const report = {
    schemaVersion: 1,
    gate: "E",
    scope: "concurrency-smoke",
    fullGateEVerified: false,
    outstanding: ["teacher-end-race", "network-loss", "ios-background", "maximum-payload", "sustained-load", "database-reconciliation"],
    environment: { projectId: PROJECT_ID, region: REGION, productionTouched: false },
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    quiz: {
      quizId,
      title: String(quiz.title || "").slice(0, 200),
      questionCount: Number(quiz.questionCount) || null,
      totalPoints: Number(quiz.totalPoints) || null,
      startMode: quiz.startMode || null,
      sessionRunId: quiz.sessionRunId || null
    },
    requested: { participants, pollRounds, duplicateSubmit: args.duplicateSubmit },
    summary: {
      pass,
      starts: { ok: startOk, expected: participants, uniqueAttemptIds: uniqueAttempts.size },
      polls: { ok: pollOk, expected: expectedPolls },
      submissions: { ok: submitOk, expected: participants },
      receipts: { ok: receiptOk, expected: participants },
      maxPaperBytes
    },
    errors: {
      starts: errorCounts(startResults),
      polls: errorCounts(pollResults),
      submissions: errorCounts(submitResults),
      receipts: errorCounts(receiptResults)
    },
    latencyMs: metricSummary(latencies),
    responsePayloads: sizeSummary(responseSizes),
    participants: active.map((student, index) => ({
      participant: student.name,
      attemptId: student.attemptId,
      questionCount: student.questionCount,
      paperBytes: student.paperBytes,
      submitOk: Boolean(submitResults[index]?.ok)
    }))
  };

  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");

  console.log("\n==================== GATE E SUMMARY ====================");
  console.log(`Starts:       ${startOk}/${participants}`);
  console.log(`Unique IDs:   ${uniqueAttempts.size}/${participants}`);
  console.log(`Status-Polls: ${pollOk}/${expectedPolls}`);
  console.log(`Submits:      ${submitOk}/${participants}`);
  console.log(`Receipts:     ${receiptOk}/${participants}`);
  console.log(`Max Paper:    ${maxPaperBytes} Bytes`);
  for (const [name, metric] of Object.entries(metricSummary(latencies))) {
    console.log(`${name.padEnd(28)} p50 ${String(metric.p50).padStart(7)} ms · p95 ${String(metric.p95).padStart(7)} ms · max ${String(metric.max).padStart(7)} ms`);
  }
  console.log(`Report:       ${reportPath}`);
  console.log(`Ergebnis:     ${pass ? "PASS ✅" : "FAIL ❌"}`);
  console.log("========================================================\n");

  if (!pass) process.exitCode = 1;
}

main().catch(error => {
  console.error(`\nGate E abgebrochen: ${error?.message || error}`);
  if (error?.reference) console.error(`Fehlerkennung: ${error.reference}`);
  process.exitCode = 1;
});

