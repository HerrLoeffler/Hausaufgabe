const test=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
test('results reached from LIVE return to that monitor instead of the dashboard; normal results keep normal back',async t=>{
 const dom=new JSDOM('<section id="resultsView"><button id="backFromResults">Zurück</button><section id="reviewPanel" class="reviewPanel hidden"></section></section>');t.after(()=>dom.window.close());const {installLiveResultsReturn}=await import('../../classroom/workspace-controls.mjs');let context={uid:'t',assignmentId:'round'},live=0,legacy=0;
 installLiveResultsReturn({doc:dom.window.document,getContext:()=>context,getAccountId:()=> 't',onReturn:c=>{assert.equal(c.assignmentId,'round');live++;}});
 dom.window.document.querySelector('button').addEventListener('click',()=>legacy++);dom.window.document.querySelector('button').click();assert.equal(live,1);assert.equal(legacy,0);
 context=null;dom.window.document.querySelector('button').click();assert.equal(legacy,1);context={uid:'other',assignmentId:'round'};dom.window.document.querySelector('button').click();assert.equal(legacy,2);
});
test('the existing grading panel stays below results despite the feedback panel CSS class collision',async t=>{
 const fs=require('node:fs'),css=fs.readFileSync(require.resolve('../../classroom/online-workspace.css'),'utf8');const dom=new JSDOM(`<style>.reviewPanel{position:fixed;right:12px;top:12px;bottom:12px;width:400px;z-index:999}</style><style>${css}</style><section id="resultsView"><div id="reviewPanel" class="reviewPanel"></div></section>`);t.after(()=>dom.window.close());const style=dom.window.getComputedStyle(dom.window.document.querySelector('#reviewPanel'));assert.equal(style.position,'static');assert.equal(style.width,'auto');
});
