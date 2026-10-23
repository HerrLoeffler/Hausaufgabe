# GC-CLASSROOM-01 · 2026-Serverstart und Prüfungsübersicht · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Bestehenden ausführenden Classroom-Chat und seine Checkouts weiterverwenden; keine parallele zweite Umsetzung starten.

**Goal:** Auf der bestehenden 2026-Seite den persönlichen Schülercode bis zur bestätigten Secure-Abgabe testbar machen; die Lehrkraft begleitet dieselbe Runde mit einer verständlichen Teilnehmerübersicht und sicherer Hilfe bei Geräteproblemen.

**Architecture:** Bestehenden Firebase-Lehrkraftlogin, Testeditor, Testdaten und Assessment-Lifecycle erhalten. Den bereits implementierten serverseitigen Classroom-Zugang zunächst tatsächlich startfähig bereitstellen; Webübersicht und native Secure-App greifen auf dieselben Schüler-, Zuweisungs- und Versuchsdaten zu. Lehrkraftaktionen verändern einen Versuch nur nach serverseitiger Berechtigungs- und Versionsprüfung.

**Tech Stack:** Bestehende Web-ES-Module/Firebase Auth und Firestore, Node.js22 Firebase Functions Gen2/europe-west1, SwiftUI/Keychain/geschützter lokaler Antwortspeicher, bestehende Secure-/AAC-/Receipt-Pipeline.

**Spec:** Bestehender freigegebener Plan `docs/classroom/GC-CLASSROOM-01-IMPLEMENTATION-20261016.md`, insbesondere R/T/U/U2, plus Martins Auftrag vom23.10.2026. Dieser Nachtrag präzisiert Betrieb und Lehrerbegleitung; er ersetzt nicht die bisherigen Identitäts-/Import-/Schulregeln.

## Verbindliche Grenzen

- Task-ID bleibt GC-CLASSROOM-01; Versuchshistorie und bereits laufende Vorgänge erhalten.
- Ziel ausschließlich `gradecrew-staging-2026`, Website https://gradecrew-staging-2026.web.app/ . School-Live `hausaufgabe-staging`/gradecrew.de und Production `hausaufgabe-40294` sind kein Ziel.
- Normaler Lehrkraftlogin, Abmelden, eigener Testbestand, Erstellen/Bearbeiten/Veröffentlichen/Ergebnisse bleiben erhalten. Keine Konten-/Testmigration als Nebenwirkung der Veröffentlichung.
- Bestehende Oberfläche erweitern. Originale aktuelle2026Assets einschließlich app.js/config erhalten; alte lokale app.js nicht vollständig darüber veröffentlichen.
- Persönlicher Schülercode identifiziert eine Person, kein Test; acht Zeichen. Keine freien Namens-/Kürzeleingaben als Ersatz für die serverseitige persönliche Bindung.
- Kein Üben in diesem Umfang. Rollen-/CSV-/Schuljahresfunktionen aus früheren Teilaufträgen nicht als Teil dieser Reparatur neu entwerfen.
- Aufgaben/Lösungsschlüssel, Bewertung, Rechte und bestätigte Abgaben bleiben serverseitig. Browseranzeige oder lokaler Fertigknopf ist kein Abgabenachweis.
- Eine unterbrochene Verbindung beendet keine Prüfung. App-Neustart/Personwechsel löscht keine ausstehenden Antworten.
- Gemeinsame Runde hat gemeinsame Serverstartzeit und bestehende Zeitgrenze; Ersatzversuch gibt nicht stillschweigend neue volle Prüfungszeit.
- Verfügbare Modelle/Aufwand nicht aus Dokumentation ableiten; aktuelle Runtime unknown. Keine neue Budgetreservierung oder TestFlightwiederholung nur wegen Plancheckpoint.

## 1. Geprüfter Ausgangspunkt am23.10.2026

### Bereits implementiert, noch nicht als neuer Ablauf online abgenommen

