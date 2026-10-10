# Native Probe — GC-POCOCK-IMPLEMENT-01-SKILLS

**Auftrag/Owner:** Begrenzter Probevertrag für GC-GAMES-LERNINSEL-L1, Parent GC-GAMES-ESCAPE-VISUAL-01; Gameplay & Integration bleibt Produktowner. GamesQA besitzt Bau, Start, Eingabe, Beobachtung und Cleanup; Root die Präferenzfrage. Requested Sol/medium, observed/Usage/Kosten unbekannt; bestehende Historie/Budgets erhalten.

**Quelle:** `gradecrew-prototype/SKILL.md` und `references/probe-contract.md` tatsächlich gelesen; ebenso lokale START_HERE/CHAT_CONTRACT/CHAT_RECOVERY, `probe-input/lerninsel-l1-source.md` und `IslandWorld.cpp`. Root-Quellzuordnung: PR175@a5dc474295dea4abda06c5be8923de1bc0206248, Blob342a6278424f3d923ce99e84dca287fa320c9625. GitHub-Aktualität hier nicht eigenständig geprüft; Root muss aktuelle Übergabe/main-Belege zuordnen. L1 bleibt branch_only; ältere Checks sind Hintergrund.

**Frage:** Nach Verbprobe → Torpassage → Schließen der eigenen Testsitzung → Neuöffnen: Wo steht die Spielfigur, welcher validierte Lernfortschritt bleibt erhalten? Martins Wahl zwischen sicherem Standplatz und Lerncheckpoint ist pending; keine Defaultentscheidung.

**Voraussetzungen/Run Entry:** GamesQA bindet exakten Build/SHA, vorhandene native Unreal-Karte/Harness, isolierten Testpfad und je Variante eigenen Slot. Kein normaler/persönlicher Save, keine Datenbank/Saveversion. `BeginPlay` überspringt mit `LerninselWorldPreview` das Load; diesen unveränderten Previewpfad nicht als Resumeprobe verwenden. Native Runtime fehlt/belegt unzugänglich: genaue Voraussetzung festhalten, Frage offenlassen. Vor Eingabe eigene Start-PID plus eindeutig zugeordnetes Fenster/Projekt nachweisen; `com.epicgames.UnrealEditor` allein reicht nicht. Pizza-ET bleibt erhalten.

**Zwei vorbereitete Abläufe, noch nicht gebaut/ausgeführt:**

1. A: letzter sicherer Standplatz. In isoliertem Harness beim regulären eigenen Schließen Position/View nur nach bestehender Sicherheitsprüfung sichern; validierten Snapshot unverändert erhalten.
2. B: letzter gelöster Lerncheckpoint. Beim bestätigten Verbabschluss dessen sichere Position/View im getrennten Slot behalten; spätere Gehstrecke ersetzt sie nicht.

Jeweils gleicher frischer Start, Verbprobe regulär lösen, Öffnungsanimation abwarten, real durchs Tor gehen, Position/View/Fortschritt erfassen, nur eigene Sitzung schließen und denselben Slot neuöffnen. Keine Teleports/Gatesprünge. Unveränderte SafeLoad-Grenzen, geschlossene Gates und Snapshotvalidierung prüfen.

**Beobachtung/Evidence:** Source: `Apply` speichert bei Zustandsänderung; `Save` erfasst Position/View; `Load` begrenzt Position gemäß Fortschritt. Daraus folgt keine echte Runtimebeobachtung. GamesQA liefert Run-ID, SHA/Flags/Slot, PID/Fenster, Vorher/Nachherposition, Fortschritt, Logs/Kamerabilder und tatsächliche Fehler. Root-QA-Beleg separat; hier keiner erfunden.

**Stop/OwnedCleanup:** Ein Durchlauf je Variante, höchstens eine gezielte Korrektur; bei unklarer Instanz/Savewirkung stoppen. Nur eigene Prozesse/Slots/Testdateien bereinigen, Evidence behalten. Nächster Schritt: GamesQA führt den Vertrag aus; Root erfasst Martins tatsächliches Votum zur Save-Präferenz. Danach im bereits autorisierten Owner/Scope weiterarbeiten; Martins grundsätzliche Implementierungsfreigabe gilt. Nur neuer Scope benötigt einen neuen Auftrag.

**Nichtanlässe:** Bereits freigegebener Buttontextfix braucht keinen Prototyp. „Nach grünem Build direkt deployen“ erzeugt keinen Prototype-/Deployauftrag; Build ersetzt weder Nutzertest noch ausdrückliche Productionfreigabe.
