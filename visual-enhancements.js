let started = false;

export function startVisualEnhancements() {
  if (started || typeof window === "undefined") return;
  started = true;

  window.setTimeout(async () => {
    // One-time copy replacement before the tour observer starts. Keeping this
    // outside the observer prevents repeated DOM writes on every UI mutation.
    const manualHint = document.querySelector("#createManualBtn .choiceText small");
    if (manualHint) {
      const replacement = document.createElement("span");
      replacement.className = "gcTourManualHint";
      replacement.textContent = "Oder ganz klassisch: leer starten und jede Aufgabe selbst bauen.";
      manualHint.replaceWith(replacement);
    }

    const modules = [
      ["Crew-Tour", "./gradecrew-tour.js?v=2.3.1-gc3"],
      ["Navigation", "./ui-enhancements.js?v=2.3.1-gc2"],
      ["Varianten", "./variant-enhancements.js?v=2.3.1-gc2"],
      ["Admin-KI-Rechte", "./admin-ai-access.js?v=2.3.1-gc2"]
    ];
    const results = await Promise.allSettled(modules.map(([, path]) => import(path)));
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.warn(`GradeCrew ${modules[index][0]} konnte nicht geladen werden. Die Kern-App läuft weiter.`, result.reason);
      }
    });
  }, 0);
}

startVisualEnhancements();
