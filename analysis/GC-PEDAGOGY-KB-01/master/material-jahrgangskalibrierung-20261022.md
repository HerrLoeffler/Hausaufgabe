# Jahrgangskalibrierung der Materialmetadaten

GC-PEDAGOGY-KB-01 · 22.10.2026 · unabhängiger fachlicher Gegenabgleich durch **GC · Pädagogisches Konzept**, Chat `01a1280a-c9f4-73a3-a12a-7b2b93a5ba5a`.

## Ergebnis und Reichweite

Die neun Metadatensätze sind einzeln gegen den [gemeinsamen Zuordnungsvertrag](material-zuordnung-konzeptbeitrag-2026-10-21.md), vorhandene private Seitenanalysen und ausgewählte bereits vorhandene Bildbelege geprüft. Die Trennung von explizit, geschätzt und unbekannt ist überwiegend angemessen. Zwei Unterscheidungen müssen vor belastbarer Auswahl erhalten bleiben: Quelljahrgang ist nicht geschätzter Einsatzjahrgang; Zielgruppe eines Lehrerkommentars ist nicht die Lerngruppe, auf die er sich bezieht.

**Wesentlicher neuer Quellenbefund:** Die bearbeitbare Planung enthält im extrahierten Fußbereich doch einen Hinweis auf Bayern und das erste Schuljahr. Daneben steht eine abweichende Vorlagen-/Materialkennzeichnung. Die bisherigen negativen Aussagen „keine Landesangabe im normalisierten Text“ und „keine explizite Jahrgangsangabe“ sind daher zu korrigieren. Aus diesem einzelnen, widersprüchlich eingebetteten Fußbereich folgt noch keine sichere Zuordnung der gesamten Datei. Einzelheiten und notwendige Klärung stehen unten.

Die Vorschläge hier ergänzen `estimated_use_range`, Voraussetzungen und mögliche Bildungswege. Sie schreiben keine Medienregister, Datenbank oder vorhandenen Metadaten um. Keine neue vollständige Buchanalyse, keine Prüfung der parallel bearbeiteten 734 Seiten und keine menschliche Fachfreigabe. Die gemeldeten 20 Readerkontrolltests und ein gesichertes R115-Seitenbild belegen nicht automatisch einen bestandenen Gesamtpilot.

## Geprüfte Arbeitsgrundlagen

- `media/reader-resource-metadata-validated-20261022.jsonl`: neun Datensätze, einschließlich konkreter Frontmatter-/Abschnittsbelege.
- Begleitende `.md`-Datei mit Verfahren und Grenzen.
- Private Diagnose-Seitenanalysen zu `6b47874d62ea10d8`, PDF1–22; Metadaten-Frontmatter bezieht sich dagegen nur auf PDF1–10. Beide Umfänge nicht vermischen.
- Vorhandene Kommentar-Seitenanalyse zu `8d468f417d811a7a`, insbesondere PDF22, und bisherige Kontextbelege.
- Vorhandene R115-Originalabbildung, gedruckte Seite8, visuell gegengelesen; vorhandener privater Korrekturbeleg zum Wechsel vom behaupteten Kommentar zum tatsächlich angebotenen Hauptbuchbild.
- Vorhandenes Coverbild der Ressource `b0992c0ad3b74948` visuell gegengelesen.
- Bearbeitbare Planung `36bb6b3ddebc5d8e` nochmals ausschließlich für Metadatenanker normalisiert: Anfangstabelle und End-/Fußbereich, keine inhaltliche Vollanalyse der Planungszeilen. Original unverändert; Umwandlung nur im Arbeitsspeicher.

Originale, Bilder, genaue private URLs, Aufgaben und bibliografische Angaben werden nicht in diesen Beitrag kopiert. Ressourcen sind über anonyme Content-IDs identifizierbar. Die Lektüre der fremden Metadatensätze ist eine unabhängige KI-Gegenprüfung; nicht alle darin genannten Originalseiten wurden hier erneut geöffnet. Bestätigungen werden entsprechend auf ihren tatsächlichen Prüfpfad begrenzt.

## Vier Ebenen der Zielgruppenangabe

1. **Unmittelbare Nutzer:** Lehrkräfte, Lernende oder beide. Ein Stoffverteilungsplan ist zunächst ein Lehrkraftwerkzeug.
2. **Quelljahrgang:** im Material selbst ausdrücklich benannter Jahrgang beziehungsweise nachvollziehbar belegter Ressourcenkontext.
3. **Geschätzter Einsatzbereich:** eigene fachliche Hypothese zu bestimmten Handlungen oder Aufgabenabschnitten, mit Voraussetzungen und Unsicherheit.
4. **Transfer:** gesonderte Wiederaufnahme oder Erweiterung außerhalb des belegten Kontexts, mit Anpassung und eigener Freigabe.

