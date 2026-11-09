'use strict';const test=require('node:test'),assert=require('node:assert/strict');
const {readReplacementReceipt}=require('../lib/classroom-binding');
const fail=(code,message)=>{const e=Error(message);e.code=code;throw e;};
const attempt={quizId:'q',attemptId:'old',classroom:{schoolId:'s',studentId:'p',assignmentId:'a',generation:0}};
test('replacement receipt requires explicit retained release matching the authenticated old attempt',async()=>{
 const docs=new Map([['classroomSchools/s/assignments/a/participants/p',{generation:1,attemptId:null}],['classroomSchools/s/assignments/a/replacements/old',{studentId:'p',oldGeneration:0,generation:1,actionId:'release',releasedAt:1000}]]);const get=async p=>docs.get(p);
 const r=await readReplacementReceipt({get,attempt,now:2000,fail});assert.equal(r.kind,'classroom_replacement_v1');assert.equal(r.oldAttemptId,'old');assert.equal(r.generation,1);assert.equal(r.studentId,'p');assert.equal(r.serverNow,2000);
 docs.delete('classroomSchools/s/assignments/a/replacements/old');assert.equal(await readReplacementReceipt({get,attempt,now:2000,fail}),null);
 docs.set('classroomSchools/s/assignments/a/replacements/old',{studentId:'other',oldGeneration:0,generation:1,actionId:'x'});assert.equal(await readReplacementReceipt({get,attempt,now:2000,fail}),null);
});
test('active and guest attempts never receive a replacement authorization',async()=>{
 const get=async()=>({generation:0,attemptId:'old'});assert.equal(await readReplacementReceipt({get,attempt,now:2000,fail}),null);assert.equal(await readReplacementReceipt({get,attempt:{quizId:'q'},now:2000,fail}),null);
});
