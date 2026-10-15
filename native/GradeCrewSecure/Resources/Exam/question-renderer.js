// Reused unchanged from GradeCrew staging 8f869790, secure-student.js questionShell through applyDraft.
const ASSESSMENT_LOCALE_SCHEMA_VERSION = 1;
const DEFAULT_CONTENT_LOCALE = "de-DE";
const SUPPORTED_CONTENT_LOCALES = Object.freeze(["de-DE", "en-GB"]);
const CONTENT_LOCALE_MARKER_PREFIX = "[[GRADECREW_CONTENT_LOCALE=";
const CONTENT_LOCALE_MARKER_PATTERN = /\[\[GRADECREW_CONTENT_LOCALE=(de-DE|en-GB)\]\]/g;

function normalizeAssessmentLocale(value, fallback = DEFAULT_CONTENT_LOCALE) {
  const raw = String(value || "").trim();
  if (/^en(?:-|$)/i.test(raw)) return "en-GB";
  if (/^de(?:-|$)/i.test(raw)) return "de-DE";
  return SUPPORTED_CONTENT_LOCALES.includes(fallback) ? fallback : DEFAULT_CONTENT_LOCALE;
}

// These labels belong to the fixed assessment content, never to the UI catalog.
const CONTENT_LABELS = Object.freeze({
  "de-DE": Object.freeze({ listeningTrueFalseInstruction: "Höre die Aufnahme. Entscheide: Richtig oder falsch?", missingListeningInstruction: "Der genaue Arbeitsauftrag fehlt. Bitte frage deine Lehrkraft.", listeningInstruction: "Höre dir die Aufnahme an und beantworte die Frage.", listeningImageInstruction: "Höre dir die Aufnahme unter dem Bild an und beantworte die Frage.", trueLabel: "Richtig", falseLabel: "Falsch", questionImage: "Abbildung zur Aufgabe", answerImage: "Antwortabbildung", answer: "Antwort", imageChoice: index => `Bild ${String.fromCharCode(65 + index)}` }),
  "en-GB": Object.freeze({ listeningTrueFalseInstruction: "Listen to the recording. Decide: true or false?", missingListeningInstruction: "The task instructions are missing. Please ask your teacher.", listeningInstruction: "Listen to the recording and answer the question.", listeningImageInstruction: "Listen to the recording below the picture and answer the question.", trueLabel: "True", falseLabel: "False", questionImage: "Image for the question", answerImage: "Answer image", answer: "Answer", imageChoice: index => `Image ${String.fromCharCode(65 + index)}` }),
});

function assessmentContentLabels(contentLocale) {
  return CONTENT_LABELS[normalizeAssessmentLocale(contentLocale)];
}

function contentLocaleMarker(locale = DEFAULT_CONTENT_LOCALE) {
  return `${CONTENT_LOCALE_MARKER_PREFIX}${normalizeAssessmentLocale(locale)}]]`;
}

