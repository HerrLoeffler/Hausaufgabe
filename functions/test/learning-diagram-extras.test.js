'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const X=require('../lib/learning-brain/diagram-extras');
const base={title:'Lernbild',unit:''};
const scenes=[{...base,kind:'area-grid',columns:4,rows:3,cells:[{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:1,y:2}]},{...base,kind:'unit-cubes',length:3,width:2,height:4},{...base,kind:'cuboid-net',length:4,width:2,height:3},{...base,kind:'fraction-area',rows:3,columns:4,selectedRows:2,selectedColumns:3,mode:'part-of-part'},{...base,kind:'segment-figure',points:[{label:'A',x:0,y:0},{label:'B',x:4,y:0},{label:'C',x:4,y:3}],segments:[{from:'A',to:'B'},{from:'B',to:'C'}],grid:true}];
test('five bounded extra scenes retain actual public geometry and schema exposes only exact fields',()=>{
 for(const scene of scenes)assert.deepEqual(X.validateExtraDiagram(scene),scene,scene.kind);
 assert.equal(X.extraDiagramSchema.anyOf.length,5);for(const schema of X.extraDiagramSchema.anyOf){assert.equal(schema.additionalProperties,false);assert.deepEqual(schema.required.sort(),Object.keys(schema.properties).sort());}
});
test('area-grid requires connected distinct in-bounds squares rather than fabricated area',()=>{
 const scene=scenes[0];for(const cells of [[],[{x:0,y:0},{x:3,y:2}],[{x:0,y:0},{x:0,y:0}],[{x:4,y:0}],[{x:.5,y:0}]])assert.equal(X.validateExtraDiagram({...scene,cells}),null);
 assert.equal(X.validateExtraDiagram({...scene,columns:13}),null);
});
test('volume/net/fraction fields reject impossible or unrenderable quantities and preserve the same whole',()=>{
 for(const scene of [{...scenes[1],length:2.5},{...scenes[1],height:9},{...scenes[2],width:0},{...scenes[2],height:1.0001},{...scenes[3],selectedColumns:5},{...scenes[3],selectedRows:4},{...scenes[3],rows:0},{...scenes[3],mode:'equal-groups'}])assert.equal(X.validateExtraDiagram(scene),null);
 assert.ok(X.validateExtraDiagram({...scenes[3],mode:'equal-groups',selectedRows:1}));
});
test('segments require actual known distinct points and unambiguous edges; no markup escapes configuration',()=>{
 const s=scenes[4];for(const scene of [{...s,points:[...s.points,{label:'a',x:1,y:1}]},{...s,segments:[{from:'A',to:'D'}]},{...s,segments:[{from:'A',to:'A'}]},{...s,segments:[{from:'A',to:'B'},{from:'B',to:'A'}]},{...s,points:[{label:'A',x:0,y:0},{label:'B',x:0,y:0}],segments:[{from:'A',to:'B'}]},{...s,svg:'<script>'},{...s,points:[{label:'A',x:0,y:0},{label:'B',x:13,y:0}]}])assert.equal(X.validateExtraDiagram(scene),null);
});
