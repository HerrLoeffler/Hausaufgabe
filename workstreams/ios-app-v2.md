# Aufgabe: ios-app-v2

- Aktualisiert: 02.10.2026
- Auftrag: Bestehende GradeCrew-Lehrerapp gegen den tatsächlichen GitHub-Stand prüfen und die nächste hybride App-Stufe umsetzen.
- Task: `GC-IOS-02`
- Status: **0.1.6 mit kanonischem GradeCrew-AppIcon auf GitHub gesichert; Routing, Icon-Erzeugung, Archive und TestFlight-Upload grün; Gerätetest offen.**
- Kanonischer App-Branch: `feature/shared-gradecrew-design-system`
- Integrierter App-Code: `899bc3632b657d004ea3771418bb0c22a9a72ab5`
- Logo-Umsetzungsbranch: `feature/ios-brand-icon-v1`, von `8bdebaf1ab701d44e57369914bd2b82fe7bdc895` abgezweigt und nach erfolgreichem Build per Fast-Forward in den kanonischen App-Branch übernommen.
- TestFlight: Version `0.1.6`; erster erfolgreicher Logo-Build Run `37024138336`, Job `110894355082`, Build `11`. Der Fast-Forward des kanonischen App-Branches löste einen zweiten Kontrollbuild Run `37024529022`, Job `110895661852`, Build `12`, ebenfalls vollständig erfolgreich aus.
- Web-Integrationsbranch beim vorherigen Umbau: `feature/gradecrew-app-integration` @ `8aba2a7ce70c75842fbe4b81c4e6491136366768`.
- Preview-Channel: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/`
- Production: unverändert.

## Was 0.1.5 geändert hat

Die Teacher-App bleibt bewusst eine dünne SwiftUI-/WKWebView-Hülle. Es gibt weiterhin keine doppelte native Firebase-Authentifizierung oder native Testliste. Statt fachliche Webfunktionen in Swift nachzubauen, öffnet die TestFlight-Beta standardmäßig den automatisch geprüften Integrations-Preview-Channel.

Damit erscheinen die bereits im gemeinsamen Webstand integrierten Neuerungen direkt in der App. Reine Webupdates benötigen keinen neuen iOS-Build, solange sie nach grüner CI in denselben verifizierten Preview-Channel deployt werden.

Umgebungsrouting:
- Standard: Integration-Preview `hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`;
- expliziter Fallback: normales Staging `hausaufgabe-staging.web.app`;
- andere `hausaufgabe-staging--*.web.app`-Previews bleiben für gezielte Betatests zulässig;
- Production-Hosts werden nicht als Beta-Ziel akzeptiert;
- bei Ladefehlern kann direkt auf normales Staging zurückgefallen werden;
- Beta-Sheet zeigt Host und Umgebung sichtbar an.

## Neu in 0.1.6: echtes GradeCrew-AppIcon

Das bisherige provisorische blaue Beta-Icon mit weißem Haken ist ersetzt.

Verbindliche Markenquelle bleibt das zentrale Design-System:
- Manifest: `shared/gradecrew-design/assets.json`;
- semantischer Eintrag: `brand.icon`;
- kanonisches Asset: `assets/gradecrew/brand-icon-v1.svg`;
- keine separate Neuzeichnung oder Teacher-spezifische Logo-Kopie.

`native/GradeCrewTeacher/prepare_testflight_assets.py` liest den semantischen `brand.icon`-Pfad aus dem Manifest. Auf dem macOS-CI-Runner wird das SVG gerastert, über CoreGraphics auf die gemeinsame Surface-Farbe komponiert und als opakes `1024x1024`-PNG für den iOS-AppIcon-Katalog ausgegeben. Der Build validiert PNG-Signatur, Abmessungen und fehlende Alpha-Transparenz. Änderungen unter `assets/gradecrew/**` sind jetzt ebenfalls TestFlight-Workflow-Trigger.

Der erste Renderansatz stoppte vor Archive/Upload, weil der alte AppKit-Bitmap-Kontext das gerenderte Bild nicht flatten konnte. Es wurde kein fehlerhaftes Paket hochgeladen. Der gehärtete CoreGraphics-Pfad war anschließend grün. Der erfolgreiche Log bestätigt explizit:
`Prepared canonical GradeCrew AppIcon from assets/gradecrew/brand-icon-v1.svg ... opaque 1024x1024.`
Xcode erzeugte daraus die iPhone- und iPad-AppIcon-Varianten und akzeptierte das Asset ohne Fehler.

## Versionierung

Für 0.1.6 sind Workflow und `generate_project.py` beide auf `0.1.6` synchronisiert. Der GitHub-Run liefert weiterhin die eindeutige Buildnummer. Der erfolgreiche kanonische Kontrolllauf ist damit `0.1.6 (12)`.

## Bestehende App-Shell

Weiterhin vorhanden:
- persistenter `WKWebsiteDataStore.default()` für die Web-Anmeldung;
- native alert/confirm/prompt-Dialoge;
- Safe-Area-/Keyboard-Grundlagen;
- Webprozess-Fehlerzustand und Retry;
- Preview-Host-Validierung;
- automatisierter TestFlight-Cloudbuild und Apple-Signing;
- Integration-Preview als Standard und normales Staging als Fallback.

## Architekturentscheidung bleibt bestehen

Nicht sofort die komplette Webplattform nativ nachbauen. Solange Dashboard, Tutorial, KI-/Crew-Funktionen, Security und Design schnell weiterentwickelt werden, bleibt die Webplattform die Single Source of Truth. Die nächste Native-Stufe soll gezielt App-Mehrwert schaffen, statt Auth-, Daten- und UI-Logik zu duplizieren.

Nächste Shell-Schritte nach Gerätetest:
1. permanente Beta-Leiste aus dem Alltagslayout entfernen und Diagnose diskret erreichbar machen;
2. klare WKWebView-Navigation-Policy: intern in GradeCrew, externe Ziele systemgerecht öffnen;
3. Downloads/CSV/PDF/Share-Sheet sowie Upload/Kamera sauber nativ unterstützen;
4. schmale Web↔Native-Bridge für Share, externe Links, Diagnose und später Scanner/Haptik;
5. Offline-/Webprozess-Recovery und Release-/Host-Diagnose verbessern;
6. Native-Verhaltenstests ausbauen;
7. AppIcon/Launch-Auftritt auf dem echten iPad/iPhone visuell abnehmen.

## Statusnachweis

- Code auf Logo-Aufgabenbranch: ja, `feature/ios-brand-icon-v1`.
- In kanonischen App-Branch integriert: ja, Fast-Forward auf `899bc363...`.
- Kanonische Brand-Quelle statt Logo-Kopie: ja.
- SVG -> opakes 1024x1024 AppIcon in CI: grün.
- Routing-Test: grün.
- Xcode Archive/Signing: grün.
- App Store Connect/TestFlight Upload: grün, Runs `37024138336` und `37024529022`.
- Letzter erfolgreicher Build: `0.1.6 (12)`.
- Physischer iPhone-/iPad-Test von 0.1.6 und visuelle Bestätigung des Icons: offen.
- Production: unverändert.

## Nächster ausführbarer Schritt

Sobald Apple 0.1.6 in TestFlight verarbeitet hat: auf dem iPad in TestFlight aktualisieren. Prüfen, ob das echte GradeCrew-Markensymbol in TestFlight und auf dem Home-Bildschirm angezeigt wird und ob unten weiterhin `Integration` steht. Erst danach ist das AppIcon auch am Gerät bestätigt.
