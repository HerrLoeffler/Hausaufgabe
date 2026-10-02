# GradeCrew Escape Games – Produkt- und Architekturkonzept

Stand: 03.10.2026. Dieses Dokument gilt **nur für die GradeCrew-Escape-/Adventure-Spiele**. Es ersetzt weder den allgemeinen Games-Hub noch die Regeln anderer Spieltypen.

## Produktidee

GradeCrew Escape Games sollen keine digitalen Arbeitsblätter mit hübscher Kulisse sein. Jede Welt soll sich wie ein kleines, eigenständiges Indie-Adventure anfühlen: erkunden, steuern, ausprobieren, Werkzeuge benutzen, Dinge entdecken, kleine Überraschungen erleben und dabei regelmäßig echten Lernfortschritt nachweisen.

Kernversprechen:

> **Die Lehrkraft gibt Lernziel und Rahmen vor. GradeCrew verwandelt das in ein echtes Adventure – ohne dass 30 Schüler dieselben konkreten Aufgaben oder denselben Endcode erhalten müssen.**

## Vier Ebenen

### 1. Gemeinsame Escape-Engine

Einmal entwickelt und danach in allen Escape-Welten wiederverwendet:

- Figurbewegung, Kollisionssystem, Tap-to-Move, Desktop- und Touch-Steuerung;
- Kamera/Viewport, Szenenwechsel, Raum-/Levelübergänge;
- Interaktionssystem und Hotspots;
- Inventar und kombinierbare Gegenstände;
- NPC-/Guide-Dialoge;
- Lernfragen, Hinweise, Remediation und Transferchecks;
- Save/Resume, Zeit, Fortschritt, Statistiken;
- Sound, Musik, Licht, Partikel, Animationen;
- responsive Bedienung auf PC/Mac, iPad und iPhone;
- Zugänglichkeit, Fokus-/Enter-Verhalten und alternative Bedienung;
- reproduzierbare Session-Seeds für Varianten.

Die Engine spart Entwicklungszeit, nicht Abwechslung. Sie ist das technische Fundament, das Spieler möglichst nicht bewusst wahrnehmen sollen.

### 2. Große Mechanik-Bibliothek

Neue Mechaniken sollen ausdrücklich willkommen sein. GradeCrew soll nicht versuchen, mit fünf Standardrätseln hundert Welten zu bauen.

Beispiele:

- Jeep / Fahrzeug fahren;
- Boot steuern;
- Drohne fliegen;
- Tiere oder Beweise fotografieren;
- Fernglas / Zoom;
- Seilwinde;
- Magnetkran;
- Greifarm;
- Metalldetektor;
- UV-Lampe;
- Taschenlampe;
- Sicherungskasten;
- Stromleitungen verbinden;
- Ventile und Drucksysteme;
- Reagenzgläser / Mischsystem;
- Mikroskop;
- Laser umlenken;
- Roboter programmieren;
- Funkgerät / Frequenzsuche;
- Kompass / Karte;
- Spuren verfolgen;
- Kisten schieben;
- Förderband;
- Schleichen / Sichtkegel;
- Angeln;
- Ausgrabung / Pinsel;
- Seil / Klettern;
- Codes, Symbole, Sequenzen und Logikrätsel.

Eine Mechanik wird einmal sauber als Modul gebaut. Danach kann sie in passenden Welten wiederverwendet, kombiniert oder variiert werden. **Wiederverwendung bedeutet nicht, dass jede Welt dieselben Mechaniken enthält.**

### 3. Echte Welt- und Story-Packs

Ein Welt-Pack ist mehr als ein Skin. Es besitzt:

- eigene Räume/Szenen;
- eigene Geschichte und Mission;
- eigene Geräusche und visuelle Stimmung;
- charakteristische Werkzeuge;
- mindestens 2–3 Mechaniken, die in dieser Kombination für die Welt typisch sind;
- eigene Überraschungen, kleine Gags und Ereignisse;
- alternative Routen oder Szenen, wo sinnvoll.

Beispiele:

- Amazonas-Expedition: Jeep, Seilwinde, Tierkamera, Boot, Generator, Funkmast;
- Raumstation: Schwerelosigkeit, Luftschleuse, Roboterarm, Sauerstoff, Terminal;
- Hafen: Magnetkran, Container, Funkgerät, Gabelstapler;
- Archäologie: Ausgrabung, Pinsel, Spiegellicht, Artefaktmechanik;
- Detektivstadt: NPC-Befragung, Fingerabdruck, Kameraaufnahmen, Verfolgung;
- Bergrettung: Schneemobil, Sonde, Drohne, Karte/Funk.

### 4. Variable Runs

Auch dieselbe Welt darf nicht bei jedem Start exakt gleich ablaufen.

Mögliche Variation:

- andere Tier-/Objektpositionen;
- andere aktive Route oder Reihenfolge;
- andere benötigte Werkzeuge;
- alternative Räume oder Ereignisse;
- andere Distraktoren / Logikwerte;
- andere Lernaufgaben und Transferaufgaben;
- pro Schüler andere Zahlen/Beispiele bei gleichem Niveau;
- wo sinnvoll andere Codefragmente und Endcodes.

Eine Session erhält einen Seed. Dadurch bleibt sie reproduzierbar, testbar und innerhalb eines laufenden Spiels stabil.

## Lernen und Individualisierung

