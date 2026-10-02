# GradeCrew Games Design System

Status: Foundation v0.1 · Branch `lab/games-design-system`

## Zweck

Das GradeCrew Games Design System ist die gemeinsame UX- und Komponentenebene für alle GradeCrew-Lernspiele. Es ersetzt **nicht** das produktweite GradeCrew Shared Design System, sondern baut darauf auf.

Source-of-truth-Hierarchie:

1. `shared/gradecrew-design/` – produktweite Farben, Abstände, Radien, Typografie und Assets.
2. `lab/shared/games-design-system.css|js` – spielespezifische Komponenten, Zustände und Interaktionsmuster.
3. Einzelspiel – nur fachliche Inhalte, Aufgabenengine und notwendige Spezialfälle.

Neue dauerhafte Markenfarben, Radius-Skalen oder Spacing-Konstanten dürfen nicht in einem Spiel erfunden werden. Solange die produktweiten Tokens auf diesem Lab-Branch noch nicht integriert sind, verwendet die Games-Schicht kompatible `var(--gc-…, fallback)`-Aliase. Nach Integration des Shared Design Systems greifen dieselben Komponenten automatisch auf dessen Tokens zu.

## Produktprinzipien

### 1. Schnell starten, tief anpassen

Eine normale Runde soll höchstens drei bis vier Entscheidungen vor dem Start verlangen. Seltene Regeln gehören unter **Weitere Einstellungen**.

Standardpfad:

1. Inhalt / Lernziel
2. Spielweise
3. Dauer
4. Start

Erweiterte Einstellungen dürfen verfügbar bleiben, aber nicht die Primärentscheidung dominieren.

### 2. Inhalt und Wettkampf sind getrennte Ebenen

`Üben`, `Highscore` und `Live` beschreiben den **Spielmodus**. Fachliche Varianten wie `Kopfrechnen`, `Runden`, `Blitzrunde` oder `Schreiben` beschreiben die **Lern-/Bearbeitungsform**. Beides darf nicht vermischt benannt werden.

### 3. Aufgaben müssen zum Bearbeitungsprofil passen

Gemeinsame interne Profile:

| Profil | Zweck | typische Zeit | Zeitbonus |
| --- | --- | --- | --- |
| `fast` | automatisieren / abrufen | ca. 3–15 s | sinnvoll |
| `learn` | üben + Fehler verstehen | ca. 10–30 s | optional |
| `deep` | analysieren / schriftlich rechnen | ca. 30–120 s | standardmäßig aus |

Benutzer sehen fachlich passende Namen statt dieser internen Begriffe.

Beispiele:

- Fast Quiz: **Kopfrechnen** (`fast`), **Runden** (`fast/learn`), **Mit Block & Stift** (`deep`)
- Fehlerjagd: **Blitzrunde** (`fast`), **Genau prüfen** (`learn/deep`)
- Vocab Rush: **Erkennen** (`fast`), **Abrufen** (`learn`), **Schreiben** (`learn/deep`)

### 4. Highscore verlangt Vergleichbarkeit

Aufgaben mit deutlich unterschiedlicher typischer Bearbeitungszeit oder Hilfsmittelbedarf gehören nicht in dieselbe Bestenliste. Highscore-Boards müssen mindestens nach fachlichem Inhalt/Bearbeitungsprofil getrennt werden, wenn sonst die Vergleichbarkeit leidet.

### 5. Live ist Lehrer-Schnellstart

Lehrkraft: Inhalt → sinnvolles Preset → QR/Code. Schüler: Code/QR → Name/Kürzel → bereit. Schüler konfigurieren die Lehrerrunde nicht.

### 6. Lernmodus und Wettkampfmodus unterscheiden sich bewusst

Lernorientierte Runde:

- Erklärung nach Fehler
- Wiederholung / Transfer möglich
- kein unnötiger Geschwindigkeitsdruck

Wettkampforientierte Runde:

- feste vergleichbare Regeln
- Geschwindigkeit darf zählen
- längere Erklärungen erst nach Aufgabe/Runde

## Informationsarchitektur

### Startseite eines Spiels

Immer dieselbe Reihenfolge:

1. Spielname + ein Satz Zweck
2. drei Moduskarten: Üben · Highscore · Live
3. Live-Beitritt für Schüler

Keine Fachkonfiguration auf der Startseite.

### Setup

Primär sichtbar:

- **Inhalt**
- **Spielweise**
- **Dauer**
- kompakte Rundenzusammenfassung
- primärer Start-Button

Sekundär unter `<details>` / **Weitere Einstellungen**:

- Punkte / Minuspunkte
- Sperrzeit
- Zeit-/Serienbonus
- Sichtbarkeit der Bestenliste
- Lösung/Erklärung nach Fehler
- sonstige seltene Regeln

### Zusammenfassung

Vor Start muss ein kurzer natürlicher Satz oder eine kompakte Chip-Zeile sichtbar sein, z. B.:

`Kopfrechnen · × ÷ · Standard · 3 Minuten`

Sie ist Anzeige, keine zweite Konfigurationsfläche.

## Komponentenvertrag

Gemeinsame Klassen beginnen mit `gcg-`.

### Layout

- `.gcg-shell` – Inhaltsbreite und Seitenabstand
- `.gcg-stack` – vertikaler Rhythmus
- `.gcg-grid` – responsive Raster
- `.gcg-section` – Inhaltsabschnitt

### Oberflächen

- `.gcg-card` – Standardkarte
- `.gcg-card--quiet` – ruhige sekundäre Fläche
- `.gcg-summary` – Rundenzusammenfassung

### Aktionen

