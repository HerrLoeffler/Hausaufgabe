'use strict';
const crypto=require('node:crypto');
const kinds=new Set(['started','progress','submit_requested','receipt_confirmed','released','interrupted','recovered','connection_error','storage_error']);
function normalize(input) {
 if(!input || Object.keys(input).some(k=>!['eventId','kind','observedAt','completedIds','touchedIds','autoSubmitted','revision'].includes(k)))throw Error('Unexpected metric field');
 if(!/^[a-f0-9]{32}$/.test(input.eventId||'')||!kinds.has(input.kind))throw Error('Invalid event');
 const out={eventId:input.eventId,kind:input.kind,observedAt:input.observedAt??0};
 if(!Number.isSafeInteger(out.observedAt)||out.observedAt<0)throw Error('Invalid time');
 for(const key of ['completedIds','touchedIds'])if(input[key]!==undefined){
  if(!Array.isArray(input[key])||input[key].length>300||input[key].some(x=>typeof x!=='string'||x.length<1||x.length>120)||new Set(input[key]).size!==input[key].length)throw Error('Invalid question IDs');out[key]=input[key];
 }
 if(input.autoSubmitted!==undefined){if(typeof input.autoSubmitted!=='boolean')throw Error('Invalid completion');out.autoSubmitted=input.autoSubmitted;}
 if(input.revision!==undefined){if(!Number.isSafeInteger(input.revision)||input.revision<0)throw Error('Invalid revision');out.revision=input.revision;}
 return out;
}
function tokenMatches(token,hash){
 if(!/^[A-Za-z0-9_-]{32,128}$/.test(token||'')||!/^[a-f0-9]{64}$/.test(hash||''))return false;
 const actual=crypto.createHash('sha256').update('gradecrew-assessment-token:v1:'+token).digest();return crypto.timingSafeEqual(actual,Buffer.from(hash,'hex'));
}
function mergeMetrics(previous,event){
 const next={...previous};
 if(event.observedAt>=(previous.lastObservedAt||0)){
  next.lastObservedAt=event.observedAt;
  if(event.completedIds)next.completedIds=event.completedIds;
  if(event.touchedIds)next.touchedIds=event.touchedIds;
 }
 return next;
}
function questionIDs(privateData,submission) {
 const keys=Array.isArray(privateData?.gradingKey)?privateData.gradingKey.map(q=>q.id):[];
 const graded=submission?.grading;
 return new Set(keys.length?keys:(graded && !Array.isArray(graded) && typeof graded==='object'?Object.keys(graded):[]));
}
module.exports={normalize,tokenMatches,mergeMetrics,questionIDs};
