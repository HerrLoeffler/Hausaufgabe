# Aufgabe: ios-app-v2

- Aktualisiert: 03.10.2026
- Auftrag: Bestehende GradeCrew-Lehrerapp schrittweise als hybride iPhone/iPad-App härten, ohne die schnell veränderliche Webplattform unnötig nativ zu duplizieren.
- Task: `GC-IOS-02`
- Status: **0.1.7 und 0.1.8 umgesetzt; finaler 0.1.8-Code auf kanonischem App-Branch; Routing-/Downloadtests, Xcode-Archive, Cloud-Signing und TestFlight-Upload grün; Apple-Verarbeitung und Gerätetest offen.**
- Kanonischer App-Branch: `feature/shared-gradecrew-design-system`
- Integrierter App-Code: `79598be8a68d26319e5e9711d0df7c73e119684d`
- Umsetzungsbranch: `feature/ios-app-shell-017-018`, vom bestätigten 0.1.6-Head `899bc3632b657d004ea3771418bb0c22a9a72ab5` abgezweigt und nach erfolgreichem finalen Build per Fast-Forward in den kanonischen App-Branch übernommen.
- Finaler TestFlight-Nachweis: Version `0.1.8`, Build `17`, Run `37075968920`, Job `111065834724`: vollständig erfolgreich einschließlich Upload zu App Store Connect.
- Separater 0.1.7-Nachweis: Run `37075335026`, Job `111063851021`: Routing, Navigationstest, Archive, Signing und Upload vollständig erfolgreich.
- Preview-Channel: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/`
- Production: unverändert.

## Architektur

Die Teacher-App bleibt bewusst eine SwiftUI-/WKWebView-App mit nativer Geräteschicht. Dashboard, Tests, Editor, Remy, Emmi, Games und Auswertung bleiben vorerst Web-Single-Source-of-Truth. Native Arbeit wird dort ergänzt, wo iPhone/iPad klaren Mehrwert liefern: Navigation, Dateien, Share-Sheet, Kamera/Mikrofon, Diagnose, später Web↔Native-Bridge, Scanner, Haptik und App Intents.

Integration-Preview bleibt Standard; normales Staging ist Fallback. Production-Hosts werden nicht als internes Beta-Ziel akzeptiert.

## 0.1.7 – App-Shell und Navigation

Umgesetzt:
- permanente Beta-Leiste aus dem Alltagslayout entfernt;
- Diagnose/Preview-Auswahl in ein separates `GradeCrew Diagnose`-Sheet verschoben;
- Diagnose zeigt App-Version, Build, Umgebung und geladenen Host;
- Diagnose aus der normalen Webansicht per Zwei-Finger-Langdruck erreichbar; bei Ladefehler zusätzlich expliziter Diagnose-Button;
- neue zentrale `GradeCrewNavigationPolicy`;
- vertrauenswürdige GradeCrew-Staging-/Preview-/Firebase-Auth-Ziele bleiben in der App;
- nutzeraktivierte externe Links öffnen systemgerecht außerhalb der WKWebView;
- Production-URL wird nicht als internes Beta-Ziel behandelt;
- `target=_blank` wird nicht mehr pauschal wieder in dieselbe WebView gezwungen;
- eigener Swift/Foundation-Regressionscheck für Routing/Navigation;
- zentrale Versionsquelle `native/GradeCrewTeacher/VERSION` eingeführt; Workflow, Routingtest und Projektgenerator lesen denselben Wert.

Nachweis:
- 0.1.7 Run `37075335026`: SUCCESS;
- Routingtest: grün;
- Navigationstest: grün;
- Xcode Archive: grün;
- App Store Connect/TestFlight Upload: grün.

## 0.1.8 – Downloads, Share, Upload-/Medienbasis

Umgesetzt:
- `WKDownloadDelegate` in der App-Shell;
- Navigations- und Response-Downloads werden als echte WKDownloads übernommen;
- `Content-Disposition: attachment` und nicht darstellbare MIME-Typen lösen nativen Download aus;
- Downloads landen nur temporär in einem GradeCrew-Tempverzeichnis;
- Dateinamen werden vor dem Schreiben bereinigt;
- nach erfolgreichem Download öffnet sich ein natives `UIActivityViewController`-Share-Sheet;
- damit stehen u. a. „In Dateien sichern“, AirDrop und kompatible Apps systemgerecht zur Verfügung;
- iPad-Popover für das Share-Sheet korrekt konfiguriert;
- temporäre Dateien werden nach Abschluss des Share-Sheets aufgeräumt;
- Downloadfehler erhalten eine native GradeCrew-Fehlermeldung;
- Kamera-, Fotomediathek- und Mikrofon-Nutzungsbeschreibungen in den generierten App-Infos ergänzt;
- WebKit-Medienfreigabe wird nur für vertrauenswürdige GradeCrew-Ursprünge gewährt; externe Ursprünge werden abgewiesen;
- Download-/Navigationspolicy hat einen eigenen Swift-Regressionscheck.

Wichtig: Die WKDownload-Unterstützung deckt Navigation-/Response-Downloads ab. Ob jeder bestehende rein JavaScript-erzeugte Blob-Export der Webplattform direkt als WKDownload ankommt, muss am echten Gerät geprüft werden. Falls ein bestimmter Blob-Export nicht ins native Share-Sheet gelangt, wird dieser gezielt über die geplante Web↔Native-Bridge statt über weitere WKWebView-Sonderfälle angebunden.

## Signing-/CI-Härtung

Während eines 0.1.8-Zwischenbuilds wurde ein bestehendes CI-Problem sichtbar: automatische Development-Signierung auf frischen GitHub-Runnern hatte das Apple-Zertifikatslimit erreicht (`Your account has reached the maximum number of certificates`). Der App-Code war nicht die Ursache.

Die Pipeline wurde deshalb geändert, ohne Zertifikate zu löschen oder zu widerrufen:
- Release-Archive wird in CI ohne Development-Signatur gebaut (`CODE_SIGNING_ALLOWED=NO`);
- Distribution-Signierung erfolgt erst beim App-Store-Connect-Export über die vorhandene Apple/API-Key-Konfiguration;
- dadurch muss ein frischer Runner nicht für jeden Build ein weiteres Development-Zertifikat erzeugen.

Der finale Run `37075968920` bestätigt diesen Pfad Ende-zu-Ende:
- `Building GradeCrew 0.1.8`;
- Beta-Routing: passed;
- Navigation/Download policy: passed;
- AppIcon/Projektgenerierung: passed;
- unsigned Release Archive: `ARCHIVE SUCCEEDED`;
- Cloud-Sign/Export/Upload: `Upload succeeded` / `EXPORT SUCCEEDED`;
- kompletter Job: SUCCESS.

## Aktueller Statusnachweis

- 0.1.7 Code: umgesetzt und durch vollständigen TestFlight-Run bestätigt.
- 0.1.8 Code: umgesetzt.
- Aufgabenbranch: `feature/ios-app-shell-017-018` @ `79598be8...`.
- Kanonischer App-Branch: per Fast-Forward auf exakt `79598be8...` integriert.
- App-Version: `0.1.8`.
- Build: `17` im erfolgreichen finalen Run.
- Routingtest: grün.
- Navigation-/Downloadtest: grün.
- Xcode-Kompilierung/Archive: grün.
- Distribution-Signing: grün.
- App Store Connect/TestFlight Upload: grün.
- Apple-Verarbeitung/installierbar: nach Upload noch separat zu bestätigen.
- Physischer iPhone-/iPad-Test: offen.
- Production: unverändert.

## Gerätetest 0.1.8

Nach Apple-Verarbeitung in TestFlight auf `0.1.8` aktualisieren und nacheinander prüfen:
1. Login/Session bleiben erhalten; Integration-Preview lädt normal.
2. Permanente Beta-Leiste ist verschwunden.
3. Zwei Finger etwa eine Sekunde auf die Webansicht halten → `GradeCrew Diagnose` öffnet sich.
4. Interner GradeCrew-Link bleibt in der App; externer Link öffnet systemgerecht außerhalb.
5. CSV/PDF/sonstigen Export auslösen → natives Share-Sheet; „In Dateien sichern“ und wenn sinnvoll AirDrop testen.
6. PDF/Bild über den bestehenden GradeCrew-Upload auswählen.
7. Kamera aus einem passenden Upload-Feld verwenden und Berechtigungsdialog prüfen.
8. Remy-Spracheingabe/Mikrofon prüfen.

Erst nach diesem Test sind 0.1.7/0.1.8 `user_tested`.

## Danach

Nächster sinnvoller Native-Block ist die schmale Web↔Native-Bridge (Share/Export, externe Links, Diagnose, später Scanner/Haptik) plus Offline-/Recovery-Härtung. Keine vollständige native Doppelimplementierung von Editor/KI/Dashboard beginnen, solange die Webplattform dort die aktiv weiterentwickelte Single Source of Truth bleibt.


## Frischer Abgleich / Xcode-Fortsetzung 06.10.2026

Der neueste bestätigte Upload ist **0.1.8 (18)**, Run `37076301215`, auf demselben kanonischen Commit `79598be8`. Die Build-17-Angabe oben bleibt historisch. Apple-Verarbeitung/Installation/Geräteabnahme nicht bestätigt. Neue native Dateibrücke 0.1.9 lokal umgesetzt und als [Draft-PR #144](https://github.com/HerrLoeffler/Hausaufgabe/pull/144) isoliert gesichert. Status, Review-Korrekturen und exakte CI: [Fortsetzungsübergabe](ios-native-bridge-019.md). Kanonischer App-Branch, Web-Integration und Production wurden durch diese Fortsetzung nicht geändert.
