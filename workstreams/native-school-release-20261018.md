# Native Schulversion – GC-RELEASE-06 / GC-RESTORE-01

Auftrag: bestehendes Projekt `hausaufgabe-staging` wird Live unter unveränderter Schuladresse; neue Tests ausschließlich `gradecrew-staging-2026`. Altprojekt `hausaufgabe-40294` bleibt unberührt. Native Basisbaum `e0c29da8e8bb6e6cd2f3506159bf47fd11d8290e` entspricht remote `e447a3bd` / lokal `492bcb3`.

## Umgesetzt, noch nicht veröffentlicht

Teacher 0.2.0: Live-Standardadresse statt Integrationspreview; alte Previewpräferenz kann Live nicht umleiten. Eigener Staging-Compilerpfad, Projektbindung, eigener Bundle-Identifier und nicht persistenter Test-Webspeicher. Navigation, Remy-Verifikation und Native Bridge akzeptieren ausschließlich das gewählte Projekt. Eigene Testkonfiguration im Projektgenerator.

Secure 0.2.3: `SecureLive`-Konfiguration und AAC-Entitlement auf dem bestehenden Bundle `de.gradecrew.secure`; getrennte Test-Endpunkte, Keychain- und Antwortdatei-Namen. Historische Live-Speichernamen bleiben erhalten. Release-Prüfer unterscheidet `live-exam` von `staging-exam`.

Martin hat am 18.10. ausdrücklich entschieden: Nach dauerhafter lokaler Sicherung bei fehlender Serverbestätigung iPad freigeben und später synchronisieren. Der einzelne offene Abgabestand blockiert weitere Prüfungsstarts in dieser App bis zur Bestätigung. Kein unbeaufsichtigtes Löschen oder Weiterarbeiten am eingefrorenen Stand. Kontobezogene Token bleiben im Keychain; Antwortdatei hat Code-/Clientbindung. Alte Dateien werden nur mit passender gespeicherter Server-Versuch-ID übernommen. Beim Löschen nach Serverbeleg bleibt der Token bis zur erfolgreichen Datei-Entfernung erhalten.

Offline: tatsächlicher Controller speichert und liest den eingefrorenen Stand zurück, gibt bei Übertragungsfehlern AAC frei, behält den Stand bis zum unabhängigen Receipt und überträgt nach Neustart ohne neue AAC-Sitzung. Begrenzte automatische Wiederholungen mit Backoff, manuelle Fortsetzung bleibt möglich. HTTP503/HTML bleibt wiederholbar. Bei ausgefallener WebView nur der letzte dauerhaft gespeicherte Stand, gekennzeichnet `last_saved_snapshot`. Backend-Unterstützung für verspätete `recoverySubmission` ist separat noch umzusetzen und zu prüfen; bis dahin keine breite Schulfreigabe.

## Nachweise lokal

- Neue Umgebungsregression zuerst rot (fehlende Projektbindung), danach beide echten Swift-Compilerpfade grün.
- Alle vorhandenen Teacher-Python-Tests bestanden; Navigation/Bridge/Anmeldung und Speech-/Entwurfslogik eingeschlossen.
- Secure: 28 Swift-Tests, 20 Python-Tests und 23 Node-Tests bestanden.
- Neue versuchsgebundene Offline-Speicherregression zuerst rot (fehlender Envelope), danach grün.
- Echte SwiftUI-/WebKit-Controller-Integration auf iPad-Pro-Simulator: vier Tests bestanden, einschließlich Offline-Abgabe, App-Neustart, unveränderter Übertragung und endgültiger Receipt-Prüfung. Simulator prüft keine echte Apple-Gerätesperre.
- Teacher Release und SecureLive ohne Signierung für generisches iOS erfolgreich gebaut. Erster Sandboxlauf scheiterte an Cache-/Makrozugriff und veraltetem CoreSimulator-Dienst; regulärer Xcode-Zugriff und automatische simctl-Dienstaktualisierung funktionierten. Kein fremdes Gerät manuell beendet.
- Getrennte Cloud-Tests: 30/30 Starts, 90/90 Statusabfragen, 30/30 Abgaben/Receipts, Doppelabgabe idempotent; echter Fünf-Minuten-Test automatisch abgegeben und passender Serverbeleg empfangen.

Noch offen: späte Backend-Wiederherstellung, neue Layout-CI/Distribution/TestFlight, unabhängige Gesamtprüfung und physische iPad-Abnahme der neuen Offline-Freigaberegel. Kein neuer Upload oder Gerätetest behauptet.

## Unabhängige Prüfung

Prüfer A (Funktion) und B (Sicherheit/Randfälle) haben unveränderlich `492bcb3..24f4300` gelesen. Ein gemeinsamer P2-Befund: YAML faltete zwei Teacher-Testkommandos zu einem Python-Aufruf. `run: |` stellt jetzt zwei tatsächlich getrennte Prüfungen sicher. Reparaturversuch 1 dieser Taskfamilie. Keine weiteren bestätigten Befunde. Backend-Nachübertragung inzwischen separat im Web-Kandidaten `dd15678` umgesetzt und lokal mit echten Emulator-Transaktionen geprüft, noch nicht ausgerollt. Physische AAC-Abnahme bleibt offen.

Zusätzliche Releasegrenze: Der neue Secure-Build startet eine Prüfung erst, wenn `getAssessmentInfo` die serverseitige Offline-Recovery-Fähigkeit Version1 meldet. So kann ein früher verarbeiteter TestFlight-Build keinen neuen Versuch gegen ein noch nicht aktualisiertes Backend starten.