Die Felder `source_year.copyright_year` und `print_year` bezeichnen Publikations-/Druckjahre. Sie sind weder Klassenstufe noch Gültigkeitsjahr des Lehrplans. Dateierstellungszeit und ein Druckvermerk ersetzen keine solche Angabe.

Der Vertrag vom21.10. lässt `basis=estimated` in älteren Quelljahrgangsobjekten zu. Das darf ausschließlich eine unbestätigte historische Einschätzung kennzeichnen. Für eine eindeutige nachfolgende Auswahl werden solche Einschätzungen in `estimated_use_range` geführt und **nicht als bestätigte `source_grades` gelesen**. Die im nächsten Abschnitt vorgeschlagenen Bereinigungen sind Empfehlungen an den schreibenden Material-Owner, keine parallelen Registeränderungen.

## Einzelbewertung der neun Ressourcen

Die geschätzten Bereiche sind pädagogische Arbeitshypothesen, keine amtlich festgelegten Stoffverteilungen und keine Aussage zur Eignung jeder einzelnen Seite. Bei mehreren Kontexten wird je Kontext eine eigene Zuordnung gebraucht. Das Feld `runtime_release` bleibt für diese neue Kalibrierung false.

| Content-ID und Rolle | Bewertung der Quellangaben | Konkrete Ergänzung zum Einsatzbereich | Voraussetzungen und Bildungswege |
|---|---|---|---|
| `ea3d79400d5b5503` · Lehrerkommentar | Klasse1 und Bayern sind durch die zitierten Eigenangaben plausibel belegt: insbesondere PDF7 beschreibt die Begleitung durch das erste Schuljahr. Grundschule als geschätzte Schulart ist angemessen, solange ein ausdrücklicher Etikettbeleg fehlt. Kein Jahrgangswechsel nötig. | Lehrkraftmaterial für Schriftspracherwerb im Jahrgang1; einzelne Handlungen können im Bereich1/2 verwendet werden, aber nur mit Abschnittsbezug. `[1,2]` ist ein geschätzter Einsatz, keine neue Quellangabe. | Bekannte Bildwörter, passende Zeichen-/Lautkenntnisse und zur Aufgabe passende Lese-/Schreibvoraussetzungen getrennt prüfen. Grundschul-Eingangsbereich als geschätzter Zielweg; ältere Fördergruppen nur mit neuem Transferdatensatz und altersangemessener Gestaltung. |
| `6b47874d62ea10d8` · Diagnosepaket22Seiten | Unbekannter Quelljahrgang, unbekannte Schulart und unbekanntes Land sind korrekt. Aus Aufgabeninhalt und R001-Zusammenstellung dürfen keine expliziten Provenienzfelder entstehen. | `[1,2]` als primärer geschätzter Einsatz für ausgewählte Schriftspracherwerbs-/Beobachtungsaufgaben. **Keine pauschale Eignung aller22Seiten für den Schulbeginn.** Orthografie-/Sprachreflexionsabschnitte erst nach Einführung ihrer konkreten Inhalte; spätere Förderwiederaufnahme getrennt. | Bildwortschatz, zugelassene Sprach-/Orthografievariante, bekannte Grapheme, Lesesynthese oder Morphologie je Teilaufgabe. Grundschule/Eingangsbereich ist ein geschätzter Zielweg, keine belegte Herkunft. Kein Zwang zu vollständigem Eingangstest. Siehe differenzierte Teilbereiche unten. |
| `355f8ec214bd88bd` · Arbeitsheft mit Lösungen | Klasse1 ist durch den zitierten Einleitungstext PDF3 deutlich stärker belegt als durch eine alleinstehende Zahl auf dem Cover. Bayern ist am Cover belegt. Geschätzte Schulart und offenes Publikationsjahr beibehalten. | Primär Klasse1. Einzelne Wiederaufnahme im Bereich1/2 erst nach Zuordnung der konkreten Aufgabe; nicht alle Lösungen als geprüft behandeln. | Eingeführte Zeichen, zugängliche Anweisung, benötigte motorische Handlung. Grundschule als geschätzter Zielkontext; Lösungsteil ist eine eigene Ressourcenrolle und kein unabhängiger Lernbeleg. |
| `b0992c0ad3b74948` · Kopiervorlagen | Das gegengelesene Cover trägt eine Kennzahl1 in einem Fibelkontext und Bayern. Der Jahrgang1 ist damit gut als **Zielgruppenkandidat** begründet. Die zitierte Coverstelle bezeichnet jedoch nicht wörtlich „erste Klasse“; eine Ressourcen-/Stufenzahl und ein ausdrücklich benannter Schuljahrgang sollten im Nachweis unterscheidbar bleiben. | Primär Jahrgang1 als fachlich geschätzter Einsatz; selektiver Einsatz1/2 nach Inhalt. Soll `source_grades=[1]` als bestätigt bleiben, die belegte Bedeutung der Coverkennzahl für diese konkrete Ressource oder eine zusätzliche Eigenangabe anführen. Keine automatische Übertragung vom Nachbarkommentar. | Je Vorlage benötigte Laut-, Lese-, Schreib- oder Sprachreflexionshandlung; keine Behauptung, jede Vorlage sei ab dem ersten Schultag geeignet. Grundschule weiterhin geschätzt. |
| `2956ad5d9a7b5d3f` · Lautkarten | Keine eigene Klassen-/Schulart-/Landesangabe aus den geprüften Stellen nachgewiesen: unknown bleibt richtig. Ein Druckjahr oder gemeinsame Gestaltung ändert das nicht. | `[1,2]` als geschätzter primärer Einsatz für ausgewählte Laut-/Zeichenzuordnungen. **Kein starrer Mindestjahrgang und kein Nachweis einer vollständigen Lesediagnose.** Einzelne vorbereitende Nutzung vorKlasse1 nur separat und pädagogisch begründet; kein allgemeines Vorschulprogramm ableiten. | Bekannte Bildbezeichnungen; zielsprachliche Aussprache; klare Unterscheidung von Laut, Buchstabe, Graphem und Silbe. Zielweg Grundschule/Eingangsbereich geschätzt. Für ältere Alphabetisierungslernende oder DaZ nur bei tatsächlich entsprechendem Lernziel, nicht aus Alter, Herkunft oder DaZ-Zugehörigkeit allein. |
| `1238532f17dc6ece` · PlanungPDF | Der zitierte Header PDF2 nennt erstes Schuljahr/Bayern ausdrücklich; das ist ein tragfähigerer Jahrgangsbeleg als der Lehrplanverweis D1/2 allein. Schulart geschätzt und Editionsjahr offen lassen. | Direkte Zielgruppe Lehrkräfte; Planungsrahmen Klasse1. Der zitierte Fachplanbereich1/2 ist kein Beleg, dass die ganze Jahresplanung für Klasse2 ausgearbeitet ist. Andere Jahrgänge nur durch angepasste Teilplanung. | Eigener Unterrichtsstand, Materialzugang, tatsächlich geltende Vorgaben und Freigaben; keine Aussage über individuelle Beherrschung aus dem Wochenplan. |
| `36bb6b3ddebc5d8e` · bearbeitbare Planung | **Korrektur erforderlich:** Im End-/Fußbereich existieren Hinweise auf Bayern und erstes Schuljahr; die bisherige Aussage, im gesamten normalisierten Text fehle dies, ist zu weit. Gleichzeitig widersprüchliche Vorlagenkennzeichnung. Erst nach Layout-/Konsistenzklärung eine vollständige Provenienzbestätigung. | Bis dahin `source_grades` nicht bestätigt, Kandidat1 mit `conflict_open`; `estimated_use_range=[1]` für die als Anfangsplanung erkennbaren Abschnitte. D1/2 als zitierter Lehrplanbezug separat, nicht als Quellklasse2. Unterschiedliche Kopf-/Fußangaben nicht durch großzügiges `[1,2]` zusammenziehen. | Lehrkraftmaterial. Zielweg Grundschul-Eingangsunterricht geschätzt; Unterrichtsplanung gegen reale Lerngruppe und bestätigte Vorgaben anpassen. Keine automatische Gleichsetzung mit der PDF-Planung ohne belegte Fassungs-/Abschnittsentsprechung. Details unten. |
| `720e4887cc0f6bd8` · Lautbild | Fachlich als deutsches Laut-/Schriftmaterial eingeordnet; Jahrgang, Schulart, Land und Jahr bleiben ohne eigenen Beleg unbekannt. Die Metadatenbewertung dazu ist angemessen; das Bild wurde hier nicht erneut vollständig fachlich validiert. | `[1,2]` als geschätzter Einsatz für eine geeignete ausgewählte Zeichen-/Bildzuordnung. Ein einzelnes Bild ist kein gesamter Kurs oder vollständiger Aufgabenschlüssel. | Sichtbare Zeichen/Bilder müssen verfügbar und zugänglich sein; Bildwörter vorab klären, fachliche Zuordnungen prüfen. Gleiche Transferbedingungen wie Lautkarten; keine automatische Länderübertragung. |
| `6e9af45c5c640631` · Mathematik-Lehrkraftmaterial | Quellenangaben für Mathematik, Bayern, Grundschule und erstes Schuljahr sind durch die zitierten Stellen nachvollziehbar begründet. Klasse1 wird nicht allein aus Band1 abgeleitet, sondern auch aus dem Inhaltsverzeichnis. Druckjahr2021 nicht als Lehrplanfassung oder Copyrightjahr behandeln. | Lehrkraftkontext Klasse1. Zu einzelnen Voraussetzungen/Zahlenräumen und späteren Wiederaufnahmen erst nach den getrennten Inhaltsprüfungen präzisieren; keine pauschale1/2-Ausweitung des ganzen369-Seitenpakets. | Zu den konkreten Aufgaben gehörige Mengen-, Zahl-, Operations-, Raum-/Größenvorstellungen und zugängliche Sprache. Grundschule ist hier quellenbelegt. Gegenwärtig laufende Seitenanalysen nicht als bereits abgeschlossen übernehmen. |

