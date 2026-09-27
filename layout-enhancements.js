function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripDuplicatePassage(prompt, passage) {
  const rawPrompt = String(prompt || "").trim();
  const rawPassage = String(passage || "").trim();
  if (!rawPrompt || !rawPassage) return rawPrompt;
  const promptFlat = cleanText(rawPrompt);
  const passageFlat = cleanText(rawPassage);
  if (!promptFlat.toLocaleLowerCase("de").includes(passageFlat.toLocaleLowerCase("de"))) return rawPrompt;
  const index = promptFlat.toLocaleLowerCase("de").lastIndexOf(passageFlat.toLocaleLowerCase("de"));
  if (index < 0) return rawPrompt;
  return promptFlat.slice(0, index).replace(/[\s:–—-]+$/g, "").trim();
}

function enhanceEditorHeader() {
  const view = document.querySelector("#editorView");
  const head = view?.querySelector(".pageHead.stickyHead");
  if (!view || !head || head.dataset.compactEditor === "1") return;
  head.dataset.compactEditor = "1";
  head.classList.add("compactEditorHead");

  const copy = head.firstElementChild;
  const actions = head.querySelector(".actions");
  if (!copy || !actions) return;
  copy.classList.add("editorHeadCopy");

  const back = copy.querySelector("#backFromEditor");
  const title = copy.querySelector("#editorHeading");
  const saveState = copy.querySelector("#saveState");
  const titleRow = document.createElement("div");
  titleRow.className = "editorTitleRow";
  if (back) titleRow.appendChild(back);
  if (title) titleRow.appendChild(title);
  if (saveState) titleRow.appendChild(saveState);
  copy.prepend(titleRow);

  const moreButtons = ["createSimilarTestBtn", "shareTemplateBtn", "endQuizBtn"]
    .map(id => document.getElementById(id))
    .filter(Boolean);
  if (moreButtons.length) {
    const more = document.createElement("details");
    more.className = "editorMoreMenu";
    more.innerHTML = '<summary class="button ghost">Mehr <span aria-hidden="true">⌄</span></summary><div class="editorMorePanel"></div>';
    const panel = more.querySelector(".editorMorePanel");
    moreButtons.forEach(button => panel.appendChild(button));
    actions.insertBefore(more, document.getElementById("publishBtn") || null);
    document.addEventListener("click", event => {
      if (more.open && !more.contains(event.target)) more.removeAttribute("open");
    });
  }
}

function enhanceEditorSettings() {
  const card = document.querySelector("#editorView .settingsCard");
  if (!card || card.dataset.settingsCompact === "1") return;
  const headings = [...card.querySelectorAll(":scope > h2")];
  const heading = headings.find(node => node.textContent.trim() === "Test-Einstellungen");
  if (!heading) return;
  card.dataset.settingsCompact = "1";

  const details = document.createElement("details");
  details.className = "editorSettingsDisclosure";
  details.innerHTML = '<summary><span>⚙ Test-Einstellungen</span><small>Titel, Durchführung & Auswertung</small><b aria-hidden="true">⌄</b></summary><div class="editorSettingsBody"></div>';
  const body = details.querySelector(".editorSettingsBody");
  let sibling = heading.nextSibling;
  while (sibling) {
    const next = sibling.nextSibling;
    body.appendChild(sibling);
    sibling = next;
  }
  heading.replaceWith(details);
}

function cleanStudentMarkword(card) {
  if (!(card instanceof HTMLElement) || card.dataset.type !== "markwords") return;
  const heading = card.querySelector(":scope > h3, .studentQuestionHead + h3");
  const passageHost = card.querySelector(".markWordsBox, .markwordsBox, [data-markwords], .markWordsText");
  const passage = passageHost?.textContent?.trim();
  if (!heading || !passage) return;
  const cleaned = stripDuplicatePassage(heading.textContent, passage);
  if (cleaned && cleanText(cleaned) !== cleanText(heading.textContent)) heading.textContent = cleaned;
}

