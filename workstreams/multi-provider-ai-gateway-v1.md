# Aufgabe: GC-AI-GATEWAY-01

- Aktualisiert (UTC): 2026-10-02
- Verantwortlicher Chat / Auftrag: Multi-Provider-AI-Gateway; zuerst Claude via Google Cloud WIF, danach OpenAI/Gemini/Mistral über dieselbe Schnittstelle
- Aufgabenbranch: `feature/multi-provider-ai-gateway-v1`
- Basiscommit: `a61759db01e41f19b7d34e6eb0e88bac42484c1e` (`feature/gradecrew-app-integration`)
- Betroffene Dateien: `ai-gateway/**`, `.github/workflows/ai-gateway-ci.yml`, diese Übergabe; gemeinsame Register nur statusbezogen
- Überschneidungen mit anderen Aufgaben: bestehende Firebase-AI-Funktionen (`crewAssistant`, Testgenerierung, Emmi) bleiben unverändert; spätere Integration muss deren Auth-/Quota-/Validation-Grenzen erhalten

## Ziel und gewünschtes Verhalten

Ein isolierter serverseitiger GradeCrew-AI-Gateway stellt eine gemeinsame Provider-Schnittstelle bereit. Provider werden nicht nach Bauchgefühl als "besser" verdrahtet. Phase 1 ermöglicht kontrollierte explizite Providerwahl und normalisierte Messwerte; spätere automatische Auswahl basiert auf Tests pro Job/Modell/Kosten/Qualität.

Erster Provider: Anthropic/Claude ohne langlebigen API-Key. Der Cloud-Run-Workload erhält ein Google-OIDC-Token über den Metadata Server, tauscht es über Anthropic WIF gegen ein kurzlebiges Access Token und verwendet dieses als Bearer Token für die Messages API.

## Umfang / nicht verändern

- Nur Staging-Projekt `hausaufgabe-staging`.
- Production `hausaufgabe-40294` nicht verändern.
- Bestehende `functions/**` und ihre OpenAI-Flows in diesem Teilschritt nicht umbauen.
- Keine statischen Anthropic-Schlüssel committen oder als Browserkonfiguration verwenden.
- Keine Prompts, Schülerantworten, Upload-Inhalte oder Tokens in Gateway-Telemetrie protokollieren.
- Cloud-Run-Zugriff bleibt IAM-geschützt; bestehende GradeCrew-Funktionen werden noch nicht auf den Gateway umgeschaltet.

## Akzeptanzkriterien

- Standalone Node-22-Service startet auf `$PORT`.
- `/health` und `/providers` funktionieren ohne externen KI-Aufruf.
- Anthropic-Adapter holt ein Google-Identity-Token mit Audience `https://api.anthropic.com` und `format=full`.
- WIF-Exchange nutzt `fdrl_`/Organisation/Servicekonto/Workspace aus Umgebungsvariablen und cached das kurzlebige Token bis kurz vor Ablauf.
- Claude-Aufruf nutzt `Authorization: Bearer`, `anthropic-version: 2023-06-01` und normalisiert Text/Usage/Modell.
- Router verlangt zunächst expliziten Provider; keine automatische "beste KI" ohne Benchmarkdaten.
- Unit-Tests simulieren Google/Anthropic vollständig ohne echte API-Kosten.
- Eigene CI prüft Node-Syntax, Deploy-Skript-Syntax und Unit-Tests.

## Zwischenstand

- Lokal geändert: entfällt; Änderungen werden direkt auf eigenem GitHub-Branch gesichert.
- Auf GitHub gesichert (Commit): Gateway-Grundlage `432bd4500f28ae35eb0c653f46878b82ba374f94`; Guarded-Deploy `a7957cfd7fd2d6abc5ed551346b17d1901c6992b`; CI-Härtung `14e64535c3237917f36df1cda12a3632e587687f`. Draft-PR #24.
- Geprüft (Befehl / CI-Link / Ergebnis / Commit): GitHub Actions `AI Gateway CI` Run `36946206264` auf `14e64535...` **success**; prüft `npm run check`, `bash -n deploy-staging.sh`, `npm test`.
- Release-Stufe: `ci_green`; noch nicht integriert und Gateway-Code noch nicht deployed.
- Deployed (Ziel / URL / Commit / Nachweis): **Gateway-Code nicht deployed.** Manuell existiert bereits der Cloud-Run-Scaffold `gradecrew-ai-gateway-staging` in `europe-west1` mit Googles Beispiel-`hello`-Container, IAM-Authentifizierung, Servicekonto `gradecrew-ai-gateway-staging@hausaufgabe-staging.iam.gserviceaccount.com`, min 0 / max 2. Anthropic-WIF-Tokenexchange wurde in Claude Console/Cloud Shell erfolgreich authentifiziert. Diese Infrastruktur ist kein Code-Deploy-Nachweis.
- Gerätetest (Gerät / Version / Ergebnis): nicht relevant/noch nicht erfolgt.

## Offene Probleme und Unsicherheiten

- Echte Cloud-Run-Revision mit Gateway-Code und den vier Anthropic-WIF-ID-Variablen fehlt noch.
- Cloud-Run-Concurrency soll beim echten Gateway-Deploy auf 5 begrenzt werden; der Beispielcontainer steht noch auf 80.
- Caller-IAM: vor Anbindung bestehender GradeCrew-Funktionen muss festgelegt werden, welche Servicekonten `roles/run.invoker` erhalten.
- Kosten-/Qualitätsrouter und Benchmarkdatensatz sind spätere Teilschritte; Phase 1 trifft keine Qualitätsrangliste.
- OpenAI, Gemini und Mistral sind noch nicht als Provider implementiert.

## Nächster konkreter Schritt

In Cloud Shell den tatsächlichen lokalen Git-Stand prüfen, danach exakt den geprüften Branch `feature/multi-provider-ai-gateway-v1` holen und über `ai-gateway/deploy-staging.sh` nach `gradecrew-ai-gateway-staging` deployen. Dabei WIF-IDs als Umgebungsvariablen setzen, Concurrency 5 verwenden und anschließend `/health` + `/providers/anthropic/test` mit authentifiziertem Cloud-Run-Aufruf prüfen.

## Wiederaufnahme nach Abbruch

Der Code liegt auf `feature/multi-provider-ai-gateway-v1`, Draft-PR #24. Vor Fortsetzung Branch-Head, offene PRs und den aktuellen `feature/gradecrew-app-integration`-Head erneut prüfen. Der vorhandene Cloud-Run-Beispielcontainer darf nicht als deployed Gateway bezeichnet werden. Production bleibt tabu ohne ausdrückliche Freigabe.
