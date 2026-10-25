'use strict';
const number=(minimum,maximum)=>({type:'number',minimum,maximum,description:'Höchstens drei Nachkommastellen.'});
const integer=(minimum,maximum)=>({type:'integer',minimum,maximum});
const text=maxLength=>({type:'string',maxLength});
const object=properties=>({type:'object',additionalProperties:false,properties,required:Object.keys(properties)});
const list=(items,minItems,maxItems)=>({type:'array',items,minItems,maxItems});
const pointLabel={type:'string',pattern:'^[A-Za-z][A-Za-z0-9_]{0,11}$'},length=number(.1,100);
const variants={
 'area-grid':{columns:integer(1,12),rows:integer(1,12),cells:list(object({x:integer(0,11),y:integer(0,11)}),1,144)},
 'unit-cubes':{length:integer(1,8),width:integer(1,8),height:integer(1,8)},
 'cuboid-net':{length,width:length,height:length},
 'fraction-area':{rows:integer(1,12),columns:integer(1,12),selectedRows:integer(1,12),selectedColumns:integer(1,12),mode:{type:'string',enum:['part-of-part','equal-groups']}},
 'segment-figure':{points:list(object({label:pointLabel,x:number(-12,12),y:number(-12,12)}),2,12),segments:list(object({from:pointLabel,to:pointLabel}),1,16),grid:{type:'boolean'}},
};
const extraDiagramSchema={anyOf:Object.entries(variants).map(([kind,properties])=>object({kind:{type:'string',enum:[kind]},title:text(120),unit:text(16),...properties}))};
function validValue(value,schema){
 if(schema.type==='object')return value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===schema.required.length&&schema.required.every(key=>Object.prototype.hasOwnProperty.call(value,key)&&validValue(value[key],schema.properties[key]));
 if(schema.type==='array')return Array.isArray(value)&&value.length>=schema.minItems&&value.length<=schema.maxItems&&value.every(v=>validValue(v,schema.items));
 if(schema.type==='string')return typeof value==='string'&&(schema.maxLength===undefined||value.length<=schema.maxLength)&&(!schema.enum||schema.enum.includes(value))&&(!schema.pattern||new RegExp(schema.pattern).test(value))&&!/[\u0000-\u001f]/.test(value);
 if(schema.type==='boolean')return typeof value==='boolean';
 return typeof value==='number'&&Number.isFinite(value)&&Number(value.toFixed(3))===value&&value>=schema.minimum&&value<=schema.maximum&&(schema.type!=='integer'||Number.isInteger(value));
}
function validateExtraDiagram(d){
 const schema=extraDiagramSchema.anyOf.find(s=>s.properties.kind.enum[0]===d?.kind);if(!schema||!validValue(d,schema)||!d.title.trim())return null;
 const canonical=JSON.parse(JSON.stringify(d));
 if(d.kind==='area-grid'){
  if(d.cells.some(p=>p.x>=d.columns||p.y>=d.rows))return null;
  const keys=new Set(d.cells.map(p=>p.x+','+p.y));if(keys.size!==d.cells.length)return null;
  const visited=new Set(),queue=[d.cells[0]];for(const p of queue){const k=p.x+','+p.y;if(visited.has(k))continue;visited.add(k);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const q={x:p.x+dx,y:p.y+dy},key=q.x+','+q.y;if(keys.has(key)&&!visited.has(key))queue.push(q);}}
  if(visited.size!==d.cells.length)return null;
 }
 if(d.kind==='fraction-area'&&(d.selectedRows>d.rows||d.selectedColumns>d.columns||d.mode==='equal-groups'&&d.selectedRows!==1))return null;
 if(d.kind==='segment-figure'){
  canonical.points=d.points.map(p=>({...p,label:p.label.toUpperCase()}));
  const ids=new Set(canonical.points.map(p=>p.label));if(ids.size!==d.points.length||new Set(d.points.map(p=>p.x+','+p.y)).size!==d.points.length)return null;
  canonical.segments=d.segments.map(s=>{const [from,to]=[s.from.toUpperCase(),s.to.toUpperCase()].sort();return {from,to};});
  if(canonical.segments.some(s=>s.from===s.to||!ids.has(s.from)||!ids.has(s.to))||new Set(canonical.segments.map(s=>s.from+'-'+s.to)).size!==d.segments.length)return null;
 }
 return canonical;
}
module.exports={extraDiagramSchema,validateExtraDiagram};
