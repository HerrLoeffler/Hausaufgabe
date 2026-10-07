import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {JSDOM}=require('./tools/ui/node_modules/jsdom');
const app=fs.readFileSync('app.js','utf8');
function runtime(q) {
  const messages=[],requests=[];
  const context={window:{AudioContext:class {async decodeAudioData(){return {duration:0.2,numberOfChannels:1,getChannelData:()=>new Float32Array([0.1])};}async close(){}}},atob:value=>Buffer.from(value,"base64").toString("binary"),Uint8Array,state:{currentQuiz:{id:'TEST'},questions:[q]},toast:message=>messages.push(message),markDirty:()=>{},renderQuestionAudioEditor:()=>{},showReportableError:details=>{throw new Error(details.message);},aiFriendlyError:err=>err.message,REPORTABLE_ERROR_CODES:{aiEdit:'AI-EDIT'},console,aiApi:{generateQuestionAudio:async request=>{requests.push(request);return {asset:{audioDataUrl:`data:audio/mpeg;base64,QUJD${requests.length}`,audioByteSize:4}};}}};
  const helpers=app.slice(app.indexOf('function getQuestionAudioSrc('),app.indexOf('function renderQuestionAudioEditor('));
  const generate=app.slice(app.indexOf('async function generateAiAudioForQuestion('),app.indexOf('async function generateAiSolutionAudioForQuestion('));
  vm.runInNewContext(helpers+generate,context);
  return {context,messages,requests,container:{querySelector:()=>null}};
}
test('one click converts existing question text without requiring a second transcript',async()=>{
  const q={id:'q1',type:'single',text:'Which colour is the sky?',options:[{text:'blue',correct:true},{text:'red',correct:false}]};
  const r=runtime(q);
  await r.context.generateAiAudioForQuestion(q,r.container,{fromTask:true});
  assert.equal(q.audioScript,'Which colour is the sky?');
  assert.equal(q.audioPresentation,'listening-only');
  assert.ok(q.audioDataUrl?.startsWith('data:audio/mpeg;base64,'));
  assert.equal(r.requests[0].script,'Which colour is the sky?');
});
test('a passage is read while its written work instruction stays visible',async()=>{
  const q={id:'q2',type:'markwords',text:'Markiere alle Verben.',passage:'Der Pinguin hüpft und lacht.',targetWords:['hüpft','lacht'],audioScript:'alter Hörtext'};
  const r=runtime(q);
  await r.context.generateAiAudioForQuestion(q,r.container,{fromTask:true});
  assert.equal(q.audioScript,'Der Pinguin hüpft und lacht.');
  assert.equal(q.audioPresentation,'supplement');
  assert.equal(q.text,'Markiere alle Verben.');
});
test('six grouping words each become a separate audio memo, not a spoken correct-solution explanation',async()=>{
  const q={id:'q3',type:'grouping',text:'Ordne die Wörter zu.',groups:[{name:'Nomen',items:['Zauberhut','Känguru']},{name:'Verben',items:['schnarcht','hüpft']},{name:'Adjektive',items:['glitzernd','mutig']}]};
  const r=runtime(q);
  await r.context.generateAiAnswerAudioForQuestion(q,r.container);
  assert.equal(q.audioAnswerMode,'audio-only');
  assert.deepEqual(r.requests.map(x=>x.script),['Zauberhut','Känguru','schnarcht','hüpft','glitzernd','mutig']);
  assert.equal(q.audioAnswerItems.length,6);
  assert.equal(new Set(q.audioAnswerItems.map(x=>x.audioDataUrl)).size,6);
  assert.equal(q.solutionAudioScript,undefined);
  assert.equal(q.audioScript,undefined);
});
test('student audio availability does not require the deliberately private teacher transcript',()=>{
  const r=runtime({});
  assert.equal(r.context.questionStudentAudioReady({audioPresentation:'listening-only',audioDataUrl:'data:audio/mpeg;base64,QUJD',audioNeedsRegeneration:false}),true);
  assert.equal(r.context.questionStudentAudioReady({audioPresentation:'listening-only',audioDataUrl:'',audioNeedsRegeneration:false}),false);
  assert.equal(r.context.questionStudentAudioReady({audioPresentation:'listening-only',audioDataUrl:'data:audio/mpeg;base64,QUJD',audioNeedsRegeneration:true}),false);
});

test('removing question audio restores the written task',()=>{
  const q={audioPresentation:'listening-only',audioScript:'Wort',audioDataUrl:'data:audio/mpeg;base64,QUJD'};
  runtime(q).context.clearQuestionAudio(q);
  assert.equal(q.audioPresentation,'supplement');
  assert.equal(q.audioDataUrl,'');
});

