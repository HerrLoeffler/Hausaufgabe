import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectPRs,groupReadiness,requiredGates,matchesAssignment} from '../../docs/prototypes/firmenzentrale/pr-readiness.mjs';
const sha='a'.repeat(40),target='b'.repeat(40),at='2026-10-25T12:00:00Z',now=Date.parse(at);
const entry={number:1,head:sha,base:'web',group:'g',kind:'product',checks:[],mergeable:'clean'};
const group={id:'g',kind:'product',name:'Feature',prs:[1],gaps:[],next:'Prüfen'};
const audit={entries:[entry],groups:[group],checkedAt:at};
const source={lastSuccess:at,error:null,data:{prs:[{number:1,head:sha,base:'web'}],branchHeads:{web:target}}};
test('a PR number search does not match an unrelated hash or check identifier',()=>{
 assert.equal(matchesAssignment(group,[{number:254,head:'303abc',title:'Kapitel'}],'303'),false);
 assert.equal(matchesAssignment(group,[{number:303,title:'Konto'}],'#303'),true);
 assert.equal(matchesAssignment(group,[{number:303,title:'Konto'}],'konto'),true);
});
function complete(){return {...group,approval:{source:sha,target,base:'web',checkedAt:at,expiresAt:'2026-10-26T12:00:00Z',heads:{1:sha},gates:requiredGates.map(id=>({id,result:'passed',source:sha,target,evidence:'https://github.com/HerrLoeffler/Hausaufgabe/pull/1'}))}};}
test('current open list includes new work and excludes closed work without losing history',()=>{
 const p=projectPRs(audit,{...source,data:{prs:[{number:2,head:sha,base:'web'}]}},now);
 assert.deepEqual(p.entries.map(x=>x.number),[2]);assert.equal(p.unassigned.length,1);assert.equal(p.closed.length,1);
});
test('network failure and stale snapshots retain dated assignments but cannot approve',()=>{
 for(const s of [{...source,error:'offline'},{...source,lastSuccess:'2020-01-01'}]){
  const p=projectPRs(audit,s,now);assert.equal(p.fresh,false);assert.equal(p.entries.length,1);
  assert.equal(groupReadiness(complete(),p,now).ready,false);
 }
});
test('only exact complete bounded product evidence can be ready for a decision, never deployment',()=>{
 const p=projectPRs(audit,source,now),s=groupReadiness(complete(),p,now);
 assert.equal(s.ready,true);assert.equal(s.live,false);
 for(const field of ['gates','heads','target','source','expiresAt']){const g=complete();delete g.approval[field];assert.equal(groupReadiness(g,p,now).ready,false,field);}
});
test('documentation, prototypes and tooling never become live candidates through inherited approval',()=>{
 for(const kind of ['documentation','prototype','tooling','historical','service'])assert.equal(groupReadiness({...complete(),kind},projectPRs(audit,source,now),now).ready,false);
});
test('changed head, changed target, failed gate, expired proof and concrete gaps block readiness',()=>{
 for(const change of [g=>g.gaps.push('iPadtest fehlt'),g=>g.approval.gates[0].result='failed',g=>g.approval.gates[0].source='c'.repeat(40),g=>g.approval.expiresAt='2020-01-01']){
  const g=complete();g.gaps=[];change(g);assert.equal(groupReadiness(g,projectPRs(audit,source,now),now).ready,false);
 }
 for(const data of [{...source.data,prs:[{number:1,head:'c'.repeat(40),base:'web'}]},{...source.data,branchHeads:{web:'c'.repeat(40)}}])assert.equal(groupReadiness(complete(),projectPRs(audit,{...source,data},now),now).ready,false);
});
test('failed head check, conflict and unresolved dependent PR cannot be green',()=>{
 for(const e of [{...entry,mergeable:'dirty'},{...entry,checks:[{head:sha,status:'completed',conclusion:'failure'}]},{...entry,dependencies:[2]}]){
  const p=projectPRs({...audit,entries:[e]},source,now);assert.equal(groupReadiness(complete(),p,now).ready,false);
 }
});
test('real catalog assigns every audited PR exactly once and names concrete missing work',()=>{
 const c=JSON.parse(readFileSync(new URL('../../docs/prototypes/firmenzentrale/pr-audit.json',import.meta.url)));
 const numbers=c.groups.flatMap(g=>g.prs);assert.equal(new Set(numbers).size,c.entries.length);assert.equal(numbers.length,c.entries.length);
 assert.deepEqual([...numbers].sort((a,b)=>a-b),c.entries.map(x=>x.number).sort((a,b)=>a-b));
 for(const g of c.groups){assert.ok(g.owner&&g.next&&g.done);assert.ok(g.gaps.length||g.approval);}
 assert.equal(c.entries.length,80);assert.equal(c.openCount,79);
});

test('a later PR amendment and contradictory evidence prevent a stale approval',()=>{
 const changed=projectPRs({...audit,entries:[{...entry,updatedAt:at}]},{...source,data:{...source.data,prs:[{number:1,head:sha,base:'web',updatedAt:'2026-10-25T12:01:00Z'}]}},now);
 assert.equal(groupReadiness(complete(),changed,now).ready,false);
 const g=complete();g.approval.gates.push({...g.approval.gates[0],result:'failed'});assert.equal(groupReadiness(g,projectPRs(audit,source,now),now).ready,false);
});
