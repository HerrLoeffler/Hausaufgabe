# Band 17 - Aufgabenentwicklung, Qualität und Grünprozess

## 17.1 Auftrag und fester Platz in der Firma

„Aufgabenentwicklung und Qualität“ wird ein eigener sichtbarer Arbeitsblock. Er verbindet bewährte Aufgabenformate, neue Interaktionen, Generatorqualität, Bewertung, Lernwege, Fehler und Veröffentlichungen. Martin sieht dort, was zuverlässig verwendbar ist, was erprobt wird, welche Ursachen eine Freigabe verhindern und welcher konkrete nächste Schritt fehlt. Der Block gehört fachlich zu Produkt und Pädagogik, technisch zu Entwicklung und Betrieb. Ein verantwortlicher Owner pro Vorgang hält die Zusammenarbeit zusammen.

Die Firmenzentrale führt die Arbeits- und Nachweissicht. Lernaufgaben, private Lösungsschlüssel, Abgaben und Bewertungen bleiben in ihren bestehenden Fachsystemen. Sie baut weder eine zweite Bewertungsengine noch einen zweiten Lernstandsspeicher. Der vorhandene Methodenfundus unter docs/learning ist die Einstiegssammlung. Der freigegebene pädagogische Laufzeitpool bleibt eine andere, strengere Stufe.

„Lernaufgabe“, „Aufgabenformat“, „Lernmethode“, „Generatorprofil“ und „Lernweg“ sind eigenständige Begriffe. Eine Zeitachse ist eine Interaktion; verteiltes Wiederholen eine Methode; eine konkrete Zeitachsenfrage ein Inhalt; ein Generatorprofil beschreibt eine Erzeugungsfassung; eine adaptive Sitzung kombiniert Aktivitäten. Ein gemeinsamer technischer Renderer darf mehrere Methoden tragen.

## 17.2 Bestehende Facharbeit zusammenführen

| Bestehender Chat / Taskbezug | Beitrag zum Arbeitsblock | Erhält seine Zuständigkeit |
| --- | --- | --- |
| GC · Erweiterte Aufgabentypen - Plan… / GC-EXTENDED-QUESTION-TYPES-01 | Format-/Methodenfundus, Wiederverwendung, bestehende Interaktionsprinzipien und belegte Erkenntnisse | Bestehende Katalog-IDs und fachliche Originalübergaben |
| GradeCrew-Design modernisieren / bestehender visueller Arbeitsstrang, Bezug GC-VISUAL-PROTOTYPE-AI-02 und Issue255 anhand Quellen | Konkrete Bedienung, Darstellung, komplexe visuelle Kandidaten und zugehörige technische Nachweise | Eigener tatsächlicher Task-/Branchscope; Chatname allein ist kein Ownerbeweis |
| GC · Adaptives Lernen - Konzept & Realisierung / GC-ADAPTIVE-PRACTICE-01 | Auswahl und Reihenfolge, Hilfen, unabhängige Anschlussproben, Lernstand und Fundusnutzung | Eigene Adaptionslogik, Lernermodelle und Pilotgrenzen |
| GC · Kapiteltests - Konzept & Machbarkeit / GC-CHAPTER-TESTS-01 | Kapitelcontainer, Ausgabe-/Abgabeverträge, historische Bewertung und Antwortvergleich | Bestehende Kapitelintegration; kein zweites Kapitelmodell |
| GC · Pädagogisches Konzept | Fachkriterien, Bewertungsraster, Unterrichtstauglichkeit, neuer Plan für schnelle Lehrkraftkorrektur | Bestehender Konzept-/Korrekturauftrag; keine Produktübernahme durch die Firmenzentrale |

Die ersten drei Zeilen bilden die in dieser Revision aus aktuellen Quellen erkennbare Dreierstruktur. Kapitel und Pädagogik sind angeschlossene Fachabhängigkeiten. Die Hauptzentrale bestätigt vor Umsetzung die genaue federführende Task und Writergrenzen; es werden keine drei neuen Chats angelegt. Tatsächlich unabhängige Prüfung darf nicht bloß dieselbe Implementierung unter einem anderen Rollennamen bestätigen.

