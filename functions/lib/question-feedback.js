'use strict';
const {createHash}=require('node:crypto');
const fail=(code,message)=>{throw Object.assign(new Error(message),{code});};
const hash=v=>createHash('sha256').update(v).digest('hex');
const REASONS=new Set(['','incorrect','answer_leak','image_mismatch','ambiguous','duplicate','other','content_wrong','unclear','answer_wrong','off_topic']);
function text(v,max,required=false){if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail('invalid-argument','Ungültiger Feedbacktext.');return v.trim();}
function identifier(v){const value=text(v,128,true);if(!/^[\w-]+$/.test(value))fail('invalid-argument','Ungültige Feedbackkennung.');return value;}
function snapshot(value){
 if(!value||typeof value!=='object'||Array.isArray(value))fail('invalid-argument','Aufgabenkontext fehlt.');
 const allowed=new Set(['type','text','points','options','acceptedAnswers','correctBoolean','pairs','items','acceptedOrders','groups','targetWords','markGroups','numericAnswer','passage','imageChoices','imagePresent','visualTask']);
 if(Object.keys(value).some(k=>!allowed.has(k)))fail('invalid-argument','Unerlaubter Aufgabenkontext.');
 const clean={type:text(value.type,30,true),text:text(value.text,900),points:Number.isFinite(value.points)?value.points:1};
 if(value.visualTask!==undefined){if(value.type!=='visual')fail('invalid-argument','Visueller Kontext passt nicht zum Aufgabentyp.');require('./visual-task').parseVisualTask(value.visualTask,{points:clean.points});clean.visualTask=value.visualTask;}
 const strings=(v,max,n)=>{if(!Array.isArray(v)||v.length>n)fail('invalid-argument','Ungültige Aufgabenliste.');return v.map(x=>text(x,max));};
 const objects=(v,n,keys,build)=>{if(!Array.isArray(v)||v.length>n)fail('invalid-argument','Ungültige Aufgabenliste.');return v.map(x=>{if(!x||typeof x!=='object'||Object.keys(x).some(k=>!keys.includes(k)))fail('invalid-argument','Unerlaubte Aufgabenfelder.');return build(x);});};
 if(value.options!==undefined)clean.options=objects(value.options,6,['text','correct'],x=>({text:text(x.text,180),correct:x.correct===true}));
 if(value.acceptedAnswers!==undefined)clean.acceptedAnswers=strings(value.acceptedAnswers,120,4);
 if(value.pairs!==undefined)clean.pairs=objects(value.pairs,15,['left','right'],x=>({left:text(x.left,180),right:text(x.right,180)}));
 if(value.items!==undefined)clean.items=strings(value.items,180,20);
 if(value.groups!==undefined)clean.groups=objects(value.groups,10,['name','items'],x=>({name:text(x.name,100),items:strings(x.items,180,20)}));
 if(value.targetWords!==undefined)clean.targetWords=strings(value.targetWords,120,30);
 if(value.markGroups!==undefined)clean.markGroups=objects(value.markGroups,4,['name','color','words'],x=>({name:text(x.name||'',100),color:text(x.color||'',30),words:strings(x.words||[],120,30)}));
 if(value.acceptedOrders!==undefined){if(!Array.isArray(value.acceptedOrders)||value.acceptedOrders.length>12)fail('invalid-argument','Ungültige Reihenfolge.');clean.acceptedOrders=value.acceptedOrders.map(value=>{const order=Array.isArray(value)?value:value?.indices;if(!Array.isArray(order)||order.length>20||order.some(n=>!Number.isInteger(n)||n<0||n>100))fail('invalid-argument','Ungültige Reihenfolge.');return {indices:[...order]};});}

 if(value.passage!==undefined)clean.passage=text(value.passage,600);
 for(const key of ['imageChoices','imagePresent'])if(value[key]!==undefined)clean[key]=value[key]===true;
 if(value.correctBoolean!==undefined){if(value.correctBoolean!==null&&typeof value.correctBoolean!=='boolean')fail('invalid-argument','Ungültige Lösung.');clean.correctBoolean=value.correctBoolean;}
 if(value.numericAnswer!==undefined){if(value.numericAnswer!==null&&!Number.isFinite(value.numericAnswer))fail('invalid-argument','Ungültige Lösung.');clean.numericAnswer=value.numericAnswer;}
 if(JSON.stringify(clean).length>24000)fail('invalid-argument','Aufgabenkontext ist zu groß.');
 return clean;
}
async function recordQuestionFeedback({tx,uid,admin,data,projectId,now,toTimestamp}){
 const allowed=new Set(['actorUid','action','clientRequestId','testCode','questionId','questionPosition','verdict','reason','teacherComment','feedbackAction','questionSnapshot','appVersion','sourceRelease','subject','grade','model','promptVersion','draftOnly','reviewOutcome','reviewerReason']);
 if(Object.keys(data).some(k=>!allowed.has(k)))fail('invalid-argument','Unerwartete Feedbackfelder.');
 const requestId=identifier(data.clientRequestId),testCode=identifier(data.testCode),questionId=identifier(data.questionId);
 if(!['good','bad'].includes(data.verdict)||!['keep','replace','remove'].includes(data.feedbackAction)||!REASONS.has(data.reason||''))fail('invalid-argument','Ungültige Aufgabenbewertung.');
 const clean={testCode,questionId,questionPosition:Number.isInteger(data.questionPosition)&&data.questionPosition>0&&data.questionPosition<=500?data.questionPosition:0,
  verdict:data.verdict,reason:data.reason||'',teacherComment:text(data.teacherComment||'',500),action:data.feedbackAction,questionSnapshot:snapshot(data.questionSnapshot),
  subject:text(data.subject||'',120),grade:text(data.grade||'',60),model:text(data.model||'',60),promptVersion:text(data.promptVersion||'',60),appVersion:text(data.appVersion||'',80),
  sourceRelease:/^[a-f0-9]{40}$/.test(data.sourceRelease||'')?data.sourceRelease:'unknown',draftOnly:data.draftOnly===true,
  reviewOutcome:data.reviewOutcome==='false_positive'?'false_positive':'',reviewerReason:text(data.reviewerReason||'',60)};
 clean.reasonCategory=clean.reason;clean.reason=({content_wrong:'incorrect',answer_wrong:'incorrect',unclear:'ambiguous',off_topic:'other'})[clean.reason]||clean.reason;
 const payloadHash=hash(JSON.stringify(clean)),feedbackId='aiq4-'+hash(`${uid}:${requestId}`),path='feedback/'+feedbackId;
 const old=await tx.get(path);
 if(old){if(old.userId!==uid||old.payloadHash!==payloadHash)fail('already-exists','Widersprüchliche Rückmeldung.');return {confirmed:true,duplicate:true,id:feedbackId,status:old.status};}
 const quiz=await tx.get('quizzes/'+testCode);
 if(quiz&&quiz.ownerId!==uid&&!admin||!quiz&&!clean.draftOnly)fail('permission-denied','Kein Zugriff auf den Test.');
 if(quiz?.published&&!quiz.ended&&clean.action!=='keep')fail('failed-precondition','Veröffentlichte Aufgaben können nur gemeldet werden.');
 tx.set(path,{...clean,category:'ai_question',feedbackSchemaVersion:4,userId:uid,sourceProject:projectId,environment:projectId==='hausaufgabe-staging'?'production':'staging',
  message:clean.reviewOutcome?'Prüferwarnung zurückgewiesen':clean.verdict==='good'?'Gute Aufgabe – behalten.':`Aufgabe gemeldet${clean.action==='remove'?' · Entfernen aus dem Entwurf angefordert':''}${clean.reason?': '+clean.reason:''}${clean.teacherComment?' · '+clean.teacherComment:''}`,
  questionType:clean.questionSnapshot.type,payloadHash,createdAt:toTimestamp(now),status:'new',processingEvidence:'not_reviewed'});
 return {confirmed:true,duplicate:false,id:feedbackId,status:'new'};
}
function projectQuestionFeedback(row){
 const keep=['id','testCode','questionId','questionPosition','questionType','verdict','reason','reasonCategory','teacherComment','action','status','appVersion','sourceRelease','feedbackSchemaVersion'];
 const result=Object.fromEntries(keep.filter(k=>typeof row[k]==='string'||typeof row[k]==='number').map(k=>[k,row[k]]));
 result.sourceProject=['hausaufgabe-staging','gradecrew-staging-2026','hausaufgabe-40294'].includes(row.sourceProject)?row.sourceProject:'unknown';
 result.environment=['production','staging'].includes(row.environment)?row.environment:'unknown';
 Object.assign(result,require('./feedback-learning').learningProjection(row));
 if(row.reviewOutcome==='false_positive')result.reviewOutcome='false_positive';
 if(row.questionSnapshot&&typeof row.questionSnapshot.text==='string')result.questionSnapshot={type:String(row.questionSnapshot.type||'').slice(0,30),text:row.questionSnapshot.text.slice(0,900)};
 const t=row.createdAt;result.createdAt=typeof t?.toMillis==='function'?t.toMillis():typeof t==='number'?t:null;
 return result;
}
module.exports={recordQuestionFeedback,projectQuestionFeedback,snapshot};
