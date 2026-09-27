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
  link.href = "gradecrew-brand.css?v=gradecrew-v1";
  link.dataset.gradecrewBrand = "1";
  document.head.appendChild(link);
}

function replaceBrandText(root = document.body) {
  if (!root) return;
  const blocked = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE"]);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    if (!node.parentElement || blocked.has(node.parentElement.tagName)) return;
    if (node.nodeValue?.includes("Testify")) node.nodeValue = node.nodeValue.replaceAll("Testify", "GradeCrew");
  });
}

function applyCoreBrand() {
  document.title = document.title.replace("Testify", "GradeCrew");
  const brand = document.querySelector(".brand");
  const mark = brand?.querySelector(".brandMark");
  const word = brand?.querySelector(".brandCopy strong");
  if (mark && mark.dataset.gradecrew !== "1") {
    mark.dataset.gradecrew = "1";
    mark.classList.add("gradecrewMark");
    mark.textContent = "G";
  }
  if (word) { word.textContent = "GradeCrew"; word.classList.add("gradecrewWordmark"); }
  if (brand) brand.setAttribute("aria-label", "GradeCrew Startseite");
  document.querySelectorAll(".footerBrand").forEach(el => { el.textContent = "GradeCrew"; });
  const banner = document.querySelector("#stagingBanner");
  if (banner?.textContent?.includes("TESTUMGEBUNG")) banner.textContent = "GRADECREW TESTUMGEBUNG · Keine echten Leistungsnachweise verwenden";
}

function addCrewPreview() {
  const intro = document.querySelector("#authView .authIntro");
  if (!intro || intro.querySelector(".gradecrewCrewPreview")) return;
  const preview = document.createElement("div");
  preview.className = "gradecrewCrewPreview";
  preview.setAttribute("aria-label", "GradeCrew: Guide, Create, Improve und Grade");
  preview.innerHTML = `<span>Deine Crew für digitale Tests</span><div class="gradecrewCrewFaces">
    <img src="${ASSETS.guide}" alt=""/><img src="${ASSETS.create}" alt=""/><img src="${ASSETS.improve}" alt=""/><img src="${ASSETS.grade}" alt=""/>
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
  card.setAttribute("title", "Create · Der GradeCrew-Falke erstellt deinen KI-Test");
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
}

function enhanceFirstGuide() {
  const card = document.querySelector("#firstAiGuideCard");
  if (!card || card.classList.contains("hidden") || card.querySelector(".gradecrewGuideHeader")) return;
  const h2 = card.querySelector("h2");
  if (!h2) return;
  const head = document.createElement("div");
  head.className = "gradecrewGuideHeader";
  head.innerHTML = `<img src="${ASSETS.guide}" alt=""/><span>Guide · Schritt für Schritt</span>`;
  h2.before(head);
}

function enhanceQualityBanner() {
  const banner = document.querySelector("#importReviewBanner");
  if (!banner || banner.classList.contains("hidden")) return;
  banner.classList.add("gradecrewQualityBanner");
  if (!banner.querySelector(".gradecrewReviewMascot")) {
    const img = document.createElement("img");
    img.src = ASSETS.grade;
    img.alt = "";
    img.className = "gradecrewReviewMascot";
    banner.appendChild(img);
  }
}

function enhanceImprovePanels(root = document) {
  root.querySelectorAll?.(".questionAiPanel").forEach(panel => panel.classList.add("gradecrewImprovePanel"));
  root.querySelectorAll?.("dialog.shareDialog").forEach(dialog => {
    if (dialog.querySelector("h2")?.textContent?.trim() === "Varianten hinzufügen") dialog.classList.add("gradecrewVariantDialog");
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
  if (ownSmall) ownSmall.textContent = "optional";
  const textNode = Array.from(label.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue?.includes("Meine dauerhaften"));
  if (textNode) textNode.nodeValue = "Vorgaben für meine KI-Tests ";
}

function scan(root = document) {
  applyCoreBrand();
  replaceBrandText(root instanceof HTMLElement ? root : document.body);
  addCrewPreview();
  enhanceCreateCard();
  enhanceEmptyState();
  enhanceTeacherTour();
  enhanceFirstGuide();
  enhanceQualityBanner();
  collapseAiPreferences();
  enhanceImprovePanels(root instanceof HTMLElement ? root : document);
}

ensureBrandStyles();
if (document.body) scan();
else document.addEventListener("DOMContentLoaded", () => scan(), { once: true });

const observer = new MutationObserver(records => {
  let needsScan = false;
  for (const record of records) {
    if (record.type === "childList" && record.addedNodes.length) { needsScan = true; break; }
    if (record.type === "attributes") { needsScan = true; break; }
  }
  if (needsScan) queueMicrotask(() => scan());
});

if (document.body) observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
else document.addEventListener("DOMContentLoaded", () => observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] }), { once: true });
