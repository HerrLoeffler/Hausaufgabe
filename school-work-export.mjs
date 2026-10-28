const encoder = new TextEncoder();

function safePdfText(font, value) {
  let out = '';
  for (const char of String(value ?? '')) {
    if (char === '\n' || char === '\r' || char === '\t') { out += char === '\t' ? '  ' : char; continue; }
    try { font.encodeText(char); out += char; } catch { out += '?'; }
  }
  return out;
}

async function makePdf(record, PDFLib) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const document = await PDFDocument.create();
  document.setTitle(`GradeCrew Arbeit ${record.submission.id}`);
  document.setSubject('Technischer Testexport einer Schülerarbeit');
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const width = 595.28, height = 841.89, margin = 47;
  let page, y;
  const nextPage = () => { page = document.addPage([width, height]); y = height - margin; page.drawText('GradeCrew · Testexport · keine Archivfreigabe', { x: margin, y: 23, size: 8, font: regular, color: rgb(.35,.4,.48) }); };
  const line = (value, { strong = false, size = 10, gap = 3 } = {}) => {
    const font = strong ? bold : regular;
    const text = safePdfText(font, value).replace(/\r/g, '');
    const max = width - margin * 2;
    for (const paragraph of text.split('\n')) {
      let current = '';
      const words = paragraph.match(/\S+|\s+/g) || [''];
      for (const word of words) {
        if (font.widthOfTextAtSize(current + word, size) <= max) { current += word; continue; }
        if (current.trim()) { if (y < margin + 14) nextPage(); page.drawText(current.trimEnd(), { x: margin, y, size, font }); y -= size + gap; current = ''; }
        for (const char of word) {
          if (font.widthOfTextAtSize(current + char, size) > max && current) { if (y < margin + 14) nextPage(); page.drawText(current, { x: margin, y, size, font }); y -= size + gap; current = ''; }
          current += char;
        }
      }
      if (y < margin + 14) nextPage();
      if (current.trim()) page.drawText(current.trimEnd(), { x: margin, y, size, font });
      y -= size + gap;
    }
  };
  const section = title => { y -= 10; line(title, { strong: true, size: 13, gap: 5 }); y -= 3; };
  nextPage();
  line('Schülerarbeit · Einzelansicht', { strong: true, size: 18, gap: 8 }); y -= 7;
  line(`Test: ${record.quiz.title} · ${record.quiz.subject || 'Fach nicht erfasst'}`);
  line(`Kürzel/Name: ${record.submission.studentName}`);
  line(`Abgegeben (Server): ${record.submission.submittedAtMillis ? new Date(record.submission.submittedAtMillis).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : 'nicht erfasst'}`);
  line(`Beginn (Server): ${record.submission.startedAtServerMillis ? new Date(record.submission.startedAtServerMillis).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : 'nicht erfasst'}`);
  line(`Exportiert: ${new Date(record.exportedAtMillis).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`);
  line(`Version: Export ${record.schemaVersion} · Prüfung ${record.submission.secureAssessmentVersion ?? 'nicht erfasst'} · Aufgabenstand ${record.submission.questionSnapshotVersion ?? 'nicht erfasst'}`);
  line(`Punkte: ${record.submission.totalPoints ?? 'offen'} / ${record.submission.maxPoints ?? 'offen'} · Note: ${record.submission.grade ?? 'offen'} · Status: ${record.submission.status ?? 'unbekannt'}`);
  line(`Notenschlüssel: ${JSON.stringify(record.submission.gradeScaleSnapshot?.thresholds || 'nicht erfasst')}`);
  section('Aufgaben und Antworten');
  for (const [index, question] of record.questions.entries()) {
    const q = question.data || {};
    const grading = record.submission.grading?.[question.id] || {};
    line(`${index + 1}. ${q.text || q.title || 'Aufgabentext nicht erfasst'}`, { strong: true, size: 11 });
    line(`Typ: ${q.type || 'nicht erfasst'} · Aufgabenstand: ${question.source === 'submission-snapshot' ? 'bei Abgabe eingefroren' : 'aktueller Stand, historisch ungeprüft'}`);
    line(`Antwort: ${JSON.stringify(record.submission.answers?.[question.id] ?? null)}`);
    line(`Korrektur: ${grading.awardedPoints ?? 'offen'} / ${grading.maxPoints ?? q.points ?? 'offen'} Punkte${grading.needsReview ? ' · Prüfung ausstehend' : ''}`);
    line(`Bewertungsmaßstab: ${q.rubric || q.expectedAnswer ? JSON.stringify(q.rubric || q.expectedAnswer) : 'nicht erfasst'}`);
    if (q.visualTask) {
      try {
        const visual = typeof q.visualTask === 'string' ? JSON.parse(q.visualTask) : q.visualTask;
        line(`Visuelle Aufgabe: ${visual.title || visual.format || 'Interaktion'} · Format ${visual.format || 'unbekannt'} · Darstellung ${visual.spec?.scene || 'siehe work.json'}`);
        if (visual.solution?.text) line(`Lösung: ${visual.solution.text}`);
        line('Interaktive Zeichnung im PDF nur beschrieben; vollständige Struktur in work.json.');
      } catch { line('Interaktive Zeichnung im PDF nicht darstellbar; vollständige Rohdaten in work.json.'); }
    }
    if (JSON.stringify(q).includes('data:image/') || JSON.stringify(q).includes('data:audio/')) line('Medien: Rohdaten in work.json; unterstützte Anlagen im ZIP. Audiodateien sind im PDF nicht abspielbar.');
    y -= 7;
  }
  section('Bewertungsverlauf');
  if (!record.events.length) line('Keine nachträgliche Korrektur als Ereignis erfasst.');
  for (const event of record.events) {
    line(`${new Date(event.atMillis).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })} · ${event.actorUid} · Grund: ${event.reason}`, { strong: true });
    line(`Vorher: ${event.before.totalPoints ?? 'offen'} Punkte, Note ${event.before.grade ?? 'offen'}; danach: ${event.after.totalPoints ?? 'offen'} Punkte, Note ${event.after.grade ?? 'offen'}.`);
  }
  section('Nicht erfasste Angaben');
  if (!record.gaps.length) line('Keine bekannten Lücken.');
  for (const gap of record.gaps) line(`${gap.field}: ${gap.reason}`);
  line('Die vollständigen Daten und Anlagen stehen in work.json und assets/ im ZIP. Dieser Beleg bestätigt keine schulrechtliche Archivierung.');
  return new Uint8Array(await document.save());
}

