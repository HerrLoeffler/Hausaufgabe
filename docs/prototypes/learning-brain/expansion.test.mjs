import test from 'node:test';
import assert from 'node:assert/strict';
let tutor;try{tutor=await import('./expansion.mjs');}catch{}
test('refining a strip preserves shaded fraction and distinguishes old and new units',()=>{assert.ok(tutor,'Der neue Erweitern-Lernweg fehlt.');const html=tutor.stripMarkup({n:2,d:3,k:4},'numerator');assert.match(html,/data-total="3" data-selected="2"/);assert.match(html,/data-total="12" data-selected="8"/);});
test('a simpler counting bridge shows halves split in two rather than the complex source denominator',()=>{assert.ok(tutor);const html=tutor.stripMarkup({n:2,d:7,k:4},'count-blue');assert.match(html,/data-total="4" data-selected="2"/);assert.doesNotMatch(html,/data-total="28"/);});
test('new independent task has blank fraction fields while guided completion fixes only the known component',()=>{assert.ok(tutor);const state={task:{n:2,d:3,k:2},target:'practice',level:0};assert.doesNotMatch(tutor.answerMarkup(state),/value="[1-9]/);const help=tutor.answerMarkup({...state,target:'completion',focus:'denominator'});assert.match(help,/name="n" value="4"[^>]*readonly/);assert.match(help,/name="d" value=""/);});
