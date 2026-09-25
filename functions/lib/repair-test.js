"use strict";

const { normalizeQuestion, validateQuestion, validateTest, sameQuestion } = require("./validation");

function questionIssues(test, options) {
  const questions = test.questions || [];
  return questions.flatMap((question, index) => {
    const reasons = validateQuestion(question, options);
    const prior = questions.findIndex((other, i) => i < index && sameQuestion(other, question));
    if (prior >= 0) reasons.push(`Inhaltlich wie Aufgabe ${prior + 1}.`);
    if (options.referenceQuestions?.some(other => sameQuestion(other, question))) reasons.push("Wiederholt den Ausgangstest.");
    if (options.negativeQuestions?.some(other => sameQuestion(other, question))) reasons.push("Ähnelt einer zuvor als fehlerhaft bewerteten Aufgabe.");
    for (const issue of options.reviewIssues || []) {
      if (issue.index === index && String(issue.text || "").trim() === String(question.text || "").trim()) reasons.push(`Qualitätsprüfung: ${issue.detail}`);
    }
    return reasons.length ? [{ index, reasons }] : [];
  });
}

function globalIssues(test, options) {
  return validateTest(test, options).filter(error => !/^Aufgabe \d+(?::| wiederholt)/.test(error));
}

function balanceTestPoints(test, targetPoints) {
  if (!Number.isFinite(targetPoints) || targetPoints <= 0 || !test.questions?.length) return test;
  const targetUnits = Math.round(targetPoints * 2);
  const units = test.questions.map(q => Math.max(1, Math.round(Number(q.points) * 2)));
  if (targetUnits < units.length) throw new RangeError("Für diese Aufgabenanzahl sind mindestens 0,5 Punkte pro Aufgabe nötig.");
  let difference = targetUnits - units.reduce((sum, value) => sum + value, 0);
  if (!difference) return test;
  const order = units.map((_, index) => index).sort((a, b) => units[b] - units[a] || a - b);
  if (difference > 0) {
    for (let step = 0; step < difference; step += 1) units[order[step % order.length]] += 1;
  } else {
    difference = -difference;
    while (difference > 0) {
      for (const index of order) {
        if (units[index] > 1) { units[index] -= 1; difference -= 1; }
        if (!difference) break;
      }
    }
  }
  return { ...test, questions: test.questions.map((question, index) => ({ ...question, points: units[index] / 2 })) };
}

async function replaceInvalidQuestions(test, options, generate, maxAttempts = 8) {
  let attempts = 0;
  let replaced = 0;
  const tried = new Map();
  const feedback = new Map();
  while (attempts < maxAttempts) {
    const issue = questionIssues(test, options).find(({ index }) => (tried.get(index) || 0) < 3);
    if (!issue) break;
    const { index } = issue;
    const original = test.questions[index];
    const priorAttempts = tried.get(index) || 0;
    tried.set(index, priorAttempts + 1);
    attempts += 1;
    const candidate = normalizeQuestion(await generate({ test, index, original, reasons: [...issue.reasons, ...(feedback.get(index) || [])], attempt: priorAttempts + 1 }));
    candidate.points = original.points;

    const reasons = validateQuestion(candidate, options);
    if (candidate.mediaIntent.kind !== original.mediaIntent.kind) reasons.push(`Die Bildart muss ${original.mediaIntent.kind} bleiben.`);
    if (sameQuestion(original, candidate)) reasons.push("Die neue Aufgabe ist der ersetzten zu ähnlich.");
    if (test.questions.some((other, i) => i !== index && sameQuestion(other, candidate))) reasons.push("Die neue Aufgabe wiederholt eine andere Aufgabe des Tests.");
    if (options.referenceQuestions?.some(other => sameQuestion(other, candidate))) reasons.push("Die neue Aufgabe wiederholt den Ausgangstest.");
    if (options.negativeQuestions?.some(other => sameQuestion(other, candidate))) reasons.push("Die neue Aufgabe ähnelt einer als fehlerhaft bewerteten Aufgabe.");
    if (options.reviewIssues?.some(issue => issue.index === index && String(issue.text || "").trim() === candidate.text)) reasons.push("Die neue Aufgabe wiederholt die bemängelte Fragestellung.");
    if (!reasons.length) {
      const next = { ...test, questions: test.questions.map((question, i) => i === index ? candidate : question) };
      reasons.push(...globalIssues(next, options));
      if (!reasons.length) {
        test = next;
        replaced += 1;
        feedback.delete(index);
        continue;
      }
    }
    feedback.set(index, reasons);
  }
  return { test, attempts, replaced };
}

async function validateAndRepairTest(test, options, { generateQuestion, regenerateTest, maxQuestionAttempts } = {}) {
  const expectedCount = Number(options.expectedCount || test.questions?.length || 0);
  const repairLimit = Number.isInteger(maxQuestionAttempts) && maxQuestionAttempts > 0
    ? maxQuestionAttempts
    : Math.min(16, Math.max(8, Math.ceil(expectedCount * 0.75)));
  const localIssueLimit = Math.min(12, Math.max(6, Math.ceil(expectedCount * 0.5)));
  const balance = draft => options.expectedCount && draft.questions?.length !== options.expectedCount ? draft : balanceTestPoints(draft, options.targetPoints);
  test = balance(test);
  let questionAttempts = 0;
  let replaced = 0;
  let fullRepair = false;
  while (true) {
    const errors = validateTest(test, options);
    if (!errors.length) return { test, errors, questionAttempts, replaced, fullRepair };

    const issues = questionIssues(test, options);
    if (!globalIssues(test, options).length && questionAttempts < repairLimit && (fullRepair || issues.length <= localIssueLimit)) {
      const result = await replaceInvalidQuestions(test, options, generateQuestion, repairLimit - questionAttempts);
      test = result.test;
      questionAttempts += result.attempts;
      replaced += result.replaced;
      if (!validateTest(test, options).length) continue;
    }
    if (!fullRepair) {
      test = balance(await regenerateTest(test, validateTest(test, options)));
      fullRepair = true;
      continue;
    }
    return { test, errors: validateTest(test, options), questionAttempts, replaced, fullRepair };
  }
}

module.exports = { questionIssues, globalIssues, balanceTestPoints, replaceInvalidQuestions, validateAndRepairTest };
