# Lerninsel Level 1 — ausführlicher Bau- und Prüfplan (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL nach ausdrücklicher Umsetzungsfreigabe: `superpowers:subagent-driven-development` oder `superpowers:executing-plans`, entsprechend dem dann gewählten Ausführungsweg. Die folgenden Checkboxen sind zukünftige Arbeit, keine ausgeführten Schritte.

**Goal:** Einen hochwertigen, ruhig bedienbaren und tatsächlich begehbaren ersten Ego-Lernabschnitt von der Ankunft bis zum gelösten Verbweg und seinem Ausgang bauen.

**Architecture:** Die bestehende UE-Runtime und ihr Regelkern bleiben Grundlage. Ein ausdrücklich isolierter Level-1-Referenzmodus erhält eigene Szene und Versuchsspeicherung, während der normale Vier-Rätsel-Prototyp unverändert als Kontrollfall erhalten bleibt. Gelände, sichtbare Oberflächen, Pick-/Kollisionsflächen und UI werden getrennt geplant, aber gemeinsam in echten Eingabe- und Laufbelegen abgenommen.

**Tech Stack:** Vorhandenes UE5.8.3, C++, Character Movement, Static-/ProceduralMesh, vorhandene UMG/Slate-Oberflächen, lokale LI4-Saves; Blender nur für später ausdrücklich beauftragte eigenständige Artquellen. Keine Installation oder Laufzeitumstellung.

**Spec:** [ausgefülltes Spielbriefing](spielbrief.md). Basis PR175@`a5dc474295dea4abda06c5be8923de1bc0206248`. Task `GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011`, Spiel Lerninsel. Stand 11.10.2026. **Dieser Auftrag erzeugt ausschließlich Dokumentation und unabhängigen Planreview. Tests/Builds/Spielstarts heute: keine. Design-/Umsetzungsfreigabe: offen.**

## Global Constraints

- „Verbindlich 3D, Ego-Perspektive“; unmittelbares Ziel UE5.8.3 Mac mit normaler Tastatur/Maus.
- „Ganze ausgewählte Wortplatte ohne Häkchen“; direkter E-/Linksklick und automatische richtige Torauswertung, kein Bestätigungsfenster für Wörter.
- Klasse 5–6 einschließlich lernschwächerer Kinder; keine Zeitstrafe, kein Zusatzrätselzwang.
- Referenzabschnitt: Ankunft → sanfter begehbarer Hügel → Verbprobe → Verbweg → Ausgang/Anschluss. Wasseraufgabe und Gebiete 2–8 nicht in diesen Scope ziehen.
- Normale Saves, L1-Bestandshistorie, Source-Checkout, `sources/`, fremde Editoren und ET-Fachdateien erhalten.
- Keine fremden Spielassets ohne konkrete Rechte; keine neuen kostenpflichtigen Aufrufe im Planauftrag.
- Normale Playtests benutzen tatsächliche native/OS-Eingaben. Teleport-/SetFlags-/ForceComplete-Fixtures bleiben separate technische Tests.
- Kein neuer Build-, CI-, Geräte-, Lernwirksamkeits-, Merge- oder Deploynachweis aus diesem Plan.

## Review Focus

1. Zwei physische Inputs auf dasselbe Wort im selben Frame: ein verständlicher Auswahlwechsel, keine zufällige Rücknahme durch doppelte Dispatchwege — M3 und I08.
2. E wählt etwas anderes als die sichtbare Zielmarkierung: beide Aktivierungsarten müssen dasselbe sichtbare erreichbare Objekt verwenden — M3 und I01/I04.
3. Rückkehr aus Alt-Tab bei gehaltener W-Taste: kein ungewolltes Weiterlaufen oder Menü-Klick in die Welt — M4 und F03/F04.
4. Neuer Hügel außerhalb der alten Save-Grenze: Resume muss zu einer sicheren Oberfläche dieses Layouts führen, ohne alte Lernfortschritte zu löschen — M2/M5 und S02/S05.
5. Gelöstes Rätsel, noch bewegtes Tor oder fehlender Anschluss: sichtbarer Erfolg ist kein zu früh freier Collider; Abschluss darf nicht in ein totes Ende münden — M5/M6 und G01/G03/C02.

## 1. Was heute vorhanden ist, was gebaut werden soll, was offen bleibt

| Fläche | Belegter Iststand / Quelle | Ziel für Level 1 | Abnahme und heutiger Status |
|---|---|---|---|
| Runtime | `.uproject`, Modul, PR175; letzte L1-Prüfung 10.10.: 231 portable Checks/5 UE-Suites | Bestehende Mac-Runtime weiterverwenden | Neuer Referenzbuild und normaler Lauf **NICHTGEPRÜFT** |
| Figur | `IslandWorld.cpp:21–35`: Capsule Radius30/Halbhöhe88 cm, Kamera+72 cm, `MaxWalkSpeed`420 cm/s, `MaxStepHeight`30 cm, kein Sprung | Diese Basis bewahren; fließender Hügel statt Sprung-/Kletteranforderung | Bewegungs-/Steigungsproben **NICHTGEPRÜFT** |
| Steigungsgrenze | Projekt setzt keinen eigenen Floor Angle; installierter Engine-Konstruktor setzt Floor Z0,71 | Tatsächlichen Kandidatenwert später auslesen; Terrain deutlich flacher | Geerbter Quellenwert ≈44,765° ist **kein Runtime-Messwert** |
| Gelände | `IslandArt.cpp:50–56`: flacher großer Collider, Rasterplatten, Seitenwände | Sichtbare ansteigende Strecke mit derselben begehbaren Oberfläche | Oberflächen-/Normal-/Fußkontaktproben **NICHTGEPRÜFT** |
| Kulisse | L1 importierter Actor Y14000, kollisionsfrei | Nicht zurück auf die neue Route legen; nur passende eigene frühe Bauteile verwenden | Vollinsel-/Gebietszuordnung weiter **OFFEN**, nicht Teil dieser Abnahme |
| Verbprobe | 4 Wörter, IDs100–103, `introMask`; Auswahl auto-check bei2, richtig5 | Gleiche Wörter/Regeln, bessere Lesbarkeit und knappe Hilfe | Fachliche Baseline vorhanden; neue Bedienung **NICHTGEPRÜFT** |
| Verbweg | IDs200–208, Reihen300/550/800, richtig0/4/8; Klick/E plus Fußdwell0,30s | Bewusste einheitliche Auswahl, leicht rücknehmbar, keine unbeabsichtigten Gehantworten | Modusänderung ist **Vorschlag zur Freigabe** |
| Pick | Klick auf Bildschirmmitte; Approximation Miss≤85 cm plus Sichttrace; E nutzt `Near` | Referenzmodus: identisches sichtbares Ziel für E/Klick, echte Zieloberfläche | Normaler Maustest **NICHTGEPRÜFT** |
| HUD | Großes grünes Panel700×166 in virtueller1440×900-Skalierung; Pflichttext und weitere Overlays | Eine kurze Anforderung, dezenter Fortschritt, freiwillige Hilfe | Lesbarkeit/Überdeckung **NICHTGEPRÜFT** |
| Auftrag/Zone | Alte Aufnahme02 zeigt ungelöstes Intro bei versetzter Kamera | Gültiger Lernschritt bestimmt Auftrag; geschlossene Tore erklären Grenzen | Alte Fixtureaufnahme ist **kein bewiesener Produktbug** |
| Menü | UMG Pause/Slider0,25–3/FOV75 oder85/Fuchsreplay; keine belegte Start-/Levelneustartfläche | Kompakter Start/Pause/Ende mit sichtbarem Tastaturfokus | Neue Menüs **NICHTGEPRÜFT** |
| Speicher | LI4, Produktionsslot `LerninselV1`; Preview startet frisch; alte Safe-Range X≥−1900 | Eigene Referenz- und Anschluss-Slots mit Layoutkennung/validierter Position | Migration/Resume **NICHTGEPRÜFT** |
| Fuchs/ET | Sitzmesh, kein Rig; kein Game ET in gelesenem Lerninsel `.uproject`/Build.cs | Kein bewegter Fuchs im ersten Abschnitt; keine vorgetäuschte ET-Anbindung | Jeweils spätere getrennte Fachaufträge |

Die „neue Qualität“ ist eine Entwurfsanforderung. Die vorhandenen Playbilder sind reale Baselinebilder, jedoch geskriptete Posen. Wir vergeben daraus heute weder eine neue Grafiknote noch eine vollständige Spielabnahme.

