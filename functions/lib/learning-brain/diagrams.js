'use strict';
const number=(minimum,maximum)=>({type:'number',minimum,maximum,description:'Endliche Zahl mit höchstens drei Nachkommastellen.'});
const text=maxLength=>({type:'string',maxLength});
const object=properties=>({type:'object',additionalProperties:false,properties,required:Object.keys(properties)});
const list=(items,minItems,maxItems)=>({type:'array',items,minItems,maxItems});
const length=number(.1,1000),coordinate=number(-1000,1000);
const variants={
 coordinates:{xMin:coordinate,xMax:coordinate,yMin:coordinate,yMax:coordinate,step:length,points:list(object({label:text(24),x:coordinate,y:coordinate}),1,16)},
 angle:{degrees:number(5,175)},rectangle:{width:length,height:length},triangle:{a:length,b:length,c:length},circle:{radius:length},cuboid:{length,width:length,height:length},
 'cube-net':{cells:list(object({x:{type:'integer',minimum:-5,maximum:5},y:{type:'integer',minimum:-5,maximum:5}}),6,6)},
 bars:{max:number(1,1000000),step:number(.1,1000000),bars:list(object({label:text(24),value:number(0,1000000)}),1,10)},
 'data-list':{values:list(number(-1000000,1000000),1,40)},
};
const diagramSchema={anyOf:Object.entries(variants).map(([kind,properties])=>object({kind:{type:'string',enum:[kind]},title:text(120),unit:text(16),...properties}))};
function validValue(value,schema){
 if(schema.type==='object')return value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===schema.required.length&&schema.required.every(key=>Object.prototype.hasOwnProperty.call(value,key)&&validValue(value[key],schema.properties[key]));
 if(schema.type==='array')return Array.isArray(value)&&value.length>=schema.minItems&&value.length<=schema.maxItems&&value.every(v=>validValue(v,schema.items));
 if(schema.type==='string')return typeof value==='string'&&(schema.maxLength===undefined||value.length<=schema.maxLength)&&(!schema.enum||schema.enum.includes(value))&&!/[\u0000-\u001f]/.test(value);
 return typeof value==='number'&&Number.isFinite(value)&&Number(value.toFixed(3))===value&&value>=schema.minimum&&value<=schema.maximum&&(schema.type!=='integer'||Number.isInteger(value));
}
function validNet(cells){
 const key=p=>p.x+','+p.y,lookup=new Map(cells.map(p=>[key(p),p]));if(lookup.size!==6)return false;
 const negative=v=>v.map(n=>-n),same=(a,b)=>a.every((n,i)=>n===b[i]);
 const frames=new Map([[key(cells[0]),{u:[1,0,0],v:[0,1,0],n:[0,0,1]}]]),queue=[cells[0]];
 for(const p of queue){const f=frames.get(key(p));for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
  const q={x:p.x+dx,y:p.y+dy},k=key(q);if(!lookup.has(k))continue;
  const g=dx===1?{u:negative(f.n),v:f.v,n:f.u}:dx===-1?{u:f.n,v:f.v,n:negative(f.u)}:dy===1?{u:f.u,v:negative(f.n),n:f.v}:{u:f.u,v:f.n,n:negative(f.v)};
  if(frames.has(k)){const old=frames.get(k);if(!same(old.u,g.u)||!same(old.v,g.v)||!same(old.n,g.n))return false;}else{frames.set(k,g);queue.push(q);}
 }}
 return frames.size===6&&new Set([...frames.values()].map(f=>f.n.join(','))).size===6;
}
function validateDiagram(d){
 const schema=diagramSchema.anyOf.find(s=>s.properties.kind.enum[0]===d?.kind);if(!schema||!validValue(d,schema)||!d.title.trim())return null;
 const integerMultiple=(a,b)=>Math.abs(a/b-Math.round(a/b))<1e-8;
 if(d.kind==='coordinates'){
  if(!(d.xMin<=0&&d.xMax>=0&&d.yMin<=0&&d.yMax>=0&&d.xMax>d.xMin&&d.yMax>d.yMin))return null;
  if([d.xMin,d.xMax,d.yMin,d.yMax].some(v=>!integerMultiple(v,d.step))||(d.xMax-d.xMin)/d.step>20||(d.yMax-d.yMin)/d.step>20)return null;
  if(d.points.some(p=>!p.label.trim()||p.x<d.xMin||p.x>d.xMax||p.y<d.yMin||p.y>d.yMax)||new Set(d.points.map(p=>p.label)).size!==d.points.length)return null;
 }
 if(d.kind==='triangle'){
  if(d.a+d.b<=d.c||d.a+d.c<=d.b||d.b+d.c<=d.a)return null;
  const x=(d.b*d.b+d.c*d.c-d.a*d.a)/(2*d.c),h=Math.sqrt(Math.max(0,d.b*d.b-x*x));if(h<Math.max(d.a,d.b,d.c)*.05)return null;
 }
 if(['rectangle','cuboid'].includes(d.kind)){const sides=d.kind==='rectangle'?[d.width,d.height]:[d.length,d.width,d.height];if(Math.min(...sides)/Math.max(...sides)<.05)return null;}
 if(d.kind==='angle'&&d.unit!=='°')return null;
 if(d.kind==='cube-net'&&!validNet(d.cells))return null;
 if(d.kind==='bars'&&(!integerMultiple(d.max,d.step)||d.max/d.step>12||d.max/d.step<2||d.bars.some(b=>!b.label.trim()||b.value>d.max)||new Set(d.bars.map(b=>b.label)).size!==d.bars.length))return null;
 return JSON.parse(JSON.stringify(d));
}
module.exports={diagramSchema,validateDiagram};
