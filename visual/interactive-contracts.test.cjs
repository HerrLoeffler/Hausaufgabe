'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('./core.js');
const adapters = [require('../functions/lib/visual-task.js'), require('../assessment-functions/lib/visual-task.js')];
globalThis.GC2 = core;
const browser = import('../visual-tasks.mjs');
const base = format => ({schemaVersion:2,id:`test-${format}`,revision:0,format,title:'Interaktive Aufgabe',subject:'NT',grade:'6',prompt:'Ordne die Karten zu.',hint:'Du kannst deine Auswahl ändern.',maxPoints:4,objective:'Zusammenhänge erkennen.',rationale:'Die Zuordnung prüft den Zusammenhang.',sourceNote:'Eigenes Beispiel.'});
const timeline = () => ({...base('timeline'),spec:{min:1900,max:2000,unit:'Jahr',ticks:[{id:'early',value:1914,label:'1914'},{id:'middle',value:1945,label:'1945'},{id:'late',value:1989,label:'1989'}],events:[{id:'mauer',text:'Fall der Berliner Mauer'},{id:'krieg',text:'Beginn des Ersten Weltkriegs'},{id:'ende',text:'Ende des Zweiten Weltkriegs in Europa'}]},solution:{assignments:{early:'krieg',middle:'ende',late:'mauer'}}});
const sequence = () => ({...base('sequence'),spec:{family:'butterfly',items:[{id:'wing',illustration:'butterfly',caption:'Schmetterling'},{id:'shell',illustration:'chrysalis',caption:'Puppe'},{id:'tiny',illustration:'egg',caption:'Ei'},{id:'crawl',illustration:'caterpillar',caption:'Raupe'}]},solution:{order:['tiny','crawl','shell','wing']}});
const question = task => ({type:'visual',points:task.maxPoints,visualTask:JSON.stringify(task)});

test('timeline and sequence pass private and solution-free public browser/server contracts', async () => {
  const B = await browser;
  for (const make of [timeline, sequence]) {
    const task = make();
    assert.deepEqual(core.validate(task), []);
    for (const A of adapters) assert.deepEqual(A.parseVisualTask(JSON.stringify(task), {points:4}), task);
    assert.deepEqual(B.parseVisualTask(question(task)), task);
    const publicTask = core.publicTask({...task,review:{status:'approved'},provenance:{kind:'template',offline:true}});
    for (const key of ['solution','rationale','review','provenance']) assert.equal(Object.hasOwn(publicTask,key), false);
    assert.deepEqual(B.parseVisualTask(question(publicTask), {publicOnly:true}), publicTask);
    assert.equal(Object.hasOwn(publicTask, 'solution'), false, 'synthetic key must remain private');
    for (const A of adapters) assert.deepEqual(JSON.parse(A.publicVisualTask(JSON.stringify(task))), core.publicTask(task));
  }
});

test('timeline scores independent placements, permits cleared slots and rejects duplicate or foreign cards', () => {
  const task = timeline();
  assert.deepEqual(core.solutionResponse(task), {early:'krieg',middle:'ende',late:'mauer'});
  assert.match(core.solutionText(task), /1914.*Beginn des Ersten Weltkriegs/);
  assert.equal(core.grade(task,{early:'krieg',middle:'ende',late:'mauer'}).points,4);
  assert.equal(core.grade(task,{early:'krieg',middle:'ende'}).points,2.5);
  assert.equal(core.grade(task,{early:'krieg',middle:null,late:null}).points,1);
  for (const answer of [null,{},[],{early:'mauer',middle:'krieg',late:'ende'},{early:'krieg',middle:'krieg'},{early:'krieg',other:'ende'},{early:'missing'},{early:{id:'krieg'}}]) assert.equal(core.grade(task,answer).points,0,JSON.stringify(answer));
  assert.equal(core.isAnswered(task,{early:'krieg',middle:'ende',late:'mauer'}),true);
  for (const answer of [null,{}, {early:'krieg'}, {early:'krieg',middle:null,late:'mauer'}, {early:'krieg',middle:'krieg',late:'mauer'}, {early:'krieg',middle:'ende',late:'mauer',extra:null}]) assert.equal(core.isAnswered(task,answer),false,JSON.stringify(answer));
});

test('sequence scores correct positions and treats untouched, partial and duplicate responses consistently', () => {
  const task = sequence();
  assert.deepEqual(core.solutionResponse(task), ['tiny','crawl','shell','wing']);
  assert.equal(core.solutionText(task),'Ei → Raupe → Puppe → Schmetterling');
  assert.equal(core.grade(task,['tiny','crawl','shell','wing']).points,4);
  assert.equal(core.grade(task,['tiny','crawl','wing','shell']).points,2);
  assert.equal(core.grade(task,['tiny']).points,1);
  for (const answer of [null,[],{},[null,'crawl',null,null],['wing','shell','crawl','tiny'],['tiny','tiny','shell','wing'],['tiny','crawl','shell','foreign'],['tiny','crawl','shell','wing','tiny']]) assert.equal(core.grade(task,answer).points,0,JSON.stringify(answer));
  assert.equal(core.isAnswered(task,['tiny','crawl','wing','shell']),true);
  for (const answer of [null,[],['tiny'],[null,'crawl','shell','wing'],['tiny','tiny','shell','wing'],['tiny','crawl','shell','foreign']]) assert.equal(core.isAnswered(task,answer),false,JSON.stringify(answer));
});

