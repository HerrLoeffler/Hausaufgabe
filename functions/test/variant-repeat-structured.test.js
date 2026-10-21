"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeQuestion, variantRepeats } = require("../lib/validation");

function media() { return { kind:"none", prompt:"", altText:"", count:0, sourceMaterialId:"", reason:"" }; }

test("matching variants may reuse the same instruction when the pairs are genuinely new", () => {
  const original = normalizeQuestion({
    type:"matching", text:"Ordne die englischen Wörter den deutschen Bedeutungen zu.", points:4,
    pairs:[{left:"red",right:"rot"},{left:"blue",right:"blau"},{left:"green",right:"grün"}], mediaIntent:media()
  });
  const variant = normalizeQuestion({
    type:"matching", text:"Ordne die englischen Wörter den deutschen Bedeutungen zu.", points:4,
    pairs:[{left:"yellow",right:"gelb"},{left:"black",right:"schwarz"},{left:"white",right:"weiß"}], mediaIntent:media()
  });
  assert.equal(variantRepeats(original, variant), false);
});

test("matching variants still reject the same pairs even when their order changes", () => {
  const original = normalizeQuestion({
    type:"matching", text:"Ordne die englischen Wörter den deutschen Bedeutungen zu.", points:4,
    pairs:[{left:"red",right:"rot"},{left:"blue",right:"blau"}], mediaIntent:media()
  });
  const duplicate = normalizeQuestion({
    type:"matching", text:"Ordne die englischen Wörter den deutschen Bedeutungen zu.", points:4,
    pairs:[{left:"blue",right:"blau"},{left:"red",right:"rot"}], mediaIntent:media()
  });
  assert.equal(variantRepeats(original, duplicate), true);
});

test("grouping variants may keep a generic instruction when their content changes", () => {
  const original = normalizeQuestion({
    type:"grouping", text:"Ordne die Wörter den passenden Gruppen zu.", points:4,
    groups:[{name:"Farben",items:["red","blue"]},{name:"Tiere",items:["cat","dog"]}], mediaIntent:media()
  });
  const variant = normalizeQuestion({
    type:"grouping", text:"Ordne die Wörter den passenden Gruppen zu.", points:4,
    groups:[{name:"Schulsachen",items:["book","pen"]},{name:"Zahlen",items:["one","two"]}], mediaIntent:media()
  });
  assert.equal(variantRepeats(original, variant), false);
});
