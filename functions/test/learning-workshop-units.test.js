"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const filename = path.join(path.dirname(module.filename), "../lib/learning-brain/workshop-units.js");
function api() { assert.ok(fs.existsSync(filename), "multi-whole fraction tool must exist"); return require(filename); }
const c = {tool:"fraction-units",version:1,role:"answer",goal:"represent",denominator:3,wholeCount:3,instruction:"Stelle den gegebenen Anteil dar."};
const topic = {subject:"math",title:"Unechte Brüche darstellen"};
const task = {id:"units-1",input:"workshop",workshop:c,answer:{kind:"rational",values:["7/3"]}};
const payload = (actions) => ({tool:"fraction-units",version:1,taskId:task.id,actions});
const mark = (indices) => indices.map((value) => ({type:"toggle-part",value}));
test("three equal wholes produce the improper fraction from actual nonconsecutive selections", () => {
  assert.deepEqual(api().validate(c,topic,task),c);
  const r = api().observe(task,payload(mark([0,2,3,4,5,6,8])));
  assert.equal(r.answer,"7/3");
  assert.deepEqual(r.final,{numerator:7,denominator:3});
  assert.deepEqual(r.selection,[0,2,3,4,5,6,8]);
  assert.deepEqual(r.selected,[0,2,3,4,5,6,8]);
  assert.equal(require("../lib/learning-brain/exact").assessExact(r.answer,task.answer),true);
  assert.equal(api().observe(task,payload([])).answer,"0/3");
});
test("toggle and reset replay only actions and never accept a claimed final answer", () => {
  const r = api().observe(task,payload([...mark([0,1,2,8]),{type:"toggle-part",value:1},{type:"reset",value:0},{type:"toggle-part",value:7}]));
  assert.equal(r.answer,"1/3"); assert.equal(r.actionCount,7); assert.equal(r.changes.at(-1).after.numerator,1);
  for (const p of [{...payload([]),taskId:"foreign"},{...payload([]),answer:"7/3"},{...payload([]),selection:[0]},payload([{type:"set-parts",value:6}]),payload([{type:"toggle-part",value:9}]),payload([{type:"reset",value:1}]),payload([{type:"toggle-part",value:1,selected:true}]),payload(Array.from({length:61},()=>({type:"reset",value:0})))]) assert.throws(()=>api().observe(task,p));
});
test("config and private keys reject foreign topics, leaked numerator, non-grid values and wrong answer contracts", () => {
  for (const patch of [{denominator:1},{denominator:13},{wholeCount:0},{wholeCount:5},{wholeCount:1.5},{numerator:7},{initialSelected:[0]},{version:2},{goal:"equivalent"},{instruction:""}]) assert.throws(()=>api().validate({...c,...patch},topic,task));
  assert.throws(()=>api().validate(c,{subject:"german",title:"Bruch im Satz"},task));
  for (const answer of [{kind:"open",values:["7/3"]},{kind:"number",values:["2"]},{kind:"rational",values:["1/2"]},{kind:"rational",values:["10/3"]},{kind:"rational",values:["-1/3"]},{kind:"rational",values:[]},{kind:"exact-fraction",values:["14/6"]}]) assert.throws(()=>api().validate(c,topic,{...task,answer}));
  assert.deepEqual(api().validate(c,topic,{...task,answer:{kind:"exact-fraction",values:["7/3"]}}),c);
  assert.throws(()=>api().validate(c,topic,{...task,input:"text"}));
  assert.deepEqual(api().validate({...c,role:"support"},topic,{...task,input:"text"}),{...c,role:"support"});
});
