'use strict';const test=require('node:test'),assert=require('node:assert/strict');
const {reviewChapterResults}=require('../lib/chapter-results');
test('review recomputes total and chapter points from immutable maxima and rejects stale writes',()=>{
 const submission={reviewRevision:0,chapterSnapshot:{chapters:[{id:'ch_one',title:'Zahlen',position:1}],questions:[{id:'q1',chapterId:'ch_one',maxPoints:4}]},grading:{q1:{needsReview:true,autoPoints:0}}};
 const result=reviewChapterResults(submission,[{questionId:'q1',awardedPoints:3}],0);assert.equal(result.totalPoints,3);assert.equal(result.maxPoints,4);assert.equal(result.chapterResults[0].awardedPoints,3);assert.equal(result.chapterResults[0].percent,75);assert.equal(result.chapterResults[0].needsReview,false);
 assert.throws(()=>reviewChapterResults({...submission,...result},[{questionId:'q1',awardedPoints:2}],0),e=>e.code==='aborted');
 assert.throws(()=>reviewChapterResults(submission,[{questionId:'q1',awardedPoints:5}],0),e=>e.code==='invalid-argument');
 assert.throws(()=>reviewChapterResults(submission,[{questionId:'new',awardedPoints:1}],0),e=>e.code==='invalid-argument');
});
