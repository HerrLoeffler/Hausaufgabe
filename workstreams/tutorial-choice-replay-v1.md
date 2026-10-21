# Tutorial Choice & Replay V1

Task: `GC-TUTORIAL-04`

## Ziel

Die GradeCrew-Einführung lädt neue Lehrkräfte stark zum Tutorial ein, hält sie aber nicht mehr in einer unabwählbaren Pflicht-Tour fest.

## Produktregeln

- automatische Einladung nur einmal pro Lehrkraft
- kein automatischer Start der eigentlichen Tour
- primärer CTA: `Tutorial starten · ca. 5–7 Min.`
- sekundär: `Jetzt nicht – später jederzeit über Tutorial`
- die Entscheidung wird zusätzlich im Nutzerprofil gespeichert (`crewTourOfferHandledAt`, `crewTourOfferChoice`), damit die Einladung geräteübergreifend nicht wieder ungefragt erscheint
- lokaler Fallback verhindert Wiederholung, falls die Profilspeicherung vorübergehend scheitert
- Tour ist jederzeit über × oder Escape abbrechbar und führt danach zurück ins Dashboard
- kleiner manueller Tutorial-Button bleibt auch nach Abschluss verfügbar
- Admin: keine automatische Einladung; manueller Button `Tutorial testen`
- bestehende vollständige Crew-Reise bleibt inhaltlich erhalten
- Production nicht verändern

## UX

Die erste Einladung ist bewusst sichtbar statt zwingend: Crew-Grafik, klarer Nutzen, drei kurze Vorteile und ein dominanter Start-CTA. Das Tutorial selbst sperrt weiterhin irrelevante Bedienelemente pro Schritt, besitzt aber nun jederzeit einen echten Ausstieg.

## Finale-Sortierung – Arrow-only Hardening (`GC-TUTORIAL-05`)

Nutzerbeobachtung vom 02.10.2026: Bei der letzten Crew-Sortieraufgabe konnte die sichtbare Drag-Markierung `⋮⋮` auf einem Touchgerät zum Ziehen/Wischen verleiten. Da die Schülerphase des Tutorials absichtlich scrollbar ist, konnte dadurch der blaue Abgabe-Button aus dem Sichtbereich geraten.

Fix-Branch: `fix/tutorial-finale-arrow-only`, Basis `feature/gradecrew-app-integration@a61759db01e41f19b7d34e6eb0e88bac42484c1e`.

Der Fix gilt ausschließlich für die Tutorial-Aufgabe `Crew-Finale`:

- Drag & Drop der `.sortItem`-Zeilen wird deaktiviert; reale Ordering-Aufgaben außerhalb des Tutorials bleiben unverändert.
- Der Drag-Griff `⋮⋮` wird ausgeblendet und für Assistenztechnik als verborgen markiert.
- Die Reihenfolge wird nur mit den bereits vorhandenen `↑`-/`↓`-Buttons geändert; ein kurzer Hinweis erklärt dies explizit.
- `dragstart`, Wischen und Scrollrad direkt auf einer Finale-Zeile werden abgefangen, damit die Geste nicht die Seite verschiebt.
- Sobald das Finale im Sichtbereich ist, wird der blaue `Antworten abgeben`-Button bei Bedarf tutorial-only am unteren Viewport-Rand angeheftet.
- Nach einer Interaktion mit der Sortierung wird bei einem starken Viewport-Drift die Finale-Aufgabe automatisch wieder ins Bild geholt.
- Beim Verlassen der Tutorial-Antwortphase wird der ursprüngliche `draggable`-Zustand wiederhergestellt.

Implementierung: `tutorial-ordering-guard.js`, Einbindung über `gradecrew-tour-v8.js`, Regressionen in `tutorial-ordering-guard.test.mjs`.

Aktueller Code-Head nach Implementierung/Testdatei: `06fd97395b167f7d23311ff9a257bc0867afe271`; CI und Staging-Integration sind zum Zeitpunkt dieses Eintrags noch offen.

## Zeitmessung

Die bestehende Tour misst bereits lokal `startedAt` bis Abschluss und zeigt die tatsächliche Dauer im Finale an. V1 speichert diese Dauer nicht personenbezogen. Für eine spätere datensparsame Produktmessung sollen nur Start/Abbruch/Abschluss, letzter Schritt und Dauer/Bucket über den separaten Telemetrie-Vertrag erfasst werden; keine Antworten oder Testinhalte. Bis reale Daten vorliegen, wird konservativ `ca. 5–7 Min.` kommuniziert.

