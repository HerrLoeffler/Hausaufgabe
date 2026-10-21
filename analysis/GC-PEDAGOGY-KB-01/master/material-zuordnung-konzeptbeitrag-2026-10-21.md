# Materialzuordnung und didaktische Übernahme für GradeCrew

GC-PEDAGOGY-KB-01 · Fachbeitrag vom 21.10.2026 · ausführender Chat **GC · Pädagogisches Konzept**, `01a1280a-c9f4-73a3-a12a-7b2b93a5ba5a`.

## Ergebnis und Abgrenzung

Für jedes Buch und jede einzelne Ressource gilt derselbe nachfolgende Zuordnungsvertrag. Belegte Herkunft, geschätzter Einsatzbereich und pädagogischer Transfer werden getrennt geführt. Fehlende Angaben bleiben ausdrücklich unbekannt. Es gibt keine Standardzuordnung zu Mittelschule/Bayern.

Die 24 Vorschläge aus der Materialanalyse sind einzeln mit dem bestehenden Konzept abgeglichen. Sie sind grundsätzlich anschlussfähig. Die priorisierte Übernahmeliste präzisiert Voraussetzungen, Hilfen, Erweiterungen und Bewertungsgrenzen. Das ist eine fachliche Empfehlung für die Konzeptpflege, keine automatische Freigabe neuer Aufgabenprofile und keine praktische Wirksamkeitsprüfung.

**Bestandsgrenze:** Der Materialauftrag nennt neun neue Dateien, darunter sieben PDFs mit insgesamt 1.040 Seiten. Drei Kommentar-/Diagnosedokumente sind laut den vorhandenen Abdeckungsnachweisen auf 164 + 284 + 22 = **470 Seiten** gelesen. Das sind keine 470 gelesenen Hauptbuchseiten. **0 von 125 Regalbüchern sind als vollständig analysiert belegt.** Ressourcenanzahl, Seitenabdeckung, geprüfte Lösungen und vollständige Bücher bleiben unterschiedliche Zähler. Die übrigen Dateien und alle anderen Ressourcen eines zugehörigen Buches werden dadurch nicht als gelesen oder geprüft behandelt.

Originale und detaillierte Seitenrecords bleiben privat. Gespeichert werden hier nur anonyme Inhaltskennungen, Fundstellen, eigene Gestaltungsregeln und Prüfgrenzen. Keine Titel, Autoren, Verlage, ISBN, Lizenzcodes, Originalaufgaben oder Originalabbildungen übernehmen.

## Bestehende Grundlagen und Zuständigkeit

Dieser Beitrag verwendet die vorhandenen drei Ebenen weiter:

1. [Grober Lehrplanüberblick für 16 Länder](grober-lehrplanueberblick-deutschland.md): Orientierung zu Schulwegen, Fächern, größeren Lernbereichen und amtlichen Einstiegen. Keine vollständige Einzelanalyse aller Fachpläne.
2. [Pädagogisches Konzept](paedagogisches-konzept-gradecrew.md): beobachtbare Lernziele, begrenzter Aufgabenplan, fachliche Korrektheit, Zugang, Differenzierung, Kriterien und Lehrkraftfreigabe.
3. [Bruchpilot und verbindliche Belegzählung](brueche-by-ms-56-kompetenzkarte-und-pilotplan-2026-10-16.md) sowie [privates Schülergedächtnis als Architekturentwurf](schueler-second-brain-architektur-und-umsetzungsplan-2026-10-16.md): Hilfe, Ergebnis, Erklärung und Operationsart getrennt halten; korrelierte Teilhandlungen nicht als mehrere unabhängige Erfolge zählen. Der Architekturtext ist kein aktueller Produktnachweis.

Die Medienanalyse erweitert jetzt gezielt die fachliche Konzeptgrundlage. Die früheren, auf medienfreie Generierung beschränkten Aufträge bleiben historische Umfänge; daraus folgt keine Erlaubnis, den gesamten privaten Bestand in die Laufzeit einzuspeisen.

**Lehrplan-Owner:** Bekannter zuständiger Chat ist dieser Chat **GC · Pädagogisches Konzept**, ID `01a1280a-c9f4-73a3-a12a-7b2b93a5ba5a`, historischer Lehrplan-PR208. Ein davon getrennter aktiver menschlich zugeordneter Lehrplanchat ist aus den geprüften Zuordnungen und der aktuellen Chatliste nicht bekannt. Frühere Unteragentennamen sind keine zusätzlichen dauerhaften Owner. Material-Owner ist **GC · Pädagogisches Material**, ID `01a1282d-7f9d-7ee3-b7a8-d0c0da8967c2`, PR214. Hier werden dessen Register und Übergaben nicht parallel bearbeitet.

## Zuordnungsvertrag für Bücher und Ressourcen

### Datensatz und Zuordnungsbehauptung trennen

Ein Buch erhält einen anonymen Buchdatensatz. Jede Ressource erhält einen eigenen Ressourcendatensatz: beispielsweise Hauptinhalt, Kommentar, Arbeitsblatt, Diagnose, Lösung, Bild, Audio oder Zusatzdokument. Ein ZIP oder eine Dateisammlung ist zunächst ein Container; seine Kinder brauchen eigene Inhalts- und Prüfstände.

Zu einem Datensatz können mehrere **belegte Zuordnungsbehauptungen** gehören. Ein fachübergreifendes Material wird nicht in genau ein Fach gezwungen. Jede Behauptung hat ihren eigenen Beleg, Geltungsbereich und Prüfstatus. Buchzuordnung, Ressourcenzuordnung und Zuordnung eines konkreten Aufgabenmusters sind drei unterschiedliche Reichweiten.

