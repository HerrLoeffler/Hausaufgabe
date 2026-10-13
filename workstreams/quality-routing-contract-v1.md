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

## GC-AI-01 · Wahrheitswert- und Antwortpositionsbias (13.10.2026)

**Zusätzlicher Nutzerbericht:** Gefühl, Richtig/Falsch-Lösungen seien fast immer „Richtig“ und bei anderen Aufgaben sei grundsätzlich die erste bzw. der erste Block richtig. Das ist ein zu prüfender Qualitätsverdacht, **noch kein empirisch bestätigter Befund am unbekannten Test**. Kein privater Aufgabenkorpus gelesen, keine Lösung umgedreht und kein bestehender Test geändert. Dieser Abschnitt erweitert denselben Auftrag; AL01–14 bleiben erhalten.

### Sourcebefund: fünf verschiedene Ebenen

Quellenstand weiterhin44ab6540/gc38; lowercase Repositorypfad app.js, Blobbd40ff428e4cb215f1bbf9c88adc0b3534f4b72a per Connector gegen lokalen readonly Baum abgeglichen.

| Ebene | Aktueller Sourcebefund und Grenze |
|---|---|
| Generierung/Schema/Validator | functions/lib/prompts.js18–20 und schemas.js60/103 verlangen eindeutige Flags/JSON-Boolean; validation.js8–16/109–113/246 erhält explizites false bzw. „false“/„FALSCH“ und weist fehlende/ungültige RF-Lösungen ab. schema false bei anderen Aufgabentypen ist keine RF-Quote. Keine ausdrückliche ausgewogene Wahrheitswert-/Positionsvorgabe im heutigen Generator/Review gefunden. |
| Batchkontext | index.js311–315 gibt früheren Blöcken nur type/text als Anti-Duplikatkontext; kein testweiter Wahrheitswert-/Positionsplan belegt. Einzelersatz/Varianten sollen den Gesamtplan später neu prüfen, statt nur lokal eine Quote zu erfüllen. |
| Import/Scaffold | [app.js3037ff](https://github.com/HerrLoeffler/Hausaufgabe/blob/44ab6540a9ac0cd4a144dd25eb84a7198d22498b/app.js#L3037): booleanLoose erhält false, FALSCH, string false und0. Fehlend/null/unverständlich wird in3182–3186 vorläufig true mit Warnung. Single/dropdown ohne markierte Lösung:3167 erste Option vorläufig richtig mit Warnung; mehrere richtige: erste behalten mit Warnung. initializeTypeData3658–3672 setzt leere neue MC-Scaffolds erste richtig/RF true. Keine belegte Umwandlung von explizitem false zu true im normalen Import. |
| Editor/Speicherung | copy-AI-Prompt app.js3007 zeigt bei single/dropdown zuerst ein correct:true-Beispiel: möglicher Beispielanker, kein Nachweis einer Modellursache. Editor zeigt private Lösung/kanonische Reihenfolge; Ownerpreview6487 mischt Antworten nicht. validateQuiz5967ff prüft MC-Kardinalität, aber keine bestätigte Herkunft vorläufiger Importlösungen; sanitize6064 macht Boolean. Source-Risiko: ein gewarnter Ersatzschlüssel besitzt keinen belegten eigenen Veröffentlichungsblock. Nicht behaupten, dass der konkrete50Aufgaben-Test so entstand. |
| Schülerdarstellung/Bewertung | Neue manuelle Quiz-App1915: shuffleAnswers false. Reguläre Hintergrund-KI-Erstellung app.js2955ff ohnesourceQuiz startet mit leerer sourceQuizId; index.js558 übergibt sourceSnap?.data() an ai-job.js37, das ausschließlich Boolean(sourceQuiz?.shuffleAnswers) übernimmt, ohneQuelle daher false. JSONimport3551ff verwendet quizDefaults ohneShuffleoverride. Similar/Variant erben Quellflag; Editor3791/6147 lädt und speichert später gewählte Policy. Das belegt die Startpfade, nicht den Flag des unbekannten Tests. SecureStudent496–498 zeigt RF-Labels immer true/false; diese Buttonposition ist unabhängig vom privaten correctBoolean. assessment-core.js165/195 mischt komplette öffentliche MC-Optionen nur bei shuffleAnswers true;257ff bewertet private opaque IDs statt Displayindizes.267/342 ===true hat bei malformed Werten false-Semantik, keine positive Validierung; unbekannte Handlerreachability nicht als Nutzerursache ausgeben. |
| Wiederaufnahme | secure-lifecycle.js140–143 übernimmt Shuffleflag nur bei ===true;404–419 rekonstruiert Vertrag mit privatem paperSecret und gespeicherter Policy, prüft authoringFingerprint. Bestehende deterministische Ordnung nicht als neue zufällige Reihenfolge bei jedem Reload oder statistisch qualifizierte Permutation behaupten. |

**Belegt gegenüber Vermutung:** Bereits vorhandene fehlende-Lösung-Defaults und ausgeschaltetes Antwortmischen können „erste/richtig“ verstärken. Ein All-true-Modelllauf, fehlerhafte private Schlüssel, ein tatsächliches False→True-Leck oder eine verkehrte Bewertung am berichteten Test sind nicht bestätigt. Zur Quantifizierung braucht der zuständige Owner Testzuordnung, Entwurf/Editor gegenüber echter Schüleransicht und tatsächliche RF-/MC-Anzahl; minimale berechtigte Stichprobe statt pauschalem Privatdatenexport.

### Vorgeschlagenes Qualitätskriterium und technische Grenzen

- Wahrheitswerte: Sachlich korrekte und sachlich falsche, klare, altersgerechte Aussagen bewusst entwerfen. Bei längeren geeigneten RF-Sets eine begründete Mischung planen und unabhängig gegen Inhalt/Text/Audio prüfen. Nicht bloß correctBoolean flippen, nicht richtige Aussage mit falschem Key speichern; eine neue plausible Gegenbehauptung muss fachlich geprüft werden. Kein triviales ABAB-Muster, keine erratbare feste Reihenfolge oder exakte50:50-Zwangsquote für1–3Aufgaben. Negations-/„immer“-/„nie“-Fallen nicht zum Standardmittel machen; Lesekompetenz/Lernziel und faire Schwierigkeit erhalten.
- Antwortpositionen: Quelle/Import/Scaffold von tatsächlich angezeigter Position unterscheiden. Bei single/dropdown korrekt markierte Optionen nicht stets an Index0 setzen; bei multi nicht stets nur den ersten Block. Gemischte Beispieldaten/Prompts statt ausschließlich first-correct-Anker vorschlagen. Ein bloßer Schemaerfolg oder first-correct-Testfixture belegt keine geeignete Modellverteilung.
- Unbekannte Lösung: Später fehlend/mehrdeutig/ungültig als ungelöst bzw. bestätigungspflichtig erhalten, strukturell reparieren oder Lehrkraft bestätigen lassen; keine stillschweigende validierte true-/Index0-Lösung. Eine heutige Importwarnung nicht als technische Sperre darstellen. Zulässige Importdialekte/0-/1-basierte Indizes ausdrücklich vertraglich festlegen; vorhandenes applyCorrectHint akzeptiert0 als erste,1 als erste im1-basierten Schema und kein allgemein belegtes correctIndex/correctIndices-Feld. Nicht durch Raten verschiedene Dialekte mischen.
- Mischen: Nur für semantisch unabhängige Auswahloptionen den ganzen Optionsdatensatz mit stabiler ID, Text/Bild/Audio und privater Lösungszuordnung permutieren; gespeicherten Schlüssel und Punkte unverändert lassen. „A und B“, „alle oben“ oder „die ersten beiden“ können sich auf Displaypositionen beziehen und würden blind gemischt inhaltlich falsch. Vorher positionsabhängige Inhalte überarbeiten/prüfen; feste fachliche Labels A/B etwa in einem Schaubild dürfen erhalten bleiben. Keine pauschale Alphabet-/Textheuristik.
- Snapshot: Ein bereits laufender Attempt behält Reihenfolge, ID-Zuordnung und Bewertungsgrundlage über Reload/Resume. Kein neues Shuffle bei jeder Darstellung. Audioantworten bleiben derselben Option zugeordnet; veröffentlichte Daten enthalten keine correct-Flags/private Schlüssel. RF-Buttonposition und RF-Wahrheitsmix sind getrennte Fragen; eine Buttonpermutation ist keine Lösung für All-true-Inhalte.
- Ordering/Matching/Grouping: Kanonische richtige Reihenfolge/Gruppen im Lehrkrafteditor ist privat erforderlich und keine Schülerpositionsverzerrung. Diese Schlüssel nicht zur Quote mischen; bestehende öffentliche Element-/ID-/Audioverträge erhalten.

### Messung und Anschluss ohne unbeauftragte Modellkosten

Vor jeder späteren Anpassung erwartete Lernziele, erlaubte Aufgabentypen und Samplingumfang festlegen. Je tatsächlichem Generatorlauf/Revisionssnapshot messen: RF nTrue/nFalse/nUngültig und Nenner; single/dropdown richtige Position nach Optionsanzahl, jeweils **private Ausgangsposition und öffentliche Displayposition separat**; multi Anteile pro Position und erste-Block-Muster relativ zur Anzahl korrekter Optionen. Modalität, Erstellung/Import/Variante und Lernziel getrennt ausweisen. Keine Antwort-/Schülertexte oder Schlüssel in allgemeine Telemetrie.

Kleine n sind unsicher:3/3True sind kein Nachweis eines defekten Generators. Ein langer einseitiger Test erhält eine konkrete Lehrkraftwarnung und inhaltliche Prüfung; begründete homogene Inhalte werden nicht automatisch verworfen. Eine uniforme Positionsreferenz ist nur für dafür geplante k-Optionsaufgaben1/k, bei multi unter passender Auswahlplanung r/k; nicht aus beliebigen Inhaltsaufgaben eine universelle Statistik ableiten. Stichproben-/Warnschwellen und Unsicherheitsangaben vor Ergebnisbetrachtung fachlich festlegen, ohne nachträgliche Bestfallauswahl. Keine ungemessene Bias-Quote erfinden.

An bestehende Batch-/Review-/Revisionsprüfung und den oben vorgeschlagenen Inhaltsfingerprint anschließen: testweite Verteilung vor Veröffentlichung, erneut nach Ersatz/Variante/Import/manuellem relevanten Edit. Keine bezahlte Prüfung pro Tastendruck, kein zusätzlicher Modell-/Providerstart in diesem Auftrag. Inhaltlich bestätigte Fehler blockieren betroffene Revision; bloß auffällige Verteilung zunächst warnen. Ein Mixplan muss Lernzielqualität schützen und darf für Lernende keine Antwortquote vorhersagbar machen.

### Zusätzliche Abnahmematrix (Spezifikation, noch keine neue Implementierung)

| ID | Fixture/Grenzfall | Erwartung |
|---|---|---|
| PB01 | RF-Schlüssel false und Texte „false“/„FALSCH“ sowie Import0; true-Kontrollen | Explizites false bleibt im erlaubten Dialekt false: normalize→save/JSON→reopen→publicpaper→grade; false-Abgabe volle, true-Abgabe keine Punkte. Functions numerisches0 ist derzeit kein Boolean; dort vertraglich ablehnen statt importtolerantes Verhalten voraussetzen. |
| PB02 | Fehlend/null/unerkanntes RF; Single ohne korrekte Option; mehrere correct bei single | Heute Quellen-Defaults/Warnung dokumentiert. Künftiges Gate muss fehlende Bestätigung erkennen, nicht true/Index0 als geprüfte Lösung ausgeben. Keine stillschweigende neue Defaultantwort. |
| PB03 | Ein oder drei sachlich richtige RF-Aussagen | Keine automatische50:50-Sperre/Keyflip; geringe Fallzahl offen nennen. |
| PB04 | Langes geeignetes RF-Set nurtrue oder deterministischABAB | Verteilungswarnung/Planprüfung, danach sachliche unabhängige Prüfung; keine falschen Keys zum Quotenfüllen. |
| PB05 | Single/Dropdown korrekte Optionen an unterschiedlichen Quellpositionen; Multi verteilte und erster-Block-Referenzen | Metrik trennt Entwurf/Ownerpreview von public Display; persistierte korrektFlags/IDs bleiben unverändert; Ersatz und Variante testen Gesamtscope. |
| PB06 | Shuffle true/false, Save/Reopen/Resume mit vorhandenen Flags | Vorhandene unterstützte Policy tatsächlich anwenden; gleiche Attemptrevision stabil; Grade für dieselbe korrekte opaque ID unverändert, falscheOption bleibt falsch. |
| PB07 | MC-Audioantworten mit unterschiedlichen sourceText/Assets | Ganze Option mit Audio/ID permutiert; keine entkoppelte Stimme oder Position→Key-Verwechslung; alte Text-/Audiofreigabegates erhalten. |
| PB08 | Option „alle oben/die ersten beiden/AundB“ mit Positionsbezug versus fixe SchaubildlabelsA/B | Blindes Shuffle verhindern/inhaltlich überarbeiten; fachliche Labels nicht pauschal verbieten. |
| PB09 | Orderingkanonischsortiert im Editor, öffentlichgemischt; Matching-/Grouping-Mitgliedschaften | Kein first-answer-Biasalarm allein wegen privatem Key; Zuordnung/Audio/zulässige Reihenfolgen und öffentliche Trennung bleiben erhalten. |
| PB10 | Privater correctBoolean/option.correct/answerKey und aktuelle RF-Buttonlabels | Öffentliche Keys fehlen; „Richtig“ ersterButton erlaubt und kein All-true-Beleg; entscheidend privater fachlich geprüfter Key/Grade, nicht Labelposition. |

**Frische begrenzte Bestandsprüfung:**40/40 vorhandene synthetische Tests aus functions/test/validation.test.js, assessment-functions/test/assessment-parity.test.js und audio-answer-contract.test.js bestanden (gebündelter Node). Sie belegen vorhandene Validator-, deterministische Shuffle-/Fingerprint- und Audioverträge im Source-Snapshot; keine neue Mixregel, keinen vollständigen Browser-Save-/Resume-Test und keine tatsächliche Modell-/Nutzerverteilung. Zusätzlicher synthetischer Source-Smoke: false/string false/FALSCH über Functionsnormalize→JSONroundtrip→Core bei beiden Shufflepolicies erhalten; false volle/true keine Punkte, gleiche privateSecret-Revision stabil; missing/null/0/unknown im Functionsvalidator abgelehnt. Das ist kein Appimport- oder Browser-Reopen-/Resume-Test. Systemnode zunächst nicht im PATH; gebündelten Runtimepfad genutzt, nichts installiert. Keine neuen Producttests oder Codeänderungen.

## GC-AI-01 · Gesammelte Hinweise im Generierungscode (13.10.2026)

Nutzergrenze: „nur merken und irgendwo in unseren Code vermerken … bei der Erstellung … berücksichtigen“. Zusätzliches Gruppierungsfoto tatsächlich angesehen; nur anonyme fachliche Einordnung, kein Foto/Kontoheader oder Testexport gespeichert. Der Auftrag bleibt GC-AI-01 und umfasst einen kleinen Promptvermerk, keine Umsetzung der zuvor vorgeschlagenen Publish-/Import-/Shufflemechanik.

**Gruppierungspräzisierung:** „Jeden Begriff genau einmal“ meint jedes konkrete Element, nicht jede Kategorie. Sechs unterschiedliche Beispiele in drei Kategorien mit je zwei Elementen verletzen das nicht. Batterie/Brennstoff, fahrendes Fahrrad/strömendes Wasser und Sonnenlicht/Röntgenstrahlung können unter dem beabsichtigten Blickwinkel plausibel zugeordnet sein; ohne benannten Zustand/Aspekt können Gegenstände mehrere Energieformen besitzen. Das Foto beweist daher nicht, dass alle Zuordnungen falsch sind. Bei einer exklusiven Gruppierung muss unter dem gegebenen Kontext und den angebotenen Kategorien genau eine fachlich passende Gruppe bestehen; nötigen Kontext ergänzen, ohne die fertige Kategorie im Element zu nennen. Gleiche sichtbare Begriffe in verschiedenen Gruppen können trotz unterschiedlicher interner IDs ununterscheidbar sein.

**Konkreter Codevermerk:** functions/lib/prompts.js erhält im vorhandenen SYSTEM drei benannte Lehrkrafthinweise: lernzielabhängiger Antwortverrat (AL), Wahrheitswerte/Antwortpositionen ohne Keyflips oder starre Quote (PB), eindeutige kontextbezogene Gruppierung. index.js165 nutzt SYSTEM als Default für die vorhandene strukturierte Generierung/Einzelersatz und deren Reparaturen; REVIEW_SYSTEM und der separate WHOLE_TEST_REVISION_SYSTEM bleiben unverändert. Es ist damit eine tatsächlich verbundene Generierungsanweisung im Kandidaten, kein losgelöster Kommentar. Bereits nötige Kandidaten, Lese-/Hörinformationen und vollständige öffentliche Audioaufträge bleiben erhalten. Kein neuer Typ/Schema, keine Mehrfachdrop-UI, kein Validator-/Bewertungsumbau, keine Savedtestkorrektur und keine Daten-/Provideränderung.

Die aktuelle grouping-Projektion assessment-core.js221ff gibt Kategorien und einzeln identifizierte Elemente aus; der private Schlüssel ordnet Item-ID einer Gruppe zu. Die öffentliche Bedienung hat eine Zuordnung pro Element, mehrere Elemente pro Kategorie. Dieses Verhalten bleibt erhalten; keine neue Mehrfachverwendung versprechen.

| ID | Kurzer Abnahmefall | Erwartung |
|---|---|---|
| GR01 | Sechs unterscheidbare Beispiele, drei Kategorien, je zwei im ausdrücklich genannten Betrachtungsaspekt eindeutig zuordenbar | erlaubt; „genau einmal“ je Element, Kategorien mehrfach nutzbar |
| GR02 | „Batterie“ ohne Aspekt oder eine reale Mehrfachrelation im angebotenen Kontext | Zustand/Blickwinkel präzisieren oder andere erlaubte Aufgabenform; keinen unpassenden exklusiven Schlüssel erzwingen, Kategorie nicht direkt ins Element schreiben |
| GR03 | Derselbe sichtbare Begriff in mehreren Gruppen, ununterscheidbare Elementvorkommen | unterscheidbare kontextualisierte Elemente wählen; verschiedene opaque IDs allein lösen fachliche Uneindeutigkeit nicht |

**Status:** Code-Promptvermerk im isolierten DraftPR228 mit erfolgreicher Code-CI, nicht integriert/nicht auf Staging aktiv; Promptanweisungen sind keine Garantie künftiger Modellqualität. AL01–14/PB01–10 bleiben unverändert; vorherige geplante mechanische Gates sind weiterhin offen. Exakter Branch/Code/PR, Prüfungen und Übergabe stehen im bestehenden [GC-AI-01-Handoff](ai-quality-answer-leak-20261013.md). Kein Deploy aus diesem Auftrag.
