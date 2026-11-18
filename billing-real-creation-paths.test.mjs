import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
const source=fs.readFileSync(process.env.BILLING_REVIEW_SOURCE||new URL('./app.js',import.meta.url),'utf8');
test('the real copy, shared-template and JSON import handlers send complete counted bundles with stable operation keys',async()=>{
 for(const[name,kind]of[['duplicateQuiz','copy'],['importSharedTemplate','copy'],['importAiJson','import']]){
  const start=source.indexOf('async function '+name+'('),end=source.indexOf('\n}\n',start)+2,captured=[];
  const quiz={id:'SOURCE01',title:'Synthetic',subject:'Mathe',grade:'7'},questions=[{id:'q1',text:'One',type:'number',points:1,numericAnswer:1}];
  const c=vm.createContext({BILLING_PREVIEW_ENABLED:true,state:{user:{uid:'teacher'},quizzes:[quiz],currentSharedTemplate:{quiz,questions}},$ :()=>({value:'{}',disabled:false,textContent:''}),
   createQuizDocument:async(...args)=>{captured.push(args);throw Error('Stop after actual dispatch');},
   getDocs:async()=>({docs:questions.map(q=>({id:q.id,data:()=>q}))}),query:x=>x,collection:()=>({}),orderBy:()=>({}),db:{},aiApi:{getQuestionAudioDrafts:async()=>({})},
   deepClone:obj=>JSON.parse(JSON.stringify(obj)),round1:n=>Math.round(n*10)/10,getSettings:()=>({}),getQuizScale:()=>({thresholds:[]}),getScaleById:()=>({thresholds:[]}),getQuestionAudioSrc:()=>'',questionAllAudioReady:()=>true,questionAudioReady:()=>true,questionAnswerAudioReady:()=>true,
   quizDefaults:()=>({title:'Synthetic'}),parseJsonWithRepair:()=>({ok:true,data:{}}),normalizeImportedPayload:()=>({ok:true,meta:quiz,questions,report:{warnings:[],repairs:[]}}),clearAiImportHelp(){},toast(){},console:{error(){}}
  });vm.runInContext(source.slice(start,end),c);await c[name](quiz.id);
  assert.equal(captured.length,1,name+' reaches the actual create boundary');assert.equal(captured[0][1]?.kind,kind,name+' records correct origin');assert.ok(captured[0][1].operationKey);assert.equal(captured[0][1].questions.length,1);
 }
});
