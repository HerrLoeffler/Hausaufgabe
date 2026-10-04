"use strict";

function clean(value, max = 500) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function gapAnswers(text) {
  const answers = [];
  String(text || "").replace(/\[([^\]]+)\]/g, (_, inside) => {
    const value = String(inside || "").split("|").map(item => item.trim()).filter(Boolean).join(" oder ");
    if (value) answers.push(value);
    return _;
  });
  return answers;
}

function solutionAnswerText(question = {}) {
  const type = String(question.type || "text");
  if (["single", "multi", "dropdown"].includes(type)) {
    return (Array.isArray(question.options) ? question.options : [])
      .filter(option => option?.correct === true)
      .map(option => clean(option?.text, 220))
      .filter(Boolean)
      .join(", ");
  }
  if (type === "text") {
    const answers = (Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : [])
      .map(value => clean(value, 220)).filter(Boolean);
    return answers.length ? answers.join(" oder ") : "Diese Aufgabe wird von der Lehrkraft individuell bewertet.";
  }
  if (type === "truefalse") return question.correctBoolean === true ? "Richtig." : "Falsch.";
  if (type === "gapfill") {
    const answers = gapAnswers(question.text);
    return answers.length ? answers.map((value, index) => `Lücke ${index + 1}: ${value}`).join(". ") : "";
  }
  if (type === "matching") {
    return (Array.isArray(question.pairs) ? question.pairs : [])
      .map(pair => `${clean(pair?.left, 140)} gehört zu ${clean(pair?.right, 140)}`)
      .filter(Boolean).join(". ");
  }
  if (type === "ordering") {
    return (Array.isArray(question.items) ? question.items : []).map(item => clean(item, 160)).filter(Boolean).join(", dann ");
  }
  if (type === "grouping") {
    return (Array.isArray(question.groups) ? question.groups : [])
      .map(group => `${clean(group?.name, 100)}: ${(Array.isArray(group?.items) ? group.items : []).map(item => clean(item, 120)).filter(Boolean).join(", ")}`)
      .filter(Boolean).join(". ");
  }
  if (type === "markwords") {
    return (Array.isArray(question.targetWords) ? question.targetWords : []).map(value => clean(value, 120)).filter(Boolean).join(", ");
  }
  if (type === "number") {
    const number = Number(question.numericAnswer);
    const unit = clean(question.unit, 40);
    return Number.isFinite(number) ? `${number}${unit ? ` ${unit}` : ""}` : "";
  }
  return "";
}

function solutionAudioScript(question = {}) {
  const answer = solutionAnswerText(question);
  if (!answer) return "Die Lösung wird von der Lehrkraft erklärt.";
  const script = `Die richtige Lösung ist: ${answer}`;
  return clean(script, 500);
}

function planSolutionAudioIndexes(total, count) {
  const size = Math.max(0, Number(total) || 0);
  const wanted = Math.max(0, Math.min(size, Number(count) || 0));
  if (!wanted) return [];
  const indexes = [];
  for (let i = 0; i < wanted; i += 1) {
    let index = Math.floor(((i + 0.5) * size) / wanted);
    index = Math.min(size - 1, Math.max(0, index));
    while (indexes.includes(index) && index + 1 < size) index += 1;
    while (indexes.includes(index) && index - 1 >= 0) index -= 1;
    indexes.push(index);
  }
  return indexes.sort((a, b) => a - b);
}

module.exports = { solutionAnswerText, solutionAudioScript, planSolutionAudioIndexes };
