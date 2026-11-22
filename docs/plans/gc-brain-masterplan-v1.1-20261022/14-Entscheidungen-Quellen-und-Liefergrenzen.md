# Band 14 - Entscheidungen, Quellen und Liefergrenzen

## 14.1 Beschlossenes und neue Vorschläge

Die Anforderungen Martins und die Rollen-/Livegrenzen sind bestehende Vorgaben. D1 bis D4 und der echte Chat-/Delegationskern stammen aus dem akzeptierten Plan. Die hier zusätzlich beschriebenen Screen-, Daten-, API-, Domain- und Arbeitspaketdetails sind neue Planung und erhalten nicht rückwirkend den Review-PASS der alten Quelle.

Ein Beschlussregister trennt Nutzerentscheidung, technische Empfehlung, noch zu prüfende Fähigkeit und Betriebsfreigabe. Diese Typen dürfen nicht miteinander verrechnet werden. Insbesondere bedeutet eine hohe Architektur-Eignung keine verfügbare Kontoberechtigung.

## 14.2 Entscheidungsregister

| ID | Entscheidung / Typ | Owner und Voraussetzung | Auflösung dieser Fassung |
| --- | --- | --- | --- |
| FZ-ADR01 | eine Firma, neun Bereiche, Projekte als zweite Achse | Nutzerbrief / Produkt | als gewünschtes Firmenmodell konkretisiert |
| FZ-ADR02 | Aufgaben zuerst zur bestehenden Hauptzentrale | Martin / vorhandener Auftrag | verbindliche Richtung, technischer Nachweis offen |
| FZ-ADR03 | vorhandenen Host/MCP-Weg zuerst qualifizieren | Integrator, WP03/04 | beschlossen als Reihenfolge; Fähigkeit unbewiesen |
| FZ-ADR04 | kein erneuter separater Login als nächster Schritt | korrigierte P0-Übergabe | beachten, alter Versuch beendet |
| FZ-ADR05 | SQLite für lokalen transaktionalen Store | bestätigter Storewriter nach P0 | technische Empfehlung; Treiber/Version im WP06 fixieren |
| FZ-ADR06 | ein gemeinsamer Store/API/Migrationswriter | Zentrale vor P1 | konkrete dauerhafte Zuordnung noch offen |
| FZ-ADR07 | vorhandene Codebestände zusammenführen | Integrator, WP00 | Remote0.2.2 und installierte0.5.0 nicht blind gleichsetzen |
| FZ-ADR08 | aktuelles PR269-Konfliktdelta lösen | zugewiesener Dokumentationswriter | PR zuletzt dirty; Mainabgleich vor Integration nötig |
| FZ-ADR09 | Quelleninventur federführend zuordnen | Zentrale, WP02 | zuständigen Fachowner konkret benennen |
| FZ-ADR10 | unabhängiger P4-Produkt-/Recoveryreview | Zentrale vor WP19/21 | kein dauerhafter Chat als verifiziert unterstellen |
| FZ-ADR11 | Cloud-/Teamzugriff und Mac-off | Martin mit Betriebs-/Kostenprofil | noch keine Entscheidung oder Aktivierung |
| FZ-ADR12 | regelmäßige Kadenzen/Notifications | Geschäftsowner je Automation | Vorschläge, keine Scheduler eingerichtet |
| FZ-ADR13 | rechtliche/finanzielle Stammdaten | tatsächlich zuständige Menschen | erheben; unbekannte Betriebsdaten nicht erfinden |
| FZ-ADR14 | neue Gesamtplanung in Repo übernehmen | vorhandene Nutzerfreigabe, eigener Planscope | Revision 1.1 separat dokumentarisch sichern; gemeinsame Writerübergabe erhalten |
| FZ-ADR15 | vier Haupteinstiege und eine gemeinsame Akte | neuer Vereinfachungsauftrag | Planempfehlung, reale Bedienabnahme offen |
| FZ-ADR16 | eigener Aufgabenqualitätsblock | direkter Nutzerauftrag | Band 17; genaue Owner-/Reviewerzuordnung vor Umsetzung |
| FZ-ADR17 | qualitätsgebundenes Grün mit Entzug | Fachkriterien und tatsächliche Belege | neue Vertragsplanung, noch kein Runtimegate |
| FZ-ADR18 | gemeinsamer Eingang und erster Kanal | direkter Nutzerauftrag; Kontoscope fehlt | Band 18; erster externer Anbieter offen |
| FZ-ADR19 | schrittweise nutzbare Produktlieferungen | bestehender P0 und verbindliche Grenzen | L0-L6 in Band 16; Teillieferung ist keine Gesamtfertigstellung |

