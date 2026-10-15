# Coco-Animation Produktionsplan V12

> **Für ausführende Fachagenten:** Zur späteren Umsetzung diesen Plan mit `superpowers:subagent-driven-development` (empfohlen) oder `superpowers:executing-plans` Schritt für Schritt abarbeiten. Jeder Schritt nutzt Checkboxen. Dieser Auftrag erstellt nur den Plan; er autorisiert keine Produktion.

**Stand:** 16.10.2026.

**Ziel:** Einen präzisen Produktionsplan für eine 20 Sekunden lange Coco-Szene mit ihrem bestehenden Telefon und Remys kurz sichtbarem Rüssel erstellen.

**Architektur:** Als späteren Produktionsweg empfiehlt der Plan ein stilgeprüftes, kontrollierbares Blender-3D-Modell mit getrennt steuerbarem Coco-Körper, Gesicht, Füßen, Flossen und Unterkiefer sowie eigenem Rüssel- und Telefonkontakt. Das Modell und die Rigs existieren noch nicht. Erst werden 20 Stil-/Kontakt-Gates geprüft, danach sechs begrenzte Bewegungsproben und schließlich die 600 Filmframes gerendert.

**Technik:** Blender 5.2.2 LTS mit verbundenem bpy-Zugriff; kein passendes Coco-Modell, keine Rigs und keine Modellgeneratoren/Assetbibliotheken verfügbar. Keine Installationen, Anbieteraufrufe, Käufe oder neuen Stimmen in diesem Planauftrag.

**Spezifikation:** Nutzerauftrag „ultradetaillierter Produktionsplan, keine Ausführung“. Verbindlicher Coco-Kanon: zuletzt bestätigtes V8-Storyboard `Coco_Storyboard_20Bilder.png`; V11-Remy-Rüsselbilder nur als statische Form-/Farbprüfung; V7 nur als akzeptierte Unterkiefermechanik. Zentrale Übergabe: `docs/finance/investment-meeting-plan-20261019.md` und Workstream `GC-FINANCE-BAYSTARTUP-20261008`.

## Global Constraints

- Der Auftrag in diesem Dokument ist schriftliche Planung. Heute werden keine Medien generiert, keine Modelle gebaut, keine Audios/Videos gerendert und keine PowerPoint-Datei geändert. Eine lesende Statusprüfung von Blender ist erfolgt; daraus folgt keine Modellbereitschaft.
- Bindender Coco-Bildkanon ist die zuletzt vom Nutzer bestätigte Datei `Coco_Storyboard_20Bilder.png` in V8. V7 darf nur als Mechanikreferenz für den Unterkiefer dienen; V7-Kopf und V7-Figur sind keine Formvorlage.
- Bindende Remy-Rüsselreferenz ist Remys eigenes Originalbild. Blasses Periwinkelblau, weiche zylindrische Verjüngung, Querfalten und rundes Nasenloch; kein pinker Rüsselstreifen. Rosa im Original sitzt in den Ohren.
- Der Rüssel kommt von links, schiebt das Telefon nach rechts und zieht sich anschließend nach links zurück. Er darf nicht von rechts kommen und Coco nicht schon beim Eintritt überlagern.
- Keine anderen Crew-Figuren, kein zusätzlicher Slogan/Text, keine neue Stimme, keine Musik und kein Klingelton. Nur die bestehende Coco-Audiospur wird verwendet.
- Finalziel für eine spätere autorisierte Renderstufe: 1920×1080, 30 fps, 20,000 s, 600 Frames mit Indizes 0-599; Video-Encoding und PowerPoint-Einbettung sind spätere, getrennte Prüfschritte.
- Jeder Fehlversuch bleibt erhalten und wird protokolliert. Keine Wiederholung eines Bild- oder Bewegungsaufrufs ohne konkreten Fehlerbefund und begrenzte Root-Entscheidung.
- Eine spätere Einbettung ins Deck beginnt erst nach Nutzerabnahme des vollständigen Coco-Films und Auftrag für die anschließende Deckstufe.

## Review Focus

1. **Figurenidentität:** Stimmt der 3D-Kopf und die kurze Körperform aus dem V8-Kanon? Gate: 20 Lookdev-Stills mit direktem Referenzvergleich; keine Filmproduktion bei Stilabweichung.
2. **Anhängsel und Farben:** Bleibt Remys Rüssel seinem eigenen Original treu? Gate: Seitenvergleich gegen Remy-Bild vor Detailmodellierung; kein Farbschluss aus anderen Crew-Teilen.
3. **Bodenhaftung:** Wechseln beide flachen Füße sichtbar die Stützrolle ohne Rutschen oder Schuh-/Knöcheloptik? Gate: 60-Frame-Gangproof vor dem Vollfilm.
4. **Telefonkontakt:** Schiebt der Rüssel das Telefon wirklich von links nach rechts und greift/legt Coco den Hörer ohne Schweben ab? Gate: eigene Proofs für Rüssel, Sitzen, Hörergriff, Rückgabe und Sprache; alle vor dem Vollfilm.
5. **Schnabel und Audio:** Bleibt Cocos obere Gesichtsform fest und bewegt sich nur der untere Schnabel kontrolliert? Gate: fünf repräsentative Mundzustände gegen V8-Look und vorhandenen V7-Mechanikproof. Ton bleibt exakt die vorhandene Datei; keine Phonem-Synchronisation wird behauptet.

