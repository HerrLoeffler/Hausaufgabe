# Guardian: drei unabhängige Prüfer und neuer Hauptkanal

GC-AUTOMATION-05/07. Nutzerauftrag vom 04.10.2026: bisherigen nicht erreichbaren Hauptchat übernehmen, tatsächlichen Stand lesen und die Automationskette weiterführen.

## Belegbarer Ausgangsstand

main a2f6c2daed6bebca87f6365602012c57d24c93e7. START_HERE, AGENTS, State, TODO, Registry und bestehende Übergaben frisch gelesen. Development Status Run 37171734748 (04.10.) erfolgreich; 18 offene PRs, Guardian-Fix #59 einziger offener Implementierungs-PR dieser Baustelle. PR #59 anhand finalem Head 07d0dab25694e58c95922d7878a5819f8d29c774, Tests und Rehearsal 37085700180 geprüft und integriert. Baseline-/Lieferprüfung verhindert Phantom-Dateien ohne Hosting-Build-Anbindung.

Aktueller Guardian-Run 37181171628, Job 111373899847: beide Flags unset, alle drei dedizierten Key-Präsenzfelder false, Policy disabled/leere Queue. Kein bezahlter Pilot, keine neue Produktintegration oder Deployment durch diesen Auftrag. Andere Feature-, Rules-, Games- und native Baustellen bleiben gesondert.

## Änderung

Branch fix/guardian-three-reviewers-v1 → main. Vorher nur zwei unabhängige Prüfer trotz Martins Wunsch nach Builder plus drei Prüfern. Jetzt Builder GPT-6.1 Sol, Korrektheit GPT-6 Astra, Security/Product Claude Sonnet 5.5, QA/Acceptance GPT-6 Sol. Vier getrennte Aufrufe; Reviewer sehen Originalquellen, Kandidat, Tests und Commit-/Digest-Bindung, aber keine Urteile ihrer Kollegen. QA kann Integration verweigern, konkrete Kritik bleibt für die begrenzte Reparatur erhalten. Fehlt einer der drei Nachweise, kann nicht integriert werden. Workflow-Matrix, CLI, Gate, Feedback und Usage-Zählung folgen denselben drei Rollen.

Bisherige Grenzen bleiben: maximal drei Bauversuche insgesamt, kein Force-Push, keine automatische Production/Gerätefreigabe. Zusätzliche QA nutzt vorhandenen separaten OpenAI-Review-Key; Zugriff auf beide Review-Modelle erforderlich. Konservative Kontext-/Output-Obergrenzen ergeben $5.09 gegenüber unveränderter Reservierung $5.50/Versuch ($16.50/Auftrag, $33/UTC-Tag). GPT-6-Sol-API-Vertrag und Preise am 04.10. offiziell geprüft; echter Account-/Providerzugriff noch nicht bestätigt.

## Prüfungen und nächster Schritt

86 lokale Tests (Guardian, Pipeline, Release Control) grün. Enthalten: Veto jedes der drei Prüfer, fehlender Prüfer, QA-Reparaturfeedback, blinde QA-Kontexte, vollständiger simuliert abgewickelter Vier-Aufruf-Ablauf samt Usage, Budgetobergrenze, bestehende CI-/Receipt-/Race-/Retry-Grenzen. Bash-Syntax grün. Remote-CI und Rehearsal nach Push separat prüfen; bisherige Runs nicht als Nachweis dieses neuen Commits verwenden.

Danach reviewed Steuerung integrieren und sichere Einrichtung: CODEX_WORKER_API_KEY, GUARDIAN_OPENAI_REVIEW_KEY, GUARDIAN_ANTHROPIC_REVIEW_KEY sowie CODEX_WORKER_ENABLED/GRADECREW_GUARDIAN_ENABLED. Keys niemals im Chat. Konkreten kleinen Web-Pilot mit aktuellen Dateien/Akzeptanzkriterien und Integrations-SHA auf main sichern, aufnehmen und API → PR → exakte CI → drei Reviews → Integration → CI → Hosting/Functions-Receipts prüfen. Bis dahin implementiert, nicht aktiviert/E2E-verifiziert. Neuer Hauptkanal nutzt dieselben Repo-Übergaben; Chatwechsel selbst ist kein Workerstart.

