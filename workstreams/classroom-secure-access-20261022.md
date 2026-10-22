# GC-CLASSROOM-01 · Secure 2026 Testkandidat

Owner: ausführender Classroom-Chat mit Martin; Chatlink unbekannt. Runtime Modell/Aufwand unknown. Bestehende Task-/Versuchs-/Budgethistorie unverändert.

## Stand 22.10.2026

Eigener isolierter Branch feature/classroom-secure-access-20261022 auf nativer Integration b9edcd6. Kein Schreiben im fremden iPhone-Checkout. Webzweig feature/classroom-integrated-preview-20261016 bleibt getrennt.

Gesichert: Wartender Secure-Client fragt monoton jede Sekunde, aktiv alle fünf Sekunden, ohne Burst nach Sleep; klarer Wartetext. 29 Swift-Tests bestanden, regulärer unsigned Live-Simulatorbuild bestanden. Voriger Codecheckpoint lokal 0d207ec / remote 523a95ae, identischer Tree d5521844.

Neues Release-Delta: explizite manuelle Workflowauswahl staging2026 wählt ausschließlich SecureStaging / GradeCrew Secure Staging / staging-exam / gradecrew-staging-2026. Bestehende automatische Pushes bleiben Live; manuelle unbekannte Ziele brechen ab. Alle Layout-, Renderer-, Signierungs- und AAC-/Profilgates bleiben vorgeschaltet. Keine Integration in nativen Releasebranch, um unbeabsichtigten Live-Upload zu vermeiden. Sichtbare TESTUMGEBUNG 2026 nur im Stagingbuild. Gleiche Bundleidentität: TestFlight-Testbuild ersetzt bestehende Secure-Installation, keine zweite isolierte App behaupten.

Prüfungen: Releasewahl zuerst fehlendes Modul RED, danach vollständige Python-Skriptsuite 23/23 PASS (/private/tmp/gc-2026-release-tests.log). Staging-Simulatorbuild zunächst sandboxbedingt Swift-Macro-/Simulatordienstfehler; mit freigegebenem Xcode-Dienstzugriff BUILD SUCCEEDED (/private/tmp/gc-classroom-staging-build-approved.log). Enger unabhängiger Release-Review ohne P1/P2; eigener Releasewahltest und diff-check bestanden. Kein TestFlight-Upload aus diesen lokalen Nachweisen ableiten.

## Tatsächlicher Internetbeleg

User erlaubt beliebiges fiktives Testkonto. Über unveränderte 2026-Weboberfläche Test SYSTEMTEST · Secure 2026 · Gemeinsamer Start veröffentlicht, Code Z4VM7PVQ, SingleChoice 2+2. Originaler nativer SecureAssessmentAPI-Client mit GRADECREW_STAGING: TEST01 startete ready, kein Paper vor Lehrkraftstart; Lehrerstart über echte Weboberfläche; Resume erhielt eine Aufgabe, Submit bestätigten Receipt mit gleicher Attempt-/Submission-ID und status graded. Lehrkraftergebnis sichtbar TEST01 1/1,100%,Note1,Bewertet, Abgabe 22.10.2026 22:37:05. Nur synthetische Daten; keine Secrets gespeichert. Dieser Test ist bereits gestartet und abgegeben.

Grenzen: API-Server-Lehrerfluss belegt, kein physischer iPad-AAC-Test und keine persönliche Classroom-Identity-/Assignmentbindung. Letztere Implementierung bleibt beauftragt/offen. School-Live, Website, Functions und Rules aus diesem Native-Delta unverändert. Relevant SEC06/07/08/14/17 und PRIV07/08/12/13/17/20, keine Gesamtfreigabe.

## Nächster Schritt / externe Vorgänge

Geplant: eigener Branch nach exaktem Treevergleich sichern, dann genau ein manueller vollständiger TestFlightlauf mit release_target=staging2026. Noch nicht gestartet. GitHub-Browser verlangt zusätzliche 2FA-Verifikation; Nutzer gebeten, selbst abzuschließen, keine Codes im Chat. Run-ID nach tatsächlichem Start hier nachtragen. Vor Upload/Veröffentlichung keine Erfolgsaussage. Nach Build/Appleverarbeitung frischen wartenden Test für realen iPad-Ablauf bereitstellen.