## Diagnosepaket ohne eigene Klassenangabe

`6b47874d62ea10d8` enthält unterschiedliche **Handlungsgruppen**, keine nachgewiesene amtliche Jahrgangsfolge. Der folgende Abschnitt greift die vorhandenen privaten Seitenbelege auf; er ist kein neuer vollständiger Aufgabenschlüssel.

| Teilbereich und vorhandener PDF-Anker | Geeignete Einsatzhypothese | Vorher zu klärende Voraussetzung und Aussagegrenze |
|---|---|---|
| Freie Schriftprobe, Bild-/Anlaut-/Silbenaufgaben: PDF1–2 und ausgewählte Teile4–7 | Anfangsunterricht, insbesondere Klasse1; ausgewählte Handlungen in Klasse2 wiederaufnehmen | Freie Schriftprobe darf auch ohne beherrschte Normschreibung stattfinden. Für Bildlautaufgaben muss das Bildwort bekannt sein. Kein globaler Misserfolg aus unbekanntem Wort oder fehlender Motorik. |
| Brief und weitere freie Produktion: PDF3, verwandte Teile | Klasse1/2 nach tatsächlicher Schreibgelegenheit; offene Produktion kann vorhandenes Können sichtbar machen | Kommunikationszweck und akzeptierte Antwortform festlegen. Normorthografie nur beurteilen, soweit ausdrücklich Ziel und unterrichtlich eingeführt. Keine fixe Musterantwort. |
| Wort-/Satzlesen, Zeichenfolgen und schriftliche Sprachreflexion: PDF7–11,13–15 | Im Verlauf des Schriftspracherwerbs, geschätzt Klasse1/2 bei passenden Voraussetzungen | Bekannte Grapheme, Synthese und erforderliche Wort-/Satzbedeutung. Such-/Farb-/Symbolleistung ist nicht identisch mit Lesen; unbekannte Konvention erst erklären. |
| Spezifische Rechtschreibstrategien und grammatische Teilfragen: insbesondere PDF10–12 und16, außerdem Teile8–9,13,15 | **Keine pauschale Eingangsnorm.** Selektiv nach Einführung; spätere Wiederaufnahme beispielsweise in Klasse3/4 nur als gesonderter Transfer | Konkrete Zielstelle, Strategie, Sprachvariante und Rubrik prüfen. Die geschätzten Jahreszahlen ersetzen keine Lehrplanfundstelle. Dokumentierte offene Laut-/Regel-/Kontextfragen vor automatischer Bewertung klären. |
| Beobachtungs- und Förderverläufe, Reflexion: PDF17–22 | In erster Linie Lehrkraft-/Reflexionswerkzeug im gewählten Unterrichtskontext, kein eigenständiger jahrgangsscharfer Leistungstest | Aufgabenanlass, Datum, Unterstützung und Ressourcen dokumentieren. Mündliche/diktierte Reflexion möglich; deren Schreibmotorik ist dann nicht geprüft. Bearbeitet, beobachtet und selbstständig gelungen trennen. |

