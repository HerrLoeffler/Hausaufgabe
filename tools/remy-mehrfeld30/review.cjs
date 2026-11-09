'use strict';
const {createHash}=require('node:crypto');
const {core,parseVisualTask}=require('../../functions/lib/visual-task');

const reasons=new Set(['','format','fachlich','auftrag','loesung','bewertung','anderes']);
const digest=data=>createHash('sha256').update(JSON.stringify(data)).digest('hex');
const quizCode=/^[A-Z0-9]{8}$/;
function canReview(uid,profile={}){
  return !!uid && ['teacher','admin'].includes(profile.role) && (!profile.status||profile.status==='active') &&
    (profile.role==='admin'||uid==='gc-visual255-e2e'||uid==='8bStKRCHSOcxHp3xEDER0pUP0z53');
}
function ownsPilotJob(job,uid,quizId){
  return job?.ownerId===uid && job.status==='ready' && job.quizId===quizId && /^mehrfeld30-wish-[a-z0-9-]+$/.test(job.requestId||'');
}
function present(quizId,group,q){
  const points=Number(q.points);
  if(!['single','visual'].includes(q.type)||!Number.isFinite(points)||points<=0)throw Error('Aufgabe wird im Labor nicht unterstützt.');
  const visual=q.type==='visual'?core.publicTask(parseVisualTask(q.visualTask,{points})):null;
  const options=q.type==='single'?q.options.map(o=>String(o.text)):[];
  return {quizId,group,id:q.id,type:q.type,text:String(q.text||''),points,visual,options,
    version:digest([quizId,q.id,q.type,q.text,points,q.visualTask??null,q.options??null])};
}
function feedback(task,data){
  if(data.version!==task.version)throw Error('Die Version der Aufgabe hat sich geändert. Bitte lade sie neu.');
  if(!['good','bad'].includes(data.verdict))throw Error('Bewertung fehlt.');
  if(!reasons.has(data.reason??''))throw Error('Ungültiger Grund.');
  if(typeof data.eventId!=='string'||!(/^[a-f0-9-]{36}$/i.test(data.eventId)))throw Error('Rückmeldungs-ID fehlt.');
  if(data.comment!==undefined&&(typeof data.comment!=='string'||data.comment.length>500))throw Error('Der Hinweis ist zu lang.');
  return {version:task.version,verdict:data.verdict,reason:data.reason??'',comment:(data.comment??'').trim()};
}
function score(q,answer){
  if(q.type==='visual'){
    const task=parseVisualTask(q.visualTask,{points:q.points});
    return core.grade(task,answer).points;
  }
  return Number.isInteger(answer)&&q.options[answer]?.correct===true?q.points:0;
}
module.exports={quizCode,canReview,ownsPilotJob,present,feedback,score};
