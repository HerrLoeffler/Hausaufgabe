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


## V2 — Retro-Handheld-Overworld Hard Rebuild

Neue verbindliche Produktentscheidung:
**Alle Amazonas-Szenen folgen ab jetzt einer originalen Retro-Handheld-Top-Down-Overworld-Sprache.**

### Implementiert

Produktcommits:
- `1e6ad0dbb25ceafcbd560907f208f89acbf13d06` — Jeep-Hard-Rebuild
- `be44681dfc593a28b01a315cebaa2e4d81c2f45d` — gesamte Amazonas-Welt auf gemeinsame Retro-Sprache umgestellt
- `93552e6466e4907eaa4fed786c1f660b7d4b9645` — Syntaxkorrektur nach globalem Renderer-Umbau

Jeep:
- echte deterministic course map mit Stein/Matsch/Ast/finalem Baum;
- Hindernisse bewegen sich aus Fahrtrichtung von oben auf MANGO-1 zu;
- Matsch hält den Jeep tatsächlich an;
- Befreiung aktiv über ↑/W bzw. Touch-Pfeil;
- Stein/Ast erzeugen Impact + Tempoverlust;
- finaler Baum nähert sich sichtbar und führt in dieselbe pixelige Blockade-/Winden-Szene;
- großer alter `Piste ...`-Web-HUD entfernt;
- eigener Retro-HUD;
- komplett neuer MANGO-1 mit Fahrer-Gesicht;
- Explorer besitzt nun ein klar lesbares Gesicht.

Globale Welt:
- Camp als Top-Down-Tile-Camp;
- Wildlife mit gezeichneten Tier-Sprites statt Tier-Emojis;
- Fluss als Wasser-/Ufer-Tile-Welt;
- Flussfelsen bewegen sich jetzt ebenfalls aus Fahrtrichtung auf das Boot zu;
- Boot mit sichtbarem Explorer;
- Station als echte Retro-Forschungsstation mit Generator/Terminal;
- Funkmast als Retro-Technikszene;
- Kamera-Overlay in derselben visuellen Sprache;
- Canvas auf pixelated scaling;
- Game-Shell kantiger und kompakter.

### Lokale statische Verifikation

Der aktuelle Head wurde zusätzlich außerhalb von GitHub Actions geprüft:
- `app.js` JavaScript-Syntax via V8-Parser: **grün**;
- Testdatei-Syntax via V8-Parser: **grün**;
- V2-Verträge für Course, Hindernisrichtung, Matsch-Recovery, Roadblock, Gesichter und globale Retro-Szenen: **vorhanden**.

### GitHub-Actions-Blocker

Aktueller Head:
`93552e6466e4907eaa4fed786c1f660b7d4b9645`

Die drei GitHub-Actions-Jobs starten derzeit nicht bis zum ersten Step:
- Visual Preview;
- Escape review gates;
- Games Lab Checks.

GitHub liefert für die Jobs:
- `conclusion: failure`;
- `steps: null`;
- `logs_url: null`.

Mehrfache Re-Runs zeigen dasselbe Verhalten. Damit gibt es aktuell **keinen ausgeführten roten Code-Test**, sondern einen CI-Startblocker vor Checkout/Tests.

Folge:
- V2 ist auf GitHub gesichert;
- V2 ist lokal/statisch syntaktisch geprüft;
- V2 ist **noch nicht als Staging deployed zu markieren**;
- der bisherige Visual-Preview-Link zeigt bis zu einem erfolgreichen Deploy weiterhin den älteren V1-Stand;
- Production unverändert.

## Nächster Schritt

1. CI/Actions wieder zum tatsächlichen Start bringen;
2. komplette V2-Suite + Browser-Flows ausführen;
3. Visual Preview deployen;
4. echten manuellen Jeep-/Gesamtwelt-Test durchführen;
5. danach gezielt sichtbare Schwächen polieren statt wieder die Art Direction zu wechseln.
