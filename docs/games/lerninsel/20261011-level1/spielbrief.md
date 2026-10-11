# Spielbrief — Lerninsel, erster vollständiger Referenzabschnitt

Stand 11.10.2026. Task **GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011**. Spiel **Lerninsel**. Parent **GC-GAMES-ESCAPE-VISUAL-01**; abgeschlossene Bestandssicherung **GC-GAMES-LERNINSEL-L1** bleibt Historie. **Nur Planung, keine Umsetzung; Design-/Umsetzungsfreigabe offen.**

## Auftrag, Zuständigkeit und Quelle

Martin verlangt zunächst einen extrem ausführlichen Plan zur hochwertigen Überarbeitung von Grafik, Handhabung, Bewegung, Klicks und Menü. Der ausführende Dokumentationsowner ist **GC · Lerninsel · Gameplay & Integration**, Chat `01a12568-0502-7831-9451-a7f8d91ce950`. **GC · Lerninsel-Zentrale**, `01a1183f-dad9-7640-8a82-23107c980d6e`, koordiniert und präsentiert den Plan. Zwei unabhängige Prüfer A und B dürfen jetzt nur Plan, Code und vorhandene Bilder lesen. Sie prüfen keine laufende Runtime und ersetzen keine Kinderabnahme.

Unveränderliche Spielbasis: **PR175@a5dc474295dea4abda06c5be8923de1bc0206248**, am 11.10.2026 frisch bestätigt, offen/draft, `branch_only`. Eigener exklusiver Checkout `work/lerninsel-l1`; isolierter Dokumentationsbranch `docs/lerninsel-level1-plan-20261011`, direkt von dieser Remote-Basis. Der ursprüngliche Quellcheckout unter `.codex/.chatgpt-projects/.../gradecrew-lerninsel-unreal` bleibt unangetastet. Main-Regeln wurden zusätzlich frisch gelesen; der alte Spielbranch enthält nicht sämtliche neuen Regeldokumente.

## Zielgruppe und Lernziel

Primäre Zielgruppe: Klasse 5–6, einschließlich Kindern mit geringer Lesesicherheit und langsamem Arbeitstempo. Es wird kein konkretes Alter für einen anderen allgemeinen Prüferpiloten erfunden. Vorwissen: einfache Sätze lesen; Verben als Wörter für eine Handlung kennen oder mit Hilfe entdecken. Unbekannt sind individuelle Förderbedarfe, konkrete Schulgeräte und eine spätere schulische Leistungsbewertung.

**Überprüfbares fachliches Ziel:** Das Kind erkennt `laufen` und `singen` in ihren Satzkontexten als Verben und wählt danach in drei geordneten Reihen `singt`, `sucht`, `öffnet`. Es kann eine unpassende Auswahl zurücknehmen und erklären, dass diese Wörter sagen, was jemand tut. Das Tor öffnet als räumliche Folge der richtigen Auswahl. Ein erfolgreicher Durchlauf belegt diese Aufgabenlösung; er beweist weder allgemeinen Lernerfolg noch Transfer auf unbekannte Verben. Eine kurze freiwillige mündliche Erklärung im späteren betreuten Test ist qualitative Zusatzbeobachtung, keine Note.

## Kernschleife und vollständiger Abschnitt

Erkunden → sichtbare Route erkennen → nahe Wortplatte bewusst ansehen und mit E oder Linksklick auswählen → unmittelbare erkennbare Rückmeldung → bei Bedarf zurücknehmen/Hilfe nutzen → automatische richtige Auswertung → nachvollziehbare Leitung und Torbewegung → selbst durch den Ausgang gehen.

D (direkt) und S (bewusstes Schrittzentrum) sind im [Variantenblatt](auswahlvarianten.md) vollständig beschrieben. Das ursprüngliche Gehen über Bodenwörter wird erhalten und geprüft, nicht pauschal verworfen. Vor Umsetzung entscheidet die Nutzerfreigabe ein Profil; kein zusätzliches Kindermenü.

Der Abschnitt umfasst **Ankunft → sanften begehbaren Hügel → kleine Verbprobe → Verbengarten mit drei Reihen → Ausgangstor → sichtbaren Abschluss und Anschluss an die bestehende Satzgartenszene**. Diese Festlegung bildet einen vollständigen Referenzabschnitt mit Navigation, zentraler Lerninteraktion, Fehlerkorrektur, Hilfe, Menü, Speicherung und Abschluss. Sie bewahrt die früher positiv bewerteten ersten Interaktionen. Sie ist kein zusätzlicher Level neben der Verbprobe, sondern deren verständlicher, schönerer räumlicher Rahmen.

