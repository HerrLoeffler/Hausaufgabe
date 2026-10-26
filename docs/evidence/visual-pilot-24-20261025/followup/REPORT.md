# Nutzerkorrekturen: direkte Werkzeuge und schnelle Prüfung

GC-EXTENDED-QUESTION-TYPES-01 ·25.10.2026 · nur getrennte Testvorschau.

- Winkelmesser: sichtbare Zahlenregler entfernt; direktes Verschieben/Drehen mit Maus real bedient, vergrößerter Drehgriff und PointerCapture; Tastaturweg erhalten. Vertrag lässt alte±1° und neue±3° zu. Alle drei Winkelaufgaben als neue P02-Fassung mit±3°. Fingerhardware noch nicht geprüft.
- Schnelle lokale Lehrkraftansicht: http://127.0.0.1:8897/tools/visual-pilot/?ansicht=pruefen . Alle192 Aufgaben ohne Schülerstart, Test-/Aufgabenauswahl undVor/Zurück über Testgrenzen. Verständliche Felder für Aufgabenstellung/Hinweis/Lösungen; kein JSONeditor. Entwurf wird explizit nur auf diesem Gerät gespeichert und ändert keine veröffentlichte Prüfung. Speicherung, Aufgabenwechsel und Rückkehr im Browser geprüft.
- P04Q5: verständlicher erklärt, dass zum gegebenen y der passende x-Wert berechnet wird. y=6,5 ergibtx=−5, y=0 ergibtx=8. Diese Werte stehen nur im Lehrkraftschlüssel.
- P04Q8: Anfang x=2 und Ende x=6 statt unklarer gemeinsamer Belegformulierung. Zu vergleichen sind y=11 undy=23, Differenz12.
- P07Q2: Fehlerstelle gilt wird im Auftrag nicht mehr genannt. Nur die richtige Verbform wird eingetragen.
- P07Q4: Diagramm trägt Behauptung1–3 und Begründung1–3. Volltexte bleiben lesbar und auswählbar; optionales geprüftes shortLabel-Feld.
- Säulendiagramme: untere direkte Zahlenfelder entfernt. Werte werden über Säulen eingegeben; Tastatur-Slider bleiben bedienbar. Browser bestätigt8 für erste Säule bei0 numerischen Eingabefeldern.

## Neue Fassungen und Bestandsschutz

P02 C0E863A9 (vorher UXBCQ5FL), P04 88C01170 (vorher NLRVJTW8), P07 52F21DC8 (vorher K9HEUB8X). Keine neue KI-Erstellung, keine Providerkosten für Inhalte. Originale und vorhandene Abgaben erhalten; Rücklesevergleich aller24 Aufgaben der drei Originaltests bestätigt unverändert. Öffentliche24erÜbersicht verweist auf neue Fassungen.

## Prüfung und Bereitstellung

34 fokussierte Tests,293 AI-Backendtests und97 Assessmenttests bestanden. Unabhängiger Review fand Laderennen zwischen Testauswahl und Speicherung; real als jsdom-FetchraceRED reproduziert und mit Loading-/IdentitätsbindungGREEN behoben. Andere aktuelle Punkte fachlich/visuell gegen Nutzerbilder geprüft.

Sechs zusätzliche echte Serverfälle: P02 korrekt16/16,+3°16/16,−3°16/16,+4°10/16 (drei Winkel zu je2Punkten verlieren ihre Punkte); P04 undP07 korrekt16/16. Private Schlüssel bleiben aus öffentlichen Papieren entfernt. Tokens nur privates/tmp. Ursprüngliche120Serverfälle bleiben als frühere Nachweise erhalten und werden nicht dem neuen Stand zugeschrieben.

Backend:2ae8fb6b8545eac316fde1a41f08dc8ce67bdbd3, nurvisual255-ai/visual255-assessment. Hosting:731d97eb70c5a09142319268695e6063d4235b1b, bestehender Kanalvisual255. Hash-/Verteilernachweis deployment-verification.json. Private Lehrkraftansicht nicht öffentlich ausgeliefert. Normales Staging/Schuladresse/Production/Rules nicht verändert.

Erstellversuch1 stoppte vor Schreibaktion bei403 für fehlendes Dokument; dieselbe gespeicherte ID anschließend mit exists=false erstellt. Keine Kollision überschrieben. Drei neue Testfassungen und acht Fragen pro Fassung vor Veröffentlichung vollständig zurückgelesen.

## Grenzen und nächste Schritte

Lokale Entwürfe synchronisieren nicht geräteübergreifend und werden nicht automatisch veröffentlicht. Physische Touch-/Screenreaderabnahme offen. Der ergänzende PDF-/Katalog-/Auswahlkonzeptauftrag aus der Zentrale ist in derselben Übergabe erfasst und noch nicht ausgewertet; keine breite neue Implementierung oder tausende KI-Aufträge gestartet.