**Konkreter Eintragsvorschlag:** `estimated_use_range` für den Diagnosekern nennt die Jahrgänge1/2, eine auf die genannten Teilbereiche begrenzte Reichweite und den Status `pedagogical_estimate_not_curriculum_mapping`. Die Orthografie-/Grammatikabschnitte erhalten zusätzliche Voraussetzungstags statt eines aus der Materialnachbarschaft erfundenen Klasse1-Quellbelegs. Eine Lehrkraft kann sie später verwenden, ohne dadurch den Quelljahrgang zu verändern. Für weitere Bildungswege werden einzelne Aufgaben neu zugeordnet, nicht das gesamte Paket als universell geeignet eingestuft.

## Lautkarten und einzelnes Lautbild

Für `2956ad5d9a7b5d3f` und `720e4887cc0f6bd8` sind die zentralen unknown-Felder richtig. Die Verwendungssprache Deutsch belegt kein bestimmtes Land. Ein Bildwort kann in verschiedenen Sprachvarianten anders benannt oder ausgesprochen werden; die Zielbezeichnung gehört zum Auftrag, wenn Lautanalyse statt Wortschatz geprüft werden soll.

Für die geschätzte Eingangsverwendung sind mindestens zu speichern:

- `learning_goal`: je Aufgabe genau eine ausgewählte Handlung, etwa einen bekannten Laut einer passenden Schreibung zuordnen; nicht pauschal „Lesen kann das Kind“.
- `prerequisites`: bekannte Bildbezeichnung, passender Hör-/Sehzugang, vereinbarte Zielaussprache und nötige Zeichenkenntnis. Unbekannte Zeichen können Gegenstand einer Einführung sein; daraus entsteht noch kein selbstständiger Leistungsbeleg.
- `support`: benanntes Bild, größere Darstellung, reduzierte Auswahl oder Modellierung; fachlich vorwegnehmende Hilfe getrennt von Zugangserleichterung.
- `transfer_targets`: ältere Lernende nur mit entsprechendem tatsächlich beobachtetem Bedarf und altersangemessenem Material. Weder Förderschulzuordnung noch Bedarf aus DaZ, Herkunft, Behinderung oder einem einzigen Fehler ableiten.
- `limits`: ungeprüfte konkrete Laut-/Graphemzuordnungen, fehlende Audios und mehrdeutige Bilder bleiben aufgabenbezogen offen. Keine vollständige Lautdiagnose aus bloßem Bild-/Kartentreffer.

