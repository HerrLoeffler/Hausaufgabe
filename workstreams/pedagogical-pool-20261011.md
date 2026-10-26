# GC-PEDAGOGY-KB-01 Automatische Poolanbindung

Ausführender Fachchat, Chat-Link unbekannt. Eigener Branch feat/pedagogy-pool-20261011, Integrationsziel feature/gradecrew-app-integration. Basis 9363fe9842b502c4a2780bf007acef6881af6213. Die vorhandenen Plan-/Datensicherungs-PRs214/208 auf main bleiben separat; keine Änderungen an ihren Quellen.

## Nutzerauftrag

Bestehende gute Testgenerierung mit automatisch passenden geprüften Aufgabenprofilen nach Fach, Jahrgang und Schulart ergänzen. Neue Aufgaben eigenständig generieren, vorhandene Qualität und Anschaulichkeit erhalten. Keine Titel/Autoren/Ursprungsdateinamen im Wissenspool.

## Umsetzung

Serverseitiger Katalog mit 53 freigegebenen abstrakten Aufgabenprofilen, strikte Fach/Jahrgang/Schulart/Bundesland-Filter, Themenranking und Format-/Medienvertragsprüfung. Höchstens sechs Profile / 6.000 Zeichen. Nur verified + confirmed. Material-only und Ausgangstest begrenzen Inhalte unverändert. Ohne Treffer oder bei Katalogfehler keine Promptänderung. Einmalige Auswahl begleitet normale Erstellung, Ersatzaufgaben und Gesamtreparatur. Sichere Poolmetadaten an Response, Quiz, Auftrag und Nutzungsnachweis; keine Rohprofile oder Originale in Schülerdaten.

Startbestand: 26 Deutsch, 22 DaZ, 5 Mathematik, Mittelschule/Bayern/Jahrgang6 oder9. 35 geprüfte Hör-Aufgabengruppen,8 Deutsch-Textprofile,5 DaZ-Textprofile,5 Mathematik-Textprofile. Drei Hörgruppen mit Quellen-/Bewertungsproblem ausgeschlossen. Keine pauschale Freigabe der lokalen 3.669 generischen Kandidaten oder 125 Bücher.

## Nachweise

Selector-TDD: zunächst fehlende Auswahl nachgewiesen (5 reale Assertion-Fails), anschließend grün. Handler-TDD: fehlende Poolübermittlung/Metadaten und fehlender Reparaturkontext zunächst3 Assertion-Fails, anschließend grün. Zusatztest Schreibprofil vs ausschließlich number rot, danach grün. Functions-Gesamtsuite248/248 unter Node22.23.3 und Node24.19.0; Syntax und ESLint grün. Existierende Upload-/50-Aufgaben-/Bild-/Audio-Regressionen erhalten. Keine kostenpflichtigen Provideraufrufe; aktuelle Provider-Zugangsdaten weder gelesen noch geändert.

Aktueller Development-Status-Lauf38116109596/main@2b147d7bca4a507e4211f2045e4547fcd02bdcf4 erfolgreich gelesen, einschließlich branch-overlap-/PR-Audit. Offene PRs erneut geprüft: kein vorhandener Pool-Implementierungsbranch. PR186/191 betreffen Coco/Privacy, ihre Änderungen werden nicht übernommen. Lokaler Checkout eigenständig; anderer Arbeitscheckout mit uncommitteten Änderungen blieb unberührt.

## Scope und Assurance

SEC06/07: serverseitiger Katalog ohne Originale/Lösungsschlüssel; clientseitig nur technische Versions-/ID-Metadaten. SEC14/17: begrenzter untrusted Kontext, unveränderte Qualitäts-/Quota-Prüfungen. PRIV07/08/09: ausschließlich anonymisierte eigene Abstraktionen, keine neue Personendatenquelle oder externe Audio-/PDF-Übertragung. Keine neue Datenbank/Firestore-Regeln, UI, Zugangskonfiguration oder Deploymentfreigabe. Rechts-/Modellqualitäts-/Gerätefreigabe nicht aus lokalen Tests ableiten.

## Grenzen und nächster Schritt

Code lokal implementiert und geprüft; bisher branch_only, noch nicht in den App-Integrationsbranch übernommen und nicht live. Startbestand nur Mittelschule6/9; andere Kontexte nutzen weiterhin den bestehenden Generator. Lokale Verifikation unter Node22.23.3 und Node24.19.0. Unabhängiger Kandidatenreview durchgeführt; wichtiger Befund durch reproduzierbare Rot-Grün-Tests korrigiert. PR/CI folgen. Danach Integration gemäß bestehendem Releaseweg und beauftragter Staging-Abnahme; Production benötigt ausdrückliche Freigabe.

