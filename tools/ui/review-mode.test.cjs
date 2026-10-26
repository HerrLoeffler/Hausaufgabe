const {test}=require('node:test');const assert=require('node:assert/strict');const {JSDOM}=require('jsdom');const {pathToFileURL}=require('node:url');const path=require('node:path');
async function fixture(t, override, options={}){
 const dom=new JSDOM('<button id="danger">Veröffentlichen</button><main id="authView"><h1 data-review-id="hero-title">Hallo</h1></main>',{url:'http://localhost',pretendToBeVisual:true});t.after(()=>dom.window.close());
 const records=new Map();let calls=[];const api=async data=>{calls.push(data);if(override){const value=await override(data);if(value)return value;}if(data.action==='access')return {admin:true,catalog:{checks:[]}};if(data.action==='list')return {notes:[],checks:[]};if(data.action==='create')return {note:{id:'n1',...data}};return {};};
 let installReviewMode;try{({installReviewMode}=await import(pathToFileURL(path.resolve(__dirname,'../../review-mode.mjs'))));}catch{}
 assert.equal(typeof installReviewMode,'function','review panel exists');
 const storage={get:async k=>records.get(k)||null,put:async(k,v)=>records.set(k,structuredClone(v)),remove:async k=>records.delete(k)};
 const controller=installReviewMode({document:dom.window.document,api,getContext:()=>({view:'authView',build:'test-build',scene:'welcome',locale:'de'}),storage,...options});t.after(()=>controller.dispose());await controller.setSession({uid:'admin'});
 return {w:dom.window,controller,calls,records,storage};
}
const settle=()=>new Promise(r=>setTimeout(r,20));
test('marking intercepts actionable button; close restores original interaction',async t=>{
 const {w}=await fixture(t);let clicks=0;w.document.getElementById('danger').onclick=()=>clicks++;
 w.document.querySelector('[data-review-toggle]').click();await settle();w.document.querySelector('[data-review-mark]').click();w.document.getElementById('danger').click();assert.equal(clicks,0);
 assert.match(w.document.querySelector('[data-review-target]').textContent,/danger/);
 w.document.querySelector('[data-review-close]').click();w.document.getElementById('danger').click();assert.equal(clicks,1);
});
test('typed notes persist through reopen and are rendered as text; no automatic batch',async t=>{
 const {w,calls,records}=await fixture(t);w.document.querySelector('[data-review-toggle]').click();await settle();
 const input=w.document.querySelector('[data-review-text]');input.value='<img src=x onerror=alert(1)>';input.dispatchEvent(new w.Event('input'));await settle();
 assert.ok([...records.values()].some(x=>x.text===input.value));assert.equal(calls.some(x=>x.action==='batch'),false);
 w.document.querySelector('[data-review-close]').click();w.document.querySelector('[data-review-toggle]').click();await settle();assert.equal(w.document.querySelector('[data-review-text]').value,input.value);assert.equal(w.document.querySelector('[onerror]'),null);
});
test('account change removes panel and private DOM immediately',async t=>{
 const {w,controller}=await fixture(t);w.document.querySelector('[data-review-toggle]').click();await settle();
 await controller.setSession(null);assert.equal(w.document.querySelector('[data-review-panel]'),null);assert.equal(w.document.querySelector('[data-review-toggle]'),null);
});
test('outbox keeps a second note submitted during a delayed first sync',async t=>{
 let release;const gate=new Promise(r=>release=r);let first=true;
 const {w,calls,storage}=await fixture(t,async data=>{if(data.action==='create'&&first){first=false;await gate;}return null;});
 await storage.put('staging:admin:outbox',[{clientRequestId:'one',action:'create',text:'one'}]);
 w.document.querySelector('[data-review-toggle]').click();await settle();
 const input=w.document.querySelector('[data-review-text]');input.value='second';input.dispatchEvent(new w.Event('input'));
 [...w.document.querySelectorAll('button')].find(x=>x.textContent==='Hinweis speichern').click();await settle();release();await settle();await settle();
 assert.equal(calls.filter(x=>x.action==='create').length,2);
});
test('review controls move into an open dialog so browser modal inertness cannot hide them',async t=>{
 const {w}=await fixture(t);const dialog=w.document.createElement('dialog');dialog.setAttribute('open','');w.document.body.append(dialog);await settle();
 assert.equal(dialog.contains(w.document.querySelector('[data-review-toggle]')),true);
 w.document.querySelector('[data-review-toggle]').click();await settle();assert.equal(dialog.contains(w.document.querySelector('[data-review-panel]')),true);
 dialog.remove();await settle();assert.ok(w.document.querySelector('[data-review-panel]'));
});
test('question marking retains stable identity rather than enclosing list',async t=>{
 const {w,calls}=await fixture(t);const section=w.document.createElement('section');section.dataset.reviewId='student-question-q2';section.dataset.qid='q2';section.innerHTML='<p>Question two</p>';w.document.getElementById('authView').append(section);
 w.document.querySelector('[data-review-toggle]').click();await settle();w.document.querySelector('[data-review-mark]').click();section.firstChild.click();
 const input=w.document.querySelector('[data-review-text]');input.value='Fix this question';[...w.document.querySelectorAll('button')].find(x=>x.textContent==='Hinweis speichern').click();await settle();
 const request=calls.find(x=>x.action==='create');assert.equal(request.questionId,'q2');assert.equal(request.target,'student-question-q2');
});
test('a permanently rejected queued note does not block a later independent note',async t=>{
 const {w,calls,storage}=await fixture(t,async data=>{if(data.action==='create'&&data.clientRequestId==='bad')throw Object.assign(new Error('Quiz permission lost'),{code:'permission-denied'});});
 await storage.put('staging:admin:outbox',[{action:'create',clientRequestId:'bad',text:'old note'},{action:'create',clientRequestId:'good',text:'new note'}]);
 w.document.querySelector('[data-review-toggle]').click();await settle();assert.ok(calls.find(x=>x.clientRequestId==='good'));assert.match(w.document.querySelector('[data-review-outbox]').textContent,/old note/);
});

