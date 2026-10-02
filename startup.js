import { gradeCrewI18n } from "./shared/i18n/bootstrap.mjs?v=1";

// Public pupils use the server-authoritative assessment path. Teacher preview
// intentionally remains in the existing app so authors can inspect the exact
// test without creating a real attempt. Existing QR codes and share links keep
// their current ?test=CODE shape; this bootstrap performs the secure handoff.

function installGradeCrewDesignStyles() {
  const styles = [
    ["./generated/gradecrew-design-tokens.css?v=1.1.0", "tokens-1.1.0"],
    ["./gradecrew-dashboard-foundation.css?v=1", "dashboard-foundation-v1"]
  ];
  for (const [href, version] of styles) {
    if (document.querySelector(`link[data-gradecrew-design="${version}"]`)) continue;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.gradecrewDesign = version;
    document.head.appendChild(link);
  }
}

installGradeCrewDesignStyles();

const routeParams = new URLSearchParams(location.search);
const rawPublicTestCode = String(routeParams.get("test") || "").trim();
const publicTestCode = rawPublicTestCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
const teacherPreview = routeParams.get("preview") === "1";

if (publicTestCode && !teacherPreview) {
  const target = new URL("./secure-student.html", location.href);
  target.search = "";
  target.hash = "";
  target.searchParams.set("test", publicTestCode);
  location.replace(target.href);
} else {
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
    message.textContent = gradeCrewI18n.t("system.loading", {}, "GradeCrew wird geladen …");
    notice.classList.remove("hidden");
  }, 6000);

  try {
    await import("./app.js?v=2.3.1-gc28");
    await import("./shared/i18n/assessment-locale-ui.mjs?v=1");
    window.clearTimeout(slowStart);
    notice.classList.add("hidden");
    import("./secure-assessment-teacher-polish.js?v=2.3.1-sec1").catch(error => {
      console.warn(gradeCrewI18n.t("system.secure_assessment_notice_failed", {}, "Secure-Assessment-Hinweise konnten nicht geladen werden."), error);
    });
    import("./visual-enhancements.js?v=2.3.1-gc26").catch(error => {
      console.warn(gradeCrewI18n.t("system.extra_views_failed", {}, "Zusätzliche Ansichten konnten nicht geladen werden."), error);
    });
  } catch (error) {
    window.clearTimeout(slowStart);
    console.error(gradeCrewI18n.t("system.start_failed", {}, "GradeCrew konnte nicht starten:"), error);
    message.textContent = gradeCrewI18n.t("system.load_failed", {}, "GradeCrew konnte nicht vollständig geladen werden. Bitte prüfe die Verbindung und lade die Seite erneut.");
    notice.classList.remove("hidden");
    retry.classList.remove("hidden");
  }
}
