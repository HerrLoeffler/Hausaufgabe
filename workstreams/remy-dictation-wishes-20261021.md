# Remy: Audios und eigene Wünsche aus Diktat

Task: **GC-CREW-AI-04**, Folgekorrektur vom 21.10.2026.
Owner: ausführender Fachchat GradeCrew Branding (Thread 01a130fa-babb-7de3-bfeb-785499e7c061).
Branch: `fix/remy-dictation-wishes-20261021`; Basis `39e70b20b304ded6db8c2a668f1622851b15fb32`.
Zielbranch: `feature/gradecrew-app-integration`.

## Auftrag und Ursache

Martins vollständiges Diktat ist im Eingabefeld angekommen. Der lokale Parser erkennt „zwei Audios“ nicht und berücksichtigt nur wenige feste pädagogische Wunschformulierungen. Sobald andere Felder erkannt sind, bleibt der lokale Teilpatch maßgeblich; fehlende Wünsche verschwinden aus der Vorschau.

Soll: Audios/Höraufgaben im bestehenden Audiofeld; zusätzliche Wünsche im vorhandenen Feld Eigene Wünsche und der Vorschau/Übernahmebestätigung. Bereits vorhandene Wünsche erhalten; keine automatische Testerstellung.

## Arbeitsstand und Nachweise

- Aktuelles main START_HERE, AGENTS, STATE, TODO, Registry, CHAT_CONTRACT und Assurance gelesen.
- Git-Fetch durchgeführt. Development Status Run39626391767 / Job119312638071 erfolgreich gelesen; bestehende Warnungen zu Zuordnungen und alten Branches bleiben erhalten.
- PR254 berührt `remy-ai-help.test.mjs` mit kleiner Fixtureänderung; abgeglichen, keine Übernahme der Kapitelimplementierung. Andere offene Web-PRs berühren den Parser nicht. Eigener sauberer isolierter Checkout wiederverwendet (using-git-worktrees).
- Ausgangstests: 56/56 Parser-/Remy-Formulartests bestanden. Mit Martins Satz reproduziert: audioQuestionCount/notes fehlen, restliche sechs Felder vorhanden.
- Fünf neue Regressionen zuerst rot (fehlende Audio-/Wunschfelder), danach 61/61 grün; vollständige Root-Webtests 383/383 grün.
- Unabhängiger Reviewer `remy_parser_review` fand drei konkrete P2-Randfälle: Audio-Erklärungen nach Abgabe versehentlich zusätzlich als Höraufgabe; Mengen verschluckten nachfolgende Wünsche; Fachthema „Bedürfnisse und Wünsche“ gekürzt. Alle drei durch rote Tests reproduziert, danach behoben. Zusätzliche strukturierte Mengen werden nur entfernt, wenn sie tatsächlich in ein Formularfeld übernommen wurden; verbleibende Wünsche und nicht akzeptierte Mengen bleiben sichtbar.
- Aktuell 64/64 Parser-/Formulartests grün. Formularintegration prüft auch den echten collectAiRequest-Auftrag: count15, imageQuestionCount2, audioQuestionCount2, notes vorhanden.
- Abschließend vollständige Root-Webtests: 386/386 grün. Lokaler Staging-Build: 173 Dateien verifiziert für ausschließlich `gradecrew-staging-2026`; kein Upload/Deployment. Erster Buildaufruf ohne das nötige absolute Ausgabeziel brach vor dem Build ab; korrekt parametrierter Aufruf erfolgreich.
- Unabhängige Nachprüfung aller drei Findings: PASS, 64/64 Tests vom Reviewer erneut ausgeführt, keine weiteren wichtigen Findings im Korrekturdiff.
- Erstes lokales Codecheckpoint `ffdc27580dbb925524b27b1b90e18c5f0d9bb0ee`; Git-HTTPS-Push scheitert mangels lokaler Anmeldedaten, daher Sicherung über verbundenes GitHub-API (keine Tokenabfrage).
- Hosting-Build verwendet bereits `Cache-Control: no-cache`; keine Änderung des Modulgraphen nötig.

## Grenzen / relevante Kontrollen

