

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


## Authorized continuation04.11.2026 — web CI savings candidate

Martin explicitly authorized implementing the existing savings plan while keeping the repository public and additional spending at zero. Same TaskGC-ACTIONS-COST-01; no reset, purchase, quota change or provider/deploy call. OwnerGC · Automatisierung & Integration/01a1089e-bbae-74c2-9a6a-6ce71fb3dba7. Own branchfix/actions-cost-web-20261104. Web baseb8458c1d; nativebase97cf926e. Billing figures and account records remain local, outside the public patch.

Web candidate removes only two identical repeated test steps and one repeated pure syntax check, completes download caches for all installed lockfiles, and isolates push concurrency by event/ref. Narrow cost-web push trigger qualifies this candidate without using a deployment branch. All original unique commands/job IDs/permissions/environments retained. Native candidate only caches npm downloads in three existing workflow files; simulator matrices, Node versions, upload prerequisites and non-cancellable signing/upload behavior retained. No dependency, product code, runtime budget, rules or IAM change. Existing deployment source gates read: only canonical app integration or admitted main-controller sources; cost branch is neither.

Offline parsed-YAML compatibility audit:4failures before changes, then6green; extra qualification-pattern check first failed, then7green. Baseline comparison preserves all unique commands, job structure, permissions, trigger policies except added qualification pattern, and native gates. This audit is configuration evidence, not a full browser/native run or observed cache hit. Independent review and exact candidate CI pending at this checkpoint; obtain latest PR/check state before integration. No merge/deployment completed.

Next: independent review, publish exact candidate and inspect applicable public checks; do not invoke a TestFlight upload for cache qualification. Measure savings on a later regular workload, no invented percentage. Larger control-plane consolidation and simulator migration are not implemented. Existing history above remains intact. Runtime model/usage unknown.

Independent review found a WebP2: cancel-in-progress=false still lets a third dispatch replace a pending manual run in the same group. Corrected non-push group to unique github.run_id; push retains ref grouping. Exact current GitHub concurrency docs verified; regression audit first failed, then corrected. Native cache delta had no concreteP1/P2. Initial local release-target tests9/11 passed; two build cases lacked unchanged assets in the sparse checkout, so materialize required build inputs before rerun. This is not a product patch or a reason to omit those tests.

## Tutorial-Reparatur04.11.2026 — gleicher Auftrag, keine Deployfreigabe

Martin autorisiert die Reparatur des in der Nachintegration gefundenen Tutorialfehlers sowie des getrennten Guardian-Validators; alle wichtigen Tests/Reviews erhalten, keine zusätzlichen Kosten und keine Production. Auftrag GC-ACTIONS-COST-01, ausführender Fachchat GC · Automatisierung & Integration/01a1089e-bbae-74c2-9a6a-6ce71fb3dba7; Tutoriumbezug bestehende GC-TUTORIAL-01/GC-DESIGN-05B. Frischer main e4109f9, Webziel63cdc77, keine neuere gezielte Tutorialreparatur in offenen PRs; Development Status41875939205 erfolgreich. Eigener Branch fix/tutorial-warning-recovery-20261104 vom bestehenden Webziel. Das kanonische App-/Liveziel5e45e9d bleibt unverändert.

Ursache belegt: neuer .gcRealCoach ist fixed ohne anfängliches top/left und wird am Dokumentende angehängt. Platzierung erfolgte erst über zwei RAF-Schritte. Unveränderter lokaler WebKit1366x768-Lauf bestand52Aktionen; die gezielte650ms-Verzögerung der RAF-Callbacks ausschließlich im second-warning-Schritt reproduziert dagegen exakt CI126726686039: Weiter-Schaltfläche y8211.5/44px, alle Hitchecks false. Kein längeres Assertion-Warten und keine abgeschwächte Sicht-/Fokus-/Touchprüfung. Neuer JSDOMfall mit angehaltenen Frames schlug ebenfalls vor dem Fix fehl.

Produktfix: synchrones Erstlayout am bestehenden tour-step-Ereignis; der während dieses Controlleraufbaus gefährliche Anchor-Refresh wird nur bei dieser initialen Platzierung ausgelassen. Gewöhnliche RAF-/Resize-/Scrolllayouts erneuern Anker unverändert. Der erste Zwischenentwurf löste beim Veröffentlichungsdialog eine rekursive Coachanlage aus; anhand Browser-Stackfehlern korrigiert und nicht veröffentlicht. Jetzt49/49 gezielte Legacy-/Gast-/Responsive-/Polishfälle grün und vollständiger WebKit1366x768-Stressdurchlauf mit52Aktionen, Neustart/Abbruch, leeren Browserfehlern und null Transportwrites grün. Pinned lokale RuntimeNode22.23.3/Playwright1.56.1, BrowserMacWebKit; exakte Linuxmatrix bleibt eigene CI.

