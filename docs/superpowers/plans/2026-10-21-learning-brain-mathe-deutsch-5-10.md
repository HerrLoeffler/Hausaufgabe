# Lerngehirn Mathe/Deutsch5–10 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persönliches Lerngehirn mit echten adaptiven KI-Übungen in Mathe/Deutsch5–10, gespeichertem Profil und isoliertem Testrollout.
**Architecture:** Bestehende amtliche Quellensammlung und pädagogische Konzepte wiederverwenden. Neuer privater Übungsadapter innerhalb der vorhandenen AI-Codebasis, stabile Authidentität und serverseitige Ereignisse; getrennte Schüleroberfläche unter /lerngehirn/. Aktuelle Classroom-Schulverwaltung ist lokal, Schülercodes noch offen: bestehende verifizierte Firebase-Identität bildet den privaten Eigenzugriff, Fremd-/Kurszugriffe bleiben bis qualifiziertem Classroomadapter gesperrt.
**Tech Stack:** Bestehendes Node22/FirebaseFunctions/FirestoreSTANDARD eur3/OpenAI-SDK, browsernative Module und bestehende FirebaseAuth.
**Spec:** ../specs/2026-10-21-learning-brain-mathe-deutsch-5-10.md, vom Nutzer21.10.ausdrücklich freigegeben.

## Global Constraints

- Nur gradecrew-staging-2026; kein Schul-Live/Productiondeploy. Bestehende Hostingdateien/Functions erhalten.
- Kein neuer Lehrplanbestand: nur versionierte, begrenzte Ableitung aus18vorhandenen Quellen. R/M getrennt,5/6gemeinsam,10nurM.
- Keine Profile anhand Namen/Gerät/IP verknüpfen; Eigenzugriff über verifizierte AuthUID. Lösungsschlüssel nur Server.
- Hilfe zählt nicht als unabhängiger Erfolg;8/10erstab10verschiedenen Proben, Familien/Sitzungen/Behalten gesondert.
- Echte KI-Aufgaben/kurze Hilfen, fachliche Zweitprüfung, harte Matheprüfungen wo möglich; kein stiller fester Aufgabenersatz.
- Quellenstatus und Medien-/Bewertungsgrenzen ehrlich; keine pädagogische Vollfreigabe aus Menüabdeckung.

## Review Focus

- Konto-/Themenwechsel bei laufender KI: fremde/veraltete Antwort niemals einsetzen (Backendrevision + UIgeneration).
- Zwei Tabs/Doppelabgabe: idempotente Ereignisse und serverseitige Reservierung; kein Doppelzählen/zweiter Providerlauf.
- Offene Deutschantwort: alternative begründete Lösung zulassen, bei Widerspruch unklar statt falsch.
- Wiederholter Fehler: tatsächlich geringere Anforderung, beantwortbare Mikrofrage; spätestens begrenzter Lehrkraftausstieg.
- Rollout: aktuelle kanonische Testdateien erhalten; keine komplette ältere Appkopie über neue Änderungen deployen.

## Task1: Bestand, Katalog und Kompetenzzugänge

**Files:** functions/data/learning-brain-catalog.json; functions/lib/learning-brain/catalog.js; functions/test/learning-brain-catalog.test.js.
**Interface:** getCatalog() => {version,subjects,contexts,topics}; getTopic(id) => {id,subject:'math'|'german',grade:5..10,track:'R'|'M',title,area,goal,source:{id,url,status},prerequisites:[],modality:'text'|'audio'|'speaking'|'visual',guidance}. topics sind eigene Lernziele mit belegter Quelle; Katalog enthält keine Lösungen/Originalvolltexte.
- [ ] FailingTests:12Paare, R/Mnichtvermischt,10nurM,vorhandeneQuellenhashes,IDs eindeutig/Prereqsauflösbar.
- [ ] Vorhandene18Volltexte und pädagogische Regeln gezielt auswerten, eigene knappe Ziele und Förderleitlinien abbilden;Statusnichtvortäuschen.
- [ ] Testsgrün, Katalogpfade/Herkunft prüfen, committen.

## Task2: Privater Übungskern und Evidenz

**Files:** functions/lib/learning-brain/core.js, exact.js, contracts.js; functions/test/learning-brain-core.test.js.
**Interfaces:** planNext(session, action, assessment) => plan; assessExact(answer,key)=> true|false|null; projectSkill(events,now)=> summary; publicSession(privateSession)=> public.
**State:** persistent session(id,ownerUid,topicId,revision,phase:practice|help|completion|teacher|ended,level0..3,supportStage0..3,deadline,taskPrivate,history,lastEvent). first attempt,assisted,family,session,task fingerprint getrennt.
- [ ] RED: einTrefferkeineBeherrschung, wiederholteFehler→supportStage1/2/3→teacher, Hilfe→Originalabschluss→neueunabhängigeProbe,8/10, Retention, exactfractionequivalence, malformedanswerkeinfachlicherFehler.
- [ ] Implementieren, Testsgrün, committen.

## Task3: KI, Speicherung und Callable-Adapter