## 2. Entscheidung zwischen drei realistischen Wegen

**Empfohlen: eigenständiger Referenzmodus innerhalb des vorhandenen Projekts.** Er kann früh Gelände, Wortobjekte und Menü als zusammenhängenden Abschnitt zeigen, bekommt isolierte Saves und lässt den Kontrollprototyp erhalten. Das ist mehr als ein Materialwechsel, aber kleiner als die Anpassung der ganzen kombinierten Achtgebiets-Insel. Nach Freigabe wird nur dieser Abschnitt produziert.

**Alternative: sofort den Hauptprototyp überschreiben.** Weniger Szenenvarianten, jedoch größere Gefahr für bestehende Fortschritte und schwierigerer Vorher-/Nachhervergleich. Nicht empfohlen für die erste Qualitätsprobe.

**Alternative: die gesamte FBX-Insel modular zerlegen und alle Aufgaben ausrichten.** Räumlich langfristig sinnvoll, aktuell zu großer Scope und noch ohne vollständigen Weg-/Kollisionsvertrag. Nicht als Voraussetzung für einen guten ersten Abschnitt verlangen. Der L1-Actor bleibt erhalten; kein stilles Vollinselprojekt.

Der Nutzer prüft die empfohlene Lösung im fertigen Plan. Heute wird keine dieser Varianten implementiert.

## 3. Raumplan: Maßstab und begehbare Route

### 3.1 Koordinatensystem und Entwurfsmaße

Unreal-Einheit1 cm. +X führt vorwärts entlang der Lernroute, +Y nach links/rechts entsprechend Weltachsen, Z nach oben. Alle folgenden **Entwurfswerte** sind Zielmaße, keine gemessene neue Geometrie. Vorhandene erste Wort-/Tor-IDs und ihr Kernlayout bleiben möglichst erhalten. Für die zusätzlichen Ankunftsmeter erweitert allein der Referenzmodus den Anfang.

| Punkt | Entwurfsposition X/Y/Z der Bodenoberfläche, cm | Rolle / Blick |
|---|---|---|
| W0 | −2800/0/0 | Breite sichere Ankunft. Capsulezentrum Z≈88, Auge≈160. Yaw0/Pitch−4°, keine automatische Dauerfahrt. |
| W1 | −2650/80/0 | Beginn hellen Wegs, erster kurzer Bewegungsimpuls. Offener Himmel rechts, Hügel als nächste erkennbare Form. |
| W2 | −2350/120/≈67 | Sanfter Aufstieg, keine Stufe. Ein markanter Herbstbaum steht außerhalb der freien Route. |
| W3 | −2200/80/90 | Breite Kuppe. Von hier sieht man die ganze Verbprobe und das kleine Tor. Keine zweite gleichrangige Abzweigung. |
| W4 | −1750/−40/≈51 | Sanfter Abstieg. Wegkurve führt die Blickachse zur Einführung. |
| W5 | −1350/0/0 | Boden wieder eben, Ruhepunkt vor der Wortzone. Alte Ankunftsarchitektur muss hier versetzt/entfallen; sie darf nicht mitten im Abstieg stehen. |
| W6 | −1100/0/0 | Einführungsschild links, Probe vollständig voraus. Route verzweigt kurz zu vier Wortflächen. |
| W7 | −330/0/0 | Hilfestelle links, kleiner Torrahmen bei X−150. Vordergrund frei. |
| W8 | 50/0/0 | Garten-Eingang; drei Reihen und Haupttor gleichzeitig erkennbar. |
| W9 | 300/0/0 | Reihe 1, Wörter seitlich gruppiert. |
| W10 | 550/0/0 | Reihe 2; Rücknahme links außen bei Y−425. |
| W11 | 800/0/0 | Reihe 3; Haupttor X1350 ist sichtbarer Empfänger der Leitung. |
| W12 | 1150/0/0 | Ruhe-/Ausgangsvorplatz. Kurzer Hinweis auf gelöstes Tor, keine weitere Pflichtfrage. |
| W13 | 1540/0/0 | Hinter Ausgangstor: Abschluss und Anschlussblick auf bestehenden Satzgarten. |

Zentraler Weg ungefähr **44 m** einschließlich leichter Kurven; Wortauswahl erzeugt kurze seitliche Wege. Eine ununterbrochene Gerade mit420 cm/s wäre etwa10,5 s; das ist eine reine Distanzrechnung ohne Beschleunigung, Lesezeit oder Spielspaß. Geplanter Erstversuch2–8 Minuten einschließlich Lesen/Hilfe ist eine Gestaltungsannahme, **keine Zeitvorgabe**. Auch langsamere Kinder dürfen beliebig lange spielen.

Wegbreite normal 240 cm, an Kuppe/Ankunft320 cm, Probevorplatz mindestens 650 cm, Garten mindestens 700 cm. Capsule-Durchmesser60 cm. Durchgang in beiden Toren mindestens 200 cm frei und mindestens 240 cm lichte Höhe. Keine Kronen/Schilder unter 220 cm in Bewegungsflächen; Kollisionsprüfung nutzt trotzdem die vollständige Capsule mit176 cm Höhe plus Sicherheitsabstand.

### 3.2 Hügelprofil und tatsächliche Oberfläche

Empfehlung ist ein eigenes kleines Terrainmesh mit derselben Höhenfunktion für Render- und Kollisionsmesh. Es ersetzt im Referenzbereich den alten planen Darstellungsboden; der Normalprototyp bleibt auf seiner alten Geometrie. Kein unsichtbarer ebener Boden unter einem visuellen Hügel als vermeintlicher Begehbarkeitsnachweis.

Anstieg: X−2650 bis−2200, Z0→90; Kuppe: X−2200 bis−2000, Z90 konstant (200 cm Plateau). Abstieg: X−2000 bis−1450, Z90→0. W4 liegt nun bei−1750, W5 bei−1350; das Plateau wird nicht aus der 450-cm-Aufstiegsrampe herausgekürzt. Die Übergänge verwenden die monotone kubische Smoothstep-Funktion s(t)=3t²−2t³, genau definiert in M2; an Anfang, Kuppe und Ende ist die Tangente horizontal. Ziel für lokale Route: längs höchstens 18°, quer höchstens 8°. Wegen Interpolation wird jede Dreiecksnormal geprüft; der Durchschnitt90/450 ist kein Beweis der maximalen Steigung. Schulterflächen erreichen am Routenrand±200 cm eine sanfte zusätzliche Wölbung, bleiben bis±160 cm begehbar und überschreiten keine erlaubte Normalgrenze.

Meshraster im Hügelbereich ≤50 cm, an Übergängen/Engstellen ≤25 cm als vorläufiges Produktionsmaß. Die dichte triangulierte Oberfläche bleibt klein; sie wird nicht als LOD-/Performancenachweis ausgegeben. Zufällige Höhenmodulation ist im begehbaren Hauptband verboten. Kuppe hat mindestens 200 cm langes sanftes Plateau, damit die Sicht nicht beim Laufen plötzlich kippt. Keine Sprungtaste notwendig; `JumpZVelocity` bleibt0.

Kollision: für diesen kleinen statischen Referenzboden ist dieselbe triangulierte Oberfläche als Query/Pawn-Kollision vorgesehen, etwa vorhandenes Procedural Mesh mit kollidierender Section, sofern nachfolgende Engineprüfung diesen Weg unterstützt. Die konkrete Collision Trace-Konfiguration und Physik-Cooking werden in M2 geprüft; falls deren Wahl sichtbare und physische Oberfläche trennt, darf der Kandidat nicht als begehbar abgenommen werden. Keine dynamische Vollinsel-Collision-Erzeugung.

Begehbare Z-Höhe wird aus der Zieloberfläche ermittelt. Spawns verwenden Bodenhöhe + Capsule-Halbhöhe + kleine getestete Distanz; nicht einfach überall Z88. Vor späteren Tests werden tatsächliche `MaxStepHeight`, `WalkableFloorAngle/Z`, Capsule Scale und Kontaktposition am Kandidaten ausgelesen. Im Quellenstand ist `MaxStepHeight`30 cm, Engine-Floor Z0,71 abgeleitet≈44,765°; Projekt-/Objektüberschreibungen wurden nicht live ausgelesen. Das Layout bleibt deutlich unter dieser Quellen-Grenze, nicht knapp an ihr.

### 3.3 Übergänge, Rand und Kollisionsträger

