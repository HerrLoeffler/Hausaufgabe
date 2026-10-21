# GradeCrew Kapitelgrundstruktur – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Dieser Auftrag erstellt ausschließlich den Plan; die Ausführung benötigt einen anschließenden Implementierungsauftrag. Keine Subagenten ohne entsprechende Autorisierung.

**Goal:** Die bestehende manuelle und KI-gestützte Testerstellung um optionale Themenkapitel erweitern, die bis zur gemeinsamen Abgabe und Auswertung erhalten bleiben.

**Architecture:** Quiz und Fragen erhalten additive Kapitelmetadaten. Bestehender Editor, Remyjobs, sichere Assessment-Callables, mobile Navigation und Auswertung werden gezielt erweitert; Aufgabenformate und Bewertungsengine bleiben erhalten. Laufende Altversuche behalten ihren bisherigen Vertrag. Bereichstimer werden später separat geplant, der vorhandene Gesamttimer bleibt unverändert.

**Tech Stack:** vorhandenes Browser-JavaScript (ESM), Node.js 22/CommonJS in Firebase Functions, Firestore/Rules, IndexedDB, node:test und vorhandene jsdom-/Emulator-/Browserprüfungen. Keine neuen Produktabhängigkeiten.

**Spec:** `docs/concepts/GC-CHAPTER-TESTS-01.md`, einschließlich Martins Präzisierungen vom 20.10.2026. Task-ID bleibt GC-CHAPTER-TESTS-01.

## Global Constraints

- „Übung / benoteter Test sollte sich nicht unterscheiden.“ Dieselbe Kapitelbedienung und derselbe Datenvertrag; bestehende Noten-/Lösungsfreigabeeinstellungen bleiben erhalten.
- „Das bisherige testerstellungssystem verwenden, nichts neues erfinden sondern nur erweitern“: kein eigener Erstellungsmodus, keine zweite Exam-Engine und keine neue Website.
- Bundesland/Jahrgang sind keine neue Voraussetzung. Vorhandene Formularwerte und Lehrplan-/Materialpfade weiterreichen, keine neue Auswahlpflicht oder pauschale Lehrplankonformität behaupten.
- „Erstmal die Grundstruktur, optionale Timer danach genauer planen.“ Kein Bereichstimerfeld, keine Bereichssperre, keine neue Pause-/Fristenlogik in diesem Umfang. Ohne Limit und mit heutigem Gesamttimer muss dieselbe Kapitelstruktur funktionieren.
- Optionale Kapitel, freie Rückkehr, genau eine Endabgabe, Gesamtpunkte plus Kapitelpunkte. Vorhandene Lösungsfreigabe bleibt verbindlich.
- Keine Migration bestehender Tests oder historischen Ergebnisse, keine Umschreibung laufender Altversuche. Bestehende Format-/Material-/Medienlimits erhalten: maximal 100 Aufgaben für die Generierung, Punkte in 0,5er-Schritten, mindestens 0,5 je Aufgabe.
- Private Lösungen, Quellen und Bewertungsschlüssel bleiben serverseitig. Kapitelüberschriften, Statusfarben und Fortschritt dürfen keine Lösungen verraten.
- Keine Runtimeänderung durch diesen Plan. Spätere Entwicklung in eigenem Checkout vom frisch geprüften Runtimeziel; nicht vom Docsbranch bauen. Keine Release-/Productionfreigabe enthalten.

## Review Focus

1. Ende/Bearbeitung einer alten Testrunde verändert historische Kapitelzuordnung nicht: Snapshot-/Nachkorrekturtest in Aufgaben 4 und 6.
2. Ein Speicherausfall zwischen Quiz und Aufgaben darf keinen kaputten Kapiteltest veröffentlichen: Fehlersimulation/Publikationsprüfung in Aufgaben 2 und 4.
3. Emmi, Import, Duplikat und erneutes Öffnen dürfen Kapitel nicht still entfernen: Roundtriptests in Aufgaben 2, 3 und 6.
4. Zufall und mehrteilige/mediengestützte Aufgaben müssen stabile IDs und vollständige Antworten behalten: Vertrags- und Interaktionstests in Aufgaben 4 und 5.
5. Neue Clientfähigkeit und neue Serverfähigkeit müssen vor Start zusammenpassen: alte Clients erhalten verständlichen Updatehinweis, bestehende Altversuche laufen weiter; Prüfung in Aufgabe 7.

## 1. Frische Grundlage und maßgebliche Quellen

Prüfstand 20.10.2026: main `c14a8fdee852f6d5105c1b7e12701a0112272263`, Runtime `feature/gradecrew-app-integration@4f8b79222a35997852aad4673f8aaf338904f485`, Native `feature/native-live-staging-20261018@b43298b73d63707d2270ee4a3f4e49cf980dd606`. Dokumentation auf `docs/gc-chapter-tests-01`, Draft-PR252; nicht integriert. Releasewahrheit liegt in STATE, main koordiniert.

