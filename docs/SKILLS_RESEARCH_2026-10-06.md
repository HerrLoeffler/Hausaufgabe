# Skills für GradeCrew: Recherche und konkrete Auswahl

Stand: 06.10.2026. Fortsetzung von GC-PLUGINS-01. Umfang: aktuelle offizielle OpenAI-Dokumentation, offener Agent-Skills-Standard, Anbieter-Repositories, ein öffentliches Skill-Verzeichnis und Abgleich mit GradeCrew-TODO/main. Forschungsergebnis und Umsetzungsvorschlag; noch keine neuen GradeCrew-Skills installiert.

## Was der grüne Punkt im Screenshot bedeutet

Der sichtbare Eintrag „GC-PLUGINS-01: Astra-Kurs auswerten und …“ gehört zur angehängten GitHub-PR #142. Die Chat-Anhänge enthalten genau diese Pull-Request-Verknüpfung. Ich habe sie nach dem Erstellen der Dokumentations-PR an diesen Chat angehängt. Sie verbindet den Chat mit dem überprüfbaren Änderungsvorschlag, damit dessen Dateien und Status auffindbar bleiben.

Live geprüft: PR #142 ist offen, nicht gemerged, Basis main. Der grüne Marker lässt sich deshalb plausibel dem offenen PR zuordnen; seine genaue Farbbedeutung wurde nicht anhand des UI-Quellcodes verifiziert. Die Verknüpfung selbst erteilt keine zusätzliche Kontoberechtigung. Der Stand des PR ist kein Deploy-Nachweis. [Verknüpfter Änderungsvorschlag](https://github.com/HerrLoeffler/Hausaufgabe/pull/142).

## Was Skills leisten

