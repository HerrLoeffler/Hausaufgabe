# GC-SECURITY-02 — sichere Audiofreigabe auf Staging

Martins Folgeauftrag vom 09.10.2026 autorisiert Fehlerbehebung, technische Prüfung und notwendige Staging-Veröffentlichung. Production ist ausgeschlossen. Bestehenden Secure-Assessment-V1-Plan fortführen; keine zweite Exam-Engine. Aktueller Web-Ausgangspunkt `951e49919065e1e134053a900d1ac55129c48344` enthält den geprüften Veröffentlichungsschalter-Fix aus PR176 und datensparsame Backendstatusdiagnostik.

## Nachgewiesener Ausgangszustand

- Live Hosting zunächst `ea7def2`/`gc28`. PR176 Kandidaten-CI `37919109773` und Merge-CI `37919316072` erfolgreich; Preview `37919465270`, Receipt `11610154176`, immutable Build `11611233941` für exakt `951e499` geprüft. Functions-Run `37919465218` läuft; noch kein Functions-Abschluss behauptet.
- Firebase-Konsole mit bestehendem Konto auf `hausaufgabe-staging` erreichbar. Aktive Regeln stammen vom 26.09.2026, erlauben veröffentlichte Autorenfragen. Der anonyme REST-GET auf eigens erzeugte Systemtest-Aufgabe `GENDF4YQQV/questions/ge-single` lieferte HTTP200. Keine echten Schülerdaten verwendet oder ausgegeben.
- Systemtest mit 11 Aufgabentypen und 30 virtuellen Teilnehmern scheitert auf Staging an `startAssessmentAttempt` mit HTTP500; Logzeit 09.10.2026 10:33 UTC, Fehlerframes gRPC. Numerischer Backendstatus war bislang nicht im Privacy-Logger enthalten; PR176 ergänzt ausschließlich Codes 0–16. Erst nach Deploy erneut prüfen, bevor Server-/Gate-E-Erfolg behauptet wird.
- Öffentliche Startlinks laufen bereits über callable-only `secure-student.html`. Lehreransicht, Inhaberlisten, Enden/Editieren und manuelle Bewertung sind mit `firestore.secure-assessment.rules` kompatibel. Unabhängige read-only Untersuchung hat die Felder der Lehrkraftupdates gegen Regeln abgeglichen. Der explizite server-only BugOps-Block wird in der sicheren Regeldatei erhalten; bisher wirkte hierfür bereits Default-Deny.

## Vorgehen und offene Nachweise

1. Schalterkorrektur kanonisch veröffentlichen und backendCode des reproduzierten Schülerstartfehlers bestimmen/beheben.
2. Sichere Regelquelle im tatsächlichen `firebase.json` hinterlegen; Emulator-Matrix und Backend/Clientprüfungen auf genau diesem Kandidaten.
3. Synthetischen Start/Abgabe/Parallelablauf auf Staging nachweisen; dann sichere Regeln kontrolliert veröffentlichen und anonymen direkten GET/Write sowie private Collection-Zugriffe nachweislich abweisen.
4. Erst danach beide Audiofreigaben für das verifizierte Staging-Projekt öffnen. Production bleibt unabhängig geschlossen. Echte Nur-Hören-/Audioantwort-Teststarts und Lehrer-Veröffentlichen/Enden erneut prüfen.

Lokale Design-/Mehrfarbenänderungen liegen separat in `gradecrew-web-repair-integration` und bleiben erhalten. Dort ist bereits der eng begrenzte Veröffentlichungsschalter-Fix aktiv; kein ganzer Staging-Checkout über das Design kopiert. Keine vollständige Geräte-, Last- oder Production-Abnahme aus Emulatorzahlen ableiten.

## Reproduzierter Speicherfehler

Backend-Deploy `37919465218` ist erfolgreich, AI-Receipt `11611441210`, Assessment-Receipt `11610054368` für `951e499`. Einzelner echter Schülerstart im synthetischen Test liefert Referenz `ASM-74d98788-80bd-4cda-a2c6-2fa315b93abb`, Logzeit 10:49:52 UTC, Revision `startassessmentattempt-00029-gag`, Backendcode **3 / INVALID_ARGUMENT**. Sicherer Logger funktioniert ohne privaten Fehlertext.

Der echte Firestore-Web-SDK-Parser reproduziert die Ablehnung `Nested arrays are not supported`: `buildGradingKey` erzeugte für jede Reihenfolgeaufgabe (auch ohne Zusatzvarianten) eine Liste direkt verschachtelter Listen, die als privater Bewertungsdatensatz gespeichert wurde. Zusätzlich betroffen waren nichtleere Zusatzvarianten in KI-/manuellen Aufgabenspeicherungen und Feedback-Snapshots. Der neue Speichertest war hierfür vorher rot.

Korrektur: private Lösungsschlüssel speichern Reihenfolgen in `{ids:[...]}`-Datensätzen, Autorenvarianten in `{indices:[...]}`. Alle betroffenen Lesewege normalisieren gespeicherte Datensätze und ältere Listen; transienter KI-Schema-/Promptvertrag bleibt unverändert. Bewertungsvarianten, Teilpunkte und Autor-Fingerprint bleiben erhalten. Der echte SDK-Parser akzeptiert nach der Änderung privaten Schlüssel, generierte/manuelle Aufgaben und Feedback. Ein zusätzlicher echter Emulatorfall startet und bewertet primäre und alternative Reihenfolgen; dessen exakte CI steht noch aus. Erst den gleichen Staging-Start nach neuem Backenddeploy erfolgreich belegen, bevor der ursprüngliche Livefehler als behoben gilt.
