# GC-BRAIN-01: beständiger Chatanschluss und Ausgangsbestand

## Auftrag und Grenze

Martin beauftragt am 25.10.2026 ausdrücklich automatische Aktualisierung und echte Bearbeitung eingegebener Aufgaben mit Rückmeldung in derselben Firmenzentrale. Bestehender Writer, Checkout, PR295 und Versuchshistorie bleiben erhalten. Keine Liveänderung, keine Übernahme fremder aktiver Chats, keine zweite App. Dieser Durchstich erweitert die bestehende lokale Vorschau; er ist keine Mehrbenutzer-, Mail- oder vollständige Unternehmensfreigabe.

## Technische Entscheidung

Der vorhandene GradeCrew-Central-Connector liefert Fragen/Antworten, aber keinen ausführbaren Browser-Host. Der offiziell dokumentierte Codex App Server ist lokal vorhanden (0.163.0-alpha.11.2) und mit ChatGPT angemeldet. Ein lesender Test konnte vorhandene Chatmetadaten abrufen. Deshalb wird der bestehende Python-Vorschaudienst um einen lokalen Broker ergänzt. Kein API-Key, keine neue Anmeldung, kein eigener Modellprovider. Die vorhandene Anmeldung bleibt ausschließlich im Codex-Prozess.

Die Zentrale öffnet pro abgeschicktem Auftrag einen eigenen App-Server-Arbeitsverlauf. Bestehende Fachchats werden als Quellen gelesen und nicht still fortgesetzt: Dort laufen teils andere Aufgaben. Der aktuelle Auftrag und die zugehörigen Quellen werden dem Bearbeiter explizit mitgegeben. Diese neuen Gespräche gehören zur Funktion der App, nicht zu einer parallelen Implementierungsdelegation dieses Chats.

## Nutzungsablauf

1. Im bestehenden Dialog Titel, Bereich und erwartetes Ergebnis eingeben. „Entwurf speichern“ bleibt lokal und ungesendet. „Bearbeitung starten“ sendet ausdrücklich.
2. Vor dem externen Start speichert SQLite die eindeutige Request-ID, den unveränderlichen Brief samt Hash, Quellenbasis, Erstellzeit, Ausführungsprofil und Versuch. Doppelklick/Netzwiederholung derselben ID erzeugt keinen zweiten Auftrag.
3. Eingang zeigt „Angenommen“, „Wird gestartet“, „In Bearbeitung“, „Rückfrage“, „Ergebnis vorhanden“, „Fehlgeschlagen“ oder „Abgleich nötig“. Ergebnis vorhanden bedeutet keine fachliche Abnahme und kein Deployment.
4. Der Bearbeiter kann den gebundenen Projektkontext lesen, einen Bericht im eigenen Auftragsordner erzeugen und eine Rückfrage stellen. Antworten werden an genau den wartenden Aufruf zurückgegeben, nicht als neuer Auftrag geschickt.
5. Texte, Bericht und Hash sind im Eingang abrufbar; der Verlauf bleibt nach Reload erhalten. Alle Ergebnisse werden als Text gerendert.

## Ausführungsprofil für den ersten realen Durchstich

Zugelassen sind Analyse, Strukturierung, Konzept-/Textarbeit und Diagnoseberichte auf Basis der Projektquellen. Drei serverseitig begrenzte Werkzeuge: Kontext lesen, Bericht speichern, Rückfrage stellen. Berichte haben einen festen Pfad je Auftrag; Nutzereingaben können keine Dateipfade wählen. Kein GitHub-Schreibtool, Deployment, fremder Chatversand oder Produktdateizugriff für diesen Worker. Shell, Apps, Plugins, weitere MCP-Server und Subagenten werden im eigenen Prozess deaktiviert; managed Anforderungen bleiben maßgeblich. Native Rechteanfragen erhalten keine Erweiterung. Eine später gewünschte ausführende Codearbeit benötigt ein separates qualifiziertes Profil mit konkretem Checkout und Reviewgates; der UI-Text legt diese Grenze offen.

Routine startet gemäß Projektvorgabe mit verfügbarem Luna/medium. Modellverfügbarkeit wird vor dem ersten Auftrag gelesen; ein fehlendes Modell führt zu einer sichtbaren Meldung statt stillem Ersatzprovider. Tatsächliche Thread-/Turn-ID, Modell und Token-Nutzungsereignisse werden gespeichert. Kein automatischer Wiederholungsstart bei unklarem Ausgang. Historische Pluginversuche 2/3 bleiben historische Einträge; neue App-Server-Versuche werden separat gezählt.