Ein Skill hält einen wiederkehrenden Ablauf fest: Auslöser, benötigte Eingaben, Schritte, verwendete Werkzeuge und erwartetes Ergebnis. Dazu können Vorlagen, Referenzen und kleine Hilfsprogramme gehören. Ein Plugin kann mehrere Skills zusammen mit Dienstverbindungen bündeln. Ein Werkzeug liefert beispielsweise einen GitHub-Diff; der Skill beschreibt, wie dieser für einen bestimmten Auftrag geprüft und dokumentiert werden soll. [OpenAI: Plugin-Aufbau](https://developers.openai.com/plugins/concepts/plugins).

Für GradeCrew unterscheiden wir vier Ebenen: allgemeine Projektregeln in START_HERE/AGENTS, konkrete Abläufe in Skills, ausführende Werkzeuge/Verbindungen und aktuelle Nachweise in TODO/Übergaben/GitHub. Ein Skill liest bei Bedarf die aktuellen Projektregeln. Er sollte keine zweite, später veraltete Kopie von Branchständen und Freigaberegeln enthalten. Das entspricht der Trennung von Projektanweisungen, Skills und externen Verbindungen in der [OpenAI-Anpassungsübersicht](https://learn.chatgpt.com/docs/customization/overview).

Skills können direkt aufgerufen oder anhand ihrer Beschreibung ausgewählt werden. Standalone-Skills und über Plugins verteilte Skills sind in unterschiedlichen Oberflächen verfügbar. Ein lokaler Skill ist deshalb nicht automatisch in jedem Web-/Mobilchat vorhanden. Die aktuelle Dokumentation nennt für neue lokale Repo-Skills `.agents/skills`; für breitere Verteilung eignet sich ein Plugin. [OpenAI: Skills erstellen und laden](https://learn.chatgpt.com/docs/build-skills).

## Wie viele gibt es?

Eine belastbare Gesamtzahl „aller ChatGPT-Skills“ ließ sich nicht bestätigen. Eingebaute Fähigkeiten, öffentliche Pakete, private Projekt-Skills und lokale eigene Skills bilden keine abgeschlossene öffentliche Liste.

Als überprüfbare Größenordnung habe ich den vollständigen Dateibaum des offiziellen Repositorys `openai/plugins` gezählt, Stand der Abfrage: Baum `5fd93af4cd0c623e020d0cc7e9ce178b4ac1f70f`, Antwort nicht abgeschnitten. Ergebnis:

- **502 direkt angelegte Skill-Ordner in 46 Plugin-Paketen**, gezählt nach `plugins/<paket>/skills/<skill>/SKILL.md`.
- **536 SKILL.md-Dateien insgesamt**; zusätzliche Dateien enthalten unter anderem verschachtelte Varianten, Test-Fixtures und einen Repository-Hilfsskill.
- Diese Zählung belegt den Inhalt dieses Beispiel-Repositorys. Sie ist keine Zahl der in Martins Konto installierbaren Skills und keine Gesamtzahl des Plugin-Verzeichnisses.

[Offizielles Repository](https://github.com/openai/plugins) · [Gezählter Dateibaum](https://api.github.com/repos/openai/plugins/git/trees/5fd93af4cd0c623e020d0cc7e9ce178b4ac1f70f?recursive=1).

Das externe Verzeichnis skills.sh zeigte während der Recherche „All Time (1,588,237)“. Diese Anbieteranzeige wurde nicht unabhängig als Anzahl einzigartiger geprüfter Skills validiert. Das Verzeichnis umfasst mehrere Agentenplattformen. Sein Ranking beruht auf Installations-Telemetrie; Popularität ist kein Beleg für GradeCrew-Eignung. Ich verwende diese große Zahl deshalb nicht als ChatGPT-Gesamtbestand. [Verzeichnis](https://www.skills.sh/) · [Erklärung der Rangfolge](https://www.skills.sh/docs).

Wichtige Aktualisierung: Das frühere Repository `openai/skills` kennzeichnet sich inzwischen als veraltet und verweist auf `openai/plugins`. Ältere Anleitungen oder lokale Installer können weiterhin den alten Katalog nennen. Bei neuen Empfehlungen zählt die aktuelle Quelle. [Hinweis im alten Repository](https://github.com/openai/skills).

## Können wir Namen und Inhalt selbst bestimmen?

Ja. Beispielsweise sind `gradecrew-werkzeugwahl`, `gradecrew-fehlerpruefung` und `gradecrew-kernablauf-pruefen` eigene mögliche Namen. Der technische Name verwendet Kleinbuchstaben, Ziffern und Bindestriche, maximal 64 Zeichen; der Ordnername muss dazu passen. Eine verständliche Anzeige wie „GradeCrew – Fehlerprüfung“ kann ergänzend eingerichtet werden. Ein aussagekräftiger Name und vor allem eine konkrete Beschreibung helfen beim Auslösen. [Offener Standard](https://agentskills.io/specification).

Ein sinnvoller Auslöser wäre: „Untersuche einen gemeldeten GradeCrew-Fehler anhand aktueller Projektbelege und eines reproduzierbaren Ablaufs.“ Ein pauschales „Mache GradeCrew perfekt“ wäre zu breit. Die Anweisungen legen Eingaben, Ergebnis und Grenzen fest. Fähigkeiten zur Skill-Erstellung sind bereits vorhanden. [OpenAI: Erstellung und Prüfung](https://developers.openai.com/plugins/build/skills).

## Welche vorhandenen Fähigkeiten wir nutzen können

Im aktuellen Sitzungskatalog sind bereits Skills für Figma, Dokumente, PDF, Präsentationen, Tabellen, PostHog, Recherche, systematische Fehlersuche und Sicherheitsarbeit vorhanden. Die erneute Plugin-Abfrage bestätigt inzwischen auch **Codex Security und OpenAI Developers als installiert**. Context7 wurde zuvor vom Nutzer installiert, seine Dokumentationswerkzeuge sind verfügbar. Frühere „noch nicht installiert“-Angaben waren Momentaufnahmen und sind entsprechend zu aktualisieren. Installation allein belegt noch keinen erfolgreichen Zugriff auf jedes verbundene Konto.

Unser Schwerpunkt sollte auf wenigen eigenen Abläufen liegen, die diese vorhandenen Fähigkeiten mit GradeCrew-Kontext verbinden. Ein zweiter allgemeiner PDF-Skill oder eine konkurrierende universelle Debugging-Anleitung würde wenig zusätzlichen Nutzen bringen.

## Präzisierung zu Build iOS Apps

Die vertiefte Recherche bestätigt **Build iOS Apps als offizielles Plugin-Beispiel** im OpenAI-Repository, Manifestversion 0.1.2. Es enthält neun direkt angelegte Skills:

1. `ios-app-intents`
2. `ios-debugger-agent`
3. `ios-ettrace-performance`
4. `ios-memgraph-leaks`
5. `ios-simulator-browser`
6. `swiftui-liquid-glass`
7. `swiftui-performance-audit`
8. `swiftui-ui-patterns`
9. `swiftui-view-refactor`

Damit ist die frühere Aussage „im verfügbaren Katalog nicht bestätigt“ genauer einzuordnen: Die erneute App-Katalogsuche liefert weiterhin keinen exakten Treffer, **die Existenz des offiziellen Pakets ist jetzt nachgewiesen**. Paketquelle, Installierbarkeit in dieser Oberfläche und lokal funktionierender Simulatorzugriff sind verschiedene Prüfungen. Für unsere bestehende hybride App wären Debugger, Simulator und Performance-Hilfen am nützlichsten. Das Paket ist kein Anlass für einen Neubau der App. [Paket](https://github.com/openai/plugins/tree/main/plugins/build-ios-apps) · [Skill-Ordner](https://github.com/openai/plugins/tree/main/plugins/build-ios-apps/skills).

## Auswahl für GradeCrew

Bewertung 1–10 nach denselben Kriterien: aktueller Projektnutzen, Wiederholungshäufigkeit, Passung zum vorhandenen Stack und Aufwand für verlässliche Ergebnisse. 10 bedeutet sehr gut geeignet, nicht „fertig“ oder garantiert wirksam. Aufwand ist relativ, keine Lieferzeitzusage. Grundlage sind die aktuellen dokumentierten Aufgaben; ihr Produktstand wurde nicht vollständig neu getestet.

| Skill-Vorschlag | Nutzen | Aufwand | Auslöser und prüfbares Ergebnis | Grenze / Abwägung |
|---|---:|---|---|---|
| `gradecrew-werkzeugwahl` | 9/10 | klein | Bei passendem Auftrag vorhandene Hilfen auswählen; bei echter Lücke höchstens 1–3 konkrete Ergänzungen mit Nutzen und Einrichtung nennen. | Keine neue Recherche bei jedem belanglosen Satz; vorhandene Plugin-Suche verwenden. |
| `gradecrew-fehlerpruefung` | 9/10 | mittel | „Abgabe funktioniert nicht“: aktuellen Workstream prüfen, Ablauf reproduzieren, Ursache/Unklarheit mit Belegen und nächstem Schritt berichten. | Vorhandene systematische Fehlersuche nutzen; Produktfix und dessen Prüfung hängen vom konkreten Auftrag ab. |
| `gradecrew-kernablauf-pruefen` | 9/10 | mittel | Nach relevanten Änderungen kontrolliert Import → KI → Editor → Veröffentlichung → Schülerabgabe → Auswertung prüfen. Ergebnis: belegte Testmatrix. | Getrennte Testdaten/Umgebung, verfügbare Konten und tatsächliche Geräte bestimmen die mögliche Abdeckung. |
| `gradecrew-designabnahme` | 8/10 | mittel | „Sieht das jetzt gut aus?“: aktuelle Designregeln, Referenzen und konkrete Ansichten vergleichen; Fundstellen mit Priorität und Bildern liefern. | Figma/Canva und bestehende Komponenten verwenden; manuelle Geschmacksentscheidung bleibt sichtbar. |
| `gradecrew-release-nachweise` | 9/10 | klein bis mittel | „Was ist wirklich fertig/live?“: Commit, CI, Integration, Deploy und Gerätetest mit aktuellen Belegen getrennt einordnen. | Als read-only Berichtsablauf; bestehende Statuswerkzeuge wiederverwenden. Kein zweites Release-System. |
| `gradecrew-aufgabenqualitaet` | 8/10 | mittel | Aufgabensätze auf klare Formulierungen, Varianten, Lösungskonsistenz, Schwierigkeitsgrad und Bewertung prüfen; konkrete Korrekturvorschläge liefern. | Fachliche Referenzen und Beispieldatensatz nötig; fachliche Freigabe nicht aus einem Modellurteil ableiten. |
| `gradecrew-ios-abnahme` | 8/10 | mittel bis größer | Aktuelle hybride App, Ziel-Webversion, Simulatorablauf und TestFlight-Belege abgleichen; Gerätetest-Checkliste und Befunde liefern. | Lokale Xcode-/Simulatorwerkzeuge vorher bestätigen; echte Geräteprüfung separat. |
| `gradecrew-nutzungsanalyse` | 7/10 | mittel | „Wo brechen Lehrkräfte ab?“: vorhandenen PostHog-Kontext und datensparsame Ereignisse auswerten; belegte Verbesserungsprioritäten. | Abhängig von tatsächlich verfügbaren, sinnvoll instrumentierten Daten. |
| `gradecrew-videoanalyse` | 6/10 aktuell | mittel | Wiederkehrende Schulungs-/Referenzvideos lokal transkribieren, Bildwechsel prüfen, Kapitel und GradeCrew-Folgerungen sichern. | Bisher ein großer Einzelfall; technische Vollerfassung und semantische Sichtung ausdrücklich unterscheiden. |
| `gradecrew-release-notizen` | 6/10 aktuell | klein | Aus nachweislich integrierten Änderungen kurze verständliche Hinweise für Lehrkräfte erstellen. | Erst bei regelmäßigen Releases höherer Nutzen; Entwurf und Veröffentlichung getrennt. |

Konkrete Prioritätsbelege: GC-TUTORIAL-01 betrifft die manuelle Tutorialabgabe; GC-REGRESSION-01 nennt Import und Kernabläufe; GC-DEVICE-01 verlangt Geräteabnahme. Deshalb sollten Fehlerprüfung und Kernablaufprüfung zuerst praktisch erprobt werden. GC-AI-01 begründet später die Aufgabenqualitätsprüfung. [Aktuelle Projekt-TODO](https://github.com/HerrLoeffler/Hausaufgabe/blob/main/TODO.md).

## Fertige externe Skills: gezielt übernehmen

| Quelle / Skill | Eignung für GradeCrew | Empfehlung |
|---|---:|---|
| Vorhandene Codex-Security-Skills | 9/10 bei Sicherheitsauftrag | Vorhandene spezialisierte Abläufe einsetzen; GradeCrew-Gates als Kontext ergänzen. Keine eigene oberflächliche Konkurrenzprüfung bauen. |
| Vorhandene Figma-/Dokument-/PostHog-Skills | 8/10 | Je nach Aufgabe verwenden, keine gleichartigen Pakete zusätzlich sammeln. |
| OpenAI Build iOS Apps | 8/10 | Debugging und Simulator zuerst prüfen; Setup auf bestehende hybride App abstimmen. |
| Vercel `web-design-guidelines` | 8/10 | Gute ergänzende Vorlage für Tastaturbedienung, Fokus, Formulare und zugängliche Oberflächen; mit unseren Designregeln verbinden. |
| Anthropic `frontend-design` | 7/10 | Anregungen für bewusste Art Direction. Für GradeCrew nur mit bestehender Marken-/Komponentenbasis verwenden, keine pauschale visuelle Neugestaltung. |
| Vercel React-/Next.js-Optimierungs-Skills | 4/10 ohne bestätigten passenden Teilbereich | Erst wählen, wenn der konkrete GradeCrew-Code wirklich diese Technologien nutzt. Keine Framework-Migration aus einem Skill ableiten. |
| Große unspezifische Community-Sammlungen | 3/10 als pauschales Gesamtpaket | Einzelne passende Skills prüfen; Wartung, doppelte Auslöser und Zusatzabhängigkeiten sprechen gegen eine Komplettinstallation. |

Vercels UI-Skill liest aktuelle Web-Interface-Regeln und prüft konkrete Dateien; er kann als enger Baustein dienen. Anthropic beschreibt seinen Frontend-Skill als Anleitung für eigenständige visuelle Gestaltung. Beide wurden hier als Quellen gelesen, nicht installiert oder ausgeführt. [Vercel-Skill](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) · [Anthropic-Skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md).

Die gemeinsame Ordnerstruktur erleichtert Übertragung zwischen Agenten. Dennoch können Toolnamen, Programme, Konten und Nutzungsbedingungen unterschiedlich sein; besonders das Anthropic-Repository unterscheidet zwischen offen lizenzierten Beispielen und nur quelloffen einsehbaren Dokument-Skills. [Anbieterhinweise](https://github.com/anthropics/skills).

## Empfohlene Umsetzung

**Ein kleines eigenes Paket mit vier klar getrennten Abläufen: Werkzeugwahl, Fehlerprüfung, Kernablaufprüfung und Designabnahme.** Zunächst Werkzeugwahl und Fehlerprüfung als Piloten testen, dann die beiden Prüfabläufe ergänzen. Release-Nachweise können danach folgen. Die bestehenden verbindlichen Startregeln bleiben direkt in AGENTS; dafür ist kein zusätzliches allgegenwärtiges Start-Skill nötig.

Für jeden Pilot sollten vor Erstellung feststehen:

1. **Auslöser:** drei typische Nutzerformulierungen, darunter eine ohne Skill-Nennung.
2. **Eingaben:** Task-ID, aktueller Branch bzw. Test-URL, nötige Referenzen; fehlende Informationen gezielt erfragen.
3. **Ablauf:** aktuelle Projektregeln lesen, vorhandene Arbeit prüfen, passende Werkzeuge auswählen, begrenzte Aufgabe durchführen.
4. **Ergebnis:** konkrete Belege, Unsicherheiten, offene Punkte und nächster Schritt in einem kurzen festen Format.
5. **Prüfung:** direkte und indirekte Aufrufe, eine unpassende Frage sowie fehlenden Zugriff testen. Ein Skill ist erst nützlich, wenn die Anwendung verlässlich funktioniert.

OpenAI empfiehlt, sowohl die Auslösung als auch den tatsächlichen Ablauf und die Ergebnisqualität zu prüfen. Für unseren Pilot reichen zunächst wenige reale Beispielaufgaben; aufwendige automatisierte Evaluierungen sind ein späterer Schritt bei entsprechendem Nutzen. [OpenAI: Skills systematisch prüfen](https://developers.openai.com/blog/eval-skills).

Beispiel für die Werkzeugwahl: „Kannst du die Oberfläche prüfen?“ sollte vorhandene Browser-/Designfähigkeiten nutzen. „Der Fehler liegt wahrscheinlich in Firebase, aber wir haben keine Logs“ sollte zuerst vorhandenen Zugriff prüfen und bei echter Lücke gezielt die nötige Verbindung anbieten. „Wie heißt unsere Katze?“ sollte keine breite Plugin-Recherche auslösen.

Beispiel für die Fehlerprüfung: „Die Abgabe am iPad hängt“ führt zuerst zum aktuellen Code-/Gerätestand und zu reproduzierbaren Schritten. Sind weder Gerät noch Logs zugänglich, muss das Ergebnis den belegbaren Stand und die konkret fehlende Beobachtung nennen. Eine vermutete Ursache darf nicht zur bestätigten Fehlerbehebung werden.

## Aufwand, Grenzen und Kosten

Eine Textanleitung kann mit vorhandenen Werkzeugen beginnen. Aufwendiger sind zuverlässige Prüfbeispiele und zusätzliche Programme, Simulatoren oder Kontoverbindungen. Die Ausführung nutzt weiterhin das gewählte Modell und seine Nutzungslimits; externe APIs können zusätzliche Kosten auslösen. Ein Skill allein startet keinen Zeitplan und schafft kein unbegrenztes Gedächtnis. Er muss in der ausführenden Umgebung verfügbar sein.

Die aktuelle OpenAI-Dokumentation erklärt, dass sehr große Skill-Listen gekürzt werden können. Deshalb halten wir Namen und Auslöser klar und die Auswahl überschaubar. [OpenAI: Skill-Erkennung](https://learn.chatgpt.com/docs/build-skills).

Fremde Skills werden vor Übernahme auf ihre konkreten Anweisungen, Programme, Abhängigkeiten und Rechte geprüft. Besonders allgemeine „immer diesen Prozess starten“-Regeln können Routinearbeit unnötig verlängern. Für GradeCrew gelten weiter die bestehenden Daten-, Budget- und Production-Regeln.

## Nachweise und aktueller Stand

Recherche und Vorschläge sind unter GC-PLUGINS-01 gespeichert. PR #142 enthält Dokumentation und die bereits vorbereitete proaktive Werkzeugregel. Dieser Rechercheauftrag hat keine neuen Skills erstellt, keine weiteren Dienste installiert und kein Deployment ausgelöst. Die vorgeschlagenen Skill-Namen sind Entwürfe; bestehende Skill-Dateien und aktuelle Regeln wären vor einer Umsetzung auf Überschneidungen zu prüfen.

Nächster konkreter Umsetzungsschritt: `gradecrew-werkzeugwahl` als kleinen Pilot mit klaren Auslösern und fünf passenden/unpassenden Beispielen ausarbeiten und in der tatsächlich verwendeten Codex-Umgebung prüfen.
