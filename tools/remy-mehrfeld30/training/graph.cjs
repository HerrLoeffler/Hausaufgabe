'use strict';
const {createHash}=require('node:crypto');
const {core}=require('../../../functions/lib/visual-task');
const {projectDiagram}=require('../round-two.cjs');
const {buildCandidate,visibleProblem}=require('./builder.cjs');
const {checkCandidate}=require('./checker.cjs');
const {calculateBinary}=require('./oracle.cjs');
const profile=require('./graph-profile.cjs');
const normalize=value=>String(value).trim().toLowerCase().replace(/[.!?]+$/,'').replace(/\s+/g,' ');
const numeric=value=>{try{return calculateBinary({op:'add',left:value,right:'0'});}catch{return null;}};
const key=value=>'g'+createHash('sha256').update(value).digest('hex').slice(0,14);
function text(value,max=500){
  if(typeof value!=='string'||!value.trim()||value.length>max)throw Error('Text fehlt oder ist zu lang.');
  return value.trim();
}
function buildGraph(plan,{id,modes}={}){
  if(['direct','inverse'].includes(plan.kind))return buildCandidate(plan,{id,modes:modes||plan.arrowModes});
  const q={id,heading:text(plan.title,100),subject:text(plan.subject,60),text:text(plan.text,1800),points:0};
  if(['clarify','decline'].includes(plan.kind))return {...q,type:'notice',notice:{kind:plan.kind},reason:text(plan.reason)};
  if(plan.kind==='mapping'){
    const nodes=plan.nodes;
    if(!Array.isArray(nodes)||nodes.length<4||nodes.length>6||new Set(nodes.map(n=>n.id)).size!==nodes.length)throw Error('Zwei eindeutige Gruppen angeben.');
    const sources=nodes.filter(n=>n.role==='source'),targets=nodes.filter(n=>n.role==='target');
    if(sources.length!==targets.length||sources.length<2||sources.length>3)throw Error('Gleich große Zuordnungsgruppen angeben.');
    const refs=new Map(nodes.map(n=>[n.id,key(id+':'+n.id+':'+text(n.label,250))]));
    if(plan.links?.length!==sources.length||new Set(plan.links.map(e=>e.from)).size!==sources.length||new Set(plan.links.map(e=>e.to)).size!==targets.length||
      plan.links.some(e=>!sources.some(n=>n.id===e.from)||!targets.some(n=>n.id===e.to)))throw Error('Eine eindeutige gerichtete 1:1-Zuordnung angeben.');
    const arranged=[...sources.map((n,i)=>({...n,x:150,y:75+i*105,shortLabel:(plan.sourceRole||'Start').slice(0,8)+' '+(i+1)})),
      ...[...targets].sort((a,b)=>refs.get(a.id).localeCompare(refs.get(b.id))).map((n,i)=>({...n,x:570,y:75+i*105,shortLabel:(plan.targetRole||'Ziel').slice(0,8)+' '+String.fromCharCode(65+i)}))];
    const t={...core.example('connections'),id,title:q.heading,subject:q.subject,prompt:q.text,objective:q.text,maxPoints:sources.length*.5,
      rationale:'Inhaltlich bestimmte Beziehungen werden zugeordnet.',spec:{directed:true,nodes:arranged.map(n=>({id:refs.get(n.id),label:n.label,shortLabel:n.shortLabel,x:n.x,y:n.y}))},
      solution:{edges:plan.links.map(e=>[refs.get(e.from),refs.get(e.to)])}};
    return {...q,type:'visual',points:t.maxPoints,shape:'Zuordnung',visualTask:JSON.stringify(t)};
  }
  if(!['chain','branch'].includes(plan.kind)||!Array.isArray(plan.paths)||plan.paths.length<1||plan.paths.length>4||
    !Array.isArray(plan.fields)||plan.fields.length<1||plan.fields.length>8)throw Error('Eine unterstützte Anordnung mit offenen Feldern angeben.');
  const refs=new Map();
  const fields=plan.fields.map((f,index)=>{
    if(!/^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/.test(f.id)||!['number','text','choice'].includes(f.mode)||f.accepted?.length!==1)throw Error('Klares Feld mit einer kanonischen Antwort angeben.');
    const accepted=[text(f.accepted[0],120)];
    if(f.mode==='number')accepted[0]=calculateBinary({op:'add',left:accepted[0],right:'0'});
    refs.set(f.id,'f'+(index+1));
    const field={id:refs.get(f.id),label:text(f.label,70),mode:f.mode,accepted};
    if(f.mode==='choice'){
      if(!Array.isArray(f.options)||f.options.length<2||f.options.length>6||new Set(f.options.map(normalize)).size!==f.options.length||
        !f.options.includes(accepted[0]))throw Error('Auswahlfeld mit unterschiedlichen Optionen angeben.');
      field.options=f.options.map(v=>text(v,120));
    }
    if(f.mode==='number'&&calculateBinary(f.calculation)!==accepted[0].replace(',','.'))throw Error('Unabhängige Rechnung stimmt nicht mit dem Feld überein.');
    return field;
  });
  if(refs.size!==fields.length)throw Error('Feld-IDs müssen eindeutig sein.');
  const used=[];
  const paths=plan.paths.map(p=>{
    if(!Array.isArray(p.steps)||p.steps.length<3||p.steps.length>12||!p.steps.some(s=>s.type==='arrow'))throw Error('Pfad mit beschriftetem Pfeil angeben.');
    return {title:text(p.title,100),steps:p.steps.map(s=>{
      if(s.type==='field'){if(!refs.has(s.fieldId))throw Error('Unbekanntes Feld.');used.push(refs.get(s.fieldId));return {field:refs.get(s.fieldId)};}
      if(s.type==='arrow')return {arrow:text(s.text,100)};
      if(s.type==='text')return {label:text(s.text,250)};
      throw Error('Unbekannter Baustein.');
    })};
  });
  if(used.length!==fields.length||new Set(used).size!==fields.length)throw Error('Jedes offene Feld genau einmal verwenden.');
  return {...q,type:'diagram',paths,fields,branchRoot:plan.kind==='branch'?text(plan.branchRoot,120):null,
    shape:plan.kind==='branch'?'Verzweigung':'Felder und Pfeile',points:fields.length*.5};
}
function graphAnswer(q){
  if(q.type==='notice')return null;
  if(q.type==='diagram')return Object.fromEntries(q.fields.map(f=>[f.id,f.accepted[0]]));
  return core.solutionResponse(JSON.parse(q.visualTask));
}
function visibleGraph(q){
  if(q.type==='diagram')return {title:q.heading,text:q.text,...projectDiagram(q)};
  if(q.type==='notice')return {title:q.heading,text:q.text};
  if(JSON.parse(q.visualTask).format==='connections'){
    const t=core.publicTask(JSON.parse(q.visualTask));
    return {title:q.heading,text:q.text,nodes:t.spec.nodes,directed:true};
  }
  return visibleProblem(q);
}
function checkGraph(plan,judge,expected,q){
  const errors=[];
  if(expected?.kind&&plan.kind!==expected.kind||expected?.allowedKinds&&!expected.allowedKinds.includes(plan.kind))errors.push('Die Form passt nicht zum festgelegten Prüfwunsch.');
  if(['direct','inverse'].includes(plan.kind)){const result=checkCandidate(plan,judge,expected,q);errors.push(...result.errors);return {ok:errors.length===0,errors};}
  if(judge.kind!==plan.kind)errors.push('Die unabhängige Prüfung wählt eine andere Beziehung.');
  if(!judge.matchesWish)errors.push('Der Auftrag erfüllt den ursprünglichen Wunsch nicht.');
  if(!judge.appropriate)errors.push('Die Darstellung ist fachlich ungeeignet.');
  if(!judge.unambiguous)errors.push('Die Aufgabe ist nicht eindeutig lösbar.');
  if(judge.leaksAnswer)errors.push('Eine gesuchte Antwort wird im öffentlichen Auftrag verraten.');
  if(q.type==='diagram'){
    const answers=judge.answers||[];
    if(answers.length!==q.fields.length||new Set(answers.map(a=>a.id)).size!==q.fields.length||
      q.fields.some(f=>!answers.some(a=>a.id===f.id&&(f.mode==='number'?numeric(a.value)===numeric(f.accepted[0]):normalize(a.value)===normalize(f.accepted[0])))))
      errors.push('Unabhängige Lösungen und Feldantworten stimmen nicht überein.');
    if(expected?.answers&&expected.answers.map(normalize).sort().join('|')!==q.fields.map(f=>normalize(f.accepted[0])).sort().join('|'))
      errors.push('Die Referenzantworten des Prüfwunsches wurden verändert.');
  }
  if(plan.kind==='mapping'){
    const edges=JSON.parse(q.visualTask).solution.edges.map(e=>e.join('>')).sort();
    const given=(judge.links||[]).map(e=>e.from+'>'+e.to).sort();
    if(edges.join('|')!==given.join('|'))errors.push('Die unabhängig ermittelten Zuordnungen widersprechen dem Schlüssel.');
  }
  return {ok:errors.length===0,errors};
}
module.exports={...profile,buildGraph,visibleGraph,checkGraph,graphAnswer};
