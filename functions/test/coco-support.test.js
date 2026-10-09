'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {searchOwnedTests,normalizeMemory}=require('../lib/coco-support');
test('orange dragon matches inflected description, returns evidence without answers',async()=>{
 const repo={listOwned:async uid=>{assert.equal(uid,'alice');return [{id:'Q1',title:'Wortarten'}];},questions:async()=>[{text:'Was siehst du?',imageAlt:'Ein orangener Drache',imageUrl:'https://example.org/dragon.png',correct:'secret'}]};
 const r=await searchOwnedTests(repo,'alice','oranger drache war drin als bild');assert.equal(r.matches[0].id,'Q1');assert.ok(r.matches[0].evidence);assert.ok(!JSON.stringify(r).includes('secret'));
});
test('does not claim visual recognition without metadata',async()=>{const r=await searchOwnedTests({listOwned:async()=>[{id:'Q'}],questions:async()=>[{imageUrl:'https://example.org/a.png'}]},'u','oranger Drache');assert.equal(r.matches.length,0);assert.equal(r.unindexedImages,1);});
test('memory preserves preferences and bounded conversation without TTL',()=>{const m=normalizeMemory({preferences:'Klasse 5',history:Array.from({length:90},()=>({role:'user',text:'Drachen'}))});assert.equal(m.preferences,'Klasse 5');assert.equal(m.history.length,40);assert.equal(m.history.at(-1).text,'Drachen');assert.ok(!('expiresAt' in m));});
