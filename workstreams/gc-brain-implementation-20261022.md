# GC-BRAIN-01 — Umsetzung im beauftragten Fachchat

Direkter Humanauftrag: Dieser Chat setzt die Firmenzentrale selbst um, auf Grundlage des Plans; doppelte Bereichsnavigation entfernen, Unterpunkte kontextabhängig zeigen, optisch und funktional sorgfältig prüfen. Keine Subagenten oder neuen Fachchat-Aufträge. Live unverändert.

Quelle: Plan PR293, fachliches Delta84de180+907a961, Abschluss4ace367. Vorhandene heutige Testseite: docs/prototypes/gc-brain-firmenordnung.html, isolierter Checkout gc-brain-company-view-20261022, Ursprung b912d03. Eigener neuer Branch feat/gc-brain-clear-navigation-20261022. Historische Designprobe bleibt erhalten.

Ruling: Bestehenden isolierten sauberen Klon weiterverwenden; neuer Featurebranch statt zusätzlicher Worktree. Keine gemeinsame Produktdatei überschrieben.

Ruling: Benutzerwunsch „du alleine“ hat Vorrang vor Subagenten-Review im executing-plans-Skill. Selbstprüfung wird ausdrücklich als solche dokumentiert; keine unabhängige Produktabnahme behauptet.

P0: Integratorbeleg HOST-P0-BLOCKER-01.md vom22.10: Host stellt keine erreichbare MCP-App-Fläche bereit; Tools liefern Snapshot. Erneut gradecrew_open aufgerufen, mcpapps-Tabliste leer. Kein Login/Worker/Modellturn gestartet. Benutzer um Öffnen der bestehenden Central-Seitenansicht gebeten. produktiver Store/API/Dispatch bleibt bis qualifiziertem Anschluss offen. UI, Navigation und lokale Entwürfe können unabhängig vorbereitet und geprüft werden; keine Simulation von abgeschlossener Firmenarbeit.

Gestaltung: Papierweiß #ffffff auf #f6f7f5, Text #21352f, GradeCrew-Grün #25684f, Sekundärtext #64716a, Linie #dfe5df, Hinweise #9b651f. Avenir Next/Systemschrift; 40/28/20/15px Hierarchie. Eine schmale Navigation; Hauptinhalt linksbündig, kontextuelle Tabs und Brotkrumen. Aktionsbedarf erhält Vorrang vor einer Flut von Kennzahlen/Kacheln. Firmennetz als optionale Beziehungssicht, kein zweites Bereichsmenü.

Ausführung: 1 Navigation und Datenprojektion mit Regressionen; 2 heutige Themen und Akten übernehmen; 3 Eingang/Wissen/Qualitätsansicht und lokale Entwürfe; 4 sichtbare Desktop-/Mobilprüfung; 5 Quellen/Code/Übergabe sichern. Echte verbundenen Arbeitsabläufe danach nur mit bestandenem P0. Dies ist eine Reihenfolge innerhalb des Gesamtauftrags, keine Umdefinition der V1 als bloßes Dashboard.

## Gesicherter Stand am 23.10.2026

Lokaler erster Zwischencommit: 7e34556, anschließend Bedien-/Prüfkorrekturen. Produktstufe branch_only; lokale Browserprüfung ist keine Nutzertest- oder Stagingstufe. Kein Merge, kein Deployment, kein Livezugriff, kein Worker-/Modellstart. GitHub-Sicherung enthält ausschließlich die neue Frontendmappe, ihre Tests, eigene CI und diese Übergabe. Die frühere Testseite bleibt erhalten. Remote-Abgabe wird auf geprüftem main21723ad5cfe3fb8e4062280b2dc2b7fb476c1de3 aufgebaut; der lokale Zwischencommit hat die historische Vorschau als Elternstand. Nur die hier benannten eigenen Dateien werden übertragen, keine historischen Plan-/Koordinationsänderungen.

### Umgesetzt

