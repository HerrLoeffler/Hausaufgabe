# Extended Question Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Drei neue durchgängige visuelle Formate in der vorhandenen GradeCrew-App lokal erproben.
**Architecture:** Deklarative Szenen, neutralisierte öffentliche Projektion, bestehender Assessmentkern. Lokaler Fixtureadapter an vorhandenen Einstiegspunkten, keine externe Verbindung.
**Tech Stack:** Vorhandenes JavaScript, SVG, Node-Test, lokale Review-App.
**Spec:** docs/superpowers/specs/2026-10-20-extended-question-types-design.md

## Global Constraints
- Keine Deploys, Cloudwrites, neuen Providerstarts oder privaten Testdaten.
- Vorhandene App/Navigation/Design verwenden; keine zweite Engine.
- Lösungen serverseitig halten; lokale Simulation ehrlich benennen.
- Leere numerische Antworten niemals als null werten; neutrale IDs.

## Review Focus
Unbekannte/doppelte IDs; Leaks über Optionen/Reihenfolge; geänderte Modelle beim Resume; Legacy-Fingerprint; Endpunkte und Touch/Tastatur.

### Task 1: Modell, Vorlagen, sichere Projektion und Grader
**Files:** assessment-functions/lib/visual-questions.js; assessment-functions/lib/assessment-core.js; assessment-functions/test/visual-questions.test.js.
**Interfaces:** validateVisual(q), publicVisual(q, mapId), visualKey(q,mapId), gradeVisual(key,given); buildAssessmentContract unverändert.
- [x] Verhaltenstests für gemischten Vertrag, richtige/falsche/Teilantwort, Projektion, ungültige Modelle, leeren Wert und Fingerprint schreiben und rot ausführen.
- [x] Begrenzte eigene Pflanze/Raumszene und Skalenmodelle implementieren; Serverprojektion/Grader/Fingerprint/Answer-Sanitizer erweitern.
- [x] Node-Assessmenttests grün ausführen, Zwischencommit.

### Task 2: Bestehende Erstellung/Editor/Schülerintegration
**Files:** visual-question-ui.mjs/css, app.js, secure-student.js, functions/lib/constants.js/schemas.js/validation.js/prompts.js.
**Interfaces:** renderVisual(container,publicQuestion,answer,onChange), readVisual(container), visualComplete(q,answer); neue Struktur in bestehender Serialisierung.
- [x] DOM-Verhaltenstests für Auswahl/Beschriftung/Skala und Wiederherstellung rot ausführen.
- [x] Neue Typen in vorhandenen Wunsch-/Typstellen, Import, Speicherung, Editor, Prüfkontext und Schülerzweigen ergänzen. Keine neue Seitennavigation.
- [x] DOM-/Altbestandtests und Syntaxprüfung ausführen, Zwischencommit.

### Task 3: Lokaler Remyadapter, Bewertung und Nachweis
**Files:** tools/extended-preview/*, bestehende tools/review-preview/server.mjs nur über gezielte Optionen wiederverwenden.
**Interfaces:** lokale POST generate/grade; Server hält private Schlüssel, Browser erhält Paper für Schüler; Beispielpersistenz unter eigenem Namespace.
- [x] HTTP-Tests zu Loopback/Origin/CSP/privaten Dateien und realem Grader rot ausführen.
- [x] Gekennzeichnete vorbereitete Remy-Erstellung am bestehenden Ablauf, lokale Speicherung/Resume, echte Graderausführung anschließen.
- [x] Vollständige App lokal starten, Bedienpfad/Layouts prüfen, Screenshots sichern; unabhängigen engen Review durchführen und relevante Befunde beheben.
- [x] HDF/TODO/Registry/Plan mit tatsächlichen Belegen aktualisieren, committen/pushen. Lokale Adresse und echte versus simulierte Teile ausgeben.

## Ausführungsreceipt
Inline ausgeführt, isolierter Clone von4f8b792. Siehe HDF für echte Tests, einen bereits auf der Basis reproduzierten UI-Testharnessfehler und noch offene Geräte-/Cloud-/Provider-/Drucknachweise. Die Umsetzung liefert einen lokalen Prototyp; die Checkboxen sind kein Releasegate oder Abschluss aller späteren Produktionsanforderungen.
