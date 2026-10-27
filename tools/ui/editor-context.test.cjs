const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../../app.js'),'utf8');
function fn(name,next){const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,`${name} exists`);return source.slice(source[start-6] === 'a'?start-6:start,source.indexOf(`\n${next}`,start));}
function harness(extra={}) {const c={state:{currentQuiz:{id:'quiz'},questions:[]},deepClone:v=>structuredClone(v),renderQuestions(){},markDirty(){},focusEditorQuestion(){},toast(){},QUESTION_TYPES:[['single','Single Choice'],['gapfill','Lückentext']],...extra};vm.createContext(c);return c;}
test('type conversion uses AI and returning restores the original answers without another call',async()=>{
 const q={id:'q1',type:'single',text:'Which word is a noun?',options:[{text:'cat',correct:true},{text:'run',correct:false}],points:2};
 let calls=0;const c=harness({regenerateQuestionWithAi:async(old,index,opts)=>{calls++;assert.equal(opts.targetType,'gapfill');const n={id:old.id,type:'gapfill',text:'A cat is a {{noun}}.',points:2};c.state.questions[index]=n;return n;}});c.state.questions=[q];
 vm.runInContext(fn('changeQuestionType','async function regenerateQuestionWithAi'),c);
 await c.changeQuestionType(q,0,'gapfill');assert.equal(c.state.questions[0].type,'gapfill');
 await c.changeQuestionType(c.state.questions[0],0,'single');assert.equal(calls,1);assert.deepEqual(c.state.questions[0].options,q.options);assert.equal(c.state.questions[0].text,q.text);
});
test('failed AI conversion keeps the original question and answers intact',async()=>{
 const q={id:'q1',type:'single',text:'Original',options:[{text:'cat',correct:true}]};const c=harness({regenerateQuestionWithAi:async()=>undefined});c.state.questions=[q];vm.runInContext(fn('changeQuestionType','async function regenerateQuestionWithAi'),c);await c.changeQuestionType(q,0,'gapfill');assert.equal(c.state.questions[0],q);assert.equal(q.type,'single');assert.equal(q._typeChanging,undefined);
});
test('repairing one answer calls TTS once and preserves the other clips',async()=>{
 const q={id:'q1',type:'single',text:'Question',audioAnswerMode:'audio-only',options:[{text:'cat',audioDataUrl:'old-cat'},{text:'dog',audioDataUrl:'old-dog'}]};let calls=[];const operations=new WeakMap();const c=harness({questionAnswerAudioEntries:q=>q.options.map((o,i)=>({key:`o${i}`,sourceText:o.text,asset:o})),questionHasAudioAnswerEntries:()=>true,audioOperations:()=>operations,renderQuestionAudioEditor(){},verifyGeneratedAudio:async()=>{},aiApi:{generateQuestionAudio:async args=>{calls.push(args);return {asset:{audioDataUrl:'data:audio/mpeg;base64,new'}};}},showReportableError:e=>{throw e.error;}});c.state.questions=[q];vm.runInContext(fn('answerAudioRepairState','async function reportMissingAnswerAudio'),c);vm.runInContext(fn('generateAiAnswerAudioForQuestion','async function generateAiSolutionAudioForQuestion'),c);
 await c.generateAiAnswerAudioForQuestion(q,{querySelector:()=>null},'o0','Bitte langsamer sprechen.');assert.equal(calls.length,1);assert.equal(calls[0].script,'cat');assert.equal(calls[0].feedback,'Bitte langsamer sprechen.');assert.equal(q.options[1].audioDataUrl,'old-dog');assert.equal(q.options[0].audioNeedsRegeneration,false);
});
test('decoded short speech is accepted but silent audio is rejected',async()=>{
 const c=harness({window:{},atob:v=>Buffer.from(v,'base64').toString('binary'),Uint8Array});vm.runInContext(fn('verifyGeneratedAudio','async function generateAiAnswerAudioForQuestion'),c);
 const decoder=samples=>class{async decodeAudioData(){return {duration:0.24,numberOfChannels:1,getChannelData:()=>samples};}async close(){}};
 c.window.AudioContext=decoder(new Float32Array([0,0.1,-0.2]));await c.verifyGeneratedAudio('data:audio/mpeg;base64,AAAA');
 c.window.AudioContext=decoder(new Float32Array(100));await assert.rejects(c.verifyGeneratedAudio('data:audio/mpeg;base64,AAAA'),/stumm|leer/);
});
test('outline stays navigation while locked and swaps selected tasks only after unlocking',()=>{
 const {JSDOM}=require('jsdom');const dom=new JSDOM('<button id="questionOrderLock"></button><div id="questionOrderHint"></div><nav id="questionOutline"></nav>');let navigated=0;
 const c=harness({$:id=>dom.window.document.getElementById(id),activeQualityIssue:()=>null,scrollToQualityIssue:()=>navigated++});c.state.questions=[{id:'a'},{id:'b'},{id:'c'}];vm.runInContext(fn('renderQuestionOutline','function scrollToQualityIssue'),c);
 c.renderQuestions=()=>c.renderQuestionOutline();c.renderQuestionOutline();dom.window.document.querySelector('[data-position="1"]').click();assert.equal(navigated,1);assert.equal(c.state.questions[0].id,'a');
 dom.window.document.getElementById('questionOrderLock').click();dom.window.document.querySelector('[data-position="1"]').click();dom.window.document.querySelector('[data-position="2"]').click();assert.deepEqual(c.state.questions.map(q=>q.id),['b','a','c']);assert.equal(navigated,1);
 c.state.currentQuiz={id:'other'};c.renderQuestionOutline();assert.equal(dom.window.document.getElementById('questionOrderLock').getAttribute('aria-pressed'),'false');dom.window.close();
});
test('non-tutorial variant reaches the API with allowed types',async()=>{
 let calls=0;const c=harness({REPORTABLE_ERROR_CODES:{aiVariant:'test'},tourUid:()=> 'teacher',questionForAi:q=>q,questionContext:()=>({existingQuestions:[]}),renderVariantProgress(){},crewTour:null,guestTourRepo:null,doc:()=>({id:'new'}),collection(){},db:{},normalizeImportedQuestion:q=>({...q}),aiFriendlyError:e=>e.message,showReportableError:e=>{throw e.error;},aiApi:{regenerateQuestion:async args=>{calls++;assert.ok(args.allowedTypes.includes('single'));return {question:{type:'single',text:'New',mediaIntent:{kind:'none'}}};}}});const q={id:'q1',type:'single',text:'Old'};c.state.questions=[q];vm.runInContext(fn('createQuestionVariants','// Optional queue'),c);await c.createQuestionVariants(q,{count:1,mediaKind:'none'});assert.equal(calls,1);assert.equal(c.state.variantTask.questions.length,1);
});
test('audio retry controls are rendered after clearing the pending operation, including failure',async()=>{
 for(const fail of [false,true]){const operations=new WeakMap();let lastBusy;const q={id:'q1',type:'single',audioAnswerMode:'audio-only',options:[{text:'cat',audioDataUrl:'old'}]};const c=harness({questionAnswerAudioEntries:q=>q.options.map((o,i)=>({key:`o${i}`,sourceText:o.text,asset:o})),questionHasAudioAnswerEntries:()=>true,audioOperations:()=>operations,renderQuestionAudioEditor(){lastBusy=operations.has(q);},verifyGeneratedAudio:async()=>{if(fail)throw new Error('silent');},aiFriendlyError:e=>e.message,REPORTABLE_ERROR_CODES:{aiEdit:'test'},showReportableError(){},aiApi:{generateQuestionAudio:async()=>({asset:{audioDataUrl:'data:audio/mpeg;base64,new'}})}});c.state.questions=[q];vm.runInContext(fn('answerAudioRepairState','async function reportMissingAnswerAudio'),c);vm.runInContext(fn('generateAiAnswerAudioForQuestion','async function generateAiSolutionAudioForQuestion'),c);await c.generateAiAnswerAudioForQuestion(q,{querySelector:()=>null},'o0');assert.equal(lastBusy,false);}
});