- Vier Haupteinstiege Heute/Eingang/Arbeit/Wissen; Bereiche nur einmal wählen, danach kontextuelle Unterpunkte.
- Neun Bereiche und vier echte Originalthemen aus V3 erhalten. Keine erfundenen aktuellen Firmenzahlen, keine doppelt angelegten Themen.
- Themenakten mit Aufgaben/Unteraufgaben, Entscheidungen, geparkten Ideen, Gesprächsbezügen, Quellen, Verlauf und Zusammenhängen.
- Globale Suche über vorhandene Themeninhalte sowie lokale Entwürfe; Themen-/Bereichsfilter und Wissenssuche.
- Lokale Entwürfe anlegen/bearbeiten, Reloadbeständigkeit und Markdownexport. Ungespeicherte Eingaben beim Schließen geschützt. Beschädigter Speicher wird nicht ersetzt; Speicherfehler werden nicht als Erfolg ausgegeben.
- Aufgabenqualität als eigener Einstieg. Prüfkriterien und konkrete Akten getrennt von tatsächlicher Freigabe. Ohne geeignete Zielnachweise keine Prozentanzeige.
- Ruhige grüne Gestaltung, Tastaturfokus, native Dialoge, Mobilmenü mit Schließen-Taste. Eingeklappte Navigation ist inert und aria-hidden.
- Strikte CSP, keine Fremdassets, Quellenlinks nur HTTP/HTTPS, Nutzereingaben über Textknoten statt HTML. E-Mail/Support/Chat klar als nicht verbunden gekennzeichnet.

### Tatsächlich geprüft

Node: sieben Modelltests bestanden (Routing/Reloadadressierung, verschachtelte Suche, unbekannter Fortschritt, unsichere URLs, kaputter Speicher, Schreibfehler, Entwurf-Roundtrip). Syntaxcheck app.mjs und git diff --check erfolgreich. Die sieben Tests wurden zunächst rot und danach grün ausgeführt. Eigene CI prüft Syntax und diese Modelltests; sie ist keine Browser-E2E-Suite.

Browser: Codex-IAB, Desktop1280×720 sowie390×844 und320×740. Keine echten iOS-/Android-/Safari-Gerätenachweise.

| Prüfweg | Beobachtetes Ergebnis |
|---|---|
| Heute → Arbeit → Firmenbereich Technik → Themen | Unterpunkte und Arbeitsinhalt getrennt; keine zweite Bereichskachelung |
| Bereichsunterseite neu laden | Technik/Themen bleibt geöffnet |
| Erweiterte Aufgaben → Aufgaben → Formatfamilie | Unteraufgaben erscheinen beim Aufklappen |
| Internationalisierung → Entscheidungen/Verlauf | Originalentscheidungen und Historie vorhanden |
| Gespräch → Arbeitsauftrag vorbereiten | Task-ID, nächster Schritt, Abnahmegrenze und Quellen stehen im Formular; kein Versand |
| Globale Suche GC-CLASSROOM-01 | Originalakte und verknüpfte Akte gefunden |
| Unbekannter Suchbegriff | Klarer Leerzustand |
| Themenfilter Finanzen | Leerzustand statt erfundener Themen |
| Wissen → ASV | Drei Quellen angezeigt; lokale Pfade bleiben als Text sichtbar |
| Entwurf speichern → Reload → bearbeiten | Prüfeintrag bleibt erhalten und aktualisierbar |
| Text mit Script-Tag | Bleibt Text im Formular/Markdown; keine Ausführung |
| Markdown herunterladen | Datei gelesen; Inhalt entspricht bearbeitetem Entwurf |
| Geänderten Dialog schließen | Änderungen bleiben erhalten; explizites Verwerfen möglich |
| Cmd+K / Escape | Suche öffnet und schließt |
| Mobile Menüwahl/Schließen | Inhalt wieder zugänglich; verstecktes Menü aus Fokus-/Accessibilitybaum entfernt |
| Breiten320/390 | Dokumentbreite entspricht Viewport, kein horizontaler Überlauf in geprüften Ansichten |
| Qualität / Ziele | Abnahme offen bzw. Fortschritt unbekannt; keine scheinbare Grünfreigabe |
| Browserfehlerprotokoll | Keine erfassten JavaScriptfehler |