Am Ende des Hügels laufen neues Terrain und flache Gartenfläche höhengleich aus. Nicht zwei sichtbare koplanare Oberflächen übereinander legen. Falls der große alte Boxboden im Referenzmodus noch gebraucht wird, wird er dort auf klar getrennte Bereiche begrenzt; seine Grenze liegt an derselben Oberfläche, nicht unter einem scheinbaren Loch. Wortplatten sind maximal10 cm hoch, Kanten ≤5 cm oder abgeschrägt. Ein steiler Schriftträger darf nicht als Stufe mitten im Fußweg fungieren.

Kopf-/Seitenschutz wird an echten Formen getestet: Architrav, Baumstamm, Schild, Felsschulter und Torpfosten. Stämme blockieren dort, wo ihre sichtbare Form steht; Laub hat keine harte Kopf- oder Capsulekollision. Wurzeln liegen außerhalb der Hauptroute. Keine unsichtbaren Blockboxen vor offenen Wegen. Felsen/Hecken bilden verständliche Ränder mit einfacher passender Kollision.

Der sichtbare Meereshorizont ist kein erreichbares Schwimmbecken. Route und Vorplätze besitzen erkennbare, niedrige Randformen, breite sichere Schultern und kollidierende Küstenbegrenzung. Kein gefährlicher Absturz als Lernstrafe. Falls ein Defekt trotzdem die Figur unter Terrain bringt, löst ein Referenz-Recoverypunkt aus: letzte validierte sichere Standposition dieses Layouts, unveränderte Lernflags, angehaltene Bewegung, kurze Rückmeldung „Zurück auf dem Weg.“ Das ist ein später zu bauender Sicherheitsfall, kein heute vorhandenes Feature. Unsichtbare Recovery darf falsche Collisionsflächen nicht kaschieren; jeder normale Lauf, der Recovery benötigt, ist ein **FAIL** der Geländeabnahme.

### 3.4 Rätselobjekte, Sichtachsen und lesbare Schrift

Intro bleibt bei den vorhandenen vier IDs100–103, mit Zentren ungefähr(−780,±180,8) und(−545,±180,8). Lerntexte bleiben `laufen`, `Baum`, `singen`, `blau` und ihre vorhandenen vollständigen Satzkontexte. Nicht im selben Schritt das Vokabular austauschen. Die Probe bietet einen ruhigen Vorplatz ohne Blüten, Schattenflecken, dicke Kabel oder Pfosten über den Wortflächen. Einführung10 steht links am Vorplatz bei etwa−1080/−270, Hilfestelle11 seitlich bei−330/−300 statt direkt mitten im Durchgang.

Verbweg behält drei Reihen mit Zentren X300/550/800, je Y−180/0/+180; zugehörige Wörter und Reihenfolge bleiben erhalten. Die Signaturen200–208 bleiben stabil. Reihe 1 `singt/Baum/blau`, Reihe 2 `klein/sucht/Tor`, Reihe 3 `Stein/laut/öffnet`. Kleine seitliche Reihenmarken zeigen1/2/3 ohne die Lösung vorwegzunehmen. Rücknahme22 bleibt links erreichbar; Endhinweis21 wandert bei Bedarf neben den Vorplatz statt in die Laufachse.

Flache Bodenschrift allein genügt nicht. Vorschlag: jedes ganze auswählbare Steinobjekt erhält eine gut sichtbare, zum Anmarsch gerichtete Schriftfläche oberhalb seiner vorderen Kante. Ziel: eine niedrige schräge/nahezu vertikale Stirnfläche mit gut lesbarem Wort, keine zusätzliche Menükarte oder schwebender Bildschirm. Der komplette Stein wird blau, nicht nur ein kleiner Punkt. Schriftträger/Interaktionsfläche gehören sichtbar zum selben Objekt; die Laufmitte bleibt frei. Abstand/Neigung werden aus 1,60 m Augenhöhe, FOV75/85 und2–3 m tatsächlich geprüft.

Zielschriftgröße: mindestens24 Bildpixel hohe Großbuchstaben am normalen Auswahlabstand, mindestens18 px an der vorgelagerten2,5–3 m-Leseprobe, ohne Zoom. Das sind spätere Bildmessziele, keine Zusage aus einer Unreal-Text Render Size. Jeder Satzkontext wird nur beim anvisierten erreichbaren Wort in einer kurzen zweizeiligen Near-Fläche gezeigt. Weil „Baum“ im Satz „Der Baum wächst“ nicht die Handlung benennt, muss die markierte Auswahl eindeutig beim Wort bleiben und darf nicht durch die Satzanzeige alle Wörter blau einfärben.

Tor0 bei X−150 und Tor1 bei X1350 sind aus ihren jeweiligen Aufgabenräumen sichtbar. Eine zurückhaltende Leitung verbindet Probe→Tor0 und Reihen→Tor1, außerhalb der Schriftflächen. Ihr Verlauf zeigt Ursache/Wirkung; sie ist keine neue eigene Rätselmechanik. Bei Lösung aktiviert sich das betreffende Segment, Tor bewegt sich und Lichtlinie endet erkennbar am Tor. Kein falsches Kulissentor in derselben Achse. Neue Szene darf den Y14000-Blockout nicht versehentlich wieder einblenden.

## 4. Was das Kind nacheinander sieht, hört und tut

| Szene | Sicht/Hören | Bewusste Handlung | Knappe Pflichtzeile / Antwort | Räumliche Folge |
|---|---|---|---|---|
| Start | Ruhiger Titel über pausierter Startansicht, keine Introtextwand | Start bzw. Weiter wählen | „Lerninsel“ | Eingabe wird erst nach geschlossenem Menü an Bewegung übergeben |
| Ankunft | Heller sanfter Weg, sonnige Kuppe, ein markanter Herbstbaum; leise optionale Naturkulisse | Mit WASD vorgehen, Maus frei schauen | Einmal „Folge dem hellen Weg.“; kurzer Controls-Hinweis nur bei Erststart | Der sichtbare Anstieg führt von selbst zur Kuppe |
| Kuppe | Verbprobe und kleines Tor sind im Mittelgrund; Meer/Himmel als offene Ferne | Richtung Probe gehen | Nach kurzem Ersthinweis keine neue Dauerzeile | Naturrahmen lenkt zum Vorplatz, ohne Pflichtblick-Trigger |
| Probe | Vier klar getrennte Wortsteine, direkt zugehöriges Tor und Hilfestelle | Zwei Verben mit E/Klick auswählen | „Finde zwei Verben.“ + kleiner Zähler0/2 | Ganze Steine werden blau; richtige vollständige Antwort aktiviert Leitung/Tor |
| Fehler | Blau gewählte unpassende Kombination bleibt nachvollziehbar | Anvisiertes blaues Wort erneut auswählen, dann anderes Wort | „Noch nicht beide Verben. Wähle ein blaues Wort erneut.“ | Tor bleibt geschlossen; nichts wird bestraft oder gelöscht |
| Hilfe | Nur auf H/Hilfestelle eine kurze Einblendung | Nach Bedarf ansehen; jederzeit fortsetzen | Stufen: „Was tut jemand?“ → „Ein Verb beschreibt eine Handlung.“ → vorhandenes Beispiel | Kein Zwang, keine Verringerung eines Scores |
| Tor0 | Ruhige Öffnungsbewegung, dezenter mechanischer Ton optional | Warten und selbst durchgehen | „Beide Verben erkannt.“ | Collider bleibt bis Ende wirksam; dahinter drei Reihen sichtbar |
| Verbweg | Drei nummerierte Reihen, ein Ausgangstor und diskrete Leitung | D: je ein Verb anvisieren und E/Klick. S: bewusst starten, sichere Spur, aktive Reihe über sichtbare Mitte betreten und kurz stehen | D: „Wähle in jeder Reihe ein Verb.“; S: „Gehe auf ein Verb in jeder Reihe.“; Fortschritt „Reihe 1 von 3“ | Gewählte richtige Reihe stabil sichtbar, nächster Teil der Leitung aktiv |
| Rücknahme | Unpassender letzter Stein zusätzlich mit Text „noch nicht passend“/ruhiger Randform | Den letzten gewählten Stein erneut wählen oder Rücknahme22 bedienen | „Diesen Schritt zurücknehmen.“ | Nur letzter Schritt entfernt; frühere richtige Reihen bleiben |
| Tor1 | Alle drei Reihen und Leitung stimmen; Tor öffnet | Selbst durch das offene Tor gehen | „Drei Verben gefunden.“ | Weg hinaus und Satzgartenanschluss sichtbar |
| Abschluss | Kleines ruhiges Abschlusspanel am sicheren Ort, kein Vollbild-Konfetti | Weitergehen oder Pause; freiwillig zum Start | „Verbengarten geschafft. Weiter zum Satzgarten.“ | Fortschritt gespeichert; nächste vorhandene Szene über getrennten Handoff erreichbar |

