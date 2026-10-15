# GradeCrew Secure AAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Dieser Auftrag endet zunächst mit dem Plan; Implementierung erst nach dessen Besprechung.

**Goal:** Einen echten, auf iPad-Hardware nachgewiesenen AAC-Prüfungsablauf von Codeeingabe bis verifizierter Abgabe und kontrollierter Freigabe bereitstellen.

**Architecture:** SwiftUI verwaltet Prüfungszustand und Apple-AAC-Lebenszyklus. Eine eingeschränkte WKWebView rendert die vorhandenen bereinigten Schüleraufgaben; der Server bleibt für Versuche, Antworten, Fristen, Bewertung und Freigaben zuständig. Vorhandene Secure-Implementierungen werden abgeglichen und gezielt zusammengeführt, nicht durch einen weiteren parallelen Backend-Vertrag ergänzt.

**Tech Stack:** Swift/SwiftUI, AutomaticAssessmentConfiguration, WebKit, URLSession, Keychain, geschützter lokaler Dateispeicher, bestehende Firebase Functions/Firestore, Node-Tests, Firebase Emulator, XCTest/XCUITest, Xcode-Signing und TestFlight.

**Spec:** [Zielbild und Abnahme](2026-10-15-gradecrew-secure-aac-spec.md)

## Global Constraints

- Erste unterstützte Plattform: iPadOS, iPad; Mindestversion für den neuen Pilot: iPadOS 17.0.
- Bundle-ID des signierten Secure-Targets: `de.gradecrew.secure`; nicht `de.gradecrew.secure.playground` und nicht die Lehrkräfte-App.
- Production und die GradeCrew-Lehrkräfte-App bleiben unverändert.
- Eine Xcode-App ist die ausführbare Quelle.
- Kein Lösungsschlüssel im Schülerclient; keine JavaScript-basierte Entsperrentscheidung.
- Kein stiller ungesperrter Fallback in Secure-Builds.
- Kein universeller Schüler-Entsperrcode; keine eingebetteten privaten Signaturschlüssel.
- Kein Deployment, keine Profiländerung und kein TestFlight-Upload im Planungsschritt.

## Review Focus

1. Apple-Start und verspätete Callbacks nach Abbruch: niemals Prüfungsinhalt nach einem bereits verworfenen Start anzeigen (Task 3).
2. WLAN-Ausfall nach serverseitig gespeicherter Abgabe: identische Abgabe verifizieren statt zweiten Versuch erzeugen oder dauerhaft blockieren (Task 5).
3. Ein eingebetteter Frame oder manipuliertes Web-Ereignis meldet Erfolg/Unverfügbarkeit: keine Entsperrung und keine fremde Wiederherstellung (Task 4).
4. App-/WebView-Prozessverlust bei ungesendeten Antworten: revisionsgebundene Wiederherstellung ohne Zeitneustart (Task 6).
5. Fremde Lehrkraft, wiederverwendete Notfreigabe oder alte Prüfungsrunde: Freigabe ablehnen und aktuellen Versuch unverändert halten (Task 7).

## 1. Tatsächlich geprüfter Ausgangspunkt

Die folgenden GitHub-Branchköpfe wurden am 15.10.2026 über `git ls-remote` gelesen:

| Bereich | Branch / Commit | Erkenntnis |
|---|---|---|
| Secure iOS | `feature/gradecrew-secure-ios` / `24a05737df468e7297ba7631877d6987be1336b7` | Weiterentwickelter Ablauf im Playground-Verzeichnis; beide Aktivierungsschalter stehen auf `false`. |
| Secure Assessment Backend | `feature/secure-assessment-v1` / `76417085b6ae42cb9f6d5733af726c2eeb05dd79` | Eigener Serververtrag für bereinigte Aufgaben und verbindliche Bewertung. |
| Integration | `integration/secure-assessment-mobile-gc28` / `744d1d59e29f4f19c798b2eb65351618e50c9f6f` | Gesonderte Integrationsbasis; darf nicht allein wegen des Branchnamens als aktuell ausgeliefert gelten. |

Das alte `native/GradeCrewSecure`-Xcode-Projekt enthält vier Swift-Dateien und einen AAC-Labortest. Nur dessen spezielle AACLab-Konfiguration enthält bislang die Entitlement-Datei. Der Labortest hat einen normalen Beenden-Knopf und einen 60-Sekunden-Timer. Beides ist für lokale Tests vorgesehen und darf nicht als Ende einer echten Prüfung übernommen werden.