## 14.3 Genau nächste autorisierte Arbeit

Der aktuelle Auftrag an diesen Fachchat ist die detaillierte Planung. Revision 1.1 überarbeitet diese Ausgabe als versionierten Gesamtplan mit editierbarer Quelle und lesbarem Gesamtband. Die bestehende GitHub-Sicherungsfreigabe wird nur für einen eigenen Dokumentationsscope genutzt. Gemeinsame Registry-/TODO-/STATE-Nachführung bleibt beim bestehenden Writer. Es wird keine Produktsoftware, Verbindung, Automation oder neue Budgetreservierung aktiviert.

Für die Ausführung ist der nächste technische Schritt weiterhin die korrigierte, begrenzte Host-P0-Qualifikation beim bestehenden Integrator. Die Zentrale bestätigt die konkrete fortzusetzende Zuweisung anhand jüngster Übergabe und unbekannter Vorgänge. Quelleninventur und isolierter Dokumentationsmainabgleich können mit getrennten Writerpfaden parallel organisiert werden.

P1/P2 bleiben bis zum echten angenommenen P0-Receipt gesperrt. Ein ausgearbeitetes Buch schließt diese Fähigkeitslücke nicht. Eine nachvollziehbare Nichtmachbarkeit ist ein brauchbares P0-Ergebnis, wenn sie den konkret fehlenden Port und die nächste notwendige Entscheidung benennt.

## 14.4 Verifizierte Repositoryquellen

Historischer Quellenstand der Fassung 1.0: Alle folgenden Mainquellen wurden auf 970db464cc382ed13678d8913e999f6cf5c86c71 gelesen: START_HERE.md, AGENTS.md, docs/CHAT_CONTRACT.md, GRADECREW_STATE.json, TODO.md, workstreams/README.md, docs/assurance/README.md und docs/skills/GRADECREW_EXECUTION_SKILLS.md.

