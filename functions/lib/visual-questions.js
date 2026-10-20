'use strict';
const TYPES = ['hotspot','image-labeling','numberline'];
const scenes = {
 plant: [
  {id:'r1',shape:'path',x:200,y:55,d:'M218 35 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0 M236 45 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0 M236 65 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0 M218 75 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0 M200 65 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0 M200 45 a18 18 0 1 0 -36 0 a18 18 0 1 0 36 0',color:'#cf83a5',fill:'#cf83a5',strokeWidth:1},
  {id:'r2',shape:'rect',x:191,y:98,w:18,h:154,color:'#58875b'},
  {id:'r3',shape:'ellipse',x:147,y:169,w:98,h:36,color:'#72a66a'},
  {id:'r4',shape:'roots',x:200,y:254,w:116,h:80,color:'#9a7552'}
 ],
 room: [
  {id:'r1',shape:'rect',x:40,y:40,w:100,h:90,color:'#a9d8ef'},
  {id:'r2',shape:'rect',x:255,y:38,w:92,h:120,color:'#c3a18a'},
  {id:'r3',shape:'table',x:80,y:210,w:180,h:80,color:'#d6b073'},
  {id:'r4',shape:'ellipse',x:278,y:250,w:40,h:40,color:'#8a80c4'}
 ]
};
function validateVisual(q) {
 const v=q?.visual,s=q?.visualSolution;
 if(!TYPES.includes(q?.type)||!v||v.version!==1||!s||typeof s!=='object')throw Error('Ungültiges visuelles Aufgabenmodell.');
 if(!Number.isFinite(q.points)||q.points<0.5||q.points*2!==Math.round(q.points*2))throw Error('Ungültiger Punktwert.');
 if(q.type==='numberline'){
  const {min,max,step}=v;
  if(![min,max,step,s.value,s.tolerance].every(Number.isFinite)||!(min<max)||step<=0||step>max-min||(max-min)/step>200||Math.abs((max-min)/step-Math.round((max-min)/step))>1e-7||s.value<min||s.value>max||s.tolerance<0||s.tolerance>step/2||Math.abs((s.value-min)/step-Math.round((s.value-min)/step))>1e-7)throw Error('Ungültige Skala oder Lösung.');
 }else{
  const objects=scenes[v.template];if(!objects)throw Error('Unbekannte Fachvorlage.');
  const ids=new Set(objects.map(o=>o.id));
  if(q.type==='hotspot'){
   if(q.points<s.selected?.length/2)throw Error('Zu wenige Punkte für Teilwertung.');
   if(!Array.isArray(s.selected)||!s.selected.length||new Set(s.selected).size!==s.selected.length||s.selected.some(id=>!ids.has(id)))throw Error('Ungültige Zielbereiche.');
  }else{
   if(!Array.isArray(v.labels)||v.labels.length<2||v.labels.length>12||v.labels.some(l=>!l||!/^\w{1,40}$/.test(l.id)||typeof l.text!=='string'||!l.text.trim()||l.text.length>100)||new Set(v.labels.map(l=>l.id)).size!==v.labels.length||new Set(v.labels.map(l=>l.text.trim().toLowerCase())).size!==v.labels.length)throw Error('Ungültige Begriffe.');
   if(q.points<objects.length/2)throw Error('Mindestens ein halber Punkt pro Beschriftung nötig.');
   const map=s.assignments;if(!map||Array.isArray(map)||Object.keys(map).length!==objects.length||objects.some(o=>!v.labels.some(l=>l.id===map[o.id]))||Object.keys(map).some(id=>!ids.has(id)))throw Error('Unvollständige Beschriftungslösung.');
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
 if(q.type==='numberline')return {version:1,min:v.min,max:v.max,step:v.step};
 return {version:1,objects:scenes[v.template].map(o=>({...geometricObject(o),id:mapId('region',o.id)})),...(q.type==='image-labeling'?{labels:v.labels.map(l=>({id:mapId('label',l.id),text:l.text})).sort((a,b)=>a.id.localeCompare(b.id))}:{})};
}
function visualKey(q,mapId=(kind,id)=>id){
 const v=publicVisual(q,mapId),s=q.visualSolution;
 return {visual:v,visualSolution:q.type==='numberline'?{value:s.value,tolerance:s.tolerance}:q.type==='hotspot'?{selected:s.selected.map(id=>mapId('region',id))}:{assignments:Object.fromEntries(Object.entries(s.assignments).map(([k,id])=>[mapId('region',k),mapId('label',id)]))}};
}
function visualRatio(key,given){
 const s=key.visualSolution;let ratio=0;
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
