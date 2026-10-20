import test from 'node:test';import assert from 'node:assert/strict';
import {pizzaMarkup,togglePiece,splitPizza} from './interactive-pizza.mjs';
test('clicking toggles one piece and never changes the total whole',()=>{assert.deepEqual(togglePiece([],2,4),[2]);assert.deepEqual(togglePiece([2],2,4),[]);assert.deepEqual(togglePiece([],9,4),[]);assert.match(pizzaMarkup(4,[0]),/data-pizza-piece="3"/);assert.equal((pizzaMarkup(4,[0]).match(/aria-pressed="true"/g)||[]).length,1);});
test('finer division preserves the selected area',()=>{const p=splitPizza(4,[0],5);assert.equal(p.parts,20);assert.equal(p.selected.length,5);assert.equal(p.selected.length/p.parts,1/4);});
