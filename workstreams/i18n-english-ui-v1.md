# Aufgabe: GC-I18N-03 – Englisch als zweite GradeCrew-UI-Sprache

- Aktualisiert (UTC): 2026-10-04
- Auftrag: Englisch als zweite UI-Sprache einführen und nach dem ersten realen Preview-Test fachlich/visuell härten.
- Integrierter Polish-Branch: `feature/i18n-bilingual-polish-20261004` (PR #131 gemergt)
- Aktueller Cache-/Header-Reconcile-Branch: `feature/i18n-cache-v3-reconcile-20261004`
- Polish-Basis: `feature/gradecrew-app-integration@fb88dfa7b7cbad49f93b4fc47e883c92fdcf0d41`
- Frühe Implementierung: `feature/i18n-english-ui-v2`, über PR #96 in die App-Integration übernommen.
- Polish-PR #131: gemergt in `feature/gradecrew-app-integration`.
- Veralteter Cache-PR #135: wegen Divergenz/Konflikten ohne Merge geschlossen; Änderungen werden auf aktuellem Integrationsstand reconciled.
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

- Polish: PR #131 gemergt; Header-Slot, dynamische EN-Copy, nicht-persistente Lehrer-Vorschau und Assessment-Locale-Lifecycle sind im Integrationsbranch.
- Aktueller Reconcile: `feature/i18n-cache-v3-reconcile-20261004`.
- Reconcile-Inhalt: kompletter i18n-Modulgraph auf Cache-Version 3, Public Entry v5, Secure-Student ebenfalls auf Bootstrap v3, semantische Header-Navigationskeys statt reinem Source-Text-Matching.
- Veralteter Branch `feature/i18n-cache-v3-header-20261004` war 19 Commits hinter Integration; PR #135 wurde deshalb ohne Merge geschlossen statt fremde Arbeit zu überschreiben.
- CI für Reconcile: noch offen.
- Neuer Preview-Deploy nach Reconcile: offen.
- Manueller DE/EN-Abnahmetest nach Reconcile: offen.
- Audit-Follow-ups: CSV/Export-Lokalisierung, zwei hart codierte `de-DE`-Datumsformate in `app.js` und contentLocale-gerechte systemgenerierte Wahr/Falsch-/Bild-Labels in beiden Schüler-Runtimes.
- Architektur-Follow-up: kritische dynamische UI schrittweise von Source-Text-Matching auf semantische `data-i18n-key`-Keys migrieren.
- Production: unverändert.


## Checkpoint 2026-10-04 – Cache/Header-Reconcile

- Task-ID: GC-I18N-03
- Ausgangspunkt: aktueller `feature/gradecrew-app-integration` statt des divergierten Cache-Branches.
- Gesichert: Cache-Bust auch für Secure-Student ergänzt; öffentliche Hauptnavigation verwendet jetzt semantische Locale-Keys mit deutschem Fallback.
- Nicht verändert: Firestore-Regeln, Assessment-Functions, Production.
- Offene Codebefunde: harte `de-DE`-Datumsformatierung; systemgenerierte Wahr/Falsch-/Bild-Labels folgen noch nicht konsequent `contentLocale`; Exporte/CSV noch nicht vollständig lokalisiert.
- Nächster Schritt: Reconcile-PR öffnen, CI prüfen und erst danach über Integration/Preview entscheiden.

## Übernahme 2026-10-05 – GC-I18N-03

- Neuer Verantwortlicher: Codex-Chat GC-I18N-03; vorheriger Chat „Internationalisierung GC“, chatgpt-conversation://6ac2748c-7cc4-83ed-ace7-4d42752ee7ad, laut read_thread idle. Alter lokaler ungesicherter Stand unbekannt.
- Development Status 37269176813 geprüft: #137 unregistriert; #51 verändert CI, #25 ist separater Sprachvertrag. Kein konkurrierender contentLocale-Label-PR erkannt.
- Historischer CI-Fehler 37238257051: Katalog erwartet en-GB@1 statt @2. Reparatur d3a7615; neuer Lauf 37275593066 erreicht Firestore-Emulator erfolgreich, scheitert anschließend an zweiter veralteter Cache-Erwartung (Entry v4 statt v5). Beide Ursachen reproduziert; kein blindes Retry.
- Dieser Checkpoint korrigiert die zweite Erwartung. Neuer Lauf anhand Branch/Head prüfen. Kein Integration-/Deploy-Nachweis. Production unverändert.
- Folgearbeit auf eigenem Checkout/Branch: contentLocale-Labels beider Schüler-Runtimes. Zusätzlich fehlt contentLocale in publicQuizMetadata und serverseitig werden deutsche Bild-Fallbacks fest eingebaut; minimale Vertragskorrektur erforderlich, ohne Functions-Deploy.
- Keine neuen Provider-Aufrufe/Kostenreservierungen; historische Versuchszähler/Budgets unangetastet.
- Genau ein nächster Schritt: CI dieses Cache/Header-Checkpoints prüfen.

## Checkpoint 2026-10-05 – Content-Locale-Folgearbeit

- Task-ID GC-I18N-03; verantwortlicher Chat Codex GC-I18N-03 (aktiv), übernimmt nach idle-Vorgänger Internationalisierung GC. Alter ungesicherter Checkout unbekannt.
- Eigener Checkout: gradecrew-gc-i18n-03; eigener Branch feature/i18n-content-labels-20261005, Ziel feature/gradecrew-app-integration. Basis bb91ce3590d773472ece60c4dd881da729bd32c1; #137 samt Reparaturen bewusst übernommen.
- #137: aktueller Codehead fe5ed72f583cebfee8d3b4991b9438a5fa3aa841; AI Staging Checks 37276016105 erfolgreich. Frühere Fehlläufe 37238257051, 37275593066 und 37275857602 bleiben erhalten. Ursache: drei veraltete Versionserwartungen; kein App-Fehler als CI-grün versteckt.
- Umsetzung: gemeinsame assessmentContentLabels(contentLocale), True/False und Image A/B in beiden Schüler-Runtimes; deutsche Defaults für alte Tests ohne Metadaten; authored Alttexte unverändert. Legacy-Ergebnisanzeige erhält dieselbe contentLocale.
- Secure-Vertrag: publicQuizMetadata liefert contentLocale; fehlende Alttexte bleiben leer bis zum Client-Fallback; imageChoicesOnly wird als sicherer Darstellungswert übertragen. Keine Lösungsschlüssel im Client.
- Cache: Legacy-App, Secure-Student und Assessment-Locale-Modul neu versioniert. Neuer Verhaltenstest in bestehender CI aufgenommen.
- Tests: neue Tests zuerst rot beobachtet (DE statt EN, fehlende Metadaten und feste DE-Alts); 59 passende Tests lokal grün. Breitere Root-/Backend-/Build-Prüfung steht noch aus. Kein CI-Nachweis für diesen Folgebranch.
- Grenzen: nicht integriert, kein neues Hosting/Functions/Rules-Deployment, keine Geräteabnahme. Functions-Vertragsänderung benötigt vor Nutzung eigenes Staging-Gate. Bereits veröffentlichte/aktive Prüfungs-Papers werden nicht clientseitig umgeschrieben; ältere Papers mit bereits eingebauten deutschen Alttexten bleiben authored/geschützt, bis ein neuer sicherer Paper-Vertrag genutzt wird.
- Development Status 37269176813 gelesen; aktuelle Integrationsbasis bewusst zusammengeführt. #51 überlappt CI; nur neuer Testaufruf ergänzt, keine Trigger-/Deploy-Änderung. #25 Sprachvertrag bleibt isoliert. Vor Integration erneut Live-Status und aktuellen Zielhead prüfen.
- Keine bezahlten KI-Aufrufe oder Budgetänderungen. Production unverändert.
- Genau ein nächster Schritt: breitere lokale Regression und Staging-Build prüfen.
