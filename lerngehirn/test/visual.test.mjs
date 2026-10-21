import test from 'node:test';
import assert from 'node:assert/strict';
import {renderVisual} from '../brain.mjs';
test('fraction strip renders two equally wide bars, separate real subdivisions and accessible labels',()=>{const html=renderVisual({kind:'fraction-strip',numerator:1,denominator:2,factor:3,description:'Die Hälfte bleibt gleich.'});assert.equal((html.match(/class="fraction-strip"/g)||[]).length,2);assert.match(html,/--parts:2/);assert.match(html,/--parts:6/);assert.match(html,/1 von 2 gleich großen Teilen/);assert.match(html,/3 von 6 gleich großen Teilen/);});
test('visual description is escaped and arbitrary model markup never becomes HTML',()=>{const html=renderVisual({kind:'fraction-strip',numerator:1,denominator:2,factor:1,description:'<img src=x onerror=alert(1)>'});assert.doesNotMatch(html,/<img/);assert.match(html,/&lt;img/);assert.match(html,/Die Einteilung bleibt gleich/);assert.equal(renderVisual({kind:'none',html:'<svg onload=alert(1)>'}), '');});
