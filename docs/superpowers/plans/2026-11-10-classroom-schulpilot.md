# GC-CLASSROOM-01 – Plan für den ersten Schulpiloten

Stand 10. November 2026. Vorschlag für die Freigabeentscheidung. Verantwortlicher Fachstrang ist Classroom, mit Übergabe an den Native-Owner für Secure und an den Release-Owner für die Veröffentlichung. Ziel ist eine Schule mit einer Klasse, zwei Lehrkräften und einem nachvollziehbaren Durchlauf von der Liste bis zur Abgabe.

## Aktueller Stand

| Teil | Beleg | Offener Schritt |
| --- | --- | --- |
| Klassen und Schüler im Web | Die [2026-Testseite](https://gradecrew-staging-2026.web.app/workspace.html?intent=login) liefert den Classroom-Quellstand `5be513d6`. Klassenanlage, manuelle Schüleranlage, persönliche Codes, Druckansicht, Zuweisung und LIVE-Übersicht sind im ausgelieferten Modul vorhanden. Lehrer-API antwortet mit erlaubtem Origin und ohne Anmeldung korrekt mit JSON 401. | Aktuellen angemeldeten Durchlauf neu belegen. |
| Persönlicher Schülerzugang | Das Web-Modul ist ausgeliefert. Der tatsächlich verwendete POST `/api/classroom/online` mit `me` liefert auf 2026 HTTP 404 und HTML. | Hosting-Route, Rewrite und Zielrevision abgleichen. Ursache anhand der aktuellen Konfiguration bestätigen. |
| Import und Kollegium | Der lokale Arbeitsstand enthält Schüler- und Lehrkräfte-CSV, Vorschau, Einladungsannahme und Schulverwaltung. Die Online-Befehle auf dem Classroom-Quellstand enthalten Anlage und Zuweisung, aber keinen Import und keine Einladungsannahme. | Die schlanken Abläufe aus der lokalen Umsetzung in die Online-Architektur übernehmen und serverseitig prüfen. |
| Secure und Abgabe | Synthetische Durchläufe mit bestätigter Abgabe und gezieltem Neustart sind in der Übergabe dokumentiert. Der reguläre Secure-Build 1.0 (1272) wurde im Oktober für gradecrew.de in TestFlight bestätigt. | Aktuelle Version und Zielumgebung vor einer Geräteabnahme abgleichen. Vollständiger physischer Durchlauf mit persönlichem Schülercode und Eingang bei der Lehrkraft bleibt offen. |
| Öffentliches GradeCrew | `gradecrew.de` liefert Web-Release `338c0432`. Der Classroom-Modulpfad liefert dort 404. Der vorhandene Classroom-Backendquellstand akzeptiert ausdrücklich das Projekt gradecrew-staging-2026. | Classroom gezielt für ein bestätigtes Pilotziel integrieren. Bestehende öffentliche Testabläufe als Regression absichern. |

Die Bewertung für den **ersten Schulpiloten** ist **5/10**. Klassen, Codes und Prüfungsablauf stehen auf einem getesteten Fundament. Der Schüler-Webzugang hat einen belegten Routingfehler. Mehrere Lehrkräfte pro Schule, einfacher Listenimport und eine frische Abnahme sind die wesentlichen Arbeiten bis zum ersten realen Einsatz. Die aktuelle Registerzeile verweist auf den älteren Masterbranch. Der neuere ausführende Stand liegt auf `feature/classroom-integrated-preview-20261016` bei `42964c1e`. Der [Development-Status-Lauf](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/42830559811) ist ein Nachweis für den Registerabgleich.

## Schulablauf für den Pilot

1. **Schule und Zuständigkeit.** GradeCrew richtet nach Bestätigung durch die Schule einen Schulbereich ein. Frau Zuber ist hier das Beispiel für die von der Schule benannte Verwaltung. Sie meldet sich mit ihrem eigenen Konto an und kann eine Stellvertretung einladen. Schulverwaltung, Fachzuständigkeit und Testeigentum sind getrennte Berechtigungen.
2. **Kollegium aufnehmen.** Im Pilot lädt die Verwaltung Lehrkräfte einzeln über deren dienstliche E-Mail ein und weist Klasse und optional Fach zu. Die Lehrkraft nimmt mit ihrem eigenen angemeldeten, verifizierten Konto an. Einladung ist schulbezogen, einmalig, befristet und widerrufbar. Der aktive Zugriff entsteht mit Annahme und bestätigter Zuordnung. Eine spätere Kollegiumsliste darf Zuordnungen vorbereiten, aber keine Kontoübernahme oder Rechte anhand eines Namens auslösen.
3. **Schülerliste übernehmen.** Die Schule kann eine CSV aus Excel oder ASV exportieren. Pflichtfelder sind **Klasse, Vorname, Nachname**. Für den ersten Pilot ist CSV der Eingabeweg. Einfügen aus der Zwischenablage kann danach dieselbe Vorschau wiederverwenden. Eine Liste für nur eine Klasse darf die Klasse im Formular einmal auswählen. Eine kombinierte Namensspalte muss die Verwaltung in der Vorschau eindeutig auflösen, bevor sie übernimmt.
4. **Vorschau und Bestätigung.** Der Browser liest die Datei, ordnet Spalten zu und schickt nur die erforderlichen normalisierten Werte für eine serverseitig geprüfte Vorschau. Zusatzspalten und Rohdatei bleiben außerhalb des Servers. Vorschau zeigt neue, bereits zugeordnete und unklare Zeilen. Mehrere gleichnamige Personen und Klassenwechsel brauchen eine Entscheidung. Fehlende Zeilen lösen keine Löschung aus. GradeCrew vergibt interne IDs. Ohne stabile Referenz sind Namensgleichheit und Klasse Hinweise, keine sichere Wiedererkennung. Ein Wiederimport derselben bestätigten Liste erzeugt keine Duplikate. Änderungen seit der Vorschau erzwingen eine erneute Prüfung.
5. **Unterricht.** Zugeordnete Lehrkräfte sehen ihre Klassen. Sie wählen einen eigenen veröffentlichten Test, weisen ihn der Klasse zu und sehen den Status der zugehörigen Abgaben. Schüler erhalten einen persönlichen Code, sehen nur ihre Aufgaben und geben über den bestehenden Prüfungsablauf ab. Ersatzcode und Gerätewechsel werden kontrolliert unterstützt. Tests einer anderen Lehrkraft und deren Ergebnisse bleiben an ausdrücklich vergebene Rechte gebunden.

## Umsetzung und Abnahme

### 1. Testanbindung wiederherstellen

- [ ] Den Schülerpfad aus `classroom/online-client.mjs` gegen den veröffentlichten Hosting-Rewrite und `assessment-functions/lib/classroom-functions.js` prüfen. Vollständige tatsächlich veröffentlichte Hosting-Dateiliste und Konfiguration vor jeder Änderung aufnehmen. Die historische Wilma-Lücke in der Manifestdatei macht eine Prüfung nur anhand von release.json unzureichend.
- [ ] Den kleinsten Routing-Fix auf isolierter Vorschau verifizieren, dann auf der 2026-Testumgebung ausrollen, wenn der dafür autorisierte Auftrag vorliegt. `me` ohne Sitzung liefert JSON 401. Login eines synthetischen Schülers erzeugt ein geschütztes Cookie. Aktualisieren, Abmelden, abgelaufener oder falscher Code und Rückkehr zum normalen Testcode-Einstieg sind im Browser geprüft.
- [ ] Mit zwei frischen Lehrerkonten, zwei fiktiven Schulen und einer Klasse die Ausgangslage dokumentieren. Neuen und vorhandenen Schülerzugang getrennt prüfen. Belege nur mit fiktiven Datensätzen sichern.

### 2. Online-Rechte für Verwaltung und Kollegium

- [ ] Rollen- und Einladungsvertrag in `assessment-functions/lib/classroom-service.js` und der Befehlsgrenze in `classroom-functions.js` festlegen. Vorhandene lokale Schulverwaltung und Einladungszustände als Vorlage verwenden. Online-Datenzugriff bleibt an die serverseitig verifizierte Schulmitgliedschaft gebunden. Ein Schalter im Frontend allein kann die Pilotgrenze nicht absichern.
- [ ] Schule, Klassenfreigaben und Rolle serverseitig bei jeder Operation prüfen, insbesondere beim Anzeigen und Drucken von Codes, Import, Testzuweisung und Abgabezugriff. Einladeannahme, Widerruf und Zuständigkeitswechsel protokollieren. Lehrkraft ohne Klasse erhält keinen Zugriff auf Schülerlisten. Codes und Einladungslinks bleiben aus Logs und Telemetrie heraus.
- [ ] Zwei Kollegen mit unterschiedlichen Klassen, Verwaltung mit Stellvertretung und eine zweite Schule als Gegenprobe testen. Falsches Konto, wiederverwendete Einladung, parallele Annahme und Widerruf bei offener Seite führen zu den vereinbarten Sperren. Laufende Abgaben brauchen bei Rollenwiderruf einen festgelegten, getesteten Abschlussweg.

### 3. Schlanken Schülerimport online bringen

- [ ] `classroom/csv.mjs`, `named-import.mjs` und `roster-import-dialog.mjs` auf wiederverwendbare Parser-, Zuordnungs- und Vorschauanteile prüfen. Online-Befehle für Vorschau und bestätigte Übernahme ergänzen. Beim Speichern Klassen, Schuljahr, Schulrechte und Vorschauversion erneut prüfen. Wiederholung nach Verbindungsabbruch darf die gleiche Änderung nur einmal anwenden.
- [ ] Repräsentative fiktive Excel-/ASV-Exporte prüfen, einschließlich Semikolon, Umlaute, fehlender Kopfzeile mit manueller Zuordnung, Zusatzzellen, doppelten Namen und Klassenwechseln. Prüfen, dass Dateiinhalte außerhalb der drei ausgewählten Felder weder in Requests noch in Logs oder KI gelangen. Nutzer sehen vor dem Speichern nachvollziehbare Zeilenzahlen und Konflikte.
- [ ] Eine Beispieldatei und eine kurze Anleitung für die Schulverwaltung bereitstellen. Kollegiumsimport nach Pilotfeedback bewerten. Automatische ASV-Synchronisation, schulenübergreifende Kontoverwaltung und Jahreswechsel werden separat geplant.

### 4. Datenschutz und Geräteabnahme vor Echtdaten

- [ ] Den Unterschied zwischen dem früheren Konzept mit lokalen Klarnamen und dem vorgeschlagenen Cloud-Pilot ausdrücklich auflösen. Vorschlag: Rohdatei bleibt im Browser. Klarnamen als Online-Anzeigenamen nur, wenn die Schule diese Verarbeitung für ihren Zweck begründet und freigibt. Als Alternative Anzeigename oder Kürzel online und Namenszuordnung bei der Schule. Keine Geburtsdaten, Schüler-E-Mails, Anschriften, ASV-Rohkennungen oder Personalnummern im Pilotvertrag.
- [ ] Mit Schulleitung und Datenschutzbeauftragten Zweck, Rechtsgrundlage, Auftragsverarbeitung soweit einschlägig, Unterauftragnehmer, Datenstandorte, technische Maßnahmen, Hinweise an Betroffene, Aufbewahrung, Löschung, Auskunft und die Erforderlichkeit einer Datenschutz-Folgenabschätzung klären. Ergebnisse und Abgaben in die Datenübersicht einbeziehen. [Handreichung des bayerischen Kultusministeriums](https://www.km.bayern.de/recht/datenschutz-an-schulen).
- [ ] Mit fiktiven Schülern den vollständigen Browserablauf und bei geplantem Secure-Einsatz dieselbe Runde auf einem physischen iPad abnehmen. Gemeinsamer Start, falscher Code, Verbindungsabbruch, Wiederaufnahme, doppelte Abgabe und Bestätigung in der Lehreransicht prüfen. Die Funktion „Prüfung für eine Person beenden und abgeben“ ist vom vorhandenen technischen Unterbrechen zu trennen und im Pilotumfang ausdrücklich zu entscheiden.

### 5. Begrenzte Freigabe und Erweiterung

- [ ] Zuerst fiktiver Durchlauf mit Martin und einer zweiten Lehrkraft. Danach genau eine namentlich bestätigte Pilotschule mit einer Klasse und zwei Lehrkräften. Bestehende Konten nutzen, ohne historische Testdaten zwischen Umgebungen zu kopieren. Als erste Runde eine unbenotete Probe einplanen. Schulverwaltung und Support kennen Ansprechpartner, Ersatzcode und Rückmeldeweg.
- [ ] Freigabe erst mit erfolgreichem Schülerlogin, klarer Schul- und Klassentrennung, bestätigtem Import, nachvollziehbarem Abgabe-Eingang und geklärtem Datenbetrieb. Der Release-Owner dokumentiert Quellstand, Zielprojekt, Hosting-Bestand, Backend und Regeln. Martin gibt die konkrete Veröffentlichung frei. Einen serverseitigen Schalter pro Pilotschule vorsehen, um neue Starts zu pausieren und laufende Abgaben sicher abzuschließen.
- [ ] Nach der ersten Runde Schuleinrichtung, Importkorrekturen, Zugangsprobleme und bestätigte Abgaben auswerten. Weitere Klassen erst nach Klärung von Zugriffs-, Import- und Abgabeproblemen. Andere GradeCrew-Bereiche können dieselbe Klassen- und Zuordnungsbasis später über eigene geprüfte Freigaben verwenden.

## Entscheidungen und nächster Schritt

| Entscheidung | Zuständig | Status |
| --- | --- | --- |
| Schülerroute und Zielrevision wieder zusammenführen | Classroom mit Hosting-Owner | HTTP 404 belegt. Aktueller Rewrite und Zielrevision noch abzugleichen. |
| Online-Klarnamen oder schulinterne Namenszuordnung | Pilotschule mit Datenschutz und Martin | Vorschlag dokumentiert. Entscheidung vor Echtdaten. |
| Pilotkanal Browser plus optional Secure | Martin und Pilotschule, Secure-Owner für Abnahme | Browser zuerst vorgeschlagen. Secure nur mit Geräteabnahme für den gewählten Pilotumfang. |
| Freigabe erste Schule | Martin und benannte Schulleitung | Abhängig von den belegten Abnahmen und dem bestätigten Datenbetrieb. |

Nächster ausführbarer Schritt ist die Diagnose der aktuellen 2026-Hosting-Route `/api/classroom/online` mit der tatsächlich veröffentlichten Konfiguration. Anschließend einen synthetischen Schülerlogin als Abnahme für den Routing-Fix verwenden.
