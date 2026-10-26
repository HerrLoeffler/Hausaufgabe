# Interaktive KI Aufgaben auf normalem Staging

Die Reparatur ist auf [Staging](https://gradecrew-staging-2026.web.app/workspace.html) veröffentlicht. Production bleibt unverändert. Stand: 26. Oktober 2026.

## Bedienung

Bei **Typ → Visuelle Interaktion** erscheint jetzt ein Dialog: Format wählen, optional einen Inhaltswunsch eingeben und **Mit KI anpassen** bestätigen. Dasselbe gilt beim Unterformatwechsel. Die bestehende KI erzeugt die Aufgabe neu. Abbrechen, Fehler oder veraltete Antworten erhalten die bisherige Fassung; Punkte bleiben erhalten.

Im echten Browser entstand aus „Berechne 25 % von 400 €“ der gewünschte Dreisatz: vier unabhängige Rechenpfeile, fünf offene Zeichen-/Zahlenfelder, je 0,5 Punkte. Der Entwurf wurde auf dem Server gespeichert. Anschließend erzeugte die KI eine passende Koordinatenaufgabe mit Achsen 0–100 % und 0–400 €, Eingabeschritt 1 und privater Lösung P(25|100).

![Echte KI Aufgabe im gespeicherten Entwurf](ai-dreisatz-saved.png)

Der Browser-Prüftest DAL2769M wurde parallel von unbekannter Stelle beendet, erneut veröffentlicht und auf Lehrkraftstart mit einer Minute gestellt. Die zweite Speicherung wurde deshalb beim aktiven Test abgelehnt. Die gespeicherte Dreisatzfassung und der lokale Koordinatenentwurf bleiben erhalten. Diese Reparatur hat den aktiven Test nicht beendet oder überschrieben; die parallele Veröffentlichung wurde hier nicht ausgelöst oder zugeordnet.

## Zwei echte größere Erstellungen

| Probe | Gespeichertes Ergebnis | Dauer ungefähr | Interne Providerrequests | Reparaturversuche |
|---|---|---|---|---|
| 20 Aufgaben / 60 Punkte | 8LXU3NB8, ready | 6 Minuten 18 Sekunden | 20 | 17 |
| 40 Aufgaben / 100 Punkte | DHAXCRZP, ready | 14 Minuten 5 Sekunden | 42 | 36 |

Beide verwenden die normalen Staging-Endpunkte und das vorhandene synthetische Konto. Es gab genau zwei logische Erstellungsaufträge und zwei zusätzliche echte Typ-/Unterformatanfragen im Browser. Die internen Providerzahlen der Browseranfragen wurden nicht separat ausgelesen.

Die Nutzungsnachweise der größeren Aufträge nennen gpt-5.6-luna mit 273.897 beziehungsweise 650.958 Tokens. Beide benötigten zwei Qualitätsprüfungen, aber keine vollständige Neugenerierung. Preise wurden nicht geschätzt. Frühere Lehrerbewertungen waren für das synthetische Konto nicht verfügbar; die entsprechende Prüfwarnung bleibt erhalten.

Alle 60 Aufgaben bestehen die geschlossene Datenprüfung; Anzahl und Punktesummen stimmen. Prozentrechnungen, Tabellen, Zahlenstrahlwerte, Rasteranteile und Verbindungen wurden inhaltlich geprüft. Die 9 beziehungsweise 28 Dreisätze wurden zusätzlich unabhängig auf konstantes Verhältnis oder konstantes Produkt geprüft. Alle ausdrücklichen Angaben von 0,5 Punkten je Feld stimmen. Der 40er-Test enthält einen umgekehrten Dreisatz. Diese beiden Serien betreffen Mathematik, Klasse 7; sie sind kein neuer fachübergreifender oder lernwissenschaftlicher Nachweis.

Die echte Serverauswertung des 20er-Tests bestätigt **60/60**, **59,5/60** bei einem falschen Dreisatzfeld und **0/60** bei leerer Abgabe. Wiederaufnahme erhält dieselben lösungsfreien Aufgaben; wiederholte Abgabe verändert kein Ergebnis. Nur dieser synthetische Test wurde für die Serverprüfung veröffentlicht; der 40er bleibt Entwurf.

## Ursachen und Korrekturen

Die ursprüngliche Fehlerreferenz **0602eab7** gehört zu einem Auftrag mit 20 Aufgaben und 60 Punkten, der in der Qualitätsprüfung mit einem allgemeinen Fehler endete. Sein ursprünglicher Entwurf wurde nicht aufbewahrt; der genaue Auslöser bleibt unbewiesen. Reproduziert und korrigiert wurde die Maskierung ungültiger Reparaturentwürfe: Strukturfehler bleiben jetzt konkret erhalten, bevor eine Qualitätsprojektion erfolgt. Technische Fehlerstellen werden begrenzt klassifiziert, ohne Aufgabentexte oder Antworten zu protokollieren.

Die zweite tatsächliche Erstellung mit 40 Aufgaben und 100 Punkten scheiterte an Koordinatenrastern der Aufgaben 21–30. Gültige Prozent-/Preisachsen von 0–100 beziehungsweise 0–400 mit Schritt 1 wurden durch die frühere Grenze von 30 Intervallen abgelehnt. Die Korrektur trennt das begrenzte Eingaberaster mit bis zu 10.000 Schritten von ungefähr 20 gezeichneten Hauptlinien je Achse. Private Koordinaten und Toleranzen werden nicht verändert; ungültige Raster bleiben gesperrt. Die ursprüngliche Aufgabenserie liegt nicht vor.

## Veröffentlichungsnachweis

PR [320](https://github.com/HerrLoeffler/Hausaufgabe/pull/320) und [321](https://github.com/HerrLoeffler/Hausaufgabe/pull/321) sind integriert. Zwölf KI-Funktionen verwenden den KI-Quellstand aus f391040d, sechs Assessmentfunktionen den zusammengesetzten Stand 4fe345c1. Die gerade aktualisierte persönliche Klassenraum-Bindung und Abgabe wurden ausdrücklich erhalten.

Die eigene Hosting-Veröffentlichung erhält 207 Dateien der tatsächlichen Klassenraumbasis f1bee946 und ändert nur acht Dateien, darunter zwei neue Module. Alle 215 Dateihashes stimmen. Die spätere additive Klassenraum-Veröffentlichung aa62f3da umfasst 216 geprüfte Dateien und erhält sämtliche eigenen Laufzeitdateien sowie den Formatwähler. Die Classroom-API-Route bleibt erhalten.

Genau 18 vorhandene Funktionen wurden aktualisiert; 62 andere Quellhashes bleiben gleich. Es wurden keine Funktionen angelegt oder gelöscht. Keine Rules-, Auth-, Native- oder Productionänderung.

Lokal bestehen 569 Web-/UI- und 468 Backendprüfungen sowie scoped ESLint. Die vier Prüfungen von PR320 und die Node-22-Prüfung von PR321 sind erfolgreich. Zwei unabhängige P2-Funde wurden behoben; die anschließende Prüfung der Klassenraumkomposition und Verpackung fand keinen offenen konkreten Blocker.

## Offene Punkte

Die großen Erstellungen funktionieren, brauchen aber noch viele automatische Korrekturen. **Für die Präsentation größere Tests vorab erstellen.** Reparaturzahl und Laufzeit zu senken bleibt P1, ohne fachliche oder technische Prüfungen abzuschalten. Martins fachliche Abnahme und physische Touchgerätetests bleiben offen.

Nachweise: [Erstellung 20](generation-20.json), [Erstellung 40](generation-40.json), [Inhaltsprüfung](content-verification.json), [Serverbewertung](server-verification.json), [Typwechsel](type-change.json), [Nutzung](usage-verification.json), [eigene Veröffentlichung](public-verification.json), [spätere Hosting-Version](later-hosting-verification.json), [Funktionen](functions-verification.json). Private Tokens und ursprüngliche Nutzerjobs bleiben außerhalb des Repositories. Die reproduzierbaren Probenwerkzeuge sind im [gesicherten Quellstand](https://github.com/HerrLoeffler/Hausaufgabe/tree/f4241d05995f2fbbd0d858d223de2daa3e8347a7/tools/visual-pilot) enthalten.