function cleanEditorMarkword(card) {
  if (!(card instanceof HTMLElement)) return;
  const type = card.querySelector(".qType");
  if (type?.value !== "markwords") return;
  const prompt = card.querySelector(".qText");
  const passageLabel = [...card.querySelectorAll("label")].find(label => /Text, in dem markiert wird/i.test(label.textContent));
  const passage = passageLabel?.querySelector("textarea")?.value;
  if (!prompt || !passage) return;
  const cleaned = stripDuplicatePassage(prompt.value, passage);
  if (!cleaned || cleanText(cleaned) === cleanText(prompt.value)) return;
  prompt.value = cleaned;
  prompt.dispatchEvent(new Event("input", { bubbles: true }));
}

function cleanMarkwordDuplicates(root = document) {
  root.querySelectorAll?.('.studentQuestion[data-type="markwords"]').forEach(cleanStudentMarkword);
  root.querySelectorAll?.("#editorView .questionCard").forEach(cleanEditorMarkword);
}

function applyLayoutEnhancements(root = document) {
  enhanceEditorHeader();
  enhanceEditorSettings();
  cleanMarkwordDuplicates(root);
}

const observer = new MutationObserver(records => {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (node instanceof HTMLElement) cleanMarkwordDuplicates(node);
    }
  }
  applyLayoutEnhancements();
});

function start() {
  applyLayoutEnhancements();
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.body) start();
else document.addEventListener("DOMContentLoaded", start, { once: true });

