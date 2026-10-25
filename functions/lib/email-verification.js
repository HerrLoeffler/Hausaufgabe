"use strict";
const { createHmac, randomInt, randomUUID, timingSafeEqual } = require("node:crypto");
const MINUTE = 60000, HOUR = 60 * MINUTE, DAY = 24 * HOUR;
function fail(code, message) { const error = new Error(message); error.code = code; throw error; }

function createEmailVerification({db, auth, sendMail, secret, now=Date.now,
  code=()=>String(randomInt(0,1000000)).padStart(6,"0"), nonce=randomUUID}) {
  const hash = value => createHmac("sha256",secret).update(value).digest("hex");
  const digest = (uid,email,id,value) => hash(JSON.stringify([uid,email,id,value]));
  const address = user => String(user.email||"").trim().toLowerCase();
  async function identity(request) {
    if(!request.auth?.uid)fail("unauthenticated","Bitte anmelden.");
    if(request.data?.accountUid!==request.auth.uid)fail("permission-denied","Das angemeldete Konto wurde gewechselt. Bitte erneut anmelden.");
    if(typeof secret!=="string"||secret.length<32)fail("failed-precondition","Der E-Mail-Versand ist noch nicht eingerichtet.");
    const user=await auth.getUser(request.auth.uid);
    if(user.disabled||!address(user)||address(user).length>254)fail("permission-denied","Dieses Konto kann nicht bestätigt werden.");
    return user;
  }
  async function account(tx,uid) {
    const ref=db.doc(`users/${uid}`),snap=await tx.get(ref),deleted=await tx.get(db.doc(`accountDeletions/${uid}`)),profile=snap.data()||{};
    if(deleted.exists||profile.accountDeletionId||![undefined,"active","pending_verification"].includes(profile.status))fail("permission-denied","Konto nicht aktiv.");
    if(profile.role&&!['teacher','admin'].includes(profile.role))fail("permission-denied","Dieses Konto kann nicht bestätigt werden.");
    return {ref,profile,exists:snap.exists};
  }
  function newProfile(user) { return {displayName:String(user.displayName||"").slice(0,120),email:address(user),role:"teacher",status:"pending_verification",createdAt:new Date(now())}; }
  async function activate(user, verifiedAuthIdentity=false) {
    await db.runTransaction(async tx=>{
      const a=await account(tx,user.uid),ref=db.doc(`emailVerifications/${user.uid}`),snap=await tx.get(ref),challenge=snap.data();
      if(!verifiedAuthIdentity&&challenge?.emailHash&&challenge.emailHash!==hash(address(user)))fail("failed-precondition","Die E-Mail-Adresse wurde geändert. Bitte fordere einen neuen Code an.");
      if(!a.exists)tx.set(a.ref,{...newProfile(user),status:"active",emailVerifiedAt:new Date(now())});
      else if(a.profile.status==="pending_verification")tx.update(a.ref,{status:"active",email:address(user),emailVerifiedAt:new Date(now())});
      if(challenge)tx.update(ref,{status:"consumed",emailHash:hash(address(user)),digest:null,expiresAt:new Date(now()+DAY)});
    });
    return {verified:true};
  }
  async function requestCode(request) {
    const user=await identity(request),uid=user.uid,email=address(user);
    if(user.emailVerified)return activate(user,true);
    const time=now(),value=code(),id=nonce(),ref=db.doc(`emailVerifications/${uid}`);
    const limits=[
      ["uid",uid,Math.floor(time/HOUR),5,HOUR],
      ["email",email,Math.floor(time/DAY),10,DAY],
      ["ip",String(request.rawRequest?.ip||"unknown"),Math.floor(time/HOUR),100,HOUR]
    ].map(([kind,key,period,max,window])=>({ref:db.doc(`emailVerificationLimits/${hash(`${kind}:${key}:${period}`)}`),max,window}));
    const reserved=await db.runTransaction(async tx=>{
      const a=await account(tx,uid),old=(await tx.get(ref)).data()||{};
      if(old.status==="verifying"&&old.lockUntil>time)fail("aborted","Die Bestätigung wird gerade abgeschlossen.");
      if(old.nextSendAt>time)return {sent:old.status==="sent",retryAfterSeconds:Math.ceil((old.nextSendAt-time)/1000)};
      const counts=[];for(const limit of limits)counts.push(Number((await tx.get(limit.ref)).data()?.count||0));
      if(limits.some((limit,i)=>counts[i]>=limit.max))fail("resource-exhausted","Zu viele Code-Anfragen. Bitte später erneut versuchen.");
      if(!a.exists)tx.set(a.ref,newProfile(user));
      limits.forEach((limit,i)=>tx.set(limit.ref,{count:counts[i]+1,expiresAt:new Date(time+2*limit.window)}));
      tx.set(ref,{nonce:id,emailHash:hash(email),digest:digest(uid,email,id,value),attempts:5,status:"sending",expiresAt:new Date(time+10*MINUTE),nextSendAt:time+MINUTE});
      return {reserved:true};
    });
    if(!reserved.reserved)return reserved;
    try {
      await sendMail({to:email,code:value,locale:request.data?.locale==="en"?"en":"de",idempotencyKey:id});
      await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(snap.data()?.nonce===id&&snap.data()?.status==="sending")tx.update(ref,{status:"sent"});});
    } catch (_) {
      await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(snap.data()?.nonce===id)tx.update(ref,{status:"delivery_failed",digest:null});});
      fail("unavailable","Der Code konnte gerade nicht gesendet werden. Bitte versuche es erneut.");
    }
    return {sent:true,retryAfterSeconds:60,expiresInSeconds:600};
  }
  async function confirmCode(request) {
    const value=String(request.data?.code||"").replace(/\s/g,"");
    if(!/^\d{6}$/.test(value))fail("invalid-argument","Bitte gib den sechsstelligen Code ein.");
    const user=await identity(request),uid=user.uid,email=address(user),ref=db.doc(`emailVerifications/${uid}`),time=now();
    if(user.emailVerified)return activate(user,true);
    const result=await db.runTransaction(async tx=>{
      await account(tx,uid);const data=(await tx.get(ref)).data();
      if(!data||data.emailHash!==hash(email))return {error:"failed-precondition"};
      const expiry=typeof data.expiresAt?.toMillis==="function"?data.expiresAt.toMillis():new Date(data.expiresAt).getTime();
      if(!Number.isFinite(expiry)||expiry<=time)return {error:"deadline-exceeded"};
      if(data.attempts<=0)return {error:"resource-exhausted"};
      if(data.status==="verifying"&&data.lockUntil>time)return {error:"aborted"};
      if(!["sent","verifying"].includes(data.status)||!data.digest)return {error:"failed-precondition"};
      const expected=Buffer.from(data.digest,"hex"),actual=Buffer.from(digest(uid,email,data.nonce,value),"hex");
      if(expected.length!==actual.length||!timingSafeEqual(expected,actual)){tx.update(ref,{attempts:Math.max(0,data.attempts-1)});return {error:"invalid-argument"};}
      tx.update(ref,{status:"verifying",lockUntil:time+2*MINUTE});return {nonce:data.nonce};
    });
    if(result.error){const messages={"invalid-argument":"Der Code stimmt nicht. Bitte prüfe deine E-Mail.","deadline-exceeded":"Der Code ist abgelaufen. Bitte fordere einen neuen an.","resource-exhausted":"Zu viele Fehlversuche. Bitte fordere einen neuen Code an.",aborted:"Die Bestätigung wird gerade abgeschlossen."};fail(result.error,messages[result.error]||"Bitte fordere einen neuen Code für diese E-Mail-Adresse an.");}
    try {
      // Include the proven address: a concurrent email change must never verify a different address.
      const latest=await auth.getUser(uid);
      if(address(latest)!==email||latest.disabled)fail("failed-precondition","Die E-Mail-Adresse wurde geändert. Bitte fordere einen neuen Code an.");
      await db.runTransaction(async tx=>{await account(tx,uid);});
      await auth.updateUser(uid,{email,emailVerified:true});
      return await activate({...user,emailVerified:true});
    } catch (error) {
      await db.runTransaction(async tx=>{const data=(await tx.get(ref)).data();if(data?.nonce===result.nonce&&data.status==="verifying")tx.update(ref,{status:"sent",lockUntil:0});});
      if(error.code)throw error;
      fail("unavailable","Die Bestätigung konnte nicht abgeschlossen werden. Bitte versuche es erneut.");
    }
  }
  return {requestCode,confirmCode};
}
module.exports={createEmailVerification};