---

## 1. Umfang, Status und klare Grenze

**Bewertungsstand:** Dies ist ein vorgeschlagener Plan, kein abgeschlossener Animationsfilm. Von den Produktionskriterien ist aktuell nur die V8-Referenz und der Unterkiefermechanismus akzeptiert; Modell, Rig, Stilgate, Gang, Telefonkontakt, Film und Nutzerabnahme stehen noch aus.


### Diese Szene

Geplant wird nur eine einzelne Coco-Szene von 20 Sekunden mit einem kurz sichtbaren Remy-Rüssel. Die Szene zeigt eine echte Eintrittsbewegung, acht abwechselnde Schritte, ein kurzes Winken, den Telefon- bzw. Rüsselkontakt, das Setzen, das Abheben und Zurücklegen des Hörers, Cocos bestehende Sprachzeile und einen ruhigen Schlussblick nach rechts. Eine feste Kamera und ein warmes, helles Bühnenumfeld sollen durchgehend bestehen bleiben.

**Nicht Teil dieser Stufe:** Remys vollständiger Auftritt, Schreibmaschine, Remy-Dialog, Emmis Szene, Wilmas Szene, gemeinsamer Schluss aller vier, vierstimmiger Dialog, Deckbearbeitung oder PowerPoint-Wiedergabe. Erst nach Annahme von Coco als Figur und Bewegung wird ein eigener Plan für die restliche Crew erstellt.

### Belegte Ausgangslage

- V6 wurde vom Nutzer wegen wackeliger Bewegung, falschem Mundloch und unzureichender Bein-/Schnabelbewegung abgelehnt.
- V7 zeigte einen technisch brauchbaren unteren Schnabel und einen Eintritt-Proof; der Nutzer akzeptierte die Mundmechanik. Das ist keine Freigabe für den V7-Kopf oder V7-Stil.
- V8 lieferte die bevorzugte süße Coco-Bildsprache und 20 Beat-Konzepte. Diese Posen sind kein geriggter Film und belegen keinen alternierenden Schritt.
- V9 wurde vom Nutzer visuell abgelehnt, weil die Figur nicht dem V8-Look entsprach und der Rüssel aus der falschen Richtung kam. Datei/Hash sind Historie, keine Vorlage.
- V10 wurde wegen Rüsselform/-farbe zurückgewiesen. V11 korrigierte den Rüssel nach Vergleich mit Remys eigenem Original; Root bestand die statischen V11-Rüsselbilder. Das belegt nur deren Erscheinung, nicht eine kontinuierliche Szene oder Bewegung. Ein Optical-Flow-Proof verformte die Wählscheibe. V10/V11-Bilder sind Referenzen, keine zusammenhängenden Filmframes.
- Blender 5.2.2 LTS und bpy sind verbunden. Der aktuelle Blender-Status zeigte nur Standardobjekte und kein Coco-Modell, kein Crew-Rig, keine Style-Bibliotheken und keine aktiven automatischen Generatoren. Verbundener Blender-Zugriff ist keine Modellbereitschaft.

## 2. Referenzbestand: wiederverwenden, nicht falsch übernehmen

| ID | Vorhandene Datei und Messwert | Verbindliche Verwendung | Was sie nicht belegt |
|---|---|---|---|
| LEGACY-COCO-MECHANIK | animation-v6/art/references/image2.png, 560×539, SHA-256 031ff6051c3953f3ce2f0b96af10b35850300a7d1d5abaff86e2255db744ccdd | Nur historische Referenz für Telefon-/Schnabelmechanik, falls nötig | Keine Gesichts-, Farb- oder Körpervorlage für das neue Coco-Modell |
| CANON-COCO-V8 | animation-v8-coco-plan/Coco_Storyboard_20Bilder.png | Vom Nutzer zuletzt bestätigter Coco-Look und maßgebliche visuelle Referenz. SHA-256 712701d2e34fdd03e73823263424d155379b0fc558e41e81750ee8778acfcba8. | Konzept-/Storybilder, keine rigfähigen Einzelansichten und kein Nachweis eines fertigen Gangzyklus |
| CAN-REMY | animation-v6/art/references/image3.png, 1241×1267, SHA-256 3af4ee9699c2e7c17408e51fdc9ef6b31a91c194ccbb98319a7d4ae5204c9777 | Remys eigenes Plüsch-/Farb-/Rüsseloriginal; Rosa nur an den Ohren | Kein vollständiges Rüsselrig |
| GUIDE-TRUNK-V11 | animation-v11-remy-reference-fix/art/remy-trunk-4details-v1.png, 1672×941, SHA-256 6927754d436c06827a2297cdde455701e0f5a237e56acb51e6013b2d14ef1bc9 | Geprüfte Rüsselfarbe/-form im Detail | Keine zeitliche Kontinuität |
| GUIDE-PHONE-V11 | animation-v11-remy-reference-fix/art/remy-trunk-12frames-v1.png, 1932×814, SHA-256 6010570392536d7cff50091e09ed8578d3bdb77a2d92a85b85770fc53dada15a | Regiehinweis für Rüssel-/Telefonrichtung und Bühnenwirkung | Eine Zelle zeigt das Telefon außerhalb der Szene; keine finale Animationssequenz |
| MOUTH-MECHANIK-V7 | animation-v7-coco-proof/geometry-review/ und rig/ | Nutzerakzeptierte Mechanik: Unterkiefer mit 31 Zwischenstufen am V8-Schnabelprinzip; keine Übernahme des V7-Gesichts. Für die fünf Lookdev-Stills nur geschlossene Kante sowie 25/50/75/100 % derselben Unterkieferbewegung. | Keine A-/O-Phonemformen und keine alternative Mundmorphs |
| AUDIO-COCO | animation-v6/audio-elevenlabs/full-dialogue-v1/normalized/line-01-coco-normalized.wav, 185472 Samples, mono PCM16, 44100 Hz, 4,205714 s, SHA-256 203b917652eebe1743ca6beb8ef097cb2092e24634f2709bfe067c19e4996941 | Vom Nutzer freigegebene normalisierte Coco-Zeile unverändert abspielen | Keine neue Voice-Erzeugung, keine unnormalisierte Rohdatei und keine neue Sprecherfreigabe |

