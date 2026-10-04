# Expedition Amazonas – Zustands-, Performance- und Softlock-Audit

Stand: 03.10.2026
Branch: `prototype/escape-expedition-masterpiece-v1`
Basis: `17698e8927a4f020a2acd61b566e22894508474d`

Ziel dieses Audits ist **noch keine Reparatur**, sondern eine konkrete, priorisierte Ausgangsliste für die Masterpiece-Roadmap. Änderungen werden anschließend einzeln umgesetzt und jeweils getestet.

## Szenenfluss aktuell

1. `camp`
   - Spieler bewegt sich frei.
   - Tablet öffnet Lern-Gate `q1`.
   - Erfolg vergibt `jeepKey`.
   - Jeep wird danach zugänglich.

2. `jeep`
   - eigene Fahrzeugsteuerung links/rechts.
   - Fortschritt läuft automatisch.
   - bei Distanz 850 Wechsel zu `blocked`.

3. `blocked`
   - Spieler bewegt sich frei.
   - Baum öffnet Seilwinden-Dialog.
   - 3 Treffer im grünen Bereich führen zu `wildlife`.

4. `wildlife`
   - Spieler frei beweglich.
   - Kameramodus separat.
   - Tukan + Capybara fotografieren.
   - Sender öffnet danach `q2`.
   - Erfolg gibt Flusskarte; Dock führt zu `river`.

5. `river`
   - eigene Bootssteuerung links/rechts.
   - Fortschritt automatisch.
   - Distanz 950 führt zu `station`.

6. `station`
   - Generatorfolge lösen.
   - Terminal öffnet `q3`.
   - Erfolg gibt Funkkanal.
   - Tor führt zu `tower`.

7. `tower`
   - Funkmodus.
   - Kanal einstellen.
   - korrektes Signal beendet Run.

---

# Priorität P0 – wahrscheinliche Hänger-/Performance-Ursachen

## P0.1 HUD wird in jedem Animationsframe vollständig neu aufgebaut

`update()` ruft jedes Frame `updateHud()` auf. `updateHud()` setzt unter anderem:
- Missionsliste per `innerHTML` komplett neu;
- Inventar per `innerHTML` komplett neu;
- mehrere Texte/Buttons/disabled-Zustände.

Risiko:
- unnötige DOM-Arbeit 30–60× pro Sekunde;
- Layout/Reflow/Style-Arbeit;
- besonders auf Tablet/älteren Schulgeräten mögliches Ruckeln;
- unnötige Garbage-Collection durch ständig neue Strings/DOM-Strukturen.

**Reparatur M1:** HUD ereignisbasiert aktualisieren; Zeit separat höchstens in kleinem Takt aktualisieren.

## P0.2 Während Seilwinden-Dialog läuft der normale Game-Updatepfad weiter

Der Mainloop ruft bei geöffnetem `winchDialog` weiterhin `update()` auf. `update()` führt in Szene `blocked` auch `updateGeneral()` aus.

Risiko:
- Spielfigur kann logisch hinter dem Dialog weiterbewegt werden;
- `near`/Interaktionszustände ändern sich während Minigame;
- unnötige HUD-/Szenenarbeit während Dialog;
- schwer nachvollziehbare Zustandsrennen.

**Reparatur M1:** Minigame-Update von World-Update trennen; während Modal nur explizit erlaubte Mechanik aktualisieren.

## P0.3 Kein zentraler Transition-Lock

`setScene()` kann direkt aus Updates oder verzögerten `setTimeout()`-Callbacks ausgelöst werden. Es gibt keinen zentralen Zustand wie `transitioning`.

Risiko:
- mehrere schnelle Erfolge/Klicks können mehrere Übergänge planen;
- alter Callback kann nach neuem Zustand noch feuern;
- doppelte Rewards/Dialogaktionen möglich.

Beispiele:
- Winch-Erfolg plant Szenenwechsel per Timeout;
- Lern-Erfolg plant Reward/Close per Timeout;
- Victory wird verzögert geöffnet.

**Reparatur M1:** zentraler SceneManager/TransitionGuard, zunächst minimal im Monolithen.

## P0.4 Mechanikbuttons sind während Erfolgsanimation nicht sofort gesperrt

Bei der Seilwinde kann nach dem dritten Treffer bis zum verzögerten Szenenwechsel erneut gedrückt werden.

Risiko:
- mehrere Timeouts;
- `winchHits` > 3;
- mehrfacher Szenenwechsel.

Ähnliche Prüfung für Lern-/Generator-/Funkaktionen erforderlich.

**Reparatur M1:** `busy/completed`-Guard je Mechanik.

## P0.5 Pointer-/Keyboard-Modi besitzen keinen zentralen Input-Kontext

Input wird über mehrere globale Listener und Flags (`cameraMode`, `radioMode`, Dialogabfrage, Szene) verteilt entschieden.

Risiko:
- schwer testbare Kombinationen;
- zukünftige Mechaniken kollidieren;
- Touch und Keyboard verhalten sich unterschiedlich.

**Reparatur M3:** InputManager. Kurzfristig M1: expliziter Input-Modus `world / vehicle / camera / modal / radio / transition`.

---

# Priorität P1 – Spielfluss / Softlock-Robustheit

## P1.1 Kein sicherer Recovery-Pfad pro Mechanik

Aktuell gibt es überwiegend nur kompletten Restart.

Benötigt:
- Jeep zurück auf sichere Spur;
- Boot zurück auf sichere Spur;
- Kamera verlassen;
- Funkmodus verlassen/neu starten;
- Winch resetten;
- Generator resetten.

