# Registerschema für die Lehrplan-Vollauswertung

**Arbeitskennung:** `GC-PEDAGOGY-KB-01` · **Stand:** 11.10.2026. Dieses Register enthält amtliche Lehrplanquellen und deren Auswertung. Medien und Lehrwerke gehören nicht hinein.

## Tabellen und Schlüssel

Alle Dateien sind UTF-8-TSV mit Kopfzeile. Ein Feld enthält weder Tabulator noch Zeilenumbruch. Unbekannte Angaben stehen ausdrücklich als `unbekannt`; `nicht_anwendbar` erfordert einen amtlichen Beleg. IDs bleiben stabil, auch wenn eine URL später umzieht.

| Tabelle | Ein Datensatz bedeutet | Schlüssel/Verweise |
|---|---|---|
| `schulwege.tsv` | Ein amtlicher Schulweg oder Bildungsgang in einem Land, mit Vergleich zu einem der vier Zielbereiche. | `weg_id`; Quelle und Prüfdatum belegen die Zuordnung. |
| `dokumente.tsv` | Eine konkrete amtliche Dokumentfassung; ein Portalindex ist kein Fachplan. | `dokument_id`; alte Fassungen behalten eigene IDs. |
| `zuordnungen.tsv` | Ein Dokument gilt für einen konkreten Schulweg, ein Fach und einen Stufen-/Kohortenbereich. | `zuordnung_id`, `dokument_id`, `weg_id`. Ein Dokument kann mehrere Zeilen haben. |
| `kompetenzen.tsv` | Eine eigenständig nachprüfbare, paraphrasierte Anforderung des Lehrplans. | `kompetenz_id`, `zuordnung_id`, Fundstelle und Status. |
| `aufgabenprofile.tsv` | Ein aus amtlicher Quelle belegtes oder ausdrücklich abgeleitetes Aufgabenprofil. | `profil_id`, `kompetenz_id`, Dokument/Quelle, Fundstelle, Evidenztyp. |
| `pruefungen.tsv` | Eine amtliche Prüfungsanforderung oder veröffentlichte Abschlussprüfung für einen konkreten Abschluss, ein Fach und ein Prüfungsjahr. | `pruefung_plan_id`, `weg_id`, `kompetenz_id` oder `unbekannt`, offizielle Quelle und Fundstelle. |
| `prueflog.tsv` | Eine dokumentierte erste oder zweite Prüfung samt Befund. | `pruefung_id`, Referenztyp/-ID, Datum und Ergebnis. |

## Pflichtlogik

1. Zuerst `schulwege.tsv` und `dokumente.tsv`, dann `zuordnungen.tsv`. Eine Fachauswertung ohne konkrete Geltungszeile zählt nicht als abgeschlossen.
2. `dokumentart` unterscheidet mindestens `fachplan`, `allgemeiner_teil`, `rahmenplan`, `bildungsstandard`, `verordnung`, `handreichung`, `beispielaufgabe`, `portalindex` und `entwurf`. Nur verbindliche, für den Zielweg geltende Quellen zählen zum Abschlussnenner; weitere Quellen bleiben sichtbar.
3. `quelle_status` und `auswertungs_status` sind getrennt: Ein abrufbarer Link belegt keine Lektüre. Zulässige Auswertungswerte: `entdeckt`, `metadaten_geprueft`, `inhalt_teilweise`, `inhalt_ausgewertet`, `zweitgeprueft`, `zugriff_blockiert`, `version_unklar`, `nicht_anwendbar`.
4. Eine blockierte Quelle erhält `zugriff_blockiert` plus technischen oder rechtlichen Grund und eine nächste Handlung. Ein Entwurf ersetzt keine geltende Fassung. Bei aufwachsender Einführung steht die betroffene Kohorte in `zuordnungen.tsv`.
5. `inhalt_ausgewertet` setzt eine tatsächlich geprüfte Originalquelle voraus. Bei amtlich indexierten Volltextabschnitten ohne PDF-Download wird die Methode im Fachbericht genannt. `zweitgeprueft` setzt einen positiven Eintrag in `prueflog.tsv` voraus.
6. In `kompetenzen.tsv` werden Anforderungen in eigenen Worten und mit kurzer Fundstelle erfasst. Komplette Lehrplanseiten, Beispielaufgaben oder Lösungen werden nicht kopiert.
7. `aufgabenprofile.tsv` unterscheidet `amtliches_beispiel` von `aus_lehrplan_abgeleitet`. Das ist keine Analyse von Bildungslogin oder anderen Medien.
8. `pruefungen.tsv` trennt verbindliche Prüfungsregelung, veröffentlichte Originalprüfung und Musteraufgabe. Ein Prüfungsjahr wird mit der für seine Kohorte geltenden Lehrplanfassung verbunden. Nichtöffentliches oder nicht erreichbares Material bleibt als Zugangslücke sichtbar; Prüfungen decken nie automatisch den gesamten Lehrplan ab.
9. Der Fortschrittsindex ist ein datierter Bericht aus diesen Tabellen. Summen werden nicht unabhängig gepflegt. Für alle 16 Länder wird vor einer Abschlussbehauptung der aktuelle amtliche Fachbestand neu abgeglichen.

## Prüfeinheit

Die kleinste Abschlussprüfung ist **Land × amtlicher Schulweg × Fach/Lernbereich × Stufen- oder Kohortenbereich**. Mehrere Dokumente können dieselbe Einheit regeln (z. B. allgemeiner Teil plus Fachplan). Eine Einheit ist nur abgeschlossen, wenn alle für sie verbindlichen Quellen und ihre Kompetenzanker `zweitgeprueft` sind. Für einen nicht existierenden eigenständigen Weg ist `nicht_anwendbar` erst nach amtlicher Bestätigung zulässig; ein integrierter Abschlussweg wird als eigener `weg_id` abgebildet.

## Bereits vorliegender Arbeitsstand

Die bisherigen Länderberichte unter `../states/` und das Fachpaket `../subjects/mathematik-grundschule.md` sind Recherchebelege. Ihre Daten werden schrittweise in das Register übertragen und dabei gegen die aktuellen amtlichen Quellen geprüft. Eine leere oder unvollständige TSV-Datei ist kein Hinweis auf fehlende Landeslehrpläne, sondern ein noch offener Übertragungsstand.
