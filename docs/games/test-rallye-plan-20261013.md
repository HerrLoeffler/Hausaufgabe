# Test-Rallye Implementation Plan

> **For agentic workers:** Ausführung im vorhandenen Fachagenten mit superpowers:executing-plans. Schritte werden mit Checkboxen verfolgt. Nutzerauftrag: zuerst ausführlicher Plan, anschließend direkt umsetzen, prüfen und auf isoliertem Staging deployen. Keine zusätzliche allgemeine Freigaberunde.

**Goal:** Eine Lehrkraft startet einen eigenen normalen GradeCrew-Test als vierte Games-Kachel; Schüler spielen die unveränderten Aufgabenformate in einer gemeinsamen, sicher bewerteten Runde.

**Architecture:** Vorhandener Testeditor und sichere Owner-Testquelle; neue isolierte Test-Rallye-HTTP-API mit Firebase Auth für Lehrkräfte und privaten Teilnehmercredentials. Der vorhandene Assessment-Core erstellt PublicPaper und serverseitige GradingKeys. Der bestehende sichere Schülerrenderer wird als reines Rendering-Modul wiederverwendet; Originaltest, formale Attempts und Lösungsfreigaben bleiben getrennt.

**Tech Stack:** Vanilla ES modules/DOM/CSS, Firebase Auth 12.4.0, Cloud Functions Node22, Firebase Admin14.4.0/Functions7.4.0, Firestore ausschließlich über Admin API, Firebase Hosting Preview.

**Spec:** Akzeptierter Nutzerauftrag und Defaults, in diesem Dokument vollständig festgehalten; vorheriger Entwurf bleibt in Git-Historie von PR235 erhalten. Task GC-GAMES-TEST-RALLYE-01, keine zweite Task-ID.

## Global Constraints

- Nur hausaufgabe-staging; Production hausaufgabe-40294 ist nicht freigegeben. Kein canonical Hosting-/Web-Release überschreiben, keine umfassende Rules-Veröffentlichung, kein neues IAM-/Providerkonto, kein KI-Jurycall pro Antwort.
- Quellen: main d3dd36d5b63062de7d4702c40ac1dd87574cc484; Web/Assessment 8f8697901f8c1aea89897be855ca2872c82d0f2b (gc39,165Files); Games lab/games-structure55e58e4f6147d0d274d8e5f51578b5d60cb33b4e; FastQuiz PR2242e5f8b8e792da08a884dc9eb8f5bd2e9a0f087e5 offen/unmerged.
- Plan/Handoff auf vorhandenem docs/test-rallye-plan-20261013 / DraftPR235 sichern. Runtime-Kandidat separat von geprüftem Web-SHA mit gezielt übernommenen Games-Dateien; niemals vollständigen alten Games-Branch in den Web-Release übernehmen.
- Bestehende Aufgabenverträge, Bilder/Audio, sichere opaque IDs, serverseitige Teilpunktbewertung verwenden. Keine Umwandlung nach MC, kein neuer Testeditor, keine Lösungen im Schülerpaper.
- Alle erhalten dieselbe Aufgabenreihenfolge, bearbeiten individuell nach gemeinsamem Start. Eine wertbare Abgabe je Aufgabe; explizit „Antwort prüfen“. Voll richtig+100; vollständig falsch−50 und5s Antwortsperre; Teilpunkte proportional zu+100, ohne Minus oder Sperre. Scoreminimum0. Zeitbonus/Serienbonus aus. Nach falscher Abgabe automatisch nächste Aufgabe nach Sperre, keine Wiederholung. „Weiß nicht“ gibt0P und5s Pause. Wählbare Dauer; Ende bei Zeitablauf oder wenn alle fertig sind.
- Sperre betrifft Antworten, nicht Navigation/Hilfe; Netzfehler zählen nicht als Abgabe. Serverzeit entscheidet, Reload/Token/Rejoin ändern Score/Sperre nicht.
- Manuelle Bewertung ist vollständig aus Test-Rallye ausgeschlossen (erneute Nutzersteuerung13.10.: „manuelle bewertung rausnehmen!!“). Kein manueller Prüfen-/Lehrerfreigabe-/Nachbewertungsworkflow, auch nicht später in diesem Scope. Text nur bei eindeutigen acceptedAnswers und manualReview=false; sonst ganzeRunde preflightblockiert, vorhandenenEditor zum Umarbeiten oder anderenTest anbieten.
- Normale Runde ist kein benoteter Testversuch. Originaltest bleibt unverändert. Kontrolle von formalen Practice-/Exam-Lösungen bleibt unverändert; Spielrückmeldung nach Abgabe verrät keine künftigen Antworten.
- Nutzerziel: echtes auswählbares eigenes Testmaterial und vorhandener Create/Editflow, spielbarer Lehrer-/Schülerlink; Fixture-Demo allein genügt nicht.
- Entwicklungseinstieg darf Sprung/Reset/Diagnose/Feedbackexport anbieten, ausschließlich in serverseitig als Development markierten Owner-Räumen. Release-API verweigert solche Aktionen unabhängig von UI.
- sources/ bleiben read-only. Modelle/Usage/Budget unbekannt als unbekannt dokumentieren, keine neuen paid Calls/Reservierungen; bisherige Versuche erhalten.