Verifizierte Chatreferenzen: Erweiterte Aufgabentypen 01a15a72-d74c-79a3-a180-2bd47a23d663; Designmodernisierung 01a1638a-ad42-77d2-885a-77fd743f774f; Adaptives Lernen 01a158f7-7f85-77e1-9448-b32682030c05; Kapiteltests 01a158cb-3f19-7821-a895-cf11290f8506; Pädagogisches Konzept 01a1280a-c9f4-73a3-a12a-7b2b93a5ba5a. Die logischen Rollen bleiben beim Chatwechsel stabil; technische Bindungen werden nach Band 06 erneuert.

## 17.3 Bestandsaufnahme ohne unberechtigte Freigabe

Zuerst werden alle heute tatsächlich unterstützten Formate aus dem bestätigten Runtimebestand inventarisiert. „Funktioniert gut“ aus dem Nutzerbericht bleibt wertvolle Evidenz, wird aber um konkrete Fassung, Einsatzmodus und bekannte Grenzen ergänzt. Bestehender Schulbetrieb wird durch eine unvollständige neue Inventur nicht automatisch deaktiviert. Die Übersicht unterscheidet „Bestand in Verwendung; Nachweis ergänzt“ von „neu qualifiziert“.

Für jedes Format werden Katalog-ID, Implementierungs-ID, Schema, Renderer, Validator, Generator-/Reparaturprofil, Bewertungsweg, Lösungsschutz, Editor, Vorschau, Export, Resume und unterstützte Clients zugeordnet. Unbekannte Bausteine stehen ausdrücklich als Lücke. Eine Methode erhält nur dann einen neuen technischen Typ, wenn der vorhandene Vertrag sie nicht angemessen trägt.

Der erste Pilot umfasst ein bewährtes Referenzformat, einen komplexen visuellen Kandidaten und einen echten bekannten Fehlerfall. Die konkrete Auswahl erfolgt nach Quelleninventur. Beispielkandidaten sind Wortmarkierung als berichteter Fehlerfall und Winkelmessung oder Bruchraster als komplexe Interaktion. Diese Beispiele sind keine neue Gesamtfreigabe dieser Formate.

## 17.4 Die zentrale Qualitätsansicht

Die erste Ansicht zeigt vier Gruppen: im bestätigten Scope freigegeben, zur Prüfung, mit bestätigtem Fehler, noch ohne belastbare Prüfbasis. Pro Zeile stehen Format/Item, Version, Modus, Zielgeräte, Owner, nächste Aktion, Qualitätsstatus mit Grund, Aktualität und separate Lieferstufe. Ein Klick öffnet die Formatakte.

Die Akte hat fünf Abschnitte: Bestand und Nutzung; Kandidat und Änderungen; Prüfläufe und Befunde; Fehlerbehebung; Freigabe und Beobachtung. Sie zeigt die betroffenen Inhalte, Generatorprofile und Releases über Verweise. Ein aufklappbarer Vergleich erklärt, was sich gegenüber der letzten geeigneten Fassung geändert hat.

Der wichtigste Knopf hängt vom Zustand ab: „Befund prüfen“, „Korrektur beauftragen“, „Nachprüfung öffnen“ oder „Freigabekandidat prüfen“. Es gibt keinen frei bedienbaren Schalter, der ohne Beleg Grün setzt. „Für Testseite freigegeben“ und „auf Schul-Live veröffentlicht“ sind verschiedene Anzeigen. Grün allein erhält immer eine verständliche Scopebeschriftung.

Auf Heute erscheinen ausschließlich entscheidungsrelevante Änderungen: neuer schwerer Fehler, blockierte Wiederfreigabe, fehlender Prüfer, überfälliger nächster Schritt oder anstehende Veröffentlichung. Einzelne gewöhnliche Testläufe überfluten den Chefbrief nicht. Fachowner können die vollständige Laufhistorie öffnen.

## 17.5 Drei getrennte Statusachsen

Arbeitsstatus beschreibt die Bearbeitung: erfasst, zugeordnet, in Arbeit, wartet, zur Prüfung, erledigt. Qualitätsstatus beschreibt die belegte Eignung einer Fassung für einen Scope. Lieferstufe beschreibt, wo diese Fassung tatsächlich angekommen ist. Keine Achse ersetzt eine andere.

