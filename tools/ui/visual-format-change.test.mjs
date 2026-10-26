import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const {JSDOM}=require('jsdom');
const load=()=>import('../../visual-format-choice.mjs');
test('format dialog asks before generation, supports eight formats and returns optional content wish',async()=>{
 const {chooseVisualFormat,ACTIVE_VISUAL_FORMATS}=await load();
 const dom=new JSDOM('<button id="before">Typ</button>');const d=dom.window.document;
 d.getElementById('before').focus();
 const result=chooseVisualFormat({document:d,initialFormat:'grid'});
 const dialog=d.querySelector('dialog');assert.ok(dialog);assert.ok(dialog.getAttribute('aria-labelledby'));
 assert.deepEqual([...ACTIVE_VISUAL_FORMATS],['hotspot','labeling','scale','angle','grid','connections','coordinate','table']);
 assert.equal(dialog.querySelector('select').value,'grid');
 dialog.querySelector('select').value='table';dialog.querySelector('textarea').value='Rabatte vergleichen';
 dialog.querySelector('form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));
 assert.deepEqual(await result,{format:'table',wish:'Rabatte vergleichen'});assert.equal(d.querySelector('dialog'),null);
 assert.equal(d.activeElement.id,'before');dom.window.close();
});
test('escape and cancel dismiss without selecting a format',async()=>{
 const {chooseVisualFormat}=await load();
 for(const action of ['cancel','button']){const dom=new JSDOM('');const p=chooseVisualFormat({document:dom.window.document});const dialog=dom.window.document.querySelector('dialog');
 if(action==='cancel')dialog.dispatchEvent(new dom.window.Event('cancel',{cancelable:true}));else dialog.querySelector('[data-cancel]').click();
 assert.equal(await p,null);assert.equal(dom.window.document.querySelector('dialog'),null);dom.window.close();}
});
const app=readFileSync(new URL('../../app.js',import.meta.url),'utf8');
function extract(name){const start=app.indexOf('async function '+name+'(');assert.ok(start>=0);return app.slice(start,app.indexOf('\n}',start)+2);}
function harness({choice={format:'grid',wish:'25 Prozent'},generate}={}){
 const q={id:'q1',type:'single',text:'25 Prozent von 200?',points:3,_typeVersions:{visual:{type:'visual',text:'Alte Vorlage'}}};
 const state={currentQuiz:{id:'quiz'},questions:[q]};let calls=0;const c={state,deepClone:v=>structuredClone(v),visualConversions:new WeakSet(),tourUid:()=> 'teacher',questionReviewKey:q=>JSON.stringify(q),chooseVisualFormat:async()=>choice,regenerateQuestionWithAi:async(q,i,o)=>{calls++;return generate?.(q,i,o);},renderQuestions(){},markDirty(){},toast(){},console};vm.createContext(c);vm.runInContext(extract('requestVisualFormatChange'),c);return {c,q,state,calls:()=>calls};
}
test('cancel and failed conversion leave original question byte for byte despite cached visual version',async()=>{
 for(const choice of [null,{format:'table',wish:''}]){const h=harness({choice});const before=JSON.stringify(h.q);await h.c.requestVisualFormatChange(h.q,0);assert.equal(JSON.stringify(h.q),before);assert.equal(h.state.questions[0],h.q);assert.equal(h.calls(),choice?1:0);}
});
test('conversion forwards format and content wish through actual regeneration path and blocks duplicate work',async()=>{
 let release;let options;const h=harness({generate:async(q,i,o)=>{options=o;await new Promise(r=>release=r);}});
 const first=h.c.requestVisualFormatChange(h.q,0);await Promise.resolve();await h.c.requestVisualFormatChange(h.q,0);assert.equal(h.calls(),1);assert.equal(options.targetType,'visual');assert.equal(options.expectedVisualFormat,'grid');assert.match(options.instruction,/25 Prozent/);release();await first;
});
test('editing or leaving the quiz while choosing a format prevents a stale paid request',async()=>{
 for(const mutate of [h=>h.q.text='Changed',h=>h.state.currentQuiz={id:'other'},h=>h.state.questions=[{...h.q}]]){const h=harness();let accept;h.c.chooseVisualFormat=()=>new Promise(r=>accept=r);const p=h.c.requestVisualFormatChange(h.q,0);mutate(h);accept({format:'table',wish:''});await p;assert.equal(h.calls(),0);}
});
test('visual editor subtype change never replaces original content with a template',async()=>{
 const {renderVisualEditor}=await import('../../visual-tasks.mjs');const dom=new JSDOM('<div id="editor"></div>');
 const previousDocument=globalThis.document;const previousCore=globalThis.GC2;const previousRenderer=globalThis.GCRenderer;
 globalThis.document=dom.window.document;
 const realCore=require('../../visual/core.js');const task=realCore.example('grid');task.prompt='25 Prozent darstellen';
 globalThis.GC2={...realCore,example:()=>{throw new Error('templates forbidden');}};
 globalThis.GCRenderer={mount:()=>({destroy(){}})};
 try{const q={id:'q',type:'visual',text:task.prompt,points:3,visualTask:JSON.stringify(task)};const before=JSON.stringify(q);let chosen;
 renderVisualEditor(globalThis.document.getElementById('editor'),q,()=>{throw new Error('local change forbidden');},{onFormatChange:async format=>{chosen=format;}});
 const select=globalThis.document.querySelector('select');select.value='table';select.dispatchEvent(new dom.window.Event('change'));await Promise.resolve();
 assert.equal(chosen,'table');assert.equal(JSON.stringify(q),before);assert.equal(select.value,'grid');
 }finally{globalThis.document=previousDocument;globalThis.GC2=previousCore;globalThis.GCRenderer=previousRenderer;dom.window.close();}
});
function regenerationHarness(response){
 const h=harness();let payload;const c=h.c;
 Object.assign(c,{editorQuestionIndex:(s,t)=>s.questions.findIndex(q=>q.id===t.questionId&&JSON.stringify(q)===t.reviewKey),deepClone:v=>structuredClone(v),document:{querySelector:()=>null},CSS:{escape:s=>s},aiApi:{regenerateQuestion:async p=>{payload=p;return response;}},questionForAi:q=>q,questionContext:()=>({}),QUESTION_TYPES:[['single','Single'],['visual','Visuell']],normalizeImportedQuestion:q=>structuredClone(q),normalizeVisualTask:q=>{const t=JSON.parse(q.visualTask);t.maxPoints=q.points;return JSON.stringify(t);},resolveQualityIssues(){},getQuestionAudioSrc:()=>'',aiFriendlyError:e=>e.message,REPORTABLE_ERROR_CODES:{aiEdit:'edit'},showReportableError(){},console:{error(){}}});
 vm.runInContext(extract('regenerateQuestionWithAi'),c);return {...h,payload:()=>payload};
}
test('AI revision sends constrained format, keeps points and ignores cached visual content',async()=>{
 const response={question:{type:'visual',text:'Rabatte',points:8,visualTask:JSON.stringify({format:'table',maxPoints:8})}};const h=regenerationHarness(response);
 await h.c.regenerateQuestionWithAi(h.q,0,{targetType:'visual',expectedVisualFormat:'table',instruction:'Rabatte'});
 assert.deepEqual([...h.payload().allowedVisualFormats],['table']);assert.equal(h.state.questions.length,1);assert.equal(h.state.questions[0].points,3);assert.equal(JSON.parse(h.state.questions[0].visualTask).maxPoints,3);assert.equal(h.state.questions[0].text,'Rabatte');
});
test('AI returning a different subtype cannot overwrite original question',async()=>{
 const h=regenerationHarness({question:{type:'visual',text:'Wrong',visualTask:JSON.stringify({format:'grid'})}});const before=JSON.stringify(h.q);
 await h.c.regenerateQuestionWithAi(h.q,0,{targetType:'visual',expectedVisualFormat:'table',instruction:'Rabatte'});assert.equal(h.state.questions[0],h.q);assert.equal(JSON.stringify(h.q),before);
});
test('AI response arriving after question edit is ignored',async()=>{
 const h=regenerationHarness(null);let release;h.c.aiApi.regenerateQuestion=()=>new Promise(r=>release=r);
 const p=h.c.regenerateQuestionWithAi(h.q,0,{targetType:'visual',expectedVisualFormat:'table',instruction:'Rabatte'});h.q.text='New teacher edit';release({question:{type:'visual',text:'Stale',visualTask:JSON.stringify({format:'table'})}});await p;assert.equal(h.state.questions[0],h.q);assert.equal(h.q.text,'New teacher edit');
});
test('single to visual to single restores latest teacher text and answers without another AI call',async()=>{
 for(const withOldCache of [false,true]){
  const h=regenerationHarness({question:{type:'visual',text:'Visualisierte Prozente',points:3,visualTask:JSON.stringify({format:'grid',maxPoints:3})}});
  h.q.text='Neueste Frage: 25 Prozent von 200?';h.q.options=[{text:'50',correct:true},{text:'25',correct:false}];
  if(withOldCache)h.q._typeVersions.single={id:'q1',type:'single',text:'Veraltete Frage',options:[{text:'veraltete Antwort',correct:true}],points:1};
  h.q._aiUndo={text:'Older undo'};const before=JSON.stringify(h.q);const latestOptions=structuredClone(h.q.options);let paidCalls=0;
  const regenerate=h.c.regenerateQuestionWithAi;h.c.regenerateQuestionWithAi=async(...args)=>{paidCalls++;return regenerate(...args);};h.c.focusEditorQuestion=()=>{};
  vm.runInContext(extract('changeQuestionType'),h.c);
  await h.c.requestVisualFormatChange(h.q,0);
  assert.equal(h.state.questions[0].type,'visual');
  assert.equal(JSON.stringify(h.q),before,'successful conversion must not mutate source question');
  await h.c.changeQuestionType(h.state.questions[0],0,'single');
  assert.equal(paidCalls,1,'returning restores saved current version without AI');
  assert.equal(h.state.questions[0].text,h.q.text);assert.deepEqual(h.state.questions[0].options,latestOptions);
  assert.equal(h.state.questions[0]._typeVersions.single._aiUndo,undefined);
 }
});
test('stale AI response leaves existing type cache unchanged',async()=>{
 const h=regenerationHarness(null);h.q._typeVersions.single={text:'Previous snapshot'};let release;h.c.aiApi.regenerateQuestion=()=>new Promise(r=>release=r);
 const pending=h.c.requestVisualFormatChange(h.q,0);await new Promise(setImmediate);h.q.text='Edited while AI runs';const before=JSON.stringify(h.q);
 release({question:{type:'visual',text:'Stale',visualTask:JSON.stringify({format:'grid'})}});await pending;
 assert.equal(h.state.questions[0],h.q);assert.equal(JSON.stringify(h.q),before);
});