function stripContentLocaleMarker(value = "") {
  return String(value || "")
    .replace(CONTENT_LOCALE_MARKER_PATTERN, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractContentLocale(value = "", fallback = DEFAULT_CONTENT_LOCALE) {
  const text = String(value || "");
  const match = text.match(/\[\[GRADECREW_CONTENT_LOCALE=(de-DE|en-GB)\]\]/);
  return normalizeAssessmentLocale(match?.[1], fallback);
}

function withContentLocaleMarker(value = "", locale = DEFAULT_CONTENT_LOCALE) {
  const clean = stripContentLocaleMarker(value);
  return [clean, contentLocaleMarker(locale)].filter(Boolean).join("\n");
}

function contentLanguageInstruction(locale = DEFAULT_CONTENT_LOCALE) {
  return normalizeAssessmentLocale(locale) === "en-GB"
    ? "Write every student-facing assessment text in natural British English. This includes the test title, question text, answer options, gap text, matching/group labels, solution text and image alt text. Keep canonical internal enum/type values unchanged."
    : "Verfasse alle schülerseitigen Prüfungsinhalte in natürlichem Deutsch. Dazu gehören Testtitel, Fragetexte, Antwortoptionen, Lückentexte, Zuordnungen/Gruppen, Lösungstexte und Bild-Alternativtexte. Interne kanonische Enum-/Typwerte bleiben unverändert.";
}

function assessmentLocaleSnapshot(locale = DEFAULT_CONTENT_LOCALE, gradingLocale = locale) {
  const contentLocale = normalizeAssessmentLocale(locale);
  return Object.freeze({
    schemaVersion: ASSESSMENT_LOCALE_SCHEMA_VERSION,
    contentLocale,
    gradingLocale: normalizeAssessmentLocale(gradingLocale, contentLocale),
  });
}

function escapeMathText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function formatMathText(value) {
  const text = String(value ?? "");
  const pattern = /([\^_])\{([^{}]{1,80})\}/g;
  let html = "";
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    html += escapeMathText(text.slice(cursor, match.index));
    const tag = match[1] === "^" ? "sup" : "sub";
    html += `<${tag}>${escapeMathText(match[2])}</${tag}>`;
    cursor = match.index + match[0].length;
  }
  return html + escapeMathText(text.slice(cursor));
}

function wireMediaFeedback(media, container, kind) {
  const status=document.createElement('span');
  status.className='secureMediaStatus';status.hidden=true;status.setAttribute('role','alert');
  media.addEventListener('error',()=> { status.hidden=false;status.textContent=kind==='image'?'Das Bild konnte nicht geladen werden. Bitte die Lehrkraft informieren.':'Audio konnte nicht geladen werden. Bitte die Lehrkraft informieren.'; });
  media.addEventListener(kind==='image'?'load':'loadedmetadata',()=> {status.hidden=true;status.textContent='';});
  if(kind==='image') { media.loading='lazy';media.decoding='async'; }
  container.appendChild(status);
}

function questionShell(question, index) {
  const section = document.createElement("section");
  section.className = "secureQuestion";
  section.dataset.qid = question.id;
  section.dataset.type = question.type;

  const head = document.createElement("div");
  head.className = "secureQuestionHead";
  const no = document.createElement("span");
  no.className = "secureQuestionNo";
  no.textContent = `Aufgabe ${index + 1}`;
  const points = document.createElement("span");
  points.className = "securePoints";
  points.textContent = `${Number(question.points) || 0} P.`;
  head.append(no, points);
  section.appendChild(head);

  const title = document.createElement("h2");
  if (question.type === "gapfill") title.textContent = "Lückentext";
  else if (question.audioPresentation === "listening-only") title.textContent = String(question.audioInstruction || "").trim() || (question.type === "truefalse" ? assessmentContentLabels(currentQuiz?.contentLocale).listeningTrueFalseInstruction : assessmentContentLabels(currentQuiz?.contentLocale).missingListeningInstruction);
  else title.innerHTML = formatMathText(question.text || "Aufgabe");
  section.appendChild(title);

  if (question.image?.src) {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.className = "secureQuestionImage";
    image.src = question.image.src;
    image.alt = question.image.alt || assessmentContentLabels(currentQuiz?.contentLocale).questionImage;
    figure.appendChild(image);
    wireMediaFeedback(image,figure,"image");
    section.appendChild(figure);
  }
  if (question.audio?.src) {
    const audioBox = document.createElement("div");
    audioBox.className = "secureQuestionAudio";
    const label = document.createElement("strong");
    label.textContent = "🔊 Höraufgabe";
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.setAttribute("controlslist", "nodownload noplaybackrate");
    audio.preload = "metadata";
    audio.src = question.audio.src;
    audio.setAttribute("aria-label", `Audio zu Aufgabe ${index + 1} anhören`);
    audioBox.append(label, audio);
    wireMediaFeedback(audio,audioBox,"audio");
    section.appendChild(audioBox);
  }
  return section;
}

function renderOptions(section, question, multiple = false) {
  const contentLabels = assessmentContentLabels(currentQuiz?.contentLocale);
  const imageOnly = question.imageChoicesOnly === true && question.options?.length >= 2 && question.options.every(option => option.image?.src);
  (question.options || []).forEach((option, shownIndex) => {
    const label = document.createElement("label");
    label.className = "secureChoice";
    const input = document.createElement("input");
    input.type = multiple ? "checkbox" : "radio";
    input.name = `q_${question.id}`;
    input.value = option.id;
    const body = document.createElement("span");
    const text = document.createElement("span");
    text.dataset.i18nContent = "1";
    text.innerHTML = formatMathText(question.audioAnswerMode === "audio-only" ? `${contentLabels.answer} ${shownIndex + 1}` : imageOnly ? contentLabels.imageChoice(shownIndex) : option.text || contentLabels.answer);
    if (question.audioAnswerMode === "audio-only") {
      text.hidden = true;
      input.setAttribute("aria-label", `${contentLabels.answer} ${shownIndex + 1}`);
    }
    body.appendChild(text);
    if (question.audioAnswerMode === "audio-only" && option.audio?.src) {
      const player = document.createElement("audio");
      player.controls = true;
      player.setAttribute("controlslist", "nodownload noplaybackrate");
      player.preload = "metadata";
      player.src = option.audio.src;
      player.setAttribute("aria-label", `${contentLabels.answer} ${shownIndex + 1}`);
      player.addEventListener("click", event => event.stopPropagation());
      body.appendChild(player);
    wireMediaFeedback(player,body,"audio");
    }
    if (option.image?.src) {
      const image = document.createElement("img");
      image.className = "secureOptionImage";
      image.src = option.image.src;
      image.alt = option.image.alt || (imageOnly ? "" : contentLabels.answerImage);
      body.appendChild(image);
      wireMediaFeedback(image,body,"image");
    }
    label.append(input, body);
    section.appendChild(label);
  });
}

function memoLabel(index) {
  return `${assessmentContentLabels(currentQuiz?.contentLocale).answer} ${index + 1}`;
}

function memoContent(item, index) {
  const body = document.createElement("span");
  body.className = "secureAudioMemo";
  body.dataset.i18nContent = "1";
  const label = document.createElement("strong");
  label.textContent = memoLabel(index);
  body.appendChild(label);
  if (item.audio?.src) {
    const player = document.createElement("audio");
    player.controls = true;
    player.setAttribute("controlslist", "nodownload noplaybackrate");
    player.preload = "metadata";
    player.src = item.audio.src;
    player.setAttribute("aria-label", memoLabel(index));
    body.appendChild(player);
    wireMediaFeedback(player,body,"audio");
  }
  return body;
}

function renderMemoBank(section, question, items) {
  if (question.audioAnswerMode !== "audio-only") return;
  const bank = document.createElement("div");
  bank.className = "secureMemoBank";
  items.forEach((item, index) => bank.appendChild(memoContent(item, index)));
  section.appendChild(bank);
}

function memoEnglish() {
  return /^en(?:-|$)/i.test(currentQuiz?.contentLocale || "");
}

function renderDropdown(section, question) {
  renderMemoBank(section, question, question.options || []);
  const select = document.createElement("select");
  if (question.audioAnswerMode === "audio-only") select.setAttribute("aria-label", assessmentContentLabels(currentQuiz?.contentLocale).answer);
  select.name = `q_${question.id}`;
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = memoEnglish() ? "Please choose …" : "Bitte auswählen …";
  select.appendChild(blank);
  (question.options || []).forEach((option, index) => {
    const node = document.createElement("option");
    node.value = option.id;
    node.textContent = question.audioAnswerMode === "audio-only" ? memoLabel(index) : option.text || "Antwort";
    select.appendChild(node);
  });
  section.appendChild(select);
}

function renderGapfill(section, question) {
  const wrap = document.createElement("div");
  wrap.className = "secureGapText";
  let gapIndex = 0;
  (question.segments || []).forEach(segment => {
    if (segment.type === "text") {
      const text = document.createElement("span");
      text.innerHTML = formatMathText(segment.text || "");
      wrap.appendChild(text);
      return;
    }
    const input = document.createElement("input");
    input.type = "text";
    const color = ["blue", "orange", "green", "purple"].includes(segment.color) ? segment.color : "";
    input.className = `secureGap${color ? ` gapColor-${color}` : ""}`;
    input.dataset.gapIndex = String(gapIndex++);
    input.dataset.gapId = segment.id || "";
    input.autocomplete = "off";
    const colorName = { blue: "Blau", orange: "Orange", green: "Grün", purple: "Lila" }[color];
    input.setAttribute("aria-label", `Lücke ${gapIndex}${colorName ? ` (${colorName})` : ""}`);
    if (colorName) input.placeholder = colorName;
    wrap.appendChild(input);
  });
  section.appendChild(wrap);
}

function renderMatching(section, question) {
  renderMemoBank(section, question, question.rightItems || []);
  (question.leftItems || []).forEach(left => {
    const row = document.createElement("div");
    row.className = "secureMatchingRow";
    const label = document.createElement("strong");
    label.textContent = left.text;
    const select = document.createElement("select");
    select.dataset.leftId = left.id;
    select.setAttribute("aria-label", left.text);
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = memoEnglish() ? "Match …" : "Zuordnen …";
    select.appendChild(blank);
    (question.rightItems || []).forEach((right, index) => {
      const option = document.createElement("option");
      option.value = right.id;
      option.textContent = question.audioAnswerMode === "audio-only" ? memoLabel(index) : right.text;
      select.appendChild(option);
    });
    row.append(label, select);
    section.appendChild(row);
  });
}

function moveOrderItem(button, direction) {
  markQuestionTouched(button.closest(".secureQuestion").dataset.qid);
  const item = button.closest(".secureOrderItem");
  const list = item?.parentElement;
  if (!item || !list) return;
  if (direction < 0 && item.previousElementSibling) list.insertBefore(item, item.previousElementSibling);
  if (direction > 0 && item.nextElementSibling) list.insertBefore(item.nextElementSibling, item);
  onAnswerChanged();
}

function renderOrdering(section, question) {
  const list = document.createElement("div");
  list.className = "secureOrderList";
  (question.items || []).forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "secureOrderItem";
    row.dataset.itemId = item.id;
    const text = document.createElement("span");
    text.textContent = item.text;
    const itemLabel = question.audioAnswerMode === "audio-only" ? memoLabel(index) : item.text;
    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "↑";
    up.setAttribute("aria-label", `${itemLabel} ${memoEnglish() ? "up" : "nach oben"}`);
    up.addEventListener("click", () => moveOrderItem(up, -1));
    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "↓";
    down.setAttribute("aria-label", `${itemLabel} ${memoEnglish() ? "down" : "nach unten"}`);
    down.addEventListener("click", () => moveOrderItem(down, 1));
    row.append(question.audioAnswerMode === "audio-only" ? memoContent(item, index) : text, up, down);
    list.appendChild(row);
  });
  section.appendChild(list);
  const confirm = document.createElement('button');
  confirm.type = 'button'; confirm.textContent = 'Reihenfolge bestätigen';
  confirm.addEventListener('click', () => { markQuestionTouched(question.id); onAnswerChanged(); });
  section.appendChild(confirm);
}

