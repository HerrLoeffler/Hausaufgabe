# GC-BRAIN-01: echter Chat-Verbindungstest

06.10.2026. Fortsetzung derselben Aufgabe; Plugin-Reparaturhistorie bleibt 2/3. Keine Provider-Aufrufe, neue Budgetreservierung oder Produktänderung.

## Befund

- Lokaler Checkout vor Beginn sauber auf 04cb7a6; Remote-Aufgabenbranch frisch auf 2952717f geprüft. Main-Regeln, Status, TODO und Chat-Vertrag gelesen. Jüngster Development Status 37391289398 / Job 112036708547 erfolgreich; Warnungen über unregistrierte PRs bleiben, kein überlappender Produktcode in diesem Test.
- Aktuelle Werkzeugliste enthält keine gradecrew_open/task/question/answer-Werkzeuge. Die frühere CLI-Installation beweist deren Einbindung in dieses Gespräch nicht. Die früher empfohlene Neulade-Anweisung ist daher kein verifizierter Lösungsweg.
- Die alte eingebettete Zentrale übermittelte Widget-Auswahl GC-ANALYTICS-01, Kernfunktionen, gpt-6-luna, check. Das ist Kontext, keine eingegangene Arbeitsnachricht. Der Text im Screenshot ist kein Auftrag für Analytics in diesem Test.
- Computersteuerung verweigert den Zugriff auf com.openai.codex ausdrücklich aus Sicherheitsgründen. Kein Umgehungsversuch. Den echten Sende-/Bestätigungsdialog muss Martin selbst bedienen.
- Offizielle Plugin-Quickstart-Dokumentation unterscheidet lokale MCP-Prüfung von ChatGPT-Anbindung über erreichbaren HTTPS-Endpunkt und installierte Plugin-Verbindung. Es wurde kein öffentlicher Tunnel und keine Freigabe lokaler Projektdaten eingerichtet.

## Eng begrenzter Test

Vorhandenen Folgenachricht-Weg der Chat-Ansicht verwenden. Eine einzelne Aufgabenkarte für GC-BRAIN-01, Testkennung GC-BRAIN-01-CONNECTION-20261006-A; Nachricht nur bei explizitem Klick, mit Request-ID und erhaltener Testnachricht. Kein Modellwechsel, Fachchat-Auftrag oder Deployment. Ergebnis wird erst nach tatsächlichem Nachrichteneingang in die Kartendaten geschrieben und erneut im Chat eingeblendet. Das ist zunächst eine neue Darstellung derselben Aufgabenkarte, keine nachgewiesene Live-Aktualisierung des alten Frames und kein Plugin-Nachweis.

Quelle: inline/gradecrew-verbindungstest.html, aktive Chat-Kopie unter /Users/martin/.codex/visualizations/2026/10/05/01a10df6-736b-7a62-bd38-2724cf254c2e/gradecrew-verbindungstest.html.

Prüfung: JavaScript-Syntax, eindeutige Element-IDs und kleine simulierte Interaktionsprüfung: kein Start beim Laden, eine ausdrückliche Sendung, Doppelklickschutz, fehlende Host-Methode, Rückantwortanzeige. Kein echter Host-Empfang bisher. Keine globale UI-/Plugin-Abnahme.

Nächster Schritt: Martin klickt den sichtbaren Testknopf und bestätigt den Host-Dialog. Empfangende Runde prüft Testkennung/Request-ID, schreibt eine echte Antwort in gct-result (JSON mit HTML-sicheren Zeichen), zeigt dieselbe Karte erneut und hält Nachrichteneingang getrennt von visueller Bestätigung fest. Erst danach Ausbau entscheiden. Release bleibt branch_only.
