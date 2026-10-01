# Aufgabenregister

Stand: 01.10.2026. Kein globales CURRENT_TASK.md: mehrere Aufgaben dürfen parallel laufen.
Die folgenden Branch-Spitzen wurden über GitHub gelesen; Deploy-Angaben sind gesondert gekennzeichnet.

| Baustelle | Branch | Übergabe / nächster Schritt |
|---|---|---|
| Website / gemeinsamer App-Webstand | feature/gradecrew-app-integration | `web-app.md` + `design-dashboard-v1.md`: Design-Dashboard V1 integriert bei `74eb2ec`; automatische Preview technisch verifiziert; visuelle Desktop-/Mobile-Abnahme offen |
| Prüfungsserver / Security | feature/secure-assessment-v1 | Branch-eigene AGENTS.md, GRADECREW_STATUS.md, DIAGNOSTICS_GUIDE.md und Security-Audit lesen; reale Freigaben offen |
| iPad-Lehrerapp | feature/shared-gradecrew-design-system | GRADECREW_APP_STATUS.md / native/GradeCrewTeacher/TESTFLIGHT.md lesen; Gerätestand bestätigen |
| Design Foundation | feature/gradecrew-design-foundation-v1 | `design-system.md`: Design Bible, Screen-Map und Crew-Library-Plan gesichert; zentrale Token-/Asset-Architektur wird im Webstand weiterverwendet |
| Dashboard Design V1 | feature/design-dashboard-v1 → integriert | `design-dashboard-v1.md`: Shared Tokens + erster Referenzscreen „Meine Tests“; Integrationscommit `74eb2ec`, CI/Mobile-Tutorial/Preview technisch grün; visuelle Abnahme offen |
| Spiele | lab/games-structure | Vor Änderungen vollständige eigene Übergabe einholen; nicht aus Website-Branch veröffentlichen |

## Neue Aufgabe

Kopie von TEMPLATE.md unter einer eindeutigen ID anlegen, z. B. `workstreams/tutorial-submit.md`.
Aufgabenstatus und Belege in dieser Datei pflegen; gemeinsam genutzte Registry nur bei tatsächlicher Änderung der Zuordnung aktualisieren.
Kein Chat hat automatisch exklusiven Besitz einer Baustelle. Eine veraltete „in Arbeit“-Angabe vor Übernahme prüfen.

## Integration

Ein Integrationsauftrag nennt ausdrücklich Quellbranches und Zielbranch. Nicht pauschal einen alten App-/Design-/Spielebranch als neue Gesamtbasis deployen. Kontrollieren, ob z. B. Uploads, PDF/Bilder, Secure-Pfad und Tutorialfunktionen weiterhin enthalten sind.
