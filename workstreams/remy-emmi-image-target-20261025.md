# GC-WEB-REPAIR-20261007 / GC-CREW-AI-02 — echte Aufgabenbilder

## Auftrag und Zuständigkeit
25.10.2026: ausdrücklichen Bildwunsch bei Remy und Emmi als tatsächlichen Medienzielzustand behandeln. Bestehende Bilder/Locks/Audio/Undo/Konten/Abgaben erhalten. Keine neuen kostenpflichtigen Modellversuche, kein Schul-Live-/Rules-/Plugin-Deploy. Ausführender bisheriger Web-/Cloudchat; Chat-Link unbekannt. Profil security/complex high angefordert; tatsächliches Modell/Effort/Usage unknown.

## Geprüfter Ausgangspunkt
- Produktquelle und tatsächliches gradecrew.de release.json:9497e756ed2defb4da6b05773146a19929101b3c, gc45-rc1. Test2026 separat a5a0005e/gc44.
- Eigener isolierter Checkout; Branch fix/remy-emmi-image-target-20261025, Ziel feature/gradecrew-app-integration. Keine fremden Arbeitsbäume geändert.
- Main-Einstieg/Regeln/STATE/TODO/Registry/Vertrag gelesen, Development Status40217348546 success. Keine offene parallele Bildreparatur gefunden.
- Analyticschat01a15f1d zuletzt completed: Feedbacklernen bereits in9497 integriert. Kein aktiver app.js-Schreiber in der gelesenen Momentaufnahme; vor Integration erneut prüfen.
- Baseline:11/11 vorhandene Emmi-Server-/Bridgeprüfungen grün. Kein Bildprovider aufgerufen.

## Reproduzierbare Lücken im vorhandenen Code
- functions/lib/whole-test-revision.js: Schema allowImages=false, Systemprompt verbietet mediaIntent außer none, finalize setzt alle Bildabsichten zurück. Emmi kann neue Bilder bisher grundsätzlich nicht liefern.
- emmi-whole-test-revision.mjs: lockedCount wird pauschal als Bildaufgaben geschützt bezeichnet, obwohl app.js auch Audioaufgaben sperrt.
- functions/lib/ai-job.js: fehlgeschlagene Bilder werden Textbeschreibungen, mediaStatus=omitted. processAiTestJob markiert normale Erstellung trotzdem ready/Entwurf fertig; tatsächliche Bildvollständigkeit fehlt als Erfolgsbedingung.
- Originalentwurf nur lokal laut Screenshot; kein Zugriff/keine Änderung behauptet. Ursache seiner ursprünglichen Remy-Bildfehler unbekannt, kein kostenpflichtiger Versuch wiederholt.

## Nächster Schritt
Regressionsfälle für explizite Gesamt-/Zusatz-/Ersetzungswünsche und echte Medienvollständigkeit zuerst rot nachweisen; vorhandenen geprüften Generator und begrenzte Quoten wiederverwenden. Stabile Medienoperationen und gezielter Retry vor Integration nötig, damit Reload/Doppelklick keine Doppelgenerierungen auslösen. Plan siehe docs/superpowers/plans/2026-10-25-remy-emmi-image-target.md.

Status: Diagnose/Tests in Arbeit, branch_only. Neuer Regressionstest tatsächlich ROT: Wunsch insgesamt2 und zwei konkrete Medienabsichten → finalize liefert0 statt2;7 bestehende Servertests weiterhin grün. Dieser Checkpoint enthält bewusst den reproduzierenden roten Test, noch keinen Produktfix. Kein neuer Deploy, keine Nutzertest- oder Abschlussbehauptung. Neuer Testzweig hat kein TODO.md; zentrale TODO-Zeile später über getrennten kleinen Main-Koordinationspatch fortführen, keine alte globale Datei in den Produktzweig kopieren.
