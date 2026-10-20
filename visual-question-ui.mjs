export const VISUAL_TYPES=['hotspot','image-labeling','numberline'];
function el(tag,text,cls){const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;}
function svgEl(tag,attrs){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
export function renderVisual(container,q,answer='',onChange=()=>{}){
 const root=el('div',null,'visualQuestion');root.dataset.visualType=q.type;root._visualQuestion=q;container.append(root);const v=q.visual;
 if(q.type==='numberline'){
  const hint=el('p',`Markiere eine Position. Skala ${v.min} bis ${v.max}; Schritte ${v.step}. Pfeiltasten verändern die Position.`,'hint');
  const svg=svgEl('svg',{viewBox:'0 0 400 90',role:'img','aria-label':'Zahlenstrahl mit gleichmäßigen Teilstrichen'});
  svg.append(svgEl('line',{x1:25,y1:30,x2:375,y2:30,stroke:'currentColor','stroke-width':2}));
  const steps=Math.round((v.max-v.min)/v.step);
  for(let i=0;i<=steps;i++){const x=25+350*i/steps;svg.append(svgEl('line',{x1:x,x2:x,y1:25,y2:35,stroke:'currentColor'}));if(i===0||i===steps||steps<=10||i%Math.ceil(steps/5)===0){const t=svgEl('text',{x,y:58,'text-anchor':'middle','font-size':13});t.textContent=String(Number((v.min+i*v.step).toFixed(8)));svg.append(t);}}
  const marker=svgEl('circle',{cx:25,cy:30,r:7,fill:'#4b65a7',visibility:'hidden'});svg.append(marker);
  const slider=el('input');slider.type='range';slider.min=v.min;slider.max=v.max;slider.step=v.step;slider.value=v.min;slider.setAttribute('aria-label','Position auf der Skala');
  const output=el('output','Noch keine Position gewählt');output.setAttribute('aria-live','polite');root._answer='';
  const update=raw=>{root._answer=raw;const n=Number(raw);marker.setAttribute('visibility',raw===''?'hidden':'visible');marker.setAttribute('cx',25+350*(n-v.min)/(v.max-v.min));output.textContent=raw===''?'Noch keine Position gewählt':`Gewählte Position: ${raw}`;if(raw!=='')slider.value=raw;};
  root._restore=update;slider.addEventListener('input',()=>{update(slider.value);onChange();});
  svg.addEventListener('click',event=>{const r=svg.getBoundingClientRect();if(!r.width)return;const f=Math.max(0,Math.min(1,((event.clientX-r.left)/r.width*400-25)/350));update(String(Number((v.min+Math.round(f*steps)*v.step).toFixed(8))));onChange();});
  const reset=el('button','Position löschen','button secondary');reset.type='button';reset.addEventListener('click',()=>{update('');onChange();});root.append(hint,svg,slider,output,reset);
 }else{
  root.append(el('p',q.type==='hotspot'?'Tippe die Bereiche in der Grafik oder wähle die nummerierten Schaltflächen.':'Ordne jedem nummerierten Bereich einen Begriff zu.','hint'));
  const svg=svgEl('svg',{viewBox:'0 0 400 350',role:'img','aria-label':'Schematische Darstellung mit nummerierten Bereichen'});root.append(svg);
  if(v.objects?.some(o=>o.shape==='path'&&o.y===254))svg.append(svgEl('line',{x1:30,x2:370,y1:250,y2:250,stroke:'#a69d8d','stroke-dasharray':'5 5'}));
  const controls=el('div',null,'visualControls');root.append(controls);
  (v.objects||[]).forEach((o,i)=>{
   const g=svgEl('g',{});let shape;
   if(o.shape==='path')shape=svgEl('path',{d:o.d,fill:o.fill,stroke:o.color,'stroke-width':o.strokeWidth});
   else if(o.shape==='ellipse')shape=svgEl('ellipse',{cx:o.x,cy:o.y,rx:o.w/2,ry:o.h/2,fill:o.color});
   else shape=svgEl('rect',{x:o.x,y:o.y,width:o.w,height:o.h,rx:5,fill:o.color});
   g.append(shape);const x=o.shape==='ellipse'||o.shape==='path'?o.x:o.x+o.w/2;const y=o.shape==='ellipse'||o.shape==='path'?o.y:o.y+o.h/2;
   g.append(svgEl('circle',{cx:x,cy:y,r:15,fill:'white',stroke:'#44536b','stroke-width':2}));const num=svgEl('text',{x,y:y+5,'text-anchor':'middle','font-size':15,fill:'#263648'});num.textContent=i+1;g.append(num);svg.append(g);
   if(q.type==='hotspot'){
    const button=el('button',`Bereich ${i+1}`,'button secondary');button.type='button';button.dataset.region=o.id;button._shape=shape;button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>{button.setAttribute('aria-pressed',button.getAttribute('aria-pressed')==='true'?'false':'true');shape.setAttribute('opacity',button.getAttribute('aria-pressed')==='true'?'.55':'1');onChange();});g.addEventListener('click',()=>button.click());controls.append(button);
   }else{
    const label=el('label',`Bereich ${i+1} `);const select=el('select');select.dataset.region=o.id;const empty=el('option','Bitte auswählen …');empty.value='';select.append(empty);for(const l of v.labels||[]){const option=el('option',l.text);option.value=l.id;select.append(option);}select.addEventListener('change',onChange);label.append(select);controls.append(label);
   }
  });
 }
 restoreVisual(root,q,answer);return root;
}
export function readVisual(container){const root=container.matches?.('.visualQuestion')?container:container.querySelector('.visualQuestion');if(!root)return '';if(root.dataset.visualType==='numberline')return root._answer; if(root.dataset.visualType==='hotspot')return [...root.querySelectorAll('button[data-region][aria-pressed="true"]')].map(b=>b.dataset.region);return Object.fromEntries([...root.querySelectorAll('select[data-region]')].map(s=>[s.dataset.region,s.value]));}
export function restoreVisual(container,q,value){const root=container.matches?.('.visualQuestion')?container:container.querySelector('.visualQuestion');if(!root)return;if(q.type==='numberline'){root._restore(value==null?'':String(value));return;}if(q.type==='hotspot'){root.querySelectorAll('button[data-region]').forEach(b=>{const active=Array.isArray(value)&&value.includes(b.dataset.region);b.setAttribute('aria-pressed',String(active));b._shape?.setAttribute('opacity',active?'.55':'1');});}else root.querySelectorAll('select[data-region]').forEach(s=>s.value=value?.[s.dataset.region]||'');}
export function visualComplete(q,a){if(q.type==='numberline')return a!==''&&a!=null&&Number.isFinite(Number(a));if(q.type==='hotspot')return Array.isArray(a)&&a.length>0;return Boolean(a&&q.visual?.objects?.length&&q.visual.objects.every(o=>a[o.id]));}
export function visualAnswerDisplay(q,a){if(q.type==='numberline')return a==null||a===''?'(leer)':String(a);const objects=q.visual?.objects||[];if(q.type==='hotspot')return (Array.isArray(a)?a:[]).map(id=>`Bereich ${objects.findIndex(o=>o.id===id)+1}`).join(', ')||'(leer)';return objects.map((o,i)=>`Bereich ${i+1}: ${q.visual.labels?.find(l=>l.id===a?.[o.id])?.text||'(leer)'}`).join('; ');}
