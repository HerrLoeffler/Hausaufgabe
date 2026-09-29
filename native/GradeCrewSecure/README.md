# GradeCrew Secure · Schritt 1

Stand: 29.09.2026. Native SwiftUI-App für iPadOS 16+. **Entwicklungsprototyp, keine freigegebene Prüfungs-App.** Bestehendes Hosting/Backend wird nicht geändert. Keine Fremdbibliotheken oder zusätzlichen kostenpflichtigen Entwicklungswerkzeuge.

## Was dieser Stand kann

- Native Codeeingabe (4–16 ASCII-Buchstaben/Ziffern), öffnet die bestehende Schülerroute `https://hausaufgabe-staging.web.app/?test=CODE`.
- Staging-Vorschau in WKWebView, dauerhaft als **ohne Gerätesperre** bezeichnet. Website kann Übungsabgaben im Staging-Backend speichern; nur fiktive Daten verwenden.
- Navigation beschränkt auf exakten HTTPS-Staging-Host; keine Popups, externen Apps, native JavaScript-Brücke oder persistente Web-Anmeldung. Das ist keine Netzwerk-Firewall: Webressourcen können Firebase/CDNs kontaktieren.
- Separater lokaler AAC-Hardwaretest: Aufgabe erst nach Apples `assessmentSessionDidBegin`, Unterbrechung blendet sie sofort aus, Ende erst nach Delegate-Bestätigung. Expliziter Beenden-Knopf und 60-Sekunden-Ende bei laufender App. Kein echter Versuch, keine Serverabgabe, keine Schülerberechtigung.
- AAC wird ausschließlich mit `AACLab` + `DEBUG` auf echter Hardware angeboten. Normale Debug/Release-Builds verlangen kein AAC-Entitlement. Auch das Archivieren des Lab-Schemas verwendet Release.
- Drittanbieter-Tastaturen deaktiviert; diese können Suchfunktionen anbieten.

## Was Martin jetzt macht

1. Apple-Aktivierungsmail abwarten und unter https://developer.apple.com/account/ die aktive Mitgliedschaft prüfen. Bestellung allein ist noch keine AAC-Freigabe.
2. Auf dem Mac: Apple-Menü → Über diesen Mac. Modell/Chip und genaue macOS-Version notieren. Xcode-Kompatibilität anhand https://developer.apple.com/support/xcode/ prüfen. Browserangaben sind dafür unzuverlässig.
3. Passendes stabiles Xcode aus dem Mac App Store bzw. Apple Developer Downloads installieren und einmal starten, iOS/iPadOS-Plattformkomponenten laden.
4. Repository auf dem Mac öffnen: https://github.com/HerrLoeffler/Hausaufgabe/tree/fix/gradecrew-staging-polish → Code → Download ZIP. ZIP entpacken; `native/GradeCrewSecure/GradeCrewSecure.xcodeproj` doppelklicken. Kein Cloud-Shell-Deploy erforderlich.
5. Xcode → Settings → Accounts: Apple-Account hinzufügen. Im Projekt → Target GradeCrewSecure → Signing & Capabilities: eigenes Team wählen, Automatically manage signing aktivieren. Bundle-ID `de.gradecrew.secure` ist ein Vorschlag; bei bereits registrierter abweichender App-ID überall dieselbe verwenden. Keine Zugangsdaten an den Chat senden.
6. Oben Schema **GradeCrew Secure**, zunächst einen iPad-Simulator wählen, ▶ Run. Staging-Code eines Übungstests eingeben. Erwartung: bestehende Schüleransicht + orange Kennzeichnung, AAC-Knopf deaktiviert.
7. Für Hardware: eigenes iPad anschließen, Vertrauen bestätigen; falls Xcode verlangt, Entwickler-Modus unter Einstellungen → Datenschutz & Sicherheit aktivieren und neu starten. Dann iPad als Ziel wählen. Schritt 6 wiederholen.
8. Nach aktiver Mitgliedschaft explizite App-ID registrieren und AAC beantragen: https://developer.apple.com/contact/request/automatic-assessment-configuration/ . Antragstext siehe `APPLE_AAC_REQUEST.md`. Selbst absenden; keine automatische Kontaktaufnahme.
9. Erst nach Apples Genehmigung AAC für App-ID/Signing konfigurieren bzw. Profile erneuern. Schema **GradeCrew AAC Lab**, eigenes iPad, dann lokalen Gerätetest öffnen. Keine Breakpoints während aktiver Sperre. Manuelles Ende, automatisches Ende, Startfehler, Unterbrechung und Rückkehr jeweils testen. Mit Simulator lässt sich die echte Sperre nicht nachweisen.