START_HERE/AGENTS/STATE/TODO/Registry/CHAT_CONTRACT/Workstreams auf Remote-main erneut gelesen. Development Status39463832193 samt erfolgreichem Fetch-/Auditjob geprüft; zusätzlich aktuelle Refs und offene PRs gelesen. Neuer Nachbarplan PR253 zur adaptiven Übungsbegleitung ist getrennt; kein Kapitelimplementierungsauftrag daraus ableiten. Keine Nachrichten an andere Chats gesendet. Vollständiges Audit-Artefakt aller Branchdiffs nicht geladen; vor Implementierung erneut prüfen.

**Korrektur der ersten Codeinventur:** `assessment-functions/package.json` verwendet `main.js`. Dieses exportiert `lib/secure-lifecycle.js` und `lib/cleanup.js`. Der aktive Lifecycle enthält Start, Resume, Submit und Receipt, berücksichtigt Shuffleoptionen und speichert Decoder-/Lösungssnapshots. `assessment-functions/index.js` und `lib/secure-submit.js` sind nicht der aktive Exportpfad. Keine neue Logik dort implementieren. `secureAssessmentVersion:2` im aktiven Start ist von einer neuen Kapitelvertragsversion getrennt zu behandeln.

Gelesene Anschlusspunkte am Runtime-SHA:

- `app.js`: quizDefaults/createQuizDocument/createQuiz (ca.1934–2010), Remy-Anfrage und startAiCreationJob (ca.2940–3045), normalizeImportedPayload/importAiJson (ca.3347–3635), openEditor/renderQuestions (ca.3755–3925), editorDraftSnapshot (ca.5898), sanitizeQuestionForSave/saveCurrentQuiz/publishCurrentQuiz (ca.6089–6330), saveReview/exportResultsCsv (ca.7856–7930). Zeilen sind Suchhilfen; Funktionsnamen gelten.
- `functions/index.js`: cleanInput, generateTestForUser, startAiTestJobForUser, processAiTestJob. `functions/lib/test-batches.js`, `ai-job.js`, `schemas.js`, `validation.js`, `whole-test-revision.js`, `pedagogical-pool.js`; `functions/main.js` bindet die Emmi-Funktionen ein.
- `assessment-functions/lib/secure-lifecycle.js`: configurePracticeSolutionRelease, contractOptions, contractForQuestions, readQuestions, start/resume/submitAssessmentAttempt, makeReceipt; `assessment-core.js`: authoringFingerprint/buildAssessmentContract/gradeSubmission.
- `secure-student.js`: enterAssessment/renderQuestion/answerIsComplete/collectAnswers/updateProgress; `secure-student-navigation.mjs`, `secure-draft-persistence.js`, `secure-assessment-client.js` und `firestore.secure-assessment.rules`.

## 2. Zielablauf im vorhandenen Produkt

**Manuell:** Neuer Test → vorhandener Editor → „In Kapitel gliedern“ einschalten → vorhandene Aufgaben landen in „Kapitel 1“ → Kapitel hinzufügen/umbenennen/ordnen → Aufgaben per Auswahl zuordnen → prüfen → speichern/veröffentlichen wie bisher.

**Remy:** Vorhandene Erstellungsmaske → optional „In Kapitel gliedern“ → Themenzeilen mit Titel, Thema, Anzahl und Punktebudget → bestehende restliche Eingaben/Uploads → ein vorhandener Hintergrundauftrag → ein vollständiger Test im bisherigen Editor. Fach, Klasse, Schulart, Region, erlaubte Formate, Bilder und Audio bleiben dieselben Einstellungen. Kein zusätzlicher Chat-/KI-Aufruf nur durch das Einschalten von Kapiteln.

**Schüler:** vorhandener Testcode/Start → gruppierte Übersicht und heutige Aufgabenliste → frei vor/zurück oder gezielt zur offenen Aufgabe → eine Endabgabe. Die Leiste zeigt z.B. „Brüche · Aufgabe 5 von 18“. Kapitelwechsel startet keine neue Session und verändert keinen Timer.

**Lehrkraftauswertung:** bisheriges Gesamtergebnis bleibt an erster Stelle; darunter Kapitelpunkte/-maxima/-status. Keine Kapitelnoten. CSV ergänzt Kapitelspalten. Bestehende manuelle Korrektur bleibt nutzbar und berechnet die Kapitelwerte neu.

## 3. Festgelegter kleiner Datenvertrag

Die folgenden neuen Feldnamen und Grenzen sind Implementierungsvorgaben dieses Plans, keine Behauptung vorhandener Felder:

```js
// Quiz – nur bei eingeschalteten Kapiteln
{ chapterSchemaVersion: 1,
  chapters: [{ id: 'ch_<uuid>', title: 'Brüche', position: 1 }],
  chapterPlan: [ // privat, optional; Autoren-/Remyplanung
    { chapterId: 'ch_<uuid>', topic: 'Brüche vergleichen',
      count: 3, points: 8, materialIds: [] }
  ] }
// Frage: vorhandene Dokument-ID, position, Format und Punkte bleiben bestehen
{ chapterId: 'ch_<uuid>', position: 1 /* ...bestehende Felder */ }
```