Geräusche unterstützen Rückmeldung, ersetzen aber nie sichtbare Information. Keine Audio-/Musikproduktion ohne später geklärte Quelle/Rechte. Die Referenz muss stumm vollständig verständlich sein. Keine automatische Vorlese-KI oder Sprachaufnahme. Keine gezielte Erhebung personenbezogener Kinderreaktionen im Repo.

## 5. Art Direction: konkrete Produktionsregeln

### 5.1 Palette und visuelle Rollen

| Rolle | Entwurfsfarben (s RGB) | Einsatz / Grenze |
|---|---|---|
| Warmes Gestein | #D9C7A3, #EEE2C9, dunkler Text #24342B | Ruhige Weg-/Torarchitektur. Keine grellen weißen Rasterflächen über den gesamten Abschnitt. |
| Vegetationsbasis | #426749, #718B43, Akzent #A5BE55 | Naturrahmen mit wenigen klaren Massen; dunkelgrüne Blöcke nicht vor Wortflächen stapeln. |
| Herbstbegrüßung | #B96932, #DBA647, sparsam #E4BE63 | Ein prägnanter Baum/kleine Blattgruppen, keine orange Vollfläche über dem Lernboden. |
| Auswahl | #86BFE5 | **Ganze Wortplatte blau ohne Häkchen**, mit Text „ausgewählt“ bei Fokus und erkennbarem Rand. |
| Bestätigter Fortschritt | Zurückhaltendes Grün/Mint #81CDA3, #62C7AE | Torleitung/gelöste Reihe; nicht alle grünen Naturteile als Status missbrauchen. |
| Korrektur | #E4B16A plus dunkler Text | Unpassend/Rücknahme sichtbar, ruhig, kein Rotblinken/Strafsound. |
| Himmel/Ferne | #77B8D8, helles #D9E8ED, Meer #2C7198 | Luftige Tiefenstaffelung; keine schwarze/dunkelbraune Wand hinter jedem Tor. |

Farbcodes allein garantieren keinen Kontrast. Textziel4,5:1, zentrale UI-/Fokusformen3:1 als Messziele; Schrift-/Material-/Lichtzustände im realen Render prüfen. Es wird keine vollständige WCAG- oder Rechtskonformität aus einem Screenshot behauptet. Bedeutung bleibt durch Text und Form verfügbar, auch bei reduzierter Farbwahrnehmung.

### 5.2 Formen, Vegetation und Materialien

Weg folgt dem Hügel als lesbares Band aus warmem Stein und kompaktem Grasrand. Rasterplatten werden auf Lernflächen und wenige Übergänge konzentriert. Breite Fugenrhythmen brechen die gleichmäßige Fliese, ohne visuelles Suchspiel zu erzeugen. Stein besitzt echte abgefasste Silhouette, leicht unterschiedliche große Flächen und sparsame matte Detailstruktur. Kein rauschender Normal-/Schmutzlayer unter Text.

Ein ausgearbeiteter Herbstbaum, ein grüner Begleitbaum, ein Fels-/Wegmodul und eine Torform bilden zuerst den Referenzsatz. Keine hundert neuen Bilder/Assetvarianten. Kronen müssen aus Spielhöhe als zusammenhängende Blattmassen, Äste als tragende Struktur und Stämme als glaubwürdige Proportionen erscheinen. Ein hochwertiger Baum wird aus vorne/seitlich/hinten und aktiver Ego-Kamera kontrolliert, bevor Instanzen verteilt werden. Kleine Pflanzen gruppieren sich an Rändern, nicht auf Schrift oder Eingabeflächen.

Vorläufige Roughness-Rollen: Stein0,65–0,9, Holz0,55–0,8, Blattoberfläche0,5–0,8, Metalltor0,35–0,6 mit ruhiger Lichtkante. Werte sind Startbereiche für spätere Engine-Materialprobe, keine verifizierten Materialparameter. Keine hochglänzenden Plastiksteine. Normaldetails müssen bei tatsächlichem Abstand helfen; mehr Polygone/Shaderrauschen ist kein Qualitätsmaß.

Himmel, Sonne und Schatten werden zusammen an den Wortflächen eingerichtet. Vorschlag: seitliche warme Sonne von links/vorne, Höhenwinkel35–50°, weiches aber gerichtetes Schattenbild, aufgehellte Schatten ohne ausgewaschenen Stein. Numerische Lux-/Exposurewerte werden erst anhand der vorhandenen Engine-Lichtquellen und eines echten Vergleichsbilds festgelegt; keine ungeprüften „magischen“ Enginewerte. Blattschatten dürfen keine Buchstaben imitieren oder Auswahlfarbe verschleiern. Exposure darf zwischen Kuppe und Probe nicht pumpen.

### 5.3 Bildkandidaten und Vergleich

Später zuerst **ein** konkreter Kandidat mit sechs gleichen Augenhöhenansichten: Ankunft, Kuppe, Intro-Vorplatz, aktive Intro-Auswahl, Verbweg, Ausgang. Jeweils Referenz, Baseline und Kandidat getrennt; gleicher Build/FOV/Viewport für die direkten Runtimevergleiche. Geplante Renderbilder sind nicht heute erzeugt. Eine schöne Vogelperspektive zählt nicht für Wortlesbarkeit, Wegführung oder Torpassage.

Artprüfung fragt konkret: Kann man den Hügelverlauf sehen? Ist das Tor aus der Aufgabe sichtbar? Wo kann man gehen? Sind alle Wörter bei normalem Blickwinkel lesbar? Fehlen störende doppelte Tore/Pfosten? Bleiben eigene Formen und bekannte Referenzstimmung erhalten? Welche Abweichung zur Vorlage ist bewusst stilisiert? Keine behauptete Hyperrealismus-/Witness-1:1-Abnahme aus einfachen Formen.

### 5.4 LOD und Größenmessung

Instanzen für wiederholte kleine Vegetation verwenden, wie im bestehenden Shape-/Batchpfad angelegt, soweit sie Picking/Collision nicht vermischen. Interaktive Wortobjekte besitzen getrennte Identität; sie werden nicht in eine ununterscheidbare Gesamtmesh-Batch gepackt. LOD zuerst am Referenzbaum mit nachvollziehbarer Silhouettengrenze prüfen. Keine aggressive Distanzschaltung am Tor oder Schrift. Konkrete Dreiecks-/Texturbudgets erst nach Messung der ersten Szene festlegen; vorläufige Speicher-/Assetziele stehen im Briefing.

## 6. Eingabevertrag für Maus und Tastatur

### 6.1 Ein sichtbares Objekt, zwei gleichwertige Aktivierungen

Im Referenzmodus bestimmen E und Linksklick dieselbe Auswahl aus der Bildschirmmitte. Die nächste räumliche Nähe (`Near`) reicht nicht als Zielvertrag, weil ein seitliches Wort sonst unerwartet statt des angesehenen ausgewählt werden kann. Bestehender Normalkandidat bleibt Kontrollfall; dieses Verhalten ist eine vorgeschlagene, scoped Überarbeitung.

Ziel ist der erste **tatsächlich sichtbare** Treffer auf einer registrierten Wort-/Hilfefläche. Reichweite zunächst wie bisher225 cm horizontale Distanz, Höhendifferenz<180 cm; M3 prüft beide Randbedingungen an der neuen Oberfläche und stellt dar, wenn eine andere Definition nötig ist. Jede zentrale anvisierte Fläche erhält einen dezenten Umriss/kurzen Aktionshinweis. Verdeckt ein Tor/Fels die Oberfläche, ist keine Auswahl dahinter möglich. Dekoratives Laub darf keine künstliche Blockade erzeugen; feste Wände/Stämme müssen Verdeckung verhindern.

Die aktuelle Pick-Näherung85 cm ist **kein exaktes Wort-Mesh-Hittest**. Für die neue Szene werden Target IDs an tatsächliche `UPrimitiveComponent`-Interaktionsflächen gebunden. Zusätzliche Pick-/Schriftflächen sind im relevanten Query-/Visibilitypfad treffbar und dürfen Pawn ignorieren. Der sichtbare bis10cm hohe Wortsteinkörper benötigt dagegen eine passende Pawn-blockierende Oberseite; die Capsule steht auf dieser tatsächlichen Oberfläche, nicht auf einem unsichtbaren Boden unter dem sichtbaren Stein. Ein Callback auf einen Textblock darf nicht zusätzlich eine Weltaktion auslösen. Wenn die sichtbare Auswahlmarkierung kein gültiges Wort zeigt, verändert E/Klick nichts; kurzer Näherhinweis höchstens bei eindeutig anvisiertem zu fernem Objekt.