Web-Aufgabenbranch `feature/classroom-integrated-preview-20261016`, Remote42c53eb0989dfd1f794ae0845dba0bc03a7c1251, lokaldbd5667. Enthält persönlichen Zugang, Webcookie getrennt von Lehrer-Auth, manuelle Schule/Klasse/Schüler mit Codes, Zuweisung, Schülerliste aus echten Attempts/Submissions, erste Teilnehmerdialoge, Start-/Ersatzversuch-API und gemeinsame Fristprüfung. Letzter passender Lauf690/690Web-/Server-/UI-Tests; historische erfolgreiche Prüfung dieses Codebaums, kein neuer Testlauf am23.10 behaupten.

Nativebranch `feature/classroom-secure-access-20261022`, Remotea29967463041aa51cdb6ff6f8b1f9f418ddf6cfd; persönlicher Produktstandefc5e980e87adaf628ec20eb5c03105c73d9ceb7. Persönlicher Code/MeineTests, gemeinsame und private Geräte, sichere Start-/Recoverybindung implementiert; historisch33Swift/24Python und Staging-Simulatorbuild bestanden. Kein physischer persönlicher Abnahmebeleg.

### Tatsächliche Blockaden

1. CloudRun `classroomweb-00001-jir` hat keine Readyrevision und keinen bedienenden Traffic; Start endet nach vier Minuten mit HEALTH_CHECK_CONTAINER_ERROR. Firebase Functions meldet classroomWeb teilweise ACTIVE, das ist hier kein Bereitschaftsnachweis.
2. classroomAccess FAILED; zugehöriger CloudRunservice beim frischen Lesen404. Alte startAssessmentAttempt-Readyrevision00006-fur bedient weiterhin100%Traffic, der fehlgeschlagene neue Stand00007-quy nicht.
3. Zwei dokumentierte Deployversuche, erfolgreiche CloudBuilds; unveränderter gebauter JS-/Framework3.5.1-Paketinhalt lädt lokal mitNode22.23.3 und antwortet korrekt401. Das ist kein Linuxcontainer-/Cloudstartnachweis. Cloudstart ohne eigene Startmarker, genaue Ursache weiterhin unbekannt; keine bewiesene Google-Störung behaupten.
4. Persönlicher TestFlightlauf39858281409 ist inzwischen FAILURE. layout-native und beideWebgrößen erfolgreich; layout-phone meldet xcodebuild65 trotz540/540 vorhandener nativer Berichte. Uploadjob SKIPPED. Ursache aus dem zugehörigen xcodebuild-Artefakt ermitteln; weder Layoutfehler noch Runnerfehler ohne diesen Beleg behaupten. Artefakt12461379858, Job120107992379.
5. Erstes Lehrerfenster ist vorhanden, aber für24Schüler noch auszubauen: klare Runde/Startzustand/Filter, Signalfreshness, Aktionsrückmeldungen und tatsächliche native Übernahme eines Ersatzversuchs fehlen als vollständiger geprüfter Ablauf. Bisherige Hilfe zeigt nur einen Textdialog; sie sendet keinen Fernbefehl.

Main START_HERE/AGENTS/STATE/TODO/CHAT_CONTRACT/README am23.10 frisch gelesen. DevelopmentStatus39858884594 SUCCESS. Main-Classroomzustand beschreibt noch frühen Mock und ist veraltet; kein Beweis gegen den überprüften Aufgabenbranch. Vor Implementierung erneutes Integrations-/Dateiüberschneidungs-Audit, nicht blind den Gesamtbranch integrieren.

## 2. Bedienung für die Lehrkraft

### Einstieg und Aufbau

Links bleibt „Meine Tests“; zusätzlich „Klassen“, „Schüler:innen“, „Laufende Tests“. An einem eigenen veröffentlichten Test stehen „Klasse zuweisen“ und „Prüfungsübersicht“. Die bestehende Ergebnisansicht bleibt erreichbar.

