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
