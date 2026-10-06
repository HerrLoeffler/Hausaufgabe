# GC-BRAIN-01 – Videoanalyse und GradeCrew-Entwicklungszentrale

## Chat-Testnachricht tatsächlich empfangen – 06.10.2026

Der Nutzer hat den Test ausgelöst. Echte Folgenachricht aus visualization-7e2e54eb9210ded7 mit Anfrage GC-CONNECT-132eaaf2-85d5-4edd-a3e3-7a7ef63ab84f und Text „Hallo GradeCrew Central“ in der Zentrale empfangen. Empfang und Antwort in derselben Kartendatei gespeichert, Rückgabe als erneut eingeblendete Karte. Die Bestätigung der sichtbaren Rückantwort durch Martin bleibt offen. Kein Beweis einer Live-Aktualisierung des alten Frames oder der Plugin-Verbindung. Keine Analytics-Bearbeitung aus altem Widget-State. Lokaler Commit c4a8d12, Syntax und konkrete Antwortdaten frisch geprüft. Aufgaben-ID, Plugin-Versuchszähler2/3 und Budgets unverändert; kein Produktauftrag/Deployment. Eine zunächst zu breite Textprüfung fand einen unveränderten Pending-Text im nicht ausgeführten Sende-Code; gezielte Prüfung sichtbarer Ausgabe und JSON-Daten bestanden.

## Echter Chat-Verbindungstest vorbereitet – 06.10.2026

GC-BRAIN-01 bleibt bestehen. Lokales Plugin ist weiterhin nicht als nutzbarer Host-Panel-Weg nachgewiesen; aktuelle Werkzeugliste enthält dessen vier Werkzeuge nicht. Früheren Neuladehinweis nicht als bestätigte Lösung wiederholen. CUA verweigert die Bedienung von com.openai.codex, kein Umgehungsversuch. Stattdessen ein expliziter Test mit dem bereits vorhandenen Chat-Folgenachrichtweg: eine Karte, eine Request-ID, Empfang erst nach echter Nachricht bestätigen und Antwortkarte erneut anzeigen. Originalframe-Liveupdate und Plugin-Anbindung bleiben getrennt offen. Martin muss den Testknopf/Bestätigungsdialog bedienen. Syntax/Element-IDs und begrenzte simulierte Interaktionen geprüft; noch kein echter Empfang. Neuer Development-Audit 37391289398 / 112036708547 gelesen, Aufgabenbranch zuvor 2952717f. Lokaler Zwischencommit 0020306. Kein Produktcode, Modell-API, Deployment, neue Budgetrunde oder Zurücksetzen der Plugin-Reparaturhistorie2/3. Details und Wiederaufnahme: [CONNECTION-TEST.md](../prototypes/gradecrew-control-local/CONNECTION-TEST.md).

## Plugin umgesetzt und lokal installiert – 06.10.2026

Martin hat den Bau der integrierten Zentrale ausdrücklich beauftragt. GC-BRAIN-01, bestehender Branch und Aufgabenhistorie erhalten. Ausführung im isolierten lokalen Prototyp; keine Änderungen an Schüler-/Produktcode.

- Version0.2.2: portables plugin.json/mcp.json, stdio-MCP-Adapter, global/thread UI-Ressource und vier Werkzeuge für Übersicht, Aufgabe, Standfrage und Antwort. Bestehender lokaler Dienst bleibt alleiniger Dateischreiber.50 bestehende Snapshot-Aufgaben, Funktionen/Anwendungen/Zuständigkeit unabhängig gefiltert.
- Protokollweg: Frage mit Request-ID und Quellenrevision speichern, explizit ui/message an aktiven Chat, Antwort per model-only gradecrew_answer zurück. Keine Modell-API, kein automatischer Modellwechsel, keine Codebearbeitung aus Standfragen. Antworten ändern keinen Release-Status.
- Installierte Quelle gradecrew-local, Paket gradecrew-central@gradecrew-local0.2.2; CLI list bestätigt installed=true/enabled=true. Tatsächlicher installierter Launcher geprüft: initialize/tools/list/gradecrew_open/resources/read erfolgreich,50 Aufgaben,0 echte Testfragen, UI-Ressource geladen.
- Alte lokale Daten vor Dienstneustart gesichert. Alter PID27261 via Kommando+cwd geprüft, nur dieser Dienst beendet. Auto-Start des kompatiblen Dienstes aus installiertem Paket nachgewiesen.
- Baseline3/3, final8/8 Node-Tests und8/8 simulierte DOM/Host-Regressionen bestanden. Beide getrennten Reviewer haben finalen Code0897050384769162db4e9bcc2e46a0704f58c87d ohne weitere Befunde bewertet. Kein Browser-/Gerätetest oder gesamter Security-Audit behauptet.
- Reparaturzähler dieser Plugin-Umsetzung2/3: zuerst Formularverlust/unklareDoppelsendung/Verbindungscache; danach bekannteSpeicherablehnung von unbekanntemÜbertragungsresultat getrennt. Frühere Task-/Budgethistorie bleibt erhalten, keine Provider-Aufrufe oder neue Kostenreservierungen.
- Frische Main-Regeln gelesen. Aktueller Development-Audit37387706779/job112025093083 erfolgreich; bekannte Warnungen über unklassifizierte Branches/abweichende Ziele, keine Produktdateien in diesem Scope übernommen.
- Release weiterhin branch_only; keine CI-/Integration-/Staging-/Production-Stufe neu behauptet. Neue private Daten und installierter Cache bleiben außerhalb Git. Ausführliche Dateien PLUGIN-PLAN.md und PLUGIN-VERIFICATION.md.
- Offene Abnahme: im echten Client Plugin neu laden/gegebenenfalls Desktop-App neu öffnen, GradeCrew Central öffnen, eine Standfrage tatsächlich aus dem Panel senden und gespeicherte Modellantwort dort bestätigen. Neu installierte Werkzeuge stehen diesem bereits laufenden Turn noch nicht als native Tools zur Verfügung. UI-Sperre nicht durch Alternativautomation umgangen.
- Cloud-Arbeit bei ausgeschaltetem Mac, automatische GitHub-Synchronisierung und Implementierungsaufträge direkt aus dem Panel bleiben Folgeumfang. Der Katalog ist ausdrücklich datiert; Aktualisieren lädt denselben lokalen Bestand und neue Fragen/Antworten.

Genau nächster Schritt: reale Host-Panel-Abnahme nach Plugin-Neuladen; vorhandenen Code/Installation verwenden, keine erneute Plugin-Implementierung.

## Vertiefte Zentrale und fachliche Konsolidierung – 06.10.2026

Nutzer möchte Vor-/Nachteile und bestmögliche einfache Zentrale sowie tiefere inhaltliche Chat-Bereinigung. Bestehende Task-ID GC-BRAIN-01, Budget-/Versuchshistorie unverändert; reine Dokumentations- und Organisationsrunde.

