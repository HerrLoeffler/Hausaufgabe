# GradeCrew – Startscreen Masterpiece v4

Stand: 2026-10-04
Basis: feature/gradecrew-app-integration@578677633c1759e75fee6479f416fb64566f5c5c
Production: unverändert

## Warum v4

v2 verlor den alten synchronen Provider-Aufruf am HTTP-Timeout. PR #105 stellte OpenAI Guardian auf Background Responses um.
v3 kam dadurch kontrolliert zurück, endete aber ohne fertigen Kandidaten. Die große Basis-CSS musste vollständig neu ausgegeben werden; Publish, Tests und Reviews liefen deshalb nicht.

PR #114 hat die Design-Architektur daraufhin geändert:
- gradecrew-auth-startscreen.css bleibt stabile Basis.
- gradecrew-auth-startscreen-polish.css ist ein kleiner nachgelagerter visueller Layer.
- Staging-Build und Regressionstests kennen diesen Layer.
- DE/EN-UI-Abdeckung aus PR #108 bleibt erhalten.

## v4 Scope

Writable:
- gradecrew-auth-startscreen-polish.css

Read-only Kontext:
- gradecrew-auth-startscreen.css
- gradecrew-entry-flow.js

Ziel: Premium-Polish für Komposition, Licht, Tiefe, Spacing und Responsive – ohne Produktlogik oder Texte umzubauen.

## i18n-Regel

Der Startscreen muss bei DE/EN vollständig mitwechseln.
Deshalb:
- keine sichtbaren Wörter per CSS content;
- keine eingebrannten Texte in Bildern/Data-URIs;
- sichtbare Copy bleibt im DOM/i18n-Katalog;
- Test-/Inhaltssprache und Bewertungssprache bleiben unabhängig von der UI-Sprache.

## Multi-KI-Gate

1. GPT-6.1 Sol baut ausschließlich den kleinen Polish-Layer.
2. Exact Combined Web Validation.
3. GPT-6 Astra: Korrektheit/Auftragstreue.
4. Claude Sonnet 5.5: Produkt-/Sicherheitsgrenzen.
5. GPT-6 Sol: QA/Nutzerfluss.
6. Nur bei drei Freigaben Integration in feature/gradecrew-app-integration.
7. Technischer Staging-Preview.
8. Martin prüft Desktop, iPad, Phone sowie DE/EN.
9. Production bleibt gesperrt.

## Budget

module-web-v1: maximal 2,40 USD Reservat für diesen einen Task; Task-Cap 2,55 USD.
Alte v2/v3 Historie und Reservate bleiben unverändert.

## Status

- isolierter Polish-Layer: integriert, Post-Merge AI Staging Checks grün
- Background Responses: auf main integriert
- sichere Terminaldiagnostik: auf main integriert
- v4 Task/Policy: auf diesem Branch
- v4 Provider-Aufruf: noch nicht
- Production: UNVERÄNDERT


## Recovery checkpoint – 2026-10-04T20:17Z

Original chat: Design GC, link unknown. New chat: GradeCrew recovery. Task remains startscreen-masterpiece-v4-20261004 (GC-DESIGN-03/04 design lineage), request run-37229978936-1, execution37230004552, original PR118/head961416cd.
Original build/publication successful; validation failed at the overbroad CSS generated-copy regex; reviews/integration skipped. Historical v2/v3/v4 attempts and budget remain untouched. v4 reservation2.40 USD; confirmed build estimate0.174598 USD.

This recovery reproduced the false positive, corrected the test to allow empty/none/normal generated content while rejecting words/attr/var/url, and added fixtures. 8/8 local tests green; full AI Staging Checks37231113004 green. Test-only PR121 integrated as cff9671. Current Audio V2 work preserved.

Concurrent writer discovered after fresh fetch: feature/design-startscreen-v4-repair-20261004 / PR123, authored at20:12-20:14Z during this recovery. It alters the historical candidate to avoid the old regex. Latest observation: PR123 integrated as fb88dfa7, current integration CI37231463662/37231463639 running. Previously triggered Hosting37231419148 / AI Functions37231419123 also running; exact deployment receipts still need verification. Active old design ownership therefore cannot be excluded. Further shared mutations stopped per CHAT_RECOVERY.md.

Unused implementation on this isolated checkpoint branch:
- tools/automation/candidate_revalidation.py: proposed single-use reuse path for an identical candidate and original unused reviews/reservation; NO REQUEST FILE, NOT ACTIVATED.
- .github/workflows/startscreen-revalidation.yml: proposed existing fixed unprivileged CI followed by three sequential independent reviews; no builder/integration/deploy authority.
- qualification regression tests:4/4 local, combined selected automation tests82/82 local. No external provider calls in this replacement chat.

Independent review found blockers before any activation: preserve confirmed paid usage even when review validation or refreshed authority fails; validate full policy/execution/baseBranch before spending. These remain OPEN. Do not activate this prototype as-is. It is a checkpoint, not approved infrastructure.

Original local unsaved old-chat state is inaccessible/unknown. Our implementation files are saved on this isolated branch. Production unchanged by this replacement chat; no device acceptance claimed.

Next single step: establish one Design GC writer, then read current main/web/PR123/ledger and deployment receipts. Reconcile whether the required three independent reviews occurred before claiming design completion; do not rebuild, reset history/budget, merge stale recovery code or rerun paid workflows.
