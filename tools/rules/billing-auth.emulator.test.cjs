"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),path=require("node:path");
const requireFunctions=require("node:module").createRequire(path.resolve(__dirname,"../../functions/package.json"));
const {initializeApp,deleteApp}=requireFunctions("firebase-admin/app");
const {getAuth}=requireFunctions("firebase-admin/auth"),{getFirestore}=requireFunctions("firebase-admin/firestore");
const {requireAiUser}=requireFunctions("./lib/access");
const {getRuntime}=requireFunctions("./lib/billing/runtime");
for(const name of ["FIRESTORE_EMULATOR_HOST","FIREBASE_AUTH_EMULATOR_HOST"])assert.match(process.env[name]||"",/^(127\.0\.0\.1|localhost):\d+$/);
const app=initializeApp({projectId:"demo-gradecrew-billing"}),auth=getAuth(app),db=getFirestore(app);
const recent="billing_auth_recent",expired="billing_auth_expired";
test.before(async()=>{
  for(const uid of[recent,expired]){try{await auth.deleteUser(uid);}catch{}}
  await auth.createUser({uid:recent,email:"billing-local@example.invalid",password:"Only-for-local-emulator-123!",emailVerified:true});
  const imported=await auth.importUsers([{uid:expired,email:"billing-expired@example.invalid",emailVerified:true,metadata:{creationTime:new Date(Date.now()-20*86400000).toUTCString()}}]);assert.equal(imported.failureCount,0);
  await db.doc("appConfig/billingProduct").set({enabled:true,allowedUids:[recent,expired]});
  for(const uid of[recent,expired])await db.doc("users/"+uid).set({role:"teacher",status:"active"});
});
test.after(async()=>{await db.terminate();await deleteApp(app);});
test("a normal Firebase password sign-in resolves the actual identity and anchored trial",async()=>{
  const response=await fetch("http://"+process.env.FIREBASE_AUTH_EMULATOR_HOST+"/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=local-emulator-only",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"billing-local@example.invalid",password:"Only-for-local-emulator-123!",returnSecureToken:true})});
  assert.equal(response.status,200);const login=await response.json();const token=await auth.verifyIdToken(login.idToken);assert.equal(token.uid,recent);
  const access=await getRuntime().service.getAccess({auth:{uid:token.uid,token},data:{}});
  assert.equal(access.tier,"trial");assert.equal(access.freeCreationsRemaining,5);
  const registration=Date.parse((await auth.getUser(recent)).metadata.creationTime);
  assert.equal(access.trialEndsAtMs,registration+14*86400000);
});
test("expired trials cannot call paid AI editing paths but retain authenticated read access",async()=>{
  const request={auth:{uid:expired},data:{}};
  await assert.rejects(requireAiUser(request),error=>error.code==="permission-denied"&&error.details?.reasonCode==="trial_ended");
  assert.equal((await requireAiUser(request,{billingFeature:null})).uid,expired);
});
