# Gemeinsame Qualitätsregeln Implementation Plan

> For agentic workers: execute inline using superpowers:executing-plans; one fresh review of the final patch.

**Goal:** Geprüfte gemeinsame Regeln bei neuen Aufgaben anwenden und neue Meldungen automatisch eindeutig einordnen.
**Architecture:** Gemeinsamer versionierter Regelkatalog; bestehende Validatoren und Prompts; synchrone Feedbackeinordnung im bestehenden Schreibpfad; datensparsamer Anwendungsbeleg im bestehenden Nutzungsprotokoll.
**Tech Stack:** Node22, Firebase Functions/Firestore, bestehendes Webfrontend.
**Spec:** docs/superpowers/specs/2026-11-08-common-quality-automation-design.md

## Global Constraints
Keine Altbewertung freigeben; neue gemeinsame automatische Freigabe nur für passend nachgewiesene bestehende Strukturregel, mit Signatur/Revision/Audit und festem geprüftem Grund; keine neuen Fachregeln aus Freitext; keine zusätzlichen KI-Aufrufe zur Meldungsklassifikation; keine Rollen-/Rules-/Quotaänderung; aktuelle Livebytes außerhalb enger Änderungen erhalten.

## Review Focus
Antwortleck vs erlaubter Lesekontext; äquivalente Brüche vs explizite Darstellungsanforderung; false_positive und leere Snapshots; Promptinhalt bei allen Erstellungswegen; ehrlicher Speicher-/Validierungsbeleg nach Modellantwort.

### Task 1 Regeln und Gegenbeispiele
- [ ] Tests für Antwortleck und erlaubte Lücken/Lesekontexte, Bruchäquivalenz, fehlenden Hörkanal, Permafrostdefinition und URL schreiben und rot ausführen.
- [ ] functions/lib/common-quality-rules.js implementieren; Prompts und validateQuestion anbinden; neue und bestehende Tests grün.
### Task 2 Automatische Meldungseinordnung
- [ ] Tests für bekannten belegbaren Fehler, Smileys ohne Grund, fehlenden Kontext, Freitextinjektion, Dublette, Wiederholung/Idempotenz und unberührte Altbewertungen rot.
- [ ] Klassifikation beim recordQuestionFeedback speichern; bestehende Adminprojektion erweitert; alle bestehenden Berechtigungen unverändert.
### Task 3 Anwendungsbeleg und Adminoberfläche
- [ ] Tests für Anwendungsbeleg nach Antwort, Hashbindung, gleiche Kennung in Antwort/Usage, Hilfe-/Automatikdarstellung rot.
- [ ] Bestehende Erstellungswege mit gemeinsamem Beleg versehen; Speicherung im bestehenden aiEvent; lesbare Admineinordnung.
### Task 4 Veröffentlichung und echter Nachweis
- [ ] Gesamtchecks und unabhängiger enger Review; exakte CI. Aktuelle Hosting-/Functions-Stände sichern, nur autorisierte betroffene Functions und Hostingdateien veröffentlichen.
- [ ] Neue fiktive Aufgabe über normalen angemeldeten Adminweg erzeugen, Regelbeleg und gespeicherten Nutzungsbeleg abgleichen; gezielte fiktive Meldung prüft Automatik/Hilfebedarf. Keine Kundendaten oder zusätzliche Globalsignale erzeugen.
- [ ] Produktionsbelege und Grenzen dokumentieren; offene Altbewertungen bleiben offen.
