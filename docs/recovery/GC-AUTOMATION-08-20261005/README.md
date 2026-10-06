# GC-AUTOMATION-08: geretteter lokaler Zwischenstand

Diese Sicherung bewahrt den unvollständigen Arbeitsstand von Main CODEX (w), ohne ihn zu aktivieren. Originalbranch/PR: `docs/guardian-admission-profiles-20261004`, #126. Remote beim Abgleich `65a6496da56de01a491e46d44f8a60f821265509`; lokaler HEAD `9a3d839` mit vier gegenüber diesem Remote zusätzlichen Commits (einschließlich Merge-/bereits inhaltlich übertragener Geschichte).

- `local-commits.patch`: exakter kumulierter Diff Remote → lokaler HEAD für fünf Dateien, einschließlich Lifecycle-/Profilbindung und Task-2-Übergabe.
- `test_games_static.py.txt`: unveränderte, bisher ungetrackte Testdatei; als Text archiviert, weil der benötigte Validator `tools.automation.games_static` noch fehlt. Dies ist ein offener TDD-Schritt, keine fertige Implementation.
- `commit-history.txt`: lokale Commit-Metadaten zur Zuordnung. Der ursprüngliche Checkout und dessen Commits bleiben erhalten.

Wiederaufnahme: aktuellen PR126-Head prüfen; bei unverändertem Stand Patch mit `git apply --check` prüfen und nur fehlende Änderungen übernehmen. Testdatei anschließend gezielt an ihren Originalpfad zurückführen. Keine pauschale Wiederholung von Task 1/2. Nächster Implementation-Schritt ist Task 3 (vertrauenswürdige Games-Paketprüfung, Fixtures und CI).

Historisch meldet Task 2 110 bestandene Automation-Tests; in dieser Sicherung noch nicht erneut geprüft. Games bleiben vom Hauptprodukt getrennt, Profile standardmäßig aus. Kein Paid-Call, keine Reservation, kein Deploy und kein Reset wurden durch diese Sicherung ausgelöst. Nur das Sicherungsformat wurde gewählt; keine Codekorrektur vorgenommen.
