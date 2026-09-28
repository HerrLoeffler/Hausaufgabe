# Abgesicherte Prüfungsdurchführung · nächster Ausbau

Stand: 28. September 2026. Technischer Vorschlag, noch keine verfügbare Sicherheitsfunktion.

Exam.net beschreibt seine höchste Sicherheitsstufe als Nutzung nativer Anwendungen oder sicherer Prüfungsbrowser. Safe Exam Browser dokumentiert eine Integration mit Konfigurationsdateien und Browser Exam Key beziehungsweise Config Key. Ein gewöhnlicher Browser kann einen Gerätewechsel oder das Öffnen anderer Programme nicht zuverlässig verhindern. Eine Vollbildansicht darf deshalb nicht als Gerätesperre angeboten werden.

## Reihenfolge für GradeCrew

1. **Lösungen schützen und serverseitig bewerten.** Aktuell erlaubt `firestore.rules` das Lesen von Aufgaben veröffentlichter Tests; das Aufgabenformat enthält Lösungen. Öffentliche Aufgabenansicht von privatem Lösungsschlüssel trennen. Eine serverseitige Startfunktion liefert nur zulässige Fragen. Abgabe und Punktevergabe gehen ausschließlich durch geprüfte Serverfunktionen. Alte Tests brauchen eine versionierte, rücksetzbare Migration vor dem Schließen der bisherigen Zugriffe.
2. **Prüfungssitzungen verbindlich machen.** Kurzlebiger, auf einen Testlauf beschränkter Zugang; serverseitige Start- und Endzeiten; idempotente Abgabe; Wiederaufnahme bei Netzverlust. Neue Durchgänge erhalten neue Sitzungs-IDs. Ein Reset darf alte Zugänge nicht erneut gültig machen.
3. **Beaufsichtigten Browsermodus ergänzen.** Vollbildanfrage und Hinweise auf Fokusverlust können Lehrkräften Orientierung geben. Wiederverbindung, Autosave und klare Rückmeldung an Schüler haben Vorrang. Fokusverlust allein ist kein Beweis für Täuschung; keine automatische Strafbewertung.
4. **SEB-Pilot auf Staging.** Einen kontrollierten Prüfungsstart mit passender `.seb`-Konfiguration entwickeln. Der Server prüft den vorgesehenen Konfigurations-/Prüfungsschlüssel und die Sitzung vor Ausgabe der Fragen. Keine bloße User-Agent-Erkennung. Den Datenpfad so gestalten, dass direkte Firestore-Zugriffe diese Prüfung nicht umgehen können. Unterstützung zunächst auf tatsächlich getestete Betriebssysteme begrenzen; Gerätebestand der Schule bestimmt den Pilotumfang.
5. **Lehreransicht und Ausfalltests.** Verbunden/getrennt/abgegeben, Pausieren und gezieltes Freigeben. Tests für Offline-Wiederaufnahme, abgelaufene Zugänge, fremde Sitzungen, parallele Abgabe, manipulierte Punkte und unzulässigen Zugriff auf Lösungen.

Das ist ein eigener Backend- und Integrationsschritt. Die gc1-Veröffentlichung ändert nur Hosting und führt weder Gerätesperren noch neue Überwachung ein. Ein zweites Gerät außerhalb des Prüfungsgeräts bleibt auch mit sicherem Prüfungsbrowser eine organisatorische Aufsichtsfrage.

## Primärquellen

- [Exam.net: Sicherheitsstufen](https://exam.net/cheat)
- [Safe Exam Browser: Integration](https://safeexambrowser.org/developer/seb-integration.html)
- [Safe Exam Browser: technische Dokumentation](https://safeexambrowser.org/developer/overview.html)

Die konkrete GradeCrew-Architektur oben ist unsere Ableitung aus dem vorhandenen Quellcode und diesen Integrationsprinzipien, keine Aussage über Exam.nets interne Implementierung.
