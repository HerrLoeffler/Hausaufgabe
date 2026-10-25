import test from 'node:test';
import assert from 'node:assert/strict';
import {renderDelivery} from '../delivery.mjs';
test('only actual listening tasks expose the playback path, never a transcript',()=>{
 assert.equal(renderDelivery({id:'t',media:null}),'');
 const html=renderDelivery({id:'t',media:{kind:'listen',available:true}});
 assert.match(html,/data-listen-task="t"/);assert.match(html,/mehrfach/);assert.doesNotMatch(html,/<script|autoplay|Transkript/);
});
