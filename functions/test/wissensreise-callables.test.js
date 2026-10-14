"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs");
const structuredClone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
const {HttpsError}=require("firebase-functions/v2/https");
const{compileQuestion}=require("../lib/wissensreise-core");
function harness(){
 const rows=new Map(),jobs=[];let writes=0,reads=0;
 for(const uid of['teacher','foreign','admin'])rows.set(`users/${uid}`,{role:uid==='admin'?'admin':'teacher',status:'active'});
 rows.set('quizzes/ABCD',{ownerId:'teacher',title:'Own source',subject:'Mathe'});
 rows.set('quizzes/ABCD/questions/q1',{position:0,type:'number',text:'2 + 3 = ?',numericAnswer:5});rows.set('quizzes/ABCD/questions/q2',{position:1,type:'number',text:'3 * 4 = ?',numericAnswer:12});
 const snapshot=path=>({exists:rows.has(path),data:()=>structuredClone(rows.get(path)),id:path.split('/').pop()});
 const doc=path=>({path,get:async()=>snapshot(path),collection:name=>query(`${path}/${name}`)});
 const query=path=>({path,isQuery:true,orderBy(){return this;},limit(){return this;}});
 const get=async ref=>{reads++;if(!ref.isQuery)return snapshot(ref.path);return{docs:[...rows.keys()].filter(p=>p.startsWith(ref.path+'/')&&p.split('/').length===ref.path.split('/').length+1).map(p=>snapshot(p))};};
 const db={doc,get,runTransaction:async fn=>{let mutated=false;return fn({get:async ref=>{assert.equal(mutated,false,'Firestore rejects reads after writes');return get(ref);},set:(ref,value)=>{mutated=true;writes++;rows.set(ref.path,structuredClone(value));}});}};
 const wrap=(_opts,fn)=>({run:fn});
 const accessContext={module:{exports:{}},exports:{},require:name=>name.includes('firebase-functions')?{HttpsError}:name.includes('firebase-admin')?{getFirestore:()=>db}:null};accessContext.exports=accessContext.module.exports;vm.runInNewContext(fs.readFileSync(require.resolve('../lib/access'),'utf8'),accessContext);
 const context={module:{exports:{}},exports:{},process:{env:{GCLOUD_PROJECT:'hausaufgabe-staging'}},require:name=>{
  if(name==='firebase-functions/v2/https')return{onCall:wrap,HttpsError};if(name==='firebase-functions/v2/scheduler')return{onSchedule:wrap};if(name==='firebase-functions/v2/tasks')return{onTaskDispatched:wrap};if(name==='firebase-functions/params')return{defineSecret:name=>({name})};if(name==='firebase-admin/firestore')return{getFirestore:()=>db};if(name==='firebase-admin/functions')return{getFunctions:()=>({taskQueue:()=>({enqueue:async data=>jobs.push(data)})})};if(name==='./access')return accessContext.module.exports;
  if(name==='./wissensreise-generation')return{generateBatch:async data=>Array.from({length:12},(_,i)=>({...compileQuestion({id:'q1',type:'number',text:`Variante${i}: ${i}+2?`,numericAnswer:i+2}),kind:'similar'}))};return require(`../lib/${name.slice(2)}`);
 }};context.exports=context.module.exports;vm.runInNewContext(fs.readFileSync(require.resolve('../lib/wissensreise-callables'),'utf8'),context);
 const handlers=context.module.exports.learningCallables({run:async()=>{throw new Error('single generator must not be called in play');}});
 const call=(name,data,uid='teacher')=>handlers[name].run({...(uid?{auth:{uid}}:{}),data,rawRequest:{ip:'school-nat'}});
 return{rows,jobs,handlers,call,stats:()=>({reads,writes})};
}
test("actual callable/Firestore adapter enforces auth owner and inactive source, preserves source keys",async()=>{
 const h=harness(),input={sourceId:'ABCD',requestId:'request-123456',formats:['number'],duration:180,mode:'practice'};
 await assert.rejects(h.call('prepareLearningDraft',input,null),{code:'unauthenticated'});await assert.rejects(h.call('prepareLearningDraft',input,'foreign'));
 const before=JSON.stringify([...h.rows].filter(([k])=>k.startsWith('quizzes/')));const d=await h.call('prepareLearningDraft',input);assert.equal((await h.call('prepareLearningDraft',input)).id,d.id);
 assert.equal(JSON.stringify([...h.rows].filter(([k])=>k.startsWith('quizzes/'))),before);
 h.rows.get('quizzes/ABCD').published=true;await assert.rejects(h.call('publishLearningDraft',{draftId:d.id,revision:d.revision,reviewed:true,rightsConfirmed:true}));
 assert.ok(h.stats().reads>0&&h.stats().writes>0);
});
test("actual draft→generation→publish→public play→idempotent refill uses transaction-safe private transport",async()=>{
 const h=harness();const draft=await h.call('prepareLearningDraft',{sourceId:'ABCD',requestId:'request-123456',formats:['number'],duration:180,mode:'practice'});
 const prepared=await h.call('generateLearningBuffer',{draftId:draft.id,requestId:'buffer-123456'});assert.equal(prepared.items.length,14);
 await h.call('publishLearningDraft',{draftId:draft.id,revision:prepared.revision,reviewed:true,rightsConfirmed:true,autoVariants:true});
 const start={publicationId:draft.id,requestId:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'};let s=await h.call('startLearningSession',start,null);assert.equal((await h.call('startLearningSession',start,null)).token,s.token);
 const access={sessionId:s.sessionId,token:s.token};await assert.rejects(h.call('stepLearningSession',{...access,token:'foreign',action:'resume'},null));
 assert.equal(JSON.stringify(s).includes('numericAnswer'),false);assert.equal(JSON.stringify(s).includes('tokenHash'),false);assert.equal(JSON.stringify(s).includes('current'),false);
 for(let i=0;i<8;i++)s=await h.call('stepLearningSession',{...access,action:'next',taskId:s.task.id},null);
 await h.call('requestLearningRefill',access,null);await h.call('requestLearningRefill',access,null);assert.equal(h.jobs.length,1);
 await h.handlers.processLearningBuffer.run({data:h.jobs[0]});assert.ok(h.rows.get(`learningBuffers/${draft.id}`).items.length>0);
 await assert.rejects(h.call('developLearningSession',{...access,action:'reset'},'teacher'),{code:'permission-denied'});
 h.rows.get('quizzes/ABCD').rightsHold=true;await assert.rejects(h.call('stepLearningSession',{...access,action:'resume'},null));
});