- Empfehlung: integrierte App als Sidebar und Conversation-Panel mit gemeinsamem Aufgabenbestand, freie Eingabe im Zentralchat ebenfalls möglich. Drei Ebenen Funktion/Aufgabe/Ausführung; elf fachliche Zielbereiche, aber keine leeren neuen Chats angelegt. CENTRAL-STRATEGY.md enthält Vergleich, Bedienung, Datenquellen, Grenzen und Abnahme.
- Drei vorhandene Chats umbenannt: GC · Internationalisierung, GC · Schüler, Klassen & ASV, GC · iPhone & iPad; Zuordnung in coordination.json aktualisiert.
- Ältere Internationalisierungs- und Schülerkonzept-Gespräche in zwei begrenzten Nachrichten an jeweilige Fachchats zusammengefasst. Beide bestätigten Eingang und keine Widersprüche. ASV-Kennung und Lehrkraft-Vorschau bleiben ausdrücklich offen. Keine Produktarbeitsrunde ausgelöst.
- Erst nach Empfang die ChatGPT-Quellchats Internationalisierung GC und Schülerintegration Codekonzept archiviert; beide Werkzeugantworten archived=true. Originale/Anhänge erhalten, keine technische Verschmelzung. CONSOLIDATION.md enthält Original-/Ziel-IDs und Empfangsrunden.
- Gemischte offene Chats bleiben erhalten: Games enthält PostHog, MONEY enthält mehrere Bereiche, iOS-Native-Wunsch ist noch keine neue Architekturentscheidung. Design GC erneut beim Verschieben mit Ladezeitüberschreitung; unverändert.
- Nur angemessene Dokumentationsprüfung: JSON gelesen, git diff --check. Keine Produktcode-, API-, Test-, Sicherheitsreview-, Merge- oder Deployrunde. Keine neue unabhängige Prüfung dieses vertieften Entwurfs behauptet.
- Weiter branch_only. Native Plugin-Verbindung, tatsächlicher Modellwechsel und Abo-Cloud-Ausführung noch nicht nachgewiesen. Nächster Schritt: bestehende Plugin-Recherche abgleichen und genau eine lesende Aufgabenfrage mit bestätigtem Hin-/Rückweg testen, anschließend Wiederholungs-/Verbindungsfehler. Keine Production-Freigabe.

## Chat-Aufräumen, zwei Prüfer und Plugin-Oberflächen – 06.10.2026

Nutzerauftrag: GradeCrew-Chats aufräumen, nach Funktionen organisieren, unabhängige Prüfer einrichten; Sidebar-Apps/Conversation-Panels gewinnbringend einbeziehen. GC-BRAIN-01 unverändert.

- Maximal 50 jüngste nicht angeheftete Chats plus angeheftete Elemente inventarisiert. Ausgewählte GradeCrew-Inhalte gelesen; keine vollständige historische Kontoanalyse behaupten.
- Drei native Sidebar-Bereiche angelegt: GC · Funktionen (5 Einträge), GC · Betrieb & Qualität (6), GC · Wissen & Planung (7). Alle 18 Einträge und angeheftete GradeCrew Zentrale über list_threads zurückgelesen. Teilweise Client-Aliasse in Section-Keys, erfolgreiche Einzel-Receipts vorhanden. Keine neuen Fachchats erstellt.
- Vier Codex-Einzelfragen nach Abschlussprüfung archiviert und durch list_archived_threads bestätigt: Begründe ChatGPT Business, Ollama fürs Projekt bewerten, Antwortleitlinien in Gradecrew ergän, Zeichen identifizieren. Erkenntnisse und ursprüngliche IDs in ORGANIZATION.md/chat-organization-20261006.json gesichert; keine Daten-/Code-/PR-Löschung.
- Vier Titel präzisiert: Main CODEX (w) -> GC · Automatisierung & Integration; Main GC (no w) -> GC · Fehler & Rückmeldungen; Spachfunktionen GC -> GC · Audio & Sprache; New Chat GC -> GC · Wiederaufnahme & Vorlagen. coordination.json aktualisiert, alte Titel dokumentiert.
- Ausnahme: Design GC blieb nach zwei ChatGPT conversation load timed out in der bisherigen Ablage. Erster sequenzieller Verschiebeaufruf nach Timeout beendet, danach tatsächlichen Zustand abgeglichen. Kein Sicherheitsreview-Block, kein Grund für eine neue Nutzerfreigabe. Übrige Einträge erfolgreich einsortiert.
- Offene Arbeiten erhalten: GC-AUTOMATION-08/PR126, i18n-Umsetzung, ASV-Entwurf, BugOps, fehlgeschlagener iOS-Statuscheck und offener Gesamtauditauftrag; keine automatische Wiederholung. Aktive Plugin-Recherche GC-PLUGINS-01 nur einsortiert, nicht neu gestartet/unterbrochen.
- Zwei tatsächlich gestartete unabhängige, rein lesende Unteragenten prüften den Strukturentwurf und das Review-/Panelprotokoll anhand abgegrenzten Kontexts. Ergebnisse eingearbeitet: offene Audits sichtbar, klare aktive vs historische Zuständigkeit, gleiche unveränderliche Kandidaten, definierte persistente Versuchszählung, keine Mehrheit über einen Sicherheitsbefund, keine erfundene technische Rechteisolation.
- ORGANIZATION.md und scoped AGENTS.md enthalten ab jetzt den Ablauf für zwei Reviewer bei substanzieller Arbeit: Funktion/Tests und Sicherheit/Randfälle. Höchstens drei Reparaturversuche, strengere vorhandene Gates gehen vor. Kein installierter Hook/Daemon, keine globale Erzwingung für alle Chats. Kleine Textarbeit angemessen normal prüfen; zusätzliche Abo-Nutzung transparent.
- Bestehender Guardian mit seinen drei Reviews/Budgetprofilen bleibt unverändert. Keine bezahlten Modellaufrufe, keine neuen Automationen, keine Integration/Deploys.
- Extension-Dokumentation bestätigt globales Sidebar-App-Entrypoint, Thread-Panel, Deep Links und Model-App Context. Empfehlung 9/10 nach Bedienbarkeit, Wiederverwendung, direkter Kommunikation und Betriebsaufwand. Tatsächliche registrierte Plugin-Anbindung weiter offen. Context-Auswahl ist keine Arbeitsautorisierung; gespeicherte Request-ID/Revision und belegte Statusübergänge erforderlich.
- Geprüft: main-Regeln mit unveränderten bekannten Blob-SHAs, Development-Status-Run 37374686618 inkl. Joblog 111980194806; lokale JSON-Konsistenz, eindeutige Chat-Routen, Archiv-IDs, Bereichszahlen, Koordinator-Pin und git diff --check. Kein neuer Produktcode, daher keine Wiederholung der App-Tests oder Behauptung eines Code-Sicherheitsaudits.
- Ausführlicher Entwurf: prototypes/gradecrew-control-local/ORGANIZATION.md. Reversibler Ablage-/Titel-/Archivnachweis: chat-organization-20261006.json. Scope lokal/Prototype-Branch, Release bleibt branch_only.

Nächster konkreter Schritt: Für genau eine Standfrage (GC-I18N-03) die registrierbare Plugin-Brücke mit der laufenden Plugin-Recherche abgleichen und den tatsächlichen Eingang/Rückweg im vorhandenen Client testen. Mac-unabhängige Ausführung bleibt eigener offener Baustein.

---

## Vereinfachung, Sites-Einordnung und Hauptchat – 06.10.2026

Nutzer möchte die bestehende App behalten, Bedienung stark vereinfachen und Kommunikation mit ChatGPT herstellen. Fragt nach Sites und einem Hauptchat, der an passende Fachchats verteilt.