## Review Focus

1. Owner wechselt oder fremde Test-ID: jede Liste/Preflight/Create/Start-Aktion authentifiziert und serverseitig ownerId-geprüft, stale UI löschen.
2. Doppelte Abgabe, Timeout nach Write, zwei Tabs: identische RequestID liefert dieselbe Receipt, andere ID für bereits erledigte Aufgabe ändert nichts; unsicherer Netzstatus bleibt wiederholbar mit derselben ID.
3. Vier Farbgruppen, leere/teilweise Mehrteiler, deutsches Zahlformat: ursprüngliche Rendererwerte und Corebewertung unverändert, keine Bewertung bei einzelnen Klicks.
4. Snapshotquelle wird vor/nach Start editiert oder entfernt: Start erstellt atomaren fixierten Spielvertrag; spätere Originaländerung beeinflusst laufende Runde nicht.
5. Reload während5sSperre oder Zeitende; Entwicklungsaktionen an Release-Raum: serverseitige Ablehnung unabhängig von lokalen Uhren/Feldern, Diagnoseexport enthält keine Schlüssel/Tokens/Antwortinhalte.

## Briefing und Gestaltung

Zielgruppe: Lehrkräfte am Desktop/Projektor und Lernende in Touch-/Maus-/Tastaturbrowsern; Kürzel statt Vollname. Lernziel ist Wiederholen selbst gewählter Testinhalte mit nachvollziehbarem Feedback. Kernschleife: Testauswahl→Lobby→gemeinsamer Start→Originalaufgabe→explizite Abgabe→Punkte/Feedback→Fortschritt→Endstand.

2D DOM gewählt (9/10: bestehender Testeditor, zugängliche Eingaben, schneller Review, keine neuen Assets); Canvas-Spielschicht (4/10: aufwendige doppelte Eingaben und Accessibility ohne Lernnutzen). Beide nach Reuse, Eingabe, Serververtrag, Aufwand und Zielgeräten beurteilt. Kein3DAsset/img2threejs nötig.

Visuelle Referenz: bestehender GamesHub und SecureStudent in den genannten Git-SHAs, eigene GradeCrew-Assets. Tokenbasis bg#f6f7f9,card#ffffff,ink#182235,muted#68778e,line#d8e0eb,blue#2f62d0. Vorhandene System-/Inter-Schrift, sichtbarer Fokus, großzügige Antwortflächen, klarer Aufgabenblock unter ruhigem Punkte/Zeitkopf. Lehrkraftansicht links Testauswahl/Regeln, nach Raumstart Code/QR und Rangliste. Schüleransicht ein Original-Aufgabenblock, darunter Prüfen/Weißnicht und lesbare Rückmeldung. Status zusätzlich textlich, Farbmarkierungen benannt. Keine neuen Rasterassets/externen Rechte.

Kleinste Referenzrunde: sechs gemischte Aufgaben (single,multi,number,markwords inklusive4Farben); mindestens richtige/falsche/teilweise/Weißnicht-Abgabe, Countdown, Reload, Board und Ende. Danach11Typen. Physische Kamera/iPad/Klassenlast separat offen; Desktopbrowser und simulierte Touchviewport werden ausdrücklich getrennt dokumentiert. Keine erfundenen FPS-/MB-/Performancebelege.

## Dateien und Reusegrenzen

