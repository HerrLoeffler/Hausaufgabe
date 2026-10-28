# Bildfolgen-Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Freie Lehrereingabe erzeugt eine fachlich geprüfte Vierkarten-Bildfolge in einem echten GradeCrew-Test.
**Architecture:** Bestehender Job-, Editor- und Prüfungsablauf in isoliertem sequence28-Staging. KI plant vier Szenen, erzeugt ein privates Gesamtbild; Sharp schneidet vor Kompression vier Karten aus. Zwei separate KI-Prüfungen prüfen Bildinhalt und lösen die gemischte Folge ohne Schlüssel.
**Tech Stack:** Firebase Functions/Auth/Firestore, bestehende OpenAI-Verbindung, Sharp, bestehender visueller Renderer.
**Spec:** docs/learning/AUTOMATIC_TASK_SELECTION.md (28.10.2026), Martins ausdrückliche Pilotfreigabe.

## Global Constraints
- Nur gradecrew-staging-2026, eigener Hosting-Kanal und benannte sequence28-Functions; keine Production- oder kanonischen Hosting-Änderungen.
- GC-EXTENDED-QUESTION-TYPES-01; bestehende Versuchs-/Budgethistorie erhalten.
- Genau vier Karten pro Folge; maximal drei Folgen pro Auftrag. Drei neue fachübergreifende Pilotaufträge. Höchstens zwei Bildversuche pro Folge, keine Wiederholung unbekannter Providerstarts.
- Gesamtbild bleibt ausschließlich im Serverspeicher; öffentliche Daten enthalten nur gemischte Karten mit neutralen IDs und getrenntem privatem Lösungsschlüssel.
- Bestehende acht Standardformate und normale Staging-Endpunkte erhalten. Keine Erfolgsquote oder Geräteabnahme erfinden.

## Review Focus
- Falsche MIME/HTML/überlange Daten: geschlossener begrenzter WebP-Vertrag.
- Unleserliche oder falsch ausgeschnittene Szenen: tatsächliche Ausschnitte prüfen, keine reine Promptprüfung.
- Mehrdeutige Folgen/Zyklen: eindeutigen Start verlangen oder kontrolliert ablehnen.
- Reload/Doppelklick/unklare Antwort: vorhandenen Job wiederfinden, keine neue kostenpflichtige Anfrage.
- Lösung/Master im Schülerinhalt: öffentliche Projektion und serverseitige Bewertung testen.

### Task 1: Geschlossener Kartenvertrag und vorhandener Renderer
**Files:** visual/core.js, visual/renderers.js, visual-tasks.mjs; Funktionen-/Assessment-Kopien; functions/test/sequence-sheet.test.js.
**Interface:** sequence spec family=generated-four, items[{id,caption,imageDataUrl}], private solution.order; je Karte maximal36000Zeichen, nur RIFF/WEBP, Gesamtvertrag180000Zeichen.
- [x] RED: vier Karten, öffentliche Redaktion, volle/teilweise/falsche Bewertung, MIME/Größe/Extrafelder und Legacy testen.
- [x] Implementieren und dieselben Tests GREEN ausführen.
- [x] Zwischencommit mit Übergabe sichern.

### Task 2: Echte KI und freier Wunsch im bestehenden Jobablauf
**Files:** functions/lib/sequence-sheet.js, functions/index.js, visual-format-choice.mjs, tools/build-visual-preview255.mjs, tools/sequence-pilot/*.
**Interface:** generateSequenceTest(input,{structured,generateMaster,consumeImage,onProgress,record}) -> {test,meta}; nur explizite sequence-Auswahl nutzt diese Route, sonst bestehender Ablauf.
- [x] RED: Anfragedaten, Cropgeometrie, private Masterhaltung, Shuffle, ablehnende Reviews und begrenzte Wiederholung testen.
- [x] Implementieren: vierteiliger KI-Plan,2048²Master, vier echte WebP-Ausschnitte, unabhängige Inhaltsprüfung und schlüssellose Reihenfolgelösung. Bestehende Quoten/Nutzungsnachweise verwenden.
- [x] Freies Wunschformular mit bestehender Anmeldung, Jobfortschritt und Wiederaufnahme; erzeugten Test im normalen Editor öffnen. Formatänderung ebenfalls mit echter KI.
- [x] GREEN: gezielte Tests und bestehende relevante Web-/Functions-/Assessment-Prüfungen.
- [x] Gesamtänderung einmal unabhängig prüfen; konkrete Fehler beheben.

### Task 3: Isoliert veröffentlichen, drei echte Fachproben und Belege
**Files:** docs/evidence/sequence-sheet-pilot-20261028/*, workstreams/remy-interactive-tests-20261026.md; aktuelles main TODO/STATE nur eigener Eintrag.
- [x] Frische Development-/Deployprüfung und reviewbaren Quellcommit sichern.
- [x] Nur benannte sequence28-Functions und Hosting-Vorschau veröffentlichen, alle anderen Quellen unverändert belegen.
- [x] Biologie/Deutsch/Physik je eine freie Eingabe: ein Bild pro Folge, vier Ausschnitte, beide echten KI-Prüfungen. Fehlversuche erhalten und konkrete Fehler beheben.
- [x] Öffentliche Redaktion, Bewertung, Speichern/Wiederaufnahme und Bedienung prüfen; Screenshots sichern.
- [x] Bericht, Rezepterkenntnisse, Job-/Provider-IDs, Grenzen und nächsten Schritt dauerhaft sichern.

## Ausführungsgrenzen
Einzelne synchrone Regeneration zugunsten dauerhaftem Hintergrundauftrag zurückgestellt. Drei Szenarien benötigten fünf logische Jobs/sechs zunächst budgetierte, danach genau sieben tatsächliche Master; konkrete A/B-Fehler, Erweiterungsgrund und Nutzungszahlen stehen im Bericht. Physische Touch-/Lehrerabnahme offen; keine99%-Freigabe. Hosting abschließend separat verifiziert.
