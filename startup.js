// Keep optional presentation code out of the core application's import graph.
const notice = document.getElementById("startupNotice");
const message = document.getElementById("startupMessage");
const retry = document.getElementById("startupRetry");
retry?.addEventListener("click", () => location.reload());
const slowStart = window.setTimeout(() => {
  message.textContent = "GradeCrew wird geladen …";
  notice.classList.remove("hidden");
}, 6000);

try {
  await import("./app.js?v=2.3.1-gc1");
  window.clearTimeout(slowStart);
  notice.classList.add("hidden");
  import("./visual-enhancements.js?v=2.3.1-gc1").catch(error => {
    console.warn("Zusätzliche Ansichten konnten nicht geladen werden.", error);
  });
} catch (error) {
  window.clearTimeout(slowStart);
  console.error("GradeCrew konnte nicht starten:", error);
  message.textContent = "GradeCrew konnte nicht vollständig geladen werden. Bitte prüfe die Verbindung und lade die Seite erneut.";
  notice.classList.remove("hidden");
  retry.classList.remove("hidden");
}
