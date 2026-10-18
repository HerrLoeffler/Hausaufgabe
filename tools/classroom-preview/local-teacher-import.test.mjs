import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openLocalRoster} from './local-roster-store.mjs';
const row=(line,sourceId,firstName='Ada',className='8b',subject='Deutsch')=>({line,sourceId,firstName,lastName:'Beispiel',shortCode:'AB',className,subject});
const input=(rows,schoolYear='2026/27')=>({schoolYear,sourceNamespace:'synthetic-staff',rows});
function commit(s,p,uid='a'){const plan=s.previewTeacherImport(uid,p);return s.mutate(uid,{command:'importTeachers',payload:{...p,previewHash:plan.planHash},expectedRevision:plan.revision,operationId:randomUUID()});}
test('teacher preview groups repeated identifiers into explicit pairs; commit persists without changing students or accounts',()=>{
 const dir=mkdtempSync(join(tmpdir(),'gc-teacher-')),file=join(dir,'roster.sqlite');let s=openLocalRoster(file);try{
  const p=input([row(2,'0001'),row(3,'0001','Ada','9b','Englisch'),row(4,'0002','Mila','8b','Technik')]);
  const plan=s.previewTeacherImport('a',p);assert.equal(plan.counts.newTeachers,2);assert.equal(s.read('a').revision,0);assert.equal(s.read('a').teachers.length,0);
  const result=commit(s,p);assert.equal(result.teachers.length,2);assert.equal(result.classes.length,2);assert.equal(result.students.length,0);assert.equal(result.teachers[0].assignments.length,2);assert.equal(result.teachers[0].accountUid,undefined);
  const id=result.teachers[0].id;s.close();s=openLocalRoster(file);assert.equal(s.read('a').teachers[0].id,id);assert.equal(s.read('b').teachers.length,0);
  const again=s.previewTeacherImport('a',p);assert.equal(again.counts.unchanged,2);commit(s,p);assert.equal(s.read('a').teachers.length,2);
 }finally{s.close();rmSync(dir,{recursive:true,force:true});}
});
test('teacher stable identity survives changed name and new year; old year teaching is retained and current year changes are explicit',()=>{
 const s=openLocalRoster(':memory:');try{
  const first=commit(s,input([row(2,'0001')])),id=first.teachers[0].id;
  const p=input([row(2,'0001','Ada Marie','9b','Englisch')],'2027/28'),plan=s.previewTeacherImport('a',p);
  assert.equal(plan.counts.updated,1);assert.equal(plan.counts.nameChanges,1);assert.equal(plan.counts.assignmentChanges,1);assert.match(plan.rows[0].before.classLabel,/8b.*Deutsch/);assert.match(plan.rows[0].after.classLabel,/9b.*Englisch/);
  const result=commit(s,p);assert.equal(result.teachers[0].id,id);assert.equal(result.teachers[0].assignments.length,2);
  commit(s,input([row(2,'0001','Ada Marie','9b','Technik')],'2027/28'));assert.equal(s.read('a').teachers[0].assignments.length,2);assert.ok(s.read('a').teachers[0].assignments.some(a=>a.subject==='Deutsch'));assert.ok(!s.read('a').teachers[0].assignments.some(a=>a.subject==='Englisch'));
 }finally{s.close();}
});
test('teacher name match requires explicit decision, foreign IDs and unresolved or stale approvals cannot commit',()=>{
 const s=openLocalRoster(':memory:');try{
  const a=commit(s,input([row(2,'0001')])).teachers[0],b=commit(s,input([row(2,'0002')]),'b').teachers[0];
  const p=input([row(2,'')]);let plan=s.previewTeacherImport('a',p);assert.equal(plan.counts.review,1);
  const request={command:'importTeachers',payload:{...p,previewHash:plan.planHash},expectedRevision:plan.revision,operationId:randomUUID()};assert.throws(()=>s.mutate('a',request),e=>e.code==='import-unresolved');
  assert.throws(()=>s.previewTeacherImport('a',{...p,decisions:[{line:2,action:'link',teacherId:b.id}]}),e=>e.code==='not-found');
  const linked={...p,decisions:[{line:2,action:'link',teacherId:a.id}]};plan=s.previewTeacherImport('a',linked);assert.equal(plan.counts.review,0);assert.equal(commit(s,linked).teachers.length,1);
  assert.throws(()=>s.mutate('a',{...request,payload:{...linked,previewHash:'wrong'},operationId:randomUUID()}),e=>e.code==='preview-mismatch');
  assert.throws(()=>s.previewTeacherImport('a',input([row(2,'0001'),row(3,'0001','Different')])),e=>e.code==='duplicate-source');
  assert.throws(()=>s.previewTeacherImport('a',input([row(2,'x','Ada','8b','')])),e=>e.code==='invalid-argument');
  assert.throws(()=>s.previewTeacherImport('a',{...p,role:'admin'}),e=>e.code==='invalid-argument');
 }finally{s.close();}
});
test('teacher source namespace and indices are separate from students; empty assignments allow staff-only import',()=>{
 const s=openLocalRoster(':memory:');try{
  const p=input([row(2,'0001','Ada','','')]);const t=commit(s,p);assert.equal(t.teachers[0].assignments.length,0);assert.equal(t.classes.length,0);
  const pupil={schoolYear:'2026/27',sourceNamespace:'synthetic-staff',rows:[{line:2,sourceId:'0001',firstName:'Ada',lastName:'Beispiel',className:'8b'}]};const preview=s.previewImport('a',pupil);assert.equal(preview.counts.newStudents,1);
  s.mutate('a',{command:'importStudents',payload:{...pupil,previewHash:preview.planHash},expectedRevision:preview.revision,operationId:randomUUID()});assert.equal(s.read('a').teachers.length,1);assert.equal(s.read('a').students.length,1);
 }finally{s.close();}
});
test('staff-only reimport preserves existing teaching rather than clearing assignments from an unmapped file',()=>{
 const s=openLocalRoster(':memory:');try{
  commit(s,input([row(2,'0001')]));const p=input([row(2,'0001','Ada','','')]);const plan=s.previewTeacherImport('a',p);assert.equal(plan.counts.assignmentChanges,0);commit(s,p);assert.equal(s.read('a').teachers[0].assignments.length,1);
 }finally{s.close();}
});
test('omitted optional staff code preserves it on a names-only import',()=>{
 const s=openLocalRoster(':memory:');try{commit(s,input([row(2,'0001')]));const record={line:2,firstName:'Ada',lastName:'Beispiel',sourceId:'0001'};const p=input([record]);assert.equal(s.previewTeacherImport('a',p).counts.unchanged,1);commit(s,p);assert.equal(s.read('a').teachers[0].shortCode,'AB');}finally{s.close();}
});
