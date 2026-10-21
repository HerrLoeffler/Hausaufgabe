"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { buildAssessmentContract } = require("../lib/assessment-core");
const { decodeSubmissionAnswers } = require("../lib/teacher-answer-decoder");

const SECRET = "teacher_decoder_server_secret_ABCDEFGHIJKLMNOPQRSTUVWXYZ_123456";

const questions = [
  { id: "single", type: "single", text: "S", points: 1, options: [{ text: "A", correct: false }, { text: "B", correct: true }] },
  { id: "multi", type: "multi", text: "M", points: 2, options: [{ text: "A", correct: true }, { text: "B", correct: false }, { text: "C", correct: true }] },
  { id: "match", type: "matching", text: "Match", points: 2, pairs: [{ left: "L1", right: "R1" }, { left: "L2", right: "R2" }] },
  { id: "order", type: "ordering", text: "Order", points: 2, items: ["One", "Two", "Three"] },
  { id: "group", type: "grouping", text: "Group", points: 2, groups: [{ name: "G1", items: ["A", "B"] }, { name: "G2", items: ["C"] }] },
  { id: "text", type: "text", text: "Text", points: 1, acceptedAnswers: ["yes"] },
  { id: "gap", type: "gapfill", text: "I [am] here", points: 1 },
  { id: "mark", type: "markwords", text: "Mark", passage: "A dog runs.", targetWords: ["dog"], points: 1 }
];

test("opaque answers are decoded to the legacy format expected by teacher result UI", () => {
  const { paper } = buildAssessmentContract(questions, SECRET);
  const byId = Object.fromEntries(paper.map(q => [q.id, q]));

  const rightByText = Object.fromEntries(byId.match.rightItems.map(item => [item.text, item.id]));
  const groupByName = Object.fromEntries(byId.group.groups.map(group => [group.name, group.id]));
  const groupItemByText = Object.fromEntries(byId.group.items.map(item => [item.text, item.id]));
  const orderByText = Object.fromEntries(byId.order.items.map(item => [item.text, item.id]));

  const secureAnswers = {
    single: byId.single.options.find(option => option.text === "B").id,
    multi: byId.multi.options.filter(option => ["A", "C"].includes(option.text)).map(option => option.id),
    match: {
      [byId.match.leftItems.find(item => item.text === "L1").id]: rightByText.R1,
      [byId.match.leftItems.find(item => item.text === "L2").id]: rightByText.R2
    },
    order: [orderByText.One, orderByText.Two, orderByText.Three],
    group: {
      [groupItemByText.A]: groupByName.G1,
      [groupItemByText.B]: groupByName.G1,
      [groupItemByText.C]: groupByName.G2
    },
    text: "yes",
    gap: ["am"],
    mark: ["1"]
  };

  const decoded = decodeSubmissionAnswers(questions, secureAnswers, SECRET);
  assert.equal(decoded.single, "1");
  assert.deepEqual(decoded.multi, ["0", "2"]);
  assert.deepEqual(decoded.match, { 0: "0", 1: "1" });
  assert.deepEqual(decoded.order, ["0", "1", "2"]);
  assert.deepEqual(decoded.group, { g0_i0: "0", g0_i1: "0", g1_i0: "1" });
  assert.equal(decoded.text, "yes");
  assert.deepEqual(decoded.gap, ["am"]);
  assert.deepEqual(decoded.mark, ["1"]);
});

test("unknown opaque ids decode to blanks instead of leaking or inventing indexes", () => {
  const decoded = decodeSubmissionAnswers(questions, {
    single: "attacker-value",
    multi: ["attacker-value"],
    match: { attacker: "attacker" },
    order: ["attacker-value"],
    group: { attacker: "attacker" }
  }, SECRET);
  assert.equal(decoded.single, "");
  assert.deepEqual(decoded.multi, []);
  assert.deepEqual(decoded.match, { 0: "", 1: "" });
  assert.deepEqual(decoded.order, []);
  assert.deepEqual(decoded.group, { g0_i0: "", g0_i1: "", g1_i0: "" });
});
