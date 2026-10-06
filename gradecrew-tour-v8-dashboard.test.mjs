import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const v7Source = fs.readFileSync('gradecrew-tour-v7.js', 'utf8');
const v8Source = fs.readFileSync('gradecrew-tour-v8.js', 'utf8');

function fixture(t) {
  const dom = new JSDOM('<!doctype html><html><body><div class="dashboardActions"></div></body></html>', {
    url: 'https://example.test', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  t.after(() => w.close());
  w.HTMLElement.prototype.scrollIntoView = function () {};

  w.eval(v7Source.replace(/^export /gm, '') + '\nwindow.installV7=installCrewTour;window.crewV7=CREW;window.demoV7=DEMO_TEST;');
  const wrapper = v8Source
    .replace(/^import \{[\s\S]*?\} from .*?;\n/, '')
    .replace(/^export \{ CREW \};\n/m, '')
    .replace(/^export /gm, '');
  w.eval(`(() => { const installV7=window.installV7, CREW=window.crewV7, V7_DEMO_TEST=window.demoV7;\n${wrapper}\nwindow.installV8=installCrewTour; })()`);
  return w;
}

function adapter() {
  return {
    uid: () => 'teacher-a',
    isDashboard: () => true,
    beginRun: () => {},
    createDemo: async () => 'DEMO1',
    openEditor: async () => {},
    isEditor: () => true,
    questionId: index => `tutorial-${index + 1}`,
    focusQuestion: () => {},
    showSettings: () => {},
    checkDemo: () => null,
    focusReviewQuestion: () => {}
  };
}

test('completed onboarding keeps the small replay launcher instead of forcing another tour', t => {
  const w = fixture(t);
  const tour = w.installV8(adapter());

  tour.dashboard({ uid: 'teacher-a', firstVisit: false, completed: false });
  assert.match(w.document.getElementById('gradecrewTourBtn')?.textContent || '', /Crew kennenlernen/);
  assert.match(w.document.getElementById('gradecrewTourBtn')?.textContent || '', /Tutorial/);

  tour.dashboard({ uid: 'teacher-a', firstVisit: true, completed: true });
  assert.match(w.document.getElementById('gradecrewTourBtn')?.textContent || '', /Crew kennenlernen/);
  assert.equal(tour.active, false);
});

test('admin gets a manual Tutorial testen launcher without an automatic start', t => {
  const w = fixture(t);
  const tour = w.installV8(adapter());

  tour.dashboard({ uid: 'teacher-a', firstVisit: true, completed: false, offerHandled: false, isAdmin: true });

  assert.match(w.document.getElementById('gradecrewTourBtn')?.textContent || '', /Crew kennenlernen/);
  assert.doesNotMatch(w.document.getElementById('gradecrewTourBtn')?.textContent || '', /\?|testen/i);
  w.document.documentElement.lang = 'en-GB';
  w.dispatchEvent(new w.CustomEvent('gradecrew:ui-locale-changed'));
  assert.equal(w.document.getElementById('gradecrewTourBtn')?.title, 'Try onboarding as an admin');
  assert.equal(tour.active, false);
});
