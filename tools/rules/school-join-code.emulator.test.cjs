"use strict";
const test = require('node:test'), assert = require('node:assert/strict');
const fromFunctions = require('node:module').createRequire(require('node:path').resolve(__dirname, '../../functions/package.json'));
const {initializeApp, deleteApp} = fromFunctions('firebase-admin/app');
const {getFirestore} = fromFunctions('firebase-admin/firestore');
const {createBillingService, key} = fromFunctions('./lib/billing/application');
const {createFirestoreBillingStore} = fromFunctions('./lib/billing/firestore-store');
const {createPilotHandler} = fromFunctions('./lib/billing/handlers');
assert.match(process.env.FIRESTORE_EMULATOR_HOST || '', /^(localhost|127\.0\.0\.1):\d+$/);
const app = initializeApp({projectId:'demo-gradecrew-billing'}, 'school-join-code');
const db = getFirestore(app), identities = new Map();
const start = Date.UTC(2026,10,18); let time = start;
const service = createBillingService({store:createFirestoreBillingStore(db), now:()=>time, projectId:'demo-gradecrew-billing', getIdentity:async uid=>identities.get(uid)});
const request = (uid,data={})=>({auth:{uid,token:{auth_time:time/1000}},data});
const call = createPilotHandler(service);
async function seed(seats=40) {
 time=start; identities.clear();
 for(const c of ['users','accountDeletions','appConfig','billingV2Accounts','billingV2Grants','billingV2Schools','billingV2Memberships','billingV2Periods','billingV2Invitations','billingV2Audit','billingV2SchoolJoinCodes','billingV2SchoolCodeRedemptions','billingV2SchoolCodeRateLimits','quizzes'])await db.recursiveDelete(db.collection(c));
 const batch=db.batch(), allowed=['admin',...Array.from({length:41},(_,i)=>'t'+i)];
 for(const uid of allowed){identities.set(uid,{uid,email:uid+'@example.invalid',emailVerified:true,metadata:{creationTime:new Date(start-86400000).toISOString()}});batch.set(db.doc('users/'+uid),{role:uid==='admin'?'admin':'teacher',status:'active'});}
 batch.set(db.doc('appConfig/billingProduct'),{enabled:true,allowedUids:allowed});await batch.commit();
 return service.createSchool(request('admin',{name:'Synthetic school',ownerId:'t0',seats,startDate:'2026-11-18',requestId:'school-seed-request'}));
}
const make = schoolId=>call(request('t0',{action:'createSchoolJoinCode',schoolId,requestId:'create-code-request'}));
const redeem = (uid,code)=>call(request(uid,{action:'redeemSchoolJoinCode',code,role:'school_admin'}));
test.after(async()=>{await db.terminate();await deleteApp(app);});
test('normal verified teacher reviews a school then joins using the existing account and canonical projection',async()=>{
 const school=await seed(),made=await make(school.schoolId);
 assert.equal(made.code.replace(/-/g,'').length,32);
 const preview=await call(request('t1',{action:'previewSchoolJoinCode',code:made.code.toLowerCase()}));
 assert.equal(preview.schoolName,'Synthetic school');assert.equal(preview.members,undefined);
 const result=await redeem('t1',made.code);assert.equal(result.schoolId,school.schoolId);
 const membership=(await db.doc('billingV2Memberships/'+key(school.schoolId,'t1')).get()).data();
 assert.equal(membership.role,'teacher');assert.equal(membership.seatAssigned,true);
 assert.equal((await service.getSchool(request('t0',{schoolId:school.schoolId}))).school.usedSeats,2);
 assert.equal((await db.doc('billingV2Accounts/t1').get()).exists,true);
 const own=await service.getAccess(request('t1',{scope:{kind:'school',id:school.schoolId}}));assert.notEqual(own.tier,'school');
 await db.doc('billingV2Periods/'+school.periodId).update({paymentStatus:'paid'});
 assert.equal((await service.getAccess(request('t1',{scope:{kind:'school',id:school.schoolId}}))).tier,'school');
});
test('40 seats include the administrator; concurrent contenders for the last seat cannot create a 41st member',async()=>{
 const school=await seed(),made=await make(school.schoolId);
 for(let i=1;i<=38;i++)await redeem('t'+i,made.code);
 const results=await Promise.allSettled([redeem('t39',made.code),redeem('t40',made.code)]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(results.find(r=>r.status==='rejected').reason.code,'resource-exhausted');
 assert.equal((await service.getSchool(request('t0',{schoolId:school.schoolId}))).school.usedSeats,40);
 assert.equal((await db.collection('billingV2Memberships').where('schoolId','==',school.schoolId).where('status','==','active').get()).size,40);
});
test('same UID racing or using the same code again consumes exactly one place and never demotes an admin',async()=>{
 const school=await seed(2),made=await make(school.schoolId);
 await Promise.all([redeem('t1',made.code),redeem('t1',made.code)]);
 assert.equal((await redeem('t1',made.code)).alreadyMember,true);
 await redeem('t0',made.code);
 const view=await service.getSchool(request('t0',{schoolId:school.schoolId}));assert.equal(view.school.usedSeats,2);assert.equal(view.myRole,'school_admin');
});
test('outstanding personal invitations keep their reserved seats when a shared code is redeemed',async()=>{
 const school=await seed(2),made=await make(school.schoolId);
 await service.inviteSchoolMember(request('t0',{schoolId:school.schoolId,email:'t2@example.invalid',requestId:'personal-reservation'}));
 await assert.rejects(redeem('t1',made.code),{code:'resource-exhausted'});
 time+=8*86400000;
 const renewed=await call(request('t0',{action:'createSchoolJoinCode',schoolId:school.schoolId,requestId:'new-code-request'}));
 await redeem('t1',renewed.code);const view=await service.getSchool(request('t0',{schoolId:school.schoolId}));assert.equal(view.school.reservedSeats,0);assert.equal(view.school.usedSeats,2);
});
test('rotation, revocation and expiry reject old codes; management exposes status but no raw code',async()=>{
 const school=await seed(),made=await make(school.schoolId);
 assert.equal((await make(school.schoolId)).requiresReissue,true);
 const second=await call(request('t0',{action:'createSchoolJoinCode',schoolId:school.schoolId,requestId:'rotate-code-request'}));
 await assert.rejects(redeem('t1',made.code),{code:'failed-precondition'});
 await assert.rejects(call(request('t0',{action:'revokeSchoolJoinCode',schoolId:school.schoolId,codeId:made.codeId})),{code:'failed-precondition'});
 const view=await service.getSchool(request('t0',{schoolId:school.schoolId}));assert.equal(view.joinCode.id,second.codeId);assert.equal(view.joinCode.code,undefined);
 for(const c of ['billingV2SchoolJoinCodes','billingV2Schools','billingV2Audit'])assert.equal(JSON.stringify((await db.collection(c).get()).docs.map(s=>s.data())).includes(second.code.replace(/-/g,'')),false);
 await call(request('t0',{action:'revokeSchoolJoinCode',schoolId:school.schoolId,codeId:second.codeId}));await assert.rejects(redeem('t1',second.code),{code:'failed-precondition'});
 const third=await call(request('t0',{action:'createSchoolJoinCode',schoolId:school.schoolId,requestId:'third-code-request'}));time=third.expiresAtMs;
 await assert.rejects(redeem('t1',third.code),{code:'failed-precondition'});
});
test('only active verified pilot teachers may use codes and only their school management may rotate them',async()=>{
 const school=await seed(),made=await make(school.schoolId);
 await assert.rejects(call(request('t1',{action:'createSchoolJoinCode',schoolId:school.schoolId,requestId:'not-admin-request'})),{code:'permission-denied'});
 identities.get('t1').emailVerified=false;await assert.rejects(redeem('t1',made.code),{code:'permission-denied'});identities.get('t1').emailVerified=true;
 identities.get('t1').disabled=true;await assert.rejects(redeem('t1',made.code),{code:'permission-denied'});identities.get('t1').disabled=false;
 await db.doc('users/t1').update({status:'suspended'});await assert.rejects(redeem('t1',made.code),{code:'permission-denied'});await db.doc('users/t1').update({status:'active'});
 await db.doc('appConfig/billingProduct').update({allowedUids:['admin','t0']});await assert.rejects(redeem('t1',made.code),{code:'failed-precondition'});
 await assert.rejects(call({data:{action:'previewSchoolJoinCode',code:made.code}}),{code:'unauthenticated'});
});
test('removing a code-joined teacher frees the place but the same or rotated code cannot silently rejoin them',async()=>{
 const school=await seed(2),made=await make(school.schoolId);await redeem('t1',made.code);
 await service.removeSchoolMember(request('t0',{schoolId:school.schoolId,personId:'t1',reason:'Synthetic removal'}));
 await assert.rejects(redeem('t1',made.code),{code:'failed-precondition'});
 const second=await call(request('t0',{action:'createSchoolJoinCode',schoolId:school.schoolId,requestId:'rotate-after-removal'}));await assert.rejects(redeem('t1',second.code),{code:'failed-precondition'});
 await redeem('t2',second.code);
 assert.equal((await service.getSchool(request('t0',{schoolId:school.schoolId}))).school.usedSeats,2);
});
test('failed guesses consume a durable per-account rate limit and it recovers after the fixed window',async()=>{
 const school=await seed(),made=await make(school.schoolId);
 for(let i=0;i<20;i++)await assert.rejects(call(request('t1',{action:'previewSchoolJoinCode',code:'wrong'})),{code:'invalid-argument'});
 await assert.rejects(redeem('t1',made.code),{code:'resource-exhausted'});time+=600001;await redeem('t1',made.code);
});
test('the twenty-school bound and a suspended school cannot be bypassed by the code',async()=>{
 const school=await seed(),made=await make(school.schoolId),batch=db.batch();
 for(let i=0;i<20;i++)batch.set(db.doc('billingV2Memberships/cap'+i),{schoolId:'other'+i,personId:'t1',status:'active',role:'teacher',seatAssigned:true});await batch.commit();
 await assert.rejects(redeem('t1',made.code),{code:'resource-exhausted'});
 await db.doc('billingV2Schools/'+school.schoolId).update({status:'suspended'});await assert.rejects(redeem('t2',made.code),{code:'failed-precondition'});
});
