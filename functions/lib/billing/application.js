"use strict";

const { createHash, randomBytes } = require("node:crypto");
const { evaluateAccess, trialForRegistration } = require("./domain/access");
const { PERSONAL_PLANS } = require("./domain/catalog");

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
function cleanBundle(value){
  if(value===undefined)return null;
  if(!Array.isArray(value)||value.length>100||Buffer.byteLength(JSON.stringify(value))>4000000)fail("invalid-argument","Höchstens 100 Aufgaben und 4 MB pro Kopie oder Import sind im Testbetrieb möglich.");
  return value.map((item,index)=>{
    if(!item||typeof item!=="object"||Array.isArray(item))fail("invalid-argument","Ungültige Aufgabe.");
    const id="q"+String(index+1).padStart(3,"0"),question=JSON.parse(JSON.stringify(item)),script=String(item.audioScript||"").trim(),solutionScript=String(item.solutionAudioScript||"").trim();
    if(script.length>500||solutionScript.length>500||Buffer.byteLength(JSON.stringify(question))>850000)fail("invalid-argument","Aufgabe oder privater Hörtext ist zu lang.");
    for(const field of["audioScript","solutionAudioScript","solutionScript","solutionAudioDataUrl","solutionAudioAiGenerated","solutionAudioModel","solutionAudioVoice","solutionAudioByteSize","ownerId","createdAt","updatedAt"])delete question[field];
    return{id,question:{...question,id,position:index+1},audio:script||solutionScript?{...(script?{script}:{}),...(solutionScript?{solutionScript,solutionNeedsRegeneration:true}:{})}:null};
  });
}