Die Beziehung `resource → book` ist ebenfalls zu belegen. „Im gleichen Ordner“ ist nur ein Hinweis. Eine Ressource erbt weder geprüfte Jahrgänge noch Länder-/Schulartzuordnungen oder Vollständigkeitsstatus automatisch vom Buch. Buchangaben dürfen als gekennzeichnete Prüfkandidaten dienen; bestätigt werden sie erst mit passendem Beleg für die betreffende Ressource. Umgekehrt macht ein vollständig gelesener Kommentar das Hauptbuch nicht vollständig.

### Pflichtfelder

Pflicht bedeutet: Das Feld und sein Status müssen vorhanden sein. Bei fehlendem Beleg ist ein erklärtes `unknown` zulässig; eine erfundene Angabe ist es nicht.

| Feldgruppe | Verbindliche Angabe und Regel |
|---|---|
| Identität | `record_id`, `record_kind` = book/resource/container, `content_revision`; bei Ressourcen `resource_role`. Ausschließlich opake interne IDs. Inhaltsänderung erzeugt neue Revision, keine stillschweigende Wiederverwendung alter Prüfstände. |
| Beziehung | `parent_book_id` oder null; `relationship_status`, `relationship_evidence`. Derselbe Inhalt kann über mehrere belegte Beziehungen erreichbar sein, zählt aber nicht als mehrfach analysierter Inhalt. |
| Fach | `subjects[]` mit amtlichem/überliefertem Fachnamen, normalisiertem Fachcode und Beleg je Zuordnung. Fachfamilie und konkretes Fach unterscheiden; beispielsweise Sachunterricht nicht automatisch in Biologie umbenennen. |
| Schulart und Bildungsgang | `school_type_original`, `education_path`, ggf. Abschluss-/Kursniveau; Beleg und Status. Amtliche Landesbezeichnung erhalten. Schulart ist kein individueller Schwierigkeitsgrad. |
| Land | `source_jurisdiction` = belegtes Land, ausdrücklich länderübergreifende Herkunft oder unknown; `target_jurisdiction` pro beabsichtigter Lehrplanzuordnung separat. Länderübergreifender didaktischer Nutzen macht eine Quelle nicht zu einem amtlich bundesweit zugeordneten Lehrmittel. |
| Quelljahrgang | `source_grades` mit `basis` = explicit/estimated/unknown; genaue Quelle, Geltungsumfang und Begründung. Ein expliziter Jahrgang bleibt als Herkunft erhalten, selbst wenn später anderer Einsatz sinnvoll ist. |
| Geschätzter Einsatz | `estimated_use_range` separat, wenn keine Jahrgangsangabe belegt ist oder eine zusätzliche fachliche Einschätzung gebraucht wird. Lernhandlungen, Voraussetzungen, sprachliche Last, Zahlenraum/Textart und begrenzter Geltungsumfang begründen den Bereich; keine Schätzung allein aus Layout, Bildstil oder vermuteter Begabung. |
| Transferjahrgänge | `transfer_targets[]` mit Zielland, Zielschulweg, Jahrgang/-band, Zweck, Voraussetzungen, nötigen Anpassungen und eigener Prüfung. Förderwiederholung und Fordererweiterung getrennt führen. Kein Umschreiben des Quelljahrgangs und keine automatische Erweiterung auf alle Länder. |
| Materialbeleg | `evidence_refs[]`: anonyme Content-ID und Inhaltsrevision, PDF-Seite 1-basiert bzw. geeigneter Locator, Art des Belegs und Reichweite. Gedruckte Seitenzählung, PDF-Seite und Readerposition nicht vermischen. Bei Audio Zeitbereich, bei Dokumenten Abschnitt, bei dynamischem Reader nachvollziehbarer privater Positionsanker. |
| Lehrplanbezug | `curriculum_links[]` mit Behörde, amtlicher URL, Land, Schulweg, Fach, Jahrgangsband, konkretem Lernbereich/Fundstelle, Dokument-/Onlinefassung, Inkrafttreten/Kohorte soweit relevant und Prüfumfang. Pro Beziehung erklären, welche beobachtbare Handlung zum bezeichneten Ausschnitt passt. |
| Fachliche Verwendung | `learning_goal`, `observable_action`, `prerequisites`, `representation`, `support`, `extension`, `assessment_scope`; bei Aufgaben zusätzlich Schlüssel-/Rubrik- und Bild-/Audioabhängigkeiten. Eine allgemeine Methodenseite hat nicht zwingend einen einzelnen jahrgangsscharfen Lehrplancode. |
| Prüfstand | Zuordnung, Quellenzugang, Fassung/Geltung, Inhalt, Lösung/Rubrik, notwendige Visuals/Audio und Transfer getrennt prüfen; Datum, Prüferrolle, konkrete geprüfte Revision und offene Punkte speichern. KI-Prüfung nicht als menschliche Fachfreigabe ausweisen. |
| Freigabe | `runtime_release` bleibt ausdrücklich false, bis die jeweils erforderlichen Daten-/Fach-/Produktgates dokumentiert erfüllt sind. „Gelesen“, „konzeptverträglich“ oder ein einzelnes verified-Feld reichen nicht. |

### Belegte und geschätzte Jahrgänge

