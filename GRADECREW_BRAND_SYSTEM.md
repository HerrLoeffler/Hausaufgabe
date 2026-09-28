# GradeCrew · Produktgestaltung

Stand: 28. September 2026, Version 2.3.1-gc2. Änderungen ausschließlich für Staging.

## Eine Crew, vier verständliche Rollen

| Tier | Rolle | Einsatz |
| --- | --- | --- |
| Pinguin | Hilfe | Einstieg, Tutorial, geführter erster Test |
| Falke | Erstellen | KI-Erstellung, neue Tests, leerer Arbeitsbereich |
| Fuchs | Verbessern | KI-Bearbeitung und Varianten |
| Eule | Prüfen | Aufgabenqualität und Bewertung |

Kein Biber. Kein erzwungenes Akronym. Der Pinguin lässt eine spätere Verbindung zu Ben / Little Pengs offen; eine konkrete Ben-Vorlage liegt noch nicht vor. Die vorhandenen SVGs bleiben austauschbar, ohne Geschäftslogik umzubauen.

Die Figuren sind reduzierte Tierillustrationen mit ruhiger Mimik. Keine Kleidung, Werkzeuge, menschlichen Hände oder übergroßen Augen. Auf Arbeitsansichten maximal eine hervorgehobene Figur je Bereich; keine dekorative Figur an jeder Aufgabe.

## Gestaltungsregeln

- Der Einstieg zeigt Marke und Crew, trennt Schülercode und Lehrerzugang klar und verwendet kurze Texte.
- Dashboard und Editor geben den Aufgaben Platz. Konstante Aktionspositionen, kompakte Statusanzeigen und seltene Aktionen unter „Mehr“.
- Weiß und kühles Hellgrau bilden die Arbeitsfläche. Blau markiert Hauptaktionen; Tierfarben bleiben kleine Akzente.
- Schrift aus dem System, feste Bildmaße, lokale SVGs und keine zusätzliche Schrift- oder Animationsbibliothek.
- Sichtbarer Tastaturfokus, beschriftete Eingaben, größere Hauptaktionen und reduzierte Bewegung bei entsprechender Systemeinstellung.
- Qualitätshinweise brauchen eine Aufgabe und eine Handlung. Figuren ersetzen keine Texte oder Statusmeldungen.

## Technische Umsetzung

Marke und Bilder stehen in HTML beziehungsweise den zuständigen Renderfunktionen. `gradecrew-brand.css` und `workspace.css` werden direkt geladen. Die endgültige Editorstruktur steht im HTML; optionale Erweiterungen erzeugen keine Stylesheets. `interface.js` bündelt Tabs, Fokus, Speicherstatus und gemessene Abstände. Es gibt keinen Beobachter mehr, der beliebige Nutzertexte von „Testify“ in „GradeCrew“ umschreibt. Interne Firebase-Projekte, IDs, Speicherpfade und bestehende Schnittstellen behalten ihre Namen.

`startup.js` trennt App-Start und optionale Erweiterungen. Ein gescheiterter Import zeigt eine wiederholbare Fehlermeldung. Layout- oder Admin-Erweiterungen sind keine Abhängigkeiten des KI-Clients.

Varianten erhalten ihren Wunschtext pro Auftrag. Die Warteschlange kommuniziert über eng geprüfte Ereignisse mit der Kern-App, statt unsichtbare modale Dialoge zu öffnen. Test und Account werden vor Ausführung und Übernahme abgeglichen. „Behalten“ ist eine schwächere, lokal im Test gespeicherte Bestätigung; es löst keine positive globale Qualitätsbewertung und kein Modelltraining aus.

## Referenzen und Übertragung

Gezielte Referenzanalyse; keine Behauptung, tausende Seiten oder angemeldete Konkurrenzprodukte getestet zu haben.

| Referenz | Relevantes Muster | Unsere Entscheidung |
| --- | --- | --- |
| [Linear: UI-Überarbeitung](https://linear.app/now/behind-the-latest-design-refresh) | Arbeitsinhalt trägt mehr Gewicht als Navigation; Aktionen sitzen vorhersehbar. | Kompakter Dashboardkopf und klare Aktionen im Editor. |
| [Squarespace: Designbeispiele](https://www.squarespace.com/blog/graphic-design-website-examples) und [Portfolios](https://www.squarespace.com/templates/portfolio) | Typografie, Abstände und konsistente Bildsprache schaffen Hierarchie. | Prägnanter Einstieg; Tiere als zusammenhängende Bildsprache. Kein Portfolio-Layout für den Prüfungseditor. |
| [fobizz](https://fobizz.com/de/die-fobizz-tools-fuer-schule-und-unterricht/) | Angebote werden an konkreten Lehreraufgaben erklärt. | Natürliche Verben „Erstellen“, „Verbessern“, „Prüfen“ und kurze Hilfen. |
| [Exam.net](https://exam.net/cheat) | Durchführungssicherheit ist eine eigene Produkteigenschaft. | Separater technischer Ausbauplan, keine Sicherheit durch bloße Optik behaupten. |

Das sind Übertragungen auf GradeCrews Abläufe, keine nachgewiesenen Conversion- oder Lernerfolgseffekte. Visuelle Endkontrolle auf Staging und Rückmeldungen aus dem Kollegium bleiben notwendig.

Der genaue Umfang je Ansicht, ausgeführte Tests und offene visuelle Prüfungen stehen in `LAYOUT_AUDIT_GC2.md`.
