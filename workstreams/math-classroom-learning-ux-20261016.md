# GC-GAMES-LEARNING-UX-01 — Mathe auf Staging

**Aktueller Stand: staging_deployed, echte synthetische Live-QA bestanden.** Nutzer- und physische Geräteabnahme bleiben offen. PR240 ist offen/unmerged; kein Update der kanonischen GC39-App oder Production.

[Mathe-Testseite öffnen](https://hausaufgabe-staging--gradecrew-math-classroom-20261016-5qhq3iqm.web.app/fast-quiz/) — ohne altes `?mode=live`. Der eigene Kanal läuft am **23.10.2026 um 07:16:58 CEST** ab. [Maschinenlesbare Receipts](math-classroom-release-receipts-20261016.json) · [Unabhängiger Review](math-classroom-independent-review-20261016.md) · [PR240](https://github.com/HerrLoeffler/Hausaufgabe/pull/240).

## Auftrag, Quelle und Zuständigkeit

Bestehende Taskfamilie GC-GAMES-LEARNING-UX-01; verknüpft GC-GAMES-FASTQUIZ-BINOMIAL-20261012/PR224. Nutzer hat die geschriebene Spezifikation und sofortige Umsetzung samt Staging ausdrücklich beauftragt. Fachowner math_game_implementation; Games-Zentrale koordiniert. Umsetzung ausschließlich im bestehenden 2D-DOM-Spiel mit vorhandenem Vanilla-JS, Brandtokens und fastQuizApi. Keine 3D-Assets oder Engineänderung. Konkrete Grundrechenartenprofile, kein behaupteter vollständiger Lehrplan5–10. In FastQuiz wurde kein vorhandener Remy-/eigener-Test-Importvertrag gefunden; kein neuer Adapter erfunden. Bestehende Themen und Modi bleiben erreichbar.

Main-Einstieg START_HERE/AGENTS/STATE/TODO/README/CHAT_CONTRACT, Games-Workflow/Briefing, Skills und Assurance-Rollen wurden frisch gelesen. Git-Fetch und Live-Development-Status38851394472/job116813159633 sowie tatsächliche PR224-Quelle geprüft. `sources/` blieb read-only. Die genehmigte Produktspezifikation liegt in PR239@c665cc7, vorrangig Folgeplan§4.2. Technischer Plan: `docs/superpowers/plans/2026-10-16-math-classroom.md`.

- Basis: `2e5f8b8e792da08a884dc9eb8f5bd2e9a0f087e5`, PR224.
- Eigener Branch: `feat/math-classroom-learning-ux-20261016`; Integrationsziel `lab/games-structure`.
- **Deployed Source: `7abc866b26b9bc0051667abc4ce700d681528b0e`**, Tree `bf1906d027d79e4b1aa9cfcd1c3ccbe95bc2948f`.
- Releasecheckout: `work/math-classroom-release-20261016`, am Deploy exakt dieser saubere Stand. Implementierungscheckout separat.
- Runtime-Review: cbd6def/Treecb4fcbad; nachfolgend7abc änderte ausschließlich zwei Test-Synchronisierungszeilen, von Root unabhängig gelesen. Runtimefingerprint blieb identisch.

## Umgesetzt

Kopfrechnen mit vier geeigneten Strategieprofilen; eigene vier Stift-und-Block-Profile. Deren balancierter35%-Präfixplan ergibt20Aufgaben13H/7P und als gerundete kurze Fünferfolge3H/2P. Materialhinweise erscheinen vor Start und an Aufgaben; kein Taschenrechner. Solo läuft ohne Zeitdruck. Primärer Einstieg: Aufgaben mit Beispiel → Spielweise → Start; bisherige Modi unter geschlossenem Zusatzbereich.

Klasse gegen Computer nutzt sichtbare feste Energieziele500/600/600/700. Kampagnenlevel3 ergänzt einen kleinen Rechenschritt; fachliches Niveau und Kategorie wechseln nicht heimlich. Ziele sind Planwerte. Vier Teams werden ausgeglichen zugeordnet oder von der Lehrkraft angepasst. Nach Start sind Mitgliedschaft und Nenner fest; spätere Teilnahme bleibt bis zur nächsten Runde ohne Wertung. Öffentliche Boards zeigen Gruppen, keine individuellen Verlierer.

Neue Räume liegen getrennt in `fastQuizClassrooms`. Server prüft Tokens, Slot und Rundennonce; Seeds, Antworten und kanonische Taskfingerprints bleiben privat. Je Runde fünf gemeinsame60-Sekunden-Fenster, Erstversuch20/mit Hinweis10/falsch oder Lösung0, M100. Transaktionen und Idempotenz verhindern doppelte Wertung; Korrekturen erzeugen keinen neuen Slot. Gleiche kanonische Aufgabe wird im Fünferpack nicht erneut gewertet. Schnellfertige können ungewertet weiterüben. Start/Nächste/Wiederholung/Abbruch bleiben bei der Lehrkraft.

## Prüfungen und unabhängiger Review

Node22.23.3:39/39Tests bestanden; geänderte Verhaltensflächen jeweils aus beobachtetem RED→GREEN. Enthalten: H/P-Quote/Präfixe, Zahlenprofile/Dezimalhinweis, Determinismus, kanonische Wiederholungen,24/25er-Teamgrößen, Normierung/Gleichstand, Roster/Rejoin/Latejoin, parallele Erstabgaben, Hinweis/Lösung/Korrektur, genaue Frist, Pflichtslot/Nonce, alte Abgabe nach Retry, manuelle Zuordnung bei späterem Lobbybeitritt und Abbruch ohne Erfolg.

ExactCI **38854682474/job116823390104 SUCCESS**, Node22, Build und Chromium. Legacy-Browser9/9Modi bestanden. Neue integrierte Browserprobe und unabhängiger Reviewer:1440/768/390px, Solo, Lehrer/fünf Teilnehmer/vier ungleiche Teams,600er-Gleichstände, Reload, ungewertetes Weiterüben, Abbruch und Computer-Weiterstieg. Diese Vorabproben verwendeten den echten Reducer mit synthetischem Firestoreadapter. Unabhängiger finaler Review: PASS, keine verbleibenden P1/P2 im begrenzten Diff. Kein allgemeines Rechts-/Security-/Gerätezertifikat.

## Tatsächliches Deployment

Einmaliger Wrapper-Deploy, Session3707 SUCCESS, nach Review/ExactCI. Nur `hausaufgabe-staging`, `functions:fastquiz` und eigener Hostingkanal `gradecrew-math-classroom-20261016`.

- fastQuizApi, europe-west1, Node22, ACTIVE; Firebase-Sourcehash `2a2f749267f5323fb9cfce9c9e61c7a6b7f95638`.
- Echter Ping-Buildhash `82d35bbd4f7e49573e59fdc965b74e23b355d421d5a77bb1923be0a9daa33871` stimmt mit Quelle überein.
- Functionsoperation `operation-1792127743972-65dee41925392-c371c39b-c82560d2`; CloudBuild `47d05aba-6321-46f3-be9c-206158a50bda`.
- Hostingversion `041d48f37aae896f`, Release `1792127826139000`,46Dateien;45HTTP-Dateihashes und vollständiges Manifest exakt mit lokalem gepinnten Build verglichen.
- Kanonisches `release.json` weiterhin `8f8697901f8c1aea89897be855ca2872c82d0f2b`/GC39. Keine Rules-, Auth-, AI-, Assessment-, IAM- oder Productionänderung. Vorhandener Firebase-Login wurde genutzt, keine Credentials kopiert oder neue Grants erzeugt.

## Echte Staging-QA, 16.10.2026

Zwei parallele Runden über ihre natürlichen fünf Minuten, beendet05:24:12UTC. LiveQA2/Session90958 PASS, keine Browserfehler. Alle fünf Fenster H/P/H/H/P mit tatsächlichen HTTPS-/Firestore-Antworten geprüft.

- Teams: fünf initiale Teilnehmer, feste Größen2/1/1/1. Je drei selbständig richtige Antworten → je Person60Punkte. Rohsummen120/60/60/60; **alle600Energie, geteilter Platz1**. Zusätzlicher später Beitritt blieb ungewertet und änderte die Nenner nicht.
- Computer: zwei richtige Antworten40 plus richtige Hinweisantwort10, zwei falsch0 → **exakt500=Ziel, Erfolg**. Lehrkraft startet Runde2/Ziel600; fachliches Niveau n1 bleibt. Danach echter Lehrerabbruch: aborted/successfalse.
- QR tatsächlich vom CDN geladen, sichtbares geladenes IMG; QR-Titel-URL nutzt `?classroom=CODE`. Schülerbeitritt über diese URL und manuellen Code geprüft. Kein physischer Kamerascan behauptet.
- Reload erhält Teilnahme und Punkte; ungewertetes Weiterüben funktioniert. Öffentliche Projektion enthält keine anderen Mitgliederdaten, Seeds oder Keys.
- Logo tatsächlich geladen, HTTP200/MIME `image/svg+xml`. Phone-Einzelviewport390×844 ist korrekt; DOM enthält genau1Navigation/1Classroom/1Titel/3Schritte, Breite390 ohne Überlauf. Wiederholungen in einem Fullpage-Bild sind Sticky-Header-Stitching, keine mehrfachen DOM-Bereiche.

Dauerhafte lokale Belege: `artifacts/math-classroom-20261016/` im Projektworkspace. Dateien: `live-proof.json`, `phone-dom-proof.json`, `http-proof.json`, `live-math-start-desktop.png`, `live-math-phone-viewport.png`, `live-math-lobby-qr.png`, `live-math-paper-task.png`, `live-math-four-teams.png`, `live-math-computer-next.png`.

## Wiederaufnahme, Versuche und Grenzen

Frühe Checkpoints8d1fa01/5ec8b32 wurden gesichert. Shell-Push scheiterte an fehlender HTTPS-Anmeldung; der bestehende GitHub-Connector sicherte identische Trees als2a55fc08/8cdcd443/cbd6def/7abc866, ohne Credentialanforderung oder Force-Push. Historische CI38854325276 und38854477864 bestanden ebenfalls; maßgeblich ist die exakte7abc-CI.

Drei unabhängige P2 aus dem frühen Stand (Dezimaldarstellung, kanonische Wiederholung, fehlende Pflichtslot-/Rundenbindung) und der eigene manuelle-Zuordnungsbefund sind behoben/verifiziert. Ein UI-Rejoin-Bootstrapfehler wurde im integrierten Browser gefunden und korrigiert. Ein simulierter Startclock-Race war ausschließlich Testtreiber; der letzte Commit synchronisiert ihn. LiveQA1 stoppte **vor** Rundenstart am Testselektor: QRCodeJS versteckt das Canvas und zeigt ein IMG. Versuch1 bleibt separat erhalten; zwei synthetische Räume warteten ohne gewertete Runde. Nach korrigiertem Selektor lief QA2 erfolgreich. **Kein zweiter Deploy.**

Keine bezahlten Provideraufrufe, keine neuen Guardianläufe. Bestehende Task-/Versuchs-/Budgethistorie bleibt erhalten; tatsächliches Modell/Effort/Usage unbekannt, kein Live-Modellwechsel. Skills gelesen: brainstorming/writing-plans/executing-plans/worktrees/TDD/systematic-debugging/frontend-design/firebase-hosting-basics/firebase-firestore/requesting-code-review/verification. img2threejs nicht passend für reine2D-Lern-/Serverarbeit. Relevante Assuranceflächen SEC04/06/07/08/11/14/17 und PRIV07/12/13/14/17/20 sind durch die benannten begrenzten Belege abgedeckt, kein Vollaudit behauptet.

Physische iPads/Phones, Kamerascan, reale Klasse und Martins fachliche/visuelle Nutzerabnahme bleiben offen. `expiresAtMs` ist eine sechsstündige Zugriffsfrist, kein Nachweis automatischer Datenlöschung dieser Collection. Kleinere Copy-Details wie „1 Personen“ bleiben für spätere Politur; kein Releaseblocker. Kein neuer Quellimport oder vollständiger Lehrplanumfang. Kanonische TODO-/STATE-Registrierung koordiniert Root beim bestehenden Owner; alte Branchsnapshots nicht nach main kopieren.

**Nächster Schritt:** Martin testet die verlinkte Stagingversion. Allein üben startet direkt; Computer braucht mindestens einen Schülerbeitritt; vier Teams brauchen mindestens vier Teilnehmer mit getrennten Geräte-/Browseridentitäten. Papier/Stift bereitlegen, Aufgaben und Niveau wählen, Klasse vorbereiten, QR/Code teilen und gemeinsam starten. Laufende Deploy-/QA-Vorgänge: keine.

## Wiederaufnahme18Oct — laufender Ausbau, noch branch_only

Fachowner math_expansion_oct18 übernimmt den ausdrücklich autorisierten Implementierungs-/Stagingauftrag; Root Games-Zentrale koordiniert. requested gpt-6.1-sol/high wegen Auth-/Quelladapter und privater kontinuierlicher Wertung; actual/Usage unknown. Currentmain a2db22f geprüft, DevelopmentStatus39159197044 SUCCESS. Lokaler cbd4eb7 und Remote e074bd1 identische Trees; Histories per normalem Merge erhalten. Kein unbekannter laufender Deploy aus voriger Übergabe.

Neues verbindliches Ziel ausschließlich gradecrew-staging-2026; hausaufgabe-staging ist ab18Oct Schul-Live und wird nicht verändert. Preflight vorhandeneCLI/Anmeldung:37ACTIVEAI/AssessmentFunctions, darunter startAiTestJob/startAiTestVariantJob; fastQuizApi fehlt(404). Keine Learningfunctions dort; keine pauschale Deploymentübernahme. Testprojekt-Firebasekonfiguration öffentlich vorhanden. Keine Kundenquellenmigration.

Scope: neue classroom-sources/classroom-v2, bestehende Mathe-UI/Build und gezielte Tests/Deploywrapper. sourceAdapter bewertet Originaltestfragen, immutableSnapshot/privateKeys, deterministische Varianten und Vorratsprüfung. Nicht geprüfte Formate/Kompetenzen offen anzeigen. Relevante SEC04/06/07/08/11/14/17 und PRIV07/12–15/17/20; begrenzte Negativtests und unabhängiger Rootreview, kein40erAudit. Reine2D-/Serverarbeit, keine3DRekonstruktion.

Skills writing-plans/executing-plans/TDD/verification/worktrees/brainstorming/frontend-design/firebase-auth-basics/firebase-firestore/firebase-hosting-basics gelesen; vorhandener Auftrag ersetzt weitere Designfreigaben. Plan docs/superpowers/plans/2026-10-18-math-source-expansion.md. NächsterSchritt: quellentreueFamilien+Kontrollrechnung RED→GREEN. Bisher kein neuer Deployment-/Providerstart. Historische Versuche/Budgets unverändert.

###18Oct Codecheckpoint1 — source/runtime branch_only
Neue quellenprivate V2-Module und HTTPadapter implementiert. Bestehende eigene Test-ID wird mit echtem FirebaseIDToken+aktivemTeacherprofil+Ownerprüfung geladen, max100Fragen/60kB; laufendePrüfungen/gesperrteQuellen ausgeschlossen. UnveränderlicheRevision beiCreate/Start erneut geprüft. KeineLearningfunctions verändert.
Quellfamilien: exakt numerische binäre Ganzzahl-Grundoperationen, Originalschlüsselkontrolle, Ziffernbreiten/Zehnerübergang erhalten; unsupportedText/Medien/Dezimal-/weitereFormate sichtbargesperrt. Lehrplan5natürlicheZahlen,6gleichnamigeBrüche,7Prozent/Gleichungen,8/9lineareGleichungen,10quadratischeGleichungenmitVorzeichenbedingung; jeweiligeramtlicherLehrplanPLUSlink, keineVollabdeckung. H/P getrennteParameter/Richtzeiten.
FortlaufendeEinmalwertung ohneMinutentimeout, privategleicheAufgabenfolge, Dauer60–1200s+Vorratfür2sLastfallmit20Reserve, neuewertbare6./7.Aufgabe bewiesen. NachFristkeinePunkteaberLernfeedback;2/3/4TeamsmitNamen/festemRoster/Größennormierung;AbbruchkeinErfolg. ComputerzielausRichtzeitfolge/Dauer, ausdrücklichunkalibriertePlanwerte.
Tatsächlich47/47GamesNodeTestsgrün, davon8neueV2TestsmitbeobachtetemRED→GREEN;2Originalfragen→320eindeutigeKontrollierte10MinutenVarianten. UIbeimseparatenFachautor; neueFixtures/CloudQA/Review/CI/Deployfolgen. KeinDeploystart. QAteacherimneuenTestprojektzumbegrenztensynthetischenTestautorisiert;nochkeineIdentitätangelegt.

###18Oct Codecheckpoint2 — integrierteUI/Reviewfixes, noch branch_only
UI-Fachautor math_expansion_ui_oct18 liefert4Schritte, echteTestprojekt-Anmeldung/Remyjobadaption, abhängigeKlasse5–10/Zug/Thema,1/3/5/10min/custom60–1200s,2/3/4Namen+Lobbybearbeitung, geschlosseneQuelllösungs-/Vergleichsdetails, SoloohneZeitlimit. EchteReducerbrowserprobe+synthetischeSDKAuth grün; keinCloudnachweis daraus. Neuesmath-onlyBuildskript ersetztauchLegacyFastQuizAPIzielimOutput mit gradecrew-staging-2026 und sperrtSchul-/AltproductionEndpunkte; keineanderenGamesmithartcodiertemLivebackendaufneuemKanal.
ZweiunabhängigeReviewbefunde behobenmitRED→GREEN: QuellresultatZiffernbreiteerhalten(z.Bkeine105aus38+7); ComputerzielgegenungerundeteRohschwelle stattAnzeigeenergie. EigeneKanonisierungKommutativ+aktiveReceiptbegrenzung verhindernDoppelvariantenbzw1MBDokumentwachstum.
RootpräzisiertProduktvorgabe: sicherekleineZahlenfamiliennachvollständigemVariantenzykluszurFestigungwiederkehrend,keinefalscheunendlichEinzigartigGarantie,keinneuerModus. PreparezeigtHinweis; globalesH/P35%-Präfix+neueopakeInstanzNonce+Einmalwertungbleiben. NeuesRED→GREENzeigtkleinen2+2/3+1Raum und100000steAufgabeninstanzohneLeerlauf. Unsupportedquellenweitergesperrt.
51/51Node24Testsgrün; Node22.23.3wiedergefunden unter/private/tmp/gc-admin-toolchain/node/bin/node; exakteNode22Suite/Browserlaufenjetzt. Testidentität+2eigeneQuellfragenimneuenTestprojekt tatsächlichangelegt,StatusreceiptgeschütztprivatnurTestdaten. ErsterSetupversuchSDKFirestoreCredentialfehler VORMutation; FolgeschrittmitvorhandenenAdminAuth+FirestoreRESTerfolgreich; keineBlindwiederholung. KeineZugangsdatenimRepo/Log.
NächsterSchritt: Node22Ergebnislesen, exaktenKandidatenpushen/CI+finalenReviewfreeze, dannnurbeauftragtefastquizCodebase+MatheHostingkanalveröffentlichen undechteCloudTeacher/Schüler/Remyprobe. BisjetztkeinDeploygestartet.
