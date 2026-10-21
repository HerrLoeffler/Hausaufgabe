import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';
import {openLocalRoster} from './local-roster-store.mjs';
const op=(command,payload,expectedRevision=0)=>({command,payload,expectedRevision,operationId:crypto.randomUUID()});
function setup(store,who='a'){
 const p=store.school.previewSetup(who,{name:'Beispielschule',displayName:'Ada Beispiel'});
 return store.school.command(who,op('createSchool',{name:'Beispielschule',displayName:'Ada Beispiel',previewHash:p.planHash},p.revision));
}
function join(store,from,to,role='admin'){
 let state=store.school.read(from),r=store.school.command(from,op('invite',{name:`Person ${to}`,role},state.revision));
 const secret=r.invitation.secret;
 store.school.command(to,op('claimInvitation',{secret,displayName:`Person ${to}`}));
 state=store.school.read(from);const request=state.requests.find(x=>x.displayName===`Person ${to}`);
 store.school.command(from,op('approveRequest',{requestId:request.id},state.revision));
 return secret;
}
test('school setup is previewed, preserves IDs and import receipts and persists while isolating strangers',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'gc-school-')),file=path.join(dir,'data.sqlite');let s=openLocalRoster(file);
 try{
  assert.ok(s.school,'persistent school service must exist');
  let state=s.mutate('a',op('createClass',{name:'8b',schoolYear:'2026/27'}));const c=state.classes[0];
  state=s.mutate('a',op('createStudent',{firstName:'Mila',lastName:'Muster',classId:c.id},state.revision));const student=state.students[0];
  const input={schoolYear:'2026/27',sourceNamespace:'Staff',rows:[{line:2,sourceId:'T1',firstName:'Ada',lastName:'Beispiel',shortCode:'AB',className:'8b',subject:'Deutsch'}]};
  const preview=s.previewTeacherImport('a',input);state=s.mutate('a',op('importTeachers',{...input,previewHash:preview.planHash},state.revision));
  const p=s.school.previewSetup('a',{name:'Beispielschule',displayName:'Ada Beispiel'});assert.equal(p.counts.students,1);assert.equal(s.read('a').contextId,undefined,'preview does not migrate');
  assert.throws(()=>s.school.command('a',op('createSchool',{name:'Anders',displayName:'Ada Beispiel',previewHash:p.planHash},p.revision)),/preview-mismatch/);
  const school=setup(s);assert.equal(school.currentSchool.name,'Beispielschule');assert.equal(school.members.length,1);assert.equal(school.members[0].role,'admin');
  const migrated=s.read('a');assert.equal(migrated.students[0].id,student.id);assert.equal(migrated.classes[0].id,c.id);assert.ok(migrated.contextId);assert.equal(s.read('b').students.length,0);
  assert.throws(()=>s.mutate('a',op('createClass',{name:'9a',schoolYear:'2026/27'},migrated.revision)),/context-mismatch/,'old tab cannot write into new school by revision alone');
  assert.equal(s.previewTeacherImport('a',input,migrated.contextId).counts.newTeachers,0,'source mapping copied');
  s.close();s=openLocalRoster(file);assert.equal(s.read('a').students[0].id,student.id);assert.equal(s.school.read('a').currentSchool.id,school.currentSchool.id);
  assert.throws(()=>s.school.command('b',op('selectSchool',{schoolId:school.currentSchool.id})),/permission-denied/);
 }finally{s.close();rmSync(dir,{recursive:true,force:true});}
});
test('preview stale after change; failed migration leaves personal workspace writable; setup retry idempotent',()=>{
 const s=openLocalRoster(':memory:');try{
  assert.ok(s.school);const p=s.school.previewSetup('a',{name:'Schule',displayName:'Ada'});
  s.mutate('a',op('createClass',{name:'8b',schoolYear:'2026/27'}));
  assert.throws(()=>s.school.command('a',op('createSchool',{name:'Schule',displayName:'Ada',previewHash:p.planHash},p.revision)),/revision-conflict/);
  assert.equal(s.school.read('a').currentSchool,null);assert.equal(s.read('a').classes.length,1);
  const next=s.school.previewSetup('a',{name:'Schule',displayName:'Ada'}),request=op('createSchool',{name:'Schule',displayName:'Ada',previewHash:next.planHash},next.revision);
  const one=s.school.command('a',request),two=s.school.command('a',request);assert.equal(one.currentSchool.id,two.currentSchool.id);assert.equal(two.schools.length,1);
 }finally{s.close();}
});
test('admin invitation requires own verified account and final approval; last admin, revocation and private scope enforced',()=>{
 const s=openLocalRoster(':memory:');try{
  assert.ok(s.school);setup(s);join(s,'a','b');assert.equal(s.school.read('b').members.length,2);
  let state=s.school.read('b');const a=state.members.find(m=>m.displayName==='Ada Beispiel');
  s.school.command('b',op('changeRole',{memberId:a.id,role:'teacher'},state.revision));
  assert.throws(()=>s.school.command('a',op('invite',{name:'X',role:'admin'},s.school.read('a').revision)),/permission-denied/);
  state=s.school.read('b');assert.throws(()=>s.school.command('b',op('changeRole',{memberId:state.members.find(m=>m.isSelf).id,role:'teacher'},state.revision)),/last-admin/);
  assert.equal(s.read('a').students.length,0);
  state=s.school.read('b');const invite=s.school.command('b',op('invite',{name:'C',role:'admin'},state.revision));
  s.school.command('c',op('claimInvitation',{secret:invite.invitation.secret,displayName:'C'}));assert.equal(s.school.read('c').currentSchool,null,'pending account has no roster');
  assert.throws(()=>s.school.command('d',op('claimInvitation',{secret:invite.invitation.secret,displayName:'D'})),/invitation-invalid/);
  state=s.school.read('b');s.school.command('b',op('revokeInvitation',{invitationId:invite.invitation.id},state.revision));
  assert.equal(s.school.read('b').requests.length,0);
 }finally{s.close();}
});
test('confirmed teachers select classes themselves; other school and admin mutations stay blocked',()=>{
 const s=openLocalRoster(':memory:');try{
  assert.ok(s.school);let personal=s.mutate('a',op('createClass',{name:'8b',schoolYear:'2026/27'}));const c=personal.classes[0];
  s.mutate('a',op('createStudent',{firstName:'Mila',lastName:'Muster',classId:c.id},personal.revision));setup(s);join(s,'a','b','teacher');
  let b=s.school.read('b');assert.equal(b.classChoices.length,1);assert.equal(s.read('b').students.length,0);
  s.school.command('b',op('selectClasses',{classIds:[c.id]},b.revision));assert.equal(s.read('b').students.length,1);
  const roster=s.read('b');assert.throws(()=>s.mutate('b',{...op('createStudent',{firstName:'X',lastName:'Y',classId:'not-selected'},roster.revision),contextId:roster.contextId}),/permission-denied/);
  b=s.school.read('b');s.school.command('b',op('selectClasses',{classIds:[]},b.revision));assert.equal(s.read('b').students.length,0);
  setup(s,'x');const foreign=s.read('x');assert.throws(()=>s.school.command('b',op('selectClasses',{classIds:[foreign.classes[0]?.id||'foreign']},s.school.read('b').revision)),/not-found/);
  assert.throws(()=>s.school.command('b',op('selectSchool',{schoolId:foreign.contextId})),/permission-denied/);
 }finally{s.close();}
});

