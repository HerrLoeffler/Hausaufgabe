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
5. reale Dauerwerte erst nach freigegebener Telemetrie auswerten

## Deploy-Status

- lokal geändert: n/a (GitHub-first Arbeit)
- GitHub: **gesichert und in Web-Integration integriert**
- automatisierte Tests: **grün**
- Staging Preview: **deployed und hash-verifiziert**
- Staging Root `hausaufgabe-staging.web.app`: **durch diesen Vorgang nicht überschrieben**
- Gerätetest: **offen / nicht durchgeführt**
- Production: **unverändert / nicht deployed**