Angefordertes/laufendes Codex-Modell, Kosten und Usage sind nicht verlässlich beobachtet. Ursprüngliche Task-ID und Versuchshistorie erhalten. Kein zusätzlicher bezahlter API-Budgetbedarf für deterministische Poolauswahl.

## Unabhängige Prüfung und Korrektur

Fresh-context Sol/medium prüfte den unveränderlichen Kandidaten8b34c663070afddff2d924b320f340a3e92dc0e7. Ein wichtiger Befund: cleanInput ergänzt fehlende Schulart/Bundesland zu Mittelschule/Bayern; diese Standardwerte waren fälschlich als Pool-Zuordnungsbeleg nutzbar. Reproduzierbarer Handler-Test mit echter cleanInput-Funktion scheiterte bei fehlenden Werten (1 statt0Profile), ebenso bei leeren Strings. Fix: Generatorstandards erhalten, Poolkontext aber nur mit ausdrücklich vorhandenen nichtleeren Stringwerten auswählen. Fehlend/leere Stringfelder führen unverändertem Erstprompt und0Profilen zu. Lokale Gesamtsuite nach Fix247/247 grün; ESLint grün. Keine weiteren kritischen/wichtigen Befunde im Review. Modellqualität, unabhängige fachliche Herkunftsabnahme, Node22, Deployment und Rechtsfreigabe wurden vom Code-Reviewer nicht beurteilt; sie werden nicht als erfüllt dargestellt.

Angeforderter Reviewer Sol/medium gemäß Rollenleitlinie; tatsächliches Runtime-Modell/Usage/Kosten nicht beobachtet. Git-over-HTTPS-Push scheitert an fehlender Terminalanmeldung; vorhandener authentifizierter GitHub-Connector wird für dieselbe beauftragte Branch-/PR-Sicherung verwendet. Kein Versuch, Zugangsdaten zu lesen oder zu ändern.


## Endabnahme der lokalen Umsetzung

Der Kontextnachweis bleibt als serverseitig berechnetes pedagogicalContextKnown auch nach Normalisierung/Queue-Serialisierung erhalten. Legacy-Aufträge ohne Nachweis nutzen den alten Generator ohne Poolkontext. Zugehöriger Queue-/Normalisierungstest ebenfalls zuerst rot (1 statt0Profile), danach grün; Test bildet die reale Entfernen-undefined-Serialisierung nach. Endsuite248/248 unter Node22.23.3 und Node24.19.0, Syntax/ESLint/diff-check grün. Der Fix ist eine eigene Abnahme per Regressionstest, kein ungeprüfter bloßer Kommentar und keine wiederholte Vollreviewrunde.


## Gesicherter Release-Stand

PR218 https://github.com/HerrLoeffler/Hausaufgabe/pull/218, Remote-Commit64d78d19fd48b50b440adf829c26de5e85c5dc4f. Code-Tree0a4a2fc1984ff451cf87568adf8dbd5c9cc17378 entspricht vollständig lokal geprüftem Commit29bbf5ab3ff6afe06f96d3a289164738d29f80aa. GitHub-Run38137059508 / Job114462982465 erfolgreich: Functions-Gesamtsuite, Lint und vorhandene BugOps-Regeltests. Stufe ci_green; noch nicht integriert oder deployed. Modellqualitätsverbesserung und Geräte-/Nutzerabnahme bleiben unbelegt. Zielbranch bleibt feature/gradecrew-app-integration. Originaldateien und Audio-/Transkriptarchive werden nicht öffentlich hochgeladen.


## Stagingauftrag18.10.2026 – Integrationscheckpoint

