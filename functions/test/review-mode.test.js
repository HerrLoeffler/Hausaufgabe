'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const structuredClone=value=>JSON.parse(JSON.stringify(value));
let createReviewService;
try { ({createReviewService}=require('../lib/review-mode')); } catch {}
function setup(projectId='hausaufgabe-staging') {
 const docs=new Map(Object.entries({'users/admin':{role:'admin',status:'active'},'users/teacher':{role:'teacher',status:'active'},'users/other':{role:'teacher'},'reviewMembers/teacher':{enabled:true},'quizzes/mine':{ownerId:'teacher'},'quizzes/theirs':{ownerId:'other'}}));
 const store={transaction:async fn=>fn({get:async k=>structuredClone(docs.get(k)||null),set:(k,v)=>docs.set(k,structuredClone(v)),list:async (collection,{owner,cursor='',limit=100}={})=>[...docs].filter(([k,v])=>k.startsWith(collection+'/')&&k.split('/').length===2&&(!owner||v.authorId===owner)&&k.split('/')[1]>cursor).sort().slice(0,limit).map(([k,v])=>({...structuredClone(v),id:k.split('/')[1]}))})};
 assert.equal(typeof createReviewService,'function','review service exists');
 const service=createReviewService({store,projectId,now:()=>12345});
 return {docs,call:(uid,data)=>service.execute({uid,data})};
}
const note={action:'create',clientRequestId:'note-12345678',text:'Bitte den Text kürzen',target:'hero-title',view:'authView',build:'abc1234',locale:'de',scene:'welcome'};
test('review denies anonymous, ordinary teachers, inactive accounts and production',async()=>{
 const s=setup(); for(const uid of ['', 'other']) await assert.rejects(s.call(uid,note),e=>['unauthenticated','permission-denied'].includes(e.code));
 s.docs.set('users/admin',{role:'admin',status:'suspended'});await assert.rejects(s.call('admin',note),{code:'permission-denied'});
 await assert.rejects(setup('hausaufgabe-40294').call('admin',note),{code:'failed-precondition'});
});
test('teachers cannot grant or approve, and cannot attach a foreign quiz',async()=>{
 const s=setup(); await assert.rejects(s.call('teacher',{action:'grant',memberId:'other',enabled:true}),{code:'permission-denied'});
 await assert.rejects(s.call('teacher',{...note,quizId:'theirs'}),{code:'permission-denied'});
 const {note:n}=await s.call('teacher',{...note,quizId:'mine'});
 await assert.rejects(s.call('teacher',{action:'approve',id:n.id,revision:n.revision,approved:true}),{code:'permission-denied'});
 assert.equal((await s.call('admin',{action:'batch'})).notes.length,0);
});
test('approval binds to content revision; edit resets approval; stale writes conflict',async()=>{
 const s=setup(); let {note:n}=await s.call('teacher',note);
 n=(await s.call('admin',{action:'approve',id:n.id,revision:n.revision,approved:true})).note;
 assert.equal((await s.call('admin',{action:'batch'})).notes.length,1);
 n=(await s.call('teacher',{action:'edit',id:n.id,revision:n.revision,text:'Andere Formulierung'})).note;
 assert.equal(n.approval,'pending');assert.equal((await s.call('admin',{action:'batch'})).notes.length,0);
 await assert.rejects(s.call('teacher',{action:'edit',id:n.id,revision:1,text:'Veraltet'}),{code:'aborted'});
});
test('create is idempotent, differing retry conflicts, revocation blocks reads and replay',async()=>{
 const s=setup();const a=await s.call('teacher',note),b=await s.call('teacher',note);assert.equal(a.note.id,b.note.id);
 assert.equal((await s.call('teacher',{action:'list'})).notes.length,1);
 await assert.rejects(s.call('teacher',{...note,text:'different'}),{code:'already-exists'});
 await s.call('admin',{action:'grant',memberId:'teacher',enabled:false});
 await assert.rejects(s.call('teacher',{action:'list'}),{code:'permission-denied'});
 await assert.rejects(s.call('teacher',note),{code:'permission-denied'});
});
test('teacher sees own notes only; admin workflow needs preview and acceptance evidence',async()=>{
 const s=setup();await s.call('admin',{...note,clientRequestId:'admin-12345678'});let {note:n}=await s.call('teacher',note);
 assert.equal((await s.call('teacher',{action:'list'})).notes.length,1);
 assert.equal((await s.call('admin',{action:'list'})).notes.length,2);
 await assert.rejects(s.call('admin',{action:'transition',id:n.id,revision:n.revision,status:'working'}),{code:'failed-precondition'});
 n=(await s.call('admin',{action:'approve',id:n.id,revision:n.revision,approved:true})).note;
 await assert.rejects(s.call('admin',{action:'transition',id:n.id,revision:n.revision,status:'review'}),{code:'invalid-argument'});
 n=(await s.call('admin',{action:'transition',id:n.id,revision:n.revision,status:'review',evidence:'local build abc1234 geprüft'})).note;
 assert.equal(n.status,'review');assert.equal(n.deployedBuild,'');
});
test('check records require known catalog id, tested build, result and evidence; cannot fake automated pass',async()=>{
 const s=setup();await assert.rejects(s.call('admin',{action:'check',checkId:'GC-TUTORIAL-01',build:'abc',result:'passed'}),{code:'invalid-argument'});
 await assert.rejects(s.call('admin',{action:'check',checkId:'injected',build:'abc',result:'passed',evidence:'checked'}),{code:'invalid-argument'});
 await s.call('teacher',{action:'check',checkId:'GC-TUTORIAL-01',build:'abc',result:'failed',evidence:'Abgabe reagiert nicht',method:'manual'});
 const r=await s.call('teacher',{action:'list'});assert.equal(r.checks[0].result,'failed');assert.equal(r.checks[0].method,'manual');
 await assert.rejects(s.call('teacher',{action:'check',checkId:'GC-TUTORIAL-01',build:'abc',result:'passed',evidence:'test',method:'automated'}),{code:'invalid-argument'});
});
test('admin can list selectable teachers without exposing email or private profile fields',async()=>{
 const s=setup();s.docs.set('users/teacher',{role:'teacher',displayName:'Testlehrkraft',email:'private@example.test',secret:'no'});
 const r=await s.call('admin',{action:'members'});assert.equal(r.members.find(x=>x.id==='teacher').enabled,true);assert.equal(r.members.find(x=>x.id==='teacher').displayName,'Testlehrkraft');assert.equal(JSON.stringify(r).includes('private@'),false);
 await assert.rejects(s.call('teacher',{action:'members'}),{code:'permission-denied'});
});
test('question references must belong to the accessible quiz',async()=>{
 const s=setup();await assert.rejects(s.call('teacher',{...note,quizId:'mine',questionId:'missing'}),{code:'permission-denied'});
 s.docs.set('quizzes/mine/questions/q1',{text:'question'});const r=await s.call('teacher',{...note,quizId:'mine',questionId:'q1'});assert.equal(r.note.questionId,'q1');
});
test('region survives server persistence and malformed or changed replay is rejected',async()=>{
 const s=setup(),region={x:.1,y:.2,width:.3,height:.2,sourceWidth:1000,sourceHeight:800};
 const a=await s.call('admin',{...note,region});assert.deepEqual(a.note.region,region);
 await assert.rejects(s.call('admin',{...note,region:{...region,width:.4}}),{code:'already-exists'});
 for(const bad of [{...region,x:-1},{...region,width:2},{...region,height:0},{...region,x:NaN}])await assert.rejects(s.call('admin',{...note,clientRequestId:'invalid-region',region:bad}),{code:'invalid-argument'});
});

