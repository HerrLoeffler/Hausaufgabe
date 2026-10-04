# GradeCrew – Startscreen Masterpiece v1

Stand: 2026-10-04
Basis: `feature/gradecrew-app-integration` @ `e46b747188e82043787824b412b11922703d1f8d`
Aufgabenbranch: `feature/design-startscreen-masterpiece-v1`
Production: unverändert

## Ziel

Den funktionalen Startscreen v3 zu einer echten GradeCrew-Markenhomepage ausbauen – mit deutlich breiterer Bühne, echter Web-Navigation, Coco als Gastgeber, räumlicher Crew-Komposition, schulnaher Klassenzimmer-Atmosphäre, hochwertiger CTA-/Testcode-Zone und einer klaren Benefit-Leiste.

Die bestätigte Kernbotschaft bleibt bewusst kurz:

- `Hi! Ich bin Coco.`
- `Willkommen bei GradeCrew.`
- `Digitale Tests, schnell & einfach.`

## Umgesetzt

### 1. Grundlayout + Header
- Public Entry löst sich im Gastzustand aus dem alten 1180px-App-Shell.
- Breite Bühne bis 1540px mit großzügigen Außenabständen.
- bestehende echte GradeCrew-Marke in der Topbar bleibt erhalten.
- öffentliche Navigation ergänzt: `Funktionen`, `Die Crew`, `Für Lehrkräfte`, `Hilfe`.
- Navigation existiert nur im Public-Entry-Modus; Dashboard/Secure Student bleiben unangetastet.

### 2. Hero-Bühne
- neue `.gcEntryHero`-Bühne mit eigenständiger Tiefenkomposition.
- Coco deutlich größer und links als Gastgeber.
- Remy, Emmi und Wilma als Arbeitscrew auf derselben Bühne.
- Rollen-Karten mit eigenen Icons und klarer Farbcodierung.

### 3. Klassenzimmer-Atmosphäre
- responsive CSS-Szene statt starrem Hintergrundbild.
- Tür mit Willkommensschild, Fenster/Licht, Tafel, Regal, Bücher/Pflanze und Tischfläche.
- keine neue/alternative Maskottchen-Grafik; Figuren kommen weiterhin ausschließlich aus dem kanonischen Asset-Manifest.

### 4. CTA-Zone
- `Crew kennenlernen` bleibt Primäraktion.
- `Direkt anmelden` bleibt Sekundäraktion.
- stärkere Größenhierarchie, Glas-/Tiefenwirkung und großzügigere Abstände.

### 5. Schüler + Benefits
- Schüler-Testcode als integrierte hellblaue Utility-Leiste.
- Submit visuell auf kompakten Pfeil reduziert, bestehender Submit/Form-Handler bleibt derselbe.
- vier Benefits:
  - Schnell erstellt – In wenigen Minuten
  - Einfach durchgeführt – Für deine Klasse
  - Direkt ausgewertet – Mit klaren Ergebnissen
  - Für Lehrkräfte gemacht – Praxisnah. Sicher. Zuverlässig.

### 6. Responsive
- Desktop: volle Klassenzimmerbühne.
- Tablet/iPad: reduzierte Deko, Crew bleibt zweispaltig und vollständig sichtbar.
- Smartphone: Hero wird kontrolliert in Flow-Layout umgebaut; keine absolute Positionierung der CTAs/Schülerleiste.
- Reduced Motion und sichtbare Focus-Zustände bleiben geschützt.

### 7. Regression
- Design-/Entry-Tests auf neue Struktur angepasst und erweitert.
- Cache-Bust auf `auth-startscreen-v4` / `gradecrew-entry-flow.js?v=4`.
- CI läuft; nach grünem Gate PR gegen `feature/gradecrew-app-integration`, danach Preview-Deploy.

## Geschützte Funktionen

Nicht verändert:
- Firebase Auth / Registrierung
- bestehende Form-IDs und Event-Handler
- `?test=CODE` Secure Student Routing
- Secure Assessment
- Functions
- Firestore Rules
- Test-/Bewertungs-/Publishinglogik
- Tutorial-/Account-Gate-Inhalt
- Production

## Status

- lokal geändert: nein
- auf GitHub gesichert: ja
- Branch: `feature/design-startscreen-masterpiece-v1`
- Codepass 1–5: erledigt
- Responsive-Pass: erledigt
- Regressionstests aktualisiert: ja
- CI: läuft
- PR: noch nicht geöffnet
- in Integrationsbranch: nein
- Preview deployed: nein
- Desktop/iPad/Smartphone visuell im echten Hosting-Preview bestätigt: nein
- Production: UNVERÄNDERT

## Nächster Schritt

1. Aktuellsten AI-Staging-Check vollständig grün abwarten.
2. Bei Fehlern ausschließlich auf diesem Branch korrigieren.
3. PR gegen `feature/gradecrew-app-integration` öffnen und nach grünem Gate integrieren.
4. Hosting Preview `gradecrew-app-integration` neu deployen.
5. Desktop, iPad und Smartphone mit dem echten ausgelieferten Build visuell prüfen.
6. Nur echte Preview-Befunde in einen weiteren Feinschliff übernehmen.
