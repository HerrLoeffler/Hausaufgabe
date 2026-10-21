# Vollanalyse des Bücherregals und didaktischer Transfer — Ausführungsplan

> Sammlung über einen Browser-Bearbeiter; unabhängige lokale Seitenpakete parallel nach dispatching-parallel-agents. Es handelt sich um Quellenanalyse; Produktimplementierung und deren Testworkflow sind ein gesonderter Schritt.

**Goal:** Alle zugänglichen Buchseiten und Zusatzressourcen dauerhaft privat erhalten und seitenbezogen fachlich/didaktisch erschließen; ausschließlich belegte eigene Aufgabenprofile in den Materialpool übernehmen.

**Architecture:** Ein Sammlungsdurchlauf pro Reader beschafft zuerst angebotene Gesamtdateien. Inhaltsgleiche Dateien werden per SHA-256 einmal archiviert. Die lokale Auswertung liest vollständige Texte und prüft jede Seite visuell in festen, überschneidungsfreien Paketen. Ein eigener Freigabeschritt verbindet Aufgaben, Lösungen, visuelle Abhängigkeiten und didaktische Regeln mit dem vorhandenen Pool.

**Tech Stack:** Bestehende Reader-Oberflächen, CUA, PDF/ZIP/Office-Originale, SHA-256, Poppler, Python/pypdf/Pillow, lokales faster-whisper, JSONL/TSV und vorhandener serverseitiger Pool.

**Spec:** Martins Auftrag21.10.2026; vorhandene Quellen/Analyse unter `analysis/GC-PEDAGOGY-KB-01/media/`; vorhandener Pool aus PR218; kein neuer Produkt- oder Live-Deployauftrag.

## Global Constraints

- Keine Titel, Autoren, Verlage, ISBN, Lizenzcodes oder Originaldateinamen in Wissens- und Aufgabenregistern.
- Originale einschließlich Bilder, Diagramme, eingebetteter Schrift und Audio privat und unverändert behalten; Dateien unter `sources/` bleiben unverändert.
- Originale und Rohtexte nicht in den öffentlichen GitHub-Bestand oder einen allgemeinen Schülerpool hochladen. Der öffentliche Pool enthält eigene anonyme Abstraktionen.
- Hash, interne Seiten-/Aufgabenmarke und Prüfumfang verbinden Analyse und privates Original. Keine Login-/Downloadtokens speichern.
- Jede Seite: Text lesen, tatsächliches Seitenbild prüfen, fehlende/abgeschnittene Inhalte und visuelle Abhängigkeiten ausweisen.
- Eine Dateiliste, OCR, ein Cover oder ein Rubrikzähler erfüllt keine Inhaltsanalyse.
- Lehrkraftmaterial-only, Ausgangstest/Varianten sowie Fach/Jahrgang/Schulart/Land bleiben verbindliche Grenzen des vorhandenen Generators.
- Der aktuell so benannte Host `hausaufgabe-staging.web.app` wird laut aktuellem Main als Live geführt: kein Deployment aus diesem Analyseauftrag ableiten.

## Review Focus

1. Gleichnamige Downloads können unterschiedliche Inhalte haben; gleicher Dateiname ist kein Dublettennachweis.
2. Gesamt-PDF kann nur Kommentar oder Lösungen enthalten; Hauptbuch und Zusatzressourcen getrennt nachweisen.
3. Textauszug kann Zahlen, Formeln, Spalten und Diagrammbeziehungen falsch ordnen; Seitenbild und eigene Rechnung entscheiden.
4. Lösung ohne vollständig sichtbaren Aufgabenstamm kann nicht vollständig gegengeprüft werden.
5. Frühere R-Positionen können nach einer Regaländerung verrutschen; alte Positionen erst nach Quellenabgleich zuordnen.

## 1. Bestand und Wiederaufnahme

- [x] Aktuellen Main-Einstieg, Releasegrenze und vorhandene PRs/Workstreams lesen; GC-PEDAGOGY-KB-01 fortführen.
- [x] Aktuellen Development Status39629725383 lesen; vorhandene Analyse-PR214 und integrierten Pool erkennen.
- [x] Dateibestand auf unfertige Downloads prüfen: derzeit0Dateien mit üblichen Teil-Download-Endungen. Das ist kein Beweis, dass alle je angeforderten Downloads vorhanden sind.
- [x] Früher registrierte Readerdownloads gegen Downloads abgleichen:62/62anonyme IDs wiedergefunden,216PDF-Seiten, SHA-256-geprüft archiviert.
- [x] Anmeldestatus prüfen: Bildungslogin verlangt erneute Anmeldung; Nutzer asynchron um Anmeldung gebeten.
- [ ] Regalzahl und ausgeblendete Medien nach Anmeldung erneut bestätigen;125ist der frühere, nicht der heutige verifizierte Zählstand.

