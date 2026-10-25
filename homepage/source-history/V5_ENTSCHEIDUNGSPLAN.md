# GradeCrew Homepage-Test · Entscheidungsplan V5

**Stand:** 22.10.2026 · **Auftrag:** GC-DESIGN-05 / `design-startscreen-v1` · **Status:** Vorschlag zur Abstimmung, keine Umsetzung. **Karten 6, 8 und 9 sind nach Martins neuer Rückmeldung verworfen; dafür gilt die [V6-Ideensammlung](V6_ALTERNATIVEN_6_8_9.md).**

## Ziel und Grundlage

Die Homepage zeigt rechts genau **eine vollständige Aufgabe**, links die bestehende Crew und oben das vorhandene GradeCrew-Logo, den Satz und Anmeldung/DE/EN. Zehn Karten sollen in wenigen Sekunden zeigen, wie abwechslungsreich und sauber ein GradeCrew-Test sein kann. Die Beispiele müssen fachlich stimmen, funktionieren, gut aussehen und sich unmittelbar auswerten lassen. Es gibt keine Klassenstufen-Zeile auf den Karten; die Spannweite wird durch die Aufgaben selbst sichtbar.

Geprüfte Grundlage: lokaler V4-Prototyp (`app.js`, `index.html`, `styles.css`, `grading.mjs` und Übergabe), `START_HERE.md` und verlinkte Regeln auf GitHub `main`, GradeCrew-Central-Übergabe. Der aktuelle [Aufgabenkatalog](https://github.com/HerrLoeffler/Hausaufgabe/blob/main/docs/learning/INTERACTIVE_TASK_CATALOG.md) dokumentiert inzwischen auch visuelle Beispiele für Bildbereiche, Beschriftung, Koordinaten und Winkel. Das ist ein Prototyp-/Testnachweis, keine pauschale Schul-Live-Freigabe. Die Homepage bleibt eine **lokale Demo** mit lokaler Punkteauswertung. Sie zeigt eine kuratierte Auswahl und behauptet nicht, alle regulären oder visuellen GradeCrew-Formate in zehn Karten abzudecken.

## Fest übernommen aus Martins Rückmeldung

- **1:** A blau, B orange. B ist ein eigener Punkt; es entsteht **keine** Strecke. Die A-/B-Auswahl und die jeweiligen Koordinatenfelder übernehmen erkennbar die Punktfarbe. Buchstaben bleiben zusätzlich sichtbar, damit Farbe nicht der einzige Hinweis ist. Die Aufgabenstellung nennt nur die Handlung und Koordinaten. Keine Schulart-/Klassenstufen-Zeile.
- **2:** Aktuelle Höraufgabe und englische Aufnahme behalten. Deutsch höchstens einmal gezielt nachbessern; keine neue Geschichte, kein Bild, kein Transkript. Keine Pointe, die den Hörfluss verlängert oder die Antwort verwässert.
- **3:** Wortarten-Aufgabe und ihre ruhige Farbinteraktion behalten, nur sichtbare Qualitätsmängel korrigieren. Kein Fuchssymbol.
- **4 alt:** Die statische 60°-Ableseaufgabe entfällt. Sie dupliziert Aufgabe 10 und zeigt derzeit ein widersprüchliches Dreieck-/Kreisinstrument.
- **5 alt:** Das bisherige Froschbild und die dazugehörige Auswahlfrage entfallen.
- **9 alt:** Die Energie-sparen-Frage entfällt.
- **10:** Das bereits gelobte **Winkel einstellen** bleibt, einschließlich Skala, beweglichem Schenkel und Toleranz. Keine aktuelle Gradzahl als Lösungshinweis.
- **Oberfläche:** „Im Test scrollen“ entfernen. Den aufklappbaren Übersichts-Knopf und das Popup entfernen. Stattdessen **1 bis 10 als dauerhafte, ruhige Navigationsleiste direkt über der Aufgabe**, außerhalb des scrollenden Inhalts; sie bleibt bei jedem Kartenwechsel sichtbar. Aktive Nummer klar markieren, bearbeitete Nummern dezent kennzeichnen. Kopf, Crew, Ergebnis und „Test auswerten“ bleiben erhalten.

## Empfohlene Reihenfolge mit Entscheidungsvarianten

| Nr. | Empfohlene Karte | Was man tut / warum sie trägt | Format und Punkte | Alternative, falls Martin einen anderen Schwerpunkt will |
|---|---|---|---|---|
| **1** | **Zwei Punkte setzen** | A (−2 \| 1) blau und B (2 \| 3) orange im Koordinatensystem setzen oder in die je zwei farbig zugeordneten Felder eintragen. Beide Punkte stehen einzeln. | VIS08 Koordinaten. | Inhaltlich fest; nur Farbtöne/Anordnung variabel. |
| **2** | **Remy hören** | Audio hören und zwischen `GradeCrew`, `GreatCrew`, `GradeCrue`, `CrateCrew` die gehörte Schreibweise wählen. Kurzer, schöner Einstieg in Medienaufgaben. | `single` + Audio. | Nur deutscher Sprechschluss A/B unten. |
| **3** | **Wortarten farbig markieren** | Im vorhandenen Fuchs-Satz Nomen, Verb und Adjektive mit drei Farben markieren. Keine Zusatzgrafik, die den Satz zerreißt. | `markwords`; falsche Markierungen werden berücksichtigt. | Inhaltlich fest; Satz nur bei einem echten fachlichen/visuellen Fehler ändern. |
| **4** | **Oberstufe: Gesteuerte Fontäne optimieren** | Der Pumpendruck eines Springbrunnens wird während 8 Sekunden verändert; die modellierte Strahlhöhe ist `h(t)=−0,1t³+0,9t²+1` Meter für `0≤t≤8` Sekunden. Eine klare Vektorgrafik zeigt die Fontäne und ein Koordinatensystem. Frage: „Nach wie vielen Sekunden erreicht der Wasserstrahl seine größte Höhe?“ Eine Zahl mit Einheit `s` eingeben; die Grafik verrät den exakten Wert nicht. Lösung `t=6 s` (Ableitung `−0,3t²+1,8t`, Maximum im Intervall). | `number` mit Grafik. | **B:** Parabel einer Brücke `h(x)=−0,25x²+4x`, Spannweite bestimmen (`16 m`), leichter. **C:** Sinusmodell `h(t)=2+1,5sin(πt/6)` für `0≤t≤12 h`, erster Höchststand (`3 h`), anspruchsvoll, aber weniger visuell überraschend. Empfehlung **A**, weil echte Oberstufenrechnung und klar prüfbare Antwort. |
| **5** | **Pflanze beschriften** | Eine eigens gezeichnete, scharfe Pflanze mit Blüte, Blatt, Stängel und Wurzel. Vier Begriffe an die vier sichtbaren Zielpunkte setzen; Ziehen **und** Antippen/Zuordnen funktionieren. Verbindungslinien zeigen die Zuordnung. | VIS02 Bildbeschriftung. | **B:** Dieselbe Grafik mit nummerierten Punkten und vier Auswahlfeldern (`matching`), technisch einfacher, weniger eindrucksvoll. **C:** Drei Bildbereiche direkt anklicken (VIS01), lebendig, aber geringere inhaltliche Tiefe. Empfehlung **A**. |
| **6** | **Werkstatt-Diagnose am E-Bike** | Die bestehende Aufgabe mit 36-V-Akku und drei sinnvollen Rechnungen behalten; Rechenschritte den Ergebnissen zuordnen. Eine kleine klare Akkugrafik kann ordnen, darf aber keine Rechenwerte verdecken. | `matching`. | **B:** Statt E-Bike „Rezeptur im Labor“ mit Mischverhältnis und drei Ergebnissen. Empfehlung: bestehendes E-Bike bewahren, weil es schon wesentlich verbessert wurde und Berufspraxis zeigt. |
| **7** | **Tierische Überwinterungsstrategien** | Sechs klar illustrierte Karten in **Winterschlaf**, **Winterruhe** und **Winterstarre** gruppieren: Igel/Murmeltier, Eichhörnchen/Dachs, Frosch/Eidechse. Kurze visuelle Karten, keine Textwand. Ziehen und Antippen; jede Karte lässt sich umsetzen. Vor Umsetzung Arten/Begriffe noch einmal fachlich prüfen. | `grouping`. | **B:** Physik/Technik: sechs Materialien nach elektrischem Leiter, Isolator und Halbleiter gruppieren. Fachlich strenger, aber weniger einladend. Empfehlung **A**, wegen Crew-/Naturbezug und echter Gruppierhandlung. |
| **8** | **Zwei richtige Aussagen zur Rezeptur** | Für 5 l fertiges Getränk sind 2 % Sirup vorgesehen; 65 ml sind schon enthalten. Ein klarer Krug macht die Mengen anschaulich. **Zwei** Aussagen auswählen: „Insgesamt braucht es 100 ml Sirup“ und „Es fehlen 35 ml“ sind richtig; „65 ml sind 2 % von 5 l“ und „Es müssen weitere 100 ml hinein“ sind falsch. Keine Lösung im Bild. | `multi`, **beide** korrekten Antworten lassen sich gleichzeitig markieren. | **B:** Die bisherige freie Eingabe `35 ml` als `gapfill`. Empfehlung **A**, weil die von Martin beanstandete Ein-Antwort-Falle damit sichtbar behoben ist. |
| **9** | **Wie entsteht ein Blitz?** | Vier bildhafte Karten in eine fachlich eindeutige Folge bringen: **warme feuchte Luft steigt auf → Luft kühlt ab, Wolke entsteht → Ladungen trennen sich in der Gewitterwolke → Blitz entlädt die Spannung.** Kurze Texte, starke Grafik, keine Textwand. | `ordering`. | **B:** Wissenschaftlicher Versuch: Frage → Vermutung → kontrollierte Messung → Vergleich. Sachlich klar, optisch schwächer. **C:** Blutkreislauf, nur mit eindeutig vorgegebenem Startpunkt. Empfehlung **A**. |
| **10** | **Winkel einstellen** | Bestehenden beweglichen Schenkel an der halbkreisförmigen Skala auf **65°** einstellen. Handbewegung, Touch und Tastatur funktionieren. Skala bleibt groß und scharf; kein Zahlenwert am Regler. | Eigenständige **lokale** Winkel-Einstellinteraktion, von VIS07 inspiriert; VIS07 im Katalog belegt das **Messen**, nicht dieses Einstellen. | Inhaltlich fest. Nur zeichnerische/technische Korrektur, falls ein echter Fehler sichtbar wird. |

**Warum diese Mischung:** #1–3 öffnen schnell mit drei deutlich unterschiedlichen Handlungen; #4 beweist Anspruch bis Oberstufe; #5 ist der gewünschte visuelle „süße“ Moment; #6 zeigt Berufspraxis; #7 und #9 bringen die vermissten Gruppier- und Sortieraufgaben; #8 zeigt ausdrücklich echte Mehrfachauswahl; #10 endet mit einer direkten Interaktion. Die zehn Karten enthalten Koordinaten, Audio, farbige Textmarkierung, Zahl, Bildbeschriftung, Zuordnung, Gruppierung, Mehrfachauswahl, Reihenfolge und Winkel. Sie sind nicht bloß zehn verschiedene Auswahlhüllen.

## Punkte und Aussagekraft

Die Homepage mischt Lernziele aus verschiedenen Jahrgangsstufen. Deshalb zeigt die lokale Auswertung **Demopunkte, keine Note und keinen vergleichbaren Leistungsstand**. Jede der zehn Karten zählt maximal **2 Demopunkte** (insgesamt 20), damit sieben markierte Wörter nicht stärker wiegen als eine Oberstufenaufgabe. Einzelantworten erhalten 2/0, #1 je Punkt 1, #5 bei vier korrekten Labels 2 und bei zwei bis drei korrekten 1, #6 bei drei korrekten Paaren 2 und bei zwei korrekten 1, #7 bei sechs korrekten Gruppen 2 und bei vier bis fünf korrekten 1, #9 bei vier korrekten Positionen 2 und bei zwei bis drei korrekten 1. #3 erhält 2 bei vollständig korrekten Wortarten ohne Zusatzmarkierung, 1 bei mindestens zwei vollständig korrekten Wortartgruppen ohne zusätzliche falsche Markierungen, sonst 0. #8 erhält 2 nur für genau die beiden richtigen Aussagen, 1 für eine richtige ohne falsche Auswahl, sonst 0. Die Bewertung erklärt nach dem Auswerten, was richtig war; davor erscheinen keine Lösungen. Die sichtbare Marke `GradeCrew` macht #2 zu einer Demonstration der Audio-Bedienung und nicht zu einer isolierten Hörverständnisprüfung.

## Die zwei konkreten offenen Ton-Varianten für #2

**A – minimal, empfohlen:** Den deutschen Inhalt belassen und nur die Sprechmelodie glätten: natürliche Frage, kurze Pause vor dem Buchstabieren, `G–R–A–D–E–C–R–E–W`, freundlicher Abschluss. Eine neue deutsche Aufnahme mit derselben bestätigten Remy-Stimme, eine Sicht-/Hörprobe, alte Datei als Rückfall. Englisch unverändert.

**B – kleines Augenzwinkern:** Nach der Buchstabierung ein kurzes „Na, gehört?“ Nur wenn es in der echten Aufnahme natürlich klingt. Ich empfehle **A**; der Witz ist kein Lernziel und die aktuelle Karte gefällt Martin bereits.

## Abwägung der Varianten

**Redaktionelle Eignung, 1–10:** 10 bedeutet besonders gut für diese Homepage. Bei jeder Variante gelten dieselben Kriterien: fachlicher/Lernwert, unmittelbare visuelle Wirkung, zusätzlicher Formatnutzen und Aufwand/Risiko der Umsetzung. Die Zahlen sind eine begründete Einschätzung, keine gemessene Nutzerbewertung. Die konkreten Stärken und Grenzen stehen in der Aufgabentabelle.

| Entscheidung | Varianten | Empfehlung und ausschlaggebender Grund |
|---|---|---|
| #4 Oberstufe | A gesteuerte Fontäne **9/10** · B Brücke **7/10** · C Sinus **7/10** | A zeigt Oberstufenrechnung und ein prägnantes Bild; B ist leichter, C wirkt abstrakter. |
| #5 Bild | A Pflanze mit Labels **9/10** · B nummerierte Zuordnung **7/10** · C Hotspots **7/10** | A zeigt das gewünschte sichtbare Zuordnen; B ist robuster, C schwächer im Lerninhalt. |
| #7 Gruppieren | A Überwinterung **8/10** · B Materialklassen **7/10** | A bringt passende Tiermotive und echtes Gruppieren; Art-/Begriffsprüfung bleibt nötig. |
| #8 Rechnen/Auswahl | A zwei richtige Aussagen **8/10** · B freie Lücke **7/10** | A zeigt die bisher fehlende echte Mehrfachauswahl; B prüft das Rechenergebnis direkter. |
| #9 Reihenfolge | A Gewitter **9/10** · B Versuchsablauf **6/10** · C Blutkreislauf **7/10** | A lässt sich bildhaft und eindeutig sortieren; B wirkt textlastig, C braucht einen festgelegten Start. |
| #2 deutscher Ton | A behutsam glätten **9/10** · B Witz anhängen **7/10** | A bewahrt die bereits gelungene Karte; B kann den sehr kurzen Hörfluss schwächen. |

## Navigation und Scrollen: genaues Verhalten

1. Die Nummernleiste liegt zwischen „GradeCrew Testübersicht“ und der aktuellen Aufgabenkarte. Sie ist immer sichtbar und direkt anklickbar. Es gibt kein Overlay, kein Ausklappen und keinen extra Übersichts-Knopf. Auf schmalen Displays passen zehn kompakte Nummern in zwei ruhige Reihen oder eine waagerecht wischbare Leiste; nie winzige untreffbare Ziele.
2. **Ein bewusster Scroll-Gestus = höchstens eine Aufgabe.** Momentan löst eine 680-ms-Sperre die Folgeimpulse; bei länger ausklingenden Trackpad-Impulsen kann sie mitten in derselben Bewegung ablaufen. V5 erkennt den **gesamten Gesten-Burst** bis zur echten Ruhepause und hält zusätzlich eine kurze Mindestanzeige der neuen Karte ein. Ein einzelner Wheel-Impuls und eine Trackpad-Geste werden getrennt geprüft. Erst ein neuer Gestus darf weitergehen. Kleine Inhalte innerhalb einer Karte dürfen nicht versehentlich die nächste Karte auslösen.
3. Direkte Navigation über 1–10 bleibt immer verfügbar; sie dient schnellen Sprüngen ohne Scroll-Hack. Tastatur und Touch bekommen gleichwertige Wege. Beim Kartenwechsel bleiben eingegebene Antworten erhalten. Nach dem letzten Feld springt der Fokus nicht unaufgefordert weg.
4. Ein Kartenwechsel landet immer **am Anfang** der neuen Karte. Die Karte darf auf niedrigen Fenstern intern scrollen, aber kein Zwischenstand aus zwei halben Aufgaben stehen bleiben. Bei jeder Karte ist der Weg zu allen Antworten und „Test auswerten“ sichtbar oder eindeutig erreichbar.
5. Testfall vor Abnahme: von #1 aus drei schnelle Trackpad-Bewegungen und drei Mausrad-Impulse; die Anzeige darf keine Aufgaben verschlucken. Dann #3 über die Nummernleiste direkt öffnen, antworten, zu #8 springen und zurück zu #3: Markierungen sind noch da.

## Winkelinstrument und Bildqualität

Die aktuelle #4-Mischung wird durch Streichen der Karte entfernt. Für #10 genügt ein **einziges** konsistentes Instrument: halbkreisförmiger Winkelmesser mit Grundlinie, Mittelpunkt, lesbaren Teilstrichen und beweglichem Schenkel. Es wird nicht als Geodreieck beschriftet. Ein echtes Geodreieck ist ein transparentes Dreieck, das Maßstab und Winkelmesser im selben Körper vereint; das zeigt der [Originalhersteller ARISTO](https://www.aristo.at/geodreieck/). Falls später wieder eine Geodreieck-Aufgabe gewünscht ist, zeichnen wir dieses Instrument als eigenständiges korrekt skaliertes Dreieck statt eines Dreiecks vor einem zweiten Kreis.

Alle neu benötigten Grafiken werden als scharfe, eigenständige SVGs oder vorhandene freigegebene GradeCrew-Assets eingebunden. Die Fontäne darf dekorativ sein, die Pflanze muss fachlich eindeutig beschriftbar sein, die Tiere müssen als Arten erkennbar bleiben. Keine vergrößerten Mini-Bitmaps und keine fremden Produktbilder aus der Geodreieck-Recherche übernehmen.

## Umsetzungsfolge **nach** Martins Auswahl

1. Entscheidungen für #4, #5, #7, #9 und Deutsch-Audio in diese Datei eintragen. Erst dann Datensatz und Rubrik in `app.js`/`grading.mjs` ändern; IDs, Punkte und DE/EN-Text gemeinsam festlegen.
2. #1, Kopf und Nummernleiste/Scrollmechanik als zusammenhängenden Bedienblock umsetzen; den vorhandenen Brand-/Crew-Aufbau erhalten. Die Aufgaben #2, #3 und #10 nur gezielt anfassen.
3. Die gewählten #4–#9 mit je einer echten Antwortinteraktion bauen. Bei Bildbeschriftung, Gruppierung und Reihenfolge eine Tipp-/Tastaturalternative zum Ziehen vorsehen.
4. Jede Aufgabe fachlich gegen Aufgabenstellung, Lösung und Punkte prüfen. Bei #4 Grenzwerte/Einheit, bei #5 Zielregionen, bei #7 biologische Zuordnung, bei #9 eindeutige Reihenfolge. Leere, richtige, teilweise und falsche Antworten sowie DE/EN prüfen.
5. Im lokalen Browser Desktop, kleines Fenster und Smartphone-Breite ansehen; Remy anhören; Scroll-Test mit Wheel **und** Trackpad durchführen; komplette Auswertung probespielen. Unabhängige Gegenprüfung der zehn Aufgaben vor einer möglichen Produktübernahme.
6. Übergabe mit Version, Screenshots/Prüfbelegen und Grenzen aktualisieren. Ein lokaler Demoerfolg ist kein Repo-Commit, CI, Staging oder Production. Vor jeder späteren Repo-/Staging-Arbeit frischen Branch-/PR-/Release-Abgleich durchführen.

## Zur Entscheidung

**Empfehlung als Paket:** #4 **A gesteuerte Fontäne**, #5 **A Pflanze mit ziehbaren Labels**, #7 **A Überwinterung**, #8 **A Mehrfachauswahl zur Rezeptur**, #9 **A Gewitterfolge**, Ton **A minimale deutsche Nachaufnahme**. Martin kann einzelne Positionen austauschen. Bis dahin bleibt V4 unverändert.
