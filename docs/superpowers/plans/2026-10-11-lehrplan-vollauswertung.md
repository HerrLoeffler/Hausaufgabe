# Lehrplan-Vollauswertung – 16-Länder-Implementation Plan

> **Für die Ausführung:** Den vorhandenen Auftrag `GC-PEDAGOGY-KB-01` mit `superpowers:executing-plans` Schritt für Schritt fortführen. Checkboxen werden erst nach belegter Prüfung gesetzt.

**Goal:** Alle geltenden amtlichen Lehrpläne aller Fächer in den vereinbarten Zielwegen für alle 16 Länder inventarisieren, auswerten, gegenprüfen und mit amtlichen Aufgaben-/Prüfungsanforderungen abgleichen.

**Architecture:** Zuerst wird das vollständige Dokument- und Geltungsinventar je Land aufgebaut. Danach werden die Fachinhalte je Zielweg länderübergreifend ausgewertet, unabhängig gegengeprüft und mit Aufgaben sowie Prüfungsquellen verbunden; Statussummen stammen aus den Registern.

**Tech Stack:** Amtliche KMK- und Landesportale; Markdown-Berichte; UTF-8-TSV-Register.

**Spec:** [Pädagogische Wissensbasis – Lehrplanphase](../specs/2026-10-11-paedagogische-wissensbasis-konzept.md)

## Global Constraints

- Alle 16 Länder und sämtliche amtlich geführten Fächer der vier Zielbereiche abdecken; Gymnasium Sek I und Oberstufe getrennt führen.
- Amtliche Originalquelle, Version, Gültigkeit, Jahrgang, Niveau und Kohorte zu jeder Geltungszeile erfassen.
- Keine Bücher, Lehrwerke, Regal-/Plattformkennungen, Lizenzcodes oder Rückverknüpfungen speichern.
- Portalindex, Entwurf, Handreichung, verbindlicher Lehrplan, amtliches Aufgabenbeispiel und eigene Ableitung als verschiedene Evidenzarten führen.
- Keine Gesamtfertigmeldung bei offenen verbindlichen Quellen; offene Zugänge konkret benennen.
- Keine Production-Änderung; der Auftrag beinhaltet keine Deployfreigabe.

## Review Focus

- **Gestaffelte Einführung/Parallelfassungen:** Kohorte und Schuljahr am amtlichen Erlass prüfen.
- **Integrierte Schularten:** Schulart, Bildungsgang und Abschlussziel getrennt belegen.
- **Unvollständige Portallisten:** Portalindex gegen direkte Dokument- und Geltungszeilen abgleichen.
- **Entwurf oder Beispielmaterial:** Rechts-/Verbindlichkeitsstatus prüfen, bevor eine Quelle in den Abschlussnenner gelangt.
- **Aufgaben/Prüfungen:** Beleg und Ableitung trennen; veröffentlichte Beispiele nie als vollständige Lehrplanabdeckung werten.

---

> **Für die Ausführung:** Den vorhandenen Auftrag `GC-PEDAGOGY-KB-01` fortführen. Jeden Schritt im Register und in der Übergabe mit Quelle, Datum und Status belegen. Medienbestand, Bücher und Downloads bleiben bis nach Abschluss der Lehrplanphase ausgeklammert.

**Ziel:** Alle geltenden amtlichen Lehrpläne aller Fächer für Grundschule, Haupt-/Mittelschulbildungsgang, Realschulbildungsgang und Gymnasium (Sek I und Oberstufe) in allen 16 Ländern vollständig inventarisieren, inhaltlich auswerten, gegenprüfen und anschließend mit amtlichen Aufgabenanforderungen und Abschlussprüfungen verknüpfen.

**Arbeitsweise:** Zuerst wird für jedes Land ein vollständiges, versions- und jahrgangsbezogenes Dokumentinventar hergestellt. Danach werden Fächer innerhalb eines Zielwegs länderübergreifend abgearbeitet. Eine kleine Arbeitseinheit ist stets **Land × amtlicher Schulweg/Bildungsgang × Fach/Lernbereich × Stufen-/Kohortenbereich × geltende Dokumentfassung**. Keine Schulform wird bundesweit vorausgesetzt oder künstlich vereinheitlicht.

