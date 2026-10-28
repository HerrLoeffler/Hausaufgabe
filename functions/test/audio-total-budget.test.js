"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const contracts=require('../lib/creation-contract'),constants=require('../lib/constants'),{HttpsError}=require('firebase-functions/v2/https');
const source=fs.readFileSync(require.resolve('../index.js'),'utf8');
const c=vm.createContext({...contracts,...constants,HttpsError,cleanSourceTest:()=>null});vm.runInContext(source.slice(source.indexOf('function cleanInput('),source.indexOf('\nasync function structuredResponse(')),c);
const request=(a,b,f,n=20)=>({topic:'Fixture',count:n,points:n,allowedTypes:['single'],imageQuestionCount:Math.min(5,n),audioQuestionCount:a+f,audioAnswerQuestionCount:b+f,fullAudioQuestionCount:f,creationContractVersion:1,audioPresentationPolicy:'visible-plus-full'});
test('three exclusive audio categories share five tasks; combined counts once, images remain separate',()=>{for(const [a,b,f]of [[2,3,0],[5,0,0],[0,5,0]])assert.doesNotThrow(()=>c.cleanInput(request(a,b,f)));for(const [a,b,f,n]of [[5,5,0,20],[3,3,0,20],[2,1,0,2]])assert.throws(()=>c.cleanInput(request(a,b,f,n)),/Zusammen sind maximal.*Audioaufgaben/);});
test('batch planning and final validation enforce the same audio budget',()=>{assert.throws(()=>contracts.creationAudioPlan(request(3,3,0)),/Zusammen sind maximal/);assert.ok(contracts.creationAudioErrors({questions:[]},{...request(3,3,0),expectedCount:20}).some(e=>/Zusammen sind maximal/.test(e)));});
test('invalid request is rejected before quota, provider, material or storage work',async()=>{let paid=0;Object.assign(c,{randomUUID:()=> 'fixture',console:{info(){},warn(){}},consumeQuota:async()=>{paid++},sanitizeMaterials:()=>{throw Error('Must reject earlier')}});vm.runInContext(source.slice(source.indexOf('async function generateTestForUser('),source.indexOf('\nexports.generateTest =')),c);await assert.rejects(c.generateTestForUser('fixture',request(3,3,0)),/Zusammen sind maximal/);assert.equal(paid,0);});

test("new combined requests are blocked while existing full-audio validation remains supported",()=>{assert.throws(()=>c.cleanInput(request(0,0,1)),/Kombimodus/);assert.doesNotThrow(()=>contracts.creationAudioPlan(request(0,0,1)));});
test("automatic points normalize without a target and legacy requests keep fixed points",()=>{
 const base=request(0,0,0);
 const automatic=c.cleanInput({...base,pointsMode:"auto",points:undefined});
 assert.equal(automatic.pointsMode,"auto");assert.equal(Object.hasOwn(automatic,"points"),false);
 assert.equal(c.cleanInput(automatic).pointsMode,"auto");
 assert.equal(c.cleanInput(base).points,base.points);
 assert.throws(()=>c.cleanInput({...base,pointsMode:"auto"}),/keine Gesamtpunktzahl/);
 assert.throws(()=>c.cleanInput({...base,pointsMode:"unknown"}),/Punktemodus/);
 assert.throws(()=>c.cleanInput({...base,pointsMode:"auto",points:undefined,generationMode:"variant"}),/Punktemodus/);
});
test('five answer-audio questions may require twenty TTS tracks with four options each',async()=>{let tracks=0;const {generateAnswerAudios}=require('../lib/audio-answers');for(let i=0;i<5;i++)await generateAnswerAudios({id:`fixture${i}`,type:'single',options:[0,1,2,3].map(j=>({text:`Choice ${i}-${j}`}))},async()=>{tracks++;return{audioDataUrl:'data:audio/mpeg;base64,QUJD'}});assert.equal(tracks,20);});
test('Remy rejects raw fractional, negative, clamped or combined context before provider work',()=>{const {cleanCrewRequest}=require('../lib/crew-assistant');for(const aiForm of [{count:20,audioQuestionCount:5.5,audioAnswerQuestionCount:1},{fullAudioQuestionCount:-1},{fullAudioQuestionCount:1},{audioQuestionCount:6}])assert.throws(()=>cleanCrewRequest({crewId:'remy',text:'Fixture',context:{aiForm}}),/Audio|Kombimodus/);assert.throws(()=>cleanCrewRequest({crewId:'remy',text:'Fixture',context:{aiForm:{count:20,audioQuestionCount:5,audioAnswerQuestionCount:5}}}),/Zusammen sind maximal 5/);});
