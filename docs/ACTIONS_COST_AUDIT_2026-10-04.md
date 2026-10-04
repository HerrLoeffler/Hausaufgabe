# GitHub Actions-Verbrauch: Audit 04.10.2026

Task GC-ACTIONS-COST-01; verbunden mit GC-AUTOMATION-13. Reine Diagnose und Umsetzungsvorschlag, keine Änderung laufender Workflows/Flags/Budgets. PR #86 bleibt ungemergt.

## Befunde und Grenzen

- Nutzer-Screenshot: 2.001/2.000 enthaltene Actions-Minuten verbraucht, Reset 01.11.2026.
- Neue Screenshots: Payment method is missing; Budget kann erst nach Zahlungsmethode erstellt/geändert werden. UI bietet AI credits / Product-level / SKU-level. Konkrete Auswahl: Product-level -> Actions, gesamtes Konto, zunächst 10 USD, Stop usage when budget limit is reached und Alerts aktivieren. Vorschlag, keine durch Agent erfolgte Zahlung/Freigabe.
- Repo bei voriger Live-Metadatenprüfung privat. Standard-Runners für öffentliche Repos kostenlos; private Repos haben Kontingent. Zeitpunkt einer möglichen Sichtbarkeitsänderung ist nicht nachgewiesen.
- REST actions/runs: vier getrennte Tagesabfragen (2026-10-01 bis 2026-10-04 UTC), alle Seiten gelesen. Snapshot bis Run 37208619044 am 04.10.14:15:59Z: 1903 Workflow-Läufe. Tageszahlen 275 / 569 / 141 / 918.
- 646 push, 448 pull_request, 779 workflow_run, 26 schedule, 4 workflow_dispatch. Laufanzahl umfasst skipped/cancelled sowie vor Start blockierte Jobs. Dies ist KEINE vollständige Minuten-/Rechnungsaufteilung. Kontoquota kann andere Repos und OS-Gewichtung umfassen; Usage-Export nicht verfügbar.
- Release Control 357 (208 cancelled), Stage Guardian 236, Handoff 229, AI Staging 189, Games Lab 157, Development Status 102, TestFlight 11.
- 86 workflow/Head-SHA-Gruppen haben sowohl push als auch pull_request. Davon 52 Handoff-Gruppen: dieselbe Quelle mehrfach über unterschiedliche Events geprüft. PR-Merge-Quelle und Integrationsquelle dürfen dennoch nicht ungeprüft als austauschbar behandelt werden.

## Stichproben echter Joblaufzeiten

| Workflow | Run | Beobachtete Laufzeit |
|---|---|---|
| Handoff | 37199309477 | 12 s ubuntu-latest |
| AI Staging | 37199533810 | 107 s ubuntu-latest |
| Games Lab | 36937696380 | 64 s ubuntu-latest |
| Release Control | 37080103085 | 28 s ubuntu-latest |
| Stage Guardian | 37199809379 | 10 s check; continue skipped |
| Development Status | 37079159236 | 9 s ubuntu-latest |
| TestFlight | 37076301215 | 111 s macos-26 |

Raw /jobs gelesen; Connector-normalisierte Jobs lassen Laufzeiten weg. Beispiele sind keine extrapolierte Rechnungsaufteilung. /timing-Stichprobe 36943661186 lieferte billable total_ms=0 bei laufendem Job; daraus weder Sichtbarkeitsdatum noch exakte Rechnung ableiten. GitHub rundet pro Job auf volle Minuten. Zusätzliche Standardkosten derzeit Linux 2-core 0,006 USD/min, macOS 0,062 USD/min.

## Konkreter Optimierungsauftrag (noch umzusetzen)

1. Handoff-Doppeltrigger beseitigen: verlässliche PR-Prüfung und Prüfung kanonischer Integrationsziele erhalten; keinen vollen Doppelrun für jeden Push auf einen PR-Branch. Branch-/PR-Ereignisse und required-check-Namen vor Änderung prüfen.
2. Koordinationsänderungen bündeln: TODO/Workstream/Status im selben Commit sichern, statt pro Datei eigener Contents-API-Commit. Keine Unterbrechungssicherheit aufgeben.
3. Release-Control-/Guardian-Fan-out begrenzen: relevante Quellbranch-/Event-/SHA-Prüfung vor Runnerstart; identische evidence snapshots deduplizieren. Nicht jeden geskippten Hosting-/Functions-/Archiv-Nachlauf erneut als vollen Audit ausführen. Echte Fehlversuche sichtbar erhalten, keine pauschale success-only-Ausblendung.
4. Leseaudits ereignisgetrieben aktualisieren; Cron als seltener Catch-up. Tatsächlich nur 26 schedule-Starts im Snapshot, deshalb nicht als Hauptverursacher ausgeben. Dispatch- und Recovery-Race-Schutz erhalten.
5. AI Staging (aktueller Integrationsbranch) hat breiten push-Trigger ohne paths: relevante Änderungsbereiche erkennen; reine Doku-/Übergabeänderungen nur Koordinationsprüfung. Endgültige Combined-CI für Merge-Kandidat weiterhin verpflichtend.
6. Browser-/Emulator-/npm-Setup verbessern und kurze unabhängige Checks sinnvoll bündeln. Pflichtgates für Security, exakte Quellen und Deploy-Belege erhalten; nicht untrusted Tests mit privilegiertem Guardian-write-Job zusammenlegen.
7. TestFlight nur für gezielte native Release-Kandidaten; normale Web-/Asset-Zwischenänderungen sollen nicht wiederholt Upload auslösen. macOS ist teurer; native Prüfung bleibt erforderlich.
8. Neuere überholte reine Testjobs branchbezogen abbrechen; keine laufenden paid Guardian-/Deploy-/Ledger-Mutationen pauschal canceln.
9. Vorher/nachher Verbrauch anhand Billing-Export und Joblaufzeiten messen. Keine unbelegte Prozent-Ersparnis versprechen.

## Coupon / Education

Kein verifizierter allgemeiner Actions-Coupon gefunden. Offizielle Coupon-Doku beschreibt Rabatte auf bezahlte Abos. Offizielle Discount-Doku: Planrabatte gelten nicht für nutzungsbasierte Abrechnung. Martin kann als Lehrkraft GitHub Education über Education benefits beantragen; bestätigte Benefits umfassen Copilot Pro und beantragbares Team für Unterricht/akademische Forschung. Keine kostenlose/unbegrenzte GradeCrew-Actions-Nutzung oder kommerzielle Education-Deckung behaupten.

## Offizielle Quellen

- https://docs.github.com/en/billing/reference/actions-runner-pricing
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/billing/how-tos/set-up-budgets
- https://docs.github.com/en/billing/concepts/discounted-plans
- https://docs.github.com/en/education/about-github-education/github-education-for-teachers/apply-to-github-education-as-a-teacher
- https://docs.github.com/en/education/about-github-education/github-education-for-teachers/about-github-education-for-teachers

Nächster ausführbarer Schritt: Zahlungsmethode/Actions-Budget durch Kontoinhaber; separate Workflow-Optimierung auf eigenem Branch mit aktuellem Development-Status, Gate-/Event-Verhaltenstests, PR-Checks und Nachhermessung. Kein Merge/Deploy/Provider-Aufruf während dieses Audits.
