import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export function patchFunctionsIndex(source) {
  if (!source.includes('const { onCall, HttpsError } = require("firebase-functions/v2/https");')) {
    throw new Error('Firebase HTTPS import marker not found.');
  }
  if (!source.includes('\nfunction aiJobLock(uid)')) {
    throw new Error('generateTest insertion marker not found.');
  }
  if (source.includes('exports.generateEscapePreview')) return source;

  const patchedImport = source.replace(
    'const { onCall, HttpsError } = require("firebase-functions/v2/https");',
    'const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");'
  );

  const snippet = String.raw`
const ESCAPE_PREVIEW_GLOBAL_DAILY_LIMIT = 30;
const ESCAPE_PREVIEW_SOURCE_DAILY_LIMIT = 10;
const ESCAPE_PREVIEW_SOURCE_MINUTE_LIMIT = 2;
const ESCAPE_PREVIEW_ORIGIN = /^https:\/\/hausaufgabe-staging--gradecrew-escape-dev-[a-z0-9-]+\.web\.app$/i;

function escapePreviewAllowedTypes(subject) {
  const numeric = /(mathe|mathematik|physik|chemie|wirtschaft|rechnen|informatik)/i.test(String(subject || ""));
  return numeric ? ["single", "truefalse", "number"] : ["single", "dropdown", "truefalse"];
}

function escapePreviewPayload(data = {}) {
  const subject = String(data.subject || "").trim().slice(0, 120);
  const grade = String(data.grade || "").trim().slice(0, 60);
  const topic = String(data.topic || "").trim().slice(0, 300);
  const requestedDifficulty = String(data.difficulty || "mittel").trim().toLowerCase();
  const difficulty = ["leicht", "mittel", "anspruchsvoll", "gemischt"].includes(requestedDifficulty) ? requestedDifficulty : "mittel";
  const teacherWish = String(data.notes || "").trim().slice(0, 1200);
  if (!subject || !grade || !topic) throw new HttpsError("invalid-argument", "Fach, Klasse und Thema werden benötigt.");
  const pairing = "Erstelle genau 16 kurze, eindeutige, bildfreie Aufgaben. Die ersten 8 sind Hauptaufgaben. Die Aufgaben 9 bis 16 sind jeweils Transferaufgaben zu Aufgabe 1 bis 8: gleicher Lernschritt bzw. gleiche Kompetenz, aber andere Zahlen, Beispiele oder Formulierungen. Keine Trickfragen. Alle Aufgaben müssen automatisch eindeutig prüfbar sein.";
  return {
    schoolType: "Mittelschule",
    region: "Bayern",
    subject,
    grade,
    topic,
    difficulty,
    count: 16,
    points: 16,
    allowedTypes: escapePreviewAllowedTypes(subject),
    notes: teacherWish ? `${pairing}\nZusätzlicher Wunsch der Lehrkraft: ${teacherWish}` : pairing,
    imageMode: "none",
    exactImageCounts: true,
    imageQuestionCount: 0,
    imageAnswerQuestionCount: 0,
    materialMode: "inspiration",
    materials: [],
    clientRequestId: `escape-preview-${randomUUID().slice(0, 12)}`
  };
}

async function consumeEscapePreviewQuota(rawRequest) {
  const db = getFirestore();
  const nowDate = new Date();
  const day = nowDate.toISOString().slice(0, 10);
  const minute = nowDate.toISOString().slice(0, 16);
  const forwarded = String(rawRequest?.headers?.["x-forwarded-for"] || "").split(",")[0].trim();
  const source = String(rawRequest?.ip || forwarded || "unknown").slice(0, 160);
  const sourceKey = createHash("sha256").update(`${day}:escape-preview:${source}`).digest("hex");
  const globalRef = db.doc(`escapePreviewRate/${day}-global`);
  const sourceRef = db.doc(`escapePreviewRate/${day}-${sourceKey}`);

  await db.runTransaction(async tx => {
    const globalSnap = await tx.get(globalRef);
    const sourceSnap = await tx.get(sourceRef);
    const globalCount = Number(globalSnap.data()?.count || 0);
    const sourceCount = Number(sourceSnap.data()?.count || 0);
    const minuteCount = sourceSnap.data()?.minuteKey === minute ? Number(sourceSnap.data()?.minuteCount || 0) : 0;
    if (globalCount >= ESCAPE_PREVIEW_GLOBAL_DAILY_LIMIT || sourceCount >= ESCAPE_PREVIEW_SOURCE_DAILY_LIMIT || minuteCount >= ESCAPE_PREVIEW_SOURCE_MINUTE_LIMIT) {
      throw new HttpsError("resource-exhausted", "Der Escape-KI-Test hat sein aktuelles Testlimit erreicht. Bitte später erneut versuchen.");
    }
    tx.set(globalRef, { day, count: globalCount + 1, updatedAt: Timestamp.now() }, { merge: true });
    tx.set(sourceRef, { day, count: sourceCount + 1, minuteKey: minute, minuteCount: minuteCount + 1, updatedAt: Timestamp.now() }, { merge: true });
  });
}

function escapePreviewStatus(error) {
  if (error?.code === "resource-exhausted") return 429;
  if (error?.code === "invalid-argument") return 400;
  if (error?.code === "failed-precondition") return 422;
  return 500;
}

exports.generateEscapePreview = onRequest({
  region: REGION,
  secrets: [OPENAI_API_KEY],
  timeoutSeconds: 540,
  memory: "1GiB",
  cors: false
}, async (req, res) => {
  res.set("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Nur POST ist erlaubt." });
  const origin = String(req.get("origin") || "");
  if (!ESCAPE_PREVIEW_ORIGIN.test(origin)) return res.status(403).json({ ok: false, error: "Dieser Testzugang ist nur im GradeCrew-Escape-Staging verfügbar." });
  try {
    await consumeEscapePreviewQuota(req);
    const payload = escapePreviewPayload(req.body || {});
    const result = await generateTestForUser("escape-preview-staging", payload);
    return res.status(200).json({ ok: true, result });
  } catch (error) {
    const reported = error instanceof HttpsError ? error : reportAiError(error, "escape-preview");
    console.warn("Escape-Preview-KI beendet:", { code: reported.code, reference: reported.details?.reference || null });
    return res.status(escapePreviewStatus(reported)).json({
      ok: false,
      error: String(reported.message || "Die KI-Erstellung ist gerade nicht verfügbar.").slice(0, 300),
      reference: String(reported.details?.reference || "").slice(0, 40) || undefined
    });
  }
});
`;

  return patchedImport.replace('\nfunction aiJobLock(uid)', `${snippet}\nfunction aiJobLock(uid)`);
}

export async function buildEscapePreviewFunctions(destination) {
  if (!destination || !path.isAbsolute(destination)) throw new Error('Absolute build directory required.');
  const functionsSource = path.join(root, 'functions');
  const outputFunctions = path.join(destination, 'functions');
  await fs.rm(destination, { recursive: true, force: true });
  await fs.mkdir(destination, { recursive: true });
  await fs.cp(functionsSource, outputFunctions, {
    recursive: true,
    filter: sourcePath => !sourcePath.split(path.sep).includes('node_modules')
  });
  const indexPath = path.join(outputFunctions, 'index.js');
  const source = await fs.readFile(indexPath, 'utf8');
  const patched = patchFunctionsIndex(source);
  await fs.writeFile(indexPath, patched);
  await fs.writeFile(path.join(destination, 'firebase.json'), JSON.stringify({
    functions: { source: 'functions' }
  }, null, 2) + '\n');
  return { destination, indexPath };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await buildEscapePreviewFunctions(process.argv[2]);
  console.log('Staging-only Escape preview function source prepared.');
}
