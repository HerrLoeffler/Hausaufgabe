# Mathe Klassenmodi Implementation Plan

> Ausführung: superpowers:executing-plans; autorisierter Fachagent. Nutzer hat die geschriebene Produktspezifikation und sofortige Umsetzung/Staging genehmigt; keine erneute Freigaberunde.

Goal: Im vorhandenen Fast Quiz Kopfrechnen/Stift und Block, Klasse gegen Computer und vier Gruppen direkt auf eigenem vollständigem Staging testen.
Architecture: Vorhandenes Vanilla-Spiel und fastQuizApi beibehalten. Neue serverautoritative Klassenräume in separater, clientseitig gesperrter Collection fastQuizClassrooms; alle Schreiboperationen transaktional. Legacy live/highscore bleibt getrennt. Privater Seed/Lösungsschlüssel wird niemals projiziert.
Tech: Node22, CommonJS Firebase Admin/Firestore, vorhandenes HTML/CSS/JS, bestehende Brandtokens. Keine neuen Dependencies, Rules, Authprovider oder bezahlten KI-Aufrufe.
Spec: docs/games/learning-ux-20261015 auf docs/games-learning-ux-20261015@c665cc724e1706f1bc551fe4894c40b1d2b234af; Folgeplan §4.2 hat Vorrang.

## Global Constraints
- Task GC-GAMES-LEARNING-UX-01; verknüpft GC-GAMES-FASTQUIZ-BINOMIAL-20261012. Basis PR224@2e5f8b8e; Integrationziel lab/games-structure, eigener vollständiger Stagingkanal erlaubt. Kein Production.
- Mental: alle Aufgaben H mit geeigneter Struktur/Strategie; paper: vorgeplantes round-half-up(0.35n), n20=7P13H/n5=2P3H; Korrekturen/Hilfen verändern Typ/Slot nicht. Kein Taschenrechner.
- 4 Gruppen balanced/manuell nur vor Start; Nfix unverändert; M100; Norm1000Σp/(Nfix×M); Gleichstand geteilter Rang. Latejoin ungewertet. Rejoin identisch. Server-Fristen 5×60s, 20/10/0 Erstversuch; schnelle Übung ungewertet.
- Computerziel normierte Energie500/600/600/700 als sichtbare Planwerte; Erfolg≥Ziel, Kampagnenlevel3 ergänzt einen kleinen zweiten Rechenschritt, fachliche Stufe/Kategorie bleibt; nächste Runde nur Lehrkraft, Verlust Retry, Stop Abbruch.
- UI Aufgaben→Spielweise→Start; Material/Beispiel vor Start; Details geschlossen; vorhandene Modi erreichbar; keine öffentliche Einzelrangliste.

## Review Focus
- Parallele doppelte Antworten, Rejoin/zweites Gerät, Start/Nächste/Stop wiederholt.
- Ungleiche Teams/fehlende Mitglieder/Dropout unveränderter Nenner.
- Öffentliche Antworten und Legacyactions liefern keine neuen Seeds/Keys/Hostdaten.
- Hilfe vor/nach Erstversuch, Lösung, Korrektur bleiben konsistent.
- Fenstergrenzen und beendet/abgebrochen sperren Wertung, freie Übung bleibt möglich.

## Task1: pure engine + invariants
Files: lab/fast-quiz-functions/classroom-math.js (UMD für Browserbuild), tools/games/classroom-math.test.cjs.
Interfaces: generateTask(config,seed,index), planKinds(category,count,seed), balancedTeams(ids,seed), standings(members,roster), targetFor(round).
- [x] Failing tests für65Mix, Zahlen/Strategien, reproduzierbare eindeutige Optionen, Teamgrößen24/25,600/600Beispiel/Ties.
- [x] Node tests RED, implementieren, GREEN; Checkpointcommit.

## Task2: server routes
Files: lab/fast-quiz-functions/classroom.js/index.js, tools/games/classroom-server.test.cjs.
Interfaces: classroomCreate/Join/State/Assign/Start/Stop/Task/Hint/Answer/Reveal auf bestehendem API mit Tokenvertrag; separate Collection.
- [x] Failing behavior tests mit Firestoretransaktionsadapter für Kernschleife/Manipulation/Rejoin/Latejoin/atomicStart/Antwortidempotenz/Fristen.
- [x] Implementieren und echte Tests grün. Keine Antworten/Seeds vorab.

## Task3: clear UI
Files: lab/fast-quiz/classroom.js/classroom.css vom abgegrenzten UX-Fachagent; index.html + tools/build-lab-fast-quiz.mjs hier.
Interfaces: global FastQuizClassroomMath; obige API. Nur zwei neue UI-Dateien parallel freigegeben.
- [x] Browsertests für Auswahl/Material/QR+Code/Teacher4Teams/Schülerkorrektur/freieÜbung/Stop/Rejoin.
- [x] Legacy-Suite/build/browser prüfen. Screens sichern.

## Task4: review + release
Files: eigener Deploywrapper, workstreams/math-classroom-learning-ux-20261016.md/Receipts, scoped TODO/STATE-Snapshot.
- [x] PR+ExactSHA CI+unabhängigen Review, Findings begrenzt beheben.
- [x] Vorhandene Firebase CLI Anmeldung nutzen, bestehende separate fastquiz Functions und eigenen Hostingkanal deployen; Rules unverändert.
- [x] HTTPHash+Functionsreceipt, echter synthetischerTeacher/Student/Team/Computerlauf; URL und Grenzen sichern.
