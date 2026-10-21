/* GradeCrew visual tasks — isolated prototype, no production dependencies.
   Explicit solutions are local ONLY to make the offline demo runnable.
   Production MUST evaluate on the server and keep solutions private. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GCPrototypeCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const formats=Object.freeze(['hotspot','labeling','scale','angle','grid','chart']);
const names=Object.freeze({hotspot:'Bildbereich anklicken',labeling:'Grafik beschriften',scale:'Position auf einer Skala',angle:'Winkel messen',grid:'Flächenanteile markieren',chart:'Diagramm ergänzen'});
const scenes=Object.freeze({
 plant:{name:'Blütenpflanze',subject:'NT',grade:'6',labels:['Blüte','Sprossachse','Blätter','Wurzel'],targets:['Wurzel','Blüte','Blätter','Sprossachse'],targetRegions:['r4','r1','r3','r2']},
 sentence:{name:'Satzglieder',subject:'Deutsch',grade:'6',labels:['Zeitangabe','Prädikat','Subjekt','Ortsangabe'],targets:['das Subjekt','das Prädikat','die Zeitangabe','die Ortsangabe'],targetRegions:['r3','r2','r1','r4']},
 receipt:{name:'Beleg verstehen',subject:'Wirtschaft',grade:'7',labels:['Datum','Artikel','Gesamtbetrag','Zahlungsart'],targets:['den Gesamtbetrag','das Datum','die Zahlungsart','die Artikelzeile'],targetRegions:['r3','r1','r4','r2']}
});
function clone(x){return JSON.parse(JSON.stringify(x));}
function rotate(xs,n){return xs.slice(n%xs.length).concat(xs.slice(0,n%xs.length));}
function numeric(x){if(x===null||x===undefined||typeof x==='boolean'||typeof x==='object')return null;const s=String(x).trim().replace(',','.');if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;const v=Number(s);return Number.isFinite(v)?v:null;}
function formatNumber(n){return String(Number(Number(n).toFixed(6))).replace('.',',');}
function generate(format,options={}){
 if(!formats.includes(format))throw new Error('Unbekanntes Format.');
 const variant=Math.max(0,Math.trunc(Number(options.variant)||0));
 const scene=Object.hasOwn(scenes,options.scene)?options.scene:'plant';
 let q={schemaVersion:1,id:`gc-demo-${format}-${options.scene||'default'}-${variant}`,revision:variant,format,title:names[format],subject:'Mathematik',grade:'6',prompt:'',hint:'',maxPoints:2,spec:{},solution:{},provenance:{kind:'curated-demo-template',offline:true}};
 if(format==='hotspot'||format==='labeling'){
  const s=scenes[scene],k=variant%4;
  q.subject=s.subject;q.grade=s.grade;q.spec={scene,regions:['r1','r2','r3','r4']};
  if(format==='hotspot'){
   q.title=scene==='plant'?'Aufbau einer Blütenpflanze':s.name;
   q.prompt=scene==='plant'?`Klicke auf ${s.targets[k]==='Blüte'?'die Blüte':s.targets[k]==='Wurzel'?'die Wurzel':s.targets[k]==='Blätter'?'die Blätter':'die Sprossachse'}.`:`Klicke auf ${s.targets[k]}.`;
   q.hint='Wähle genau einen Bereich aus. Du kannst deine Auswahl bis zur Abgabe ändern.';
   q.maxPoints=1;q.spec.maxSelections=1;q.solution={regions:[s.targetRegions[k]],text:s.labels[Number(s.targetRegions[k].slice(1))-1]};
  }else{
   q.title=scene==='plant'?'Eine Pflanze beschriften':scene==='sentence'?'Satzbausteine zuordnen':'Einen Beleg beschriften';
   q.prompt=scene==='sentence'?'Ordne jedem Satzbaustein seine Funktion zu.':scene==='receipt'?'Ordne die Begriffe den passenden Stellen auf dem Beleg zu.':'Beschrifte die vier markierten Teile der Blütenpflanze.';
   q.hint='Begriff antippen, dann ein Feld antippen. Ziehen ist ebenfalls möglich. Jeder Begriff wird einmal verwendet.';
   q.maxPoints=4;q.spec.items=rotate(s.labels.map((text,i)=>({id:`l${i+1}`,text})),variant%4+1);
   q.solution={assignments:Object.fromEntries(s.labels.map((_,i)=>[`r${i+1}`,`l${i+1}`]))};
  }
 }else if(format==='scale'){
  const context=options.scene==='timeline'?'timeline':options.scene==='temperature'?'temperature':'numberline';
  q.spec={context,min:0,max:1,step:0.05,majorStep:0.25,unit:'',card:'●'};
  if(context==='timeline'){
   q.subject='GPG';q.grade='9';q.title='Auf einer Zeitachse einordnen';q.prompt='Setze die Karte „Mauerfall · 1989“ an die passende Stelle auf der Zeitachse.';
   q.spec={context,min:1945,max:1995,step:1,majorStep:10,unit:'',card:'Mauerfall'};q.solution={value:1989,tolerance:0.01};
  }else if(context==='temperature'){
   q.subject='NT';q.title='Eine Temperatur markieren';const value=[18,-7,24,3][variant%4];q.prompt=`Markiere ${value} °C auf der Temperaturskala.`;
   q.spec={context,min:-20,max:40,step:1,majorStep:10,unit:'°C',card:'Temperatur'};q.solution={value,tolerance:0.01};
  }else{
   const item=[['¾',0.75],['40 %',0.4],['⅕',0.2],['65 %',0.65]][variant%4];
   q.title='Brüche und Prozente verorten';q.prompt=`Markiere ${item[0]} auf dem Zahlenstrahl.`;q.solution={value:item[1],tolerance:0.00001};
  }
  q.hint='Tippe auf einen Teilstrich. Du kannst die Markierung ziehen oder mit den Pfeiltasten verschieben.';
 }else if(format==='angle'){
  const value=[68,112,47,136,81][variant%5];q.title='Mit dem Winkelmesser messen';
  q.prompt='Miss den Winkel α mit dem eingeblendeten Winkelmesser. Trage dein Ergebnis in Grad ein.';
  q.hint='Lies die Skala ab, die am rechten Schenkel bei 0° beginnt. Messtoleranz: ±1°. Es gibt keine automatische Winkelanzeige.';
  q.spec={degrees:value,instrument:'aligned-protractor',min:0,max:180};q.solution={value,tolerance:1};
 }else if(format==='grid'){
  const percent=[35,45,60,25][variant%4];q.title='Einen Flächenanteil darstellen';q.prompt=`Markiere ${percent} % der Fläche.`;
  q.hint='Alle 20 Kästchen sind gleich groß. Entscheidend ist der Anteil, nicht die Anordnung deiner Markierungen.';
  q.spec={rows:4,columns:5};q.solution={count:percent/5};
 }else if(format==='chart'){
  const sets=[[4,7,5],[8,3,6],[6,9,2]];const vals=sets[variant%sets.length];q.subject='NT';q.title='Messwerte in ein Diagramm übertragen';
  q.prompt='Ergänze das Säulendiagramm anhand der gemessenen Pflanzenhöhen in der Tabelle.';
  q.hint='Tippe in eine Säule oder ziehe ihren Griff. Die Pfeiltasten verändern die Höhe in Schritten von 1 cm.';
  q.maxPoints=3;q.spec={min:0,max:10,step:1,unit:'cm',categories:[{id:'a',label:'Pflanze A',value:vals[0]},{id:'b',label:'Pflanze B',value:vals[1]},{id:'c',label:'Pflanze C',value:vals[2]}]};
  q.solution={values:Object.fromEntries(q.spec.categories.map(x=>[x.id,x.value]))};
 }
 if(options.maxPoints!==undefined)q.maxPoints=Number(options.maxPoints);
 validateTask(q);return q;
}
function validateTask(q){
 if(!q||q.schemaVersion!==1||!formats.includes(q.format))throw new Error('Ungültiges Aufgabenformat.');
 if(!Number.isFinite(q.maxPoints)||q.maxPoints<0.5||q.maxPoints>100||!Number.isInteger(q.maxPoints*2))throw new Error('Punkte müssen zwischen 0,5 und 100 in 0,5-Schritten liegen.');
 if(!q.id||typeof q.prompt!=='string'||!q.solution||!q.spec)throw new Error('Aufgabe ist unvollständig.');
 return true;
}
function publicTask(q){const r=clone(q);delete r.solution;return r;}
function solutionResponse(q){
 switch(q.format){
 case 'hotspot':return clone(q.solution.regions);
 case 'labeling':return clone(q.solution.assignments);
 case 'scale':case 'angle':return q.solution.value;
 case 'grid':return Array.from({length:q.solution.count},(_,i)=>i);
 case 'chart':return clone(q.solution.values);
 }
}
function isAnswered(q,a){
 if(a===null||a===undefined)return false;
 if(q.format==='angle'||q.format==='scale')return numeric(a)!==null;
 if(q.format==='hotspot')return Array.isArray(a)&&a.length===1;
 if(q.format==='grid')return Array.isArray(a)&&a.length>0;
 if(q.format==='labeling')return typeof a==='object'&&q.spec.regions.every(id=>Boolean(a[id]));
 if(q.format==='chart')return typeof a==='object'&&q.spec.categories.every(x=>numeric(a[x.id])!==null);
 return false;
}
function grade(q,answer){
 validateTask(q);let ratio=0,details=[],valid=true;
 const invalid=()=>{valid=false;ratio=0;};
 switch(q.format){
 case 'hotspot':{
  const a=Array.isArray(answer)?answer:[];
  valid=a.length<=q.spec.maxSelections&&new Set(a).size===a.length&&a.every(x=>q.spec.regions.includes(x));
  ratio=valid&&a.length===1&&a[0]===q.solution.regions[0]?1:0;
  details=[{expected:q.solution.text,correct:ratio===1}];break;
 }
 case 'labeling':{
  const a=answer&&typeof answer==='object'&&!Array.isArray(answer)?answer:{};
  const vals=Object.values(a).filter(Boolean),ids=q.spec.items.map(x=>x.id);
  if(Object.keys(a).some(k=>!q.spec.regions.includes(k))||vals.some(v=>!ids.includes(v))||new Set(vals).size!==vals.length)invalid();
  details=q.spec.regions.map(id=>({id,correct:a[id]===q.solution.assignments[id],expected:q.spec.items.find(x=>x.id===q.solution.assignments[id]).text}));
  ratio=valid?details.filter(x=>x.correct).length/q.spec.regions.length:0;break;
 }
 case 'angle':case 'scale':{
  const value=numeric(answer),min=q.format==='angle'?0:q.spec.min,max=q.format==='angle'?180:q.spec.max;
  valid=value===null||(value>=min&&value<=max);
  ratio=value!==null&&valid&&Math.abs(value-q.solution.value)<=q.solution.tolerance+1e-9?1:0;
  details=[{expected:formatNumber(q.solution.value)+(q.format==='angle'?'°':q.spec.unit?' '+q.spec.unit:''),correct:ratio===1}];break;
 }
 case 'grid':{
  const a=Array.isArray(answer)?answer:[];
  valid=new Set(a).size===a.length&&a.every(x=>Number.isInteger(x)&&x>=0&&x<q.spec.rows*q.spec.columns);
  ratio=valid&&a.length===q.solution.count?1:0;
  details=[{expected:`${q.solution.count} von ${q.spec.rows*q.spec.columns} Kästchen`,correct:ratio===1}];break;
 }
 case 'chart':{
  const a=answer&&typeof answer==='object'&&!Array.isArray(answer)?answer:{};const keys=q.spec.categories.map(x=>x.id);
  valid=Object.keys(a).every(k=>keys.includes(k))&&Object.values(a).every(v=>numeric(v)!==null&&numeric(v)>=q.spec.min&&numeric(v)<=q.spec.max);
  details=q.spec.categories.map(x=>({id:x.id,expected:`${x.label}: ${q.solution.values[x.id]} ${q.spec.unit}`,correct:numeric(a[x.id])===q.solution.values[x.id]}));
  ratio=valid?details.filter(x=>x.correct).length/keys.length:0;break;
 }
 }
 const points=Math.floor(q.maxPoints*ratio*2+1e-9)/2;
 return {points,maxPoints:q.maxPoints,correct:ratio===1,valid,details,message:!valid?'Ungültige Antwort.':ratio===1?'Richtig gelöst.':points>0?'Teilweise richtig.':'Noch nicht richtig gelöst.'};
}
return Object.freeze({formats,names,scenes,generate,validateTask,publicTask,solutionResponse,isAnswered,grade,numeric,formatNumber,clone});
});
