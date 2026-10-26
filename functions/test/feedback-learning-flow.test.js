'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {HttpsError}=require('firebase-functions/v2/https');
const constants=require('../lib/constants'),validation=require('../lib/validation'),schemas=require('../lib/schemas'),prompts=require('../lib/prompts'),quality=require('../lib/quality'),learning=require('../lib/feedback-learning');
const {generateTestInBatches}=require('../lib/test-batches'),{validateAndRepairTest}=require('../lib/repair-test'),{preparePedagogicalPool}=require('../lib/pedagogical-pool'),{variantPrompt}=require('../lib/test-variant');
const source=fs.readFileSync(require.resolve('../index.js'),'utf8');const handler=source.slice(source.indexOf('async function generateTestForUser('),source.indexOf('\nexports.generateTest ='));
const question={type:'number',text:'Wie viel sind 25 Prozent von 80 Euro?',numericAnswer:20,points:1,tolerance:0,unit:'Euro',mediaIntent:{kind:'none'},audioIntent:{kind:'none'}};
const input={subject:'Mathematik',schoolType:'Mittelschule',region:'Bayern',grade:'9',topic:'Prozent',difficulty:'mittel',count:1,points:1,allowedTypes:['number'],imageMode:'none',audioMode:'none',materialMode:'inspiration'};
function report(id,owner,approved=false){const row={id,category:'ai_question',userId:owner,testCode:'TEST1234',questionId:id,verdict:'bad',reason:'incorrect',subject:'Mathematik',grade:'9',questionSnapshot:{type:'number',text:'PRIVATE MATERIAL',numericAnswer:999},createdAt:10,feedbackSchemaVersion:4};if(approved)row.sharedLearning={decision:'approved',revision:1,reviewSignature:learning.signalSignature(row)};return row;}
function store(rows,broken=false){const docs=new Map(rows.map(row=>['feedback/'+row.id,row]));const db={runTransaction:async fn=>{if(broken)throw Error('database unavailable');return fn({get:async key=>docs.get(key)||null,set:(key,value)=>docs.set(key,value)});}};return {docs,db};}
async function run(rows,uid='alice',{modelFails=false,dbFails=false,variant=false}={}){
 const {docs,db}=store(rows,dbFails),calls=[];const memory=learning.buildFeedbackLearning(rows,input,uid);
 const context=vm.createContext({...require("../lib/demand-plan"),...constants,...validation,...schemas,...prompts,...quality,...learning,HttpsError,generateTestInBatches,validateAndRepairTest,preparePedagogicalPool,variantPrompt,
 randomUUID:()=> 'synthetic-generation',cleanInput:d=>d,sanitizeMaterials:()=>[],consumeQuota:async()=>{},materialInputs:async()=>[],teacherQualityGuide:()=>'',loadQualityMemory:async()=>memory,getFirestore:()=>db,
 structuredResponse:async request=>{calls.push(request);assert.equal([...docs.values()].some(r=>r.learningUse),false,'receipt must follow first model reply');if(modelFails)throw Error('model unavailable');return {data:{title:'Prozent',subject:'Mathematik',grade:'9',questions:[{...question,...(request.schema.properties.questions.items.anyOf[0].required.includes("demand")?{demand:{position:1,level:1,rationale:"Bekannter kurzer Prozentwert im Klassenkontext."}}:{})}]},usage:{total_tokens:1}};},
 reviewDraft:async()=>({data:{issues:[]},usage:{}}),recordUsage:async()=>{},deleteUploadedMaterials:async()=>{},reportAiError:e=>e,console:{info(){},warn(){},error(){}}
 });vm.runInContext(handler,context);let result,error;try{result=await context.generateTestForUser(uid,variant?require('../lib/test-variant').buildVariantInput({title:'Prozent',subject:'Mathematik',grade:'9'},[{id:'original',...question,text:'Berechne 10 Prozent von 100 Euro.',numericAnswer:10}]):input);}catch(e){error=e;}return {docs,calls,result,error};
}
test('actual generation prompt changes immediately for own rating and writes evidence only after model reply',async()=>{
 const baseline=await run([]);assert.ok(baseline.result);const rated=await run([report('own','alice')]);assert.ok(rated.result);assert.match(rated.calls[0].userPrompt,/Bewertungsgedächtnis persönlich: 1/);assert.doesNotMatch(rated.calls[0].userPrompt,/PRIVATE/);assert.equal(rated.docs.get('feedback/own').learningUse.personal.operation,'generateTest');assert.equal(rated.result.meta.feedbackLearning.recorded,1);
});
test('actual generation isolates teachers and uses shared signals only after explicit review',async()=>{
 const privateSignal=await run([report('own','alice')],'bob');assert.doesNotMatch(privateSignal.calls[0].userPrompt,/Bewertungsgedächtnis/);
 const shared=await run([report('shared','alice',true)],'bob');assert.match(shared.calls[0].userPrompt,/Bewertungsgedächtnis gemeinsam: 1/);assert.doesNotMatch(shared.calls[0].userPrompt,/PRIVATE/);assert.equal(shared.docs.get('feedback/shared').learningUse.shared.operation,'generateTest');
});
test('failed model cannot create use receipt; receipt failure is explicit without losing a valid generation',async()=>{
 const failed=await run([report('own','alice')],'alice',{modelFails:true});assert.ok(failed.error);assert.equal(failed.docs.get('feedback/own').learningUse,undefined);
 const unavailable=await run([report('own','alice')],'alice',{dbFails:true});assert.ok(unavailable.result);assert.equal(unavailable.result.meta.feedbackLearning.unavailable,true);assert.equal(unavailable.docs.get('feedback/own').learningUse,undefined);
});
async function runRegeneration(options={}){
 const rows=[report('own','alice')],{db,docs}=store(rows,options.dbFails),memory=learning.buildFeedbackLearning(rows,input,'alice'),calls=[];
 const code=(options.baseline?fs.readFileSync('/private/tmp/gc-learning-baseline-index.js','utf8'):source);const part=code.slice(code.indexOf('exports.regenerateQuestion ='),code.indexOf('\nexports.analyzeMaterial ='));
 const context=vm.createContext({...require("../lib/demand-plan"),...constants,...validation,...schemas,...prompts,...quality,...learning,HttpsError,exports:{},onCall:(_opts,fn)=>fn,callableOpts:{},requireAiUser:async()=>({uid:'alice'}),consumeQuota:async()=>{},sanitizeMaterials:()=>[],loadQualityMemory:async()=>memory,getFirestore:()=>db,teacherQualityGuide:()=>'',
 structuredResponse:async request=>{calls.push(request);assert.equal(docs.get('feedback/own').learningUse,undefined);if(options.modelFails)throw Error('model unavailable');return {data:question,usage:{total_tokens:1}};},reviewDraft:async()=>({data:{issues:[]},usage:{}}),recordUsage:async()=>{},reportAiError:e=>e});
 vm.runInContext(part,context);let result,error;try{result=await context.exports.regenerateQuestion({auth:{uid:'alice'},data:{question:{...question,text:'Wie viel sind 10 Prozent von 100 Euro?',numericAnswer:10},variant:true,mediaKind:'none',testContext:input,allowedTypes:['number'],materials:[]}});}catch(e){error=e;}return {result,error,docs,calls};
}
async function runWholeRevision(options={}){
 const rows=[report('own','alice')],{db,docs}=store(rows,options.dbFails),memory=learning.buildFeedbackLearning(rows,input,'alice'),calls=[];
 const main=fs.readFileSync(options.baseline?'/private/tmp/gc-learning-baseline-main.js':require.resolve('../main.js'),'utf8');const part=main.slice(main.indexOf('const reviseWholeTest ='),main.indexOf('\nmodule.exports ='));
 const revision=require('../lib/whole-test-revision'),structured=require('../lib/structured-response');
 const context=vm.createContext({...require("../lib/demand-plan"),...constants,...revision,...learning,...structured,HttpsError,assistantOpts:{},onCall:(_opts,fn)=>fn,requireAiUser:async()=>({uid:'alice'}),consumeQuota:async()=>{},loadFeedbackLearningSafe:async()=>memory,getFirestore:()=>db,
 getOpenAI:()=>({responses:{create:async request=>{calls.push(request);assert.equal(docs.get('feedback/own').learningUse,undefined);if(options.modelFails)throw Error('model unavailable');return {status:'completed',output_text:JSON.stringify({title:'Prozent',subject:'Mathematik',grade:'9',description:'',questions:[validation.normalizeQuestion(question)]}),usage:{total_tokens:1}};}}}),recordUsage:async()=>{},console:{warn(){}}});
 vm.runInContext(part+'\nthis.invokeRevision=reviseWholeTest;',context);let result,error;try{result=await context.invokeRevision({auth:{uid:'alice'},data:{instruction:'Formuliere die Aufgabe klarer.',test:{title:'Prozent',subject:'Mathematik',grade:'9',questions:[{...question,text:'Wie viel sind 10 Prozent von 100 Euro?',numericAnswer:10}]}}});}catch(e){error=e;}return {result,error,docs,calls};
}
for(const [name,invoke] of [['single-task variant',runRegeneration],['whole-test revision',runWholeRevision]]){
 test(`actual ${name} prompt uses own signal and records only after model reply`,async()=>{
  const r=await invoke({baseline:process.env.GC_LEARNING_BASELINE==='1'});assert.ok(r.result,r.error?.message);const prompt=r.calls[0].userPrompt||r.calls[0].input.find(item=>item.role==='user').content[0].text;assert.match(prompt,/Bewertungsgedächtnis persönlich: 1/);assert.doesNotMatch(prompt,/PRIVATE/);assert.equal(r.docs.get('feedback/own').learningUse.personal.operation,name==='single-task variant'?'regenerateQuestion':'reviseWholeTest');assert.equal(r.result.meta.feedbackLearning.recorded,1);
 });
 test(`actual ${name} distinguishes provider failure and receipt failure`,async()=>{
  const failed=await invoke({modelFails:true});assert.ok(failed.error);assert.equal(failed.docs.get('feedback/own').learningUse,undefined);const noReceipt=await invoke({dbFails:true});assert.ok(noReceipt.result,noReceipt.error?.message);assert.equal(noReceipt.result.meta.feedbackLearning.unavailable,true);
 });
}

test('actual queued fresh-test variant preserves the personal guide and labels its use correctly',async()=>{
 const r=await run([report('own','alice')],'alice',{variant:true});assert.ok(r.result,r.error?.message);assert.match(r.calls[0].userPrompt,/Bewertungsgedächtnis persönlich: 1/);assert.equal(r.docs.get('feedback/own').learningUse.personal.operation,'generateTestVariant');
});
