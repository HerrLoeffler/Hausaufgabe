import {ARROW_MODES,configureDreisatz,dreisatzSettings} from './dreisatz.mjs';
import {ACTIVE_VISUAL_FORMATS} from "./visual-format-choice.mjs";
import {renderAuthoringFields} from "./visual/authoring-fields.mjs";
// Adapter for the approved Prototype 02. Tasks are data, never HTML or executable code.
export const VISUAL_FORMATS = Object.freeze(['hotspot','labeling','scale','angle','grid','chart','connections','coordinate','evidence','range','table','correction','timeline','sequence']);
const core = () => globalThis.GC2;
const expandedDreisatz=new WeakSet();
export function parseNumericAnswer(value) { return core().numeric(value); }
const plain = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const fail = () => { throw new Error('Die visuelle Aufgabe ist unvollständig oder ungültig.'); };
function checkTree(x, depth = 0) {
  if (depth > 8) fail();
  if (typeof x === 'number' && (!Number.isFinite(x) || Math.abs(x)>1e7)) fail();
  if (typeof x === 'string' && (x.length > 4000 || /[<>]|(?:javascript|data|vbscript):/i.test(x))) fail();
  if (Array.isArray(x)) { if(x.length>100) fail(); x.forEach(v=>checkTree(v,depth+1)); }
  else if (plain(x)) {
    if(Object.keys(x).length>100) fail();
    for(const [key,value] of Object.entries(x)) {
      if(!/^[A-Za-z0-9_-]{1,60}$/.test(key)||['__proto__','constructor','prototype'].includes(key)) fail();
      if(key==='id' && (typeof value!=='string'||! /^[a-zA-Z0-9_-]{1,60}$/.test(value))) fail();
      checkTree(value,depth+1);
    }
  }
}
// A private, synthetic key validates public geometry with the prototype validator.
// It is never returned, rendered, stored or used for assessment.
function geometryKey(t) {
  const s=t.spec;
  switch(t.format){
    case'hotspot':return {regions:['r1']};
    case'labeling':return {assignments:Object.fromEntries(s.regions.map((r,i)=>[r,s.items[i]?.id]))};
    case'timeline':return {assignments:Object.fromEntries(s.ticks.map((tick,i)=>[tick.id,s.events[i]?.id]))};
    case'sequence':return {order:s.items.map(item=>item.id)};
    case'scale':return {value:s.min,tolerance:0};
    case'angle':return {value:s.degrees,tolerance:1};
    case'grid':return {count:1};
    case'chart':return {values:Object.fromEntries(s.categories.map(c=>[c.id,c.value]))};
    case'connections':return {edges:[[s.nodes[0]?.id,s.nodes[1]?.id]]};
    case'coordinate':return {points:s.labels.map((_,i)=>({x:i?s.maxX:s.minX,y:s.minY}))};
    case'evidence':return {selections:[[s.tokens[0]?.id]]};
    case'range':return {start:s.min,end:s.max};
    case'table':return {cells:s.rows.flat().filter(c=>c.input).map(c=>({id:c.id,accepted:['0']}))};
    case'correction':return {rowId:s.rows[0]?.id,accepted:['0']};
    default:fail();
  }
}
const specFields={hotspot:'scene regions maxSelections',labeling:'scene regions items',scale:'context min max step majorStep unit card',angle:'degrees instrument min max',grid:'rows columns',chart:'min max step unit categories',connections:'directed nodes',coordinate:'mode minX maxX minY maxY step labels',evidence:'tokens',range:'min max step majorStep unit context startInclusive endInclusive',table:'columns rows answerMode numericForm layout',correction:'rows answerMode numericForm caseSensitive',timeline:'min max unit ticks events',sequence:'family items'};
const solutionFields={hotspot:'regions text',labeling:'assignments',scale:'value tolerance',angle:'value tolerance',grid:'count',chart:'values',connections:'edges',coordinate:'points',evidence:'selections',range:'start end',table:'cells',correction:'rowId accepted',timeline:'assignments',sequence:'order'};
function closed(value,fields){if(!plain(value)||Object.keys(value).some(key=>!fields.split(' ').includes(key)))fail();}
export function parseVisualTask(question, { publicOnly = false } = {}) {
  const json=question?.visualTask;
  if(typeof json!=='string'||json.length>20000) fail();
  let t;try { t=JSON.parse(json); } catch { fail(); }
  if(!plain(t)||!VISUAL_FORMATS.includes(t.format)||!plain(t.spec)) fail();
  checkTree(t);
  closed(t,'schemaVersion id revision format title subject grade prompt hint maxPoints objective rationale sourceNote spec solution provenance review');
  closed(t.spec,specFields[t.format]);
  if(!publicOnly)closed(t.solution,solutionFields[t.format]);
  if(t.provenance!==undefined)closed(t.provenance,'kind offline model createdAt requestId');
  if(t.review!==undefined)closed(t.review,'status summary warnings teacherApprovalRequired');
  const s=t.spec;
  if(Object.hasOwn(s,'caseSensitive')&&typeof s.caseSensitive!=='boolean')fail();
  const records=(values,fields)=>{if(!Array.isArray(values))fail();values.forEach(v=>closed(v,fields));};
  if(s.items)records(s.items,t.format==='sequence'?'id illustration caption':'id text');
  if(t.format==='timeline'){records(s.ticks,'id value label');records(s.events,'id text');}
  if(s.tokens)records(s.tokens,'id text');
  if(s.categories)records(s.categories,'id label value');
  if(s.nodes)records(s.nodes,'id label shortLabel x y');
  if(t.format==='correction')records(s.rows,'id text');
  if(t.format==='table'&&Array.isArray(s.rows))records(s.rows.flat(),'id text input control');
  if(t.format==='table') {
    if(!Array.isArray(s.columns)||s.columns.length<2||s.columns.length>8||!s.columns.every(c=>typeof c==='string')||!Array.isArray(s.rows)||!s.rows.length||s.rows.length>20||s.rows.some(row=>!Array.isArray(row)||row.length!==s.columns.length||row.some(c=>!plain(c)||typeof c.id!=='string'||typeof c.text!=='string'||typeof c.input!=='boolean'))) fail();
    const cells=s.rows.flat(),ids=cells.map(c=>c.id);
    if(new Set(ids).size!==ids.length||!cells.some(c=>c.input)||!['numeric','text'].includes(s.answerMode)) fail();
    if(!publicOnly&&(!Array.isArray(t.solution?.cells)||t.solution.cells.length!==cells.filter(c=>c.input).length||t.solution.cells.some(c=>!cells.some(v=>v.input&&v.id===c.id)||!Array.isArray(c.accepted)||!c.accepted.length||c.accepted.some(a=>typeof a!=='string'||((c.answerMode||s.answerMode)==='numeric'&&core().numeric(a)===null)))||new Set(t.solution.cells.map(c=>c.id)).size!==t.solution.cells.length)) fail();
  }
  try {
    const candidate=publicOnly?{...t,rationale:'Public geometry validation',solution:geometryKey(t)}:t;
    if(core().validate(candidate,{publicOnly}).length) fail();
  } catch { fail(); }
  return t;
}
export function normalizeVisualTask(question) {
  const task=parseVisualTask(question);
  task.maxPoints=Number(question.points)||task.maxPoints;
  if(core().validate(task).length) fail();
  return JSON.stringify(task);
}
export function visualAnswered(q, value) {
  try { return core().isAnswered(parseVisualTask(q,{publicOnly:true}),decodeVisualAnswer(value)); } catch { return false; }
}
export function decodeVisualAnswer(value) {
  if(typeof value==='string') { try { return JSON.parse(value); } catch { return value; } }
  return value;
}
export function evaluateVisual(q,value) {
  const task=parseVisualTask(q);task.maxPoints=Number(q.points)||task.maxPoints;
  const result=core().grade(task,decodeVisualAnswer(value));
  return {awarded:result.points,max:result.maxPoints,needsReview:false,correct:result.correct};
}
export function visualSolution(q) { try{const t=parseVisualTask(q);if(t.format==='table')return t.solution.cells.map(cell=>{const ri=t.spec.rows.findIndex(r=>r.some(c=>c.id===cell.id)),ci=t.spec.rows[ri].findIndex(c=>c.id===cell.id);let label='Zeile '+(ri+1)+' · '+t.spec.columns[ci];if(t.spec.layout==='dreisatz')label=[1,3].includes(ri)?(ci<2?'Links':'Rechts')+' · '+(ri===1?'erster':'zweiter')+' Rechenschritt'+([0,4].includes(ci)?' · Zeichen':''):(ri===0?'Ausgangswert':ri===2?'Zwischenschritt':'Ergebnis')+' · '+t.spec.columns[ci];return label+': '+cell.accepted.join(' / ');}).join(' · ');return core().solutionText(t);}catch{return 'Aufgabe prüfen';} }
const controllers=new WeakMap();
const mounted=new Set();
let detachObserver;
function watchDetach(section, controller) {
  const entry={section,controller};mounted.add(entry);
  if(!detachObserver && globalThis.MutationObserver) {
    detachObserver=new MutationObserver(()=>{for(const item of mounted){if(!item.section.isConnected){item.controller.destroy();mounted.delete(item);}}});
    detachObserver.observe(document.documentElement,{childList:true,subtree:true});
  }
  return entry;
}
export function collectVisualAnswer(section) { return controllers.get(section)?.getAnswer() ?? null; }
export function mountVisualQuestion(section, question, initial = null, options = {}) {
  const previous=controllers.get(section);previous?.destroy();
  let task;try { task=parseVisualTask(question,{publicOnly:true}); } catch(error) { const warning=document.createElement('p');warning.textContent=error.message;section.append(warning);return; }
  section.querySelector('.gc-visual')?.remove();
  const host=document.createElement('div');host.className='gc-visual renderer';section.append(host);
  const controller=globalThis.GCRenderer.mount(host,task,decodeVisualAnswer(initial),{...options,compactDreisatz:task.spec.layout==='dreisatz',onAnswer(answer){options.onAnswer?.(answer);section.dispatchEvent(new Event('input',{bubbles:true}));section.dispatchEvent(new Event('change',{bubbles:true}));}});
  controllers.set(section,controller);
  for(const entry of mounted)if(entry.section===section)mounted.delete(entry);
  watchDetach(section,controller);
  return controller;
}
export function renderVisualEditor(container, q, onChange, {onFormatChange} = {}) {
  const formatLabel=document.createElement('label');formatLabel.textContent='Visuelle Interaktion';
  const select=document.createElement('select');
  for(const format of ACTIVE_VISUAL_FORMATS){const option=document.createElement('option');option.value=format;option.textContent=core().names[format];select.append(option);}
  let task;try{task=parseVisualTask(q);}catch(error){
    const warning=document.createElement('p');warning.setAttribute('role','alert');warning.textContent=error.message+' Bitte mit Emmi überarbeiten oder eine neue Aufgabe erstellen.';
    container.append(warning);const create=document.createElement('button');create.type='button';create.className='button secondary';create.textContent='Visuelle Aufgabe mit KI erstellen';create.addEventListener('click',()=>onFormatChange?.('grid'));container.append(create);return;
  }
  if(!ACTIVE_VISUAL_FORMATS.includes(task.format)){const historical=document.createElement('option');historical.value=task.format;historical.textContent=core().names[task.format];select.append(historical);}
  select.value=task.format;formatLabel.append(select);container.append(formatLabel);
  const fields=document.createElement('div');container.append(fields);
  if(task.spec.layout==='dreisatz'){
    const settings=document.createElement('details');settings.className='gc-dreisatz-settings';settings.open=expandedDreisatz.has(q);settings.addEventListener('toggle',()=>{if(settings.open)expandedDreisatz.add(q);else expandedDreisatz.delete(q);});container.append(settings);
    const summary=document.createElement('summary');summary.textContent='Hilfen und offene Felder anpassen';settings.append(summary);
    const grid=document.createElement('div');grid.className='settings-grid';settings.append(grid);
    const current=dreisatzSettings(task),apply=changes=>{try{const next=configureDreisatz(task,changes);q.visualTask=JSON.stringify(next);q.points=next.maxPoints;expandedDreisatz.add(q);onChange(true);}catch(e){const alert=document.createElement('p');alert.setAttribute('role','alert');alert.textContent=e.message;settings.append(alert);}};
    current.modes.forEach((mode,i)=>{const label=document.createElement('label');label.textContent=['Links · erster Pfeil','Rechts · erster Pfeil','Links · zweiter Pfeil','Rechts · zweiter Pfeil'][i];const select=document.createElement('select');for(const [value,text]of Object.entries(ARROW_MODES)){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}select.value=mode;select.addEventListener('change',()=>{const modes=[...current.modes];modes[i]=select.value;apply({modes});});label.append(select);grid.append(label);});
    current.givens.forEach((given,i)=>{const label=document.createElement('label');label.className='given-toggle';const box=document.createElement('input');box.type='checkbox';box.checked=given;box.addEventListener('change',()=>{const givens=[...current.givens];givens[i]=box.checked;apply({givens});});label.append(box,document.createTextNode(['Ausgangswert','Zwischenschritt','Ergebnis'][Math.floor(i/2)]+' · '+current.labels[i%2]+' vorgeben'));grid.append(label);});
  }
  const preview=document.createElement('div');container.append(preview);
  const solution=document.createElement('p');solution.className='hint';container.append(solution);
  function show(){mountVisualQuestion(preview,q);solution.textContent='Lösung: '+visualSolution(q);}
  function editFields(){fields.replaceChildren();renderAuthoringFields(fields,task,next=>{task=next;q.visualTask=JSON.stringify(task);q.text=task.prompt;onChange(true);editFields();show();},{getPrompt:()=>q.text,validateDraft:next=>normalizeVisualTask({...q,visualTask:JSON.stringify(next)})});}
  select.addEventListener('change',async()=>{const requested=select.value;select.value=task.format;if(!ACTIVE_VISUAL_FORMATS.includes(requested)||select.disabled)return;select.disabled=true;try{await onFormatChange?.(requested);}finally{select.disabled=false;}});
  editFields();show();
}
