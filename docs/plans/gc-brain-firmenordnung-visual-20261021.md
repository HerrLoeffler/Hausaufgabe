# GC-BRAIN-01 — Firmen-Grundordnung und visueller Prüfentwurf

Ergänzung zum bestehenden Plan, keine zweite Produktplanung. Quelle des ursprünglichen Reviewstands: PR269@fe12e65989d4f43b6973e247c56f3fc40b3d784d. Martins neueste Anforderung verlangt sichtbare Gestaltung, klare Firmendomänen und einen tatsächlichen Eingabe→Bearbeiter→Ergebnis-Weg; der konkrete Chat oder eine eigene Modell-API sind keine Produktanforderung.

## Eine klare Ordnung mit vier verschiedenen Dingen

**Bereiche** beantworten „Wer verantwortet das?“. **Projekte** beantworten „Woran arbeiten wir?“. **Ziele/Aufgaben** sagen „Welches Ergebnis fehlt und was tun wir als Nächstes?“. **Gemeinsames Wissen/Analysen/Entscheidungen** liefern die Grundlage. Diese Begriffe werden nicht als konkurrierende Abteilungen oder separate Aufgabenbestände angelegt.

| Bereich | Zweck / Federführung | Typische Ergebnisse und Grenzen |
|---|---|---|
| Strategie & Führung | Richtung, Geschäftsmodell, Unternehmensziele, Prioritäten | Bestätigte Ziele, Prioritätsentscheidungen, Finanzierungsrichtung; koordiniert und prüft, führt keine Fachwerkzeuge aus |
| Produkt & Konzepte | Bedarf, Ideen, Funktionen, UX/Design und gültiges Produktkonzept | Roadmap, Konzeptfassungen, Designs, Abnahmekriterien; Web/Native/Secure/Games als Projekte, nicht je eine neue Firmenabteilung |
| Pädagogik & Inhalte | Lernziele, Didaktik, Aufgaben, Lehrpläne und fachliche Qualität | Kompetenz-/Aufgabenmodelle, Lernhilfen, fachliche Prüfkriterien; CI beweist keine Lernwirksamkeit |
| Technik & Betrieb | Umsetzung, Architektur, Integrationen, Infrastruktur, Fehler und Releases | Begrenzter Kandidat, Tests, Betriebs-/Releasebelege; keine implizite Livefreigabe |
| Kunden & Schulbetrieb | Piloten, Onboarding, Support, Rückmeldungen und Nutzung im Schulalltag | Pilotplan, Feedbackfälle, Einsatz-/Geräteabnahme; keine Sammlung privater Schülerantworten im Firmenkern |
| Marketing & Vertrieb | Positionierung, Marke, Nachfrage, Verkauf, Partner und Außenauftritt | Kampagnen, Präsentationen, Vertriebsschritte; keine eigenmächtigen Nachrichten oder Veröffentlichungen |
| Finanzen & Organisation | Kaufmännisches: Budget, Kosten, Erlöse, Liquidität, Finanzierung, Verwaltung | Beleggestützte Kosten-/Budgetübersichten, Finanzierungsbedarf, organisatorische Fristen; sensible Daten geschützt |
| Recht & Verträge | Vereinbarungen, Lizenzen, Rechte/Pflichten, Marken-/IP-Fragen | Vertragsstand, offene Rechtsfragen, Fristen; KI liefert keine verbindliche Rechtsfreigabe |
| Datenschutz & Sicherheit | Datenzwecke/-wege, Rollen, Löschung, Sicherheitsanforderungen und Risiken | Daten-/Berechtigungskonzept und konkrete Nachweise; rechtliche und technische Fachrollen bei Bedarf getrennt |

Das sind **logische Verantwortungsbereiche**, keine Behauptung von neun vorhandenen Mitarbeitern/Fachagenten und kein Auftrag zur Anlage neun neuer Desktopchats. Die Rollen-/Chatzuordnung ist vor Dispatch frisch zu prüfen. Bestehende Games-/Produkt-/Analyticszuständigkeiten erhalten. Die Ordnung wird konfigurierbar gehalten, damit GradeCrew als Firma wachsen kann, ohne eine starre Vollkonzernstruktur aufzubauen.

## Querschnitt statt vier zusätzlicher Gedächtnisse