- Kapitel-ID: Präfix `ch_` plus UUID, neu per vorhandener sicherer Zufallsquelle; Muster `^ch_[A-Za-z0-9_-]{1,64}$`. Eindeutig im Test, keine ID aus Titel oder Index. Neue Tests/Kopien bekommen neue IDs mit vollständiger Zuordnung; Umbenennen/Ordnen erhält IDs.
- 1–100 Kapitel, nicht mehr als 100 Aufgaben im Kapitel-Generierungsvertrag. Kein Pflichtwert sechs. Entwurf darf leere Kapitel enthalten; Veröffentlichung verlangt pro Kapitel mindestens eine Aufgabe. Titel getrimmt, 1–120 Zeichen; im Entwurf darf leer gespeichert werden, Veröffentlichung zeigt den Fehler. Titel werden als Text gerendert. Gleiche Titel sind technisch möglich, IDs entscheiden.
- Reihenfolge: `chapters.position` wird beim Speichern 1..n normalisiert; globale Frageposition 1..m folgt Kapitelreihenfolge und der Aufgabenreihenfolge innerhalb jedes Kapitels. Kein zusätzliches frei veränderliches questionIds-Array im Quiz. Verschieben ins Zielkapitel hängt dort an, danach neu nummerieren.
- Kapitel an bei vorhandenen Aufgaben: ein „Kapitel 1“, alle Aufgaben dorthin. Ausschalten entfernt nur Kapitelmetadaten/-zuordnung nach Bestätigung; Aufgaben und ihre aktuelle flache Reihenfolge bleiben. Kein implizites Löschen.
- Gefülltes Kapitel löschen: erst Zielkapitel zur Verschiebung wählen; Grundumfang bietet kein Sammellöschen der Aufgaben über diese Aktion. Letztes Kapitel lässt sich nur über „Gliederung ausschalten“ entfernen.
- Neue Aufgabe, behaltene Aufgabenvariante und Aufgabenformatwechsel behalten aktuelle Kapitelzuordnung. Einzelne neue Varianten erhalten neue Question-ID; Emmi-Überarbeitung einer bestehenden Aufgabe behält ID/Zuordnung.
- Alter Test ohne `chapterSchemaVersion` bleibt exakt im Legacyzweig. Vorhandenes `chapterSchemaVersion` mit unbekanntem Wert darf nicht als flacher Test geöffnet/überschrieben werden: erklärter Kompatibilitätsfehler.
- `chapterPlan` wird nicht zur PublicPaper oder Schülerprojektion durchgereicht. Materialreferenzen nutzen nur bestehende autorisierte Upload-IDs. Schwierigkeits-/Typ-/Medieneinstellungen bleiben zunächst global; keine zusätzliche Matrix je Kapitel. Pro-Kapitel-Materialauswahl optional, leere Liste = global ausgewähltes Material.
- Remy: Summen der Kapitelanzahlen/-punkte sind die sichtbaren, schreibgeschützten Gesamtfelder. Jedes Kapitel mindestens eine Aufgabe und Punktebudget mindestens count/2, 0,5er-Schritte. Bei ausgeschalteter Gliederung sind die bisherigen Gesamtfelder editierbar.
- Keine Kapitel-/Timerdefaultwerte an Altbestände schreiben. Kein neues Collection-System für die Autorenstruktur.

### Modulgrenzen und gemeinsame Schnittstellen

Neue reine Regeln in `shared/chapter-contract.js` (CommonJS mit Browser-Guard für module.exports, im Browser als UMD-Global unter `globalThis.GradeCrewChapters` verfügbar; keine Firestore-/DOM-Abhängigkeiten; als Script vor den konsumierenden Browsermodulen laden):

```text
validateChapterStructure(quiz, questions, {phase:'draft'|'publish'})
  -> {enabled:boolean, errors:Array<{code,chapterId?,questionId?}>}
canonicalizeChapterQuestions(quiz, questions) -> neue geordnete Fragenliste
createChapterSnapshot(quiz, questions)
  -> null | {version:1, chapters:[{id,title,position}],
             questions:[{id,chapterId,position,maxPoints}]}
aggregateChapterResults(snapshot, grading)
  -> [{chapterId,title,position,awardedPoints,maxPoints,percent,needsReview}]
```

`percent`: null bei null Maximalpunkten, sonst ganzzahlig gerundet wie heutige Gesamtanzeige. `awardedPoints` nutzt bestätigte `awardedPoints`, sonst `autoPoints`; fehlende Bewertung einer erwarteten Frage markiert `needsReview:true`. Aggregation verwendet eingefrorene Maxima, nicht später geänderte Autorenfragen. Punkte intern in halben Einheiten rechnen, Ergebnis im vorhandenen Dezimalformat. Snapshot enthält keine Antworten oder Lösungshinweise.

Browser-Controller `chapter-editor.mjs` bindet diese reinen Regeln an vorhandenen Zustand; Serveradapter laden dasselbe Modul. Buildallowlist und Functions-Packaging müssen das gemeinsame Modul ausdrücklich einschließen (Aufgabe7); keine zweite handkopierte Implementierung in jedem Paket.

## 4. Umsetzung in sieben prüfbaren Aufgaben

Alle nachfolgenden Checks sind **zukünftige Ausführungsschritte**, hier nicht ausgeführt. Vor jedem Paket: kleinen Verhaltenstest erst rot, dann Umsetzung, dann passenden Bestandstest grün; Commit nur betroffene Dateien. Neue Dateinamen sind geplante Dateien.

