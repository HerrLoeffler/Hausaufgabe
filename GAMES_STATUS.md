# GradeCrew Games – aktueller Arbeitsstand

Stand: 02.10.2026. Diese Datei beschreibt die Spiele, den gemeinsamen Lab-Hub und die neue Games-Design-System-Schicht.

## Zuerst lesen

1. Diese Datei.
2. `docs/games/GAMES_DESIGN_SYSTEM.md`.
3. `lab/games-hub/README.md`.
4. `lab/shared/games-catalog.js`.
5. Aktuellen Branch, Commit, offene PRs und neuere Remote-Commits prüfen.

## Branch- und Integrationsstand

| Feld | Wert |
| --- | --- |
| Repository | HerrLoeffler/Hausaufgabe |
| Games-Struktur-Basis | `lab/games-structure` @ `869ca416b868667c9e48c05f81c967fe6ad59020` |
| Design-System-Arbeitsbranch | `lab/games-design-system` |
| Design-System-PR | Draft PR #28: `lab/games-design-system` -> `lab/games-structure` |
| Struktur-PR | Draft PR #2: `lab/games-structure` -> `lab/vocab-rush` |
| Produktweites Design-System | separater Branch `feature/shared-gradecrew-design-system`; wird **wiederverwendet**, nicht dupliziert |
| Lab-Projekt | `hausaufgabe-staging` |
| Preview-Channel der Games-Struktur | `gradecrew-games-structure` |
| bestätigte Foundation-CI | Run `36978947373` / Games Lab Checks #88: Build + 23 DOM-/Regressionstests + Chromium-Smokes grün |
| Production | unverändert |

Der ältere Branch `lab/games-hub` ist nicht mehr die Strukturquelle. `lab/games-structure` besitzt Hub/Katalog/Navigation/Tests. `lab/games-design-system` baut ausschließlich auf diesem Stand auf.

## Vorhandene Spiele

| Spiel | Frontend | Backend-Codebase | API |
| --- | --- | --- | --- |
| Fast Quiz | `lab/fast-quiz/` | `fastquiz` | `fastQuizApi` |
| Fehlerjagd Deutsch | `lab/fehlerjagd-deutsch/` | `fehlerjagd` | `fehlerjagdApi` |
| Vocab Rush | `lab/vocab-rush/` | `vocabrush` | `vocabRushApi` |

Alle drei bieten Üben, All-Time-Highscore und Live mit Lehrkraft. Die vorhandenen Live-Systeme nutzen QR-Code, 6-stelligen Code und bis zu 30 Teilnehmende. Fachliche Inhalte, Wertung, Aufgabenengines und gespeicherte Vokabelsets bleiben in ihren jeweiligen Spielmodulen.

## Games Design System – Foundation v0.1.0

### Ziel

Eine gemeinsame UX-/Komponentenschicht für alle Games, ohne ein zweites GradeCrew-Marken-/Token-System zu erzeugen.

Source-of-truth:

1. produktweites GradeCrew Shared Design System für Farben, Spacing, Radien, Typografie und Assets;
2. Games Design System für Spiel-UX, Komponenten, Status und Setup-Hierarchie;
3. Einzelspiel nur für Fachlogik und notwendige Spezialfälle.

### Auf GitHub umgesetzt

- verbindliche Spezifikation: `docs/games/GAMES_DESIGN_SYSTEM.md`
- gemeinsame CSS-Komponenten: `lab/shared/games-design-system.css`
- opt-in JS-Helfer: `lab/shared/games-design-system.js`
- Living Preview: `lab/games-system/`
- bestehende `game-shell.css` verwendet Games-/GradeCrew-Tokens statt eigener harter Layoutwerte
- Hub-Build liefert die Games-Schicht einmal unter `/shared/` aus
- Hub-Build injiziert dieselbe CSS-/JS-Schicht in alle drei **kanonischen** Einzelspiel-Builds
- Living Preview wird im isolierten Hub-Build unter `/design-system/` ausgeliefert
- Child-Manifeste speichern `gamesDesignSystemVersion: 0.1.0`
- Root-Manifest markiert `sharedGamesDesignSystem` und `designSystemPreview`
- neue DOM-/Komponenten-Regressionstests
- neue responsive Chromium-Prüfung der Living Preview
- Games-CI auf `lab/games-design-system` erweitert
- Draft PR #28 als eigene Integrationsgrenze eröffnet

### Automatisch verifiziert

GitHub Actions Run `36978947373` / Games Lab Checks #88 ist vollständig grün:

- isolierter Games-Hub-Build erfolgreich
- 23/23 DOM-/Regressionstests erfolgreich
- bestehender Chromium-Smoke: Desktop/Tablet/Handy, Hub, alle neun Kombinationen aus 3 Spielen × 3 Modi, Practice-Start, zentraler Join, QR-Priorität, Leave-Dialog und Favoriten erfolgreich
- Games-Design-System-Chromium-Smoke: Desktop/Tablet/Handy, Auswahlkarten, Disclosure, Versionsmarker und kein horizontaler Overflow erfolgreich
- Backends und externe QR-Bibliothek werden im Browser-Smoke bewusst gemockt; dies ist daher **keine** neue echte Backend-Abnahme

