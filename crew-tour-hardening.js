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
}

function removeTourAbortControls(root = document) {
  root.querySelectorAll?.(".gcCoachClose").forEach(button => button.remove());
}

function tourIsActive() {
  return document.body?.classList.contains("gcRealTourActive");
}

function keepLegacyDialogsClosed() {
  if (!tourIsActive()) return;
  suppressLegacyUi();
}

function installStyles() {
  if (document.querySelector("style[data-gradecrew-tour-hardening]")) return;
  const style = document.createElement("style");
  style.dataset.gradecrewTourHardening = "1";
  style.textContent = `
    body.gcRealTourActive .gcCoachClose { display: none !important; }
    body.gcRealTourActive #firstAiGuideBackdrop,
    body.gcRealTourActive #firstAiGuideCard { display: none !important; }
  `;
  document.head.appendChild(style);
}

function installCrewTourHardening() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  installStyles();
  suppressLegacyUi();
  removeTourAbortControls();

  const bodyObserver = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(".gcRealCoach")) removeTourAbortControls(node);
        else removeTourAbortControls(node);
      }
    }
    keepLegacyDialogsClosed();
  });
  if (document.body) bodyObserver.observe(document.body, { childList: true });

  const watchDialog = id => {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    new MutationObserver(() => keepLegacyDialogsClosed()).observe(dialog, { attributes: true, attributeFilter: ["open"] });
  };
  watchDialog("teacherTourDialog");

  document.addEventListener("keydown", event => {
    if (!tourIsActive() || event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }, true);

  document.addEventListener("gradecrew:account-changed", suppressLegacyUi);
}

installCrewTourHardening();

export { installCrewTourHardening };