function safeAssetName(kind, mime, questionIndex, assetIndex) {
  const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/ogg': 'ogg' }[mime];
  return extension ? `assets/${kind}-${String(questionIndex + 1).padStart(3, '0')}-${String(assetIndex).padStart(3, '0')}.${extension}` : null;
}
function mediaFiles(record) {
  const files = [];
  const missing = [];
  record.questions.forEach((question, questionIndex) => {
    let assetIndex = 0;
    const visit = (value, path) => {
      if (typeof value === 'string') {
        const match = /^data:(image\/(?:png|jpeg|webp)|audio\/(?:mpeg|wav|ogg));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
        if (match) {
          const name = safeAssetName(match[1].startsWith('audio/') ? 'audio' : 'image', match[1], questionIndex, ++assetIndex);
          const binary = atob(match[2]);
          const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
          files.push({ name, bytes, source: path, mime: match[1] });
        } else if (/^data:(?:image|audio)\//i.test(value)) missing.push({ field: path, reason: 'unsupported-inline-media-type' });
        else if (/^(https?:|gs:|storage:)/i.test(value) && /(?:image|audio|media|asset|src|path|url)/i.test(path)) missing.push({ field: path, reason: 'external-asset-not-embedded' });
      } else if (Array.isArray(value)) value.forEach((item, index) => visit(item, `${path}[${index}]`));
      else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => visit(item, `${path}.${key}`));
    };
    visit(question.data, `questions[${questionIndex}].data`);
  });
  return { files, missing };
}

