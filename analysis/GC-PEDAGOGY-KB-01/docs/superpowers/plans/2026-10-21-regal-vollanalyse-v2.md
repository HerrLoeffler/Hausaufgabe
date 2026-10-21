# GC-PEDAGOGY-KB-01 — Wiederanlauf für die vollständige Medienanalyse

Stand: 21.10.2026. Owner: **GC · Pädagogisches Material**, Chat `01a1282d-7f9d-7ee3-b7a8-d0c0da8967c2`. Bestehender Dokumentationsbranch `docs/pedagogy-media-20261011`, PR214; Lehrplanarbeit PR208 getrennt erhalten. Dieser Plan ersetzt die Reihenfolge des früheren Plans, nicht dessen gesicherte Ergebnisse oder Versuchshistorie.

**Ziel:** Alle Dateien des beauftragten Downloadbestands einschließlich ZIPs und entpackter Ordner sowie sämtliche zugänglichen Hauptbuchseiten und Zusatzmaterialien der 125 zuletzt gezählten Regalmedien privat sichern, vollständig fachlich erschließen, dem Jahrgang und Bildungsgang begründet zuordnen und geprüfte eigene Erkenntnisse in Konzept und Aufgabenpool überführen. Vollständige Originalbilder, Diagramme und Audio bleiben erhalten.

**Status dieses Dokuments:** Ausführbarer Arbeitsplan mit vorbereiteten Auftragsvorlagen; die neue Warteschlangensteuerung und sichere parallele PDF-Dateizuordnung sind noch zu implementieren. Eine Datei mit 125 Aufträgen startet keine 125 Agenten. Kein neuer Sammlungsdurchlauf allein durch Erstellung dieses Plans.

## 1. Was tatsächlich vorliegt und was schiefging

| Neue Originaldatei, anonym | PDF-Seiten |
|---|---:|
| R001: Lehrerkommentar | 284 |
| R001: Diagnosematerial | 22 |
| R001: Arbeitsheft mit Lösungen | 168 |
| R001: Kopiervorlagen | 106 |
| R001: Lautkarten | 40 |
| R001: Stoffverteilung PDF | 51 |
| R002: Lehrermaterial | 369 |
| R001: bearbeitbare Stoffverteilung | keine PDF |
| R001: Bilddatei | keine PDF |

**Ergebnis: neun Dateien, davon sieben PDFs mit 1.040 Seiten. R001 enthält 671 dieser PDF-Seiten, R002 369. Null von 125 Büchern vollständig abgeschlossen.** Alle neun SHA-256 und die sieben tatsächlichen PDF-Seitenzahlen wurden im Wiederanlauf erneut geprüft. Die 470 bereits textlich und visuell gelesenen PDF-Seiten bestehen aus 164 früher vorhandenen Kommentarseiten, 284 neuen Kommentarseiten und 22 Diagnoseseiten; dokumentübergreifende Inhalte können sich überschneiden. 1.169 Aufgaben-/Methoden-/Verweisgruppen sind Kandidaten, keine 1.169 gelösten Testaufgaben. 24 didaktische Regeln sind Vorschläge; null neue Laufzeitprofile freigegeben.

Die bisherige Arbeit ging vor der flächigen Sammlung zu tief in einzelne Kommentare. Danach wurde der Durchlauf beendet, obwohl der Gesamtauftrag offen war. Für einen Stopp genau nach neun Dateien ist kein technischer Zwang dokumentiert. Große Seitenzahlen wurden als Fortschritt zu prominent dargestellt; maßgeblich bleibt der Abschluss jedes Buchs.

Konkreter technischer Mangel: `scripts/ingest_latest_reader_download.py:7–8` wählt die zuletzt geänderte Datei im Downloadverzeichnis und prüft nur ihre Aktualität. Das bindet eine Datei nicht eindeutig an die auslösende Readeraktion. Mehrere Sammler oder gleichzeitige Downloads des Nutzers könnten dadurch falsch zuordnen. Diesen Import nicht parallel einsetzen.

## 2. Zuständigkeiten und tatsächliche Parallelität