Im Secure-iOS-Branch existieren bereits `SecureAssessmentController.swift`, `SecureBackendFlow.swift`, `SecureExamAPI.swift` und `SecureAttemptStore.swift` unter `native/GradeCrewSecurePlayground.swiftpm`. Diese enthalten Vorprüfung, Vorbereitung, Warteraum, AAC-Anbindung, geschützte Credentials und native Quittungsprüfung. Die SwiftPM-Bundle-ID weicht vom genehmigten Identifier ab. Diese Vorarbeit soll erhalten bleiben und in das Xcode-Target überführt werden.

Es existieren zwei verwandte Backend-Pfade: `functions/secure-exam-entry.js` mit `secureExamApi` und `assessment-functions/` mit Assessment-Callables. Vor einem Merge muss ihre tatsächliche Integration ermittelt werden. Die vorliegenden README-Texte sind teilweise vom September und kein Beweis des heutigen Deploymentstands.

**Konkrete offene Punkte aus dem gelesenen Code:**

- `testUnavailable` kann im bisherigen nativen Container `assessment.abort(...)` auslösen. Ein Web-Hinweis darf künftig keine Freigabeberechtigung darstellen.
- Der Container zeigt die WebView ohne ausdrückliche, aus dem AAC-Zustand abgeleitete native Schutzabdeckung. Das sofortige Verbergen bei Unterbrechung muss als UI-Invariante umgesetzt und getestet werden.
- Die Quittungsprüfung endet nach zwölf Versuchen in einer blockierenden Ansicht; expliziter Retry und betreute Freigabe fehlen dort.
- Die Bridge prüft die URL der WebView, aber nicht ausdrücklich `message.frameInfo.isMainFrame` und den Frame-Ursprung.
- Credentials und Snapshot stehen bisher im Keychain; große Antwortdaten werden begrenzt und teilweise still verworfen. Speicherfehler müssen sichtbar behandelt werden.
- Vorbereitung wiederholt Requests innerhalb eines Aufrufs mit gleicher ID; Wiederholung nach Prozessverlust benötigt ebenfalls dauerhaft gespeicherte Vorbereitungsidentität.

**Noch nicht in diesem Planungsschritt geprüft:** aktive Apple-Profilinhalte, signiertes Secure-Archiv, aktuelle Firebase-Deploymentversion, offene Secure-PRs, installierter Secure-Build und physische AAC-Sperre. Task 1 erhebt diese Belege, bevor Code übernommen wird.

## 2. Gewünschter Ablauf aus Schülersicht

1. GradeCrew Secure öffnen → Testcode eingeben, optional später QR-Code als Komfortfunktion.
2. Server prüft, ob der Test freigegeben, erreichbar und für Secure geeignet ist. Noch keine Sperre und keine Aufgaben.
3. Titel, Fach, Klasse, Dauer und Name/vereinbartes Kürzel bestätigen. Lehrer-Login und Schüleridentität bleiben getrennte Vorgänge.
4. Bei gemeinsamem Start: Warteraum. Solange keine Prüfung begonnen hat, darf man zurückgehen.
5. Bewusster Start: „Prüfungsmodus starten“. Apple kann eine Systembestätigung zeigen; diese wird nicht umgangen.
6. Nur nach Apples Start-Callback wird der gebundene Versuch aktiviert und das Schülerformular angezeigt.
7. Bearbeiten mit sichtbarem Speicherstatus und serverbestimmter Restzeit. Kein Home-Knopf, kein Testwechsel und kein Entwicklerwerkzeug in der Prüfung.
8. „Verbindlich abgeben“ mit kurzer Bestätigung. Letzten Antwortstand festschreiben, dann denselben Abgabeauftrag bei Bedarf wiederholen.
9. Native App verifiziert die Serverquittung selbst. Währenddessen ist klar erkennbar, dass gespeichert/geprüft wird.
10. Prüfungsinhalt verbergen → `session.end()` → Apples End-Callback abwarten → „Abgabe gespeichert“ und Rückkehr zur Secure-Startseite.

Nach einer Abgabe werden keine Lösungen einer noch laufenden Prüfungsrunde eingeblendet. Ein zweiter Durchgang benötigt einen neuen autorisierten Versuch.