test('dragging a free region saves proportional bounds and suppresses original click',async t=>{
 const {w,calls}=await fixture(t);const view=w.document.getElementById('authView');view.getBoundingClientRect=()=>({left:0,top:0,width:1000,height:800});let clicks=0;view.onclick=()=>clicks++;
 w.document.querySelector('[data-review-toggle]').click();await settle();const regionButton=w.document.querySelector('[data-review-region]');assert.ok(regionButton,'region selection offered');regionButton.click();
 for(const [type,x,y] of [['pointerdown',100,160],['pointermove',400,320],['pointerup',400,320]])view.dispatchEvent(new w.MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}));view.click();
 assert.equal(clicks,0);const input=w.document.querySelector('[data-review-text]');input.value='Hier ein Logo hin';[...w.document.querySelectorAll('button')].find(x=>x.textContent==='Hinweis speichern').click();await settle();
 const request=calls.find(x=>x.action==='create');assert.deepEqual(request.region,{x:.1,y:.2,width:.3,height:.2,sourceWidth:1000,sourceHeight:800});assert.equal(request.target,'authView');
});
test('note destination is loaded before its exact target is highlighted',async t=>{
 let current='authView';const n={id:'n1',text:'Logo hier',status:'open',approval:'not_required',view:'dashboardView',target:'new-target',build:'old'};
 const {w}=await fixture(t,d=>d.action==='list'?{notes:[n],checks:[]}:null,{getContext:()=>({view:current,build:'new'}),navigate:async()=>{current='dashboardView';const x=w.document.createElement('div');x.id='new-target';w.document.body.append(x);}});
 w.document.querySelector('[data-review-toggle]').click();await settle();[...w.document.querySelectorAll('button')].find(x=>/Stelle (zeigen|öffnen)/.test(x.textContent)).click();await settle();assert.ok(w.document.querySelector('#new-target.reviewSelected'));
});
test('rectangle opening scrolls to the rectangle rather than the middle of a long view',async t=>{
 const n={id:'n',view:'authView',target:'authView',build:'test-build',region:{x:.1,y:.8,width:.2,height:.1,sourceWidth:1000,sourceHeight:3000}};
 const {w}=await fixture(t,d=>d.action==='list'?{notes:[n],checks:[]}:null);w.document.getElementById('authView').getBoundingClientRect=()=>({left:0,top:0,width:1000,height:3000});let top=0;w.scrollTo=options=>{top=options.top;};
 w.document.querySelector('[data-review-toggle]').click();await settle();[...w.document.querySelectorAll('button')].find(x=>x.textContent==='Stelle öffnen').click();await settle();assert.ok(top>2000,'rectangle near bottom brought into viewport');
});
test('releasing a region over sidebar ends drag before later pointer movement',async t=>{
 const {w,calls}=await fixture(t);const view=w.document.getElementById('authView');view.getBoundingClientRect=()=>({left:0,top:0,width:1000,height:1000});
 w.document.querySelector('[data-review-toggle]').click();await settle();w.document.querySelector('[data-review-region]').click();
 view.dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true,clientX:100,clientY:100}));w.document.querySelector('[data-review-panel]').dispatchEvent(new w.MouseEvent('pointerup',{bubbles:true,clientX:300,clientY:300}));view.dispatchEvent(new w.MouseEvent('pointermove',{bubbles:true,clientX:500,clientY:500}));
 const input=w.document.querySelector('[data-review-text]');input.value='Area';await new Promise(r=>setTimeout(r,520));[...w.document.querySelectorAll('button')].find(x=>x.textContent==='Hinweis speichern').click();await settle();assert.equal(calls.find(x=>x.action==='create')?.region?.width,.2);
});