**Arbeitsmittel:** KMK- und Landesportale als Einstieg; rechtsverbindliche Originalquellen und zuständige Landesportale als Beleg; TSV-Register als Statusquelle; Fachberichte in Markdown. Alle Zusammenfassungen sind eigene Paraphrasen mit Seiten-/Abschnittsangabe.

**Konzept:** [Pädagogische Wissensbasis – Lehrplanphase](../specs/2026-10-11-paedagogische-wissensbasis-konzept.md)  
**Aufgabenkennung/Übergabe:** [GC-PEDAGOGY-KB-01](../handoffs/GC-PEDAGOGY-KB-01.md)  
**Registerregeln:** [Registerschema](../../../analysis/GC-PEDAGOGY-KB-01/register/README.md)

## Fester Umfang und Grenzen

- **Länder:** Baden-Württemberg, Bayern, Berlin, Brandenburg, Bremen, Hamburg, Hessen, Mecklenburg-Vorpommern, Niedersachsen, Nordrhein-Westfalen, Rheinland-Pfalz, Saarland, Sachsen, Sachsen-Anhalt, Schleswig-Holstein und Thüringen.
- **Zielwege:** Grundschule; Haupt-/Mittelschulbildungsgang; Realschulbildungsgang; Gymnasium Sekundarstufe I; Gymnasium Oberstufe. Gymnasium Sek I und Oberstufe werden als getrennte Geltungswege gezählt. Wenn ein Bildungsgang in einer integrierten Schulart liegt, bleiben amtlicher Schulartname und Abschlussweg getrennte Felder.
- **Fächer:** alle Fächer, Wahlpflicht- und integrierten Lernbereiche, die das jeweilige Land für den konkreten Zielweg amtlich führt. Es gibt keine bundesweite Pflichtfachliste, die Länderunterschiede verdeckt.
- **Geltung:** jede Fassung, die am gewählten Stichtag für mindestens eine Kohorte gilt, einschließlich gestaffelter Einführung, Übergang und auslaufender Vorgänger.
- **Quellenarten:** verbindlicher Fachplan, allgemeiner Teil/Rahmenplan, Verordnung, Bildungsstandard, Entwurf, Umsetzungshilfe, Beispielaufgabe und Portalindex werden unterschieden. Nur verbindlich geltende Quellen gehören in den Abschlussnenner. Andere bleiben als Kontext markiert.
- **Aufgaben und Prüfungen:** erst nach dem Lehrplaninventar und der Erstauswertung. Lehrwerks- und Bildungslogin-Aufgaben gehören in eine spätere Medienphase.
- **Speicherregel:** Keine Buchtitel, Buchautor:innen, Verlage, ISBNs, Ausgaben, Cover, Regal-/Plattformkennungen, Lizenzcodes oder Rückverknüpfungen speichern. Amtliche Titel von Lehrplandokumenten sind erlaubt.

## Abschlussstatus – nur diese Zustände zählen

`entdeckt` → `metadaten_geprueft` → `inhalt_teilweise` → `inhalt_ausgewertet` → `zweitgeprueft`.

Gesondert: `zugriff_blockiert`, `version_unklar`, `nicht_anwendbar`.

- Ein Portal-Treffer ist höchstens `entdeckt`; ein Portalindex ist kein gelesener Fachplan.
- `inhalt_ausgewertet` verlangt die tatsächlich gelesene, für den Zielweg geltende Originalfassung und eine paraphrasierte Auswertung für alle ausgewiesenen Endpunkte. Suchindex-Auszüge werden ausdrücklich als solche gekennzeichnet und reichen nur, wenn die Sichtungsgrenze klar bleibt.
- `zweitgeprueft` setzt eine dokumentierte unabhängige Prüfung der Quelle, Geltung, Zuordnung, Endpunkte und Zusammenfassung in `prueflog.tsv` voraus.
- `nicht_anwendbar` braucht eine amtliche Quelle. Fehlender Link oder fehlender Schulartname genügt nicht.
- Ein Zugriffshindernis bleibt offen; es wird nicht aus älteren oder nichtamtlichen Fassungen „aufgefüllt“.
- Gesamtabschluss nur, wenn jede inventarisierte Land×Zielweg×Fach×Stufen-/Kohorteneinheit entweder zweitgeprüft oder amtlich nicht anwendbar ist. Blockierte und unklare Einheiten werden im Abschlussbericht sichtbar als nicht abgeschlossen ausgewiesen.