| Qualitätsanzeige | Bedeutung | Erforderliche Folge |
| --- | --- | --- |
| Grau - ungeprüft oder Nachweis veraltet | Keine aktuelle vollständige Entscheidungsgrundlage | Fehlende Prüfbasis benennen und qualifizieren |
| Gelb - Prüfung offen | Kandidat oder konkreter Verdacht; Pflichtnachweise noch offen | Zuständigen Prüfer, fehlenden Fall und nächsten Schritt anzeigen |
| Rot - bestätigter Fehler im Scope | Mindestens ein reproduzierbarer freigabeblockierender Befund | Betroffenen neuen Einsatz sperren und Reparatur-/Rückfallplan führen |
| Grün - für benannten Einsatz qualifiziert | Alle für diese Fassung erforderlichen Kriterien bestanden, aktuelle Annahme dokumentiert | Nur den benannten Scope nutzen; Änderungen und Vorfälle weiter beobachten |

Zusätzlich gibt es den Einsatzstatus: experimentell, interner Test, begrenzter Pilot, regulärer Einsatz, zurückgezogen. Ein bewusst experimenteller Kandidat kann auf einer getrennten Testseite ausprobiert werden, ohne als Grün zu gelten. Seine Nichtfreigabe bleibt für Testende erkennbar. Sicherheitskritische Fehler dürfen auch dort nicht durch das Label „experimentell“ übergangen werden.

Rot in einer neuen Aufgabenrevision macht eine unveränderte ältere Fassung nicht pauschal rot. Ein Befund in einer gemeinsam genutzten Bewertungsfunktion kann dagegen mehrere Formate betreffen. Der Geltungsbereich wird aus tatsächlichen Abhängigkeiten ermittelt und begründet.

## 17.6 Was Grün konkret voraussetzt

Eine Qualitätsbewertung bindet mindestens: Format-/Inhaltsrevision, Aufgaben-/Antwortschema, Renderer-/Validator-/Graderquelle, Generator-/Prompt-/Modellkonfiguration soweit beteiligt, Bewertungsraster, Materialhashes, Prüfsuiteversion, Modus, Clientmatrix und Zielumgebung. Ein Deploymanifest bindet zusätzlich die tatsächlich veröffentlichten Komponenten. Fehlende Bindungen verhindern einen umfassenden Grünanspruch.

| Gate | Was geprüft wird | Mindestbeleg |
| --- | --- | --- |
| Q1 Fachliche Aufgabe | Lernziel, korrekte Inhalte, eindeutiger Auftrag, zulässige Alternativen, passende Punkte | Fachlich geprüfte Referenzfälle und benannte offene Grenzen |
| Q2 Darstellung und Bedienung | Grafik/Skala, Lesbarkeit, Touch-/Tastaturalternative, Zustände, Hilfen | Tatsächliche Browser-/Geräteprüfung im beanspruchten Scope |
| Q3 Technischer Vertrag | Erzeugung, Validierung, Editor, Vorschau, Abgabe, Speicherung, Resume und Export | Reproduzierbare Tests an exakter Quelle |
| Q4 Bewertung | Richtige/falsche/leere/teilweise Antwort, äquivalente Lösungen, Grenzwerte, manuelle Korrektur | Unabhängig erwartete Ergebnisse und Servernachweise |
| Q5 Schutz und Modus | Private Schlüssel, unveränderlicher Prüfstand, idempotente Abgabe, erlaubte Lösungssicht | Relevante aktuelle SEC-/PRIV-Prüfbelege |
| Q6 Erzeugung und Reparatur | Gültige fachliche Ergebnisse, Ablehnung fehlerhafter Ausgaben, begrenzte Reparatur, keine stille Formatänderung | Kuratierter Testbestand plus ausdrücklich autorisierte echte Erzeugungsstichprobe, falls diese Fähigkeit beansprucht wird |
| Q7 Annahme und Betrieb | Unabhängige Prüfung, Zuständigkeit, Beobachtung, Rücknahme und nötige Nutzerabnahme | Gebundene Qualitätsentscheidung mit Geltungsbereich |

Ein für den Scope nicht relevantes Gate erhält eine begründete Ausnahme mit Reaktivierungsauslöser. Es wird nicht als bestanden markiert. Zum Beispiel benötigt eine rein manuell erstellte Aufgabe keinen Nachweis einer nicht verwendeten KI-Erzeugung. Eine unveränderte Formatfreigabe ersetzt aber niemals die Inhaltsvalidierung eines neu erzeugten Items.

