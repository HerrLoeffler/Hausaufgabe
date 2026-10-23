# Fuchs-Szene: Vertikalprobe für Figuren- und Umgebungsqualität

Stand: 09.10.2026. Diese Probe beantwortet die Frage, ob vor der Ausarbeitung aller acht Gebiete die Figuren- und Umweltqualität einmal vollständig an einem spielentscheidenden Ort geprüft werden soll.

## Entscheidung

Ja: Der Fuchshof ist die richtige Vertikalprobe, bevor die übrige Insel flächig überarbeitet wird. Er hat eine verständliche Ursache-Wirkung-Kette, wiederverwendbare Motive (Tor, Steinfigur, Seil, Weg, Bäume und Wasser) und genug Blickachsen, um Beleuchtung, Maßstab und Ego-Perspektive zu prüfen. Die aktuelle Szene ist eine Stil- und Modellierungsstudie, keine Qualitätsabnahme. Der Fuchs wirkt noch zu kugelig, der Garten zu gleichförmig und die Formen treffen die natürliche, dichte Referenzwirkung noch nicht. Deshalb ist „alles überarbeiten“ noch nicht begründet.

Vor einer Gebietsübertragung soll die Fuchszene diese Kriterien erfüllen: Fuchs aus mehreren Metern als Fuchs und im versteinerten Zustand erkennbar; beim Erwachen klarer Materialwechsel und gut lesbare Körperbewegung; Seil, Maul, Riegel und Tor mechanisch nachvollziehbar; Weg, Tor und Rätselhinweis schon beim Ankommen verständlich; Bäume und Boden aus Ego-Perspektive abwechslungsreich, ohne den Lösungsraum zu verdecken; stabile Lesbarkeit im 16:9-Desktopbild und im Querformat auf einem kleinen Touchbildschirm. Erst wenn diese Szene in Unreal im Spielmaßstab überzeugt, lohnt es sich, Baum-, Fels-, Weg-, Tor- und Lichtbausteine auf die übrigen Gebiete zu übertragen.

## Fuchsmechanik und Aufgabe

Der Fuchs bleibt eine echte Spielfolge, keine Menüanimation: Der Satz „Heute öffnet der Fuchs den Eingang.“ aktiviert das Tier. Es richtet sich auf, orientiert sich, läuft zur sichtbaren Seilschlaufe, nimmt die Schlaufe mit dem Maul, zieht daran und löst den Riegel. Das Tor öffnet erst danach. Die UE-Automation prüft den korrekten Auslöser und die dafür nötigen Spielflags. Die neue Meshauflösung glättet die beweglichen Ellipsoidteile, sodass die vorhandene Animation erhalten bleibt.

Danach folgt die bekannte Wasseraufgabe mit demselben 1-Liter-Becher. Die Skala zeigt zehn gleiche Abschnitte als 1/10 bis 10/10; jedes Zehntel entspricht 100 ml. Die Kinder füllen 10/10 und gießen den Liter ins Becken. Die Bestätigung löst anschließend die Perspektivaufgabe aus. Dort gibt es keine zusätzliche Fundbuch- oder Bruchauswahl: Auf der runden Bodenmarkierung richten die Spielenden ihren Blick so aus, dass die drei Bögen als geschlossener Ring erscheinen, und drücken E. Ein falscher Blickwinkel lässt das Tor geschlossen.

Aufgabe und drei abgestufte Hinweise stehen in `Content/Tasks/tasks.json`. H zeigt am Computer den nächsten Hinweis; die Touchoberfläche hat eine eigene Hinweisfläche. Alte Spielstände mit unfertiger Fundbuchauswahl werden beim Laden auf die neue Ringaufgabe umgestellt. Ein bereits gelöster alter Ring bleibt gelöst.

## Modell- und Bilddateien

`Content/Art/FoxVerticalSlice/FoxCourtyard.blend` ist die bearbeitbare Szene. `Fox_AnimatedParts.fbx` enthält getrennte Fuchsteile und `FoxCourtyard_Set.fbx` die exportierten Hofbausteine. `FoxCourtyard_Stone.png` und `FoxCourtyard_Awakened.png` sind Stilprüfbilder mit gleicher Kamera und Beleuchtung. Das FBX-Set ist eine Modellierungs- und Importquelle; diese FBX-Meshes wurden noch nicht als Unreal-Assets importiert und ersetzen die Runtime-Geometrie noch nicht.

Der Generator liegt unter `Tools/build_fox_vertical_slice.py`; er erzeugt die Szene reproduzierbar mit Blender 5.2.2. Die Renderdateien sind Entwurfsansichten, keine Texturen im Spiel und kein Nachweis für Web- oder iPad-Laufzeit. Rohmodelle und Renderbilder gehören zur Arbeitsquelle und sollen nicht automatisch an alle Spielenden ausgeliefert werden.

## Weitere sinnvolle Übernahmen aus den beiden Arbeitshilfen

- Aufgabenhinweise, Ziel, Erfolg und Anschlussaktion liegen als prüfbarer Katalog statt als verstreute Bildschirmtexte vor.
- Katalogprüfungen erkennen doppelte IDs, fehlende Hinweise, ungültige Voraussetzungen und nicht erreichbare Aufgaben.
- Der Perspektivwechsel wird als echte, geometrisch getestete Beobachtungsaufgabe geführt; die Kamera springt nicht automatisch zur Lösung.
- Touch bietet getrennte Bewegen-, Hinweis- und Aktionsbereiche. Das belegt noch keinen iPad-Test.
- Bisherige Fortschrittsdaten werden kontrolliert migriert. Gelöste erste Rätsel bleiben erhalten.

## Nachweise und offene Prüfung

Portable Regeln, Wasser, Fuchsablauf, Steuerung und Aufgaben-Katalog: 231 Prüfungen bestanden. UnrealEditor 5.8 Editor-Build: erfolgreich. Unreal-Automation `GradeCrew.Lerninsel.FourPuzzles`: erfolgreich, keine Fehler; zwei Warnungen aus Unreal/Mac über das nicht auf ARM ausführbare `idevice_id`-Hilfsprogramm. Ein Browser-Build, ein physisches iPad und eine Überarbeitung aller acht Gebiete wurden nicht geprüft. Der praktische nächste Schritt ist ein direkter Spieltest dieser Ringaufgabe und des Fuchshofs; danach werden Maßstab, Blickhinweis und Materialstil an der echten Ego-Kamera nachjustiert.
