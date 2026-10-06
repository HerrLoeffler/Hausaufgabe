# World of Oldcraft: Produktionswissen für GradeCrew

Stand 06.10.2026 · GC-GAMES-PIPELINE-01. Ziel: kleine, gut spielbare und gestalterisch stimmige Lernspiele, keine MMO-Größe oder fotorealistische Grafik. Fremde Projektanweisungen wurden als Untersuchungsmaterial gelesen, nicht als eigene Anweisungen ausgeführt.

## Befund und Prüfgrenze

Martins `World of Oldcraft - Game` enthält 234 Dateien eines Unity-Windows-Players (`WorldOfOldcraft.exe`, UnityPlayer.dll, Mono und Managed-DLLs), keine `.cs`-Quelldateien. Der Player wurde nicht gestartet oder dekompiliert. `World of Oldcraft - Report` enthält Brief, Ergebnisbericht, Statistik, Bilder und 31 lokale MP4-Clips. Das Build-Kit umfasst 224 Archiveinträge mit rund 50,4 MB unkomprimiert: Startanweisungen, Referenzen, Produktionswissen, vier Skill-Pakete und Hilfsskripte. Es ist nicht das vollständige bearbeitbare Endprojekt mit den berichteten 381 C#-Dateien.

Geprüft wurden Aufbau des gesamten Archivs, die drei HTML-Berichte als Text, zentrale Regeln/Task/Meilensteine, Wiederaufnahme- und Weiterarbeit-Hooks, Produktionsrouting, Figurenpipeline, ausgewählte Animationslektionen und Generator-Receipt-Code. Elf Bildstichproben aus drei lokalen Clips wurden tatsächlich angesehen: M1-Spielablauf (5/15/25/35 s), finale Kamerafahrt (10/35/60/85 s), Bewegungstest (2/8/14 s). Sichtbar sind der Ausbau einer einfachen Welt, konsistente Farb-/Materialwirkung und getrennte Bewegungsdiagnose. Einzelbilder erlauben keine abschließende Beurteilung von Spielgefühl oder Animationsflüssigkeit. Keine vollständige Quellcode-, Lizenz-, Audio-, Performance- oder Sicherheitsprüfung.