Unabhängiger Review am Code84566028: keine P1/P2; zwei Test-P3 (Cancellation verschobener RAF-Callbacks und Observerteardown) korrigiert und im Delta geschlossen. Probe verwaltet cancelbare logische IDs für Timer/RAF, Teardown trennt Observer vor Globalrestore, Browserfehler werden zusätzlich explizit abgewiesen. Keine Tests entfernt. Normale Browsermatrix und Full-CI bleiben Pflicht. Gemeinsame dritte Paid-Guardianreviews alter Tasks werden damit nicht als bestanden behauptet oder neu gestartet.

Assurance im engen Reparaturscope, Owner dieses Fachchats plus unabhängiger Reviewer: SEC20 betrifft die unverändert gepinnte Prüf-/Buildkette; reproduzierbare vorhandene Tests und unabhängiger Diffreview sind belegt, vollständiger Advisory-/Lieferkettenstatus bleibt nicht geprüft. PRIV15 ist technisch für den durchlaufenen Tutorialscope geprüft, vollständige Accessibility-/physische Geräteabnahme offen. SEC03 (öffentliche Clientkonfiguration) ist hier unverändert/nicht relevant, kein neuer Erfüllungsnachweis. Auth/Rules/Noten/Uploads/Provider-/Kostenpfade, neue Assets/Tracking und Rechtsverträge nicht verändert; keine Gesamtabnahme dieser Kontrollen. Build enthält Cache-Control:no-cache; bestehende Modul-URLs nicht aufgespalten. Angeforderter unabhängiger Review Sol/medium, tatsächliches Runtime/Usage unknown.

Nächster Schritt: exakt diesen reviewten Kandidaten als eigenen PR gegen Web63cdc77 sichern und vorhandene reguläre AI-Staging-CI lesen; nur bei deren Erfolg und unverändertem Ziel integrieren. Kein Hosting-/Functions-/TestFlight-/Productiondeploy. Guardianfix ist getrennt in bestehender PR409/e4a99e49 gesichert,128/128 Offlinefälle plus unabhängiger Review; reguläre CI41877830643/41877830516/41877830517/41877830677 im Wartestatus, kein Retry. NativePR408 grün und weiterhin für nächstes autorisiertes Nativepaket gehalten. Research für weitere Minutenhebel und vollständige historische Budgets bleiben im koordinierenden PR409; keine Käufe oder Quote versprochen.

### Abschluss der qualifizierten Reparaturprüfungen17:50UTC

PR410-Kodekandidat c7f5444ce455e1327801c7764f570153b5dcb4aa entspricht exakt lokalemTree8e6a91b0. Reguläre CI41878657537: Node126745050918 ohneFehler abgeschlossen; Browser126745050611 bestätigt18/18 vollständige WebKit-/Chromiumreisen mitje52Aktionen, insgesamt936, einschließlich verzögerter second-warning-Frames auf1366x768 inbeidenEngines. Keine Browserfehler, jedeJourney/RestartprüfungbehältnullTransportwritesbei. VorhandenesArtefakt13348223867/public-entry-layout. Abschlusslog17:50:14. Die einzige anschließende Änderung korrigiert/ergänzt diese Übergabe; alle drei qualifizierten Code-/Testdateien bleiben bytegleich. Wegen vorhandener dokumentierter Doc-only-Filter kein neuer voller Browserlauf allein für diese Textkorrektur.

Guardian409 nach vollständigen tatsächlichen Abschlusslogs (128Automationstests und vollständige gepinnte Appvalidierung) sowie erneut geprüfter unveränderterBasis/Head und serverseitigem mergeable_state:clean inmain fb9dd08558aa51686d7fbaee22c0329529b44abd übernommen. Guardianartefakt13346929060/tests.json meldet result:success anApp5e45e9d. Einige GitHub-Statusanzeigen blieben währenddessen queued, obwohl Cleanup/Ergebnisartefaktebereitsvorlagen; keinErsatzlaufundkeineAnzeigealsneueRuntimeberechtigungverwendet. Ledgerfrischgelesen: fünfReservierungenundsämtlichebisherigenVersucheerhalten, alteapprovedShaabweichendvonApp5e45, keinePaidfortsetzung. ControllerhashwechselerneuertkeinevorherigeFreigabe. TutorialübernahmegegenWeb63cdc77nachfinalemGitHubGateabgleich; keineStaging-/Live-/Applefreigabe, physischeGeräteabnahmeoffen.
