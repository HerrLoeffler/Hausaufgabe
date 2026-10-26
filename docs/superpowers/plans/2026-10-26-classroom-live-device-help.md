# GC-CLASSROOM-01: Unterrichtsverwaltung, LIVE und sichere Gerätehilfe

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Der Nutzer hat Planung und anschließende Ausführung im bestehenden Fachchat beauftragt. Keine zusätzliche Konzeptfreigabe erforderlich.

**Goal:** Lehrkräfte finden Klassen, Schüler und laufende Prüfungen sofort, starten eine Klasse gemeinsam und können einen einzelnen Secure-Prüfungsmodus nachvollziehbar beenden, ohne Antworten zu löschen.

**Architecture:** Bestehender GradeCrew-Arbeitsbereich und Firebase-Lehrerlogin bleiben bestehen. Die zusätzlichen Classroom-Module erweitern Navigation und Testkarten; Server bleibt einzige Autorität für Schülerbindung, gemeinsamen Start, Abgabe und Gerätefreigabe. Secure beendet eine echte Apple-AAC-Sitzung und bestätigt erst nach Apples Ende-Callback; kein simulierter Entsperrerfolg.

**Tech Stack:** Bestehendes Vanilla-JavaScript/DOM/CSS, Firebase Auth/Firestore/Functions, SwiftUI/AutomaticAssessmentConfiguration, bestehende TestFlight-Pipeline.

**Spec:** Dieses Dokument enthält die vom ausführenden Fachchat konkretisierte Produktspezifikation und den Implementierungsplan; ergänzt die bestehende Klassen-/Schülerarchitektur und den Geräteprüfplan23Oct.

## Ausgangslage und Fehler mit Vorrang

26Oct wurde eine neue komplette Website veröffentlicht. Lehrerzugang liegt jetzt in workspace.html. Der alte Klassenloader fehlte und ist seit22703241 wiederhergestellt,212Dateihashes bestätigt, Nutzer bestätigt sichtbareKlassen. Die separate neue Homepage bleibt unverändert.

Während der Planung meldet Martin eine abgegebene, danach erneut startbare Prüfung. Tatsächlicher Nachweis:66CCZ7JY enthält zwei bewerteteTestZwei-Abgaben, beide ohneclassroomBindung, dazu einen früheren korrekt gebundenen Versuch. Die heute18:56UTC veröffentlichten Prüfungsdienste enthalten keinen Classroom-Adapter mehr; classroomAccess/Web hingegen blieben bestehen. Antworten gingen nicht verloren; die Klassenprojektion konnte die ungebundenen Abgaben nicht zuordnen. Dies ist ein Release-Kompositionsfehler und blockiert den erneuten persönlichen E2E-Test.

## Ziele, Grenzen und Entscheidungen

- Ziel bleibt ausschließlich gradecrew-staging-2026. Keine Änderung an Schul-Live, Production, main oder fremden Branches.
- Bestehende Lehreranmeldung, Passwortwege, Tests, Bearbeitung, Veröffentlichung, Auswertung und Löschen erhalten. Keine Neuanmeldung/Accountmigration.
- Kein neues Designprodukt: GradeCrew-Blau, vorhandene Schrift und Logos, weißer Arbeitsbereich, ruhige Flächen, klare Zeilen und feste Aktionsbereiche.
- Keine neue Prüfungsengine oder zweite App. Persönlicher Schülercode und vorhandener Gastzugang bleiben bestehen.
- Keine neue Übungsfunktion. Kein unnötiges Tracking von Schülerverhalten; „arbeitet“ ist gemeldeter Prüfungsstatus und keine Überwachungsbehauptung.
- Keine automatische Zuordnung alter Abgaben nur anhand des Namens. Zwei gleiche Namen oder mehrere bearbeitete Versuche machen eine solche Zuordnung unsicher. Vorhandene Abgaben bleiben erhalten; die Lehrkraft sieht einen expliziten Hinweis auf unzugeordnete Abgaben und kann die Originalergebnisse öffnen. Eine spätere manuelle Nachverknüpfung ist ein eigener bestätigter Vorgang.
- Alle heute bekannten neuen Aufgaben-/Visualisierungsfunktionen aus dem tatsächlichen Prüfungsquellstand erhalten. Kein Rollback des Gesamtbackends auf einen alten Classroom-Stand.

## Verglichene Ansätze

