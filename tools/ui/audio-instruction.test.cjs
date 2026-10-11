const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { buildPublicQuestion, assertNoSolutionLeak, authoringFingerprint } = require('../../assessment-functions/lib/assessment-core');
const { storedAiQuestion } = require('../../functions/lib/ai-job');
const { normalizeQuestion, validateQuestion } = require('../../functions/lib/validation');
const { questionForReview } = require('../../functions/lib/quality');
const { questionSchemaForType } = require('../../functions/lib/schemas');
const app = fs.readFileSync(path.join(__dirname, '../../app.js'), 'utf8');
const audioDataUrl = 'data:audio/mpeg;base64,QUJD';
const instructions = {
  grouping: 'Höre den Hörtext. Ordne die acht darin vorkommenden Wörter der passenden Wortart zu.',
  multi: 'Höre den Hörtext. Welche zwei Wörter sind Konjunktionen? Wähle genau zwei Antworten aus.'
};
function question(type) {
  const q = { id: type, type, text: 'PRIVATE_LEGACY_TEXT', audioScript: 'PRIVATE_TRANSCRIPT', audioPresentation: 'listening-only', audioDataUrl, points: 4, audioInstruction: instructions[type] };
  if(type === 'grouping') q.groups = ['Nomen','Verben','Adjektive','Präpositionen'].map(name => ({name, items:['PRIVATE_A','PRIVATE_B']}));
  else q.options = [0,1,2,3].map(i => ({text: 'PRIVATE_ANSWER_'+i, correct:i<2, audioDataUrl}));
  q.audioAnswerMode = 'audio-only';
  if(type === 'grouping') q.audioAnswerItems = q.groups.flatMap((g,gi) => g.items.map((sourceText,i) => ({key:`g${gi}_i${i}`,sourceText,audioDataUrl})));
  return q;
}
function fn(name) { const start=app.indexOf(`function ${name}(`); assert.ok(start>=0,name); return app.slice(start,app.indexOf('\n}',start)+2); }
async function harness(t) {
  const dom = new JSDOM('<div id="studentQuizCard"></div>', {url:'https://example.test',runScripts:'outside-only'}); const w=dom.window; t.after(()=>w.close());
  w.$=id=>w.document.getElementById(id); w.state={currentQuiz:{},questions:[]};
  w.assessmentContentLabels=(await import('../../shared/i18n/assessment-locale.mjs')).assessmentContentLabels;
  w.formatMathText=(await import('../../shared/math-display.mjs')).formatMathText;
  w.escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  w.round1=n=>n; w.getQuestionAudioSrc=q=>q.audioDataUrl||''; w.getQuestionImageSrc=()=>''; w.questionAudioReady=()=>true; w.questionStudentAudioReady=()=>true;
  w.orderingVariantsForStorage=x=>x; w.orderingVariants=x=>x; w.questionAnswerAudioEntries=q=>q.audioAnswerItems.map(e=>({...e,asset:e}));
  w.refreshStudentProgress=()=>{};w.crewTour=null;w.stopStudentTimer=()=>{}; w.clearStudentSubscriptions=()=>{}; w.setupStudentProgress=()=>{}; w.startStudentTimer=()=>{}; w.watchStudentQuiz=()=>{};
  w.studentOptionEntries=(_,q)=>q.options.map((option,originalIndex)=>({option,originalIndex}));
  w.renderGroupingStudent=()=>{}; w.makeMiniButton=(text,action)=>{const b=w.document.createElement('button'); b.textContent=text;b.addEventListener('click',action);return b;};
  w.questionHasAudioAnswerEntries=()=>false; w.audioOperations=()=>new Map(); w.audioOperationFor=()=>null; w.renderAudioClipActions=()=>w.document.createElement('div');
  w.markDirty=()=>{}; w.cancelQuestionAudioOperation=()=>{}; w.getAudioRepairIncident=()=>null; w.getQuestionSolutionAudioSrc=()=>''; w.questionSolutionAudioReady=()=>false;
  for(const name of ['sanitizeQuestionForSave','renderStudentQuiz','renderQuestionAudioEditor']) w.eval(fn(name));
  return w;
}
for (const type of ['grouping','multi']) test(`${type}: explicit instruction survives teacher save, secure paper and both student renderers`,async t=>{
  const w=await harness(t);const q=question(type);const saved=w.sanitizeQuestionForSave(q);
  assert.equal(saved.audioInstruction,instructions[type]);assert.equal(saved.audioScript,undefined);
  const paper=buildPublicQuestion({...saved,id:q.id},'synthetic-secret'); assertNoSolutionLeak(paper);
  assert.equal(paper.audioInstruction,instructions[type]); assert.equal(paper.text,''); assert.doesNotMatch(JSON.stringify(paper),/PRIVATE_|correct|sourceText/);
  w.renderStudentQuiz({id:'synthetic',title:'Test',contentLocale:'de-DE'},[q],{ownerPreview:true}); assert.equal(w.document.querySelector('h3').textContent,instructions[type]);
  const secure=fs.readFileSync(path.join(__dirname,'../../secure-student.js'),'utf8').replace(/^import .*;\n/gm,'').replace('void bootstrap();','');
  w.initializeApp=()=>({});w.firebaseConfig={};w.createSecureAssessmentClient=()=>({});w.eval(secure+'\nwindow.mount = q => {currentQuiz={contentLocale:"de-DE"};currentPaper=[q];return renderQuestion(q,0);};');
  const section=w.mount(paper); assert.equal(section.querySelector('h2').textContent,instructions[type]); assert.doesNotMatch(section.outerHTML,/PRIVATE_|correct/);
});
test('legacy private text is never promoted automatically, editor requires explicit teacher action',async t=>{
  const w=await harness(t);const q=question('multi');delete q.audioInstruction;
  const container=w.document.createElement('div');w.renderQuestionAudioEditor(container,q);
  const field=container.querySelector('.questionAudioInstruction');assert.ok(field);assert.equal(field.value,'');assert.equal(q.audioInstruction,undefined);
  assert.match(container.textContent,/Arbeitsauftrag/);
  container.querySelector('.copyQuestionAudioInstruction').click();assert.equal(q.audioInstruction,q.text);
  field.value=instructions.multi;field.dispatchEvent(new w.Event('input'));assert.equal(q.audioInstruction,instructions.multi);
  delete q.audioInstruction; const paper=buildPublicQuestion(q,'secret');assert.equal(paper.text,'');assert.equal(paper.audioInstruction,undefined);
  w.renderStudentQuiz({id:'synthetic',title:'Test',contentLocale:'de-DE'},[q],{ownerPreview:true});assert.doesNotMatch(w.document.querySelector('h3').textContent,/PRIVATE_|beantworte die Frage/);assert.match(w.document.querySelector('h3').textContent,/Arbeitsauftrag fehlt/);
});
test('instruction changes invalidate new frozen papers without rewriting old absent-field fingerprints',()=>{
  const q=question('multi');assert.notEqual(authoringFingerprint([q]),authoringFingerprint([{...q,audioInstruction:'Changed instruction'}]));
  const old={...q};delete old.audioInstruction;assert.equal(authoringFingerprint([old]),authoringFingerprint([{...old,audioInstruction:''}]));
});
test('AI schema, normalization, review and storage preserve explicit public instruction separately',async()=>{
  const raw={type:'multi',text:'PRIVATE_LEGACY_TEXT',points:2,options:[{text:'und',correct:true},{text:'oder',correct:true},{text:'vor',correct:false}],mediaIntent:{kind:'none'},audioIntent:{kind:'ai_generated',presentation:'listening-only',script:'PRIVATE_TRANSCRIPT',instruction:instructions.multi,reason:'Hörverstehen'}};
  assert.ok(questionSchemaForType('multi',{allowAudio:true}).properties.audioIntent.required.includes('instruction'));
  const normalized=normalizeQuestion(raw);assert.equal(normalized.audioIntent.instruction,instructions.multi);assert.equal(questionForReview(normalized,0).studentView.text,instructions.multi);
  const stored=await storedAiQuestion(normalized,0,{model:'mock',promptVersion:'mock',generateAudio:async()=>({audioDataUrl})});assert.equal(stored.audioInstruction,instructions.multi);assert.equal(stored.audioScript,'PRIVATE_TRANSCRIPT');
  assert.match(validateQuestion({...normalized,audioIntent:{...normalized.audioIntent,instruction:''}}).join(' '),/Arbeitsauftrag/);
});

