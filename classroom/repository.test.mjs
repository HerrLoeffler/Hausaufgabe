import test from 'node:test';
import assert from 'node:assert/strict';
import { createClassroomRepository } from './repository.mjs';
test('drafts are private; grants require school course and explicit recipient snapshots',()=>{
 const r=createClassroomRepository(); assert.equal(r.listStudentTests('pupil-empty').length,0);
 assert.throws(()=>r.assign('teacher-english',{quizId:'QTECH',courseId:'course-tech',startsAt:0,endsAt:9999999999999}),/Berechtigung/);
 assert.throws(()=>r.assign('school-admin',{quizId:'QTECH',courseId:'course-tech',startsAt:0,endsAt:9999999999999}),/Berechtigung/);
 const a=r.assign('teacher-tech',{quizId:'QTECH',courseId:'course-tech',startsAt:0,endsAt:9999999999999});
 assert.equal(r.listStudentTests('pupil-9b')[0].quizId,'QTECH'); assert.equal(r.listStudentTests('pupil-9c').length,0); assert.equal(r.listStudentTests('pupil-south').length,0);
 const late=r.addDemoMember('class-9b'); assert.equal(r.canStart(late.id,a.id).allowed,false); r.addRecipient('teacher-tech',a.id,late.id); assert.equal(r.canStart(late.id,a.id).allowed,true);
 r.removeMember('teacher-tech','class-9b',late.id); assert.equal(r.canStart(late.id,a.id).allowed,false);
});
test('reimport is idempotent, partial imports never remove, rollover retains identity and snapshots',()=>{
 const r=createClassroomRepository(); const rows=[{sourceId:'0007',className:'5a'},{sourceId:'0008',className:'9b'}];
 let p=r.previewImport({kind:'pupils',records:rows,full:false}); assert.equal(p.counts.created,2); r.applyImport('school-admin',p);
 p=r.previewImport({kind:'pupils',records:rows,full:false}); assert.equal(p.counts.unchanged,2); r.applyImport('school-admin',p);
 const identities=r.getState().students.length;
 r.applyImport('school-admin',r.previewImport({kind:'pupils',records:[rows[0]],full:false})); assert.equal(r.getState().students.length,identities);
 const full=r.previewImport({kind:'pupils',records:[rows[0]],full:true}); assert.equal(full.missing.length,1); r.applyImport('school-admin',full); assert.equal(r.getState().students.length,identities);
 const moved=r.previewImport({kind:'pupils',records:[{sourceId:'0007',className:'9b'}],full:false}); assert.equal(moved.counts.moved,1); r.applyImport('school-admin',moved);
 const ids=r.getState().students.map(s=>s.id); r.rollover('school-admin','2027/28'); assert.deepEqual(r.getState().students.map(s=>s.id),ids); assert.ok(r.getState().memberships.some(m=>m.year==='2027/28'));
});
test('administrative mutations require current school admin and import is atomic',()=>{
 const r=createClassroomRepository(); const p=r.previewImport({kind:'teachers',records:[{sourceId:'T1'}]});
 assert.throws(()=>r.applyImport('teacher-tech',p),/Schulverwaltung/);
 assert.throws(()=>r.applyImport('school-admin',{...p,schoolId:'school-south'}),/Schulverwaltung/);
 const before=r.getState(); const bad=r.previewImport({kind:'teaching',records:[{sourceId:'U1',teacherId:'missing',className:'9b',subject:'Englisch'}]});
 assert.throws(()=>r.applyImport('school-admin',bad),/Lehrkraft/);assert.deepEqual(r.getState(),before);
 assert.throws(()=>r.rollover('teacher-tech','2027/28'),/Schulverwaltung/);
 assert.throws(()=>r.transferTeachingGrant('teacher-tech',{grantId:'grant-english',toTeacherId:'teacher-replacement',effectiveAt:200}),/Schulverwaltung/);
});
test('teacher transfer takes effect per grant and preserves other courses and author identity',()=>{
 const r=createClassroomRepository({now:()=>100}); r.transferTeachingGrant('school-admin',{grantId:'grant-english',toTeacherId:'teacher-replacement',effectiveAt:200});
 assert.equal(r.canTeach('teacher-english','course-english',199),true); assert.equal(r.canTeach('teacher-english','course-english',200),false); assert.equal(r.canTeach('teacher-replacement','course-english',200),true); assert.equal(r.canTeach('teacher-tech','course-tech',200),true);
 assert.equal(r.getState().quizzes.find(q=>q.id==='QENG').ownerId,'teacher-english');
});
test('stale import preview is refused and reset removes all imported identities',()=>{
 const r=createClassroomRepository(); const p=r.previewImport({kind:'pupils',records:[{sourceId:'0001',className:'5a'}]}); r.addDemoMember('class-9b'); assert.throws(()=>r.applyImport('school-admin',p),/Vorschau/); r.reset(); assert.equal(r.getState().students.length,4);
});
