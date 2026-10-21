import test from "node:test";
import assert from "node:assert/strict";
import { acceptedOrderingOrders, gradeOrdering, orderingNeedsReview, validOrder, orderingVariantsForStorage } from "./ordering-grading.mjs";

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

test('grammar-only English sentence accepts adjective-swapped meaning as a listed solution', () => {
  const question={text:'Bringe die englischen Wörter in die richtige Reihenfolge. Achte auf die Grammatik.',items:['The','purple','cars','are','not','hungry'],acceptedOrders:[[0,5,2,3,4,1]],manualReview:true};
  assert.equal(gradeOrdering(question,[0,1,2,3,4,5]).correct,true);
  assert.equal(gradeOrdering(question,[0,5,2,3,4,1]).correct,true);
  assert.equal(gradeOrdering(question,[0,5,3,2,4,1]).correct,false);
});

test('persisted alternative orders preserve complete and partial grading after reload', () => {
  const question = { items: ['A', 'B', 'C'], acceptedOrders: orderingVariantsForStorage([[2, 1, 0]]) };
  const loaded = JSON.parse(JSON.stringify(question));
  assert.equal(gradeOrdering(loaded, [2, 1, 0]).correct, true);
  assert.deepEqual(gradeOrdering(loaded, [2, 0, 1]), { good: 1, total: 3, correct: false });
});
