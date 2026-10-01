"use strict";
const {createHash}=require('node:crypto');
const ACTIONS=new Set(['join','resume','submit','receipt','prepare','generate','import','game']);
const OUTCOMES=new Set(['ok','failed','cancelled','unknown']);
const CODES=new Set(['none','network','timeout','permission','validation','unexpected']);
const exact=(v,keys)=>v && Object.getPrototypeOf(v)===Object.prototype && Object.keys(v).length===keys.length && keys.every(k=>Object.hasOwn(v,k));
function validateBatch(data) {
 if(!exact(data,['scope','release','events']) || !exact(data.scope,['quizId','attemptId','attemptToken'])) throw new TypeError('Invalid envelope');
 if(typeof data.scope.quizId!=='string'||!/^[A-Z0-9]{4,16}$/.test(data.scope.quizId))throw new TypeError('Invalid scope');
 if(data.scope.attemptId!==null && (typeof data.scope.attemptId!=='string'|| !/^a_[a-f0-9]{28}$/.test(data.scope.attemptId)))throw new TypeError('Invalid attempt');
 if(data.scope.attemptToken!==null && (typeof data.scope.attemptToken!=='string'||! /^[A-Za-z0-9_-]{32,128}$/.test(data.scope.attemptToken)))throw new TypeError('Invalid credential');
 if(typeof data.release!=='string'||!/^[a-f0-9]{40}$/.test(data.release)||!Array.isArray(data.events)||!data.events.length||data.events.length>20)throw new TypeError('Invalid batch');
 if(Buffer.byteLength(JSON.stringify(data))>32768)throw new TypeError('Batch too large');
 const ids=new Set();
 for(const e of data.events){
  if(!exact(e,['id','at','action','outcome','code','durationMs','trigger','reference']))throw new TypeError('Invalid fields');
  if(typeof e.id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(e.id)||ids.has(e.id))throw new TypeError('Invalid identity');ids.add(e.id);
  if(typeof e.at!=='string'||!Number.isFinite(Date.parse(e.at))||new Date(e.at).toISOString()!==e.at)throw new TypeError('Invalid date');
  if(!ACTIONS.has(e.action)||!OUTCOMES.has(e.outcome)||!CODES.has(e.code))throw new TypeError('Invalid category');
  if(!Number.isInteger(e.durationMs)||e.durationMs<0||e.durationMs>86400000)throw new TypeError('Invalid duration');
  if(!['manual','deadline','unspecified'].includes(e.trigger)||typeof e.reference!=='string'||! /^(?:|ASM-[A-Za-z0-9-]{1,80})$/.test(e.reference))throw new TypeError('Invalid context');
  if(e.action!=='submit'&&e.trigger!=='unspecified')throw new TypeError('Invalid trigger');
 }
 return structuredClone(data);
}
function fingerprint(value){return createHash('sha256').update(JSON.stringify(value)).digest('hex');}
function enabled(env=process.env){return env.GC_TELEMETRY_ENABLED==='true'&&env.GCLOUD_PROJECT==='hausaufgabe-staging';}
function projectEvent(event,{ownerId,scopeKey,release,now}){
 return {...event,ownerId,scopeKey,release,environment:'staging',source:'client_reported',schemaVersion:1,receivedAtMs:now,expiresAtMs:now+30*86400000};
}
function summarize(rows,{truncated=false}={}){
 const operations={};const releases={};
 for(const r of rows){ if(r.schemaVersion!==1||r.environment!=='staging')continue;
  const key=r.action;const o=operations[key]||={count:0,ok:0,failed:0,unknown:0,durations:[],manual:0,deadline:0};
  o.count++; if(r.outcome==='ok')o.ok++;else if(r.outcome==='failed')o.failed++;else o.unknown++;
  if(Number.isFinite(r.durationMs))o.durations.push(r.durationMs);
  if(key==='submit'&&['manual','deadline'].includes(r.trigger))o[r.trigger]++;
  const rel=releases[r.release]||={count:0,failed:0};rel.count++;rel.failed+=Number(r.outcome==='failed');
 }
 for(const o of Object.values(operations)){o.durations.sort((a,b)=>a-b);const q=p=>o.durations.length?o.durations[Math.ceil(o.durations.length*p)-1]:null;o.p50Ms=q(.5);o.p95Ms=q(.95);delete o.durations;}
 return {schemaVersion:1,source:'client_reported',coverage:'received-events-only',truncated,operations,releases};
}
module.exports={validateBatch,fingerprint,enabled,projectEvent,summarize};
