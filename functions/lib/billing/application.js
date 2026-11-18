"use strict";

const { createHash, randomBytes } = require("node:crypto");
const { evaluateAccess, trialForRegistration } = require("./domain/access");

class BillingError extends Error {
  constructor(code, message, details = {}) { super(message); this.code = code; this.details = details; }
}
const fail = (code, message, details) => { throw new BillingError(code, message, details); };
const key = (...parts) => createHash("sha256").update(JSON.stringify(parts)).digest("hex");
function identifier(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(value)) fail("invalid-argument", "Ungültige Kennung.");
  return value;
}
function requestId(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{8,100}$/.test(value)) fail("invalid-argument", "Eindeutige Anfrage-ID erforderlich.");
  return value;
}
const QUIZ_FIELDS = new Set(["title", "subject", "grade", "description", "contentLocale", "gradingLocale", "localeContractVersion", "gradeScaleId", "gradeScaleSnapshot", "resultMode", "showSolutions", "solutionReleaseMode", "timeLimitMinutes", "startMode", "shuffleQuestions", "shuffleAnswers", "questionCount", "totalPoints", "audioQuestionCount", "audioAnswerQuestionCount", "listeningOnlyQuestionCount", "requiresSecureAssessmentRules", "audioReady", "solutionAudioQuestionCount", "solutionAudioReady", "qualityIssues", "qualityWarnings", "creationContext"]);
function cleanQuiz(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("invalid-argument", "Testdaten fehlen.");
  const quiz = Object.fromEntries(Object.entries(value).filter(([name, v]) => QUIZ_FIELDS.has(name) && v !== undefined));
  if (typeof quiz.title !== "string" || !quiz.title.trim() || quiz.title.length > 200 || Buffer.byteLength(JSON.stringify(quiz)) > 150000) fail("invalid-argument", "Ungültige Testdaten.");
  return JSON.parse(JSON.stringify(quiz));
}

