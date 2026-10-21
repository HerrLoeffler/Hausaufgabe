# GradeCrew gc1 · Übergabe

## Umfang

Frontend-Änderung auf Basis von `5ada0e71664ac495598542ceb4836196bff2229f` des Branches `fix/ai-review-workflow`. Neuer Branch: `fix/gradecrew-staging-polish`. Ziel: ausschließlich `hausaufgabe-staging` Hosting. Keine Änderungen an Production, Functions, Firestore-Regeln, Storage-Regeln oder gespeicherten Testdaten.

Die öffentliche Staging-Seite war am 28.09.2026 im Cloud-Browser erreichbar. Der zuletzt gemeldete vollständige Ladeausfall ließ sich öffentlich nicht reproduzieren. Bestätigt wurden die verschwindende Tutorial-Figur, doppelte Variantenfelder, globale Umschreibung von Seitentexten sowie unnötig gekoppelte Start-Abhängigkeiten. Staging unterschied sich in zwei Frontend-Dateien vom jüngsten GitHub-Stand (Cache-Version und Outline-Navigation); beide Unterschiede wurden berücksichtigt.

## Geändert

- GradeCrew direkt in der eigenen Oberfläche; keine Umschreibung beliebiger Aufgabeninhalte.
- Gemeinsame Gestaltung für Einstieg, Dashboard, KI-Erstellung und kompakte Arbeitsbereiche.
- Lokale Crew-SVGs mit festen Größen; Tutorial aktualisiert die passende Figur bei jedem Schritt.
- Eigener Startup-Fehler mit erneutem Laden statt stiller Importfehler.
- Ein Varianten-Wunsch pro Auftrag. Keine unsichtbaren Dialoge und keine global weitergereichten alten Wünsche.
- Warteschlange an Test und Account gebunden, ohne dauernde 700-ms-Abfragen.
- Halber grüner Smiley bei „Behalten“, getrennt von ausdrücklich guter Qualitätsbewertung.
- KI-Statusfehler wird nicht als gescheiterte Erstellung ausgegeben; freigeschaltete Lehrkräfte werden sprachlich berücksichtigt.
- Layoutcode verändert keine eingegebenen Markier-Aufgaben mehr.
- Reproduzierbarer Hosting-Build und Kontrolle der Dateien nach Deployment.

## Prüfungen

`bash deploy-staging-hosting.sh --check` führt Syntax-, bestehende Frontend- und DOM-Regressionstests durch und baut ein vollständiges, geprüftes Staging-Paket. Zusätzlich wurden die 103 vorhandenen Functions-Tests ausgeführt. Keine kostenpflichtige KI-Erstellung wurde für diesen UI-Stand ausgelöst.

Der Cloud-Browser darf lokale HTML-Dateien hier nicht öffnen. Die öffentliche bisherige Staging-Seite wurde angesehen; die neue Gestaltung muss nach dem Deployment visuell überprüft werden. Keine Behauptung eines bereits abgeschlossenen Ende-zu-Ende-Tests angemeldeter Lehrerabläufe.

## Wiederaufnahme nach Cloud-Shell-Reconnect

Das Skript `tools/cloud-shell-staging.sh` kann aus jedem Verzeichnis gestartet werden. Es erstellt einen separaten Checkout, erhält vorhandene Arbeitsstände, aktiviert Node 22, prüft Firebase-Anmeldung und führt das ausschließlich auf Staging begrenzte Hosting-Deployment aus.

`bash deploy-staging-hosting.sh --deploy` benötigt einen sauberen Git-Stand und eine bereits autorisierte Firebase-CLI. Das Skript erstellt eine temporäre Hosting-Konfiguration mit festem Staging-Projekt und verändert die Konfiguration im Repository nicht. Nach dem Upload werden die ausgelieferten Kern-Dateien mit SHA-256 verglichen.

## Danach prüfen

1. Desktop und Mobilgerät: Anmeldung und Codefeld, Tierbilder, Zeilenumbrüche und Tastaturfokus.
2. Tutorial vor/zurück/überspringen; geführten ersten Test öffnen.
3. Variante mit Wunsch, zweite Variante mit anderem Wunsch; währenddessen tippen und Test wechseln; zum Ursprungstest zurückkehren.
4. Variante behalten: halber Smiley; ausdrücklich gut bewerten: volle Bestätigung.
5. Eine KI-Erstellung mit und ohne Bild unter dem vorhandenen Budget, erst nach Veröffentlichung des UI-Standes.

## Bewusst noch offen

Ein echter abgesicherter Prüfungsmodus benötigt das Backend-Projekt aus `SECURE_EXAM_PLAN.md`. Der bestehende `teacher-results-enhancements.js`-Entwurf ist weiterhin nicht aktiviert: Er enthält einen unruhigen DOM-Beobachter und eine destruktive Reset-Funktion ohne Sitzungsrotation. Diese Funktion wird durch die Gestaltungsänderung nicht neu freigeschaltet.