Die Lernregeln aus `docs/games/LEARNING_GUARDRAILS.md` gelten vollständig.

Zusätzlich gilt für Escape:

- gleiche Kompetenz und vergleichbares Niveau für alle Schüler;
- konkrete Aufgaben dürfen sich pro Schüler unterscheiden;
- in Mathematik werden Zahlenwerte bevorzugt deterministisch variiert;
- in Sprachen/Sachfächern können Beispiele, Reihenfolgen, Distraktoren oder gleichwertige Kontexte variieren;
- Transferaufgaben werden ebenfalls variiert;
- ein zugerufener fremder Lösungswert darf den eigenen Lernnachweis nicht ersetzen;
- relevante Fortschritts-Gates prüfen den eigenen Sessionzustand;
- Endcodes können aus eigenen Sessionwerten abgeleitet werden.

Die Lehrkraft kontrolliert nicht 30 Einzelfassungen. Sie prüft die Aufgabenfamilie, Lernziele, Regeln der Variantenerzeugung und repräsentative Beispiele.

## KI- und Kostenprinzip

### Was keine KI benötigt

Beim Spielen laufen fertige Mechaniken lokal/deterministisch:

- Jeep;
- Magnetkran;
- Kamera;
- Boot;
- Taschenlampe;
- Inventar;
- Physik-/Kollisionslogik;
- Räume, Animationen, Sounds;
- Codes und Zustandsmaschinen;
- aus einem validierten Seed erzeugte Zahlenvarianten.

Diese Dinge verursachen keine Modellkosten pro Nutzung. Ihre Kosten bestehen primär aus einmaliger Entwicklungszeit, Assets sowie normalem Hosting/Traffic.

### Wofür KI sinnvoll ist

KI wird gezielt eingesetzt für:

- Lehrkraftauftrag → passende Lernaufgabenfamilien;
- Hinweise/Erklärungen/Transferaufgaben, wenn nicht bereits aus geprüften Bausteinen verfügbar;
- optionale individuelle Coco-Hilfe bei neuen Verständnisfragen;
- später eventuell Story-/Textvorschläge für Autoren, aber niemals ungeprüfte ausführbare Spiellogik.

Reihenfolge bleibt:

**deterministisch → GradeCrew-Wissens-/Aufgabenbibliothek → Cache → günstige KI → starkes Modell nur als Ausnahme.**

30 Schüler sollen nicht 30 KI-Generierungen benötigen. Eine geprüfte Aufgabenfamilie kann lokal mit unterschiedlichen Seeds in 30 äquivalente konkrete Varianten überführt werden.

## Skalierungsprinzip

Level 1 ist teuer in Entwicklungszeit, weil Engine und erste Mechaniken gleichzeitig entstehen. Mit wachsender Bibliothek sinkt der Aufwand für neue Level.

Wichtig: Das Ziel ist **nicht**, Entwicklungszeit durch langweilige Wiederholung zu sparen. Das Ziel ist, technische Grundlagen und bereits entwickelte Mechaniken nicht immer wieder neu zu bauen, damit die gesparte Zeit in neue Ideen, Story, Grafik und besondere Mechaniken fließen kann.

Ein neuer Magnetkran, eine neue Fahrzeugsteuerung oder Gegner-/Sichtlogik darf mehrere Stunden oder Tage kosten. Danach existiert sie dauerhaft im Werkzeugkasten.

## Qualitätsregel für neue Escape-Welten

Eine Welt darf nicht nur eine Umbenennung bestehender Räume sein.

Vor Freigabe sollte sie mindestens erfüllen:

1. klare eigene Mission/Story;
2. erkennbare eigene visuelle Identität;
3. mindestens 2–3 charakteristische Mechaniken oder deutlich neue Kombinationen;
4. mehrere Wechsel zwischen Lernen, Erkunden und Spielmechanik;
5. mindestens einen erinnerungswürdigen Moment, der kein Lernformular ist;
6. komplette Lösbarkeit per automatischem Preflight plus Spieltest;
7. Touch/PC-Bedienbarkeit;
8. individuelle Lernvarianten ohne Niveauverschiebung.

## Autoren-/Contentmodell später

Langfristig soll eine Escape-Welt deklarativ beschrieben werden können:

- Szenen;
- erlaubte Mechaniken;
- Objekt-/Hotspotkonfiguration;
- Storybeats;
- Lernslots;
- Voraussetzungen und Belohnungen;
- Variantengruppen;
- Übergänge und finale Bedingungen.

Die KI darf validierte Inhaltsfelder befüllen. Die Engine und Mechaniken selbst bleiben geprüfter Code.

## Referenz für den nächsten Prototyp

`Expedition Amazonas – Die verschwundene Forschungsstation` soll bewusst über den bisherigen Schulraum hinausgehen und mehrere Mechaniken in einem zusammenhängenden Adventure testen:

1. Expeditionscamp / Jeep;
2. blockierter Dschungelpfad / Seilwinde;
3. Wildtierzone / Kamera;
4. Fluss / Bootssteuerung;
5. Forschungsstation / Generator und Strom;
6. Funkmast / Finale.

Der Prototyp soll zeigen, ob eine gemeinsame Engine mehrere deutlich unterschiedliche Spielarten in einer Geschichte tragen kann, ohne den bestehenden Schul-Escape zu ersetzen oder Production anzufassen.
