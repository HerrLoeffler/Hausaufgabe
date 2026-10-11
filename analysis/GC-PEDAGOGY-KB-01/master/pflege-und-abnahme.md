# Pflege- und Abnahmeverfahren für die Lehrplanbasis

**Stand:** 11.10.2026 · **Auftrag:** `GC-PEDAGOGY-KB-01` · **Gilt für:** die amtlichen Lehrpläne, Bildungsstandards, Aufgabenbeispiele und Abschlussprüfungen der vier Zielbereiche. Lehrwerke und sonstige Medien folgen in einer späteren Phase.

## Verantwortliche Rollen

| Rolle | Aufgabe | Nachweis |
|---|---|---|
| Quellenpflege | Amtliche Portale, Versionsstand, Geltung und Zugänglichkeit prüfen; neue Dokumentfassung anlegen. | `dokumente.tsv`, `zuordnungen.tsv`, Quellenlink und Datum. |
| Fachauswertung | Verbindliche Anforderungen mit Fundstellen in eigenen Worten erfassen und Fachpaket abgleichen. | `kompetenzen.tsv`, Fachbericht, Erstprüfung im `prueflog.tsv`. |
| Zweitsichtung | Quelle und Geltung unabhängig vom ersten Auswertungstext gegenlesen; Unklarheiten zur Korrektur zurückgeben. | Positiver oder negativer Eintrag im `prueflog.tsv`. |
| Abschlusskontrolle | Für jede Land-/Weg-/Fach-/Stufen-Einheit die Pflichtdokumente, Auswertung, Zweitsichtung und Aufgaben-/Prüfungsbezüge prüfen. | Datierter Fortschrittsindex und Lückenliste. |

Eine Rolle ist eine Aufgabe, noch keine personelle Zusage. Bis Personen festgelegt sind, wird der tatsächliche Bearbeiter im Prüflog genannt. Niemand prüft seine eigene Erstauswertung als unabhängige Zweitsichtung.

## Prüfrhythmus und Auslöser

1. **Vor jedem neuen Schuljahr:** für alle 16 Länder die amtlichen Fach- und Geltungsübersichten erneut abrufen; aufwachsende Einführung, auslaufende Fassungen und Prüfungsjahrgänge neu zuordnen.
2. **Nach amtlicher Veröffentlichung oder Änderung:** betroffene Dokumentfassung mit neuer ID eintragen, ältere Fassung historisch erhalten und betroffene Zuordnungen auf `version_unklar` setzen; Kompetenz- und Aufgabenprofilzeilen im Prüflog als erneut zu prüfen markieren, bis der Vergleich abgeschlossen ist.
3. **Nach jedem abgeschlossenen Fachpaket:** Quellen- und Geltungszeilen, Fachbericht, Prüflog, Prüfungsbezug, Fortschrittsindex und Übergabe gemeinsam aktualisieren und als nachvollziehbaren Commit sichern.
4. **Bei kaputtem Link, HTTP 403 oder Portalpflicht:** keine Volltextsichtung behaupten. Zugriff, letzte erfolgreiche Quelle und alternativen amtlichen Weg dokumentieren; weitere unabhängige Fachpakete bearbeiten.

Eine technische Erinnerung oder automatische Portalüberwachung ist noch nicht eingerichtet. Der Rhythmus ist eine verbindliche Arbeitsregel für die später benannte Pflegeverantwortung.

## Versionswechsel

- Alte und neue Fassungen behalten getrennte `dokument_id`. Ein URL-Wechsel ohne Inhaltsänderung wird als Linkkorrektur mit Prüfdatum behandelt; eine inhaltliche Änderung erzeugt eine neue Dokumentzeile.
- Der fachliche Vergleich hält mindestens betroffene Jahrgänge/Kohorten, Kompetenzbereiche, Abschlussprüfungen und Zeitpunkt des Inkrafttretens fest.
- Historische Prüfungsaufgaben werden mit der für ihren Prüfungsjahrgang geltenden Fassung verbunden, nicht nachträglich dem neuesten Plan zugeschrieben.
- Registerzeilen werden nicht gelöscht, um die Herleitung früherer Aussagen und Prüfungen nachvollziehen zu können.

## Abschlussprüfung

Eine Einheit `Land × amtlicher Schulweg × Fach × Stufen-/Kohortenbereich` ist nur abgeschlossen, wenn alle verbindlichen Pläne samt allgemeinem Teil inventarisiert, amtliche Geltung und Volltext geprüft, Kompetenzen mit Fundstellen ausgewertet und ein positiver, tatsächlich unabhängiger Zweitprüfeintrag vorhanden sind. Amtliche Aufgaben-/Prüfungsbeispiele werden gesondert nach Verfügbarkeit bilanziert. Bei nichtöffentlicher Prüfung oder unzugänglichem Plan bleibt der konkrete Zugriff als Lücke sichtbar.

Der Gesamtabschluss erfordert außerdem einen erneuten Abgleich der Fächerliste mit jedem Landesportal und der KMK-Übersicht. Der Abschlussbericht nennt den ermittelten Nenner, die geprüften Einheiten, nicht anwendbare Einheiten und jeden offenen Zugang. Solange ein verbindlicher Plan blockiert ist, lautet der Gesamtstatus `nicht_vollstaendig`.
