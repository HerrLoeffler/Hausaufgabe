let scheduled = 0;

function cleanAiStatus() {
  const notice = document.getElementById("aiBetaNotice");
  if (!notice) return;
  const text = notice.textContent || "";
  if (/KI-Beta/i.test(text)) {
    notice.textContent = "KI-Zugang ist aktiv.";
    notice.classList.remove("error");
  }
}

function removeInternalCostCopy() {
  document.querySelectorAll(".firstAiGuideCost").forEach(node => node.remove());

  document.querySelectorAll(".teacherTourBullet").forEach(node => {
    if (/\bkosten\b|kostenpflichtig/i.test(node.textContent || "")) node.remove();
  });

  document.querySelectorAll(".aiImageComposer small").forEach(node => {
    node.textContent = "Kurz beschreiben. Die Beschreibung geht an OpenAI; bitte keine personenbezogenen Angaben.";
  });
}

function removeRedundantDraftAside() {
  const aiView = document.getElementById("aiView");
  if (!aiView) return;
  aiView.querySelectorAll(".infoBox,.aiHint,.aiAside,.aiCallout,aside,div,p,small").forEach(node => {
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length > 320) return;
    if (/^Entwurf bleibt bei dir\b/i.test(text) || /^Dein Entwurf bleibt bei dir\b/i.test(text)) node.remove();
  });
}

function suppressLegacyInfoTour() {
  const dialog = document.getElementById("teacherTourDialog");
  if (!(dialog instanceof HTMLDialogElement) || dialog.dataset.gradecrewSuppressed === "1") return;
  dialog.dataset.gradecrewSuppressed = "1";
  if (dialog.open) dialog.close();
  // The old welcome/info slideshow duplicates the interactive Crew onboarding.
  // Keep it dormant for now so only one onboarding system can own the screen.
  dialog.showModal = () => {};
  dialog.show = () => {};
}

function polishTeacherCopy() {
  scheduled = 0;
  suppressLegacyInfoTour();
  cleanAiStatus();
  removeInternalCostCopy();
  removeRedundantDraftAside();
}

function schedulePolish() {
  window.clearTimeout(scheduled);
  scheduled = window.setTimeout(polishTeacherCopy, 0);
}

function installTeacherCopyPolish() {
  polishTeacherCopy();
  document.addEventListener("click", () => {
    schedulePolish();
    window.setTimeout(polishTeacherCopy, 120);
  }, false);

  const status = document.getElementById("aiBetaNotice");
  if (status) {
    new MutationObserver(polishTeacherCopy).observe(status, { childList: true, characterData: true, subtree: true });
  }
}

if (document.body) installTeacherCopyPolish();
else document.addEventListener("DOMContentLoaded", installTeacherCopyPolish, { once: true });

export { polishTeacherCopy };
