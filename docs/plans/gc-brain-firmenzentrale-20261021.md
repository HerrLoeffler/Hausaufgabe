# GradeCrew Firmenzentrale — konkreter Bauplan

**Task:** GC-BRAIN-01 · **Revision:** 3, 21.10.2026 · **Status:** Zielnetz, Fortschritt und gemeinsamer Wissenskern als V1-Kern ausgearbeitet; bereit zur Prüfung durch die Zentrale, danach autorisierte Fachumsetzung. GitHub-Sicherung durch Martin freigegeben, Live unverändert.

**Goal:** Martin steuert ein zusammenhängendes Firmennetz aus Bereichen, Zielen, Konzepten und ausführbaren Aufgaben. Ein gemeinsamer Hauptkern kennt den belegten Stand, erinnert bestätigte Entscheidungen und schlägt begründet die nächsten Schritte vor; Bereichschat und Ausführung liegen im selben Produkt.

**Architecture:** Eigene Produktoberfläche mit persistenten Bereichsgesprächen, gemeinsamem Aufgaben-/Ereignisspeicher und getrenntem Koordinator-/Fachworker-Broker. Als empfohlene V1-Runtime dient der offizielle Codex App Server mit eigenen clientverwalteten Threads und isoliertem Profil nach bestehendem PR206. Vorhandene Control-/Central-/Release-Control-Bausteine werden gezielt wiederverwendet; alte Desktop-/ChatGPT-Chats sind ergänzende Quellen, keine vorausgesetzte Produktverbindung.

**Tech Stack, vorgeschlagen:** vorhandene Node/ESM-Basis, SQLite für Produktnachrichten, Aufgaben, Transaktionen und Outbox; Browseroberfläche mit Antwortstream; lokaler Broker hält die offizielle App-Server-Verbindung. Teamcloud folgt getrennt. Keine Installation, Anmeldung oder Inferenz durch diesen Plan.

**Spec:** Martins Präzisierung vom21.10.2026 ersetzt den alten Dashboard-zuerst-Zuschnitt: echter Bereichschat plus ausführbare Delegation ist V1-Pflicht. Owner/History bleiben in `../../workstreams/gc-brain-firmenzentrale-20261021.md`. Martin hat die Umsetzung nach bestandener V1-Planprüfung durch die Zentrale zur Verteilung an zuständige Fachchats autorisiert; dieser Planungsfachchat implementiert nicht. Fachumsetzung dann mit `superpowers:executing-plans`. Keine neue Taskfamilie, keine zusätzliche Zentralenhierarchie.


## 1. Empfehlung und verbindliche Produktabnahme

**Die Firmenzentrale wird ein eigener Arbeitsort mit Bereichschat und Fachausführung ab V1.** Ein reines Dashboard, externe Chatlinks oder kopierbare Aufträge erfüllen diese Anforderung nicht. Solche Teilstände dürfen intern früh sichtbar sein, zählen aber nicht als nutzbare V1.

Die kleinste V1 enthält Heute, einen zentralen Eingang und persistente Gespräche in den konfigurierten Bereichen: Produkt/Web, Native/Secure, Games mit Unterprojekten, Pädagogik/Schule, Kunden/Piloten/Feedback, Betrieb sowie Unternehmen. Bereichswechsel behält Verlauf und laufende Aufgaben. Ein Bereich ist ein Kontext mit klarer Zuständigkeit, keine neue Codex-Desktopunterhaltung pro Klick. Die ersten zwei qualifizierten Ausführungspfade sind Audio/Web-Diagnose und Betrieb/Review; weitere Fachprofile werden nur innerhalb ihrer nachgewiesenen Fähigkeiten angeboten. Ein nicht angebundener Spezialdienst bleibt sichtbar nicht ausführbar; dafür wird kein Fake-Worker behauptet.

**Harte V1-Abnahme:** Nachricht im Bereich → persistente Nachricht/Request-ID → konkreter Fachauftrag mit genau einem Owner → tatsächlicher Start-/Toolstatus → Rückfrage oder konkrete Freigabe in derselben Oberfläche → Fortsetzung desselben Vorgangs → Ergebnis mit Beleg → derselbe Zustand in Heute und Aufgabenansicht. Mindestens ein echter, begrenzter Fachauftrag wird ausgeführt; ein bloßer KI-Antworttext gilt nicht als Auftragsausführung.

Zentrale und Bereichskoordinatoren koordinieren ausschließlich: Anliegen einordnen, bestehende Tasks/Owner prüfen, Fachauftrag erstellen, Rückmeldung prüfen. Fachworker führen genehmigte Werkzeuge im begrenzten Checkout/Scope aus. Rechte werden außerhalb der Prompts serverseitig durchgesetzt. Bereichsübergreifende Anliegen haben eine federführende Task und verknüpfte Teilaufträge mit eigenen Ownern; sie werden nicht mehrfach unabhängig ausgeführt.