### 6.2 Ein Intent, eine Aktion

World-Input bleibt Press-getrieben wie `IE_Pressed` in der Basis. Kein zusätzlicher Release-Toggle. Gehaltenes E erzeugt ohne Loslassen keine Wiederholung. Pointer-Drag aus einem Menü und Mouse Up nach Schließen erzeugen keine Weltwahl. Gleiches Target, gleiche Worldaktion im selben Frame über doppelte Dispatchpfade wird einmal verarbeitet; zwei bewusst getrennte Press/Release-Zyklen müssen als zwei Aktionen erhalten bleiben. Keine pauschale200-ms-Sperre, die schnelle beabsichtigte Rücknahme verschluckt.

E und Klick gleichzeitig im selben Frame am selben Target werden konservativ zu einem Auswahlintent zusammengeführt. Unterschiedliche Ziel-/UIzustände werden nicht zusammengeführt. Menüs/Focus blockieren World-Dispatch. Nach Fokusverlust werden alte Presszustände ungültig; erst ein neuer bewusster Press nach neutraler Eingabe zählt. Diese Referenzlogik erhält einen begrenzten Laufzeit-Guard, keinen globalen Inputrouter für alle Spiele.

### 6.3 Gehen und auswählen sind unterscheidbar

Die vollständig ausgearbeiteten Varianten [D — direkte Auswahl / S — bewusstes Schrittzentrum](auswahlvarianten.md) bewahren ausdrücklich Martins ursprüngliches Schrittspiel. D ist als erster vergleichbarer Bedienkandidat empfohlen; S ist keine unerwünschte Altmechanik und kein erst später zu entwerfender Platzhalter. Eine Freigabe legt genau eines der Profile fest, ohne Moduswahl im einfachen Kindermenü.

D verändert bei bloßem Gehen keinen Lernstate. S nutzt den vorhandenen Dwell0,30s nur nach bewusstem `PathStart`, nur im Zentrum der aktiven Reihe, mit sicherer seitlicher Laufspur und tatsächlichem Fußkontakt auf der sichtbaren Steinoberseite. E/Klick bleibt in S möglich; Besuchskonsumierung und Frame-Guard verhindern Doppelaktivierung. Nach Undo/Pause/Fokusverlust muss das Zentrum erst verlassen werden, bevor Fußauswahl erneut armt. Die genaue Geometrie und neun zusätzliche S-Prüffälle stehen im Variantenblatt.

Beide Profile benutzen dieselben Kernregeln und dieselbe klare Rücknahme. Normaler Legacy-Prototyp bleibt Kontrollfall. Die Entscheidung steht vor Umsetzung offen; der vollständig geplante Schrittweg geht in A/B-Review und Nutzerprüfung mit ein.

### 6.4 Auswahl, Fehler und Rücknahme

Intro: erster/zweiter Stein blau, Zähler0/2→1/2→2/2. Dritter Stein bei voller falscher Auswahl bleibt unverändert; Hinweis „Wähle ein blaues Wort erneut.“ Ein blaues noch ungelöstes Wort erneut auswählen nimmt es zurück. Bei richtiger Kombination `introMask==5` auto-check, `intro=true`, kein separates „Bestätigen“. Danach gelöste Probe stabil; wiederholtes E zählt weder Punkt noch öffnet erneut.

Verbweg: aktueller Reihenindex stammt aus `PathPromptRow`, nicht aus bloßer Kameraposition. `PathStart` wird in D durch die erste gültige Wahl ausgelöst, in S durch den bewussten Start20 oder die erste direkte gültige Wahl. Erneutes Start20 bei pathActive/pathCount>0/pathFailed ist im Referenzadapter state-neutral: Hinweis „Der Weg läuft schon.“ statt `PathStart`. Ein Vollreset ist nur der bestätigte Abschnitt-Neustart. Zu frühe Reihe bleibt unverändert und meldet „Erst Reihe 1“ beziehungsweise die erwartete Reihe. Jeder ausgewählte ganze Stein bleibt blau, auch nach richtiger Auswertung. Grün/Mint liegt ausschließlich auf Leitung oder separater Reihenmarke. Auch ein falsch gewählter Stein bleibt als Auswahl blau; Korrektur wird durch kurze Textzeile und einen getrennten warmen Rand kenntlich, nicht durch eine neue Vollflächenfarbe. Ein falsches letztes Wort bleibt nachvollziehbar mit kurzem Korrekturhinweis; nächste Auswahl ist bis Rücknahme gesperrt. Rücknahme22 entfernt genau den letzten Schritt. Als direkte Variante darf das erneut bewusst aktivierte **letzte gewählte** Wort `PathUndo` auslösen. Ein früheres gewähltes Wort wird nicht mitten aus dem Array gelöscht; Hinweis verweist auf den letzten Schritt. Keine willkürliche Neuordnung und keine Rücknahme bereits abgeschlossener Probe.

Farbbedeutung ist zusätzlich lesbar: „ausgewählt“, „noch nicht passend“, „Reihe 2 von 3“ beim relevanten Target; ganze Platte bleibt deutlich, kein Häkchen. Hilfe nutzt bestehende Taskstufen. Hilfe hat keine Punkte-/Zeitkosten. Eine falsche Antwort löscht keine früher richtig gewählte Reihe, außer das Kind wählt bewusst die vorhandene Rücknahme. `State.verbs` setzt erst nach gültiger vollständiger Folge0/4/8, wie bisher.

### 6.5 Langsame Reaktion, Kamera, Fokus und Pausen

Keine laufende Timerpflicht und keine automatische Verschlechterung bei langem Zögern. Hilfen bleiben manuell abrufbar, Wiederholung nicht bestrafend. Kamera verwendet vorhandene FOV75/85, Pitchgrenzen±75° und Mausfaktor0,25–3; kein erzwungenes Headbob, keine automatische Blickfahrt zum nächsten Wort. Beim ersten Start nur ein stabiler Blick auf Route/Kuppe.

Alt-Tab/falscher Fensterfokus hält Bewegung an, öffnet/erhält Pause und invalidiert Pointerbesitz. Zurückkehrender Fokus setzt nicht automatisch W-Fahrt fort. Esc schließt eine freiwillige Hinweis-/Einstellungsfläche zuerst; sonst Pause. Resume gibt Fokus an die Spielansicht und verlangt neutrale Bewegungsinputs, bevor alte gehaltene Tasten erneut gelten. Menü-Enter/Space kann nicht gleichzeitig ein darunterliegendes Wort auswählen. Dasselbe gilt nach Klick auf „Weiter“.

## 7. HUD und einfache Menüs

### 7.1 HUD-Layout und Copy

Das700×166-Baselinepanel entfällt im Referenzmodus. Oben eine einzelne kurze Aufgabenzeile, maximal520×44 virtuelle Pixel bei1440×900; diskreter Zähler maximal180×30. Normales permanentes HUD beansprucht als Ziel <4% der Fläche; temporärer Near-/Fehlertext zusammen <8%, ohne zentrale Wort-/Torflächen zu verdecken. Diese Prozentziele werden an tatsächlichen Viewportgrößen geprüft. Kein HUD-Hintergrund als halbtransparente grüne Bildschirmwand.

Pflichtzeilen: Ankunft „Folge dem hellen Weg.“; Intro „Finde zwei Verben.“; Verbweg D „Wähle in jeder Reihe ein Verb.“, S „Gehe auf ein Verb in jeder Reihe.“; Ausgang „Verbengarten geschafft.“ Bei hoher Schriftgröße darf eine Zeile in zwei saubere Zeilen umbrechen, ohne sie zu verkleinern oder abzuschneiden. Steuerungslegende erscheint einmal bei Start oder unter freiwilliger Hilfe, nicht zusätzlich dauerhaft im großen Zielpanel.

Near-Fläche enthält Aktion/Wort und genau seinen Satzkontext. Sie ersetzt keine Wortlesbarkeit im Raum, sondern erklärt den Kontext. Fehler-/Hilfetext wird an einer festen ruhigen Position gezeigt und nicht auf einem gleichzeitig benötigten Wort/Schalter. Pause/Einstellungen unterdrücken Gameplay-HUD und Lerntext vollständig. Kein überlappender Bildtextwürfel oder Tooltip-Stapel.

