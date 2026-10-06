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

Nächster Schritt: visuelle Abnahme der überarbeiteten Fassung; danach vorhandene App-Handler/i18n anbinden. Animation bleibt nachrangig.


## Revision 2 — Rückmeldung umgesetzt

Martin bewertet die erste statische Richtung positiv und beauftragt eine ruhigere Fassung: Coco ohne Schal, Remy nach ausdrücklicher Auswahl ohne Pulli, mit Tablet. Emmis Papier trägt ein oranges Bearbeitungssymbol, Wilmas Klemmbrett grüne Prüfhaken. Diese sprachunabhängigen Zeichen sind Teil der Illustration; Wörter bleiben vollständig im HTML-Katalog.

Aktives Bild: `assets/crew-classroom-v2.webp`, 187.680 Bytes. V1 bleibt erhalten. Ein zusätzlicher gezielter built-in image_gen-Edit, insgesamt zwei Bildaufrufe für die statische Szene, kein Retry; Prompt `IMAGE_PROMPT_V2.txt`. Original V2-PNG lokal erhalten.

Weiße Vorteilsleiste entfernt, Funktionen über übersetzten Dialog zugänglich. Crew-Beschriftungen ohne Karten und doppelte Symbole, Anmeldung ohne umrandeten Button, Codefeld ohne große Hintergrundkarte. Bestehende DE/EN-Texte und zugängliche Bedienelemente bleiben separat. Die Bildkomposition und Identitäten sind weitgehend erhalten; keine neue 3D-/Animationsarbeit.

Aktuelle Browserprüfung erneut 12 Abschnitte bestanden (DE/EN, fünf Breiten, Layout, Dialoge inkl. Funktionen, Tastatur); Desktop DE/Mobil DE visuell angesehen. Prüfbilder/JSON beziehen sich jetzt auf V2. Keine JS-Ausnahmen. Kein echter Gerätetest, App-Anschluss oder Deploy. Das automatische Aktualisieren des offenen In-App-Browser-Tabs war durch eine nicht verfügbare Browser-Sicherheitsprüfung blockiert; die Dateien und isolierten Chrome-Prüfnachweise wurden vorher erfolgreich erstellt. Martin kann die bestehende Vorschau selbst neu laden.


## Revision 3 — Dokumentgrafik verfeinert

Martin bemängelt Emmis großes Symbol als pixelig/kindlich; Wilmas Checkliste gefällt grundsätzlich. Ein gezielter built-in image_gen-Edit ersetzt Emmis Stift-/Stern-Piktogramm durch zurückhaltende orange Korrekturmarkierungen auf einem strukturierten Arbeitsblatt. Wilmas Checkliste behält ihre Bedeutung, mit feineren dunkelgrünen Haken. Prompt: IMAGE_PROMPT_V3.txt. Insgesamt drei statische Bildaufrufe, kein Retry; frühere Fassungen bleiben erhalten.

Aktives Bild: assets/crew-classroom-v3.webp, unveränderte 1536×1024-Auflösung, mit höherer WebP-Qualität95 gespeichert. Alle UI-Texte bleiben editierbares HTML; keine Wörter auf den Dokumenten. Codeänderung ausschließlich Bildpfad in index.html. Neue Bildausgabe visuell geprüft, Dateiformat/Abmessungen/Verknüpfung geprüft. Die vorhandenen Browser-Screenshots und 12 Browserprüfungen beziehen sich ausdrücklich auf Revision2; kein neuer Browserlauf behauptet. Das zuvor gemeldete IAB-Sicherheitsproblem wurde nicht umgangen. Nutzer lädt die lokale Vorschau selbst neu. Keine App-Integration oder Veröffentlichung.


## Interaktive Crew-Vorschau — Wortarten

Die drei Figuren sind über positionierte native Buttons auf Bild und Rollen direkt anklickbar. Remy erzeugt in drei kurzen Phasen einen Wortarten-Test, Emmi verbessert die Aufgabe und fügt ein transparentes kuscheliges Igelbild hinzu, Wilma prüft die Beispielantwort anhand eines Kriteriums und erhöht die Punkte von 0 auf 1 von 1. HTML/CSS-Animationen, vorbereitete Inhalte; kein Provider-Aufruf beim Klicken. Steuerung: Pause/Fortsetzen, Wiederholen, Schließen; Reduced Motion zeigt sofort den Endzustand.

„Crew kennenlernen“ / „Meet the crew“ beginnt eine geführte Folge Remy → Emmi → Wilma mit Weiter/Beenden. Der vom Nutzer gewünschte Hinweis „Tutorial · ca. 6–7 Minuten“ beschreibt das beabsichtigte vollständige Tutorial; die lokale Drei-Schritt-Vorschau ist kürzer und ihre Dauer wurde nicht gemessen. Das vorhandene ausführliche App-Tutorial, Anmeldung und Testzugang werden erst bei der App-Integration angebunden. Der Preview ist nicht deployed.

Laufzeit jetzt `demo-flow.js` plus `interactive-screen.js`, kein zusätzliches Framework. `copy.js` enthält sämtliche neuen UI-, Aufgaben- und Status-Texte DE/EN. `screen.js` ist die erhaltene frühere statische Fassung und wird nicht mehr geladen. Das Igelbild enthält keine Texte. Neuer nativer image_gen-Aufruf fürs Igelmotiv; insgesamt vier Bildaufrufe, Prompt `HEDGEHOG_PROMPT.txt`, Quelle lokal erhalten, WebP 640×552 / 125.718 Bytes mit Alpha. Keine Bildgenerierung der ganzen Szene oder Video-Aufträge.

Vier Ablauf-Tests (`node --test demo-flow.test.cjs`) rot→grün; JavaScript-Syntaxprüfung bestanden. IAB-Prüfung vor dem Wechsel zu Wortarten: EN-Einführung, DE Remy/Pause/Resume/Replay/Schließen/Fokus und Mobile390px ohne horizontalen Überlauf geprüft. `remy-demo.jpg`, `emmi-demo.jpg`, `wilma-mobile-demo.jpg` dokumentieren ausdrücklich noch das frühere Brüche-Beispiel. Anschließend zweimal Browser-Sicherheitsprüfung nicht verfügbar: keine neue Browserprüfung oder Screenshots der Wortarten-Fassung, keine Umgehung. Die Inhaltsrevision und Layout-Ergänzung brauchen noch frische visuelle Browserabnahme. Die ältere verification.json ist ebenfalls historisch. Aktueller Umfang in `evidence/interaction-verification.json`.
