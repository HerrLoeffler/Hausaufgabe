# GC-AI-ROUTING-02 / GC-AI-OBS-02

Stand 2026-10-02. Branch `feature/ai-orchestration-v1`, Basis `890a01180ef7bfb41daa8285c3b71a0c20a7bb12`.

Auftrag: automatische, qualitätsgebundene Modellauswahl pro Aufgabe; getrenntes begrenztes Evaluationsbudget, nachvollziehbare Modell-/Kostenstatistik; gezielter Architekturcheck. Automatische Wechsel zwischen qualifizierten Routen sind ausdrücklich gewünscht. Keine Bestätigung pro Nutzeranfrage.

Release-Stufe: branch_only, Implementierung läuft. Keine neuen realen Modellnachweise oder Deployments.

Dateien: ai-gateway/**, shared/intelligence/**, tools/evaluation/**, eigene Adminansicht und Tests. Bestehende Firebase-Aufrufer werden erst mit erhaltenen Auth-/Quota-/Schema-Grenzen angebunden. Keine parallele Telemetriedatenbank für Inhaltsdaten.

Prüffunde bisher: fehlende Provider-Capability-Grenze; freitextbasierte Gateway-Fehlerlogs; WIF-Tokenbeschaffung ohne Timeout; Legacy-Firestore-Regeln bleiben als Default referenziert; Escape-Tutor ohne Fehler-Fallback/Anfrage-Deduplizierung und Cache nur nach Frage-ID. Scope für sofortige Fixes: Gateway + separate kleine Games-Korrektur, Security-Cutover braucht bestehende Gates.

Nächster Schritt: ausführbare Orchestrierung mit signierter Route-Konfiguration, transaktionaler Budget-/Anfrage-Sperre und inhaltsfreien Entscheidungsbelegen; lokale/CI-Tests. Danach Übergabe aktualisieren.
