# GC-BRAIN-01 – Zentrale, Fachbereiche und unabhängige Prüfung

Stand: 06.10.2026. Weiterführung derselben Task-ID und Übergabe; kein neuer Produkt- oder Guardian-Auftrag. Dieser Entwurf und die tatsächliche Chat-Sortierung ersetzen keine Release-Nachweise.

## Ziel und Umfang

Martin nutzt eine zentrale Anlaufstelle und eine einfache Aufgabenansicht. Facharbeit wird nach Funktion organisiert, Modelle werden pro konkretem Auftrag gewählt. Zwei unabhängige Prüfer sollen größere Änderungen hinterfragen. Die bestehende lokale App bleibt die Grundlage; Sidebar-App und Conversation-Panel sind der vorgesehene Integrationsweg. Die Plugin-Brücke ist noch nicht installiert oder Ende-zu-Ende bestätigt.

Erfasst wurden die maximal 50 jüngsten nicht angehefteten Chats sowie die angehefteten Elemente. GradeCrew-Zuordnung anhand Projekt, Arbeitsordner und Inhalt; letzte Beiträge ausgewählter Chats gelesen, abgeschlossene Archivkandidaten vollständig bzw. bis zum klaren Abschluss geprüft. Das ist keine vollständige historische Bestandsaufnahme sämtlicher Kontochats.

## Bedienung und Organisation

- Angeheftet: **GradeCrew Zentrale**. Eingang, Prioritäten, Entscheidungen und zusammengeführte Ergebnisse.
- **GC · Funktionen**: Design/Crew, Games, Audio/Sprache, Internationalisierung, Schüler/Klassen/ASV, iOS/Geräte.
- **GC · Betrieb & Qualität**: Guardian/Integration, Fehlerberichte/BugOps, Datenschutz, Sicherung/Wiederherstellung, offene Audits.
- **GC · Wissen & Planung**: Second Brain, Plugin-Recherche, historische Konzepte, Kosten/Produktplanung und Wiederaufnahmevorlagen.

Keine Modellordner: Ein Audioauftrag kann je nach Umfang verschiedene Modelle brauchen. Ein dauerhafter Fachbereich kann mehrere klar abgegrenzte Aufgaben enthalten; für lange oder unabhängige Umsetzungen bleiben eigene Aufgabenübergaben und isolierte Checkouts nötig. Keine unbegrenzt wachsenden Alleskönner-Chats. Temporäre Prüfer werden nicht zu zusätzlichen permanenten Fachchats.

Die Sidebar-Sortierung bündelt Zugänge, vereinigt aber keine Chatverläufe. Jede Aufgabe benötigt weiterhin die vorhandene Task-ID, eine zuständige Umsetzung, einen nächsten Schritt und Quellen. Alte Aussagen bleiben historische Hinweise. Eine bloße Chatablage belegt weder aktuelle Tests noch einen Deploy.

## Zuständigkeiten und bewusst erhaltene offene Arbeit

| Vorhandener Chat | Rolle / offene Arbeit |
|---|---|
| Main CODEX (w) | Guardian/Integration, GC-AUTOMATION-08 und PR #126. Vor Fortsetzung aktuelle Tests, Aktivierungsnachweise und bereits laufende Vorgänge prüfen. |
| Main GC (no w) | BugOps/Fehlerrückmeldungen, GC-BUGOPS-01. Bericht nennt Staging bb91ce3 und PR #138; vor Arbeit Live-Belege neu prüfen. |
| GC-I18N-03 fortsetzen | Aktuelle technische Umsetzung der Internationalisierung. |
| Internationalisierung GC | Historische Planung und bereits erfolgte Übergabe an GC-I18N-03; keine zweite parallele Umsetzung. |
| Präzisiere ASV-Importarchitektur | GC-CLASSROOM-01, aktueller Architekturentwurf PR #141. |
| Schülerintegration Codekonzept | Historische fachliche Entscheidungen; bei Widerspruch aktuellen Entwurf und Quellen prüfen. |
| Design GC | Design und Crew; Verschieben bisher durch Ladezeitüberschreitung blockiert, Original bleibt bestehen. |
| New Chat GC | Wiederaufnahmevorlage plus historische Designarbeit. Umbenennung als Vorlagenzugang löscht diese Arbeit nicht; Design-Historie dem Designbereich bei konkretem Auftrag erschließen. |
| Games GC | Spielekontext und Preview-Hinweise; URL-/Deploy-Stand vor Verwendung prüfen. |
| Spachfunktionen GC | Audio-/Sprachkontext; älterer manueller Deployhinweis darf keine bereits erfolgte Veröffentlichung wiederholen. |
| Prüfe GradeCrew iOS-Status | Letzter Turn fehlgeschlagen, Statusprüfung bleibt offen. Keine erfolgreiche Übernahme behaupten. |
| GradeCrew-Auftrag wiederaufnehmen | Fehlgeschlagener Chat mit offenem Gesamtauditauftrag. Sichtbar unter Betrieb; gegen GC-ARCH-AUDIT-02 und Main-Arbeit abgleichen, bevor etwas neu gestartet wird. |
| Recovery Status Prüfen | Historischer Statusaudit, keine aktuelle Freigabe. |
| Datenschutz GC | Behalten; aus jüngstem Beitrag kein abgeschlossener Gesamtauftrag ableitbar. |
| Lade GradeCrew Firebase-Dateien | Sicherungsauftrag laut Abschlussbericht erledigt; Wiederherstellung ungetestet. Sicherung enthält potenziell vertrauliche Daten und wird nicht in diese Dokumentation kopiert. |
| Persönliches Second Brain | Lokales Wiki vorhanden; Pflegeautomatik nicht aktiviert. |
| GradeCrew-Plugins recherchieren | Bei Erfassung aktiv, GC-PLUGINS-01. Nur verschoben, nicht unterbrochen oder neu beauftragt. |
| MONEY GC | Gemischte Kosten-/Produkt-/App-Planung, Inhalt nicht allein aus Titel ableiten; erhalten. |
| OneDrive für GradeCrew einrichten | Zugang/Quellenzuordnung bleibt teilweise offen; Zweitchat und neue Anbindung nicht automatisch starten. |

