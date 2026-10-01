# GradeCrew Crew Library Plan · V1

Status: Ausbauplan für bestehende Crew-Assets. Keine Pflicht, hunderte Dateien vor Produktbedarf zu erzeugen.

## 1. Bestehende Rollen bleiben die Grundlage

| Figur | Tier | Kernrolle | Primäre Bereiche |
|---|---|---|---|
| Coco | Pinguin | Guide / Orientierung / Hilfe | Einstieg, Tutorial, Empty States, Hilfe |
| Remy | Elefant | Erstellen / KI / Entwurf | Neuer Test, KI-Generator, Warte-/Erstellzustände |
| Emmi | Fuchs | Verbessern / Varianten | KI bearbeiten, Varianten, Optimierung |
| Wilma | Eule | Prüfen / Qualität / Bewertung | Qualitätsprüfung, Veröffentlichung, Ergebnisse |

Die bestehenden Namen und semantischen Asset-Namen aus `shared/gradecrew-design/assets.json` gelten als bewährte Ausgangsbasis.

## 2. Produktionsprinzip

Nicht 1.000 zufällige Posen vorab produzieren. Zuerst eine kleine, hochwertige Kernbibliothek; danach nur aus echten UI-Bedarfen erweitern.

### Stufe 1 – Core
Je Figur ca. 12–15 gezielte Motive:
- neutral / stehen
- freundlich begrüßen
- zeigen
- erklären
- denken
- arbeiten
- warten
- prüfen
- Erfolg
- Fehler / Retry
- ermutigen
- Abschluss

Ziel: etwa 50–60 hochwertige Assets insgesamt.

### Stufe 2 – Expanded
Je Figur 30–50 Motive, sobald konkrete Screens dies benötigen. Ziel: etwa 150–200 Assets.

### Stufe 3 – Spezialbibliothek
Nur reale Produktbedarfe: Spiele, besondere Empty States, Kampagnen, saisonale Motive, komplexe Tutorials.

## 3. Pose-Matrix

Jedes Motiv wird systematisch beschrieben durch:

- `character`: coco / remy / emmi / wilma
- `purpose`: guide / create / improve / grade
- `pose`: stand / sit / point / peek / hold / work / celebrate / inspect / wait
- `emotion`: neutral / friendly / focused / curious / proud / surprised / concerned / relieved
- `prop`: none / test / tablet / pencil / magnifier / clipboard / trophy / qr / timer
- `placement`: inline / card-edge / corner-peek / empty-state / coach / hero / celebration
- `density`: low / medium / high
- `background`: transparent / scene
- `motion`: none / entrance / think / celebrate

Damit lassen sich später hunderte Varianten konsistent planen, ohne sie im Voraus alle zu rendern.

## 4. Placement Patterns

### `coach`
Figur + kurze Erklärung nahe einer echten Funktion. Interaktion bleibt beim echten UI-Element.

### `empty-state`
Zentrale Illustration bei inhaltlicher Leere. Immer mit verständlichem Text und sinnvoller nächster Aktion.

### `corner-peek`
Kleine dekorative Figur an einer Ecke; niemals über Eingaben, Zahlen oder Status legen.

### `card-edge`
Figur sitzt/lehnt am Kartenrand; nur bei nicht kritischen Bereichen.

### `hero`
Großes Motiv nur auf Landing, Willkommen oder großen Produktmomenten.

### `celebration`
Nur nach bedeutendem Abschluss, nicht nach jedem Speichern.

## 5. Einsatzdichte nach Bereich

| Bereich | Dichte | Regel |
|---|---:|---|
| Landing / Willkommen | hoch | Crew darf Story tragen |
| Tutorial | hoch | Figur erklärt echte Funktionen |
| Dashboard | mittel | max. eine dominante Figur |
| KI-Erstellung | mittel | Remy unterstützt Prozessdarstellung |
| Einstellungen | niedrig–mittel | kleine kontextuelle Motive |
| Meine Tests | niedrig | Inhalt dominiert |
| Editor | niedrig | Figuren nur an klaren Hilfepunkten |
| Ergebnisse | niedrig | Wilma optional, Daten dominieren |
| Schülerprüfung | minimal | praktisch keine Dekoration |
| Secure | minimal | keine Gamification kritischer Zustände |
| Spiele | hoch | volle Crew-/Bewegungssprache erlaubt |

## 6. Asset-Regeln

- Bestehende kanonische Assets nicht produktweise duplizieren.
- Neue Assets zuerst semantisch im zentralen Manifest aufnehmen.
- Dateiname beschreibt Figur + Zweck, nicht den konkreten Screen allein.
- Transparente Einzelcharaktere bevorzugen Wiederverwendung; komplette Szenen nur für echte Story-Momente.
- Illustrationen dürfen keine wichtigen Texte eingebrannt enthalten, außer bewusst generierten, lokalisierten UI-Sonderfällen.
- Alt-Texte nur, wenn Bild zusätzliche Information vermittelt; rein dekorative Bilder werden entsprechend markiert.
- Keine entfernten Bildhosts für Kernassets.
- `prefers-reduced-motion` respektieren; Figurenbewegung ist nie Voraussetzung für Verständnis.

## 7. Bestehende Assets

Der Branch `feature/shared-gradecrew-design-system` enthält bereits kanonische Crew-Assets, Clay-Szenen und ein zentrales `assets.json`. Diese werden vor jeder Neuproduktion inventarisiert und bevorzugt wiederverwendet.

## 8. Nächster Ausbau

Vor neuen Bildserien zunächst für die fünf Referenzscreens eine Asset-Liste erstellen:

1. Dashboard
2. Meine Tests
3. Neuer Test
4. Testeditor
5. KI-Erstellung

Erst daraus werden fehlende Core-Posen abgeleitet. So entsteht eine große Bibliothek aus echtem Produktbedarf statt aus Vorratsproduktion.