- Aktueller Chat 01a10df6-736b-7a62-bd38-2724cf254c2e mit set_thread_title erfolgreich zu „GradeCrew Zentrale“ umbenannt. Rolle: ausdrücklich vom Nutzer angestoßene Koordination, kein eingerichteter autonomer Hintergrundagent.
- coordination.json enthält vorhandene Codex-Routen für Internationalisierung, ASV-Architektur, Guardian/Integration und iOS; bisherige ChatGPT-Chats für Design/Games/Sprache als ungeprüfte Referenz-/Kontextchats erfasst. Titel wortgetreu aus list_threads. Keine Facharbeit delegiert oder bestehende Chats gelöscht/archiviert. Main CODEX (w) hat die laufende GC-AUTOMATION-08-Arbeit; nicht überschreiben.
- read_thread von Main CODEX (w) und GC-I18N-03 fortsetzen gelesen: Abschlussberichte sind Hinweise; CI-/Git-Nachweise vor neuem Auftrag erneut prüfen. Keine alten Ergebnisse als neuer Release-Stand übertragen.
- Direkte in-conversation Aufgabenansicht unter der lokalen thread-scoped Visualize-Datei gradecrew-chat-zentrale.html erstellt; Quellfragment unter prototypes/gradecrew-control-local/chat-central.fragment.html gesichert. Enthält 50 Task-Snapshot-Einträge, Bereichs-/Aufgabenwahl, Text, Modellwunsch und bewusste Folge-Nachricht über window.openai.sendFollowUpMessage. Feature-Erkennung und sichtbarer Text-Fallback, Doppelübergabe im aktuellen Frame begrenzt; kein stiller API-Aufruf. Eingehende Folge-Nachricht enthält Task-ID und konkrete Frage/Änderung sowie klare Delegationsgrenzen.
- Keine Behauptung einer erfolgreich eingegangenen Nachricht: erst Nutzerklick und tatsächlicher Chat-Eingang belegen dies. Keine feste Sidebar oder Plugin-Installation durch ein Inline-Fragment vortäuschen. Ansicht ist ein Snapshot; nach Arbeit neu rendern. Kein direkter Zugriff aus dem Fragment auf lokale API, keine Cloud-/Live-Synchronisierung.
- JSON, IDs/Elementreferenzen und JS-Syntax geprüft; Host-Übernahme und visuelle Abnahme weiterhin nicht E2E geprüft. Bestehende CUA-Browserrichtliniensperre nicht umgangen.
- Sites für jetzigen Ausbau nicht zwingend nötig. Vergleichskriterien: Wiederverwendung, einfache Bedienung, direkte Chat-Kommunikation, neue Betriebsabhängigkeiten. Bestehende App + geprüfte Chat-Anbindung empfohlen (9/10); sofortiger Sites-Umzug (6/10) ermöglicht Hosted-Zugriff/Sharing, bringt Beta-/Kontingent-/Berechtigungsgrenzen und ersetzt keinen Codex-Worker.
- Offizielle Quellen geöffnet: https://learn.chatgpt.com/docs/sites, https://developers.openai.com/plugins/build/chatgpt-ui, https://developers.openai.com/plugins/build/extensions. Native Conversation-Panels/Sidebar-Entrypoints sind dokumentiert; für dauerhaftes Panel braucht es echte Plugin-Registrierung/-Verbindung. Sites könnte später privaten Hosting-/MCP-Betrieb übernehmen, wurde hier nicht eingerichtet.
- Lokale App bleibt erhalten. Kein Download erforderlich, sie liegt im Projekt; Mac-unabhängige Cloud-Ausführung weiterhin offen. Keine Sites-Veröffentlichung, keine neuen API-Kostenläufe, keine Production-Freigabe.

Nächster Schritt: Nutzer klickt eine konkrete Standfrage in der Chat-Zentrale und bestätigt die Übergabe; den tatsächlichen Eingang prüfen, beantworten und datierte Ansicht aktualisieren. Danach verbindliche App-/Plugin-Brücke mit nur einer Aufgabe ausbauen.

---

## Ergänzung: eigenständige Mac-App und bewusst bediente Chat-Rückmeldung, 06.10.2026

Nutzer fragt nach Start und Rückmeldung und möchte eine eigenständige App. Auf demselben Prototype-Branch umgesetzt:
- Native AppKit/WKWebView-Fensterhülle als GradeCrew Control.app, startet einen gebündelten lokalen Dienst oder verwendet den geprüften bereits laufenden Dienst. Alle Fenster-/UI-Prüfungen bleiben offen; nicht als Umweg um die CUA-Richtliniensperre gestartet.
- Native Quelltexte/build.sh gepusht; lokal gebautes .app-Paket bleibt außerhalb Git. Vorhandene Codex-Node-Laufzeit wird benötigt. Kommentar-/Auftragsdaten bleiben in derselben .local-Ablage im Projekt.
- Compiler fehlte zunächst der ausdrückliche SDK-Pfad; mit -sdk des vorhandenen Xcode-SDK erfolgreich kompiliert und lokal ad-hoc signiert. codesign --verify --deep --strict erfolgreich; kein notarisiertes Distributionspaket behaupten.
- agent.mjs list/show/claim/complete/block für explizit im Chat beauftragte Abo-Arbeit. Claim prüft gewähltes Modell und Ausführungsweg, verhindert erneute Übernahme; Ergebnis nur vom übernommenen Bearbeiter, keine Release-Stufenänderung.
- Lokale Auftragsansicht zeigt übernommenen Status und Resultat; Polling alle fünf Sekunden außerhalb offener Dialoge oder Formulare. Kein automatischer Chatstart/Modellwechsel. Vor jeder realen Bearbeitung tatsächliche Modellauswahl prüfen.
- Nutzerablauf: Aufgabe -> Text + Modell/Weg -> lokal vorbereiten -> hier sagen „Bearbeite den nächsten Abo-Auftrag aus der GradeCrew-Zentrale.“ Bei mehreren Aufträgen die konkrete ID nennen.
- Auftragsablage im aktuellen laufenden Dienst geprüft: leer. Kein Nutzerauftrag ausgeführt oder als abgeschlossen erfunden.
- Drei vorhandene Tests um Zustandsübergänge/Claim-Konflikt/Resultat-Persistenz erweitert; zuerst echte 404-vs-409-Assertion fehlgeschlagen, nach Implementierung 3/3 grün. Native Build und JS-Syntaxprüfungen erfolgreich.
- Lokaler Commit 7e4fb63; neue Server-Session 86969, vorherige eigene Session17237 kontrolliert beendet. Vor Neustart laufenden Dienst prüfen.
- Keine separat berechneten Modell-API-Aufrufe, keine Änderung bestehender Guardian-Kette, kein Cloud-/Production-Deploy. Abo-Chat-Anbindung bleibt bewusst vom hier direkt im Chat autorisierten Agenten bedient, nicht autonom.

Nächster Schritt: Martin öffnet das native Fenster und bereitet eine konkrete Aufgabe vor; danach genau diesen Auftrag mit passender realer Modellauswahl übernehmen und den Resultat-Rückweg prüfen.

---

## Lokaler Prototyp und Modellentscheidung – 06.10.2026

Task-ID GC-BRAIN-01 bleibt erhalten. Der Nutzer hat ausdrücklich den Bau eines ersten kurzen lokalen Prototyps beauftragt. Er präzisiert außerdem: Guardian mit verschiedenen API-Modellen wird weiterhin für passende Prüfungen bzw. Online-/Produktaufgaben benötigt. Die frühere Abo-Präzisierung darf nicht als Auftrag zum Abschalten der Guardian-/Produkt-API-Ketten gelesen werden. Entwicklungsaufträge im persönlichen Work/Codex sollen vorab eine begründete Modellwahl erhalten, statt grundsätzlich Astra zu verwenden.

### Gesicherter Stand

