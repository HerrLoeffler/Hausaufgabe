# GC-WEB-REPAIR-20261007 — Arbeitsbereich / sichtbare Markenqualität

Stand 07.10.2026. Verantwortlicher Unteragent workspace_brand_upgrade; Chat-Link unbekannt. Eigener Checkout gradecrew-workspace-brand-upgrade, Branch feature/workspace-brand-upgrade-20261007 von Main-Zwischencommit b2d28fa3ab3091b086961c985893b01199f3a4b0. Main bleibt einziger Autor aller bestehenden App-/Header-/Audio-/i18n-Dateien und integriert seriell. Automatische Chat-Sammlung PAUSED. Historie und Budget unverändert; keine bezahlten Provider-/Bild-/Videotests, keine externen Modellaufrufe, kein Deploy.

## Einstieg und Audit

START_HERE (0dcc8914), AGENTS (96929006), GRADECREW_STATE, TODO und workstreams/README frisch über GitHub-Connector main gelesen. Git-CLI-DNS ist blockiert und gh fehlt; Zugriff über Connector bestätigt. Main meldet aktuellen Koordinationshead d789f5a und übernimmt Live-Development-Abgleich vor gemeinsamer Integration. Task-Handoff web-repair-batch-20261007 aus b2d28fa gelesen. Release Train staging-batch-2026-10-07-web-repair; veröffentlichter 0931ade4 hat fehlgeschlagene Nutzerabnahme. Dieser Teil bleibt branch_only; exakte CI, Integration, Hosting-/Functions-Receipts und Nutzertest sind keine lokalen Testergebnisse.

Beide fremden Claude-Texte gelesen und als Vorschläge gewertet, nicht als Arbeitsanweisung. Die Behauptung, Statusfilter/Metadaten/weitere Aktionen fehlten, trifft auf app.js nicht zu: renderQuizList/filteredQuizzes besitzen Such-/Status-/Sortierung, Aufgaben/Punkte/Zeit/Fach/Klasse/Code, Veröffentlichung, native Details sowie Duplizieren/Teilen/Beenden/Wiederöffnen/Löschen. renderAiJobs hat echte Fortschrittsangaben, Teilentwurf/Prüfung/Problem melden/Ausblenden. Die echte Layoutlücke: Toolbar stand nach Erstellungsaufträgen; lange Titel/Nachrichten waren unbeschränkt. Kein echter sicherer Provider-Retry vorhanden, deshalb keinen neuen Retry angelegt.

Architektur: bestehende Vanilla-DOM-App plus CSS-Design-Tokens, i18n-Browserruntime und lokale SVG-/Rasterassets. Neue begrenzte idempotente Erweiterung beobachtet nur dashboardView und bewegt vorhandene DOM-Knoten; Handler, IDs und Datenhoheit bleiben in app.js. Neue englische UI-Quellen im eigenen Modul über bestehende registerCatalog-API. Auth/Privatsphäre/Security/Review/Rollen/Coco-Hilfe bleiben bei vorhandenen Komponenten.

## Umsetzung