Auftrag folgt dem gültigen Lernzustand. Eine geskriptete Kamera in Zone2 bei ungelöstem Intro zeigt weiterhin Intro; das wird als Fixturelage dokumentiert, nicht als Fehler aus Bild02 bewiesen. Normalerweise verhindern Tore das Vorlaufen. Wenn ein echter normaler Lauf widersprüchliche Orts-/Auftragsanzeigen erzeugt, ist das ein reproduzierbarer Befund; Ortsname und aktuelle Aufgabe werden dann getrennt statt gegeneinander ausgespielt.

### 7.2 Start-, Pause-, Einstellungen- und Endfläche

Start maximalvier Elemente: **Start/Weiter** als ein zustandsabhängiger Hauptknopf, **Neu beginnen** nur bei vorhandenem Referenzversuch, **Einstellungen**, **Schließen**. „Weiter“ erscheint nur nach erfolgreich validiertem Referenzsave, nicht aus einer alten fremden Szenenposition. Kein Login, keine Werbe-/Kauf-/Leistungsdruckfläche.

Pause maximalvier Elemente: **Weiter**, **Neu beginnen**, **Einstellungen**, **Zum Start**. Einstellungen zeigen **Mausgeschwindigkeit** mit bestehendem Slider25–300% und numerischem Wert, **Sichtfeld75/85**, **Zurück**. Tastaturlinks/rechts müssen den Slider bedienen; Fokus ist sichtbar. Optionales Audio kommt nur nach lizenzierter Implementierung hinzu und darf nicht für die erste Matrix nötig sein.

Neustart hat eine einzelne Sicherheitsfrage „Diesen Abschnitt neu beginnen?“ mit **Neu beginnen** und **Abbrechen**; standardmäßiger Fokus liegt auf Abbrechen. Keine Word-Confirmbox. Nur der Referenzslot wird auf einen leeren gültigen Versuch überschrieben, normale Lerninsel-Saves/Preferences nicht löschen. In diesem Zustand bleibt Bewegung pausiert. Endfläche nach tatsächlichem Tor-Durchgang: **Weiter zum Satzgarten**, **Zum Start**; sichtbare Laufroute bleibt nachvollziehbar. Kein fingierter Storyabschluss für alle acht Gebiete.

Tastaturvertrag: Tab/Shift-Tab logischer umlaufender Fokus, Enter/Space Aktivierung, Pfeile für Slider/Listen, Esc zur vorgelagerten Fläche; keine Falle. Buttons mindestens 240×56 virtuelle Pixel, Text mindestens22 px am1440×900-Ziel. Breitere Schrift-/Kontrastoptionen werden geprüft, nicht als vollständige motorische/Screenreader-Lösung zugesagt. Vollständige nichtvisuelle 3D-Aufgabenalternative wäre ein eigener Accessibilityauftrag.

## 8. State, Speichern, Wiederaufnahme und Anschluss

### 8.1 Vorhandene Flags und neue räumliche Metadaten

Lernkern bleibt LI4. Benutzt werden `intro`, `introMask`, `verbs`, `pathActive`, `pathFailed`, `pathCount`, `path[3]`; alle späteren Lernflags starten im neuen Referenzversuch ungelöst. `HintSteps`, `Near`, `Focus`, `Paused`, `Contact`, animierter Gate Angle und Pointerbesitz sind keine unabhängigen Lernergebnisse.

Vorgeschlagene separate Klasse `UIslandLevelOneSave : UIslandSave` trägt zusätzlich `ScenarioId="lerninsel-level1-reference"` und `LayoutRevision=1`. Snapshot bleibt vorhandenes LI4, Position/View bleiben die vorhandenen Felder. Normaler `UIslandSave` und LI1–LI3-Lesepfade werden nicht umdefiniert. Neuer Slot **`LerninselLevel1ReferenceV1`**, Preferences **`LerninselLevel1PreferencesV1`**, Anschluss **`LerninselLevel1HandoffV1`**. Diese Namen sind Planentscheidungen, noch keine existierenden Slots.

### 8.2 Save- und Restore-Zeitpunkte

Nach einer tatsächlichen regelwirksamen Auswahl/Rücknahme wird der Referenzsave wie der bisherige Apply-Pfad geschrieben. Zusätzlich sichere räumliche Standposition nach Hügel/Kuppe/Probe-Gate/Exit festhalten; keine Save-Schreibschleife pro Frame. Pause→Zum Start, geordnetes Schließen und Levelanschluss sichern an diesen definierten Punkten. Savefehler muss kurz sichtbar bleiben; eine in-memory Lösung wird nicht als erfolgreich dauerhaft gespeichert ausgegeben.

Savevalidierung im Referenzmodus prüft Klasse, Scenario Id, Layout Revision, gültigen LI4-Zustand, endliche Position/View und erlaubte Fortschrittszone. Die heutige starre X-Untergrenze−1900 würde den neuen Start−2800 zurücksetzen und muss hier durch layoutbezogene Grenzen ersetzt werden. Erlaubtes Startband X−3000 bis1750, Y innerhalb sichtbarer erreichbarer Schultern; ungeprüfte Positionswerte werden nicht blind übernommen. Z wird mit realem Bodenhit und Capsulefreiheit abgeglichen. Ungültige Position führt zur letzten gültigen sicheren Zone oder W0, **ohne valide Lernflags zu verlieren**.

`introMask==5` bei noch ungelöstem gültigem alten Zustand darf weiterhin den bestehenden Auto-Check auslösen. Vollständiger korrekter Path wird ebenfalls normal ausgewertet. Defekte/gefälschte Kombinationen oder ein Positionseintrag hinter ungelöstem Tor werden nicht als gelöste Aufgabe akzeptiert. Ein Referenzsave wird nie in den Produktionsslot importiert. Layoutwechsel mit gleicher LI4-Version braucht separate Layout Revision-Prüfung; LI4 allein ist keine räumliche Kompatibilitätsgarantie.

Während Resume werden Gateangles aus gültigen gelösten Flags in einen stabilen eindeutig geöffneten Zustand gebracht oder kontrolliert zu Ende animiert; nie Kamera in einen halbgeschlossenen Collider setzen. Pointerzustand, `PendingStroke`, Contact und gehaltene Bewegung werden verworfen. Preferences bleiben pro Referenzversuch getrennt und behalten Bounds25–300%, FOV75/85. Neustart löscht diese Bedienpräferenzen nicht.

### 8.3 Tatsächlich weiter in die bestehende Szene

Nur ein sichtbarer „Weiter“-Text ohne erreichbare Zielszene wäre ein unvollständiger Referenzabschnitt. Vorgeschlagen ist ein ausdrücklich isolierter Anschluss in die vorhandene Karte `/Game/Maps/Lerninsel`, mit **`LerninselLevel1HandoffV1`** statt normalem `LerninselV1`. Der neue Abschnitt exportiert nur seine tatsächlich erarbeiteten gültigen Intro-/Verbflags in ein LI4-Snapshot mit ansonsten ungelösten späteren Aufgaben. Spawn im bestehenden Satzgarten-Vorplatz ungefähr(1540,0,88), Blick vorwärts; auf der Zielkarte nach Boden-/Capsuleprüfung präzisieren.

### 8.4 Eindeutiger Modusvertrag vor jedem Load

Der bisherige Source erfüllt diesen Vertrag noch nicht. Geplant ist `enum class EIslandSessionProfile : uint8 { Normal, LevelOneReference, LevelOneContinuation }` als scoper Game Modezustand. `AIslandGameMode` konstruiert standardmäßig Normal; `AIslandLevelOneGameMode` setzt im Konstruktor Reference, `AIslandLevelOneContinuationGameMode` setzt Continuation. Der Referenzmapoverride bindet die Referenceklasse auch ohne CLI-Flag. Die neue Continuationklasse liegt in denselben Level One Game Mode-Dateien; keine Änderung an der gespeicherten normalen Zielkarte nötig.

| Profil | Fortschrittsslot | Preferences-Slot | Start-/Loadvertrag |
|---|---|---|---|
| Normal | `LerninselV1` | `LerninselPreferencesV1` | Vorhandener Ablauf unverändert |
| Reference | `LerninselLevel1ReferenceV1` | `LerninselLevel1PreferencesV1` | `UIslandLevelOneSave` mit Scenario/Layout validieren; fehlender Save bietet Start, keine fremde Importierung |
| Continuation | `LerninselLevel1HandoffV1` | `LerninselLevel1HandoffPreferencesV1` | Eigene LI4-Anschlusssession laden/speichern; kein Fallback auf Normal |

