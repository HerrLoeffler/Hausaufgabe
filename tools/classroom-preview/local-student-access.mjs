import {randomBytes,randomUUID,createHash,createHmac,createCipheriv,createDecipheriv} from 'node:crypto';
import {readFileSync,writeFileSync,lstatSync} from 'node:fs';
import {fail,keys} from './local-roster-validation.mjs';
const alphabet='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const normalizeCode=value=>typeof value==='string'?value.toUpperCase().replace(/[\s-]/g,''):'';
export function createLocalStudentAccess({db,school,filename,now=Date.now}){
 db.exec(`CREATE TABLE IF NOT EXISTS pupil_access(school_id TEXT NOT NULL,student_id TEXT NOT NULL,digest TEXT NOT NULL UNIQUE,cipher TEXT NOT NULL,key_id TEXT NOT NULL,version INTEGER NOT NULL,status TEXT NOT NULL,PRIMARY KEY(school_id,student_id));
 CREATE TABLE IF NOT EXISTS pupil_retired_codes(digest TEXT PRIMARY KEY);
 CREATE TABLE IF NOT EXISTS pupil_sessions(digest TEXT PRIMARY KEY,school_id TEXT NOT NULL,student_id TEXT NOT NULL,version INTEGER NOT NULL,expires_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS pupil_rate(key TEXT PRIMARY KEY,window_start INTEGER NOT NULL,attempts INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS pupil_access_ops(actor_key TEXT NOT NULL,operation_id TEXT NOT NULL,digest TEXT NOT NULL,PRIMARY KEY(actor_key,operation_id));`);
 const get=(sql,...args)=>db.prepare(sql).get(...args),run=(sql,...args)=>db.prepare(sql).run(...args);
 let memoryKey=filename===':memory:'?randomBytes(64):null;
 function key(){
  let value=memoryKey;
  if(!value){
   try{const stat=lstatSync(filename+'.student-key');if(!stat.isFile()||(stat.mode&0o077))fail('key-unavailable',503);value=readFileSync(filename+'.student-key');}
   catch(e){if(e.code!=='ENOENT')fail('key-unavailable',503);if(get('SELECT COUNT(*) AS n FROM pupil_access').n)fail('key-unavailable',503);
    try{writeFileSync(filename+'.student-key',randomBytes(64),{flag:'wx',mode:0o600});value=readFileSync(filename+'.student-key');}catch{fail('key-unavailable',503);}}
  }
  if(value.length!==64)fail('key-unavailable',503);
  const id=createHash('sha256').update(value).digest('hex');
  if(get('SELECT key_id FROM pupil_access WHERE key_id<>? LIMIT 1',id))fail('key-unavailable',503);
  return {lookup:value.subarray(0,32),encryption:value.subarray(32),id};
 }
 const digest=(value,k=key())=>createHmac('sha256',k.lookup).update(value).digest('hex');
 const aad=row=>Buffer.from(JSON.stringify([row.school_id,row.student_id,row.version]));
 function encrypt(code,row,k){const nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',k.encryption,nonce);cipher.setAAD(aad(row));const data=Buffer.concat([cipher.update(code,'utf8'),cipher.final()]);return Buffer.concat([nonce,cipher.getAuthTag(),data]).toString('base64');}
 function decrypt(row){const k=key();try{const data=Buffer.from(row.cipher,'base64'),dec=createDecipheriv('aes-256-gcm',k.encryption,data.subarray(0,12));dec.setAAD(aad(row));dec.setAuthTag(data.subarray(12,28));return Buffer.concat([dec.update(data.subarray(28)),dec.final()]).toString('utf8');}catch{fail('key-unavailable',503);}}
 function credential(schoolId,studentId,version){
  const k=key();let code,lookup;
  for(let tries=0;tries<20;tries++){
   code=[...randomBytes(8)].map(b=>alphabet[b&31]).join('');lookup=digest(code,k);
   if(!get('SELECT digest FROM pupil_access WHERE digest=?',lookup)&&!get('SELECT digest FROM pupil_retired_codes WHERE digest=?',lookup))break;
   if(tries===19)fail('resource-exhausted',503);
  }
  const row={school_id:schoolId,student_id:studentId,version};
  return {code,digest:lookup,cipher:encrypt(code,row,k),keyId:k.id};
 }
 function checkPayload(payload,extra=[]){keys(payload,['contextId','studentIds','expectedRevision','operationId',...extra]);if(!Number.isSafeInteger(payload.expectedRevision)||payload.expectedRevision<0)fail('invalid-argument');}
 function scoped(actor,payload,fn){return school.withStudents(actor,payload.contextId,payload.studentIds,scope=>{if(scope.state.revision!==payload.expectedRevision)fail('revision-conflict',409);return fn(scope);});}
 function rows(scope,includeCodes=false){return scope.students.map(s=>{
  const access=get('SELECT * FROM pupil_access WHERE school_id=? AND student_id=?',scope.schoolId,s.id);
  const result={studentId:s.id,firstName:s.firstName,lastName:s.lastName,className:scope.state.classes.find(c=>c.id===s.classId)?.name||'Ohne Klasse',status:access?.status||'missing',version:access?.version||0};
  if(includeCodes){if(!access||access.status!=='active')fail('access-missing',409);result.code=decrypt(access);}
  return result;
 });}
 function status(scope){const list=rows(scope);return {revision:scope.state.revision,contextId:scope.schoolId,rows:list,counts:{missing:list.filter(x=>x.status==='missing').length,active:list.filter(x=>x.status==='active').length,blocked:list.filter(x=>x.status==='blocked').length}};}
 function operation(actor,payload,command,fn){
  checkPayload(payload,command==='issue'?[]:['expectedVersion']);
  if(typeof payload.operationId!=='string'||!/^[a-zA-Z0-9_-]{16,100}$/.test(payload.operationId))fail('invalid-argument');
  return scoped(actor,payload,scope=>{
   const fingerprint=createHash('sha256').update(JSON.stringify({command,payload})).digest('hex'),previous=get('SELECT digest FROM pupil_access_ops WHERE actor_key=? AND operation_id=?',scope.actorKey,payload.operationId);
   if(previous){if(previous.digest!==fingerprint)fail('operation-conflict',409);return status(scope);}
   key();fn(scope);run('INSERT INTO pupil_access_ops VALUES(?,?,?)',scope.actorKey,payload.operationId,fingerprint);
   run('INSERT INTO local_school_audit VALUES(?,?,?,?,?,?)',randomUUID(),scope.schoolId,scope.actorKey,'student-access:'+command,null,now());return status(scope);
  });
 }
 function issue(actor,payload){return operation(actor,payload,'issue',scope=>{for(const s of scope.students){
  if(get('SELECT student_id FROM pupil_access WHERE school_id=? AND student_id=?',scope.schoolId,s.id))continue;
  const value=credential(scope.schoolId,s.id,1);run('INSERT INTO pupil_access VALUES(?,?,?,?,?,?,?)',scope.schoolId,s.id,value.digest,value.cipher,value.keyId,1,'active');
 }});}
 function change(actor,payload,command){return operation(actor,payload,command,scope=>{
  if(scope.students.length!==1)fail('invalid-argument');const row=get('SELECT * FROM pupil_access WHERE school_id=? AND student_id=?',scope.schoolId,scope.students[0].id);
  if(!row||row.version!==payload.expectedVersion)fail('access-conflict',409);
  if(command==='block'){run("UPDATE pupil_access SET status='blocked' WHERE school_id=? AND student_id=?",scope.schoolId,row.student_id);}
  else{const next=credential(scope.schoolId,row.student_id,row.version+1);run('INSERT OR IGNORE INTO pupil_retired_codes VALUES(?)',row.digest);run("UPDATE pupil_access SET digest=?,cipher=?,key_id=?,version=?,status='active' WHERE school_id=? AND student_id=?",next.digest,next.cipher,next.keyId,row.version+1,scope.schoolId,row.student_id);}
  run('DELETE FROM pupil_sessions WHERE school_id=? AND student_id=?',scope.schoolId,row.student_id);
 });}
 function print(actor,payload){
  checkPayload(payload,['includeCodes','layout']);if(typeof payload.includeCodes!=='boolean'||!['names','list','cards','single',undefined].includes(payload.layout))fail('invalid-argument');
  return scoped(actor,payload,scope=>{
   const result={revision:scope.state.revision,contextId:scope.schoolId,rows:rows(scope,payload.includeCodes),localOnly:true};
   run('INSERT INTO local_school_audit VALUES(?,?,?,?,?,?)',randomUUID(),scope.schoolId,scope.actorKey,'student-print',null,now());return result;
  });
 }
 function transaction(fn){db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}
 function login(value,device,ip){
  const k=key(),code=normalizeCode(value);if(typeof device!=='string'||device.length>200||typeof ip!=='string'||ip.length>200)fail('invalid-argument');
  const result=transaction(()=>{
   const limits=[['device:'+device,8,60000],['ip:'+ip,1200,600000]];
   for(const [raw,limit,period] of limits){const rate=get('SELECT * FROM pupil_rate WHERE key=?',digest(raw,k));if(rate&&rate.window_start>now()-period&&rate.attempts>=limit)return {error:'rate-limited'};}
   const found=/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/.test(code)?get("SELECT * FROM pupil_access WHERE digest=? AND status='active'",digest(code,k)):null;
   if(!found){for(const [raw,,period] of limits){const rateKey=digest(raw,k);run('INSERT INTO pupil_rate VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END,window_start=CASE WHEN window_start<=? THEN excluded.window_start ELSE window_start END',rateKey,now(),now()-period,now()-period);}run('DELETE FROM pupil_rate WHERE window_start<?',now()-86400000);return {error:'invalid-access'};}
   try{school.studentRecord(found.school_id,found.student_id);}catch{return {error:'invalid-access'};}
   const token=randomBytes(32).toString('base64url');run('DELETE FROM pupil_sessions WHERE expires_at<=?',now());
   // Bound the number of live browser sessions for one pupil.
   run('DELETE FROM pupil_sessions WHERE digest IN (SELECT digest FROM pupil_sessions WHERE school_id=? AND student_id=? ORDER BY expires_at DESC LIMIT -1 OFFSET 4)',found.school_id,found.student_id);
   run('INSERT INTO pupil_sessions VALUES(?,?,?,?,?)',digest('session:'+token,k),found.school_id,found.student_id,found.version,now()+8*3600000);return {token};
  });
  if(result.error)fail(result.error,result.error==='rate-limited'?429:401);return result;
 }
 function me(token){
  if(typeof token!=='string'||!/^[a-zA-Z0-9_-]{43}$/.test(token))fail('unauthenticated',401);
  const row=get("SELECT s.school_id,s.student_id FROM pupil_sessions s JOIN pupil_access a ON a.school_id=s.school_id AND a.student_id=s.student_id WHERE s.digest=? AND s.expires_at>? AND s.version=a.version AND a.status='active'",digest('session:'+token),now());
  if(!row)fail('unauthenticated',401);return {...school.studentRecord(row.school_id,row.student_id),assignments:[],assignmentConnection:'pending',localOnly:true};
 }
 return {statuses:(actor,payload)=>{checkPayload(payload);return scoped(actor,payload,status);},issue,rotate:(actor,payload)=>change(actor,payload,'rotate'),block:(actor,payload)=>change(actor,payload,'block'),print,login,me,logout(token){if(typeof token==='string'&&/^[a-zA-Z0-9_-]{43}$/.test(token))run('DELETE FROM pupil_sessions WHERE digest=?',digest('session:'+token));}};
}