Emmi und Wilma haben Originalbilder im selben Referenzordner, werden aber in der 20-Sekunden-Coco-Teilprobe nicht gezeigt. Sie werden nicht zu Szenenfiguren umgebaut oder als Farbreferenz für Coco/Remy verwendet.

## 3. Mengenplan: neue KI-Bilder, Rig-Stills, Tests und Filmframes

Die Mengen sind **Planwerte**, kein bestätigtes Produktionsbudget oder Qualitätsversprechen.

| Material | Basisumfang | Art | Zählweise |
|---|---:|---|---|
| Neue KI-Quellenbilder | 0 | Keine Imagegen-Aufrufe im Basisweg | Nur falls ein konkreter sichtbarer Modellwinkel nicht aus Originalen ableitbar ist: höchstens 4 einzelne Zusatzansichten, jede mit eigenem Root-Gate vor einem Aufruf. Heute keine Freigabe zur Erzeugung. |
| 3D-Lookdev-/Kontakt-Stills | 20 | Normale Blender-Renderbilder aus demselben Modell, Rig, Licht und finaler Kamera | 6 Ansichten + 6 Aktionsposen + 5 Mundzustände + 3 Kontakt-Makros. Kein generatives Bildset. |
| Kurztest-Frames | 216 | 60 Gang + 30 Rüssel/Telefon + 30 Sitzen + 30 Griff + 36 Rückgabe + 30 Sprache | Sechs begrenzte Tests decken alle riskanten Aktionen ab. Sie liegen in den späteren 600 Filmframes und können nur bei identischen finalen Renderbedingungen wiederverwendet werden. |
| Finalfilm | 600 | 1920×1080, 30 fps, 20,000 s, Frameindizes 0-599 | 216 bereits geprüfte Frames können bei unveränderter Version wiederverwendet werden; 384 Frames verbleiben zusätzlich. |
| Geplante berechnete Frame-/Still-Ausgaben im fehlerfreien Basisweg | 620 | 20 Gate-Stills + 600 Frame-IDs | Nicht 836: 216 Kurztest-Frames liegen in den späteren Filmframes und werden nicht doppelt addiert. Gehaltene Bilder dürfen identisch sein. Keine Garantie gegen Korrektur-/Zusatzbilder. |
| Gespeicherte Zwischenrenders | 0 eingeplante | Keine grauen/unbeschrifteten Testserien | Jeder zusätzliche gespeicherte Render wird im Manifest separat gezählt und begründet; er wird nicht stillschweigend in die 620 eingerechnet. |
| Kontaktbogen, CSV, Standbild-Extraktionen | Ohne neue Posequelle | Zusammenstellungen/Tabellen vorhandener Renderframes | Ein Kontaktbogen erzeugt keine zusätzliche Figurpose; extrahierte Vorschau-PNGs zählen als abgeleitete Prüfung, nicht als neue KI-Bilder. |

### Die 20 Gate-Stills

Die 20 Stills ersetzen die frühere grobe Zehnerliste; die 10 werden **nicht zusätzlich** produziert. Die vollständige ID-Aufteilung steht unten.

**Die 20 Gate-Stills (vollständige ID-Liste, keine zusätzlichen versteckten Ansichten):**

