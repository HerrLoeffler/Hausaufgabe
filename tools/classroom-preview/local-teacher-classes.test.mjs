import test from 'node:test';import assert from 'node:assert/strict';import {openLocalRoster} from './local-roster-store.mjs';
const op=(command,payload,state)=>({command,payload,expectedRevision:state.revision,contextId:state.contextId,operationId:crypto.randomUUID()});
import {schoolFixture} from './local-school-fixture.mjs';
test('confirmed teacher creates a shared class, joins automatically and adds pupils only inside selected classes',()=>{
 const s=openLocalRoster(':memory:');try{
  schoolFixture(s);let state=s.read('teacher');assert.equal(state.canCreateClass,true);
  const request=op('createClass',{name:'8b',schoolYear:'2026/27'},state);state=s.mutate('teacher',request);assert.equal(state.classes.length,1);const id=state.classes[0].id;
  assert.equal(s.school.read('teacher').selectedClassIds[0],id);assert.equal(s.read('admin').classes[0].id,id);assert.equal(s.mutate('teacher',request).classes[0].id,id);
  state=s.mutate('teacher',op('createStudent',{firstName:'Mila',lastName:'Muster',classId:id},state));assert.equal(state.students[0].firstName,'Mila');
  const admin=s.read('admin');s.mutate('admin',op('createClass',{name:'9a',schoolYear:'2026/27'},admin));const foreign=s.read('admin').classes.find(c=>c.id!==id).id;
  assert.throws(()=>s.mutate('teacher',op('createStudent',{firstName:'Nein',lastName:'Fremd',classId:foreign},s.read('teacher'))),/permission-denied/);
  assert.throws(()=>s.mutate('teacher',op('updateClass',{id,name:'Umbenannt',schoolYear:'2026/27'},s.read('teacher'))),/permission-denied/);
  assert.throws(()=>s.mutate('teacher',op('createClass',{name:'  8B ',schoolYear:'2026/27'},s.read('teacher'))),/already-exists/);
  assert.equal(s.school.read('teacher').currentSchool.role,'teacher');assert.equal(s.read('stranger').classes.length,0);
 }finally{s.close();}
});
