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
- Separater Games-Fix [#27](https://github.com/HerrLoeffler/Hausaufgabe/pull/27) auf `fix/escape-tutor-cost-guards@a521ec905c09793441a301c0304881a2fe9ab27e`: 6 Tests und Games-Lab-CI grün (Run 36974980982); nicht deployed.

## Prüfungen
Lokal auf aktuellem Code: 25 Gatewaytests, 14 Qualitätsverträge, 5 Evaluations-/Adminansichttests grün; Syntax geprüft. 127 bestehende unveränderte KI-Functions-Tests grün. npm audit des Gateways: 0 bekannte Findings.
Zwischencommit `4904c2bccc2ae6fd13fc4ec63f985a5c0bc9f316`: CI `36973773278` komplett erfolgreich einschließlich echtem Firestore-Emulator (Parallelität, Budgetkontinuität, idempotentes Settlement, Evaluationstrennung). Nach Kosten-/Abhängigkeitshärtung Commit `79a646d7d7db3b7061a33653dc2ba5bec0e287aa` in CI `36974823616` ebenfalls komplett erfolgreich. Abschlussstand `c5dcc4dcf8a1057817619afbbd1f914cf142e394`: [AI orchestration gates 36975168993](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/36975168993) erfolgreich einschließlich Firestore-Emulator; Gateway- und Vertrags-CI ebenfalls grün. Lokal blockierte Java <21 den Emulator, CI verwendet Java 21.
Release-Stufe: ci_green. Produktcode getestet auf dem oben genannten Abschlusscommit; nachfolgende Statuscommits ändern nur Dokumentation. Nicht integriert, nicht deployed, kein Gerätetest, keine neue Erhebung oder Modellumschaltung aktiviert.

## Noch erforderlich
Kein echter Kandidat wurde durch diese synthetischen Tests fachlich qualifiziert. Noch fehlen reale Evaluationsdaten/Preisstände, Signierschlüssel-/Artefaktbetrieb, ausführender Evaluationsworker, Deployment/IAM/Retention, Anbindung der bestehenden OpenAI-Functions sowie rollenprüfender Admin-Proxy und Widget-Mount. Aktuelle Runtime ist auf Staging und Text beschränkt. Ein signiertes Artefakt ist kein Wahrheitsbeweis für seine Referenzdaten.

## Prüfbericht und Anleitung
- [Automatisches System](https://github.com/HerrLoeffler/Hausaufgabe/blob/feature/ai-orchestration-v1/docs/intelligence/AUTOMATIC_ROUTING.md)
- [Architekturcheck](https://github.com/HerrLoeffler/Hausaufgabe/blob/feature/ai-orchestration-v1/docs/intelligence/ARCHITECTURE_AUDIT_2026-10-02.md)

Nächster konkreter Schritt: PR #26 ist laut GitHub konfliktfrei integrierbar; zunächst einen vorhandenen klar begrenzten Textauftrag mit fachlich geprüftem Pilotset an den Gateway anschließen. Modellfreigaben, Budgets und Benutzerautorisierung müssen dabei nachweislich erhalten bleiben. Security-Cutover, 30-Teilnehmer-Fehler, Tutorialabgabe, Geräteabnahme und vollständiger Restore bleiben eigene offene Release-Gates.

