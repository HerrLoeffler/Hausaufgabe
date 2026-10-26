'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {sceneRegions,anchoredCandidate}=require('../lib/learning-brain/scaffolding');
const source={id:'grid-3',prompt:'Zähle die Quadrate.',contextText:'',input:'number',options:[],family:'count',answer:{kind:'number',values:['3']},rubric:'3',diagram:{kind:'area-grid',title:'Eine Reihe',unit:'',columns:3,rows:1,cells:[{x:0,y:0},{x:1,y:0},{x:2,y:0}]},workshop:null,media:null};
const hint=()=>({explanation:'Zähle jedes Kästchen genau einmal.',question:'Wie viele Kästchen sind in dieser Reihe?',input:'number',options:[],answer:{kind:'number',values:['3']},rubric:'Drei vorhandene Zellen.',focusIds:['row:0'],numberLabels:true});
test('successive assistance retains exactly the same 3 source cells, identity and context',()=>{let s={phase:'help',task:source,originalTask:source,supportStage:1};for(let i=1;i<=3;i++){s.supportStage=i;const r=anchoredCandidate(hint(),s,{});assert.deepEqual(r.task.diagram,source.diagram);assert.equal(r.task.id,source.id);assert.equal(r.assistance.stage,i);s.task=r.task;}assert.deepEqual(sceneRegions(source).filter(r=>r.id.startsWith('cell:')).map(r=>r.id),['cell:0:0','cell:1:0','cell:2:0']);});
test('unknown region and ambiguous upper row in a single row fail before review',()=>{const s={phase:'help',task:source,originalTask:source};assert.throws(()=>anchoredCandidate({...hint(),focusIds:['row:1']},s),/region/i);assert.throws(()=>anchoredCandidate({...hint(),question:'Wie viele sind in der oberen Reihe?'},s),/einzigen Reihe/);});
test('question is visibly linked but no private answer is put into assistance',()=>{const r=anchoredCandidate(hint(),{phase:'help',task:source,supportStage:2},{question:'Was ist ein Quadrat?'});assert.equal(r.assistance.replyTo,'Was ist ein Quadrat?');assert.equal(r.assistance.answer,undefined);assert.equal(r.task.answer.values[0],'3');});
test('fraction and text anchors are based on actual source, not guessed answers',()=>{assert.ok(sceneRegions({workshop:{tool:'fraction-board',denominator:3}}).some(r=>r.id==='part:2'));assert.ok(sceneRegions({workshop:{tool:'text-workbench',mode:'select',text:'Der kleine Hund'}}).some(r=>r.id==='token:2'&&r.label.includes('Hund')));});
test('help cannot change a workshop answer contract or discard the source model',()=>{const task={...source,id:'board',diagram:null,input:'workshop',workshop:{tool:'fraction-board',version:1,role:'answer',goal:'equivalent',denominator:3,numerator:1,targetDenominator:6},answer:{kind:'exact-fraction',values:['2/6']}};const s={phase:'help',task,originalTask:task};assert.throws(()=>anchoredCandidate({...hint(),input:'workshop',focusIds:['part:0']},s),/Antwortvertrag/);const r=anchoredCandidate({...hint(),focusIds:['part:0']},s);assert.equal(r.task.workshop.role,'support');assert.equal(r.task.workshop.denominator,3);});

test('real help API has no scene fields and independent review sees the preserved source',async()=>{
 const {createAI}=require('../lib/learning-brain/ai');const requests=[],replies=[hint(),{approved:true,reason:'Counts the same three cells with numbers.'}];
 const ai=createAI({client:{responses:{create:async req=>{requests.push(req);return {status:'completed',output_text:JSON.stringify(replies.shift())};}}}});
 const r=await ai.next({phase:'help',topic:{subject:'math'},originalTask:source,task:source,supportStage:2},{});
 assert.equal(requests[0].text.format.name,'learning_help');assert.equal(requests[0].text.format.schema.properties.diagram,undefined);assert.equal(requests[1].text.format.name,'learning_help_review');
 const review=JSON.parse(requests[1].input[1].content);assert.deepEqual(review.sourceTask.diagram,source.diagram);assert.deepEqual(r.task.diagram,source.diagram);assert.equal(r.assistance.stage,2);
});

test('coordinate support observation never overrides a scalar microquestion answer',async()=>{
 const {createAI}=require('../lib/learning-brain/ai');for(const [exactResult,answer]of [[false,'3'],[true,'9']]){
  const outcome=answer==='3'?'correct':'incorrect',requests=[],responses=[{outcome,short:'Geprüft.',reason:'Scalar value'},{approved:true,reason:'Matches scalar answer'}];
  const ai=createAI({client:{responses:{create:async req=>{requests.push(JSON.parse(req.input[1].content));return {status:'completed',output_text:JSON.stringify(responses.shift())};}}}});
  const result=await ai.assess({task:{input:'number',workshop:{tool:'coordinate-plane',role:'support'},answer:{kind:'number',values:['3']}}},answer,{workshop:{tool:'coordinate-plane',role:'support',exactResult}});assert.equal(result.outcome,outcome);assert.equal(requests[0].exactResult,answer==='3');
 }
});

test('fraction focus distinguishes current sixths from reference thirds',()=>{const task={workshop:{tool:'fraction-board',denominator:3}};const r=sceneRegions(task,{tool:'fraction-board',final:{denominator:6}});assert.equal(r.find(x=>x.id==='part:5').label,'Dein Teil 6 von 6');assert.equal(r.find(x=>x.id==='reference-part:1').label,'Vorlage: Teil 2 von 3');});