Ein eindeutig benannter lokaler Prüfeintrag bleibt im Testbrowser erhalten; er ist kein Unternehmensauftrag. Export liegt lokal in Downloads/gradecrew-entwurf.md. Screenshotbelege unter /Users/martin/Documents/Codex/2026-10-21/gradecrew-firmenzentrale-konzept/outputs/Umsetzung-2026-10-23/ (Heute-Desktop.png, Bereich-Technik.png, Heute-Mobil.png). Screenshots werden nicht als Produktabnahme gewertet.

Gefundene und korrigierte Probleme: versteckte Mobilnavigation war noch fokussierbar; explizite Schließen-Taste fehlte; lokaler CSS-Cache konnte alte Menüstile zeigen. Korrigiert durch inert/aria-hidden, Mobile-Schließen-Taste und versionierte Entrypointassets. Ein sofortiger Screenshot während Menüanimation zeigte einen Zwischenzustand; stabilen Folgezustand erneut geprüft.

### Audit / Parallelität

Live Development Status39858884594, Job120104106094, Stand21723ad, erfolgreich gelesen. Bericht meldet27 aktive Baustellen,24 Parallelüberschneidungen,17 veraltete kritische Branches sowie zahlreiche unklassifizierte Branches. Relevante Brain-PRs269/293 sind Dokument-/Planstände; keine neue produktive Firmenzentrale im Audit nachgewiesen. Nur neue eindeutig abgegrenzte Pfade dieser Aufgabe verändert. Keine gemeinsamen TODO-/Registry-/STATE-Dateien parallel überschrieben. Vor Integration erneuter aktueller Audit und integratorgeführte Aufnahme dieses Branches in das gemeinsame Register erforderlich.

### Tatsächlicher Blocker und verbleibender Auftrag

Die vollständige Firmenzentrale ist NICHT fertig. Die Oberfläche ist ein unabhängig geprüfter Teilschritt des bestehenden Gesamtauftrags.

HOST-P0-BLOCKER-01 bleibt offen: vorhandene gradecrew_open-Ausgabe liefert strukturierte Snapshotdaten, keine erreichbare MCP-App-Fläche; mcpapps-Tabliste leer. Der bereits dokumentierte Native-CUA-Zugriff auf Codex ist gesperrt und wird nicht umgangen. Die angebotenen GradeCrew-Tools können Snapshot/Fragen/Antworten bearbeiten, liefern aber keinen bewiesenen Ausführungs- und Rückmeldeweg. Kein neuer P0-Dispatch versucht. Historische Pluginversuche2/3, Worker0, Modellturns0 unverändert.

Die technische Bitte an Martin, ein bestehendes MCP-Seitenpanel zu öffnen, war unverständlich; er hat keine solche Aktion bestätigt. Daher kein Panelzugriff oder PASS daraus abgeleitet. Keine neue Anmeldung, Installation, Providerfreigabe oder Parallelplattform vorgenommen.

Nächster notwendiger Schritt: erreichbaren unterstützten App-Host qualifizieren und einen synthetischen Auftrag vom UI über beständige Annahme bis zur zurückgelesenen Antwort prüfen. Offizielle ui/message-Unterstützung active/new ist keine Garantie für beliebige bestehende Chats (https://developers.openai.com/plugins/build/extensions). Danach bestehen weiterhin die Planpakete für gemeinsamen Store/Identität/Rechte, verbindliche Ziele und Entscheidungen, Inboxquellen, ausführbare Qualitätsgates, sichere Automatisierung, Suche mit Aktualisierung, Sicherung/Wiederherstellung und vollständige V1-Abnahme. Die Frontendprobe ersetzt keine dieser Arbeiten.

Selbstprüfung durch diesen Chat gemäß direktem Auftrag „du alleine“. Kein unabhängiges Review und keine Perfektions-/Vollabnahmebehauptung.

GitHub-Sicherung: https://github.com/HerrLoeffler/Hausaufgabe/pull/295 (Draft), erster Remotecommit7dc7aee31038d7c65bc75a0b328c7cbd7478678b. Abschließende Navigationskorrektur: Innerhalb eines Firmenbereichs zeigt die linke Unternavigation nur Rückweg, Bereichsauswahl und dessen vier Unterpunkte; globale Arbeitsunterpunkte werden dort ausgeblendet. Dadurch werden auch links doppelte Ziele-/Wissen-Einstiege auf derselben Hierarchiestufe vermieden. Im Browser erneut geprüft.