- [Main-Einstieg](https://github.com/HerrLoeffler/Hausaufgabe/blob/970db464cc382ed13678d8913e999f6cf5c86c71/START_HERE.md)
- [Agentenregeln](https://github.com/HerrLoeffler/Hausaufgabe/blob/970db464cc382ed13678d8913e999f6cf5c86c71/AGENTS.md)
- [Chatvertrag](https://github.com/HerrLoeffler/Hausaufgabe/blob/970db464cc382ed13678d8913e999f6cf5c86c71/docs/CHAT_CONTRACT.md)
- [Gemeinsame Aufgaben](https://github.com/HerrLoeffler/Hausaufgabe/blob/970db464cc382ed13678d8913e999f6cf5c86c71/TODO.md)
- [Releasezustand](https://github.com/HerrLoeffler/Hausaufgabe/blob/970db464cc382ed13678d8913e999f6cf5c86c71/GRADECREW_STATE.json)
- [Bestehende Ausführungskette](https://github.com/HerrLoeffler/Hausaufgabe/blob/970db464cc382ed13678d8913e999f6cf5c86c71/automation/EXECUTION.md)
- [BugOps-Übergabe](https://github.com/HerrLoeffler/Hausaufgabe/blob/970db464cc382ed13678d8913e999f6cf5c86c71/workstreams/bug-ops-v1.md)

Die beiden letztgenannten Dokumente wurden als bestehende Vertrags-/Wiederverwendungsquellen gelesen. Ihre historischen Erfolgsangaben wurden in dieser Planungsarbeit nicht vollständig neu als aktuelle Runtime-/Livebelege auditiert.

## 14.5 Plan- und Codereferenzen

- [PR269](https://github.com/HerrLoeffler/Hausaufgabe/pull/269)
- [Akzeptierter Planhead](https://github.com/HerrLoeffler/Hausaufgabe/tree/7342609fb90bffeaecf6f07855173936ef1023bc)
- [Dokumentationsfolgehead](https://github.com/HerrLoeffler/Hausaufgabe/commit/cf5b8c4e0029b9742b158d6d845aafbff7909097)
- [Remote-Controlbasis](https://github.com/HerrLoeffler/Hausaufgabe/tree/7ccf74ce94a81e5e6ef328475f381c04843b492c/prototypes/gradecrew-control-local)
- [Remote-server.mjs](https://github.com/HerrLoeffler/Hausaufgabe/blob/7ccf74ce94a81e5e6ef328475f381c04843b492c/prototypes/gradecrew-control-local/server.mjs)
- [Remote-MCP0.2.2](https://github.com/HerrLoeffler/Hausaufgabe/blob/7ccf74ce94a81e5e6ef328475f381c04843b492c/prototypes/gradecrew-control-local/plugin/mcp.mjs)

Gelesene Remote-Blobs: server.mjs 1f39b3aa4dd6fba56f608394e3356b9252fe635f; agent.mjs 0678649dabc05fd887cdcad7d5c640720151b471; plugin/mcp.mjs 99c6b0399f9cb2168a126a256260b8453bd5e71e; plugin/view.mjs 59b4ba5495677ff8f5040244837172176df1f82b; plugin/bridge.mjs 21fd1ef18f52da06e783d44cc8347f2d601e6691; public/shared.mjs 903a389442498d962000ef369bb64d51d393db61.

Die heutige Remote-Codelektüre bestätigt Grenzen und Wiederverwendung, keinen erfolgreichen neuen Produktlauf.

## 14.6 Lokale und Chatquellen

Gelesen wurden aktuelle Turnzusammenfassungen der GradeCrew Zentrale, von GC · Automatisierung & Integration und von GC · Design. Bei großen nicht vollständig abrufbaren Turns wurde die lokale aktuelle Fachübergabe verwendet. Es gab keinen vollständigen historischen Chatimport.

Lokale Designquelle: work/gc-brain-company-view-20261022/workstreams/gc-brain-company-view-20261022.md einschließlich V3, Quellenbericht und offener Anschlussgrenze. Lokaler Designbranch zuletzt b912d03. Sicht-/Responsivenachweise sind als dort dokumentierte Prüfung behandelt; diese Gesamtplanung hat keinen zusätzlichen Produktbrowserlauf gestartet.

P0-Quellen im vorhandenen Integratorworkspace: CAPABILITIES.md, HANDOFF.md, AUTHORIZATION-20261022.md, P0_EXIT_RECEIPT.open-01.json, LOGIN-CANCEL-20261022.json und HOST-CORRECTION-20261022.md. Es wurden nur diese Diagnose-/Vertragsdokumente und der Metadatenhandshake gelesen. Keine privaten Token-/Credentialdateien oder Desktopdatenbanken wurden gelesen.

Die älteren Planreviews liegen im Projektworkspace unter outputs/brain-v1-plan-review-20261021. Ihr Scope war gezielter Plancontractreview, keine Runtime- oder V1-Softwareabnahme.

## 14.7 Offizielle OpenAI-Quellen

Am22.Oktober2026 wurden die folgenden Seiten gesucht und tatsächlich geöffnet:

- [MCP-App-UI und Zustandsmodell](https://developers.openai.com/plugins/build/chatgpt-ui)
- [Bridge-Referenz](https://developers.openai.com/plugins/reference)
- [App Server](https://learn.chatgpt.com/docs/app-server)
- [Scheduled tasks](https://learn.chatgpt.com/docs/automations)
- [Tasks and memory](https://learn.chatgpt.com/docs/dots/tasks-and-memory)

Diese Quellen stützen die kurzen Fähigkeitsgrenzen in Band06/07. Die vorgeschlagenen GradeCrew-APIverträge und Betriebsprozesse sind eigene Planungsentscheidungen. Sie sind keine aus den OpenAI-Dokumenten übernommene fertige Unternehmensplattform.

Dokumentierte Produktfähigkeit, installierte Version, Kontoberechtigung und tatsächlich bestandener Ende-zu-Ende-Lauf sind vier verschiedene Nachweise.

Zusätzlich am22.Oktober2026 gelesen: [RFC8785 / JCS](https://www.rfc-editor.org/info/rfc8785/) für den vorgeschlagenen kanonischen Hashvertrag in Band11.

## 14.8 Selbstprüfung dieser Fassung

Geprüft werden vor Lieferung: Kapitel-/Objekt-/Kennungskonsistenz, Erhalt von D1-D4, Vollständigkeit der neun Bereiche, Zuordnung der24Anforderungsgruppen zu Umsetzung/Abnahme, eindeutige Trennung von Vorschlag und vorhandenem Code, keine Secrets/Produktaktivierungen, keine unzulässige Plan-PASS-Vererbung und lesbare PDFdarstellung.

Die PDFprüfung betrifft Lesbarkeit, Inhaltsverzeichnis, Seitenübergänge, Tabellen und Codebeispiele. Sie ist keine Ausführung der geplanten72Produktabnahmefälle. Eine unabhängige Prüfung der neuen Gesamtplanung bleibt der nächste gezielte Planreview, bevor neue Vertragsdetails produktiv verwendet werden.

## 14.9 Liefer- und Versionsgrenze

Diese Fassung enthält Geschäftsmodell und Arbeitsorganisation, Produktanforderungen, technische Zielverträge, konkrete Pakete und Abnahmekriterien. Sie ist ein reviewbarer Architektur-/Betriebsentwurf. Spätere notwendige Änderungen werden versioniert und begründet eingearbeitet; ursprüngliche Entscheidungen bleiben nachvollziehbar.

Der frühere kurze Nächste-Schritte-Text bleibt als historische Ausgabe erhalten. Dieser Gesamtplan ist die neue ausführliche Planungsantwort auf Martins konkret erweiterten Auftrag. Er ersetzt keine bereits laufende Fachausführung oder gültige Releaseakte und beansprucht keine neue gemeinsame Writerhoheit in PR269.

Angefordertes/beobachtetes Modell, Aufwand und tatsächliche Usage dieser Planungsarbeit sind aus den hier verfügbaren Runtimebelegen nicht belastbar getrennt ermittelbar: unknown. Es wurde kein zusätzlicher Modell-/Providerstart für diese Dokumenterstellung aktiviert. Eine Kosteneinsparung wird nicht behauptet.

## 14.10 Quellenabgleich und Änderungshistorie der Revision 1.1

Der aktuelle Reviewquellstand ist cb1b0e284e97f072db058b7705cdb70c45943a3a; siehe Band 16.9 für tatsächliche neue Reads und Grenzen. Der alte Quellenkatalog bleibt als Entstehungsgeschichte erhalten. Die ursprüngliche Fassung 1.0 liegt unverändert im bisherigen Ausgabeordner. Diese Revision ersetzt in der aktuellen Empfehlung die Navigation, ergänzt den Qualitäts-/Eingangsblock und erweitert Anforderungs-, Paket- und Abnahmekatalog. D1-D4 werden nicht abgeschwächt.

Neue Primärreferenzen: [Aufgabenprinzipien](https://github.com/HerrLoeffler/Hausaufgabe/blob/cb1b0e284e97f072db058b7705cdb70c45943a3a/docs/learning/INTERACTIVE_TASK_PRINCIPLES.md), [Methodenfundus](https://github.com/HerrLoeffler/Hausaufgabe/blob/cb1b0e284e97f072db058b7705cdb70c45943a3a/docs/learning/INTERACTIVE_TASK_CATALOG.md), [Development-Status-Lauf](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/39849601427), [visueller Arbeitsstrang PR265](https://github.com/HerrLoeffler/Hausaufgabe/pull/265), [Kapitelarbeit PR254](https://github.com/HerrLoeffler/Hausaufgabe/pull/254). PR-/Chatangaben zu bisherigen Produkttests werden als gelesene Fachberichte behandelt, nicht als in dieser Revision wiederholte Abnahmen.

Der Quellenabgleich fand bestehende aktive Aufgabenentwicklung. Deren Code wurde nicht übernommen oder geändert. Die neuen Daten-/Prozessverträge benötigen vor produktiver Verwendung gezielten unabhängigen Review. Ein Autorenreview und Dokumentprüfung liefern keinen Produkt-PASS.
