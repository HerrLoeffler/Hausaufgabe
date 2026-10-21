# GradeCrew: Fehler nachvollziehen und beheben

Stand: 30.09.2026 · Implementierung gc27 · Status des Deployments: siehe GRADECREW_STATUS.md.

## Ein einfacher Arbeitsablauf

1. Fehlermeldung über „Fehler melden“ sichern. Meldungs-ID, Version, Zeitpunkt und Umgebung notieren. Bei Prüfungsfehlern zusätzlich die sichtbare `ASM-…`-Kennung.
2. Admin → Feedback öffnen. Nach Umgebung, Version, Aktion, Schweregrad, Zeitraum und Fingerprint filtern; nach Datum, Häufigkeit oder Priorität sortieren. Häufigkeit unterscheidet einzelne Meldungen und wiederholtes Auftreten.
3. „Ursache, Lösung & Prüfnachweis“ aufklappen: Release-Commit und letzte technische Schritte lesen. Im zugehörigen Commit den unten genannten Code prüfen. Ein fehlender Commit bedeutet „nicht erfasst“, niemals stillschweigend den neuesten Stand annehmen.
4. Mit Testkonto und künstlichen Aufgaben reproduzieren. Erwartetes und tatsächliches Verhalten aufschreiben. Ursache benennen, nicht nur das Symptom.
5. Kleinste zusammenhängende Korrektur und einen Verhaltenstest für den tatsächlichen Fehlerfall hinzufügen. Ursache, Fix-Commit und Prüfnachweis im Admin-Eintrag speichern. Technische Meldungen lassen sich in der UI erst danach erledigen.
6. CI-Ergebnis und verbleibende reale Sicht-/Firebase-Tests dokumentieren. Nach Deployment `release.json` gegen den Fix-Commit prüfen und denselben Ablauf erneut testen.

### Kopiervorlage für einen Fehler

- Meldungs-ID / ASM-Kennung:
- Umgebung / Release-Commit / Version:
- Auslöser und Schritte:
- Erwartet / tatsächlich:
- Ursache und betroffene Datei/Funktion:
- Fix-Commit:
- Regressionstest / CI-Lauf:
- Reale Nachprüfung / noch offen:

## Welche Datei ist zuständig?

