import test from 'node:test';import assert from 'node:assert/strict';
import {createClassroomAppRepository} from './app-repository.mjs';
test('the existing local quiz port preserves independent real editor quiz IDs and edits',()=>{const r=createClassroomAppRepository();r.create({id:'A',title:'Alpha',questions:[]});r.create({id:'B',title:'Beta',questions:[]});r.save('A',{title:'Edited'},[{id:'q1',text:'Frage'}]);assert.equal(r.getQuiz('A').title,'Edited');assert.equal(r.getQuiz('B').title,'Beta');assert.equal(r.getQuestions('A').length,1);assert.equal(r.list().length,2);});
