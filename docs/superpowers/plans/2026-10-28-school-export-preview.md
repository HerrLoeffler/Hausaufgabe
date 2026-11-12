# GC-SCHOOL-EXPORT-20261028: isolated school export prototype

Goal: make one synthetic pupil's marked work reviewable and downloadable from the existing teacher results view, with a machine-readable record and an audit trail for later manual changes.

Scope: staging-only, teacher-owned quiz and class; no production, real pupil data, external AI, or DMS connection. The export is a technical demonstration, not a school-approved archive.

Design:
- A narrow Assessment callable verifies authenticated active teacher, quiz ownership, and classroom binding server-side. It reads one consistent export snapshot in a Firestore transaction and returns a versioned JSON record with explicit gaps for absent historical fields and private media bytes.
- Manual review goes through a separate callable transaction. It validates points against frozen question maxima, records who/when/reason and before/after in a server-only event collection, and treats repeated operation IDs idempotently. Existing public submission fields remain the current result projection.
- The browser places “Arbeit exportieren” by each result and calls only the staging endpoint. It creates a readable PDF and a self-contained ZIP with JSON, manifest, and media. Local re-read and SHA-256 verification provide a technical receipt. No public download URL or storage bucket is used.
- The client offers a local synthetic preview through the existing GradeCrew results UI. Never expose this control on production.

Steps:
1. [x] Add failing focused tests for authorization, classroom scoping, idempotent correction/undo, export history and integrity/missing-data statements.
2. [x] Implement staging-only service and callable, use Firestore's default denial for private event subcollections, connect review save and export button without reshaping grading UI.
3. [x] Build/export deterministic PDF and ZIP, inspect rendered PDF and re-open package/hash locally.
4. [x] Run focused tests and integration checks; create an isolated local preview, Draft-PR #374, and handoff with exact evidence and remaining gates. Remote preview remains open. Wilma writer reconciliation blocks merge.

Coordination: Wilma owns parallel grading work. Keep changes in new modules and minimal result-view hooks; reconcile against Wilma's merged patch before PR. No full staging Hosting or Functions deployment that could remove `/wilma/`.

## Fortsetzung 12.11.2026: portabler Klassenexport

**Bestätigte Richtung:** Martin möchte für eine konkret benannte Pilotschule den GradeCrew-Export möglichst vollständig und prüfbar vorbereiten. Die Schule entscheidet über den Speicherort und die sichere Aufbewahrung; GradeCrew baut für diesen Pilot keine Cloud-Schnittstelle und keinen eigenen Schularchivdienst. Der jetzige Code bleibt auf synthetische Vorschau beschränkt. Die schulische Freigabe, Rechte und ein nötiger Verschlüsselungsprozess sind keine Produkteigenschaft von GradeCrew. Kontaktdetails stehen ausschließlich in der lokalen, nicht veröffentlichten Pilotnotiz.

**Dateigrenzen:** `school-work-export.mjs` erzeugt und prüft die Einzelakte; `school-class-export.mjs` bündelt höchstens 40 Arbeiten desselben Tests und derselben Schule samt CSV/JSON-Übersicht; `school-export-check.html/.mjs/.css` prüfen ein gewähltes Paket lokal auf dem Gerät; `app.js` zeigt den Klassenknopf nur in der bestehenden synthetischen Vorschau; `tools/build-staging.mjs` nimmt diese Dateien in den geprüften Build auf. Es gibt keinen neuen Server-Schreibpfad und keine Änderung der Aufbewahrung.

- [x] Einzelpaketprüfung auf Pflichtdateien, vollständige Dateimenge, Größen, SHA-256 und Bezug von `work.json` zum Manifest verschärfen. Technischer Beleg enthält den Hash des ganzen Pakets.
- [x] Klassenmappe mit Ergebnisübersicht, eigener ZIP-Akte pro Abgabe, neutralen Dateinamen und abgewehrten CSV-Formeln erstellen; gemischte Schulen/Tests und doppelte Abgaben ablehnen.
- [x] Empfangsseitige lokale Prüfseite ohne Datei-Upload oder Netzwerkverbindung bauen; getrennten Hashbeleg optional abgleichen. Quelle ohne getrennten Beleg und Schulimport stets als unbestätigt bezeichnen.
- [x] Fiktive Paketfälle einschließlich Manipulation und fehlenden Pflichtdateien prüfen; Staging-Build und responsive Prüfseite lokal sichten.
- [ ] Unabhängigen Security-/Privacy-Diff-Review auf dem exakten Branchstand durchführen; insbesondere ZIP-Grenzen, Schülerdaten im Klassenindex und Betreiber-/Schulkopien prüfen.
- [ ] Vor einem echten Schuleinsatz den alten Korrekturpfad mit Wilmas kanonischem Lehrkraftentscheid zusammenführen, direkte Alt-Schreibwege schließen, PDF-Darstellungsgrenzen/Medienlücken auflösen und Schul-/AVV-/Rollenfreigabe belegen. Erst danach eine getrennte Remote-Vorschau oder einen Release erwägen.

**Abnahme des aktuellen Schritts:** Ein einzelnes fehlendes oder manipuliertes Element verwirft die ganze Mappe; eine Klassenmappe enthält genau eine Einzelakte pro Tabellenzeile; der Schulbrowser kann die Paketprüfsumme mit einem getrennten Beleg vergleichen, ohne Schülerdaten hochzuladen. SHA-256 ist keine Signatur oder Schulimportbestätigung. Ein normaler ZIP-Download ist nicht automatisch für jede Schulablage geeignet.
