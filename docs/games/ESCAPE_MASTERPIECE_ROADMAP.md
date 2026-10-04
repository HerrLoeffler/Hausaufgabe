# GradeCrew Escape – Masterpiece Roadmap

Stand: 03.10.2026

Dieses Dokument ist die verbindliche, kleinschrittige Entwicklungsreihenfolge für den Ausbau von **Expedition Amazonas** zur GradeCrew-Escape-Referenzwelt. Es ergänzt `ESCAPE_GAMES_CONCEPT.md` und die bestehenden Lernleitplanken.

## Leitbild

Das Ziel ist kein funktionierender Prototyp, sondern ein kleines Indie-Adventure, das Schüler freiwillig gern spielen.

Produktziel:

> **Komplexes Spiel, einfache Sprache, einfache Bedienung, starke Atmosphäre, 30–35 % echtes Lernen und mehrere erinnerungswürdige Spielmomente.**

Kein Arbeitspaket gilt als fertig, nur weil der Code läuft. Jeder Abschnitt erhält ein überprüfbares Abnahmekriterium. Die nächste größere Phase beginnt erst, wenn die vorherige Phase keine bekannten Blocker mehr hat.

## Nicht verhandelbare Regeln

- Production bleibt unangetastet, bis ausdrücklich freigegeben.
- Der bestehende Point-and-Click-Escape und der erste Adventure-Raum bleiben als Referenz erhalten.
- Neue Arbeit erfolgt auf isolierten Branches/PRs.
- Kein blindes Überschreiben paralleler Games-/Design-System-Arbeit.
- Jeder Teilschritt wird mit Status `erledigt / geprüft / offen / nächster Schritt` dokumentiert.
- Schüler dürfen durch Fehler, Raten oder fremde Codes keinen Lernfortschritt überspringen.
- Pro Schüler/Session sind äquivalente Aufgabenvarianten mit stabilem Seed vorgesehen.
- Zielmix eines normalen Runs: 30–35 % Lernen, 45–55 % Spielen/Erkunden, 15–20 % Rätsel/Story.
- Texte werden standardmäßig kurz, konkret und schülernah geschrieben.
- Grafik und Game-Feel sind Produktanforderungen, kein späteres Bonus-Polish.

---

# Phase 0 – Baseline einfrieren und vermessen

Ziel: Erst genau wissen, was aktuell funktioniert und wo es hängt.

### 0.1 Stand sichern
- aktuellen Branch/Commit dokumentieren;
- Preview-Link dokumentieren;
- alte Schul-Escape-Links unverändert lassen;
- vorhandene Tests und Build-Gates festhalten.

**Gate:** reproduzierbarer Ausgangsstand vorhanden.

### 0.2 Vollständiger Desktop-Durchlauf
Für jedes Level protokollieren:
- Startzustand;
- benötigte Eingaben;
- mögliche Hänger;
- unklare Texte;
- tote Klickflächen;
- zu lange Wartezeiten;
- unklare Ziele;
- unschöne visuelle Stellen;
- Lernunterbrechungen.

**Gate:** vollständige Fehler-/UX-Liste statt Einzelbeobachtungen.

### 0.3 Zustandsdiagramm erstellen
Für Camp, Jeep, Winde, Tierkamera, Boot, Generator, Terminal und Funk:
- Einstieg;
- erlaubte Eingaben;
- Erfolg;
- Fehler;
- Abbruch/Reset;
- Übergang.

**Gate:** jeder Mechanikzustand besitzt einen sicheren Ausgang.

---

# Phase 1 – Stabilität vor Schönheit

Ziel: Kein Schüler soll hängen bleiben, egal ob er hektisch tippt, doppelklickt oder zurückgeht.

### 1.1 Globaler Szenen-Lifecycle
- klare `enter / active / complete / exit`-Zustände;
- Übergangssperre während Szenenwechsel;
- keine doppelte Initialisierung;
- keine Eingaben in deaktivierte Szene.

### 1.2 Input-Härtung
- Doppelklick/Doppeltap entprellen;
- Tastendrücken beim Dialogwechsel abfangen;
- Pointer-Capture sauber lösen;
- Touch und Maus nicht doppelt auswerten;
- Enter/Escape konsistent behandeln.

### 1.3 Softlock-Schutz
Für jede Mechanik:
- Reset-Knopf oder automatische Rückkehr;
- ungültige Zustände erkennen;
- bei blockierter Bewegung zurück auf letzten sicheren Punkt;
- keine Belohnung zweimal vergeben.

