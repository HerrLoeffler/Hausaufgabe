// Same bounded scene contract as functions/lib/learning-brain/diagram-extras.js.
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
export {extraDiagramSchema,validateExtraDiagram};
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=value=>String(Math.round(value*1000)/1000),num=value=>f(value).replace('.',',');
const label=(x,y,text,size=14,anchor='middle')=>`<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-family="system-ui,sans-serif" font-size="${size}" fill="#183b45">${esc(text)}</text>`;
const rect=(x,y,w,h,fill='#d8edf0',attrs='')=>`<rect ${attrs} x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" stroke="#3e6973" stroke-width="1"/>`;
const line=(x1,y1,x2,y2,attrs='')=>`<line ${attrs} x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#245668" stroke-width="1.5"/>`;
const polygon=(points,fill,attrs='')=>`<polygon ${attrs} points="${points.map(p=>p.map(f).join(',')).join(' ')}" fill="${fill}" stroke="#245668" stroke-width="1.5"/>`;
function solid(length,width,height,box,grid=false){
 const [left,top,maxW,maxH]=box,s=Math.min(maxW/(length+.5*width),maxH/(height+.35*width)),w=length*s,h=height*s,dx=.5*width*s,dy=-.35*width*s,x=left+(maxW-w-dx)/2,y=top+maxH;
 const A=[x,y],B=[x+w,y],C=[x+w,y-h],D=[x,y-h],E=[x+dx,y-h+dy],F=[x+w+dx,y-h+dy],G=[x+w+dx,y+dy];
 let svg=polygon([A,B,C,D],'#d8edf0','data-solid-face="A"')+polygon([B,G,F,C],'#b5dce3','data-solid-face="B"')+polygon([D,C,F,E],'#ecf5f5','data-solid-face="E"');
 if(grid){
  for(let i=1;i<length;i++){svg+=line(x+i*s,y,x+i*s,y-h)+line(x+i*s,y-h,x+i*s+dx,y-h+dy);}
  for(let i=1;i<height;i++)svg+=line(x,y-i*s,x+w,y-i*s)+line(x+w,y-i*s,x+w+dx,y-i*s+dy);
  for(let i=1;i<width;i++)svg+=line(x+.5*i*s,y-h-.35*i*s,x+w+.5*i*s,y-h-.35*i*s)+line(x+w+.5*i*s,y-.35*i*s,x+w+.5*i*s,y-h-.35*i*s);
 }
 return {svg,x,y,w,h,dx,dy};
}
export function renderExtraDiagram(input){
 const d=validateExtraDiagram(input);if(!d)return '';
 const measure=v=>num(v)+(d.unit?' '+d.unit:'');let body='',height=460,description='',footer='';
 if(d.kind==='area-grid'){
  const s=Math.min(420/d.columns,285/d.rows),left=(760-d.columns*s)/2,top=75;
  for(let y=0;y<d.rows;y++)for(let x=0;x<d.columns;x++)body+=rect(left+x*s,top+y*s,s,s,'#f6fafb',`data-grid-cell="${x},${y}"`);
  for(const p of d.cells)body+=rect(left+p.x*s,top+p.y*s,s,s,'#75b5c1',`data-area-cell="${p.x},${p.y}"`);
  body+=label(380,top+d.rows*s+28,d.unit?'Ein Kästchen: 1 '+d.unit:'Ein Kästchen: eine Flächeneinheit');description='Quadratisches Raster mit einer zusammenhängenden gefärbten Fläche. Nur die gefärbten Kästchen gehören zur markierten Figur.';
 }
 if(d.kind==='unit-cubes'){
  height=Math.max(460,120+Math.ceil(d.height/2)*(45+Math.max(35,d.width*14)));
  const block=solid(d.length,d.width,d.height,[38,100,260,230],true);body+=block.svg+label(165,365,`${d.length} × ${d.width} × ${d.height} Einheitswürfel`,14)+label(165,392,'Schrägbild des Quaders',13);
  const s=Math.min(22,150/d.length),layerH=d.width*s,rowHeight=layerH+45;
  height=Math.max(height,115+Math.ceil(d.height/2)*rowHeight);
  for(let z=0;z<d.height;z++){
   const x0=370+(z%2)*185,y0=90+Math.floor(z/2)*rowHeight;body+=`<g data-layer="${z+1}">`+label(x0+d.length*s/2,y0-12,'Schicht '+(z+1));
   for(let y=0;y<d.width;y++)for(let x=0;x<d.length;x++)body+=rect(x0+x*s,y0+y*s,s,s,z%2?'#a9d5df':'#d8edf0',`data-unit-cube="${x},${y},${z}"`);body+='</g>';
  }
  description='Quader mit sichtbarem Würfelgitter. Jede vollständige waagrechte Würfelschicht wird daneben einzeln gezeigt; jedes Kästchen ist ein Einheitswürfel.';
 }
 if(d.kind==='cuboid-net'){
  height=500;const block=solid(d.length,d.width,d.height,[35,115,250,230]);body+=block.svg+label(block.x+block.w/2,block.y-block.h/2,'A',22)+label(block.x+block.w+block.dx/2,block.y-block.h/2+block.dy/2,'B',18)+label(block.x+block.w/2+block.dx/2,block.y-block.h+block.dy/2,'E',18)+label(160,375,'Länge '+measure(d.length))+label(160,398,'Breite '+measure(d.width))+label(160,421,'Höhe '+measure(d.height));
  const s=Math.min(355/(2*(d.length+d.width)),250/(d.height+2*d.width)),left=355,top=105+d.width*s;
  const faces=[['A',0,0,d.length,d.height],['B',d.length,0,d.width,d.height],['C',d.length+d.width,0,d.length,d.height],['D',2*d.length+d.width,0,d.width,d.height],['E',0,-d.width,d.length,d.width],['F',0,d.height,d.length,d.width]];
  for(const [id,x,y,w,h]of faces)body+=rect(left+x*s,top+y*s,w*s,h*s,['A','C'].includes(id)?'#d8edf0':['B','D'].includes(id)?'#b5dce3':'#ecf5f5',`data-net-face="${id}"`)+label(left+(x+w/2)*s,top+(y+h/2)*s+5,id,16);
  body+=label(535,398,'A/C: '+measure(d.length)+' × '+measure(d.height),12)+label(535,419,'B/D: '+measure(d.width)+' × '+measure(d.height),12)+label(535,440,'E/F: '+measure(d.length)+' × '+measure(d.width),12);
  description='Ein fachlich faltbares Netz aus genau sechs Rechtecken neben dem zugehörigen Quader. A vorne, B rechts, C hinten, D links, E oben, F unten. Gleiche Buchstaben bezeichnen dieselben Flächen.';footer='Schrägbild: Nutze die Maßangaben; miss nicht am Bildschirm.';
 }
 if(d.kind==='fraction-area'){
  const left=150,top=90,w=460,h=260,cw=w/d.columns,ch=h/d.rows,colors=['#8fc9d8','#b9d7a7','#e2c69d','#c7b9df','#c6d4a4','#b1cfdf','#e1b7c0','#d4d8a0','#b7c1e2','#e3cda9','#a5d6c9','#d6b4d7'];
  for(let y=0;y<d.rows;y++)for(let x=0;x<d.columns;x++)body+=rect(left+x*cw,top+y*ch,cw,ch,'#ffffff');
  for(let y=0;y<d.rows;y++){
   if(d.mode==='equal-groups')body+=`<g data-group="${y+1}">`;
   for(let x=0;x<d.selectedColumns;x++)body+=rect(left+x*cw,top+y*ch,cw,ch,d.mode==='equal-groups'?colors[y%colors.length]:'#b9dce7',`data-source-cell="${x},${y}"`);
   if(d.mode==='equal-groups')body+='</g>'+label(left+w+12,top+(y+.5)*ch+4,'Gruppe '+(y+1),11,'start');
  }
  if(d.mode==='part-of-part')for(let y=0;y<d.selectedRows;y++)for(let x=0;x<d.selectedColumns;x++)body+=rect(left+x*cw,top+y*ch,cw,ch,'#2f657c',`data-intersection-cell="${x},${y}"`);
  body+=label(380,382,d.mode==='part-of-part'?'Hellblau: Ausgangsanteil · Dunkelblau: Teil davon':'Jede farbige Zeile zeigt eine gleich große Gruppe',15);description='Das umrandete Rechteck bleibt ein und dasselbe Ganze. Die Quelle umfasst die linken '+d.selectedColumns+' von '+d.columns+' Spalten.'+(d.mode==='part-of-part'?' Dunkel markiert sind davon '+d.selectedRows+' von '+d.rows+' gleich großen Zeilen.':' Die Quelle ist in '+d.rows+' gleich große Zeilengruppen aufgeteilt.');
 }
 if(d.kind==='segment-figure'){
  const xs=d.points.map(p=>p.x),ys=d.points.map(p=>p.y),xmin=Math.floor(Math.min(0,...xs))-1,xmax=Math.ceil(Math.max(0,...xs))+1,ymin=Math.floor(Math.min(0,...ys))-1,ymax=Math.ceil(Math.max(0,...ys))+1,s=Math.min(580/(xmax-xmin),290/(ymax-ymin)),left=(760-(xmax-xmin)*s)/2,top=80;
  const X=x=>left+(x-xmin)*s,Y=y=>top+(ymax-y)*s;
  if(d.grid){for(let x=xmin;x<=xmax;x++)body+=line(X(x),Y(ymin),X(x),Y(ymax),'opacity=".15"');for(let y=ymin;y<=ymax;y++)body+=line(X(xmin),Y(y),X(xmax),Y(y),'opacity=".15"');body+=line(X(xmin),Y(0),X(xmax),Y(0))+line(X(0),Y(ymin),X(0),Y(ymax))+label(X(xmax),Y(0)-10,d.unit?'x ('+d.unit+')':'x')+label(X(0)+10,Y(ymax)-12,d.unit?'y ('+d.unit+')':'y');for(let x=xmin;x<=xmax;x++)if((xmax-xmin<=16)||x%2===0)body+=label(X(x),Y(0)+16,num(x),10);for(let y=ymin;y<=ymax;y++)if(y!==0&&(ymax-ymin<=16||y%2===0))body+=label(X(0)-12,Y(y)+4,num(y),10);}
  const points=new Map(d.points.map(p=>[p.label,p]));for(const edge of d.segments){const a=points.get(edge.from),b=points.get(edge.to);body+=line(X(a.x),Y(a.y),X(b.x),Y(b.y),`data-segment="${edge.from}-${edge.to}"`);}
  for(const p of d.points)body+=`<circle cx="${f(X(p.x))}" cy="${f(Y(p.y))}" r="4" fill="#bd5a38"/>`+label(X(p.x)+10,Y(p.y)-9,p.label,14,'start');
  description='Beschriftete Punkte mit exakt verbundenen Strecken. Horizontale und vertikale Einheiten sind gleich groß.';footer='Nutze die angegebenen Punkte und Eigenschaften; miss nicht am Bildschirm.';
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 ${height}" role="img" aria-label="${esc(d.title+'. '+description)}" style="width:100%;max-width:760px;height:auto"><title>${esc(d.title)}</title><desc>${esc(description)}</desc>${d.title.match(/.{1,80}/g).map((part,i)=>label(380,28+i*20,part,17)).join('')}${body}${footer?label(380,height-16,footer,13):''}</svg>`;
}