Bewertung nach Verständlichkeit im Unterricht, Bestandsschutz, Prüfungsintegrität und Wartbarkeit:

| Ansatz | Eignung | Abwägung |
|---|---:|---|
| Nur zusätzliche Knöpfe in der heutigen Oberfläche | 5/10 | Schnell, aber unruhige Karten und unklare Wege bleiben bestehen. |
| Bestehende Oberfläche mit festen Arbeitsbereichen und einem LIVE-Monitor | 9/10 | Bewahrt Login/Testeditor, ordnet häufige Handlungen und nutzt geprüfte Prüfungsabläufe. Gewählte Umsetzung. |
| Vollständiger Neubau mit eigener Navigation und Prüfungsverwaltung | 3/10 | Hohe Umstellungs- und Datenrisiken; widerspricht ausdrücklich dem gewünschten Bestandsschutz. |

## Navigation und Layout

Desktop: eine linke Navigation mit „Meine Tests“, „Klassen“, „Schüler:innen“, „LIVE-Prüfungen“. Jede Seite erhält eine klar benannte Überschrift, eine kurze Hilfezeile und einen festen Bereich für die häufigste Aktion. Auf Tablets/Telefonen wird die Navigation zu einer umbruchfähigen oberen Leiste; Tabellen bleiben horizontal bedienbar, keine abgeschnittenen Aktionen.

### Meine Tests

Bestehende Suche, Statusfilter, Sortierung und Testbearbeitung bleiben erhalten. Bei jeder zugewiesenen aktuellen Runde steht ein sichtbarer primärer „LIVE · Durchführung“-Button direkt bei Bearbeiten/Ergebnisse. Ein Entwurf oder noch nicht zugewiesener Test erhält „Klasse zuweisen“; LIVE darf keine alte Runde stillschweigend öffnen. Sind mehrere Klassen aktuell zugewiesen, öffnet sich eine kurze Klassenauswahl. Die Zuordnung wird beim Klick frisch geprüft; zwischenzeitliche Konto-/Rundenwechsel werden verworfen.

Ein grüner Punkt/„LIVE“ kennzeichnet den Einstieg, nicht automatisch eine laufende Prüfung. Der Monitor zeigt den tatsächlichen Zustand „Warteraum“, „Läuft“, „Geschlossen“. Keine dauernden Teilnehmerabfragen für jede Testkarte; Teilnehmerpolling nur im geöffneten Monitor,5Sekunden, nur bei sichtbarer Seite.

### Klassen

Suchfeld findet Klasse und Schuljahr. Klassenkarten/Zeilen zeigen Name, Schuljahr und Schülerzahl. Primäre Aktion „Klasse öffnen“, ergänzend „Test zuweisen“. Innerhalb einer Klasse stehen Schülerliste, „Schüler hinzufügen“, „Codes ansehen“ und „Drucken“ zusammen. Der Nutzer muss nicht zwischen fünf Fenstern wechseln. Leere Treffer und leere Schule erhalten konkrete Hinweise. „+ Klasse anlegen“ bleibt sichtbar; bestehende Schule wird verwendet.

### Schüler:innen

Klasse auswählen und Namen durchsuchen in einer einheitlichen Werkzeugleiste. Auswahl einer Klasse aus der Klassenübersicht setzt diesen Filter. Namen sind anklickbar; Code anzeigen und Einzelkarte drucken bleiben direkt erreichbar. Schülercode ist nicht standardmäßig für alle offen, kein Code im Suchindex/URL/Log. Bestehende12er-Karten, Listen und große Einzelkarten mitLogo und4-4Darstellung bleiben erhalten.

### LIVE-Prüfungen

Nach Klasse/Titel durchsuchen. Jede Zuweisung zeigt Testtitel, Fach, Klasse und erwartete Teilnehmerzahl; primär „LIVE öffnen“. Keine Duplikation der eigentlichen Testbearbeitung. Der Link aus einer Testkarte und diese Liste öffnen denselben Monitor.

## LIVE-Monitor im Unterricht

