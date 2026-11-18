# Schreibaufgaben, Handschrift und nachvollziehbare Wilma-Vorkorrektur

Stand: 18.11.2026. Task **GC-PEDAGOGY-KB-01**. Vorschlag zur fachlichen Entscheidung, kein Implementierungs- oder Schulfreigabenachweis. Fortführung des bereits vorhandenen Planungswunsches vom 10.11. in [PR425](https://github.com/HerrLoeffler/Hausaufgabe/pull/425), Quelle `8844433d9c0a02095dc07713962ab90bd24570c9`. Keine zweite Bewertungsengine, keine zusätzlichen Provideraufrufe und keine Budgeterhöhung durch diesen Plan.

## 1. Ziel und technische Einordnung

Schüler können einen längeren Text tippen oder handschriftlich schreiben und Seiten fotografieren/hochladen. GradeCrew überführt die Handschrift in eine überprüfbare Abschrift. Wilma erstellt anhand eines vorab festgelegten Bewertungsrasters Vorschläge. Die Lehrkraft sieht Original, Abschrift, Kriterien und Punkte, kann alles fachlich prüfen und entscheidet über die Freigabe.

Technische Eignung des vorgeschlagenen Ablaufs: **8/10**, bezogen ausschließlich auf diese Produktidee. Vorhandene sichere Abgabe, Wilma und Lehrerentscheidungen sind eine gute Grundlage. Handschriftgenauigkeit, längere Argumentationen und der Aufwand zur Prüfung bleiben die wesentlichen Unsicherheiten. Diese Zahl ist keine Fertigstellungs- oder Qualitätsmessung des vorhandenen Produkts.

Für das vollständige Handschriftfeature lässt sich derzeit keine belastbare Fertigstellungszahl angeben: Es gibt keinen verifizierten Ende-zu-Ende-Nachweis für Schülerfoto → Abschriftprüfung → kriteriumsweise Langtextbewertung.

## 2. Geprüfte bestehende Grundlage

Koordinationsstand `main` `036d3eea8e28b5fe90e7522295e96788298dbff3`; Wilma-Übergabe und STATE gelesen. Aktueller Hostingkandidat PR430 `805cba98fc357d2926048311b7672b4fe70f1335` als konkrete Runtimequelle gelesen; dessen Veröffentlichung wird separat dokumentiert.

- Wilmas Vorschlags-, Bestätigungs-, Änderungs- und Undo-Ablauf ist bereits mit synthetischen Abgaben und menschlicher Live-Rückmeldung belegt. Die Lehrkraftbestätigung bleibt notwendig.
- Vorhanden sind private, an Aufgabe/Antwortfassung gebundene Prüfbelege und ein bestätigter Fundus. Er gilt für dieselbe Lehrkraft, denselben Test, dieselbe Aufgabe/Rasterfassung und exakt passende Antwort. Er ist kein trainiertes Modell und keine allgemeine Aufsatzbewertung nach Ähnlichkeit.
- Die dokumentierte globale Wilma-Obergrenze beträgt 20 EUR/Monat mit getrennten Stage-/Live-Anteilen. OCR-Kosten sind damit noch nicht automatisch freigegeben oder technisch erfasst.
- `assessment-functions/lib/assessment-core.js`, `sanitizeAnswersForStorage`: bestehende Textantworten werden auf **4.000 Zeichen** gekürzt. Für Aufsätze ist dieser Pfad ohne neuen Vertrag ungeeignet.
- `functions/lib/wilma/core.mjs`: akzeptiert bisher `text`/`gapfill`, Aufgaben bis 6.000 Zeichen, eine serialisierte Antwort bis 4.000 Zeichen und ein zusätzliches Raster bis 2.000 Zeichen. Die JSON-Grenze kann schon vor 4.000 tatsächlichen Antwortzeichen greifen. Punktvorschläge sind derzeit in 0,5-Schritten vorgesehen.
- Das vorhandene Antwortschema liefert Gesamtpunkte, Status und eine kurze Begründung. Für Aufsätze fehlen kriteriumsweise Ergebnisse, belegte Textstellen und gezielte Rückmeldungen.
- Der vorhandene Materialupload ist ein Lehrkraftpfad. Ein Schülerfoto darf nicht durch Freischalten desselben Pfades eingeschleust werden.
- Der alte Registry-Eintrag `freetext-review` ist blockiert/`ci_green`; das widerlegt die separat veröffentlichte Wilma-Funktion nicht und ist kein Anlass, den alten Branch blind zu integrieren.

Die lokale Development-Status-Auswertung vom 18.11. war wegen unvollständiger lokaler Branchrefs/PR-Abfrage nur teilweise aussagekräftig. Zusätzlich wurden der erfolgreiche zentrale Statuslauf `44317998193` und die tatsächlichen offenen PRs gelesen. Dabei wurde PR425 erkannt. Kein neuer Implementierungsbranch für dasselbe Feature begonnen.

## 3. Geeignete Aufgabenformate und Reihenfolge

| Format | Umsetzung | Besondere Prüfung |
|---|---|---|
| Getippte längere Fachantwort | Bestehende Textdarstellung erweitern, neuer verlustfreier Speichervertrag | Vollständigkeit, Begründung, Fachbegriffe, alternative richtige Lösungen |
| Aufsatz, Erörterung, Geschichte | Eigenständige Schreibaufgabe mit Absätzen und versionsfestem Raster | Inhalt, Aufbau, Argumentation und Sprache getrennt |
| Englisch-/Deutschtext | Originalgetreue Erfassung plus getrennte Rückmeldungen | Rechtschreibung/Grammatik nur bei vereinbartem Lernziel bewerten |
| Foto einer Handschrift | Private Seiten, Erkennung, Originalvergleich und Bestätigung | Erkennungsfehler dürfen keine fachlichen Abzüge erzeugen |
| Mehrseitiger Scan/PDF | Seitenzuordnung, Vollständigkeitskontrolle, geordnete Verarbeitung | Doppelte/fehlende/vertauschte Seiten, Größen- und Pixelgrenzen |
| Rechenweg, Formel, Skizze | Späterer eigener Medien-/Bewertungsvertrag | Reine Text-OCR verliert Brüche, Exponenten und räumliche Beziehungen |

Empfehlung: mit getippten Schreibaufgaben und Fotos von Fließtext beginnen. Formeln, Diagramme, Tabellen und freie Zeichnungen nicht als bereits gelöstes Nebenprodukt versprechen.

## 4. Zwei ausdrücklich verschiedene Abläufe

### Üben und Überarbeiten

1. Lehrkraft wählt Schreibaufgabe, Lernziel und Raster; kann ein Muster von Remy entwerfen lassen und bestätigt es.
2. Schüler tippt oder fotografiert; Originalseiten werden gespeichert und zugeordnet.
3. GradeCrew zeigt Foto und Abschrift nebeneinander, am Handy per Umschalten. Unsichere/unlesbare Stellen erhalten eine Markierung mit Originalausschnitt.
4. Schüler berichtigt ausschließlich die Abschrift, bestätigt ihre Übereinstimmung oder kennzeichnet offene Stellen. Bewusste inhaltliche Überarbeitung ist ein eigener neuer Entwurf mit Verlauf.
5. Wilma erstellt einen Vorschlag. Lernfeedback vor Abgabe ist nur im ausdrücklich gewählten Übungsmodus zulässig.
6. Lehrkraft prüft und veröffentlicht die gewünschte Rückmeldung. Original, Fassungen und Eingriffe bleiben nachvollziehbar.

### Formeller Leistungsnachweis

1. Aufgabenfassung, Raster, erlaubte Hilfen, Abgabefrist und Umgang mit Abschriftkorrekturen stehen vorher fest.
2. Das fristgerecht eingereichte Original wird mit serverseitigem Zeitpunkt und Inhaltsfingerabdruck unveränderlich fixiert. Die Abgabe kann bestätigt werden, während die Erkennung noch läuft.
3. Nach Fristende ändert die Schülerprüfung niemals das Original. Sie erfasst vorgeschlagene Lesekorrekturen, die die Lehrkraft anhand des Fotos übernimmt oder verwirft.
4. Die bewertete Abschrift ist eine ausdrückliche, versionierte Festlegung. Automatisches stilistisches oder orthografisches Glätten ist ausgeschaltet.
5. Wilma erstellt prüfbare Teilpunktvorschläge. Keine eigenständige endgültige Notenvergabe, keine Feedbackfreigabe während der Prüfung.
6. Lehrkraft kontrolliert Belege und Punkte, ändert sie bei Bedarf und gibt das Ergebnis bewusst frei. Ein bloßer serienmäßiger Bestätigungsklick ersetzt keine sinnvolle Kontrolle.

**Fachliche Grundregel:** Bei „das“ statt „dass“ muss die Abschrift zunächst „das“ enthalten. Eine sprachliche Verbesserung gehört in eine getrennte Rückmeldung. Unsichere Lesarten sind kein Nullpunktebeweis.

## 5. Texterkennung: realistische technische Wege

Bewertung nach Handschrifttauglichkeit, Einbau in die vorhandene Web-App, nachvollziehbarer Fehlerkontrolle und Betriebs-/Datenschutzaufwand. Zahlen sind Planungsurteile, keine gemessene Erkennungsqualität.

| Ansatz | Eignung | Nutzen | Grenzen |
|---|---:|---|---|
| Eigenständige Handschrift-OCR plus Wilma auf bestätigtem Text | **8/10** | Saubere Trennung von Lesen und Bewerten; viele Dienste liefern Wort-/Zeilenpositionen | Zusätzlicher Dienst, Region/Vertrag/Kosten prüfen; Kinderhandschrift lokal erproben |
| Freigegebenes bildfähiges KI-Modell für wortgetreue Abschrift, danach separater Wilma-Aufruf | **7/10** | Kann zur vorhandenen KI-Anbindung passen; schneller technischer Vergleich | Kann Wörter ergänzen/korrigieren, Bilddetails übersehen; erfordert harte Prüfung und gesonderte Bildbudgets |
| Erkennung auf dem Gerät oder selbst betrieben | **6/10** | Potenziell weniger Übertragung, eigene Kontrolle über Betrieb | Native Apple-Funktion ist kein gleichwertiger Web-Standard; Hosting allein liefert keine gute Handschriftengine; Modellqualität/Betrieb erst beweisen |

Für einen begrenzten Versuch zwei freigegebene Kandidaten am selben fiktiven Korpus vergleichen. Ein bereits vertraglich zulässiger bildfähiger Dienst kann der günstigere erste Versuch sein; die spätere Produktwahl folgt gemessener Fehler- und Korrekturarbeit. Ein neuer Cloudanbieter wird nicht allein wegen der Empfehlung eingerichtet.

Anforderungen an die Erkennung:

- Seiten/Zeilen/Wörter in Lesereihenfolge, Leerstellen und Streichungen erkennbar abbilden; keine erfundenen Wörter oder fehlenden Seiten ergänzen.
- Je Abschnitt Referenz zum Originalausschnitt, erkannte Lesart, alternative Lesart oder „unlesbar“ und Prüfflag liefern. Positionsgenauigkeit selbst testen; ein Visionmodell liefert keine automatisch zuverlässigen Wortkoordinaten.
- Engine-Confidence, falls vorhanden, messen/kalibrieren. Eine vom Sprachmodell behauptete Prozentzahl ist kein verlässlicher Unsicherheitsnachweis.
- Nicht erkannte Stellen und Widersprüche führen zur Prüfung. Lehrer kann direkt am Original bewerten, ohne auf eine erfolgreiche Erkennung warten zu müssen.
- Kein automatischer Wechsel zu einem anderen Anbieter. Bei Ausfall bleibt die Originalabgabe gesichert und manuell zugänglich.

Quellen, am 18.11. gelesen: [Microsoft Document Intelligence: Sprachen für Handschrift](https://learn.microsoft.com/azure/ai-services/document-intelligence/language-support/ocr?view=doc-intel-4.0.0), [OpenAI Bildverarbeitung und Grenzen](https://developers.openai.com/api/docs/guides/images-vision). Diese Dokumentation belegt mögliche Fähigkeiten und bekannte Grenzen, keine GradeCrew-Einrichtung, deutsche Verarbeitung oder Eignung für konkrete Schülerhandschriften.

## 6. Bewertungsraster und verständliches Ergebnis

Die Lehrkraft legt pro Kriterium fest: Bezeichnung, maximale Punkte, konkrete Leistungsstufen, zulässige Alternativen, Teilpunkte, Abzugsregeln und gegebenenfalls Ankerbeispiele. Fachlicher Erwartungshorizont und Raster bleiben serverprivat. Schüler sehen nur die vorab bewusst freigegebene Kriterienbeschreibung, keine versteckten Musterlösungen.

Beispiel für eine Erörterung, ausschließlich zur Illustration:

| Kriterium | Punkte | Bewertungsgrundlage |
|---|---:|---|
| Aufgabenbezug und fachlicher Inhalt | 8 | Fragestellung tatsächlich behandelt, Aussagen fachlich tragfähig |
| Argumentation und Belege | 6 | Begründungen, passende Beispiele, Gegenpositionen |
| Aufbau und Zusammenhang | 4 | Nachvollziehbare Gliederung und Verknüpfungen |
| Ausdruck | 4 | Verständlichkeit, passende Wortwahl |
| Rechtschreibung und Grammatik | 3 | Nur wenn ausdrücklich Bestandteil der Bewertung |
| Gesamt | 25 | Summe durch den Server, Notenschlüssel separat |

Keine Doppelabzüge für denselben Fehler ohne vorab festgelegte Regel. Nachteilsausgleich und bewertungsrelevante Ausnahmen als von der Lehrkraft gesetzte Regeln übergeben, keine Diagnosen/unnötigen Gesundheitsdaten an den Provider senden.

Wilma liefert je Kriterium: vorgeschlagene Punkte, kurze konkrete Begründung, überprüfbare Textbelege mit Zeichenpositionen in der exakten Textfassung, fehlende Nachweise und Prüfhinweise. Zusätzlich eine knappe Gesamtrückmeldung. Struktur/Maxima/Punktschritte/Zitatsubstrings werden serverseitig validiert; ein falsch zugeordnetes Zitat macht den Vorschlag prüfbedürftig. Diese Validierung beweist nicht die fachliche Richtigkeit der KI-Wertung.

Die Lehrkraft kann Kriteriumspunkte ändern, begründen, bestätigen, zurückstellen und die letzte eigene Entscheidung im bestehenden Konfliktschutz zurücknehmen. Summe und Note werden deterministisch berechnet. Ein geändertes Raster oder eine geänderte Abschrift macht alte Vorschläge ungültig. Nachträgliche Rasteränderungen lösen keine stille Neubewertung bereits freigegebener Leistungen aus.

## 7. Datenmodell und Verträge

Vorgeschlagene getrennte Datensätze/Referenzen, konkrete Pfade erst beim Implementierungsauftrag festlegen:

- `WritingTask`: Version, Lernziel, Antwortmodus, erlaubte Dateien/Seiten, Grenzen, Referenz auf private Rasterfassung, Modus Übung/Leistungsnachweis.
- `SubmissionOriginal`: Test/Aufgabe/Attempt, private geordnete Seitenreferenzen, serverseitige Eingangszeit, Hashes und unveränderlicher Abgabestatus.
- `TranscriptVersion`: rohe Erkennung, daraus abgeleitete geprüfte Fassung, Autor, Änderungen, Seiten-/Zeilenbelege und offene Stellen; Original bleibt unverändert.
- `RubricVersion`: Kriterien, Maxima, Stufen, Anker und Version. Fachliche Lösung bleibt privat.
- `ReviewProposal`: Bindung an Text-, Aufgaben- und Rasterhash, Provider-/Modell-/Promptversion, Kriterienbelege, Usage und Status.
- `TeacherDecision`: bestätigte/abweichende Punkte, Begründungen, Bearbeiter, Zeitpunkt, Revision und Freigabe.

Große Originalbilder und lange Dokumente in privaten Objektspeicher, Firestore für kleine Metadaten/Referenzen verwenden. Keine Bild-Base64-Sammlung oder ein ganzer Klassensatz als einzelnes Dokument. Serverautorisierung prüft Mandant/Owner, Test, Attempt, Aufgabe, Zeit und Status; ein Dateipfad oder bekannter Testcode allein genügt nicht. Für Schüler ohne Account braucht es einen eigenen eng begrenzten Uploadvertrag, keinen allgemein beschreibbaren Bucket.

Die alte 4.000-Zeichen-Normalisierung nicht global einfach erhöhen. Neuer versionierter Langtextvertrag mit ausdrücklich validierter Zeichen-/Byte-/Seitenobergrenze, verständlicher Anzeige und verlustfreier Speicherung/Übertragung. Bestehende Kurzantworten, sichere Abgabe und alte Clients bleiben kompatibel. Überschreitungen werden vor Bestätigung erklärt und serverseitig abgewiesen, niemals unbemerkt gekürzt.

## 8. Verarbeitung, Zuverlässigkeit und Kosten

Zustandsfolge: Entwurf → Original eingegangen → Erkennung läuft → Abschrift zu prüfen → bewertbare Fassung festgelegt → KI-Vorschlag → Lehrerprüfung → freigegeben. Upload, Verarbeitung und Abgabe sind verschiedene Vorgänge; ein OCR-Timeout darf eine fristgerechte Originalabgabe nicht verlieren lassen.

- Asynchrone Jobs, jeweils mit unveränderlicher Quellfassung und Deduplizierung. Bereits bestätigte Abgaben und fertige Erkennungen nicht erneut berechnen.
- Seiten nacheinander oder begrenzt parallel laden, drehen/entzerren und in vernünftiger Auflösung bearbeiten. HEIC/HEIF von iPad/iPhone bewusst testen und gegebenenfalls serverseitig in ein erlaubtes Format konvertieren. MIME, tatsächlichen Inhalt, Dateigröße und dekodierte Pixelzahl prüfen; PDF zusätzlich auf Seitenzahl/Komplexität begrenzen.
- Ein Uploadjob mit 2 GiB und Parallelität 1 kann ein sinnvoller Ausgangspunkt sein; er ist keine Kapazitätsgarantie. Speicher hängt von dekodierten Pixeln, Bibliotheken und gleichzeitig gehaltenen Seiten ab. Größere Limits erst nach gemessenen Spitzen; seitenweise Verarbeitung ist oft wirksamer als pauschal mehr RAM.
- Schmal begrenzte Wiederholungen nur bei eindeutig transientem Fehler und geklärtem Providerstatus; keine kostenpflichtigen Blindwiederholungen bei unbekanntem Ergebnis.
- Langtexte bei Bedarf abschnittsweise analysieren, aber für Aufbau, Widersprüche und Argumentation einen Gesamtblick erhalten. Kein Mitteln isolierter Absatznoten zu einer scheinbar begründeten Aufsatznote.
- Kosten vor Auftrag reservieren, tatsächliche OCR-Seiten/Bildtokens/Texttokens/Usage erfassen, Grenzwert vor Start durchsetzen. Bestehenden globalen Budgetschutz wiederverwenden; OCR nur nach expliziter gemeinsamer Budgetentscheidung anschließen. Kein zweiter 20-EUR-Topf.
- Keine KI-Neubewertung beim Öffnen jeder Seite, Speichern einer Lehrerkorrektur oder unverändertem Reload. Ein neuer Vorschlag braucht einen neuen relevanten Quellhash oder einen bewussten Auftrag.
- Bei erschöpftem Budget bleibt manuelles Prüfen möglich. Technischer Fehler ist kein fachliches Nullpunkteergebnis.

Erst nach Messung Preise pro Seite und pro Aufsatz nennen. Für 30 Schüler mit je 3 Seiten sind 90 Erkennungsseiten zuzüglich 30 Bewertungsaufträgen zu berücksichtigen; das ist eine Mengenschätzung, kein Preisversprechen.

## 9. Oberfläche auf Handy, iPad und Desktop

Schüler: große Arbeitsfläche für den Text oder die aktuelle Seite, kompakte Werkzeugleiste „Tippen / Foto / Datei“, klarer Seitenzähler, Erkennungsstatus, sichtbare Speicher-/Abgabebestätigung. „Abschrift prüfen“ mit leicht erreichbarer Bestätigung. Auf dem Handy Foto/Text umschalten; am iPad nebeneinander, sofern genug Platz bleibt. Tastatur darf Eingabefeld und Abgabeschaltfläche nicht verdecken. Vor Zurück-/Seitenwechsel Entwurf sichern, Wiederaufnahme und mehrere Tabs kontrollieren. Gemeinsame Geräte benötigen den separat geplanten sicheren Personenwechsel.

Lehrkraft: Liste mit „Abschrift offen“, „Vorschlag bereit“, „geändert“ und „bestätigt“; Original/Abschrift/Raster in zusammenhängender Ansicht, Belegklick führt zur betreffenden Textstelle. KI-Fertigstellung im Hintergrund markiert die betroffene Aufgabe erneut als prüfbedürftig. Keine ausufernden permanenten Dropdowns, kein tief verschachtelter Hauptablauf. Kleine Screens dürfen die Hauptarbeitsfläche sinnvoll scrollen; eine starre Bildschirmhöhe darf keine Felder abschneiden.

PDF-/Word-/CSV-Export erhalten, aber zusätzlich prüfen, wie kriteriumsweise Rückmeldung und Originalbezug exportiert werden; bestehender CSV-Punkteexport deckt nicht automatisch diese Dokumentation ab.

## 10. Datenschutz und Schulfreigabe als konkrete Produktgates

Der geplante Einsatz betrifft Minderjährige und Leistungsbewertung. Hosting bei einem deutschen Anbieter oder ein EU-KI-Endpunkt allein belegen keine zulässige gesamte Verarbeitung.

- Verantwortliche Schule, Zweck/Rechtsgrundlage, AVV/Unterauftragsverarbeiter, konkrete Regionen für Bilder und Texte, Aufbewahrung, Logs, Supportzugriffe, Löschung/Backups und Datenübermittlungen vor Echtdatenbetrieb klären. EU ist nicht gleich ausschließlich Deutschland.
- Namen/Unterschriften vom Kopf möglichst vor Providerübertragung ausschneiden, Originalzugriff innerhalb der Schule erhalten. Der übrige Text kann weiterhin Personenbezug enthalten.
- Keine Originale/Schülertexte in öffentlichen Links, Analytics, Fehlerlogs, Git oder einem gemeinsamen offenen Lernfundus. Löschkette umfasst Original, abgeleitete Bilder, Abschriften, Vorschläge, Caches und Provideraufbewahrung gemäß Vertrag.
- Für formelle Bewertungen Verantwortliche zur erforderlichen Datenschutz-Folgenabschätzung und zur konkreten Einstufung nach KI-Verordnung hinzuziehen. KI für die Bewertung von Lernergebnissen ist in deren Bildungsbereich ausdrücklich erfasst; menschliche Freigabe ist allein keine pauschale Ausnahme.
- Unterrichtsübung und formeller Leistungsnachweis getrennt freigeben, bayerische Vorgaben zur Durchführung/Speicherung und die zuständigen Schulstellen einbeziehen. Keine Rechtskonformitätsgarantie aus diesem technischen Plan ableiten.

Primärquelle zur Einordnung: [EU-Kommission, AI Act, Anhang III, Bildungsbereich](https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3). Konkrete Pflichten/Fristen und mögliche Ausnahmen müssen im tatsächlichen Produkt-/Schulkontext geprüft werden.

## 11. Umsetzung in fünf überprüfbaren Etappen

| Etappe | Ergebnis | Abnahme vor nächster Stufe |
|---|---|---|
| A: Getippte Schreibaufgabe | Verlustfreier neuer Textvertrag, Entwurf/Wiederaufnahme, versionsfestes Raster, manuelle Kriterienbewertung | Grenzwerte, kein Abschneiden, alte Aufgaben unverändert, echte mobile Tastaturprüfung |
| B: Wilma für längere Texte | Schema für Kriterien/Belege, privater asynchroner Vorschlag, Lehrerentscheidung | Fiktiver Korpus, unabhängige Referenzbewertungen, Kosten/Fehler/Abweichungen dokumentiert |
| C: Schülerfotos und Abschrift | Privater Upload, Seitenzuordnung, Erkennung, Originalvergleich, Korrekturverlauf | JPEG/PNG/HEIC und spätere PDF-Freigabe, unlesbare/fehlende Seiten, Rechtschreibung unverändert |
| D: Klassenpilot auf Staging | 25–30 fiktive Abgaben, mehrseitige Verarbeitung, parallele Bearbeitung, Budgetausfall | Zuordnung, Retry/Idempotenz, Kontentrennung, Löschung, Reload/Offline und Geräteabnahme |
| E: Begrenzte Schulveröffentlichung | Erst bewusst freigegebener Übungsumfang, formelle Noten separat | Schule/Datenschutz/Verträge/KI-Einstufung, Releasebeleg und konkrete menschliche Freigabe |

Keine verlässliche Tageszahl ohne eingegrenzte Formate und Pilotkorpus. OCR ist ein eigenes größeres Arbeitspaket; sie darf nicht als kleiner CSS-Anbau an Wilma geschätzt werden. Erste nützliche Lieferung ist Etappe A plus ein begrenzter B-Pilot, ohne Fotos abzuwarten.

## 12. Qualitätskorpus und verbindliche Prüfungen

Vorschlag für den Start: zwei Aufgaben, beispielsweise GPG-Fachbegründung und Deutsch-/Englisch-Schreibaufgabe, mit vorab bestätigtem Raster. Jeweils gute, mittlere, schwache, alternative richtige, sehr kurze, widersprüchliche und unlesbare Antworten. Zunächst ausschließlich synthetische oder ausdrücklich zulässige anonymisierte Beispiele.

- Erkennung: Zeichen-/Wortfehler, ausgelassene Wörter/Seiten, versehentlich verbesserte Orthografie, problematische Negationen/Zahlen, menschliche Korrekturzeit. Fehler über Seiten und schwierige Fälle getrennt berichten; keine pauschale Genauigkeitszahl aus wenigen sauberen Seiten.
- Bewertung: Kriteriumsabweichung zu zwei unabhängig bewertenden Lehrkräften samt fachlicher Klärung ihrer Unterschiede, unbelegte Behauptungen, übersehene Alternativlösungen, systematische Verzerrungen und Stabilität bei gleichem Text. Zulässige Abweichung vor dem Pilot festlegen, keine nachträglich passende Schwelle.
- Sicherheit: fremder Attempt/Mandant abgewiesen, Raster/Lösung nicht vorzeitig lesbar, Dateityp-/Pixelbomben abgefangen, Promptanweisungen im Schülertext nicht ausgeführt, kein Rendering ausführbarer Uploadinhalte.
- Zuverlässigkeit: unterbrochener Upload, langsames Netz, Workerabbruch, fehlende Seiten, Offlineentwurf, zwei Tabs, Fristende während Erkennung, verspätete KI-Antwort nach Rasterwechsel, Konflikte beim Lehrerspeichern, Budgetgrenze und unbekannter Providerabschluss.
- Geräte: physisches iPhone und iPad, Safari/Chrome entsprechend verfügbar, Bildschirmtastatur und Kamera; Desktop, Tastaturbedienung und 200 % Zoom. Emulierte Browsergrößen ersetzen die physischen Geräte nicht.

Keine zusätzlichen kostenpflichtigen Versuche allein durch diesen Plan. Vor dem Pilot konkreten Betrag/Aufrufumfang und denselben bestehenden Versuchszähler festlegen.

## Nächster ausführbarer Schritt

Nach einem Umsetzungsauftrag für Etappe A zwei repräsentative Aufgaben mit Kriterienrastern und fiktiven Referenzantworten auswählen; danach den versionierten Langtext-Abgabevertrag gegen den aktuellen Prüfungsserver entwerfen und prüfen. Dieser Plan allein ändert keine Runtime- oder Release-Stufe und startet keine Migration.
