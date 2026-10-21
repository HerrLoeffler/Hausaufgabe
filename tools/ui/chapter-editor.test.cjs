const test=require('node:test');const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
test('editor enables assigns reorders and disables without losing content',async()=>{
 const {mountChapterEditor}=await import('../../chapter-editor.mjs');
 const dom=new JSDOM('<div id="root"></div>');let state={quiz:{},questions:[{id:'a',text:'Keep me',points:2,position:1}]};
 const controller=mountChapterEditor({root:dom.window.document.getElementById('root'),getState:()=>state,onChange:({quizPatch,questions})=>{state={quiz:quizPatch,questions};controller.render();},confirm:()=>true});
 controller.render();dom.window.document.querySelector('[data-chapter-toggle]').click();
 assert.equal(state.quiz.chapterSchemaVersion,1);const first=state.quiz.chapters[0].id;assert.equal(state.questions[0].chapterId,first);
 dom.window.document.querySelector('[data-chapter-add]').click();assert.equal(state.quiz.chapters.length,2);
 const input=dom.window.document.querySelector('[data-chapter-title]');input.value='Brüche';input.dispatchEvent(new dom.window.Event('change'));
 assert.equal(state.quiz.chapters[0].title,'Brüche');assert.equal(state.quiz.chapters[0].id,first);
 dom.window.document.querySelector('[data-chapter-down]').click();assert.equal(state.quiz.chapters[1].id,first);
 dom.window.document.querySelector('[data-chapter-toggle]').click();assert.equal(state.quiz.chapterSchemaVersion,undefined);assert.equal(state.questions[0].chapterId,undefined);assert.equal(state.questions[0].text,'Keep me');
 dom.window.close();
});
test('locked published structure is not editable',async()=>{
 const {mountChapterEditor}=await import('../../chapter-editor.mjs');const dom=new JSDOM('<div></div>');
 const c=mountChapterEditor({root:dom.window.document.querySelector('div'),getState:()=>({quiz:{published:true,ended:false},questions:[]}),onChange:()=>{throw Error('must not change');}});c.render();assert.equal(dom.window.document.querySelector('input').disabled,true);dom.window.close();
});

test('existing Remy form derives totals from optional chapter rows and resets for a new test',async()=>{
 const {mountChapterCreation}=await import('../../chapter-creation.mjs');const dom=new JSDOM('<div id="root"></div><input id="count" value="3"><input id="points" value="8">');const d=dom.window.document;
 const c=mountChapterCreation({root:d.getElementById('root'),counts:d.getElementById('count'),points:d.getElementById('points')});d.querySelector('[data-creation-chapters]').click();
 const topic=d.querySelector('[aria-label="Thema Kapitel 1"]');topic.value='Brüche';topic.dispatchEvent(new dom.window.Event('input'));assert.equal(c.getPlan().chapterPlan[0].points,8);assert.equal(d.getElementById('count').readOnly,true);
 c.reset();assert.deepEqual(c.getPlan(),{});assert.equal(d.getElementById('count').readOnly,false);dom.window.close();
});
