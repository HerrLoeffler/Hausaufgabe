"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createEmailVerification } = require("../lib/email-verification");

function fixture() {
  let time = 1800000000000, revision = 0, sequence = 0;
  const records = new Map(), mails = [], updates = [];
  let user = { uid: "u1", email: "teacher@example.invalid", displayName: "Synthetic Teacher", emailVerified: false };
  const db = { doc: path => path, runTransaction: async run => {
    for (;;) {
      const version = revision, writes = [];
      const result = await run({ get: async ref => ({ exists: records.has(ref), data: () => structuredClone(records.get(ref)) }),
        set: (ref, value) => writes.push([ref, structuredClone(value)]), update: (ref, value) => writes.push([ref, { ...records.get(ref), ...structuredClone(value) }]) });
      if (version !== revision) continue;
      if (writes.length) { for (const [ref, value] of writes) records.set(ref, value); revision++; }
      return result;
    }
  } };
  const auth = { getUser: async () => ({ ...user }), updateUser: async (_uid, patch) => { updates.push(patch); Object.assign(user, patch); } };
  let send = async value => { mails.push(value); };
  const service = createEmailVerification({ db, auth, secret: "s".repeat(64), now: () => time,
    code: () => String(++sequence).padStart(6, "0"), nonce: () => "nonce-" + sequence, sendMail: value => send(value) });
  return { service, records, mails, updates, auth, advance: ms => { time += ms; }, setUser: patch => Object.assign(user, patch),
    setSend: fn => { send = fn; }, request: data => ({ auth: { uid: "u1" }, rawRequest: { ip: "192.0.2.1" }, data: {accountUid:"u1",...data} }) };
}

test("request binds to Auth email, stores no plain code and leaves profile pending", async () => {
  const f=fixture(),result=await f.service.requestCode(f.request({email:"attacker@example.invalid"}));
  assert.equal(f.mails[0].to,"teacher@example.invalid");assert.equal(f.mails[0].code,"000001");
  assert.equal(f.records.get("users/u1").status,"pending_verification");
  assert.equal(JSON.stringify([...f.records.values()]).includes('000001'),false);
  assert.equal(result.sent,true);assert.equal(result.retryAfterSeconds,60);assert.equal(result.code,undefined);
});
test("valid code verifies the bound Firebase address and activates the same profile once",async()=>{
  const f=fixture();await f.service.requestCode(f.request());
  assert.deepEqual(await f.service.confirmCode(f.request({code:"000001"})),{verified:true});
  assert.deepEqual(f.updates,[{email:"teacher@example.invalid",emailVerified:true}]);
  assert.equal(f.records.get("users/u1").status,"active");
  assert.equal(f.records.get("emailVerifications/u1").digest,null);
  assert.deepEqual(await f.service.confirmCode(f.request({code:"000001"})),{verified:true});
  assert.equal(f.updates.length,1);
});
test("five incorrect attempts persist; correct code cannot bypass exhausted or expired challenge",async()=>{
  const f=fixture();await f.service.requestCode(f.request());
  for(let i=0;i<5;i++)await assert.rejects(f.service.confirmCode(f.request({code:"999999"})),{code:"invalid-argument"});
  await assert.rejects(f.service.confirmCode(f.request({code:"000001"})),{code:"resource-exhausted"});assert.equal(f.updates.length,0);
  const g=fixture();await g.service.requestCode(g.request());g.advance(600001);
  await assert.rejects(g.service.confirmCode(g.request({code:"000001"})),{code:"deadline-exceeded"});
});
test("resending observes cooldown, invalidates old code and enforces hourly send quota",async()=>{
  const f=fixture();await f.service.requestCode(f.request());
  await f.service.requestCode(f.request());assert.equal(f.mails.length,1);
  f.advance(60000);await f.service.requestCode(f.request());
  await assert.rejects(f.service.confirmCode(f.request({code:"000001"})),{code:"invalid-argument"});
  for(let i=0;i<3;i++){f.advance(60000);await f.service.requestCode(f.request());}
  f.advance(60000);await assert.rejects(f.service.requestCode(f.request()),{code:"resource-exhausted"});
});
test("concurrent requests send one code; parallel wrong guesses cannot exceed attempt budget",async()=>{
  const f=fixture();await Promise.all([f.service.requestCode(f.request()),f.service.requestCode(f.request())]);assert.equal(f.mails.length,1);
  await Promise.allSettled(Array.from({length:12},()=>f.service.confirmCode(f.request({code:"999999"}))));
  assert.equal(f.records.get("emailVerifications/u1").attempts,0);assert.equal(f.updates.length,0);
});
test("unauthenticated, disabled, deleted and suspended accounts cannot request or activate",async()=>{
  for(const kind of ["unauthenticated","disabled","deleted","suspended"]){
    const f=fixture();if(kind==="disabled")f.setUser({disabled:true});
    if(kind==="deleted")f.records.set("accountDeletions/u1",{operationId:"deleted"});
    if(kind==="suspended")f.records.set("users/u1",{status:"suspended",role:"teacher"});
    await assert.rejects(f.service.requestCode(kind==="unauthenticated"?{}:f.request()));assert.equal(f.mails.length,0);
  }
  const f=fixture();await f.service.requestCode(f.request());f.records.get("users/u1").status="suspended";
  await assert.rejects(f.service.confirmCode(f.request({code:"000001"})));assert.equal(f.updates.length,0);
});
test("delivery failure leaves no valid challenge; changed recipient cannot use old code",async()=>{
  const f=fixture();f.setSend(async()=>{throw Error("provider rejected sensitive data");});
  await assert.rejects(f.service.requestCode(f.request()),{code:"unavailable"});assert.equal(f.records.get("emailVerifications/u1").digest,null);
  const g=fixture();await g.service.requestCode(g.request());g.setUser({email:"other@example.invalid"});
  await assert.rejects(g.service.confirmCode(g.request({code:"000001"})),{code:"failed-precondition"});assert.equal(g.updates.length,0);
});
test("Firebase success followed by a transient profile failure can be resumed safely",async()=>{
  const f=fixture();await f.service.requestCode(f.request());
  const update=f.auth.updateUser;f.auth.updateUser=async(...args)=>{await update(...args);throw Error("lost response");};
  await assert.rejects(f.service.confirmCode(f.request({code:"000001"})));
  assert.deepEqual(await f.service.confirmCode(f.request({code:"000001"})),{verified:true});assert.equal(f.records.get("users/u1").status,"active");
});
test("stale account identity cannot send or consume a code with another Auth session",async()=>{
 const f=fixture();await assert.rejects(f.service.requestCode(f.request({accountUid:"other"})),{code:"permission-denied"});assert.equal(f.mails.length,0);
 await f.service.requestCode(f.request());await assert.rejects(f.service.confirmCode(f.request({accountUid:"other",code:"000001"})),{code:"permission-denied"});assert.equal(f.updates.length,0);
});
test("a newly Firebase-verified address recovers a pending profile despite an older challenge",async()=>{
 const f=fixture();await f.service.requestCode(f.request());f.setUser({email:"new@example.invalid",emailVerified:true});
 assert.deepEqual(await f.service.requestCode(f.request()),{verified:true});assert.equal(f.records.get("users/u1").status,"active");assert.equal(f.records.get("users/u1").email,"new@example.invalid");assert.equal(f.records.get("emailVerifications/u1").digest,null);
});
