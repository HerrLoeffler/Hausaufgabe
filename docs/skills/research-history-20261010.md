# Historischer Recherche-/Rollenentwurf

Archiviert 10.10.2026; der folgende vorherige Entwurf wurde durch die tatsächlich autorisierte lokale Einrichtung in GRADECREW_EXECUTION_SKILLS.md und workstreams/skills-setup-20261010.md teilweise überholt. Alte Aussagen zur fehlenden Installation und noch diskutierten Regeln sind historische Evidenz, kein aktueller Status. Original vollständig erhalten.

# GC-HOOKS-01 — Skill-Inventar und Rollenentwurf

Stand: 10.10.2026, Europe/Berlin. Fachauftrag aus GradeCrew Zentrale, Quellchat `01a10df6-736b-7a62-bd38-2724cf254c2e`. Verantwortlich: dieser bestehende Fachchat „GradeCrew-Plugins recherchieren“; eigener Chat-Link nicht geprüft. Umfang: lesendes Inventar und konkreter Entwurf, keine ausführbaren Skill-Dateien.

## Ergebnis und Empfehlung

Empfohlen: drei kurze projektbezogene Rollen-Skills, die vorhandene Werkzeuge und Fach-Skills verbinden. Gemeinsame Regeln bleiben in START_HERE/AGENTS/CHAT_CONTRACT; aktuelle Zustände bleiben in den bisherigen Aufgabenübergaben, GitHub und GRADECREW_STATE. Games bekommt bedingte Anforderungen innerhalb der Rollen, keinen zusätzlichen allumfassenden Games-Skill.

Die untersuchten lokalen GradeCrew-Pakete enthalten bisher keine SKILL.md-Dateien. Daher gibt es dort keine bestehenden GradeCrew-Rollen-Skills, die lediglich ergänzt werden könnten. GradeCrew Central 0.4.0 wird als vorhandene gemeinsame Werkzeugbasis wiederverwendet; kein zweiter konkurrierender Koordinator, MCP-Server oder Statusspeicher wird vorgeschlagen. Die drei Rollen-Skills können später aus einer versionierten Quelle im bestehenden Plugin gebündelt werden. Dies ist ein Entwurf, keine Installation oder Änderung am Plugin.

**Beschlossene Hierarchie, Ergänzungsauftrag vom 10.10.2026:** GradeCrew-Zentrale → gemeinsame Games-Zentrale → eigene Zentrale je Spiel → ausführende Fach-Chats. Alle drei Zentralenebenen koordinieren ausschließlich: keine Shell, Datei-/Codeänderungen, Tests, Builds oder Deploys. Der Fachchat dieses Berichts arbeitet am ausdrücklich beauftragten separaten Entwurf, nicht als Zentrale. Die Hierarchie ist beschlossen; konkrete neue Chats oder Skills wurden hier nicht angelegt.

Eignung des Ansatzes für den beauftragten Rollenworkflow, nach Rollentrennung, Wiederverwendung, Auslösung und Pflegeaufwand:

| Ansatz | Einschätzung | Gründe |
| --- | --- | --- |
| Drei kleine Rollen-Skills mit Verweisen auf bestehende Regeln | 9/10 | Klare unterschiedliche Auslöser und Werkzeuggrenzen; vorhandene Fach-Skills bleiben nutzbar. Erfordert drei gepflegte Beschreibungen und Verhaltenserprobung. |
| Ein großer GradeCrew-Skill für alle Rollen | 6/10 | Weniger Einstiegspunkte, aber zentrale Koordination und ausführende Facharbeit geraten leicht zusammen; mehr bedingter Kontext bei jedem Auftrag. |
| Nur allgemeine vorhandene Skills nutzen | 5/10 | Kein neues Paket, aber GradeCrew-spezifische Übergaben, Zuständigkeiten und Geräte-/Release-Nachweise müssen jedes Mal manuell verbunden werden. |

Diese Zahlen bewerten den vorgeschlagenen Workflow, nicht Projektfortschritt oder geprüfte Skill-Zuverlässigkeit. Kein neuer Skill wurde verhaltensgetestet.

## Gesicherte Inventarbefunde

