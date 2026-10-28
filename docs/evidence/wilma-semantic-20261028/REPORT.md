# GC-PEDAGOGY-KB-01 · Wilma semantische Staging-Abnahme · 28.10.2026

## Belegter Stand
Quelle61a5e296adc4ac8421f0cea391e9dc6e6c0d46ec, PR383 offen gegen feature/design-auth-student-20261026, nicht integriert. Lokaler Checkpoint43a6fbbf hat denselben Baum e0ad1aa93d012fd1d2b1fbbc56abadcbd7aab481.
Staging-Vorschau: https://gradecrew-staging-2026.web.app/wilma-review-preview/?intent=login
Hostingc5fed68056cc2c46;215/215Runtimehashes stimmen;448übrige Dateien und Hostingkonfiguration erhalten. Bestehender Wilma-Dienst ACTIVE reviewwilmaanswers-00007-giq, Buildfd939dfb-a06a-409f-a533-773cea97cd6d. Keine Assessment-,Rules-,IAM-,Secret- oder Liveänderung in diesem Abschnitt. Live bleibt469ec66a/bd28ca8fe8d3c4b0.

## Tatsächlich geprüft
Normaler Lehreraccount, eigener unveröffentlichter Fiktivtest WILMAAUTO20261028 mit20Aufgaben/5Abgaben. Keine echten Schülerbewertungen verändert.
Zwei unbekannte Antworten erhielten über den bestehenden Provider je0,5-Punkte-Vorschlag und kurze Begründung;98andere Antwortfelder lösten keine KI aus. Punktestand blieb bis Lehrerentscheidung unverändert.
Finaler Browsercheck auf61a: BestätigenA0,5→19,5/20/Note1; Undo→19/20/offen und gecachter0,5-Vorschlag erscheint erneut. Plus→20/20gespeichert;Undo stellt19/20her. ZurückstellenB bleibt19/20/offen;Undo öffnet gecachtenVorschlag erneut. NächsteoffeneAntwortfokussiertB. VollständigerReload: A19,5/20/Note1 dauerhaft, B19/20/offen mit0,5-Vorschlag;C/D/E unberührt.
Stagepilot4→6/7 in der ersten Probe, durch sämtliche Finaltests weiterhin6; historische Jobhashes unverändert. Kein Reset, kein weiterer bezahlter Finaltest. Sieben Requests sind KEIN Dollar-/Inputtokencap.
Eine falsche UI-Warteannahme im Abschlusscheck erwartete nach Bestätigung das Entfernen der Zeile; die Oberfläche hält bestätigte Zeilen absichtlich für schnelle Korrektur. Frischer Status und Serverdaten bestätigten erfolgreiches Speichern. Kein Produktfix daraus abgeleitet.
Echte Browseransicht1280px; separate exakte CI prüft24WebKit/Chromiumfälle320–1280px/20–40Tabs/Touch/Zoom/Fokus. Kein physischer iPadtest behauptet.

## Codeprüfung
Exakte CI40750389678 erfolgreich (Node22 und Browser).705Web/UI-,416Functions-,16Assessment-Coretests lokal grün. Unabhängiger finaler enger Deltareview50Tests ohne wichtige Befunde; vorheriger63erReview bleibt erhalten.
Separater READONLYOriginreview88Tests/PASS auf46a; gesamte assessment-functions und index.js/gradeSubmission-Aufrufer46a→61a byteidentisch. Dies belegt den geprüften Originhunk, NICHT einen Assessmentdeploy oder eine geprüfte neue Stagekomposition.
Die erste Finalvorbereitung wurde mit401 vor Mutation gestoppt; bestehender Firebase-CLI-Zugang regulär erneuert, unveränderte Scopes. Keine doppelten Operationen/Provideraufrufe. Tatsächliche Finaloperation operation-1793214456797-65eeb46b419e5-b3a56b56-ccfe9352 erfolgreich.

## Separater minimaler Originrollout — Vorschlag, nicht beauftragt oder deployed
Lesend aktive submitAssessmentAttempt-Quellen verglichen: Stage00013-zel besitzt neueren Visualtask-/SolutionLeakGuard-Code, den61a nicht enthält. Das gesamte61aAssessmentpaket auf Stage zu kopieren wäre eine Regression. Live00053-how hat gegenüber61a ausschließlich den geprüften Text-Hunk als Coreunterschied; index.js und Paketdateien sind identisch.
1. Pro Umgebung den tatsächlichen aktiven Quellstand erhalten; ausschließlich Leertextregel0 und nichtleere Textnichttreffer→needsReviewtrue/correctnull portieren. Stage-Visualsupport und erweiterte Schutzregeln vollständig erhalten.
2. Unveränderliche zusammengesetzte Quelle sichern, passende Tests/exakteCI und unabhängige Deltaprüfung; vorhandene88erPrüfung ersetzt diese neue Stagekompositionsprüfung nicht.
3. Erst nach gesonderter Ausführungsentscheidung genau submitAssessmentAttempt auf Stage aktualisieren; Quellenhash/UpdateTime vor Start vergleichen, alteQuelle/Revisionsbeleg aufbewahren. Keine anderen Funktionen,Rules,IAM oder Kontingente ändern.
4. Eigener kleiner synthetischer Schüler-Abgabefluss: akzeptiert→vollePunkte;leer→Regel0;unbekannt/manual→review/keineEndnote;Visualregression;Abgabewiederholung idempotent;Lehrerbestätigung/Undo/Receipt. KeineKIcalls für diesen Origintest.
5. Live erst nach tatsächlichem Stageabnahmenachweis und konkreter Freigabe auf frischer Livebaseline mit identischem Text-Hunk/CI/Review. Rollback nur Code auf gesicherte ursprüngliche Quelle; keine Daten-/Notenrückschreibung. Bereits offene Antworten bleiben manuell prüfbar.
6. Allgemeine automatische KI auf echten Antworten bleibt aus. Davor konkrete Budget-/Token-/Kostenobergrenze, Schul-/Dateneignerumfang und manuelle/automatische Legacycache-Abstimmung beschließen. Keine neue Engine,keinZweitanbieter,keine99%-Genauigkeitsbehauptung.

Nächster ausführbarer Schritt: Zentrale entscheidet anhand dieses konkreten Plans über den getrennten minimalen Originauftrag und dessen Gates; aktuelle Vorschau ist zur menschlichen Geräteprüfung bereit.
