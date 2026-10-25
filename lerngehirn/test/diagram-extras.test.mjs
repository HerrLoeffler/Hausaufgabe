import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const X=await import('../diagram-extras.mjs');
const require=createRequire(import.meta.url);const server=require('../../functions/lib/learning-brain/diagram-extras.js');
const base={title:'Geometrie',unit:''};
test('area grid depicts equal unit cells, entire grid and the actual connected L shape',()=>{
 const d={...base,kind:'area-grid',columns:4,rows:3,cells:[{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:1,y:2}]},svg=X.renderExtraDiagram(d);assert.match(svg,/<svg/);assert.equal([...svg.matchAll(/data-area-cell=/g)].length,4);assert.equal([...svg.matchAll(/data-grid-cell=/g)].length,12);
 const square=svg.match(/data-area-cell="0,0"[^>]*width="([\d.]+)" height="([\d.]+)"/);assert.ok(square);assert.equal(square[1],square[2]);
});
test('unit cubes show every square of every full layer, not only smooth exterior faces',()=>{
 const d={...base,kind:'unit-cubes',length:3,width:2,height:4},svg=X.renderExtraDiagram(d);assert.equal([...svg.matchAll(/data-unit-cube=/g)].length,24);assert.equal([...svg.matchAll(/data-layer=/g)].length,4);assert.match(svg,/Schicht 4/);
});
test('cuboid net has six correct rectangles and a corresponding labelled cuboid',()=>{
 const d={...base,kind:'cuboid-net',unit:'cm',length:4,width:2,height:3},svg=X.renderExtraDiagram(d);assert.equal([...svg.matchAll(/data-net-face=/g)].length,6);assert.match(svg,/data-solid-face="A"/);assert.match(svg,/data-solid-face="B"/);assert.match(svg,/data-solid-face="E"/);assert.match(svg,/4 cm/);assert.match(svg,/2 cm/);assert.match(svg,/3 cm/);
});
test('fraction intersections and equal-group colours encode exact cell counts within an unchanged whole',()=>{
 const d={...base,kind:'fraction-area',rows:3,columns:4,selectedRows:2,selectedColumns:3,mode:'part-of-part'},svg=X.renderExtraDiagram(d);assert.equal([...svg.matchAll(/data-source-cell=/g)].length,9);assert.equal([...svg.matchAll(/data-intersection-cell=/g)].length,6);
 const groups=X.renderExtraDiagram({...d,mode:'equal-groups',selectedRows:1});assert.equal([...groups.matchAll(/data-group="/g)].length,3);assert.equal([...groups.matchAll(/data-source-cell=/g)].length,9);
});
test('segment figures share equal x/y units, real endpoints and escaped labels with server/browser parity',()=>{
 const d={...base,title:'<script>x</script>',kind:'segment-figure',points:[{label:'A',x:0,y:0},{label:'B',x:4,y:0},{label:'C',x:4,y:3}],segments:[{from:'A',to:'B'},{from:'B',to:'C'}],grid:true},svg=X.renderExtraDiagram(d);assert.match(svg,/&lt;script&gt;/);assert.doesNotMatch(svg,/<script>/);assert.equal([...svg.matchAll(/data-segment=/g)].length,2);
 const lines=[...svg.matchAll(/<line data-segment="[^"]+" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)].map(m=>m.slice(1).map(Number));assert.equal(lines.length,2);assert.ok(Math.abs((lines[0][2]-lines[0][0])/(lines[1][1]-lines[1][3])-4/3)<.0001);
 for(const scene of [d,{...d,svg:'<script>'},null])assert.deepEqual(X.validateExtraDiagram(scene),server.validateExtraDiagram(scene));assert.equal(X.renderExtraDiagram(null),'');
});
