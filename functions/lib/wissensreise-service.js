"use strict";
const { randomBytes, timingSafeEqual } = require("node:crypto");
const { FORMATS, compileQuestion, present, check, nextItem, assertSource, digest } = require("./wissensreise-core");
const id = value => { if (!/^[a-zA-Z0-9_-]{4,80}$/.test(String(value || ""))) throw new Error("Ungültige Anfrage-ID."); return value; };
function revision(draft) { return digest({ binding: draft.binding, items: draft.items }).slice(0, 24); }
function solution(task) {
  if (["matching", "grouping"].includes(task.type)) return task.public.left.map((left,i) => `${left}: ${task.public.right[task.key[i]]}`).join("; ");
  if (task.type === "ordering") return task.key[0].map(i => task.public.items[i]).join(" → ");
  if (["single", "multi", "dropdown"].includes(task.type)) return task.key.map(i => task.public.options[i]).join("; ");
  if (task.type === "truefalse") return task.key ? "Wahr" : "Falsch";
  return Array.isArray(task.key) ? task.key.join("; ") : String(task.key);
}
function draftView(draft) { return { id: draft.id, title: draft.title, sourceId: draft.sourceId, duration: draft.duration, formats: draft.formats, revision: revision(draft), status: draft.status, excluded: draft.excluded, generatedCount: draft.generatedCount, remainingBudget: 6 - draft.generatedCount, requests: Object.values(draft.requests).map(r => ({ status: r.status, requestId: r.requestId })), items: draft.items.map((item,i) => { const task = present(item,i * 37); return { id: item.id, sourceId: item.sourceId, task: { ...task.public, id: task.id }, solution: solution(task), kind: item.kind || "source", parametric: Boolean(item.arithmetic) }; }) }; }
function createLearningService({ repo, generate, now = Date.now }) {
  const expiry = days => now() + days * 86400000;
  async function source(uid, sourceId) { const value = await repo.loadSource(id(sourceId)); assertSource(value, uid); return value; }
  async function owned(uid, draftId) { const d = await repo.get(`learningDrafts/${id(draftId)}`); if (!d || d.ownerId !== uid || d.expiresAt <= now()) throw new Error("Lernentwurf nicht verfügbar."); return d; }
  async function currentSource(d) { const s = await source(d.ownerId, d.sourceId); if (digest(s) !== d.sourceFingerprint) throw new Error("Der Ausgangstest wurde geändert. Erstelle und prüfe eine neue Lernkopie."); return s; }
  function publicSession(s, feedback) {
    const ended = s.endsAt !== null && now() >= s.endsAt;
    const task = ended ? null : nextItem(s.items, s.index, s.seed);
    return { sessionId: s.id, title: s.title, revision: s.revision, index: s.index, ended, serverNow: now(), endsAt: s.endsAt, duration: s.duration, task: task ? { ...task.public, id: task.id } : null, feedback: feedback || null, repetition: s.index >= s.items.length && s.items.some(i => !i.arithmetic), poolSize: s.items.length, notice: "Neue Beispiele stammen aus dem geprüften Vorrat. Danach werden Lernaufgaben mit gemischten Ansichten wiederholt. Im Spiel werden keine KI-Anfragen gestartet." };
  }
  const api = {
    async prepare(uid, data) {
      const s = await source(uid, data.sourceId), requestId = id(data.requestId);
      if (![0,120,180].includes(data.duration)) throw new Error("Wähle freies Lernen, zwei oder drei Minuten.");
      const formats = Array.isArray(data.formats) ? [...new Set(data.formats)].filter(t => FORMATS.includes(t)).sort() : FORMATS;
      if (!formats.length || !Array.isArray(s.questions) || !s.questions.length || s.questions.length > 40) throw new Error("Wähle unterstützte Formate und einen Test mit höchstens40Aufgaben.");
      const binding = digest({ sourceId: data.sourceId, sourceFingerprint: digest(s), duration: data.duration, formats });
      const draftId = digest({ uid, requestId }).slice(0,40);
      return repo.mutate(`learningDrafts/${draftId}`, old => {
        if (old) { if (old.ownerId !== uid || old.binding !== binding) throw new Error("Diese Anfrage gehört bereits zu einer anderen Lernkopie."); return { output: draftView(old) }; }
        const items = [], excluded = [], sourceQuestions = [];
        for (const q of s.questions) { if (!formats.includes(q.type)) { excluded.push({ sourceId: q.id, reason: "Format nicht gewählt." }); continue; } try { const item = compileQuestion(q); items.push(item); sourceQuestions.push(q); } catch (e) { excluded.push({ sourceId: String(q.id || ""), reason: e.message }); } }
        if (!items.length) throw new Error("Keine zuverlässig automatisch spielbare Aufgabe gefunden.");
        const d = { id: draftId, ownerId: uid, sourceId: data.sourceId, sourceFingerprint: digest(s), title: String(s.title || "Wissensreise").slice(0,160), context: { subject: String(s.subject || ""), grade: String(s.grade || ""), topic: String(s.topic || s.title || "") }, binding, formats, duration: data.duration, sourceQuestions, items, excluded, generatedCount: 0, requests: {}, status: "draft", expiresAt: expiry(7) };
        return { value: d, output: draftView(d) };
      });
    },
    async get(uid, data) { const d = await owned(uid,data.draftId); await currentSource(d); return draftView(d); },
    async generate(uid, data) {
      const d = await owned(uid,data.draftId); await currentSource(d); const requestId = id(data.requestId);
      const key = digest(requestId).slice(0,24), sourceQ = d.sourceQuestions.find(q => q.id === data.sourceItemId);
      if (!sourceQ) throw new Error("Ausgangsaufgabe fehlt.");
      const reserved = await repo.mutate(`learningDrafts/${d.id}`, value => {
        if (value.status !== "draft") throw new Error("Diese Version ist bereits veröffentlicht.");
        const previous = value.requests[key];
        if (previous) { if (previous.sourceItemId !== sourceQ.id) throw new Error("Anfrage-ID gehört zu einer anderen Aufgabe."); return { output: false }; }
        if (Object.values(value.requests).some(r => r.status === "running")) throw new Error("Eine Variante wird bereits erstellt. Prüfe zuerst deren Status.");
        if (value.generatedCount >= 6) throw new Error("Das Budget von sechs Varianten ist ausgeschöpft. Prüfe und verwende den vorhandenen Vorrat.");
        value.generatedCount++; value.requests[key] = { requestId, sourceItemId: sourceQ.id, status: "running" }; return { value, output: true };
      });
      if (!reserved) return draftView(await owned(uid,d.id));
      try {
        const candidate = await generate(sourceQ, { ...d.context, existingQuestions: d.sourceQuestions }, uid);
        if (candidate.type !== sourceQ.type) throw new Error("Die Variante hat das vereinbarte Format geändert.");
        if (normText(candidate.text) === normText(sourceQ.text) && digest(candidate) === digest(sourceQ)) throw new Error("Die Variante wiederholt die Quelle.");
        const item = { ...compileQuestion({ ...candidate, id: sourceQ.id }), kind: "similar" }; await currentSource(d);
        await repo.mutate(`learningDrafts/${d.id}`, value => {
          if (value.requests[key]?.status !== "running" || value.status !== "draft") return { output: null };
          if (value.items.some(old => old.id === item.id)) throw new Error("Diese Variante existiert bereits.");
          value.items.push(item); value.requests[key].status = "ready"; return { value };
        });
      } catch (error) {
        await repo.mutate(`learningDrafts/${d.id}`, value => { if (value.requests[key]?.status === "running") { value.requests[key].status = "failed"; value.requests[key].message = String(error.message).slice(0,300); } return { value }; });
      }
      return draftView(await owned(uid,d.id));
    },
    async cancel(uid, data) {
      const d = await owned(uid,data.draftId), key = digest(id(data.requestId)).slice(0,24);
      await repo.mutate(`learningDrafts/${d.id}`, value => { if (value.requests[key]?.status === "running") value.requests[key].status = "cancelled"; return { value }; });
      return draftView(await owned(uid,d.id));
    },
    async publish(uid, data) {
      const d = await owned(uid,data.draftId); await currentSource(d);
      if (data.reviewed !== true || data.rightsConfirmed !== true || data.revision !== revision(d) || Object.values(d.requests).some(r => r.status === "running")) throw new Error("Prüfe alle Aufgaben und Schlüssel dieser Revision und bestätige die Lernfreigabe.");
      await repo.mutate(`learningPublications/${d.id}`, old => { if (old) { if (old.revision !== data.revision) throw new Error("Veröffentlichte Version ist unveränderlich."); return { output: null }; } return { value: { ...d, revision: data.revision, sourceQuestions: [], requests: {}, status: "published", expiresAt: expiry(30) } }; });
      await repo.mutate(`learningDrafts/${d.id}`, value => ({ value: { ...value, status: "published" } }));
      return { publicationId: d.id, revision: data.revision, duration: d.duration };
    },
    async start(data) {
      const publicationId = id(data.publicationId), requestId = id(data.requestId), p = await repo.get(`learningPublications/${publicationId}`);
      if (!p || p.expiresAt <= now()) throw new Error("Diese Lernfreigabe ist nicht verfügbar."); await currentSource(p);
      if (!/^[a-f0-9-]{36}$/i.test(requestId)) throw new Error("Ein sicherer Sitzungsstart braucht eine neue UUID.");
      const sessionId = digest({ publicationId, requestId }).slice(0,40), token = randomBytes(32).toString("hex");
      const result = await repo.mutate(`learningSessions/${sessionId}`, previous => {
        if (previous) { if (previous.expiresAt <= now()) throw new Error("Diese Sitzung ist abgelaufen."); return { output: { ...publicSession(previous), token: previous.token } }; }
        const s = { id: sessionId, publicationId, ownerId: p.ownerId, sourceId: p.sourceId, sourceFingerprint: p.sourceFingerprint, token, tokenHash: digest(token), revision: p.revision, title: p.title, items: p.items, index: 0, seed: randomBytes(4).readUInt32BE(0), duration: p.duration, endsAt: p.duration ? now() + p.duration * 1000 : null, expiresAt: expiry(1) };
        return { value: s, output: { ...publicSession(s), token } };
      }); return result;
    },
    async step(data) {
      const sessionId = id(data.sessionId), initial = await repo.get(`learningSessions/${sessionId}`);
      const supplied = Buffer.from(digest(String(data.token || ""))), stored = Buffer.from(String(initial?.tokenHash || ""));
      if (!initial || initial.expiresAt <= now() || stored.length !== supplied.length || !timingSafeEqual(stored,supplied)) throw new Error("Diese private Sitzung ist nicht verfügbar.");
      await currentSource(initial);
      return repo.mutate(`learningSessions/${sessionId}`, s => {
        const current = publicSession(s); if (current.ended || data.action === "resume") return { output: current };
        const task = nextItem(s.items,s.index,s.seed);
        if (data.taskId !== task.id) return { output: current };
        if (data.action === "next") { s.index++; return { value: s, output: publicSession(s) }; }
        if (data.action === "answer") return { output: publicSession(s, check(task,data.answer)) };
        if (data.action === "help") return { output: publicSession(s, { message: `${task.hint} Lösung für diese freigegebene Lernaufgabe: ${solution(task)}`, help: true }) };
        throw new Error("Unbekannte Lernaktion.");
      });
    }
  }; return api;
}
const normText = value => String(value || "").normalize("NFKC").replace(/\s+/g," ").trim().toLowerCase();
module.exports = { createLearningService, solution, draftView };
