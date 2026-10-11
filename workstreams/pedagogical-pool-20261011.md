# GC-PEDAGOGY-KB-01 Automatische Poolanbindung

Ausführender Fachchat, Chat-Link unbekannt. Eigener Branch feat/pedagogy-pool-20261011, Integrationsziel feature/gradecrew-app-integration. Basis 9363fe9842b502c4a2780bf007acef6881af6213. Die vorhandenen Plan-/Datensicherungs-PRs214/208 auf main bleiben separat; keine Änderungen an ihren Quellen.

## Nutzerauftrag

Bestehende gute Testgenerierung mit automatisch passenden geprüften Aufgabenprofilen nach Fach, Jahrgang und Schulart ergänzen. Neue Aufgaben eigenständig generieren, vorhandene Qualität und Anschaulichkeit erhalten. Keine Titel/Autoren/Ursprungsdateinamen im Wissenspool.

## Umsetzung

Serverseitiger Katalog mit 53 freigegebenen abstrakten Aufgabenprofilen, strikte Fach/Jahrgang/Schulart/Bundesland-Filter, Themenranking und Format-/Medienvertragsprüfung. Höchstens sechs Profile / 6.000 Zeichen. Nur verified + confirmed. Material-only und Ausgangstest begrenzen Inhalte unverändert. Ohne Treffer oder bei Katalogfehler keine Promptänderung. Einmalige Auswahl begleitet normale Erstellung, Ersatzaufgaben und Gesamtreparatur. Sichere Poolmetadaten an Response, Quiz, Auftrag und Nutzungsnachweis; keine Rohprofile oder Originale in Schülerdaten.

Startbestand: 26 Deutsch, 22 DaZ, 5 Mathematik, Mittelschule/Bayern/Jahrgang6 oder9. 35 geprüfte Hör-Aufgabengruppen,8 Deutsch-Textprofile,5 DaZ-Textprofile,5 Mathematik-Textprofile. Drei Hörgruppen mit Quellen-/Bewertungsproblem ausgeschlossen. Keine pauschale Freigabe der lokalen 3.669 generischen Kandidaten oder 125 Bücher.

## Nachweise

Selector-TDD: zunächst fehlende Auswahl nachgewiesen (5 reale Assertion-Fails), anschließend grün. Handler-TDD: fehlende Poolübermittlung/Metadaten und fehlender Reparaturkontext zunächst3 Assertion-Fails, anschließend grün. Zusatztest Schreibprofil vs ausschließlich number rot, danach grün. Functions-Gesamtsuite248/248 unter Node22.23.3 und Node24.19.0; Syntax und ESLint grün. Existierende Upload-/50-Aufgaben-/Bild-/Audio-Regressionen erhalten. Keine kostenpflichtigen Provideraufrufe; aktuelle Provider-Zugangsdaten weder gelesen noch geändert.

Aktueller Development-Status-Lauf38116109596/main@2b147d7bca4a507e4211f2045e4547fcd02bdcf4 erfolgreich gelesen, einschließlich branch-overlap-/PR-Audit. Offene PRs erneut geprüft: kein vorhandener Pool-Implementierungsbranch. PR186/191 betreffen Coco/Privacy, ihre Änderungen werden nicht übernommen. Lokaler Checkout eigenständig; anderer Arbeitscheckout mit uncommitteten Änderungen blieb unberührt.

## Scope und Assurance

SEC06/07: serverseitiger Katalog ohne Originale/Lösungsschlüssel; clientseitig nur technische Versions-/ID-Metadaten. SEC14/17: begrenzter untrusted Kontext, unveränderte Qualitäts-/Quota-Prüfungen. PRIV07/08/09: ausschließlich anonymisierte eigene Abstraktionen, keine neue Personendatenquelle oder externe Audio-/PDF-Übertragung. Keine neue Datenbank/Firestore-Regeln, UI, Zugangskonfiguration oder Deploymentfreigabe. Rechts-/Modellqualitäts-/Gerätefreigabe nicht aus lokalen Tests ableiten.

## Grenzen und nächster Schritt

Code lokal implementiert und geprüft; bisher branch_only, noch nicht in den App-Integrationsbranch übernommen und nicht live. Startbestand nur Mittelschule6/9; andere Kontexte nutzen weiterhin den bestehenden Generator. Lokale Verifikation unter Node22.23.3 und Node24.19.0. Unabhängiger Kandidatenreview durchgeführt; wichtiger Befund durch reproduzierbare Rot-Grün-Tests korrigiert. PR/CI folgen. Danach Integration gemäß bestehendem Releaseweg und beauftragter Staging-Abnahme; Production benötigt ausdrückliche Freigabe.

Angefordertes/laufendes Codex-Modell, Kosten und Usage sind nicht verlässlich beobachtet. Ursprüngliche Task-ID und Versuchshistorie erhalten. Kein zusätzlicher bezahlter API-Budgetbedarf für deterministische Poolauswahl.

## Unabhängige Prüfung und Korrektur

Fresh-context Sol/medium prüfte den unveränderlichen Kandidaten8b34c663070afddff2d924b320f340a3e92dc0e7. Ein wichtiger Befund: cleanInput ergänzt fehlende Schulart/Bundesland zu Mittelschule/Bayern; diese Standardwerte waren fälschlich als Pool-Zuordnungsbeleg nutzbar. Reproduzierbarer Handler-Test mit echter cleanInput-Funktion scheiterte bei fehlenden Werten (1 statt0Profile), ebenso bei leeren Strings. Fix: Generatorstandards erhalten, Poolkontext aber nur mit ausdrücklich vorhandenen nichtleeren Stringwerten auswählen. Fehlend/leere Stringfelder führen unverändertem Erstprompt und0Profilen zu. Lokale Gesamtsuite nach Fix247/247 grün; ESLint grün. Keine weiteren kritischen/wichtigen Befunde im Review. Modellqualität, unabhängige fachliche Herkunftsabnahme, Node22, Deployment und Rechtsfreigabe wurden vom Code-Reviewer nicht beurteilt; sie werden nicht als erfüllt dargestellt.

Angeforderter Reviewer Sol/medium gemäß Rollenleitlinie; tatsächliches Runtime-Modell/Usage/Kosten nicht beobachtet. Git-over-HTTPS-Push scheitert an fehlender Terminalanmeldung; vorhandener authentifizierter GitHub-Connector wird für dieselbe beauftragte Branch-/PR-Sicherung verwendet. Kein Versuch, Zugangsdaten zu lesen oder zu ändern.


## Endabnahme der lokalen Umsetzung

Der Kontextnachweis bleibt als serverseitig berechnetes pedagogicalContextKnown auch nach Normalisierung/Queue-Serialisierung erhalten. Legacy-Aufträge ohne Nachweis nutzen den alten Generator ohne Poolkontext. Zugehöriger Queue-/Normalisierungstest ebenfalls zuerst rot (1 statt0Profile), danach grün; Test bildet die reale Entfernen-undefined-Serialisierung nach. Endsuite248/248 unter Node22.23.3 und Node24.19.0, Syntax/ESLint/diff-check grün. Der Fix ist eine eigene Abnahme per Regressionstest, kein ungeprüfter bloßer Kommentar und keine wiederholte Vollreviewrunde.
