# Secure Layout und Statistik – Auslieferungsnachweis

Stand 16.10.2026. Branch `feature/secure-layout-telemetry-20261016`. Production unverändert.

## Belegter Umfang

- SwiftUI-Einstieg mit Crew, sichtbaren Feldern, gepaarten hellen Farben; eigener nativer Prüfungsrahmen mit Timer und Speicherstatus.
- Lokaler Aufgabenrenderer mit nummerierter Übersicht, aktueller Aufgabe, Bearbeitungshaken, Vor/Zurück und Bestätigung einer zunächst unveränderten Sortieraufgabe. Grün bedeutet ausgefüllt, nicht fachlich richtig.
- Elf Antworttypen, gespeicherter Stand rückwärtskompatibel, größere Schrift, kompakte Leisten, Auswahl- und Medienfehlerzustände.
- Abgabezusammenfassung mit offenen Aufgaben, automatische Abgabe bleibt unabhängig vom Dialog; Serverquittung und Apple-Freigabe bleiben getrennte Voraussetzungen.
- Neue Staging-Telemetrie getrennt von vorhandenen Prüfungsfunktionen. Details und Begrenzungen: [Geräte und Statistik](../../ipad-support-and-statistics.md).

## Lokale Nachweise

- Swift-Kern: 25 Tests bestanden; Renderer-/Navigation: 19 Tests plus 4 Statistik-Tests; Python: 19 Tests. Vollständiger Simulator-Appbuild bestanden.
- Vollständige WebKit-Matrix auf iPad mini (A17 Pro): 360/360 statische Berichte plus 12/12 tatsächliche Bedienabläufe, bestanden. `/private/tmp/secure-web-full-corrected/summary.json`.
- Die Matrix fand sechs Fälle, in denen die offene Übersicht bei großer Schrift im Querformat zu viel Höhe einnahm. Regression nachgewiesen und kompakte Darstellung auf geringe Höhe erweitert; Wiederholung grün.
- Native: 900/900 Fälle bestanden (`/private/tmp/secure-native-full-final/summary.json`). Großer iPad-Pro-13-Lauf: 360/360 + 12/12 bestanden (`/private/tmp/secure-web-large-final/summary.json`). Nach dem Review zusätzliche tatsächliche Lifecycle-Tests: 3/3 (`/private/tmp/secure-dialog-dismiss-green.log`) und korrigierte Navigationsabläufe: 12/12 (`/private/tmp/secure-interactions-final2.log`) bestanden. Die komplette Matrix wird im CI nochmals am endgültigen Quellcommit geprüft.
- Sichtprüfung: normaler/dunkler Einstieg, extrem schmale große Schrift, kompakter Prüfungsrahmen im Querformat, geöffnete Übersicht bei großer Schrift, lange Frage, Medien und Abschluss angesehen. Native Rahmenprüfung und lokale WebKit-Inhalte sind separate Ebenen; ein leerer farbiger Bereich in der reinen Rahmenfixture ist kein ausgelieferter leerer Test.
- Der erste abschließende Smoke fand einen nicht übertragbaren DOM-Testrückgabewert und danach eine asynchrone WebKit-Scrollkorrektur. Beide fehlerhaften Läufe bleiben als fehlgeschlagen dokumentiert; der Rückgabewert und das echte Scrollverhalten wurden korrigiert, gezielte Wiederholung grün.
- Bildschirmtastatur: reduzierte WebView-Inhaltshöhe und Navigation automatisiert geprüft. Echtes Softwaretastaturverhalten im AAC-Modus bleibt Teil des physischen Tests.

## Releasezustände

GitHub: Branch `feature/secure-layout-telemetry-20261016`. Aktueller Auslieferungsquellcommit `663364987a944ddea9dd53595bf50334374ee622`; sein Git-Baum stimmt exakt mit dem lokal geprüften Stand überein. Der gesamte CI-Lauf einschließlich Release-Job ist bestanden. **GradeCrew Secure 0.2.2 (1101) wurde am 16.10.2026 um 02:46 Uhr MESZ fehlerfrei zu Apple/TestFlight hochgeladen.** `UPLOAD SUCCEEDED with no errors`; Delivery-ID `b0a0c962-7f6a-4596-8a9a-0472ea1007ea`. AAC ist sowohl in der signierten App als auch im Distribution-Profil vorhanden. Die tatsächlich gebaute Konfiguration ist `staging-exam`. Apples Verarbeitung und die Sichtbarkeit in TestFlight konnten ohne App-Store-Connect-Anmeldung noch nicht bestätigt werden. Maschinenlesbarer Nachweis: [release.json](release.json). Kein neuer Geräteerfolg vorab behauptet.

Staging-Statistik: drei getrennte Funktionen `recordSecureExamTelemetry`, `secureTelemetrySubmission`, `cleanupSecureTelemetry` sind bereitgestellt und ACTIVE. Bestehende Prüfungsfunktionen, Hosting und Firestore-Regeln wurden nicht bereitgestellt/geändert. Der öffentliche Clientaufruf ist derzeit mit HTTP 403 gesperrt. Die automatische Freigabeprüfung lehnte die Ergänzung von `allUsers`/`roles/run.invoker` am neuen Statistik-Callable ab; eine ausdrückliche Nutzerfrage ist offen. Es wurde keine Umgehung vorgenommen. Statistikcode und geschützter iPad-Ausgangspuffer sind vorbereitet, aber die vollständige Zustellung wird noch nicht als funktionsfähig behauptet. Der tatsächliche Scheduler-Löschlauf ist ebenfalls noch nicht nachgewiesen.