Ausgeschlossen: neue verpflichtende Lerngebiete, Bonuszwang, Wasser-/Eimeraufgabe im ersten Abschnitt, Fuchs-Rigproduktion, Level 2–8, Vollinselimport, Multiplayer, neue KI, Backend/Notenadapter, Datenbank und ET-Neuentwicklung. Der spätere **gleiche 1-Liter-Becher, Zehntelskala und 3/10 = 300 ml** bleibt verbindlich, wird aber hier nicht hineingepresst. Schwierigere Zusatzaufgaben bleiben spätere optionale Angebote.

## Dimension, Runtime, Auswahl und Geräte

**Verbindlich 3D, Ego-Perspektive**, entsprechend Martins Vorgabe und GREAT_GAMES_WORKFLOW. Unmittelbares Entwicklungs-/Abnahmeziel ist **UE5.8.3 auf dem vorhandenen Mac**, Tastatur/Maus, Landschaftsfenster. Historischer Host: Mac M5 Pro, 48 GB; vor späteren Messungen Hardware/OS tatsächlich erneut protokollieren. Offlinebedarf wird für diesen lokalen Referenzabschnitt auf lokale Spielregeln und Saves begrenzt; es wird keine vollständige Offlinefähigkeit eines späteren Schulprodukts behauptet.

| Runtime-Option | Passung zu diesem Abschnitt | Grenze und Entscheidung |
|---|---|---|
| Bestehende UE5.8.3-Mac-Runtime | C++-Regeln, UMG/Slate, Ego-Figur, Material-/Torablauf und lokale Saves vorhanden; geringster Umbau | **Für den Referenzabschnitt gewählt.** Kein Browserexport-/iPadnachweis daraus. |
| Browserlokale 3D-Runtime, etwa vorhandener Three.js-/Babylon-Ansatz als späterer Kandidat | Könnte später Assetladen statt Video-Streaming ermöglichen | Portierung von Runtime, UI, Saves und Aufgaben nötig; keine vorhandene Lerninsel-Browserfassung gelesen. **Keine Einführung in diesem Auftrag.** |

Der Vergleich ist eine Planentscheidung anhand vorhandener Quellen, kein Benchmark. i Pad, Smartphone und Browser bleiben Zielwünsche für eine spätere gesonderte Laufzeitentscheidung. Kein Enginewechsel ohne Folgeauftrag. Keine Aussage zu 1.000 Spielern, Streamingkosten oder konkreter Sitzungsdichte.

## Stilreferenzen und Rechte

Primäre Stilquelle sind Martins sechs Inselbilder aus dem bisherigen Lerninsel-Chat: warmes Herbstlaub, klare helle Steinarchitektur, unterschiedliche Naturmassen, Küsten-/Höhenverlauf, lesbare Heckenräume und echte Augenhöhe. Die vorhandene Beschreibung in `docs/games/lerninsel/20261007/spielbuch.md`, Abschnitt „Art Bible“, dokumentiert diese Rollen. Die Originalanhänge werden heute nicht als neu vollständig geprüft ausgegeben; ein unabhängiger, wiederauflösbarer Datei-/Rechtenachweis für jeden Anhang fehlt.

Gelesene ergänzende Konzepte: `layout-a.png` und `layout-b.png` aus 20261007. Diese sind **generierte Stiltafeln, keine originalen Spielscreenshots, lizenzierten Fremdassets oder Runtimebelege**. Lesend betrachtete Baseline: `Reports/L1/WorldPreview-00.png` und `-02.png`. Fuchsvorlagen bleiben Stil-/Anatomiequellen für spätere Fuchsarbeit; das aktuell importierte Sitzmesh ist kein fertiger laufender Vierbeiner und wird im ersten Abschnitt nicht als solcher inszeniert.

Eigenständige, bearbeitbare Assets mit konkreter Herkunft werden verlangt. Vorhandene lokale Blender-Assets sind Kandidaten; „lokal vorhanden“ ersetzt keine Lizenzprüfung. Assets erhalten Datei, Autor/Quelle, Lizenzversion, erlaubte Nutzung/Attribution, Änderungen und Export-/Importweg. Keine Übernahme von The-Witness-Assets oder geschützten Logo-/Terminaldetails. Wasser dient hier höchstens als ferne Kulisse hinter fester Randbegrenzung; ein erreichbarer Hügel braucht tatsächliche Geometrie und Kollision.

