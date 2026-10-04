# GC-GAMES-ESCAPE-VISUAL-01 — Amazonas Visual Masterpiece

Stand: 04.10.2026

## Basis
- Branch: `prototype/escape-expedition-visual-masterpiece-v1`
- Basis: `prototype/escape-expedition-masterpiece-v1@934354fce20a24fd27f47a9b69237f3d04e3a3f5`
- Basis enthält M1.1–M1.5 + M2 Sprache/UX.
- Production: unverändert.
- Stabiler Masterpiece-Branch bleibt als Rückfallpunkt erhalten.

## Ziel
Expedition Amazonas Szene für Szene von funktionalem Canvas-Prototyp zu einer hochwertigen GradeCrew-Adventure-Referenzwelt umbauen.

## Reihenfolge
1. Visual Style Bible
2. Camp Referenzszene
3. Camp prüfen
4. Jeep
5. Wildlife
6. Fluss
7. Station
8. Funkmast/Finale
9. Audio
10. Gesamtpolish + Geräteabnahme

## Nicht verhandelbar
- Kein Level wird nur umgefärbt.
- Keine zentrale Emoji-/Platzhaltergrafik im finalen Look.
- Jede Szene bekommt eigene Stimmung und mindestens einen Wow-Moment.
- Logik aus M1/M2 nicht nebenbei neu erfinden.
- Bewegung/Kollision nur reparieren, wenn echter sichtbarer Fehler auftritt.
- Performance bleibt Produktanforderung.
- Production bleibt unangetastet.

## V0.1 — Style Bible + isolierter Visual-Preview

Status: **erledigt**

Commit:
`6520fd0b9e9fe1185e54698d004919ae2f938da4`

- verbindliche `docs/games/ESCAPE_AMAZONAS_VISUAL_BIBLE.md`;
- eigener Workflow für den Visual-Branch;
- eigener Firebase-Preview-Channel `gradecrew-escape-visual`;
- stabiler Masterpiece-Preview bleibt unverändert.

## V1 — Camp Masterpiece Referenzszene

Status: **implementiert und automatisiert geprüft**

Produktcommit:
`a22fe2d3e69f2702002e2c14ede0d045f7706cc6`

### Sichtbarer Umbau
- Camp besitzt jetzt getrennten Fernhintergrund, Mittelgrund, Spielschicht, Vordergrund und Effektlayer;
- warme Morgensonne und dynamische Lichtstrahlen;
- entfernte Dschungelsilhouette + leichter Dunst;
- organische Campfläche und Pfad statt flacher Ellipse;
- gezeichnetes Expeditionszelt mit Stofftiefe, Abspannseilen und Flagge;
- eigener Feldtisch mit echtem Tablet/Route statt Emoji-Karte;
- Kisten, Kanister, Seil und Versorgungsausrüstung;
- neuer detaillierter MANGO-1 nur für die Camp-Referenzszene;
- Scheinwerfer/Statuslicht und kurzer Start-Bounce;
- Staubstoß beim Jeep-Start;
- dezente Pollen/Lichtpartikel;
- große Vordergrundblätter erzeugen echte Tiefenwirkung;
- zentrale Camp-Emoji-Platzhalter entfernt;
- UI-Shell visuell verfeinert, ohne die Spielstruktur zu ändern.

### Jeep-Wow-Moment
Beim Start nach gelöstem q1:
- Eingaben werden über bestehenden Resolving-Lock sauber blockiert;
- MANGO-1 federt an;
- Licht/Staub reagieren;
- nach 620 ms beginnt die Fahrszene;
- mehrfaches Starten bleibt verhindert.

## Verifikation V1

GitHub Actions:
- Visual Preview Run: `37198971974`
- Produktcommit: `a22fe2d3e69f2702002e2c14ede0d045f7706cc6`
- JavaScript-Syntax: grün
- Expedition-Verträge: **28/28 grün**
- isolierter Build: grün
- Firebase Visual Preview: grün
- `Escape review gates` Run `37198974546`: grün
- `Games Lab Checks` Run `37198974557`: grün, inklusive Browser-User-Flows

Preview:
`https://hausaufgabe-staging--gradecrew-escape-visual-ouj8rvmh.web.app`

Prüfgrenze:
- automatisierte Logik-/Browserprüfung ist grün;
- der visuelle Qualitätsentscheid kann nicht sinnvoll durch Unit-Tests ersetzt werden;
- echter menschlicher Screenshot-/Spieltest des neuen Camps ist jetzt das nächste Gate;
- die übrigen Szenen sind absichtlich noch im alten Prototyp-Look.

## Status getrennt
- auf GitHub gesichert: ja
- automatisiert getestet: ja
- Visual Preview deployed: ja
- manueller Camp-Visual-Test: offen
- Jeep/Wildlife/Fluss/Station/Funkmast visuell umgebaut: nein
- Production: unverändert

## Nächster Schritt

**Camp visuell abnehmen.**

Wenn der neue Qualitätsstandard trägt:
**V2 Jeep-Szene komplett neu aufbauen.**

Wenn das Camp noch nicht stark genug wirkt:
erst Camp weiter polieren — nicht zum Jeep springen.