**Belegt:** Eine private Materialstelle nennt Klasse 4 für genau die betreffende Ressource. Dann `source_grades=[4]`, Basis explicit, Fundstelle dazu. Ein möglicherweise zugehöriges Buch erhält diesen Status nur mit eigenem passenden Beleg. Eine nicht ausreichend eng eingegrenzte Angabe gilt nicht pauschal für jede Seite.

**Geschätzt:** Ohne Jahrgangsangabe wird eine Ressource beispielsweise wegen ihrer konkreten Stellenwertanforderung und Leselast vorläufig einem Bereich zugeordnet. Der Bereich trägt Basis estimated und eine fachliche Begründung; er ist keine Herkunftsangabe und keine amtliche Vorgabe. Fehlen tragfähige Hinweise, bleibt der Bereich unbekannt statt großzügig „1–10“ einzutragen.

**Transfer:** Ein gesicherter Klasse-4-Kontext bleibt Klasse 4. Wiederaufnahme in einer späteren Lerngruppe erhält einen zusätzlichen Transferdatensatz mit tatsächlichem Bedarf, geeignetem altersangemessenem Kontext und neu geprüftem Ziel. Ein bayerisches Fachplanband 3/4 belegt nicht, dass eine im Material ausdrücklich als Klasse 4 bezeichnete Aufgabe bereits vollständig in Klasse 3 behandelt sein muss.

Die vorhandenen JSONL-Felder `grades`, `region` und `schoolType` sind ohne diese Trennung mehrdeutig. Bis zur Migration gelten sie im aktuellen Transferpaket als **gemeldeter Quellkontext**, nicht als bestätigte Einsatzfreigabe, individuelle Schülerstufe oder Länderstandard. Bestehende Inhalte werden in diesem Teilauftrag nicht umgeschrieben.

### Versions- und Prüfregeln

- Abrufdatum und Veröffentlichungs-/Fassungsdatum sind getrennte Felder. Eine URL und „abgerufen 2026“ sind keine geprüfte Fassung.
- Bei dynamischen amtlichen Seiten ohne ausgewiesene Versionsnummer wird die bezeichnete Onlinefassung mit Abrufdatum, überprüftem Abschnitt und internem Revisionsnachweis referenziert. Amtliche Fassung und Geltung bleiben unbekannt, wenn sie nicht belegbar sind; keine Versionsnummer erfinden.
- Nur Portal/KMK-Übersicht vorhanden: `orientation_only`. Konkreten Ausschnitt gelesen, Fassung noch unklar: `content_checked_validity_open`. Inhalt und einschlägige Geltung belegt: `mapping_checked` für diesen Ausschnitt und diese Quellrevision. Widerspruch: `conflict_open`; unzugängliche Quelle: `access_blocked`. Diese Zustände sind keine Laufzeitfreigaben.
- Zuordnung mehrerer Jahrgänge/Länder/Schulwege benötigt mehrere nachvollziehbare Beziehungen. Eine gültige Beziehung darf bestehen bleiben, wenn eine andere noch offen ist. Unabhängige Teilbereiche nicht pauschal sperren.
- Änderung von Aufgabenhandlung, erforderlichen Hilfen, Bildinformation, Lösung, Materialrevision oder Zielkontext löst eine erneute Prüfung der betroffenen Beziehungen aus. Unbeteiligte Zuordnungen bleiben erhalten.
- Ein vorhandenes Online-Material oder eine Lizenz ist kein fachlicher Richtigkeitsbeweis. Die zulässige Verwendung der privaten Quelle ist eine zusätzliche, getrennte Frage; diese Fachzuordnung erteilt keine Inhaltsrechte.

### Freigabe in Generierung und Profilen

Die Auswahl muss zu bestätigtem Unterrichtskontext und Lehrerauftrag passen. Fehlende Länder-/Schulwegdaten werden nicht durch Bayern/Mittelschule ersetzt. Die allgemeine Didaktik kann ohne konkreten Landesbezug verwendet werden; die Anzeige lautet dann entsprechend „ohne bestätigten Fachplanbezug“.

Bei materialbegrenzten Tests führt der Lehrplanabgleich keine ungelehrten zusätzlichen Inhalte ein. Generierung und Emmi-Prüfung bekommen denselben Quellen-/Regelstand. Bei notwendiger, aber fehlender Grafik oder ungeprüftem Schlüssel darf das betroffene Muster nicht als fertig bewertbare Aufgabe erscheinen.

Für ein späteres Schülerprofil zählt nur die tatsächlich beobachtete Handlung mit Aufgabe, Hilfen und Bewertungsstand. Bearbeitet, richtig beantwortet, erklärt, selbstständig und mit Unterstützung sind keine austauschbaren Zustände. Selbstbericht, Spielpunkte und Kalenderfortschritt sind keine gleichwertigen Kompetenzbelege.

## Prüfgrundlage für die 24 Vorschläge

Geprüft wurden die vollständigen 24 JSONL-Regeln und die Konzept-Ergänzung. Ihre Seitenanker wurden mit den vorhandenen privaten Seitenanalyse-Records abgeglichen; alle genannten Seiten sind dort vorhanden. Eigene zusammenfassende Seitenanalysen wurden für die Kontext- und Konfliktprüfung verwendet. Originalseiten und Bilder wurden in diesem Fachbeitrag nicht nochmals vollständig gelesen oder gerendert. Damit ist die Konzeptverträglichkeit geprüft, nicht jede ursprüngliche Bild-/Laut-/Lösungsaussage unabhängig neu validiert.