- **Ziele & Aufgaben:** ein Bestand mit Owner, Abschlusskriterien, nächstem Schritt, Abhängigkeiten und Belegen; dasselbe Ziel kann mehrere Bereiche berühren.
- **Wissen & Konzepte:** gültige Fassungen, Quellen, Entscheidungen, Annahmen und offene Fragen; keine Vollhistorie in jedem Prompt. Hauptkern und Fachauftrag verwenden den berechtigten Arbeitsbrief.
- **Analyse & Qualität:** eine Sicht auf Produktnutzung, Zielergebnisse, fachliche Qualität, Fehler und Kosten. Kennzahlen haben Zeitraum/Definition/Quelle/Owner. Bestehenden GC-ANALYTICS-01-Port verwenden; keine neue Trackingimplementierung aus diesem Entwurf.
- **Entscheidungen & Freigaben:** konkrete offene Fragen/Aktionen, betroffener Scope, Entscheider und verbindliche Antwort; keine pauschale Jarvis-Vollmacht.

Ein Beispielziel „ersten iPad-Piloten vorbereiten“ hat Kunden/Schulbetrieb als Goalowner; Technik liefert einen Kandidaten, Recht klärt Vertragsgrundlagen, Datenschutz prüft Datenwege, Finanzen den Budgetrahmen. Das ist ein Ziel mit Beiträgen und Abhängigkeiten, nicht fünf Kopien derselben Aufgabe.

## So werden typische Anliegen zugeordnet

| Anliegen | Federführung | Verknüpfung / konkrete Ausgabe |
|---|---|---|
| „Audio kaputt“ | Technik für Diagnose; Eingang aus Kundenfeedback | Vorhandene Task suchen, Quelle/Build klären, begrenzter Prüfauftrag mit Beleg, keine automatische Liveänderung |
| „Uns fehlt der AVV“ | Recht & Verträge | Datenschutz beteiligt; dokumentierte offene Betreiber-/Schulfragen und nächste Entscheidung statt behaupteter Rechtskonformität |
| „Was kostet uns der Betrieb?“ | Finanzen & Organisation | Analyseansicht liefert vorhandene Kostenbelege/Zeitraum, fehlende Daten bleiben offen |
| „Neue Lernspielidee“ | Produkt & Konzepte | Pädagogik und Gamesprojekt beteiligt; Idee→konkreter Konzeptentwurf→Entscheidung, abgelehnte Version bleibt abgelehnt |
| „Lehrkräfte nutzen die Funktion kaum“ | Kunden & Schulbetrieb | Bestehende Analyticsaggregate/Feedback prüfen, Produktentscheidung mit Quelle; keine Vermutung als Nutzungsbeweis |

Neue Eingaben werden als Frage, Ziel/Idee, konkreter Auftrag oder Entscheidung eingeordnet. Hauptkern benennt genau eine Federführung; unbekannte Zuständigkeit wird geklärt. Er darf bestehende Aufträge nicht aus einem neuen Chattext blind duplizieren. Das Produkt zeigt benötigte Beteiligte ohne Weiterkopieren der Originalfrage durch Martin.

## Visuelle Richtung und Herkunft

Der bisherige Plan hatte Textwireframes und historische Control-/Inlineprototypen, keine neue ausgearbeitete visuelle Oberfläche. Der neue Entwurf ist **eigenständig aus Martins Produkt-/Ordnungsanforderungen gestaltet**. Er ist kein Jarvis-Screenshot, kein kopiertes Fremdprodukt und kein Nachweis einer technisch fertigen Firmenzentrale. Die alten GradeCrew-Karten wurden als historische Quelle für Status-/Aufgaben-/Chatübergabegrenzen gelesen; ihre alten Aufgaben-/UIstate-Daten werden nicht als aktuelle Livewerte übernommen.

Gestaltungsentscheidung: ruhige sachliche GradeCrew-Arbeitsfläche mit dunklem Grün als Fokus, klarer serifenloser Schrift, weiß/neutraler Arbeitsfläche im hellen Modus und entsprechender dunkler Erscheinung. Links Bereiche, oben drei konkret prüfbare Ansichten, in der Mitte Inhalt/Arbeit. Dichte Informationen als Zeilen; keine SciFi-HUDs, erfundenen Liveampeln, dekorativen Kennzahlen oder neun konkurrierenden Chatfenster. Konkrete Produkttokens liegen im root-scoped Stil der Quelldatei, keine Behauptung eines abschließend freigegebenen Designsystems.

