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

Releasequelle `21c919bfa41cb7d030d93e719789d0813bdc78e7`, Version `2.3.1-gc40`, Baum `782c77009a8bfb944604e6e6178b0ef2b08d12de`. Der kanonische Branch `feature/gradecrew-app-integration` wurde nach grüner Prüfung auf genau diesen Commit vorgezogen.

- [Fix-Branch: vollständige AI Staging Checks](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38876544178) und [Admin-Prüfung](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38876544142): erfolgreich.
- [Kanonischer Branch: vollständige AI Staging Checks](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38876929644) und [Admin-Prüfung](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38876929649): erfolgreich, derselbe Commit.
- Unabhängiges Review: keine kritischen oder wichtigen Befunde. Bekannte bestehende Einschränkung: Nach einer unvollständigen Aktion mit neu hinzugekommenen veröffentlichten Tests muss die Administration neu geladen werden, um über „Löschung fortsetzen“ eine neue ausdrückliche Bestätigung einzuholen. Alte Wiederholungen erhalten keine erweiterten Rechte.
- Ausschließlich die beiden bestehenden Staging-Funktionen wurden aktualisiert und als `ACTIVE` bestätigt: `previewadminaccountaction-00009-lub` und `executeadminaccountaction-00009-hot`. Die tatsächlich bereitgestellten Quellarchive beider Funktionen stimmen bytegenau mit dem geprüften Löschmodul überein.
- Der erste CLI-Aufruf ohne Codebase-Präfix fand keine Funktion und brach ohne Bereitstellung ab. Der erfolgreiche Aufruf verwendete gezielt `functions:ai:previewAdminAccountAction,functions:ai:executeAdminAccountAction`.

Staging-Hosting wurde erfolgreich bereitgestellt. Das öffentliche Release-Manifest bestätigt `2.3.1-gc40` und den Releasecommit `21c919bfa41cb7d030d93e719789d0813bdc78e7`; alle 165 ausgelieferten Dateien stimmen mit ihren SHA-256-Manifestwerten überein (`tools/verify-staging.mjs`). Die zusätzliche 166. Hostingdatei ist das Manifest selbst. Keine Regeländerung, keine Production-Bereitstellung und keine Löschung eines echten Nutzerkontos im Rahmen der Entwicklung. `main` wurde anschließend unverändert auf `8560992c072779814017ebac6e86b65e938bc951` bestätigt. Eine echte Admin-Löschung bleibt ein manueller Gerätetest des Nutzers.
