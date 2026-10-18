import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {openLocalRoster} from './local-roster-store.mjs';
const op=(command,payload,revision=0,operationId=crypto.randomUUID())=>({command,payload,expectedRevision:revision,operationId});
test('names, class and identity survive database reopen; owner and revisions are enforced',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'gc-roster-')),file=path.join(dir,'roster.sqlite');
 let store=openLocalRoster(file);
 try{
  const created=store.mutate('teacher-a',op('createClass',{name:'9b',schoolYear:'2026/27'}));
  const c=created.classes[0];assert.equal(c.name,'9b');assert.equal(created.revision,1);
  const request=op('createStudent',{firstName:'Mila Marie',lastName:'von Beispiel',classId:c.id},1);
  const added=store.mutate('teacher-a',request);assert.equal(added.students[0].firstName,'Mila Marie');
  assert.deepEqual(store.mutate('teacher-a',request),added,'retry does not duplicate');
  assert.throws(()=>store.mutate('teacher-a',op('createStudent',{firstName:'Alt',lastName:'Stand',classId:c.id},1)),/revision/);
  assert.deepEqual(store.read('teacher-b').students,[]);
  assert.throws(()=>store.mutate('teacher-b',op('createStudent',{firstName:'Fremd',lastName:'Zugriff',classId:c.id})),/not-found/);
  store.close();store=openLocalRoster(file);
  const persisted=store.read('teacher-a');assert.equal(persisted.students.length,1);assert.equal(persisted.students[0].lastName,'von Beispiel');
  const id=persisted.students[0].id;
  const edited=store.mutate('teacher-a',op('updateStudent',{id,firstName:'Mila',lastName:'Beispiel',classId:null},2));
  assert.equal(edited.students[0].id,id);assert.equal(edited.students[0].classId,null);
  assert.equal(statSync(file).mode&0o777,0o600);
 }finally{store.close();rmSync(dir,{recursive:true,force:true});}
});
test('validation, duplicate classes and idempotency payload mismatches leave state unchanged',()=>{
 const store=openLocalRoster(':memory:');
 try{
  assert.throws(()=>store.mutate('a',op('createStudent',{firstName:' ',lastName:'Beispiel'})),/invalid/);
  assert.throws(()=>store.mutate('a',op('createClass',{name:'9b',schoolYear:'oops',ownerUid:'other'})),/invalid/);
  const r=op('createClass',{name:'9b',schoolYear:'2026/27'});store.mutate('a',r);
  assert.throws(()=>store.mutate('a',{...r,payload:{name:'9c',schoolYear:'2026/27'}}),/operation-conflict/);
  assert.throws(()=>store.mutate('a',op('createClass',{name:'9b',schoolYear:'2026/27'},1)),/already-exists/);
  assert.equal(store.read('a').revision,1);assert.equal(store.read('a').classes.length,1);
  assert.throws(()=>store.mutate('a',op('makeAdmin',{},1)),/invalid/);
  const c=store.read('a').classes[0];
  store.mutate('a',op('updateClass',{id:c.id,name:'9c',schoolYear:'2026/27'},1));
  assert.equal(store.read('a').classes[0].name,'9c');
 }finally{store.close();}
});
