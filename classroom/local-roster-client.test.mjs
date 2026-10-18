import test from 'node:test';import assert from 'node:assert/strict';
import {createLocalRosterClient} from './local-roster-client.mjs';
test('uses current teacher token only in header, never takes client UID, rejects late account response',async()=>{
 let uid='a',resolve;const sent=[];
 const port={getSession:()=>({uid}),getAuthToken:async()=> 'verified-token'};
 const client=createLocalRosterClient({port,fetchImpl:async(url,init)=>{sent.push({url,init});return {ok:true,json:async()=>({revision:0,classes:[],students:[]})};}});
 await client.read();assert.equal(sent[0].url,'/api/classroom/roster');assert.equal(sent[0].init.headers.Authorization,'Bearer verified-token');assert.equal(sent[0].init.cache,'no-store');
 await client.mutate('createClass',{name:'9b',schoolYear:'2026/27'},0,'abcdefghijklmnop');
 const body=JSON.parse(sent[1].init.body);assert.equal(body.ownerUid,undefined);assert.equal(body.payload.name,'9b');
 const delayed=createLocalRosterClient({port,fetchImpl:()=>new Promise(r=>{resolve=r;})});
 const promise=delayed.read();await new Promise(r=>setTimeout(r,0));uid='b';resolve({ok:true,json:async()=>({students:[{firstName:'Must not appear'}]})});
 await assert.rejects(promise,/account-changed/);
});