Die Prüfungsübersicht öffnet als normale breite Ansicht im bestehenden Arbeitsbereich. Oben Titel, Fach, Klasse, Runde, Startmodus und gemeinsame Restzeit. Darunter anklickbare Zähler: Alle24 / Noch nicht beigetreten1 / Wartet23 / Bearbeitet0 / Abgegeben0 / Hinweise0. Ein Klick filtert die Tabelle direkt. Namen alphabetisch; aktuelle Auswahl und Fokus bleiben beim Aktualisieren erhalten. Keine springende Liste durch Statusänderungen.

| Gemeldeter Stand | Aussage für die Lehrkraft |
|---|---|
| Noch nicht beigetreten | Für diese persönliche Zuweisung besteht noch kein bestätigter Versuch; Anmeldung in der Übersicht allein reicht nicht. |
| Wartet auf Start | Secure hat den persönlichen Versuch im Warteraum bestätigt; Aufgaben noch gesperrt. |
| Bearbeitet | Server kennt einen laufenden Versuch; keine Behauptung über Aufmerksamkeit oder aktuelle Bildschirmanzeige. |
| Abgegeben | Passende Submission/Receipt liegt auf dem Server vor; Ergebnisansicht öffnen. |
| Übertragung ausstehend | Nur zusätzlich anzeigen, wenn Secure dies für den eigenen aktuellen Versuch gemeldet hat. Kein Ersatz für bestätigte Abgabe. |
| Kein frisches Signal | Letzter Kontakt ist älter als45Sekunden; Zustand bleibt mit Zeitstempel sichtbar. Kein automatischer Abbruch/Fehlversuch. |
| Verbindung der Übersicht unterbrochen | Lehrkraftseite selbst hat keine aktuellen Daten; ganze Übersicht als veraltet kennzeichnen statt alle Schüler als offline zu markieren. |

Zeilen: Name, Stand, letztes Signal, „Hilfe“; bei Abgabe „Ergebnis“. Hinweise erhalten Text und Symbol, nicht nur Farbe. Backend gibt keine Antwortinhalte in der Teilnehmerliste aus. Gesamtzahlen beruhen auf derselben Antwort wie die Tabelle.

### Gemeinsamer Start und verspätete Schüler

Primärer Startknopf nur bei wartender gemeinsamer Runde. Bei23/24Bereiten: „23 warten, 1 noch nicht beigetreten“ plus Auswahl „Fehlende anzeigen“ oder „Trotzdem starten“. Nach bestätigtem Start Knopf durch „Läuft seit…“ ersetzen; Doppelaufruf verändert Startzeit nicht.

Server legt Zeitpunkt einmal fest. Sichere Clients holen Freigabe im bestehenden Warteraum-Polling; Netzwerk verursacht unvermeidlich kleine Ankunftsunterschiede. Gleiche Freigabe und Zeitbasis garantieren, keine millisekundengleiche Bildschirmanzeige versprechen. Nachzügler steigen in dieselbe Runde mit Restzeit ein; nach Frist kein neuer Versuch. Bereits gespeicherte Abgaben bleiben auch nach Rundenende abrufbar.

### Hilfe ohne versehentlichen Datenverlust