| IDs | Motiv | Prüfzweck |
|---|---|---|
| VIEW-01–06 | 01 Coco frontal stehend; 02 3/4 nach rechts stehend; 03 Profil nach rechts; 04 3/4 nach links stehend; 05 frontal sitzend; 06 3/4 nach links sitzend | Modellansichten. Sie gehören zu den 20 Gesamtstills. Der Film behält eine feste Kamera; keine zusätzliche Telefon-Makroansicht wird hier gezählt. |
| POSE-01–06 | 01 Coco späht herein; 02 linker Fuß trägt/rechter schwingt; 03 rechter Fuß trägt/linker schwingt; 04 höchste Position einer kleinen Welle; 05 mittlere kontinuierliche Sitzbewegung; 06 Reichpose zum Hörer | Aktionslesbarkeit, Gegenschritt, Gelenkübergang und Flossenreichweite. Bremsen und Welle bleiben getrennte Zustände. |
| JAW-01–05 | Unterkieferzustände 0 %, 25 %, 50 %, 75 %, 100 % derselben Scharnierbewegung | Fünf Stufen derselben freigegebenen Mechanik. Oberkiefer bleibt relativ zum V8-Kopf fest; keine A-/O-Phonemform oder zusätzliche Mundmorph. |
| CONTACT-01–03 | 01 Rüsselspitze schiebt die Telefonseite; 02 linke Flosse umfasst den Hörer; 03 Hörer sitzt auf beiden Auflagen, Flosse hält noch | Drei sichtbare Kontaktmakros; kein geplanter Kontaktton. Kabel und Telefonbasis bleiben befestigt. |

Die 20 Bilder werden aus einem gemeinsamen Modell/Rig gerendert. Die sechs VIEW-Stills sind im Gesamtbudget enthalten und keine weiteren Gate-Renders. Bei den drei Kontakt-Makros wird die Kamera für die Diagnoseansicht gedreht/enger gestellt; die Filmkamera bleibt anschließend fest. Ein Kontaktbogen ist eine Montage dieser Stills, keine zusätzliche Posequelle.
Der Root prüft den nummerierten 20er-Kontaktbogen gegen Quellenbild und reale Einzelstills. Stilabweichung oder ein unglaubwürdiger Kontakt stoppt die Vollanimation.

## 4. Szenenlayout und feste Bühne

**Kamera:** 16:9, 1920×1080, ein ruhiger fester Blick leicht von vorn/3/4; keine Kamerafahrt, kein harter Schnitt, keine Zoomänderung. Warmes Off-White als Hintergrund/Boden, weiche Bodenschatten und ein klarer gemeinsamer Grundkontakt. Dieser Look folgt den akzeptierten V8-Bildern, keine neue Marken-/Titelschrift.

**Zielpositionen:** Die Telefonbasis endet sichtbar links; Coco endet rechts davon mit genug Abstand, dass die linke Flosse den Hörer ohne verdrehte Schulter erreicht. Remys Rüssel kommt zunächst komplett aus dem linken Offscreen-Bereich. Seine Spitze berührt die Telefonseite, schiebt Basis und Hörer gemeinsam in einer kurzen, lesbaren Bewegung nach rechts bis zum fest markierten Endpunkt links neben Coco und zieht sich dann nach links zurück. Exakte Bildschirm-Koordinaten werden nicht behauptet, bevor das Rig existiert; im Blockout werden Basisbreite, Flossenspanne und Greifreichweite im selben 1920×1080-Kamerabild gemeinsam gesetzt und dann gesperrt.

**Telefonteile:** Telefonbasis, Hörer und Kabel sind getrennte, sichtbare, rigfähige Elemente. Das Hörergewicht folgt einer Kontaktbahn. Er bleibt bis zur Flossenkontaktphase auf der Gabel, sitzt während des Hörens am Kopf, wird zurückgeführt und berührt die Gabel vor dem Loslassen. Kabel bleibt am Gerät befestigt und darf weder durch Coco noch durch Bühne/Telefon springen.

**Coco:** Der Kopf muss rund und klar wiedererkennbar bleiben; kurzer plüschiger Körper, kleine flache Pinguinfüße, V8-Augen-/Wangen-/Schnabelproportion. Kopf und Blick können gezielt führen, aber es gibt keine ungewollte Gesichtsverformung. Die Füße tragen wechselnd und bleiben während der Stützphase am Boden; keine menschlichen Schuhe oder Knöchelstiefel.

**Remys Rüssel:** nur der Rüssel wird gezeigt, kein Gesicht/ganzer Körper. Er bleibt blass periwinkle, mit kurzer gerundeter Verjüngung, weicher Plüschoberfläche, sichtbaren Querfalten und rundem Nasenloch. Kein Rosa am Rüssel und keine helle Coco-Blaufarbe. Rüsselrotation und Dehnung folgen einer ruhigen gekrümmten Kontaktbahn, nie einem scharfen Teleport.

## 5. Exakte Regie und 600-Frame-Zeitplan

Alle Framebereiche sind **halb offen**: Start-Frame gehört zur Aktion, End-Frame nicht. 30 fps, Zeit = Frame/30 s. Der vollständige Film enthält die Indizes F0000 bis F0599. Die zwei relevanten Nutzeranweisungen werden getrennt umgesetzt: Coco tritt zuerst allein als ganze Figur ein; Remys Rüssel kommt erst danach aus links, schiebt das Telefon nach rechts, zieht sich nach links zurück.