### Task 1: Kapitelvertrag und Legacygrenze

**Dateien:** neu `shared/chapter-contract.js`, `shared/chapter-contract.test.cjs`. Packaging-Test für beide Functions-Codebases in Aufgabe7.

**Interfaces:** produziert die vier oben festgelegten Funktionen; konsumiert vorhandene Quiz-/Frage-/Gradingobjekte ohne Mutation. Kapitelstrukturvalidierung erhält echte Dokument-IDs, bevor Public-IDs verkürzt werden.

- [ ] Test `legacy_is_unchanged`: bei Quiz ohne Version `enabled:false`, keine Kapitel erzeugt, Eingaben bytegleich nach Aufruf. `unknown_version_is_rejected`: Version2 nicht als Legacy akzeptieren.
- [ ] Test `six_chapters_are_canonical`: sechs Kapitel/18 Aufgaben/48 Punkte; ungeordnete Positionen ergeben eindeutige kanonische Reihenfolge. Umbenennen ändert keine Zuordnung. Duplicate-/missing-ID, fremde chapterId, ungültige Punkte/Titel abweisen. `empty_draft_not_publish` erlaubt Entwurf, lehnt Veröffentlichung ab.
- [ ] Test `aggregate_30_of_48`: Kapitelwerte [6,4,8,2,6,4] aus eingefrorenen Maxima ergeben 30/48; manuell offene Aufgabe bleibt Review; Änderungen am ursprünglichen Quiz nach Snapshot beeinflussen nichts.
- [ ] Run `node --test shared/chapter-contract.test.cjs`: zunächst fehlender Export/unerfüllte Assertions, danach grün. Kleines Modul implementieren; keine Produkteingriffe außerhalb des Vertrags.
- [ ] Commit `feat(chapters): define optional chapter contract and legacy behavior`.

### Task 2: Bestehenden Editor vollständig erhalten

**Dateien:** ändern `app.js`, `index.html`, `editor-drafts.js` nur soweit Speicherformat nötig, vorhandene Editor-CSS in `styles.css`; neu `chapter-editor.mjs`, `tools/ui/chapter-editor.test.cjs`, `chapter-draft-roundtrip.test.mjs`.

**Interfaces:** `mountChapterEditor({root,getState,onChange}) -> {render,destroy}`; onChange liefert `{quizPatch,questions}` ohne Firestorezugriff. `app.js` übernimmt Patch, markDirty und vorhandenes Rendering. Snapshot/Validierung aus Aufgabe1.

- [ ] DOM-Tests für Einschalten bei drei Altaufgaben, Hinzufügen/Umbenennen/Umordnen per Buttons, Zuordnen, gefülltes Löschen mit Zielauswahl, Ausschalten ohne Aufgabenverlust. Neue Frage/Variante in aktuellem Kapitel, ungespeicherter Text bleibt beim Kapitelwechsel erhalten.
- [ ] Roundtriptests decken `editorDraftSnapshot`, Resume lokaler Entwürfe, `sanitizeQuestionForSave`, `saveCurrentQuiz`, exaktes Duplikat, geteilte Vorlage, Import/Export der vorhandenen JSONwege ab. IDs aus Vorlage nie blind übernehmen; Kapitel- und Frage-ID-Remapping gemeinsam testen.
- [ ] Kapitelmetadaten in allen expliziten Feldlisten ergänzen. Kapitel-Entwurf plus geänderte Fragen in einem Firestore-writeBatch speichern, solange innerhalb vorhandener Firestore-Grenzen; maximal100 Fragen plus Quiz und bis100 entfernte Fragen passen unter500 Schreibvorgänge. Bestehende Audio-/Lösungsscript-Sync bleibt separat: bei Fehler lokaler Entwurf/dirty-Status erhalten, Veröffentlichung erst nach erfolgreicher vorhandener Audio-Sync und Prüfung.
- [ ] Fehlersimulation `batch_failure_keeps_local_draft` und `audio_sync_failure_does_not_publish`: keine halbe Struktur als gespeichert melden. Laufende veröffentlichte Kapiteltests nur lesbar; „beenden/kopieren“ bleibt vorhandener Weg.
- [ ] Run `node --test tools/ui/chapter-editor.test.cjs chapter-draft-roundtrip.test.mjs`, dann vorhandene Editor-/Drafttests. Erwartet: gleiche Altmasken, keine globale Stiländerung. Commit `feat(chapters): extend existing editor and preserve chapter drafts`.

### Task 3: Ein Remyauftrag mit Themenplan

**Dateien:** ändern `app.js` (getAiRequest/startAiCreationJob/Import/Varianten), `index.html`, `ai-client.js` falls neue Payload weitergeleitet werden muss, `functions/index.js`, `functions/main.js`, `functions/lib/test-batches.js`, `ai-job.js`, `schemas.js`, `validation.js`, `whole-test-revision.js`, `emmi-whole-test-revision.mjs`; ändern `functions/lib/test-variant.js` für den bestehenden Quellslotvertrag. Neu `functions/lib/chapter-generation.js`, `functions/test/chapter-generation.test.js`, `tools/ui/chapter-creation.test.cjs`.

