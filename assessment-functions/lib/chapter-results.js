'use strict';
const {aggregateChapterResults}=require('./shared/chapter-contract');
function reviewChapterResults(submission, awards, expectedReviewRevision) {
 if(!submission.chapterSnapshot || !Number.isInteger(expectedReviewRevision) || expectedReviewRevision!==(submission.reviewRevision||0))throw Object.assign(new Error('Die Bewertung wurde geändert. Bitte neu laden.'),{code:'aborted'});
 const questions=submission.chapterSnapshot.questions;
 if(!Array.isArray(awards)||awards.length!==questions.length)throw Object.assign(new Error('Bitte alle Aufgaben der ursprünglichen Durchführung bewerten.'),{code:'invalid-argument'});
 const entries=new Map();for(const award of awards){if(entries.has(award.questionId))throw Object.assign(new Error('Doppelte Aufgabenbewertung.'),{code:'invalid-argument'});entries.set(award.questionId,award.awardedPoints);}
 const grading={...submission.grading};let totalPoints=0,maxPoints=0;
 for(const q of questions){const points=entries.get(q.id);if(!Number.isFinite(points)||points<0||points>q.maxPoints||Math.round(points*2)!==points*2)throw Object.assign(new Error('Ungültige Punkte für eine Aufgabe.'),{code:'invalid-argument'});grading[q.id]={...grading[q.id],awardedPoints:points,maxPoints:q.maxPoints,needsReview:false};totalPoints+=points;maxPoints+=q.maxPoints;}
 return {grading,totalPoints,maxPoints,percent:maxPoints?Math.round(totalPoints/maxPoints*100):0,chapterResults:aggregateChapterResults(submission.chapterSnapshot,grading),reviewRevision:(submission.reviewRevision||0)+1,status:'graded'};
}
module.exports={reviewChapterResults};
