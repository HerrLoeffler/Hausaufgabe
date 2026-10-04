# Guardian-Wiederaufnahme und Gesamtprüfung 04.10.2026

Auftrag: Martin hat die zwei gesperrten OpenAI-Modelle freigegeben und verlangt automatische Weiterbearbeitung geeigneter Aufgaben sowie Prüfung des gesamten aktuellen Codebestands. GC-AUTOMATION-13 / GC-ARCH-AUDIT-02. Branch fix/guardian-permission-recovery-20261004 → main; Basis 6e3b4051fcc560e99789a8567ba301466ea50a11. Webquelle eb80c5e6a8b6c1ae13deba676709607bfccee208 unverändert.

## Belegbarer Stand

Admission 37196805396: beide Flags true, alle drei dedizierten Keys vorhanden. Pilotrun 37196835882: prepare/build/publish/validate/security/finalize erfolgreich; correctness und QA mit genau HTTP 403, integrate übersprungen. PR #78 sichert ausschließlich sechs CSS-Zeilen (44px-Klickfläche und sichtbarer Fokus); Head bb8188f9dc1928e7ab9a956b952beabd4af5844b. Ledger 48d7c07c… hält stopped, Originalbudget 0,85 USD und reale Usage mit geschätzt 0,023296 USD. Kein Guardian-Staging-Deploy, keine Geräteabnahme oder Production.

## Änderung

Ein expliziter einmaliger Recovery-Auftrag auf main prüft alte Run-Herkunft, sämtliche Job-Ergebnisse, exakt beide 403-Logs, fehlende Review-Blocker, identischen Taskhash, PR/Commit/Tree und unveränderten Zielbranch. Nur diese diagnostizierte Klasse darf stopped für einen neuen normalen Versuch freigeben. Originalzustand, Fehler, Run, Usage und Reservierungen bleiben erhalten. Kein Rerun eines Paid-Jobs; normale Reservation und drei Gesamtversuche / 2,55 USD bleiben bestehen. Bei unbekanntem Dispatch keine Wiederholung. Da ein 403 kein Code-Veto ist, darf nur bei diesem expliziten Recovery-Marker derselbe Candidate erneut durch alle CI-/Review-Gates. Kein globales Abschalten des Duplikatschutzes.

99 lokale Tests grün: Herkunft/Rerun/SHA/Taskbindung, zusätzliche oder unbekannte Fehler, Review-Veto, failed/partial CI, Source-Wechsel, erschöpftes Budget, Persistenz vor Dispatch, Single-use-Recovery und unbekannter Dispatch; bestehende gesamte Guardian-/Pipeline-/Release-Control-Tests. Remote-CI/Integration/zweiter echter Run separat nachweisen.

## Arbeitsbestand und Grenzen

Live Development Status 37195824894 / Job 111417356166 gelesen; 18 aktive Workstreams, neun Überschneidungen. Aktuelle PRs/Branches zusätzlich frisch gelesen. Keine konkurrierende offene Guardian-Code-PR; #65 ist nur künftiger Plan. Escape und Gateway entwickeln parallel weiter; ihre Dateien werden nicht pauschal zusammengeführt. Der vorbereitete Startscreen-Task passt nicht zum Profil small-web-v1 und enthält derzeit Kontextdateien, die path_allowed ablehnt (.json/.md sind nach aktuellem Kontextvertrag nicht zugelassen). Vor bezahlter Admission konkret korrigieren; keine stumme Profilerhöhung. Gesamtprüfung muss Web/Backend/Security/Games/iOS/Controller auf ihren tatsächlichen Quellen unterscheiden.

## Nächster Schritt

Nach grüner Remote-CI Recovery integrieren; der committed Recovery-Auftrag startet automatisch einen neuen kontrollierten Pilotversuch. Dessen Ergebnisse bis echten Hosting-/Functions-Receipts verfolgen. Parallel aktuelle Quelltexte und Tests inventarisieren; danach einzelne passende Web-Aufträge prüfen und source-bound aufnehmen. GC-AUTOMATION-08 (andere Zulassungsprofile) bleibt eigenständige Arbeit. „Alle sechs Stufen grün“ darf nie Geräte-/Production-Freigaben erfinden.

