import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { buildSchoolClassPackage, verifySchoolClassPackage } from '../school-class-export.mjs';

const require = createRequire(import.meta.url);
const PDFLib = require('../assets/vendor/pdf-lib-1.17.1.min.js');
const JSZip = require('../assets/vendor/jszip-3.10.1.min.js');

function work(id, name) {
  return { schema: 'gradecrew.school-work-export', schemaVersion: 1, exportedAtMillis: 1_800_000_200_000,
    quiz: { id: 'math1', title: 'Fiktive Mathearbeit', subject: 'Mathematik' },
    submission: { id, studentName: name, classroom: { schoolId: 'sample-school', studentId: id, assignmentId: 'a1' },
      submittedAtMillis: 1_800_000_100_000, answers: { q1: '4' }, grading: { q1: { awardedPoints: 2, maxPoints: 2 } },
      totalPoints: 2, maxPoints: 2, percent: 100, grade: 1, status: 'graded' },
    questions: [{ id: 'q1', source: 'submission-snapshot', data: { text: '2 + 2?', type: 'text', points: 2 } }],
    events: [], gaps: [] };
}

test('class package includes two separate works and a matching result overview', async () => {
  const result = await buildSchoolClassPackage([work('pupil1', 'Testkind A'), work('pupil2', '=1+1')], { PDFLib, JSZip, cryptoApi: webcrypto, now: () => 1_800_000_300_000 });
  assert.equal(result.receipt.checkedWorks, 2);
  assert.match(result.receipt.packageSha256, /^[a-f0-9]{64}$/);
  const zip = await JSZip.loadAsync(result.bytes);
  assert.ok(zip.file('works/pupil1.zip'));
  assert.ok(zip.file('works/pupil2.zip'));
  const summary = JSON.parse(await zip.file('class-results.json').async('string'));
  assert.equal(summary.count, 2);
  assert.equal(summary.works[1].studentName, '=1+1');
  const csv = await zip.file('class-results.csv').async('string');
  assert.match(csv, /"'=1\+1"/);
  assert.equal((await verifySchoolClassPackage(result.bytes, { JSZip, cryptoApi: webcrypto })).valid, true);
});

test('class package rejects missing, duplicate and cross-school works', async () => {
  const opts = { PDFLib, JSZip, cryptoApi: webcrypto };
  await assert.rejects(buildSchoolClassPackage([], opts), /1 bis 40/);
  await assert.rejects(buildSchoolClassPackage([work('pupil1', 'A'), work('pupil1', 'B')], opts), /doppelte Arbeiten/);
  const other = work('pupil2', 'B'); other.submission.classroom.schoolId = 'other-school';
  await assert.rejects(buildSchoolClassPackage([work('pupil1', 'A'), other], opts), /verschiedene Tests, Schulen/);
});

test('class verification rejects an unlisted extra file', async () => {
  const result = await buildSchoolClassPackage([work('pupil1', 'Testkind A')], { PDFLib, JSZip, cryptoApi: webcrypto });
  const zip = await JSZip.loadAsync(result.bytes);
  zip.file('notes.txt', 'unlisted');
  const changed = await zip.generateAsync({ type: 'uint8array' });
  await assert.rejects(verifySchoolClassPackage(changed, { JSZip, cryptoApi: webcrypto }), /fehlende oder zusätzliche Datei/);
});

test('class verification rejects a changed CSV even when its manifest hash is updated', async () => {
  const result = await buildSchoolClassPackage([work('pupil1', 'Testkind A')], { PDFLib, JSZip, cryptoApi: webcrypto });
  const zip = await JSZip.loadAsync(result.bytes);
  const csv = (await zip.file('class-results.csv').async('string')).replace('Testkind A', 'Falscher Name');
  zip.file('class-results.csv', csv);
  const manifest = JSON.parse(await zip.file('manifest.json').async('string'));
  const entry = manifest.files.find(file => file.path === 'class-results.csv');
  entry.bytes = new TextEncoder().encode(csv).length;
  entry.sha256 = Array.from(new Uint8Array(await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(csv))), byte => byte.toString(16).padStart(2, '0')).join('');
  zip.file('manifest.json', JSON.stringify(manifest));
  const changed = await zip.generateAsync({ type: 'uint8array' });
  await assert.rejects(verifySchoolClassPackage(changed, { JSZip, cryptoApi: webcrypto }), /CSV weicht von Übersicht ab/);
});

test('class verification rejects a changed result even when its manifest hash is updated', async () => {
  const result = await buildSchoolClassPackage([work('pupil1', 'Testkind A')], { PDFLib, JSZip, cryptoApi: webcrypto });
  const zip = await JSZip.loadAsync(result.bytes);
  const summary = JSON.parse(await zip.file('class-results.json').async('string'));
  summary.works[0].grade = 6;
  const json = JSON.stringify(summary);
  zip.file('class-results.json', json);
  const manifest = JSON.parse(await zip.file('manifest.json').async('string'));
  const entry = manifest.files.find(file => file.path === 'class-results.json');
  entry.bytes = new TextEncoder().encode(json).length;
  entry.sha256 = Array.from(new Uint8Array(await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(json))), byte => byte.toString(16).padStart(2, '0')).join('');
  const csv = (await zip.file('class-results.csv').async('string')).replace('"1";"graded"', '"6";"graded"');
  assert.notEqual(csv, await zip.file('class-results.csv').async('string'));
  zip.file('class-results.csv', csv);
  const csvEntry = manifest.files.find(file => file.path === 'class-results.csv');
  csvEntry.bytes = new TextEncoder().encode(csv).length;
  csvEntry.sha256 = Array.from(new Uint8Array(await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(csv))), byte => byte.toString(16).padStart(2, '0')).join('');
  zip.file('manifest.json', JSON.stringify(manifest));
  const changed = await zip.generateAsync({ type: 'uint8array' });
  await assert.rejects(verifySchoolClassPackage(changed, { JSZip, cryptoApi: webcrypto }), /Einzelakte weicht von Übersicht ab/);
});
