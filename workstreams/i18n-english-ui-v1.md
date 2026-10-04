# Aufgabe: GC-I18N-03 – Englisch als zweite GradeCrew-UI-Sprache

- Aktualisiert (UTC): 2026-10-04
- Auftrag: Englisch als zweite UI-Sprache einführen und nach dem ersten realen Preview-Test fachlich/visuell härten.
- Aktueller Polish-Branch: `feature/i18n-bilingual-polish-20261004`
- Polish-Basis: `feature/gradecrew-app-integration@fb88dfa7b7cbad49f93b4fc47e883c92fdcf0d41`
- Frühe Implementierung: `feature/i18n-english-ui-v2`, über PR #96 in die App-Integration übernommen.
- Aktueller Polish-PR: #131 gegen `feature/gradecrew-app-integration`.
- Production: ausdrücklich unverändert lassen.

## Produktregel

UI-Sprache, Prüfungs-/Inhaltssprache und Bewertungssprache bleiben getrennt. Ein Wechsel Deutsch ↔ Englisch darf niemals Titel, Aufgaben, Lösungen, Schülerantworten, Namen oder bereits veröffentlichte Prüfungsinhalte übersetzen oder mutieren.

Eine spätere Übersetzung eines bestehenden Tests ist nur als ausdrückliche Lehreraktion denkbar; sie ist nicht Teil des normalen UI-Sprachwechsels und nicht Teil dieses Workstreams.

## Belegter Stand vor diesem Polish-Pass

- `de-DE` + `en-GB` im Browser aktiv.
- Sprachschalter vor/nach Login und im Secure-Student-Pfad vorhanden.
- Testsprache separat auswählbar.
- AI-Generierung/-Revision erhält die Testsprache explizit.
- Preview-Hosting der Integration wurde am 2026-10-04 erfolgreich veröffentlicht:
  `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`
- Vor dem aktuellen Polish-Pass: 147 Preview-Build-Tests erfolgreich.
- Normales Staging, Firestore-Regeln und Production wurden durch diesen Preview-Deploy nicht verändert.

## Beobachtungen aus realem Preview-Test

1. Sprachschalter/Header springt zwischen DE und EN durch unterschiedliche Textbreiten/Flex-Wrapping.
2. Dynamische Texte wie „Entwurf prüfen“ blieben trotz englischer UI deutsch.
3. Lehrer-Schülervorschau sah wie eine echte Abgabe aus und versuchte eine Submission zu schreiben, obwohl die Vorschau keine echte Abgabe sein soll.
4. i18n-Dokumentation war teilweise noch auf „nur Deutsch / Sprache 2 noch gesperrt“ stehen geblieben.
5. Testsprache eines laufenden veröffentlichten Tests durfte clientseitig noch zu leicht verändert werden.
6. Normaler manueller Save-/Copy-Lifecycle führte Assessment-Locale-Metadaten nicht überall ausdrücklich mit.

## Aktueller Polish-Pass

- Sprachschalter erhält einen stabilen Header-Slot statt locale-abhängigem Flex-Springen.
- Dynamische AI-Review-/Preview-Texte werden in `en-GB` ergänzt.
- Lehrer-Schülervorschau wird explizit als nicht-persistent gekennzeichnet und lokal ausgewertet; echte Schülerabgaben bleiben unverändert.
- `contentLocale`/`gradingLocale` werden beim regulären Test-Speichern sowie bei Kopien weitergeführt.
- Neue manuelle, noch nicht persistierte Entwürfe können ihre Testsprache lokal wählen und speichern sie mit dem ersten regulären Save.
- Änderung der Testsprache wird bei aktiv veröffentlichten Tests clientseitig blockiert.
- Regressionstests decken diese Grenzen ab.

## Überschneidungen

PR #25 (`feature/quality-routing-contract-v1`) enthält zukünftige Voice-/Locale-/Qualitätsverträge, ist aber isoliert und wird nicht blind integriert. Secure-Assessment-/Rules-Arbeit bleibt ein separater Workstream; dieser Polish-Pass lockert keine Firestore-Regeln.

Während dieses Passes ist `feature/gradecrew-app-integration` um PostHog-/Deploy-Arbeit weitergelaufen. Der Vergleich ab der Polish-Basis zeigt dort keine Überschneidung mit den hier geänderten App-/i18n-Dateien. PR #131 bleibt deshalb mergebar gegen den aktuellen Integration-Stand.

## Status

- Entwicklung: in Arbeit auf `feature/i18n-bilingual-polish-20261004`.
- CI: AI Staging Checks `37236911229` auf Code-Head `dc90081832a497de601c7740714b8297a7a2cee7` vollständig erfolgreich.
- Integration: PR #131 offen (Draft), mergebar gegen den aktuellen Integrationsstand.
- Neuer Preview-Deploy nach Polish: offen.
- Manueller DE/EN-Abnahmetest nach Polish: offen.
- Zusätzlicher Auditfix: Legacy-Schüleransicht schützt nun Testtitel, Beschreibung, Fragen und interaktive Prüfungsinhalte vor UI-Übersetzung.
- Follow-ups: CSV/Export-Lokalisierung, einzelne hart codierte Datumsformate und contentLocale-gerechte systemgenerierte Wahr/Falsch-/Bild-Labels.
- Production: unverändert.
