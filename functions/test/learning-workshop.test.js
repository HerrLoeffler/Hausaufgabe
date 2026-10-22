'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const workshop=require('../lib/learning-brain/workshop');
const topic={subject:'math',title:'Wertgleich erweitern',goal:'Brüche wertgleich erweitern'};
const config={tool:'fraction-board',version:1,role:'answer',goal:'equivalent',numerator:1,denominator:3,targetDenominator:6,instruction:'Zeige denselben Anteil in Sechsteln.'};
const task={id:'t-123',input:'workshop',workshop:config,answer:{kind:'exact-fraction',values:['2/6']}};
const payload=actions=>({tool:'fraction-board',version:1,taskId:'t-123',actions});
test('tool choice is constrained by actual capabilities and topic, not offered everywhere',()=>{assert.equal(workshop.toolsFor(topic).length,1);for(const t of [{subject:'german',title:'Bruch im Text'},{subject:'math',title:'Potenzgesetze'},{subject:'chemistry',title:'Moleküle'}])assert.deepEqual(workshop.toolsFor(t),[]);});
test('server replays partitioning as equal-value subdivision and derives answer rather than trusting client',()=>{const r=workshop.observe(task,payload([{type:'partition',value:2}]));assert.equal(r.answer,'2/6');assert.deepEqual(r.final,{numerator:2,denominator:6});assert.equal(r.valuePreserved,true);assert.equal(r.targetReached,true);assert.equal(r.changes[0].type,'partition');});
test('denominator-only change is observable and never accepted as equal value',()=>{const r=workshop.observe(task,payload([{type:'set-parts',value:6}]));assert.equal(r.answer,'1/6');assert.equal(r.valuePreserved,false);assert.equal(r.targetReached,false);});
test('marking arbitrary cells counts actual area, reset returns to original model',()=>{let r=workshop.observe(task,payload([{type:'set-parts',value:6},{type:'toggle-part',value:4}]));assert.equal(r.answer,'2/6');r=workshop.observe(task,payload([{type:'partition',value:3},{type:'reset',value:0}]));assert.equal(r.answer,'1/3');});
test('invalid, stale, oversized and forged workshop submissions fail closed',()=>{for(const p of [payload([{type:'partition',value:0}]),payload([{type:'toggle-part',value:36}]),payload([{type:'set-parts',value:10000}]),payload([{type:'partition',value:6},{type:'partition',value:6}]),payload(Array.from({length:61},()=>({type:'reset',value:0}))),{...payload([]),taskId:'other'},{...payload([]),tool:'molecule'},{...payload([]),final:{numerator:2,denominator:6}},{...payload([]),version:2}])assert.throws(()=>workshop.observe(task,p));});
test('configuration and private numeric key must match requested source and target exactly',()=>{assert.deepEqual(workshop.validateConfig(config,topic,task),config);for(const c of [{...config,denominator:0},{...config,targetDenominator:7},{...config,numerator:9},{...config,tool:'molecule'}])assert.throws(()=>workshop.validateConfig(c,topic,task));assert.throws(()=>workshop.validateConfig(config,{subject:'german'},task));assert.throws(()=>workshop.validateConfig(config,topic,{...task,answer:{kind:'rational',values:['1/6']}}));});

test('ten successful manipulations alone never establish unassisted mastery',()=>{
 const {projectSkill}=require('../lib/learning-brain/core');
 const events=Array.from({length:10},(_,i)=>({independent:true,correct:true,level:2,tool:'fraction-board',fingerprint:'tool-'+i,sessionId:i<5?'a':'b',family:i%2?'apply':'reason',at:i+1}));
 assert.equal(projectSkill(events).status,'practicing');
 events[8].tool=null;events[9].tool=null;assert.equal(projectSkill(events).status,'secure');
});

test('follow-up help replays from the visible failed state and reset preserves that starting point',()=>{
 const follow={...task,workshop:{...config,initialState:{parts:6,selected:[0]}}};
 assert.equal(workshop.observe(follow,payload([])).answer,'1/6');
 assert.equal(workshop.observe(follow,payload([{type:'toggle-part',value:1}])).answer,'2/6');
 assert.equal(workshop.observe(follow,payload([{type:'partition',value:2},{type:'reset',value:0}])).answer,'1/6');
});