## 3. Zustände und Befugnisse

App-Zustände: `idle`, `preflight`, `prepared`, `waiting`, `startingAAC`, `activatingAttempt`, `active`, `submitting`, `verifying`, `endingAAC`, `completed`, `interrupted`, `recoveryRequired`, `releaseRequired`.

| Ereignis | Verhalten |
|---|---|
| AAC-Start abgelehnt | Keine Aufgaben anzeigen, gespeicherten vorbereiteten Versuch behalten, verständliche Meldung + erneuter Start. |
| Server-Aktivierung scheitert nach AAC-Start | Vor Inhaltsoffenlegung prüfen, ob Versuch aktiviert wurde; kein pauschaler Web-Abbruch. Sicheres Ende nur für nachweislich nicht gestarteten Versuch, sonst Wiederherstellung/Lehrerfreigabe. |
| WLAN fehlt während Bearbeitung | Antworten lokal sichern, klaren Offline-Status zeigen, gleichen Versuch weiterführen soweit Inhalte vorhanden sind. |
| Deadline erreicht | Antworten einfrieren, identischen finalen Snapshot abgeben; keine lokale Zeitverlängerung und keine bloße Timer-Entsperrung. |
| Abgabe gesendet, Antwort verloren | Status/Quittung desselben Versuchs erneut prüfen, keine neue Submission-ID. |
| AAC-Systemunterbrechung | Native Schutzfläche sofort über Inhalt, Unterbrechung bestmöglich speichern/melden, Apple-konform beenden. Keine normale erfolgreiche Abgabe behaupten. |
| App-Neustart | Vor Anzeige von Aufgaben gespeicherten Versuch erkennen; Status abgleichen und AAC erneut bestätigen lassen. Kein automatischer Neustart der Prüfungszeit. |
| Server bestätigt Lehrerfreigabe | Inhalt verbergen, genehmigten terminalen Versuchszustand speichern, AAC kontrolliert beenden. |

`SecureAssessmentController` besitzt ausschließlich die Apple-Sitzung. `SecureExamCoordinator` verbindet Server, Speicher, WebView und Zustand. Views treffen keine eigenen Freigabeentscheidungen. Ein `ReleaseAuthorization` entsteht nur aus einer geprüften Serverantwort oder aus der gesondert geprüften betreuten Offline-Freigabe.

## 4. Implementierungsaufgaben

### Task 1: Secure-Basis und laufende Umgebung verbindlich bestimmen

**Files:** Create `docs/secure/2026-10-15-baseline.md`; späterer Arbeitsbranch auf geeigneter Secure-Basis, ohne Checkout-Wechsel im laufenden Teacher-Arbeitsverzeichnis.

**Interfaces:** Produziert eine Baseline mit Commit, PR-Liste, tatsächlich ausgeliefertem API-Vertrag, Staging-Projekt, Hosting-Version, Secure-Bundle, Build und Apple-Team-ID (keine Secrets).

- [ ] Secure-PRs, Branchdifferenzen, Übergaben und laufende CI lesen; passende bestehende Worktree-Zuordnung prüfen.
- [ ] `preflight`, `prepare`, `status`, `start`, `save`, `submit`, `verify`, `abort` aus vorhandenem iOS-Vertrag gegen das tatsächlich ausgelieferte Backend abgleichen.
- [ ] Den Serververtrag verbindlich wählen: vorhandenes `secureExamApi` als nativer Einstieg; vorhandene Assessment-Funktionen für Bereinigung/Bewertung wiederverwenden, wenn sie die Zielbasis bilden. Keine zweite Bewertungslogik unabhängig weiterentwickeln.
- [ ] Nicht verfügbare Deployment-/Signingbelege als offen markieren, nicht aus README oder Nutzerbericht ableiten.
- [ ] Baseline dokumentieren und separat committen; Gate: ein eindeutig bestimmter Integrationsstand, keine ungeklärten parallelen Datenmodelle.

### Task 2: Xcode-App und Signierung vereinheitlichen

**Files:** Modify `native/GradeCrewSecure/generate_project.py`, `.xcodeproj/project.pbxproj`, `Sources/GradeCrewSecureApp.swift`, Shared Schemes; Create `Config/GradeCrewSecure.entitlements`, `Config/Staging.xcconfig`, `Tests/BuildConfigurationTests.swift`; vorhandene Playground-Secure-Dateien gezielt nach `Sources/` übernehmen.