// Uploaded material limits use the existing creation editor and request.
{
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
function fn(name){let start=app.indexOf('function '+name+'(');
if(app.slice(start-6,start)==='async ')start-=6;
return app.slice(start,app.indexOf('\n}',start)+2);
}
function setup(t,existing=0){const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{runScripts:'outside-only',url:'https://hausaufgabe-staging.web.app'});
t.after(()=>dom.window.close());
const w=dom.window;
w.$=id=>w.document.getElementById(id);
w.state={aiMaterials:Array.from({length:existing},(_,i)=>({id:'old'+i,storagePath:'aiUploads/teacher/old'+i,mimeType:'image/png',name:'old'}))};
w.calls=[];
w.messages=[];
w.toast=(message)=>w.messages.push(message);
w.setAiProgress=()=>{};
w.renderAiMaterials=()=>{};
w.aiFriendlyError=e=>e.message;
w.aiApi={uploadMaterial:async f=>{w.calls.push(f.name);
return {id:f.name,storagePath:'aiUploads/teacher/'+f.name,mimeType:f.type,name:f.name};
}};
w.$('aiMaterialConfirmed').checked=true;
w.eval(fn('updateAiCreationSummary'));
w.eval(fn('handleAiMaterialFiles'));
w.eval(fn('collectAiRequest'));
return w;
}
const files=n=>Array.from({length:n},(_,i)=>({name:'fixture'+i,type:'image/png',size:1}));
test('ten uploaded images reach the serialized creation request and generated-image and audio caps stay five',async t=>{const w=setup(t);
await w.handleAiMaterialFiles({target:{files:files(10),value:'fixture'}});
assert.equal(w.calls.length,10);
w.$('aiTopic').value='Fixture';
w.$('aiCount').value='10';
w.$('aiPoints').value='20';
w.$('aiTypeChecks').innerHTML='<input type="checkbox" value="single" checked>';
const request=w.collectAiRequest();
assert.equal(JSON.parse(JSON.stringify(request)).materials.length,10);
assert.equal(w.$('aiImageQuestionCount').max,'5');
assert.equal(request.imageQuestionCount,0);
assert.equal(w.$('aiAudioQuestionCount').max,'5');
assert.equal(w.$('aiAudioAnswerQuestionCount').max,'5');
w.$('aiImageQuestionCount').value='6';
assert.throws(()=>w.collectAiRequest(),/0 bis 5/);
});
test('eleventh uploaded material is blocked, including after nine existing files',async t=>{for(const [existing,n]of[[0,11],[9,2]]){const w=setup(t,existing);
await w.handleAiMaterialFiles({target:{files:files(n),value:'fixture'}});
assert.equal(w.state.aiMaterials.length,10);
assert.equal(w.calls.length,10-existing);
assert.equal(w.messages.length,1);
assert.match(w.messages[0],/zehn|10/);
}});

}
