# Band 09 - Umsetzungspakete, Dateien und Abhängigkeiten

## 9.1 Ausführungsgrundsatz

Die folgenden Pakete sind eine konkrete Zerlegung von GC-BRAIN-01. Sie werden von bestehenden zuständigen Fachchats in eigenen sicheren Checkouts ausgeführt. Die Zentrale koordiniert, prüft Quellen, beauftragt und bewertet Ergebnisse. Sie führt keine Shell-, Produkt- oder Testarbeit selbst aus.

Genau ein bestätigter Writer besitzt server.mjs, src/store und gemeinsame API-/Migrationspfade. Design arbeitet nach Portfreeze an freigegebenen UIpfaden. Reviewer lesen einen eingefrorenen Kandidaten. Neue Details dieses Gesamtplans erhalten eine gezielte Vertragsprüfung; der frühere PASS auf 7342609 wird nicht auf ungeprüfte neue Festlegungen ausgedehnt.

P0 auf der akzeptierten Quelle und die lesende Inventur können parallel zu einer isolierten Dokumentationskonfliktlösung erfolgen, soweit keine gemeinsamen Schreibpfade betroffen sind. Der Konflikt in PR269 ist ein Integrationsproblem der Planung, kein Grund, bereits erlaubte sichere P0-Vorbereitung blind zu wiederholen oder pauschal anzuhalten.

## 9.2 Vorgeschlagene Modulstruktur

Bestehende Basis bleibt prototypes/gradecrew-control-local auf dem bestätigten Control-/Aufgabenbranch. Vorhandene äquivalente Module werden weiterverwendet. Die nachfolgenden Pfade sind Zielpfade; sie sind nicht als heute vorhandene Produktdateien zu verstehen.

~~~text
server.mjs                     HTTP-Einstieg, Authkontext, schmale Routen
agent.mjs                      begrenzter Diagnose-/Operatorclient
src/store/                     Transaktionen, Migrationen, Repositories
src/domain/                    Validierung, IDs, Revisionen, Zustandsregeln
src/goals/                     Zielgraph, Kriterien, Fortschritt
src/requests/                  Message, Request, Briefsnapshot, Outbox
src/knowledge/                 Konzepte, Fakten, Quellabdeckung, Retrieval
src/routing/                   Rollen, Routen, Scopeclaim, Koordination
src/executions/                Zulassung, Runtimeadapter, PendingRequests
src/evidence/                  Artefakte, Review, Ergebnisannahme
src/sources/                   GitHub-/State-/bestehende Readeradapter
src/projections/               Heute, Bereich, Ziel, Chefbriefgrundlage
src/automations/               Definitionen, dedup Runs, sichere Trigger
src/recovery/                  Journalabgleich, Sperre, Restore
src/policy/                    Zugriff, Grants, Budgets, Rollenprofile
src/ui/views/                  fachliche Ansichten
src/ui/components/             gemeinsame zugängliche Komponenten
src/ui/standalone.mjs          Einstieg bestehende lokale App
src/ui/mcp-app.mjs             Einstieg eingebettete Firmenansicht
plugin/mcp.mjs                 begrenzte Toolregistrierung, keine Fachlogik
plugin/bridge.mjs              unterstützte Hostkommunikation
plugin/dist/                   gebauter, gehashter UIbundle
public/                        gebaute Standaloneassets
test/                          Vertrags-, Domain-, Adapter-/Ablauftests
diagnostics/gc-brain-p0/        isolierte P0-Proben und Receipts
~~~

Der jetzige MCP-Ressourcenbuilder fügt Scripts direkt in HTML ein. Neue Modulimports funktionieren dadurch nicht automatisch im Host. Vorschlag: gemeinsamer UIquellbestand mit kleinem gepinntem Buildschritt und zwei dünnen Einstiegen. Das Paket muss beide Ausgaben tatsächlich bauen, mit Manifest/Hashes verbinden und im Host prüfen. Es genügt nicht, nur neue source-Dateien anzulegen.

