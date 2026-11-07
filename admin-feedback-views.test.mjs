import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as logs from './admin-log-tools.mjs';
const rows = [
 {id:'ok',category:'ai_question',verdict:'good'},
 {id:'bad',category:'ai_question',verdict:'bad'},
 {id:'warn',category:'ai_question',reviewOutcome:'false_positive'},
 {id:'tech',category:'app_error'}, {id:'oldbug',category:'bug'},
 {id:'image',category:'screenshot_error'}, {id:'rights',category:'rights'},
 {id:'idea',category:'idea'}, {id:'future',category:'new_category'}
];
test('default inbox contains technical reports, retains every learning and support record',()=>{
 const before=structuredClone(rows);
 assert.equal(typeof logs.filterFeedbackByView,'function','view projection is required');
 assert.deepEqual(logs.filterFeedbackByView(rows).map(r=>r.id),['tech','oldbug']);
 assert.deepEqual(logs.filterFeedbackByView(rows,'quality').map(r=>r.id),['ok','bad','warn']);
 assert.deepEqual(logs.filterFeedbackByView(rows,'all'),rows);
 assert.deepEqual(rows,before);
});
test('view scopes compose with existing filters and fail safe for unknown view values',()=>{
 assert.equal(typeof logs.filterFeedbackByView,'function');
 assert.equal(logs.filterFeedbackByView(rows,'unexpected').length,2);
 const filtered=logs.filterLogs(logs.filterFeedbackByView(rows,'quality'),{term:'bad'});
 assert.deepEqual(filtered.map(r=>r.id),['bad']);
});
const source=fs.readFileSync('app.js','utf8');
function summary(){const from=source.indexOf('function questionLearningSummary('),to=source.indexOf('\nasync function loadQuestionLearningStatuses',from);const context=vm.createContext({fmtDate:v=>'DATE'+v});vm.runInContext(source.slice(from,to),context);return context.questionLearningSummary;}
test('legacy applied marker with missing time or operation is explicitly incomplete',()=>{
 assert.match(summary()({personalLearningStatus:'applied',sharedLearningStatus:'applied'}),/unvollständig|unvollstaendig/);
 assert.doesNotMatch(summary()({personalLearningStatus:'applied',sharedLearningStatus:'applied'}),/berücksichtigt: DATEundefined/);
});
test('complete evidence includes operation and version without claiming improved correctness',()=>{
 const text=summary()({personalLearningStatus:'applied',personalAppliedAt:123,personalAppliedOperation:'generateTest',learningVersion:'task-feedback-v1',sharedLearningStatus:'pending_review'});
 assert.match(text,/DATE123/);assert.match(text,/generateTest/);assert.match(text,/task-feedback-v1/);assert.doesNotMatch(text,/fachlich verbessert/);
});

test('real admin renderer separates inboxes, retains all feedback and links technical context',async()=>{
 const {JSDOM}=await import('./tools/ui/node_modules/jsdom/lib/api.js');
 const html=fs.readFileSync('index.html','utf8');
 const start=html.indexOf('<section id="adminPanelFeedback"');
 const section=html.slice(start,html.indexOf('</section>',start)+10);
 const dom=new JSDOM(section,{runScripts:'outside-only'}),w=dom.window;
 let writes=0;
 w.state={user:{uid:'admin'},adminFeedback:rows.map(r=>({...r,message:r.id,testCode:r.id==='bad'?'SYNTEST':''})),adminFeedbackTotal:rows.length,adminQuestionLearning:{},adminQuizzes:[]};
 w.$=id=>w.document.getElementById(id);w.normalize=v=>v.toLowerCase();
 w.escapeHtml=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 w.fmtDate=()=>'';Object.assign(w,logs);
 w.eval(source.split('\n').find(line=>line.startsWith('function feedbackCategoryLabel(')));
 w.AI_QUALITY_REASONS={};w.renderBugOpsSummary=()=>'<div id="syntheticBugOps">Technical incidents</div>';
 w.renderErrorResolution=()=>'';w.bindFeedbackImages=()=>{};w.isAdmin=()=>true;
 w.updateFeedbackStatus=()=>writes++;w.reviewQuestionLearning=()=>writes++;
 w.eval(source.slice(source.indexOf('function questionLearningSummary('),source.indexOf('\nasync function loadQuestionLearningStatuses')));
 w.eval(source.slice(source.indexOf('function renderAdminFeedback('),source.indexOf('\nasync function toggleRightsHold')));
 w.eval(source.slice(source.indexOf('$("adminFeedbackView")?.addEventListener'),source.indexOf('$("adminFeedbackFilter")?.addEventListener')));
 const ids=()=>[...w.document.querySelectorAll('.feedbackItem')].map(el=>el.querySelector('p').textContent);
 const change=(id,value)=>{w.$(id).value=value;w.$(id).dispatchEvent(new w.Event('change'));};
 w.renderAdminFeedback();assert.deepEqual(ids(),['tech','oldbug']);
 w.$('adminFeedbackFingerprint').value='old-fingerprint';
 change('adminFeedbackView','quality');assert.deepEqual(ids(),['ok','bad','warn']);
 assert.equal(w.document.querySelector('#syntheticBugOps'),null);
 assert.equal(w.document.querySelectorAll('.feedbackStatus').length,0);
 assert.equal(w.$('adminFeedbackFingerprint').value,'');
 change('adminFeedbackView','all');assert.equal(ids().length,rows.length);
 change('adminFeedbackCategory','screenshot_error');assert.deepEqual(ids(),['image']);
 change('adminFeedbackCategory','ai_question');assert.equal(w.$('adminFeedbackView').value,'quality');
 assert.equal(ids().length,3);
 w.document.querySelector('.relatedTechnicalFeedback').click();
 assert.equal(w.$('adminFeedbackView').value,'technical');assert.equal(w.$('adminFeedbackSearch').value,'SYNTEST');
 assert.equal(w.state.adminFeedback.length,rows.length);assert.equal(writes,0);
 w.close();
});