1. **Fortsetzen erklären:** Secure auf demselben Gerät wieder öffnen; Versuch und Antworten werden wiederhergestellt. Keine serverseitige neue Generation.
2. **Fortsetzen anfordern:** Ein kurzer Hinweis wird für genau diesen Schüler/diesen Versuch hinterlegt. Bei nächstem berechtigten Kontakt zeigt Secure „Die Lehrkraft bittet dich, den Test fortzusetzen“. Lehrer sieht „angefordert“, danach „auf Gerät angezeigt“/„bestätigt“. Bei fehlender Verbindung ehrlich „noch nicht zugestellt“. Kein Fern-Neustart der App, keine Entfernung aus dem Prüfungsmodus und kein automatischer neuer Versuch.
3. **Neuen Versuch freigeben:** Erst wenn Wiederaufnahme nicht möglich ist. Eine Bestätigung nennt Schüler, betroffene alte Versuch-ID, Begründung und verbleibende gemeinsame Zeit. Hinweis: Eine ausstehende alte Offlineabgabe kann nach Ersetzen nicht mehr angenommen werden. Neue Generation serverseitig atomar; alter Versuch/Audit bleiben erhalten. Bereits bestätigte Abgaben werden in dieser Version nicht über diesen Hilfeweg neu geöffnet.

Die Freigabe ist erst vollständig, wenn das iPad den ersetzten Zustand sicher erkennt und einen neuen Versuch wirklich beginnen kann. Ein Serverknopf allein reicht nicht.

## 3. Review Focus

- Veralteter Lehrkrafttab/Doppelklick darf weder neue Runde starten noch neueren Ersatzversuch überschreiben: Generation und einmalige Aktions-ID prüfen.
- Netzverlust vor/nach Startantwort oder Abgabe-Receipt darf keine Doppelversuche und kein falsches Erledigt erzeugen: Originaltoken und idempotente Recovery testen.
- Neuer Ersatzversuch bei lokal noch gespeicherten alten Antworten darf weder still löschen noch das iPad in einer nicht verlassbaren Wiederaufnahmeschleife halten: bestätigten Ersatzbeleg plus gesicherten Archivwechsel testen.
- Falsche Schüler-/Klassen-/Schul-/Lehrkraft-/Rundenzuordnung darf weder Teilnehmerdaten noch fremde Prüfungen offenlegen: negative API- und UI-Fälle testen.
- Fehlende Clientsignale und veraltete Lehrkraftantworten dürfen nicht als tatsächlicher Schülerstatus erscheinen: Freshness, Requestreihenfolge und Kontowechsel testen.

## 4. Umsetzungspakete und verbindliche Prüfergebnisse

### Paket1: Serverstart ursächlich klären und genau einen Gateway qualifizieren

**Dateien:** `assessment-functions/main.js`, `assessment-functions/package.json`, `assessment-functions/package-lock.json`, `assessment-functions/lib/classroom-functions.js` nur soweit Diagnose eine Änderung belegt; deploybezogene Dokumentation im vorhandenen Workstream.
**Schnittstelle:** vorhandenes `classroomWeb` verarbeitet POST vom exakten2026Origin; ohne Schülercookie/TeacherBearer kein Zugriff; angemeldete Lehrer benutzen ihren unveränderten Firebasezugang.

- [ ] Frische Function-/CloudRun-/Build-/Image-/Operationdaten und alle Logtypen der exakten fehlgeschlagenen Revision sichern; keine Geheimnisse protokollieren.
- [ ] Gegen zuletzt funktionierende Revision vergleichen: Linuxruntime/Baseimage, Launcher/Startprozess, FUNCTION_TARGET, Port/Bindung, Funktionenframework, Ressourcen, Identität und Buildquelle. Lokal geladene JS-Dateien nicht mit gestartetem Cloudcontainer gleichsetzen.
- [ ] Eine konkrete Hypothese mit erwartetem Beobachtungsergebnis festhalten. Kleinste reproduzierende Prüfung bzw. Regression zuerst; keine pauschalen Paketupdates, Rechteänderungen oder längeren Timeouts ohne Befund.
- [ ] Ursache eng korrigieren; relevante bestehenden Tests plus tatsächlichen Startpfad prüfen. Ungeklärter Infrastrukturfall bleibt mit Operation/Revision und begrenztem nächsten Diagnoseschritt dokumentiert.
- [ ] Exakten Commit nennen, nur classroomWeb nach2026 bereitstellen. Erfolg bedeutet Readyrevision UND tatsächliche HTTPantwort, nicht CloudBuild SUCCESS oder Function ACTIVE.
- [ ] Negativprüfung: persönliches me ohne Session401, fremder Origin403, Schülercookie bei Lehreraktion401; keine Bestandsdaten ändern. Diagnosebelege und Code committen/pushen.

