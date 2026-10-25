'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {projectNetwork,chooseCompetency}=require('../lib/learning-brain/network');
const parent={id:'math-parent',subject:'math',grade:6,track:'R',area:'Brüche',modality:'text'};
const child=(id,extra={})=>({...parent,id,parentTopicId:parent.id,title:id,goal:'Brüche vergleichen',prerequisites:[],assessmentScope:'digital',evidenceBoundary:'Nur diese digitale Teilkompetenz.',source:{url:'https://example.org/curriculum'},...extra});
const catalog={version:'c',competencyVersion:'n1',topics:[parent],competencies:[child('math-base'),child('math-next',{prerequisites:['math-base']}),child('german-six',{subject:'german',title:'Wörter ordnen'}),child('math-five',{grade:5})]};
const success=()=>Array.from({length:10},(_,i)=>({at:100+i,independent:true,correct:true,level:2,fingerprint:'f'+i,family:i%2?'apply':'explain',sessionId:i<5?'s1':'s2'}));
const failure=(fingerprint,at)=>({at,independent:true,correct:false,level:1,fingerprint,family:'compare',sessionId:'s'});
test('unknown children stay unassessed despite legacy parent mastery, with public metadata only',()=>{
 const c=globalThis.structuredClone(catalog);c.competencies[0].privateKey='secret';
 const n=projectNetwork(c,{[parent.id]:success()}, {},200,{grade:6,track:'R',subject:'math'});
 assert.deepEqual(n.nodes.map(x=>x.state),['unassessed','unassessed']);assert.equal(n.version,'n1');
 assert.equal(n.nextTopicId,'math-base');assert.equal(n.nodes[0].evidence.independent,0);assert.equal(JSON.stringify(n).includes('secret'),false);
 assert.deepEqual(n.edges,[{from:'math-base',to:'math-next',type:'prerequisite'}]);
});
test('a single wrong answer is practicing; repeated independent errors and actual help show using-help',()=>{
 const one={'math-base':[failure('a',101)]};assert.equal(projectNetwork(catalog,one,{},200,{grade:6}).nodes[0].state,'practicing');
 const repeated={'math-base':[failure('a',101),failure('b',102)]};assert.equal(projectNetwork(catalog,repeated,{},200,{grade:6}).nodes[0].state,'using-help');
 const sessions={s:{topic:catalog.competencies[0],phase:'help',deadline:1000,events:[]}};
 const node=projectNetwork(catalog,{},sessions,200,{grade:6}).nodes[0];assert.equal(node.state,'using-help');assert.equal(node.active,true);assert.equal(node.evidence.independent,0);
});
test('secure and review states require varied independent evidence, limited to digital assessment',()=>{
 const c=globalThis.structuredClone(catalog);c.competencies[1].assessmentScope='preparation';
 const events={'math-base':success(),'math-next':success()};
 const n=projectNetwork(c,events,{},200,{grade:6,subject:'math'});assert.equal(n.nodes[0].state,'demonstrated');assert.equal(n.nodes[1].state,'practicing');assert.notEqual(n.nodes[1].evidence.status,'secure');
 assert.equal(projectNetwork(c,events,{},86400200,{grade:6,subject:'math'}).nodes[0].state,'review');
});
test('recommendations respect context and choose prerequisites only as a suggestion without transferring mastery',()=>{
 const events={'math-next':[failure('a',100),failure('b',101)],'math-five':[failure('x',102)]};
 assert.equal(chooseCompetency(catalog,events,{grade:6,track:'R',subject:'math',parentTopicId:parent.id},200).id,'math-base');
 assert.equal(chooseCompetency(catalog,events,{grade:6,subject:'german'},200).id,'german-six');
 events['math-base']=success();assert.equal(chooseCompetency(catalog,events,{grade:6,subject:'math'},200).id,'math-next');
 assert.equal(projectNetwork(catalog,{'math-next':success()}, {},200,{grade:6,subject:'math'}).nodes[0].state,'unassessed');
});
test('out-of-context prerequisites never manufacture cross-grade readiness',()=>{
 const c=globalThis.structuredClone(catalog);c.competencies[1].prerequisites=['math-five'];
 assert.equal(chooseCompetency(c,{}, {grade:6,subject:'math',parentTopicId:parent.id},200).grade,6);
});

test('automatic help after a confirmed error survives leaving the lesson without becoming mastery evidence',()=>{
 const {transition}=require('../lib/learning-brain/core');
 const topic={id:'auto-help',parentTopicId:'parent',subject:'math',grade:6,track:'R',area:'Brüche',title:'Erweitern',goal:'Einfach erweitern',learningPlan:{levels:['a','b','c','d'],help:['a','b','c']},prerequisites:[]};
 const before={id:'session',topic,phase:'practice',level:0,supportStage:0,deadline:2000,events:[],task:{id:'task',prompt:'Erweitere2/3',answer:{kind:'exact-fraction',values:['4/6']},family:'expand'}};
 const helped=transition(before,'answer',{outcome:'incorrect'},100);const ended=transition(helped,'finish',null,101);
 const network=projectNetwork({version:'v',competencies:[topic]},{[topic.id]:ended.events},{session:ended},3000,{grade:6,track:'R',subject:'math'});
 assert.equal(network.nodes[0].state,'using-help');assert.equal(network.nodes[0].evidence.independent,1);assert.equal(network.nodes[0].evidence.correct,0);
});
