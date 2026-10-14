# Aufgabe: GC-LEARNING-WISSENSREISE-01

- Aktualisiert: 2026-10-14 (UTC; genaue Speicherzeit im Git-Commit).
- Verantwortlicher Fachchat: wissensreise_plan, ausführende Produktplanung/Dokumentation.
- Koordinator: bestehende GC · Games-Zentrale, Thread01a11864-3ec7-7091-acc0-9ff292f530f3.
- Chat-Link: unbekannt; keine neue Chatfreigabe.
- Vorheriger Owner: keiner; neuer ausdrücklich beauftragter Planungsscope, keine Übernahme der Test-Rallye.
- Arbeitszustand: zur Besprechung; Dokumentationsentwurf branch_only.
- Aufgabenbranch: docs/wissensreise-plan-20261014.
- Basiscommit: d3dd36d5b63062de7d4702c40ac1dd87574cc484 (frischer main).
- Integrationsziel: main ausschließlich für spätere Dokumentationsintegration; keine Mergefreigabe.
- PR: DraftPR wird zu diesem Branch angelegt; GitHub-Branch/PR-Stand live prüfen.
- Betroffene Dateien: docs/learning/WISSENSREISE_MASTERPLAN_20261014.md, diese Übergabe, eine eigene TODO-Sektion, ein eigener Registry-Eintrag.
- Überschneidungen: TODO/Registry sind gemeinsame Dateien. Frisch gelesen, vorhandene Einträge erhalten; keine fremden Taskzeilen verändert. Inhaltlich Pool/Classroom/Test-Rallye nur gelesen/verknüpft. PR235/236/218 und Lerninselpläne unverändert.

## Ziel und gewünschtes Verhalten

Martins Auftrag14.10.2026: ausführlichen Plan für eine Lernplattform aus eigenen Materialien/Tests erstellen, mit passenden interaktiven Übungen und didaktischem Aufbau ohne Benotung. Vorgeschlagener Name GradeCrew Wissensreise. Der Text ist ein Vorschlag zur Besprechung und keine genehmigte Bauvorgabe.

## Umfang und Grenzen

Reine Fachplanung: Architektur, Quellen-/Inhaltsmodell, Teacher-/Learnerflow, Übungsartenmatrix, didaktische Sequenz, Mini-Lernweg, Generierung/QC, Rechte, private Wiederaufnahme, Cache/Kosten, Accessibility, Devmode, Meilensteine und offene Entscheidungen. Keine Produktimplementation, Builds, Providerstarts, Installation, Merge oder Deployment. Manuelle Schülerantwortbewertung ausdrücklich auch aus späterem Scope ausgeschlossen. Freigabe generierter Inhalte bleibt etwas anderes.

## Akzeptanzkriterien und Zwischenstand

- Ausführlicher deutscher Entwurf mit2856 Wörtern vor finalen Quellenkorrekturen lokal gesichert.
- Bestehende elf Fragetypen von geplanten Ansichten getrennt.
- Kein Ranking/Noten/Strafsperren im Lernmodus, zuverlässige Schlüssel oder unbewertete Reflexion.
- Binomisches Beispiel mathematisch kontrolliert: (x+3)²=x²+6x+9; (2x+3)²=4x²+12x+9; (x−3)²=x²−6x+9.
- Eigene Task, wiederaufnehmbare Übergabe und begrenzte TODO/Registry-Zuordnung.
- Quellen-, Kontext- und Regelsichtung durchgeführt; lokale Strukturprüfung und Remote-Diffprüfung werden am Kandidaten durchgeführt.
- GitHub-Sicherung: Commit in dieser Branchhistorie; letzter konkreter SHA ist im Abschlussbericht/PR ersichtlich. Keine selbstreferenzielle Commit-SHA im selben Commit erfinden.
- Code: kein Produktcode. CI: für neuen Plan nicht als bestanden behauptet. Integration: nicht erfolgt. Staging-Hosting/Functions/Rules: nicht erfolgt. Nutzer-/Gerätetest: nicht erfolgt. Production: unverändert.
- GRADECREW_STATE.json bleibt unverändert: keine Feature- oder Release-Stufenänderung, nur branch_only/documentation.

## Frische Belege und Abhängigkeiten