function renderGrouping(section, question) {
  (question.items || []).forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "secureGroupingRow";
    const label = document.createElement("strong");
    label.textContent = item.text;
    const select = document.createElement("select");
    select.dataset.itemId = item.id;
    select.setAttribute("aria-label", question.audioAnswerMode === "audio-only" ? memoLabel(index) : item.text);
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = memoEnglish() ? "Choose group …" : "Gruppe wählen …";
    select.appendChild(blank);
    (question.groups || []).forEach(group => {
      const option = document.createElement("option");
      option.value = group.id;
      option.textContent = group.name;
      select.appendChild(option);
    });
    row.append(question.audioAnswerMode === "audio-only" ? memoContent(item, index) : label, select);
    section.appendChild(row);
  });
}

function tokenizeWords(text) {
  const pieces = String(text || "").split(/([\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*)/gu).filter(Boolean);
  let wordIndex = 0;
  return pieces.map(piece => {
    const isWord = /[\p{L}\p{N}]/u.test(piece[0] || "");
    return { text: piece, isWord, wordIndex: isWord ? wordIndex++ : null };
  });
}

function renderMarkwords(section, question) {
  const wrap = document.createElement("div");
  wrap.className = "secureMarkPassage";
  const groups = (question.markGroups || []).filter(group => group.name && ["blue", "orange", "green", "purple"].includes(group.color));
  let activeColor = groups[0]?.color || "";
  if (groups.length) {
    const palette = document.createElement("div");
    palette.className = "markColorPalette";
    groups.forEach(group => {
      const choice = document.createElement("button");
      choice.type = "button";
      choice.className = `markColorChoice markColor-${group.color}`;
      choice.textContent = group.name;
      choice.setAttribute("aria-pressed", String(activeColor === group.color));
      choice.addEventListener("click", () => {
        activeColor = group.color;
        palette.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button === choice)));
      });
      palette.appendChild(choice);
    });
    section.appendChild(palette);
  }
  tokenizeWords(question.passage).forEach(token => {
    if (!token.isWord) {
      wrap.appendChild(document.createTextNode(token.text));
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secureWord";
    button.dataset.wordIndex = String(token.wordIndex);
    button.dataset.originalWord = token.text;
    button.textContent = token.text;
    button.addEventListener("click", () => {
      if (groups.length) {
        const color = button.dataset.markColor === activeColor ? "" : activeColor;
        button.dataset.markColor = color;
        button.classList.toggle("selected", Boolean(color));
        const name = groups.find(group => group.color === color)?.name;
        button.textContent = token.text + (name ? ` (${name})` : "");
        button.setAttribute("aria-label", button.textContent);
      } else button.classList.toggle("selected");
      button.setAttribute("aria-pressed", button.classList.contains("selected") ? "true" : "false");
      markQuestionTouched(question.id);
      onAnswerChanged();
    });
    wrap.appendChild(button);
  });
  section.appendChild(wrap);
}