### Paket2: Persönliche Identität bis zum Assessmentserver vervollständigen

**Dateien:** `assessment-functions/lib/classroom-service.js`, `classroom-binding.js`, `classroom-round.js`, `classroom-functions.js`, `secure-lifecycle.js`; Tests `assessment-functions/test/classroom-service.test.js`, `classroom-binding.test.js`, bestehende Lifecycle-Tests.
**Schnittstellen:** `execute(uid, command, payload, context)`; `participants({assignmentId})`, `startRound({assignmentId})`, `restart({assignmentId,studentId,expectedGeneration,confirm,reason})`; Startbindung aus schoolId/studentId/assignmentId/generation, niemals aus freiem Namen.

- [ ] Tests für vorhandenen Lehrerzugang/Quizbestand, richtigen Empfänger, Nichtempfänger, fremde Schule, Gastbypass und abgelaufene persönliche Session ausführen/ergänzen.
- [ ] Bestätigte Submission in derselben Transaktion vor restart lesen; bereits abgegebene Arbeit über diesen Hilfeweg nicht ersetzen. Rot→Grün für gleichzeitige Abgabe/Neustart, Doppelaufruf und abgelaufene gemeinsame Frist.
- [ ] Verlust der ersten Startantwort mit altem Token muss denselben Versuch wiedergeben, auch nach Ablaufen der Schülerlogin-Session. Kein neuer Versuch aus abgelaufenem Login.
- [ ] Nur nach Gatewaybeleg die vier betroffenen Funktionen classroomAccess/startAssessmentAttempt/resumeAssessmentAttempt/submitAssessmentAttempt gezielt bereitstellen; jeweilige echte Readyrevision/HTTPantwort prüfen. Alte funktionierende Dienste bis zur bestätigten neuen Revision erhalten.
- [ ] Commit und Einzelreceipts sichern. Keine fremden AI-/Rules-/Functions-Gesamtdeploys.

### Paket3: Lehrerübersicht als ruhigen Arbeitsplatz ausbauen

**Dateien:** bestehendes `classroom/online-workspace.mjs`, `.css`, neuer fokussierter `classroom/exam-monitor.mjs`; Tests `classroom/exam-monitor.test.mjs` und `tools/ui/classroom-exam-monitor.test.cjs`.
**Schnittstelle:** Modul `createExamMonitor({host,api,assignmentId,onOpenResults,now})` liefert `{refresh,dispose}`. API bleibt Teacherautorisierung aus `online-client.mjs`.

- [ ] Zuerst UI-/Modelltests:24erListe, fehlender Schüler, anklickbare Zähler, Zustand/Name/Fokus beim Update stabil, Startknopf nur wartend, Abgabe öffnet passende bestehende Ergebnisse.
- [ ] Backend `participants` liefert zusätzlich bestätigten Rundenzustand, startedAt/deadlineAt, serverNow und Schülerlastsignal; bei Zeitablauf keine irreführende Start-/Ersatzaktion anbieten.
- [ ] Einbettung über „Laufende Tests“ und bestehende Testkarte; breite normale Ansicht statt verschachtelter Tabellenfenster. Bestehende MeineTests/Ergebnisse unverändert erreichbar.
- [ ] Sichtbare Aktualisierung höchstens alle5Sekunden, nur ein Request gleichzeitig. Späte Antworten über Requestversion/UID/assignmentId verwerfen. Beim Schließen/Kontowechsel Timer stoppen und Teilnehmerdaten entfernen.
- [ ]45Sekunden ohne Schülersignal als Hinweis, unabhängig vom Serverversuchsstatus. Eigener Lehrerrequestfehler kennzeichnet gesamte Ansicht als veraltet. Letzten erfolgreichen Aktualisierungszeitpunkt zeigen.
- [ ] Passende Tests grün, visuell mit24synthetischen Zeilen auf Desktop/iPad prüfen, Commit sichern.

