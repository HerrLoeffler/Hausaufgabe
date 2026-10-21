import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { JSDOM } = require("./tools/ui/node_modules/jsdom");
const tourSource = fs.readFileSync("gradecrew-tour-v7.js", "utf8");
const hardeningSource = fs.readFileSync("crew-tour-hardening.js", "utf8");
const appSource = fs.readFileSync("app.js", "utf8");

function fixture(t) {
  const dom = new JSDOM(fs.readFileSync("index.html", "utf8"), {
    url: "https://example.test", runScripts: "outside-only", pretendToBeVisual: true
  });
  const w = dom.window;
  t.after(() => w.close());
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.CSS = { escape: value => String(value) };
  w.eval(tourSource.replace(/^export /gm, "") + "\nwindow.installTour=installCrewTour;");
  return w;
}

function adapter(w) {
  const decisions = [];
  let exits = 0;
  return {
    decisions,
    get exits() { return exits; },
    uid: () => "teacher-a",
    isDashboard: () => true,
    beginRun: () => {},
    createDemo: async () => "DEMO1",
    openEditor: async () => {},
    isEditor: () => true,
    questionId: index => `q-${index}`,
    focusQuestion: () => {},
    showSettings: () => {},
    checkDemo: () => null,
    focusReviewQuestion: () => {},
    handleTourOffer: async choice => decisions.push(choice),
    exitTour: async () => { exits += 1; }
  };
}

async function flushOffer(w) {
  await new Promise(resolve => w.setTimeout(resolve, 280));
}

test("new teacher gets one strong choice instead of an automatic tour", async t => {
  const w = fixture(t);
  const api = adapter(w);
  const tour = w.installTour(api);
  tour.dashboard({ uid: "teacher-a", firstVisit: true, completed: false, offerHandled: false, isAdmin: false });
  assert.equal(tour.active, false, "dashboard invitation must not auto-start the tutorial");
  await flushOffer(w);
  const offer = w.document.getElementById("gradecrewTutorialOffer");
  assert.ok(offer, "one-time tutorial invitation is visible");
  assert.match(offer.textContent, /5–7 Min/);
  assert.match(offer.textContent, /jederzeit abbrechen/i);
  assert.ok(w.document.getElementById("gradecrewTourBtn"), "manual tutorial entry remains visible");

  offer.querySelector(".gcTutorialOfferLater").click();
  await Promise.resolve();
  assert.deepEqual(api.decisions, ["later"]);
  assert.equal(w.document.getElementById("gradecrewTutorialOffer"), null);
  assert.equal(tour.active, false);

  tour.dashboard({ uid: "teacher-a", firstVisit: true, completed: false, offerHandled: true, isAdmin: false });
  await flushOffer(w);
  assert.equal(w.document.getElementById("gradecrewTutorialOffer"), null, "handled invitation does not return");
});

test("starting from invitation records the choice and the tour remains abortable", async t => {
  const w = fixture(t);
  const api = adapter(w);
  const tour = w.installTour(api);
  tour.dashboard({ uid: "teacher-a", firstVisit: true, completed: false, offerHandled: false, isAdmin: false });
  await flushOffer(w);
  w.document.querySelector(".gcTutorialOfferStart").click();
  await Promise.resolve();
  assert.deepEqual(api.decisions, ["start"]);
  assert.equal(tour.active, true);
  assert.ok(w.document.querySelector(".gcRealCoach"));

  w.document.dispatchEvent(new w.CustomEvent("gradecrew:tutorial-abort-request", { detail: { source: "test" } }));
  await Promise.resolve();
  assert.equal(tour.active, false);
  assert.equal(api.exits, 1, "aborting returns to dashboard");
});

test("admins are never auto-invited but can explicitly test the tutorial", async t => {
  const w = fixture(t);
  const api = adapter(w);
  const tour = w.installTour(api);
  tour.dashboard({ uid: "teacher-a", firstVisit: true, completed: false, offerHandled: false, isAdmin: true });
  await flushOffer(w);
  assert.equal(w.document.getElementById("gradecrewTutorialOffer"), null);
  const button = w.document.getElementById("gradecrewTourBtn");
  assert.ok(button);
  assert.match(button.textContent, /Crew kennenlernen/);
  assert.match(button.textContent, /Tutorial · ca\. 6–7 Minuten/);
  button.click();
  assert.equal(tour.active, true);
});

test("completed teachers still have a manual replay button", async t => {
  const w = fixture(t);
  const api = adapter(w);
  const tour = w.installTour(api);
  tour.dashboard({ uid: "teacher-a", firstVisit: true, completed: true, offerHandled: false, isAdmin: false });
  await flushOffer(w);
  assert.equal(w.document.getElementById("gradecrewTutorialOffer"), null);
  const button = w.document.getElementById("gradecrewTourBtn");
  assert.ok(button);
  assert.match(button.textContent, /Tutorial/);
});

test("hardening exposes close control instead of removing it and app persists offer choice", () => {
  assert.doesNotMatch(hardeningSource, /gcCoachClose\s*\{\s*display:\s*none/i);
  assert.match(hardeningSource, /gradecrew:tutorial-abort-request/);
  assert.match(hardeningSource, /Tutorial beenden/);
  assert.match(appSource, /crewTourOfferHandledAt/);
  assert.match(appSource, /isAdmin:\s*isAdmin\(\)/);
  assert.match(appSource, /exitTour:\s*\(\)\s*=>\s*guestTourRepo\s*\?\s*exitGuestTour\(\)\s*:\s*loadDashboard\(\)/);
});