In dieser Sitzung sind vier aktive Agentenplätze einschließlich Root verfügbar: **höchstens drei Unteragenten gleichzeitig**. Das ist die konkrete Sitzungsgrenze, keine allgemeine Obergrenze für alle Codex-Produkte. 125 oder 500 gleichzeitig laufende Agenten können hier nicht wahrheitsgemäß zugesagt werden.

| Rolle | Konkreter Auftrag | Schreibbereich |
|---|---|---|
| Dieser Fachchat / Root | Quellenidentität, Arbeitsverteilung, Abnahme, Widersprüche, Fortschrittsbericht | Mediensteuerung und PR214 |
| Luna/medium, bis zu drei Worker | jeweils geleastes Buch oder genau abgegrenztes Seitenpaket | eigenes Ergebnis, keine gemeinsamen Register |
| GC · Pädagogisches Konzept | amtliche Jahrgangs-/Bildungsgangzuordnung und didaktische Übernahme; vorhandene PR208-Arbeit wiederverwenden | eigener Konzeptbeitrag, später abgestimmte Übernahme |
| GradeCrew Zentrale | vorhandene weitere Owner und überschneidungsfreie Kapazität koordinieren | Koordination; keine Downloads oder Implementierung |

Die beiden bestehenden Chats wurden am 21.10.2026 tatsächlich angeschrieben. Der Konzeptchat betreut nach vorhandener Übergabe auch die bisherige Lehrplanarbeit; ein weiterer unabhängiger Lehrplanchat ist noch nicht bestätigt. Keine zusätzliche Zuständigkeit erfinden. Weitere Chats erhalten nur klar getrennte Pakete, wenn Owner, Zugriff und Kapazität feststehen. Keine rekursive unbeschränkte Agentenkette.

**Eingegangene Ergebnisse:** Der Konzeptchat hat den [gemeinsamen Vertrag und alle24 Einzelbewertungen](../../../master/material-zuordnung-konzeptbeitrag-2026-10-21.md) fertiggestellt:13P0-,10P1-,1P2-Regel. Das ist eine geprüfte Übernahmeempfehlung, noch keine Änderung der zentralen Konzeptdatei oder Laufzeitfreigabe. Die Zentrale hat keinen weiteren dedizierten Lehrplan-Fachchat gefunden. Der bestehende Spezialchat für erweiterte Aufgabenformate ist anderweitig aktiv und erhält keinen zusätzlichen Downloadauftrag. Die zwei lokalen Luna-Evidenzprüfungen und ein anschließender Luna-Planreview sind beendet; keine Buchsammler laufen allein aufgrund dieser Prüfaufträge.

Routine startet gemäß Projektregel mit `gpt-6-luna`/`medium`; `low` erst nach belegtem Erfolg bei vergleichbaren Paketen. Schwierige fachliche Konflikte werden gezielt an Sol übergeben. Angefordertes Modell, beobachtetes Modell oder `unknown`, Laufzeit, Nacharbeit und vorhandene Usage pro Paket protokollieren. Kein Sparversprechen ohne gemessene Kosten.

## 3. Dauerhafte Ablage und Beweisführung

Alle folgenden Pfade liegen unter `analysis/GC-PEDAGOGY-KB-01/`.

| Ebene | Ablage / Zweck | Stand |
|---|---|---|
| Unveränderte Originale | `private-archive/reader-acquired-20261021/<sha256>.<ext>` und bisherige Archivverzeichnisse | vorhanden; weiterverwenden |
| Bestehendes lokales Material | `private-archive/download-2/`, bestehende Download-/Seitenregister | vorhanden; Umfang frisch abgleichen |
| Auftragsvorlagen | `media/reader-auftraege-v2-20261021.jsonl` | in diesem Wiederanlauf vorbereitet; nicht dispatcht |
| Steuerung | `private-archive/reader-control-v2.sqlite3` | geplant, noch nicht vorhanden |
| Private Herkunft | technische Readeridentität, UI-Fundstelle, genaue Downloadzuordnung und Originalpfad in privater Steuerung | vorhandene Herkunftsdaten übernehmen |
| Arbeitskopien | PDF-Text plus vollständige Seitenbilder, Office-Renderings, entpackte Inhalte, normalisierte Audios und Zeittranskripte | teilweise vorhanden |
| Fachwissen | eigene Seiten-, Einzelaufgaben-, Bild-, Lösungs-, Audio- und Didaktikrecords | bestehende Records erhalten; Rest offen |
| Sichtbarer Fortschritt | CSV/Markdown-Export mit genau einer Zeile pro Buch und getrennten Abschlussstufen | V2-Export geplant |
| Produktpool | geprüfte eigene Profile, private Herkunftsverknüpfung getrennt | bestehender Starterbestand; kein neuer Import |