function renderQuestion(question, index) {
  const section = questionShell(question, index);
  const answers = document.createElement('div');answers.className='secureAnswers';
  answers.setAttribute('role','group');answers.setAttribute('aria-label',`Antwort zu Aufgabe ${index+1}`);
  if (question.type === "single") renderOptions(answers, question, false);
  else if (question.type === "multi") renderOptions(answers, question, true);
  else if (question.type === "dropdown") renderDropdown(answers, question);
  else if (question.type === "truefalse") {
    const contentLabels = assessmentContentLabels(currentQuiz?.contentLocale);
    renderOptions(answers, { ...question, options: [{ id: "true", text: contentLabels.trueLabel }, { id: "false", text: contentLabels.falseLabel }] }, false);
  } else if (question.type === "text") {
    const input = document.createElement("textarea");
    input.name = `q_${question.id}`;
    input.rows = 4;
    input.placeholder = "Antwort eingeben";
    answers.appendChild(input);
  } else if (question.type === "number") {
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.name = `q_${question.id}`;
    input.placeholder = question.unit ? `Ergebnis in ${question.unit}` : "Ergebnis";
    answers.appendChild(input);
  } else if (question.type === "gapfill") renderGapfill(answers, question);
  else if (question.type === "matching") renderMatching(answers, question);
  else if (question.type === "ordering") renderOrdering(answers, question);
  else if (question.type === "grouping") renderGrouping(answers, question);
  else if (question.type === "markwords") renderMarkwords(answers, question);
  section.appendChild(answers);
  return section;
}