Produktversprechen zur Lernwirksamkeit erhalten eine zusätzliche eigene Evaluationsstufe. Technische und fachliche Qualifikation für einen Pilot belegt nicht, dass Lernende dadurch nachweislich besser lernen. Aus falschen Antworten kann zunächst ein Untersuchungsanlass entstehen, keine gesicherte Diagnose.

## 17.7 Prüfmatrix und Referenzbestand

Die Prüfmatrix wird aus tatsächlichen Risikofaktoren gebildet: Format, Lernziel, Modus, Schwierigkeit, Sprache, Einheiten, Eingabegerät, Browser/Client, Hilfen, Antwortfall, Verbindung und Datenversion. Vollständige Kombination aller Dimensionen wäre schnell unpraktisch. Jede sicherheits- oder bewertungskritische bekannte Grenze wird direkt geprüft; übrige repräsentative Kombinationen werden begründet ausgewählt. Abdeckungslücken bleiben sichtbar.

Ein kuratierter Referenzbestand enthält Aufgaben, erwartete gültige und ungültige Antworten, Bewertungsraster, Äquivalenzen, Grenzfälle und Herkunft. Erwartete Ergebnisse werden unabhängig von der zu prüfenden Implementierung festgelegt. Eine Suite, die aus derselben fehlerhaften Funktion ihr Soll berechnet, bestätigt nur sich selbst.

Beispiele: Bruchraster bewertet den gleichen Anteil unabhängig vom Zellmuster; Zahlenstrahl bewertet fachlichen Wert unabhängig von Pixelposition; Winkel prüft innerhalb, exakt auf und außerhalb der vereinbarten Toleranz; Diagramme prüfen Skalen und Datenextreme; Wortmarkierung prüft Tokenisierung und tatsächliche Auswahlbarkeit; Textbelege prüfen fachliche Tragfähigkeit statt bloßer Wortzahl. Lösungen bleiben bei Prüfungsaufgaben serverseitig.

Für generative Qualität wird pro Profil eine vorab festgelegte Stichprobe mit verschiedenen Lernzielen und Schwierigkeiten gebildet. Anzahl, Auswahlverfahren, Wiederholungen, Budget und Akzeptanzregel werden vor dem Lauf dokumentiert. Kritische Fehler sind nicht durch einen guten Durchschnitt kompensierbar. Eine kleine Stichprobe begründet keine statistische Fehlerfreiheitsgarantie. Providerläufe werden nicht allein für einen schöneren Erfolgswert wiederholt.

Ein getrennter, versionierter Prüfbestand dient zur Kontrolle nach einer Optimierung. Wenn alle Beispiele ständig in Prompts und Reparaturen verwendet werden, verlieren sie als unabhängiger Prüfmaßstab an Aussagekraft. Änderungen am Referenzbestand benötigen fachliche Begründung; ein fehlgeschlagener Fall wird nicht entfernt, nur damit die Suite grün wird.

## 17.8 Ablauf von Rot zu Grün

1. Befund speichern: beobachtetes Verhalten, erwartetes Ergebnis, genaue Fassung, Modus, Umgebung, datensparsame Reproduktion, Schwere und Quellenbeleg. Originalmeldung und geprüfter Befund bleiben unterscheidbar.
2. Auswirkung bestimmen: einzelnes Item, Format, gemeinsame Bewertungslogik, Generatorprofil oder Client. Betroffene neue Veröffentlichungen beziehungsweise Auswahl gezielt blockieren; tatsächliche Eingriffe benötigen den vorhandenen autorisierten Betriebsweg.
3. Verantwortlichen festlegen: ein federführender Owner, beteiligte Rollen, erwartetes Ergebnis und nächste Aktion. Zentrale koordiniert; Fachchat führt aus.
4. Ursache prüfen: Reproduktion oder begründete Diagnosehypothese. Ein fehlender Originalentwurf wird als fehlend dokumentiert. Vermutete Ursache erhält keinen „behoben“-Status.
5. Regression sichern: der konkrete Fehlerfall muss gegen den betroffenen alten Stand scheitern, sofern technisch sinnvoll reproduzierbar. Sollverhalten fachlich begründen.
6. Begrenzte Korrektur erstellen: bestehende Schnittstellen und Bestandsinhalte erhalten. Bewusste Schema-/Bewertungsänderung bekommt Migration und Kompatibilitätsprüfung.
7. Nachprüfen: neuer Fehlerfall, angrenzende Risiken und betroffene Referenzformate. Breite Neuprüfung nur bei geänderter gemeinsamer Grundlage oder konkretem Anlass.
8. Unabhängig beurteilen: Befundbehebung, Auswirkungen und finale Quelle prüfen. Ein erneuter Reviewerauftrag wird gezielt am Delta begründet, keine unendliche Vollreviewfolge.
9. Neue Qualitätsentscheidung speichern: genaue Fassung, Gateergebnisse, Grenzen und Prüfer. Vorher bleibt der Kandidat gelb beziehungsweise rot. Alte abgelehnte Fassung bleibt historisch erhalten.
10. Veröffentlichung getrennt führen: Release-Train, passende Komponenten, Nutzer-/Gerätenachweise und ausdrückliche Freigabe. Erst tatsächliche Receipts ändern die Lieferstufe.
11. Beobachtung abschließen: Fehlerklasse im Fundus dokumentieren, Schutztest behalten, fällige Nachkontrolle bestimmen. Eine gesendete Rückmeldung oder ein geschlossener PR ersetzt den Wirksamkeitsbeleg des Fixes nicht.