| Zeit | Frames | Aktion und Kontrollpunkt |
|---|---:|---|
| 0,000-0,800 s | [0,24) | Coco späht am linken Rand. Erst die Augen, dann folgt der Kopf nach 4-6 Frames. Körper bleibt bis zur Eintrittsbewegung außerhalb. Telefon ist noch links außerhalb des Kamerabildes; kein Rüssel sichtbar. |
| 0,800-4,800 s | [24,144) | Echter Eintritt mit acht 0,5-s-Schritten zu je 15 Frames, abwechselnd linker/rechter Lead-Fuß. Coco bewegt sich nach rechts und endet rechts vom späteren Telefonstopp. In der jeweiligen Stützphase bleibt der tragende Fuß weltverankert. |
| 4,800-5,300 s | [144,159) | Coco bremst ohne Rutschen ab. Beide flachen Füße setzen, kleine Gewichtsberuhigung, Kopf bleibt stabil. |
| 5,300-6,000 s | [159,180) | Kleine freundliche Flossenwelle, keine übergroße Ganzkörperbewegung. Blick nach vorn. |
| 6,000-7,300 s | [180,219) | Erst nachdem Coco rechts zur Ruhe gekommen ist, kommt Remys Rüssel aus links. Die Spitze berührt das links eintretende Telefon sichtbar und schiebt es nach rechts bis zur linken Bühnenmarke. Coco darf nicht gleichzeitig am linken Rand den Rüssel blockieren. Telefon und Hörer bleiben zusammen und stabil. |
| 7,300-7,700 s | [219,231) | Rüssel löst den Kontakt, zieht sich vollständig nach links zurück. Telefon steht still links neben Coco. Coco folgt dem Rüssel mit Augen und dann Kopf, ohne neue Figur einzublenden. |
| 7,700-8,700 s | [231,261) | Coco setzt sich kontinuierlich über Hüfte/Knie. Kein Pose-Pop, keine Kameraänderung. Linke Flosse geht in Richtung Telefon. |
| 8,700-9,000 s | [261,270) | Reichbewegung: linke Flosse nähert sich dem Hörer; Blick folgt zur Basis. |
| 9,000-9,600 s | [270,288) | Flosse berührt den Hörer, schließt den Griff und hebt ihn sichtbar zur Kopfseite. |
| 9,600-10,600 s | [288,318) | Coco hört ruhig zu. Hörer bleibt an der Kopfseite. Kleine Kopfneigung/Blinzeln möglich; Schnabel geschlossen. |
| 10,600-11,300 s | [318,339) | Hörer wird in einer gleichmäßigen Bahn zurück zur Basis geführt. |
| 11,300-11,500 s | [339,345) | Hörer berührt die Gabel. Sichtbarer Sitzpunkt und Kabelkontrolle. |
| 11,500-11,800 s | [345,354) | Coco öffnet den Griff und löst die Flosse vom Hörer; nichts schwebt. |
| 11,800-12,600 s | [354,378) | Coco richtet Blick und Kopf zum Publikum, bereitet die bestehende Zeile vor. Hörer liegt vollständig auf der Gabel. |
| 12,600-16,833333 s | [378,505) | Vorhandene Coco-Zeile beginnt auf F378: „Hi, ich bin Coco, dein Ratgeber. Wie kann ich dir helfen?“ Normierte vorhandene Unterkiefermechanik mit näherungsweiser Audioenergie-Ansteuerung; keine exakte Phonem-Synchronisation behaupten. Die normalisierte Audiodatei endet bei 16,805714 s innerhalb F504; das Bildintervall der Sprechphase endet an der Framegrenze 16,833333 s vor F505. |
| 16,833333-17,000 s | [505,510) | Schnabel schließt. Kurz nachsprechen/blinzeln; Körper und Telefon bleiben ruhig. |
| 17,000-18,000 s | [510,540) | Augen zuerst nach rechts, Kopf folgt mit 4-6 Frames Verzögerung. Es schaut zu einer späteren Crew, aber niemand erscheint in diesem Film. |
| 18,000-20,000 s | [540,600) | Ruhige Endhaltung mit kleinem Atem-/Blinzelimpuls. Letztes Bild mindestens bis Clipende halten, keine Schleife. |

### Schrittfolge und Kontakte

Die acht geplanten Schrittkontakte wechseln aus Cocos Perspektive: F30 links, F45 rechts, F60 links, F75 rechts, F90 links, F105 rechts, F120 links, F135 rechts. Der rechte Fuß ist vor dem Eintritt belastet; bei F30 übernimmt links. F135 ist der letzte rechte Fußkontakt am bereits erreichten Endpunkt; ab F135 bleiben beide Füße und der Root-Standort fixiert. Zwischen F135 und F144 beruhigt sich nur der Oberkörper; es gibt keinen neunten Schritt. Zwischen den Kontakten gilt ein Weltkoordinaten-Stütztest; konkrete Gelenkwinkel/Koordinaten werden vor dem Rig nicht behauptet. Das sind Sollkontakte, kein Nachweis eines gerenderten Gangs. Die Kontaktintervalle nach den Sollwechseln sind [30,45), [45,60), [60,75), [75,90), [90,105), [105,120), [120,135), [135,144); [24,30) ist die Vorbereitung mit rechtem Vorstütz und linkem Vorschwung. In jedem Übergang muss die Gegenseite den Bodenkontakt übernehmen, bevor der vorherige Fuß abhebt. Laufgeschwindigkeit wird auf Strecke und kurze 4-s-Laufzeit abgestimmt; keine fest behaupteten 2D-Koordinaten oder gemessenen Winkel. Sichtprüfung soll F060, F090 und F120 sowie normale Wiedergabe umfassen.

