# Wilma: begrenzte Fehlerdiagnose und sichere Wiederaufnahme

**Goal:** Einen fehlenden Bewertungsvorschlag verständlich zuordnen und vorhandene Ergebnisse wiederverwenden, ohne ungeklärte Berechnungen erneut zu bezahlen oder Bewertungen zu verändern.

**Architecture:** Bestehenden Review-/Fundus-/Budgetpfad ergänzen. Kein neuer KI-Dienst, kein neuer Bewertungsalgorithmus und keine automatische Wiederholung unbekannter Operationen.

**Tech Stack:** Bestehende Firebase Callable `reviewWilmaAnswers`, Node22, Wilma-Module und Webclient. Derselbe Task GC-PEDAGOGY-KB-01 / GC-WEB-REPAIR-20261007; Web-Fachchat als Owner. Umsetzung/Functions-Release dieses Plans noch nicht freigegeben.

## Belegter Ausgangspunkt

Aktiver Server `reviewwilmaanswers-00004-nuz`; tatsächlich heruntergeladenes Quellpaket für Core, Runtime und Callable bytegleich zum geprüften Bestand. Am18.11.2026 um14:30:29UTC/15:30:29MEZ erster503, danach kostenlose429-Fundusmisses. Ein heutiger privater Prüflauf hat `phase:unknown` und `costSettled:true`. Das belegt eine gestartete Berechnung ohne verwendbaren Prüfbeleg. Novemberledger115588MikroEUR erfasst,0reserviert bei8750000MikroEUR Liveanteil: kein ausgeschöpftes Monatsbudget. Das sind Monatswerte, keine behauptete Rechnung für den einzelnen Fehler.

Die ursprüngliche interne Fehlermeldung wird im Catch verworfen. Ob Modellantwort unvollständig/verweigert/unzulässig war oder der anschließende Belegspeicher scheiterte, ist nachträglich nicht sicher unterscheidbar. Kein belegter OpenAI-Ausfall. Spätere400 aus derselben Mehrzweckfunktion sind ohne Aktionsbeleg nicht als Ursache dieses503 zuzuordnen. Es gab während der Untersuchung ausschließlich Lesezugriffe, keine echten Bewertungsänderungen und keinen neuen Providerstart.

Web-VorschauPR434/8c6977f zeigt Antwort/Referenz und Vorschlag getrennt und erhält den Erstfehler beim freien Cachemiss. Sie behebt die historische Serverursache nicht.

## Invarianten

- Gleicher Owner/Test/Aufgabe/Raster/Antwort und bestehender Fingerprint bleiben maßgeblich.
- `allowPaid:false` darf niemals Quota, Reservierung oder Provider starten.
- Unknown/started und bereits verbrauchte Reservierungen werden nicht gelöscht, umbenannt oder durch neue Task-/Operation-IDs umgangen.
- Vorschlag wird nur nach vollständiger ID-, Fassung-, Status- und Punktevalidierung verwendet; keine stillschweigende Rundung von0,75 auf0,5 oder andere erfundene Teilpunkte.
- Bestehende Punkte, Lehrerentscheidung, Fundus, Auth/Owner-/Deletion-Gates und20EUR-Gesamtrahmen bleiben erhalten.
- Keine Rohantworten, Namen, Tokens oder vollständigen Providerantworten in Logs. Fehlercodes sind erlaubte feste Werte; Request-ID nur im bisherigen privaten Operationsnachweis.

## Aufgabe1: Fehlerstufe und vorhandene Request-ID erhalten

Betroffene Dateien: `functions/lib/wilma/core.mjs`, `functions/lib/wilma/provider.mjs`, `functions/lib/wilma/runtime.mjs`; neue synthetische Tests `functions/lib/wilma/recovery.test.mjs`.

1. Failing Tests für unvollständige Antwort, refusal, ungültiges JSON, fehlende/fremde/doppelte Antwort-ID, Punkte außerhalb des Rahmens bzw außerhalb0,5-Schritten und Fehler im Resultatspeicher schreiben. Jede Probe verwendet ausschließlich erfundene Aufgaben und einen lokalen Providerersatz.
2. Bestehenden Catch durch eine feste Diagnoseklassifikation ergänzen: `provider_incomplete`, `provider_refusal`, `provider_format`, `receipt_invalid`, `result_store_failed`, `unknown`. Die auslösende Stufe steht im Code fest; keine Fehlermeldungsheuristik mit Schülerinhalten.
3. `finish(fingerprint, info)` um optionale erlaubte Diagnosemetadaten ergänzen. `phase:unknown`, Zähler, Reservierung und vorhandene Request-ID erhalten. Kein Vorschlag aus ungeprüften Teilantworten speichern und keine neue Berechnung starten.
4. Tests zunächst rot, anschließend grün; bestehende Budget-/Fundus-/Cache-/Owner-/Race-Tests unverändert grün. Danach einen kleinen Zwischencommit sichern.

## Aufgabe2: Sichere Meldung und Wiederaufnahme

Betroffene Dateien: `functions/wilma-review-callables.js`, `wilma-auto-review.mjs`, bestehende Reviewclienttests und gegebenenfalls `wilma-answer-review.mjs`.

1. Tests für die feste, inhaltsfreie `HttpsError.details.reasonCode`-Grenze und unbekannte Codes schreiben. Anmelde-/Rechte-/Budget-/Stale-Fehler müssen getrennt bleiben.
2. Ausgewählte Codes verständlich anzeigen. Eine Aktion „Gespeicherte Vorschläge laden“ darf ausschließlich `allowPaid:false` verwenden und nur bestehende vollständig validierte Ergebnisse übernehmen.
3. Für unknown ohne Ergebnis bleibt manuelles Bewerten möglich. Ein neuer bezahlter Lauf ist ein eigener ausdrücklich begrenzter Auftrag; kein automatischer Retry und keine Fingerprintumgehung.
4. Synthetisch nachweisen: vorhandener vollständiger Cachebeleg → Vorschlag; fehlender/abgelaufener Cache → verständlicher Status ohne API; fremde Fassung → Ablehnung; erneut aktualisieren → weiterhin kein zusätzlicher Paid-Aufruf; manuelle Punkte bleiben erhalten.

## Releaseumfang und Abnahme

Zuerst unabhängigen Review am exakten Patch und passende CI ausführen. Danach getrennte Vorschau im Testprojekt. Ein Hostingrelease vonPR434 ist kein Functionsrelease. Für Production wäre ausschließlich die geprüfte `reviewWilmaAnswers`-Funktion mit genauem Quellpaket/Revision und gesonderter Freigabe vorgesehen; keine Rules/IAM/Secrets-, Submit-, Native- oder sonstige Functionsänderung. Erhalt der übrigen Dienste und beider bisherigen Webadressen belegen.

Relevante Kontrollen: SEC06/07 Owner-/Fassungstrennung, SEC11 Budget, SEC14 keine unklare Wiederholung, SEC17 keine fremden Lösungen; PRIV07/08 Datenminimierung, PRIV14/15 verständliche Status-/Fokusführung. Status für den zukünftigen Serverpatch jeweils **offen**. Kein vollständiger Sicherheits-/Rechts-/Gerätenachweis aus diesem Plan.

**Nächster Schritt:** Diese enge Serverergänzung separat beauftragen; die zwei vorhandenen Web-Vorschauen können unabhängig davon geprüft werden. Die historische503-Ursache bleibt ausdrücklich ungeklärt, bis ein belastbarer Fehlerbeleg vorliegt.