**Interfaces:** `SecureBuildConfiguration` liefert Umgebung, API-Basis, erlaubten Hosting-Ursprung und `requiresAAC`; kein Laufzeit-Schalter zum Abschalten von AAC in einem verteilten Secure-Build.

- [ ] Zuerst Konfigurationstest: Release-Pilot verwendet `de.gradecrew.secure`, iPadOS 17.0 und AAC-Entitlement; Simulator wird ausdrücklich als Simulation bezeichnet.
- [ ] Alte 4-Dateien-Annahme im Generator ersetzen; Testtarget, Resources und neue Quelldateien deterministisch aufnehmen.
- [ ] Separates Lab-Schema behalten; dessen 60-Sekunden-Ende nie im Prüfungs-Schema kompilieren.
- [ ] Team und automatische Signierung konfigurieren; Profil auf AAC und erlaubte Distribution prüfen. Keine Zertifikate vorsorglich löschen.
- [ ] Simulator-Build und XCTest ausführen; signierten Development-Build erstellen. `codesign -d --entitlements :- <app>` und `security cms -D -i <app>/embedded.mobileprovision` prüfen, nur bereinigte Ergebnisse speichern.
- [ ] Gate: App-Identifier/Team/Entitlement/Profil stimmen überein; Commit der reproduzierbaren Projektkonfiguration.

### Task 3: AAC-Lebenszyklus und native Schutzabdeckung

**Files:** Create `Sources/SecureAssessmentController.swift`, `Sources/SecureExamCoordinator.swift`, `Sources/SecureExamState.swift`, `Tests/SecureAssessmentControllerTests.swift`; Modify Schüler-Container.

**Interfaces:** `AssessmentSessionDriving.begin()` / `.end()` und typisierte Delegate-Ereignisse einschließlich `assessmentSessionDidBegin`, `failedToBeginWithError`, `wasInterruptedWithError` und `assessmentSessionDidEnd`; Coordinator nimmt `handle(event: SecureExamEvent)` entgegen. Session-Generation verhindert veraltete Callbacks. UI darf Aufgaben nur in `.active` bei aktuell bestätigter AAC-Session zeigen.

- [ ] Fehler zuerst testen: verspätetes DidBegin nach verworfenem Start, zweimaliges Starten, falsche Session-Instanz, Unterbrechung, unerwartetes DidEnd, Ende vor Callback.
- [ ] `@MainActor` für Zustandsführung; Session bis zum terminalen Callback halten; Apple-Adapter hinter injizierbarem Protokoll.
- [ ] Native undurchsichtige Abdeckung schaltet synchron bei Unterbrechung/ungültigem Zustand ein; WebView nur verstecken per JavaScript genügt nicht.
- [ ] Normale Navigation, interaktives Dismiss, neue Fenster und weitere Szenen während aktiver Sitzung verhindern. Drittanbieter-Tastaturen weiterhin deaktivieren.
- [ ] Unit-Tests + UI-Tests grün; Gate: keine Aufgaben vor DidBegin, kein Erfolg vor DidEnd, keine alte Callback-Generation kann Inhalte öffnen; Commit.

### Task 4: WebView-Vertrauensgrenze und Aufgabenintegration

**Files:** Create `Sources/SecureExamWebView.swift`, `Sources/SecureWebEvent.swift`, `Tests/SecureWebBridgeTests.swift`; Modify `secure-exam.js`, `secure-exam.html`, `secure-exam.css` auf der gewählten Integrationsbasis.

**Interfaces:** Web-Ereignisse sind `ready`, `snapshot`, `submissionPending`, `unavailableHint`; keine Methode `unlock`. Jeder Zustand ist an Attempt-ID, Run-ID und Bridge-Version gebunden.

