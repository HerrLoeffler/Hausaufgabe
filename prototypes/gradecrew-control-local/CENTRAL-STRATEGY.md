# GradeCrew Central – Bedienung und fachliche Ordnung

GC-BRAIN-01, 06.10.2026. Vertiefter Lösungsentwurf nach Martins erneuter Bitte. Noch keine implementierte Plugin-Brücke. Ergänzt ORGANIZATION.md; frühere Arbeit und Nachweise bleiben erhalten.

## Entscheidung

Eine Anwendung mit einem gemeinsamen Aufgabenbestand, erreichbar als große Sidebar-App und als schmales Panel neben dem Gespräch. Freie Eingabe im Zentralchat bleibt ein gleichwertiger Zugang. Beide Zugänge sollen denselben Auftrag erzeugen und auf denselben Datensatz zurückmelden.

Bewertung für diesen Bedarf: einfache Bedienung, Überblick über viele Aufgaben, nachvollziehbare Ausführung, Wiederverwendung und laufender Pflegeaufwand. Einschätzungen, keine gemessenen Qualitätswerte:

| Lösung | Eignung | Stärke | Nachteil |
|---|---|---|---|
| Nur Chat plus eingebettete interaktive Karte | 5/10 | Sofort erreichbar und wenig neue Oberfläche | Ergebnisse verstreuen sich weiter im Verlauf; Snapshot-Karten sind kein verlässlicher aktueller Gesamtbestand. |
| Separate Mac-App | 7/10 | Vorhandener Prototyp, eigenes Fenster und kontrollierte Oberfläche | Eigene Verbindung/Anmeldung/Updates, mehr Fensterwechsel; das Fenster allein startet keinen Agenten. |
| Integrierte App: Sidebar und Conversation-Panel, gemeinsamer Bestand | 9/10 | Übersicht und Gespräch nebeneinander, vorhandene App wiederverwendbar | Plugin-Registrierung, Berechtigungen, echte Nachrichten- und Ergebnisstrecke erst zu verifizieren. |

Sites ist eine mögliche Hostingentscheidung, kein vierter konkurrierender Aufgabenbestand. Zunächst die kleinste echte Integration prüfen. Wenn der aktuelle Client die benötigten Plugin-Oberflächen nicht unterstützt, bleibt die bestehende Mac-App der ehrliche Rückfallweg. Keine monatelange Eigenentwicklung einer zweiten Chatplattform.

## Drei Ebenen, die unterschiedliche Zwecke erfüllen

1. **Funktion**: langlebiger Verantwortungsbereich mit einem Hauptchat, etwa Audio & Sprache.
2. **Aufgabe**: begrenzter Auftrag mit bestehender Task-ID, Zustand, verantwortlichem Bearbeiter, Abnahmekriterien, Quellen und Ergebnis. Eine Funktion hat viele Aufgaben.
3. **Ausführung**: ein konkreter Arbeitsversuch mit tatsächlichem Modell, Kandidat, Prüfungen und Kosten-/Versuchshistorie. Kann einen zeitlich begrenzten Arbeitschat oder Unteragenten verwenden.

Der Funktionschat beantwortet Rückfragen und bündelt Entscheidungen. Er wird nicht zum unendlich langen einzigen Arbeitsgedächtnis. Eine versionierte fachliche Zusammenfassung und Aufgabenübergaben ermöglichen bei Bedarf einen Ersatzchat. Die logische Funktion bleibt gleich, selbst wenn ihr Chat irgendwann ersetzt wird.

Eine Aufgabe hat genau einen federführenden Bereich; weitere Bereiche sind Beteiligte oder Abhängigkeiten. Beispiel: Englische Hörtexte im Escape-Room können Audio als Verantwortlichen und Games/Internationalisierung als Beteiligte haben. Der Auftrag erscheint in mehreren gefilterten Ansichten, existiert aber nur einmal. Keine drei konkurrierenden Kopien und keine parallelen Bearbeiter derselben Dateien.

## Zielstruktur der Funktionschats

Für eigenständige, wiederkehrende Produktbereiche je ein Hauptchat. Einzelne Buttons, Fehler oder kleine Änderungswünsche werden Aufgaben, keine zusätzlichen permanenten Chats.

