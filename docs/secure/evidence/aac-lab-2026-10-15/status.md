# TestFlight-Nachtrag · 15.10.2026

**GradeCrew Secure AAC Lab 0.2.0 (1031)** wurde erfolgreich zu App Store Connect/TestFlight hochgeladen.

- Build-Quellcommit: `bd064083d68e69060b7bc25062e21c5372b22f94`.
- CI: https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38742081521 — alle Schritte erfolgreich.
- 10 Swift-Tests und 11 Python-Tests grün; beide Simulator-Schemata erfolgreich.
- Xcode-Archiv und Apple-Distribution-Export erfolgreich.
- Vor Upload unabhängig geprüft: AAC in signierter App **true**, AAC im Distribution-Profil **true**, Bundle-ID `de.gradecrew.secure`, erwartetes Team, kein Development-Debugging, Profil gültig.
- Upload bestätigt am 15.10.2026, 15:26 Uhr Europe/Berlin; Delivery UUID `1353c191-e2fc-489e-a19a-4055254c778a`.
- Apple-Verarbeitung und Sichtbarkeit/Zuweisung in TestFlight nicht unabhängig bestätigt; echter AAC-iPad-Test noch offen.
- Kein Kabel und keine lokale Entwicklersignatur für diesen TestFlight-Installationsweg erforderlich.
- Die normale Lehrkräfte-App, Web-Hosting, Backend und Production wurden nicht verändert.

Für Cloud-Signing muss das AAC-Entitlement vor dem Export im Archiv erhalten bleiben. Ein ad-hoc signiertes Archiv dient nur als Metadatenträger; erst Apple erzeugt die Distribution-Signatur. Die unveränderte Prüfung des final signierten IPA hat den ursprünglichen AAC-Verlust korrekt vor einem Upload blockiert.

Die folgenden Angaben dokumentieren den früheren lokalen Zwischenstand vor dem TestFlight-Ausbau.

---

# AAC Lab · lokaler Prüfstand 15.10.2026

Branch: `feature/secure-aac-device-lab-20261015`, Ausgangscommit `9e4a581`. Isolierter erster Meilenstein des genehmigten AAC-Plans; vollständige Serverintegration bleibt offen.

## Belege

- Xcode 27.0, Build 27A266a.
- Ausgangs-AACLab für Simulator erfolgreich gebaut.
- 10 Swift-Lebenszyklus-/Runloop-Tests erfolgreich (0 Fehler).
- 6 Installationsprüfungen mit Testprofilen erfolgreich. Externe Apple-CLI-Prozesse ersetzt; kein echter Signingnachweis aus diesen Tests.
- `bash native/GradeCrewSecure/verify-on-mac.sh`: Exit 0, beide Simulator-Schemata erfolgreich gebaut, alle 16 Tests grün.
- AACLab gegen `iphoneos` für generisches Gerät erfolgreich kompiliert, ausdrücklich `CODE_SIGNING_ALLOWED=NO`.
- Normaler Release-Gerätebuild ebenfalls erfolgreich ohne Signierung.
- Reale Timer-Regression: Default-Runloop hält beim Tracking an; Test zuerst fehlgeschlagen, nach `.common`-Registrierung bestanden.
- Unabhängiges Code-Review: Timerproblem gemeldet und behoben, anschließend keine verbleibenden Blocker.
- Simulator iPad Pro 11-inch (M5), iOS 27.0: Lab direkt geöffnet, Start deaktiviert, keine Dummy-Aufgabe vor AAC-Bestätigung.
- Verbleibende Build-Warnung: AppIntents-Metadatenextraktion übersprungen, da kein AppIntents-Framework verwendet wird. Keine Swift-Actor-Konformitätswarnung im finalen Build.

## Installation / externe Voraussetzungen

Letzte `devicectl`-Abfrage zeigt ausschließlich simulierte Geräte. `security find-identity -v -p codesigning` meldet 0 gültige Identitäten. Deshalb noch kein signierter Build, kein Profilnachweis, keine Installation auf physischem iPad und kein nachgewiesener AAC-Hardwaretest.

Xcode-Projekt wurde geöffnet. Anleitung: `native/GradeCrewSecure/AAC_DEVICE_TEST.md`. Bundle-ID `de.gradecrew.secure`; Lab-Build 0.1.0 (2). App-/Profil-Entitlement werden vor skriptgestützter Installation unabhängig geprüft. Kein privates Signingmaterial im Repository.

## Abgrenzung

Lokal implementiert und geprüft; noch nicht nach GitHub gepusht, keine neue GitHub-CI, kein Staging-Deployment, kein TestFlight-Upload. Production und Lehrkräfte-App unverändert. Der 60-Sekunden-Labortest mit freiem Beenden dient ausschließlich dem Dummy-Gerätetest, nicht einer echten Schülerprüfung.

Vollständige lokale Build-/Testlogs: `work/evidence/gradecrew-aac-lab-20261015/` neben diesem Checkout.