## Neuer Befund zur bearbeitbaren Planung

Die erneute Metadatenlesung des unveränderten Originals `36bb6b3ddebc5d8e` mit `textutil -convert txt -stdout` zeigt:

- Am Anfang stehen eine erste Unterrichtseinheit, deutsche Lernbereiche und eine Lehrplanreferenz1/2.
- Nahe dem Ende des normalisierten Textstroms stehen **Bayern** und **erstes Schuljahr**. Die Stellen liegen ungefähr an Zeichen109412 beziehungsweise109419 eines109654Zeichen langen Textstroms dieses Konvertierungslaufs. Diese Offsets sind Hilfen zur Wiederfindung in genau dieser Normalisierung, keine Originalseitenzahlen und keine stabilen Primäranker.
- Daneben stehen eine abweichende Vorlagenkennzeichnung mit Ziffer2 und nicht aufgelöste Seiten-/Gesamtseitenfelder. Das kann ein Vorlagenrest sein; welche Inhalte die Fußzeile tatsächlich beschreibt, ist ohne passende Layout-/Fassungsprüfung offen. Die Ziffer2 wird ausdrücklich **nicht** als neu bewiesene Klasse2 ausgegeben.

Daher zwei getrennte Korrekturen an den Metadaten empfehlen:

1. Die Aussage „keine Landes-/Jahrgangsangabe im gesamten normalisierten Text“ zurücknehmen. Ersatz: „Keine eindeutige Zuordnung der gesamten Datei; Fußbereich nennt Bayern/erstes Schuljahr bei widersprüchlicher Vorlagenkennzeichnung.“
2. Quelljahrgang/Land bis zur Auflösung nicht als vollständig bestätigt auswählen; die positive Quellbehauptung als `candidate_evidence` mit Konflikt erhalten. `estimated_use_range=[1]` bleibt für die erkennbaren Anfangsplanungsabschnitte plausibel. Ein bloßes `source_grades.values=[1], basis=estimated` darf in einer späteren Such-/Generatoransicht nicht als Quellenfakt erscheinen.

Nächste begrenzte Klärung ist ein privater, layoutgetreuer Blick auf den ursprünglichen Kopf-/Fußbereich oder ein belegter Fassungsabgleich mit der PDF-Planung. Keine neue Gesamtauswertung aller Tabellen nötig. Dateimetadatum2014 wird weiterhin nicht zum Publikationsjahr.

## R115 Hauptbuchseite8 und KommentarPDF22

Die vorhandene Originalabbildung wurde gegengelesen. Sie zeigt Multiplikation im Zahlenraum bis1000, verschiedene halbschriftliche Zerlegungswege, Aufgabenmuster und sprachlich formulierte Rechenaufträge. Die gedruckte Seitenzahl ist8. Der untere didaktische Hinweis bezeichnet die verwendeten Strategien als Wiederaufnahme aus Klasse3. **Das ist ein Hinweis auf vorausgesetztes Vorwissen, keine ausdrückliche Behauptung, das gesamte Buch stamme aus Klasse3.**