`SessionSaveSlot() const` und `SessionPreferencesSlot() const` sind geplante Game Mode-Abfragen. Die Profil-/Slotauflösung geschieht bereits in GameModekonstruktion/Initialisierung vor `BeginPlay` und wird nicht erst nach `Load` umgestellt. Controller-Begin Play fragt das vorhandene Game Modeprofil ab und setzt seinen `PreferencesSlot` **vor `LoadPreferences`**. Sein `SavePreferences` verwendet weiterhin denselben ausgewählten Slot. Referenz-, Continuation- und Normal-Save/Load-Aufrufe werden im gemeinsamen Worldpfad ausdrücklich nach Profil geroutet; vorhandene nichtvirtuelle Funktionen bekommen hierfür klar abgegrenzte Zweige, kein nur vermeintliches Override.

`OpenLevelOneContinuation()` öffnet die vorhandene Zielkarte mit der expliziten geplanten Traveloption `game=/Script/Lerninsel.IslandLevelOneContinuationGameMode`. Dies ist ein später zu prüfender UE-Travelvertrag, noch kein ausgeführter Open Level-Aufruf. Die Zielsession behält Continuation bis zum ausdrücklichen neuen Karten-/Starterwechsel. Nur so bleibt auch eine danach tatsächlich ausgeführte Satzgartenaktion, Preferenceänderung und Save/Resume im eigenen Scope. Normalstarter oder direkter normaler Zielkartenstart ohne diese Game Modewahl bleibt Normal und liest nicht den Testhandoff.

Bei explizitem Continuationstart ohne lesbaren gültigen eigenen Handoff wird **kein** Fortschritt erfunden und niemals Normal geladen. Der Ablauf zeigt kurz „Der Abschnitt konnte nicht fortgesetzt werden.“ und bietet Rückkehr zur Referenzstartszene; der vorhandene normale Save bleibt bytegleich. Beim ersten gültigen Handoff stammt LI4 aus echten bisherigen Lernaktionen. Wiederholtes Weiter nach bereits angelegter gültiger Anschlusssession soll diese wiederaufnehmen, nicht bereits dort gespeicherte spätere Aktionen durch frühe Flags ersetzen. Zugehörigkeit zum aktuellen Referenzversuch wird als lokale Attempt Id im Referenz-/Handoffobjekt validiert; Neustart erzeugt eine neue ID, nicht heimlich die Wiederaufnahme eines fremden alten Versuchs. Bei Änderung dieser Metadaten ist die Layout-/Sessionvalidierung im selben Meilenstein zu pinnen. Attempt Id ist eine lokale synthetische Versuchskennung, keine Schüleridentität.

Die alte Character-Tick-Abkürzung Z<−150 wird in nichtnormalen Profilen ausdrücklich an den jeweiligen protokollierten Safe Posevertrag geroutet, bevor sie eine Fehlposition verbergen kann. Reference nutzt das neue Profil, Continuation den sicheren Boden der bestehenden Zielkarte; valide Lernflags bleiben, Bewegung/Pointer werden neutralisiert, Recoverygrund/Pose werden vor Reset aufgezeichnet. Der normale Kontrollfall wird nicht ungefragt global umgebaut. Resume im S-Profil setzt einen bestehenden Wortmittenbesuch zunächst auf konsumiert/gesperrt; neues Arming erst nach tatsächlichem Verlassen. Ein verworfenes transient Contact darf keine neue Antwort auslösen.

Der Anschlussmode wählt seinen Slot **vor** einem Load. Er liest kein fremdes normales Save, schreibt nie hinein und setzt keine Debug-Fertigflags. Die normalen Lernaktionen des zuvor gespielten Abschnitts liefern den Zustand; ein neuer Fixture-Set Flags-Aufruf zählt nicht als Playtest. Dieser Anschluss ist eine begrenzte zukünftige Integration, kein Auftrag zur neuen Satz-/Wasserproduktion. Falls diese sichere Brücke bis M6 nicht belegt ist, lautet der Kandidat „Referenzabschnitt ohne geprüften Anschluss“ und besteht C02 nicht.

## 9. Daten-, Asset- und Quellplan

### 9.1 Ein Schreiber, klare erlaubte Flächen

Geplante Umsetzungsflächen nach Freigabe:

- `Source/Lerninsel/IslandWorld.h/.cpp`: bestehende Character-/Controller-/GameModefunktionen, scoped Referenzzweige, Input-/Save-/Recoveryverbindung. Keine Umbauten an späteren Rätselalgorithmen.
- `Source/Lerninsel/IslandArt.cpp`: `BuildWorld()` erhält Referenzbranch; neue `BuildLevelOneWorld()`-Definition bleibt hier, damit die bestehenden privaten `Shape/Label/Gate`-Hilfen verwendet werden können. Normaler vollständiger Build World-Pfad bleibt Kontrollfall. Kein unbeabsichtigtes Duplizieren dieser privaten Helpers in fremden Übersetzungseinheiten.
- Geplant neu `Core/IslandLevelOneLayout.h`: ausschließlich Layout-/Spawn-/Zonekonstanten und prüfbare Profilregeln; keine Engine- oder ET-Abhängigkeit.
- Geplant neu `IslandLevelOneGameMode.h/.cpp`: Reference-/Continuation-GameModeklassen und Saveobjekte, schmaler abgeleiteter `AIslandLevelOneGameMode`, Referenzmodus und `UIslandLevelOneSave`; Mapoverride schützt vor versehentlichem Editor-PIE mit Produktionssave. Gemeinsame Kernlogik weiter aus AIsland Game Mode.
- `IslandHUD.cpp`, `IslandFocusWidget.h/.cpp`: scoped kurze Zielzeilen, kompakte Menüs, Focus-/Copy-/Sliderverwendung.
- `Content/Tasks/tasks.json`: nur Lernaufgaben 100/200 (Weltterminals 10/20 sind andere IDs) und passende UI-Copy, IDs/Voraussetzungen gleich; `Core/IslandTasks.generated.h` nur über vorhandenen Generator. Keine manuelle Änderung generierter Daten.
- Geplant `Content/Maps/Lerninsel_Level1Ref.umap`, `Content/Art/Level1Reference/`, `Content/Materials/Level1Reference/`, `Tools/create_level_one_reference.py`, separater Starter. Kein Überschreiben `Lerninsel.umap` oder `Lerninsel_Weltvorschau.umap`.
- Gezielt vorhandene Tests `rules_test.cpp`, `IslandAutomation.cpp`, `IslandControlsAutomation.cpp`; geplant `Tests/level_one_profile_test.cpp`, `IslandLevelOneAutomation.cpp`, Run-/Validatorregistrierung. Alte Suiten weiter als Kontrollfälle, neue Reportnamen vollständig/fresh.

Diese Liste ist ein zukünftiger Dateivertrag, keine heutige Änderung. Andere Runtime-Dateien, `games/shared/Plugins/GameET`, Web-/Firebase-/Functions-/Rules-/Signaturdateien und gemeinsame main-Regelfiles sind ausgeschlossen. Ein weiterer Art-/Gameplaywriter muss seine Dateirechte erst übernehmen; zwei Chats bearbeiten nicht gleichzeitig denselben IslandArt-/HUD-/Mapstand.

### 9.2 Vorgeschlagene Schnittstellen (noch nicht implementiert)

| Schnittstelle | Verantwortliche Datei / Zweck |
|---|---|
| `bool AIslandGameMode::IsLevelOneReferenceMode() const` | Modeabfrage; abgeleiteter Game Mode setzt Referenzprofil vor BeginPlay/Load |
| `void AIslandGameMode::BuildLevelOneWorld()` | In IslandArt.cpp; erster Abschnitt/Targets/Gates, keine späteren Pflichtaufgaben |
| `int AIslandController::PickLevelOneTarget(const FVector& Origin, const FVector& Direction) const` | Erster sichtbarer registrierter Querytreffer; gleiche Eingabe für E/Klick |
| `void AIslandController::ActivateLevelOneTarget(int TargetId)` | Ein Pressintent, aktuelle State-/Focus-/Reachable-Prüfung; scoped Deduplizierung |
| `bool AIslandGameMode::SaveLevelOneAttempt()` / `bool LoadLevelOneAttempt()` | Separates Saveobjekt/Slot/Layoutvalidierung, Ergebnis ehrlich melden |
| `void AIslandGameMode::ResetLevelOneAttempt()` | Nur Referenzfortschritt neu, Preferences/normaler Save erhalten |
| `bool AIslandGameMode::ResolveLevelOneSafePose(const FVector& Requested, FVector& SafePosition) const` | Boden-/Capsule-/Zoneprüfung für Resume/Recovery |
| `FString AIslandGameMode::SessionSaveSlot() const` / `SessionPreferencesSlot() const` | Profilabhängige Slots vor jedem Save/Load und Controller-`LoadPreferences` |
| `bool AIslandGameMode::OpenLevelOneContinuation()` | Gültige gelernte Flags in separaten Handoffslot, bestehende Zielkarte öffnen |