Runtime-Kandidat: feat/test-rallye-20261013 auf Web8f869790, eigenes Checkout. Plan und Handoff werden mitgenommen; eigener PR gegen feature/gradecrew-app-integration. DocsPR235 bleibt gesonderter Koordinationscheckpoint.

- `lab/test-rallye-functions/core.js`: reine Preflight-, Snapshot-, Scoring-, Transition-/PublicStatefunktionen, Tests ohne Firebase.
- `lab/test-rallye-functions/index.js`: neue `testRallyeApi` HTTP-Function, Auth, Firestore-Transaktionen, TTL/Ownerdelete und Payloadlimits; eigener codebase `testrallye`, region europe-west1. Keine bestehenden Functions ersetzen.
- `lab/test-rallye-functions/vendor/assessment-core.js`: bytegleicher geprüfter Bewertungs-Core mit Herkunft8f869790; keine unabhängige neue Gradingimplementierung. Falls reale Vertragsfehler auftauchen, eng dokumentiert adaptieren und Paritytests, nicht still ändern.
- `lab/test-rallye/{index.html,app.js,styles.css}`: Hostauth/Testliste, Preflight, LobbyQR, Schülerjoin, render one question, Polling/Serverzeit, Board/Final, sichere Rejoincredentials, pendingRequest-Persistenz.
- `lab/test-rallye/question-renderer.mjs`: reiner Rendering-/Antwortadapter aus `secure-student.js`8f869790; Renderer vom Assessmentrouting lösen. `renderQuestion(question,index,locale)` und `collectQuestionAnswer(question,section)` behalten opaque IDs. Keine Lösungsdaten.
- `lab/test-rallye/dev.mjs`: ausschließlich berechtigte Developmentroomcontrols und lokal exportierbares redigiertes Feedback. Kein Zustellungsversprechen.
- `lab/shared/games-catalog.js` und `lab/games-hub`: gezielte vierte Kachel; alte3Games bleiben. Alte Gamesquellen/Builder aus PR224 soweit nötig bytegleich übernehmen.
- `tools/build-lab-test-rallye.mjs`, `tools/build-test-rallye-preview.mjs`: geprüften Webeditor unter eigener `/editor/`-Route und vorhandenen Hub/Games plus Rallye zu isoliertem Preview paketieren, Manifesthashes über alle Dateien. Keine breite canonicalPromotion.
- `firebase.testrallye.json`, `deploy-test-rallye-staging.sh`: allowlisted project/codebase/channel, getrennter Functions-/Hostingnachweis, nur spezifische neue API. Keine Rules/IAM.
- `tools/test-rallye/{core.test.cjs,api.test.cjs,renderer.test.mjs,browser-smoke.cjs}`: meaningful Verhaltenstests; eigener CIworkflow mit exakten SHA-Gates.
- `workstreams/test-rallye-plan-20261013.md`: Schritte, Red/Green, aktuelle Review/Deployreceipts, Versuchshistorie und next action; State/TODO/Registry nur scoped Änderung über frisches main.

## API und Speichervertrag

POST `/testRallyeApi`: `{action,payload}` → `{ok,data}` oder redigierter Fehler. Hostsendet FirebaseIDtoken im Authorizationheader; keine clientseitig gewählte uid/ownerId. `listTests` gibt nur eigene Quizmetadaten (id,title,subject,grade); `preflight({quizId})` liefert Typcounts/Blocker, kein gradingKey. `createRoom({quizId,durationSec,development})` liefert6stelligen Code. `startRoom({code})` liest Quelle erneut mit ownerId, fixiert Snapshot/Paper/Key/Hash und start/endMillis. Einmaliger Start bleibt idempotent.

`join({code,alias,clientId,token})`: zufällige128+bit clientID/token lokal erzeugen; server speichert tokenHash. Wiederholung derselben Identität ist idempotent, andere Credentials können bestehende Identität nicht übernehmen. Join nur in Lobby; Rejoin derselben Person auch running/finished. max30Teilnehmer, Kürzelmax24Zeichen. Raumcode ist kein Hostcredential. Rate-Limits pro IP sowie Raum/Host begrenzen Create/Join, keine öffentlichen Personendatenlisten.

