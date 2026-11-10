# Runde 5 · Tonhöhen setzen

GC-EXTENDED-QUESTION-TYPES-01 · 10.11.2026 · isoliertes Remy-Testlabor.

- **G und A einzeln:** Zwei Notenplätze mit Orientierung an der untersten Linie. G4 liegt auf der zweiten Linie von unten. A4 liegt im Zwischenraum unmittelbar darüber.
- **Tonfolge:** Mehrere Töne von links nach rechts setzen. Der Orientierungshinweis entfällt. Jede Spalte ist per Maus, Touch oder nativer Tastaturwahl auf einer Linie oder in einem Zwischenraum bedienbar. Korrektur durch Wahl eines anderen Platzes.
- **Bewertung:** 0,5 Punkte je richtige Position. Der Builder legt die Positionen im Violinschlüssel fest und Remy liefert die Tonbezeichnungen. Die Vorschau erhält nur die Bezeichnungen, der Schlüssel bleibt privat. Der Pilot unterstützt E4 bis F5 und deutsches H, ohne Vorzeichen, Hilfslinien oder hörbare Melodien.

## Rückmeldung aus Runde 4

Martin meldete, der schwere Rhythmus wirke falsch und die Töne klängen schrill. Die Dauern, Pausen und Lücken des Referenztakts wurden erneut mit der Bewertung abgeglichen. Kein Widerspruch zwischen Audiodaten und Schlüssel gefunden. Das erklärt die konkrete Hörerfahrung nicht abschließend. Die Rhythmustöne sind jetzt tiefer und klavierähnlich synthetisiert, auch der Einzähler ist weicher. Die bestehenden Rhythmuswerte, Aufgabenversionen, Punkte und Urteile bleiben zugeordnet. Eine erneute pädagogische Hörsichtung steht aus.

Der freie Wunsch wählt zwischen den bestehenden Rezepten und Tonhöhen. Für die Erstprüfung gibt es zwei eigene, synthetische Tonhöhenaufträge. Die früheren Versuche und Zähler bleiben erhalten.

## Nachweis im Testprojekt

[Remy-Testlabor](https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/), Quelle `b34f56cbafcd68f6048ab639baa12793f72862cc`. Elf Hostingdateien per Hash bestätigt. Nur bestehender Vorschaukanal und isolierter Labor-Callable aktualisiert. 96 weitere Testfunktionen unverändert. Die vorhandenen fünf Stapelgrößen 30/12/3/3/2 und Alturteile sind per Serverprobe bestätigt.

| Freier KI-Wunsch | Erzeugte Aufgabe | Voll / eine Position daneben / leer |
| --- | --- | --- |
| G und A einzeln mit Orientierung | G und A im Violinschlüssel, Orientierung an E | 1 / 0,5 / 0 |
| Fünf Töne als schwierigere Folge | A–G–H–C–G, ohne Orientierung | 2,5 / 2 / 0 |

Zwei echte Providerantworten, 2.442 erfasste Tokens. Die Tonfolge und alle Notenpositionen wurden unabhängig gegen den Violinschlüssel abgeglichen. Wiederaufnahme derselben beiden Anfrage-IDs lieferte die gespeicherten Aufgaben. Die freien Wünsche gingen an denselben Callable wie aus der Eingabeoberfläche. Der Formularpfad wurde bereits separat geprüft.

27 lokale Tests grün. Im angemeldeten Browser wurde G per Klick und A per Pfeiltaste gesetzt. Die sichtbare Bewertung ergab 1 von 1 Punkten. Die schwerere Referenz mit sechs Tönen wurde geöffnet. Vor dem Wechsel zeigte die Rhythmusrunde weiterhin das vorhandene Urteil. Live-Probe des weicheren Rhythmus: etwa 260 Hz Grundfrequenz, beide Lücken und voller Punktwert erhalten. Die Rhythmus-Antwortdaten blieben identisch. Physische Touchprüfung und erneute Lehrkraftsichtung stehen aus.

[Auslieferung und Providerbelege](pitch/deployment.json) · [Einzeltöne](pitch/single.json) · [Tonfolge](pitch/sequence.json) · [Rhythmusprobe](pitch/rhythm-feedback.json).