## Dateien und Verantwortlichkeit

| Ablage | Aufgabe |
|---|---|
| `register/schulwege.tsv` | Amtliche Schularten, Bildungsgänge, Stufen, Abschlüsse und Vergleichszuordnung je Land. |
| `register/dokumente.tsv` | Eine Zeile je Dokumentfassung, Quelle, Versionsstand, Gültigkeit und Zugang. |
| `register/zuordnungen.tsv` | Dokument × Schulweg × Fach × Jahrgang/Niveau/Kohorte. |
| `register/kompetenzen.tsv` | Nachprüfbare paraphrasierte Kompetenzen mit Originalgliederung, Endpunkt und Fundstelle. |
| `register/aufgabenprofile.tsv` | Amtliche Aufgabenanforderungen und Beispieltypen; Beleg oder eigene Ableitung kenntlich machen. |
| `register/pruefungen.tsv` | Amtliche Abschlussprüfungen, Musteraufgaben und Anforderungen nach Abschluss, Fach, Jahr und Fassung. |
| `register/prueflog.tsv` | Erst-/Zweitprüfung, Korrektur, Versionwechsel und Begründung offener Status. |
| `states/<land>.md` | Zuständigkeiten, Portale, amtliche Schulstruktur, Fächer- und Jahrgangslisten sowie Quellenlog. |
| `subjects/<zielweg>-<fach>.md` | Fachbericht länderübergreifend, mit Landesunterschieden und Geltungsständen. |
| `master/fortschritt-und-luecken.md` | Datierter Status aus den Registern, keine unabhängig gepflegten Summen. |
| `master/pflege-und-abnahme.md` | Quellenänderungen, Wiedervorlage und endgültige Abnahme. |
| `docs/superpowers/handoffs/GC-PEDAGOGY-KB-01.md` | Letzter belegter Schritt, offene Punkte und unmittelbar nächster Datensatz. |

**Schreibregel:** TSV-Felder enthalten keine Tabs oder Zeilenumbrüche; Unbekanntes steht als `unbekannt`. Nach jedem Landpaket und jedem Fachpaket werden betroffene Register, Bericht, Index und Übergabe gemeinsam gesichert. Ein Zwischenstand bleibt als Zwischenstand bezeichnet.

## Länder-Rollout

Die Reihenfolge folgt den vorhandenen Länderberichten, damit bestehende Quellen nicht verloren gehen und Lücken früh sichtbar werden. Ein Land gilt nach Abschnitt „Landespaket“ erst dann als inventarisiert, wenn alle fünf Zielwege und alle amtlich geführten Fächer geprüft sind.