Der Arbeitsauftrag bleibt derselbe, auch bei Chatwechsel oder mehreren Reparaturversuchen. Attemptzahlen, Kostenreservierungen und fehlgeschlagene Läufe werden erhalten. Bei zweimal demselben erfolglosen Reparaturansatz wird als vorgeschlagene Stopregel eine Ursachenentscheidung verlangt; ein dritter blinder identischer Lauf wird nicht automatisch gestartet. Strengere bestehende Budgets gehen vor.

## 17.9 Dauerhaft gut durch gezielte erneute Prüfung

Prüfauslöser sind Änderungen an Renderer, Schema, Validator, Bewertung, Lösungsschutz, Generator-/Promptprofil, Material oder relevanter Host-/Clientversion; außerdem neue bestätigte Vorfälle, gehäufte Qualitätsmeldungen und Ablauf einer festgelegten Gültigkeitsbedingung. Der Abhängigkeitsindex leitet daraus betroffene Qualitätsentscheidungen ab.

Eine lokale Textänderung in einer unverwandten Firmenakte startet keine vollständigen Lernaufgabentests. Ein Graderwechsel verlangt dagegen die betroffenen Format- und historischen Bewertungsfälle. Eine reine dokumentarische Korrektur kann mit dokumentierter Wirkungsprüfung ohne neuen Produktlauf enden. Berechtigte technische oder fachliche Zweifel dürfen nicht als „nur Dokumentation“ wegdefiniert werden.

Drei Prüfungsebenen sind vorgesehen: schnelle deterministische Vertrags-/Regressionstests bei relevanter Änderung; größere synthetische Abläufe vor qualifiziertem Kandidaten; begrenzte echte Modell-/Geräteläufe für tatsächlich beanspruchte Fähigkeiten. Letztere benötigen vorhandene Berechtigung und Budget. Regelmäßige synthetische Kontrollen werden erst als konkrete Automation aktiviert, einschließlich Umfang und Stop. Es gibt keinen Dauertest mit echten Schülerantworten.

Ein fehlender oder abgebrochener Prüflauf bedeutet nicht automatisch bewiesenen Produktfehler. Er liefert aber keinen Grünbeleg. Ein instabiler Test wird als solcher mit Owner geführt; Wiederholungs-PASS löscht frühere Fehler nicht. Bei für die Freigabe entscheidender Instabilität bleibt der Scope ungeklärt, bis Ursache oder belastbarer Ersatznachweis vorliegt.

Beobachtungsfenster werden profilabhängig begründet. Es gibt keine universelle Zahl von sieben Tagen oder hundert Antworten, die jedes Format automatisch grün macht. Vorlauf, Beobachtungsmenge und Abbruchgrenzen müssen zum tatsächlichen Einsatz passen.

## 17.10 Qualität an konkrete Fassungen binden

Vorgeschlagene zentrale Objekte: TaskFormatProfile, ItemReference, QualificationBasis, TestRunReference, QualityFinding, QualityDecision und RevalidationEvent. Sie erweitern die vorhandenen Quellen-/Evidenceverträge. Rohberichte bleiben in den verantwortlichen Test-/Fachsystemen; die Zentrale speichert begrenzte Zusammenfassung, Hash und autorisierte Referenz.