test('a database failure rolls migration back; three admins and competing last-admin changes remain safe',async()=>{
 const {DatabaseSync}=await import('node:sqlite');const dir=mkdtempSync(path.join(tmpdir(),'gc-school-atomic-')),file=path.join(dir,'data.sqlite');const s=openLocalRoster(file),db=new DatabaseSync(file);
 try{
  s.mutate('a',op('createClass',{name:'8b',schoolYear:'2026/27'}));const original=s.read('a');
  db.exec("CREATE TRIGGER abort_school_member BEFORE INSERT ON local_school_members BEGIN SELECT RAISE(ABORT,'synthetic-failure'); END;");
  assert.throws(()=>setup(s),/synthetic-failure/);assert.deepEqual(s.read('a'),original);assert.equal(s.school.read('a').currentSchool,null);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM local_school_migrations').get().n,0);
  db.exec('DROP TRIGGER abort_school_member');setup(s);join(s,'a','b');join(s,'a','c');assert.equal(s.school.read('a').members.filter(x=>x.role==='admin').length,3);
  let a=s.school.read('a');s.school.command('a',op('changeRole',{memberId:a.members.find(x=>x.displayName==='Person c').id,role:'teacher'},a.revision));
  a=s.school.read('a');const b=s.school.read('b');s.school.command('a',op('changeRole',{memberId:a.members.find(x=>x.isSelf).id,role:'teacher'},a.revision));
  assert.throws(()=>s.school.command('b',op('changeRole',{memberId:b.members.find(x=>x.isSelf).id,role:'teacher'},b.revision)),/revision-conflict/);
  const latest=s.school.read('b');assert.throws(()=>s.school.command('b',op('removeMember',{memberId:latest.members.find(x=>x.isSelf).id},latest.revision)),/last-admin/);
 }finally{db.close();s.close();rmSync(dir,{recursive:true,force:true});}
});