- `.gcg-button` + `--primary|--secondary|--ghost|--danger`
- Mindestzielgröße 44 px
- sichtbarer `:focus-visible`
- Disabled-Zustand nicht nur über Farbe

### Auswahl

- `.gcg-choice-grid`
- `.gcg-choice`
- `.gcg-choice__icon`, `__title`, `__hint`
- ausgewählter Zustand via `data-selected="true"` oder nativer Form-State

### Modi

- `.gcg-mode-grid`
- `.gcg-mode-card`
- Moduskarten enthalten: Nummer/Audience optional, Titel, kurze Erklärung, Meta, Aktion

### Setup

- `.gcg-setup`
- `.gcg-setup-main`
- `.gcg-setup-aside`
- `.gcg-step`
- `.gcg-advanced`

### Gameplay

- `.gcg-gamebar`
- `.gcg-stats`
- `.gcg-task-card`
- `.gcg-answer-grid`
- `.gcg-feedback[data-state="correct|wrong|info"]`

### Live

- `.gcg-room-code`
- `.gcg-lobby`
- `.gcg-scoreboard`
- `.gcg-status[data-state="waiting|running|finished|error"]`

## Zustände

Status darf nie ausschließlich über Farbe vermittelt werden. Jeder relevante Zustand braucht Text, Symbol oder Struktur.

Verbindliche semantische Zustände:

- neutral
- selected
- correct
- wrong
- warning
- disabled
- loading
- waiting
- running
- finished
- error

## Responsive Regeln

- Desktop: maximal ca. produktweites `contentMax`; Setup darf zweispaltig sein.
- Tablet: wichtige Entscheidungen bleiben ohne horizontales Scrollen erreichbar.
- Handy: eine Spalte; Sticky-/Floating-Elemente dürfen keine Hauptaktion verdecken.
- Touch-Ziele mindestens 44 px.
- Dialoge verwenden `min(… , calc(100vw - 32px))` und bleiben vertikal scrollbar.

## Accessibility

- native Controls bevorzugen
- `label` für Eingaben
- sichtbarer Fokus
- keine Information nur durch Farbe
- `aria-live` für spielrelevantes Feedback, aber keine dauernden Score-Ansagen
- `prefers-reduced-motion` respektieren
- Keyboard 1–4 nur als Zusatz, nie als einzige Eingabe

## Textregeln

- kurze natürliche Verben: **Starten**, **Auswählen**, **Ändern**, **Beitreten**
- kein Entwicklerjargon wie `Domain`, `Engine`, `Config`
- Labels erklären die Entscheidung; Hilfetext erklärt nur Folgen
- maximal ein primärer Button pro Entscheidungsebene

## Fachliche Referenzstruktur

### Fast Quiz

Primärpfade:

- Kopfrechnen
- Runden
- Mit Block & Stift

Kopfrechnen darf nur mental angemessene Aufgaben erzeugen. Komplexe Dezimal-/Bruchrechnungen gehören in Block & Stift.

### Fehlerjagd Deutsch

Primärpfade:

- Blitzrunde
- Genau prüfen

Die vollständige Kompetenzliste bleibt unter Themen anpassen erreichbar.

### Vocab Rush

Primärpfade:

- Erkennen
- Abrufen
- Schreiben
- Gemischt

`Nach Fehler richtig schreiben` bleibt eine Lernhilfe und ist getrennt vom eigentlichen Schreibmodus.

## Technische Regeln

- gemeinsame Styles/Helpers werden im Games-Hub-Build einmal unter `/shared/` ausgeliefert
- Einzelspiel-Builds bleiben kanonisch und werden nicht kopiert/forked
- Hub-Injektion darf Aufgabenengine und Backendvertrag nicht verändern
- neue Games-Komponenten sind opt-in über `gcg-*`; keine globalen Wildcard-Overrides
- bestehende Spielklassen werden schrittweise migriert; kein Big-Bang-Redesign
- `data-gcg-version` am Dokument markiert die aktive Games-System-Version

## Migration

### Phase 1 – Foundation

- Spezifikation
- gemeinsame CSS-/JS-Schicht
- Living Preview / Komponentenprüfung
- Build- und Regression-Gates

### Phase 2 – Fast Quiz als Referenz

- Setup auf progressive Offenlegung umstellen
- Kopfrechnen/Runden/Block-&-Stift als klare Primärpfade
- sinnvolle Presets und Zusammenfassung
- bestehende erweiterten Regeln erhalten

### Phase 3 – Fehlerjagd

- Blitz/Genau-prüfen
- Kompetenzen hinter Themen anpassen
- Lern-/Wettkampfregeln angleichen

### Phase 4 – Vocab Rush

- Erkennen/Abrufen/Schreiben/Gemischt
- Themen-/Set-Auswahl weiter vereinfachen
- Grammar-Rush-Abgrenzung vorbereiten

## Nicht in Phase 1

- keine Backendmigration
- keine neue gemeinsame Highscore-Datenbank
- keine Production-Änderung
- keine Entfernung bestehender Spieloptionen
- keine automatische fachliche Neuklassifizierung ohne Tests

## Abnahme

Eine Games-Design-System-Version gilt erst als verifiziert, wenn:

1. Build erfolgreich ist.
2. alle drei kanonischen Spiel-Builds weiter enthalten sind.
3. Regressionstests grün sind.
4. Desktop/Tablet/Handy keinen horizontalen Überlauf zeigen.
5. Tastaturfokus sichtbar ist.
6. Start, Highscore-Einstieg, Live-Einstieg und Code-Beitritt je Spiel weiterhin funktionieren.
7. echte Staging-Backend-Tests separat dokumentiert sind, bevor ein Stand als backend-verifiziert bezeichnet wird.
