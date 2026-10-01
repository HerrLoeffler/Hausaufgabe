# Aufgabe: GC-I18N-02 – deutscher i18n-Refactor vor Sprache 2

- Aktualisiert (UTC): 2026-10-01T23:22:00Z
- Verantwortlicher Chat / Auftrag: Internationalisierung; den Web-Code vollständig hinter eine gemeinsame i18n-Grenze stellen, weiterhin ausschließlich Deutsch, anschließend Preview-/Staging- und Gerätetest durch Nutzer, erst danach zweite Sprache.
- Aufgabenbranch: `feature/i18n-german-refactor-v1`
- Basiscommit: `7063aee3815fc4f5a58e443318cf2c80839719a7` (`feature/gradecrew-app-integration`)
- Draft-PR: #20 gegen `feature/gradecrew-app-integration`
- Vorheriger Draft-PR #17: nicht verwenden; basierte auf dem 82 Commits älteren Integrationsstand `74eb2ec…` und ist durch #20 ersetzt.
- Überschneidungen: Web-App/Design, Secure Assessment, KI/Prompts, Crew/Sprache, Exporte, native Apps.

## Rückfallebene vor dem Umbau

Zwei unveränderte Git-Referenzen wurden vor dem Refactor angelegt:

- `backup/staging-functional-pre-i18n-2026-10-02` -> `4707c45ef573bf85f81655791edf909862e4f2a6` (in den Projektunterlagen als funktionsfähiger normaler Staging-Stand dokumentiert).
- `backup/app-integration-pre-i18n-2026-10-02` -> `74eb2ec08e81315875abfc4b1ae052d9f78797eb` (Integrationsstand beim Beginn der i18n-Arbeit).

Diese Branches sichern Git-/Hosting-Codezustände. Sie sind **kein** Datenbank-, Storage- oder vollständiges Backend-Disaster-Recovery-Backup.

## Parallelitätsabgleich

Während des ersten i18n-Entwurfs lief `feature/gradecrew-app-integration` weiter und erreichte `7063aee…` mit u. a. Crew Assistant, Emmi, Tutorial- und AI-Kosten-/Cache-Arbeit. Deshalb wurde der alte i18n-Branch nicht erzwungen oder deployed. Der aktuelle Branch wurde frisch direkt auf `7063aee…` aufgebaut. Vergleich zum Integrationsbranch beim Aufbau: **1 Commit voraus, 0 Commits zurück**; nur die 14 gezielten i18n-Dateiänderungen liegen darüber.

## Ziel und gewünschtes Verhalten

Die gesamte Web-Präsentationsschicht soll bereits jetzt internationalisierungsfähig sein, ohne eine zweite Sprache zu aktivieren und ohne deutsche Texte sichtbar zu verändern. Statt hunderte Stellen in `app.js` blind zu ersetzen, sitzt eine gemeinsame Browser-i18n-Grenze vor Lehrer-App und Secure-Student-Runtime. Sie kann statische und später dynamisch erzeugte Texte/Attribute lokalisieren, während `de-DE` als Quellsprache ein absichtlicher No-op bleibt.

## Implementiert

### Locale-/Prüfungsverträge

- `de-DE` bleibt einzige aktivierbare UI-Locale.
- BCP-47-Locale-Normalisierung.
- Deterministische UI-Priorität: Nutzer -> Schule -> Gerät -> Default.
- UI-, Inhalts- und Bewertungssprache getrennt.
- Bildungskontext und Zeitzone separat.
- Reproduzierbarer Locale-/Policy-Snapshot für veröffentlichte Prüfungen.
- `Intl`-Formatierung und striktes Zahlenparsing.

### Browserweite UI-Grenze

- `shared/i18n/browser-runtime.mjs`: gemeinsamer Browser-Runtime.
- `shared/i18n/messages-de-DE.mjs`: erster semantischer deutscher Katalog.
- `shared/i18n/bootstrap.mjs`: zentrale Installation.
- Quelltext-Lokalisierung für bestehende deutsche UI-Texte, sodass ein späterer zweiter Katalog ohne erneuten Big-Bang-Refactor greifen kann.
- Dynamische DOM-Texte und `aria-label`, `alt`, `placeholder`, `title` sind lokalisierbar; MutationObserver wird **nur bei einer Nicht-Quellsprache** aktiv. Bei aktuellem `de-DE` entsteht kein zusätzlicher DOM-Umbau.
- Native Browser-Dialoge (`alert`, `confirm`, `prompt`) laufen über dieselbe Übersetzungsgrenze.
- `data-i18n-key` für neue semantische Texte möglich.
- Aktivierung nicht freigegebener UI-Locales wirft einen Fehler; `en-*` kann aktuell nicht versehentlich aktiviert werden.

