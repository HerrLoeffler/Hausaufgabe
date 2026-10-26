'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {observeHelp,projectHelpEvidence}=require('../lib/learning-brain/help-evidence');
const task=(id,prompt=id)=>({id,version:1,prompt,answer:{values:['secret']}});
const start=()=>({id:'private-pupil-session',revision:0,phase:'practice',topic:{id:'topic'},task:task('original'),events:[],unrelated:{preserve:true}});
function step(s,action,outcome,phase,extra={}){
 const n={...s,revision:s.revision+1,phase,...extra};
 return observeHelp(s,n,{action,assessment:outcome?{outcome}:null,now:n.revision*100});
}
function helped(){const s=start();return step(s,'help',null,'help',{originalTask:s.task,task:task('micro'),supportStage:1});}
test('help evidence is private, deterministic, bounded and preserves inputs',()=>{
 const s=start(),n={...s,revision:1,phase:'help',originalTask:s.task};const snapshot=globalThis.structuredClone([s,n]);
 const got=observeHelp(s,n,{action:'question',now:10});
 assert.deepEqual([s,n],snapshot);assert.deepEqual(got.unrelated,s.unrelated);
 assert.equal(got.helpEpisodes[0].requestCount,1);assert.equal(got.helpEpisodes[0].originalCompleted,false);
 assert.deepEqual(got,observeHelp(s,n,{action:'question',now:10}));
 const many={...s,helpEpisodes:Array.from({length:30},(_,i)=>({id:'old'+i}))};
 assert.equal(observeHelp(many,{...many,revision:1,phase:'help',originalTask:s.task},{action:'help',now:10}).helpEpisodes.length,20);
});
test('a supported answer and the original completion remain distinct from independent transfer',()=>{
 let s=helped();s=step(s,'answer','correct','completion',{task:s.originalTask});
 assert.equal(s.helpEpisodes[0].supportedSuccesses,1);assert.equal(s.helpEpisodes[0].status,'supported-success');
 s=step(s,'answer','correct','practice',{originalTask:null,task:task('probe')});
 assert.equal(s.helpEpisodes[0].originalCompleted,true);assert.equal(s.helpEpisodes[0].status,'original-completed-with-help');
 s=step(s,'answer','correct','practice',{task:task('next')});
 assert.equal(s.helpEpisodes[0].status,'promising-transfer');assert.equal(s.helpEpisodes[0].retention,'open');
 assert.equal(projectHelpEvidence([s]).promisingTransfer,1);
});
test('same original, identical fingerprint and prior support do not provide transfer',()=>{
 for(const probe of [task('original','changed'),task('other','original'),task('micro')]){
  let s=helped();s=step(s,'answer','correct','completion',{task:s.originalTask});
  s=step(s,'answer','correct','practice',{task:probe,originalTask:null});
  s=step(s,'answer','correct','practice',{task:task('next')});
  assert.notEqual(s.helpEpisodes[0].status,'promising-transfer');
 }
});
test('repeated help requests flag review without inventing answer failures',()=>{
 let s=helped();s=step(s,'question',null,'help');s=step(s,'help',null,'help');
 assert.equal(s.helpEpisodes[0].requestCount,3);assert.equal(s.helpEpisodes[0].supportedErrors,0);
 assert.equal(s.helpEpisodes[0].reviewNeeded,true);assert.ok(s.helpEpisodes[0].reasonCodes.includes('repeated-help-requests'));
});
test('unclear assessments, technical retry and duplicate calls are neutral',()=>{
 let s=helped();s=step(s,'answer','unclear','help');s=step(s,'retry-next',null,'help');
 assert.equal(s.helpEpisodes[0].supportedErrors,0);assert.equal(s.helpEpisodes[0].reviewNeeded,false);
 const before=s,n={...s,revision:s.revision+1};s=observeHelp(before,n,{action:'help',now:300});
 const duplicate=observeHelp(before,s,{action:'help',now:300});assert.deepEqual(duplicate.helpEpisodes,s.helpEpisodes);
});
test('repeated supported errors and teacher handoff supply explicit review reasons',()=>{
 let s=helped();s=step(s,'answer','incorrect','help',{supportStage:2,task:{...task('micro2'),version:2}});
 s=step(s,'answer','incorrect','teacher',{supportStage:3});
 const e=s.helpEpisodes[0];assert.equal(e.supportedErrors,2);assert.equal(e.reviewNeeded,true);
 assert.ok(e.reasonCodes.includes('repeated-supported-errors'));assert.ok(e.reasonCodes.includes('teacher-handoff'));
 assert.ok(e.helpVersions.some(v=>v.version===2));
});
test('wrong independent probe flags redesign while another session cannot imply retention',()=>{
 let s=helped();s=step(s,'answer','correct','completion',{task:s.originalTask});
 s=step(s,'answer','correct','practice',{originalTask:null,task:task('probe')});
 s=step(s,'answer','incorrect','help',{originalTask:s.task});
 assert.ok(s.helpEpisodes.some(e=>e.reasonCodes.includes('independent-probe-error')));
 const summary=projectHelpEvidence([s,{...start(),task:task('later'),events:[{independent:true,correct:true}]}]);
 assert.equal(summary.retention,'open');assert.equal(summary.causalEffect,'unproven');
});
test('aggregate summary exports counts and fixed reasons, no private text or identifiers',()=>{
 let s=helped();s=step(s,'question',null,'help');s=step(s,'help',null,'help');
 s.helpEpisodes[0].reasonCodes.push('private-question');s.helpEpisodes[0].rawAnswer='private-answer';
 const summary=projectHelpEvidence({privateUid:s}),text=JSON.stringify(summary);
 for(const secret of ['private-pupil-session','privateUid','original','micro','secret','private-question','private-answer','fingerprint'])assert.equal(text.includes(secret),false,secret);
 assert.equal(summary.episodes,1);assert.equal(summary.reviewNeeded,1);assert.equal(summary.reasonCounts['repeated-help-requests'],1);
});
test('generated exact hint snapshot is private, allowlisted and tightly bounded',()=>{
 let s=helped();s.explanation='e'.repeat(500);s.task={...s.task,prompt:'q'.repeat(400),answer:{values:['private-key']},rubric:'private-rubric'};
 s.assistance={version:7,focusIds:[...Array(20)].map((_,i)=>'x'.repeat(90)+i),numberLabels:true,replyTo:'private-pupil-question',rawAnswer:'private-pupil-answer'};
 s.question='private-pupil-question';s.answer='private-pupil-answer';
 const next=observeHelp(s,s,{action:'help-generated',now:100});const e=next.helpEpisodes[0],snapshot=e.lastHelp;
 assert.equal(snapshot.explanation.length,300);assert.equal(snapshot.question.length,240);
 assert.equal(snapshot.focusIds.length,12);assert.ok(snapshot.focusIds.every(id=>id.length<=60));
 assert.equal(snapshot.numberLabels,true);assert.equal(snapshot.version,7);
 const serialized=JSON.stringify(snapshot);
 for(const secret of ['private-key','private-rubric','private-pupil-question','private-pupil-answer','replyTo','answer','rubric'])assert.equal(serialized.includes(secret),false,secret);
 assert.equal(e.requestCount,1);assert.equal(e.supportedSuccesses,0);
 assert.equal(JSON.stringify(projectHelpEvidence([next])).includes('eeee'),false);
});
test('successful hint snapshot persists through completion and later distinct probe',()=>{
 let s=helped();s.explanation='Zähle diese Reihe.';s.assistance={version:2,focusIds:['row:0'],numberLabels:true};
 s=observeHelp(s,s,{action:'help-generated',now:100});const shown=globalThis.structuredClone(s.helpEpisodes[0].lastHelp);assert.equal(shown.explanation,'Zähle diese Reihe.');
 s=step(s,'answer','correct','completion',{task:s.originalTask,explanation:'Versuche die Ausgangsaufgabe.',assistance:null});
 assert.deepEqual(s.helpEpisodes[0].successfulHelp,shown);
 s=step(s,'answer','correct','practice',{originalTask:null,task:task('probe')});
 s=step(s,'answer','correct','practice',{task:task('next')});
 assert.deepEqual(s.helpEpisodes[0].successfulHelp,shown);assert.equal(s.helpEpisodes[0].status,'promising-transfer');
 assert.equal(s.helpEpisodes[0].retention,'open');
});
test('original task is never snapshotted as a hint, including stale explanation',()=>{
 const initial=start();let s=step(initial,'help',null,'help',{originalTask:initial.task,explanation:'stale prior message'});
 s=observeHelp(s,s,{action:'help-generated',now:100});assert.equal(s.helpEpisodes[0].lastHelp,undefined);
 const plain=observeHelp(initial,initial,{action:'help-generated',now:100});assert.equal(plain.helpEpisodes.length,0);
});
test('snapshots keep only the most recent shown and successful hints per episode',()=>{
 let s=helped();
 for(let i=0;i<30;i++){
  s={...s,task:task('hint'+i),explanation:'hint '+i,assistance:{version:i+1,focusIds:[]}};
  s=observeHelp(s,s,{action:'help-generated',now:i});
 }
 const e=s.helpEpisodes[0];assert.equal(e.lastHelp.explanation,'hint 29');assert.equal(e.helpVersions.length,12);assert.equal(e.supportHistoryTruncated,true);
 assert.equal(e.successfulHelp,undefined);assert.equal(Array.isArray(e.lastHelp),false);
});
