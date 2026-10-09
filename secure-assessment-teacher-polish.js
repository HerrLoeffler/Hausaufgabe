function patchSecureSolutionSetting() {
  const checkbox = document.getElementById("quizShowSolutions");
  const label = checkbox?.closest("label");
  if (!checkbox || !label || label.dataset.secureSolutionPolicy === "1") return;
  label.dataset.secureSolutionPolicy = "1";

  const textNode = [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) textNode.textContent = " Richtige Lösungen nach Testende anzeigen";

  const hint = document.createElement("small");
  hint.className = "hint secureSolutionPolicyHint";
  hint.textContent = "Sicherheitsmodus: Lösungen werden erst freigegeben, wenn du den Test beendest – nie direkt nach der Abgabe einzelner Schüler. Aktiviere das nur, wenn du denselben Test danach nicht unverändert mit einer weiteren Gruppe verwenden möchtest.";
  label.insertAdjacentElement("afterend", hint);
}

function ensurePublishedLockBanner(editorLayout) {
  let banner = document.getElementById("securePublishedLockBanner");
  if (banner || !editorLayout) return banner;
  banner = document.createElement("div");
  banner.id = "securePublishedLockBanner";
  banner.className = "importReviewBanner hidden";
  banner.setAttribute("role", "status");
  banner.innerHTML = "<strong>Veröffentlichter Test ist geschützt</strong><p>Solange dieser Test läuft, bleiben Aufgaben und Einstellungen schreibgeschützt. Beende den Test zuerst, wenn du Inhalte ändern möchtest. So bearbeiten alle Schüler dieselbe Testversion.</p>";
  editorLayout.insertAdjacentElement("beforebegin", banner);
  return banner;
}

function patchPublishedAssessmentLock() {
  const editor = document.getElementById("editorView");
  const layout = editor?.querySelector(".editorLayout");
  const endButton = document.getElementById("endQuizBtn");
  const saveButton = document.getElementById("saveQuizBtn");
  if (!editor || !layout || !endButton || !saveButton) return;

  const locked = !endButton.classList.contains("hidden") && !editor.classList.contains("hidden");
  const banner = ensurePublishedLockBanner(layout);
  editor.dataset.securePublishedLocked = locked ? "1" : "0";
  layout.inert = locked;
  banner?.classList.toggle("hidden", !locked);

  if (locked) {
    if (!Object.hasOwn(saveButton.dataset, "secureWasDisabled")) {
      saveButton.dataset.secureWasDisabled = String(saveButton.disabled);
    }
    saveButton.disabled = true;
    saveButton.title = "Beende den veröffentlichten Test, bevor du Inhalte änderst.";
  } else if (Object.hasOwn(saveButton.dataset, "secureWasDisabled")) {
    saveButton.disabled = saveButton.dataset.secureWasDisabled === "true";
    delete saveButton.dataset.secureWasDisabled;
    saveButton.removeAttribute("title");
  }
}

function patchDashboardPublishToggles() {
  document.querySelectorAll(".dashboardPublishToggle").forEach(toggle => {
    const activePublished = toggle.checked === true;
    if (activePublished) {
      if (!Object.hasOwn(toggle.dataset, "secureWasDisabled")) {
        toggle.dataset.secureWasDisabled = String(toggle.disabled);
      }
      toggle.disabled = toggle.dataset.secureWasDisabled === "true";
      toggle.title = "Ausschalten beendet den Test sicher; Inhalte werden nicht zum Entwurf zurückgesetzt.";
      toggle.setAttribute("aria-label", "Veröffentlicht. Ausschalten beendet den Test sicher.");
    } else if (Object.hasOwn(toggle.dataset, "secureWasDisabled")) {
      toggle.disabled = toggle.dataset.secureWasDisabled === "true";
      delete toggle.dataset.secureWasDisabled;
      toggle.removeAttribute("title");
      toggle.removeAttribute("aria-label");
    }
  });
}

function patchAll() {
  patchSecureSolutionSetting();
  patchPublishedAssessmentLock();
  patchDashboardPublishToggles();
}

patchAll();

const observer = new MutationObserver(() => patchAll());
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class"]
});