Die konkrete Build-/DB-Abhängigkeit wird im zuständigen Paket nach verfügbarer Laufzeit und aktueller Projektpolicy fixiert. Lockfile, reproduzierbarer Build und Runtimeversion sind Teil des Ergebnisses. In dieser Planungsarbeit wird keine Produktabhängigkeit installiert.

## 9.3 Paketkatalog

### FZ-WP00 - Baseline und Quellenabgleich

Voraussetzung: aktuelles START_HERE, AGENTS, STATE, TODO, Registry und Development Status. Owner: zugewiesener Integrationsfachchat.

Arbeit: main, PR269, Remote-Control 7ccf74ce, lokales Control b44189be, installierte MCP0.5.0 und Design-V3 inventarisieren. Versionen/Diffs, fremde untracked Dateien, laufende/unklare Vorgänge und tatsächliche Writergrenzen dokumentieren. Keine vorhandene Installation ersetzen.

Ergebnis: BASELINE.md mit Quelle, Commit/Hash, Rolle, bekannten Differenzen, erlaubtem nächsten Schritt und Ausschlüssen. Akzeptanz: alle bekannten Codebestände sind erklärt; keine versehentliche zweite aktive App; privates Profil und Datenordner bleiben außerhalb des Quellcommits.

### FZ-WP01 - Dokumentationskonflikt PR269

Voraussetzung: eigener Dokumentationswriter durch Zentrale. Betroffene Pfade: die sechs vorhandenen Plan-/Übergabe-/Registrydateien in PR269.

Arbeit: aktuellen main in eigenem Branch bewusst abgleichen; fremde TODO-/Registrydaten erhalten; akzeptierte Planquelle historisch lassen; neue Gesamtplanung als separate Fassung verlinken statt alte Reviews umzudeklarieren. Source-/Targetdiff und Mergekonflikte konkret lösen.

Akzeptanz: nur vereinbarter Dokumentationsscope; aktuelle handoff-/Developmentchecks erfolgreich; keine STATE-/Produkt-/Deploybehauptung aus Dokumentintegration. Integration selbst erst nach normaler Freigabe.

### FZ-WP02 - Themen-/Quelleninventur

Voraussetzung: bestätigte Lesescopezuweisung. Owner: konkret benannter Quelleninventarfachowner, bei Bedarf abgestimmte Teilbeiträge.

Arbeit: Charge vier Themen vervollständigen, dann neun Bereichsbestände anhand erreichbarer Quellen prüfen. Kandidaten, Original-IDs, Quellabdeckung und Konflikte speichern. Externe Fachchats nicht allein aufgrund eines ähnlichen Namens zuordnen.

Artefakte: sources-observations, topic-candidates und Abdeckungstabelle nach Band 05. Akzeptanz: jede veröffentlichte Aussage ist rückverfolgbar; unzugängliche Turns sichtbar; aktuelle Code-/Releasebelege von Chatbehauptungen getrennt; keine privaten Vollkopien.

### FZ-WP03 - P0-Hostcapabilities

Voraussetzung: WP00; erlaubter isolierter P0-Scope. Owner: GC · Automatisierung & Integration.

Dateien: ausschließlich diagnostics/gc-brain-p0 und eigene Diagnoseübergabe. Arbeit: tatsächliche eingebettete MCP-App/Hostkommunikation feststellen; verfügbare Tools, UIinitialisierung, Anfrageübergabe und Grenzen prüfen. Kein neuer Login, kein fremder Chatresume, keine Produktstoremigration.

Ergebnis: CapabilityManifest mit Host-/Protokollversion, unterstützten Ports und positiven/negativen Beobachtungen. Akzeptanz: vorgetäuschte Previewstubs werden erkannt; tatsächliche Hostnachricht von Fachstart getrennt.

