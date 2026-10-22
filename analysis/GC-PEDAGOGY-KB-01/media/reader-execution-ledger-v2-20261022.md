# Ausführung V2 — GC-PEDAGOGY-KB-01

Plan: `docs/superpowers/plans/2026-10-21-regal-vollanalyse-v2.md`. Owner bleibt GC · Pädagogisches Material. Keine Produktänderung oder Deployfreigabe. Originale und technische Herkunftsbelege privat.

## Bereits ausgeführt

- Aktuellen main-Einstieg und unveränderte Regeln gelesen. Development-Status39681027160 erfolgreich auf7342609fb90bffeaecf6f07855173936ef1023bc geprüft. Danach lang blockierter Browseraufruf; vor Repo-Änderungen aktuellen Stand erneut prüfen.
- Vier lokale Programme gebaut: reader_queue.py, reader_ingest.py, reader_report.py und test_reader_control.py. Unabhängiger enger Review fand fehlende überprüfbare Dateiprovenienz, unzureichende Dateitypprüfung, falsche mögliche Komplettmeldung und doppelten Hashspeicher bei verschiedenen Endungen. Diese Befunde korrigiert und gezielte Fälle ergänzt.
- Root hat20/20 gezielte Tests am22.10. erfolgreich ausgeführt. Die Tests prüfen lokale Steuerung/Dateiprüfung, nicht die Vollständigkeit der Bücher oder drei gleichzeitige Browserdownloads.
- Private SQLite-Steuerung tatsächlich angelegt und125Vorlagen idempotent importiert. Sichtbarer CSV-Export: reader-control-progress-v2-20261022.csv. Kein Buch vollständig.
- Routine-Dateiprüfung erkennt PDF, Bilder, ZIP/OOXML, WAV; MP3/MP4 nur bei vorhandener Medienprüfung. Unbekannte/HTML-/Teildateien werden abgelehnt. Originale atomar mit vollem SHA gesichert. Herkunftsbeleg muss zu Attempt, Ressource und tatsächlichem Dateipfad passen.

## Tatsächlicher Browserpilot

1. R001, PDF: downloadMedia am HTML-Weiterleitungslink lieferte eine HTML-Datei statt PDF, Ereignis am Ausgangstab eines neuen Popups lief in Timeout. Nicht als Material gezählt. Funktionierender Weg: angemeldeter Same-Origin-Tab, Downloadereignis vor Navigation auf den tatsächlich angebotenen Link registrieren, zurückgegebenen exakten Pfad prüfen. Ergebnis22PDF-Seiten, SHA6b47874d62ea10d8c92fcce4ef9017d0e82bfefcfd42171b8d1fbc4d99a97871. Absichtlicher Baseline-Dublettentest zu vorhandenem Material; keine neuen Inhalte. Beobachtung nachträglich transparent in die neue Queue übernommen.
2. R100, PDF: Reader und methodische Hinweise zugänglich, regulärer Downloadknopf bisher ohne bestätigtes Ereignis/Dateipfad. Attempt9d9f0cc2908f49a0ae6286fcf22dc675 ist uncertain; keine Wiederholung oder Archivbuchung aus bloßer Vermutung.
3. R115: regulär verlinkter Kommentar und PDF-Druckansicht mit164Seiten geöffnet. Native PDF-Speicheraktion blieb ohne verlässlichen Abschluss; kein neuer vollständiger Kommentar gezählt. Ein tatsächliches Hauptbuchseitenbild wurde über downloadMedia mit genauem Pfad zurückgegeben: Seite8, PNG827×1170, SHA0013cff36fb3ae6f7ef8de9c6a983bc9b336e0fc286e48036b56d5ff6ffba093,70767Bytes. Privat validiert und archiviert. Ursprünglich irrtümlich vor Angebot reservierter Ressourcenname pilot-commentary wurde anhand separater Mappingevidenz ausdrücklich zu mainbook-page8 korrigiert; derselbe Attempt und seine Historie bleiben erhalten. Dies ist eine Seite, kein ganzes Buch und kein Kommentar.

**Der gesamte Pilot ist nicht bestanden.** Zwei Exportwege sind technisch belegt; PDF-Sammlung im zweiten Reader, weiterer Exportumfang und echte Parallelzuordnung bleiben offen. Keine Freigabe für drei parallele UI-Sammler. Weiterarbeit an funktionierenden unabhängigen Quellen bleibt möglich.

## Unterbrechung und Wiederaufnahme

Der letzte Bilddownload brauchte laut Tool33179Sekunden trotz gesetztem15000ms-Downloadtimeout und25000ms-Aufrufzeitlimit. Die konkrete Ursache der Blockade ist nicht nachgewiesen. Während des blockierenden Aufrufs wurde kein weiterer Buchdurchlauf ausgeführt. Die Ergebnisdatei existiert tatsächlich. Es wurde kein zweiter Download ausgelöst: explizite Late-Completion-Reconciliation erneuerte denselben Attempt mit vollständigem Ereignis- und Mappingnachweis, anschließend normaler Ingest. Abgelaufene oder unklare Versuche werden nicht automatisch neu gestartet.

## Bewertung und nächster Ausführungsschritt

0/125 Bücher vollständig. Dieser Lauf hat Steuerung, Datenbank, geprüfte Wiederaufnahme und ein neues Hauptbuchseitenbild geliefert, keine125Buchanalysen. Vorhandene neun Originale/1040PDF-Seiten und470gelesene Kommentarseiten bleiben getrennte frühere Bestände.

Ruling: Wegen des ungeklärten PDF-Exports im zweiten Reader zunächst ein UI-Sammler; funktionierende Readerfamilie seriell sammeln und offene Reader separat halten. Kosten falls diese Einordnung falsch ist: langsamere Sammlung, keine stillschweigende Falschzuordnung. Der Teilpilot wird nicht als global erfolgreich umbenannt.

Aktiv ist ein begrenzter Luna-Eingangsprüfer für Originalmetadaten aller neun vorhandenen Ressourcen, getrennte Dateien reader-resource-metadata-validated-20261022.*. Er prüft Jahrgang/Fach/Schulart/Land an tatsächlichen Originalen; keine pauschale Inhalts- oder Laufzeitfreigabe.

Genau nächster Schritt: R003 im geöffneten funktionierenden Reader anhand seiner tatsächlichen Materiallinks sammeln; neue Aktionen vorab claimen, exakten Ereignispfad speichern und nach Dateiprüfung buchen. Keine Behauptung laufender125Buchagenten oder eines Hintergrunddienstes.
