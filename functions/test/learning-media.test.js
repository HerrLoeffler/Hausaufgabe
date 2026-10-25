'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createLearningMedia}=require('../lib/learning-brain/media');
test('listening uses only the authenticated saved task, caches speech and never returns its script',async()=>{
 const sessions={a:{id:'a',revision:2,deadline:10000,task:{id:'t',media:{kind:'listen',script:'Am Morgen fährt Mia mit dem Bus zur Schule.'}}}};
 const cache=new Map();let paid=0;
 const media=createLearningMedia({now:()=>100,load:async uid=>uid==='own'?{sessions}:null,read:async k=>cache.get(k),save:async(k,v)=>cache.set(k,v),synthesize:async({script})=>{assert.match(script,/Morgen/);paid++;return {audioDataUrl:'data:audio/mpeg;base64,'+'A'.repeat(200),audioAiGenerated:true};}});
 const input={sessionId:'a',taskId:'t',revision:2};
 const result=await media.audio('own',input);assert.equal(result.audioAiGenerated,true);assert.ok(!JSON.stringify(result).includes('Morgen'));
 await media.audio('own',input);assert.equal(paid,1);
 await assert.rejects(media.audio('foreign',input),/gespeicherten/);
 await assert.rejects(media.audio('own',{...input,revision:1}),/geändert/);
 await assert.rejects(media.audio('own',{...input,script:'client injection',taskId:'foreign'}),/Höraufgabe/);
});
test('expired or pending tasks cannot trigger paid speech',async()=>{
 let paid=0;const s={revision:1,deadline:50,task:{id:'t',media:{kind:'listen',script:'Ein kurzer Hörtext.'}}};
 const media=createLearningMedia({now:()=>100,load:async()=>({sessions:{a:s}}),read:async()=>null,save:async()=>{},synthesize:async()=>paid++});
 await assert.rejects(media.audio('own',{sessionId:'a',taskId:'t',revision:1}),/beendet/);assert.equal(paid,0);
});