function createBillingService({ store, now = Date.now, getIdentity, projectId }) {
  if (!["gradecrew-staging-2026", "demo-gradecrew-billing"].includes(projectId)) fail("failed-precondition", "Zahlungsintegration nur für die getrennte Testumgebung.");
  if (!store?.transaction || typeof getIdentity !== "function") throw new TypeError("Store and identity adapter required");

  async function identity(uid) {
    identifier(uid);
    const record = await getIdentity(uid);
    if (!record || record.uid !== uid || record.disabled) fail("permission-denied", "Konto nicht aktiv.");
    const registeredAtMs = Date.parse(record.metadata?.creationTime);
    if (!Number.isSafeInteger(registeredAtMs) || registeredAtMs < 0) fail("failed-precondition", "Registrierungszeit fehlt.");
    return { uid, registeredAtMs, email: String(record.email || "").toLowerCase(), emailVerified: record.emailVerified === true };
  }
  async function caller(request) {
    if (!request?.auth?.uid) fail("unauthenticated", "Bitte anmelden.");
    return identity(request.auth.uid);
  }
  function admin(ctx, request, at) {
    const authTime = request.auth?.token?.auth_time;
    if (ctx.person.role !== "admin" || !ctx.person.emailVerified || !Number.isFinite(authTime) || authTime * 1000 < at - 900000 || authTime * 1000 > at + 60000) fail("permission-denied", "Für diese Änderung bitte als Administrator erneut anmelden.");
  }
  async function context(tx, actor, scope = { kind: "personal", id: actor.uid }) {
    const config = await tx.get("appConfig/billingProduct");
    if (config?.enabled !== true || !Array.isArray(config.allowedUids) || !config.allowedUids.includes(actor.uid)) fail("failed-precondition", "Dieses Konto ist noch nicht für den abgegrenzten Zahlungstest freigegeben.");
    const profile = await tx.get("users/" + actor.uid);
    const deletion = await tx.get("accountDeletions/" + actor.uid);
    if (!profile || deletion || profile.accountDeletionId || profile.isTestAccountArchived || (profile.status && profile.status !== "active") || !["teacher", "admin"].includes(profile.role)) fail("permission-denied", "Konto nicht aktiv.");
    const account = await tx.get("billingV2Accounts/" + actor.uid) || trialForRegistration(actor.registeredAtMs);
    if (account.trialStartedAtMs !== actor.registeredAtMs) fail("failed-precondition", "Unstimmiger Testzeitraum.");
    const grants = await tx.find("billingV2Grants", [["personId", "==", actor.uid], ["status", "==", "active"]], 51);
    if (grants.length > 50) fail("failed-precondition", "Zu viele aktive Freigaben, bitte prüfen.");
    const person = { ...profile, id: actor.uid, emailVerified: actor.emailVerified };
    const memberships = [], seats = [], periods = [];
    if (scope.kind === "school") {
      identifier(scope.id);
      const membership = await tx.get("billingV2Memberships/" + key(scope.id, actor.uid));
      const school = await tx.get("billingV2Schools/" + scope.id);
      if (membership) memberships.push(membership);
      if (school?.currentPeriodId) {
        const period = await tx.get("billingV2Periods/" + identifier(school.currentPeriodId));
        if (period) {
          periods.push({ ...period, id: school.currentPeriodId });
          if (membership?.seatAssigned === true) seats.push({ personId: actor.uid, schoolId: scope.id, periodId: school.currentPeriodId, status: "active" });
        }
      }
    }
    return { person, scope, account, grants, memberships, seats, periods, config,
      saveAccount: changes => tx.put("billingV2Accounts/" + actor.uid, { ...account, ...changes }) };
  }
  const decision = (ctx, at) => evaluateAccess({ ...ctx, at });
  function requireDecision(ctx, at, feature) {
    const access = decision(ctx, at);
    if (!access.featureCodes.includes(feature)) fail("permission-denied", "Für diese Aktion ist ein gültiger Zugang erforderlich.", { reasonCode: access.reasonCode, trialEndsAtMs: access.trialEndsAtMs, freeCreationsRemaining: access.freeCreationsRemaining });
    return access;
  }
  async function getAccess(request) {
    const actor = await caller(request), at = now();
    return store.transaction(async tx => {
      const ctx = await context(tx, actor, request.data?.scope);
      const access = decision(ctx, at);
      ctx.saveAccount();
      return { ...access, enforced: true, policyVersion: "trial14-files5-v2" };
    });
  }
  async function requireFeature(uid, feature, scope) {
    const actor = await identity(uid), at = now();
    return store.transaction(async tx => { const ctx = await context(tx, actor, scope); const access = requireDecision(ctx, at, feature); ctx.saveAccount(); return access; });
  }
  async function createQuiz(request) {
    const actor = await caller(request), at = now(), data = request.data || {};
    const id = requestId(data.requestId);
    if (!["manual", "copy", "import", "ai"].includes(data.kind)) fail("invalid-argument", "Erstellungsart fehlt.");
    const quiz = cleanQuiz(data.quiz);
    const fingerprint = key(data.kind, quiz, data.scope || { kind: "personal", id: actor.uid });
    const ledgerKey = "billingV2Ledger/" + key(actor.uid, "create", id);
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = [...randomBytes(8)].map(n => alphabet[n % alphabet.length]).join("");
    return store.transaction(async tx => {
      const ctx = await context(tx, actor, data.scope);
      const previous = await tx.get(ledgerKey);
      if (previous) {
        if (previous.fingerprint !== fingerprint) fail("already-exists", "Die Anfrage-ID gehört zu anderen Testdaten.");
        if (!await tx.get("quizzes/" + previous.quizId)) fail("failed-precondition", "Dieser bereits gezählte Test wurde gelöscht.");
        return { code: previous.quizId, replayed: true };
      }
      const access = requireDecision(ctx, at, "test.create");
      if (await tx.get("quizzes/" + code)) fail("aborted", "Testcode belegt, bitte erneut versuchen.");
      const funding = access.tier === "trial" ? "trial" : "entitled";
      const record = { ...quiz, ownerId: actor.uid, accessCode: code, published: false, ended: false, isDeleted: false, rightsHold: false, shareEnabled: false,
        sessionState: "open", sessionRunId: null, sessionStartedAt: null, billingScope: ctx.scope,
        billingCreationState: "committed", billingLedgerId: ledgerKey.split("/")[1], createdAt: new Date(at), updatedAt: new Date(at) };
      ctx.saveAccount({ createdCount: ctx.account.createdCount + (funding === "trial" ? 1 : 0) });
      tx.create("quizzes/" + code, record);
      tx.create(ledgerKey, { personId: actor.uid, requestId: id, fingerprint, kind: data.kind, funding, state: "committed", quizId: code, createdAtMs: at, committedAtMs: at });
      return { code, replayed: false };
    });
  }
  async function prepareGenerationReservation(uid, jobId, tx) {
    const actor = await identity(uid), at = now(); identifier(jobId);
    const ctx = await context(tx, actor);
    const ledgerKey = "billingV2Ledger/" + key(uid, "generation", jobId);
    const previous = await tx.get(ledgerKey);
    if (previous) {
      if (!["reserved", "committed"].includes(previous.state)) fail("failed-precondition", "Dieser KI-Auftrag wurde bereits beendet.");
      return () => {};
    }
    const access = requireDecision(ctx, at, "test.create");
    const funding = access.tier === "trial" ? "trial" : "entitled";
    return () => {
      ctx.saveAccount({ reservedCount: ctx.account.reservedCount + (funding === "trial" ? 1 : 0) });
      tx.create(ledgerKey, { personId: uid, jobId, kind: "ai", state: "reserved", funding, createdAtMs: at, expiresAtMs: at + 7200000 });
    };
  }
  async function reserveGeneration(uid, jobId) {
    return store.transaction(async tx => { const apply = await prepareGenerationReservation(uid, jobId, tx); apply(); });
  }
  async function releaseGeneration(uid, jobId) {
    identifier(uid); identifier(jobId);
    return store.transaction(async tx => {
      const ledgerKey = "billingV2Ledger/" + key(uid, "generation", jobId);
      const ledger = await tx.get(ledgerKey), account = await tx.get("billingV2Accounts/" + uid);
      if (!ledger || ledger.state !== "reserved") return { released: false };
      if (!account || ledger.personId !== uid || (ledger.funding === "trial" && account.reservedCount < 1)) fail("failed-precondition", "Reservierung bitte prüfen.");
      tx.put("billingV2Accounts/" + uid, { ...account, reservedCount: account.reservedCount - (ledger.funding === "trial" ? 1 : 0) });
      tx.patch(ledgerKey, { state: "released", releasedAtMs: now() });
      return { released: true };
    });
  }
  async function finalizeGeneration(uid, jobId, quizId, patch) {
    const actor = await identity(uid), at = now(); identifier(jobId); identifier(quizId);
    return store.transaction(async tx => {
      const ctx = await context(tx, actor);
      const ledgerKey = "billingV2Ledger/" + key(uid, "generation", jobId);
      const ledger = await tx.get(ledgerKey), quiz = await tx.get("quizzes/" + quizId);
      if (!ledger || ledger.personId !== uid || !quiz || quiz.ownerId !== uid || quiz.generationJobId !== jobId) fail("permission-denied", "KI-Auftrag nicht zugeordnet.");
      if (ledger.state === "committed") {
        if (ledger.quizId !== quizId) fail("already-exists", "KI-Auftrag bereits gespeichert.");
        return { committed: false, code: quizId };
      }
      if (ledger.state !== "reserved" || ledger.expiresAtMs <= at || (ledger.funding === "trial" && ctx.account.reservedCount < 1)) fail("failed-precondition", "KI-Reservierung abgelaufen.");
      ctx.saveAccount({ reservedCount: ctx.account.reservedCount - (ledger.funding === "trial" ? 1 : 0), createdCount: ctx.account.createdCount + (ledger.funding === "trial" ? 1 : 0) });
      tx.patch("quizzes/" + quizId, { ...patch, billingScope: { kind: "personal", id: uid }, billingCreationState: "committed", billingLedgerId: ledgerKey.split("/")[1], updatedAt: new Date(at) });
      tx.patch(ledgerKey, { state: "committed", quizId, committedAtMs: at });
      return { committed: true, code: quizId };
    });
  }
  async function grantPremium(request) {
    const actor = await caller(request), at = now(), data = request.data || {};
    const personId = identifier(data.personId), id = requestId(data.requestId);
    const target = await identity(personId);
    const reason = String(data.reason || "").trim();
    if (reason.length < 3 || reason.length > 500 || (data.endsAtMs !== null && (!Number.isSafeInteger(data.endsAtMs) || data.endsAtMs <= at))) fail("invalid-argument", "Grund und gültiges Ende oder ausdrücklich unbefristet angeben.");
    const grantId = key(actor.uid, "manual", id);
    return store.transaction(async tx => {
      const ctx = await context(tx, actor); admin(ctx, request, at);
      if (!ctx.config.allowedUids.includes(personId)) fail("failed-precondition", "Zielkonto ist nicht im Zahlungstest.");
      const profile = await tx.get("users/" + personId), deletion = await tx.get("accountDeletions/" + personId);
      const previous = await tx.get("billingV2Grants/" + grantId);
      if (!profile || deletion || profile.accountDeletionId || (profile.status && profile.status !== "active") || !target.emailVerified) fail("failed-precondition", "Zielkonto nicht verfügbar.");
      if (previous) {
        if (previous.personId !== personId || previous.endsAtMs !== data.endsAtMs || previous.reason !== reason) fail("already-exists", "Anfrage-ID bereits anders verwendet.");
        return { grantId, replayed: true };
      }
      tx.create("billingV2Grants/" + grantId, { personId, source: "manual", scope: { kind: "personal", id: personId }, status: "active", startsAtMs: at, endsAtMs: data.endsAtMs, reason, createdBy: actor.uid, createdAtMs: at });
      tx.create("billingV2Audit/" + key("grant", grantId), { actorId: actor.uid, action: "complimentary_granted", personId, grantId, reason, atMs: at });
      return { grantId, replayed: false };
    });
  }
  async function revokePremium(request) {
    const actor = await caller(request), at = now(), data = request.data || {}, id = identifier(data.grantId);
    const reason = String(data.reason || "").trim();
    if (reason.length < 3 || reason.length > 500) fail("invalid-argument", "Grund erforderlich.");
    return store.transaction(async tx => {
      const ctx = await context(tx, actor); admin(ctx, request, at);
      const grant = await tx.get("billingV2Grants/" + id);
      if (!grant || grant.source !== "manual") fail("not-found", "Kostenlose Freigabe nicht gefunden.");
      if (grant.status === "revoked") return { revoked: false };
      tx.patch("billingV2Grants/" + id, { status: "revoked", revokedAtMs: at, revokedBy: actor.uid });
      tx.create("billingV2Audit/" + key("revoke", id), { actorId: actor.uid, action: "complimentary_revoked", personId: grant.personId, grantId: id, reason, atMs: at });
      return { revoked: true };
    });
  }
  return { getAccess, requireFeature, createQuiz, reserveGeneration, prepareGenerationReservation, releaseGeneration, finalizeGeneration, grantPremium, revokePremium };
}

module.exports = { createBillingService, BillingError, key, identifier, requestId };