const style = document.createElement("style");
style.id = "gradeCrewCompactLayout";
style.textContent = `
/* Dashboard: compact and consistent */
#dashboardView .quizGrid{align-items:start;gap:14px}
#dashboardView .quizCard{min-height:0!important;padding:18px!important;gap:10px!important;align-self:start}
#dashboardView .quizCardTop{min-height:0;align-items:flex-start}
#dashboardView .quizCard h3{font-size:17px!important;line-height:1.2!important;margin-bottom:4px!important}
#dashboardView .quizCard .meta{font-size:12px;line-height:1.4}
#dashboardView .quizStats{padding:10px 0!important;margin:1px 0 0;gap:10px!important}
#dashboardView .primaryQuizActions{margin-top:0!important;padding-top:1px}
#dashboardView .quizActions{gap:7px}
#dashboardView .quizActions .button{padding:9px 11px}
#dashboardView .secondaryQuizActions{margin-top:1px;padding-top:7px!important}

/* Variant dialog must stay centered regardless of editor scroll position */
dialog.shareDialog.gradecrewVariantDialog{position:fixed!important;inset:0!important;margin:auto!important;max-height:calc(100dvh - 32px)!important;overflow:auto!important}

/* Editor: tasks first */
#editorView .compactEditorHead{top:72px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:14px;margin:0 0 12px;padding:8px 0;background:rgba(244,247,251,.97);backdrop-filter:blur(12px)}
#editorView .editorHeadCopy{min-width:0}.editorTitleRow{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;min-width:0}
#editorView #editorHeading{font-size:20px;line-height:1.2;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
#editorView #saveState{margin:0;white-space:nowrap;font-size:11px;padding:4px 8px;border:1px solid #dce6df;border-radius:999px;background:#f7fbf8;color:#27733f;font-weight:750}
#editorView #backFromEditor{white-space:nowrap;font-size:13px}
#editorView .compactEditorHead>.actions{width:auto;flex-wrap:nowrap;align-items:center;gap:7px}
#editorView .compactEditorHead>.actions>.button,#editorView .editorMoreMenu>summary{padding:8px 11px;font-size:12px;white-space:nowrap}
.editorMoreMenu{position:relative}.editorMoreMenu>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:5px}.editorMoreMenu>summary::-webkit-details-marker{display:none}
.editorMorePanel{position:absolute;right:0;top:calc(100% + 7px);z-index:45;min-width:210px;padding:7px;background:#fff;border:1px solid #dfe5ed;border-radius:12px;box-shadow:0 16px 35px rgba(24,32,51,.14);display:grid;gap:5px}
.editorMorePanel .button{width:100%;text-align:left;justify-content:flex-start;padding:9px 10px;font-size:12px;background:#fff;border:0;color:#344054}.editorMorePanel .button:hover{background:#f6f8fb;transform:none}.editorMorePanel .button.danger{color:#b42318}
#editorView .editorLayout{grid-template-columns:220px minmax(0,1fr);gap:14px}
#editorView .settingsCard{top:132px;padding:13px;border-radius:13px;max-height:calc(100vh - 148px);overflow:auto}
#editorView .questionOutlineHeader{margin-bottom:7px}#editorView .questionOutlineHeader h2{font-size:15px;margin:0}
#editorView #questionOutline{max-height:42vh;overflow:auto;padding-right:2px;margin-bottom:8px}
.editorSettingsDisclosure{border-top:1px solid #e7ebf0;margin-top:9px;padding-top:3px}.editorSettingsDisclosure>summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1px 7px;align-items:center;padding:9px 2px;color:#344054}.editorSettingsDisclosure>summary::-webkit-details-marker{display:none}.editorSettingsDisclosure>summary span{font-size:12px;font-weight:800}.editorSettingsDisclosure>summary small{grid-column:1/2;font-size:10px;color:#8792a3}.editorSettingsDisclosure>summary b{grid-column:2;grid-row:1/3;font-size:11px;color:#8491a3;transition:transform .18s}.editorSettingsDisclosure[open]>summary b{transform:rotate(180deg)}.editorSettingsBody{padding-top:7px}.editorSettingsBody .stack.compact{gap:9px}.editorSettingsBody label{font-size:11.5px}.editorSettingsBody input,.editorSettingsBody select,.editorSettingsBody textarea{padding:8px 9px;font-size:12px}
#editorView .questionCard{scroll-margin-top:145px}
/* Student navigation: attached, not floating */
.studentProgressCompact{top:72px!important;z-index:19!important;margin:0 0 12px!important;padding:9px 14px 10px!important;border-top:0!important;border-radius:0 0 14px 14px!important;background:#fff!important;box-shadow:0 8px 18px rgba(30,41,59,.06)!important}
.studentProgressCompact .studentProgressTop{font-size:11px}.studentProgressCompact .studentProgressTrack{height:5px!important;margin:6px 0 7px!important}
.studentProgressCompact .studentCompactNav{min-height:34px}.studentProgressCompact .studentQuestionNav{max-height:132px!important}
.studentQuestion{scroll-margin-top:162px!important}
body:has(#studentView:not(.hidden)) .rightsFooter{display:none!important}
@media(max-width:900px){#editorView .compactEditorHead{top:68px;grid-template-columns:1fr;padding:7px 0}.editorTitleRow{grid-template-columns:auto minmax(0,1fr)}#editorView #saveState{grid-column:2}.compactEditorHead>.actions{overflow-x:auto;padding-bottom:2px}.compactEditorHead>.actions::-webkit-scrollbar{display:none}#editorView .editorLayout{grid-template-columns:1fr}#editorView .settingsCard{position:static;max-height:none}.studentProgressCompact{top:68px!important;border-radius:0 0 12px 12px!important}.studentQuestion{scroll-margin-top:150px!important}}
@media(max-width:620px){#editorView #editorHeading{font-size:17px}.editorTitleRow{gap:7px}.compactEditorHead>.actions .button{font-size:11px;padding:7px 9px}#editorView #previewBtn{display:none}.studentProgressCompact{top:0!important}#dashboardView .quizCard{padding:16px!important}}
`;
document.head.appendChild(style);
