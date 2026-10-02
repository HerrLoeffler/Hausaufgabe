# GC-AI-ROUTING-02 / GC-AI-OBS-02 – Automatische KI-Auswahl

Stand 2026-10-02. Branch `feature/ai-orchestration-v1`, Basis `890a01180ef7bfb41daa8285c3b71a0c20a7bb12`. Draft-PR [#26](https://github.com/HerrLoeffler/Hausaufgabe/pull/26) auf Qualitätsvertrag #25, dieser auf Gateway #24.

## Produktentscheidung
Automatische qualitätsgebundene Modellwechsel sind ausdrücklich gewünscht. Keine Bestätigung pro Anfrage/Wechsel. Fachliche Referenzen, Schwellen, Datenschutz und Release-Budgets werden vorab festgelegt. Der vertrauenswürdige Evaluationsworker kann daraus passende Modellrouten automatisch signiert freigeben. Kein Modell/Browser darf seine eigene Qualität oder Berechtigungen freigeben.

## Gesicherte Umsetzung
- Signierter Router mit Scope-/Prompt-/Validator-/Datenschutzbindung, Ablauf und Capability-Prüfung; nur qualifizierte verfügbare Routen.
- Automatische Auswahl nach Gesamtkostenprognose pro akzeptiertem Ergebnis; Mindestvorteil/Wartefrist; qualifizierter Ersatz.
- Getrennte Tages-/Monatsbudgets und Aufrufzahlen für Betrieb/Evaluation, Firestore-Reservierung vor API, Deduplizierung, idempotente Abrechnung, konservative Behandlung unbekannter Kosten.
- Separate begrenzte Evaluationsplanung; Publisher prüft Offline-Evidenz erneut und signiert. Keine bezahlten Tests in CI.
- Inhaltsfreie Entscheidungsbelege und Statistik-Endpoint; filter-/sortierbare Admin-Komponente mit echten Auswahlgründen, Beleg-IDs, Kostenabdeckung und klar geschätzter API-Ersparnis.
- Gateway-Härtung: sichere Fehlercodes, Token-/Temperature-Grenzen, WIF-Deadline und reale Tokenlaufzeit, kein Rohpayload. Transitive uuid-Advisories durch kompatiblen Override entfernt; npm audit meldet 0.
- Separater Games-Fix [#27](https://github.com/HerrLoeffler/Hausaufgabe/pull/27) auf `fix/escape-tutor-cost-guards@c619568900ab620d220654c2488ee6160e5873d7`: 5 Tests und Games-Lab-CI grün; nicht deployed.

## Prüfungen
Lokal auf aktuellem Code: 24 Gatewaytests, 14 Qualitätsverträge, 5 Evaluations-/Adminansichttests grün; Syntax geprüft. 127 bestehende unveränderte KI-Functions-Tests grün. npm audit des Gateways: 0 bekannte Findings.
Zwischencommit `4904c2bccc2ae6fd13fc4ec63f985a5c0bc9f316`: CI `36973773278` komplett erfolgreich einschließlich echtem Firestore-Emulator (Parallelität, Budgetkontinuität, idempotentes Settlement, Evaluationstrennung). Nach letzten Verbesserungen neuer exakter CI-Nachweis ausstehend. Lokal blockierte Java <21 den Emulator, CI verwendet Java 21.
Release-Stufe vor Abschlussprüfung: branch_only für den letzten Nachtrag; vorheriger Code CI-grün. Nicht integriert, nicht deployed, kein Gerätetest, keine neue Erhebung oder Modellumschaltung aktiviert.

## Noch erforderlich
Kein echter Kandidat wurde durch diese synthetischen Tests fachlich qualifiziert. Noch fehlen reale Evaluationsdaten/Preisstände, Signierschlüssel-/Artefaktbetrieb, ausführender Evaluationsworker, Deployment/IAM/Retention, Anbindung der bestehenden OpenAI-Functions sowie rollenprüfender Admin-Proxy und Widget-Mount. Aktuelle Runtime ist auf Staging und Text beschränkt. Ein signiertes Artefakt ist kein Wahrheitsbeweis für seine Referenzdaten.

## Prüfbericht und Anleitung
- [Automatisches System](https://github.com/HerrLoeffler/Hausaufgabe/blob/feature/ai-orchestration-v1/docs/intelligence/AUTOMATIC_ROUTING.md)
- [Architekturcheck](https://github.com/HerrLoeffler/Hausaufgabe/blob/feature/ai-orchestration-v1/docs/intelligence/ARCHITECTURE_AUDIT_2026-10-02.md)

Nächster konkreter Schritt: exakte CI abwarten, PR #26 integrierbar prüfen und einen vorhandenen klar begrenzten Textauftrag mit fachlich geprüftem Pilotset an den Gateway anschließen. Security-Cutover, 30-Teilnehmer-Fehler, Tutorialabgabe, Geräteabnahme und vollständiger Restore bleiben eigene offene Release-Gates.