QualificationBasis enthält subjectType, subjectId, revision, mode, environment, supportedClients, schemaVersion, rendererHash, validatorHash, graderHash, rubricVersion, generatorProfileRef, materialHashes, suiteVersion und dependencyRefs. Nicht beteiligte Felder werden begründet als nicht relevant geführt. Ein zusammengesetzter Basis-Hash verwendet den bestehenden kanonischen Hashvertrag.

QualityDecision enthält basisHash, gateResults, acceptedScope, reviewerRefs, findingRefs, decision, decidedAt, validUntil oder konkrete Revalidierungsauslöser und supersedes. Der Server prüft Rechte und aktuelle Abhängigkeiten bei Annahme per CAS. Alle Pflichtbelege müssen dieselbe Basis unterstützen. Das Ändern eines Graders zwischen Review und Annahme führt zu needs_revalidation.

TestRunReference enthält Quelle/Build, Suite, Umgebung, tatsächlich gestartete und abgeschlossene Fälle, Ergebnisse, ausgelassene Fälle, Artefakthashes, Zeit, bekannte Kosten und Grenzen. „72 Fälle geplant“ ist kein Lauf mit 72 bestandenen Fällen. Ein nicht ausgeführter Fall bleibt offen.

QualityFinding enthält beobachteten Befund, Reproduktionsstand, betroffene Basis, Schwere, Ursachenhypothese, Owner, Regression, Fixreferenz und Verifikationsstatus. Der gleiche Fehler kann mehrere Kundenmeldungen und Formate betreffen, bleibt aber ein zusammengeführter technischer Vorgang mit Referenzen.

## 17.11 Auswahl und Veröffentlichung technisch begrenzen

Die bestehende Aufgabenplattform ist für die tatsächliche Auswahl verantwortlich. Ein späterer qualifizierter Reader kann ihr eine freigegebene Liste von Format-/Itemfassungen und Einsatzprofilen bereitstellen. Der Fachowner prüft beim Einbau die gemeinsame Sourceversion; die Firmenzentrale darf keine Laufzeitfreigabe allein in ihrer lokalen Anzeige behaupten.

Neue Nutzung benötigt passende Qualitätsentscheidung und zum Modus passende Veröffentlichung. Ein experimentelles Profil wird nicht im benoteten Test angeboten. Bei Entzug wird zunächst verhindert, dass betroffene neue Items/Versuche starten, soweit das tatsächliche technische Profil diese Aktion erlaubt. Laufende Prüfungen bleiben an ihren unveränderlichen Snapshot gebunden. Ein schwerer Vorfall verlangt eine gezielte verantwortliche Entscheidung über deren weiteren Umgang.

Rollback bevorzugt die letzte für den gleichen Modus und Datenstand geeignete bestätigte Fassung. Ein Daten-/Schemawechsel kann diesen Rückweg verhindern; dann bleibt die Funktion im betroffenen Scope gesperrt. Historische Abgaben werden nicht unbemerkt nach einem neuen Raster umbewertet. Erforderliche Nachkorrektur braucht einen eigenen nachvollziehbaren Prozess mit Prüfung und Kommunikation.

Eine Qualitätsanzeige schaltet weder Website noch Featureflag automatisch um. Schreibaktionen besitzen ein eigenes, genau gebundenes Profil. Insbesondere bleibt Schul-Live an seine ausdrücklich freigegebene Releasekette gebunden.

## 17.12 Aus Rückmeldungen einen verlässlichen Fundus entwickeln

Rückmeldungen kommen aus technischen Tests, autorisierten Qualitätsaggregaten, Lehrkraftkorrekturen, Kundenmeldungen und bewusst durchgeführten Lernpiloten. Ein häufig falsches Ergebnis kann auf schwierigen Inhalt, Vorwissenslücke, Sprache, Darstellung, Fehlbedienung oder Bewertungsfehler hindeuten. Der Eingang erzeugt deshalb zunächst eine Hypothese mit konkurrierenden Erklärungen.

Ein angenommener Befund führt zu einer konkreten Änderung: Aufgabe verbessern, alternatives Beispiel ergänzen, Validator schärfen, Raster korrigieren, Hilfestufe ändern oder ungeeigneten Inhalt aus der Auswahl nehmen. Danach folgt eine passende neue Prüfung. Änderungen an fachlichen Grundsätzen benötigen begründete fachliche Annahme; ein einzelner Fall ändert nicht automatisch globale Prompts oder Lernregeln.

