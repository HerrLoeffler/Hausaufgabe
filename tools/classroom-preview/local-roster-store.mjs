import {createLocalStudentAccess} from './local-student-access.mjs';
import {createLocalSchoolStore} from './local-school-store.mjs';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,openSync,closeSync,chmodSync} from 'node:fs';
import {dirname} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';

import {RosterError,fail,keys,text,year,actor} from './local-roster-validation.mjs';
import {buildStudentImportPlan} from './local-roster-import.mjs';
import {buildTeacherImportPlan} from './local-teacher-import.mjs';
export {RosterError};
const empty=()=>({schemaVersion:1,revision:0,classes:[],students:[],teachers:[],storage:'local-device'});

// Device-local first slice. No school authority, cloud migration or shared grants
// are inferred from this account-owned workspace.
export function openLocalRoster(filename,{authProjectId='local-test',now=Date.now}={}){
 if(filename!==':memory:'){
  mkdirSync(dirname(filename),{recursive:true,mode:0o700});
  closeSync(openSync(filename,'a',0o600));chmodSync(filename,0o600);
 }
 const db=new DatabaseSync(filename);
 db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL;
 CREATE TABLE IF NOT EXISTS workspaces(owner_uid TEXT PRIMARY KEY, document TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS operations(owner_uid TEXT NOT NULL, operation_id TEXT NOT NULL, digest TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(owner_uid,operation_id));
 CREATE TABLE IF NOT EXISTS source_matches(owner_uid TEXT NOT NULL, source_key TEXT NOT NULL, student_id TEXT NOT NULL, PRIMARY KEY(owner_uid,source_key));
 CREATE TABLE IF NOT EXISTS teacher_sources(owner_uid TEXT NOT NULL, source_key TEXT NOT NULL, teacher_id TEXT NOT NULL, PRIMARY KEY(owner_uid,source_key));
 CREATE TABLE IF NOT EXISTS teacher_receipts(owner_uid TEXT NOT NULL, file_hash TEXT NOT NULL, identities TEXT NOT NULL, PRIMARY KEY(owner_uid,file_hash));
 CREATE TABLE IF NOT EXISTS import_receipts(owner_uid TEXT NOT NULL, file_hash TEXT NOT NULL, identities TEXT NOT NULL, PRIMARY KEY(owner_uid,file_hash));`);
 const read=uid=>{actor(uid);const row=db.prepare('SELECT document FROM workspaces WHERE owner_uid=?').get(uid);const state=row?JSON.parse(row.document):empty();state.teachers ||= [];return state;};
 function importPlan(uid,payload,state=read(uid)){
  actor(uid);return buildStudentImportPlan({state,payload,
   lookupSource:key=>db.prepare('SELECT student_id FROM source_matches WHERE owner_uid=? AND source_key=?').get(uid,key)?.student_id,
   lookupReceipt:key=>{const row=db.prepare('SELECT identities FROM import_receipts WHERE owner_uid=? AND file_hash=?').get(uid,key);return row?JSON.parse(row.identities):null;}
  });
 }
 function teacherPlan(uid,payload,state=read(uid)){
  actor(uid);return buildTeacherImportPlan({state,payload,lookupSource:key=>db.prepare('SELECT teacher_id FROM teacher_sources WHERE owner_uid=? AND source_key=?').get(uid,key)?.teacher_id,lookupReceipt:key=>{const r=db.prepare('SELECT identities FROM teacher_receipts WHERE owner_uid=? AND file_hash=?').get(uid,key);return r?JSON.parse(r.identities):null;}});
 }
 function mutate(uid,request,inTransaction=false){
  actor(uid);keys(request,['command','payload','expectedRevision','operationId']);
  const {command,payload,expectedRevision,operationId}=request;
  if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0||typeof operationId!=='string'||!/^[a-zA-Z0-9_-]{16,100}$/.test(operationId))fail('invalid-argument');
  if(!['createClass','updateClass','createStudent','updateStudent','importStudents','importTeachers'].includes(command))fail('invalid-argument');
  const digest=createHash('sha256').update(JSON.stringify(request)).digest('hex');
  if(!inTransaction)db.exec('BEGIN IMMEDIATE');
  try{
   const previous=db.prepare('SELECT digest FROM operations WHERE owner_uid=? AND operation_id=?').get(uid,operationId);
   if(previous){if(previous.digest!==digest)fail('operation-conflict',409);const state=read(uid);if(!inTransaction)db.exec('COMMIT');return state;}
   const state=read(uid);if(state.revision!==expectedRevision)fail('revision-conflict',409);
   let changed=true;
   if(command==='importTeachers'){
    keys(payload,['schoolYear','sourceNamespace','rows','decisions','previewHash']);
    const {previewHash,...input}=payload,plan=teacherPlan(uid,input,state);
    if(previewHash!==plan.view.planHash)fail('preview-mismatch',409);
    if(plan.view.counts.review)fail('import-unresolved',409);
    changed=Boolean(plan.view.counts.newTeachers||plan.view.counts.updated);
    const identities=[];
    for(const action of plan.actions){
     if(action.action==='skip')continue;
     let teacher=state.teachers.find(t=>t.id===action.teacherId);
     if(!teacher){teacher={id:randomUUID(),createdAt:new Date().toISOString(),assignments:[]};state.teachers.push(teacher);}
     const assignments=(teacher.assignments||[]).filter(a=>state.classes.find(c=>c.id===a.classId)?.schoolYear!==action.schoolYear);
     for(const pair of action.assignments){
      let c=state.classes.find(c=>c.schoolYear===pair.schoolYear&&c.name.normalize('NFC').toLocaleLowerCase('de')===pair.className.normalize('NFC').toLocaleLowerCase('de'));
      if(!c){c={id:randomUUID(),name:pair.className,schoolYear:pair.schoolYear,createdAt:new Date().toISOString()};state.classes.push(c);}
      assignments.push({classId:c.id,subject:pair.subject});
     }
     Object.assign(teacher,{firstName:action.firstName,lastName:action.lastName,shortCode:action.shortCode,assignments});
     if(action.sourceKey)db.prepare('INSERT INTO teacher_sources(owner_uid,source_key,teacher_id) VALUES(?,?,?) ON CONFLICT(owner_uid,source_key) DO UPDATE SET teacher_id=excluded.teacher_id').run(uid,action.sourceKey,teacher.id);
     identities.push({line:action.line,teacherId:teacher.id});
    }
    db.prepare('INSERT INTO teacher_receipts(owner_uid,file_hash,identities) VALUES(?,?,?) ON CONFLICT(owner_uid,file_hash) DO UPDATE SET identities=excluded.identities').run(uid,plan.fileHash,JSON.stringify(identities));
   }else if(command==='importStudents'){
    keys(payload,['schoolYear','sourceNamespace','rows','decisions','previewHash','fixedClassId']);
    const {previewHash,...input}=payload,plan=importPlan(uid,input,state);
    if(previewHash!==plan.view.planHash)fail('preview-mismatch',409);
    if(plan.view.counts.review)fail('import-unresolved',409);
    changed=Boolean(plan.view.counts.newStudents||plan.view.counts.updated);
    const identities=[];
    for(const action of plan.actions){
     if(action.action==='skip')continue;
     let c=state.classes.find(c=>c.schoolYear===action.schoolYear&&c.name.normalize('NFC').toLocaleLowerCase('de')===action.className.normalize('NFC').toLocaleLowerCase('de'));
     if(!c){c={id:randomUUID(),name:action.className,schoolYear:action.schoolYear,createdAt:new Date().toISOString()};state.classes.push(c);}
     let student=state.students.find(s=>s.id===action.studentId);
     if(!student){student={id:randomUUID(),createdAt:new Date().toISOString()};state.students.push(student);}
     Object.assign(student,{firstName:action.firstName,lastName:action.lastName,classId:c.id});
     if(action.sourceKey)db.prepare('INSERT INTO source_matches(owner_uid,source_key,student_id) VALUES(?,?,?) ON CONFLICT(owner_uid,source_key) DO UPDATE SET student_id=excluded.student_id').run(uid,action.sourceKey,student.id);
     identities.push({line:action.line,studentId:student.id});
    }
    db.prepare('INSERT INTO import_receipts(owner_uid,file_hash,identities) VALUES(?,?,?) ON CONFLICT(owner_uid,file_hash) DO UPDATE SET identities=excluded.identities').run(uid,plan.fileHash,JSON.stringify(identities));
   }else if(command==='createClass'||command==='updateClass'){
    keys(payload,command==='createClass'?['name','schoolYear']:['id','name','schoolYear']);
    const name=text(payload.name,40),schoolYear=year(payload.schoolYear);
    let item=command==='updateClass'?state.classes.find(c=>c.id===payload.id):null;
    if(command==='updateClass'&&!item)fail('not-found',404);
    if(state.classes.some(c=>c.id!==item?.id&&c.schoolYear===schoolYear&&c.name.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de')===name.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de')))fail('already-exists',409);
    if(item)Object.assign(item,{name,schoolYear});
    else{if(state.classes.length>=200)fail('resource-exhausted',429);state.classes.push({id:randomUUID(),name,schoolYear,createdAt:new Date().toISOString()});}
   }else{
    keys(payload,command==='createStudent'?['firstName','lastName','classId']:['id','firstName','lastName','classId']);
    const firstName=text(payload.firstName),lastName=text(payload.lastName),classId=payload.classId??null;
    if(classId!==null&&(typeof classId!=='string'||!state.classes.some(c=>c.id===classId)))fail('not-found',404);
    const item=command==='updateStudent'?state.students.find(s=>s.id===payload.id):null;
    if(command==='updateStudent'&&!item)fail('not-found',404);
    if(item)Object.assign(item,{firstName,lastName,classId});
    else{if(state.students.length>=5000)fail('resource-exhausted',429);state.students.push({id:randomUUID(),firstName,lastName,classId,createdAt:new Date().toISOString()});}
   }
   if(changed)state.revision++;
   db.prepare('INSERT INTO workspaces(owner_uid,document) VALUES(?,?) ON CONFLICT(owner_uid) DO UPDATE SET document=excluded.document').run(uid,JSON.stringify(state));
   db.prepare('INSERT INTO operations(owner_uid,operation_id,digest,created_at) VALUES(?,?,?,?)').run(uid,operationId,digest,Date.now());
   db.prepare('DELETE FROM operations WHERE owner_uid=? AND created_at<?').run(uid,Date.now()-7*86400000);
   if(!inTransaction)db.exec('COMMIT');return state;
  }catch(error){if(!inTransaction)db.exec('ROLLBACK');throw error;}
 }
 const school=createLocalSchoolStore({db,readRaw:read,mutateRaw:mutate,previewImportRaw:(uid,payload)=>importPlan(uid,payload).view,previewTeacherRaw:(uid,payload)=>teacherPlan(uid,payload).view,authProjectId});
 const access=createLocalStudentAccess({db,school,filename,now});
 return {school,access,read:school.rosterRead,mutate:school.rosterMutate,previewImport:school.previewImport,previewTeacherImport:school.previewTeacherImport,close:()=>db.close()};
}
