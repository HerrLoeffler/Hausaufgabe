"use strict";

const { randomBytes, createHash } = require("node:crypto");

const DEFAULT_SCALE = Object.freeze({ id: "standard", name: "Standard", thresholds: [91, 77, 57, 39, 25, 0] });
const QUESTION_TYPES = new Set(["single", "multi", "text", "dropdown", "truefalse", "gapfill", "matching", "ordering", "grouping", "markwords", "number"]);

function roundHalf(value) {
  return Math.round(Number(value || 0) * 2) / 2;
}

function normalizeText(value) {
  return String(value ?? "").trim().toLocaleLowerCase("de");
}

function normalizeWord(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("de")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function normalizeCode(value) {
  const code = String(value || "").trim().toUpperCase();
  return /^[A-Z0-9]{4,16}$/.test(code) ? code : "";
}

function cleanStudentName(value) {
  return String(value || "").replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 120);
}

function randomToken(bytes = 24) {
  return randomBytes(bytes).toString("base64url");
}

function hashSecret(value) {
  return createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function parseGaps(text) {
  const source = String(text || "");
  const answers = [];
  const parts = [];
  let last = 0;
  const regex = /\[([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(source))) {
    parts.push(source.slice(last, match.index));
    answers.push(match[1].split("|").map(x => x.trim()).filter(Boolean));
    last = match.index + match[0].length;
  }
  parts.push(source.slice(last));
  return { parts, answers };
}

function tokenizeWords(text) {
  const pieces = String(text || "").match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*|[^\p{L}\p{N}]+/gu) || [];
  let wordIndex = 0;
  return pieces.map(piece => {
    const isWord = /[\p{L}\p{N}]/u.test(piece[0] || "");
    return { text: piece, isWord, wordIndex: isWord ? wordIndex++ : null };
  });
}

function markwordCorrectIndexes(question) {
  const targets = new Set((question.targetWords || []).map(normalizeWord).filter(Boolean));
  return tokenizeWords(question.passage)
    .filter(token => token.isWord && targets.has(normalizeWord(token.text)))
    .map(token => String(token.wordIndex));
}

function validOrder(order, length) {
  return Array.isArray(order) && order.length === length && new Set(order).size === length
    && order.every(index => Number.isInteger(index) && index >= 0 && index < length);
}

function acceptedOrderingOrders(question) {
  const length = question.items?.length || 0;
  const primary = Array.from({ length }, (_, index) => index);
  const extras = Array.isArray(question.acceptedOrders) ? question.acceptedOrders : [];
  const unique = new Map();
  for (const order of [primary, ...extras]) {
    if (validOrder(order, length)) unique.set(order.join(","), order);
  }
  return [...unique.values()];
}

function orderingNeedsReview(question) {
  return question.manualReview === true || /\bsatz(?:es|baustein\w*|bau\w*|glieder\w*|stellung\w*)?\b|\bsätze\b|\bwörter\s+(?:zu\s+einem\s+)?satz/iu.test(String(question.text || ""));
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomBytes(4).readUInt32BE(0) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function copyMedia(question) {
  const out = {};
  for (const key of ["imageDataUrl", "imageAlt", "imageCaption"]) {
    if (typeof question?.[key] === "string" && question[key]) out[key] = question[key];
  }
  return out;
}

function basePublicQuestion(question, id) {
  return {
    id,
    type: QUESTION_TYPES.has(question.type) ? question.type : "text",
    text: String(question.text || ""),
    points: roundHalf(question.points),
    ...copyMedia(question)
  };
}

function buildQuestionPresentation(question, id, quiz = {}) {
  const base = basePublicQuestion(question, id);
  const maxPoints = base.points;
  const type = base.type;

  if (["single", "multi", "dropdown"].includes(type)) {
    const options = (question.options || []).map((option, index) => ({
      id: randomToken(9),
      sourceIndex: index,
      text: String(option?.text || ""),
      imageDataUrl: typeof option?.imageDataUrl === "string" ? option.imageDataUrl : "",
      imageAlt: typeof option?.imageAlt === "string" ? option.imageAlt : ""
    }));
    const shown = quiz.shuffleAnswers ? shuffle(options) : options;
    return {
      publicQuestion: {
        ...base,
        options: shown.map(({ id: optionId, text, imageDataUrl, imageAlt }) => ({ id: optionId, text, imageDataUrl, imageAlt }))
      },
      gradingKey: {
        id, type, maxPoints,
        correctOptionIds: options.filter(item => question.options?.[item.sourceIndex]?.correct === true).map(item => item.id)
      }
    };
  }

  if (type === "text") {
    return {
      publicQuestion: { ...base, manualReview: question.manualReview === true },
      gradingKey: {
        id, type, maxPoints,
        manualReview: question.manualReview === true,
        acceptedAnswers: (question.acceptedAnswers || []).map(value => String(value))
      }
    };
  }

  if (type === "number") {
    return {
      publicQuestion: { ...base, unit: String(question.unit || "") },
      gradingKey: { id, type, maxPoints, numericAnswer: Number(question.numericAnswer), tolerance: Math.max(0, Number(question.tolerance) || 0) }
    };
  }

  if (type === "truefalse") {
    return {
      publicQuestion: base,
      gradingKey: { id, type, maxPoints, correctBoolean: question.correctBoolean === true }
    };
  }

  if (type === "gapfill") {
    const gaps = parseGaps(question.text);
    return {
      publicQuestion: { ...base, text: "Lückentext", gapParts: gaps.parts, gapCount: gaps.answers.length },
      gradingKey: { id, type, maxPoints, acceptedGaps: gaps.answers }
    };
  }

  if (type === "matching") {
    const pairs = (question.pairs || []).map(pair => ({
      leftId: randomToken(8), left: String(pair?.left || ""),
      rightId: randomToken(8), right: String(pair?.right || "")
    }));
    return {
      publicQuestion: {
        ...base,
        leftItems: pairs.map(({ leftId, left }) => ({ id: leftId, text: left })),
        rightItems: shuffle(pairs.map(({ rightId, right }) => ({ id: rightId, text: right })))
      },
      gradingKey: { id, type, maxPoints, matches: Object.fromEntries(pairs.map(pair => [pair.leftId, pair.rightId])) }
    };
  }

  if (type === "ordering") {
    const items = (question.items || []).map((text, index) => ({ id: randomToken(8), text: String(text || ""), sourceIndex: index }));
    const idByIndex = new Map(items.map(item => [item.sourceIndex, item.id]));
    const acceptedOrders = acceptedOrderingOrders(question).map(order => order.map(index => idByIndex.get(index)));
    return {
      publicQuestion: { ...base, items: shuffle(items).map(({ id: itemId, text }) => ({ id: itemId, text })) },
      gradingKey: { id, type, maxPoints, acceptedOrders, manualReview: orderingNeedsReview(question) }
    };
  }

  if (type === "grouping") {
    const groups = (question.groups || []).map(group => ({ id: randomToken(8), name: String(group?.name || "") }));
    const items = [];
    (question.groups || []).forEach((group, groupIndex) => {
      (group?.items || []).forEach(text => items.push({ id: randomToken(8), text: String(text || ""), groupId: groups[groupIndex]?.id || "" }));
    });
    return {
      publicQuestion: {
        ...base,
        groups: groups.map(({ id: groupId, name }) => ({ id: groupId, name })),
        items: shuffle(items).map(({ id: itemId, text }) => ({ id: itemId, text }))
      },
      gradingKey: { id, type, maxPoints, itemGroups: Object.fromEntries(items.map(item => [item.id, item.groupId])) }
    };
  }

  if (type === "markwords") {
    return {
      publicQuestion: { ...base, passage: String(question.passage || "") },
      gradingKey: { id, type, maxPoints, correctIndexes: markwordCorrectIndexes(question) }
    };
  }

  return {
    publicQuestion: base,
    gradingKey: { id, type: "text", maxPoints, manualReview: true, acceptedAnswers: [] }
  };
}

function buildSecureExamPayload(quiz, questionDocs) {
  const presented = (questionDocs || []).map((entry, index) => {
    const question = entry?.data ? entry.data : entry;
    const id = String(entry?.id || question?.id || `q${index + 1}`);
    return buildQuestionPresentation(question || {}, id, quiz || {});
  });
  let publicQuestions = presented.map(x => x.publicQuestion);
  if (quiz?.shuffleQuestions) publicQuestions = shuffle(publicQuestions);
  const gradingKeys = Object.fromEntries(presented.map(x => [x.gradingKey.id, x.gradingKey]));
  return {
    publicQuestions,
    gradingKeys,
    maxPoints: roundHalf(Object.values(gradingKeys).reduce((sum, key) => sum + Number(key.maxPoints || 0), 0))
  };
}

function sanitizeAnswers(gradingKeys, rawAnswers) {
  const source = rawAnswers && typeof rawAnswers === "object" && !Array.isArray(rawAnswers) ? rawAnswers : {};
  const out = {};
  for (const [questionId, key] of Object.entries(gradingKeys || {})) {
    const value = source[questionId];
    if (["single", "dropdown"].includes(key.type)) out[questionId] = typeof value === "string" ? value.slice(0, 160) : "";
    else if (key.type === "multi" || key.type === "ordering" || key.type === "gapfill" || key.type === "markwords") {
      out[questionId] = Array.isArray(value) ? value.slice(0, 120).map(item => String(item ?? "").slice(0, 500)) : [];
    } else if (["matching", "grouping"].includes(key.type)) {
      const map = value && typeof value === "object" && !Array.isArray(value) ? value : {};
      out[questionId] = Object.fromEntries(Object.entries(map).slice(0, 200).map(([k, v]) => [String(k).slice(0, 120), String(v ?? "").slice(0, 120)]));
    } else if (key.type === "truefalse") {
      out[questionId] = value === true || value === "true" ? "true" : value === false || value === "false" ? "false" : "";
    } else {
      out[questionId] = String(value ?? "").slice(0, 4000);
    }
  }
  return out;
}

function gradeOne(key, given) {
  const max = roundHalf(key.maxPoints);
  if (key.type === "text") {
    if (key.manualReview) return { awarded: 0, max, needsReview: true, correct: null };
    const ok = (key.acceptedAnswers || []).map(normalizeText).includes(normalizeText(given));
    return { awarded: ok ? max : 0, max, needsReview: false, correct: ok };
  }
  if (key.type === "number") {
    const value = Number(String(given || "").trim().replace(",", "."));
    const ok = Number.isFinite(value) && Math.abs(value - Number(key.numericAnswer)) <= Math.max(0, Number(key.tolerance) || 0) + 1e-9;
    return { awarded: ok ? max : 0, max, needsReview: false, correct: ok };
  }
  if (key.type === "truefalse") {
    const ok = String(given) === String(Boolean(key.correctBoolean));
    return { awarded: ok ? max : 0, max, needsReview: false, correct: ok };
  }
  if (key.type === "gapfill") {
    const values = Array.isArray(given) ? given : [];
    const gaps = key.acceptedGaps || [];
    let good = 0;
    gaps.forEach((accepted, index) => {
      if ((accepted || []).map(normalizeText).includes(normalizeText(values[index]))) good += 1;
    });
    const ratio = gaps.length ? good / gaps.length : 0;
    return { awarded: roundHalf(ratio * max), max, needsReview: false, correct: gaps.length > 0 && good === gaps.length };
  }
  if (key.type === "matching") {
    const expected = key.matches || {};
    const answer = given && typeof given === "object" && !Array.isArray(given) ? given : {};
    const entries = Object.entries(expected);
    const good = entries.filter(([leftId, rightId]) => String(answer[leftId] || "") === String(rightId)).length;
    const ratio = entries.length ? good / entries.length : 0;
    return { awarded: roundHalf(ratio * max), max, needsReview: false, correct: entries.length > 0 && good === entries.length };
  }
  if (key.type === "ordering") {
    const values = Array.isArray(given) ? given.map(String) : [];
    const orders = Array.isArray(key.acceptedOrders) ? key.acceptedOrders : [];
    const counts = orders.map(order => order.reduce((count, itemId, position) => count + (values[position] === String(itemId) ? 1 : 0), 0));
    const good = Math.max(0, ...counts);
    const total = orders[0]?.length || 0;
    return { awarded: roundHalf((total ? good / total : 0) * max), max, needsReview: key.manualReview === true, correct: total > 0 && values.length === total && good === total };
  }
  if (key.type === "grouping") {
    const expected = key.itemGroups || {};
    const answer = given && typeof given === "object" && !Array.isArray(given) ? given : {};
    const entries = Object.entries(expected);
    const good = entries.filter(([itemId, groupId]) => String(answer[itemId] || "") === String(groupId)).length;
    const ratio = entries.length ? good / entries.length : 0;
    return { awarded: roundHalf(ratio * max), max, needsReview: false, correct: entries.length > 0 && good === entries.length };
  }
  if (key.type === "markwords") {
    const correct = (key.correctIndexes || []).map(String);
    const selected = Array.isArray(given) ? given.map(String) : [];
    const good = selected.filter(value => correct.includes(value)).length;
    const bad = selected.filter(value => !correct.includes(value)).length;
    const ratio = Math.max(0, Math.min(1, (good - bad) / Math.max(1, correct.length)));
    return { awarded: roundHalf(ratio * max), max, needsReview: false, correct: good === correct.length && bad === 0 && selected.length === correct.length };
  }
  const correct = (key.correctOptionIds || []).map(String);
  if (key.type === "multi") {
    const selected = Array.isArray(given) ? given.map(String) : [];
    const good = selected.filter(value => correct.includes(value)).length;
    const bad = selected.filter(value => !correct.includes(value)).length;
    const ratio = Math.max(0, Math.min(1, (good - bad) / Math.max(1, correct.length)));
    return { awarded: roundHalf(ratio * max), max, needsReview: false, correct: good === correct.length && bad === 0 && selected.length === correct.length };
  }
  const ok = correct.includes(String(given || ""));
  return { awarded: ok ? max : 0, max, needsReview: false, correct: ok };
}

function gradeSecureAnswers(gradingKeys, rawAnswers) {
  const answers = sanitizeAnswers(gradingKeys, rawAnswers);
  const grading = {};
  let points = 0;
  let maxPoints = 0;
  let needsReview = false;
  for (const [questionId, key] of Object.entries(gradingKeys || {})) {
    const result = gradeOne(key, answers[questionId]);
    grading[questionId] = {
      autoPoints: result.awarded,
      awardedPoints: result.awarded,
      maxPoints: result.max,
      needsReview: result.needsReview
    };
    points += result.awarded;
    maxPoints += result.max;
    needsReview ||= result.needsReview;
  }
  points = roundHalf(points);
  maxPoints = roundHalf(maxPoints);
  const percent = maxPoints ? Math.round((points / maxPoints) * 100) : 0;
  return { answers, grading, points, maxPoints, percent, needsReview };
}

function quizScale(quiz) {
  const candidate = quiz?.gradeScaleSnapshot;
  if (Array.isArray(candidate?.thresholds) && candidate.thresholds.length === 6) {
    return { id: String(candidate.id || "snapshot"), name: String(candidate.name || "Notenschlüssel"), thresholds: candidate.thresholds.map(Number) };
  }
  return { ...DEFAULT_SCALE, thresholds: [...DEFAULT_SCALE.thresholds] };
}

function gradeFromPercent(percent, scale = DEFAULT_SCALE) {
  const thresholds = Array.isArray(scale?.thresholds) && scale.thresholds.length === 6 ? scale.thresholds.map(Number) : DEFAULT_SCALE.thresholds;
  const p = Number(percent) || 0;
  for (let index = 0; index < 6; index += 1) if (p >= thresholds[index]) return index + 1;
  return 6;
}

function safeQuizMetadata(code, quiz) {
  return {
    code,
    title: String(quiz?.title || "Test").slice(0, 180),
    subject: String(quiz?.subject || "").slice(0, 120),
    grade: String(quiz?.grade || "").slice(0, 80),
    description: String(quiz?.description || "").slice(0, 500),
    timeLimitMinutes: Number(quiz?.timeLimitMinutes) > 0 ? Math.round(Number(quiz.timeLimitMinutes)) : null,
    startMode: quiz?.startMode === "teacher" ? "teacher" : "student",
    sessionState: String(quiz?.sessionState || "waiting"),
    totalPoints: Number(quiz?.totalPoints) || null,
    secureExamEnabled: quiz?.secureExamEnabled === true
  };
}

module.exports = {
  DEFAULT_SCALE,
  normalizeCode,
  cleanStudentName,
  randomToken,
  hashSecret,
  parseGaps,
  tokenizeWords,
  markwordCorrectIndexes,
  buildSecureExamPayload,
  sanitizeAnswers,
  gradeSecureAnswers,
  quizScale,
  gradeFromPercent,
  safeQuizMetadata,
  roundHalf
};