## Archivierung und Rückkehr

Die vier folgenden abgeschlossenen Einzelfragen dürfen im Nutzerauftrag archiviert werden. Vorherige Titel, IDs und Ablagen sind in chat-organization-20261006.json gesichert. Archivierung ist keine Löschung von Chats, Code, PRs oder Aufträgen. Codex-Chats können anhand ihrer ID wiederhergestellt werden.

| Chat | Erhaltene Erkenntnis / Restpunkt |
|---|---|
| Begründe ChatGPT Business | Angeforderter Formulartext geliefert. Tarif-/Dots-Aussagen vor einer Kaufentscheidung erneut prüfen. Kein Kauf, kein Tarifwechsel und keine Kontaktaufnahme beauftragt. |
| Ollama fürs Projekt bewerten | Aktuell kein Zusatzbetrieb empfohlen. Notiz notes/GC-AI-EVAL-02-ollama-einordnung-2026-10-05.md vorhanden laut Abschlussbericht. Keine Implementierung offen. |
| Antwortleitlinien in Gradecrew ergän | Begründete 1–10-Einordnung ist in den aktuellen Nutzer-Projektanweisungen enthalten. |
| Zeichen identifizieren | Erklärung des Unteragenten-Symbols abgeschlossen. |

## Zwei Prüfer für größere Änderungen

Arbeitsregel für die Zentrale und diesen Prototyp, kein installierter Hintergrunddienst und keine technische Garantie für sämtliche anderen Chats:

1. Vorarbeit: Auftrag, Abnahmekriterien, betroffene Dateien, tatsächlich gewähltes Modell und bestehende Versuchshistorie klären. Erforderliche Vorprüfungen bestehen lassen, bevor zwei vollständige Reviews ausgelöst werden.
2. Einen unveränderlichen Kandidaten sichern. Beide Prüfer erhalten Task-ID, Basis-/Kandidaten-Commit, relevanten Code, Anforderungen und Testnachweise. Kein gemeinsam veränderter Arbeitsordner. Bei Ausführung von Tests isolierte Umgebung; keine externen oder bezahlten Starts aus dem Review.
3. Prüfer A: Verhalten, Abnahmekriterien, Fehlerfälle und Testlücken. Prüfer B: Rechte, Datenzugriff, Mandantentrennung, Datenschutz, konkurrierende Zugriffe, Idempotenz und betroffene Abhängigkeiten. Getrennte Kontexte; zunächst keine gegenseitigen Urteile und keine vorgegebene Erfolgserzählung.
4. Reviewer dürfen nur analysieren. Keine Schreib-, Nachrichten-, Merge- oder Deployment-Aufträge. Soweit der verfügbare Agentenhost Rechte nicht technisch begrenzen kann, bleibt dies eine Anweisung; keine harte Isolation behaupten. Bei notwendiger harter Trennung bestehende geeignete Guardian-/Sandbox-Gates verwenden.
5. Jeder Befund braucht Schweregrad, Datei/Stelle, konkrete Auswirkung und Reproduktion oder nachvollziehbaren Beleg. Keine Pflicht, Fehler zu erfinden; keine Stilwünsche als Blocker. Ein einzelner erheblicher Befund wird untersucht, nicht durch Mehrheitswahl überstimmt.
6. Nur der zuständige Implementierer ändert den Code. Nach Änderungen Tests und betroffene Reviews erneuern; standardmäßig beide Reviews auf dem finalen Kandidaten. Frühere Berichte gelten nicht automatisch für einen neuen Commit.
7. Höchstens drei Reparaturversuche insgesamt pro Aufgabe, mit dauerhaftem Zähler in der Übergabe. Ein Reparaturversuch beginnt mit der ersten Änderung aufgrund eines Befunds und endet mit neuem Kandidaten plus Prüfung. Strengere bestehende Grenzen gelten vorrangig. Ersatzchats, neue Reviewer und Umbenennungen setzen Zähler/Budgets nicht zurück. Danach sichtbarer Blocker mit Befunden und nächster Entscheidung.
8. Bei kleinen Text-/Dokumentationskorrekturen angemessene normale Prüfung. Bei Rollen, Datenzugriff, Noten-/Bewertungslogik, Rules, Payments und ihren Abhängigkeiten aktuelle strengere Profile prüfen. Die bestehende Guardian-Kette mit drei Prüfern wird durch diese zwei lokalen Reviews weder ersetzt noch abgeschwächt.

