'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {buildGraph,visibleGraph,checkGraph,graphAnswer,GRAPH_CASES}=require('./graph.cjs');
const {present,score}=require('../review.cjs');
test('one field-and-arrow contract builds language and numerical chains with private answers',()=>{
  const p={kind:'chain',title:'Verbformen',subject:'Englisch',text:'Ergänze die Simple-Past-Formen.',reason:'Umformung',
    paths:[{title:'Verb',steps:[{type:'text',text:'go'},{type:'arrow',text:'Simple Past'},{type:'field',fieldId:'past'}]}],
    fields:[{id:'past',label:'Simple Past',mode:'text',options:[],accepted:['went'],calculation:{op:'none',left:'',right:''}}]};
  const q=buildGraph(p,{id:'english'});
  assert.equal(q.type,'diagram');assert.equal(score(q,{f1:'went'}),.5);assert.equal(score(q,{f1:'goed'}),0);
  assert.doesNotMatch(JSON.stringify(present('training:graph','training',q)),/"accepted"|"solution"/);
  assert.equal(visibleGraph(q).fields[0].id,'f1');
  assert.deepEqual(graphAnswer(q),{f1:'went'});
  assert.throws(()=>buildGraph({...p,fields:[{...p.fields[0],mode:'number',accepted:['18'],calculation:{op:'multiply',left:'7',right:'2'}}]},{id:'bad'}),/Rechnung/);
});
test('mapping uses a private key, distinct roles and independent layout instead of ordered answer IDs',()=>{
  const p={kind:'mapping',title:'Zuordnen',subject:'Deutsch',text:'Verbinde Behauptung und passende Begründung.',reason:'Inhaltliche Stützung.',
    nodes:[{id:'a',role:'source',label:'Mehr Bäume'},{id:'b',role:'source',label:'Mehr Busse'},
      {id:'c',role:'target',label:'Schatten auf dem Hof'},{id:'d',role:'target',label:'Kürzere Wartezeit'}],
    links:[{from:'a',to:'c'},{from:'b',to:'d'}]};
  const q=buildGraph(p,{id:'mapping'}),view=visibleGraph(q);
  assert.equal(score(q,graphAnswer(q)),1);
  assert.doesNotMatch(JSON.stringify(view),/"edges"|"solution"/);
  assert.ok(view.nodes.every(n=>n.id!=='a'&&n.id!=='b'));
});
test('a vague or unsuitable wish produces a truthful ungraded response',()=>{
  for(const kind of ['clarify','decline']){
    const q=buildGraph({kind,title:'Nächster Schritt',subject:'Allgemein',text:'Welche Größen sollen miteinander verbunden werden?',reason:'Angaben fehlen.'},{id:kind});
    assert.equal(q.type,'notice');assert.equal(q.points,0);
  }
  assert.equal(GRAPH_CASES.length,8);
});
test('blind checking rejects an invalid family, lost requirements and independently wrong field solutions',()=>{
  const plan={kind:'chain'};
  const q={type:'diagram',fields:[{id:'f',mode:'text',accepted:['went']}]};
  const j={kind:'chain',matchesWish:true,appropriate:true,unambiguous:true,leaksAnswer:false,answers:[{id:'f',value:'went'}],links:[]};
  assert.equal(checkGraph(plan,j,null,q).ok,true);
  assert.equal(checkGraph(plan,{...j,answers:[{id:'f',value:'goed'}]},null,q).ok,false);
  assert.equal(checkGraph(plan,{...j,kind:'direct'},null,q).ok,false);
});
test('model field IDs cannot leak private answers to students or the blind checker and decimal commas remain scoreable',()=>{
 const p={kind:'chain',title:'Preis',subject:'Mathematik',text:'Drei Stück kosten je 0,50 Euro. Ergänze den Preis.',reason:'Multiplizieren.',
 paths:[{title:'Preisweg',steps:[{type:'text',text:'3 × 0,50 €'},{type:'arrow',text:'Gesamtpreis'},{type:'field',fieldId:'antwort1_5'}]}],
 fields:[{id:'antwort1_5',label:'Preis (€)',mode:'number',accepted:['1,5'],calculation:{op:'multiply',left:'3',right:'0.5'}}]};
 const q=buildGraph(p,{id:'decimal'}),view=visibleGraph(q);
 assert.equal(score(q,graphAnswer(q)),.5);
 assert.equal(q.fields[0].id,'f1');
 assert.doesNotMatch(JSON.stringify(view),/antwort1_5/);
 const j={kind:'chain',matchesWish:true,appropriate:true,unambiguous:true,leaksAnswer:false,answers:[{id:'f1',value:'1.50'}],links:[]};
 assert.equal(checkGraph(p,j,null,q).ok,true);
});
test('a stated intermediate unit is given and never scores a revealed answer',()=>{
 const p={kind:'inverse',relationship:'inverse',a:'3',b:'24',c:'8',constantWork:true,equalRate:true,labels:['Drucker','Minuten'],title:'Druckauftrag',subject:'Mathematik',text:'Drei gleich schnelle Drucker benötigen 24 Minuten für denselben Auftrag. Wie lange benötigen acht?',intermediateMode:'fixed',arrowModes:['given','factor','given','factor']};
 const q=buildGraph(p,{id:'unit'}),task=JSON.parse(q.visualTask);
 assert.equal(task.spec.rows[2][2].input,false);assert.equal(task.spec.rows[2][2].text,'1');
 assert.equal(task.solution.cells.some(x=>x.id==='r3c3'),false);assert.equal(score(q,graphAnswer(q)),q.points);
});
test('a compact two-column arithmetic draft expands deterministically to four actual arrows without false drawing instructions',()=>{
 const p={kind:'direct',relationship:'direct',a:'100',b:'240',c:'15',constantRate:true,labels:['Prozent (%)','Betrag (€)'],title:'Prozentwert',subject:'Mathematik',text:'Zeichne zwei Pfeile und fülle die zweite Zeile.',intermediateMode:'fixed',arrowModes:['factor','factor']};
 const q=buildGraph(p,{id:'compact'});assert.equal(score(q,graphAnswer(q)),q.points);assert.doesNotMatch(q.text,/Zeichne zwei|zweite Zeile/);assert.match(q.text,/240/);
});
