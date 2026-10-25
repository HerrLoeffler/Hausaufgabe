'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const diagrams=require('../lib/learning-brain/diagrams');
const base={title:'Ein Lernbild',unit:'cm'};
test('valid scenes preserve exact source measurements and reject mismatched or hidden fields',()=>{
 for(const scene of [{...base,kind:'rectangle',width:8,height:3},{...base,kind:'triangle',a:3,b:4,c:5},{...base,kind:'circle',radius:4},{...base,kind:'cuboid',length:6,width:4,height:3},{...base,kind:'angle',unit:'°',degrees:72},{...base,kind:'coordinates',unit:'',xMin:-2,xMax:4,yMin:-2,yMax:4,step:1,points:[{label:'A',x:2,y:3}]},{...base,kind:'bars',unit:'Kinder',max:20,step:5,bars:[{label:'Fußball',value:12}]},{...base,kind:'data-list',unit:'cm',values:[2,4,4,8]}])assert.deepEqual(diagrams.validateDiagram(scene),scene,scene.kind);
 assert.equal(diagrams.validateDiagram({...base,kind:'rectangle',width:8,height:3,svg:'<script>'}),null);
});
test('impossible triangles, unbounded geometry, inconsistent scales and off-grid points fail closed',()=>{
 const invalid=[{...base,kind:'triangle',a:1,b:2,c:3},{...base,kind:'rectangle',width:-1,height:3},{...base,kind:'circle',radius:Infinity},{...base,kind:'cuboid',length:3,width:0,height:3},{...base,kind:'angle',unit:'°',degrees:200},{...base,kind:'coordinates',xMin:0,xMax:4,yMin:0,yMax:4,step:1,points:[{label:'A',x:8,y:1}]},{...base,kind:'coordinates',xMin:0,xMax:4,yMin:0,yMax:4,step:.01,points:[]},{...base,kind:'bars',max:10,step:3,bars:[{label:'A',value:5}]},{...base,kind:'bars',max:10,step:2,bars:[{label:'A',value:11}]},{...base,kind:'data-list',values:[NaN]}];
 for(const scene of invalid)assert.equal(diagrams.validateDiagram(scene),null,scene.kind);
});
test('cube nets must be connected and actually fold into six distinct cube faces',()=>{
 const cross={...base,kind:'cube-net',unit:'',cells:[{x:1,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:1,y:3}]};assert.deepEqual(diagrams.validateDiagram(cross),cross);
 assert.equal(diagrams.validateDiagram({...cross,cells:[0,1,2,3,4,5].map(x=>({x,y:0}))}),null);
 assert.equal(diagrams.validateDiagram({...cross,cells:[{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}]}),null);
 assert.equal(diagrams.validateDiagram({...cross,cells:[...cross.cells.slice(0,5),{x:1,y:0}]}),null);
});
test('strict AI schema exposes only bounded typed scene variants with no arbitrary drawing escape hatch',()=>{
 assert.ok(diagrams.diagramSchema?.anyOf?.length>=9);
 for(const variant of diagrams.diagramSchema.anyOf){assert.equal(variant.additionalProperties,false);assert.deepEqual([...variant.required].sort(),Object.keys(variant.properties).sort());assert.equal(variant.type,'object');}
});
test('measurements with precision the renderer cannot label are rejected rather than rounded into a different task',()=>{
 assert.equal(diagrams.validateDiagram({...base,kind:'circle',radius:.12345}),null);
 assert.equal(diagrams.validateDiagram({...base,kind:'data-list',values:[.0001]}),null);
});
