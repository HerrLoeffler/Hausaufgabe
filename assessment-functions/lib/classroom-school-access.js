'use strict';
const crypto=require('node:crypto');
const {assessmentRunId}=require('./assessment-run-id');
const key=(...parts)=>crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex');
const pupilCommands=new Set(['login','me','activity','logout','acknowledgeResume','deviceExitStatus','acknowledgeDeviceExit']);
const assignmentCommands=new Set(['participants','startRound','restart','requestResume','resolveSubmission','requestDeviceExit','allowDeviceResume']);
function wrapClassroom({store,now,getIdentity,createCore,fail}){
 const id=value=>{if(typeof value!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(value))fail('invalid-argument','Ungültige Schul- oder Klassenzuordnung.');return value;};
 const schoolPath=s=>'classroomSchools/'+id(s),selectionPath=(s,u)=>schoolPath(s)+'/teacherClasses/'+id(u);
 const profile=async(reader,uid)=>{const [user,deletion]=await Promise.all([reader.get('users/'+uid),reader.get('accountDeletions/'+uid)]);if(!user||deletion||user.accountDeletionId||user.isTestAccountArchived||(user.status||'active')!=='active'||!['teacher','admin'].includes(user.role||'teacher'))fail('permission-denied','Dieser Lehrkraftzugang ist nicht aktiv.');return user;};
 const list=(reader,...args)=>(reader.list||store.list)(...args);
 const verified=identity=>identity?.emailVerified===true&&identity.disabled!==true;
 async function canonical(reader,uid,schoolId,identity){
  const config=await reader.get('appConfig/billingProduct');
  if(!config?.enabled||!config.allowedUids?.includes(uid))fail('failed-precondition','Dieser Schulanschluss ist noch nicht für dein Testkonto freigegeben.');
  if(!verified(identity)||identity.uid!==uid)fail('permission-denied','Bitte mit einem aktiven Lehrerkonto und bestätigter E-Mail-Adresse anmelden.');
  const [school,member]=await Promise.all([reader.get('billingV2Schools/'+id(schoolId)),reader.get('billingV2Memberships/'+key(schoolId,uid))]);
  if(!school||school.status!=='active'||!member||member.status!=='active'||member.personId!==uid||member.schoolId!==schoolId||member.seatAssigned!==true||!['teacher','school_admin'].includes(member.role))fail('permission-denied','Deine Schulzuordnung ist nicht aktiv.');
  return {school,member};
 }
 async function resolve(uid,requested){
  if(!uid)fail('unauthenticated','Bitte als Lehrkraft anmelden.');id(uid);if(requested!==undefined&&requested!==null)id(requested);
  await profile(store,uid);
  const legacy=await store.get('classroomMembers/'+uid),config=await store.get('appConfig/billingProduct');
  let identity=null;const choices=new Map(),available=[];
  if(legacy){const school=await store.get(schoolPath(legacy.schoolId));if(school&&!school.canonicalSchoolId)choices.set(legacy.schoolId,{id:legacy.schoolId,name:school.name});}
  if(config?.enabled&&config.allowedUids?.includes(uid)){
   identity=getIdentity?await getIdentity(uid):null;
   if(verified(identity)&&identity.uid===uid){
    const members=await store.list('billingV2Memberships','personId',uid);
    if(members.filter(m=>m.status==='active').length>20)fail('resource-exhausted','Zu viele aktive Schulzuordnungen. Bitte die Verwaltung fragen.');
    for(const member of members.filter(m=>m.status==='active'&&m.seatAssigned===true&&['teacher','school_admin'].includes(m.role))){
     const billingId=id(member.schoolId),school=await store.get('billingV2Schools/'+billingId),binding=await store.get('classroomSchoolBindings/'+billingId);
     if(!school||school.status!=='active')continue;
     if(binding){const physical=await store.get(schoolPath(binding.classroomSchoolId));if(!physical||physical.canonicalSchoolId!==billingId)fail('failed-precondition','Die Schulverknüpfung muss geprüft werden.');choices.set(binding.classroomSchoolId,{id:binding.classroomSchoolId,name:physical.name});}
     else available.push({id:billingId,name:school.name,canManage:member.role==='school_admin'});
    }
   }
  }
  let schoolId=requested||legacy?.schoolId||(choices.size===1?[...choices.keys()][0]:null);
  if(requested&&!choices.has(requested))fail('permission-denied','Diese Schule gehört nicht zu deinem aktuellen Zugang.');
  return {uid,identity,legacy,schoolId,schools:[...choices.values()],availableBillingSchools:available};
 }
 async function guard(reader,scope,command,data={}){
  await profile(reader,scope.uid);
  if(!scope.schoolId){if(['workspace','createSchool','connectSchool'].includes(command))return null;fail('failed-precondition','Bitte zuerst eine Schule auswählen.');}
  const school=await reader.get(schoolPath(scope.schoolId));if(!school)fail('not-found','Diese Schule ist nicht mehr verfügbar.');
  let role;
  if(school.canonicalSchoolId){
   const access=await canonical(reader,scope.uid,school.canonicalSchoolId,scope.identity),binding=await reader.get('classroomSchoolBindings/'+school.canonicalSchoolId);
   if(binding?.classroomSchoolId!==scope.schoolId)fail('permission-denied','Diese Schulverknüpfung ist nicht gültig.');role=access.member.role==='school_admin'?'admin':'teacher';
  }else{
   const old=await reader.get('classroomMembers/'+scope.uid);if(!old||old.schoolId!==scope.schoolId||!['admin','teacher'].includes(old.role))fail('permission-denied','Keine Berechtigung für diese Schule.');role=old.role;
  }
  const selection=await reader.get(selectionPath(scope.schoolId,scope.uid)),classIds=Array.isArray(selection?.classIds)?selection.classIds:[];
  let classId=data.classId;
  if(assignmentCommands.has(command)){
   const a=await reader.get(schoolPath(scope.schoolId)+'/assignments/'+id(data.assignmentId));
   if(!a||a.ownerId!==scope.uid)fail('permission-denied','Für diese Prüfung fehlt die Berechtigung.');classId=a.classId;
  }
  if(role!=='admin'){
   if(command==='printCodes'&&!classId)fail('permission-denied','Bitte eine deiner Klassen zum Drucken auswählen.');
   if(classId&&!classIds.includes(id(classId)))fail('permission-denied','Bitte diese Klasse zuerst unter „Meine Klassen“ auswählen.');
   if(command==='createClass'&&classIds.length>=100)fail('resource-exhausted','Bitte zuerst die Auswahl deiner Klassen verkleinern.');
  }
  if(command==='assign'){const quizId=id(data.quizId),quiz=await reader.get('quizzes/'+quizId),policy=await reader.get('classroomQuizPolicies/'+quizId);if(quiz?.ownerId===scope.uid&&policy?.required&&policy.sessionRunId===assessmentRunId(quiz,quizId,fail)&&policy.schoolId!==scope.schoolId)fail('failed-precondition','Diese veröffentlichte Runde gehört bereits zu einer anderen Schule. Bitte den Test für die andere Schule duplizieren.');}
  return {schoolId:scope.schoolId,role,school,classIds,selection};
 }
 async function workspace(scope,data){
  return store.transaction(async tx=>{
   const member=await guard(tx,scope,'workspace',data),common={schools:scope.schools,availableBillingSchools:scope.availableBillingSchools};
   if(!member)return {school:null,classes:[],classCatalog:[],students:[],assignments:[],...common};
   const all=(await list(tx,schoolPath(scope.schoolId)+'/classes')).filter(c=>!c.status||c.status==='active');
   const permitted=all.filter(c=>member.role==='admin'||member.classIds.includes(c.id));
   const selected=data.classId?id(data.classId):(permitted[0]?.id||null);
   if(selected&&!permitted.some(c=>c.id===selected))fail('permission-denied','Für diese Klasse fehlt die Berechtigung.');
   const pupils=new Map();for(const c of permitted){const rows=await list(tx,schoolPath(scope.schoolId)+'/students','classId',c.id);pupils.set(c.id,rows);}
   const assignments=await list(tx,schoolPath(scope.schoolId)+'/assignments','ownerId',scope.uid);
   return {school:{id:scope.schoolId,name:member.school.name,canonicalSchoolId:member.school.canonicalSchoolId||null},role:member.role,classes:permitted.map(c=>({...c,studentCount:pupils.get(c.id).length})),classCatalog:all.map(c=>({id:c.id,name:c.name,year:c.year,selected:member.role==='admin'||member.classIds.includes(c.id)})),selectedClassId:selected,students:(pupils.get(selected)||[]).map(p=>({id:p.id,firstName:p.firstName,lastName:p.lastName,classId:p.classId,status:p.status})),assignments:assignments.filter(a=>permitted.some(c=>c.id===a.classId)),...common};
  });
 }
 async function connect(scope,data){
  const billingId=id(data.billingSchoolId);if(data.confirm!==true)fail('failed-precondition','Bitte die Schulverknüpfung ausdrücklich bestätigen.');const freshId=crypto.randomUUID();
  return store.transaction(async tx=>{
   await profile(tx,scope.uid);const access=await canonical(tx,scope.uid,billingId,scope.identity);
   if(access.member.role!=='school_admin')fail('permission-denied','Nur die Schulverwaltung kann den Klassenbestand verknüpfen.');
   const existing=await tx.get('classroomSchoolBindings/'+billingId),physicalId=data.useExistingSchool===true?scope.schoolId:freshId;
   if(data.useExistingSchool===true&&!scope.schoolId)fail('permission-denied','Kein eigener Klassenbestand zum Verknüpfen vorhanden.');
   if(existing){if(existing.classroomSchoolId===scope.schoolId)return {schoolId:scope.schoolId,alreadyConnected:true};fail('already-exists','Diese Schule hat bereits einen Klassenbestand. Bestände werden nicht automatisch zusammengeführt.');}
   if(scope.legacy&&data.useExistingSchool!==true)fail('failed-precondition','Bitte die Übernahme deines vorhandenen Klassenbestands ausdrücklich auswählen.');
   const physical=await tx.get(schoolPath(physicalId)),legacy=await tx.get('classroomMembers/'+scope.uid);
   if(data.useExistingSchool===true){if(!physical||!legacy||legacy.schoolId!==physicalId||legacy.role!=='admin')fail('permission-denied','Für diesen Klassenbestand fehlen Verwaltungsrechte.');if(physical.canonicalSchoolId)fail('already-exists','Dieser Klassenbestand ist bereits einer Schule zugeordnet.');}
   else if(physical)fail('aborted','Bitte die Schulverknüpfung erneut öffnen.');
   tx.set(schoolPath(physicalId),{...(physical||{name:access.school.name,createdAt:now()}),canonicalSchoolId:billingId,bindingVersion:1});
   tx.set('classroomSchoolBindings/'+billingId,{classroomSchoolId:physicalId,canonicalSchoolId:billingId,createdBy:scope.uid,createdAt:now()});
   tx.set('classroomSchoolAudit/'+key('connect',billingId),{action:'school_connected',canonicalSchoolId:billingId,classroomSchoolId:physicalId,actorId:scope.uid,at:now()});
   return {schoolId:physicalId,alreadyConnected:false};
  });
 }
 async function selectClasses(scope,data){
  if(!Array.isArray(data.classIds)||data.classIds.length>100||new Set(data.classIds).size!==data.classIds.length)fail('invalid-argument','Bitte höchstens 100 verschiedene Klassen auswählen.');const classIds=data.classIds.map(id);
  return store.transaction(async tx=>{await guard(tx,scope,'setTeacherClasses');for(const classId of classIds){const c=await tx.get(schoolPath(scope.schoolId)+'/classes/'+classId);if(!c||(c.status&&c.status!=='active'))fail('not-found','Eine ausgewählte Klasse gehört nicht zu dieser Schule.');}
   const previous=await tx.get(selectionPath(scope.schoolId,scope.uid));if(JSON.stringify(previous?.classIds)===JSON.stringify(classIds))return {classIds};
   tx.set(selectionPath(scope.schoolId,scope.uid),{classIds,updatedAt:now()});
   tx.set('classroomSchoolAudit/'+crypto.randomUUID(),{action:'classes_selected',classroomSchoolId:scope.schoolId,actorId:scope.uid,classIds,at:now()});return {classIds};});
 }
 const pupilCore=createCore({store,now});
 return {execute:async(uid,command,data={},context={})=>{
  if(!data||typeof data!=='object'||Array.isArray(data))fail('invalid-argument','Ungültige Anfrage.');
  if(pupilCommands.has(command))return pupilCore.execute(uid,command,data,context);
  const scope=await resolve(uid,data.schoolId);
  if(command==='workspace')return workspace(scope,data);
  if(command==='connectSchool')return connect(scope,data);
  if(command==='setTeacherClasses')return selectClasses(scope,data);
  const member=await store.transaction(tx=>guard(tx,scope,command,data));
  if(command==='createSchool'&&member)fail('already-exists','Du bist bereits einer Schule zugeordnet.');
  const scoped={...store,get:async path=>path==='classroomMembers/'+uid?(member?{schoolId:scope.schoolId,role:member.role}:null):store.get(path),transaction:fn=>store.transaction(async tx=>{
   const access=await guard(tx,scope,command,data);
   return fn({...tx,set:(path,value)=>{
    tx.set(path,value);
    if(command==='createClass'&&access?.role==='teacher'&&path.startsWith(schoolPath(scope.schoolId)+'/classes/')){
     const classId=path.split('/').pop();tx.set(selectionPath(scope.schoolId,uid),{classIds:[...new Set([...access.classIds,classId])],updatedAt:now()});
    }
   }});
  })};
  const result=await createCore({store:scoped,now}).execute(uid,command,data,context);
  if(['printCodes','participants'].includes(command))await store.transaction(tx=>guard(tx,scope,command,data));
  return result;
 }};
}
module.exports={wrapClassroom};
