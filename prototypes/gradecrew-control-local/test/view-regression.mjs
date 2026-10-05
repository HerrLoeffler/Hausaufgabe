import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const ids=new Map(), handlers={};
class El {constructor(tag){this.tag=tag;this.children=[];this.value='';this.dataset={};this.classList={toggle(){}};this.handlers={};} set id(v){this._id=v;ids.set(v,this);} get id(){return this._id;} append(...v){this.children.push(...v);} replaceChildren(...v){this.children=v;} addEventListener(k,f){this.handlers[k]=f;} querySelector(tag){return this.children.find(x=>x.tag===tag);} closest(){return this;}}
for(const id of ['status','source','dimension','category','search','attention','running','testing','count','list','detail','refresh','all']) {const e=new El('div');e.id=id;} ids.get('dimension').value='functionName';ids.get('category').value='all';
const document={querySelector:s=>ids.get(s.slice(1)),createElement:t=>new El(t),createTextNode:t=>({textContent:t}),addEventListener:(k,f)=>handlers[k]=f};
const d={tasks:[{id:'A',title:'Task',applications:[],functionName:'Other',responsibility:'Dev'}],questions:[],drafts:[],sourceCommit:'abc'};
let messageCount=0, resultHandler,uuid=0;
const bridge={onResult:f=>resultHandler=f,notify(){},request:async(method,p)=>{if(method==='ui/initialize')return {hostCapabilities:{message:{text:{}}}};if(method==='tools/call'){if(p.name==='gradecrew_open')return {structuredContent:structuredClone(d)};const prior=d.questions.find(q=>q.requestId===p.arguments.requestId);if(prior&&prior.text!==p.arguments.text)return {isError:true,content:[{text:'Anfrage-ID bereits anders verwendet.'}]};const q=prior??{...p.arguments,id:'q'+(d.questions.length+1)};if(!prior)d.questions.push(q);return {structuredContent:{question:q,status:prior?200:201}};}if(method==='ui/message')messageCount++;return {};}};
const src=await readFile(new URL('file://'+process.cwd()+'/plugin/view.mjs'),'utf8');const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
await new AsyncFunction('document','window','createBridge','Option','crypto','setInterval',src)(document,{},()=>bridge,function(t,v){const e=new El('option');e.textContent=t;e.value=v;return e;},{randomUUID:()=> 'request-'+String(++uuid).padStart(3,'0')},()=>0);
const select=new El('button');select.dataset.task='A';handlers.click({target:select});
const errors=[];
const check=(name,fn)=>{try{fn();console.log('PASS:',name);}catch(e){errors.push(name);console.error('FAIL:',name,e.message);}};
ids.get('question').value='Unsent draft';await ids.get('refresh').handlers.click();console.log('After refresh draft:',JSON.stringify(ids.get('question').value));
check('refresh preserves unsent draft',()=>assert.equal(ids.get('question').value,'Unsent draft'));
ids.get('question').value='First question';await handlers.submit({target:ids.get('question-form'),preventDefault(){}});console.log('After first send count/button:',messageCount,ids.get('question-form').querySelector('button').disabled);
check('successful send allows new question',()=>assert.equal(ids.get('question-form').querySelector('button').disabled,false));
await ids.get('refresh').handlers.click();ids.get('question').value='Second question';await handlers.submit({target:ids.get('question-form'),preventDefault(){}});console.log('Second question:',ids.get('status').textContent,'messages:',messageCount);
check('different follow-up has its own request',()=>assert.equal(d.questions.length,2));
await ids.get('refresh').handlers.click();ids.get('question').value='First question';await handlers.submit({target:ids.get('question-form'),preventDefault(){}});console.log('Same text submitted again: host messages:',messageCount,'persisted questions:',d.questions.length);
// Each deliberately fresh submission may have the same text, but may not reuse a delivered request.
check('one host send per persisted request',()=>assert.equal(messageCount,d.questions.length));
if(errors.length)process.exitCode=1;
// Unknown delivery is retained across rendering and refresh, not stored on one button.
let failDelivery=true;
const originalRequest=bridge.request;
bridge.request=async(method,p)=>{if(method==='ui/message'&&failDelivery){messageCount++;throw Error('Eingang unbekannt');}return originalRequest(method,p);};
ids.get('question').value='Uncertain delivery';await handlers.submit({target:ids.get('question-form'),preventDefault(){}});
const sentBefore=messageCount;
await ids.get('refresh').handlers.click();
check('unknown delivery remains locked after refresh',()=>assert.equal(ids.get('question-form').querySelector('button').disabled,true));
await handlers.submit({target:ids.get('question-form'),preventDefault(){}});
check('unknown delivery is not sent twice',()=>assert.equal(messageCount,sentBefore));
if(errors.length)process.exitCode=1;
// A confirmed pre-save conflict is recoverable after refresh, unlike an unknown send.
d.tasks.push({id:'B',title:'Another task',applications:[],functionName:'Other',responsibility:'Dev'});
await ids.get('refresh').handlers.click();select.dataset.task='B';handlers.click({target:select});
const delegate=bridge.request;let rejectSave=true;
bridge.request=async(method,p)=>{if(method==='tools/call'&&p.name==='gradecrew_question'&&rejectSave)return {isError:true,structuredContent:{errorStatus:409},content:[{text:'Der Aufgabenstand hat sich geändert. Bitte aktualisieren.'}]};return delegate(method,p);};
ids.get('question').value='Question after update';await handlers.submit({target:ids.get('question-form'),preventDefault(){}});
await ids.get('refresh').handlers.click();
check('confirmed rejection allows correction after refresh',()=>assert.equal(ids.get('question-form').querySelector('button').disabled,false));
check('confirmed rejection keeps draft text',()=>assert.equal(ids.get('question').value,'Question after update'));
if(errors.length)process.exitCode=1;
