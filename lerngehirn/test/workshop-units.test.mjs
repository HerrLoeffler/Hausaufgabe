import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const filename = new URL('../workshop-units.mjs', import.meta.url);
async function api() { assert.ok(fs.existsSync(filename), 'multi-whole interactive renderer must exist'); return import(filename.href); }
const c = {tool:'fraction-units',version:1,role:'answer',goal:'represent',denominator:3,wholeCount:3,instruction:'Stelle den Anteil dar.'};
test('whole strips retain identical width and equal subdivisions with no supplied answer or initial selection', async () => {
  const a = await api(); let s = a.create('units', c);
  assert.deepEqual(s.selected, []); assert.equal(a.ready(s), true);
  for (const value of [0,2,3,4,5,6,8]) s = a.action(s,{type:'toggle-part',value});
  assert.equal(a.ready(s), true); assert.equal(s.selected.length, 7);
  const html = a.render(s);
  assert.equal((html.match(/class="workshop-strip workshop-own"/g)||[]).length,3);
  assert.equal((html.match(/--parts:3/g)||[]).length,3);
  assert.equal((html.match(/data-workshop-part="/g)||[]).length,9);
  assert.match(html,/7\/3/); assert.match(html,/2 Ganze/);
  assert.deepEqual(a.evidence(s).actions.map(x=>x.value),[0,2,3,4,5,6,8]);
});
test('invalid actions cannot change a board; reset empties it and semantic history is bounded and copied', async () => {
  const a = await api(); let s = a.create('units', c);
  for (const action of [{type:'toggle-part',value:-1},{type:'toggle-part',value:9},{type:'set-parts',value:6},{type:'partition',value:2},{type:'reset',value:1},{type:'toggle-part',value:1,forged:true}]) assert.equal(a.action(s,action),s);
  s = a.action(s,{type:'toggle-part',value:2}); s = a.action(s,{type:'reset',value:0}); assert.deepEqual(s.selected,[]); assert.equal(a.ready(s),true);
  for(let i=s.actions.length;i<60;i++)s=a.action(s,{type:'toggle-part',value:0});
  assert.equal(a.action(s,{type:'toggle-part',value:1}),s);
  const e=a.evidence(s);e.actions[0].value=999;assert.notEqual(s.actions[0].value,999);
  assert.deepEqual(Object.keys(e),['tool','version','taskId','actions']);
});
test('configuration, markup and keyboard buttons preserve bounds and escape untrusted instructions', async () => {
  const a=await api();
  for(const patch of [{denominator:1},{denominator:13},{wholeCount:5},{numerator:7},{initialSelected:[1]},{goal:'equivalent'},{instruction:''}]) assert.equal(a.config({...c,...patch}),null);
  const s=a.create('units',{...c,instruction:'<script>bad</script>'});
  assert.match(a.render(s),/&lt;script&gt;/);assert.doesNotMatch(a.render(s),/<script>/);
  assert.match(a.render(s,true),/data-workshop-part="0"[^>]*disabled/);assert.match(a.render(s),/aria-pressed="false"/);
  assert.equal(a.config({...c,denominator:12,wholeCount:4}).denominator,12);
  assert.equal(a.create('',c),null);
});