| Nr. | Land | Bereits belegter Ausgangspunkt | Nächster konkrete Arbeitsschritt |
|---:|---|---|---|
| 01 | Baden-Württemberg | Länderbericht mit Zuständigkeit, Portalarchitektur und Fächerfamilien; einzelne Stichproben, kein Vollinventar. | Geltende Bildungsplanportale je Grundschule, gemeinsamer Sek I, Gymnasium und Kursstufe samt Niveaus, G8/G9 und Fassungen in Dokument- und Zuordnungsregister übertragen. |
| 02 | Bayern | LehrplanPLUS-Struktur und Beispiele Grundschule; Zielschularten benannt. | Pflicht-, Wahlpflicht- und Profilfächer für Grundschule, Mittelschule, Realschule und G9 nach Jahrgang vollständig aus dem amtlichen Lehrplanportal erfassen. |
| 03 | Berlin | Gemeinsamer Rahmenlehrplan 1–10 und Oberstufe überblickt; gemeinsame Quellen mit Brandenburg. | Berliner eigene Inkraftsetzung, Schularten, Niveaustufen, Fachpläne und Oberstufenfächer/Kohorten von Brandenburg trennen und vollständig erfassen. |
| 04 | Brandenburg | Gemeinsamer Rahmenlehrplan 1–10 und Oberstufe überblickt; eigene Einführungstermine. | Brandenburgische Schulformen, Niveaustufen, Umsetzungsdaten und Oberstufen-Fächer getrennt inventarisieren; gemeinsame Dokumente nur einmal erfassen und mehrfach zuordnen. |
| 05 | Bremen | Grundschule: 13 amtliche PDF-Einträge, neun Pläne erstgesichtet; Sek I/II: 81 Portaleinträge/76 URLs, Inhalte offen. | PDF-Inventar, Übergangserlasse und Kohorten für Oberschule, Gymnasium Sek I und Oberstufe vervollständigen; Portallinks einzeln auf verbindlichen Status prüfen. |
| 06 | Hamburg | Bildungsplanstruktur und Mathematik Grundschule gesichtet. | Fachlisten und gültige Bildungspläne nach Grundschule, Stadtteilschule, Gymnasium und Studienstufe sowie Erprobungs-/Übergangsfassungen vervollständigen. |
| 07 | Hessen | Mathematik Primarstufe gesichtet; Deutsch und weitere Quellen teilweise. | Kerncurricula und Bildungsstandards für Grundschule, Haupt-/Realschulbildungsgänge sowie Gymnasium Sek I/Oberstufe je Fach und Fassung inventarisieren. |
| 08 | Mecklenburg-Vorpommern | Mathematik Grundschule geprüft; Deutsch GS strukturell, Mathematik 5/6 geöffnet; laufende Revisionen. | Schulart-/Bildungsgang-Fachlisten und Aufwuchspläne für jede Kohorte erfassen; geltende und auslaufende Fassungen zuordnen. |
| 09 | Niedersachsen | CuVo und ausgewählte Beispiele; Mathematik Grundschule neu geprüft. | CuVo-Auszug je Schulform, Fach, Dokumentart und Gültig-ab exportieren/prüfen; Hauptschule, Realschule, Gymnasium samt Oberstufe und Grundschule gegen Erlasse abgleichen. |
| 10 | Nordrhein-Westfalen | Lehrplannavigator und ausgewählte Fachpläne; Mathematik GS geprüft. | Alle aktuellen Lehrplannavigator-Fachpläne, Schulformen und integrierten Bildungsgänge mit Erlass, Jahrgang und Abschlussniveau vollständig inventarisieren. |
| 11 | Rheinland-Pfalz | Portale/Fachfamilien und einzelne Beispiele; Mathematik GS geprüft. | Grundschule, Realschule plus (Bildungsgänge), Gymnasium G8/G9 und Oberstufe mit aktuellen Fachplänen, Inkrafttreten und Übergängen erfassen. |
| 12 | Saarland | Grundschulportal: 14 PDF-Einträge; Mathematik und Deutsch 2026 erstgesichtet; Sekundarstufenstruktur teilweise. | Fehlende Grundschulfächer und Übergang alter/neuer Pläne erfassen; danach Gemeinschaftsschule (Abschlusswege), G9-Gymnasium und GOS jahrgangs-/abiturjahrbezogen inventarisieren. |
| 13 | Sachsen | Länderbericht und Mathematik Grundschule geprüft; übrige Fachinventare offen. | Lehrplandatenbank pro Schulart, Fach und Klassenstufe abgleichen; Grundschule, Oberschule/Hauptschulweg, Realschulweg, Gymnasium und Oberstufe mit Reformfassungen erfassen. |
| 14 | Sachsen-Anhalt | Mathematik Grundschule 2026 im definierten Umfang geprüft; Reform-/Erprobungsstand dokumentiert. | Grundschul-Restfächer sowie Sekundarschule, Gemeinschaftsschule und Gymnasium/Oberstufe mit aufwachsenden Fassungen und Stufenlisten erfassen. |
| 15 | Schleswig-Holstein | Mathematik Primarstufe 2024 geprüft; Fachportalstruktur vorhanden. | Fachanforderungen aller Fächer für Grundschule, Gemeinschaftsschule (Abschlussniveaus) und Gymnasium/Oberstufe samt Entwurfs-/Geltungsstatus erfassen. |
| 16 | Thüringen | Mathematik GS 2010 teilweise; Haupttextzugang eingeschränkt; weitere Fachportale unvollständig. | Amtliche Gültigkeitsübersichten und öffentliche Portal-Metadaten nutzen, Schulwege/Fächerlisten erfassen und jeden geschützten Volltext als konkrete Zugangslücke führen. Keine Zugangssperre umgehen. |

