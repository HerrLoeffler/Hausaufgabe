# Aufgabe: GC-AUTOMATION-08

- Aktualisiert (UTC): 2026-10-04 20:52
- Verantwortlicher Chat / Auftrag: Weiter mit GradeCrew nach einem Chat-Abbruch; Martin: automatische Phasenkette auf weitere Aufgabenarten erweitern und Staging-Rückstand prüfen.
- Chat-Bezeichnung / Link: aktueller Recovery-Chat; Link unbekannt.
- Vorheriger Chat: Main GC (w); Quellenvertrags-Recovery separat über PR #125 gesichert.
- Arbeitszustand: aktiv, Bestandsaufnahme gesichert; Designentscheidung offen.
- Aufgabenbranch: docs/guardian-admission-profiles-20261004
- Basiscommit: ced8e6dbe1cec5215edeb88b551afc363fe634cc
- Integrationsziel: main
- PR: siehe PR dieses Aufgabenbranches; noch nicht integriert.
- Betroffene Dateien: docs/STAGING_BACKLOG_2026-10-04.md, diese Übergabe, TODO.md, workstreams/registry.json.
- Überschneidungen: zentrale TODO/Registry; PR #65 betrifft GC-AUTOMATION-09 bis -11, bleibt getrennt. Keine Controller-/Produktdatei geändert.

## Ziel und gewünschtes Verhalten

Weitere Aufgabenarten durch dieselbe belegbare Phasenkette führen, mit eigenen unveränderlichen Zulassungs-, Test-, Review- und Staging-Gates. Bestehende Aufgaben/Kandidaten erhalten und Release-Rückstand anhand tatsächlicher Nachweise einordnen.

## Umfang / nicht verändern

Dieser Commit sichert Audit und empfohlenen Zuschnitt, keine Implementation und keine neue Zulassung. Keine Production-, IAM-, Secret-, Budget-, Provider- oder Deploy-Änderung. GRADECREW_STATE.json nicht pauschal überschreiben. Backend/Rules/Games/iOS bleiben bis eigenen vollständig belegten Profilen gesperrt.

## Akzeptanzkriterien

Bestandsaufnahme trennt deployed/CI/Review/Geräteabnahme. GC-AUTOMATION-08 bleibt dieselbe ID. Profilentwurf bewahrt drei unabhängige Reviews, ursprüngliche Gesamtbudgets und Ownership; kein unbekanntes Provider-Ergebnis wird wiederholt.

## Zwischenstand

- Lokal geändert: keine Produktdateien; Vorbereitung über GitHub-Connector.
- Auf GitHub gesichert: Commit dieses Branchs mit Audit, TODO und Registry-Zuordnung.
- Geprüft: main ced8e6d; Development Status 37233003312; offene PRs/Branches; Run-/Job-/Deploy-Logs und aktuelle Gateway/Games/Telemetry/Native-Übergaben. Konkrete Quellen und Gate-Grenzen im [Audit](../docs/STAGING_BACKLOG_2026-10-04.md).
- Deployed: nichts durch diesen Auftrag. Gateway ist bereits auf vier Providern Staging; zentrale alte Übergabe ist überholt. L3 ist neuer als Retro-V2-Preview.
- Gerätetest: keiner durch diesen Auftrag; TestFlight-Erfolg ist keine Geräteabnahme.

## Offene Probleme und Unsicherheiten

Empfohlener Zuschnitt: feste main-Profile, Web-Kompatibilität plus erster isolierter statischer Games-Preview. Schriftliches Design/Implementation noch nicht genehmigt.
Secrets/Token-Präsenz und Apple-Verarbeitung/Gerätestand nicht belegbar. Secure-Preview scheitert in 36870114409 an integrierten DOM-Verträgen; Escape-MVP in 37021633218 an Secret-Manager-403. Diese Blocker nicht blind wiederholen.
18 aktive Workstreams/neun mögliche Dateiüberschneidungen; einzelne historische Branches sind weit hinter Zielständen. Keine pauschale Integration.

## Nächster konkreter Schritt

Empfohlenen Ausbau-Zuschnitt mit Martin prüfen und dann die konkrete schriftliche Spezifikation des ersten Profilpakets erstellen. Vor Code folgen schriftlicher Spezifikationsreview und Implementierungsplan.

## Wiederaufnahme nach Abbruch

- Letzter gesicherter Teilschritt: Audit und empfohlener Zuschnitt, 2026-10-04 20:52 UTC.
- Gepushter Codecommit / Remote-Branch: kein Produktcode; Dokumentationscommit dieses Branchs.
- Ungesicherte Änderungen / Checkout: keine Produktänderungen; projektloser Chat, GitHub-Connector genutzt.
- Laufende oder unklare Vorgänge: kein neuer Guardian-/Deploy-/Providerlauf gestartet. Bestehende v2/v3-Providerunklarheit im Audit erhalten.
- Bereits ausgeführte externe Aktionen / Kostenreservationen: nur GitHub-Reads und dieser Dokumentationscheckpoint; keine neue API-Kostenreservation.
- Was darf noch nicht als erledigt gelten? GC-AUTOMATION-08, Zulassung neuer Aufgabenprofile, neue L3-/PostHog-/Security-Deployments und menschliche Abnahmen.
- Was vor Wiederholung prüfen? Aktuelles main, Branch/PR dieses Checkpoints, aktuelle Ledger/Actions und Kandidaten; identischen Audit/Branch nicht neu erzeugen.
- Genau ein nächster ausführbarer Schritt: offene Designentscheidung prüfen; bei Freigabe schriftliche Spezifikation des ersten Profilpakets erstellen.

Vor Übernahme [../docs/CHAT_RECOVERY.md](../docs/CHAT_RECOVERY.md) lesen.
