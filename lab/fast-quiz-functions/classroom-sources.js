'use strict';
const {createHash}=require('node:crypto');
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fmt=n=>Number(n.toFixed(6)).toLocaleString('de-DE',{maximumFractionDigits:6,useGrouping:false});
function duration(value){if(typeof value!=='number'||!Number.isInteger(value)||value<60||value>1200)throw new Error('Bitte eine ganze Dauer von 60 bis 1200 Sekunden wählen.');return value;}
const curriculum=[];
const gradeTopics={5:[['natural','Natürliche Zahlen: Grundrechenarten','M5 1.2: Rechenvorteile und Umkehraufgaben']],6:[['fraction','Bruchzahlen: gleichnamig addieren','M6 1.2: Rechnen mit Bruchzahlen']],7:[['percent','Prozentrechnung: Prozentwert','M7 1: Prozentrechnung'],['linear','Gleichungen lösen','M7 7: Gleichungen']],8:[['linear','Lineare Gleichungen','M8 7: Gleichungen']],9:[['linear','Gleichungen: Lösungsweg prüfen','M9: Gleichungen']],10:[['square','Quadratische Gleichungen: Quadrat isolieren','M10: Quadratische Gleichungen']]};
for(let grade=5;grade<=10;grade++)for(const track of grade<7?['regel']:grade===10?['m']:['regel','m'])for(const [topicId,title,competency]of gradeTopics[grade])curriculum.push({grade,track,topicId,title,competencies:[competency],sourceUrl:`https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/${grade}/mathematik/${track==='m'?'mittlere-reife-klasse':'regelklasse'}`,coverage:'Geprüfter Ausschnitt; weitere Kompetenzen sind noch nicht als Spielaufgaben verfügbar.'});
function curriculumSource(row){const found=curriculum.find(r=>r.grade===row.grade&&r.track===row.track&&r.topicId===row.topicId);if(!found)throw new Error('Diese Lehrplanauswahl ist nicht verfügbar.');return{id:`curriculum:${row.grade}:${row.track}:${row.topicId}`,kind:'curriculum',title:`Klasse ${row.grade}${row.track==='m'?' M':''} · ${found.title}`,curriculum:found,questions:[{id:'H',family:row.topicId,kind:'H'},{id:'P',family:row.topicId,kind:'P'}]};}
function sourceKey(q){if(q.type==='number'&&typeof q.numericAnswer==='number')return q.numericAnswer;if(Array.isArray(q.acceptedAnswers)&&q.acceptedAnswers.length===1){const n=Number(String(q.acceptedAnswers[0]).replace(',','.'));if(Number.isFinite(n))return n;}if(Array.isArray(q.options)){const correct=q.options.filter(o=>o.correct===true);if(correct.length===1){const n=Number(String(correct[0].text).replace(',','.'));if(Number.isFinite(n))return n;}}return null;}
function compile(q, trusted=false){
 if(trusted&&['natural','fraction','percent','linear','square'].includes(q.family))return{sourceId:q.id,type:q.family,kind:q.kind,capacity:10000};
 if(q.imageUrl||q.imageDataUrl||q.audioPresentation==='listening-only'||q.manualReview===true)throw new Error('Medien oder manuelle Bewertung brauchen eine eigene geprüfte Familie.');
 const text=String(q.text||'').normalize('NFKC').trim().replace(/^(?:Berechne|Rechne)(?:\s+im Kopf)?\s*:?\s*/i,'').replace(/[.!]$/,'');
 const match=text.match(/^(-?\d+(?:[,.]\d+)?)\s*([+−–\-*×·:÷/])\s*(-?\d+(?:[,.]\d+)?)\s*(?:=\s*\??)?$/);
 if(!match)throw new Error('Noch keine geprüfte Variantenfamilie für dieses Aufgabenformat; Original bleibt unverändert.');
 const a=Number(match[1].replace(',','.')),b=Number(match[3].replace(',','.')),op=({'+':'+','−':'-','–':'-','-':'-','*':'*','×':'*','·':'*',':':'/','÷':'/','/':'/'})[match[2]];
 if(a<0||b<=0||!Number.isInteger(a)||!Number.isInteger(b))throw new Error('Diese Zahlenstruktur braucht eine eigene geprüfte Familie.');
 const answer=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:a/b,key=sourceKey(q);
 if(key===null||Math.abs(answer-key)>1e-8)throw new Error('Die gespeicherte Lösung ist nicht eindeutig numerisch oder widerspricht der Kontrollrechnung.');
 const aDigits=String(a).length,bDigits=String(b).length;
 if(aDigits>4||bDigits>3||answer<0||!Number.isInteger(answer))throw new Error('Die Parameter liegen außerhalb der geprüften Familie.');
 const crossing=op==='+'?(a%10+b%10>=10):op==='-'?(a%10<b%10):null;
 const kind=(op==='+'||op==='-')?(a<100&&b<100?'H':'P'):a<=25&&b<=25?'H':'P';
 const loA=aDigits===1?1:10**(aDigits-1),hiA=10**aDigits-1,loB=bDigits===1?1:10**(bDigits-1),hiB=10**bDigits-1;
 return{sourceId:String(q.id),type:'binary',op,kind,crossing,answerDigits:String(answer).length,loA,hiA,loB,hiB,capacity:(hiA-loA+1)*(hiB-loB+1),original:`${a}|${op}|${b}`};
}
function candidate(f,n){
 let prompt,answer,hint,check,semantic;
 const paper=f.kind==='P';
 if(f.type==='binary'){
  const width=f.hiB-f.loB+1,a=f.loA+Math.floor(n/width),b=f.loB+n%width;
  if((f.op==='+'&&((a%10+b%10>=10)!==f.crossing))||(f.op==='-'&&((a%10<b%10)!==f.crossing)))return null;
  if(f.kind==='H'&&['*','/'].includes(f.op)&&!(a<=10&&b<=10||a===25||b===25||[2,5,10].includes(b)))return null;
  if(a>f.hiA||((f.op==='-'||f.op==='/')&&a<b)||(f.op==='/'&&a%b!==0))return null;
  semantic=['+','*'].includes(f.op)?`${Math.min(a,b)}|${f.op}|${Math.max(a,b)}`:`${a}|${f.op}|${b}`;const original=f.original.split('|');const originalCanonical=['+','*'].includes(f.op)?`${Math.min(Number(original[0]),Number(original[2]))}|${f.op}|${Math.max(Number(original[0]),Number(original[2]))}`:f.original;if(semantic===originalCanonical)return null;
  answer=f.op==='+'?a+b:f.op==='-'?a-b:f.op==='*'?a*b:a/b;
  if(String(answer).length!==f.answerDigits)return null;
  check=f.op==='+'?answer-b===a:f.op==='-'?answer+b===a:f.op==='*'?answer/b===a:answer*b===a;
  const sign={'+':'+','-':'−','*':'×','/':'÷'}[f.op];prompt=`${a} ${sign} ${b} = ?`;hint=f.op==='+'?'Zerlege den zweiten Summanden und ergänze zum nächsten Zehner.':f.op==='-'?'Zerlege die Zahl und prüfe mit der Addition.':f.op==='*'?'Bilde einfache Teilprodukte und addiere.':'Prüfe mit der passenden Multiplikation.';
 }else{
  const a=1+Math.floor(n/100),b=1+n%100;
  if(f.type==='natural'){const x=paper?a*10+107:a+10,y=paper?b*7+113:b;answer=x+y;prompt=`${x} + ${y} = ?`;hint=paper?'Notiere die Zahlen stellenrichtig untereinander und addiere von rechts.':'Ergänze zuerst zum Zehner; addiere den Rest.';semantic=`${Math.min(x,y)}|+|${Math.max(x,y)}`;check=answer-y===x;}
  if(f.type==='fraction'){const d=paper?100:10,x=paper?a:b%10+1,y=paper?b:a;answer=(x+y)/d;prompt=`${x}/${d} + ${y}/${d} = ? (Dezimalzahl)`;hint='Addiere die Zähler. Der gemeinsame Nenner bleibt gleich. Schreibe das Ergebnis als Dezimalzahl.';semantic=`fraction:${Math.min(x,y)}:${Math.max(x,y)}:${d}`;check=Math.abs(answer*d-x-y)<1e-8;}
  if(f.type==='percent'){const base=paper?a*10+110:a*20,percent=paper?b:[1,2,4,5,10,20,25,50,75,100,150,200][(b-1)%12];answer=base*percent/100;prompt=`Wie viel sind ${percent} % von ${base}?`;hint='Berechne zuerst 1 % durch Teilen durch 100. Multipliziere mit dem Prozentsatz.';semantic=`percent:${base}:${percent}`;check=Math.abs(answer*100-base*percent)<1e-8;}
  if(f.type==='linear'){const coefficient=paper?Math.floor(a/5)+11:Math.floor((a-1)/10)+2,offset=paper?b*7:Math.floor((b-1)/5),solution=paper?1+(a%5)*100+b:1+((a-1)%10)*5+(b-1)%5,rhs=coefficient*solution+offset;answer=solution;prompt=`${coefficient}x + ${offset} = ${rhs}. x = ?`;hint='Subtrahiere die Zahl ohne x auf beiden Seiten. Teile danach durch den Faktor vor x.';semantic=`linear:${coefficient}:${offset}:${solution}`;check=coefficient*answer+offset===rhs;}
  if(f.type==='square'){const x=paper?a+100:1+Math.floor(n/20),y=paper?b+100:1+n%20;answer=y-x;prompt=`(x + ${x})² = ${y*y}; x + ${x} ≥ 0. x = ?`;hint='Ziehe die nichtnegative Quadratwurzel auf beiden Seiten. Subtrahiere dann die Zahl in der Klammer.';semantic=`square:${x}:${y}`;check=(answer+x)**2===y*y&&answer+x>=0;}
 }
 if(!check||!Number.isFinite(answer))return null;
 return{prompt,correct:fmt(answer),hint,explanation:`${prompt.replace(/ = \?$/, '')} → ${fmt(answer)}. ${hint}`,kind:f.kind,sourceId:f.sourceId,weight:20,referenceSec:paper?60:f.type==='linear'||f.type==='square'?40:25,material:paper?'Stift und Papier':'Im Kopf',hintOrientation:paper?'20–60 Sekunden oder länger sind okay.':'Nimm dir Zeit; es gibt keinen Geschwindigkeitsbonus.',calculatorAllowed:false,fingerprint:digest(semantic)};
}
function preparePlan(source,config){
 duration(config.durationSec);if(!['mental','paper'].includes(config.category))throw new Error('Bitte eine Arbeitsweise wählen.');
 const questions=Array.isArray(source.questions)?source.questions:[];if(!questions.length||questions.length>100)throw new Error('Bitte eine Quelle mit 1 bis 100 Aufgaben wählen.');
 const families=[],items=[],issues=[];
 for(const q of questions){try{const family=compile(q,source.kind==='curriculum');families.push(family);items.push({id:String(q.id),text:String(q.text||`${q.kind==='P'?'Schriftliche':'Kopf'} Varianten: ${q.family}`),status:'variable',reason:`Geprüfte ${family.kind==='H'?'Kopf':'Papier'}familie`});}catch(e){items.push({id:String(q.id),text:String(q.text||'Aufgabe'),status:'unsupported',reason:e.message});issues.push(`Aufgabe ${q.id}: ${e.message}`);}}
 const byKind={H:families.filter(f=>f.kind==='H'),P:families.filter(f=>f.kind==='P')};
 if(!byKind.H.length)issues.push('Diese Quelle enthält keine geprüfte Kopffamilie.');if(config.category==='paper'&&!byKind.P.length)issues.push('Für 65/35 fehlen passende Papieraufgaben aus derselben Quelle.');
 const requiredCount=Math.ceil(config.durationSec/2)+20,tasks=[],seen=new Set(),cursors=new Map(),counts={H:0,P:0};let exhausted=false;
 if(!issues.length)for(let i=0;i<requiredCount;i++){
  const kind=config.category==='paper'&&Math.floor((35*(i+1)+50)/100)>Math.floor((35*i+50)/100)?'P':'H';let question=null;
  const selected=byKind[kind];
  for(let cycle=0;cycle<selected.length&&!question;cycle++){
   const f=selected[(counts[kind]+cycle)%selected.length],key=f.sourceId+':'+kind;let cursor=cursors.get(key)||0;
   // A deterministic permutation spreads the parameters without a live provider call.
   while(cursor<f.capacity){const n=(cursor*7919)%f.capacity;cursor++;const q=candidate(f,n);if(q&&!seen.has(q.fingerprint)){question=q;break;}}
   cursors.set(key,cursor);
  }
  if(!question){exhausted=true;break;}
  seen.add(question.fingerprint);tasks.push(question);counts[kind]++;
 }
 const pools={H:[],P:[]};tasks.forEach((q,i)=>pools[q.kind].push(i));
 if(!issues.length&&(pools.H.length<2||(config.category==='paper'&&pools.P.length<2)))issues.push('Die Quelle liefert weniger als zwei verschiedene geprüfte Varianten je benötigter Arbeitsweise.');
 let elapsed=0,referencePoints=0;for(let i=0;i<requiredCount&&tasks.length;i++){const pc=Math.floor((35*i+50)/100),nextP=config.category==='paper'&&Math.floor((35*(i+1)+50)/100)>pc,kind=nextP?'P':'H',ordinal=config.category==='paper'?(nextP?pc:i-pc):i,pool=pools[kind];if(!pool.length)break;const q=tasks[pool[ordinal%pool.length]];elapsed+=q.referenceSec;if(elapsed<=config.durationSec)referencePoints+=q.weight;else break;}
 if(!referencePoints&&tasks.length)issues.push('Die Dauer ist kürzer als der Richtwert der ersten Aufgabe.');
 return{version:2,source:{id:source.id,title:String(source.title||'Eigener Test').slice(0,160),kind:source.kind||'test',...(source.curriculum?{curriculum:source.curriculum}:{})},sourceRevision:digest(source),items,issues,available:issues.length===0,capacity:tasks.length,requiredCount,referencePoints,repeating:exhausted,repeatNotice:'Neue Varianten; bekannte Aufgaben kehren nach dem geprüften Variantenzyklus zur Festigung zurück. Jede neue Instanz ist einmal wertbar.',pools,tasks,config:{category:config.category,durationSec:config.durationSec}};
}
function taskAt(plan,index,seed=0){if(!Number.isInteger(index)||index<0)throw new Error('Ungültige Aufgabenfolge.');const beforeP=Math.floor((35*index+50)/100),isP=plan.config.category==='paper'&&Math.floor((35*(index+1)+50)/100)>beforeP,kind=isP?'P':'H',ordinal=plan.config.category==='paper'?(isP?beforeP:index-beforeP):index,pool=plan.pools[kind];if(!pool?.length)throw new Error('Der geprüfte Aufgabenvorrat ist nicht verfügbar.');const q=plan.tasks[pool[ordinal%pool.length]];return{...q,id:digest([seed,index,q.fingerprint]).slice(0,24),cycle:Math.floor(ordinal/pool.length)};}
function publicReview(plan){const {tasks,pools,...view}=plan;return{...view,examples:tasks.slice(0,3)};}
module.exports={curriculum,curriculumSource,preparePlan,taskAt,publicReview,digest,duration};
