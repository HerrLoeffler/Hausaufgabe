'use strict';
const assert=require('node:assert/strict');
const {login,PROJECT}=require('../visual-pilot/access.cjs');
const {mixedDeck,mixedCode}=require('./mix.cjs');
const {core,parseVisualTask}=require('../../functions/lib/visual-task');

(async()=>{
  const token=await login();
  async function call(data,authenticated=true){
    const headers={'Content-Type':'application/json'};
    if(authenticated)headers.Authorization='Bearer '+token;
    const response=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{
      method:'POST',headers,body:JSON.stringify({data}),signal:AbortSignal.timeout(30000)});
    const body=await response.json();
    if(body.error)throw Error(body.error.status);
    return body.result;
  }
  await assert.rejects(call({action:'list',quizId:mixedCode},false),/UNAUTHENTICATED/);
  const prior=await Promise.all([{},...[2,3,4,5].map(n=>({quizId:'REMYRND'+n}))].map(scope=>call({action:'list',...scope})));
  const earlierDeckSizes=prior.map(x=>x.tasks.length);
  assert.deepEqual(earlierDeckSizes,[30,12,3,3,2]);
  assert.equal(prior[0].tasks[0].review.verdict,'bad');
  assert.equal(prior[1].tasks[0].review.verdict,'good');
  const {tasks}=await call({action:'list',quizId:mixedCode});
  assert.deepEqual(tasks.map(q=>q.id),mixedDeck.map(({q})=>q.id));
  const cases=[];
  for(let i=0;i<tasks.length;i+=4){
    const batch=await Promise.all(tasks.slice(i,i+4).map(async(task,j)=>{
      const {q,recipe}=mixedDeck[i+j];
      const scope={quizId:task.quizId,id:task.id,version:task.version};
      assert.equal(task.text,q.text);
      assert.equal(task.points,q.points);
      assert.doesNotMatch(JSON.stringify(task),/"(?:solution|accepted)":/);
      const answer=q.type==='visual'?core.solutionResponse(parseVisualTask(q.visualTask,{points:q.points})):
        q.type==='diagram'?Object.fromEntries(q.fields.map(f=>[f.id,f.accepted[0]])):q.solution;
      const [full,blank]=await Promise.all([answer,{}].map(answer=>call({action:'score',...scope,answer})));
      assert.equal(full.points,q.points,q.id);
      assert.equal(blank.points,0,q.id);
      if(q.id==='mix-bruecke'){
        const reverse=await call({action:'score',...scope,answer:answer.toReversed()});
        assert.equal(reverse.points,q.points);
      }
      if(q.type==='rhythm'){
        const audio=await call({action:'listenRhythm',...scope});
        const wav=Buffer.from(audio.audioBase64,'base64');
        assert.equal(wav.toString('ascii',0,4),'RIFF');
        assert.equal(wav.toString('ascii',8,12),'WAVE');
        assert.ok(wav.length>1000);
      }
      return {id:q.id,recipe,full:full.points,blank:blank.points,...(q.type==='rhythm'?{wav:true}:{})};
    }));
    cases.push(...batch);
  }
  console.log(JSON.stringify({at:new Date().toISOString(),earlierDeckSizes,syntheticRatingsPreserved:true,anonymousDenied:true,cases},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