- Kopfbereich: Testtitel, Klasse, tatsächlicher Rundenzustand, letzter Aktualisierungszeitpunkt.
- Deutlicher primärer „Test für alle starten“-Button im Warteraum. Beim gemeinsamen Start setzt der Server genau einen Startzeitpunkt. Wiederholung/Doppelklick verändert die Uhr nicht.
- Sind noch Personen nicht beigetreten, zeigt eine Bestätigung die Anzahl; „Fehlende anzeigen“ filtert direkt auf diese Namen, „Trotzdem starten“ ist ausdrücklich möglich.
- Zähl-/Filterleiste: Alle, Wartet, Bearbeitet, Abgegeben, Noch nicht beigetreten, Hinweise. Kein blinkendes Dashboard.
- Namenszeilen bleiben bei Aktualisierung stabil; Fokus, Filter und offene Hilfe bleiben erhalten.
- Letztes Signal ist getrennt vom Prüfungsstand. Nach45Sekunden ohne Signal Hinweis, keine Behauptung „arbeitet nicht“. Bei Ausfall bleiben letzte Stände sichtbar, Startaktion gesperrt.
- „Hilfe“ bietet Fortsetzungshinweis, Gerätefreigabe und expliziten Ersatzversuch; „Ergebnis“ öffnet bestehende Ergebnisse. Empfangene Abgaben lassen sich nicht versehentlich neu öffnen.
- Unzugeordnete gespeicherte Abgaben werden mit Anzahl und Ergebnislink gemeldet. Sie werden nicht heimlich einer Person zugerechnet.

## Gerätefreigabe: Bedeutung und Grenzen

Die Funktion heißt „Prüfungsmodus auf diesem iPad beenden“. Sie entsperrt ausschließlich die GradeCrew-AAC-Sitzung des konkret benannten Versuchs, nicht den iPad-Gerätecode, eine MDM-Sperre, ActivationLock oder einen separat manuell aktivierten GuidedAccess-Modus.

Lehrkraft öffnet die betroffene Namenszeile, prüft Person/Test/Versuch und bestätigt mit Begründung. Der Server prüft aktives Lehrerkonto, Schule, Eigentümer der Zuweisung, konkrete attemptId und generation. Eine fremde Lehrkraft oder ein Schüler kann keinen Befehl erzeugen. Doppelklick nutzt dieselbe actionId; eine wiederholte Anfrage darf keine zweite unabhängige Aktion auslösen.

Statusablauf:
1. „Angefordert – wartet auf Verbindung“ nach erfolgreichem Serverauftrag.
2. „Auf dem iPad angekommen“ erst nach authentifiziertem Abruf durch dessen ursprüngliches Versuchstoken.
3. App blendet Prüfungsinhalt aus, sichert vorhandene Antworten/Identität, stoppt weitere Bearbeitung und beendet AAC mit session.end(). Ein defekter Webrenderer darf die Entsperrung nicht verhindern und niemals den vorhandenen Snapshot durch leere Antworten ersetzen.
4. „Prüfungsmodus beendet“ erst nach Apples didEnd-Callback und erfolgreicher Bestätigung an den Server. Ein fehlendes Callback oder Verbindungsabbruch bleibt erkennbar unbestätigt.
5. Der Versuch bleibt gesichert und unterbrochen. Kein automatischer zweiter Versuch, keine neue Prüfungszeit, keine erfundene Abgabe.
6. „Fortsetzung erlauben“ durch dieselbe berechtigte Lehrkraft erlaubt den bestehenden Versuch. Die App prüft das beim bewussten Fortsetzen, aktiviert AAC erneut und setzt denselben Versuch mit denselben Antworten und derselben Serverfrist fort. Ein Ersatzversuch bleibt ein anderer ausdrücklich bestätigter Weg.

Sonderfälle: verspäteter Befehl darf keinen anderen Versuch treffen; altegeneration oder falschesToken wird abgelehnt. Eine zwischenzeitlich eingegangene Abgabe bleibt maßgeblich. Geschlossene Runde darf für technische Hilfe freigegeben werden, wird dadurch aber nicht wieder geöffnet. Bei App-Neustart bleiben Freigabeauftrag und lokaler Stand erhalten, kein automatisches Wiederbetreten vor Prüfung.

## Vollständig offline oder eingefroren

Ein Netzwerkbefehl kann ein nicht erreichbares iPad nicht zuverlässig steuern. Die Oberfläche zeigt dies ausdrücklich und enthält Gerätehilfe mit Apple-Neustartanleitung/Schul-IT-Hinweis. Es gibt keinen allgemein bekannten Schüler-Notfallcode und keinen heimlichen AAC-Bypass. Kein Löschen/Neuinstallieren der App empfehlen, solange Antworten nur lokal gesichert sind. Physischer Test muss bestätigteFreigabe,fehlendeNetzverbindung,ausbleibendesAppleCallback undWiederanlauf abdecken.

