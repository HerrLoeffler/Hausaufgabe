"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  tokenHash,
  secureTokenMatches,
  buildAssessmentContract,
  gradeSubmission,
  gradeFromPercent,
  sanitizeAnswersForStorage,
  assertNoSolutionLeak
} = require("../lib/assessment-core");

test("public metadata carries only the fixed assessment content locale", () => {
  const { publicQuizMetadata } = require("../lib/assessment-core");
  assert.equal(publicQuizMetadata({ contentLocale: "en-GB", gradingLocale: "de-DE" }, "Q").contentLocale, "en-GB");
  assert.equal(publicQuizMetadata({ contentLocale: "de-DE", uiLocale: "en-GB" }, "Q").contentLocale, "de-DE");
  assert.equal(publicQuizMetadata({ contentLocale: "en-US" }, "Q").contentLocale, "en-GB");
  for (const contentLocale of [undefined, "", "fr-FR"]) {
    assert.equal(publicQuizMetadata({ contentLocale, uiLocale: "en-GB" }, "Q").contentLocale, "de-DE");
  }
});

test("public paper preserves authored image copy and leaves missing alt for content-locale rendering", () => {
  const source = [{ id: "images", type: "single", text: "Choose", points: 1,
    imageUrl: "https://example.test/question.png", imageChoicesOnly: true,
    options: [{ text: "authored", imageUrl: "https://example.test/a.png", imageAlt: "Original description", correct: true },
      { text: "other", imageUrl: "https://example.test/b.png" }] }];
  const before = JSON.stringify(source);
  const { paper } = buildAssessmentContract(source, PAPER_SECRET, { shuffleAnswers: true });
  assert.equal(paper[0].image.alt, "");
  assert.equal(paper[0].imageChoicesOnly, true);
  assert.equal(paper[0].options.find(o => o.text === "authored").image.alt, "Original description");
  assert.equal(paper[0].options.find(o => o.text === "other").image.alt, "");
  assert.equal(assertNoSolutionLeak(paper), true);
  assert.equal(JSON.stringify(source), before);
});

const CLIENT_TOKEN = "abcdefghijklmnopqrstuvwxyzABCDE_1234567890";
const PAPER_SECRET = "server_only_paper_secret_ABCDEFGHIJKLMNOPQRSTUVWXYZ_1234567890";
const OTHER_PAPER_SECRET = "another_server_secret_ZYXWVUTSRQPONMLKJIHGFEDCBA_9876543210";

function sampleQuestions() {
  return [
    {
      id: "single", position: 1, type: "single", text: "Choose blue", points: 1,
      options: [{ text: "red", correct: false }, { text: "blue", correct: true }, { text: "green", correct: false }]
    },
    {
      id: "multi", position: 2, type: "multi", text: "Choose vowels", points: 2,
      options: [{ text: "A", correct: true }, { text: "B", correct: false }, { text: "E", correct: true }]
    },
    {
      id: "text", position: 3, type: "text", text: "Capital of Bavaria?", points: 1,
      acceptedAnswers: ["München", "Munich"], manualReview: false
    },
    {
      id: "manual", position: 4, type: "text", text: "Explain your reasoning.", points: 2,
      acceptedAnswers: [], manualReview: true
    },
    {
      id: "number", position: 5, type: "number", text: "2+2", points: 1,
      numericAnswer: 4, tolerance: 0, unit: ""
    },
    {
      id: "tf", position: 6, type: "truefalse", text: "Earth is round.", points: 1,
      correctBoolean: true
    },
    {
      id: "gap", position: 7, type: "gapfill", text: "I [am|'m] here and you [are|'re] there.", points: 2
    },
    {
      id: "match", position: 8, type: "matching", text: "Match", points: 2,
      pairs: [{ left: "Germany", right: "Berlin" }, { left: "France", right: "Paris" }]
    },
    {
      id: "order", position: 9, type: "ordering", text: "Put in order", points: 2,
      items: ["first", "second", "third"], acceptedOrders: [[0, 2, 1]]
    },
    {
      id: "group", position: 10, type: "grouping", text: "Group", points: 2,
      groups: [
        { name: "Animals", items: ["Dog", "Cat"] },
        { name: "Plants", items: ["Oak"] }
      ]
    },
    {
      id: "mark", position: 11, type: "markwords", text: "Mark nouns", points: 2,
      passage: "The dog runs to school.", targetWords: ["dog", "school"]
    }
  ];
}

test("attempt token is stored only as a one-way hash", () => {
  const hash = tokenHash(CLIENT_TOKEN);
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.notEqual(hash, CLIENT_TOKEN);
  assert.equal(secureTokenMatches(CLIENT_TOKEN, hash), true);
  assert.equal(secureTokenMatches(`${CLIENT_TOKEN}x`, hash), false);
});

