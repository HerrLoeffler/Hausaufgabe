# GC-AI-ROUTING-03 – Provider-Identität und Deployment-Stand

Stand 02.10.2026. Basis `integration/ai-gateway-staging@46b21ff4a8b09f2bed9888ac29a954d52c7c794e`. Eigener Review-Fix, keine Aktivierung/Deployment.

## Befunde und Korrekturen
- Bei abweichendem zurückgegebenem Modell/Provider wurde vor der Ablehnung noch mit den Preisen der angefragten Route abgerechnet; danach konnte ein weiterer bezahlter Versuch folgen. Jetzt Identität zuerst prüfen, Kosten als unbekannt behalten, volle Reservierung erhalten und keine automatische Wiederholung.
- Gateway-Workflow prüfte den Head nur vor den langen Tests. Neue Prüfung nach Tests vor Cloud-Authentifizierung und unmittelbar vor Traffic-Promotion verhindert die Veröffentlichung eines inzwischen veralteten Kandidaten. Ein minimaler externer Race zwischen Prüfung und Cloud-Aufruf bleibt technisch möglich; parallele manuelle Deploys vermeiden.
- OpenAI-Responses-Normalisierung, Modell-Allowlist, store:false und Behandlung gecachter Tokens erneut geprüft; bestehende Implementierung erhalten.

## Prüfungen
34 Gatewaytests lokal vollständig grün, einschließlich echtem lokalen HTTP-Server (keine externen KI-Aufrufe). Lokale Sandbox blockierte zunächst listen; unveränderte Suite danach mit genehmigter lokaler Netzwerkberechtigung bestanden. CI/Firestore-Emulator für diesen neuen Commit noch abzuwarten. Vorheriger Stand 46b21ff4 ist nachgewiesen auf Staging deployed; dieser Fix noch nicht.

## Offene Integrationsgrenzen
Reale fachliche Evaluationssets, automatische signierte Freigabepipeline, Admin-Proxy/Mount und bestehende Functions-Anbindung fehlen weiterhin. Allowlist ist keine Qualitätsfreigabe; Modellaliases nicht blind als qualifizierte Snapshots behandeln. Bestehender direkter Generierungspfad und Production bleiben unverändert.

