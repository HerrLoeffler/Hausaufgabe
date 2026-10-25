// Own fixed-unit fraction renderer. All whole strips share exactly one width.
const keys = ['tool','version','role','goal','denominator','wholeCount','instruction'];
const integer = (n,min,max) => Number.isInteger(n) && n>=min && n<=max;
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function config(value) {
  if (!value || typeof value!=='object' || Array.isArray(value) || Object.keys(value).length!==keys.length || keys.some(k=>!Object.hasOwn(value,k)) || value.tool!=='fraction-units' || value.version!==1 || !['answer','support'].includes(value.role) || value.goal!=='represent' || !integer(value.denominator,2,12) || !integer(value.wholeCount,1,4) || typeof value.instruction!=='string' || !value.instruction.trim() || value.instruction.length>240) return null;
  return Object.fromEntries(keys.map(k=>[k,value[k]]));
}
export function create(taskId,value) {
  const descriptor=config(value);
  return descriptor && typeof taskId==='string' && taskId.trim() ? {taskId,descriptor,signature:JSON.stringify(descriptor),parts:descriptor.denominator,selected:[],actions:[]} : null;
}
export function action(state,a) {
  if (!state || !config(state.descriptor) || state.actions.length>=60 || !a || typeof a!=='object' || Array.isArray(a) || Object.keys(a).length!==2 || !Object.hasOwn(a,'type') || !Object.hasOwn(a,'value') || !Number.isInteger(a.value)) return state;
  let selected;
  if (a.type==='toggle-part' && integer(a.value,0,state.descriptor.denominator*state.descriptor.wholeCount-1)) selected=state.selected.includes(a.value)?state.selected.filter(i=>i!==a.value):[...state.selected,a.value].sort((x,y)=>x-y);
  else if(a.type==='reset' && a.value===0) selected=[];
  else return state;
  return {...state,selected,actions:[...state.actions,{type:a.type,value:a.value}]};
}
export function evidence(state) {
  return state ? {tool:'fraction-units',version:1,taskId:state.taskId,actions:state.actions.map(a=>({...a}))} : undefined;
}
// The empty initial area is a valid zero representation. Submission itself is
// explicit; it must remain possible to answer zero without invented actions.
export function ready(state) { return Boolean(state && config(state.descriptor)); }
export function render(state,disabled=false) {
  if(!state || !config(state.descriptor)) return '';
  const d=state.descriptor,limited=state.actions.length>=60,blocked=disabled||limited,n=state.selected.length;
  const whole=Math.floor(n/d.denominator),rest=n%d.denominator;
  const mixed=whole?`${whole} Ganze${rest?` und ${rest}/${d.denominator}`:''}`:`${rest}/${d.denominator} eines Ganzen`;
  const strips=Array.from({length:d.wholeCount},(_,unit)=>`<div class="fraction-row"><span>Ganzes ${unit+1}</span><div class="workshop-strip workshop-own" style="--parts:${d.denominator};width:100%;box-sizing:border-box" role="group" aria-label="Ganzes ${unit+1}: ${d.denominator} gleich große Teile">${Array.from({length:d.denominator},(_,part)=>{const i=unit*d.denominator+part,chosen=state.selected.includes(i);return `<button type="button" data-workshop-part="${i}" class="workshop-piece ${chosen?'filled':''}" aria-label="Teil ${part+1} von ${d.denominator} im Ganzen ${unit+1}" aria-pressed="${chosen}" ${blocked?'disabled':''}></button>`;}).join('')}</div></div>`).join('');
  return `<section class="workshop" data-workshop-tool="fraction-units" aria-label="Lernwerkstatt: Mehrere gleiche Ganze"><div class="workshop-heading"><span class="eyeline">Mehrere gleiche Ganze</span><span class="workshop-role">${d.role==='answer'?'Deine Darstellung zählt als Antwort':'Zum Ausprobieren mit Hilfe'}</span></div><p class="workshop-instruction">${escape(d.instruction)}</p><div data-workshop-units>${strips}</div><output aria-live="polite">${n}/${d.denominator} markiert · ${mixed}</output><p class="workshop-tip">Jeder Streifen ist ein gleich großes Ganzes. Markiere Teile per Klick, durch Ziehen oder mit Tab und Leertaste.</p><div class="workshop-buttons"><button type="button" data-workshop-action="reset" data-value="0" ${blocked?'disabled':''}>Zurücksetzen</button></div>${limited?'<p class="workshop-limit" role="status">Du hast viele Schritte ausprobiert. Sende deine Darstellung oder hol dir Hilfe.</p>':''}</section>`;
}
