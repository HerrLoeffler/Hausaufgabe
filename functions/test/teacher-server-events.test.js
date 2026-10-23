'use strict';const test=require('node:test');const assert=require('node:assert/strict');
const {quizTransitions,jobTransition,usageMetric}=require('../lib/teacher-server-events');
test('only actual transitions are projected and content is never copied',()=>{
 assert.deepEqual(quizTransitions({published:false,generationStatus:'generating'},{published:true,generationStatus:'ready',title:'PRIVATE'}),['test_published']);
 assert.deepEqual(quizTransitions({published:true,generationStatus:'ready'},{published:true,generationStatus:'ready'}),[]);
 assert.equal(jobTransition('queued','running'),'generation_started');assert.equal(jobTransition('running','ready'),'generation_completed');assert.equal(jobTransition('ready','ready'),null);
 const m=usageMetric({inputTokens:3,outputTokens:4,totalTokens:7,cacheHit:true,text:'PRIVATE',model:'PRIVATE'});
 assert.deepEqual(m,{inputTokens:3,outputTokens:4,totalTokens:7,cacheHit:true});
});