Der erste [YouTube-Link](https://www.youtube.com/watch?v=doR2RhsneRA) lässt sich dem Projekt zuordnen; seine Wiedergabe wurde hier nicht vollständig analysiert. Die lokal gelieferten Originalberichte und Clips sind die konkrete Analysegrundlage. Die Beschreibung des zweiten [YouTube-Links](https://www.youtube.com/watch?v=h5zkzon0gM4) war nicht abrufbar; dessen Ressourcen wurden separat anhand ihrer Original-Repositories geprüft. Keine Aussage, beide YouTube-Videos vollständig gesehen zu haben.

Quellfingerprints: Build-Kit SHA256 `b639cd2e14c9cb526f511574f161cfa568f41ce64fe9d844a5999ff2b791c366`; Ergebnisbericht `72dc29da19fe1705236ab917656c51d7e3f0ec9376c319809e8ec8adea496341`; Statistik `8a9cde5c5049c2b581fc35603ee9d0b1bcd62e90ab313f79f9e27e246e5ed5fa`. Lokale Inventare, Textauszüge und Bildstichproben: `analysis/GC-GAMES-PIPELINE-01/oldcraft/`. Fremde Assets/Skripte werden nicht in GradeCrew übernommen.

## Was der Bericht wirklich belegt

Die folgenden Zahlen sind **Angaben des Autors**, keine eigene Messung: 36 h 45 min Gesamtzeit mit nächtlicher Pause; rund 7,85 Milliarden Tokens, davon 98,7 % Cache-Lesezugriffe; etwa 2.175 USD API-äquivalente Schätzung statt tatsächlicher Modellrechnung; 107 Arbeitspakete, 161 Helfertranskripte, 937 Generierungsaufrufe und 82 automatisierte Durchläufe. Cache-Lesen ist nicht kostenloses Nichtstun, aber auch nicht dieselbe Menge neu erzeugter Antworttexte. Diese Zahlen lassen sich weder in unser Pro-Limit noch in einen Preis pro GradeCrew-Spiel umrechnen.

Der Bericht benennt selbst offene Nachweise: M4-Weltprüfung nicht ausgeführt, spätere Meilensteinstände unvollständig, visuelle Bewertungen von Agenten statt menschlicher Abnahme, Audioarbeit teilweise nur geplant und bekannte Rig-Probleme nicht abschließend nachgeprüft. Ein normaler Start des fertigen Builds scheiterte zunächst an einem entfernten Shader, obwohl Performance-Durchläufe bestanden. Die gemeldete Desktop-GPU-Framerate ist kein Schul-iPad-Nachweis.

Auch Budgetzusagen differenzieren: Das Kit nennt ein fal-Limit und ein Generator-Kontingent; der fertige Report beschreibt später explizite Nutzerwünsche, mehr Kontingent zu verbrauchen. Der gelesene allgemeine fal-Jobhelfer speichert IDs/Ergebnisse und verhindert doppelte Receipts, belegt aber allein keine globale Budgetdurchsetzung. Ein Limit in einer Markdown-Datei ist noch keine technische Kostensperre.

## Übernehmen, anpassen, weglassen

| Beobachtung / Herkunft | Regel für unsere kleineren Spiele |
| --- | --- |
| PLAN/TODO/DEVLOG und Wiederaufnahme-Hook (`CLAUDE.md` §1) | Kurzer gespeicherter Einstieg mit aktuellem Commit, laufenden Jobs und nächstem Schritt. Nach Unterbrechung erst Zustand prüfen. Kein gesamtes Archiv bei jeder Kleinigkeit laden. |
| Getrennte Fachspuren, nur Integrator bedient Unity (`CLAUDE.md` §4) | Ein Eigentümer je Editor, Szene und Schreibbereich; kleine Pakete liefern Dateien plus Manifest. Main integriert seriell. Eigene temporäre Ordner verhindern gegenseitig überschriebene Prompts. |
| Früher kompletter Spielablauf (M1) | Zuerst ein durchspielbarer Lernabschnitt. Start → Interaktion → Aufgabe → Hilfe/Antwort → Belohnung → Fortsetzen. Große Welt und viele Figuren kommen später. |
| Testlauf an Brücke trotz Bewegung stecken geblieben (`result.html`) | Fortschritt zum Ziel und Zustandsänderungen prüfen, nicht bloß „Figur bewegt sich“. Für Lernaufgaben tatsächliche Aufgabe/Revision/Ergebnis prüfen. |
| Normalstart scheitert trotz grüner Sondertests (`result.html`, D056) | Kaltstart des ausgelieferten Builds durch den normalen Einstieg separat prüfen. Kein Debug-Sprung, automatisches Login oder Testfixture als einziger Nachweis. |
| Feste Vorher-/Nachher-Kameras (`TASK.md` §18) | Wenige reproduzierbare Spielansichten und kurze Interaktionsclips je relevantem Meilenstein; keine dauerhafte Bildschirmaufzeichnung oder 5-Minuten-Fotos als Pflicht. |
| Figur: Konzept → Mesh → Rig → Animation → Spiel | Erst eine repräsentative Figur ganz durch die Pipeline; erst danach Varianten. Fußkontakt, Griff, Blickrichtung, Übergänge und tatsächliche Spielkamera prüfen. |
| Export aus kopiertem Ordner wieder einlesen | Prüfen, ob Texturen/Skelett ohne versteckte Pfade zum ursprünglichen Arbeitsordner funktionieren. Quell- und Exportdatei separat erhalten. |
| Generator-Verwechslung von Inputbildern und Ergebnissen | Herkunft und tatsächliche Ausgabedatei nachweisen; „Job fertig“ heißt nicht „brauchbares Asset akzeptiert“. |
| Wiederaufnahme über gespeicherte Job-ID | Timeout bedeutet unbekannter Zustand, nicht automatisch fehlgeschlagener Auftrag. Keine doppelte kostenpflichtige Einreichung. |
| Speicher voll, Editorabsturz, Binärdateien durch Textkonvertierung beschädigt | Vor großen Exporten Platz/RAM prüfen; Diagnoseartefakte begrenzen, letzte gute Quellen behalten; Binärdateien bytegenau versionieren und passende Git-Attribute verwenden. |
| Viele nachträgliche Bewegungs-/Brückenkorrekturen | Kollision, begehbare Geometrie und Animation vor Dekoration testen; jeweils auf einem kleinen repräsentativen Objekt. |

## Was ausdrücklich nicht zum GradeCrew-Standard wird

- Der `keep_working.py`-Hook verhindert selbst das reguläre Beenden, bis eine Stoppdatei oder ein Zeitfenster es erlaubt. Wir verwenden stattdessen einen begrenzten Auftrag mit Endkriterium, bestehendem Versuchslimit und geordnetem Abschluss. Kein künstlich ständig nachgefülltes TODO.
- Keine Aufforderung, Kontingente aufzubrauchen, Berechtigungsprüfungen abzuschalten oder ungeklärte Providerfehler blind zweimal zu wiederholen.
- Keine festen Modell-/Provider-Marken aus den Skills. Das Screenshot zeigt mehr Skills als die vier tatsächlich im Kit enthaltenen Pakete. Ein Ordnername beweist weder Installation noch Funktion.
- Keine generelle Vorgabe „alle Materialien metallic=0“, „Bäume ohne Kollision“, „Root Motion immer aus“ oder immer derselbe Exportpreset. Das sind projektspezifische Entscheidungen, die nur nach Prüfung zum eigenen Art-/Bewegungs-/Enginevertrag passen.
- Keine Pflicht zu zwölf Figuren, Hunderten generierten Assets, acht parallelen Fachspuren, kompletter MMO-Oberfläche oder filmischer Präsentation. Das würde unserem Lernspielumfang widersprechen.
- Automatische Agentenbewertungen bleiben technische/gestalterische Hinweise; Martins Abnahme und belegter Releasezustand werden dadurch nicht ersetzt.

## Unser kompakter Produktionsablauf

**A. Entscheiden:** sechs Einstiegsfragen, ein Leitbild, konkretes Lernziel, erlaubter Umfang und Zielgeräte. Ergebnis: kurzer PLAN und ART_DIRECTION.

**B. Beweisen:** eine kleine Szene mit vollständigem Lernspielablauf und normalen Bedienelementen. Zuerst Platzhalter; ein Start- und Wiederaufnahmecheck auf dem schwächsten zugesagten Gerät.

**C. Gestalten:** ein Stilset, eine repräsentative Figur oder Spielfigur, wenige wiederverwendbare Objekte. Bestehende passende eigene/lizenzierte Assets bevorzugen. Aufwand nur dort, wo er Orientierung, Feedback oder Spielspaß verbessert.

**D. Verteilen:** nur wirklich unabhängige Pakete, normalerweise ein Umsetzer plus unabhängiger Prüfer; bei Bedarf bis zu drei aktive Umsetzungspakete. Gemeinsame Szenen und Testverträge bleiben klar zugeordnet.

**E. Prüfen und liefern:** veränderte Mechanik gezielt prüfen, vollständigen Lernspielablauf nach Integration testen, normalen Paketstart und Geräteeingabe prüfen; Fehler und fehlende Abnahmen sichtbar halten. Budget/Versuche abschließen, nicht automatisch erweitern.

Wiederverwendbares Wissen erhält jeweils: Problem, beobachtete Ursache, begrenzte Lösung, Prüfschritt, Engine-/Versionsbezug und Gegenbeispiel. Damit entsteht ein nachlesbares Projektgedächtnis statt einer Sammlung immer längerer Prompts. Das trainiert kein Modell dauerhaft; künftige Chats erhalten Wissen durch diese versionierten Einstiegspunkte.
