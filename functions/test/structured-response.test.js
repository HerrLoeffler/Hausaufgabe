"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { requestStructured, parseStructuredResponse } = require("../lib/structured-response");
const complete = data => ({ status: "completed", output_text: JSON.stringify(data), usage: { total_tokens: 4 } });

test("one empty, malformed or incomplete response is retried with accounting", async () => {
  for (const bad of [{ status: "completed", output_text: "" }, { status: "completed", output_text: "{broken" }, { status: "incomplete", output_text: "{}", incomplete_details: { reason: "max_output_tokens" } }]) {
    let calls = 0;
    const result = await requestStructured(async () => ++calls === 1 ? { ...bad, usage: { total_tokens: 3 } } : complete({ issues: [] }), {});
    assert.deepEqual(result.data, { issues: [] }); assert.equal(calls, 2); assert.equal(result.usage.total_tokens, 7);
  }
});
test("persistent unusable response stops after two attempts with diagnosis", async () => {
  let calls = 0;
  await assert.rejects(requestStructured(async () => { calls++; return complete(null); }, {}), err => err.code === "unavailable" && err.details.reason === "invalid-json");
  assert.equal(calls, 2);
});
test("refusals and content-filter responses are not retried", async () => {
  for (const response of [{ status: "completed", output: [{ content: [{ type: "refusal", refusal: "no" }] }] }, { status: "incomplete", incomplete_details: { reason: "content_filter" } }]) {
    let calls = 0;
    await assert.rejects(requestStructured(async () => { calls++; return response; }, {})); assert.equal(calls, 1);
  }
});
test("transport retries belong to the SDK; permanent errors do not loop", async () => {
  let calls = 0;
  await assert.rejects(requestStructured(async () => { calls++; throw Object.assign(new Error("Access denied"), { status: 401 }); }, {})); assert.equal(calls, 1);
});
test("completed JSON must contain an object", () => {
  for (const value of [null, [], "text", false, 42]) assert.throws(() => parseStructuredResponse(complete(value)));
});