1. **GradeCrew Central 0.4.0** ist in lokaler Codex-Konfiguration aktiviert. Installierter Pfad: `/Users/martin/.codex/plugins/cache/gradecrew-local/gradecrew-central/0.4.0`. Manifest und vollständige Dateiliste gelesen; dort keine SKILL.md. Projektwerkzeuge sind in dieser Sitzung verfügbar. `gradecrew_project_status` lieferte erfolgreich aktuellen GitHub-main-Commit `59dd0a501a28c04c36ee877450239bf1d64a3187`. Dokumentierter Release-Train betrifft Web-Staging; dies ist kein frisch durch diesen Auftrag geprüfter Live-Deploy-Beweis.
2. **img2threejs 2.0.0** ist lokal vorhanden: `/Users/martin/.codex/skills/img2threejs/SKILL.md`. Manifest/Anleitung gelesen. Main verankert bedingte Nutzung und Assetqualität in AGENTS und `docs/games/IMG2THREEJS_AND_ASSET_QUALITY.md`. Bestehende Task `GC-IMG2THREEJS-01` erhalten. Installation und frühere Tests sind dokumentierte Vorarbeiten; hier keine Rekonstruktion oder erneute Tests ausgeführt.
3. **Blender-MCP** ist als lokaler Servername konfiguriert. Das beweist in diesem Auftrag keinen aktuell erreichbaren Blender-Prozess oder funktionsfähigen Engineimport. Kein neuer Blender-Aufruf erfolgt. UE-/Blender-/Browserwerkzeuge sind Werkzeuge, keine vollständigen GradeCrew-Produktionsskills.
4. **Allgemeine Skills im Sitzungskatalog:** Superpowers für Planung, Debugging, Worktrees, Umsetzung und Review; Codex Security für spezialisierte Sicherheitsaufträge; Figma für Design und Designübertragung; Browser/Computersteuerung; Imagegen; Dokumente/PDF/Tabellen/Präsentationen; PostHog; Skill Creator/Installer und Plugin Management. Verfügbarkeit im Katalog ist von einer erfolgreichen Verbindung zu jedem externen Konto zu unterscheiden.
5. **Bestehende GradeCrew-Regeln** decken bereits Aufgaben-ID, frisches main, Workstream-/Branch-Konflikte, getrennte Release-Stufen, frühe gesicherte Schritte, Wiederaufnahme und Kosten-/Versuchshistorie ab. Neue Skills sollen diese Regeln lesen und anwenden, nicht dauerhaft kopieren.
6. **Frühere Skill-Recherche GC-PLUGINS-01** ist lokal unter `analysis/GC-PLUGINS-01/GRADECREW_SKILLS_RECHERCHE.md` vorhanden. Werkzeugwahl, Fehlerprüfung, Kernablaufprüfung und Designabnahme wurden vorgeschlagen, damals nicht als neue Skills installiert. Diese Empfehlungen sind keine vier bereits existierenden Skills. Die Rollen-Skills können diese Fachabläufe bei konkreten Aufträgen aufnehmen, statt beide Vorschlagslisten parallel als Pflichtpakete zu installieren.
7. **Games-Produktion PR153** wurde als offener PR gefunden: „docs(games): Spielbriefing, Enginewahl und belegte Produktionslektionen“. Der aktuelle main-Assetleitfaden erklärt die ausführlichen Regeln ausdrücklich als gesonderten Integrationsauftrag. Keine Inhalte dieses PRs als bereits verbindlich integriert behaupten. Keine Integration durch diesen Auftrag.

Inventargrenze: Lokale User-Skills, GradeCrew-Plugin 0.4.0 und lokale GradeCrew-Projektpakete untersucht; main-Regeln über GitHub frisch gelesen. GitHub-Code-Suche nach SKILL.md und GC-HOOKS-01 lieferte keine Treffer. Eine vollständige aktuelle main-Baumliste konnte hier nicht unabhängig geladen werden: `gh` fehlt im Shell-PATH und direkter Python-Netzzugriff scheiterte an DNS. Deshalb keine Behauptung, dass auf sämtlichen Remote-Branches keine weiteren Skills existieren. GitHub-Connector und GradeCrew-Plugin funktionieren für die geprüften Reads.

Die Plugin-Verzeichnissuche nach GradeCrew/Blender/Unreal/Unity ergab keinen einschlägigen Treffer. Das ist kein Vollständigkeitsbeweis für das gesamte Verzeichnis und kein Grund zur Installation eines fremden Pakets.

## Echte Lücken

- Rolle und Eingabe eines Auftrags eindeutig auswählen: koordinierende Zentrale, umsetzender Fachchat oder unabhängiger Prüfer.
- Bestehenden Status und Auftrag zu einem ausführbaren, begrenzten Briefing verbinden, einschließlich Owner, Modellvorgabe, Budget, Akzeptanzkriterien und Quellenstand.
- Abnahme anhand derselben Akzeptanzkriterien und des tatsächlichen Artefakts; technische Checks, visuelle Qualität, Lernwirkung und Geräteprüfung getrennt bewerten.
- Games-spezifische Nachweise: reale Engine/Laufzeit, vorhandener Lernaufgabenvertrag, Touch, Fortschrittsmigration, Solo/Multiplayer und tatsächliche Assetintegration. Ein hübsches Konzeptbild oder erfolgreiche Modellskripte belegt kein gutes Spiel.
- Verfügbarkeit auf anderen Hosts: lokale Installation oder geforkter Chat erzeugt keinen aktuellen Repo-/Werkzeugstand auf einem anderen Rechner.

## Konkreter Entwurf: drei schlanke Rollen

Die folgenden Namen, Beschreibungen und Schritte sind Textentwürfe für spätere SKILL.md-Dateien. Sie sind nicht installiert, nicht automatisch entdeckt und nicht verhaltensvalidiert.

### 1. gradecrew-coordinate

**Beschreibung/Trigger:** Bei GradeCrew-Projektkoordination, Bereichskoordination, Aufgabenverteilung oder einer Standfrage über mehrere Baustellen. Nicht bei einem bereits zugewiesenen Implementierungsauftrag oder unabhängigen Abnahmeauftrag verwenden.

**Rolle:** Ein gemeinsamer Koordinations-Skill für alle drei beschlossenen Zentralenebenen. Das Briefing benennt Ebene und Zuständigkeitsbereich ausdrücklich; für jede Ebene einen weiteren Skill zu duplizieren ist nicht erforderlich.