SEC14/17: Benutzereingabe bleibt untrusted Daten; keine neue Action, Provideranfrage oder persistierte Daten. PRIV07: keine zusätzliche Telemetrie und kein Speichern von Sprachtext. PRIV09/12: Vorschau, Anpassen und bewusste Übernahme erhalten; Bestätigung muss tatsächliche Felder benennen. Owner dieser begrenzten Reparatur: Fachchat. Nachweise beziehen sich nur auf lokale Tests; unabhängiger Review/CI offen.

Die früher Staging genannte Schuladresse `hausaufgabe-staging.web.app` ist inzwischen Schul-Live (gc45). Kein Deployment auf diese Adresse, keine Productionänderung. Getrenntes Staging `gradecrew-staging-2026` bleibt separate Release-Stufe. Kein kostenpflichtiger Generierungs- oder Mikrofon-Gerätetest.

Modell: bestehende aktive Runtime, angefordert unknown / tatsächlich unknown; Diagnose und begrenzte Parserkorrektur, keine Runtime-Umschaltung, keine neuen Providerstarts oder Budgetreservierungen.

## Nächster Schritt

Branch/PR über GitHub-API sichern und exakte CI beobachten. CI, Integration und Deploy bleiben getrennte Stufen; auf der Schuladresse wird nichts veröffentlicht. Physischer Mikrofontest und Nutzerabnahme bleiben offen.

## GitHub-Sicherung

Remote-Kandidat `378393a79f912daf963cd244cc9f1818e4def040`, Tree `58281cee55a6ef99d42d0e6b4fcbccba8747586f` identisch zum lokal geprüften `a2bb95f54e9082e4244bb50df98ca61aedc5f839`. [PR260](https://github.com/HerrLoeffler/Hausaufgabe/pull/260) ist Draft zum bestehenden Integrationsbranch. Exakte AI Staging CI39628044930 läuft; noch kein CI-Erfolgsnachweis. Stufe branch_only; kein Merge und kein Deploy. Nächster Schritt: exakte CI bestätigen und nach Release-Train integrieren. Schul-Live benötigt ausdrückliche aktuelle Freigabe.

## Exakte CI bestätigt

AI Staging Checks [Run39628044930](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/39628044930), Job119318461028: vollständig success auf `378393a79f912daf963cd244cc9f1818e4def040`, einschließlich Node22-Functions, Assessment, Firestore-Emulatorregeln, Webregressionen und Build. Stufe **ci_green**. Keine Integration, kein Hosting-/Functions-/Rulesdeploy und kein physischer Mikrofontest. Nächster Schritt: geprüften Kandidaten über den Release-Train integrieren; Schul-Live-Veröffentlichung benötigt ausdrückliche aktuelle Nutzerfreigabe.

## Freigegebene Schulveröffentlichung – Checkpoint vor Upload

Martin bestätigt: „Ja, veröffentliche die geprüfte Remy-Korrektur auf hausaufgabe-staging.web.app und prüf danach kurz, ob Audios und eigene Wünsche richtig übernommen werden.“ PR260 regulär gemerged als `2a6ff107c3e84c9020507f2b384fdd20354efbf7`, Tree exakt58281cee. Merge-CI39629276498 / Job119322740077 success; Admin-CI39629276714 success. Node22 lokal64/64 fokussiert und386/386 Root-Webtests bestanden. Aktueller tatsächlicher Schulstand39e70b2; vollständiger Vergleich173Dateien: nur crew-assistant-core.mjs geändert,172 unverändert,0 hinzu/entfernt. Unabhängiger Release-Preservation-Review PASS. Version bleibt2.3.1-gc45-rc1; exakter Manifest-Commit unterscheidet den Release. Ziel ausschließlich Hosting, environment production/project hausaufgabe-staging. Keine Functions/Rules/Backend-/Daten-/Nativeänderung. Upload noch nicht gestartet. Lokale Checkpoints unter outputs/remy-school-release-20261021. Nächster Schritt: vorhandenen tools/deploy-release.mjs Hostingweg ausführen, dann alle öffentlichen Hashes und tatsächliche Formularübernahme prüfen.