**Ablage:** `media/reader-source-recovery-20261021.json`; Originale `private-archive/reader-recovered-20261021/`. Kein erneuter Download eines nachweislich identischen Inhalts.

## 2. Reader sammeln — effizienter Ablauf pro Medium

- [ ] Ein Reader öffnen, globalen Materialmodus aktivieren; Titelseite, Inhaltsverzeichnis und jede Rubrik prüfen. Seitenfilter ausdrücklich aufheben, wenn vorhanden.
- [ ] Zuerst nach Gesamtangeboten suchen: Nützliches, Downloads, Gesamtmaterial, Kommentar gesamt, Kopiervorlagen gesamt, Arbeitshefte mit Lösungen, Audio-/Medienpakete. Vorhandene Sammelangebote möglichst vor Einzelressourcen laden.
- [ ] An einer Datei je Exporttyp prüfen, ob sie vollständig, ein Kapitel, eine Einzelseite oder nur ein Kommentar ist. PDF-Seitenzahl und inhaltliche Grenzseiten abgleichen.
- [ ] Alle übrigen Materiallisten bis zum tatsächlichen Ende öffnen; virtuelle Listen nicht nach dem ersten sichtbaren Block als vollständig zählen.
- [ ] Je Downloadaktion festhalten: interne Ressource, Readerzustand/Seitenbereich, erwarteter Typ/Umfang, tatsächliche neue Datei, finaler Downloadstatus, SHA-256. Bei unerwartet gleichem Hash trotz anderer Auswahl sofort die Seitennavigation prüfen.
- [ ] ZIP vollständig und sicher auflisten, verschachtelte Archive berücksichtigen; Parent-Child-Beziehungen per Hash erhalten. Unbekannte Dateitypen offen ausweisen.
- [ ] Hauptbuch separat sichern, wenn der Reader einen regulären Gesamt-/Kapitelexport anbietet. Für reine Ansichten vollständig seitenweise prüfen und verbleibende Exportlücken dokumentieren. Keine Zugriffssperre umgehen.
- [ ] Ressourcenkategorien vollständig abgleichen: Schülerbuch, Arbeitsheft, Lösungen, Kommentare, Förder-/Fordermaterial, Diagnose/Tests, Vorlagen, Audio/Video, interaktive Angebote.

**Arbeitsweise:** Ein Browser-Steuerprozess, höchstens3–4aktive Reader-/Downloadvorgänge; lokale Auswertung parallel. Die Zeitersparnis kommt aus Bündeln, Wiederverwendung und paralleler Inhaltsarbeit. Ein vollständiges Buch mit hunderten Aufgaben wird nicht pauschal in einer Minute fachlich geprüft.

## 3. Vollständige Seitenanalyse und Erhalt visueller Inhalte

**Originalablage:** `private-archive/reader-recovered-20261021/<sha256>.pdf`; künftige Sammlungen unter einem separaten datierten Quellenverzeichnis. PDF ist die vollständige visuelle Primärquelle; Rasterbilder sind eine Arbeitskopie, kein Ersatz.

**Arbeitskopien:** `private-archive/.../text/<content_id>/pNNNN.txt`, `renders/<content_id>/partN/`, Audio normalisiert plus zeitgestempeltes Transkript. Office-Dateien zusätzlich im Original behalten; eingebettete Medien nicht durch Text ersetzen.

**Seitenregister:** `media/commentary-<content_id>-<date>/pagesAAA-BBB.jsonl` mit:

`content_id, pdf_page, role, topic, own_pedagogical_summary, visual_interpretation, learning_goals, differentiation, assessment_implications, task_patterns, solution_checks, statuses, open_questions`.

- [ ] Jeder Seitenbereich hat genau einen Bearbeiter und eine explizite erste/letzte PDF-Seite.
- [ ] Jede Seite vollständig lesen und ansehen; dichte Zahlen-/Diagrammstellen separat vergrößern. Kontaktbögen erleichtern Navigation, ersetzen keine lesbare Sichtprüfung.
- [ ] Jede sichtbare nummerierte Aufgabengruppe mit eigenem Muster, Lernziel und Quellenmarke erfassen. Keine generischen Kopierzeilen für ungeprüfte Aufgaben.
- [ ] Grafikabhängige Aufgaben mit Bildausschnitt/Koordinaten relativ zur Originalseite verbinden: Bedeutung, Objekte, Beziehungen, Achsen, Legende, Maßstab, Einheiten, nötige Seh-/Lesehandlungen und typische Fehlinterpretationen.
- [ ] Lösungen selbst prüfen, soweit Aufgabenstamm und Grafik vollständig vorliegen. Teilprüfung und noch nicht geprüfte Schlüssel unterscheiden.
- [ ] Audios einmal transkribieren, Quellen-/Sprachvarianten separat erhalten, Zahlen/Negationen und Aufgabenbezüge anhand der Quelle prüfen.
- [ ] Seitenlücken, Text-/Bildlücken und Lösungslücken durch Mengenabgleich feststellen. Begründet ausgenommene Verwaltungsseiten bleiben als solche nachgewiesen.

