# Zentraler Chatanschluss – Umsetzung GC-BRAIN-01

Ziel: Martin schreibt sein Anliegen ausschließlich in der bestehenden Mac-App. Die Zentrale übernimmt Zuordnung, Fachauftrag, Rückfrage und Ergebnis. Live bleibt unverändert.

Bestehender eigener Writer/Checkout/PR295, keine Subagenten oder parallele Produktimplementierung. Aktueller Development Status40406398625/Job121865151931 gelesen; PR295 Produkt, PR293/269 Konzept bleiben getrennt. Bestehende 3 abgeschlossene Aufträge und gesamte Versuchs-/Budgethistorie erhalten. Shared TODO/STATE/Registry beim Integrationsowner.

## Architektur und belegte Grenze

Ein gemeinsamer Eingang schreibt Vorgänge in dieselbe private SQLite. Stabile Nutzereingabe-ID und persistente Versandabsicht verhindern Doppelstarts. Der Browser bestimmt weder Empfänger noch Rechte. Antworten werden nur anhand der exakten Chat-/Turnbindung zugeordnet. Textmeldung, Umsetzung, Fachabnahme und Livefreigabe bleiben getrennt.

Bevorzugter Transport: vorhandener gemeinsamer Desktophost und bestehende GradeCrew Zentrale als Koordinator, mit vorhandenen Fachchats. Befund26.10: gemeinsamer Socket fehlt; Desktopserver laufen als stdio. Offizieller installierter App-Connector initialisiert MCP, schließt aber bei tools/list die Verbindung. Keine neuen Rechte, Fernsteuerung, Daemoninstallation, private Datenbankmanipulation oder simulierte Zustellung.

Alternative mit eigenen dauerhaften App-Fachverläufen ist Martin ausdrücklich zur Entscheidung vorgelegt. Bis zur Antwort nur transportunabhängige Teile umsetzen. Bestehende Desktopchats nicht gleichzeitig in einem anderen Host zur Ausführung laden.

Präzisierung nach Martins „Frage nicht verstanden“: keine weitere technische Entscheidung verlangen; seine bereits ausdrückliche Vorgabe „egal welcher Chat“ anwenden. Vorgehen verständlich erklärt: eigene dauerhafte Koordinations-/Fachverläufe mit bestehenden Projektquellen, keine Übernahme laufender Desktopchats. Transport über den bereits angemeldeten lokalen Codex-Appserver. Bestehendes Analyse-/Berichtsprofil bleibt die erste qualifizierte Fachfähigkeit; keine stillschweigende Freigabe für Produktcode/Deploys. Die Benutzeroberfläche benennt diese Grenze.

Lokale Orchestrierung: intake_routing.py erzeugt einen eigenen Zuordnungsauftrag im bestehenden Requestjournal. Dessen validierter Bereichs-/Umfangsentscheid erzeugt genau einen gebundenen Fachauftrag, ebenfalls im vorhandenen Journal. Deterministische Request-IDs und persistente Phasen überstehen Neustart. Rückfragen laufen über denselben bestehenden central_question-Aufruf zurück in die Mac-App. Ein Ergebnis wird erst aus exakt diesem Fachauftrag übernommen. Kein Versand an Desktopchats nötig.

## Schritte und Dateien

- [ ] Persistenter zentraler Eingang: tools/central_runtime/intake.py, tests/firmenzentrale/test_intake.py. Tests zuerst: Idempotenz/Neustart, geänderte Doppel-ID, fehlender Transport bleibt wartend, exakter Rücklauf, unklarer Versand wird nicht wiederholt, beschäftigter Koordinator wird nicht unterbrochen.
- [ ] Dienstintegration: service.py, serve_firmenzentrale.py. Bestehende Origin-/Sitzungstokenprüfung gilt für /api/intake; keine frei wählbaren RPCs oder Empfänger. Hintergrundabgleich ohne Modellstart solange kein expliziter Nutzervorgang vorliegt.
- [ ] Gemeinsamer Eingang in der blauen Startsicht: intake-view.mjs/operations-view.mjs, vorhandene Gestaltung und Entwurfsablage. Ein Textfeld, Senden, eigener Verlauf je Vorgang. Fehlender Anschluss klar sichtbar; Speichern ist kein Versand.
- [ ] Transport gemäß Nutzervotum qualifizieren; maximal ein begrenzter echter Verbindungsauftrag, keine Live-/Produktänderung. Exakte Eingabe→Zuordnung→Fachbearbeitung→Ergebnis-/Rückfragebindung nachweisen. Ohne echten Rücklauf keine Fertigmeldung.
- [ ] Gezielte Suite, Macpaket, echte Bedienung, Datenvergleich, Checkpoint und vorhandenen Draft aktualisieren. Nur tatsächlich getesteten Umfang nennen.

## Reviewfokus

Doppelklick/Netzausfall; Neustart zwischen Versand und Empfang; laufende fremde Arbeit; spätere fremde Meldungen; fehlende oder mehrdeutige Zuständigkeit. Untrusted Projekt-/Chattexte erteilen keine Berechtigungen. SEC06/07/14/15/18 und PRIV07/08/12/15 nach konkretem Scope; Selbstprüfung, keine unabhängige Gesamtfreigabe. Kein API-Key oder Modellwechsel zur Behebung eines Transportfehlers.
