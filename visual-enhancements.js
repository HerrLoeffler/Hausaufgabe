let started = false;

export function startVisualEnhancements() {
  if (started || typeof window === "undefined") return;
  started = true;

  window.setTimeout(async () => {
    // Keep optional presentation code isolated from the core app. The new
    // Crew-Tour is intentionally paused until its spotlight/observer flow is
    // proven stable in real Chrome and Safari sessions.
    const manualHint = document.querySelector("#createManualBtn .choiceText small");
    if (manualHint) {
      const replacement = document.createElement("span");
      replacement.className = "gcTourManualHint";
      replacement.textContent = "Oder ganz klassisch: leer starten und jede Aufgabe selbst bauen.";
      manualHint.replaceWith(replacement);
    }

    const modules = [
      ["Startguide-Sperre", "./first-guide-guard.js?v=2.3.1-gc6"],
      ["Lehrertexte", "./teacher-copy-polish.js?v=2.3.1-gc6"],
      ["Navigation", "./ui-enhancements.js?v=2.3.1-gc2"],
      ["Varianten", "./variant-enhancements.js?v=2.3.1-gc2"]
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