1. START_HERE, AGENTS, CHAT_CONTRACT, CHAT_RECOVERY, TODO, STATE, Registry, README, TEMPLATE und GamesWorkflow/Briefing/Assetregel von main gelesen.
2. [Development Status38560181859](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38560181859), Job115839028260 success:26aktive Baustellen,22Overlapwarnungen,11veraltete kritische Branches,143unregistrierte Remote-Branches; keine automatische Bereinigung. TODO/Registry-Overlap bewusst nur eigene Einträge. Keine Wissensreise-/Wissensvorsprung-Branches/PRs bei der Suche gefunden.
3. Webquelle GC39:8f8697901f8c1aea89897be855ca2872c82d0f2b, functions/lib/schemas.js frisch gelesen. Elf Typen und Medienabsichten vorhanden; Lernpaket/Hilfen/Quellenbeleg nicht daraus ableiten.
4. Pool: PR218 open/unmerged,64d78d19fd48b50b440adf829c26de5e85c5dc4f; handoffci_green. Begrenzter Mittelschule6/9-Pool, keine Klasse10-Abdeckung behauptet.
5. Classroom: main-Handoff gelesen; Masterprojekt branch_only, kein Produktcode. LiveAuditPrimary17fc4278e2, +1/-134 zum Integrationsziel. Kein fertiger Classroomanschluss.
6. Test-Rallye: PR235 open/unmerged dc4a9747d4a179785dd715d08737330a2d5d4ffc; PR236 open/unmerged797549374df908cb9fd212be14b86e58061b347b. Keine Änderung/Übernahme ihres Scopes oder Nachweises.
7. Primärrecherche der Zentrale und Fachsichtung14.10.2026: LearningApps, Sofatutor, ANTON und IES/WWC direkt im Plan verlinkt. Funktionsbeschreibungen von Wirksamkeitsnachweisen getrennt; ANTON-Materialautomatik nicht als GradeCrewexklusivität dargestellt.

## Methoden, Modelle und Assurance

Gelesene Skills: /Users/martin/.codex/skills/gradecrew-wayfinding/SKILL.md und /Users/martin/.codex/plugins/cache/openai-curated-remote/superpowers/6.4.2/skills/brainstorming/SKILL.md. Ergebnis: nachvollziehbare Architekturvorschläge, gleiche Ansatzkriterien, vier nötige Produktentscheidungen im eigenen Plan. Der ausdrückliche Nutzerauftrag erlaubt den Planentwurf; neue Implementation bleibt ausgeschlossen. using-superpowers wurde gelesen, erklärt für Fachdelegationen selbst Nichtanwendung. Kein writing-plans-Ausführungspaket oder implementation-Skill gestartet.

Angefordert: spezialisierte Planung via Fachdelegation; konkrete model/effort-Overrides im eingegangenen Auftrag unbekannt. Beobachtetes tatsächliches Modell/Effort/Usage/Kosten unknown. Schwierigkeit: bereichsübergreifende Produkt-/Architekturplanung, Projektstartschema Sol/medium angemessen; keine laufende Modellumschaltung behauptet.

Assurance-Index gelesen. Anlassbezogener Folgescope für beauftragte Umsetzung: SEC06/07 für private Quellen/Schlüssel, SEC14/17 für untrusted Generierung/Quota, PRIV07/08/09 für Datenzweck/Minimierung/Löschung, PRIV12–15 für konkrete Inhaltsrechte/Bedienung. Ownerzuständigkeit Fachrollen aus bestehendem Assurance-Einstieg; aktuelle Produktkontrollstände für Wissensreise nicht geprüft, nicht pauschal erfüllt. Dokumentationsplan eröffnet keine Vollscan-/Rechts-/Deployfreigabe.

2D-DOM-Lernoberfläche braucht keine bildgestützte3D-Rekonstruktion; img2threejs nicht verwendet. Devmode/Feedbacktransport geplant und vor späterer Umsetzung konkret nachzuweisen, keine Zustellungsbehauptung.

## Offene Entscheidungen

Vor Bauauftrag: gemeinsamer GradeCrew-Lernmodus, Name/Pilotziel, menschlicher Produkt-/Inhaltsowner, Startumfang und Zugangs-/Speicherzweck. Quellen/Auth/Schlüssel bleiben Pflichtbedingungen. Weitere Formate, Medienerzeugung, Classroom und Katalogausbau optional. Keine neue Deadline, Eurokosten oder Wirksamkeitsgarantie.

## Wiederaufnahme und nächster konkreter Schritt

- Letzter gesicherter Teilschritt: ausführlicher Plan und Koordinationsdateien in diesem Docsbranch; exakten Head/PR frisch lesen.
- Lokaler Facharbeitsordner: work/wissensreise-plan-20261014 außerhalb sources; synced Quellen unverändert.
- Ungesicherte Produktänderungen: keine; fremde Checkouts nicht verwendet.
- Laufende/unklare externe Vorgänge: keine Produktjobs, keine Providerrequest; PR-Dokumentationschecks können automatisch folgen und sind live zu prüfen.
- Kostenreservierungen/Provider-Versuche: keine neuen Starts; bestehende Aufgabenbudgets unberührt. Documentation-Sicherungsversuch1; kein Retry unbekannter Mutation.
- Vor Wiederholung: Remotehead/PR und diese vier Dateien prüfen, gleiche Task-ID behalten. Test-Rallye nicht neu starten.
- Genau nächster ausführbarer Schritt: Martin bespricht die nötigen Produktentscheidungen aus Abschnitt16 des Plans; anschließend gesonderten nächsten Auftrag abgrenzen.
