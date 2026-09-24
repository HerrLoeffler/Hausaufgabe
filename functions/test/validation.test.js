"use strict";
const test = require("node:test"); const assert = require("node:assert/strict");
const { validateQuestion, validateTest, normalizeQuestion } = require("../lib/validation");
function base(type="single") { return normalizeQuestion({ type, text:"Frage?", points:1, options:[{text:"A",correct:true},{text:"B",correct:false}], acceptedAnswers:["x"], manualReview:false, correctBoolean:true, pairs:[{left:"a",right:"b"},{left:"c",right:"d"}], items:["a","b"], groups:[{name:"A",items:["a"]},{name:"B",items:["b"]}], passage:"Haus geht", targetWords:["Haus"], numericAnswer:2, tolerance:0, unit:"", mediaIntent:{kind:"none",prompt:"",altText:"",count:0,sourceMaterialId:"",reason:""} }); }
test("valid single",()=>assert.deepEqual(validateQuestion(base()),[]));
test("invalid single with two correct",()=>{const q=base(); q.options[1].correct=true; assert.ok(validateQuestion(q).length);});
test("points require half steps",()=>{const q=base(); q.points=1.3; assert.ok(validateQuestion(q).some(x=>x.includes("0,5")));});
test("no images blocks media",()=>{const q=base(); q.mediaIntent.kind="ai_generated"; assert.ok(validateQuestion(q,{allowImages:false}).length);});
test("image choices obey switch",()=>{const q=base(); q.mediaIntent={kind:"image_choices",prompt:"x",altText:"x",count:4,sourceMaterialId:"",reason:"x"}; assert.ok(validateQuestion(q,{allowImageChoices:false}).length);});
test("unsupported uploaded crop cannot silently lose a requested image",()=>{const q=base(); q.mediaIntent={kind:"uploaded_crop",prompt:"",altText:"x",count:0,sourceMaterialId:"m1",reason:"x"}; assert.ok(validateQuestion(q,{materialIds:["m1"]}).some(x=>x.includes("nicht automatisch")));});
test("test detects duplicate questions",()=>assert.ok(validateTest({title:"T",questions:[base(),base()]}).some(x=>x.includes("identisch"))));
test("exact image counts reject a draft without requested images",()=>{
  const q=base();
  assert.ok(validateTest({title:"T",questions:[q]},{imageQuestionCount:1,imageAnswerQuestionCount:0}).some(x=>x.includes("1 Aufgaben mit einem Bild")));
  q.mediaIntent={kind:"ai_generated",prompt:"Sachillustration zu A",altText:"A",count:1,sourceMaterialId:"",reason:""};
  assert.deepEqual(validateTest({title:"T",questions:[q]},{imageQuestionCount:1,imageAnswerQuestionCount:0,maxVisualQuestions:1}),[]);
});
test("image answers require 2 to 4 options with matching count and supported question type",()=>{
  const q=base(); q.mediaIntent={kind:"image_choices",prompt:"",altText:"",count:4,sourceMaterialId:"",reason:""};
  assert.ok(validateQuestion(q).some(x=>x.includes("eines pro Antwortoption")));
  q.mediaIntent.count=2;
  assert.deepEqual(validateTest({title:"T",questions:[q]},{imageQuestionCount:0,imageAnswerQuestionCount:1,maxVisualQuestions:1}),[]);
  q.type="dropdown";
  assert.ok(validateQuestion(q).some(x=>x.includes("Single Choice")));
});
