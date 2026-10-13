# Entscheidungsvorlage: Lerninsel aus Lehrer-Tests

**Machbar ist eine geprüfte 3D-Spielwelt, die Lehrer-Tests als Daten einsetzt.** Neue Aufgaben ändern Worte, Einheiten, Vorlagen und begrenzte Routen, gewöhnlich ohne neuen Enginebuild oder neue Modelle. Nicht jede Frage passt als Rätsel; ein gleichwertiges Aufgabenpanel bleibt verfügbar.

Empfehlung: zuerst ausdrücklich freigegebene **Übung**, Deutsch/Mathematik, eine Referenzszene mit vier Bausteinen. Freie AI-3D-/Codegeneration pro Test wäre teurer, schwerer fachlich zu prüfen und deutlich wartungsintensiver. Der vorhandene serverseitige Assessmentkern bleibt Bewertungsinstanz; Lösungen gehören nicht in Schülerpakete. Richtigkeitsabhängige Tore können bei Prüfungen Lösungen verraten und brauchen ein anderes Konzept.

Martins Ziel ist **Browser zuerst, iPad später**. Zunächst kleine Runtime-/Gerätequalifikation; dann plattformneutraler Datenvertrag und Browseradapter. Grobe Web-first-Spanne20–36Personenwochen inklusive Unsicherheitsreserve, bei geeignetem Team etwa12–22Kalenderwochen, keine Zusage.13–22PW für native Integration sind nur ein Vergleich, kein vorgeschalteter Doppelbau. Summative Qualifikation und Referenz-Artqualität bleiben gesondert.

Illustrativ100MB-Assets+60KB-Szenario:1.000ColdLoads100,06GB;30.000Monatsstarts mit90%Assetcache301,8GB. Einmaliges Paket und kleine Daten sind grundsätzlich günstiger zu betreiben als laufendes GPUstreaming. Paketgröße, FPS, RAM und reale Serverlast sind noch zu messen.

[Ausführlicher Plan](plan.md) · [Mapping](mappingmatrix.md) · [Kosten/Last mit Preisen und Formeln](kosten-last.md) · [Quellen](quellen-codebelege.md).

Nur Dokumentation, kein Level1-Umbau/Build/Deploy/Providerstart. Genau nächste Produktentscheidung über die Zentrale: Übungs-MVP für Web-first und begrenzte Runtimequalifikation bestätigen; danach gesonderter Umsetzungsschnitt.