**Interfaces:** `planChapterSlots(input) -> [{index,chapterId,points,materialIds}]`; `bindGeneratedChapterSlots(questions, slots) -> questions` nur bei gleicher Länge/valider Verteilung. chapterPlan im autorisierten gespeicherten Jobinput; genau ein clientRequestId/jobId für den Gesamtauftrag. Keine neuen Callables für KI-Erstellung.

- [ ] Test sechs Themen×drei Slots, 48 Punkte, count18; zu kleine Budgets, >100 Aufgaben, fremde Upload-ID, unbekannte Kapitelversion vor Provideraufruf abweisen. Gesamtformular rechnet Summen live. Globale Typ-/Bild-/Audiolimits bleiben für den ganzen Test gültig, nicht sechsmal verfügbar.
- [ ] Vorhandene Batchplanung zuweisen: globale Slots tragen chapterId, bilden weiterhin die bisherigen Batchgrößen ab; ein Batch darf mehrere Kapitel enthalten. Prompt enthält deren zugeteilte Slots/Themen und vorhandenen Lehrplankontext. Server bindet IDs aus Slots, vertraut keinem vom Modell erfundenen Kapitel. Rückgabezahl/-punkte/-Zuordnung müssen stimmen oder bestehender begrenzter Reparatur-/Teilstandweg zeigt klare Abweichung.
- [ ] Kapitelplan/-referenzen durch cleanInput, gespeicherten Jobinput, Schemas, Normalisierung, storedAiQuestion und quizForGeneratedTest führen. Vorhandene `preparePedagogicalPool`-Auswahlbedingungen erhalten; keine Defaults als ausdrücklich gewählten Lehrplan darstellen. Materialdaten nur für autorisierte passende Slots in Prompt; keine Quelltexte ins PublicPaper.
- [ ] Emmi/Einzelfragenvarianten und „ähnlicher Test“ erhalten Kapitel über vorhandene Quellslots/-IDs, auch nach Undo. Neues Kapitel durch Emmi ist im Grundumfang kein freier Modellvorgang; Strukturänderungen macht die Lehrkraft. Quick-Remy ohne Kapitelplan bleibt unverändert; kann später im Editor gegliedert werden.
- [ ] Stubtests: `resuming_job_does_not_generate_again`, `whole_test_repair_preserves_chapter_slots`, `import_does_not_drop_chapters`, `media_limits_apply_globally`, `existing_curriculum_inputs_preserved`. Run `node --test functions/test/chapter-generation.test.js functions/test/test-batches.test.js functions/test/whole-test-revision.test.js tools/ui/chapter-creation.test.cjs`; erwartet grün mit Providerstubs, null reale Aufrufe. Commit `feat(chapters): carry chapter plans through existing Remy jobs`.

### Task 4: Sichere Veröffentlichung und eingefrorene Zuordnung

**Dateien:** ändern `assessment-functions/main.js`, `lib/secure-lifecycle.js`, `lib/assessment-core.js`, `lib/cleanup.js` nur bei zusätzlichem Persistenzbedarf, `firestore.secure-assessment.rules`, `secure-assessment-client.js`, `app.js` (alle Publish/Reopen-Einstiege inkl. Dashboard); neu `assessment-functions/lib/chapter-publication.js`, `assessment-functions/test/chapter-lifecycle.test.js`; erweitern `tools/rules/secure-assessment-rules.emulator.test.mjs`.

**Interfaces:** additive `capabilities.chapters:1` in getAssessmentInfo; Client sendet bei neuem Start `clientCapabilities:{chapters:1}`. Neuer bestehende Engine ergänzender Callable `publishChapterAssessment({quizId,action:'prepare'|'publish',expectedRevision?,confirmAfterSubmit?}) -> {revision,...bestehende Publikationsantwort}`. Kein neuer Start-/Submitmodus. Reine interne `validateChapterPublication(tx,quizRef) -> {quiz,questions,chapterSnapshot,revision}`. Versionierte Kapitelversuche verwenden `chapterContractVersion:1`, getrennt von bestehender secureAssessmentVersion.

