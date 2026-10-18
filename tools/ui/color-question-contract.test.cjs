const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { buildPublicQuestion, buildGradingKey, gradeQuestion } = require('../../assessment-functions/lib/assessment-core');
const app = fs.readFileSync(path.join(__dirname, '../../app.js'), 'utf8');
const secure = fs.readFileSync(path.join(__dirname, '../../secure-student.js'), 'utf8');
function sourceFunction(source, name) { const start = source.indexOf(`function ${name}(`); assert.ok(start >= 0, name); return source.slice(start, source.indexOf('\n}', start) + 2); }
function fixture() { return {id:'colors',type:'markwords',text:'Ordne die Wortarten zu.',passage:'Der kleine Igel schläft.',points:3,targetWords:['kleine','Igel','schläft'],markGroups:[{name:'Adjektive',color:'orange',words:['kleine']},{name:'Nomen',color:'blue',words:['Igel']},{name:'Verben',color:'green',words:['schläft']}]}; }
function harness(t) { const dom = new JSDOM('<section class="secureQuestion" data-qid="colors"></section>', {runScripts:'outside-only'}); t.after(()=>dom.window.close()); const w = dom.window; w.onAnswerChanged=()=>{};w.refreshProgress=()=>{};w.round1=require('../../assessment-functions/lib/assessment-core').round1;w.CSS={escape:value=>String(value)};w.currentPaper=[];w.eval('const currentPaper = window.currentPaper;');return w; }

test('teacher save preserves explicit marking groups and blank colors', t => {
  const w = harness(t);w.orderingVariantsForStorage=x=>x;
  w.getQuestionAudioSrc=q=>q.audioDataUrl||'';w.getQuestionImageSrc=()=>'';w.questionAudioReady=()=>true;w.questionHasAudioAnswerEntries=()=>false;
  w.eval(sourceFunction(app,'parseGaps'));w.eval(sourceFunction(app,'sanitizeQuestionForSave'));
  assert.deepEqual(JSON.parse(JSON.stringify(w.sanitizeQuestionForSave(fixture()).markGroups)),fixture().markGroups);
  assert.deepEqual([...w.sanitizeQuestionForSave({id:'g',type:'gapfill',text:'Der [Igel] [ruht].',points:2,gapColors:['blue','green']}).gapColors],['blue','green']);
});

test('secure student names the palette, selects word colors, reopens draft and grades server-side', t => {
  const w=harness(t);const q=fixture();const paper=buildPublicQuestion(q,'synthetic-secret');w.currentPaper.push(paper);
  for(const name of ['tokenizeWords','renderMarkwords','collectQuestionAnswer','answerIsComplete','applyDraft'])w.eval(sourceFunction(secure,name));
  const section=w.document.querySelector('section');w.renderMarkwords(section,paper);
  const choose=name=>[...section.querySelectorAll('.markColorChoice')].find(button=>button.textContent.includes(name)).click();
  const word=index=>section.querySelector(`[data-word-index="${index}"]`);
  choose('Adjektive');word(1).click();choose('Nomen');word(2).click();choose('Verben');word(3).click();
  const answer=JSON.parse(JSON.stringify(w.collectQuestionAnswer(paper,section)));
  assert.deepEqual(answer,{1:'orange',2:'blue',3:'green'});assert.equal(w.answerIsComplete(paper,answer),true);
  assert.match(word(2).getAttribute('aria-label'),/Igel.*Nomen/);
  assert.equal(gradeQuestion(buildGradingKey(q,'synthetic-secret'),answer).awardedPoints,3);
  word(2).click();w.applyDraft({colors:answer});assert.deepEqual(JSON.parse(JSON.stringify(w.collectQuestionAnswer(paper,section))),answer);
  assert.match(word(2).getAttribute('aria-label'),/Nomen/);
});

