# Aufgabe: GC-I18N-03 – Englisch als zweite GradeCrew-UI-Sprache

- Aktualisiert (UTC): 2026-10-02
- Auftrag: Nach erfolgreichem deutschem i18n-Paritätstest Englisch als zweite UI-Sprache einführen.
- Branch: `feature/i18n-english-ui-v1`
- Basis: `feature/gradecrew-app-integration@a61759db01e41f19b7d34e6eb0e88bac42484c1e`
- Rückfallreferenz: `backup/staging-pre-english-ui-2026-10-02` auf derselben Basis.
- Production: ausdrücklich nicht verändern.

## Produktregel

UI-Sprache, Prüfungs-/Inhaltssprache und Bewertungssprache bleiben getrennt. Ein Wechsel Deutsch ↔ Englisch darf niemals Titel, Aufgaben, Lösungen, Schülerantworten, Namen oder bereits veröffentlichte Prüfungsinhalte übersetzen oder mutieren.

## Geplanter Umfang

- `en-GB` als zweite aktivierbare UI-Locale neben `de-DE`.
- Persistenter Sprachschalter, auch vor Login und im Secure-Student-Pfad.
- Reversibler DOM-Wechsel Deutsch ↔ Englisch ohne Neuladen.
- Schutzgrenzen für Assessment-/Nutzerinhalte.
- Englischer semantischer Katalog plus Quelltext-/Musterübersetzungen für bestehende UI.
- Locale-gerechte Zahl-/Datumsausgabe bleibt über `Intl`.
- Build-/CI-/Regressionstests erweitern.
- Keine automatische Übersetzung von Prüfungen.
- Keine Änderung deutscher fachsprachlicher Validatoren oder Bewertungsregeln durch diesen Schritt.

## Überschneidungen

PR #25 (`feature/quality-routing-contract-v1`) enthält zukünftige Voice-/Locale-/Qualitätsverträge, ist aber noch isoliert. Dieser Workstream bleibt kompatibel zu den dort getrennten Kontexten und integriert PR #25 nicht blind.

## Status

- branch_only
- Codeumsetzung läuft.
- CI: offen.
- Integration: offen.
- Staging/Preview: offen.
- Nutzertest: offen.
- Production: unverändert.
