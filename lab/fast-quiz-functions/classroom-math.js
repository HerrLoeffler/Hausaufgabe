/* Shared task profiles. Scored-room seeds and answer keys remain server-side. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FastQuizClassroomMath=factory();})(typeof globalThis==='object'?globalThis:this,()=>{
  'use strict';
  const teams=[{id:0,name:'Team Koralle',color:'#a84135'},{id:1,name:'Team Ozean',color:'#24658a'},{id:2,name:'Team Wald',color:'#386e4b'},{id:3,name:'Team Sonne',color:'#8d6617'}];
  function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
  function shuffle(values,random){const out=[...values];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  function planKinds(category,count,seed){const n=Math.max(0,Math.trunc(count));return Array.from({length:n},(_,i)=>category==='paper'&&Math.floor((35*(i+1)+50)/100)>Math.floor((35*i+50)/100)?'P':'H');}
  const format=n=>Number(n.toFixed(6)).toLocaleString('de-DE',{maximumFractionDigits:6,useGrouping:false});
  const examples={mental:{n1:'38 + 7 · zum Zehner ergänzen',n2:'4 × 25 · geschickt bündeln',n3:'198 + 35 = 200 + 35 − 2',n4:'25 × 16; 18 ÷ 0,5 · Faktoren und Hälften'},paper:{n1:'H: 75 + 25 · P: 147 + 268',n2:'H: 198 + 47 · P: 3 × 247',n3:'H: 25 × 24 · P: 36 × 27',n4:'H: 25 × 24 · P: 12,5 × 3,6'}};
  function generateTask(config,seed,index){
    let level=Math.max(1,Math.min(4,Number(String(config.level||'n2').slice(1))||2));
    const random=rng((seed+Math.imul(index+1,2654435761))>>>0);const pick=a=>a[Math.floor(random()*a.length)];const int=(a,b)=>a+Math.floor(random()*(b-a+1));
    const count=config.slotCount===5?5:20; const kind=planKinds(config.category,count,seed)[index%count]; if(config.category==='paper'&&kind==='H')level=Math.min(4,level+1);let a,b,answer,prompt,hint,strategy;
    // Common profiles span addition, subtraction, multiplication and exact division.
    // Higher mental levels change structure, never arbitrary digit count.
    const family=index%4;
    if(kind==='P'){
      if(level===1){a=int(124,386);b=int(137,294);answer=a+b;prompt=`${a} + ${b}`;hint='Schreibe die Zahlen stellenrichtig untereinander. Beginne bei den Einern.';strategy='Stellenweise addieren';}
      if(level===2){a=int(124,386);b=int(3,8);answer=a*b;prompt=`${a} × ${b}`;hint='Zerlege in Hunderter, Zehner und Einer oder rechne schriftlich.';strategy='Schriftlich multiplizieren';}
      if(level===3){a=int(23,68);b=int(13,39);answer=a*b;prompt=`${a} × ${b}`;hint='Notiere die beiden Teilprodukte nach Zehnern und Einern. Addiere sie.';strategy='Teilprodukte notieren';}
      if(level===4){a=int(112,298)/10;b=int(23,68)/10;answer=Math.round(a*b*100)/100;prompt=`${format(a)} × ${format(b)}`;hint='Rechne zuerst ohne Kommas. Das Ergebnis hat zusammen zwei Nachkommastellen.';strategy='Dezimalzahlen schriftlich multiplizieren';}
    }else if(level===1){
      if(family===0){a=int(2,7)*10+8;b=int(3,9);answer=a+b;prompt=`${a} + ${b}`;hint=`Ergänze ${a} zuerst mit 2 zum nächsten Zehner. Addiere dann den Rest.`;strategy='Zum Zehner ergänzen';}
      if(family===1){a=int(3,9)*10+2;b=int(4,9);answer=a-b;prompt=`${a} − ${b}`;hint='Gehe zuerst zum vorherigen Zehner und ziehe dann den Rest ab.';strategy='Über den Zehner';}
      if(family===2){a=pick([2,5,10]);b=int(2,10);answer=a*b;prompt=`${a} × ${b}`;hint=a===2?'Verdopple die zweite Zahl.':a===5?'Rechne zehnmal die Zahl und halbiere.':'Hänge bei einer ganzen Zahl eine Null an.';strategy='Verdoppeln und Bündeln';}
      if(family===3){b=pick([2,5,10]);answer=int(2,10);a=b*answer;prompt=`${a} ÷ ${b}`;hint=`Welche Zahl ergibt mit ${b} multipliziert ${a}?`;strategy='Umkehraufgabe';}
    }else if(level===2){
      if(family===0||family===1){a=(family===0?int(1,3):int(2,8))*25;b=family===0?100-a:25;answer=family===0?a+b:a-b;prompt=`${a} ${family===0?'+':'−'} ${b}`;hint='Denke in 25er-Schritten: vier Viertel ergeben 100.';strategy='In Vierteln bündeln';}
      if(family===2){a=pick([4,8,12]);b=25;answer=a*b;prompt=`${a} × 25`;hint='Viermal 25 sind 100. Wie viele Viererpakete sind es?';strategy='Viererpakete';}
      if(family===3){b=pick([4,5,10]);answer=pick([12,15,20,25]);a=b*answer;prompt=`${a} ÷ ${b}`;hint='Zerlege die Zahl in zwei leicht teilbare Summanden.';strategy='Geschickt zerlegen';}
    }else if(level===3){
      if(family===0||family===1){a=pick([98,198,298]);b=int(23,67);answer=family===0?a+b:a-b;prompt=`${a} ${family===0?'+':'−'} ${b}`;hint=family===0?'Rechne mit dem nächsten Hunderter und ziehe danach 2 ab.':'Beginne beim nächsten Hunderter und ziehe am Ende zusätzlich 2 ab.';strategy='Nachbaraufgabe';}
      if(family===2){a=pick([9,11]);b=int(12,24);answer=a*b;prompt=`${a} × ${b}`;hint=a===9?'Rechne zehnmal die Zahl und ziehe sie einmal ab.':'Rechne zehnmal die Zahl und addiere sie einmal.';strategy='Nachbar zum Zehner';}
      if(family===3){b=pick([4,8]);answer=pick([15,25,35]);a=b*answer;prompt=`${a} ÷ ${b}`;hint=b===4?'Halbiere zweimal nacheinander.':'Halbiere dreimal nacheinander.';strategy='Wiederholt halbieren';}
    }else{
      if(family===0){a=pick([125,250,375]);b=1000-a;answer=1000;prompt=`${a} + ${b}`;hint='Ergänze zuerst zu 500 und dann zu 1000.';strategy='Zu Tausend ergänzen';}
      if(family===1){a=pick([12.5,15.5,18.5]);b=pick([2.5,3.5,4.5]);answer=a-b;prompt=`${format(a)} − ${format(b)}`;hint='Halbe minus halbe ergibt eine ganze Zahl. Rechne die ganzen Teile getrennt.';strategy='Dezimalstruktur nutzen';}
      if(family===2){a=25;b=pick([12,16,24,28]);answer=a*b;prompt=`25 × ${b}`;hint='Teile den zweiten Faktor durch 4 und multipliziere mit 100.';strategy='Faktor ausgleichen';}
      if(family===3){b=0.5;a=pick([12,18,25,35]);answer=a*2;prompt=`${a} ÷ 0,5`;hint='Wie viele Hälften stecken in einer ganzen Zahl? Es sind doppelt so viele.';strategy='Durch eine Hälfte teilen';}
    }
    if(Number(config.campaignRound)>=3){const extra=level===1?2:5;prompt=`(${prompt}) + ${extra}`;answer+=extra;hint+=` Addiere zum Zwischenergebnis noch ${extra}.`;strategy+=' und ein weiterer Schritt';}
    const correct=format(answer);const offsets=shuffle([1,2,5,10,20,-1,-2,-5,-10],random);const choices=[correct];for(const offset of offsets){const candidate=format(answer+offset);if(!choices.includes(candidate))choices.push(candidate);if(choices.length===4)break;}
    return{id:`${index}:${kind}:${family}`,prompt:prompt+' = ?',options:shuffle(choices,random),correct,hint,strategy,explanation:`${prompt} = ${correct}. ${hint}`,kind,material:kind==='P'?'Stift und Papier':'Im Kopf',calculatorAllowed:false,hintOrientation:kind==='P'?'20–60 Sekunden oder länger sind zum Nachdenken okay.':'In Ruhe im Kopf rechnen.'};
  }
  function balancedTeams(ids,seed){const assignment={};shuffle(ids,rng(seed)).forEach((id,i)=>{assignment[id]=i%4;});return assignment;}
  function standings(members,roster){const rows=teams.map(team=>{const ids=Object.keys(roster||{}).filter(id=>roster[id]===team.id);const rawScore=ids.reduce((sum,id)=>sum+Math.max(0,Number(members[id]?.score)||0),0);return{...team,size:ids.length,rawScore,energy:ids.length?Math.round(1000*rawScore/(ids.length*100)):0};});for(const row of rows)row.rank=1+rows.filter(other=>other.energy>row.energy).length;return rows;}
  const targetFor=round=>[500,600,600,700][Math.max(0,Math.min(3,round-1))];
  function normalizeAnswer(value){const s=String(value??'').trim().replace(',','.');if(!/^[+−-]?\d+(?:\.\d+)?$/.test(s))return null;const n=Number(s.replace('−','-'));return Number.isFinite(n)&&Math.abs(n)<1000000000?format(n):null;}
  return{normalizeAnswer,planKinds,generateTask,balancedTeams,standings,targetFor,teams,examples};
});
