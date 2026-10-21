'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {cleanTeacherEvent,creditActivity,teacherChannel}=require('../lib/teacher-analytics-core');
const event={id:'00000000-0000-4000-8000-000000000001',event:'activity_summary',release:'a'.repeat(40),platform:'web',at:100000,elapsedMs:30000,activeMs:20000,foregroundAiWaitMs:5000};
test('strict teacher contract rejects content, future, stale, oversized and invalid totals',()=>{
 assert.equal(cleanTeacherEvent(event,100000).activeMs,20000);
 for(const patch of [{text:'private'},{at:200000},{at:0},{activeMs:30001},{foregroundAiWaitMs:20000},{platform:'student'}])assert.throws(()=>cleanTeacherEvent({...event,...patch},100000));
});
test('server shared activity budget limits replay and simultaneous devices',()=>{
 const a=creditActivity(event,{lastAt:70000},100000);assert.equal(a.activeMs,20000);assert.equal(a.foregroundAiWaitMs,5000);
 const b=creditActivity(event,{lastAt:100000},100000);assert.equal(b.activeMs,0);assert.equal(b.foregroundAiWaitMs,0);
 assert.equal(creditActivity(event,null,100000).activeMs,0);
});
test('only active opted-in teacher population can enter school denominator',()=>{
 assert.equal(teacherChannel({role:'teacher',analyticsConsent:true},'hausaufgabe-staging'),'school');
 assert.equal(teacherChannel({role:'teacher',analyticsConsent:true,isTestAccount:true},'hausaufgabe-staging'),'internal');
 assert.equal(teacherChannel({role:'admin',analyticsConsent:true},'hausaufgabe-staging'),'internal');
 assert.equal(teacherChannel({role:'student',analyticsConsent:true},'hausaufgabe-staging'),null);
 assert.equal(teacherChannel({role:'teacher'},'hausaufgabe-staging'),null);
});
test('client cannot forge server lifecycle or usage; server can project bounded values',()=>{
 assert.throws(()=>cleanTeacherEvent({...event,event:'test_published'},100000));
 assert.throws(()=>cleanTeacherEvent({...event,totalTokens:12},100000));
 assert.equal(cleanTeacherEvent({...event,event:'test_published',platform:'server',entityId:'QUIZ123'},100000,{server:true}).event,'test_published');
});
