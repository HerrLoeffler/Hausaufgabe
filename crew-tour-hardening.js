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

function removeTourAbortControls(root = document) {
  root.querySelectorAll?.(".gcCoachClose").forEach(button => button.remove());
}

function tourIsActive() {
  return document.body?.classList.contains("gcRealTourActive");
}

function installStyles() {
  if (document.querySelector("style[data-gradecrew-tour-hardening]")) return;
  const style = document.createElement("style");
  style.dataset.gradecrewTourHardening = "1";
  style.textContent = `
    .gcCoachClose { display: none !important; }
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
  removeTourAbortControls();

  // Old onboarding and automatic info popups are retired while the Crew journey
  // is the primary onboarding. They may still exist for admin configuration, but
  // they are not allowed to open over the product tour.
  for (const id of ["teacherTourDialog", "announcementDialog"]) {
    const dialog = document.getElementById(id);
    if (!dialog) continue;
    new MutationObserver(() => suppressLegacyUi()).observe(dialog, {
      attributes: true,
      attributeFilter: ["open"]
    });
  }

  // Coaches are direct body children. Watching only body child additions avoids
  // the expensive whole-app observer that previously caused browser hangs.
  const bodyObserver = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        removeTourAbortControls(node);
      }
    }
    suppressLegacyUi();
  });
  if (document.body) bodyObserver.observe(document.body, { childList: true });

  // During the mandatory first journey there is no keyboard escape route either.
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
