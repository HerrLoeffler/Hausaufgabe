import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
globalThis.GC2 = require('./visual/core.js');
const V = await import('./visual-tasks.mjs');

test('all twelve approved interactions roundtrip teacher and solution-free public contracts', () => {
  assert.equal(V.VISUAL_FORMATS.length, 12);
  for (const format of V.VISUAL_FORMATS) {
    const task = GC2.example(format);
    const question = { type:'visual', points: task.maxPoints, visualTask: JSON.stringify(task) };
    assert.deepEqual(V.parseVisualTask(question), task);
    const publicTask = GC2.publicTask(task);
    assert.deepEqual(V.parseVisualTask({ ...question, visualTask: JSON.stringify(publicTask) }, { publicOnly:true }), publicTask);
    assert.equal(V.visualAnswered(question, GC2.solutionResponse(task)), true);
    assert.equal(V.evaluateVisual(question, GC2.solutionResponse(task)).awarded, task.maxPoints);
    assert.equal(V.evaluateVisual(question, null).awarded, 0);
  }
});
test('rejects dangerous renderer IDs, markup geometry, excessive loops and malformed JSON', () => {
  const check = task => assert.throws(() => V.parseVisualTask({visualTask:JSON.stringify(task)}, {publicOnly:true}));
  let task = GC2.publicTask(GC2.example('connections')); task.spec.nodes[0].id = 'a\" onclick=\"bad'; check(task);
  task = GC2.publicTask(GC2.example('angle')); task.spec.degrees = '70\" onload=\"bad'; check(task);
  task = GC2.publicTask(GC2.example('scale')); task.spec.step = 1e-100; check(task);
  task = GC2.publicTask(GC2.example('chart')); task.spec.step = 0; check(task);
  task = GC2.publicTask(GC2.example('table')); task.spec.rows = Array(1000).fill(task.spec.rows[0]); check(task);
  assert.throws(() => V.parseVisualTask({visualTask:'no JSON'}));
});
test('existing native menu types remain and visual fields survive every frontend boundary', () => {
  const app = fs.readFileSync('app.js','utf8');
  for (const type of ['single','multi','number','visual']) assert.match(app, new RegExp('\\["'+type+'",'));
  assert.match(app, /base\.visualTask\s*=/);
  assert.match(app, /q\.visualTask\s*=\s*normalizeVisualTask/);
  assert.match(app, /mountVisualQuestion\(section, q/);
  assert.match(fs.readFileSync('secure-student.js','utf8'), /mountVisualQuestion\(section, question/);
  for (const page of ['index.html','secure-student.html']) {
    const html = fs.readFileSync(page,'utf8');
    assert.ok(html.indexOf('visual/legacy-core.js') < html.indexOf('visual/core.js'));
    assert.ok(html.includes('visual/renderers.js'));
  }
});

test('teacher serialization, AI single/whole revisions and reload retain visual data with changed points', async () => {
  const { default:vm } = await import('node:vm');
  const app=fs.readFileSync('app.js','utf8');
  const source=name=>app.match(new RegExp('function '+name+'\\([^]*?\\n}\\n'))[0];
  const context=vm.createContext({normalizeVisualTask:V.normalizeVisualTask,round1:n=>Math.round(n*10)/10,getQuestionAudioSrc:()=>'',getQuestionImageSrc:()=>''});
  vm.runInContext(source('sanitizeQuestionForSave')+source('questionForAi'),context);
  for(const format of V.VISUAL_FORMATS){
    const task=GC2.example(format),q={type:'visual',text:task.prompt,points:3,visualTask:JSON.stringify(task)};
    const saved=context.sanitizeQuestionForSave(q),ai=context.questionForAi(q);
    assert.equal(JSON.parse(saved.visualTask).maxPoints,3);
    assert.equal(ai.visualTask,saved.visualTask);
    assert.equal(V.parseVisualTask(JSON.parse(JSON.stringify(saved))).format,format);
  }
});
test('visual changes invalidate an in-flight Emmi edit fingerprint and stored nested answers decode', async () => {
  const {questionReviewKey}=await import('./ai-review-state.js');
  const task=GC2.example('connections'),q={type:'visual',visualTask:JSON.stringify(task)};
  const before=questionReviewKey(q);task.spec.nodes[0].label='Neue Bezeichnung';q.visualTask=JSON.stringify(task);
  assert.notEqual(questionReviewKey(q),before);
  const answer=GC2.solutionResponse(task);
  assert.deepEqual(V.decodeVisualAnswer(JSON.stringify(answer)),answer);
  assert.equal(V.visualAnswered(q,JSON.stringify(answer)),true);
});

test('two directed diagrams use distinct arrow marker IDs and local matching references', async () => {
  const { default:vm } = await import('node:vm');
  const window={GC2};
  const document={activeElement:null,addEventListener(){},removeEventListener(){}};
  vm.runInNewContext(fs.readFileSync('visual/renderers.js','utf8'),{window,document});
  const makeHost=()=>({innerHTML:'',contains:()=>false,addEventListener(){},querySelectorAll:()=>[]});
  const task=GC2.publicTask(GC2.example('connections'));
  const hosts=[makeHost(),makeHost()];
  hosts.forEach(host=>window.GCRenderer.mount(host,task,[['a','b'],['b','c']]));
  const ids=hosts.map(host=>host.innerHTML.match(/<marker id="([^"]+)"/)[1]);
  assert.notEqual(ids[0],ids[1]);
  for(let i=0;i<hosts.length;i++){
    assert.match(ids[i],/^gc-visual-arrow-\d+$/);
    const references=[...hosts[i].innerHTML.matchAll(/marker-end="url\(#([^)]*)\)"/g)].map(match=>match[1]);
    assert.deepEqual(references,[ids[i],ids[i]]);
    assert.doesNotMatch(hosts[i].innerHTML,/\$\{markerId\}/);
  }
});

test('native numeric practice evaluation accepts fractions with server parity and rejects blank zero', async () => {
  const { default:vm } = await import('node:vm');
  const app=fs.readFileSync('app.js','utf8');
  const evaluate=app.match(/function evaluateAnswer\([^]*?\n}\n/)[0];
  const context=vm.createContext({round1:n=>Math.round(n*10)/10,parseNumericAnswer:V.parseNumericAnswer});
  vm.runInContext(evaluate,context);
  const cases=[
    ['1/2',.5,true],[' 1 / 2 ',.5,true],['0,5',.5,true],['½',.5,true],
    ['−1/2',-.5,true],[0,0,true],['0',0,true],['',0,false],['   ',0,false],
    [null,0,false],[undefined,0,false],['1/0',0,false],['0/0',0,false],
    ['1/2/3',.5,false],['abc',0,false],['Infinity',0,false],['0x10',16,false]
  ];
  const {gradeQuestion}=require('./assessment-functions/lib/assessment-core.js');
  for(const [answer,expected,correct] of cases){
    const server=gradeQuestion({type:'number',numericAnswer:expected,tolerance:0,points:2},answer);
    const result=context.evaluateAnswer({type:'number',numericAnswer:expected,tolerance:0,points:2},answer);
    assert.equal(result.correct,correct,JSON.stringify(answer));
    assert.equal(result.correct,server.correct,`server parity: ${JSON.stringify(answer)}`);
    assert.equal(result.awarded,correct?2:0,JSON.stringify(answer));
    assert.equal(result.awarded,server.awardedPoints,`server points: ${JSON.stringify(answer)}`);
  }
});

test('the actual editor template type menu matches runtime types including loaded visual tasks', () => {
  const html=fs.readFileSync('index.html','utf8');
  const template=html.match(/<template id="questionTemplate">([^]*?)<\/template>/)[1];
  const select=template.match(/<select class="qType">([^]*?)<\/select>/)[1];
  const optionTypes=[...select.matchAll(/<option value="([^"]+)"/g)].map(match=>match[1]);
  const runtime=fs.readFileSync('app.js','utf8').match(/const QUESTION_TYPES = (\[[^]*?\n\]);/)[1];
  assert.deepEqual(optionTypes,Function('return '+runtime)().map(([value])=>value));
  assert.equal(optionTypes.filter(value=>value==='visual').length,1);
});