| Bereich | Einstieg | Prüfung |
|---|---|---|
| Client-Fehler und Admin-Oberfläche | app.js: showReportableError, renderAdminFeedback, saveErrorResolution | diagnostics.test.mjs; reale Admin-Preview |
| Technische Ablaufspur und Redaktion | diagnostics.mjs | diagnostics.test.mjs |
| Filter, Sortierung, Fehlergruppen, Export | admin-log-tools.mjs | diagnostics.test.mjs |
| Prüfungs-API und Lebenszyklus | assessment-functions/lib/secure-lifecycle.js | security-audit-behavior.test.js |
| Server-Kennung, Laufzeit, Codeposition | assessment-functions/lib/observability.js | observability.test.js |
| Schülerfehler | secure-assessment-client.js, secure-student.js | secure-assessment-client.test.mjs, secure-student.test.mjs |
| Tutorialzustände / Weiterklicken / Scrollen | gradecrew-tour-v7.js | gradecrew-tour.test.mjs |
| Spätere Text-/Layoutänderungen | crew-tour-gc22…gc26*.js | jeweilige crew-tour-gc*-Tests |
| Gemeinsam dargestellte Aufgabe und Hilfe | gradecrew-tour.css, gradecrew-tour-v7.js | Tour-Verhaltenstest; reale mobile Sichtprüfung |
| Figuren und Pose-Ausschnitte | assets/gradecrew/*.svg | crew-art.test.mjs; alle 24 Posen visuell prüfen |
| Paketinhalt und veröffentlichter Commit | tools/build-staging.mjs, release.json | CI Staging-Build, Release-Hashprüfung |

## Was wird erfasst – und was nicht?

Die neue Browser-Spur hält höchstens 40 technische Ereignisse im Arbeitsspeicher: bekannte Button-Aktionen, Seitenwechsel, Tutorialschritt sowie online/offline. Bei Kontowechsel/Abmeldung wird sie gelöscht. Keine Eingabewerte, Antworten, DOM-Texte oder Netzwerknutzdaten. Sie wird erst mit einer gemeldeten technischen Störung gespeichert; kein vollständiges Sitzungsrecording.

Technische Fehlertexte werden begrenzt und bekannte E-Mails, URL-Parameter, Bearer-Werte und Schlüssel entfernt. Das ist keine universelle Anonymisierung beliebiger Freitexte. Bereits vorhandene Feedback-/KI-Diagnosen können weiterhin Namen, Nachrichtentexte oder Aufgabenausschnitte enthalten. Zugriffe bleiben adminbeschränkt.

Der JSON-Diagnoseexport enthält die aktuell gefilterten, geladenen Datensätze mit Kennung, Version, Ablaufspur und Untersuchung. Konto-/Kontaktfelder, rohe Fehlermeldungen und KI-/Aufgaben-Snapshots werden ausgelassen. Freitext zur Ursache und Prüfung vor Weitergabe auf personenbezogene Daten prüfen. Keine öffentliche Freigabe des Exports.

Der Server erzeugt je Callable eine unabhängige `ASM-…`-Kennung. Strukturierte Logs enthalten Aktion, Status, Dauer, Deployment-Revision und bei Fehlern Codepositionen (Dateiname/Zeile). Keine Requests, Antworten, Namen, Token oder rohe Exception-Texte. Erfolgreiches Starten/Abgeben und langsame Aufrufe werden protokolliert; normale erfolgreiche Status-Polls nicht. Referenz erscheint bei Clientfehlern und erlaubt die Suche in Cloud Logging:

```text
jsonPayload.component="assessment"
jsonPayload.reference="ASM-…"
```

Diese Serverlogs werden nicht automatisch ins Admin-Feedback importiert. Zugriffsrechte und Aufbewahrungsdauer für Cloud Logging vor Production festlegen; gc27 richtet weder Alerts noch eine neue Retention ein.

## Bekannte Grenzen und nächste Aufräumarbeiten

- Admin-Audit lädt 200 Einträge pro Seite. Filter gelten ausdrücklich nur für geladene Daten. Ältere Einträge über „Ältere Einträge laden“ ergänzen. Feedback wird weiterhin als gesamter Bestand geladen; serverseitige Paginierung/Indizes bei wachsendem Volumen nachziehen.
- Admin-Änderung und Audit-Eintrag sind noch keine atomare Transaktion. Ein fehlgeschlagener Audit-Write kann deshalb eine Lücke lassen. Das Protokoll ist kein manipulationssicheres Compliance-Archiv.
- Das Tutorial hat mehrere nacheinander laufende Polish-Module. Sie waren Ursache wiederholt überschriebener Texte. Beim nächsten Refactoring Texte und Layoutregeln schrittweise in einen Tour-Renderer überführen; jeden entfernten Override mit dem bestehenden Verhaltenstest absichern.
- Nicht überall existiert ein vollständiger Ende-zu-Ende-Test. Mock-/DOM-Tests ersetzen keine parallelen Firestore-Transaktionen, Bildschirmtastatur oder echten iPhone-Test.
- Alte Meldungen besitzen keine nachträglich rekonstruierbare Ablaufspur. Fehlende Daten sichtbar lassen, nicht erfinden.

## Warum die aktuellen Fehler entstanden

| Fehler | Ursache | Korrektur / Nachweis |
|---|---|---|
| Du-Frage verschwindet | gc23 überschreibt den schon korrekten Namenstext nachträglich | Text auch am überschreibenden Ursprung korrigiert; Tour-Regressionssuite |
| „Persönliche KI-Vorgaben“ kehrt zurück | Mehrere Module setzen denselben Erklärungstext | gc22 und gc23 nennen direkt „Vorgaben für Remy“ |
| Wünsche sind zu schnell weg | Erklärschritt markiert anderes Element; sehr schnelle Schreibanimation | Erklärung bleibt beim Wünsche-Feld bis zum Klick; langsamere Animation; Journey-Test |
| Hilfe verdeckt Aufgabe/Katze | Fix positionierter Coach getrennt von der Aufgabe | Echte Coach-Karte unmittelbar vor echter Aufgabenkarte; verbundene Rahmen; Scrollen zugelassen |
| Farbreste an Figurenrändern | Hintergrundreste im Atlas plus Posen außerhalb starrer 512er-Kacheln | Vier bereinigte transparente Atlanten; sechs gepolsterte, explizit geclippte SVG-Ausschnitte je Figur |
| Fehler schwer zum Code zuzuordnen | Release-/Ablauf-/Untersuchungsdaten fehlten | Commit, begrenzte Breadcrumbs, Serverkennung, Ursache/Fix/Prüfung |

Weitere Sicherheitsursachen und offene Release-Gates: SECURE_ASSESSMENT_AUDIT_2026-09-30.md und GRADECREW_STATUS.md.
