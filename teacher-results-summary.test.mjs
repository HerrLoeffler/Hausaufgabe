import test from 'node:test';
import assert from 'node:assert/strict';
import * as results from './teacher-grading-summary.mjs';
const final=(id,points=2,max=4,seconds=60)=>({id,studentName:id,status:'graded',grade:3,totalPoints:points,maxPoints:max,elapsedSeconds:seconds,grading:{q:{awardedPoints:points,maxPoints:max,needsReview:false}}});
test('name sorting uses explicit compound surname and preserves legacy initials without guessing',()=>{
 const rows=[{id:'a',studentName:'Zoe van der Meer',firstName:'Zoe',lastName:'van der Meer'},{id:'b',studentName:'Anna Weiß',firstName:'Anna',lastName:'Weiß'},{id:'c',studentName:'AB'},{id:'d'}];
 assert.deepEqual(results.sortTeacherResults(rows,'lastName','asc').map(s=>s.id),['c','a','b','d']);
 assert.deepEqual(results.sortTeacherResults(rows,'firstName','desc').map(s=>s.id),['a','b','c','d']);
 assert.equal(results.teacherResultName(rows[0]).lastName,'van der Meer');
 assert.equal(results.teacherResultName(rows[2]).lastName,'');
});
test('numeric sorting keeps missing duration and provisional score last in both directions without mutating data',()=>{
 const rows=[final('slow',4,4,120),final('fast',1,4,0),{...final('missing'),elapsedSeconds:null},{...final('pending'),status:'review',grading:{q:{awardedPoints:2,maxPoints:4,needsReview:true}}}];
 const before=JSON.stringify(rows);
 assert.deepEqual(results.sortTeacherResults(rows,'duration','asc').map(s=>s.id),['fast','pending','slow','missing']);
 assert.deepEqual(results.sortTeacherResults(rows,'duration','desc').map(s=>s.id),['slow','pending','fast','missing']);
 assert.equal(results.sortTeacherResults(rows,'points','desc').at(-1).id,'pending');
 assert.equal(JSON.stringify(rows),before);
});
test('averages use only final valid scores, exact ratios, and their own duration denominator',()=>{
 const rows=[final('a',1,3,0),final('b',3,4,120),{...final('pending',4),grading:{q:{awardedPoints:4,maxPoints:4,needsReview:true}}},{...final('missing'),elapsedSeconds:''},{...final('running'),status:'running'}];
 const avg=results.teacherResultsAverages(rows);
 assert.equal(avg.finalCount,3);assert.equal(avg.pendingCount,1);assert.equal(avg.runningCount,1);
 assert.equal(avg.points.count,3);assert.equal(avg.points.value,2);
 assert.ok(Math.abs(avg.percent.value-(100/3+75+50)/3)<1e-8);
 assert.equal(avg.duration.count,3);assert.equal(avg.duration.value,60);
 assert.equal(results.teacherResultsAverages([]).points.value,null);
});
test('view subset and canonical pending override affect denominators without changing saved scores',()=>{
 const rows=[final('a'),final('b',4,4,40)];
 assert.equal(results.teacherResultsAverages(rows.slice(1)).points.value,4);
 const before=JSON.stringify(rows),avg=results.teacherResultsAverages(rows,s=>s.id==='a');
 assert.equal(avg.points.count,1);assert.equal(avg.pendingCount,1);assert.equal(JSON.stringify(rows),before);
});
test('legacy non-string names stay missing instead of breaking result sorting',()=>{
 const rows=[{id:'missing',studentName:123},{id:'valid',studentName:'AB'}];
 assert.equal(results.teacherResultName(rows[0]).label,'Ohne Name / Kürzel');
 assert.deepEqual(results.sortTeacherResults(rows,'lastName','desc').map(s=>s.id),['valid','missing']);
});
