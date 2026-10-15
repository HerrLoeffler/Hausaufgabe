# Secure Layout und Statistik – Auslieferungsnachweis

Stand16.10.2026. Branch `feature/secure-layout-telemetry-20261016`. Production unverändert.

## Belegter Umfang

- SwiftUI-Einstieg mit Crew, sichtbaren Feldern, gepaarten hellen Farben; eigener nativer Prüfungsrahmen mit Timer und Speicherstatus.
- Lokaler Aufgabenrenderer mit nummerierter Übersicht, aktueller Aufgabe, Bearbeitungshaken, Vor/Zurück und Bestätigung einer zunächst unveränderten Sortieraufgabe. Grün bedeutet ausgefüllt, nicht fachlich richtig.
- Elf Antworttypen, gespeicherter Stand rückwärtskompatibel, größere Schrift, kompakte Leisten, Auswahl- und Medienfehlerzustände.
- Abgabezusammenfassung mit offenen Aufgaben, automatische Abgabe bleibt unabhängig vom Dialog; Serverquittung und Apple-Freigabe bleiben getrennte Voraussetzungen.
- Neue Staging-Telemetrie getrennt von vorhandenen Prüfungsfunktionen. Details und Begrenzungen: [Geräte und Statistik](../../ipad-support-and-statistics.md).

## Lokale Nachweise

- Swift-Kern25Tests bestanden; Renderer-/Navigation16Tests; Python19Tests. Vollständiger Simulator-Appbuild bestanden.
- Vollständige WebKit-Matrix auf iPad mini(A17Pro):360/360 statische Berichte plus12/12 tatsächliche Bedienabläufe, bestanden. `/private/tmp/secure-web-full-corrected/summary.json`.
- Die Matrix fand sechs Fälle, in denen die offene Übersicht bei großer Schrift im Querformat zu viel Höhe einnahm. Regression nachgewiesen und kompakte Darstellung auf geringe Höhe erweitert; Wiederholung grün.
- Native900Fälle und großer iPad-WebKitlauf: laufen, Abschluss folgt vor Auslieferung.
- Bildschirmtastatur: reduzierte WebView-Inhaltshöhe und Navigation automatisiert geprüft. Echtes Softwaretastaturverhalten im AAC-Modus bleibt Teil des physischen Tests.

## Releasezustände

GitHub/CI/neuer TestFlight-Upload: noch offen. Keine Vorabbehauptung, dass0.2.2 bereits auf dem Gerät ist.

Staging-Statistik-Deploy und synthetischer Live-Nachweis: werden separat ergänzt. Ein bereitgestellter Löschplan ist nicht mit einem bereits beobachteten Tageslauf gleichzusetzen.

## Physischer Gerätetest

Der Nutzer bestätigte für den vorherigen Build frühe Abgabe und Zeitablauf einschließlich AAC-Sperre/Freigabe. Das ist kein neuer Gerätetest dieser Oberfläche. Nach Apples Verarbeitung: installierte Version/Build, iPad-Modell und iPadOS notieren; frühe Abgabe mit offenen Fragen, Zeitende bei offener Übersicht/Abgabedialog, Medien und Wiederaufnahme prüfen. Für diesen neuen Build noch offen.

## Bekannte Grenzen

iPadOS17+, keine allgemeine Zusage für alle Modelle der letzten zehn Jahre. Alte Hardwareleistung und ältere Systemruntime noch nicht qualifiziert. Lange Offline-Abgabe über die serverseitige30Sekunden-Nachfrist hinaus und betreute Lehrer-Notfreigabe sind weiterhin separate Aufgaben. Statistik enthält pseudonyme Teilnahmen, keine verlässlich unterschiedlichen natürlichen Personen. Keine Production-Bereitstellung und keine PostHog-Übertragung.
