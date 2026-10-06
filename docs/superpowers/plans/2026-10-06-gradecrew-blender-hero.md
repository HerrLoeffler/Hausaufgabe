# GradeCrew: Produktionsplan für den filmischen Startscreen

**Stand:** 6. Oktober 2026 · **Task:** GC-DESIGN-05 · **Status: Umsetzung am 06.10.2026 durch Martin freigegeben; Coco-/Tür-Prototyp begonnen.**

**Aktuelle Freigabe:** Martin hat am 06.10.2026 den Start der Umsetzung mit Sol und einen begründeten Wechsel zu Astra freigegeben. Die folgende ursprüngliche Planungsgrenze ist damit für die Umsetzung aufgehoben; Production bleibt separat freigabepflichtig.

**Ursprüngliche Arbeitsanweisung (historisch):** Dieser Plan ist kein Startauftrag. Erst nach Martins ausdrücklichem Auftrag die passenden Ausführungsregeln laden, aktuelle Repository-Regeln und Übergabe erneut lesen und die Aufgaben unten schrittweise abarbeiten. Keine Installation, Modellierung, Bildgenerierung, Animation, Website-Änderung oder Veröffentlichung aufgrund dieses Dokuments starten. Keine zusätzlichen Agenten automatisch beauftragen.

**Ziel:** Eine räumlich zusammenhängende, hochwertige GradeCrew-Begrüßungsszene mit den kanonischen Figuren, die die Wirkung des Referenzbildes erreicht: Coco empfängt an der Tür, dahinter ein warmer Klassenraum mit Remy, Emmi und Wilma. Texte und Bedienelemente bleiben übersetzbar und bedienbar. Die Szene ist später saisonal veränderbar.

**Architektur:** Bearbeitbare Blender-Szene als Produktionsquelle; hochwertige, textfreie Standbilder und kurze Animation als Web-Medien; darüber echte HTML-Oberfläche mit vorhandener Internationalisierung. Codex unterstützt Blender lokal über eine geprüfte MCP-Verbindung und nachvollziehbare Python-Skripte. Dauerhafte Ergebnisse werden als Dateien gesichert.

**Vorgesehene Werkzeuge:** Blender auf Apple Silicon, Blender-Python, lokales MCP for Blender, Sol/Astra nach Aufgabe, vorhandene JavaScript-/CSS-/i18n-Struktur und Staging-Bau. Encoder und konkrete Versionen erst im Einrichtungsnachweis festlegen. Keine neue Web-Engine als Grundvoraussetzung.

**Spezifikation:** Martins Screenshot, Brand-Beschluss PR #128 und [bestehende Übergabe](../../../workstreams/startscreen-hero-animation-20261004.md). Diese Planung konkretisiert den bisherigen Vorschlag und ersetzt dessen noch offene Produktionsentscheidungen, ohne die Versuchshistorie zu löschen.

**Globale Grenzen:** Kanonische Identität erhalten; Standard-Assets in der App erhalten; kein Text in Bild/Video; keine Verzögerung von Anmeldung/Testcode durch Animation; keine neuen kostenpflichtigen Provider-Aufträge ohne eigenes festgelegtes Budget; Production ausschließlich nach ausdrücklicher Freigabe.

**Prüfschwerpunkte:** Figurenidentität, Licht und Raumwirkung, saubere Bewegung, Sprachwechsel, mobile Komposition, Ladeverhalten, funktionierende Anmeldung/Testcode, nachvollziehbare Quellen und Wiederaufnahme.

## 1. Was tatsächlich bekannt ist

| Befund | Nachweis und Konsequenz |
|---|---|
| Brand-Entscheidung ist integriert | PR #128 und Main-Commit `8360bc5f056837118ffd83138ffa2468ae42647e` geprüft. Marketingvarianten sind erlaubt; sie ersetzen nicht die kanonischen App-Figuren. |
| Aktuelle Figuren sind zweidimensional | Die vier geprüften SVG-Dateien enthalten eingebettete WebP-Posenatlanten. Sie sind weder 3D-Modelle noch animierbare Skelette. |
| Keine vorhandenen 3D-Quellen im geprüften Bestand | Vollständiger Baum von `feature/gradecrew-app-integration` bei `bb91ce3590d773472ece60c4dd881da729bd32c1` und lokaler Projektbestand geprüft. Keine `.blend`, `.glb`, `.gltf`, `.fbx`, `.obj`, `.usd` oder `.usdz` gefunden. Außerhalb dieses Bestands könnten Quellen existieren. |
| Rechner grundsätzlich als lokaler Produktionsplatz geeignet | Apple M5 Pro, 48 GB Arbeitsspeicher, arm64 nachgewiesen. Das ist noch kein Blender-Kompatibilitäts- oder Rendergeschwindigkeitsnachweis. |
| Blender hier noch nicht ausführbar nachgewiesen | In PATH, üblichen Programmordnern und der geprüften App-Suche nicht gefunden. Es wurde nichts installiert. |
| Verbindung Codex–Blender ist recherchierbar | Der untersuchte Community-Anbieter dokumentiert lokale Nutzung mit Codex. Seine Supportseite bezeichnet die direkte ChatGPT-Verbindung derzeit als noch nicht verfügbar. |
| Web-Auslieferung braucht eine gezielte Ergänzung | Der geprüfte Staging-Bau übernimmt aus `assets/gradecrew` automatisch nur SVG-Dateien. Neue Poster/Videos würden damit nicht automatisch ausgeliefert. |
| Planungsarbeit wird bereits gesichert | Bestehender Dokumentationsbranch und Draft-PR #143; bestehende Task-ID GC-DESIGN-05. Keine neue Produktimplementierung in diesem Auftrag. |

Die Daten belegen die Ausgangslage, nicht die Qualität einer noch nicht gebauten Szene. Deshalb gibt es derzeit keine belastbare Fertigstellungsnote für den neuen Hero. Frühere pauschale 9/10-Aussagen sind keine Abnahme. Die Projektregel verlangt begründete Bewertungen, keine automatisch hohen Zahlen.