Vollständige SHA-256 sind die Inhaltsidentität, Kurz-IDs nur lesbare Verweise. Gleiche Dateien einmal speichern, aber alle Buch-/Ressourcenbezüge erhalten. Gleicher Dateiname beweist keine Dublette. Eine Regalposition identifiziert kein Buch dauerhaft: R001–R125 sind Arbeitslabels; die aktuelle Quelle muss privat gegen eine stabile Readeridentität bestätigt werden. Keine Titel, Autoren, Verlage, ISBN, Lizenzcodes, Cover oder Originaldateinamen in Wissensregistern. Originalinhalt bleibt privat erhalten. Keine Zugangstokens speichern.

Das lokale Archiv ist nach Löschen der Downloads weiterhin nutzbar. Es liegt derzeit auf demselben Rechner und ist damit noch keine unabhängige Sicherung gegen Geräteverlust. Ein Archiv auf dem Mac ist außerdem noch keine Datenquelle für die veröffentlichte Web-App.

## 4. Verbindliche Metadaten für Buch und einzelne Ressource

Jedes Objekt erhält separat:

```text
subject / subject_status
source_grade_range / grade_assignment_status
source_school_type / education_track / school_type_status
region / region_status
evidence_refs[] / estimate_reason
transfer_grade_range / transfer_reason / transfer_review_status
curriculum_refs[]: official_url, document_version, retrieved_at,
                  competence_or_section, mapping_status, reviewer
```

Für die Quellenzuordnung sind `source_confirmed`, `estimated_from_content` und `unresolved` zulässig. Jeder geschätzte Jahrgangsbereich braucht eine inhaltliche Begründung, zum Beispiel vorausgesetzte Operationen, Leseumfang, Operatoren oder Zahlenraum. Eine Klassenangabe im privaten Original darf als Beleg ausgewertet werden, ohne den Buchtitel zu übernehmen. Ein Zusatzmaterial darf abweichende Förderjahrgänge haben; Buchwerte nur als explizit vererbte, noch zu prüfende Zuordnung übernehmen.

**Quellzielgruppe, pädagogisch möglicher Transfer und amtliche Lehrplanbestätigung sind drei verschiedene Aussagen.** Ein Grundschulmaterial wird durch Eignung für Förderung in Klasse5 nicht zu einem Lehrwerk der Mittelschule5. Keine pauschalen Vorgaben Bayern/Mittelschule. Unbekannte Länder-/Schulartangaben nicht erfinden; bundesweite Übertragbarkeit muss begründet werden. Länder führen teilweise gemeinsame Bildungsgänge; diese neben dem vereinfachten Filter Grundschule, Haupt-/Mittelschulbildungsgang, Realschulbildungsgang, Gymnasium erhalten.

Der Konzept-/Lehrplanowner bestätigt passende amtliche Kompetenzen mit Version und Fundstelle. Eine grobe Länderübersicht ist keine vollständige Auswertung aller Fachlehrpläne. Geschätzte Quelljahrgänge dürfen transparent recherchierbar bleiben; für eine automatische freigegebene Profilzuordnung sind eine bestätigte Zielzuordnung und die fachliche Prüfung nötig.

Die obige Feldliste ist die kompakte Arbeitsansicht. Für die Umsetzung gilt der detaillierte gemeinsame Vertrag: mehrere Fach-/Jahrgangs-/Länderbehauptungen je Objekt sind zulässig und brauchen jeweils Status, Reichweite und Beleg. Originaler Schulweg, Quellenland und Zielland separat erhalten; keine Ressource erbt eine bestätigte Zuordnung ohne eigenen passenden Beleg. Bestehende `grades`-/`schoolType`-/`region`-Felder sind bis zur Migration gemeldeter Quellkontext, keine automatische Freigabe. Die konkreten neuen amtlichen Fachplanzuordnungen sind im Beitrag als offen dokumentiert; unzugängliche Fachpläne nicht durch Suchtreffer als bestätigt ersetzen.

