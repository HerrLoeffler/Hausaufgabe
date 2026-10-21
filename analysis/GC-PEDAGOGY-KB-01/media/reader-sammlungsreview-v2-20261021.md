# Read-only Prüfung: parallele Reader-Sammlung v2

**Task:** GC-PEDAGOGY-KB-01 · **Umfang:** enges Review der sicheren Sammlung, kein Implementierungs- oder Downloadversuch. Regeln auf aktuellem `main` gelesen: `START_HERE.md`, `AGENTS.md`, `GRADECREW_STATE.json`, `TODO.md`, `workstreams/README.md` und `docs/CHAT_CONTRACT.md`. Die GradeCrew-Central-Lookups konnten für diese ID keine registrierte Aufgabe/Übergabe liefern; maßgeblich waren der lokale bestehende Handoff und die ausdrücklich übergebene Taskbeschreibung. Keine Tests, Browseraktionen, Downloads, Gitänderungen oder Produktänderungen.

## Befund und Entscheidung

**Drei parallele UI-Sammler sind derzeit nicht freigegeben.** Das Ingest-Skript bindet die ausgewählte Reader-Aktion nicht an eine bestimmte Datei: Es nimmt die jüngste PDF aus Downloads und akzeptiert sie anhand eines 180-Sekunden-Fensters (`analysis/GC-PEDAGOGY-KB-01/scripts/ingest_latest_reader_download.py:7-8`). Bei parallelen Downloads kann dadurch eine fremde oder noch nicht abgeschlossene Datei dem falschen Medium zugeordnet werden. Ein Hash nach der Auswahl schützt vor späterer Beschädigung, belegt aber nicht die Herkunft der Auswahl (`…/ingest_latest_reader_download.py:9-16`).

**Bis der Pilot besteht: ein UI-Sammler plus zwei lokale Validatoren.** Die Validatoren prüfen unabhängig lokale Dateien, Hash-/Journalkonsistenz, Vollständigkeit und Seitenpakete; sie lösen keine UI-Downloads aus. Der bekannte `waitForEvent(download)`-Weg ab `about:blank` bleibt ausgeschlossen: das Herkunftssicherheitsgate hat ihn abgelehnt. Keine Umgehung oder Wiederholung dieses Wegs. Normale Reader-Downloads funktionieren seriell; der genaue PDF-Pfad ist damit noch nicht belegt. Der vorhandene Bild-Speichern-Link mit `downloadMedia` lieferte einen exakten Pfad, beweist aber keine PDF-Fähigkeit.

## Minimaler Pilot vor mehr UI-Parallelität

Jeder Fall muss ein dauerhaftes, datensparsames Ereignisprotokoll aus **vor der Aktion reserviertem Ressourcen-Schlüssel → sichtbarer Reader-/Auswahlzustand → konkreter UI-Aktion → genauem finalem Dateipfad → Dateigröße und SHA-256** ergeben. Der Pfad muss über einen tatsächlich verfügbaren, unterstützten UI-/Download-Beleg kommen; eine angenommene API oder bloß zeitliche Nähe zählt nicht.

1. **Serieller PDF-Baselinefall:** eine Ressource auswählen, Aktion auslösen und exakten finalen Pfad der abgeschlossenen Datei belegen. Ingest muss exakt diese Datei archivieren; Hash und Größe müssen nach Kopie übereinstimmen.
2. **Neueste-Datei-Decoy:** während einer Auswahl wird eine andere, jüngere PDF in Downloads erzeugt. Das Ergebnis muss weiterhin auf den belegten Aktionspfad zeigen; andernfalls muss der Lauf sicher stoppen.
3. **Zwei Ressourcen, gleiche Downloadnamen oder gleiche Bytes:** Aktionen müssen getrennt zugeordnet werden. Gleiche Bytes dürfen einmal gespeichert und beiden geprüften Ressourcenbeziehungen zugeordnet werden; ein gleicher Name ist kein Identitätsbeleg. Gleicher Hash bei unerwarteter Auswahl stoppt zur Prüfung.
4. **Unklarer Abschluss/Teil-Download:** UI-Abbruch, verzögerte Datei oder temporäre Endung muss `uncertain`/`partial` ergeben, ohne Archiv- oder Vollständigkeitsbuchung und ohne automatische Wiederholung.
5. **Parallelitätstest für Freigabe:** nur wenn Fälle 1–4 zuverlässig sind, drei unabhängige Reader-Aktionen gleichzeitig ausführen; jede Zuordnung muss bei vertauschter Abschlussreihenfolge exakt bleiben. Jede falsche, fehlende oder mehrdeutige Zuordnung ist ein Pilotfehler.

