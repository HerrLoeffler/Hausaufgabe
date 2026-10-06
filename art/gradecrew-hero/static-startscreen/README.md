# GC-DESIGN-05 — Statischer Startbildschirm

Stand: 2026-10-06. Martins Auftrag: zuerst einen überzeugenden Startbildschirm erstellen, Animation später. Eigenständige, responsive HTML-Vorschau auf dem bestehenden Task-Branch/PR #143; keine App-Integration und kein Deployment.

## Öffnen und bearbeiten

`index.html` direkt im Browser öffnen oder diesen Ordner mit einem lokalen HTTP-Server bereitstellen. DE/EN oben rechts; `?lang=en` öffnet Englisch. Kein Build, keine externen Fonts, keine Bibliotheken oder Provider-Aufrufe zur Laufzeit.

- `copy.js`: alle sprachabhängigen Texte einschließlich Überschrift, Rollen, Dialogen, Bildbeschreibung, zugänglichen Namen und Platzhaltern. Weitere Sprachen durch gleichnamige Katalogschlüssel und eine Select-Option ergänzen. Sprachwechsel setzt `html.lang`, Seitentitel und speichert ausschließlich die Vorschau-Sprache.
- `styles.css`: responsive Darstellung. Bis 900px stehen Bild, Rollen, Buttons und Codefeld im normalen Dokumentfluss. Darüber nutzt die Bildkomposition feste Anker mit umbrechbaren Texten. Beliebig lange redaktionelle Texte brauchen erneut eine Layoutprüfung; keine unbegrenzte Textlänge versprochen.
- `assets/crew-classroom.webp`: gemeinsame textfreie Szene, 1536×1024, 201.798 Bytes. Keine Wörter, UI oder Beschriftungen eingebrannt. Original-PNG bleibt zusätzlich lokal im Workspace (`assets/crew-classroom-source.png`, 2.021.625 Bytes), nicht Teil dieses Git-Uploads.
- `assets/brand-primary-v1.svg`: vorhandenes Markenasset unverändert übernommen; separate HTML-Wortmarke.

Die Crew- und Hilfebuttons öffnen übersetzte Informationen. Anmeldung und Testcode sind ausdrücklich Vorschau-Übergaben zur bestehenden Testumgebung: keine nachgebaute Authentifizierung, kein Senden oder Speichern von Schülercodes. Bei späterer Integration vorhandene App-Handler und den zentralen i18n-Katalog verwenden. Dieser Prototyp führt keinen zweiten produktiven i18n-Stack ein.

## Bildquelle / Versuchshistorie

Ein Aufruf des eingebauten `image_gen`-Werkzeugs, kein CLI/API-Fallback, kein Higgsfield-Aufruf, kein Blender-Render, keine Animationsgenerierung. Exakter Prompt: `IMAGE_PROMPT.txt`. Inputs: Martins Klassenzimmer-Referenz und vier kanonische Figurenatlanten. PNG ausschließlich in WebP umkodiert; kein nachträgliches Compositing. Kosten dieses eingebauten Aufrufs wurden nicht vom Tool ausgewiesen. Frühere Provider-Reservierungen und Blender-Versuche bleiben unverändert dokumentiert.

Das Motiv trifft die Referenzkomposition mit vier Figuren, Tür und warmem Raumlicht. Es ist eine neue Cinematic-Variante, kein editierbares 3D-Modell. Coco/Remy haben im Ergebnis blaue Augenakzente; kanonische Augen sind dunkler. Diese Abweichung bleibt für die visuelle Markenabnahme offen. Keine vollständige Figurenidentität oder Nutzerabnahme behauptet.

## Prüfnachweise

`verify.cjs` wurde gegen isoliertes Chrome ausgeführt: DE/EN bei 320, 390, 768, 1024 und 1440px; Assets geladen, DOM-Texte vorhanden, keine horizontalen Überläufe und keine Überlappung von Überschrift/Rollen/Buttons/Codefeld/Vorteilen. Sprachwechsel, gespeicherte Vorschau-Sprache, übersetzte Platzhalter/Dialoge, Escape/Fokusrückkehr und Vorschau-Verhalten des Codefelds geprüft. Längere Beispieltexte aus dem Katalog angewendet. 12 Prüfabschnitte bestanden, keine JavaScript-Ausnahme. Einzelheiten `evidence/verification.json`.

Desktop DE und Mobil EN als WebP im Repository; vier PNG-Screenshots lokal erhalten. Desktop DE und Mobil DE visuell angesehen. Kein echter Gerätetest, keine Auth-/Test-Integration, kein allgemeiner WCAG- oder Performance-Audit. Technische Prüfungen ersetzen nicht Martins Bildabnahme.

Reproduktion: Server auf `127.0.0.1:8768` in diesem Ordner starten, dann `PLAYWRIGHT_MODULE=<playwright-Modul> CHROME_PATH=<Chrome-Binary> node verify.cjs`.

Nächster Schritt: Martins visuelles Feedback zu genau diesem Startbildschirm einarbeiten; danach denselben Text-/Bildaufbau in den vorhandenen App-Einstieg integrieren. Animation bleibt nachrangig.
