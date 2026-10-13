// Extracted original PublicPaper renderer from Web8f869790 secure-student.js.
import { assessmentContentLabels } from "../../shared/i18n/assessment-locale.mjs";
import { formatMathText } from "../../shared/math-display.mjs";
let currentQuiz = null;
function onAnswerChanged() {}
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
    }
    if (option.image?.src) {
      const image = document.createElement("img");
      image.className = "secureOptionImage";
      image.src = option.image.src;
      image.alt = option.image.alt || (imageOnly ? "" : contentLabels.answerImage);
      body.appendChild(image);
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
      onAnswerChanged();
    });
    wrap.appendChild(button);
  });
  section.appendChild(wrap);
}

export function renderQuestion(question, index, locale = "de-DE") {
  currentQuiz = {contentLocale:locale};
  const section = questionShell(question, index);
  if (question.type === "single") renderOptions(section, question, false);
  else if (question.type === "multi") renderOptions(section, question, true);
  else if (question.type === "dropdown") renderDropdown(section, question);
  else if (question.type === "truefalse") {
    const contentLabels = assessmentContentLabels(currentQuiz?.contentLocale);
    renderOptions(section, { ...question, options: [{ id: "true", text: contentLabels.trueLabel }, { id: "false", text: contentLabels.falseLabel }] }, false);
  } else if (question.type === "text") {
    const input = document.createElement("textarea");
    input.name = `q_${question.id}`;
    input.rows = 4;
    input.placeholder = "Antwort eingeben";
    section.appendChild(input);
  } else if (question.type === "number") {
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.name = `q_${question.id}`;
    input.placeholder = question.unit ? `Ergebnis in ${question.unit}` : "Ergebnis";
    section.appendChild(input);
  } else if (question.type === "gapfill") renderGapfill(section, question);
  else if (question.type === "matching") renderMatching(section, question);
  else if (question.type === "ordering") renderOrdering(section, question);
  else if (question.type === "grouping") renderGrouping(section, question);
  else if (question.type === "markwords") renderMarkwords(section, question);
  return section;
}

export function collectQuestionAnswer(question, section) {
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