Die vorhandene Kommentar-Seitenanalyse `8d468f417d811a7a`, PDF22, beschreibt den zugehörigen Strategiebereich. Damit sind zwei verschiedene Ressourcen/Fundstellen zu führen:

| Rolle | Genaue Fundstelle und Reichweite |
|---|---|
| Schüler-/Hauptbuchabbildung | R115, gedruckte Hauptbuchseite8; vorhandene private PNG-Abbildung, SHA-256 `0013cff36fb3ae6f7ef8de9c6a983bc9b336e0fc286e48036b56d5ff6ffba093`. Keine PDF-Seite8 daraus erfinden. |
| Lehrerkommentar | Content-ID `8d468f417d811a7a`, Kommentar-PDF22; eigener Inhalts-/Analysebeleg. Die Bilddatei ist nicht der Kommentar. |
| Kontext Klasse4/Grundschule/Bayern | Bisherige Reader-/Kommentarzuordnung als Kontextbeleg anführen und die Beziehung zum tatsächlich angebotenen Hauptbuchbild dokumentieren. Die einzelne PNG trägt nicht selbst eine explizite Landes-/Schulart-/Klasse4-Zeile. Gleiche Browsergruppe oder ähnliche Illustration allein genügt dafür nicht. |

**Quellzuordnung:** Der bestehende Klasse4-Kontext darf als über den belegten Ressourcenverbund gestützte Angabe erhalten bleiben; seine Herkunft muss als Kontextbeleg erkennbar sein. Die diesmal unabhängig betrachtete PNG bestätigt den mathematischen Inhalt und die gedruckte Seite, nicht allein die vollständige Buchidentität. Wenn die Verbundbeziehung noch nicht hinreichend belegt ist, bleibt genau diese Beziehung offen und Klasse4 nur der dokumentierte Kontextkandidat.

**Geschätzter Einsatz:** Primär Wiederaufnahme am Beginn von Klasse4. Selektiver Einsatz gegen Ende von Klasse3 ist fachlich plausibel, sobald Einmaleins, Stellenwert, additive Zerlegung und der benötigte Zahlenraum behandelt sind; das ist ein eigener geschätzter Einsatz `[3,4]` für diese Seite, keine neue explizite Quellklasse3. Keine amtliche Reihenfolge oder Eignung aller Randaufgaben daraus behaupten.

**Förderweg:** Benötigte Grundaufgabe und Stellenwertbeziehung gezielt klären, anschließend einen Zerlegungsweg mit passender Darstellung erläutern, danach ein neues Beispiel ohne vorgerechnete Teilprodukte. Eine vorgedruckte Zerlegung belegt keinen frei entwickelten Lösungsweg.

**Forderweg:** Zwei gültige Strategien vergleichen, Veränderung in einer Aufgabenreihe begründen oder ein eigenes passendes Rechenmuster erzeugen. Nicht allein Zahlen vergrößern. Ergebnis, Erklärung, Sprachlast und gegebenenfalls Unterstützung getrennt bewerten.

**Bildungswege:** Geschätzter Zielkontext Grundschule, Klasse3/4. Wiederaufnahme beispielsweise in SekundarstufeI oder einem passenden Förderangebot nur mit gesondertem Bedarf, altersangemessener Darstellung und neuem Ziel-/Kontextabgleich. Das macht diese Ressource nicht automatisch zum Mittelschul-, Realschul- oder Gymnasialmaterial. Die gedruckte Seite8 ist ein Einzelbeleg, kein Nachweis für ein vollständig gelesenes Hauptbuch.

## Kompakte Ergänzungen für den Material-Owner

Die folgenden Objekte sind fachliche Vorschläge, keine bereits angewendeten DB-/Registeränderungen. Feldnamen ergänzen den gemeinsamen Vertrag; ein bestehender Validator muss sie vor einer technischen Übernahme ausdrücklich unterstützen. Nicht blind als Patch ausführen.

