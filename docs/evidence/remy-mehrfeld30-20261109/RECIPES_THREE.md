# Runde 3 · Quellen, Labyrinth und Notentakt

GC-EXTENDED-QUESTION-TYPES-01 · 10.11.2026 · isolierter Testpilot.

Martin bat nach der Sichtung um einen klareren Quellenauftrag, ein sichtbares Labyrinth und echte Noten zum Einsetzen. Die Aufgaben der früheren Runden und ihre Urteile bleiben getrennt. Runde 3 enthält die überarbeiteten Referenzen und einen eigenen Einstieg für einen freien Wunsch.

- **Quellen:** Arbeitsauftrag über dem Feld, links nummerierte bzw. beschriftete Quellen und rechts Aussagen. Nach dem Klick auf eine Quelle erscheint direkt die nächste Handlung. Verbindungen werden als „A → 2“ sichtbar und können ersetzt werden. Die KI liefert fiktive Quellen und passende Aussagen; die fachliche Eindeutigkeit muss gesondert geprüft werden.
- **Labyrinth:** Zwei gezeichnete Raster mit Wand, Weg, Position und Blickrichtung. Die Regel steht über den Bildern. Der Baustein liest das Feld unmittelbar vor der Figur und leitet die Antwort ab.
- **Notentakt:** Schematische Notenköpfe, Hälse und Fähnchen auf Notenlinien. Eine gewählte Note wird sichtbar in den leeren Platz eingesetzt. Der Baustein prüft die Dauer im 3/4- oder 4/4-Takt. Tonhöhen, Melodie, punktierte Noten und freies Schreiben auf Notenlinien gehören zu späteren Rezepten.

Der eigene Wunsch liefert genau eine private Aufgabe. Remy wählt anhand des Inhalts eines der drei Rezepte und liefert Daten an den Baustein. Ein begrenzter Provider-Aufruf, kein automatischer Ersatz bei ungeeigneten Antworten. Stable Request-ID, separates Tageslimit (drei Proben beim synthetischen Konto), Versionsfingerabdruck für die Smileys. Vorhandener Testprojekt-Schlüssel und der bereits für Remy eingesetzte Dienstaccount. Keine neuen KI-Aufträge für die alten Runden.

## Weitere Ideen für unterscheidbare Lernhandlungen

| Idee | Was die Lernenden tun |
| --- | --- |
| Rhythmus nach Gehör | Zwei Takte hören und die fehlende Note oder Pause einsetzen. |
| Experiment fair planen | In einem Versuchsbild die einzige veränderte Größe markieren und passende Kontrollbedingungen wählen. |
| Entscheidungsbaum reparieren | In einem Ablauf mit einem konkreten Testfall den falschen Zweig finden und ersetzen. |
| Reise mit Karte und Zeit | Orte auf einer Karte markieren und Ereignisse auf einem Zeitstrahl eintragen. |
| Quellenkritik mit Ablenkern | Belege mit Aussagen verbinden und eine Quelle bewusst ungenutzt lassen, wenn sie nichts dazu aussagt. |
| Kräfte und Richtungen | Einen Pfeil am Angriffspunkt ansetzen, seine Richtung wählen und eine Länge innerhalb eines Toleranzbereichs treffen. |

Nächste Erweiterung bevorzugt als eigenes fachliches Rezept mit mindestens einem Gegenbeispiel und unabhängiger Bewertung prüfen. Die Beispiele allein belegen keine allgemeine Zuverlässigkeit über andere Wünsche hinweg.

## Verifizierter Stand im Testprojekt

Quelle `e99a17b5e3f03b6e5111f92e7dca1ac0e8b450e3`, [isolierte Remy-Vorschau](https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/). Neun Hostingdateien per SHA-256 geprüft. Von 97 Testfunktionen änderte sich nur die vorhandene Laborfunktion. Der bestehende Staging-Schlüssel wurde an diese Funktion gebunden. Firebase bestätigte den Zugriff desselben Dienstaccounts, den der bestehende Remy-Test-Worker schon mit diesem Schlüssel verwendet. Umfang: nur Vorschau und Laborfunktion.

Drei echte freie Wünsche mit dem synthetischen Testkonto über denselben Callable wie die Oberfläche. Die Wünsche nannten das Lernziel; das Modell wählte das Rezept. Drei abgeschlossene Providerantworten mit zusammen 2.562 Tokens. Dieselben Anfrage-IDs beim erneuten Prüfen lieferten die gespeicherten Aufgaben. Kein weiterer Provider-Aufruf. Vollständige, teilweise und leere Antworten wurden serverseitig geprüft:

| Freier Wunsch | Neu erzeugtes Ergebnis | Vollständig / teilweise / leer |
| --- | --- | --- |
| Belege aus einem erfundenen Hafenarchiv | Fahrtenbuch, Händlerliste und Hafentafel; unabhängiger fachlicher Abgleich der drei Belege | 1,5 / 1 / 0 |
| Zwei Bilder eines Roboterlabyrinths | Zwei Raster mit unterschiedlicher Blickrichtung und einmal Wand / einmal freier Weg | 1 / 0,5 / 0 |
| Drei unvollständige 3/4-Takte | Fehlende Achtel-, Viertel- und halbe Note | 1,5 / 1 / 0 |

17 lokale Tests bestanden. DOM-Tests prüfen die drei Interaktionen und den freien Wunsch einschließlich Wiederaufnahme mit derselben ID. Angemeldeter Browser zeigte Quellenauftrag und beide Labyrinthbilder. Drei eingefügte Noten ergaben dort 1,5 von 1,5 Punkten. Bestehende Stapel mit 30 und 12 Aufgaben und synthetische Alturteile per Serverprobe bestätigt. Die Live-KI-Proben liefen über die tatsächliche Laborfunktion, die Eingabeoberfläche zusätzlich separat im DOM-Test. Lehrkraftsichtung der neuen Rezepte steht aus.

[Hosting, Funktionsstand und Providerbelege](recipes/deployment.json) · [Quellen](recipes/sources.json) · [Labyrinth](recipes/maze.json) · [Notentakt](recipes/music.json).
