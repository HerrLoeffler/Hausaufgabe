"use strict";const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('packaged chapter rules match the single shared source',()=>{assert.equal(fs.readFileSync(require.resolve('../lib/shared/chapter-contract'),'utf8'),fs.readFileSync(require.resolve('../../shared/chapter-contract'),'utf8'));});
