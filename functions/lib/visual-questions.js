'use strict';
const TYPES = ['hotspot','image-labeling','numberline','fraction-grid','bar-chart','angle-measure'];
const scenes = {
 plant: [
  {
    "id": "r1",
    "shape": "path",
    "x": 200,
    "y": 55,
    "d": "M200 19 C213 2 229 16 224 34 C248 20 261 41 239 55 C261 69 248 91 225 77 C231 100 207 108 200 85 C191 108 168 99 175 77 C151 91 139 69 161 55 C139 41 153 20 176 34 C171 14 190 2 200 19 Z M212 55 A12 12 0 1 0 188 55 A12 12 0 1 0 212 55 Z",
    "color": "#cf83a5",
    "fill": "#df9bb7",
    "strokeWidth": 2
  },
  {
    "id": "r2",
    "shape": "path",
    "x": 191,
    "y": 98,
    "d": "M194 91 C199 124 188 150 195 182 C199 207 192 231 195 255 L207 255 C203 229 210 205 207 181 C200 149 211 121 206 91 Z",
    "color": "#58875b",
    "fill": "#58875b",
    "strokeWidth": 2
  },
  {
    "id": "r3",
    "shape": "path",
    "x": 147,
    "y": 169,
    "d": "M199 186 C151 188 117 178 104 139 C145 137 181 148 199 186 Z M204 167 C206 133 239 117 279 119 C268 154 241 171 204 167 Z M199 186 C164 169 135 153 109 142 M204 167 C229 147 251 134 273 122",
    "color": "#487d47",
    "fill": "#84b56d",
    "strokeWidth": 2
  },
  {
    "id": "r4",
    "shape": "path",
    "x": 200,
    "y": 254,
    "d": "M200 254 C194 275 199 296 188 322 M197 267 C181 272 163 283 149 302 M180 278 C171 279 158 274 147 277 M165 288 C155 290 143 290 132 298 M199 277 C218 281 238 297 249 322 M222 286 C231 285 245 280 257 285 M238 302 C252 301 262 307 270 316 M194 291 C180 297 170 313 166 330 M198 310 C207 317 210 329 208 338",
    "color": "#9a7552",
    "fill": "none",
    "strokeWidth": 6
  }
],
 room: [
  {id:'r1',shape:'rect',x:40,y:40,w:100,h:90,color:'#a9d8ef'},
  {id:'r2',shape:'rect',x:255,y:38,w:92,h:120,color:'#c3a18a'},
  {id:'r3',shape:'table',x:80,y:210,w:180,h:80,color:'#d6b073'},
  {id:'r4',shape:'ellipse',x:278,y:250,w:40,h:40,color:'#8a80c4'}
 ]
};
for(const [template,captions] of Object.entries({sentence:['Am Morgen','fährt','der Bus','zur Schule.'],receipt:['20.10.2026 · 10:35','2 × Heft A5 · 3,00 €','SUMME · 3,00 €','Zahlung: BAR']}))scenes[template]=captions.map((caption,i)=>({id:`r${i+1}`,shape:'rect',x:40,y:30+i*80,w:320,h:45,color:'#e2e8f0',caption}));
function aligned(n,v){return Number.isFinite(n)&&n>=v.min&&n<=v.max&&Math.abs((n-v.min)/v.step-Math.round((n-v.min)/v.step))<1e-7;}
function scale(v,limit=200){return [v.min,v.max,v.step].every(Number.isFinite)&&v.min<v.max&&v.step>0&&v.step<=v.max-v.min&&(v.max-v.min)/v.step<=limit&&aligned(v.max,v);}
function named(items,max){return Array.isArray(items)&&items.length>=1&&items.length<=max&&items.every(l=>l&&typeof l.id==='string'&&/^\w{1,40}$/.test(l.id)&&typeof l.text==='string'&&l.text.trim()&&l.text.length<=100)&&new Set(items.map(l=>l.id)).size===items.length;}
function mappedSolution(items,solutions,v,tolerance){return Array.isArray(solutions)&&solutions.length===items.length&&new Set(solutions.map(p=>p?.id)).size===items.length&&solutions.every(p=>p&&items.some(i=>i.id===p.id)&&aligned(p.value,v)&&(!tolerance||(Number.isFinite(p.tolerance)&&p.tolerance>=0&&p.tolerance<=v.step/2)));}
function validateVisual(q) {
 const v=q?.visual,s=q?.visualSolution;
 if(!TYPES.includes(q?.type)||!v||v.version!==1||!s||typeof s!=='object')throw Error('Ungültiges visuelles Aufgabenmodell.');
 if(!Number.isFinite(q.points)||q.points<0.5||q.points*2!==Math.round(q.points*2))throw Error('Ungültiger Punktwert.');
 if(q.type==='fraction-grid'){
  if(!Number.isInteger(v.rows)||!Number.isInteger(v.columns)||v.rows<1||v.columns<1||v.rows*v.columns>100||!Number.isInteger(s.count)||s.count<0||s.count>v.rows*v.columns)throw Error('Ungültiges Bruchraster.');
 }else if(q.type==='angle-measure'){
  if(!Number.isInteger(v.degrees)||v.degrees<10||v.degrees>170||s.value!==v.degrees||!Number.isFinite(s.tolerance)||s.tolerance<0||s.tolerance>2)throw Error('Ungültiger Winkel.');
 }else if(q.type==='bar-chart'){
  if(!scale(v,100)||!named(v.categories,8)||q.points<v.categories.length/2||v.categories.some(c=>!aligned(c.sourceValue,v))||!mappedSolution(v.categories,s.values,v,false)||v.unit!==undefined&&(typeof v.unit!=='string'||v.unit.length>40))throw Error('Ungültiges Säulendiagramm.');
 }else if(q.type==='numberline'){
  if(!scale(v))throw Error('Ungültige Skala.');
  if(v.markers!==undefined){
   if(!named(v.markers,8)||q.points<v.markers.length/2||!mappedSolution(v.markers,s.positions,v,true))throw Error('Ungültige Zahlenstrahlmarken.');
  }else if(!aligned(s.value,v)||!Number.isFinite(s.tolerance)||s.tolerance<0||s.tolerance>v.step/2)throw Error('Ungültige Skala oder Lösung.');
 }else{
  const objects=scenes[v.template];if(!objects)throw Error('Unbekannte Fachvorlage.');
  const ids=new Set(objects.map(o=>o.id));
  if(q.type==='hotspot'){
   if(q.points<s.selected?.length/2)throw Error('Zu wenige Punkte für Teilwertung.');
   if(!Array.isArray(s.selected)||!s.selected.length||new Set(s.selected).size!==s.selected.length||s.selected.some(id=>!ids.has(id)))throw Error('Ungültige Zielbereiche.');
  }else{
   if(!Array.isArray(v.labels)||v.labels.length<2||v.labels.length>12||v.labels.some(l=>!l||!/^\w{1,40}$/.test(l.id)||typeof l.text!=='string'||!l.text.trim()||l.text.length>100)||new Set(v.labels.map(l=>l.id)).size!==v.labels.length||new Set(v.labels.map(l=>l.text.trim().toLowerCase())).size!==v.labels.length)throw Error('Ungültige Begriffe.');
   if(q.points<objects.length/2)throw Error('Mindestens ein halber Punkt pro Beschriftung nötig.');
   const map=s.assignments;if(!map||Array.isArray(map)||Object.keys(map).length!==objects.length||new Set(Object.values(map)).size!==objects.length||objects.some(o=>!v.labels.some(l=>l.id===map[o.id]))||Object.keys(map).some(id=>!ids.has(id)))throw Error('Unvollständige Beschriftungslösung.');
  }
 }
 return true;
}
function geometricObject(o){
 if(o.shape==='roots')return {id:o.id,shape:'path',x:o.x,y:o.y,d:`M${o.x} ${o.y} l-40 65 m40 -65 l40 65 m-40 -65 v80 m0 -55 l-55 20 m55 -20 l55 20`,color:o.color,fill:'none',strokeWidth:8};
 if(o.shape==='table')return {id:o.id,shape:'path',x:o.x+o.w/2,y:o.y+o.h/2,d:`M${o.x} ${o.y} h${o.w} v18 h-${o.w} z M${o.x+15} ${o.y+18} v60 M${o.x+o.w-15} ${o.y+18} v60`,color:o.color,fill:o.color,strokeWidth:6};
 return {...o};
}
function publicVisual(q,mapId=(kind,id)=>id){
 validateVisual(q);const v=q.visual;
 if(q.type==='numberline')return {version:1,min:v.min,max:v.max,step:v.step,...(v.markers?{markers:v.markers.map(m=>({id:mapId('marker',m.id),text:m.text}))}:{})};
 if(q.type==='fraction-grid')return {version:1,rows:v.rows,columns:v.columns};
 if(q.type==='angle-measure')return {version:1,rays:[{x:1,y:0},{x:Math.cos(v.degrees*Math.PI/180),y:-Math.sin(v.degrees*Math.PI/180)}]};
 if(q.type==='bar-chart')return {version:1,min:v.min,max:v.max,step:v.step,categories:v.categories.map(c=>({id:mapId('category',c.id),text:c.text,sourceValue:c.sourceValue})),...(v.unit?{unit:v.unit}:{})};
 return {version:1,objects:scenes[v.template].map(o=>({...geometricObject(o),id:mapId('region',o.id)})),...(q.type==='image-labeling'?{labels:v.labels.map(l=>({id:mapId('label',l.id),text:l.text})).sort((a,b)=>a.id.localeCompare(b.id))}:{})};
}
function visualKey(q,mapId=(kind,id)=>id){
 const v=publicVisual(q,mapId),s=q.visualSolution;
 if(q.type==='fraction-grid')return {visual:v,visualSolution:{count:s.count}};
 if(q.type==='angle-measure')return {visual:v,visualSolution:{value:s.value,tolerance:s.tolerance}};
 if(q.type==='bar-chart')return {visual:v,visualSolution:{values:s.values.map(p=>({id:mapId('category',p.id),value:p.value}))}};
 if(q.type==='numberline'&&q.visual.markers)return {visual:v,visualSolution:{positions:s.positions.map(p=>({id:mapId('marker',p.id),value:p.value,tolerance:p.tolerance}))}};
 return {visual:v,visualSolution:q.type==='numberline'?{value:s.value,tolerance:s.tolerance}:q.type==='hotspot'?{selected:s.selected.map(id=>mapId('region',id))}:{assignments:Object.fromEntries(Object.entries(s.assignments).map(([k,id])=>[mapId('region',k),mapId('label',id)]))}};
}
function visualRatio(key,given){
 const s=key.visualSolution;let ratio=0;
 if(key.type==='fraction-grid')return Array.isArray(given)&&new Set(given).size===given.length&&given.every(i=>Number.isInteger(i)&&i>=0&&i<key.visual.rows*key.visual.columns)&&given.length===s.count?1:0;
 if(key.type==='bar-chart'||key.type==='numberline'&&key.visual.markers){
  const entries=key.type==='bar-chart'?s.values:s.positions, v=key.visual;
  const a=given&&typeof given==='object'&&!Array.isArray(given)?given:{};
  if(Object.keys(a).some(id=>!entries.some(p=>p.id===id)))return 0;
  const numeric=value=>typeof value==='number'?value:typeof value==='string'&&value.trim()?Number(value.trim().replace(',','.')):NaN;
  if(Object.values(a).some(value=>{const n=numeric(value);return !Number.isFinite(n)||n<v.min||n>v.max||(key.type==='bar-chart'&&!aligned(n,v));}))return 0;
  return entries.filter(p=>Object.hasOwn(a,p.id)&&Math.abs(numeric(a[p.id])-p.value)<=(p.tolerance||0)+v.step/1000000).length/entries.length;
 }
 if(key.type==='angle-measure'){
  const n=typeof given==='number'?given:typeof given==='string'&&given.trim()?Number(given.trim().replace(',','.')):NaN;
  return Number.isFinite(n)&&n>=0&&n<=180&&Math.abs(n-s.value)<=s.tolerance?1:0;
 }
 if(key.type==='numberline'){
  const raw=typeof given==='number'?String(given):typeof given==='string'?given.trim().replace(',','.'):'';
  const n=raw===''?NaN:Number(raw);const v=key.visual;
  ratio=Number.isFinite(n)&&n>=v.min&&n<=v.max&&Math.abs(n-s.value)<=s.tolerance+Math.min(v.step/1000000,Number.EPSILON*Math.max(Math.abs(s.value),Math.abs(v.min),Math.abs(v.max))*4)?1:0;
 }else if(key.type==='hotspot'){
  const a=Array.isArray(given)?given:[];
  if(new Set(a).size!==a.length||a.some(id=>!key.visual.objects.some(o=>o.id===id)))return 0;
  ratio=Math.max(0,(a.filter(id=>s.selected.includes(id)).length-a.filter(id=>!s.selected.includes(id)).length)/s.selected.length);
 }else{
  const a=given&&typeof given==='object'&&!Array.isArray(given)?given:{};
  if(Object.keys(a).some(id=>!key.visual.objects.some(o=>o.id===id)))return 0;
  ratio=Object.entries(s.assignments).filter(([id,label])=>a[id]===label).length/Object.keys(s.assignments).length;
 }
 return ratio;
}
function gradeVisual(key,given){return Math.min(key.points,Math.round(visualRatio(key,given)*key.points*2)/2);}
module.exports={TYPES,validateVisual,publicVisual,visualKey,gradeVisual,visualRatio,geometricObject};
