import {test} from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const module=await import('../diagrams.mjs');
const require=createRequire(import.meta.url);const server=require('../../functions/lib/learning-brain/diagrams.js');
const rectangle={kind:'rectangle',title:'Rechteck',unit:'cm',width:8,height:4};
test('renderer shows proportional geometry, explicit dimension labels and accessible SVG',()=>{
 const svg=module.renderDiagram(rectangle);assert.match(svg,/<svg[^>]+role="img"/);assert.match(svg,/8 cm/);assert.match(svg,/4 cm/);assert.match(svg,/<title>Rechteck<\/title>/);
 const match=svg.match(/<rect[^>]*data-shape="rectangle"[^>]*width="([\d.]+)" height="([\d.]+)"/);assert.ok(match);assert.equal(Number(match[1])/Number(match[2]),2);
});
test('geometry uses actual angles and coordinate scales and labels all tick axes',()=>{
 const angle=module.renderDiagram({kind:'angle',title:'Winkel messen',unit:'°',degrees:60});assert.match(angle,/60°/);assert.match(angle,/180°/);assert.match(angle,/data-angle="60"/);
 const coord=module.renderDiagram({kind:'coordinates',title:'Punkte',unit:'m',xMin:-2,xMax:4,yMin:-2,yMax:4,step:1,points:[{label:'A',x:2,y:3}]});assert.match(coord,/x \(m\)/);assert.match(coord,/y \(m\)/);assert.match(coord,/>A<\/text>/);assert.match(coord,/data-x="2" data-y="3"/);
});
test('untrusted labels are escaped, malformed scenes produce no picture and server/browser agree',()=>{
 const scene={...rectangle,title:'<img src=x onerror=alert(1)>'};const svg=module.renderDiagram(scene);assert.match(svg,/&lt;img/);assert.doesNotMatch(svg,/<img/);
 for(const d of [rectangle,{...rectangle,width:-1},{...rectangle,svg:'<script>'},null])assert.deepEqual(module.validateDiagram(d),server.validateDiagram(d));
 assert.equal(module.renderDiagram({...rectangle,width:-1}),'');
});
test('bar heights follow the declared axis and data lists preserve repeated values',()=>{
 const bars=module.renderDiagram({kind:'bars',title:'Sportarten',unit:'Kinder',max:20,step:5,bars:[{label:'A',value:5},{label:'B',value:10}]});
 const heights=[...bars.matchAll(/data-bar="\d+"[^>]*height="([\d.]+)"/g)].map(x=>Number(x[1]));assert.deepEqual(heights,[60,120]);assert.match(bars,/20 Kinder/);
 const list=module.renderDiagram({kind:'data-list',title:'Messwerte',unit:'cm',values:[2,4,4,8]});assert.match(list,/2; 4; 4; 8 cm/);
});
test('visible ray, triangle sides and point positions encode the actual numeric task geometry',()=>{
 const angle=module.renderDiagram({kind:'angle',title:'Winkel',unit:'°',degrees:60});const ray=angle.match(/<line[^>]*x1="280" y1="305" x2="([\d.]+)" y2="([\d.]+)"[^>]*data-angle="60"/);assert.ok(ray);assert.equal(Number(ray[1]),365);assert.equal(Number(ray[2]),157.776);
 const triangle=module.renderDiagram({kind:'triangle',title:'Dreieck',unit:'cm',a:3,b:4,c:5}),vertices=triangle.match(/<polygon points="([^"]+)"/)[1].split(' ').map(v=>v.split(',').map(Number));
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);assert.ok(Math.abs(distance(vertices[1],vertices[2])/distance(vertices[0],vertices[1])-.6)<.00001);assert.ok(Math.abs(distance(vertices[0],vertices[2])/distance(vertices[0],vertices[1])-.8)<.00001);
 const coord=module.renderDiagram({kind:'coordinates',title:'Punkt',unit:'',xMin:-2,xMax:4,yMin:-2,yMax:4,step:1,points:[{label:'A',x:2,y:3}]});assert.match(coord,/<circle data-x="2" data-y="3" cx="316\.667" cy="126\.667"/);
});
test('every supported scene renders valid SVG without duplicated attributes',()=>{
 const scenes=[rectangle,{kind:'triangle',title:'Dreieck',unit:'cm',a:3,b:4,c:5},{kind:'circle',title:'Kreis',unit:'cm',radius:2},{kind:'cuboid',title:'Quader',unit:'cm',length:6,width:4,height:3},{kind:'cube-net',title:'Netz',unit:'',cells:[{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:1,y:3}]},{kind:'angle',title:'Winkel',unit:'°',degrees:60},{kind:'coordinates',title:'Punkte',unit:'m',xMin:0,xMax:4,yMin:0,yMax:4,step:1,points:[{label:'A',x:2,y:3}]},{kind:'bars',title:'Daten',unit:'Kinder',max:20,step:5,bars:[{label:'Fußball',value:12}]},{kind:'data-list',title:'Werte',unit:'cm',values:[2,3]}];
 for(const scene of scenes){assert.deepEqual(module.validateDiagram(scene),server.validateDiagram(scene));const svg=module.renderDiagram(scene);assert.match(svg,/<svg/);for(const tag of svg.matchAll(/<[a-z][^>]*>/g)){const attributes=[...tag[0].matchAll(/([\w-]+)="/g)].map(a=>a[1]);assert.equal(new Set(attributes).size,attributes.length,tag[0]);}}
});