Der Rüsselkontakt wird beim Blockout in derselben Kameraperspektive festgelegt. Ziel ist ein kurzer, lesbarer Schub, kein harter Stoß. Der Fuß-/Telefonabstand muss groß genug für eine linke Flossenreichweite bleiben. Beim Greifen bleibt ein sichtbarer Kontaktpunkt am Hörer; beim Auflegen kommt zuerst der Hörer auf die Gabel, dann löst Coco die Flosse.

## 6. 20 Gate-Stills vor Filmbewegung

Die Stills werden erst aus dem konstanten Modell/Rig und derselben finalen Bühne gerendert. Sie sind keine 20 unabhängigen KI-Bilder. Sie prüfen Identität, Form und Kontakt vor jedem vollständigen Motion-Render. Die genaue Liste steht in Abschnitt 3; die ID-Gruppen lauten VIEW-01..06, POSE-01..06, JAW-01..05 und CONTACT-01..03.

Für jedes Still wird als Beleg festgehalten: Renderdatei, Kamera-/Licht-/Materialversion, verwendete Figurenreferenz, einzelne Prüfbehauptung und Root-Entscheidung. Die 20er-Kontaktübersicht zeigt nummerierte Stills, aber die Root-Abnahme beurteilt auch die Einzeldateien, keine winzigen Bildkacheln. Falsche Remyfarbe, sichtbarer Bruch im Coco-Gesicht, auffällige Größen-/Bodenänderung oder unmöglicher Griff stoppt die Arbeit vor Ganganimation.

## 7. Sechs Motion-Proofs und Renderwiederverwendung

Die sechs kurzen Proben kommen aus derselben endgültig vorgesehenen Blender-Szene. Sitzen, Rückgabe und Sprechmechanik werden dadurch vor dem Vollfilm separat geprüft. Die Proben sind keine extern erzeugten Videos:

1. **T1 P-WALK:** zwei Sekunden, F[60,120), 60 Frames. Prüft echte Alternation, Bodenkontakt, ruhigen Kopf und Standfuß ohne Rutschen.
2. **T2 P-TRUNK:** eine Sekunde, F[201,231), 30 Frames. Prüft Telefonbewegung nach rechts, Kontaktabgabe und Rückzug des Rüssels nach links.
3. **T3 P-SIT:** eine Sekunde, F[231,261), 30 Frames. Prüft kontinuierliches Sitzen ohne Pose-Pop oder Fußschlupf.
4. **T4 P-GRIP:** eine Sekunde, F[261,291), 30 Frames. Prüft Reichbewegung, Flossenkontakt und Höreranheben.
5. **T5 P-RETURN:** 1,2 Sekunden, F[318,354), 36 Frames. Prüft kontrolliertes Zurücklegen, Auflagekontakt und erst danach das Lösen der Flosse.
6. **T6 P-SPEECH:** eine Sekunde, F[390,420), 30 Frames. Prüft den Unterkiefer mit vorhandenem Ton, festem Oberkiefer und ohne behauptete Phonem-Synchronität.

Diese 216 Frames können nur dann in den finalen Film übernommen werden, wenn endgültige Auflösung, Bildrate, Kamera, Licht, Materialien, Assets und Rig-Version **identisch** sind. Jede spätere Änderung an einer dieser Bedingungen verwirft die Wiederverwendung für die betroffene Framezahl; die Differenz wird im Render-Manifest offen gezählt. Keine versteckten Graustufen-/Low-Res-Testserien. Falls ein vorgelagerter Preview gespeichert wird, bekommt er eine eigene Datei-/Versuchszählung und wird nicht als Filmframe ausgegeben.

## 8. Produktionsaufgaben mit prüfbarem Ergebnis

### Task 1 - Referenzen fixieren und Stilblockout

**Ergebnis:** Ein neutrales Coco-/Telefon-/Rüssel-Blockout in der finalen 3/4-Kamera mit markierter Telefonstoppposition, Flossenreichweite und Bodenlinie.

- [ ] Die Originale CANON-COCO-V8 und CAN-REMY nebeneinander mit V8/V11-Konzepten anzeigen.
- [ ] Farb-/Formnotiz mit Werten aus den Originalen anlegen; insbesondere Remys Rüssel nicht von Ohrenfarbe oder Coco-Blau ableiten.
- [ ] Kamera, off-white Boden, Größenverhältnis und Zielposition einmal festlegen.
- [ ] Bildvergleich Root-Gate: bei Identitätsabweichung nicht modellieren/animieren, zuerst Form korrigieren.

### Task 2 - Sechs funktionale Modell-/Rigbausteine erstellen

**Ergebnis:** Eine editierbare Blender-Datei mit sechs funktionsbezogenen Einheiten. Die Anzahl ist nicht die Anzahl von Meshes oder Dateien.

1. Coco-Modell + Körper-/Kopf-/Fuß-/Flossen-/Blick-Rig.
2. Remy-Rüssel + stufenloses Krümmungs-/Kontakt-Rig.
3. Telefonbasis.
4. Telefonhörer.
5. Telefonkabel.
6. Bühne mit fixer Kamera, Boden und Licht.

