# GradeCrew Games – aktueller Arbeitsstand

Stand: 30.09.2026. Diese Datei beschreibt die Spiele und ihren gemeinsamen Lab-Hub.

## Zuerst lesen

1. Diese Datei.
2. [lab/games-hub/README.md](lab/games-hub/README.md).
3. [lab/shared/games-catalog.js](lab/shared/games-catalog.js).
4. Den aktuellen Branch, letzten Commit und eventuell neuere Remote-Commits prüfen.

## Aktiver Stand

| Feld | Wert |
| --- | --- |
| Repository | HerrLoeffler/Hausaufgabe |
| Struktur-Branch | lab/games-structure |
| Ausgangsbranch | lab/vocab-rush |
| Ausgangscommit | 4e739100d8a0e8c9be08d11b7bc96ddf86f3b141 |
| Lab-Projekt | hausaufgabe-staging |
| Neuer Preview-Channel | gradecrew-games-structure |
| Veröffentlichung | Vorbereitet; noch kein Deployment aus dieser Arbeitsrunde |
| Hauptprodukt / Secure / Lehrer-App | Eigene Arbeitszweige; keine Integration durch diesen Spiele-Branch |

Der ältere Branch lab/games-hub enthält einen früheren Stand. lab/vocab-rush enthält bereits alle drei Spiele, Rundungsaufgaben, Vokabelbibliothek, Import und Lern-Ergänzungen. Er ist deshalb die Grundlage dieses Struktur-Branches.

## Vorhandene Spiele

| Spiel | Frontend | Backend-Codebase | API |
| --- | --- | --- | --- |
| Fast Quiz | lab/fast-quiz/ | fastquiz | fastQuizApi |
| Fehlerjagd Deutsch | lab/fehlerjagd-deutsch/ | fehlerjagd | fehlerjagdApi |
| Vocab Rush | lab/vocab-rush/ | vocabrush | vocabRushApi |

Alle drei bieten Üben, All-Time-Highscore und Live mit Lehrkraft. Die vorhandenen Live-Systeme nutzen QR-Code, 6-stelligen Code und bis zu 30 Teilnehmende. Fachliche Inhalte, Wertung, Aufgabenengines und gespeicherte Vokabelsets bleiben in ihren jeweiligen Spielmodulen.

## In dieser Arbeitsrunde umgesetzt

- Ein Spiele-Katalog für Hub, Navigation und Build.
- Spielauswahl mit Fachfiltern, Suche, Favoriten und direkten Einstiegen in die drei Modi.
- Zentraler Code-Beitritt mit Spielauswahl.
- Gemeinsame Navigation innerhalb aller drei Spiele.
- Hub verwendet die vollständigen Einzel-Builds inklusive Deutsch-Feedback und Vokabelimport.
- Verweise und Prüfsummen werden im Build kontrolliert; Spiel-Manifeste nach dem Einbau der Navigation aktualisiert.
- Eigener neuer Preview-Channel für diesen Strukturstand.
- Übergabe, Cloud-Shell-Einstieg mit Node 22 und automatische Prüfungen.

## Verifiziert

- 18 automatisierte DOM-, Navigations-, Build- und Manifestprüfungen bestanden.
- Chromium-Browserprüfung: Desktop (1440 px), Tablet (768 px), Handy (390 px); kein horizontaler Überlauf im Hub.
- Alle neun Kombinationen aus Spiel und Modus öffnen die richtige Ansicht.
- Übungsrunden lassen sich in allen drei Spielen tatsächlich starten.
- Code-Beitritt erhält führende Nullen; QR-Beitrittslinks haben Vorrang vor Modusparametern.
- Navigation, Verlassen/Abbrechen, Favoriten nach Neuladen und Einstieg ohne JavaScript geprüft.
- Spielprogramme und Aufgabenengines stimmen im Hub bytegenau mit ihren Quellen überein.

**Prüfgrenze:** Serverantworten und die externe QR-Bibliothek waren in der Browserprüfung simuliert. Es wurden keine echten Räume, Highscores oder KI-Aufträge angelegt. Ein neuer Test mit 30 echten Geräten, realem Backend, KI-Import und tatsächlichen QR-Scans gehört zur nächsten Abnahme.

## Verbindliche Arbeitsregeln

- Live bleibt bei verifizierten Releases. Lab -> bewerten -> Feature-Branch -> integrieren -> Staging -> abnehmen -> Live.
- Verifizierte Spiele-Branches und Produktions-Tags als Referenz erhalten.
- Das Hosting-Skript veröffentlicht ausschließlich den neuen Lab-Preview-Channel in hausaufgabe-staging.
- Keine gemeinsame Bestenliste für Spiele mit unterschiedlicher Wertung.
- Spielinhalte und Modus bleiben getrennt; Vokabelsets nicht durch Hub-Navigation verändern.
- Ein Rundencode ist derzeit einem Spiel zugeordnet. Keine automatische Suche in allen Backends und kein Beitritt zu einer geratenen Runde.
- Favoriten sind lokal im Browser; noch nicht an einen GradeCrew-Account gebunden.
- Collections und Functions-Codebases nicht für eine reine Oberflächenänderung umstellen.
- Neue Chats verwenden diesen Branch und aktualisieren diese Datei.

## Nächste fünf Aufgaben

1. **Abnahme im Lab:** Hub mit echten Staging-Backends, allen drei Spielen und mehreren Geräten / QR-Codes testen.
2. **Lehrkraft-Konfigurationen:** Einstellungen pro Spiel speichern, benennen und erneut öffnen; zuerst lokal, später an den Lehreraccount binden.
3. **Gemeinsamer API-Adapter:** Aktionsnamen hinter einem Vertrag für Räume und Bestenlisten abbilden, einzeln testen; Wertungslogik je Spiel erhalten.
4. **GradeCrew-Anbindung:** Auf Feature-Branch „Spiele“ als eigenen Bereich, Lehreraccount und später Klassen/Kürzel anbinden; lokale Vokabelsets kontrolliert übernehmen.
5. **Staging-Abnahme:** Auth-/Klassenrechte, Raumende/Wiederbeitritt, Fehlerzustände, Datenhaltung und Betriebskosten prüfen, anschließend Live-Freigabe.

Neue Spiele folgen nach diesen Struktur- und Abnahmeschritten.
