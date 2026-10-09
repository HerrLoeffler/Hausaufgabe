'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {searchOwnedTests,normalizeMemory}=require('../lib/coco-support');
test('orange dragon matches inflected description, returns evidence without answers',async()=>{
 const repo={listOwned:async uid=>{assert.equal(uid,'alice');return [{id:'Q1',title:'Wortarten'}];},questions:async()=>[{text:'Was siehst du?',imageAlt:'Ein orangener Drache',imageUrl:'https://example.org/dragon.png',correct:'secret'}]};
 const r=await searchOwnedTests(repo,'alice','oranger drache war drin als bild');assert.equal(r.matches[0].id,'Q1');assert.ok(r.matches[0].evidence);assert.ok(!JSON.stringify(r).includes('secret'));
});
test('does not claim visual recognition without metadata',async()=>{const r=await searchOwnedTests({listOwned:async()=>[{id:'Q'}],questions:async()=>[{imageUrl:'https://example.org/a.png'}]},'u','oranger Drache');assert.equal(r.matches.length,0);assert.equal(r.unindexedImages,1);});
test('memory preserves preferences and bounded conversation without TTL',()=>{const m=normalizeMemory({preferences:'Klasse 5',history:Array.from({length:90},()=>({role:'user',text:'Drachen'}))});assert.equal(m.preferences,'Klasse 5');assert.equal(m.history.length,40);assert.equal(m.history.at(-1).text,'Drachen');assert.ok(!('expiresAt' in m));});
test('account memory survives service reload, preserves preferences, deduplicates turns and deletes',async()=>{
 const {memoryOperation}=require('../lib/coco-support');let stored;const ref={get:async()=>({data:()=>stored}),set:async(v,o)=>{stored=o?.merge?{...stored,...v}:v;},delete:async()=>{stored=undefined;}};
 const db={runTransaction:async fn=>fn({get:ref.get,set:(_,v)=>{stored=v;}})};const stamp=()=>123;
 await memoryOperation(db,ref,{operation:'preferences',preferences:'Klasse 5'},stamp);
 const turn={operation:'remember',turnId:'turn-12345678',messages:[{role:'user',text:'Merke dir Drachen'},{role:'assistant',text:'Gespeichert'}]};
 await memoryOperation(db,ref,turn,stamp);await memoryOperation(db,ref,turn,stamp);
 const restored=await memoryOperation(db,ref,{operation:'read'},stamp);assert.equal(restored.preferences,'Klasse 5');assert.equal(restored.history.length,2);assert.equal(restored.history[0].text,'Merke dir Drachen');
 await memoryOperation(db,ref,{operation:'clear'},stamp);assert.deepEqual(await memoryOperation(db,ref,{operation:'read'},stamp),normalizeMemory());
});
test('English motif and embedded generated image are found without leaking solutions',async()=>{
 const image='data:image/webp;base64,YWJj';const r=await searchOwnedTests({listOwned:async()=>[{id:'Q',title:'Deutsch'}],questions:async()=>[{text:'Ein Tier',imageAlt:'Ein orangener Drache',imageDataUrl:image,correctBoolean:true}]},'u','orange dragon');assert.equal(r.matches[0].imageUrl,image);assert.ok(!JSON.stringify(r).includes('correctBoolean'));
});