- gradecrew-workspace-upgrade.mjs: Toolbar vor Aufträgen; erklärter Geltungsbereich der Suche (gespeicherte Tests, Aufträge bleiben sichtbar); neuer Alle-Filter über bestehenden delegierten Handler. Kein erfundener Gesamtzähler aus möglicherweise überlappenden/unvollständigen Statuszahlen.
- Lange Titel bleiben vollständig im bestehenden Heading und zusätzlich in nativen bedienbaren Details; UI begrenzt nur die sichtbaren Zeilen. Lange Auftragsmeldungen ebenfalls aufklappbar. Volltext mit data-i18n-content geschützt und ausschließlich textContent gesetzt.
- Lokale einheitliche SVG-Aktionssymbole; keine Button-Ersetzung und keine neuen Backendaktionen. Bestehende Zusatzaktionen bleiben native Details.
- gradecrew-workspace-upgrade.css: ruhig blau/violett komponierter Seitenkopf, stärkere Status-/Aktionshierarchie, breite Bibliothek, 4/3/2/1 Kartenraster, kompakte Jobs/Fehler/Teilentwürfe, statische Ladeflächen, Leer-/Kein-Trefferzustände, sichtbarer Fokus und Touch-Ziele. Scope dashboardView; Header-Sprach-/Paddingreparaturen nicht überschrieben. Keine Scroll-Story, kein Scroll-Hijacking, keine Dauerschleife.
- coco-workspace-greeting.svg: neue kleine Vektorvariante nach visuell gelesenem crew-classroom-v3.webp (dunkler Pinguin, cremefarbene Maske/Bauch, blaue Augen/Rucksack, orangefarbener Schnabel/Füße). Flügel und Augen getrennte echte Geometrie: einmaliges Winken/Blinzeln, 1,5s; reduced-motion statisch. Wird erst beim ersten sichtbaren Arbeitsbereich geladen. Keine Animation der Fototür oder vermeintlich bewegliche Arme in Rasterhüllen. Originalfiguren/Logo unverändert. Stil ist vereinfachte Vektorillustration, nicht fotorealistische Reproduktion; Main prüft visuelle Passung.

## Prüfungen / Grenzen

Lokale JSDOM-Interaktionstests tools/ui/workspace-upgrade.test.mjs nutzen aktuelle Dashboard-Fixture aus index.html und echte renderQuizList/filteredQuizzes/Statushandler aus app.js. Geprüft: Filter/Alle/Suche/Reset, ursprüngliche Aktionshandler inkl. Publikation, natives Aufklappen, Volltext/XSS-sichere Ausgabe, dynamische Aufträge, Idempotenz, einmaliges Sichtbarkeits-Greeting, reduced-motion, neue EN-Texte und Schutz des authored Texts. Tests und Syntaxprüfung vor Abschluss erneut ausführen; Ergebnis im Abschluss an Main.

Keine Browser-/Geräteabnahme durch diesen Unteragenten (Main besitzt Browser). QuickLook-Render sandbox-blockiert; kein Umgehungsversuch. Keine erfundenen Lighthouse-/Kontrast-/Performance-/WCAG-Gesamtnachweise; visuelle Mobil-/Desktop-/English- und Tastaturabnahme durch Main ausstehend. Asset ist neu zu prüfen, vor allem Linien und Gesicht bei 60/96px. MutationObserver ist nur im Arbeitsbereich aktiv; unter echten häufigen Jobupdates zusätzlich Browser prüfen.

## Integration und nächster Schritt

Main übernimmt ausschließlich die fünf neuen Dateien (Modul, CSS, SVG, Test, diese Übergabe), lädt CSS nach bestehenden Styles und Modul nach vorhandenem DOM, z.B. script type=module src=gradecrew-workspace-upgrade.mjs mit aktueller Cacheversion. Build-/Hosting-Allowlist/Manifest und CI-Anschluss prüfen: neuer Test braucht tools/ui/node_modules/jsdom; lokaler Symlink zu vorhandenen Dependencies wird NICHT committed. Main führt unabhängige Review und Browser-Abnahme aus; erst dann gemeinsame exakte CI und freigegebenes Staging. Main aktualisiert zentrale TODO/STATE/Task-Handoff ohne parallel schreibenden Unteragenten.

## Sichtbare spätere Roadmap aus Fremdtexten (nicht beschlossen / kein Staging-Blocker)

Batchaktionen mit Berechtigung/Undo, URL-Suchzustand, zusätzliche Metadatenfilter, Command Palette, Vorlagenbibliothek/Zuletzt-geöffnet, vollständiger Dark Mode, größere Komponentenbibliothek, optional weitere sauber artikulierte Crew-Posen. Marketing-/Pricing-/SEO-Seiten, Rechtsversprechen, neue Auth-/Rules-Architektur, iOS/Games und Frameworkmigration liegen außerhalb dieses Auftrags. Ladezeit-/A11y-Zielwerte brauchen Messung; keine erfundenen Testimonials, Kennzahlen oder Leistungsversprechen.