### Landespaket – identische Prüffolge je Land

- [ ] **Einstieg belegen:** KMK-Übersicht und Landesministerium/Landesbildungsserver öffnen; Zuständigkeit und amtliche Lehrplanportale mit Abrufdatum eintragen.
- [ ] **Schulwege abbilden:** amtliche Namen, Jahrgänge, Abschlussziele, Niveaus, integrierte Wege sowie Sonder- und Übergangsformen in `schulwege.tsv` erfassen. Die vier Zielzuordnungen begründen und belegen.
- [ ] **Fächerlisten bilden:** je Zielweg alle Pflicht-, Wahlpflicht-, Profil-, integrierten Lernbereiche und angebotenen Religions-/Ethikfächer aus dem Landesportal erfassen. Ein Portalindex ist noch kein Dokument.
- [ ] **Dokumente erfassen:** jede geltende verbindliche Fassung und jeden notwendigen allgemeinen Teil, Erlass oder Rahmenplan in `dokumente.tsv`; direkte amtliche URL, Herausgeber, Fassung, Gültig-ab/-bis, Abruf, Status.
- [ ] **Geltung zuordnen:** pro Fach die konkreten Klassen/Jahrgänge, Endpunkte, Niveaus, Bildungsgang-/Abschlussziele und betroffenen Kohorten in `zuordnungen.tsv`; parallele Fassungen mit getrennten Zeilen.
- [ ] **Vollständigkeit gegenprüfen:** Portalindex ↔ Dokumentregister ↔ Schulwege abgleichen. Fehlende Links, Duplikate, alte Versionen und nicht anwendbare Wege klären; jede Nichtanwendbarkeit amtlich belegen.
- [ ] **Landesbericht schließen:** erst nach gezähltem Inventar eine Landzusammenfassung mit Nenner, offenen Zugängen und Versionierungsrisiken schreiben. Ein Länderdokument mit Stichproben heißt weiterhin „teilweise erfasst“.

**Abnahme eines Landespakets:** Alle fünf Zielwege entweder mit amtlich belegten Fächer-/Dokumentzeilen abgedeckt oder begründet nicht anwendbar; sämtliche verbindlichen Fach-/Jahrgangs-/Kohortenfassungen sind erfasst; keine unbekannte Zeile wird stillschweigend als abgeschlossen gezählt.

## Arbeitsphasen und Entscheidungstore

### Phase 0 – Arbeitsstand sichern und Fachabschluss Mathematik Grundschule

- [x] Task-ID `GC-PEDAGOGY-KB-01`, Arbeitsbranch und Draft-PR #208 geprüft; Zweigstatus zuletzt: PR offen, nicht gemergt.
- [x] Vorhandene 16 Länderberichte, Konzept, Registerschema und Arbeitsstand übernommen.
- [ ] Thüringer Mathematik-Grundschulplan 2010 vollständig prüfen, sobald der amtliche Volltext zugänglich ist; bisherige Teilprüfung bleibt `inhalt_teilweise`.
- [ ] Saarland Mathematik-/Deutschplan 2026 auf Kohortenregel prüfen; die Fachpläne wurden erstgesichtet, die Übergangszuordnung ist offen.
- [ ] 15 übrige Mathematik-Grundschul-Erstprüfungen plus Saarland gegen Geltungsstand, Endpunkte und Fundstellen zweitprüfen; Thüringen gesondert sperren, falls Quelle nicht zugänglich.
- [ ] Mathematik Grundschule erst nach vollständigem Registerabgleich als Fachblock schließen.

**Tor 0:** 16 Länderzeilen, richtige geltende Versionen und Kohorten, Dokumente und Fachberichte stimmen überein; jede nicht abgeschlossene zweite Sichtung wird explizit ausgewiesen.

### Phase 1 – Vollständiges Quellen- und Strukturergebnis für 16 Länder

- [ ] Landespakete 01–16 in Tabellenreihenfolge ausführen; zuständige Behörde, Portale, Schulwege, Fächer, Jahrgänge, Abschlussziele, amtliche Quellentypen erfassen.
- [ ] KMK allgemeinbildende Lehrplanübersicht und Bildungsstandards als Abgleich verwenden; Landesportale bleiben maßgeblich für konkrete Geltung.
- [ ] Pro Land Gegenprobe durchführen: jede Zielwegzeile hat Fächerliste, amtliche Quelle, Abrufdatum, Verantwortlichkeit und erkennbare Lücken.

