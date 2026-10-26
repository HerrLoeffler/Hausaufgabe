import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';
import {collectInteractiveFormats,resetInteractiveFormatChoices,syncInteractiveFormatChoices} from './interactive-task-authoring.mjs';
const {JSDOM}=createRequire(import.meta.url)('./tools/ui/node_modules/jsdom');
function fixture(){const d=new JSDOM(fs.readFileSync('index.html','utf8')).window.document;d.getElementById('aiTypeChecks').innerHTML='<input type="checkbox" value="visual" checked>';return d;}
test('normal Remy offers the eight retained formats and submits chosen formats',()=>{
 const d=fixture();resetInteractiveFormatChoices(d);assert.equal(d.querySelectorAll('[data-interactive-formats]').length,7);
 assert.deepEqual(collectInteractiveFormats(d),['scale','coordinate','hotspot','labeling','angle','grid','connections','table']);
 for(const c of d.querySelectorAll('[data-interactive-formats]'))c.checked=c.dataset.interactiveFormats==='coordinate';
 assert.deepEqual(collectInteractiveFormats(d),['coordinate']);
 d.querySelector('#aiTypeChecks input').checked=false;syncInteractiveFormatChoices(d);assert.deepEqual(collectInteractiveFormats(d),[]);
 assert.ok(d.getElementById('aiInteractiveFormats').disabled);
});
test('empty selection is explicit and opening a new creation resets all choices',()=>{
 const d=fixture();for(const c of d.querySelectorAll('[data-interactive-formats]'))c.checked=false;
 assert.throws(()=>collectInteractiveFormats(d),/interaktives Format/);resetInteractiveFormatChoices(d);assert.equal(collectInteractiveFormats(d).length,8);
});
