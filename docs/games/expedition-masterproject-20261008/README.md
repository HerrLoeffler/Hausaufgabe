# Expedition-Masterprojekt vom 08.10.2026

Task **GC-GAMES-ESCAPE-VISUAL-01**, Überarbeitung der abgelehnten nativen Erstfassung. Dokumentationsstufe `branch_only`; kein neuer spielbarer Build und kein Deploy.

## Zum Ansehen

- Lokal `index.html` öffnen: Bildwelt mit13 Tafeln und244 Motiven, Spielbuch, Drehbuch, Bauvertrag und Bildprüfung.
- `Expedition-Masterprojekt.pdf`:96 Seiten. HTML und die große PDF sind lokale Exporte; Quellen und PNGs werden auf GitHub gesichert. Beide Exporte sind mit build_book.py rekonstruierbar und werden nicht zusätzlich eingecheckt.
- Lesbare Quellen:01-spielbuch.md,02-drehbuch.md,03-bauvertrag.md,04-bildpruefung.md,05-bildkatalog.md.

Der lokale HTTP-Leser läuft während dieser Sitzung auf127.0.0.1:8785, nur Loopback. Kein öffentlicher Server. Automatische Browserprüfung durch nicht verfügbare Browser-Sicherheitsprüfung blockiert, keine Umgehung. HTML-Ressourcen und JavaScript-Syntax geprüft; kein bedienbarer Browserdurchlauf behauptet. PDFseiten1,8,23,43,76,77,94,96 gerendert und visuell geprüft.

## Rekonstruktion auf diesem Mac

build_book.py erzeugt HTML, PDF, Bildkatalog, Mosaikdaten und verification.json. Für das Dokument nutzt es vorhandene gebündelte ReportLab-/Pillow-/pypdf-Pakete und Arial-Schriften. Keine Installation und keine neuen Spielbibliotheken.

Interpreter: `/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 build_book.py`

## Bildproduktion und Belege

13 neue Generierungen plus1 gezielte Korrektur:14 erfolgreiche eingebaute image_gen-Aufrufe. Finale13 PNGs in boards/. Alle Originale erhalten. prompts.json,correction-prompt.json und generation-receipts.json halten Prompt, Zweck und Versuchshistorie fest. Bildabweichungen in04-bildpruefung.md. Keine244 fertigen3D-Assets.

Vier Bereiche, zwölf Stationen: sieben schulisch und fünf logisch,58,33 % nach Zählregel. Geplante590 aktive Sekunden, davon330 schulisch,55,93 % als Zielrechnung. Grund-/Transferantworten, sechs Symbolfolgen, drei Wegkandidaten und zwölf Mosaikkonfigurationen geprüft. Tatsächliche Laufzeit bleibt offen.

Kein neuer Unreal-/Maus-/Touch-/Mobile-/GradeCrew-Live-Nachweis. Nächster Schritt nach Entwurfsprüfung: tatsächlicher Dorf-Ausschnitt mit gewählter Optik und zuverlässigen Engine-Widgets. Source-PR171 bleibt gesichert; Witness-PR173 ist unveränderte methodische Referenz. Production und Web-Releases unverändert. Details in HANDOFF.md.
