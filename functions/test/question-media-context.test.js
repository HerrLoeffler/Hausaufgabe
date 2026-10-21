'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createVerifiedMedia}=require('../lib/media-flow');
const {imageCachePath}=require('../lib/media-cache');
const question={type:'matching',text:'Match each school item with its use.',pairs:[{left:'ruler',right:'measure a line'},{left:'rubber',right:'remove pencil marks'}],audioScript:'Listen carefully',imageDataUrl:'PRIVATE_BINARY'};
test('image generation and review receive full task context, without binaries; context changes invalidate cache',async()=>{
 const generated=[],reviewed=[],keys=[];
 for(const right of ['remove pencil marks','erase a drawing']){
  const q=JSON.parse(JSON.stringify(question));q.pairs[1].right=right;
  await createVerifiedMedia({uid:'teacher',questionId:'q1',prompt:'School objects',expectedScene:'School objects',question:q,testContext:{subject:'English',grade:'5',contentLocale:'en-GB'},altText:'ruler → measure a line'}, {
   consume:async()=>{},record:async()=>{},cacheLoad:async c=>{keys.push(imageCachePath(c));return null;},
   generate:async p=>{generated.push(p);return {imageDataUrl:'image'};},
   inspect:async(...args)=>{reviewed.push(args);return {verdict:{matches:true},usage:{}};}
  });
 }
 assert.match(generated[0].prompt,/ruler/);assert.match(generated[0].prompt,/remove pencil marks/);
 assert.match(generated[0].prompt,/en-GB/);assert.match(generated[0].prompt,/Zuordnungslinien/);
 assert.doesNotMatch(generated[0].prompt,/PRIVATE_BINARY/);
 assert.match(JSON.stringify(reviewed[0]),/remove pencil marks/);
 assert.doesNotMatch(generated[0].altText,/measure a line/);
 assert.notEqual(keys[0],keys[1]);
});
test('missing scene cannot bypass contextual image review; answer-leaking images never become accepted assets',async()=>{
 let reviews=0;
 await assert.rejects(createVerifiedMedia({uid:'teacher',prompt:'School objects',question},{consume:async()=>{},record:async()=>{},generate:async()=>({imageDataUrl:'solved matching'}),inspect:async()=>{reviews++;return {verdict:{matches:false,reason:'Lösung durch Zuordnungslinien sichtbar'}};}}),e=>e.code==='image-mismatch');
 assert.equal(reviews,3);
});