Continuation: PR #84 merged at 4927b64138e939e6fb78b9f2c4922bf5a13aa5ef after all exact-head checks passed. Recovery run 37199309455 successfully qualified historical logs but failed on GET pulls/78 before ledger mutation; add pull-requests:read. 103 local tests now pass. Automatic homepage admission is a committed main-owned request: wait for pilot staging_deployed, require current target == exact pilot integrated SHA and all selected CSS/entry/startup blob SHAs unchanged, then atomically commit queue source pin + policy and explicitly dispatch controller. No general rebase, paid workflow rerun or budget reset. See docs/REPOSITORY_AUDIT_2026-10-04.md for full evidence, limitations and separate Security/Games follow-ups.

BLOCKED 11:50 UTC: PR #86 latest code head feaf49ae085a9cd6f2ec39a4b7fd8e0c41fff5d6. All final remote jobs fail before their first step; no logs. One Handoff-only retry run 37199887982 attempt 2/job 111429810018 also fails with zero steps. Annotations exist but unsupported by connector; private GitHub browser is signed out. Underlying account/runner/billing cause unverified. Do not merge without required checks, rerun paid jobs, change limits, or claim pilot/startscreen finished. Safe resume: obtain the actual GitHub annotation, restore runner availability if necessary, run final PR checks, merge exact verified head, observe recovery and then automatic unchanged-homepage admission. Local targeted 103 tests and automation-discovery 92 tests passed; focused Gateway suite 85/85 passed.

## Fortsetzung nach Chat-Abbruch — 04.10.2026, 13:20 UTC

GC-AUTOMATION-13 / GC-ARCH-AUDIT-02: Aktuellen Remote-Stand erneut gelesen. PR #82 und #84 sind integriert; PR #86 ist offen auf Code-Head b1a01992bb803f324ae0c43b8ce68da2e8a1261d und bleibt ungemergt. Alle vier finalen PR-Workflows einschließlich GradeCrew Development Status sind failure. Auch andere Workstreams scheitern vor Runner-Start (Games Run 37203951154 / Job 111441145936: steps=[], runner_id=0).

Genau einen nicht kostenpflichtigen Provider-Wiederaufruf vermeidenden Diagnoseversuch ausgeführt: ausschließlich Project handoff checks Run 37200214799, attempt 2, Job 111445086218. Am 13:20:44 UTC completed/failure, steps=null, logs_url=null; kein ausgeführter Prüfschritt. Der geprüfte Workflow hat nur Lese-/Offline-Prüfungen, keine Provider-Aufrufe oder Deploys. Dies ist kein Paid-Guardian-Rerun. Keine weiteren Wiederholungen, Budget-/Ledger-Änderungen, Integrationen oder Deploys durch diese Fortsetzung.

Die vorhandenen Check-Annotations sind über den GitHub-Connector weiterhin nicht zugänglich (INVALID_ARGUMENT für den Annotations-Endpunkt). Eine konkrete Billing-, Account- oder GitHub-Störungsursache ist deshalb weiterhin unbewiesen. Nächster ausführbarer Schritt: die echte Meldung unter Annotations von https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37200214799 lesen lassen; erst deren belegte Ursache beheben und die erforderlichen finalen PR-Prüfungen erneut ausführen. PR-Code nicht ohne diese Nachweise mergen. Der ursprüngliche Auftrag und die Grenzen bleiben erhalten: geeignete Tasks automatisch bis verifiziertem Staging, eigener Zulassungs-/Konfliktvertrag für weitere Workstreams, Geräteabnahme/Production separat.

## Bestätigter Actions-Kontingentblocker — 04.10.2026

GC-AUTOMATION-13: Martin hat die Annotation von Handoff Run 37200214799 / Job 111445086218 geliefert: GitHub startet den Job wegen fehlgeschlagener Kontozahlungen oder eines zu niedrigen Spending-Limits nicht. Dies ist eine Sperre vor Runner-/Prüfschrittstart; kein neuer Code-Testbefund. Die Ubuntu-26-Migrationsmeldung ist nur ein Notice.

Der anschließend lesbare Nutzer-Screenshot meldet 2.001 verbrauchte von 2.000 enthaltenen Actions-Minuten im Konto HerrLoeffler und Reset am 01.11.2026. Erschöpftes Kontingent ist damit belegt; tatsächliche Zahlungsmethode, offene Zahlungen und konkretes Budget sind weiterhin unbekannt. Remote-Repository ist privat. GitHub-Dokumentation: https://docs.github.com/en/billing/concepts/product-billing/github-actions und https://docs.github.com/en/billing/how-tos/set-up-budgets. Zusätzliche Nutzung benötigt passende Zahlungs-/Budgetfreigabe; Stop usage when budget limit is reached setzt eine Ausgabengrenze.

