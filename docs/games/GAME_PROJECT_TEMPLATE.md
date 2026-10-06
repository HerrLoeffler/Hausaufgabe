# Ein Spiel beginnen: Fragen und Produktionsvorlage

Stand 06.10.2026 · GC-GAMES-PIPELINE-01. Zuerst bekannte Antworten aus dem Projekt übernehmen. Martin bekommt höchstens drei zusammenhängende Rückfragen auf einmal; unwichtige Details werden später entschieden. Kein neuer Spielauftrag wird allein durch diese Vorlage ausgelöst.

## Sechs Einstiegsfragen

1. **Für wen und wozu?** Alter, Lernziel, Vorwissen; woran erkennen wir Lernen statt bloß richtiges Klicken?
2. **Was macht der Spieler immer wieder?** Kernhandlung → Herausforderung → verständliche Rückmeldung → Belohnung. Was macht daran Spaß? Wie lange dauert eine Runde?
3. **Wo läuft es?** Browser ohne Installation oder native App; konkrete schwächste Geräte, Touch/Tastatur, Hoch-/Querformat, Offlinebedarf und verfügbare Installationsrechte.
4. **Wie soll es wirken?** Ein Leitbild oder wenige Bildreferenzen, Perspektive, Stimmung, 2D/3D, gewünschte Figuren. Was daran gefällt konkret, was ausdrücklich nicht?
5. **Was ist die kleinste gute Version?** Eine Szene/ein Level, eine Mechanik, eine Lernaufgabe; welche Ideen bleiben später? Welche vorhandenen Systeme und Assets passen?
6. **Was begrenzt uns?** Aufwand, erlaubte Werkzeuge, vorhandene Lizenzen, Download/Startzeit und Gerätebudget. Keine kostenpflichtigen Anbieter aus einer unklaren Antwort buchen.

Danach nur relevante Vertiefung: Speichern, Mehrspieler, Sprachen, Lehrkraftansicht, Barrierefreiheit, Audio, Datenschutz, reale Lernanbindung. „Indie“ beschreibt keine technische Plattform und entscheidet nicht die Engine.

## Pro Spiel: PLAN.md als Einstieg

Vorgesehene Ablage bei einem später autorisierten Spiel: `games/<game-id>/production/`. Diese Vorlage legt noch kein Spiel an.

```text
PLAN.md                 Ziel, Umfang, Engineentscheid, nächste priorisierte Pakete
ART_DIRECTION.md        Leitbild, Quellen, Palette, Kamera, Assetregeln
TASKS.md                Paket-IDs, Eigentümer, Abhängigkeiten, Belege und Farben
HANDOFF.md              aktueller Build/Commit, offene Punkte, nächster Schritt
```

Kleine Spiele dürfen dies in einer Datei bündeln. Code, Assets und Tests bleiben an ihren tatsächlichen Projektpfaden; keine zweite Kopie des Quellcodes im Plan.

### PLAN — ausfüllen

- Spiel-ID / bestehende Task-ID / Hauptchat:
- Zielgruppe und überprüfbares Lernziel:
- Kernhandlung, Sieg/Fehler/Hilfe und Rundenlänge:
- Verbindliche Zielgeräte und Bedienung:
- Engine mit Version; Alternativen und begründeter Entscheid:
- Kleinster spielbarer Abschnitt; ausdrücklich später:
- Vorhandene Lernverträge und erlaubte lokale Testdaten:
- Budgets für Startzeit, Größe, Speicher und Frametimes auf benanntem Gerät:
- Abnahmekriterien: konkrete beobachtbare Ergebnisse, keine bloße KI-Note:
- Bekannte Fakten / Annahmen / offene Entscheidungen:
- Aktueller Commit/Build und priorisierte Pakete mit Abhängigkeiten:

### ART_DIRECTION — Referenz wird zur Produktionsanweisung

- Leitbild und Originalquelle; Urheber/Nutzungsrechte, nur Inspiration oder nutzbares Asset?
- Übernehmen: z. B. Kamerahöhe, große Silhouetten, kühler Hintergrund, warme Interaktionspunkte.
- Nicht übernehmen: konkrete fremde Figuren, Logos oder ungeklärte Bilddateien als Spieltexturen.
- Eigene Palette mit semantischen Rollen: Hintergrund, Weg, Gefahr, Interaktion, Lernfeedback. Farbe immer zusätzlich mit Form/Text kennzeichnen.
- Perspektive, Maßstab, Lichtstimmung, Materialstil, Detailgrad, UI-Lesbarkeit und Audiocharakter.
- Figurenblatt: Front/Seite/Rücken, Proportionen, Animationen; unklare Ansichten als Entwurf.
- Testansichten: tatsächliche Spielkamera, ungünstige Lichtlage, kleines Display, teilweise verdeckte Figur.
- Referenzasset: Quelle, Exportpreset, Hash, Engineimport und Reimportnachweis.

Pinterest kann Bilder auffindbar machen; die Originalquelle bleibt maßgeblich. Eine Bildreferenz liefert noch keine begehbare Szene, Kollision, Animation oder fertige Assetlizenz. Zuerst Blockout und Kamera, danach Details. Für Modellreferenzen kann gleichmäßiges Licht sinnvoll sein; finales Szenenlicht wird separat gestaltet.

### TASK — Übergabe an genau einen Bearbeiter

```text
Task-ID / Spiel-ID:
Ziel und beobachtbares Fertig-Kriterium:
Basiscommit / Branch / isolierter Checkout:
Eigentümer und erlaubte Dateien/Assets:
Abhängigkeiten; Eingaben/Ausgaben/Schnittstellen:
Benötigte Ausschnitte aus PLAN und ART_DIRECTION:
Modellwahl und Begründung:
Aufwands-/Versuchslimit; bisherige Versuche:
Prüfung: Funktion, Fehlerfall, Bild-/Gerätenachweis soweit betroffen:
Nicht im Auftrag:
Rückgabe: Commit/PR, Tests mit Ergebnis, Artefakt, Restfehler, nächster Schritt:
```

### HANDOFF — statt neuen Chat einweisen

Stand mit Datum; verbindlicher PLAN; offene Task-IDs; echte Commit-/PR-/Buildlinks; noch laufende Aufträge mit Chat-ID; letzter abgeholter Ergebnisstand; Eigentümer und Dateibereiche; bestehende Versuche/Budgets; ungelöste Fehler; noch fehlende Nutzerabnahmen; exakt nächster sicherer Schritt. Ein Nachfolger liest zuerst aktuelle Repository-Regeln und prüft laufende Vorgänge, bevor er erneut startet.
