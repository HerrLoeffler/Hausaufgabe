# Aufgabenregister

Stand: 02.10.2026. Kein globales CURRENT_TASK.md: mehrere Aufgaben dürfen parallel laufen.
Die folgenden Branch-Spitzen wurden über GitHub gelesen; Deploy-Angaben sind gesondert gekennzeichnet.

| Baustelle | Branch | Übergabe / nächster Schritt |
|---|---|---|
| Website / gemeinsamer App-Webstand | feature/gradecrew-app-integration | aktueller geprüfter Head `27ebf56`; CI `36983854068` grün, automatische Preview `36984017434` deployed und Manifest/Dateihashes verifiziert; Browser-/Geräteabnahme offen |
| GradeCrew Hauptlogo V1 | feature/brand-logo-v1 → integriert | `brand-logo-v1.md`: GC+Bildungs-SVG zentral über `shared/gradecrew-design/assets.json`; Web/Swift/Header/Favicon nutzen semantische Brand-Assets; integriert in `27ebf56`, Preview technisch verifiziert; visuelle Desktop/iPad/iPhone-Abnahme offen; Secure-Logo separat |
| Crew Assistant / Sprache | feature/crew-assistant-v1 | `crew-assistant.md`: Coco, Remy, Emmi und Wilma auf gemeinsamem Assistant-Core; lokaler Zero-API-Pfad + KI-Fallback, Remy→Testformular und erster Diktierknopf implementiert; Head `fce4156`, CI `36927596099` grün, Draft-PR #12; Staging-/Geräteabnahme offen |
| Emmi / ganzen Test überarbeiten | feature/emmi-whole-test-revision-v1 | `emmi-whole-test-revision.md`: Emmi direkt im Editor, Freitext-/Diktierauftrag für den ganzen Test, ein gebündelter Test-Level-KI-Aufruf, stabile Anzahl/Punkte, Bildschutz und Whole-Test-Undo; Code-Head `c291314`, CI `36933680142` grün, Draft-PR #13 auf Crew-Core; Staging-/Runtime-/Geräteabnahme offen |
| Tutorial Choice & Replay V1 | feature/tutorial-choice-replay-v1 | `tutorial-choice-replay-v1.md`: einmalige attraktive Einladung statt Pflichtstart, ×/Escape-Abbruch, Dashboard-Replay und Admin „Tutorial testen“; Draft-PR #16, Testlauf `36935628293` grün; Staging-/Profil-/Geräteabnahme offen |
| Prüfungsserver / Security | feature/secure-assessment-v1 | Branch-eigene AGENTS.md, GRADECREW_STATUS.md, DIAGNOSTICS_GUIDE.md und Security-Audit lesen; reale Freigaben offen |
| Telemetrie / Produktdiagnose | feature/telemetry-implementation | `telemetry-implementation.md`: Stand `4e4f0ba`; Collector, Secure-Join/Submit, getrennte Serveroperationen, Runden-/KI-Diagnose und aktiver Lehrerzeit-Tracker isoliert umgesetzt; Aktivierung, vollständige CI/Emulatorprüfung und Deploy offen |
| iPad-Lehrerapp | feature/shared-gradecrew-design-system | `ios-app-v2.md` + branch-eigene GRADECREW_APP_STATUS.md / native/GradeCrewTeacher/TESTFLIGHT.md: Hybrid-App-Shell 0.2 vor Native-Doppelbau härten; Gerätestand bestätigen |
| Design Foundation | feature/gradecrew-design-foundation-v1 | `design-system.md`: Design Bible, Screen-Map und Crew-Library-Plan gesichert; zentrale Token-/Asset-Architektur wird im Webstand weiterverwendet |
| Dashboard Design V1 | feature/design-dashboard-v1 → integriert | `design-dashboard-v1.md`: Shared Tokens + erster Referenzscreen „Meine Tests“; Integrationscommit `74eb2ec`, CI/Mobile-Tutorial/Preview technisch grün; visuelle Abnahme offen |
| Release-Sicherung | main / feature/release-safety-snapshots | `release-safety.md`: automatisches Hosting-Archiv verifiziert; vierte Referenz-Seite und Daten-Backup noch offen |
| Spiele | lab/games-structure | Vor Änderungen vollständige eigene Übergabe einholen; nicht aus Website-Branch veröffentlichen |
| Sprache / KI-Qualität / Internationalisierung | feature/quality-routing-contract-v1 | `quality-routing-contract-v1.md`: gemeinsamer Vertrag + Offline-Freigabeprüfung, 14 Tests/CI grün, Draft-PR #25 gegen Gateway; noch keine Runtime-Anbindung oder Modellumschaltung |

## Neue Aufgabe

Kopie von TEMPLATE.md unter einer eindeutigen ID anlegen, z. B. `workstreams/tutorial-submit.md`.
Aufgabenstatus und Belege in dieser Datei pflegen; gemeinsam genutzte Registry nur bei tatsächlicher Änderung der Zuordnung aktualisieren.
Kein Chat hat automatisch exklusiven Besitz einer Baustelle. Eine veraltete „in Arbeit“-Angabe vor Übernahme prüfen.

## Integration

Ein Integrationsauftrag nennt ausdrücklich Quellbranches und Zielbranch. Nicht pauschal einen alten App-/Design-/Spielebranch als neue Gesamtbasis deployen. Kontrollieren, ob z. B. Uploads, PDF/Bilder, Secure-Pfad und Tutorialfunktionen weiterhin enthalten sind.