Martin beauftragt die Aktivierung auf hausaufgabe-staging.web.app. Development Status39142552587 frisch gelesen: Pool1ahead/19behind, Überlappungen nur functions/index.js und generation-flow.test.js. Aktueller App-Stand2e718ae44519fc22a7c64ad354b62dd26a6999ca in Pool zusammengeführt, Variantenvertrag erhalten. Kandidat0ed9d3c0791a6fa0a5322c837134f8a86c7737d7 mit Tree66fd1cfcd3dc9f5e24e8c46b982f05745d9ed3e9 bytegleich lokal911d5fb. 281/281Functions Node22, ESLint und31/31AI-Webregressionen grün. Zwei unveränderte Assets im Sparsecheckout nachgeladen, kein Produktfehler. Kandidaten-CI39156614592 läuft. Nächster Schritt: nach bestätigter CI PR218 in Appbranch, exakte integrierte CI und Stagingfunctions-/Hostingreceipts prüfen; kanonischen Deploy beauftragen. Production nicht beauftragt. AngefordertSol/medium für Integration; Runtime/Usageunbekannt. SEC06/07/14/17 undPRIV07/08/09 unveränderter begrenzter Poolscope; eigene Abstraktionen ohne Originalassets und Secrets. Ursprüngliche Task/Budgethistorie erhalten.


### Integration gesichert

PR218 mit erwarteter Kopf-SHA0ed9d3c und unverändertem Ziel2e718ae erfolgreich gemergt: a425605b9bf8e3c6ae94666b0ae0d8bbba24e14d. Kandidaten-CI39156614592/Job117761050244 success (Functions+Lint+BugOpsRules). Integrierte CI39156701861 läuft. Stufe integrated, noch kein Deploymentnachweis. Beauftragtes Deployziel hausaufgabe-staging, exakter Commit a425605b9bf8e3c6ae94666b0ae0d8bbba24e14d. Automatik deployt bestehende AI/Assessment-Codebases und Preview nach CI; danach kanonische Promotion desselben Builds. Kein Rules-/Productiondeploy.

### Gezielte Wiederaufnahme nach Functions-Abbruch18.10.2026

Integrierte CI39156701861 success. Preview39156854960/Receipt12147635892 mit SHA-25697fd3abeef69e586865cce913e397c2213b5241d6ae1cc0db1829b3d56a86b88 geprüft: Commita425605b,165Dateien. Kanonischer Auftrag8ad6b056/Run39157249364 läuft. Breiter AI-Deploy39156854952/Job117761775327 brach vor Updates sicher ab, weil12separat vorhandene Lernfunktionen nicht im App-Code stehen. Nicht löschen, kein --force, kein blinder Rerun. Bestehender Workflow erhält ausschließlich manuellen Recoveryweg für generateTest/startAiTestJob/processAiTestJob mit exakter grüner integrierter CI und aktuellem App-SHA. Assessment wird dabei ausgelassen, WIF/Secrets/Productiongrenze unverändert. Drei Regressionen zuerst rot, danach117/117Automationsprüfungen grün mit Node22 im PATH; erster Gesamtlauf hatte2umgebungsbedingte Fehler ohne Node. Unabhängiger Sol/medium-Reviewer: keine kritischen/wichtigen Befunde; textbasierte Tests ersetzen keinen echten Workflowlauf. Der enge manuelle Receipt wird separat qualifiziert und schließt den Guardian-Vollscope-Ledger nicht automatisch. Angefordertes/beobachtetes Modell getrennt; tatsächliche Runtime/Usage unbekannt.

Kanonischer Run39157249364 brach vor Auth/Deploy ab: neuer vollständig übersprungener Workflow39157258994 wurde als neuerer Previewversuch gewertet. Reproduzierbare Regression bestätigte exakt dieselbe ValueError. Minimale Korrektur lässt nur completed+skipped-Ereignisse aus, während neue Fehler/Abbrüche/laufende Versuche weiterhin sperren. Neue Regressionen für alle Fälle;119/119Automationsprüfungen grün. Separate unabhängige Prüfung nur dieser neuen beiden Dateien ohne kritische/wichtige Befunde. Kanonischen fehlgeschlagenen Job erst nach Integration des Fixes mit aktuellem Main-Controlstand erneut starten (kein Rerun des alten unveränderten Controls).


## Technischer Stagingabschluss18.10.2026

Stufe staging_deployed für die beauftragte Poolanbindung. Code a425605b9bf8e3c6ae94666b0ae0d8bbba24e14d, PR218. Kandidaten-CI39156614592 und integrierte CI39156701861/Job117761306287 success. Reparatur PR241 mit finalem Kopf0cb50f8b, CI39157563820 und frischem DevelopmentStatus39157563818 success; Mergec23dbf494cd267f1254cf73a762d0a557187f8ac. Unprivileged Guardian-Rehearsal ist kein Deploy-/Reviewnachweis und wurde hierfür nicht als Freigabe benutzt.

