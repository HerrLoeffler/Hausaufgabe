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
