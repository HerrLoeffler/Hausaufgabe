'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const W=require('../lib/learning-brain/workshop');
const math={subject:'math',title:'Brüche am Zahlenstrahl verorten',goal:'Zahlen einordnen'};
const line={tool:'number-line',version:1,role:'answer',goal:'locate',minimum:0,maximum:1,step:0.125,initialValue:0,unit:'',instruction:'Setze die Zahl auf dem Zahlenstrahl.'};
const balance={tool:'balance',version:1,role:'answer',goal:'balance',leftCoefficient:2,leftConstant:2,rightCoefficient:0,rightConstant:10,minimum:0,maximum:10,step:1,initialValue:1,instruction:'Finde das Gewicht von x.'};
const key=(c,values,kind='rational')=>({id:'model-task-01',input:'workshop',workshop:c,answer:{kind,values}});
const send=(c,actions)=>({tool:c.tool,version:1,taskId:'model-task-01',actions});
test('number line records mathematical value and exact independent key, never pixels or client success',()=>{
 assert.equal(W.validateConfig(line,math,key(line,['1/2'])).tool,'number-line');
 const a=W.observe(key(line,['1/2']),send(line,[{type:'set-value',value:0.5}]));assert.equal(a.answer,'0.5');assert.equal(a.final.value,0.5);assert.equal(a.actionCount,1);
 assert.throws(()=>W.observe(key(line,['1/2']),{...send(line,[]),correct:true}));
});
test('number line validates representable targets and off-grid, huge or out-of-bounds actions',()=>{
 for(const value of [0.51,-1,2,Infinity])assert.throws(()=>W.observe(key(line,['1/2']),send(line,[{type:'set-value',value}])));
 assert.throws(()=>W.validateConfig({...line,step:0.000001},math,key(line,['1/2'])));
 assert.throws(()=>W.validateConfig(line,math,key(line,['1/3'])));
});
test('balance preserves equation through equal operations and derives both pan masses',()=>{
 const topic={subject:'math',title:'Unbekannte durch Umkehren finden',goal:'Gleichungen lösen'};
 assert.equal(W.validateConfig(balance,topic,key(balance,['4'])).tool,'balance');
 const a=W.observe(key(balance,['4']),send(balance,[{type:'shift-both',value:-2},{type:'divide-both',value:2},{type:'set-value',value:4}]));
 assert.equal(a.answer,'4');assert.deepEqual(a.final,{value:4,leftCoefficient:1,leftConstant:0,rightCoefficient:0,rightConstant:4,leftMass:4,rightMass:4});assert.equal(a.balanced,true);
 const b=W.observe(key(balance,['4']),send(balance,[{type:'set-value',value:5}]));assert.equal(b.balanced,false);assert.equal(b.final.leftMass,12);assert.equal(b.final.rightMass,10);
});
test('balance rejects one-sided actions, invalid division, negative weights and contradictory private keys',()=>{
 const t=key(balance,['4']);for(const action of [{type:'shift-left',value:1},{type:'divide-both',value:3},{type:'shift-both',value:-3},{type:'set-value',value:-1}])assert.throws(()=>W.observe(t,send(balance,[action])));
 assert.throws(()=>W.validateConfig(balance,{subject:'math',title:'Gleichung'},key(balance,['5'])));
});
test('short text selections preserve stable token indices and expose no model-provided grading decision',()=>{
 const c={tool:'text-workbench',version:1,role:'answer',goal:'text',mode:'select',text:'Der kleine Hund schläft.',tokens:[],instruction:'Markiere das Subjekt.'};
 const t=key(c,['Der kleine Hund'],'open');assert.equal(W.validateConfig(c,{subject:'german',title:'Satzglieder bestimmen'},t).mode,'select');
 const a=W.observe(t,send(c,[{type:'toggle-token',value:0},{type:'toggle-token',value:1},{type:'toggle-token',value:2}]));assert.equal(a.answer,'Der kleine Hund');assert.deepEqual(a.final.selected,[0,1,2]);
 assert.throws(()=>W.observe(t,send(c,[{type:'toggle-token',value:4}])));
});
test('sentence ordering replays only valid moves and reset restores original token order',()=>{
 const c={tool:'text-workbench',version:1,role:'answer',goal:'text',mode:'order',text:'',tokens:['spielt','Anna','heute.'],instruction:'Baue einen Satz.'},t=key(c,['Anna spielt heute.'],'open');
 assert.equal(W.validateConfig(c,{subject:'german',title:'Sätze bilden'},t).mode,'order');
 assert.equal(W.observe(t,send(c,[{type:'move-left',value:1}])).answer,'Anna spielt heute.');
 assert.equal(W.observe(t,send(c,[{type:'move-left',value:1},{type:'reset',value:0}])).answer,'spielt Anna heute.');
 assert.throws(()=>W.observe(t,send(c,[{type:'move-left',value:0}])));
});
test('tool selection is capability-scoped across subjects and no arbitrary markup/keys survive projection',()=>{
 assert.ok(W.toolsFor(math).some(t=>t.id==='number-line'));assert.ok(W.toolsFor({subject:'math',title:'Gleichungen lösen'}).some(t=>t.id==='balance'));
 assert.ok(W.toolsFor({subject:'german',title:'Satzglieder'}).some(t=>t.id==='text-workbench'));
 assert.deepEqual(W.toolsFor({subject:'chemistry',title:'Moleküle'}),[]);
 const c=W.validateConfig({...line,answer:'1/2',html:'<script>'},math,key(line,['1/2']));assert.equal(c.answer,undefined);assert.equal(c.html,undefined);
 assert.throws(()=>W.validateConfig(line,{subject:'german',title:'Zahlen im Text'},key(line,['1/2'])));
});
test('prefilled scale or balanced defaults cannot be submitted as independent evidence without a deliberate action',()=>{
 for(const [c,values] of [[{...line,initialValue:0.5},['1/2']],[{...balance,initialValue:4},['4']]]){
  assert.throws(()=>W.observe(key(c,values),send(c,[])));
  assert.throws(()=>W.observe(key(c,values),send(c,[{type:'reset',value:0}])));
  assert.equal(W.observe(key(c,values),send(c,[{type:'set-value',value:c.initialValue}])).answer,String(c.initialValue));
 }
});
test('generated numeric models cannot reveal the correct answer through the starting marker or a balanced initial scale',()=>{
 assert.throws(()=>W.validateConfig({...line,initialValue:0.5},math,key(line,['1/2'])));
 assert.throws(()=>W.validateConfig({...balance,initialValue:4},{subject:'math',title:'Gleichungen'},key(balance,['4'])));
});
