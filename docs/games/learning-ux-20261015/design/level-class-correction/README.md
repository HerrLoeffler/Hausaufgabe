# Korrekturplan: Level und Klassenrunde

Task GC-GAMES-LEARNING-UX-01. Eigene kompakte Plan-PDF, keine Produktänderung. Dieser Satz ersetzt nicht die alten Dateien; der Inhalt des Korrekturmanuskripts legt den Vorrang zur bisher freien Arbeitsweisen-Auswahl fest.

`build_correction.py` erhält den vom Planowner eingefrorenen Markdownpfad als einziges Argument. Er liest den Text und die bestehende Markengrafik, setzt ein kompaktes Dokument mit anklickbaren Inhalten und Lesezeichen und prüft Textübernahme, Seitenränder, interne Links sowie die beiden alten PDF-Hashes vor/nach dem Satz. Die Output-Datei hat einen eigenen eindeutigen Namen unter ../../final/.

`contact_pdf.py` erstellt die lokalen Sichtprüfungsbögen aus den mit Poppler gerenderten Seiten unter /private/tmp/gc-level-class-correction-review/. Diese Vorschauen müssen nicht ins Repo kopiert werden. `DESIGN_HANDOFF.md` enthält Quellen und tatsächlichen Abschlussnachweis. Der Planowner übernimmt als einziger Repo-Schreiber die unveränderten eingefrorenen Dateien.

Bewährte Codex-Workspace-Runtime 26.1013.11914 verwenden. ReportLab/Python und Poppler sind vorhanden. Originalzeichen über die bereits geprüfte Dokumentreferenz ../preview/brand-icon-v1.png aus ../assets/brand-icon-v1.svg; lokal vorhandene Arial- und Trebuchet-MS-Schriften, keine Fontdateien im Paket. Bei Reproduktion zuerst die vorhandene Markenreferenz wie im Hauptbuch rendern. Kein Mediengenerator, keine neue Grafikrecherche, kein erneuter Browser-/Runtime-/Gerätetest und keine Aussage über einen bereits laufenden Klassenscore.

Ein neuer Dateihash nach erneutem PDF-Satz kann allein aus PDF-Metadaten entstehen. Der unveränderte Manuskript-SHA256 ist deshalb zusätzlich der Inhaltsbezug; vor einer Auslieferung ist der jeweils tatsächlich geprüfte PDF-Hash maßgeblich.
