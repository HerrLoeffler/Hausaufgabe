import {
  installCrewTour as installV7,
  CREW,
  DEMO_TEST as V7_DEMO_TEST
} from "./gradecrew-tour-v7.js?v=clay2";

export const TOUR_VERSION = "gradecrew-live-tour-v8";
export { CREW };

const clone = value => JSON.parse(JSON.stringify(value));

function variantSourceQuestion() {
  return {
    type: "dropdown",
    text: "Select the English translation of „Bleistift“.",
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

  // Keep the complete tutorial at 10 points while making the Crew finale count.
  // Ordering is already graded proportionally by the core app, so four correctly
  // placed Crew members are naturally worth 4 × 0.5 = 2 points.
  demo.questions[0].points = 0.5;
  demo.questions[1].points = 0.5;
  demo.questions[9].points = 2;
  demo.questions[9].tutorialCrewFinale = true;
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
    const question = single("Look at the picture. Which animal can you see?", ["dog", "bird", "cat"], 2);
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
  const titleNode = coach.querySelector("h2");
  const title = titleNode?.textContent?.trim() || "";
  const paragraph = coach.querySelector(":scope > p");

  if (title.includes("KI spart Zeit")) {
    if (titleNode) titleNode.textContent = "Remy nimmt dir viel Arbeit ab.";
    if (paragraph) paragraph.textContent = "Auch mit seinem großen Elefantenkopf kann Remy sich mal vertun. Deshalb schauen wir kurz gemeinsam über den Entwurf – so wird aus seiner Vorarbeit dein sauberer Test.";
  }

  const preview = coach.querySelector(".gcVariantSourcePreview");
  if (preview) {
    preview.innerHTML = '<span>Aufgabe 6 · Dropdown</span><strong>Select the English translation of „Bleistift“.</strong><small>pencil ✓ · book · schoolbag</small>';
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

  let tutorialSubmissionId = "";
  let reviewFallbackTimer = 0;

  const clearReviewFallback = () => {
    if (reviewFallbackTimer) clearTimeout(reviewFallbackTimer);
    reviewFallbackTimer = 0;
  };

  const scheduleReviewFallback = () => {
    clearReviewFallback();
    if (!tutorialSubmissionId) return;
    const tryOpenCurrentReview = () => {
      reviewFallbackTimer = 0;
      const panel = document.getElementById("reviewPanel");
      if (panel && !panel.classList.contains("hidden")) return;
      const button = [...document.querySelectorAll("#resultsTableWrap .reviewBtn")]
        .find(node => node.dataset.id === tutorialSubmissionId && !node.disabled);
      if (button) {
        // Programmatic click is deliberately only a tutorial fail-safe. It opens
        // the exact same submitted practice attempt and never saves a grade.
        button.click();
        return;
      }
      reviewFallbackTimer = setTimeout(tryOpenCurrentReview, 2000);
    };
    // On iPad a long pause can leave V7 holding a stale table-button reference
    // after a results re-render. Give the user time to click normally, then
    // recover by opening the current matching button from the live DOM.
    reviewFallbackTimer = setTimeout(tryOpenCurrentReview, 20_000);
  };

  const notify = base.notify.bind(base);
  base.notify = (event, data = {}) => {
    if (event === "submitted" && data?.submissionId) {
      tutorialSubmissionId = String(data.submissionId);
      clearReviewFallback();
    }
    const result = notify(event, data);
    if (event === "results-ready") scheduleReviewFallback();
    if (event === "review-opened" || event === "review-saved") clearReviewFallback();
    return result;
  };

  // Once onboarding has been completed for this account, do not keep a
  // persistent "Mit der Crew starten" button on the dashboard. Optional help
  // is now offered contextually by Remy only when creating an AI test.
  const dashboard = base.dashboard.bind(base);
  base.dashboard = args => {
    clearReviewFallback();
    if (args?.completed) {
      document.getElementById("gradecrewTourBtn")?.remove();
      return;
    }
    dashboard(args);
  };

  // Keep V7's live active/creating getters. Spreading base snapshots both as
  // false and accidentally routes onboarding through the paid AI job path.
  base.preparedResponse = preparedResponse;
  return base;
}
