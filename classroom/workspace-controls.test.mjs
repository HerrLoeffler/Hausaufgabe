import test from 'node:test';import assert from 'node:assert/strict';
import {currentAssignments,filterRoster} from './workspace-controls.mjs';
test('LIVE selects only the current owned published round and supports several classes',()=>{
 const quiz={id:'q',ownerId:'t',published:true,startMode:'teacher',sessionRunId:'r2'};
 const rows=[{id:'old',quizId:'q',sessionRunId:'r1'},{id:'a',quizId:'q',sessionRunId:'r2'},{id:'b',quizId:'q',sessionRunId:'r2'}];
 assert.deepEqual(currentAssignments(rows,quiz,'t').map(x=>x.id),['a','b']);
 assert.equal(currentAssignments(rows,{...quiz,ended:true},'t').length,0);assert.equal(currentAssignments(rows,quiz,'foreign').length,0);
});
test('roster search finds names and classes without including access credentials',()=>{
 const rows=[{firstName:'Éva',lastName:'Müller',className:'8b',code:'SECRET'},{firstName:'Max',lastName:'Test',className:'9a'}];
 assert.equal(filterRoster(rows,'müll').length,1);assert.equal(filterRoster(rows,'8b').length,1);assert.equal(filterRoster(rows,'SECRET').length,0);assert.equal(filterRoster(rows,'').length,2);
});
