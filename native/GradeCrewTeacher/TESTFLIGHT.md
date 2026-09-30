# GradeCrew auf dem iPad – aktueller TestFlight-Weg

Stand: 30.09.2026. Haupt-App **GradeCrew**, Bundle-ID **de.gradecrew**.
Secure bleibt eine eigene App: **de.gradecrew.secure**.

## Bereits nachgewiesen

GitHub-Lauf 36656798111 hat Version 0.1.2 kompiliert, signiert und erfolgreich
zu App Store Connect hochgeladen. Apple-Konto, Signing und API-Key sind eingerichtet.
Keine neue App-ID anlegen, keine Schlüssel in den Chat kopieren.
Die frühere Demo mit erfundenen Tests wurde entfernt. Die App lädt die echte
Webplattform samt Firebase-Weblogin aus der persistenten WKWebView-Sitzung.

## Schnellster Weg zum nächsten Build

Änderungen unter native/GradeCrewTeacher, native/Shared oder am TestFlight-Workflow
auf feature/shared-gradecrew-design-system lösen den vorhandenen Cloud-Build aus.
Er archiviert zuerst mit Xcode und lädt nur bei Erfolg hoch. Version 0.1.3 ergänzt
Web-Bestätigungen, Textdialoge, korrekte Browserkennung und Fehler bei Webprozess-Abbruch.
Die Buildnummer stammt aus GITHUB_RUN_NUMBER.
0.1.3 (6) wurde inzwischen durch Run 36712213667 erfolgreich hochgeladen.
0.1.4 ergänzt Beta-Einstellungen: Preview-Adresse einsetzen und die neue Webversion
direkt in der App testen; der aktuell geladene Host bleibt sichtbar.

Nach grünem Upload: App Store Connect verarbeitet den Build. Anschließend in
TestFlight bei GradeCrew aktualisieren; falls nötig den Build der internen Testgruppe
zuordnen. Erfolgreicher Upload allein beweist noch keine installierbare Freigabe.
Keine externen Einladungen oder App-Store-Veröffentlichung automatisch ausführen.

## Zwei getrennte Aktualisierungen

- Swift-/WebView-Änderung: neuer TestFlight-Build.
- Website/Tutorial/Editor: Hosting-Deploy auf die URL, welche die App tatsächlich lädt.

Aktuelle App-URL: https://hausaufgabe-staging.web.app/
Am 30.09.2026 erneut gelesen: release.json = gc21 / 4707c45.
Die gc27-Security-Preview liegt auf einem anderen Hosting-Channel. Sie kommt nicht
allein durch einen neuen App-Build in diese WebView. Preview-URL vor Verwendung
explizit verifizieren; ablaufende Preview-URLs nicht fest in den App-Build schreiben.

## Kurzer echter Gerätetest für 0.1.4

1. Beta-Einstellungen öffnen, gültige Staging-Preview einsetzen, Host prüfen.
2. Login und Wiederöffnung der App (Sitzung bleibt erhalten).
2. Einen eigenen Wegwerf-Test löschen: Abbrechen erhält ihn, Bestätigen löscht ihn.
3. Eine Testsitzung beenden: Bestätigung sichtbar, Abbrechen ohne Aktion.
4. Tutorial mit Bildschirmtastatur, Hoch-/Querformat und kleiner Breite.
5. Upload, CSV-Export, Zwischenablage und Links ausdrücklich auf dem iPad prüfen.
6. Offline öffnen und Retry; dabei keinen laufenden echten Schüler-Test verwenden.

Native Firebase-SDK-Anbindung ist eine spätere Ausbaustufe, keine Voraussetzung,
um die schon funktionierende Webplattform jetzt über TestFlight zu testen.
