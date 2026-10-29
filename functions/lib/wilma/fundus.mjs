import {createHash} from 'node:crypto';
import {questionSnapshot,requiresOriginalMedia} from './source.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const context=quiz=>Object.fromEntries(['subject','grade','contentLocale','assessmentMode'].map(k=>[k,quiz?.[k]??null]));
export function fundusKey({quizId,questionId,quiz,q,answer}){return hash({version:1,quizId,questionId,context:context(quiz),question:questionSnapshot(q),answer});}
export function fundusEvidence(args){
 const {quizId,questionId,quiz,q,submission,submissionId,now}=args;
 const answer=submission?.answers?.[questionId],g=submission?.grading?.[questionId];
 const wholeForm=submission?.status==='graded'&&!!submission.reviewedAt&&submission.reviewedBy===quiz?.ownerId&&!Object.values(submission.grading||{}).some(row=>row.reviewState);
 const confirmed=g?.reviewState==='confirmed'||wholeForm;
 if(!['text','gapfill'].includes(q?.type)||requiresOriginalMedia(q)||!quiz||quiz.isDeleted||quiz.rightsHold||submission?.isDeleted||!confirmed||g.needsReview!==false||g.reviewIssue==='incomplete-transfer'||!Number.isFinite(g.awardedPoints)||g.awardedPoints<0||g.awardedPoints>q.points||g.awardedPoints*2%1||g.maxPoints!==q.points)return null;
 if(typeof answer!=='string'&&!(Array.isArray(answer)&&answer.every(x=>typeof x==='string')))return null;
 if(JSON.stringify(answer).length>4000)return null;
 return {version:1,key:fundusKey({...args,answer}),quizId,questionId,submissionId,points:g.awardedPoints,createdAt:now,expiresAt:now+90*86400000};
}
export function readEvidence(evidence,args){
 if(!evidence||evidence.conflict||evidence.key!==fundusKey(args)||!Number.isFinite(evidence.expiresAt)||args.now!==undefined&&args.now>=evidence.expiresAt)return null;
 const current=fundusEvidence({...args,submissionId:evidence.submissionId,now:evidence.createdAt});
 if(!current||current.key!==evidence.key||current.points!==evidence.points)return null;
 return {points:evidence.points,status:'clear',reason:'Aus deinem Fundus · von dir für dieselbe Antwort und Aufgabe bestätigt.',origin:'teacher-fundus'};
}
