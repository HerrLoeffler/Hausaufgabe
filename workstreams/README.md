# Aufgabenregister

Stand: 01.10.2026. Kein globales CURRENT_TASK.md: mehrere Aufgaben dürfen parallel laufen.
Die folgenden Branch-Spitzen wurden über GitHub gelesen; Deploy-Angaben sind gesondert gekennzeichnet.

`workstreams/registry.json` ist zusätzlich das **maschinenlesbare Workstream-Register**. Vor neuer Entwicklungsarbeit immer Registry, Remote-Branches und offene Pull Requests prüfen. Bei lokalem Checkout `python tools/branch_audit.py` ausführen. Das Register ersetzt die jeweilige Übergabe nicht.

| Baustelle | Branch | Übergabe / nächster Schritt |
|---|---|---|
| Website / gemeinsamer App-Webstand | feature/gradecrew-app-integration | `web-app.md` + `design-dashboard-v1.md`: Design-Dashboard V1 integriert bei `74eb2ec`; automatische Preview technisch verifiziert; visuelle Desktop-/Mobile-Abnahme offen |
| Crew Assistant / Sprache | feature/crew-assistant-v1 | `crew-assistant.md`: Coco, Remy, Emmi und Wilma auf gemeinsamem Assistant-Core; lokaler Zero-API-Pfad + KI-Fallback, Remy→Testformular und erster Diktierknopf implementiert; CI-Lauf `36927353069` grün bei `c21b7b8`; Staging-/Geräteabnahme offen |
| Prüfungsserver / Security | feature/secure-assessment-v1 | Branch-eigene AGENTS.md, GRADECREW_STATUS.md, DIAGNOSTICS_GUIDE.md und Security-Audit lesen; reale Freigaben offen |
| Telemetrie / Produktdiagnose | feature/telemetry-implementation | `telemetry-implementation.md`: Stand `4e4f0ba`; Collector, Secure-Join/Submit, getrennte Serveroperationen, Runden-/KI-Diagnose und aktiver Lehrerzeit-Tracker isoliert umgesetzt; Aktivierung, vollständige CI/Emulatorprüfung und Deploy offen |
| iPad-Lehrerapp | feature/shared-gradecrew-design-system | `ios-app-v2.md` + branch-eigene GRADECREW_APP_STATUS.md / native/GradeCrewTeacher/TESTFLIGHT.md: Hybrid-App-Shell 0.2 vor Native-Doppelbau härten; Gerätestand bestätigen |
| Design Foundation | feature/gradecrew-design-foundation-v1 | `design-system.md`: Design Bible, Screen-Map und Crew-Library-Plan gesichert; zentrale Token-/Asset-Architektur wird im Webstand weiterverwendet |
| Dashboard Design V1 | feature/design-dashboard-v1 → integriert | `design-dashboard-v1.md`: Shared Tokens + erster Referenzscreen „Meine Tests“; Integrationscommit `74eb2ec`, CI/Mobile-Tutorial/Preview technisch grün; visuelle Abnahme offen |
| Release-Sicherung | main / feature/release-safety-snapshots | `release-safety.md`: automatisches Hosting-Archiv verifiziert; vierte Referenz-Seite und Daten-Backup noch offen |
| Spiele / Escape Room | feature/escape-room-mvp-v1 → lab/games-structure | `docs/games/ESCAPE_MVP.md` + Registry: MVP auf eigenem Feature-Branch; Games-Hub und weitere Lab-/verified-Branches zuerst als Related Branches prüfen, nicht ungeprüft zusammenführen |
| Entwicklungsordnung / Emulator-Gates | feature/dev-governance-emulator | `dev-governance-emulator.md`: Registry, Branch-/PR-Audit und wiederverwendbares Firebase-Emulator-Gate werden isoliert eingeführt; echter Emulatorlauf/CI vor Integration noch nachweisen |

## Neue Aufgabe

Kopie von TEMPLATE.md unter einer eindeutigen ID anlegen, z. B. `workstreams/tutorial-submit.md`.
Aufgabenstatus und Belege in dieser Datei pflegen; gemeinsam genutzte Registry nur bei tatsächlicher Änderung der Zuordnung aktualisieren.
Kein Chat hat automatisch exklusiven Besitz einer Baustelle. Eine veraltete „in Arbeit“-Angabe vor Übernahme prüfen.
Vor einem neuen Branch zuerst `workstreams/registry.json`, offene PRs und `relatedBranches` prüfen; keine zweite Lösung für dieselbe Funktion beginnen, solange bestehende Arbeit nicht eingeordnet wurde.

## Integration

Ein Integrationsauftrag nennt ausdrücklich Quellbranches und Zielbranch. Nicht pauschal einen alten App-/Design-/Spielebranch als neue Gesamtbasis deployen. Kontrollieren, ob z. B. Uploads, PDF/Bilder, Secure-Pfad und Tutorialfunktionen weiterhin enthalten sind.
Vor Integration `python tools/branch_audit.py` erneut ausführen. Bei Firebase-relevanten Änderungen gilt zusätzlich `docs/EMULATOR_TEST_STANDARD.md`; ein grüner Emulatorlauf ersetzt weder Staging noch Gerätetest.
