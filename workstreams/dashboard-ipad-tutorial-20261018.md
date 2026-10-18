# GC-BRAND-HERO-MOTION-20261013 — Dashboard/iPad, 18.10.2026

Owner: bestehender Design-Fachchat 01a130fa-babb-7de3-bfeb-785499e7c061. Taskhistorie weiterhin workstreams/gc-brand-hero-motion-20261013.md auf dem ursprünglichen Docsbranch; dortige Experimentarbeit bleibt unverändert.

Neuer Human-Scope: angemeldetes Dashboard kompakter auf iPad; Neuer Test rechts oben, Crew kennenlernen klein in Kopfzeile; nach fünf echten Anmeldungen ausblenden und dauerhaft Einstellungen→Tutorial starten. Plan vor Umsetzung: docs/superpowers/plans/2026-10-18-dashboard-ipad-tutorial.md. Inline-Ausführung ausdrücklich durch „erst Plan schreiben, dann umsetzen“; keine neue Freigabeschleife für Code.

Basis 2e718ae44519fc22a7c64ad354b62dd26a6999ca, kanonischer Integrationsbranch. Eigenes isoliertes Worktree /private/tmp/gc-dashboard-ipad-20261018, Branch fix/tutorial-dashboard-ipad-20261018. Native-Worktree-Tool scheiterte „Not a git repository“ im Projektmirror; daher autorisierter Git-Worktree-Fallback, fremde Checkouts unverändert.

Live Development Status39142552587 / Job117719766665 gelesen: keine aktuelle konkurrierende Dashboardplatzierung, historische Telemetrie-App-Überschneidung und fremde Rules/Visual/iOS-PRs bleiben getrennt; vor Integration frisch abgleichen. Main-Einstieg/Regeln/STATE/TODO/Registry/Contract und passende Dashboard-/Tourquellen frisch gelesen. Eigene Docsbranch-Historie 1c818979 bleibt erhalten.

Ursache: mehrfach gestapelte absolute/grid/center Dashboardregeln plus Decorator, der den großen Crewblock neu anlegt. Relevante Kontrollen SEC06/07/15/18 und PRIV07/12/15/19: nur eigene begrenzte Onboardingpräferenz, keine Authrechteänderung, keine Rohzeitstempel/Tracking. Originaltour und Gäste unverändert, Ownerprofile-Transaktions-/Stale-Generation-Tests erforderlich. Unabhängige Review-/CI-/Releasebelege stehen noch aus.

Status branch_only, Planung/baseline. Keine bezahlten Aufrufe, neue Guardianreservierung oder Modellwechsel. Step ist lokale UI/Auth-Session-Diagnose, nicht reine CSSroutine; angefordert/bisher tatsächlich beobachtetes Runtime-Modell/Effort/Usage unknown. Keine Delegation bisher. Production ausdrücklich ausgeschlossen.

Nächster Schritt: Zähler-/DOMtests erst rot, dann Implementierung laut Plan.

## Implementierung / erster geprüfter Checkpoint

36/36 gezielte Tests grün: fünf vs. sechs Logins, Refresh-Deduplikation, parallele Sitzungen/Transaktionsretry, getrennte Konten, Offline/fehlende Metadaten, Stale-Generation, spätere Einstellungenänderung, echter Settings→Dashboard→Tour-Aufruf, vorhandene Tour-/Workspace-/i18n-Flows. Zunächst fehlende neue Module erwartungsgemäß rot; danach UI-Dependencies als relative Fremdsymlinks im Kopierversuch nicht auflösbar, durch echte lokale Kopie der unveränderten jsdom26.1.0-Abhängigkeiten behoben. Alle bisherigen Fehler bleiben als Versuchshistorie erhalten; kein Dependency-/Lockfilechange.

Ruling: optionale Metadatenaufnahme läuft nach gültigem Authprofil im Hintergrund; Anmeldung wartet nicht auf den Zähler. Späte Antworten dürfen ausschließlich beide Counterfelder aktualisieren, keine jüngeren Einstellungen oder fremde Konten. Nach erreichtem Cap keine weitere Transaktionsaufnahme. Es werden nur aktuelle Auth-Sessions neu beobachtet, kein historischer Loginbestand erfunden.

Original-Tourengine V7/V8 unverändert. Große Crew-Decorator-Karte und widersprüchliche absolute Center-Platzierung entfernt; ein vereinheitlichtes Headergrid ersetzt sie. Bestehendes Tutorialbutton-Element samt Handler in userBar verschoben; außerhalb Dashboard und ab Zähler6 versteckt. Dauerhafter Button in Einstellungen. Neue Runtime-Module im Stagingbuilder und CI-Tourtests enthalten; Versionskandidat gc41.

Nächster Schritt: lokaler Vergleich mit Originalstyles auf iPadgrößen, dann vollständige relevante Regressionen/Build, unabhängiges Review und exakte Cloud-CI. Noch kein Stagingdeploy.
