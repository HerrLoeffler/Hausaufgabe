import test from 'node:test';
import assert from 'node:assert/strict';
import {domains} from '../../docs/prototypes/firmenzentrale/portfolio.mjs';
const m=await import('../../docs/prototypes/firmenzentrale/focus.mjs').catch(()=>({}));
test('all existing subtopics have stable independent work records and bounded dated evidence',()=>{
 assert.equal(typeof m.childrenFor,'function');
 const ids=[];
 for(const d of domains){const list=m.childrenFor(d.id);assert.ok(d.pieces.every(title=>list.some(c=>c.title===title)),d.id);
  for(const c of list){ids.push(`${c.domainId}/${c.id}`);for(const f of ['id','domainId','title','state','priority','why','current','gap','next','owner','source','sourceDate'])assert.ok(c[f],`${d.id}/${c.id}: ${f}`);assert.ok(c.acceptance.length>0);assert.equal(c.progress,null);assert.equal(c.sourceDate,c.id==='erneuerungen'||d.id==='central'&&['chat','wissen'].includes(c.id)?'2026-10-25':'2026-10-23');}
 }assert.equal(new Set(ids).size,ids.length);
});
test('each area becomes the center, all children are placed distinctly and deep links resolve safely',()=>{
 for(const d of domains){const p=m.focusProjection(d.id);assert.deepEqual(p.center,{x:575,y:450});assert.equal(p.domain.id,d.id);assert.equal(new Set(p.children.map(c=>`${c.x}/${c.y}`)).size,p.children.length);assert.ok(p.children.every(c=>Number.isFinite(c.x)&&c.x>100&&c.x<1050&&c.y>60&&c.y<840));assert.equal(m.focusProjection(d.id,p.children[0].id).selected.id,p.children[0].id);}
 assert.equal(m.focusProjection('unknown').domain,null);assert.equal(m.focusProjection('design','missing').invalid,'child');assert.equal(m.focusProjection('design','missing').selected,null);
});
test('only specifically reported subtopics are blocked; new task technology has its own acceptance path',()=>{
 assert.equal(m.childrenFor('classroom').find(c=>c.id==='zuweisungen').state,'blocker');
 assert.notEqual(m.childrenFor('classroom').find(c=>c.id==='asv').state,'blocker');
 const renew=m.childrenFor('learning').find(c=>c.id==='erneuerungen');assert.ok(renew);assert.match(renew.next,/Kandidat|Matrix/);assert.ok(renew.acceptance.some(t=>/Regression/i.test(t)));
 assert.equal(m.childrenFor('design').some(c=>c.state==='blocker'),false);
});
test('focused filtering and search reach work details, empty matches stay empty',()=>{
 const list=m.childrenFor('learning');assert.ok(m.filterChildren(list,'Regression','all').some(c=>c.id==='erneuerungen'));assert.equal(m.filterChildren(list,'no-such-998','all').length,0);assert.ok(m.filterChildren(list,'','urgent').every(c=>c.priority==='urgent'));assert.ok(m.filterChildren(list,'','review').every(c=>c.state==='review'));assert.ok(m.filterChildren(list,'','all').length>0);
});
test('prepared work keeps exact subtopic scope, gap and acceptance without a sent claim',()=>{
 const c=m.childrenFor('learning').find(c=>c.id==='erneuerungen'),text=m.prepareChildWork(c);for(const s of [c.title,c.current,c.gap,c.next,c.owner,c.source,...c.acceptance])assert.ok(text.includes(s));assert.match(text,/nicht gesendet/);assert.match(text,/learning\/erneuerungen/);
});