Empfohlen: eigenes lokales Produkt mit offizieller Codex-Runtime, später private Team-PWA. Die offizielle App-Server-Dokumentation beschreibt Verlauf, Events und Approvals für eigene Integrationen. Sie belegt keine vollständige Einbettung beliebiger vorhandener Desktop-/ChatGPT-Verläufe. Neue Produktgespräche sind vollständig in der Firmenzentrale bedienbar; freigegebene HDF-/Kontextübernahme aus Altchats trägt sichtbare Herkunft und Abdeckung. [App Server](https://learn.chatgpt.com/docs/app-server), [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk).

**Eignung des empfohlenen Wegs: 8/10**, begründete Einschätzung anhand Kernfunktion, Wartung und Datenkontrolle. Die Runtime-/Authqualifikation und sichere Toolrechte verursachen echten Aufwand. Der Fertigstand des Produkts wird nicht aus einem Plancommit bewertet: Software und reale V1-Abnahme sind noch offen.



### 1.1 Das Produkt ist ein Firmennetz mit gemeinsamem Hauptkern

Martins zusätzliche Anforderung: die wichtigen Bereiche wie ein Netz überblicken und ansteuern, Ziele setzen und weiterverfolgen, Restarbeit und gefühlten Fortschritt sehen; der Hauptkern soll wie eine Führungskraft den Zusammenhang kennen und Konzepte weiterentwickeln, ohne ständig dieselbe Einweisung zu brauchen. Das gehört zum fachlichen V1-Kern, nicht nur zur Zukunftsidee.

Das gemeinsame Firmenmodell lautet: **Bereich → Ziel/Teilziel → Meilenstein → Aufgabe → Ausführung → Ergebnis/Beleg**. Dazu gehören **Konzeptversionen und Entscheidungen**, die Ziele begründen oder ändern, sowie Querverbindungen wie „hängt ab von“, „trägt bei zu“ und „blockiert“. Derselbe Datensatz ist als überschaubares Netz, Liste, Zielseite, Heute und im Chat erreichbar. Eine neue Grafik erzeugt keine eigene Wahrheit.

V1 zeigt die vorhandenen Bereiche mit Zuständigkeit und ihre aktiven Ziele, auch wenn noch kein ausführbarer Spezialconnector angeschlossen ist. Chat und Planung funktionieren in jedem berechtigten Bereich; eine Spezialausführung bleibt bis zur Qualifikation sichtbar eingeschränkt. Das ist kein Versprechen, sämtliche Firmenkonten schon zu verbinden. Anfangs werden wenige priorisierte echte Ziele sauber übernommen, keine ungeprüfte Massenmigration aller alten Chatwünsche.

Martin kann im Hauptchat oder direkt am Ziel sagen: „Daran weiterarbeiten“, „Das Ziel ändern“, „Neues Ziel anlegen“ oder „Was fehlt bis zum Abschluss?“. Der Kern verwendet den vorhandenen Zielstand, zeigt passende Tasks/Owner und verteilt konkret ausführbare Arbeit. Große Anliegen werden in überprüfbare Ergebnisse aufgeteilt, nicht in unverbundene Chatantworten. Ein Zielwechsel bedeutet keinen neuen Aufgabenbestand und keinen Reset laufender Versuche.

### 1.2 Definition eines brauchbaren Ziels und nachvollziehbarer Prozentwerte

Ein Ziel hat ID, lesbaren gewünschten Zustand, verantwortlichen Bereich und genau einen verantwortlichen Owner, Priorität, aktiven Geltungsumfang, nächstes überprüfbares Ergebnis und Abschlusskriterien. Termin/Zielkennzahl sind optional; fehlende Werte bleiben offen. Lebenszyklus: Entwurf / aktiv / pausiert / erreicht / verworfen. Parent/Teilziele sind zulässig; Querbeziehungen sind davon getrennt. Der Kern darf Ziele vorschlagen, Martin setzt oder ändert strategische Prioritäten und wesentlichen Scope.

Fortschritt ist Orientierung für Martin und muss begründbar sein. Die Oberfläche zeigt zwei getrennte Werte:

- **Nachgewiesener Ziel-Fortschritt:** gewichtete akzeptierte Meilensteine innerhalb einer versionierten Zieldefinition. Formel `100 * sum(weight * accepted) / sum(weight)`, mit accepted=0 oder1. Jeder Meilenstein hat ein klares Ergebnis, Prüfkriterium und Beleg; maximal4–6 für ein kleines V1-Ziel. Standardgewichte sind gleich, andere Gewichtung wird sichtbar begründet und bestätigt. Ein Teilziel wird entweder aus eigenen Meilensteinen oder aus gewichteten direkten Teilzielen berechnet, nie aus beidem gleichzeitig. Aufgaben dürfen mehreren Zielen beitragen; derselbe Meilenstein wird in einem Zielrollup nur einmal gezählt.
- **Einschätzung:** optional „ca.65%, eingeschätzt von Martin/Owner am…“, mit kurzer Begründung und Quelle. Der Kern kann eine Schätzung vorschlagen; sie wird nie als bewiesener Messwert oder zur Erledigtmarkierung verwendet. Ohne ausreichende Grundlage steht „noch nicht eingeschätzt“.

Beispiel: Vier gleich gewichtete Meilensteine, davon Konzept und isolierter Kandidat akzeptiert, Geräteprüfung und Freigabe offen →50% nachgewiesen;2/4 Ergebnisse und Restarbeit sind aufklappbar. Ein laufender Test, erzeugte Codezeilen, Chatnachrichten oder verbrauchte Zeit heben den Wert nicht automatisch. Ein Produktziel kann damit50% sein, obwohl ein Teilfeature bereits deployed ist. Release-Stufe und Ziel-Fortschritt sind verschiedene Aussagen.

Scopeänderung erzeugt eine neue Zielrevision mit Änderungsgrund und zeigt vorherige/neue Basis. Wird ein weiteres Abschlusskriterium aufgenommen, kann der neue Prozentwert sinken; das ist sichtbar erklärbar. Ein zurückgezogener Beleg kann Fortschritt zurücknehmen.100% gilt nur bei allen erfüllten Kriterien und notwendiger Ownerabnahme, nicht durch manuelles Hochsetzen einer Zahl. Ein übergeordnetes Ziel wird nicht erreicht, solange ein zwingendes Gate offen ist, auch wenn Rundung100% ergäbe. UI zeigt zusätzlich Blocker, Vertrauen/Belegabdeckung und Aktualität, statt eine Scheingenauigkeit zu erzeugen.

### 1.3 Hauptkern: gemeinsamer Kenntnisstand und überarbeitbare Konzepte

Der Hauptkern bekommt eine dauerhafte, versionierte Firmenakte: aktive Ziele, Zielbeziehungen, bestätigte Entscheidungen, gültige Konzeptfassung, Grenzen/Präferenzen, aktuelle Ergebnisbelege, offene Fragen und zuständige Owner. Er hat einen Firmenüberblick innerhalb seiner berechtigten Quellen, keinen Zugriff auf unbekannte oder gesperrte Kontoinhalte. In jeder Auskunft kann er sagen, worauf sie beruht, wann geprüft wurde und wo Wissen fehlt oder widerspricht.

Neue Arbeit startet mit einem strukturierten **Arbeitsbrief** aus Unternehmensziel, fokussiertem Ziel, gültigem Konzept, relevanten Entscheidungen/Constraints und letzten passenden Belegen. Martin muss bereits gespeicherte Angaben nicht wiederholen. Bereichswechsel oder Ersatz eines Runtime-Threads ändert diese Produktakte nicht. Ein Fachworker erhält nur seinen relevanten erlaubten Ausschnitt; Finanz-/Rechtsdaten wandern nicht pauschal in jeden Games-Prompt.

Gespräche können neue Notizen, Entscheidungen, Ziele und Konzeptänderungen erzeugen. Diese werden als konkrete verknüpfte Objekte gespeichert, nicht nur irgendwo im Chat erwähnt. Beispiel: „Das Secure-iPad hat Vorrang“ erzeugt eine bestätigte Prioritätsentscheidung mit betroffenen Zielen; der nächste Heute-/Bereichsbrief berücksichtigt sie. Unklare Äußerungen bleiben Vorschlag/Rückfrage. Abgelehnte Konzepte bleiben im Verlauf auffindbar, werden nicht beim nächsten Kontextaufbau wieder als gültiger Plan behandelt.

Ein Konzept hat eine gültige Fassung, Änderungsentwürfe und Versionsvergleich. Fachchats dürfen innerhalb ihres Auftrags einen konkreten Überarbeitungsentwurf erstellen; wesentliche Richtungs-/Scopeänderungen gehen als Entscheidung an Martin. Belege, Quellenstatus und Routinefortschritt werden ohne wiederholte Zustimmung aktualisiert. Der Kern zeigt nach einer Änderung: „Was hat sich geändert, warum, welche Ziele/Tasks sind betroffen, was ist jetzt der nächste Schritt?“ Bereits beschlossene Anforderungen werden nicht alle paar Nachrichten neu gefragt.

Nach Task-/Decision-/Evidence-Events wird der betroffene Firmen-/Bereichsbrief als neu zu berechnen markiert und deterministisch aktualisiert; optionale sprachliche Verdichtung erfolgt gebündelt bei Bedarf und innerhalb Budget. Kein kostenpflichtiger Modellaufruf pro Statuspoll oder unbegrenzter Hintergrundchef. KI-Zusammenfassungen sind abgeleitet und dürfen Status/Entscheidungen nicht überschreiben. Konflikte werden sichtbar markiert und zur Klärung gestellt, nicht still glattgebügelt.

V1-Einstieg des Kerns: „Was sind unsere wichtigsten Ziele, wie weit sind wir, was fehlt und was kann der zuständige Fachbereich als Nächstes tun?“ Antwort nennt je Empfehlung Ziel/Owner, Abhängigkeit, aktuellen Beleg, Prioritätsgrund und genau einen nächsten ausführbaren Schritt. Keine erfundenen Termine, Umsätze oder freien Kapazitäten. Der Kern erkennt offene Grundlagen und fordert nur die wirklich fehlende Entscheidung an.


## 2. Bestandsabgleich und Wiederverwendung

Die folgende Inventur bewahrt die Belege der ersten Planungsrunde; damalige Aussagen „heute“ beziehen sich auf diesen Abruf. Den frischen Revisionsabgleich auf Main2324652c und seine Grenzen nennt Abschnitt12.

Quellenbasis: `HerrLoeffler/Hausaufgabe main@0eac79c9ab36d40238956076001de8c9eff30409`. Einstiegsregeln, STATE, TODO und Registry frisch gelesen. GitHub-Live-Audit [39630477855](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/39630477855), Job119327073408, completed/success, Log vom21.10.2026 15:58UTC gelesen. Er meldet26 aktive Baustellen,24 Parallelüberschneidungen,17 veraltete kritische Branches und173 nicht klassifizierte Remote-Branches. Die Registry enthält60 Einträge; diese unterschiedlichen Zählungen dürfen im UI nicht als „60 unfertige Funktionen“ erscheinen.

| Baustein | Tatsächlicher Befund | Wiederverwenden / Grenze |
|---|---|---|
| GradeCrew Central0.4 | Aktuelle Projekt-/Workstream-Lesetools in diesem Chat erfolgreich benutzt; Main-SHA und Quelle geliefert. Lokaler `plugin/project-reader.mjs` liest Registry/State und sichere registrierte HDF-Pfade. | Adapter/Feldprojektionen und Verbindungsmuster übernehmen. Projektstatus ist ein Snapshot, kein unabhängiger aktueller Deploytest. |
| Control-Prototyp GC-BRAIN-01 | Lokale README:50 Aufgaben aus Snapshot, Entwürfe/Kommentare, JSON-Export, Loopback-Origin-/Sessionprüfungen; Quellcode/Handoffs gelesen. | Eingabe, Taskdetail, Export und Begrenzungen als Grundlage; Datenmodell/Tests vor Wiederverwendung erneut prüfen. Kein aktueller Dauerbetrieb hier gestartet. |
| Alte Inline-Zentrale | `inline/gradecrew-central.html` nutzt `window.openai.sendFollowUpMessage`; Quelle enthält keine allgemeine Browser→Codex-Runtime. | Darstellung/Quellenanzeige nützlich. Hostabhängigen Versand hinter expliziter Capability-Prüfung belassen. Alte UI-State-Objekte sind keine aktuellen Receipts. |
| Chat-Zentrale / Verbindungstest | Beide HTML-Dateien am 05.10.-Visualisierungspfad lesend geprüft: Hostnachricht, fehlender Host führt zu sichtbarer Grenze. | Keine Buttons ausgelöst. Historische Karten nicht als Live-Backend anzeigen. |
| `DISPATCH-PILOT.md` | Dokumentiert Karte→Main sowie Main→bestehender Fachchat→Main; Pilot branch_only, begrenzte Dateiänderung. | Gute Ablaufvorlage; kein heutiger allgemeiner Autostart, kein Mac-off-Nachweis. Frühere Versuchszähler bleiben erhalten. |
| Development Status | `tools/development_status.py`, Registry, Action; heutiger Log und offene PRs geprüft. | Hauptquelle für Branch/PR/Überlappung. Es ist ein Warnsystem ohne Merge-/Deployrechte. |
| Release Control V2 | `tools/release_control.py`, Katalog, Abnahme und HDF gelesen. Prüft Receipts, SHA, Komponenten und neueste Versuche. | Vorhandene Prüflogik wiederverwenden; keine zweite Releaseampel erfinden. Letzte sichtbare Runs waren teils skipped/cancelled; das ist kein erfolgreicher aktueller Gatebeleg. |
| GC-MODEL-GOVERNOR-01 / PR206 | Vorhandener [Cliententwurf](https://github.com/HerrLoeffler/Hausaufgabe/pull/206), Head5d766b818fa181e7cc36ff15b6402d9e19b727e0, eine Spezifikation. Eigene Threads/isoliertes Profil, kein Desktopübernahmeversprechen. | Stufe2 bindet an diese Aufgabe an. Kein zweiter Composer/Modellrouter ohne Ownerabgleich. Workbench liegt auf Produkt-/Toolingbranch, nicht automatisch auf main. |
| GC-ANALYTICS-01 | Bestehende TODO und Umsetzungschat `01a15f1d-8adf-77e0-831d-f97cfcd0e5e2`; heutiger Audit nennt PR263. | Nur vereinbarte datensparsame Aggregate als spätere Schnittstelle; Tracking nicht hier bauen oder verändern. |
| Live-Lehrerfeedback | Vorhandener Reader nutzt `reviewMode/listTeacherFeedback`, explizit `hausaufgabe-staging`, Admin, Feldprojektion/Pagination. Verbindung hier nicht angemeldet. | Exakt den bestehenden Rollenpfad nutzen. Keine Schülerantworten, keine Rohprofile; kein neuer Feedbackstore im öffentlichen Repo. |
| Zentrale / Fachchats | Zentrale `01a10df6-736b-7a62-bd38-2724cf254c2e`; aktueller Planungsauftrag hier. Letzter gelesener Turn „GradeCrew-Workstreams nach Staging“ behandelt Privacy/Migrationskosten. | Keine fremde Arbeit übernehmen, keine Nachrichten versandt. Logische Bereiche führen zu vorhandenen Ownern; sie erzeugen nicht automatisch neue Chats. |

Historische Quellen liegen lokal unter `gradecrew-control-prototype/` und `gradecrew-project-mcp/` im bestehenden GradeCrew-Projektmirror. Remote-Bezug: Branch `prototype/gradecrew-control-local-v1`, Pfad `prototypes/gradecrew-control-local/`. Dessen aktuelle Remote-Spitze wurde in dieser Planung nicht als Produktkandidat ausgecheckt; spätere Umsetzung muss sie frisch prüfen. GC-BRAIN-01 ist bereits in Main-TODO/Recovery erwähnt, fehlt aber bisher in der Registry und wird von `gradecrew_task` nicht gefunden. Auffindbarkeit derselben Aufgabe korrigieren; Katalog50 und Registry60 nicht ungeprüft zusammenwerfen.

STATE enthält alte und neue Belege verschiedener Teilkomponenten. Beispiel: Main berichtet Integrationhead2a6ff107…, Gateeinträge nennen teilweise frühere7a18445f…-Runs. Das Cockpit muss Komponentenbindungen prüfen, statt den neuesten SHA neben einen älteren grünen Test zu stellen. In dieser Planung wurden keine aktuellen Deploy-Artefakte heruntergeladen oder neu als verifiziert bestätigt. Schul-Live ist `hausaufgabe-staging.web.app`, die getrennte Testumgebung `gradecrew-staging-2026.web.app`; Namensheuristiken sind verboten. Eine historische AGENTS-Zeile nennt noch `hausaufgabe-40294` als Production; für jede Aktion braucht es die aktuelle explizite Umgebungsbindung. Heute erfolgt keine solche Aktion.

## 3. Auswahlvergleich unter der verbindlichen Chat-Anforderung

Gleiche Kriterien, Skala1–10, höher ist besser: integrierte Kommunikation/Auftragsausführung, belegbarer Überblick, geringer Wartungsaufwand, Datenkontrolle, beherrschbare Sicherheit und geringer Startaufwand. Werte sind begründete Einschätzungen, keine Messdaten. Ein Weg ohne integrierten Bereichschat scheidet unabhängig vom Mittelwert aus.

| Ansatz | Chat + Ausführung | Überblick | Wartung | Daten | Sicherheit | Start | Entscheidung |
|---|---:|---:|---:|---:|---:|---:|---|
| A: bestehende Codex-Chats + Links-/Statusdashboard | 2 | 7 | 9 | 6 | 8 | 9 | **3/10 Gesamteignung:** Kernabnahme nicht erfüllt; nur unfertige Zwischenhilfe |
| B: eigene Firmenzentrale + offizieller Runtime-Broker + vorhandene Beweisadapter | 9 | 9 | 7 | 9 | 8 | 6 | **8/10:** empfohlen; Gespräch, Fachauftrag und Belege liegen im selben Produkt |
| C: eigener vollständiger Agentenharness/Chatdienst von Grund auf | 9 | 9 | 3 | 9 | 4 | 2 | **6/10:** maximale Kontrolle, unnötig hoher Betriebs-/Sicherheitsaufwand für den Start |

B nutzt einen vorhandenen offiziellen Harness und baut die firmenspezifische Produktoberfläche, Speicherung, Berechtigungen und Dispatchsteuerung. C würde auch Toolausführung, Sandbox-/Approvalverhalten und Runtime-Recovery neu entwickeln. Die bisherige Empfehlung „A als erster alltagsfähiger Lieferstand“ ist verworfen.

**Technikentscheidung für V1:** Eigene clientverwaltete Codex-Threads hinter dem offiziellen App Server; Einstieg und Ergebnis vollständig in der Firmenzentrale. Bestehenden PR206 unter GC-MODEL-GOVERNOR-01 als Runtimevorlage/Owner-Schnittstelle weiterführen, nicht parallel neu bauen. Keine externe Desktop-MCP-Funktion als öffentliche Produktroute. Sollte die konkrete installierte Version/Authkonstellation nicht qualifizierbar sein, bleibt V1 blockiert. Dann separat die offizielle API-Runtimevariante kalkulieren und entscheiden; kein stiller Providerwechsel und kein Links-Dashboard als Ersatzabschluss.

Alternative innerhalb B: eigener Orchestrator mit offiziellen APIgesprächen und sandboxgebundenen Tools. Vorteil: eigener Lebenszyklus/Hosting; Nachteil: zusätzliche APIabrechnung, Kontext-/Toolloop-/Policyverantwortung. Diese Alternative ist konkret möglich zu planen, aber nicht ohne Auth-, Kosten- und Sicherheitsentscheidung aktivierbar. App-Server-Threads und APIgespräche sind unterschiedliche Stores; Providerwechsel ist eine versionierte Kontextmigration, kein transparenter Vollhistorien-Sync.


## 4. Lieferphasen, Aufwand und Kosten — neu zugeschnitten

Zeitbandbreiten für einen mit GradeCrew vertrauten Entwickler, einschließlich gezielter Verifikation und Reviewnacharbeit. Ein Arbeitstag entspricht6 konzentrierten Stunden. Kalenderdauer hängt von Kapazität, Zugriffen und Martins Abnahmen ab. Keine Festpreis-/Terminzusage.

| Phase | Scope | Harte Abnahme | Abhängigkeiten / Aufwand | Ausgeklammert |
|---|---|---|---|---|
| 1 — erste alltagsfähige V1 | Zielnetz + Fortschritt + versionierter Wissens-/Konzeptkern + Heute + zentraler Eingang + persistenter Bereichschat + Runtime-Broker + ausführbarer Fachauftrag + Rückfragen/Approvals + Ereignisse/Belege in derselben UI; Sicherung/Restore | Abschnitt1 und realer End-to-End-Fall ausAbschnitt6 bestanden; alle Ansichten referenzieren dieselben IDs/Zustände; Neustart/Abbruch/Doppelstart geprüft | isoliertes unterstütztes Runtimeprofil, passendes Kontingent, qualifizierte Tools; **120–204h /20–34Arbeitstage**, etwa4–8Kalenderwochen bei regelmäßiger Arbeit | universelle Altchatübernahme, unbeaufsichtigte Deploys, Teamcloud, alle Dienstintegrationen |
| 2 — weitere Fachprofile / belastbarere Beweisautomation | zusätzliche fachliche Toolprofile, mehr parallele begrenzte Aufträge, Push-/Webhookabgleich, vorhandene Analyticsaggregate | pro Profil ein echter begrenzter Auftrag mit Rechten/Belegen; neue fehlgeschlagene Versuche werden nicht von alten Erfolgen verdeckt | V1; bestehende Bereichs-/Analyticsowner, **24–48h /4–8Tage** | Schulplattformmigration, pauschaler Rootzugriff |
| 3 — private Team-PWA | getrenntes Managed-Projekt, Auth/Rollen, autorisierte Cloudworker falls benötigt, widerrufbare Grants, Cloudrestore | Owner/Bereich/Reviewer-Gegentests, Desktop/iPad-Durchlauf, Restore, Kosten-/Betriebsabnahme | V1; Hosting-/Daten-/Kostenentscheidung, **42–72h /7–12Tage**; Cloudworker mit umfangreicher Sandbox ggf. zusätzlich | automatischer Productionzugriff, Übernahme von Teacher-Adminrechten |
| 4 — ausgewählte Firmenfunktionen | Dokumente/M365, gegebenenfalls Mail/Kalender/Finanzen je konkretem Bedarf | Zugriff, Widerruf, Löschung/Export und1echter Nutzenfall pro Integration | **12–30h pro einfache Integration**, Fachlogik extra | ungezieltes Verbinden aller Konten |

Phasen1–3: grob186–324h /31–54Arbeitstage; bei Teilzeit und Integrationsunsicherheit grob8–16Kalenderwochen. Die alten V1-Schätzungen24–42h für das Dashboard und84–144h für Chat/Delegation sind ersetzt: Zielnetz und belastbare Wissenspflege waren darin nicht ausreichend kalkuliert. Bei grundlegenden Runtime-/Authproblemen kann die V1-Bandbreite um50–100Prozent steigen; nach P0 belastbarer neu schätzen.

Interne Zwischenstände: nach P1 kann eine reine Übersicht sichtbar sein; nach P2 ein gespeicherter Chat ohne fertigen Worker. Beide sind ausdrücklich **keine nutzbare V1**. Release erst nach P0–P4 einschließlich echter Fachausführung. Keine zusätzliche Verzögerung durch SciFi-Design oder neue Zentralenhierarchie.

**Kostenfolgen:** V1 braucht reale Modellnutzung für Gespräche, Koordination und Fachausführung. Anzeige/Sortierung bleibt ohne Modellcall; jede Nachricht/Ausführung kann aber Kontingent oder APIkosten verbrauchen. Bestehendes Abo ist keine Zusage kostenloser oder unbegrenzter Eigenproduktnutzung. P0 prüft den offiziell unterstützten Authweg und Nutzungsbedingungen der gewählten Runtime. Keine Tokenkopie, keine neuen Keys/Accounts aus diesem Plan.

Vorgeschlagene, noch nicht freigegebene Pilotgrenze: höchstens10 reale End-to-End-Aufträge,1Fachworker gleichzeitig, zunächst1Prüfworker danach; maximal1Start je Request und höchstens1ausdrücklich genehmigter Reparaturversuch mit erhaltener Historie. Wenn Runtime Tokens/Kosten nicht liefert, Usage=unknown und startbasierter Auftragsdeckel; keine erfundene Europräzision. Ein begrenzter Fachauftrag erhält zusätzlich ein Laufzeit-/Tool-/Dateiscope-Limit, Überziehen führt zur sichtbaren Pause/Abbruchanforderung, nicht zum blinden Retry.

Budgetempfehlung für eine eventuell nötige bezahlte Pilotroute:20Euro Inferenz-Testreserve, erst nach konkreter Auth-/Tarifklärung freizugeben. Späterer Zieldeckel50Euro/Monat zusätzliche Infrastruktur plus Inferenz als Startvorschlag, kein Anbieterangebot und keine Zusicherung ausreichender Kapazität. Tatsächliche Verbräuche/Preise ersetzen diese Annahmen vor Teamcloud. Warnschwellen50/80Prozent; eigene serverseitige Dispatchsperre bei100Prozent. Lokaler Speicher/Broker vermeidet zusätzliche Hostingkosten; bestehendes Abo, Strom und Arbeitszeit bleiben separat.

Lokaler V1-Betrieb benötigt den laufenden Mac. Managed-Teamcloud folgt in separatem internen Projekt, unabhängig von Schul-Live und Test. Keine vorgezogene IONOS-/VPS-Migration. Cloudhosting allein lässt lokale Fachworker bei ausgeschaltetem Mac nicht weiterarbeiten.


## 5. Produktoberfläche: Gespräch und Übersicht zusammen

Navigation: **Heute · Firmennetz · Ziele · Eingang · Bereiche · Aufgaben · Entscheidungen · Wissen/Konzepte · Verbindungen**. Heute und Bereichsgespräch sind gleichwertige Einstiege in denselben Task-/Execution-/Eventstore. Links zu Altchats sind ausschließlich ergänzende Quellen.

```text
GradeCrew              Heute | Eingang | Bereiche | Aufgaben           Suche
Bereiche               Bereich: Produkt/Web — Audio
Produkt/Web            Persistenter Verlauf mit Martin, Koordinator, Fachworker
Native/Secure          Martin: Prüft diesen Audiohinweis und legt den Befund ab.
Games                  Auftrag GC-… · Owner Audio/Web · Lauf 1 · Tool läuft
Pädagogik/Schule        Fachworker: Welche Browser-/Buildversion ist betroffen?
Kunden/Feedback        [Antwort eingeben] / [Freigabe prüfen]
Betrieb                Ergebnis: Diagnose + geprüfter Beleg + offener Gerätetest
Unternehmen            ──────────────────────────────────────────────────────
                       Nachricht an Bereich…          [Fragen / Beauftragen]
                       Rechts: dieselbe Aufgabe, Belege, Freigaben, nächster Schritt
```

Jeder konfigurierte Bereich besitzt ein dauerhaftes Produktgespräch. Bereichswechsel lädt Seiten statt Vollhistorie und beendet keine laufenden Jobs. Eingang ordnet bereichsübergreifende Anliegen einer federführenden Task zu; Fachteilaufträge und Rückmeldungen sind von allen berechtigten Ansichten erreichbar. Autorlabels unterscheiden Martin, koordinierende Rolle, Fachworker, Reviewer und Systemereignis. Keine unmarkierten Agentenantworten unter Martins Namen.

Composer erlaubt Fragen, Beauftragen und Antwort auf konkrete Rückfrage. Absicht und Ausführungsumfang sind sichtbar. Eine klare Bitte um Facharbeit erzeugt nach Rechte-/Ownerprüfung einen begrenzten ausführbaren Auftrag; eine Notiz oder untrusted Dokumentanweisung startet nichts. Bei Mehrdeutigkeit wird im selben Chat gefragt. Aufgabe/Owner, angeforderter Modellaufwand, Rechte und Budget sind bei Bedarf aufklappbar. Kein manuelles Kopieren in externe Chats als regulärer V1-Ablauf.

Streaming zeigt echte Runtimeereignisse; nach Reload erscheint der persistierte Verlauf. Laufende Aufgabe, wartende Freigabe und unbekannter Verbindungszustand bleiben beim Bereichswechsel und in Heute konsistent. Eine Approvalkarte bindet konkrete Aktion, Ziel/Dateipfade/SHA, Kostenrahmen und Ablauf an denselben Vorgang. Nach Prozessneustart wird geprüft, ob die Runtimeanfrage noch existiert; eine veraltete Approvalkarte startet keinen neuen Toolcall.

Heute zeigt drei nächste Schritte mit Begründung, Blocker/Entscheidungen, neue Feedbackhinweise und zuletzt belegte Lieferungen. Priorisierung zunächst deterministisch nach bestätigtem Incident, fälliger Ownerentscheidung und freiem nächsten Schritt. Aufgabenboard: Eingang / bereit / in Arbeit / wartet / zur Prüfung / abgeschlossen. Lebenszyklus und Releasebelege bleiben getrennt.

Ruhige GradeCrew-Marke, Text plus Farbe, Tastaturbedienung, responsive Desktop/iPad-Ansicht, keine HUD-Animation. Lokale Mac-V1 und spätere netzfähige Team-PWA sind getrennte Betriebsabnahmen. Als Nutzentest findet Martin eine zuständige Stelle in30Sekunden und kann eine Fachfrage ohne Produktwechsel stellen, beantworten und bis zum Ergebnis verfolgen.



**Firmennetz und Zielseite ab V1:** Das Netz startet bei Bereichen und aktiven Zielen; aufgeklappt werden nur der gewählte Bereich/Zielpfad und dessen direkte Querverbindungen. Stabile lesbare Knoten statt eines überladenen animierten Graphen; gleichwertige hierarchische Liste für Tastatur, Mobilgerät und viele Einträge. Ein Klick öffnet die Zielseite samt Gesprächskontext, Fortschritt, Meilensteinen, gültigem Konzept, Restarbeit und „Nächsten Schritt beauftragen“. Filter zeigen Priorität, Blocker, Owner und Quellalter. Es braucht dafür keine Graphdatenbank: Tabellen für Knoten/Beziehungen reichen zunächst.

Heute ergänzt **Zielzustand, wichtigste Veränderung seit dem letzten Besuch und Entscheidungsbedarf**. „Weiterarbeiten“ übernimmt Ziel-ID und Konzeptrevision in den Arbeitsbrief, nicht nur den Knotentitel. Neue Ziele lassen sich aus jedem Bereich oder im Hauptchat anlegen; der Kern schlägt vorhandene ähnliche Ziele zur Vermeidung von Dubletten vor. Alle Bereiche sind im Netz auffindbar, gesperrte Ziele/Inhalte werden durch ACLs ausgeblendet.


## 6. Erster vertikaler Durchstich: echter Bereichschat und Fachauftrag

**V1-Testfall:** Martin öffnet im Firmennetz ein vorhandenes Ziel „Audio zuverlässig nutzbar“, sieht Konzeptrevision, bestätigten Fortschritt und fehlende Meilensteine und beauftragt daraus den nächsten Schritt. Ein aktueller berechtigt gelesener Lehrerfeedbackfall wird dem Ziel zugeordnet und innerhalb der Firmenzentrale besprochen, ausgeführt, geprüft und entschieden. „Audio kaputt“ ist hier nur das illustrative Beispiel; im Plan wurde kein privater Hinweis abgerufen. Adminanmeldung und Auswahl eines zulässigen realen Falls erfolgen erst im später autorisierten Abnahmelauf.

1. Bestehender Feedbacklesepfad liefert Feedback-ID, Umgebung Schul-Live, Build/View und Zeit; Pagination/Umfang sind sichtbar. Daten bleiben untrusted. Das Backend übernimmt die vorhandene Rollenprüfung, kopiert kein Desktopcredential in den Browser und benötigt keine neuen Feedbackrechte.
2. Martin öffnet Bereich Produkt/Web oder schreibt im zentralen Eingang: „Prüfe diesen Audiohinweis, dokumentiere die Ursache und lass den Befund prüfen.“ Nachricht, Conversation-ID, goalId, conceptRevision und Client-Request-ID werden vor Ausführung gemeinsam gespeichert. Der Arbeitsbrief übernimmt vorhandene Ziele, Entscheidungen und belegten Stand, ohne erneute komplette Erklärung durch Martin.
3. Koordinator gleicht vorhandene Tasks/Owner ab und ordnet genau einen Auftrag zu. Ein passender bestehender Auftrag bleibt dieselbe Task; ansonsten berechtigter neuer Auftrag unter dem zuständigen Bereich. Auftrag nennt Scope, Owner, Daten-/Dateigrenzen, Abnahme und Budget. Der Koordinator selbst liest keine Shell und bearbeitet keine Dateien.
4. Broker startet einen eigenen Fachworker mit separatem Runtime-Thread/Checkout und serverseitigem Toolprofil: erlaubte Quell-/Statusleser und begrenzte Diagnose-/Testwerkzeuge; Schreiben ausschließlich eines Diagnoseartefakts im eigenen erlaubten Taskpfad. Ein Fixkandidat ist nur bei zusätzlichem entsprechendem Auftrag erlaubt. Keine Schul-Liveänderung und kein Deploy aus dieser V1-Abnahme.
5. Fachworker liefert echte Start-/Toolereignisse. Er fragt im Produkt nach fehlendem Browser/Build oder einem erlaubten Diagnoseschritt. Martin antwortet beziehungsweise entscheidet auf einer gebundenen Freigabekarte **innerhalb desselben Bereichschats**. Die Antwort wird an den konkreten wartenden Vorgang gegeben, kein neuer unabhängiger Auftrag gestartet.
6. Martin wechselt währenddessen zu Betrieb und zurück oder lädt neu. Verlauf, offener Request, Tool-/Ausführungszustand und Task-ID sind unverändert sichtbar. Verbindungsabbruch wird unknown; kein Doppelstart. Echte nachweisbare Ausführung ist Voraussetzung, nicht eine animierte Antwort.
7. Worker legt den begrenzten Diagnosebericht mit Quelle/SHA und tatsächlich ausgeführten Prüfungen ab. Ein separater berechtigter Reviewer prüft dieses unveränderliche Ergebnis; sein echter Lauf und sein Reviewstatus erscheinen verknüpft am Auftrag. Fehlender Review bleibt offen. Vorhandene PR-/CI-/Deploybelege werden komponenten-/umgebungsgenau angezeigt, kein neuer Deploy nur für diesen Test.
8. Ergebnis, Rückfragen, Freigaben und Belege stehen in demselben Gespräch und Taskdetail. Martin entscheidet dort den nächsten Schritt, etwa einen Fixkandidaten im getrennten Testscope zu beauftragen. Heute übernimmt diese Entscheidung aus denselben Records. Ein Diagnoseergebnis schließt keinen offenen Produktfehler automatisch. Nur wenn das konkret definierte Diagnosemeilenstein-Kriterium erfüllt und akzeptiert ist, wird genau dieser Anteil am Ziel-Fortschritt angehoben; der Kern zeigt verbleibende Tests/Freigaben.

**Harte Negativabnahme:** fehlende Runtime, nur Deep-Link, Copy/Paste in externen Chat, gespeicherte Nachricht ohne Worker, bloße Modellantwort ohne Tool-/Artefaktbeleg oder voneinander abweichende Heute-/Chatzustände = **V1 nicht erfüllt**. Bestehende Historie muss nicht vollständig importiert sein, eigene neue Produktnachrichten aber vollständig persistent und wiederaufnehmbar.

Abnahmereceipt verbindet goalId, goalRevision, conceptRevision, Feedback-ID, Conversation-/Message-ID, Task-/Request-ID, Owner, Worker-/Reviewexecution, Runtime-Turn-ID, Rückfrage/Approval-ID, Ergebnisartefakt mit Hash/SHA und Martin-Decision-ID. Private Nachrichtentexte bleiben außerhalb Git. Tests umfassen Doppelklick, alte Revision, Neustart, Accountablauf, unknown Startantwort, Rechteverweigerung und Workerfehler. Schlägt ein Gate fehl, bleibt es sichtbar offen. Zusätzlich verpflichtend: neues Ziel im Bereich anlegen, Meilensteine ändern mit sichtbarer Scope-/Prozentänderung, ein abgelehntes Konzept nicht wiederverwenden und im Hauptchat den bereichsübergreifenden Gesamtstand samt Quellen/Restarbeit abfragen. Nach Neustart muss „weiterarbeiten“ den gültigen Arbeitsbrief und dieselbe Zielrevision laden.


## 7. Datenmodell und Zustandsregeln

Die lokale Datenbank ist kein zweites Release-Register. Sie hält Cockpit-eigene Eingaben/Ereignisse und erneuerbare Projektionen; GitHub bleibt Autorität für Repo/CI, Release Control für Gateableitung, Originaldienst für Feedback. Feldbesitz verhindert Rückschreiben veralteter Kopien.

| Entität | Schlüssel und Pflichtfelder | Autorität |
|---|---|---|
| Area / Project | id, parentId, title, ownerId, visibility | Cockpitkonfiguration; bestehende Bereichs-/Projektzuordnungen importieren |
| Task | bestehende taskId, projectId, genau 1 ownerId, lifecycle, priority, nextAction, dependencies, sourceRef, revision | Repo-Task als Quellenprojektion; Produktauftrag mit stabiler ID sofort transaktional ausführbar gespeichert, spätere Git-Dokumentation separat synchronisiert; Feldbesitz/Revision verhindern doppelte Wahrheiten |
| Decision | id, taskId/projectId, question, options, proposed/approved/rejected/superseded, decidedBy, scopeHash, createdAt, supersedesId | Martin-/berechtigte Nutzerentscheidung im Cockpit, keine KI-Selbsterlaubnis |
| Goal | id, areaId, parentGoalId?, title, desiredOutcome, ownerId, priority, lifecycle, revision, acceptanceCriteria, conceptId?, nextMilestoneId?, optionalDueAt | Strategisches Produktobjekt; Entwurf/Vorschlag und bestätigte aktive Fassung getrennt, bestehende Tasks können beitragen |
| Milestone | id, goalId, goalRevision, resultDefinition, weight, acceptanceRule, acceptedBy?, acceptedAt?, evidenceIds, gateRequired | Nachvollziehbarer Ziel-Fortschritt aus akzeptierten Ergebnissen, kein Taskzählwerk |
| GoalRelation / TaskContribution | id, sourceId, targetId, relationType, owner, revision | Parenthierarchie zyklusfrei, Querverweise typisiert; gleicheTask kein doppelterMeilenstein im Rollup |
| ProgressAssessment | id, goalId, goalRevision, estimatedPercent?, rationale, assessedBy, assessedAt, evidenceRefs, confidence | Menschliche/markiert vorgeschlagene Einschätzung getrennt vom berechneten Nachweiswert |
| Concept / ConceptVersion | id, goalIds, areaId, version, contentRef, sourceRefs, status(draft/accepted/rejected/superseded), approvedBy?, changeReason | Gültige Fassung und konkrete Überarbeitungsentwürfe, keine stille Umschreibung der Entscheidungshistorie |
| KnowledgeEntry / BriefSnapshot | id, scope, kind(fact/decision/assumption/open_question), sourceRefs, validFrom, supersedesId?, ACL; Snapshot mit sourceVersions und dirtyState | Belegter gemeinsamer Kenntnisstand; Firmen-/Bereichsbrief ist erneuerbare Ableitung, nicht allwissendes Gedächtnis |
| Conversation | id, areaId, type(central/area/worker), ownerId, ACL, contextRevision, focusedGoalId?, latestSequence | Privates Produktgespräch, ab V1; Bereich/Koordinator und ausführender Worker sind getrennte Rollen |
| Message | id, conversationId, sequence, clientMessageId UNIQUE, actorId, actorRole, kind, content, createdAt, taskId?, goalId?, executionId?, replyToId?, contextRevision | Persistenter privater Inhalt; Version/Korrektur statt stiller Überschreibung; fehlgeschlagene/unterbrochene Antworten markiert |
| ConversationRef | id, conversationId, provider, hostId, remoteThreadId/URL, accessMode, capabilityCheckedAt, writerLease | Eigene Runtime-Threads ausführbar; Altchatreferenzen und freigegebene Imports klar getrennt |
| Clarification / Approval | id, conversationId, messageId, executionId, remoteRequestId, question/actionScopeHash, status, answeredBy?, answer?, expiresAt? | Antwort/Freigabe gebunden an konkreten noch gültigen Vorgang, keine globale Dauervollmacht |
| ContextImport | id, conversationId, sourceRef, sourceHash, approvedBy, importedAt, coverage, conflicts, supersedesId? | Freigegebener HDF-/Kontextauszug; keine Behauptung vollständigen Altverlaufs oder bidirektionalen Syncs |
| Execution | id, taskId, requestId UNIQUE, revision, dispatcher, state, remoteTurnId?, attempt, requestedModel/Effort, observedModel/Effort?, usage?, budget, startedAt?, heartbeatAt? | Ereignisse und Runtimeantworten; requested/configured/observed getrennt |
| Evidence | id, sourceType, sourceURL, sourceRevision, component, environment, observedAt, fetchedAt, outcome, integrity, supersededBy? | Unveränderliche Quellbelege; Prüfer erzeugt abgeleitete Aussage mit Beleglinks |
| FeedbackRef | sourceSystem+environment+sourceId UNIQUE, taskId?, sanitizedSummary, build, approval, fetchedAt, completeness | Originaldienst; Volltext nur minimal/privat und befristet |
| IntegrationGrant | id, provider, account/project binding, scopes, allowedActions, owner, expiresAt?, revokedAt?, credentialHandle | Rechteverwaltung; Secret nur im sicheren Server-/Hoststore |
| Event / Job | eventId, aggregateId, sequence, type, payloadVersion, causationId, requestId; Job mit leaseOwner/expiry | Append-only Audit plus transaktionale Outbox; keine unbegrenzten Vollpromptlogs |
| DocumentRef | id, ACL, sourceURL/hash, title, version, retention, summaryProvenance | Quelldokument; lokaler Index jederzeit neu baubar |

Releasekette bleibt exakt `branch_only → ci_green → integrated → staging_deployed → user_tested → production`, getrennt je Komponente/Umgebung. Fachlicher Boardstatus und Ausführungsstatus sind andere Felder. Execution: **draft → queued → dispatching → accepted → running → awaiting_approval/awaiting_input → succeeded/failed/cancelled**; **unknown** bei unklarer Zustellung/Verbindung. Ein Zeitablauf ist kein Beweis für Fehler oder Stop. `succeeded` heißt der begrenzte Auftrag endete erfolgreich; es bedeutet keinen Release.

„Agent denkt“ nur zeigen, wenn die Runtime genau diese Aktivität meldet; sonst „Agent aktiv“. „Tool läuft“ braucht Tool-/Jobereignis, „wartet auf Freigabe“ einen konkreten offenen Request. Pulsieren/Zeit allein sind keine Datenquelle.

Statusableitung: neuester vertrauenswürdiger Versuch für denselben Scope, dann exakte Repo-/Branch-/SHA-/Workflow-/Projekt-/Komponentenbindung, dann Belegvalidierung. Fehlgeschlagenen neuen Deploy nicht mit älterem grünem Receipt verdecken. Fehlender Receipt/403 ergibt unknown. Quellenkonflikte als Konflikt nebeneinander, kein stiller Maximalstatus. Überschrittenes Alter verändert Frische, nicht historische Wahrheit.

Vorgeschlagene Frischepolitik: während geöffneter Heute-Seite GitHub/Feedback höchstens alle5Minuten nach Bedarf; Conditional GET/ETag, serialisierte Abrufe, Backoff/Retry-After. Nach15Minuten ohne erfolgreichen Abgleich „veraltet“; historische Geräteabnahme mit Datum bleibt historisch, wird nicht als Liveprobe tituliert. Nach Workflow-/Webhookereignissen gezielt neu laden. Teamcloud später signierte Webhooks plus deliveryId-Deduplikation. [GitHub API Best Practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api).

Queries/Leseschnittstellen, als Vertrag für die Umsetzung:

- `GET /api/today?areaId=`: `nextActions[0..3]`, `decisionsNeeded`, `blockers`, `feedbackChanges`, `executions`, `deliveries`, je Element source/fetchedAt/freshness/completeness.
- `GET /api/tasks?projectId=&lifecycle=&cursor=`: eindeutige Taskprojektionen, keyset-Pagination, keine Vollhistorie.
- `GET /api/tasks/:taskId`: Task + EvidenceRef + ConversationRef + Decisions + letzte50Events, ältere per cursor.
- `GET /api/executions/:id/events?afterSequence=`: persistierter Ereignisstrom; Wiederanlauf ab letzter sequence, UI dedupliziert eventId. SSE ist Anzeige, Datenbank bleibt Quelle.
- `POST /api/requests`: taskId, expectedRevision, scope, requestId; transaktionale UNIQUE-Bindung; gleiches ID+Payload liefert gespeicherten Vorgang, gleicheID+andererPayload409.
- `POST /api/decisions`: expectedRevision und scopeHash; Konflikt409 statt stiller Überschreibung. Kein Remote-Toolaufruf aus GET.
- Heute-Query selektiert fällige Ownerentscheidungen, bestätigte Incidents/Blocker, danach offene unblocked nächste Aktionen; clientseitige Filter erweitern niemals ACL.

Produktnachrichten sind notwendiger privater Verlauf, keine Auditlogs. Ihr Inhalt wird mit Rollenrechten und geschütztem Datenträger gespeichert, standardmäßig bis bewusster Löschung/Archivierung; tatsächliche Retention vor Betrieb bestätigen. Audit/Usage enthalten nur Metadaten, keine zweite Volltextkopie. Modellkontext wird aus begrenzten aktuellen Nachrichten, versioniertem Bereichsbrief und relevanten Task-/Decision-/Evidence-Records zusammengestellt. Sichtbarer Chatverlauf bleibt auch erhalten, wenn die Runtime intern kompaktiert.

Zusätzliche V1-Verträge:

- `GET /api/areas/:areaId/conversation?cursor=` liefert berechtigte persistente Messages und Cursor, keine externen Chatlinks als Ersatz.
- `POST /api/conversations/:id/messages` nimmt clientMessageId, expectedRevision, intent, text und optionale taskId an. Message + gegebenenfalls Task/Execution + Outbox werden atomar gespeichert; Retry derselben ID erzeugt keinen zweiten Modellturn.
- `POST /api/clarifications/:id/answers` und `POST /api/approvals/:id/decisions` nehmen decisionId, expectedRevision und gebundenen Scope an; überholt409, unberechtigt403, abgelaufen explizit ungültig. Kein neuer unabhängiger Workerstart aus einer alten Antwort.
- Conversation-, Task- und Today-Events tragen dieselbe aggregateId/taskId/executionId plus monotone sequence. Der Browser materialisiert daraus Ansichten; freie KI-Zusammenfassungen überschreiben keine Statusfelder.
- `GET /api/company-map?areaId=&goalId=` liefert berechtigte Bereiche, Zielhierarchie und typisierte direkte Querbeziehungen; kein Laden aller Privattexte in die Netzansicht.
- `POST /api/goals` und `PATCH /api/goals/:id` nehmen proposalId/expectedRevision, Outcome, Owner und Abschlusskriterien an; Priorität/Scopeänderungen mit Actor/Grund versionieren, Dubletten/Zyklen ablehnen.
- `GET /api/goals/:id/progress` liefert goalRevision, acceptedWeight, totalWeight, derivedPercent, optionalEstimate, missingMilestones, blockers, freshness und evidenceRefs. Getrennte Felder verhindern das Vermischen von Bauchgefühl und Nachweis.
- `POST /api/concepts/:id/proposals` erzeugt einen versionierten Entwurf mit Änderungsgrund und betroffenen Zielen; Annahme/Ablehnung über gebundene Decision, danach invalidierte Arbeitsbriefe neu berechnen.
- `GET /api/briefs/company` und `GET /api/goals/:id/brief` liefern berechtigte Ziel-/Konzept-/Entscheidungsstände plus Quellenrevisionen/offeneWissenslücken. Sie ändern keineQuellobjekte.
- `buildWorkBrief(goalId, taskId, actor): WorkBrief` enthält gültige Konzeptfassung, Constraints, relevanteDecision-/Evidence-IDs und sourceVersions; abgelehnte/überholteFassungen werden nicht als gültig geladen. OhneZielbezug beginnt Eingang als zuzuordnenderVorschlag.
- Ein Chatturn und ein Fachjob sind verschiedene Vorgänge: eine normale Antwort kann succeeded sein, während die verknüpfte Fachaufgabe auf Prüfung wartet. Nicht jeder Bereich benötigt dauerhaft einen laufenden Agentenprozess.


## 8. Bausteine, Rechte und Betrieb

**UI:** vorhandenes Control-Layout/ESM wiederverwenden, Heute, persistente Bereichsgespräche, Eingang, Rückfragen/Approvals und Details ergänzen. Neue Module getrennt für Projektionen, Requests und Views. Kein eigenes natives Desktoppaket erforderlich; vorhandene Hülle optional weiterbenutzen. Lokales Web funktioniert am Mac, wird nicht automatisch zur erreichbaren iPad-PWA. HTTPS/Auth/Netzzugang ist erst Stufe 3.

**Lokaler API-/Connectorprozess:** ausschließlich Loopback, exakte Host-/Origin-Allowlist, CSRF-/Sitzungsschutz auch für zustandsbehaftete Aufrufe, keine CORS-Wildcard. Browser erhält keine GitHub-/Firebase-/Codex-Secrets. Task-/Statusadapter hinter definierten Methoden, fester Repo-/Projektbindung und Antwortgrößen-/Zeitlimits. Keine frei eingebbare URL/Shell in einem Connector. Start/Stop/Versionsstatus sichtbar; kein Hintergrunddaemon aus diesem Plan installieren.

**Queue:** lokale SQLite-Outbox mit atomarem Claim und Lease; pro Task/Thread1Writer. Idempotente lokale Verarbeitung, at-least-once Ereignisse, eindeutige Wirkung über Keys. Remote APIs bieten nicht automatisch Exactly-once. Bei verlorenem Remote-Startresultat `unknown`, nachschlagen statt erneut starten. Leaseablauf alleine erlaubt keinen zweiten kostenpflichtigen Start. Abbruch nur berechtigt und mit Runtimebestätigung; sonst „Abbruch angefragt“. Begrenzte read-only Retries, mutierende Starts nie blind wiederholen.

**AgentDispatcher:** nimmt nur freigegebene Taskrevision/Scope, Rechteprofil und Budget an. Koordinatorprofil darf Quellen lesen, Aufgaben zuordnen und begrenzte Fachaufträge erstellen; keine Shell-/Repository-/Deploytools. Fachprofile je Scope/Checkout; Reviewrolle read-only. Modellregel aus bestehendem Governor verwenden; kein extra Modellcall zum Klassifizieren. Werkzeugerlaubnis folgt Serverpolicy, niemals allein einem Prompt. Runtime meldet unbekannte Tool-/Approvalanforderungen sichtbar; kein „allow all“. PR206 ist der bestehende Runtimeentwurf; sein Owner liefert den qualifizierten Sendepfad bereits für V1. Vorhandene Ruletexte sind keine technisch durchgesetzten Rollenprofile: Rechte-/Tool-Gegentests gehören zur V1-Abnahme.

**Teamstufe:** eigenes privates Firebase/GCP-Projekt oder gleichwertiger Managed-Dienst; kein Mitnutzen der Teacher-App-Adminrolle als Firmenrolle. Rollen Owner(Martin), Bereichsbearbeiter, Reviewer, Leser; Zugriff sowohl Bereich als auch Aktion prüfen. Finanz-/Rechtsdokumente separat. Serverbibliotheken können Firestore-Rules umgehen: deshalb IAM und API-Autorisierung prüfen, nicht nur UI/Rules. App Check ist ergänzend, kein Ersatz für Nutzerrechte. [Firestore-Regelgrenzen](https://firebase.google.com/docs/firestore/security/rules-conditions), [App Check](https://firebase.google.com/docs/app-check).

**Sicherheitsgrenzen:** Verträge/Feedback/Repo/Chattexte sind untrusted und können keine Tools freigeben. Keine automatischen Anweisungen aus Dokumenten, kein Secretlesen zur „Verbindungshilfe“. Externe Schreib-/Deploy-/Kostenaktionen zeigen konkreten Scope/Empfänger/Zielrevision vor Freigabe; eine vorhandene explizite Auftragsfreigabe kann diesen Scope tragen, ohne ständig erneut zu fragen. Bei überholtem Scope neu bewerten. Protokolliert werden Akteur, Aktion, Quelle, Entscheidung, Ergebnis und Fehlercode, keine Geheimnisse oder vollständigen Privatprompts.

**Datenhoheit/Wissen:** Dokumente bleiben bevorzugt am Originalort; Index mit ACL, Zeit, Version und Löschreferenz. Entscheidungen als kompakte dauerhafte Records, nicht Vollchat in jeden Prompt. Anfangs Volltextsuche (SQLite FTS) über freigegebene Zusammenfassungen/Taskmetadaten. RAG erst, wenn gewöhnliche Suche einen konkret gemessenen Bedarf nicht deckt; ACL-Filter vor Retrieval, Quellzitate nach Antwort, unverifizierte Zusammenfassung als solche. Ein Chatimport braucht Nutzerauswahl/Freigabe und dokumentiert Herkunft/Abdeckung; es gibt kein Versprechen eines vollständigen „Gedächtnisses“.

**Sicherung:** lokale neue Daten täglich verschlüsselt exportieren; Zielvorschlag 7 Tages-/4 Wochenstände, DB plus Dokumentmanifest und Schema-Version. Wiederherstellung in getrenntem Ordner vor Teamfreigabe nachweisen, nicht nur Exportbutton. Quellbelege dürfen erneut geladen werden; eigene Messages, Bereichskontexte, Entscheidungen, Tasks, Requests und offene Rückfragen/Approvals müssen restaurierbar sein. Retentionvorschlag: Feedbackvolltext höchstens 30 Tage lokal, Auditmetadaten 90 Tage; Martin legt tatsächliche interne Aufbewahrung nach Datenbedarf fest, keine Rechtsfrist behauptet. Löschung umfasst Cache/Suchindex und läuft aus Backups nach deren Retention aus; restaurierte Altstände werden vor Benutzung mit Löschledger abgeglichen. Nutzerexport JSON/CSV/Markdown und Originalrefs, keine proprietäre Exportpflicht.

**Betrieb:** keine Überwachung pro Chatnachricht und keine kostenpflichtige Selbstbeschäftigung. Healthsignal pro Adapter, letzter erfolgreicher Sync, Warteschlangentiefe, Fehler nach Ursache, Token-/Euroverbrauch soweit geliefert. Betriebsjobs dürfen lesen/aufbereiten, erzeugen keine neuen Produktaufträge. Mac aus heißt lokale Fachausführung aus; spätere Cloudworker benötigen gesonderte Sandbox-, Rechte-, Budget- und Recoveryabnahme.

**V1-Runtimebetrieb:** Ein isolierter lokaler Broker mit offiziell unterstützter Auth; Browser spricht ausschließlich mit der Firmenzentrale, nicht direkt mit App Server/Modellanbieter. Pro Koordinator-/Workerrolle eingeschränkte Dienste/Prozesse und explizite Toolallowlists, keine promptbasierte Scheinsperre. Alle Write-/Shell-/Deploywerkzeuge fehlen im Koordinatorprofil. Worker erhalten ausschließlich ihren Taskscope; unbekannte Werkzeuge werden abgewiesen. Der Broker persistiert Ereignisse vor UIbestätigung und ordnet Remote-IDs zu. Nach Neustart zuerst Status/Historie prüfen, nur eigene clientverwaltete Threads resumieren, keine unklaren Aufträge neu absenden. Dies ist ein Bauauftrag im Plan, kein bereits nachgewiesener Runtimebetrieb.


## 9. V1-Lieferpakete und konkrete Umsetzungsschnittstellen

Gleiche Task GC-BRAIN-01, gleiche Versuchshistorie; Runtime-Teil mit GC-MODEL-GOVERNOR-01/PR206 abstimmen. Keine weiteren Chats oder Agenten aus diesem Plan starten. Paketpfade relativ zum vorhandenen `prototypes/gradecrew-control-local/`, sofern frischer Ownerabgleich diese Basis bestätigt. Bestehende äquivalente Module erweitern, keine zweite App daneben. Runtimepfade im bestehenden Workbench-/Brokerbereich gemeinsam festlegen; keine parallelen Writer.

**Global Constraints:** echter persistenter Bereichschat und ausführbarer Fachauftrag ab V1;1Owner jeTask/1Writer jeRuntime-Thread; Koordinator ohne Produkttools; echte Status-/Beweisereignisse; unknown verhindert erneuten Remote-Start; keine Authkopie/privaten APIs; keine Live-/Deployrechte aus Standardauftrag; private Inhalte außerhalb Git. Reviewfokus: Dubletten, Rechteausweitung, verlorene Antworten, überholte Approvals, divergierende Ansichten und Restore.

### P0 — Runtime-, Owner- und Rechtequalifikation, 8–14h

Owner: bestehende GC-BRAIN-01-Fachumsetzung, begrenzte Runtimezuständigkeit PR206. Lesen: aktueller Control-Branch/HDF, `tools/development_status.py`, `tools/release_control.py`, bestehende MCP-Reader und PR206. Produziert `CAPABILITIES.md`, Runtime-/Authentscheidung und genaue Dateizuordnung.

- [ ] Installierte Version, offizielle Auth im getrennten Profil, Ereignisse, eigene Threadpersistenz, Rückfragen und Approvals gegen dokumentierten Vertrag prüfen. Keine fremden Desktopthreads resumieren; bei Authgrenze stoppen und Alternative kalkulieren.
- [ ] Runtime-Port konkret binden: `startConversation(context,roleProfile)`, `sendTurn(threadId,input,requestBinding)`, `readExecution(id)`, `answerRequest(id,answer)`, `cancel(id)`; capability matrix markiert wirklich getestete Fähigkeiten.
- [ ] Koordinator/Worker-Profile und minimalen Fachauftrag festlegen; Werkzeug-/Scope-Gegentest als Gate. Reale Auth-/Inferencequalifikation nur nach ausdrücklich begrenztem späterem Ausführungsauftrag; heute nur Planung.

### P1 — Zielnetz, Fortschritt, Task-/Beweisspeicher und Heute, 24–40h

Dateien: `src/goals/{store.mjs,progress.mjs,relations.mjs}`, `src/views/{company-map.mjs,goal-detail.mjs}`, `src/store/migrations.sql`, `src/sources/project-reader.mjs`, `src/projections/today.mjs`, bestehender `server.mjs`; Tests `test/{today,goals-progress,goal-relations}.test.mjs`. Port `projectToday(records,now): TodayProjection` liest dieselben Tasks/Executions wie der Chat.

- [ ] Negative Fälle zuerst: altegrüneCI plus neuerFehler, falschesProjekt/SHA, fehlenderReceipt, veralteteQuelle und getrennteRegistry-/Aktivzählung. Ergebnis unknown/stale stattgrün.
- [ ] Ziel-/Meilenstein-/Relation-/TaskContribution-Records und Revisionen implementieren; Netz/Listennavigation und Zielanlage/Weiterarbeiten anbinden. Erst RED:2von4akzeptiert=50%, geschätzte65% verändernMesswertnicht, zusätzlicherScope4→5Kriterien senktWert nachvollziehbar, zurückgezogenerBeleg nimmtFortschrittzurück, zyklischeParentrelation wirdabgewiesen, QuerverweisdupliziertkeinenRollup, ACLverhindertgesperrteKnoten. Tests `node --test test/goals-progress.test.mjs test/goal-relations.test.mjs`.
- [ ] Task-/Evidence-/Execution-Records, Quellenadressen und Revisionen persistieren; bestehende Release-Control-Validierung verwenden; nurlesende externe Statusadapter.
- [ ] Heute/Taskdetail aufbauen; `node --test test/today.test.mjs` und vorhandene Pakettests prüfen, Scopecommit. Allein nochkeineV1.

### P2 — Bereichschat, zentraler Eingang und gemeinsamer Konzept-/Wissenskern, 30–50h

Dateien: `src/knowledge/{concepts.mjs,briefs.mjs,context-policy.mjs}`, `src/conversations/{store.mjs,service.mjs,context.mjs}`, `src/views/{area-chat.mjs,inbox.mjs}`, Chatmigration in `src/store/migrations.sql`; Tests `test/{conversations,knowledge-context,concept-revisions}.test.mjs`.

- [ ] RED-Tests für Nachricht speichern→Neustart→Verlauf, Bereichswechsel währendLauf, Pagination, Nachrichtendubletten, fremdeACL und Model-/Toolfehler.
- [ ] Abschnitt7-Verträge implementieren: atomare Message/Request/Outbox; zentrale Routingzuordnung und explizite actorRole. Bereichsfragen über P0-Runtime beantworten, ohneProdukttools desKoordinators.
- [ ] Konzeptfassungen und Wissensobjekte mitQuellen/ACL speichern; bestätigtePrioritätsänderung inFirmen-/Zielbrief übernehmen. Erst RED:neuerChat kennt gültigesKonzept ohneWiederholung, rejected/superseded wirdnichtgeladen, fremdeFinanznotiz fehltimGamesbrief, widersprüchlicheQuelle ergibt offenesWissenstattErfindung, Scopeänderung aktualisiert Kontextrevision, AufgabeändertGoalstatusnurüberBeleg. Tests `node --test test/knowledge-context.test.mjs test/concept-revisions.test.mjs`.
- [ ] Kontextversion/HDFimport mit Herkunft/Umfang, Message-/Eventstream und Retrydarstellung implementieren. Chat und Heute zeigen dieselbeTask/Execution; `node --test test/conversations.test.mjs` plus Pakettests. Ein Chat ohneFachworker erfülltV1noch nicht.

### P3 — Ausführbarer Fachauftrag, Rückfrage/Freigabe und Rückmeldung, 24–40h

Dateien: `src/executions/{dispatcher.mjs,outbox.mjs,policy.mjs}`, `src/conversations/pending-requests.mjs`, `src/views/approval-card.mjs`; Runtimeadapter mit PR206-Owner, Tests `test/{dispatch,approval-flow,role-boundaries}.test.mjs`.

- [ ] Erst Fehlerfälle nachstellen: verlorenesStartACK→unknown/keinRetry, Doppelklick→1Job, fremde/alteApproval→403/409, abgelaufenerGrant→keineAusführung, Dokumentprompt→keineRechte, Koordinator→keinShelltool.
- [ ] Servergebundene Rollen,1Writer-Lease, Budget-/Versuchslimits, Taskclaim und echte Worker-/Toolereignisse umsetzen. Worker erzeugt begrenztes echtes Artefakt, nicht nurAntworttext.
- [ ] Rückfrage und Approval mit remoteRequestId/Execution/Scope persistieren und imgleichenBereich beantworten; Fortsetzung desselbenVorgangs; Ergebnis und Reviewerauftrag an identische Task binden.
- [ ] Neustart/Cancel/Quota-/Toolfehler und blockierteweitereBereiche prüfen. `node --test test/dispatch.test.mjs test/approval-flow.test.mjs test/role-boundaries.test.mjs`, Pakettests, Scopecommit. KeineDeployroute.

### P4 — Echter V1-Durchstich, Recovery und Abnahme, 16–26h

Dateien: `src/sources/feedback-reader.mjs`, `src/store/backup.mjs`, `test/{v1-flow,restore,projections-consistency}.test.mjs`, anonymisierter `V1-ACCEPTANCE.md`. Ports ausP0–P3, keine neueZustandslogik daneben.

- [ ] Zielanlage/Netznavigation/Fortschrittsänderung/Konzeptüberarbeitung und Chefbrief ohne erneuteEinweisung in V1-Abnahme aufnehmen. Erst synthetisch vollständigen Abschnitt6-Ablauf prüfen, einschließlich Nachricht→Task→Worker→Rückfrage/Approval→Ergebnis/Review→Martinentscheidung und Bereichswechsel/Reload.
- [ ] Nach berechtigter Live-Adminanmeldung und begrenztem Runtimebudget genau einen realen Feedbackfall im Produkt bearbeiten; reale Tool-/Artefakt-/Reviewbelege und gegebenenfalls vorhandeneGit-/CI-/Deployreceipts sauber unterscheiden.
- [ ] Export/Restore vonMessages/Decisions/Tasks/Requests, wartendemVorgang und Quellenmanifest imisoliertenZiel prüfen; offeneRemoteaktionen abgleichen stattneustarten.
- [ ] Tests `node --test test/v1-flow.test.mjs test/restore.test.mjs test/projections-consistency.test.mjs`, unabhängiger Rechte-/Recoveryreview und Martins Produktdurchlauf. Kein Erfolg ausMocks allein. Erst danachV1 alltagsfähig.

P0–P4:102–170h Facharbeit plus18–34h übergreifenderReview/Nacharbeit =120–204h. Es gibt keine abgeschlosseneV1 nachP1/P2 und keinen Ersatz durchDeepLinks.

### P5 — Nach V1: Fachprofile, Teamcloud und Firmenfunktionen

- [ ] Phase2: zusätzlicheProfile jeOwner/Toolscope und ein echterAbnahmefall; bestehe Analyticsarbeit nurüber derenfreigegebenenAggregatvertrag konsumieren.
- [ ] Phase3: privatesManagedprojekt, Auth/Rollen, HTTPS/iPad, sichereGrant-/Secretverwaltung und Cloudrestore; tatsächlicheCloudworker beiMac-off separatqualifizieren.
- [ ] Phase4: eineIntegration proBedarf mitRechten/Widerruf/Löschung/Export. KeineeigeneTracking-/Schulplattformmigration.


## 10. API-Machbarkeit und Integrationsreihenfolge

| Quelle/Funktion | Belegt | Grenze / Konsequenz |
|---|---|---|
| Codex App Server | Offizielle Docs: thread/list/read, paginierteTurns, resume, turn/start, Events und Approvals; lokale `codex app-server --help` bestätigt CLI/stdio/Transporte | EinProtokoll ist keine beliebigeDesktop-/Cloudberechtigung. Version/Auth/Host und benötigteTools konkret qualifizieren; V1 benötigt eigene qualifizierte Runtimecalls; Desktopübernahme bleibt separat. |
| Codex SDK | OffiziellesSDK dokumentiert programmgesteuerteThreads und `resumeThread` | Gut füreigeneTasks, ersetztkein universellesChatGPT-ArchivAPI oder sämtlicheDesktoptools. |
| ChatGPT-/Work-Verläufe | In diesem Codexhost vorhandene Chatlesewerkzeuge können berechtigte ausgewählte Referenzen lesen | Keine allgemeine Produkt-API-Zusage daraus ableiten. Alte Chats zunächst Link/HDF, expliziter Import alsfreigegebene Zusammenfassung. Kein Scraping/Sessiontokenzugriff. |
| EigeneAPIgespräche | Offizielle [Conversation-State-Dokumentation](https://developers.openai.com/api/docs/guides/conversation-state) als alternative V1-Runtimeoption bei separater Technik-/Budgetentscheidung | EigenständigeAppgespräche; bestehendeDesktop-/ChatGPT-Historie wird dadurch nicht automatisch verbunden. VorImplementation separateAPI-/Budget-/Authentscheidung. |
| GitHub | Verfügbare Connectorlesezugriffe und heutiger Audit; REST/Webhookpfade offiziell | Produktinstallation/Grant später separat; vorhandener Chatconnector ist kein automatisch weitergebbares Appcredential. Anfangs Contents/PR/Actionsread, keine Administration-/Secrets-/Deployrechte. |
| Firebase Feedback | Bestehender Adminreader mitklarer Livebindung und Pagination im Quellcode | Keineaktuelle Anmeldung hier, daher keinprivater Abruf. Nicht unbemerkt auf Testfeed umschalten. |
| PostHog | Connector verfügbar, bestehender Analyticsowner/PR 263 | Weder Kontozugriff nochfertiger Aggregatvertrag hierbelegt; nurdessen bestätigte Leseschnittstelle integrieren. |
| AppStoreConnect | Native/TestFlightreceipts können über vorhandene GitHubpipeline referenziert werden | Direkter AppStoreConnector/Accounts/Rechte hiernichtgeprüft; V 1 keineneue Verbindung. Upload≠Geräteabnahme. |
| M365/OneDrive/Mail/Kalender/Finanzen | Bedarf erkennbar, nicht als verbundene Dienstefestgestellt | Plugin/Connector/Accountberechtigung später prüfen; keine erfundenen Scopes oder Schreibfähigkeit. |

Offizielle Quellen am 21.10.2026 geöffnet: [App Server](https://learn.chatgpt.com/docs/app-server), [SDK](https://learn.chatgpt.com/docs/codex-sdk), [Codex Platform](https://developers.openai.com/blog/codex-as-a-platform), [GitHub API](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api), [Firestore Rules](https://firebase.google.com/docs/firestore/security/rules-conditions), [App Check](https://firebase.google.com/docs/app-check). Conversation-State-Dokumentation wurde ebenfalls geöffnet; vor entsprechender Umsetzung frisch prüfen. DokumentierteFähigkeit, installierteVersion, Kontoentitlement und erfolgreicherRealbetrieb sind viergetrennteNachweise.

## 11. Entscheidungen und nächste Freigabe

**Bereits entschieden:** Zielnetz mit nachvollziehbarem Fortschritt, gemeinsamer Konzept-/Wissenskern, Bereichschat und ausführbare Delegation sind V1-Pflicht; alle Kommunikation bis zum Ergebnis im Produkt. Zentrale koordiniert, Fachworker führen aus. Kein Links-Dashboard als Abschluss und keine ungefragte Produktimplementierung. Diese Entscheidungen werden nicht erneut zur Auswahl gestellt.

Technische Empfehlung: lokal-first eigenes Produkt mit eigenen Codex-App-Server-Threads und getrenntem Profil nachPR206; Altverläufe nur ergänzend freigegeben übernehmen. Runtime/Auth/Tools werden vor Implementierung in P0 konkret qualifiziert. Scheitert diese Variante, werden Aufwand, Datenhaltung und Abrechnung der offiziellen APIalternative vorgelegt; der Funktionsumfang wird nicht still reduziert.

Zwei notwendige Betriebsentscheidungen vor entsprechenden späteren Aktionen:

1. Vor realer Qualifikation: konkreter unterstützter Runtimezugang und begrenztes Nutzungs-/Kostenbudget, einschließlich eventuell nötiger20Euro-Testreserve. Empfehlung: vorhandenen unterstützten Zugang zuerst prüfen, kein automatischer Kauf oder Key.
2. Vor Teamcloud: tatsächliche Nutzer/Endgeräte und Hosting-/Daten-/Monatsbudget. Empfehlung: zunächst Martin lokal, Teamzugriff erst nachV1-Abnahme.

**Nächster autorisierter Schritt:** Plan auf GitHub sichern; Zentrale prüft den vollständigen V1-Zielnetz-/Wissens-/Chat-/Delegationsablauf und verteilt nach bestandener Prüfung die Umsetzungspakete an vorhandene zuständige Fachchats. Diese Verteilung ist von Martin autorisiert. Keine Liveänderung, neue Konto-/Provideraktivierung oder unbegrenzte kostenpflichtige Qualifikation daraus ableiten.


## 12. Liefer- und Prüfstatus dieser Planrevision

Revision3 ergänzt die Ziel-/Fortschritts-/Konzept-/Firmenwissensebene zur bisherigen Revision2 und ersetzt den alten V1-Zuschnitt in Empfehlung, Vergleich, Roadmap, Navigation, Durchstich, Datenmodell, Runtime und Lieferpaketen. Frühere Commits bleiben Historie; es gibt keinen neuen Task und keine parallele Produktplanung. Produktnachrichten sind nun explizit persistente Erstklassobjekte, Rückfragen/Freigaben gehören zur ersten Abnahme.

Aktueller Main-Einstieg und Regeln erneut gelesen auf `2324652c6fe2870f4f3f85e2f2a65713179db34d`; Priorität1 „Zentralen delegieren jeden Auftrag“ enthalten. Development-Status-Lauf39642098842 auf diesemSHA completed/success, Metadaten gelesen; kein neuer vollständiger Auditlog in dieser Revisionsrunde. PR206 weiterhin offen/Draft, Head5d766b818fa181e7cc36ff15b6402d9e19b727e0. Offizielle App-Server-/SDK-Dokumentation erneut gesucht und geöffnet; keine Runtimeanmeldung/Inferenz getestet. Ursprüngliche lokalen Plancommits8d6e0f9 undcd9164a bleiben erhalten.

Nur Dokumentation wird geändert. Keine Produktdatei, Account-/Provider-/Hookaktivierung, kein Altchatimport, bezahlter Start oder Deploy. Kein Softwarefertigstatus. Martin hat die GitHub-Sicherung einschließlich dieses internen Plans ausdrücklich freigegeben und die Zentrale mit V1-Prüfung plus anschließender Verteilung beauftragt. Die frühere Exportblockade ist durch diese Nutzerfreigabe aufgelöst. Aktueller Main2324652c wurde auf den eigenen Dokumentationsbranch übernommen; TODO-Konflikt additiv als vollständigerMain plus eigenerAbschnitt gelöst. Nur die vier eigenen Planungs-/Zuordnungsdateien dürfen gegenüber diesemMain abweichen. Kein Produktmerge oder Deploy; mainbleibtunverändert.

Planprüfung muss Zielnetz/Fortschritt/Konzept-/Wissenskern und Chat-/Delegationskern →Datenobjekte→Schnittstellen→P0–P4 abdecken und jede alte „Bereichschats erst später“-/Linkersatz-V1-Aussage entfernen. Dokumentationschecks und finalen lokalen Commit in der bestehenden Übergabe sichern.
