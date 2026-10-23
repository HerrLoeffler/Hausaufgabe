import test from 'node:test';
import assert from 'node:assert/strict';
const m = await import('../../docs/prototypes/firmenzentrale/model.mjs').catch(() => ({}));
test('navigation retains area, subview and case on reload; malformed URLs recover safely', () => {
  assert.equal(typeof m.parseRoute, 'function');
  assert.deepEqual(m.parseRoute('#/arbeit/bereich/tech/wissen'), {page:'arbeit',section:'bereich',id:'tech',tab:'wissen'});
  assert.equal(m.parseRoute('#/%ZZ').page,'heute');
  assert.equal(m.parseRoute('#/unknown').page,'heute');
});
test('search finds original task and nested work without duplicating cases', () => {
  assert.equal(typeof m.searchTopics, 'function');
  const topics=[{id:'T1',title:'Übung',area:'tech',relatedAreas:['product'],tasks:[{children:[['Winkel','Touchprüfung']]}]}];
  assert.equal(m.searchTopics(topics,' TOUCHPRÜFUNG ','product').length,1);
  assert.equal(m.searchTopics(topics,'','legal').length,0);
});
test('unknown goal evidence remains unknown, not zero or green', () => {
  assert.equal(typeof m.progress, 'function');
  assert.equal(m.progress([]),null);
  assert.equal(m.progress([{weight:NaN,accepted:true}]),null);
  assert.equal(m.progress([{weight:1,accepted:true},{weight:3,accepted:false}]),25);
});
test('unsafe source URLs cannot become executable links', () => {
  assert.equal(typeof m.safeLink, 'function');
  assert.equal(m.safeLink('javascript:alert(1)'),null);
  assert.equal(m.safeLink('data:text/html,test'),null);
  assert.equal(m.safeLink('https://github.com/a/b'),'https://github.com/a/b');
});
test('corrupt browser drafts are preserved and reported, never silently overwritten', () => {
  assert.equal(typeof m.readDrafts, 'function');
  const store={getItem:()=>'{broken',setItem:()=>assert.fail('must not overwrite')};
  assert.equal(m.readDrafts(store).ok,false);
});
test('failed browser persistence is not reported as saved', () => {
  assert.equal(typeof m.writeDrafts, 'function');
  assert.equal(m.writeDrafts({setItem:()=>{throw Error('quota')}},[]).ok,false);
});
test('valid draft survives reload, whitespace-only drafts cannot be saved', () => {
  assert.equal(typeof m.validateDraft, 'function');
  assert.equal(m.validateDraft({title:' ',body:'hi',area:'tech'}).ok,false);
  let raw=null;const store={getItem:()=>raw,setItem:(_,v)=>{raw=v}};
  const draft={id:'draft1',title:'Test',body:'Notiz',area:'tech',kind:'idea',updatedAt:'2026-10-22T20:00:00Z'};
  assert.equal(m.writeDrafts(store,[draft]).ok,true);
  assert.deepEqual(m.readDrafts(store).items,[draft]);
});
