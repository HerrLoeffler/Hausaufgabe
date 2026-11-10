'use strict';
const rhythmCode='REMYRND4';
const symbols=['n1','n2','n4','r1','r2','r4'];
const levels={guided:'Mit Notenbild und Zählpuls',listening:'Ohne Notenbild, mit Zählpuls',dictation:'Zwei Lücken ohne Zählpuls im Takt'};
const rhythmExamples=[
  {title:'Wo bleibt der Schlag stumm?',meter:4,bpm:72,level:'guided',events:['n2','r2','n2','n2'],gaps:[1]},
  {title:'Hör auf die Mitte des 3/4-Takts',meter:3,bpm:84,level:'listening',events:['n1','n1','r2','n2'],gaps:[2]},
  {title:'Eine Pause und eine Note heraushören',meter:4,bpm:94,level:'dictation',events:['n2','r2','n1','n1','r2'],gaps:[1,3]}
];
const ticks=code=>Number(code[1]);
function buildRhythm(raw,id='rhythm-'+raw.level){
  const {meter,bpm,events,gaps,level}=raw;
  if(typeof raw.title!=='string'||raw.title.trim().length<3||raw.title.length>100||
      ![3,4].includes(meter)||!Number.isInteger(bpm)||bpm<58||bpm>116||!Object.hasOwn(levels,level))
    throw Error('Taktart, Tempo oder Hörstufe sind ungültig.');
  if(!Array.isArray(events)||events.length<3||events.length>8||!events.every(e=>symbols.includes(e))||
      events.reduce((sum,e)=>sum+ticks(e),0)!==2*meter||!events.some(x=>x.startsWith('n'))||!events.some(x=>x.startsWith('r')))
    throw Error('Der Rhythmus muss genau einen vollen Takt mit Tönen und Pausen ergeben.');
  if(events.some((event,i)=>event[0]==='r'&&events[i-1]?.[0]==='r'))throw Error('Zwei unmittelbar aufeinanderfolgende Pausen sind nicht getrennt hörbar.');
  if(!Array.isArray(gaps)||gaps.length!==(level==='dictation'?2:1)||new Set(gaps).size!==gaps.length||
      !gaps.every(i=>Number.isInteger(i)&&i>=0&&i<events.length))
    throw Error('Die Hörstufe hat eine andere Anzahl offener Stellen.');
  if(level==='dictation'&&new Set(gaps.map(i=>events[i][0])).size!==2)
    throw Error('Im schweren Takt muss eine Note und eine Pause eingesetzt werden.');
  const solution={},gapIds={};
  [...gaps].sort((a,b)=>a-b).forEach((slot,index)=>{
    gapIds[slot]='g'+index;solution['g'+index]=events[slot];
  });
  const slots=events.map((symbol,i)=>Object.hasOwn(gapIds,i)?{gap:gapIds[i]}:level==='guided'?{symbol}:{});
  const intro='Höre zuerst den Einzähler, dann den Takt. Achte auf die markierten Stellen und setze '+(gaps.length===2?'je eine Note oder Pause ein.':'eine Note oder Pause ein.');
  return {id,type:'rhythm',heading:raw.title.trim(),subject:'Musik · Rhythmus hören',
    text:intro,display:{meter,bpm,level:levels[level],slots,symbols},
    audio:{meter,bpm,events,gapIds,pulse:level!=='dictation'},solution,points:gaps.length*.5};
}
function publicRhythm(q){return q.display;}
function scoreRhythm(q,answer){
  if(!answer||typeof answer!=='object'||Array.isArray(answer))return 0;
  return Object.entries(q.solution).reduce((n,[id,value])=>n+(Object.hasOwn(answer,id)&&answer[id]===value?0.5:0),0);
}
function makeAudio(q){
  const {meter,bpm,events,gapIds,pulse}=q.audio;
  const rate=8000,beat=60/bpm,eighth=beat/2;
  const duration=2*meter*beat;
  const samples=Math.round(duration*rate);
  const pad=samples%2;
  const wave=Buffer.alloc(44+samples+pad,128);
  if(pad)wave[wave.length-1]=0;
  wave.write('RIFF',0);wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);
  wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);
  wave.writeUInt32LE(rate,24);wave.writeUInt32LE(rate,28);wave.writeUInt16LE(1,32);wave.writeUInt16LE(8,34);
  wave.write('data',36);wave.writeUInt32LE(samples,40);
  function tone(start,length,freq,gain,click=false){
    const offset=Math.round(start*rate),size=Math.min(Math.round(length*rate),samples-offset);
    for(let i=0;i<size;i++){
      const t=i/rate,env=click?Math.exp(-5*i/size):Math.min(1,i/40,(size-i)/95)*(.73+.27*Math.exp(-5*t));
      const v=Math.sin(2*Math.PI*freq*t)+(click?0:.24*Math.sin(4*Math.PI*freq*t)+.07*Math.sin(6*Math.PI*freq*t));
      const at=44+offset+i;
      wave[at]=Math.max(0,Math.min(255,Math.round(wave[at]+gain*v*env)));
    }
  }
  for(let i=0;i<meter;i++)tone(i*beat,.045,i?490:620,34,true);
  if(pulse)for(let i=0;i<meter;i++)tone((meter+i)*beat,.035,i?490:620,14,true);
  let used=0;
  const cues=[];
  for(const [i,event] of events.entries()){
    const at=meter*beat+used*eighth;
    if(gapIds[i])cues.push({id:gapIds[i],at});
    if(event[0]==='n')tone(at,ticks(event)*eighth*.88,261.63,69);
    used+=ticks(event);
  }
  return {audioBase64:wave.toString('base64'),cues,duration:samples/rate};
}
function rhythmWish(wish){return /rhythm|takt|noten|pausen/i.test(wish)&&/hör|hoer|anhören|audio|vorspiel/i.test(wish);}
module.exports={buildRhythm,publicRhythm,scoreRhythm,makeAudio,rhythmCode,rhythmExamples,rhythmWish};