**Tor 1:** Es gibt einen vollständigen, dokumentierten Inventarnenner pro Land und einen Gesamt-Nenner aller Geltungseinheiten. Dieser Nenner wird datiert eingefroren; neue amtliche Versionen erzeugen eine neue Revision statt rückwirkender stiller Änderungen.

### Phase 2 – Fachpläne inventarisieren und Fächer-Reihenfolge festlegen

- [ ] Alle Dokumente aus jedem Länderportal in `dokumente.tsv` und alle Land×Zielweg×Fach×Stufen-/Kohortengeltungen in `zuordnungen.tsv` übertragen.
- [ ] Aus dem Inventar eine priorisierte, aber vollständige Fächerliste je Zielweg erstellen. Priorisierung ändert nicht den Umfang.
- [ ] Integrierte Lernbereiche, Mehrfachzuständigkeiten, Religion/Ethik, zweite Fremdsprachen, Wahlpflicht/Profile und Oberstufen-Kursarten ausdrücklich abbilden.
- [ ] Die Dokumentzahl und die Anzahl der Geltungseinheiten getrennt berichten; ein Plan kann mehrere Fächer/Jahrgänge oder Kohorten haben.

**Tor 2:** Kein Landesportal bleibt unbesucht; jede amtlich gelistete verbindliche Quelle hat Status, URL und Geltungszuordnung. Erst jetzt wird die genaue Zahl der noch auszuwertenden Fachpläne festgehalten.

### Phase 3 – Fachweise Inhaltsauswertung quer durch alle 16 Länder

Die feste Reihenfolge lautet: **Grundschule vollständig → Haupt-/Mittelschulbildungsgänge vollständig → Realschulbildungsgänge vollständig → Gymnasium Sek I vollständig → Gymnasium Oberstufe vollständig.** Innerhalb jedes Zielwegs folgen die Fächerlisten aus Tor 2. Zuerst wird ein Fach in allen 16 Ländern abgearbeitet, dann das nächste; so werden Unterschiede sichtbar und offene Quellen blockieren nicht die anderen Länder.

Je Fachpaket:
- [ ] Fachbericht und je Geltungszeile Kompetenzanker mit genauer Fundstelle anlegen.
- [ ] Allgemeiner Teil, Fachplan, Standards und rechtliche Verbindlichkeit zusammen lesen; Dokumentarten nicht vermischen.
- [ ] Kompetenzmodell, inhaltsbezogene Bereiche, verbindliche Themen/Kompetenzen, Jahrgangsprogression, Endpunkte, Niveau-/Abschlussdifferenzierung, Leistungsbezug und Querschnittsaufgaben paraphrasieren.
- [ ] Optionale Beispiele, Hinweise und verbindliche Anforderungen getrennt markieren.
- [ ] Abweichungen, Übergänge, fehlende Übersetzungen/Barrierefreiheit, widersprüchliche Portale oder Zugangssperren einzeln protokollieren.
- [ ] Landesvergleich im Fachbericht erst schreiben, wenn alle erreichbaren Länderquellen gesichtet sind; Gemeinsamkeiten nie als einheitliche Bundesnorm ausgeben.

**Fachblock abgeschlossen:** Alle dazugehörigen Geltungszeilen sind `inhalt_ausgewertet` oder als präzise offene Quelle markiert, jedes Kompetenzpaket hat Endpunkte/Fundstellen, und Dokumentregister sowie Fachbericht decken sich.

### Phase 4 – Unabhängige Zweitprüfung

- [ ] Eine zweite Prüfung kontrolliert jede Quelle/Fassung/Geltung und die Kompetenzzusammenfassung. Die prüfende Person darf die Erstzusammenfassung nicht nur abschreiben, sondern kontrolliert sie am amtlichen Dokument.
- [ ] Mindestens alle Kompetenzbereiche und Stufenendpunkte je Dokument gegenlesen; bei sehr langen Dokumenten die komplette Übersicht mit Prüfraster und gezielten Seitenkontrollen abarbeiten.
- [ ] Ergebnis, Korrektur und Prüferrolle in `prueflog.tsv`; `zweitgeprueft` nur bei positivem Befund.
- [ ] Fehlerhafte oder überholte Versionen zu `version_unklar` zurücksetzen und neu prüfen.

