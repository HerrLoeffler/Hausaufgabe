// Local school authority. It never grants Firebase roles or accesses quiz data.
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {fail,keys,text,actor as validateUid} from './local-roster-validation.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const schoolKey=id=>'\0school:'+id;
const copyTables=['source_matches','teacher_sources','teacher_receipts','import_receipts'];
export function createLocalSchoolStore({db,readRaw,mutateRaw,previewImportRaw,previewTeacherRaw,authProjectId}){
 db.exec(`CREATE TABLE IF NOT EXISTS local_schools(id TEXT PRIMARY KEY,name TEXT NOT NULL,project_id TEXT NOT NULL,revision INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS local_school_members(id TEXT PRIMARY KEY,school_id TEXT NOT NULL,actor_key TEXT NOT NULL,name TEXT NOT NULL,account_label TEXT NOT NULL,role TEXT NOT NULL,status TEXT NOT NULL,class_ids TEXT NOT NULL,UNIQUE(school_id,actor_key));
 CREATE TABLE IF NOT EXISTS local_school_preferences(actor_key TEXT PRIMARY KEY,school_id TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS local_school_migrations(actor_key TEXT PRIMARY KEY,school_id TEXT NOT NULL,snapshot TEXT NOT NULL,created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS local_school_invitations(id TEXT PRIMARY KEY,school_id TEXT NOT NULL,name TEXT NOT NULL,role TEXT NOT NULL,secret_hash TEXT NOT NULL UNIQUE,expires_at INTEGER NOT NULL,status TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS local_school_requests(id TEXT PRIMARY KEY,invitation_id TEXT NOT NULL UNIQUE,school_id TEXT NOT NULL,actor_key TEXT NOT NULL,name TEXT NOT NULL,account_label TEXT NOT NULL,status TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS local_school_operations(actor_key TEXT NOT NULL,operation_id TEXT NOT NULL,digest TEXT NOT NULL,result TEXT NOT NULL,PRIMARY KEY(actor_key,operation_id));
 CREATE TABLE IF NOT EXISTS local_school_audit(id TEXT PRIMARY KEY,school_id TEXT NOT NULL,actor_key TEXT NOT NULL,action TEXT NOT NULL,target_id TEXT,created_at INTEGER NOT NULL);`);
 const run=(sql,...args)=>db.prepare(sql).run(...args),get=(sql,...args)=>db.prepare(sql).get(...args),all=(sql,...args)=>db.prepare(sql).all(...args);
 function actor(input){
  const value=typeof input==='string'?{uid:input}:input;
  validateUid(value?.uid);if(/[\p{Cc}\p{Cf}]/u.test(value.uid)||(value.authProjectId&&value.authProjectId!==authProjectId))fail('permission-denied',403);
  return {...value,key:JSON.stringify([authProjectId,value.uid])};
 }
 function selected(a){return get('SELECT school_id FROM local_school_preferences WHERE actor_key=?',a.key)?.school_id||null;}
 function membership(a,id=selected(a)){
  const m=get("SELECT * FROM local_school_members WHERE actor_key=? AND school_id=? AND status='active'",a.key,id);
  if(!m)fail('permission-denied',403);return m;
 }
 function school(id){const s=get('SELECT * FROM local_schools WHERE id=? AND project_id=?',id,authProjectId);if(!s)fail('permission-denied',403);return s;}
 function admin(a,id){const m=membership(a,id);if(m.role!=='admin')fail('permission-denied',403);return m;}
 function transaction(fn){db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}
 function audit(a,id,action,target=null){run('INSERT INTO local_school_audit VALUES(?,?,?,?,?,?)',randomUUID(),id,a.key,action,target,Date.now());}
 function read(input){
  const a=actor(input),id=selected(a),m=id?membership(a,id):null,s=id?school(id):null;
  const schools=all("SELECT s.id,s.name,m.role FROM local_schools s JOIN local_school_members m ON s.id=m.school_id WHERE m.actor_key=? AND m.status='active' AND s.project_id=?",a.key,authProjectId);
  const result={revision:s?.revision??readRaw(a.uid).revision,currentSchool:s?{id:s.id,name:s.name,localOnly:true,role:m.role}:null,schools,members:[],requests:[],invitations:[],classChoices:[],selectedClassIds:m?JSON.parse(m.class_ids):[],pending:all("SELECT r.id,s.name AS schoolName FROM local_school_requests r JOIN local_schools s ON s.id=r.school_id WHERE r.actor_key=? AND r.status='pending'",a.key)};
  if(!s)return result;
  result.classChoices=readRaw(schoolKey(id)).classes.map(c=>({id:c.id,name:c.name,schoolYear:c.schoolYear}));
  if(m.role==='admin'){
   result.members=all("SELECT id,name AS displayName,account_label AS accountLabel,role,actor_key FROM local_school_members WHERE school_id=? AND status='active'",id).map(({actor_key,...row})=>({...row,isSelf:actor_key===a.key}));
   result.requests=all("SELECT r.id,r.name AS displayName,r.account_label AS accountLabel,i.role,i.name AS invitedName FROM local_school_requests r JOIN local_school_invitations i ON i.id=r.invitation_id WHERE r.school_id=? AND r.status='pending' AND i.status='claimed' AND i.expires_at>?",id,Date.now());
   result.invitations=all("SELECT id,name,role,expires_at AS expiresAt,status FROM local_school_invitations WHERE school_id=? AND status IN ('open','claimed') AND expires_at>?",id,Date.now());
  }
  return result;
 }
 function previewSetup(input,payload){
  const a=actor(input);keys(payload,['name','displayName']);const name=text(payload.name,140),displayName=text(payload.displayName);
  if(get('SELECT school_id FROM local_school_migrations WHERE actor_key=?',a.key))fail('workspace-migrated',409);
  const state=readRaw(a.uid),counts={classes:state.classes.length,students:state.students.length,teachers:state.teachers.length};
  return {revision:state.revision,name,displayName,counts,planHash:hash({actor:a.key,name,displayName,state}),localOnly:true};
 }
 function command(input,request){
  const a=actor(input);keys(request,['command','payload','expectedRevision','operationId','contextId']);
  const {command,payload,expectedRevision,operationId}=request;
  if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0||typeof operationId!=='string'||!/^[a-zA-Z0-9_-]{16,100}$/.test(operationId))fail('invalid-argument');
  const digest=hash(request);
  return transaction(()=>{
   const previous=get('SELECT * FROM local_school_operations WHERE actor_key=? AND operation_id=?',a.key,operationId);
   if(previous){if(previous.digest!==digest)fail('operation-conflict',409);return read(a);}
   let id=selected(a),s=id?school(id):null,resultExtra={};
   if(request.contextId!==undefined&&request.contextId!==(id||null))fail('context-mismatch',409);
   if(command==='createSchool'){
    keys(payload,['name','displayName','previewHash']);
    const p=previewSetup(a,{name:payload.name,displayName:payload.displayName});
    if(p.revision!==expectedRevision)fail('revision-conflict',409);
    if(p.planHash!==payload.previewHash)fail('preview-mismatch',409);
    const state=readRaw(a.uid);id=randomUUID();
    // Copy the source evidence AND a recovery snapshot in the same transaction.
    const sources=Object.fromEntries(copyTables.map(table=>[table,all(`SELECT * FROM ${table} WHERE owner_uid=?`,a.uid)]));
    run('INSERT INTO local_school_migrations VALUES(?,?,?,?)',a.key,id,JSON.stringify({state,sources}),Date.now());
    run('INSERT INTO local_schools VALUES(?,?,?,?)',id,p.name,authProjectId,1);
    run('INSERT INTO local_school_members VALUES(?,?,?,?,?,?,?,?)',randomUUID(),id,a.key,p.displayName,a.email||a.displayName||p.displayName,'admin','active','[]');
    state.revision++;run('INSERT INTO workspaces VALUES(?,?)',schoolKey(id),JSON.stringify(state));
    for(const table of copyTables)for(const row of sources[table]){
     const columns=Object.keys(row),values=columns.map(k=>k==='owner_uid'?schoolKey(id):row[k]);
     run(`INSERT INTO ${table}(${columns.join(',')}) VALUES(${columns.map(()=>'?').join(',')})`,...values);
    }
    run('INSERT INTO local_school_preferences VALUES(?,?) ON CONFLICT(actor_key) DO UPDATE SET school_id=excluded.school_id',a.key,id);audit(a,id,'createSchool');
   }else if(command==='claimInvitation'){
    keys(payload,['secret','displayName']);const secret=text(payload.secret,100),displayName=text(payload.displayName);
    if(!/^[A-Za-z0-9_-]{43}$/.test(secret))fail('invitation-invalid',409);
    const invite=get("SELECT * FROM local_school_invitations WHERE secret_hash=? AND status='open' AND expires_at>?",hash(secret),Date.now());
    if(!invite)fail('invitation-invalid',409);
    if(get("SELECT id FROM local_school_members WHERE actor_key=? AND school_id=? AND status='active'",a.key,invite.school_id))fail('already-member',409);
    run('UPDATE local_school_invitations SET status=? WHERE id=?','claimed',invite.id);
    run('INSERT INTO local_school_requests VALUES(?,?,?,?,?,?,?)',randomUUID(),invite.id,invite.school_id,a.key,displayName,a.email||a.displayName||displayName,'pending');
    run('UPDATE local_schools SET revision=revision+1 WHERE id=?',invite.school_id);audit(a,invite.school_id,'claimInvitation',invite.id);
   }else if(command==='selectSchool'){
    keys(payload,['schoolId']);if(payload.schoolId===null){
     if(get('SELECT school_id FROM local_school_migrations WHERE actor_key=?',a.key))fail('workspace-migrated',409);
     run('DELETE FROM local_school_preferences WHERE actor_key=?',a.key);
    }else{membership(a,payload.schoolId);school(payload.schoolId);run('INSERT INTO local_school_preferences VALUES(?,?) ON CONFLICT(actor_key) DO UPDATE SET school_id=excluded.school_id',a.key,payload.schoolId);}
   }else{
    if(!id)fail('permission-denied',403);
    if(s.revision!==expectedRevision)fail('revision-conflict',409);
    const m=membership(a,id);
    if(command==='selectClasses'){
     keys(payload,['classIds']);if(!Array.isArray(payload.classIds)||payload.classIds.length>200||new Set(payload.classIds).size!==payload.classIds.length)fail('invalid-argument');
     const available=readRaw(schoolKey(id)).classes;
     if(payload.classIds.some(classId=>!available.some(c=>c.id===classId)))fail('not-found',404);
     run('UPDATE local_school_members SET class_ids=? WHERE id=?',JSON.stringify(payload.classIds),m.id);
    }else{
     admin(a,id);
     if(command==='invite'){
      keys(payload,['name','role']);const name=text(payload.name);if(!['admin','teacher'].includes(payload.role))fail('invalid-argument');
      if(all('SELECT id FROM local_school_invitations WHERE school_id=? AND expires_at>?',id,Date.now()).length>=100)fail('resource-exhausted',429);
      const secret=randomBytes(32).toString('base64url'),inviteId=randomUUID(),expiresAt=Date.now()+86400000;
      run('INSERT INTO local_school_invitations VALUES(?,?,?,?,?,?,?)',inviteId,id,name,payload.role,hash(secret),expiresAt,'open');resultExtra={invitation:{id:inviteId,secret,expiresAt}};
     }else if(command==='approveRequest'){
      keys(payload,['requestId']);const r=get("SELECT r.*,i.role,i.status AS invite_status,i.expires_at FROM local_school_requests r JOIN local_school_invitations i ON i.id=r.invitation_id WHERE r.id=? AND r.school_id=? AND r.status='pending'",payload.requestId,id);
      if(!r||r.invite_status!=='claimed'||r.expires_at<=Date.now())fail('invitation-invalid',409);
      if(get("SELECT id FROM local_school_members WHERE actor_key=? AND school_id=? AND status='active'",r.actor_key,id))fail('already-member',409);
      const existing=get('SELECT id FROM local_school_members WHERE actor_key=? AND school_id=?',r.actor_key,id);
      if(existing)run("UPDATE local_school_members SET name=?,account_label=?,role=?,status='active',class_ids='[]' WHERE id=?",r.name,r.account_label,r.role,existing.id);
      else run('INSERT INTO local_school_members VALUES(?,?,?,?,?,?,?,?)',randomUUID(),id,r.actor_key,r.name,r.account_label,r.role,'active','[]');
      run("UPDATE local_school_requests SET status='approved' WHERE id=?",r.id);run("UPDATE local_school_invitations SET status='used' WHERE id=?",r.invitation_id);
      // Existing school context remains intact for accounts employed at two schools.
      run('INSERT OR IGNORE INTO local_school_preferences VALUES(?,?)',r.actor_key,id);
     }else if(command==='revokeInvitation'){
      keys(payload,['invitationId']);if(!get('SELECT id FROM local_school_invitations WHERE id=? AND school_id=?',payload.invitationId,id))fail('not-found',404);
      run("UPDATE local_school_invitations SET status='revoked' WHERE id=?",payload.invitationId);run("UPDATE local_school_requests SET status='rejected' WHERE invitation_id=?",payload.invitationId);
     }else if(['changeRole','removeMember'].includes(command)){
      keys(payload,command==='changeRole'?['memberId','role']:['memberId']);const target=get("SELECT * FROM local_school_members WHERE id=? AND school_id=? AND status='active'",payload.memberId,id);
      if(!target)fail('not-found',404);if(command==='changeRole'&&!['admin','teacher'].includes(payload.role))fail('invalid-argument');
      if(target.role==='admin'&&(command==='removeMember'||payload.role!=='admin')&&get("SELECT COUNT(*) AS n FROM local_school_members WHERE school_id=? AND role='admin' AND status='active'",id).n<=1)fail('last-admin',409);
      if(command==='changeRole')run('UPDATE local_school_members SET role=? WHERE id=?',payload.role,target.id);
      else{run("UPDATE local_school_members SET status='left',class_ids='[]' WHERE id=?",target.id);run('DELETE FROM local_school_preferences WHERE actor_key=? AND school_id=?',target.actor_key,id);}
     }else fail('invalid-argument');
    }
    run('UPDATE local_schools SET revision=revision+1 WHERE id=?',id);audit(a,id,command,payload.memberId||payload.requestId||payload.invitationId||null);
   }
   // Secrets are returned once, never stored in operation receipts or audit.
   run('INSERT INTO local_school_operations VALUES(?,?,?,?)',a.key,operationId,digest,'{}');
   return {...read(a),...resultExtra};
  });
 }
 function scope(input,contextId,write,fn,{allowTeacher=false}={}){
  const a=actor(input),id=selected(a);
  const perform=()=>{
   if(!id){if(get('SELECT school_id FROM local_school_migrations WHERE actor_key=?',a.key))fail('workspace-migrated',409);if(contextId)fail('context-mismatch',409);return fn(a.uid,null);}
   const m=membership(a,id);school(id);
   if((write||contextId!==undefined)&&contextId!==id)fail('context-mismatch',409);
   if(write&&m.role!=='admin'&&!allowTeacher)fail('permission-denied',403);
   return fn(schoolKey(id),m);
  };
  return write?transaction(perform):perform();
 }
 function rosterRead(input){return scope(input,undefined,false,(key,m)=>{
  const state=readRaw(key);if(!m)return state;
  const result={...state,contextId:m.school_id,canManageRoster:m.role==='admin',canCreateClass:true,canAddStudents:m.role==='admin'||JSON.parse(m.class_ids).length>0,schoolName:school(m.school_id).name};
  if(m.role!=='admin'){
   const ids=new Set(JSON.parse(m.class_ids));result.classes=state.classes.filter(c=>ids.has(c.id));result.students=state.students.filter(s=>ids.has(s.classId));
   result.teachers=state.teachers.map(t=>({...t,assignments:(t.assignments||[]).filter(pair=>ids.has(pair.classId))})).filter(t=>t.assignments.length);
  }
  return result;
 });}
 return {read,previewSetup,command,rosterRead,
  rosterMutate:(input,request)=>scope(input,request.contextId,true,(key,m)=>{
   const before=readRaw(key);
   if(m&&m.role!=='admin'){
    if(!['createClass','createStudent'].includes(request.command))fail('permission-denied',403);
    if(request.command==='createStudent'&&!JSON.parse(m.class_ids).includes(request.payload?.classId))fail('permission-denied',403);
   }
   const {contextId,...body}=request;const next=mutateRaw(key,body,true);
   if(m&&request.command==='createClass'){
    const added=next.classes.filter(c=>!before.classes.some(old=>old.id===c.id));
    if(added.length){run('UPDATE local_school_members SET class_ids=? WHERE id=?',JSON.stringify([...new Set([...JSON.parse(m.class_ids),...added.map(c=>c.id)])]),m.id);run('UPDATE local_schools SET revision=revision+1 WHERE id=?',m.school_id);}
   }
   return rosterRead(input);
  },{allowTeacher:true}),
  withStudents:(input,contextId,studentIds,fn)=>scope(input,contextId,true,(key,m)=>{
   if(!m)fail('school-required',409);
   if(!Array.isArray(studentIds)||!studentIds.length||studentIds.length>5000||new Set(studentIds).size!==studentIds.length||studentIds.some(id=>typeof id!=='string'))fail('invalid-argument');
   const state=readRaw(key),selected=new Set(JSON.parse(m.class_ids));
   const students=studentIds.map(id=>{const row=state.students.find(s=>s.id===id);if(!row||(m.role!=='admin'&&!selected.has(row.classId)))fail('permission-denied',403);return row;});
   return fn({state,students,schoolId:m.school_id,actorKey:actor(input).key});
  },{allowTeacher:true}),
  studentRecord:(schoolId,studentId)=>{const s=school(schoolId),state=readRaw(schoolKey(schoolId)),student=state.students.find(p=>p.id===studentId);if(!student)fail('unauthenticated',401);return {student:{id:student.id,firstName:student.firstName,lastName:student.lastName,className:state.classes.find(c=>c.id===student.classId)?.name||'Ohne Klasse'},school:{id:s.id,name:s.name}};},
  previewImport:(input,payload,contextId)=>scope(input,contextId,true,key=>previewImportRaw(key,payload)),
  previewTeacherImport:(input,payload,contextId)=>scope(input,contextId,true,key=>previewTeacherRaw(key,payload))};
}
