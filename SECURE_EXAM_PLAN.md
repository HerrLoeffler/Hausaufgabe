# Abgesicherte Prüfungsdurchführung · nächster Ausbau

Stand: 29. September 2026.

## Akuter Befund aus dem Staging-Test

Im realen Schülerfluss wurde ein konkreter Missbrauchspfad gefunden: Nach einer Abgabe können bei aktivierter Lösungsanzeige die Lösungen erscheinen; über Browser-Zurück beziehungsweise eine wiederhergestellte Schüleransicht kann anschließend erneut gearbeitet und erneut abgegeben werden. Weil die bisherige Abgabe mit einem neuen zufälligen Firestore-Dokument angelegt wird, können dabei mehrere Abgaben desselben Bearbeitungsversuchs entstehen. Das erklärt auch mehrfach auftauchende Schülerabgaben in der Lehrkraftansicht.

Als unmittelbare Eindämmung wurde `student-attempt-guard.js` ergänzt. Auf öffentlichen Schülerlinks werden Lösungen während einer laufenden Durchführung nicht mehr angezeigt, eine erfolgreich erkannte Abgabe wird lokal für denselben Versuch versiegelt, wiederhergestellte Formulare werden deaktiviert und Back-/bfcache-Wiederherstellungen dürfen nicht erneut absenden. Neue echte Zeit-/Sitzungsversuche mit anderer Attempt-/Run-ID bleiben möglich. Lehrkraft-Vorschauen werden nicht verändert.

Diese Sperre ist bewusst nur ein **Client-Hotfix**, keine vollständige Prüfungsabsicherung. Ein Schüler kann Browser-Speicher löschen, einen anderen Browser beziehungsweise ein anderes Gerät verwenden oder technisch direkt auf noch öffentlich lesbare Fragedokumente zugreifen. Deshalb bleibt der folgende Backend-Umbau erforderlich.

Exam.net beschreibt seine höchste Sicherheitsstufe als Nutzung nativer Anwendungen oder sicherer Prüfungsbrowser. Safe Exam Browser dokumentiert eine Integration mit Konfigurationsdateien und Browser Exam Key beziehungsweise Config Key. Ein gewöhnlicher Browser kann einen Gerätewechsel oder das Öffnen anderer Programme nicht zuverlässig verhindern. Eine Vollbildansicht darf deshalb nicht als Gerätesperre angeboten werden.

## Reihenfolge für GradeCrew

1. **Lösungen schützen und serverseitig bewerten.** Aktuell erlaubt `firestore.rules` das Lesen von Aufgaben veröffentlichter Tests; das Aufgabenformat enthält Lösungen. Öffentliche Aufgabenansicht von privatem Lösungsschlüssel trennen. Eine serverseitige Startfunktion liefert nur zulässige Fragen. Abgabe und Punktevergabe gehen ausschließlich durch geprüfte Serverfunktionen. Alte Tests brauchen eine versionierte, rücksetzbare Migration vor dem Schließen der bisherigen Zugriffe.
2. **Prüfungssitzungen verbindlich machen.** Jeder Schülerdurchgang – auch ohne Zeitlimit – erhält serverseitig eine Attempt-ID. Abgaben werden idempotent genau unter dieser Attempt-ID gespeichert. Eine serverseitige Transaktion akzeptiert nur `running -> submitted`; eine zweite Abgabe desselben Attempts liefert dieselbe Quittung statt eines neuen Ergebnisses. Neue Durchgänge erhalten neue Sitzungs-/Attempt-IDs. Ein Reset darf alte Zugänge nicht erneut gültig machen.
3. **Lösungsfreigabe vom Abgabezeitpunkt trennen.** Eine Abgabe darf niemals automatisch den Lösungsschlüssel an den Schülerclient zurückgeben, solange der Testlauf offen ist. Lösungen werden erst durch eine ausdrückliche Lehrerfreigabe oder einen klar definierten Endzustand ausgeliefert.
4. **Beaufsichtigten Browsermodus ergänzen.** Vollbildanfrage und Hinweise auf Fokusverlust können Lehrkräften Orientierung geben. Wiederverbindung, Autosave und klare Rückmeldung an Schüler haben Vorrang. Fokusverlust allein ist kein Beweis für Täuschung; keine automatische Strafbewertung.
5. **SEB-Pilot auf Staging.** Einen kontrollierten Prüfungsstart mit passender `.seb`-Konfiguration entwickeln. Der Server prüft den vorgesehenen Konfigurations-/Prüfungsschlüssel und die Sitzung vor Ausgabe der Fragen. Keine bloße User-Agent-Erkennung. Den Datenpfad so gestalten, dass direkte Firestore-Zugriffe diese Prüfung nicht umgehen können. Unterstützung zunächst auf tatsächlich getestete Betriebssysteme begrenzen; Gerätebestand der Schule bestimmt den Pilotumfang.
6. **Lehreransicht und Ausfalltests.** Verbunden/getrennt/abgegeben, Pausieren und gezieltes Freigeben. Tests für Browser-Zurück, bfcache, Reload, Offline-Wiederaufnahme, abgelaufene Zugänge, fremde Sitzungen, parallele Abgabe, manipulierte Punkte, doppelte Abgabe und unzulässigen Zugriff auf Lösungen.

Das ist ein eigener Backend- und Integrationsschritt. Die gc1-Veröffentlichung ändert nur Hosting und führt weder Gerätesperren noch neue Überwachung ein. Ein zweites Gerät außerhalb des Prüfungsgeräts bleibt auch mit sicherem Prüfungsbrowser eine organisatorische Aufsichtsfrage.

## Primärquellen

- [Exam.net: Sicherheitsstufen](https://exam.net/cheat)
- [Safe Exam Browser: Integration](https://safeexambrowser.org/developer/seb-integration.html)
- [Safe Exam Browser: technische Dokumentation](https://safeexambrowser.org/developer/overview.html)

Die konkrete GradeCrew-Architektur oben ist unsere Ableitung aus dem vorhandenen Quellcode und diesen Integrationsprinzipien, keine Aussage über Exam.nets interne Implementierung.
