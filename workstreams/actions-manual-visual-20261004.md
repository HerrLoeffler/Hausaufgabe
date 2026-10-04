# Aufgabe: GC-ACTIONS-COST-01 / Amazonas

- Aktualisiert (UTC): 2026-10-04
- Aufgabenbranch: `fix/actions-manual-visual-20261004`
- Basiscommit: `4cddc785b7e0058cb74d63039f04e882ac221b61`
- Integrationsziel: `prototype/escape-expedition-visual-masterpiece-v1` (Produkt-PR #83).
- Betroffene Datei: `.github/workflows/escape-expedition-preview.yml`.
- Änderung: ausschließlich push-Trigger entfernt, workflow_dispatch/Testkörper/Preview-Ziel erhalten.
- Nachweis: YAML/Dispatch-only-Regel lokal geprüft; neuer App-/CI-/Deploy-/Gerätenachweis offen.
- Gesichert: Commit dieses eigenen Folgebranches; aktuellen SHA/PR frisch lesen.
- Abhängigkeit: Kontroll-PR `fix/actions-cost-policy-20261004` registriert den manuellen Einstieg auf main. Danach Actions → Escape Expedition Visual Masterpiece Preview → Run workflow auf main.
- Überschneidung: PR #83 Workflow bereits mit Concurrency und anderen Workflow-Ausschlüssen; diese erhalten.
- Nächster Schritt: nach öffentlicher Umstellung exakte CI prüfen und in den Visual-Branch integrieren. Kein Production-Deploy; ein manueller Preview-Start ist ein eigener bewusster Meilenstein.
- Wiederaufnahme: Workflow im aktuellen PR-Head vergleichen; fehlender Remote-Test ist nicht durch lokale Strukturprüfung ersetzt.

Fortsetzung nach public: vollständiger Checkout erlaubt erstmals lokale
Syntax-/Test-/Build-Prüfung des Visual-Heads. 33/35 Tests bestanden zunächst;
zwei ältere Quelltextverträge waren veraltet: Jeep nutzt jetzt einen lokalen
Alias und die Visual Bible beschreibt die neue Retro-Overworld statt der alten
Camp-Referenz. Jeep-Checkpoint wird jetzt an sechs echten Update-Szenarien
geprüft; Dokumentationsvertrag folgt der vorhandenen aktuellen Bible.
Produktdateien und freigegebene visuelle Richtung unverändert. Neuer exakter
Remote-Nachweis nach diesem Folgecommit erforderlich.