Coco erhält getrennt steuerbare Hüfte, Knie, beide flachen Füße, beide Flossen, Kopf, Augen und unteren Schnabel. Remys Rüssel erhält mindestens Ansatz, Mittelteil und Spitze mit ruhiger Krümmung; Kontaktspitze/Ende bleibt kontrollierbar. Telefon und Hörer sind separate Teile, das Kabel bleibt angebunden.

### Task 3 - Freigegebenen Mundmechanismus übertragen

**Ergebnis:** Fünf sichtbare Gate-Zustände und 31 gestufte Zwischenzustände der Unterkieferbewegung auf einem V8-konformen Coco-Gesicht. Oberkopf/Oberkiefer bleiben relativ zum Kopf stabil. Augen und Kopf dürfen unabhängig und absichtlich folgen.

- [ ] V7-Proof nur für die Unterkieferbewegung lesen.
- [ ] Form gegen V8-Coco vergleichen; niemals das ältere V7-Gesicht auf das neue Modell setzen.
- [ ] Keine zufälligen Schnabel-/Kopfverformungen zwischen neutralen und geöffneten Zuständen.

### Task 4 - 20 Gate-Stills ausgeben und Root-Review

**Ergebnis:** 20 PNG-Einzelbilder und ein Kontaktbogen im Ordner animation-v12-production-plan/lookdev/. Rendering bleibt Einzelbildprüfung; noch kein Film.

- [ ] Sechs VIEW-Stills, sechs POSE-Stills, fünf JAW-Stills und drei CONTACT-Makros nach Abschnitt 3 rendern.
- [ ] Identität, Farbtreue, Größen-/Bodenstabilität, Fußkontakt, Hörergriff, Kabelverlauf und Rüssel-/Telefonkontakt notieren.
- [ ] Root muss die 20 Einzelbilder visuell freigeben; Kontaktbogen allein reicht nicht.
- [ ] Falls die modellierte sichtbare Ansicht trotz dieser Referenzen unklar bleibt: höchstens vier einzeln begründete zusätzliche KI-Referenzbilder beantragen. Keine Anfrage ohne genaue Ansicht und offene Modellfrage.

### Task 5 - Timeline-Blockout und sechs begrenzte Proofs

**Ergebnis:** Keyframe-/Kontaktdaten für F0000-F0599 ohne erfundene Gelenkwinkel; 60 + 30 + 30 + 30 + 36 + 30 Testframes = 216. Die Abfolge folgt Abschnitt 5. Proofs wie Abschnitt 7.

- [ ] Fußkontakte der acht Schritte festlegen und beim Wechsel Fuß auf Fuß in Weltkoordinaten prüfen.
- [ ] Coco beendet den Gang rechts vom Telefon-Endpunkt, bevor der Rüssel links ins Bild kommt.
- [ ] Rüssel bewegt das Telefon, nicht nur seine eigene Spitze; Telefonstopp/Abgabe ohne Verformung und Schweben.
- [ ] Sitzen, Hörer greifen, heben, halten, ablegen und Flosse lösen als durchgehende Kontaktbahn.
- [ ] Blickübergänge/kleine Flossen-/Atem-/Blinzelbewegungen sparsam einsetzen; keine Wackelbewegung als Ersatz für Acting.
- [ ] T1–T6 einzeln in normalem Tempo prüfen; Kontaktbilder an Übergängen gegen die feste Szene und die jeweilige Tonphase vergleichen.
- [ ] Korrekturen auf einen konkreten Fehler je Gate beschränken; gescheiterte Versuche behalten und Root vor einem weiteren Ansatz entscheiden lassen.

### Task 6 - Final-Framepass, Audio und Packaging

**Ergebnis:** 600 Frame-IDs F000–F599 in 1920×1080, 30 fps, genau 20 s; ein lokales MP4 mit unveränderter vorhandener Coco-Tonspur, plus Manifest und Review-Kontaktbogen.

- [ ] T1–T6-Testframes nur bei identischer Asset-/Render-Version wiederverwenden; ansonsten neu rendern und genaue Anzahl im Manifest erfassen.
- [ ] Alle 600 Frame-IDs einmal prüfen: keine fehlenden oder doppelt vergebenen Frame-IDs; visuell gehaltene identische Frames sind zulässig, eingefrorene Filmphase, fehlende Schatten/Telefon-Teile oder Farbdrift.
- [ ] Bestehendes WAV bei t=12,600 s einsetzen. 185472 Samples/44100 Hz = 4,205714 s; Audio endet bei t=16,805714 s innerhalb F504; das Bildintervall F504 endet bei 16,833333 s, F505 ist der erste frame ohne Ton. Mund ab F505 (16,833333 s) geschlossen.
- [ ] Ton unverändert halten. Keine neue Sprachgenerierung, kein Ring-/Foley-/Musikaufruf.
- [ ] Kodiertes MP4 im normalen Tempo prüfen, Tonstart/-ende und letzten Bildhalt verifizieren; Wiedergabe nicht aus XML/Manifest allein ableiten.
- [ ] Manifest mit SHA-256 für Modell/Blend, WAV, Renderframes, MP4 und Kontaktbogen; exakte Encoder-, Frame-, Sample- und Zeitdaten sichern.
- [ ] Root prüft Bildfolge und normalen 20-s-Durchlauf. Martin entscheidet danach über Bewegungsabnahme.

