# GradeCrew Lernspiele: Design- und Satzquellen

Task GC-GAMES-LEARNING-UX-01. Reine Planartefakte; kein Produktcode, keine Funktionsdemo, kein Deployment.

- `mockups/01…12.svg`: editierbare Konzeptansichten mit unverändertem bestehenden GC-Zeichen; `manifest.json` beschreibt Zweck und Geräteformat.
- `assets/brand-primary-v1.svg`, `brand-icon-v1.svg`: unveränderte sichtbare Originalpfade aus der belegten Brand-Core-Quelle, lokal mit zusätzlichem finalem Zeilenumbruch; keine neue Runtime-Logoquelle.
- `index.html`: statische Galerie. Verweist auf die SVG-Quellen.
- `DESIGN_HANDOFF.md`: Auftrag, Gestaltungsregeln, Herkunft/Rechte und echte Prüfungen.
- `build_book.py`: Satz der vollständigen MASTERPLAN.md und zwölf Ansichten mit ReportLab.
- `build_print_html.py`: eigenständige HTML-Lese-/Druckfassung mit eingebetteten SVGs; Browserumbruch unterscheidet sich von der PDF.
- `render_assets.cjs`: rendert Quellen mit Sharp nach preview/. Diese PNGs sind reproduzierbare Zwischenstände und müssen nicht im Repository liegen.
- `verify_book.py`: prüft PDF-Safe-Area, Links und Hash. Textblockabgleich ist Teil von build_book.py.
- `contact_pdf.py`, `check_contact.py`: lokale Sichtprüfungsbögen. Keine Runtime-/Geräteprüfung.

## Reproduktion auf dem geprüften Host

Die Skripte verwenden die über load_workspace_dependencies gefundene Codex-Runtime 26.1013.11914 und die auf Martins Mac vorhandenen Arial-/Trebuchet-Schriften. Keine Schriftdatei wird ausgeliefert. Zuerst create_mockups.py, dann render_assets.cjs ausführen, danach build_book.py und verify_book.py. build_print_html.py erzeugt optional die HTML-Fassung. Der fertige PDF-Hash ist der Freigabebezug; erneutes Erstellen kann wegen PDF-Metadaten einen anderen Dateihash ergeben. Inhaltliche Quelle über source_sha256 abgleichen.

Die feste Lieferfassung liegt unter ../final/. MASTERPLAN.md ist Eigentum des Planowners und wird durch diese Skripte ausschließlich gelesen.
