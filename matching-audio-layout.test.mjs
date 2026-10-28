import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{JSDOM}=require('./tools/ui/node_modules/jsdom');
const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const fn=name=>{const start=source.indexOf(`function ${name}(`);const rest=source.slice(start);const end=rest.slice(1).search(/\n(?:async )?function /);return end<0?rest:rest.slice(0,end+1);};
test('audio matching pool contains only four equal audio cards and keeps its accessible name and stable keys',()=>{
 const dom=new JSDOM('<section></section>'),doc=dom.window.document;const q={audioAnswerMode:'audio-only',pairs:[1,2,3,4].map(n=>({left:`Question ${n}`,right:`PRIVATE_${n}`}))};
 const c={document:doc,questionAnswerAudioEntries:q=>q.pairs.map((p,i)=>({key:`p${i}`,asset:{audioDataUrl:'data:audio/mpeg;base64,QUJD'}})),questionAnswerAudioReady:()=>true,shuffled:x=>x.slice().reverse(),setupMoveableBank:()=>{},escapeHtml:x=>x};vm.createContext(c);vm.runInContext(fn('makeDragItem')+fn('makeAudioDragItem')+fn('renderMatchingStudent'),c);
 try{c.renderMatchingStudent(doc.querySelector('section'),q);const bank=doc.querySelector('.dragBank');assert.equal(bank.getAttribute('role'),'group');assert.equal(bank.getAttribute('aria-label'),'Zuordnungen');assert.equal(bank.children.length,4);assert.equal(bank.querySelector('.dropHint'),null);assert.ok(bank.classList.contains('matchingAudioBank'));assert.deepEqual([...bank.children].map(e=>e.dataset.key),['3','2','1','0']);assert.equal(bank.querySelectorAll('audio[controls]').length,4);assert.doesNotMatch(bank.textContent,/PRIVATE_/);}finally{dom.window.close();}
});
