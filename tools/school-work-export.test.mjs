import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { buildSchoolPackage, verifySchoolPackage } from '../school-work-export.mjs';

const require = createRequire(import.meta.url);
const PDFLib = require('../assets/vendor/pdf-lib-1.17.1.min.js');
const JSZip = require('../assets/vendor/jszip-3.10.1.min.js');
const input = {
  schema: 'gradecrew.school-work-export', schemaVersion: 1, exportedAtMillis: 1_800_000_200_000,
  quiz: { id: 'QUIZ1', title: 'Probe mit Umlauten', subject: 'Mathematik' },
  submission: { id: 'sub1', studentName: 'Testkind Ä', submittedAtMillis: 1_800_000_000_000, totalPoints: 1.5, maxPoints: 2, grade: 3, status: 'graded', gradeScaleSnapshot: { thresholds: [92, 81, 67, 50, 30, 0] },
    answers: { q1: 'Vier – mit Begründung.' }, grading: { q1: { awardedPoints: 1.5, maxPoints: 2 } } },
  questions: [{ id: 'q1', source: 'submission-snapshot', data: { id: 'q1', position: 0, text: 'Was ist 2 + 2?', type: 'text', points: 2,
    imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=', audioUrl: 'https://example.invalid/private.mp3', visualTask: JSON.stringify({format:'hotspot',title:'Beispielbild',spec:{scene:'plant'},solution:{text:'Wurzel'}}) } }],
  events: [{ id: 'op_1234567890abcdef', atMillis: 1_800_000_100_000, actorUid: 'teacher', reason: 'Nachprüfung', before: { totalPoints: 2, grade: 1 }, after: { totalPoints: 1.5, grade: 3 } }],
  gaps: [{ field: 'aiSuggestions', reason: 'not-recorded' }]
};

test('package includes PDF, JSON, private media, manifest and a verified receipt', async () => {
  const result = await buildSchoolPackage(input, { PDFLib, JSZip, cryptoApi: webcrypto });
  assert.equal(result.receipt.valid, true);
  assert.equal(result.receipt.checkedFiles, 3);
  const pdf = await PDFLib.PDFDocument.load(result.pdf);
  assert.ok(pdf.getPageCount() >= 1);
  const zip = await JSZip.loadAsync(result.bytes);
  assert.ok(zip.file('work.pdf'));
  assert.ok(zip.file('assets/image-001-001.png'));
  const work = JSON.parse(await zip.file('work.json').async('string'));
  assert.equal(work.submission.answers.q1, 'Vier – mit Begründung.');
  assert.equal(work.gaps.some(gap => gap.reason === 'external-asset-not-embedded'), true);
  assert.equal(work.gaps.some(gap => gap.reason === 'interactive-diagram-described-only-in-pdf'), true);
  assert.equal((await verifySchoolPackage(result.bytes, { JSZip, cryptoApi: webcrypto })).valid, true);
});

test('changed file fails verification against the original manifest', async () => {
  const result = await buildSchoolPackage(input, { PDFLib, JSZip, cryptoApi: webcrypto });
  const zip = await JSZip.loadAsync(result.bytes);
  zip.file('work.json', 'changed');
  const changed = await zip.generateAsync({ type: 'uint8array' });
  await assert.rejects(verifySchoolPackage(changed, { JSZip, cryptoApi: webcrypto }), /Paketprüfung fehlgeschlagen: work.json/);
});

test('unsupported but valid audio data is disclosed instead of silently omitted', async () => {
  const variant = structuredClone(input);
  variant.questions[0].data.audioDataUrl = 'data:audio/aac;base64,AA==';
  const result = await buildSchoolPackage(variant, { PDFLib, JSZip, cryptoApi: webcrypto });
  const zip = await JSZip.loadAsync(result.bytes);
  const work = JSON.parse(await zip.file('work.json').async('string'));
  assert.ok(work.gaps.some(gap => gap.field.endsWith('audioDataUrl') && gap.reason === 'unsupported-inline-media-type'));
});