### Paket4: Nicht destruktive Fortsetzungsbitte mit Zustellstatus

**Dateien:** neuer `assessment-functions/lib/classroom-actions.js`; Aufruf/Allowlist in classroom-service/functions, Ausgabe im persönlichen me bzw. Assessmentresume; neuer `classroom-actions.test.js`. Native `SecurePupilAccess.swift`, `SecureAssessmentSession.swift`, `SecureExamCoordinator.swift`, `SecureExamChrome.swift`; fokussierte Swift-Tests.
**Schnittstellen:** `requestResume({assignmentId,studentId,expectedGeneration,actionId})` und `acknowledgeResume({actionId,generation})`. Action serverseitig unter der berechtigten Zuweisung/Person mit actor, createdAt, expiresAt, generation, deliveredAt/acknowledgedAt. Wiederholung derselbenactionId idempotent.

- [ ] Fremde Person, falsche Runde/Generation, bereits abgegebene Arbeit und wiederholte Anforderung zuerst testen. Begrenzung: eine aktuelle offene Bitte je Person/Generation; Hinweis nach10Minuten abgelaufen.
- [ ] Erst beim Abruf durch verifizierte aktuelle Person/Versuch Zustellung bestätigen; nicht bereits beim Lehrerknopfdruck „zugestellt“ melden. Empfang und bewusste Bestätigung unterscheiden.
- [ ] Native zeigt kurzen Hinweis ohne AACende, Speicherlöschung, Timerreset oder automatischen Versuchstart; persönlich angemeldeter Schüler ohne Attempt erhält ihn nur in eigener Übersicht.
- [ ] Offline/Wiederverbindung/ältereGeneration/Kontowechsel testen. Teacheranzeige zeigt zustellbar/ausstehend/bestätigt mit Zeit. Commit sichern.

### Paket5: Ersatzversuch auf dem iPad sicher übernehmen

**Dateien:** classroom-actions/binding/secure-lifecycle; native `SecureAttemptStore.swift`, `SecureSavedWork.swift`, `SecureExamCoordinator.swift`, `SecureStatusView.swift`, `SecurePupilPolicy.swift`; neuer fokussierter `SecureReplacementPolicy.swift` plus Tests.
**Schnittstelle:** Server liefert nach gültigem ursprünglichem Attempttoken einen typisierten `replacementReceipt` mit alterAttemptID, assignmentId, neuerGeneration, replacementActionId, serverZeit. Kein generischer failed-precondition-Text als Erlaubnis zur Speicherlöschung.

- [ ] Rot: bisheriger lokal gespeicherter ersetzter Versuch darf nicht in endloser Resumeablehnung steckenbleiben. Unklare Netzwerkfehler, falscher Receipt und fremdeGeneration dürfen gar keinen lokalen Wechsel erlauben.
- [ ] Alten gesicherten Stand zuerst atomar in geschütztes, backupausgeschlossenes Quarantänearchiv überführen; Integrität und richtige alteIdentität prüfen. Originalbindung/Token weiterhin geschützt, nicht in Logs/URLs. Archivfehler lässt bisherigen aktiven Stand vollständig bestehen.
- [ ] Erst nach bestätigtem Ersatzbeleg und ausdrücklicher Anzeige „Die Lehrkraft hat einen neuen Versuch freigegeben“ aktiven Kontext wechseln. Das ist kein fingierter Abgabereceipt. Alte Archive werden nicht automatisch erneut gesendet oder als neue Antworten übernommen.
- [ ] Bestehende AAC-Sitzungsübergänge kontrolliert nutzen; niemals aus Lehrerwebknopf unmittelbar App schließen/Prüfmodus lösen. Neuer persönlicher Versuch verlangt aktuelle berechtigte Session und verwendet neueGeneration bei unveränderter gemeinsamer Frist.
- [ ] Tests für Archivefailure, Appabbruch zwischen Archiv und Wechsel, verlorene Serverantwort, bereits bestätigte Abgabe, falscher Schüler und wiederholten Ersatz. Bestehende Queue-/Receipt-/Offline-/Keychainregressionen grün; Commit sichern.
- [ ] Archivaufbewahrung dokumentieren: nicht Teil normaler Schüleransicht; keine permanente zweite Ergebnisdatenbank. Bereinigung nur über gesondert nachvollziehbaren, bestätigten Wiederherstellungs-/Verwerfungsweg, niemals als Seiteneffekt eines Logouts.

