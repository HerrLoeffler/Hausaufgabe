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


## Beauftragte Fortsetzung04.11.2026 – zusätzliche CI-Einsparungen

Martin beauftragt die Umsetzung des zuvor vorgelegten Einsparplans: Repository zunächst öffentlich lassen, keine zusätzlichen Kosten freigeben, wichtige Tests und Reviews vollständig erhalten. Weiterhin GC-ACTIONS-COST-01, ausführender Fachchat GC · Automatisierung & Integration/01a1089e-bbae-74c2-9a6a-6ce71fb3dba7. Die private lesende Billingauswertung verbleibt lokal; sie wird nicht in dieses öffentliche Dokument kopiert.

Web: PR407/fix/actions-cost-web-20261104@bfda17bb72dd5ce343e532752417ab799c329c21 gegen feature/design-auth-student-20261026@b8458c1d. Identischer lokal geprüfter Tree5cdb919b12137568e5d808b6b00efb9ba1b888c4. Zwei vollständig identische Testschritte und eine doppelte Syntaxprüfung entfernt; alle unterschiedlichen ursprünglichen Testbefehle unverändert vorhanden. npm-Downloadcaches berücksichtigen alle tatsächlich installierten Lockfiles. Nur veraltete Push-Prüfungen derselben Ref können verdrängt werden; jede manuelle Qualifikation erhält eine eigene run_id-Gruppe. Der unabhängige Review fand zunächst einen P2 zu wartenden manuellen Runs; nach reproduzierbar fehlgeschlagener Zusatzprüfung korrigiert und im Delta abgenommen. Exakte öffentliche CI41869965948, Nodejob126714040343/Browserjob126714040806. Aktuellen Runstatus vor Übernahme lesen; kein Rerun allein wegen Übergabe.

Native: PR408/fix/actions-cost-native-20261104@2dfe3617e6f67bfabdd783fde2e1fcdc39350a53 gegen feature/native-live-staging-20261018@97cf926e. Exakter Treece808797b905131de96d7fc42271e3c44275b8cc. Nur npm-Downloadcaches in den vorhandenen Teacher-Layout-, Teacher-TestFlight- und Secure-TestFlight-Workflows. Nodeversionen, alle Simulatorfamilien, Testbefehle, Upload-needs und nicht abbrechbare Uploadreihenfolge bleiben erhalten. Native-Prüfung41870200301. Kein manueller TestFlight-Start; Übernahme mit dem nächsten ohnehin autorisierten Native-Paket abstimmen, weil Änderungen an den Uploadworkflow-Dateien auf dem Zielbranch reguläre Uploads auslösen können.

Qualifikation: sieben lokale geparste YAML-Vertragsprüfungen und Actionlint1.7.12 grün. Die zwei künftig einmaligen Release-/Connectorblöcke tatsächlich33/33 unterNode24.22.1 bestanden; lokal zunächst fehlende Sparse-Assets nachgeladen und localhost-Testserverbeschränkung behoben, ohne Produktcode zu ändern. Unabhängiger gemeinsamer Review samt gezielter P2-Nachprüfung abgeschlossen. Das ersetzt weder exakte Node22-/Browser-/Simulator-CI noch menschliche Geräteabnahme. Echte Cachehits, eingesparte Minuten oder Prozente werden erst anhand späterer regulärer Runs berichtet, kein zusätzlicher Warmlauf erzwungen.

Grenzen: keine Änderung an Produktcode, API-/Versuchsbudgets, Source-Ledgern, Cloud-/Live-/Apple-Zielen, Repositorysichtbarkeit oder Kontolimits. Keine neue Kostenfreigabe, kein Provideraufruf. Frisch gelesene main-Hosting-/Functions-Guards akzeptieren den Kostenbranch nicht als Deployquelle. Historische Stage- und Paid-Versuche aus vorherigen Aufgaben bleiben unverändert. Größere Controlplane-Zusammenlegung und Mac-zu-Linux-Migration sind nicht umgesetzt; Xcode-/Simulatorprüfungen bleiben aufMac. Angefordertes Reviewmodell Sol/medium; tatsächliche Runtime/Usage unbekannt.

Nächster Schritt: vorhandene exakte CI-Ergebnisse prüfen, dann die reinen CI-Patches unter Erhalt aktueller Zielbranchänderungen übernehmen. Native-Integration nicht durch einen unnötigen separaten Appleupload erzwingen. Öffentliche PRs und deren eigene Übergaben enthalten den jeweiligen aktuellen Integrationsstand; dieser Abschnitt ist der koordinierende Checkpoint.

### Webintegration und hermetische Testkorrektur04.11.

WebPR407 nach beiden erfolgreichen exakten Jobs in Run41869965948 und unverändertem Zielb8458c1d integriert:63cdc77b29e3fb4cef0f488dea003bf5eb66d06c. Kostenpatch damit im bestehenden Webentwicklungsbranch, nicht als Live-Deploy ausgegeben. NativePR408 bleibt eigener Kandidat für die reguläre freigegebene Nativeübernahme.

Die Dokumentations-Handoff-CI auf8de19719 scheiterte an vier schon bestehenden Tests: drei modellierten Providertransport ohne injizierten Transport und der Credentials-Admissionstest nutzten die reale Uhr nach dem02.11. und erreichten ihren eigentlichen Testfall nicht. Keine echte Preisqualifikation erneuert, keine Runtime-/Policy-/Budgetdatei geändert. Nur tools/automation/test_pipeline.py erhält eng auf die beiden Testklassen begrenzte Moduluhren am letzten gültigen Testtag. addCleanup stellt die ursprünglichen Uhren wieder her. Zwei zusätzliche Tests am ersten abgelaufenen Tag beweisen reale Provider-/Admission-Sperren vor jedem APIaufruf.

Reproduktion: exakt1Assertionfehler+3Exceptions wieCI, danach13/13gezielte Tests und vollständige lokale Automation124/124 unterPython3.12/Node24 grün. Anfangs fehlende unveränderte Workflow-Fixtures im Sparsecheckout materialisiert; kein Test ausgelassen und keine Produktdatei zur Reparatur verändert. Alle Provider-/Dispatchgrenzen in diesen Tests bleiben Fakes. Unabhängiger Testpatchreview und exakte neue CI werden vor Merge geprüft; den alten fehlgeschlagenen Lauf nicht blind wiederholen.
