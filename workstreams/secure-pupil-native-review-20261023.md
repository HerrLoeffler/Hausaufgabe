# GC-CLASSROOM-01 / GC-IOS-02 — persönlicher Secure-Einstieg

Stand23.10.2026, ausführender Native-Chat01a10c75-8912-7a12-98f0-c9e78064aa2c. Bestehende Task-/Versuchshistorie fortgeführt, Runtime-Modell/Aufwand unbekannt, kein Modellwechsel. Direkter Auftrag: zusätzlichen Einstieg mit persönlichem achtstelligem Schülercode für den 2026-Test nutzbar machen; getrennte Test-App und TestFlight-Rückkehr beurteilen.

## Vorhandener Stand und Zuständigkeit

Remote feature/classroom-secure-access-20261022 frisch gelesen: a29967463041aa51cdb6ff6f8b1f9f418ddf6cfd. Native Dateien identisch zum bereits gebauten Featurekandidaten efc5e980e87adaf628ec20eb5c03105c73d9ceb7. SecurePupilAccess.swift und SecurePupilPolicy.swift implementieren persönlichen Zugang und zugewiesene Testliste. SecureStagingRootView bietet den zusätzlichen Button neben dem vorhandenen Teststart, nur mit GRADECREW_STAGING. Code wird nicht als Rohcode dauerhaft gespeichert; Session liegt im umgebungsspezifischen ThisDeviceOnly-Keychain. Auswahl übergibt servergebundene Assignment-ID und Generation an den vorhandenen Coordinator.

Classroom-Owner01a10c7f-95f0-7360-a2e3-be5b970fbcb9 arbeitet aktuell an 2026-Serverstartfehler und Lehrerübersichtsplan. Keine zweite Loginimplementierung und keine parallele Änderung seiner Produktdateien. Direktes Messaging an diesen Owner ist beim Nutzer angefragt, noch nicht bestätigt. Bereits genehmigte technische Berichte an den Domainchat wurden gesendet. Die native Schreibzuständigkeit ist vor überlappenden Änderungen abzustimmen.

Eigener bereits isolierter Checkout /private/tmp/gc-native-domain-20261022, QA-Branch review/secure-pupil-entry-20261023, Ausgangsbaum9d797120d9b1fbf16433d0683153ea2c717eaec7. Vorherige Domainarbeit bleibt auf ihrem eigenen Branch und ist bereits veröffentlicht. Keine Änderung an Schul-Live, Backend, Rules oder Apple-Einstellungen.

## Tatsächliche neue Prüfungen

- 33 Swift-Tests auf a2996746 bestanden, Exit0. Log /private/tmp/gc-pupil-native-qa-20261023-swift.log.
- SecureStaging-Simulatorbuild mit24Quellen erfolgreich, Exit0. Log /private/tmp/gc-pupil-native-qa-20261023-build.log; Produkt unter /private/tmp/gc-pupil-native-qa-build-20261023. Info bestätigt staging-exam, de.gradecrew.secure, Gerätefamilien1+2, Mindest-iOS17.
- Source-/Buildkonfiguration bindet GRADECREW_STAGING an gradecrew-staging-2026, eigene Attempt-/Telemetry-Keychaindienste und SecureTest2026-Verzeichnis. Native-Live1192 bleibt unverändert.
- Lokaler Build auf eigenem iPhone16/iOS27-Simulator53F3E226 installiert und gestartet. CUA bietet Simulator nicht an; kein behaupteter visueller oder interaktiver Loginbeleg. Keine echten Schülerdaten verwendet und keine persönliche Anmeldung gegen den gestörten Server versucht.

## Exakter TestFlight-Blocker

Run39858281409 auf efc5e980, Versuch1: Phonejob120107992379 failed, Upload120113835388 skipped. Native900 sowie beide iPad-Webjobs bestanden. Artifact12461379858 lokal gesichert, kein neuer Versuch gestartet.

Native540/540Geometrieberichte ohne Befund; Web216/216,12Interaktionen und6Composed-Flows bestanden. Tatsächlicher Fehler: SecureReturnUITests.testPhoneLandscapeReturnAndKeyboardEntry, Zeile23 back.isHittable nach einem app.swipeUp falsch. Danach fehlt entry.code, weil die Rückkehr nicht erfolgte. AX zeigt Fenster874×402, Scrollinhalt588.3hoch, Position0%, Button bei y452.5 unter dem sichtbaren Bereich. Portrait-Return und Lifecycle bestanden. Kein daraus bewiesener Fehler der persönlichen Anmeldung. Detailprotokoll /private/tmp/gc-pupil-phone-failure-20261023/native-xcodebuild.log; Artifact enthält kein xcresult. Nächster Native-Schritt: Scroll-/Rückkehrproblem reproduzieren und sauber beheben, ohne Hittability-Assertion abzuschwächen.

## Release-Entscheidung und Grenzen

Empfehlung für den ersten Versuch: vorhandene App mit klar gekennzeichnetem 2026-TestFlightbuild und bestehendem Zusatz-Einstieg weiterführen. Das ist noch keine gesondert installierbare Test-App. Eine dauerhaft parallele Secure Test würde denselben Code verwenden, aber eine neue Bundlekennung, getrennte Apple-/TestFlight-Einrichtung und geprüfte AAC-Aktivierung/Signierung benötigen. Eine solche Apple-Einrichtung wurde nicht gestartet.

TestFlight erlaubt verfügbare frühere Builds (maximal90Tage) über „Vorherige Builds“. Das tauscht den Appbuild aus und setzt keine Serverdaten zurück. Nur außerhalb aktiver Prüfungen wechseln und offene Offline-Abgaben zuvor synchronisieren. Quellen: https://testflight.apple.com/ und https://developer.apple.com/help/account/capabilities/capability-requests/.

Kein neuer TestFlightupload, kein vollständiger persönlicher Onlineablauf und keine physische AAC-Abnahme behauptet. Backendabhängigkeit bleibt beim Classroom-Owner. Bestehende Liveversion1192 und Lehrer-App51 unverändert. Relevanter Assuranceumfang: SEC06/07/08/14/17 und PRIV07/08/12/13/17/20; begrenzte Tests sind keine allgemeine Sicherheits- oder Datenschutzfreigabe.
