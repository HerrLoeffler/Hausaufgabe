# GC-GAMES-COST-01

Stand 2026-10-02. Branch `fix/escape-tutor-cost-guards`, Basis `0f89995ce820db313e0eee88d316fbca6dd65b1f`.

Beim übergreifenden KI-/Kostencheck gefundene Fehler im bestehenden optionalen Tutorpfad:
- Gleichzeitige identische Fragen konnten mehrere kostenpflichtige Bridge-Aufrufe auslösen.
- Cache war nur an Frage-ID und normalisierten Wunsch gebunden; Bearbeitung mit gleicher ID lieferte alte Hilfe. Die Normalisierung verschluckte zudem mathematische Operatoren und Groß-/Kleinschreibung; Cache-Texte bewahren jetzt diese Bedeutungsunterschiede.
- Bridge-Fehler/-Hänger erreichten den vorgesehenen lokalen Fallback nicht.

Korrektur: deduplizierte laufende Anfragen, an Inhalt/Revision/Locale gebundener auf 100 Einträge begrenzter Sitzungscache, 8-Sekunden-Timeout mit Abort-Signal, vorhandene Erklärung bei Fehler, Abbruch/Cache-Sperre beim Sitzungsreset. Eingabe-/Antwortgrenzen für den externen Pfad; keine neue Telemetrie und keine dauerhafte Speicherung.

6 lokale jsdom-Verhaltenstests grün. Eigene CI eingerichtet. Release-Stufe zunächst branch_only; nicht deployed, keine reale Tutor-KI aktiviert.

Der serverseitige Gateway muss weiterhin Auth, Budgets, Qualität und Deduplizierung erzwingen; Browsergrenzen ersetzen diese nicht. Bestehende Spiele-/Security-Integration unverändert. Nächster Schritt: CI prüfen, in aktuellen Escape-Branch integrieren, danach Geräteabnahme.

