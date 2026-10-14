"use strict";
const test=require("node:test"), assert=require("node:assert/strict");
const { createBatchGenerator } = require("../lib/wissensreise-generation");
test("generic source-bound batch uses shared route and independent learning-goal review", async () => {
 const sources=[{id:"x",type:"single",text:"Welcher Planet heißt roter Planet?",options:[{text:"Mars",correct:true},{text:"Venus",correct:false}]}]; let calls=0;
 const generate=createBatchGenerator({consumeQuota:async()=>{}, recordUsage:async()=>{}, structuredResponse:async request=>{calls++; assert.ok(request.userPrompt.includes(sources[0].text)); return {usage:{},data:calls===1?{variants:Array.from({length:12},(_,i)=>({sourceId:"x",question:{...sources[0],text:`Welcher Planet ist als roter Planet bekannt? Kontext${i}`},learning:{objective:'Planetenmerkmale erkennen',explanation:'Mars wird wegen seiner Oberfläche roter Planet genannt.',hint:'Denke an die rote Oberfläche.',workedExample:'Ein anderer Planet: Die Erde wird blauer Planet genannt.'}}))}:{issues:[]}};}});
 assert.equal((await generate({ownerId:"t",sourceQuestions:sources,context:{subject:"Astronomie"},existing:[]})).length,12); assert.equal(calls,2);
});
test("selected gap view can be derived from a choice source with bound objective and complete keys",async()=>{
 const q={id:'x',type:'single',text:'Welcher Planet heißt roter Planet?',options:[{text:'Mars',correct:true},{text:'Venus',correct:false}]};let calls=0;const generate=createBatchGenerator({consumeQuota:async()=>{},recordUsage:async()=>{},structuredResponse:async request=>{calls++;return{usage:{},data:calls===1?{variants:Array.from({length:12},(_,i)=>({sourceId:'x',question:{type:'gapfill',text:`Beispiel${i}: Der rote Planet heißt [Mars].`},learning:{objective:'Planetenmerkmale erkennen',explanation:'Mars wird roter Planet genannt.',hint:'Rote Oberfläche.',workedExample:'Die Erde ist der blaue Planet.'}}))}:{issues:[]}};}});const result=await generate({ownerId:'t',sourceQuestions:[q],context:{subject:'Astronomie'},formats:['gapfill'],existing:[]});assert.equal(result.length,12);assert.ok(result.every(i=>i.type==='gapfill'&&i.sourceId==='x'&&i.learning.objective));
});
test("foreign source bindings and learning-goal drift review are rejected", async () => {
 const q={id:"x",type:"number",text:"2 + 3 = ?",numericAnswer:5}; const generate=createBatchGenerator({consumeQuota:async()=>{},recordUsage:async()=>{},structuredResponse:async()=>({usage:{},data:{variants:[{sourceId:"foreign",question:q}]}})}); await assert.rejects(generate({ownerId:"t",sourceQuestions:[q],context:{},existing:[]}));
});

test("three bounded source batches cover questions beyond40 without sending private or media fields",async()=>{
 const sources=Array.from({length:100},(_,i)=>({id:`q${i}`,type:'number',text:`${i}+2?`,numericAnswer:i+2,ownerPrivateMeta:'hidden',imageDataUrl:'private-bytes'})),seen=new Set();let n=0;
 const generate=createBatchGenerator({consumeQuota:async()=>{},recordUsage:async()=>{},structuredResponse:async request=>{n++;if(n%2===0)return{data:{issues:[]}};const wire=JSON.parse(request.userPrompt);assert.equal(wire.sources.length<=40,true);assert.equal(request.userPrompt.includes('private-bytes'),false);assert.equal(request.userPrompt.includes('ownerPrivateMeta'),false);wire.sources.forEach(q=>seen.add(q.id));return{data:{variants:Array.from({length:12},(_,i)=>({sourceId:wire.sources[i%wire.sources.length].id,question:{type:'number',text:`Batch${n} Beispiel${i}?`,numericAnswer:i},learning:{objective:'Gleiches Lernziel',explanation:'Erklärung',hint:'Hinweis',workedExample:'Beispiel'}}))}};}});
 for(let batchIndex=0;batchIndex<3;batchIndex++)await generate({ownerId:'t',sourceQuestions:sources,context:{},existing:[],batchIndex});
 assert.equal(seen.size,100);
});
