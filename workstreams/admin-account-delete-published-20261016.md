# Admin Kontolöschung bei veröffentlichten Tests

Auftrag vom 16. Oktober 2026: Ein veröffentlichter Test darf die ausdrücklich bestätigte Admin-Kontolöschung nicht blockieren. Die Entscheidung für das heutige Staging als künftige Live-Umgebung ist festgehalten; Nutzer sollen sich dort registrieren. Daraus folgt weder eine automatische Löschung vorhandener Konten noch eine bereits ausgeführte Umgebungsumschaltung.

## Ursache und Änderung

Browsermodul und die bereitgestellten Quellen beider Kontoverwaltungs-Callables wurden lesend mit dem kanonischen Stand `8f8697901f8c1aea89897be855ca2872c82d0f2b` verglichen: alle stimmen überein. Der Server blockierte trotzdem gewöhnliche `delete`-Vorschauen und neue `recover-delete`-Vorschauen bei veröffentlichten Tests mit `active-exam`. Nur `end-tests-delete` ließ die kombinierte Aktion zu. Die Weboberfläche übersetzte ihre normale Aktion in diesen Sonderweg.

Jetzt enthält jede neue Löschvorschau die genau betroffenen veröffentlichten Tests, auch bei ausdrücklich bestätigter Wiederaufnahme einer unvollständigen Löschung. Die normale Oberfläche verwendet die normale Aktion. Der bisherige kombinierte Aktionsname bleibt für ältere Clients gültig.

Nach Bestätigung werden die bestätigten Tests und der Konto-Löschmarker atomar reserviert: veröffentlicht aus, beendet an, Rundenbezug und vorhandener Endzeitpunkt erhalten. Erst danach werden Anmeldeidentität und die bereits vorgesehenen privaten Kontodaten entfernt. Schulische Tests, Abgaben, Ergebnisse und fremde Daten bleiben wie im bestehenden Bestätigungstext erhalten. Das ist keine zusätzliche pauschale Datenbereinigung.

Bereits gespeicherte, damals blockierte Vorschauen werden nicht nachträglich mächtiger: Die erneute Zustandsprüfung verlangt eine neue Bestätigung. Neue Tests oder geänderte Runden/Eigentümer nach einer Vorschau invalidieren sie. Laufende/alte Wiederholungen können keine unbestätigten neuen Veröffentlichungen mitnehmen; eine frische Wiederaufnahme zeigt diese ausdrücklich an. Selbstschutz, letzter aktiver Admin, frische Adminberechtigung, Identitätsabgleich, begrenzter Umfang, Jobsperre und Audit bleiben erhalten.

## Prüfung

- Regressionsphase vor Korrektur: vier Emulatorfälle scheiterten an `active-exam`; der neue Browser-Vertrag scheiterte am umgeleiteten Aktionsnamen.
- Danach lokal Node 22.23.3 und Java 21: Functions 262/262, Assessment-Functions 85/85, Browser-Suite 120/120, ESLint/Syntax bestanden.
- Emulator prüft echte Firestore-Transaktionen und Regeln. Auth-Löschung verwendet nur fiktive Identitäten; reale Konten wurden nicht gelöscht. Kontolöschung, wiederholte Bestätigungen, privater Datenzugriff, letzte Admins sowie bestehende Prüfungsabgaben/Nachfrist werden abgedeckt.
- Der erste UI-Gesamtlauf wurde ohne das für `review-scenes` vorgeschriebene VM-Flag gestartet und schlug deshalb fehl. Mit `--experimental-vm-modules` bestand die vollständige Suite. Kein fehlgeschlagener Lauf wird als Erfolg gezählt.

## Auslieferung

Kandidat `2.3.1-gc40`, eigener Fix-Branch. Cloud-Prüfung, unabhängiges Review und gezielte Bereitstellung stehen bei Erstellung dieses Nachweises noch aus. Vorgesehen sind nur die beiden bestehenden Staging-Kontoverwaltungsfunktionen und das Staging-Hosting. Keine Regeländerung, keine Production-Bereitstellung und keine Löschung eines echten Nutzerkontos im Rahmen der Entwicklung.
