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
- Ursprungsbranch: `feature/development-status-v1`
- PR: #46 → `main`
- geprüfter PR-Head: `89a527d03f4b6f1856f1ed1311adb3fd902fe238`
- Merge-Commit: `65785c0455daf1f6e5646843fccfe4b2f3fcfb59`
- Phase: **integrated**
- Deployment: nicht anwendbar; dieses Workstream ändert nur Repo-Koordination/CI und deployt keine App oder Cloud-Ressource.
- Production: unverändert.

## Nachweise

### Erster echter Live-Audit
- Development Status Run `37014441920`: **success**.
- Project handoff checks Run `37014441397`: **success**.
- Artefakt `gradecrew-development-status`, Artifact ID `11229385943`.
- Ergebnis: 16 aktive Baustellen, 19 zunächst potenzielle Dateiüberschneidungen, 0 veraltete kritische Branches, 8 Workstreams auf Staging, Production unverändert.
- Der Audit entdeckte selbstständig den parallel neu entstandenen PR #45 `feature/gemini-gateway-provider-v1` → `integration/ai-gateway-staging`, der zu Beginn dieser Arbeit noch nicht registriert war.

### Nachschärfung nach realen Daten
- Parent-/Child-/Integrationsketten werden von echten parallelen Dateiüberschneidungen getrennt.
- Backup-/alte `v2.*`-Branches erscheinen separat als Archivbestand statt als aktive unbekannte Arbeit.
- Gemini-Workstream und weitere belegte Related-Branches wurden registriert.
- Development Status Run `37015296962`: **success**.
- Project handoff checks Run `37015297255`: **success**.
- Artefakt `gradecrew-development-status`, Artifact ID `11229606962`.
- Ergebnis: 18 aktive Baustellen, 8 echte Parallel-Überschneidungen, 0 veraltete kritische Branches, 8 Workstreams auf Staging, Production unverändert.
- Nicht klassifizierte Remote-Branches wurden von 36 auf 8 reduziert. Diese bleiben sichtbar, bis sie fachlich triagiert sind.

### Finaler PR-Gate
- Finaler PR-Head `89a527d...`.
- Development Status Run `37015584696`: **success**.
- Project handoff checks Run `37015584856`: **success**.
- Vor Merge war `main@d7688fb...`; die seit Start hinzugekommenen Änderungen überschnitten sich nicht mit den sieben PR-Dateien.
- PR #46 wurde exakt mit dem geprüften Head gemergt.

### Kanonischer Lauf auf main
- Der erste `main`-Push-Lauf wurde durch den eigenen Concurrency-Guard abgebrochen, weil unmittelbar parallel weitere Repo-Arbeit lief. Dadurch wurde nichts verändert.
- Direkt danach lief die Leitstelle auf dem bereits weitergezogenen `main@dbc1d361804b0b70df78a59ba758cfdb2afef145` erfolgreich: Development Status Run `37015720282` **success**.
- Artefakt: `gradecrew-development-status`, Artifact ID `11229682364`.
- Ergebnis dieses kanonischen Laufs: **18 aktive Baustellen · 6 echte Parallel-Überschneidungen · 0 veraltete kritische Branches · 8 auf Staging · Production unverändert**.
- Der Lauf sah bereits die parallel weitergezogene iOS-Arbeit. Damit ist belegt, dass die Control Plane nach Integration echte zeitgleiche Repo-Änderungen erfasst.
- `main` zog unmittelbar danach weiter; das ist normal und soll durch weitere Push-/PR-/Stundenläufe automatisch erfasst werden.

## Bekannte aktuelle Hinweise
- Freitext-PR #11 hat noch einen alten, von der Registry abweichenden Zielbranch.
- Escape-Tutor-Fix ist als integriert erfasst, PR #27 steht aber noch offen.
- Einige Remote-Branches sind noch nicht klassifiziert. Sie werden absichtlich gemeldet und niemals automatisch gelöscht.
- Echte parallele Dateiüberschneidungen sind Warnungen für den nächsten Integrationsschritt, keine Sperren.

## Akzeptanzkriterien
1. Aktive/relevante Workstreams mit Branch, Ziel, SHA, ahead/behind und offenen PRs sichtbar. ✅
2. Potenzielle Dateiüberschneidungen zwischen parallelen aktiven Workstreams sichtbar und Branch-Ketten separat klassifiziert. ✅
3. Unregistrierte Remote-Branches und offene PRs ohne Registry-Zuordnung sichtbar. ✅
4. Staging-Zahl und Production-Status aus `GRADECREW_STATE.json` eingebunden. ✅
5. Kompakte Ampel-Zeile in GitHub Actions. ✅
6. Audit bleibt read-only und blockiert nicht automatisch normale Produktarbeit. ✅
7. Erfolgreicher kanonischer Lauf auf `main` nach Integration. ✅

## Nächster sinnvoller Ausbau
- Die verbliebenen unklassifizierten Branches einzeln triagieren; keine automatische Löschung.
- Später optional: echte Parallel-Konflikte nach Kritikalität gewichten (z. B. Build-/Rules-/Auth-Dateien höher als reine Assets).
- Später optional: einen kompakten, direkt verlinkbaren Status-Badge/Report für `main` ergänzen. Die GitHub-Actions-Zusammenfassung bleibt die kanonische Live-Sicht.
