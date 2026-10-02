# Aufgabe: GC-GAMES-ADVENTURE-01 — Raum-1-Prototyp

- Stand: 2026-10-03
- Branch: `prototype/escape-adventure-room1-v1`
- Basis: `feature/escape-room-mvp-v1@a7ffc382128c49b418a79c31812f88e7fe0fd3d2`
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
- Nähe-Hotspots
- Shared Coco als Spielerfigur/Guide
- Inventar mit Batterie + Taschenlampe
- q1/q2/q3 aus dem Raum-1-Prozentrechnungsstand
- Lernhilfe + Transfercheck nach Fehlversuchen
- Regal/Computer/Tafel liefern Code 4/7/8
- Türcode 784
- Anti-Raten: nach zwei falschen Türcodes müssen Regal, Computer und Tafel erneut geprüft werden
- Raum-1-Erfolg mit Lern-/Hinweis-/Zeitstatistik

## Bewusst noch offen

- kein Raum 2/3
- keine Animation-Sprites / Laufzyklen
- kein Sound
- kein Gamepad
- keine Persistenz
- noch keine echte GradeCrew-KI-Erstellung in diesem Prototyp
- keine externe Tutor-KI
- keine physische Geräteabnahme

## Architekturentscheidung

Erster Prototyp bewusst Canvas 2D ohne externe Runtime-Abhängigkeit. So wird zuerst das Spielgefühl und die Gerätekompatibilität geprüft. Ein späterer Phaser-Port bleibt möglich, wenn mehr Animation, Szenenverwaltung oder Tilemaps den zusätzlichen Framework-Aufwand rechtfertigen.

## Abnahmekriterien

1. Desktop: Figur kontrollierbar, alle sechs Interaktionspunkte erreichbar.
2. iPad/iPhone: Tap-to-Move und Touch-Steuerung ohne Scroll-/Zoom-Konflikte.
3. Lernfragen können nicht durch Fehlklicks Spielfortschritt freigeben.
4. Türcode kann nicht dauerhaft blind geraten werden.
5. Bestehender Point-and-Click-Escape bleibt funktional und unberührt.
6. Preview nur im Staging-Projekt.
