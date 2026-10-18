import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,openSync,closeSync,chmodSync} from 'node:fs';
import {dirname} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';

export class RosterError extends Error {
 constructor(code,status=400){super(code);this.code=code;this.status=status;}
}
const fail=(code,status)=>{throw new RosterError(code,status);};
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
function keys(value,allowed){if(!object(value)||Object.keys(value).some(k=>!allowed.includes(k)))fail('invalid-argument');}
function text(value,max=100){
 if(typeof value!=='string'||/[\p{Cc}\p{Cf}]/u.test(value))fail('invalid-argument');
 const result=value.trim();if(!result||result.length>max)fail('invalid-argument');return result;
}
function year(value){const result=text(value,7);if(!/^\d{4}\/\d{2}$/.test(result)||Number(result.slice(-2))!==(Number(result.slice(0,4))+1)%100)fail('invalid-argument');return result;}
function actor(uid){if(typeof uid!=='string'||!uid||uid.length>128)fail('unauthenticated',401);return uid;}
const empty=()=>({schemaVersion:1,revision:0,classes:[],students:[],storage:'local-device'});

// Device-local first slice. No school authority, cloud migration or shared grants
// are inferred from this account-owned workspace.
export function openLocalRoster(filename){
 if(filename!==':memory:'){
  mkdirSync(dirname(filename),{recursive:true,mode:0o700});
  closeSync(openSync(filename,'a',0o600));chmodSync(filename,0o600);
 }
 const db=new DatabaseSync(filename);
 db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL;
 CREATE TABLE IF NOT EXISTS workspaces(owner_uid TEXT PRIMARY KEY, document TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS operations(owner_uid TEXT NOT NULL, operation_id TEXT NOT NULL, digest TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(owner_uid,operation_id));`);
 const read=uid=>{actor(uid);const row=db.prepare('SELECT document FROM workspaces WHERE owner_uid=?').get(uid);return row?JSON.parse(row.document):empty();};
 function mutate(uid,request){
  actor(uid);keys(request,['command','payload','expectedRevision','operationId']);
  const {command,payload,expectedRevision,operationId}=request;
  if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0||typeof operationId!=='string'||!/^[a-zA-Z0-9_-]{16,100}$/.test(operationId))fail('invalid-argument');
  if(!['createClass','updateClass','createStudent','updateStudent'].includes(command))fail('invalid-argument');
  const digest=createHash('sha256').update(JSON.stringify(request)).digest('hex');
  db.exec('BEGIN IMMEDIATE');
  try{
   const previous=db.prepare('SELECT digest FROM operations WHERE owner_uid=? AND operation_id=?').get(uid,operationId);
   if(previous){if(previous.digest!==digest)fail('operation-conflict',409);const state=read(uid);db.exec('COMMIT');return state;}
   const state=read(uid);if(state.revision!==expectedRevision)fail('revision-conflict',409);
   if(command==='createClass'||command==='updateClass'){
    keys(payload,command==='createClass'?['name','schoolYear']:['id','name','schoolYear']);
    const name=text(payload.name,40),schoolYear=year(payload.schoolYear);
    let item=command==='updateClass'?state.classes.find(c=>c.id===payload.id):null;
    if(command==='updateClass'&&!item)fail('not-found',404);
    if(state.classes.some(c=>c.id!==item?.id&&c.schoolYear===schoolYear&&c.name.toLocaleLowerCase('de')===name.toLocaleLowerCase('de')))fail('already-exists',409);
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
   state.revision++;
   db.prepare('INSERT INTO workspaces(owner_uid,document) VALUES(?,?) ON CONFLICT(owner_uid) DO UPDATE SET document=excluded.document').run(uid,JSON.stringify(state));
   db.prepare('INSERT INTO operations(owner_uid,operation_id,digest,created_at) VALUES(?,?,?,?)').run(uid,operationId,digest,Date.now());
   db.prepare('DELETE FROM operations WHERE owner_uid=? AND created_at<?').run(uid,Date.now()-7*86400000);
   db.exec('COMMIT');return state;
  }catch(error){db.exec('ROLLBACK');throw error;}
 }
 return {read,mutate,close:()=>db.close()};
}