function collectQuestionAnswer(question, section) {
  if (!section) return null;
  if (["single", "truefalse"].includes(question.type)) return section.querySelector("input:checked")?.value || "";
  if (question.type === "multi") return [...section.querySelectorAll("input:checked")].map(input => input.value);
  if (["text", "number", "dropdown"].includes(question.type)) return section.querySelector("textarea,input,select")?.value || "";
  if (question.type === "gapfill") return [...section.querySelectorAll(".secureGap")].map(input => input.value);
  if (question.type === "matching") return Object.fromEntries([...section.querySelectorAll("select[data-left-id]")].map(select => [select.dataset.leftId, select.value]));
  if (question.type === "ordering") return [...section.querySelectorAll(".secureOrderItem")].map(item => item.dataset.itemId);
  if (question.type === "grouping") return Object.fromEntries([...section.querySelectorAll("select[data-item-id]")].map(select => [select.dataset.itemId, select.value]));
  if (question.type === "markwords") {
    const marked = [...section.querySelectorAll(".secureWord.selected")];
    return (question.markGroups || []).length ? Object.fromEntries(marked.map(button => [button.dataset.wordIndex, button.dataset.markColor])) : marked.map(button => button.dataset.wordIndex);
  }
  return null;
}

function collectAnswers() {
  return Object.fromEntries(currentPaper.map(question => [
    question.id,
    collectQuestionAnswer(question, document.querySelector(`.secureQuestion[data-qid="${CSS.escape(question.id)}"]`))
  ]));
}