## Physischer Gerätetest

Der Nutzer bestätigte für den vorherigen Build frühe Abgabe und Zeitablauf einschließlich AAC-Sperre/Freigabe. Das ist kein neuer Gerätetest dieser Oberfläche. Nach Apples Verarbeitung: installierte Version/Build, iPad-Modell und iPadOS notieren; frühe Abgabe mit offenen Fragen, Zeitende bei offener Übersicht/Abgabedialog, Medien und Wiederaufnahme prüfen. Für diesen neuen Build noch offen.

## Bekannte Grenzen

iPadOS 17+, keine allgemeine Zusage für alle Modelle der letzten zehn Jahre. Alte Hardwareleistung und ältere Systemruntime noch nicht qualifiziert. Lange Offline-Abgabe über die serverseitige 30-Sekunden-Nachfrist hinaus und betreute Lehrer-Notfreigabe sind weiterhin separate Aufgaben. Statistik enthält pseudonyme Teilnahmen, keine verlässlich unterschiedlichen natürlichen Personen. Keine Production-Bereitstellung und keine PostHog-Übertragung.


## Cloud-Prüfung und Korrekturen

Die vollständigen Cloudrunden 8 und 9 bestanden jeweils die 900 nativen Fälle und drei Lifecycle-Tests. Die Web-Prüfungen scheiterten an seltenen Renderer-Starts; Runde 8 enthielt außerdem einen noch laufenden weiten Scrollvorgang. Die Uploads wurden korrekt übersprungen. Nummernsprünge sind jetzt sofortig. Der Testbrowser behält pro Testmethode eine flüchtige WebView mit Fenster und lädt für jeden Fall ein eindeutig gekennzeichnetes Dokument. Nur dessen eigene Bereitschaftsmeldung zählt; eine Wiederladeprüfung verlangt einen neuen Dokumentstart. Kein Fall entfällt.

Der abschließende lokale Lauf mit diesem Aufbau bestand 360/360 Layoutfälle und 12/12 Bedienabläufe (`/private/tmp/secure-persistent-full-final/summary.json`); die drei Lifecycle-Tests und 19 Python-Tests bestanden ebenfalls. Zusätzliche, minutenlange Systemdiagnosesammlungen sind abgeschaltet, die eigentlichen Prüfungen, Fehler, Berichte und Screenshots bleiben erhalten.

Endgültiger Cloudlauf: [Runde 10](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38828726981), Quellcommit `663364987a944ddea9dd53595bf50334374ee622`. Der lokale Git-Baum `51ee64c5ea644170fde918e9efb100303e4b4fc1` stimmt exakt mit dem GitHub-Baum überein. Alle Cloud-Layoutjobs bestanden: 900 native Fälle sowie je 360 Layoutfälle und zwölf Bedienabläufe auf kleinem und großem iPad. Der Release-Job für 0.2.2 (1101) bestand zusätzlich alle bisherigen Kernprüfungen, drei Simulator-Builds und den abschließenden Smoke mit 40 nativen Fällen, 16 Webfällen und zwölf Bedienabläufen. Archivierung, Distribution-Signierung, AAC-/Profilkontrolle und Upload sind erfolgreich.

## Kurzer iPad-Abnahmelauf

1. Neue Version und Buildnummer, iPad-Modell und iPadOS notieren. Dieser Build spricht nur Staging an.
2. Einen veröffentlichten Staging-Testcode und einen fiktiven Namen eingeben. Sperre muss vor den Aufgaben beginnen.
3. Nummern oben und Übersicht öffnen; zwischen Anfang, Mitte und Ende springen. Eine Aufgabe beantworten und wieder leeren: der Bearbeitungsstatus muss zurückgehen. Grün heißt ausgefüllt, nicht richtig.
4. Hoch-/Querformat und größere Schrift ansehen. Frage, Antworten und Timer müssen erreichbar bleiben. Hörfrage mit den vorgesehenen Kopfhörern und Bildfrage testen.
5. Mit offenen Aufgaben früh abgeben. Der Hinweis auf offene Aufgaben muss passen; erst bestätigte Abgabe und Apple-Freigabe erlauben den Abschluss.
6. Einen kurzen Test auslaufen lassen, auch bei offener Übersicht oder offenem Abgabedialog. Genau eine Abgabe, anschließend Freigabe prüfen.
7. Einen zweiten Versuch starten: keine Antworten des ersten Versuchs dürfen übernommen werden.

Eine absichtlich lange WLAN-Unterbrechung ist noch kein unterstützter Offline-Abnahmetest. Die bekannte Servernachfrist beträgt 30 Sekunden; solche Versuche nur mit Testdaten und betreut durchführen.

Production-Nachweis: keine eigene Production-Bereitstellung; `main` vor und nach der Auslieferung unverändert auf `8560992c072779814017ebac6e86b65e938bc951`. App und Statistikcode liegen ausschließlich im isolierten Feature-Branch beziehungsweise im benannten Staging-Projekt.
