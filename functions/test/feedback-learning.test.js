'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const {structuredClone}=globalThis;
let learning={};try{learning=require('../lib/feedback-learning');}catch(e){if(e.code!=='MODULE_NOT_FOUND')throw e;}
const row=(id,owner,verdict='bad',extra={})=>({id,category:'ai_question',userId:owner,testCode:'TEST1234',questionId:id,verdict,reason:'incorrect',subject:'Deutsch',grade:'5',questionSnapshot:{type:'single',text:'PRIVATE QUESTION',acceptedAnswers:['PRIVATE ANSWER'],options:[{text:'PRIVATE OPTION',correct:true}]},createdAt:10,feedbackSchemaVersion:4,...extra});
function approved(r){return {...r,sharedLearning:{...r.sharedLearning,reviewSignature:learning.signalSignature(r)}};}
function fixture(rows){const docs=new Map(rows.map(r=>['feedback/'+r.id,structuredClone(r)]));return {docs,transaction:fn=>fn({get:async p=>structuredClone(docs.get(p)||null),set:(p,v)=>docs.set(p,structuredClone(v))})};}
test('own signals affect the personal guide immediately; unreviewed others never affect shared memory',()=>{
 assert.equal(typeof learning.buildFeedbackLearning,'function');const m=learning.buildFeedbackLearning([row('own','alice'),row('other','bob','good')],{subject:'Deutsch',grade:'5'},'alice');
 assert.equal(m.personal.stats.total,1);assert.equal(m.stats.total,0);assert.match(learning.learningPrompt(m),/persönlich.*1/i);assert.match(learning.learningPrompt(m),/fachlich/);
 assert.equal(JSON.stringify(m).includes('PRIVATE'),false);assert.equal(m.learning.sources[0].id,'own');
});
test('shared memory contains only approved structured signals and never raw tasks/comments/answer keys',()=>{
 const m=learning.buildFeedbackLearning([approved(row('a','bob','good',{sharedLearning:{decision:'approved',revision:1,evidence:'PRIVATE COMMENT'}})),row('b','bob'),row('c','alice','bad',{teacherComment:'PRIVATE COMMENT',reason:''})],{subject:'Deutsch',grade:'5'},'alice');
 assert.equal(m.stats.total,1);assert.equal(m.personal.stats.total,1);assert.equal(JSON.stringify(m).includes('PRIVATE'),false);assert.match(learning.learningPrompt(m),/gemeinsam.*1/i);assert.equal(m.negativeQuestions.length,0);
});
test('latest rating per teacher/question wins; context and withdrawn warnings stay isolated',()=>{
 const entries=[row('old','alice','good',{questionId:'same',createdAt:1}),row('new','alice','bad',{questionId:'same',createdAt:2}),row('math','alice','good',{subject:'Mathematik'}),row('grade','alice','good',{grade:'8'}),row('false','alice','bad',{reviewOutcome:'false_positive'})];
 const m=learning.buildFeedbackLearning(entries,{subject:'Deutsch',grade:'5'},'alice');assert.equal(m.personal.stats.total,1);assert.equal(m.personal.stats.bad,1);assert.deepEqual(m.learning.sources.map(r=>r.id),['new']);
});
test('admin learning review is revision protected and requires evidence without marking anything applied',async()=>{
 const f=fixture([row('a','alice')]);const args={tx:{get:async p=>f.docs.get(p),set:(p,v)=>f.docs.set(p,v)},uid:'admin',now:20,toTimestamp:n=>n};
 await assert.rejects(learning.reviewFeedbackLearning({...args,data:{id:'a',expectedSignature:learning.signalSignature(f.docs.get('feedback/a')),decision:'approved',revision:0,evidence:''}}),{code:'invalid-argument'});
 const r=await learning.reviewFeedbackLearning({...args,data:{id:'a',expectedSignature:learning.signalSignature(f.docs.get('feedback/a')),decision:'approved',revision:0,evidence:'Fachlich geprüft: Antwort stimmt nicht.'}});assert.equal(r.learning.sharedLearningStatus,'approved_pending_use');assert.equal(r.learning.sharedAppliedAt,null);
 await assert.rejects(learning.reviewFeedbackLearning({...args,data:{id:'a',expectedSignature:learning.signalSignature(f.docs.get('feedback/a')),decision:'rejected',revision:0,evidence:'Überholt'}}),{code:'aborted'});
});
test('usage evidence is created only by the executed callback and is idempotent for one generation',async()=>{
 const f=fixture([row('a','alice'),approved(row('b','bob','good',{sharedLearning:{decision:'approved',revision:1}}))]);const m=learning.buildFeedbackLearning([...f.docs.values()],{subject:'Deutsch',grade:'5'},'alice');
 assert.equal(learning.learningProjection(f.docs.get('feedback/a')).personalAppliedAt,null);
 const db={runTransaction:f.transaction};await learning.recordLearningUse(db,m,{uid:'alice',operation:'generateTest',at:30,toTimestamp:n=>n});await learning.recordLearningUse(db,m,{uid:'alice',operation:'generateTest',at:31,toTimestamp:n=>n});
 assert.equal(f.docs.get('feedback/a').learningUse.personal.count,1);assert.equal(f.docs.get('feedback/a').learningUse.personal.at,30);assert.equal(f.docs.get('feedback/b').learningUse.shared.operation,'generateTest');
 const projection=learning.learningProjection(f.docs.get('feedback/b'));assert.equal(projection.sharedLearningStatus,'applied');assert.equal(projection.sharedAppliedAt,30);assert.equal(JSON.stringify(projection).includes('bob'),false);
});
test('account/content/review changes while model runs cannot create a misleading current-signal receipt',async()=>{
 for(const change of ['account','content','review']){const f=fixture([approved(row('a','alice','good',{sharedLearning:{decision:'approved',revision:1}}))]);const m=learning.buildFeedbackLearning([...f.docs.values()],{subject:'Deutsch',grade:'5'},'alice');const r=f.docs.get('feedback/a');if(change==='content')r.questionSnapshot.text='Changed';if(change==='review')r.sharedLearning={decision:'rejected',revision:2};
 await learning.recordLearningUse({runTransaction:f.transaction},m,{uid:change==='account'?'bob':'alice',operation:'regenerateQuestion',at:30,toTimestamp:n=>n});
 if(change==='account'||change==='content')assert.equal(f.docs.get('feedback/a').learningUse?.personal,undefined);if(change==='review'||change==='content')assert.equal(f.docs.get('feedback/a').learningUse?.shared,undefined);
 }
});
test('legacy done is not a processing receipt; later editing invalidates current usage proof',()=>{
 const a=row('a','alice','good',{feedbackSchemaVersion:3,status:'done'});assert.equal(learning.learningProjection(a).personalAppliedAt,null);assert.equal(learning.learningProjection(a).sharedLearningStatus,'pending_review');assert.equal(learning.learningProjection(a).processingEvidence,'legacy_no_prior_evidence');
});
test('shared approval is pinned to the reviewed signal; edited legacy ratings require a fresh review',async()=>{
 const f=fixture([row('a','alice','good')]);await learning.reviewFeedbackLearning({tx:{get:async p=>f.docs.get(p),set:(p,v)=>f.docs.set(p,v)},uid:'admin',now:20,toTimestamp:n=>n,data:{id:'a',expectedSignature:learning.signalSignature(f.docs.get('feedback/a')),decision:'approved',revision:0,evidence:'Struktur geprüft'}});
 assert.equal(learning.buildFeedbackLearning([...f.docs.values()],{},'alice').stats.total,1);f.docs.get('feedback/a').reason='ambiguous';
 assert.equal(learning.buildFeedbackLearning([...f.docs.values()],{},'alice').stats.total,0);assert.equal(learning.learningProjection(f.docs.get('feedback/a')).sharedLearningStatus,'review_outdated');
});
test('newer withdrawal and changed subject supersede older eligible signals before applicability filtering',()=>{
 const a=row('a','alice','bad',{questionId:'same',createdAt:10}),b=row('b','alice','good',{questionId:'same',createdAt:20,reviewOutcome:'false_positive'});
 assert.equal(learning.buildFeedbackLearning([a,b],{},'alice').personal.stats.total,0);b.reviewOutcome='';b.subject='Mathematik';assert.equal(learning.buildFeedbackLearning([a,b],{subject:'Deutsch'},'alice').personal.stats.total,0);
});
test('safe positive structure keeps image and passage presence without transferring their content',()=>{
 const r=row('a','alice','good');r.questionSnapshot.imagePresent=true;r.questionSnapshot.passage='PRIVATE PASSAGE';const m=learning.buildFeedbackLearning([r],{},'alice');assert.match(learning.learningPrompt(m),/mit Aufgabenbild/);assert.match(learning.learningPrompt(m),/mit Textgrundlage/);assert.doesNotMatch(learning.learningPrompt(m),/PRIVATE|ohne Bild/);
});
test('review covers questionType and the exact content displayed, not an unseen later edit',async()=>{
 const f=fixture([row('a','alice','good')]);const args={tx:{get:async p=>f.docs.get(p),set:(p,v)=>f.docs.set(p,v)},uid:'admin',now:20,toTimestamp:n=>n};const displayed=learning.signalSignature(f.docs.get('feedback/a'));
 f.docs.get('feedback/a').reason='ambiguous';await assert.rejects(learning.reviewFeedbackLearning({...args,data:{id:'a',decision:'approved',revision:0,evidence:'Geprüft',expectedSignature:displayed}}),{code:'aborted'});
 const current=learning.signalSignature(f.docs.get('feedback/a'));await learning.reviewFeedbackLearning({...args,data:{id:'a',decision:'approved',revision:0,evidence:'Geprüft',expectedSignature:current}});f.docs.get('feedback/a').questionType='number';assert.equal(learning.learningProjection(f.docs.get('feedback/a')).sharedLearningStatus,'review_outdated');
});
test('late receipt cannot move last-use time backwards and retry cannot count it twice',async()=>{
 const f=fixture([row('a','alice')]),db={runTransaction:f.transaction},older=learning.buildFeedbackLearning([...f.docs.values()],{},'alice'),newer=learning.buildFeedbackLearning([...f.docs.values()],{},'alice');
 await learning.recordLearningUse(db,newer,{uid:'alice',operation:'regenerateQuestion',at:200,toTimestamp:n=>n});await learning.recordLearningUse(db,older,{uid:'alice',operation:'generateTest',at:100,toTimestamp:n=>n});await learning.recordLearningUse(db,older,{uid:'alice',operation:'generateTest',at:100,toTimestamp:n=>n});const use=f.docs.get('feedback/a').learningUse.personal;assert.equal(use.at,200);assert.equal(use.operation,'regenerateQuestion');assert.equal(use.count,2);
});
test('unknown historical media and points never become a false no-image or one-point preference',()=>{
 const r=row('a','alice','good');delete r.questionSnapshot.points;const prompt=learning.learningPrompt(learning.buildFeedbackLearning([r],{},'alice'));assert.doesNotMatch(prompt,/ohne Bild|1 P\./);
});
