# Homepage-Test V4 – zehn Aufgaben aus echten GradeCrew-Formaten

Stand: 22.10.2026. Fortsetzung von `design-startscreen-v1` / `GC-DESIGN-05`, ausschließlich lokaler Vorschauordner. Martins Kritik an V3 ist die Abnahmegrundlage. Diese Datei beschreibt **Testaufgaben und Interaktionen**, keine Projekt-Aufgabenstände.

## Quellen und Grenze

GradeCrew Central nennt `feature/gradecrew-app-integration` als Integrationsziel; dessen geprüfter Head ist `ab6fcc9d72aa9d401eba2ec4db31c01f7758c0f0`. `functions/lib/constants.js` und `secure-student.js` nennen und rendern elf reguläre Fragetypen: `single`, `multi`, `text`, `dropdown`, `truefalse`, `gapfill`, `matching`, `ordering`, `grouping`, `markwords`, `number`. Bild- und Audio-Medien sind Erweiterungen von Fragen, keine separaten `question.type`-Werte. `assessment-functions/lib/assessment-core.js` wertet dieselben Typen serverseitig aus. Koordinaten- und Winkel-Widgets dieser Homepage-Vorschau sind **experimentelle lokale Interaktionen** und werden nicht als bereits veröffentlichte GradeCrew-Prüfungsformate behauptet. Die zehn Aufgaben sind eine kuratierte Demonstration, kein Vollkatalog.

## Gestaltungsziel

Ein Blick zeigt genau eine vollständige Aufgabe. Links bleibt die vom Nutzer gewählte Crew, rechts die Testkarte. Ein Scroll-Gestus bewegt maximal **eine** Aufgabe; weitere Wheel-Impulse desselben Gestus dürfen nicht drei Karten überspringen. Eine Übersicht mit 1–10 bleibt für bewusste Sprünge erhalten. Die Karte zeigt keine Formatstatus-Badges, weil diese mit Aufgabentypen verwechselt werden. Der Anmeldeknopf und DE/EN bleiben bestehen.

Jede Aufgabe erfüllt fünf Prüffragen: (1) Ist klar, was zu tun ist? (2) Ist die Antwort ohne versteckte Hilfsmittel möglich? (3) Verrät die Oberfläche die Lösung nicht? (4) Passt die Schwierigkeit zur angegebenen Stufe? (5) Ist der Klick/Touch sichtbar und nachvollziehbar? Die Bilder sind scharfes SVG oder Originalmaterial; keine hochskalierten Miniaturen. Rückmeldung erscheint erst nach „Test auswerten“ und nur bei bearbeiteten Aufgaben. Der lokale Lösungsschlüssel demonstriert Punkte, ersetzt keine serverseitige GradeCrew-Bewertung.

## Reihenfolge und Fachplan

| # | Interaktion / belegter Typ | Stufe | Konkrete Aufgabe und erwartete Handlung | Bewertung | Warum in der Auswahl |
|---|---|---|---|---|---|
| 1 | Koordinaten, lokaler Prototyp | Mathematik 7–8 | A auf (−2\|1), B auf (2\|3). A/B umschalten, nur `x` und `y` eingeben oder im Raster setzen. Die Strecke zeichnet sich nach beiden Punkten automatisch. Keine Namensfelder, Status- oder Erklärungssätze. | Je 1 Punkt für A und B. Kein Verbinden-Knopf. | Sofortige sichtbare Reaktion und anspruchsvoller als eine Wissensfrage. |
| 2 | `single` + Audio | Medienkompetenz / GradeCrew-Demo | Remy spricht mit seiner belegten Originalstimme eine kurze Frage zur Plattform für digitale Leistungsnachweise. Sichtbar sind nur die neutrale Testanweisung, ein Audioplayer und vier Schreibweisen (`GradeCrew`, `GreatCrew`, `GradeCrue`, `CrateCrew`). Remy buchstabiert den Namen im Ton, damit die Schreibweise eindeutig lösbar ist. Kein Remy-Bild und kein Transkript. | 1 Punkt für `GradeCrew`. | Führt Ton und echte Testbedienung vor, statt Thema/Klasse zu erraten. |
| 3 | `markwords` | Deutsch 3–5 | „Die neugierige Füchsin entdeckt im alten Schuppen eine geheimnisvolle Kiste.“ Nomen, Verb und Adjektive farbig markieren; längerer zusammenhängender Satz, kein zusätzliches Fuchssymbol. Keine redundante Tipp-Anleitung unter dem Satz. | Sieben Zielwörter; falsche Markierungen mindern nur diese Aufgabe, keine Minuspunkte. | Farbgruppen und echte Sprachkompetenz sichtbar. |
| 4 | Winkel messen, lokaler Prototyp | Mathematik 6–7 | Ein **fest ausgerichteter** Winkelmesser liegt auf einem 60°-Winkel. Die Skala ist mit 5°-Strichen und lesbaren Zahlen versehen. Eingabe der gemessenen Gradzahl. Kein Schieberegler für den Mittelpunkt. | 1 Punkt bei 60° ±2°. | Die Messung ist ohne externes Geodreieck möglich. |
| 5 | `single` + SVG-Bild | Natur & Technik 5–6 | Kaulquappe und Frosch als klare Vektorillustration. Frage: Welche Veränderung sieht man beim Heranwachsen? Drei plausible Antworten. | 1 Punkt für „Beine wachsen, Schwanz bildet sich zurück“. | Bild wird zum Beobachten gebraucht, statt nur die Antwort zu dekorieren. |
| 6 | `number` | Mathematik 11–12 | Wegmodell `s(t)=3t²−4t+1` in Metern. Gesucht ist die Momentangeschwindigkeit bei `t=2 s`, mit Eingabefeld und Einheit m/s. | 1 Punkt für 8. | Sichtbarer Sprung zur Oberstufe und eine Anwendung der Ableitung. |
| 7 | `matching` | Physik 9–10 | Beim E-Bike drei Werkstattrechnungen (36 V · 5 A, 360 Wh ÷ 36 V, 72 W ÷ 36 V) den Ergebnissen 180 W, 10 Ah und 2 A zuordnen. | Je 1 Punkt pro richtigem Paar. | Zeigt Teilpunkte und Anwendung statt bloßer Definitionen. |
| 8 | `gapfill` | Mathematik / Berufspraxis 9–10 | 5 Liter Fertiggetränk sollen 2 % Sirup enthalten; 65 ml wurden schon eingefüllt. Fehlende Menge in ml ergänzen, ohne vorgegebene Gleichung. | 1 Punkt für 35 ml. | Prozentrechnung, Volumenumrechnung und Restmenge in einem Rezepturauftrag. |
| 9 | `multi` | Natur & Technik 7–9 | Ein Schulgebäude verbraucht nachts unnötig Strom. Drei von vier Maßnahmen senken den Verbrauch; Mehrfachauswahl ausdrücklich genannt. | 3 richtige Maßnahmen, falsche Auswahl senkt Punkte, Untergrenze 0. | Zeigt die von Martin verlangte echte Mehrfachauswahl ohne Ein-Antwort-Falle. |
| 10 | Winkel einstellen, lokaler Prototyp | Mathematik 6–7 | Winkelmesser **hinter** einem beweglichen Schenkel. Den Schenkel direkt ziehen oder den zugänglichen Regler bedienen, bis 65° eingestellt sind. 5°-Teilstriche helfen; die aktuelle Gradzahl steht **nirgends** neben dem Regler. | 1 Punkt bei 65° ±2°. | Werkzeug und eigene Handlung statt ablesbarer Lösungsanzeige. |