- [ ] Tests des **aktiven** main-Exports: Legacy-Paper/-Hash/Start/Submit bleiben bytekompatibel. Kapitelvalidierung erkennt fremde/fehlende IDs und ungültige Struktur vor Start. `shuffleQuestions` mischt innerhalb Kapitel, Kapitelreihenfolge bleibt; gleicher Secret/Reload ergibt dieselbe Reihenfolge. Bei potentiell zusammenhängenden Fragen keine automatische Aufteilung: Grundumfang feste Autorenreihenfolge bei Medienabhängigkeit; explizite Blockmodellierung später.
- [ ] Versionierten Kapitelzweig im Core ergänzen: authoringFingerprint umfasst Titel/Ordnung/Zuordnung, Legacyzweig bekommt keinerlei neue Felder im Hashinput. PublicPaper erhält nur erlaubte `chapterId` plus separate `chapters:[{id,title,position}]`. Quellplanung/Material-IDs/Schlüssel nie projizieren. Keine Kürzungskollision bei neuen Kapitel-Question-IDs tolerieren.
- [ ] Kapitelveröffentlichung serverseitig in einer Transaktion prüfen; Elternquiz lesen plus alle Fragen. Revision aus kanonischem Kapitelvertrag, vorhandenen Medien-/Autorenfingerprints und Einstellungen. prepare/publish vergleichen exakte Revision. Praxisfreigabe nutzt bestehende Policy-/Audio-/Bestätigungslogik über gemeinsame interne Helfer; kein Nachbau. Rules verhindern direkte Client-Veröffentlichung und erneutes Öffnen von Kapiteltests; alte flache Publishwege bleiben unverändert. Alle bestehenden Einstiegsschaltflächen routen Kapitel über denselben Callable. Start prüft zusätzlich Kapitelrevision/Struktur – ältere oder manipulierte Clients dürfen Prüfung nicht umgehen.
- [ ] Start speichert privaten `chapterSnapshot` mit IDs/Titeln/Maxima und Kapitel-Hash; Resume verwendet diesen für Kapitelmetadaten und prüft unveränderte Fragen nach bestehender Authoringpolitik. Kein vollständiges zweites PublicPaper mit eingebetteten Medien speichern. Nach Ende veränderte Autorenfragen dürfen alte Versuche nicht still umdeuten: bestehender Mismatch-/Recoveryreviewpfad bleibt. Submit übernimmt serverseitigen Snapshot ins Submissiondokument, keine vom Client gesendete Zuordnung. Reopen erzeugt neue Runde/Revision; alte Submission-Snapshots bleiben. Bestehendes privatePayload-Bytebudget prüfen, keine Erhöhung als pauschaler Fix.
- [ ] Run `node --test assessment-functions/test/chapter-lifecycle.test.js assessment-functions/test/assessment-core.test.js assessment-functions/test/secure-submit-contract.test.js assessment-functions/test/offline-recovery-policy.test.js`; danach vorhandener Emulatoraufruf aus Aufgabe7 mit erweitertem Rules-Test. Beweisen: alte Clients starten keine neuen Kapiteltests ohne Fähigkeit, bestehende Legacyattempts weiter; gleichzeitiges Edit/Publish/Start wird abgebrochen; Schüler können Kapitel nicht umhängen. Commit `feat(chapters): validate publication and freeze attempt chapter mapping`.

### Task 5: Bestehende Schüleransicht gruppieren

**Dateien:** ändern `secure-student.js`, `secure-student-navigation.mjs`, `secure-student.css`, `secure-student.html`, `secure-assessment-client.js`, `secure-draft-persistence.js` nur für zusätzliche Metadaten; neu `chapter-student.mjs`, `tools/ui/chapter-student.test.cjs`; vorhandene mobile Navigationstests erweitern.

**Interfaces:** `mountChapterStudent({paper,chapters,getAnswers,goToQuestion}) -> {renderProgress,destroy}`. `goToQuestion(questionId)` nutzt die bestehende Navigation und fokussiert die vorhandene Aufgabenkarte. Antwortvollständigkeit verwendet genau die vorhandene `answerIsComplete`-Semantik; keine neue Bewertung.

- [ ] Test Kapitelüberschriften/Übersicht aus PublicPaper, globale Fragezahl unverändert. Alle Aufgaben bleiben in derselben bestehenden Formular-/Antwortsammlung; kein Re-Render mit Antwortverlust bei Kapitelwechsel. Legacy render identisch, keine künstliche „Allgemein“-Gruppe.
- [ ] Gruppierte Übersicht in der heutigen Leiste, aktuelle Kapitelbezeichnung und vorhandene Vor/Zurückbuttons. Fortschritt als „2 von 3 bearbeitet“, Filter „offen“ nutzt dieselbe Vollständigkeitsprüfung wie Endabgabe. Kein Häkchen/Farbwert für Richtigkeit; Überschriften textContent.
- [ ] `answers_survive_chapter_navigation` prüft Zahl0, false, leere Teilzuordnung, Mehrfachauswahl, Bild-/Hör-/Audioantworten, laufendes Audio ohne Autostart beim Sprung. Fokus/Escape/Tastatur und Endfrage/-abgabe erreichbar. Kein Timerreset/Auto-Submit beim Wechsel.
- [ ] Reload/Offline stellt vorhandene Antworten mit denselben IDs und Kapitelübersicht wieder her; die Ansicht darf keine neue Started-/Deadline-Zeit setzen. Test vor/bei Gesamtablauf und wiederholte Endabgabe; Recoveryreviewanzeige wie bisher.
- [ ] Run `node --test tools/ui/chapter-student.test.cjs tools/ui/secure-student-navigation.test.cjs secure-draft-persistence.test.mjs secure-result-policy.test.mjs`; vorhandenes Browserlayoutskript für390×844,375×812 und1280×900 erweitern. Commit `feat(chapters): group the existing student navigation`.

### Task 6: Kapitelwerte ohne veraltete Korrekturen

**Dateien:** ändern `assessment-functions/lib/secure-lifecycle.js`, `assessment-functions/main.js`, `app.js` (openResults/saveReview/CSV), `secure-student.js` (Ergebnis), `firestore.secure-assessment.rules`; neu `assessment-functions/lib/chapter-results.js`, `assessment-functions/test/chapter-results.test.js`, `tools/ui/chapter-results.test.cjs`.

