import test from "node:test";
import assert from "node:assert/strict";
import { acceptedOrderingOrders, gradeOrdering, orderingNeedsReview, validOrder } from "./ordering-grading.mjs";

test("Satzbau accepts each listed valid word order with full credit", () => {
  const question = { text: "Bringe die Satzbausteine in die richtige Reihenfolge.", items: ["Mia", "spielt", "am Nachmittag", "im Garten"], acceptedOrders: [[2, 1, 0, 3], [0, 1, 3, 2]] };
  assert.deepEqual(gradeOrdering(question, [0, 1, 2, 3]), { good: 4, total: 4, correct: true });
  assert.deepEqual(gradeOrdering(question, [2, 1, 0, 3]), { good: 4, total: 4, correct: true });
  assert.deepEqual(gradeOrdering(question, [0, 1, 3, 2]), { good: 4, total: 4, correct: true });
  assert.equal(orderingNeedsReview(question), true);
});

test("partial score uses the best valid order and rejects duplicated indexes", () => {
  const question = { text: "Ordne die Schritte", items: ["A", "B", "C", "D"], acceptedOrders: [[2, 1, 0, 3], [0, 0, 1, 3]] };
  assert.deepEqual(acceptedOrderingOrders(question), [[0, 1, 2, 3], [2, 1, 0, 3]]);
  assert.deepEqual(gradeOrdering(question, [2, 1, 3, 0]), { good: 2, total: 4, correct: false });
  assert.equal(validOrder([0, 0, 1, 3], 4), false);
  assert.equal(orderingNeedsReview(question), false);
  assert.equal(orderingNeedsReview({ ...question, manualReview: true }), true);
});
