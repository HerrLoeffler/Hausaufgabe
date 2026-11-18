'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {buildGraph,visibleGraph,checkGraph,graphAnswer,GRAPH_CASES}=require('./graph.cjs');
const {present,score}=require('../review.cjs');
test('one field-and-arrow contract builds language and numerical chains with private answers',()=>{
  const p={kind:'chain',title:'Verbformen',subject:'Englisch',text:'Ergänze die Simple-Past-Formen.',reason:'Umformung',
    paths:[{title:'Verb',steps:[{type:'text',text:'go'},{type:'arrow',text:'Simple Past'},{type:'field',fieldId:'past'}]}],
    fields:[{id:'past',label:'Simple Past',mode:'text',options:[],accepted:['went'],calculation:{op:'none',left:'',right:''}}]};
  const q=buildGraph(p,{id:'english'});
  assert.equal(q.type,'diagram');assert.equal(score(q,{past:'went'}),.5);assert.equal(score(q,{past:'goed'}),0);
  assert.doesNotMatch(JSON.stringify(present('training:graph','training',q)),/"accepted"|"solution"/);
  assert.equal(visibleGraph(q).fields[0].id,'past');
  assert.deepEqual(graphAnswer(q),{past:'went'});
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
