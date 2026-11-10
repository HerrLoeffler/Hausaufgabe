'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {login,PROJECT}=require('../visual-pilot/access.cjs');
const root='docs/evidence/remy-mehrfeld30-20261109/pitch/';
const cases={
  single:['bc2fa93c-1602-45c8-94f9-24b88c297861','Eine leichte Aufgabe für Klasse 5: Die Kinder setzen G und A einzeln auf die richtige Linie oder in den richtigen Zwischenraum im Violinschlüssel. Bitte mit einem Orientierungshinweis.',['G','A'],[2,3]],
  sequence:['bc2fa93c-1602-45c8-94f9-24b88c297862','Lass meine Klasse eine ganze Tonfolge im Violinschlüssel eintragen. Fünf Töne in der Reihenfolge A4, G4, H4, C5, G4. Schwieriger, ohne Hinweis auf die unterste Linie.',['A','G','H','C','G'],[3,2,4,5,2]]
};
const save=(name,data)=>fs.writeFileSync(root+name+'.json',JSON.stringify(data,null,2)+'\n');
(async()=>{
  const token=await login();
  async function call(data){
    const response=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
      body:JSON.stringify({data}),signal:AbortSignal.timeout(85000)});
    const body=await response.json();
    if(body.error)throw Error(body.error.message);
    return body.result;
  }
  const mode=process.argv[2];
  if(mode==='baseline'){
    const decks=await Promise.all([{}, ...[2,3,4,5].map(n=>({quizId:'REMYRND'+n}))].map(scope=>call({action:'list',...scope})));
    assert.deepEqual(decks.map(x=>x.tasks.length),[30,12,3,3,2]);
    assert.equal(decks[0].tasks[0].review.verdict,'bad');
    assert.equal(decks[1].tasks[0].review.verdict,'good');
    const q=decks[3].tasks[2];
    const fields={quizId:q.quizId,id:q.id,version:q.version};
    const a=await call({action:'listenRhythm',...fields});
    const wav=Buffer.from(a.audioBase64,'base64'),beat=60/94;
    const from=44+Math.round((4*beat+.1)*8000),to=from+800;
    let cycles=0;
    for(let i=from+1;i<to;i++)if(wav[i-1]<128&&wav[i]>=128)cycles++;
    assert.ok(cycles>=25&&cycles<=28,String(cycles));
    const score=await call({action:'score',...fields,answer:{g0:'r2',g1:'n1'}});
    assert.equal(score.points,1);
    save('rhythm-feedback',{at:new Date().toISOString(),earlierDeckSizes:[30,12,3,3,2],syntheticRatingsPreserved:true,
      rhythmReference:{id:q.id,version:q.version,frequencyApproxHz:cycles*10,fullScore:score.points,missingCueCount:a.cues.length}});
    console.log('Alte Stapel erhalten; Rhythmus mit weicherem Grundton korrekt bewertet.');
    return;
  }
  if(!cases[mode])throw Error('Unbekannter Probewunsch');
  const [requestId,wish,labels,positions]=cases[mode];
  if(!fs.existsSync(root+mode+'.json'))save(mode,{requestId,wish,status:'dispatching'});
  const result=await call({action:'generateRecipe',requestId,wish});
  const receipt={requestId,wish,...result};save(mode,receipt);
  if(result.status!=='ready')throw Error(mode+' '+result.status+' '+result.message);
  const {tasks}=await call({action:'list',quizId:result.quizId});
  assert.equal(tasks.length,1);
  const task=tasks[0];receipt.task=task;save(mode,receipt);
  assert.equal(task.type,'pitch');
  assert.equal(task.pitch.guided,mode==='single');
  assert.ok(!Object.hasOwn(task.pitch,'solution'));
  assert.ok(task.pitch.notes.every(n=>!Object.hasOwn(n,'position')));
  assert.deepEqual(task.pitch.notes.map(n=>n.label),labels);
  const fields={quizId:task.quizId,id:task.id,version:task.version};
  const answer=Object.fromEntries(task.pitch.notes.map((n,i)=>[n.id,positions[i]]));
  const full=await call({action:'score',...fields,answer});
  assert.equal(full.points,task.points);
  const first=task.pitch.notes[0].id;
  const partial=await call({action:'score',...fields,answer:{...answer,[first]:answer[first]+1}});
  assert.equal(partial.points,task.points-.5);
  const blank=await call({action:'score',...fields,answer:{}});
  assert.equal(blank.points,0);
  const replay=await call({action:'generateRecipe',requestId,wish});
  assert.equal(replay.quizId,result.quizId);assert.equal(replay.status,'ready');
  save(mode,{...receipt,verified:{labels,positions,full:full.points,wrongAdjacentPosition:partial.points,blank:blank.points,stableIdReplayed:true}});
  console.log(mode+' · '+labels.join('–')+' · '+full.points+' Punkte');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
