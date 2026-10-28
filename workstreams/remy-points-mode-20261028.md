# GC-REMY-POINTS-20261028 — Auto-Punkte bei Remy

**Auftrag und Entscheidung:** Martin hat am 28.10.2026 den kompakten Auto-Schalter, Blau für aktiv, einen Strich im Punktefeld, Auto als Standard für neue Tests und den Livegang auf gradecrew.de bestätigt. Der bestehende feste Modus bleibt wählbar; ein manuell eingegebener Punktwert bleibt beim Umschalten erhalten.

## Erreichter Stand

- **Live:** gradecrew.de / Firebase `hausaufgabe-staging` liefert laut öffentlichem `release.json` den exakten Release-Commit `21d1e4b1714b70e69a75185a20908652621c96b7` (28.10.2026). Der vollständige Remote-Dateihashvergleich des Release-Builds war erfolgreich: `Remote assets match 2.3.1-gc45-rc1 (21d1e4b1)`.
- **Live-Funktionen:** Ausschließlich `ai:generateTest`, `ai:startAiTestJob` und `ai:processAiTestJob` wurden vor Hosting aktualisiert. Alle drei sind in `europe-west1` ACTIVE mit identischem Hash `07048e43485313dd34d9133409ac9ad268bd4e7d`; vorher `d92cdfac2de48721a8908d77410107914e222ce2`. Das Altprojekt `hausaufgabe-40294` blieb unangetastet.
- **Getrenntes Staging:** Dieselben drei Funktionen sind in `gradecrew-staging-2026` ACTIVE, Hash `ccdd33ba174511a4a8b2da732123b39a5b990cd0`. Die befristete Hosting-Vorschau `https://gradecrew-staging-2026--gc-remy-auto-20261028-4amxp99p.web.app` zeigt den exakten Live-Release-Commit `21d1e4b1`; die kanonische Staging-Site wurde nicht überschrieben.
- **Code und Prüfung:** [Live-Release PR #377](https://github.com/HerrLoeffler/Hausaufgabe/pull/377) basiert auf dem zuvor live veröffentlichten `89aaea9e`; [Integrations-PR #376](https://github.com/HerrLoeffler/Hausaufgabe/pull/376) trägt dieselbe Änderung auf dem neueren Integrationszweig. Damit wurden noch gehaltene Wilma-Änderungen nicht beiläufig live veröffentlicht. Auf dem exakten Release-Commit: Functions 353/353, Syntax/Lint, UI-Gesamttests 24/24; GitHub-Actions-Run `40739070656` mit Node-22-Tests und Chromium/WebKit-Public-Entry-Layout erfolgreich. Unabhängiger Review ohne verbleibende Findings; sein Reparaturbefund wurde korrigiert und erneut geprüft.

## Punktevertrag

Neue freie Remy-Tests senden `pointsMode: "auto"` ohne `points`. Remy vergibt pro Aufgabe gültige 0,5er-Punkte nach bewertbaren Antworten und Lösungsschritten; auch nach einer Ersatzaufgabe bleibt deren neu vergebener Punktwert erhalten. Die Endsumme wird aus den fertigen Aufgaben gebildet. Alter Client/Job ohne Modus sowie Varianten bleiben bei festen Punkten. Hosting wurde erst nach dem nachgewiesenen Live-Funktionsupdate veröffentlicht, weil der alte Server eine fehlende Zielsumme sonst still als 20 interpretiert hätte.

## Offen

Eine Lehrkraft sollte nach einem echten erzeugten Entwurf prüfen, ob die KI-Gewichtung bei gemischten Aufgaben didaktisch passend ist, und sie bei Bedarf vor Veröffentlichung ändern. Dieser menschliche Qualitätsschritt ist kein automatischer Test. Die beiden PRs bleiben als Review-/Integrationsnachweise offen; die Dokumentations-PR #372 enthält den aktualisierten Plan und Prototyp.
