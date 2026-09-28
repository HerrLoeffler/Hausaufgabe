# GradeCrew Lab

Isolierte Entwicklerfläche für kleine Produkt-Experimente. Lab-Code wird nicht automatisch in Staging oder Production übernommen.

## Grundregel

Lab -> bewerten -> eigener Feature-Branch -> vollständige Integration -> Staging -> Live.

Ein Lab-Experiment darf bewusst unvollständig sein. Es soll zuerst beantworten, ob eine Idee in der Nutzung funktioniert.

## Fast Quiz V4

Frontend: `lab/fast-quiz/`

Separates Lab-Backend: `lab/fast-quiz-functions/`

Fast Quiz ist aktuell bewusst vollständig auf Grundrechenarten fokussiert.

### Drei klare Modi

1. **Üben**
   - Rechenarten, Zahlenbereiche, Niveau und 1–5 Minuten frei wählen
   - persönliche Bestwerte lokal speichern
   - gleiche Aufgaben oder neue Aufgaben erneut spielen

2. **All-Time-Highscore**
   - feste faire Regeln
   - alle vier Grundrechenarten
   - 2 Minuten
   - neue, aber gleichwertig generierte Aufgaben pro Versuch
   - gemeinsame Bestenliste im Staging-Backend
   - getrennte Bestenlisten je Zahlenbereich und Niveau

3. **Live mit Lehrkraft**
   - Lehrkraft konfiguriert Rechenarten, Zahlenbereiche, Niveau, Zeit und Fehlerregeln
   - 6-stelliger Code + QR-Code
   - bis zu 30 Teilnehmende
   - Lehrkraft startet die Runde zentral
   - gemeinsamer Countdown
   - Lehrkraft sieht das Scoreboard immer live
   - Schüler sehen die Rangliste je nach Lehrereinstellung live, nach Ende oder gar nicht

### Zahlenbereiche

- Natürliche Zahlen
- Ganze Zahlen inklusive Vorzeichen
- Dezimalzahlen
- Brüche

### Vier klar definierte Niveaus

- Niveau 1 · Grundlagen
- Niveau 2 · Standard
- Niveau 3 · Erweitert
- Niveau 4 · Komplex

Die konkreten Zahlenräume und Aufgabenstrukturen sind für jeden Zahlenbereich in `math-engine-v4.js` fest definiert und werden im Konfigurator erklärt.

### Anti-Spam / Fehlversuche

Konfigurierbar:

- 0 / 25 / 50 / 100 / 200 Minuspunkte
- 0 / 2 / 5 / 10 / 30 Sekunden Sperrzeit
- Zeitbonus an/aus
- Serienbonus an/aus
- negative Punktzahlen an/aus
- richtige Lösung nach Fehler anzeigen/verbergen

Der offizielle Highscore-Modus verwendet ein fixes Regelwerk, damit alle Einträge vergleichbar bleiben.

## Technische Trennung

Fast Quiz nutzt eine eigene Firebase Functions-Codebase `fastquiz`. Es werden keine bestehenden GradeCrew-Functions und keine Firestore-Regeln verändert.

Die Function `fastQuizApi` verwaltet ausschließlich:

- Live-Räume unter `fastQuizRooms`
- Teilnehmer der Live-Räume
- Highscore-Versuche unter `fastQuizHighscoreAttempts`
- All-Time-Bestenlisten unter `fastQuizBoards`

Das Frontend liegt weiterhin nur in einem Firebase Hosting Preview Channel. Production und der Live-Channel von Staging werden dabei nicht verändert.

## Prüfen

Frontend:

```bash
bash deploy-lab-fast-quiz.sh --check
```

Backend:

```bash
bash deploy-lab-fast-quiz-backend.sh --check
```

Alles zusammen:

```bash
bash deploy-lab-fast-quiz-full.sh --check
```

## Veröffentlichen

Alles zusammen:

```bash
bash deploy-lab-fast-quiz-full.sh --deploy
```

Das Script deployt zuerst ausschließlich die Functions-Codebase `fastquiz` in `hausaufgabe-staging` und danach ausschließlich den Preview-Channel `gradecrew-fast-quiz`.

Firebase Preview-URLs sind öffentlich für Personen, die die URL kennen. Im Lab deshalb weiterhin nur Kürzel oder kurze Namen und keine sensiblen Schülerdaten verwenden.

## Später denkbar

- geprüfte GradeCrew-Aufgabenpools für andere Fächer
- KI erzeugt vor einer Runde ein geprüftes Aufgabenpaket zu einem beliebigen Thema
- Klassen-/Gruppenzuordnung
- Wochen- oder Schulhighscores
- Lehrer kann fertige Fast-Quiz-Konfigurationen speichern
- adaptive Übung aus Fehlerprofilen
