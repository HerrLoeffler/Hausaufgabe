import test from 'node:test';
import assert from 'node:assert/strict';
import {createSnapshotReader} from '../plugin/connection.mjs';
test('connection rechecks after success and reconnects after failure while sharing in-flight work',async()=>{
 let available=true,calls=0;
 const read=createSnapshotReader(async()=>{calls++;if(!available)throw Error('refused');return {generation:calls};});
 const [a,b]=await Promise.all([read(),read()]);assert.deepEqual(a,b);assert.equal(calls,1);
 available=false;await assert.rejects(read(),/refused/);assert.equal(calls,2);
 available=true;assert.deepEqual(await read(),{generation:3});
});
