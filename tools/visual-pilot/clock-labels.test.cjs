'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../../visual/core.js');
function render(task,answer){const window={GC2:core},document={activeElement:null,addEventListener(){},removeEventListener(){}};vm.runInNewContext(fs.readFileSync(__dirname+'/../../visual/renderers.js','utf8'),{window,document});const host={innerHTML:'',contains:()=>false,addEventListener(){},querySelectorAll:()=>[]};window.GCRenderer.mount(host,core.publicTask(task),answer);return host.innerHTML;}
test('clock scales show hours and minutes, not decimal hours',()=>{const d=JSON.parse(fs.readFileSync(__dirname+'/../../docs/evidence/visual-pilot-24-20261025/P10-quiz.json'));const task=JSON.parse(d.questions[1].visualTask);const html=render(task,10.25);assert.match(html,/>10:00</);assert.match(html,/>10:30</);assert.match(html,/aria-valuetext="10:15"/);assert.doesNotMatch(html,/>10,5</);});
test('ordinary fractional scale remains a numeric scale',()=>{const t=core.example('scale');t.spec.unit='';const html=render(t,0.5);assert(!html.includes('aria-valuetext="00:30"'));});
