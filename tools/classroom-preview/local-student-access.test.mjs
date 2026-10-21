import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,rmSync,readFileSync,renameSync,copyFileSync,statSync} from 'node:fs';import path from 'node:path';import {tmpdir} from 'node:os';
import {openLocalRoster} from './local-roster-store.mjs';import {schoolFixture} from './local-school-fixture.mjs';
function pupils(s){schoolFixture(s);let r=s.read('teacher');r=s.mutate('teacher',{command:'createClass',payload:{name:'8b',schoolYear:'2026/27'},expectedRevision:r.revision,operationId:crypto.randomUUID(),contextId:r.contextId});const classId=r.classes[0].id;r=s.mutate('teacher',{command:'createStudent',payload:{firstName:'Mila',lastName:'Muster',classId},expectedRevision:r.revision,operationId:crypto.randomUUID(),contextId:r.contextId});return {contextId:r.contextId,studentIds:[r.students[0].id],expectedRevision:r.revision,operationId:crypto.randomUUID()};}
test('eight-character access persists, reprints unchanged, authenticates only its pupil and survives paired DB/key restore',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'gc-access-')),file=path.join(dir,'data.sqlite');let s=openLocalRoster(file);
 try{
  assert.ok(s.access,'student access service exists');const selection=pupils(s);s.access.issue('teacher',selection);
  const status=s.access.statuses('teacher',selection);assert.equal(status.rows[0].status,'active');assert.equal(status.rows[0].code,undefined);
  const first=s.access.print('teacher',{...selection,layout:'list',includeCodes:true});const code=first.rows[0].code;assert.match(code,/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
  s.access.issue('teacher',{...selection,operationId:crypto.randomUUID()});assert.equal(s.access.print('teacher',{...selection,layout:'cards',includeCodes:true}).rows[0].code,code);
  const session=s.access.login(code.toLowerCase(),'device-a','loopback');assert.equal(s.access.me(session.token).student.firstName,'Mila');assert.deepEqual(s.access.me(session.token).assignments,[]);
  assert.throws(()=>s.access.login('AAAAAAAA','device-b','loopback'),/invalid-access/);
  assert.throws(()=>s.access.print('stranger',{...selection,includeCodes:true}),/permission|context/);
 }finally{s.close();rmSync(dir,{recursive:true,force:true});}
});
test('paired restore, missing key refuses reissue, rotation is idempotent and invalidates existing sessions',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'gc-access-restore-')),file=path.join(dir,'data.sqlite');let s=openLocalRoster(file);
 try{
  assert.ok(s.access);const selection=pupils(s);s.access.issue('teacher',selection);const code=s.access.print('teacher',{...selection,includeCodes:true,layout:'list'}).rows[0].code;
  const oldSession=s.access.login(code,'device-a','loopback');s.close();copyFileSync(file,file+'.backup');copyFileSync(file+'.student-key',file+'.key-backup');
  assert.equal(statSync(file+'.student-key').mode&0o777,0o600);assert.equal(readFileSync(file).includes(Buffer.from(code)),false,'credential never stored as plaintext');
  renameSync(file+'.student-key',file+'.key-away');s=openLocalRoster(file);assert.throws(()=>s.access.print('teacher',{...selection,includeCodes:true}),/key-unavailable/);s.close();
  copyFileSync(file+'.key-backup',file+'.student-key');s=openLocalRoster(file);assert.equal(s.access.print('teacher',{...selection,includeCodes:true}).rows[0].code,code);
  const request={...selection,expectedVersion:1,operationId:crypto.randomUUID()};s.access.rotate('teacher',request);s.access.rotate('teacher',request);
  assert.equal(s.access.statuses('teacher',selection).rows[0].version,2);assert.throws(()=>s.access.me(oldSession.token),/unauthenticated/);assert.throws(()=>s.access.login(code,'device-a','loopback'),/invalid-access/);
  s.close();copyFileSync(file+'.backup',file);copyFileSync(file+'.key-backup',file+'.student-key');s=openLocalRoster(file);assert.equal(s.access.print('teacher',{...selection,includeCodes:true}).rows[0].code,code);
 }finally{s.close();rmSync(dir,{recursive:true,force:true});}
});
test('login failure budget and blocking protect pupil access without changing teachers',()=>{
 const s=openLocalRoster(':memory:');try{
  assert.ok(s.access);const selection=pupils(s);s.access.issue('teacher',selection);const code=s.access.print('teacher',{...selection,includeCodes:true}).rows[0].code;
  for(let i=0;i<8;i++)assert.throws(()=>s.access.login('AAAAAAAA','device-bad','shared-school-ip'),/invalid-access/);
  assert.throws(()=>s.access.login(code,'device-bad','shared-school-ip'),/rate-limited/);
  const good=s.access.login(code,'different-device','shared-school-ip');assert.equal(s.access.me(good.token).student.id,selection.studentIds[0]);
  s.access.block('teacher',{...selection,expectedVersion:1,operationId:crypto.randomUUID()});assert.throws(()=>s.access.me(good.token),/unauthenticated/);assert.throws(()=>s.access.login(code,'device-c','shared-school-ip'),/invalid-access/);
  assert.equal(s.school.read('teacher').currentSchool.role,'teacher');
 }finally{s.close();}
});
