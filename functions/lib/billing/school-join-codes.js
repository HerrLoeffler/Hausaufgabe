"use strict";
const {randomBytes} = require('node:crypto');

// Uses the existing canonical membership/seat transaction. No Auth SDK or
// Classroom access is introduced here; the adapter remains responsible for IO.
function createSchoolJoinCodeOperations({store, now, caller, context, fail, key, identifier, requestId, schoolContext, pending, capacity}) {
  const schoolPath = id => 'billingV2Schools/' + id;
  const codePath = id => 'billingV2SchoolJoinCodes/' + id;
  const memberPath = (schoolId, uid) => 'billingV2Memberships/' + key(schoolId, uid);
  const receiptPath = (schoolId, uid) => 'billingV2SchoolCodeRedemptions/' + key(schoolId, uid);
  function normalize(value) {
    if (typeof value !== 'string' || value.length > 100) fail('invalid-argument', 'Bitte den vollständigen Schulcode eingeben.');
    const raw = value.replace(/[\s-]/g, '').toUpperCase();
    if (!/^[A-F0-9]{32}$/.test(raw)) fail('invalid-argument', 'Bitte den vollständigen Schulcode eingeben.');
    return key('school-join-code', raw);
  }
  function verified(actor, ctx) {
    if (!actor.emailVerified || actor.disabled || !ctx.person.emailVerified || (ctx.person.status && ctx.person.status !== 'active')) {
      fail('permission-denied', 'Bitte mit einem aktiven Lehrerkonto und bestätigter E-Mail-Adresse anmelden.');
    }
  }
  async function limitedCaller(request) {
    const actor = await caller(request);
    // Separate committed transaction: invalid guesses cannot roll back their
    // counter together with a subsequently rejected redemption transaction.
    await store.transaction(async tx => {
      const ctx = await context(tx, actor); verified(actor, ctx);
      const path = 'billingV2SchoolCodeRateLimits/' + key(actor.uid);
      const previous = await tx.get(path), at = now();
      const ongoing = previous && previous.windowStartMs <= at && previous.windowStartMs + 600000 > at;
      const count = ongoing ? previous.count : 0;
      if (!Number.isInteger(count) || count < 0 || count >= 20) fail('resource-exhausted', 'Zu viele Codeversuche. Bitte in einigen Minuten erneut versuchen.');
      tx.put(path, {windowStartMs: ongoing ? previous.windowStartMs : at, count: count + 1});
    });
    return actor;
  }
  async function currentCode(tx, codeId) {
    const code = await tx.get(codePath(codeId));
    if (!code) fail('not-found', 'Schulcode nicht gefunden.');
    const school = await tx.get(schoolPath(identifier(code.schoolId)));
    if (code.status !== 'active' || code.expiresAtMs <= now() || !school || school.status !== 'active' || school.activeJoinCodeId !== codeId) {
      fail('failed-precondition', 'Dieser Schulcode ist nicht mehr gültig. Bitte die Schulverwaltung fragen.');
    }
    return {code, school};
  }
  async function createSchoolJoinCode(request) {
    const actor = await caller(request), data = request.data || {}, id = identifier(data.schoolId), rid = requestId(data.requestId);
    const raw = randomBytes(16).toString('hex').toUpperCase(), codeId = key('school-join-code', raw);
    const expiresAtMs = now() + 7 * 86400000;
    const auditId = key('school_code_created', id, actor.uid, rid);
    return store.transaction(async tx => {
      const access = await schoolContext(tx, actor, id, {manage: true}); verified(actor, access.ctx);
      const previous = await tx.get('billingV2Audit/' + auditId);
      const oldId = access.school.activeJoinCodeId;
      const old = oldId ? await tx.get(codePath(identifier(oldId))) : null;
      if (previous) return {schoolId: id, codeId: previous.codeId, expiresAtMs: previous.expiresAtMs, replayed: true, requiresReissue: true};
      if (old && old.schoolId !== id) fail('failed-precondition', 'Schulcode-Zuordnung muss geprüft werden.');
      if (old) tx.patch(codePath(oldId), {status: 'rotated', closedAtMs: now()});
      tx.create(codePath(codeId), {schoolId: id, status: 'active', createdBy: actor.uid, createdAtMs: now(), expiresAtMs});
      tx.patch(schoolPath(id), {activeJoinCodeId: codeId});
      tx.create('billingV2Audit/' + auditId, {action: 'school_code_created', schoolId: id, actorId: actor.uid, codeId, atMs: now(), expiresAtMs});
      return {schoolId: id, codeId, code: raw.match(/.{4}/g).join('-'), expiresAtMs, replayed: false};
    });
  }
  async function revokeSchoolJoinCode(request) {
    const actor = await caller(request), id = identifier(request.data?.schoolId), codeId = identifier(request.data?.codeId);
    return store.transaction(async tx => {
      const access = await schoolContext(tx, actor, id, {manage: true}); verified(actor, access.ctx);
      const code = await tx.get(codePath(codeId));
      if (!code || code.schoolId !== id || access.school.activeJoinCodeId !== codeId) fail('failed-precondition', 'Der Schulcode wurde inzwischen geändert. Bitte die Schule neu laden.');
      if (code.status !== 'active') return {revoked: false};
      tx.patch(codePath(codeId), {status: 'revoked', closedAtMs: now()});
      tx.create('billingV2Audit/' + key('school_code_revoked', codeId), {action: 'school_code_revoked', schoolId: id, actorId: actor.uid, codeId, atMs: now()});
      return {revoked: true};
    });
  }
  async function previewSchoolJoinCode(request) {
    const actor = await limitedCaller(request), codeId = normalize(request.data?.code);
    return store.transaction(async tx => {
      const ctx = await context(tx, actor); verified(actor, ctx);
      const {school} = await currentCode(tx, codeId);
      return {schoolId: school.id, schoolName: school.name, role: 'teacher'};
    });
  }
  async function redeemSchoolJoinCode(request) {
    const actor = await limitedCaller(request), codeId = normalize(request.data?.code);
    return store.transaction(async tx => {
      const ctx = await context(tx, actor); verified(actor, ctx);
      const {school} = await currentCode(tx, codeId), id = school.id;
      const membership = await tx.get(memberPath(id, actor.uid)), receipt = await tx.get(receiptPath(id, actor.uid));
      if (membership?.status === 'active') return {schoolId: id, alreadyMember: true, role: membership.role};
      if (membership || receipt) fail('failed-precondition', 'Deine frühere Schulzuordnung wurde beendet. Bitte die Schulverwaltung um erneute Zuordnung bitten.');
      const invitations = await pending(tx, school);
      await capacity(tx, actor.uid);
      const nextMember = {schoolId: id, personId: actor.uid, email: actor.email, role: 'teacher', status: 'active', seatAssigned: true, joinedAtMs: now()};
      const target = await context(tx, actor, undefined, {membershipChanges: [nextMember]});
      if (!Number.isInteger(school.seats) || !Number.isInteger(school.usedSeats) || school.usedSeats < 0 || school.usedSeats + invitations.reservedSeats >= school.seats) {
        fail('resource-exhausted', 'Alle Lehrkraftplätze sind belegt oder reserviert. Bitte die Schulverwaltung fragen.');
      }
      invitations.expire(); target.saveAccount();
      tx.patch(schoolPath(id), {usedSeats: school.usedSeats + 1, reservedSeats: invitations.reservedSeats});
      tx.create(memberPath(id, actor.uid), nextMember);
      tx.create(receiptPath(id, actor.uid), {schoolId: id, personId: actor.uid, codeId, redeemedAtMs: now()});
      tx.create('billingV2Audit/' + key('school_code_redeemed', id, actor.uid), {action: 'school_code_redeemed', schoolId: id, actorId: actor.uid, codeId, atMs: now()});
      return {schoolId: id, alreadyMember: false, role: 'teacher'};
    });
  }
  return {createSchoolJoinCode, revokeSchoolJoinCode, previewSchoolJoinCode, redeemSchoolJoinCode};
}
module.exports = {createSchoolJoinCodeOperations};