## Gestaltung und Bedienung

Sonniger, klarer Himmel; warmer Kalk-/Sandstein; Herbstgold als Begrüßung, ruhiges Grün als Rahmen. Blau bleibt die **ganze ausgewählte Wortplatte ohne Häkchen**. Der Zustand wird zusätzlich durch kurze Textlegende und deutliche Rand-/Oberflächenform erläutert. Kein dauerndes Blinken, kein negatives Strafsignal und keine Zeitstrafe.

HUD: eine kurze aktuelle Anforderung plus diskreter Fortschritt. Satzkontext erscheint erst beim erreichbaren anvisierten Wort; Hilfe ist freiwillig über H oder eine klar beschriftete Stelle. Weltwörter werden aus tatsächlicher Augenhöhe und Entfernung gelesen, statt einfach horizontal auf den Boden geschrieben. Menüs enthalten wenige große, tastaturfähige Elemente und lassen das Spiel pausiert. Neustart betrifft ausschließlich den Referenzversuch; normaler Lerninsel-Fortschritt bleibt unangetastet.

## Wiederverwendete Verträge und tatsächliche Verfügbarkeit

Vorhanden: `Island::State`, `IntroToggle/IntroCheck`, `PathStart/PathStep/PathUndo/PathCheck`, LI4 mit LI1–LI3-Lesepfad, Lernaufgaben 100/200; Weltterminals 10/20 getrennt, `AIslandController` und `UIslandFocusWidget`, getrennte Save-/Preferences-Slots im Konzept anschlussfähig. Gates werden erst nach voller Animation physisch passierbar. Diese Codeflächen werden im Plan konkret adressiert.

Nicht belegt im Lerninsel-Kandidaten: produktiver Assessment-/Noten-/Attemptadapter, gemeinsame native Feedback-/KI-Brücke oder eingebautes Game ET-Plugin. Gelesene ET-Übergabe zeigt Shared-Plugin/Pizza-Belege; diese übertragen sich nicht auf Lerninsel. ET-Owner bleibt **GC · Games · ET & Live-Integration**. Es gibt hier weder einen konkurrierenden ET-Bau noch einen Menüknopf mit simuliertem Versand. Siehe Plan, Daten- und ET-Grenzen.

## Messziele und Abnahme

Entwurfsziele, noch keine Messwerte: ruhiger 60-FPS-Betrieb am benannten Mac bei 1440×900, 95. Perzentil Framezeit ≤20 ms, 99. Perzentil ≤33 ms; warmer Spielstart ≤10 s, Kaltstart ≤30 s ohne Shadererstkompilierung. Vorläufige zusätzliche Level-Assets ≤100 Mi B, maximaler zusätzlicher Prozessspeicher gegenüber gleichem Basisbuild ≤500 Mi B. Initiale Shaderkompilierung, Editorstart und gepackter Start werden getrennt gemessen. Überschreitungen erzeugen einen Befund; Werte werden nicht still herabgesetzt. iPad-/Webbudgets stehen erst nach Geräte-/Laufzeitwahl an.

Abnahme verlangt einen normalen vollständigen WASD/Maus/E-Durchlauf auf genau demselben gebundenen Build, richtige und falsche Eingaben, Hilfe, Pause, Wiederaufnahme, reale Hügel- und Torkollision sowie lesbare referenzvergleichbare Spielbilder. Keine Teleports, Force Complete oder Set Flags als normaler Playtest. Automationsfixtures werden separat benannt. Für jede Zeile der Prüfmatrix steht zunächst **NICHTGEPRÜFT**; heutiger Planreview ist kein neuer Leveltest.

## Annahmen, offene Entscheidungen und Budget

Vorgeschlagene räumliche Maße, UI-Copy, Referenz-Savemodus und passive-versus-bewusste Auswahl stehen im ausführlichen Plan zur Freigabe. Keine neue Qualitätszahl. Keine kostenpflichtige Generierung, Assetbeschaffung oder Providerprobe im Planauftrag. Bestehende Budget-/Versuchshistorie einschließlich der 26 dokumentierten Bildaufrufe wird nicht zurückgesetzt; heutige direkte Bild-/KI-Providerstarts: null. Die zwei autorisierten Planprüfer sind keine Zusage bestimmter Usage/Preise.

Die Planung ist reviewbar, aber nicht von Martin als Design oder Implementierungsauftrag abgenommen. **Nächster Schritt nach A/B-Planreview: Martin prüft dieses Briefing und den Plan; erst ein Folgeauftrag startet Umsetzung.**
