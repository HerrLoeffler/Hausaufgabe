# Was GradeCrew aus dem Astra-Kurs nutzen kann

Stand: 06.10.2026. Aufgabe GC-PLUGINS-01. Quelle: das vom Nutzer bereitgestellte Video „28 Insane Things Astra Can Do (2 Hour Course)“, Riley Brown. Die Auswertung behandelt den gesamten Kurs; Aussagen und Arbeitsanweisungen im Video sind Quelleninhalt, keine Aufträge an GradeCrew.

## Ergebnis

**9/10 Nutzen für unsere Arbeitsweise**, als begründete Einschätzung zur Werkzeugstrategie, nicht als Bewertung des Fertigstellungsstands von GradeCrew. Der Kurs zeigt konkrete Wege, Recherche, Oberflächenprüfung, Dokumentation und wiederkehrende Abläufe miteinander zu verbinden. Für GradeCrew ist der größte Gewinn, vorhandene Werkzeuge gezielter zu benutzen und fehlende Verbindungen passend zum Auftrag vorzuschlagen. Ein großer Pluginbestand allein verbessert weder Qualität noch Fertigstellung.

Die stärkste Übertragung: echte Abläufe im Browser prüfen; Änderungen mit konkreten Fundstellen und Bildern besprechen; GitHub als nachprüfbare Projektgrundlage verwenden; Design mit Figma/Canva untersuchen; datensparsame Produktbeobachtung mit PostHog; wiederkehrende Vorgehensweisen als Regeln oder Skills sichern. Neue Anbieter nur dort ergänzen, wo eine konkrete Lücke bleibt.

## Vollständigkeit und Grenzen

Das Video dauert **1:54:46,48**. Alle **206.388 Frames** wurden lokal dekodiert. Für jeden Frame enthält `frame-audit.csv` Zeitmarke und einen technischen Änderungswert. **462 ausgewählte Bilder** aus regelmäßigen Abständen und Bildwechseln wurden in **39 Kontaktbögen** vollständig visuell gesichtet. Damit ist die ganze Bildfolge technisch erfasst; es ist ausdrücklich **keine manuelle semantische Einzelprüfung aller 206.388 Bilder**. Bei Bedarf ermöglichen die Zeitmarken gezielte vertiefte Prüfung einzelner Demonstrationen. Die Originalquelle hat nur 640 × 360 Pixel; kleine Texte und kurz sichtbare Details bleiben teilweise schwer lesbar.

Die gesamte Tonspur wurde lokal mit Whisper base.en transkribiert: **2.689 Abschnitte**, englischer Originaltext mit Zeitmarken und SRT-Untertiteln. Der Text wurde über die gesamte Laufzeit zur Inhaltsanalyse gelesen. Das Transkript ist automatisch, nicht wortgetreu manuell abgenommen. Insbesondere Codex wird gelegentlich als „codecs“ oder „Kodak’s“ erkannt; Produktnamen und einzelne Zahlen müssen bei wörtlicher Weiterverwendung gegen das Original geprüft werden. Es wurde keine kostenpflichtige Transkriptions- oder Gemini-API benutzt und das Video nicht an einen externen Videodienst hochgeladen.

Lokale Nachweise: `media-info.json` mit Quellhash, `frame-audit-info.json`, `frame-index.json`, `transcript-segments.jsonl` mit Erkennungswerten, `transcription-info.json`, Originaltranskript und Untertitel. Vollständiges Video, Transkript und Bildsammlung bleiben außerhalb des öffentlichen GitHub-Repositories. Die dortige Fassung enthält nur diese eigenständige Auswertung und Projektregeln.

## Alle 28 Themen und ihre Übertragung

Zeitmarken sind ungefähre Kapitelanfänge, keine sekundengenauen Schnittmarken. Einleitung ab 00:00; Rückblick und Schluss ab etwa 1:50:51 bis zum Ende ebenfalls berücksichtigt.

