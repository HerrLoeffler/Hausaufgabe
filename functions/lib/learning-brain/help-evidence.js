'use strict';
const {createHash}=require('node:crypto');
const {fingerprint}=require('./core');
const MAX_EPISODES=20;
const REASONS=['repeated-help-requests','repeated-supported-errors','completion-error','independent-probe-error','teacher-handoff'];
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,24);
const version=task=>{const value=task?.version||task?.workshop?.version||1;return typeof value==='number'&&Number.isFinite(value)?value:String(value).slice(0,80);};
const shortText=(value,max)=>typeof value==='string'?value.slice(0,max):'';
const count=value=>Math.max(0,Math.min(10000,Number.isFinite(value)?Math.floor(value):0));
function reason(episode,code){
 if(!episode.reasonCodes.includes(code))episode.reasonCodes.push(code);
 episode.reviewNeeded=true;
}
function rememberHelp(episode,session){
 if(!session.task||session.phase!=='help')return;
 const fp=fingerprint(session.task);
 if(fp===episode.anchorFingerprint)return;
 const entry={version:version(session.task),stage:Math.max(0,Math.min(3,Number(session.supportStage)||0)),fingerprint:fp,taskId:String(session.task.id||'').slice(0,160)};
 if(!episode.helpVersions.some(v=>v.fingerprint===entry.fingerprint&&v.version===entry.version&&v.stage===entry.stage))episode.helpVersions.push(entry);
 if(episode.helpVersions.length>12)episode.supportHistoryTruncated=true;
 episode.helpVersions=episode.helpVersions.slice(-12);
 episode.lastHelp={explanation:shortText(session.explanation,300),question:shortText(session.task.prompt,240),focusIds:(Array.isArray(session.assistance?.focusIds)?session.assistance.focusIds:[]).filter(id=>typeof id==='string').slice(0,12).map(id=>id.slice(0,60)),numberLabels:session.assistance?.numberLabels===true,strategyId:['focus-one','smaller-step','count-along','contrast','check-prerequisite'].includes(session.assistance?.strategyId)?session.assistance.strategyId:'focus-one',version:version(session.assistance||session.task),stage:entry.stage};
}
// Called once for each accepted transition, before or after next-task generation.
// All evidence stays on the existing private learner session. No answers are copied.
function observeHelp(previousSession,nextSession,{action,assessment,now}={}){
 const next=globalThis.structuredClone(nextSession);
 next.helpEpisodes=globalThis.structuredClone(nextSession.helpEpisodes||previousSession?.helpEpisodes||[]).slice(-MAX_EPISODES);
 if(action==='help-generated'){const episode=next.helpEpisodes.at(-1);if(episode&&!episode.closed)rememberHelp(episode,next);return next;}
 if(!previousSession||!['answer','help','question'].includes(action))return next;
 const previous=previousSession;
 const assessed=action==='answer'&&['correct','incorrect'].includes(assessment?.outcome);
 if(action==='answer'&&!assessed)return next;
 const key=digest([previous.id,previous.revision,next.revision,action,assessment?.outcome,previous.phase,fingerprint(previous.task)]);
 if(next.helpEpisodes.some(e=>e.lastObservationKey===key))return next;
 let episode=next.helpEpisodes.at(-1);
 const requesting=action==='help'||action==='question';
 // A probe is eligible only after returning to the original and then to practice.
 if(episode&&episode.originalCompleted&&previous.phase==='practice'&&assessed){
  const fp=fingerprint(previous.task);
  const distinct=!episode.supportHistoryTruncated&&previous.task?.id&&previous.task.id!==episode.anchorTaskId&&fp!==episode.anchorFingerprint&&!episode.helpVersions.some(v=>v.fingerprint===fp||v.taskId===previous.task.id)&&previous.task.workshop?.role!=='support';
  if(distinct){
   episode.lastObservationKey=key;
   if(assessment.outcome==='correct'){episode.independentSuccesses=count(episode.independentSuccesses)+1;episode.status='promising-transfer';}
   else {episode.independentErrors=count(episode.independentErrors)+1;reason(episode,'independent-probe-error');episode.status='review-needed';}
  }
 }
 const enteringHelp=next.phase==='help'||next.phase==='teacher';
 const continuing=episode&&['help','completion'].includes(previous.phase)&&!episode.closed;
 if(!continuing&&(requesting||assessed&&assessment.outcome==='incorrect'&&enteringHelp)){
  const anchor=previous.originalTask||previous.task;
  if(!anchor)return next;
  episode={id:digest([previous.id,anchor.id,fingerprint(anchor),version(anchor),previous.revision]),anchorTaskId:String(anchor.id||'').slice(0,160),anchorFingerprint:fingerprint(anchor),anchorVersion:version(anchor),startedAt:Number.isFinite(now)?now:null,requestCount:0,supportedErrors:0,supportedSuccesses:0,completionErrors:0,originalCompleted:false,independentSuccesses:0,independentErrors:0,helpVersions:[],reasonCodes:[],reviewNeeded:false,status:'observing',retention:'open'};
  next.helpEpisodes.push(episode);
 }
 if(!episode)return next;
 // A successful independent observation does not belong to a new help episode.
 if(!requesting&&!continuing&&!(assessed&&assessment.outcome==='incorrect'&&enteringHelp))return next;
 rememberHelp(episode,previous);
 rememberHelp(episode,next);
 if(requesting){episode.requestCount=count(episode.requestCount)+1;if(episode.requestCount>=3)reason(episode,'repeated-help-requests');}
 if(assessed&&previous.phase==='help'){
  if(assessment.outcome==='correct'){episode.supportedSuccesses=count(episode.supportedSuccesses)+1;episode.status='supported-success';if(episode.lastHelp)episode.successfulHelp=globalThis.structuredClone(episode.lastHelp);}
  else {episode.supportedErrors=count(episode.supportedErrors)+1;if(episode.supportedErrors>=2)reason(episode,'repeated-supported-errors');}
 }
 if(assessed&&previous.phase==='completion'){
  if(assessment.outcome==='correct'){episode.originalCompleted=true;episode.status='original-completed-with-help';episode.closed=true;}
  else {episode.completionErrors=count(episode.completionErrors)+1;reason(episode,'completion-error');}
 }
 if(next.phase==='teacher'){reason(episode,'teacher-handoff');episode.status='review-needed';episode.closed=true;}
 episode.lastObservationKey=key;
 next.helpEpisodes=next.helpEpisodes.slice(-MAX_EPISODES);
 return next;
}
// Descriptive within-learner counts only; no proof of causality or retention.
function projectHelpEvidence(sessions){
 const list=Array.isArray(sessions)?sessions:Object.values(sessions||{});
 const episodes=list.flatMap(s=>(s?.helpEpisodes||[]).slice(-MAX_EPISODES));
 const reasonCounts={};for(const code of REASONS)reasonCounts[code]=episodes.filter(e=>e.reasonCodes?.includes(code)).length;
 return {episodes:episodes.length,requests:episodes.reduce((n,e)=>n+count(e.requestCount),0),supportedSuccesses:episodes.reduce((n,e)=>n+count(e.supportedSuccesses),0),supportedErrors:episodes.reduce((n,e)=>n+count(e.supportedErrors),0),completedWithHelp:episodes.filter(e=>e.originalCompleted===true).length,promisingTransfer:episodes.filter(e=>count(e.independentSuccesses)>0).length,reviewNeeded:episodes.filter(e=>e.reviewNeeded===true).length,reasonCounts,retention:'open',causalEffect:'unproven'};
}
module.exports={observeHelp,projectHelpEvidence};
