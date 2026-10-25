'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const W=require('../lib/learning-brain/workshop');
const topic={subject:'math',title:'Winkel messen und zeichnen',goal:'Den zweiten Schenkel zu einem gegebenen Winkel setzen'};
const config={tool:'angle-protractor',version:1,role:'answer',goal:'set-angle',minimum:0,maximum:180,step:5,initialValue:0,instruction:'Stelle den zweiten Schenkel ein.'};
const task=(c=config,values=['65'])=>({id:'angle-task',input:'workshop',workshop:c,answer:{kind:'number',values}});
const send=actions=>({tool:'angle-protractor',version:1,taskId:'angle-task',actions});
test('math angle topics offer a bounded protractor without a private answer in public config',()=>{
 assert.ok(W.toolsFor(topic).some(t=>t.id==='angle-protractor'));assert.ok(!W.toolsFor({subject:'german',title:'Winkel im Text'}).some(t=>t.id==='angle-protractor'));
 const c=W.validateConfig({...config,privateTarget:65},topic,task());assert.equal(c.tool,'angle-protractor');assert.equal(c.privateTarget,undefined);assert.equal(c.initialValue,0);
});
test('observations replay actual angle actions and reset restores neutral ray, never client final state',()=>{
 const result=W.observe(task(),send([{type:'set-value',value:65}]));assert.equal(result.answer,'65');assert.deepEqual(result.final,{value:65});
 assert.equal(W.observe(task(),send([{type:'set-value',value:65},{type:'reset',value:0}])).answer,'0');
 assert.throws(()=>W.observe(task(),{...send([]),final:{value:65}}));assert.throws(()=>W.observe(task(),send([])));assert.throws(()=>W.observe(task(),send([{type:'reset',value:0}])));
});
test('scale and private keys agree exactly; arbitrary degrees, prefilled solutions and off-scale actions reject',()=>{
 for(const c of [{...config,minimum:-5},{...config,maximum:360},{...config,step:7},{...config,step:.5},{...config,initialValue:65}])assert.throws(()=>W.validateConfig(c,topic,task(c)));
 for(const values of [['64'],['181'],['NaN']])assert.throws(()=>W.validateConfig(config,topic,task(config,values)));
 for(const value of [-5,64,185,NaN,Infinity])assert.throws(()=>W.observe(task(),send([{type:'set-value',value}])));
 const fine={...config,step:1};assert.equal(W.validateConfig(fine,topic,task(fine,['64'])).step,1);assert.equal(W.observe(task(fine,['64']),send([{type:'set-value',value:64}])).answer,'64');
});
