# GradeCrew Brand System · v1

## Markenidee
GradeCrew ist eine ruhige, professionelle Produktmarke für digitale Leistungsnachweise. Die Crew ist kein dekoratives Kinder-Maskottchen-System, sondern eine funktionale visuelle Sprache: Jede Figur steht für einen klaren Arbeitsschritt im Produkt.

## Crew

### Pinguin · Guide
- Rolle: Orientierung, Onboarding, Hilfe, Hinweise
- Charakter: ruhig, zugänglich, verlässlich
- Bewegung: aufrecht, leicht zugewandt, kleine klare Gesten
- Einsatz: Erststart, Hilfe, Empty States, bestätigende Hinweise

### Falke · Create
- Rolle: Erstellen, Generieren, Startpunkt der KI
- Charakter: schnell, präzise, fokussiert
- Bewegung: leichte Vorwärtsdynamik, gespannte Silhouette
- Einsatz: „Mit KI erstellen“, Generierungsstatus, neue Tests

### Fuchs · Improve
- Rolle: Verbessern, Varianten, Umformulieren
- Charakter: klug, flexibel, ideenreich
- Bewegung: leicht seitlich, aufmerksam, subtile Dynamik
- Einsatz: KI bearbeiten, Varianten, alternative Vorschläge

### Eule · Grade
- Rolle: Prüfen, Bewerten, Qualität
- Charakter: sorgfältig, ruhig, objektiv
- Bewegung: stabil, frontal/leicht gedreht, konzentriert
- Einsatz: Qualitätsprüfung, Bewertung, Ergebnisse

## Stilregeln
- Editorial SaaS statt Kinderbuch
- reduzierte Geometrie, klare Silhouetten, ruhige Flächen
- keine Kleidung, Taschen, Doktorhüte, Brillen oder Werkzeuge
- keine menschlichen Hände
- keine übergroßen Augen oder übertriebene Mimik
- keine Chibi-/Sticker-Proportionen
- weiche, hochwertige Schatten nur sehr sparsam
- gleiche Strichstärken und Rundungslogik
- Tiere bleiben klar Tiere; Persönlichkeit entsteht über Haltung und Blickrichtung

## Farbwelt
- Ink: `#172033`
- Slate: `#5F6B7C`
- Cloud: `#F4F7FB`
- GradeCrew Blue: `#2F6FED`
- Guide Ice: `#DCEAF7`
- Create Steel: `#60758D`
- Improve Rust: `#C96C45`
- Grade Sand: `#B08A61`
- Warm Cream: `#F5E7D4`

Akzentfarben dürfen eine Figur unterscheiden, aber nie die UI dominieren.

## Größen & Einsatz
- 32–48 px: kleine Funktionsmarke / Status
- 56–88 px: Feature-Card / Dialog
- 120–180 px: Empty State / Onboarding
- 240+ px: Marketing / Landingpage / Crew-Lineup

## UI-Regeln
- maximal eine dominante Figur pro sichtbarem Funktionsbereich
- keine Figur neben rein administrativen oder kritischen Warnmeldungen
- Fehlermeldungen bleiben sachlich; Crew höchstens in der anschließenden Hilfe
- Illustrationen ersetzen keine Labels oder Icons
- auf dichten Arbeitsflächen nur kleine, ruhige Akzente

## Website-Map
- Header: reine GradeCrew-Wortmarke, keine große Figur
- Login/Marketing: kleines Crew-Lineup oder Pinguin
- `+ Neuer Test` / KI-Erstellung: Falke
- Varianten / KI bearbeiten: Fuchs
- Qualitätsprüfung / Bewertung: Eule
- Onboarding / Erststart: Pinguin
- Empty State „Noch kein Test“: Falke

## Asset-Konvention
`assets/gradecrew/<animal>-<role>.svg`

Master-Dateien:
- `penguin-guide.svg`
- `falcon-create.svg`
- `fox-improve.svg`
- `owl-grade.svg`
- `crew-lineup.svg`

Die SVGs sind die Web-Master. Rastervarianten werden nur bei Bedarf aus den SVGs exportiert.