# GradeCrew Secure · iPad Playground

Direkt in Swift Playground auf dem iPad lauffähiger Entwicklungsprototyp. Der aktuell veröffentlichte TestFlight-Build bleibt bewusst auf dem bereits getesteten Legacy-Staging-Ablauf. Der neue Secure-Backend-Pfad ist im Branch vorbereitet, aber noch nicht aktiviert oder deployed.

## Workflow

1. In Working Copy `feature/gradecrew-secure-ios` auschecken.
2. In der Dateien-App `Working Copy` als Ort aktivieren.
3. `Hausaufgabe/native/GradeCrewSecurePlayground.swiftpm` in Swift Playground öffnen.
4. ▶︎ starten und nur mit Staging-Testcodes testen.
5. Änderungen aus GitHub in Working Copy mit Pull holen.

## Zwei getrennte Sicherheitsgates

`GradeCrewSecureBuild` enthält absichtlich zwei unabhängige Schalter:

- `secureBackendEnabled = false` aktiviert später Preflight, serverseitige Attempt-ID, Secure-Autosave und serververifizierte Abgabe.
- `automaticAssessmentConfigurationEnabled = false` aktiviert später Apples echte AAC-Gerätesperre.

Beide bleiben auf `false`, bis der jeweilige Teil auf Staging geprüft ist. AAC darf erst aktiviert werden, wenn Apple das Entitlement `com.apple.developer.automatic-assessment-configuration` freigegeben hat und Signing/Provisioning es tatsächlich enthält.

## Vorbereiteter neuer Prüfungsablauf

Der neue Code unter `SecureBackendFlow.swift`, `SecureExamAPI.swift` und `SecureAttemptStore.swift` bildet den Zielablauf ab:

1. Testcode wird serverseitig geprüft, **bevor** das iPad gesperrt wird.
2. Titel, Fach, Klasse, Zeit und Startmodus werden angezeigt; Schüler gibt Name/Kürzel ein.
3. Server erzeugt einen gebundenen Secure-Attempt mit geheimem Bearer-Token. Das Token steht nie in der URL.
4. Bei gemeinsamem Start bleibt das iPad bis zur Lehrerfreigabe ungesperrt im Warteraum.
5. Erst wenn der Test starten darf, beginnt AAC. Der Prüfungs-WebView erscheint erst nach `assessmentSessionDidBegin`.
6. `secure-exam.html` erhält ausschließlich serverseitig bereinigte Aufgaben ohne Lösungsschlüssel.
7. Antworten werden revisionsbasiert serverseitig gespeichert. Zusätzlich liegt ein Recovery-Snapshot im iOS-Keychain (`ThisDeviceOnly`), nicht in UserDefaults oder der URL.
8. Bei App-/Netzunterbrechung wird derselbe Attempt wiederaufgenommen; ein neuer Browserdurchgang erzeugt nicht automatisch eine zweite Abgabe.
9. Die Abgabe wird serverseitig bewertet und deterministisch unter der Attempt-ID gespeichert. Doppelte Submit-Aufrufe liefern dieselbe Abgabe/Quittung zurück.
10. Der WebView meldet nur `submissionPending`. Die native App ruft danach selbst `verify` beim GradeCrew-Server auf. **Nur eine passende Serverquittung darf AAC beenden.**

`GradeCrewSecureRootView` ist bereits als späterer Umschaltpunkt angelegt. `App.swift` verwendet weiterhin absichtlich den bekannten `StartView`, solange `secureBackendEnabled` noch nicht freigegeben ist.

## AAC / Lockdown

Der vollständige AAC-Lebenszyklus ist vorbereitet:

- `AEAssessmentSession` wird gehalten, bis Apple Start bzw. Ende bestätigt.
- Prüfungsinhalt wird erst nach `assessmentSessionDidBegin` sichtbar.
- Bei AAC-Fehlern oder Unterbrechungen wird der Inhalt verborgen und die Session kontrolliert beendet.
- Während einer aktiven Secure-Session gibt es keinen normalen Schließen-Button.
- Nach bestätigter Abgabe wird `end()` ausgelöst und auf `assessmentSessionDidEnd` gewartet.
- Ein nicht verfügbarer Test beendet die AAC-Session wieder kontrolliert.

## Vor Aktivierung zwingend

Der Secure-Servercode ist **noch nicht auf Firebase Staging deployed**. Außerdem schützt die Firestore-Regel die vollständigen Fragedokumente erst bei Tests mit `secureExamEnabled: true`. Ein Staging-Pilot ohne dieses Flag kann den Ablauf testen, ist aber noch kein Nachweis dafür, dass Lösungen nicht mehr direkt lesbar sind.

Vor einem echten Pilot deshalb:

1. aktuellen Staging-Functions-Stand mit dem Repository abgleichen – `deploy-staging.sh` blockiert absichtlich einen Full-Deploy, solange die bereits ausgelieferten AI-Functions dem Git-Stand voraus sein könnten;
2. Secure-Functions + Rules + Secure-Hosting ausschließlich auf `hausaufgabe-staging` deployen;
3. einen eigenen Pilot-Test auf `secureExamEnabled: true` setzen;
4. Preflight, Start, Autosave, Reload, Offline/Online, Zeitablauf, Doppelabgabe und Receipt-Verify testen;
5. erst danach `secureBackendEnabled` aktivieren und `App.swift` auf `GradeCrewSecureRootView()` umschalten;
6. AAC separat erst nach Apple-Freigabe aktivieren.

Produktion und der aktuell funktionierende TestFlight-Build werden durch die vorbereiteten Branch-Änderungen nicht verändert.
