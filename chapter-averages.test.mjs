import test from 'node:test';import assert from 'node:assert/strict';
import {classAverages} from './chapter-averages.mjs';
const scale={thresholds:[90,80,60,40,20,0]};const grade=(p,s)=>s.thresholds.findIndex(t=>p>=t)+1;
const sub=(awarded,status='graded')=>({status,gradeScaleSnapshot:scale,grade:awarded===4?1:4,totalPoints:awarded,maxPoints:4,percent:awarded*25,chapterSnapshot:{chapters:[{id:'ch_a',title:'Brüche',position:1}],questions:[{id:'q',chapterId:'ch_a',position:1,maxPoints:4}]},grading:{q:{awardedPoints:awarded,needsReview:false}}});
test('class chapter and total averages use individual final grades and exclude pending submissions',()=>{
 const r=classAverages([sub(4),sub(2),sub(0,'review')],grade);assert.equal(r.included,2);assert.equal(r.pending,1);assert.equal(r.chapters[0].points,3);assert.equal(r.chapters[0].percent,75);assert.equal(r.chapters[0].grade,2.5);assert.equal(r.total.grade,2.5);assert.equal(r.total.percent,75);
});
test('historically changed chapter maxima stay separate; missing grades never become zero',()=>{
 const changed=sub(2);changed.chapterSnapshot=structuredClone(changed.chapterSnapshot);changed.chapterSnapshot.questions[0].maxPoints=8;const noGrade={...sub(2),grade:null,gradeScaleSnapshot:null};
 const r=classAverages([sub(4),changed,noGrade],grade);assert.equal(r.chapters.length,2);assert.equal(r.mixedVersions,true);assert.equal(r.total.grade,2.5);assert.equal(r.total.gradeCount,2);assert.equal(classAverages([sub(0,'review')],grade).total,null);
});
test('a graded submission with a missing snapshot question is excluded as a whole',()=>{
 const incomplete=sub(4);incomplete.chapterSnapshot=structuredClone(incomplete.chapterSnapshot);incomplete.chapterSnapshot.chapters.push({id:'ch_b',title:'Kürzen',position:2});incomplete.chapterSnapshot.questions.push({id:'missing',chapterId:'ch_b',position:2,maxPoints:2});
 const r=classAverages([sub(4),incomplete],grade);assert.equal(r.included,1);assert.equal(r.pending,1);assert.equal(r.total.count,1);assert.equal(r.chapters[0].count,1);
});