## Kompilieren auf einem Mac

Öffnen in Xcode ist ausreichend. Optional im Mac-Terminal aus diesem Ordner:

```bash
xcodebuild -project GradeCrewSecure.xcodeproj \
  -scheme 'GradeCrew Secure' -configuration Debug \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath DerivedData CODE_SIGNING_ALLOWED=NO build
```

Mit `bash verify-on-mac.sh` lassen sich beide Schemata ohne Gerätesignierung für den Simulator bauen. Das ersetzt keinen AAC-Test auf Hardware.

Projektdateien sind bereits enthalten. `python3 generate_project.py` regeneriert sie bei Bedarf, setzt dabei aber manuelle Projekteinstellungen zurück; vor Änderungen in Git sichern.

## Prüfstand und Grenzen

Hier wurde die Projektstruktur generiert und geprüft. In der Linux-Entwicklungsumgebung fehlen Xcode, Apple-SDKs und Swift: **noch kein erfolgreicher nativer Compile oder iPad-Lock-Test nachgewiesen**. Das erste Xcode-Build ist unser nächster gemeinsamer Prüfpunkt.

Kein Offline-Autosave, keine Attestation, keine serverseitige Attemptsicherung, keine sichere Freigabe/Abgabequittung. Staging-Webansicht wird niemals als AAC-Prüfung behandelt. AAC-Gerätetest endet bewusst auch ohne Abgabe, da er ausschließlich lokale Dummy-Inhalte enthält. Diese Endelogik darf NICHT in echte Prüfungen übernommen werden. Bei OS-Abbruch/Neustart kann die App die Sperre nicht garantieren. Keine Behauptung „100 % schummelsicher“.

## Weitere Meilensteine

1. **Mac + iPad:** Build und bestehende Webansicht prüfen, AAC genehmigen und realen Start/Ende-Test dokumentieren.
2. **Backend zuerst:** Antworten/Lösungen trennen; autorisierte Attempt-ID, serverseitige Zeit/Punkte, idempotente Abgabe; eigene Tests für Rechte, Doppelabgabe und manipulierte Clients. Siehe `../../SECURE_EXAM_PLAN.md`.
3. **Sichere Integration:** Backend liefert einen gebundenen Prüfungsauftrag. Native App startet AAC, zeigt Inhalte erst nach Bestätigung. JS-Ereignisse sind nur Hinweise; Ende ausschließlich nach unabhängig authentifiziert bestätigter Abgabe oder autorisierter Lehrerfreigabe. User-Agent/Clientflag reicht nicht als Nachweis. Attestation und Replay-Schutz separat spezifizieren.
4. **Wiederherstellung:** geschützter lokaler Antwortpuffer, Reconnect, App-Abbruch, Stromverlust, Lehrer-Notfreigabe (auch definierter Offline-Notfall), Telemetrie und Datenlöschung. Kein unbegrenztes Einsperren bei Serverausfall.
5. **Pilot:** VoiceOver, große Schrift, Hoch/Querformat, Netzwerkabbrüche, iPadOS-Versionen; dann TestFlight, Datenschutzangaben, App-Symbole und Review-Unterlagen.

Für das Projekt ist ein echter sicherer Prüfungsdurchlauf erst nach Meilensteinen 2–4 freigabefähig. Keine Production-Veröffentlichung in diesem Schritt.
