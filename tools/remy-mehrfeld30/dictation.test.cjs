'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work/gradecrew/tools/ui/node_modules/jsdom');
function setup(){
 const dom=new JSDOM('<button>Einsprechen</button><textarea maxlength="500"></textarea><p></p>'),{window}=dom,document=window.document;
 let instance;
 class Speech extends window.EventTarget{constructor(){super();instance=this;}start(){}stop(){this.dispatchEvent(new window.Event('end'));}abort(){}}
 window.SpeechRecognition=Speech;
 const attach=new Function(fs.readFileSync(path.join(__dirname,'dictation.mjs'),'utf8').replace('export function','function')+'\nreturn attachDictation;')();
 const input=document.querySelector('textarea'),button=document.querySelector('button'),status=document.querySelector('p');
 return {dom,window,input,button,status,get instance(){return instance;},control:attach({window,input,button,status})};
}
test('browser dictation keeps final text once, stops before save and ignores old-task results',async()=>{
 const s=setup();try{
 s.button.click();assert.equal(s.control.isActive(),true);
 const event=new s.window.Event('result');event.resultIndex=0;event.results=[[{transcript:'Die Pfeile sind unklar'}]];
 s.instance.dispatchEvent(event);s.instance.dispatchEvent(event);
 assert.equal(s.input.value,'Die Pfeile sind unklar');
 await s.control.stop();assert.equal(s.control.isActive(),false);
 const old=s.instance;s.control.cancel();s.input.value='Neue Aufgabe';old.dispatchEvent(event);
 assert.equal(s.input.value,'Neue Aufgabe');
 }finally{s.dom.window.close();}
});
test('unsupported and denied speech preserve editable feedback without automatic recording',()=>{
 const s=setup();try{
 s.input.value='Meine Notiz';s.window.SpeechRecognition=null;s.button.click();assert.match(s.status.textContent,/nicht verfügbar/);
 assert.equal(s.input.value,'Meine Notiz');assert.equal(s.control.isActive(),false);
 }finally{s.dom.window.close();}
});
test('repeated stop while the browser is finishing resolves every waiting save',async()=>{
 const s=setup();try{
 s.button.click();s.instance.stop=()=>{};
 const first=s.control.stop(),second=s.control.stop();
 s.instance.dispatchEvent(new s.window.Event('end'));
 const result=await Promise.race([Promise.all([first,second]).then(()=>true),new Promise(r=>setTimeout(()=>r(false),30))]);
 assert.equal(result,true);
 }finally{s.dom.window.close();}
});
