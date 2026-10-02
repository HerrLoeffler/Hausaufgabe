# Aufgabe: GC-GAMES-ADVENTURE-01 — Raum-1-Prototyp

- Stand: 2026-10-03
- Branch: `prototype/escape-adventure-room1-v1`
- Basis: `feature/escape-room-mvp-v1@a7ffc382128c49b418a79c31812f88e7fe0fd3d2`
- aktuell geprüfter/deployter Produktstand: `9eb9fa4318b78a3ad5a91f589ae772cf69bc0cc3`
- Draft-PR: `#53` gegen `feature/escape-room-mvp-v1`
- aktueller Preview-Run: `37077473927`
- Preview: `https://hausaufgabe-staging--gradecrew-escape-adventure-p2qz7zeb.web.app`
- Scope: ausschließlich steuerbarer Raum 1 der Referenzwelt „Die verriegelte Schule“
- Bestehender Point-and-Click-Escape: unverändert unter `lab/escape-room/`
- Production: unverändert

## Ziel

Prüfen, ob GradeCrew Escape als kleines browserbasiertes Indie-Adventure mit steuerbarer Figur auf Desktop, iPad und iPhone funktioniert, ohne die bestehende Escape-Variante zu ersetzen.

## Implementiert

- Canvas-Top-Down-Klassenzimmer
- Desktop: WASD/Pfeile + E/Enter + Klick/Tap-to-Move
- Touch: Tap-to-Move + Steuerkreuz + kontextabhängiger Interaktionsbutton
- Kollisionen mit Möbeln
- Nähe-Hotspots mit getrennten Objekt- und garantiert begehbaren Anlaufpunkten
- blockierte Klickpfade brechen sauber ab statt die Figur dauerhaft festzusetzen
- Coco bleibt Shared GradeCrew Guide/Hilfe in der Seitenleiste und ist **nicht mehr die steuerbare Spielfigur**
- steuerbare Figur aktuell bewusst neutraler Canvas-Spielavatar als Platzhalter; keine neue fünfte Crew-Rolle lokal erfunden
- Inventar mit Batterie + Taschenlampe + gefundenem Reihenfolge-Zettel
- q1/q2/q3 aus dem Raum-1-Prozentrechnungsstand
- Lernhilfe + Transfercheck nach Fehlversuchen
- Regal/Computer/Tafel liefern die Ziffern 4/7/8
- Taschenlampe besitzt echte Blickrichtung und dreht Lichtkegel + sichtbare Taschenlampe mit der Figur
- bewusst sehr dunkle Ecke links unten
- dort wird ein gefalteter Zettel erst sichtbar/interaktiv, wenn der aktive Lichtkegel ihn trifft
- Zettel: `COMPUTER → TAFEL → REGAL`; damit ergibt sich aus 7/8/4 logisch der Türcode `784`
- Tür öffnet nur mit allen drei Ziffern **und** gefundenem Reihenfolge-Zettel
- Anti-Raten: nach wiederholtem falschem Code müssen Regal, Computer und Tafel erneut geprüft werden
- Raum-1-Erfolg mit Lern-/Hinweis-/Zeitstatistik

## Neue verbindliche Games-Regel: individuelle Varianten pro Schüler

Für spätere GradeCrew-Games sollen Schüler in derselben Runde **äquivalente, aber nicht identische Lernaufgaben** bekommen. Das gilt insbesondere für leicht parametrisierbare Aufgaben wie Mathematik.

- gleiches Lernziel und gleiches Niveau;
- andere Zahlen/Beispiele/Antwortwerte je Schüler bzw. Session;
- stabiler Seed, damit eine Variante innerhalb der Runde reproduzierbar bleibt;
- eigener gelöster Lernzustand muss für Fortschritts-Gates maßgeblich sein;
- bloßes Zurufen einer fremden Lösung oder eines fertigen Codes darf den eigenen Fortschritt nicht ersetzen;
- wo sinnvoll können zusätzlich Codefragmente/Schlüsselwerte pro Schüler oder Session variiert werden, während Geschichte und Schwierigkeit gleich bleiben.

Die übergreifende Regel ist zusätzlich in `docs/games/LEARNING_GUARDRAILS.md` dokumentiert.

## Warum der erste Teststand teilweise nicht lösbar war

Martins erster echter Spieltest deckte zwei Probleme auf:

1. Klick-to-Move zielte bei einigen Objekten auf Koordinaten im Möbel/Kollisionsbereich. Dadurch konnten besonders Schrank/Tafel nicht zuverlässig erreicht werden.
2. Die Ziffern 4, 7 und 8 waren auffindbar, aber die Reihenfolge `784` war nicht logisch herleitbar.

Beides wurde im aktuell deployten Stand behoben. Der dunkle Taschenlampen-Zettel ist zugleich ein echtes Explorationsrätsel statt einer bloßen UI-Erklärung.

## Neues Playtest-Feedback vom 03.10.2026

Noch offen und **nicht als behoben markieren**:

1. **Enter im Zahlenfolgen-/Tafeldialog:** Martin musste auf „Prüfen“ klicken. Ursache im aktuellen Code ist nachvollziehbar: der globale Enter-Handler interagiert nur mit dem Raum, wenn kein Dialog offen ist; für `boardInput` existiert noch kein eigener Enter-Submit.
2. **Lichtdarstellung:** aktuell wird immer ein radialer Helligkeitsbereich um die Spielfigur gezeichnet. Gewünschtes Verhalten: **kein persönlicher Lichtschein vor der Taschenlampe**; erst nach gefundener/aktivierter Taschenlampe soll der gerichtete Lichtkegel erscheinen. Die dunkle Ecke bleibt als Umgebungslicht-/Schattenelement erhalten.

