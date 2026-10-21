import './shared/chapter-contract.js';
const C=globalThis.GradeCrewChapters || (await import('./shared/chapter-contract.js')).default;
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const mean=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
const summarize=rows=>({count:rows.length,points:mean(rows.map(r=>r.points)),maxPoints:mean(rows.map(r=>r.maxPoints)),percent:mean(rows.map(r=>r.percent).filter(finite)),grade:mean(rows.map(r=>r.grade).filter(finite)),gradeCount:rows.filter(r=>finite(r.grade)).length});
/** Teacher-only presentation. Historical chapter plans and frozen scales stay intact. */
export function classAverages(submissions,gradeForPercent){
 const groups=new Map(),versions=new Map(),totals=[];let pending=0;
 for(const submission of submissions){
  if(submission.status!=='graded'||Object.values(submission.grading||{}).some(g=>g.needsReview===true)){pending++;continue;}
  const scale=submission.gradeScaleSnapshot;
  const calculate=percent=>finite(percent)&&scale?.thresholds?.length===6?gradeForPercent(percent,scale):null;
  const storedGrade=finite(submission.grade)&&submission.grade>=1&&submission.grade<=6?submission.grade:null;
  totals.push({points:Number(submission.totalPoints)||0,maxPoints:Number(submission.maxPoints)||0,percent:finite(submission.percent)?submission.percent:null,grade:storedGrade??calculate(submission.percent)});
  if(!submission.chapterSnapshot)continue;
  for(const row of C.aggregateChapterResults(submission.chapterSnapshot,submission.grading)){
   if(row.needsReview)continue;
   const tasks=submission.chapterSnapshot.questions.filter(q=>q.chapterId===row.chapterId);
   const key=JSON.stringify([row.chapterId,row.title,tasks.map(q=>[q.id,q.maxPoints,q.position])]);
   if(!versions.has(row.chapterId))versions.set(row.chapterId,new Set());versions.get(row.chapterId).add(key);
   if(!groups.has(key))groups.set(key,{chapterId:row.chapterId,title:row.title,rows:[]});
   groups.get(key).rows.push({points:row.awardedPoints,maxPoints:row.maxPoints,percent:row.percent,grade:calculate(row.percent)});
  }
 }
 return {included:totals.length,pending,total:totals.length?summarize(totals):null,chapters:[...groups.values()].map(({rows,...chapter})=>({...chapter,...summarize(rows)})),mixedVersions:[...versions.values()].some(v=>v.size>1)};
}
