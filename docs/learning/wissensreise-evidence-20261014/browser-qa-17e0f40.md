# Gezielte Browserprüfung: 17e0f40549cf3cdaf1f8f91983ee1841f565e55a

Datum: 14.10.2026. Eigener CUA-IAB-Tab, http://127.0.0.1:8786/fixture/, unveränderlicher Snapshot /private/tmp/gc-wissensreise-qa-17e0f40. Quelle, Anmeldung und Batchgenerator sind synthetisch; DOM, Inhaltskern und Service stammen aus dem Kandidaten. Keine Firebase-/Provideraufrufe, reale gespeicherte Lehrkrafttests, Produktion oder Geräteabnahme. Keine Runtime-Dateien geändert. Bestehender echter 120s-Lauf gehört ausschließlich zu 852c45d; dieser Bericht enthält gezielte Änderungen und einen ausdrücklich simulierten Timerablauf.

## Tatsächlich geprüfte Änderungen

- Der Einstieg zeigt weiterhin die eigene Testauswahl. Neu sind Geführt lernen/Frei üben und Wörter und Farben markieren.
- MARK2 enthält eine Aufgabe mit vier Kategorien und eine einfache Nomenmarkierung. Vier Kategorien wurden korrekt zugeordnet: Der/Artikel, Hund/Nomen, läuft/Verb, schnell/Adjektiv. Beschriftete native Menüs bieten Eingabe ohne Drag und ohne Farberkennung. Drei Felder wurden per Buchstabentasten, eines per selectOption gesetzt; Enter prüfte richtig. Einfache Markierung Katze/Garten wurde vollständig per Space/Enter korrekt gelöst.
- Geführte Phase mit genau zwei Quellaufgaben und deaktivierter Nachfüllung: Erklärung anschauen → Mit Unterstützung üben → Selbständig ausprobieren → Später noch einmal üben. Die Übergänge wurden über den normalen Nächste-Aufgabe-Weg beobachtet; Überspringen blieb ohne Sperre möglich. Fehlende geprüfte Erklärung der Originalquelle wurde ausdrücklich benannt.
- Hilfe auf der Original-Markierungsaufgabe: 1/3 allgemeiner Hinweis, 2/3 ausdrückliche Meldung über fehlendes geprüftes Beispiel, 3/3 freigegebene Lösung. Der Button änderte sich passend von Hilfe zu Erklärtes Beispiel zu Lernlösung anzeigen. Refresh erhielt dieselbe Aufgabe, die Phase Mit Unterstützung und den Text der dritten Hilfestufe.
- Ein generierter MARK2-Entwurf mit 14 Aufgaben blieb nach Refresh erhalten. Keine neue Generatorrunde wurde durch Refresh gestartet. Neuerstellen erzeugte anschließend bewusst einen neuen Zwei-Aufgaben-Entwurf.
- GENERIC2 wurde ausschließlich mit gewähltem Lückenformat vorbereitet: 0 direkt passende Quellaufgaben, 2 ausgeschlossene Originalformen. Der synthetische Generator lieferte 12 umgeformte Lücken aus Single und Ordering. Die Spielansicht zeigte eine Lücke zum roten Planeten; Mars wurde richtig bewertet. Damit ist die Browserroute für fachfremde Quelle und anderes Zielformat belegt, nicht die Qualität eines echten Modells.
- Für die Neustartprobe wurde die Fixture-Serveruhr ausdrücklich zweimal um 60s vorgezogen. Nach 0:00 war Neue Runde aktiv. Ein Klick startete mit derselben Freigabe eine neue Sitzung bei 2:00 und aktiven Lücken-/Antwort-/Hilfeaktionen. Der vorher gemeldete fehlende Neustart ist in diesem Kandidaten behoben.
- Die umgeformte Aufgabe zeigte Hinweis 1 aus ihren synthetischen Lernmetadaten und Hinweis 2 mit ausdrücklich synthetischem Erklärbeispiel. Kein fachlicher Inhalt aus fehlenden Metadaten erfunden.
- Markierungs-/Wiederholungsansicht bei 390x740: innerWidth und scrollWidth jeweils 390, Menüs 44px hoch, Buttons 46–70px hoch. Screenshot gesichert, temporärer Viewport anschließend zurückgesetzt. Keine physische Touch-/iPadbehauptung.
- Tab-Konsole error/warn=[] am Ende der Änderungen. Keine umfassende Netzwerkauditbehauptung.

## Ein neuer reproduzierter Befund

Teacher-Preview für Markwords zeigt Prompt, Schlüssel und Lernmetadaten, aber keinen Passage-Text. Bei MARK2 fehlen zum Beispiel „Der Hund läuft schnell.“ und „Die Katze spielt im Garten.“ in der Prüfansicht. Die Lehrkraft kann so den Kontext der Markierungen nicht vollständig prüfen, obwohl die Freigabecheckbox alle dargestellten Aufgaben/Lösungen bestätigen soll. Implementer, Root und Codeprüfer wurden informiert. Keine eigene Korrektur. Die Passage ist in der Spieleransicht vorhanden.

## Grenzen und offene Abnahme

Die Fixture-Pause führt zur Teacher-Auswahl. Der Produktionsbootstrap wurde gelesen und enthält jetzt eine separate Pausekarte mit Fortsetzen und Hinweis, dass der Countdown weiterläuft. Diese Abweichung verhindert einen Browserbeleg für den echten Bootstrap-Pauseweg. Echte Anmeldung, gespeicherter Lehrkrafttest, produktiver Generierungs-/QC-Weg, physisches Zielgerät, Versionswechsel und allgemeine Lösch-/Retentionkontrollen bleiben getrennte Nachweise. Kein Full-PASS, Merge oder Release empfohlen allein aufgrund dieses Berichts.

Screenshots: mark-guided-repeat-17e0f40-390.jpg, conversion-newround-hint2-17e0f40.jpg.

Nächster Schritt: den eng begrenzten Passage-Preview-Fix am nächsten unveränderlichen Kandidaten nachprüfen; anschließend QA-Berichte/Screenshots dem Root für die Releaseentscheidung übergeben.
