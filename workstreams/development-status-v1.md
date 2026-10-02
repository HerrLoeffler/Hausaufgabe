# Development Status V1

## Ziel
GitHub als gemeinsame Control Plane für parallele GradeCrew-Chats/Agenten nutzen. Der Status wird live aus Git-/PR-Daten berechnet; manuell gepflegt werden nur Workstream-Zuordnung, Integrationsziel und Lifecycle-Zustand.

## Scope
- `workstreams/registry.json`: kleine maschinenlesbare Zuordnung aktiver/relevanter Baustellen.
- `tools/development_status.py`: read-only Branch-/PR-/Overlap-/Release-Audit.
- `.github/workflows/development-status.yml`: regelmäßige und manuelle Statusberechnung, Job Summary + Artefakt.
- `START_HERE.md` / `AGENTS.md`: neue Chats prüfen den Live-Audit vor paralleler Entwicklungsarbeit.

## Sicherheitsgrenzen
- Keine Branches, PRs oder Dateien automatisch löschen, mergen oder verschieben.
- Keine Deployments.
- Production wird nur aus `GRADECREW_STATE.json` gelesen, nie verändert.
- Überschneidungen sind Warnungen, keine Dateisperren.
- Unklassifizierte Branches bleiben sichtbar, bis sie fachlich zugeordnet wurden; sie werden nicht automatisch versteckt oder gelöscht.

## Status
- Branch: `feature/development-status-v1`
- Startbasis: `main@b71683d83f9a1a07c1262ed3002755c3e4f80b8d`
- PR: #46 → `main`
- Phase: `ci_green`, Integration nach finalem Zielbranch-Abgleich offen

## Nachweise

### Erster echter Live-Audit
- Development Status Run `37014441920`: **success**.
- Project handoff checks Run `37014441397`: **success**.
- Artefakt `gradecrew-development-status`, Artifact ID `11229385943`.
- Ergebnis: 16 aktive Baustellen, 19 zunächst potenzielle Dateiüberschneidungen, 0 veraltete kritische Branches, 8 Workstreams auf Staging, Production unverändert.
- Der Audit entdeckte selbstständig den parallel neu entstandenen PR #45 `feature/gemini-gateway-provider-v1` → `integration/ai-gateway-staging`, der zu Beginn dieser Arbeit noch nicht registriert war.

### Nachschärfung nach realen Daten
- Parent-/Child-/Integrationsketten werden nun von echten parallelen Dateiüberschneidungen getrennt.
- Backup-/alte `v2.*`-Branches erscheinen separat als Archivbestand statt als aktive unbekannte Arbeit.
- Gemini-Workstream und weitere belegte Related-Branches wurden registriert.
- Zweiter Development Status Run `37015296962`: **success**.
- Zweiter Project handoff checks Run `37015297255`: **success**.
- Artefakt `gradecrew-development-status`, Artifact ID `11229606962`.
- Ergebnis: 18 aktive Baustellen, **8 echte Parallel-Überschneidungen**, 0 veraltete kritische Branches, 8 Workstreams auf Staging, Production unverändert.
- Nicht klassifizierte Remote-Branches wurden von 36 auf 8 reduziert. Diese acht bleiben absichtlich sichtbar, bis sie fachlich triagiert sind.
- Bekannte Warnungen sind aktuell u. a. der alte Freitext-PR mit abweichendem Zielbranch sowie ein bereits integrierter Escape-Tutor-Fix mit weiterhin offenem PR. Das Audit meldet diese Widersprüche statt sie still zu korrigieren.

## Zielbranch-Abgleich
Während der Arbeit zog `main` von `b71683d...` auf `d7688fb...` weiter. Der Vergleich zeigt zwei neue Commits, deren Änderung ausschließlich `workstreams/admin-controls-auth-ready.md` betrifft. Der Development-Status-PR verändert diese Datei nicht; GitHub meldet PR #46 mergebar. Vor dem tatsächlichen Merge wird `main` trotzdem noch einmal frisch geprüft.

## Akzeptanzkriterien
1. Aktive/relevante Workstreams mit Branch, Ziel, SHA, ahead/behind und offenen PRs sichtbar. ✅
2. Potenzielle Dateiüberschneidungen zwischen parallelen aktiven Workstreams sichtbar und Branch-Ketten separat klassifiziert. ✅
3. Unregistrierte Remote-Branches und offene PRs ohne Registry-Zuordnung sichtbar. ✅
4. Staging-Zahl und Production-Status aus `GRADECREW_STATE.json` eingebunden. ✅
5. Kompakte Ampel-Zeile in GitHub Actions. ✅
6. Audit bleibt read-only und blockiert nicht automatisch normale Produktarbeit. ✅

## Offen / nächster Schritt
1. Finalen PR-Head erneut durch Development Status + Handoff CI prüfen.
2. Direkt vor Integration aktuellen `main` und Mergeability frisch prüfen.
3. Bei grünem Stand PR #46 kontrolliert nach `main` integrieren.
4. Danach den automatisch auf `main` laufenden Development Status als ersten kanonischen Control-Plane-Lauf verifizieren.
5. Die verbliebenen unklassifizierten Branches später einzeln triagieren; keine automatische Löschung.
