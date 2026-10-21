import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {JSDOM}=require('jsdom');
globalThis.GC2=require('./visual/core.js');
const {renderVisualEditor,VISUAL_FORMATS,parseVisualTask}=await import('./visual-tasks.mjs');
function editor(q){const d=new JSDOM('<main></main>');globalThis.document=d.window.document;globalThis.GCRenderer={mount(host,task){host.textContent=task.prompt;return {destroy(){},getAnswer(){return null;}};}};const host=document.querySelector('main');let changes=0;renderVisualEditor(host,q,()=>changes++);return {host,win:d.window,changes:()=>changes};}
test('teacher sees preview and solution for every visual format without a raw-data editor',()=>{for(const format of VISUAL_FORMATS){const task=GC2.example(format),q={type:'visual',text:task.prompt,points:task.maxPoints,visualTask:JSON.stringify(task)},original=q.visualTask;const {host,win,changes}=editor(q);assert.equal(host.querySelector('textarea'),null,format);assert(!host.textContent.includes('Aufgabendaten (JSON)'));assert(!host.textContent.includes('Darstellung und Lösung bearbeiten'));assert(host.textContent.includes('Lösung:'));assert.equal(q.visualTask,original);const select=host.querySelector('select');select.value=format==='grid'?'angle':'grid';select.dispatchEvent(new win.Event('change'));assert.equal(parseVisualTask(q).format,select.value);assert.equal(changes(),1);}});
test('invalid task gets a plain recovery message and never exposes its internal payload',()=>{const q={type:'visual',visualTask:'{"private":"broken task"'};const {host}=editor(q);assert.equal(host.querySelector('textarea'),null);assert(!host.textContent.includes(q.visualTask));assert.match(host.textContent,/Emmi/);assert.equal(q.visualTask,'{"private":"broken task"');});
