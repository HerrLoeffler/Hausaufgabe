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

Die Eingangsprüfung aller neun Ressourcen ist abgeschlossen und unabhängig vom Konzeptchat kalibriert. Die korrigierten Feldbelege und getrennten Einsatzschätzungen stehen in reader-resource-metadata-validated-20261022.*. Der Quelljahrgang der Kopiervorlagen bleibt unbekannt; Arbeitsheftklasse1 ist über EinleitungPDF3 belegt. Der DOC-Fußbereich nennt Bayern/erstesSchuljahr bei widersprüchlicher Vorlagenkennung; Konflikt offen. Keine pauschale Inhalts- oder Laufzeitfreigabe.

Der Versuch R003 mit tatsächlich angebotenem Konzeptions-PDF ist ohne Downloadereignis/exakten Dateipfad geblieben; helper zeigt eine leere Seite. Attempt023650bd31b4492d89c9b188e2b62b5d bleibt als ungeklärt erhalten. Kein weiterer Abruf desselben Schlüssels aus Vermutung. Am22.10. meldet die native Browsersteuerung einen gesperrten Mac und verlangt manuelles Entsperren; Nutzer wurde im laufenden Chat darum gebeten. Keine native Browserfortsetzung bis zum Entsperren. Drei Luna-Dateiworker arbeiten unabhängig weiter; keine125Buchagenten oder Hintergrunddienst behauptet.

## Zweiter gesicherter Teilschritt — 22.10. vormittags

- Downloads read-only frisch inventarisiert:1782PDF-Dateien (1083unterschiedliche Hashes,699zusätzliche identische Kopien) und22ZIP-Dateien (21unterschiedliche Hashes). Keine Dateien mit den üblichen Teil-Download-Endungen gefunden. Dies ist der gesamte untersuchte Dateibaum, keine125-Buchsammlung und keine Inhaltsanalyse.
-907unterschiedliche bereits registrierte PDF-/ZIP-Quellen gehasht gegen vorhandene Archive abgeglichen;171fehlende Originalkopien neu privat gesichert. Neun weitere registrierte DOC-/Bild-/Audioquellen mit tatsächlichem Hash wiedergefunden. Zwei registrierte PDF-Kinder ausZIP wiederhergestellt. Damit sind alle918historischen Register-IDs lokal wieder auffindbar; die Register nutzen verschiedene Hashpräfixlängen und sind keine Buchzählung.
-20gültige ZIP-Originale privat gesichert.3371Kindobjekte einschließlich16verschachtelterZIPs vollständig für CRC/SHA gestreamt,2749unterschiedliche Kindhashes.622wiederholte Kindvorkommen. Ein weiteresZIP ist0Bytes/defekt; Ursprung und Ersatzdownload bleiben offen. Keine Dateien ausgeführt; Namen und Parent-/Child-Herkunft privat.
- Quellen b0992c0ad3b74948(106Seiten),2956ad5d9a7b5d3f(40Seiten),1238532f17dc6ece(51Seiten) vollständig textlich und visuell erstgelesen.203/38/48Aufgaben- beziehungsweise Planungsgruppen,197Seiten- und197Visualrecords. Eine Gruppe ist nicht zwangsläufig eine vollständig segmentierte Einzelaufgabe. Gruppierungen und offene Antworten werden anschließend konkret verfeinert; unabhängige Gesamtprüfung fehlt.
- Root-Gegenprüfung für PDF6/7/8/9/88 der Kopiervorlagen:27Bild-/Zielkarten einzeln unabhängig zugeordnet,9Bildstatements mit Beweisgrenzen. Ofen stattShampoo und Auslaut-CH/NG korrigiert. Vergrößerte Szene zeigt vier fliegende Insekten; Namen/Temperatur/Farbe/Geräusch sind nicht gleichermaßen aus dem Bild beweisbar.
- R115Hauptbuchseite8:63Einzelhandlungen inklusive jederTeilrechnung, Musterfortsetzungen und offenenKonstruktionen gespeichert. Root hat gelöst, andererLuna-Worker alle63IDs unabhängig gelöst und mitKommentarPDF22 verglichen:59geschlossene Zahlenlösungen,1Strategieerklärung,3offeneBeispiele ohne Rechenabweichung. DreiVisuals und dreiDidaktikfolgen dokumentiert. Keine Gesamtbuchprüfung, amtlichesMapping und Laufzeitfreigabe bleiben offen.
- Die168Arbeitsheftseiten und369Mathematik-Lehrkraftseiten sind noch in Arbeit; dort frühe dauerhafte Seitenpakete, offene Hör-/Bildantworten und Gruppenkennzeichnung erhalten. Keine fertigen Zahlen für laufende Pakete vorwegnehmen. Der dritteWorker verfeinert nach Abschluss seiner197Seiten nun Einzelitems.
- Konzeptchat hat neunMetadaten plusR115 unabhängig kalibriert; Beitrag material-jahrgangskalibrierung-20261022.md übernommen. Die3neuenR115Didaktikfolgen wurden zur getrennten Konzeptbewertung beauftragt. Keine Änderung der kanonischen Konzeptdatei oder des Produktpools daraus behaupten.

Weiterhin **Bücher vollständig:0/125**. Tatsächlich belegt sind Originalerhalt, seitenbezogene Erstanalysen und eine eng begrenzte unabhängige Einzelprüfung. Der volleDownloadpilot ist nicht bestanden. Nächster Browser-Schritt nach manuellem Entsperren: ungeklärte externe Versuche zuerst mit sichtbarem Downloadstatus abgleichen, dann den regulären Export an R003/R100 prüfen; nicht erneut dieselbeDatei blind laden. Lokale Inhaltsarbeit wird währenddessen fortgesetzt.
