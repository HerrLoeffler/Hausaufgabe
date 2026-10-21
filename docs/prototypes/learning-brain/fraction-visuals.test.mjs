import test from 'node:test';import assert from 'node:assert/strict';
import {visualPlan,visualHelp} from './fraction-visuals.mjs';
import {validateTask} from './tutor-model.mjs';
test('equal-sized whole and equivalent partitions preserve quantity',()=>{const q=validateTask({skill:'add',a:[1,2],b:[1,4]});const p=visualPlan(q);assert.equal(p.denominator,4);assert.equal(p.first,2);assert.equal(p.second,1);assert.equal(p.total,3);});
test('sum over a whole uses additional whole instead of overflowing one bar',()=>{const q=validateTask({skill:'add',a:[3,4],b:[3,4]});const h=visualHelp(q,2);assert.match(h,/Ganzes 2/);assert.match(h,/6 von 4/);});
test('first help does not reveal computed sum and deeper help does',()=>{const q=validateTask({skill:'same',a:[2,7],b:[3,7]});assert.doesNotMatch(visualHelp(q,1),/2 \+ 3 = 5/);assert.match(visualHelp(q,2),/2 \+ 3 = 5/);});
test('foundation picture asks to count without displaying fraction answer',()=>{const q=validateTask({skill:'parts',a:[2,5],b:[2,5]});const h=visualHelp(q,0);assert.match(h,/Gleich große Teile/);assert.doesNotMatch(h,/2 von 5/);});
test('expansion shows the same factor inside numerator and denominator',()=>{const q=validateTask({skill:'equivalent',a:[1,3],b:[1,6]});const h=visualHelp(q,1);assert.equal((h.match(/class="multiply-factor"/g)||[]).length,2);assert.match(h,/Anteil bleibt gleich/);});
