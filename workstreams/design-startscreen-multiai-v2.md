# GradeCrew – Startscreen Masterpiece v2 / Multi-KI

- Task: GC-DESIGN-03
- Guardian queue id: `startscreen-masterpiece-v2-20261004`
- Datum: 04.10.2026
- Koordinationsbranch: `chore/guardian-startscreen-masterpiece-v2-task-20261004`
- Produktbasis: `feature/gradecrew-app-integration@b5d456e377fc56701d2a89a83385a7d773773781`
- Production: unverändert

## Nutzerauftrag

Der aktuelle Preview zeigt die gewünschte Grundstruktur, liegt visuell aber noch deutlich unter dem bestätigten Referenzbild. Martin möchte jetzt bewusst mehrere KI-Perspektiven einbeziehen und danach einen konsolidierten Verbesserungsdurchlauf statt weiterer kleiner Einzelkorrekturen.

## Sichtbarer Ist-Befund

Aus dem echten Desktop-Preview:
- Struktur und Inhalte stimmen grundsätzlich.
- Hero ist deutlich breiter als v3, wirkt aber weiterhin wie eine künstlich gezeichnete CSS-Szene.
- Tür, Fenster, Tafel und Regal erscheinen flach/geometrisch statt warm und räumlich.
- Coco ist größer, aber die Bühne hat noch nicht die Tiefe und emotionale Gastgeberwirkung des Referenzbildes.
- Support-Crew steht zu isoliert; Rollenkarten und CTA-Zone konkurrieren vertikal.
- Die CTA-Zeile liegt optisch zu nah an bzw. teilweise über der Crew-Zone.
- Schülerleiste und Benefits funktionieren, wirken aber noch stärker wie App-UI als wie eine integrierte Markenhomepage.
- Header ist funktional klar; aktuelles GradeCrew-Logo muss erhalten bleiben.

## Zielvertrag für den Guardian

Ein begrenzter Web-UI-Auftrag darf ausschließlich:
- `gradecrew-auth-startscreen.css`
- `gradecrew-entry-flow.js`

ändern. Kanonische Assets, Auth, Secure Student, Backend, Tests, CI und Deploycode bleiben unverändert.

Der Builder soll einen zusammenhängenden Premium-Pass erstellen. Danach prüfen drei unabhängige Modelle den exakten Kandidaten:
- GPT-6 Astra: Korrektheit / Auftragstreue
- Claude Sonnet 5.5: Security / Produktgrenzen
- GPT-6 Sol: QA / Nutzerablauf / Akzeptanz

Die aktuellen Guardian-Reviewer erhalten Textkontext, keine echten Screenshots. Deshalb ist die visuelle Differenz oben ausdrücklich in den Taskvertrag übersetzt. Ein späterer echter Screenshot-/Vision-Gate ist GC-AUTOMATION-10 und noch nicht implementiert.

## Budget

`small-web-v1`:
- 0,85 USD reserviert pro Versuch
- max. 2,55 USD pro Auftrag
- maximal drei Bauversuche
- vier Modellaufrufe pro vollständigem Versuch
- keine automatischen Upgrades/Fallbacks

## Aktueller Blocker

Frischer Guardian-Run 37195124361 um 10:21 UTC:
- `GRADECREW_GUARDIAN_ENABLED`: leer
- `CODEX_WORKER_ENABLED`: leer
- Worker-Key: nicht vorhanden
- OpenAI-Review-Key: nicht vorhanden
- Anthropic-Review-Key: nicht vorhanden
- Policy: deaktiviert
- kein bezahlter Pilot aufgenommen

Die Multi-KI-Kette ist daher implementiert, aber noch nicht ausführbar. Keys dürfen nicht in Chat oder Repo geschrieben werden.

## Reihenfolge

1. Diesen Queue-Auftrag auf main sichern und CI prüfen.
2. Einmalige Eigentümer-Einrichtung nach `docs/AUTOMATION_SETUP.md`.
3. Zuerst den bereits vorbereiteten kleinen E2E-Pilot `pilot-tutorial-later-a11y-20261004` erfolgreich durchlaufen lassen; damit Provider/PR/CI/Reviews/Integration/Staging-Receipts real belegen.
4. Danach `startscreen-masterpiece-v2-20261004` aufnehmen.
5. Guardian-PR, Combined CI und drei Reviewerbefunde prüfen.
6. Nur bei drei Freigaben integrieren und Preview deployen.
7. Martin macht die visuelle Endabnahme anhand des echten Desktop/iPad/Phone-Previews.

## Status

- visueller Nutzerbefund: vorhanden
- konkreter Multi-KI-Task: vorbereitet
- auf GitHub gesichert: ja, Koordinationsbranch
- auf main integriert: noch nein
- Guardian aktiviert: nein
- Paid API-Aufruf: nein
- Kandidat gebaut: nein
- Reviews: nein
- Integration: nein
- neuer Preview: nein
- Production: UNVERÄNDERT

## Pilotbefund 04.10.2026

Der erste echte Guardian-Pilot `37196835882` lief bis Build/Publish/Combined-Validation erfolgreich. Claude-Security-Review war ebenfalls erfolgreich. Zwei OpenAI-Reviews stoppten fail-closed mit HTTP 403 `provider/model permission denied` für `gpt-6-astra` und `gpt-6-sol`; keine Integration, kein Deploy. Nicht blind wiederholen. Vor dem Startscreen-Auftrag muss der dedizierte OpenAI-Review-Key Schreibzugriff auf Responses und Projekt-Modellnutzung für beide Review-Modelle besitzen. Der Worker-Key ist grundsätzlich funktionsfähig, da der GPT-6.1-Sol-Build erfolgreich war.

Der Web-Integrationsbranch ist inzwischen auf `b5d456e3…` weitergelaufen. Vergleich gegen `eb80c5e6…`: keine Änderungen an `gradecrew-auth-startscreen.css` oder `gradecrew-entry-flow.js`; Task deshalb auf den aktuellen Web-Head neu gepinnt. Audio-/Assessment-/Backendänderungen bleiben außerhalb des erlaubten Dateiscopes.
