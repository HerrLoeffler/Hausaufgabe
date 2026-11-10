# Runde 4 · Rhythmus hören

GC-EXTENDED-QUESTION-TYPES-01 · 10.11.2026 · isoliertes Remy-Testlabor. Martin wünscht eine Hörübung mit einsetzbaren Noten und Pausen sowie deutlich steigerbare Schwierigkeit. Die letzte gespeicherte Bewertung des Notentakts aus Runde 3 war positiv; der konkrete Ausbauwunsch kommt aus dem Chat.

- **Mit Notenbild:** Einzähler, leiser Viertelpuls im Takt und eine Lücke. Alle anderen Notenwerte bleiben sichtbar.
- **Ohne Notenbild:** Der leise Viertelpuls bleibt. Andere Symbole werden durch neutrale Stellen ersetzt.
- **Rhythmusdiktat:** Die vorgegebenen Symbole sind ausgeblendet. Zwei Lücken enthalten je eine Note und eine Pause. Der Einzähler legt das Tempo fest; im Takt fällt der Zählpuls weg.

Pro Lücke setzt die Auswahl ein gezeichnetes Noten- oder Pausenzeichen ein. Je richtiger Art **und** Dauer 0,5 Punkte. 3/4 und 4/4, Achtel, Viertel und Halbe, 58–116 BPM. Die Lücken werden im Audio kurz markiert. Ton und Stille werden aus demselben Rhythmus wie die serverseitige Lösung erzeugt. Direkt aneinandergrenzende Pausen werden abgelehnt, weil sie nicht als getrennte Ereignisse hörbar wären.

Der Browser erhält die Audio-Datei erst beim Laden der Karte nach Konto- und Versionsprüfung. Die Aufgabenansicht liefert weder verdeckte Notenwerte noch Lösungsschlüssel. Audio wird im isolierten Callable als mono PCM-WAV erzeugt. Töne, Pausen, Einzähler und Zählpuls benötigen keinen zusätzlichen Medienaufruf. Bei einem Stapelwechsel endet die Wiedergabe sofort. Die vorhandene freie Remy-Erstellung erkennt Hörwünsche, wählt Stufe und Inhalt und übergibt die strukturierten Werte an den Baustein.

Die synthetischen Versuche für die vorherigen Formate bleiben unverändert dokumentiert. Es gibt einen eigenen Vorrat von zwei genau dieser neuen Rhythmuswünsche für das synthetische Konto. Bestehende Tagesgrenzen für andere Lehrkraftkonten werden gemeinsam weitergeführt.

## Tonhöhe als eigenes Folgerezept

Im Violinschlüssel zunächst einen einzelnen Ton wie G oder A durch Anklicken einer Linie oder eines Zwischenraums setzen. Hilfestufe 1 zeigt einen Orientierungston und hebt die möglichen Positionen hervor. Danach entfallen Hinweise, und eine kleine Tonfolge wird Schritt für Schritt notiert. Weitere Varianten wären Bassschlüssel, Hilfslinien oder eine gehörte Tonfolge mit Referenzton. Der Tonhöhenbaustein benötigt dafür Schlüssel und Oktavlage im Datenvertrag. Der Hörpilot hier prüft Rhythmus mit einem neutralen Ton, keine Tonhöhen.

## Nachweis auf der Testseite

[Remy-Testlabor](https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/), Quelle `cb815e920b0e98d00229169b709beaeaf620903d`. Zehn Hostingdateien per Hash abgeglichen. Nur vorhandener isolierter Callable und Vorschaukanal aktualisiert. 96 andere Testfunktionen unverändert. Serverprobe bestätigt alle vier Runden (30/12/3/3 Karten) und erhaltene Alturteile. 23 lokale Tests grün, unabhängiger Review führte zu WAV-Padding und sofortigem Audiostopp beim Stapelwechsel.

| Freier Wunsch | Neu erzeugtes Ergebnis | Richtig / falsche Art in einer Lücke / leer |
| --- | --- | --- |
| Leichter 3/4-Hörtakt mit sichtbaren Noten und einer Viertelpause am Anfang | 5,00 s mit Einzähler und Puls. Audioanalyse erkennt Viertelpause. | 0,5 / 0 / 0 |
| Schwerer 4/4-Hörtakt mit ausgeblendeten Noten und zwei Lücken ohne Taktpuls | 5,71 s mit Einzähler. Audioanalyse erkennt Viertelnote und Achtelpause. | 1 / 0,5 / 0 |

Zwei echte Providerantworten, 2.208 erfasste Tokens. Wiederaufnahme der beiden Anfrage-IDs liefert dieselben Entwürfe. Die Antworten im Test wurden aus den öffentlich für das authentifizierte Konto gelieferten WAV-Samples und Markierungszeiten abgeleitet, bevor sie serverseitig bewertet wurden. Ein Audioabruf erzeugt keinen Provideraufruf. Der freie Wunsch wurde an denselben Callable wie aus der Oberfläche übergeben; der Formularpfad und Wiederaufnahme sind durch den vorhandenen DOM-Test geprüft.

Browserprobe am leichten Referenztakt: WAV-Dauer 6,666625 s, Zeitachse nach Start bei 2,317419 s ohne Medienfehler. Eine Viertelpause sichtbar eingesetzt, Ausgabe 0,5 von 0,5 Punkten. Die schwere Karte mit zwei Lücken wurde im Browser geöffnet. Die Wellenformprüfung bestätigt technisch Ton, Stille und Timing. Eine pädagogische Hörprüfung mit Lernenden steht aus.

[Deployment und Providerbelege](rhythm/deployment.json) · [Leichter Wunsch](rhythm/pause.json) · [Schwerer Wunsch](rhythm/diktat.json).
