import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const body=source.slice(source.indexOf('async function createQuizDocument('),source.indexOf('\nasync function createQuiz()',source.indexOf('async function createQuizDocument(')));
function setup(enabled,{denied=false}={}){
  const sent=[],writes=[];
  const context=vm.createContext({BILLING_PREVIEW_ENABLED:enabled,state:{user:{uid:'teacher'},quizzes:[],newManualQuiz:false},
    billingClient:{createQuiz:async payload=>{sent.push(payload);if(denied)throw new Error('quota_exhausted');return {code:'SERVER01'};}},
    quizDefaults:()=>({title:'New',ownerId:'teacher',published:false}),randomCode:()=> 'LEGACY01',
    crypto:{randomUUID:()=> '00000000-0000-4000-8000-000000000001'},serverTimestamp:()=>({sentinel:true}),
    setDoc:async(...args)=>{writes.push(args);},doc:(...args)=>args,db:{}
  });vm.runInContext(body,context);return{context,sent,writes};
}
test('preview creates through the authenticated server and strips client-owned authority fields',async()=>{
  const f=setup(true);const result=await f.context.createQuizDocument({title:'Import',ownerId:'other',updatedAt:{sentinel:true}},{kind:'import',requestId:'same-import-request'});
  assert.equal(result.code,'SERVER01');assert.equal(f.writes.length,0);assert.equal(f.sent[0].kind,'import');
  assert.equal(f.sent[0].quiz.ownerId,undefined);assert.equal(f.sent[0].quiz.updatedAt,undefined);
});
test('a rejected server creation never falls back to a direct database write',async()=>{
  const f=setup(true,{denied:true});await assert.rejects(f.context.createQuizDocument({title:'No'}),/quota_exhausted/);assert.equal(f.writes.length,0);
});
test('outside the dedicated preview the existing creation path is unchanged',async()=>{
  const f=setup(false);const result=await f.context.createQuizDocument({title:'Legacy'});assert.equal(result.code,'LEGACY01');assert.equal(f.writes.length,1);assert.equal(f.sent.length,0);
});
