'use strict';
const {structuredClone}=globalThis;
const test=require('node:test');const assert=require('node:assert/strict');
const {createReviewService}=require('../lib/review-mode');
function setup(projectId='hausaufgabe-staging'){
 const rows=new Map(Object.entries({'users/teacher':{role:'teacher',status:'active'},'users/admin':{role:'admin'},'users/student':{role:'student'},'quizzes/MINE1234':{ownerId:'teacher'},'quizzes/OTHER123':{ownerId:'other'}}));
 const tx={get:async p=>rows.get(p)||null,set:(p,v)=>rows.set(p,structuredClone(v)),list:async(name,{cursor='',limit=100,category}={})=>[...rows].filter(([p,v])=>p.startsWith(name+'/')&&p.split('/').length===2&&p.split('/')[1]>cursor&&(!category||v.category===category)).sort().slice(0,limit).map(([p,v])=>({...v,id:p.split('/')[1]}))};
 const service=createReviewService({store:{transaction:fn=>fn(tx)},projectId,now:()=>12345});return {rows,call:(uid,data)=>service.execute({uid,data})};
}
const rating={action:'recordQuestionFeedback',clientRequestId:'rating-one',testCode:'MINE1234',questionId:'q1',questionPosition:1,verdict:'bad',reason:'unclear',teacherComment:'',feedbackAction:'remove',questionSnapshot:{type:'single',text:'Welche Zahl?',points:1,options:[{text:'2',correct:true}]},appVersion:'test-v1',sourceRelease:'a'.repeat(40)};
test('feedback is idempotent, survives question deletion, and never resets review status',async()=>{
 const s=setup();const r=await s.call('teacher',rating);assert.equal(r.confirmed,true);assert.equal(s.rows.get('feedback/'+r.id).category,'ai_question');assert.equal(s.rows.get('feedback/'+r.id).sourceProject,'hausaufgabe-staging');
 s.rows.set('feedback/'+r.id,{...s.rows.get('feedback/'+r.id),status:'working'});s.rows.delete('quizzes/MINE1234');
 const retry=await s.call('teacher',rating);assert.equal(retry.duplicate,true);assert.equal(s.rows.get('feedback/'+r.id).status,'working');
 await assert.rejects(s.call('teacher',{...rating,teacherComment:'different'}),{code:'already-exists'});
});
test('positive and negative reports remain separate; optional removal reason can be skipped',async()=>{
 const s=setup();await s.call('teacher',rating);const g=await s.call('teacher',{...rating,clientRequestId:'rating-good',verdict:'good',reason:'',feedbackAction:'keep'});assert.equal(s.rows.get('feedback/'+g.id).status,'new');
 assert.equal((await s.call('teacher',{...rating,clientRequestId:'rating-skip',reason:''})).confirmed,true);
 assert.equal([...s.rows.keys()].filter(p=>p.startsWith('feedback/')).length,3);
});
test('anonymous/student/foreign quiz/legacy project/content injection are rejected',async()=>{
 const s=setup();for(const uid of ['', 'student'])await assert.rejects(s.call(uid,rating));
 await assert.rejects(s.call('teacher',{...rating,testCode:'OTHER123'}),{code:'permission-denied'});
 await assert.rejects(setup('hausaufgabe-40294').call('admin',rating),{code:'failed-precondition'});
 await assert.rejects(s.call('teacher',{...rating,questionSnapshot:{...rating.questionSnapshot,studentAnswers:['PRIVATE']}}),{code:'invalid-argument'});
 s.rows.set('quizzes/MINE1234',{ownerId:'teacher',published:true});await assert.rejects(s.call('teacher',rating),{code:'failed-precondition'});
});
test('admin-only paginated read projects historical records without profile or student data',async()=>{
 const s=setup();s.rows.set('feedback/old',{category:'ai_question',verdict:'good',status:'done',testCode:'OLD',questionId:'old-q',questionSnapshot:{type:'text',text:'Alte Aufgabe',acceptedAnswers:['Lösung'],studentAnswers:['PRIVATE']},email:'PRIVATE',displayName:'PRIVATE'});
 await s.call('teacher',rating);await assert.rejects(s.call('teacher',{action:'listQuestionFeedback'}),{code:'permission-denied'});
 const r=await s.call('admin',{action:'listQuestionFeedback'});assert.equal(r.sourceProject,'hausaufgabe-staging');assert.equal(r.reports.length,2);assert.equal(r.reports.find(x=>x.id==='old').sourceProject,'unknown');
 assert.equal(JSON.stringify(r).includes('PRIVATE'),false);assert.equal(r.reports.find(x=>x.id==='old').processingEvidence,'unknown_legacy_status');
});
test('ordering alternatives remain Firestore-storable maps and no removal completion is invented',async()=>{
 const s=setup();const r=await s.call('teacher',{...rating,questionSnapshot:{type:'ordering',text:'Sortiere',items:['a','b'],acceptedOrders:[{indices:[1,0]}]}});
 const stored=s.rows.get('feedback/'+r.id);assert.deepEqual(stored.questionSnapshot.acceptedOrders,[{indices:[1,0]}]);assert.match(stored.message,/angefordert/);assert.equal(stored.message.includes('und entfernt'),false);
});