## 5. Arbeitspaket A — Bestandsabgleich und sichere Steuerung

**Owner:** Root; Routineprüfungen Luna. **Eingang:** bestehende Register, Archive, letzte Readerzustände. **Ausgang:** wiederaufnehmbare Buch-/Datei-/Ressourcenjobs mit echter Herkunft.

- [ ] Downloads und beauftragte entpackte Ordner erneut read-only inventarisieren. Frühere 839 PDFs/7.209 Seiten sind ein historischer struktureller Scan, keine heutige Vollanalyse. Geänderte Dateibestände per Hash abgleichen, nicht Datumsfilter allein verwenden.
- [ ] Teil-Downloads, Abbrüche, vorhandene ZIP-Inhalte und alte Archivkopien gegen konkrete früher angeforderte Ressourcen prüfen. Fehlende Endungen beweisen keine abgeschlossene Sammlung.
- [ ] 125 Vorlagen idempotent in die künftige Steuerung übernehmen, private Readeridentität bei tatsächlichem Öffnen bestätigen. Bei veränderter Regalzahl Differenzliste und explizite Bestandsversion führen.
- [ ] `scripts/reader_queue.py` implementieren: atomare Buch-/Ressourcen-Leases mit Worker, Versuchszähler, Beginn, Ablauf, Heartbeat, Ergebnis und nächstem Schritt. Transaktionen und eindeutige Constraints verhindern Doppelclaim. Ein abgelaufener Lease beweist keinen gescheiterten externen Download.
- [ ] `scripts/reader_ingest.py` implementieren: **expliziter verifizierter Dateipfad**, Herkunftsaktion, Abschluss-/Stabilitätsprüfung, Dateityp, Hash, unveränderte Archivkopie und atomare Referenzbuchung. Kein automatisches „latest file“.
- [ ] `scripts/reader_integrity.py` und `scripts/reader_report.py` für vollständige Mengenabgleiche und Exporte implementieren. Noch nicht vorhandene Programme nicht als bereits lauffähig berichten.

**Abnahme:** zwei Worker können dasselbe Buch nicht gleichzeitig claimen; gleiche Dateinamen werden korrekt verschiedenen Ressourcen zugeordnet; identischer Hash aus zwei Büchern erhält zwei Bezüge; Abbruch zwischen Download und Buchung führt zuerst zum Abgleich statt blindem Neuabruf. Bestehende Daten und Versuchszähler bleiben erhalten.

## 6. Arbeitspaket B — Downloadpilot, dann vollständiger Sammlungsdurchlauf

**Owner:** Luna-Sammler, Root nimmt Pilot ab. **Pilot:** drei tatsächlich identifizierte Bücher aus unterschiedlichen Readerfamilien. Frühere Positionen wie R100 nur nach erneuter Quellenbestätigung verwenden.

