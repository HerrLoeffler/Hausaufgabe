import test from 'node:test';
import assert from 'node:assert/strict';
import {ReviewError} from './core.mjs';
test('fachlicher HTTP-Konflikt ist kein Firestore-Aborted-Transportcode',()=>{
 const error=new ReviewError(409,'Bitte aktualisieren.');
 assert.equal(error.httpStatus,409);
 assert.equal(error.code,undefined);
 // Firestore 9.2 treats numeric .code === 409 as a retryable GAXIOS ABORTED.
 assert.notEqual(error.code,409);
});
