import test from 'node:test';import assert from 'node:assert/strict';import{webcrypto}from'node:crypto';
test('copy/import request identity survives a lost response and reload, and a confirmed next copy gets a new ID',async()=>{
 const{createBillingCreationTracker}=await import('./billing-creation-tracker.mjs');const map=new Map(),storage={getItem:key=>map.get(key),setItem:(k,v)=>map.set(k,v),removeItem:key=>map.delete(key)};
 const a=createBillingCreationTracker({storage,crypto:webcrypto}),one=await a.begin('teacher','copy:source',{title:'Same',questions:[{text:'A'}]});
 const b=createBillingCreationTracker({storage,crypto:webcrypto}),retry=await b.begin('teacher','copy:source',{title:'Same',questions:[{text:'A'}]});assert.equal(retry,one);
 assert.notEqual(await b.begin('other','copy:source',{title:'Same',questions:[{text:'A'}]}),one);
 b.complete('teacher','copy:source',one);assert.notEqual(await b.begin('teacher','copy:source',{title:'Same',questions:[{text:'A'}]}),one);
 assert.equal([...map.values()].some(v=>v.includes('questions')),false);
});