1. Pro Buch eigener Browser-Tab und Lease. Reader öffnen, Inhaltsverzeichnis, Hauptbuchumfang, Materialmodus, globale Filter und alle Rubriken lesen. Die erste Seite dient als schneller Einstieg; sie beweist keine globale Vollständigkeit.
2. Regulär angebotene Gesamtdateien zuerst: Kommentar, Arbeitsheft mit Lösungen, Kopiervorlagen, Förder-/Fordermaterial, Diagnose, Unterrichtsplanung, Medien-/Audiopakete. Jede Aktion an eine eindeutige Ressource binden.
3. Genaue Downloadzuordnung über unterstütztes Herkunftstab-Ereignis mit tatsächlichem Pfad oder angebotene direkte Speicherfunktion nachweisen. Das frühere `waitForEvent` an `about:blank` wurde durch ein Herkunftssicherheitsgate abgelehnt; diese Grenze respektieren. Keine versteckten Netzwerk-/Cookiezugriffe oder Schutzumgehungen.
4. **Parallelfreigabe nur, wenn exakte Pfadzuordnung auch bei gleichzeitig ausgelösten gleichnamigen Downloads funktioniert.** Ist das im Pilot nicht möglich: ein Luna-Browsersammler, zwei Luna-Worker für lokale Eingangsprüfung/Normalisierung. Auch seriell muss ein unterstützter sichtbarer UI-/Downloadbeleg die ausgelöste Ressource eindeutig mit dem tatsächlichen finalen Pfad verbinden. Vorher-/Nachher-Dateidifferenz, Name und Zeit sind nur Hilfsbelege und reichen allein nicht. Fehlt diese Verbindung: `awaiting_file_match`, keine Herkunfts-/Vollständigkeitsbuchung; unzugeordnete Dateien dürfen privat in Quarantäne erhalten bleiben. Andere eindeutig prüfbare Quellen weiterbearbeiten.
5. Gesamtdateien inhaltlich gegen ihre angekündigte Ressourcengruppe prüfen. „Gesamt“ auf einem Kommentar bedeutet nicht das gesamte Hauptbuch oder alle Audios. Einzeldownloads erst überspringen, wenn enthaltene Ressource und Seiten-/Clipbereich nachgewiesen sind.
6. Alle Materiallisten bis zum echten Ende durchlaufen, einschließlich Pagination, virtueller Listen und abweichender Filter. Sichtbare Zähler sind Sollhinweise. Tatsächlich geprüfte Einträge mit stabiler privater Ressourcenidentität abgleichen.
7. Hauptbuch separat vollständig sichern: angebotener Gesamt-/Kapitelexport bevorzugt. Sonst vollständige reguläre Seitenansicht mit zulässiger Aufnahme und Seitenbeleg; als Aufnahme, nicht als heruntergeladenes Original kennzeichnen. Unlesbare Miniaturen oder Graustufenbilder in Kommentaren ersetzen farbige Hauptbuchseiten nicht.
8. Audio, Video, HTML und interaktive Inhalte separat inventarisieren und regulär zugängliche Dateien sichern. Nicht exportierbare Inhalte mit konkreter Zugriffslücke offen führen. Keine technische Sperre als „nicht relevant“ umdeuten.
9. Eingangsprüfung pro Buch abschließen, fehlende Ressourcen konkret benennen, dann **sofort nächstes Buch claimen**. Tiefeninterpretation einzelner Kommentare blockiert diesen Durchlauf nicht.

**Meilenstein B:** Alle aktuell125 Bücher haben eine geprüfte Ressourcenübersicht und für jede Ressource entweder eine belegte Archivierung, nachgewiesene Abdeckung durch ein Bundle oder einen konkreten offenen Blocker. Sammlung mit Blockern bleibt unvollständig. Nach ersten zehn Büchern tatsächliche Zeit je Readerfamilie messen; daraus die restliche Sammlungszeit schätzen.

## 7. Arbeitspaket C — Originalerhalt und Normalisierung

**Owner:** lokale Verarbeitung und Luna-Eingangsprüfung. Parallel zur Sammlung möglich; kein Verdrängen der Sammler durch inhaltliche Tiefenarbeit.

- [ ] ZIPs einschließlich verschachtelter Archive sicher entpacken: Pfadtraversal und Links außerhalb des Zielordners ablehnen; Größen-/Dateizahllimits, verschlüsselte und defekte Inhalte protokollieren. Parent-/Child-Hashzuordnung sichern. Bereits entpackte Ordner gegen vorhandene Dateien deduplizieren.
- [ ] PDF-Seitenzahl und Lesbarkeit prüfen, alle Seiten rendern, Text pro Seite extrahieren. OCR ist Zusatz; Original und Seitenbild erhalten. Textleere Seiten ebenfalls visuell prüfen.
- [ ] Office-/Präsentationsdateien im Original behalten, vollständig rendern und eingebettete Medien erfassen. Makros nicht ausführen.
- [ ] Audios im Original behalten; Arbeitskopie mit dokumentierter Kanal-/Samplerate. Vorhandene lokale faster-whisper-Pipeline wiederverwenden, Hash vor erneuter Transkription prüfen. Ganze Audiodauer mit zeitbezogenen Segmenten abdecken.
- [ ] Herkunft, vollständiger Hash, Seiten-/Folien-/Clipnummern und Bild-/Audioarbeitskopien maschinell auf Auflösbarkeit prüfen. Defekte Dateien nicht als analysierbar zählen.

