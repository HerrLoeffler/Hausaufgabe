# Aufgabe: ios-app-v2

- Aktualisiert: 01.10.2026
- Auftrag: Bestehende GradeCrew-Lehrerapp vollständig gegen den tatsächlichen GitHub-Stand prüfen und die nächste Architektur-/UX-Stufe planen.
- Status: Review/Planung gesichert; noch keine App-Codeänderung.
- Aktueller App-Branch: `feature/shared-gradecrew-design-system`
- Verifizierter Remote-HEAD beim Review: `9fe3e37407832e20f75536bf4d59fec9ba801298`
- Letzter nachgewiesener TestFlight-Upload: `0.1.4 (7)`, Run `36723972615` SUCCESS. Ein echter Gerätetest genau dieses Builds ist laut Branch-Übergabe noch offen.
- Web-Integrationsbranch: `feature/gradecrew-app-integration`
- Verifizierter Remote-HEAD beim Review: `74eb2ec08e81315875abfc4b1ae052d9f78797eb`
- Automatische Preview dieses Webbranches ist laut main-Dokumentation Ende-zu-Ende verifiziert; Production bleibt unverändert.

## Ist-Zustand aus dem Code

Die Teacher-App ist aktuell bewusst eine sehr dünne SwiftUI-/WKWebView-Hülle. Sichtbare Native-Quellen sind `GradeCrewTeacherApp.swift`, `TeacherRootView.swift`, `TeacherWebPortalView.swift` und `GradeCrewBetaEnvironment.swift`. Es gibt noch keine native Firebase-Authentifizierung und keine native Testliste.

Gut gelöst:
- persistenter `WKWebsiteDataStore.default()` für Web-Login;
- native alert/confirm/prompt-Dialoge;
- Safe-Area-/Keyboard-Grundlagen;
- Webprozess-Fehlerzustand und Retry;
- Preview-Host-Validierung blockiert Production-Adressen;
- TestFlight-Cloudbuild und Apple-Signing funktionieren;
- Preview-Hosting kann nach erfolgreicher Web-CI automatisch und hash-verifiziert aus GitHub deployed werden.

Technische/produktseitige Schwachstellen:
- die Beta-Leiste nimmt dauerhaft vertikale Fläche ein;
- Default-App lädt normales Staging, während der aktuellere geprüfte Webstand auf einem automatisierten Preview-Channel liegt;
- externe Links und interne GradeCrew-Navigation werden noch nicht durch eine klare Navigation-Policy getrennt;
- keine gezielte Native-Unterstützung für Downloads/CSV/PDF/Share-Sheet, Kamera/Dateiimport, Deep Links oder Push;
- Swift-CI prüft derzeit im Wesentlichen Routing + Archive/Upload, aber keine breitere App-Simulator-/Verhaltenssuite;
- App-Version ist in Generator und Workflow doppelt gepflegt;
- temporäres Beta-App-Icon ist noch der automatisch erzeugte blaue Haken, obwohl ein kanonisches GradeCrew-Brand-Icon existiert;
- README des App-Starters ist teilweise veraltet und beschreibt frühere Native-Dashboard-Strukturen, die nicht mehr im sichtbaren Build vorhanden sind.

## Architekturentscheidung für die nächste Stufe

Nicht sofort die komplette Webplattform nativ nachbauen. Solange Dashboard, Tutorial, Security und Design noch schnell weiterentwickelt werden, ist die bestehende Webplattform die bessere Single Source of Truth. Ein vorschneller Native-Firebase-/Dashboard-Doppelbau würde Auth-, Daten- und UI-Logik parallel pflegebedürftig machen.

Stattdessen zuerst eine robuste hybride App-Shell 0.2 bauen:
1. internen TestFlight-Build automatisch auf den verifizierten Integration-Preview-Channel ausrichten; keine URL-Eingabe als Standardablauf;
2. permanente Beta-Leiste entfernen; Support-/Umgebungsdiagnose nur noch in einem diskreten Beta-/Diagnose-Sheet;
3. klare WKWebView-Navigation-Policy: GradeCrew-intern in der App, externe Ziele über Systembrowser/geeignete Native-Ansicht;
4. Downloads/CSV/PDF und Share-Sheet sauber nativ behandeln; Upload-/Kamera-/Dateiwege auf echtem iPad/iPhone testen;
5. schmale Web↔Native-Bridge für klar definierte Aktionen (Share, externe Links, Diagnose, später Haptik/Scanner), keine beliebige JS-Schnittstelle;
6. Offline-/Webprozess-Recovery und Release-/Host-Diagnose verbessern;
7. Versionsquelle vereinheitlichen und Native-Tests erweitern;
8. echtes GradeCrew-App-Icon/Launch-Auftritt aus kanonischen Assets ableiten;
9. Gerätetest-Matrix für kleines/großes iPhone, iPad, Hoch-/Querformat, Tastatur und Kernexporte.

Danach, vor einem öffentlichen App-Store-Release, gezielt Native-Mehrwert ergänzen: native Start-/Meine-Tests-Oberfläche und Testdetails auf Basis eines stabilen Daten-/API-Vertrags; komplexer Editor/Tutorial dürfen zunächst Web bleiben. So bleibt die App schnell entwickelbar, wird aber schrittweise wirklich app-typisch.

## Warum diese Reihenfolge

Apple erlaubt WKWebView ausdrücklich für häufig wechselnde Webinhalte, verlangt für den App Store aber zugleich ausreichend App-spezifischen Nutzen statt nur einer neu verpackten Website. Deshalb ist der aktuelle Wrapper sehr gut für interne Beta/Integration, aber nicht das gewünschte Endstadium für den öffentlichen Store.

## Offene Punkte / Abhängigkeiten

- `GC-TUTORIAL-01`: manuelle Tutorialabgabe in der iPad-App weiterhin Nutzerbericht/offen.
- `GC-DEVICE-01`: aktueller Design-/Tutorialstand noch auf echten Geräten abzunehmen.
- `GC-IOS-01`: exakt installierten TestFlight-Build und tatsächlich verwendeten Host am Gerät bestätigen.
- Keine Production-Änderung durch diese Planung.

## Nächster ausführbarer Schritt

Eigenen Umsetzungsbranch für „hybrid app shell 0.2“ von dem dann aktuellen App-Branch anlegen. Zuerst Beta-Leiste/Umgebungsrouting und Navigation-Policy umbauen, mit automatisiertem Build testen und neuen TestFlight-Build am Gerät abnehmen. Parallel bleibt Webfunktionalität auf `feature/gradecrew-app-integration` mit automatischer Preview die Quelle der Wahrheit.
