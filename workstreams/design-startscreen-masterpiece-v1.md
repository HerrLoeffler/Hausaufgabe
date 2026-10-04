# GradeCrew – Startscreen Masterpiece v1

Stand: 2026-10-04
Ausgangsbasis: `feature/gradecrew-app-integration` @ `e46b747188e82043787824b412b11922703d1f8d`
Aufgabenbranch: `feature/design-startscreen-masterpiece-v1`
PR: `#68`
Integrations-Merge: `7f464085e89bdb3ea331dfbc988decfa83bc59f6`
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

### 7. Regression / Integration
- Design-/Entry-Tests auf neue Struktur angepasst und erweitert.
- Cache-Bust auf `auth-startscreen-v4` / `gradecrew-entry-flow.js?v=4`.
- Feature-CI #501: SUCCESS.
- PR #68 nach grünem Gate in `feature/gradecrew-app-integration` gemergt.
- Integrations-Merge `7f464085e89bdb3ea331dfbc988decfa83bc59f6`.
- Post-Merge AI Staging Checks #502: SUCCESS.
- Post-Merge Admin Test-Account Controls #31: SUCCESS.

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
- Aufgabenbranch: `feature/design-startscreen-masterpiece-v1`
- Feature-CI getestet: ja, #501 SUCCESS
- PR: #68 gemergt
- in `feature/gradecrew-app-integration` integriert: ja
- Integrationscommit: `7f464085e89bdb3ea331dfbc988decfa83bc59f6`
- Post-Merge CI: ja, #502 SUCCESS
- Admin Controls Check: ja, #31 SUCCESS
- Hosting Preview mit diesem Merge neu deployed: nein
- Desktop Preview mit diesem Merge visuell bestätigt: nein
- iPad bestätigt: nein
- Smartphone bestätigt: nein
- Production: UNVERÄNDERT

## Nächster Schritt

1. Cloud Shell auf `feature/gradecrew-app-integration` aktualisieren.
2. vorhandenen Hosting-Preview-Channel neu deployen:
   `bash deploy-app-integration-preview.sh --deploy`
3. ausschließlich die ausgegebene Preview-Channel-URL öffnen.
4. Desktop-Screenshot prüfen: Bühne, Header, Coco-Größe, Crew-Komposition, CTAs, Schülerleiste und Benefit-Bar.
5. anschließend iPad und Smartphone prüfen.
6. weitere Änderungen nur anhand echter Preview-Befunde; Production bleibt bis zur ausdrücklichen Freigabe unverändert.