### FZ-WP04 - P0 vertikaler Durchstich

Voraussetzung: WP03 und für exakt diesen Test gültiger Grant; vorhandene Grenze ein Worker/höchstens zwei Modellturns, synthetische Daten, keine zusätzlichen APIprovider.

Arbeit: den Ablauf aus Band 06 mit kleinem isoliertem Request-/Rückkanaladapter nachweisen: speichern, Zentrale, Fachstart, enges Tool, Artefakt, Rückfrage/Fortsetzung, Neustart/Reattach, negative Koordinator-/Workerscopes.

Ergebnis: unveränderlicher P0_EXIT_RECEIPT mit IDs, Hashes, Events, Attempt-/Budgetgeschichte, beobachteter Usage oder unknown. Akzeptanz: keine offenen Pflichtports. Bei fehlender Fähigkeit bleibt OPEN mit konkretem Befund, kein zweiter unsicherer Start.

### FZ-WP05 - Runtimeentscheidung und Gate

Voraussetzung: WP04 oder klar belegte Nichtmachbarkeit des Hostpfads. Owner: Zentrale koordiniert unabhängige Reviewentscheidung.

Arbeit: Receipt gegen D3 prüfen. Bei PASS genau qualifizierten Host-/Scopevertrag freigeben. Bei Nichtmachbarkeit nur den konkreten fehlenden Port und passende Alternativen mit gleichen Kriterien vorlegen. Keine unbegründete komplette Neuarchitektur.

Ergebnis: P0_GATE_DECISION mit Quellreceipt, Entscheidung, Grenzen und erlaubten Folgepaketen. Akzeptanz: P1/P2 sind nur nach echtem PASS offen; menschliche Richtungs-/Kostenentscheidung bei notwendigem neuen Weg separat.

### FZ-WP06 - Store, Identitäten und Migration

Voraussetzung: WP05 PASS; genau ein gemeinsamer Store/APIwriter bestätigt. Pfade: src/store, src/domain, schmale server.mjs-Anpassung.

Arbeit: Transaktionsadapter, Organisation/Actor, Revision, Idempotenz, Eventlog und Migrationsframework. Bisherige JSONdaten in separaten Teststore importieren, Original-IDs erhalten. Treiber-/Laufzeitwahl mit reproduzierbarer Versionsbindung sichern.

Tests: atomarer Fehlerrollback; gleicher Key/gleiche Payload identisch; gleicher Key/andere Payload Konflikt; zwei Writerclaimversuche; Import zweimal ohne Duplikate; Neustart; beschädigte Quelle nicht überschrieben. Ergebnis: Schema-/Migrationsmanifest und belegter Rollback.

### FZ-WP07 - Ziele und Fortschritt

Voraussetzung: WP06. Pfade: src/goals und zugehörige Repositories/Tests.

Arbeit: Goalrevision, Kriterien, Milestones, TaskContribution, aggregierende und nicht aggregierende Kanten. D2-Berechnung und Invalidierung implementieren.

Tests: 50/0 ergibt25; Nullbasis; ungültige Gewichte; Zyklen; Doppelzählung; Belegentzug; Scopewechsel; Rundung/Pflichtgate; gleiche Projektion in Ziel/Heute. Ergebnis: ein nachvollziehbares echtes Ziel mit Restarbeit und reproduzierbarer Fortschrittsbasis.

### FZ-WP08 - Quellenadapter und Beobachtungen

Voraussetzung: WP06, begrenzte Readerberechtigungen. Pfade: src/sources und vorhandene plugin/project-reader-Funktionen.

Arbeit: vorhandene GitHub-/State-/Release-Reader weiterverwenden. SourceObservation, Pagination, Frische, ETag/Commitbindung und Fehlerstatus hinzufügen. Keine privaten Datenfeeds ohne passende Verbindung.