function answerIsComplete(question, value) {
  return questionCompletion(question, value, touchedQuestionIds) === 'complete';
}

function refreshProgress() {
  document.querySelectorAll('.secureChoice').forEach(label=>label.classList.toggle('selected',Boolean(label.querySelector('input')?.checked)));
  const answers = collectAnswers();
  const done = currentPaper.filter(question => answerIsComplete(question, answers[question.id])).length;
  const total = currentPaper.length;
  $("secureProgressText").textContent = `${done} von ${total} bearbeitet`;
  $("secureOpenText").textContent = `${Math.max(0, total - done)} offen`;
  $("secureProgressFill").style.width = `${total ? Math.round(done / total * 100) : 0}%`;
}

function onAnswerChanged(event) {
  const section = event?.target?.closest?.(".secureQuestion");
  if (section) markQuestionTouched(section.dataset.qid);
  refreshProgress();
  saveDraft();
}

function applyDraft(draft) {
  for (const question of currentPaper) {
    const value = draft?.[question.id];
    if (value == null) continue;
    const section = document.querySelector(`.secureQuestion[data-qid="${CSS.escape(question.id)}"]`);
    if (!section) continue;
    if (["single", "truefalse"].includes(question.type)) {
      const input = [...section.querySelectorAll("input")].find(node => node.value === String(value));
      if (input) input.checked = true;
    } else if (question.type === "multi") {
      const selected = new Set(Array.isArray(value) ? value.map(String) : []);
      section.querySelectorAll("input").forEach(input => { input.checked = selected.has(input.value); });
    } else if (["text", "number", "dropdown"].includes(question.type)) {
      const field = section.querySelector("textarea,input,select");
      if (field) field.value = String(value);
    } else if (question.type === "gapfill") {
      section.querySelectorAll(".secureGap").forEach((input, index) => { input.value = String(Array.isArray(value) ? value[index] || "" : ""); });
    } else if (question.type === "matching") {
      section.querySelectorAll("select[data-left-id]").forEach(select => { select.value = String(value?.[select.dataset.leftId] || ""); });
    } else if (question.type === "grouping") {
      section.querySelectorAll("select[data-item-id]").forEach(select => { select.value = String(value?.[select.dataset.itemId] || ""); });
    } else if (question.type === "ordering" && Array.isArray(value)) {
      const list = section.querySelector(".secureOrderList");
      const byId = new Map([...list.querySelectorAll(".secureOrderItem")].map(item => [item.dataset.itemId, item]));
      value.forEach(id => { const item = byId.get(String(id)); if (item) list.appendChild(item); });
    } else if (question.type === "markwords") {
      const selected = new Set(Array.isArray(value) ? value.map(String) : []);
      section.querySelectorAll(".secureWord").forEach(button => {
        const group = (question.markGroups || []).find(group => group.color === value?.[button.dataset.wordIndex]);
        const active = (question.markGroups || []).length ? Boolean(group) : selected.has(button.dataset.wordIndex);
        if ((question.markGroups || []).length) {
          button.dataset.markColor = group?.color || "";
          button.textContent = button.dataset.originalWord + (group ? ` (${group.name})` : "");
          button.setAttribute("aria-label", button.textContent);
        }
        button.classList.toggle("selected", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
  }
  refreshProgress();
}

