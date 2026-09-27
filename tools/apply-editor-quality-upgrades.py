from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def write(path, text):
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


def replace_regex_once(text, pattern, repl, label):
    new, count = re.subn(pattern, repl, text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one regex match, found {count}")
    return new


# ---------- Server: allow up to 100 tasks, still generated in small batches ----------
constants = read("functions/lib/constants.js")
constants = replace_once(constants, "maxQuestions: 50,", "maxQuestions: 100,", "maxQuestions")
write("functions/lib/constants.js", constants)

schemas = read("functions/lib/schemas.js")
schemas = schemas.replace("count > 50", "count > 100").replace("maxItems: count || 50", "maxItems: count || 100")
write("functions/lib/schemas.js", schemas)

batches = read("functions/lib/test-batches.js")
batches = replace_once(batches, "count > 50", "count > 100", "batch max questions")
write("functions/lib/test-batches.js", batches)

# ---------- Server: quality review understands internal gapfill syntax and repairs before warning ----------
quality = read("functions/lib/quality.js")
quality = replace_once(
    quality,
    "Tatsächlich erzeugte Bildpixel liegen noch nicht vor; bewerte hier die geplanten Szenen. Gib nur eindeutig feststellbare Probleme zurück.",
    "Tatsächlich erzeugte Bildpixel liegen noch nicht vor; bewerte hier die geplanten Szenen. WICHTIG: Bei Lückentext-Aufgaben (type gapfill) stehen Lösungen intern in eckigen Klammern, z. B. [München]. Diese Klammerinhalte werden Schülern als leere Eingabefelder angezeigt und sind deshalb KEIN answer_leak. Bewerte nur Inhalte als Lösungshinweis, die Schüler tatsächlich sehen. Interne Lösungsfelder, correct-Markierungen und Metadaten sind nicht sichtbar. Gib nur eindeutig feststellbare Probleme zurück.",
    "gapfill review visibility"
)
quality = replace_regex_once(
    quality,
    r"function normalizeReviewIssues\(response, test\) \{.*?\n\}\n\nasync function reviewAndRepairTest",
    '''function normalizeReviewIssues(response, test) {
  if (!Array.isArray(response?.issues)) throw new Error("KI-Qualitätsprüfung lieferte keine Aufgabenbewertung.");
  const byIndex = new Map();
  for (const issue of response.issues) {
    const index = issue?.index;
    if (!Number.isInteger(index) || index < 0 || index >= test.questions.length || !reviewSchema.properties.issues.items.properties.reason.enum.includes(issue.reason)) throw new Error("KI-Qualitätsprüfung lieferte ungültige Aufgabenindizes oder Fehlergründe.");
    const reason = String(issue.reason);
    const rawDetail = String(issue?.detail || "").trim().slice(0, 200) || QUALITY_REASONS[reason] || "Qualitätsproblem";
    const previous = byIndex.get(index);
    if (!previous) byIndex.set(index, { index, text: test.questions[index].text, reason, detail: `${reason}: ${rawDetail}` });
    else if (previous.detail.length < 400) {
      previous.detail += `; ${reason}: ${rawDetail}`;
      previous.reason = previous.reason === reason ? reason : "multiple";
    }
  }
  if (response.issues.length && !byIndex.size) throw new Error("KI-Qualitätsprüfung lieferte ungültige Aufgabenindizes.");
  return [...byIndex.values()];
}

async function reviewAndRepairTest''',
    "normalize structured review issues"
)
quality = replace_regex_once(
    quality,
    r"async function reviewAndRepairTest\(test, options, \{ review, generateQuestion, regenerateTest, maxReviews = 3 \}\) \{.*?\n\}\n\nasync function verifyImageScene",
    '''async function reviewAndRepairTest(test, options, { review, generateQuestion, regenerateTest, maxReviews = 3 }) {
  let draft = test;
  let reviewPasses = 0, replaced = 0, questionAttempts = 0;
  // Every detected issue gets a repair attempt. Only after all repair rounds do we
  // run one final independent review whose remaining issues become teacher hints.
  for (let repairRound = 0; repairRound < maxReviews; repairRound += 1) {
    const issues = normalizeReviewIssues(await review(draft), draft);
    reviewPasses += 1;
    if (!issues.length) return { test: draft, errors: [], issues: [], reviewPasses, replaced, questionAttempts };
    const repaired = await validateAndRepairTest(draft, { ...options, reviewIssues: issues }, { generateQuestion, regenerateTest });
    draft = repaired.test;
    replaced += repaired.replaced;
    questionAttempts += repaired.questionAttempts;
    if (repaired.errors.length) return { test: draft, errors: repaired.errors, issues, reviewPasses, replaced, questionAttempts };
  }
  const finalIssues = normalizeReviewIssues(await review(draft), draft);
  reviewPasses += 1;
  return {
    test: draft,
    errors: finalIssues.map(issue => `Aufgabe ${issue.index + 1}: ${issue.detail}`),
    issues: finalIssues,
    reviewPasses,
    replaced,
    questionAttempts
  };
}

async function verifyImageScene''',
    "repair all quality rounds"
)
write("functions/lib/quality.js", quality)

# Preserve structured quality issues for clickable editor markers.
index = read("functions/index.js")
index = replace_once(
    index,
    '''    const qualityWarnings = hardErrors.length ? [] : [
      ...(memory.unavailable ? ["Frühere Lehrerbewertungen waren bei dieser Erstellung nicht verfügbar. Bitte die Aufgaben besonders sorgfältig prüfen."] : []),
      ...reviewed.errors
    ].slice(0, 10);''',
    '''    const qualityIssues = hardErrors.length ? [] : (reviewed.issues || []).slice(0, 10).map(issue => ({
      questionPosition: issue.index + 1,
      reason: String(issue.reason || "other").slice(0, 30),
      detail: String(issue.detail || "").replace(/^[a-z_]+:\\s*/i, "").slice(0, 300)
    }));
    const qualityWarnings = hardErrors.length ? [] : [
      ...(memory.unavailable ? ["Frühere Lehrerbewertungen waren bei dieser Erstellung nicht verfügbar. Bitte die Aufgaben besonders sorgfältig prüfen."] : []),
      ...qualityIssues.map(issue => `Aufgabe ${issue.questionPosition}: ${issue.reason}: ${issue.detail}`)
    ].slice(0, 10);''',
    "structured quality issues"
)
index = replace_once(index, "        qualityWarnings\n      }", "        qualityWarnings,\n        qualityIssues\n      }", "quality issues in meta")
index = replace_once(
    index,
    'qualityWarnings: response.meta.qualityWarnings || [], updatedAt: Timestamp.now() });',
    'qualityWarnings: response.meta.qualityWarnings || [], qualityIssues: response.meta.qualityIssues || [], updatedAt: Timestamp.now() });',
    "quality issues on quiz"
)
index = replace_once(
    index,
    'qualityWarnings: response.meta.qualityWarnings || [] });',
    'qualityWarnings: response.meta.qualityWarnings || [], qualityIssues: response.meta.qualityIssues || [] });',
    "quality issues on job"
)
write("functions/index.js", index)

# ---------- Browser app ----------
app = read("app.js")
app = app.replace('2.3.1-ai27', '2.3.1-ai28')

app = replace_once(
    app,
    '''    state.pendingImportReport = q.qualityWarnings?.length && !q.aiReviewAcknowledgedAt && !q.published
      ? { quizId: code, warnings: q.qualityWarnings.map(warning => `KI-Qualitätsprüfung: ${warning}`), repairs: [] }
      : null;''',
    '''    state.pendingImportReport = buildQualityReviewReport(q, code);''',
    "open editor quality report"
)

app = replace_regex_once(
    app,
    r"function renderImportReviewBanner\(\) \{.*?\n\}\n\nasync function completeAiReview",
    '''function parseStoredQualityIssue(value) {
  if (!value) return null;
  if (typeof value === "object" && Number.isInteger(Number(value.questionPosition))) {
    return {
      questionPosition: Number(value.questionPosition),
      reason: String(value.reason || "other"),
      detail: String(value.detail || "").replace(/^[a-z_]+:\\s*/i, "").trim()
    };
  }
  const text = String(value || "").replace(/^KI-Qualitätsprüfung:\\s*/i, "").trim();
  const match = text.match(/^Aufgabe\\s+(\\d+):\\s*(?:(incorrect|answer_leak|image_mismatch|ambiguous|duplicate|multiple):\\s*)?(.*)$/i);
  if (!match) return null;
  return { questionPosition: Number(match[1]), reason: match[2] || "other", detail: String(match[3] || "").trim() };
}

function qualityIssueShortLabel(issue) {
  const labels = {
    incorrect: "Inhalt prüfen",
    answer_leak: "Lösungshinweis prüfen",
    image_mismatch: "Bild prüfen",
    ambiguous: "Eindeutigkeit prüfen",
    duplicate: "Ähnliche Aufgabe prüfen",
    multiple: "Mehrere Punkte prüfen",
    other: "Aufgabe prüfen"
  };
  return labels[issue?.reason] || labels.other;
}

function buildQualityReviewReport(quiz, code) {
  if (!quiz || quiz.aiReviewAcknowledgedAt || quiz.published) return null;
  const structured = Array.isArray(quiz.qualityIssues) ? quiz.qualityIssues.map(parseStoredQualityIssue).filter(Boolean) : [];
  const warnings = Array.isArray(quiz.qualityWarnings) ? quiz.qualityWarnings : [];
  const parsedWarnings = warnings.map(parseStoredQualityIssue).filter(Boolean);
  const seen = new Set();
  const issues = [...structured, ...parsedWarnings].filter(issue => {
    const key = `${issue.questionPosition}:${issue.reason}:${issue.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const generalWarnings = warnings.filter(warning => !parseStoredQualityIssue(warning));
  if (!issues.length && !generalWarnings.length && !isAiReviewPending(quiz)) return null;
  return { quizId: code, issues, warnings: generalWarnings, repairs: [] };
}

function activeQualityIssue(index) {
  return state.pendingImportReport?.issues?.find(issue => issue.questionPosition === index + 1) || null;
}

function scrollToQualityIssue(position) {
  const index = Math.max(0, Number(position) - 1);
  const card = document.querySelector(`.questionCard[data-index="${index}"]`);
  if (!card) return;
  card.classList.remove("collapsed");
  const collapse = card.querySelector(".collapseQuestion");
  if (collapse) { collapse.textContent = "⌃"; collapse.title = "Aufgabe einklappen"; }
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  card.classList.add("qualityIssueFlash");
  setTimeout(() => card.classList.remove("qualityIssueFlash"), 1800);
}

function renderImportReviewBanner() {
  const host = $("importReviewBanner");
  if (!host) return;
  const report = state.pendingImportReport;
  const pendingAiReview = isAiReviewPending(state.currentQuiz);
  const issues = report?.quizId === state.currentQuiz?.id ? (report.issues || []) : [];
  const generalWarnings = report?.quizId === state.currentQuiz?.id ? (report.warnings || []) : [];
  const warningCount = issues.length + generalWarnings.length;
  const hasReport = warningCount > 0 || Boolean(report?.repairs?.length);
  if (!pendingAiReview && !hasReport) {
    host.classList.add("hidden");
    host.innerHTML = "";
    return;
  }
  host.classList.remove("hidden");
  const heading = pendingAiReview ? "KI-Entwurf prüfen" : state.currentQuiz?.generationJobId ? "KI-Teilentwurf" : "Test importiert";
  const issueButtons = issues.length ? `<div class="qualityJumpList">${issues.map(issue => `<button class="qualityJump" type="button" data-position="${issue.questionPosition}"><strong>Aufgabe ${issue.questionPosition}</strong><span>${escapeHtml(qualityIssueShortLabel(issue))}</span></button>`).join("")}</div>` : "";
  const general = generalWarnings.length ? `<details><summary>${generalWarnings.length} weiterer Hinweis${generalWarnings.length === 1 ? "" : "e"}</summary><ul>${generalWarnings.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul></details>` : "";
  host.innerHTML = `<div class="importReviewIcon">${warningCount ? "⚠️" : "✓"}</div><div class="importReviewText"><strong>${warningCount ? `${heading} · ${warningCount} Hinweis${warningCount === 1 ? "" : "e"}` : heading}</strong><p>${pendingAiReview ? (warningCount ? "Testify hat diese Stellen markiert. Tippe auf eine Aufgabe, um direkt dorthin zu springen." : "Kontrolliere den Test kurz und schließe die Prüfung danach ab.") : "Du kannst den Test jetzt prüfen, bearbeiten und anschließend veröffentlichen."}</p>${issueButtons}${general}</div><div class="importReviewActions">${issues.length ? '<button class="button ghost jumpFirstQualityIssue" type="button">Ersten Hinweis öffnen</button>' : ""}${pendingAiReview ? '<button class="button secondary completeAiReview" type="button">Prüfung abgeschlossen</button>' : ""}<button class="button ghost closeImportReview" type="button">Später</button></div>`;
  host.querySelectorAll(".qualityJump").forEach(button => button.addEventListener("click", () => scrollToQualityIssue(button.dataset.position)));
  host.querySelector(".jumpFirstQualityIssue")?.addEventListener("click", () => scrollToQualityIssue(issues[0]?.questionPosition));
  host.querySelector(".completeAiReview")?.addEventListener("click", () => completeAiReview(state.currentQuiz.id, true));
  host.querySelector(".closeImportReview")?.addEventListener("click", () => {
    state.pendingImportReport = null;
    host.classList.add("hidden");
    renderQuestions();
  });
}

async function completeAiReview''',
    "clickable quality review banner"
)

app = replace_once(
    app,
    '''    node.dataset.index = String(index);
    node.querySelector(".questionNumber").textContent = `Aufgabe ${index + 1}`;''',
    '''    node.dataset.index = String(index);
    const qualityIssue = activeQualityIssue(index);
    if (qualityIssue) {
      node.classList.add("qualityIssueQuestion");
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = "qualityIssueMarker";
      marker.title = qualityIssue.detail || qualityIssueShortLabel(qualityIssue);
      marker.innerHTML = `<span>!</span>${escapeHtml(qualityIssueShortLabel(qualityIssue))}`;
      marker.addEventListener("click", () => scrollToQualityIssue(index + 1));
      node.querySelector(".questionNumber").after(marker);
    }
    node.querySelector(".questionNumber").textContent = `Aufgabe ${index + 1}`;''',
    "question quality marker"
)

app = replace_once(
    app,
    '''  panel.innerHTML = `<strong>Bild einfügen</strong><p>Datei hier hineinziehen oder hier klicken und mit <kbd>Cmd</kbd>/<kbd>Strg</kbd> + <kbd>V</kbd> aus der Zwischenablage einfügen.</p><div class="imageActions"></div>`;''',
    '''  panel.innerHTML = `<strong>Bild einfügen</strong><p>Datei hier hineinziehen oder hier klicken und mit <kbd>Cmd</kbd>/<kbd>Strg</kbd> + <kbd>V</kbd> aus der Zwischenablage einfügen.</p><div class="imageActions"></div><div class="aiImageComposer"><div><strong>✨ Oder mit KI erzeugen</strong><small>Beschreibe kurz, was auf dem Bild zu sehen sein soll. Jede Generierung verursacht Kosten.</small></div><textarea class="aiImagePrompt" rows="2" maxlength="900" placeholder="z. B. Ein Zahlenstrahl von 0 bis 100 mit Markierung bei 35"></textarea><button class="button secondary generateAiQuestionImage" type="button">KI-Bild erstellen</button></div>`;''',
    "AI image prompt UI"
)
app = replace_once(
    app,
    '''  actions.append(makeMiniButton("Datei auswählen", () => file.click()), makeMiniButton("Screenshot aufnehmen", () => captureScreenForQuestion(q)), file);

  ["dragenter", "dragover"].forEach((name) => panel.addEventListener(name, (e) => {''',
    '''  actions.append(makeMiniButton("Datei auswählen", () => file.click()), makeMiniButton("Screenshot aufnehmen", () => captureScreenForQuestion(q)), file);
  panel.querySelector(".generateAiQuestionImage")?.addEventListener("click", () => generateAiImageForQuestion(q, panel));

  ["dragenter", "dragover"].forEach((name) => panel.addEventListener(name, (e) => {''',
    "AI image button binding"
)
app = replace_once(
    app,
    '''async function captureScreenForQuestion(q) {''',
    '''async function generateAiImageForQuestion(q, panel) {
  const promptInput = panel?.querySelector(".aiImagePrompt");
  const button = panel?.querySelector(".generateAiQuestionImage");
  const prompt = promptInput?.value.trim() || "";
  if (!prompt) return toast("Bitte kurz beschreiben, welches Bild erstellt werden soll.", "error");
  if (!state.currentQuiz?.id || !q?.id) return toast("Bitte den Test zuerst speichern.", "error");
  const previous = button?.textContent || "KI-Bild erstellen";
  if (button) { button.disabled = true; button.textContent = "Bild wird erstellt …"; }
  try {
    const result = await aiApi.generateQuestionMedia({
      quizId: state.currentQuiz.id,
      questionId: q.id,
      prompt,
      expectedScene: prompt,
      question: questionForAi(q),
      altText: `KI-generierte Abbildung: ${prompt}`.slice(0, 500)
    });
    if (!result?.asset?.imageDataUrl) throw new Error("Die KI hat kein Bild zurückgegeben.");
    Object.assign(q, result.asset);
    q.imageAlt = result.asset.imageAlt || `KI-generierte Abbildung: ${prompt}`.slice(0, 500);
    markDirty();
    renderQuestions();
    toast("KI-Bild eingefügt. Bitte kurz prüfen und den Test speichern.");
  } catch (err) {
    console.error(err);
    showReportableError({ code: REPORTABLE_ERROR_CODES.aiEdit, message: aiFriendlyError(err, "KI-Bild konnte nicht erstellt werden."), error: err, action: "generate_editor_image", details: { questionType: q.type, promptLength: prompt.length } });
  } finally {
    if (button?.isConnected) { button.disabled = false; button.textContent = previous; }
  }
}

async function captureScreenForQuestion(q) {''',
    "AI image helper"
)

# Variants: close the chooser immediately and show non-blocking progress in editor.
app = replace_regex_once(
    app,
    r"function openQuestionVariantDialog\(q, index\) \{.*?\n\}\n\nasync function createQuestionVariants",
    '''function openQuestionVariantDialog(q, index) {
  if (state.aiVariantsRunning) return toast("Es werden bereits Varianten im Hintergrund erstellt.");
  const available = Math.min(5, 100 - state.questions.length);
  if (available < 1) return toast("Ein Test kann höchstens 100 Aufgaben enthalten.", "error");
  const dialog = document.createElement("dialog");
  dialog.className = "shareDialog";
  dialog.innerHTML = `<form class="stack compact"><h2>Varianten hinzufügen</h2>
    <p>Neue Beispiele für Aufgabe ${index + 1}. Die ursprüngliche Aufgabe bleibt erhalten.</p>
    <label>Anzahl<select name="count">${Array.from({ length: available }, (_, i) => `<option value="${i + 1}">${i + 1} ${i ? "Varianten" : "Variante"}</option>`).join("")}</select></label>
    <label>Bilder<select name="mediaKind"><option value="none">Ohne Bild</option><option value="ai_generated">Mit Bild zur Aufgabe</option></select></label>
    <p class="hint">Nach dem Start läuft die Erstellung im Hintergrund. Du kannst währenddessen im Test weiterarbeiten.</p>
    <div class="actions"><button type="button" class="button ghost variantCancel">Abbrechen</button><button type="submit" class="button primary">Im Hintergrund erstellen</button></div></form>`;
  const form = dialog.querySelector("form");
  form.elements.mediaKind.value = defaultVariantMediaKind(q);
  dialog.querySelector(".variantCancel").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove());
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (state.aiVariantsRunning) return;
    const count = Number(form.elements.count.value);
    const mediaKind = form.elements.mediaKind.value;
    state.aiVariantsRunning = true;
    dialog.close();
    setAiProgress(`Varianten für Aufgabe ${index + 1} werden im Hintergrund erstellt …`, false, null, "", "variantBackgroundProgress");
    void createQuestionVariants(q, {
      count,
      mediaKind,
      onProgress: text => setAiProgress(text, false, null, "", "variantBackgroundProgress")
    }).finally(() => {
      state.aiVariantsRunning = false;
      setTimeout(() => setAiProgress("", false, null, "", "variantBackgroundProgress"), 2500);
    });
  });
  document.body.appendChild(dialog);
  dialog.showModal();
}

async function createQuestionVariants''',
    "background variants"
)
app = app.replace("state.questions.length + count > 50", "state.questions.length + count > 100")
app = app.replace("insgesamt sind höchstens 50 Aufgaben möglich.", "insgesamt sind höchstens 100 Aufgaben möglich.")
app = app.replace("state.questions.length >= 50", "state.questions.length >= 100")
app = app.replace("Ein Test kann höchstens 50 Aufgaben enthalten.", "Ein Test kann höchstens 100 Aufgaben enthalten.")

# Creation form up to 100 tasks.
app = replace_once(app, "count > 50", "count > 100", "browser creation max")
app = replace_once(app, "Bitte 1 bis 50 Aufgaben wählen.", "Bitte 1 bis 100 Aufgaben wählen.", "browser count message")

# Dashboard publish switch.
app = replace_once(
    app,
    '''        <span class="status ${status.cls}">${status.label}</span>
      </div>''',
    '''        <div class="quizCardStatusGroup">
          <span class="status ${status.cls}">${status.label}</span>
          <label class="dashboardPublishControl" title="Test direkt veröffentlichen oder zurück auf Entwurf setzen">
            <span>Veröffentlicht</span>
            <input class="dashboardPublishToggle" type="checkbox" ${q.published && !q.ended && !q.rightsHold ? "checked" : ""} ${q.rightsHold ? "disabled" : ""} aria-label="Veröffentlichung umschalten">
            <span class="dashboardSwitch" aria-hidden="true"></span>
          </label>
        </div>
      </div>''',
    "dashboard publish switch markup"
)
app = replace_once(
    app,
    '''    card.querySelector(".edit").addEventListener("click", () => openEditor(q.id));''',
    '''    card.querySelector(".dashboardPublishToggle")?.addEventListener("change", event => toggleDashboardPublished(q, event.currentTarget));
    card.querySelector(".edit").addEventListener("click", () => openEditor(q.id));''',
    "dashboard publish switch listener"
)
app = replace_once(
    app,
    '''function quizDefaults() {''',
    '''async function toggleDashboardPublished(q, toggle) {
  const wantsPublished = Boolean(toggle?.checked);
  if (q.rightsHold) {
    if (toggle) toggle.checked = false;
    return toast("Dieser Test ist wegen eines Rechtehinweises gesperrt.", "error");
  }
  if (wantsPublished && Number(q.questionCount || 0) < 1) {
    if (toggle) toggle.checked = false;
    return toast("Füge zuerst mindestens eine Aufgabe hinzu.", "error");
  }
  if (wantsPublished && isAiReviewPending(q) && !confirm("Die KI-Prüfung dieses Entwurfs ist noch nicht abgeschlossen. Trotzdem veröffentlichen?")) {
    if (toggle) toggle.checked = false;
    return;
  }
  if (!wantsPublished && q.published && q.startMode === "teacher" && q.sessionState === "running" && !confirm("Der Test läuft gerade. Veröffentlichung wirklich zurücknehmen?")) {
    if (toggle) toggle.checked = true;
    return;
  }
  if (toggle) toggle.disabled = true;
  try {
    if (wantsPublished) {
      const teacherMode = q.startMode === "teacher";
      const runId = teacherMode ? randomId("run") : null;
      await updateDoc(doc(db, "quizzes", q.id), {
        published: true, ended: false,
        sessionState: teacherMode ? "waiting" : "open",
        sessionRunId: runId, sessionStartedAt: null,
        publishedAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      Object.assign(q, { published: true, ended: false, sessionState: teacherMode ? "waiting" : "open", sessionRunId: runId, sessionStartedAt: null });
      toast("Test veröffentlicht.");
    } else {
      await updateDoc(doc(db, "quizzes", q.id), {
        published: false, ended: false, sessionState: "open",
        sessionRunId: null, sessionStartedAt: null, updatedAt: serverTimestamp()
      });
      Object.assign(q, { published: false, ended: false, sessionState: "open", sessionRunId: null, sessionStartedAt: null });
      toast("Veröffentlichung zurückgenommen. Der Test ist wieder ein Entwurf.");
    }
    renderQuizList();
    renderAiJobs();
  } catch (err) {
    console.error(err);
    if (toggle) toggle.checked = !wantsPublished;
    showReportableError({ code: REPORTABLE_ERROR_CODES.dataLoad, message: "Veröffentlichungsstatus konnte nicht geändert werden.", error: err, action: "dashboard_publish_toggle", details: { quizId: q.id, wantsPublished } });
  } finally {
    if (toggle?.isConnected) toggle.disabled = false;
  }
}

function quizDefaults() {''',
    "dashboard publish switch function"
)
write("app.js", app)

# ---------- HTML ----------
html = read("index.html")
html = html.replace('2.3.1-ai27', '2.3.1-ai28')
html = replace_once(html, 'id="aiCount" type="number" min="1" max="50"', 'id="aiCount" type="number" min="1" max="100"', "AI count input")
html = replace_once(
    html,
    '<p id="saveState">Noch nicht gespeichert</p><div id="similarTestProgress" class="aiProgress hidden" role="status" aria-live="polite"></div>',
    '<p id="saveState">Noch nicht gespeichert</p><div id="similarTestProgress" class="aiProgress hidden" role="status" aria-live="polite"></div><div id="variantBackgroundProgress" class="aiProgress hidden variantBackgroundProgress" role="status" aria-live="polite"></div>',
    "variant global progress"
)
write("index.html", html)

# ---------- CSS ----------
css = read("styles.css")
css += r'''

/* ai28: focused review, dashboard publishing and non-blocking AI helpers */
.quizCardStatusGroup{display:flex;align-items:flex-end;gap:10px;flex-direction:column}.dashboardPublishControl{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:650;color:#667085;cursor:pointer;user-select:none}.dashboardPublishControl input{position:absolute;opacity:0;pointer-events:none}.dashboardSwitch{position:relative;width:34px;height:19px;border-radius:999px;background:#d0d5dd;transition:.18s;box-shadow:inset 0 0 0 1px rgba(16,24,40,.06)}.dashboardSwitch:after{content:"";position:absolute;width:15px;height:15px;left:2px;top:2px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(16,24,40,.25);transition:.18s}.dashboardPublishControl input:checked+.dashboardSwitch{background:#1f6f4a}.dashboardPublishControl input:checked+.dashboardSwitch:after{transform:translateX(15px)}.dashboardPublishControl input:focus-visible+.dashboardSwitch{outline:3px solid rgba(37,99,235,.22);outline-offset:2px}.dashboardPublishControl input:disabled+.dashboardSwitch{opacity:.45;cursor:not-allowed}
.qualityJumpList{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.qualityJump{display:flex;align-items:center;gap:6px;border:1px solid #f0c36a;background:#fffaf0;color:#694c00;border-radius:9px;padding:6px 9px;cursor:pointer;font-size:12px}.qualityJump:hover{background:#fff4d6}.qualityJump span{font-weight:500;color:#7a5d1a}.qualityIssueQuestion{border-color:#efc36d!important;box-shadow:0 0 0 2px rgba(239,195,109,.14)}.qualityIssueMarker{border:1px solid #efc36d;background:#fff8e6;color:#7a5700;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:700;display:inline-flex;gap:5px;align-items:center;cursor:pointer}.qualityIssueMarker span{display:grid;place-items:center;width:15px;height:15px;border-radius:50%;background:#f5c451;color:#533a00}.qualityIssueFlash{animation:qualityIssueFlash 1.8s ease}@keyframes qualityIssueFlash{0%,100%{box-shadow:0 0 0 2px rgba(239,195,109,.14)}35%{box-shadow:0 0 0 6px rgba(245,196,81,.34)}}
.aiImageComposer{margin-top:12px;padding-top:12px;border-top:1px solid #c7d7ef;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 10px;align-items:end}.aiImageComposer>div{grid-column:1/-1;display:flex;flex-direction:column;gap:2px}.aiImageComposer small{color:#667085;font-weight:400}.aiImageComposer textarea{min-height:58px;resize:vertical}.variantBackgroundProgress{margin-top:8px;max-width:620px}.variantBackgroundProgress:not(.hidden){display:block}
@media(max-width:720px){.quizCardStatusGroup{align-items:flex-start}.aiImageComposer{grid-template-columns:1fr}.aiImageComposer .button{width:100%}.qualityJump{width:100%;justify-content:space-between}}
'''
write("styles.css", css)

# ---------- Tests ----------
quality_test = read("functions/test/quality.test.js")
quality_test = replace_once(
    quality_test,
    '''  assert.equal(result.errors.length, 1);
  assert.equal(result.replaced, 1);''',
    '''  assert.equal(result.errors.length, 1);
  assert.equal(result.replaced, 2);
  assert.equal(result.reviewPasses, 3);''',
    "persistent quality review expectations"
)
quality_test += '''\n\ntest("quality prompt knows that gapfill brackets are hidden from pupils", () => {\n  const prompt = reviewPrompt({ subject: "Deutsch", grade: "5", questions: [{ type: "gapfill", text: "Ich helfe [dem] Kind.", points: 1, mediaIntent: { kind: "none" } }] }, {});\n  assert.match(prompt, /KEIN answer_leak/);\n  assert.match(prompt, /leere Eingabefelder/);\n});\n'''
write("functions/test/quality.test.js", quality_test)

batch_test = read("functions/test/test-batches.test.js")
batch_test = replace_once(batch_test, "count <= 50", "count <= 100", "batch test max")
batch_test += '''\n\ntest("100-task generation is split into ten bounded batches", async () => {\n  const input = { count: 100, points: 50, exactImageCounts: true, imageQuestionCount: 5, imageMode: "exact" };\n  let calls = 0;\n  const output = await generateTestInBatches(input, async (batch, prior) => {\n    calls += 1;\n    assert.ok(batch.count <= 10);\n    assert.equal(prior.length, batch.batchOffset);\n    return { data: { title: "Großer Test", subject: "Deutsch", grade: "5", description: "", questions: Array.from({ length: batch.count }, (_, i) => ({ type: "truefalse", text: `Aussage ${batch.batchOffset + i + 1}`, points: 0.5, correctBoolean: true, mediaIntent: { kind: i < batch.imageQuestionCount ? "ai_generated" : "none", prompt: i < batch.imageQuestionCount ? "Schulszene" : "" } })) }, usage: {} };\n  });\n  assert.equal(calls, 10);\n  assert.equal(output.data.questions.length, 100);\n});\n'''
write("functions/test/test-batches.test.js", batch_test)

print("Applied ai28 editor, quality, background variant and 100-question upgrades.")