PR #86 bei Beginn weiter offen, Dokumentationshead b32345d7d4b936bb55bc7e776d6ececc3bb45efb; letzter Code-Head b1a01992bb803f324ae0c43b8ce68da2e8a1261d. Nur TODO/Übergabe und PR-Beschreibung aktualisieren. Keine neue Implementierung, keine weiteren manuellen Workflow-Reruns, keine Provider-Aufrufe, kein Merge, kein Deploy, keine Änderung von Kontobudget oder Guardian-Ledger. Vorherige Testergebnisse bleiben historisch; Remote-CI ist nicht grün.

Nächster ausführbarer Schritt: Kontoinhaber öffnet https://github.com/settings/billing, prüft Zahlungsmethode/offene Zahlungen sowie Actions unter Budgets and alerts und bestätigt wieder verfügbare Runner-Nutzung. Anschließend aktuelle finale PR-Checks ausführen und ausschließlich deren exakten geprüften Head integrieren; danach normalen Recovery-/Pilot-/Homepage-Pfad verfolgen. Keine kostenpflichtigen Jobs blind wiederholen. Production und Geräteabnahme bleiben separat.

## Actions-Kostenanalyse / Nutzerentscheidung — 04.10.2026

GC-ACTIONS-COST-01: Nutzer fragt nach dem schnellen Verbrauch, sauberer Lösung, UI-Auswahl und Coupon. Beide neuen Screenshots gelesen; fehlende Zahlungsmethode belegt. Vollständiges Actions-Laufinventar 01.–04.10. mit 1.903 Läufen und 52 Handoff-Push-/PR-Doppelquellen; echte Joblaufzeiten stichprobenartig gelesen. Details, Grenzen und konkrete Workflow-Optimierungsaufträge: docs/ACTIONS_COST_AUDIT_2026-10-04.md. Product-level -> Actions mit zunächst 10 USD und Ausgabenstopp empfohlen, nicht eingerichtet. Kein verifizierter allgemeiner Actions-Coupon; Education-Planrabatte keine generelle nutzungsbasierte Kostenfreigabe. Nur Dokumentation in einem Commit sichern, keine neuen Reruns/Provider-Aufrufe/CI-Erfolgsbehauptungen/Integration/Deploys. Workflow-Optimierung bleibt eigene Umsetzung mit Gate-/Event-Prüfung; PR #86 weiterhin branch_only.

## Public / Education erläutert — 04.10.2026

GC-ACTIONS-COST-01: Nutzer fragt, ob öffentliches Repository Weiterarbeit erlaubt und was Education konkret bringt. Offizielle GitHub-Doku erneut gelesen: Standard-Runner-Minuten öffentlicher Repos kostenlos, größere Runner und API-/Cloud-/ggf. Speicherkosten separat. Schreiben/Programmieren bleibt auch bei ausgeschöpftem Actions-Kontingent möglich; die derzeit blockierten automatischen Prüfungen/Deploy-Jobs benötigen verfügbare Runner. Öffentlichmachen veröffentlicht Code und Actions-Historie/Logs und erlaubt Forks. Keine Sichtbarkeitsänderung beauftragt oder vorgenommen. Empfehlung: GradeCrew privat behalten, begrenztes Actions-Budget und Workflow-Optimierung.

Education: verifizierte Lehrkräfte bekommen Copilot Pro; kostenloses Team für Unterricht/akademische Forschung beantragbar. Team regulär 3.000 enthaltene Actions-Minuten/Monat gegenüber Free 2.000, nur im zugehörigen Konto/Org, keine automatische Aufwertung dieses persönlichen Repos. Planrabatte gelten nicht generell für nutzungsbasierte Abrechnung; keine kommerzielle GradeCrew-Deckung behaupten. Keine Bewerbung, Umstellung, Provider-Aufrufe, manuellen Reruns, Integration oder Deploys in dieser Erklärung. Quellen: https://docs.github.com/en/billing/concepts/product-billing/github-actions ; https://docs.github.com/en/education/about-github-education/github-education-for-teachers/about-github-education-for-teachers ; https://docs.github.com/en/billing/concepts/discounted-plans ; https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility .

## Vorschlag anderer Chat: manuelle Escape-Preview / temporär public — 04.10.2026

