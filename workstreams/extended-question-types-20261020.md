# GC-EXTENDED-QUESTION-TYPES-01
Owner: ausführender Fachchat „GradeCrew erweiterte Aufgabentypen“, Chat-Link unbekannt.
Stand 2026-10-20. Phase branch_only; keine Freigabe für Schul-/Live-/Altprojektdeploys.
Basis: main c14a8fdee (Koordination), Runtime feature/gradecrew-app-integration 4f8b79222a, gc45-rc1. Eigener isolierter Clone, Branch feature/extended-question-types-20261020. Keine fremden Arbeitsstände angefasst.

## Auftrag und Grenzen
Bestehenden Remy→Editor→Prüfung→Schüler→Bewertung-Weg erweitern. Hotspot, Grafikbeschriftung, Zahlenstrahl; keine neue Navigation oder zweite Engine. Vollständiger lokaler Prototyp, synthetische Inhalte, null bezahlte Providerstarts, null Cloudwrites/deploys. Generierung und lokale Identität sind als Simulation gekennzeichnet. Maßgeblicher Grader ist assessment-functions/lib/assessment-core.js über main.js→secure-lifecycle.js. index.js/secure-submit.js sind nicht die aktive Exportquelle.

## Frischer Bestand / Parallelität
Elf Typen in app.js, functions/lib/constants.js und Assessmentkern bestätigt: single,multi,text,dropdown,truefalse,gapfill,matching,ordering,grouping,markwords,number. Keine drei neuen Formate.
Development-Status am 20.10 ausgeführt: 25 aktive Workstreams,24 Überschneidungen,17 alte kritische Branches; PR-Abgleich dort wegen fehlendem Token übersprungen. Separater GitHub-Connector bestätigt offene PR252 Kapiteltests und253 adaptives Üben (beide Plan-/Prototypdokumentation); keine Übernahme. PR242/245/246 ältere UI-Kandidaten beachten: aktuelle Integrationsbasis enthält mobile Schüleränderungen. Remy-/Editor-/Graderstellen werden nur um neue Typzweige ergänzt.

## Entscheidung
Strukturierte, eigene SVG-Szenen mit neutralen Objektkennungen, keine fremden Bilder oder ausführbarer KI-Code. Öffentliche Darstellung per Allowlist; private Lösung separat. Beschriftungen verwenden Auswahlfelder statt Drag-Pflicht. Zahlenstrahl mit Rastwerten und Tastaturbedienung. Pflanze und Sprach-Raumszene, mathematische Skala; historische Zeitachse kann dieselben Zahlenverträge verwenden. Fachliche Vorlagenprüfung bleibt nötig; keine beliebigen Karten/Anatomie garantieren. Winkel zunächst ausgeschlossen.

## Nachweise und offene Punkte
Referenzanhang vollständig gelesen, keine Kopie ins Repo. ZUM/H5P/Moodle Primärseiten frisch geöffnet. Numbas-Direktlink nicht erreichbar; keine API daraus abgeleitet.
Modellwahl: komplexe Schnittstellen-/Sicherheitsarbeit rechtfertigt Sol/high gemäß Projektregel; tatsächliche Runtimeauswahl und Usage unknown, kein Modellwechsel behauptet.
Nächster Schritt: Implementierungsplan abarbeiten, lokale bestehende Fixtureumgebung ausbauen, Fokusverhaltenstests und unabhängiger Review; keine Geräteabnahme aus Browserformaten ableiten.

## Implementierter lokaler Stand und Review
- Drei Typen in vorhandener Remy-Typauswahl, Import, Serialisierung, Editor, Schüler- und Ergebnisdarstellung. Keine zweite Navigation oder Assessmentengine.
- Feste lokale Beispielerstellung5Aufgaben/10P: Pflanze (NT), Raumszene (Deutsch/Sprachen), deutsche Teilung/Einheit auf Zeitachsen (GPG). Keine beliebigen Themen/Medien/echten KI-Versprechen. Modell-/Providerverbrauch0durch diesen Prototypadapter, Codex-Usage unknown.
- Bestehende Hauptoberfläche und secure-student.html, bestehende Entwürfe/Editoraktionen und Dashboardzugang. Eigener Server auf127.0.0.1:8784, Session49794; Startskript liegt als Ausgabe vor. Stoppen nur diesen eigenen Prozess. Kein Cloud-/Emulatorstart.
- Echtes Browserbeispiel: Hotspot2/2, Beschriftung2/4, Skala2/2, R/F0/1, Single1/1 →7/10/70%. Reload erhält strukturierte Antworten. Vorhandene Wilma-Einzelansicht zeigt dekodierte Antworten; manuelle Korrektur7→8→7perUI gespeichert. Emmi „Einfacher formulieren“ verändert2Aufträge, ausdrücklich lokale Simulation.
- Mobile Browserproben über feste iframe-Breiten390/768/1024in derselben App; keine physischen Geräte-/Safari-/Touchmessungen behauptet. Native Buttons/Selects und Range-Tastaturvertrag,44pxZielhöhe. Screenshots nur in lokalem outputs, keine privaten Daten.
- Review /root/visual_contract_review: erster Vertragsscope und zweiter Integrationsscope. Gefundene Punkte behoben mit Regressionen: semantische Shape-Tags (auch Browservorlagen), kleine numerische Skalen, Korrektheit vor Punktrundung, Mindestteilpunkte, Teacherdecoder, lesbare Lösungsfreigabe, Ergebnis-Revision/Fragensnapshot, lokale Nachkorrektur. Eigener anschließender Restoretest fand und beseitigte change-Callbacks beim Wiederherstellen (dürfen weitere Felder nicht überschreiben).

