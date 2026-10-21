export const skills={parts:'Anteile verstehen',same:'Gleich große Teile addieren',equivalent:'Brüche erweitern',common:'Gemeinsamen Nenner finden',add:'Brüche addieren',transfer:'Brüche anwenden'};
const gcd=(a,b)=>b?gcd(b,a%b):a;
const integer=v=>/^\d{1,5}$/.test(String(v).trim())?Number(v):null;
export function validateTask(raw){if(!raw||!Object.hasOwn(skills,raw.skill))throw Error('Die KI-Aufgabe passt noch nicht zum erlaubten Übungsbereich.');for(const pair of [raw.a,raw.b])if(!Array.isArray(pair)||pair.length!==2||!pair.every(Number.isInteger)||pair[0]<1||pair[0]>24||pair[1]<1||pair[1]>24)throw Error('Die Zahlen der KI-Aufgabe sind nicht zulässig.');const [an,ad]=raw.a,[bn,bd]=raw.b;let common=ad*bd/gcd(ad,bd);if(common>72)throw Error('Die Aufgabe ist für diese Probe zu aufwendig.');if(raw.skill==='parts'&&(an>ad||ad>8))throw Error('Die Anteile-Probe ist noch zu schwer.');if(raw.skill==='same'&&(ad!==bd||ad>8||an+bn>ad))throw Error('Die Teilschritt-Probe braucht gleiche Nenner und höchstens ein Ganzes.');let answer=raw.skill==='parts'?[an,ad]:[an*bd+bn*ad,ad*bd];if(raw.skill==='common')answer=[common,1];if(raw.skill==='equivalent'){if(bd<=ad||bd%ad!==0)throw Error('Die Erweiterungsaufgabe ist nicht eindeutig.');common=bd;answer=[an,ad];}const div=gcd(answer[0],answer[1]);answer=answer.map(n=>n/div);return {difficulty:Number.isInteger(raw.difficulty)&&raw.difficulty>=0&&raw.difficulty<=3?raw.difficulty:1,skill:raw.skill,a:[an,ad],b:[bn,bd],common,answer,prompt:typeof raw.prompt==='string'?raw.prompt.slice(0,230):'Berechne die Aufgabe.',id:`ai-${Date.now()}-${Math.random().toString(36).slice(2,7)}`};}
export function evaluateFraction(n,d,answer){const a=integer(n),b=integer(d);return a!==null&&b!==null&&b>0&&a*answer[1]===answer[0]*b;}
export function checkStep(n,fraction,denominator){const v=integer(n);return v!==null&&v*fraction[1]===fraction[0]*denominator;}
export function learnerState(events=[]){
 const shown=[],practice=[],recheck=[],evidence={};
 for(const skill of Object.keys(skills)){
  const rows=events.filter(e=>e.skill===skill),latest=rows.at(-1),seen=new Set(),independent=[];
  for(const [i,e] of rows.entries()){const key=e.variant||e.taskId||`legacy-${i}`;if(seen.has(key))continue;seen.add(key);if(!e.hinted)independent.push(e);}
  const recent=independent.slice(-10),correct=recent.filter(e=>e.correct).length;
  evidence[skill]={total:recent.length,correct,supported:rows.filter(e=>e.hinted).length,criterion:recent.length===10&&correct>=8};
  if(!latest)continue;
  if(evidence[skill].criterion&&latest.correct&&!latest.hinted)shown.push(skill);else practice.push(skill);
  if(!latest.correct&&rows.some(e=>e.correct&&!e.hinted))recheck.push(skill);
 }
 const last=events.at(-1);let next='add';
 if(last){
  if(!last.correct||last.hinted)next={add:'same',transfer:'same',same:'parts',parts:'parts',common:'equivalent',equivalent:'parts'}[last.skill];
  else {const rows=events.filter(e=>e.skill===last.skill).slice(-2);const two=rows.length===2&&rows.every(e=>e.correct&&!e.hinted)&&(rows[0].variant||rows[0].taskId)!==(rows[1].variant||rows[1].taskId);next=two?{parts:'same',same:'equivalent',equivalent:'common',common:'add',add:'transfer',transfer:'add'}[last.skill]:last.skill;}
 }
 return {shown,practice,recheck,evidence,next,observed:events.length};
}

export function remainingSeconds(deadline,now=Date.now()){return deadline===null?null:Math.max(0,Math.ceil((deadline-now)/1000));}

export function taskVariant(task){let values=task.skill==='common'?[task.a[1],task.b[1]].sort((a,b)=>a-b):task.skill==='equivalent'?[task.a.join('/'),task.common||task.b[1]]:task.skill==='parts'?[task.a.join('/')]:[task.a.join('/'),task.b.join('/')].sort();return `${task.skill}:${values.join('|')}`;}
