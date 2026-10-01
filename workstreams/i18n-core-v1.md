# Aufgabe: GC-I18N-02 – deutscher i18n-Refactor vor Sprache 2

- Aktualisiert (UTC): 2026-10-01T23:18:00Z
- Verantwortlicher Chat / Auftrag: Internationalisierung; den Web-Code jetzt vollständig hinter eine gemeinsame i18n-Grenze stellen, weiterhin ausschließlich Deutsch, anschließend Staging-/Gerätetest durch Nutzer, erst danach zweite Sprache.
- Aufgabenbranch: `feature/i18n-core-v1`
- Basiscommit: `74eb2ec08e81315875abfc4b1ae052d9f78797eb` (`feature/gradecrew-app-integration`)
- Draft-PR: #17 gegen `feature/gradecrew-app-integration`
- Überschneidungen: Web-App/Design, Secure Assessment, KI/Prompts, Crew/Sprache, Exporte, native Apps.

## Rückfallebene vor dem Umbau

Zwei unveränderte Git-Referenzen wurden vor dem breiteren Refactor angelegt:

- `backup/staging-functional-pre-i18n-2026-10-02` -> `4707c45ef573bf85f81655791edf909862e4f2a6` (in den Projektunterlagen als funktionsfähiger normaler Staging-Stand dokumentiert).
- `backup/app-integration-pre-i18n-2026-10-02` -> `74eb2ec08e81315875abfc4b1ae052d9f78797eb` (aktuelle Web-Integrationsbasis beim Start dieses Refactors).

Diese Branches sichern Git-/Hosting-Codezustände. Sie sind **kein** Datenbank-, Storage- oder vollständiges Backend-Disaster-Recovery-Backup.

## Ziel und gewünschtes Verhalten

Die gesamte Web-Präsentationsschicht soll bereits jetzt internationalisierungsfähig sein, ohne eine zweite Sprache zu aktivieren und ohne deutsche Texte sichtbar zu verändern. Statt hunderte Stellen in `app.js` blind zu ersetzen, sitzt eine gemeinsame Browser-i18n-Grenze vor Lehrer-App und Secure-Student-Runtime. Sie kann statische und später dynamisch erzeugte Texte/Attribute lokalisieren, während `de-DE` als Quellsprache ein absichtlicher No-op bleibt.

## Implementiert

### Locale-/Prüfungsverträge

- `de-DE` bleibt einzige aktivierbare UI-Locale.
- BCP-47-Locale-Normalisierung.
- Deterministische UI-Priorität: Nutzer -> Schule -> Gerät -> Default.
- UI-, Inhalts- und Bewertungssprache getrennt.
- Bildungskontext und Zeitzone separat.
- reproduzierbarer Locale-/Policy-Snapshot für veröffentlichte Prüfungen.
- `Intl`-Formatierung und striktes Zahlenparsing.

### Browserweite UI-Grenze

- `shared/i18n/browser-runtime.mjs`: gemeinsamer Browser-Runtime.
- `shared/i18n/messages-de-DE.mjs`: erster semantischer deutscher Katalog.
- `shared/i18n/bootstrap.mjs`: zentrale Installation.
- Quelltext-Lokalisierung für bestehende deutsche UI-Texte, sodass ein späterer zweiter Katalog ohne erneuten Big-Bang-Refactor greifen kann.
- Unterstützung für dynamisch eingesetzte DOM-Texte und `aria-label`, `alt`, `placeholder`, `title` über MutationObserver **nur bei einer Nicht-Quellsprache**; bei aktuellem `de-DE` kein Übersetzungsobserver und damit kein zusätzlicher DOM-Umbau.
- native Browser-Dialoge (`alert`, `confirm`, `prompt`) laufen über dieselbe Übersetzungsgrenze.
- `data-i18n-key` für neue semantische Texte möglich.
- Aktivierung nicht freigegebener UI-Locales wirft einen Fehler; `en-*` kann aktuell nicht versehentlich aktiviert werden.

### Einstiegspunkte / Build

