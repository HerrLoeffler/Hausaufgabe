'use strict';
const {core}=require('../../../functions/lib/visual-task');
const {createDreisatz}=require('../../../functions/lib/visual/dreisatz-builder');
const {solve,checkFit}=require('./oracle.cjs');
function buildCandidate(plan,{id,modes=['factor','factor','factor','factor']}){
  if(typeof plan.text!=='string'||plan.text.length<4||plan.text.length>1800)throw Error('Ein vollständiger kurzer Auftrag fehlt.');
  const q={id,type:'single',heading:plan.title||'Passenden Rechenweg finden',subject:plan.subject||'Mathematik',text:plan.text,points:.5};
  if(['other','clarify'].includes(plan.kind)){
    q.text+=' Welche Vorgehensweise passt zu diesem Auftrag?';
    q.options=[
      {text:'Ein einfacher Dreisatz mit einem konstanten Verhältnis oder Produkt genügt.',correct:false},
      {text:'Eine andere Darstellung oder ein mehrstufiger Rechenweg ist erforderlich.',correct:plan.kind==='other'},
      {text:'Zuerst müssen fehlende oder widersprüchliche Angaben geklärt werden.',correct:plan.kind==='clarify'}
    ];
    return q;
  }
  const fit=checkFit({...plan,positive:[plan.a,plan.b,plan.c].every(x=>Number(String(x).replace(',','.'))>0)});
  if(!fit.eligible||plan.relationship!==plan.kind)throw Error('Die Voraussetzungen des Dreisatzes fehlen.');
  if(!Array.isArray(plan.labels)||plan.labels.length!==2||plan.labels.some(x=>typeof x!=='string'||x.length<1||x.length>60))throw Error('Zwei Größen mit Einheiten angeben.');
  const solved=solve(plan);
  q.text+=' Ergänze den Rechenweg über '+solved.pivot.replace('.',',')+' in der linken Spalte. Verwende mal oder geteilt durch in Pfeilrichtung. Jedes offene Feld zählt 0,5 Punkte.';
  const base={...core.example('table'),id,subject:q.subject,title:q.heading,prompt:q.text,objective:q.text,
    rationale:'Die belegte Beziehung wird mit unabhängig berechneten Zwischenwerten dargestellt.'};
  const task=createDreisatz(base,{labels:plan.labels,values:solved.values,operations:solved.operations,modes});
  q.type='visual';q.trainingPolicy='relation-v1';q.points=task.maxPoints;q.visualTask=JSON.stringify(task);
  return q;
}
function visibleProblem(q){
  if(q.type==='single')return {title:q.heading,text:q.text,options:q.options.map(o=>o.text)};
  const task=JSON.parse(q.visualTask);
  return {title:q.heading,text:q.text,columns:task.spec.columns,rows:task.spec.rows.map(r=>r.map(c=>c.input?'[offen]':c.text))};
}
module.exports={buildCandidate,visibleProblem};
