import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {JSDOM}=require('./tools/ui/node_modules/jsdom');
const source=fs.readFileSync('gradecrew-tour.js','utf8');const app=fs.readFileSync('app.js','utf8');
function fn(name){let start=app.indexOf(`function ${name}(`);assert.ok(start>=0);if(app.slice(start-6,start)==='async ')start-=6;return app.slice(start,app.indexOf('\n}',start)+2);}
function fixture(t){
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://example.test',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;t.after(()=>w.close());
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 w.HTMLElement.prototype.scrollIntoView=function(){};w.CSS={escape:s=>s};w.scrollTo=()=>{};
 w.eval(source.replace(/^export /gm,'')+'\nwindow.demo=DEMO_TEST;window.install=installCrewTour;window.response=preparedResponse;');
 return w;
}
function coach(w){return w.document.querySelector('.gcRealCoach');}
function next(w){const b=w.document.querySelector('.gcWelcomeStart,.gcCoachNext');assert.ok(b,'next button');b.click();}
function adapter(w){let uid='teacher-a';const calls=[];return {calls,uid:()=>uid,setUid:v=>uid=v,isDashboard:()=>true,beginRun:()=>calls.push('begin'),prefill:()=>calls.push('prefill'),createDemo:async()=>{calls.push('persist');return 'DEMO1';},openEditor:async()=>calls.push('editor'),isEditor:()=>true,questionId:()=> 'tutorial-4',focusQuestion:()=>{},showSettings:()=>{},checkDemo:()=>null,focusReviewLast:()=>{}};}
async function enterEditor(w,tour,api){
 const pending=[];w.setTimeout=(fn,ms)=>{pending.push({fn,ms});return pending.length};w.clearTimeout=()=>{};
 tour.dashboard({uid:api.uid(),firstVisit:false});w.document.getElementById('gradecrewTourBtn').click();next(w);next(w);
 tour.notify('view',{id:'createView'});tour.notify('view',{id:'aiView'});
 const creation=tour.create();await Promise.resolve();assert.equal(pending[0].ms,3000);assert.ok(!api.calls.includes('editor'));pending[0].fn();await creation;
}
test('Welcome shows all four smiling crew members then Coco personally introduces the real tour',t=>{
 const w=fixture(t),api=adapter(w),tour=w.install(api);tour.dashboard({uid:api.uid(),firstVisit:false});w.document.getElementById('gradecrewTourBtn').click();
 assert.equal(w.document.querySelectorAll('.gcWelcomeLineup img[src$="-welcome.svg"]').length,4);next(w);assert.match(coach(w).textContent,/Hallo, ich bin Coco/);assert.equal(w.document.querySelector('.gcCrewWelcome'),null);
});
test('Prepared test has exactly ten tasks, three local images and one minute',t=>{
 const w=fixture(t);assert.equal(w.demo.questions.length,10);assert.equal(w.demo.timeLimitMinutes,1);assert.equal(w.demo.questions.reduce((a,q)=>a+q.points,0),10);
 const pics=w.demo.questions.filter(q=>q.imageUrl);assert.equal(pics.length,3);pics.forEach(q=>assert.ok(fs.existsSync('.'+q.imageUrl)));assert.equal(w.demo.questions.at(-1).manualReview,true);
});
test('Full real-UI journey waits for persistence and successful actions; owl only evaluates the actual submission',async t=>{
 const w=fixture(t),api=adapter(w),tour=w.install(api);await enterEditor(w,tour,api);assert.deepEqual(api.calls,['begin','prefill','persist','editor']);assert.match(coach(w).textContent,/Emmi/);assert.ok(tour.ownsQuiz('DEMO1'));
 next(w);tour.notify('edited',{quizId:'DEMO1'});tour.notify('variants-ready',{quizId:'DEMO1'});tour.notify('variants-applied',{quizId:'DEMO1'});tour.notify('question-deleted',{quizId:'DEMO1',questionId:'tutorial-4'});next(w);
 tour.notify('published',{quizId:'DEMO1'});tour.notify('student-ready',{quizId:'DEMO1'});assert.match(coach(w).textContent,/Kürzel/);tour.notify('student-started',{quizId:'DEMO1'});assert.equal(coach(w),null);
 tour.notify('submitted',{quizId:'OTHER',submissionId:'fake'});assert.equal(coach(w),null);
 tour.notify('submitted',{quizId:'DEMO1',submissionId:'real-abgabe'});assert.match(coach(w).textContent,/gespeichert/);assert.doesNotMatch(coach(w).textContent,/Wilma.*Bewerten/);
 tour.notify('results-ready',{quizId:'DEMO1'});assert.match(coach(w).textContent,/Hallo, ich bin Wilma/);
 tour.notify('review-opened',{quizId:'DEMO1',submissionId:'real-abgabe'});tour.notify('review-saved',{quizId:'DEMO1',submissionId:'real-abgabe'});assert.match(coach(w).textContent,/Geschafft/);next(w);assert.equal(tour.active,false);assert.equal(w.localStorage.getItem('gradecrew-live-tour-v3:teacher-a'),'done');
});
test('Leaving or changing account during preparation cannot reopen an editor',async t=>{
 const w=fixture(t),api=adapter(w),tour=w.install(api);let resolve;api.createDemo=()=>new Promise(r=>resolve=r);const timers=[];w.setTimeout=(f)=>{timers.push(f);return 1};w.clearTimeout=()=>{};
 tour.dashboard({uid:api.uid(),firstVisit:true});next(w);next(w);tour.notify('view',{id:'createView'});tour.notify('view',{id:'aiView'});const p=tour.create();tour.stop();resolve('DEMO1');timers[0]();await p;assert.ok(!api.calls.includes('editor'));assert.equal(coach(w),null);
});
test('Core persists tutorial questions with images and a one-minute test; no fake results',async t=>{
 const w=fixture(t),writes=[];Object.assign(w,{state:{user:{uid:'a'}},crewTour:{creating:true},tutorialDraft:null,isSuspended:()=>false,createQuizDocument:async base=>{writes.push(base);return {code:'DEMO'}},quizDefaults:()=>({ownerId:'a',published:false}),deepClone:x=>JSON.parse(JSON.stringify(x)),writeBatch:()=>({set:(ref,data)=>writes.push(data),update:()=>{},commit:async()=>{}}),db:{},doc:(...x)=>x.join('/'),serverTimestamp:()=>123,round1:n=>n,orderingNeedsReview:()=>false,validOrder:()=>true});
 w.eval(fn('sanitizeQuestionForSave')+'\n'+fn('createTutorialQuiz'));assert.equal(await w.createTutorialQuiz(w.demo),'DEMO');assert.equal(writes[0].timeLimitMinutes,1);assert.equal(writes.length,11);assert.equal(writes.slice(1).filter(q=>q.imageUrl).length,3);assert.ok(writes.slice(1).every(q=>q.aiOrigin.kind==='tutorial'));
});
test('The actual countdown auto-submits once at sixty seconds, never on first tick',t=>{
 const w=fixture(t);let clock=1000, tick, submits=0;w.Date.now=()=>clock;Object.assign(w,{$:id=>w.document.getElementById(id),state:{},stopStudentTimer:()=>{},toast:()=>{},submitStudentQuiz:(e,q,questions,opts)=>{submits++;assert.equal(opts.autoSubmitted,true);assert.equal(opts.force,true)}});w.setInterval=f=>{tick=f;return 1};w.eval(fn('runStudentTimer'));w.runStudentTimer({timeLimitMinutes:1},[],1000);assert.equal(submits,0);clock=60000;tick();assert.equal(submits,0);clock=61000;tick();tick();assert.equal(submits,1);
});
test('Coach has no replacement student controls, fake score, global DOM observer or click blocker',()=>{
 assert.doesNotMatch(source,/MutationObserver|stopImmediatePropagation|<input|<select|<textarea|evaluateAnswer|addDoc/);
 assert.match(app,/const submissionRef = await addDoc/);assert.match(app,/crewTour\?\.notify\("submitted", \{quizId: quiz.id, submissionId: submissionRef.id\}\)/);
});
test('Real student renderer uses ten question widgets, three images and a gated one-minute timer',t=>{
 const w=fixture(t);const events=[];Object.assign(w,{$:id=>w.document.getElementById(id),stopStudentTimer:()=>{},clearStudentSubscriptions:()=>{},readStoredTimer:()=>null,escapeHtml:v=>String(v).replaceAll('"','&quot;'),round1:n=>n,setupStudentProgress:()=>{},crewTour:{notify:(event)=>events.push(event)},startTimedStudentQuiz:()=>{},refreshStudentProgress:()=>{}});
 w.eval(['studentOptionEntries','shuffled','renderGapfillStudent','renderOrderingStudent','getQuestionImageSrc','renderStudentQuiz'].map(fn).join('\n'));
 const questions=w.demo.questions.map((q,i)=>({...q,id:`q${i}`}));w.renderStudentQuiz({...w.demo,id:'DEMO',startMode:'student'},questions);
 assert.equal(w.document.querySelectorAll('.studentQuestion').length,10);assert.equal(w.document.querySelectorAll('.studentQuestionImage img').length,3);assert.equal(w.document.querySelectorAll('.inlineGap').length,1);assert.equal(w.document.querySelectorAll('.sortItem').length,3);
 assert.ok(w.$('studentQuestions').classList.contains('hidden'));assert.equal(w.$('studentTimerText').textContent,'01:00');assert.match(w.$('studentName').closest('.studentIdentityCard').textContent,/Kürzel/);assert.deepEqual(events,['student-ready']);
});
test('Actual submission writes real answers and emits transition only after the backend confirms it',async t=>{
 const w=fixture(t),writes=[],events=[];w.document.body.insertAdjacentHTML('beforeend','<form id="studentForm"><input id="studentName" value="ML"><button id="studentSubmitBtn"></button></form>');let finish;
 Object.assign(w,{$:id=>w.document.getElementById(id),state:{studentAttempt:{attemptId:'attempt-a',startedAt:1000}},studentSubmissionBusy:new Set(),completedStudentSubmissions:new Set(),readStoredTimer:()=>null,readStudentAnswer:()=> 'blue',evaluateAnswer:()=>({awarded:1,max:1,needsReview:false}),round1:n=>n,deepClone:x=>x,getQuizScale:()=>({name:'Standard'}),gradeFromPercent:()=>1,studentTimerKey:id=>id,stopStudentTimer:()=>{},db:{},collection:(...x)=>x,serverTimestamp:()=>1,addDoc:(ref,data)=>{writes.push({ref,data});return new Promise(resolve=>finish=resolve)},clearStudentSubscriptions:()=>{},renderStudentResult:()=>{},toast:()=>{},crewTour:{notify:(e,data)=>events.push({e,data})}});
 w.eval(fn('submitStudentQuiz'));const quiz={id:'DEMO',timeLimitMinutes:1,tutorialVersion:'v3'},questions=[{id:'q1'}];
 const pending=w.submitStudentQuiz(null,quiz,questions,{force:true,autoSubmitted:true});assert.equal(events.length,0);await w.submitStudentQuiz(null,quiz,questions,{force:true});assert.equal(writes.length,1);finish({id:'saved-submission'});await pending;
 assert.equal(writes[0].data.answers.q1,'blue');assert.equal(writes[0].data.autoSubmitted,true);assert.equal(writes[0].data.isTutorial,true);assert.equal(events[0].data.submissionId,'saved-submission');await w.submitStudentQuiz(null,quiz,questions,{force:true});assert.equal(writes.length,1);
});
test('Failed submission stays on the real form and is retryable without advancing the tour',async t=>{
 const w=fixture(t),events=[];w.document.body.insertAdjacentHTML('beforeend','<form id="studentForm"><input id="studentName" value="ML"><button id="studentSubmitBtn"></button></form>');
 Object.assign(w,{$:id=>w.document.getElementById(id),state:{studentAttempt:null},studentSubmissionBusy:new Set(),completedStudentSubmissions:new Set(),readStoredTimer:()=>null,round1:n=>n,deepClone:x=>x,getQuizScale:()=>({}),gradeFromPercent:()=>1,stopStudentTimer:()=>{},db:{},collection:()=>{},serverTimestamp:()=>1,addDoc:async()=>{throw Error('offline')},toast:()=>{},crewTour:{notify:e=>events.push(e)}});w.console.error=()=>{};w.eval(fn('submitStudentQuiz'));
 await w.submitStudentQuiz(null,{id:'DEMO'},[],{force:true});assert.equal(events.length,0);assert.equal(w.studentSubmissionBusy.size,0);assert.equal(w.$('studentSubmitBtn').disabled,false);assert.notEqual(w.$('studentForm').dataset.submitted,'true');
});
test('Hidden native delete action is revealed before highlighting it',async t=>{
 const w=fixture(t),api=adapter(w),tour=w.install(api);
 const card=w.document.getElementById('questionTemplate').content.firstElementChild.cloneNode(true);card.dataset.id='tutorial-4';w.document.getElementById('questionList').append(card);
 await enterEditor(w,tour,api);next(w);tour.notify('edited',{quizId:'DEMO1'});tour.notify('variants-applied',{quizId:'DEMO1'});await Promise.resolve();
 assert.equal(card.querySelector('details').open,true);assert.ok(card.querySelector('.deleteQuestion').classList.contains('gcTourTarget'));
});
