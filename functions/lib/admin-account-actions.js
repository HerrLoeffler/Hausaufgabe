"use strict";
const { createHash, randomUUID } = require("node:crypto");
const { HttpsError } = require("firebase-functions/v2/https");
const active = p => p?.role === "admin" && (!p.status || p.status === "active") && !p.accountDeletionId;
const deletesAccount = action => ["delete", "recover-delete"].includes(action);
const storedRow = row => ({id:row.id,fingerprint:row.fingerprint,identityFingerprint:row.identityFingerprint,code:row.code,...(row.recoverySourceId?{recoverySourceId:row.recoverySourceId,originalInitiatorId:row.originalInitiatorId,deletionIdentityFingerprint:row.deletionIdentityFingerprint}: {})});
const fail = (code, message) => { throw new HttpsError(code, message); };
function validateAction(data = {}) {
  const { action, value, targets } = data;
  if (!Array.isArray(targets) || !targets.length || targets.length > 20 || new Set(targets).size !== targets.length || targets.some(id => typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(id))) fail("invalid-argument", "Bitte 1–20 unterschiedliche Konten auswählen.");
  if (!(deletesAccount(action) || (action === "role" && ["admin", "teacher"].includes(value)) || (action === "status" && ["active", "suspended"].includes(value)) || (action === "archive" && typeof value === "boolean"))) fail("invalid-argument", "Ungültige Kontoaktion.");
  return { action, ...(!deletesAccount(action) ? { value } : {}), targets: [...targets].sort() };
}
function planAction(target, admins, action, caller, targets = [target.id]) {
  if (!target?.id) return {code:"missing"};
  if (target.id === caller) return {code:"self-protected"};
  if (target.accountDeletionId) return {code:"deletion-pending"};
  if (action.action === "role" && action.value === "admin" && target.isTestAccount === true) return {code:"test-account"};
  if (target.isTestAccountArchived === true && !["archive", "delete"].includes(action.action)) return {code:"archived-account"};
  if (action.action === "archive" && (target.isTestAccount !== true || target.role === "admin")) return {code:"test-account"};
  const removesAdmin = action.action === "delete" || (action.action === "role" && action.value !== "admin") || (action.action === "status" && action.value !== "active");
  if (active(target) && removesAdmin && !admins.some(p => active(p) && !targets.includes(p.id))) return {code:"last-admin"};
  return {code:"allowed"};
}
function fingerprint(p = {}) {
  // Bind identity and security state, not unrelated heartbeat/settings writes.
  return createHash("sha256").update(JSON.stringify([p.id,p.email||"",p.displayName||"",p.role||"teacher",p.status||"active",p.isTestAccount===true,p.isTestAccountArchived===true,p.accountDeletionId||""])).digest("hex");
}
function identityFingerprint(id, identity) {
  return createHash("sha256").update(JSON.stringify([id,identity?.email||"",identity?.metadata?.creationTime||"",!!identity])).digest("hex");
}
function createAccountActions({ db, auth, now = () => Date.now() }) {
  const lock = db.doc("accountActionControl/revision");
  async function requireCaller(request) {
    const uid = request.auth?.uid;
    if (!uid) fail("unauthenticated", "Bitte anmelden.");
    const identity = await auth.getUser(uid);
    const authTime = Number(request.auth.token?.auth_time || 0) * 1000;
    if (identity.disabled || !authTime || authTime < Date.parse(identity.tokensValidAfterTime || "1970-01-01")) fail("permission-denied", "Bitte erneut anmelden.");
    return uid;
  }
  async function read(tx, uid, spec) {
    const caller = await tx.get(db.doc(`users/${uid}`));
    if (!caller.exists || !active(caller.data())) fail("permission-denied", "Nur aktive Administratoren dürfen Konten verwalten.");
    const control = await tx.get(lock);
    const adminRows = await tx.get(db.collection("users").where("role", "==", "admin"));
    const rows = [];
    const recoverySources = new Map();
    for (const id of spec.targets) {
      const snap = await tx.get(db.doc(`users/${id}`));
      const p = snap.exists ? {...snap.data(),id} : {id,missing:true};
      let code = p.missing ? "missing" : planAction(p,adminRows.docs.map(s=>({...s.data(),id:s.id})),spec,uid,spec.targets).code;
      let recoverySourceId, originalInitiatorId, deletionIdentityFingerprint, sourceBinding = "";
      if (spec.action === "recover-delete") {
        const deletion = await tx.get(db.doc(`accountDeletions/${id}`));
        recoverySourceId = deletion.data()?.operationId;
        code = "not-recoverable";
        if (id === uid) code = "self-protected";
        else if (recoverySourceId && (!snap.exists || (p.accountDeletionId === recoverySourceId && p.status === "deleting"))) {
          const ref = db.doc(`accountActions/${recoverySourceId}`), source = (await tx.get(ref)).data();
          const outcome = source?.outcomes?.find(row => row.id === id), original = source?.rows?.find(row => row.id === id);
          if (source && deletesAccount(source.spec?.action) && Array.isArray(source.spec.targets) && source.spec.targets.includes(id) && ["running", "partial"].includes(source.status) && original?.code === "allowed" && typeof (original.deletionIdentityFingerprint || original.identityFingerprint) === "string" && ["pending", "failed"].includes(outcome?.code)) {
            code = source.leaseUntil > now() ? "deletion-running" : "allowed";
            originalInitiatorId = original.originalInitiatorId || source.uid;
            deletionIdentityFingerprint = original.deletionIdentityFingerprint || original.identityFingerprint;
            sourceBinding = JSON.stringify([snap.exists,recoverySourceId,source.uid,source.status,source.leaseId||"",source.leaseUntil||0,outcome.code,outcome.reason||"",deletionIdentityFingerprint]);
            recoverySources.set(recoverySourceId,{ref,data:source});
          } else recoverySourceId = undefined;
        } else recoverySourceId = undefined;
      }
      if (deletesAccount(spec.action) && code === "allowed") {
        const quizzes = await tx.get(db.collection("quizzes").where("ownerId", "==", id).limit(501));
        if (quizzes.size > 500) code = "scope-too-large";
        else if (quizzes.docs.some(s=>{const q=s.data();return q.published===true && q.ended!==true && q.isDeleted!==true;})) code = "active-exam";
      }
      if (deletesAccount(spec.action) && code === "allowed") {
        const jobs = await tx.get(db.collection("aiJobs").where("ownerId", "==", id).limit(101));
        if (jobs.size > 100) code = "scope-too-large";
        else if (jobs.docs.some(s => ["queued", "running"].includes(s.data().status))) code = "active-job";
      }
      let identity;
      try { identity = await auth.getUser(id); } catch (error) { if (error.code !== "auth/user-not-found") throw error; }
      const actualIdentityFingerprint = identityFingerprint(id,identity);
      if (spec.action === "recover-delete" && code === "allowed" && identity && actualIdentityFingerprint !== deletionIdentityFingerprint) code = "identity-changed";
      const boundFingerprint = sourceBinding ? createHash("sha256").update(fingerprint(p)+sourceBinding).digest("hex") : fingerprint(p);
      rows.push({id,label:p.displayName||identity?.displayName||p.email||id,email:identity?.email||p.email||"",fingerprint:boundFingerprint,identityFingerprint:actualIdentityFingerprint,code,profileExists:snap.exists,...(recoverySourceId&&originalInitiatorId?{recoverySourceId,originalInitiatorId,deletionIdentityFingerprint}: {})});
    }
    return {rows,revision:Number(control.data()?.revision||0),recoverySources};
  }
  async function preview(request) {
    const uid = await requireCaller(request), spec = validateAction(request.data), operationId = randomUUID();
    const expiresAt = now() + 5 * 60 * 1000;
    const rows = await db.runTransaction(async tx => {
      const {rows} = await read(tx,uid,spec);
      tx.create(db.doc(`accountActions/${operationId}`),{uid,spec,rows:rows.map(storedRow),expiresAt,status:"preview",createdAt:now()});
      return rows;
    });
    return {operationId,expiresAt,action:spec.action,value:spec.value??null,targets:rows.map(({id,label,email,code})=>({id,label,email,code})),extent:"Anmeldung, Profil, private Einstellungen, Cocos Kontogedächtnis/Bildsuchindex, private KI-Aufträge und persönliche Hinweis-Lesemarkierungen werden gelöscht. Tests, Abgaben und Ergebnisse sowie gemeinsame/fremde Daten bleiben erhalten."};
  }
  async function execute(request) {
    const uid = await requireCaller(request), operationId = request.data?.operationId;
    if (Object.keys(request.data || {}).some(key => key !== "operationId")) fail("invalid-argument", "Die Bestätigung erlaubt keine zusätzlichen Zielkonten.");
    if (typeof operationId !== "string" || !/^[a-f0-9-]{36}$/.test(operationId)) fail("invalid-argument", "Ungültige Bestätigung.");
    const opRef = db.doc(`accountActions/${operationId}`), leaseId = randomUUID();
    const op = await db.runTransaction(async tx => {
      const snap = await tx.get(opRef); const saved = snap.data();
      if (!saved || saved.uid !== uid) fail("permission-denied", "Diese Bestätigung gehört zu einem anderen Konto.");
      // Authorize even completed/retry requests using fresh profile and identity.
      const caller = await tx.get(db.doc(`users/${uid}`));
      if (!caller.exists || !active(caller.data())) fail("permission-denied", "Adminberechtigung fehlt.");
      if (saved.status === "complete") return saved;
      if (saved.leaseUntil > now()) fail("aborted", "Die Aktion läuft bereits. Bitte später erneut prüfen.");
      if (saved.status === "preview") {
        if (saved.expiresAt < now()) fail("failed-precondition", "Bestätigung ist abgelaufen. Bitte erneut auswählen.");
        const {rows,revision,recoverySources} = await read(tx,uid,saved.spec);
        if (rows.some((r,i)=>r.fingerprint!==saved.rows[i].fingerprint || r.identityFingerprint!==saved.rows[i].identityFingerprint || r.code!==saved.rows[i].code)) fail("failed-precondition", "Konten wurden inzwischen geändert. Bitte erneut bestätigen.");
        const outcomes = rows.map(({id,code})=>({id,code:code==="allowed"?(deletesAccount(saved.spec.action)?"pending":"complete"):code}));
        for(const row of rows.filter(r=>r.code==="allowed")) {
          const ref = db.doc(`users/${row.id}`), s=saved.spec;
          const patch = deletesAccount(s.action) ? {status:"deleting",accountDeletionId:operationId} : s.action==="role" ? {role:s.value} : s.action==="status" ? {status:s.value} : {isTestAccountArchived:s.value,status:s.value?"suspended":"active",testAccountArchivedAt:s.value?now():null,testAccountArchivedBy:s.value?uid:null};
          if(row.profileExists) tx.update(ref,patch);
          if(deletesAccount(s.action)) tx.set(db.doc(`accountDeletions/${row.id}`),{operationId,at:now()});
        }
        if (saved.spec.action === "recover-delete") {
          const accepted = rows.filter(row=>row.code==="allowed"), sourceIds = [...new Set(accepted.map(row=>row.recoverySourceId))];
          for (const sourceId of sourceIds) {
            const source = recoverySources.get(sourceId), selectedIds = new Set(accepted.filter(row=>row.recoverySourceId===sourceId).map(row=>row.id));
            source.data.outcomes = source.data.outcomes.map(outcome=>selectedIds.has(outcome.id)?{id:outcome.id,code:"transferred",transferOperationId:operationId}:outcome);
            source.data.status = source.data.outcomes.some(row=>["pending","failed"].includes(row.code)) ? "partial" : "complete";
            source.data.leaseId = randomUUID(); source.data.leaseUntil = 0;
            tx.set(source.ref,source.data);
          }
          if(accepted.length) tx.create(db.collection("adminAudit").doc(),{action:"account_deletion_recovered",actorId:uid,operationId,createdAt:new Date(now()),details:{sourceOperations:sourceIds,originalInitiators:[...new Set(accepted.map(row=>row.originalInitiatorId))],targets:accepted.map(row=>row.id)}});
        }
        tx.set(lock,{revision:revision+1});
        saved.outcomes=outcomes; saved.status=deletesAccount(saved.spec.action)?"running":"complete";
        // Minimal audit contains IDs/action/outcomes, never names/email/content.
        tx.create(db.collection("adminAudit").doc(),{action:"account_action_reserved",actorId:uid,operationId,createdAt:new Date(now()),details:{action:saved.spec.action,targets:saved.spec.targets}});
      }
      saved.rows=saved.rows.map(storedRow);
      saved.leaseId=leaseId;saved.leaseUntil=now()+330000;
      tx.set(opRef,saved);
      return saved;
    });
    if(op.status==="complete") return {operationId,status:"complete",outcomes:op.outcomes};
    for(const outcome of op.outcomes) {
      if(!["pending","failed"].includes(outcome.code)) continue;
      try {
        // A transfer invalidates the old worker before another target can be touched.
        await db.runTransaction(async tx=>{
          const latest=(await tx.get(opRef)).data(), tombstone=await tx.get(db.doc(`accountDeletions/${outcome.id}`)), profile=await tx.get(db.doc(`users/${outcome.id}`));
          if(latest?.leaseId!==leaseId || latest.leaseUntil<=now() || tombstone.data()?.operationId!==operationId || (profile.exists && profile.data().accountDeletionId!==operationId)) fail("aborted","Die Löschung wurde inzwischen übernommen. Bitte neu prüfen.");
        });
        // A retry must not delete a replacement/changed Auth identity under the same UID.
        let identity;
        try {identity=await auth.getUser(outcome.id);} catch(error) {if(error.code!=="auth/user-not-found")throw error;}
        if(identity && identityFingerprint(outcome.id,identity)!==(op.rows.find(row=>row.id===outcome.id).deletionIdentityFingerprint || op.rows.find(row=>row.id===outcome.id).identityFingerprint)) throw Object.assign(new Error("identity-changed"),{code:"identity-changed"});
        // Idempotent identity deletion; private cleanup must finish before success.
        try {await auth.updateUser(outcome.id,{disabled:true});await auth.revokeRefreshTokens(outcome.id);await auth.deleteUser(outcome.id);} catch(error) {if(error.code!=="auth/user-not-found")throw error;}
        for(const path of [`cocoMemory/${outcome.id}`,`cocoImageIndex/${outcome.id}`]) await db.recursiveDelete(db.doc(path));
        for (const collection of ["announcementViews", "aiRuntime", "aiUsage", "aiEvents", "aiUsageRollups"]) await db.recursiveDelete(db.collection(`users/${outcome.id}/${collection}`));
        for(;;) {
          const jobs=await db.collection("aiJobs").where("ownerId","==",outcome.id).limit(100).get();
          if(jobs.empty)break;
          const batch=db.batch();jobs.docs.forEach(s=>batch.delete(s.ref));await batch.commit();
        }
        await db.doc(`users/${outcome.id}`).delete();
        outcome.code="complete";delete outcome.reason;
      } catch (error) {if(error.code==="aborted")throw error;outcome.code="failed";if(error.code==="identity-changed")outcome.reason="identity-changed";}
      await db.runTransaction(async tx=>{
        const latest=(await tx.get(opRef)).data();
        if(latest.leaseId!==leaseId)fail("aborted","Eine Wiederholung hat die Aktion übernommen.");
        latest.outcomes=op.outcomes;tx.set(opRef,latest);
      });
    }
    const status=op.outcomes.some(o=>o.code==="failed")?"partial":"complete";
    await db.runTransaction(async tx=>{
      const latest=(await tx.get(opRef)).data();if(latest.leaseId!==leaseId)fail("aborted","Aktion übernommen.");
      tx.update(opRef,{status,outcomes:op.outcomes,leaseUntil:0});
      tx.create(db.collection("adminAudit").doc(),{action:"account_action_finished",actorId:uid,operationId,createdAt:new Date(now()),details:{status,outcomes:op.outcomes}});
    });
    return {operationId,status,outcomes:op.outcomes};
  }
  return {preview,execute};
}
module.exports = {validateAction,planAction,createAccountActions};