### 1.4 Bewegungs-/Kollisionslogik
- keine unsichtbaren Wände ohne visuelle Begründung;
- keine unerreichbaren Interaktionspunkte;
- Tap-to-Move darf nicht dauerhaft gegen Hindernis laufen;
- Fahrzeug darf nicht außerhalb der Spielfläche verschwinden.

### 1.5 Performance-Baseline
- unnötige Arbeit im Renderloop entfernen;
- statische Elemente möglichst nicht jedes Frame neu berechnen;
- Partikel/Animationen begrenzen;
- keine externen Runtime-Abhängigkeiten nur für kleine Effekte.

**Phase-1-Gate:** 10 komplette Desktop-Durchläufe ohne bekannten Softlock oder notwendiges Reload.

---

# Phase 2 – Schüler-Sprache und Bedienung

Ziel: Ein Schüler versteht immer in wenigen Sekunden, was gerade passiert und was er tun soll.

### 2.1 Textinventar
Alle sichtbaren Texte sammeln und klassifizieren:
- Story;
- Mission;
- Button;
- Hilfe;
- Fehler;
- Lernfrage;
- Erfolg.

### 2.2 Textregel
Standard:
- kurze Sätze;
- ein Gedanke pro Satz;
- eine Handlung pro Anweisung;
- aktive Verben;
- keine unnötigen Fachwörter;
- keine Erklärung, die durch Bild/Animation ersetzbar ist.

Beispiel:
- schlecht: „Aktiviere das Energieversorgungssystem der Forschungsstation.“
- besser: „Der Strom ist aus. Starte den Generator.“

### 2.3 Missions-UI
Jede neue Szene zeigt nur:
1. **Was ist los?**
2. **Was soll ich tun?**
3. **Los!**

Danach verschwindet die Karte schnell wieder.

### 2.4 Kontext-Hilfe
- Hilfe erscheint dort, wo das Problem entsteht;
- keine dauerhaften Textwände;
- Coco erklärt nur bei Bedarf;
- Icons/Animationen zeigen Bedienung.

### 2.5 Klassen-/Leseniveau vorbereiten
Textsystem so strukturieren, dass später Varianten wie `einfach / standard / anspruchsvoll` möglich sind, ohne die Spiellogik zu ändern.

**Phase-2-Gate:** jede Szene kann von einem neuen Tester ohne mündliche Erklärung begonnen werden.

---

# Phase 3 – Engine modularisieren

Ziel: Amazonas darf nicht als einmaliger Monolith weiterwachsen.

### 3.1 Core extrahieren
Module:
- InputManager;
- SceneManager;
- PlayerController;
- CollisionService;
- InteractionService;
- InventoryService;
- MissionUI;
- SaveState;
- SeededRandom;
- LearningGate.

### 3.2 Mechaniken extrahieren
Eigene Module:
- VehicleController;
- JeepMechanic;
- BoatMechanic;
- WinchMechanic;
- CameraMechanic;
- SequenceMechanic;
- RadioMechanic.

### 3.3 Mechanik-Vertrag definieren
Jede Mechanik liefert mindestens:
- `mount()`;
- `start()`;
- `pause()`;
- `reset()`;
- `complete()`;
- `destroy()`;
- definierte Events;
- sichere Touch-/Desktop-Steuerung.

### 3.4 Szenen deklarativ beschreiben
Storydaten, Ziele, Assets und Mechaniken soweit sinnvoll aus Code herauslösen.

**Phase-3-Gate:** mindestens eine bestehende Mechanik kann in einer Testsandbox ohne Amazonas-Story gestartet werden.

---

# Phase 4 – Art Direction festlegen

Ziel: Der Look soll bewusst gestaltet sein und nicht wie gezeichnete Debug-Flächen wirken.

### 4.1 Visuelle Referenz definieren
Für Amazonas festlegen:
- Perspektive;
- Farbwelt;
- Lichtstimmung;
- Formen;
- UI-Integration;
- Detailgrad;
- Figurmaßstab;
- Animationsstil.

Zielrichtung: freundliches, hochwertiges 2D-Indie-Adventure; klar lesbar auf Schulgeräten; stilisiert statt fotorealistisch.

### 4.2 Layer-System
Jede Szene erhält:
- Background;
- Ground;
- Props;
- Gameplay-Objekte;
- Player/NPC;
- Foreground;
- FX;
- UI.

### 4.3 Tiefenwirkung
- Schatten unter Figuren/Fahrzeugen;
- Pflanzen im Vordergrund;
- leichte Parallax-Bewegung;
- unterschiedliche Größen/Überlagerungen;
- atmosphärische Lichtzonen.

