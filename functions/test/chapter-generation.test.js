'use strict';const test=require('node:test');const assert=require('node:assert/strict');
const {planChapterSlots,bindGeneratedChapterSlots}=require('../lib/chapter-generation');
const {planTestBatches,generateTestInBatches}=require('../lib/test-batches');
const fixture=()=>({chapterSchemaVersion:1,chapters:Array.from({length:6},(_,i)=>({id:`ch_${i}`,title:`Thema${i}`,position:i+1})),chapterPlan:Array.from({length:6},(_,i)=>({chapterId:`ch_${i}`,topic:`Topic${i}`,count:3,points:8,materialIds:[]})),count:18,points:48,imageMode:'none',audioMode:'none'});
test('one existing batch carries all six chapter slots and exact point budgets',async()=>{
 const input=fixture(),slots=planChapterSlots(input);assert.equal(slots.length,18);assert.equal(slots.reduce((s,v)=>s+v.points,0),48);
 const batches=planTestBatches(input);assert.equal(batches.length,1);assert.deepEqual(batches[0].chapterSlots.map(s=>s.chapterId),slots.map(s=>s.chapterId));
 const out=await generateTestInBatches(input,async batch=>({data:{title:'Test',questions:batch.chapterSlots.map((slot)=>({type:'number',text:'Rechnen',points:slot.points}))},usage:{total_tokens:1}}));
 assert.equal(out.data.questions[17].chapterId,'ch_5');assert.equal(out.data.questions.reduce((s,q)=>s+q.points,0),48);
});
test('invalid budgets foreign materials and missing generated slots fail closed',()=>{
 const input=fixture();input.chapterPlan[0].points=1;assert.throws(()=>planChapterSlots(input));
 const other=fixture();other.chapterPlan[0].materialIds=['foreign'];assert.throws(()=>planChapterSlots(other,[]));
 assert.throws(()=>bindGeneratedChapterSlots([],planChapterSlots(fixture())));
});
test('similar test retains individual source slot points within a chapter',()=>{
 const input={chapterSchemaVersion:1,chapters:[{id:'ch_one',title:'One',position:1}],chapterPlan:[{chapterId:'ch_one',topic:'Numbers',count:2,points:4}],count:2,points:4,generationMode:'variant',variantSlots:[{points:1},{points:3}]};
 assert.deepEqual(planChapterSlots(input).map(s=>s.points),[1,3]);
});
test('Emmi briefing includes chapter names and source question assignments',()=>{
 const {cleanWholeTestRevisionRequest,wholeTestRevisionPrompt}=require('../lib/whole-test-revision');
 const request=cleanWholeTestRevisionRequest({instruction:'Vereinfache nur Kapitel Brüche',test:{chapterSchemaVersion:1,chapters:[{id:'ch_a',title:'Brüche',position:1}],questions:[{chapterId:'ch_a',type:'number',text:'Berechne',points:1,numericAnswer:2}]}});
 const prompt=wholeTestRevisionPrompt(request);assert.match(prompt,/"chapters":\[/);assert.match(prompt,/"chapterId":"ch_a"/);assert.match(prompt,/Brüche/);
});
