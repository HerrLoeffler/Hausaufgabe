# GradeCrew: gemeinsamer App-/Web-Teststand gc28

Stand: 30.09.2026. Branch `feature/gradecrew-app-integration`.
Basis: `feature/gate-e-load-test` auf b9ba03b (enthält bereits gc27/Security/Diagnose).
Mobile Ergänzungen aus `fix/gradecrew-staging-polish` auf f90711b gezielt übernommen.
Nicht den älteren Mobile-Branch über gc27 deployen: sein Build enthält diese neuen Module nicht.

## Was wirklich zusammengeführt wurde

- gc27 Diagnose, Admin-Filter/Untersuchung, bereinigte Figuren und langsamerer Tourverlauf;
- Secure-Assessment-Frontend und unveränderte Backend-/Zielregeln;
- visualViewport-/Tastatur-/Safe-Area-Layout für kompakte Geräte;
- 11-Aufgabentypen-Systemtest mit 30 virtuellen Schülern;
- neue Prüfung, dass jeder Receipt eindeutig zur erwarteten Attempt-ID gehört;
- ausdrückliche Kennzeichnung des Paralleltests als `concurrency-smoke`;
- Branch-Guard und selbstbootstrappendes Hosting-Preview-Skript.

Beim Zusammenführen entdeckter Fehler: `crew-tour-responsive.js` kannte die
neuen `.gcCoachContext`-Karten nicht und behandelte sie wieder als schwebende Hilfe.
Die Erweiterung lässt diese Karten nun im gemeinsamen Aufgaben-/Hilfebereich;
ein DOM-Verhaltenstest prüft das auch bei verringerter Tastaturhöhe.

Lokale Prüfung: 141 Tests bestanden. Vollständige GitHub-CI #352 SUCCESS (Code 56737d4), Mobile-Check ebenfalls SUCCESS.
Nachweis: https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/36724364436
DOM-/Layoutberechnungen ersetzen keinen realen iPad-/iPhone-Durchlauf.

## App und Website besitzen getrennte Versionsstände

- Haupt-App heißt GradeCrew, Bundle-ID `de.gradecrew`.
- Version 0.1.3 (6) wurde laut Run 36712213667 tatsächlich gebaut/signiert/hochgeladen.
- Version **0.1.4 (7)** durch Run 36723972615 erfolgreich gebaut/signiert/hochgeladen;
  native Beta-Einstellungen und eine Staging-Preview-Wahl verfügbar.
- Standard-Appadresse bleibt normales Staging; dort aktuell gc21 / 4707c45.
- Dieser Webbranch erhält Version gc28; nach Preview-Deploy die ausgegebene URL
  in 0.1.4 → Beta-Einstellungen → Preview öffnen einsetzen.
- Eine andere Hosting-Domain kann eine neue Firebase-Webanmeldung erfordern.
- Bei abgelaufener Preview eine neue Adresse verwenden oder Normales Staging öffnen.
- Erfolgreicher TestFlight-Upload ist noch kein Nachweis eines physischen Gerätetests.

## Cloud Shell nach Reconnect

https://shell.cloud.google.com/?project=hausaufgabe-staging

```bash
cd ~/Hausaufgabe
git fetch --all --prune
git checkout feature/gradecrew-app-integration
git pull --ff-only
bash deploy-app-integration-preview.sh --deploy
```

Das Skript prüft Branch/sauberen Stand, lädt nvm, aktiviert Node 22 und führt
Tests/Build aus, bevor es einen Hosting-Preview-Channel veröffentlicht. Bei
fehlender Firebase-Anmeldung normal interaktiv anmelden; keine Token in Chat/Repo.
Die am Ende ausgegebene URL sichern. Es werden keine Functions, Firestore-Regeln
oder normale Hosting-Release verändert. Bereits deployte Staging-Functions verwendet.

## Überschaubarer erster Gerätetest

1. TestFlight aktualisieren, Versionsanzeige 0.1.4 prüfen.
2. Preview-Adresse einsetzen, angezeigten Host prüfen, mit Testkonto anmelden.
3. Tutorial: Wünsche bis Klick, Du-Frage, Katze/Hilfe vollständig, Freitextbewertung.
4. Bildschirmtastatur und Hoch-/Querformat; Buttons erreichbar, kein Scrollkampf.
5. Wegwerf-Test: Löschdialog abbrechen und danach bestätigen.
6. Test veröffentlichen, Schüler starten/abgeben, Resultat und manuelle Bewertung prüfen.
7. Optional Preview in Safari mit `?gateE=1` öffnen und den Paralleltest einmal starten.

Für den 30er-Test genügt ein Systemtest. Es werden keine 30 digitalen Tests benötigt.
Der vorhandene Paralleltest deckt Starts/Polls/Doppelabgaben/Receipt-Korrelation ab.
Sein PASS beweist nicht alle Release-Gates: Lehrer-Ende-Rennen, echte Netzunterbrechung,
iOS-Hintergrund, Maximalpayload, anhaltende Last und serverseitige Datenbankabgleiche
stehen weiterhin aus. Production und Regel-Cutover deshalb separat freigeben.