### Einstiegspunkte / Build / Tests

- `startup.js` installiert i18n vor `app.js`; Start-/Fehlermeldungen verwenden semantische deutsche Keys mit identischem Fallbacktext.
- `secure-student.html` lädt denselben i18n-Bootstrap vor der Secure-Student-Runtime.
- `tools/build-staging.mjs` enthält die aktuellen Crew-/Emmi-/Tutorial-Dateien **plus** alle vier i18n-Runtime-Dateien in der expliziten Staging-Allowlist.
- `i18n-integration.test.mjs` schützt Reihenfolge, Build-Inhalt und das Verbot einer zweiten Sprache in dieser Stufe.
- `.github/workflows/ai-staging-check.yml` führt auf `feature/i18n-*` die bestehenden Staging-Tests plus i18n-Core-, Browser- und Integrationsprüfungen aus.

## Bewusst fachlich nicht blind übersetzt

Siehe `shared/i18n/NON_DOM_INVENTORY.md`.

- CSV-/Datei-Exporte liegen außerhalb des DOM und erhalten vor Sprache 2 einen eigenen Export-Katalog.
- KI-Systemprompts bleiben in Stufe 1 deutsch, damit KI-Verhalten durch diesen UI-Refactor nicht verändert wird.
- `functions/lib/validation.js` enthält bewusst deutsche fach-/sprachspezifische Heuristiken. Sprache 2 braucht eigene Validatorregeln oder Lehrerprüfung; diese Regeln werden nicht generisch übersetzt.
- Persistierte Prüfungsinhalte sind Inhalt, keine UI, und werden durch einen UI-Sprachwechsel nie automatisch übersetzt.
- Native Swift-Oberflächen werden getrennt über Apples Lokalisierungsmechanismen vorbereitet.

## Bisherige Prüfungen

- Ursprünglicher isolierter i18n-Core: lokal 6/6 Node-Tests grün.
- Browser-Runtime-Verhalten: lokal rekonstruierter identischer Test 5/5 grün.
- Neuer sauberer Branch: Git-Vergleich gegen `feature/gradecrew-app-integration` beim Aufbau = 1 ahead / 0 behind.
- CI für den neuen Branch muss nach diesem Commit frisch geprüft werden; ältere CI-Läufe des ersetzten Branches gelten nicht als Nachweis.
- Kein Deployment-/Gerätenachweis aus Code-/CI-Tests ableiten.

## Was als „kompletter Refactor“ in Stufe 1 gilt

Für die Web-App bedeutet „komplett“ in dieser Stufe: alle sichtbaren Browser-Oberflächen laufen hinter **einer** gemeinsamen i18n-Ausgabeschicht, aber alle Quell- und Ausgabetexte bleiben Deutsch. Es bedeutet ausdrücklich **nicht**, dass fachsprachliche Prüfungsinhalte, KI-Regeln oder Exporte automatisch übersetzt werden. Diese Trennung ist Absicht und verhindert Bewertungsfehler.

## Nächster konkreter Schritt

1. CI für den aktuellen Branch-Head vollständig grün bekommen.
2. Sicheren Preview-/Staging-Deploy dieses weiterhin rein deutschen Refactors erstellen, ohne Production anzufassen.
3. Nutzer testet vollständig: Login/Dashboard, Test erstellen/importieren, KI/Editor, Tutorial/Crew, Veröffentlichung, Secure-Student, Abgabe, Auswertung und Exporte.
4. Erst nach bestätigter Funktionsparität Sprache 2 als separaten Schritt aktivieren und vorher die Non-DOM-Gates abarbeiten.

## Status

- Lokal geändert: nein; Änderungen direkt auf eigenem GitHub-Branch gesichert.
- Auf GitHub gesichert: ja, `feature/i18n-german-refactor-v1`; Draft-PR #20 offen.
- Rückfallbranches: ja, zwei unveränderte Pre-i18n-Referenzen angelegt.
- Auf aktuelle Integrationsbasis übertragen: ja, Basis `7063aee…`.
- CI: für aktuellen Head noch zu bestätigen.
- In `feature/gradecrew-app-integration` integriert: nein.
- Staging/Preview deployed: nein.
- Gerätetest: nein.
- Production: unverändert.