**Interfaces:** aus Aufgabe1 `aggregateChapterResults`. Im Kapitel-Submissiondokument: unveränderlicher `chapterSnapshot`, abgeleitete `chapterResults`. Neuer Callable `reviewChapterAssessment({quizId,submissionId,expectedReviewRevision,awards:[{questionId,awardedPoints}]}) -> {reviewRevision}` autorisiert bestehende aktive Owner-/Adminrolle. Nur Kapitel-Nachkorrektur nutzt ihn; bisherige Legacy-Korrektur bleibt unverändert.

- [ ] Submit berechnet Gesamtergebnis wie bisher und Kapitelaggregate aus privatem Snapshot; Kapitelmaxima stimmen mit Gesamtmaximum überein. Kapitelwerte auf Lehrkraftseite vorläufig bei offener Bewertung. Schülerreceipt projiziert sie nur, wenn die bestehende resultMode-/Reviewpolitik Punkte/Prozente erlaubt; bei resultMode none keine Kapitelpunkte.
- [ ] Aktueller saveReview schreibt direkt erlaubte Bewertungsfelder. Für Kapitel stattdessen serverseitiger Review: immutable Snapshotmaxima, autorisierte awards, Rundung, Revisionsvergleich gegen parallele Korrektur und Neuberechnung von grading/Gesamt/Kapiteln in einer Transaktion. Rules sperren direkte Clientkorrektur von Kapitelabgaben; Lösungsfreigabe und Recoveryreviewstatus nicht durch ein beliebiges awards-Payload freischalten. Vorhandenen Reviewabschluss für Recoveryfälle ausdrücklich erhalten.
- [ ] Test `review_updates_total_and_chapters_atomically`: zwei parallele Korrekturen, zweite veraltet → Fehler; keine stillen Überschreibungen. `old_submission_survives_new_authoring`: Aufgabenpunktzahl/Titel/Runde inzwischen geändert → alter Snapshot zählt. Frage außer Snapshot oder Punkte oberhalb Maximum serverseitig ablehnen. Kein neues Schema für alte Abgaben verlangen.
- [ ] Lehrkrafttabelle zeigt Gesamt oben, Kapitel darunter, „Bewertung offen“ statt Kompetenzurteil. CSV Kapitelspalten nach Snapshot-ID mit aktuellem Snapshot-Titel; gemischte historische Ergebnisse ohne Kapitel erhalten leere Zellen, keine geschätzten Kapitelwerte. Keine Kapitelnoten oder Spezialgewichte. Test CSVsum/Review, Lösungsfreigabe nach Rundenschluss und Übungsfreigabe gleich respektiert.
- [ ] Run `node --test assessment-functions/test/chapter-results.test.js tools/ui/chapter-results.test.cjs secure-result-policy.test.mjs secure-solution-release.test.mjs`; ergänzter Rules-/Lifecycle-Bestand. Commit `feat(chapters): add consistent chapter results and review`.

### Task 7: Verpackung, Geräte und sichere Einführungsreihenfolge

**Dateien:** ändern `tools/build-staging.mjs` (explizite Dateiliste), vorhandene Functions-Packaging-/Deployskripte nach aktuellem `firebase.json`-Codebaseeintrag, relevante CI-Testlisten; native Paket-/Bridge-Dateien ausschließlich im separat frisch geprüften nativen Checkout. Neu `tools/ui/chapter-flow.test.cjs`, `tools/ui/chapter-flow.browser.cjs`, `assessment-functions/test/chapter-package.test.js`, `functions/test/chapter-package.test.js`.

**Interfaces:** identischer Kapitelvertrag in Browser und beiden Functions-Paketen. Deploymentbundle enthält `shared/chapter-contract.js` über bestehende Buildkopie nach `lib/shared/chapter-contract.js` je Codebase; Adapter require diesen gepackten Pfad. Kein require außerhalb des hochgeladenen Functions-Verzeichnisses. Packagingtests vergleichen Dateihash mit gemeinsamer Quelle. Native paketierte HTML/JS-Version meldet clientCapabilities.chapters1 nur nach Integration der betreffenden Schülerassets.