`playerState({code,clientId,token})`: Status, Serverzeit, Frist, Score, cursor, cooldownUntil und genau aktuelles lösungsfreies Item; abgeschlossene Receipt ohne Lösungsschlüssel. `submit({code,clientId,token,requestId,questionId,answer,skip})`: Firestoretransaction prüft Raum/Teilnehmer/Snapshotversion/Frist/cursor/Sperre; gradingKey nur serverseitig; Receipt+Score+cursor+Sperrende atomar. Clientscore/Clientzeit ignorieren. Gleiche requestId vor Fristchecks aus Receipt wiedergeben; keine Dopplung. Neue Anfrage für altes Item verweigert.

`hostState({code})`: Owneronly Board mit Kürzel, Score, Fortschritt/status; `finishRoom`, `deleteRoom`: Owneronly, Delete löscht Spielunterdokumente ohne Originaltest. Nur autorisierter Developmentraum `devReset`, `devJump` (Ownerprüfung+immutable Developmentflag); Release verweigert. Feedbackexport lokal mit Commit/Roomstatus/itemtype/repro-Text, keine tokens/Antworten/Schülerdaten.

Collection `testRallyeRooms` ist private server-only; Publicclient hat keine Firestorezugriffe. Neue Collection gegen deployed deny-defaultRules prüfen; bei fehlender Denygrenze Release dieses Pfads blockieren und exakt Owner koordinieren, keine globalen Rulesdeploys. Private Snapshot unter Roomprivate; Teilnehmer/Receipts privat. Timestamp expiresAt24h, explizite Ownerdeletefunktion; TTLpolicy nur nach bestehender zulässiger Konfiguration, sonst cleanup beim Zugriff und dokumentierte verbleibende Frist. Antwortdaten nur maximal nötige Receiptresultate, Rohantwort nach Bewertung nicht persistent. Raid-/Enumerationantworten keine Testtitel/Schülerdaten.

## Capability-Matrix

| Typ | Originaleingabe/PublicPaper | Bewertung/Teilpunkte | Preflightblocker |
|---|---|---|---|
| single | Radio,opaque optionID,Bild/Audio | bestehender Core | <2Optionen/kein eindeutiger Schlüssel |
| multi | Checkboxen,explizit prüfen | CoreTeilpunkte,auf100normieren | keine richtige Option |
| truefalse | Wahr/Falsch | Coreboolean | fehlender authored boolean |
| dropdown | Select+gegebenenfallsAudio | CoreoptionID | fehlende Optionen/Key |
| number | decimal text inklKomma,unit | numericAnswer+tolerance Core | nichtfinite Antwort/ungültigePunkte |
| gapfill | public segments+opaque gapIDs | CoreTeilpunkte | keine auswertbaren Lücken |
| matching | bestehende Auswahlfelder/Audio | Corematches Teilpunkte | leere/unvollständige Paare |
| ordering | bestehende Sortierbuttons/Audio | CoreacceptedOrders | <2Items/manuellerReview |
| grouping | Select je Item,opaque groupID | Coreassignments | keine Gruppen/Items |
| markwords | Wortbuttons,benannteFarbwahl bis4Farben | Coreword-/colorIDs Teilpunkte | fehlendeTargets/Passage/falsche Farben |
| text | vorhandenes Textfeld | ausschließlich normalisierte acceptedAnswers | manualReview oder keine eindeutigen acceptedAnswers |

Bild-/Audioprojektion benutzt `buildAssessmentContract`; stale/incomplete audio und listening-only textabhängige Aufgaben blockiert mit Aufgabennummer. Kein stilles Wegwerfen; wenn irgendein Item unsupported ist, gesamte Runde vor Start sichtbar blockieren. Punkte müssen>0 sein. Quellemax80Items/RoomDocPayload<700KB; zu große Originaltests klar melden. Reihenfolge position+id stabil. Paperkeine correct,numericAnswer,tolerance,acceptedAnswers,targets,markedIndices,manualReview. Aufgabenschlüssel/Hash niemals durch hostState/playerState/Fehler/Export weitergeben.

## Zustandsmodell, Uhren, Retries

