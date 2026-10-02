import { gradeCrewI18n } from "./shared/i18n/bootstrap.mjs?v=1";
import { GRADECREW_ASSETS } from "./generated/gradecrew-assets.js?v=1.2.0";
import { installStagingShortLogin } from "./staging-short-login.mjs?v=1";

// Public pupils use the server-authoritative assessment path. Teacher preview
// intentionally remains in the existing app so authors can inspect the exact
// test without creating a real attempt. Existing QR codes and share links keep
// their current ?test=CODE shape; this bootstrap performs the secure handoff.

function installGradeCrewDesignStyles() {
  const styles = [
    ["./generated/gradecrew-design-tokens.css?v=1.1.0", "tokens-1.1.0"],
    ["./gradecrew-dashboard-foundation.css?v=1", "dashboard-foundation-v1"],
    ["./gradecrew-logo.css?v=1", "brand-logo-v1"],
    ["./gradecrew-auth-startscreen.css?v=2", "auth-startscreen-v2"]
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

function installGradeCrewBrandAssets() {
  const primary = GRADECREW_ASSETS.brand?.primary;
  const favicon = GRADECREW_ASSETS.brand?.favicon || primary;
  if (!primary) return;

  document.querySelectorAll(".brandMark, [data-gradecrew-brand-mark]").forEach((host) => {
    if (host instanceof HTMLImageElement) {
      host.src = primary;
      host.dataset.gradecrewBrandMark = "1";
      return;
    }

    let image = host.querySelector("img[data-gradecrew-brand-mark]");
    if (!image) {
      image = document.createElement("img");
      image.alt = "";
      image.width = 44;
      image.height = 44;
      image.dataset.gradecrewBrandMark = "1";
      host.appendChild(image);
    }
    image.src = primary;
    host.dataset.gradecrewBrandReady = "1";
  });

  if (favicon) {
    let link = document.querySelector('link[data-gradecrew-favicon="1"], link[rel~="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      document.head.appendChild(link);
    }
    link.dataset.gradecrewFavicon = "1";
    link.type = "image/svg+xml";
    link.href = favicon;
  }
}

installGradeCrewDesignStyles();
installGradeCrewBrandAssets();
installStagingShortLogin();

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
    // Recompose the public entry before app.js binds the existing auth/test-code
    // handlers. The original forms and IDs are moved, not cloned or replaced.
    await import("./gradecrew-entry-flow.js?v=1");
    await import("./app.js?v=2.3.1-gc28");
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
