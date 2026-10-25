import {extraDiagramSchema,validateExtraDiagram,renderExtraDiagram} from './diagram-extras.mjs';
// Keep the bounded scene contract aligned with functions/lib/learning-brain/diagrams.js.
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
const diagramSchema={anyOf:Object.entries(variants).map(([kind,properties])=>object({kind:{type:'string',enum:[kind]},title:text(120),unit:text(16),...properties})).concat(extraDiagramSchema.anyOf)};
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
 if(extraDiagramSchema.anyOf.some(s=>s.properties.kind.enum[0]===d?.kind))return validateExtraDiagram(d);
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
export {diagramSchema,validateDiagram};
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=value=>String(Math.round(value*1000)/1000);
const display=value=>f(value).replace('.',',');
const label=(x,y,value,anchor='middle',extra='')=>`<text x="${f(x)}" y="${f(y)}" text-anchor="${anchor}" font-family="system-ui,sans-serif" ${/\bfont-size="/.test(extra)?'':'font-size="14"'} fill="#183b45" ${extra}>${escape(value)}</text>`;
const line=(x1,y1,x2,y2,extra='')=>`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" ${/\bstroke="/.test(extra)?'':'stroke="#245668"'} ${/\bstroke-width="/.test(extra)?'':'stroke-width="2"'} ${extra}/>`;
const polygon=(points,fill='#d8edf0')=>`<polygon points="${points.map(([x,y])=>`${f(x)},${f(y)}`).join(' ')}" fill="${fill}" stroke="#245668" stroke-width="2"/>`;
export function renderDiagram(input){
 if(extraDiagramSchema.anyOf.some(s=>s.properties.kind.enum[0]===input?.kind))return renderExtraDiagram(input);
 const d=validateDiagram(input);if(!d)return '';
 const measure=n=>display(n)+(d.unit?' '+d.unit:'');let body='',description='';
 if(d.kind==='rectangle'){
  const s=Math.min(350/d.width,220/d.height),w=d.width*s,h=d.height*s,x=(560-w)/2,y=80+(240-h)/2;
  body=`<rect data-shape="rectangle" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="#d8edf0" stroke="#245668" stroke-width="2"/>`+label(280,y+h+25,measure(d.width))+label(x-15,y+h/2,measure(d.height),'end');description=`Rechteck: Breite ${measure(d.width)}, Höhe ${measure(d.height)}.`;
 }
 if(d.kind==='triangle'){
  const cx=(d.b*d.b+d.c*d.c-d.a*d.a)/(2*d.c),height=Math.sqrt(d.b*d.b-cx*cx),xmin=Math.min(0,cx),xmax=Math.max(d.c,cx),s=Math.min(330/(xmax-xmin),220/height),left=(560-(xmax-xmin)*s)/2;
  const A=[left-xmin*s,310],B=[left+(d.c-xmin)*s,310],C=[left+(cx-xmin)*s,310-height*s];
  body=polygon([A,B,C])+label((A[0]+B[0])/2,338,'c = '+measure(d.c))+label((A[0]+C[0])/2-14,(A[1]+C[1])/2,'b = '+measure(d.b),'end')+label((B[0]+C[0])/2+14,(B[1]+C[1])/2,'a = '+measure(d.a),'start')+label(A[0]-10,A[1]+3,'A')+label(B[0]+10,B[1]+3,'B')+label(C[0],C[1]-12,'C');description=`Dreieck mit Seiten a = ${measure(d.a)}, b = ${measure(d.b)}, c = ${measure(d.c)}.`;
 }
 if(d.kind==='circle'){
  body='<circle cx="280" cy="200" r="110" fill="#d8edf0" stroke="#245668" stroke-width="2"/>'+line(280,200,390,200)+label(335,188,'r = '+measure(d.radius))+'<circle cx="280" cy="200" r="3" fill="#245668"/>';description=`Kreis mit Radius ${measure(d.radius)}.`;
 }
 if(d.kind==='cuboid'){
  const s=Math.min(330/(d.length+.55*d.width),220/(d.height+.4*d.width)),w=d.length*s,h=d.height*s,dx=.55*d.width*s,dy=-.4*d.width*s,x=(560-w-dx)/2,y=310;
  const A=[x,y],B=[x+w,y],C=[x+w,y-h],D=[x,y-h],E=[x+dx,y-h+dy],F=[x+w+dx,y-h+dy],G=[x+w+dx,y+dy];
  body=polygon([A,B,C,D])+polygon([D,C,F,E],'#ecf5f5')+polygon([B,G,F,C],'#b5dce3')+label(x+w/2,y+25,measure(d.length))+label(x-12,y-h/2,measure(d.height),'end')+label(x+w+dx/2+12,y+dy/2,measure(d.width),'start');description=`Quader: Länge ${measure(d.length)}, Breite ${measure(d.width)}, Höhe ${measure(d.height)}. Schrägbild; nutze die Maßangaben.`;
 }
 if(d.kind==='coordinates'){
  const spanX=d.xMax-d.xMin,spanY=d.yMax-d.yMin,s=Math.min(350/spanX,220/spanY),left=(560-spanX*s)/2,top=80+(240-spanY*s)/2;
  const X=v=>left+(v-d.xMin)*s,Y=v=>top+(d.yMax-v)*s,x0=X(0),y0=Y(0);
  for(let i=0;i<=Math.round(spanX/d.step);i++){const v=d.xMin+i*d.step,x=X(v);body+=line(x,Y(d.yMin),x,Y(d.yMax),'stroke-opacity=".15"')+label(x,y0+19,display(v));}
  for(let i=0;i<=Math.round(spanY/d.step);i++){const v=d.yMin+i*d.step,y=Y(v);body+=line(X(d.xMin),y,X(d.xMax),y,'stroke-opacity=".15"');if(v!==0)body+=label(x0-9,y+4,display(v),'end');}
  body+=line(X(d.xMin),y0,X(d.xMax)+8,y0)+line(x0,Y(d.yMin),x0,Y(d.yMax)-8)+label(X(d.xMax)+10,y0-10,d.unit?`x (${d.unit})`:'x','end')+label(x0+8,Y(d.yMax)-18,d.unit?`y (${d.unit})`:'y','start');
  for(const p of d.points)body+=`<circle data-x="${f(p.x)}" data-y="${f(p.y)}" cx="${f(X(p.x))}" cy="${f(Y(p.y))}" r="5" fill="#c05634"/>`+label(X(p.x)+10,Y(p.y)-9,p.label,'start');
  description=`Koordinatengitter, Schrittweite ${measure(d.step)}. Punkte: ${d.points.map(p=>p.label).join(', ')}.`;
 }
 if(d.kind==='angle'){
  const x=280,y=305,r=190,point=(degrees,radius)=>[x+Math.cos(degrees*Math.PI/180)*radius,y-Math.sin(degrees*Math.PI/180)*radius];
  body='<path d="M 90 305 A 190 190 0 0 1 470 305" fill="none" stroke="#8baab0" stroke-width="2"/>';
  for(let degree=0;degree<=180;degree+=5){const major=degree%10===0,[x1,y1]=point(degree,r),[x2,y2]=point(degree,r-(major?12:6));body+=line(x1,y1,x2,y2,'stroke-width="1"');if(degree%20===0||degree===90){const [tx,ty]=point(degree,r+22);body+=label(tx,ty+5,degree+'°');}}
  const [rx,ry]=point(d.degrees,170),[ax,ay]=point(d.degrees,45);
  body+=line(x,y,x+180,y)+line(x,y,rx,ry,`data-angle="${f(d.degrees)}" stroke="#c05634" stroke-width="3"`)+`<path d="M ${x+45} ${y} A 45 45 0 0 0 ${f(ax)} ${f(ay)}" fill="none" stroke="#c05634" stroke-width="2"/>`+'<circle cx="280" cy="305" r="3" fill="#245668"/>';
  description='Winkel mit einem Winkelmesser von 0° bis 180°. Die Skala verläuft in Schritten von 5°.';
 }
 if(d.kind==='cube-net'){
  const xs=d.cells.map(p=>p.x),ys=d.cells.map(p=>p.y),minX=Math.min(...xs),minY=Math.min(...ys),w=Math.max(...xs)-minX+1,h=Math.max(...ys)-minY+1,s=Math.min(330/w,235/h),left=(560-w*s)/2,top=80+(240-h*s)/2;
  body=d.cells.map(p=>`<rect x="${f(left+(p.x-minX)*s)}" y="${f(top+(p.y-minY)*s)}" width="${f(s)}" height="${f(s)}" fill="#d8edf0" stroke="#245668" stroke-width="2"/>`).join('');description='Ein zusammenhängendes Würfelnetz aus sechs gleich großen Quadraten.';
 }
 if(d.kind==='bars'){
  const left=90,top=70,width=390,height=240,barSlot=width/d.bars.length,barWidth=Math.min(56,barSlot*.65);
  for(let i=0;i<=Math.round(d.max/d.step);i++){const value=i*d.step,y=top+height-value/d.max*height;body+=line(left,y,left+width,y,'stroke-opacity=".2"')+label(left-10,y+5,i===Math.round(d.max/d.step)?measure(value):display(value),'end');}
  body+=line(left,top,left,top+height)+line(left,top+height,left+width,top+height);
  for(const [i,bar]of d.bars.entries()){const h=bar.value/d.max*height,x=left+i*barSlot+(barSlot-barWidth)/2;body+=`<rect data-bar="${i}" x="${f(x)}" y="${f(top+height-h)}" width="${f(barWidth)}" height="${f(h)}" fill="#3d8596"/>`+bar.label.match(new RegExp('.{1,'+Math.max(5,Math.min(12,Math.floor(barSlot/7)))+'}', 'g')).map((part,row)=>label(left+(i+.5)*barSlot,top+height+20+row*12,part,'middle','font-size=\"11\"')).join('');}
  description=`Balkendiagramm. Senkrechte Achse: 0 bis ${measure(d.max)}, Schrittweite ${measure(d.step)}.`;
 }
 if(d.kind==='data-list'){
  const groups=[];let row='';for(const value of d.values.map(display)){if(row.length+value.length>54){groups.push(row);row='';}row+=(row?'; ':'')+value;}if(row)groups.push(row);
  body=groups.map((row,i)=>label(280,110+i*34,row+(i===groups.length-1&&d.unit?' '+d.unit:''))).join('');description='Datenliste: '+d.values.map(display).join('; ')+(d.unit?' '+d.unit:'')+'.';
 }
 const footer=d.kind==='cuboid'?'Schrägbild: Nutze die Maßangaben.':['rectangle','triangle','circle'].includes(d.kind)?'Nutze die Maßangaben; miss nicht am Bildschirm.':'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 400" role="img" aria-label="${escape(d.title+'. '+description)}" style="width:100%;max-width:640px;height:auto"><title>${escape(d.title)}</title><desc>${escape(description)}</desc>${d.title.match(/.{1,65}/g).map((part,i)=>label(280,28+i*19,part)).join('')}${body}${footer?label(280,382,footer):''}</svg>`;
}