Tests: mehrseitiger Bestand; fehlende Seite als unvollständig; Authfehler; staleCache; widersprüchliche Umgebungsbindung; Sourceversionwechsel während Abfrage. Ergebnis: Übersicht mit tatsächlichem Quellalter und Abdeckung.

### FZ-WP09 - Wissenskern und Briefbuilder

Voraussetzung: WP06/08; bestätigtes Quelleninventar soweit benötigt. Pfade: src/knowledge und Briefsnapshotrepository.

Arbeit: Conceptrevisionen, Decisions, KnowledgeEntries, Retrieval nach ACL, Konfliktstatus und unveränderlicher Brief. V1 strukturierte Suche/FTS; keine unnötige zusätzliche semantische Plattform.

Tests: gültiger Kontext in neuem Auftrag; superseded/rejected ausgeschlossen; vertrauliche Finanzquelle im Gamesbrief unsichtbar; unzugänglicher Chat als Lücke; Quellwiderruf invalidiert Suche und neue Briefs. Ergebnis: quellengebundener WorkBrief samt Abdeckungsmanifest.

### FZ-WP10 - Nachrichten und Requesttransaktion

Voraussetzung: WP06/09. Pfade: src/requests, Message-/Conversationrepository und Outbox.

Arbeit: SubmitRequest atomar speichern, actor-/scopegebundene Idempotenz, Statusachsen, ResultEnvelope und ReadRequest. Nachricht ist eigenständiges Produktobjekt; UIstate ist keine Persistenz.

Tests: Speichern scheitert im letzten Transaktionsschritt; kein halber Outboxeintrag; Doppelklick; Reload; zweiter Tab; fremde Request-ID; große/ungültige Texte; fehlende Berechtigung. Ergebnis: dauerhaft gespeicherter Auftrag mit eindeutigem bestätigtem Storestatus.

### FZ-WP11 - Rollenrouting und Scopeclaim

Voraussetzung: WP10/05. Pfade: src/routing und Role-/RouteBinding.

Arbeit: Hauptzentrale als Eingang, vorhandene Gameshierarchie, Weiterleitung aus nichtzentralem Host, Capabilityprüfung, exklusiver Dateiscope und CoordinatorEpoch. Keine neue Chatfamilie.

Tests: falscher Titel/Host; abgelaufene Route; bereits laufender Scope; Rollenwechsel während Queue; Nichtzentralenhost ohne Weiterleitungsfähigkeit; zwei Koordinatoren claimen gleichzeitig. Ergebnis: bestätigte Zuständigkeit oder konkrete Zuordnungslücke.

### FZ-WP12 - Ausführungszulassung und Runtimeadapter

Voraussetzung: WP11, WP07/09; P0-adaptergenaues Manifest. Pfade: src/executions und src/policy.

Arbeit: admitDispatch mit D1-Revisionsset, Startintent, Versuch-/Budgetreservierung und realem Remote-Startreceipt. Adapter nach Band 06, keine weitere Runtime parallel ohne Entscheidung.

Tests: Taskrevision gleich, Goal/Konzept geändert; ACLentzug; doppeltes Event; verlorener ACK; veralteter Leasewriter; unsupportedCapability; Quota-/Authfehler ohne Modellupgrade. Ergebnis: tatsächlicher Fachstart mit zulässigen Tools oder sauberer Blocker.

### FZ-WP13 - Rückfragen, Approvals und Abbruch

Voraussetzung: WP12. Pfade: pending-requests, Approvalservice und Adapterantworten.

Arbeit: echte Runtimefragen an Produktakte binden, Antwort/Approval atomar auflösen und denselben Vorgang fortsetzen. Abbruchwunsch und bestätigten Stop trennen.

Tests: alte/fremde/abgelaufene Approval; geänderte Aktionsargumente; Doppelklick; Neustart bei PendingQuestion; Rollenwiderruf vor Antwort; Abbruch mit unbekanntem Remotezustand. Ergebnis: belegte gebundene Fortsetzung, keine neue Ersatzexecution.