Neue generierte Aufgaben erhalten zunächst Kandidatenstatus. Geeignete, geprüfte Fassungen können mit Kompetenz-/Lernzielbezug, zulässigem Modus, Herkunft, Rechten, Hilfen und Bewertungsrahmen in den vorhandenen Fundus übergehen. Wiederverwendung verringert unnötige Neuerzeugung. Ein Cache spart Aufrufe, bestätigt aber keine Qualität; erneute Auswahl prüft aktuelle Gültigkeit und Lernzweck.

Die Firmenzentrale erhält vorrangig Aggregatwerte und pseudonyme Fehlerreferenzen. Unredigierte Schülerantworten, Namen, komplette Schulakten und geheime Lösungen werden nicht für das allgemeine Firmenwissen gesammelt. Konkreter pädagogischer Datenbedarf bleibt beim zuständigen Lernsystem mit seinem Zweck-, Rechte- und Aufbewahrungsvertrag. Eine optionale fachliche Einsicht erfolgt über autorisierte Detailwege.

Lernen des Systems bedeutet zunächst versionierte, geprüfte Verbesserung von Bestand, Regeln und Konzepten. Es bedeutet kein automatisch gestartetes Modelltraining. Individuelle Lernempfehlungen bleiben beim adaptiven Fachsystem; die Firmenzentrale steuert dessen Qualität und offene Entscheidungen.

## 17.13 Kennzahlen mit Handlung

| Kennzahl | Saubere Grundlage | Mögliche Handlung |
| --- | --- | --- |
| Anteil qualifizierter Formate | Anzahl für denselben Modus und Clientumfang qualifizierter Fassungen / inventarisierte relevante Formate | Fehlende konkrete Gates priorisieren |
| Fehler bei Erzeugung | Ungültige Ergebnisse / tatsächlich abgeschlossene Erzeugungen, nach Profil und Fehlerklasse | Validator-/Prompt-/Fachursache untersuchen |
| Fachliche Rückgabequote | Zurückgewiesene Items / tatsächlich fachlich geprüfte Items | Inhaltliche Problemgruppe prüfen; Prüfselektion beachten |
| Reparaturaufwand | Versuche, Zeit und bekannte Kosten pro bestätigter Fehlerklasse | Wiederkehrende Ursache zuerst lösen |
| Erneute Fehler | Wiederauftreten einer bereits behobenen Klasse in vergleichbarem Scope | Regression oder Abhängigkeitsabdeckung ergänzen |
| Freigabealter und Abdeckung | Aktuelle Gültigkeit, Daten-/Clientumfang, ausgelassene Fälle | Gezielt revalidieren statt alles neu testen |
| Korrekturaufwand Lehrkraft | Bewusst erhobener Aufwand und Übersteuerungsgründe | Vorhandenen klassenweisen Korrekturablauf verbessern |
| Lernzielhinweise | Vergleichbare unabhängige Proben, Hilfegrad und Kontext | Im adaptiven Fachprozess prüfen, keine Fähigkeit aus Klickzahl ableiten |

Kleine Nenner, selektive Rückmeldungen und unvollständige Daten werden sichtbar. Seltene Nutzung macht eine Fehlerrate nicht automatisch zuverlässig. Eine allgemeine Erfolgsquote darf kritische Fehlerklassen nicht verdecken. Keine dieser Kennzahlen wird ohne tatsächliche Datenquelle mit Beispielwerten als live gefüllt.

## 17.14 Konkreter Fall: Wortmarkierung

Der Kapitelchat berichtete am 21.10. einen Abbruch mit der Meldung, dass Zielwörter nicht als ganze Wörter im Markiertext vorkommen. Zwei betroffene Aufgabennummern und eine Referenz wurden dokumentiert. Eine lokale synthetische Reproduktion mit einer Bruchnotation zeigte eine plausible Tokenisierungsursache. Der Originalentwurf fehlte; die tatsächliche Ursache wurde nicht bestätigt und kein Fix beansprucht.

In der Qualitätsakte lautet der Stand deshalb „gemeldeter Erzeugungsfehler; Ursache teilweise reproduziert, Originalfall offen“. Der nächste Schritt ist autorisierte jobbezogene Diagnose oder ein bereinigter Originalentwurf beim zuständigen Owner. Das Format erhält keinen pauschalen neuen Grünstatus aus einer Hypothese.