| Fachbereich | Umfang | Aktueller Chat / Konsolidierung |
|---|---|---|
| Prüfungen & Bewertung | Erstellung, Editor, Importe, Durchführung, Abgabe und fachliche Bewertung | Noch kein kanonischer Chat in der geprüften Auswahl; vorhandene Web-/Assessment-Übergaben zuerst zuordnen. |
| Schüler, Klassen & ASV | Schüleridentität, Klassen, Jahreswechsel, Import und Schulverwaltung | GC · Schüler, Klassen & ASV; alten Konzeptkontext ausdrücklich übergeben. |
| Konten & Rollen | Login, Lehrkräfte-/Adminrechte, Kontoübergabe | Noch keine eindeutige Chat-Zuordnung; gemeinsam genutzte Security-/Classroom-Grenzen beachten. |
| Audio & Sprache | Aufnahme, Diktieren, Hörtexte, Sprachausgabe und Player | GC · Audio & Sprache. |
| Internationalisierung | Oberflächen-, Inhalts- und Bewertungssprache, Übersetzungen | GC · Internationalisierung; frühere Planung übergeben. |
| Games | Spiele-Hub, Escape-Welten, Tutor und Spiellogik | Games GC; PostHog-Allgemeinthemen zu Statistik verweisen. |
| Design & Navigation | Layout, Designsystem, Markenassets, Startseite, Navigation | Design GC; keine zweite Crew-Asset-Quelle. |
| Crew & KI-Assistenten | Verhalten von Coco/Remy/Emmi/Wilma, Qualität und Modellanbindung | Noch keine eindeutige Hauptchat-Zuordnung; passende bestehende Crew-/Gateway-Übergaben verwenden. |
| Tutorial & Hilfe | Einführung, Hilfen, Wiederaufruf und Barrierefreiheit der Anleitung | Noch kein eigener Hauptchat in der geprüften Auswahl; TODO enthält mehrere eigenständige offene Aufgaben. |
| iPhone & iPad | Native Hülle, Gerätefunktionen, Dateien und Gerätetests | GC · iPhone & iPad; L APP GC bleibt historische Quelle. |
| Statistik & Nutzung | Nutzungs-/Spielstatistik, Telemetrie, PostHog, datensparsame Ereignisse | Bisher quer in Games GC; fachlich eigener Bereich erforderlich. Noch keinen neuen Chat angelegt. |

Diese elf Bereiche sind eine Zielzuordnung. Für noch nicht zugeordnete Bereiche erst frühere Chats und die fachlichen Übergaben prüfen, danach fehlenden Hauptchat mit einem konkreten Startauftrag anlegen. Keine leeren Chats nur zur optischen Vollständigkeit. Neue Bereiche nur bei dauerhaft eigenständigem Scope.

**Betrieb & Qualität** hat drei klare Zuständigkeiten: Automatisierung & Integration; Sicherheit & Datenschutz; Fehler & Rückmeldungen. Sicherung/Restore, Release und Infrastruktur hängen an Betrieb; ein Funktionsfehler verweist von BugOps auf genau seine fachliche Aufgabe.

**Wissen & Planung** soll perspektivisch zwei Zugänge haben: Projektwissen/Second Brain und Produkt/Kosten/Strategie. Plugin-Recherche, Promptbibliothek, Wiederaufnahmevorlagen und abgeschlossene Einzelfragen werden dort dokumentierte Quellen. Sie brauchen nicht dauerhaft jeweils einen aktiven Chat. Noch aktive Recherche oder ungeklärte Aufgaben nicht vorschnell archivieren.

## Das sieht Martin täglich

Die Startansicht priorisiert drei Dinge: **Braucht dich**, **Wird bearbeitet**, **Bereit zum Testen**. Darunter die Funktionen mit Status und nächstem Schritt. Eine Suche findet Aufgaben, Entscheidungen und Ergebnisse. Das Archiv bleibt erreichbar, wird aber nicht standardmäßig gezeigt.

Im Aufgabendetail: Name, Ziel, belegter Entwicklungsstand mit Datum/Quelle, nächster Schritt, zuständiger Hauptchat, Eingabefeld und Ergebnisverlauf. Modellvorschlag und Ausführungsweg werden beim Start verständlich angezeigt; technische Logs sind optional aufklappbar.

Fünf bekannte Farben bleiben, zusätzlich Text. Entwicklungs-/Release-Stufe und aktuelle Aktivität sind verschiedene Angaben: Eine Funktion kann auf Staging stehen, während ein Folgefehler bearbeitet wird. Keine pauschale grüne Funktionskachel, wenn nur eine Teilaufgabe live ist. Fehlender/alter Nachweis muss erkennbar bleiben.

## Aufträge und Antworten