Room waiting→running→finished oder deleted; Start setzt runVersion1. Schüler cursor0→N, Score0+, letzter Receiptresult, cooldownUntil. Ein Item wird genau einmal bewertet, cursor atomar erhöht; während Sperre bleibt Rückmeldung sichtbar, nächstes Item erst serverseitig entsperrt. Keine Aufgabe automatisch erneut erzeugen. Letzte Abgabe beendet Teilnehmer; Roomfinish bei allen erledigt, ansonsten gemeinsamer deadline. ServerMillis+offset rendert Countdown, Backendtime final. Zeitende auch ohne Clientpoll beim nächsten APIzugriff normalisieren.

PendingSubmit mit requestId+answer im sessionStorage bis bestätigter Receipt; bei Netzfehler unverändert wiederholen. Nach Reload zuerst playerState und ggf dieselbe pendingSubmit ausführen; keine neueID erzeugen. Eingabedraft pro Room/cursor lokal; Serverzustand gewinnt. Polling2s, submission UIbusy; no punishment on failedHTTP. Alte/ungültige Tokens zeigen klaren sicheren Wiedereinstieg, keine unauthentifizierte Scoreänderung. Raumjoincredential niemals in QR, URLs, Receiptfiles oder Diagnoseexport.

## Meilensteine und Verhaltenstestgates

### Task1: Plan und Sourcecheckpoint

- [ ] Plan gegen Spezifikation/Interfaces selbst prüfen; jeden Reviewfocus einem Test zuordnen.
- [ ] Docsbranch Plan/Handoff/TODO/Registry aktualisieren, commit/push; PR235 Titel/Beschreibung an neuen Nutzerauftrag anpassen. Parent konkreten SHA/Link schicken.
- [ ] Runtimebranch vomWebSHA und eng übernommenen Gamesquellen isolieren; Basisbelege und laufende Vorgänge sichern.

### Task2: Bewertung und private StateMachine

Interfaces: `preflight(questions) -> {ok,issues,counts}`; `snapshot(questions,secret) -> {paper,key,fingerprint}`; `submitTransition(room,player,payload,nowMillis) -> {player,receipt}`; `publicPlayerState(room,player,nowMillis) -> PublicState`.

- [ ] Tests zuerst: richtige+100/falsche−50floor0/Teilpunkte50ohneSperre/skip0mit5s; Zahlkomma;4Farbgruppen; duplicateID; andererItemID; Frist/Sperre; invalidshape und maxpayload; paperdenyfields; unsupportedmanual; sourceimmutability.
- [ ] Node `--test tools/test-rallye/core.test.cjs` rot für fehlende Funktionen beobachten.
- [ ] Kleinen Core implementieren, vorhandenes assessment-gradeQuestion verwenden, Tests grün; gesamte bestehende Assessmenttests ausführen, Ergebnis/abweichende Fehler ehrlich berichten.
- [ ] Commit und Übergabe sichern.

### Task3: Auth und transactionalAPI

Consumes Task2, produziert oben APIaktionen. Tests über isolierten Repositoryadapter mit synthetischen Testdaten; echter Firestoretransaction im Endpoint.

- [ ] Tests zuerst: fehlendesAuth/fremderOwner; joincredentialHash/rejoin; concurrent duplicate; serverignores score; hostboardonly; ReleaseDevDenied; Ownerdelete; privateprojection.
- [ ] Node `--test tools/test-rallye/api.test.cjs` erwartete Rotphase, dann minimale API/validation/rate-limits.
- [ ] Syntaxcheck+beideSuiten grün; deny-default deployedRules/source belegen, keine neueRulesfreigabe behaupten.
- [ ] Commit und Checkpoint vor externer Ausführung.

### Task4: Originalrenderer und完整 gemischte Runde

Interfaces: `renderQuestion(question,index,locale)` erzeugtDOM; `collectQuestionAnswer(question,section)` ergibt Corepayload.

- [ ] Rendererinteractiontests für multi/gapfill/matching/order/group/4colors/Bild/Audio und keyleak zuerst; RED→extrahierterRenderer→GREEN.
- [ ] Hostauth über bestehenden angemeldeten GradeCrewAccount; listTests/preflight und `/editor/` Create/Editlink mit Rückweg. Auswahlrefetch nach Editorreturn; Roomerstellung ohne KI.
- [ ] Schülercode/Kürzeljoin, Lobby/QR/Start, score/countdown/oneitem/explizit prüfen, skip und Ergebnisansicht; Board laufend+Endstand.
- [ ] Pendingrequest/reload/offline/Serverzeit UIgates und echte gemischte Referenzrunde lokal mit APIadapter; keine Fixtures als Stagingbeweis.
- [ ] Parent frühen funktionsfähigen Kandidat für unabhängigen Review melden, Commit sichern.

