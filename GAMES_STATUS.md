# GradeCrew Games – aktueller Arbeitsstand

Stand: 01.10.2026. Diese Datei beschreibt die Spiele und ihren gemeinsamen Lab-Hub.

## Zuerst lesen

1. Diese Datei.
2. [lab/games-hub/README.md](lab/games-hub/README.md).
3. [lab/shared/games-catalog.js](lab/shared/games-catalog.js).
4. Bei Escape-Arbeit zusätzlich [workstreams/escape-room-mvp.md](workstreams/escape-room-mvp.md).
5. Den aktuellen Branch, letzten Commit und eventuell neuere Remote-Commits prüfen.

## Aktiver Stand

| Feld | Wert |
| --- | --- |
| Repository | HerrLoeffler/Hausaufgabe |
| Struktur-Basis | lab/games-structure |
| Escape-Feature-Branch | feature/escape-room-mvp-v1 |
| Escape-Draft-PR | #10 gegen lab/games-structure |
| Lab-Projekt | hausaufgabe-staging |
| Games Dev Channel | gradecrew-games-dev |
| Games Integrated Preview Channel | gradecrew-games-preview |
| Veröffentlichung Escape | Deploy vorbereitet, aktuell durch fehlendes GitHub-Firebase-Servicekonto blockiert |
| Hauptprodukt / Secure / Lehrer-App | Eigene Arbeitszweige; noch keine Escape-Integration in das Hauptprodukt |

Der ältere Branch `lab/games-hub` enthält einen früheren Stand. `lab/games-structure` ist die verifizierte Struktur-Basis. Der Escape-Room-MVP wird separat auf `feature/escape-room-mvp-v1` entwickelt und ist noch nicht in die Struktur-Basis gemergt.

## Link- und Preview-Strategie

Es gibt bewusst nur **zwei feste Games-Ebenen**:

1. **Games Dev** (`gradecrew-games-dev`): aktueller Entwicklungsstand. Darf sich schnell ändern und dient für neue Spiele/Features vor Integration.
2. **Games Integrated Preview** (`gradecrew-games-preview`): gemeinsamer geprüfter Stand auf `lab/games-structure`. Nur integrierte Änderungen gehören hierhin.

Einzelne Spiele bekommen **keine eigenen dauerhaften Domains**, sondern stabile Unterpfade innerhalb des Hubs, z. B. `/escape-room/`, `/fast-quiz/`, `/fehlerjagd-deutsch/`, `/vocab-rush/`.

Für echte parallele Entwicklung können später zusätzliche PR-Preview-Channels automatisch erzeugt werden. Diese sind temporär und werden nicht als dauerhafte Projektlinks geführt.

Die Workflows `.github/workflows/games-dev-preview.yml` und `.github/workflows/games-integrated-preview.yml` bauen und testen vor jedem Deploy. Beide verwenden ausschließlich Firebase Hosting Preview Channels im Projekt `hausaufgabe-staging`; Production wird nicht angesprochen.

### Aktueller Deploy-Blocker

Der erste automatische Dev-Deploy auf Workflow-Run `36925726692` hat Build und alle 23 Struktur-/Escape-Tests erfolgreich abgeschlossen. Der eigentliche Firebase-Deploy wurde ausschließlich deshalb abgebrochen, weil das Repository-Secret `FIREBASE_SERVICE_ACCOUNT_HAUSAUFGABE_STAGING` noch nicht eingerichtet ist. Es wurde nichts veröffentlicht und Production nicht verändert.

Einmalige Einrichtung: Firebase Hosting GitHub-Integration bzw. ein Hosting-Servicekonto mit diesem Secret-Namen einrichten. Danach kann derselbe Workflow den Dev-Channel automatisch aktualisieren.

## Vorhandene Spiele

| Spiel | Frontend | Backend-Codebase / Status | Modi |
| --- | --- | --- | --- |
| Fast Quiz | lab/fast-quiz/ | fastquiz / fastQuizApi | Üben, Highscore, Live |
| Fehlerjagd Deutsch | lab/fehlerjagd-deutsch/ | fehlerjagd / fehlerjagdApi | Üben, Highscore, Live |
| Vocab Rush | lab/vocab-rush/ | vocabrush / vocabRushApi | Üben, Highscore, Live |
| Escape Room – Die verriegelte Schule | lab/escape-room/ | reiner Lab-MVP, noch kein Backend | **nur Üben** |

Die drei bisherigen Spiele behalten ihre vorhandenen Live-Systeme mit QR-Code, 6-stelligem Code und bis zu 30 Teilnehmenden. Der Escape-Room-MVP wird bewusst **nicht** in Rundencode, Highscore oder Live angeboten.

## Gemeinsamer Games Hub

- Ein Spiele-Katalog steuert Hub, Navigation und Build.
- Spielauswahl mit Fachfiltern, Suche und Favoriten.
- Zentraler Code-Beitritt listet ausschließlich live-fähige Spiele; Escape Room erscheint dort nicht.
- Gemeinsame Navigation innerhalb der Spiele.
- Verweise und Prüfsummen werden im Build kontrolliert; Spiel-Manifeste nach Einbau der Navigation aktualisiert.
- Das Lab-Deploy-Skript kennt inzwischen alle vier Frontends und prüft auch Escape-App, Datenvertrag und Buildskript per Syntaxcheck.

