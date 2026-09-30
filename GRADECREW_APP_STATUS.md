# GradeCrew Teacher App — aktueller Stand

Stand: 2026-09-30
Branch: `feature/shared-gradecrew-design-system`
Bundle ID: `de.gradecrew`
Zuletzt nachgewiesen hochgeladene TestFlight-Version: `0.1.2`
GitHub Actions Run: `36656798111` — erfolgreich gebaut und zu App Store Connect/TestFlight hochgeladen

## Fortsetzung 30.09.2026: 0.1.3

Code ergänzt: echte alert/confirm/prompt-Dialoge in WKUIDelegate; Cancel bei
Abbau der WebView; ignorierte abgebrochene Navigation; sichtbarer Webprozessfehler.
Die Standard-WebKit-Browserkennung bleibt erhalten und bekommt nur den App-Zusatz.
Die Version für URLs/Browsersignatur stammt aus dem Bundle statt aus drei Konstanten.
Der Cloud-Build reagiert jetzt auch auf Änderungen an nativen Quelldateien.
Build-/Upload-Ergebnis für 0.1.3 nach dem Lauf prüfen, hier noch nicht behauptet.

**Wichtige Abweichung:** normale Staging-URL liefert weiterhin gc21 / 4707c45
(30.09.2026 erneut per release.json geprüft). Die gc27-Preview ist ein anderer
Hosting-Channel. App-Update und Web-Deployment nicht verwechseln.
Siehe PROJECT_INTEGRATION_STATUS.md und den korrigierten TESTFLIGHT.md-Leitfaden.

## Was jetzt wirklich funktioniert

- iPhone/iPad-App wird vollständig in GitHub Actions mit Xcode 26 gebaut.
- Automatisches Apple Signing funktioniert über den registrierten Test-iPad und den App-Store-Connect-Admin-Key.
- Upload zu TestFlight funktioniert automatisiert.
- Die App verwendet die persistente WKWebView-Datenablage (`WKWebsiteDataStore.default()`), damit die echte Firebase-Websession zwischen App-Starts erhalten bleibt.
- Version 0.1.2 öffnet die echte GradeCrew-Staging-Arbeitsfläche statt einer separaten Mock-Oberfläche.
- Web-Navigation, Firebase-Weblogin, Tests, Editor, Abgaben und Einstellungen kommen damit aus der bestehenden GradeCrew-Webplattform.
- Zusätzliche Browserfenster/`target=_blank` werden im selben App-WebView weitergeführt.
- Native Ladeanzeige und Fehler-/Retry-Oberfläche sind vorhanden.
- Die WebView wird nicht mehr unter die untere iOS-Safe-Area gezogen; `UIScrollView` darf Content-Inset-Anpassungen automatisch übernehmen.
- App-URL und User-Agent kennzeichnen den Build als `0.1.2`.

## Mobile Tutorial / Viewport

Der mobile Tutorial-Fix wird auf `fix/gradecrew-staging-polish` entwickelt und bleibt bis zur Prüfung ausschließlich auf Staging.

Implementiert:

- adaptive Zwei-Zonen-Führung: Coach und markierte echte Funktion bekommen getrennte sichtbare Bereiche,
- `visualViewport` statt nur `window.innerHeight` für den tatsächlich sichtbaren Bereich,
- Reaktion auf Tastatur, Drehung und dynamische Viewport-Änderungen,
- Safe-Area-Abstände,
- interne Scrollbarkeit langer Coach-Karten statt Überdecken der Zielaktion,
- gleiche mobile Positionierungslogik für den ersten KI-Guide und die komplette Crew-Tour,
- mobile Touch-Polish-Schicht mit größeren Touchzielen und telefonfreundlichen Formularfeldern,
- Regressionstest für kleine/große iPhones, Android-Compact und Querformat,
- eigener GitHub Actions Check `GradeCrew mobile tutorial check`.

Produktion bleibt dabei unverändert.

## Entfernt

Die erste technische Demo enthielt lokale Preview-Daten und Platzhalter. Diese wurden vollständig aus `native/GradeCrewTeacher/Sources/` entfernt:

- Mock-Dashboard
- Mock-Testliste
- Mock-Testdetails
- `TeacherTestStore`
- `GradeCrewTestSummary.previewFixtures`
- Platzhalterbereich `Klassen`
- Platzhalterbereich `Einstellungen`

Damit zeigt die App keine erfundenen Tests oder Funktionen mehr an.

## Wichtige Architekturentscheidung

0.1.x ist eine **Integrationsstufe**, nicht das langfristige Enddesign.

Kurzfristig ist die existierende GradeCrew-Webplattform die Quelle der Wahrheit, damit alle bereits funktionierenden Abläufe korrekt in der App verfügbar sind. Danach werden sinnvolle Bereiche kontrolliert nativ umgesetzt, ohne Web- und App-Logik doppelt zu erfinden.

Langfristiges Ziel laut `GRADECREW_TEACHER_APP_ROADMAP.md`:

1. Native Firebase-Authentifizierung
2. Native `Meine Tests`-Liste aus dem echten Firestore-Datenmodell
3. Native Testdetails/Freigabe/Abgaben
4. Selektiver, authentifizierter WKWebView nur für komplexe Editor-Flows
5. Native Korrektur und iPad-Vorteile
6. Klassen erst dann, wenn das echte Klassen-/Schülersystem implementiert ist

## Umgebung

Aktuelle TestFlight-Integration zeigt bewusst:

`https://hausaufgabe-staging.web.app/`

Firebase-Projekt: `hausaufgabe-staging`

Produktion bleibt unverändert. Erst nach erfolgreicher Prüfung der App-Integration wird kontrolliert auf Live-Daten umgestellt.

## Nächster technischer Block

Nach dem physischen Mobile-/Tutorial-Test folgt die echte native Firebase-Apple-SDK-Anbindung. Dafür fehlt derzeit im Repo eine iOS-Firebase-Konfiguration (`GoogleService-Info.plist`) für `de.gradecrew`.

Nächster Schritt:

1. In Firebase Staging eine iOS-App mit Bundle-ID `de.gradecrew` registrieren.
2. `GoogleService-Info.plist` sicher bereitstellen (keine Secrets öffentlich posten).
3. Firebase Apple SDK via Swift Package Manager in den generierten Xcode-Build integrieren.
4. Native Auth-Session aufbauen.
5. Native Tests über `ownerId == currentUser.uid` laden.
6. Webeditor nur noch als gezielten Editor-Bridge verwenden.

## Nicht verändern

- Produktion nicht für App-Experimente deployen.
- Bundle-ID Teacher bleibt `de.gradecrew`.
- GradeCrew Secure bleibt separat unter `de.gradecrew.secure`.
- Sichere Produktions-Tags/Branches nicht überschreiben.
- Keine Mock-/Preview-Daten wieder in den sichtbaren Teacher-App-Flow einführen.

