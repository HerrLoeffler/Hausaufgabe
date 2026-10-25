# GradeCrew Homepage · interaktive Testvorschau V8

Lokaler Prototyp zu `design-startscreen-v1` / `GC-DESIGN-05`, Stand 25.10.2026. Mit `python3 -m http.server 8766 --bind 127.0.0.1` in diesem Ordner starten und `http://127.0.0.1:8766/` öffnen. Die Dateien liegen im ChatGPT-Projektmirror, nicht in einem Git-Checkout. Es gab keinen Repo-Commit, PR, Staging- oder Production-Deploy.

Die Desktop-Seite bleibt auf einem Bildschirm. Die vier freigestellten Crew-Figuren sind größer und stehen ohne Bildrahmen vor dem Hintergrund; Coco, Remy, Emmi und Wilma sind mittig unter ihren Figuren beschriftet. Der Einleitungstext hat zwei feste Zeilen. Rechts ist die Testvorschau vergrößert und harmonisch zur Crew ausgerichtet. Eine Karte ist jeweils aktiv; Mausrad und die Leiste 1–10 wechseln zwischen den Karten. Die Aufgabenkarten beginnen direkt unter der Übersicht und haben auf dem Desktop dieselbe Höhe. Zugeordnete Ereignisse sind mittig in den Zeitstrahlfeldern gesetzt. `preview-v8.jpg` zeigt das bei 1280 × 720 Pixeln mit belegtem Feld; `preview-v8-circuits.jpg` zeigt die ebenfalls vollständig sichtbare Stromkreisaufgabe.

## Zehn Karten

1. A und B als getrennte Punkte im Koordinatensystem setzen; keine eingeblendeten Lösungsfelder.
2. Remy-Aufnahme hören und die Schreibweise GradeCrew auswählen.
3. Nomen, Verb und Adjektive farbig im Satz markieren.
4. Die beiden Nullstellen von `f(x) = x² − 5x + 6` in zwei Felder eintragen; die Reihenfolge ist egal, die Lösung lautet 2 und 3.
5. Blüte, Blatt, Stängel und Wurzel an einer freigestellten botanischen Kosmee beschriften. Die vier Zielorte haben Führungslinien zu den Pflanzenteilen. Zuordnungen lassen sich entfernen und neu setzen.
6. Fünf illustrierte Geschichtsereignisse einem horizontalen Zeitstrahl zuordnen: 800 Karl der Große, um 1450 Buchdruck, 1789 Bastille, 1914 Sarajevo, 1989 Mauerfall. Die Mondlandung wurde ersetzt. Zuordnungen lassen sich ändern.
7. Sechs Instrumentbegriffe ohne Bilder in drei Gruppen einordnen.
8. Vier Stromkreise beurteilen; bei lokaler Prüfung leuchten die zwei funktionierenden Lampen.
9. Ei, Raupe, Puppe und Schmetterling als illustrierte Bildfolge sortieren.
10. Einen Winkel am skalierten Winkelmesser auf 60° einstellen, ohne digitale Gradanzeige; die Demobewertung akzeptiert 58–62°.

## Stimme, Punkte und Sprachen

Die neue deutsche Audiodatei `assets/remy-gradecrew-de-v8.wav` ist ein lokaler 13,5-Sekunden-Schnitt der vorhandenen Remy-Aufnahme. Ein Schlusssatz nach einer langen Pause wurde abgeschnitten. Ein neuer ElevenLabs-Take mit der bestätigten Remy-ID `5Axpbpycg8qWQ7LexavI` wurde versucht, scheiterte aber an der verbleibenden Quote: 30 Credits verfügbar, 127 benötigt. Das ist kein Beleg für eine neue, gelungene Sprachaufnahme. Die WAV-Datei ist technisch gültig und startete im Browser. Wortlaut und Betonung des neuen Schnitts wurden nicht akustisch oder per Transkript abgenommen; das sollte Martin selbst anhören. Der alte deutsche Take und die englische Aufnahme bleiben erhalten.

Die lokale Beispielauswertung schlägt zwei Punkte pro Karte vor. Nach „Test auswerten“ sind die maximalen Punkte je Aufgabe in 0,5er-Schritten von 0 bis 20 änderbar; erzielte und mögliche Gesamtpunkte aktualisieren sich sofort. Antworten und Bewertung bleiben im Browser. Deutsch ist voreingestellt; die Oberfläche und Aufgabentexte sind auf Englisch verfügbar.

Der Anmelden-Button führt im lokalen Prototyp zur bestehenden GradeCrew-Anmeldung. Bei HTTPS-Bereitstellung führt er zum Login auf demselben Host; so springt eine isolierte Vorschau nicht in Schul-Live. Die echte Entry-App muss die Vorschau vor Rollout in ihren vorhandenen Login-Fluss einbinden.

## Produktgrenze und Prüfung

Die Integrationsversion von GradeCrew kennt elf reguläre `question.type`-Werte: `single`, `multi`, `text`, `dropdown`, `truefalse`, `gapfill`, `matching`, `ordering`, `grouping`, `markwords`, `number`. Audio und Bilder sind Medien einer Aufgabe. Die Homepage zeigt eine kuratierte Auswahl. Koordinaten, Stromkreisleuchten und Winkelmesser sind lokale Showcase-Widgets und hier nicht als produktiv freigegeben nachgewiesen.

Der visuelle `labeling`-Aufgabentyp aus Entwurfs-PR #265 erhielt in Folge-PR #300 mittigen Textumbruch in Zielfeldern und reversibles Zuordnen per Maus oder Tastatur. Diese wiederverwendbare Änderung ist reviewbar, aber noch nicht in der regulären Testoberfläche integriert oder ausgerollt. Das lokale Zeitstrahl-Widget bleibt separat.

`grading.test.mjs` bestand 7/7; `app.js` bestand die Syntaxprüfung. Bei 1280 × 720 Pixeln wurden die Startseite und alle zehn Karten auf einheitliche Position/Höhe geprüft; die zuvor zu hohe Stromkreiskarte wurde verdichtet und nochmals visuell geprüft. Eine Zeitstrahlbelegung wurde gesetzt und zentriert angezeigt. Die Pflanzenbegriffe und der Zeitstrahl passen vollständig in den sichtbaren Bereich; eine Pflanzenzuordnung wurde gesetzt und wieder entfernt. Der Audioknopf startete die lokale Datei. Eine gesonderte mobile Abnahme und subjektive Hörprobe stehen aus.

Die neue Blume wurde für V6 mit dem integrierten Bildgenerator erzeugt und als `assets/cosmos-botanical-v1.png` mit transparentem Hintergrund eingebaut. Die freigestellten Crew-Figuren wurden für V7 aus Martins Referenzbild bearbeitet und als `assets/crew-cutout-v2.png` gespeichert. Die Originaldateien blieben erhalten. Frühere Varianten und Entscheidungen stehen in `work/` und `HANDOFF.md`.
