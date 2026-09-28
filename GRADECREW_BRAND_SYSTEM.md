# GradeCrew · Produktgestaltung

Stand: 28. September 2026, Version 2.3.1-gc2. Änderungen ausschließlich für Staging.

## Eine Crew, vier verständliche Rollen

| Tier | Rolle | Einsatz |
| --- | --- | --- |
| Pinguin | Hilfe / Guide | Einstieg, vollständige Produkttour, Orientierung |
| Elefant | Erstellen | KI-Erstellung, neue Tests, erster Entwurf |
| Fuchs | Verbessern | KI-Bearbeitung und Varianten |
| Eule | Prüfen | Aufgabenqualität, Veröffentlichung und Bewertung |

Kein Biber, kein Falke und kein erzwungenes Akronym. Der Pinguin lässt eine spätere Verbindung zu Ben / Little Pengs offen; eine konkrete Ben-Vorlage liegt noch nicht vor. Der Elefant bekommt bewusst einen großen, ruhigen Kopf: viel Platz zum Denken statt eines Geschwindigkeitsmotivs. Die SVGs bleiben austauschbar, ohne Geschäftslogik umzubauen.

Die Figuren sind reduzierte Tierillustrationen mit ruhiger Mimik. Keine Kleidung, Werkzeuge, menschlichen Hände oder übergroßen Augen. Auf Arbeitsansichten maximal eine hervorgehobene Figur je Bereich; keine dekorative Figur an jeder Aufgabe.

## Die Crew-Tour ist ein Teil des Produkts

Das Onboarding ist keine Slideshow mehr. Der Pinguin führt neue Lehrkräfte durch einen echten, vorbereiteten Beispieltest „Colours & school things“ und stellt seine Kollegen dort vor, wo ihre Aufgabe sichtbar wird:

1. Pinguin: Willkommen und Orientierung.
2. Elefant: KI-Erstellung; Fach, Klasse, Thema, Aufgabenanzahl und Punkte werden sichtbar in das echte Formular geschrieben.
3. Ein vorbereiteter Demo-Test wird ohne kostenpflichtigen KI-Aufruf importiert.
4. Eule: positive/negative Aufgabenbewertung und Qualitätskontrolle.
5. Fuchs: KI-Bearbeitung und Varianten werden im Tutorial ohne API-Kosten simuliert, aber an den echten Editorfeldern durchgeführt.
6. Pinguin: Testeinstellungen und Schüleransicht.
7. Eule: Veröffentlichen, Code/QR, Live-Status und Ergebnisse.
8. Abschluss: „Willkommen in der Crew“ und Rückkehr zu „Meine Tests“.

Der Demo-Test bleibt als normaler Entwurf beziehungsweise veröffentlichter Beispieltest im Account, damit die Lehrkraft danach weiterprobieren kann. Tutorial-Smileys und die simulierten Fuchs-Aktionen dürfen kein globales KI-Feedback und keine kostenpflichtigen KI-Aufrufe erzeugen.

Die Tour verwendet vier abgedunkelte Flächen um das jeweils echte Zielelement. Dadurch bleibt der markierte Button tatsächlich klickbar; ein vollflächiges Overlay darf den gezeigten Klick nicht mehr blockieren. Ein Einstieg „Crew kennenlernen“ bleibt auf dem Dashboard verfügbar. Neue Accounts ohne Tests erhalten die Tour automatisch; bestehende Nutzer starten sie bewusst über diesen Button.

## Gestaltungsregeln

- Der Einstieg zeigt Marke und Crew, trennt Schülercode und Lehrerzugang klar und verwendet kurze Texte.
- „Mit KI erstellen“ ist der primäre Startweg. Manuell und Vorlagen bleiben vollständig erreichbar, sind aber visuell nachgeordnet.
- Dashboard und Editor geben den Aufgaben Platz. Konstante Aktionspositionen, kompakte Statusanzeigen und seltene Aktionen unter „Mehr“.
- Weiß und kühles Hellgrau bilden die Arbeitsfläche. Blau markiert Hauptaktionen; Tierfarben bleiben kleine Akzente.
- Schrift aus dem System, feste Bildmaße, lokale SVGs und keine zusätzliche Schrift- oder Animationsbibliothek.
- Sichtbarer Tastaturfokus, beschriftete Eingaben, größere Hauptaktionen und reduzierte Bewegung bei entsprechender Systemeinstellung.
- Qualitätshinweise brauchen eine Aufgabe und eine Handlung. Figuren ersetzen keine Texte oder Statusmeldungen.

## Technische Umsetzung

Marke und Bilder stehen in HTML beziehungsweise den zuständigen Renderfunktionen. `gradecrew-brand.css` und `workspace.css` werden direkt geladen. Die endgültige Editorstruktur steht im HTML; optionale Erweiterungen überschreiben das Workspace-Layout nicht. `interface.js` bündelt Tabs, Fokus, Speicherstatus und gemessene Abstände. Es gibt keinen Beobachter mehr, der beliebige Nutzertexte von „Testify“ in „GradeCrew“ umschreibt. Interne Firebase-Projekte, IDs, Speicherpfade und bestehende Schnittstellen behalten ihre Namen.

Die neue Produkttour liegt isoliert in `gradecrew-tour.js` und `gradecrew-tour.css`. Ihre Styles verwenden ausschließlich Tour-/Branding-Selektoren und verändern nicht nachträglich die Struktur des Editors. `startup.js` trennt App-Start und optionale Erweiterungen. Ein gescheiterter Import zeigt eine wiederholbare Fehlermeldung. Layout- oder Admin-Erweiterungen sind keine Abhängigkeiten des KI-Clients.

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
