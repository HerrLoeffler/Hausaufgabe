'use strict';
// Staging-only synthetic fixtures; access token stays in memory and is never printed.
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const auth=require(process.env.FIREBASE_CLI_AUTH_MODULE);
const account=auth.getGlobalDefaultAccount();if(!account)throw Error('Firebase CLI login required');
const project='hausaufgabe-staging',base=`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`,prefix=`projects/${project}/databases/(default)/documents/`;
const hash=x=>crypto.createHash('sha256').update(x).digest('hex'),quizId='SZ'+crypto.randomBytes(4).toString('hex').toUpperCase(),attemptId='a_'+crypto.randomBytes(14).toString('hex'),key=quizId+'_'+attemptId,teacherId='secure-validation-'+quizId,token=crypto.randomBytes(32).toString('hex');
let access,stage='auth';
const paths=[`quizzes/${quizId}`,`quizzes/${quizId}/attempts/${attemptId}`,`assessmentPrivate/${key}`,`quizzes/${quizId}/submissions/${attemptId}`];
function encode(value){if(value===null)return {nullValue:null};if(Array.isArray(value))return {arrayValue:{values:value.map(encode)}};if(value instanceof Date)return {timestampValue:value.toISOString()};if(typeof value==='object')return {mapValue:{fields:fields(value)}};if(typeof value==='boolean')return {booleanValue:value};if(typeof value==='number')return {integerValue:String(value)};return {stringValue:value};}
function fields(obj){return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,encode(v)]));}
function decode(v){if(v.mapValue)return Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)]));if(v.arrayValue)return (v.arrayValue.values||[]).map(decode);if(v.integerValue!==undefined)return Number(v.integerValue);if(v.timestampValue)return v.timestampValue;if(v.booleanValue!==undefined)return v.booleanValue;if(v.nullValue!==undefined)return null;return v.stringValue;}
async function rest(url,method='GET',body){const r=await fetch(url,{method,headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(20000)});const data=await r.json();if(!r.ok){const e=Error('Firestore request failed');e.code=r.status;throw e;}return data;}
const set=(path,value,create=false)=>({update:{name:prefix+path,fields:fields(value)},...(create?{currentDocument:{exists:false}}:{})});
const commit=writes=>rest(base+':commit','POST',{writes});
async function query(collection,field,value){const r=await rest(base+':runQuery','POST',{structuredQuery:{from:[{collectionId:collection}],where:{fieldFilter:{field:{fieldPath:field},op:'EQUAL',value:{stringValue:value}}}}});return r.filter(x=>x.document).map(x=>x.document);}
async function call(event,attemptToken=token){const response=await fetch('https://europe-west1-hausaufgabe-staging.cloudfunctions.net/recordSecureExamTelemetry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:{quizId,attemptId,attemptToken,event}}),signal:AbortSignal.timeout(20000)});return {status:response.status,body:await response.json()};}
(async()=>{
 const t=await auth.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform']);access=t.access_token;
 let created=false;
 try{
  stage='create synthetic fixture';const now=Date.now(),stamp=new Date(now-5000);
  await commit([set(paths[0],{ownerId:teacherId,telemetrySynthetic:true},true),set(paths[1],{secureAssessmentVersion:2,joinedAt:stamp,createdAt:stamp,startedAt:stamp,questionCount:1},true),set(paths[2],{tokenHash:hash('gradecrew-assessment-token:v1:'+token),gradingKey:[{id:'q1'}]},true)]);created=true;
  const event={eventId:crypto.randomBytes(16).toString('hex'),kind:'progress',observedAt:now,completedIds:['q1'],touchedIds:['q1']};
  stage='token rejection';assert.equal((await call(event,'x'.repeat(64))).status,403);
  stage='accepted event';const accepted=await call(event);assert.equal(accepted.status,200);assert.equal(accepted.body.result.accepted,true);
  stage='dedupe';assert.equal((await call(event)).body.result.duplicate,true);
  stage='field allowlist';assert.equal((await call({...event,eventId:crypto.randomBytes(16).toString('hex'),name:'not allowed'})).status,400);
  stage='canonical private cleanup';await commit([set(paths[2],{tokenHash:hash('gradecrew-assessment-token:v1:'+token)}),set(paths[3],{secureAssessmentVersion:2,status:'graded',autoSubmitted:false,submittedAt:new Date(),grading:{q1:{autoPoints:0}}},true)]);
  stage='late final progress';const late=await call({...event,eventId:crypto.randomBytes(16).toString('hex'),kind:'released',observedAt:now+1});assert.equal(late.status,200);
  stage='server receipt trigger';let summary;
  for(let n=0;n<20;n++){summary=decode({mapValue:{fields:(await rest(base+`/secureTelemetryAttempts/${key}`)).fields}});if(summary.countedSubmission)break;await new Promise(r=>setTimeout(r,1000));}
  assert.equal(summary.countedStart,true);assert.equal(summary.countedSubmission,true);assert.deepEqual(summary.completedIds,['q1']);assert.equal(summary.completion,'manual');assert.ok(summary.serverDurationMillis>=5000);
  stage='daily counts';const daily=await query('secureTelemetryDaily','teacherId',teacherId);assert.equal(daily.length,1);const totals=decode({mapValue:{fields:daily[0].fields}});assert.equal(totals.participations,1);assert.equal(totals.confirmedSubmissions,1);
  console.log(JSON.stringify({passed:true,invalidTokenRejected:true,forbiddenFieldsRejected:true,duplicateNotCounted:true,serverReceipt:true,progressAfterPrivateCleanup:true,serverDuration:true}));
 }finally{
  if(created){const deletes=[...paths.map(p=>({delete:prefix+p}))];for(const c of ['secureTelemetryEvents','secureTelemetryAttempts'])for(const d of await query(c,'quizId',quizId))deletes.push({delete:d.name});for(const c of ['secureTelemetryDaily','secureTelemetryPresence'])for(const d of await query(c,'teacherId',teacherId))deletes.push({delete:d.name});await commit(deletes);}
 }
})().catch(error=>{console.error(JSON.stringify({passed:false,stage,code:error.code||error.name}));process.exitCode=1;});
