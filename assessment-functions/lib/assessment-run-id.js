'use strict';
const {createHash}=require('node:crypto');
function millis(value){if(!value)return null;if(typeof value.toMillis==='function')return value.toMillis();return Number.isFinite(Number(value))?Number(value):null;}
function assessmentRunId(quiz,quizId,fail){
 if(quiz.startMode==='teacher'){const explicit=String(quiz.sessionRunId||'').trim();if(!explicit)fail('failed-precondition','Die gemeinsame Testrunde ist unvollständig. Bitte den Test erneut veröffentlichen.');return explicit;}
 const epochs=[quiz.reopenedAt,quiz.publishedAt].map(millis).filter(Number.isFinite),epoch=epochs.length?Math.max(...epochs):millis(quiz.createdAt);
 const seed=Number.isFinite(epoch)?String(epoch):createHash('sha256').update(`${quizId}:${String(quiz.accessCode||'')}`).digest('hex').slice(0,20);return `student_${seed}`;
}
module.exports={assessmentRunId};
