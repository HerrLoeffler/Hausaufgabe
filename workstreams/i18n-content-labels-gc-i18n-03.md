# GC-I18N-03 – contentLocale-Prüfungslabels

Stand: 2026-10-05. Zuständig: Codex GC-I18N-03, dieser Arbeitschat (Link unbekannt). Vorgänger: Internationalisierung GC, chatgpt-conversation://6ac2748c-7cc4-83ed-ace7-4d42752ee7ad, bei Übernahme idle. Alte ungesicherte Änderungen unbekannt. Originale Task-ID und Versuchshistorie bleiben erhalten.

## Auftrag und Ergebnis

#137 Cache/Header-Reconcile und tatsächliche CI prüfen; danach systemgenerierte Prüfungslabels in beiden Schüler-Runtimes an die feste contentLocale binden. UI-, Inhalts- und Bewertungssprache bleiben getrennt. Fragen, authored Texte, Lösungen, Schülerantworten und opaque Antwort-IDs werden beim UI-Wechsel nicht geändert.

Gemeinsamer Helfer assessmentContentLabels: DE Richtig/Falsch, Bild A/B; EN True/False, Image A/B. Alte fehlende/ungültige Metadaten erhalten DE; en-US wird EN. Frage-/Antwortbild-Fallbacks nutzen contentLocale, authored Alts bleiben erhalten. Legacy-Ergebnislabels nutzen dieselbe Sprache. PublicQuizMetadata gibt contentLocale heraus; sichere Bildwahl-Metadaten ohne Lösungsschlüssel. Cacheversionen beider Runtimes angepasst.

## Gesicherter Code und echte Prüfungen

- Branch feature/i18n-content-labels-20261005, [Draft #139](https://github.com/HerrLoeffler/Hausaufgabe/pull/139), Ziel feature/gradecrew-app-integration.
- Exakter Remote-Codehead 2d1339806d6eb4eaf289d1a8a4d55fe7df95739a; [Combined CI 37325767018](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37325767018) erfolgreich. Tree a30bc1419e414ddbc49bcf4374eb9c197e1dedc1 stimmt exakt mit lokal geprüftem c280314c35e00cdcf51b7bd2b259ce84c73784f3 überein. Unterschiedliche Commit-Ancestry wegen Veröffentlichung über GitHub-Connector; kein Force-Push.
- Lokal 266/266 Web-/i18n-Tests, 44/44 Assessment-Backendtests, Syntax und Staging-Build mit 112 Dateien erfolgreich. Neues DOM-Verhalten für beide Runtimes, gegenläufige UI-/Prüfungssprache, Shuffle/IDs, authored Alttexte und fehlende Metadaten geprüft. CI enthält den neuen Runtime-Test.
- Unabhängiges read-only Review fand P1: neue öffentliche Darstellungsfelder hätten bestehende sourceFingerprints verändert. Resume/Poll unveränderter Versuche wäre abgewiesen worden; direkte Abgabe nicht betroffen. Korrigiert durch bisherige Hash-Ansicht, tatsächliches Paper bleibt locale-neutral. Vier eingefrorene bb91-Fingerprints mit/ohne Bilder/Shuffle zuerst rot, dann grün; echte Lösungsänderungen ändern weiterhin den Hash. Zweites Review ohne weitere wichtige Befunde.
- Erster #139-Lauf 37324058268 auf 3c6f720 fehlgeschlagen: drei extrahierte Tutorial-Fixtures hatten importierten Helper nicht erhalten. Fixture-Reparatur 93a143f, CI 37324681191 erfolgreich. Danach eigener Kompatibilitätscheckpoint 2d13398, CI 37325767018 erfolgreich. Fehlläufe nicht gelöscht oder umetikettiert.

## #137 und Parallelstand

[#137](https://github.com/HerrLoeffler/Hausaufgabe/pull/137), Branch feature/i18n-cache-v3-reconcile-20261004, Codehead fe5ed72f583cebfee8d3b4991b9438a5fa3aa841; [CI 37276016105](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37276016105) erfolgreich. Drei veraltete Test-Versionserwartungen korrigiert; alte Fehlläufe 37238257051, 37275593066 und 37275857602 erhalten. #139 enthält diese Cache/Header-Änderungen bereits; vor Merge bewusste Reihenfolge wählen. Beide PRs offen, keine Integration behauptet.

Aktuelles main 9d368c2054b1fbb8fd1590e919786ebfda93ac3b samt START_HERE, Regeln, TODO und Register gelesen. [Development Status 37324898283](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37324898283) und offene PRs frisch geprüft. Integrationsziel unverändert bb91ce3590d773472ece60c4dd881da729bd32c1; #139 zum Prüfzeitpunkt mergeable/clean. #51 überlappt .github/workflows/ai-staging-check.yml; nur eigener Runtime-Testaufruf ergänzt, keine Trigger-/Deploy-Änderung. #25 ist separater Quality-/Sprachvertrag. Classroom bleibt eigene Baustelle. Kein konkurrierender contentLocale-Label-Code erkannt. Neues Register ordnet #137/#139 zu; fremde Einträge und Release-Train-Nachweise unverändert.

## Release-Stufe und Grenzen

ci_green; nicht integriert. Kein neues Hosting-, Assessment-/AI-Functions- oder Rules-Deployment; keine Browser-/Geräte-/Nutzerabnahme. Vorhandenes Staging bb91 ist kein Nachweis für diesen PR. Production unverändert, keine Freigabe. Functions-Vertragsänderung braucht eigenes Staging-Gate. Alte Papers mit bereits gespeicherten deutschen Alts werden nicht clientseitig überschrieben. Keine neuen bezahlten Provideraufrufe/Reservierungen; Budgets und Versuche erhalten. Lokaler Codecheckout sauber. Keine bekannten noch laufenden Aufgaben dieser Umsetzung; frühere ungesicherte Checkout-Inhalte unbekannt.

Diese Koordinationsdateien werden auf docs/gc-i18n-03-handoff-20261005 mit PR gegen main gesichert; erst nach deren Merge steht die neue Zuordnung auf main. Die ursprüngliche Detailhistorie liegt zusätzlich auf dem Codebranch in workstreams/i18n-english-ui-v1.md.

Genau ein nächster Schritt: Direkt vor geplanter Integration Development Status und Zielhead neu prüfen, #137/#139-Reihenfolge und #51-Overlap bewusst abgleichen. Danach getrennte Staging-Gates und manuelle DE/EN-Abnahme; Production braucht ausdrückliche Freigabe.
