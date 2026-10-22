# GC-IOS-02 / GC-RELEASE-06 — begrenzte Audio-CI-Bereitschaft, 22.10.2026

Folgearbeit zum Rückkehrfix PR277 (`1f206ae`) und getrennten Teacher-Einstieg PR279 (`60927e0`). Eigener Branch fix/secure-audio-ci-readiness-20261022 im eigenen Secure-Worktree. Native-DevelopmentStatus vor ursprünglicher Integration geprüft, kanonischer Branch frisch gefetcht; keine fremden Dateien verändert.

## Konkreter Gatefehler

Secure-TestFlight39781850861 Versuch1: native900Fälle samt5Controllerintegrationstests/neuemUI-Rückweg erfolgreich; Web-mini360Geometriefälle+12Interaktionen erfolgreich. Web-large360Geometriefälle erfolgreich, aber Interaktion audio-pause brach beim tatsächlichen audio.play nach harter2s-Grenze ab. Damit nur7von12Interaktionsberichten und Upload korrekt skipped. Fehlgeschlagener Job119834825974, Artefakt12427990464, vollständiges Xcodelog lokal `/private/tmp/gc-secure-large-failure-xcode.log`. Kein Abgabe-/Antwort-/AAC-/Layoutfehler aus diesem Testfehler abgeleitet.

Gezielte lokale Probe auf eigenem großen iPad-Simulator reproduziert das2s-Timeout (`gc-return-audio-interactions-20261022.log`), daher kein blinder Cloud-Rerun. Begrenzte10s-Probe bestand denselben12-Fall-Navigationstest (`gc-audio-readiness-probe-20261022.log`). Die endgültige Teständerung wartet auf tatsächliches audio.play, verlangt zusätzlich `!paused && readyState>=2`, behält das10s-Limit mit Diagnosezustand und räumt den Timeout immer auf. Danach weiterhin echter Aufgabenwechsel und Prüfung `.paused`. Kein Skip/Retry und keine Ersetzung von Audio durch ein Stub; Audio-/App-/Server-/AAC-Produktquellen unverändert.

## Scope / Assurance / Limits

SEC14/PRIV13: Testzustände bleiben begrenzt und beweisen die wirkliche relevante Audioaktion; keine neuen Daten oder SDKs. Vorherige900/360/360Ergebnisse sind an1f206ae gebunden und ersetzen keine neu gestartete gesamte Pipeline. Kein zweiter fehlgeschlagener Cloudlauf versteckt, kein Upload behauptet. Lehrer-App-Quellen und Website bleiben in diesem Folgediff unberührt. Angefordertes Modell unverändert, tatsächliche Runtime unbekannt, keine bezahlten KI-Starts.

Nächster Schritt: endgültigen12-Fall-Test und unabhängigen Testdiff-Review abschließen, über separate kleine PR integrieren und genau einen neuen Secure-TestFlightlauf beobachten; ursprünglichen gescheiterten Versuch erhalten.

Endgültiger gezielter12-Fall-Interaktionstest mit echtem Wiedergabeassertion ebenfalls bestanden: `/private/tmp/gc-audio-readiness-green-20261022.log`, XCTestsuccess. Geometrie-/Controller-/Rückweg-Tests werden durch diese reine Testharnessänderung nicht als neu bestanden ausgegeben.

Review60927e0..3dd179d: keineP0–P2-Befunde. PR280 integriertacb7060, neuerSecurelauf39784682376 läuft, kein blinderRerun desgescheitertenLaufs. Produktfixunverändert enthalten; Uploadoffen.