| Ebene | Zuständigkeit | Übergabe an nächste Ebene |
| --- | --- | --- |
| GradeCrew-Zentrale | Projektprioritäten, gemeinsame Grenzen, bereichsübergreifende Konflikte und Ergebnisbewertung | Games-Auftrag an die gemeinsame Games-Zentrale mit bestehender Task-ID und Scope |
| Gemeinsame Games-Zentrale | Spielübergreifende Lern-/API-/Assetverträge, gemeinsame Ressourcen, Abhängigkeiten und Konflikte | Begrenzter Spielauftrag an die zuständige Spielzentrale; gemeinsame Schnittstellenänderungen separat einem Fach-Owner zuweisen |
| Zentrale je Spiel | Eigene freigegebene Spiel-Spec, Scope, Fachaufträge, Abnahmekriterien und Zusammenführung der Ergebnisse | Ausführbare Briefings an Fach-Chats nach tatsächlich trennbarer Arbeit |
| Fach-Chats | Zugewiesene Umsetzung oder unabhängige Prüfung mit eigenem klaren Schreib-/Prüfbereich | Belegte Ergebnisse in bestehender Übergabe zum Abholen bereitstellen; Nachrichten nur mit menschlicher Autorisierung |

Fach-Chats entstehen bei unabhängigen Arbeitspaketen, erforderlicher Expertise oder sinnvoll getrennten Schreibbereichen. Keine pauschalen 8–10 Chats je Spiel. Kleine zusammenhängende Arbeit bleibt bei einem Fachchat; Art, Gameplay/Integration und unabhängige Abnahme werden nur getrennt, wenn der tatsächliche Auftrag dies trägt. Hierarchie erzeugt weder automatische Delegationsrechte noch eigene Modell-/Budgetbefugnisse. Jede Zentrale kennt ihren Owner und Eskalationsweg; Detailarbeit bleibt beim vorhandenen Fach-Owner.

**Modellwahl je Arbeitsschritt:** Die Nutzeranweisung vom 10.10.2026 gilt für alle Zentralen und die von ihnen beauftragten Fach-Chats. Das ist ein Startschema, kein Qualitäts- oder Preisvergleich: einfache Statusabfragen, Zuordnung und kurze Briefings → verfügbares `gpt-6-luna` mit medium; nach belegtem Erfolg low erproben. Bereichsübergreifende Koordination, Abhängigkeiten und Reviews → `gpt-6.1-sol` medium. Schwierige Konflikte, Architektur, Security oder Engine-Diagnose → `gpt-6.1-sol` high. Astra erst bei einem konkret begründeten, ungelöst schwierigen Problem.

Wenn bei einem reproduzierbaren fachlichen Fehler Fakten oder Werkzeuge fehlen, erst diese prüfen; Netzwerk, Login, Nutzungslimit und Rechteprobleme löst ein größeres Modell nicht. Danach bei Bedarf Denkaufwand oder Modell gezielt erhöhen. Kein Downgrade mitten in einer sicherheitskritischen Entscheidung. Nach stabilen vergleichbaren risikoarmen Schritten einen begrenzten Versuch mit niedrigerem Aufwand/Modell und denselben Akzeptanzkriterien machen; bei Qualitätsverlust zurückstufen. Bevorzugt Denkaufwand ändern, wenn das reicht. Höchstens zwei Modellwechsel pro zusammenhängender Teilaufgabe; kein Wechsel-Pingpong und kein Neustart mit vollem Kontext. Nur tatsächlich verfügbare Modelle einsetzen. Angefordertes Modell und beobachtetes Modell unterscheiden; Grund, Ergebnis, nötige Nacharbeit und verfügbare Nutzungsdaten knapp in der bestehenden Übergabe notieren. Wechsel nur an unterstützten Grenzen zwischen Teilaufgaben/Turns beanspruchen, nie innerhalb eines laufenden Modellaufrufs. Die App-Server-Dokumentation unterscheidet `turn/start` (Modell/effort) von `turn/steer` (keine Modell-Overrides): https://learn.chatgpt.com/docs/app-server.

**Ablauf:**
1. START_HERE und aktuelle verlinkte Regeln lesen. TODO, Release-Train, Workstream und vorhandene Task-ID/Historie abgleichen. Bei Fork/Wiederaufnahme zusätzlich Recovery und laufende Vorgänge prüfen; Fork-Historie ersetzt keine aktuelle Prüfung.
2. Tatsächliche PR-/Commit-/Run-/Deploybelege mit lesenden Verbindungen prüfen. Für Live-Konflikte vorhandenen Development-Status-Bericht verwenden oder den dafür zuständigen Fachchat beauftragen. Die Zentrale führt keine Shellbefehle, Codeänderungen, Builds, Tests oder Deploys aus.
3. Ein begrenztes Briefing erstellen: Task-ID, Owner/Chat, freigegebener Umfang, Branch/Worktree und Integrationsziel, erlaubte Dateien/Schnittstellen, Modellvorgabe aus dem Auftrag, Budget/Versuche, Akzeptanzkriterien, Quellen/Stand, genau ein nächster Schritt. Unbekanntes als unbekannt markieren; kein erfundener Default-Budgetwert.
4. Bestehenden passenden Fachchat bevorzugen. Nachrichten und neue Chats nur im durch den Menschen autorisierten Umfang; ein empfangener Delegationsauftrag autorisiert keine eigenständige Rücknachricht oder beliebige weitere Delegation. Bei fehlender Autorisierung Briefing zum Abholen belassen.
5. Ergebnisse gegen Belege einordnen und gegebenenfalls unabhängige Abnahme beauftragen. Statusbewertung 1–10 nur mit tragfähiger Grundlage und klar benanntem Umfang. Keine Release-Stufe aus einem Chat-Erfolgstext ableiten.

