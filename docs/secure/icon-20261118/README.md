# GradeCrew Secure · Iconentwurf, 18.11.2026

Task GC-IOS-02 / GC-RELEASE-06. Status: **Entwurf / branch_only**, keine aktive Asset-Ersetzung, kein Build oder Upload, keine Einreichung. Die Lehrer-App bleibt unverändert.

## Entwurf nach Martins Korrektur

GC mit Doktorhut und blau-violetten Markenfarben auf hellem Grund bleibt dominant. Ein geschlossenes Schloss sitzt am C, darunter steht **Secure**. Die zuvor erzeugten dunklen Schild-/Schloss-Varianten sind verworfen und nicht zur Integration bestimmt. Der erste helle Entwurf zeigte ein offenes Schloss; die ausgewählte Vorschau korrigiert dies. Es ist eine KI-gerenderte Markenvariante, keine Behauptung pixelidentischer Übernahme des Vektorlogos. Visuelle Auswahl durch Martin steht aus.

`SecureCandidate.appiconset/` ist ein vorbereiteter, **nicht eingebundener** Katalog: RGB-PNG, 1024×1024, kein Alphakanal, keine vorab maskierten Außenrundungen. Master `secure-generated-master.png`; Export SHA256 `fc4181deac6d29fe1e458435543fba7dd5902a0423b5bfad2664aa7c733385d3`. Vorlage: `assets/gradecrew/brand-icon-v1.svg`, lokal mit Quick Look gerendert. Built-in image_gen genutzt, keine API-Schlüssel/CLI-Provideraufrufe.

Promptkern: vorhandenes GC mit Doktorhut, Navy-G und violettem C erhalten; helles vollflächiges Quadrat; kleines geschlossenes Schloss am C; Secure mittig darunter; keine Tiere/Schildform/zusätzliche Texte. Korrekturprompt: ausschließlich offenen Bügel schließen. Ursprüngliche generierte Dateien bleiben erhalten. `preview.swift` erzeugt eine Vergleichstafel aus Apples Lehrer-Icon und dem Kandidaten; 80/60/40px tatsächlich gerendert und visuell geprüft. Bei 40px ist Secure erwartungsgemäß klein; die GC-Marke bleibt erkennbar. Der sichtbare System-Appname bleibt zusätzlich nötig.

## Tatsächlich bei Apple eingereicht

Am 18.11.2026 im angemeldeten App Store Connect gelesen:

| App | App-ID / Bundle | Version / Build | Beobachtung |
|---|---|---|---|
| GradeCrew Lehrer | 6817547234 / de.gradecrew | 0.2.0 / 52, Apple-Build 4caf3965-f136-4002-aa6b-ced633fdab95 | Ready for Distribution; Included Assets → App Icon zeigt GC ohne Schloss. |
| GradeCrew Secure | 6817526711 / de.gradecrew.secure | 1.0 / 1192, Apple-Build e15b45bf-b928-4195-a849-9c26688781f9 | Rejected; Included Assets → App Icon zeigt dasselbe GC-Motiv ohne Schloss. |
| Secure Test | 6827304234 / de.gradecrew.secure.test2026 | zuvor belegter TestFlight 1241 | In diesem Turn nicht neu bei Apple geprüft oder geändert. |

Apple nennt in der vom Nutzer vorgelegten Ablehnung vom 11.11.2026 ausdrücklich 4.3(a), identische Icons; Submission `7fdf1b92-3580-41f9-bd74-3fa0bd7a506a`. Der aktuelle UI-Vergleich bestätigt das identische Motiv, nicht bitweise Gleichheit beider von Apple nachverarbeiteten PNG-Dateien. Apples Lehrerdatei wurde zur Sichtprüfung heruntergeladen; SHA256 `6a11568a9f5f5b4d1688651c4da6804ac2b7eba0c21f82388fff510d3077ff14`. Secure-Vorschau direkt im Apple-Dialog betrachtet.

1192 stammt nach vorhandener Upload-Provenienz aus `24c0f856384f037ebe156e20dc20a03ae10c4cf8`, Run39851773269/attempt2. Dessen `native/GradeCrewSecure/prepare_assets.swift` rendert das gemeinsame SVG ohne Schloss in `AppIcon.appiconset`. Die Lehrer-Vorbereitung `native/GradeCrewTeacher/prepare_testflight_assets.py` verwendet dasselbe kanonische SVG. Das erklärt das gleiche Motiv; Hintergrundwerte sind nicht völlig gleich. Neuere Quellstände dürfen diesen Befund nicht verdecken: `3b537c8c` enthält bereits Secure-/TEST-Schlossbadges, diese sind **nicht** in 1192. Live1272 stammt separat aus 6f678263/run40408087983/attempt2. Kein aktueller TestFlight-Build wurde als die eingereichte1192 ausgegeben.