**Abnahme:** Für jede erwartete Seite ist eine lesbare visuelle Referenz vorhanden oder eine benannte Lücke offen. Originale bleiben unabhängig vom Downloads-Ordner abrufbar.

## 8. Arbeitspaket D — Jede Seite, Einzelaufgabe, Grafik und Lösung

Nach dem flächigen Sammlungsdurchlauf arbeiten die drei Luna-Worker in anfänglich **20-Seiten-Paketen**, bei hoher Dichte kleiner. Grenzen werden aus tatsächlicher Seiten-/Aufgabendichte und erfolgreicher Pilotqualität angepasst. Jeder Auftrag nennt Quelle, erste/letzte Seite und alle erwarteten Artefakte. Vorhandene 470 Seitenrecords werden übernommen, aber ihre offenen Einzelprüfungen bleiben offen.

Pro Seite:

- [ ] Vollständigen Text und lesbares Seitenbild prüfen; kleine Formeln, Diagramme, Tabellen, Bilddetails und Spalten vergrößern. Ein Kontaktbogen allein erfüllt das nicht.
- [ ] **Jede erkennbare Aufgabe, Teilaufgabe und jeder Arbeitsauftrag, nummeriert oder unnummeriert**, als eigenes fachliches Objekt erfassen; auch Bildimpulse und offene Aktivitäten berücksichtigen. Genaue private Fundstelle/Region, eigene Paraphrase, Voraussetzungen, Lernziel, Kompetenz, Anspruch, Aufgabenform, erwartete Antwort und Abhängigkeiten speichern. Bisherige Gruppenkandidaten gegebenenfalls aufteilen. Verwaltungs-/Dekorseiten mit begründetem Status statt erfundenen Aufgaben erfassen.
- [ ] Bilder/Diagramme fachlich deuten: relevante Objekte, räumliche/mathematische Beziehungen, Achsen, Skala, Einheiten, Legende, ablesbare Werte, visuell notwendige Schlussfolgerung und typische Fehlinterpretation. Originalreferenz und Bounding Box erhalten.
- [ ] Jede prüfbare Aufgabe selbst lösen. Danach separat mit Quellenlösung vergleichen. Rechnung/Herleitung, tolerierte Varianten, Rundung, Maßeinheit, Bewertung und Quellenfehler speichern. Offene Sprachaufgaben erhalten Rubrik und begründete mögliche Antworten.
- [ ] Zweiter Bearbeiter prüft jede zur Freigabe vorgesehene Einzelaufgabe samt Bild und Lösung unabhängig. Vergleich mit kopiertem Lösungsschlüssel ist kein unabhängiger Lösungsbeweis. Rechenwerkzeuge gezielt verwenden; ungelöste Widersprüche an Root/Sol eskalieren.
- [ ] Vollständige Audios zeitbezogen transkribieren und Aufgaben zuordnen. Zahlen, Eigennamen, Negationen, Sprecherwechsel und Arbeitsaufträge mit Ton und PDF gegenprüfen. Ein Transkript ohne Tonprüfung bleibt ASR-Entwurf. Fehlende Ausgabe-/Abhörwerkzeuge als konkrete Prüfgrenze erfassen.
- [ ] Videos/Interaktionen mit Zustand, Bedienfolge, Lernhandlung und Rückmeldung erfassen. Nicht erfüllbare Vollprüfung konkret offen lassen; kein PDF-Status darf diese Medien stellvertretend abschließen.

**Abnahme:** Mengenabgleich über erwartete Seiten und tatsächlich sichtbare Einzelaufgaben, Bild-/Audioabhängigkeiten, unabhängige Lösungsergebnisse und offene Fälle. Stichproben unterstützen die Verfahrenskontrolle, ersetzen die ausdrücklich geforderte Einzelprüfung nicht.