- [ ] Tests für fremden Ursprung, Subframe, Redirect, `target=_blank`, `javascript:`/`file:`/externe App-Schemes und unbekannte/überdimensionierte Nachrichten zunächst rot.
- [ ] Bridge verlangt Hauptframe und exakten HTTPS-Ursprung/Pfad. Navigation und Ressourcenpolicy getrennt behandeln; kein pauschales Blockieren der für Aufgaben nötigen Bild-/Audioressourcen.
- [ ] `unavailableHint` löst native Statusprüfung aus; ein Web-Hinweis allein beendet keine laufende Prüfung.
- [ ] Bootstrap-Credentials nie in URL, Logs oder Navigation schreiben; temporäre Web-Speicherung, kein fremder Login-/Teacher-Bereich, keine Downloads/Share-Funktion in laufender Prüfung.
- [ ] Alle elf vorhandenen Aufgabentypen sowie vorhandene Bild-/Höraufgaben über bereinigten Schülervertrag testen. Accessibility und benötigte Hilfsmittel ausdrücklich prüfen statt blind sperren.
- [ ] Gate: manipulierte Web-Erfolgsmeldung und Unavailable-Nachricht entsperren nicht; Commit.

### Task 5: Verbindliche Abgabe und native Quittungsprüfung

**Files:** Create `Sources/SecureExamAPI.swift`, `Sources/SecureSubmissionCoordinator.swift`, `Tests/SecureSubmissionTests.swift`; Modify `functions/secure-exam-entry.js`, `functions/lib/secure-exam-core.js` oder deren bestätigte Integrationsentsprechung; Test `functions/test/secure-exam-lifecycle.test.js`.

**Interfaces:** `submit(attemptID: String, submissionID: String, revision: Int, answers: AnswerSnapshot)` liefert eine wiederholbare Quittung. `verify(credentials:)` liefert serverseitig gebundene `attemptID`, `runID`, `submissionID`, `finalRevision`, `terminalStatus`, `receiptID`. `ReleaseAuthorization.submitted` entsteht erst nach vollständigem Abgleich.

- [ ] Tests zuerst: parallele Abgabe, WLAN-Verlust nach Commit, fremde Quittung, falsche Revision, bereits abgeschlossener Versuch, unbekannte Antworten, manipulierte Punkte, abgelaufene Runde.
- [ ] Beim ersten Submit finale Revision/Snapshot dauerhaft einfrieren. Änderungen während der Abgabe nicht still in einen anderen Retry übernehmen.
- [ ] Server schreibt Submission und terminalen Attempt atomar; Retry liefert gleiche Quittung. Serverseitige Fristen und bereits vorhandene Grace-Policy explizit prüfen; Offlinezeit nie ungeprüft als Beweis verwenden.
- [ ] Native Verifikation läuft unabhängig von der WebView. „Abgabe erneut prüfen“ und automatische Wiederholung mit begrenztem Backoff; kein unsichtbarer Dauerzustand nach zwölf Versuchen.
- [ ] Nur mit passender Quittung: Aufgaben verbergen → AAC-Ende → End-Callback → Startmenü. Bei reinem Transportfehler bleiben Daten erhalten.
- [ ] Node-/Emulator-/Swift-Tests grün; Gate: genau eine Submission und sichere Wiederaufnahme bei verlorener Antwort; Commit.

### Task 6: Autosave, Prozessverlust und Wiederaufnahme

**Files:** Create `Sources/SecureAttemptStore.swift`, `Sources/SecureRecoveryCoordinator.swift`, `Tests/SecureRecoveryTests.swift`; Modify Web-Snapshot-/Server-Save-Vertrag.

**Interfaces:** Persistiertes `AttemptRecoveryEnvelope` enthält Schema-Version, Attempt-/Run-/Paper-ID, Prepare-ID, Revision, Antworten und gegebenenfalls finalen Abgabeauftrag. Credentials im Keychain; Antwortdaten in atomar geschriebenem, geschütztem Datei-Storage mit Schlüssel im Keychain, Backup ausgeschlossen.

