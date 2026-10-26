# GradeCrew Kollegium — Revision v4

Task GC-TEACHER-INTRO-20261028. Zehn Folien, etwa neun Minuten, Vortrag am28.10.2026. Basis ist ausschließlich Martins bearbeitete Downloadsdatei mit SHA256 f88723f3e281afad0ec7c018c5e18d48579d6ee44beefb22573459024495e753. Nutzerfolie1 ist unverändert erhalten.

| Folie | Inhalt | Erklärbild |
|---|---|---|
|1|GradeCrew|Originalcrew und Originalzeichen der Nutzerfolie|
|2|Website, Lehrkräfte-App, Secure|Neue Gerätefamilie|
|3|Neuer Test, Thema, Wünsche/Umfang, dann Erstellung|Neues Wasserkreislaufmaterial|
|4|Materialdateien, eigene Bilder, optionale KI-Bilder|Dasselbe Material als Testgrundlage|
|5|Audioarten und Anzahl wählen, Aufnahme prüfen|Neue Kopfhörer/Tablet-Illustration|
|6|Inhalt prüfen, speichern, Schüleransicht|Dasselbe Material zur fachlichen Prüfung|
|7|Start/Zeit, Ergebnisanzeige, veröffentlichen und teilen|Gerätefamilie als Übergabeziel|
|8|Code/Name, bearbeiten, Abgabebestätigung|Neue anonyme Person am Tablet|
|9|Bewertung prüfen, Lösungen freigeben|Neue Ergebnisauswertung|
|10|Feedback markieren, beschreiben und senden|Neuer Feedbackhinweis|

Gestaltung: dunkelviolett wie Nutzerfolie1, originales Logo obenlinks, großer Titel, großes Bild und maximal drei kurze Bedienblöcke. Technische Zugangsdetails stehen in den Referentennotizen. Die Bilder sind neue Illustrationen und keine Original-UI. Bedienungstexte bleiben editierbar. Bildprompts und SHA256 stehen in art/prompts-and-assets.md.

Ausgabe: files/GradeCrew_Kollegium_20261028_v4_final.pptx. SHA256 1dc4185caccbe9cb3031ce1c7abbf78edb39e33a404bb1146990397e695290c5. Kontaktbogen preview/kontaktbogen-v4.png. Zehn finale PNGs wurden erneut gerendert. Cover samt24Abhängigkeiten bytegleich und imPNGpixelgleich. Paket/Layout/Font/Reimport bestanden. Native PowerPoint nicht geöffnet.

Lokaler Build mit gebündelter Node-Runtime und @oai/artifact-tool: build/build-v4.mjs, danach build/graft-cover.py, danach build/finalize-v4.mjs. RUNTIME_NODE_MODULES muss auf den gebündelten Paketpfad zeigen. Finalizer überschreibt keine bestehenden finalen Dateien oder Receiptpfade.
