// Keep optional presentation code out of the core application's import graph.
const notice = document.getElementById("startupNotice");
const message = document.getElementById("startupMessage");
const retry = document.getElementById("startupRetry");
retry?.addEventListener("click", () => location.reload());

// The creator role changed from falcon to elephant. Swap the static artwork
// before app startup so the old mascot never flashes while modules load.
document.querySelectorAll('img[src*="falcon-create.svg"]').forEach(img => {
  img.src = img.src.replace("falcon-create.svg", "elephant-create.svg");
});

// The legacy first-test guide uses a full-screen visual backdrop. That backdrop
// is visual only; interaction is filtered separately so only the active target
// and the guide card can be used.
const firstGuideClickStyle = document.createElement("style");
firstGuideClickStyle.dataset.gradecrewFirstGuideClickFix = "1";
firstGuideClickStyle.textContent = `
  .firstAiGuideBackdrop { pointer-events: none !important; }
  .firstAiGuideCard { pointer-events: auto !important; }
`;
document.head.appendChild(firstGuideClickStyle);

const slowStart = window.setTimeout(() => {
  message.textContent = "GradeCrew wird geladen …";
  notice.classList.remove("hidden");
}, 6000);

try {
  await import("./app.js?v=2.3.1-gc11");
  window.clearTimeout(slowStart);
  notice.classList.add("hidden");
  import("./visual-enhancements.js?v=2.3.1-gc9").catch(error => {
    console.warn("Zusätzliche Ansichten konnten nicht geladen werden.", error);
  });
} catch (error) {
  window.clearTimeout(slowStart);
  console.error("GradeCrew konnte nicht starten:", error);
  message.textContent = "GradeCrew konnte nicht vollständig geladen werden. Bitte prüfe die Verbindung und lade die Seite erneut.";
  notice.classList.remove("hidden");
  retry.classList.remove("hidden");
}
