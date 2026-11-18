# Schülerabschluss: neuer Test und sichtbare Lösungsprüfung

18.11.2026, bestehende Tasks GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01. Direkter Nutzerbefund auf der bisherigen Adresse: gespeicherte Abgabe ohne klaren nächsten Test, Freigabecheck ohne sichtbare Rückmeldung. Layout ausdrücklich angenommen und Übernahme in Secure beauftragt. Webfix von 9de201190cf5cac2c0c22d87a1824914d0b3f064 auf f723e71b1f91c17e39bb96f9e3eae4c6d5c9a450, Tree c877184464769428cc772d7dc4609993e49e13cc. Bestehende PR438 fortgesetzt, weiterhin kein Runtime-Zielbranch-Merge behauptet.

## Verhalten und Grenzen

„Neuen Test starten“ führt zur vorhandenen gleich-originigen Code-/Namenseingabe, entfernt alten Testcode und Fragment aus dem Ziel und erhält ausdrücklich Deutsch/Englisch. Alte Attempt-Credentials und gespeicherte Abgabe bleiben erhalten. Der Link startet keinen Versuch, löscht keine Sitzung und umgeht keine Wiederholungsgrenze. Auch die nächste Codeeingabe startet erst nach der vorhandenen expliziten Teststartaktion.

„Lösungsfreigabe prüfen“ zeigt Laden, weiterhin gesperrt, Netzwerkfehler oder freigegebene Lösungen. Gleichzeitige Klicks teilen einen Read; ein manueller Klick während eines automatischen Reads erhält dessen Ergebnis. Lösungen werden weiterhin ausschließlich aus einem autorisierten Serverbeleg mit solutionsReleased angezeigt. Rückmeldung ist als Status erreichbar; freigegebene Lösungen erhalten den logischen Überschriftsfokus. Eigene Rückmeldungen lösen keine Observer-Readschleife aus.

Vier Runtime-Dateien geändert, 212 Assets unverändert und kein entfernter Pfad. Angenommene Aufgabenbreite, Schrift, Timer, Nummernraster, manuelle/Zwangsabgabe und sämtliche Serverregeln bleiben unverändert. Relevanter Umfang SEC08 (Serverautorität), SEC15 (Text/DOM), PRIV07 (kein neuer Datenfluss) und PRIV15 (Status/Fokus).

## Nachweise

12 neue Regressionen zunächst fehlgeschlagen, danach bestanden. Der reale Browserlauf fand zusätzlich einen bisherigen DE→EN-Fallback beim nächsten Code; explizite Sprachübergabe nach drei roten Locale-Fällen korrigiert. Zwei bestehende URL-Erwartungen aktualisiert, Alias-/Sicherheitsprüfungen erhalten. Vollständige lokale Web/UI-Suite mit 850 Tests bestanden. Unabhängiger Review auf exaktem Tree PASS, keine P0–P2, 59 gezielte Tests. Zwölf Chromium/WebKitreisen mit tatsächlichem Secureclient und ausschließlich fiktiven Callableantworten: de/en, 390/820/1180px, gesperrt/freigegeben/offline, genau ein Read pro Check, alte Credentials erhalten, neuer Code und Intro ohne Start-/Submitaufruf erreichbar.

Exakte CI 44375566304 vollständig erfolgreich. Staging Hosting sites/gradecrew-staging-2026/versions/e218924764139f91, 216/216 öffentliche Kandidatdateien und 447 andere Dateien erhalten. Live Hosting sites/hausaufgabe-staging/versions/73a1e618cab1a0ba, beide offiziellen Adressen jeweils 216/216 öffentliche Dateihashes. Beim finalen Abgleich wurde eine unabhängige parallele Staging-Änderung an remyMehrfeld30Review (00016-gih → 00019-qit, eigener Codebase) erkannt. Der erste Publish stoppte deshalb vor CLI-Start; die Änderung wurde bewusst erhalten und als frische Baseline gesichert. Sie gehört nicht zu diesem Fix und wurde hier nicht fachlich abgenommen. Ab diesem frischen Abgleich blieben alle 98 Staging- und 62 Live-Functions unverändert; reviewWilmaAnswers weiterhin d67b0b5. Keine neuen Provideraufrufe oder echten Schüler-/Notenschreibvorgänge. Dies ist ein reiner Hostingfix; der vorherige Wilma-Altfall-Backendpatch bleibt undeployed und an seinen tatsächlichen Altfallnachweis gebunden.

## Secure und nächster Schritt

Der bestehende Native-Owner 01a10c75-8912-7a12-98f0-c9e78064aa2c hat die angenommene Layoutübernahme und den Abschlussvertrag erhalten. Er bestätigt den Upload von GradeCrew Secure 1.0 (1313) zu TestFlight; Quelle ist der aktuelle Owner-Chat. Apples Verarbeitung und tatsächliche Geräteverfügbarkeit sind noch offen. Die App-Store-Auswahl 1293 blieb unverändert.

Die Rückkehr zu einem neuen Test ist nativ bereits vorhanden und getestet. Eine eigene native Ansicht zur Lösungsfreigabe bietet dieser Client bisher nicht an; die hier reparierte Freigaberückmeldung betrifft Secure Web. Nächster Schritt: Verfügbarkeit von Build 1313 in TestFlight und physischen Handy-/iPad-Test bestätigen. Keine zweite Implementierung oder doppelten Builds; der Webumfang ist veröffentlicht und benötigt keinen weiteren Deploy.