- [ ] Tests zuerst: alter Snapshot nach neuer Revision, falscher Versuch, beschädigte Datei, volle Platte, Keychain nicht verfügbar, Absturz zwischen Prepare und Response, WebView-Prozessabbruch.
- [ ] Prepare-ID und Token vor erstem Request dauerhaft sichern; bei Neustart denselben Vorbereitungsauftrag auflösen.
- [ ] Kein stilles Verwerfen großer Snapshots: Schema-/Größenfehler sichtbar; kein „gespeichert“ ohne bestätigte Persistenz. Lokaler Speicherstatus und Serverstatus getrennt darstellen.
- [ ] Server übernimmt monotone Revisionen; veraltete Autosaves überschreiben keinen neueren Stand. Finalisierte Abgabe nimmt keine weiteren Antworten an.
- [ ] Wiederherstellung verdeckt Aufgaben bis AAC erneut bestätigt ist; gleiche Frist und Paper-Fassung, kein neuer Versuch als Umgehung.
- [ ] Daten nach unabhängig bestätigtem terminalem Zustand bereinigen; bei abgebrochenem Upload bleiben unbestätigte Daten bis geklärter Recovery erhalten. Nach erfolgreicher Synchronisierung lokale Inhaltsdaten löschen.
- [ ] Gate: Prozessverlust-/Offline-Szenarien ohne Antwortverlust innerhalb bestätigter Speichergrenze; Commit.

### Task 7: Lehrerfreigabe und betreuter Notfall

**Files:** Create `Sources/SecureReleaseCoordinator.swift`, `Sources/TeacherReleaseView.swift`, `Tests/SecureReleaseTests.swift`, `docs/secure/emergency-runbook.md`; Modify bestehende Teacher-Secure-Oberfläche und Server-Lifecycle.

**Interfaces:** `requestTeacherRelease(attemptID:, reason:)` wird nur für authentifizierte, für diesen Test berechtigte Lehrkraft akzeptiert. Schülerapp liest lediglich gebundenen Freigabestatus. Terminale Zustände `submitted`, `teacherReleased`, `interrupted` werden nicht miteinander gleichgesetzt.

- [ ] Zuerst Rechte-/Replay-Tests: fremde Lehrkraft, falsche Runde, bereits verbrauchte Freigabe, Schüler-Bearer ohne Teacher-Recht, verspäteter Freigabebefehl für alten Versuch.
- [ ] Online: Lehrer bestätigt konkreten Versuch und Grund; Server protokolliert Freigabe. Schülerapp prüft sie unabhängig und beendet AAC kontrolliert. Nicht abgegebene Prüfung wird nicht als erfolgreich abgegeben markiert.
- [ ] Offline-Pilot: vor Prüfungsbeginn pro vorbereitetem Versuch einen serverseitig signierten Notfallbeleg ausschließlich der berechtigten Lehrkraft bereitstellen. App enthält nur öffentlichen Prüfschlüssel; Beleg bindet Attempt, Runde, Gerät-/Installationsbindung und einmalige Nonce. Keine globale PIN.
- [ ] Beleg erst nach bewusster Lehrerhandlung eingeben; lokal verbrauchte Nonce atomar merken, Replays verhindern und später serverseitig abgleichen. Eingabe offline auf echter Hardware praktikabel prüfen; kein QR-Scanner als notwendiger Weg innerhalb AAC.
- [ ] Offline-Freigabe setzt lokal `recoveryRequired/teacherReleased`, zeigt keine Erfolgsmeldung und bewahrt unbestätigte Antworten. Ist der Beleg nicht vorhanden, gilt der dokumentierte betreute System-Notfallweg; ein Neustart ist kein Prüfungsabschluss.
- [ ] Gate: keine Schülerselbstfreigabe, kein endloser Serverausfall ohne betreutes Verfahren; vor Klassenpilot verbindlich testen; Commit.

### Task 8: Automatische Qualitätsprüfung und CI

**Files:** Create `.github/workflows/gradecrew-secure-ios.yml`, `native/GradeCrewSecure/Tests/`, `native/GradeCrewSecure/UITests/`, `tools/secure/verify-signing.sh`, `docs/secure/test-matrix.md`; bestehende Server-/Rules-Tests erweitern.

**Interfaces:** CI publiziert pro Commit Testresultate, Build-Metadaten und Screenshots; kein Secrets-/Credential-/Antwortdump. Simulator-Läufe melden niemals „AAC-Hardware bestanden“.

