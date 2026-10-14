"use strict";
const test = require("node:test"); const assert = require("node:assert/strict");
const { createLearningService } = require("../lib/wissensreise-service");
function harness() {
  const docs = new Map(); const source = { ownerId: "teacher", title: "Zwei Fragen", questions: [{ id: "a", type: "number", text: "2 + 3 = ?", numericAnswer: 5 }, { id: "b", type: "matching", text: "Ordne Wortarten", pairs: [{ left: "Haus", right: "Nomen" }, { left: "laufen", right: "Verb" }] }] };
  let time = 1000, calls = 0;
  const repo = { loadSource: async () => JSON.parse(JSON.stringify(source)), get: async key => docs.get(key), mutate: async (key, fn) => { const result = await fn(docs.get(key)); if (result.value) docs.set(key, result.value); return result.output; } };
  let batchCalls=0;const {compileQuestion}=require('../lib/wissensreise-core'); const queue=[];
  const svc = createLearningService({ repo, now: () => time, enqueue:async data=>queue.push(data), generateBatch:async d=>{batchCalls++;return Array.from({length:12},(_,i)=>({...compileQuestion({id:'a',type:'number',text:`Wie viel ist Beispiel${batchCalls}-${i}?`,numericAnswer:i}),kind:'similar'}));}, generate: async q => { calls++; return { ...q, text: `${q.text} Neue Situation`, pairs: [{ left: "Baum", right: "Nomen" }, { left: "springen", right: "Verb" }] }; } });
  return { svc, docs, source, queue, batchCalls:()=>batchCalls, tick: ms => { time += ms; }, calls: () => calls };
}
const args = { sourceId: "ABCD", requestId: "request-123456", duration: 180, formats: ["number", "matching"] };
async function publication(h) { const draft = await h.svc.prepare("teacher", args); await h.svc.publish("teacher", { draftId: draft.id, revision: draft.revision, reviewed: true, rightsConfirmed: true }); return draft.id; }
test("owner-only source, idempotent draft and changed request binding", async () => {
 const h = harness(); const a = await h.svc.prepare("teacher", args); assert.equal((await h.svc.prepare("teacher", args)).id, a.id);
 await assert.rejects(h.svc.prepare("other", args)); await assert.rejects(h.svc.prepare("teacher", { ...args, duration: 120 }));
 h.source.published = true; await assert.rejects(h.svc.publish("teacher", { draftId: a.id, revision: a.revision, reviewed: true, rightsConfirmed: true }));
});
test("two sources keep supplying varied tasks until the server countdown, resume uses original deadline", async () => {
 const h = harness(), id = await publication(h); let response = await h.svc.start({ publicationId: id, requestId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa" }); const access = { sessionId: response.sessionId, token: response.token }; const seen = new Set();
 for (let i = 0; i < 120; i++) { assert.equal(response.ended, false); seen.add(response.task.text + JSON.stringify(response.task.left)); response = await h.svc.step({ ...access, action: "next", taskId: response.task.id }); h.tick(1000); }
 assert.ok(seen.size > 15); const resume = await h.svc.step({ ...access, action: "resume" }); assert.equal(resume.endsAt, 181000); h.tick(60001); assert.equal((await h.svc.step({ ...access, action: "resume" })).ended, true);
 assert.equal(JSON.stringify(resume).includes('numericAnswer'), false); await assert.rejects(h.svc.step({ ...access, token: "foreign", action: "resume" }));
});
test("free learning, duplicate next and source restrictions during play", async () => {
 const h = harness(); const d = await h.svc.prepare("teacher", { ...args, duration: 0 }); await h.svc.publish("teacher", { draftId: d.id, revision: d.revision, reviewed: true, rightsConfirmed: true });
 const s = await h.svc.start({ publicationId: d.id, requestId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa" }), access = { sessionId: s.sessionId, token: s.token }; const n = await h.svc.step({ ...access, action: "next", taskId: s.task.id }); const duplicate = await h.svc.step({ ...access, action: "next", taskId: s.task.id }); assert.equal(n.task.id, duplicate.task.id);
 h.tick(999999); assert.equal((await h.svc.step({ ...access, action: "resume" })).ended, false); h.source.rightsHold = true; await assert.rejects(h.svc.step({ ...access, action: "resume" }));
});
test("generic new semantic variants are reviewed and generated only once per request, never during play", async () => {
 const h = harness(), d = await h.svc.prepare("teacher", args); const generated = await h.svc.generate("teacher", { draftId: d.id, requestId: "gen-123456", sourceItemId: "b" }); assert.equal(h.calls(), 1); assert.ok(generated.items.some(i => i.task.left?.includes("Baum")));
 const again = await h.svc.generate("teacher", { draftId: d.id, requestId: "gen-123456", sourceItemId: "b" }); assert.equal(again.revision, generated.revision); assert.equal(h.calls(), 1);
 await assert.rejects(h.svc.publish("teacher", { draftId: d.id, revision: d.revision, reviewed: true, rightsConfirmed: true }));
 await h.svc.publish("teacher", { draftId: d.id, revision: generated.revision, reviewed: true, rightsConfirmed: true }); await h.svc.start({ publicationId: d.id, requestId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa" }); assert.equal(h.calls(), 1);
});
test("source change invalidates review and private immutable learning revision", async () => {
 const h = harness(), d = await h.svc.prepare("teacher", args); h.source.questions[0].numericAnswer = 6; await assert.rejects(h.svc.publish("teacher", { draftId: d.id, revision: d.revision, reviewed: true, rightsConfirmed: true }));
});
test("bounded generic buffers refill ahead, deduplicate and preserve current answer mapping",async()=>{
 const h=harness(),d=await h.svc.prepare('teacher',args);const first=await h.svc.generateBuffer('teacher',{draftId:d.id,requestId:'buffer-123456'});assert.equal(first.items.length,14);assert.equal(h.batchCalls(),1);
 await h.svc.generateBuffer('teacher',{draftId:d.id,requestId:'buffer-123456'});assert.equal(h.batchCalls(),1);
 await h.svc.publish('teacher',{draftId:d.id,revision:first.revision,reviewed:true,rightsConfirmed:true,autoVariants:true});
 let s=await h.svc.start({publicationId:d.id,requestId:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'});const access={sessionId:s.sessionId,token:s.token};
 for(let i=0;i<8;i++)s=await h.svc.step({...access,action:'next',taskId:s.task.id});
 await h.svc.refill(access);await h.svc.refill(access);assert.equal(h.queue.length,1);const before=s.task.id;await h.svc.processBuffer(h.queue[0]);assert.equal((await h.svc.step({...access,action:'resume'})).task.id,before);
 s=await h.svc.step({...access,action:'next',taskId:s.task.id});assert.equal(s.poolSize,26);
 for(let i=0;i<20;i++)s=await h.svc.step({...access,action:'next',taskId:s.task.id});await h.svc.refill(access);await h.svc.processBuffer(h.queue[1]);
 for(let i=0;i<40;i++)s=await h.svc.step({...access,action:'next',taskId:s.task.id});await h.svc.refill(access);assert.equal(h.queue.length,2);assert.equal(h.batchCalls(),3);assert.equal(s.ended,false);assert.match(s.notice,/Wiederholung/);
});
test("a queued buffer never starts paid generation after its last consumer countdown",async()=>{
 const h=harness(),d=await h.svc.prepare('teacher',{...args,duration:120});await h.svc.publish('teacher',{draftId:d.id,revision:d.revision,reviewed:true,rightsConfirmed:true,autoVariants:true});const s=await h.svc.start({publicationId:d.id,requestId:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'});await h.svc.refill({sessionId:s.sessionId,token:s.token});assert.equal(h.queue.length,1);h.tick(130000);await h.svc.processBuffer(h.queue[0]);assert.equal(h.batchCalls(),0);
});
test("guided learning binds mode and persists explanatory guided independent repetition stages privately",async()=>{
 const h=harness(),d=await h.svc.prepare('teacher',{...args,mode:'guided',duration:0});await h.svc.publish('teacher',{draftId:d.id,revision:d.revision,reviewed:true,rightsConfirmed:true});let s=await h.svc.start({publicationId:d.id,requestId:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'}),access={sessionId:s.sessionId,token:s.token};assert.equal(s.stage,'anschauen');assert.match(s.learning.explanation,/keine geprüfte Erklärung/);await h.svc.step({...access,action:'help',taskId:s.task.id});assert.equal((await h.svc.step({...access,action:'resume'})).progress.helpUsed,true);const stages=new Set([s.stage]);for(let i=0;i<8;i++){s=await h.svc.step({...access,action:'next',taskId:s.task.id});stages.add(s.stage);}assert.deepEqual([...stages],['anschauen','mitHilfe','selbständig','wiederholen']);assert.equal(s.mode,'guided');assert.equal(s.ended,false);
});
test("single-variant route cannot bypass selected output formats",async()=>{
 const h=harness(),d=await h.svc.prepare('teacher',{...args,formats:['gapfill']});await assert.rejects(h.svc.generate('teacher',{draftId:d.id,requestId:'gen-123456',sourceItemId:'b'}));assert.equal(h.calls(),0);
});