| Nr. | Ab | Inhalt des Kurses | Konsequenz für GradeCrew |
|---|---|---|---|
| 1 | 03:30 | App und Modell unterscheiden | Fähigkeiten hängen auch von Werkzeugen, Zugriff und Umgebung ab. Ein Modellname allein beweist keine Integration. |
| 2 | 06:10 | Web-Anwendungen erstellen | Lokale Vorschau, getestete Umsetzung und veröffentlichter Betrieb getrennt nachweisen. |
| 3 | 10:44 | Sites mit Zugang, Daten und persönlichem Dashboard | Gut für getrennte Demonstrationen oder interne Prototypen; bestehende GradeCrew-Infrastruktur nicht aufgrund dieser Demo ersetzen. Alte im Kurs genannte Limits nicht als aktuelle Limits übernehmen. |
| 4 | 18:21 | Desktop- und iOS-Apps; iOS-Demo etwa 22:00 | Bestehende hybride SwiftUI/WKWebView-App fortführen. Simulator, Archive, TestFlight und echte Geräteabnahme bleiben eigene Schritte. |
| 5 | 24:09 | Eingebauter Browser, Recherche und UI-Prüfung | Direkt nützlich: Lehrerablauf, Tutorial, Import, Abgabe und Auswertung mit kontrollierten Testdaten prüfen. Native Browserwerkzeuge sind bereits verfügbar. |
| 6 | 32:31 | Dokumente, Tabellen, Präsentationen und Vorlagen | Abnahmeberichte, Testmatrizen und Unterrichtsmaterialien passend zum gewünschten Format erstellen; dafür sind Fähigkeiten bereits verfügbar. |
| 7 | 35:12 | Präzises Feedback durch Annotation | Bei Designfragen konkrete Position, Zustand, Gerät und gewünschtes Verhalten festhalten; sichtbare Belege ergänzen. |
| 8 | 38:48 | Produktionsstack mit GitHub, Vercel, Convex, Clerk | Beispiel des Autors, kein Migrationsauftrag. GradeCrew hat bestehende Firebase-, Sicherheits- und Releaseentscheidungen. |
| 9 | 44:45 | Projekte, Chats und Dateien | Aktuelle Projektregeln und Übergaben lesen. Gemeinsame Dateien sind nicht gleich vollständige Kenntnis aller Chats. |
| 10 | 48:56 | Mehrere Aufgaben gleichzeitig | Eigene Branches und Übergaben erhalten; gemeinsame Dateien bewusst abstimmen. Nebenläufigkeit braucht Zuständigkeit. |
| 11 | 51:19 | Sidebar organisieren | Kann Übersicht verbessern, ersetzt jedoch weder TODO noch überprüften Entwicklungsstand. Keine Umordnung ohne entsprechenden Auftrag. |
| 12 | 54:33 | Plugins und App-Verbindungen, eigene Integrationen | Native Fähigkeit, vorhandenes Plugin, fehlende Verbindung und eigener Skill sauber unterscheiden. |
| 13 | 1:03:17 | Mit verbundenen Quellen eigenständig Arbeit identifizieren | Bei einem Auftrag passende Hilfen aktiv erkennen und anbieten. Keine allgemeinen Kontoscans ohne passenden Zweck und Zugriff. |
| 14 | 1:05:46 | Blender-Assets erstellen und verändern | Optional für spätere Lehrvisualisierung; für aktuelle Web-, Security- und iOS-Abnahme geringer Vorrang. |
| 15 | 1:08:31 | 3D-Assets in ein Spiel integrieren | Schneller Prototyp ist möglich; sichtbare Größen-, Kamera- und Steuerungsprobleme zeigen den Bedarf an tatsächlicher Abnahme. |
| 16 | 1:09:34 | Interaktive Lernmodelle | Für spätere Erklärmodule interessant. Fachliche Richtigkeit, Barrierefreiheit und Lernwirkung zusätzlich prüfen. |
| 17 | 1:13:17 | Geplante Aufgaben und Automationen | Nur bei gewünschter Überwachung einsetzen. Lokal laufender Mac und tatsächlich ausführende Cloud-Umgebung unterscheiden. Hier keine neue Automation beauftragt. |
| 18 | 1:16:27 | E-Mail und Nachrichten | Entwürfe und Zusammenfassungen können helfen; das Video autorisiert kein Senden von GradeCrew-Nachrichten. |
| 19 | 1:19:02 | Wiederholbare Formate als Skills | Bewährte GradeCrew-Abläufe mit Auslöser, benötigten Belegen und Prüfkriterien sichern. Das ist Arbeitsanweisung, kein Training des Modells. |
| 20 | 1:23:00 | Record & Replay für beobachtete Abläufe | Kann einen konkreten Gerätefehler oder Designablauf nachvollziehbarer machen. Aufzeichnung allein beweist keine robuste Automatisierung. |
| 21 | 1:26:52 | Externe APIs in Skills, darunter ScrapeCreators | Anbieterzugang, Kosten und Datenfluss gesondert prüfen. Der Autor erstellt eine Verbindung; „Add“ bedeutet nicht automatisch fertiges kostenloses Plugin. |
| 22 | 1:30:06 | Videoanalyse über externe Gemini-API | Alternative für große Videomengen; für diese Datei war lokale Verarbeitung ausreichend. Gezeigte Modellnamen, Geschwindigkeit und Preise sind keine verifizierten aktuellen Garantien. |
| 23 | 1:35:51 | Diagramme direkt im Chat | Bei komplexen Abgabe-, Sicherheits- oder Freigabeabläufen gezielt verwenden; hierfür ist kein neues Plugin nötig. |
| 24 | 1:38:03 | Fernsteuerung vom Telefon | Der Autor sagt ausdrücklich, dass der Computer eingeschaltet sein muss. Daraus folgt keine Ausführung bei ausgeschaltetem Mac. |
| 25 | 1:42:49 | Bilder erzeugen und durch Kommentare bearbeiten | Für visuelle Konzepte nutzbar, bereits vorhanden. Produkttexte und Steuerelemente sollten weiter als zugängliche UI umgesetzt werden. |
| 26 | 1:45:17 | Unteragenten für unabhängige lange Aufgaben | Können Zeit sparen, verbrauchen zusätzliches Budget und brauchen klare Aufteilung. Im Kurs wird die gestartete Recherche nicht bis zum Ergebnis abgewartet. Kein Qualitätsnachweis ihrer Resultate. |
| 27 | 1:48:09 | Computer Use | Für konkrete UI-Aufgaben verfügbar; APIs und passende Fachwerkzeuge bevorzugen, wenn sie verlässlich und zugänglich sind. Zukunftsprognosen des Autors sind keine Zusagen. |
| 28 | 1:49:35 | Offene Anwendungsfälle und Gesamtüberblick | Bei Nutzerfragen Werkzeugmöglichkeiten mitdenken. Machbarkeit, vorhandenen Zugriff und nachprüfbares Ergebnis trotzdem einzeln bewerten. |

