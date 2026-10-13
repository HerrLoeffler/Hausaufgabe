# GradeCrew – Crew-Einblicke V2
Task: GC-BRAND-HERO-MOTION-20261013. Separates Experiment, vom Nutzer am 13./14.10.2026 freigegeben. Kein Produktrelease, kein Deploy.

## Ansehen
- Die einzelne Datei **preview.html** enthält Bilder, Styles und Interaktionen. Sie funktioniert ohne Netz und ohne Build; lokal im Browser öffnen.
- Modulare Entwicklungsfassung: im Verzeichnis `python3 -m http.server 8779 --bind 127.0.0.1` starten, dann http://127.0.0.1:8779/ aufrufen.
- DE/EN auswählen, Namen anklicken, mit Weiter/Zurück durch die drei Momente gehen. Am Ende lässt sich die nächste Figur öffnen.
- Oben rechts öffnet „Remys Farbe vergleichen“ den direkten Vorher/Nachher-Vergleich.
- Tutorial, Anmeldung und Testcode zeigen in diesem Experiment nur einen erklärenden Hinweis. Es gibt keine Verbindung zur echten App. Das bestehende ausführliche Tutorial wurde nicht kopiert oder verändert.

## Änderungen
- Hero-Remy, Tabletpose und Mikrofonpose gezielt in sanftes Hellblau geändert. Die originale Klassenzimmerszene, übrige Figuren, Requisiten, Originale und Quellreferenzen bleiben erhalten.
- Coco: größeres Original-Schnurtelefon, Hilfe-Einstieg unten rechts, beispielhafte Frage und kurze Antwort mit hervorgehobenem „Neuer Test“.
- Remy: Beispielwunsch mit Fach/Klasse/Thema, entstehende erste Aufgabe und zusammengehöriger Entwurf mit drei Fragen.
- Echte Namensbuttons, Abspielsymbol/„Kurz ansehen“ und Coco-Hinweis. Tutorial als eigener beschrifteter Einstieg.
- Kurze einmalige Bewegungen, dann unbegrenzter Lesestopp. Kein Timerwechsel. Reduced Motion überspringt keine Inhalte.
- Emmi/Wilmas bestehende Renderabläufe aus der aktuellen Quelle übernommen. Gemeinsame Dialoggestaltung mit Rückwärtsnavigation und optionalem Übergang zur nächsten Figur.
- Texte bleiben im DE/EN-Katalog. Beispiele und Auswertung sind als Beispiele markiert.

## Quellen und Grenzen
App-Referenz: HerrLoeffler/Hausaufgabe, gc39@8f8697901f8c1aea89897be855ca2872c82d0f2b.
`reference/` enthält unveränderte Kopien der vier ursprünglichen Hero-Dateien. Bilddateien wurden aus demselben Commit kopiert; das Original-Klassenzimmer lag bereits im Experiment vor. **Kein Checkout der aktuellen Homepage wurde verändert.**
Remy-Edits über integriertes Imagegen, drei Ausgaben, Prompts in PROMPTS.md. Farbwerte sind visuelle Referenzen, keine pixelgenaue Farbnorm. Kleinere KI-Detailabweichungen sind möglich. Modell/Effort/Tokenkosten der Bildgenerierung nicht ausgewiesen.
Die Mini-Appansichten sind vorbereitete Illustrationen des Produktablaufs und keine aktuellen Produktscreenshots oder Live-KI. Es werden keine Konten, echte Tests, Mikrofonaufnahmen, Tracking oder Provideraufrufe gestartet.

## Verifiziert
- Vier Verhaltenstests: zunächst drei erwartete Fehlschläge gegen den ursprünglichen Flow, danach alle vier grün: manueller Lesestopp, Zurück/Replay, alle Inhalte bei Reduced Motion und Ablehnung unbekannter Figuren.
- Browserlauf: 1440×1000, 820×1180, 390×844; alle vier Einblicke, DE/EN für Coco/Remy, Zurück/Replay, Tutorial-/Testcode-Hinweis, Tastatur Space/Enter/Escape/Fokusrückgabe, Reduced Motion. Kein horizontaler Überlauf, keine Browserfehler, keine fehlenden Dateien, **keine externen Anfragen**.
- Danach gezielt geprüft: Offline-Bundle im Codex-Browser, Coco-Hilfeaktion, manuelle Weiter-Schritte, Remy-Endentwurf und Fokus auf dem neuen Schritt.
- Sprechblase auf Tablet-Breite von Cocos Kopf weggerückt. Schwache Grautöne im lokalen Stylesheet abgedunkelt; repräsentative Text-/Hintergrundpaare gemessen.
- Desktop-/iPad-/iPhone-Vorschaubilder und verification.json in previews/. Bildschirmbreiten sind keine Abnahme auf physischen Geräten; Safari, VoiceOver und Nutzerurteil bleiben offen.

## Kleine Assurance-Auswahl
Owner: dieser ausführende Designfachchat, ausschließlich lokale Experimentoberfläche.
- SEC15: neue HTML-Beispieltexte escaped, ältere Demo-Texte über textContent; keine Nutzereingaben werden als HTML gerendert. SEC18: statische CSP mit connect-src none; Offline-Datei mit Hashes für eigenes Script/Style. Lokale Belege, keine Aussage über Live-Hosting.
- PRIV12: Beispielkennzeichnung, keine erfundenen Datenschutz-/Hosting-/Qualitätsversprechen. PRIV13: dekorative Bilder leer, Hero-/Vergleichs-Alternativtexte DE/EN. PRIV14: Textgrautöne nach Kontrastmessung abgedunkelt; kein vollständiges WCAG-Zertifikat. PRIV15: manuelle Navigation und Fokus getestet; echter Screenreader-Test offen. PRIV19: vorhandene Nutzer-Assets mit Source-SHA sowie drei autorisierte Edits; externe Fonts/Stockbilder nicht verwendet.
- Auth/Rules/Noten/echte Uploads/Billing/Retention nicht relevant für diesen lokalen Entwurf; bei Produktintegration erneut prüfen.

## Wiederherstellen und prüfen
Keine Installation nötig. Mit vorhandener Node-Runtime:
```sh
node --test flow.test.mjs
node --check demo.mjs
node bundle.mjs
```

verify.mjs setzt vorhandenes Playwright/Chrome und einen lokalen Server voraus; es ist ein lokaler QA-Helfer, keine Produktabhängigkeit. preview.html und Screenshots sind abgeleitete lokale Dateien und werden nicht in App-Releases kopiert.

## Nächster Schritt
Martin beurteilt Remys Hellblau, Cocos Hilfe-Beispiel, Remys Entstehungsablauf und die Erkennbarkeit der Namensbuttons in dieser Vorschau. Jede spätere Übernahme in Homepage/Staging benötigt einen gesonderten Auftrag.
