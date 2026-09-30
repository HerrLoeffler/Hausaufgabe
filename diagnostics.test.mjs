import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiagnostics, redactTechnicalText } from './diagnostics.mjs';
import { filterLogs, groupErrors, supportExport } from './admin-log-tools.mjs';

test('breadcrumbs and release metadata are bounded, allowlisted, resettable and snapshots independent', () => {
 let time = 0; const d = createDiagnostics({ now: () => time++, capacity: 3 });
 d.setRelease({ commit: 'a'.repeat(40), version: 'gc27', secret: 'NO', components: { app: 'gc27', mobileTutorial: 'gc28-mobile', secureAssessment: 'v1', secret: 'NO' } });
 for (let i = 0; i < 8; i++) d.record('view', { view: `view${i}`, password: 'NO', answers: 'NO', name: 'NO' });
 const snap = d.snapshot(); assert.equal(snap.breadcrumbs.length, 3);
 assert.equal(JSON.stringify(snap).includes('NO'), false);
 assert.deepEqual(snap.release.components, { app: 'gc27', mobileTutorial: 'gc28-mobile', secureAssessment: 'v1' });
 snap.breadcrumbs[0].view = 'changed'; assert.notEqual(d.snapshot().breadcrumbs[0].view, 'changed');
 snap.release.components.mobileTutorial = 'changed'; assert.equal(d.snapshot().release.components.mobileTutorial, 'gc28-mobile');
 d.clear(); assert.equal(d.snapshot().breadcrumbs.length, 0);
});
test('technical URLs, credentials, email and image blobs are scrubbed', () => {
 const safe = redactTechnicalText('https://site.test/app.js?token=secret#private name@example.com Bearer abc password=123 data:image/png;base64,abc');
 assert.equal(safe.includes('secret'), false); assert.equal(safe.includes('example.com'), false); assert.equal(safe.includes('123'), false);
 assert.match(safe, /app.js/); assert.equal(safe.includes('base64'), false);
});
const rows = [
 { id: 'a', category: 'app_error', status: 'new', environment: 'staging', appVersion: 'gc27', action: 'submit', fingerprint: 'F1', createdAt: 2000, technicalDetails: { occurrences: 4, serverReference: 'ASM-42' } },
 { id: 'b', category: 'app_error', status: 'done', environment: 'production', appVersion: 'gc21', fingerprint: 'F1', createdAt: 3000 },
 { id: 'c', category: 'idea', status: 'new', createdAt: 1000 }
];
test('filters combine and search includes server reference; sorting does not mutate rows', () => {
 assert.deepEqual(filterLogs(rows, { category: 'app_error', status: 'new', environment: 'staging', version: '27', term: 'ASM-42', action: 'submit' }).map(r => r.id), ['a']);
 assert.deepEqual(filterLogs(rows, { sort: 'oldest' }).map(r => r.id), ['c','a','b']);
 assert.deepEqual(filterLogs(rows, { sort: 'frequent' }).map(r => r.id), ['a','b','c']);
 assert.deepEqual(rows.map(r => r.id), ['a','b','c']);
 assert.deepEqual(filterLogs(rows, { fingerprint: 'missing' }), []);
});
test('fingerprint grouping distinguishes reports, repeated occurrences and open reports', () => {
 const [g] = groupErrors(rows); assert.equal(g.reports, 2); assert.equal(g.occurrences, 5); assert.equal(g.open, 1);
});
test('date bounds include the whole local end day', () => {
 const dateRows = [{ id: 'inside', createdAt: new Date('2026-09-30T23:59:59').getTime() }, { id: 'outside', createdAt: new Date('2026-10-01T00:00:00').getTime() }];
 assert.deepEqual(filterLogs(dateRows, { from:'2026-09-30', to:'2026-09-30' }).map(r => r.id), ['inside']);
});
test('diagnosis export omits names, contact information, raw messages and question snapshots', () => {
 const out = supportExport([{ ...rows[0], email: 'PRIVATE', displayName: 'PRIVATE', message:'PRIVATE', questionSnapshot:{text:'PRIVATE'}, technicalDetails:{rawMessage:'PRIVATE', aiDiagnostic:'PRIVATE'} }]);
 assert.equal(JSON.stringify(out).includes('PRIVATE'), false); assert.equal(out.count, 1);
});