### Task 7 - Nur nach Coco-Abnahme weiterdenken

Der vollständige Crew-Auftritt, PPTX-Einbettung, Autoplay-/Endbildverhalten, weitere Sprecherzeilen und die Präsentationsgerätprobe sind **separate nächste Aufgaben**. Für die restlichen Figuren gilt derselbe Original-gegen-Anhängsel-Check, bevor irgendein Asset erzeugt wird. Diese Planung erteilt keine neue Produktions-, Audio-, Provider-, Kauf- oder Deckfreigabe.

## 9. Frame- und Prüfdateien

Die separate Datei Coco_Bildliste_600_Frames.csv enthält genau eine geplante Zeile pro Frame 0-599. Spalten: Frame-ID, Zeitintervall, Timeline-Beat, Blickziel, geplante Fußphase, Telefonposition, Rüsselzustand, Hörerzustand, Mundregel und erforderliche Kontakt-/Qualitätsprüfung. Werte sind Regie-/Sollnotizen, keine gemessenen Rigwinkel, Simulationsdaten oder tatsächlich gerenderte Bilder.

Die 20 Gate-Stills und 600 Framezeilen bleiben getrennt: Die Stills beantworten „sieht das Modell aus wie die Originale und kann es die Kontakte?“, der Frameplan beantwortet „welche Aktion soll zu welchem Zeitpunkt sichtbar sein?“. Ein CSV mit 600 Zeilen ist keine 600-Frame-Animation.

## 10. Fehlerbudget, offene Risiken und Abnahmeschwelle

- **Stilrisiko:** hochwertige 2D-Illustrationen sind keine orthografischen 3D-Model-Sheets. Eine 3D-Figur kann aus seitlichen Ansichten deutlich abweichen. Darum Stilprüfung im unveränderten Hauptkamerablick vor Rig-Detail.
- **Rüsselrisiko:** V10 zeigte erfundene Farb-/Formmerkmale. Remys echtes Original ist verbindlich; bei falscher Farbe/Form nicht animieren. Rosa ist nur in den Ohren.
- **Gangrisiko:** V8-Gangposen zeigen keinen geprüften alternierenden Fußwechsel. Fußkontakte müssen im eigenen Rig-Proof erkennbar sein.
- **Telefonrisiko:** V10-Optical-Flow verformte Wählscheibe. Den Telefonkontakt nicht durch Optical Flow lösen; Basis, Hörer, Kabel und Rüssel als kontrollierte Rigobjekte animieren.
- **Mundrisiko:** V7-Mundmechanik ist freigegeben, aber Identitäts-/Gesichtsbasis muss V8 bleiben. Kein Phonem-Sync und keine übertriebene Kieferform ohne Prüfung.
- **Laufzeitrisiko:** 20 s und 600 Frames sind die Planvorgabe. Wenn die bestehende Audiospur oder Nutzerchoreografie später geändert wird, Frames und Timeline neu rechnen und Dokument/CSV aktualisieren.
- **Budgetrisiko:** Heute gab es keine Generierung oder Produktion. Keine Schätzung eines Preises oder einer Modellierzeit. Kostenpflichtige Tools, Installation oder Produktionsdienst sind nicht freigegeben.

**Mindestabnahme für einen Coco-Kandidaten:** V8-Coco ist in jedem Schlüsselbild eindeutig dieselbe Figur; beide kleinen flachen Füße wechseln sichtbar den Bodenkontakt; Remys echter periwinklefarbener, faltiger Rüssel schiebt das Telefon von links nach rechts und verschwindet wieder nach links; Flosse/Hörer/Basis/Kabel haben sichtbare Kontaktpunkte; nur der untere Schnabel öffnet in der Sprechphase; vorhandene Tonspur ist unverändert und korrekt eingesetzt; 20-s-Normalwiedergabe zeigt keine Formverformung, Pop-in-Requisite oder Wackelsilhouette. Danach bleibt die Nutzerfreigabe erforderlich.

## 11. Heute erledigt und noch offen

Dieses Dokument plus 600-Zeilen-CSV sind die heutigen schriftlichen Planartefakte. Keine Modelle, Renderstills, Frames, Filme, Stimmen oder Decks wurden heute erzeugt oder verändert. Der Blender-Zugriff ist vorbereitet, aber das Modell fehlt. Die 20-Gate-Stills, 216-Proof-Frames und 600 Frame-IDs sind Produktionsmengen für einen später eigens autorisierten Durchlauf, nicht bereits vorhandene Medien.

**Nächster ausführbarer Schritt nach separater Produktionsfreigabe:** Modellierer stellt den neutralen Coco-/Telefon-/Rüsselblockout in der festgelegten 3/4-Hauptkamera bereit; Root prüft Stil und Maßstab, bevor 20 Gate-Stills oder irgendeine weitere Medienproduktion begonnen werden.