function createBillingService({ store, now = Date.now, getIdentity, projectId }) {
  if (!["gradecrew-staging-2026", "demo-gradecrew-billing"].includes(projectId)) fail("failed-precondition", "Zahlungsintegration nur für die getrennte Testumgebung.");
  if (!store?.transaction || typeof getIdentity !== "function") throw new TypeError("Store and identity adapter required");

  function projectWrites(tx, uid, account, person, grants, primarySchoolMembershipId) {
    const access = evaluateAccess({ person, account, grants, scope: { kind: "personal", id: uid }, at: now() });
    tx.put("billingV2Accounts/" + uid, { ...account, emailVerified: person.emailVerified === true, primarySchoolMembershipId: primarySchoolMembershipId === undefined ? account.primarySchoolMembershipId || null : primarySchoolMembershipId,
      writesUntilMs: access.featureCodes.includes("test.edit") ? (access.validUntil ?? Date.UTC(9999, 11, 31)) : 0 });
  }

  async function identity(uid, { includeDisabled = false } = {}) {
    identifier(uid);
    const record = await getIdentity(uid);
    if (!record || record.uid !== uid || (record.disabled && !includeDisabled)) fail("permission-denied", "Konto nicht aktiv.");
    const registeredAtMs = Date.parse(record.metadata?.creationTime);
    if (!Number.isSafeInteger(registeredAtMs) || registeredAtMs < 0) fail("failed-precondition", "Registrierungszeit fehlt.");
    return { uid, registeredAtMs, disabled: record.disabled === true, email: String(record.email || "").toLowerCase(), emailVerified: record.emailVerified === true };
  }
  async function caller(request) {
    if (!request?.auth?.uid) fail("unauthenticated", "Bitte anmelden.");
    return identity(request.auth.uid);
  }
  function admin(ctx, request, at) {
    const authTime = request.auth?.token?.auth_time;
    if (ctx.person.role !== "admin" || !ctx.person.emailVerified || !Number.isFinite(authTime) || authTime * 1000 < at - 900000 || authTime * 1000 > at + 60000) fail("permission-denied", "Für diese Änderung bitte als Administrator erneut anmelden.");
  }
  async function context(tx, actor, scope = { kind: "personal", id: actor.uid }, { includeInactive = false, membershipChanges = [] } = {}) {
    if (!scope || typeof scope !== "object" || !["personal", "school"].includes(scope.kind)) fail("invalid-argument", "Ungültiger Arbeitsbereich.");
    identifier(scope.id);
    if (scope.kind === "personal" && scope.id !== actor.uid) fail("permission-denied", "Fremder Arbeitsbereich.");
    const config = await tx.get("appConfig/billingProduct");
    if (config?.enabled !== true || !Array.isArray(config.allowedUids) || !config.allowedUids.includes(actor.uid)) fail("failed-precondition", "Dieses Konto ist noch nicht für den abgegrenzten Zahlungstest freigegeben.");
    const profile = await tx.get("users/" + actor.uid);
    const deletion = await tx.get("accountDeletions/" + actor.uid);
    if (!profile || (!includeInactive && (deletion || profile.accountDeletionId || profile.isTestAccountArchived || (profile.status && profile.status !== "active") || !["teacher", "admin"].includes(profile.role)))) fail("permission-denied", "Konto nicht aktiv.");
    const account = await tx.get("billingV2Accounts/" + actor.uid) || trialForRegistration(actor.registeredAtMs);
    if (account.trialStartedAtMs !== actor.registeredAtMs) fail("failed-precondition", "Unstimmiger Testzeitraum.");
    const grants = await tx.find("billingV2Grants", [["personId", "==", actor.uid], ["status", "==", "active"]], 51);
    if (grants.length > 50) fail("failed-precondition", "Zu viele aktive Freigaben, bitte prüfen.");
    const person = { ...profile, id: actor.uid, emailVerified: actor.emailVerified,
      ...(deletion ? { accountDeletionId: "deleted" } : {}), ...(actor.disabled ? { status: "disabled" } : {}) };
    const memberships = [], seats = [], periods = [];
    let candidates = await tx.find("billingV2Memberships", [["personId", "==", actor.uid], ["status", "==", "active"]], 21);
    for (const change of membershipChanges) { candidates = candidates.filter(item => item.schoolId !== change.schoolId); if (change.status === "active") candidates.push(change); }
    if (candidates.length > 20) fail("resource-exhausted", "Höchstens 20 aktive Schulzuordnungen sind im Testbetrieb möglich.");
    for (const membership of candidates) {
      const schoolId = identifier(membership.schoolId);
      const school = await tx.get("billingV2Schools/" + schoolId);
      if (school?.status !== "active") continue;
      memberships.push({ ...membership, id: key(schoolId, actor.uid) });
      if (school.currentPeriodId) {
        const period = await tx.get("billingV2Periods/" + identifier(school.currentPeriodId));
        if (period) {
          periods.push({ ...period, id: school.currentPeriodId });
          if (membership.seatAssigned === true) seats.push({ personId: actor.uid, schoolId, periodId: school.currentPeriodId, status: "active" });
        }
      }
    }
    const schoolMember = memberships.map(member => ({member,access:evaluateAccess({ person, account, memberships, seats, periods, scope: { kind: "school", id: member.schoolId }, at: now() })}))
      .filter(item => item.access.tier === "school").sort((a,b) => b.access.validUntil - a.access.validUntil)[0]?.member;
    const canonicalScope = scope.kind === "school" ? { kind: "school", id: scope.id, membershipId: key(scope.id, actor.uid) } : { kind: "personal", id: actor.uid };
    return { person, scope: canonicalScope, account, grants, memberships, seats, periods, config,
      saveAccount: changes => projectWrites(tx, actor.uid, { ...account, ...changes }, person, grants, schoolMember?.id || null) };
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
      return { ...access, enforced: true, policyVersion: "trial14-files5-v2", plans: PERSONAL_PLANS, purchasingEnabled: false };
    });
  }
  async function requireFeature(uid, feature, scope) {
    const actor = await identity(uid), at = now();
    // Ownership is authorized by the caller. Funding attribution on an existing
    // file must not discard another valid personal or school entitlement.
    const workingScope = ["test.edit", "test.publish", "test.read", "test.export"].includes(feature) ? undefined : scope;
    return store.transaction(async tx => { const ctx = await context(tx, actor, workingScope); const access = requireDecision(ctx, at, feature); ctx.saveAccount(); return access; });
  }
  async function inspectAccess(request) {
    const actor = await caller(request);
    const personId = identifier(request.data?.personId);
    return store.transaction(async tx => {
      const operator = await context(tx, actor);
      if (operator.person.role !== "admin" || operator.person.emailVerified !== true) fail("permission-denied", "Nur für Administratoren.");
      const target = await identity(personId, { includeDisabled: true });
      const targetContext = await context(tx, target, undefined, { includeInactive: true });
      const grants = targetContext.grants.filter(item => item.source === "manual")
        .map(item => ({ id: item.id, reason: item.reason, startsAtMs: item.startsAtMs, endsAtMs: item.endsAtMs }));
      return { access: decision(targetContext, now()), grants };
    });
  }
  async function createQuiz(request) {
    const actor = await caller(request), at = now(), data = request.data || {};
    const id = requestId(data.requestId);
    if (!["manual", "copy", "import", "ai"].includes(data.kind)) fail("invalid-argument", "Erstellungsart fehlt.");
    const quiz = cleanQuiz(data.quiz);
    const bundle=cleanBundle(data.questions);
    const fingerprint = key(data.kind, quiz, data.scope || { kind: "personal", id: actor.uid },bundle);
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
      if(bundle){record.questionCount=bundle.length;record.totalPoints=Math.round(bundle.reduce((sum,item)=>sum+(Number.isFinite(Number(item.question.points))?Math.max(0,Number(item.question.points)):0),0)*10)/10;}
      tx.create("quizzes/" + code, record);
      if(bundle){
        for(const item of bundle){tx.create("quizzes/"+code+"/questions/"+item.id,{...item.question,updatedAt:new Date(at)});if(item.audio)tx.create("quizzes/"+code+"/audioScripts/"+item.id,{...item.audio,updatedAt:new Date(at)});}
      }
      tx.create(ledgerKey, { personId: actor.uid, requestId: id, fingerprint, kind: data.kind, funding, sourceIds: access.sourceIds, state: "committed", quizId: code, createdAtMs: at, committedAtMs: at });
      return { code, replayed: false };
    });
  }
  async function prepareGenerationReservation(uid, jobId, tx, { expiredJobIds = [] } = {}) {
    const actor = await identity(uid), at = now(); identifier(jobId);
    const ctx = await context(tx, actor);
    const ledgerKey = "billingV2Ledger/" + key(uid, "generation", jobId);
    const previous = await tx.get(ledgerKey);
    const stale=[];
    for(const expiredId of [...new Set(expiredJobIds)].filter(id=>id!==jobId)){
      identifier(expiredId);const path="billingV2Ledger/"+key(uid,"generation",expiredId),ledger=await tx.get(path);
      if(ledger?.state==="reserved"&&ledger.personId===uid)stale.push({path,ledger});
    }
    const refunded=stale.filter(item=>item.ledger.funding==="trial").length;
    if(refunded>ctx.account.reservedCount)fail("failed-precondition","Reservierungen bitte prüfen.");
    ctx.account={...ctx.account,reservedCount:ctx.account.reservedCount-refunded};
    const releaseStale=()=>{for(const item of stale)tx.patch(item.path,{state:"released",releasedAtMs:at,releaseReason:"stale_job"});};
    if (previous) {
      if (!["reserved", "committed"].includes(previous.state)) fail("failed-precondition", "Dieser KI-Auftrag wurde bereits beendet.");
      return () => {if(stale.length){ctx.saveAccount({reservedCount:ctx.account.reservedCount});releaseStale();}};
    }
    const access = requireDecision(ctx, at, "test.create");
    const funding = access.tier === "trial" ? "trial" : "entitled";
    return () => {
      ctx.saveAccount({ reservedCount: ctx.account.reservedCount + (funding === "trial" ? 1 : 0) });
      releaseStale();
      tx.create(ledgerKey, { personId: uid, jobId, kind: "ai", state: "reserved", funding, createdAtMs: at, expiresAtMs: at + 7200000 });
    };
  }
  async function reserveGeneration(uid, jobId) {
    return store.transaction(async tx => { const apply = await prepareGenerationReservation(uid, jobId, tx); apply(); });
  }
  async function prepareGenerationRelease(uid, jobId, tx) {
    identifier(uid); identifier(jobId);
      const ledgerKey = "billingV2Ledger/" + key(uid, "generation", jobId);
      const ledger = await tx.get(ledgerKey), account = await tx.get("billingV2Accounts/" + uid);
      if (!ledger || ledger.state !== "reserved") return () => ({ released: false });
      if (!account || ledger.personId !== uid || (ledger.funding === "trial" && account.reservedCount < 1)) fail("failed-precondition", "Reservierung bitte prüfen.");
      return () => {tx.put("billingV2Accounts/" + uid, { ...account, reservedCount: account.reservedCount - (ledger.funding === "trial" ? 1 : 0) });
        tx.patch(ledgerKey, { state: "released", releasedAtMs: now() });return { released: true };};
  }
  async function releaseGeneration(uid, jobId) {
    return store.transaction(async tx => {const apply=await prepareGenerationRelease(uid,jobId,tx);return apply();});
  }
  async function failGeneration(uid,jobId,quizId,jobPatch) {
    identifier(uid);identifier(jobId);if(quizId)identifier(quizId);
    return store.transaction(async tx=>{
      const job=await tx.get("aiJobs/"+jobId),actualQuizId=job?.quizId||quizId;
      if(actualQuizId)identifier(actualQuizId);
      const ledger=await tx.get("billingV2Ledger/"+key(uid,"generation",jobId)),quiz=actualQuizId?await tx.get("quizzes/"+actualQuizId):null;
      if(!job||job.ownerId!==uid||(quiz&&quiz.ownerId!==uid))fail("permission-denied","KI-Auftrag nicht zugeordnet.");
      if(ledger?.state==="committed"&&quiz?.billingCreationState==="committed"&&quiz.generationStatus==="ready"){
        tx.patch("aiJobs/"+jobId,{status:"ready",stage:"ready",percent:100,quizId:actualQuizId,updatedAt:new Date(now())});return{completed:true};
      }
      const apply=await prepareGenerationRelease(uid,jobId,tx);
      apply();tx.patch("aiJobs/"+jobId,{...jobPatch,status:"failed",stage:"failed",updatedAt:new Date(now())});
      if(quiz)tx.patch("quizzes/"+actualQuizId,{generationStatus:"failed",updatedAt:new Date(now())});
      return{completed:false};
    });
  }
  async function finalizeGeneration(uid, jobId, quizId, patch, jobPatch) {
    const actor = await identity(uid), at = now(); identifier(jobId); identifier(quizId);
    return store.transaction(async tx => {
      const ctx = await context(tx, actor);
      const ledgerKey = "billingV2Ledger/" + key(uid, "generation", jobId);
      const ledger = await tx.get(ledgerKey), quiz = await tx.get("quizzes/" + quizId);
      const job=jobPatch?await tx.get("aiJobs/"+jobId):null;
      if(jobPatch&&(!job||job.ownerId!==uid||!["queued","running","ready"].includes(job.status)))fail("failed-precondition","KI-Auftrag bereits beendet.");
      if (!ledger || ledger.personId !== uid || !quiz || quiz.ownerId !== uid || quiz.generationJobId !== jobId) fail("permission-denied", "KI-Auftrag nicht zugeordnet.");
      if (ledger.state === "committed") {
        if (ledger.quizId !== quizId) fail("already-exists", "KI-Auftrag bereits gespeichert.");
        return { committed: false, code: quizId };
      }
      if (ledger.state !== "reserved" || ledger.expiresAtMs <= at || (ledger.funding === "trial" && ctx.account.reservedCount < 1)) fail("failed-precondition", "KI-Reservierung abgelaufen.");
      ctx.saveAccount({ reservedCount: ctx.account.reservedCount - (ledger.funding === "trial" ? 1 : 0), createdCount: ctx.account.createdCount + (ledger.funding === "trial" ? 1 : 0) });
      tx.patch("quizzes/" + quizId, { ...patch, billingScope: { kind: "personal", id: uid }, billingCreationState: "committed", billingLedgerId: ledgerKey.split("/")[1], updatedAt: new Date(at) });
      tx.patch(ledgerKey, { state: "committed", quizId, committedAtMs: at });
      if(jobPatch)tx.patch("aiJobs/"+jobId,{...jobPatch,status:"ready",stage:"ready",quizId,updatedAt:new Date(at)});
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
      const targetCtx = await context(tx, target);
      const grant = { personId, source: "manual", scope: { kind: "personal", id: personId }, status: "active", startsAtMs: at, endsAtMs: data.endsAtMs, reason, createdBy: actor.uid, createdAtMs: at };
      targetCtx.grants.push({ ...grant, id: grantId });
      targetCtx.saveAccount();
      tx.create("billingV2Grants/" + grantId, grant);
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
      const personId = identifier(grant.personId);
      const account = await tx.get("billingV2Accounts/" + personId);
      const profile = await tx.get("users/" + personId);
      const deleted = await tx.get("accountDeletions/" + personId);
      const grants = await tx.find("billingV2Grants", [["personId", "==", personId], ["status", "==", "active"]], 51);
      if (account) projectWrites(tx, personId, account, { ...profile, id: personId, status: profile?.status || "active", role: profile?.role || "missing", emailVerified: account.emailVerified === true,
        accountDeletionId: deleted ? "deleted" : profile?.accountDeletionId }, grants.filter(g => g.id !== id));
      tx.patch("billingV2Grants/" + id, { status: "revoked", revokedAtMs: at, revokedBy: actor.uid });
      tx.create("billingV2Audit/" + key("revoke", id), { actorId: actor.uid, action: "complimentary_revoked", personId: grant.personId, grantId: id, reason, atMs: at });
      return { revoked: true };
    });
  }
  const schools = require("./schools").createSchoolOperations({ store, now, caller, context, admin, identity, fail, key, identifier, requestId });
  return { ...schools, getAccess, inspectAccess, requireFeature, createQuiz, reserveGeneration, prepareGenerationReservation, prepareGenerationRelease, releaseGeneration, failGeneration, finalizeGeneration, grantPremium, revokePremium };
}

module.exports = { createBillingService, BillingError, key, identifier, requestId };
