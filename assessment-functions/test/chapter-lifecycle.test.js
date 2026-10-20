'use strict';const test=require('node:test');const assert=require('node:assert/strict');
const {buildAssessmentContract,authoringFingerprint}=require('../lib/assessment-core');
const secret='A'.repeat(43);
const questions=()=>Array.from({length:6},(_,i)=>({id:`q${i}`,position:i+1,type:'number',points:2,text:`Berechne ${i}+1`,numericAnswer:i+1,chapterId:i<3?'ch_a':'ch_b'}));
const options={chapterSchemaVersion:1,chapters:[{id:'ch_a',title:'Zahlen',position:1},{id:'ch_b',title:'Anwenden',position:2}],shuffleQuestions:true};
test('public paper preserves grouped shuffle without publishing private keys',()=>{
 const result=buildAssessmentContract(questions(),secret,options);
 assert.deepEqual(result.paper.map(q=>q.chapterId),['ch_a','ch_a','ch_a','ch_b','ch_b','ch_b']);
 assert.equal(result.chapterSnapshot.chapters[0].title,'Zahlen');assert.equal(result.paper.some(q=>'numericAnswer' in q),false);
 assert.deepEqual(buildAssessmentContract(questions(),secret,options).paper,result.paper);
});
test('chapter authoring fingerprints include structure and reject missing assignment',()=>{
 const original=authoringFingerprint(questions(),options);
 assert.notEqual(authoringFingerprint(questions(),{...options,chapters:[{...options.chapters[0],title:'Neu'},options.chapters[1]]}),original);
 const changed=questions();changed[0].chapterId='ch_missing';assert.throws(()=>buildAssessmentContract(changed,secret,options));
});
