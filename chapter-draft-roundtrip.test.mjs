import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {chapterFields,copyChapterFields} from './chapter-editor.mjs';
const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
test('real question serializer preserves chapter assignment without leaking author scripts',()=>{
 const c={Math,Number,String,chapterFields,round1:n=>Math.round(n*2)/2,getQuestionAudioSrc:()=>'',questionAudioReady:()=>true,questionAnswerAudioEntries:()=>[],questionHasAudioAnswerEntries:()=>false};vm.createContext(c);
 vm.runInContext(source.slice(source.indexOf('function sanitizeQuestionForSave('),source.indexOf('\nasync function saveCurrentQuiz(')),c);
 const saved=c.sanitizeQuestionForSave({id:'q',chapterId:'ch_one',type:'number',text:'Count',points:2,numericAnswer:5,audioScript:'private'});
 assert.equal(saved.chapterId,'ch_one');assert.equal(saved.audioScript,undefined);
});
test('real editor snapshot and copies preserve chapter plan and remap IDs',()=>{
 const quiz={id:'T',chapterSchemaVersion:1,chapters:[{id:'ch_one',title:'Zahlen',position:1}],chapterPlan:[{chapterId:'ch_one',topic:'Zahlen',count:1,points:2,materialIds:[]}]};
 const c={state:{user:{uid:'u'},currentQuiz:quiz,questions:[{id:'q',chapterId:'ch_one',points:2}]},chapterFields,draftKey:()=> 'u:T',$:()=>({value:'',checked:false}),getQuizScale:()=>({}),getScaleById:()=>({}),deepClone:structuredClone,Date};vm.createContext(c);
 vm.runInContext(source.slice(source.indexOf('function editorDraftSnapshot('),source.indexOf('\nasync function persistEditorDraft(')),c);
 const d=c.editorDraftSnapshot();assert.equal(d.quiz.chapters[0].id,'ch_one');assert.equal(d.questions[0].chapterId,'ch_one');
 const copy=copyChapterFields(quiz,d.questions,()=> 'ch_new');assert.equal(copy.quiz.chapters[0].id,'ch_new');assert.equal(copy.questions[0].chapterId,'ch_new');assert.equal(copy.quiz.chapterPlan[0].chapterId,'ch_new');
});
