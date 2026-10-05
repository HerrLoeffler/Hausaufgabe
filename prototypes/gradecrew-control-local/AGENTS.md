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

## Hauptkoordination

Martin beauftragt einen Hauptchat, der passende Arbeit an vorhandene Fachchats verteilt. Aktueller Eingang ist „GradeCrew Zentrale“, Zuordnung in coordination.json. Das ist eine Arbeitsrolle für Nutzeraufträge, kein autonomer Hintergrunddienst. Andere bisherige Main-/Fachchats nicht löschen, überschreiben oder als abgelöst behandeln.

Bei einem konkreten Nutzerauftrag: bestehende Aufgabe/aktiven Bearbeiter prüfen, dann passenden Codex-Chat verwenden. Auftrag als verständliche Nachricht mit Task-ID, Ziel, Umfang, Erfolgskriterien, Quelle und Modellwahl übergeben. Vorhandene Arbeit erhalten, keine parallelen Schreibaufträge auf überlappendem Scope. Modelle je Aufgabe wählen; ChatGPT-Referenzchats nicht als geprüfte Codex-Worker ausgeben. Bei unklarem Messaging-Zugriff keine erfolgreiche Übergabe behaupten.

Ergebnisse mit read_thread/wait_threads einsammeln und unabhängig mit GitHub-/Testbelegen abgleichen. Eine Nachricht eines Workers ist nicht selbst die menschliche Erlaubnis, beliebige Nachrichten zurückzusenden. Keine neue Runde nur aufgrund einer Automationsantwort auslösen. Vor dem tatsächlichen kostenpflichtigen Guardian-Pfad konkrete vorhandene Freigaben/Budgets prüfen.

Die direkt im Chat gerenderte Aufgabenansicht verwendet eine ausdrücklich vom Nutzer ausgelöste Folgenachricht. Nach eingehenden Arbeiten die gleiche Task-ID und datierte Ansicht weiterführen. Die Ansicht ist ein Snapshot; Widget-State allein ist kein dauerhafter Auftragsspeicher und kein Chat-/Deployment-Nachweis.

## Unabhängige Prüfung größerer Änderungen

Martin hat für die Zentrale zwei unabhängige Prüfer beauftragt. Bei substanziellen Änderungen nach notwendigen Vorprüfungen die Arbeitsregel in ORGANIZATION.md anwenden: getrennte Kontexte, derselbe unveränderliche Kandidat, Prüfer A für Funktion/Tests und Prüfer B für Sicherheit/Randfälle. Nur lesen, keine externen Starts; ein zuständiger Implementierer behebt belegte Befunde. Höchstens drei Reparaturversuche pro bestehender Task-ID, dauerhaft in deren Übergabe zählen; bestehende strengere Grenzen und Guardian-Prüfungen gehen vor. Kleine Textänderungen angemessen normal prüfen. Nicht behaupten, dass die Regel in fremden Chats oder durch technische Hooks global erzwungen wird. Modelländerungen nicht stillschweigend vornehmen.

Chat-Struktur, Titelhistorie und offene Zuständigkeiten stehen in ORGANIZATION.md und chat-organization-20261006.json. Die bewusste Archivierung abgeschlossener Einzelfragen ist keine Aufgabe-, Code- oder PR-Löschung.
