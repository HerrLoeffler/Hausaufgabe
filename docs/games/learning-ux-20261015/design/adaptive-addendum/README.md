# GradeCrew-Nachtrag: Punkte und Arbeitsweisen

Task GC-GAMES-LEARNING-UX-01, 16.10.2026. Diese Dateien sind reine Dokument- und Designquellen. Die Ansichten sind statische Vorschläge, keine implementierte Anwendung und kein freigegebener Punktevertrag.

Der Manuskriptowner bearbeitet ausschließlich die Ergänzung unter ../../ERGAENZUNG-PUNKTE-ARBEITSWEISEN-20261016.md. Der Nachtragsrenderer liest sie; die ursprüngliche MASTERPLAN.md und die 61-seitige Haupt-PDF werden nicht verändert. build_addendum.py prüft die Haupt-PDF vor und nach dem Satz gegen ihren freigegebenen SHA256.

- `mockups/N1…svg`: Lehreransicht mit getrennten Rundenregeln, Arbeitsweisen und Anforderungen.
- `mockups/N2…svg`: Stift-und-Block-Beispiel der angekündigten Punkte-Challenge, Orientierung und Rundenzeit getrennt.
- `mockups/manifest.json`, `index.html`: Bildbeschreibungen und statische Galerie.
- `create_addendum_views.py`: bearbeitbare native SVG-Quellen. Das bestehende Originalzeichen wird über ../assets/brand-icon-v1.svg eingebunden, keine neue Hauptmarke gezeichnet.
- `render_assets.cjs`: Sharp-Render der beiden Ansichten und des vorhandenen Markenzeichens nach preview/. Diese PNGs sind Zwischenstände und müssen nicht ins Repository kopiert werden.
- `build_addendum.py`: eigenständiger PDF-Satz aus der Ergänzungs-MD mit Inhaltsverzeichnis, Seitenzahlen, Lesezeichen, Text- und Layoutprüfung.
- `build_print_html.py`: ergänzende HTML-Lesefassung mit eingebetteten SVGs; feste PDF-Pagination und Browserumbruch sind unterschiedlich.
- `contact_pdf.py`: lokale Kontaktbögen der gerenderten Seiten für die vollständige Sichtprüfung.
- `DESIGN_HANDOFF.md`: tatsächliche Quellen-, Rechte-, Scope- und Prüfnachweise.

Auf dem geprüften Mac: Python und Node aus dem mit load_workspace_dependencies ermittelten Codex-Bundle 26.1013.11914 verwenden. Reihenfolge: create_addendum_views.py, render_assets.cjs, build_addendum.py; optional build_print_html.py. ReportLab nutzt die lokal vorhandenen Arial- und Trebuchet-MS-Schriften. Keine Fontdateien im Lieferpaket. Das bestehende Markenasset und die ursprüngliche Haupt-PDF müssen an ihren relativen Stellen vorhanden sein. Ein erneuter Satz kann wegen PDF-Metadaten einen neuen Dateihash erzeugen; für Inhaltsgleichheit zusätzlich den Manuskript-SHA256 vergleichen.

Das Lieferpaket liegt unter ../../final/ mit eindeutigem Nachtrag-Dateinamen. Die Prüfnachweise gehören ausschließlich zur jeweils genannten Nachtragfassung und übertragen keinen früheren Review-PASS auf einen neuen Text. Keine Produkt-, Geräte-, Unterrichts- oder Deployabnahme aus der Dokumentprüfung ableiten.