Die frühere Lagerbalken-Aufgabe entfällt vollständig; bloßes Übertragen vorgegebener Stückzahlen ist keine Berufsschulaufgabe. Ebenso entfallen triviale Skalenintervalle, Statuslabels und restliche Füllaufgaben aus V3. Die Gesamtzahl in Kopf, Übersicht, Fortschritt, Ergebnis und Übersetzungen wird auf zehn gesetzt.

## Interaktions- und Technikplan

1. Bestehendes V3 lokal sichern. Datensatz, Rubrik und Markwords-Token auf genau zehn Aufgaben konsistent reduzieren; die lokale Auswertung aus denselben IDs ableiten. Keine Änderung am GradeCrew-Repository oder an Staging.
2. Koordinaten-Karte auf A/B und x/y verschlanken. B wird erst nach Auswahl oder Setzen von A aktiv vorgeschlagen; Tastaturfelder und SVG-Klick bleiben gleichwertig. Automatische Strecke wird nach B gerendert.
3. Zwei neue kurze Tondateien DE und EN mit der zuvor dokumentierten Remy-Voice-ID über ElevenLabs erzeugen; Stimme vorher über die Voice-Liste bestätigen. Einmalige Generation, keine unnötigen Variationen. Audio in lokales `assets/` übernehmen und im Browser abspielen. Text und Optionsreihenfolge so wählen, dass beide Sprachversionen denselben richtigen Wert haben.
4. Farbaufgabe mit zehn zusammenhängenden Wörtern ausbauen. Wortschlüssel in DE/EN separat definieren, aber beide beantworten dieselben Wortarten. Die Auswahl zeigt aktive Farbe und farbig markierte Wörter; knappe Aufgabe reicht als Anleitung.
5. Winkelmessung statisch und Winkelstellung interaktiv machen. Der Winkelmesser bleibt auf beiden Karten sichtbar; nur Aufgabe 10 bewegt den Schenkel. Touch/Pointer und Tastatur-Regler liefern denselben Zustandswert; vor der Auswertung keine exakte Gradzahl anzeigen.
6. Wheel-Gesten per Leerlauf-Sperre bündeln: erster Impuls wechselt um eins, Folgeimpulse bis zum Ende des Gestus werden geschluckt. Direkte Sprünge ausschließlich über die 1–10-Übersicht. Innerer Karten-Scroll bleibt für kleine Fenster möglich; `prefers-reduced-motion` respektieren.
7. 1280×720 und 390×844 visuell prüfen: alle Antwortmöglichkeiten sichtbar oder eindeutig innerhalb der Karte erreichbar; Crew und Kopf ohne Überlagerung; Tastaturfokus. DE/EN und Ton, 1→2→3 per Scroll, A/B, Farben, beide Winkel, Mehrfachauswahl und Auswertung manuell durchspielen. Bewertungsregeln mit gezielten Tests für richtige, teilweise und falsche Antworten prüfen.

## Akzeptanzgrenze

Erledigt ist diese Runde erst, wenn die zehn Karten im lokalen Browser bedienbar sind, Remys Frage hörbar ist, ein Scrollgestus nicht bis Aufgabe 5 springt, kein Lösungswert vor der Eingabe angezeigt wird und die lokale Auswertung dazu passt. Die experimentellen Koordinaten-/Winkelwidgets bleiben als lokale Vorschau kenntlich; Produktfreigabe, Staging und Production sind nicht Teil dieser Runde.