test('bounded timeline geometry rejects invalid ticks and mapping on every validator', async () => {
  const B = await browser;
  const mutations = [
    t => t.id='constructor',
    t => t.revision=-1,
    t => t.untrusted='extra',
    t => t.spec.min=t.spec.max,
    t => t.spec.unit={},
    t => t.spec.ticks.reverse(),
    t => t.spec.ticks[1].value=t.spec.ticks[0].value,
    t => t.spec.ticks[0].value=1800,
    t => t.spec.ticks[0].id='constructor',
    t => t.spec.ticks[0].id='bad id',
    t => t.spec.ticks[0].label='',
    t => t.spec.events[1].id=t.spec.events[0].id,
    t => t.spec.events[0].text='<svg>',
    t => t.spec.events.pop(),
    t => t.spec.ticks=Array.from({length:7},(_,i)=>({id:'t'+i,value:1900+i,label:String(1900+i)})),
    t => t.spec.ticks[0].answer='krieg',
    t => t.spec.events[0].year=1989,
    t => t.spec.extra='untrusted',
    t => t.solution.assignments.middle='krieg',
    t => delete t.solution.assignments.middle,
    t => t.solution.assignments.extra='mauer',
    t => t.solution.order=['krieg'],
  ];
  for (const mutate of mutations) {
    const task=timeline(); mutate(task);
    assert.ok(core.validate(task).length, mutate.toString());
    for (const A of adapters) assert.throws(()=>A.parseVisualTask(JSON.stringify(task)), mutate.toString());
    assert.throws(()=>B.parseVisualTask(question(task)), mutate.toString());
    // Invalid private keys do not invalidate otherwise sound public geometry.
    if (JSON.stringify(task.spec)!==JSON.stringify(timeline().spec)) assert.throws(()=>B.parseVisualTask(question(core.publicTask(task)),{publicOnly:true}),mutate.toString());
  }
});

test('new public templates do not encode the answer in serial card IDs', () => {
  const task=core.example('sequence');
  const ids=task.spec.items.map(item=>item.id);
  assert.notDeepEqual([...ids].sort(),task.solution.order);
  assert.notDeepEqual(ids,task.solution.order);
  const time=core.example('timeline');
  assert.notDeepEqual(Object.values(time.solution.assignments),time.spec.events.map(e=>e.id).sort());
});

test('sequence constrains all four illustration IDs to one family and closes nested records', async () => {
  const B = await browser;
  for (const mutate of [t=>t.spec.family='unknown',t=>t.spec.items.pop(),t=>t.spec.items[0].illustration='evaporation',t=>t.spec.items[0].illustration=t.spec.items[1].illustration,t=>t.spec.items[0].id='__proto__',t=>t.spec.items[0].caption='',t=>t.spec.items[0].url='https://example.test',t=>t.spec.order=['tiny'],t=>t.solution.order=['tiny','tiny','shell','wing'],t=>t.solution.order=['tiny','crawl','shell'],t=>t.solution.extra=true]) {
    const task=sequence();mutate(task);
    assert.ok(core.validate(task).length,mutate.toString());
    for (const A of adapters) assert.throws(()=>A.parseVisualTask(JSON.stringify(task)),mutate.toString());
    assert.throws(()=>B.parseVisualTask(question(task)),mutate.toString());
    if (JSON.stringify(task.spec)!==JSON.stringify(sequence().spec)) assert.throws(()=>B.parseVisualTask(question(core.publicTask(task)),{publicOnly:true}),mutate.toString());
  }
});

test('template examples cover all three sequence families without a public solution', async () => {
  const B=await browser;
  for (const family of ['butterfly','water-cycle','plant-growth']) {
    const task=core.example('sequence',{family});
    assert.equal(task.spec.family,family);
    assert.equal(core.validate(task).length,0);
    assert.equal(core.grade(task,core.solutionResponse(task)).points,task.maxPoints);
    assert.doesNotThrow(()=>B.parseVisualTask(question(core.publicTask(task)),{publicOnly:true}));
  }
  assert.equal(core.validate(core.example('timeline')).length,0);
  for (const file of ['functions/lib/visual/core.js','assessment-functions/lib/visual/core.js']) assert.equal(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),fs.readFileSync(path.join(__dirname,'core.js'),'utf8'));
});