Gezielter manueller Functions-Run39157680713/Job117764216205 erfolgreich: generateTest,startAiTestJob,processAiTestJob in europe-west1 jeweils ausdrücklich mit Successful update operation im Firebase-Log. Vollständiger Run erfolgreich, Assessment dabei übersprungen. Receipt12147672441 (ZIP SHA256efb53e9a2b838c326b8759c1b87826f327a4e939111ef5562d8b459631162246) heruntergeladen und Commit/Scope/UpstreamCI39156701861/Run geprüft. Kein pauschaler functions:ai-Vollscope- oder Guardian-Ledgerabschluss. Die zwölf vorhandenen Lernfunktionen bleiben erhalten; ursprünglicher Vollversuch39156854952 wurde nicht erzwungen oder wiederholt. Assessment war im ersten Lauf erfolgreich, Receipt12147322047.

Preview39156854960/Receipt12147635892 und kanonischer Wiederaufnahmerun39157702689/Job117764283877 erfolgreich. Canonicalreceipt12147303541 (ZIP SHA256da046448e90d0b7ff19f697575173ac27591c1b6a2de307a568ea0e92428afb8) geprüft: a425605b,165Dateien, Sourcepreview39156854960, UpstreamCI39156701861, Version sites/hausaufgabe-staging/versions/750871bd0b65ae48, vorherige Version c3ef385208a0ca40 als bewusster Rollbacknachweis. https://hausaufgabe-staging.web.app/release.json frisch via GradeCrew Central gelesen und App-Startschirm im Browser geladen. Keine Rules-/Productionänderung.

Aktueller Startbestand bleibt53geprüfte eigene anonyme Aufgabenprofile für Deutsch/DaZ/Mathematik, Mittelschule Bayern6/9. Außerhalb passender Themen/Typen unveränderte Generierung ohne Pool. Lehrkraftmaterial-only und Ausgangstest/Varianten werden nicht mit Pool ergänzt. Technische Prüfungen281Functions+31Web+121Automation, darunter tatsächliche Bash-/Receipt-Ausführung mit kontrollierter CLI; unsicherer Vollscope-Mutationsversuch wurde vom Verhaltenstest zurückgewiesen. Weitere fachliche Qualitätserhöhung oder vollständige Medienabdeckung werden daraus nicht abgeleitet. Keine kostenpflichtige Live-Testgenerierung und kein physischer Geräte-/Nutzertest durchgeführt. Nächster Schritt: Martin erzeugt passenden Test und prüft Entwurf, Qualität und sichere pedagogicalPool-Metadaten. Production ausdrücklich nicht beauftragt. Ursprüngliche Task-ID/Versuche/Budgethistorie erhalten; tatsächliches Modell/Usage unbekannt.

## Wilma-Zusatzrelease26.10.2026 — getrenntes Staging2026, Sourceintegration OFFEN

Dieser Zusatz gehört zu GC-PEDAGOGY-KB-01 und ändert nicht den oben belegten Poolrelease. Autor/Sourceowner: GC · Pädagogisches Konzept, Thread01a1280a-c9f4-73a3-a12a-7b2b93a5ba5a. Direkte Humananweisung26.10. tatsächlich gelesen: dauerhafte Punkte auf Staging2026 einbauen und synthetisch prüfen; gradecrew.de unverändert, **keine Source-Commits oder PR-Änderungen**. Die aktuelle Zuweisung an GC · Automatisierung & Integration autorisiert ausschließlich diesen getrennten Dokumentationscheckpoint, keine Autorenquellen-/Cloudänderung.

### Belege und Reichweite