## Branch / Nachweis

- ursprünglicher Feature-Branch: `feature/tutorial-choice-replay-v1`
- integriert in: `feature/gradecrew-app-integration`
- Feature-Basis: `feature/gradecrew-app-integration` @ `74eb2ec08e81315875abfc4b1ae052d9f78797eb`
- Tutorial-Merge in Integration: `0261ac848a5c58fa665dc4832fe1fca17317b4c3`
- aktueller verifizierter Staging-Build: `2b5565598c82e21b0a472f171d40fdbeadd1b626`
- geänderte Tutorial-Produktdateien: `app.js`, `crew-tour-hardening.js`, `gradecrew-tour-v7.js`, `gradecrew-tour-v8.js`, `tutorial-choice-v1.css`
- Regressionstest: `tutorial-choice-v1.test.mjs`; Dashboard-Regression auf Replay-Regel aktualisiert in `gradecrew-tour-v8-dashboard.test.mjs`
- Feature-Testlauf: GitHub Actions `Tutorial Choice V1 Checks` Run `36935628293` ✅
- kombinierter Integrations-Gate: `AI Staging Checks` Run `36937874607` ✅
- Mobile-Tutorial-Gate: Run `36937874576` ✅
- automatischer Preview-Deploy + Hash-Verifikation: `Automatic staging preview` Run `36938059928` ✅
- getestet: neuer Lehrer, Start, Jetzt-nicht, Admin, abgeschlossener Nutzer, Abbruch sowie bestehende komplette Crew-Reise, Responsive-Tutorial-Tests, Secure-Assessment-/Rules-Regressions und Staging-Smoke-Build

## Staging-Integration mit Crew/Emmi

Direkt vor Tutorial V2 wurden Crew Assistant/Remy und Emmi-Gesamttest in den Web-Integrationsbranch integriert (`cbeedd3ddfb1ed75d5187b8d2e02e5a5dd6616a8`). Deshalb enthält der verifizierte Preview bewusst den gemeinsamen Stand aus Crew Assistant + Emmi + Tutorial V2.

Für den gemeinsamen Staging-Build wurden fehlende Runtime-Dateien in `tools/build-staging.mjs` ergänzt: `crew-assistant-ui.js`, `crew-assistant-core.js`, `crew-assistant-core.mjs`, `emmi-whole-test-revision.mjs` und `tutorial-choice-v1.css`. Der Build-Validator prüft die Referenzen vor dem Deploy.

## Verifizierter Staging-Preview

- Projekt: `hausaufgabe-staging`
- Firebase Hosting Preview-Kanal: `gradecrew-app-integration`
- URL: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`
- Commit: `2b5565598c82e21b0a472f171d40fdbeadd1b626`
- verifizierte Dateien: `89`
- CI/Deploy-Run: `36938059928`
- der Workflow prüfte vor dem Deploy erneut, dass der Integrationsbranch noch auf exakt diesem getesteten Commit stand
- nach dem Deploy wurden veröffentlichte Manifest- und Datei-Hashes gegen den Build verifiziert
- Preview-Kanal läuft getrennt vom Staging-Root und läuft gemäß Workflow mit Ablaufzeit; Production wurde nicht verändert

## Noch offen

1. visuelle Abnahme der Einladung auf Desktop/iPad/iPhone
2. echte Profilspeicherung der Auswahl mit Testkonto prüfen
3. Abbruch mitten in verschiedenen Tutorial-Phasen am echten Gerät prüfen
4. Remy/Emmi im gemeinsam veröffentlichten Staging-Preview praktisch testen
5. `GC-TUTORIAL-05`: Arrow-only-Finale nach grüner CI in Web-Integration übernehmen, automatisch ins Staging-Preview deployen und anschließend auf Touchgerät prüfen
6. reale Dauerwerte erst nach freigegebener Telemetrie auswerten

## Deploy-Status

- lokal geändert: n/a (GitHub-first Arbeit)
- GitHub: **Tutorial V2 integriert; Finale-Hardening auf eigenem Fix-Branch gesichert**
- automatisierte Tests: **Tutorial V2 grün; Finale-Hardening CI noch offen**
- Staging Preview: **vorheriger Tutorial-V2-Stand deployed; Finale-Hardening noch nicht deployed**
- Staging Root `hausaufgabe-staging.web.app`: **durch diesen Vorgang nicht überschrieben**
- Gerätetest: **für Finale-Hardening offen / nicht durchgeführt**
- Production: **unverändert / nicht deployed**