test('single-question AI revision preserves the public instruction and presentation across TTS',async t=>{
  const w=await harness(t);const q=question('multi');
  w.eval(fn('questionForAi'));
  const request=w.questionForAi(q);assert.equal(request.audioIntent.instruction,instructions.multi);assert.equal(request.audioIntent.presentation,'listening-only');
  const raw={audioIntent:{kind:'ai_generated',script:'PRIVATE_TRANSCRIPT',presentation:'listening-only',instruction:instructions.multi}};
  let calls=0;w.aiApi={generateQuestionAudio:async()=>{calls++;return {asset:{audioDataUrl}};}};
  w.eval('async '+fn('applyGeneratedAudio'));const next={};await w.applyGeneratedAudio(raw,next,'synthetic','q1');
  assert.equal(calls,1);assert.equal(next.audioInstruction,instructions.multi);assert.equal(next.audioPresentation,'listening-only');
});

test('audio editor keeps playback direct and public instruction only in listening mode',async t=>{
  const w=await harness(t);const q=question('multi');q.audioPresentation='supplement';
  const container=w.document.createElement('div');w.renderQuestionAudioEditor(container,q);
  const editor=container.querySelector('.questionAudioPanel');
  assert.ok(editor.querySelector('.questionAudioPreview audio'));
  assert.equal(editor.querySelector('.questionAudioPreview').closest('details'),null);
  assert.equal(editor.querySelector('.questionAudioInstructionGroup').hidden,true);
  assert.equal(editor.querySelector('.questionAudioEdit').open,false);
  assert.equal(editor.querySelector('.questionAudioEdit summary').textContent,'Audio bearbeiten');
  assert.ok(editor.querySelector('.questionAudioEdit .questionAudioScript'));
  const mode=editor.querySelector('.questionAudioPresentation');mode.value='listening-only';mode.dispatchEvent(new w.Event('change'));
  assert.equal(editor.querySelector('.questionAudioInstructionGroup').hidden,false);
  assert.equal(q.audioInstruction,instructions.multi);
  mode.value='supplement';mode.dispatchEvent(new w.Event('change'));
  assert.equal(editor.querySelector('.questionAudioInstructionGroup').hidden,true);
  assert.equal(w.sanitizeQuestionForSave(q).audioInstruction,instructions.multi);
});
test('listening editor exposes task while private editing stays closed and locked writes disabled',async t=>{
  const w=await harness(t);const q=question('multi');w.state.currentQuiz={published:true,ended:false};
  const container=w.document.createElement('div');w.renderQuestionAudioEditor(container,q);
  assert.equal(container.querySelector('.questionAudioInstructionGroup').hidden,false);
  assert.equal(container.querySelector('.questionAudioEdit').open,false);
  assert.equal(container.querySelector('.questionAudioInstruction').disabled,true);
  assert.equal(container.querySelector('.copyQuestionAudioInstruction').textContent,'Frage übernehmen');
  assert.equal(container.querySelector('.copyQuestionAudioInstruction').disabled,true);
  assert.equal(container.querySelector('audio').getAttribute('aria-label'),'Audio zur Aufgabe anhören');
});