## Release und Schutz gegen erneuten Verlust

Neue Websitepakete werden vom tatsächlich ausgelieferten Dateimanifest gebaut. Alle fremden Dateien bleiben hashgleich; eigene Module und workspaceLoader werden ergänzt. Prüfungsdienste werden aus dem tatsächlichen aktuellen Quellpaket mit den Classroom-Bindungsänderungen zusammengesetzt. Integrationsnachweis muss enthalten: Gast bei persönlicher Zuweisung abgelehnt; erster persönlicherVersuchgebunden; nachAbgabe SchülerErledigt/LehrerAbgegeben; erneuterVersuchgesperrt. Ein grüner Test eines isolierten Moduls genügt nicht.

## Review Focus

- Re-Deploy neuerVisualAufgaben entfernt Schülerbindung: Verhalten am zusammengesetzten tatsächlich veröffentlichten Handler testen.
- ZweiAbgaben gleicherName: keine automatischeZusammenführung; Originalergebnisse bleibenunverändert.
- Lehrer-Kontowechsel während LIVE-Laden/Hilfe: alteAntworten undAktionen dürfen neuenAccountnichtbeeinflussen.
- Freigabe während Abgabe/Fristablauf: echteReceipt bleibt maßgeblich, keine neueZeit/neuerVersuch.
- iPad offline/Rendererdefekt/AppleCallback fehlt: Daten erhalten, Lehrer zeigt keinen ungeprüften Erfolg.

## Aufgaben und Akzeptanz

### Task1: Abgabeverknüpfung reparieren (zuerst)
Files: assessment-functions/lib/secure-lifecycle.js, classroom-binding.js, dazu tatsächliche aktuelle Laufzeitabhängigkeiten und Handlerregressionen.
- [x] Failing regression: aktueller Deploy akzeptiert zugewiesenenGast bzw erzeugtungebundenenVersuch.
- [x] Aktuellen DeployQuellstand mitbestehendemClassroomAdapterzusammensetzen,neueVisualAufgabenbehalten.
- [x] Handlerprüfungen: gleicherSchüler/gleicheRunde nur einVersuch; echteSubmissionliefertKlassenstatussubmitted; fremderSchülerabgewiesen.
- [x] EigenerCheckpoint,gezielt2026Funktionen veröffentlichen,synthetischenE2E-Nachweis sichern; alteAbgaben nurlesen/erhalten.

### Task2: Weblayout und LIVE-Einstieg
Files: classroom/online-workspace.mjs/css,exam-monitor.mjs, neue kleine UI-Helfer falls nötig, tools/classroom-preview/build-online-2026.mjs.
- [x] RED für frischeaktuelleRundenwahl,Mehrklassenwahl,Konto/Rundenwechsel,Name/Klassenfilter.
- [x] FesteNavigation/Toolbar,Klassenöffnung,Schülersuche undLIVE-Testkartenbutton umsetzen.
- [x] MonitorKopf/Filter/Start/Hilfen gestalterisch vereinheitlichen,alteDruckwegeerhalten.
- [x] BrowserDesktop/Tablet/Mobil: Namen/Knöpfe lesbar,keinunerreichbarerDialog,Login/Originaltestsintakt.

### Task3: Authentifizierte Gerätehilfe
Files: assessment-functions/lib/classroom-device-actions.js (neu),classroom-service.js,classroom-functions.js,classroom-binding.js, entsprechendeTests; WebHilfe undMonitor.
- [x] RED: Fremdlehrer,falscherVersuch,generation,token,Doppelklick,veralteteBestätigung,Receipt-Rennen.
- [x] requestDeviceExit,deviceExitStatus,acknowledgeDeviceExit,allowDeviceResume mitgenauerBindung undAudit umsetzen.
- [x] UIbestätigtPerson/Grund undzeigtangefordert/angekommen/beendet/fehlgeschlagen; Offlinehilfeeinbauen.
- [x] KeineRoles/Rules-Aufweichung,keinCodeindenLogs,keineMutationohneBerechtigung.

