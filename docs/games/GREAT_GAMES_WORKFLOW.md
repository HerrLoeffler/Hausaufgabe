# Great Games: verbindlicher Produktionsworkflow

Stand: 11.10.2026 · bestehende Task GC-GAMES-PIPELINE-01. Diese Repo-Regel gilt für neue und überarbeitete GradeCrew-Spiele. Sie beschreibt den Produktionsweg; sie belegt keine bereits umgesetzte Spielversion oder automatische Durchsetzung in anderen Chats.

## Einstieg und feste Vorgaben

Vor einem Spielauftrag zuerst [das Briefing](GAME_PROJECT_TEMPLATE.md) ausfüllen und bekannte Antworten aus aktuellen Übergaben, Branches und Produktquellen übernehmen. Entscheidungen und Abnahmen unterscheiden zwischen belegtem Iststand, verbindlichem Ziel und noch offener Umsetzung.

Für die derzeit benannten Spiele gilt die ausdrückliche Produktvorgabe: **Kochspiel 2D, Lerninsel 3D.** Diese Vorgabe setzt keine vorhandene Dimension im aktuellen Build voraus. Engine, Laufzeit und Zielgeräte sind zusätzlich je Spiel festzulegen. Andere Spiele wählen ihre Dimension nach Lernziel, Mechanik, Zielplattform und verfügbarer Produktion; Unreal oder eine 3D-Pipeline sind kein allgemeiner Standard.

Die 3D-Asset-Anleitung [img2threejs und Assetqualität](IMG2THREEJS_AND_ASSET_QUALITY.md) gilt bei passenden Arbeiten an 3D-Objekten und Referenzrekonstruktionen. Reine 2D-, UI-, Lernlogik- und Serveraufgaben benötigen diese Rekonstruktion nicht. Blender ist ein Werkzeug für bearbeitbare 3D-Inhalte und ersetzt keine Laufzeitengine.

## Gemeinsamer Produktionskern

Jedes Spielbriefing nennt Zielgruppe, überprüfbares Lernziel, Kernschleife, Dimensionsprofil, Runtime, verbindliche Plattform und Zielgeräte, konkrete Stilreferenz, kleinsten vollständigen Spielabschnitt sowie messbare Abnahmebelege. Annahmen, spätere Ideen und offene Entscheidungen stehen separat.

Ein kleiner echter Referenzabschnitt klärt früh Bildsprache und Funktion. Er umfasst mindestens eine Szene oder ein Level, die zentrale Interaktion, eine Lernaufgabe, natürliches Feedback, Hilfe und den Weg zum Abschluss oder zur Wiederaufnahme. Erst nach seiner fachlichen und visuellen Prüfung wird die weitere Welt ausgearbeitet.

Die Art Direction übersetzt Referenzen in eigene Produktionsregeln: Quelle und Nutzungsrecht, Palette mit klaren Rollen, Formen und Silhouetten, Typografie, Perspektive, Licht oder Flächenkontrast, Materialien wo relevant, Bewegungscharakter und konkrete Beispiele dessen, was übernommen oder vermieden wird. Fremde Spielgrafik bleibt Inspiration, bis Nutzungsrechte für das konkrete Asset belegt sind.

UI folgt den vorhandenen GradeCrew-Komponenten, Tokens und Konventionen der gewählten Plattform. Gemeinsame Bedeutung und Feedback dürfen geteilt werden; Web-, Touch- und native Engine-Oberflächen erhalten passende Steuerelemente und Layouts. Spieltext bleibt lesbar, HUD und Lerntext überdecken einander nicht, interaktive Bereiche sind gut treffbar, Fokus und Tastaturbedienung funktionieren, und Status wird zusätzlich zu Farbe verständlich gezeigt. Richtig, falsch, Hilfe, Fortschritt und Fehler melden sich zeitnah und in natürlicher Sprache.

GradeCrew-Aufgaben, Freigaben, Bewertung, Speicherung und Feedbackkanäle verwenden die bestehenden Produktverträge und Sicherheitsgrenzen. Ein neuer Spieladapter wird vor dem Bau gegen die tatsächlichen aktuellen Schnittstellen geprüft. Für Feedback werden vorhandene Eingabe- und Routingverträge wiederverwendet; ein Guide oder ein Branch führt keinen automatischen KI-Aufruf oder eine neue Datenbank ein.

Assets erhalten eine nachvollziehbare Herkunft, Urheber- und Lizenzangabe, bearbeitbare Quelle und Export-/Importweg. Zuerst wird ein repräsentatives Objekt oder eine Referenzansicht geprüft, bevor große Assetmengen entstehen. Messbare Grenzen für Startzeit, Speicher, Paketgröße und Bildrate werden pro benanntem Zielgerät festgelegt und am tatsächlichen Build gemessen. Keine frei erfundenen FPS-, MB- oder Gerätewerte als Qualitätsnachweis verwenden.

## Profil 2D

Für das **2D-Kochspiel** und andere 2D-Briefings gelten gleichwertige Anforderungen an Stil, Lernwirkung und Laufzeitnachweis. Das Profil beschreibt unter anderem:

- eigene Figuren, Gegenstände, Illustrationen oder Sprites mit nachvollziehbarer Quelle und transparentem Hintergrund, falls gebraucht;
- Lesbarkeit bei tatsächlicher Skalierung und auf dem kleinsten Zielbildschirm;
- klare Szenenebenen und Reihenfolge von Vordergrund, Spielobjekten, Hinweisen und HUD;
- verständliche Kollisions- und Trefferflächen statt nur sichtbarer Pixelkonturen;
- Timing, Lesbarkeit und Zustandswechsel der 2D-Animationen einschließlich Reduced Motion, wenn Bewegung nicht nötig ist.

Eine 2D-Aufgabe verlangt weder 3D-Meshes noch Rigs. Abnahme prüft die reale Spielszene mit Steuerung, Trefferflächen, UI und Rückmeldung auf den vereinbarten Zielgeräten.

## Profil 3D

Für die **3D-Lerninsel** und andere 3D-Briefings gilt dieselbe Abnahmehöhe mit den tatsächlich benötigten 3D-Nachweisen. Das Profil wählt:

- erkennbare Silhouette und Proportionen aus der aktiven Spielkamera; Anatomie und Rig nur, wenn Figuren oder Bewegung sie erfordern;
- Materialien, Licht, Schatten und Kamera, die Lernobjekte, Wege und Interaktionen klar lesbar halten;
- nötige Animationen, Zustandswechsel und Barrierefreiheitsoptionen ohne unnötige Dauerbewegung;
- begehbare Flächen, Kollisionsgrenzen, Steigungen und Höhe anhand echter Laufwege im Zielbuild;
- LOD- und Größenbudgets nur dort, wo Zielgerät und Messung sie begründen.

Blender-Vorschau oder gerenderter Einzelshot beweisen keine Engine-Laufzeit. Wenn Blender-Assets in Unreal gehen, wird der festgelegte Export im echten Unreal-Projekt importiert und im Runtime-Build geprüft. Abnahme bewegt die Figur tatsächlich über repräsentative Böden und Steigungen; Teleportieren oder ein Standbild beweist weder Kollision noch begehbare Geometrie. Der konkrete Engine- und Plattformweg steht im Briefing.

## Skills und Methoden gezielt wählen

Vor einem Arbeitsschritt den aktuellen Skill-Katalog prüfen und nur den Skill verwenden, dessen Auslöser zur konkreten Arbeit passt. frontend-design unterstützt Web-UI- und visuelle Gestaltungsentscheidungen. img2threejs passt nur zu seiner beschriebenen bildgestützten, codebasierten 3D-Rekonstruktion; es ist keine Pflichtpipeline für 2D oder Unreal. gradecrew-prototype hilft bei einer offenen Interaktions-, Layout-, Zustands- oder Enginefrage; gradecrew-review-retro bei einem beauftragten Review oder Rückblick; gradecrew-wayfinding bei mehreren offenen, abhängigen Entscheidungen. Jede tatsächliche Skillnutzung und ihr Ergebnis werden in der Übergabe belegt. Ein Repo-Link installiert oder aktiviert keinen Skill und macht nicht alle Skills für jeden neuen Prompt verpflichtend.

## Nachweis und Zuständigkeit

Vor größerer Produktion werden mindestens zwei passende Engine-/Runtime-Optionen anhand derselben Anforderungen verglichen; eine begründete Auswahl berücksichtigt Lernschleife, Zielgeräte, Bedienung, Assetaufwand, Teamfähigkeit und nachgewiesene Laufzeit. Browserunterstützung oder ein erfolgreicher Editorstart ersetzen keinen Test auf dem Zielgerät.

Der kleinste Referenzabschnitt wird im echten vorgesehenen Runtime-Build geprüft. Vorschau, Editorbild, CI und Geräteabnahme sind getrennte Belege. Der Prüfnachweis nennt Commit, Build, Gerät/Runtime, ausgeführte Abläufe und offene Grenzen. Tests sind auf die geänderte Verhaltensfläche zugeschnitten; bestehende Lern- und Eingabeverträge bleiben erhalten.

Ein Spielhauptchat führt Briefing, Aufgabenübergabe und Spielabnahmen. Die Games-Zentrale koordiniert übergreifende Abhängigkeiten; die GradeCrew-Zentrale koordiniert Repositoryintegration. Facharbeit bleibt in den zugewiesenen Spiel- und Fachchats. Pro gemeinsamem Editor oder kollisionsanfälligem Dateibereich gibt es einen klaren Schreiber. Branches, offene PRs und laufende Jobs sind vor Übernahme zu prüfen; vorhandene Task-IDs, Budgets und Versuchshistorie bleiben erhalten.

Diese Anleitung ist verbindliche Repository-Dokumentation für Chats, die sie gelesen haben. Sie ist keine technische Laufzeitsperre, kein automatischer Chat-Hook und kein Nachweis, dass alle neuen Chats sie erhalten oder Skills ausführen. Das jeweilige Briefing und die tatsächlichen Branch-, CI-, Runtime- und Gerätebelege bestimmen den Projektstand.