- Code: 352aa46508f95deed5b480c302e79bed571b6a24, Branch prototype/gradecrew-control-local-v1, Pfad prototypes/gradecrew-control-local/. Lokaler separater Projektordner gradecrew-control-prototype; lokaler Code-Commit 142b0c4. Lokales Git enthält nur den Prototyp, kein vollständiger Hausaufgabe-Checkout.
- Browseradresse nach Start: http://127.0.0.1:4318. Start GradeCrew.command oder node server.mjs. Aktuelle lokale Server-Session: 17237; ein Abbruch des Chats beweist keinen Serverstopp. Vor erneutem Start Port/Prozess prüfen.
- 50 echte Aufgaben aus TODO.md@8360bc5, acht Themenbereiche; zwölf Aufgaben exakt mit task_id/task_ids aus dem Release-State verbunden, 38 ohne eindeutige Stufenzuordnung. Kein erfundener Live-Status. Kommentare, neue lokale Aufgaben und bestätigte Auftragsentwürfe werden getrennt in .local/state.json gespeichert. Keine privaten Laufzeitdaten im Git.
- Suche/Filter, Aufgabendetail, Quellenlinks, lokale Modell-Empfehlung, ausdrückliche Wahl von Modell/Aufwand/Weg, Auftragsablage, Übergabetext und JSON-Export implementiert. Keine automatische KI-/Chat-Ausführung: vorbereitet heißt vorbereitet.
- Modellberater ist eine lokale Heuristik: risikoarme begrenzte Arbeit -> GPT-6 Luna, normale Entwicklung -> GPT-6.1 Sol, Architektur/hohe Tragweite -> GPT-6 Astra. Auswahl ist kein tatsächlicher Modellwechsel; Verfügbarkeit vor Übernahme im Chat prüfen. Keine aktuellen Einstellungen anderer Chats geändert.
- Guardian/API als eigener Vorbereitungsweg; Modellwunsch verändert nicht dessen qualifizierte Profile, Budgets oder Review-Gates. Kein API-Auftrag gestartet.
- Arbeitsräume sind thematische Ansichten, keine neu angelegten/umbenannten/archivierten Codex-Chats. Die Frage nach späterer Chat-Organisation bleibt von dieser lokalen Umsetzung getrennt.

### Referenzen und Kosten

DeepSWE und Artificial Analysis am 06.10.2026 geöffnet, offizielle Modellwahl gegengeprüft. DeepSWE enthält 113 Engineering-Aufgaben mit mini-swe-agent und Datenstand 22.09.2026. Drei exakt benannte Modell-/Effort-Messungen als Quellenbeispiele eingebunden; keine Übertragung von GPT-5.6 Luna auf GPT-6 Luna. Artificial Analysis als Quelle eingebunden, ohne unlesbare dynamische Diagrammwerte zu erfinden. API-Preise, Benchmark-Tokens und Pro-Kontingent sind unterschiedliche Größen. Keine exakte Vorhersage oder garantierte Einsparung behauptet. Vor Auftragsvorbereitung wählt und bestätigt der Nutzer das Modell. Kein automatischer kostenpflichtiger Fallback.

- https://deepswe.datacurve.ai/
- https://artificialanalysis.ai/
- https://learn.chatgpt.com/docs/model-selection

Für diese Umsetzung keine separat berechneten Modell-API-Aufrufe oder Produktabhängigkeits-Installationen. Die laufende Codex-Arbeit nutzt das Konto-Kontingent. Kein monetärer Gesamtpreis behauptet; GitHub-/Infrastrukturkosten nicht durch fehlende Modell-API-Aufrufe ausgeschlossen.

### Tatsächlich geprüft