- [ ] Swift-Unit-Tests für Task 3–7; UI-Tests mit ausdrücklich gekennzeichnetem AAC-Testadapter und injizierten Netzwerkfehlern.
- [ ] Geräteklassen: kleines iPad, iPad 11 Zoll, iPad 13 Zoll; Hoch-/Querformat, große Schrift, Bildschirm-/externe Tastatur. Kleine Split-View-Breite vor AAC; tatsächliches Multitaskingverhalten während AAC auf Hardware.
- [ ] UI-Gates: keine abgeschnittenen Felder, erreichbare Abgabe/Retry/Notfallbedienung, kein horizontaler Overflow; ruhige symmetrische Ausrichtung, Safe Areas und Keyboard-Inset berücksichtigt.
- [ ] Server-/Emulatortests: Lösungen privat, fremde Attempts verboten, Token-/Run-Bindung, Rechte, parallele Abgabe, Revisionen und Freigaben. Bekannte bestehende Checks vor Änderungen als Baseline laufen lassen.
- [ ] Reproduzierbarer Simulator-Build mit `xcodebuild test -project native/GradeCrewSecure/GradeCrewSecure.xcodeproj -scheme 'GradeCrew Secure' -destination '<von simctl ermitteltes iPad-Ziel>'`; Ziel nicht anhand erfundener Gerätenamen fest verdrahten.
- [ ] Node-Tests über die vorhandenen Package-Scripts der gewählten Basis; Rules-Tests gegen Emulator. Keine grünen Ergebnisse ohne tatsächlich ausgeführte Befehle dokumentieren.
- [ ] Gate: gesamte Secure-Pipeline grün und Fehlerpfade nachgewiesen; Commit.

### Task 9: Gestufter Hardwaretest, Staging und TestFlight

**Files:** Create `docs/secure/releases/<version>-<build>.md`, `docs/secure/device-test-template.md`; Modify Secure-README/Status auf verifizierte Aussagen.

**Interfaces:** Release-Nachweis enthält Git-SHA, Backend-/Rules-/Hostingstände, Bundle-ID, App-Version, Buildnummer, CI-Run, Signingprüfung, TestFlight-Verarbeitung und Hardwareprotokoll.

- [ ] Zuerst isolierter echter AAC-Labortest auf eigenem iPad, Dummy-Inhalt, bekannter 60-Sekunden-Rückweg. Keine Breakpoints während der aktiven Sperre. Kein Klassenpilot mit ungetesteter Freigabe.
- [ ] Danach kompletter Secure-Durchlauf auf Staging: Vorbereitung, AAC, Antworten, Submit, native Verify, Ende. Geeigneten sicheren Staging-Test ausdrücklich markieren; eine großzügige Staging-Pilot-Ausnahme ersetzt keine Rules-Abnahme.
- [ ] Hardwarematrix dokumentieren: Home-Geste, App-Switcher, Control/Notification Center, Safari-/externe Links, Dock/Multitasking, externe Tastatur, Screenshot/Aufnahme, Siri/Diktat, Bildschirm sperren, Audio, Netzwerkwechsel, unerwartete Unterbrechung. Erwartetes/erlaubtes Verhalten pro Plattform dokumentieren; keine pauschale Annahme über jede Systemfunktion.
- [ ] Staging-Deployment nur gezielt nach Baseline-/Diffprüfung; keine Full-Deploys, die andere Functions oder Rules versehentlich zurücksetzen.
- [ ] Signiertes Secure-Archiv erstellen und Entitlements im exportierten Produkt prüfen. Distributionfreigabe gesondert prüfen: Development-Zulassung allein beweist TestFlight-Eignung nicht.
- [ ] Interner TestFlight-Upload der separaten Secure-App. Upload, Apple-Verarbeitung und tatsächliche Verfügbarkeit für Tester einzeln bestätigen.
- [ ] Auf physischem Gerät TestFlight-Installationspfad wiederholen. TestFlight-Erfolg ersetzt den Sperr-/Recovery-Gerätetest nicht.
- [ ] Erst danach kleiner beaufsichtigter Pilot mit fiktiven Daten, Lehrkraftgerät und ausgedrucktem Notfallablauf. Production-Freigabe bleibt ein gesonderter Auftrag.

## 5. Release-Stufen und realistische Reihenfolge

| Stufe | Ergebnis | Freigabekriterium |
|---|---|---|
| A | Genehmigung im signierten Produkt nutzbar | AAC startet und endet auf eigenem iPad mit Dummy-Inhalt. |
| B | Vollständiger Staging-Prüfungsdurchlauf | Bereinigte Aufgaben, Autosave, genau eine Abgabe, native Quittung, Apple-Ende. |
| C | Belastbarer betreuter Pilot | Unterbrechung, Offline, Neustart, Lehrerfreigabe und Notfall nachgewiesen. |
| D | Interner TestFlight-Build | Signierung/Distribution + Apple-Verarbeitung + physischer Wiederholungstest. |
| E | Beaufsichtigter Klassenpilot | Dokumentierte unterstützte Geräte/OS, alle Gates erfüllt, separate Entscheidung. |

