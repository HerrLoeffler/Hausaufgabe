# Lerngehirn mit echter KI: Erweitern von Brüchen

GC-ADAPTIVE-PRACTICE-01. Aktiver lokaler Prototyp vom20.10.2026 nach dem quellenbasierten [Didaktikentwurf](../../concepts/adaptive-practice-01-didactics.md). Keine Produktintegration, kein Cloud-/Productiondeploy. Die früheren Additions-/Pizza-/10-Sekunden-Module bleiben historische Vergleichsstände; `app.mjs` startet jetzt ausschließlich `expansion.mjs`.

## Start und Zugang

Im Verzeichnis `python3 server.py` starten, dann http://127.0.0.1:8769/preview.html. Lerngehirn → Mathe → Bruchzahlen startet Erweitern. Standard20Minuten, einstellbar1–90; ein Zeitlimit ist kein Könnensnachweis.

Vorhandenes gewöhnliches Lehrkraft-Testkonto ausschließlich im getrennten Projekt `gradecrew-staging-2026`. Keine neue Anmeldung, Rolle oder Key nötig. Eigene zufällige Kontodaten verbleiben im bisherigen privaten Elternordner außerhalb Webroot/Checkout, Modus600. Kein Schulzugang, keine Providerkeys im Browser. Origin-/Hostprüfung und HttpOnly/SameSite-Strict-Cookie bleiben erhalten; statische Dateiliste wurde nur um das neue Modul erweitert.

## Echte KI und gezielte Hilfe

Neue Aufgaben entstehen über den vorhandenen GradeCrew-Callable `regenerateQuestion`. Emmi prüft den Entwurf gesondert. Für Hilfen erhält Emmi die konkrete Ausgangsaufgabe, die tatsächliche Antwort, den exakt berechneten Schlüssel und das Ziel des aktuellen Teilschritts. Emmi formuliert die kurze Erklärung und die direkt beantwortbare Frage; eine zweite KI-Anfrage prüft die Passung. Kein lokaler Beispielpool wird als echte KI ausgegeben. Die zweite KI ist derselbe Dienst, keine Garantie eines unabhängigen Modells oder einer menschlichen Fachfreigabe.

- Falscher Zähler bei richtigem Nenner: nur den Zählerschritt klären.
- Falscher Nenner bei richtigem Zähler: nur die Gesamtzahl der Teile klären.
- Beide falsch: gleicher Faktor für beide Zahlen, danach ein Rechenschritt.
- Weitere Hilfefehler: einfacheres Beispiel mit1/2 und Faktor2, dann nur ein einzelnes altes Stück, das halbiert wird. Nicht bloß neue Zahlen auf gleichem Niveau.
- Nach erneutem Scheitern: vollständige kurze Hilfe und gemeinsames Anschauen empfehlen; kein endloses Raten. Eine neue einfache Aufgabe bleibt auf Wunsch möglich.
- Nach unterstütztem Erfolg: zur ursprünglichen Aufgabe zurück, korrekten Teil vorgeben; danach neue einfache Aufgabe ohne Hilfe. Bereits gezeigte Aufgaben sind für neue unabhängige Proben gesperrt.
- Nach selbstständigem Erfolg: neue Probe mit anderem Faktor; später Zielnenner und Faktor selbst bestimmen. Keine automatische Erklärung, keine Zehn-Sekunden-Sperre und kein grüner Beherrschungsstatus.

Eine KI-Frage hat immer ein echtes Antwortfeld. Bilder erscheinen nur zur passenden Hilfe und werden exakt aus den geprüften Zahlen gezeichnet. Originalaufgabe und abgegebener Ergebnisbruch bleiben bei der Hilfe sichtbar. Bei freier Rückfrage zählt ein späterer Erfolg nicht als unabhängig. Die Anzeige trennt selbstständige Antworten, unterstützte Abschlüsse und noch nicht geprüftes Behalten/Übertragen.

## Mathematische Prüfung

Bruchwerte werden exakt mit rationaler Rechnung geprüft. Beim Auftrag „mit Faktor2 erweitern“ gehört die konkrete Veränderung beider Zahlen zum Ziel. Ein anderer gleichwertiger Bruch wird ausdrücklich als gleichwertig erkannt, erfüllt aber möglicherweise den verlangten Faktor nicht. Das ist keine pauschale Falschwertung aller ungekürzten Brüche.

Der Server hält Lernzustand und bearbeitete Varianten im Arbeitsspeicher, kontrolliert `stepId` und puffert erfolgreiche `requestId`-Antworten. Gleiche Wiederholung verursacht keine weitere KI-Anfrage; geänderter Inhalt mit gleicher Kennung wird abgelehnt. Keine dauerhafte Schülerakte. Ein Serverneustart beendet diese flüchtigen Beispielsitzungen; Browserrefresh beginnt eine neue Vorschau.

## Begrenzter Testrahmen

Die bisherige80er-Versuchshistorie bleibt erhalten. Der neue explizite Auftrag erweitert den lokalen Gesamtrahmen auf120Endpunktaufrufe, also höchstens40zusätzliche Schritte für Test und Vorschau. Kein Reset, keine weitere automatische Erhöhung. Normalerweise zwei kostenpflichtige Backendaufrufe je Schritt; interne Providerwiederholungen können hinzukommen. Keine bekannte Token-/Eurogarantie. Bestehende Backendquoten bleiben wirksam.

`GC_EXPANSION_TRACE=1` ist ausschließlich eine lokale Diagnoseoption für synthetische eigene Testläufe. Sie speichert Modellantworten außerhalb des Checkouts/Webroots mit Modus600. Bei normalem Start deaktiviert; nicht für echte Schülerangaben aktivieren. Rohdaten und Kontodateien nicht committen oder über HTTP ausliefern.

## Prüfung und Grenzen

`node --test *.test.mjs` und `python3 -m unittest discover -p 'test_*.py'` prüfen den gesamten lokalen Prototypscope, einschließlich historischer Module. Neue Regressionen decken wiederholte Fehler, Zähler-/Nennertrennung, unterstützte Erfolge, Variantenwiederholung, API-Handler, Antwortschlüssel und Bruchstreifen ab. [Reale Versuche und bekannte Grenzen](LIVE-TEST.md) werden mit dem tatsächlichen Verbrauch fortgeschrieben.

Das ist ein enges Erweitern-Modul, keine fertige Diagnose für beliebige Fächer. Lernwirkung, Unterrichtseinsatz, körperliche Geräte und vollständige Accessibility benötigen separate menschliche Abnahme. Vorhandene Materialprofile und ihre Herkunft bleiben dokumentiert; neue Hilfe basiert auf eigenen Darstellungen und dem Forschungsentwurf, nicht auf kopierten Buchgrafiken oder einem angeblich bereits vollständig erschlossenen Eduki-Bestand.