Mehrere Prüfer verbrauchen zusätzliches Abo-Kontingent; keine unbegrenzte oder kostenlose Mehrarbeit versprechen. Modellwahl gilt pro Auftrag, kein stiller Wechsel. Methodische Unabhängigkeit ist keine Garantie verschiedener Modellfehler. Für diesen Strukturentwurf wurden zwei unabhängige, rein lesende Unteragenten verwendet; ihre Hinweise zu Zuständigkeiten, Review-Gültigkeit, Versuchszählung und Berechtigungsgrenzen sind eingearbeitet. Das war kein Code-/Sicherheitsaudit von GradeCrew.

## App-Anbindung: empfohlene nächste Ausbaustufe

Bewertung für Martins Bedienungsziel, Kriterien Überblick, direkte Kommunikation, Wiederverwendung und Betriebsaufwand:

| Ansatz | Eignung | Abwägung |
|---|---|---|
| Bestehende App als Conversation-Panel plus Sidebar-Einstieg | 9/10 | Direkte Nähe von ausgewählter Aufgabe und Gespräch; Plugin-Verbindung und Client-Unterstützung müssen wirklich getestet werden. |
| Eigenständige Mac-App mit manueller Übergabe | 7/10 | Vorhanden und vertrautes eigenes Fenster; mehr Wechsel und bislang manueller Start der Arbeit. |
| Zusätzliche neue Sites-Zentrale | 6/10 | Hilfreich für Hosting/Teilen; neue Betriebsabhängigkeit, löst allein keine Agentenausführung. |

Ein gemeinsamer Aufgabenbestand für beide Ansichten. Sidebar: Bereiche und Überblick. Conversation-Panel: ausgewählte Aufgabe, nächster Schritt, Textstatus/Farbe, Alter und Quelle der Belege, Eingabe und ausdrücklicher Start. Standardansicht zeigt laufende Arbeit und notwendige Entscheidungen. Tiefere Logs/Modellkonfiguration nur bei Bedarf.

Model-App Context teilt die Auswahl, erteilt aber keinen Ausführungsauftrag. Ein Start bindet Task-ID, Datenrevision und angezeigten Scope. Dauerhafte Request-ID verhindert doppelte Aufträge bei Doppelklick oder Wiederanlauf. „Angenommen“ erst nach Speicherung; „läuft“ nur mit tatsächlichem Ausführungsnachweis. Rückfragen, Abbruch, Timeout und Ergebnis müssen sichtbar bleiben. Nach unklarem Ergebnis erst Status abgleichen, nicht erneut ausführen. Eine neue Notiz löst nichts automatisch aus.

Die App darf keine globale Kontrolle aller Chats oder einen tatsächlichen Modellwechsel behaupten. Bestehende App-Server-Rückmeldung und das Inline-Widget sind Vorarbeiten, keine installierte MCP-Plugin-Verbindung. Globale und Thread-Entrypoints müssen registriert, Plugin verbunden und mit einer echten Aufgabe geprüft werden. Sites bleibt eine spätere Hostingoption. Eine lokale Oberfläche oder ein lokaler Agent läuft bei ausgeschaltetem Mac nicht weiter; Cloud-Ausführung bleibt ein eigener offener Baustein.

Erster vertikaler Test: Eine Standfrage zu GC-I18N-03 auswählen, ausdrücklich senden, genau einen Eingang nachweisen, Quellen lesen und das Ergebnis derselben Aufgabe zuordnen. Danach Doppelklick, Verbindungsabbruch und Wiederanlauf prüfen. Kein Production-Deploy.

## Quellen

- OpenAI Plugin Extensions: https://developers.openai.com/plugins/build/extensions
- OpenAI Subagents: https://learn.chatgpt.com/docs/agent-configuration/subagents
- Aktuelle GradeCrew-Projektregeln, TODO und GRADECREW_STATE auf main gelesen; Development-Status-Run 37374686618 und Job 111980194806 geprüft.
- Tatsächliche Sidebar-Ergebnisse und verbleibende Ausnahmen: chat-organization-20261006.json.

Nächster Schritt: Registrierbare Plugin-Brücke für genau eine Aufgabenfrage konkretisieren und den tatsächlichen Eingang/Rückweg im verfügbaren Client testen. Vor Codearbeit den technischen Entwurf und die vorhandene Plugin-Recherche GC-PLUGINS-01 abgleichen.
