"use strict";

(() => {
  const $ = id => document.getElementById(id);
  const hostProject = {
    "hausaufgabe-staging.web.app": "hausaufgabe-staging",
    "hausaufgabe-40294.web.app": "hausaufgabe-40294"
  };
  const projectId = hostProject[location.hostname] || "";
  const apiUrl = projectId ? `https://europe-west1-${projectId}.cloudfunctions.net/secureExamApi` : "";
  const boot = window.__GRADECREW_SECURE_BOOTSTRAP__ || {};

  const state = {
    code: String(boot.code || "").toUpperCase(),
    attemptId: String(boot.attemptId || ""),
    attemptToken: String(boot.attemptToken || ""),
    test: null,
    questions: [],
    answers: {},
    revision: 0,
    serverRevision: 0,
    deadlineAt: null,
    autosaveTimer: null,
    timerInterval: null,
    saveInFlight: false,
    saveAgain: false,
    submitInFlight: false,
    submitted: false,
    locked: false,
    retryTimer: null
  };

  function nativeEvent(type, payload = {}) {
    try {
      window.webkit?.messageHandlers?.gradecrewSecure?.postMessage({ type, ...payload });
    } catch (_) {}
  }

  function setStatus(text, kind = "neutral") {
    const el = $("connectionStatus");
    if (!el) return;
    el.textContent = text;
    el.dataset.kind = kind;
  }

  function showFatal(message) {
    state.locked = true;
    stopTimer();
    $("loadingScreen")?.classList.add("hidden");
    $("examScreen")?.classList.add("hidden");
    const fatal = $("fatalScreen");
    fatal?.classList.remove("hidden");
    if ($("fatalMessage")) $("fatalMessage").textContent = message;
    nativeEvent("testUnavailable", { message });
  }

  async function api(action, extra = {}) {
    if (!apiUrl) throw new Error("Unbekannte GradeCrew-Umgebung.");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          action,
          code: state.code,
          attemptId: state.attemptId,
          attemptToken: state.attemptToken,
          ...extra
        })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.ok === false) {
        const err = new Error(body.message || `Serverfehler (${response.status})`);
        err.code = body.error || `http-${response.status}`;
        throw err;
      }
      return { status: response.status, body };
    } finally {
      clearTimeout(timeout);
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
  }

  function tokenizeWords(text) {
    const pieces = String(text || "").match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*|[^\p{L}\p{N}]+/gu) || [];
    let wordIndex = 0;
    return pieces.map(piece => {
      const isWord = /[\p{L}\p{N}]/u.test(piece[0] || "");
      return { text: piece, isWord, wordIndex: isWord ? wordIndex++ : null };
    });
  }

  function answerChanged() {
    if (state.locked || state.submitted) return;
    state.revision += 1;
    updateProgress();
    nativeEvent("localSnapshot", { revision: state.revision, answers: state.answers });
    scheduleSave();
  }

  function scheduleSave(delay = 550) {
    clearTimeout(state.autosaveTimer);
    state.autosaveTimer = setTimeout(saveNow, delay);
  }

  async function saveNow() {
    if (state.submitted || state.locked && !state.deadlineAt) return;
    if (state.saveInFlight) {
      state.saveAgain = true;
      return;
    }
    state.saveInFlight = true;
    setStatus(navigator.onLine ? "Wird gespeichert …" : "Offline · lokal gesichert", navigator.onLine ? "saving" : "offline");
    try {
      const { body } = await api("save", { answers: state.answers, clientRevision: state.revision });
      if (body.expired) {
        state.locked = true;
        setStatus("Zeit abgelaufen · Abgabe wird abgeschlossen", "warning");
        submit(true);
      } else {
        state.serverRevision = Math.max(state.serverRevision, Number(body.revision || 0));
        setStatus("Gespeichert ✓", "saved");
      }
    } catch (err) {
      console.warn("Secure autosave failed", err);
      setStatus("Offline · Antworten bleiben auf diesem iPad gesichert", "offline");
    } finally {
      state.saveInFlight = false;
      if (state.saveAgain) {
        state.saveAgain = false;
        scheduleSave(150);
      }
    }
  }

  function recoveryCandidate(serverAnswers, serverRevision) {
    const recovery = boot.recovery && typeof boot.recovery === "object" ? boot.recovery : null;
    if (!recovery || typeof recovery.answers !== "object") return { answers: serverAnswers || {}, revision: Number(serverRevision || 0) };
    const recoveryRevision = Number(recovery.revision || 0);
    if (recoveryRevision > Number(serverRevision || 0)) return { answers: recovery.answers || {}, revision: recoveryRevision };
    return { answers: serverAnswers || {}, revision: Number(serverRevision || 0) };
  }

  async function startExam() {
    if (!state.code || !state.attemptId || state.attemptToken.length < 24) {
      return showFatal("Die sichere Prüfungssitzung fehlt oder ist beschädigt.");
    }
    try {
      const response = await api("start");
      const body = response.body;
      if (response.status === 202 || body.status === "starting") {
        setTimeout(startExam, Number(body.retryAfterMs || 700));
        return;
      }
      if (body.waiting) {
        if ($("loadingTitle")) $("loadingTitle").textContent = "Warte auf die Lehrkraft …";
        if ($("loadingText")) $("loadingText").textContent = "Der Test startet automatisch, sobald die Lehrkraft ihn freigibt.";
        setTimeout(startExam, 1200);
        return;
      }
      if (body.submitted === true) {
        state.submitted = true;
        showSubmitted(body.summary || {});
        nativeEvent("submissionPending", { receipt: body.receipt || "" });
        return;
      }
      if (body.status !== "running" || !Array.isArray(body.questions)) throw new Error("Der Server hat keinen laufenden Test geliefert.");
      state.test = body.test || {};
      state.questions = body.questions;
      state.deadlineAt = Number(body.deadlineAt || 0) || null;
      const restored = recoveryCandidate(body.savedAnswers, body.clientRevision);
      state.answers = restored.answers || {};
      state.revision = restored.revision;
      state.serverRevision = Number(body.clientRevision || 0);
      renderExam();
      nativeEvent("testReady");
      if (state.revision > state.serverRevision) scheduleSave(100);
    } catch (err) {
      console.error(err);
      if (["invalid-attempt", "run-changed", "secure-disabled", "test-unavailable"].includes(err.code)) return showFatal(err.message);
      if ($("loadingTitle")) $("loadingTitle").textContent = "Verbindung wird wiederhergestellt …";
      if ($("loadingText")) $("loadingText").textContent = "Deine Sitzung bleibt erhalten. GradeCrew versucht es erneut.";
      setTimeout(startExam, 1800);
    }
  }

  function renderExam() {
    $("loadingScreen")?.classList.add("hidden");
    $("fatalScreen")?.classList.add("hidden");
    $("examScreen")?.classList.remove("hidden");
    if ($("examTitle")) $("examTitle").textContent = state.test?.title || "Test";
    if ($("examMeta")) {
      const meta = [state.test?.subject, state.test?.grade ? `Klasse ${state.test.grade}` : "", `${state.questions.length} Aufgaben`].filter(Boolean);
      $("examMeta").textContent = meta.join(" · ");
    }
    const root = $("questions");
    root.innerHTML = "";
    state.questions.forEach((question, index) => root.appendChild(renderQuestion(question, index)));
    updateProgress();
    bindSubmit();
    startTimer();
    setStatus("Gespeichert ✓", "saved");
  }

  function renderQuestion(question, index) {
    const section = document.createElement("section");
    section.className = "questionCard";
    section.dataset.qid = question.id;
    const headingText = question.type === "gapfill" ? "Lückentext" : question.text;
    section.innerHTML = `<div class="questionTop"><span>Aufgabe ${index + 1}</span><strong>${Number(question.points || 0)} P.</strong></div><h2>${escapeHtml(headingText)}</h2>`;
    if (question.imageDataUrl) {
      const img = document.createElement("img");
      img.className = "questionImage";
      img.src = question.imageDataUrl;
      img.alt = question.imageAlt || "Abbildung zur Aufgabe";
      section.appendChild(img);
    }
    const body = document.createElement("div");
    body.className = "questionBody";
    section.appendChild(body);
    const current = state.answers[question.id];

    if (question.type === "text") {
      const input = document.createElement("textarea");
      input.rows = 3;
      input.placeholder = "Antwort eingeben";
      input.value = typeof current === "string" ? current : "";
      input.addEventListener("input", () => { state.answers[question.id] = input.value; answerChanged(); });
      body.appendChild(input);
    } else if (question.type === "number") {
      const row = document.createElement("div");
      row.className = "numberRow";
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "decimal";
      input.placeholder = "Ergebnis";
      input.value = typeof current === "string" ? current : "";
      input.addEventListener("input", () => { state.answers[question.id] = input.value; answerChanged(); });
      row.append(input);
      if (question.unit) { const unit = document.createElement("span"); unit.textContent = question.unit; row.append(unit); }
      body.appendChild(row);
    } else if (question.type === "dropdown") {
      const select = document.createElement("select");
      select.innerHTML = `<option value="">Bitte auswählen …</option>` + (question.options || []).map(o => `<option value="${escapeHtml(o.id)}">${escapeHtml(o.text)}</option>`).join("");
      select.value = typeof current === "string" ? current : "";
      select.addEventListener("change", () => { state.answers[question.id] = select.value; answerChanged(); });
      body.appendChild(select);
    } else if (question.type === "single" || question.type === "multi") {
      const selected = new Set(Array.isArray(current) ? current : current ? [current] : []);
      (question.options || []).forEach((option, shownIndex) => {
        const label = document.createElement("label");
        label.className = "choice";
        const input = document.createElement("input");
        input.type = question.type === "multi" ? "checkbox" : "radio";
        input.name = question.id;
        input.value = option.id;
        input.checked = selected.has(option.id);
        input.addEventListener("change", () => {
          if (question.type === "multi") {
            const values = Array.from(body.querySelectorAll("input:checked")).map(el => el.value);
            state.answers[question.id] = values;
          } else state.answers[question.id] = input.checked ? option.id : "";
          answerChanged();
        });
        label.append(input);
        if (option.imageDataUrl) { const img = document.createElement("img"); img.src = option.imageDataUrl; img.alt = option.imageAlt || `Bild ${shownIndex + 1}`; label.append(img); }
        const text = document.createElement("span"); text.textContent = option.text || `Bild ${shownIndex + 1}`; label.append(text);
        body.appendChild(label);
      });
    } else if (question.type === "truefalse") {
      [["true", "Richtig"], ["false", "Falsch"]].forEach(([value, labelText]) => {
        const label = document.createElement("label");
        label.className = "choice";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = question.id;
        input.value = value;
        input.checked = current === value;
        input.addEventListener("change", () => { if (input.checked) { state.answers[question.id] = value; answerChanged(); } });
        label.append(input, document.createTextNode(labelText));
        body.appendChild(label);
      });
    } else if (question.type === "gapfill") {
      const values = Array.isArray(current) ? [...current] : [];
      const sentence = document.createElement("div");
      sentence.className = "gapSentence";
      const parts = Array.isArray(question.gapParts) ? question.gapParts : [""];
      parts.forEach((part, gapIndex) => {
        sentence.appendChild(document.createTextNode(part));
        if (gapIndex < parts.length - 1) {
          const input = document.createElement("input");
          input.type = "text";
          input.placeholder = "…";
          input.value = values[gapIndex] || "";
          input.addEventListener("input", () => {
            const next = Array.isArray(state.answers[question.id]) ? [...state.answers[question.id]] : [];
            next[gapIndex] = input.value;
            state.answers[question.id] = next;
            answerChanged();
          });
          sentence.appendChild(input);
        }
      });
      body.appendChild(sentence);
    } else if (question.type === "matching") {
      const currentMap = current && typeof current === "object" && !Array.isArray(current) ? current : {};
      (question.leftItems || []).forEach(left => {
        const row = document.createElement("label");
        row.className = "matchRow";
        const text = document.createElement("span"); text.textContent = left.text;
        const select = document.createElement("select");
        select.innerHTML = `<option value="">Zuordnen …</option>` + (question.rightItems || []).map(right => `<option value="${escapeHtml(right.id)}">${escapeHtml(right.text)}</option>`).join("");
        select.value = currentMap[left.id] || "";
        select.addEventListener("change", () => {
          const next = state.answers[question.id] && typeof state.answers[question.id] === "object" && !Array.isArray(state.answers[question.id]) ? { ...state.answers[question.id] } : {};
          next[left.id] = select.value;
          state.answers[question.id] = next;
          answerChanged();
        });
        row.append(text, select);
        body.appendChild(row);
      });
    } else if (question.type === "ordering") {
      const byId = new Map((question.items || []).map(item => [item.id, item]));
      const savedOrder = Array.isArray(current) && current.length === byId.size ? current.filter(id => byId.has(id)) : [];
      const order = savedOrder.length === byId.size ? savedOrder : (question.items || []).map(item => item.id);
      const list = document.createElement("div");
      list.className = "orderList";
      const redraw = () => {
        list.innerHTML = "";
        order.forEach((id, position) => {
          const item = byId.get(id);
          const row = document.createElement("div");
          row.className = "orderItem";
          const label = document.createElement("span"); label.textContent = item?.text || "";
          const controls = document.createElement("div");
          const up = document.createElement("button"); up.type = "button"; up.textContent = "↑"; up.disabled = position === 0;
          const down = document.createElement("button"); down.type = "button"; down.textContent = "↓"; down.disabled = position === order.length - 1;
          up.addEventListener("click", () => { [order[position - 1], order[position]] = [order[position], order[position - 1]]; state.answers[question.id] = [...order]; redraw(); answerChanged(); });
          down.addEventListener("click", () => { [order[position + 1], order[position]] = [order[position], order[position + 1]]; state.answers[question.id] = [...order]; redraw(); answerChanged(); });
          controls.append(up, down); row.append(label, controls); list.appendChild(row);
        });
      };
      redraw(); body.appendChild(list);
    } else if (question.type === "grouping") {
      const currentMap = current && typeof current === "object" && !Array.isArray(current) ? current : {};
      (question.items || []).forEach(item => {
        const row = document.createElement("label"); row.className = "matchRow";
        const text = document.createElement("span"); text.textContent = item.text;
        const select = document.createElement("select");
        select.innerHTML = `<option value="">Gruppe wählen …</option>` + (question.groups || []).map(group => `<option value="${escapeHtml(group.id)}">${escapeHtml(group.name)}</option>`).join("");
        select.value = currentMap[item.id] || "";
        select.addEventListener("change", () => {
          const next = state.answers[question.id] && typeof state.answers[question.id] === "object" && !Array.isArray(state.answers[question.id]) ? { ...state.answers[question.id] } : {};
          next[item.id] = select.value;
          state.answers[question.id] = next;
          answerChanged();
        });
        row.append(text, select); body.appendChild(row);
      });
    } else if (question.type === "markwords") {
      const selected = new Set(Array.isArray(current) ? current.map(String) : []);
      const passage = document.createElement("div"); passage.className = "markPassage";
      tokenizeWords(question.passage).forEach(token => {
        if (!token.isWord) { passage.appendChild(document.createTextNode(token.text)); return; }
        const button = document.createElement("button");
        button.type = "button";
        button.className = "wordToken";
        button.textContent = token.text;
        button.dataset.index = String(token.wordIndex);
        button.classList.toggle("selected", selected.has(String(token.wordIndex)));
        button.addEventListener("click", () => {
          const key = String(token.wordIndex);
          if (selected.has(key)) selected.delete(key); else selected.add(key);
          button.classList.toggle("selected", selected.has(key));
          state.answers[question.id] = [...selected];
          answerChanged();
        });
        passage.appendChild(button);
      });
      body.appendChild(passage);
    }
    return section;
  }

  function isAnswered(question) {
    const value = state.answers[question.id];
    if (["text", "number", "single", "dropdown", "truefalse"].includes(question.type)) return String(value || "").trim() !== "";
    if (question.type === "multi" || question.type === "markwords") return Array.isArray(value) && value.length > 0;
    if (question.type === "gapfill") return Array.isArray(value) && value.length === Number(question.gapCount || 0) && value.every(v => String(v || "").trim());
    if (question.type === "matching") return value && typeof value === "object" && (question.leftItems || []).every(item => String(value[item.id] || "").trim());
    if (question.type === "ordering") return Array.isArray(value) && value.length === (question.items || []).length;
    if (question.type === "grouping") return value && typeof value === "object" && (question.items || []).every(item => String(value[item.id] || "").trim());
    return false;
  }

  function updateProgress() {
    const done = state.questions.filter(isAnswered).length;
    const total = state.questions.length;
    if ($("progressText")) $("progressText").textContent = `${done} von ${total} bearbeitet`;
    if ($("progressFill")) $("progressFill").style.width = `${total ? Math.round(done / total * 100) : 0}%`;
  }

  function bindSubmit() {
    $("submitButton")?.addEventListener("click", () => {
      const open = state.questions.filter(question => !isAnswered(question)).length;
      const message = open ? `${open} Aufgabe${open === 1 ? " ist" : "n sind"} noch offen. Trotzdem endgültig abgeben?` : "Alles bearbeitet. Test jetzt endgültig abgeben?";
      if (window.confirm(message)) submit(false);
    });
  }

  async function submit(autoSubmitted) {
    if (state.submitInFlight || state.submitted) return;
    state.submitInFlight = true;
    state.locked = true;
    disableInputs();
    if ($("submitButton")) { $("submitButton").disabled = true; $("submitButton").textContent = autoSubmitted ? "Zeit abgelaufen – wird abgegeben …" : "Wird abgegeben …"; }
    setStatus("Abgabe wird sicher gespeichert …", "saving");
    try {
      const { body } = await api("submit", { answers: state.answers, clientRevision: state.revision, autoSubmitted: Boolean(autoSubmitted) });
      if (!body.submitted || !body.receipt) throw new Error("Serverquittung fehlt.");
      state.submitted = true;
      stopTimer();
      showSubmitted(body.summary || {});
      nativeEvent("submissionPending", { receipt: body.receipt });
    } catch (err) {
      console.warn("Secure submit failed", err);
      setStatus("Verbindung fehlt · Abgabe wird automatisch erneut versucht", "offline");
      if ($("submitButton")) $("submitButton").textContent = "Abgabe wartet auf Verbindung …";
      clearTimeout(state.retryTimer);
      state.retryTimer = setTimeout(() => { state.submitInFlight = false; submit(autoSubmitted); }, 3000);
      return;
    }
    state.submitInFlight = false;
  }

  function disableInputs() {
    document.querySelectorAll("#questions input, #questions textarea, #questions select, #questions button").forEach(el => { el.disabled = true; });
  }

  function showSubmitted(summary) {
    $("loadingScreen")?.classList.add("hidden");
    $("examScreen")?.classList.add("hidden");
    const screen = $("submittedScreen");
    screen?.classList.remove("hidden");
    const score = $("submittedScore");
    if (!score) return;
    if (summary.points !== undefined && summary.maxPoints !== undefined) {
      score.textContent = `${summary.points}/${summary.maxPoints} Punkte${summary.needsReview ? " · teilweise noch zu prüfen" : ""}`;
    } else score.textContent = "Deine Antworten wurden gespeichert.";
  }

  function startTimer() {
    stopTimer();
    if (!state.deadlineAt) { $("timer")?.classList.add("hidden"); return; }
    $("timer")?.classList.remove("hidden");
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((state.deadlineAt - Date.now()) / 1000));
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      if ($("timerText")) $("timerText").textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
      $("timer")?.classList.toggle("warning", remaining <= 60);
      if (remaining <= 0) {
        stopTimer();
        state.locked = true;
        submit(true);
      }
    };
    tick();
    state.timerInterval = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  window.addEventListener("online", () => {
    if (state.submitted) return;
    setStatus("Verbindung wieder da · synchronisiere …", "saving");
    if (state.locked && state.deadlineAt && Date.now() >= state.deadlineAt) {
      state.submitInFlight = false;
      submit(true);
    } else scheduleSave(80);
  });
  window.addEventListener("offline", () => setStatus("Offline · Antworten bleiben auf diesem iPad gesichert", "offline"));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !state.submitted) scheduleSave(80);
  });

  startExam();
})();