**Tor 4:** Keine als abgeschlossen gezählte Einheit ohne unabhängige Sichtung. Kann keine zweite Person verfügbar gemacht werden, bleibt Status offen; Erstprüfung wird nicht als Zweitprüfung umetikettiert.

### Phase 5 – Aufgaben und Abschlussprüfungen amtlich abgleichen

- [ ] Aus jeder geprüften Kompetenz Handlung, beobachtbares Können und mögliche Aufgabenanforderung ableiten; `amtliches_beispiel` und `aus_lehrplan_abgeleitet` auseinanderhalten.
- [ ] Operatoren und Anforderungsbereiche aus Landesplan/KMK/Prüfungsregelungen mit Quelle und Geltung eintragen.
- [ ] Amtliche Aufgabenbeispiele und veröffentlichte Abschlussarbeiten nur knapp paraphrasieren und auf Kompetenz/Fundstelle verknüpfen; keine vollständigen Aufgaben- oder Lösungstexte übernehmen.
- [ ] Abschlussprüfungen je vorhandenem Haupt-/mittlerem Abschluss und Abitur nach Land, Fach, Prüfungsjahr, Kohorte, Kursart und geltender Fassung inventarisieren.
- [ ] Prüfungsregel, Musteraufgabe, echte veröffentlichte Prüfung und nicht öffentliche Prüfung getrennt kennzeichnen. Nicht erreichbare Inhalte als Zugangslücke führen.
- [ ] Abweichungen zwischen Lehrplan, Prüfungsanforderung und veröffentlichtem Aufgabenmaterial ausweisen. Prüfungsbeispiele gelten nie als vollständige Lehrplanabdeckung.

**Tor 5:** Jede Aufgaben-/Prüfungszeile verweist auf geprüfte amtliche Quelle und Kompetenz oder dokumentiert, dass kein Beleg verfügbar ist. Keine unbelegten Rückschlüsse auf unbekannte Prüfungsinhalte.

### Phase 6 – Gesamtprüfung, Abschlussbericht und Pflege

- [ ] Inventarnenner erneut gegen KMK und jedes Landesportal prüfen; alle Links, Versions- und Kohortenwechsel nach letzter Sichtung aktualisieren.
- [ ] Alle Länder×Zielwege×Fächer×Stufen/Kohorten zwischen `schulwege`, `dokumente`, `zuordnungen`, `kompetenzen`, `aufgabenprofile`, `pruefungen` und `prueflog` abgleichen.
- [ ] Fehlende, doppelte, ungeprüfte, nicht anwendbare, zugriffsgesperrte und versionsunklare Zeilen separat ausweisen.
- [ ] Datierter Abschlussbericht nennt Gesamt-Nenner, Zahl zweitgeprüfter Einheiten und alle verbleibenden Lücken. Keine Gesamtvollständigkeit behaupten, solange verbindliche Einheiten blockiert oder ungeprüft sind.
- [ ] Pflegeereignisse festlegen: amtliche Änderungsmitteilung, neue PDF-Fassung, Kohortenwechsel, Schulreform oder toter Link. Betroffene Geltungen erneut prüfen und Vorfassung historisch erhalten.
- [ ] Übergabe mit dem nächsten fälligen Prüfschritt aktualisieren und Zwischenergebnisse regelmäßig auf dem bestehenden Aufgabenbranch sichern.

## Inhaltliches Prüfraster pro Dokument

| Prüffeld | Was festgehalten wird |
|---|---|
| Quelle/Geltung | zuständige Stelle, Original-URL, Fassung, veröffentlicht/geändert/gültig ab/bis, Schuljahr/Kohorte, Rechts-/Verbindlichkeitsstatus |
| Struktur | Originalkapitel, Fach/Lernbereich, Klassen/Endpunkte, Niveaus/Abschlüsse und Querschnittsanteile |
| Anforderungen | Kompetenzmodell und verbindliche Erwartungen in eigenen Worten mit Seiten-/Abschnittsfundstelle |
| Progression | Was wird eingeführt, gefestigt, erweitert; Sprünge nach Jahrgang, Doppeljahrgang, Eingangsstufe, Kurs/Abschluss |
| Aufgaben/Leistung | verlangte Handlungen, Operatoren, AFB, Lern-/Leistungsbewertung und amtliche Beispiele; Beleg vs. Ableitung |
| Grenzen | fehlende Teile, Zugriff, Entwurf/Altplan, widersprüchliche Geltung, Unsicherheit, nächste konkrete Handlung |

