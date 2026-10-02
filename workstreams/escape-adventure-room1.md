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

## Warum der erste Teststand teilweise nicht lösbar war

Martins erster echter Spieltest deckte zwei Probleme auf:

1. Klick-to-Move zielte bei einigen Objekten auf Koordinaten im Möbel/Kollisionsbereich. Dadurch konnten besonders Schrank/Tafel nicht zuverlässig erreicht werden.
2. Die Ziffern 4, 7 und 8 waren auffindbar, aber die Reihenfolge `784` war nicht logisch herleitbar.

Beides wurde im aktuellen Stand behoben. Der dunkle Taschenlampen-Zettel ist zugleich ein echtes Explorationsrätsel statt einer bloßen UI-Erklärung.

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
- automatisiert getestet: ja, 9/9 + Syntax
- isolierter Build: ja
- Staging deployed: ja
- echter Desktop-Spieltest: erster Stand durch Martin getestet; neuer Lösbarkeits-/Lichtstand noch nicht bestätigt
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
- neuer Licht-/Lösbarkeitsstand noch nicht auf physischen Geräten bestätigt

## Architekturentscheidung

Erster Prototyp bewusst Canvas 2D ohne externe Runtime-Abhängigkeit. So wird zuerst das Spielgefühl und die Gerätekompatibilität geprüft. Ein späterer Phaser-Port bleibt möglich, wenn mehr Animation, Szenenverwaltung oder Tilemaps den zusätzlichen Framework-Aufwand rechtfertigen.

## Abnahmekriterien

1. Desktop: Figur kontrollierbar und alle Interaktionspunkte zuverlässig erreichbar.
2. iPad/iPhone: Tap-to-Move und Touch-Steuerung ohne Scroll-/Zoom-Konflikte.
3. Lernfragen können nicht durch Fehlklicks Spielfortschritt freigeben.
4. Taschenlampe folgt sichtbar der Blick-/Laufrichtung.
5. Reihenfolge-Hinweis ist nur durch aktive Erkundung der dunklen Ecke mit Licht auffindbar.
6. Türcode ist logisch herleitbar und Raum ohne Raten lösbar.
7. Bestehender Point-and-Click-Escape bleibt funktional und unberührt.
8. Preview nur im Staging-Projekt.

## Nächster Schritt

Martin testet den neuen Preview auf Desktop und danach iPad/iPhone. Parallel kann die zentrale Games-Spielerfigur konzipiert werden. Erst nach diesem Feedback entscheiden wir über Laufanimationen/Sprites, weitere Raumgrafik und den Ausbau auf Raum 2/3 bzw. einen späteren Phaser-Port.
