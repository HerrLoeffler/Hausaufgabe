const ASSETS = Object.freeze({
  guide: "assets/gradecrew/penguin-guide.svg",
  create: "assets/gradecrew/falcon-create.svg",
  improve: "assets/gradecrew/fox-improve.svg",
  grade: "assets/gradecrew/owl-grade.svg"
});

function ensureBrandStyles() {
  if (document.querySelector('link[data-gradecrew-brand="1"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "gradecrew-brand.css?v=gradecrew-v1.3";
  link.dataset.gradecrewBrand = "1";
  document.head.appendChild(link);
}

function setTextIfChanged(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function replaceBrandText(root) {
  if (!root) return;
  const blocked = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE"]);
  const replaceNode = node => {
    if (!node?.parentElement || blocked.has(node.parentElement.tagName)) return;
    if (node.nodeValue?.includes("Testify")) node.nodeValue = node.nodeValue.replaceAll("Testify", "GradeCrew");
  };
  if (root.nodeType === Node.TEXT_NODE) {
    replaceNode(root);
    return;
  }
  if (!(root instanceof Element || root instanceof Document || root instanceof DocumentFragment)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) replaceNode(walker.currentNode);
}

function applyCoreBrand() {
  if (document.title.includes("Testify")) document.title = document.title.replaceAll("Testify", "GradeCrew");
  const brand = document.querySelector(".brand");
  const mark = brand?.querySelector(".brandMark");
  const word = brand?.querySelector(".brandCopy strong");
  if (mark && mark.dataset.gradecrew !== "1") {
    mark.dataset.gradecrew = "1";
    mark.classList.add("gradecrewMark");
    setTextIfChanged(mark, "G");
  }
  if (word) {
    setTextIfChanged(word, "GradeCrew");
    word.classList.add("gradecrewWordmark");
  }
  if (brand && brand.getAttribute("aria-label") !== "GradeCrew Startseite") brand.setAttribute("aria-label", "GradeCrew Startseite");
  document.querySelectorAll(".footerBrand").forEach(el => setTextIfChanged(el, "GradeCrew"));
  const banner = document.querySelector("#stagingBanner");
  if (banner?.textContent?.includes("TESTUMGEBUNG") && banner.textContent !== "GRADECREW TESTUMGEBUNG · Keine echten Leistungsnachweise verwenden") {
    banner.textContent = "GRADECREW TESTUMGEBUNG · Keine echten Leistungsnachweise verwenden";
  }
}

function addCrewPreview() {
  const intro = document.querySelector("#authView .authIntro");
  if (!intro || intro.querySelector(".gradecrewCrewPreview")) return;
  const preview = document.createElement("div");
  preview.className = "gradecrewCrewPreview";
  preview.setAttribute("aria-label", "GradeCrew für Hilfe, Erstellen, Verbessern und Prüfen");
  preview.innerHTML = `<span>Deine Crew für digitale Tests</span><div class="gradecrewCrewFaces">
    <img src="${ASSETS.guide}" alt="" title="Hilfe & Orientierung"/><img src="${ASSETS.create}" alt="" title="Erstellen"/><img src="${ASSETS.improve}" alt="" title="Verbessern"/><img src="${ASSETS.grade}" alt="" title="Prüfen & Bewerten"/>
  </div>`;
  intro.appendChild(preview);
}

function enhanceCreateCard() {
  const card = document.querySelector("#createAiBtn");
  if (!card || card.dataset.gradecrew === "1") return;
  card.dataset.gradecrew = "1";
  card.classList.add("gradecrewCreateCard");
  const icon = card.querySelector(".choiceIcon");
  if (icon) icon.innerHTML = `<img src="${ASSETS.create}" alt=""/>`;
  card.setAttribute("title", "Der Falke erstellt deinen KI-Test");
}

function enhanceEmptyState() {
  const state = document.querySelector("#emptyQuizState");
  const icon = state?.querySelector(".emptyIcon");
  if (!icon || icon.dataset.gradecrew === "1") return;
  icon.dataset.gradecrew = "1";
  icon.classList.add("gradecrewEmptyMascot");
  icon.innerHTML = `<img src="${ASSETS.create}" alt=""/>`;
}

function enhanceTeacherTour() {
  const icon = document.querySelector("#teacherTourIcon");
  if (!icon || icon.dataset.gradecrew === "1") return;
  icon.dataset.gradecrew = "1";
  icon.classList.add("gradecrewTourMascot");
  icon.innerHTML = `<img src="${ASSETS.guide}" alt=""/>`;
  icon.setAttribute("title", "Hilfe & Orientierung");
}

function enhanceFirstGuide() {
  const card = document.querySelector("#firstAiGuideCard");
  if (!card || card.classList.contains("hidden") || card.querySelector(".gradecrewGuideHeader")) return;
  const h2 = card.querySelector("h2");
  if (!h2) return;
  const head = document.createElement("div");
  head.className = "gradecrewGuideHeader";
  head.innerHTML = `<img src="${ASSETS.guide}" alt=""/><span>Schritt für Schritt</span>`;
  head.setAttribute("title", "Hilfe & Orientierung");
  h2.before(head);
}

function enhanceQualityBanner() {
  const banner = document.querySelector("#importReviewBanner");
  if (!banner || banner.classList.contains("hidden")) return;
  banner.classList.add("gradecrewQualityBanner");
  banner.setAttribute("title", "Qualität prüfen");
  if (!banner.querySelector(".gradecrewReviewMascot")) {
    const img = document.createElement("img");
    img.src = ASSETS.grade;
    img.alt = "";
    img.className = "gradecrewReviewMascot";
    banner.appendChild(img);
  }
}

function enhanceImprovePanels(root = document) {
  root.querySelectorAll?.(".questionAiPanel").forEach(panel => {
    panel.classList.add("gradecrewImprovePanel");
    panel.setAttribute("title", "Aufgabe verbessern");
  });
  root.querySelectorAll?.("dialog.shareDialog").forEach(dialog => {
    if (dialog.querySelector("h2")?.textContent?.trim() === "Varianten hinzufügen") {
      dialog.classList.add("gradecrewVariantDialog");
      dialog.setAttribute("title", "Varianten erstellen");
    }
  });
}

function collapseAiPreferences() {
  const textarea = document.querySelector("#aiPersonalPreferences");
  const label = textarea?.closest("label");
  const button = document.querySelector("#saveAiPreferencesBtn");
  const actions = button?.closest(".aiPreferencesActions");
  if (!textarea || !label || !actions || label.closest(".gradecrewPreferenceDetails")) return;
  actions.querySelector(".hint")?.remove();
  const details = document.createElement("details");
  details.className = "gradecrewPreferenceDetails";
  details.innerHTML = `<summary><span>Persönliche KI-Vorgaben</span><small>optional · für künftige Tests</small></summary><div class="gradecrewPreferenceBody"></div>`;
  label.before(details);
  const body = details.querySelector(".gradecrewPreferenceBody");
  body.append(label, actions);
  const ownSmall = label.querySelector("small");
  if (ownSmall) setTextIfChanged(ownSmall, "optional");
  const textNode = Array.from(label.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue?.includes("Meine dauerhaften"));
  if (textNode) textNode.nodeValue = "Vorgaben für meine KI-Tests ";
}

function scanStructure(root = document) {
  applyCoreBrand();
  addCrewPreview();
  enhanceCreateCard();
  enhanceEmptyState();
  enhanceTeacherTour();
  enhanceFirstGuide();
  enhanceQualityBanner();
  collapseAiPreferences();
  enhanceImprovePanels(root instanceof HTMLElement ? root : document);
}

let scanScheduled = false;
function scheduleStructureScan(root = document) {
  if (scanScheduled) return;
  scanScheduled = true;
  requestAnimationFrame(() => {
    scanScheduled = false;
    try { scanStructure(root); }
    catch (err) { console.warn("GradeCrew-Visualisierung konnte nicht vollständig angewendet werden:", err); }
  });
}

function start() {
  ensureBrandStyles();
  replaceBrandText(document.body);
  scanStructure(document);

  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) replaceBrandText(node);
    }
    scheduleStructureScan(document);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.body) start();
else document.addEventListener("DOMContentLoaded", start, { once: true });
