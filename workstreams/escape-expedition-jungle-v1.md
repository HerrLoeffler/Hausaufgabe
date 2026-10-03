# GC-GAMES-ESCAPE-EXPEDITION-01 — Expedition Amazonas

Stand: 03.10.2026

## Branch / Basis

- Branch: `prototype/escape-expedition-jungle-v1`
- Basis: `prototype/escape-adventure-room1-v1@23b59b21a25bcfe28f2beddd718104f467a40d12`
- geprüfter Produktstand: `71f0a6a9c27701ebc64d9b2757d55f04f354a809`
- Preview-Run: `37080117761`
- Preview: `https://hausaufgabe-staging--gradecrew-escape-expedition-j2u7iae4.web.app`
- vorheriger Adventure-Prototyp bleibt separat erhalten
- bestehender Point-and-Click-Escape bleibt separat erhalten
- Production: unverändert

## Ziel

Beweisen, dass die GradeCrew-Adventure-Basis mehr als einen einzelnen Raum und mehr als Taschenlampe/Code kann. Der Prototyp soll mehrere klar unterschiedliche Mechaniken in einer zusammenhängenden Story auf Desktop, iPad und iPhone tragen.

## Produktkonzept

Verbindliches Escape-only Konzept: `docs/games/ESCAPE_GAMES_CONCEPT.md`.

Kern:

1. gemeinsame Escape-Engine;
2. wachsende Mechanik-Bibliothek;
3. echte Welt-/Story-Packs;
4. variable Runs / individuelle Schüleraufgaben.

## Prototyp: Expedition Amazonas – Die verschwundene Forschungsstation

Implementierte Abschnitte:

1. **Expeditionscamp** – Routentablet + erstes Lern-Gate + Jeep-Schlüssel;
2. **Dschungelpiste** – echte Jeep-Steuerung mit Hindernissen;
3. **Blockierter Pfad** – Seilwinden-Minispiel mit Spannungsanzeige;
4. **Wildtierzone** – frei begehbar + Kameramodus + Tukan/Capybara fotografieren + Lern-Gate;
5. **Rio Verde** – Bootssteuerung und Felsen ausweichen;
6. **Forschungsstation** – Generator-Sequenz + Terminal-Lern-Gate;
7. **Funkmast** – Funkkanal einstellen und Rettungssignal senden.

Produktseitig werden diese als 6 Level gezählt; der blockierte Pfad ist ein Zwischenabschnitt von Level 2.

## Schüler-Varianten

- Session-Seed aus URL oder zufällig erzeugt;
- konkrete Zahlen der drei Prozent-Lern-Gates variieren deterministisch;
- Antwortoptionen variieren/reihen sich deterministisch;
- Transferaufgaben variieren ebenfalls;
- finaler Funkkanal variiert pro Session;
- damit kann ein fremder konkreter Lösungswert nicht zuverlässig für alle Runs übernommen werden.

Der Prototyp nutzt dafür **keine externe KI**. Die Variation demonstriert den später gewünschten Seed-/Aufgabenfamilien-Ansatz.

## Lernschutz

- falsche Antwort schaltet nichts frei;
- nach Fehlversuch bleibt ein zusätzlicher Transfercheck bestehen;
- nach wiederholtem Fehler wird Erklärung + neue Aufgabe genutzt;
- erst korrekt gelöste Haupt-/Transferlogik vergibt das zugehörige Item bzw. Story-Gate.

## Kosten-/API-Prinzip

Mechaniken wie Jeep, Seilwinde, Kamera, Boot, Generator und Funk sind normaler Code und verursachen beim Spielen keine Modellkosten. KI wird später gezielt für Lerninhalte/Hilfe eingesetzt, nicht für jede Bewegung oder Mechanik.

## Technische Isolation

- Frontend: `lab/escape-expedition/`
- Tests: `tools/games/escape-expedition.test.cjs`
- isolierter Build: `tools/build-lab-escape-expedition.mjs`
- eigener Workflow: `.github/workflows/escape-expedition-preview.yml`
- eigener Staging-Preview-Channel: `gradecrew-escape-expedition`
- keine Functions-/Firestore-/Production-Deploys aus diesem Workflow

## Verifikation

Run `37080117761` auf Produktcommit `71f0a6a9c27701ebc64d9b2757d55f04f354a809`:

- JavaScript-Syntaxcheck grün;
- **8/8 Expedition-Vertragstests grün**;
- isolierter Expedition-Build grün;
- Staging Firebase Credential grün;
- Hosting-Preview `gradecrew-escape-expedition` erfolgreich deployed;
- Preview gültig bis 02.11.2026;
- keine Functions-/Firestore-/Production-Schritte im Workflow.

## Status — getrennt

- lokal geändert: n/a (GitHub-direkter Arbeitslauf)
- auf GitHub gesichert: ja
- automatisiert getestet: ja, 8/8 + Syntax
- isolierter Build: ja
- Staging deployed: ja
- echter Desktop-Spieltest: offen
- echter iPad-Spieltest: offen
- echter iPhone-Spieltest: offen
- in bestehende Escape-Welt integriert: nein, bewusst separater Prototyp
- Production: unverändert

## Bewusst offen

- noch Platzhalter-Canvas-Avatar statt finaler Games-Figur;
- noch keine Sprite-Sheets/Laufanimationen;
- noch kein Sound/Musik;
- Fahrzeugphysik bewusst arcadeartig, nicht realistisch;
- keine Gegner-KI;
- kein echtes Backend/Klassenjoin;
- keine echte KI-Testgenerierung;
- noch keine Persistenz über Reload;
- Mechaniken sind im Prototyp noch in einer Datei, später modularisieren;
- automatisierte Vertragschecks ersetzen keinen vollständigen echten Durchspieltest; Softlocks/UX-Probleme können beim ersten manuellen Run noch gefunden werden.

## Nächster Schritt

1. Martin spielt den Preview auf Desktop vollständig durch und meldet Softlocks/Bedienfehler;
2. danach iPad/iPhone prüfen;
3. entscheiden, welche Mechaniken qualitativ ausgebaut werden sollen;
4. danach die Mechaniken aus `app.js` in eine wiederverwendbare Escape-Engine/Module aufteilen, statt weitere Welten als Monolith zu kopieren.
