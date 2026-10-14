"use strict";
const { createHash } = require("node:crypto");
const FORMATS = ["single", "multi", "dropdown", "truefalse", "number", "matching", "ordering", "gapfill", "grouping", "text", "markwords"];
const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const norm = value => String(value ?? "").normalize("NFKC").replace(/\s+/g," ").trim().toLocaleLowerCase("de-DE");
function assertSource(quiz, uid) {
  if (!quiz || quiz.ownerId !== uid || quiz.rightsHold || quiz.isDeleted || quiz.status === "deleted" || ["running", "failed"].includes(quiz.generationStatus)) throw new Error("Quelle nicht verfügbar oder nicht dein eigener Test.");
  if (quiz.published === true && quiz.ended !== true) throw new Error("Laufende Prüfungen können nicht als Lernquelle freigegeben werden. Beende den Test zuerst.");
}
function rng(seed) { let x = (Number(seed) + 1) >>> 0; return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; }; }
function shuffle(values, random) { const a = [...values]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function arithmetic(q) {
  const m = q.text.match(/^\s*(-?\d{1,2})\s*([+*×·/÷−-])\s*(-?\d{1,2})\s*=\s*\?\s*$/);
  if (!m) return null;
  const a = Number(m[1]), b = Number(m[3]), op = m[2];
  const result = calculate(a, b, op);
  if (!Number.isFinite(result) || result !== q.numericAnswer || q.tolerance || q.unit || a === 0 || b === 0 || (/[\/÷]/.test(op) && result % 1)) return null;
  return { a, b, op };
}
function calculate(a, b, op) { if (op === "+") return a + b; if (op === "-" || op === "−") return a - b; if (/[\/÷]/.test(op)) return a / b; return a * b; }
function compileQuestion(q) {
  if (!q || !FORMATS.includes(q.type) || !String(q.text || "").trim() || q.manualReview === true) throw new Error("Dieses Format hat keinen zuverlässigen automatischen Schlüssel.");
  if(q.hasMedia)throw new Error("Medienabhängige Aufgaben brauchen einen geprüften Lernadapter.");
  if(String(q.text).length>5000||JSON.stringify(q).length>18000)throw new Error("Die Aufgabe ist für diesen Lernadapter zu umfangreich.");
  if (q.imageUrl || q.imageDataUrl || q.audioPresentation === "listening-only" || q.audioIntent?.presentation === "listening-only" || q.audioAnswerMode === "audio-only") throw new Error("Medienabhängige Aufgaben brauchen einen geprüften Lernadapter.");
  const item = { sourceId: String(q.id || ""), type: q.type, text: q.text.slice(0, 5000), hint: "Schau dir den Arbeitsauftrag und die angebotenen Begriffe noch einmal an.", payload: {}, key: null, arithmetic: null };
  if (["single", "multi", "dropdown"].includes(q.type)) {
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 12 || q.options.some(o => !String(o.text || "").trim() || o.imageUrl || o.imageDataUrl)) throw new Error("Antwortauswahl fehlt.");
    const correct = q.options.flatMap((o, i) => o.correct === true ? [i] : []);
    if (new Set(q.options.map(o => norm(o.text))).size !== q.options.length) throw new Error("Antwortbeschriftungen sind nicht eindeutig.");
    if (!correct.length || (q.type !== "multi" && correct.length !== 1)) throw new Error("Antwortschlüssel ist mehrdeutig.");
    item.payload.options = q.options.map(o => o.text); item.key = correct;
  } else if (q.type === "number") {
    if (typeof q.numericAnswer !== "number" || !Number.isFinite(q.numericAnswer) || !Number.isFinite(Number(q.tolerance || 0)) || Number(q.tolerance || 0) < 0) throw new Error("Zahlenschlüssel fehlt.");
    item.key = q.numericAnswer; item.payload.tolerance = Number(q.tolerance || 0); item.payload.unit = String(q.unit || "").slice(0, 80); item.arithmetic = arithmetic(q);
  } else if (q.type === "truefalse") {
    if (typeof q.correctBoolean !== "boolean") throw new Error("Wahr/Falsch-Schlüssel fehlt."); item.key = q.correctBoolean;
  } else if (q.type === "matching") {
    if (!Array.isArray(q.pairs) || q.pairs.length < 2 || q.pairs.length > 20 || q.pairs.some(p => !p.left || !p.right) || new Set(q.pairs.map(p => norm(p.left))).size !== q.pairs.length) throw new Error("Zuordnung ist nicht eindeutig.");
    item.payload.left = q.pairs.map(p => p.left); item.payload.right = [...new Set(q.pairs.map(p => p.right))]; item.key = q.pairs.map(p => item.payload.right.indexOf(p.right));
  } else if (q.type === "grouping") {
    if (!Array.isArray(q.groups) || q.groups.length < 2 || q.groups.length > 10 || q.groups.some(g => !g.name || !Array.isArray(g.items) || !g.items.length)) throw new Error("Gruppenschlüssel fehlt.");
    item.payload.right = q.groups.map(g => g.name); item.payload.left = q.groups.flatMap(g => g.items); item.key = q.groups.flatMap((g, i) => g.items.map(() => i));
    if (new Set(item.payload.right.map(norm)).size !== item.payload.right.length) throw new Error("Gruppennamen sind nicht eindeutig.");
    if (new Set(item.payload.left.map(norm)).size !== item.payload.left.length) throw new Error("Mehrdeutige Gruppenbegriffe.");
  } else if (q.type === "ordering") {
    if (!Array.isArray(q.items) || q.items.length < 2 || q.items.length > 20 || q.items.some(i => !String(i).trim()) || new Set(q.items.map(norm)).size !== q.items.length) throw new Error("Reihenfolge fehlt oder ist mehrdeutig.");
    item.payload.items = q.items; item.key = [q.items.map((_, i) => i), ...(Array.isArray(q.acceptedOrders) ? q.acceptedOrders.map(order => Array.isArray(order) ? order : order.indices) : [])];
    if (item.key.some(order => !Array.isArray(order) || order.length !== q.items.length || new Set(order).size !== q.items.length || order.some(i => !Number.isInteger(i) || i < 0 || i >= q.items.length))) throw new Error("Reihenfolgeschlüssel unvollständig.");
  } else if (q.type === "gapfill") {
    item.key = [...q.text.matchAll(/\[([^\[\]]+)\]/g)].map(m => m[1].split("|").map(a => a.trim()).filter(Boolean));
    if (!item.key.length || item.key.length > 20) throw new Error("Lückenschlüssel fehlt.");
    item.text = q.text.replace(/\[[^\[\]]+\]/g, "___");
  } else if(q.type==="markwords") {
    if(!String(q.passage||"").trim()||String(q.passage).length>5000)throw new Error("Markierungstext fehlt oder ist zu lang.");
    let wordIndex=0;item.payload.tokens=String(q.passage).split(/([\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*)/gu).filter(Boolean).map(text=>({text,index:/[\p{L}\p{N}]/u.test(text[0])?wordIndex++:null}));
    const groups=Array.isArray(q.markGroups)?q.markGroups:[],words=item.payload.tokens.filter(t=>t.index!==null),normalizeWord=v=>norm(v).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,"");
    if(groups.length){if(groups.length<2||groups.length>4||new Set(groups.map(g=>g.color)).size!==groups.length||new Set(groups.map(g=>norm(g.name))).size!==groups.length)throw new Error("Markierungsgruppen sind nicht eindeutig.");const map=new Map();for(const group of groups){if(!group.name||!["blue","orange","green","purple"].includes(group.color)||!Array.isArray(group.words)||!group.words.length)throw new Error("Markierungsschlüssel unvollständig.");for(const w of group.words){const token=normalizeWord(w);if(map.has(token)||!words.some(t=>normalizeWord(t.text)===token))throw new Error("Markierte Begriffe fehlen oder sind mehrdeutig.");map.set(token,group.color);}}item.payload.markGroups=groups.map(g=>({name:g.name,color:g.color}));item.key=Object.fromEntries(words.filter(t=>map.has(normalizeWord(t.text))).map(t=>[String(t.index),map.get(normalizeWord(t.text))]));}
    else {const targets=new Set((q.targetWords||[]).map(normalizeWord));if(!targets.size||[...targets].some(w=>!words.some(t=>normalizeWord(t.text)===w)))throw new Error("Markierungswörter fehlen im Text.");item.key=words.filter(t=>targets.has(normalizeWord(t.text))).map(t=>t.index);}
  } else {
    if (!Array.isArray(q.acceptedAnswers) || !q.acceptedAnswers.length || q.acceptedAnswers.some(a => !String(a).trim())) throw new Error("Verlässliche Kurzantworten fehlen."); item.key = q.acceptedAnswers;
  }
  item.id = digest(item).slice(0, 24); return item;
}
function present(item, seed) {
  const random = rng(seed), publicTask = { type: item.type, text: item.text, unit: item.payload.unit || "", sourceId: item.sourceId, gapCount: item.type === "gapfill" ? item.key.length : 0 };
  let key = item.key, text = item.text;
  if (item.arithmetic) {
    const { a: originalA, b: originalB, op } = item.arithmetic;
    const operand = original => Math.sign(original) * (1 + Math.floor(random() * (Math.abs(original) < 10 ? 9 : 90)) + (Math.abs(original) < 10 ? 0 : 9));
    let a = operand(originalA), b = operand(originalB);
    if (/[\/÷]/.test(op)) { const candidates = []; for (let value = 1; value < 100; value++) if (value % Math.abs(b) === 0 && (Math.abs(originalA) < 10 ? value < 10 : value >= 10)) candidates.push(value); if (candidates.length) a = Math.sign(originalA) * candidates[Math.floor(random() * candidates.length)]; else { a = originalA; b = originalB; } }
    key = calculate(a, b, op); text = `${a} ${op} ${b} = ?`; publicTask.text = text;
  }
  if (item.payload.options) { const order = shuffle(item.payload.options.map((_, i) => i), random); publicTask.options = order.map(i => item.payload.options[i]); key = item.key.map(i => order.indexOf(i)); }
  if (item.payload.left) {
    const leftOrder = shuffle(item.payload.left.map((_, i) => i), random), rightOrder = shuffle(item.payload.right.map((_, i) => i), random);
    publicTask.left = leftOrder.map(i => item.payload.left[i]); publicTask.right = rightOrder.map(i => item.payload.right[i]); key = leftOrder.map(i => rightOrder.indexOf(item.key[i]));
  }
  if (item.payload.items) { const order = shuffle(item.payload.items.map((_, i) => i), random); publicTask.items = order.map(i => item.payload.items[i]); key = item.key.map(correct => correct.map(i => order.indexOf(i))); }
  if(item.payload.tokens){publicTask.tokens=item.payload.tokens;if(item.payload.markGroups)publicTask.markGroups=item.payload.markGroups;}
  return { id: digest({ itemId: item.id, seed }).slice(0,32), type: item.type, text, public: publicTask, key, tolerance: item.payload.tolerance || 0, hint: item.learning?.hint || item.hint, learning:item.learning||null };
}
function check(task, answer) {
  let correct = false;
  if (task.type === "number") { const input = String(answer).trim().replace(",", "."); correct = /^[-+]?\d+(?:\.\d+)?$/.test(input) && Math.abs(Number(input) - task.key) <= task.tolerance; }
  else if (task.type === "truefalse") correct = typeof answer === "boolean" && answer === task.key;
  else if (task.type === "text") correct = task.key.some(a => norm(answer) === norm(a));
  else if (task.type === "gapfill") correct = Array.isArray(answer) && answer.length === task.key.length && answer.every((a, i) => task.key[i].some(option => norm(a) === norm(option)));
  else if (task.type === "ordering") correct = Array.isArray(answer) && task.key.some(order => JSON.stringify(order) === JSON.stringify(answer));
  else if(task.type==="markwords")correct=Array.isArray(task.key)?Array.isArray(answer)&&new Set(answer).size===answer.length&&answer.every(Number.isInteger)&&JSON.stringify([...answer].sort((a,b)=>a-b))===JSON.stringify(task.key):answer&&typeof answer==="object"&&!Array.isArray(answer)&&JSON.stringify(Object.entries(answer).sort())===JSON.stringify(Object.entries(task.key).sort());
  else if (["single", "multi", "dropdown"].includes(task.type)) correct = Array.isArray(answer) && answer.every(Number.isInteger) && new Set(answer).size === answer.length && JSON.stringify([...answer].sort((a,b) => a-b)) === JSON.stringify([...task.key].sort((a,b) => a-b));
  else correct = JSON.stringify(answer) === JSON.stringify(task.key);
  return { correct, message: correct ? "Das passt. Weiter zur nächsten Aufgabe." : "Das passt noch nicht ganz. Du kannst es erneut versuchen oder Hilfe öffnen." };
}
function nextItem(items, index, seed = 0) { if (!items.length) throw new Error("Keine geprüften Aufgaben verfügbar."); const cycle = Math.floor(index / items.length); const order = shuffle(items, rng(seed + cycle)); return present(order[index % items.length], seed + index * 7919); }
module.exports = { FORMATS, compileQuestion, present, check, nextItem, assertSource, digest };
