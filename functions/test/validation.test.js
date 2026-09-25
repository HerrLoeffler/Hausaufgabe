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
test("test detects duplicate questions",()=>assert.ok(validateTest({title:"T",questions:[base(),base()]}).some(x=>x.includes("wiederholt"))));
test("equivalent phrasing with the same answer is rejected",()=>{
  const first=base(); first.text="Wähle den Schal aus."; first.options=[{text:"Schal",correct:true},{text:"Gürtel",correct:false}];
  const second=base(); second.text="Welches Bild zeigt den Schal?"; second.options=[{text:"Gürtel",correct:false},{text:"Schal",correct:true}];
  assert.ok(validateTest({title:"T",questions:[first,second]}).some(x=>x.includes("wiederholt")));
  assert.ok(validateTest({title:"T",questions:[second]},{referenceQuestions:[first]}).some(x=>x.includes("Ausgangstests")));
});
test("other skills may reuse an answer without being rejected",()=>{
  const first=base(); first.text="Wähle den Schal aus."; first.options=[{text:"Schal",correct:true},{text:"Gürtel",correct:false}];
  const second=base(); second.text="Was trägt man bei Frost am Hals?"; second.options=first.options;
  assert.deepEqual(validateTest({title:"T",questions:[first,second]}),[]);
  second.type="gapfill"; second.text="Am Hals trägt man einen [Schal].";
  assert.deepEqual(validateTest({title:"T",questions:[first,second]}),[]);
});
test("identical question with the same solution is detected across text and image formats",()=>{
  const first=base(); first.text="Welches Tier lebt im Wasser?"; first.options=[{text:"Fisch",correct:true},{text:"Katze",correct:false}];
  const second=base("text"); second.text="Welches Tier lebt im Wasser?"; second.acceptedAnswers=["Fisch"]; second.mediaIntent={kind:"ai_generated",prompt:"Tiere im See",altText:"Tiere",count:1,sourceMaterialId:"",reason:""};
  assert.ok(validateTest({title:"T",questions:[first,second]}).some(x=>x.includes("wiederholt")));
});
test("duplicated answer options are invalid",()=>{
  const q=base(); q.options=[{text:"Schal",correct:true},{text:"schal!",correct:false}];
  assert.ok(validateQuestion(q).some(x=>x.includes("eindeutig")));
  q.options=[{text:"a scarf",correct:true},{text:"scarf",correct:false}];
  assert.ok(validateQuestion(q).some(x=>x.includes("eindeutig")));
});
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
test("a comma-count question cannot already show the counted commas",()=>{
  const q=base("number"); q.text="Wie viele Kommas müssen in diesem Satz stehen? „Weil es regnete, blieben wir zu Hause, obwohl wir gern spazieren gegangen wären.“";
  assert.ok(validateQuestion(q).some(x=>x.includes("noch keine Kommas")));
  q.text="Wie viele Kommas müssen in diesem Satz stehen? „Weil es regnete blieben wir zu Hause obwohl wir gern spazieren gegangen wären.“";
  assert.deepEqual(validateQuestion(q),[]);
  q.text="Wie viele Kommas fehlen, wenn du den Satz liest? „Weil es regnete blieben wir zu Hause.“";
  assert.deepEqual(validateQuestion(q),[]);
});
test("single-image answers reject the already disclosed spatial relation",()=>{
  const q=base(); q.mediaIntent.kind="image_choices"; q.mediaIntent.count=2;
  q.text="Das Bild zeigt ein Buch unter einem Tisch. Welche Präposition beschreibt die Lage des Buches richtig?";
  q.options=[{text:"Buch unter dem Tisch",correct:true},{text:"Buch auf dem Tisch",correct:false}];
  assert.ok(validateQuestion(q).some(x=>x.includes("räumliche Beziehung")));
  q.text="Welche Abbildung zeigt ein Buch an der richtigen Stelle zum Tisch?";
  assert.deepEqual(validateQuestion(q),[]);
  q.text="Welche Abbildung zeigt ein Buch unter einem Tisch?";
  assert.deepEqual(validateQuestion(q),[]); // The scene is the target of an image-recognition task.
});
test("a single image cannot convey the temporal meaning of wieder",()=>{
  const q=base(); q.mediaIntent.kind="image_choices"; q.mediaIntent.count=2;
  q.text="Welche Abbildung passt zur Bedeutung von ‚wieder‘ in ‚Der Junge kommt wieder nach Hause‘?";
  q.options=[{text:"Junge vor Haustür",correct:true},{text:"Junge vor Mauer",correct:false}];
  assert.ok(validateQuestion(q).some(x=>x.includes("einzelnen Bild")));
  q.text="Welche Abbildung zeigt einen Jungen vor einer Haustür?";
  assert.deepEqual(validateQuestion(q),[]);
});
