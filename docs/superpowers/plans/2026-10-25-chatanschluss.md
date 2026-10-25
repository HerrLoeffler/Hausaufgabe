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

- [ ] Tests für Idempotenz, Inhaltskonflikt, Persistenz und Wiederaufnahme zunächst fehlschlagen lassen.
- [ ] Store.create(payload, context), get(id), update(id, **fields), list(), event(id, kind, data) implementieren; SQLite-Transaktionen und private Dateirechte.
- [ ] Tests ausführen, Zwischenstand sichern.

## 2. Qualifizierter Chatadapter

Dateien: tools/central_runtime/rpc.py, service.py.

- [ ] JSON-RPC-Transport mit Requestkorrelation, Zeitlimit, Prozessende und fail-closed Serverrequests implementieren.
- [ ] Thread-/Turn-Start nur aus dauerhaftem Auftrag; begrenzte dynamische Werkzeuge mit echter Requestbindung.
- [ ] Rückfragen und Berichte speichern, tatsächlichen Turnabschluss übernehmen, keine reine Textdelta-Erfolgsmeldung.
- [ ] Fehlerfälle und Fremdwerkzeuge testen; realen Diagnoseauftrag samt Bericht und Rückfrage prüfen.

## 3. Quellenbestand

Datei: tools/central_runtime/sources.py.

- [ ] Paginierte unterstützte Chatlese-APIs und feste GitHub-Lesequellen, Zeitstempel und Fehlerzustände implementieren.
- [ ] Nur relevante Projektchats, keine persönlichen/Schülerdaten-Threads; Quellgrenzen sichtbar erhalten.
- [ ] Bekannte Cloudchats über Desktopconnector prüfen; nur redaktionelle Abdeckungsmetadaten sichern.
- [ ] Letzten guten Stand bei Teilfehler und Cursorgrenzen testen.

## 4. Bestehende Oberfläche anbinden

Dateien: tools/serve_firmenzentrale.py, docs/prototypes/firmenzentrale/runtime-view.mjs, app.mjs, index.html, style.css.

- [ ] HTTP-Schnittstelle mit Origin/Host/Token/Größenprüfung; nur eigene Dateien und API ausliefern.
- [ ] Im vorhandenen Editor klaren Startknopf ergänzen; Entwurfsspeicherung behalten.
- [ ] Eingang zeigt Auftrag, Status, Ergebnis, Bericht, Rückfrage und Versuch; Polling ohne Formularverlust.
- [ ] Datenstand und neue Quellen in Verbindungen/Abdeckung anzeigen; Netzwerkfokus erhalten.
- [ ] Desktop, Handy, Reload, Doppelstart und echte Ergebnisrückkehr prüfen.

## 5. Sicherung und Nachweise

- [ ] Gezielte Python- und vorhandene 19 JavaScript-Tests sowie Syntaxprüfungen ausführen.
- [ ] Echten End-to-End-Beleg mit Thread-/Turn-ID, Berichtsha und Neustartgrenze dokumentieren.
- [ ] Eigene Übergabe/README aktualisieren, keine fremden gemeinsamen Statusdateien überschreiben.
- [ ] Gleichen DraftPR295 ohne Force-Push sichern, CI am exakten Remotecommit prüfen.
