import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('student-attempt-guard.js', 'utf8');

function setup(t, url = 'https://example.test/?test=ABC123') {
  const dom = new JSDOM(`<!doctype html><html><head></head><body><section id="studentView"><div id="studentQuizCard"><form id="studentForm"><input id="studentName" value="M"><button id="studentSubmitBtn" type="submit">Abgeben</button></form><div id="studentResult" class="hidden"></div></div></section></body></html>`, { url, runScripts:'outside-only', pretendToBeVisual:true });
  const w = dom.window;
  t.after(() => w.close());
  if (!w.crypto.randomUUID) w.crypto.randomUUID = () => 'uuid-test';
  w.eval(source.replace(/^export /gm, ''));
  return w;
}

async function settle(w) {
  await new Promise(resolve => w.setTimeout(resolve, 0));
  await Promise.resolve();
}

test('successful result is sealed and solution details are removed', async t => {
  const w = setup(t);
  const result = w.document.getElementById('studentResult');
  result.classList.remove('hidden');
  result.innerHTML = '<h2>Abgabe gespeichert ✓</h2><div id="studentResultDetails"><div>Lösung: geheim</div></div>';
  await settle(w);
  assert.equal(w.document.getElementById('studentForm').dataset.submitted, 'true');
  assert.equal(w.document.getElementById('studentResultDetails').textContent, '');
  assert.match(w.document.querySelector('.gcStudentResultNotice').textContent, /Lösungen werden während einer laufenden Durchführung nicht angezeigt/);
  assert.ok(w.localStorage.getItem('gradecrew_submission_lock_v1:ABC123'));
});

test('back or restored form cannot submit the same attempt again', async t => {
  const w = setup(t);
  w.localStorage.setItem('gradecrew_submission_lock_v1:ABC123', JSON.stringify({version:1, quizId:'ABC123', attemptId:'untimed-uuid-test', sessionRunId:'', savedAt:Date.now()}));
  w.dispatchEvent(new w.PageTransitionEvent('pageshow'));
  await settle(w);
  const form = w.document.getElementById('studentForm');
  assert.equal(form.dataset.submitted, 'true');
  assert.equal(form.classList.contains('hidden'), true);
  assert.equal(w.document.getElementById('studentSubmitBtn').disabled, true);
  assert.match(w.document.querySelector('.gcStudentLockedCard').textContent, /erneute Abgabe ist in diesem Durchgang nicht möglich/);
});

test('a genuinely new timed attempt is not blocked by an older lock', async t => {
  const w = setup(t);
  w.localStorage.setItem('gradecrew_submission_lock_v1:ABC123', JSON.stringify({version:1, quizId:'ABC123', attemptId:'attempt-old', sessionRunId:'run-old', savedAt:Date.now()}));
  w.localStorage.setItem('lernplattform_timer_ABC123', JSON.stringify({attemptId:'attempt-new', sessionRunId:'run-new', startedAt:Date.now()}));
  w.dispatchEvent(new w.PageTransitionEvent('pageshow'));
  await settle(w);
  assert.notEqual(w.document.getElementById('studentForm').dataset.submitted, 'true');
  assert.equal(w.document.querySelector('.gcStudentLockedCard'), null);
});

test('teacher preview is not modified', async t => {
  const w = setup(t, 'https://example.test/?test=ABC123&preview=1');
  const result = w.document.getElementById('studentResult');
  result.classList.remove('hidden');
  result.innerHTML = '<h2>Abgabe gespeichert ✓</h2><div id="studentResultDetails"><div>Lösung: sichtbar</div></div>';
  await settle(w);
  assert.match(w.document.getElementById('studentResultDetails').textContent, /sichtbar/);
  assert.equal(w.localStorage.getItem('gradecrew_submission_lock_v1:ABC123'), null);
});
