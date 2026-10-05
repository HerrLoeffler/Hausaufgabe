# GradeCrew iOS 0.1.9 Implementation Plan

> Ausführung im aktuellen Chat mit superpowers:executing-plans. Schritte werden mit tatsächlichen Tests und Commits belegt.

**Goal:** Vorhandene Web-Exporte über eine begrenzte native Dateibrücke teilen und den tatsächlich geladenen Host diagnostizieren.

**Architecture:** Swift/Foundation validiert Ursprung und Dateien, ein WebKit-Handler verwaltet native Antworten und Teilen. Ein gebündeltes JavaScript-Skript stellt die Promise-API und den vorhandenen Blob-Download-Adapter bereit.

**Tech Stack:** SwiftUI, WebKit, UIKit, Foundation, JavaScript; vorhandener Python-Projektgenerator, keine Produktdependencies.

**Spec:** ../specs/2026-10-06-ios-native-bridge-design.md

## Global Constraints

- iOS/iPadOS 16.0, Bundle-ID de.gradecrew.
- Version 0.1.9 aus bestehender VERSION-Datei; lokale Buildnummer ist kein TestFlight-Nachweis.
- Exakt ausgewählter HTTPS-Staging-Ursprung, ausschließlich Hauptframe.
- Maximal 12 MiB, MIME/Dateiname passend; eine Teilen-Aktion gleichzeitig.
- Production unverändert; kein Hosting-, Functions-, Rules- oder automatischer TestFlight-Deploy.

## Review Focus

- Frame/Ursprung wechselt während Lesen/Teilen: offene Antwort abbrechen, kein Zugriff im neuen Dokument.
- Dateiendung widerspricht MIME oder enthält Pfad/Steuerzeichen: abweisen bzw. ungefährlich normalisieren.
- Wiederholtes Teilen oder vorhandener Dialog: busy statt gestapelter Präsentation.
- Nutzer bricht Teilen ab: genau eine Antwort und keine zweite Browser-Datei.
- Browser ohne native Bridge: originale Ankerklicks unverändert.

## Task 1: Native Dateivertrag

Files: Sources/GradeCrewNativeBridgePolicy.swift, test_native_bridge.py.

Interfaces: `validate(body:sourceURL:loadedURL:isMainFrame:selectedBaseURL:) -> Request`; Request mit id/action/file. `writeTemporaryFile(_:) -> URL`, `removeTemporaryFile(_:)`.

- [x] Tests zuerst: gleichursprüngliche CSV-Bytes akzeptieren; externe/andere Preview/Subframe/HTTP abweisen; version/Typ/Größe/base64 validieren; ungefährlicher Name, exakte Bytes und Cleanup.
- [x] Test ausführen und fehlende Implementierung bestätigen.
- [x] Minimalen Foundation-Vertrag implementieren.
- [x] Neue und bestehende Python/Swift-Verhaltenstests ausführen; Task committen.

## Task 2: WebKit-/Teilen-Anbindung

Files: Sources/GradeCrewNativeBridge.swift, Sources/TeacherWebPortalView.swift, Sources/TeacherRootView.swift, Resources/gradecrew-native-bridge.js, generate_project.py, test_native_bridge_js.cjs.

Interfaces: Handler `attach(to:selectedBaseURL:)`, `cancelPendingRequest()`, `detach()`; weak WebView, genau eine offene Reply. JS `GradeCrewNative.shareFile(blob, filename)` liefert completed/cancelled oder Fehler.

- [x] JS-Verhaltenstests zuerst: Browser unverändert, Blob-Bytes korrekt, Limit, Abbruch/Fehler ohne Doppel-Export.
- [x] Reales Skript und Ressourcenregistrierung implementieren.
- [x] Handler mit Ursprungskontrolle, Teilen/Popover/Cleanup und lifecycle cancellation anschließen.
- [x] Tatsächlich geladenen Host an Root-Diagnose melden und Version auf 0.1.9 setzen.
- [x] Tests und vollständigen unsigned Xcode-Build ausführen; Task committen.

## Task 3: Review und gesicherte Übergabe

Files: README.md, TESTFLIGHT.md, .gitignore, .github/workflows/gradecrew-native-check.yml, workstreams/ios-native-bridge-019.md; getrennte aktuelle main-Koordinationsdateien.

- [ ] README/TestFlight-Anleitung auf reale hybride Architektur und 0.1.8 (18) berichtigen, neue Stufe klar trennen.
- [ ] CI ausschließlich für Tests/unsigned Build auf Draft-PR gegen kanonischen App-Branch ergänzen; kein Upload.
- [ ] Gesamtdiff prüfen; wichtige Befunde mit Test absichern und beheben.
- [ ] Isolierten Aufgabenbranch auf GitHub sichern, Draft-PR anlegen und an diesen Chat anhängen.
- [ ] TODO/Release-/Registry-Korrektur als separaten Dokumentationsvorschlag gegen aktuelles main sichern.
- [ ] Status lokal/GitHub/CI/TestFlight/Gerätetest und genau einen nächsten Schritt dokumentieren; Ergebnisbericht nach outputs kopieren.
