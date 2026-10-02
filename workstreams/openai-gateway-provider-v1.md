# GC-AI-GATEWAY-02 — OpenAI provider behind shared gateway

Stand: 2026-10-02. Branch `feature/openai-gateway-provider-v1`, Basis `feature/ai-orchestration-v1@4ba8038e6951039f9388449c1f7c38022378ad3f` (PR #26).

## Ziel

Die bereits vorhandene OpenAI-Nutzung von GradeCrew wird nicht neu erfunden. Stattdessen erhält der gemeinsame AI-Gateway einen zweiten echten Provider, damit Claude und OpenAI dieselbe serverseitige Schnittstelle, dieselben Budgets/Qualitätsgates und später denselben Router benutzen können.

## Eingebaut

- OpenAI Responses-API Adapter (`/v1/responses`) ohne zusätzliches SDK.
- `store:false`; keine Prompts, Provider-Fehlerpayloads oder Schlüssel in Gateway-Logs.
- normalisierte Ausgabe (`provider`, `model`, `text`, `stop_reason`, `usage`) kompatibel zum bestehenden Orchestrator.
- eigener `POST /providers/openai/test` Smoke-Endpunkt.
- OpenAI wird nur registriert, wenn `OPENAI_API_KEY` zur Laufzeit vorhanden ist.
- bestehendes Secret `OPENAI_API_KEY` wird per Cloud Run Secret Manager eingebunden; kein neuer Schlüssel und kein Key im Repo/Deploybefehl.
- einmaliges Staging-Setup gewährt nur dem dedizierten Gateway-Servicekonto `secretAccessor` auf genau dieses Secret.
- Defaultmodell bleibt für Vergleichbarkeit `gpt-5.6-luna`, passend zur bestehenden GradeCrew-OpenAI-Funktion.
- Model-Allowlist für OpenAI **und** Anthropic; teurere Modelle sind standardmäßig nicht aufrufbar. Allowlist-Freigabe ist noch keine Qualitätsfreigabe für automatisches Routing.
- OpenAI-Adapter zunächst bewusst text-only; Bild/Audio fail-closed.
- Kostenadapter berücksichtigt OpenAI `cached_tokens` als Teilmenge der Input-Tokens und verhindert Doppelberechnung.
- Tests für Responses-Request, Ausgabe-/Stop-Normalisierung, Limits, Modell-Allowlist, Nicht-Text-Fail-Closed, Providerfehler, Cache-Kosten und Zwei-Provider-Registrierung.

## Bewusste Grenzen

- Noch **nicht deployed**; Production unverändert.
- Keine bezahlten OpenAI-Testaufrufe aus Code/CI.
- Automatisches Routing wird durch diesen Branch nicht aktiviert. Ein Provider/Modell braucht weiterhin echte, signierte Qualitäts-/Kosten-Evidenz aus PR #26.
- Bestehende Firebase-OpenAI-Funktionen werden noch nicht umgeschaltet; sie bleiben bis zu einem kontrollierten Pilot-Cutover unverändert.
- Kein Bild-/Audio-Routing über OpenAI in dieser Stufe.

## Nächste Schritte

1. PR-CI vollständig grün bestätigen (Gateway + Orchestration + Intelligence contracts).
2. In authentifizierter Cloud Shell einmal `setup-openai-secret-access.sh` ausführen; Secretwert wird weder gelesen noch verändert.
3. Staging-Deploy dieses Branches mit vorhandener Anthropic-WIF-Konfiguration; Production bleibt gesperrt.
4. `GET /health`, Claude-Smoke und OpenAI-Smoke prüfen; OpenAI muss exakt `GATEWAY_OK` liefern.
5. Erst danach einen klar begrenzten bestehenden GradeCrew-Textjob als Pilot über den Gateway anbinden und gegen die bisherige OpenAI-Pipeline benchmarken.
6. Gemini und Mistral als weitere Adapter ergänzen; Router erst auf reale, scope-gebundene Evidenz reagieren lassen.

## Statusbegriffe

Code: auf GitHub-Branch gesichert. Tests: CI ausstehend. Staging-Integration: ausstehend. Staging-Deploy: ausstehend. Gerätetest: nicht anwendbar für Providerbasis. Production: unverändert.
