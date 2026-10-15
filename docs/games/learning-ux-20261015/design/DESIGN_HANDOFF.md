# Design und Planbuch - GC-GAMES-LEARNING-UX-01

Stand: 15.10.2026. Autorisierter Umfang: Planbuch, Konzeptansichten und Satz; keine Produktdatei, kein Providerstart, kein Deployment. Requested Modell/Aufwand: Sol/medium laut Fachauftrag; tatsächliche Runtime nicht separat beobachtbar (unknown). Keine Modellwechsel. Keine neue Task-ID, keine Kostenreservierung, keine externen bezahlten Versuche.

## Visuelles System

Das bestehende GC-Zeichen bleibt unverändert. Dokumentkopien in assets/ sind ausschließlich eingefrorene Referenzen für dieses Buch, keine neue Runtime-Markenquelle. Grundfarben aus Shared Tokens V1.1.0: Hintergrund #f6f7f9, Papier #ffffff, Text #202b3c, Nebeninformation #5e6b7b, Primäraktion #285ac9, positiv #267049. Fachakzente als Vorschlag: Mathematik blau, Deutsch violett, Englisch petrol, Wissensreise grün; immer mit Fachname und Symbol, nie Farbe allein.

UI: systemnahe Arial-Darstellung in den editierbaren SVG-Ansichten. Buch: Trebuchet für klare, freundlich erwachsene Kapitelüberschriften, Arial für lange Fließtexte, feste Rollen statt vieler Schriftarten. Satzspiegel linksbündig, ca. 65–80 Zeichen pro Zeile; Farbflächen dienen Zuständen oder fachlicher Orientierung. Ruhige Flächen, begrenzte Crew-Dichte, kein infantilisiertes Spielzeugmotiv für Klassen 5–10. Keine dunkle Gaming-Neonwelt und keine zusätzliche Games-Hauptmarke.

Vor Entwurf überprüft: Die Versuchung einer generischen bunten Kartenwelt wurde auf die wirkliche Navigationsaufgabe begrenzt: vier Fachkarten nur im Hub, danach große Aufgabenfläche und wenige Entscheidungen. Einfach starten bleibt primär; Genau auswählen ist verfügbar, aber kein sechsfacher Pflichtfilter. Der Hub bietet je Spiel nur eine primäre Spielauswahl. Die Abfolge und Schwierigkeit werden sprachlich erklärt.

## Zwölf konkrete Konzeptansichten

1. 01-hub-desktop.svg: Hub mit vier Games und einer Auswahl pro Spiel; genauer Start nach Auswahl.
2. 02-einfachstart-ipad.svg: Thema/eigener Test, Dauer, greifbare Schwierigkeit.
3. 03-remy-vorschau-desktop.svg: optionale Texteingabe und prüfbare Parameter.
4. 04-lehrplan-desktop.svg: optionale Advanced-Auswahl, Bayern/Mittelschule/Jahrgang 6.
5. 05-schwierigkeit-ipad.svg: gleiche/verschiedene Nenner und zwei Rechenschritte statt nackter Levelnummer.
6. 06-lobby-board-desktop.svg: Lehrkraft-Lobby und Board; QR ausdrücklich nicht funktionaler Platzhalter.
7. 07-aufgabe-phone.svg: Aufgabe, Eingabe und Hilfe in gemeinsamer Spielhülle.
8. 08-abschluss-ipad.svg: Lernfeedback und Weiterüben, keine Schulnote.
9. 09-material-zustaende-desktop.svg: leer/ungeeignet/offline mit nächster Handlung.
10. 10-wissensreise-ipad.svg: eigener Test als Reisequelle, strikt ohne manuelle Antwortbewertung.
11. 11-deutsch-aufgabe-ipad.svg: gezielte Wortmarkierung und beispielspezifische Hilfe.
12. 12-vocab-aufgabe-phone.svg: aktiver Wortabruf mit freier Eingabe und Kontext.

Alle Ansichten tragen Konzept/Vorschlag sowie Kein Live-Screen. Beispiele sind fiktiv; keine Screenshots, privaten IDs oder echten Schülerinhalte übernommen. Bilder in preview/ sind reine Render der SVG-Quellen; index.html ist eine statische Galerie, keine funktionierende App. Desktop-/iPad-/Phone-Kompositionen sind Designvorschläge, noch keine Geräteprüfung oder vollständige responsive Implementierung.

## Quellen und Rechte