### Task4: Secure-App
Files: SecureExamCoordinator.swift,SecureSavedWork.swift,SecureReplacementPolicy.swift oderneuePolicy,SecureStagingRootView.swift, Tests/BuildkonfigurationnachbestehenderStruktur.
- [x] RED: FreigabepayloadnurfüridentischenVersuch,gesicherteAntwortenerhalten,spätesCallbacktrifftkeinenneuenVersuch.
- [x] UnabhängigerStatusabrufauchbeiWiederherstellung,Ausblenden/Sichern/AACEnde/Bestätigung,gesperrteFortsetzungimplementieren.
- [x] PrüfungvorerneutemAACStartundbewussteFortsetzung desselbenVersuchs;AbgabeReceiptbleibtmaßgeblich.
- [ ] Swift/NativeBuild/Layout/Integrationprüfungen;ein2026TestFlightKandidat,BuildnummerausRunbelegen,nichtschätzen.

### Task5: Abschluss und gemeinsamer Test
- [x] Gesamtsuites,frischerbegrenzterGesamtReviewundbelegteFixes.
- [x] Hostingnur2026mitaktuellerVersionsLease,öffentlicheHashes;BackendrevisionenundQuellbezügegetrenntdokumentieren.
- [ ] Nutzergerät: persönlicherCode→LIVEwartend→gemeinsamerStart→Abgabe→Erledigt/Lehrerabgegeben→keinzweiterVersuch.
- [ ] TechnischeHilfe: gezieltesiPadbeenden→Bestätigung→Fortsetzungerlauben→gleicherVersuch/Antworten;Offlinefallbleibtausdrücklichunbestätigt.
- [ ] TODO/STATE/Handoffaktualisieren;keinephysischeAppleAbnahmebehauptenohneGerätebeleg.

## Präzisierungen aus dem unabhängigen Builder-Check

- Historische ungebundeneAbgaben blockieren neue persönlicheStarts der betroffenenRunde bis zur explizitenKlärung. resolveSubmission({assignmentId,attemptId,studentId?,disposition:'link'|'retain',confirm:true}) prüftOwner/Runde/Person undüberschreibtkeinbestehendesParticipantAttempt. AlleAntworten/Punktebleibenunverändert. ZusätzlicheVersuchewerdenausdrücklicherhalten.
- GeräteAPI: teacher requestDeviceExit({assignmentId,studentId,attemptId,expectedGeneration,actionId,reason,confirm:true}); allowDeviceResume({assignmentId,studentId,attemptId,expectedGeneration,actionId,confirm:true}). Device deviceExitStatus({quizId,attemptId,attemptToken}) undacknowledgeDeviceExit({quizId,attemptId,attemptToken,actionId,outcome:'ended'|'failed'}). AlleRückgabenbindenquizId/assignmentId/studentId/attemptId/generation/actionId. EinPoll registriertFähigkeitexit_v1; ältereAppsbleibenexplizitohnebestätigteUnterstützung.
- Zustände pending→delivered→ended|failed, ended→resume_allowed ausschließlichnachLehrerfreigabe. Solangepending/delivered/failed/ended: ServerblockiertPaper/Resume/weitereBearbeitung;vorhandeneReceiptbleibtabrufbar. ResumeüberholtkeineunbestätigteFreigabe. NeueActionIDerstnachvorigerbeendeter/resumierterAktion;staleACKwirkungslos.
- PolltimeristunabhängigvomPrüfungstickundauchinrecovery/interruptedaktiv. KeinWartenaufRenderer: letztebereitsdauerhafteAntwortennutzen,Inhaltausblenden,AACbeenden;AppleCallbackabwartennurinasynchronemTask,StatusUIbleibtreaktiv. ErstCallbackdarfechteFreigabebestätigen. PersistenterExitMarkerblockiertautomatischenAACNeustartnachApprelaunch.
- BackendKompositiontestetmain.js(daspackage.jsonMain),behältaktuelleVisual-/Gradingdateienhashgleich undprüftvorDeployallebetroffenenRevisionen/Quellgenerationen. ÄnderungenanFremdquellendürfennichtblindüberschriebenwerden.

## Weitere Nutzerpräzisierungen im laufenden Auftrag

