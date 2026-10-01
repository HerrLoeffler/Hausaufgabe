# Website / App-Integration

Aktualisiert: 01.10.2026. Diese Übergabe verbindet bestätigte GitHub-Daten mit ausdrücklich gekennzeichneten Nutzerberichten.

- Branch: feature/gradecrew-app-integration
- GitHub-Spitze am 01.10.: 5a3b8ea168c74bc25dd14aad599670d17bafaa92
- Geprüfter Code: 21a66b32b06761a9d35d9d9a5bd02529f20d95ee; CI #355 war erfolgreich laut überprüftem Lauf vom 30.09.
- Nutzer hat Preview veröffentlicht: https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/
- Exakter veröffentlichter Commit hier noch nicht anhand eines Manifestes bestätigt; Preview kann ablaufen.
- Echter 30er-Test: FAIL, Testcode GE9ESSPSWY. Allgemeiner Serverfehler, Ursache ungeklärt. Gemeinsame Rate-Limit-Transaktion lediglich Verdacht; keine Serverlogs erhalten.
- Nutzer meldet: manuelle Tutorialabgabe in der iPad-App geht nicht; automatische Abgabe nach einer Minute funktioniert.

## Noch nicht auf GitHub gesicherter gc29-Entwurf

Im früheren Work-Arbeitsbereich `/workspace/scratch/d86804f7886a/integrated-gradecrew` wurden geändert:
- app.js: Tutorialbestätigung im Formular, erneute Prüfung gegen doppelte Abgabe;
- tutorial-submit-confirm.mjs und zugehöriger Test;
- dashboard-refinement.css: kompakte Statuschips, eingeklappte Suche/Filter;
- index.html, startup.js, tools/build-staging.mjs;
- gradecrew-tour.test.mjs, deploy-app-integration-preview.sh, GRADECREW_STATUS.md.
25 gezielte Tests liefen am 30.09. erfolgreich. Danach wurde der Filter-Reset ergänzt; keine vollständige CI und kein Geräte-/Deploy-Nachweis für gc29.
Ein vorbereiteter CI-Text lag nur im Chat-Zwischenspeicher. Er ist kein gesicherter Repo-Stand.

## Nächster Schritt

1. Prüfen, ob dieser lokale Entwurf noch existiert; falls ja als eigenen Recovery-/Aufgabenbranch sichern.
2. Vor Übernahme mit der neueren Designplanung und dem inzwischen weiterentwickelten Security-Branch vergleichen.
3. Native confirm()-Abfrage als vermutete Ursache nicht als am Gerät bewiesen darstellen.
4. Änderungen gezielt integrieren, CI ausführen, Preview deployen und manuelle Abgabe am Gerät prüfen.

Production bleibt bis zu einem ausdrücklichen Production-Auftrag unangetastet.
