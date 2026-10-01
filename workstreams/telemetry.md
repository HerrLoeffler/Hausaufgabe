# Telemetrie und verbindliche Chat-Übergabe

Auftrag vom 01.10.2026; Quelle Nutzer-DOCX WICHTIG GameCrew ChatGPT. Aktuellen main und vorhandene App-Diagnostics/Admin-Log-Tools gelesen. Keine fremden Produktdateien geändert.

Neu: docs/CHAT_CONTRACT.md, ergänzte AGENTS-/Startregeln, konkrete TODO-IDs. shared/telemetry mit sieben streng validierten Ereignissen, deaktiviertem begrenztem Puffer und Classroom-Start-Kennzahl. Messplan priorisiert Unterrichtszuverlässigkeit, Lehrerzeit, KI-Qualität und Spielabschluss; keine pauschale Vollerfassung.

Fünf lokale Verhaltenstests bestanden; CI am zugehörigen Commit prüfen. Kein Produkt-Deploy, keine neue Datenerhebung, kein Collector. Nächster Schritt GC-TELEMETRY-01: Daten-/Backendvertrag und serverseitige Anbindung; anschließend ein vollständiger Beitritt-/Abgabeweg und Adminanzeige. Chat-Regeln sind keine automatische Synchronisation unsichtbarer Gespräche.
