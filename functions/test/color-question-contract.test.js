"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeQuestion, validateQuestion } = require("../lib/validation");
const { questionSchemaForType } = require("../lib/schemas");
const { storedAiQuestion } = require("../lib/ai-job");
const { buildVariantInput } = require("../lib/test-variant");
const { taskContext } = require("../lib/question-context");
const { cleanWholeTestRevisionRequest } = require("../lib/whole-test-revision");
const question = () => ({id:"q1",position:1,type:"markwords",text:"Markiere die Wortarten.",passage:"Der kleine Igel schläft.",points:3,targetWords:["kleine","Igel","schläft"],markGroups:[{name:"Adjektive",color:"orange",words:["kleine"]},{name:"Nomen",color:"blue",words:["Igel"]},{name:"Verben",color:"green",words:["schläft"]}]});

test("AI schema and stored authoring keep named color groups without weakening current audio instruction", async () => {
  assert.ok(questionSchemaForType("markwords").properties.markGroups);
  assert.ok(questionSchemaForType("gapfill").properties.gapColors);
  const normalized=normalizeQuestion(question());
  const stored=await storedAiQuestion(normalized,0,{model:"mock",promptVersion:"mock"});
  assert.deepEqual(stored.markGroups,question().markGroups);
  const gap=normalizeQuestion({type:"gapfill",text:"Ein [Igel] [ruht].",points:2,gapColors:["blue","green"]});
  assert.deepEqual((await storedAiQuestion(gap,0,{model:"mock",promptVersion:"mock"})).gapColors,["blue","green"]);
});

test("validation rejects duplicate palettes, cross-group word assignments and misaligned gap colors", () => {
  const q=normalizeQuestion(question());assert.deepEqual(validateQuestion(q),[]);
  assert.ok(validateQuestion({...q,markGroups:q.markGroups.map(group=>({...group,color:"blue"}))}).length);
  assert.ok(validateQuestion({...q,markGroups:[q.markGroups[0],{...q.markGroups[1],words:["kleine"]}]}).length);
  assert.ok(validateQuestion(normalizeQuestion({type:"gapfill",text:"Ein [Igel] [ruht].",points:2,gapColors:["blue"]})).length);
});

test("whole-test variant references preserve the color criterion and fingerprint its assignment", () => {
  const quiz={title:"Wortarten",subject:"Deutsch",grade:"5"};const q=question();
  const one=buildVariantInput(quiz,[q],new Map(),{});
  assert.deepEqual(one.sourceTest.questions[0].markGroups,q.markGroups);
  const changed={...q,markGroups:q.markGroups.map(group=>({...group,color:group.color==="blue"?"purple":group.color}))};
  assert.notEqual(one.variantSourceFingerprint,buildVariantInput(quiz,[changed],new Map(),{}).variantSourceFingerprint);
});

test("teacher-only AI repair contexts and whole-test revision retain the color criterion without asset bytes", () => {
  const q=question();
  const context=taskContext({...q,audioInstruction:"Öffentlicher Auftrag",audioDataUrl:"PRIVATE_BINARY"},{});
  assert.deepEqual(context.question.markGroups,q.markGroups);assert.equal(context.question.audioInstruction,"Öffentlicher Auftrag");assert.equal(context.question.audioDataUrl,undefined);
  const request=cleanWholeTestRevisionRequest({instruction:"Einfacher formulieren",test:{questions:[q,{type:"gapfill",text:"Ein [Igel] ruht.",points:1,gapColors:["blue"]}]}});
  assert.deepEqual(request.test.questions[0].question.markGroups,q.markGroups);assert.deepEqual(request.test.questions[1].question.gapColors,["blue"]);
});
