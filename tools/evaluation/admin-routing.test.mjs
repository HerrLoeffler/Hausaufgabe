import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { installAiRoutingAdmin } from '../../ai-routing-admin.mjs';
const require = createRequire(import.meta.url);
const { JSDOM } = require('../ui/node_modules/jsdom');

test('admin widget filters, sorts and renders text safely; unknown costs stay unknown', async () => {
  const dom = new JSDOM('<main></main>'); const host = dom.window.document.querySelector('main');
  const row = { profileId: '<img src=x onerror=alert(1)>', job: 'game_hint', bucket: 'production', routeId: 'r1', models: ['p/m'], reasons: ['lowest_forecast_cost_among_qualified'],
    accepted: 1, requests: 2, calls: 2, actualMicros: 12, currency: 'USD', pricedRequests: 1, priceCoverage: 0.5, estimatedSavingsMicros: null, comparableRequests: 0, evidenceIds: ['e'], priceIds: ['p'] };
  const dispose = installAiRoutingAdmin({ host, loadSummary: async () => ({ groups: [row], truncated: true }) });
  host.querySelector('button').click(); await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(host.querySelectorAll('img').length, 0); assert.match(host.textContent, /50 % bepreist/); assert.match(host.textContent, /unbekannt/);
  assert.match(host.textContent, /Begrenzter Ausschnitt/);
  const input = host.querySelector('input'); input.value = 'no-match'; input.dispatchEvent(new dom.window.Event('input'));
  assert.match(host.textContent, /Keine passenden Messdaten/);
  dispose(); assert.equal(host.children.length, 0); dom.window.close();
});

test('failed admin loading shows no raw server error or fabricated zero balance', async () => {
  const dom = new JSDOM('<main></main>'); const host = dom.window.document.querySelector('main');
  installAiRoutingAdmin({ host, loadSummary: async () => { throw new Error('private data'); } });
  host.querySelector('button').click(); await new Promise(resolve => setTimeout(resolve, 0));
  assert.match(host.textContent, /Statistik nicht verfügbar/); assert.ok(!host.textContent.includes('private data')); dom.window.close();
});
