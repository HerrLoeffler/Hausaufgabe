import test from 'node:test';import assert from 'node:assert/strict';import {createTeacherAnalytics} from './teacher-analytics-client.mjs';
function harness(){let time=100000;const events=[];const listeners={};const timers=[];const doc={visibilityState:'visible',addEventListener:(k,f)=>listeners[k]=f};const nav={onLine:true};let held=false;
 const locks={request:async(name,options,fn)=>{if(held)return fn(null);held=true;try{return await fn({});}finally{held=false;}}};
 const api=createTeacherAnalytics({send:async e=>{events.push(e);return {ok:true};},doc,nav,clock:()=>time,wall:()=>time,locks,every:f=>{timers.push(f);return timers.length;},cancel:()=>{}});
 return {api,events,doc,nav,listeners,timers,advance:n=>time+=n};}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('opt-in and valid release gate all collection; account reset clears scope',async()=>{const h=harness();h.api.view('editorView');h.api.setSession('one',{role:'teacher'});h.api.setRelease('a'.repeat(40));await settle();assert.equal(h.events.length,0);
 h.api.setSession('one',{role:'teacher',analyticsConsent:true});await settle();assert.equal(h.events[0].event,'session_started');
 h.advance(30000);h.timers.at(-1)();await settle();assert.equal(h.events.find(e=>e.event==='activity_summary').activeMs,30000);
 h.api.setSession(null,null);h.api.operation('save');await settle();assert.equal(h.events.filter(e=>e.event==='operation_finished').length,0);});
test('offline and student views never contribute active time',async()=>{const h=harness();h.api.setRelease('a'.repeat(40));h.api.view('editorView');h.api.setSession('one',{role:'teacher',analyticsConsent:true});await settle();h.nav.onLine=false;h.advance(30000);h.timers.at(-1)();await settle();assert.equal(h.events.filter(e=>e.event==='activity_summary').length,0);
 h.api.view('studentView');h.nav.onLine=true;h.api.operation('save');await settle();assert.equal(h.events.filter(e=>e.event==='operation_finished').length,0);});
test('parallel AI requests remain wait time until the last request settles',async()=>{const h=harness();h.api.setRelease('a'.repeat(40));h.api.view('editorView');h.api.setSession('one',{role:'teacher',analyticsConsent:true});await settle();h.api.waiting(true);h.api.waiting(true);h.advance(10000);h.api.waiting(false);h.advance(20000);h.timers.at(-1)();await settle();const e=h.events.find(e=>e.event==='activity_summary');assert.equal(e.activeMs,0);assert.equal(e.foregroundAiWaitMs,30000);h.api.setSession(null,null);});
