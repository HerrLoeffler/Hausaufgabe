# Expedition Amazonas — lokale Testfassung

Start: Doppelklick auf **Expedition starten.command**. Verwendet das bereits installierte Unreal5.8 als Standalone-Spiel, ohne den Editor zu bedienen. Noch kein unabhängiges App-Store-/Mobile-Paket.

WASD/Pfeile bewegen, E untersucht den nächstgelegenen Gegenstand. I öffnet den Rucksack, Esc das Menü. Start mit Taste1(Prozent) oder2(Wortarten). Antworten mit1–4. Alle Dialog-/Rätselbuttons perTab wählen und mitEnter bestätigen; Auswahl hat goldeneUmrandung. Mausroute ist implementiert, automatische nativeMausprüfung bleibt unbestätigt. Touchflächen sind angelegt, aber noch nicht am physischenGerät geprüft.

Prozent oder Wortarten wählen. Erst Feldnotizen und Kartenhälften im Camp finden, dann Karte drehen/verbinden und passende Route wählen. Am Ufer Seil und Kurbel holen, Hinweise prüfen, an Steinanker und Brückenring befestigen, Winde drehen. In der Station Betriebsnotizen, Sicherung und Schaltplan prüfen, Strom zum Funkgerät leiten und Signal senden. Kein Countdown.

Lokale Beispieldaten, acht Lernaufgaben, drei Umgebungsrätsel. Echte GradeCrew-Themengenerierung/Fragenanbindung und serverseitige Bewertung sind noch nicht implementiert. Lernquote und Erstspielzeit noch nicht durch Nutzertest nachgewiesen.

## Wo liegt was?

- Source/: wiederherstellbarer C++-Code und Spielregeln.
- Tools/create_world.py: erzeugt eigene Unreal-Karte und Material. Art entsteht aus eigenem Code in ExpeditionArt.cpp mit Unreal-Grundformen.
- Content/: lokal generierte Unreal-Dateien, aus dem Code/Skript wieder erzeugbar.
- Binaries/Intermediate/: lokale Buildprodukte, nicht Git-Quelle.
- Saved/SaveGames/: lokaler Demo-Spielstand; UE kann Plattformordner verwenden.
- Reports/: echte Screenshots und Prüfergebnisse.
- Production/: Auftrag, Grenzen und Wiederaufnahme.

Quellcode wird per Git gesichert. Der normale Build benötigt Unreal5.8 und Xcode auf diesem Mac. Keine Zusatzbibliotheken, Provideraufrufe oder Online-Veröffentlichung.