async function hash(bytes, cryptoApi) {
  const digest = await cryptoApi.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function buildSchoolPackage(record, { PDFLib, JSZip, cryptoApi = globalThis.crypto }) {
  if (record?.schema !== 'gradecrew.school-work-export' || record.schemaVersion !== 1 || !PDFLib || !JSZip || !cryptoApi?.subtle) throw Error('Ungültiger Schulexport.');
  const media = mediaFiles(record);
  if (media.files.reduce((sum, item) => sum + item.bytes.length, 0) > 8_000_000) throw Error('Die Medien sind für diesen Testexport zu groß.');
  const visualGaps = record.questions.flatMap((question, index) => question.data?.visualTask ? [{ field: `questions[${index}].visualTask`, reason: 'interactive-diagram-described-only-in-pdf' }] : []);
  const enriched = { ...record, gaps: [...record.gaps, ...media.missing, ...visualGaps] };
  const pdf = await makePdf(enriched, PDFLib);
  const work = encoder.encode(JSON.stringify(enriched, null, 2) + '\n');
  const zip = new JSZip();
  const files = [{ name: 'work.json', bytes: work }, { name: 'work.pdf', bytes: pdf }, ...media.files];
  const manifest = { schema: 'gradecrew.school-work-package', schemaVersion: 1, exportedAtMillis: record.exportedAtMillis, files: [] };
  for (const file of files) {
    zip.file(file.name, file.bytes, { binary: true, createFolders: false });
    manifest.files.push({ path: file.name, sha256: await hash(file.bytes, cryptoApi), bytes: file.bytes.length, ...(file.source ? { source: file.source, mime: file.mime } : {}) });
  }
  const manifestBytes = encoder.encode(JSON.stringify(manifest, null, 2) + '\n');
  zip.file('manifest.json', manifestBytes, { binary: true, createFolders: false });
  const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const receipt = await verifySchoolPackage(bytes, { JSZip, cryptoApi });
  return { bytes, pdf, manifest, receipt };
}

export async function verifySchoolPackage(bytes, { JSZip, cryptoApi = globalThis.crypto }) {
  const reopened = await JSZip.loadAsync(bytes);
  const manifestFile = reopened.file('manifest.json');
  if (!manifestFile) throw Error('Paketprüfung fehlgeschlagen: manifest.json');
  const rawManifest = await manifestFile.async('uint8array');
  const checkedManifest = JSON.parse(new TextDecoder().decode(rawManifest));
  if (checkedManifest.schema !== 'gradecrew.school-work-package' || checkedManifest.schemaVersion !== 1 || !Array.isArray(checkedManifest.files)) throw Error('Paketprüfung fehlgeschlagen: Manifestformat');
  for (const entry of checkedManifest.files) {
    if (!/^(work\.(?:json|pdf)|assets\/[A-Za-z0-9_-]+\.(?:png|jpg|webp|mp3|wav|ogg))$/.test(entry.path)) throw Error('Paketprüfung fehlgeschlagen: Dateipfad');
    const value = await reopened.file(entry.path)?.async('uint8array');
    if (!value || value.length !== entry.bytes || await hash(value, cryptoApi) !== entry.sha256) throw Error(`Paketprüfung fehlgeschlagen: ${entry.path}`);
  }
  return { schema: 'gradecrew.school-work-verification', schemaVersion: 1, verifiedAtMillis: Date.now(), manifestSha256: await hash(rawManifest, cryptoApi), checkedFiles: checkedManifest.files.length, valid: true };
}

async function loadVendor(src, globalName) {
  if (globalThis[globalName]) return globalThis[globalName];
  await new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = src; script.defer = true;
    script.onload = resolve; script.onerror = () => reject(Error(`Bibliothek konnte nicht geladen werden: ${globalName}`));
    document.head.append(script);
  });
  return globalThis[globalName];
}

export async function downloadSchoolPackage(record) {
  const PDFLib = await loadVendor('./assets/vendor/pdf-lib-1.17.1.min.js', 'PDFLib');
  const JSZip = await loadVendor('./assets/vendor/jszip-3.10.1.min.js', 'JSZip');
  const packageResult = await buildSchoolPackage(record, { PDFLib, JSZip });
  const save = (bytes, name, type) => {
    const url = URL.createObjectURL(new Blob([bytes], { type }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  const stem = `gradecrew-arbeit-${String(record.quiz.id).replace(/[^A-Za-z0-9_-]/g, '')}-${String(record.submission.id).replace(/[^A-Za-z0-9_-]/g, '')}`;
  save(packageResult.bytes, `${stem}.zip`, 'application/zip');
  save(encoder.encode(JSON.stringify(packageResult.receipt, null, 2) + '\n'), `${stem}-pruefbeleg.json`, 'application/json');
  return packageResult.receipt;
}