GC-ACTIONS-COST-01: Nutzer legt Vorschlag vor: kleine Commits ohne Actions, Zwischenprüfungen lokal, gezielter Test+Preview-Meilenstein, Visual-Preview push deaktivieren; diskutiert temporäres Öffentlichmachen. Keine ausdrückliche Sichtbarkeitsänderung oder globale Abschaltung aller automatischen Gates beauftragt. Bewertung: für isolierten Visual-Prototyp sinnvoll; vor Integration vollständige relevante Prüfungen erhalten. Die ausdrücklich autorisierte Guardian-Kette wird durch manuelle Prototyp-Preview nicht pauschal deaktiviert.

Aktuellen Code auf prototype/escape-expedition-visual-masterpiece-v1 gelesen: escape-expedition-preview.yml hat weiterhin push (Branch-/Pfadfilter) plus workflow_dispatch, concurrency/cancel-in-progress. escape-review.yml und games-lab-check.yml schließen diesen PR-Branch per job-level if vor Runnerstart aus; Games zusätzlich negative Pfadfilter. Behauptung bereits ausschließlich manueller Preview ist damit noch nicht belegt/aktuell nicht umgesetzt. Fremden Branch nicht geändert.

Öffentliches Repo kann später privat gesetzt werden; öffentliche Forks bleiben öffentlich, Downloads können nicht zurückgeholt werden. Repo-Inhalte und Actions-Logs werden veröffentlicht, bestehende Commit-Historie ist Teil der Offenlegung. Nutzer kann diese bewusste Publikationsentscheidung treffen; vor Umsetzung komplette veröffentlichte History/Branches/Logs auf sensible Daten prüfen. Offizielle Sichtbarkeitsdoku erneut gelesen: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility .

0-USD-Budget und bereits ausgeschöpfte private Actions-Quota erlauben auch keinen manuellen GitHub-hosted Preview-Lauf bis zum Reset oder passender Budget-/Runnerfreigabe. Weniger Trigger sparen künftige Nutzung, stellen keine bereits verbrauchten Minuten wieder her. Coding/lokale Checks und vorhandene Website können weiterlaufen. Keine unbelegte Größenordnungs-Ersparnis zusagen, nach tatsächlicher Umstellung messen. Keine Workflow-/Sichtbarkeits-/Budgetänderung, bezahlter Aufruf, manueller Rerun, Merge oder Deploy in diesem Austausch.


## Wiederaufnahme nach öffentlicher Umstellung – 04.10.2026

Martin hat public hergestellt und die ausstehenden Schritte freigegeben. Metadaten
bestätigen public, Standardrunner starten wieder. PR #88 (17f4d4b) hat fünf
erfolgreiche exakte PR-Workflows und ist als 3ae00f9 auf main integriert.
Dieser Branch übernimmt den aktuellen main einschließlich Trigger-Optimierungen
und Test-Isolation für GITHUB_RUN_ATTEMPT, erhält seine Recovery-/Admission-Logik
und entfernt die inzwischen widersprüchliche doppelte Kosten-Task-Zeile.
Frische CI für den kombinierten Recovery-Head vor Integration erforderlich.
Keine Paid-Workflow-Reruns: nach Integration nur den normalen einmaligen
Recovery-/Guardian-Pfad beobachten. Budget/History/Production-Grenzen erhalten.


## Tatsächlicher Quellenblocker nach paralleler Entwicklung

PR #91 auf main afc6524 erhalten: Startscreen-Basis b5d456e und neue Übergabe.
Der originale Pilot bleibt absichtlich auf eb80c5e6 gepinnt; Web ist nach #90
f30fa44. recovery.apply_request verlangt explizit identischen aktuellen Ziel-SHA
und Originalparent des Candidates. Deshalb darf die bloße PR-Lesereparatur den
alten Paid-Versuch bei verändertem Ziel nicht freigeben. Homepage-Admission wartet
weiter auf echten Pilot; dessen eigener Quellvertrag muss dann mit dem aktuellen
Taskhash/ausgewählten Blobs neu geprüft werden. Keine heimliche Rebase-Freigabe
oder neue Budgetreservierung durch die Dokumentation. Nächster separater Schritt:
aktuellen source-bound Pilot-/Recovery-Vertrag unter Erhalt von History,
verbrauchten Versuchen, Gesamtbudget und unabhängigen Reviews erstellen.