**Files:** functions/lib/learning-brain/ai.js, service.js, callables.js; functions/main.js (nur neue Exporte); functions/test/learning-brain-service.test.js.
**Reuse:** getOpenAI/requestStructured/TEXT_MODEL/OPENAI_API_KEY aus vorhandenerCodebasis. Keine neue Providerverbindung/Secrets.
**Endpoints:** learningBrainCatalog({})=>catalog; learningBrainProfile({grade?,track?})=>{learner,skills,recommendations,activeSession,catalogVersion}; learningBrainStart({topicId,minutes,eventId})=>session; learningBrainTurn({sessionId,revision,eventId,action:'answer'|'help'|'question'|'finish',answer?,question?})=>session.
**Public session:** {id,revision,topic,phase,task:{id,prompt,contextText,input:'text'|'number'|'choice',options:[]},explanation,visual,feedback,remainingSeconds,summary}. Keine keys/acceptedAnswers/privateRubrics.
- [ ] RED: zweiUIDs, andereSessionID, deletedaccount, projectguard, duplicateevent/collision, stale revision, AIabort, hiddenkeys.
- [ ] Kurze native strukturierte Generation + getrennte fachliche Prüfung + freieAntwortbewertung; bei Unsicherheit keine falscheEvidenz. Fachkontext/Quelle/Hilfestufe konsistent. Audio-/Sprechkompetenz nur mit tatsächlichem passendem Weg, sonst offen.
- [ ] Firestore(private LearningCollections) nur AdminSDK, AuthEigenzugriff; Reservierung vorProvider außerhalbTxn, commit nachVerifikation mitrevision, eventcached, gespeicherterResume. KeineRulesneuanlage/DBwechsel.
- [ ] Testsgrün; vorhandeneFunctionsuite/ESLint/Node22nachweisen;committen.

## Task4: Persönliche Oberfläche

**Files:** lerngehirn/index.html,app.mjs,api.mjs,styles.css,model.mjs; lerngehirn/test/model.test.mjs.
**Consumes:** vierCallables gemäßTask3; im Loopback optional /api/learning Proxy mit bestehendem getrenntenTestkonto, keineCredentialsimClient. ÖffentlicheTestseite verwendetbestehendeFirebaseAuth/config.
- [ ] RED: nur2Fächer, grade/trackKontext, Themen-/Kontowechselstales, Hilfeantwortfeld, Unterstützungsstatus, Speichern/Resume, Uhrzeit, verloreneEingabe beiNetzfehler.
- [ ] Bestehendes Gehirn/Tokenstil wiederverwenden, persönliche Belege/Empfehlungen; keineleerenAktivierungskarten; Feedback/Teilfrage gleichzeitigmitOriginalaufgabe.
- [ ] Authzustand/Abmelden/AnmeldenüberbestehendenZugang, lesbare Fehlermeldungen, optionale passende Visuals, keinPflichtbild.
- [ ] Tests/Browsersmoke,committen.

## Task5: Zusammenhängende lokale und echte Testläufe

**Files:** tools/learning-brain-preview/server.py; docs/learning-brain/evidence-20261021.md.
- [ ] EchteCallables nurTestprojekt gezieltdeployen, bestehendeFunctionsliste vorher/nachher vergleichen; keinebreiteAI-Codebaselöschung.
- [ ] UnabhängigeSourceReview, dann echteAufgabe/Hilfe/Fehlerfolge/Rückweg/Resume jeFach,12Paareingänge/ausgewählteMedien; ohne echteBewertung keineFertigmarkierung.
- [ ] Zwei synthetische AuthUIDs isoliert, Retry/Neuladen/Neustart/Profileigenzugriff; echteKosten/Requesthistorie erhalten.

## Task6: Abdeckung und Testrollout

**Files:** tools/build-learning-brain-test.mjs; firebase.learning-brain-test.json; docs/learning-brain/coverage.json; workstreams/adaptive-practice-01.md.
- [ ] VollständigeQuellen-/Lernziel-/Familien-/Medienmatrix je12Paar; fehlendePfade bleibenexplizitoffen, nichtalskomplettmelden.
- [ ] AktuellesTesthostingmanifest erneutlesen, unveränderteDateienbytegenaubewahren undnur/lerngehirn hinzufügen; VergleichvorVeröffentlichungbeiParalleländerungabbrechen/neuabgleichen.
- [ ] ExaktenSHAbenennen, freigegebenesTestzielveröffentlichen, HTTPHashes/Functions/echterBrowsernachweisen. KeineanderesProjekt/Rulesbreitdeployen.
- [ ] Receipt/Usage/Offenepunkte/NextStep/STATE mitrealerStufe sichern; nur tatsächlichfertigenUmfangmelden.

## Ausführung und Entscheidungen

Nutzer hat schriftliche Ergänzung und Umsetzung auf Testseite ausdrücklich bestätigt. Umsetzung im selben Fachchat; klare unabhängige Katalog-/Oberflächenpakete dürfen nach dispatching-parallel-agents/subagent-driven-development delegiert werden, Backend/Integration bleiben beim Hauptagenten; Quellen-/Abnahmereview getrennt. Kein wiederholtes allgemeines „Soll ich weitermachen?“ zwischen Paketen.

Nativer Worktreeversuch scheiterte mangels Gitrepository am Chatroot. Fallback: eigener Appworktree ../mathe-deutsch-app, Branch feat/learning-brain-mathe-deutsch-20261021, Basis4f8b792. Vorhandener Docs-/Prototypbranch bleibt erhalten. DBnachweis: STANDARD/FIRESTORE_NATIVE,eur3,(default),Löschschutzan,lesenderCLI-Aufruf21.10. AktuellerTestbestand40Functions, keineLearning-/Classroomprofile-Endpoints; vorhandene Schulverwaltung nurlokal. Kein verfrühtes Zusammenlegen mit realenSchülerdaten.
