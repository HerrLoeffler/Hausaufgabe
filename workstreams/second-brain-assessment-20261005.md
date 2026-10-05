# GC-BRAIN-01 – Second Brain für GradeCrew: Erstbewertung

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