Die Reihenfolge verhindert, dass wir den ganzen Backend-Umbau als Voraussetzung für den ersten AAC-Nachweis behandeln. Stufe A ist der erste kleine überprüfbare Fortschritt. Sie allein ist noch keine sichere echte Prüfung.

Eine belastbare Dauer wird nach Task 1 und dem ersten signierten Hardwarelauf angegeben. Hauptunsicherheit ist die Zusammenführung der bereits vorhandenen Serverpfade und deren Deploymentstand; Apple-Verarbeitung und physische Tests sind externe Warte-/Mitwirkungsschritte. Kein Versprechen „heute sicher fertig“, bevor diese Basis bekannt ist.

## 6. Was „nicht verlassen können“ hier präzise bedeutet

Während Apple die AAC-Sitzung als aktiv bestätigt, verlässt sich die App auf den vom Betriebssystem vorgesehenen Prüfungsmodus. Zusätzlich gibt GradeCrew keinen normalen eigenen Ausstieg oder Browser-Fluchtweg frei. Reguläres Ende benötigt eine bestätigte Abgabe oder eine autorisierte Lehrerentscheidung.

Ein OS-Abbruch, erzwungener Neustart, Stromverlust, kompromittiertes Gerät oder zweites Telefon kann durch App-Code nicht absolut ausgeschlossen werden. Solche Ereignisse dürfen keinen unsichtbaren frischen Versuch und keinen falschen Erfolgsstatus erzeugen. AAC-Status ist außerdem kein kryptografischer Serverbeweis: ein gesendetes `aacActive: true`, User-Agent oder ein App-Check-Token beweist keinen aktiven AAC-Modus. App Attest/App Check können separat die Client-/Request-Vertrauensbasis verbessern, ersetzen diese Grenze aber nicht. Für den beaufsichtigten Pilot wird echte Secure-App-Nutzung organisatorisch kontrolliert; härtere Remote-Zulassungsanforderungen benötigen einen gesonderten Entwurf.

## 7. Status zum Ende dieses Planungsschritts

| Ebene | Stand |
|---|---|
| Apple-Portal | Genehmigung/Aktivierung vom Nutzer gemeldet. |
| Lokal | Vorhandenen Xcode-/Secure-Code gelesen; diese beiden Planungsdokumente erstellt. |
| GitHub | Drei Secure-Branchköpfe gelesen; keine Branches geändert, kein neuer PR. |
| CI | In diesem Planungsschritt kein Secure-Build/Testlauf gestartet. |
| Staging | Deploymentstand noch nicht unabhängig erhoben; nichts deployed. |
| TestFlight | Kein neuer Secure-Build erzeugt oder hochgeladen. |
| Gerätetest | Kein neuer AAC-Gerätetest nachgewiesen. |
| Production | Unverändert. |

## 8. Quellen

- Apple, Framework-Überblick: https://developer.apple.com/documentation/automaticassessmentconfiguration/
- Apple, Start-/End-Delegates: https://developer.apple.com/documentation/automaticassessmentconfiguration/aeassessmentsessiondelegate
- Apple, Unterbrechungsvertrag (Inhalte verbergen und `end()` aufrufen): https://developer.apple.com/documentation/automaticassessmentconfiguration/aeassessmentsessiondelegate/assessmentSession(_:wasInterruptedWithError:)
- Apple, Session und Abschluss-Callback: https://developer.apple.com/documentation/automaticassessmentconfiguration/aeassessmentsession
- Apple, Vorbereitung von Prüfungs-Apps: https://developer.apple.com/documentation/automaticassessmentconfiguration/preparing-an-educational-assessment-app-for-distribution
- Apple, Managed Capabilities und Profile: https://developer.apple.com/help/account/reference/provisioning-with-managed-capabilities/

Die Zustandsmaschine, Freigabe-/Recovery-Verträge und Gates sind unser Implementierungsentwurf aus den Produktanforderungen und dem gelesenen Code; Apple liefert dafür den AAC-Lebenszyklus, nicht die GradeCrew-Serverlogik.