test("student paper contains no direct solution fields across every supported interaction", () => {
  const { paper } = buildAssessmentContract(sampleQuestions(), PAPER_SECRET);
  assert.equal(assertNoSolutionLeak(paper), true);
  const raw = JSON.stringify(paper);
  assert.doesNotMatch(raw, /acceptedAnswers|correctBoolean|numericAnswer|targetWords|acceptedOrders|gradingKey|answerKey/);
  assert.doesNotMatch(raw, /München|Munich/);
  assert.doesNotMatch(raw, /\[am\|'m\]|\[are\|'re\]/);
});

test("client attempt credential cannot reproduce the server-only opaque answer mapping", () => {
  const actual = buildAssessmentContract(sampleQuestions(), PAPER_SECRET).paper;
  const guessedWithClientToken = buildAssessmentContract(sampleQuestions(), CLIENT_TOKEN).paper;
  const actualSingle = actual.find(q => q.id === "single");
  const guessedSingle = guessedWithClientToken.find(q => q.id === "single");
  assert.notDeepEqual(actualSingle.options.map(option => option.id), guessedSingle.options.map(option => option.id));
  const actualOrder = actual.find(q => q.id === "order");
  const guessedOrder = guessedWithClientToken.find(q => q.id === "order");
  assert.notDeepEqual(actualOrder.items.map(item => item.id), guessedOrder.items.map(item => item.id));
});

test("matching, grouping and ordering do not reveal their answer mapping through IDs or source order", () => {
  const { paper } = buildAssessmentContract(sampleQuestions(), PAPER_SECRET);
  const matching = paper.find(q => q.id === "match");
  assert.equal(matching.leftItems.length, 2);
  assert.equal(matching.rightItems.length, 2);
  assert.ok(matching.leftItems.every(x => !/^\d+$/.test(x.id)));
  assert.ok(matching.rightItems.every(x => !/^\d+$/.test(x.id)));
  assert.notDeepEqual(matching.leftItems.map(x => x.id), matching.rightItems.map(x => x.id));
  assert.deepEqual([...matching.rightItems.map(item => item.text)].sort(), ["Berlin", "Paris"]);

  const grouping = paper.find(q => q.id === "group");
  assert.ok(grouping.groups.every(group => !group.items));
  assert.ok(grouping.items.every(item => !Object.hasOwn(item, "groupId")));

  const ordering = paper.find(q => q.id === "order");
  assert.ok(ordering.items.every(item => typeof item.id === "string" && item.id.length >= 10));
  assert.deepEqual([...ordering.items.map(item => item.text)].sort(), ["first", "second", "third"]);
});

test("same paper secret produces a stable paper; another server secret changes opaque IDs and shuffle", () => {
  const one = buildAssessmentContract(sampleQuestions(), PAPER_SECRET);
  const again = buildAssessmentContract(sampleQuestions(), PAPER_SECRET);
  const other = buildAssessmentContract(sampleQuestions(), OTHER_PAPER_SECRET);
  assert.deepEqual(one.paper, again.paper);
  assert.equal(one.sourceFingerprint, again.sourceFingerprint);
  assert.notDeepEqual(one.paper, other.paper);
  assert.notEqual(one.sourceFingerprint, other.sourceFingerprint);
});

test("server grading accepts opaque answers and never trusts client points", () => {
  const { paper, gradingKey } = buildAssessmentContract(sampleQuestions(), PAPER_SECRET);
  const byId = Object.fromEntries(paper.map(question => [question.id, question]));
  const answers = {};

  answers.single = byId.single.options.find(option => option.text === "blue").id;
  answers.multi = byId.multi.options.filter(option => ["A", "E"].includes(option.text)).map(option => option.id);
  answers.text = "Munich";
  answers.manual = "Because ...";
  answers.number = "4";
  answers.tf = "true";
  answers.gap = ["am", "are"];

  const matchQ = byId.match;
  const rightByText = Object.fromEntries(matchQ.rightItems.map(item => [item.text, item.id]));
  answers.match = {
    [matchQ.leftItems.find(item => item.text === "Germany").id]: rightByText.Berlin,
    [matchQ.leftItems.find(item => item.text === "France").id]: rightByText.Paris
  };

  const orderQ = byId.order;
  const orderByText = Object.fromEntries(orderQ.items.map(item => [item.text, item.id]));
  answers.order = [orderByText.first, orderByText.second, orderByText.third];

  const groupQ = byId.group;
  const groupByName = Object.fromEntries(groupQ.groups.map(group => [group.name, group.id]));
  const groupItemByText = Object.fromEntries(groupQ.items.map(item => [item.text, item.id]));
  answers.group = {
    [groupItemByText.Dog]: groupByName.Animals,
    [groupItemByText.Cat]: groupByName.Animals,
    [groupItemByText.Oak]: groupByName.Plants
  };
  answers.mark = ["1", "4"];

  const result = gradeSubmission(gradingKey, answers);
  assert.equal(result.maxPoints, 18);
  assert.equal(result.autoPoints, 16);
  assert.equal(result.needsReview, true);
  assert.equal(result.grading.manual.needsReview, true);
  assert.equal(result.grading.single.correct, true);
  assert.equal(result.grading.match.correct, true);
  assert.equal(result.grading.group.correct, true);
});

