"use strict";
const test = require("node:test"); const assert = require("node:assert/strict");
const { validateQuestion, validateTest, normalizeQuestion } = require("../lib/validation");
function base(type="single") { return normalizeQuestion({ type, text:"Frage?", points:1, options:[{text:"A",correct:true},{text:"B",correct:false}], acceptedAnswers:["x"], manualReview:false, correctBoolean:true, pairs:[{left:"a",right:"b"},{left:"c",right:"d"}], items:["a","b"], groups:[{name:"A",items:["a"]},{name:"B",items:["b"]}], passage:"Haus geht", targetWords:["Haus"], numericAnswer:2, tolerance:0, unit:"", mediaIntent:{kind:"none",prompt:"",altText:"",count:0,sourceMaterialId:"",reason:""} }); }
test("valid single",()=>assert.deepEqual(validateQuestion(base()),[]));
test("invalid single with two correct",()=>{const q=base(); q.options[1].correct=true; assert.ok(validateQuestion(q).length);});
test("points require half steps",()=>{const q=base(); q.points=1.3; assert.ok(validateQuestion(q).some(x=>x.includes("0,5")));});
test("no images blocks media",()=>{const q=base(); q.mediaIntent.kind="ai_generated"; assert.ok(validateQuestion(q,{allowImages:false}).length);});
test("image choices obey switch",()=>{const q=base(); q.mediaIntent={kind:"image_choices",prompt:"x",altText:"x",count:4,sourceMaterialId:"",reason:"x"}; assert.ok(validateQuestion(q,{allowImageChoices:false}).length);});
test("uploaded crop requires material id",()=>{const q=base(); q.mediaIntent={kind:"uploaded_crop",prompt:"",altText:"x",count:0,sourceMaterialId:"m1",reason:"x"}; assert.ok(validateQuestion(q,{materialIds:[]}).length);});
test("test detects duplicate questions",()=>assert.ok(validateTest({title:"T",questions:[base(),base()]}).some(x=>x.includes("identisch"))));