### 4.4 Umweltbewegung
Kleine Loops:
- Blätter;
- Wasser;
- Insekten;
- Wolken/Lichtflecken;
- Rauch/Staub;
- Generatorvibration.

### 4.5 Asset-System
Wiederverwendbare Weltassets sauber benennen und zentral halten.

**Phase-4-Gate:** Camp und eine zweite Szene sehen auch ohne Gameplay bereits wie dieselbe hochwertige Welt aus.

---

# Phase 5 – Games-Figur

Ziel: eigene wiedererkennbare Spielfigur, getrennt von Coco/Remy/Emmi/Wilma.

### 5.1 Rolle definieren
- Games-Avatar = Spieler/Entdecker;
- keine zusätzliche KI-Assistentenrolle;
- wiederkehrend in allen Adventure-Games.

### 5.2 Figur auswählen
Kriterien:
- klare Silhouette klein auf Handy;
- sympathisch;
- neutral genug für viele Welten;
- gute Lauf-/Fahr-/Werkzeuganimationen;
- nicht mit vorhandenen Crew-Rollen verwechselbar.

### 5.3 Animationsset v1
- idle;
- laufen 4 Richtungen;
- interagieren;
- jubeln;
- erschrecken/überrascht;
- Werkzeug benutzen;
- Fahrzeug ein-/aussteigen.

### 5.4 Feedback
- Staub/Fußtritt;
- kleiner Squash/Stretch;
- Blickrichtung;
- Interaktionsreaktion.

**Phase-5-Gate:** Figur wirkt nicht mehr wie Platzhalter und ist auf iPhone-Größe eindeutig lesbar.

---

# Phase 6 – Game-Feel pro Mechanik

Ziel: Jede Mechanik soll Spaß machen, bevor Lernen hineinkommt.

## 6A Jeep
- Beschleunigen/Bremsen weich;
- Kurvengefühl;
- Federung;
- Staub;
- Pflanzen reagieren;
- kleine Kamera-Nachführung;
- Hindernisfeedback;
- kurzer Startmoment mit Motorreaktion.

**Wow-Moment:** Jeep springt an und bricht aus dem Camp auf.

## 6B Seilwinde
- sichtbares Seil;
- Baum bewegt sich wirklich;
- Spannung verständlich darstellen;
- Motor-/Seilfeedback;
- Baum fällt/rollt aus dem Weg.

**Wow-Moment:** Weg wird sichtbar freigeräumt.

## 6C Kamera
- echter Sucher;
- leichter Zoom;
- Tier bewegt sich;
- Fokus-/Trefferfeedback;
- Foto friert kurz ein;
- Expeditionsalbum.

**Wow-Moment:** seltenes Tier reagiert nach gelungenem Foto.

## 6D Boot
- Wasserbewegung;
- Bugwelle;
- leichte Drift;
- Felsenfeedback;
- kleine Stromschnelle.

**Wow-Moment:** kurzer schneller Flussabschnitt.

## 6E Generator
- Hebel/Schalter sichtbar;
- falsche Folge reagiert;
- Lichtbereiche gehen nach Erfolg nacheinander an;
- Maschine läuft hör-/sichtbar an.

**Wow-Moment:** Station erwacht sichtbar zum Leben.

## 6F Funkmast
- Frequenz-/Signalfeedback;
- Mast-/Antenne reagiert;
- Signal baut sich auf;
- Finale nicht nur als Dialog.

**Wow-Moment:** Rettungssignal + sichtbare Reaktion der Welt.

**Phase-6-Gate:** jede Mechanik macht auch in einer Testsandbox ohne Lernfrage bereits Spaß.

---

# Phase 7 – Atmosphäre und Audio

Ziel: Welt fühlt sich lebendig an.

### 7.1 Ambient pro Zone
- Camp;
- dichter Dschungel;
- Tierzone;
- Fluss;
- Station;
- Funkmast.

### 7.2 Mechanik-SFX
- Motor;
- Reifen/Schlamm;
- Winde;
- Kamera;
- Wasser;
- Generator;
- Funk.

### 7.3 Musik
- sparsam;
- kurze Motivwechsel;
- Spannung nur bei passenden Momenten;
- abschaltbar.

### 7.4 Audio-Regeln
- keine notwendige Information ausschließlich über Ton;
- Lautstärke einstellbar;
- keine Dauerschleife, die im Klassenraum nervt.

**Phase-7-Gate:** Audio verbessert Atmosphäre, Spiel bleibt stumm vollständig lösbar.

