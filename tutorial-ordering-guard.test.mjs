import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { installTutorialOrderingGuard } from "./tutorial-ordering-guard.js";

const require = createRequire(import.meta.url);
const { JSDOM } = require("./tools/ui/node_modules/jsdom");

function buildFixture(t, { tutorialActive = true } = {}) {
  const bodyClass = tutorialActive ? "gcRealTourActive gcTourAnswering" : "";
  const dom = new JSDOM(`<!doctype html><html><head></head><body class="${bodyClass}">
    <form id="studentForm">
      <section class="studentQuestion" data-qid="finale">
        <h3>Crew-Finale: Wer war zuerst da?</h3>
        <p>Bringe die vier Crew-Mitglieder in die richtige Reihenfolge.</p>
        <div class="sortableList">
          <div class="sortItem" draggable="true"><span class="sortGrip">⋮⋮</span><span>Coco</span><div class="sortButtons"><button type="button" class="iconButton up">↑</button><button type="button" class="iconButton down">↓</button></div></div>
          <div class="sortItem" draggable="true"><span class="sortGrip">⋮⋮</span><span>Remy</span><div class="sortButtons"><button type="button" class="iconButton up">↑</button><button type="button" class="iconButton down">↓</button></div></div>
        </div>
      </section>
      <div id="studentSubmitArea"><button id="studentSubmitBtn" class="button primary" type="submit">Antworten abgeben</button></div>
    </form>
  </body></html>`, { url: "https://example.test", pretendToBeVisual: true });
  t.after(() => dom.window.close());
  const { window: w } = dom;
  const { document: d } = w;
  Object.defineProperty(w, "innerHeight", { value: 800, configurable: true });
  d.querySelector('[data-qid="finale"]').getBoundingClientRect = () => ({ top: 260, bottom: 650, height: 390, left: 0, right: 700, width: 700 });
  d.getElementById("studentSubmitArea").getBoundingClientRect = () => ({ top: 900, bottom: 960, height: 60, left: 0, right: 700, width: 700 });
  d.querySelector('[data-qid="finale"]').scrollIntoView = () => {};
  return { w, d };
}

test("tutorial Crew finale is arrow-only and keeps submit action available", t => {
  const { w, d } = buildFixture(t);
  const cleanup = installTutorialOrderingGuard(d, w);
  t.after(cleanup);

  const row = d.querySelector(".sortItem");
  const grip = d.querySelector(".sortGrip");
  assert.equal(row.draggable, false, "native drag must be disabled in the tutorial finale");
  assert.equal(row.getAttribute("draggable"), "false");
  assert.ok(row.classList.contains("gcTutorialOrderingArrowOnly"));
  assert.equal(grip.getAttribute("aria-hidden"), "true", "drag affordance must be hidden from assistive output too");
  assert.match(d.querySelector(".gcTutorialOrderingArrowHint")?.textContent || "", /Pfeilen ↑ und ↓/);
  assert.ok(d.body.classList.contains("gcTutorialFinaleSubmitPinned"), "submit button is pinned when its normal position is below the viewport");

  const drag = new w.Event("dragstart", { bubbles: true, cancelable: true });
  row.dispatchEvent(drag);
  assert.equal(drag.defaultPrevented, true, "drag attempts are actively cancelled");

  const touchMove = new w.Event("touchmove", { bubbles: true, cancelable: true });
  row.dispatchEvent(touchMove);
  assert.equal(touchMove.defaultPrevented, true, "swiping on a finale row must not scroll the page");

  const arrowClick = new w.MouseEvent("click", { bubbles: true, cancelable: true });
  d.querySelector("button.down").dispatchEvent(arrowClick);
  assert.equal(arrowClick.defaultPrevented, false, "arrow controls remain normal clickable buttons");
});

test("guard restores ordering behaviour when the tutorial answer phase ends", t => {
  const { w, d } = buildFixture(t);
  const cleanup = installTutorialOrderingGuard(d, w);
  const row = d.querySelector(".sortItem");
  assert.equal(row.draggable, false);

  d.body.classList.remove("gcTourAnswering");
  cleanup();

  assert.equal(row.getAttribute("draggable"), "true", "original draggable state is restored outside the tutorial finale");
  assert.equal(row.classList.contains("gcTutorialOrderingArrowOnly"), false);
  assert.equal(d.querySelector(".gcTutorialOrderingArrowHint"), null);
  assert.equal(d.body.classList.contains("gcTutorialFinaleSubmitPinned"), false);
});

test("normal ordering tasks are untouched outside the tutorial", t => {
  const { w, d } = buildFixture(t, { tutorialActive: false });
  const cleanup = installTutorialOrderingGuard(d, w);
  t.after(cleanup);

  const row = d.querySelector(".sortItem");
  assert.equal(row.getAttribute("draggable"), "true");
  assert.equal(row.draggable, true);
  assert.equal(d.querySelector(".gcTutorialOrderingArrowHint"), null);
  assert.equal(d.body.classList.contains("gcTutorialFinaleOrdering"), false);
});
