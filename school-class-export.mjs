import { buildSchoolPackage, verifySchoolPackage } from './school-work-export.mjs';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function sha256(bytes, cryptoApi) {
  const digest = await cryptoApi.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function csvCell(value) {
  let text = String(value ?? '');
  if (/^\s*[=+@-]/u.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""').replaceAll(/\r\n?|\n/g, ' ')}"`;
}

function classCsv(works) {
  const rows = [['Abgabe-ID', 'Name/Kürzel', 'Punkte', 'Maximalpunkte', 'Prozent', 'Note', 'Status', 'Offene Angaben', 'Paket-SHA-256'],
    ...works.map(work => [work.submissionId, work.studentName, work.totalPoints, work.maxPoints, work.percent, work.grade, work.status, work.gapCount, work.packageSha256])];
  return rows.map(row => row.map(csvCell).join(';')).join('\r\n') + '\r\n';
}

function validateRecords(records) {
  if (!Array.isArray(records) || records.length < 1 || records.length > 40) throw Error('Für die Klassenmappe sind 1 bis 40 Einzelarbeiten zulässig.');
  const quizId = records[0]?.quiz?.id;
  const schoolId = records[0]?.submission?.classroom?.schoolId ?? null;
  const ids = new Set();
  for (const record of records) {
    const id = record?.submission?.id;
    if (record?.schema !== 'gradecrew.school-work-export' || record.schemaVersion !== 1 || !/^[A-Za-z0-9_-]{1,128}$/.test(id || '') || !/^[A-Za-z0-9_-]{1,128}$/.test(quizId || '') || record.quiz?.id !== quizId || (record.submission?.classroom?.schoolId ?? null) !== schoolId || ids.has(id)) throw Error('Die Klassenmappe enthält verschiedene Tests, Schulen oder doppelte Arbeiten.');
    ids.add(id);
  }
  return { quizId, schoolId };
}

export async function buildSchoolClassPackage(records, { PDFLib, JSZip, cryptoApi = globalThis.crypto, now = Date.now }) {
  if (!PDFLib || !JSZip || !cryptoApi?.subtle) throw Error('Paketbibliotheken fehlen.');
  const { quizId, schoolId } = validateRecords(records);
  const zip = new JSZip();
  const files = [];
  const works = [];
  let packedBytes = 0;
  for (const record of records) {
    const individual = await buildSchoolPackage(record, { PDFLib, JSZip, cryptoApi });
    packedBytes += individual.bytes.length;
    if (packedBytes > 56_000_000) throw Error('Die Klassenmappe ist für diesen Piloten zu groß. Bitte kleinere Gruppen exportieren.');
    const innerZip = await JSZip.loadAsync(individual.bytes);
    const bundledRecord = JSON.parse(await innerZip.file('work.json').async('string'));
    const path = `works/${record.submission.id}.zip`;
    files.push({ path, bytes: individual.bytes });
    works.push({ submissionId: record.submission.id, studentName: record.submission.studentName || '',
      totalPoints: record.submission.totalPoints ?? null, maxPoints: record.submission.maxPoints ?? null,
      percent: record.submission.percent ?? null, grade: record.submission.grade ?? null,
      status: record.submission.status ?? null, gapCount: bundledRecord.gaps.length,
      packagePath: path, packageSha256: individual.receipt.packageSha256 });
  }
  const summary = { schema: 'gradecrew.school-class-export', schemaVersion: 1, quizId, schoolId,
    exportedAtMillis: now(), count: works.length, works };
  files.push({ path: 'class-results.json', bytes: encoder.encode(JSON.stringify(summary, null, 2) + '\n') });
  files.push({ path: 'class-results.csv', bytes: encoder.encode(classCsv(works)) });
  const manifest = { schema: 'gradecrew.school-class-package', schemaVersion: 1, exportedAtMillis: summary.exportedAtMillis,
    files: await Promise.all(files.map(async file => ({ path: file.path, bytes: file.bytes.length, sha256: await sha256(file.bytes, cryptoApi) }))) };
  for (const file of files) zip.file(file.path, file.bytes, { binary: true, createFolders: false });
  zip.file('manifest.json', JSON.stringify(manifest, null, 2) + '\n', { createFolders: false });
  const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  if (bytes.length > 64_000_000) throw Error('Die Klassenmappe ist für diesen Piloten zu groß.');
  const receipt = await verifySchoolClassPackage(bytes, { JSZip, cryptoApi });
  return { bytes, summary, manifest, receipt };
}

export async function verifySchoolClassPackage(bytes, { JSZip, cryptoApi = globalThis.crypto }) {
  if (!(bytes instanceof Uint8Array) || bytes.length > 64_000_000 || !JSZip || !cryptoApi?.subtle) throw Error('Klassenprüfung fehlgeschlagen: Paketgröße');
  const zip = await JSZip.loadAsync(bytes);
  if (Object.keys(zip.files).length > 43) throw Error('Klassenprüfung fehlgeschlagen: zu viele Dateien');
  const manifestBytes = await zip.file('manifest.json')?.async('uint8array');
  if (!manifestBytes || manifestBytes.length > 1_000_000) throw Error('Klassenprüfung fehlgeschlagen: Manifest');
  const manifest = JSON.parse(decoder.decode(manifestBytes));
  if (manifest.schema !== 'gradecrew.school-class-package' || manifest.schemaVersion !== 1 || !Array.isArray(manifest.files) || manifest.files.length < 3 || manifest.files.length > 42) throw Error('Klassenprüfung fehlgeschlagen: Manifestformat');
  const expected = new Set(['manifest.json']);
  let totalBytes = 0;
  for (const file of manifest.files) {
    if (!file || typeof file.path !== 'string' || !/^(class-results\.(?:json|csv)|works\/[A-Za-z0-9_-]{1,128}\.zip)$/.test(file.path) || expected.has(file.path)) throw Error('Klassenprüfung fehlgeschlagen: Dateipfad');
    if (!Number.isSafeInteger(file.bytes) || file.bytes < 1 || file.bytes > 32_000_000 || !/^[a-f0-9]{64}$/.test(file.sha256 || '')) throw Error('Klassenprüfung fehlgeschlagen: Dateiangabe');
    expected.add(file.path);
    totalBytes += file.bytes;
    if (totalBytes > 128_000_000) throw Error('Klassenprüfung fehlgeschlagen: Gesamtgröße');
    if (zip.file(file.path)?._data?.uncompressedSize !== file.bytes) throw Error(`Klassenprüfung fehlgeschlagen: Dateigröße ${file.path}`);
    const content = await zip.file(file.path)?.async('uint8array');
    if (!content || content.length !== file.bytes || await sha256(content, cryptoApi) !== file.sha256) throw Error(`Klassenprüfung fehlgeschlagen: ${file.path}`);
  }
  const actual = Object.values(zip.files).filter(file => !file.dir).map(file => file.name);
  if (!expected.has('class-results.json') || !expected.has('class-results.csv') || actual.length !== expected.size || actual.some(path => !expected.has(path))) throw Error('Klassenprüfung fehlgeschlagen: fehlende oder zusätzliche Datei');
  const summary = JSON.parse(await zip.file('class-results.json').async('string'));
  if (summary.schema !== 'gradecrew.school-class-export' || summary.schemaVersion !== 1 || summary.exportedAtMillis !== manifest.exportedAtMillis || !Array.isArray(summary.works) || summary.count !== summary.works.length || summary.count !== manifest.files.length - 2 || summary.count < 1 || summary.count > 40) throw Error('Klassenprüfung fehlgeschlagen: Übersicht');
  if (await zip.file('class-results.csv').async('string') !== classCsv(summary.works)) throw Error('Klassenprüfung fehlgeschlagen: CSV weicht von Übersicht ab');
  const ids = new Set();
  for (const work of summary.works) {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(work.submissionId || '') || ids.has(work.submissionId) || work.packagePath !== `works/${work.submissionId}.zip` || !expected.has(work.packagePath)) throw Error('Klassenprüfung fehlgeschlagen: Zuordnung');
    ids.add(work.submissionId);
    const content = await zip.file(work.packagePath).async('uint8array');
    const receipt = await verifySchoolPackage(content, { JSZip, cryptoApi });
    const individual = await JSZip.loadAsync(content);
    const record = JSON.parse(await individual.file('work.json').async('string'));
    if (receipt.packageSha256 !== work.packageSha256 || record.quiz.id !== summary.quizId || record.submission.id !== work.submissionId || (record.submission.classroom?.schoolId ?? null) !== summary.schoolId || (record.submission.studentName || '') !== work.studentName || (record.submission.totalPoints ?? null) !== work.totalPoints || (record.submission.maxPoints ?? null) !== work.maxPoints || (record.submission.percent ?? null) !== work.percent || (record.submission.grade ?? null) !== work.grade || (record.submission.status ?? null) !== work.status || record.gaps.length !== work.gapCount) throw Error('Klassenprüfung fehlgeschlagen: Einzelakte weicht von Übersicht ab');
  }
  return { schema: 'gradecrew.school-class-verification', schemaVersion: 1, verifiedAtMillis: Date.now(),
    packageSha256: await sha256(bytes, cryptoApi), manifestSha256: await sha256(manifestBytes, cryptoApi),
    checkedWorks: summary.count, checkedFiles: manifest.files.length, valid: true };
}

export async function downloadSchoolClassPackage(records) {
  const load = (src, globalName) => globalThis[globalName] ? Promise.resolve(globalThis[globalName]) : new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = src; script.defer = true;
    script.onload = () => resolve(globalThis[globalName]); script.onerror = () => reject(Error(`Bibliothek konnte nicht geladen werden: ${globalName}`));
    document.head.append(script);
  });
  const [PDFLib, JSZip] = await Promise.all([load('./assets/vendor/pdf-lib-1.17.1.min.js', 'PDFLib'), load('./assets/vendor/jszip-3.10.1.min.js', 'JSZip')]);
  const result = await buildSchoolClassPackage(records, { PDFLib, JSZip });
  const save = (bytes, name, type) => {
    const url = URL.createObjectURL(new Blob([bytes], { type }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  const stem = `gradecrew-klassenmappe-${result.summary.quizId}`;
  save(result.bytes, `${stem}.zip`, 'application/zip');
  save(encoder.encode(JSON.stringify(result.receipt, null, 2) + '\n'), `${stem}-pruefbeleg.json`, 'application/json');
  return result.receipt;
}