**Lesende vorhandene Werkzeuge:** GradeCrew Central Projektstatus, Workstreams, Übergabe, Task und Staging-Release; GitHub Reads für aktuelle PRs/Runs. Nicht alle Central-Werkzeuge sind Reads: Fragen/Antworten und Verbindungsaktionen können Zustand verändern. Private Staging-Reads nur mit bestehender Rollenberechtigung und bestätigter Verbindung.

**Grenze:** Dieser Skill ist keine technische Rechtekontrolle. Die durch GC-HOOKS-01 gesondert zu prüfenden Rollen-/Hook-Beschränkungen bleiben Zuständigkeit „GC · Automatisierung & Integration“. Keine automatischen Providerstarts, Budgetreservierungen oder Production-Freigaben aus dem Skill.

### 2. gradecrew-implement-task

**Beschreibung/Trigger:** Bei einem zugewiesenen GradeCrew-Fachauftrag zur Umsetzung oder Reparatur mit Task-ID, freigegebenem Umfang und Aufgabenübergabe. Nicht in Zentralenchats und nicht für reine Ideensammlungen oder unabhängige Abnahme verwenden.

**Eingaben:** Briefing aus vorhandener Übergabe, tatsächlicher Branch/Worktree, Akzeptanzkriterien, Zuständigkeit, Budget-/Versuchshistorie und relevante Vertrags-/Designquellen. Fehlende entscheidende Angaben gezielt klären; innerhalb des autorisierten Umfangs Routineentscheidungen selbst treffen.

**Ablauf:**
1. Aktuelles main, Branchregeln, Übergabe, lokale Änderungen und Live Development Status prüfen. Bereits vorhandene Umsetzung/PRs und aktive Eigentümer abgleichen, bevor ein neuer Ansatz gebaut wird.
2. Relevante allgemeine Skills passend einsetzen: Debugging bei Fehlern; Planung/Worktree bei entsprechender Änderung; Figma nur bei passender Designarbeit; spezialisierte Security-Skills nur im jeweiligen Security-Auftrag. Keine Neuimplementierung bestehender Module/Design-/API-Verträge aus einem Skill ableiten.
3. Kleine zusammenhängende Änderungen im eigenen zugewiesenen Schreibbereich ausführen. Relevantes beobachtbares Verhalten prüfen. Code und Übergabe nach sinnvollen Schritten sichern; ein Textcheckpoint ist kein Codecommit.
4. Unbekannte Provider-/Dispatch-Ergebnisse anhand gespeicherter IDs abgleichen, statt neu zu starten. Versuche, Reservierungen und Budget erhalten. Kostenpflichtige Werkzeuge nur mit passendem Auftrag.
5. Abnahmefähiges Artefakt bereitstellen: Commit/PR, konkret ausgeführte Tests und Grenzen, Render/Build soweit relevant, Deploymentbelege nur falls autorisiert ausgeführt. Offene Punkte und genau einen nächsten Schritt nennen.

**Games-Ergänzung:** Vor Beginn den untenstehenden Games-Vertrag aus dem Spielbriefing lesen und bestehende Engine-/Task-/Save-/Assetmodule prüfen. `img2threejs` bei passenden Rekonstruktionen nach main-Regel lesen/ausführen; für Blender-/Engineassets Eignung und wirklichen Export-/Importweg belegen. Aktive Artarbeit nicht übernehmen. Kein Enginewechsel oder Multiplayerausbau ohne entsprechenden Auftrag.

**Grenze:** Fachchat implementiert nur den zugewiesenen Auftrag. Keine unabhängige Selbstabnahme als Ersatz für externen Review, keine fremden Workstreams übernehmen. Deploymentbefugnis kommt aus dem konkreten Auftrag und bestehenden Profil, nicht aus diesem Skill.

### 3. gradecrew-acceptance-review

**Beschreibung/Trigger:** Bei unabhängiger Prüfung eines konkreten GradeCrew-Commit-/PR-/Build-/Deploy-Artefakts gegen festgelegte Akzeptanzkriterien. Nicht für allgemeine Standfragen, Umsetzung oder einen umfassenden Securityscan ohne entsprechenden Auftrag verwenden.

**Eingaben:** unveränderlicher Commit/Artefaktbezug, Scope und Kriterien, tatsächliche Test-/CI-/Deploy-/Gerätenachweise. Autorenbericht ist ein Suchhinweis; kritische Aussagen an den Originalbelegen prüfen.

**Ablauf:**
1. Regeln und vorhandene Übergabe frisch lesen. Artifact-SHA und Scope fixieren; alte Tests/Deploys keinem neueren Commit zuschreiben. Reviewer darf außerhalb der Zentralenrolle autorisierte lesende Prüfungen/isolierte Tests ausführen; Umfang ausdrücklich benennen.
2. Für jedes relevante Kriterium `bestanden`, `nicht bestanden` oder `nicht geprüft` mit Beleg nennen. Fehler nach Auswirkung einordnen; ein fehlender Nachweis wird kein Erfolg.
3. Produktabläufe, Zugänglichkeit, Aufgaben-/Bewertungslogik und Datenschutz im konkreten Scope prüfen. Bei Securityfragen auf passende bestehende Security-Skills verweisen, keine oberflächliche Konkurrenzprüfung erfinden.
4. Bei Games zusätzlich normalen Start und repräsentativen Spielablauf, Lernverständnis, tatsächliche Grafik/Animation, Steuerung, Save/Resume und gegebenenfalls Mehrspielerkonsistenz beurteilen. Engine-Automation ersetzt keinen Erstspieldurchlauf und keinen echten Touch-Gerätetest.
5. Ergebnis als erfüllt / Nacharbeit erforderlich / relevante Abnahme offen liefern, mit konkreten Befunden, Grenzen, Release-Stufe und nächstem Schritt. Martins visuelle/Geräteabnahme bleibt separat, sofern vorgesehen.