```json
[
  {
    "content_id": "6b47874d62ea10d8",
    "source_grades": {"values": [], "basis": "unknown"},
    "estimated_use_range": {
      "grades": [1, 2],
      "status": "pedagogical_estimate_not_curriculum_mapping",
      "scope": "ausgewählte Schriftspracherwerbs- und Beobachtungsaufgaben; keine vollständige Eingangsnorm",
      "target_education_path": "Grundschule/Eingangsbereich, geschätzt",
      "prerequisites": ["passende Bildbezeichnung", "aufgabenspezifische Graphem-/Lese-/Schreibvoraussetzungen"],
      "exclusions": ["spezifische Orthografie und Grammatik nicht ungeprüft am Schulbeginn einsetzen"]
    },
    "runtime_release": false
  },
  {
    "content_id": "2956ad5d9a7b5d3f",
    "source_grades": {"values": [], "basis": "unknown"},
    "estimated_use_range": {
      "grades": [1, 2],
      "status": "pedagogical_estimate_not_curriculum_mapping",
      "scope": "ausgewählte Laut-/Zeichenzuordnungen",
      "target_education_path": "Grundschule/Eingangsbereich, geschätzt",
      "prerequisites": ["bekannte Bildwörter", "geprüfte Zielaussprache und Laut-/Graphemzuordnung"],
      "exclusions": ["keine vollständige Lesediagnose", "kein automatischer Landesbezug"]
    },
    "runtime_release": false
  },
  {
    "content_id": "36bb6b3ddebc5d8e",
    "source_grades": {"values": [], "basis": "unknown", "review_status": "conflict_open"},
    "candidate_evidence": {
      "grade": 1,
      "jurisdiction": "Bayern",
      "locator": "Fußbereich des normalisierten Originals; widersprüchliche Vorlagenkennzeichnung",
      "review_status": "layout_and_scope_confirmation_pending"
    },
    "estimated_use_range": {
      "grades": [1],
      "status": "pedagogical_estimate_not_curriculum_mapping",
      "scope": "erkennbare Anfangsplanungsabschnitte, direkte Nutzer Lehrkräfte",
      "target_education_path": "Grundschule/Eingangsbereich, geschätzt",
      "prerequisites": ["Kontext der tatsächlichen Lerngruppe", "Prüfung des Kopf-/Fußbereichs"]
    },
    "runtime_release": false
  }
]
```

Für R115 ist zusätzlich `resource_role=mainbook_page_image`, `printed_page=8` und eine **separate** Kommentarverknüpfung zu PDF22 nötig. Die geschätzte Verwendung `[3,4]` bekommt den auf diese Seite begrenzten Scope und die genannten Voraussetzungen. `source_grades=[4]` bleibt nur mit dem vorhandenen nachvollziehbaren Kontext-/Beziehungsbeleg zulässig; nicht aus dem Bildinhalt schätzen und anschließend als explizite Eigenangabe ausgeben.

## Weitere Datenqualitätskorrekturen

- Bei mehreren Datensätzen steht `open_fields=[]`, obwohl eine Schulart nur geschätzt oder ein Publikationsjahr ausdrücklich unbekannt ist. Offene Felder aus den Feldstatus ableiten oder die Bedeutung von `open_fields` enger definieren. Ein leeres Array darf nicht als Vollständigkeitsfreigabe gelesen werden.
- Den Feldbeleg bei Kopiervorlagen als Cover-/Stufenkennzeichnung präzisieren. Bei der Mathematikressource den zusätzlichen ersten-Schuljahr-Beleg aus dem Inhaltsverzeichnis erhalten. Bloße Bandnummern sind keine allgemeine Regel für Schuljahrgänge.
- `target_audience=teacher` bei Kommentar und Planung ergänzen; `learner_context_grades` beziehungsweise Quelljahrgang daneben separat. Diagnosepakete können Lernendenaufgaben und Lehrkraftformulare enthalten; Rolle abschnittsweise abbilden.
- Eine Lehrplanreferenz im Material ist ein Quellenzitat des Materials. Sie bestätigt weder aktuelle amtliche Fassung noch Geltung, Transferjahrgang oder vollständige Kompetenzabdeckung. Alte Material-/Druckjahre bleiben historische Metadaten.
- Ein unbekanntes Herkunftsland verhindert keine vorsichtige fachliche Einsatzhypothese. Es verhindert aber die Behauptung eines amtlich bestätigten Länderbezugs. Konkrete Sprach-/Orthografienorm und Zielkontext werden erst beim tatsächlichen Einsatz gewählt.

## Amtlicher Fachplanbezug

