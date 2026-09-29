# Abgesicherte Prüfungsdurchführung · nächster Ausbau

Stand: 30. September 2026.

## Umsetzungsstand auf `feature/gradecrew-secure-ios`

Der Kern der Punkte 1–5 ist inzwischen **im Branch vorbereitet, aber noch nicht auf Firebase oder TestFlight veröffentlicht**:

- `secureExamApi`: Preflight, Prepare, Status, Start/Resume, revisionsbasiertes Autosave, idempotente Abgabe, Verify und Abort.
- `secureAttempts/{attemptId}`: serverseitig gebundener Versuch mit gehashtem Bearer-Token und Zuständen `prepared/ready -> starting -> running -> submitted/aborted`.
- `secureAttempts/{attemptId}/snapshot/*`: eingefrorene Prüfungsfassung mit getrenntem öffentlichen Aufgabenobjekt und privatem Bewertungsschlüssel.
- `submissions/{attemptId}`: deterministische Abgabe-ID statt neuer zufälliger Dokumente; wiederholte Submit-Aufrufe liefern dieselbe gespeicherte Abgabe/Quittung.
- Serverbewertung für alle aktuellen GradeCrew-Aufgabentypen. Der Secure-Schülerclient erhält keine `correct`-Marker, Musterlösungen, `acceptedAnswers`, `numericAnswer`, Zuordnungsschlüssel, Gruppenzugehörigkeiten oder Zielwörter.
- `firestore.rules`: Bei `secureExamEnabled: true` sind vollständige Fragedokumente und direkte Schüler-Submissions gesperrt; Secure-Attempts und deren private Snapshots sind vollständig für Firestore-Clients gesperrt.
- `secure-exam.html/js/css`: isolierte Prüfungsoberfläche mit Server-Timer, Autosave, Offline-Wiederholung, Wiederaufnahme und manuellem/frühzeitigem Submit.
- Native Vorbereitung: Preflight vor AAC, Warteraum vor AAC, Keychain-Recovery (`ThisDeviceOnly`), WebView-Bootstrap ohne Token in der URL und unabhängiges natives `verify` vor dem Entsperren.
- Zwei getrennte Build-Gates bleiben `false`: `secureBackendEnabled` und `automaticAssessmentConfigurationEnabled`.

Wichtig: Der Staging-Full-Deploy bleibt absichtlich blockiert, solange der bereits ausgelieferte AI-Functions-Stand nicht mit dem Git-Quellstand abgeglichen wurde. Ein voreiliger Full-Deploy könnte andere Staging-Functions zurückrollen. Produktion bleibt unangetastet.

## Akuter Befund aus dem ursprünglichen Staging-Test

Im realen Schülerfluss wurde ein konkreter Missbrauchspfad gefunden: Nach einer Abgabe können bei aktivierter Lösungsanzeige die Lösungen erscheinen; über Browser-Zurück beziehungsweise eine wiederhergestellte Schüleransicht kann anschließend erneut gearbeitet und erneut abgegeben werden. Weil die bisherige Abgabe mit einem neuen zufälligen Firestore-Dokument angelegt wird, können dabei mehrere Abgaben desselben Bearbeitungsversuchs entstehen. Das erklärt auch mehrfach auftauchende Schülerabgaben in der Lehrkraftansicht.

Als unmittelbare Eindämmung wurde `student-attempt-guard.js` ergänzt. Auf öffentlichen Schülerlinks werden Lösungen während einer laufenden Durchführung nicht mehr angezeigt, eine erfolgreich erkannte Abgabe wird lokal für denselben Versuch versiegelt, wiederhergestellte Formulare werden deaktiviert und Back-/bfcache-Wiederherstellungen dürfen nicht erneut absenden. Neue echte Zeit-/Sitzungsversuche mit anderer Attempt-/Run-ID bleiben möglich. Lehrkraft-Vorschauen werden nicht verändert.

Diese Sperre ist bewusst nur ein **Client-Hotfix**, keine vollständige Prüfungsabsicherung. Der neue Secure-Pfad ersetzt diese Vertrauensannahmen serverseitig; der Legacy-Browserpfad bleibt bis zur kontrollierten Migration separat bestehen.

## Zielarchitektur für GradeCrew