---

# Phase 8 – Story und Pacing

Ziel: Spieler erlebt eine Mission, keine Aneinanderreihung von Minigames.

### 8.1 Storybeats
Definieren:
- Hook;
- erstes Ziel;
- erstes Problem;
- Entdeckung;
- Eskalation;
- Station erreicht;
- Finale;
- kurzer Abschluss.

### 8.2 Übergänge
- keine harten schwarzen Sprünge ohne Grund;
- Karte/Fahrt/Animation wo passend;
- Fortschritt sichtbar.

### 8.3 Kleine Überraschungen
Mindestens 1–2 pro Level:
- Tier läuft durchs Bild;
- Affe klaut kurz etwas;
- Capybara sitzt plötzlich im Weg;
- Jeep spritzt durch Pfütze;
- Funk enthält lustige Störung;
- Pflanze klappt zu.

### 8.4 Humor
Kurz und visuell; keine langen Gagtexte.

**Phase-8-Gate:** kompletter Run hat erkennbare Spannungskurve und mehrere erinnerungswürdige Momente.

---

# Phase 9 – Lernen auf 30–35 % kalibrieren

Ziel: echtes Lernen, aber kein permanentes Stoppen des Spiels.

### 9.1 Lernslots kartieren
Für 20-Minuten-Run grob 5–7 relevante Lernkontakte statt Frage an jedem Objekt.

### 9.2 Einbettung
Wo sinnvoll Storykontext nutzen, ohne künstliche Textaufgaben zu produzieren.

### 9.3 Aufgabenfamilien
- Lernziel;
- Niveau;
- Parameterregeln;
- zulässige Zahlen/Beispiele;
- Lösung;
- Distraktoren;
- Hinweis;
- Remediation;
- Transfer.

### 9.4 Individuelle Schüler-Varianten
- Session-/Schüler-Seed;
- gleiche Schwierigkeit;
- andere konkrete Werte;
- stabile Wiederaufnahme;
- fremder Lösungswert reicht nicht.

### 9.5 Lernfluss
- erste Fehler: kurze Hilfe;
- wiederholte Fehler: Erklärung;
- aktive Verarbeitung;
- Transfer;
- erst dann Fortschritt.

### 9.6 Zeitanteil messen
Bei Testdurchläufen Lernzeit gegen Gesamtzeit grob erfassen und auf 30–35 % kalibrieren.

**Phase-9-Gate:** Lernen ist fachlich substanziell, aber Testspieler beschreiben das Erlebnis weiterhin zuerst als Spiel.

---

# Phase 10 – Variable Runs

Ziel: dieselbe Welt bleibt wiederholbar.

### 10.1 Seed-System zentralisieren
Alle zufälligen, aber reproduzierbaren Entscheidungen laufen über einen Seed-Service.

### 10.2 Kleine Variation
- Tierpositionen;
- Dekoration;
- Hindernisse;
- Werte;
- Reihenfolgen.

### 10.3 Mittlere Variation
- alternative Route;
- anderes Werkzeug zuerst;
- alternative Nebenaufgabe;
- unterschiedliche Ereignisse.

### 10.4 Run-Sicherheit
Preflight prüft, dass jede gewählte Kombination lösbar bleibt.

**Phase-10-Gate:** zwei Runs derselben Welt fühlen sich erkennbar verschieden an, ohne unterschiedliche Lernniveaus zu erzeugen.

---

# Phase 11 – Accessibility und Gerätequalität

Ziel: PC, Mac, iPad und iPhone sind echte Zielplattformen.

### 11.1 Desktop
- WASD/Pfeile;
- Maus;
- Enter/Escape;
- Fokuszustände.

### 11.2 Tablet
- Touchziele groß genug;
- kein Hover nötig;
- Querformat priorisiert;
- keine browserbedingten Scroll-/Zoom-Konflikte.

### 11.3 Smartphone
- UI nicht über Spielfeld legen;
- reduzierte HUD-Dichte;
- Buttons erreichbar;
- Texte kurz.

### 11.4 Lesbarkeit
- ausreichender Kontrast;
- keine kritischen Informationen nur über Farbe;
- Untertitel/Textalternative für Audiohinweise.

**Phase-11-Gate:** kompletter Run auf echtem Desktop, iPad und iPhone ohne Blocker.

---

# Phase 12 – Test- und Qualitätsmatrix

Ziel: Meisterwerk heißt reproduzierbare Qualität.

