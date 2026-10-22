'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const C=require('../lib/assessment-core');
const task={schemaVersion:2,id:'angle-1',revision:0,format:'angle',title:'Winkel',subject:'Mathematik',grade:'6',prompt:'Miss den Winkel.',hint:'Nutze den Winkelmesser.',maxPoints:2,objective:'Winkel messen',rationale:'Misst Winkel.',sourceNote:'Eigenes Beispiel',spec:{degrees:68,instrument:'aligned-protractor',min:0,max:180},solution:{value:68,tolerance:1},provenance:{kind:'template',offline:true},review:{status:'approved'}};
const question=()=>({id:'q1',type:'visual',text:task.prompt,points:2,visualTask:JSON.stringify(task)});
test('public visual questions keep geometry and strip private teacher data',()=>{
 const q=question(); const paper=C.buildPublicQuestion(q,'secret');const p=JSON.parse(paper.visualTask);
 assert.equal(paper.type,'visual');assert.equal(p.spec.degrees,68);
 for(const key of ['solution','rationale','provenance','review'])assert.equal(Object.hasOwn(p,key),false);
 assert.equal(C.assertNoSolutionLeak(paper),true);
 const grading=C.buildGradingKey(q,'secret');assert.equal(grading.visualTask,q.visualTask);
 assert.deepEqual(C.gradeQuestion(grading,68),{autoPoints:2,awardedPoints:2,maxPoints:2,needsReview:false,correct:true});
 assert.equal(C.gradeQuestion(grading,20).autoPoints,0);
});
test('visual authoring fingerprint changes with solution and publishing rejects unsafe tasks',()=>{
 const q=question(),changed=question(); const t=JSON.parse(changed.visualTask);t.spec.degrees=80;t.solution.value=80;changed.visualTask=JSON.stringify(t);
 assert.notEqual(C.authoringFingerprint([q]),C.authoringFingerprint([changed]));
 const bad=question();const b=JSON.parse(bad.visualTask);b.spec.untrusted='<script>';bad.visualTask=JSON.stringify(b);
 assert.throws(()=>C.buildPublicQuestion(bad,'secret'));
});
test('number answers safely accept fractions and reject executable and nonfinite input',()=>{
 const key={type:'number',points:2,numericAnswer:.5,tolerance:0};
 assert.equal(C.gradeQuestion(key,'6/12').autoPoints,2);
 for(const a of ['1/0','1/2+0','(()=>.5)()',true,[],{},'0x0.8'])assert.equal(C.gradeQuestion(key,a).autoPoints,0);
});
test('public leak check parses the visual JSON string',()=>{
 assert.throws(()=>C.assertNoSolutionLeak({visualTask:JSON.stringify(task)}));
});
test('all twelve formats publish safely and grade canonical correct and missing answers',()=>{
 const V=require('../lib/visual-task');
 for(const format of V.VISUAL_FORMATS){
  const task=V.core.example(format);const q={id:`q-${format}`,type:'visual',points:task.maxPoints,text:task.prompt,visualTask:JSON.stringify(task)};
  assert.equal(C.assertNoSolutionLeak(C.buildPublicQuestion(q,'secret')),true);
  const key=C.buildGradingKey(q,'secret');
  assert.equal(C.gradeQuestion(key,V.core.solutionResponse(task)).autoPoints,task.maxPoints,format);
  assert.equal(C.gradeQuestion(key,null).autoPoints,0,format);
 }
});
test('connections submission survives Firestore-compatible serialization and teacher decode',()=>{
 const V=require('../lib/visual-task');const task=V.core.example('connections');const q={id:'q1',type:'visual',points:2,text:task.prompt,visualTask:JSON.stringify(task)};
 const key=C.buildGradingKey(q,'secret'),answer=V.core.solutionResponse(task);
 const stored=C.sanitizeAnswersForStorage([key],{q1:answer});assert.equal(typeof stored.q1,'string');
 assert.equal(C.gradeSubmission([key],stored).totalPoints,2);
 const teacher=require('../lib/teacher-answer-decoder').decodeQuestionAnswer(q,stored.q1,'secret');
 assert.deepEqual(JSON.parse(teacher),answer);
});
test('visual partial credit and adversarial answers cannot over-award',()=>{
 const V=require('../lib/visual-task');const task=V.core.example('connections');const q={id:'q1',type:'visual',points:2,text:task.prompt,visualTask:JSON.stringify(task)},key=C.buildGradingKey(q,'secret');
 assert.equal(C.gradeQuestion(key,[task.solution.edges[0]]).autoPoints,1);
 for(const a of [[...task.solution.edges,task.solution.edges[0]],[['constructor','a']],{points:1000},'<script>'])assert.equal(C.gradeQuestion(key,a).autoPoints,0);
});
