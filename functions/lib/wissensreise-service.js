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
  if(task.type==="markwords")return Array.isArray(task.key)?task.public.tokens.filter(t=>task.key.includes(t.index)).map(t=>t.text).join("; "):Object.entries(task.key).map(([index,color])=>`${task.public.tokens.find(t=>String(t.index)===index)?.text}: ${task.public.markGroups.find(g=>g.color===color)?.name}`).join("; ");
  return Array.isArray(task.key) ? task.key.map(key=>Array.isArray(key)?key.join(" oder "):key).join("; ") : String(task.key);
}
function draftView(draft) { return { id: draft.id, title: draft.title, sourceId: draft.sourceId, sourceCount:draft.sourceCount??draft.sourceQuestions.length, sourceUsed:draft.sourceQuestions.length, duration: draft.duration, mode:draft.mode, formats: draft.formats, revision: revision(draft), status: draft.status, excluded: draft.excluded, generatedCount: draft.generatedCount, remainingBudget: 6 - draft.generatedCount, requests: Object.values(draft.requests).map(r => ({ status: r.status, requestId: r.requestId })), items: draft.items.map((item,i) => { const task = present(item,i * 37); return { id: item.id, sourceId: item.sourceId, task: { ...task.public, id: task.id }, learning:item.learning||null, solution: solution(task), kind: item.kind || "source", parametric: Boolean(item.arithmetic) }; }) }; }
function createLearningService({ repo, generate, generateBatch, enqueue, now = Date.now }) {
  const expiry = days => now() + days * 86400000;
  async function source(uid, sourceId) { const value = await repo.loadSource(id(sourceId)); assertSource(value, uid); return value; }
  async function owned(uid, draftId) { const d = await repo.get(`learningDrafts/${id(draftId)}`); if (!d || d.ownerId !== uid || d.expiresAt <= now()) throw new Error("Lernentwurf nicht verfügbar."); return d; }
  async function currentSource(d) { const s = await source(d.ownerId, d.sourceId); if (digest(s) !== d.sourceFingerprint) throw new Error("Der Ausgangstest wurde geändert. Erstelle und prüfe eine neue Lernkopie."); return s; }
  function sessionTask(s){if(s.mode!=="guided")return nextItem(s.items,s.index,s.seed);const sourceId=s.objectives[s.index%s.objectives.length],items=s.items.filter(i=>i.sourceId===sourceId);return nextItem(items,Math.floor(s.index/s.objectives.length),s.seed+s.index*37);}
  function publicSession(s, feedback) {
    const ended = s.endsAt !== null && now() >= s.endsAt;
    const task = ended ? null : (s.current || sessionTask(s)),stage=s.mode==="guided"?["anschauen","mitHilfe","selbständig","wiederholen"][Math.floor(s.index/s.objectives.length)%4]:"selbständig";
    return { sessionId: s.id, title: s.title, revision: s.revision, index: s.index, ended, serverNow: now(), endsAt: s.endsAt, duration: s.duration, mode:s.mode,stage,learning:task?.learning||{objective:`Übe die Inhalte aus deinem Test „${s.title}“.`,explanation:"Dieser Test enthält noch keine geprüfte Erklärung. Du kannst Hilfe verwenden oder die Lehrkraft um einen geprüften Variantenpuffer bitten.",workedExample:"",hint:""},progress:s.progress||{},task: task ? { ...task.public, id: task.id } : null, feedback: feedback || s.lastFeedback || null, repetition: s.index >= s.items.length && s.items.some(i => !i.arithmetic), poolSize: s.items.length, autoVariants: s.autoVariants === true, notice: "Neue Beispiele werden automatisch geprüft. KI kann trotzdem fachliche Fehler machen. Nach Budgetende oder Ausfall: Wiederholung, neue Varianten derzeit nicht verfügbar. Die Runde läuft bis zum Countdown weiter." };
  }
  const api = {
    async prepare(uid, data) {
      const s = await source(uid, data.sourceId), requestId = id(data.requestId);
      if (![0,120,180].includes(data.duration)) throw new Error("Wähle freies Lernen, zwei oder drei Minuten.");
      const mode=data.mode||"practice";if(!["practice","guided"].includes(mode))throw new Error("Wähle geführtes Lernen oder freies Üben.");
      const formats = Array.isArray(data.formats) ? [...new Set(data.formats)].filter(t => FORMATS.includes(t)).sort() : FORMATS;
      if (!formats.length) throw new Error("Wähle mindestens eine Übungsart.");
      if (!Array.isArray(s.questions) || !s.questions.length) throw new Error("Dieser Test enthält noch keine gespeicherten Aufgaben.");
      if (s.questions.length>100) throw new Error("Dieser Test überschreitet das GradeCrew-Limit von100Aufgaben. Wähle einen Test mit höchstens100Aufgaben.");
      const binding = digest({ sourceId: data.sourceId, sourceFingerprint: digest(s), duration: data.duration, formats,mode });
      const draftId = digest({ uid, requestId }).slice(0,40);
      return repo.mutate(`learningDrafts/${draftId}`, old => {
        if (old) { if (old.ownerId !== uid || old.binding !== binding) throw new Error("Diese Anfrage gehört bereits zu einer anderen Lernkopie."); return { output: draftView(old) }; }
        const items = [], excluded = [], sourceQuestions = [];let sourceBytes=0;
        for (const q of s.questions) {try { const item = compileQuestion(q);const bytes=Buffer.byteLength(JSON.stringify(q));if(sourceBytes+bytes>60000)throw new Error("Die kompakte Lernkopie ist voll. Diese Aufgabe ist nicht enthalten; nutze einen kürzeren Ausgangstest für den übrigen Inhalt.");sourceBytes+=bytes;sourceQuestions.push(q);if(formats.includes(q.type))items.push(item);else excluded.push({sourceId:q.id,reason:"Originalansicht nicht gewählt; passende Varianten in gewählten Lernansichten können erzeugt werden."}); } catch (e) { excluded.push({ sourceId: String(q.id || ""), reason: e.message }); } }
        if (!sourceQuestions.length) throw new Error("Keine zuverlässig automatisch spielbare Ausgangsaufgabe gefunden.");
        const d = { id: draftId, ownerId: uid, sourceId: data.sourceId, sourceFingerprint: digest(s), title: String(s.title || "Wissensreise").slice(0,160), context: { subject: String(s.subject || ""), grade: String(s.grade || ""), topic: String(s.topic || s.title || "") }, binding, formats,mode, duration: data.duration, sourceCount:s.questions.length, sourceQuestions, items, excluded, generatedCount: 0, batchCount: 0, requests: {}, status: "draft", expiresAt: expiry(7) };
        return { value: d, output: draftView(d) };
      });
    },
    async get(uid, data) { const d = await owned(uid,data.draftId); await currentSource(d); return draftView(d); },
    async generateBuffer(uid,data) {
      const d=await owned(uid,data.draftId);await currentSource(d);const requestId=id(data.requestId),key=digest(requestId).slice(0,24);
      const reserved=await repo.mutate(`learningDrafts/${d.id}`,value=>{
        if(value.status!=="draft")throw new Error("Diese Version ist bereits veröffentlicht.");
        if(value.requests[key])return{output:false};
        if(Object.values(value.requests).some(r=>r.status==="running"))throw new Error("Eine Erstellung läuft bereits. Prüfe ihren gespeicherten Status.");
        if(value.batchCount>=3)throw new Error("Die drei verfügbaren Variantenpuffer sind ausgeschöpft.");
        value.batchCount++;value.requests[key]={requestId,status:"running",kind:"buffer"};return{value,output:true};
      });
      if(!reserved)return draftView(await owned(uid,d.id));
      try {
        const items=await generateBatch({ownerId:uid,sourceQuestions:d.sourceQuestions,context:d.context,existing:d.items,formats:d.formats,batchIndex:d.batchCount||0});await currentSource(d);
        await repo.mutate(`learningDrafts/${d.id}`,value=>{if(value.requests[key]?.status!=="running"||value.status!=="draft")return{output:null};value.items.push(...items);value.requests[key].status="ready";return{value};});
      } catch(error){await repo.mutate(`learningDrafts/${d.id}`,value=>{if(value.requests[key]?.status==="running"){value.requests[key].status="failed";value.requests[key].message=String(error.message).slice(0,300);}return{value};});}
      return draftView(await owned(uid,d.id));
    },
    async generate(uid, data) {
      const d = await owned(uid,data.draftId); await currentSource(d); const requestId = id(data.requestId);
      const key = digest(requestId).slice(0,24), sourceQ = d.sourceQuestions.find(q => q.id === data.sourceItemId);
      if (!sourceQ) throw new Error("Ausgangsaufgabe fehlt.");
      if(!d.formats.includes(sourceQ.type))throw new Error("Diese Einzelvariante passt nicht zu den ausgewählten Lernansichten. Verwende die geprüfte Pufferkonvertierung.");
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
      if (!d.items.length || data.reviewed !== true || data.rightsConfirmed !== true || data.revision !== revision(d) || Object.values(d.requests).some(r => r.status === "running")) throw new Error("Erzeuge mindestens eine passende Aufgabe, prüfe alle Aufgaben und Schlüssel dieser Revision und bestätige die Lernfreigabe.");
      await repo.mutate(`learningPublications/${d.id}`, old => { if (old) { if (old.revision !== data.revision || old.autoVariants !== (data.autoVariants===true)) throw new Error("Veröffentlichte Version und Variantenfreigabe sind unveränderlich."); return { output: null }; } return { value: { ...d, revision: data.revision, autoVariants:data.autoVariants===true, requests: {}, status: "published", expiresAt: expiry(30) } }; });
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
        const s = { id: sessionId, publicationId, ownerId: p.ownerId, sourceId: p.sourceId, sourceFingerprint: p.sourceFingerprint, token, tokenHash: digest(token), revision: p.revision, title: p.title, items: p.items, autoVariants:p.autoVariants===true, index: 0, seed: randomBytes(4).readUInt32BE(0), duration: p.duration, endsAt: p.duration ? now() + p.duration * 1000 : null, expiresAt: expiry(1) };
        s.mode=p.mode;s.objectives=[...new Set(p.items.map(i=>i.sourceId))];s.progress={helpUsed:false,attempted:false};s.current=sessionTask(s);
        return { value: s, output: { ...publicSession(s), token } };
      }); return result;
    },
    async step(data) {
      const sessionId = id(data.sessionId), initial = await repo.get(`learningSessions/${sessionId}`);
      const supplied = Buffer.from(digest(String(data.token || ""))), stored = Buffer.from(String(initial?.tokenHash || ""));
      if (!initial || initial.expiresAt <= now() || stored.length !== supplied.length || !timingSafeEqual(stored,supplied)) throw new Error("Diese private Sitzung ist nicht verfügbar.");
      await currentSource(initial);
      const buffer=await repo.get(`learningBuffers/${initial.publicationId}`);
      return repo.mutate(`learningSessions/${sessionId}`, s => {
        const current = publicSession(s); if (current.ended || data.action === "resume") return { output: current };
        const task = s.current || sessionTask(s);
        if (data.taskId !== task.id) return { output: current };
        if (data.action === "next") {const known=new Set(s.items.map(i=>i.id));s.items.push(...(buffer?.items||[]).filter(i=>!known.has(i.id)));s.index++;s.progress={helpUsed:false,attempted:false};s.lastFeedback=null;s.current=sessionTask(s); return { value: s, output: publicSession(s) }; }
        if (data.action === "answer") {s.progress.attempted=true;s.lastFeedback=check(task,data.answer);return { value:s,output: publicSession(s,s.lastFeedback) };}
        if (data.action === "help") {s.progress.helpUsed=true;s.progress.helpLevel=Math.min(3,Number(s.progress.helpLevel||0)+1);const level=s.progress.helpLevel;const text=level===1?task.hint:level===2?(task.learning?.workedExample||"Für diese Aufgabe liegt noch kein geprüftes Erklärbeispiel vor. Du kannst anschließend die freigegebene Lernlösung ansehen."):`Lösung für diese freigegebene Lernaufgabe: ${solution(task)}`;s.lastFeedback={ message:`Hilfe ${level}/3: ${text}`, help: true };return { value:s,output: publicSession(s,s.lastFeedback) };}
        throw new Error("Unbekannte Lernaktion.");
      });
    },
    async refill(data) {
      const session=await api.step({...data,action:"resume"});if(session.ended||!session.autoVariants)return{status:"disabled"};
      const s=await repo.get(`learningSessions/${id(data.sessionId)}`),p=await repo.get(`learningPublications/${s.publicationId}`);if(!p||p.expiresAt<=now())throw new Error("Lernfreigabe abgelaufen.");await currentSource(p);
      if(s.items.length-s.index>8)return{status:"ready"};
      const job=await repo.mutate(`learningBuffers/${p.id}`,old=>{const b=old||{items:[],count:p.batchCount||0,jobs:{},expiresAt:p.expiresAt};const pending=Object.values(b.jobs).find(j=>["queued","running"].includes(j.status));if(pending){pending.validUntil=Math.max(pending.validUntil,s.endsAt||s.expiresAt);return{value:b,output:null};}if(b.count>=3)return{output:null};b.count++;const batchId=`batch-${b.count}`;b.jobs[batchId]={status:"queued",validUntil:s.endsAt||s.expiresAt};return{value:b,output:{publicationId:p.id,batchId}};});
      if(job){try{await enqueue(job);}catch(e){await repo.mutate(`learningBuffers/${p.id}`,b=>{if(b.jobs[job.batchId]?.status==="queued")b.jobs[job.batchId].status="failed";return{value:b};});return{status:"failed"};}}
      return{status:job?"queued":"bounded"};
    },
    async processBuffer(data) {
      const publicationId=id(data.publicationId),batchId=id(data.batchId),p=await repo.get(`learningPublications/${publicationId}`);
      if(!p||p.expiresAt<=now()||!p.autoVariants)return;
      const reserved=await repo.mutate(`learningBuffers/${publicationId}`,b=>{if(!b||b.jobs[batchId]?.status!=="queued")return{output:false};if(b.jobs[batchId].validUntil<=now()){b.jobs[batchId].status="cancelled";return{value:b,output:false};}b.jobs[batchId].status="running";return{value:b,output:true};});if(!reserved)return;
      const shouldContinue=async()=>{const b=await repo.get(`learningBuffers/${publicationId}`);return b?.jobs[batchId]?.status==="running"&&b.jobs[batchId].validUntil>now();};
      try {await currentSource(p);const b=await repo.get(`learningBuffers/${publicationId}`),items=await generateBatch({ownerId:p.ownerId,sourceQuestions:p.sourceQuestions,context:p.context,existing:[...p.items,...b.items],formats:p.formats,batchIndex:Number(batchId.split("-")[1])-1,shouldContinue});await currentSource(p);await repo.mutate(`learningBuffers/${publicationId}`,value=>{if(value.jobs[batchId]?.status!=="running"||value.jobs[batchId].validUntil<=now())return{output:null};value.items.push(...items);value.jobs[batchId].status="ready";return{value};});}
      catch(error){await repo.mutate(`learningBuffers/${publicationId}`,b=>{b.jobs[batchId].status="failed";b.jobs[batchId].message=String(error.message).slice(0,300);return{value:b};});}
    },
    async develop(uid,data) {
      await api.step({...data,action:"resume"});const s=await repo.get(`learningSessions/${id(data.sessionId)}`);if(s.ownerId!==uid)throw new Error("Entwicklermodus nur für eigene Lernkopien.");
      return repo.mutate(`learningSessions/${s.id}`,value=>{if(data.action==="reset"){value.index=0;value.endsAt=value.duration?now()+value.duration*1000:null;}else if(data.action==="jump"&&Number.isInteger(data.index)&&data.index>=0&&data.index<value.items.length)value.index=data.index;else throw new Error("Ungültiger Aufgabensprung.");value.progress={helpUsed:false,attempted:false};value.lastFeedback=null;value.current=sessionTask(value);return{value,output:publicSession(value)};});
    }
  }; return api;
}
const normText = value => String(value || "").normalize("NFKC").replace(/\s+/g," ").trim().toLowerCase();
module.exports = { createLearningService, solution, draftView };
