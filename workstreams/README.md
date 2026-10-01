# Aufgabenregister

Stand: 01.10.2026. Kein globales CURRENT_TASK.md: mehrere Aufgaben dürfen parallel laufen.
Die folgenden Branch-Spitzen wurden über GitHub gelesen; Deploy-Angaben sind gesondert gekennzeichnet.

| Baustelle | Branch | Übergabe / nächster Schritt |
|---|---|---|
| Website / gemeinsamer App-Webstand | feature/gradecrew-app-integration | `web-app.md`: gc28-Preview vorhanden; lokale gc29-Arbeit noch sichern |
| Prüfungsserver / Security | feature/secure-assessment-v1 | Branch-eigene AGENTS.md, GRADECREW_STATUS.md, DIAGNOSTICS_GUIDE.md und Security-Audit lesen; reale Freigaben offen |
| iPad-Lehrerapp | feature/shared-gradecrew-design-system | GRADECREW_APP_STATUS.md / native/GradeCrewTeacher/TESTFLIGHT.md lesen; Gerätestand bestätigen |
| Design Foundation | feature/gradecrew-design-foundation-v1 | `design-system.md`: Design Bible, Screen-Map und Crew-Library-Plan gesichert; vor UI-Änderungen mit Web-App- und Shared-Design-Branch integrieren |
| Spiele | lab/games-structure | Vor Änderungen vollständige eigene Übergabe einholen; nicht aus Website-Branch veröffentlichen |

## Neue Aufgabe

Kopie von TEMPLATE.md unter einer eindeutigen ID anlegen, z. B. `workstreams/tutorial-submit.md`.
Aufgabenstatus und Belege in dieser Datei pflegen; gemeinsam genutzte Registry nur bei tatsächlicher Änderung der Zuordnung aktualisieren.
Kein Chat hat automatisch exklusiven Besitz einer Baustelle. Eine veraltete „in Arbeit“-Angabe vor Übernahme prüfen.

## Integration

Ein Integrationsauftrag nennt ausdrücklich Quellbranches und Zielbranch. Nicht pauschal einen alten App-/Design-/Spielebranch als neue Gesamtbasis deployen. Kontrollieren, ob z. B. Uploads, PDF/Bilder, Secure-Pfad und Tutorialfunktionen weiterhin enthalten sind.