test('visual feedback has its own batch and never mixes general notes or checks',async()=>{
 const s=setup();await s.call('admin',note);const {note:visual}=await s.call('admin',{...note,clientRequestId:'visual-1',area:'visual-feedback'});await s.call('teacher',{...note,clientRequestId:'teacher-visual',area:'visual-feedback'});
 const result=await s.call('admin',{action:'batch',area:'visual-feedback',authorId:'admin'});assert.deepEqual(result.notes.map(n=>n.id),[visual.id]);assert.deepEqual(result.checks,[]);
 const listed=await s.call('admin',{action:'list',area:'visual-feedback',authorId:'admin'});assert.equal(listed.notes.length,1);assert.deepEqual(listed.checks,[]);
 await assert.rejects(s.call('admin',{...note,clientRequestId:'bad-area',area:'technical-mix'}),{code:'invalid-argument'});
 await assert.rejects(s.call('teacher',{action:'list',area:'visual-feedback',authorId:'admin'}),{code:'permission-denied'});
});

test('frame notes arrive in Feedback/Screenshot-Fehler exactly once and old online frames are restored',async()=>{
 const s=setup();const {note:n}=await s.call('admin',{...note,area:'visual-feedback'});const path='feedback/visual-'+n.id;assert.equal(s.docs.get(path).category,'screenshot_error');assert.equal(s.docs.get(path).message,n.text);s.docs.delete(path);const r=await s.call('admin',{action:'syncVisualFeedback'});assert.equal(r.imported,1);s.docs.set(path,{...s.docs.get(path),status:'done'});await s.call('admin',{action:'syncVisualFeedback'});assert.equal(s.docs.get(path).status,'done');await assert.rejects(s.call('teacher',{action:'syncVisualFeedback'}),{code:'permission-denied'});
 const generic=await s.call('admin',{...note,clientRequestId:'generic'});assert.equal(s.docs.has('feedback/visual-'+generic.note.id),false);
});