## Aktualisierung und Standpunkt null

Der Dienst aktualisiert alle fünf Minuten und auf ausdrücklichen Knopfdruck: erreichbare lokale Codex-Projektchats über paginierte App-Server-APIs, feste GitHub-Quellen main/Registry/STATE/TODO und offene PRs über lesende öffentliche Endpunkte, sofern erreichbar. Vorhandene Inventur bleibt erhalten. Jeder Quellentyp hat eigenen letzten Versuch, letzten Erfolg, Fehler und Abdeckungsumfang. Ein Teilfehler ersetzt keine gültigen alten Daten durch leere Listen. UI-Auftragsstatus wird alle drei Sekunden abgeholt, ohne Formulare oder Kartenfokus zu zerstören.

Die Chatzuordnung beruht auf bereits inventarisierten IDs sowie Projektpfad und eindeutigem GradeCrew-Titel. Persönliche Chats und der bekannte Schülerdaten-CSV-Chat werden ausgeschlossen. Historische ChatGPT-Cloudverläufe werden über die vorhandenen Desktoptools neu geprüft; dieser Connector ist nicht automatisch aus dem lokalen Dienst erreichbar und bleibt als eigener manuell aktualisierter Quellentyp sichtbar. Kein privates Sessiondatenbank-Scraping. Alle unterstützten erreichbaren Seiten werden erfasst; gekürzte Nachrichten, fehlende Anhänge und nicht erreichbare Verläufe bleiben ausdrücklich unvollständig.

Automatischer Import ist keine automatische fachliche Wahrheit: Neue Quellen werden als „neu zu prüfen“ gezeigt. Bestehende redaktionelle Bereichs-/Unterpunktbewertungen werden nicht allein durch eine neue Chatantwort auf grün gesetzt. Ein Quellenbericht nennt Zahl/Datum/Fehler, offene Abnahmen und nächste Schritte. Die App darf niemals „alles implementiert“ aus dem bloßen Import ableiten.

## Beständigkeit und Fehler

SQLite liegt außerhalb der ausgelieferten Dateien und außerhalb der Git-Sicherung. Transaktionen sichern Request und Ereignisjournal. Nur ein lokaler Dienst darf diese Datenbank bearbeiten (Prozesssperre). Nach Brokerneustart werden bekannte Turn-IDs lesend abgeglichen; unklare Startfenster ohne Turn-ID bleiben gesperrt. Kein automatischer Replay, kein Zählerreset. Eine unterbrochene Rückfrage wird als unterbrochen angezeigt und nicht heimlich als beantwortet behandelt. Es gibt in diesem Scope keinen Backup-Import, der unbemerkt alte Aufträge wieder aktiviert.

## Zugriff

Nur 127.0.0.1, Host-Allowlist, Origin-Prüfung und zufälliges Sitzungstoken für schreibende Requests. Keine CORS-Freigabe. JSON-Größenbegrenzung, begrenzte Auftragstexte, eine Ausführung gleichzeitig, begrenzte Warteschlange. Token und Rohlogs werden weder ins Repo noch in den Browserstatus aufgenommen. API liefert ausschließlich diese Firmenzentrale-Daten, keine beliebigen Dateien oder vollständige persönliche Chatliste. Fremde Inhalte bleiben untrusted Referenzmaterial.

## Abnahme

Reale UI-Eingabe → dauerhaft angenommener Auftrag → tatsächlicher Modellturn → echter Kontext-/Berichttoolschritt → Hash und Ergebnis im UI. Dazu Rückfrage/Antwort, Reload, gleicher Request zweimal, Brokerneustart, fehlender Host, ungültige/zu große Texte, fremder Origin, unbekannte Werkzeuge, falsche Auftragbindung. Tests prüfen keinen echten Productionzugriff. Selbstreview ist kein unabhängiger PASS. P0-Exit wird nur für den tatsächlich belegten Umfang dokumentiert; die übrige V1 bleibt offen.

Quellen: https://learn.chatgpt.com/docs/app-server und lokal generiertes Protokollschema derselben CLI-Version. Temporärer Schemaexport enthält keine Anmeldedaten.
