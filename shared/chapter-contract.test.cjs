'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('./chapter-contract.js');
const fixture = () => ({ quiz: { chapterSchemaVersion: 1, chapters: Array.from({length:6},(_,i)=>({id:`ch_${i}`,title:`Thema ${i+1}`,position:i+1})) }, questions: Array.from({length:18},(_,i)=>({id:`q${i}`,chapterId:`ch_${Math.floor(i/3)}`,position:i+1,points:[2,2,4][i%3]})) });
test('legacy is untouched and unknown versions fail closed',()=>{
 const q={title:'Alt'}, questions=[{id:'old',points:1}]; const before=JSON.stringify([q,questions]);
 assert.deepEqual(C.validateChapterStructure(q,questions,{phase:'publish'}),{enabled:false,errors:[]});
 assert.equal(C.createChapterSnapshot(q,questions),null); assert.equal(JSON.stringify([q,questions]),before);
 assert.equal(C.validateChapterStructure({chapterSchemaVersion:2},questions,{phase:'publish'}).errors[0].code,'version');
});
test('six chapters canonicalize without losing answers or IDs',()=>{
 const {quiz,questions}=fixture(); quiz.chapters.reverse(); questions.reverse();
 assert.deepEqual(C.validateChapterStructure(quiz,questions,{phase:'publish'}).errors,[]);
 assert.deepEqual(C.canonicalizeChapterQuestions(quiz,questions).map(q=>q.id),Array.from({length:18},(_,i)=>`q${i}`));
 const snapshot=C.createChapterSnapshot(quiz,questions); quiz.chapters[0].title='changed';
 assert.equal(snapshot.chapters[5].title,'Thema 6'); assert.equal(snapshot.questions.reduce((n,q)=>n+q.maxPoints,0),48);
});
test('empty draft allowed but publication rejects orphan empty and duplicate IDs',()=>{
 const {quiz,questions}=fixture();
 assert.deepEqual(C.validateChapterStructure(quiz,[],{phase:'draft'}).errors,[]);
 assert.ok(C.validateChapterStructure(quiz,[],{phase:'publish'}).errors.some(e=>e.code==='empty'));
 questions[0].chapterId='ch_other'; questions[1].id=questions[2].id;
 const codes=C.validateChapterStructure(quiz,questions,{phase:'publish'}).errors.map(e=>e.code);
 assert.ok(codes.includes('assignment')); assert.ok(codes.includes('question-id'));
});
test('chapter aggregation uses frozen maxima and marks missing/manual grading',()=>{
 const {quiz,questions}=fixture(); const snapshot=C.createChapterSnapshot(quiz,questions);
 const scores=[6,4,8,2,6,4]; const grading={};
 for(let i=0;i<6;i++) for(let j=0;j<3;j++) grading[`q${i*3+j}`]={awardedPoints:j===2?Math.max(0,scores[i]-4):Math.min(2,Math.max(0,scores[i]-j*2)),needsReview:false};
 const results=C.aggregateChapterResults(snapshot,grading);
 assert.deepEqual(results.map(r=>r.awardedPoints),scores); assert.equal(results.reduce((n,r)=>n+r.maxPoints,0),48);
 delete grading.q0; assert.equal(C.aggregateChapterResults(snapshot,grading)[0].needsReview,true);
 grading.q0={autoPoints:0,needsReview:true}; assert.equal(C.aggregateChapterResults(snapshot,grading)[0].needsReview,true);
});