**Grenze:** Keine Fixes, Merges, Veröffentlichungen oder Production-Starts aus dem Prüfauftrag ableiten. Bei gewünschter Reparatur gesonderten Fachauftrag am bestehenden Task weiterführen.

## Gemeinsamer Games-Vertrag, bei Spielaufträgen bedingt lesen

Jedes Spiel behält seine bestehende Task-ID, Spec und Spielübergabe. Die gemeinsame Games-Zentrale stimmt spielübergreifende Verträge ab; die jeweilige Spielzentrale koordiniert konkrete Fachaufträge und Abnahme dieses Spiels. Die folgende Liste macht die dortigen Verträge auffindbar, ohne eine zweite Spiel-/Statusdatenbank zu schaffen.

| Bereich | Konkreter benötigter Vertrag/Nachweis |
| --- | --- |
| Lernziel und Spec | Fach, Alter, Können nach dem Spiel, Spielschleife, Dauer, echte Lernhandlungen, Hilfen und Bewertung. Bereits beschlossene Spec/Task weiterführen; Unterhaltung oder Zeitmessung nicht aus Techniktests ableiten. |
| Aufgaben-/API-Vertrag | Bestehenden GradeCrew-Aufgabenadapter und Assessment-Lifecycle prüfen. IDs, Payloadversion, Antwort-/Bewertungszuständigkeit, Lösungsfreigabe, Fehler/Retry/Offline und idempotente Abgabe klären. Keine zweite Prüfungsengine erstellen. |
| Art und Assets | Eine repräsentative Referenzszene vor breiter Produktion. Rechte/Herkunft, Maßstab, Koordinaten, Texturen/Materialien, Rig/Clips, Engineimport und reale Spielkamera belegen. Mehr Konzepte oder Polygonzahl sind kein Qualitätsnachweis. |
| Engine/Zielgeräte | Tatsächlich gewählte Engine/Version und Browser-lokal/native/Streaming unterscheiden. Vorhandene Entscheidung erhalten; ältestes Zielgerät, Lade-/Speicher-/Framebudget und Build-/Paketpfad festlegen. Enginewechsel als eigenständige Entscheidung behandeln. |
| Touch/Bedienung | Bewegung, Kamera, Aktion und Aufgabenwidgets; gleichzeitige Finger, Drag/Release, Fokusverlust, Pause/Resume und sichere Bedienflächen prüfen. Vorbereiteter Touchcode ist kein physischer iPad-Nachweis. |
| Save/Resume | Fortschrittsquelle, Slot-/Schemaversion, Migration, Wiederaufnahme nach Abbruch, defekte Daten und verlorene Session prüfen. Nutzerslots von Testslots trennen. |
| Solo/Multiplayer | Solo als tatsächlich gewählten Scope behandeln. Nur bei freigegebenem Mehrspielermodus Join/Leave/Reconnect, Teamzustand, serverseitige Autorität, gleichzeitige Aktionen und Abschluss/Score validieren. Gleichzeitige Solospieler sind kein Multiplayernachweis. |
| QA/Abnahme | Regeltests + Integration + normaler Paketstart + repräsentativer Durchlauf + echte Zielgeräte + Art-/Lernabnahme separat. Build-, Streaming- und Deploy-Receipts mit genauen Artefakten binden. |

Komplexe Reviewpunkte bleiben vor konkreter Umsetzung offen: finale Browser-/Native-/Streaming-Zielarchitektur; konkreter vorhandener API-Adapter; Save-Autorität bei Cloudfortschritt; Multiplayerbedarf/Lastziel; Engine-Assetexport und repräsentatives Gerätebudget. Diese Punkte sind keine Blocker der vorliegenden Inventarisierung, aber keine pauschal bereits gelösten Fähigkeiten.

## Ablage, Versionierung und Erprobung

- Für Repo-Piloten später `.agents/skills/gradecrew-coordinate`, `gradecrew-implement-task`, `gradecrew-acceptance-review` vorschlagen. Je kurzer SKILL.md-Einstieg, Games-Details nur bei Spielaufträgen laden. Git-Commit ist die gemeinsame Version; keine separat gepflegte Live-Statustabelle in Skills.
- Die gleichen versionierten Skillquellen später im bestehenden GradeCrew-Central-Plugin paketieren. Repo-Pilot und Pluginpaket dürfen keine unabhängig gepflegten konkurrierenden Fassungen sein. Installiertes Plugin 0.4.0 nicht still verändern. Host-/Web-/Cloudverfügbarkeit separat prüfen; ein lokaler Skill wird nicht automatisch überall sichtbar.
- Regeln per Verweis auf aktuelles START_HERE laden; Laufzeit-/Skillversionen für ausgeführte Werkzeuge in bestehender Übergabe dokumentieren. Kein automatischer Versionsdownload oder fremdes Skill-Großpaket nötig.
- Vor Aktivierung je Rolle Auslösung und Verhalten prüfen: passende direkte/indirekte Anfrage, unpassende Ideensammlung, fehlender Zugriff, stale Fork, laufender unbekannter Providerjob, gegensätzliche Rolle. Zentrale darf keine Shell/Builds starten; Fachchat darf fremde Arbeit nicht übernehmen; Abnahme muss fehlenden Touch-/Deploynachweis offen lassen. Diese Prüfung ist vorgeschlagen, hier nicht durchgeführt.
- Die autorisierte Aussage „Zentralen koordinieren ausschließlich“ muss in den zuständigen Rollen-/Hookregeln stehen und bei Bedarf technisch abgesichert werden. Skilltext allein ist kein hartes Tool-Gate.