**Freigaberegel:** Erst nach bestandenen Fällen 1–5 mit reproduzierbaren Belegen auf drei UI-Sammler erhöhen. Bis dahin bei einem bleiben. Es gibt vier Sitzungsplätze einschließlich Root, also drei mögliche Unteragenten. Diese Kapazität ist keine Freigabe für parallele UI-Downloads; zwei Unteragenten bleiben vorerst lokale Validatoren.

## Identität, Lease und Buchung

- **Buchidentität:** eigens vergebener interner, stabiler `book_key`, erst nach Abgleich der tatsächlich geöffneten Readerquelle. Regalposition allein ist keine dauerhafte Identität; die Abdeckung markiert die historische Zuordnung noch als zu prüfen (`analysis/GC-PEDAGOGY-KB-01/media/reader-resource-coverage-20261021.csv:2-126`). Keine Titel, Autoren, Originalnamen oder Plattformkennungen in diesem Prüfbericht bzw. öffentlichen Register.
- **Ressourcenidentität:** `resource_key = book_key + interne Rolle/Kategorie + bestätigter UI-Abschnitt/Umfang + Format/Variante`. Sammelpaket und Einzeldokumente sind unterschiedliche Ressourcen; eine Ressource kann mehrere Dateien/Kindressourcen enthalten. Den `resource_key` erst nach sichtbarer Zuordnungsprüfung vergeben. Keine Plattform-ID voraussetzen.
- **Lease:** atomar pro `resource_key` reservieren (Owner, Ablaufzeit, monotoner Fencing-Zähler). Nur der aktuelle Lease-Owner darf den Zustand vorwärts schreiben; abgelaufene Besitzer können durch Fencing nicht nachträglich committen. Reservierung vor UI-Aktion; doppelte Reservierung schlägt fehl. Leaseablauf gibt eine unklare externe Aktion nicht automatisch zur Wiederholung frei.
- **Zustandsfolge:** `reserved → action_observed → download_pending → exact_path_confirmed → staged_and_hashed → archived_and_journaled`; bei Unklarheit `uncertain`, bei erkennbarem Abbruch `partial`, bei fachlichem Fehler `quarantined`. Jede Übergangszeile enthält zufällige interne Attempt-ID, Lease/Fencing-Wert, Zeit, Ressourcen-Schlüssel und Belegreferenzen. Keine Tokens, Cookies oder unnötigen UI-/Personendaten.
- **Datei-/Journalbuchung:** nur den konkret belegten Pfad lesen; während des Schreibens nicht archivieren. In einen eindeutigen Staging-Namen kopieren, Abschluss/Größe prüfen, vollständigen SHA-256 bilden und Datei fachlich/formal prüfen; danach atomar auf Hashziel umbenennen. Erst dann Journalereignis appendieren und flushen. Journalereignisse sind append-only und anhand Attempt-ID idempotent; Crash zwischen Datei und Journal wird durch Hash-Inventar reconciled, nicht durch erneutes Klicken. Voller SHA-256 ist Primäridentität; gekürzter `content_id` nur Anzeige/Alias. Bestehende Einträge zeigen bereits vollständigen Hash, Größe, Rolle und Analysezustand; manche Einträge besitzen ein Seitenfeld, manche nicht (`analysis/GC-PEDAGOGY-KB-01/media/reader-acquisitions-20261021.jsonl:1-9`).

## Wiederaufnahme bei unbekanntem Download-Ergebnis

