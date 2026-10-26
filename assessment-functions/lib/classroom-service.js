'use strict';
// Server-only Classroom state. No teacher auth state is changed by pupil login.
const crypto=require('node:crypto');
const {assessmentRunId}=require('./assessment-run-id');
const {commonDeadlineExpired,roundDetails}=require('./classroom-round');
const {requestResume,receiveResume,resumeState}=require('./classroom-actions');
class ClassroomError extends Error {constructor(code,message){super(message);this.code=code;}}
const fail=(code,message)=>{throw new ClassroomError(code,message);};
const hash=value=>crypto.createHash('sha256').update(String(value)).digest('hex');
const text=(value,max=120)=>{if(typeof value!=='string'||!value.trim()||value.trim().length>max)fail('invalid-argument','Bitte die Angaben prüfen.');return value.trim();};
const id=value=>{if(typeof value!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(value))fail('invalid-argument','Ungültige Zuordnung.');return value;};
const stamp=value=>typeof value?.toMillis==='function'?value.toMillis():Number(value)||0;
function createClassroomService({store,now=Date.now}){
 const schoolPath=s=>`classroomSchools/${id(s)}`,studentPath=(s,p)=>`${schoolPath(s)}/students/${id(p)}`,assignmentPath=(s,a)=>`${schoolPath(s)}/assignments/${id(a)}`;
 async function teacher(uid){if(!uid)fail('unauthenticated','Bitte als Lehrkraft anmelden.');id(uid);const [u,d,m]=await Promise.all([store.get(`users/${uid}`),store.get(`accountDeletions/${uid}`),store.get(`classroomMembers/${uid}`)]);if(!u||d||(u.status||'active')!=='active'||u.accountDeletionId||!['teacher','admin'].includes(u.role||'teacher'))fail('permission-denied','Dieser Lehrkraftzugang ist nicht aktiv.');return m||null;}
 async function key(){return store.transaction(async tx=>{let k=await tx.get('classroomPrivate/credentialKey');if(!k){k={key:crypto.randomBytes(32).toString('base64')};tx.set('classroomPrivate/credentialKey',k);}return Buffer.from(k.key,'base64');});}
 function seal(code,k,aad){const n=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',k,n);c.setAAD(Buffer.from(aad));const b=Buffer.concat([c.update(code,'utf8'),c.final()]);return Buffer.concat([n,c.getAuthTag(),b]).toString('base64');}
 async function session(token,{activity=false}={}){
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))fail('unauthenticated','Bitte mit deinem persönlichen Code anmelden.');
  const path=`classroomSessions/${hash(token)}`;
  return store.transaction(async tx=>{const s=await tx.get(path);if(!s||s.expiresAt<=now()||(s.deviceMode==='shared'&&s.lastActivity+300000<=now()))fail('unauthenticated','Bitte deinen persönlichen Code erneut eingeben.');const p=await tx.get(studentPath(s.schoolId,s.studentId));if(!p||p.status!=='active'||p.accessVersion!==s.accessVersion)fail('unauthenticated','Dieser Schülerzugang ist nicht mehr aktiv.');if(activity)tx.set(path,{...s,lastActivity:now()});return {...s,student:p};});
 }
 async function pupilAction(s,assignmentId,ackId,generation){
  const path=assignmentPath(s.schoolId,id(assignmentId));return store.transaction(async tx=>{
   const a=await tx.get(path),pPath=`${path}/participants/${s.studentId}`,p=await tx.get(pPath)||{generation:0};
   if(!a?.recipientIds?.includes(s.studentId))fail('permission-denied','Diese Prüfung ist dir nicht zugewiesen.');
   if(ackId&&p.generation!==generation)fail('failed-precondition','Dieser Versuch wurde inzwischen geändert.');
   const received=receiveResume(p.resumeAction,{generation:p.generation,now:now(),ackId,fail});
   if(received)tx.set(pPath,{...p,resumeAction:received});return received;
  });
 }
 async function assignmentStates(s){const list=await store.list(`${schoolPath(s.schoolId)}/assignments`,'recipientIds',s.studentId);const rows=[];for(const a of list){const [q,p]=await Promise.all([store.get(`quizzes/${a.quizId}`),store.get(`${assignmentPath(s.schoolId,a.id)}/participants/${s.studentId}`)]);if(!q||q.isDeleted||q.rightsHold)continue;const submitted=p?.attemptId?await store.get(`quizzes/${a.quizId}/submissions/${p.attemptId}`):null;const attempt=p?.attemptId?await store.get(`quizzes/${a.quizId}/attempts/${p.attemptId}`):null;const current=assessmentRunId(q,a.quizId,fail)===a.sessionRunId&&q.published&&!q.ended&&!commonDeadlineExpired(q,now());rows.push({id:a.id,quizId:a.quizId,title:a.title,subject:a.subject,className:a.className,status:submitted?'submitted':attempt?'in_progress':current?'available':'closed',startState:q.startMode==='teacher'&&q.sessionState!=='running'?'waiting':'open',generation:p?.generation||0,attemptId:p?.attemptId||null,resumeAction:submitted?null:await pupilAction(s,a.id)});}return rows;}
 async function me(s){const school=await store.get(schoolPath(s.schoolId)),c=await store.get(`${schoolPath(s.schoolId)}/classes/${s.student.classId}`);return {student:{id:s.studentId,firstName:s.student.firstName,lastName:s.student.lastName,className:c?.name||''},school:{id:s.schoolId,name:school?.name||''},session:{deviceMode:s.deviceMode,expiresAt:s.expiresAt,idleTimeoutMillis:s.deviceMode==='shared'?300000:null},assignments:await assignmentStates(s),assignmentConnection:'connected'};}
 async function execute(uid,command,data={},context={}){
  if(!data||typeof data!=='object'||Array.isArray(data))fail('invalid-argument','Ungültige Anfrage.');
  if(command==='login'){
   const code=String(data.code||'').toUpperCase().replace(/[\s-]/g,'');const mode=data.deviceMode||'shared';if(!['shared','personal'].includes(mode))fail('invalid-argument','Bitte den Gerätemodus wählen.');const ratePath=`classroomRateLimits/${hash(context.ip||'unknown')}`;const k=await key();const digest=crypto.createHmac('sha256',k).update(code).digest('hex');
   const result=await store.transaction(async tx=>{const r=await tx.get(ratePath),access=/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/.test(code)?await tx.get(`classroomAccess/${digest}`):null;const rate=r&&r.since>now()-600000?r:{since:now(),count:0};if(rate.count>=1200)fail('resource-exhausted','Zu viele Anmeldeversuche. Bitte kurz warten.');const p=access?await tx.get(studentPath(access.schoolId,access.studentId)):null;tx.set(ratePath,{since:rate.since,count:rate.count+1});if(!p||p.status!=='active'||p.accessVersion!==access.version)return null;const token=crypto.randomBytes(32).toString('base64url'),s={schoolId:access.schoolId,studentId:access.studentId,accessVersion:access.version,deviceMode:mode,lastActivity:now(),expiresAt:now()+(mode==='personal'?30*86400000:8*3600000)};tx.set(`classroomSessions/${hash(token)}`,s);return {token,s:{...s,student:p}};});
   if(!result)fail('unauthenticated','Der persönliche Code ist ungültig.');return {...await me(result.s),sessionToken:result.token};
  }
  if(['me','activity','logout','acknowledgeResume'].includes(command)){const s=await session(data.sessionToken,{activity:command==='activity'});if(command==='acknowledgeResume'){await pupilAction(s,data.assignmentId,id(data.actionId),data.generation);return {acknowledged:true};}if(command==='logout'){await store.transaction(async tx=>tx.remove(`classroomSessions/${hash(data.sessionToken)}`));return {signedOut:true};}return me(s);}
  const member=await teacher(uid);
  if(command==='createSchool'){
   const name=text(data.name);return store.transaction(async tx=>{const old=await tx.get(`classroomMembers/${uid}`);if(old)fail('already-exists','Du bist bereits einer Schule zugeordnet.');tx.set(schoolPath(uid),{name,createdAt:now()});tx.set(`classroomMembers/${uid}`,{schoolId:uid,role:'admin'});return {schoolId:uid};});
  }
  if(command==='workspace'){
   if(!member)return {school:null,classes:[],students:[],assignments:[]};const school=await store.get(schoolPath(member.schoolId));const classes=await store.list(`${schoolPath(member.schoolId)}/classes`);const selectedClassId=data.classId?id(data.classId):(classes[0]?.id||null);if(selectedClassId&&!classes.some(c=>c.id===selectedClassId))fail('permission-denied','Diese Klasse gehört nicht zu deiner Schule.');for(const c of classes)c.studentCount=store.count?await store.count(`${schoolPath(member.schoolId)}/students`,'classId',c.id):(await store.list(`${schoolPath(member.schoolId)}/students`,'classId',c.id)).length;return {school:{id:member.schoolId,...school},role:member.role,classes,selectedClassId,students:selectedClassId?(await store.list(`${schoolPath(member.schoolId)}/students`,'classId',selectedClassId)).map(({codeCipher,...p})=>p):[],assignments:await store.list(`${schoolPath(member.schoolId)}/assignments`,'ownerId',uid)};
  }
  if(!member)fail('failed-precondition','Bitte zuerst deine Schule einrichten.');const base=schoolPath(member.schoolId);
  if(command==='createClass'){
   const name=text(data.name,60),year=text(data.year,20),classId=crypto.randomUUID();return store.transaction(async tx=>{const existing=await tx.get(`${base}/classNames/${hash(name.toLocaleLowerCase('de')+'|'+year)}`);if(existing)fail('already-exists','Diese Klasse besteht in diesem Schuljahr bereits.');const value={name,year,createdBy:uid,createdAt:now()};tx.set(`${base}/classes/${classId}`,value);tx.set(`${base}/classNames/${hash(name.toLocaleLowerCase('de')+'|'+year)}`,{classId});return {id:classId,...value};});
  }
  if(command==='createStudent'){
   const classId=id(data.classId),firstName=text(data.firstName,100),lastName=text(data.lastName,100),studentId=crypto.randomUUID(),k=await key(),alphabet='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';const code=[...crypto.randomBytes(8)].map(b=>alphabet[b&31]).join(''),digest=crypto.createHmac('sha256',k).update(code).digest('hex');return store.transaction(async tx=>{const c=await tx.get(`${base}/classes/${classId}`),old=await tx.get(`classroomAccess/${digest}`);if(!c)fail('not-found','Die Klasse fehlt.');if(old)fail('aborted','Bitte erneut versuchen.');const p={firstName,lastName,classId,status:'active',accessVersion:1,codeCipher:seal(code,k,member.schoolId+':'+studentId),createdAt:now()};tx.set(studentPath(member.schoolId,studentId),p);tx.set(`classroomAccess/${digest}`,{schoolId:member.schoolId,studentId,version:1});return {id:studentId,firstName,lastName,classId,code};});
  }
  if(command==='printCodes'){
   const list=data.classId?await store.list(`${base}/students`,'classId',id(data.classId)):await store.list(`${base}/students`);const k=await key();return {rows:list.filter(p=>!data.classId||p.classId===data.classId).map(p=>{const b=Buffer.from(p.codeCipher,'base64'),d=crypto.createDecipheriv('aes-256-gcm',k,b.subarray(0,12));d.setAAD(Buffer.from(member.schoolId+':'+p.id));d.setAuthTag(b.subarray(12,28));return {id:p.id,firstName:p.firstName,lastName:p.lastName,classId:p.classId,code:Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8')};})};
  }
  if(command==='assign'){
   const quizId=id(data.quizId),classId=id(data.classId);const students=await store.list(`${base}/students`,'classId',classId);const recipients=students.filter(p=>p.status==='active').map(p=>p.id);if(!recipients.length||recipients.length>400)fail('failed-precondition','Die Klasse braucht zwischen 1 und 400 aktive Schüler.');const assignmentId=crypto.randomUUID();return store.transaction(async tx=>{const q=await tx.get(`quizzes/${quizId}`),c=await tx.get(`${base}/classes/${classId}`),policy=await tx.get(`classroomQuizPolicies/${quizId}`);if(!q||q.ownerId!==uid||!c)fail('permission-denied','Für diesen Test oder diese Klasse fehlt die Berechtigung.');for(const studentId of recipients){const current=await tx.get(studentPath(member.schoolId,studentId));if(!current||current.status!=='active'||current.classId!==classId)fail('aborted','Die Klasse wurde während der Zuweisung geändert. Bitte erneut prüfen.');}if(!q.published||q.ended||q.isDeleted||q.rightsHold||commonDeadlineExpired(q,now()))fail('failed-precondition','Bitte eine offene Prüfungsrunde veröffentlichen.');if(policy&&policy.sessionRunId===assessmentRunId(q,quizId,fail)&&policy.classIds?.includes(classId))fail('already-exists','Dieser Test ist der Klasse bereits zugewiesen.');const value={quizId,classId,className:c.name,ownerId:uid,title:q.title||'Test',subject:q.subject||'',sessionRunId:assessmentRunId(q,quizId,fail),recipientIds:recipients,createdAt:now()};tx.set(`${base}/assignments/${assignmentId}`,value);tx.set(`classroomQuizPolicies/${quizId}`,{schoolId:member.schoolId,sessionRunId:assessmentRunId(q,quizId,fail),classIds:policy?.sessionRunId===assessmentRunId(q,quizId,fail)?[...(policy.classIds||[]),classId]:[classId],required:true});return {id:assignmentId,...value};});
  }
  if(command==='startRound'){
   const aPath=assignmentPath(member.schoolId,id(data.assignmentId));return store.transaction(async tx=>{const a=await tx.get(aPath);if(!a||a.ownerId!==uid)fail('permission-denied','Für diese Prüfung fehlt die Berechtigung.');const qPath=`quizzes/${a.quizId}`,q=await tx.get(qPath);if(!q||q.ownerId!==uid||!q.published||q.ended||q.isDeleted||q.rightsHold||assessmentRunId(q,a.quizId,fail)!==a.sessionRunId||q.startMode!=='teacher')fail('failed-precondition','Diese gemeinsame Runde kann nicht gestartet werden.');if(q.sessionState==='running')return {startedAt:stamp(q.sessionStartedAt),alreadyRunning:true};if(q.sessionState!=='waiting')fail('failed-precondition','Die Runde ist nicht im Warteraum.');const startedAt=now();tx.set(qPath,{...q,sessionState:'running',sessionStartedAt:startedAt,updatedAt:startedAt});return {startedAt,alreadyRunning:false};});
  }
  if(['participants','restart','requestResume','resolveSubmission'].includes(command)){
   const assignmentId=id(data.assignmentId),aPath=assignmentPath(member.schoolId,assignmentId),a=await store.get(aPath);if(!a||a.ownerId!==uid)fail('permission-denied','Für diese Prüfung fehlt die Berechtigung.');
   if(command==='resolveSubmission'){
    const attemptId=id(data.attemptId);if(data.confirm!==true||!['link','retain'].includes(data.disposition))fail('failed-precondition','Bitte die Abgabe ausdrücklich prüfen und bestätigen.');
    const studentId=data.disposition==='link'?id(data.studentId):null;if(studentId&&!a.recipientIds.includes(studentId))fail('permission-denied','Diese Person gehört nicht zu dieser Klasse.');
    return store.transaction(async tx=>{
     const sp=`quizzes/${a.quizId}/submissions/${attemptId}`,ap=`quizzes/${a.quizId}/attempts/${attemptId}`,sub=await tx.get(sp),attempt=await tx.get(ap),q=await tx.get(`quizzes/${a.quizId}`);
     if(!q||q.ownerId!==uid||!sub||!attempt||sub.classroom||sub.classroomResolution||attempt.classroom||sub.sessionRunId!==a.sessionRunId||attempt.sessionRunId!==a.sessionRunId)fail('failed-precondition','Diese Abgabe ist nicht mehr zur Zuordnung verfügbar.');
     let p,pp,student;if(studentId){pp=`${aPath}/participants/${studentId}`;p=await tx.get(pp)||{generation:0};student=await tx.get(studentPath(member.schoolId,studentId));if(!student||student.status!=='active'||student.classId!==a.classId)fail('permission-denied','Bitte die aktuelle Klasse prüfen.');if(p.attemptId)fail('failed-precondition','Für diese Person besteht schon ein verknüpfter Versuch. Keine Abgabe wird ersetzt.');}
     const resolution={disposition:data.disposition,actor:uid,at:now(),assignmentId,studentId};
     if(studentId){const binding={schoolId:member.schoolId,studentId,assignmentId,generation:p.generation};tx.set(sp,{...sub,classroom:binding,classroomResolution:resolution});tx.set(ap,{...attempt,classroom:binding});tx.set(pp,{...p,attemptId});}
     else tx.set(sp,{...sub,classroomResolution:resolution});
     tx.set(`${aPath}/audit/${crypto.randomUUID()}`,{kind:'submission_resolution',attemptId,...resolution});return {resolved:true};
    });
   }
   if(command==='requestResume'){
    const studentId=id(data.studentId),actionId=id(data.actionId);if(!a.recipientIds.includes(studentId))fail('permission-denied','Diese Person gehört nicht zur Zuweisung.');
    return store.transaction(async tx=>{const pPath=`${aPath}/participants/${studentId}`,p=await tx.get(pPath)||{generation:0},q=await tx.get(`quizzes/${a.quizId}`);
     if(!q?.published||q.ended||q.isDeleted||q.rightsHold||commonDeadlineExpired(q,now())||assessmentRunId(q,a.quizId,fail)!==a.sessionRunId)fail('failed-precondition','Diese Prüfungsrunde ist geschlossen.');
     if(p.generation!==data.expectedGeneration)fail('aborted','Der Versuch wurde inzwischen geändert.');
     if(p.attemptId&&await tx.get(`quizzes/${a.quizId}/submissions/${p.attemptId}`))fail('failed-precondition','Dieser Versuch wurde bereits abgegeben.');
     const resumeAction=requestResume({previous:p.resumeAction,actionId,actor:uid,generation:p.generation,now:now()});
     tx.set(pPath,{...p,resumeAction});return {...resumeAction,state:resumeState(resumeAction,now())};
    });
   }
   if(command==='restart'){
    const studentId=id(data.studentId);if(data.confirm!==true||typeof data.reason!=='string'||!data.reason.trim()||data.reason.length>300)fail('failed-precondition','Bitte den neuen Versuch mit Begründung ausdrücklich bestätigen.');if(!a.recipientIds.includes(studentId))fail('permission-denied','Diese Person gehört nicht zur Zuweisung.');return store.transaction(async tx=>{const pPath=`${aPath}/participants/${studentId}`,p=await tx.get(pPath)||{generation:0};const q=await tx.get(`quizzes/${a.quizId}`);if(!q?.published||q.ended||q.isDeleted||q.rightsHold||commonDeadlineExpired(q,now())||assessmentRunId(q,a.quizId,fail)!==a.sessionRunId)fail('failed-precondition','Diese Prüfungsrunde ist geschlossen.');if(p.generation!==data.expectedGeneration)fail('aborted','Der Versuch wurde inzwischen geändert.');if(p.attemptId&&await tx.get(`quizzes/${a.quizId}/submissions/${p.attemptId}`))fail('failed-precondition','Dieser Versuch wurde bereits abgegeben. Bitte die Ergebnisse öffnen.');const releaseActionId=crypto.randomUUID();if(p.attemptId)tx.set(`${aPath}/replacements/${p.attemptId}`,{studentId,oldGeneration:p.generation,generation:p.generation+1,actionId:releaseActionId,actor:uid,releasedAt:now()});tx.set(pPath,{generation:p.generation+1,attemptId:null,previousAttemptId:p.attemptId||null,restartReason:data.reason.trim(),releasedBy:uid,releasedAt:now()});tx.set(`${aPath}/audit/${crypto.randomUUID()}`,{studentId,oldAttemptId:p.attemptId||null,generation:p.generation+1,reason:data.reason.trim(),actor:uid,at:now()});return {generation:p.generation+1};});
   }
   const rows=[];for(const studentId of a.recipientIds){const [s,p]=await Promise.all([store.get(studentPath(member.schoolId,studentId)),store.get(`${aPath}/participants/${studentId}`)]);const attempt=p?.attemptId?await store.get(`quizzes/${a.quizId}/attempts/${p.attemptId}`):null;const submitted=p?.attemptId?await store.get(`quizzes/${a.quizId}/submissions/${p.attemptId}`):null;rows.push({studentId,name:s?`${s.firstName} ${s.lastName}`:'Nicht mehr aktiv',status:submitted?'submitted':attempt?.status||'not_joined',lastSeenAt:stamp(attempt?.lastSeenAt||attempt?.updatedAt),attemptId:p?.attemptId||null,generation:p?.generation||0,resumeAction:p?.resumeAction?{...p.resumeAction,state:resumeState(p.resumeAction,now())}:null});}const quiz=await store.get(`quizzes/${a.quizId}`);if(quiz&&quiz.ownerId!==uid)fail('permission-denied','Diese Prüfung gehört nicht mehr zu deinem Konto.');const unlinkedSubmissions=(await store.list(`quizzes/${a.quizId}/submissions`)).filter(s=>s.sessionRunId===a.sessionRunId&&!s.classroom&&!s.classroomResolution).map(s=>({attemptId:s.id,name:s.studentName||'Ohne Namen',submittedAt:stamp(s.submittedAt)}));return {unlinkedSubmissions,assignment:{id:assignmentId,...a},round:roundDetails(quiz,now(),!!quiz&&assessmentRunId(quiz,a.quizId,fail)===a.sessionRunId),rows};
  }
  fail('invalid-argument','Unbekannte Aktion.');
 }
 return {execute};
}
module.exports={createClassroomService,ClassroomError,hash};
