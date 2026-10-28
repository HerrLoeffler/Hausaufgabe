import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {teacherGradingSummary} from './teacher-grading-summary.mjs';
const source=readFileSync(new URL('./app.js',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('function renderResultsTable()'),source.indexOf('\nasync function ',source.indexOf('function renderResultsTable()')));
test('teacher table identifies recovered work before and after manual grading',()=>{
 for(const status of ['review','graded']){
  const wrap={innerHTML:'',querySelectorAll:()=>[]};
  const context={wilmaAnswerReview:null,resetInlineReview:()=>{},teacherGradingSummary,state:{submissions:[{id:'qa',studentName:'QA',totalPoints:1,maxPoints:2,percent:50,status,recoveryReviewRequired:true}]},$:()=>wrap,escapeHtml:x=>String(x??''),formatDuration:()=>'',fmtDate:()=>'',submissionGrade:()=>'-'};
  vm.runInNewContext(fn+'\nrenderResultsTable();',context);
  assert.match(wrap.innerHTML,status==='review'?/Nachübertragung · bitte prüfen/:/Nachübertragung geprüft/);
 }
});