- Tests vor Implementierung gestartet, zunächst am fehlenden Modul gescheitert; anschließend umgesetzt und vollständig bestanden. Kein perfekter assertion-first-TDD-Nachweis behaupten.
- node --test test/*.test.mjs: 3/3 bestanden. Enthält echte HTTP-/Dateisystem-Integration: Kommentar-Persistenz, Neustart, genau ein Entwurf bei doppelter Request-ID, 409 bei geändertem Inhalt unter derselben ID, ungültige Eingaben, fehlende Bestätigung, fremder Origin, fehlende Task-ID, private Datei nicht öffentlich, kein Dispatch-Endpunkt.
- node --check für server.mjs, public/app.mjs und public/shared.mjs erfolgreich. Lokaler Git-Arbeitsstand sauber beim Prüfschritt.
- Loopback-Port zunächst sandboxseitig blockiert; separat genehmigte lokale Test-/Serverausführung erfolgreich.
- Visuelle Browser-/Geräteprüfung NICHT erfolgt: zwei cua-Versuche lehnen http://127.0.0.1:4318 ab, weil die admin-enforced policy nicht verifiziert werden konnte. Sperre nicht umgangen. Deshalb keine Behauptung einer bestandenen visuellen oder Browser-End-to-End-Abnahme.
- Development-Status-Lauf 37374686618 und Joblog 111980194806 gelesen: Registry-Zielabweichung bei freetext-review, offene PR trotz integriertem escape-tutor-cost-guards und 73 unklassifizierte Branches. Offene PR-Liste frisch gelesen, insbesondere #25/#26 vorhandene Modell-/Routingarbeit, #65 komplexe Guardian-Arbeit, #126 Zulassungsprofile; kein konkurrierender Control-App-PR identifiziert. Prototyp berührt keine dieser Produktdateien.

### Release-Stufe / Grenzen / nächster Schritt

branch_only: eigener Branch gepusht, lokale Tests bestanden; keine exakte Repo-CI, Integration, Staging, Geräteabnahme oder Production-Veröffentlichung behauptet. Ohne Mac läuft dieser lokale Prototyp nicht. Noch offen: visuelle Abnahme, Screenshot-Anhänge, vollständige Chat-/Aufgabeninventarisierung, automatische Quellaktualisierung, echte Modell-/Abo-Chat-Brücke und Ergebnisrückkanal, Cloudbetrieb, zugelassene Guardian-Anbindung. Statusdaten sind Snapshots und können gegenüber paralleler Arbeit veraltet sein.

Nächster konkreter Schritt: lokale Oberfläche im Browser abnehmen, sobald die Browserrichtlinie wieder geprüft werden kann bzw. durch Martin öffnen lassen; danach genau eine bestätigte Abo-Übergabe mit tatsächlichem Start-/Ergebnisnachweis integrieren. Keine Reaktivierung unbekannter alter API-Aufträge, kein Budgetreset, keine automatische Production.

---

## Maßgebliche Präzisierung: Abo-Ausführung und Bereichsübersicht, 05.10.2026

Diese Ergänzung ersetzt die frühere Empfehlung, Guardian als regulären Modell-Worker dieser Zentrale zu verwenden. Die historische Einordnung darunter bleibt erhalten.

Nutzerziel: alle GradeCrew-Aufgaben in einer Oberfläche sehen, insbesondere Sprachfunktionen, Internationalisierung Deutsch/Englisch und weitere Sprachen, Design und Games. Bereiche aufklappen, einzelne Aufgaben samt belegtem Entwicklungsstand und Farben lesen, direkt kommentieren und bearbeiten lassen. Nicht aus Beispielen einen aktuellen Funktions-/Sprachenbestand ableiten; dieser muss separat inventarisiert werden.

Verbindliche Kostenanforderung: Bearbeitung hier in Work/Codex über das vorhandene Pro-Abonnement mit GPT-6 Astra; keine zusätzlich abgerechneten Modell-API-Aufrufe für diese Entwicklungszentrale. Kein automatischer Wechsel auf API bei Abo-Limit. Bestehende API-Workflows wurden in diesem Turn weder ausgeführt noch geändert/deaktiviert. Frühere Anforderung bleibt: auch bei ausgeschaltetem Mac arbeiten können.

### Korrigierter technischer Zuschnitt

- Gemeinsame persistente Aufgaben-/Nachweisablage mit Bereich -> Feature -> Aufgabe, vorhandenen IDs, Kommentaren/Anhängen, verknüpften Chats und Versionsbelegen.
- Bevorzugt eigene eingebettete Oberfläche in Work/Codex über Plugin/MCP Apps. Die offizielle UI-Dokumentation beschreibt ui/message als Folgenachricht an den Host-Chat und tools/call für gespeicherte Aufgabendaten. Ein bewusster Nutzerklick übergibt Aufgaben-ID, Kommentar und Quelle an den Chat; ausgewähltes verfügbares GPT-6 Astra bearbeitet im Abo. Nutzbarkeit in genau diesem Client, Zuordnung zur Aufgabe, doppelte Klicks und Rückschreiben des Ergebnisses müssen praktisch nachgewiesen werden.
- Kein Versprechen, eine gewöhnliche externe Webseite könne beliebige bestehende Chats autonom ansteuern. Eingebettete Host-Brücke ist von unabhängiger Website zu unterscheiden. Fallback bei fehlender Host-Fähigkeit: Auftrag dauerhaft speichern und klar gekennzeichnet im Chat übernehmen; nicht als schon gestartete Arbeit darstellen.
- Bei ausgeschaltetem Mac benötigt die Ausführung eine echte Codex-Cloud-Umgebung mit Repository, Werkzeugen und erreichbarer Aufgabenablage. Ein lokaler Chat/Remote-Zugriff ersetzt diese Umgebung nicht. Native iOS-/lokale Dateien-/Geräteprüfungen können zusätzliche online verfügbare Ressourcen erfordern. Kein Cloud-Environment oder neuer Chat wurde angelegt.
- Pro-Zugang ist grundsätzlich vom separat berechneten API-Key-Zugang getrennt. Work/Codex teilen das Abo-Kontingent. Astra-Modellwahl muss im tatsächlichen ausführenden Chat verfügbar sein; hier wurde keine Modellumschaltung oder Konto-Freischaltung behauptet.
- Falls später eigenständige Runner nötig werden: normale App-Server-Login-Tokens nicht pauschal als Hosted-Service-Zugang verwenden. Offizielles Sign in with ChatGPT dokumentiert Abo-Nutzung für OSS/lokale Apps und self-hosted VMs, mit Einschränkungen; kommerzielle/remote gehostete Dienste brauchen gesonderte Klärung. Dies ist keine für uns eingerichtete Verbindung.
- Vorhandene Status-/Release-Nachweise weiterverwenden. Guardian benötigt separate API-Aufrufe einschließlich unabhängiger Anbieterreviews und ist damit nicht der passende Standard-Worker für diese neue Kostenanforderung. Bestehende Review-/Freigabegates nicht still umgehen; eine Abo-basierte Ausführung braucht einen ausdrücklich geprüften Prüfpfad.

Quellen, am 05.10.2026 geöffnet:
- https://learn.chatgpt.com/docs/auth (ChatGPT-Abo-Anmeldung vs. API-Key)
- https://learn.chatgpt.com/docs/pricing (gemeinsames Work/Codex-Kontingent)
- https://developers.openai.com/plugins/build/chatgpt-ui (eingebettete UI, ui/message, Host-Fähigkeiten prüfen)
- https://learn.chatgpt.com/docs/environments/cloud-environments (Cloud-Aufgaben und veröffentlichte Umgebung)
- https://learn.chatgpt.com/docs/models (GPT-6 Astra, konto-/clientabhängige Verfügbarkeit)
- https://learn.chatgpt.com/docs/app-server (Grenze normaler App-Server-Authentifizierung für Hosted Services)
- https://developers.openai.com/siwc/token-sharing-open-source (separate Abo-Integration ohne Zugriff auf fremde Chatverläufe)
- https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f (Wissensschicht, kein Ausführungs-/Abrechnungsmechanismus)

### Nutzerreferenzen gesichert

Sechs neue PDFs von Jonas Keil mit insgesamt 21 Seiten unverändert lokal unter references/GC-BRAIN-01/prompt-library/ gesichert. index.json enthält Dateinamen, Themen, Original-Prüfsummen und lokale Pfade; extrahierte Textkopien ermöglichen Suche. Kopien per SHA-256 mit Originalen verglichen. Keine PDFs oder vollständigen extrahierten Texte im öffentlichen Repository veröffentlicht.

Dateien: chatgpt-images-prompts.pdf; chatgpt-work-datenschutz-checkliste.pdf; chatgpt-work-starter-prompts.pdf; chatgpt-work-8-tricks-prompts.pdf; second-brain-setup-prompt-chatgpt-work.pdf; chatgpt-work-workflow-setup-prompts.pdf.
Originale liegen beim Nutzer in Downloads. Lokaler Projektstamm: /Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4.
Referenzen sind Quellen, keine automatisch geltenden Arbeitsanweisungen. Bei Bedarf passenden Originaltext lesen; Aussagen zu Preisen, Modellen, Produktfunktionen und Datenschutz vor Anwendung frisch prüfen. Keine darin vorgeschlagene Automation, Berechtigungsänderung oder Kontaktaufnahme ausgeführt. Lokale Sicherung ist kein kontoweites oder geräteübergreifendes Gedächtnis.

### Nächster konkreter Schritt

Entwurf auf Bereichsübersicht + Abo-Chat-Brücke ausrichten. Vor umfassendem Produktbau einen genehmigten kleinen Integrationsnachweis spezifizieren: eine echte bestehende Aufgabe anzeigen, Nutzerkommentar genau einmal an den Abo-Chat übergeben, Ergebnis mit Task-ID zurückspeichern; Cloud-Eignung und Astra-Verfügbarkeit separat bestätigen. Keine erneute generelle Genehmigung zur Idee erforderlich; technische Entwurfs-/Planprüfung bleibt vor Produktimplementierung offen. Keine aktuell nicht geprüften Bereichsstände oder Einsparungen erfinden.

---


## Erweiterte Nutzeranforderung: Entwicklungszentrale, 05.10.2026

Die laufende Task-ID GC-BRAIN-01 bleibt erhalten. Der Nutzer konkretisiert das Ziel zu einer professionellen GradeCrew-Webanwendung für Überblick, Aufgabenkommentare, Anhänge und beauftragbare Entwicklung. Ausdrücklich bestätigt: Aufträge sollen auch bei ausgeschaltetem Mac weiterlaufen können. Das ist ein Produkt-/Architekturwunsch, keine Production- oder pauschale Budgetfreigabe.

### Frisch geprüfte Grundlage

- main unverändert bei 8360bc5f056837118ffd83138ffa2468ae42647e; START_HERE und verlinkte Pflichtregeln erneut gelesen.
- release-control/README.md: vorhandenes Board erzeugt Actions-Berichte; interaktive Abnahme, Fehlerhistorie und Fix/Retest-Zuordnung ausdrücklich noch offen. Anschluss an GC-ACCEPTANCE-01/02 und GC-RELEASE-07; keine konkurrierende Statuslogik bauen.
- automation/EXECUTION.md: begrenzte Cloud-Ausführung mit dauerhaft reservierten Versuchen/Budgets, exakten Quellen, CI, unabhängigen Reviews und Staging-Nachweisen. Aktuell nur eng zugelassene kleine Web-Änderungen. Der alte agent-queue/README beschreibt einen separaten älteren Worker und darf nicht als vollständige aktuelle Kette gelesen werden.
- Offene PR #126 zu GC-AUTOMATION-08 frisch gesehen, Head 65a480962f573e0c41998faedaf444e8fe00df9b; passende Development-Status-Ausführung 37374686618 und Qualifikationsläufe erfolgreich. Das bestätigt die Ausführung dieser Prüfungen, weder Integration des PR noch universelle Ausführungsfreigabe.
- Offener PR #65 plant komplexe Aufgaben/visuelle Prüfung/Gesamtaudits; berücksichtigen statt erneut parallel bauen.
- Kein vollständiger neuer Production-/Cloud-Drift-Audit durchgeführt. Begrenzte Actions-Abfrage und offene PRs frisch geprüft; daraus keinen Gesamtreifegrad ableiten.

### Empfohlener Diskussionsentwurf, noch nicht zur Umsetzung freigegeben

Eigene private GradeCrew-Entwicklungszentrale als Webanwendung. Gemeinsames Aufgabenregister mit stabilen vorhandenen IDs, Unteraufgaben, Abhängigkeiten, Kommentaren, Anhängen und Entscheidungsverlauf. Bestehende Chats werden verknüpfte Arbeitskontexte; keine stillschweigende Löschung, Verschiebung oder vollständige Importfähigkeit behaupten.

Oberfläche:
1. Übersicht nach Bereichen, Reife, Priorität, Blockern und letztem Beleg.
2. Aufgabendetail mit Ziel, aktuellem Stand, nächsten Schritten, Vorschau, Prüfungen und Verlauf. Text/Anhänge können als Kommentar gespeichert oder bewusst als neuer Änderungsauftrag beauftragt werden.
3. Arbeitszentrale für aktive Läufe, Rückfragen, notwendige Entscheidungen, Budgets und dokumentierte Fehler.
4. Abnahme am konkreten Teststand, mit Fehlermeldung/Fix/Retest-Beziehung.
5. Projektwissen und Entscheidungen mit Originalquellen; Second Brain als Wissensschicht dieser Zentrale.

Fünf UI-Reifestufen als Vorschlag: Rot offen/in Entwicklung; Orange technisch geprüft und integriert; Gelb auf Testumgebung; Blau am konkreten Stand abgenommen; Grün nachweislich veröffentlicht. Intern die sechs kanonischen Zustände branch_only, ci_green, integrated, staging_deployed, user_tested, production unverändert erhalten. ci_green ohne Integration bleibt als Zwischenfortschritt sichtbar. Unbekannte/veraltete Nachweise grau und ausdrücklich unbestätigt; Farbe nie ohne Text. Arbeitsstatus unabhängig davon. Aktuell veröffentlichte Version und laufende nächste Änderung separat zeigen.

Cloud-Ausführung: private Weboberfläche -> authentifizierter Auftragsdienst mit dauerhafter Warteschlange -> zugelassener Worker/Controller -> Repository, Prüfungen und Staging -> belegte Rückmeldung am ursprünglichen Auftrag. Kein Browser-Secret, kein direktes ungeschütztes Modellwerkzeug. Wiederholtes Klicken oder Verbindungsabbruch darf keinen zweiten Auftrag auslösen; eindeutige Request-ID und Konfliktsperre für überschneidende Änderungen. Vorhandene Kosten-/Versuchshistorie erhalten, unbekannte Providerresultate zur Klärung stoppen. Production separat ausdrücklich freigeben.

Codex App Server dokumentiert eigene Clients mit thread/start, turn/start, turn/steer und Ereignissen/Rückfragen. Das ist eine mögliche spätere Worker-Anbindung; es belegt nicht die Fernsteuerung aller bestehenden Work-/ChatGPT-/Desktop-Chats. Ein Cloud-Runner braucht eigene qualifizierte Authentifizierung, Persistenz und Betrieb. Bestehende Guardian-Ausführung zuerst wiederverwenden. Quelle: https://learn.chatgpt.com/docs/app-server

### Vergleich und Nutzenhypothese

Gemeinsame Kriterien: verlässliche Übersicht, direkte Ausführung, Anschluss an vorhandene Nachweise, Wartungsaufwand. Eigene Zentrale auf vorhandener Steuerung 9/10; fertiges Aufgabenboard mit Sonderintegration 6/10; Weiterführung vieler Chats 3/10. Begründete Eignungseinschätzungen, keine gemessene Einsparung und keine Fertigstellungswerte. Nutzen: weniger Kontextrekonstruktion und Doppelarbeit, sichtbarere Blocker/Abhängigkeiten, nachvollziehbare Abnahme, klare Verbindung jeder Arbeit mit Auftrag und Beleg.

Ersten nutzbaren Umfang auf vollständigen Weg einer kleinen erlaubten Web-Aufgabe begrenzen: Auftrag/Anhang -> Cloud-Lauf -> Prüfungen -> Testvorschau -> Feedback -> Abnahme. Gleichzeitig alle anderen Bereiche sichtbar inventarisieren, aber automatische Ausführung nur nach jeweils qualifizierten Profilen anbieten. Professionelle Mindestabnahme: keine verlorenen/doppelten Aufträge, Wiederaufnahme nach Ausfall, echte Statusnachweise, Autorisierung, Budgetgrenzen, Rückfragen und wiederherstellbare Historie.

### Offene Architekturentscheidung und nächster Schritt

Cloud-Betrieb ist vom Nutzer entschieden. Empfohlenen Oberflächen-/Auftragszuschnitt jetzt zur Diskussion stellen; danach separaten prüfbaren Entwurf und Implementierungsplan mit vorhandenen Workstreams abstimmen. Hosting, Datenbank, Zugangsmodell, Cloud-Runner-Betrieb und Abrechnungsweg müssen in diesem Entwurf konkret qualifiziert werden. Noch kein externer Dienst angelegt, kein Produktcode, kein bezahlter Worker gestartet, keine Chats angesteuert und keine Deploymentfreigabe erteilt. Die Videoanalyse und bisherige Historie bleiben unten vollständig erhalten.

---


## Ergänzung: Videoanalyse am 05.10.2026

Der Nutzer hat nun die vollständige MP4 (19:48,58) und zwölf Screenshots bereitgestellt und bittet um vertiefte Nutzenbewertung. Die Erstbewertung unten bleibt als Historie erhalten; die damalige Aussage, es liege kein Video vor, ist überholt.

### Methode und Nachweise

- Vollständige lokale automatische Transkription mit Whisper base.en: 255 Segmente, 5.093 Wörter. Rohtext und SRT enthalten mögliche Erkennungsfehler bei Namen und technischen Begriffen; keine wortgetreue manuelle Abnahme behaupten.
- Video über die gesamte Länge in 119 Einzelbildern im Zehnsekundenabstand gesichtet, zusätzlich zentrale Frames und die zwölf Nutzer-Screenshots gelesen. Dies ist eine szenenweise Stichprobenanalyse, keine manuelle Prüfung jedes Videoframes.
- Lokale Artefakte unter analysis/GC-BRAIN-01/: video-transcript-en.txt, video-transcript-en.srt, transcript-segments.jsonl, transcription-info.json, frame-index.json, contact-01.jpg bis contact-10.jpg sowie frames/. Diese Dateien sind lokale Arbeitsartefakte und wurden nicht in das öffentliche GitHub-Repo hochgeladen.
- Temporäre lokale Medien-/Spracherkennungswerkzeuge und Modell heruntergeladen. Keine kostenpflichtige Transkriptions-API verwendet; kein Video-Upload für die Transkription.
- Transkriptprüfung: 255 nichtleere Segmente, SRT mit 255 Blöcken, Beginn bei 0 und Ende bei ca. 19:49; komplette Laufzeit abgedeckt. Endzeit automatisch gerundet. Alle 119 Stichprobenbilder in zehn Kontaktbögen gelesen.
- Aktuelle main-Regeln erneut gelesen; AGENTS, State, TODO, Workstream-README und Chat-Vertrag gegenüber voriger Lesung unverändert. Eigener Branch war vor Ergänzung weiterhin 5878ce73a3ecc0c2943f54174656bc01acdd3f78.

### Was das Video tatsächlich zeigt

- 00:00–02:10: HerkBrain als verknüpfte Datei-/Notizansicht und ein separates Dashboard mit Kalender, Kommunikation, Meetings und Community-Auswertung. Der Sprecher bezeichnet Quellen als synchronisiert; das Video allein ersetzt keinen Funktions-/Zugriffstest seiner Integrationen.
- 02:10–04:51: Context, Connections, Capabilities, Cadence. Dauerhaftes Wissen plus aktuelle Datenquellen bilden in seinem Modell das Second Brain; ausführbare Abläufe und wiederkehrende Ausführung erweitern es zum AI OS.
- 05:04–07:36: Skills und AGENTS.md als Betriebsregeln und Wegweiser zu den richtigen Dateien.
- 07:37–11:41: Neuer Projektordner, Onboarding und kurze Kontextdateien zu Person, Unternehmen und Prioritäten. Aufgeführte Dienste brauchen gesonderte Anbindung.
- 11:41–15:26: Audit, Verbesserungsschleife und gespeicherte Interviews. Der gezeigte Auditwert 30/100 ist eine Bewertung seines Demoprojekts, keine gemessene GradeCrew-Qualität.
- 15:26–17:28: Karpathys LLM-Wiki zum dauerhaften Zusammenführen und Verknüpfen von Wissen; anschließende 3D-Ansicht.
- 17:28–19:31: Autor empfiehlt für viele Alltagsaufgaben auch kleinere Modelle und betont den Wert eigener portabler Dateien.

### Korrektur der ersten Erklärung

Reine Suche erklärt das gezeigte Konzept nur teilweise. Das zusätzliche Element ist eine dauerhaft gepflegte Synthese: Neue Quellen verändern passende Themenseiten, frühere Erkenntnisse bleiben mit Herkunft auffindbar, Widersprüche werden markiert. Suchverfahren und Wiki können kombiniert werden. Dies ist extern gespeichertes Wissen, keine laufende Änderung der Modellgewichte.

Die 3D-Verbindungen des aktuellen öffentlichen Pakets basieren auf Markdown-/Wikilinks und gesondert erkannten Titel-Erwähnungen. Der Wachstumsfilm ist eine Darstellung der Verknüpfungen, keine historische Lernkurve. Die aktuell verfügbare Vorlage reduziert den Aufwand einer Visualisierung gegenüber einem kompletten Neubau. Viele Punkte oder Linien sind kein Beleg für richtige Antworten.

### Einordnung für GradeCrew

Kriterien: Nutzen im heutigen Projektalltag, zusätzlicher Pflege-/Bauaufwand, überprüfbare Verlässlichkeit.
- 9/10: vorhandene GradeCrew-Quellen um ein gepflegtes Themen-/Entscheidungswiki ergänzen. Passt direkt zu Chatwechseln, wiederholten Versuchen und verteilten fachlichen Entscheidungen. Qualität und tatsächliche Einsparung bleiben zu messen.
- 7/10: daraus später eine kompakte Übersicht zu echten offenen Entscheidungen, Fehlergruppen und Abnahmebedarf ableiten. Nützlich, aber vorhandene Release-/BugOps-Arbeit muss weiterverwendet werden; zusätzliche Verbindungen brauchen Tests.
- 4/10: die 3D-Ansicht zum ersten Hauptziel machen. Gut für Exploration und Vorführung; trotz verfügbarer Vorlage geringer unmittelbarer Nutzen für die nächste richtige Projektentscheidung.

Keine Fertigstellungsbewertung des Gesamtprojekts. Keine pauschalen Prozent-, Kosten- oder Zuverlässigkeitsversprechen.

Konkrete Anwendungen:
1. Ersatzchat findet ursprünglichen Auftrag, bisherige Versuche, Entscheidung und nächste belegte Aktion.
2. Eine Produktänderung ruft verwandte Entscheidungen und Abhängigkeiten auf, beispielsweise Klassenidentität, sichere Prüfungsabgabe und Berechtigungen.
3. Fehlermeldungen werden mit früheren Ursachen, bereits versuchten Reparaturen und Nutzerbeobachtungen verknüpft.
4. Änderungen aus Nutzerfeedback können begründet priorisiert werden; BugOps ist dabei eine vorhandene Quelle statt einer zweiten Fehlerdatenbank.
5. Neue Bild-/Video-/Konzeptreferenzen führen zu nachvollziehbaren Designentscheidungen und erhalten ihren Status als Vorschlag oder Beschluss.

### Empfohlener erster Umfang

Bestehende START_HERE-/AGENTS-/TODO-/Workstream-Struktur wiederverwenden. Kleine Themenseiten zu Produktzielen, Architektur, Crew/Design, Entscheidungen und Fehlererfahrungen. Jeder Eintrag enthält Quellenlink, überprüften Stand, Behauptungsstatus (Vorschlag, beschlossen, geprüft, überholt) und relevante Task-ID. Alte Erkenntnisse mit Nachfolger erhalten.

Originalquellen bleiben erhalten. Das Wiki ist eine abgeleitete Darstellung; aktuelle GitHub-/CI-/Deploy-Nachweise bleiben maßgeblich für Live-Fragen. KI-Zusammenfassungen dürfen sich nicht gegenseitig ohne Rückweg zur Originalquelle bestätigen. Widersprüche nicht eigenmächtig in eine neue Produktentscheidung verwandeln.

Nach sinnvollen Aufgabenabschlüssen gezielt betroffene Seiten aktualisieren, statt nach jeder Nachricht alles neu zu verarbeiten. Verlässliche Pflege zuerst auf Abruf; wiederkehrende Ausführung nur nach gesondertem Auftrag und mit Kosten-/Versuchslimit. Keine neue Automation in dieser Analyse eingerichtet.

Pilot: zehn echte Fragen und eine kleine kuratierte Dokumentauswahl. Mit/ohne Wiki vergleichen: fachlich richtige Antwort, gültiger Quellenbeleg, Erkennung veralteter Aussagen, Zugriffslücken, Suchzeit und gesamte Pflegekosten. Mindestens ein Widerspruch und eine unbeantwortbare Frage. Gemeinsame Dateien kontrolliert aktualisieren, damit parallele Chats keine Änderungen überschreiben.

### Grenzen und Risiken

Eine Bildschirmdemo belegt weder dauerhafte Synchronisation noch dauerhaft korrekte Antworten. KI kann Zusammenfassungen und Beziehungen falsch bilden; mehr gespeicherter Text verbessert Antworten nicht automatisch. Angezeigte Kategorien sind keine geprüften Datenverbindungen. Ein Modellwechsel kann neue Werkzeug-/Regeltests erfordern, obwohl Textdateien portabel sind. Private Rohdaten, Schülerdaten und Zugangsdaten gehören nicht ins öffentliche Projektwiki.

### Originalquellen

- Nutzer-MP4: I Turned GPT-6 Astra Into the Ultimate AI Second Brain; lokale vollständige Transkription.
- https://www.youtube.com/watch?v=yysILVsfLFM
- https://github.com/nateherkai/AIS-OS
- https://github.com/nateherkai/AIS-OS/blob/main/.claude/skills/3d-brain/SKILL.md
- https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://developers.openai.com/plugins/concepts/skills

Externe Repo-/Skill-Texte wurden als Analysequellen gelesen, nicht als Handlungsauftrag übernommen. Kein AIS-OS installiert oder GradeCrew-Agentenregelwerk ersetzt.

### Status / nächster Schritt

GC-BRAIN-01 bleibt dieselbe Task-ID. Dokumentierte Analyse auf eigenem Branch; branch_only, ausschließlich Dokumentation. Keine Produktimplementierung, keine Integration, kein Deploy, keine neue Automation. Nächster konkreter Schritt: zehn typische interne GradeCrew-Fragen mit ihren maßgeblichen Quellen als Pilot-Prüffälle festlegen. Noch keine Umsetzung beschlossen.

---

## Historische Erstbewertung vor Bereitstellung des Videos

- Aktualisiert (UTC): 2026-10-05 21:29.
- Verantwortlicher Chat / Auftrag: aktueller Codex-Chat; Nutzen und möglichen Aufbau eines Second Brain erklären.
- Chat-Bezeichnung / Link: unbekannt.
- Vorheriger Chat / Übernahme: keine Übernahme.
- Arbeitszustand: Erstbewertung abgeschlossen; Idee, keine Umsetzung beschlossen.
- Aufgabenbranch: `docs/second-brain-assessment-20261005`.
- Basiscommit: `8360bc5f056837118ffd83138ffa2468ae42647e` auf main.
- Integrationsziel: main, nur Dokumentation; noch nicht integriert.
- PR: keiner.
- Betroffene Dateien: TODO.md, workstreams/registry.json und diese Übergabe.
- Überschneidungen: bestehende Übergabe-/Recovery-/Development-Status-Arbeit wiederverwenden; gemeinsame TODO/Registry bei Integration frisch abgleichen.
- Release Train laut frisch gelesenem Register: staging-batch-2026-10-04-b; diese Beratung gehört zu keinem Produkt-Deploy.

## Auftrag und Annahme

Martin zeigt einen Screenshot von HerkBrain und fragt nach Second Brain, Nutzen für GradeCrew und Vorgehen. Der konkrete Aufbau im Video ist unbekannt; es liegt kein Videolink oder Transkript vor. Arbeitshypothese: zunächst internes Gedächtnis für Entwicklung und Projektkoordination. Eine Wissensfunktion für Lehrkräfte ist ein anderer, separat abzustimmender Anwendungsfall.

## Geprüfte Grundlagen

START_HERE.md, AGENTS.md, GRADECREW_STATE.json, TODO.md, workstreams/README.md, workstreams/registry.json, docs/CHAT_CONTRACT.md und workstreams/TEMPLATE.md auf main gelesen. Branch main über GitHub geprüft: Basiscommit oben. Keine passende Second-Brain-ID in TODO/Registry; Suche nach Branchnamen mit brain und PRs mit second brain ohne Treffer. Diese begrenzten Suchen belegen keine vollständige Abwesenheit von Vorarbeiten unter anderen Namen.

Die bestehende Struktur enthält bereits Regeln, Aufgaben, Übergaben und eine getrennte Release-/Deploy-Sicht. In TODO stehen ältere Setup-/Blocker-Aussagen neben späteren Erfolgsmeldungen, beispielsweise zur Guardian-Automatik. Dies ist ein konkretes Beispiel für den Bedarf nach Quellenalter und Widerspruchsauflösung, keine erneute Bestätigung einzelner Deploys. Jüngster Development-Status-Run konnte über den verwendeten Workflow-URL-Aufruf nicht gelesen werden (Connector INVALID_ARGUMENT). Keine neue Produktentwicklung; vor einem solchen Beginn Live-Audit nachholen. Keine CI-, Deploy- oder Gerätebehauptung aus Dokumenttext abgeleitet.

## Empfehlung – ausdrücklich noch kein beschlossenes Design

Bewertung nach Nutzen für verlässliche Projektfortsetzung, Pflegeaufwand und Prüfbarkeit:
- 9/10: schlankes internes Wissenssystem auf den vorhandenen Quellen. Hoher erwarteter Nutzen durch Wiederverwendung der Übergaben, konkrete Nachweise und weniger erneute Kontextsuche. Pflege und Abdeckung müssen im Pilot belegt werden.
- 4/10: unmittelbar ein vollständiges HerkBrain-artiges 3D-System nachbauen. Gute visuelle Exploration, aber höherer Aufwand und keine automatische Lösung für veraltete oder widersprüchliche Fakten.

Die Zahlen bewerten die Eignung der Ansätze, nicht den Fertigstellungsgrad von GradeCrew oder eine gemessene Produktivitätssteigerung.

## Möglicher Aufbau

1. GitHub bleibt führend für Projektregeln, Entscheidungen, Aufgaben und technische Nachweise. Keine zweite manuell gepflegte Statuswahrheit.
2. Kleine verlinkte Wissenseinträge halten Entscheidung, Begründung, Thema, Task-ID, Quelle, Gültigkeit und ersetzte Entscheidungen fest. Chat-Ergebnisse gezielt verdichten; keine ungefilterte Chatkopie. Zugriff auf fremde Chats entsteht dadurch nicht automatisch.
3. Suchfunktion findet zunächst genaue IDs/Begriffe; bei nachgewiesenem Bedarf ergänzt eine Bedeutungssuche die Auswahl relevanter Textstellen. KI bekommt diese Quellen vor der Antwort. Ein neu trainiertes Modell ist dafür nicht erforderlich.
4. Statusfragen lösen zusätzlich aktuelle GitHub-/Test-/Deploy-Nachweise auf. Jede Antwort zeigt Quelle und Stand; fehlende oder widersprüchliche Belege bleiben sichtbar.
5. Anbindung für Arbeitsagenten und optional ein lesbares Projektportal. Der Index ist aus den Originalen wiederherstellbar; Änderungen und Löschungen müssen übernommen werden. Eine Netzwerkgrafik kann später dieselben Daten nutzen.

Technische Grundlage des Suchprinzips: [Anthropic – Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval). Exakte Begriffssuche und semantische Suche ergänzen sich; eigene Tests sind erforderlich. Die dortigen Messwerte sind keine GradeCrew-Ergebnisse.

## Erwarteter Nutzen und Grenzen

Weniger erneutes Erklären bei Chatwechsel, auffindbare Entscheidungen samt Gründen, weniger Wiederholung fehlgeschlagener Ansätze, schnellere Fehlersuche und bessere Sicht auf Abhängigkeiten. Weniger Kontextsuche und kleinere Eingaben können Kosten reduzieren; Indexierung und Pflege verursachen ebenfalls Aufwand. Keine Einsparquote belegt.

Beispiel einer Pilotfrage: Warum ist eine Aufgabe noch nicht für Production freigegeben? Erwartet werden fehlendes Gate, betroffene Aufgabe, aktueller Nachweis und nächster Schritt. Das System darf ältere Erfolge nicht ungeprüft als aktuellen Stand ausgeben.

Das interne Projektgedächtnis enthält keine Schülerdaten, Schlüssel oder privaten Rohdaten. Eine spätere Lehrkräftefunktion mit eigenen Materialien, Lehrplänen und freigegebenen Aufgaben benötigt getrennte Berechtigungen und Quellenräume. Eine Grafik allein verbessert die Antwortqualität nicht.

## Vorgeschlagener Pilot

Etwa 20 sorgfältig ausgewählte vorhandene Dokumente und zehn echte Projektfragen. Gegen heutige Recherche vergleichen: richtige und aktuelle Antwort, Quellenbeleg, erkannte Widersprüche, Suchzeit und tatsächlicher Aufwand/Kosten. Bewusst mindestens einen veralteten Status und eine unbeantwortbare Frage aufnehmen. Noch kein Pilot ausgeführt.

## Sicherungs- und Prüfstand

- Dokumentation: in diesem Aufgabenbranch gesichert; tatsächlichen Sicherungscommit aus der Dateihistorie lesen.
- Release-Stufe: branch_only, ausschließlich Dokumentation.
- Produktcode: keiner erstellt oder geändert.
- Prüfungen: aktuelle Quellen gelesen; TODO-Einfügung und Registry-Ergänzung vor Commit strukturell geprüft; gespeicherte Inhalte anschließend von GitHub gegen den Entwurf zurücklesen.
- CI / Integration / Hosting / Functions / Rules / Gerätetest: für diese Idee nicht durchgeführt.
- Production: kein Eingriff.
- Laufende oder unklare externe Aufträge: keine.
- Bezahlte Modell-/Deploy-Versuche und Budgetreservierungen: keine gestartet.

## Nächster konkreter Schritt

Mit Martin den ersten Einsatzbereich (internes Projektgedächtnis oder Wissensfunktion für Lehrkräfte) festlegen und dafür zehn konkrete Pilotfragen auswählen. Vor Umsetzung vollständigen aktuellen Development Status und verwandte Wissens-/Memory-Implementierungen prüfen.

## Wiederaufnahme

Dieselbe Task-ID GC-BRAIN-01 fortführen. Erst diesen Branch und die aktuelle main-Dokumentation vergleichen; keine parallele Wissensbasis oder neue Task-ID aus einem Chatwechsel erzeugen. Die Idee und Empfehlungen sind gespeichert, aber keine Produktumsetzung freigegeben oder fertig.
