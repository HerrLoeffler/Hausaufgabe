# GC-GAMES-REVIEW-02 – Escape v0.6 Review

02.10.2026. Basis `feature/escape-room-mvp-v1@e8d75385cc91193f24036dfccb7f1f7173c8ed3e`. Remy erstellt, Coco begleitet; bestehende Shared-Assets unverändert.

## Korrekturen
- Tutor-Schutz aus PR #27 übernommen: Inflight-Deduplizierung, kontextabhängiger begrenzter Cache, mathematische Zeichen erhalten, Abbruch/Timeout und lokaler Fehlerpfad. Keine zweite Kosten-/KI-Infrastruktur.
- Standalone-Remy-Vorschau bleibt nach dem ersten Klick bedienbar. Ready-Events und Doppelklicks starten während eines laufenden Auftrags keinen zweiten Aufruf. Geänderte Eingaben/Reset machen alte Ergebnisse ungültig.
- Haupt- und Transferfragen verwenden dieselbe Typ-/Bildprüfung. Fehlendes Boolean wird nicht falsch; null/leer/bool wird nicht Zahl 0; manuell zu prüfender Text und nicht unterstützte Transfers abgelehnt. Doppelte Auswahlpositionen durch Zahl-/Stringmischung ausgeschlossen.
- Transfer-Auswahltexte bleiben sichtbar. Zahlen-Transfer übernimmt Toleranz und Dezimalkomma; leere Antwort zählt nicht als Fehlversuch. Änderungen der numerischen Transferlösung aktualisieren den erwarteten Wert.
- Diktat: letztes finales Ergebnis nach Stop erhalten; veraltete Sessions können weder neue Diktate noch manuelle Änderungen überschreiben. Schließen, Starten und Generieren beenden das Mikrofon. Konstruktor-/Browserfehler bleiben bedienbar.

## Fachliche Qualitätslücke – nicht erledigt
Der aktuelle Escape-Generator erzeugt 8 Haupt- plus 8 Transferfragen, aber keine echten fachlichen Lernhilfe-Pakete: makeSupport erzeugt allgemeine Vorlagen. UI und vorbereitete Pakete kennzeichnen diesen Prüfbedarf nun ausdrücklich. Das ist KEIN fachlicher Qualitätsnachweis. Vor echter Hauptproduktfreigabe denselben bestehenden Backend-Job um einen versionierten, validierten didaktischen Vertrag erweitern: konkreter Hinweis, Erklärung, Fehlvorstellung, aktiver Lernschritt, gebundene Transferfrage. Keine KI pro Schülerklick; Paket einmal vorbereiten und von Lehrkraft prüfen. Generierung und fachliche Validierung gemeinsam budgetieren. Transferpaarung benötigt explizite IDs/Referenzen statt nur unkontrolliertem Arrayplatz.

## Integration / Prüfung
PR #27 ist inhaltlich enthalten; nicht zusätzlich blind darüber mergen. 39 Escape-Verhaltenstests lokal grün (bestehender Gesamtdurchlauf plus neue Fälle); CI/isolierter Build für neuen Commit nach Push. Kein eigener Staging-Deploy und keine echte KI-/Mikrofon-/Geräteabnahme behaupten. Isolierter Lab-Preview hat weiterhin keine echte GradeCrewEscapeAiBridge; keine zweite Anmeldung/kein offenes KI-Backend eingeführt.

