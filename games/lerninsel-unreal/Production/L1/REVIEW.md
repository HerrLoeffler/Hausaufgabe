# Unabhängiger L1-Review und Entscheidungen

Spiel: Lerninsel. Reviewer l1_review, read-only, Base a390aa0..d5e6ed45aa162267dde11a7bb19aea7b770ebe2a. Kein zweiter Review, keine schreibende Parallelproduktion.

Ergebnis: kleiner Actor-Placement-Fix/Importer stimmen überein; reale PIE-Kamera, Bounds/Kollision und Gate-Sweeps passend. Zeitweilige seitliche Kulisse klar von kompletter Acht-Gebiete-Integration abgegrenzt. Kein Merge-/Deployurteil.

Ein wichtiger P2-Befund angenommen: alte checked-in Reports konnten einen Testlauf ohne ausgeführte Tests fälschlich als erfolgreich erscheinen lassen. Echt reproduziert mit MissingTestForFreshnessRegression: Engine meldete No automation tests matched, schrieb kein neues JSON und beendete Queue; alter Bericht2026.10.10-11.01.54 blieb grün. Vorherige echte Läufe dadurch nicht widerlegt.

Ein Fixdurchgang: beide Testwrapper erzeugen jetzt ein separates frisches mktemp-Reportverzeichnis. validate_automation_report.py fordert exakt erwartete Namen/Anzahl, Success/0Errors, inProcess/notRun/failed=0 und passende Successzählung. Erst danach wird die veröffentlichte JSON-Kopie erneuert. Kein altes JSON aus Reports/ als Eingabe.

Frische negative Gegenprobe: test_world_preview.sh MissingTestForFreshnessRegression verweigert Erfolg mit Exit1 / No readable fresh automation report. Alter grüner Report kann nicht übernommen werden. Bestehende erfolgreiche Reports werden vom Validator korrekt akzeptiert; finaler kompletter realer Wrapperlauf2026.10.10-11.10.38UTC besteht mit231portablenChecks und5UE-Tests,0Fehler/0Warnungen (eigenerTestbericht; frühereEngine-Startup-Selbstmeldungen bleiben abgegrenzt).

Zurückgestellte Aspekte ausdrücklich offen: volle Gebietszuordnung/Kulissenkollision/Rätsel5–8, ununterbrochener Lauf aller Wege, Kinder-/iPad-/Browser-/Final-Artabnahme. Aus L1-Scopegründen keine Art-/Engineproduktion. TODO/Registry im gemeinsamen main ist Owner-Nachtrag; keine Speicherung dort behauptet. Epicidevice-ARMwarnungen bleiben Umgebungslimit.