## Sicherung und Rückmeldung

- Pro Arbeitseinheit einen nachvollziehbaren Commit mit Land/Fach/Status im Betreff; unvollständige Arbeit als unvollständig benennen.
- Keine Änderungen an Production; dieser Lehrplanauftrag beinhaltet keine Deployfreigabe.
- Nach jedem Landpaket und jedem Fachblock kurzen Fortschritt, aktualisierten Nenner, neuen Blocker und unmittelbar nächsten Arbeitsschritt in die Übergabe eintragen.
- Die vorhandene Übergabe und Draft-PR #208 fortführen; Integration auf `main` bleibt vom tatsächlichen Projektprozess abhängig.

## Fünf Hauptrisiken und Gegenprüfung

1. **Alte und neue Pläne gelten parallel:** Übergänge je Schuljahr/Kohorte aus Erlass oder amtlicher Übersicht belegen.
2. **Schulartname passt nicht zum Abschlussweg:** Originalname, Bildungsgang und Abschlussniveau als getrennte Registerfelder führen.
3. **Fächerliste wirkt vollständig, ist aber nur eine Portalstichprobe:** Landesportalindex pro Schulweg vollständig öffnen und gegen Dokument-URLs abgleichen.
4. **Entwurf/Handreichung wird als verbindlich gezählt:** Dokumentart und Rechts-/Geltungsbeleg vor Aufnahme in den Nenner prüfen.
5. **Aufgabenbeispiele werden mit Lehrplanpflicht verwechselt:** Verbindliche Kompetenz, optionaler Hinweis, amtliches Beispiel und eigene Ableitung in getrennte Evidenztypen schreiben.

## Tatsächlicher Ausgangsstand am 11.10.2026

- 16 erste Länderberichte mit amtlichen Einstiegen/Zuständigkeiten liegen vor; sie ersetzen kein vollständiges Fachinventar.
- Mathematik Grundschule: 15 Länder im definierten Umfang erstgesichtet, Thüringen teilweise; keine unabhängige Zweitprüfung belegt. Saarland 2026 ist im Volltext erstgesichtet, Kohortenübergang offen.
- Saarland Grundschule: 14 amtliche PDF-Einträge erfasst; Deutsch und Mathematik 2026 erstgesichtet.
- Bremen Grundschule: 13 amtliche PDF-Einträge, neun Fachpläne erstgesichtet; Bremen Sek I/II: 81 Portaleinträge zu 76 URLs erfasst, Inhalte noch nicht geprüft.
- Register: 101 Dokumentzeilen, 17 Zuordnungen und 21 Kompetenzanker am dokumentierten Stand; das ist ein begonnener Ausschnitt, kein nationaler Nenner.
- Vollständige Inventare, alle weiteren Fachinhalte, unabhängige Zweitsichtungen sowie amtlicher Aufgaben- und Prüfungsabgleich sind offen.

**Nächster konkreter Arbeitsschritt nach Planfreigabe:** Phase 0 fortsetzen: Thüringer Mathematikzugang und Saarland-Kohortenregel dokumentieren, Mathematik-Grundschule fachweise zweitprüfen; parallel beginnt Landespaket 01 mit dem vollständigen BW-Dokumentinventar.

## Abschlussbedingung

Der Auftrag ist erst abgeschlossen, wenn alle Länder- und Zielwegpakete, alle amtlich geltenden Fach-/Stufenkombinationen und Versionen, sämtliche Inhaltsauswertungen, unabhängigen Prüfungen sowie die verfügbaren Aufgaben- und Prüfungsabgleiche die oben genannten Tore passiert haben. Ein Plan, ein Portalüberblick oder ein hoher Anteil gelesener Pläne erfüllt diese Bedingung nicht.