### FZ-WP14 - Artefakte, Review und Annahme

Voraussetzung: WP12/13/07. Pfade: src/evidence und Artefaktstore.

Arbeit: Artefakt prüfen, Hash/Scope binden, Reviewerauftrag erstellen, Befunde speichern und acceptResult per CAS. Eine erfolgreiche Execution bleibt vor Annahme „zur Prüfung“.

Tests: anderer Artefakthash; unzulässiger Pfad/Symlink; neues Ziel nach altem Ergebnis; fachlich abgelehntes Ergebnis; Reviewer nicht unabhängig; neue Revision nach alter Freigabe. Ergebnis: angenommenes Kriterium mit Herkunft, kein selbstgemeldetes success.

### FZ-WP15 - Gemeinsame UIbausteine und Build

Voraussetzung: WP10-Verträge und bestätigter Portfreeze; Designscope explizit reserviert. Pfade: src/ui, public-/plugin-Buildausgabe.

Arbeit: gemeinsamer UIquellbestand, zwei dünne Host-/Standaloneeinstiege, sichere Texte, Zustands-/Fehlerkomponenten, reproduzierbare Bundle-/Manifestbindung. Vorhandene V3-Probe als Gestaltungseingang, nicht unverändert als Backendclient ausgeben.

Tests: beide Bundles aus gleichen Quellen; keine toten/ungebündelten Module; fehlender Host; CSP-/Bridgelimit; Textinjektion; Import-/Dateimanifest. Ergebnis: tatsächlich ausgeliefertes UI mit überprüfbarer Quellbindung.

### FZ-WP16 - Verbundene Arbeitsansichten

Voraussetzung: WP15 und benötigte Daten-/Runtimeports. Pfade: ausschließlich vereinbarte src/ui/views und lokale Styles.

Arbeit: S01-S12 stufenweise an denselben Store anschließen; S13-S15 folgen den zusätzlichen Paketen WP23-27 und ihrer Lieferstufe. Auftrag ohne Chatwahl, Themenakte, Fragen, Ziele, Quellen und Chefbrief. Beispielmodus klar getrennt, keine Musterabnahmeknöpfe bei echten Themen.

Tests: desktop/ipad/mobile, Tastatur/Fokus, Bildschirmleser-Basics, lange Texte, Offline/Reload, zwei Tabs und widerspruchsfreie Statusprojektion. Ergebnis: Martins konkreter Produktdurchlauf am verbundenen Kandidaten.

### FZ-WP17 - Sichere Beobachtungsautomationen

Voraussetzung: WP08/10 und beobachtender Runvertrag. Pfade: src/automations und Notificationservice.

Arbeit: AUT01/03/04/06 als lesende beziehungsweise interne Projektionsprozesse beginnen. Scheduleranbindung nur bei konkretem Auftrag; keine automatische Anbieteraktivierung.

Tests: duplicateEvent, verpasster Slot, Zeitzonenwechsel, Authausfall, Cooldown, Kettenschleife, keine Benachrichtigung ohne Änderung, tatsächlicher Zustellbeleg. Ergebnis: ein begrenzter, einzeln bestätigter Prozess statt pauschalem Autopiloten.

### FZ-WP18 - BugOps-/Guardian-/Analyticsintegration

Voraussetzung: jeweiliger vorhandener Fachvertrag, Daten-/Zweckfreigabe, aktueller Aktivierungsnachweis.

Arbeit: vorhandene Incidents und zulässige Aggregatdaten lesen; keine zweite Aggregation. Zulässige Guardianaufträge vorbereiten und nur über bestehende exakte admission-/Budget-/CI-/Reviewgates ausführen. Bestehende Analyticsowner behalten ihren Scope.

