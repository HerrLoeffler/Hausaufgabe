import { verifySchoolPackage } from './school-work-export.mjs';
import { verifySchoolClassPackage } from './school-class-export.mjs';

const $ = id => document.getElementById(id);
const status = $('status');
const result = $('result');
const facts = $('facts');
const workList = $('workList');
const decoder = new TextDecoder();

function addFact(label, value) {
  const dt = document.createElement('dt'); dt.textContent = label;
  const dd = document.createElement('dd'); dd.textContent = String(value ?? '—');
  facts.append(dt, dd);
}

function addWorkTable(works) {
  const wrap = document.createElement('div'); wrap.className = 'tableScroll';
  const table = document.createElement('table');
  const head = document.createElement('thead');
  const row = document.createElement('tr');
  for (const title of ['Abgabe-ID', 'Name/Kürzel', 'Punkte', 'Note', 'Offene Angaben']) {
    const th = document.createElement('th'); th.scope = 'col'; th.textContent = title; row.append(th);
  }
  head.append(row); table.append(head);
  const body = document.createElement('tbody');
  for (const work of works) {
    const tr = document.createElement('tr');
    for (const value of [work.submissionId, work.studentName, `${work.totalPoints ?? 'offen'} / ${work.maxPoints ?? 'offen'}`, work.grade ?? 'offen', work.gapCount]) {
      const td = document.createElement('td'); td.textContent = String(value); tr.append(td);
    }
    body.append(tr);
  }
  table.append(body); wrap.append(table); workList.append(wrap);
}

$('checkForm').addEventListener('submit', async event => {
  event.preventDefault();
  result.hidden = true; facts.replaceChildren(); workList.replaceChildren();
  status.className = ''; status.textContent = 'Paket wird lokal geprüft …';
  const button = event.currentTarget.querySelector('button'); button.disabled = true;
  try {
    const file = $('packageFile').files[0];
    if (!file || file.size > 64_000_000) throw Error('Bitte ein ZIP bis 64 MB auswählen.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const JSZip = globalThis.JSZip;
    if (!JSZip) throw Error('Die lokale Prüfbibliothek fehlt.');
    const opened = await JSZip.loadAsync(bytes);
    const isClass = Boolean(opened.file('class-results.json'));
    const receipt = isClass
      ? await verifySchoolClassPackage(bytes, { JSZip })
      : await verifySchoolPackage(bytes, { JSZip });
    const receiptFile = $('receiptFile').files[0];
    let sourceMatched = false;
    if (receiptFile) {
      if (receiptFile.size > 20_000) throw Error('Der Prüfbeleg ist zu groß.');
      const source = JSON.parse(await receiptFile.text());
      if (source.schema !== receipt.schema || source.schemaVersion !== receipt.schemaVersion || source.packageSha256 !== receipt.packageSha256 || source.manifestSha256 !== receipt.manifestSha256) throw Error('Der getrennte Prüfbeleg passt nicht zu diesem Paket.');
      sourceMatched = true;
    }
    addFact('Pakettyp', isClass ? 'Klassenmappe' : 'Einzelarbeit');
    addFact('Paket-SHA-256', receipt.packageSha256);
    addFact('Geprüfte Einzelarbeiten', receipt.checkedWorks ?? 1);
    addFact('Getrennter Beleg', sourceMatched ? 'Hash stimmt überein' : 'nicht abgeglichen');
    if (isClass) {
      const summary = JSON.parse(decoder.decode(await opened.file('class-results.json').async('uint8array')));
      addWorkTable(summary.works);
    } else {
      const work = JSON.parse(decoder.decode(await opened.file('work.json').async('uint8array')));
      addFact('Abgabe-ID', work.submission.id);
      addFact('Offene Angaben', work.gaps.length);
    }
    status.textContent = sourceMatched ? 'Paket und getrennter Prüfbeleg stimmen überein.' : 'Paket intern vollständig geprüft. Für die Herkunft den getrennten Prüfbeleg abgleichen.';
    status.className = 'success'; result.hidden = false;
  } catch (error) {
    status.textContent = error?.message || 'Die Paketprüfung ist fehlgeschlagen.';
    status.className = 'error';
  } finally { button.disabled = false; }
});
