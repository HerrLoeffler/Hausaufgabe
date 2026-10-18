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
  for(const name of ['sanitizeQuestionForSave','renderStudentQuiz','bindQuestionTextEditor','renderQuestionAudioEditor']) w.eval(fn(name));
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
  const node=w.document.createElement('article');node.className='questionCard';node.innerHTML='<label class="questionTextLabel"><span class="questionTextCaption"></span><textarea class="qText"></textarea></label><div class="questionAudioEditor"></div>';
  const container=node.querySelector('.questionAudioEditor');w.bindQuestionTextEditor(node,q);w.renderQuestionAudioEditor(container,q);
  const field=node.querySelector('.qText');assert.equal(field.value,'');assert.equal(q.audioInstruction,undefined);
  assert.match(container.textContent,/öffentliche Frage/);assert.ok(container.querySelector('.questionAudioEdit .questionAudioLegacyQuestion'));
  container.querySelector('.copyQuestionAudioInstruction').click();assert.equal(q.audioInstruction,q.text);assert.equal(field.value,q.text);
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

test('one public question field replaces audio mode and duplicate field',async t=>{
  const w=await harness(t);const q=question('multi');const container=w.document.createElement('div');w.renderQuestionAudioEditor(container,q);
  assert.equal(container.querySelector('.questionAudioPresentation'),null);
  assert.equal(container.querySelector('.questionAudioInstruction'),null);
  assert.equal(container.querySelector('.questionAudioPreview').closest('details'),null);
  assert.equal(container.querySelector('.questionAudioEdit').open,false);
});
test('main question field edits public instruction without changing private legacy text',async t=>{
  const w=await harness(t);w.eval(fn('bindQuestionTextEditor'));
  const q=question('multi');const node=w.document.createElement('div');node.innerHTML='<label class="questionTextLabel"><span class="questionTextCaption"></span><textarea class="qText"></textarea></label>';
  w.bindQuestionTextEditor(node,q);const field=node.querySelector('.qText');assert.equal(field.value,instructions.multi);
  field.value='Höre die Aussage. Ist sie richtig oder falsch?';field.dispatchEvent(new w.Event('input'));
  assert.equal(q.audioInstruction,field.value);assert.equal(q.text,'PRIVATE_LEGACY_TEXT');assert.equal(w.sanitizeQuestionForSave(q).audioInstruction,field.value);
  delete q.audioInstruction;w.bindQuestionTextEditor(node,q);assert.equal(field.value,'');
});
test('new true-false audio conversion retains previously public question with no transcript leak',async t=>{
  const w=await harness(t);const q={id:'q1',type:'truefalse',text:'Höre die Aussage. Ist sie richtig oder falsch?',points:1,correctBoolean:true};
  const operations=new Map();w.audioOperations=()=>operations;w.state={currentQuiz:{id:'SYNTHETIC'},questions:[q]};w.defaultQuestionAudioScript=x=>x.text;
  w.aiApi={generateQuestionAudio:async()=>({asset:{audioDataUrl}})};w.toast=()=>{};w.renderQuestionAudioEditor=()=>{};
  w.eval('async '+fn('generateAiAudioForQuestion'));
  await w.generateAiAudioForQuestion(q,w.document.createElement('div'),{fromTask:true});
  assert.equal(q.audioInstruction,q.text);assert.equal(q.audioPresentation,'listening-only');
  const paper=buildPublicQuestion(w.sanitizeQuestionForSave(q),'secret');assert.equal(paper.audioInstruction,q.text);assert.equal(paper.correctBoolean,undefined);assertNoSolutionLeak(paper);assert.equal(paper.text,'');
  w.renderStudentQuiz({id:'synthetic',title:'Test',contentLocale:'de-DE'},[q],{ownerPreview:true});assert.equal(w.document.querySelector('h3').textContent,q.text);assert.equal(w.document.querySelectorAll('input[type=radio]').length,2);
  const secure=fs.readFileSync(path.join(__dirname,'../../secure-student.js'),'utf8').replace(/^import .*;\n/gm,'').replace('void bootstrap();','');
  w.initializeApp=()=>({});w.firebaseConfig={};w.createSecureAssessmentClient=()=>({});w.eval(secure+'\nwindow.mount = q => {currentQuiz={contentLocale:"de-DE"};currentPaper=[q];return renderQuestion(q,0);};');
  const section=w.mount(paper);assert.equal(section.querySelector('h2').textContent,q.text);assert.equal(section.querySelectorAll('input[type=radio]').length,2);assert.doesNotMatch(section.outerHTML,/correctBoolean|PRIVATE_/);
});

