# GradeCrew: Umgebungen und Wiederherstellung

## Entscheidung vom 01.10.2026

Vier Rollen sind sinnvoll, aber eine vierte URL ist kein Backup und keine 100%-Garantie.

| Rolle | Zweck | Änderungen / Daten |
|---|---|---|
| Live | Freigegebene Version für echte Nutzung | Bewusste Releases; echte Daten |
| Staging / aktuelle Preview | Integration und laufende Tests | Häufige Änderungen; ausschließlich Testdaten |
| Games Lab | Entwicklung der Spiele | Separater Arbeitsstand; Testdaten; nicht als Gesamt-App deployen |
| Referenz / Release Candidate | Eingefrorener Stand für Abnahme und Vergleich | Keine automatischen Produktänderungen; eigener isolierter Testdatenbestand |

Die Referenzrolle wird zuerst durch ein versioniertes Release-Archiv erfüllt. Eine dauerhaft erreichbare Referenz-Seite ist noch nicht angelegt. Vor deren Einrichtung eigenes Firebase-Projekt einschließlich Auth, Daten, Regeln, Functions und Kostenrahmen festlegen. Eine zweite Hosting-Site im selben Projekt isoliert die Datenbank nicht. Ein Frontend mit kopierter Live-Konfiguration darf nicht als Testumgebung benutzt werden.

## Ab jetzt implementiert

`Archive verified preview` sichert nach erfolgreicher Preview-Veröffentlichung deren bereits gebaute Dateien und den Prüfbeleg als GitHub-Prerelease. Ein Tag zeigt auf den zugehörigen Quellcommit. Kein Neubau aus einem späteren Branch. Archiv und enthaltene Dateien werden per SHA-256 geprüft. Bestehende Releases werden nicht überschrieben.

Die Release-Dateien haben nicht die automatische Sieben-Tage-Löschung des CI-Build-Artefakts. Sie können weiterhin von berechtigten Personen gelöscht oder geändert werden: kein WORM-Speicher und keine unabhängige Offsite-Sicherung. Wiederholungen mit derselben SHA erzeugen keine neue Version. Alte Snapshots erst nach ausdrücklicher Aufbewahrungsentscheidung bereinigen.

Das Archiv enthält **Staging-Hosting**, keine Kopie der aktuellen Production-Dateien, Datenbank, Storage-Dateien oder Backend-Konfiguration. Das historische Live-Tag `v2.3.0_live_verified` bleibt eine Code-Referenz; es beweist nicht allein den aktuellen Cloud-Zustand.

## Wann gilt ein Release als freigegeben?

Keine erfundene Prozentanzeige. Zustände: **offen → technisch geprüft → am Gerät abgenommen → freigegeben**. Jede Freigabe gehört zu einem exakten Commit und einer Umgebung.

Vor Production müssen belegt sein:
- Code-/Build-Version und alle notwendigen CI-Prüfungen;
- Lehrerweg einschließlich PDF/Bilder/Uploads, Neuer Test, KI-Erstellung, Editor und Auswertung;
- Schülerweg einschließlich manueller/automatischer Abgabe, Wiederverbindung und Mehrfachabgabe;
- Tutorial auf echtem iPad/iPhone und Desktop, einschließlich Bildschirmtastatur;
- Security-Gates und erfolgreicher Paralleltest, derzeit weiterhin offen;
- passender Backend-/Rules-Stand und kompatibles Datenmodell;
- Daten-/Storage-Sicherung mit dokumentiertem Wiederherstellungstest;
- benannte vorherige Hosting-Version und getesteter Rückweg;
- ausdrückliche Production-Freigabe.

Die vorhandenen sogenannten Mobile-Tutorial-Checks sind automatisierte Regressionstests. Sie ersetzen keine visuelle Abnahme oder einen echten iPad-Durchlauf.

## Wiederherstellung

1. Fehler und betroffene Komponenten bestimmen, aktive Prüfungen berücksichtigen.
2. Vorherigen freigegebenen Stand samt Hosting-Release-ID, Backend-/Rules-Version und Datenkompatibilität prüfen.
3. Hosting-Rollback nur nach Production-Freigabe über Firebase-Releaseverlauf; ein Hosting-Rollback setzt weder Firestore noch Functions zurück.
4. Daten-Restore separat planen; neu eingegangene Abgaben nicht durch blindes Zurücksetzen verlieren.
5. Nach Wiederherstellung Smoke-Test, genaue Version und Ursache dokumentieren.

Zielwerte für Wiederherstellungsdauer und maximal akzeptablen Datenverlust werden erst nach einem echten Restore-Test festgelegt. Momentan besteht keine vollständig geprüfte Disaster-Recovery-Lösung.

Quelle: https://firebase.google.com/docs/hosting/manage-hosting-resources
