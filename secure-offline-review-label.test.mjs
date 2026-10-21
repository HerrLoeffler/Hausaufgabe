import {mountChapterAnswerExplorer} from './chapter-answer-explorer.mjs';
import {JSDOM} from './tools/ui/node_modules/jsdom/lib/api.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('./app.js',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('function renderResultsTable()'),source.indexOf('\nasync function ',source.indexOf('function renderResultsTable()')));
test('teacher table identifies recovered work before and after manual grading',()=>{
 for(const status of ['review','graded']){
  const dom=new JSDOM('<div id="wrap"></div>');const wrap=dom.window.document.getElementById('wrap');
  const context={mountChapterAnswerExplorer,answerDisplay:()=>'',correctDisplay:()=>'',openReview:()=>{},state:{submissions:[{id:'qa',studentName:'QA',totalPoints:1,maxPoints:2,percent:50,status,recoveryReviewRequired:true}]},$:id=>id==='chapterAnswerExplorer'?wrap.querySelector('#chapterAnswerExplorer'):wrap,escapeHtml:x=>String(x??''),formatDuration:()=>'',fmtDate:()=>'',submissionGrade:()=>'-'};
  vm.runInNewContext(fn+'\nrenderResultsTable();',context);
  dom.window.close();
  assert.match(wrap.innerHTML,status==='review'?/Nachübertragung · bitte prüfen/:/Nachübertragung geprüft/);
 }
});