### Automatisch
- Syntax;
- Unit-/Contract-Tests;
- Szenen-Preflight;
- Seed-Reproduzierbarkeit;
- kein Lernfortschritt bei falscher Antwort;
- kein fremder Code ohne Sessionzustand;
- Build;
- Hosting-Preview;
- Production-Guard.

### Manuell
- 10 Desktop-Runs;
- mehrere Touch-Runs;
- absichtlich falsche Eingaben;
- Doppeltap-Spam;
- Dialoge schließen/öffnen;
- Orientierung ohne Erklärung;
- langsamer/unsicherer Schülerpfad;
- schneller Spielerpfad.

### Schüler-/Kollegen-Pilot später
Beobachten statt nur fragen:
- Wo warten sie?
- Wo lesen sie nicht?
- Wo lachen sie?
- Wo wollen sie nochmal?
- Wo versuchen sie zu cheaten?
- Wo hilft Coco wirklich?

**Phase-12-Gate:** keine bekannten Blocker; kritische UX-Probleme abgearbeitet; Pilotfeedback dokumentiert.

---

# Phase 13 – Final Polish Pass

Nur Dinge, die das Erlebnis sichtbar verbessern:
- Übergangsanimationen;
- Kamera-Timing;
- Partikeldichte;
- Mikroanimationen;
- Sounds;
- Treffer-/Erfolgsfeedback;
- Textkürzungen;
- kleine Gags;
- Ladezustände;
- Ergebnisbildschirm;
- Expeditionsalbum/gesammelte Erinnerungen.

Kein Feature-Creep kurz vor Abnahme.

**Finales Gate:** Das Team kann begründen, warum jede Szene spielerisch, visuell oder lernbezogen notwendig ist.

---

# Arbeitsweise pro Mikro-Schritt

Jeder einzelne Arbeitsschritt folgt immer demselben Muster:

1. **Problem exakt benennen.**
2. **Nur den kleinsten sinnvollen Teil ändern.**
3. **Automatischen Test ergänzen, wenn Verhalten testbar ist.**
4. **Build/Syntax prüfen.**
5. **Preview deployen, wenn UI/Gameplay betroffen ist.**
6. **Tatsächlich spielen/testen.**
7. **Status dokumentieren:** erledigt / geprüft / offen / nächster Schritt.
8. Erst danach nächster Schritt.

Bei Problemen maximal 2–3 gezielte Reparaturversuche; danach Ursache neu analysieren statt weiter blind zu patchen.

---

# Unmittelbare Reihenfolge ab jetzt

1. **M0.1:** Masterpiece-Branch + Plan sichern.
2. **M0.2:** aktuellen Amazonas-Code in Szenen/Zustände inventarisieren.
3. **M0.3:** Softlock-/Input-Risiken als konkrete Liste erstellen.
4. **M1.1:** globales Scene-Lock/Transition-Guard bauen.
5. **M1.2:** Input-Debounce/Doppeltap-Schutz.
6. **M1.3:** sichere Reset-/Recovery-Pfade pro Mechanik.
7. **M1.4:** Tap-/Kollision-/Fahrzeug-Hänger beseitigen.
8. **M2.1:** alle Texte inventarisieren.
9. **M2.2:** Camp + Jeep sprachlich auf Schülerstandard umbauen.
10. **M2.3:** restliche Szenen sprachlich vereinfachen.
11. **M3.1:** SceneManager extrahieren.
12. **M3.2:** InputManager extrahieren.
13. **M3.3:** LearningGate + Seed-Service extrahieren.
14. **M3.4:** erste Mechanik isolieren und Sandbox-Test.
15. Danach erst Art-/Game-Feel-Pass nach Phase 4 ff.

## Definition von „Meisterwerk“ für diese Referenzwelt

Die Referenzwelt ist erst dann auf diesem Anspruch angekommen, wenn:

- kein bekannter Softlock existiert;
- Bedienung auf Desktop/iPad/iPhone verständlich ist;
- Texte kurz und schülergerecht sind;
- jedes Level einen eigenen visuellen/spielerischen Höhepunkt hat;
- mindestens mehrere Momente echte Freude/Überraschung erzeugen;
- Grafik nicht mehr nach Prototyp aussieht;
- Audio/Animationen gezielt Atmosphäre schaffen;
- Lernen ca. 30–35 % des Runs ausmacht;
- Schüler unterschiedliche, gleichwertige Aufgaben bekommen;
- die Welt wiederholbar ist;
- die Mechaniken als Bibliothek für spätere Welten nutzbar sind;
- und der Gesamteindruck lautet: **„Können wir noch eins spielen?“**