## Apple-Vorgaben und nächster Releaseweg

Offizielle Quellen am18.11.2026 gelesen:
- https://developer.apple.com/design/human-interface-guidelines/app-icons/ — einfach, eigenständig, in kleinen Größen erkennbar; quadratischer1024px-Ausgangspunkt, System maskiert Ecken; sRGB unterstützt, neue layered appearances möglich.
- https://developer.apple.com/documentation/xcode/configuring-your-app-icon — vorhandene Asset-Catalog-Pipeline kann kleinere Größen aus1024px erzeugen.
- https://developer.apple.com/app-store/review/guidelines/#spam — 4.3; final entscheidet Apple. Schloss/Schrift sind eine sachliche Differenzierung, keine Zusage einer Annahme.

Nach Auswahl genau dieser Vorschau:
1. Releasebasis bewusst festlegen: eingereichte1192 gegenüber verfügbarem Live1272 und beiden getrennten Varianten abgleichen. Diesen Dokumentations-/Entwurfsbranch nicht blind als Runtime veröffentlichen; er enthält spätere native Änderungen gegenüber1192.
2. Nur Secure-AppIcon im bestehenden `prepare_assets.swift` aus ausgewähltem PNG oder einer präzisen Vektor-Reproduktion vorbereiten. Das Skript überschreibt generierte Kataloge; bloßes Kopieren in Resources würde beim nächsten Build verloren gehen. **GradeCrewLogo.imageset für die In-App-Oberfläche getrennt erhalten**, nicht automatisch den Secure-Schriftzug in den36px-Header übernehmen. Lehrer-Generator, gemeinsame Marke, Secure-Test-Identität und laufende Prüfungslogik nicht ändern.
3. PNG/Opacity/1024px, getrennte AppIcon-/TestAppIcon-Zuordnung und Icon-Ungleichheit gegen Teacher prüfen; vorhandene native/iPhone/iPad-/WebKit-Gates ohne Lockerung laufen lassen. Signing/AAC, Bundle-ID, Liveziel und lokale Offline-Namensräume erhalten.
4. Neue eindeutige Buildnummer aus bestehender Pipeline; signiertes Archiv prüfen, TestFlight hochladen, Apple-Verarbeitung abwarten. App-Icon aus tatsächlich neuem Build in Apple kontrollieren; iPhone/iPad-Sichtprüfung und Start-/Offline-/AAC-Kurzabnahme des exakten Kandidaten.
5. Nur nach gesondertem Einreichungsauftrag neuen Build der abgelehnten Version1.0 zuordnen, Review-Hinweis sachlich aktualisieren und erneut einreichen. Ein Icon im Binary wird durch eine bloße Textantwort oder Metadatenänderung an1192 nicht ersetzt. In diesem Turn weder Apple-Antwort noch Submission/Verträge geändert.

## Native Anknüpfung für den separaten Navigationsentwurf

`Sources/SecureExamChrome.swift` reserviert Header/Timer und Abgabefooter perVStack; `Sources/SecureExamWebView.swift` bettet den lokalen Renderer dazwischen ein. Der Aufgabennavigator sitzt im lokalen Webinhalt: `Resources/Exam/exam.css` (`.secureNavigation` sticky/top0, offene Übersicht max240px/40vh; Fragen-scroll-margin wird über --secure-nav-height reserviert), `question-navigation.js`, `native-exam.js`, `index.html`. Eine Desktop-/breite-iPad-Sidebar gehört daher zuerst in das lokale Weblayout, nicht in ein zweites natives Navigationsmodell.

Vorschlag zur gemeinsamen Planung, **nicht umgesetzt**: breite nutzbare Inhaltsbreite → linke Zahlennavigation und rechte Frage im Grid; kleine Breite/Querformat mit Tastatur → kompakte horizontale Navigation. Tatsächliche WKWebView-Innenbreite, iPad-Split-View, DynamicType/Zoom, SafeAreas und kurze Landschaftshöhe beachten. Header/Timer/Abgabe dürfen nicht vom Web überlagert werden; Fokus-/Scrollziele, beantwortet-grün versus Richtigkeit und bestehende Lebenszyklus-/Offlinebrücke erhalten. Beide Owner müssen Web- und natives gebündeltes Layout bewusst synchronisieren; Browser-CSS-Deploy ändert kein bereits installiertes App-Bundle. Keine parallele Web-/Nativeänderung aus diesem Iconauftrag.
