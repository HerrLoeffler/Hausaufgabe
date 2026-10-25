# Chatanschluss und Quellenaktualisierung Implementation Plan

> Ausführung mit superpowers:executing-plans, ohne Subagenten gemäß Martins Auftrag.

**Goal:** Eingabe, echte Bearbeitung und Ergebnis dauerhaft in derselben lokalen Firmenzentrale verbinden.

**Architecture:** Bestehender Python-Server plus SQLite-Broker und offizieller Codex-App-Server über stdio. Bestehende Vanilla-JS-Oberfläche erhält Auftragsliste und Quellenstatus; historische Inventur bleibt getrennt von frisch geprüften Quellen.

**Tech Stack:** Python-Standardbibliothek, SQLite, JSON-RPC, vorhandenes JavaScript/SVG, keine neue Paketinstallation.

**Spec:** ../specs/2026-10-25-chatanschluss-design.md

## Globale Grenzen

- GC-BRAIN-01, gleicher Writer und PR295; Live unverändert.
- Anmeldedaten nicht lesen/kopieren; Codex verwaltet bestehende Anmeldung.
- Kein automatisches Wiederholen unklarer Starts; Request-/Turn-/Versuchshistorie erhalten.
- Quellenimport, fachliche Abnahme und Deployment bleiben unterschiedliche Zustände.
- Erstes Profil ausschließlich Quellen-/Berichtarbeit; keine Produktänderungen.

## Review-Fokus

- Doppelklick und verlorene HTTP-Antwort: gleicher Inhalt/ID liefert denselben Auftrag; geänderter Inhalt/ID-Konflikt wird abgewiesen.
- Neustart zwischen externem Start und Antwort: kein zweiter Start; sichtbarer Abgleichzustand.
- Fremde Webseiten/Toolaufrufe: Origin-/Token-/Auftragsbindung serverseitig prüfen.
- Einzelne Quelle nicht erreichbar: letzter guter Bestand bleibt sichtbar, Fehler separat.
- Automatische Aktualisierung während Eingabe: Formular und Fokus bleiben erhalten.

## 1. Dauerhafter Auftragsspeicher

Dateien: tools/central_runtime/store.py, tests/firmenzentrale/test_runtime.py.

- [x] Tests für Idempotenz, Inhaltskonflikt, Persistenz und Wiederaufnahme zunächst fehlschlagen lassen.
- [x] Store.create(payload, context), get(id), update(id, **fields), list(), event(id, kind, data) implementieren; SQLite-Transaktionen und private Dateirechte.
- [x] Tests ausführen, Zwischenstand sichern.

## 2. Qualifizierter Chatadapter

Dateien: tools/central_runtime/rpc.py, service.py.

- [x] JSON-RPC-Transport mit Requestkorrelation, Zeitlimit, Prozessende und fail-closed Serverrequests implementieren.
- [x] Thread-/Turn-Start nur aus dauerhaftem Auftrag; begrenzte dynamische Werkzeuge mit echter Requestbindung.
- [x] Rückfragen und Berichte speichern, tatsächlichen Turnabschluss übernehmen, keine reine Textdelta-Erfolgsmeldung.
- [x] Fehlerfälle und Fremdwerkzeuge testen; realen Diagnoseauftrag samt Bericht und Rückfrage prüfen.

## 3. Quellenbestand

Datei: tools/central_runtime/sources.py.

- [x] Paginierte unterstützte Chatlese-APIs und feste GitHub-Lesequellen, Zeitstempel und Fehlerzustände implementieren.
- [x] Nur relevante Projektchats, keine persönlichen/Schülerdaten-Threads; Quellgrenzen sichtbar erhalten.
- [x] Bekannte Cloudchats über Desktopconnector prüfen; nur redaktionelle Abdeckungsmetadaten sichern.
- [x] Letzten guten Stand bei Teilfehler und Cursorgrenzen testen.

## 4. Bestehende Oberfläche anbinden

Dateien: tools/serve_firmenzentrale.py, docs/prototypes/firmenzentrale/runtime-view.mjs, app.mjs, index.html, style.css.

- [x] HTTP-Schnittstelle mit Origin/Host/Token/Größenprüfung; nur eigene Dateien und API ausliefern.
- [x] Im vorhandenen Editor klaren Startknopf ergänzen; Entwurfsspeicherung behalten.
- [x] Eingang zeigt Auftrag, Status, Ergebnis, Bericht, Rückfrage und Versuch; Polling ohne Formularverlust.
- [x] Datenstand und neue Quellen in Verbindungen/Abdeckung anzeigen; Netzwerkfokus erhalten.
- [x] Desktop, Handy, Reload, Doppelstart und echte Ergebnisrückkehr prüfen.

## 5. Sicherung und Nachweise

- [x] Gezielte Python- und vorhandene 19 JavaScript-Tests sowie Syntaxprüfungen ausführen.
- [x] Echten End-to-End-Beleg mit Thread-/Turn-ID, Berichtsha und Neustartgrenze dokumentieren.
- [x] Eigene Übergabe/README aktualisieren, keine fremden gemeinsamen Statusdateien überschreiben.
- [ ] Abschließende Sicherung auf gleichem DraftPR295 ohne Force-Push; CI am finalen Remotecommit prüfen. Zwischencheckpoint0f1bd8a ist bereits auf allen drei Workflows grün.

Prüfstand: 15 Python- und 19 JavaScript-Tests bestanden. Echte Diagnose mit Rückfrage sowie bereichsübergreifender Bericht vorhanden. Cloudkürzungen, unbekannte Historie und verbleibende V1-Funktionen sind ausdrücklich offen; die Checkliste beschreibt ausschließlich den oben begrenzten Lieferumfang.