Quellenkürzel für die folgende Liste:

- **M** = anonyme Content-ID `8d468f417d811a7a`, gemeldeter Kontext Mathematik, Grundschule, Klasse 4, Bayern, 164 Kommentar-PDF-Seiten.
- **D** = `ea3d79400d5b5503`, gemeldeter Kontext Deutsch, Grundschule, Klasse 1, Bayern, 284 Kommentar-PDF-Seiten.
- **Z** = `6b47874d62ea10d8`, 22 Diagnose-PDF-Seiten; zusätzliche Klärung, kein drittes Fachmodell.

Seitenzahlen in der Liste sind PDF-Seiten. Alle Fundstellen sind privat auflösbar; der Text kopiert keine Originalaufgaben. Die Grundstruktur der Deutsch-Lernbereiche ist zusätzlich durch die [amtliche ISB-Fachseite](https://www.isb.bayern.de/schularten/grundschule/faecher/deutsch/) belegt. Das bestätigt weder die einzelnen Materialzuordnungen noch eine bestimmte Anfangsunterrichtsmethode.

### Prioritäten und Konzeptanker

- **P0:** vor Aufgabenbewertung bzw. diagnostischer Profilnutzung verbindlich konkretisieren; schützt vor falscher Aussage oder ungeeigneter Aufgabe.
- **P1:** bei der nächsten fachlichen Ausarbeitung in Aufgabenfamilien und Förderwege aufnehmen.
- **P2:** ergänzende Reflexion/Benutzerhilfe nach gesicherter fachlicher Grundlage.

Konzeptanker im [bestehenden Konzept](paedagogisches-konzept-gradecrew.md): **K1** Lernziele und Aufgabenplan; **K2** Lernziel und Lösbarkeit; **K3** Sprache und Zugang; **K4** Differenzierung und Varianten; **K5** Bewertung und Feedback; **K6** fachdidaktische Ergänzungen; **K7** Generierungs-/Prüfpfad; **K8** Daten und Nachweis. **B** bezeichnet zusätzlich die Belegzählung und Förderäste des Bruchpiloten; **S** den privaten Lernprofilentwurf. Diese Anker beziehen sich auf vorhandene Abschnittsüberschriften, nicht auf neue amtliche Standards.

## Priorisierte Übernahmeliste Mathematik

### 1 Denkanspruch ausdrücklich planen

`dt-cognitive-demand` · **P1 · übernehmen** · M: 8, 14 · K1/K6.

Voraussetzung: beobachtbares Lernziel und behandelter Inhalt. Förderung: an derselben mathematischen Struktur eine überschaubare Darstellung und einen erklärten Einstieg anbieten. Forderung: begründen, systematisch variieren oder eine Vermutung prüfen. Grenze: Zahlengröße, Textlänge und Aufgabenformat ersetzen keine Bestimmung der Denkhandlung. Amtliche Anforderungsbereiche nur bei passendem konkretem Bezug benennen; keine pauschale bundesweite Quote.

### 2 Voraussetzungen gezielt prüfen

`dt-prerequisite-diagnosis` · **P1 · präzisiert übernehmen** · M: 9, 10, 14 · K2/K4, B.

Voraussetzung: für das Ziel tatsächlich nötige Teilhandlung benennen. Förderung: nach einem Fehler eine begrenzte Klärungsaufgabe und eine passende Hilfe; danach neues Beispiel ohne die Hilfe. Forderung: bei tragfähigen Voraussetzungen eine neue Anforderung erhöhen. Grenze: Fehlantwort liefert eine Hypothese, keine gesicherte Ursache oder globale Rückstufung. Alternative Erklärung wie Wortschatz- oder Bedienproblem prüfen; bei anhaltender Unklarheit Lehrkraftklärung.

### 3 Handlung Bild und Symbol verbinden

`dt-representation-bridge` · **P1 · übernehmen** · M: 8, 11–13 · K2/K6, B02/B07.

Voraussetzung: gleiche Bezugsgröße und fachlich korrekte Darstellungen. Förderung: zwischen Handlung und Bild die entsprechende Zahl/Operation ausdrücklich zuordnen. Forderung: eine neue passende Darstellung selbst erzeugen und deren Übereinstimmung erklären. Grenze: Bildabzählen belegt nicht automatisch ein allgemeines symbolisches Verfahren; ein zweites Raster ist noch kein umfassender Darstellungswechsel. Fehlende Bildinformation nicht aus OCR ergänzen.

### 4 Gemeinsamen Kern differenzieren

`dt-same-core-differentiation` · **P1 · präzisiert übernehmen** · M: 9, 14 · K3/K4.

Voraussetzung: Kernziel sowie sprachliche und fachliche Nebenanforderungen festlegen. Förderung: Zugang erleichtern und genau dokumentieren, ob mathematisch vorgearbeitet wurde. Forderung: Begründung, neue Bedingung oder Verallgemeinerung bei erkennbarem Kern. Grenze: Eine vorgegebene Umformung kann den Zielumfang verkleinern. Solche Varianten sind nicht ohne Prüfung gleichwertige Leistungsnachweise.

### 5 Ergebnis und Strategie unterscheiden

`dt-strategy-evidence` · **P0 · übernehmen** · M: 9, 20 · K1/K5, B/S.

Voraussetzung: gewünschte Strategie-/Erklärungshandlung ausdrücklich im Auftrag und Schlüssel festlegen. Förderung: einen nachvollziehbaren Schritt erklären lassen, bei Bedarf mit Modell. Forderung: zwei gültige Wege vergleichen und eine Wahl begründen. Grenze: richtige Endzahl belegt nur ihren Ergebnisaspekt; Teilpunkte sind keine zusätzlichen unabhängigen Profilbelege. Nicht nachträglich unbestellte Erklärungen für volle Ergebnispunkte verlangen.

### 6 Gültige Rechenwege zulassen

`dt-multiple-valid-methods` · **P0 · übernehmen** · M: 10, 20 · K2/K5.

Voraussetzung: Ergebnisziel und gegebenenfalls ausdrücklich verlangtes Verfahren unterscheiden. Förderung: verständlichen passenden Weg zulassen und fachlichen Engpass dort unterstützen. Forderung: Effizienz oder Gültigkeit verschiedener Wege vergleichen. Grenze: Bei einem expliziten Verfahrensziel ersetzt ein anderes Verfahren den Verfahrensnachweis nicht; es kann den Ergebnisaspekt erfüllen. Bewertungsalternativen müssen im Schlüssel sichtbar sein.

### 7 Modellieren als Prozess prüfen

`dt-modelling-process` · **P1 · übernehmen** · M: 11, 56–57 · K1/K6.

Voraussetzung: lösbare Situation mit passenden Daten, Einheiten und erkennbarem Kontextziel. Förderung: Datenwahl oder Situationsskizze stützen, ohne den ganzen Ansatz vorzugeben. Forderung: unnötige Angaben erkennen, Annahmen vergleichen oder Grenzen des Modells begründen. Grenze: Rechenfehler, Datenwahl und Kontextdeutung getrennt auswerten; kein pauschales Defizit in allen Teilbereichen. Sprachhilfe darf den Modellierungsauftrag nicht unbemerkt lösen.

### 8 Visuelle Fachinformation erhalten

`dt-visual-information` · **P0 · übernehmen** · M: 11, 13, 112 · K2/K3/K7.

Voraussetzung: vollständige eigene Grafik mit Referenz, Einheiten, Skala und erforderlichen Beziehungen. Förderung: relevante Merkmale hervorheben, tatsächliche Hilfe protokollieren. Forderung: gleichwertige Darstellung erzeugen oder Informationen auf Widerspruch prüfen. Grenze: Bildschirmgröße ist keine reale Messskala; verdeckte oder perspektivische Information nicht erfinden. Ohne nötige Grafik ist ein Textprofil nicht vollständig aufgabenfähig.

### 9 Wiederaufnahme am Lernbedarf ausrichten

`dt-learning-evidence` · **P1 · übernehmen** · M: 9, 16–17 · K4/K5, B/S.

Voraussetzung: aktuelles Ziel, passende Beobachtungen und Unterrichtsfreigabe. Förderung: benötigte ältere Grundlage in neuer Aufgabe wiederaufnehmen und Hilfe abbauen. Forderung: nach beobachtetem Erfolg Transfer oder eine neue Anforderung anbieten. Grenze: Wochenplanfortschritt, erledigte Seiten und eine zeitliche Pause beweisen keine Kompetenz oder neue Aufgabenfamilie. Die Pilot-Schwellen sind weiterhin ungeprüfte Produktheuristiken.

### 10 Reflexion mit Arbeitsbelegen verbinden

`dt-reflective-evidence` · **P2 · übernehmen** · M: 15 · K5, S.

Voraussetzung: konkrete aktuelle Arbeit und eine verständliche Reflexionsfrage. Förderung: kurze Auswahl oder mündliche Rückschau mit Beispiel. Forderung: eigene Strategieentscheidung mit Arbeitsbeleg und nächstem Ziel begründen. Grenze: Selbsteinschätzung bleibt Selbstbericht; Gestaltung, private Mitteilung und sprachliche Gewandtheit eines Lerntagebuchs sind ohne entsprechendes Ziel keine Mathematiknote. Keine dauerhafte Speicherung persönlicher Reflexionstexte als Standard voraussetzen.

### 11 Bewertungsregeln begründen

`dt-assessment-context` · **P0 · übernehmen** · M: 14 · K4/K5.

Voraussetzung: Testzweck, Ziel, Hilfsmittel und Kriterien vorab festlegen. Förderung: Übungsvariante mit angepasster Hilfe, sichtbar anderem Unterstützungsstatus. Forderung: fachlich anspruchsvollere Variante mit eigener ausgewiesener Rubrik. Grenze: unterschiedliche Varianten sind erst nach Anspruchsprüfung vergleichbar. Keine quellenbezogene Notenkonvention allgemein verordnen oder Punkte mechanisch aus Teilaufgabenzahl ableiten.

### 12 Gedruckte Schlüssel prüfen

`dt-check-source-keys` · **P0 · präzisiert übernehmen** · M: 130, Quellenkonflikt in privater Analyse · K2/K7/K8.

Voraussetzung: vollständiger Auftrag samt nötigem Bild und eine eigene überprüfbare Lösung. Förderung: kleiner Gegenfall oder geordnete Ergebnistabelle macht einen Widerspruch verständlich. Forderung: allgemeines Argument zur Gültigkeit bzw. zum Gegenbeispiel. Grenze: Bis zur Klärung nur die betroffenen Schlüssel-/Musterableitungen sperren; nicht automatisch alle unabhängigen Buchinhalte oder jede allgemeine Didaktikregel. Diese Prüfung löst den dokumentierten Quellenkonflikt nicht selbst.

## Priorisierte Übernahmeliste Deutsch

### 13 Teilkompetenzen getrennt belegen

`GCPED-DID-20261021-13` · **P0 · übernehmen** · D: 58, 74, 275 · K1/K5/K6, B/S.

Voraussetzung: Wortschatz, Lautanalyse, Graphemwissen, Synthese, Sinnentnahme, Schreiben und Motorik als unterschiedliche Beobachtungen definieren. Förderung: genau den stockenden Schritt mit passender Hilfe unterstützen. Forderung: bekannte Teilhandlungen in einer neuen sinnvollen Lese-/Schreibsituation verbinden. Grenze: keine automatische Kaskade „Wort richtig → alle Unterkompetenzen sicher“. Mehrere Teilhandlungen einer angeleiteten Episode sind keine unabhängigen Wiederholungen desselben Zielaspekts.

### 14 Bildwortschatz vor Lautdiagnose klären

`GCPED-DID-20261021-14` · **P0 · präzisiert übernehmen** · D: 13, 35, 58 · K2/K3/K6.

Voraussetzung: bekannte oder ausdrücklich vereinbarte Bildbezeichnung; zulässige alternative Benennungen prüfen. Förderung: Bild benennen und Bedeutung klären, anschließend neue Lautaufgabe passend zum Ziel. Forderung: mehrdeutige Benennungen vergleichen und jeweilige Zielstelle erklären. Grenze: fehlendes Wort ist kein belegter Lautanalysefehler. Vorheriges Benennen kann selbst eine Hilfe sein; Wortschatz- und Lautnachweis bleiben getrennt. Die in der Quellenanalyse offene Lautkategorisierung nicht ungeprüft übernehmen.

### 15 Laut Zeichen und Silbe unterscheiden

`GCPED-DID-20261021-15` · **P0 · präzisiert übernehmen** · D: 13, 37, 47, 112, 191 · K2/K6/K7.

Voraussetzung: benannte Einheit, bekannte Zielwörter und fachlich geprüfte Aussprache-/Graphemzuordnung. Förderung: jeweils nur eine Einheit markieren oder legen und das verwendete Modell erklären. Forderung: dasselbe Wort nach verschiedenen ausdrücklich benannten Einheiten untersuchen. Grenze: Buchstabenanzahl, Grapheme, gesprochene Laute und Silben nicht gleichsetzen. Materialkonventionen und dialektale Varianten berücksichtigen; konkrete strittige Lautzuordnungen bis zur Fachklärung nicht als Auto-Schlüssel freigeben.

### 16 Synthese mit passender Lautung stützen

`GCPED-DID-20261021-16` · **P1 · präzisiert übernehmen** · D: 74, 75, 86, 89 · K3/K4/K6.

Voraussetzung: geprüfte Zielaussprache, bekannte Zeichen und für die Übung geeignete Lautfolge. Förderung: passende Übergangshilfe ohne zusätzliche Hilfsvokale; neue Wörter danach selbstständig lesen lassen. Forderung: andere sinnvolle Lautfolge und anschließende Sinnprüfung. Grenze: Plosive nicht künstlich als Dauertöne behandeln; Bildraten oder Wortanfang genügen nicht als vollständiges Lesen. Flüstern, Mikrofonqualität oder automatische Spracherkennung allein erlauben keine sichere Lautdiagnose. Konkrete Audios brauchen eigene Fachprüfung.

### 17 Schreiben als Prozess begleiten

`GCPED-DID-20261021-17` · **P1 · übernehmen** · D: 58, 59, 277 · K1/K4/K6.

Voraussetzung: klarer Schreibzweck, überschaubare Zielwörter und getrennte Beobachtung von Benennen, Gliedern, Zeichenwahl, Schreiben und Prüfen. Förderung: am stockenden Schritt helfen und Unterstützung später abbauen. Forderung: neue Schreibsituation mit eigener Kontrollentscheidung. Grenze: vorgelegte Buchstaben oder Abschreiben ersetzen nicht selbstständige Zeichenwahl; motorische Unterstützung kann Zugang ermöglichen, ohne dieselbe Leistung zu belegen. Ablaufzählung nicht als mehrere unabhängige Erfolge verrechnen.

### 18 Rechtschreibstrategie zur Zielstelle wählen

`GCPED-DID-20261021-18` · **P1 · präzisiert übernehmen** · D: 149, 175, 191, 192, 198 · K2/K5/K6.

Voraussetzung: konkrete orthografische Zielstelle und geprüfte Begründung. Förderung: passenden Strategieweg an begrenztem Wortmaterial zeigen, danach neues Wort prüfen. Forderung: zwischen Hören, Verlängern, Verwandtschaft und Merkwissen begründet wählen. Grenze: Lautvollständigkeit und Normschreibung getrennt bewerten; nicht jede Schreibung ist hörbar ableitbar. Die Seitenanker stützen den Transfergedanken, ersetzen aber keine vollständige Prüfung jeder konkreten Rechtschreibregel und Ausnahme.

### 19 Textbeleg und eigene Stellungnahme trennen

`GCPED-DID-20261021-19` · **P0 · übernehmen** · D: 112, 144, 220 · K2/K5/K6.

Voraussetzung: Textzugang, eindeutige Frageart und dazu passende Rubrik. Förderung: passende Textstelle suchen lassen oder Meinung in einfacher Form begründen. Forderung: zwei begründbare Deutungen mit ihren Belegen vergleichen. Grenze: Textinformation, Deutung, Fortsetzung und Meinung brauchen unterschiedliche Kriterien. Keine einzelne Mustermeinung erzwingen. Mündliche Antwort darf Ausdruck ermöglichen; bei einem Schreibziel ersetzt sie nicht den schriftlichen Nachweis.

### 20 Zugang und geprüfte Leistung sichtbar halten

`GCPED-DID-20261021-20` · **P0 · präzisiert übernehmen** · D: 205, 220, 231, 275 · K3/K4/K5, S.

Voraussetzung: Zielkompetenz und tatsächlich eingesetzte Hilfe festhalten. Förderung: Audio, Tandem, Bildstütze, gelegte Zeichen oder Diktieren gezielt nutzen. Forderung: Unterstützung bei einer neuen passenden Aufgabe schrittweise reduzieren oder andere zielpassende Anforderung erhöhen. Grenze: Vorlesen kann Textverständnis zugänglich machen, belegt aber kein selbstständiges Dekodieren; Diktieren prüft nicht dieselbe Schreibmotorik. Zugangshilfe und fachliche Vorwegnahme unterscheiden; vorgeschriebene individuelle Maßnahmen bleiben der konkreten Lehrkraftregelung zugeordnet.

### 21 Förderung als überprüfbaren Zyklus führen

`GCPED-DID-20261021-21` · **P1 · übernehmen** · D: 276–279 · K4/K5, B/S.

Voraussetzung: konkretes Ziel, vorhandene Stärke, Ausgangsbeobachtung und überschaubare Maßnahme. Förderung: passende Hilfe mit Datum und beobachteter Wirkung; nachfolgend neue Handlung prüfen. Forderung: bei Erfolg selbstständig einen erweiterten Kontext bearbeiten. Grenze: aus einer Einzelantwort keine dauerhafte Defizitzuschreibung und aus gleichzeitigem Erfolg keine bewiesene Methodenwirkung. Wenige notwendige Beobachtungen statt umfassender privater Prozessaufzeichnung speichern.

### 22 Erledigung von Kompetenz trennen

`GCPED-DID-20261021-22` · **P0 · übernehmen** · D: 275, 280, 281 · K5/K8, B/S.

Voraussetzung: Bearbeitungsstatus, Beobachtbarkeit, Ergebnis und Hilfe als getrennte Felder. Förderung: fehlende Beobachtung mit geeigneter neuer Gelegenheit klären, ohne falschen Misserfolg. Forderung: bei belegtem Erfolg eine neue passende Herausforderung. Grenze: unbeobachtet ist weder richtig noch falsch; ordinales Raster nicht als gemessenen Kompetenzprozentsatz ausgeben. Zugehörige Datums-/Hilfeangaben und voneinander abhängige Versuche erhalten.

### 23 Offene Sprachproduktion fair bewerten

`GCPED-DID-20261021-23` · **P0 · präzisiert übernehmen** · D: 205, 212, 231, 281 · K1/K3/K5/K6.

Voraussetzung: Kommunikationszweck und wenige beobachtbare Kriterien, getrennt nach Inhalt, Struktur, Ausdruck und ausdrücklich geprüfter Normschreibung. Förderung: fiktiver Anlass, Wortstützen oder mündliche Planung. Forderung: adressatenbezogene Überarbeitung oder begründete Textgestaltung. Grenze: Privatfotos, Familienerlebnisse oder persönliche Offenlegung nicht verlangen. Alternativen verändern gegebenenfalls den Nachweis: eine mündliche Erzählung ist kein vollständiger schriftlicher Textbeleg. Offene Qualität nicht durch exakten Textvergleich automatisch bewerten.

### 24 Anfangsmodelle fachlich begrenzen

`GCPED-DID-20261021-24` · **P0 · präzisiert übernehmen** · D: 104, 116, 121, 152, 195; ergänzende Diagnose Z: 12 · K2/K6/K7.

Voraussetzung: korrektes Zielmodell und benannter begrenzter Anwendungsbereich. Förderung: ein gültiger einfacher Fall mit nachvollziehbarer Probe. Forderung: passendes Gegenbeispiel untersuchen und Modellgrenze erklären, soweit unterrichtlich behandelt. Grenze: Einstiegshilfen nicht als ausnahmslose Grammatikgesetze formulieren; redaktionelle Laut-/Positionsverwechslungen vor Ableitung berichtigen. Die konkrete ß-Regel und ihre Bedingungen bleiben separat gegen die amtliche Regel zu prüfen; dieses Review bestätigt keine offene Einzelregel automatisch.

## Reihenfolge der Übernahme

1. **P0 in den fachlichen Prüfvertrag aufnehmen:** 5, 6, 8, 11–15, 19, 20, 22–24. Zuerst eindeutige Zielhandlung, gültige Darstellungen/Schlüssel und begrenzte Aussage sichern. Es sind 13 P0-Regeln.
2. **P1 in passende Aufgabenfamilien und Förderwege aufnehmen:** 1–4, 7, 9, 16–18, 21. Es sind 10 P1-Regeln; Förderung und Forderung bleiben situationsgebunden.
3. **P2 ergänzen:** 10. Reflexion bleibt von fachlichem Leistungsbeleg und persönlicher Offenlegung getrennt.

Diese Reihenfolge ist ein Vorschlag zur Konzeptpflege. Die zentrale Konzeptdatei, die 24 JSONL-Regeln und die Medienregister werden hier nicht verändert. Vor technischer Übernahme jede Regel um Voraussetzung, Bedingung, Unterstützung, Erweiterung, Bewertungsgrenze, Version und Prüfstatus ergänzen. Der vorhandene JSONL-Text allein ist noch kein vollständiger maschinell anwendbarer Regelvertrag.

## Offene amtliche Zuordnungen und konkrete nächste Arbeit

Für M sind der gemeldete Klasse-4-Kontext und für D der gemeldete Klasse-1-Kontext zunächst Materialherkunft. Eine konkrete amtliche Zuordnung der neuen Inhalte ist weiter offen. Die URLs [Mathematik Grundschule 3/4](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/4/mathematik) und [Deutsch Grundschule 1/2](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/deutsch) bleiben Kandidaten. Die direkten Abrufe dieses Fachbeitrags lieferten 403; amtliche Suchtreffer zu Teilen sind kein Ersatz für eine vollständige aktuelle Fassungs-/Geltungsprüfung. Die frühere Materialanalyse berichtete eine Wartungsseite; beide Abrufbefunde getrennt lassen. Die [ISB-Seite Deutsch](https://www.isb.bayern.de/schularten/grundschule/faecher/deutsch/) belegt die Fachstruktur, nicht die 24 konkreten Zuordnungen. Der direkte Abruf der [amtlichen Rechtschreibreferenz](https://grammis.ids-mannheim.de/rechtschreibung/6180) scheiterte hier mit Timeout; eine neue Detailabnahme der ß-Regel wird nicht behauptet.

**Genau nächster Schritt für den Material-Owner:** Den Vertrag zunächst an einem anonymen Buchdatensatz mit getrennten Kommentar-/Diagnoseressourcen anwenden. Quelljahrgang, eventuelle Schätzung und Transfer gesondert eintragen, dann die passende amtliche Fachplanfassung und konkrete Handlungsfundstelle belegen. Bei weiter fehlendem Zugang bleibt der Lehrplanstatus offen; private Analyse und allgemeine Konzeptpflege können weitergehen. Danach erst auf weitere Ressourcen ausrollen. Eine einzelne ausgefüllte Buch-/Ressourcenbeziehung beweist keinen vollständigen Bestand.

## Koordinationsnachweis und Arbeitsgrenzen

Arbeitsgrundlage am 21.10.2026 frisch von main gelesen: START_HERE `85c5de38`, AGENTS `810d3e3b`, CHAT_CONTRACT `a39d166b`, STATE `886db33d`, TODO `c13a6b84`, Registry `f654c0f1`, Workstreams-README `c14206a7`; CHAT_RECOVERY zusätzlich gelesen. Jüngster bei Abfrage gefundener abgeschlossener Development-Statuslauf `39679076517` war erfolgreich auf `4ad62e4b70b19686f991ff7a9bbdd09e484b85fe`. Das ist Koordinationsevidenz, keine Prüfung dieses neuen Dokuments oder eine Produktfreigabe.

PR208 ist offen, Head `60cfc7e230fd517d607bd10fe2056336010d6a61`, Ziel main. PR214 ist offen, Head `edcd5695cdca9979ba734970bad2856dadb59e06`, Ziel main. Beide unverändert. Der ältere Pool-PR218 ist laut frischer STATE-/TODO-Lektüre inzwischen auf kanonischem Staging berücksichtigt; die alten lokalen Aussagen „noch nicht live“ dürfen nicht pauschal darauf übertragen werden. Das belegt keine Übernahme dieser 24 neuen Regeln oder des Schülergedächtnis-Entwurfs.

Geschrieben wird ausschließlich diese eigene Beitragsdatei. Gemeinsame TODO-/Handoffdateien, Register, Originale, Produktcode und PRs bleiben unverändert. Keine Browserdownloads, Agentenstarts, Produkt-/Gerätetests, bezahlten Modellgenerierungen oder Deployments. Fachliche Einordnung als bereichsübergreifender Review: vorgesehene Projektwahl Sol/medium; tatsächliches Runtime-Modell, Aufwand und Nutzungsdaten unbekannt. Der spezifische Teilauftrag ist der Dokumentnachweis; das Materialteam holt ihn im bestehenden Chat ab. Eine Rücknachricht an andere Chats wurde nicht versandt.

### Dokumentprüfung dieses Beitrags

Alle 24 JSONL-IDs sind genau einmal in der Einzelbewertung vertreten; Prioritäten: 13 P0, 10 P1, 1 P2. Lokale Dokumentlinks und die Existenz der angegebenen Seitenanker kontrolliert. Keine Produktfunktion oder Originalseiten-Neuvalidierung daraus abgeleitet. Eingangsstände vor Übernahme erneut vergleichen, wenn das Materialteam weiterarbeitet. SHA-256 der gelesenen Arbeitsgrundlagen:

- `materialdidaktik-ergaenzung-20261021.md`: `bc5080ec92624bcea29a9570bb88a5ef310a31b07a920bce9810330cba366adc`.
- `paedagogisches-konzept-gradecrew.md`: `2d0152d8d3307afa924106fcb2166a60eadf726d1910c5491e35264ccf6a73d8`.
- `brueche-by-ms-56-kompetenzkarte-und-pilotplan-2026-10-16.md`: `608456271354c251a9aa58579db81dd3c029311dda21240f116e33ed279b63a0`.
- `media/didaktik-transfer-20261021.jsonl`: `0d0f941a4076e289d28e8853d980a101aa9608f656c73cc02f8baf5e5a612ca8`.
