# GradeCrew Secure · iPad Playground

Direkt in Swift Playground auf dem iPad lauffähiger Entwicklungsprototyp.

## Workflow

1. In Working Copy `feature/gradecrew-secure-ios` auschecken.
2. In der Dateien-App `Working Copy` als Ort aktivieren.
3. `Hausaufgabe/native/GradeCrewSecurePlayground.swiftpm` in Swift Playground öffnen.
4. ▶︎ starten und nur mit Staging-Testcodes testen.
5. Änderungen aus GitHub in Working Copy mit Pull holen.

## AAC / Lockdown

Der vollständige AAC-Lebenszyklus ist im Playground vorbereitet:

- `AEAssessmentSession` wird gehalten, bis Apple Start bzw. Ende bestätigt.
- Der Test wird im echten Secure-Modus erst nach `assessmentSessionDidBegin` gezeigt.
- Bei AAC-Fehlern oder Unterbrechungen wird die Prüfung sofort verborgen und die Session sauber beendet.
- Während einer aktiven Secure-Session gibt es keinen normalen Schließen-Button.
- Nach erkannter erfolgreicher Abgabe wird `end()` ausgelöst und auf `assessmentSessionDidEnd` gewartet.
- Ein nicht verfügbarer Test beendet die AAC-Session wieder sicher.
- Die Ladezeit des Webtests wird durch einen eigenen `Test wird geladen …`-Zustand verdeckt.

**Sicherheitsgurt:** `GradeCrewSecureBuild.automaticAssessmentConfigurationEnabled` steht absichtlich auf `false`. Nicht auf `true` setzen und keinen AAC-Build hochladen, bevor Apple das Entitlement `com.apple.developer.automatic-assessment-configuration` freigegeben hat und das Signing/Provisioning dafür eingerichtet ist.

Der derzeitige WebView-Bridge-Nachweis einer Abgabe eignet sich für den Hardware-Piloten. Für einen produktiven Prüfungsmodus soll das Entsperren später an einen serverseitig verifizierten Submission-Receipt / Attempt-Abschluss gekoppelt werden.

Bis zur AAC-Freigabe bleibt der normale Staging-/TestFlight-Ablauf unverändert nutzbar. Produktion wird durch diesen Branch nicht verändert.
