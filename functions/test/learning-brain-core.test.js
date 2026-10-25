'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {assessExact}=require('../lib/learning-brain/exact');
const {transition,projectSkill,publicSession}=require('../lib/learning-brain/core');
const start=()=>({id:'s',revision:1,topic:{id:'t'},phase:'practice',level:1,supportStage:0,deadline:Date.now()+120000,task:{id:'a',prompt:'Erweitere',input:'text',options:[],answer:{kind:'rational',values:['4/6']},rubric:'geheim',family:'expand'},events:[]});
test('equivalent rational answers including decimal comma; malformed is neutral',()=>{
 assert.equal(assessExact('2/3',{kind:'rational',values:['4/6']}),true);
 assert.equal(assessExact('0,5',{kind:'rational',values:['1/2']}),true);
 assert.equal(assessExact('4/40',{kind:'rational',values:['9/20']}),false);
 assert.equal(assessExact('1/0',{kind:'rational',values:['1/2']}),null);
 assert.equal(assessExact('keine Ahnung',{kind:'rational',values:['1/2']}),null);
});
test('success probes higher without explanation; help success is not independent',()=>{
 let a=transition(start(),'answer',{outcome:'correct'},100);
 assert.equal(a.phase,'practice'); assert.equal(a.level,2); assert.equal(a.events[0].independent,true);
 let b=transition(start(),'help',null,100); assert.equal(b.phase,'help'); assert.equal(b.events.length,0);
 b=transition(b,'answer',{outcome:'correct'},200); assert.equal(b.phase,'completion');assert.equal(b.events.length,0);
 b=transition(b,'answer',{outcome:'correct'},300); assert.equal(b.events[0].independent,false); assert.equal(b.level,0);
});
test('repeated errors reduce demand then invite teacher; never repeat same-level loop',()=>{
 let s=start();
 for(let i=1;i<=4;i++){s=transition(s,'answer',{outcome:'incorrect'},i);assert.equal(s.supportStage,Math.min(3,i));}
 assert.equal(s.phase,'teacher');assert.equal(s.level,0);
 assert.equal(s.events.filter(x=>x.independent).length,1);
});
test('one correct is not mastery; ten varied independent observations across sessions required',()=>{
 const e={correct:true,independent:true,fingerprint:'a',family:'x',sessionId:'s',at:100};
 assert.notEqual(projectSkill([e],200).status,'secure');
 const events=Array.from({length:10},(_,i)=>({...e,correct:i>=2,fingerprint:'a'+i,family:i%2?'x':'y',sessionId:i<5?'s':'s2',level:2,at:i}));
 assert.equal(projectSkill(events,200).status,'secure');
 assert.notEqual(projectSkill([...events,{...e,correct:false,fingerprint:'last',at:201}],202).status,'secure');
 assert.notEqual(projectSkill(events.map(x=>({...x,independent:false})),200).status,'secure');
});
test('no private grading material in public session, explicit original context allowed',()=>{
 const s=start();s.ownerUid='secret';s.originalTask=s.task;
 const pub=JSON.stringify(publicSession(s));
 for(const str of ['rubric','values','geheim','ownerUid','fingerprint'])assert.equal(pub.includes(str),false,str);
 assert.equal(JSON.parse(pub).originalTask.prompt,'Erweitere');
});
test('supported success cannot erase a newer independent contradiction',()=>{
 const events=Array.from({length:10},(_,i)=>({correct:i>=1,independent:true,fingerprint:'f'+i,family:i%2?'a':'b',sessionId:i<5?'s1':'s2',at:i}));
 events.push({correct:false,independent:true,fingerprint:'failure',family:'a',sessionId:'s2',at:11});
 events.push({correct:true,independent:false,fingerprint:'helped',family:'a',sessionId:'s2',at:12});
 assert.notEqual(projectSkill(events,20).status,'secure');
});
test('failed original after maximum help leads to teacher instead of an endless return loop',()=>{
 let s=start();for(let i=0;i<3;i++)s=transition(s,'answer',{outcome:'incorrect'});
 s=transition(s,'answer',{outcome:'correct'});assert.equal(s.phase,'completion');
 s=transition(s,'answer',{outcome:'incorrect'});assert.equal(s.phase,'teacher');
});
test('duplicate task cannot conceal a new independent failure',()=>{
 const events=Array.from({length:10},(_,i)=>({correct:true,independent:true,fingerprint:'f'+i,family:i%2?'a':'b',sessionId:i<5?'s1':'s2',at:i}));
 events.push({...events[9],correct:false,at:20});
 assert.notEqual(projectSkill(events,30).status,'secure');
});
test('return to original never keeps a picture from a different micro-question',()=>{
 let s=transition(start(),'help');s.visual={kind:'fraction-strip',numerator:1,denominator:2,factor:2};
 s=transition(s,'answer',{outcome:'correct'});assert.equal(s.phase,'completion');assert.equal(s.visual,null);assert.equal(s.task.prompt,'Erweitere');
});
test('ten easy independent successes alone cannot establish a whole competency',()=>{
 const events=Array.from({length:10},(_,i)=>({independent:true,correct:true,level:0,fingerprint:'easy'+i,family:i%2?'identify':'apply',sessionId:i<5?'s1':'s2',at:i}));
 assert.notEqual(projectSkill(events,20).status,'secure');
 events[8].level=2;events[9].level=2;assert.equal(projectSkill(events,20).status,'secure');
 const s=transition(start(),'answer',{outcome:'correct'});assert.equal(s.previousLevel,1);assert.equal(s.events[0].level,1);
});
test('help requests on competencies persist only public support metadata and never count as independent evidence',()=>{
 const s=start();s.topic.parentTopicId='parent';
 const helped=transition(s,'question',null,100);assert.equal(helped.events.length,1);assert.equal(helped.events[0].kind,'help-requested');assert.equal(helped.events[0].independent,false);
 assert.equal(projectSkill(helped.events,200).independent,0);assert.equal(projectSkill(helped.events,200).correct,0);
});
test('preparation and human-observation evidence cannot certify original performance',()=>{
 const events=Array.from({length:10},(_,i)=>({independent:true,correct:true,level:2,fingerprint:'scope'+i,family:i%2?'identify':'apply',sessionId:i<5?'s1':'s2',at:i}));
 for(const assessmentScope of ['preparation','human-observation']){const evidence=projectSkill(events,20,{assessmentScope});assert.notEqual(evidence.status,'secure');assert.equal(evidence.reviewDue,false);assert.equal(evidence.nextReviewAt,null);}
});