Am22.10.2026 wurden die Kandidaten [Deutsch Grundschule1/2](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/1/deutsch) und [Mathematik Grundschule3/4](https://www.lehrplanplus.bayern.de/fachlehrplan/grundschule/4/mathematik) direkt angefragt. Beide Abrufe lieferten403. Daher keine neue Bestätigung einer aktuellen konkreten amtlichen Fachplanfassung und keine neue amtliche Jahrgangskalibrierung. Vorhandene Referenz-/Orientierungsbelege bleiben erhalten; sie werden durch diese Quellenzugangslücke weder gelöscht noch zu aktuellen Vollprüfungen aufgewertet.

`curriculum_mapping_status=access_blocked` bezeichnet den aktuellen Abrufversuch; die fachlichen Einsatzhypothesen bleiben separat. Eine PDF-Planung mit Lehrplantext im Material ersetzt keinen Zugang zum aktuellen amtlichen Abschnitt. Der Auftrag verlangt keine Umgehung von Zugangsgrenzen.

## Abnahme und nächster Schritt

Der abgegrenzte Gegenabgleich der neun Metadatensätze plus separatem R115-Beleg ist dokumentiert. Offen bleiben die Layout-/Konfliktklärung der bearbeitbaren Planung, gegebenenfalls die genauere Belegart der Kopiervorlagen-Jahrgangszahl, die belastbare R115-Ressourcenbeziehung und die tatsächlichen aktuellen amtlichen Zuordnungen. Die parallelen vollständigen Seitenanalysen werden hier weder wiederholt noch als fertig behauptet.

**Genau nächster Schritt:** Material-Owner prüft den Kopf-/Fußbereich der bearbeitbaren Originalplanung layoutgetreu, korrigiert die widerlegten Negativaussagen und übernimmt anschließend die bestätigten beziehungsweise ausdrücklich offenen Felder samt gesonderten Einsatzhypothesen. Dann die anderen hier vorgeschlagenen Feldpräzisierungen im eigenen Schreibauftrag einarbeiten. Dieser Beitrag selbst ändert keine Quell-/Medienregister.

## Koordinationsnachweis

Task und Rollen bleiben GC-PEDAGOGY-KB-01/Pädagogik-Fachchat; Ausgangsauftrag vom Materialchat `01a1282d-7f9d-7ee3-b7a8-d0c0da8967c2`. START_HERE, AGENTS, CHAT_CONTRACT, STATE, TODO, Workstreams-README und Registry wurden frisch auf main gelesen. Relevante Revisionen: START_HERE`85c5de38`, AGENTS`810d3e3b`, CHAT_CONTRACT`a39d166b`, STATE`67cf6b4e`, TODO`581f7ff3`, Registry`f654c0f1`.

PR214 frisch geprüft: offen, Branch`docs/pedagogy-media-20261011`, Head`48fa34b87f460bde6314b6fc4988330bb63513fe`, Zielmain; keine Änderung hier. Jüngster bei Abfrage gefundener abgeschlossener Development-Statuslauf`39739540269` erfolgreich auf`016de5397ac3e3fb78e05e16e107c5a738258391`. Kein Nachweis für vollständige Buchanalyse oder diesen neuen Beitrag. Der Release-Train nennt weiterhin den separaten integrierten App-Stand und Pool-Staging; das ist keine Freigabe der hier behandelten neuen Metadaten oder des Gesamtpiloten.

Nur diese eigene Beitragsdatei geschrieben. Keine Originale, Medienregister, gemeinsame TODO/Handoffs, Datenbank, Produktdateien, PRs oder Deploys verändert. Keine neuen Chats/Worker, Browserdownloads, bezahlten Generierungen oder Produkttests gestartet. Verfügbare Usage und tatsächliches Modell/Aufwand unbekannt; kein Modellwechsel veranlasst. PDF-Skill für die begrenzte visuelle Quellenprüfung verwendet; keine neue PDF erstellt.

### Eingangsrevisionen und Dokumentkontrolle

Neun Ressourcenkennungen in der Einzelbewertung vollständig vertreten; JSON-Beispiele syntaktisch gelesen, source_grades dort unbekannt und Schätzung separat; lokale Links und R115-Bildhash kontrolliert. Das sind Dokument-/Metadatenkontrollen, keine Produkt- oder Gesamtpilottests. Gelesene Eingangsstände:

- `media/reader-resource-metadata-validated-20261022.jsonl`: SHA-256 `327fa9e9e749e227d0a298297a8525504b2c1052e64fb0766226261e89bd9162`.
- `media/reader-resource-metadata-validated-20261022.md`: SHA-256 `93bd13bea8bd0146f93bcb96acaa554535d2502ccc0047dd96d61492dca0be11`.
- `master/material-zuordnung-konzeptbeitrag-2026-10-21.md`: SHA-256 `8dafa17cc0efa0ba2d4894c76fc6492e368e64d78f61a26880ca87cd02a5f601`.
- `media/diagnosis-6b47874d62ea10d8-20261021/pages-all.jsonl`: SHA-256 `707a55c0183aab9dc999dc417308fbe74a50f49aba50395c253f57626973ab9f`.
- `media/commentary-8d468f417d811a7a-20261021/pages-all.jsonl`: SHA-256 `ede780391302dc673cd1a85da16d04b989d0afda90f3672b8b26b1258cec8c79`.
