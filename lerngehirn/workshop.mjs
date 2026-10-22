const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
function fractionDescriptor(value){if(value?.tool!=='fraction-board'||value.version!==1||!['answer','support'].includes(value.role)||!['represent','equivalent'].includes(value.goal)||!integer(value.numerator,0,36)||!integer(value.denominator,1,36)||value.numerator>value.denominator||(value.goal==='represent'?value.targetDenominator!==0:!integer(value.targetDenominator,2,36)))return null;return {tool:value.tool,version:1,role:value.role,goal:value.goal,numerator:value.numerator,denominator:value.denominator,targetDenominator:value.targetDenominator,instruction:typeof value.instruction==='string'?value.instruction.slice(0,600):''};}
const adapters=Object.freeze({'fraction-board':{descriptor:fractionDescriptor,initial(descriptor){return {parts:descriptor.denominator,selected:descriptor.goal==='equivalent'?Array.from({length:descriptor.numerator},(_,i)=>i):[]};}}});
export function createWorkshop(task){const adapter=adapters[task?.workshop?.tool],descriptor=adapter?.descriptor(task.workshop);if(!descriptor||typeof task?.id!=='string')return null;return {taskId:task.id,descriptor,signature:JSON.stringify(descriptor),...adapter.initial(descriptor),actions:[]};}
export function syncWorkshop(state,task){const next=createWorkshop(task);return next&&state?.taskId===next.taskId&&state.signature===next.signature?state:next;}
export function workshopAction(state,action){if(!state||state.actions.length>=60||!Number.isInteger(action?.value))return state;let parts=state.parts,selected=[...state.selected];const {type,value}=action;
  if(type==='set-parts'){if(!integer(value,1,36)||value===parts)return state;parts=value;selected=selected.filter(i=>i<parts);}
  else if(type==='toggle-part'){if(!integer(value,0,parts-1))return state;selected=selected.includes(value)?selected.filter(i=>i!==value):[...selected,value].sort((a,b)=>a-b);}
  else if(type==='partition'){if(!integer(value,2,6)||parts*value>36)return state;parts*=value;selected=selected.flatMap(i=>Array.from({length:value},(_,j)=>i*value+j));}
  else if(type==='reset'){if(value!==0)return state;({parts,selected}=adapters[state.descriptor.tool].initial(state.descriptor));}
  else return state;
  return {...state,parts,selected,actions:[...state.actions,{type,value}]};
}
export function workshopEvidence(state){return state?{tool:state.descriptor.tool,version:1,taskId:state.taskId,actions:state.actions.map(a=>({...a}))}:undefined;}
function strip(parts,selected,{interactive=false,disabled=false}={}){return `<div class="workshop-strip ${interactive?'workshop-own':''}" style="--parts:${parts}" ${interactive?'role="group" aria-label="Eigene Darstellung: Felder markieren oder zurücknehmen"':'role="img" aria-label="Vorgegebener Anteil"'}>${Array.from({length:parts},(_,i)=>interactive?`<button type="button" data-workshop-part="${i}" class="workshop-piece ${selected.includes(i)?'filled':''}" aria-label="Teil ${i+1} von ${parts}" aria-pressed="${selected.includes(i)}" ${disabled?'disabled':''}></button>`:`<span class="workshop-piece ${selected.includes(i)?'filled':''}" aria-hidden="true"></span>`).join('')}</div>`;}
export function renderWorkshop(state,busy=false){if(!state)return '';const d=state.descriptor,limited=state.actions.length>=60,disabled=busy||limited;return `<section class="workshop" aria-label="Lernwerkstatt: Brüche"><div class="workshop-heading"><span class="eyeline">Deine Lernwerkstatt</span><span class="workshop-role">${d.role==='support'?'Zum Ausprobieren mit Hilfe':'Deine Darstellung zählt als Antwort'}</span></div>${d.instruction?`<p class="workshop-instruction">${esc(d.instruction)}</p>`:''}<div class="workshop-reference"><strong>Der vorgegebene Anteil: ${d.numerator}/${d.denominator}</strong>${strip(d.denominator,Array.from({length:d.numerator},(_,i)=>i))}</div><div class="workshop-own-label"><strong>Dein Streifen</strong><output aria-live="polite">${state.selected.length}/${state.parts} markiert</output></div>${strip(state.parts,state.selected,{interactive:true,disabled})}<p class="workshop-tip">Markiere Felder mit dem Finger, durch Ziehen oder per Klick. Mit Tab und Leertaste geht es auch.</p><div class="workshop-controls"><label for="workshop-parts"><span data-workshop-parts-label>Insgesamt ${state.parts} gleich große Teile</span><input id="workshop-parts" name="workshop-parts" type="range" min="1" max="36" step="1" value="${state.parts}" ${disabled?'disabled':''}></label><div class="workshop-buttons">${[2,3].map(f=>`<button type="button" class="secondary" data-workshop-action="partition" data-value="${f}" ${disabled||state.parts*f>36?'disabled':''}>Jedes Teil ×${f} unterteilen</button>`).join('')}<button type="button" class="secondary" data-workshop-action="reset" data-value="0" ${disabled?'disabled':''}>Zurücksetzen</button></div></div><p class="workshop-limit" role="status" ${limited?'':'hidden'}>Du hast viele Schritte ausprobiert. Sende deine Darstellung oder hol dir Hilfe.</p></section>`;}

// Patch only the workshop. Text answers, question fields and their focus survive.
export function updateWorkshop(root,state,busy=false){
  if(!root||!state)return;
  const board=root.querySelector?.('.workshop-own');
  if(!board?.querySelectorAll)return;
  const active=board.ownerDocument?.activeElement,focused=active?.dataset?.workshopPart;
  let cells=[...board.querySelectorAll('[data-workshop-part]')];
  if(cells.length!==state.parts){board.innerHTML=strip(state.parts,state.selected,{interactive:true}).replace(/^<div[^>]*>|<\/div>$/g,'');cells=[...board.querySelectorAll('[data-workshop-part]')];}
  board.style.setProperty('--parts',state.parts);
  const disabled=busy||state.actions.length>=60;
  cells.forEach((cell,i)=>{cell.classList.toggle('filled',state.selected.includes(i));cell.setAttribute('aria-pressed',String(state.selected.includes(i)));cell.disabled=disabled;});
  const output=root.querySelector('output');if(output)output.textContent=`${state.selected.length}/${state.parts} markiert`;
  const label=root.querySelector('[data-workshop-parts-label]');if(label)label.textContent=`Insgesamt ${state.parts} gleich große Teile`;
  const range=root.querySelector('[name="workshop-parts"]');if(range){range.value=state.parts;range.disabled=disabled;}
  root.querySelectorAll('[data-workshop-action]').forEach(button=>{button.disabled=disabled||(button.dataset.workshopAction==='partition'&&state.parts*Number(button.dataset.value)>36);});
  const limit=root.querySelector('.workshop-limit');if(limit)limit.hidden=state.actions.length<60;
  if(focused!==undefined&&active!==board.ownerDocument?.activeElement)cells[Math.min(Number(focused),cells.length-1)]?.focus({preventScroll:true});
}
