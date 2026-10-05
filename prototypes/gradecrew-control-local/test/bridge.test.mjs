import test from 'node:test';
import assert from 'node:assert/strict';
import {createBridge} from '../plugin/bridge.mjs';
import {classify} from '../plugin/taxonomy.mjs';
test('host bridge accepts only parent replies and pins origin; timeout never resends',async()=>{
 const sent=[];let receive;const parent={postMessage:(msg,target)=>sent.push({msg,target})};
 const win={parent,addEventListener:(_,fn)=>receive=fn,removeEventListener:()=>{}};
 const bridge=createBridge(win,30);
 const p=bridge.request('ui/initialize',{});
 receive({source:{},origin:'evil',data:{jsonrpc:'2.0',id:1,result:{fake:true}}});
 receive({source:parent,origin:'https://host',data:{jsonrpc:'2.0',id:1,result:{ok:true}}});
 assert.deepEqual(await p,{ok:true});
 const fail=bridge.request('ui/message',{role:'user',content:[{type:'text',text:'Stand?'}]});
 receive({source:parent,origin:'https://other',data:{jsonrpc:'2.0',id:2,result:{}}});
 await assert.rejects(fail,/Eingang unbekannt/);assert.equal(sent.length,2);assert.equal(sent[1].target,'https://host');bridge.close();
});
test('cross-cutting tasks have separate dimensions and preserve source evidence',()=>{
 const t=classify({id:'GC-AUDIO-01',title:'Audioaufnahme am iPad',stage:'staging_deployed'});
 assert.equal(t.functionName,'Audio & Sprache');assert.deepEqual(t.applications,['iPhone & iPad']);assert.equal(t.stage,'staging_deployed');
 assert.equal(classify({id:'GC-ANALYTICS-01',title:'PostHog für Games'}).functionName,'Statistik & Nutzung');
});