- [ ] E2E mit Testdaten/Stubs: vorhandene Remymaske → ein Job → Editor → korrigieren/kapitelweise ordnen → veröffentlichen → 2 Schüler mit eigenem Shuffle → Reload → eine Abgabe → Nachkorrektur → CSV. Dasselbe für bestehende Lösungs-/Bewertungsoptionen, ohne Kapitel und mit Gesamttimer. Kein zusätzlicher bezahlter Generierungsaufruf für die Abnahme erforderlich; echte Providerqualität wäre eigener bewusst begrenzter Testauftrag.
- [ ] Lokale Prüfungen Node22 (Voraussetzungen installieren nur bei späterer autorisierter Ausführung): `npm --prefix functions test`, `npm --prefix functions run check`, `npm --prefix assessment-functions test`, `npm --prefix assessment-functions run check`; neue Shared-/UItests gemäß Aufgaben1–6. Emulator über `firebase emulators:exec --only firestore --project demo-gradecrew-secure --config firebase.secure-assessment-emulator.json 'node --test tools/rules/secure-assessment-rules.emulator.test.mjs'`. Der gelesene Test verwendet demo-gradecrew-secure und Port8085; keine Live-Projektkennung verwenden.
- [ ] `node tools/build-staging.mjs work/chapter-tests-build staging` ausführen; der gelesene Einstieg nimmt Ausgabeordner und Umgebung entgegen. Vorab tools/environments.mjs prüfen: staging muss gradecrew-staging-2026 sein, sonst vor Build stoppen. Dateiliste/-manifest und beide Functions-Packages müssen neue Module enthalten. Native lokale Assetliste, Cache-/Schemaversion und Decoder müssen Kapitelmetadaten unverändert übertragen. Der Plan behauptet keine bereits bestandenen nativen Builds.
- [ ] Physische Abnahme: Desktop Tastatur, Handy Safari/Chrome, iPad Safari und aktuelle App/Secure; lange Titel, Bildschirmtastatur, Audio, offene Aufgaben, Ende/Reload/Offline. Ein bekannter alter Appbuild erhält vor neuem Kapitelstart verständlichen Updatehinweis, kann aber bestehende Legacyversuche fortsetzen. Kein Kapitelwechsel beendet/entsperrt Secure. Test mit manipuliertem Clientcapabilityflag darf serverseitige Kapitel-/Abgabevalidierung nicht umgehen.
- [ ] Einführung nach Review/konkreter Freigabe: zuerst getestete Server-/Rules-/Packagingfähigkeit, Kapitelstart vorerst für nichtfähige Clients gesperrt; dann passende Web-/Appclients und erst danach Kapitel-Erstellung sichtbar. Bei Serverfehler neue Erstellung sperren, vorhandene v1/v2-Altversuche weiterführen. Rollback kein blindes Zurücksetzen laufender neuer Kapitelversuche; deren kompatiblen Serverpfad bis Abschluss erhalten. Kein automatisches Merge auf Integrationsbranch, da dessen Workflows Deploys auslösen können. Commit `test(chapters): cover packaging compatibility and full existing flow`.

## 5. Abgrenzung nach Grundstruktur

Im Grundumfang sind **Editor, vorhandene Remyerstellung, sichere Veröffentlichung, Schülernavigation und Ergebnisweg** zusammen nötig. Ein Editor-only Zwischencommit ist keine freigegebene Kapitelunterstützung. Aufgaben1–7 nacheinander: 1 → 2/3 → 4 → 5/6 → 7; die Angabe beschreibt Abhängigkeiten, keine Agentendelegation. Codepakete einzeln prüfbar, Produktfreigabe erst nach durchgehendem Ablauf.

Bereichstimer kommen in einen späteren eigenen Plan derselben Taskfamilie: Startzeit, Durchlaufen/Pausen, Wechsel, Fristende, gesicherte Teilantworten, Offlinezustand und Kombination mit Gesamtzeit entscheiden. Heute werden keine Timerfelder auf Vorrat hinzugefügt und keine Begriffe „Kapitel abgeschlossen“ als Abgabezustand eingeführt. Druck/PDFgenerator, adaptives Üben, eigenständige Diagnose, neue Kompetenzdatenbank, neue Format-/Medienarten und Sondergewichte sind ebenfalls außerhalb dieses Plans. Vorhandene Importe/CSV bleiben dagegen Pflichtregression.

Aufwand bleibt eine mittlere bis größere Erweiterung im bestehenden System: sieben zusammenhängende Pakete statt neuer Engine. Haupttreiber sind konsistentes Speichern/Publizieren, Wiederaufnahme alter Versuche und serverseitig konsistente Nachkorrektur. Keine belastbaren Termine/Preise vor einer ersten Vertrags-/Packagingprobe und verifizierter nativer Assetbasis. Für spätere Ausführung ist zunächst ein implementierender Chat mit durchgängiger Schnittstellenverantwortung zweckmäßig; unabhängiger Review vor Integration nach Projektregeln. Dieser Plan startet niemanden.

## 6. Planprüfung und Abschlusskriterien

Plan-Selbstreview: Kapitelgrundvertrag/Legacy→1; manuelle Erstellung/Draft/Kopien/Import→2; bestehende Remy-/Emmi-/Lehrplanpfade→3; Exportquelle/Publish/Resume/Zufall/Schlüssel→4; mobile Leiste/Audio/Antworten→5; Gesamt/Kapitel/Review/CSV/Freigabe→6; Verpackung/Web/App/Secure/E2E→7. Die fünf Review-Focus-Fälle sind in den zuständigen Tests verankert. Keine Bereichstimerimplementierung enthalten.

Planungsabschluss: geprüfter Plan, korrigierte Quellenlage, aktualisierte TODO/Übergabe auf bestehendem Docsbranch. **Kein** Implementierungsabschluss. Spätere Produktabnahme verlangt einen exakten Commit, grüne relevante CI, überprüfte getrennte Testumgebung und echte Geräte-/Nutzerabnahme. STATE bleibt für diese Dokumentation unverändert.

**Nächster ausführbarer Schritt nach Planreview und Implementierungsauftrag:** isolierten Runtime-Checkout samt frischem Branch-/PR-/Releaseabgleich anlegen und Aufgabe1 mit Legacy-/Vertragstest beginnen. Bis dahin nur Dokumentation.

