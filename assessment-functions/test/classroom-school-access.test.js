'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {createClassroomService}=require('../lib/classroom-service');
const memberKey=(school,uid)=>crypto.createHash('sha256').update(JSON.stringify([school,uid])).digest('hex');
async function setup(){
 const docs=new Map(),identities=new Map();let before=null;
 const clone=v=>v===undefined?undefined:structuredClone(v);
 for(const uid of ['owner','one','two','deputy','other']){docs.set('users/'+uid,{role:'teacher',status:'active'});identities.set(uid,{uid,emailVerified:true,disabled:false});}
 docs.set('appConfig/billingProduct',{enabled:true,allowedUids:[...identities.keys()]});
 docs.set('billingV2Schools/licA',{id:'licA',name:'Lizenzschule A',status:'active',seats:40,usedSeats:4});
 docs.set('billingV2Schools/licB',{id:'licB',name:'Lizenzschule B',status:'active',seats:40,usedSeats:1});
 for(const uid of ['owner','one','two','deputy'])docs.set('billingV2Memberships/'+memberKey('licA',uid),{schoolId:'licA',personId:uid,status:'active',role:['owner','deputy'].includes(uid)?'school_admin':'teacher',seatAssigned:true});
 docs.set('billingV2Memberships/'+memberKey('licB','other'),{schoolId:'licB',personId:'other',status:'active',role:'school_admin',seatAssigned:true});
 const store={get:async p=>clone(docs.get(p)),list:async(p,f,v)=>[...docs].filter(([k,d])=>k.startsWith(p+'/')&&!k.slice(p.length+1).includes('/')&&(!f||(Array.isArray(d[f])?d[f].includes(v):d[f]===v))).map(([k,d])=>({id:k.split('/').pop(),...clone(d)})),transaction:async fn=>{if(before){const hook=before;before=null;hook();}const writes=[];const value=await fn({get:store.get,list:store.list,set:(p,v)=>writes.push(()=>docs.set(p,clone(v))),remove:p=>writes.push(()=>docs.delete(p))});for(const write of writes)write();return value;}};
 const service=createClassroomService({store,now:()=>1800000000000,getIdentity:async uid=>clone(identities.get(uid))});
 const call=(uid,command,data={})=>service.execute(uid,command,data,{ip:'synthetic'});
 await call('owner','createSchool',{name:'Vorhandene Schule'});
 const a=await call('owner','createClass',{name:'8a',year:'2026/27'}),b=await call('owner','createClass',{name:'8b',year:'2026/27'});
 const pupil=await call('owner','createStudent',{classId:a.id,firstName:'Fiktiv',lastName:'Eins'});
 docs.set('quizzes/OWNERTEST',{ownerId:'owner',title:'Eigener Test',published:true,sessionRunId:'round1',startMode:'teacher',sessionState:'waiting'});
 docs.set('quizzes/ONETEST',{ownerId:'one',title:'Kollegentest',published:true,sessionRunId:'round1',startMode:'teacher',sessionState:'waiting'});
 const bind=()=>call('owner','connectSchool',{billingSchoolId:'licA',useExistingSchool:true,confirm:true});
 return {docs,identities,call,a,b,pupil,bind,beforeTransaction:fn=>before=fn};
}
test('binding requires explicit confirmation and preserves existing physical pupils, names and access codes',async()=>{
 const f=await setup(),before=structuredClone(f.docs.get('classroomSchools/owner/students/'+f.pupil.id));
 await assert.rejects(f.call('owner','connectSchool',{billingSchoolId:'licA',useExistingSchool:true}),{code:'failed-precondition'});
 await f.bind();assert.equal(f.docs.get('classroomSchoolBindings/licA').classroomSchoolId,'owner');assert.equal(f.docs.get('classroomSchools/owner').canonicalSchoolId,'licA');
 assert.deepEqual(f.docs.get('classroomSchools/owner/students/'+f.pupil.id),before);assert.equal((await f.call('owner','printCodes',{classId:f.a.id})).rows[0].code,f.pupil.code);
 assert.equal((await f.bind()).schoolId,'owner');assert.equal((await f.call('owner','workspace')).classes.length,2);
});
test('a school member initially sees only the class catalog; only selected class grants pupil access and print rights',async()=>{
 const f=await setup();await f.bind();let w=await f.call('one','workspace');assert.equal(w.school.id,'owner');assert.equal(w.classes.length,0);assert.equal(w.students.length,0);assert.equal(w.classCatalog.length,2);assert.ok(w.classCatalog.every(c=>c.studentCount===undefined));
 await assert.rejects(f.call('one','workspace',{classId:f.a.id}),{code:'permission-denied'});
 await f.call('one','setTeacherClasses',{classIds:[f.a.id]});w=await f.call('one','workspace');assert.deepEqual(w.classes.map(c=>c.id),[f.a.id]);assert.equal(w.students[0].id,f.pupil.id);assert.ok(!('codeCipher' in w.students[0]));
 await assert.rejects(f.call('one','printCodes',{classId:f.b.id}),{code:'permission-denied'});await assert.rejects(f.call('one','printCodes'),{code:'permission-denied'});
 await assert.rejects(f.call('one','createStudent',{classId:f.b.id,firstName:'X',lastName:'Y'}),{code:'permission-denied'});
 assert.equal((await f.call('one','printCodes',{classId:f.a.id})).rows[0].id,f.pupil.id);
});
test('teachers may create a school class and automatically select it without receiving other classes',async()=>{
 const f=await setup();await f.bind();const c=await f.call('one','createClass',{name:'9c',year:'2026/27'});
 const w=await f.call('one','workspace');assert.deepEqual(w.classes.map(c=>c.id),[c.id]);assert.equal(w.classCatalog.length,3);
 await f.call('one','createStudent',{classId:c.id,firstName:'Fiktiv',lastName:'Neu'});assert.equal((await f.call('one','workspace')).students.length,1);
 await f.call('one','setTeacherClasses',{classIds:[]});assert.equal((await f.call('one','workspace')).students.length,0);
});
test('class choice never confers quiz ownership or colleague live-monitor control',async()=>{
 const f=await setup();await f.bind();await f.call('one','setTeacherClasses',{classIds:[f.a.id]});await f.call('two','setTeacherClasses',{classIds:[f.a.id]});
 await assert.rejects(f.call('one','assign',{classId:f.a.id,quizId:'OWNERTEST'}),{code:'permission-denied'});
 const a=await f.call('one','assign',{classId:f.a.id,quizId:'ONETEST'});assert.equal((await f.call('one','participants',{assignmentId:a.id})).rows.length,1);
 await assert.rejects(f.call('two','participants',{assignmentId:a.id}),{code:'permission-denied'});await assert.rejects(f.call('two','startRound',{assignmentId:a.id}),{code:'permission-denied'});
 await f.call('one','setTeacherClasses',{classIds:[f.b.id]});await assert.rejects(f.call('one','participants',{assignmentId:a.id}),{code:'permission-denied'});
});
test('removed canonical owner cannot fall back to historical classroomMembers; other active administrators retain school control',async()=>{
 const f=await setup();await f.bind();const path='billingV2Memberships/'+memberKey('licA','owner');f.docs.set(path,{...f.docs.get(path),status:'left'});
 await assert.rejects(f.call('owner','workspace'),{code:'permission-denied'});await assert.rejects(f.call('owner','createClass',{name:'Bypass',year:'2026/27'}),{code:'permission-denied'});
 assert.equal((await f.call('deputy','workspace')).role,'admin');assert.equal((await f.call('deputy','workspace')).classes.length,2);
});
test('suspension, unverified email, disabled Auth and closed pilot block connected school access',async()=>{
 for(const state of ['suspended','unverified','disabled','pilot']){const f=await setup();await f.bind();if(state==='suspended')f.docs.get('users/owner').status='suspended';if(state==='unverified')f.identities.get('owner').emailVerified=false;if(state==='disabled')f.identities.get('owner').disabled=true;if(state==='pilot')f.docs.get('appConfig/billingProduct').allowedUids=['one'];await assert.rejects(f.call('owner','workspace'),e=>['permission-denied','failed-precondition'].includes(e.code));}
});
test('only both school administrators may bind, and existing foreign namespaces are never merged by name',async()=>{
 const f=await setup();await assert.rejects(f.call('one','connectSchool',{billingSchoolId:'licA',confirm:true,useExistingSchool:true}),{code:'permission-denied'});
 await assert.rejects(f.call('owner','connectSchool',{billingSchoolId:'licB',confirm:true,useExistingSchool:true}),{code:'permission-denied'});await f.bind();
 await f.call('other','createSchool',{name:'Vorhandene Schule'});await f.call('other','connectSchool',{billingSchoolId:'licB',confirm:true,useExistingSchool:true});
 await assert.rejects(f.call('one','workspace',{schoolId:'other'}),{code:'permission-denied'});await assert.rejects(f.call('one','setTeacherClasses',{classIds:['foreign-class']}),{code:'not-found'});
});
test('membership is reread inside the mutation transaction and a revocation aborts all writes',async()=>{
 const f=await setup();await f.bind();const before=f.docs.size;f.beforeTransaction(()=>{const p='billingV2Memberships/'+memberKey('licA','one');f.docs.set(p,{...f.docs.get(p),status:'left'});});
 await assert.rejects(f.call('one','createClass',{name:'Racing',year:'2026/27'}),{code:'permission-denied'});assert.equal(f.docs.size,before);
});
test('pupil login and historical assignment persist after binding and teacher removal',async()=>{
 const f=await setup(),a=await f.call('owner','assign',{classId:f.a.id,quizId:'OWNERTEST'});await f.bind();const path='billingV2Memberships/'+memberKey('licA','owner');f.docs.get(path).status='left';
 const logged=await f.call(null,'login',{code:f.pupil.code,deviceMode:'shared'});assert.equal(logged.student.id,f.pupil.id);assert.equal(logged.assignments[0].id,a.id);assert.equal((await f.call(null,'me',{sessionToken:logged.sessionToken})).student.id,f.pupil.id);
});
test('class selection validates bounded unique identifiers and cannot accept a browser-supplied administrative role',async()=>{
 const f=await setup();await f.bind();await assert.rejects(f.call('one','setTeacherClasses',{classIds:[f.a.id,f.a.id]}),{code:'invalid-argument'});await assert.rejects(f.call('one','setTeacherClasses',{classIds:Array(101).fill('other')}),{code:'invalid-argument'});
 await f.call('one','setTeacherClasses',{classIds:[f.a.id],role:'admin'});assert.equal((await f.call('one','workspace')).role,'teacher');
});
test('membership recheck also prevents device-help writes by a teacher who lost their selected class',async()=>{
 const f=await setup();await f.bind();await f.call('one','setTeacherClasses',{classIds:[f.a.id]});const a=await f.call('one','assign',{classId:f.a.id,quizId:'ONETEST'});await f.call('one','setTeacherClasses',{classIds:[]});
 await assert.rejects(f.call('one','requestDeviceExit',{assignmentId:a.id,studentId:f.pupil.id,attemptId:'device',expectedGeneration:0,actionId:'exit',confirm:true,reason:'Testhilfe'}),{code:'permission-denied'});
});
test('an administrator may prepare a new empty canonical classroom without a parallel membership ledger',async()=>{
 const f=await setup();const result=await f.call('other','connectSchool',{billingSchoolId:'licB',confirm:true,useExistingSchool:false});const w=await f.call('other','workspace');assert.equal(w.school.id,result.schoolId);assert.equal(w.school.name,'Lizenzschule B');assert.equal(w.role,'admin');assert.equal(w.classes.length,0);assert.equal(f.docs.has('classroomMembers/other'),false);
});
test('workspace returns only pupil display fields and invalid request shapes keep a clear validation error',async()=>{
 const f=await setup();await f.bind();await f.call('one','setTeacherClasses',{classIds:[f.a.id]});f.docs.get('classroomSchools/owner/students/'+f.pupil.id).privateImportReference='do-not-return';
 const w=await f.call('one','workspace');assert.equal(w.students[0].privateImportReference,undefined);await assert.rejects(f.call('one','workspace',null),{code:'invalid-argument'});
});
test('two school memberships require explicit school choice and class selections stay in their own namespace',async()=>{
 const f=await setup();await f.bind();await f.call('other','createSchool',{name:'Zweite Schule'});await f.call('other','connectSchool',{billingSchoolId:'licB',useExistingSchool:true,confirm:true});const b=await f.call('other','createClass',{name:'8a',year:'2026/27'});
 f.docs.set('billingV2Memberships/'+memberKey('licB','one'),{schoolId:'licB',personId:'one',status:'active',role:'teacher',seatAssigned:true});
 const choose=await f.call('one','workspace');assert.equal(choose.school,null);assert.equal(choose.schools.length,2);assert.equal(choose.students.length,0);
 await f.call('one','setTeacherClasses',{schoolId:'owner',classIds:[f.a.id]});assert.equal((await f.call('one','workspace',{schoolId:'owner'})).students.length,1);
 assert.equal((await f.call('one','workspace',{schoolId:'other'})).students.length,0);await assert.rejects(f.call('one','setTeacherClasses',{schoolId:'other',classIds:[f.a.id]}),{code:'not-found'});
 await f.call('one','setTeacherClasses',{schoolId:'other',classIds:[b.id]});assert.deepEqual((await f.call('one','workspace',{schoolId:'other'})).classes.map(c=>c.id),[b.id]);
});
test('one published round cannot overwrite another school policy and the first pupil retains access',async()=>{
 const f=await setup();await f.bind();await f.call('other','createSchool',{name:'Zweite Schule'});await f.call('other','connectSchool',{billingSchoolId:'licB',useExistingSchool:true,confirm:true});const second=await f.call('other','createClass',{name:'9b',year:'2026/27'});await f.call('other','createStudent',{classId:second.id,firstName:'Fiktiv',lastName:'Zwei'});
 f.docs.set('billingV2Memberships/'+memberKey('licB','one'),{schoolId:'licB',personId:'one',status:'active',role:'teacher',seatAssigned:true});await f.call('one','setTeacherClasses',{schoolId:'owner',classIds:[f.a.id,f.b.id]});await f.call('one','setTeacherClasses',{schoolId:'other',classIds:[second.id]});
 const first=await f.call('one','assign',{schoolId:'owner',classId:f.a.id,quizId:'ONETEST'});await f.call('one','createStudent',{schoolId:'owner',classId:f.b.id,firstName:'Fiktiv',lastName:'Drei'});await f.call('one','assign',{schoolId:'owner',classId:f.b.id,quizId:'ONETEST'});const policy=structuredClone(f.docs.get('classroomQuizPolicies/ONETEST'));
 await assert.rejects(f.call('one','assign',{schoolId:'other',classId:second.id,quizId:'ONETEST'}),{code:'failed-precondition'});assert.deepEqual(f.docs.get('classroomQuizPolicies/ONETEST'),policy);
 const login=await f.call(null,'login',{code:f.pupil.code});assert.equal(login.assignments[0].id,first.id);assert.equal(login.assignments[0].status,'available');
 const {readClassroomStart}=require('../lib/classroom-binding');await readClassroomStart({get:async p=>f.docs.get(p),quizId:'ONETEST',quiz:f.docs.get('quizzes/ONETEST'),attemptId:'first-device',data:{classroomSession:login.sessionToken,classroomAssignment:first.id,classroomGeneration:0},now:1800000000000,fail:(code,message)=>{const e=Error(message);e.code=code;throw e;}});
});
