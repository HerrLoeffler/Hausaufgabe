# Audio Masterpiece V2

Stand: 04.10.2026. Basis: `feature/gradecrew-app-integration@b5d456e377fc56701d2a89a83385a7d773773781`. Production unverändert.

## Auftrag

GradeCrew-Audio als vollwertiges Prüfungsmedium:
- KI-Höraufgaben wie Bilder mit exakter Anzahl 0–5.
- Optional Audio als Lösung/Erklärung, ebenfalls 0–5.
- Remy versteht beide Wünsche per Text/Sprache.
- Audio bleibt kontrollierbar, kostenbewusst und sicher.

## Vorarbeit / Abgrenzung

Audio V1 war bereits parallel implementiert und in den Integrationsbranch aufgenommen:
- PR #85 / Integrationscommit `bda3a2b192955aef63b98d2c293ce82c6429d6a2`.
- Integrations-CI `37199262122` grün.
- Hosting-Preview `37199340652` und AI-Functions `37199340642` erfolgreich.
- V1: 0–5 Höraufgaben, TTS, Editor-Player, Secure-Student-Player, Publish-Fail-Closed, Remy-Audioanzahl, Audio-Quota/Kosten.

Vor V2 wurde der bereits vorhandene Privacy-Fix `fix/audio-private-drafts-staging-v1` geprüft:
- Feature-CI `37199533810` grün.
- PR #87 in Integration gemergt als `b5d456e377fc56701d2a89a83385a7d773773781`.
- Audio-Hörtexte liegen danach hinter serverseitigen Owner/Admin-Callables; Browserzugriff auf `audioScripts` ist in beiden Rulesets gesperrt.

## V2-Architektur

### 1. Zwei getrennte Audiozwecke

**Höraufgabe**
- Audio ist Teil der Aufgabenstellung.
- Hörtext bleibt privat für Lehrkraft/Admin.
- Schüler bekommt nur die Audiodatei, nicht den Transcript.
- Kein Autoplay.

**Audio-Lösung**
- Privat gespeicherter Lösungstext + TTS-Asset.
- Nie im öffentlichen Question-Dokument.
- Wird erst an einen Schüler-Receipt angehängt, wenn die bestehende serverseitige Lösungsfreigabe bereits `solutionsReleased=true` gesetzt hat.
- Veraltete Audio-Lösung wird auch am Release-Boundary verworfen.
- Kein Autoplay.

### 2. Kostenprinzip

Für Lösungsaudio wird kein zusätzlicher Textmodell-Aufruf benötigt. `functions/lib/solution-audio.js` bildet aus dem bereits vorhandenen Lösungsschlüssel deterministisch einen kurzen gesprochenen Lösungssatz. Nur die TTS-Erzeugung verbraucht Audio-Kontingent.

### 3. Exakte Anzahl

KI-Formular:
- `Höraufgaben mit Audio (0–5)`
- `Lösungen als Audio (0–5)`

Die Lösungsaudio-Positionen werden deterministisch über den Test verteilt. Eine Aufgabe darf sowohl Höraufgabe als auch Audio-Lösung haben.

### 4. Editor

Je Aufgabe:
- bestehendes Panel `Audio / Höraufgabe`
- neues Panel `Lösung als Audio`
- privaten Lösungstext aus dem aktuellen Lösungsschlüssel übernehmen
- Lösungstext frei bearbeiten
- Audio erzeugen / neu erzeugen / entfernen
- Vorschau mit Controls
- bei Inhalts-/Antwortänderung werden Hör- und Lösungsaudio veraltet markiert
- Veraltet-Status des Lösungsaudios wird serverseitig in der privaten Audio-Collection gesichert
- Veröffentlichung blockiert veraltete Audio-Lösungen, wenn Lösungen aktiviert sind

### 5. Remy

Parser/Core/Server-Contract verstehen getrennt:
- `audioQuestionCount`
- `solutionAudioQuestionCount`

Beispiel:
`Englisch 6. Klasse Shopping, 12 Aufgaben, davon 3 Höraufgaben und 2 Lösungen als Audio.`

### 6. Secure Student / Release

`assessment-functions/lib/secure-lifecycle.js` hängt private Lösungsaudios nur in `getAssessmentReceipt` an bereits freigegebene Lösungen an. Vor der Lösungsfreigabe wird die private Audio-Collection nicht gelesen. `secure-solution-release.js` rendert bei freigegebenen Lösungen einen manuellen Audio-Player + KI-Stimmenhinweis.

## Implementierte Dateien / Commits auf V2

- `functions/lib/solution-audio.js` – deterministische Lösungstexte + Verteilung.
- `functions/main.js` – private Lösungsaudio-Drafts, Stale-State, TTS-Callable.
- `functions/index.js` – exakte V2-Audioanzahl in Background-Testjobs.
- `ai-client.js` – Lösungsaudio-Callable.
- `index.html` – zweiter Audiozähler.
- `app.js` – Formular, Editor, Private-Sync, Blocker, Progress/Diagnostik.
- `crew-assistant-core.mjs`, `remy-ai-help.js`, `functions/lib/crew-assistant.js` – Remy-Dual-Audio.
- `crew-telemetry-client.mjs`, `functions/lib/crew-telemetry.js` – datensparsames Feldsignal.
- `assessment-functions/lib/secure-lifecycle.js` – gated solution-audio release.
- `secure-solution-release.js`, `secure-student.css`, `styles.css` – Player/UI.
- Tests: `functions/test/solution-audio.test.js`, `audio-solution-v2.test.mjs`, erweiterte Crew-/Remy-/Solution-Release-Tests.

