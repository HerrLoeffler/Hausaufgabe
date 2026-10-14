"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { compileQuestion, present, check, nextItem, assertSource } = require("../lib/wissensreise-core");
test("two source questions supply tasks throughout a 180 second round", () => {
  const items = [compileQuestion({ type: "number", text: "2 + 3 = ?", numericAnswer: 5 }), compileQuestion({ type: "number", text: "3 * 4 = ?", numericAnswer: 12 })];
  const seen = new Set();
  for (let second = 0; second < 180; second++) { const task = nextItem(items, second); assert.ok(task); seen.add(task.text); assert.equal(check(task, task.key).correct, true); }
  assert.ok(seen.size > 20);
});
test("negative arithmetic and integer division retain correct keys and signs", () => {
  for (const q of [{ text: "-3 - -2 = ?", numericAnswer: -1 }, { text: "12 / 3 = ?", numericAnswer: 4 }]) {
    const item = compileQuestion({ type: "number", ...q });
    for (let seed = 0; seed < 100; seed++) { const task = present(item, seed); assert.ok(Number.isFinite(task.key)); assert.equal(check(task, String(task.key).replace('.', ',')).correct, true); if (q.text.includes('/')) assert.equal(task.key % 1, 0); }
  }
});
test("matching preserves wordclass and sentencepart semantics across permutations", () => {
  for (const pairs of [[{ left: "Haus", right: "Nomen" }, { left: "laufen", right: "Verb" }, { left: "schön", right: "Adjektiv" }], [{ left: "Der Hund", right: "Subjekt" }, { left: "schläft", right: "Prädikat" }, { left: "im Garten", right: "Adverbiale" }]]) {
    const item = compileQuestion({ type: "matching", text: "Ordne zu", pairs });
    const displays = new Set();
    for (let seed = 0; seed < 30; seed++) { const task = present(item, seed); displays.add(JSON.stringify(task.public)); assert.equal(check(task, task.type === "ordering" ? task.key[0] : task.key).correct, true); assert.equal(JSON.stringify(task.public).includes('key'), false); }
    assert.ok(displays.size > 2);
  }
});
test("shuffled choice keys, ordering and gapfill keys remain server side", () => {
  const qs = [{ type: "single", text: "Hauptstadt Frankreich?", options: [{ text: "Paris", correct: true }, { text: "Rom", correct: false }] }, { type: "ordering", text: "Ordne", items: ["A", "B", "C"] }, { type: "gapfill", text: "Der Hund [bellt]." }];
  for (const q of qs) for (let seed = 0; seed < 25; seed++) { const task = present(compileQuestion(q), seed); const answer = task.type === "ordering" ? task.key[0] : task.type === "gapfill" ? task.key.map(k=>k[0]) : task.key; assert.equal(check(task, answer).correct, true); assert.equal(JSON.stringify(task.public).includes('correct'), false); }
});
test("unknown, manual review and media dependent tasks fail honestly", () => {
  for (const q of [{ type: "mystery", text: "?" }, { type: "text", text: "?", manualReview: true }, { type: "number", text: "siehe Bild", numericAnswer: 2, imageUrl: "private" }]) assert.throws(() => compileQuestion(q));
});
test("only own inactive nonheld sources may be copied", () => {
  assert.doesNotThrow(() => assertSource({ ownerId: "t", ended: true, published: true }, "t"));
  for (const patch of [{ ownerId: "other" }, { published: true }, { rightsHold: true }, { isDeleted: true }]) assert.throws(() => assertSource({ ownerId: "t", ...patch }, "t"));
});
test("stored gap alternatives and stored accepted order objects preserve source contracts", () => {
 const gap = present(compileQuestion({ type: "gapfill", text: "Farbe [rot|red]." }), 1);
 assert.equal(check(gap,["rot"]).correct,true); assert.equal(check(gap,["red"]).correct,true); assert.equal(check(gap,["rot|red"]).correct,false);
 const order = present(compileQuestion({ type: "ordering", text: "Ordne", items:["A","B"], acceptedOrders:[{indices:[1,0]}] }),1); assert.equal(check(order,order.key[0]).correct,true);
});
test("ambiguous answer and group labels are rejected, public IDs do not contain RNG seeds", () => {
 assert.throws(() => compileQuestion({type:"single",text:"?",options:[{text:"Paris",correct:true},{text:"Paris",correct:false}]}));
 assert.throws(() => compileQuestion({type:"grouping",text:"?",groups:[{name:"Wort",items:["Haus"]},{name:"Wort",items:["Hund"]}]}));
 assert.doesNotMatch(present(compileQuestion({type:"ordering",text:"?",items:["A","B","C"]}),123456).id,/123456/);
});
test("plain and four-color marking preserve punctuation and private exact word assignments",()=>{
 const q={type:'markwords',text:'Markiere Wortarten',passage:'Der Hund läuft schnell.',targetWords:['Hund'],markGroups:[{name:'Nomen',color:'blue',words:['Hund']},{name:'Verb',color:'orange',words:['läuft']},{name:'Adjektiv',color:'green',words:['schnell']},{name:'Artikel',color:'purple',words:['Der']}]};const t=present(compileQuestion(q),8);assert.equal(check(t,t.key).correct,true);assert.equal(t.public.markGroups.length,4);assert.equal(JSON.stringify(t.public).includes('targetWords'),false);assert.throws(()=>compileQuestion({...q,markGroups:[...q.markGroups,{name:'Andere',color:'blue',words:['Hund']}]}));
 const plain=present(compileQuestion({...q,markGroups:[]}),8);assert.equal(check(plain,plain.key).correct,true);
});
