# GC-AI-ROUTING-03 – Provider-Identität und Deployment-Stand

Stand 02.10.2026. Basis `integration/ai-gateway-staging@46b21ff4a8b09f2bed9888ac29a954d52c7c794e`. Eigener Review-Fix, keine Production-Freigabe.

## Befunde und Korrekturen
- Bei abweichendem zurückgegebenem Modell/Provider wurde vor der Ablehnung noch mit den Preisen der angefragten Route abgerechnet; danach konnte ein weiterer bezahlter Versuch folgen. Jetzt Identität zuerst prüfen, Kosten als unbekannt behalten, volle Reservierung erhalten und keine automatische Wiederholung.
- Gateway-Workflow prüfte den Head nur vor den langen Tests. Neue Prüfung nach Tests vor Cloud-Authentifizierung und unmittelbar vor Traffic-Promotion verhindert die Veröffentlichung eines inzwischen veralteten Kandidaten. Ein minimaler externer Race zwischen Prüfung und Cloud-Aufruf bleibt technisch möglich; parallele manuelle Deploys vermeiden.
- OpenAI-Responses-Normalisierung, Modell-Allowlist, `store:false` und Behandlung gecachter Tokens erneut geprüft; bestehende Implementierung erhalten.

## Prüfungen
- 34 Gatewaytests lokal vollständig grün, einschließlich echtem lokalen HTTP-Server; keine externen KI-Aufrufe.
- `AI orchestration gates` Run `37005188267`: **grün**.
- `AI Gateway CI` am selben Head `7290074810eb53d01d24d117b9ea36c0687d79f7`: **grün**.
- PR #39 ist gegen den unveränderten Integrationshead `46b21ff4a8b09f2bed9888ac29a954d52c7c794e` mergebar.
- Der vorherige Stand `46b21ff4` ist nachgewiesen auf Staging deployed; dieser Review-Fix ist vor Integration noch nicht deployed.

## Offene Integrationsgrenzen
Reale fachliche Evaluationssets, automatische signierte Freigabepipeline, Admin-Proxy/Mount und bestehende Functions-Anbindung fehlen weiterhin. Allowlist ist keine Qualitätsfreigabe; Modellaliases nicht blind als qualifizierte Snapshots behandeln. Bestehender direkter Generierungspfad und Production bleiben unverändert.

## Nächster Schritt
PR #39 kontrolliert in `integration/ai-gateway-staging` integrieren. Danach den dadurch ausgelösten staging-only Gateway-Workflow am exakten Mergecommit auf Candidate-Prüfung, Provider-Smokes, Promotion und Receipt verifizieren und erst dann den zentralen Status hochstufen.