test('legacy explicit intent is reused, saved and reopened without private fallback',async t=>{
  const w=await harness(t);const q=question('multi');delete q.audioInstruction;q.audioIntent={instruction:instructions.multi};
  const node=w.document.createElement('div');node.innerHTML='<label class="questionTextLabel"><span class="questionTextCaption"></span><textarea class="qText"></textarea></label>';
  w.bindQuestionTextEditor(node,q);assert.equal(node.querySelector('.qText').value,instructions.multi);
  const direct=buildPublicQuestion(q,'secret');assert.equal(direct.audioInstruction,instructions.multi);assert.doesNotMatch(JSON.stringify(direct),/PRIVATE_/);
  const changed={...q,audioIntent:{instruction:'Changed explicit public question'}};assert.notEqual(authoringFingerprint([q]),authoringFingerprint([changed]));
  const saved=w.sanitizeQuestionForSave(q);assert.equal(saved.audioInstruction,instructions.multi);assert.equal(saved.audioIntent,undefined);
  w.bindQuestionTextEditor(node,saved);assert.equal(node.querySelector('.qText').value,instructions.multi);
  const paper=buildPublicQuestion(saved,'secret');assert.equal(paper.audioInstruction,instructions.multi);assert.doesNotMatch(JSON.stringify(paper),/PRIVATE_/);
});
test('unproven legacy private question cannot be promoted by audio conversion',async t=>{
  const w=await harness(t);const q=question('multi');delete q.audioInstruction;const operations=new Map();w.audioOperations=()=>operations;w.state={currentQuiz:{id:'SYNTHETIC'},questions:[q]};
  let calls=0;w.aiApi={generateQuestionAudio:async()=>{calls++;return {asset:{audioDataUrl}};}};w.toast=()=>{};
  w.eval('async '+fn('generateAiAudioForQuestion'));await w.generateAiAudioForQuestion(q,w.document.createElement('div'),{fromTask:true});
  assert.equal(calls,0);assert.equal(q.audioInstruction,undefined);assert.equal(buildPublicQuestion(q,'secret').text,'');
});

test('public question edits during mocked conversion do not insert a stale question or audio',async t=>{
  const w=await harness(t);const q={id:'q1',type:'truefalse',text:'Original public question',points:1,correctBoolean:false};const operations=new Map();
  w.audioOperations=()=>operations;w.state={currentQuiz:{id:'SYNTHETIC'},questions:[q]};w.toast=()=>{};w.defaultQuestionAudioScript=x=>x.text;
  w.aiApi={generateQuestionAudio:async()=>{q.text='Changed public question';return {asset:{audioDataUrl}};}};w.eval('async '+fn('generateAiAudioForQuestion'));
  await w.generateAiAudioForQuestion(q,w.document.createElement('div'),{fromTask:true});assert.equal(q.audioInstruction,undefined);assert.equal(q.audioDataUrl,undefined);
});

test('removing listening audio retains only the explicit public question',async t=>{
  const w=await harness(t);w.eval(fn('clearQuestionAudio'));const q=question('multi');w.clearQuestionAudio(q);
  assert.equal(q.audioPresentation,'supplement');assert.equal(q.text,instructions.multi);assert.equal(q.audioDataUrl,'');
  const paper=buildPublicQuestion(w.sanitizeQuestionForSave(q),'secret');assert.equal(paper.text,instructions.multi);assert.doesNotMatch(JSON.stringify(paper),/PRIVATE_/);
  const legacy=question('multi');delete legacy.audioInstruction;w.clearQuestionAudio(legacy);assert.equal(legacy.text,'');
});

test('legacy true-false listening task gets only a type-derived question in both renderers',async t=>{
  const w=await harness(t);const q={id:'old-tf',type:'truefalse',text:'PRIVATE_TRANSCRIPT_AND_SOLUTION',correctBoolean:true,points:1,audioPresentation:'listening-only',audioDataUrl};
  const expected='Höre die Aufnahme. Entscheide: Richtig oder falsch?';
  const node=w.document.createElement('div');node.innerHTML='<label class="questionTextLabel"><span class="questionTextCaption"></span><textarea class="qText"></textarea></label>';
  w.bindQuestionTextEditor(node,q);assert.equal(node.querySelector('.qText').value,expected);assert.equal(q.audioInstruction,undefined);
  w.renderStudentQuiz({id:'synthetic',title:'Test',contentLocale:'de-DE'},[q],{ownerPreview:true});assert.equal(w.document.querySelector('h3').textContent,expected);assert.doesNotMatch(w.document.querySelector('#studentQuizCard').innerHTML,/PRIVATE_/);
  const paper=buildPublicQuestion(w.sanitizeQuestionForSave(q),'secret');assert.equal(paper.text,'');assertNoSolutionLeak(paper);
  const secure=fs.readFileSync(path.join(__dirname,'../../secure-student.js'),'utf8').replace(/^import .*;\n/gm,'').replace('void bootstrap();','');
  w.initializeApp=()=>({});w.firebaseConfig={};w.createSecureAssessmentClient=()=>({});w.eval(secure+'\nwindow.mount = (q,locale) => {currentQuiz={contentLocale:locale};currentPaper=[q];return renderQuestion(q,0);};');
  const section=w.mount(paper,'de-DE');assert.equal(section.querySelector('h2').textContent,expected);assert.doesNotMatch(section.outerHTML,/PRIVATE_|correctBoolean/);
  assert.equal(w.mount(paper,'en-GB').querySelector('h2').textContent,'Listen to the recording. Decide: true or false?');
  const explicit={...paper,audioInstruction:'Is the statement about the barn correct?'};assert.equal(w.mount(explicit,'en-GB').querySelector('h2').textContent,explicit.audioInstruction);
});

