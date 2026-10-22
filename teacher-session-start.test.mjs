import test from 'node:test';import assert from 'node:assert/strict';
test('teacher start uses a transaction, starts the selected run once and never resets its clock',async()=>{
 let m;try{m=await import('./teacher-session-start.mjs');}catch{}assert.equal(typeof m?.startTeacherSessionOnce,'function');let quiz={published:true,ended:false,startMode:'teacher',sessionState:'waiting',sessionRunId:'run_a'},writes=0,clock=100;
 const tx={get:async()=>({exists:()=>true,data:()=>({...quiz})}),update:(ref,patch)=>{quiz={...quiz,...patch};writes++;}};
 const args={db:{},reference:{},expectedRunId:'run_a',runTransaction:async(db,fn)=>fn(tx),serverTimestamp:()=>++clock};
 assert.equal(await m.startTeacherSessionOnce(args),'started');const start=quiz.sessionStartedAt;assert.equal(await m.startTeacherSessionOnce(args),'already-running');assert.equal(writes,1);assert.equal(quiz.sessionStartedAt,start);quiz.sessionRunId='run_b';await assert.rejects(m.startTeacherSessionOnce(args),/changed/);quiz.sessionRunId='run_a';quiz.ended=true;await assert.rejects(m.startTeacherSessionOnce(args),/closed/);assert.equal(writes,1);
});