1. Martin wählt eine Aufgabe oder schreibt frei in die Zentrale. Die Eingabe wird als Standfrage, Notiz oder Änderungsauftrag eingeordnet; echte Mehrdeutigkeit einmal klären.
2. Bestehende Task-ID und laufende Arbeit abgleichen. Passenden Bereich und Modellvorschlag anzeigen. Eine Auswahl im Panel ist noch kein Arbeitsauftrag; beim expliziten Start gilt der angezeigte Umfang.
3. Der Auftrag wird dauerhaft mit Request-ID und Revision gespeichert. Doppelklick oder Wiederanlauf darf keine zweite Ausführung erzeugen.
4. Die Zentrale übergibt klar begrenzte Arbeit an den tatsächlich erreichbaren Bearbeiter. Ein Mensch muss Modell/Chat nicht manuell suchen. Tatsächliche Client-/Modellfähigkeit vor Ausführung prüfen; keine unsichtbare API-Ausweichroute.
5. Bearbeiter und nötige unabhängige Prüfer arbeiten; Rückfragen erscheinen an derselben Aufgabe. Abbruch, Fehler, ausstehende Antwort und unbekanntes Ergebnis haben unterscheidbare Zustände.
6. Ergebnis enthält die tatsächlich erreichte Stufe, Prüfung und Testmöglichkeit. Die App lädt den bestätigten Datensatz neu. Ein Erfolgssatz des Agenten allein färbt die Aufgabe nicht grün.

Der Prototyp kann bislang lokale Entwürfe und Resultate speichern; die vollständige native Plugin-/Chat-Rundreise ist offen. Die gespeicherte Auswahl GC-ANALYTICS-01/Luna im Inline-Widget ist Kontext, kein nachgewiesener Auftrag und kein vollzogener Modellwechsel.

## Wissensbestand und aktuelle Nachweise

- Repo-TODO: Aufgaben und Anforderungen.
- Workstream-Übergaben: Entscheidungen, offene Fragen, nächste Schritte und Versuchshistorie.
- GRADECREW_STATE plus aktuelle GitHub-/Deploy-Nachweise: Release-Stufen.
- Zentrale: Anzeige dieser Quellen sowie dauerhaft gespeicherte neue Eingaben, Zuordnung und Auftragsereignisse.

Keine manuelle zweite Kopie aller Stände pflegen. Neue Eingaben beginnen lokal als erfasst; erst nach bestätigter Speicherung in der gemeinsamen Projektkoordination als synchronisiert anzeigen. Konflikte zwischen aktuellem Repo und Entwurf sichtbar abgleichen. Gleiches gilt für mehrere gleichzeitig geöffnete Ansichten. Rohchatverläufe sind Quellen, nicht der einzige Aufgabenspeicher.

## Inhaltlich aufräumen und zusammenführen

Pro Quellchat Entscheidungen, Anforderungen, offene Punkte, verworfene Ansätze und Belege extrahieren. Ziel-Funktionschat und fachliche Zusammenfassung benennen. Widersprüche chronologisch und anhand aktueller Quellen auflösen; ungeklärte Widersprüche sichtbar lassen. Aus Chatbehauptungen werden keine neuen Deploy-/Rechts-/Qualitätsnachweise.

Die Werkzeuge unterstützen keine verlustfreie Verschmelzung zweier originaler Gesprächsverläufe. Möglich ist eine ausdrücklich übermittelte Zusammenfassung im Zielchat mit Verweis auf Original und Anhänge. Genau dieses Verfahren wird für Internationalisierung und Schüler/ASV verwendet; Versand, Eingang und spätere Archivierung getrennt dokumentieren. Nicht sämtliche alten Nachrichten unkommentiert kopieren: Das würde veraltete Aussagen und Nebenthemen in den Hauptchat tragen.

Erst nach gesicherter Zuordnung und bestätigtem Eingang einen ersetzten Quellchat archivieren. Ein gemischter Chat bleibt erhalten, bis alle offenen Themen zugeordnet sind. Bestehende Task-IDs, laufende Versuche, Reservierungen und Fehlerhistorie bleiben identisch. Archivierung löscht keine Originale.

## Kosten und Mac-unabhängige Arbeit

Die UI braucht zum Anzeigen, Sortieren und Speichern keine eigenen Modellaufrufe. Entwicklungsarbeit nutzt den tatsächlich gewählten Work-/Codex-Zugang mit dessen Kontingent. Die vorhandenen qualifizierten Guardian-/Produkt-API-Wege bleiben separat bestehen. Keine Kostenfreiheit oder unbegrenzte Nutzung behaupten.

Eine lokale App und ein lokaler Chat arbeiten bei ausgeschaltetem Mac nicht weiter. Martins Cloud-Wunsch erfordert zusätzlich eine nachgewiesen unterstützte Cloud-Ausführung mit passenden Projektzugängen. Hosting oder ein Panel allein erfüllen das nicht. Vor einer Betriebsentscheidung einen realen Abo-Cloud-Auftrag samt Rückmeldung testen; wenn nicht verfügbar, Einschränkung zeigen statt unbemerkt kostenpflichtig auszuweichen.

## Kleinstes sinnvolles nächstes Ergebnis

Echte Plugin-Verbindung mit einer vorhandenen Aufgabenkarte und zwei Einstiegen (groß/Panel). Zunächst eine nur lesende Standfrage senden, tatsächlichen Eingang und gespeicherte Antwort zeigen; Wiederholung und Verbindungsabbruch kontrolliert testen. Erst danach Änderungsauftrag mit Modellwahl, Review und Rückfrage ergänzen. Cloud-Ausführung danach als eigenes nachweisbares Kriterium.

