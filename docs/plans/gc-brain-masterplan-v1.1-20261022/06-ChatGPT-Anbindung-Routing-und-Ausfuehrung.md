# Band 06 - ChatGPT-Anbindung, Zentralenrouting und Ausführung

## 6.1 Die vier technischen Schichten

Schicht A ist die Oberfläche: MCP-App im Host, bestehende lokale App oder später derselbe verbundene Webclient. Schicht B ist der Firmenservice: autoritative Objekte, Rechte, Briefbildung, Outbox und Rückkanal. Schicht C ist der Host-/Runtimeadapter: tatsächlich unterstützte Fähigkeit zum Zustellen, Starten, Beobachten und Antworten. Schicht D ist die reale Fachausführung in einem vorhandenen berechtigten Chat oder einer ausdrücklich qualifizierten Runtime.

Diese Schichten haben getrennte Identitäten und Belege. Ein Klick in A schreibt zunächst B. B kann C beauftragen, wenn ein zulässiger Adapter vorhanden ist. Erst ein tatsächlicher Startbeleg aus D bedeutet Fachbearbeitung. Die Rückmeldung läuft über C/B in dieselbe Akte in A.

## 6.2 Was die offiziellen Quellen tatsächlich belegen

Die offizielle MCP-UI-Dokumentation beschreibt eingebettete UI, tools/call, ui/message und getrennte serverseitige Geschäftsdaten. Die Bridge-Referenz beschreibt das Senden einer komponentenverfassten Nachricht. Daraus folgt kein universeller Zugriff auf beliebige Chatverläufe oder ein Fachworkerstart. Diese Fähigkeiten müssen im konkreten Host zusätzlich nachgewiesen werden. Quellen: [UI-Dokumentation](https://developers.openai.com/plugins/build/chatgpt-ui) und [Bridge-Referenz](https://developers.openai.com/plugins/reference).

Die offizielle App-Server-Dokumentation beschreibt Threads, Turns, Ereignisse und Approvalbehandlung. Ein eigener Client kann damit eigene qualifizierte Konversationen führen; Version, Authentifizierung und tatsächliche Tools bleiben eigene Voraussetzungen. Das ist kein Beleg für die Übernahme sämtlicher vorhandener Desktop-/Cloudchats. Quelle: [App Server](https://learn.chatgpt.com/docs/app-server).

Die drei folgenden Adapter sind Architekturvorschläge. Nur die in dieser Sitzung tatsächlich angebotenen Hostwerkzeuge dürfen als aktuelle Hostfähigkeiten genutzt werden; sie werden nicht zu einer öffentlich aufrufbaren Produkt-API erklärt.

## 6.3 Bestandsabgleich vor Erweiterung

Remote Control bei 7ccf74ce enthält plugin/mcp.mjs mit Version 0.2.2 und vier Tools: gradecrew_open, gradecrew_task, gradecrew_question und gradecrew_answer. server.mjs speichert lokale Kommentare, Tasks, Drafts und Fragen in einer JSON-Datei. agent.mjs kann bewusst bediente Draftübernahme und Ergebnisrückschreiben leisten.

Die lokal installierte GradeCrew-MCP-Quelle meldet 0.5.0 und enthält zusätzliche Status-/Workstream-/Feedbackreader sowie getrennte Verbindungsaktionen. Sie ist nicht automatisch derselbe gesicherte Quellstand wie der Remotezweig. Keiner dieser Bestände belegt bereits die neue Fachausführung.

Erstes Paket: Dateien, Versionen, Installationspfad, Hostkonfiguration, lokale Änderungen und Quellencommits vergleichen; Unterschiede klassifizieren; zulässige Erweiterungen in den kanonischen Aufgabenbranch überführen; vorhandene Verbindungs-/Datenlesegrenzen erhalten. Ein blindes Kopieren des Remoteplugins könnte lokale Fähigkeiten verlieren. Ein blindes Hochladen des lokalen Ordners könnte private Daten oder ungesicherte Fremdarbeit übernehmen.

## 6.4 Adapter A - vorhandener Host/MCP-Weg

Empfohlenes erstes Qualifikationsziel: dieselbe Firmenoberfläche als MCP-App im vorhandenen Host. Die UI initialisiert die unterstützte Bridge und prüft Fähigkeiten. Sie ruft ein begrenztes Tool des Firmenservice auf, das den Request dauerhaft speichert.

Danach kann eine Hostnachricht die Bearbeitung anstoßen. Die Nachricht trägt Request-ID, Task-ID, Briefhash und den Hinweis, autorisierten Kontext über das passende Tool zu laden. Sie enthält keine geheimen Daten. Eine erfolgreiche ui/message-Antwort bedeutet nur die bestätigte Hostnachrichtenoperation, nicht den späteren Fachstart.

In einem Zentralenchat kann der zuständige Koordinator den gespeicherten Request übernehmen. In einem anderen Chat muss der Host einen tatsächlich zulässigen Weiterleitungsweg zur registrierten GradeCrew Zentrale besitzen. Der konkrete Hostagent kann nur solche Chat-/Nachrichtenwerkzeuge nutzen, die ihm angeboten und vom Nutzerauftrag autorisiert sind.

Hier angebotene Codex-App-Werkzeuge wie send_message_to_thread, read_thread, wait_threads und navigate_to_codex_page sind Hostfähigkeiten für diesen Agenten. Die Browseroberfläche besitzt deshalb noch keine Zugangsdaten oder serverseitige API dafür. Eine Produktimplementation darf diese Methoden nicht durch erfundene HTTP-Endpunkte, private Datenbankzugriffe oder Sessiontokenkopien nachbauen.

## 6.5 „Aus jedem Chat“ als nachzuweisendes Verhalten

Martins Ziel ist ein Auftragseingang ohne Chatwahl. Der Plan unterscheidet dafür zwei Fälle.

Fall 1: Die Firmenzentrale wird im bestätigten Zentralenhost geöffnet. Der aktive Kontext ist bereits die richtige Rolle. Der Nutzer gibt einen Auftrag ein; der zentrale Host kann die gespeicherte Anfrage über den qualifizierten Adapter bearbeiten.

Fall 2: Die Ansicht wird in einem anderen berechtigten Hostchat geöffnet. Der laufende Host muss den gleichen gespeicherten Request an die registrierte Zentralenrolle weiterleiten und einen Empfangsbeleg zurückführen. Fehlt diese Fähigkeit, bleibt der Request gespeichert und „Weiterleitung nicht qualifiziert“. Eine bloße Aufforderung an den Nutzer, den Text selbst zu kopieren, besteht diese V1-Anforderung nicht.

Ein direkter Öffnungsknopf darf bei vorhandener Hostnavigation den richtigen Zentralenchat anzeigen. Er ist eine Navigationshilfe und kein Ausführungsbeleg. Neue Chats werden nicht automatisch erzeugt, wenn bestehende Zuständigkeiten unklar sind. Ein unabhängiger Ersatzchat braucht einen tatsächlich passenden Auftrag.

## 6.6 Adapter B - eigener offizieller App Server

Dieser Weg bleibt eine mögliche technische Alternative, falls der vorhandene Host den erforderlichen Zyklus nicht trägt. Ein eigener Broker führt nur eigene Threads mit zulässiger Konfiguration. Er speichert Remote-IDs und setzt Modell/Aufwand an den installierten, unterstützten Turn-/Threadgrenzen.

Benötigte Fähigkeiten: initialisieren, eigenen Thread starten/lesen/resumieren, Turn starten, Events lesen, Frage/Approval behandeln, Unterbrechung anfordern und reale Endzustände auswerten. Die genauen Felder stammen aus dem installierten Protokollschema, dessen Version und Hash im Adaptermanifest stehen. Ein Approval wird nicht nach einem Neustart rekonstruiert, wenn das Protokoll diese Wiederaufnahme nicht nachweislich unterstützt.

Die bisherige separate Anmeldeaufforderung wurde korrigiert und der Login beendet. Dieser Plan startet keinen weiteren Login und erklärt ihn nicht erneut zum zwingenden nächsten Nutzerbedienschritt. Sollte Adapter B später benötigt werden, wird die konkrete Einrichtung samt Benutzerwirkung als gesonderte Entscheidung vorgelegt.

## 6.7 Adapter C - eigene offizielle Agent-/Modellruntime

Ein eigener offizieller APIweg könnte Daten-, Tool- und Ausführungssteuerung in einem selbst betriebenen Orchestrator leisten. Dafür wären tatsächliche Konto-/APIberechtigung, getrennte Abrechnung, Toolservice, Sandbox, Persistenz, Rückkanal und Betriebsverantwortung zu qualifizieren.

Dieser Weg ist kein stiller Fallback bei Hostproblemen. Alte ChatGPT-/Codexverläufe wären auch hier nur über verfügbare berechtigte Imports/Referenzen erschließbar. Es entstehen nicht automatisch dieselben Desktopfachchats. Eine Wahl würde mit konkretem Kosten-/Daten-/Betriebsvorschlag entschieden.

Vergleichskriterien sind direkte Bedienung 25 Prozent, vollständiger Arbeitszyklus 25 Prozent, Wiederaufnahme 20 Prozent, Rechtekontrolle 20 Prozent und Betriebsaufwand 10 Prozent. Begründete vorläufige Eignung: Host/MCP 8/10 wegen guter Bediennähe und Wiederverwendung bei offener Lifecyclefähigkeit; App Server 8/10 wegen explizitem Lifecycle bei zusätzlicher eigener Einrichtung; eigene APIruntime 7/10 wegen hoher Kontrolle und zusätzlichem Kosten-/Betriebsumfang. Das sind Architektururteile, keine gemessene Verfügbarkeit. Empfehlung: Adapter A zuerst durch denselben P0 qualifizieren.

## 6.8 RoleRoutingRegistry FZ-ROUTE-01

Eine Route enthält roleId, projectScope, intentTypes, hostId, backendKind, threadId oder serviceBinding, erwarteten Titel, capabilityProfileVersion, zulässige Datenklassen, gültige Policy, Ownerbestätigung, validFrom/validUntil und letzten Erreichbarkeitsbeleg.

Die logische Rollen-ID bleibt stabil, auch wenn der Chat ersetzt wird. Titel helfen dem Menschen, identifizieren aber keine Rolle allein. HostId ist Bestandteil der tatsächlichen Route. Eine fremde sessionId, ein Fork oder ein ähnlicher Chatname übernimmt keine Zentralenrechte.

Vor Dispatch werden vorhandene Arbeit, aktueller Workstream, offene PRs und Dateiscope geprüft. Ein idle/notLoaded-Metadatum ist keine Schreibfreigabe. Ist eine andere Execution auf demselben exklusiven Scope aktiv, bleibt die neue Anfrage queued oder benötigt eine konkrete Übergabe.

## 6.9 Bestehende Zentralenhierarchie

Die folgenden Bindungen stammen aus den aktuell gelesenen main-Regeln. Sie werden vor echtem Dispatch erneut auf aktuelle Gültigkeit geprüft.

| Logische Rolle | Bestehender Chat | Thread-ID |
| --- | --- | --- |
| Hauptzentrale | GradeCrew Zentrale | 01a10df6-736b-7a62-bd38-2724cf254c2e |
| Gemeinsame Games-Zentrale | GC · Games-Zentrale | 01a11864-3ec7-7091-acc0-9ff292f530f3 |
| Spielzentrale Pizza | Pizza Spiel Zentrale | 01a111e6-c211-76a2-928e-8ed88a7b7bec |
| Spielzentrale Lerninsel | GC · Lerninsel-Zentrale | 01a1183f-dad9-7640-8a82-23107c980d6e |
| Spielzentrale Escape | GC · Escape-Expedition-Zentrale | 01a11681-00e3-79d1-8f27-c48267b86c0d |

Ein normaler Firmenauftrag läuft Hauptzentrale → zuständiger Fachchat. Ein Gamesauftrag kann Hauptzentrale → Games-Zentrale → Spielzentrale → Fachchat durchlaufen. Alle Hops tragen dieselbe fachliche Task-/Requestbeziehung. Zusätzliche Koordinationsnachrichten dürfen nicht als neue unabhängige Bauversuche oder neue Budgetfamilien gezählt werden. Tatsächlicher zusätzlicher Modellverbrauch bleibt trotzdem zu erfassen.

Die neun Firmenbereiche erzeugen keine neun neuen Zentralenchats. Sie sind fachliche Zuständigkeiten, die auf vorhandene passende Rollen/Personen abgebildet werden. Fehlende Bindungen werden als offene Zuordnung behandelt.

## 6.10 Vollständige Nachrichtenfolge FZ-FLOW-01

1. UI sendet SubmitRequest mit clientMessageId, requestId, Kontextreferenzen, Absicht und Text.
2. Firmenservice authentifiziert, validiert, dedupliziert und speichert Request/Message/Brief/Outbox atomar.
3. UI zeigt „Gespeichert“ und Request-ID.
4. Qualifizierter Hostadapter übergibt nur zulässigen Kontext an die Hauptzentrale; Zustellbeleg wird gespeichert.
5. Zentrale übernimmt mit claimCoordination und erwarteter Revision. Sie ordnet bestehende Task und Owner zu oder stellt eine gebundene Frage.
6. Bei zusätzlicher Zentralenebene wird derselbe Request mit begrenztem Unterauftrag weitergereicht; jede Ebene besitzt Koordinationsrechte.
7. Vor Fachstart prüft admitDispatch die aktuelle Revisions-/ACL-/Budget-/Scopebasis.
8. Fachhost bestätigt tatsächliche Aufnahme und Start mit Remoteidentität. Erst jetzt lautet der Status „Facharbeit läuft“.
9. Worker erhält nur sein Tool-/Datei-/Datenscopeprofil und den unveränderlichen Brief.
10. Rückfragen/Approvals werden als konkrete Requests zurückgeführt. Martin antwortet in derselben Akte.
11. Der Adapter löst die gebundene Anfrage im selben externen Vorgang auf; bei fehlender Unterstützung bleibt der Gatezustand offen.
12. Worker liefert Ergebnis und Artefakte; unabhängiger Review erhält eingefrorenen Kandidaten.
13. acceptResult prüft Kriterien-/Zielbasis und Annahmerechte. Erst danach entsteht ein Zielbeitrag.
14. Projektionen aktualisieren Akte, Heute, Bereich, Ziel und Chefbrief. Alle referenzieren denselben Eventstand.

## 6.11 RuntimeAdapter-Vertrag

Der interne Adapter ist eine eigene Projektschnittstelle und kein offizieller OpenAI-Endpunkt. Vorgeschlagene Methoden:

- capabilities(binding): tatsächlich beobachtete Fähigkeiten, Versionen und Grenzen.
- deliver(requestEnvelope): bestätigte Nachrichtenzustellung oder unknown.
- startExecution(admittedEnvelope): reale Remoteidentität oder eindeutig abgelehnt/unknown.
- observeExecution(binding, cursor): neue Ereignisse ohne Wiederholung bereits bestätigter Events.
- answerPendingRequest(binding, decision): gebundene Antwort/Freigabe oder veralteter Konflikt.
- requestCancel(binding): Abbruchwunsch; bestätigter Stop erst nach Beobachtung.
- reattach(binding): Wiederanbindung ausschließlich an eigene/berechtigte Remoteidentität.
- reconcileUnknown(binding): Abgleich vorhandener Vorgänge ohne neuen Start.

Nicht jeder Adapter muss alles beherrschen. Fehlende Pflichtfähigkeit schließt ihn für den entsprechenden Produktworkflow aus. Fähigkeitsspezifische Einschränkungen werden im UI sichtbar; der Produktumfang wird nicht still reduziert.

## 6.12 Sicherheit und Autorisierung des Rückkanals

Eine Ergebnisrückmeldung ist keine frei formulierbare Statusbehauptung eines beliebigen Chats. Der Firmenservice prüft Actorbindung, Rolle, Task-/Executionzuordnung, exakten Brief und zulässigen Zustandswechsel. Belege haben geprüfte Artefaktreferenzen und keine frei aus dem Modelltext übernommene „success“-Markierung.

Ein Worker kann einen Ergebnisentwurf abgeben. Nur die berechtigte Review-/Annahmerolle kann ein Kriterium annehmen. Ein Koordinator kann die Weiterleitung organisieren; er kann sich selbst nicht Shell- oder Datenbankrechte geben.

UI-Metadaten wie appVisibility, selectedTask oder model-visible context sind keine Rechte. Ein Text mit „ignore previous instructions“ in einem Kundenticket bleibt Dateninhalt. Die serverseitige Policy wird daraus nicht verändert.

## 6.13 Wiederaufnahme, Ausfall und Hostwechsel

Der Store speichert Remote-Thread/Turn/Run, letzte bestätigte Eventsequenz, offene Fragen, Briefhash und ausstehende Sideeffects. Nach Neustart fragt der Adapter zuerst nach diesem Vorgang. Er erzeugt keinen neuen Task oder Turn allein deshalb, weil die UI leer ist.

Bei nicht erreichbarer Hostruntime zeigt die Oberfläche den letzten bestätigten Stand mit Zeitpunkt. Schreibentwürfe können erhalten bleiben. Neue externe Starts bleiben gesperrt. Bei unklarer Zustellung wird reconcileUnknown eingesetzt.

Ein Zentralenwechsel verwendet compare-and-swap auf RoleBinding und eine neue CoordinatorEpoch. Die alte Zentrale darf nach Wechsel keine neuen Koordinationsmutationen vornehmen. Bestehende Fachausführungen und Budgetbindungen bleiben erhalten. Ein generischer Fork hat diesen Epochwechsel nicht automatisch vollzogen.

## 6.14 Desktop, Web, iPad und Mac-off

Eine lokale Firmenapp auf dem Mac ist bei ausgeschaltetem Rechner nicht erreichbar. Ein iPad-Browser kann nicht einfach den localhost des Macs benutzen. Eine im Web geöffnete MCP-App braucht einen tatsächlich erreichbaren und zulässig authentifizierten Server.

Für V1 wird der tatsächlich qualifizierte Nutzungsort klar benannt. Ein späterer von Macbetrieb unabhängiger Dienst benötigt Cloudhosting oder einen unterstützten Cloudagenten mit passenden Verbindungen. Lokale Dateien, Hooks und Fachchats werden dadurch nicht automatisch übernommen.

Die gleiche Oberfläche kann mehrere Hosts bedienen, wenn deren Fähigkeiten und Zugriff tatsächlich qualifiziert sind. Featureerkennung wird gegenüber Annahmen aus Produktnamen bevorzugt. Der Betriebsscope enthält host, version, authenticatedActor, capabilities, storeBinding und limitations.

## 6.15 P0-Exit in dieser Architektur

P0 beweist eine einzige vollständige vertikale Kette mit synthetischem Auftrag: gespeicherter Request, Hauptzentrale, richtige Fachzuständigkeit, echter begrenzter Toolschritt, Artefakt, gebundene Rückfrage, Antwort/Fortsetzung, Neustart/Wiederanbindung und zwei negative Rechtefälle.

Der Receipt enthält positive Ereignisse und Grenzen. Ein Standfragen-Tool, manueller Copy-paste, Metadatenhandshake oder ein Host-Promise besteht diese Kette nicht. Wenn ein benötigter Port fehlt, dokumentiert der Integrator exakt den Ausfall und den minimalen ergänzenden Vertrag; kein großer produktiver P1/P2-Bau vor dieser Entscheidung.

