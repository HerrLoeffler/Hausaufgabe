'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {diagramFacts}=require('../lib/learning-brain/diagrams');
test('verified visual facts count actual cells, full cube layers and exact fraction references',()=>{
 assert.deepEqual(diagramFacts({kind:'area-grid',title:'Figur',unit:'cm²',rows:2,columns:2,cells:[{x:0,y:0},{x:1,y:0},{x:0,y:1}]}),{kind:'area-grid',cells:3,columns:2,rows:2});
 assert.deepEqual(diagramFacts({kind:'unit-cubes',title:'Körper',unit:'',length:3,width:2,height:4}),{kind:'unit-cubes',cubesPerLayer:6,layers:4,totalCubes:24});
 const f=diagramFacts({kind:'fraction-area',title:'Anteil',unit:'',rows:3,columns:4,selectedRows:2,selectedColumns:3,mode:'part-of-part'});assert.equal(f.wholeCells,12);assert.equal(f.sourceCells,9);assert.equal(f.highlightedCells,6);assert.equal(f.fractionOfWhole,'6/12');assert.equal(f.fractionOfSource,'6/9');
});
test('invalid scenes cannot provide authoritative facts',()=>{assert.equal(diagramFacts({kind:'area-grid',rows:2,columns:2,cells:[{x:9,y:9}]}),null);});
