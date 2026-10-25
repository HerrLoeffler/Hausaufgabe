# Bereichsfokus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Dieser Auftrag wird gemäß direktem Humanauftrag allein im bestehenden Fachchat ausgeführt.

**Goal:** Jeder Firmenbereich wird Mittelpunkt eines bedienbaren Netzes seiner Unterpunkte samt Arbeitsstand, Dringlichkeit und nächstem Schritt.

**Architecture:** Bestehendes SVG-Unternehmensnetz und Routing behalten. Reine Daten-/Projektionsfunktionen liefern Unterpunkte und Fokusgeometrie; die vorhandene DOM-Ansicht rendert Bereich oder Unterpunkt, der bestehende Editor übernimmt den vorbereiteten Auftrag.

**Tech Stack:** Browser ES Modules, SVG, bestehendes CSS, Node-Test-Runner; keine neuen Pakete.

**Spec:** ../specs/2026-10-25-bereichsfokus-design.md

## Global Constraints

- GC-BRAIN-01, gleicher isolierter Checkout und PR295, ein Writer.
- Live unverändert. Kein Merge, Deploy, Chatversand oder Workerstart.
- Historischer Fachquellenstand23.10.; Umsetzungsdatum25.10. getrennt anzeigen.
- Originalmarke und bestehende Entwürfe erhalten; sources/ bleibt read-only.
- Kein Fortschrittsprozent ohne vereinbarte abgenommene Kriterien.

## Review Focus

- Direkter Reload eines Unterpunkts rekonstruiert denselben Kontext.
- Ungültige Bereichs-/Unterpunkt-IDs erzeugen Meldung und brauchbaren Rückweg.
- Filter/Suche ergeben leere Treffer statt verstecktem Informationsverlust.
- Kleine Breiten und lange deutsche Titel bleiben bedienbar.
- Ein Bereichsblocker darf unbeteiligte Unterpunkte nicht pauschal rot färben.

## Dateien und Verantwortung

- Neu focus.mjs: explizite Unterpunkt-Arbeitsdaten, Auswahl, Geometrie, Suche/Filter und Entwurfkontext.
- Änderung network-view.mjs: mittiger Bereich, Satelliten, Arbeitsblatt, Rückwege und alternative lesbare Auswahl.
- Änderung app.mjs: Unterpunkt aus bestehendem route.tab übergeben, erweiterten Entwurf übernehmen.
- Änderung style.css/index.html: fokussierte Satelliten, zugängliche Zustände und Cacheversion.
- Neu tests/firmenzentrale/focus.test.mjs: oben genannte Modellverträge.
- Änderung README/Workstream/CI: Bedienung, tatsächlicher Nachweis, Fortsetzung.

### Task1: vollständiges Unterpunktmodell

**Interfaces:** childrenFor(domainId)→Child[]; focusProjection(domainId,childId)→{domain,children,selected,invalid}; filterChildren(children,query,mode)→Child[]; prepareChildWork(child)→string; focusPositions(count)→{x,y}[]; statusLabels.

- [ ] Test vollständige Abdeckung der bisherigen pieces, stabile eindeutige IDs und Pflichtfelder schreiben.
- [ ] Tests Mittelpunkt/Positionen, ungültige IDs, nur begrenzte Blocker, Erneuerungen, Suche/Filter und Entwurfkontext schreiben und rot ausführen.
- [ ] Explizite Arbeitsdaten je Unterpunkt implementieren; redaktionelle Nachweisgrenzen erhalten.
- [ ] Tests grün ausführen; Handoff aktualisieren; Zwischencommit sichern.

### Task2: Fokusnetz und Arbeitsblatt

**Interfaces:** mountNetwork(container,{selected,child,onDraft,brandIcon}); onDraft(domain,{scope,next,childWork}) nutzt vorhandenen Editor.

- [ ] Fokusmodell in bestehende Ansicht einbinden; ausgewählten Bereich mittig setzen, untergeordnete Speichen ohne Abhängigkeitspfeile zeichnen.
- [ ] Alle Unterpunkte beschriftet darstellen; Auswahl per Klick/Tastatur/URL; Rückwege und Fehlermeldungen ergänzen.
- [ ] Bereichsübersicht mit sortierter nächster Arbeit; Unterpunktblatt mit allen Pflichtfeldern; Verbindungskontext weiter erreichbar.
- [ ] Fokus-Suche/Filter mit Leerzustand und Reset; kleinere Breiten über lesbare Auswahlliste absichern.
- [ ] Bestehenden Entwurfeditor mit vollständigem Unterpunktkontext öffnen; Speicher-/Sendegrenze erhalten.
- [ ] Syntax, Tests und diff check ausführen; Zwischencommit sichern.

### Task3: sichtbare Prüfung und Sicherung

- [ ] Tatsächliche lokale Vorschau öffnen; Design/Marke, Lernen/Erneuerungen, Classroom/Zuweisung samt Rückwegen prüfen.
- [ ] Reload, Filter, kein Treffer, Einpassen/Zoom, Tastatur und kleine Breite prüfen.
- [ ] Entwurf öffnen und Inhalt nachlesen, ohne Versand; Fehlerprotokoll lesen.
- [ ] Gefundene Fehler im Scope korrigieren, passende Regressionen ergänzen.
- [ ] Screenshots und Prüfbeleg sichern; Handoff mit Grenzen und nächster Aktion ergänzen.
- [ ] Auf bestehenden Remote-Branch mit geprüftem Parent sichern, PR295 aktualisieren, neun/neue Blobs vergleichen und tatsächliche CI abwarten.

## Selbstprüfung des Plans

Das Konzept ist durch die drei Tasks abgedeckt: Datenvollständigkeit und Ehrlichkeit in Task1, Bedienung und Darstellung in Task2, praktische Nutzung und Sicherung in Task3. Gemeinsamer Store/Chatversand/Produktfreigaben sind ausdrücklich Folgearbeiten des bestehenden Gesamtplans. Kein neuer Design-Freigabestopp: der Nutzer verlangt Konzept und direkte Umsetzung, und hat die eigenständige Ausführung bereits vorgegeben.
