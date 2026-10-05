# GradeCrew Central 0.2.2 – Umsetzung und Nachweise

GC-BRAIN-01, 06.10.2026. Umfang: lokale Plugin-Anbindung, kein Cloud-Worker und kein Production-Deploy.

## Geliefert

- Installierbares privates Plugin gradecrew-central@gradecrew-local, Version0.2.2. Offizielle Codex-CLI bestätigt Installation; installierter Startbefehl tatsächlich ausgeführt.
- Vier MCP-Werkzeuge: gradecrew_open, gradecrew_task, gradecrew_question, gradecrew_answer. Übersicht mit global/thread-Entrypoints und derselben selbstständigen UI-Ressource registriert. Kein eigener Modell-API-Aufruf.
- 50 Aufgaben aus dem bestehenden, datierten GitHub-Snapshot8360bc5f; Funktionen, Anwendungen und Zuständigkeit separat filterbar. Zuordnung ausdrücklich als Vorschlag sichtbar.
- Explizite Standfragen speichern zuerst dauerhaft; erst dann ui/message an das aktive Gespräch. Antworten über model-only Werkzeug zurück in denselben Datenbestand. Keine Codeausführung oder Modellumschaltung aus einer Standfrage.
- Idempotenz, Quellenrevision, atomare lokale Speicherung, unveränderte Release-Farben, geschützte Host-Brücke, sichtbare Ungewissheit bei fehlender Bestätigung. Eingabetext bleibt beim Aktualisieren erhalten. Lesende Aktualisierung alle15s während offener Fragen, keine Modellaufrufe.
- Vorhandene lokale Daten gesichert (.local/before-plugin-0.2.1.json, nicht versioniert). Alter Dienst PID27261 anhand Kommando UND Arbeitsverzeichnis verifiziert und gezielt beendet. Neues Paket startet den kompatiblen lokalen Dienst bei Bedarf; bestehende fremde/alte Dienste werden nicht überschrieben.

## Prüfung

- Baseline3/3 grün. Final8/8 Node-Verhaltenstests grün: Bestand, Rechte, doppelte Fragen, Quellenkonflikte, Neustart, Antwort, stdio-MCP-Rundreise, Host-Origin und Timeout, Klassifikation, Verbindungswiederaufnahme.
- Zusätzlich8/8 Regressionen in einer simulierten DOM-/Host-Umgebung. Keine visuelle Browserabnahme. Reproduzierte ursprüngliche Fehler zuerst rot, dann grün.
- Zwei unabhängige Prüfer haben denselben finalen Codekandidaten0897050384769162db4e9bcc2e46a0704f58c87d ohne verbleibende konkrete Befunde abgeschlossen. Umfang: Funktion/Tests und Sicherheit/Randfälle. Kein vollständiger GradeCrew-Sicherheitsaudit.
- Reparaturhistorie2/3: (1) Formularverlust, doppelte Nachrichten nach Timeout und dauerhaft gecachte Verbindung behoben; (2) klare Ablehnung vor dem Speichern von unklarem Übertragungsergebnis getrennt. Versuchszähler nicht zurückgesetzt, keine bezahlten Provider-Aufrufe.
- Installiertes Paket0.2.2 über tatsächliche mcp.json und Launcher geprüft: initialize, tools/list, gradecrew_open und resources/read erfolgreich;50 Aufgaben,0 bestehende Fragen, UI-Ressource16088 Zeichen. Kein Testdatensatz in Martins echtem Bestand angelegt.

## Verbleibende Abnahme

Die Registrierung als global/thread-Entrypoint und der Protokollweg sind implementiert. Der echte aktuelle Chat-Host wurde noch nicht visuell/Ende-zu-Ende mit Panelnachricht und Modellantwort geprüft. Die bisherige Browserrichtliniensperre wurde nicht über einen anderen Automationsweg umgangen.

Plugin im Client neu laden (gegebenenfalls Desktop-App neu öffnen), dann GradeCrew Central auswählen bzw. „Öffne GradeCrew Central“ schreiben. Falls ein bestehender Chat die neu installierten Werkzeuge noch nicht lädt, neuer Chat mit GradeCrew-Plugin; Funktion und Original-Task-ID beibehalten. Erst wenn das Panel erscheint, eine Standfrage senden und Antwort dort abnehmen. Kein Erfolg der echten Host-Rundreise aus der Installation ableiten.

Aufgaben sind derzeit ein datierter Snapshot. Aktualisieren lädt gemeinsame lokale Fragen/Antworten und den vorhandenen Katalog, nicht automatisch neues GitHub-main. Cloud-Ausführung bei ausgeschaltetem Mac, automatische Fachchat-Weiterleitung aus dem Plugin und Codearbeitsaufträge über das Panel sind offen. Bestehende explizite Koordination im Hauptchat bleibt nutzbar.

## Start / Pflege

Kein separater Download für Martin erforderlich: lokal installiert und aktiviert. Der MCP-Launcher startet den lokalen Dienst. Der Mac muss laufen. Öffnen/Sortieren verwendet keine Modell-API; Fragen/Antworten nutzen den aktiven Chat und dessen Kontingent.

Entwicklung: `python3 plugin/package.py` erstellt nur erlaubte Paketdateien unter .distribution; private .local-Daten werden nie kopiert. Danach `codex plugin add gradecrew-central@gradecrew-local --json`. Veränderte Pakete erhalten eine neue Version. Zielquelle und Datenpfad sind lokal; keine Veröffentlichung in einem öffentlichen Verzeichnis.

Referenzen: https://developers.openai.com/plugins/build/extensions ; https://developers.openai.com/plugins/build/app-quickstart ; https://developers.openai.com/plugins/build/plugins ; verlinkte MCP-Apps/OpenAI-Extensions-Protokollspezifikationen.