### Noch nicht als erledigt behaupten

- Cloud-Shell-`--check` für diesen neuen Branch wurde in dieser Chat-Arbeitsrunde noch nicht vom Nutzer ausgeführt.
- Living Preview wurde noch nicht auf den isolierten Firebase-Preview-Channel aus diesem Branch deployed und vom Nutzer visuell auf realen Geräten abgenommen.
- Fast Quiz verwendet die neuen `gcg-*`-Komponenten noch nicht als vollständigen Setup-Refactor; Foundation und gemeinsame Shell sind der erste Schritt.
- Fehlerjagd und Vocab Rush sind noch nicht auf die neue progressive Setup-Struktur migriert.
- keine neue echte Staging-Backend-Abnahme durch diese Design-System-Arbeit.
- kein Production-Deploy.

## Verbindliche UX-Regeln

- normale Runde: höchstens 3–4 Primärentscheidungen vor Start
- seltene Regeln unter **Weitere Einstellungen**
- Üben / Highscore / Live = Spielmodus; fachliche Lernform ist eine getrennte Ebene
- Highscore nur für sinnvoll vergleichbare Aufgaben
- Live: Lehrkraft konfiguriert; Schüler nur Code/QR + Name/Kürzel
- Status nie ausschließlich über Farbe
- Touch-Ziele mindestens 44 px
- kein Big-Bang-Redesign; Einzelspiele schrittweise migrieren

## Geplante fachliche Referenzpfade

### Fast Quiz

- **Kopfrechnen** – ausschließlich mental angemessene Aufgaben
- **Runden** – eigene klare Stellenwert-/Rundungslogik
- **Mit Block & Stift** – bewusst komplexere Rechnungen, standardmäßig ohne aggressiven Zeitbonus

### Fehlerjagd Deutsch

- **Blitzrunde** – kurze, geschwindigkeitsgeeignete Aufgaben
- **Genau prüfen** – längere Analyse-/Begründungsaufgaben

### Vocab Rush

- **Erkennen**
- **Abrufen**
- **Schreiben**
- **Gemischt**

`Nach Fehler richtig schreiben` bleibt eine Lernhilfe und ist nicht dasselbe wie der Schreibmodus.

## Vorheriger Strukturstand – weiterhin gültig

- gemeinsamer Spiele-Katalog
- Fachfilter, Suche, Favoriten und direkte Modi im Hub
- zentraler Code-Beitritt
- gemeinsame Navigation in allen drei Spielen
- vollständige kanonische Einzel-Builds inklusive Deutsch-Feedback und Vokabelimport
- isolierter Preview-Channel
- vorhandene Struktur-/Browserprüfungen

## Verbindliche Arbeitsregeln

- Production nur nach ausdrücklicher Freigabe.
- Lab -> bewerten -> Feature/Lab-Branch -> integrieren -> Staging -> abnehmen -> Production.
- Keine parallele zweite Games-Design-System-Lösung anfangen.
- Vor Arbeit `feature/shared-gradecrew-design-system`, `lab/games-structure`, offene Games-PRs und diese Datei prüfen.
- Keine gemeinsame Bestenliste für fachlich/zeitlich nicht vergleichbare Aufgaben.
- Backend-/Collection-Verträge nicht für reine UI-Arbeit ändern.
- Kanonische Einzelspiel-Builds erhalten; Hub setzt sie zusammen.
- Änderungen immer unterscheiden: GitHub-Code, Check/CI, Preview-Deploy, Gerätetest, Production.

## Nächste fünf Aufgaben

1. **Foundation im Preview ansehen:** Branch lokal/Cloud Shell prüfen, isolierten Preview-Channel deployen und `/design-system/` öffnen.
2. **Living Preview manuell abnehmen:** Desktop, iPad/Tablet, Handy; Fokus, Touch, Lesbarkeit und echte Bedienung prüfen.
3. **Fast Quiz als Referenz auf eigenem Folgebranch migrieren:** Kopfrechnen / Runden / Block & Stift, Presets, Rundenzusammenfassung, `Weitere Einstellungen`; bestehende Optionen erhalten.
4. **Fast-Quiz-Fachlogik trennen:** Kopfrechen-Generator mit mentalen Grenzen; schriftliche/komplexe Aufgaben in Block-&-Stift-Profil; Highscores nach Vergleichbarkeit trennen.
5. **Muster übertragen:** nach Fast-Quiz-Abnahme Fehlerjagd (Blitz/Genau) und Vocab Rush (Erkennen/Abrufen/Schreiben/Gemischt) schrittweise auf dieselben Komponenten migrieren.

Neue Spiele sollten erst nach dieser Referenzmigration dieselben Komponentenverträge übernehmen.
