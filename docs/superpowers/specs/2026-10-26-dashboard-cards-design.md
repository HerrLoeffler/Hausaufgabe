# Testkarten im Lehrkraft-Dashboard · GC-TEST-CARDS-20261018

## Ziel und Ausgangslage

Die bestehende GradeCrew-Testübersicht soll bei 52 gemischten Tests schnell lesbar sein. Martins Screenshots zeigen vier Karten pro Desktopzeile: Nur die erste hat geöffnete Zusatzaktionen, während die anderen innen große Leerflächen zeigen. Ursache im ausgelieferten Live-Commit `f048ed1a`: Jede Karte hat ein eigenes natives `details`, aber das Raster streckt die anderen Karten und `margin-top:auto` schiebt deren Primäraktionen nach unten. Die vier gleich breiten Statistikfelder brechen „Lehrkraft“ mitten im Wort.

## Gewählte Ausführung

Die bestehenden Karten, GradeCrew-Farben, Schriften, Icons, Dialoge und Handler bleiben maßgeblich. `Schülerlink` wird bei veröffentlichten, aktiven, nicht gesperrten Tests direkt unter Status/Titel gezeigt und öffnet die bestehende Freigabeansicht mit Linkkopie und QR. Ein Lehrkrafttest im Warte- oder Laufzustand erhält zusätzlich `Durchführung öffnen` zur dort bereits vorhandenen Warteraum-/Liveansicht. Öffnen ändert weder Veröffentlichung noch Startzeit. Entwürfe und beendete Tests bieten keinen aktiven Schülerlink. Bearbeiten und Ergebnisse bleiben Hauptaktionen; Duplizieren, Kollegenteilen und Schülerzugang schließen/erneut öffnen bleiben unter `Weitere Aktionen`. Nach Martins Folgefeedback sitzt der bestehende, bestätigte Papierkorb oben rechts am Kartentitel, damit er bei vielen Tests ohne Aufklappen erreichbar ist. Bei wegen eines Rechtehinweises gesperrten Karten entfällt das sonst leere Zusatzmenü.

Die Zusatzaktionen bleiben als natives, kartenbezogenes `details` für Tastatur und Touch. Die Karten richten sich im Raster oben aus, sodass ein offenes Menü Nachbarn nicht künstlich vergrößert. Kennzahlen behalten vier Werte, erhalten kompaktere Abstände und zentrierte, lesbare Werte; bei enger Kartenbreite werden daraus zwei Spalten. Lange Titel/Fächer/Codes dürfen sinnvoll umbrechen, Werte und Startmodi nicht mitten im Wort.

## Verworfen / Abwägung

Ein absolut überlagerndes Popover wäre noch kompakter, kann aber beim letzten Kartenraster an Viewportgrenzen und hinter benachbarten Karten landen und braucht zusätzliche Fokus-/Positionslogik. Ein zweites Liveprodukt oder ein neuer Linkdialog würde bestehende Zustände und Zugriffsregeln duplizieren. Der bestehende Inline-Disclosure plus nicht gestreckte Karten ist die kleinere, sichere Änderung.

## Grenzen und Prüfung

Ausgangspunkt ist das öffentliche Live-Manifest auf `gradecrew.de` mit Commit `f048ed1a`. Die separate dreistufige Veröffentlichung in PR #328 greift in `app.js` ein; dieser Auftrag ändert ausschließlich `renderQuizList`, Karten-CSS, passende Übersetzung und synthetische Tests. Keine Backend-, Rules-, Auth-, Audio- oder Timerlogik. Vor Release: 320/390/430 px, iPad hoch/quer, Desktop, 52 Karten, lange Titel, alle Kartenstatus, Menü/Fokus/Escape/Touch sowie Link- und Live-Einstieg mit synthetischen Daten prüfen. Review, exakte CI und Hosting-Receipt sind eigene Gates. Keine echten Testdatenmutationen.