Abnahme: Martin kann eine Aufgabe finden, ohne Chatnamen zu kennen; die Frage erreicht nachweislich genau einen Bearbeiter; Antwort und Nachweise landen an derselben Aufgabe; veraltete Zustände und fehlgeschlagene Übergaben bleiben erkennbar. Keine bloß animierte Demo als erfüllte Integration werten.

Quellen: https://developers.openai.com/plugins/build/extensions und https://learn.chatgpt.com/docs/agent-configuration/subagents, am 06.10.2026 geöffnet. Projektquellen und konkrete Kontextübernahmen in CONSOLIDATION.md. Keine neue Deployment-Freigabe.


## Vergleich mit dem Video und nächster Ausbauschritt – 06.10.2026

Martins Screenshot bestätigt jetzt die sichtbare Rückantwort im Chat. Der Test Karte → Main-Chat → neu eingeblendete Antwortkarte ist damit praktisch belegt. Kein Live-Update des ursprünglichen Frames, keine native Plugin-Anbindung und kein Fachchat-Implementierungsauftrag sind dadurch bestätigt.

Vergleich beruht auf bestehender lokaler Videoanalyse, erneut gelesenen Transkriptstellen 00:00–04:51, 06:15–07:19 und 15:26–19:26 sowie Nutzerbildern. Autor zeigt verknüpftes Firmenwissen, ein Dashboard und beschreibt angeschlossene Kommunikation/Kalender; technische Zuverlässigkeit seiner Integrationen ist von außen nicht geprüft. Seine vier Bausteine Context/Connections/Capabilities/Cadence entsprechen bei GradeCrew Projektwissen, GitHub-/Chat-Nachweisen, Arbeitsabläufen und regelmäßiger Ausführung. Unsere Daten und Routen existieren, aber deren durchgängige Ausführung über das Board fehlt.

Einschätzung nur der vereinbarten Entwicklungszentrale: 4/10 Nähe zum vollständigen Ziel. Aufgabenbestand, Routing und echter Chat-Kartentest vorhanden; dauerhafte Auftragsverfolgung über Fachchat/Review/Integration, aktuelles eingebundenes Panel und Mac-unabhängiger Betrieb nicht nachgewiesen. Kein gemessener Prozentwert, keine Gesamtbewertung von GradeCrew oder des fremden Systems.

Empfohlener nächster Pilot: genau ein begrenzter realer Änderungsauftrag aus einer Karte. Dauerhaft Task-ID, Request-ID, Quellenrevision, Zielchat, tatsächliches Modell, Bearbeitungsstand und Ergebnisnachweise verbinden. Vor Start aktive Bearbeitung prüfen; Main koordiniert passenden vorhandenen ausführbaren Codex-Chat, sammelt das Resultat ein, lässt substanzielle Änderungen unabhängig prüfen und kontrolliert CI/Commit/Deploy-Nachweise. Erst danach Statusdaten und Aufgabenansicht aktualisieren. Noch nicht ausgeführt; kein beliebiger Produktauftrag aus dieser Vergleichsfrage abgeleitet.

Oberfläche: oben Blocker/Fehler und nötige Entscheidungen, danach Funktionskarten; Detail mit Iststand, nächstem Schritt, Bearbeitung und Rückmeldung. Priorität getrennt von Release-Farbe, unbekannten Stand ausdrücklich zeigen. Arbeitsstatus (wartet/arbeitet/prüft/blockiert) getrennt von Entwicklungsstufe. Bestehende fünf Farben behalten; Orange mit Nachweis und genauer Teilstufe, Gelb nur bei bestätigtem Test-Deploy, Blau nach Nutzerabnahme, Grün nach genehmigtem Live-Deploy. Grün bedeutet keinen Beweis dauerhafter Fehlerfreiheit; neue Fehler bleiben separat sichtbar.

Automatik zunächst innerhalb eines konkret gestarteten und begrenzten Auftrags. Wiederaufnahme/Überwachung und Ausführung bei ausgeschaltetem Mac sind eigene offene Betriebsanforderungen. Keine endlose Selbstbeschäftigung, keine zusätzliche kostenpflichtige Modell-API als stiller Ersatz. Das erneute Einblenden einer Chat-Karte ist ein nutzbarer Einstieg, für ein dauerhaft aktuelles Plugin-Panel braucht es noch die tatsächliche Host-Anbindung. Bestehende Dateien/Adapter weiterverwenden. In dieser Vergleichsrunde keine Automation eingerichtet, keine Fachchats beauftragt, keine Produktdateien geändert und keine Deployment-Stufe angehoben.
