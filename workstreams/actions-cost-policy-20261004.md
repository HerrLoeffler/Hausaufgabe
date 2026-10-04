# Aufgabe: GC-ACTIONS-COST-01

- Aktualisiert (UTC): 2026-10-04
- Verantwortlicher Chat / Auftrag: Martin – öffentlich umstellen und Actions-Verbrauch reduzieren.
- Aufgabenbranch: `fix/actions-cost-policy-20261004`
- Basiscommit: `f903db518c8dedb24b5dacbbe940c1d26e142727`
- Betroffene Dateien: fünf Workflow-Dateien, TODO.md, GRADECREW_STATE.json, Registry, diese Übergabe und docs/ACTIONS_COST_POLICY.md.
- Überschneidungen: PR #86 Stage Guardian/Koordination; PR #51 Web-CI; PR #83 Visual-Preview. Bestehende Arbeit wurde gelesen, eigene Folgebranches statt Änderungen an fremden PR-Branches.

## Ziel und gewünschtes Verhalten

Bewusste Preview-Meilensteine, weniger doppelte Handoff-Runs, weniger periodisches
Polling und keine teure Web-CI bei reinen Dokumentations-Pushes. Details und
manueller Start: [Kostenpolitik](../docs/ACTIONS_COST_POLICY.md).

## Umfang / nicht verändern

Bestehende Testkörper, Fehler-/Abbruchverarbeitung, begrenzte Guardian-Versuche,
API-Budgets und Production-Freigaben erhalten. Keine bezahlte Worker-Ausführung
und kein Deploy in diesem Chat. Sichtbarkeitsumstellung ist separat autorisiert.

## Akzeptanzkriterien

Visual-Branch ohne push-Trigger; default-branch-Registrierung für manuelle UI;
gepinnten Quellen-SHA prüfen, Staging-only deployen und veraltete Quelle ablehnen.
Handoff weiterhin auf PR und gemeinsamen Branches. Ereignisfehler bleiben sichtbar.
Web-Codeänderungen müssen weiter die unveränderte volle Testsuite starten.

## Zwischenstand

- Lokal geändert: alle beschriebenen Trigger sowie Dokumentation.
- Auf GitHub gesichert: Code und diese Übergabe im Commit dieses Branches; tatsächlichen Head/PR frisch über GitHub prüfen.
- Geprüft: 90 Automation- und 18 Release-Control-Tests, 54 zusätzliche Workflow-Prüfungen; YAML und Diff geprüft. Kein vollständiger Git-Checkout, sondern frischer Datei-Snapshot der dokumentierten Remote-SHAs.
- CI: neuer exakter Remote-Lauf noch zu prüfen; jüngster Development Status 37211114372 scheiterte vor Testbeginn am Abrechnungsblocker.
- Deployed: keiner.
- Gerätetest: keiner.

## Offene Probleme und Unsicherheiten

Fortsetzung 04.10.2026, 15:27 UTC: Repo-Metadaten bestätigen public. Standardrunner
starten wieder; Development Status 37212837719 attempt 2 erfolgreich. Handoff
37212837742 und Guardian 37212837739 laufen erstmals wirklich und zeigen einen
Test-Isolationsfehler: ExecutionTests erbt GITHUB_RUN_ATTEMPT=2 vom CI-Rerun.
Fixture pinnt jetzt attempt 1; dedizierter Paid-Rerun-Test setzt weiterhin 2.
Runtime-/Budgetschutz unverändert. Vollständiger öffentlicher Git-Checkout
verfügbar; frische exakte CI nach dem Folgecommit erforderlich.

Remote-CI, Merge und aktive neue Startpolitik stehen aus. Fremde Workflow-Kopien
auf alten Branches ändern sich nicht automatisch. Hauptbranch-, Visual- und
Web-Änderung werden getrennt geprüft und integriert. Ein vollständiger Scan aller
Git-Historien/Actions-Logs auf sensible Inhalte war mit diesem Zugriff nicht möglich;
der begrenzte Dateicheck ist keine solche Freigabe.

## Nächster konkreter Schritt

GitHub Settings → General → Danger Zone → Change repository visibility → public,
danach exakte CI prüfen und die drei Folge-PRs unter Erhalt von #86/#51 integrieren.
Quota-Reset laut Kontoseite 01.11.2026; Sichtbarkeit später nach Nutzerentscheidung.

## Wiederaufnahme nach Abbruch

Code auf `fix/actions-cost-policy-20261004`, `fix/actions-manual-visual-20261004`
und `fix/actions-web-docs-20261004` sichern/prüfen. Kein Deployment oder erfolgreicher
Remote-Test aus dem lokalen Testresultat ableiten.


## Verifizierte Integration nach public

#88 → main 3ae00f9 nach fünf grünen exakten PR-Checks am Head 17f4d4b.
#89 → Visual e83fde3 unter Erhalt paralleler V2-Änderungen (9cc4028); 35 lokale
Vertragstests einschließlich tatsächlicher Jeep-Update-Szenarien und Build grün.
#90 → Web f30fa44; AI Staging 37213496846 und Admin-Checks 37213496845 erfolgreich.
Automatisches Hosting 37213580812 einschließlich Manifest-/Dateihashprüfung und
AI-Functions 37213580828 einschließlich Tests, Staging-Scope und Receipt erfolgreich.
Keine neue Amazonas-Preview gestartet, kein Gerätetest und keine Production.
Neue manuelle Startpolitik ist in main und Visual aktiv; doc-only Filter im Webziel.

Parallel PR #91 repinnt den noch nicht zugelassenen Startscreen auf b5d456e und
wurde in main afc6524 integriert. Diese Arbeit bleibt erhalten. Originaler
Guardian-Pilot erwartet weiter eb80c5e6; aktueller Web-Head f30fa44 passt nicht
zum alten Recovery-Vertrag. Bestehende Grenzen nicht durch stilles Umpinnen,
Ledger-Reset oder Rerun eines Paid-Jobs umgehen. Das ist ein eigener Quellenblocker.


## Abschlussnachweise der öffentlichen Fortsetzung

Guardian-Reparatur #86 → main a689d97 nach vier erfolgreichen finalen PR-Checks
am Head 8432bdb (37214157548, 37214157496, 37214157513, 37214157945).
Main-Handoff 37214298416, Development Status 37214298344, Release Control
37214298356 und Guardian 37214298357 erfolgreich. Aktive YAML-Dateien frisch
von GitHub gelesen: main/Visual Preview dispatch-only, Web docs-ignore,
Handoff Branchliste/Concurrency, drei 6h-Crons und skipped-Filter bestätigt.
Auch der neue Homepage-Listener überspringt künftig skipped-Guardian-Ereignisse.
Der ursprüngliche Pilot bleibt als separater belegter Quellenblocker offen;
keine neue Provider-Ausführung oder Budget-/History-Rücksetzung.
