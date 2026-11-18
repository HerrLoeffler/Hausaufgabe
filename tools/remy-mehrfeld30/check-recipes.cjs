'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {login,PROJECT}=require('../visual-pilot/access.cjs');
const dest='docs/evidence/remy-mehrfeld30-20261109/recipes/';
const cases={
  sources:['034aac69-526e-4595-a72c-b8891b09d141','Meine siebte Klasse soll an drei kurzen erfundenen Quellen über einen historischen Hafen erkennen, welche Aussage sich wirklich belegen lässt. Die Themen sollen Abfahrt, Handel und Eintritt sein.'],
  maze:['034aac69-526e-4595-a72c-b8891b09d142','Für Klasse 6: Zwei unterschiedliche Bilder eines Roboter-Labyrinths, jeweils mit einer eindeutigen Blickrichtung. Wenn vor ihm eine Wand ist, dreht er sich nach links, sonst geht er einen Schritt.'],
  music:['034aac69-526e-4595-a72c-b8891b09d143','Für Klasse 6 möchte ich drei verschiedene unvollständige 3/4-Takte. Die Kinder setzen je eine Achtel-, Viertel- oder halbe Note ein. Bitte nutze unterschiedliche fehlende Notenwerte.']
};
const save=(name,v)=>fs.writeFileSync(dest+name+'.json',JSON.stringify(v,null,2)+'\n');
(async()=>{
  const token=await login();
  async function call(data){
    const res=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{
      method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
      body:JSON.stringify({data}),signal:AbortSignal.timeout(85000)});
    const body=await res.json();
    if(body.error)throw Error(body.error.message);
    return body.result;
  }
  const mode=process.argv[2];
  if(mode==='baseline'){
    const seeds=await Promise.all([call({action:'list'}),call({action:'list',quizId:'REMYRND2'}),call({action:'list',quizId:'REMYRND3'})]);
    assert.deepEqual(seeds.map(x=>x.tasks.length),[30,12,3]);
    assert.equal(seeds[0].tasks[0].review.verdict,'bad');
    assert.equal(seeds[1].tasks[0].review.verdict,'good');
    console.log('Erste Runden und synthetische Urteile erhalten');
    return;
  }
  if(mode==='source-score'){
    const src=JSON.parse(fs.readFileSync(dest+'sources.json'));
    const task=src.task;
    const ids=process.argv.slice(3).map(Number);
    assert.equal(ids.length,task.recipe.sources.length);
    const answer=Object.fromEntries(task.recipe.sources.map((s,i)=>[s.id,task.recipe.claims[ids[i]-1].id]));
    const result=await call({action:'score',quizId:task.quizId,id:task.id,version:task.version,answer});
    assert.equal(result.points,task.points);
    delete answer[Object.keys(answer)[0]];
    const partial=await call({action:'score',quizId:task.quizId,id:task.id,version:task.version,answer});
    assert.equal(partial.points,task.points-.5);
    save('sources',{...src,verified:{complete:result.points,partial:partial.points,method:'human read of public source snippets and claims'}});
    console.log('sources '+result.points+' '+partial.points);
    return;
  }
  const spec=cases[mode];
  if(!spec)throw Error('Nicht erlaubte Probe');
  const [requestId,wish]=spec;
  const saved=fs.existsSync(dest+mode+'.json')?JSON.parse(fs.readFileSync(dest+mode+'.json')):null;
  if(saved?.requestId&&saved.requestId!==requestId)throw Error('Auftrag stimmt nicht überein');
  if(!saved)save(mode,{requestId,wish,status:'dispatching'});
  const result=await call({action:'generateRecipe',requestId,wish});
  const receipt={requestId,wish,...result};
  save(mode,receipt);
  if(result.status!=='ready')throw Error(mode+' '+result.status+' '+result.message);
  const deck=await call({action:'list',quizId:result.quizId});
  assert.equal(deck.tasks.length,1);
  const task=deck.tasks[0];
  receipt.task=task;save(mode,receipt);
  assert.equal(task.recipe.recipe,mode);
  assert.ok(!Object.hasOwn(task.recipe,'solution'));
  const fields={quizId:task.quizId,id:task.id,version:task.version};
  const blank=await call({action:'score',...fields,answer:{}});
  assert.equal(blank.points,0);
  const replay=await call({action:'generateRecipe',requestId,wish});
  assert.equal(replay.quizId,result.quizId);
  assert.equal(replay.status,'ready');
  if(mode==='sources'){console.log(mode+' '+task.heading);return;}
  const recipe=task.recipe;
  const answer=mode==='maze'?Object.fromEntries(recipe.boards.map(b=>{
    const [dx,dy]={'↑':[0,-1],'→':[1,0],'↓':[0,1],'←':[-1,0]}[b.arrow];
    return [b.id,b.cells[b.y+dy][b.x+dx]==='#'?'turn':'forward'];
  })):Object.fromEntries(recipe.bars.map(b=>[b.id,recipe.meter*2-b.notes.reduce((s,n)=>s+n,0)]));
  const complete=await call({action:'score',...fields,answer});
  assert.equal(complete.points,task.points);
  delete answer[Object.keys(answer)[0]];
  const partial=await call({action:'score',...fields,answer});
  assert.equal(partial.points,task.points-.5);
  save(mode,{...receipt,verified:{complete:complete.points,partial:partial.points,blank:blank.points,stableIdReplayed:true}});
  console.log(mode+' '+task.heading+' '+complete.points+' '+partial.points);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
