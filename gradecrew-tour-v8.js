import {
  installCrewTour as installV7,
  CREW,
  DEMO_TEST as V7_DEMO_TEST
} from "./gradecrew-tour-v7.js?v=2.3.1-gc18";

export const TOUR_VERSION = "gradecrew-live-tour-v8";
export { CREW };

const clone = value => JSON.parse(JSON.stringify(value));

function variantSourceQuestion() {
  return {
    type: "dropdown",
    text: "Choose the correct school thing for „Bleistift“.",
    points: 1,
    options: [
      { text: "pencil", correct: true },
      { text: "book", correct: false },
      { text: "schoolbag", correct: false }
    ]
  };
}

function buildDemoTest() {
  const demo = clone(V7_DEMO_TEST);
  demo.questions[5] = variantSourceQuestion();
  return demo;
}

export const DEMO_TEST = buildDemoTest();

function single(text, choices, answer) {
  return {
    type: "single",
    text,
    points: 1,
    options: choices.map((label, index) => ({ text: label, correct: index === answer }))
  };
}

export function preparedResponse(_question, { variant = false } = {}) {
  if (variant) {
    const question = single("Choose the English word for „Katze“.", ["dog", "bird", "cat"], 2);
    return {
      question: {
        ...question,
        mediaIntent: { kind: "none" },
        tutorialImageUrl: "/assets/gradecrew/demo-cat.svg"
      },
      meta: { model: "prepared-tutorial", promptVersion: TOUR_VERSION }
    };
  }
  const question = single("Choose the English word for „Hund“.", ["cat", "dog", "bird"], 1);
  return {
    question: { ...question, mediaIntent: { kind: "none" } },
    meta: { model: "prepared-tutorial", promptVersion: TOUR_VERSION }
  };
}

function patchCoach(coach) {
  if (!(coach instanceof Element)) return;
  const title = coach.querySelector("h2")?.textContent?.trim() || "";
  const paragraph = coach.querySelector(":scope > p");

  if (title.includes("KI spart Zeit")) {
    if (paragraph) paragraph.textContent = "GradeCrew prüft den Entwurf automatisch. Trotzdem schauen wir kurz gemeinsam drauf – denn kleine KI-Fehler können vorkommen. Unser Ziel ist ein möglichst sauberer, direkt einsetzbarer Test.";
  }

  const preview = coach.querySelector(".gcVariantSourcePreview");
  if (preview) {
    preview.innerHTML = '<span>Aufgabe 6 · Dropdown</span><strong>Choose the correct school thing for „Bleistift“.</strong><small>pencil ✓ · book · schoolbag</small>';
  }

  if (title === "Die hier gefällt mir gut." && paragraph) {
    paragraph.textContent = "Das ist Aufgabe 6 – eine andere Aufgabe als eben. Lass uns daraus zusätzlich eine Bild-Variante machen, damit du siehst, wie aus einer guten Aufgabe schnell eine neue Version entsteht.";
  }
}

function installCoachPolish() {
  document.querySelectorAll(".gcRealCoach").forEach(patchCoach);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(".gcRealCoach")) patchCoach(node);
      }
    }
  });
  if (document.body) observer.observe(document.body, { childList: true });
  return observer;
}

export function installCrewTour(api) {
  const proxy = {
    ...api,
    createDemo: async () => api.createDemo(buildDemoTest())
  };
  const base = installV7(proxy);
  installCoachPolish();

  const dashboard = base.dashboard;
  // Keep V7's live active/creating getters. Spreading base snapshots both as
  // false and accidentally routes onboarding through the paid AI job path.
  base.preparedResponse = preparedResponse;
  base.dashboard = function dashboardV8(args) {
    const uid = args?.uid || api.uid?.() || "";
    if (uid) {
      const migrationKey = `gradecrew-tour-v8-migrated:${uid}`;
      try {
        if (localStorage.getItem(migrationKey) !== "1") {
          localStorage.removeItem(`gradecrew-live-tour-v7:${uid}`);
          localStorage.setItem(migrationKey, "1");
        }
      } catch {}
    }
    return dashboard(args);
  };
  return base;
}