Nach bestätigter Ursache wird ein Regressionsfall aufgenommen: Zieltext muss im tatsächlich gerenderten Antwortweg auswählbar sein; Validator und Tokenizer müssen dieselbe Bedeutung haben. Ein Fix kann erlaubte Zielwerte begrenzen oder einen ausdrücklich neu qualifizierten Auswahlvertrag schaffen. Die Lernabsicht darf nicht still von Brüchen zu einzelnen Ziffern wechseln. Anschließend werden Generator, Editor, Schülerweg und Bewertung im betroffenen Scope gemeinsam geprüft.

## 17.15 Konkreter Fall: komplexes Bruchmodell

Eine neue Aufgabe zeigt ein Ganzes mit 28 gleich großen Feldern und verlangt 25 Prozent. Fachlich sind sieben beliebige Felder richtig. Testfälle prüfen verschiedene gültige Muster, sechs und acht Felder, leere Auswahl, Rücknahme, Touch-/Tastaturbedienung, Resize, Reload und tatsächliche Serverpunkte. Die Geometrie muss gleiche Flächen darstellen; die Anzeige darf den Zielanteil nicht vorwegnehmen.

Im Üben kann eine Hilfe zunächst das Ganze und die Teilung erklären. Danach sollte eine neue unabhängige Probe zeigen, ob die Beziehung verstanden wurde. Im Leistungsnachweis bleibt die Lösung verborgen. Eine korrekte Antwort nach sichtbarer Hilfe ist kein Beleg für selbstständige Beherrschung. Der adaptive Chat verantwortet diese fachliche Folgelogik; der Formatowner die korrekte Interaktion.

Ein qualifiziertes Raster erlaubt nicht beliebige neue Kombinationen. Ein fehlerhaft erzeugter Prozentwert oder ein ungeeignetes Ganzes kann ein einzelnes Item zurückweisen. Die übrigen geprüften Rasteritems behalten ihren eigenen Scope, solange kein gemeinsamer Defekt vorliegt.

## 17.16 Anschluss an schnelle Lehrkraftkorrektur

Die Zentrale hat einen bestehenden Planungsauftrag an „GC · Pädagogisches Konzept“ zum schnellen Prüfen von Antworten über die ganze Klasse übergeben. Dieser Block schließt daran an: fachliche Prüfkriterien und Übersteuerungsgründe werden als qualifizierbare Eingänge genutzt, kein konkurrierender Korrekturbildschirm entsteht hier.

Abgegeben, regelbewertet, KI-Punktevorschlag, manuell korrigiert und lehrkraftgeprüft bleiben verschiedene Zustände. Ein KI-Vorschlag ohne tragfähiges Raster bleibt Vorschlag. Änderungen am Raster nach bereits erfolgter Bewertung brauchen klare Revision und betroffene Antwortzuordnung. Häufige fachliche Korrekturen können einen Format-/Itembefund auslösen; eine einzelne abweichende Schülerantwort wird nicht automatisch zum Softwarefehler.

## 17.17 Abnahme dieses Arbeitsblocks

Der erste Nachweis führt einen vorhandenen Formatdatensatz, einen neuen Kandidaten und einen bestätigten Fehler durch die komplette Akte. Er zeigt: Grün kann nur aus aktueller Prüfbasis entstehen; eine relevante Änderung entzieht die Gültigkeit; ein Retest bindet die neue Fassung; alte Ergebnisse bleiben erhalten; Lieferstufe und Schul-Live ändern sich dadurch nicht. Zuständigkeiten der Fachstränge und ihre Rückmeldungen landen bei derselben Akte.

Zusätzliche Negativfälle: grüner Renderer mit ungültigem Item; Browserpass ohne behaupteten Touchgerätetest; neuer Prompt mit altem Erzeugungsbeleg; Testabbruch mit unbekanntem Providerverbrauch; kritischer Einzelfehler trotz hoher Gesamtquote; Entzug eines gemeinsamen Graders mit mehreren abhängigen Formaten; offene Schülerprüfung bleibt an altem Snapshot. Die konkreten Abnahmefälle FZ-AT49 bis FZ-AT60 und FZ-AT71 tragen diese Regeln in Band 10.