Quelle zur aktuellen Verbindungsgrenze: [MCP for Blender – Support](https://www.mcp-for-blender.com/support). Der fehlende Eintrag in einem Plugin-Katalog wäre allein kein Beleg dafür, dass die Verbindung unmöglich ist.

## 2. Die Produktionsentscheidung

Wir bauen eine echte gemeinsame Szene in Blender. Raum, Figuren, Tür, Schatten, Kamera und Licht gehören zusammen. Darin liegt der entscheidende Unterschied zu freigestellten Figuren, die nachträglich mit CSS in einen Hintergrund gesetzt werden.

Die Website erhält zunächst eine gerenderte Szene. Ihr Produktionsmaster bleibt in einzelne bearbeitbare Objekte gegliedert. Dass das Web-Ergebnis ein zusammenhängendes Bild oder Video enthält, verhindert weder Übersetzungen noch spätere Änderungen: Übersetzbare Inhalte gehören in HTML; Änderungen an Pose, Figur, Licht oder Saison entstehen im Blender-Master und werden neu exportiert.

| Ansatz | Wirkung des Wunschbildes | Bewegung und Änderungen | Aufwand auf Endgeräten | Entscheidung |
|---|---|---|---|---|
| Fertiges Screenshot-Bild einschließlich Text | Kann die Vorlage unmittelbar abbilden | Text, Sprache und Bedienung sind fest eingebaut | Gering, aber funktional unzureichend | Für die Website ungeeignet |
| Einzelne 2D-Figuren mit CSS-Bewegung | Begrenzte gemeinsame Perspektive und Lichtwirkung | Kleine Verschiebungen einfach, echte Türinteraktion schwierig | Vergleichsweise gering | Bestehende App-Assets weiter nutzen; kein Produktionsweg für diesen Hero |
| Blender-Master, gerenderte Szene, HTML-UI | Kontrollierte Kamera, Materialien, Licht und Kontakt | Animierbar; Varianten durch bearbeitbare Quellen | Gut begrenzbar durch Mediengrößen | Empfohlener erster Produktionsweg |
| Blender-Master mit Echtzeit-3D im Browser | Mehr freie Interaktion; Materialwirkung muss separat optimiert werden | Freie Kamera/Objektinteraktion möglich | Mehr Geräte-, Speicher- und Leistungsrisiken | Spätere Option bei konkretem Interaktionsbedarf |

Das ist eine begründete Architekturentscheidung, kein gemessener Qualitätsvergleich. Ein fester Kameraausschnitt und eine kurze Begrüßung benötigen zunächst keine frei begehbare 3D-Welt. Soll später eine Tür tatsächlich per Ziehen bewegt werden oder die Kamera frei durch den Klassenraum fahren, wird Echtzeit-3D neu bewertet. Die vorhandenen Quellen bleiben dafür wertvoll; ein glTF-Export übernimmt jedoch nicht automatisch die endgültige Renderoptik. [Blender glTF-Dokumentation](https://docs.blender.org/manual/en/4.3/addons/import_export/scene_gltf2.html)

Canva kann Referenzen sammeln, ist aber keine Voraussetzung für Modellierung, Rigging oder die Web-Auslieferung. Drei vollständig unterschiedliche Markenwelten sind jetzt nachrangig. Der Screenshot legt das gewünschte Erlebnis bereits deutlich fest. Falls eine Kompositionsentscheidung offen bleibt, vergleichen wir höchstens drei kleine Kamera-/Lichtvarianten derselben Szene.

## 3. Welche Rolle Sol, Astra und Blender haben

Es werden zwei verschiedene Arten von „Modell“ benötigt: ein KI-Modell, das die Arbeit unterstützt, und tatsächliche 3D-Figuren, die Blender darstellen und bewegen kann. Ein Wechsel zu Astra erzeugt nicht automatisch fertige, saubere 3D-Figuren.

**Vorschlag für den KI-Einsatz:** Sol übernimmt klar beschriebene, überprüfbare Arbeitsschritte wie Szenenaufbau nach Vorgabe, Export, Web-Einbindung und Tests. Astra wird gezielt für schwierige räumliche Entscheidungen, Identitätsabweichungen, Rigging-Probleme und die Gesamtprüfung eingesetzt. Diese Arbeitsteilung ist eine Ableitung aus der offiziellen Modellbeschreibung, kein Blender-Benchmark. [OpenAI: Modellwahl](https://developers.openai.com/api/docs/guides/model-selection)

Vor einer größeren Produktion genügt ein begrenzter Vergleich am selben Coco-Ausschnitt, falls Sol die Qualitätsgrenze nicht zuverlässig erreicht. Beide erhalten dieselben Referenzen, dieselbe Kamera, dieselbe Aufgabe und dasselbe festgelegte Versuchsbudget. Verglichen werden sichtbare Fehler, notwendige Korrekturen, Nachvollziehbarkeit der Dateien sowie Laufzeit und angezeigte Nutzung. Renderzeit wird getrennt von KI-Arbeitszeit erfasst. Die gesamte Produktion wird dafür nicht doppelt gebaut.

Bildgenerierung kann später für ein kontrolliertes Stilblatt oder Materialideen helfen. Ein generiertes schönes Bild ist aber weder ein Rig noch der Beweis, dass die Figur aus allen Blickwinkeln konsistent ist. Blender berechnet Bilder und Animationen aus Geometrie, Materialien, Licht und Kamera; die GPU erledigt das Rendern. Es ist kein eigenes trainiertes KI-Modell erforderlich.

## 4. Geplante Verbindung mit Blender

Der normale Produktionsweg lautet: Codex → lokaler MCP-Server → Blender-Addon → Szene. Für dauerhaft nachvollziehbare Änderungen werden zusätzlich versionierte Blender-Python-Dateien verwendet. Das Addon ermöglicht interaktives Arbeiten und Bildkontrolle; die Skripte und gespeicherten Szenen machen das Ergebnis wiederaufnehmbar. Codex dokumentiert lokale MCP-Server mit Konfiguration für Programm, Argumente und Umgebung. [Offizielle MCP-Dokumentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)

Recherchierter Community-Stand: `ahujasid/mcp-for-blender`, früher `blender-mcp`, Commit `34b7bd277fff75a693cde78930b4359478958a01`; dessen Paketmetadaten nennen Version `2.1.8`. Addon und Server müssen als zusammen getestetes Paar festgehalten werden. Der Stand ist recherchiert, nicht hier installiert oder praktisch erprobt. Eine optionale Codex-Oberflächenerweiterung ist keine zwingende Voraussetzung. [Geprüfter Quellstand](https://github.com/ahujasid/mcp-for-blender/tree/34b7bd277fff75a693cde78930b4359478958a01)

Einrichtung nach späterem Startauftrag:

1. Stabile Blender-LTS-Version für Apple Silicon und Addon/API-Kompatibilität prüfen. Recherchekandidat ist Blender 5.2.2 LTS; vor der Installation Versionsstand und Download erneut prüfen. Die offiziellen Versionsseiten waren teilweise nur über Suchindex-Auszüge abrufbar. [Blender LTS](https://www.blender.org/download/lts/)
2. Versionen, Downloadherkunft und Prüfsummen in einem Werkzeugprotokoll festhalten. Kein unbemerktes Aktualisieren während einer Produktionsserie.
3. Lokalen Server nur lokal anbinden; verifizierte Programmpfade verwenden, damit die Desktop-App nicht an einer abweichenden Suchpfad-Konfiguration scheitert.
4. Unterstützten eingeschränkten Ausführungsmodus aktivieren und vollständige Telemetrie deaktivieren. Diese Einstellungen ersetzen keine Betriebssystem-Isolation. Ein einzelner Schreiber arbeitet an einer Szene; keine konkurrierenden Chats verändern dieselbe Datei.
5. Eine Wegwerf-Testszene öffnen, Objekt verschieben, Szene auslesen, Vorschau rendern, speichern, Blender schließen und erneut öffnen. Erst dann gilt die Verbindung als nachgewiesen.
6. Falls MCP nicht stabil arbeitet: dieselben versionierten Python-Schritte lokal über Blender ausführen. Eine defekte Komfortverbindung darf die bearbeitbare Produktionsquelle nicht unbrauchbar machen.

Die Basispipeline braucht keinen zusätzlichen kommerziellen 3D-Generierungsdienst. Solche Dienste werden nur nach einem separaten Qualitäts-/Budgetentscheid hinzugefügt. Kein fremdes Installationsskript, keine Zugangsdaten und keine bezahlten Aufträge werden in dieser Planungsphase ausgeführt.

## 5. Verbindliches Bildziel und Figurenidentität

Der Screenshot ist die Referenz für Inszenierung, nicht die einzige Quelle für Figurendetails. Die kanonischen Assets sind für Identität maßgeblich: Coco als Pinguin, Remy als Elefant, Emmi als Fuchs und Wilma als Eule. Augenform, Gesichtsfelder, Schnabel/Schnauze, Silhouette, Farben und Größenverhältnisse werden vor dem Modellieren in einem kurzen Figurenblatt festgehalten.

Neue Seiten- und Rückenansichten sind Entwurfsannahmen, solange dafür keine verbindlichen Vorlagen existieren. Sie werden ausdrücklich markiert. Ein Bildgenerator darf weder Augenfarbe noch Körperbau stillschweigend neu definieren. Für den ersten Qualitätsnachweis bleiben saisonale Accessoires weg.

Die Bildkomposition erhält folgende Anker:

- Coco steht links im Vordergrund und empfängt den Besucher. Der Türrahmen gibt dem Raum Maßstab und Tiefe. Coco bleibt freundlich und selbstbewusst; Kopf, Füße und Flügel wirken anatomisch zusammengehörig.
- Remy, Emmi und Wilma stehen sichtbar tiefer im selben Raum. Sie haben einen gemeinsamen Boden und passende Kontakt- und Schlagschatten. Die Anordnung darf räumlich sein; sie muss keine waagerechte Aufstellung wie auf einem Gruppenfoto werden.
- Warmes Tageslicht, Holz und ruhige Klassenraumdetails schaffen Atmosphäre. Der Hintergrund bleibt detailärmer und etwas weicher, damit Gesichter und Oberfläche lesbar sind.
- Im oberen rechten beziehungsweise mittleren Bereich bleibt ausreichend ruhige Fläche für die Überschrift. Darunter liegen Rollen, Aktionen und Testcode in einer klaren Hierarchie.
- Vordergrundobjekte dürfen Tiefe erzeugen, aber keine Buttons, Eingabefelder oder wichtigen Gesichtsteile verdecken. Die Browserleiste des Referenzscreenshots wird nicht nachgebaut.

Ein gemeinsames visuelles Regelblatt fixiert Kamera, Farbstimmung, Fell-/Federstil, Kontrast, Schärfeverteilung und Licht. „Premium“ wird an konkreten Eigenschaften geprüft: ruhige Komposition, passende Materialien, saubere Kanten, stimmige Proportionen und glaubwürdige Kontakte. Mehr Glanz oder mehr Unschärfe allein erfüllt das Ziel nicht.

## 6. Welche 3D-Quellen entstehen müssen

Pro Figur werden Geometrie, Materialien, Texturen und ein Bewegungsrig benötigt. Bei Coco sind insbesondere Kopf/Blick, Augenlider, Schnabelausdruck, Körper, Flügel und Füße relevant. Das Rig muss die spätere Türbewegung ermöglichen, ohne menschliche Hände an einen Pinguin zu erfinden. Formänderungen für das Gesicht werden nur soweit gebaut, wie die Szene sie benötigt. [Blender: Animation und Rigging](https://docs.blender.org/manual/en/5.2/animation/index.html)

Die Herstellung kann mit kontrollierter Modellierung oder einem geprüften generierten Rohmodell beginnen. Entscheidend ist das Ergebnis: brauchbare Geometrie, saubere Gelenke, stabile Materialien und nachvollziehbare Nutzungsrechte. Ein importiertes Rohmodell wird nicht ungeprüft zur kanonischen Figur erklärt. Schlechte Gelenkbereiche brauchen eine Überarbeitung der Geometrie; flache Rückseiten, verklebte Gliedmaßen und eingebrannte Schatten sind Ausschlussgründe.

Zunächst wird nur Coco bis zur erforderlichen Qualität ausgearbeitet. Testansichten: frontal, drei Viertel, Seite sowie Begrüßungspose unter dem endgültigen Licht. Testbewegungen: Blinzeln, Kopfwendung, Flügelkontakt und kleine Gewichtsverlagerung. Ein vollständiger Laufzyklus gehört erst dazu, wenn die finale Szene wirklich Schritte verlangt.

Spätestens nach drei gezielten Korrekturrunden an demselben ungelösten Qualitätsproblem wird die Methode überprüft. Bleiben Silhouette oder Gesicht instabil, braucht es einen besseren Ausgangsmesh oder gezielte Unterstützung durch einen Character-Artist. Das wird mit dem konkreten Fehlerbild begründet. Es gibt keinen endlosen Prompt-Kreislauf und keine Abnahme eines schlechten Modells, nur weil schon Arbeit investiert wurde.

Martin muss nicht jeden Scheitelpunkt korrigieren. Seine Entscheidungen betreffen Figurenwirkung, Gesamtbild und gewünschtes Verhalten. Die technische Umsetzung und Prüfung von Geometrie, Materialien und Animation gehört zur Produktion.

## 7. Bewegungsablauf des ersten Masters

Vorgeschlagen ist eine einmalige, stumme Begrüßung von vier Sekunden bei 24 Bildern pro Sekunde. Das sind 96 Bilder. Diese Werte werden erst nach dem Bewegungsprototyp festgeschrieben.

| Zeit | Geschehen | Qualitätsbedingung |
|---|---|---|
| 0–0,5 s | Coco steht an einer bereits teilweise geöffneten Tür; die Crew ist erkennbar. Kleine Blickbewegung. | Schon das erste Bild funktioniert als vollständiger Startscreen. |
| 0,5–2,0 s | Coco öffnet die Tür ein Stück weiter. | Flügel/Körperkontakt passt zur Türbewegung, keine Durchdringung und kein Rutschen der Füße. |
| 2,0–3,3 s | Coco wendet sich einladend dem Besucher zu. | Klare freundliche Geste, stabile Gesichtszüge, keine hektische Kamera. |
| 3,3–4,0 s | Bewegung kommt zur Ruhe; die Crew reagiert höchstens dezent. | Schlussbild ist hochwertig und kann dauerhaft stehen bleiben. |

Die Tür öffnet sich zuerst zur Szene, nicht zu einer blockierenden Warteanimation. Anmeldung und Testcode sind sofort nutzbar. Ein echter Seitenwechsel wird nie an das Ende des Clips gekoppelt.

Ein laufender Fuchs oder Elefant ist eine spätere Erweiterung derselben Welt. Dafür sind Laufzyklus, Bodenhaftung, Verdeckungen und Hintergrundpfad nötig. Das wird erst ergänzt, wenn die ruhige Hauptszene bereits trägt. Mehr Bewegung darf den Blick nicht vom Einstieg ins Produkt abziehen.

## 8. Texte, Sprachen und echte Bedienung

Logo, Navigation, Überschrift, Unterzeile, Figurennamen, Rollen, Buttons, Testcodefeld, Fehlermeldungen und Nutzenzeile werden mit vorhandenen Web-Komponenten und Sprachschlüsseln umgesetzt. Auch Türschild, Tafel, Papier und Tablet dürfen keine eingebrannte sprachabhängige Schrift enthalten.

Für dekorative Flächen verwenden wir neutrale Symbole oder unbeschriftete Oberflächen. Ein perspektivischer Web-Text auf einer bewegten Tür wäre unnötig fragil. Falls ein Begrüßungsschild wesentlich ist, erscheint sein übersetzbarer Text an einer stabilen Stelle oder nach dem Stillstand; er muss nicht auf der bewegten Tür kleben.

Die vorhandene Sprachtrennung bleibt erhalten: Oberflächensprache ist nicht automatisch die Sprache eines Tests oder einer Schülerantwort. Geprüft werden Deutsch und Englisch sowie künstlich verlängerte Texte. Ein Sprachwechsel während der Animation verändert nur die Oberfläche; er startet weder Video noch Anmeldung neu.

Semantisches HTML, echte Links/Buttons, klare Formularbeschriftung und sichtbarer Tastaturfokus sind Pflicht. Die Hintergrundszene ist dekorativ, soweit alle relevanten Informationen als Text vorhanden sind. Dann wird sie von Screenreadern nicht doppelt vorgelesen. Die Beschriftung einer Figur ist bei Bedarf über die zugehörige Rollenkarte zugänglich.

## 9. Desktop, Tablet und Mobil werden gemeinsam entworfen

Ein einziger breiter Bildausschnitt lässt sich nicht verlustfrei zu einem schmalen Handybild beschneiden. Deshalb erhält die gleiche Blender-Szene mindestens eine Desktop- und eine mobile Kamera. Eine zusätzliche Tablet-Kamera entsteht nur, wenn keine der beiden Ansichten sauber funktioniert.

Auf dem Handy darf Coco kleiner erscheinen und die Crew unter oder neben der Begrüßung stehen. Rollenbeschriftungen werden dort als geordnete Karten gezeigt, falls feste Bildanker zu eng werden. Der Klassenraum bleibt erkennbar. Textgrößen und Buttons werden nicht zusammengeschrumpft, um die Desktop-Komposition zu erzwingen.

Geplante Ansichten: 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 360×800 und 320 CSS-Pixel Breite; zusätzlich 200 % Textvergrößerung, Querformat und geöffnete Bildschirmtastatur. Browserleisten und sichere Bildschirmränder werden berücksichtigt. Der mobile Inhalt darf sinnvoll scrollen; alle Elemente in ein einziges Bildschirmfenster zu pressen ist kein Abnahmekriterium.

Für jede Kamera werden sichere Bereiche für Überschrift und Bedienung dokumentiert. Bildcontainer reservieren ihre Größe vor dem Laden. Ein Wechsel der Ausrichtung darf die Animation nicht erneut starten und keine Formularwerte löschen.

## 10. Verhalten beim Laden und ohne Animation

Es gibt ein freigegebenes Anfangsbild und ein freigegebenes Schlussbild aus derselben Szene. Das Anfangsbild zeigt bereits die offene Raumsituation und die Crew. Eine geschlossene Tür als lange Ladeansicht ist ausgeschlossen.

Normale Erstbesucher sehen sofort das Anfangsbild und die bedienbare Oberfläche. Der Clip darf nur starten, wenn er rechtzeitig bereit ist und noch keine Bedienung begonnen hat. Als anfängliche Grenze gelten 1,5 Sekunden nach Sichtbarkeit des Heroes; sie ist im Browsertest zu überprüfen. Kommt das Video später an, bleibt die gute statische Ansicht stehen. Nach dem Clip wird das exakt passende Schlussbild gehalten. Kein Sprung zurück zur Ausgangspose.

| Zustand | Verhalten |
|---|---|
| Reduzierte Bewegung aktiviert | Statisches Schlussbild, keine automatische Videoanforderung. |
| Langsame Verbindung oder Datensparen erkennbar | Statisches Bild; fehlende Browserunterstützung für Netzwerkerkennung darf nichts kaputtmachen. |
| Autoplay blockiert, Video defekt oder Codec ungeeignet | Sichtbares Poster bleibt erhalten, Bedienelemente funktionieren. |
| Nutzer tippt, klickt oder fokussiert das Testcodefeld | Begrüßung startet nicht verspätet; laufende Animation endet zugunsten des stabilen Schlussbildes. |
| Wiederkehrender Besuch | Statischer Einstieg; einmalige Wiedergabe je definierter Intro-Version, nicht bei jedem Saisonwechsel. Speicherung muss auch bei blockiertem Speicher fehlerfrei ausfallen. |
| Tab verborgen oder Startscreen verlassen | Wiedergabe/Listener beenden, ausstehende Aufgaben abbrechen. Kein späteres Wiedereinblenden über einer anderen Ansicht. |
| Manuelles Wiederholen | Nur durch ausdrückliche Aktion; jederzeit stoppbar. |

Die erste Version hat keine Endlosschleife und keinen Ton. Falls später dauerhaftes Blinzeln oder andere automatische Schleifen hinzukommen, ist eine gut erreichbare Pausefunktion nötig; allein eine Betriebssystempräferenz reicht dafür nicht als allgemeine Lösung. [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)

## 11. Rendern, Farben und Web-Export

Schnelle Vorschauen und endgültige Ausgabe werden getrennt. EEVEE ist ein Kandidat für Arbeitsvorschauen; Cycles für das endgültige Licht und Materialbild. Die Entscheidung fällt am tatsächlichen Coco-Ausschnitt. GPU-/Metal-Unterstützung wird auf dem vorhandenen Mac geprüft, nicht aus dem Gerätenamen abgeleitet.

Vor einer kompletten Sequenz werden mehrere anspruchsvolle Einzelbilder gemessen: Fell im Gegenlicht, Türbewegung, überlappende Figuren und weiche Schatten. Aus gemessener Zeit und Speicherbedarf entsteht eine Rendervorhersage mit Reserve. Erst danach werden belastbare Zeit- oder gegebenenfalls Renderfarm-Kosten genannt.

Kamera, Auflösung, Bildrate, Render-Engine, Farbmanagement, Belichtung, Sampling, Entrauschung und Texturstände werden versioniert. Eine laufende Serie wechselt diese Einstellungen nicht. Zu prüfen sind Flimmern von Fell/Federn, zeitlich instabile Entrauschung, überschärfte Kanten und Schattenrauschen. Eine Sequenz wird in Bewegung und an Einzelbildern geprüft.

Arbeitsmaster bleiben verlustarm, beispielsweise als PNG-/EXR-Bildfolge. Web-Ausgabe: passende WebP-/AVIF-Poster mit geeignetem Rückfallformat sowie MP4/H.264 ohne Audiospur; WebM nur, wenn es einen gemessenen Vorteil bringt. Kein GIF und keine zur Laufzeit eingebettete Video-Plattform. Poster und Video müssen im Browser farblich zusammenpassen; sRGB-/Videofarbkonvertierung wird sichtbar geprüft.

Separate Render-Layer helfen bei Korrekturen und Nachbearbeitung. Sie bedeuten nicht, dass vier unabhängige transparente Videos im Browser synchronisiert werden müssen. Der erste Hero wird als gemeinsame textfreie Szene exportiert; HTML bleibt darüber unabhängig. [Blender: Render-Layer](https://docs.blender.org/manual/en/latest/compositing/types/input/scene/render_layers.html)

Vorgeschlagene anfängliche Leistungsbudgets, noch keine Messergebnisse:

| Größe | Desktop | Mobil |
|---|---|---|
| Priorisiertes Poster | höchstens 600 KB | höchstens 300 KB |
| Optionaler Vier-Sekunden-Clip | höchstens 4 MB | höchstens 2 MB |
| Zusätzliche Hero-Logik | insgesamt höchstens 20 KB komprimiert | derselbe Grenzwert |

Das Poster als möglicher größter sichtbarer Inhalt wird früh geladen. Video konkurriert nicht unkontrolliert mit Formular, Schrift und Poster. Autoplay kann das Ladeverhalten verändern; auf ein bloßes `preload`-Attribut verlassen wir uns nicht. [web.dev: Video-Performance](https://web.dev/learn/performance/video-performance)

Ladeprüfung im festgehaltenen Laborprofil: kalter Cache, etwa 4 Mbit/s, 150 ms Latenz und definierte CPU-Drosselung; mindestens drei Läufe, Median und schlechtester Lauf dokumentieren. Ziel: LCP höchstens 2,5 Sekunden, CLS höchstens 0,1 und ohne merkliche Verzögerung bedienbares Formular. Reale Felddaten und ein INP-Ziel von höchstens 200 ms werden später separat beurteilt; Labordaten sind kein Beleg für echte Nutzerperzentile. Wenn die Budgets nur mit sichtbar schlechter Bildqualität erreichbar sind, werden Ausschnitt, Auflösung oder Bewegung angepasst und erneut geprüft.

## 12. Saisonale Änderungen ohne neue Figuren

Der Master trennt kanonische Figur, Rig, Zubehör, Raumdekoration und Licht. Schal, Sonnenbrille oder winterliche Fensterdekoration werden eigene benannte Objekte beziehungsweise Collections. Ein Variantenverzeichnis wählt sie aus; die Figur wird nicht jedes Mal neu generiert.

Die erste Fassung bleibt neutral. Anschließend wird an genau einem Zubehörteil geprüft, ob ein Variantenwechsel ohne Gesichtsdrift, Rig-Schaden oder geänderte UI-Geometrie funktioniert. Ein Schal kann zunächst kontrolliert modelliert und mitbewegt werden; eine aufwendige Stoffsimulation ist nur erforderlich, wenn sie sichtbar Mehrwert schafft.

Jede Variante wird pro Kamera als zusammengehöriger Satz aus Anfangsbild, Schlussbild und optionalem Clip exportiert. Varianten mischen keine alten Poster mit neuen Videos. Der neutrale Satz bleibt als Rückfall bestehen. Eine Saison wird über die vorhandene Produktkonfiguration beziehungsweise einen festgelegten Release ausgewählt, nicht über ungeprüfte Datumslogik auf jedem Endgerät.

## 13. Einbindung in den tatsächlichen Repository-Bestand

Die folgenden neuen Pfade sind Vorschläge für die spätere Umsetzung. Vor Änderungen wird der dann aktuelle Integrationsstand gelesen; dieser Plan basiert auf `bb91ce3590d773472ece60c4dd881da729bd32c1`.

| Bereich | Bestehender oder geplanter Ort | Geplanter Eingriff |
|---|---|---|
| Einstieg und Formular | `gradecrew-entry-flow.js` | Hero-Medien anbringen, bestehende Aktionen/IDs/Authentifizierung erhalten. |
| Darstellung | `gradecrew-auth-startscreen.css`, `gradecrew-auth-startscreen-polish.css` | Dekorative Raum-/Figurenregeln im betroffenen Bereich gezielt ablösen; keine weitere unübersichtliche Überschreibungsschicht. |
| Neues Hero-Verhalten | `gradecrew-hero.mjs`, `gradecrew-hero.css` | Begrenzter Lebenszyklus, Medienzustände, reduzierte Bewegung, Abbruch und Größenvarianten. |
| Sprachinhalte | bestehende Nachrichtenkataloge und `shared/i18n/browser-runtime.mjs` | Vorhandenen Mechanismus verwenden; nur nötige neue Schlüssel ergänzen. Keine Änderung der Test-/Antwortsprache. |
| Hero-Manifest | neu `shared/gradecrew-design/hero-scenes.json` | Saison, Kameravarianten, Bildmaße, Dateien, Dauer und Versionskennung beschreiben. |
| Generierter Web-Zugriff | neu `generated/gradecrew-hero-assets.mjs` | Aus geprüftem Manifest erzeugen, nicht von Hand pflegen. |
| Generator | neu `tools/generate-gradecrew-hero.mjs` | Manifest validieren und Web-Ausgabe deterministisch erzeugen. |
| Bestehende Markenquelle | `shared/gradecrew-design/assets.json`, `tools/generate-gradecrew-design.mjs` | Kanonische Figuren-/Logo-Zuordnung bewahren. Keine unerkannte neue Objektstruktur in den alten Generator stecken. |
| Medienausgabe | neu `assets/gradecrew/hero/<version>/<variant>/…` | Nur freigegebene komprimierte Web-Dateien. |
| Staging-Bau | `tools/build-staging.mjs` | Manifestdateien gezielt übernehmen, Referenzen prüfen, Hashes ins vorhandene Release-Verzeichnis aufnehmen. |
| Produktionsquellen | neu `art/gradecrew-hero/` für kleine Spezifikationen/Skripte | Große Blender-/Texturdateien über ausdrücklich festgelegte binäre Ablage referenzieren. |

Der alte Designgenerator verarbeitet bekannte Gruppen und erzeugt auch native App-Ausgaben. Ein neues verschachteltes Hero-Objekt könnte unbemerkt ignoriert werden oder unnötige Änderungen an der App auslösen. Deshalb erhält die Web-Hero-Ausgabe ein eigenes, kleines Manifest und eine eigene Erzeugung.

Die Medienlogik soll eine testbare Auswahlentscheidung und einen klar begrenzten Lebenszyklus haben: etwa `selectHeroPolicy(context)` und `mountHero(root, options)` mit `dispose()`. Kontext enthält Ansicht, reduzierte Bewegung, Wiederbesuch und Abbruchzustand; die Sprache steuert Texte, nicht neue Videodateien. Ein Abbruchschutz verhindert, dass eine verspätete Ladeantwort einen bereits verlassenen Startscreen verändert.

Das Manifest erlaubt nur relative öffentliche Medienpfade, bekannte Formate und gültige Maße. Bauprüfung und Dateireferenzen müssen fehlende Dateien, Pfadausbrüche, falsche Varianten und widersprüchliche Größen/Dauern erkennen. Keine `.blend`-Dateien, Rohbildfolgen, geheimen Konfigurationen oder Quelltexturen in Hosting kopieren. Web-Dateien erhalten versionierte Namen und Hashes. Cache-Verhalten wird gezielt geprüft; die vorhandenen globalen Header werden nicht beiläufig umgestellt. MP4-MIME-Typ und Bereichsabrufe werden in der Vorschau getestet.

## 14. Aufgabenfolge mit konkreten Prüfpunkten

Alle Kästchen sind bewusst offen. Recherche ist erledigt; die folgenden Produktionsaufgaben sind nicht begonnen.

### A. Ausgangslage und Bildvertrag fixieren

- [ ] Aktuelles `START_HERE.md`, Übergabe, Main/Integration, offene PRs und bereits vorhandene Quellen erneut lesen. GC-DESIGN-05 und Budgethistorie übernehmen.
- [ ] Screenshot, kanonische Ansichten, Schriften/Logos und Referenzrechte als Quellenliste festhalten.
- [ ] Figurenblatt, Raumskizze, Textzonen und Desktop-/Mobilziele unter `art/gradecrew-hero/spec/` festlegen.
- [ ] Offene gestalterische Annahmen als solche markieren; höchstens drei kleine Kompositionsvarianten, falls nötig.

**Ergebnis:** Ein klarer Bildvertrag. **Prüfpunkt:** Alle vier Figuren und alle echten UI-Inhalte sind zugeordnet; die Vorlage wird nicht durch eine neue beliebige Markenwelt ersetzt.

### B. Produktionsumgebung nachweisen

- [ ] Blender, Addon/Server, Python und Encoder als festgehaltene Kombination einrichten; lokale Konfiguration sichern.
- [ ] Testszene anlegen, verändern, rendern, speichern und nach Neustart unverändert öffnen.
- [ ] GPU-Nutzung, Texturpfade und Ausgaberechte praktisch prüfen; Python-Ausführung als Ersatzweg nachweisen.
- [ ] Werkzeugprotokoll unter `art/gradecrew-hero/toolchain.json` und Einrichtungsnachweis speichern.

**Ergebnis:** Reproduzierbare Arbeitsumgebung. **Prüfpunkt:** Tatsächliches Vorschaubild und wieder geöffnete Quelldatei; eine erfolgreiche Installation allein genügt nicht.

### C. Kamera, Raum und Coco-Prototyp

- [ ] Raum zunächst mit einfachen Platzhalterkörpern aufbauen, Perspektive/Boden/Türanschlag und Textflächen prüfen.
- [ ] Coco anhand der kanonischen Identität modellieren beziehungsweise einen Rohmesh entsprechend bereinigen.
- [ ] Drei Ansichten und Begrüßungspose im geplanten Licht rendern; Figur neben kanonischer Referenz beurteilen.
- [ ] Kurzen Test mit Kopf/Blick/Flügelkontakt erstellen; Körper- und Türkontakt prüfen.
- [ ] Dieselbe Szene aus der mobilen Kamera prüfen. Bei Bedarf den begrenzten Sol/Astra-Vergleich durchführen.

**Ergebnis:** Coco mit Tür, Licht und bearbeitbarer Quelle. **Prüfpunkt:** Keine kritischen Identitäts-, Kontakt- oder Materialfehler. Solange dieser Ausschnitt nicht trägt, keine vollständige Crew-Produktion.

### D. Gemeinsamen statischen Master fertigstellen

- [ ] Remy, Emmi und Wilma in passendem Detailgrad modellieren, Materialien vereinheitlichen und in die Szene setzen.
- [ ] Gemeinsame Schatten, Größen, Blickrichtungen, Schärfe und Vorder-/Hintergrundabstände abstimmen.
- [ ] Anfangs- und Schlusskomposition für Desktop/Mobil rendern; alle vorgesehenen Texte in einem einfachen prüfbaren Layout darüberlegen.
- [ ] Übereinstimmung mit Referenzwirkung und kanonischer Identität sichtbar vergleichen und Abweichungen protokollieren.

**Ergebnis:** Visueller Master mit zwei Ansichten. **Prüfpunkt:** Martin kann Gesamtwirkung und Lesbarkeit beurteilen. Erst nach Bestätigung dieses konkreten Masters wird teure endgültige Animation ausgearbeitet.

### E. Animation sauber ausarbeiten

- [ ] Vier-Sekunden-Ablauf zunächst als einfache Bewegungsvorschau erstellen.
- [ ] Türkurve, Kontakte, Blick, Gesicht, Gewichtsverlagerung und Endpose kontrollieren.
- [ ] Unterstützende Crewbewegungen nur hinzufügen, wenn sie die Hauptgeste unterstützen.
- [ ] Kritische Bilder final rendern, Renderzeit/Dateigrößen messen und Serienbudget festlegen.
- [ ] Vollständige Sequenz nachweisen; Anfang und Ende müssen zu den freigegebenen Postern passen.

**Ergebnis:** Freigegebene Bewegung plus Rendermessung. **Prüfpunkt:** Echtzeitansicht und Einzelbildprüfung bestehen; keine Flimmer-/Kontakt-/Identitätsfehler.

### F. Ausgaben und Quellen sichern

- [ ] Web-Poster und Video pro Kamera kodieren; Farbübergang, Schärfe und Größe prüfen.
- [ ] Manifest, Versionen, Lizenz-/Quellenliste, Renderparameter und Hashes erzeugen.
- [ ] `.blend`, Texturen, Rigs und Skripte in der vereinbarten binären Ablage sichern und Wiederöffnung testen.
- [ ] Genau einen einfachen Zubehörwechsel am selben Modell als späteren Variantenbeweis durchführen; den neutralen Master erhalten.

**Ergebnis:** Vollständiges Medienpaket und wiederherstellbare Quelle. **Prüfpunkt:** Kein Ergebnis hängt ausschließlich an einem Chat oder einer flüchtigen lokalen Datei.

### G. Website und Bau gezielt ergänzen

- [ ] Eigenen Integrationsbranch vom frisch geprüften Zielstand verwenden; parallele Einstieg-/i18n-Änderungen berücksichtigen.
- [ ] Hero-Modul, Styles und Manifest-Erzeugung implementieren; bisherigen Einstieg und Formularverträge erhalten.
- [ ] Staging-Dateiauswahl, Referenzprüfung und Release-Hashes ergänzen.
- [ ] Deutsch/Englisch, statischen Rückfall und Medien-Abbruchregeln einbinden.
- [ ] Nur die betroffenen dekorativen Altregeln entfernen; keine allgemeine App-Neugestaltung.

**Ergebnis:** Funktionierender Hero in isolierter Vorschau. **Prüfpunkt:** Alle Dateien werden tatsächlich ausgeliefert; keine Textgrafiken; keine Regression bei Login/Testcode.

### H. Belegte Abnahme und Übergabe

- [ ] Relevante vorhandene Tests und gezielte neue Fehlerfalltests ausführen.
- [ ] Browser-/Geräte-/Sprachmatrix, langsames Netz, reduzierte Bewegung und Tastaturbedienung prüfen.
- [ ] Referenzvergleich mit Screenshots und kurzem Bildschirmvideo dokumentieren; offene Fehler benennen.
- [ ] Staging nur im dafür freigegebenen Ablauf bereitstellen; exakten Commit, Checks und Deploy-Nachweise festhalten.
- [ ] Konkreten geprüften Stand zur visuellen Abnahme vorlegen. Production-Freigabe bleibt separat.

**Ergebnis:** Prüffähiger Releasekandidat und vollständige Übergabe. **Prüfpunkt:** Keine Behauptung „fertig“ aus einem schönen Einzelbild oder ausschließlich grünen Codechecks ableiten.

## 15. Test- und Abnahmematrix

| Bereich | Bestehensbedingung | Beleg |
|---|---|---|
| Identität | Kanonische Gesichter, Farben und Silhouetten bleiben über Ansichten und Bewegung stabil. | Referenznebeneinander, drei Figurenansichten, Clip |
| Raum und Material | Gemeinsames Licht, korrekte Bodenkontakte, glaubwürdige Größen, ruhiger Texthintergrund | Desktop-/Mobilmaster und Detailausschnitte |
| Bewegung | Keine sichtbaren Durchdringungen, schwebenden Füße, rutschenden Kontakte oder flimmernden Oberflächen | Echtzeitclip und kritische Einzelbilder |
| Sprachen | Alle sichtbaren UI-Texte einschließlich Fehlermeldungen übersetzbar; lange Texte brechen sauber um | DE/EN/langes Testlayout |
| Bedienung | Anmeldung, Crew-Einstieg und Testcode funktionieren schon während des Ladens | Erfolgs-/Fehlerfälle im echten Browser |
| Zugänglichkeit | Tastaturfokus sichtbar, sinnvolle Lesereihenfolge, ausreichende Kontraste, Bewegung abschaltbar | Tastatur-/Screenreader-/Kontrastprüfung |
| Rückfälle | Videoausfall, Autoplayblock, blockierter Speicher, Netzabbruch und versteckter Tab bleiben benutzbar | Gezielte simulierte Fehlerfälle |
| Mobil | Keine abgeschnittenen Kerninhalte oder überdeckten Felder bei Tastatur/Zoom/Rotation | Geräte- und Größenmatrix |
| Leistung | Medienbudgets und dokumentiertes Ladeprofil eingehalten oder begründete neue Grenze abgenommen | Messprotokoll, keine bloße Schätzung |
| Bau und Release | Manifestdateien vorhanden, gültige Referenzen, passende Hashes, keine Produktionsquellen in Hosting | Bauprüfung und Release-Inventar |
| Wartbarkeit | Quelle lässt sich öffnen; definierte Änderung kann erneut exportiert werden | Wiederöffnung und Zubehör-Probe |

Vorhandene Testbasis enthält unter anderem `gradecrew-design-foundation.test.mjs`, `gradecrew-brand-assets.test.mjs`, `crew-art.test.mjs`, `ai-entry-flow.test.js`, `gradecrew-tour.test.mjs`, `staging-short-login.test.mjs` und Tests unter `shared/i18n/`. Welche davon bei der Umsetzung zwingend laufen, richtet sich nach den dann geltenden Repository-Regeln und betroffenen Verträgen.

`tools/ui/package.json` enthält eine Node/jsdom-Prüfung, keinen nachgewiesenen vollständigen Browser-Screenshottest. Ein grüner jsdom-Test beweist weder Safari-Videowiedergabe noch das tatsächliche Layout. Daher zusätzlich echte Browserprüfung: Safari auf macOS/iOS, Chromium/Chrome auf Desktop/Android und Firefox, soweit verfügbar. Fehlende reale Geräte werden als Testlücke markiert. Es wird kein nicht vorhandener Root-`npm test` oder bereits eingerichtetes Playwright behauptet.

Gezielte neue Tests prüfen Medienpolitik, verspätete Ladeantwort nach Abbruch, Variantenreferenzen und Bauausschlüsse sowie lange Texte und unveränderte Formularfunktionen. Sie sollen echte Fehler aufdecken, nicht nur die neue Implementierung spiegeln. Eine Prozentzahl aus Bildähnlichkeit ersetzt keine gestalterische Abnahme.

## 16. Quellenhaltung, Wiederaufnahme, Kosten und Rückweg

Kleine Spezifikationen, Skripte, Manifest und Nachweise werden versioniert. Vor großen Binärdateien wird geprüft, ob Git LFS oder eine bereits freigegebene Artefaktablage verfügbar ist. Kein ungeprüftes Committen großer Rohsequenzen. Zu jedem Quellpaket gehören Speicherort, Prüfsumme, Werkzeugversionen und eindeutige Zuordnung zum Web-Export. Texturen müssen beim Wiederöffnen verfügbar sein.

Vor längeren Renderläufen: Szene und Übergabe sichern, Laufkennung, Einstellungen, Ausgangsdatei und Ausgabeort notieren. Nach Unterbrechung zuerst vorhandene Bilder, laufenden Prozess und letzten abgeschlossenen Schritt prüfen. Fehlende Bilder nachholen; nicht blind die ganze Serie erneut starten. Skripte verändern nur die eigenen benannten Collections und löschen nicht pauschal jede geöffnete Szene.

Die bisherige GC-DESIGN-03-Providerhistorie bleibt getrennt erhalten: unbekanntes Ergebnis und reservierte 2,40 USD innerhalb des 2,55-USD-Limits. Dieser Plan setzt sie nicht zurück und löst keinen Retry aus. Neue Bild-/3D-Provider und gegebenenfalls Renderfarm bekommen eigene dokumentierte Grenzen. Lokales Blender, KI-Nutzung, gekaufte Assets und externe Rechenleistung sind unterschiedliche Kostenposten; ein ChatGPT-Tarif ist nicht automatisch ein Guthaben für externe Anbieter.

Ein belastbarer Gesamtpreis oder Fertigstellungstermin ist vor dem Coco-Prototyp und den Rendermessungen nicht belegbar. Danach wird pro verbleibendem Arbeitspaket eine Spanne mit Annahmen genannt. Die größte Unsicherheit ist die hochwertige, wiedererkennbare Figurengeometrie; bloße Web-Einbindung ist nicht der Hauptaufwand.

Rückweg bei Problemen: neutraler freigegebener Postersatz, funktionsfähige HTML-Oberfläche, optional deaktivierte Bewegung und referenzierter vorheriger Web-Mediensatz. Die Integration soll sich ohne Austausch kanonischer App-Assets zurücknehmen lassen. Eine defekte Animation darf niemals einen Login- oder Testcode-Ausfall verursachen.

## 17. Offene Punkte und nächste Entscheidung

**Offen, aber im Ablauf zu klären:** mögliche 3D-Originale außerhalb des geprüften Bestands; tatsächliche Qualität eines Coco-Modells; stabile Kombination aus Blender/Addon/Server auf diesem Mac; reale Renderzeiten; geeignete dauerhafte Binärablage; endgültige Typografie und Textlängen im Master.

**Vorgeschlagene Festlegungen dieses Plans:** Referenznahe Klassenzimmerszene, neutrale Figuren zuerst, bearbeitbarer Blender-Master, gerenderte Web-Ausgabe mit eigenständigem HTML, Desktop-/Mobilkamera, kurze einmalige Begrüßung, Sol für klar umrissene Arbeit und Astra gezielt für schwierige Entscheidungen und Prüfung.

**Erster Schritt nach einem späteren ausdrücklichen Startauftrag:** Aktuelle Quellenlage bestätigen und den begrenzten Blender-Einrichtungsnachweis mit anschließendem Coco-und-Tür-Prototyp durchführen. Weder eine weitere CSS-Runde noch drei unverbindliche Canva-Welten sind dafür erforderlich.

Ein Plan kann Perfektion nicht garantieren. Er kann verhindern, dass eine schwache Figur bis zur fertigen Website weitergetragen wird, dass Übersetzungen an Bildtexten scheitern oder dass ein schönes Video die Bedienung blockiert. Genau dafür sind die sichtbaren Prüfpunkte und die vollständigen Quellen vorgesehen.

**Grenze dieses Ergebnisses:** Dieses Dokument ist der Produktionsplan. Es enthält keine fertig erstellten 3D-Modelle, keine neuen Renderings und keinen Nachweis einer umgesetzten Website. Die Umsetzung beginnt erst auf ausdrücklichen Auftrag.

## Umsetzungsnachweis vom 06.10.2026

Der frühere offene Aufgabenstand bleibt als Planhistorie erhalten. Umsetzung durch Martin inzwischen ausdrücklich freigegeben. Quellenvertrag und lokale Blender/MCP-Produktion sind praktisch nachgewiesen; Encoder/Web-Export folgen erst nach visuellem Master. Sol-Pilot:21 technische Prüfungen bestanden; anschließende autorisierte Astra-Verfeinerung:25 technische Prüfungen bestanden. Jeweils echte Geometrie, Speicher-/Wiederöffnungsnachweis und mehrere Perspektiven/Kontrollposen. Visuelle Abnahme bleibt false.

Astra verbessert Augenreflexe/-einbettung, Fell, Stirnmaske und Orange. Grenzen bleiben kanonische ausdrucksstarke Gesichtsskulptur, zusammenhängender Hals-/Schulterübergang und deformierende Lider. Der nächste Produktionsschritt muss diese zusammenhängenden Formen und Lidbewegungen bearbeiten; weitere Dekoration, Crew-Modelle oder Website-Code würden auf einer noch ungeeigneten Figur aufbauen. Vorhandene Quellen, Kamera, Tür, Licht und Prüfwerkzeuge bleiben verwendbar. Aus dem Ergebnis folgt weder eine allgemeine Unmöglichkeit der KI-Modellierung noch ein zwingender bezahlter Dienst.