- `startup.js` importiert i18n vor `app.js`; erste Start-/Fehlermeldungen verwenden semantische deutsche Keys mit identischem Fallbacktext.
- `secure-student.html` lädt denselben i18n-Bootstrap vor der Secure-Student-Runtime.
- `tools/build-staging.mjs` nimmt alle vier i18n-Runtime-Dateien in die explizite Staging-Allowlist auf; bestehende Referenz-/Hashprüfungen gelten dadurch auch für diese Dateien.
- `i18n-integration.test.mjs` schützt Reihenfolge, Build-Inhalt und das Verbot einer zweiten Sprache in dieser Stufe.
- CI-Workflow wurde um `feature/i18n-*` erweitert und führt Core-, Browser- und Integrations-i18n-Tests sowie den normalen vollständigen Staging-Testlauf aus.

## Bewusst fachlich nicht blind übersetzt

Siehe `shared/i18n/NON_DOM_INVENTORY.md`.

- CSV-/Datei-Exporte liegen außerhalb des DOM und erhalten vor Sprache 2 einen eigenen Export-Katalog.
- KI-Systemprompts bleiben in Stufe 1 deutsch, damit KI-Verhalten nicht durch diesen UI-Refactor verändert wird.
- `functions/lib/validation.js` enthält bewusst deutsche fach-/sprachspezifische Heuristiken. Diese dürfen nicht generisch übersetzt werden; Sprache 2 braucht eigene Validatorregeln oder Lehrerprüfung.
- persistierte Prüfungsinhalte sind Inhalt, keine UI, und werden durch einen UI-Sprachwechsel nie automatisch übersetzt.
- native Swift-Oberflächen werden getrennt über Apples Lokalisierungsmechanismen vorbereitet.

## Prüfungen

- Ursprünglicher isolierter i18n-Core: lokal 6/6 Node-Tests grün.
- Browser-Runtime-Verhalten: lokal rekonstruierter identischer Test 5/5 grün.
- GitHub Actions `AI Staging Checks` wurde für i18n-Branches aktiviert.
- Lauf `36939615946` für Commit `cc8f0491e995fbfa73ea04de76803a7b78e4a142` wurde gestartet; zum Zeitpunkt dieser Aktualisierung noch `in_progress`. Spätere Commits benötigen erneut aktuellen CI-Nachweis.
- Kein Deployment-/Gerätenachweis aus diesen Tests ableiten.

## Was als „kompletter Refactor“ in Stufe 1 gilt

Für die Web-App bedeutet „komplett“ in dieser Stufe: alle sichtbaren Browser-Oberflächen laufen hinter **einer** gemeinsamen i18n-Ausgabeschicht, aber alle Quell- und Ausgabetexte bleiben Deutsch. Es bedeutet ausdrücklich **nicht**, dass fachsprachliche Prüfungsinhalte, KI-Regeln oder Exporte automatisch übersetzt werden. Diese Trennung ist Absicht und verhindert Bewertungsfehler.

## Nächster konkreter Schritt

1. CI für den aktuellen Branch-Head vollständig grün bekommen.
2. Einen sicheren Preview-/Staging-Deploy dieses deutschen Refactors erstellen, ohne Production anzufassen.
3. Nutzer testet Lehrerablauf + Secure-Student-Ablauf auf echten Geräten vollständig.
4. Erst nach bestätigter Funktionsparität zweite UI-Locale als separaten Schritt aktivieren; davor Non-DOM-Gates abarbeiten.

## Status

- Lokal geändert: nein; Änderungen direkt auf eigenem GitHub-Branch gesichert.
- Auf GitHub gesichert: ja, Branch `feature/i18n-core-v1`; Draft-PR #17 offen.
- Rückfallbranches: ja, zwei unveränderte Pre-i18n-Referenzen angelegt.
- CI: läuft; aktuelles Ergebnis noch nicht als grün bestätigt.
- In `feature/gradecrew-app-integration` integriert: nein.
- Staging/Preview deployed: nein.
- Gerätetest: nein.
- Production: unverändert.