## Teststatus

### Belegt vor V2
- Audio V1 integrativer Gate: `37199262122` grün.
- V1 Hosting/AI-Functions auf Staging verifiziert.
- Privacy-Fix Feature-Gate: `37199533810` grün.

### Aktueller V2-Blocker
Seit dem Merge des Privacy-Fixes starten GitHub-hosted Actions-Jobs im Repository zeitweise überhaupt nicht mehr: z. B. Integrationsrun `37201923259` sowie V2-Run `37202796511` enden nach wenigen Sekunden mit leerer Step-Liste; auch ein unveränderter Admin-Workflow ist im selben Zeitraum betroffen. Damit hat für den aktuellen V2-Head noch **kein** Testschritt ausgeführt. Das ist kein grüner oder roter Code-Nachweis, sondern ein CI-Infrastrukturblocker.

Aktueller öffentlicher GitHub-Status meldet Actions allgemein als operational; Ursache im Repository-/Runner-Kontext noch offen.

## Noch offen vor Integration

1. GitHub Actions muss wieder echte Steps starten.
2. Vollständigen Audio-V2-Feature-Gate grün bekommen.
3. Aktuellen Integrationshead erneut auf Paralleländerungen prüfen.
4. PR gegen `feature/gradecrew-app-integration`, kein Blind-Merge.
5. Nach Integration kompletten gemeinsamen Staging-Gate grün.
6. Hosting + AI Functions deployen und verifizieren.
7. Für `assessment-functions` einen sicheren staging-only Deploypfad verwenden/ergänzen; der bestehende automatische Workflow deployt nur `functions:ai`.
8. E2E im Browser:
   - 3 Höraufgaben + 2 Audio-Lösungen erzeugen,
   - Editor anhören,
   - Antwort ändern -> Audio-Lösung muss stale werden,
   - Publish-Blocker,
   - Schüler-Test: keine Lösungsaudio vor Ende,
   - Test beenden + Lösungsfreigabe -> Lösungsaudio erscheint,
   - kein Autoplay.
9. Erst nach Nutzerabnahme weitere Stufe; Production nur nach ausdrücklicher Freigabe.

## Statusmodell

- Branch: `feature/audio-masterpiece-v2`
- GitHub gesichert: ja
- Feature-CI: **blockiert vor Runner-Start, nicht grün**
- integriert: nein
- Staging V2: nein
- Gerät/Nutzertest V2: nein
- Production: unverändert

## Integration status — 2026-10-04

- Audio V2 was reconciled onto the then-current `feature/gradecrew-app-integration` instead of merging the stale original branch.
- Reconciled PR: #109, merged as `63cbac307919c6488e33afa74f4e98b3fff8e92b`.
- Superseded stale PR: #106, closed without merge.
- Current implementation preserves the newer DE/EN assistant/i18n separation while adding listening-audio and solution-audio counts independently.
- Private listening and solution drafts share the protected server-side audio-draft store; solution audio remains withheld until the secure solution-release policy allows it.
- Feature gate on the fully reconciled head `e8c85d9253fa43b93d009d3e1426eac53087ca08`: **green** (AI Staging Checks run 37229218876).
- Post-merge integration gate on `63cbac307919c6488e33afa74f4e98b3fff8e92b`: **green** (AI Staging Checks run 37229329575). Admin test-account workflow on the same merge commit: **green** (run 37229329574).
- Staging deployment is **not yet confirmed**. Audio V2 changes both Firebase function codebases (`ai` and `assessment`) plus the Hosting preview, so a Hosting-only preview deploy is insufficient.
- Production remains unchanged. Do not deploy Audio V2 to Production without explicit approval after Staging verification.


## Staging-Checkpoint 04.10.2026

- Audio Masterpiece V2 ist im gemeinsamen Integrationszweig enthalten.
- Integrationshead vor diesem Checkpoint: `578677633c1759e75fee6479f416fb64566f5c5c`.
- Gemeinsamer AI-Staging-Gate dieses Integrationsstands: Run `37229676328` grün.
- Hosting/AI wurden für vorherige Integrationsstände automatisch veröffentlicht.
- Der neue staging-only Assessment-Functions-Deploypfad wurde separat in PR #117 geprüft und in `main` integriert.
- Dieser Checkpoint ändert keinen Produktcode. Er erzwingt nach kontrollierter Integration einen frischen gemeinsamen CI-/Deploy-Zyklus, damit Hosting, AI Functions und Assessment Functions nachweislich denselben aktuellen Integrations-SHA verwenden.
- Production bleibt unverändert.
