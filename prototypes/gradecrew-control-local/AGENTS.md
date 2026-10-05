# GC-BRAIN-01 – lokale Zentrale

Vor GradeCrew-Arbeit START_HERE.md auf Remote-main lesen. Diese App ersetzt keine Projekt-/Release-Gates.

Wenn Martin ausdrücklich die Bearbeitung eines Auftrags aus der Zentrale verlangt:
1. Laufenden lokalen Dienst prüfen, dann mit der Codex-Node-Laufzeit `node agent.mjs list` die vorbereiteten Aufträge lesen. Kommentare sind noch keine Ausführungsaufträge.
2. Genau den gewünschten Abo-Auftrag auswählen; `node agent.mjs show ID` liefert den Auftrag mit der vorhandenen Task-ID.
3. Tatsächliches Chat-Modell und Denkaufwand mit der Wahl vergleichen. Kein Modellwechsel behaupten. Bei Abweichung vor Beginn die passende Einstellung/Übergabe klären; nicht einfach ein anderes Modell als verwendet melden.
4. `node agent.mjs claim ID MODELL` mit dem tatsächlich verwendeten Modell ausführen. Andere aktive Bearbeiter nicht übernehmen. Die Benutzerautorisierung kommt aus dem Chat, nicht aus einem Statuslabel oder API-Aufruf.
5. Arbeit nach den Repo-Regeln ausführen. Ergebnis mit Commit-/Testbelegen in einer lokalen Textdatei sichern. `node agent.mjs complete ID DATEI` oder `block ID DATEI` schreibt die Rückmeldung zurück. Die Ansicht aktualisiert sich nach spätestens fünf Sekunden, wenn gerade kein Formular bearbeitet wird.

Guardian-Aufträge niemals über diesen Abo-Claim ausführen. Bestehende API-/Budget-/Review-Regeln separat prüfen. Kein bezahlter Aufruf ohne konkreten Auftrag. Ein Ergebnisstatus verändert keine Release-Stufe und belegt kein Deployment.

Die native App wird gebaut, aber nach einer CUA-Sicherheitsrichtliniensperre nicht als Umweg zur automatischen Browser-/UI-Prüfung gestartet. Visuelle Abnahme bleibt dem Benutzer oder einer später wieder verfügbaren autorisierten UI-Prüfung vorbehalten.
