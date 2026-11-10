'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {login,PROJECT}=require('../visual-pilot/access.cjs');
const dest='docs/evidence/remy-mehrfeld30-20261109/rhythm/';
const cases={
  pause:['bc2fa93c-1602-45c8-94f9-24b88c297851','Meine Klasse 6 soll einen 3/4-Takt hören. Leichte Hörstufe mit sichtbaren Noten und leisem Zählpuls. Genau eine Lücke, eine Viertelpause am Anfang des Takts.'],
  diktat:['bc2fa93c-1602-45c8-94f9-24b88c297852','Erstelle ein schweres Rhythmusdiktat zum Hören für Klasse 8 im 4/4-Takt. Alle vorgegebenen Notenwerte ausblenden, kein Zählpuls im Takt nach dem Einzähler. Zwei Lücken, eine Viertelnote und eine Achtelpause.']
};
const save=(name,data)=>fs.writeFileSync(dest+name+'.json',JSON.stringify(data,null,2)+'\n');
function hear(wav,at,bpm){
  const size=wav.readUInt32LE(40),rate=wav.readUInt32LE(24),tick=30/bpm,window=.008;
  const loud=seconds=>{
    const start=44+Math.round(seconds*rate);
    const end=Math.min(44+size,start+Math.round(window*rate));
    for(let i=start;i<end;i++)if(Math.abs(wav[i]-128)>26)return true;
    return false;
  };
  const max=size/rate;
  const startsWithNote=loud(at+.035);
  let end=at+.035;
  while(end<max&&loud(end)===startsWithNote)end+=window;
  const length=Math.round((end-at)/(tick*(startsWithNote?.88:1)));
  assert.ok([1,2,4].includes(length));
  return (startsWithNote?'n':'r')+length;
}
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
  const key=process.argv[2];
  if(key==='baseline'){
    const decks=await Promise.all([{}, {quizId:'REMYRND2'}, {quizId:'REMYRND3'}, {quizId:'REMYRND4'}].map(scope=>call({action:'list',...scope})));
    assert.deepEqual(decks.map(x=>x.tasks.length),[30,12,3,3]);
    assert.equal(decks[0].tasks[0].review.verdict,'bad');assert.equal(decks[1].tasks[0].review.verdict,'good');
    console.log('Alle vier Runden, gespeicherte Alturteile erhalten.');
    return;
  }
  if(!cases[key])throw Error('Unbekannter Probewunsch');
  const [requestId,wish]=cases[key];
  if(!fs.existsSync(dest+key+'.json'))save(key,{requestId,wish,status:'dispatching'});
  const result=await call({action:'generateRecipe',requestId,wish});
  const receipt={requestId,wish,...result};save(key,receipt);
  if(result.status!=='ready')throw Error(key+' '+result.status+' '+result.message);
  const {tasks}=await call({action:'list',quizId:result.quizId});
  assert.equal(tasks.length,1);
  const task=tasks[0];receipt.task=task;save(key,receipt);
  assert.equal(task.type,'rhythm');
  assert.equal(task.rhythm.meter,key==='pause'?3:4);
  assert.ok(!Object.hasOwn(task.rhythm,'solution'));
  const fields={quizId:task.quizId,id:task.id,version:task.version};
  const audio=await call({action:'listenRhythm',...fields});
  assert.ok(audio.duration>3);
  const wav=Buffer.from(audio.audioBase64,'base64');
  assert.equal(wav.subarray(0,4).toString(),'RIFF');
  const size=wav.readUInt32LE(40);
  assert.equal(44+size+size%2,wav.length);
  const answer=Object.fromEntries(audio.cues.map(c=>[c.id,hear(wav,c.at,task.rhythm.bpm)]));
  assert.deepEqual(Object.values(answer).sort(),key==='pause'?['r2']:['n2','r1']);
  if(key==='pause'){
    assert.ok(task.rhythm.slots.some(s=>s.symbol));
    assert.equal(task.rhythm.slots[0].gap,'g0');
  }else assert.ok(task.rhythm.slots.every(s=>s.symbol===undefined));
  const full=await call({action:'score',...fields,answer});
  assert.equal(full.points,task.points);
  const first=Object.keys(answer)[0],wrong={...answer,[first]:answer[first].replace(/^[nr]/,answer[first][0]==='n'?'r':'n')};
  const partial=await call({action:'score',...fields,answer:wrong});
  assert.equal(partial.points,task.points-.5);
  const blank=await call({action:'score',...fields,answer:{}});
  assert.equal(blank.points,0);
  const replay=await call({action:'generateRecipe',requestId,wish});
  assert.equal(replay.quizId,result.quizId);assert.equal(replay.status,'ready');
  save(key,{...receipt,verified:{audioDuration:audio.duration,bytes:wav.length,independentAudioAnalysis:true,
    heardSymbols:Object.values(answer),full:full.points,wrongKind:partial.points,blank:blank.points,stableIdReplayed:true}});
  console.log(key+' · '+task.heading+' · '+audio.duration+' s · '+full.points+' Punkte');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
