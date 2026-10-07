let installed = false;

function closeDialog(dialog) {
  if (!dialog?.open) return;
  try { dialog.close(); } catch { dialog.removeAttribute("open"); }
}

function suppressLegacyUi() {
  document.getElementById("firstAiGuideBackdrop")?.classList.add("hidden");
  document.getElementById("firstAiGuideCard")?.classList.add("hidden");
  document.querySelectorAll(".firstAiGuideSpotlight").forEach(node => node.classList.remove("firstAiGuideSpotlight"));
  closeDialog(document.getElementById("teacherTourDialog"));
  closeDialog(document.getElementById("announcementDialog"));
}

function tourIsActive() {
  return document.body?.classList.contains("gcRealTourActive");
}

function requestTourAbort(source = "button") {
  document.dispatchEvent(new CustomEvent("gradecrew:tutorial-abort-request", { detail: { source } }));
}

function ensureTourAbortControls(root = document) {
  const coaches = [];
  if (root instanceof Element && root.matches?.(".gcRealCoach")) coaches.push(root);
  root.querySelectorAll?.(".gcRealCoach").forEach(coach => coaches.push(coach));
  for (const coach of coaches) {
    if (coach.querySelector(".gcCoachClose")) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gcCoachClose";
    button.setAttribute("aria-label", "Tutorial beenden");
    button.title = "Tutorial beenden";
    button.textContent = "×";
    button.addEventListener("click", () => requestTourAbort("close"));
    coach.prepend(button);
  }
}

function installStyles() {
  if (document.querySelector("style[data-gradecrew-tour-hardening]")) return;
  const style = document.createElement("style");
  style.dataset.gradecrewTourHardening = "1";
  style.textContent = `
    .gcCoachClose {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 4;
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: 999px;
      background: rgba(255,255,255,.9);
      color: #344054;
      font: 700 24px/1 system-ui, sans-serif;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(16,24,40,.12);
    }
    .gcCoachClose:hover { background: #fff; transform: translateY(-1px); }
    .gcCoachClose:focus-visible { outline: 3px solid rgba(47,100,214,.28); outline-offset: 2px; }
    #firstAiGuideBackdrop,
    #firstAiGuideCard,
    #announcementHost { display: none !important; }
  `;
  document.head.appendChild(style);
}

function installCrewTourHardening() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  suppressLegacyUi();
  ensureTourAbortControls();

  // Old onboarding and automatic info popups remain suppressed while the Crew
  // journey is the primary onboarding. The Crew journey itself is abortable.
  for (const id of ["teacherTourDialog", "announcementDialog"]) {
    const dialog = document.getElementById(id);
    if (!dialog) continue;
    new MutationObserver(() => suppressLegacyUi()).observe(dialog, {
      attributes: true,
      attributeFilter: ["open"]
    });
  }

  const bodyObserver = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        ensureTourAbortControls(node);
      }
    }
    suppressLegacyUi();
  });
  if (document.body) bodyObserver.observe(document.body, { childList: true });

  document.addEventListener("keydown", event => {
    if (!tourIsActive() || event.key !== "Escape") return;
    // Let the active submission dialog cancel without ending the tutorial.
    if (document.body.classList.contains("gcTourAnswering") &&
        event.target instanceof Element &&
        event.target.closest("dialog.studentSubmitConfirm[open]")) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    requestTourAbort("escape");
  }, true);

  document.addEventListener("gradecrew:account-changed", suppressLegacyUi);
}

installCrewTourHardening();

export { installCrewTourHardening };