### Paket6: Tatsächliches2026Hosting additiv veröffentlichen

**Dateien:** `tools/classroom-preview/build-online-2026.mjs`, Online-Modul/CSS/Monitor; Tests für Erhalt des aktuellen Originals. Bestehendes release.json und Assetmanifest als Referenz verwenden.

- [ ] Unmittelbar vor Build aktuellen2026Hostingmanifest und Assethashes neu lesen; seit letztem gc44Snapshot hinzugekommene Änderungen erhalten. Vorbereitetes altesBundle nicht blind veröffentlichen.
- [ ] Neue Module additiv einbinden; exakteFirebaseprojektkennung, Teacherlogin und bestehende APIziele beibehalten. Neue Origin/Cookie/Rewritefunktion wirklich vom Host testen.
- [ ] Mit fiktivem Lehrkraftkonto Schule/Klasse24Schüler anlegen, Codes ausgeben; vorhandenen veröffentlichten Test zuweisen. Persönlicher Schüler sieht genau eigene Zuweisung, zweiter Nichtempfänger keine fremdePrüfung.
- [ ] Vorher/Nachher: gleicherTeacherUID und gleicherBestandIDs, unveränderteAufgaben/Ergebnisse; Erstellen/Bearbeiten/Speichern weiter möglich. Nur zusätzliche synthetische Daten bewusst markieren.
- [ ] Hashnachweis für alle erhaltenen Assets; wirkliche Browserprüfung von Startseite, Teacherlogin, Schülerlogin, MeineTests, Zuweisung und Monitor. Screenshot/Deployreceipt sichern; erst dann Hosting als veröffentlicht dokumentieren.

### Paket7: Persönlichen Securekandidaten durch alle bestehenden Gates bringen

**Dateien:** konkreter Befund entscheidet; Quellen in native/GradeCrewSecure und bestehende LayoutTests/ScriptTests. `.github/workflows/gradecrew-secure-testflight.yml` nur bei belegtem Workflowfehler ändern; Gates nicht überspringen.

- [ ] Artefakt12461379858 aus bestehendem Lauf39858281409 lesen, exakten xcodebuild65Fehler bestimmen.540Berichte sind kein erfolgreicher Prozessabschluss. Keinen ganzen neuen Lauf als Diagnoseersatz starten.
- [ ] Eng korrigieren und fehlgeschlagene Prüfung lokal soweit möglich reproduzieren; passende native/Web/Pythonregressionen ausführen. iPhonegate erhalten, auch wenn Martin primär auf iPad testet.
- [ ] Einen vollständigen neuen2026Kandidaten mit exakterQuelle nach gesichertem Code starten. Pushtrigger beachten; keine Produktcheckpointschleife, die mehrfach TestFlight auslöst.
- [ ] Alle Layout-/Signierungs-/AAC-Gates, Upload und Appleverarbeitung unterscheiden; tatsächliche Versions-/Buildnummer protokollieren. Nicht weiter Build1201 versprechen, falls neuerRun andereNummer erzeugt.
- [ ] Installation erst mit nachgewiesener2026Konfiguration und verfügbarem persönlichenBackend anweisen. GleicheSecureBundleID ersetzt installierteVersion; keine zweite unabhängigeApp behaupten.