Tests: fehlender Zweck/Opt-in; falsche Umgebung; untrusted Bericht; rote Risikoklasse; staleSHA; neue Datei nicht im Build; unbekannter Providerstatus. Ergebnis: begrenzte Integration mit ehrlichen Grenzen, kein allgemeines Kundenautofix-Versprechen.

### FZ-WP19 - Recovery und Datenwiderruf

Voraussetzung: WP12-14; P4-Reviewer konkret zugeordnet. Pfade: src/recovery, backup, Journaladapter und Löschpipeline.

Arbeit: D4-Epochsperre, unabhängig erhaltene Journal-/Headprüfung oder belegte manuelle Reconciliation, Tombstones vor Anzeige, konservative Reservierungen und gezielte Freigabe.

Tests: Backup queued/attempt0; danach wirklicher Abschluss/Verbrauch/Löschung/Widerruf; altes Backup restaurieren; keine Wiederbelebung/Neustarts. Fehlendes oder mitgerolltes Journal bleibt gesperrt. Ergebnis: vollständiger isolierter Restorebeleg.

### FZ-WP20 - Anlassbezogene Assurance

Voraussetzung: betroffene Produkt-/Daten-/Runtimeprofile eingefroren. Owner: bestehende passende Sicherheits-/Datenschutzrollen, unabhängiger Review.

Arbeit: relevante SEC-/PRIVkontrollen mit Scope, Owner und Evidenz führen. Auth-/ACL-/Toolgrenzen, Eingabedaten, Artefaktzugriff, Löschung, Journal und Kostenstop prüfen. Keine pauschale Vollprüfung aller Katalogeinträge pro Kleinänderung.

Akzeptanz: kritische konkrete Befunde geschlossen oder Scope gesperrt; offene nicht relevante Kontrollen nicht als Vollblockade benutzt; Grenzen sichtbar. Ergebnis ist konkrete Prüfakte, kein generelles Sicherheits-/Rechtszertifikat.

### FZ-WP21 - V1-Ende-zu-Ende-Abnahme

Voraussetzung: WP07-16,19,20; passende aktuelle CI-/Reviewbelege. Arbeit: alle für den konkret vereinbarten Lieferumfang erforderlichen Fälle aus Band 10 gegen echten Kandidaten durchgehen, danach Martins Produktdurchlauf. AT01-48 bilden den bisherigen Kern; AT49-72 qualifizieren die ausdrücklich aufgenommenen Erweiterungen. Noch nicht gelieferte Erweiterungen bleiben NOT_RUN und verhindern die Behauptung des vollständigen Gesamtprodukts, nicht die klar bezeichnete Abnahme einer engeren Teillieferung.

Ergebnis: V1_ACCEPTANCE mit Quell-/Buildhash, Host-/Datenprofil, Fallresultaten, echten Run-/Artefakt-/Reviewbelegen und menschlichem Urteil. Ein Mockpass schließt keine reale Hostfähigkeit. Jeder Gatefehler bleibt Task mit Owner und nächstem Schritt.

### FZ-WP22 - Betriebsübergabe und begrenzte Nutzung

Voraussetzung: WP21 bestanden, konkrete Betriebsumgebung und Pilotgrenzen freigegeben. Arbeit: Installations-/Daten-/Backup-/Routingmanifest, Runbooks, Kosten-/Versuchsstatus, Notstopp und verantwortlichen Operator übergeben.

Ergebnis: ein Nutzer kann einen Request nach Neustart finden, eine offene Entscheidung beantworten und einen belegten nächsten Schritt sehen. Production des Schulprodukts bleibt separat. Cloud-/Team-/Finanz-/Kundenschreibfunktionen werden nur über eigene spätere Profile ergänzt.

## 9.4 Kritischer Pfad und erlaubte Parallelität

Kritischer Pfad: WP00 → WP03 → WP04 → WP05 → WP06 → WP09/10 → WP11/12 → WP13/14 → WP16 → WP19/20 → WP21/22. WP07 und WP08 ergänzen die Datenbasis und müssen vor ihren konsumierenden Paketen abgeschlossen sein.

