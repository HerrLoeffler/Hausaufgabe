# Aufgabe: ios-app-v2

- Aktualisiert: 02.10.2026
- Auftrag: Bestehende GradeCrew-Lehrerapp gegen den tatsächlichen GitHub-Stand prüfen und die nächste hybride App-Stufe umsetzen.
- Task: `GC-IOS-02`
- Status: **0.1.5 auf GitHub gesichert, Routing-Test/Archive/Upload grün; TestFlight-Verarbeitung/Gerätetest offen.**
- Kanonischer App-Branch: `feature/shared-gradecrew-design-system`
- Integrierter App-Code: `8bdebaf1ab701d44e57369914bd2b82fe7bdc895`
- Umsetzungsbranch: `feature/ios-latest-integration-v1`, von altem App-Head `9fe3e37407832e20f75536bf4d59fec9ba801298` abgezweigt und nach erfolgreichem Build per Fast-Forward in den kanonischen App-Branch übernommen.
- TestFlight: Version `0.1.5`, GitHub Actions Run `37015111963`, Job `110863948332`: Routing-Test, Projektgenerierung, Archive, Signing und Upload zu App Store Connect erfolgreich.
- Web-Integrationsbranch beim Umbau: `feature/gradecrew-app-integration` @ `8aba2a7ce70c75842fbe4b81c4e6491136366768`.
- Web-Nachweis dieses Heads: AI Staging Checks `37013936361` SUCCESS; Mobile Tutorial Check `37013936799` SUCCESS; automatische Preview `37014137329` Build + Deploy + Manifest/Hash-Verifikation SUCCESS.
- Preview-Channel: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/`
- Production: unverändert.

## Was 0.1.5 jetzt ändert

Die Teacher-App bleibt bewusst eine dünne SwiftUI-/WKWebView-Hülle. Es gibt weiterhin keine doppelte native Firebase-Authentifizierung oder native Testliste. Statt fachliche Webfunktionen in Swift nachzubauen, öffnet die TestFlight-Beta jetzt standardmäßig den automatisch geprüften Integrations-Preview-Channel.

Damit erscheinen die bereits im gemeinsamen Webstand integrierten Neuerungen direkt in der App, unter anderem der aktuelle Dashboard-/Designstand, kontextbezogene Crew-Assistenten, strukturierte Remy-Eingaben, Emmi-Testüberarbeitung, Tutorial-Replay sowie weitere in der Integration enthaltene Webänderungen. Reine Webupdates benötigen künftig keinen neuen iOS-Build, solange sie nach grüner CI in denselben verifizierten Preview-Channel deployt werden.

Umgebungsrouting:
- Standard: Integration-Preview `hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`;
- expliziter Fallback: normales Staging `hausaufgabe-staging.web.app`;
- andere `hausaufgabe-staging--*.web.app`-Previews bleiben für gezielte Betatests zulässig;
- Production-Hosts werden weiterhin nicht als Beta-Ziel akzeptiert;
- bei Ladefehlern kann direkt auf normales Staging zurückgefallen werden;
- Beta-Sheet zeigt Host und Umgebung sichtbar an.

Der tatsächliche Swift-Routingcode wird vor jedem TestFlight-Archive ausgeführt. Für 0.1.5 prüft er Integration als Default, Stable-Staging-Fallback, Query-Marker (`gradecrewApp=teacher`, `source=ios`, `appVersion`) sowie die Ablehnung von Production/missbräuchlichen URLs.

## Shared Design synchronisiert

Aus dem aktuellen Web-Integrationsstand wurden die gemeinsamen Designquellen in die App-Basis übernommen:
- `shared/gradecrew-design/tokens.json` → 1.1.0;
- `native/Shared/GradeCrewDesignTokens.swift` → 1.1.0;
- `shared/gradecrew-design/assets.json` → 1.2.0;
- `native/Shared/GradeCrewAssets.swift` → 1.2.0.

Wichtig: Das neue Brand-Manifest ist damit im Code bekannt, aber die neuen `brand-*-v1.svg`-Dateien wurden in diesem Teilschritt noch nicht als native App-Ressourcen/AppIcon paketiert. Das sichtbare TestFlight-AppIcon bleibt daher vorerst das bestehende Beta-Icon. Vor Nutzung von `GradeCrewAssets.Brand.*` im nativen UI müssen die kanonischen Brand-Assets gezielt in den Xcode-Ressourcenpfad übernommen werden.

## Bestehende App-Shell

Weiterhin vorhanden:
- persistenter `WKWebsiteDataStore.default()` für die Web-Anmeldung;
- native alert/confirm/prompt-Dialoge;
- Safe-Area-/Keyboard-Grundlagen;
- Webprozess-Fehlerzustand und Retry;
- Preview-Host-Validierung;
- automatisierter TestFlight-Cloudbuild und Apple-Signing.

## Architekturentscheidung bleibt bestehen

Nicht sofort die komplette Webplattform nativ nachbauen. Solange Dashboard, Tutorial, KI-/Crew-Funktionen, Security und Design schnell weiterentwickelt werden, bleibt die Webplattform die Single Source of Truth. Die nächste Native-Stufe soll gezielt App-Mehrwert schaffen, statt Auth-, Daten- und UI-Logik zu duplizieren.

Nächste Shell-Schritte nach Gerätetest:
1. permanente Beta-Leiste aus dem Alltagslayout entfernen und Diagnose diskret erreichbar machen;
2. klare WKWebView-Navigation-Policy: intern in GradeCrew, externe Ziele systemgerecht öffnen;
3. Downloads/CSV/PDF/Share-Sheet sowie Upload/Kamera sauber nativ unterstützen;
4. schmale Web↔Native-Bridge für Share, externe Links, Diagnose und später Scanner/Haptik;
5. Offline-/Webprozess-Recovery und Release-/Host-Diagnose verbessern;
6. Versionsquelle vereinheitlichen (`generate_project.py` enthält noch 0.1.4, der Archive-Workflow überschreibt für den belegten 0.1.5-Build auf 0.1.5);
7. Native-Verhaltenstests ausbauen;
8. echtes GradeCrew-AppIcon/Launch-Auftritt aus den kanonischen Brand-Assets ableiten.

## Statusnachweis

- Code auf Aufgabenbranch: ja.
- In kanonischen App-Branch integriert: ja, Fast-Forward auf `8bdebaf1...`.
- Routing-Test: grün.
- Xcode Archive/Signing: grün.
- App Store Connect/TestFlight Upload: grün, Run `37015111963`.
- TestFlight von Apple verarbeitet/installierbar: noch nicht hier nachgewiesen.
- Physischer iPhone-/iPad-Test von 0.1.5: offen.
- Production: unverändert.

## Nächster ausführbarer Schritt

Sobald Apple 0.1.5 in TestFlight verarbeitet hat: auf dem iPad aktualisieren und bestätigen, dass unten `Integration` angezeigt wird. Danach im echten Gerät nacheinander Login/Session, Dashboard, Coco, Remy (Text + Sprache), Emmi, Tutorial/Replay und zentrale Editor-/Exportwege prüfen. Erst dieser Gerätetest hebt den App-Stand über den technischen Upload hinaus.
