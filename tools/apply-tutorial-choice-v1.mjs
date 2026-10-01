import fs from "node:fs";

function replaceOnce(source, anchor, replacement, label) {
  const count = source.split(anchor).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(anchor, replacement);
}

function patchTour() {
  const path = "gradecrew-tour-v7.js";
  let source = fs.readFileSync(path, "utf8");
  const helpers = fs.readFileSync("tools/tutorial-choice-v1-helpers.txt", "utf8").trimEnd();
  const dashboard = fs.readFileSync("tools/tutorial-choice-v1-dashboard.txt", "utf8").trimEnd();

  source = source.replace("// GradeCrew mandatory guided onboarding.", "// GradeCrew guided onboarding.");

  if (!source.includes("function showOffer()")) {
    source = replaceOnce(
      source,
      "  const offered = new Set();\n",
      `  const offered = new Set();\n\n${helpers}\n`,
      "tutorial helpers"
    );
  }

  if (!source.includes('abortTour("escape")')) {
    source = replaceOnce(
      source,
      "  function blockKeyboard(event) {\n    if (!owned() || !event.isTrusted) return;\n",
      "  function blockKeyboard(event) {\n    if (!owned() || !event.isTrusted) return;\n    if (event.key === \"Escape\") {\n      event.preventDefault();\n      event.stopPropagation();\n      event.stopImmediatePropagation?.();\n      abortTour(\"escape\");\n      return;\n    }\n",
      "Escape abort"
    );
  }

  if (!source.includes("freeRegion = null;\n    removeOffer();\n    hideCoach();")) {
    source = replaceOnce(
      source,
      "    freeRegion = null;\n    hideCoach();",
      "    freeRegion = null;\n    removeOffer();\n    hideCoach();",
      "stop removes offer"
    );
  }

  if (!source.includes("removeOffer();\n    suppressLegacyGuides();")) {
    source = replaceOnce(
      source,
      "  function start() {\n    if (active || !api.uid() || !api.isDashboard()) return;\n    suppressLegacyGuides();",
      "  function start() {\n    if (active || !api.uid() || !api.isDashboard()) return;\n    removeOffer();\n    suppressLegacyGuides();",
      "start removes offer"
    );
  }

  const dashboardStart = source.indexOf("  function dashboard({uid,firstVisit,completed=false}) {");
  const dashboardEndMarker = "\n\n  document.addEventListener(\"gradecrew:variant-dialog-opened\"";
  if (dashboardStart >= 0) {
    const dashboardEnd = source.indexOf(dashboardEndMarker, dashboardStart);
    if (dashboardEnd < 0) throw new Error("dashboard end marker missing");
    source = source.slice(0, dashboardStart) + dashboard + source.slice(dashboardEnd);
  } else if (!source.includes("offerHandled = false")) {
    throw new Error("dashboard function neither legacy nor patched");
  }

  if (!source.includes('document.addEventListener("gradecrew:tutorial-abort-request"')) {
    source = replaceOnce(
      source,
      '  document.addEventListener("gradecrew:variant-dialog-opened",event=>',
      '  document.addEventListener("gradecrew:tutorial-abort-request", event => { if (owned()) abortTour(event.detail?.source || "button"); });\n  document.addEventListener("gradecrew:variant-dialog-opened",event=>',
      "abort event"
    );
  }

  if (!source.includes("tutorial-choice-v1.css")) {
    source = replaceOnce(
      source,
      '  const style=document.createElement("link");style.rel="stylesheet";style.href="./gradecrew-tour.css?v=2.3.1-gc21";document.head.append(style);',
      '  const style=document.createElement("link");style.rel="stylesheet";style.href="./gradecrew-tour.css?v=2.3.1-gc21";document.head.append(style);\n  const choiceStyle=document.createElement("link");choiceStyle.rel="stylesheet";choiceStyle.href="./tutorial-choice-v1.css?v=1";document.head.append(choiceStyle);',
      "tutorial choice stylesheet"
    );
  }

  fs.writeFileSync(path, source);
}

function patchApp() {
  const path = "app.js";
  let source = fs.readFileSync(path, "utf8");

  if (!source.includes("handleTourOffer: async")) {
    const oldBlock = `        startNewTest: openCreateView,\n        completeTour: async () => {\n          const uid=state.user?.uid;if(!uid)throw new Error("Bitte anmelden.");\n          await updateDoc(doc(db,"users",uid),{crewTourCompletedAt:serverTimestamp()});\n          if(state.user?.uid===uid)state.profile={...state.profile,crewTourCompletedAt:true};\n        }`;
    const newBlock = `        startNewTest: openCreateView,\n        exitTour: () => loadDashboard(),\n        completeTour: async () => {\n          const uid=state.user?.uid;if(!uid)throw new Error("Bitte anmelden.");\n          await updateDoc(doc(db,"users",uid),{crewTourCompletedAt:serverTimestamp()});\n          if(state.user?.uid===uid)state.profile={...state.profile,crewTourCompletedAt:true};\n        },\n        handleTourOffer: async (choice = "later") => {\n          const uid=state.user?.uid;if(!uid)return;\n          const normalized=choice === "start" ? "started" : "later";\n          await updateDoc(doc(db,"users",uid),{crewTourOfferHandledAt:serverTimestamp(),crewTourOfferChoice:normalized});\n          if(state.user?.uid===uid)state.profile={...state.profile,crewTourOfferHandledAt:true,crewTourOfferChoice:normalized};\n        }`;
    source = replaceOnce(source, oldBlock, newBlock, "app tutorial adapter");
  }

  const oldDashboard = '      crewTour.dashboard({uid: state.user.uid, firstVisit: true, completed: Boolean(state.profile?.crewTourCompletedAt)});';
  const newDashboard = '      crewTour.dashboard({uid: state.user.uid, firstVisit: true, completed: Boolean(state.profile?.crewTourCompletedAt), offerHandled: Boolean(state.profile?.crewTourOfferHandledAt), isAdmin: isAdmin()});';
  if (!source.includes(newDashboard)) source = replaceOnce(source, oldDashboard, newDashboard, "dashboard tutorial context");

  fs.writeFileSync(path, source);
}

patchTour();
patchApp();
console.log("Tutorial choice/replay V1 patch applied");