Parallel sinnvoll: Quelleninventur; isolierte Dokumentationskonfliktlösung; begrenzte unverbundene Designprüfung mit eigenem Scope. Nach Portfreeze können Views parallel zu Servicearbeit entstehen. Store, API, Migration und gemeinsame Zustandslogik bleiben bei einem bestätigten Writer.

Ein Paket kann abgelehnt werden, ohne dass die ganze Architektur neu geschrieben wird. Die Übergabe nennt genaue Schnittstellen, Kriterien, Kandidat und Belege. Nach jedem sinnvollen Paket wird gesichert; keine Commit-/Actions-Schleife pro Textänderung.

## 9.5 Schätzung und Terminierung

Für jedes Paket schätzt der ausführende Owner nach Quellenlesung Aufwand, Unsicherheit und externe Wartezeit getrennt. Große Pakete werden an einer sinnvollen unabhängig prüfbaren Lieferung geteilt. Ein ergebnisloser Recherchetag zählt nicht als Funktionslieferung.

Die Gesamtplanung summiert keine parallel möglichen Stunden einfach zu Kalenderzeit. Sie berücksichtigt Writerengpass, Reviewkapazität, menschliche Entscheidungen, Quota und Setup. P0 und die erste Inventurcharge liefern die erste belastbare Restschätzung. Vorher sind feste Fertigtermine spekulativ.

Der alte Rahmen120-204Stunden bleibt historische Orientierung für den früheren V1-Scope. Neue Vollinventur, zusätzliche kaufmännische Integrationen und Teamcloud sind darin nicht automatisch enthalten. Budget- oder Terminzusagen werden erst nach Paketbestätigung getroffen.

## 9.6 Definition of Done eines Pakets

Kriterien erfüllt; genaue Quellen-/Datei-/Schnittstellenänderung dokumentiert; relevante Tests tatsächlich ausgeführt; Review dem finalen Kandidaten zugeordnet; keine offene unklare externe Wirkung; Task-/Budget-/Versuchshistorie erhalten; Übergabe gespeichert; Release-/Deployaussage passend zum Beleg.

Eine reine Dokumentationslieferung kann diese Definition für ihren Planscope erfüllen. Sie wird dadurch nicht als produktive Firmenfunktion geführt. Dies gilt auch für den vorliegenden Gesamtplan.

## 9.7 Ergänzende Pakete aus dem Review

### FZ-WP23 - Aufgabenbestand und Qualitätsakte

Voraussetzung: WP02/08, aktuelle Fachübergaben und bestätigter Metadatenvertrag; produktive Speicherung nach WP06. Owner: bestehende Aufgabenfachrollen für Quellen, Firmenservicewriter für Anschluss. Pfade als Vorschlag: src/quality/catalog, src/sources/task-quality, src/ui/views/task-quality. Fremde Produktformatdateien bleiben bei ihren Originalownern.

Arbeit: vorhandene Katalog-IDs, Format-/Itemfassungen, tatsächliche Task-/Branch-/Releasebezüge und bekannte Nachweislücken erfassen. Ein Referenzformat, ein komplexer Kandidat und ein vorhandener Fehlerfall werden verknüpft. Keine neue Lernaufgabenengine. Ergebnis: auflösbare Akten mit einem führenden Owner und nächster Aktion. Abnahme AT49/51/56/71; nicht belegter Altbestand bleibt als solcher erkennbar.

### FZ-WP24 - Qualifikation, Fehlerweg und Revalidierung

Voraussetzung: WP23, WP14/20, aktuelle Prüf-/Bewertungsverträge. Owner: Firmenservicewriter für Zustände; Format-/Pädagogikowner liefern Fachkriterien und unabhängige Reviewbeiträge. Pfade: src/quality/qualification, src/quality/findings und passende Vertrags-/Projektionstests.