test('compact staging mode syncs existing notes without installing the area-marking shortcut',async t=>{
 const {w}=await fixture(t,null,{compact:true});assert.equal(w.document.body.id,'gradecrewPage');await settle();assert.equal(w.document.querySelector('[data-review-region]'),null);assert.equal(w.document.querySelector('[data-review-mark]'),null);
});

test('compact feedback blocks text-only send when browser capture is unavailable and removes private UI on logout',async t=>{
 const {w,calls,controller}=await fixture(t,d=>d.action==='access'?{admin:false,catalog:{checks:[]}}:null,{compact:true,environment:'production'});
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 await settle();const feedback=w.document.querySelector('[data-gradecrew-feedback]');assert.ok(feedback);feedback.click();await settle();
 const form=w.document.querySelector('.gcLocalNote form');assert.ok(form);const input=form.querySelector('textarea');input.value='Diese Schrift ist abgeschnitten';form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await settle();
 assert.equal(calls.some(c=>c.action==='create'),false);assert.match(form.textContent,/Bild fehlt/);await controller.setSession(null);assert.equal(w.document.querySelector('[data-gradecrew-feedback]'),null);assert.equal(w.document.querySelector('.gcLocalNote'),null);
});
test('queued final pixels upload before create; offline retry preserves blob and immutable request',async t=>{
 let fail=true;const {controller,calls,storage}=await fixture(t,async d=>{if(d.action==='uploadVisualImage'){if(fail)throw Error('Offline');return {imageId:'private-image'};}return null;},{compact:true});
 const imageBlob=new Blob(['synthetic final raster'],{type:'image/jpeg'}),request={action:'create',area:'visual-feedback',captureSchemaVersion:2,clientRequestId:'frozen-report',text:'synthetic',imageBlob};
 await storage.put('staging:admin:outbox',[request]);await controller.setSession({uid:'admin'});await settle();assert.equal(calls.some(c=>c.action==='create'),false);assert.equal((await storage.get('staging:admin:outbox'))[0].imageBlob.size,imageBlob.size);
 fail=false;await controller.setSession({uid:'admin'});await settle();const sent=calls.find(c=>c.action==='create');assert.equal(sent.imageId,'private-image');assert.equal(sent.clientRequestId,'frozen-report');assert.equal(Object.hasOwn(sent,'imageBlob'),false);assert.deepEqual(await storage.get('staging:admin:outbox'),[]);
});
test('account switch while final image serializes cannot dispatch the previous account image or report',async t=>{
 let account='A',release,start;const gate=new Promise(r=>release=r),started=new Promise(r=>start=r),dispatched=[];
 const {controller,records}=await fixture(t,async data=>{dispatched.push({account,...data});if(data.action==='uploadVisualImage')return {imageId:'synthetic-image'};return null;});
 await controller.setSession({uid:'A'});class SlowBlob extends Blob{async arrayBuffer(){start();await gate;return super.arrayBuffer();}}
 records.set('staging:A:outbox',[{action:'create',captureSchemaVersion:2,clientRequestId:'one',text:'A-private-synthetic',imageBlob:new SlowBlob(['pixels'],{type:'image/jpeg'})}]);
 const opening=controller.open();await started;account='B';await controller.setSession({uid:'B'});release();await opening;await settle();
 assert.equal(dispatched.some(x=>x.account==='B'&&['uploadVisualImage','create'].includes(x.action)),false);assert.equal(records.get('staging:A:outbox').length,1);
});