## 9. Arbeitspaket E — Lehrpläne und pädagogisches Konzept

**Owner:** vorhandener Konzept-/Lehrplanchat; hier Herkunft und Konsolidierung. Beauftragter eigener Beitrag: `master/material-zuordnung-konzeptbeitrag-2026-10-21.md`. Keine konkurrierende Änderung gemeinsamer Register oder Handoffs.

Jede didaktische Übernahme enthält Quellseiten, Fach/Jahrgang/Bildungsgang, Lernvoraussetzungen, Kompetenzprogression, Darstellung, Hilfen, Erweiterung, Fehlvorstellungen, Diagnose-/Bewertungsgrenze und konkrete Konsequenz für neue Aufgaben. Materialaussage, eigene Interpretation und beschlossene Produktregel trennen. Widersprüche zwischen Materialien erhalten; keine Lehrwerksmethode ungeprüft universell setzen.

- [ ] Die24 vorhandenen Regeln zuerst als begrenzten Piloteingang gegen das bestehende Konzept prüfen.
- [ ] Quelljahrgang und geschätzte Bereiche nach dem gemeinsamen Vertrag kalibrieren; amtlichen Kompetenzbezug bestätigen oder offen lassen.
- [ ] Pro abgeschlossenem Buch eine konkrete Übernahmeliste beziehungsweise begründete Nichtübernahme erstellen. Beleg der erfolgten Konzeptänderung verlinken; Nachricht oder Vorschlag allein zählt nicht als Übernahme.
- [ ] Grundschule, Haupt-/Mittelschulbildungsgang, Realschulbildungsgang und Gymnasium abdecken; abweichende Länderorganisation erhalten.

**Abnahme:** Jedes Buch/Ressourcenobjekt besitzt eine überprüfbare Zielgruppenzuordnung oder eine konkrete ungelöste Frage; neue Konzeptregeln haben tatsächliche Herkunfts- und Übernahmebelege. Vollständigkeit aller deutschen Fachlehrpläne bleibt ein gesonderter offener Umfang.

## 10. Arbeitspaket F — Verwendbarer Aufgabenpool statt bloßem Dateiarchiv

Der tatsächlich geprüfte Stand von `functions/lib/pedagogical-pool.js` bei App-Quellcommit `424473481a3bcb8818289f79f760772883f0492c` akzeptiert nur `reviewStatus=verified`, `mappingStatus=confirmed` und Modalitäten `text`/`audio`. Er scannt höchstens die ersten2.000 Profile und wählt maximal sechs Profile mit6.000 Zeichen Kontext. Deshalb genügt ein großes angehängtes Rohregister nicht.

- [ ] Vollständigen privaten Einzelaufgabenindex führen; geprüfte eigene Aufgabenmuster und Didaktikprofile passend zum tatsächlichen Poolschema ableiten. Nicht für jede Quellenaufgabe blind ein redundantes Laufzeitprofil erzeugen. Private Verknüpfung bis Originalseite/Audiosegment erhalten.
- [ ] Themen-/Kompetenz-/Jahrgangsfilter und bestätigte Schulart/Land verwenden. `verified`/`confirmed` erst nach den tatsächlichen unabhängigen Fach- und Zuordnungsprüfungen setzen.
- [ ] Bei mehr als2.000 freigegebenen Profilen einen gesonderten begrenzten Implementierungsschritt zur vollständigen durchsuchbaren Auswahl planen; relevantes Profil jenseits Position2.000 muss auffindbar sein. Kontextgrenzen für die generierende KI bleiben bewusst begrenzt.
- [ ] Visuelle Erkenntnisse als eigene Gestaltungs-/Aufgabenanweisungen nutzbar machen. Für direkte Originalbildverwendung fehlt dem aktuellen Pool ein Assetpfad; eine tatsächliche private Assetanbindung muss separat implementiert und im erzeugten Test nachgewiesen werden. Lokales Speichern allein liefert dem Server keine Bilder.
- [ ] Neue gültige Profile schemageprüft und mit bestehendem Generator abgleichen; fachliche Passung und Qualität anhand tatsächlich erzeugter Beispiele prüfen. Starterbestand53 nicht mit neuen Readerprofilen verwechseln.
- [ ] Exportiert, integriert, tatsächlich abgefragt und veröffentlicht getrennt dokumentieren. Der als Live geführte Host `hausaufgabe-staging.web.app` erhält aus diesem Plan keine Deployfreigabe.

