# Testify · Nachtarbeit auf Staging

Stand: 26. September 2026. Arbeitsbranch `feature/ai-integration`; ausschließlich das Firebase-Projekt `hausaufgabe-staging`. Produktion nur nach ausdrücklicher Freigabe.

**Quellstand:** Die auf Staging ausgelieferte Frontend-Version `ai24` enthielt zusätzliche Funktionen für zwei parallele KI-Aufträge, Aufgabenvarianten und Fehlerdiagnose, die noch nicht im Git-Branch waren. Diese Frontend-Änderungen wurden in `ai25` übernommen. Der zugehörige Functions-Quellstand aus der Cloud Shell muss noch in Git abgeglichen werden. Bis dahin ausschließlich `./deploy-staging-hosting.sh` verwenden; `./deploy-staging.sh` blockiert standardmäßig einen möglichen Rückschritt des Backends.

## Produktziel und Nachweis

Testify soll Lehrkräften verlässliche digitale Leistungsnachweise ermöglichen: einen Test schnell erstellen, fachlich kontrollieren, sicher durchführen und Ergebnisse nachvollziehbar auswerten. Jede Änderung braucht eine beobachtbare Verbesserung für eine dieser Aufgaben. Farben und Abstände allein gelten nicht als abgeschlossene Neugestaltung.

## Prioritäten

1. **Erstellung zuverlässig machen.** KI-Ausgaben mit genau der angeforderten Aufgabenzahl verarbeiten; überzählige Aufgaben, doppelte Antwortoptionen, mehrdeutige Lösungen und ungültige Zuordnungen gezielt reparieren oder verständlich melden. Die Fehler `AI-CREATE-001` (15 angefordert, 16 geliefert; doppelte Optionen) und `functions/internal` anhand der vorhandenen Referenzen reproduzieren. Ein fehlgeschlagener Auftrag darf keinen fertigen Test vortäuschen. Bereits gespeicherte Teilentwürfe und ihre Diagnose erhalten.
2. **Prüfabschluss dauerhaft respektieren.** Ein fertiger KI-Auftrag ist ein Erstellungsstatus, keine Dauererinnerung. „Prüfung abgeschlossen“ muss den Status am Test speichern und die Karte sowie Qualitätswarnungen nach Navigation, Neuladen und auf einem zweiten Gerät ausblenden. Eine Veröffentlichung blendet die Erinnerung ebenfalls aus. „Später“ verschiebt nur; ein neues KI-Ergebnis für einen anderen Test darf wieder sichtbar sein. Den konkreten Fall aus dem Dashboard-Screenshot mit „Entwurf fertig. Bitte die Aufgaben prüfen.“ kontrollieren.
3. **Sichtbares Produktdesign liefern.** Die angemeldete Dashboard-Ansicht, KI-Erstellung, Editor und Schüleransicht als zusammenhängende Arbeitswege prüfen. Einstieg, wichtigste Aktion, Fortschritt, Filter, Warnungen und mobile Zustände klar staffeln. Vorher und nachher Screenshots auf Staging bei 390 und 1440 Pixeln mit angemeldetem Testkonto erfassen; Version im Seitenquelltext prüfen. Kein Design als „live“ melden, solange der sichtbare Staging-Stand unverändert ist.
4. **Bilder begrenzen.** Bilder in Fragestellungen bleiben möglich. KI-generierte Bilder als Antwortoptionen unterbinden; bereits vorhandene Bildfragen lesbar und bearbeitbar lassen.
5. **Diagnose und Betrieb.** Fehlerberichte im Adminbereich mit einem Knopf vollständig kopieren können, einschließlich Referenz, Aktion, Ursache, Version und Umfeld. Die KI-Aufträge nach Verlassen und Wiederöffnen der Seite weiterlaufen und den Fortschritt korrekt anzeigen. Regressionsrisiken bei Veröffentlichung, gespeicherten Entwürfen und Schülerantworten prüfen.

## Arbeitsrhythmus

- Jeweils einen vertikalen Nutzungsfall fertigstellen: Ursache, Änderung, aussagekräftige Prüfung, Commit, Staging-Ansicht und Restproblem dokumentieren.
- Bestehende Tests plus gezielte Fälle für die reparierten Fehlermodi ausführen. Kein Deployment bei roten Checks.
- Nach jedem Deployment die sichtbare Versionsnummer, geladene CSS/JS-Dateien und den tatsächlichen Ablauf auf Staging kontrollieren. Den Branch erneut lesen, bevor Änderungen gepusht werden, falls parallel in der Cloud Shell gearbeitet wird.
- Fortschritt im Plan mit Commit, Staging-Version, geprüftem Nutzungsfall und offenen Punkten ergänzen. Produktionsdeployment gesondert vorbereiten und dem Nutzer zur Freigabe vorlegen.

## Abnahmefälle

- 15 angeforderte Aufgaben ergeben 15 gültige, eindeutig lösbare Aufgaben oder eine genaue Meldung mit Referenz und erhaltenem Teilentwurf.
- Nach „Prüfung abgeschlossen“ oder Veröffentlichung erscheint die alte Fertigkarte nach Reload nicht wieder; ein noch laufender Auftrag zeigt weiterhin seinen Fortschritt.
- Dashboard, Editor und KI-Erstellung unterscheiden sich sichtbar vom Ausgangsstand und bleiben bei Tastatur, schmalem Mobilbildschirm und Desktop bedienbar.
- Die Staging-Version und Screenshots belegen die ausgelieferte Änderung; Produktion bleibt unberührt.
