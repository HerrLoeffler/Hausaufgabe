'use strict';
const clone=value=>globalThis.structuredClone(value);
function sceneRegions(task={},observation=null){
 const regions=[],add=(id,label)=>{if(!regions.some(r=>r.id===id))regions.push({id,label:String(label).slice(0,100)});};
 const d=task.diagram,w=task.workshop;
 if(d){
  add('shape','Die vorhandene Darstellung');
  if(d.kind==='area-grid'){
   for(const {x,y}of d.cells||[])add(`cell:${x}:${y}`,`Kästchen in Reihe ${y+1}, Spalte ${x+1}`);
   for(const y of [...new Set((d.cells||[]).map(c=>c.y))])add(`row:${y}`,d.rows===1?'Die einzige Reihe':`Reihe ${y+1} von oben`);
   for(const x of [...new Set((d.cells||[]).map(c=>c.x))])add(`column:${x}`,`Spalte ${x+1} von links`);
  }
  for(const key of ['width','height','length','radius','a','b','c'])if(Number.isFinite(d[key]))add('side:'+key,key+': '+d[key]+(d.unit?' '+d.unit:''));
  if(d.kind==='angle')add('angle','Der gezeigte Winkel');
  if(d.kind==='bars')d.bars.forEach((b,i)=>add('bar:'+i,b.label));
  for(const p of d.points||[])add('point:'+p.label,'Punkt '+p.label);
  if(d.kind==='data-list')d.values.forEach((v,i)=>add('value:'+i,'Wert '+(i+1)+': '+v));
  add('unit',d.unit||'Die Einheit der Darstellung');
 }
 if(w){
  add('shape','Dein vorhandenes Modell');
  if(w.tool==='fraction-board'||w.tool==='fraction-units'){
   const parts=observation?.tool===w.tool&&Number.isInteger(observation.final?.denominator)?observation.final.denominator:w.initialState?.parts||w.denominator;for(let i=0;i<Math.min(144,parts*(w.wholeCount||1));i++)add('part:'+i,`Dein Teil ${i+1} von ${parts}`);
   if(w.tool==='fraction-board')for(let i=0;i<w.denominator;i++)add('reference-part:'+i,`Vorlage: Teil ${i+1} von ${w.denominator}`);
   for(let i=0;i<(w.wholeCount||1);i++)add('whole:'+i,'Ganzes '+(i+1));
   add('numerator','Zähler: wie viele Teile');add('denominator','Nenner: Teilung eines Ganzen');
  }
  if(w.tool==='text-workbench'){const tokens=w.mode==='order'?w.tokens:w.text?.trim().split(/\s+/);(tokens||[]).forEach((t,i)=>add('token:'+i,'Wort '+(i+1)+': '+t));}
  if(w.tool==='number-line'){add('minimum','Linker Skalenanfang');add('maximum','Rechter Skalenrand');add('step','Abstand zwischen zwei Strichen');}
  if(w.tool==='balance'){add('left','Linke Waagschale');add('right','Rechte Waagschale');add('unknown','Unbekanntes Gewicht');}
  if(w.tool==='angle-protractor')add('angle','Winkel und beweglicher Schenkel');
  if(w.tool==='coordinate-plane'){add('x-axis','Waagerechte x-Achse');add('y-axis','Senkrechte y-Achse');for(const label of w.labels||[])add('point:'+label,'Punkt '+label);}
 }
 if(!d&&!w){const tokens=(task.contextText||task.prompt||'').trim().split(/\s+/);tokens.slice(0,80).forEach((t,i)=>add('token:'+i,'Wort '+(i+1)+': '+t));}
 return regions.slice(0,220);
}
function anchoredCandidate(h,s,context={}){
 const source=s.originalTask||s.task;
 const reject=message=>{const error=new Error(message);error.code='unavailable';error.stage='anchored-help-validation';error.critique=message;throw error;};
 if(!source?.id)reject('Die Hilfe benötigt eine gespeicherte Ausgangsaufgabe.');
 for(const [key,max]of [['explanation',300],['question',240],['rubric',1200]])if(typeof h?.[key]!=='string'||!h[key].trim()||h[key].length>max)reject('Ungültige kurze Hilfe: '+key);
 if(/\b(?:token|cell|row|column|part|reference-part|whole|side|point):[a-z0-9]/i.test(h.explanation+' '+h.question))reject('Interne Fokus-IDs gehören nur in focusIds, niemals in die Erklärung oder Frage an das Kind. Verwende normale Wörter wie das dritte Wort, Zähler oder dieses Kästchen.');
 if(!['number','text','choice','workshop'].includes(h.input)||!Array.isArray(h.options)||h.options.length>6||h.options.some(x=>typeof x!=='string'||x.length>150))reject('Ungültiger Antwortweg der Hilfe.');
 if(!['number','rational','exact-fraction','open'].includes(h.answer?.kind)||!Array.isArray(h.answer.values)||s.phase!=='teacher'&&!h.answer.values.length||h.answer.values.length>12||h.answer.values.some(v=>typeof v!=='string'||v.length>300))reject('Der Hilfeschritt braucht einen prüfbaren Antwortschlüssel.');
 if(h.input==='choice'&&(h.options.length<2||h.answer.values.some(v=>!h.options.includes(v))))reject('Auswahl und Hilfefrage passen nicht zusammen.');
 const regions=sceneRegions(source,context.workshop),ids=new Set(regions.map(r=>r.id));
 if(!Array.isArray(h.focusIds)||h.focusIds.length>12||h.focusIds.some(id=>!ids.has(id)))reject('Die Hilfe verweist auf eine nicht vorhandene region.');
 if(source.diagram?.kind==='area-grid'&&source.diagram.rows===1&&/ober(?:e|en|ste|sten)\s+Reihe/i.test(h.question+' '+h.explanation))reject('Sprich bei der einzigen Reihe von dieser Reihe, nicht von einer oberen Reihe.');
 if(h.input==='workshop'&&(!source.workshop||JSON.stringify(h.answer)!==JSON.stringify(source.answer)))reject('Der Antwortvertrag der Werkstatthandlung muss unverändert bleiben.');
 const task={...clone(source),prompt:h.question,input:h.input,options:clone(h.options),answer:clone(h.answer),rubric:h.rubric,family:'anchored-help',generationSource:'live-ai-help'};
 if(task.workshop)task.workshop={...task.workshop,role:h.input==='workshop'?'answer':'support'};
 // IDs stay stable for the preserved manipulation. Session revision guards stale submissions.
 return {task,explanation:h.explanation,visual:null,assistance:{version:1,anchorTaskId:source.id,stage:Math.max(1,Math.min(3,s.supportStage||1)),focusIds:[...h.focusIds],numberLabels:h.numberLabels===true,regions,replyTo:String(context.question||s.assistance?.replyTo||'').slice(0,2000)}};
}
module.exports={sceneRegions,anchoredCandidate};