GitHub-main am 15.10.2026 gelesen: START_HERE, AGENTS, GRADECREW_STATE, TODO, workstreams/README, CHAT_CONTRACT, GREAT_GAMES_WORKFLOW, GAME_PROJECT_TEMPLATE, IMG2THREEJS_AND_ASSET_QUALITY. Main-Basis laut Zentrale 8560992c072779814017ebac6e86b65e938bc951. Main enthält Dokumentation, deshalb reale Markenassets am belegten Brand-Core-Commit c458dd1a82f82873b52877b9d914d24efd0b27c5 gelesen.

- `assets/brand-primary-v1.svg`, `assets/brand-icon-v1.svg`: bytegetreue Dokumentreferenzen aus HerrLoeffler/Hausaufgabe, assets/gradecrew/, Commit c458dd1a82f82873b52877b9d914d24efd0b27c5. Quelle https://github.com/HerrLoeffler/Hausaufgabe/blob/c458dd1a82f82873b52877b9d914d24efd0b27c5/assets/gradecrew/brand-primary-v1.svg und entsprechendes icon. workstreams/brand-logo-v1.md auf aktuellem main belegt Martins bereitgestellte Original-SVG am 02.10.2026 und verworfene Neuzeichnung. Projektinterne Nutzung im angeforderten Plan; keine öffentliche freie Lizenz oder separate Markenrechtsprüfung behauptet.
- `assets/elephant-create.svg`: bestehender Remy-Asset aus demselben Repository/Commit. Semantik `mascots.remy.primary` im assets.json V1.2.0. Herkunft durch Projektdatei belegt, öffentliche Weiterverbreitungslizenz nicht separat belegt; daher nur als bestehender Projektasset, keine neue Rechtefreigabe behauptet.
- Palette/Abstände: shared/gradecrew-design/tokens.json V1.1.0 und BRAND_CORE.md, gleicher Commit. Fachakzente und Layouts sind neue Planvorschläge.
- Native SVG-Konzeptansichten, Fachsymbole und UI-Layout: im Rahmen dieses Auftrags selbst erstellt. Keine fremden Spielebilder, keine externen Icons, keine bezahlten Assets. Kein KI-Rasterbildgenerator aufgerufen. 3D-Rekonstruktion ist für diese 2D-UI- und Dokumentaufgabe fachlich ungeeignet; stattdessen native SVG und PDF-Satz.
- Schriften: lokal vorhandene macOS-Schriften Trebuchet MS und Arial zur Dokumentdarstellung, keine separaten Fontdateien im Lieferpaket. Keine freie Fontlizenz behauptet.

## Tatsächlich verwendete Skills und Werkzeuge

Gelesen und angewendet: /Users/martin/.codex/skills/frontend-design/SKILL.md; /Users/martin/.codex/plugins/cache/openai-primary-runtime/pdf/26.1013.11914/skills/pdf/SKILL.md. Bundled Runtime 26.1013.11914 über load_workspace_dependencies aufgelöst. PDF-Artefaktmarker erfolgreich vor der ersten Erstellung ausgeführt. Native SVG-Erstellung, Sharp-Render der vorhandenen Pfade, ReportLab-Satz vorgesehen. Kein Figma-Aufruf und keine 3D-Produktion.

## Zwischenprüfung

Zwölf SVGs erstellt und als PNG gerendert; Kontaktbogen vollständig visuell geprüft, Hub und Phone-Aufgabe zusätzlich groß geprüft. Satz erst nach stabilem MASTERPLAN.md. Danach vollständiger Text-/Kapitelabgleich, PDF-Lesezeichen/Inhaltsverzeichnis, alle Seiten als Thumbnail prüfen und repräsentative Vollseiten öffnen. Keine bereits ausgeführte Runtime-, Browser- oder Geräteabnahme behauptet.


## Reviewkorrekturen der Zentrale

Hub auf eine Auswahl pro Spiel vereinfacht. Bruchschwierigkeit fachlich an Nennerbeziehungen und Schrittzahl erklärt. Zeitrunden zeigen verbleibende Zeit statt einer scheinbaren Begrenzung auf Quellaufgaben. Deutschhilfe beispielspezifisch statt universell falschem Merksatz. Wissensreise strikt ohne manuelle Antwortbewertung; offene Reflexion bleibt unbewertet. Vocab zeigt die zuvor gewählte Richtung, keinen unkontrollierten Wechsel im laufenden Klassenmodus. Gesamt-PDF wartet auf stabiles Manuskript; erste Satzproben sind kein Lieferstand.
