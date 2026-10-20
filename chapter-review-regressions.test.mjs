import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {copyChapterFields,chapterFields} from './chapter-editor.mjs';
const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
test('shared template import copies nested quiz chapters and question mapping together',async()=>{
 const c={state:{currentSharedTemplate:{quiz:{chapterSchemaVersion:1,chapters:[{id:'ch_one',title:'One',position:1}]},questions:[{id:'q',chapterId:'ch_one'}]},user:null},copyChapterFields,chapterFields,$:()=>null};vm.createContext(c);
 const body=source.slice(source.indexOf('async function importSharedTemplate()'),source.indexOf('async function importSharedTemplate()')+500);
 vm.runInContext(body.slice(0,body.indexOf('  if (!source?.quiz'))+' globalThis.copied=source;}',c);await c.importSharedTemplate();
 assert.equal(c.copied.quiz.chapterSchemaVersion,1);assert.notEqual(c.copied.questions[0].chapterId,'ch_one');assert.equal(c.copied.quiz.chapters[0].id,c.copied.questions[0].chapterId);
});
test('existing move button retains new within chapter order on rendering',()=>{
 const c={state:{currentQuiz:{chapterSchemaVersion:1},questions:[{id:'a',chapterId:'ch_x',position:1},{id:'b',chapterId:'ch_x',position:2}]},renderQuestions(){c.state.questions.sort((a,b)=>a.position-b.position);},markDirty(){},focusEditorQuestion(){}};vm.createContext(c);
 vm.runInContext(source.slice(source.indexOf('function moveQuestion('),source.indexOf('\nfunction duplicateQuestion(')),c);c.moveQuestion(0,1);assert.deepEqual(c.state.questions.map(q=>q.id),['b','a']);
});
test('CSV answers use each submission frozen question even after author edits',()=>{
 let csv='';const c={state:{currentResultsQuiz:{id:'t',title:'History'},resultQuestions:[{id:'new',text:'New'}],submissions:[{studentName:'A',chapterSnapshot:{chapters:[],questions:[]},chapterQuestions:[{id:'old',text:'Old',options:[{text:'Historical'}]}],answers:{old:'0'},grading:{}}]},Chapters:{aggregateChapterResults:()=>[]},toast(){},answerDisplay:(q)=>q.options?.[0]?.text||q.text,submissionGrade:()=>'',formatDuration:()=>'',fmtDate:()=>'',Blob:class{constructor(parts){csv=parts.join('');}},URL:{createObjectURL:()=>'',revokeObjectURL(){}},document:{createElement:()=>({click(){}})},setTimeout(){}};vm.createContext(c);
 vm.runInContext(source.slice(source.indexOf('function exportResultsCsv('),source.indexOf('// ---------- Mitteilungen')),c);c.exportResultsCsv();assert.match(csv,/Historical/);assert.doesNotMatch(csv,/New/);assert.match(csv,/old/);
});
