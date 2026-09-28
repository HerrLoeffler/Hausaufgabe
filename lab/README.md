# GradeCrew Lab

Isolierte Entwicklerfläche für kleine Produkt-Experimente. Lab-Code wird nicht automatisch in Staging oder Production übernommen.

## Grundregel

Lab -> bewerten -> eigener Feature-Branch -> vollständige Integration -> Staging -> Live.

Ein Lab-Experiment darf bewusst unvollständig sein. Es soll zuerst beantworten, ob eine Idee in der Nutzung funktioniert.

## Fast Quiz

Pfad: `lab/fast-quiz/`

Ziel des ersten Experiments:

- 1 bis 5 Minuten frei wählbare Spielzeit
- fortlaufende Aufgaben bis der Timer endet
- gleiches Schwierigkeitsniveau für alle Teilnehmenden
- reproduzierbarer Rundencode/Seed als Grundlage für spätere Live-Duelle
- vorerst keine Firebase-, Auth-, Firestore- oder KI-Abhängigkeit
- lokale Demo-Generatoren für Prozentrechnung, Kopfrechnen und Wortarten
- Session-Eventlog im Ergebnisbildschirm für spätere Multiplayer-/Analyse-Experimente

## Lokal / Build prüfen

```bash
bash deploy-lab-fast-quiz.sh --check
```

Dieser Befehl prüft JavaScript und erzeugt einen isolierten temporären Hosting-Build. Er veröffentlicht nichts.

## Preview veröffentlichen

```bash
bash deploy-lab-fast-quiz.sh --deploy
```

Der Befehl deployt ausschließlich den Firebase Hosting Preview Channel `gradecrew-fast-quiz` im Projekt `hausaufgabe-staging`. Der Live-Channel von Staging und das Produktionsprojekt werden dabei nicht verändert.

Firebase Preview-URLs sind öffentlich für Personen, die die URL kennen. Deshalb im Lab keine echten Schülerdaten oder Geheimnisse verwenden.

## Nächste sinnvolle Experimente

1. beliebiges Thema per KI als Fragepaket erzeugen
2. Lehrer erstellt eine Fast-Quiz-Runde und teilt den Rundencode
3. Live-Lobby mit mehreren Spielern
4. synchroner Start und Live-Rangliste
5. adaptive Übung: falsche Kompetenz -> neue passende Fragen
6. Ergebnis nicht nur nach Punkten, sondern nach Kompetenzbereich
