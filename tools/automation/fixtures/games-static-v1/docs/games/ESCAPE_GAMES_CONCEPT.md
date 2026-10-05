# GradeCrew Escape Games – Produkt- und Architekturkonzept

Stand: 03.10.2026. Dieses Dokument gilt **nur für die GradeCrew-Escape-/Adventure-Spiele**. Es ersetzt weder den allgemeinen Games-Hub noch die Regeln anderer Spieltypen.

## Produktidee

GradeCrew Escape Games sollen keine digitalen Arbeitsblätter mit hübscher Kulisse sein. Jede Welt soll sich wie ein kleines, eigenständiges Indie-Adventure anfühlen: erkunden, steuern, ausprobieren, Werkzeuge benutzen, Dinge entdecken, kleine Überraschungen erleben und dabei regelmäßig echten Lernfortschritt nachweisen.

Kernversprechen:

> **Die Lehrkraft gibt Lernziel und Rahmen vor. GradeCrew verwandelt das in ein echtes Adventure – ohne dass 30 Schüler dieselben konkreten Aufgaben oder denselben Endcode erhalten müssen.**

## Zielmix: Spielen, Lernen, Rätsel

Für typische Escape-Runs von ca. 15–25 Minuten gilt als Zielkorridor:

- **30–35 % Lernen**: echte Fachaufgaben, Transfer und kurze Lernhilfe;
- **45–55 % Spielen/Erkunden**: Bewegung, Werkzeuge, Fahrzeuge, Entdecken, Interaktionen, kleine Action;
- **15–20 % Rätsel/Story**: Codes, Logik, Storybeats, Überraschungen und Übergänge.

Das ist kein starres Zeitschema pro Minute. Es ist eine Designregel für den Gesamteindruck: Das Spiel muss sich zuerst wie ein gutes Adventure anfühlen und darf Lernen nicht verstecken oder verwässern. Lernen soll regelmäßig relevant sein, aber nicht permanent den Spielfluss unterbrechen.

## Highlight-Anspruch

Ein GradeCrew Escape soll nicht nur „funktionieren“. Es soll für Schüler ein **Highlight** sein, das sie freiwillig gerne spielen.

Dafür gelten zusätzlich:

- starke visuelle Identität pro Welt statt generischer Canvas-Flächen;
- erkennbare Tiefe durch Layer, Schatten, Licht, Animationen, Partikel und Umgebungsbewegung;
- charakteristische Soundkulisse/Musik, abschaltbar;
- kurze, flüssige Übergänge statt harter UI-Sprünge;
- sichtbare Reaktionen auf Aktionen: Fahrzeuge, Werkzeuge, Tiere, Maschinen und Umgebung müssen lebendig wirken;
- möglichst wenig lange Textboxen; Story wird bevorzugt über Szene, Animation, Icons und kurze Dialoge erzählt;
- mindestens mehrere echte Wow-Momente pro längerer Welt, nicht nur ein finales Popup;
- Mechaniken werden nicht nur „abgehakt“, sondern bekommen gutes Game-Feel: Feedback, Timing, Kamera, Sound und kleine Überraschungen;
- jedes Level braucht einen eigenen visuellen oder spielerischen Höhepunkt.

Produktregel: **Technisch korrekt ist nur die Untergrenze. Ziel ist „das will ich nochmal spielen“.**

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

## Sprache und Bedienung

Produktregel: **Komplexes Spiel, einfache Bedienung und einfache Sprache.**

- kurze Sätze;
- eine Handlungsaufforderung pro Schritt;
- UI und Story standardmäßig deutlich einfacher als Lehrermaterial formulieren;
- Niveau/Lesestufe später an Klasse und Lerngruppe anpassen;
- Icons, Animationen und Szene erklären möglichst viel ohne Text;
- Schwierigkeit entsteht aus Lernen, Rätsel und Mechanik – nicht aus dem Verstehen der Oberfläche.

## KI- und Kostenprinzip

Beim Spielen laufen fertige Mechaniken lokal/deterministisch. Jeep, Magnetkran, Kamera, Boot, Licht, Inventar, Physik/Kollision, Räume, Animationen, Sounds, Codes und Seed-Varianten benötigen keine KI pro Nutzung.

KI wird gezielt eingesetzt für Lernaufgabenfamilien, Hinweise/Erklärungen/Transferaufgaben, neue individuelle Verständnisfragen und optional Story-/Autorenvorschläge. Ausführbare Spiellogik bleibt geprüfter Code.

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
2. starke eigene visuelle Identität;
3. mindestens 2–3 charakteristische Mechaniken oder deutlich neue Kombinationen;
4. mehrere Wechsel zwischen Lernen, Erkunden und Spielmechanik;
5. mehrere erinnerungswürdige Momente, die kein Lernformular sind;
6. komplette Lösbarkeit per automatischem Preflight plus Spieltest;
7. Touch/PC-Bedienbarkeit;
8. individuelle Lernvarianten ohne Niveauverschiebung;
9. Schülertexte auf Zielniveau und trotzdem grundsätzlich kurz/einfach;
10. visuelles und akustisches Polish, sodass sich die Welt wie ein kleines Spiel und nicht wie ein Prototyp anfühlt.

## Autoren-/Contentmodell später

Langfristig soll eine Escape-Welt deklarativ beschrieben werden können: Szenen, erlaubte Mechaniken, Objekt-/Hotspotkonfiguration, Storybeats, Lernslots, Voraussetzungen/Belohnungen, Variantengruppen, Übergänge und finale Bedingungen.

Die KI darf validierte Inhaltsfelder befüllen. Die Engine und Mechaniken selbst bleiben geprüfter Code.

## Referenzprototyp

`Expedition Amazonas – Die verschwundene Forschungsstation` testet bewusst mehrere Mechaniken in einem zusammenhängenden Adventure: Expeditionscamp/Jeep, Dschungelpfad/Seilwinde, Wildtierzone/Kamera, Fluss/Boot, Forschungsstation/Generator und Funkmast/Finale.

Der Prototyp beweist zuerst Mechanikvielfalt. Danach folgen Stabilität, Schüler-Sprache und ein deutlicher Visual-/Game-Feel-Pass, bevor daraus die Qualitätsreferenz für weitere Welten wird.