## Escape Room MVP – „Die verriegelte Schule“

Implementiert auf `feature/escape-room-mvp-v1`:

- 3 Räume + Finale
- 8 austauschbare Lernfragen
- 4 deterministische Minirätsel
- Inventarinteraktion, Hinweise, aktive Spielzeit und lokales Fortsetzen
- kein Dead-End nach drei falschen Lernantworten
- automatischer Preflight der Welt-/Fragedefinition
- Lehrer-Vorschau mit vollständiger Route, Fragen und Lösungen ohne Durchspielen
- lokale Event-Hooks, aber **kein Analytics-Upload**
- Integration in den Hub ausschließlich als Practice-/Üben-Spiel

Die aktuelle Lehrer-Vorschau ist ein Lab-UI-Prototyp und noch **nicht authentifiziert**. Bei echter GradeCrew-Integration müssen Lösungen und Lehrerdaten geschützt werden.

## Verifiziert

### Struktur-Basis mit drei bisherigen Spielen

- vorhandene DOM-, Navigations-, Build- und Manifestprüfungen bestanden
- Chromium-Browserprüfung auf Desktop, Tablet und Handy
- neun Kombinationen aus den drei bisherigen Spielen und ihren drei Modi geprüft
- QR-/Code-Einstiege und Favoriten geprüft

### Escape Feature-Branch

- isolierter Escape-Build erfolgreich
- 23 Node/jsdom-Prüfungen grün auf integriertem Code-Stand
- vollständiger automatisierter Escape-Lösungsweg inklusive absichtlich drei falschen Antworten geprüft
- Save/Resume geprüft
- erster Chromium-Integrationslauf fand einen echten Visibility-Bug; dieser wurde in `9dd0849` behoben
- vollständiger Folgelauf auf Code-Commit `664f605`: **grün**, Workflow-Run `36924444942`
- bestehende neun Browser-Flows blieben grün; zusätzlich Escape `practice` erfolgreich geprüft
- Dev-Deploy-Vorbereitung auf `fc245e9`: Build und 23 Tests grün; Deployment nur wegen fehlendem Firebase-Servicekonto nicht ausgeführt

**Prüfgrenze:** Serverantworten und die externe QR-Bibliothek der bestehenden Live-Spiele sind in der Browserprüfung simuliert. Escape besitzt noch keinen Backend-/KI-/Klassenanschluss. Es gab in dieser Arbeitsrunde noch keinen echten iPad-/Handy-Gerätetest und noch keinen erfolgreichen Escape-Preview-Deploy.

## Verbindliche Arbeitsregeln

- Live bleibt bei verifizierten Releases. Lab → bewerten → Feature-Branch → integrieren → Staging → abnehmen → Live.
- Verifizierte Spiele-Branches und Produktions-Tags als Referenz erhalten.
- Games Dev darf experimentell sein; Games Integrated Preview nur aus dem geprüften Struktur-Branch aktualisieren.
- Production niemals aus einem Games-Preview-Workflow deployen.
- Keine gemeinsame Bestenliste für Spiele mit unterschiedlicher Wertung.
- Ein Rundencode ist einem konkreten live-fähigen Spiel zugeordnet.
- Favoriten sind lokal im Browser; noch nicht an einen GradeCrew-Account gebunden.
- Collections und Functions-Codebases nicht für reine Oberflächenänderungen umstellen.
- Für Escape keine frei von KI erfundene ausführbare Spiellogik: KI liefert später ausschließlich validierte Inhalts-/Fragedaten an die deterministische Engine.
- Neue Chats lesen den aktuellen Branch und aktualisieren diese Datei bzw. den zuständigen Workstream.

## Nächste Aufgaben

1. **Einmalige Firebase-GitHub-Authentifizierung:** Servicekonto/Secret `FIREBASE_SERVICE_ACCOUNT_HAUSAUFGABE_STAGING` einrichten und Dev-Workflow erneut ausführen.
2. **Escape Lab-Abnahme:** erfolgreichen Games-Dev-Link auf echtem Desktop/iPad testen.
3. **Integration:** nach Abnahme PR #10 in `lab/games-structure` integrieren; dadurch später `gradecrew-games-preview` aktualisieren.
4. **GradeCrew-Frageadapter:** vorhandene Tests und KI-generierte Fragen auf die validierten Escape-Frage-Slots abbilden.
5. **Lehrer-Integration:** Preview und Lösungen an echte Lehrer-Auth/Berechtigungen binden.
6. **Telemetry-Vertrag:** lokale Escape-Events erst nach festgelegtem Collector-/Privacy-Vertrag serverseitig erfassen.
7. **Welt 2:** „Das verschwundene Prüfungsblatt“ erst auf dem stabilen gemeinsamen Escape-Kern aufbauen.
