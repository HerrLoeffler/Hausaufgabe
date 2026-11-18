'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {initializeTestEnvironment,assertFails}=require('@firebase/rules-unit-testing'),{doc,getDoc,setDoc}=require('firebase/firestore');
assert.match(process.env.FIRESTORE_EMULATOR_HOST||'',/^(localhost|127\.0\.0\.1):\d+$/);let env;
test.before(async()=>{env=await initializeTestEnvironment({projectId:'demo-gradecrew-classroom-rights',firestore:{rules:fs.readFileSync(process.env.GRADECREW_CLASSROOM_RULES||'firestore.secure-assessment.rules','utf8')}});});
test.after(async()=>env.cleanup());
test('current deployed rules deny direct binding, class grants, audit and pupil reads/writes to clients',async()=>{
 await env.clearFirestore();const paths=['classroomSchoolBindings/A','classroomSchools/physical/teacherClasses/one','classroomSchoolAudit/event','classroomSchools/physical/students/pupil'];
 await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();for(const uid of ['one','admin'])await setDoc(doc(db,'users/'+uid),{role:uid==='admin'?'admin':'teacher',status:'active'});for(const path of paths)await setDoc(doc(db,path),{classroomSchoolId:'physical',classIds:['a'],firstName:'Fiktiv'});});
 for(const uid of ['one','admin',null]){const db=(uid?env.authenticatedContext(uid,{email_verified:true}):env.unauthenticatedContext()).firestore();for(const path of paths){await assertFails(getDoc(doc(db,path)));await assertFails(setDoc(doc(db,path),{classIds:['foreign']}));}}
});