## „Add Build iOS apps“ und „Add ScrapeCreators“

**Build iOS apps:** Der Autor bezeichnet dies im Rückblick ausdrücklich als Skill. In dieser Sitzung ließ sich kein exakt gleichnamiges verfügbares Katalog-Plugin bestätigen. iOS-Fähigkeiten werden dadurch nicht ausgeschlossen: GradeCrew besitzt bereits eine hybride App. Für zusätzliche Automatisierung ist das offizielle **MobileBuildMCP** relevant; das frühere XcodeBuildMCP-Repository leitet inzwischen dorthin weiter. Es bietet Werkzeuge für mobile Entwicklung, setzt aber eine passende lokale Entwicklungsumgebung voraus. Keine Verbindung wurde hier eingerichtet. [Offizielles Repository](https://github.com/getsentry/MobileBuildMCP).

**ScrapeCreators:** Im Video wird um 1:26:52 ein eigener API-Skill eingerichtet und später für Creator-Recherche verwendet. Der Anbieter dokumentiert API, MCP, CLI und Skill; damit ist eine eigene Verbindung grundsätzlich nachvollziehbar. Im zugänglichen Plugin-Katalog wurde kein exakter ScrapeCreators-Treffer gefunden. Das bedeutet nicht, dass der Dienst weltweit nicht verfügbar ist. Externe API-Nutzung kann separat berechnet werden. Für unser lokales Video war dieser Zugang unnötig. [Offizieller Anbieter](https://scrapecreators.com/).

Ein **Plugin** kann mehrere Fähigkeiten bündeln, beispielsweise Skills und MCP-Werkzeuge. Ein **Skill** beschreibt einen wiederholbaren Arbeitsablauf; ein **MCP-Server** stellt Werkzeuge oder Daten bereit; eine **API** ist der eigentliche Dienstzugang. Installation, Verbindung mit einem Konto, notwendige Berechtigungen und erfolgreiche Nutzung sind getrennte Zustände. [Offizielle Plugin-Dokumentation](https://developers.openai.com/plugins/concepts/plugins).

## Prioritäten für GradeCrew

Alle Bewertungen verwenden dieselben Kriterien: Nutzen für aktuelle GradeCrew-Aufgaben, Passung zum bestehenden Stack, Aufwand und Kosten sowie Möglichkeit, Ergebnisse nachvollziehbar zu prüfen. 1 = kaum geeignet, 10 = sehr gut geeignet. Die Zahlen sind Einschätzungen, keine Messwerte und keine Sicherheitszertifikate. Der Katalogstatus wurde am 06.10.2026 geprüft; „installiert“ belegt nicht automatisch Kontozugriff oder einen erfolgreichen Datenabruf.

| Werkzeug / Ansatz | Nutzen | Bestätigter Stand | Stärke, Grenze und nächster sinnvoller Einsatz |
|---|---:|---|---|
| Native Browserprüfung | 9/10 | Werkzeuge verfügbar | Direkter Nutzen bei Tutorial und Import/Abgabe. Kontrollierte Testumgebung erforderlich; echte iPad-/iPhone-Abnahme bleibt zusätzlich nötig. |
| GitHub | 9/10 | Installiert, Repo in dieser Aufgabe tatsächlich gelesen und beschrieben | Belegt Branches, PRs und Regeln. Passt zur bestehenden Koordination; dadurch bestehende Arbeit fortsetzen statt erneut bauen. |
| Codex Security | 9/10 | Katalog verfügbar, nicht installiert | Ergänzende Code-Sicherheitsanalyse passend zu offenen Security-Aufgaben. Kein Ersatz für projektspezifische Gates, unabhängige Reviews oder Gerätetests. Einrichtung und verfügbaren Funktionsumfang zuerst prüfen. |
| Firebase MCP | 8/10 | Offizieller Dienstweg bestätigt, hier nicht eingerichtet | Passt direkt zum bestehenden Backend und kann Projekt-/Regel-/Diagnosekontext bereitstellen. Zugriff gezielt auf die benötigte Umgebung begrenzen; keine Production-Freigabe durch Installation. |
| Context7 | 8/10 | Vom Nutzer installiert; Werkzeuge verfügbar | Aktuelle Bibliotheksdokumentation beim konkreten Implementierungsproblem. Versionen mit dem Projekt abgleichen; offizieller Primärbeleg bleibt bei kritischen Fragen erforderlich. |
| OpenAI Developers | 8/10 | Katalog verfügbar, nicht installiert | Offizielle Hilfen für OpenAI-Integrationen und Agenten. Besonders sinnvoll bei API-/SDK-Fragen; vorhandenes Pro-Abo ist keine Zusage kostenloser API-Nutzung. |
| Figma und Canva | 8/10 | Beide als installiert bestätigt | Designvarianten und konkrete visuelle Abstimmung. Gemeinsame Komponenten und vorhandene Crew-Assets erhalten; Entwurf ist keine geprüfte Produktimplementierung. |
| PostHog | 8/10 | Installiert; Telemetrie-Workstream vorhanden | Nutzungsmuster und Fehlerwege untersuchen, sofern die passende Umgebung Daten liefert. Keine Schülernamen, Antworten oder privaten Prüfungsinhalte in Telemetrie übertragen. |
| MobileBuildMCP | 8/10 | Offizieller Anbieterweg bestätigt, hier nicht eingerichtet | Bestehende iOS-App bauen und im Simulator untersuchen. Lokale Voraussetzungen und tatsächlich verfügbaren Zugang prüfen; reale Geräteabnahme bleibt offen. |
| Consensus | 8/10 | Als installiert bestätigt | Forschungsbelege für didaktische Entscheidungen und Lernmethoden. Treffer prüfen; eine Literaturquelle validiert nicht automatisch GradeCrew-Funktionen. |
| Dokumente, Tabellen, Präsentationen, Diagramme | 8/10 | Fähigkeiten vorhanden | Konkrete Abnahmeberichte und verständliche Erklärungen. Nach Nutzerbedarf auswählen; kein zusätzliches Plugin nötig. |
| Google Drive | 7/10 | Katalog verfügbar, nicht installiert | Hilfreich, wenn relevante Referenzen tatsächlich dort liegen. Aktuell kein belegter Zugriff auf solche Quellen; erst bei passendem Auftrag vorschlagen. |
| Linear | 6/10 | Katalog verfügbar, nicht installiert | Kann externe Teamarbeit anbinden. TODO/Registry sind bereits vorhanden; eine zweite Aufgabenquelle erhöht Abstimmungsaufwand. |
| Playwright MCP / CLI mit Skills | 7/10 | Offizieller Weg bestätigt, hier nicht zusätzlich eingerichtet | Für wiederholbare technische Browserprüfungen interessant. Microsoft empfiehlt für viele Coding-Agent-Abläufe CLI mit Skills; MCP passt zu längerem interaktivem Zustand. Vorhandene Browserwerkzeuge zuerst nutzen. |
| ScrapeCreators | 3/10 aktuell, 7/10 bei Creator-/Marketingauftrag | Extern bestätigt, exakter Katalogtreffer fehlt | Öffentliche Social-Media-Metadaten und Transkripte können spätere Marketinganalyse erleichtern. Für aktuelle GradeCrew-Produktabnahme niedriger Nutzen, zusätzlicher API-/Kostenaufwand. |
| Descript / vidIQ | 4/10 aktuell, 7/10 bei laufender Videoproduktion | Katalog verfügbar, nicht installiert | Für Tutorial-Schnitt bzw. Videorecherche denkbar. Keine Voraussetzung für die abgeschlossene lokale Transkription. |
| Vercel / Convex / Clerk oder neue App-Builder | 3/10 aktuell | Teile im Katalog verfügbar; keine neue Verbindung | Im Kurs relevant, für GradeCrew derzeit überwiegend Doppelstruktur und Migration ohne belegten Bedarf. |
| Blender | 3/10 aktuell, 7/10 für beauftragte 3D-Lehrmodule | Kursdemo; keine eigene Verbindung bestätigt | Später mögliche Lehrvisualisierung. Aktuelle Kernabläufe und Abnahme profitieren unmittelbarer von Browser-/Geräteprüfungen. |

Firebase dokumentiert einen lokalen MCP-Weg unter anderem für Projektkontext, Firebase-Werkzeuge und Diagnose. Das ist eine konkrete Stack-Ergänzung, keine automatisch eingerichtete oder garantiert nur lesende Verbindung. [Firebase-Dokumentation](https://firebase.google.com/docs/ai-assistance/mcp-server).

Für Browserautomation beschreibt Microsoft sowohl MCP als auch CLI/Skills und ihre unterschiedlichen Einsatzfelder. Wir benötigen für erste konkrete UI-Prüfungen keinen zusätzlichen Browseranbieter. [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp).

OpenAI Developers bündelt offizielle Ressourcen für die Entwicklung mit OpenAI. Etwaige Konto-, Schlüssel- und Abrechnungsvoraussetzungen einer konkreten Aktion bleiben getrennt. [Offizielle Beschreibung](https://developers.openai.com/learn/developers-codex-plugin).

## Rechercheumfang

Gezielte Suchen im tatsächlich zugänglichen Katalog zu iOS/Swift, Build iOS apps, ScrapeCreators, GitHub/Security, Firebase, PostHog, Sentry, Playwright, Context7, XcodeBuildMCP, Codex Security, OpenAI Developers, Drive/Linear/Notion, Design/3D, Video, Hosting, Übersetzung, Accessibility und Forschungsquellen. Ergebnisse wurden mit den vorhandenen Fähigkeiten und offiziellen Anbieterquellen abgeglichen.

Das ist eine breite, auf GradeCrew zugeschnittene Auswahl, keine vollständige Durchsuchung „ganz ChatGPT“ oder aller Integrationen weltweit. Eine belastbare Gesamtzahl von Plugins ist daraus nicht ableitbar. Kein exakter Katalogtreffer wurde für Build iOS apps, ScrapeCreators, Sentry, Playwright und XcodeBuildMCP bestätigt. Drittanbieter-MCPs können trotzdem verfügbar sein. BigQuery war im Katalog administrativ gesperrt und ist keine aktuelle Empfehlung.

## Bei welchen Fragen ich künftig was anbieten soll

| Nutzerfrage / Auftrag | Passende proaktive Hilfe |
|---|---|
| „Warum funktioniert die Abgabe / das Tutorial nicht?“ | Aktuellen Branch prüfen, Ablauf im Browser reproduzieren, vorhandene Fehler-/Diagnosebelege heranziehen; bei konkreter Backend-Lücke Firebase-Zugang vorschlagen. |
| „Ist das sicher genug?“ | Aktuelle projektspezifische Security-Gates prüfen; Codex Security als zusätzliche Analyse anbieten. Keine Sicherheitsfreigabe allein aus einem Toolbericht ableiten. |
| „Wie machen wir diese Oberfläche besser?“ | Konkrete visuelle Varianten mit vorhandenem Figma/Canva, annotierte Fundstellen und Gerätevergleich anbieten. |
| „Was nutzen Lehrer wirklich, wo brechen sie ab?“ | Vorhandenen PostHog-Kontext und datensparsame Ereignisse prüfen; Zugriff und passende Umgebung zuerst bestätigen. |
| „Können wir das auf dem iPad/iPhone prüfen?“ | Bestehenden iOS-Workstream und TestFlight-Nachweise lesen, Simulatorhilfe anbieten, physische Geräteabnahme getrennt behandeln. |
| „Was ist didaktisch sinnvoll?“ | Consensus/Literaturrecherche und überprüfbare Quellen anbieten, anschließend konkrete Produktentscheidung ableiten. |
| „Analysiere diese Videos oder Konkurrenten.“ | Für lokale Dateien lokale Transkription/Bildanalyse; bei öffentlichen Social-Media-Quellen ScrapeCreators, vidIQ oder passende Suchdienste auf Nutzen und Kosten prüfen. |
| „Beobachte das und sag mir Bescheid.“ | Passende Automation nur aufgrund dieses Auftrags einrichten; ausführende Umgebung und Benachrichtigungsgrund klar festhalten. |
| „Das machen wir immer wieder gleich.“ | Einen schlanken wiederverwendbaren Ablauf oder Skill anbieten, erst nach bewährter Arbeitsweise mit klaren Auslösern. |
| „Erkläre mir diesen Ablauf.“ | Kurze Erklärung; bei hilfreicher Struktur ein Diagramm oder interaktives Modell anbieten. |

Dauerhafte Arbeitsregel: bei jedem Auftrag kurz prüfen, ob native Fähigkeiten oder bereits installierte Verbindungen helfen. Falls ein externer Dienst eine erhebliche Lücke schließen würde, gezielt suchen und die ein bis drei besten Ergänzungen selbstständig anbieten: konkreter Nutzen, bestätigter Status und notwendiger Einrichtungsschritt. Empfehlungen bedeuten keine pauschale Installation, Nachrichtenfreigabe, kostenpflichtige Nutzung oder Production-Freigabe. Diese Regel ist eine gespeicherte Projektanweisung; Folgechats müssen sie lesen. Sie ist keine behauptete automatische Erinnerung aller Chats.

## Projektabgleich und Empfehlung

Aktueller Remote-main `8360bc5f056837118ffd83138ffa2468ae42647e` und seine Einstiegs-/Koordinationsregeln wurden gelesen. Offene PRs, Branchliste und Development-Status-Run `37374686618` wurden geprüft; die gelesene Branchliste war auf 100 Einträge begrenzt. Die bestehende zweite-Brain-Aufgabe GC-BRAIN-01 wurde als separate Arbeit erhalten. Dieser Kurs ist ein anderes Video und wurde neu verarbeitet.

Die bestehende GC-IOS-02-Übergabe nennt bereits eine hybride App sowie TestFlight-Nachweise; das wurde hier als Dokumentationsstand gelesen und nicht nochmals als frischer Upload verifiziert. TODO und Fachübergaben enthalten teilweise unterschiedliche ältere iOS-Stände. Vor einer konkreten iOS-Fortsetzung daher den tatsächlichen Branch, jüngsten Build und Gerätetest prüfen. GC-PLUGINS-01 verändert weder Release Train noch Produktcode.

**Empfehlung:** Zuerst die vorhandenen Werkzeuge konsequent einsetzen. Context7 wurde inzwischen vom Nutzer installiert und wird bei passenden Bibliotheksfragen als vorhandene Hilfe berücksichtigt; ein konkreter Dokumentationsabruf wurde in dieser Analyse noch nicht benötigt. Codex Security und OpenAI Developers bleiben die weiteren empfohlenen Ergänzungen; ihren aktuellen Verbindungsstand vor Nutzung prüfen. Firebase MCP und MobileBuildMCP anschließend beim konkreten Backend- bzw. iOS-Auftrag einrichten. ScrapeCreators erst für einen tatsächlich beauftragten Creator-/Marketingablauf. Kein neuer App-Stack allein aufgrund des Videos.

Offen bleiben die Einrichtung neuer Integrationen, ihre tatsächliche Konto-/Datenverfügbarkeit und gegebenenfalls externe Kosten. Hier wurden keine Plugins installiert, keine Keys eingerichtet und keine Deployments gestartet. Das Originalvideo bleibt unverändert.
