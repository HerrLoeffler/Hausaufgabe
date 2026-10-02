# Escape Adventure – Raum-1-Prototyp

Separater Prototyp für eine steuerbare Top-Down-Darstellung der bestehenden Referenzwelt **„Die verriegelte Schule“**.

## Wichtig

- Basis: `feature/escape-room-mvp-v1@a7ffc382128c49b418a79c31812f88e7fe0fd3d2`
- Branch: `prototype/escape-adventure-room1-v1`
- Der bestehende Point-and-Click-Escape unter `lab/escape-room/` wird **nicht verändert**.
- Production wird nicht deployt.
- Nur Raum 1 wird prototypisch umgesetzt.

## Steuerung

Desktop:
- WASD oder Pfeiltasten
- E / Enter zum Interagieren
- Klick/Tap auf Boden oder Interaktionspunkt für Tap-to-Move

Tablet/Handy:
- Tap-to-Move
- sichtbares Steuerkreuz
- großer kontextabhängiger Interaktionsbutton

## Raum-1-Loop

1. Schreibtisch: Lernaufgabe q1 → Batterie
2. Schrank: Taschenlampe finden; Batterie + Taschenlampe → aktiv
3. Regal: Lernaufgabe q2 → Codefragment 4
4. Computer: Lernaufgabe q3 → Codefragment 7
5. Tafel: Spielrätsel 2 · 4 · 6 · ? → Codefragment 8
6. Tür: Code 784 → Raum geschafft

Lernfragen übernehmen die bestehende Schutzidee:
- Fehler gibt fachlichen Hinweis statt Fortschritt.
- Nach einem Fehlversuch führt eine spätere richtige Antwort noch durch einen Transfercheck.
- Nach wiederholten Fehlern wird direkt Erklärung + Transfer verlangt.
- Erst erfolgreicher Lerncheck gibt den jeweiligen Spielreward frei.

Türcode-Anti-Raten:
- Nach zwei falschen Codes wird das Tastenfeld gesperrt.
- Regal, Computer und Tafel müssen erneut geprüft werden, bevor ein weiterer Codeversuch möglich ist.

## Technische Richtung

Der Prototyp ist absichtlich ohne externes Game-Framework gebaut:
- Canvas 2D
- gleiche Runtime für Desktop/iPad/iPhone
- keine externe CDN-Abhängigkeit
- Shared GradeCrew Coco wird beim Build aus `assets/gradecrew/penguin-guide.svg` übernommen

Das ist eine Machbarkeits-/Spielgefühl-Prüfung. Wenn Bewegung, Touch und Lernintegration überzeugen, kann die vollständige Adventure-Schicht anschließend auf derselben Logik ausgebaut oder auf Phaser portiert werden.
