'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const fromAssessment=require('node:module').createRequire(require('node:path').resolve(__dirname,'../../assessment-functions/package.json'));
const {initializeApp,deleteApp}=fromAssessment('firebase-admin/app'),{getFirestore}=fromAssessment('firebase-admin/firestore'),{getAuth}=fromAssessment('firebase-admin/auth');
const {createClassroomService}=fromAssessment('./lib/classroom-service'),{createClassroomFirestoreStore}=fromAssessment('./lib/classroom-firestore-store');
assert.match(process.env.FIRESTORE_EMULATOR_HOST||'',/^(127\.0\.0\.1|localhost):\d+$/);assert.match(process.env.FIREBASE_AUTH_EMULATOR_HOST||'',/^(127\.0\.0\.1|localhost):\d+$/);
const app=initializeApp({projectId:'demo-gradecrew-classroom-rights'},'classroom-rights'),db=getFirestore(app),auth=getAuth(app),store=createClassroomFirestoreStore(db);
const key=(...parts)=>crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex');
const service=createClassroomService({store,getIdentity:uid=>auth.getUser(uid)}),call=(uid,command,data={})=>service.execute(uid,command,data,{ip:'synthetic-school'});
async function seed(){
 for(const collection of ['users','accountDeletions','appConfig','billingV2Schools','billingV2Memberships','classroomSchools','classroomMembers','classroomSchoolBindings','classroomSchoolAudit','classroomPrivate','classroomAccess','classroomSessions','classroomRateLimits','quizzes','classroomQuizPolicies'])await db.recursiveDelete(db.collection(collection));
 const batch=db.batch();for(const uid of ['owner','one','two','other']){try{await auth.deleteUser(uid);}catch{}await auth.createUser({uid,email:uid+'@example.invalid',emailVerified:true});batch.set(db.doc('users/'+uid),{role:'teacher',status:'active'});}
 batch.set(db.doc('appConfig/billingProduct'),{enabled:true,allowedUids:['owner','one','two','other']});
 for(const schoolId of ['A','B'])batch.set(db.doc('billingV2Schools/'+schoolId),{id:schoolId,name:'Synthetic '+schoolId,status:'active',seats:40,usedSeats:schoolId==='A'?3:1});
 for(const uid of ['owner','one','two','other']){const schoolId=uid==='other'?'B':'A';batch.set(db.doc('billingV2Memberships/'+key(schoolId,uid)),{schoolId,personId:uid,status:'active',role:['owner','other'].includes(uid)?'school_admin':'teacher',seatAssigned:true});}await batch.commit();
 await call('owner','createSchool',{name:'Vorhandener synthetischer Bestand'});const a=await call('owner','createClass',{name:'8a',year:'2026/27'}),b=await call('owner','createClass',{name:'8b',year:'2026/27'});
 const pupil=await call('owner','createStudent',{classId:a.id,firstName:'Fiktiv',lastName:'Eins'});await call('owner','connectSchool',{billingSchoolId:'A',useExistingSchool:true,confirm:true});return {a,b,pupil};
}
test.after(async()=>{await db.terminate();await deleteApp(app);});
test('two actual emulator Auth teachers select separate classes; own test assignment reaches the existing pupil identity',async()=>{
 const {a,b,pupil}=await seed();assert.equal((await call('one','workspace')).students.length,0);await call('one','setTeacherClasses',{classIds:[a.id]});await call('two','setTeacherClasses',{classIds:[b.id]});
 assert.equal((await call('one','workspace')).students[0].id,pupil.id);assert.equal((await call('two','workspace')).students.length,0);
 await assert.rejects(call('two','printCodes',{classId:a.id}),{code:'permission-denied'});await assert.rejects(call('other','workspace',{schoolId:'owner'}),{code:'permission-denied'});
 await db.doc('quizzes/ONETEST').set({ownerId:'one',title:'Own synthetic test',published:true,sessionRunId:'round',startMode:'teacher',sessionState:'waiting'});
 const assignment=await call('one','assign',{classId:a.id,quizId:'ONETEST'});const login=await call(null,'login',{code:pupil.code,deviceMode:'shared'});assert.equal(login.assignments[0].id,assignment.id);await call('one','startRound',{assignmentId:assignment.id});assert.equal((await call(null,'me',{sessionToken:login.sessionToken})).assignments[0].startState,'open');
 await assert.rejects(call('two','participants',{assignmentId:assignment.id}),{code:'permission-denied'});
 await db.doc('billingV2Memberships/'+key('A','one')).update({status:'left'});await assert.rejects(call('one','workspace',{schoolId:'owner'}),{code:'permission-denied'});assert.equal((await call(null,'me',{sessionToken:login.sessionToken})).student.id,pupil.id);
});
test('transactional catalog reads and auto-selected class creation preserve membership and selected classes',async()=>{
 const {a}=await seed();await call('one','setTeacherClasses',{classIds:[a.id]});const created=await call('one','createClass',{name:'9c',year:'2026/27'});const w=await call('one','workspace');assert.equal(w.classes.length,2);assert.ok(w.classes.some(c=>c.id===created.id));
 await auth.updateUser('one',{emailVerified:false});await assert.rejects(call('one','createStudent',{schoolId:'owner',classId:a.id,firstName:'No',lastName:'Access'}),{code:'permission-denied'});
 await db.doc('billingV2Memberships/'+key('A','owner')).update({status:'left'});await assert.rejects(call('owner','workspace'),{code:'permission-denied'});
 assert.equal((await db.collection('classroomSchools').get()).size,1);assert.equal((await db.collection('billingV2Memberships').get()).size,4);
});