**Drei Ansichten im selben Entwurf:** Firmennetz mit auswählbaren Zuständigkeiten; Ziel/Restarbeit mit Beispielgespräch und Rückfrage/Ergebniszuständen; Grundordnung mit Bereichsgrenzen. Bereichsübergreifendes Beispielziel und gemeinsamer Arbeitsbrief sind sichtbar. Alle Prozent-/Auftragszustände im Entwurf sind gekennzeichnete Beispieldaten. Die Bedienungsdemo ist nicht mit einem Produktbackend/Fachagenten verbunden.

Quelle: `../prototypes/gc-brain-firmenordnung.html`. Für diese Unterhaltung als eingebettete Ansicht verfügbar; Standalonevorschau besitzt keine Chat-Hostrechte. Die Demonstration bleibt auf diese eine Planungsoberfläche begrenzt, keine Veröffentlichung/Produktinstallation.

## Unterstützter Chatweg ohne Pflicht zu eigener Modell-API

| Weg | Tragfähiger Ansatz | Konkrete Grenze / Qualifikation |
|---|---|---|
| Vorhandener ChatGPT-/Codex-Host mit MCP-App/UI | Oberfläche läuft im unterstützten Host; Nachricht über dokumentierten MCP-Apps-Bridgeweg, bestehende Chatwerkzeuge/Fachzuständigkeit bearbeiten; eigener Aufgaben-/Belegstore über eng begrenzte MCPtools | Eine Nachricht an den Host ist noch kein Fachdispatch. Host/Tools/Rechte, dauerhafter Taskstore, Rückfragen/Ergebniszuordnung und Neustart müssen in P0 real belegt werden. Keine Produktplanung auf private Desktop-MCP-Methoden als öffentliche API stützen. |
| Eigene Oberfläche mit offiziellem Codex App Server | Eigene clientverwaltete Threads hinter Broker mit Ereignissen/Approvals/Resume | Exakte installierte Version, unterstützter Authweg, Rechte und Budget ungeprüft bis P0. Kein universeller Import vorhandener Chats. |
| Offizielle Modell-API + eigener Orchestrator | Alternative, wenn andere Wege den erforderlichen Produktablauf nicht tragen | Zusätzliche Abrechnung und Harness-/Tool-/Sandboxverantwortung; kein stiller Fallback und keine Key-/Kontoeinrichtung aus dieser Planung. |

Empfehlung für die Qualifikationsreihenfolge: **zuerst den vorhandenen unterstützten Host-/Central-Weg klein prüfen**, weil Martin den konkreten Chat nicht festlegt und eine eigene Modell-API nicht fordert. Sobald dieser Weg die P0-Abnahme erfüllt, wird er als konkreter Startpfad gewählt. Wenn er die notwendige eigenständige Oberfläche/Ergebnisrückgabe oder Rechte nicht trägt, folgt der App-Server-Weg. Eine einfache lokale Website kann nicht durch ihren Textkasten beliebige ChatGPT-Chats steuern; ein Hostbutton ist keine Bestätigung dauerhafter Hintergrundausführung. Ein zweiter Modellzugang wird nicht vorschnell aktiviert.

