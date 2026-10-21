"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createQuickRemyService } = require("../lib/quick-remy-flow");
const request = { auth: { uid: "teacher" }, data: { requestId: "plan-1", conversationText: "Bitte sechs Kapitel aus meinen Notizen", knownFields: { subject: "Mathematik", grade: "6", topic: "Brüche", count: 12 }, chapterPlanning: { points: 18, schoolType: "Mittelschule", region: "Bayern" } } };
const plan = () => ({ chapters: Array.from({ length: 6 }, (_, i) => ({ title: `Kapitel ${i + 1}`, topic: `Brüche Teil ${i + 1}`, count: 2, points: 3 })) });
function fixture(data = plan()) {
  const events = [];
  const service = createQuickRemyService({ requireUser: async r => { if (!r.auth) throw Object.assign(new Error("auth"), { code: "unauthenticated" }); return { uid: "teacher", profile: {} }; }, consumeQuota: async () => events.push("quota"), interpret: async args => { events.push(args); return { data, usage: { total_tokens: 12 } }; }, recordUsage: async (...args) => events.push(args) });
  return { service, events };
}
test("chapter planning infers chapter count, generates IDs and conserves question/point totals", async () => {
  const { service, events } = fixture();
  const result = await service.prepare(request);
  assert.equal(result.status, "chapterPlan");
  assert.equal(result.chapterSchemaVersion, 1);
  assert.equal(result.chapters.length, 6);
  assert.equal(new Set(result.chapters.map(c => c.id)).size, 6);
  assert.deepEqual(result.chapters.map(c => c.position), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(result.chapterPlan.map(p => p.chapterId), result.chapters.map(c => c.id));
  assert.equal(result.chapterPlan.reduce((n, p) => n + p.count, 0), 12);
  assert.equal(result.chapterPlan.reduce((n, p) => n + p.points, 0), 18);
  assert.ok(result.chapterPlan.every(p => p.materialIds.length === 0));
  assert.ok(result.pedagogicalContext.status);
  assert.equal(events[0], "quota");
  assert.ok(events[1].pedagogicalContext);
});
test("chapter planning rejects invalid totals, half-points, missing titles, duplicate topics and explicit chapter mismatch", async () => {
  for (const alter of [p => p.chapters[0].count++, p => p.chapters[0].points++, p => p.chapters[0].points = 2.25, p => p.chapters[0].title = "", p => p.chapters[0].topic = p.chapters[1].topic, p => p.chapters = []]) {
    const value = plan(); alter(value);
    await assert.rejects(fixture(value).service.prepare(request), { code: "invalid-argument" });
  }
  await assert.rejects(fixture().service.prepare({ ...request, data: { ...request.data, chapterPlanning: { ...request.data.chapterPlanning, chapterCount: 5 } } }), { code: "invalid-argument" });
});
test("planning permits 6000 text characters while rejecting invalid input before provider/quota", async () => {
  assert.equal((await fixture().service.prepare({ ...request, data: { ...request.data, conversationText: "x".repeat(6000) } })).status, "chapterPlan");
  for (const change of [{ conversationText: "x".repeat(6001) }, { chapterPlanning: { points: 2.25 } }, { knownFields: { ...request.data.knownFields, count: null } }]) {
    const f = fixture();
    await assert.rejects(f.service.prepare({ ...request, data: { ...request.data, ...change } }), { code: "invalid-argument" });
    assert.equal(f.events.length, 0);
  }
  await assert.rejects(fixture().service.prepare({ data: request.data }), { code: "unauthenticated" });
});
test("missing curriculum context stays explicit and valid half-point allocations survive", async () => {
  const data = plan(); data.chapters[0].points = 2.5; data.chapters[1].points = 3.5;
  const result = await fixture(data).service.prepare({ ...request, data: { ...request.data, chapterPlanning: { points: 18 } } });
  assert.equal(result.pedagogicalContext.status, "invalid_context");
  assert.equal(result.pedagogicalContext.profileCount, 0);
  assert.equal(result.chapterPlan[0].points, 2.5);
});
test("invalid generated chapter plans record provider usage as failure without saving notes", async () => {
  const f = fixture({ chapters: [] });
  await assert.rejects(f.service.prepare(request), { code: "invalid-argument" });
  const log = f.events.at(-1);
  assert.equal(log[3].failed, true);
  assert.equal(log[2].total_tokens, 12);
  assert.equal(JSON.stringify(log).includes("Bitte sechs Kapitel"), false);
});
test("chapter planning normalizes the optional content language with the existing locale contract", async () => {
  const { normalizePrepareRequest } = require("../lib/quick-remy-contract");
  assert.equal(normalizePrepareRequest(request.data).chapterPlanning.contentLocale, "de-DE");
  assert.equal(normalizePrepareRequest({ ...request.data, chapterPlanning: { ...request.data.chapterPlanning, contentLocale: "en-GB" } }).chapterPlanning.contentLocale, "en-GB");
});
test("prepared plan flows into real generation slots and shared publication validation", async () => {
  const { planChapterSlots } = require("../lib/chapter-generation");
  const { validateChapterStructure } = require("../../shared/chapter-contract");
  const result = await fixture().service.prepare(request);
  const slots = planChapterSlots({ ...result, count: 12, points: 18 }, []);
  assert.equal(slots.length, 12);
  assert.equal(slots.reduce((sum, slot) => sum + slot.points, 0), 18);
  const questions = slots.map((slot, i) => ({ id: `q_${i}`, chapterId: slot.chapterId, points: slot.points }));
  assert.deepEqual(validateChapterStructure(result, questions), { enabled: true, errors: [] });
});
test("explicit spoken chapter counts are validated before provider work and enforced on output", async () => {
  for (const text of ["sechs Kapitel zu Brüchen", "six chapters about fractions", "6 Kapitel zu Brüchen"]) {
    const f = fixture();
    await f.service.prepare({ ...request, data: { ...request.data, conversationText: text } });
    assert.equal(f.events[1].chapterPlanning.chapterCount, 6);
    const bad = plan(); bad.chapters.pop(); bad.chapters[0].count += 2; bad.chapters[0].points += 3;
    await assert.rejects(fixture(bad).service.prepare({ ...request, data: { ...request.data, conversationText: text } }), { code: "invalid-argument" });
  }
  const f = fixture();
  await assert.rejects(f.service.prepare({ ...request, data: { ...request.data, conversationText: "13 Kapitel zu Brüchen" } }), { code: "invalid-argument" });
  assert.equal(f.events.length, 0);
});
test("numbered chapter descriptions never become a chapter count and API counts stay authoritative", () => {
  const { normalizePrepareRequest } = require("../lib/quick-remy-contract");
  assert.equal(normalizePrepareRequest({ ...request.data, conversationText: "Kapitel 1 Brüche, Kapitel 2 Dezimalzahlen" }).chapterPlanning.chapterCount, undefined);
  assert.equal(normalizePrepareRequest({ ...request.data, conversationText: "six chapters", chapterPlanning: { ...request.data.chapterPlanning, chapterCount: 3 } }).chapterPlanning.chapterCount, 3);
  assert.throws(() => normalizePrepareRequest({ ...request.data, conversationText: "sechs Kapitel, oder fünf Kapitel" }), { code: "invalid-argument" });
});
