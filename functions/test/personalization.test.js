"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { readFileSync } = require("node:fs");
const { feedbackMemory, QUALITY_REASONS } = require("../lib/quality");

const source = readFileSync(require.resolve("../index.js"), "utf8");
const handler = source.slice(source.indexOf("function teacherQualityGuide("), source.indexOf("\nasync function reviewDraft("));

test("shared feedback is aggregated while each teacher receives only their own preferences", async () => {
  const reports = [
    { category: "ai_question", userId: "alice", verdict: "bad", reason: "incorrect", subject: "Deutsch", grade: "5", questionType: "ordering", questionSnapshot: { type: "ordering", text: "Falsche Anordnung" } },
    { category: "ai_question", userId: "bob", verdict: "good", subject: "Deutsch", grade: "5", questionType: "single", questionSnapshot: { type: "single", text: "Gute Frage", points: 1 } }
  ];
  const profiles = { alice: "Kurze Arbeitsaufträge", bob: "Mehr Alltagssprache" };
  const context = vm.createContext({
    getFirestore: () => ({
      collection: () => ({ where: () => ({ select: () => ({ get: async () => ({ docs: reports.map(entry => ({ data: () => entry })) }) }) }) }),
      doc: path => ({ get: async () => ({ data: () => ({ aiPreferences: profiles[path.split("/")[1]] }) }) })
    }),
    feedbackMemory, QUALITY_REASONS, console
  });
  vm.runInContext(handler, context);
  const alice = await context.loadQualityMemory({ subject: "Deutsch", grade: "5" }, "alice");
  const bob = await context.loadQualityMemory({ subject: "Deutsch", grade: "5" }, "bob");
  assert.equal(alice.stats.total, 2);
  assert.equal(bob.stats.total, 2);
  assert.equal(alice.personal.stats.total, 1);
  assert.equal(bob.personal.stats.total, 1);
  assert.equal(alice.personal.stats.bad, 1);
  assert.equal(bob.personal.stats.good, 1);
  assert.match(context.teacherQualityGuide(alice), /Kurze Arbeitsaufträge/);
  assert.doesNotMatch(context.teacherQualityGuide(alice), /Mehr Alltagssprache/);
  assert.match(context.teacherQualityGuide(bob), /Mehr Alltagssprache/);
});

test('new V4 ratings stay in the human review inbox and are not reused as provider prompt examples',async()=>{
 const rows=[{category:'ai_question',userId:'alice',verdict:'bad',reason:'incorrect',questionSnapshot:{text:'PRIVATE V4'},feedbackSchemaVersion:4},{category:'ai_question',userId:'alice',verdict:'good',questionSnapshot:{type:'single',text:'Legacy'},feedbackSchemaVersion:3}];
 const context=vm.createContext({getFirestore:()=>({collection:()=>({where:()=>({select:()=>({get:async()=>({docs:rows.map(entry=>({data:()=>entry}))})})})})}),feedbackMemory,QUALITY_REASONS,console});
 vm.runInContext(handler,context);const memory=await context.loadQualityMemory({subject:'Deutsch'});assert.equal(memory.stats.total,1);assert.equal(JSON.stringify(memory).includes('PRIVATE V4'),false);
});
