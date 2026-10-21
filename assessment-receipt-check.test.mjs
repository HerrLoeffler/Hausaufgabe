import test from 'node:test';
import assert from 'node:assert/strict';
import { assertReceiptMatches } from './assessment-receipt-check.mjs';

test('accepts direct and callable-wrapped receipts for the exact attempt', () => {
  const receipt = { attemptId: 'a_1', submissionId: 'a_1' };
  assert.equal(assertReceiptMatches(receipt, 'a_1'), receipt);
  assert.equal(assertReceiptMatches({receipt}, 'a_1'), receipt);
});
test('rejects another pupils receipt even when repeated submits agree', () => {
  assert.throws(() => assertReceiptMatches({receipt:{ attemptId: 'a_2', submissionId:'a_2' }}, 'a_1'), e => e.code === 'receipt-attempt-mismatch');
});
test('rejects absent and internally conflicting identifiers', () => {
  for(const receipt of [null,{}, {attemptId:'a_1'}, {submissionId:'a_1'}, {attemptId:'a_1',submissionId:'a_2'}]) {
    assert.throws(() => assertReceiptMatches(receipt, 'a_1'));
  }
});