## P1.2 Kein Save/Resume

Reload verliert den kompletten Run.

Für Prototyp okay, für längere Referenzwelt problematisch. Später Session-Seed + Szene + Lernzustand + Mechanikzustand reproduzierbar speichern.

## P1.3 Freie Bewegung kennt kaum echte Hinderniskollisionen

`movePlayer()` begrenzt aktuell im Wesentlichen nur die Canvas-Grenzen. Props sind meist rein visuell.

Auswirkung:
- Spieler läuft durch Gebäude/Bäume/Objekte;
- Welt wirkt weniger hochwertig;
- spätere Hotspots/Leveldesign schwerer kontrollierbar.

## P1.4 Tap-to-Move ist nur geradliniges Ziel

Kein Pathfinding und kein Abbruch wegen Hindernissen notwendig, solange kaum Kollisionsobjekte existieren. Sobald echte Props kollidieren, braucht es mindestens sichere Approach-Points bzw. einfache Weglogik.

## P1.5 Inventar rendert nur drei Slots, obwohl mehr Items entstehen können

State kann u. a. `fieldBook`, `jeepKey`, `winch`, `photos`, `riverMap`, `radio` enthalten. HUD zeigt aber nur Indizes 0–2.

Auswirkung:
- wichtige spätere Items können unsichtbar sein;
- Schüler versteht Fortschritt schlechter.

Entscheidung später: echtes begrenztes Inventar mit Verbrauch/Ersetzen oder dynamische Missionsitems getrennt vom Inventar.

---

# Priorität P1 – Lernlogik

## P1.6 Remediation entspricht noch nicht vollständig der Ziel-Leitplanke

Aktuell:
- 1. Fehler: Hinweis;
- 2. Fehler: Erklärung;
- danach direkt Transferaufgabe.

Die festgelegte Zielarchitektur verlangt bei intensiver Remediation zusätzlich aktive Verarbeitung der Erklärung, bevor Transfer folgt.

**Später:** Erklärung → kleine aktive Verarbeitung → neue äquivalente Aufgabe → Progress.

## P1.7 Lernfragen stoppen derzeit vollständig das Spiel

Für 30–35 % Lernen okay, aber visuell momentan klassischer Dialogbruch.

Später:
- stärkere In-World-Einbettung;
- kurze Übergänge;
- weniger Formulargefühl;
- dennoch klare Lesbarkeit/Barrierearmut.

---

# Priorität P2 – Schüler-Sprache

Aktuelle Beispiele, die vereinfacht werden sollen:

- „Dr. Yaras Station ist seit dem Sturm stumm. Auf dem Routentablet liegt der Schlüsselcode.“
- „Dr. Yara wollte zwei Arten dokumentieren. Vielleicht hat sie Hinweise bei den Senderdaten hinterlassen.“
- „Stationscomputer starten“ / „Funkkanal entschlüsselt“
- „Der Ortungssender hat … Wh. 30 % davon sind für die Nacht reserviert.“

Zielstil:

- „Die Station antwortet nicht. Prüfe die Karte.“
- „Fotografiere Tukan und Capybara.“
- „Der Strom ist aus. Starte den Generator.“
- eine Aktion pro Satz;
- technische Begriffe nur, wenn sie fachlich/spielerisch notwendig sind.

---

# Priorität P2 – Grafik / Game-Feel

## P2.1 Wiederverwendetes Dschungeldekor ist zu generisch

`sceneDecor` wird einmal erzeugt und in mehreren Szenen wiederverwendet. Dadurch fehlt jeder Zone eine eigene visuelle Handschrift.

Später pro Szene eigene Layer/Assets/Atmosphäre.

## P2.2 Tiere sind derzeit Emoji-Platzhalter

Funktional für Prototyp, nicht für Highlight-Anspruch.

Später eigene stilisierte Tiere mit einfachen Animationen/Reaktionen.

## P2.3 Spielerfigur ist Platzhalter

Eigene GradeCrew-Games-Figur erforderlich.

## P2.4 Fahrzeuge/Maschinen brauchen Animation und Feedback

Jeep, Boot, Baum, Generator, Funkmast reagieren aktuell überwiegend minimal. Für Highlight-Qualität brauchen sie sichtbare Zustandsänderungen, Bewegung, FX und später Audio.

---

# Priorisierte Reparaturreihenfolge

## M1.1
HUD-Updates vom Renderloop entkoppeln.

## M1.2
Globalen `gameMode` / Transition-Guard einführen.

## M1.3
Winch-Dialog so ändern, dass nur die Windenmechanik weiterläuft, nicht die Welt.

## M1.4
Buttons/Aktionen nach Erfolg sofort sperren und Timeout-Rennen verhindern.

## M1.5
Recovery/Reset pro vorhandener Mechanik definieren.

## M1.6
Danach erst Bewegungs-/Kollisionsverbesserungen.

## M2
Texte systematisch vereinfachen.

## M3
Core/Mechaniken modularisieren.

## M4+
Art Direction, Figur, Mechanik-Polish, Audio, Story, Lernkalibrierung und variable Runs gemäß `ESCAPE_MASTERPIECE_ROADMAP.md`.

---

# Status

- M0.1 Masterpiece-Branch + Plan: **erledigt**
- M0.2 Szenen-/Zustandsinventar: **erledigt**
- M0.3 Softlock-/Performance-Risikoliste: **erledigt**
- Code-Reparaturen: **noch nicht begonnen**
- nächster Schritt: **M1.1 HUD vom Animationsloop entkoppeln und Regressionstest ergänzen**
