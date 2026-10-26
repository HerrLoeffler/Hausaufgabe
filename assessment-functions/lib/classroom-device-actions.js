'use strict';
const {secureTokenMatches}=require('./assessment-core');
const safe=(v,fail)=>{if(typeof v!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(v))fail('invalid-argument','Ungültiger Prüfungsbezug.');return v;};
function deviceExitAction(action,{operation,actionId,outcome,now,fail}){
 if(!action)return null;
 if(operation==='poll')return action.state==='pending'?{...action,state:'delivered',deliveredAt:now}:action;
 if(action.actionId!==actionId||action.state==='resume_allowed')fail('aborted','Der Geräteauftrag wurde inzwischen geändert.');
 if(operation==='resume'){
  if(action.state!=='ended')fail('failed-precondition','Das iPad muss das Ende des Prüfungsmodus zuerst bestätigen.');
  return {...action,state:'resume_allowed',resumeAllowedAt:now};
 }
 if(operation==='ack'){
  if(!['delivered','failed','ended'].includes(action.state)||!['ended','failed'].includes(outcome))fail('failed-precondition','Der Geräteauftrag wurde noch nicht zugestellt.');
  if(action.state==='ended')return action;
  return {...action,state:outcome,acknowledgedAt:now};
 }
 fail('invalid-argument','Unbekannte Geräteaktion.');
}
async function runDeviceCommand({store,now,fail,command,data,uid,member}){
 const device=['deviceExitStatus','acknowledgeDeviceExit'].includes(command);
 const attemptId=safe(data.attemptId,fail);
 if(device){
  const quizId=safe(data.quizId,fail);
  return store.transaction(async tx=>{
   const attempt=await tx.get(`quizzes/${quizId}/attempts/${attemptId}`),secret=await tx.get(`assessmentPrivate/${quizId}_${attemptId}`);
   if(!attempt||!secureTokenMatches(data.attemptToken,secret?.tokenHash))fail('permission-denied','Für diesen Prüfungsversuch fehlt die Berechtigung.');
   const b=attempt.classroom;if(!b)fail('failed-precondition','Dieser Versuch ist keiner Klasse zugeordnet.');
   const path=`classroomSchools/${b.schoolId}/assignments/${b.assignmentId}/participants/${b.studentId}`,p=await tx.get(path);
   if(!p||p.attemptId!==attemptId||p.generation!==b.generation){
    const receipt=await require('./classroom-binding').readReplacementReceipt({get:path=>tx.get(path),attempt,now:now()});
    if(receipt)return {status:'replaced',attemptId,replacementReceipt:receipt};
    fail('aborted','Dieser Versuch wurde inzwischen geändert.');
   }
   const a=p.deviceExit;
   if(a&&(a.attemptId!==attemptId||a.generation!==p.generation||a.studentId!==b.studentId))fail('aborted','Dieser Geräteauftrag gehört nicht zum aktuellen Versuch.');
   const action=deviceExitAction(a,{operation:command==='deviceExitStatus'?'poll':'ack',actionId:data.actionId,outcome:data.outcome,now:now(),fail});
   const build=String(data.build||'').slice(0,20),caps=p.deviceCapabilities;
   const update=action!==a||command==='deviceExitStatus'&&(!caps||caps.build!==build||now()-caps.lastSeenAt>=15000);
   if(update)tx.set(path,{...p,deviceExit:action||null,deviceCapabilities:command==='deviceExitStatus'?{exitProtocol:1,build,lastSeenAt:now()}:caps});
   return {action:action||null,capability:'device_exit_v1'};
  });
 }
 const assignmentId=safe(data.assignmentId,fail),studentId=safe(data.studentId,fail),actionId=safe(data.actionId,fail),base=`classroomSchools/${safe(member.schoolId,fail)}/assignments/${assignmentId}`;
 if(data.confirm!==true)fail('failed-precondition','Bitte die Geräteaktion ausdrücklich bestätigen.');
 return store.transaction(async tx=>{
  const a=await tx.get(base),pPath=`${base}/participants/${studentId}`,p=await tx.get(pPath);
  if(!a||a.ownerId!==uid||!a.recipientIds.includes(studentId))fail('permission-denied','Für diese Person und Prüfung fehlt die Berechtigung.');
  const quiz=await tx.get(`quizzes/${a.quizId}`),attempt=await tx.get(`quizzes/${a.quizId}/attempts/${attemptId}`);
  if(!quiz||quiz.ownerId!==uid||!p||p.attemptId!==attemptId||p.generation!==data.expectedGeneration||!attempt?.classroom||attempt.classroom.studentId!==studentId||attempt.classroom.assignmentId!==assignmentId||attempt.classroom.generation!==p.generation)fail('aborted','Bitte den aktuellen Prüfungsversuch erneut prüfen.');
  let action;
  if(command==='requestDeviceExit'){
   if(p.deviceCapabilities?.exitProtocol!==1)fail('failed-precondition','Dieses iPad hat die neue Gerätehilfe noch nicht bestätigt. Bitte zuerst den neuen Secure-Build installieren und mit diesem Versuch verbinden.');
   if(p.deviceExit?.actionId===actionId)return {action:p.deviceExit};
   if(p.deviceExit&&!['resume_allowed'].includes(p.deviceExit.state))fail('already-exists','Für dieses Gerät läuft bereits ein Freigabeauftrag.');
   if(typeof data.reason!=='string'||!data.reason.trim()||data.reason.trim().length>300)fail('invalid-argument','Bitte den technischen Grund angeben.');
   action={kind:'classroom_device_exit_v1',schoolId:member.schoolId,quizId:a.quizId,assignmentId,studentId,attemptId,generation:p.generation,actionId,state:'pending',requestedAt:now()};
  }else action=deviceExitAction(p.deviceExit,{operation:'resume',actionId,now:now(),fail});
  if(!action)fail('failed-precondition','Es besteht kein Geräteauftrag.');
  tx.set(pPath,{...p,deviceExit:action});tx.set(`${base}/deviceAudit/${actionId}_${command}`,{...action,actor:uid,reason:command==='requestDeviceExit'?data.reason.trim():null,command,at:now()});
  return {action};
 });
}
module.exports={deviceExitAction,runDeviceCommand};