test("blank numeric answer never becomes numeric zero", () => {
  const zeroQuestion = [{ id: "zero", position: 1, type: "number", text: "0 + 0", points: 1, numericAnswer: 0, tolerance: 0 }];
  const { gradingKey } = buildAssessmentContract(zeroQuestion, PAPER_SECRET);
  const result = gradeSubmission(gradingKey, { zero: "" });
  assert.equal(result.autoPoints, 0);
  assert.equal(result.grading.zero.correct, false);
});

test("blank truefalse answer never becomes false", () => {
  const falseQuestion = [{ id: "false", position: 1, type: "truefalse", text: "2 + 2 = 5", points: 1, correctBoolean: false }];
  const { gradingKey } = buildAssessmentContract(falseQuestion, PAPER_SECRET);
  const result = gradeSubmission(gradingKey, { false: "" });
  assert.equal(result.autoPoints, 0);
  assert.equal(result.grading.false.correct, false);
});

test("server grading rejects wrong opaque mappings even when displayed labels look plausible", () => {
  const { paper, gradingKey } = buildAssessmentContract(sampleQuestions(), PAPER_SECRET);
  const matchQ = paper.find(q => q.id === "match");
  const answers = {
    match: {
      [matchQ.leftItems[0].id]: matchQ.rightItems.find(item => item.text !== (matchQ.leftItems[0].text === "Germany" ? "Berlin" : "Paris")).id,
      [matchQ.leftItems[1].id]: matchQ.rightItems.find(item => item.text !== (matchQ.leftItems[1].text === "Germany" ? "Berlin" : "Paris")).id
    }
  };
  const result = gradeSubmission(gradingKey.filter(key => key.id === "match"), answers);
  assert.equal(result.autoPoints, 0);
  assert.equal(result.grading.match.correct, false);
});

test("answer storage drops unknown questions and clamps oversized values", () => {
  const { gradingKey } = buildAssessmentContract(sampleQuestions(), PAPER_SECRET);
  const stored = sanitizeAnswersForStorage(gradingKey, {
    single: "x".repeat(5000),
    unknown: "do not store",
    group: { ["a".repeat(300)]: "b".repeat(300) }
  });
  assert.equal(Object.hasOwn(stored, "unknown"), false);
  assert.equal(stored.single.length, 4000);
  assert.equal(Object.keys(stored.group)[0].length, 100);
  assert.equal(Object.values(stored.group)[0].length, 100);
});

test("grade thresholds preserve GradeCrew's six-grade scale", () => {
  const thresholds = [91, 77, 57, 39, 25, 0];
  assert.equal(gradeFromPercent(100, thresholds), 1);
  assert.equal(gradeFromPercent(91, thresholds), 1);
  assert.equal(gradeFromPercent(90, thresholds), 2);
  assert.equal(gradeFromPercent(24, thresholds), 6);
});


test("listening audio reaches the student paper without leaking its transcript", () => {
  const listening = {
    id: "listen", position: 1, type: "single", text: "Wann fährt der Zug?", points: 1,
    options: [{ text: "8 Uhr", correct: true }, { text: "9 Uhr", correct: false }],
    audioDataUrl: "data:audio/mpeg;base64,QUJDRA==",
    audioAiGenerated: true,
    audioScript: "Der Zug fährt um acht Uhr."
  };
  const { paper } = buildAssessmentContract([listening], PAPER_SECRET);
  assert.equal(paper[0].audio.src, listening.audioDataUrl);
  assert.equal(paper[0].audio.aiGenerated, true);
  assert.equal(Object.hasOwn(paper[0], "audioScript"), false);
  assert.doesNotMatch(JSON.stringify(paper), /Der Zug fährt um acht Uhr/);
  assert.equal(assertNoSolutionLeak(paper), true);
});

test("solution-leak guard rejects transcripts if they are ever added to a public paper", () => {
  assert.throws(
    () => assertNoSolutionLeak([{ id: "q1", audioScript: "geheimer Hörtext" }]),
    /forbidden field: audioScript/
  );
});