**Begonnenes vollständiges Dokumentpaket:** Kommentar8d468f417d811a7a,164PDF-Seiten; feste Pakete1–55,56–110,111–164. Drei getrennte Analyse-Agenten arbeiten an diesen Bereichen. 164/164Seiten sind bereits privat textlich erschlossen; das zählt ausdrücklich noch nicht als fachliche oder visuelle Abnahme.

## 4. Didaktische Hinweise in das pädagogische Konzept übertragen

**Eigenes Transferregister:** `media/didaktik-transfer-20261021.jsonl`; Synthese `master/materialdidaktik-ergaenzung-20261021.md`. Bestehendes Konzept wird über eine Ergänzung erweitert; parallel bearbeitete Dateien bleiben erhalten.

Jede Regel enthält interne ID, Fach/Zielgruppe, Voraussetzungen, anwendbares Lernziel, methodischen Ablauf, passende Darstellungen, Hilfen/Erweiterung, beobachtbare Fehlvorstellung, Diagnose-/Bewertungsgrenze, konkrete Konsequenz für neue Aufgaben, Fundstellen und Prüfstatus.

- [ ] Zwischen Materialbehauptung, beobachtetem Aufgabeneffekt und eigener Produktentscheidung unterscheiden.
- [ ] Progression, Darstellungswechsel, Sprachentlastung, Diagnose und Förderung aus geprüften Hinweisen konkret ableiten.
- [ ] Kein einzelnes Lehrwerk als allgemeine Wahrheit für jede Schulart ausgeben. Widersprüche und situationsabhängige Methoden erhalten.
- [ ] Jede neue Prüfungsaufgabe unabhängig lösen; Diagnoseschlüsse nur auf tatsächlich geprüfte Fähigkeiten beziehen.

## 5. Übergabe an den bestehenden Materialpool

- [ ] Nur vollständig belegte, fachlich geprüfte eigene Aufgabenprofile zu `subject, grades, schoolType, region, topics, learningGoal, taskPattern, qualityHints, modalities, supportedTypes` aufbereiten.
- [ ] `verified` und `confirmed` erst nach tatsächlicher Aufgaben-/Quellen-/Zuordnungsprüfung setzen. Extrahierte oder nur gesichtete Kandidaten bleiben außerhalb der automatischen Auswahl.
- [ ] Didaktische Transferregeln bei passenden Profilen in Lernziel, Aufgabenmuster und Qualitätshinweisen abbilden. Grafikabhängige Originale nicht automatisch in generierte Tests übernehmen; eine neue eigene geeignete Grafik gezielt gestalten.
- [ ] Kandidatenbestand, freigegebener Poolstand und tatsächlich veröffentlichte Version getrennt führen. 53ist der bisher freigegebene Startbestand, keine Zahl analysierter Bücher.
- [ ] Vor einer Produktübernahme aktuellen Generator-/Poolstand und vorhandene Entwicklung erneut prüfen. Ein eigener späterer Releaseauftrag muss die aktuelle Livegrenze beachten.

## Abschlusskriterien pro Medium

Ein Medium gilt erst dann als vollständig im vereinbarten zugänglichen Umfang analysiert, wenn alle Hauptseiten, Zusatzkategorien und Ressourcen ein nachvollziehbares Ergebnis haben, alle Seiten im Register vorkommen, Bilder/Diagramme mit der Originalquelle verbunden sind und Aufgaben-/Lösungsreste ausdrücklich geklärt sind. Technische Nichtverfügbarkeit oder fehlende Exportmöglichkeit werden als offene Grenze ausgewiesen, nicht in „erledigt“ umgerechnet.

**Fortschritt sichtbar als vier getrennte Werte:** (1) Quellen gesichert, (2) Seiten textlich/visuell geprüft, (3) Aufgaben/Lösungen fachlich geprüft, (4) freigegebene Poolprofile. Eine Änderung eines Wertes erhöht die anderen nicht automatisch.

## Zeit- und Stoppregel

Nach dem ersten vollständig ausgewerteten Ressourcenpaket tatsächliche Seiten-/Aufgabenrate messen. Restzeit je Readerfamilie aus verbleibenden Seiten, Dateien, Audiodauer und offenen Prüfungen schätzen; keine ungemessene Ein-Stunden-Zusage für das ganze Regal. Nach jedem Paket Ergebnisse und Übergabe sichern. Gleiche Downloads nach unerwartet identischen Hashes nicht wiederholen. Blockierte Reader werden nach einem belegten Versuch zurückgestellt; vorhandene lokale Quellen weiter auswerten.
