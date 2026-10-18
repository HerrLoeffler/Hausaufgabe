import test from 'node:test';import assert from 'node:assert/strict';
import {openLocalRoster} from './local-roster-store.mjs';
const operation=(command,payload,expectedRevision=0)=>({command,payload,expectedRevision,operationId:crypto.randomUUID()});
const payload=(rows,schoolYear='2026/27',decisions=[])=>({schoolYear,sourceNamespace:'Test-ASV',rows,decisions});
const row=(line,firstName='Ada',lastName='Beispiel',className='8b',sourceId='001')=>({line,firstName,lastName,className,sourceId});
const confirm=(store,uid,p)=>{const plan=store.previewImport(uid,p);return store.mutate(uid,operation('importStudents',{...p,previewHash:plan.planHash},plan.revision));};
test('preview is read-only; import creates names/classes atomically; repeat does not duplicate',()=>{
 const s=openLocalRoster(':memory:');try{
  const p=payload([row(2),row(3,'Mila','Übung','8c','002')]),preview=s.previewImport('a',p);
  assert.equal(preview.counts.newStudents,2);assert.equal(preview.newClasses.length,2);assert.equal(s.read('a').students.length,0);
  const result=confirm(s,'a',p);assert.equal(result.students.length,2);assert.equal(result.classes.length,2);
  const repeat=s.previewImport('a',p);assert.equal(repeat.counts.unchanged,2);assert.equal(repeat.counts.newStudents,0);
  assert.equal(confirm(s,'a',p).students.length,2);assert.equal(s.read('b').students.length,0);
 }finally{s.close();}
});
test('verified import reference preserves student ID through name and year/class changes',()=>{
 const s=openLocalRoster(':memory:');try{
  const original=confirm(s,'a',payload([row(2)])),id=original.students[0].id;
  const next=payload([row(2,'Ada Marie','Beispiel','9b')],'2027/28'),preview=s.previewImport('a',next);
  assert.equal(preview.rows[0].studentId,id);assert.equal(preview.rows[0].nameChanged,true);assert.equal(preview.rows[0].classChanged,true);
  assert.match(preview.rows[0].before.classLabel,/8b/);assert.match(preview.rows[0].after.classLabel,/9b/);
  const result=confirm(s,'a',next);assert.equal(result.students[0].id,id);assert.equal(result.students[0].firstName,'Ada Marie');assert.equal(result.classes.length,2);
 }finally{s.close();}
});
test('manual names require explicit link; no-ID exact repeat is remembered; missing students unchanged',()=>{
 const s=openLocalRoster(':memory:');try{
  s.mutate('a',operation('createStudent',{firstName:'Ada',lastName:'Beispiel'}));const id=s.read('a').students[0].id;
  const p=payload([row(2,'Ada','Beispiel','9b','')]);const review=s.previewImport('a',p);assert.equal(review.counts.review,1);
  assert.throws(()=>confirm(s,'a',p),/import-unresolved/);
  const linked={...p,decisions:[{line:2,action:'link',studentId:id}]};
  assert.equal(s.previewImport('a',linked).rows[0].classChanged,true,'unassigned pupil moves to new class');
  assert.equal(confirm(s,'a',linked).students.length,1);
  assert.equal(s.previewImport('a',p).rows[0].studentId,id);
  const other=payload([row(2,'Neue','Person','5a','')]);assert.equal(s.previewImport('a',other).missingStudents.length,1);
  assert.equal(confirm(s,'a',other).students.length,2);assert.equal(confirm(s,'a',other).students.length,2);
 }finally{s.close();}
});
test('stale or tampered preview, foreign links and duplicate source IDs cannot partially write',()=>{
 const s=openLocalRoster(':memory:');try{
  const p=payload([row(2)]),preview=s.previewImport('a',p);
  assert.throws(()=>s.mutate('a',operation('importStudents',{...p,previewHash:'fake'},0)),/preview-mismatch/);assert.equal(s.read('a').students.length,0);
  s.mutate('a',operation('createClass',{name:'5a',schoolYear:'2026/27'}));
  assert.throws(()=>s.mutate('a',operation('importStudents',{...p,previewHash:preview.planHash},0)),/revision-conflict/);
  assert.throws(()=>s.previewImport('a',payload([row(2),row(3)])),/duplicate-source/);
  const foreign=s.mutate('b',operation('createStudent',{firstName:'Ada',lastName:'Beispiel'})).students[0].id;
  assert.throws(()=>s.previewImport('a',{...p,decisions:[{line:2,action:'link',studentId:foreign}]}),/not-found/);
  assert.equal(s.read('a').students.length,0);
 }finally{s.close();}
});
test('two rows cannot target the same existing pupil; skipping a row and all-or-nothing validation are supported',()=>{
 const s=openLocalRoster(':memory:');try{
  const first=confirm(s,'a',payload([row(2)])),id=first.students[0].id;
  const p=payload([row(2,'Ada','Beispiel','8b',''),row(3,'Ada','Beispiel','9b','')]);
  assert.throws(()=>s.previewImport('a',{...p,decisions:[{line:2,action:'link',studentId:id},{line:3,action:'link',studentId:id}]}),/duplicate-target/);
  const skipped={...p,decisions:[{line:2,action:'skip'},{line:3,action:'link',studentId:id}]};
  assert.equal(s.previewImport('a',skipped).counts.skipped,1);assert.equal(confirm(s,'a',skipped).students.length,1);
  const before=s.read('a');assert.throws(()=>confirm(s,'a',payload([row(2,'Neue','Person','5a','x'),row(3,'','Ungültig','5a','y')])),/invalid-argument/);assert.deepEqual(s.read('a'),before);
 }finally{s.close();}
});
test('ambiguous name candidate lists remain bounded and never auto-merge',()=>{
 const s=openLocalRoster(':memory:');try{
  for(let i=0;i<51;i++)s.mutate('a',operation('createStudent',{firstName:'Ada',lastName:'Beispiel'},i));
  const plan=s.previewImport('a',payload([row(2)]));assert.equal(plan.counts.review,1);assert.equal(plan.rows[0].candidates.length,50);
 }finally{s.close();}
});
test('fixed target class is authorized by ID and bound to its actual year',()=>{
 const s=openLocalRoster(':memory:');try{
  const c=s.mutate('a',operation('createClass',{name:'8b',schoolYear:'2025/26'})).classes[0];
  const input={...payload([row(2,'Ada','Beispiel','ignored')],'2025/26'),fixedClassId:c.id};
  const preview=s.previewImport('a',input);assert.equal(preview.newClasses.length,0);assert.equal(preview.rows[0].after.classLabel,'8b · 2025/26');
  assert.throws(()=>s.previewImport('a',{...input,schoolYear:'2026/27'}),/target-conflict/);
  assert.throws(()=>s.previewImport('b',input),/not-found/);
 }finally{s.close();}
});