test('secure blank color remains metadata and never adds a solution value', t => {
  const w=harness(t);w.formatMathText=x=>x;w.eval(sourceFunction(secure,'renderGapfill'));
  const section=w.document.querySelector('section');w.renderGapfill(section,buildPublicQuestion({id:'gap',type:'gapfill',text:'Ein [Igel] schläft.',points:1,gapColors:['blue']},'synthetic-secret'));
  const input=section.querySelector('.secureGap');assert.ok(input.classList.contains('gapColor-blue'));assert.equal(input.value,'');assert.doesNotMatch(section.innerHTML,/Igel/);
});

test('saved teacher preview uses colored answers for completeness and the existing preview evaluation', t => {
  const w=harness(t);w.normalizeWord=value=>String(value).trim().toLowerCase();w.normalize=value=>String(value).trim().toLowerCase();
  for(const name of ['tokenizeWords','renderMarkwordsStudent','readStudentAnswer','studentAnswerIsComplete','markwordCorrectColors','evaluateAnswer'])w.eval(sourceFunction(app,name));
  const section=w.document.querySelector('section');section.className='studentQuestion';const q=fixture();w.renderMarkwordsStudent(section,q);
  const choices=[...section.querySelectorAll('.markColorChoice')];
  for(const [wordIndex,name] of [[1,'Adjektive'],[2,'Nomen'],[3,'Verben']]) { choices.find(button=>button.textContent===name).click();section.querySelector(`[data-word-index="${wordIndex}"]`).click(); }
  const answer=w.readStudentAnswer(q);assert.equal(w.studentAnswerIsComplete(q,answer),true);assert.equal(w.evaluateAnswer(q,answer).awarded,3);
  assert.match(section.querySelector('[data-word-index="2"]').getAttribute('aria-label'),/Igel.*Nomen/);
});

function gapEditorHarness(t,q) {
  const w=harness(t);w.markDirty=()=>{};w.toast=()=>{};
  w.makeMiniButton=(text,action)=>{const button=w.document.createElement('button');button.textContent=text;button.addEventListener('click',action);return button;};
  for(const name of ['parseGaps','serializeGapComposer','makeGapChip','fillGapComposer','renderGapfillEditor'])w.eval(sourceFunction(app,name));
  if(app.includes('function renderGapColorEditor('))w.eval(sourceFunction(app,'renderGapColorEditor'));
  const container=w.document.querySelector('section');w.renderGapfillEditor(container,q);return {w,container};
}

test('removing the first real gap preserves the remaining color and rebuilds its selector index',t=>{
  const q={id:'g',type:'gapfill',text:'Der [Igel] [schläft].',points:2,gapColors:['blue','green']};const {w,container}=gapEditorHarness(t,q);
  container.querySelector('.gapChipRemove').click();assert.equal(q.text,'Der Igel [schläft].');assert.deepEqual([...q.gapColors],['green']);
  const selects=container.querySelectorAll('.gapColorEditor select');assert.equal(selects.length,1);assert.equal(selects[0].value,'green');
  selects[0].value='purple';selects[0].dispatchEvent(new w.Event('change'));assert.deepEqual([...q.gapColors],['purple']);
  assert.equal(buildPublicQuestion(q,'secret').segments.find(segment=>segment.type==='gap').color,'purple');
});

test('marking a real new gap inserts an uncolored slot and preserves previous assignments',t=>{
  const q={id:'g',type:'gapfill',text:'Der [Igel] schläft.',points:2,gapColors:['blue']};const {w,container}=gapEditorHarness(t,q);
  const editor=container.querySelector('.gapComposer');const range=w.document.createRange();const text=editor.lastChild;range.setStart(text,1);range.setEnd(text,8);w.getSelection().addRange(range);
  [...container.querySelectorAll('button')].find(button=>button.textContent==='Als Lücke markieren').click();
  assert.equal(q.text,'Der [Igel] [schläft].');assert.deepEqual([...q.gapColors],['blue','']);assert.equal(container.querySelectorAll('.gapColorEditor select').length,2);
  assert.deepEqual(buildPublicQuestion(q,'secret').segments.filter(segment=>segment.type==='gap').map(segment=>segment.color),['blue',undefined]);
});