### Task5: AlleTypen, Dev und Hubregression

- [ ] übrige Typen vollständig aktivieren, unsupportedPreflight sichtbar; normale ReleaseDevaktionen backenddenied testen.
- [ ] bounded Devjump/reset/diagnostics/export, nach Feedback normales Weiterspielen; keine Zustellungsbehauptung.
- [ ] vierteKachel/Navigation in bestehendem Hub hinzufügen; alte3Games/Codejoin/Binomik prüfen, vorhandene Gamesregressions ausführen.
- [ ] Responsive/focus/smallviewport/Touchsimulation im echten Browser; keine physischeGeräteabnahme behaupten.
- [ ] Buildmanifest+Functionsconfig+CI mit exaktem RuntimeSHA; unabhängige Reviewfindings reproduzieren/fixen und erneut zielgerichtet prüfen.

### Task6: IsoliertesStaging und tatsächlicher Lehrer/Schülerlauf

- [ ] Frisches main/target/status und lokale laufende Vorgänge, deployziel+exactSHA benennen; gesicherten Checkpoint vorStart.
- [ ] vorhandenen legitimen FirebaseCLIlogin normal verwenden; nur `functions:testrallye` in hausaufgabe-staging deployen; echten Receipt mit Functionhash/SourceSHA/exit sichern. Kein credentialexport.
- [ ] geprüften Hostingbuild in eigenen7TageChannel `gradecrew-test-rallye-20261013` deployen; echte URL/expiry/manifesthashes/exit sichern, canonicalRelease8f869790 weiterhin prüfen.
- [ ] HTTP allerManifestdateien+APIhealth prüfen; tatsächliche LehrerAuth/OwnTestauswahl/Create/Edit und zweiBrowserjoin/Start/gemischteAntworten, Score/Sperre/Reload/Endstand durchführen. Synthetisches Kürzel, keine Kundendatenexporte. Testquelle nur eigener synthetischer Test oder vom legitim angemeldeten Nutzer ausgewählterTest.
- [ ] getrennter Hosting-/Functions-/Rules-/Browsernachweis, konkreter Nutzerlink und Schritte; PR/CI/Review und Grenzen sichern. user_tested erst nach Martins Abnahme.

## Rollback und Releasegrenzen

EigenerPreview ist entfernbar/ablaufend, canonical unverändert. Neue isolierte API kann auf gesicherten letzten reviewedRallyeSHA zurück oder disabled werden; keine bestehendenFastQuiz/AssessmentFunctions/Rules löschen. Roomdelete nur eigene synthetische Spielrunde; Quelltest niemals automatisch löschen. Hostingrollback repariert keine Functions, Receipts getrennt. Bei Auth-/Credential-/Domainfehlern exakten Backendfehler belegen und unangetastete Plan/Codearbeit sichern; kein neuer Login-/IAM-Bypass.

## Assurance und Selbstprüfung

Owner: ausführender Rallye-Fachagent; unabhängiger Review/Playowner durch Games-Zentrale. SEC04/06/07/08/11/14/17 für dependencies,auth,ownership,protectedstate,limits,input,projection; PRIV07/17/20 für minimaleKürzel/Retention/delete; PRIV12/13/14 für ehrlicheCopy,Bildalt/Farbbezeichnungen/Kontrast. Originalkataloge/rollen gelesen; Scopebelege in Handoff, keine fremdenKataloge überschreiben. Schul/AVVfacts unbekannt, keine Legalzertifizierung aus synthetischerPreviewrunde.

Selbstprüfung vorBau: Nutzeranforderungen denTasks1–6 zugeordnet, Rendering/Corepayload und opaqueIDs konsistent, fünfReviewfocus-Testgruppen explizit, Plan enthält Codeverträge statt ausformulierterFunktionsbodies. Bekannte Unsicherheit: tatsächlicher FirebaseCLIlogin und LehrerAuthbrowser erst live zu belegen; derzeit keinDeploy/CI/Spieldurchlauf behauptet. Stand: Plancheckpoint vorbereitet, Implementierung folgt direkt gemäß Auftrag.
