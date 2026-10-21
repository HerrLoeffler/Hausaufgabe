import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {JSDOM}=createRequire(import.meta.url)('../tools/ui/node_modules/jsdom');
test('A4 access list fits a class, cards and individual sheets paginate without omissions or executable names',async()=>{
 let module;try{module=await import('./pupil-print.mjs');}catch{}
 assert.ok(module?.buildPrintDocument,'print renderer exists');
 const rows=Array.from({length:30},(_,i)=>({firstName:i===0?'<script>fail()</script>':'Mila',lastName:'Muster '+i,className:'8b',code:'7K4M9R2X'}));
 const list=module.buildPrintDocument({rows,layout:'list',title:'Klasse 8b',loginUrl:'http://127.0.0.1:8782/?student=1'});assert.equal(list.pageCount,1);assert.equal(new JSDOM(list.html).window.document.querySelectorAll('tbody tr').length,30);assert.doesNotMatch(list.html,/<script>fail/);
 const cards=module.buildPrintDocument({rows,layout:'cards',title:'Klasse 8b',loginUrl:'http://127.0.0.1:8782/?student=1'});assert.equal(cards.pageCount,4);
 const single=module.buildPrintDocument({rows,layout:'single',title:'8b',loginUrl:'http://127.0.0.1:8782/?student=1'});assert.equal(single.pageCount,30);
 const long=module.buildPrintDocument({rows:Array.from({length:300},()=>({...rows[0],firstName:'Langer '.repeat(15),lastName:'Mehrteiliger '.repeat(9)})),layout:'list',title:'Schule',loginUrl:'http://127.0.0.1:8782/?student=1'});assert.ok(long.pageCount>1);assert.equal(new JSDOM(long.html).window.document.querySelectorAll('tbody tr').length,300);
 assert.throws(()=>module.buildPrintDocument({rows:[{firstName:'Mila'}],layout:'cards',title:'8b',loginUrl:'http://127.0.0.1:8782/'}),/Zugang/);
});
