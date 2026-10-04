# GradeCrew – Startscreen Masterpiece v4

Stand: 2026-10-04
Basis des Guardian-Laufs: `feature/gradecrew-app-integration@578677633c1759e75fee6479f416fb64566f5c5c`
Aktuell integrierter Web-Stand: `feature/gradecrew-app-integration@fb88dfa7b7cbad49f93b4fc47e883c92fdcf0d41`
Production: unverändert

## Ziel

Den bisherigen funktionalen Crew-first Startscreen zu einer deutlich hochwertigeren, wärmeren und räumlicheren GradeCrew-Markenhomepage veredeln:
- Coco als klarer Gastgeber im Vordergrund;
- Remy, Emmi und Wilma als zusammenhängende Crew;
- weniger flache/geometrische Klassenzimmerobjekte;
- mehr Licht, Tiefe, Ruhe und Premium-Hierarchie;
- saubere CTA-, Schülercode- und Benefit-Zone;
- echte Neukomposition auf Tablet/iPad und Smartphone.

## Internationalisierung – verbindliche Produktregel

PR #108 / Web-SHA `9559f742…` hat den vollständigen Crew-first Public Entry für DE/EN an die vorhandene Browser-i18n-Grenze angeschlossen.

Geschützt:
- alle sichtbaren Startscreen-Texte wechseln mit der UI-Sprache;
- Test-/Aufgabensprache bleibt davon unabhängig;
- Bewertungssprache bleibt davon unabhängig;
- keine sichtbaren Wörter in CSS `content`, Hintergrundbildern oder Data-URIs;
- sichtbare Copy bleibt im DOM/i18n-Katalog.

Die i18n-Integrationstests liefen auch im aktuellen Post-Merge-CI erfolgreich.

## Guardian-/Multi-KI-Verlauf

### v2
Run `37220142576` stoppte beim früheren synchronen 240-Sekunden-OpenAI-Aufruf mit unbekanntem Provider-Ergebnis. Historie und 2,40-USD-Reservierung blieben erhalten; kein Blind-Retry.

### Background-Responses-Fix
PR #105 stellte OpenAI Guardian auf Background Responses mit derselben Response-ID um. Der echte kleine Pilot bewies danach GPT-6.1 Sol + GPT-6 Astra + Claude Sonnet 5.5 + GPT-6 Sol, Combined CI, Integration und Staging.

### v3
Die große monolithische Startscreens-CSS war für einen vollständigen strukturierten Neu-Output zu groß/ungünstig. Deshalb wurde mit PR #114 ein kleiner isolierter Polish-Layer eingeführt.

### v4
Guardian-Run `37230004552`:
- GPT-6.1 Sol Build: SUCCESS;
- Kandidat: `961416cdcb3d71d5f45e1e416f6f50ae71a5b7c4`;
- API-Nutzungsschätzung Builder: 0,174598 USD;
- Publish: SUCCESS;
- Exact Combined Validation: FAIL;
- drei KI-Reviews: dadurch SKIPPED;
- Integration: SKIPPED.

Die eigentliche App-/Security-Testlandschaft war grün. Ein Startscreendesign-Test stoppte den Kandidaten, weil der Polish-Layer dekoratives `content: ""` enthielt; der damalige Regex traf zusätzlich sogar `justify-content`.

PR #121 korrigierte den Test so, dass er echte CSS-`content`-Deklarationen prüft und sichtbare/variable Inhalte weiterhin verbietet.

## Deterministische Rettung des v4-Designs

Der bereits bezahlte GPT-6.1-Sol-Kandidat wurde **nicht erneut erzeugt**. Stattdessen wurde ausschließlich die konkrete i18n-Verletzung deterministisch entfernt:
- keine CSS-`content`-Deklarationen mehr;
- die Licht-/Atmosphäre-Ebenen liegen direkt auf bestehenden Elementen;
- keine neue sichtbare Copy;
- keine Änderung an Entry-Markup, i18n-Katalogen, Auth, Routing, Assessment oder Backend.

PR #123 integrierte diesen Polish-Layer:
- Integrationscommit: `fb88dfa7b7cbad49f93b4fc47e883c92fdcf0d41`
- Branch-CI: `37231329034` SUCCESS
- Post-Merge AI Staging Checks: `37231463662` SUCCESS
- Admin Controls: `37231463639` SUCCESS
- automatisches Hosting-Preview: `37231545703` SUCCESS
- verifizierte Dateien: 111
- Preview: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`

Wichtig: Dieser salvagierte Kandidat hat **keine drei Guardian-Reviewer-Freigaben**, weil die ursprüngliche v4-Validation vor den Review-Jobs stoppte. Das darf nicht als vollständiger Multi-KI-Gate-Erfolg bezeichnet werden. Es wurde aber kein zusätzlicher bezahlter Build gestartet und die ursprüngliche Versuchshistorie/Budgetreservierung wurde nicht zurückgesetzt.

## Status

- GPT-6.1-Sol-Designkandidat gebaut: ja
- ursprünglicher Guardian v4 Run: repairable nach Testfeedback
- deterministische i18n-Reparatur: ja
- auf GitHub gesichert: ja
- in `feature/gradecrew-app-integration` integriert: ja, `fb88dfa7…`
- Post-Merge CI: grün
- Hosting-Preview: verifiziert deployed
- DE/EN Startscreen-Abdeckung: vorhanden und getestet
- Desktop visuell von Martin bestätigt: noch nein
- iPad bestätigt: noch nein
- Smartphone bestätigt: noch nein
- vollständige drei KI-Reviewer auf dem salvagierten Kandidaten: nein
- Production: UNVERÄNDERT

## Nächster Schritt

Martin öffnet den verifizierten Preview und prüft:
1. Desktop 1440–1600px: Coco-Größe, Crew-Gruppierung, Raumtiefe, CTA-Abstände, Schülerleiste, Benefit-Bar.
2. UI-Sprache DE → EN: Header, Hero, Rollen, CTA, Schülerbereich, Benefits und Tutorial müssen vollständig wechseln.
3. iPad quer/hoch und Smartphone: keine abgeschnittenen Figuren, keine Überlagerungen, kein Horizontal-Scroll.
4. Erst aus diesen echten visuellen Befunden wird der nächste Design-Pass abgeleitet.

Production bleibt bis zur ausdrücklichen Freigabe gesperrt.

## Nutzerabnahme 04.10.2026 – visuell nicht akzeptiert

Martin bewertet den verifizierten v4-Preview als technisch verbessert, aber weiterhin **meilenweit** vom gewünschten Referenzbild entfernt. Das ist kein kleiner Spacing-/Polish-Fehler mehr. Der nächste Design-Pass soll deshalb nicht erneut nur CSS-Geometrie verfeinern.

Neuer Folgeauftrag: [GC-DESIGN-05](startscreen-hero-animation-20261004.md). Dort wird eine echte art-directed Hero-Szene inklusive optionaler First-Visit-Animation geprüft. Die bestehende DE/EN-i18n-Grenze bleibt verbindlich.
