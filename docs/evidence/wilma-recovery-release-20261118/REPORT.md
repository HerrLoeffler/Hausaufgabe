# Wilma-Recovery und großzügige Schüleraufgaben · 18.11.2026

**Production:** Quelle `d67b0b5b1d4b15ad85ae88f86cfffe761da2f7f2`, Tree `4ff814bac8dc3744ab75dcbae7f1b49f0ae909f5`, [PR438](https://github.com/HerrLoeffler/Hausaufgabe/pull/438). Die direkte Freigabe umfasst ausschließlich `reviewWilmaAnswers` und Hosting. Bestehende Tasks, Grenzen und Historien bleiben erhalten. PR438 ist zur Zielbranch-Integration reviewbereit; ein noch nicht erfolgter Merge wird nicht behauptet.

## Verhalten

Wilma zeigt Antwort und erwartete Lösung je Lücke sowie den KI-Vorschlag mit Begründung. Die kompakte Aufgabenübersicht unterscheidet offene und fertige Bewertungen, laufende Prüfungen und technische Fehler. Grün bedeutet bei Wilma endgültig bewertet, bei Schülern lediglich beantwortet.

Der Dienst erhält inhaltsfreie Fehlerdiagnosen und liest vorhandene private Belege kostenlos wieder. Es gibt keine automatische bezahlte Wiederholung. Ein bewusst ausgelöster zweiter Versuch ist ausschließlich für eine bereits abgerechnete unbekannte Operation erlaubt: gleicher Fingerprint, passende Fehlerzeit und höchstens zwei Versuche insgesamt. Kosten, Usage und ursprüngliche Referenz bleiben in einer begrenzten History. Laufende oder nicht abgerechnete Operationen bleiben gesperrt. Ein gültiger flüchtiger Vorschlag darf nur bei eindeutigem Speicherfehler und nach erneutem Konto-, Besitz- und Quellabgleich zurückgegeben werden.

Der unabhängige Review fand zwei Fehler: Kontosperren während der Verarbeitung und verspätete Meldungen nach einem Kontowechsel. Beide wurden mit reproduzierenden Negativtests behoben und erneut geprüft. Die historische erste 503-Ursache wurde hingegen vom alten Catch verworfen und bleibt nachträglich unbekannt. Der synthetisch reproduzierte Viertelpunktfehler ist damit nicht als historische Ursache bewiesen. Das neue Antwortschema erlaubt ausschließlich unterstützte halbe Punkte. Echte Schülerbewertungen und alte unbekannte Jobs wurden nicht zurückgesetzt oder ungefragt neu bewertet.

Die Aufgabenfläche und Schrift bleiben erhalten: im tatsächlichen Live-DOM 860 Pixel und 16 Pixel Schrift bei 1280×720. Die rechte Übersicht erscheint erst ab 1180 CSS-Pixeln und 600 Pixeln sichtbarer Höhe. Schmalere beziehungsweise kurze Ansichten behalten die volle Aufgabenbreite mit aufklappbarer Navigation darüber. Antwort- und Audioknoten werden bei Resize nicht ersetzt. Die manuelle Abgabe verlangt ABGEBEN/SUBMIT; verbindliche Zeit- und Zwangsabgaben warten darauf nicht. Entwurf, Offlinefehler, Abbruch und Rücknahme sind geprüft.

## Prüfungen und Staging

[CI44353944925](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/44353944925) ist vollständig erfolgreich: Node und WebKit/Chromium, darunter 18 vollständige Tutorialreisen mit jeweils 52 tatsächlichen Klicks, 36 Schülerlayoutfälle, 18 Abgabereisen und 72 Wilma-Navigationsfälle. Der vorherige Tutorialtest klickte ohne das neue Pflichtwort auf die deaktivierte Bestätigung. Nach rotem Repro wurde nur der Testablauf ergänzt; sämtliche Fokus-, Treffer- und Klickprüfungen bleiben bestehen. Finaler unabhängiger Review: PASS, keine offenen P0–P2.

Staging: Funktion `reviewwilmaanswers-00010-zud`, Hosting `53f8755a3225464f`, Kandidat ausschließlich unter `/wilma/`. Alle 663 bisherigen Dateien wurden vorab geprüft; 447 Dateien außerhalb des Kandidatenpfads bleiben unverändert. Das kanonische Root-Manifest bleibt auf `5be513d`. Nach der Veröffentlichung wurden alle 664 tatsächlichen Dateien gegen das erhaltene Paket geprüft. 97 andere Funktionen blieben unverändert.

Der echte fiktive Test belegte Abgabe, KI-Vorschlag mit 1,5/1,5 Punkten, bewusste Bestätigung, grünen Aufgabenstatus, Alle-Filter, Rückgängig sowie erneutes Laden des Vorschlags. Danach wieder `review`, keine Note. Genau ein neuer Providerstart, 466 Eingabe- und 91 Ausgabetokens, 1012 MikroEUR Usagebuchung, keine offene Reservierung.

## Live-Nachweis

Live: Funktion `reviewwilmaanswers-00005-lax`, Hosting `899b570925aa4566`. Ausschließlich `buildConfig.source` wurde aktualisiert. Dadurch bleiben 512M Speicher, CPU1, maximal zwei Instanzen, Parallelität4, Secrets, Umgebung und IAM unverändert. 61 andere Funktionen blieben unverändert. Der tatsächliche GCS-Quell-ZIP hat SHA256 `858322674c5d27457a1d35bb91e320d81dcd74719ccc5e36ea0a1d969035ac7e` und ist bytegleich zum Staging-Paket.

An beiden Live-Adressen sind sämtliche 216 Manifestdateien geprüft: keine Abweichung, keine entfernte Datei, 202 unveränderte Dateien. Bestehende Anmeldung und der alte Firebase-Schülerlink funktionieren. Es gab keinen fremden Emmi-, Rules-, Assessment-, Gateway- oder Games-Deploy. Ohne Anmeldung lehnen beide Wilma-Endpunkte mit 401 vor Provider und Quota ab.

Die fiktive Live-Abgabe wurde sicher gespeichert. Punkte und Note bleiben bis zur Lehrerprüfung verborgen. Vorschlag mit 1,5/1,5 Punkten und Begründung sowie kostenloser Status- und Ergebnisrefresh funktionieren. Genau ein neuer Providerstart, 466 Eingabe- und 137 Ausgabetokens, 1288 MikroEUR Usagebuchung, keine offene Reservierung. Im Live-QA wurde keine Bewertung bestätigt: Der Server bleibt `review`, 0 Punkte, `grade=null`. Keine echten Schülernoten wurden verändert. Die genannten Buchungen sind Wilmas Usageabrechnung, kein Rechnungsnachweis des Anbieters.

## Verbleibende Abnahme

Physisches iPhone/iPad, Bildschirmleser und OS-Tastatur/Diktat bleiben separat zu prüfen. Native Secure führt den Renderer im App-Build mit; Web-Hosting ersetzt diesen Build nicht. Der zuständige Chat hat die ausdrücklich autorisierte Größenübergabe erhalten. Sein nativer Release-Gesamttest ist fehlgeschlagen und der Upload bleibt bis zur Klärung gestoppt. Der bisherige native 1024-Vertrag muss den neuesten Wunsch nach unveränderter Aufgabenfläche erfüllen.

Keine zusätzlichen bezahlten Wiederholungsproben aus einer Chatwiederaufnahme starten. Martins ursprünglicher realer unbekannter Prüflauf kann durch bewusste Wiederaufnahme oder manuelle Bewertung weitergehen; er wird nicht automatisch neu berechnet.

[Maschinenbelege ohne Schülerdaten](receipt.json). Screenshots der tatsächlichen fiktiven Oberfläche liegen lokal unter `/private/tmp/gc-student-live-wide-d67b0b5.jpg` und `/private/tmp/gc-wilma-live-reloaded-d67b0b5.jpg`. Keine echten Schülerdaten oder Anmeldedaten wurden ins Repo übernommen.