test('an audio response cannot overwrite a question edited while generation was running',async()=>{
  const q={id:'q4',type:'single',text:'Original question'};
  const r=runtime(q);
  let finish;
  r.context.aiApi.generateQuestionAudio=()=>new Promise(resolve=>{finish=resolve;});
  const pending=r.context.generateAiAudioForQuestion(q,r.container,{fromTask:true});
  q.text='Edited question';
  finish({asset:{audioDataUrl:'data:audio/mpeg;base64,QUJD'}});
  await pending;
  assert.equal(q.audioDataUrl,undefined);
});

test('pending generation does not persist a busy flag that blocks restored drafts',async()=>{
  const q={id:'q5',type:'single',text:'Listen to this question'};
  const r=runtime(q);let finish;
  r.context.aiApi.generateQuestionAudio=()=>new Promise(resolve=>{finish=resolve;});
  const pending=r.context.generateAiAudioForQuestion(q,r.container,{fromTask:true});
  const restored=JSON.parse(JSON.stringify(q));
  finish({asset:{audioDataUrl:'data:audio/mpeg;base64,QUJD'}});await pending;
  assert.equal(restored.audioGenerationInFlight,undefined);
  const fresh=runtime(restored);await fresh.context.generateAiAudioForQuestion(restored,fresh.container,{fromTask:true});
  assert.equal(fresh.requests.length,1);
});

for (const change of ['remove','transcript']) test(`late direct-conversion response respects ${change} during a pending request`,async()=>{
  const q={id:'q6',type:'single',text:'Question',audioScript:'Existing audio',audioDataUrl:'data:audio/mpeg;base64,OLD'};
  const r=runtime(q);let finish;
  r.context.aiApi.generateQuestionAudio=()=>new Promise(resolve=>{finish=resolve;});
  const pending=r.context.generateAiAudioForQuestion(q,r.container,{fromTask:true});
  if(change==='remove')r.context.clearQuestionAudio(q);else q.audioScript='New custom dialogue';
  finish({asset:{audioDataUrl:'data:audio/mpeg;base64,NEW'}});await pending;
  assert.equal(q.audioScript,change==='remove'?'':'New custom dialogue');
  assert.equal(q.audioDataUrl,change==='remove'?'':'data:audio/mpeg;base64,OLD');
});

test('empty custom transcript fallback also rejects a late result after editing task text',async()=>{
  const q={id:'q7',type:'single',text:'Old task',audioScript:''};
  const r=runtime(q);let finish;
  r.context.aiApi.generateQuestionAudio=()=>new Promise(resolve=>{finish=resolve;});
  const pending=r.context.generateAiAudioForQuestion(q,r.container);
  q.text='Edited task';finish({asset:{audioDataUrl:'data:audio/mpeg;base64,OLD'}});await pending;
  assert.equal(q.audioDataUrl,undefined);
});

test('grouping preview renders six separate playable memos and never the original answer words',()=>{
  const dom=new JSDOM('<section></section>');
  const q={id:'q3',type:'grouping',text:'Ordne die Wörter zu.',audioAnswerMode:'audio-only',groups:[{name:'Nomen',items:['Zauberhut','Känguru']},{name:'Verben',items:['schnarcht','hüpft']},{name:'Adjektive',items:['glitzernd','mutig']}],audioAnswerItems:[['g0_i0','Zauberhut'],['g0_i1','Känguru'],['g1_i0','schnarcht'],['g1_i1','hüpft'],['g2_i0','glitzernd'],['g2_i1','mutig']].map(([key,sourceText],index)=>({key,sourceText,audioDataUrl:`data:audio/mpeg;base64,QUJD${index}`,audioNeedsRegeneration:false}))};
  const r=runtime(q);
  Object.assign(r.context,{document:dom.window.document,shuffled:items=>items,escapeHtml:s=>s,setupMoveableBank:()=>{}});
  const makeStart=app.indexOf('function makeDragItem(');
  const makeEnd=app.indexOf('\nfunction ',makeStart+1);
  const audioStart=app.indexOf('function makeAudioDragItem(');
  const audioEnd=audioStart<0?-1:app.indexOf('\nfunction ',audioStart+1);
  const renderStart=app.indexOf('function renderGroupingStudent(');
  const renderEnd=app.indexOf('\nfunction renderMarkwordsStudent',renderStart);
  vm.runInNewContext(app.slice(makeStart,makeEnd)+(audioStart<0?'':app.slice(audioStart,audioEnd))+app.slice(renderStart,renderEnd),r.context);
  r.context.renderGroupingStudent(dom.window.document.querySelector('section'),q);
  assert.equal(dom.window.document.querySelectorAll('audio').length,6);
  assert.doesNotMatch(dom.window.document.body.textContent,/Zauberhut|Känguru|schnarcht|hüpft|glitzernd|mutig/);
  assert.equal(dom.window.document.querySelectorAll('.dragItem').length,6);
  assert.equal(dom.window.document.querySelectorAll('.groupDrop').length,3);
  dom.window.close();
});