Nach Timeout oder Chatabbruch **nicht erneut klicken**. Attempt/Lease auf `uncertain` halten; Browser-/Readerzustand und bereits beobachtete Downloadereignisse read-only prüfen. Nur wenn ein bereits vorhandener exakter Pfad dem Attempt zweifelsfrei zugeordnet werden kann, fortsetzen und hashen. Sonst keine Datei aus „zuletzt geändert“ auswählen, keine erneute Buchung und keine Leasefreigabe für denselben Ressourcen-Schlüssel. Erst nach dokumentierter Klärung durch den Besitzer oder einer manuellen, sichtbaren Reader-Neuauswahl einen frischen Attempt starten; alte Attempt-ID und Versuchshistorie erhalten. Die momentane Logik erkennt Dubletten und unterschiedliche Materialien erst, nachdem sie die jüngste Datei ausgewählt hat (`…/ingest_latest_reader_download.py:9-19`); das ist zu spät, um Herkunft zu sichern.

## Bundles, Kategorien und Vollständigkeit

- Ein Gesamtbundle zählt nur als gesicherte **Ressource**. Vorher erwarteten Typ/Umfang mit Inhaltsverzeichnis bzw. Grenzseiten und enthaltenen Kategorien abgleichen. PDF-Seitenzahl/Format allein beweist keine Vollständigkeit. ZIPs vollständig und sicher auflisten, verschachtelte Archive und Parent-Child-Hashes erhalten; unbekannte Typen offen führen.
- Bundle-Inhalt zusätzlich gegen die erwartete Rubrikliste abgleichen: Hauptbuch, Arbeitsheft, Lösungen, Kommentare, Fördermaterial, Diagnose/Tests, Vorlagen sowie Audio/Video/interaktive Angebote. Je Kategorie Status `complete`, `unavailable`, `not_offered`, `blocked` oder `not_checked` plus Beleg. Ein Bundle darf nur Kategorien schließen, deren enthaltene Bereiche belegt sind; Kommentar-/Lösungspaket schließt nicht das Hauptbuch.
- Reader gilt erst als vollständig, wenn alle sichtbaren Rubriken bis zum tatsächlichen Listenende geprüft und jede Ressource mit Ergebnis versehen ist. Abdeckung zeigt für sämtliche 125 Einträge `complete_all_resources=False`; kein aktueller Vollständigkeitsbeleg (`…/media/reader-resource-coverage-20261021.csv:2-126`). Der Plan fordert außerdem Seiten-/Bildprüfung sowie Klärung offener Aufgaben und Lösungen; bloße Datei-/Seitenzählung reicht nicht (`analysis/GC-PEDAGOGY-KB-01/docs/superpowers/plans/2026-10-21-reader-vollanalyse.md:45-54, 66-72, 95-99`).

## Fehlerklassen und Umsetzungsvoraussetzungen

1. **Herkunft/Zuordnung:** fehlender Aktionsbeleg, falscher Pfad, veralteter Readerzustand → sicher stoppen/quarantänisieren.
2. **Lease/Rennen:** Doppelreservierung, Lease abgelaufen, veralteter Fencing-Wert → nur aktueller Besitzer darf fortsetzen.
3. **Downloadzustand:** pending, Teildatei, Abbruch oder unbekannter Abschluss → `partial`/`uncertain`, keine Wiederholung.
4. **Inhalt/Integrität:** Hashabweichung, unerwartete Dublette, ungültiges/verschlüsseltes/unerwartetes Format → Quarantäne und manuelle Einordnung.
5. **Vollständigkeit:** abgeschnittenes Bundle, fehlende Rubrik/Seite/Medienkind, ungeklärte Lösung → Ressource offen, Reader nicht vollständig.
6. **Journal/Archiv:** Crash zwischen Kopie und Buchung, doppeltes Attempt-Ereignis oder fehlender Zielinhalt → idempotenter Abgleich über vollständigen Hash und Attempt-ID.
7. **Datenschutz:** Metadaten außerhalb des erlaubten Minimalumfangs oder Authentifizierungsgeheimnis im Ereignis → Ereignis verwerfen und sichere Ablage prüfen.

Vor Umsetzung fehlen: ein nachweislich vorhandener Mechanismus, der normale PDF-UI-Aktion und **exakten** Downloadpfad sicher koppelt; transaktionale, atomare Lease-/Journalablage mit Crash-Wiederaufnahme; Pilotbelege für alle fünf Fälle. Diese Mechanismen sind Anforderungen, keine Behauptung verfügbarer APIs. Bis dahin: ein UI-Sammler, zwei lokale Validatoren; kein paralleles PDF-Downloadexperiment.
