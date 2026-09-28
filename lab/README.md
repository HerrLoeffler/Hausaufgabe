# GradeCrew Lab

Isolierte Entwicklerfläche für kleine Produkt-Experimente. Lab-Code wird nicht automatisch in Staging oder Production übernommen.

## Grundregel

Lab -> bewerten -> eigener Feature-Branch -> vollständige Integration -> Staging -> Live.

Ein Lab-Experiment darf bewusst unvollständig sein. Es soll zuerst beantworten, ob eine Idee in der Nutzung funktioniert.

## Fast Quiz V3

Pfad: `lab/fast-quiz/`

Fast Quiz ist in V3 bewusst auf Grundrechenarten fokussiert. Keine Prozentrechnung, Wortarten oder sonstigen Demo-Themen mehr.

### Inhalte

- Addition, Subtraktion, Multiplikation, Division einzeln kombinierbar
- Natürliche Zahlen, ganze Zahlen, Dezimalzahlen und Brüche einzeln kombinierbar
- vier Niveaus: Basis, Standard, Fortgeschritten, Profi
- 1 bis 5 Minuten Spielzeit
- deterministischer Seed: gleiche Runde = gleiche Aufgabenfolge
- ausgewählte Kombinationen aus Rechenart und Zahlenbereich werden zyklisch ausbalanciert
- Brüche werden exakt gerechnet und vollständig gekürzt
- Divisionen werden so erzeugt, dass die Lösung im gewählten Zahlenbereich sinnvoll bleibt

### Spielregeln

- +100 Punkte je richtiger Antwort
- Minuspunkte bei Fehler konfigurierbar: 0 / 25 / 50 / 100 / 200
- Sperre nach Fehler konfigurierbar: 0 / 2 / 5 / 10 / 30 Sekunden
- Zeitbonus ein/aus
- Serienbonus ein/aus
- negative Punktzahl ein/aus
- Lösung nach Fehler anzeigen ein/aus
- Bestenliste: live / erst nach Ende / verborgen

### Modi

1. **Frei üben**: beliebig oft, persönlicher Bestwert wird lokal je exakt gleicher Konfiguration gespeichert.
2. **Lehrer-Runde – Live**: Lehrkraft konfiguriert, erstellt sechsstelligen Code, Schüler treten bei, Lehrkraft startet, gemeinsamer Countdown, gemeinsamer Seed, laufende Ergebnissynchronisierung.
3. **Lehrer-Runde – selbstständig**: dieselbe Konfiguration kann ohne gemeinsamen Start bearbeitet werden.

### Lab-Multiplayer

V3 verwendet für das Lab absichtlich `localStorage` als austauschbaren Prototyp-Speicher. Dadurch lassen sich Lobby, Startsignal, Spielerstatus und Bestenliste bereits zwischen mehreren Tabs/Fenstern desselben Browsers testen, ohne Staging-Firestore-Regeln anzufassen.

Für echte Geräteübergreifende Nutzung wird diese Speicherstelle später durch einen Firebase-Adapter ersetzt. Das UI-, Seed-, Generator- und Scoring-Modell kann dabei bestehen bleiben.

### Anti-Spam

Blindes Durchklicken kann die Lehrkraft gezielt unattraktiv machen. Empfohlener Wettkampf-Standard:

- +100 richtige Antwort
- −50 falsche Antwort
- 5 Sekunden Sperre nach Fehler
- negative Punkte erlaubt
- Zeitbonus aktiv

Bei einer zufälligen Trefferchance von 25 % und zusätzlicher Sperrzeit ist permanentes Drücken derselben Antwort damit kein sinnvoller Weg zum Highscore.

## Lokal / Build prüfen

```bash
bash deploy-lab-fast-quiz.sh --check
```

Der Check prüft `math-engine.js`, `app-v3.js` und den isolierten Hosting-Build. Es wird nichts veröffentlicht.

## Preview veröffentlichen

```bash
bash deploy-lab-fast-quiz.sh --deploy
```

Der Befehl deployt ausschließlich den Firebase Hosting Preview Channel `gradecrew-fast-quiz` im Projekt `hausaufgabe-staging`. Der Live-Channel von Staging und das Produktionsprojekt werden nicht verändert.

Firebase Preview-URLs sind öffentlich für Personen, die die URL kennen. Im Lab keine echten Schülerdaten oder Geheimnisse verwenden.

## Nächste technische Stufe

1. Firebase-Room-Adapter für mehrere Geräte
2. serverseitige Score-Validierung gegen manipulierte Clients
3. Lehrer-Bestenliste dauerhaft speichern
4. Antwortpositionen pro Spieler variieren, Aufgabenfolge aber identisch halten
5. Aufgabenpakete aus dem GradeCrew-Quality-Pool oder aus einmalig geprüfter KI-Generierung einspeisen
6. adaptive Übungsrunde aus Fehlerschwerpunkten erzeugen
