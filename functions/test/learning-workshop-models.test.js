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
const selection={tool:'text-workbench',version:1,role:'answer',goal:'text',mode:'select',text:'Am Morgen liest Lina ein Buch.',tokens:[],instruction:'Markiere die Zeitangabe.'};
const german={subject:'german',title:'Satzglieder bestimmen'};
const selectionTask=(config=selection,values=['Am Morgen'],prompt='Markiere die Satzgliedgruppe, die sagt, wann Lina liest.')=>({...key(config,values,'open'),prompt});
test('independent selection instructions cannot name the private answer span',()=>{for(const instruction of ['Markiere „Am Morgen“.','Markiere am Morgen.','Wähle die Wörter AM MORGEN aus.','Die gesuchte Gruppe lautet: Am Morgen.']){const c={...selection,instruction};assert.throws(()=>W.validateConfig(c,german,selectionTask(c)),/vorweg/);}});
test('quoting the full source in a prompt does not license a new answer reveal in its instruction',()=>{const c={...selection,instruction:'Markiere „Am Morgen“.'};assert.throws(()=>W.validateConfig(c,german,selectionTask(c,['Am Morgen'],'Im Satz „Am Morgen liest Lina ein Buch.“: Markiere die Zeitangabe.')),/vorweg/);});
test('selection guard permits ordinary instructions, intentional literal finding and supported explanations',()=>{assert.ok(W.validateConfig(selection,german,selectionTask()));const literal={...selection,instruction:'Markiere „Am Morgen“.'};assert.ok(W.validateConfig(literal,german,selectionTask(literal,['Am Morgen'],'Suche und markiere die Wörter „Am Morgen“ im Text.')));const support={...literal,role:'support'};assert.ok(W.validateConfig(support,german,{...selectionTask(support),input:'text'}));const context={...selection,instruction:'Lies zuerst: Am Morgen liest Lina ein Buch. Markiere dann die Zeitangabe.'};assert.ok(W.validateConfig(context,german,selectionTask(context)));});
test('single words need explicit naming; incidental function words and substrings do not trigger leaks',()=>{for(const [text,instruction,answer] of [['Am Morgen liest Lina ein Buch.','Markiere am Satzanfang die Zeitangabe.','Am'],['Zeit vergeht schnell.','Markiere die Zeitangabe.','Zeit'],['Lina liest ein Buch.','Markiere das Subjekt.','Lina']]){const c={...selection,text,instruction};assert.ok(W.validateConfig(c,german,selectionTask(c,[answer])));}for(const instruction of ['Markiere „Lina“.','Markiere Lina.']){const c={...selection,instruction};assert.throws(()=>W.validateConfig(c,german,selectionTask(c,['Lina'])),/vorweg/);}});
test('every literal answer alternative is checked while open rubric prose is not mistaken for a source span',()=>{const c={...selection,instruction:'Markiere „Am Morgen“.'};assert.throws(()=>W.validateConfig(c,german,selectionTask(c,['Morgens','Am Morgen'])),/vorweg/);assert.ok(W.validateConfig(selection,german,selectionTask(selection,['Eine korrekt markierte Zeitangabe im Satz.'])));});
test('redundant select tokens are accepted only when byte-for-byte equal to visible whitespace tokens and canonicalized empty',()=>{const c={...selection,text:'  Am\tMorgen  liest Lina ein Buch.\n',tokens:['Am','Morgen','liest','Lina','ein','Buch.']};const canonical=W.validateConfig(c,german,selectionTask(c));assert.deepEqual(canonical.tokens,[]);assert.equal(canonical.text,c.text);assert.deepEqual(c.tokens,['Am','Morgen','liest','Lina','ein','Buch.']);assert.equal(W.observe({...selectionTask(c),workshop:canonical},send(c,[{type:'toggle-token',value:0},{type:'toggle-token',value:1}])).answer,'Am Morgen');});
test('conflicting redundant selection tokens fail with a specific mode and field diagnostic without source text',()=>{for(const tokens of [['am','Morgen','liest','Lina','ein','Buch.'],['Am','Morgen','liest','Lina','ein','Buch'],['Morgen','Am','liest','Lina','ein','Buch.'],['Am','Morgen']]){const c={...selection,tokens};assert.throws(()=>W.validateConfig(c,german,selectionTask(c)),error=>{assert.match(error.message,/select.*tokens.*identisch/);assert.deepEqual(error.diagnostic,{tool:'text-workbench',mode:'select',field:'tokens',tokenCount:tokens.length,sourceTokenCount:6});assert.doesNotMatch(JSON.stringify(error.diagnostic),/Lina|Buch|Morgen/);return true;});}});
test('select and order count errors report the actual count and source field separately from schema problems',()=>{for(const [mode,text,tokens,count,field] of [['select','   ',[],0,'text'],['select','Einzelwort',[],1,'text'],['select',Array(41).fill('Wort').join(' '),[],41,'text'],['order','',['ein'],1,'tokens'],['order','',Array(41).fill('ein'),41,'tokens']]){const c={...selection,mode,text,tokens};assert.throws(()=>W.validateConfig(c,german,selectionTask(c)),error=>{assert.match(error.message,new RegExp(`${mode}.*${count}.*2 bis 40`));assert.deepEqual(error.diagnostic,{tool:'text-workbench',mode,field,tokenCount:count});assert.doesNotMatch(error.message,/Einzelwort/);return true;});}const c={...selection,tokens:'Am Morgen'};assert.throws(()=>W.validateConfig(c,german,selectionTask(c)),error=>{assert.match(error.message,/select.*tokens.*Array/);assert.equal(error.diagnostic.field,'tokens');return true;});});