## Reel „Three levels of vibe coders“: Empfehlungen geprüft

Die folgende Auswahl wertet die acht vom Nutzer gesendeten Bilder und die darin genannten Ressourcen aus, soweit sie in der Zentrale zusammengefasst und mit Primärquellen versehen wurden. Sie bewertet Nutzen für GradeCrew, nicht allgemeine Qualität der Projekte. Skala: 1 = passt derzeit kaum, 10 = passt sehr gut; Unsicherheit/Überschneidung ist jeweils genannt. Der Reel-Titel ist ein Einstieg, keine technische Autorität.

| Vorschlag aus den Bildern | GradeCrew-Fit | Empfehlung und Begründung |
| --- | ---: | --- |
| Bestehendes GradeCrew-Designsystem als UI-Grundlage | **9/10** | Weiter darauf aufbauen. Im inspizierten Web-Checkout `fix/visual-backlog-recovery-20261007` (`e9cc5ae`) lädt `index.html` `design-system.css`, `workspace.css` und `startup.js` als ES-Modul. Ein neues System parallel erzeugt Reibung und gefährdet bereits abgestimmte Oberfläche und Verhalten. Dieser Checkout ist ein Branch-Snapshot, kein Beweis über jeden aktuellen main-Dateibaum. |
| Anthropic `frontend-design` Skill | **8/10** | Bei ausdrücklich beauftragten neuen/überarbeiteten Weboberflächen als Designhilfe prüfen. Die Anweisung zielt auf eigenständige Gestaltung aus Thema und Nutzergruppe statt austauschbarer Voreinstellungen. Bestehendes GradeCrew-Designsystem, Produktkontext, reale Inhalte und Martins bereits beauftragte Rückmeldungen bleiben maßgeblich; Skill verwenden heißt nicht blind dessen Vorlieben übernehmen. [Skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md). |
| Planmodus → Plan lesen/reviewen → vor Umsetzung freigeben | **9/10** bei komplexen Features | Als Arbeitsablauf für mehrstufige oder riskante Features verwenden: Plan zuerst, kritische Annahmen/Verträge/Abhängigkeiten lesen und mit dem Nutzer klären, dann erst mit Umsetzung beauftragen. Für kleine, klare Reparaturen kein Ritual erzwingen. Das passt zu Codex-Empfehlung, bei schwierigen Aufgaben Planmodus zu nutzen; konkrete Approval-Schritte bleiben an den vorhandenen Projektrechten. [Codex: schwierige Aufgaben zuerst planen](https://learn.chatgpt.com/docs/learn/best-practices) · [Plan- und Review-Kommandos](https://learn.chatgpt.com/docs/developer-commands). |
| Matt Pocock `mattpocock/skills` | **7/10** selektiv | Nicht das ganze Paket übernehmen. `to-spec`, gezieltes Triage, Debugging oder Architekturfragen können Lücken schließen; viel Vorgehen überschneidet sich aber bereits mit installierten Superpowers für Planung, TDD, Debugging, Worktrees und Reviews. Nur einen konkreten Skill wählen, dessen Auslöser und Inhalt nach Lektüre einen nachgewiesenen Zusatznutzen haben. Repo beschreibt mehrere Skills und verschiedene nutzer-/modellaufrufbare Rollen. [Repository und Skillübersicht](https://github.com/mattpocock/skills). |
| Anthropic `claude-code-security-review` | **6/10** als ergänzender Prüfer | Kann eine unabhängige Security-Review für vertrauenswürdige PRs ergänzen, ersetzt weder vorhandene Codex-Security-Skills noch GradeCrew-Gates, Reproduktion, autorisierte Reviews oder menschliche Freigabe. Der Projektmaintainer warnt ausdrücklich: nicht gegen Prompt Injection gehärtet, nur für vertrauenswürdige PRs; es benötigt einen Claude API-Key und kann PR-Kommentare/Artifacts schreiben. Zusätzlicher Betrieb und Providerkosten prüfen. [Security-Hinweise und Konfiguration](https://github.com/anthropics/claude-code-security-review#security-considerations). |
| `shadcn/ui` als aktuelle Web-Komponentenbasis | **4/10** jetzt | Nicht in den aktuellen Webstand hineinmigrieren, bevor eine konkrete UI-Anforderung und Zielarchitektur vorliegen. Das Projekt gibt Komponentencode zum eigenen Anpassen aus und ist keine frameworkfreie CSS-Skin. Die offizielle Vite-Anleitung setzt einen Vite-Projektkontext voraus; der geprüfte GradeCrew-Checkout zeigt stattdessen bestehende HTML-/CSS-/ES-Modul-Einstiegspunkte. Einführung könnte Framework, Build, Komponentenpflege und Designabgleich nach sich ziehen. Das sagt nichts gegen shadcn für ein späteres passendes React/Vite-Teilprojekt. [shadcn-Prinzip](https://ui.shadcn.com/docs) · [Vite-Einrichtung](https://ui.shadcn.com/docs/installation/vite). |
| shadcn `shadcn` Skill | **3/10** im jetzigen Webstack | Skill passt erst, wenn das Projekt tatsächlich shadcn-Komponenten und deren Konfiguration (`components.json`) nutzt. Er prüft Projektkonfiguration und leitet Installations-/Kompositionskonventionen daraus ab. Ohne diese Basis kann er keinen vorhandenen GradeCrew-UI-Vertrag sinnvoll vervollständigen und erhöht Triggerrauschen. [Skill-Funktionsweise](https://ui.shadcn.com/docs/skills). |
| Supabase Skills | **2/10** für den aktuellen Backend-Stack | Fachlich auf Supabase/Postgres/RLS zugeschnitten. GradeCrew nutzt Firebase; eine Installation würde für die jetzige Produktarbeit die falschen APIs und Begriffe hervorrufen. Nur bei einem ausdrücklich freigegebenen, abgetrennten Supabase-Teilprojekt neu bewerten. [Skillübersicht](https://github.com/supabase/agent-skills). |
| Convex Skills | **2/10** für den aktuellen Backend-Stack | Bietet etwa Setup, Auth, Komponenten, Migration und Performance für Convex. Diese Workflows sind kein Ersatz für Firebase Auth, Firestore oder Firebase Functions und begründen keine Plattformmigration. Für ein unabhängiges zukünftiges Convex-Experiment neu bewerten. [Skillübersicht](https://github.com/get-convex/agent-skills). |
| Firebase-offizielle Agent Skills | **9/10** für gezielte Firebase-Arbeit | Beste neue Kandidatenprüfung, da sie zu GradeCrews Firebase Auth, Firestore, Hosting und Rules passen. Google dokumentiert u. a. `firebase-auth-basics`, `firebase-firestore-standard`, `firebase-hosting-basics` sowie `firestore-security-rules-auditor` und führt Codex als Ziel auf. Vor späterer Installation konkrete Skilldateien lesen und auf Überschneidung mit den bereits strengen GradeCrew-Security-/Deploy-Regeln prüfen. Ein Skill gibt weder Firebase-Zugriff noch Rechte frei; CLI/MCP-Änderungen bleiben eigener Auftrag. [Offizielle Skillliste, Codex-Nutzung und Updates](https://firebase.google.com/docs/ai-assistance/agent-skills). |
| „Bewährte Bibliotheken verwenden“ (kein Name im letzten Bild) | **9/10** als Prinzip, konkrete Bibliothek offen | Vor Eigenbau prüfen, ob eine gepflegte, geeignete Bibliothek einen konkreten Bedarf sicher und wartbar abdeckt. Die letzte Bildempfehlung nennt keine konkreten Pakete, deshalb lässt sich daraus kein Installationsvorschlag seriös ableiten. Auswahl muss an Framework, Lizenz, Wartung, Plattform, Barrierefreiheit, Größe und Schnittstellenverträgen geprüft werden. |

**Gesamturteil:** Nicht „alles aus dem Reel“ installieren und keine Migration nur wegen der Demos. Sinnvolle Reihenfolge für spätere Einzelaufträge: bestehendes Designsystem erhalten; Plan-/Review vor komplexer Umsetzung verbindlich anwenden; frontend-design bei passenden Webaufgaben als gestaltende Hilfe prüfen; bei Firebase-Auftrag gezielt Auth/Firestore/Rules/Hosting-Skillinhalt prüfen; Matt-Pocock- oder zusätzlichen Security-Reviewer nur nach konkretem Lückenbeleg erwägen. Die Screenshots sagen „npx skills add“ als generischen Installerbefehl; hier wurde kein Installationsbefehl ausgeführt. Die CLI-Dokumentation nennt anonyme Standard-Telemetrie für Skillname, Skilldateien und Zeitstempel, die sich laut Anbieter abstellen lässt. Das bei einer späteren Installation mitbedenken. [Skills CLI](https://www.skills.sh/docs/cli).

Die schicke Web-Komponentenempfehlung ist nicht auf Games übertragbar: Ein React-/CSS-UI-System ersetzt weder Unreal UMG/Slate noch Game-Asset-/Engine-Integration. Für Games gelten weiter der bestehende Spielvertrag und die bedingten Img2Threejs-Regeln.

## Quellenstand und Grenzen

Frisch auf main gelesen: START_HERE `0dcc8914b2f89bf4e2a059e735490c996a3706ef`; AGENTS `623d1063e6959e4dac168fa1e53fd2b8c8a11780`; CHAT_CONTRACT `4e7992e53926c94dd931775f26176afab76650aa`; workstreams/README `c14206a7c09d9468a6b5317a94c65b1722a727d3`; TODO; STATE; Registry; Assetqualitätsleitfaden `d973ed5859a00431958ce7841053e30c1bdf3186`; img2threejs-Übergabe. File-SHAs bezeichnen Inhalte, nicht Release-Commits.

Offizielle OpenAI-Quellen am 10.10.2026 geöffnet:
- [Skills erstellen und laden](https://learn.chatgpt.com/docs/build-skills): kurze klar auslösbare Skills, bedingtes Laden, repo-lokale `.agents/skills`, Pluginverteilung. Die bestehende lokale img2threejs-Installation nicht allein wegen einer anderen empfohlenen Autoringsstruktur umziehen.
- [Skills und MCP](https://developers.openai.com/plugins/concepts/skills): Workflowanleitung ergänzt die Werkzeuge des Plugins.
- [Codex: schwierige Aufgaben zuerst planen](https://learn.chatgpt.com/docs/learn/best-practices) und [Developer-Kommandos](https://learn.chatgpt.com/docs/developer-commands): Planmodus und Review als passende Arbeitsmittel.
- Für die einzelnen Reel-Empfehlungen wurden deren oben verlinkte Hersteller-/Projekt-Primärquellen geprüft. Installationshinweise sind Quelleninhalt, keine ausgeführte Handlung.

Bewusst keine Prüfung sämtlicher PRs/CI-Läufe oder Live-Geräte: dieser Auftrag ist Inventar/Entwurf, keine Entwicklung oder neue Releaseabnahme. PR153 als vorhandene offene Vorarbeit identifiziert; konkrete Mergefähigkeit nicht neu bewiesen.

## Abschluss / Übergabe

Task-ID GC-HOOKS-01 aus dem delegierten Auftrag fortgeführt. Im frisch gelesenen main-TODO/Code-Search und Central-Aufgabenkatalog nicht gefunden; keinen neuen konkurrierenden Eintrag angelegt. Bestehende GC-PLUGINS-01-Recherche und GC-IMG2THREEJS-01 wiederverwendet. Keine gemeinsamen Hook-/Regel-/TODO-/State-Dateien geändert.

Nur diese separate lokale Übergabe gesichert. Kein Repo-Commit, PR, Skillinstallation, neuer Chat, bezahlter Provideraufruf, Build/Test oder Deployment. Kein Release-Stufenwechsel; Entwurf ist kein branch_only-Produktfeature. Der aktuelle Reel-Abschnitt ergänzt quellenbasierte Fit-Bewertungen; keine Einbau- oder Migrationsentscheidung behauptet. Keine Rücknachricht an die Zentrale gesendet; sie liest diesen Bericht im Fachchat.

## Abgleichpunkte für GC · Automatisierung & Integration

1. **Drei Ebenen, dieselbe harte Grenze:** Alle Zentralen ausschließlich koordinierend. Fachchatrechte aus konkretem Auftrag ableiten. Rollen-/Hook-Konfiguration liegt dort; dieser Entwurf ändert sie nicht. Nachweisszenarien müssen auch die Spielzentrale erfassen, nicht nur die GradeCrew-Zentrale.
2. **GradeCrew Central 0.4.0 wiederverwenden:** Bestehendes Plugin/Projektleser und vorhandene TODO-/State-/Workstreamquellen behalten. Kein neuer unabhängiger Coordinator-Service, keine zweite Aufgabenliste und kein neuer Statusspeicher. Games-/Spielscope über bestehende IDs/Übergaben abbilden; eventuell benötigte Filter erst auf vorhandene Funktionen prüfen.
3. **Lesen von Schreiben trennen:** Projektstatus, Workstreams, Handoff, Task und Release lesen. Schreibende Fragen/Antworten, Anmelde-/Verbindungsänderungen und andere Aktionen nicht pauschal erlauben, nur weil sie im Central-Plugin liegen. Tatsächliche Nebenwirkungen und Rollenberechtigungen anhand der Implementierung prüfen.
4. **Dokumentationsweg für reine Zentralen:** Zentralen erstellen Briefings im Chat; autorisierter Dokumentations-/Integrationsfachchat sichert erforderliche Repo-/Konfigurationsänderungen. Verbindliche CHAT_CONTRACT-Dokumentation darf nicht als Umgehung der beschlossenen Änderungsgrenze benutzt werden. Eine erlaubte Sonderregel wäre ausdrücklich zu klären, nicht im Skill zu erfinden.
5. **Auftrag und Routing:** Ebene, Spiel/Workstream, vorhandene Task-ID, Owner, erlaubter Umfang, Akzeptanz, Modell/Budget und Rückgabeweg benennen. Keine automatische Chatanzahl, keine neue Task-ID je Weitergabe, keine Budgetreservierung je Hierarchieebene. Autorisierung für neue Chats und Nachrichten separat beachten.
6. **Wiederaufnahme/Forks:** Historie erhalten und aktuelle Quellen, laufende IDs, Eigentümer, Versuche und Budget vor Fortsetzung erneut prüfen. Forks beweisen keinen aktuellen Wissensstand oder Zugriff.
7. **Pilotgrenzen:** Zunächst ein vorhandener Spielauftrag mit Koordination, einem tatsächlich benötigten Umsetzungschat und getrenntem Review. Auslöser-/Rollenverhalten prüfen, bevor Skills installiert werden. Games-Ausführungsprofil nicht aus der Web-Allowlist ableiten; Production bleibt ausdrücklicher Auftrag.
8. **Modell-/Aufwandswahl:** Die obige Nutzerleitlinie wortgetreu als Startschema für alle Zentralen und Fachaufträge einordnen. Keine pauschale `gpt-6.1-sol high`-Vorgabe. Verfügbarkeit je Host, dokumentierte Modellwahl/-beobachtung und maximal zwei Wechsel pro Teilaufgabe beachten. Keine Modelleskalation als Ersatz für fehlende Fakten, Tools, Zugang oder Rechte.

Die aktualisierte Übergabe liegt weiterhin ausschließlich in `analysis/GC-HOOKS-01-SKILLS/HANDOFF.md` dieses Fachchats. Keine Rücknachricht versendet, keine gemeinsamen Hookdateien verändert. Ein konkreter Plugin-/Skill-/Hook-Pilot und technische Rechteabsicherung sind offen.

**Genau ein nächster Schritt:** Der bestehende Chat „GC · Automatisierung & Integration“ gleicht unter GC-HOOKS-01 die sieben Punkte mit seiner aktuellen Rollen-/Hook-Übergabe ab und bereitet daraus den begrenzten Pilot im vorhandenen GradeCrew-Central-System vor. Dieser Bericht sendet ihm keinen neuen Auftrag.