Konkrete Component→Target-Bindung wird als laufzeitlokale Tabelle geführt, nicht im Save serialisiert. Menuzustand wird als klarer Referenz-UI-Zustand Start/Playing/Paused/Settings/RestartConfirm/Completed geführt, nicht durch erfundene Lernflags. Gemeinsame `Island::State` bleibt fachlicher Fortschritt. Die Task-Interfaces und Assertions stehen im [Meilensteinplan](meilensteine.md).

### 9.3 Grade Crew, ET und faire lokale Bedienung

Das lokale Referenzprofil ist kein serverseitig bewerteter Leistungsnachweis. Es sendet keine Antworten, Kinderbilder, Sprachaufnahme oder Debuglogs automatisch an eine Zentrale. Kein neuer Providerkey, Tracking oder privater Backendzugriff. Vor späterem Assessmentadapter müssen die tatsächlichen Aufgaben-/Attempt-/Freigabeverträge gelesen und gesondert beauftragt werden.

Die ET-Quelle zeigt einen Shared-Unreal-Composer und Pizza-Teilbelege, aber Lerninsel@a5dc hat weder Pluginregistrierung noch Runtimebeleg. Der aktuelle Prüfer-Mausadapter ist dort ebenfalls eine noch nicht qualifizierte Spezifikation. Daher enthält dieses erste Menü **keinen fingierten „An Zentrale gesendet“-Status**. Späteres ET wird ausschließlich durch vorhandenen Owner eingefügt, mit exakt gebundenem Build, manueller Versandentscheidung, begrenztem Inhalt und echtem Receipt; diese Planung baut kein paralleles Framework. Planfeedback wird als Dokument im autorisierten Arbeitskontext gespeichert.

Aus Assurance ausgewählt: SEC01/03 (keine Credentials/Backendänderung; Trigger neuer Adapter), SEC14 als Reaktivierungsgrenze für einen späteren Aufgaben-/Attempt-/ET-Payloadadapter (serverseitige Typ-/Werte-/Zustandsvalidierung; die lokale LI4-Prüfung erfüllt diese Kontrolle nicht), SEC16/20 (späterer Assetimport/Abhängigkeiten), PRIV09 (faire Rücknahme/keine Strafe), PRIV12 (keine Qualitäts-/Lernwirksamkeitsgarantie), PRIV13–15 (wesentliche 3D-Information/Lesbarkeit/Tastatur), PRIV19 (Asset-/Font-/Audiorechte). Status der zukünftigen Runtimekontrollen **nicht geprüft**; heute nur Planabdeckung. SEC18 Hosting, Consent-/Mail-/Preisflächen sind im lokalen Plan nicht relevant und werden bei Web-/Datenflussauftrag reaktiviert. Keine universelle Rechtsfreigabe oder Vollprüfung aller 40 Kontrollen. SEC14 ist ohne serverseitigen Adapter im aktuellen lokalen Plan nicht relevant; bei entsprechender Anbindung erneut prüfen. Lokale Saves/Debugbelege bleiben dennoch frei von persönlichen Testinhalten.

## 10. Vorgehen und Abnahmegates

Der detaillierte [Meilensteinplan](meilensteine.md) ist chronologisch und enthält kleine prüfbare Ausgaben. Die [Prüfmatrix](pruefmatrix.md) enthält konkrete spätere Belege und PASS/FAIL-Regeln. Vor jeder externen Ausführung: aktueller Stand, Scope, eigener Save, geplante Aktion sichern; danach Run-/Prozess-/Report-ID festhalten. Kein wiederholter Engine-/Providerstart bei unklarem Ergebnis.

Die Reihenfolge lautet: belegte unveränderte Basis → ein kurzer vergleichbarer Gestaltungskandidat → begehbares Terrain → Input-/Lernflächen → kurze HUD-/Menüführung → Save/Resume/Anschluss → normaler ununterbrochener Lauf → zwei unabhängige Prüfer → begrenzte bestätigte Korrekturen → gebundener lokaler Kandidat zur Nutzerabnahme. Art und Bedienung werden früh gemeinsam gesehen; erst nach Referenzabnahme weitere Gebiete produzieren.

Heute gibt es ausschließlich den vorgeschalteten **Planreview**. Tester A prüft technische Machbarkeit, Eingaben, Gelände/Savevertrag; Tester B prüft Optik, Handhabung und Verständlichkeit unter einer lernschwachen-Kinder-Perspektive. B ist kein tatsächlich getestetes Kind. Beide sehen dieselben Rohquellen/Bilder und denselben eingefrorenen Dokumentcommit, aber zunächst nicht den Bericht des anderen. Danach prüfen sie die Befunde gegenseitig; der Dokumentationsowner löst begründete Konflikte in einer gezielten Planrevision. Keine Endlosschleife von Geschmacksvarianten und kein Mehrheitsentscheid gegen einen belegten Blocker.

Später in der Runtime erhalten A und B exakt denselben unveränderten Build/die gleichen Referenzbilder, **je eigenen Save/Testslot** und nacheinander exklusive OS-/Editor-Timeslots. Normale Inputs dürfen nur über tatsächlich qualifizierte native/OS-Events erfolgen; die vorhandene Fixture-Automation oder ungeprüfte HTTP-Inputidee zählt nicht als autonomer Spieler. Fehlt die Input-/Fenster-/Sessionbindung, bleibt der betreffende Test NICHTGEPRÜFT. Ein wahrer Empfangs-/Bildbeleg aus Pizza ist kein Lerninsel-PASS.

## 11. Materielle Risiken und offene Freigabeentscheidungen

1. **Hügel und Save-Geografie:** alte Range−1900/planer Boden sind nicht kompatibel mit neuem Start. M2/M5 müssen das zusammen ändern; ohne echten Lauf keine Geländeabnahme.
2. **Inputvereinheitlichung und Fußdwell:** vorgeschlagener bewusster Klick/E-Modus ist eine echte Designänderung. Martin muss ihn mit dem Plan bestätigen; alte positive Dwell-Erfahrung nicht als stillschweigend verworfen behandeln.
3. **Lesbare Weltwörter:** Stirnflächen verbessern den Winkel, können aber neue Collider-/Sichtblockaden schaffen. Die native Referenz entscheidet anhand gleicher Posen plus normalem Anmarsch; keine reine Textgröße-Abnahme.
4. **Artqualität und Rechte:** vorhandene Modelle sind nicht automatisch ausreichend oder freigegeben. Erst repräsentatives Objekt, Material/Licht und Quellenregister; keine neue Bildmenge als Ersatz.
5. **Menü/Focus:** neue Start-/Resumezustände brauchen echte Tastatur-/Mausprüfung. Adapterbegrenzungen offen lassen; keine angenommenen Klickbelege aus Tools ohne sichtbare Wirkung.
6. **Anschluss:** getrennte Slots und erlaubte gültige Flags müssen auch bei Abbruch/Retry ohne Produktionswrite funktionieren. Fehlender Anschluss wird ehrlich als unvollständiger Referenzschnitt gemeldet.
7. **Performance:** Ziele im Briefing sind zu messen. Keine Garantie für iPad/Web/1.000 Nutzer aus Mac-/Editorwerten.
8. **Lernwirkung:** beobachtete Aufgabenlösung und qualitative Erklärung getrennt von dauerhaftem Lernerfolg. Keine erfundene Kinderabnahme oder Aufgabenstatistik.

Martins zu prüfende Entscheidungen sind konkret: dieser Abschnitt und separate Referenzszene; ein freizugebendes Auswahlprofil D oder S mit vollständig geplanter bewusster Schrittoption; warme sonnige Art Direction und lesbare Schriftflächen; eigenes Resume-/Neustart-/Handoffprofil; spätere separate ET-/Web-/iPadarbeit. Das sind keine heutigen Fragen mitten im Entwurf: alle Unterlagen werden zuerst vollständig und unabhängig geprüft vorgelegt. **Umsetzung beginnt erst nach ausdrücklicher Freigabe des fertigen Plans.**