test('cleared nested legacy question stays empty through DOM rebind, save, projection, revision and fingerprint',async t=>{
  const w=await harness(t);const q=question('multi');delete q.audioInstruction;q.audioIntent={instruction:instructions.multi};
  const node=w.document.createElement('div');node.innerHTML='<label class="questionTextLabel"><span class="questionTextCaption"></span><textarea class="qText"></textarea></label>';
  w.bindQuestionTextEditor(node,q);const field=node.querySelector('.qText');assert.equal(field.value,instructions.multi);
  const oldFingerprint=authoringFingerprint([q]);field.value='';field.dispatchEvent(new w.Event('input'));assert.equal(q.audioInstruction,'');assert.equal(q.text,'PRIVATE_LEGACY_TEXT');
  w.bindQuestionTextEditor(node,q);assert.equal(field.value,'');
  const saved=w.sanitizeQuestionForSave(q);assert.equal(saved.audioInstruction,'');w.bindQuestionTextEditor(node,saved);assert.equal(field.value,'');
  assert.equal(buildPublicQuestion(q,'secret').audioInstruction,undefined);assert.equal(buildPublicQuestion(saved,'secret').audioInstruction,undefined);
  assert.notEqual(authoringFingerprint([q]),oldFingerprint);assert.equal(authoringFingerprint([q]),authoringFingerprint([{...q,audioIntent:{instruction:'Ignored superseded source'}}]));
  w.eval(fn('questionForAi'));assert.equal(w.questionForAi(q).audioIntent.instruction,'');
});
test('save validation checks the sole public question and permits absent private teacher text',async t=>{
  const w=await harness(t);w.document.body.insertAdjacentHTML('beforeend','<input id="quizTitle" value="Synthetic"><input id="quizUseTimeLimit" type="checkbox">');w.eval(fn('validateQuiz'));
  const q=question('multi');q.text='';w.state.questions=[q];assert.equal(w.validateQuiz(),'');
  q.text='PRIVATE_TRANSCRIPT';q.audioInstruction='';assert.match(w.validateQuiz(),/Fragetext fehlt/);
  delete q.audioInstruction;q.audioIntent={instruction:instructions.multi};assert.equal(w.validateQuiz(),'');
  const tf={type:'truefalse',text:'PRIVATE_LEGACY_TEXT',points:1,audioPresentation:'listening-only',audioDataUrl,correctBoolean:true};w.state.questions=[tf];assert.equal(w.validateQuiz(),'');
  tf.audioInstruction='';assert.equal(w.validateQuiz(),'');
  const node=w.document.createElement('div');node.innerHTML='<label class="questionTextLabel"><span class="questionTextCaption"></span><textarea class="qText"></textarea></label>';
  const saved=w.sanitizeQuestionForSave(tf);assert.equal(saved.audioInstruction,'');w.bindQuestionTextEditor(node,saved);assert.equal(node.querySelector('.qText').value,'Höre die Aufnahme. Entscheide: Richtig oder falsch?');
});

test('canonical blank true-false legacy question gets safe localized default after DOM clear, save and reopen',async t=>{
  const w=await harness(t);w.eval(fn('questionStudentAudioReady'));w.eval(fn('validateQuiz'));w.document.body.insertAdjacentHTML('beforeend','<input id="quizTitle" value="Synthetic"><input id="quizUseTimeLimit" type="checkbox">');
  const node=w.document.createElement('div');node.innerHTML='<label class="questionTextLabel"><span class="questionTextCaption"></span><textarea class="qText"></textarea></label>';
  for(const [locale,expected] of [['de-DE','Höre die Aufnahme. Entscheide: Richtig oder falsch?'],['en-GB','Listen to the recording. Decide: true or false?']]) {
    const q={id:'old-tf',type:'truefalse',text:'PRIVATE_LEGACY_TEXT',points:1,audioPresentation:'listening-only',audioDataUrl,correctBoolean:false,audioInstruction:'',audioIntent:{instruction:'OLD_PUBLIC_CRITERION'}};
    w.state.currentQuiz={contentLocale:locale};w.state.questions=[q];w.bindQuestionTextEditor(node,q);assert.equal(node.querySelector('.qText').value,expected);assert.equal(w.validateQuiz(),'');
    const field=node.querySelector('.qText');field.value='';field.dispatchEvent(new w.Event('input'));
    const saved=w.sanitizeQuestionForSave(q);assert.equal(saved.audioInstruction,'');assert.equal(saved.audioIntent,undefined);w.bindQuestionTextEditor(node,saved);assert.equal(field.value,expected);
    const paper=buildPublicQuestion(saved,'secret');assertNoSolutionLeak(paper);assert.doesNotMatch(JSON.stringify(paper),/OLD_PUBLIC_CRITERION|PRIVATE_LEGACY_TEXT|correctBoolean/);
    q.audioNeedsRegeneration=true;w.bindQuestionTextEditor(node,q);assert.equal(field.value,'');assert.match(w.validateQuiz(),/Fragetext fehlt/);
  }
});