### Paket8: Vollständigen persönlichen Prüfungsablauf abnehmen

- [ ] Lehrkraft normal anmelden, vorhandenen Test sehen und einer synthetischen Klasse zuweisen.
- [ ] SchülerA mit persönlichemCode anmelden, Testübersicht sehen, inSecure denselben zugewiesenenTest ohnefreiesKürzel wählen; SchülerB andererKlasse sieht ihn nicht.
- [ ]23/24warten-Fall nachstellen: fehlendenSchüler direkt filtern, dennoch bewusst starten, gemeinsamerServerzeitpunkt bleibt beiDoppelklick gleich. Aufgaben vorFreigabe nichtabrufbar.
- [ ] Nachzügler startet innerhalbRestzeit, nachFrist abgewiesen. Monitor unterscheidetStand/letztesSignal und reagiert aufeigeneVerbindungsstörung ehrlich.
- [ ] Bestehenden Versuch nach Appneustart fortsetzen; Hinweisbitte zustellen/bestätigen; getrennt Ersatzversuch einschließlichgeschütztemaltenStand und neuerGeneration aufechtemiPad prüfen.
- [ ] Offlineantworten sichern; lokalesAbschließen bleibt „Übertragung ausstehend“. Wiederonline genau eineServerabgabe/Receipt; SchülerErledigt undLehrkraftAbgabe gehören zurgleichenPerson/AttemptID. Doppelabgabe/Wiederöffnen erzeugtkeinenzweitenVersuch.
- [ ] Schulgerät abmelden/Personwechsel: keine vorige Schüleransicht zugänglich; ausstehende Prüfung bleibt geschützt. Privatgerätesitzung gemäßbestehender30TageRegel, Schulgerät5MinutenIdle/8Stundenabsolut; aktivePrüfungdurchLoginablaufnichtunterbrechen.
- [ ] ExakteQuelle/Testläufe/Hosting-/Functionsrevisionen/TestFlightbuild/physischeBelege inÜbergabe undpassenderRelease-Stufe sichern. Hauptquellen altenMockstatusnichtalsfertigenProduktnachweisfortschreiben. Production bleibtgetrennt.

## 5. Definition „jetzt testbar“ und Reihenfolge

**Erstes testbares Ergebnis:** funktionierendes2026Backend plus echteWebzuweisung/persönlicheTestliste;LehrkraftloginundBestandnachweislichintakt. Dafür Pakete1/2/6, einfachevorhandeneMonitorfunktion kannbereitsmitgeprüftwerden.

**Vollständiges Lieferziel:** außerdem verständlichePrüfungsbegleitung, sichereFortsetzungs-/ErsatzwegeundpersönlicheSecureabgabe gemäßPakete3/4/5/7/8. BestehenderGastcode-AbgabetestzähltweiterhinnichtalsNachweisdesneuenpersönlichenAblaufs.

**Genau nächster ausführbarer Schritt nach diesem Plan:** fehlgeschlageneCloudRunrevisionclassroomweb-00001-jir mitderfunktionierendenRuntime/Launcher-KonfigurationundihremexaktengebautenImagevergleichen; daraus eine überprüfbareStartursachenhypotheseableiten. KeinweitererDeployaufbloßenVerdacht. DanachkleinstenGatewayreparaturbeleg, bevorweitereFunctions/Hostingfolgen.

Plan selbst geprüft: Nutzeranforderungen sindPaketen1–8zugeordnet; fünfReviewfoki mitkonkretenNegativtests;bestehendeAPIs undneueVerträge getrennt;keineUmsetzungs-/DeploybehauptungausdiesemDokument. DieserPlanungsstandändertkeinenProduktcodeundstartetkeinenexternenBuild.
