# GC-REMY-POINTS-20261028 — wählbare Punktzahl bei Remy

**Auftrag:** Martin wünscht einen ausführlichen Umsetzungsplan für feste Gesamtpunkte oder automatisch aus Einzelaufgaben ermittelte Gesamtpunkte. Ausführender Fachchat: GC · Remy – Testplanung & präzise Vorgaben (Thread `01a179f2-5821-7d52-a28f-87afcc93fb51`). Planung, keine Implementierung.

**Gesicherter Stand (28.10.2026):** Dokumentationsbranch `docs/remy-points-mode-plan-20261028`, Spec `docs/superpowers/specs/2026-10-28-remy-points-mode-design.md`, Plan `docs/superpowers/plans/2026-10-28-remy-points-mode.md`. Ausgangs-main bei Branchanlage nach `0d28149286bbff3eec5a5a1a0a884e9d8d47a27a` gelesen. Live-Hosting `89aaea9e22912d37b1d5472f29a8f7147e6003e3` aus öffentlichem release.json; dessen Generator-Dateien blobidentisch mit dem belegten Functions-Release `26ed109c33145880d94cbf64bfa40c5e25251d68` (PR362, aktive vier Functions laut Releaseübergabe). Kein neuer direkter Cloud-Functions-Snapshot in diesem Chat.

**Iststand:** Festes `points` wird in `functions/index.js` geprüft; `test-batches.js` gibt das Budget weiter; `repair-test.js` gleicht abweichende Summe rechnerisch aus; `validation.js` prüft am Ende die Zielsumme. 20 Aufgaben/35 Punkte werden exakt erzwungen, aber der Ausgleich beweist keine didaktische Angemessenheit einzelner Punktwerte. Der automatische Modus existiert noch nicht.

**Abgrenzung:** Nur Dokumentation erstellt. Kein Produktcode, Test, PR-Merge oder Deployment. Bestehender Remy-Difficulty-Candidate `fix/remy-demand-transfer-20261026@7a405516` bleibt separat und ist nicht live. Editor-/Audio-Writer `01a15f06-837c-73b3-93fa-0d07a8104d3a` überschneidet `app.js` und Generator-Dateien; vor Umsetzung aktuellen Writer und Integrationsziel klären. Keine Provideraufrufe oder Schülerdaten.

**Nächster ausführbarer Schritt:** Martin prüft Spec und Plan. Danach aktuelle Branch-/PR-/Functions-Lage erneut lesen, Writer für die betroffenen Dateien abstimmen und auf frischem isoliertem Aufgabenbranch Task 1 beginnen. Production nur mit ausdrücklicher Freigabe.
