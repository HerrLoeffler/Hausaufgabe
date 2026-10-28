import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{quizForGeneratedTest}=require('./functions/lib/ai-job');
test('new manual and generated tests use self-start and shuffled answers without shuffling questions',()=>{
 const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');const start=source.indexOf('function quizDefaults()'),end=source.indexOf('\nasync function createQuizDocument',start);
 const c={getSettings:()=>({}),getScaleById:()=>({id:'standard'}),window:{},deepClone:x=>JSON.parse(JSON.stringify(x)),tourUid:()=> 'fixture'};vm.createContext(c);vm.runInContext(source.slice(start,end),c);
 for(const q of [c.quizDefaults(),quizForGeneratedTest({title:'Test'},{})]){assert.equal(q.startMode,'student');assert.equal(q.shuffleAnswers,true);assert.equal(q.shuffleQuestions,false);assert.equal(q.timeLimitMinutes,null);}
 for(const shuffleAnswers of [false,true]){const q=quizForGeneratedTest({title:'Test'},{},{},{startMode:'teacher',shuffleAnswers,shuffleQuestions:true});assert.equal(q.shuffleAnswers,shuffleAnswers);assert.equal(q.startMode,'teacher');assert.equal(q.shuffleQuestions,true);}
 const legacy=quizForGeneratedTest({title:'Test'},{generationMode:'variant',variantQuizSettings:{}});assert.equal(legacy.shuffleAnswers,false);
});