1. **Lösungen schützen und serverseitig bewerten.** Secure-Tests liefern ausschließlich bereinigte Aufgaben aus einer serverseitig eingefrorenen Attempt-Fassung. Lösungsschlüssel bleiben serverseitig und werden nur zur Bewertung verwendet. Alte/Standard-Tests bleiben bis zur kontrollierten Migration kompatibel.
2. **Prüfungssitzungen verbindlich machen.** Jeder Secure-Durchgang – auch ohne Zeitlimit – hat eine serverseitige Attempt-ID. Eine Transaktion akzeptiert nur den erlaubten Zustandsübergang und die Abgabe liegt deterministisch unter derselben Attempt-ID. Wiederholte Requests sind idempotent.
3. **Lösungsfreigabe vom Abgabezeitpunkt trennen.** Secure-Abgabe gibt keinen Lösungsschlüssel zurück. Eine spätere Schüler-Lösungseinsicht braucht einen eigenen, ausdrücklich freigegebenen Serverpfad und gehört nicht in den laufenden Prüfungsclient.
4. **Autosave und Wiederaufnahme.** Server-Autosaves verwenden monotone Revisionen. Zusätzlich kann die iPad-App den jüngeren lokalen Antwortstand im device-only Keychain puffern und nach WebView-/App-Neustart wieder einspielen. Die serverseitige Deadline bleibt maßgeblich; ein kurzer Offline-Nachlauf verhindert Datenverlust direkt beim Zeitablauf.
5. **Entsperren nur nach Serverquittung.** Der WebView darf nur melden, dass eine Abgabe angestoßen wurde. Die native App verifiziert Attempt + Submission + Receipt unabhängig über den Server. Erst danach darf `AEAssessmentSession.end()` ausgeführt werden.
6. **Lehreransicht und Notfallfluss.** Als nächster Ausbau: `bereit / gesperrt / läuft / offline / wieder verbunden / abgegeben / entsperrt`, gezielte Notfreigabe, definierter Serverausfall- und Gerätewechselprozess. Eine Notfreigabe muss protokolliert werden und darf keine bestehende Abgabe überschreiben.
7. **Ausfall- und Angriffstests.** Reload, App-Neustart, WLAN aus/an, Zeitablauf offline, parallele Autosaves, doppelte Submit-Requests, manipulierte Antworten/Punktwerte, fremde Attempt-Tokens, geänderte Testrunde, alte App-Version, direkter Firestore-Zugriff und AAC-Unterbrechung.
8. **Spätere weitere Härtung.** App Attest / Geräteattestation und Replay-Schutz können auf den stabilen Attempt-/Receipt-Unterbau gesetzt werden. Sie ersetzen nicht die serverseitige Autorisierung.

## Aktivierungsreihenfolge

1. Staging-Functions-Quelle mit dem tatsächlich ausgelieferten Staging-Stand abgleichen.
2. Secure-Functions, Rules und Hosting nur auf `hausaufgabe-staging` veröffentlichen.
3. Eigenen Pilot-Test auf `secureExamEnabled: true` setzen – nur dann ist auch der direkte Firestore-Zugriff auf Lösungsschlüssel geschlossen.
4. Serverpfad ohne AAC testen: Preflight → Prepare → Start → Autosave → Resume → Submit → Verify.
5. Danach den nativen Root auf `GradeCrewSecureRootView` umschalten und `secureBackendEnabled` für einen neuen Staging/TestFlight-Pilot aktivieren.
6. AAC erst nach Apples Entitlement-Freigabe + passendem Signing aktivieren und auf echter Hardware testen.
7. Erst nach der vollständigen Testmatrix über eine Production-Migration entscheiden.

Ein zweites physisches Gerät außerhalb des Prüfungs-iPads bleibt auch mit AAC eine organisatorische Aufsichtsfrage; GradeCrew sollte deshalb nicht als „100 % schummelsicher“ beworben werden.

## Primärquellen

- [Exam.net: Sicherheitsstufen](https://exam.net/cheat)
- [Safe Exam Browser: Integration](https://safeexambrowser.org/developer/seb-integration.html)
- [Safe Exam Browser: technische Dokumentation](https://safeexambrowser.org/developer/overview.html)

Die konkrete GradeCrew-Architektur oben ist unsere Ableitung aus dem vorhandenen Quellcode und diesen Integrationsprinzipien, keine Aussage über Exam.nets interne Implementierung.