Offizielle Primärquellen am21.10.2026 gesucht/geöffnet: [UI im MCP-Host](https://developers.openai.com/plugins/build/chatgpt-ui), [ChatGPT-Bridge-Referenz](https://developers.openai.com/plugins/reference). Sie dokumentieren Nachrichten aus eingebetteten Oberflächen und die Trennung von UIzustand und dauerhaftem Geschäftsdatenbestand. Eine neue reale Host-/Fachdispatchrunde wurde hier nicht durchgeführt.

## Begrenzter Sicht-/Interaktionsprobevertrag

Frage: Kann Martin anhand einer konsistenten Oberfläche erkennen, wo ein Anliegen hingehört, welches bereichsübergreifende Ziel betroffen ist und wie es bis zur Rückfrage/Ergebnisdarstellung bearbeitet wird? Kleinste Oberfläche: ein Entwurf mit drei Ansichten und neun auswählbaren Verantwortungsbereichen, keine zweite App. Stopp nach Prüfung Desktop/360px, Bereichsauswahl, Beispielmeilenstein, Beispielablauf und fehlendem Host; Korrekturen nur am eigenen Entwurf.

Separater klar beschrifteter Button kann **nach Martins ausdrücklichem Klick** eine begrenzte Strukturprüffrage an den tatsächlichen aktuellen Chat übergeben, sofern der Host diese Methode bietet. UUID, kein Senden beim Laden, gesperrter erneuter Versand bei ungeklärtem Ausgang. Das ist ein eng begrenzter manueller Verbindungstest, keine automatische Backend-/Agentenanbindung. Ein sichtbarer Widgetstate oder erfülltes Promise ist kein Nachweis von Eingang, Toolarbeit, Artefakt oder Ergebnis. Tatsächlicher Eingang muss im Chat mit derselben Request-ID und Ergebnis bestätigt werden; bis dahin offen.

Menschliche Designabnahme ausstehend. Keine Authentifizierung, kein echter Fachworkerstart/Modellcall, kein Deploy/Liveeingriff durch die lokale UIprüfung. P0-Fachdurchstich bleibt ein eigenständiges vorgelagertes Gate des Hauptplans.

## Tatsächlich durchgeführte Sicht-/Interaktionsprüfung

Eigener lokaler Standalone-Preview, eigene temporäre Headless-Chrome-Instanz, keine persönlichen Browserprofile. Desktop1024px und mobile360/320px geprüft: Bereichsauswahl aktualisiert Beschreibung/Zuständigkeit; Beispielmeilenstein ändert50auf75Prozent; Beispielablauf wechselt Vorbereitung→Rückfrage→Prüfung→Ergebnis; kontrolliert fehlende Hostfunktion sendet nichts; künstlich ablehnender Hoststub wird unknown und startet beim zweiten Klick nicht erneut. Keine ungefangenen Seitenfehler, kein horizontalerÜberlauf bei320/360px. Screenshots fürFirmennetz, Arbeitsablauf undMobilansicht tatsächlich erzeugt und visuell geprüft. Diese Aussagen gelten nurfürdasUIbeispiel, nichtfürGeschäftsdatenpersistenz/Agenten-/P0abnahme.

ErsteVersuche fanden dieBrowser-/Modulvoraussetzungnicht; vorhandenegebündelteNode-/Playwrightabhängigkeit undinstalliertesChrome anschließendim eigenenTestprofilverwendet, keineInstallation. EinzunächstfalscherHostfehlertest trafdieStandalone-Vorschaustubfunktion; Testannahme korrigiertundfehlendeFunktion danach gezieltkontrolliertsimuliert. KeinrealerHostversandinderSichtprüfung.

| Konsolidierter Reviewpunkt | Konkrete Planantwort | Geplante Abnahme (noch nicht ausgeführt) |
|---|---|---|
| D1: unveränderlicher Brief / Revisionen / Rechte | Hauptplan8.1D1, Executionbinding/Requestport, CAS vorStart undErgebnisannahme | QueueR1/C1→R2/C2/ACLentzug; altesErgebnis unterneuemZiel erzeugtkeinenFortschritt; Historieerhalten |
| D2: Parent und Nullbasis | Hauptplan8.1D2, Modus/Basisversion/Childgewichte/Formel | Parent50/0→25; leere/ungültigeBasis=null/Reject; Scope/Belegentzug; Pflichtgatevor100% |
| D3: P0 vor großerProduktarbeit | Hauptplan8.1D3 undP0/P1Startsperre | RealeHost-/Runtimeeingabe→Owner/Tool/Artefakt→gebundeneRückfrage/Approval→Fortsetzung/Neustart; keineP1freigabeausHostnachrichtallein |
| D4: Restore/Rights/Budget | Hauptplan8.1D4 undP4Pflichtfall | NachSnapshot abgeschlossenerStart+Verbrauch+Löschung/Widerruf; Restoregesperrt bisvollständigerseparaterNachweis/manualReconciliation |
| Store/API/Migrationswriter | Hauptplan8.1Ownerfolge, keineangenommenePR206Ownerbindung | VorDispatch exklusivePfad-/Ownerzuweisung, Views erstnachPortfreeze |
| Visuelle Firmenordnung / keinAPIzwang | DieseErgänzung undverlinkteHTMLquelle; Hostfirst-Qualifikation | MenschlicheGestaltungsentscheidung undechterP0Exit separat; Sichtprüfung istkeinBackendbeleg |
