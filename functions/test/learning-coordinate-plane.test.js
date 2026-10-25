'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const W=require('../lib/learning-brain/workshop');
const topic={subject:'math',title:'Punkte im Koordinatensystem setzen',goal:'Koordinaten im ersten und vierten Quadranten darstellen'};
const config=()=>({tool:'coordinate-plane',version:1,role:'answer',goal:'plot',instruction:'Setze die Punkte aus dem Auftrag.',xMin:-4,xMax:6,yMin:-4,yMax:6,step:1,labels:['B','A'],initialPoints:[]});
const task=(c=config(),values=['A:2|3;B:4|1'])=>({id:'coordinate-task',input:'workshop',workshop:c,answer:{kind:'open',values}});
const payload=actions=>({tool:'coordinate-plane',version:1,taskId:'coordinate-task',actions});
const set=(label,x,y)=>({type:'set-point',label,x,y});
test('coordinate tool is offered only for math coordinates and canonical public config contains no solution',()=>{
 assert.ok(W.toolsFor(topic).some(t=>t.id==='coordinate-plane'));assert.ok(!W.toolsFor({subject:'german',title:'Koordinaten im Text'}).some(t=>t.id==='coordinate-plane'));
 const c=W.validateConfig({...config(),answer:'A:2|3;B:4|1',html:'<script>'},topic,task());assert.deepEqual(c.labels,['A','B']);assert.deepEqual(c.initialPoints,[]);assert.equal(c.answer,undefined);assert.equal(c.html,undefined);
});
test('replayed point actions derive canonical answer and exact result; client final/success fields are rejected',()=>{
 const t=task();t.workshop=W.validateConfig(t.workshop,topic,t);
 const result=W.observe(t,payload([set('B',4,1),set('a',2,3)]));assert.deepEqual(result.final.points,[{label:'A',x:2,y:3},{label:'B',x:4,y:1}]);assert.equal(result.answer,'A:2|3;B:4|1');assert.equal(result.exactResult,true);assert.equal(result.complete,true);assert.equal(result.actionCount,2);
 assert.equal(W.observe(t,payload([set('A',2,3),set('B',4,2)])).exactResult,false);
 assert.throws(()=>W.observe(t,{...payload([set('A',2,3)]),final:{points:[{label:'A',x:2,y:3},{label:'B',x:4,y:1}]}}));
 assert.throws(()=>W.observe(t,payload([{...set('A',2,3),correct:true}])));
});
test('bounded scales and point actions require exact rational grid alignment and named labels',()=>{
 const t=task();for(const a of [set('C',1,1),set('A',2.5,3),set('A',7,3),set('A',2,Infinity),{type:'set-point',x:2,y:3}])assert.throws(()=>W.observe(t,payload([a])));
 for(const override of [{step:0},{step:.1},{xMax:6.5},{xMin:1},{labels:['A','a']},{labels:[]},{labels:['A;B']},{initialPoints:[{label:'C',x:1,y:1}]},{initialPoints:[{label:'A',x:1,y:1},{label:'A',x:2,y:2}]}])assert.throws(()=>W.validateConfig({...config(),...override},topic,task()));
 assert.throws(()=>W.observe(t,payload(Array.from({length:41},()=>set('A',1,1)))));
 const c={...config(),xMin:-.3,xMax:.3,yMin:-.3,yMax:.3,step:.1,labels:['a'],initialPoints:[]},decimalTask=task(c,['a:0,2|-0,1']);decimalTask.workshop=W.validateConfig(c,topic,decimalTask);assert.equal(W.observe(decimalTask,payload([set('A',.2,-.1)])).exactResult,true);
});
test('keys must contain complete finite on-grid points and initial state cannot prefill any accepted solution',()=>{
 for(const values of [[],['A:2|3'],['A:2|3;B:4|1;C:0|0'],['A:2|3;A:4|1'],['A:NaN|3;B:4|1'],['A:2.5|3;B:4|1'],['A:2|3;B:8|1'],['A:2|3;B:4|1;'],['hier stehen die Punkte']])assert.throws(()=>W.validateConfig(config(),topic,task(config(),values)));
 const ready={...config(),initialPoints:[{label:'a',x:2,y:3},{label:'b',x:4,y:1}]};assert.throws(()=>W.validateConfig(ready,topic,task(ready)));
 const t=task(config(),[' b : 4 | 1 ; a : 2 | 3 ','A:1|1;B:2|2']);t.workshop=W.validateConfig(t.workshop,topic,t);assert.equal(W.observe(t,payload([set('A',1,1),set('B',2,2)])).exactResult,true);
});
test('reset restores given points, partial actions remain help evidence and repeated moves replace rather than duplicate',()=>{
 const c={...config(),initialPoints:[{label:'A',x:0,y:0}]},t=task(c);t.workshop=W.validateConfig(c,topic,t);
 assert.equal(W.observe(t,payload([])).exactResult,null);assert.equal(W.observe(t,payload([set('A',1,2)])).complete,false);
 for(const reset of [{type:'reset'},{type:'reset',value:0}]){const result=W.observe(t,payload([set('B',4,1),set('A',2,3),reset]));assert.deepEqual(result.final.points,[{label:'A',x:0,y:0}]);assert.equal(result.answer,'A:0|0');assert.equal(result.exactResult,null);}
 const result=W.observe(t,payload([set('A',1,1),set('A',2,3),set('B',4,1)]));assert.equal(result.final.points.length,2);assert.equal(result.exactResult,true);
});
test('plot-and-connect replays undirected edge toggles and grades the complete point and edge sets',()=>{
 const c={...config(),goal:'plot-and-connect',labels:['C','A','B']},t=task(c,['A:2|3;B:4|1;C:1|1#c-b,a-c,b-a']);t.workshop=W.validateConfig(c,topic,t);
 const actions=[set('A',2,3),set('B',4,1),set('C',1,1),{type:'connect-points',from:'B',to:'A'},{type:'connect-points',from:'C',to:'B'},{type:'connect-points',from:'A',to:'C'}];
 const result=W.observe(t,payload(actions));assert.equal(result.answer,'A:2|3;B:4|1;C:1|1#A-B,A-C,B-C');assert.deepEqual(result.final.edges,[{from:'A',to:'B'},{from:'A',to:'C'},{from:'B',to:'C'}]);assert.equal(result.exactResult,true);
 const removed=W.observe(t,payload([...actions,{type:'connect-points',from:'C',to:'A'}]));assert.equal(removed.exactResult,false);assert.equal(removed.final.edges.length,2);
 const moved=W.observe(t,payload([...actions,set('A',3,3)]));assert.equal(moved.exactResult,false);assert.equal(moved.final.edges.length,3);
 assert.deepEqual(W.observe(t,payload([...actions,{type:'reset',value:0}])).final,{points:[],edges:[]});
});
test('connecting needs actually placed named points; private edge keys reject loops, duplicates and missing edges',()=>{
 const c={...config(),goal:'plot-and-connect'},correct=['A:2|3;B:4|1#A-B'];
 for(const value of ['A:2|3;B:4|1','A:2|3;B:4|1#','A:2|3;B:4|1#A-A','A:2|3;B:4|1#A-C','A:2|3;B:4|1#A-B,B-A','A:2|3;B:4|1#A-B#A-B'])assert.throws(()=>W.validateConfig(c,topic,task(c,[value])));
 const full={...c,initialPoints:[{label:'A',x:2,y:3},{label:'B',x:4,y:1}]},t=task(full,correct);t.workshop=W.validateConfig(full,topic,t);assert.equal(W.observe(t,payload([])).complete,false);assert.equal(W.observe(t,payload([{type:'connect-points',from:'b',to:'a'}])).exactResult,true);
 const emptyTask=task(c,correct);emptyTask.workshop=W.validateConfig(c,topic,emptyTask);assert.throws(()=>W.observe(emptyTask,payload([{type:'connect-points',from:'A',to:'B'}])));
 assert.throws(()=>W.observe(t,payload([{type:'connect-points',from:'A',to:'A'}])));assert.throws(()=>W.observe(t,payload([{type:'connect-points',from:'A',to:'C'}])));assert.throws(()=>W.observe(t,payload([{type:'connect-points',from:'A',to:'B',value:1}])));
 assert.throws(()=>W.observe(task(),payload([set('A',2,3),set('B',4,1),{type:'connect-points',from:'A',to:'B'}])));
});
