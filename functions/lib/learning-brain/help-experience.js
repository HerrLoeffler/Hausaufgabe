'use strict';
const {createHash}=require('node:crypto');
const STRATEGIES=['focus-one','smaller-step','count-along','contrast','check-prerequisite'];
const MAX_ENTRIES=64,MAX_EVENTS=128,MAX_LINKS=128;
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,32);
const identifier=value=>typeof value==='string'&&/^[a-zA-Z0-9_.:/-]{1,120}$/.test(value)?value:null;
const count=value=>Math.max(0,Math.min(10000,Number.isFinite(value)?Math.floor(value):0));
const fields=['uses','episodes','supportedSuccesses','supportedErrors','completions','completionErrors','independentSuccesses','independentErrors','transferEpisodes'];
function strategy(session){
 const a=session?.assistance;
 if(!a||typeof a!=='object')return null;
 if(STRATEGIES.includes(a.strategyId))return a.strategyId;
 // Compatibility with structural annotations only; never inspect prose.
 return a.numberLabels===true?'count-along':'focus-one';
}
function clean(memory){
 const entries=(Array.isArray(memory?.entries)?memory.entries:[]).slice(-MAX_ENTRIES).flatMap(e=>{
  const topicId=identifier(e?.topicId),tool=identifier(e?.tool);
  if(!topicId||!tool||!STRATEGIES.includes(e.strategyId))return [];
  const entry={topicId,tool,strategyId:e.strategyId};for(const field of fields)entry[field]=count(e[field]);return [entry];
 });
 const validHash=s=>typeof s==='string'&&/^[a-f0-9]{32}$/.test(s);
 const events=(Array.isArray(memory?.events)?memory.events:[]).filter(validHash).slice(-MAX_EVENTS);
 const links=(Array.isArray(memory?.episodeLinks)?memory.episodeLinks:[]).slice(-MAX_LINKS).flatMap(l=>{
  if(!validHash(l?.id)||!identifier(l.topicId)||!identifier(l.tool))return [];
  return [{id:l.id,topicId:l.topicId,tool:l.tool,strategies:[...new Set((Array.isArray(l.strategies)?l.strategies:[]).filter(s=>STRATEGIES.includes(s)))].slice(0,5),transferSeen:l.transferSeen===true}];
 });
 return {version:1,sourceVersion:'help-experience-v1',scope:'owner-private',entries,events,episodeLinks:links};
}
function updateExperience(memory,before,after,{action,assessment,eventId}={}){
 const next=clean(memory);
 // Accepted-event identity is mandatory: without it replay safety is unknown.
 if(typeof eventId!=='string'||!eventId||eventId.length>200)return next;
 const event=hash([eventId,action]);if(next.events.includes(event))return next;
 next.events.push(event);next.events=next.events.slice(-MAX_EVENTS);
 const topicId=identifier(before?.topic?.id||after?.topic?.id);
 const tool=identifier((action==='help-generated'?after:before)?.task?.workshop?.tool??'none');
 if(!topicId||!tool)return next;
 const entryFor=(s,boundTool=tool)=>{
  let e=next.entries.find(e=>e.topicId===topicId&&e.tool===boundTool&&e.strategyId===s);
  if(!e){e={topicId,tool:boundTool,strategyId:s};for(const f of fields)e[f]=0;next.entries.push(e);}
  return e;
 };
 const add=(entry,field,n=1)=>{entry[field]=count(entry[field]+count(n));};
 const episodes=Array.isArray(after?.helpEpisodes)?after.helpEpisodes.slice(-20):[];
 const beforeEpisodes=Array.isArray(before?.helpEpisodes)?before.helpEpisodes.slice(-20):[];
 const active=episodes.at(-1);
 if(action==='help-generated'&&after?.phase==='help'&&active&&!active.closed){
  const s=strategy(after);
  if(s&&typeof active.id==='string'&&active.id.length<=200){
   const id=hash([after.id,active.id]);let link=next.episodeLinks.find(l=>l.id===id);
   if(!link){link={id,topicId,tool,strategies:[],transferSeen:false};next.episodeLinks.push(link);}
   if(link.topicId===topicId&&link.tool===tool){const e=entryFor(s);add(e,'uses');if(!link.strategies.includes(s)){link.strategies.push(s);add(e,'episodes');}}
  }
 }
 const outcome=assessment?.outcome;
 if(action==='answer'&&['correct','incorrect'].includes(outcome)){
  if(before?.phase==='help'){
   const s=strategy(before);if(s)add(entryFor(s),outcome==='correct'?'supportedSuccesses':'supportedErrors');
  }
  if(before?.phase==='completion'){
   const previous=beforeEpisodes.at(-1);
   const link=previous&&next.episodeLinks.find(l=>l.id===hash([before.id,previous.id])&&l.topicId===topicId);
   if(link?.strategies.length===1)add(entryFor(link.strategies[0],link.tool),outcome==='correct'?'completions':'completionErrors');
  }
  // Only accepted episode deltas can establish independent probes. Raw correct
  // answers, supported success and original completion never imply transfer.
  if(before?.phase==='practice')for(const ep of episodes){
   const old=beforeEpisodes.find(e=>e.id===ep.id);
   if(!old||ep.originalCompleted!==true||ep.closed!==true||!Array.isArray(ep.helpVersions)||!ep.helpVersions.length)continue;
   const link=next.episodeLinks.find(l=>l.id===hash([before.id,ep.id])&&l.topicId===topicId);
   if(!link||link.strategies.length!==1)continue;
   const success=Math.max(0,count(ep.independentSuccesses)-count(old.independentSuccesses));
   const errors=Math.max(0,count(ep.independentErrors)-count(old.independentErrors));
   if(!success&&!errors)continue;
   const e=entryFor(link.strategies[0],link.tool);add(e,'independentSuccesses',success);add(e,'independentErrors',errors);
   if(success&&!link.transferSeen){add(e,'transferEpisodes');link.transferSeen=true;}
  }
 }
 next.entries=next.entries.slice(-MAX_ENTRIES);next.episodeLinks=next.episodeLinks.slice(-MAX_LINKS);
 return next;
}
function experienceFor(memory,topicId,tool){
 const entries=clean(memory).entries.filter(e=>e.topicId===topicId&&(tool==null||e.tool===tool));
 return {version:1,sourceVersion:'help-experience-v1',scope:'owner-private',evidence:'descriptive-only',causalEffect:'unproven',retention:'unknown',policy:{minimumIndependentSuccesses:2,minimumEpisodes:3,helpedSuccessIsIndependent:false,advisoryOnly:true,forceTool:false,permanentLearnerLabels:false,crossLearnerSharing:false,globalModelTraining:false},strategies:entries.map(e=>{
  const sufficient=e.independentSuccesses>=2&&e.episodes>=3&&e.transferEpisodes>=2;
  const advice=e.supportedErrors>=2&&e.independentSuccesses===0?'change-strategy':sufficient?'consider-again':'explore';
  return {...e,advice,confidence:sufficient?'limited-descriptive':'insufficient'};
 })};
}
module.exports={updateExperience,experienceFor};