**Abnahme:** Die Software kann nachweislich passende freigegebene Inhalte abrufen; Nachweis verbindet erzeugte Aufgabe, verwendete Profil-ID und bestätigte Fach-/Jahrgangs-/Schulartzuordnung. Gespeicherte Dateien allein erfüllen das nicht.

## 11. Dashboard und eindeutige Abschlussregeln

Je Buch eine Zeile mit getrennten Spalten: Identität bestätigt, Inventar vollständig, Originale gesichert, Hauptseiten Soll/Ist, Zusatzseiten Soll/Ist, Einzelaufgaben Soll/Ist, unabhängige Lösungen Soll/Ist, Bilder/Diagramme geprüft, Audio/Video/Interaktionen geprüft, Zielgruppe/Lehrplan, Konzeptübernahme, Poolprofile freigegeben, tatsächlich veröffentlicht, konkrete offene Punkte, nächster Job.

`complete` gilt erst bei vollständigem Inventar, lesbaren vorhandenen Quellen, lückenloser geforderter Einzelprüfung, geklärten Widersprüchen und belegter Zuordnung/Übernahme. `not_applicable` nur nach nachgewiesener Abwesenheit, nicht bei Schwierigkeiten. `blocked` zählt weiterhin unvollständig. Buchanalyse, Poolfreigabe und Produktveröffentlichung bleiben getrennte Meilensteine.

Der Bericht beginnt stets mit **Bücher vollständig: X/125** und nennt dann Sammlung, Seitenprüfung, Aufgaben-/Lösungsprüfung und Freigabe getrennt. Seitenzahlen sind Dokumentseiten und enthalten mögliche Inhaltsüberschneidungen. Keine Prozentvollständigkeit aus Dateizahlen oder Rubrikzählern ableiten.

## 12. Wiederaufnahme, Laufzeit und konkrete nächste Schritte

Nach jedem Buch beziehungsweise Seitenpaket Ergebnis atomar sichern, Integrität prüfen und nächsten Auftrag claimen. Vor längerer Pause Handoff, offene externe Aktionen, genaue nächste Ressource und Versuche sichern. Ein sinnvoller Checkpoint ist kein Grund, den autorisierten Gesamtdurchlauf nach neun Dateien zu beenden. Bei einer blockierten Quelle andere unabhängige Jobs weiterarbeiten. Unklare externe Downloadereignisse zuerst abgleichen, nie blind wiederholen.

Nach Pilot und ersten zehn gesammelten Büchern eine Spanne aus gemessener Restmenge und tatsächlicher Rate je Readerfamilie erstellen. Inhaltsprüfung separat nach Seiten-, Aufgabendichte, Audiominuten und Zweitprüfungen schätzen. Keine Garantie „ein Buch pro Minute“ für vollständige fachliche Prüfung. Mehr Chats beschleunigen nur unabhängige Arbeit; sie ersetzen weder sichere Dateizuordnung noch Fachabnahme.

**Genau nächster ausführbarer Schritt:** atomare lokale Steuerung und expliziten Dateiimport für den kleinen Downloadpilot implementieren; danach an drei real identifizierten Readern die Zuordnung beweisen und unmittelbar den flächigen Sammlungsdurchlauf fortsetzen. Die Konzeptarbeit und Metadatenprüfung können unabhängig davon stattfinden. In diesem Wiederanlauf sind bislang Planung, Zahlenprüfung, tatsächliche Chatbeauftragung und zwei begrenzte Luna-Prüfaufträge erfolgt; neue Bücher werden dadurch noch nicht als gesammelt oder analysiert gezählt.

**Unabhängige Planprüfung:** Luna/medium fand zwei Lücken: unbelegte Dateiherkunft im seriellen Rückfall und Beschränkung auf nummerierte Aufgaben. Beide Anforderungen wurden oben verschärft. Sammlungspilot und Umsetzung sind dadurch noch nicht bestanden.