- Hilfe enthält zwei verständliche Bereiche: „Test für diesen Schüler neu starten“ und „Prüfungsmodus auf diesem iPad beenden“. „Fortsetzen anfordern“ verschwindet aus der Lehrerbedienung; der bisherige technische Hinweis ist kein Ersatz für einen Abbruchbefehl. Ohne begonnenenVersuch keinevorgetäuschtenSteuerknöpfe.
- AusLIVEgeöffneteErgebnissekehrenmitZurückzurzugehörigenLIVERundezurück; normaleErgebnisseausMeineTestsbehaltennormalenRückweg. UngespeicherteBewertungbrauchtVerwerfbestätigung.
- BestehenderreviewPanelrutschtwegenNamenskollisionmitreview-mode.cssrechtsalsFloatingPanel. GezielteIDgebundeneCSS-KorrekturverwendetdiebestehendeBewertungbreitunterderErgebnisliste;keineneueBewertungsengine.
- PrüfhilfefürkritischeAntworten: vorhandenerRegistryWorkstreamfreetext-review/feature/freetext-review-priorityistblocked;aktuellenFREETEXT_REVIEW_STATUS.mdlesen,keinzweitesKIPrüfsystemnebendranbauen. EigentlicherRisikosortierungs-/WilmaAnschlussistgesonderterIntegrationsscope,keineautomatischeNotenänderung.
- AAC-EndeohneAppleCallbackistkeinebestätigteEntsperrung. NachAppneustartohneaktuellesSessionobjektmeldetdieAppfehlendeBestätigung;keinErfolgaufgrundnil. BestehenderErsatzversuchkanneinenaltenunterbrochenenStandübergetypteReplacementReceiptablösenundgeschütztarchivieren;keineheimlicheAntwortlöschung.


## Verifizierter Zwischenstand 26Oct2026
Webaa62f3da/Backendba0b6af8 auf2026,216öffentlicheHashes,741Webtests. VierImportant-Reviewpunkte in einerRED/GREEN-Passagebehoben. OriginalbewertungunterTabelle,ZurückzumgleichenLIVE und768/390Viewporttatsächlichgeprüft. TestZwei-Demodatenexplizitnachverknüpft,Extraabgabeerhalten,erneuterStartabgewiesen. GeräteprotokollmitsynthetischemClientgeprüft,keinephysischeAppleAbnahme. Native30152288/run40395762544:3iPadGatesPASS,phonefailed(WebKitunresponsivebeimOffline-Recovery-Test),Uploadskipped. KeineBuildverfügbarkeitbehaupten;gezielteReproduktionläuft.


## Neuer ausdrücklicher Nutzerauftrag26Oct: Abschluss statt Unterbrechung
Der Nutzer will bei einem laufenden einzelnen Schüler „Prüfung beenden und abgeben“ drücken können. Das ist terminaler Abschluss, während die bisherige Gerätefreigabe nur unterbricht. Nicht durch Umbenennen/Entsperren des alten Buttons vortäuschen.
- [ ] Bestehenden persönlichen Versuch/Build/Steuerkanal prüfen; aktuellVersionaufiPadunbekannt,1232beiAppleverarbeitetundGradeCrewTesterzugeordnet. SeparateVersionsanzeigeausBundleunteninalleAppzustände einbauen undverifizieren.
- [ ] Eigener bestätigter Lehrerauftrag fürgenauSchule/Zuweisung/Schüler/attempt/generation,mitBegründung,Aktualitätsprüfung,Idempotenz/Audit. KeineAbgabevorvorliegendemAntwortsnapshotundServerreceipt behaupten,keineanderenSchülerbeenden.
- [ ] Kompatiblen bestehenden Prüfungsstatusabruf nutzen,fallsnachweislichunterstützt;keineunbestätigteDevice-FähigkeitdurchhartesUIenableumgehen. NeueApp:beiLehrerabschlussletztenhaltbargesichertenStandverwenden,defektenWebrenderer nichtunbegrenztabwarten,AbgabemitnormalemidempotentemReceiptpfad,danachAppleEndebestätigen. BeiNetzausfall„Abschlussangefordert/Übertragungausstehend“ statt„Abgegeben“. VollständigeingefroreneApp/OSkannnichtperNetzgarantiertgesteuertwerden.
- [ ] Test: paralleleAbgabe/Neustart/ältererAuftrag/Tokenwechsel,fremdeLehrkraft,offlineRenderer,AbgabeRetryundkeinzweiteschreiben. EchteiPadabnahmezuletzt. NochNICHTimplementiert.
Deploymentgrenze:KeineCanonical2026Hostingpublikationmitrelease.json-onlyBuilder;Wilma192 undvollständigenVersion-Dateibestand samtConfig/Ownerleaseerhalten. NativeVersionfooterbrauchtkeinenHostingdeploy.
