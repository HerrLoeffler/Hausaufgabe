const test=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
test('chapter navigation and progress leave existing answers and audio nodes intact',async()=>{
 const {mountChapterStudent}=await import('../../chapter-student.mjs');const dom=new JSDOM('<div id="questions"><section class="secureQuestion" data-qid="q1"><input value="0"><audio></audio></section><section class="secureQuestion" data-qid="q2"><input value=""></section></div>');const root=dom.window.document.querySelector('#questions');const input=root.querySelector('input'),audio=root.querySelector('audio');let jumped;
 const c=mountChapterStudent({root,paper:[{id:'q1',chapterId:'ch_a'},{id:'q2',chapterId:'ch_b'}],chapters:[{id:'ch_a',title:'Zahlen'},{id:'ch_b',title:'Anwenden'}],getAnswers:()=>({q1:0}),isComplete:(q,v)=>String(v??'').length>0,goToQuestion:id=>{jumped=id;}});
 c.renderProgress();assert.equal(root.querySelectorAll('.secureChapterHeading').length,2);assert.equal(root.querySelector('[data-qid="q1"]').dataset.answered,'true');assert.match(root.querySelector('.secureChapterHeading').textContent,/1 von 1/);
 assert.equal(root.querySelector('input'),input);assert.equal(root.querySelector('audio'),audio);c.destroy();assert.equal(root.querySelector('input').value,'0');assert.equal(jumped,undefined);dom.window.close();
});
