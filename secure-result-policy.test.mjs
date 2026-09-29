import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("secure-result-policy.js", "utf8");

test("pending manual review never displays a provisional score as final", () => {
  assert.match(source, /Bewertung folgt/);
  assert.match(source, /secureResultScore/);
  assert.match(source, /secureResultMeta/);
  assert.match(source, /\.remove\(\)/);
  assert.match(source, /Punkte, Prozentwert und Note werden erst angezeigt/);
});

test("policy activates only for pending review receipts", () => {
  assert.match(source, /pendingReview = title\.includes\("Bewertung folgt"\)/);
  assert.match(source, /if \(!pendingReview\) return/);
});
