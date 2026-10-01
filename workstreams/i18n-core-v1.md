# Aufgabe: GC-I18N-02 – i18n-Core V1

- Aktualisiert (UTC): 2026-10-01T22:50:00Z
- Verantwortlicher Chat / Auftrag: Internationalisierung; ersten rückwärtskompatiblen i18n-Code bauen, ohne bestehende Oberfläche großflächig umzuschreiben.
- Aufgabenbranch: `feature/i18n-core-v1`
- Basiscommit: `74eb2ec08e81315875abfc4b1ae052d9f78797eb` (`feature/gradecrew-app-integration`)
- Betroffene Dateien: `shared/i18n/*`, diese Übergabe.
- Überschneidungen: Web-App/Design, Secure Assessment, KI/Prompts, Crew/Sprache, native Apps. Diese erste Stufe bindet keinen dieser Bereiche aktiv um.

## Ziel und gewünschtes Verhalten

Ein isolierter Internationalisierungs-Core soll die späteren Sprach-/Regionsverträge festlegen, während GradeCrew sichtbar und funktional vollständig deutsch bleibt. Kein Big-Bang-Refactor von `app.js` oder bestehenden Prüfungs-/Security-Pfaden.

## Implementiert

- `de-DE` bleibt einzige aktive UI-Locale.
- BCP-47-Locale-Normalisierung.
- Deterministische UI-Priorität: Nutzer -> Schule -> Gerät -> Default.
- Getrennte Felder für UI-, Inhalts- und Bewertungssprache.
- Bildungskontext und Zeitzone als separate Kontextwerte.
- Reproduzierbarer Locale-/Policy-Snapshot für veröffentlichte Prüfungen.
- Locale-Formatierung über `Intl`.
- Striktes Zahlenparsing: mehrdeutige Dezimal-/Tausendertrennzeichen werden abgelehnt statt geraten.
- Dependency-free; noch keine Festlegung auf eine konkrete Übersetzungsbibliothek.

## Nicht verändert

- Kein bestehender UI-Text wurde extrahiert.
- `app.js`, `index.html`, Schüleransicht, Security, Firestore und KI-Prompts wurden nicht verändert.
- Keine zweite sichtbare Sprache.
- Kein Datenbank-Schema migriert.
- Kein Deployment.

## Prüfungen

Lokaler Node-Test des identischen Core-/Testinhalts: `node --test i18n-core.test.mjs` -> 6/6 Tests grün. Nach Push zusätzlich GitHub-CI/PR-Checks prüfen; lokaler Test ist kein Deploy- oder Gerätetest.

## Akzeptanz für diese Stufe

- Bestehendes Verhalten bleibt unangetastet, weil der Core noch nicht in Laufzeitpfade eingebunden ist.
- Die Foundation kann UI/Inhalt/Bewertung getrennt repräsentieren.
- Snapshot ist explizit und versionierbar.
- Mehrdeutige Zahleneingaben werden nicht still fehlinterpretiert.
- Der nächste Schritt kann klein und screenbezogen erfolgen.

## Nächster konkreter Schritt

Nach CI-/Review-Abnahme einen kleinen deutschen Message-Catalog (`de-DE`) hinzufügen und **nur eine risikoarme gemeinsame Oberfläche** auf `t(key)` umstellen. Sichtbarer Text muss byte-/inhaltlich gleich bleiben. Noch nicht `app.js` vollständig migrieren.

## Status

- Lokal geprüft: ja, isolierter Node-Test 6/6 grün.
- Auf GitHub gesichert: ja, Branch `feature/i18n-core-v1`.
- In Integrationsbranch integriert: nein.
- Staging deployed: nein.
- Gerätetest: nein.
- Production: unverändert.