Arbeit: versionierte Prüfbasis, Q1-Q7, revisionsgebundene Annahme, Abhängigkeitsinvalidierung und Weg von Rot zu Grün. Bestehende Testsysteme referenzieren. Keine Qualitätsentscheidung als automatische Livefreigabe. Tests: AT49-60/71; zusätzlich konkrete Graderänderung bei laufender Annahme. Ergebnis: ein belegter vollständiger Qualitätsfall mit Rückstufung und Wiederfreigabe; geplante Lernaufgabentests nicht mit Firmenserviceprüfungen verwechseln.

### FZ-WP25 - Gemeinsamer Eingang und Fallakte

Voraussetzung: WP06/10/11/14; Quelle und ACLprofile bekannt. Owner: Firmenservicewriter; UIanschluss nach Portfreeze. Pfade: src/ingress, src/cases, bestehende src/requests/communication-Verträge, src/ui/views/inbox.

Arbeit: zunächst manuelle/interne Eingänge, atomare Erfassung, Zuordnung, Split/Merge, genau ein führender Owner, nächste Aktion, Fristen, Wiederöffnung und verknüpfte technische Incidents. Nachricht, Arbeitsauftrag und Kundenfall behalten eigene Identität. Ergebnis: synthetischer Fall von Eingang bis geprüftem internen Ergebnis. Tests AT61-65/69/70; personenbezogene Inhalte bleiben im bestätigten Scope.

### FZ-WP26 - Ein externer Kanal und Kommunikation

Voraussetzung: WP25, konkret ausgewählter vorhandener Kanal, passende Berechtigung, Datenprofil und Operator. Owner: zugewiesener Integrationsfachchat. Pfade: src/ingress/adapters/<bestaetigter-kanal>, ConnectionProfile, CommunicationDraft/Receipt; Credential außerhalb des Repos. Kein Anbietername wird vor Entscheidung als produktive Pflicht festgeschrieben.

Arbeit: lesenden Import mit Cursor, Deduplikation, Abdeckung und Fehlerzuständen qualifizieren; Antwortvorbereitung anschließen. Tatsächlicher Versand nur als konkret autorisiertes Unterprofil mit Empfänger-/Fassungsbindung und Unknown-Abgleich. Tests AT61/62/66-70/72 plus Anbieterfähigkeiten. Ergebnis: ein tatsächlicher Kanal mit ehrlichem Fähigkeitsmanifest; nicht angeschlossene Kanäle bleiben geplant.

### FZ-WP27 - Einfache Navigation und zusammenhängende Abnahme

Voraussetzung: WP15/16 sowie für gewählten Umfang WP23-26. Owner: bestehender Designfachchat für vereinbarte Views, Servicewriter für Ports. Pfade: Navigation, S13-S15 und gemeinsame Aktenkomponenten, keine zweite Datenhaltung.

Arbeit: vier Haupteinstiege, anheftbarer Qualitätsblock, kontextbezogene Entscheidungen und technische Details auf Nachfrage. Ein vollständiger Fall führt von Meldung über Facharbeit und Qualitätsprüfung bis Antwort und Wiederaufnahme. Tests AT33/47/56/70/71; echte Benutzerprüfung und Zielgeräte getrennt. Ergebnis: Martin kann den Vorgang ohne Chat-IDwahl steuern. Erster interner Fall braucht noch keinen externen Versand.

Abhängigkeiten: Quelleninventur für WP23 kann schon bei L0 erfolgen; produktive Mutation bleibt hinter P0/WP06. WP24 folgt WP23, WP25 nutzt den Kern, WP26 folgt WP25. WP27 liefert Ansichten pro bestätigtem Port. Die Koordination bestätigt gemeinsam genutzte Writerpfade vor Start. Alle Pakete sind Planung, keine neu gestarteten Ausführungen.
