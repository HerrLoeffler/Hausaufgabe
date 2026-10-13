# GC-INTELLIGENCE-01: Sprache, Qualitätsfreigabe und Internationalisierung

- Aktualisiert: 2026-10-02 UTC
- Branch: `feature/quality-routing-contract-v1`
- Basis: `232c0ed4bca32fb63a958d241220a5c644dd437c` (Gateway-Branch)
- Auftrag: neue Sprach-, KI- und i18n-Bausteine gemeinsam vorbereiten.
- Zuständigkeit: `shared/intelligence/**`, `tools/evaluation/**`, `docs/intelligence/**`, eigene CI.
- Überschneidungen: Gateway #24, Crew-/Emmi-Code, i18n-Core und Telemetrie bestehen bereits; diese Implementierungen werden nicht ersetzt.

## Gesicherter Zwischenstand
Release-Stufe: `ci_green`. Code-Commit: `5af11caa55662b7986f73ae72c535eee853f847c`; Draft-PR [#25](https://github.com/HerrLoeffler/Hausaufgabe/pull/25) gegen Gateway-Branch, nicht integriert.
GitHub Actions: [Intelligence contracts 36948918111](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/36948918111) auf diesem Code-Commit erfolgreich (14 Tests + CLI-Syntax).
Implementiert: strenge Kontext-/Voice-Patch-/Capability-Verträge, Offline-Qualitätsgate mit exakten binomialen Grenzen, CLI und CI. Gemeinsamer Ausbauplan: [Sprache, KI-Qualität und Internationalisierung](https://github.com/HerrLoeffler/Hausaufgabe/blob/feature/quality-routing-contract-v1/docs/intelligence/README.md).
Lokale Tests: 14/14 bestanden; CLI-Syntax geprüft. Unabhängiger SciPy-Vergleich der Grenzen für 20 Fälle: maximale absolute Abweichung 1.78e-15. Synthetische Testfälle sind keine Modellqualitätsnachweise.
Keine Modellumschaltung, API-Aufrufe, neue Datenerfassung oder Deployments durch diesen Arbeitsblock.

## Akzeptanz
- Fehlende/unpassende Evidenz und kritische Fehler blockieren eine Empfehlung.
- Kosten entscheiden erst unter qualifizierten Alternativen.
- UI-, Eingabe-, Inhalts- und Bewertungssprache bleiben getrennt.
- Automatische Zahlen beweisen keine Datenqualität; menschlich geprüfte Referenzen und repräsentative Fälle bleiben Voraussetzungen.
- Dokumentierter Anschluss an vorhandene Crew-, Gateway-, i18n- und Telemetrieschnittstellen.

## Nächster Schritt
Vorhandenen Crew-Controller nach Review von PR #25 an den Patch-Vertrag anbinden und fachlich geprüftes Pilot-Evaluationsset erstellen. Kein Runtime-Routing ohne vertrauenswürdige Freigabeartefakte.

## GC-AI-01 · Antwortverrat im Schülertext (13.10.2026)

**Beschlossener Prüfbedarf:** Martins Foto zeigt eine Wissens-/Klassifikationsaufgabe „Markiere im Text alle erneuerbaren Energiequellen“. Sichtbarer Text: „Windkraft und Wasserkraft nutzen natürliche Bewegungen. Auch Sonnenstrahlung und Biogas können zur Energiegewinnung eingesetzt werden. Kohle und Erdgas sind dagegen nicht erneuerbar.“ Die explizite Negativklassifikation und kontrastive Gruppierung verraten die Auswahl. Das ist kein bloßer Wortgleichheitsfehler: Markieraufgaben müssen alle Kandidaten enthalten. Foto tatsächlich angesehen; nur diese anonymisierte Aufgabenabschrift verwenden, kein Foto/Kontoheader oder privater Testexport im Repository.

**Umfang und Status:** Konzept/Regression-Spezifikation im bestehenden GC-AI-01; kein Runtimefix, kein neuer Modellaufruf, keine Testmigration, keine Änderung am unbekannten bestehenden 50-Aufgaben-Test oder Deployment. Die folgende Umsetzung ist ein Vorschlag. Der separate Offline-Vertrag aus PR25 bleibt ci_green/nicht integriert/nicht deployed; diese Ergänzung aktiviert ihn nicht. PR218@64d78d19fd48b50b440adf829c26de5e85c5dc4f ist bestehende Poolarbeit, offen/ci_green, nicht live; dort später anschließen statt einen zweiten Pool bauen.

### Gegenprüfung: geforderte Leistung erhalten

Vor einer Leakbewertung Lernziel und Schüleransicht bestimmen:
- Wissen/Klassifikation/Anwendung: Bereits gelernte oder ausdrücklich bereitgestellte Kriterien sollen angewendet werden. Regeln, notwendige Eingaben und Beispiele dürfen bereitstehen, solange sie nicht die fertige Zuordnung oder das berechnete Ergebnis der konkreten Aufgabe liefern. Öffentliche Sätze, Synonyme, Negationen, Labels, Gruppierungen, erläuternde Ausschlüsse oder Lösungshilfen dürfen die verlangte Entscheidung nicht vorwegnehmen.
- Explizites Lese-/Hörverstehen oder Informationsentnahme: Lösungsrelevante Angaben im vorgesehenen Text/Audio sind beabsichtigt und bleiben erhalten. Eine nachträgliche Umdeutung einer Wissensaufgabe zu Informationsentnahme ist keine Reparatur ohne Lehrkraftentscheidung.
- Unklares Lernziel: Warnung mit konkreter Belegstelle und Lehrkraftprüfung; keine pauschale Löschung oder automatischer Wissensmodus.
- True/false: Die zu bewertende Aussage selbst ist zulässig, auch wenn sie falsch ist. Ein zusätzlicher Satz „Diese Aussage ist richtig/falsch“ verrät die Bewertung.
- Markwords: Gruppierung oder das Wort „dagegen“ allein beweisen keinen Leak; ihre lösungsverratende Bedeutung muss anhand Lernziel und privater Referenz belegt werden. Kandidaten und notwendiger Satzkontext bleiben vollständig sichtbar. Optionen, Zuordnungselemente und gemischte Reihenfolgebestandteile sind ebenfalls nötig; korrekte interne Lösungen oder Reihenfolgen sind allein kein Leak.

**Neutraler Vorschlag für das Fotobeispiel:** Arbeitsauftrag unverändert. Passage: „In einer Übersicht werden Kohle, Wasserkraft, Biogas, Erdgas, Sonnenstrahlung und Windkraft als Energiequellen genannt.“ Alle Kandidaten sind gemischt, ohne Erneuerbar-Labels oder Ausschlüsse. Ob ein längerer Kontext benötigt wird, richtet sich nach Fach/Jahrgang und dem vereinbarten Lernziel; nicht nur den verräterischen Satz entfernen und dabei Auswahl oder Lösbarkeit verändern.

### Aktueller Sourcebefund und Implementierungsanschluss

Source-Snapshot: App/Stagingcommit [44ab6540](https://github.com/HerrLoeffler/Hausaufgabe/commit/44ab6540a9ac0cd4a144dd25eb84a7198d22498b); kein Modell-/Browserreproduktionstest des privaten Fototests.

| Vorhandener Pfad | Beleg und konkrete Grenze |
|---|---|
| Generierungsregel | [functions/lib/prompts.js](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/functions/lib/prompts.js#L16) enthält bereits eine allgemeine Nichtverrat-Regel; markwords verlangt sichtbare Zielwörter. Die lernzielabhängige Klassifikation/Negativausschluss-Abgrenzung fehlt ausdrücklich. |
| Unabhängige Reviewprojektion | [quality.js334–382](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/functions/lib/quality.js#L334) trennt studentView/answerKey, ersetzt Lücken und berücksichtigt listening-only instruction. Markierpassage/Farbgruppennamen sind öffentlich, Zielwörter/Gruppenmitgliedschaften privat; nötige Kategorienamen sind zulässig, Namen mit fertiger Mitgliederauflösung können verraten. Existing FP-Ausnahmen für Markierwörter, RF und gemischte Elemente erhalten. |
| Belegprüfung | quality.js385–399 prüft bei stringförmigem evidence dessen Vorkommen ausschließlich in text/passage; bei fehlendem/nichtstringförmigem evidence wird dieser Vergleich nicht ausgeführt. Daraus keine lückenlose Beleggarantie ableiten. Der Prüfer erhält auch Optionen, aber ein Zitat nur dort wird verworfen. Bild-alt/help/Captions und ein fremder Aufgabenindex besitzen keinen allgemeinen Belegvertrag. Diese Flächen-/Cross-question-Erweiterung ist geplante Arbeit. |
| Erst-/Reparatur-/Variantengenerierung | [index.js302–404](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/functions/index.js#L302) nutzt bestehende Batch-, strukturelle Reparatur- und unabhängige Reviewfolge; regenerateQuestion711–761 prüft Einzelersatz/Varianten. Nicht durch zweite Prüfpipeline ersetzen. |
| Verbliebene Qualitätsfehler | quality.js420ff repariert begrenzt und prüft erneut. index.js365ff blockiert strukturelle hardErrors; verbliebene Qualitätsissues werden Warnungen. Ein harter Veröffentlichungsblock für bestätigten pädagogischen Leak ist damit noch nicht nachgewiesen. |
| Öffentliche Projektion | [assessment-core.js146ff](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/assessment-functions/lib/assessment-core.js#L146) baut öffentliche Aufgaben mit Text, Bild/alt, Audio, Kandidaten und separater listening-only instruction; private Bewertungsfelder gehören nicht in Browserdaten. Ein didaktischer Satz im erlaubten passage/text bleibt aber ein inhaltlicher Leak. |

Nicht belegt ist, welcher Providerlauf/Entwurf das Foto erzeugte oder ob die Warnung schon vorlag. Ohne Test-ID keine privaten Test-/Attemptinhalte lesen und keine konkrete Ursache eines Providerfehlers behaupten.

### Vorgeschlagener Anschluss an bestehende Qualitätsschritte

1. Generierungs- und Reviewregel um die oben genannte Lernzielabgrenzung und das Positiv-/Negativbeispiel ergänzen. Die Existing Markwords-Ausnahme präzisieren: Kandidat vorkommt erlaubt; dessen Klassifikation/Ausschluss verraten ist nicht erlaubt.
2. Server-/berechtigter Reviewer beurteilt den gesamten öffentlich erreichbaren Aufgabenumfang gegen private Lösungen: Frage/Arbeitsauftrag, Passage, tatsächlich sichtbare Bildbeschriftung, alt/Caption, Optionen, Hilfen und audio.publicInstruction bzw. dessen heutige Feldprojektion. audioTranscript dient privat der Hörverstehensprüfung und wird deshalb nicht als sichtbarer Text veröffentlicht. Keine privaten answerKey/Justification/Feedbackinhalte an Browser oder allgemeine Telemetrie geben. Öffentliche Zusatzflächen nach tatsächlichem Schema benennen, kein neues publicInstruction-Feld voraussetzen.
3. Belegvertrag künftig mit Aufgaben-ID, tatsächlich öffentlicher Feldposition und wörtlichem Zitat erweitern; semantische Erklärung separat. Interne Keys/PlannedImage allein sind kein öffentlicher Beleg. Testweite Hinweise aus anderen erreichbaren Fragen mit beiden Indizes prüfen, aber keine breite automatische Aufgabenentfernung.
4. Hohe Sicherheit mit belegter Vorwegnahme: begrenzte vorhandene Reparatur, erneute unabhängige Prüfung; bei weiterhin bestätigtem Leak Veröffentlichung der betroffenen Revision blockieren. Unsicherheit: sichtbare Lehrkraftwarnung/Prüfentscheidung. Der harte Gateanschluss ist vorgeschlagen und technisch noch zu implementieren; vorhandene Warnung nicht als Sperre ausgeben.
5. Prüfung bei erzeugten, überarbeiteten und Variantenaufgaben über vorhandenen Review anschließen; Import/manuelle Änderungen spätestens vor Veröffentlichung desselben Snapshot prüfen. Keine bezahlte Vollprüfung pro Tastendruck. Bestehenden Batch-/Revisionsnachweis wiederverwenden und fehlende Verträge gezielt ergänzen: Zeitstempel, Inhaltsfingerprint, Regel-/Promptversion, Lernziel, Ergebnis und Ownerentscheidung; relevante Änderung invalidiert Nachweis. Aktive Prüfungen behalten ihren Snapshot.
6. Den heutigen einen öffentlichen Höraufgabenauftrag erhalten: vollständige Frage samt Auswahlkriterium/-zahl bleibt sichtbar, kein Privattranskriptfallback, keine versteckte/doppelte Arbeitsanweisung. Leakreparatur darf den früheren verschwundenen Audioauftrag nicht erneut auslösen.

### Verbindliche Abnahmematrix für die spätere Umsetzung

Diese Fälle sind **Spezifikation, noch keine ausgeführten Produkttests**. Je Zeile anonyme Fixture, Lernziel, öffentliche Felder, private Referenz, erwartetes Verdict und Beleg ablegen. FP = fälschlich verbotene nötige Information; FN = übersehener Verrat.

| ID | Beispiel/Grenzfall | Erwartung |
|---|---|---|
| AL01 | Fotoabschrift; Wissen/Klassifikation; „Kohle und Erdgas … nicht erneuerbar“ | bestätigter Leak; Ausschluss/kontrastive Gruppierung zitieren (FN-Schutz) |
| AL02 | Neutrale gemischte Passage oben; alle sechs Kandidaten sichtbar | erlaubt, unverändert lösbar; targetWords-Wortgleichheit allein kein Leak (FP-Schutz) |
| AL03 | „Die regenerativen Quellen sind Wind und Sonne“ bei Erneuerbar-Klassifikation | Leak trotz Synonym, nicht nur Literalvergleich (FN) |
| AL04 | Derselbe Sachtext, ausdrücklich „Entnimm dem Text, welche Quellen dort als erneuerbar bezeichnet werden“ | erlaubt bei tatsächlich freigegebenem Informationsentnahmeziel (FP) |
| AL05 | Lernziel nicht bekannt, gemischter Wissens-/Lesewunsch | Lehrkraftwarnung statt automatischer Sperre/Löschung |
| AL06 | RF-Aussage „Kohle ist erneuerbar“, privater Schlüssel false | erlaubt; unabhängige Wahrheitserklärung „Die Aussage ist falsch“ zusätzlich = Leak (FP/FN) |
| AL07 | Gemischte Wasserkocher-Schritte ohne Reihenfolgenlabels | erlaubt; vollständige nummerierte Lösungskette im Arbeitsauftrag = Leak (FP/FN) |
| AL08 | Richtige MC-Option neben plausiblen Ablenkern | erlaubt; Option „Windkraft (richtige Antwort)“ oder Hilfe eliminiert alle Ablenker = Leak (FP/FN) |
| AL09 | Sichtbares Bildlabel/alt/Caption verrät Klasse; private plannedImage-Beschreibung allein | öffentliche Belegfläche = prüfen/Leak; private Planung allein kein belegter Leak |
| AL10 | Listening-only: vollständiger Auftrag „Welche zwei …? Wähle zwei“ und antworttragender Hörtext | erlaubt; Privattranskript bleibt privat, Auftrag bleibt vollständig/sichtbar. Auftrag nennt die beiden gesuchten Antworten = Leak |
| AL11 | Lücken intern [Lösung], private acceptedAnswers/Justification/Lehrkraftfeedback | kein pädagogischer Leak im korrekt projizierten View; öffentliche Payload darf diese privaten Felder nie enthalten |
| AL12 | Andere erreichbare Frage nennt gesuchte Klassifikation ausdrücklich | testweiter Hinweis mit Quell-/Ziel-ID; vorgesehenes geteiltes Lesematerial nach Lernziel erlaubt; keine pauschale Cross-question-Löschung |
| AL13 | Erstgenerierung → Reparatur → Variante → manueller Edit/Import | heutige vorhandene Reviewpfade prüfen; neuer Snapshot invalidiert alten Nachweis; Wiederprüfung vor Publish (geplanter Triggervertrag) |
| AL14 | Qualitätsreview nicht verfügbar/veralteter Fingerprint/unsicherer Befund | fehlende Prüfung transparent; kein grüner Nachweis oder Fehlerfreiheitsversprechen; veröffentlichungsrelevante bestätigte Lücke bleibt blockierend |

Abnahme getrennt: offline Source-/Regressionsverträge belegen Datenfluss/Belegvalidierung, nicht tatsächliche Modellqualität. Spätere gebundene fachliche Stichprobe muss positive und negative Fälle sowie DE/EN, Aufgabenformen und Lernziele enthalten; FP/FN einzeln mit Nennern berichten. Kein 100-%-Verhinderungsversprechen. Owner und nächster Schritt stehen in [GC-AI-01-Übergabe](ai-quality-answer-leak-20261013.md).