Diese beiden Punkte sind kleine Interaktions-/Rendering-Polishes, aber noch nicht implementiert oder deployed.

## Verifikation aktuell

Run `37077473927` auf Commit `9eb9fa4318b78a3ad5a91f589ae772cf69bc0cc3`:

- JavaScript-Syntaxcheck grün
- **9/9 Adventure-Vertragstests grün**
- Erreichbarkeit über sichere Anlaufpunkte geprüft
- Blickrichtungs-/Taschenlampenvertrag geprüft
- versteckter Dunkel-Ecken-Zettel geprüft
- logisch herleitbarer Türcode + Pflicht-Zettel geprüft
- Coco als Guide statt Spieler geprüft
- isolierter Adventure-Build grün
- Staging Firebase Credential grün
- Preview-Deploy `gradecrew-escape-adventure` grün
- Preview läuft bis 2026-11-01
- bestehender Point-and-Click-Escape wurde vom Workflow nicht deployed oder verändert
- Functions/Firestore/Production nicht angefasst

Zusätzlich war `Escape review gates` auf dem vorhergehenden Feature-Head `b2eb017…` grün; aktuelle PR-/Games-Checks laufen unabhängig vom isolierten Preview-Deploy.

## Status — getrennt

- lokal geändert: n/a (GitHub-direkter Arbeitslauf)
- auf GitHub gesichert: ja
- automatisiert getestet: aktuell deployter Produktstand 9/9 + Syntax
- isolierter Build: aktuell deployter Produktstand ja
- Staging deployed: ja, Produktstand `9eb9fa4…`
- später dokumentierte Produktregel/Playtest-Notizen: auf GitHub gesichert, aber kein neuer Produktdeploy
- echter Desktop-Spieltest: durchgeführt; Lösbarkeit deutlich verbessert, zwei neue Polish-Punkte gefunden (Enter + permanenter Lichtschein)
- echter iPad-Spieltest: offen
- echter iPhone-Spieltest: offen
- in bestehenden Escape integriert: nein, bewusst separater Prototyp
- permanente Games-Spielerfigur im Shared Designsystem: noch nicht entschieden/erstellt
- Production: unverändert

## Games-Spielerfigur — Designentscheidung offen

Das Shared GradeCrew Brand System besitzt aktuell vier klar definierte Assistant-Rollen: Coco, Remy, Emmi und Wilma. Eine neue Figur soll deshalb nicht still nur im Adventure-Branch als fünfte Assistant-Rolle entstehen.

Aktueller Prototyp nutzt einen neutralen, intern gezeichneten Spielavatar. Nächster Designschritt kann eine **zentrale GradeCrew-Games-Spielerfigur / Crew-Avatar** sein, die in Escape und weiteren Games wiederkehrt. Diese Figur sollte ausdrücklich Spieleravatar sein und keine fünfte Assistant-Funktion übernehmen. Nach Freigabe gehört sie ins gemeinsame Designsystem/Asset-Template.

## Bewusst noch offen

- kein Raum 2/3
- keine echte Laufanimation / Sprite-Sheets
- kein Sound
- kein Gamepad
- keine Persistenz
- noch keine echte GradeCrew-KI-Erstellung in diesem Prototyp
- keine externe Tutor-KI
- Enter-Submit in Zahlen-/Code-Dialogen noch nicht vollständig umgesetzt
- permanenter radialer Lichtschein um Figur soll entfernt werden
- neuer Licht-/Lösbarkeitsstand noch nicht auf physischen Mobilgeräten bestätigt

## Architekturentscheidung

Erster Prototyp bewusst Canvas 2D ohne externe Runtime-Abhängigkeit. So wird zuerst das Spielgefühl und die Gerätekompatibilität geprüft. Ein späterer Phaser-Port bleibt möglich, wenn mehr Animation, Szenenverwaltung oder Tilemaps den zusätzlichen Framework-Aufwand rechtfertigen.

Für den Ausbau auf mehrere Level/Welten soll die Spiellogik zunehmend **datengetrieben und modular** werden: Szenen, Items, Hotspots, Rätseltypen und Storybeats werden als wiederverwendbare Bausteine definiert. Neue Level sollen dann überwiegend aus Konfiguration + Grafik + Story bestehen und nicht jedes Mal als neues Spiel programmiert werden.

## Abnahmekriterien

1. Desktop: Figur kontrollierbar und alle Interaktionspunkte zuverlässig erreichbar.
2. iPad/iPhone: Tap-to-Move und Touch-Steuerung ohne Scroll-/Zoom-Konflikte.
3. Lernfragen können nicht durch Fehlklicks Spielfortschritt freigeben.
4. Taschenlampe folgt sichtbar der Blick-/Laufrichtung.
5. Reihenfolge-Hinweis ist nur durch aktive Erkundung der dunklen Ecke mit Licht auffindbar.
6. Türcode ist logisch herleitbar und Raum ohne Raten lösbar.
7. Bestehender Point-and-Click-Escape bleibt funktional und unberührt.
8. Preview nur im Staging-Projekt.
9. Enter bestätigt Zahlen-/Codeeingaben in den entsprechenden Dialogen.
10. Ohne aktive Taschenlampe gibt es keinen persönlichen Lichtschein um die Spielfigur.

## Nächster Schritt

Zuerst Enter-Submit und Lichtdarstellung anhand des neuen Desktop-Feedbacks polieren und automatisiert absichern. Danach Martin erneut Desktop testen lassen und anschließend iPad/iPhone. Parallel kann die zentrale Games-Spielerfigur konzipiert werden. Erst nach diesem Feedback entscheiden wir über Laufanimationen/Sprites, weitere Raumgrafik und den Ausbau auf Raum 2/3 bzw. einen späteren Phaser-Port.
