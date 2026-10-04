# Aufgabe: GC-HANDOFF-03

- Aktualisiert (UTC): 2026-10-04
- Verantwortlicher Chat / Auftrag: GradeCrew-Wiederaufnahme nach Connection interrupted; bestehende Regeln ergänzen
- Chat-Bezeichnung / Link: aktueller Chat; Link unbekannt
- Arbeitszustand: zur Integration bereit; tatsächlichen PR-/CI-Stand frisch prüfen
- Aufgabenbranch: docs/chat-recovery-20261004
- Basiscommit: 1a9cdf679679fc831d2080cc7c2df6f9fe369a6e
- Integrationsziel: main
- Betroffene Dateien: START_HERE.md, AGENTS.md, docs/CHAT_CONTRACT.md, workstreams/TEMPLATE.md, docs/CHAT_RECOVERY.md, TODO.md, diese Übergabe
- Überschneidungen: zentrale Koordinationsdateien; aktuellen main vor Integration erneut prüfen

## Ziel und gewünschtes Verhalten
Martin kann einen unterbrochenen GradeCrew-Auftrag im bisherigen oder neuen Chat anhand gespeicherter Nachweise fortsetzen. Vorhandene Regeln werden ergänzt; kein zweites Aufgaben-/Release-System.

## Zwischenstand
- Bestehende Einstiegsdateien, Chat Contract, Vorlage, TODO, Registry, offene PRs und Branch-Zuordnung geprüft.
- Kopierter Billing-/PR86-Stand ist historisch: aktuelle TODO/STATE dokumentieren abgeschlossenen Pilot und getrennt gestoppten Homepage-Auftrag mit unbekanntem Provider-Ergebnis. Diese Aufgabe startet keinen dieser Aufträge.
- Ergänzt: Wiederaufnahmereihenfolge, Chat-/Task-Zuordnung, Checkpoints vor längeren Phasen, laufende IDs, Prüfung vor Wiederholung und Starttexte.
- Auf GitHub gesichert: Commit auf obigem Branch frisch ermitteln; Commit-ID wird nicht selbstreferenziell in diesen Commit geschrieben.
- Prüfungen: Dokumentationsdiff und relative Verweise vor Commit prüfen; Projektübergabe-CI am PR danach prüfen.
- Deployed / Gerätetest: nicht erforderlich für diese Dokumentationsänderung; keine Produkt-/Workflow-/API-Änderung.

## Offene Punkte
- ChatGPT-Projektanweisung muss Martin einmal in den Projekteinstellungen hinterlegen; kein Einstellungszugriff in dieser Aufgabe.
- Connection interrupted ist keine hinreichende Diagnose der Ursache. Keine Garantie, Verbindungsabbrüche verhindert zu haben.
- Aktive oder ungesicherte Arbeit anderer Chats wurde nicht pauschal übernommen.

## Wiederaufnahme nach Abbruch
- Letzter gesicherter Schritt: diese Dokumentationsänderung; Remote-Branch und PR über GitHub prüfen.
- Ungesicherte Produktänderungen: keine durch diese Aufgabe.
- Laufende Vorgänge: PR-CI nach Push; am konkreten Commit prüfen.
- Bezahlte KI-Aufrufe / Reservierungen: keine durch diese Aufgabe; fremde Reservierungen unverändert.
- Was vor Wiederholung prüfen: vorhandenen Branch/PR und Merge-Stand, dann keine doppelte Dokumentationsänderung.
- Nächster Schritt: PR-Prüfungen und frischen main-Abgleich prüfen, reine Dokumentation integrieren; danach Projektanweisung und kurze Wiederaufnahme-Anleitung an Martin liefern.