## Verifikation und Grenzen
Assessment96/96; Functions281/281; Root384/384 im abschließenden vollständigen Stand. Service5/5, HTTP-Isolation1/1, fokussierte UI6/6. Paketierung171Dateien lokal ohne Deploy. Node24.19.0 verfügbar, ProjektzielNode22; keine Node22-CI behauptet.
Zusätzlich bestehende tools/ui-Suite129/130: Altfehler „view navigation restores focus without interrupting an input or an open dialog“ mit ReferenceError syncDashboardTutorialEntry. Auf sauberem4f8b792-Kopiestand separat reproduziert; showView bytegleich. Kein Beheben unbeteiligter Altbaustelle und keine grüne Gesamtsuite behaupten.

## Offene Produktgrenzen
Lokale Lehrkraftidentität, Paper-Lifecycleadapter und Emmi-Simulation sind keine Produktionsautorisierung. SicherePaperprojektion und Grader sind real; realer Firestore-/Auth-/Deadline-/Offlinequeue-Ende-zu-Ende-Emulatortest offen. Der Beispielserver erzwingt eigenesStarten ohne Zeitlimit; Klassenstart/Fristen und Lösungsfreigabe werden hier nicht als livegeprüft verkauft. Bestehende Cloud-Lifecyclelogik und alte Fragen unverändert, neue private Lösungssnapshots ergänzt. Physische Geräte, komplette neueTyp-I18n, Druck-/PDF-Geräteabnahme, KI-Schema-/Providerqualität, geprüfte fachliche Vorlagenbibliothek und freie Varianten weiter offen. Keine neue Instanz/Keys/IAM. Winkel, freie Karten/Anatomie, Koordinaten/Bruchflächen/Diagramme/Grafiktexte, Kapiteltests und adaptivesÜben nicht implementiert.
Nächster konkreter Schritt: Martin prüft den lokalen Ablauf und die fachliche Verständlichkeit der drei Familien; spätere Integration erst mit echtem Emulator-Lifecycle/Generierungsnachweis. Kein Merge-/Deployauftrag.

## Sicherung und ausgewählte Assurance
Lokale Commits da02d9b und cc022d2 gesichert. Normaler HTTPS-Gitpush am20.10 scheiterte mangels Terminal-Credential (could not read Username); kein Passwort/Token angefordert. Alternative: vorhandenen GitHub-Connector für einen neuen Branch mit exakt gleichem Gitbaum verwenden. Kein Merge/Deploy/Guardian/Providerbudget. Connector-Commit kann andere Metadaten/SHA haben; Baumgleichheit wird gesondert geprüft. Der lokale Gitverlauf bleibt erhalten.
SEC08/14/17: lokale serverseitige Bewertung, negative Model-/Answer-/Projektionschecks und unabhängiger Review im benannten Scope erfüllt; keine globale Cloud-Erfüllung. SEC06/07/04: bestehende Produktionsauth/Rules unverändert, neue Lifecycle-Emulatornachweise offen; lokaler Teacheradapter ausdrücklich simuliert. PRIV07/17: ausschließlich eigene erfundene Daten, keine Kinderdaten oder Uploads. PRIV13: nummerierte generische Beschreibungen verraten keine Lösung, vollständige nichtvisuelle fachliche Alternative/Screenreader-Geräteprüfung offen. PRIV20: echte Datenlöschwege unverändert/nicht Gegenstand; eigene Beispieldaten nur lokal. Rollenbriefs und Katalogauswahl von main gelesen. Keine Rechts-/Schul-/Gerätefreigabe daraus.
