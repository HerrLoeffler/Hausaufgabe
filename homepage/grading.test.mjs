import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeAll, gradeTask, maxPoints, taskIds} from './grading.mjs';

const complete = {
  coords:{A:{x:-2,y:1},B:{x:2,y:3}},
  audio:[0],
  wordClass:{fox:'noun',shed:'noun',box:'noun',discovers:'verb',curious:'adj',old:'adj',mysterious:'adj'},
  equation:{first:'2',second:'3'},
  plantSlots:['flower','leaf','stem','roots'],
  historySlots:['charlemagne','gutenberg','bastille','sarajevo','wall'],
  musicGroups:{guitar:'strings',violin:'strings',flute:'winds',trumpet:'winds',drum:'percussion',xylophone:'percussion'},
  circuit:[0,3],
  butterflyOrder:['egg','caterpillar','chrysalis','butterfly'],butterflyTouched:true,
  angleSet:'60'
};

test('the curated ten cards can each be solved for 20 points',()=>{
  const result=gradeAll(complete);
  assert.equal(taskIds.length,10);
  assert.equal(maxPoints,20);
  assert.equal(result.points,20);
  assert.equal(result.answered,10);
  assert.ok(result.items.every(item=>item.points===2));
});

test('separate coordinate points and quadratic zeros earn independent partial credit',()=>{
  assert.equal(gradeTask('coordinate',{coords:{A:{x:-2,y:1},B:{x:0,y:3}}}).points,1);
  assert.equal(gradeTask('equation',{equation:{first:'2',second:'4'}}).points,1);
  assert.equal(gradeTask('equation',{equation:{first:'3',second:'2'}}).points,2);
  assert.equal(gradeTask('equation',{equation:{first:'2',second:'2'}}).points,1);
});

test('a partly filled timeline and extra circuit selection do not earn full credit',()=>{
  assert.equal(gradeTask('history',{historySlots:['charlemagne','gutenberg','bastille','sarajevo']}).points,1);
  assert.equal(gradeTask('history',{historySlots:['charlemagne','gutenberg','bastille','sarajevo','wall']}).points,2);
  assert.equal(gradeTask('circuit',{circuit:[0,1,3]}).points,0);
  assert.equal(gradeTask('circuit',{circuit:[0,3]}).points,2);
});

test('picture sequence requires a user action, and an adjacent swap gets partial credit',()=>{
  const order=['egg','caterpillar','chrysalis','butterfly'];
  assert.equal(gradeTask('butterfly',{butterflyOrder:order}).attempted,false);
  assert.equal(gradeTask('butterfly',{butterflyOrder:['egg','chrysalis','caterpillar','butterfly'],butterflyTouched:true}).points,1);
  assert.equal(gradeTask('butterfly',{butterflyOrder:order,butterflyTouched:true}).points,2);
});

test('editable maximum points rescale partial and total results',()=>{
  const changed={...complete,pointWeights:{coordinate:4,equation:3}};
  assert.equal(gradeAll(changed).max,23);
  assert.equal(gradeAll(changed).points,23);
  assert.equal(gradeTask('coordinate',{coords:{A:{x:-2,y:1}},pointWeights:{coordinate:3}}).points,1.5);
});

test('angle accepts a small instrumental tolerance',()=>{
  assert.equal(gradeTask('angleSet',{angleSet:'62'}).points,2);
  assert.equal(gradeTask('angleSet',{angleSet:'63'}).points,0);
  assert.equal(gradeTask('angleSet',{}).attempted,false);
});

test('empty submission stays at zero and English explanations are available',()=>{
  const result=gradeAll({},'en');
  assert.equal(result.points,0);
  assert.equal(result.answered,0);
  assert.match(result.items.find(item=>item.id==='history').solution,/Charlemagne/);
});

test('clearing word classifications removes penalties and attempted state',()=>{
 const roles={fox:'noun',shed:'noun',box:'noun',discovers:'verb',curious:'adj',old:'adj',mysterious:'adj'};
 assert.equal(gradeTask('markwords',{wordClass:{...roles,the:null}}).points,2);
 assert.equal(gradeTask('markwords',{wordClass:{the:null}}).attempted,false);
});
