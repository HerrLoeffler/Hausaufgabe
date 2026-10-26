# GC-EXTENDED-QUESTION-TYPES-01 — normale Remy-Einbindung

Stand26.10.2026. Ausführender Fachchat: bestehender Homepage-/Remy-Chat, Chatlink unbekannt. Gleiche ursprüngliche Task-ID; kein neuer Laborauftrag. Andere Facharbeit am lokalen Acht-Formate-Labor bleibt separat.

## Belegter Umfang

PR[310](https://github.com/HerrLoeffler/Hausaufgabe/pull/310), Branch feature/remy-interactive-tests-20261026, letzter veröffentlichter Head6777b34cb1af06a2ebdc72943395252b6b343c8c. Remote-Baum95540161ce2bea1c4a0b23ab2388fca5fe43e5d1 entspricht exakt dem lokalen Gesamtstandbda9b1d5. Bestehender Laborstanda12ad792 und öffentlicher Homepage-/Integrationsstandf8274f06 bewusst zusammengeführt. Kein neuer paralleler Generator.

Normale Remy-Auswahl und Queue verwenden die gespeicherten Homepage-Baupläne für Zeitstrahl, Koordinaten, Bild markieren/beschriften, Winkel messen und Bildfolge. Fehlende timeline/sequence-Verträge ergänzt; strukturierte Lehrkraftbearbeitung, änderbare Antworten und sichere Serverbewertung. Neue Varianten behalten das Unterformat je Position. Bildfolgen sind auf Schmetterling,Wasserkreislauf,Pflanzenwachstum begrenzt; Bildregionen auf die vorhandenen Szenen. [Erstellungsweise](../docs/learning/REMY_INTERACTIVE_AUTHORING.md).

## Tatsächliche Nachweise

Getrenntes Testprojekt gradecrew-staging-2026, eigene Codebases remy26-ai/remy26-assessment, eigener Hostingkanal. [Normale Remy-Vorschau](https://gradecrew-staging-2026--remy26-mhohnhf1.web.app/workspace.html), bis02.11.2026. Backendquelle lokal3a170cdb, Hostingquellecfe468f8 (Nachtrag für sofort persistierte Koordinaten). Build205Manifestdateien, öffentliche Plattformdatei zusätzlich. Kein Rules-/Auth-/Productiondeploy. Bestehendes visual255 und localhost8784 unverändert. Vorhandener Providerzugang wiederverwendet, keine neue API-Schlüsseleinrichtung.

Echter über die normale UI gestarteter KI-Auftrag4107be8859d80691d522c2010d262b42c6333279, eigener synthetischer TestBZFKMUEB,6Aufgaben/12Punkte:timeline,coordinate,hotspot,labeling,angle,sequence. Kein simuliertes Ergebnis. Lehrkraft änderte68° auf60°, Zeichnung/Lösung gemeinsam gespeichert. Nur dieser eigene Test im Testprojekt veröffentlicht. Sichere Browserabgabe nach Neuladen6/6Antworten,12/12Punkte,100%,Lösungen weiter gesperrt.

Sechs echte Serverfälle:korrekt12,leer0,gemischt6,falsch0,Toleranzgrenze12,doppelte Karten0. Public-Redaction,unveränderteWiederaufnahme,idempotenteAbgabe bestätigt. [Evidenz im PR-Stand](https://github.com/HerrLoeffler/Hausaufgabe/tree/6777b34cb1af06a2ebdc72943395252b6b343c8c/docs/evidence/remy-interactive-20261026). Private Versuchstoken nur ignoriert unter .review-local, niemals in Repo/Antwort. Erzeugungsversuchszähler1; kein erneuter KI-Start zum Wiederaufnehmen.

464Root/UI/Integrationstests,332Functions,101Assessment und Functions ESLint grün. Drei GitHub-Checks auch auf final6777b34c erfolgreich: test40354095390, package40354095198, BugOps40354095232. Unabhängige UI- und Backendreviews fanden5reproduzierte Fehler, mit Rot-/Grün-Tests behoben und nachgeprüft. Keine offene Beanstandung in diesem begrenzten Prüfumfang. Lehrkraft-/Geräteabnahme und finale Releaseintegration noch offen.

## Nächster ausführbarer Schritt

Finalen PR310-Head/CI und Preview prüfen, mit aktuellem Release Train/Dateiüberschneidungen abgleichen. Bestehenden Probetest wiederverwenden, keine erneute kostenpflichtige Generierung allein für Statusnachweis. Integration ist nicht Production; Live-Aktivierung benötigt ausdrückliche Freigabe. Alte Versuchshistorie des Labors erhalten.

## Aktueller Abschluss: reguläres Staging (26.10.2026)

Martins Folgeauftrag bindet die vorhandenen Baupläne/Formatimplementierung ausdrücklich in die normale Testseite ein; keine neue isolierte Vorschau, keine gradecrew.de-Änderung. Central und öffentliche Releases bestätigen:hausaufgabe-staging.web.app == gradecrew.de (Livequelle5f61f723), unabhängiges Testprojektgradecrew-staging-2026. Aktueller main bei Beginn e6f5a2d1, Webintegration7cf4b3c2. Vorhandenen PR310cfab93f2 wiederverwendet, aktuelle PR312-Schülerbeitritts-/Tabletverbesserungen sauber zusammengeführt. Neue Fixturebindung für previewCallable ergänzt; keine Laufzeitreparatur erforderlich. Quelle1cca66fe, PR-CI40381615600/40381615766/40381615582 grün, Integration22fa3ec8.473Root/UI,332Functions,101Assessment plus unabhängiger Mergereview29Tests.

Deployment per vorhandenem FirebaseCLI mit explizitem Projektgradecrew-staging-2026 und18Einzelfunktionsselektoren, da der alte generische deploy-release-Helfer nur breite Codebases zulässt. Keine Schutzregel gelockert und keine --force-Löschung. Normal ai:generateTest,startAiTestJob,startAiTestVariantJob,processAiTestJob,regenerateQuestion,reviseWholeTest,crewAssistant,submitQuickRemy,getQuickRemySubmission,prepareQuickRemy,getAiStatus,reviewMode; assessment:configurePracticeSolutionRelease,getAssessmentInfo,startAssessmentAttempt,resumeAssessmentAttempt,submitAssessmentAttempt,getAssessmentReceipt. Alle18ACTIVE/successfulUPDATE,62übrige Exporte mit identischem Hash erhalten. Normale Entrypoints und QueueprocessAiTestJob; PreviewENABLEDfalse, kein Pilotkonto-Gate. Hosting auf kanonischem live-Kanal des Testprojekts,205Hashes identisch. Vorher/nachher SHA256 von beiden Live-origin release.json identisch. Rules/Auth/Live nicht verändert.

Echter UI-Auftrag im bereits angemeldeten aktiven Staging-Testkonto (dessen bestehende Sitzung/Tests erhalten):6Aufgaben/12Punkte, gespeicherter neuer EntwurfYN6HWE5T, alle6Unterformate.1neuer Generierungsauftrag zusätzlich zum1früheren Previewauftrag, alte Providerhistorie nicht zurückgesetzt. Job-ID aus sichtbarer UI nicht ermittelt, nicht erfunden. Koordinatenauftrag fehlte im KI-Arbeitsauftrag; über normales Fragefeld+strukturierteÜbernahme aufA(3|2),B(-2|-3) ergänzt, Speicherung bestätigt. Entwurf nicht veröffentlicht. FachlicheKI-Freigabe nicht pauschal behaupten.

Sechs normale Serverfälle nutzen bewusst eigenen vorhandenen ProbetestBZFKMUEB statt fremde Testkontodaten zu lesen. Ergebnis12/0/6/0/12/0; Public-Redaction/Wiederaufnahme/Idempotenz bestätigt. Erste lokale Harnessanpassung benutzte Großbuchstaben-Endpunkt aus Preview und erreichte keinen Handler; Normalname korrigiert, gespeicherte Versuchsdaten erhalten, kein weiterer Providerstart. PrivateTokens nur ignorierte .review-local-Dateien. Nachweise unterdocs/evidence/remy-canonical-staging-20261026/.

Nächster Schritt:Martin testet normale Remy-Erstellung auf gradecrew-staging-2026.web.app mit Stagingkonto; keine remy26-Vorschau mehr nötig. Historische Preview-/Acht-Formate-Labore bleiben unangetastet. Geräte-/Lehrkraftabnahme offen, Production ausgeschlossen. Ausführender Fachchat weiterhin dieser Homepage-/Remychat, Link unbekannt.

Späterer paralleler Klassenraum-Hostingstand22703241 wurde lesend abgeglichen:212/212Hashes stimmen,204Remy-Basisdateien identisch, nurworkspace.html additiv umKlassenraum ergänzt;7zusätzliche Klassenraumdateien. Alle18normalen Remy-/Assessmentfunktionen unverändert. Neuere Arbeit bewusst nicht zurückgerollt/überschrieben. Dieser Folgestand ist weder ein zweiter Remy-Auftrag noch eine weitere KI-Generierung. Nachweis later-classroom-preservation.json. main1ae90977 Foto-Dreisatz/Hilfestufen-Regeln erhalten; bleiben eigener lokaler Pilot und sind hier nicht automatisch ausgerollt.