- Einstieg: https://gradecrew-staging-2026.web.app/wilma/?intent=login. Ziel ausschließlich gradecrew-staging-2026; vorhandene Funktion reviewWilmaAnswers mit Einzelentscheidungen ergänzt. Keine Rules-/IAM-/Livefreigabe daraus.
- Lokale Autorenbelege lesend geprüft: artifacts/wilma-save-staging2026-20261026/{HANDOFF.md,RECEIPT.json,fixed-status.json,hosting-release-restored.json,hosting-verification-restored.json,source-manifest.json} unter /Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/. Kein Token, private Bewertung oder Vollchat exportiert.
- Finales Backend: operation-1793048286933-65ec4963531dd-e22d32db-b01ca3ec; gespeicherter Status done=true, error=null; Build3cd644da-a27e-43f5-b0d7-db27337a0e03. Finales fixed-source.zip eigenständig gehasht: SHA256f0de923aa050b0e33447222dd4a581f9c80eb48db6ba79701976b5c08240c9ee. Ältere backend-source.sha256/c8d654d… gehört zum Vorversuch, nicht zum finalen Fix.
- Hosting laut gespeichertem Releasebeleg: sites/gradecrew-staging-2026/versions/8430a3d2a7808bdf, neue Baseline74c9971f6980c9df;192Wilma-Dateien einschließlich wilma-release.json. Autorenverifikation:219übrigeDateihashes erhalten,191Runtime-/Begleitdateien bytegleich,0Abweichungen. source-manifest.json zählt191Frontend-/11Backendquellen. Keine frische unabhängige Cloud-/Remote-Dateiinventur durch diesen Dokumentationswriter.
- Autor meldet44gezielte Tests, synthetisches Read/Write/Undo/Reload und401/403/409/400-Negativfälle bestanden,0zusätzliche KIaufrufe (Zähler2/Cap7 erhalten). Kein eigener Retest oder unabhängiger Vollabnahmeclaim. Undo-Knopf nur in aktueller Sitzung; nach Reload nicht wiederhergestellt. Physischer iPad-/Unterrichtstest offen.

### OFFEN: source uncommitted / nicht zentral gebaut
Kein Source-Commit/Push/PR für diesen Wilma-Stand. Alter lokaler Checkout artifacts/antworten-pruefen-integriert auf Branch fix/wilma-answer-review-local-20261022, laut Autorenhandoff Basis750212e7a38df4d0bbce833d2ae46b3f8f8b2b68. Aktuell lesend bestätigt: app.js/index.html dirty und lokale Wilma-Dateien untracked. Finaler Speicherdienst/Frontend liegen im separaten Autorenartefaktordner; synced sources/ laut Autor unverändert. Es fehlen reproduzierbarer Source-/CI-/Integrations- und zentraler Buildassemblybeleg. Die fortgeltende Humanvorgabe verbietet derzeit den Source-Commit/PR; dieser Dokumentationseintrag hebt sie nicht auf.

### Gate für künftige kanonische Full-Hostingdeploys2026
Der vorherige Wilma-Release600d4d58d5f81cf1 wurde laut Autorenbeleg durch einen parallelen Rootdeploy entfernt (Reload404), anschließend auf neuer Baseline wieder ergänzt. Vor JEDEM vollständigen kanonischen Hostingdeploy nach gradecrew-staging-2026 die dann aktuelle Remote-Dateiliste/Hashes mit dem Kandidaten abgleichen und /wilma/ samt wilma-release.json bewusst im Zielbuild erhalten. Kein alter Rootsnapshot/Rollback auf600d… und keine ungeprüfte Übernahme von Remotebytes als Maincode. Bei fehlender Wilma-Assembly betroffenen2026Fullrelease klein mit Source-/Releaseowner abstimmen. Isolierte Previewkanäle sind getrennt; gradecrew.de-Auth-/Homepagereleases werden dadurch nicht pauschal blockiert. Keine Kopie der gesamten2026Site auf gradecrew.de und kein Wilma-Liverollout aus diesem Hinweis. Private Firestorebewertungen sind unabhängig von Hosting;403-, Versions- und Freigabegates bleiben erhalten.

### Dokumentationscheckpoint und nächste Übergabe
Eigener Checkout /Users/martin/Documents/Codex/2026-10-04/weiter-mit-gradecrew-nach-einem-chat/work/wilma-release-status-20261026, Branch docs/wilma-release-assembly-gap-20261026 ab main d356f7b235d18b4cbb82f8acb52c301595be5f9c. START/AGENTS/CHAT_CONTRACT/STATE/TODO/Registry gelesen; DevelopmentStatus40400800364/121845791876 success samt relevanten Logs. PR214/208 überlappen TODO in anderen Medien-/Lehrplanhunks; diese bleiben erhalten. Nur dieses HDF und der vorhandene TODO-Eintrag betroffen; kein STATE-Stufenwechsel oder zweiter Sourcewriter.
Nächster Schritt: Sourceowner und Zentrale klären die ausdrücklich nötige Freigabe zur prüfbaren Sicherung der finalen Autorenquellen; danach eigener Review/CI und reproduzierbare Wilma-Buildassembly vor betroffenem kanonischem2026Fulldeploy. Bis dahin offene Integrationslücke, kein Betrieb auf manuellen Cloudpatches als dauerhafte Lösung. Keine Sourceänderungen, Tests, neuen Versuche oder Deploys durch diesen Dokumentationsschritt.
