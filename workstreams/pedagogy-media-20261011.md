# GC-PEDAGOGY-KB-01 — Medienanalyse

Stand: 11.10.2026. Ausführender pädagogischer Fachchat; Chat-Link unbekannt. Branch `docs/pedagogy-media-20261011`, Ziel `main`. Der getrennte Lehrplan-PR208 bleibt beim bisherigen Bearbeiter.

## Auftrag
Alle Downloads einschließlich ZIP-Inhalten und entpackten Ordnern sowie alle 125 sichtbaren Bildungslogin-Karten und ihre erreichbaren Ressourcen detailliert prüfen. Jede Seite samt Aufgaben, Lösungen, Hilfen und Bildern erfassen. Keine Buchtitel, Autoren, Verlage, Cover, ISBNs, Lizenzcodes, Ursprungsdateinamen oder Plattformkennungen speichern. Originale bleiben lokal bzw. im Reader; das Register enthält anonyme Fundstellen und eigene Paraphrasen.

## Belegter Arbeitsstand
- Letzter vollständiger struktureller Scan: 839 PDF-Inhalte mit 7.209 Seiten; 73 Office-Dateien wurden mit 849 Seiten/Folien strukturell gerendert. Das ist keine Inhaltsanalyse.
- Erste konsolidierte Detailprüfung in dieser Fortsetzung: 401 konkrete Seitenprofile und 676 Aufgabenprofile. Automatische Kandidaten aus Stapel 3 wurden ausgeschlossen. Zahlen steigen in den getrennten laufenden Stapeln; aktuelle lokale Register entscheiden.
- 125 Regalkarten erneut im angemeldeten Browser gezählt. Globale Materialrubriken für R001–R007 und R010 erfasst; Inhalte überwiegend offen.
- R001: sechs Rubriken, 995 Einträge. Zwölf neu heruntergeladene Ressourcen-Seiten wurden durch den Bearbeiter textlich und visuell geprüft und didaktisch beschrieben. Unabhängige Gegenprüfung offen; kein vollständiges Regalmedium.
- R100: alle 713 Materialeinträge über 13 Listenseiten gelesen; 284 PDF, 90 Word, 232 Audio, 36 interaktive Übungen, 43 HTML, 28 Video. PDF-Download wurde durch Chrome mit ERR_BLOCKED_BY_CLIENT blockiert; Vorschauzugang und Inhaltsprüfung offen.
- Einzige derzeitige ZIP: zwei Inhalte mit 55 PDF-Seiten und 55 Präsentationsfolien. PDF wurde zuvor fälschlich als nicht auffindbar geführt; es liegt nur im Archiv. Vollständige Inhalts-/Bildprüfung wurde dem vorhandenen Bearbeiter zugeteilt.
- 0/125 Regalmedien vollständig einschließlich aller Seiten, Ressourcen und Qualitätsprüfung abgeschlossen.

## Dauerhafte lokale Arbeitsdateien
Unter `analysis/GC-PEDAGOGY-KB-01/media/`: `ANALYSESTRUKTUR.md`, `ANALYSESTAND.md`, `downloads-seitenregister.tsv`, `downloads-aufgaben.tsv`, `downloads-visualregister.tsv`, `regal-fortschritt.csv`, `reader-rubriken.tsv`, `reader-R001-seiten.tsv`, `reader-R001-visualregister.tsv`, `reader-R001-didaktik.md` sowie getrennte PDF-Stapel.

Die Detailregister und Originalmaterialien sind lokal, nicht in diesem PR hochgeladen. Dieser PR sichert den Arbeitsplan und die Übergabe; er liefert keine fertige Wissensbasis und keine Produktintegration.

## Koordination und Sicherung
Aktueller main geprüft: `983136812777267e675c50b9a3a69ed91b00ca09`. Development-Status-Lauf `38102295853` ist erfolgreich abgeschlossen. Offene PRs geprüft; PR208 bearbeitet Lehrpläne, nicht den Medienbestand. Keine Änderung an dessen Dateien. Laufende Unteraufträge: Stapel 1, Stapel 2 und der Archivblock; keine bezahlten Provideraufrufe oder Deploys gestartet. Angefordertes/beobachtetes Runtime-Modell, Kosten und Usage: unbekannt.

## Nächster Schritt
Die Archivprüfung anhand ihrer 55 Seiten und 55 Folien abnehmen, neue Ergebnisse konsolidieren und danach die nächste offene Reader-Ressource seitenweise bearbeiten. Restseiten und Zugangslücken ausdrücklich offen halten. Production unverändert; CI/Integration dieser Dokumentation erst nach separatem Nachweis.


## Lokales Originalarchiv und Audioblock — 11.10.2026

Der Nutzer hat Archivierung, Arbeitskopien, lokale Whisper-Installation, Zeitsegmente, Aufgabenbezug und fachlichen PDF-Abgleich ausdrücklich beauftragt. Ausgeführt: 684 Quelldateien -> 662 unterschiedliche Originalinhalte; sämtliche Kopien per vollständigem SHA-256 geprüft. Das private lokale Archiv bleibt nach Löschen des ursprünglichen Downloads-Unterordners abrufbar. Originale, Audios und vollständige Transkripte wurden nicht auf GitHub hochgeladen.

Sieben WAV-Arbeitskopien (mono, 16 kHz, PCM16) geprüft. faster-whisper 1.2.1, small-Modell und kompatibles PyAV16.1.0 lokal eingerichtet. Alle sieben Audios transkribiert; sieben private JSON/TXT/SRT-Exporte. 20 Hörtextinhalte, 40 Wiedergabe-Zeitbereiche, 38 Hör-Aufgabengruppen mit PDF-Aufgaben-/Transkript-/Lösungsbezug. Alle 214 ursprünglichen Kandidatenlinks geprüft: 20 belegt, 194 für Hörverstehen nicht freigegeben. Identische Audios in Deutsch/DaZ nur einmal transkribiert; fachliche Varianten sowie Musterprüfungen 1/2 erhalten.

Konkrete Lernziele, eigene Lösungswege, Zahlen-/Negationsfallen und Unterschiede der Aufgabenformen stehen lokal in download-2-hoeraufgaben-geprueft.tsv. 38 erkannte ASR-Abweichungen mit offiziellen PDF-Texten korrigiert. Ein Datumsfehler der Astronautenbiografie, eine mehrdeutige Sprecher-/Vorschlagszuordnung in einer Druckeraufgabe und eine abweichende Figurenbenennung dokumentiert. 1.843 Sprechabschnitte / 338 kritische Stellen technisch indexiert; keine pauschale manuelle Wort-für-Wort-Zertifizierung. Zeitmarken sind Suchbereiche, keine samplegenauen Schnittmarken. Technische Endabnahme: alle Archive-/WAV-Hashes, sieben Exporte, 40 Zeitbereiche innerhalb Audiodauer, 38 eindeutige Quellen-/Lösungslinks und vollständige Kandidatenprüfung erfolgreich.

Maßgeblicher lokaler Bericht: analysis/GC-PEDAGOGY-KB-01/media/download-2-audio-pruefbericht.md. Reproduzierbare lokale Programme: audio_pipeline.py, audio_source_linking.py, audio_alignment.py, audio_export.py; Versionsliste audio-requirements-lock.txt. Original-/Transkriptarchiv, Softwareumgebung und Modelle sind durch task-eigene .gitignore für Repo-Upload ausgeschlossen. Scripts und Detaildaten sind lokal erhalten, dieser Commit sichert die Übergabe. Scope bleibt fachliche Datenarbeit; keine Produktintegration, CI-/Deploy-/Productionfreigabe. Der gesamte restliche Aufgaben-/Diagrammbestand und 125 Regalmedien sind weiterhin unvollständig.

Nächster Gesamtarbeitsschritt: übrige nicht-audiobezogene Aufgaben und Diagramme aus den archivierten Quellen konkret prüfen. Aktive lokale Transkriptionsprozesse sind beendet. Beobachtetes Modell, Kosten und Usage unbekannt.


## Wiederaufnahme21.10.2026 — belastbarer Teilabschluss

Auftrag: gesamte Reader-Inhalte und Didaktik schnell und belegbar auswerten, gleiche Task-ID fortgeführt. Aktueller main/DevStatus39629725383 geprüft; letzter gelesener main25c118f2518e4f87d0c9ea6301611cd2e7e4ae3f. PR214 bleibt der Medien-Dokumentationsbranch, PR208 Lehrpläne getrennt. Vorhandene Produktänderungen im lokalen curriculum-integration-Checkout nicht angefasst.

62/62 früher registrierte PDFs (216Seiten) per vollem SHA wiedergefunden und unverändert privat archiviert.164-seitiger Kommentar8d468f417d811a7a vollständig in Text und Bild gelesen;530eigene Aufgaben-/Referenzgruppen erfasst. Lösungskontrolle nur teilweise; konkrete Quellenfehler einschließlich unabhängig bestätigtem Extremfallfehler dokumentiert. Sämtliche164Seiten besitzen private PNG-Nachweise.12didaktische Transferregeln vorgeschlagen. Kein gesamtes Regalmedium fertig.

Angemeldeter Chrome-Zugang funktioniert; aktuell125Coverkarten. R001:7angebotene Sammeldateien neu gesichert,6PDFs/671Seiten plusWord, zusätzlich eine Originalbilddatei.284-seitiger Deutschkommentar ea3d79400d5b5503 wird in drei lokalen Bereichen vollständig ausgewertet. Lokale Nachweise: analysis/GC-PEDAGOGY-KB-01/media/reader-vollanalyse-stand-20261021.md und Ausführungsplan docs/superpowers/plans/2026-10-21-reader-vollanalyse.md innerhalb der Analyseablage. Keine Biblioangaben in neuen Wissensregistern; technische Downloadzuordnung privat.

Die Originale sind jetzt im privaten Archiv unabhängig von Downloads verfügbar. Originalbilder,Volltexte,Transkripte und Dateinamen werden nicht hochgeladen. Anonyme Einzelanalysen bleiben lokal; der PR sichert eigene Planung,Synthese,Abdeckungsbelege und Übergabe.530Gruppen sind Kandidaten, keine530 vollständig geprüften Lösungen.53bereits integrierte Starterprofile aus PR218 bleiben getrennt. hausaufgabe-staging.web.app ist im heutigen Hauptstand Live; keine Deploy-/Produktänderung in diesem Auftrag.

Aktiv: drei lokale Teilprüfungen für Quelle ea3d79400d5b5503, Bereiche1–95,96–190,191–284; keine Actions/externen Providerläufe gestartet. Angefordert Sol/medium für fachliche Bild-/Sprachprüfung; tatsächlich beobachtetes Runtime-Modell,Kosten,Usage unbekannt. Versuchshistorie erhalten. Nächster Schritt: die284Seitenrecords abnehmen,konsolidieren und didaktisch übertragen; danach offene Sammeldateien/Einzelressourcen.

Dokumentationscheckpoint PR214: b5eab19ae13fef5a7e53ee18260fc9d18036f293. Originale und detaillierte Seitenrecords weiterhin nur lokal. Aktuelle Hauptstand-Livebehandlung respektiert; kein Releasezustandswechsel.


## Abgenommener Teilcheckpoint vom 21.10.2026

Die sechs lokalen Kommentarbereiche sind beendet und konsolidiert: 164/164 Seiten Mathematik4, 284/284 Seiten Deutsch1 und zusätzlich 22/22 Seiten Diagnose/Förderplanung Deutsch1. Insgesamt 470 PDF-Seiten vollständig textlich und visuell gelesen, mit 470 privaten PNG-Seitenreferenzen. Dokumentübergreifende Inhalte können sich überschneiden; kleine Graustufenminiaturen ersetzen keine Prüfung jedes farbigen oder unscharfen Hauptbuchdetails.

1.169 eigene Aufgaben-, Methoden-, Formular- und Verweisgruppen liegen als lokale Kandidaten vor. Das sind keine 1.169 fertigen Testaufgaben. 24 eigene didaktische Transferregeln mit Fundstellen sind in der Konzeptergänzung dokumentiert. Einzelantworten, Rubriken und Zusatzressourcen sind weiterhin unvollständig geprüft. Keine neuen Laufzeitprofile freigegeben.

Neue Sammlung: neun unterschiedliche Originaldateien, davon sieben PDFs mit 1.040 Seiten sowie Word und Bild. Alle neun Hashes nach Archivierung erneut geprüft. R001: sieben Sammeldateien mit 671 PDF-Seiten plus Word und zusätzlich ein Originalbild. R002: ein Gesamtmaterial mit 369 PDF-Seiten. Technische Herkunfts- und Downloadkennungen bleiben privat. Weiterhin 0/125 vollständig abgeschlossene Regalmedien.

Lokale eigene Detaildaten unter analysis/GC-PEDAGOGY-KB-01: media/reader-task-pool-candidates-20261021.jsonl, die seitenbezogenen JSONL-Dokumente und private-archive/reader-page-asset-index-20261021.json. Integritätsbeleg: media/reader-integrity-20261021.json. Der PR sichert eigene Planung, Standbericht, 24 Konzeptregeln und anonyme Abdeckungsbelege; Originale und detaillierte Seitenrecords bleiben lokal.

Aktuell keine laufenden lokalen Kommentar-Teilprüfungen oder manuell gestarteten Actions-, Provider- oder Deployvorgänge. Nächster ausführbarer Schritt: übrige R001-Sammeldateien vollständig auswerten und mit Einzelmedien abgleichen. Produkt-/Livezustand unverändert.

## Wiederanlauf V2 — 21.10.2026: Buchabschluss, Quellenzuordnung und Konzeptkoordination

Owner ist der bestehende Fachchat **GC · Pädagogisches Material** (`01a1282d-7f9d-7ee3-b7a8-d0c0da8967c2`), dieselbe Task-ID/PR214. Martins Ergänzung: Jedes Buch und jede Ressource nach Fach, Quelljahrgang oder begründetem geschätztem Bereich, ursprünglichem Schulweg und Land erfassen; Transfer und amtliche Lehrplanbestätigung separat belegen. Keine Titel/Autoren/Verlage/ISBN/Lizenzcodes/Originaldateinamen in Wissensregistern.

Zahlen erneut direkt an allen neun archivierten Originalen geprüft: neun SHA-256 stimmen, sieben PDFs enthalten tatsächlich 1.040 Dokumentseiten; dazu kommen DOC und JPG. R001:671 PDF-Seiten in sechs PDFs, plus DOC und JPG; R002:369 Seiten in einer PDF. Das sind Ressourcen aus zwei Readern, keine 125 fertigen Bücher. Weiterhin **0/125 vollständig**, 470 bereits gelesene Kommentar-/Diagnoseseiten und 1.169 Gruppenkandidaten; keine neue Aufgaben-/Lösungs- oder Laufzeitfreigabe. Die große Seitenzahl war als Fortschrittsangabe irreführend. Ein technischer Zwang zum Ende nach neun Dateien ist nicht belegt; die Reihenfolge wurde vor vollständiger Sammlung zu früh auf Tiefenarbeit verengt.

[Konkreter V2-Plan](../analysis/GC-PEDAGOGY-KB-01/docs/superpowers/plans/2026-10-21-regal-vollanalyse-v2.md): zuerst atomare Steuerung und exakte Downloadaktion→Dateipfad-Zuordnung, Drei-Reader-Pilot, anschließend kompletter Sammlungsdurchlauf aller125, dann vollständige Einzelanalyse mit unabhängigen Lösungsprüfungen und Konzept-/Poolfreigabe. 125 anonyme Auftragsvorlagen gespeichert, alle ausdrücklich `planned_not_dispatched`; neue Steuerung, Pilot und Massensammlung noch nicht umgesetzt. Der bestehende Latest-Download-Import (Datei nach mtime) ist nicht parallel sicher. Ein Sammler plus zwei lokale Validatoren ist der Rückfall; auch seriell bleibt eine unterstützte sichtbare Herkunfts-/Pfadverknüpfung nötig. Offene Zuordnung wird nicht als gesichert gebucht.

Tatsächliche Koordination: **GC · Pädagogisches Konzept** (`01a1280a-c9f4-73a3-a12a-7b2b93a5ba5a`) und **GradeCrew Zentrale** wurden angeschrieben; beide Turns sind abgeschlossen. Konzeptbeitrag unter analysis/GC-PEDAGOGY-KB-01/master/material-zuordnung-konzeptbeitrag-2026-10-21.md: gemeinsamer Mehrfach-Zuordnungsvertrag und24Einzelbewertungen (13P0/10P1/1P2), jeweils Voraussetzungen/Förderung/Forderung/Grenzen. Übernahmeempfehlung, noch keine Änderung der zentralen Konzeptdatei oder Produktfreigabe. Kein weiterer dedizierter Lehrplanchat gefunden. Amtliche konkrete Zuordnungen bleiben wegen nicht erfolgreicher Fachplanabrufe offen; vorhandenen PR208-Owner weiterverwenden.

Drei begrenzte Luna/medium-Aufträge (Metadatenbelege, Sammlungsreview, anschließender Planreview) sind fertig. Zwei konkrete Planbefunde korrigiert: unbelegte serielle Dateiherkunft und fehlende unnummerierte Arbeitsaufträge. Angefordert `gpt-6-luna`/`medium`; tatsächlich beobachtetes Modell/Aufwand und Kosten/Usage unbekannt. Sitzung: vier Plätze inklusive Root, höchstens drei Unteragenten; keine125/500 aktiven Agenten. Keine Buchsammler laufen als Ergebnis dieses Plancheckpoints.

Daten-/Dokumentprüfung dieses Checkpoints: neun Originalhashes und sieben PDF-Seitenzahlen erneut kontrolliert,125eindeutige Vorlagen mit null Claims und null Komplett-Markierungen,24nummerierte Konzeptbewertungen, lokaler Link im neuen Plan auflösbar. Dies ist keine Produkt-/Browser-/Pilotprüfung. Originale und detaillierte Seiten-/Audioquellen privat; keine Produktcodeänderung oder Deploy. Die bestehende Auswahl scannt derzeit höchstens2.000Profile und kennt Text/Audio; fehlende Bild-Assetanbindung im Plan ausdrücklich erhalten.

**Genau nächster Schritt:** atomare lokale Auftragssteuerung und Import mit explizitem belegtem Pfad für den kleinen Readerpilot implementieren; Pilot nachweisen, dann sämtliche Buchaufträge im Sammlungsdurchlauf abarbeiten. Sicherung ist kein Abschluss der Analyse. Gemeinsame aktuelle TODO-/Workstreamstände vor Schreiben neu lesen und nur diese Task ergänzen. Vorhandener schmutziger curriculum-integration-Checkout bleibt unangetastet.


## Ausführung begonnen — 22.10.2026

Vier neue lokale Werkzeuge für atomare Readerclaims, belegten expliziten Dateiimport, Dateityp-/Hashprüfung, Wiederaufnahme und getrennten Fortschritt gebaut. Root hat20/20 gezielte lokale Tests ausgeführt; dies ist kein Bestandstest der125Bücher. Private SQLite tatsächlich mit125Buchvorlagen angelegt. [Ausführungsledger](../analysis/GC-PEDAGOGY-KB-01/media/reader-execution-ledger-v2-20261022.md) und anonymer CSV-Export dokumentieren tatsächliche statt geplante Ausführung.

Pilot: R001-PDF22Seiten mit eindeutig zurückgegebenem Downloadpfad und bekanntem Hash bestätigt (absichtliche Baseline-Dublette, kein neuer Inhalt). R100-PDF-Export bleibt uncertain. R115-Hauptbuchseite8 als PNG827×1170 tatsächlich zurückgegeben, validiert und privat archiviert; spät fertiggestellter Versuch und ursprünglich falscher Ressourcenname anhand expliziter Evidence-/Mapping-Reconciliation korrigiert, keine Wiederholung. Regulär geöffneter164Seiten-Kommentar bleibt bestehende Quelle, kein neu analysiertes Buch. Letzter Bildabruf blockierte33179Sekunden trotz Tooltimeout; Ursache nicht nachgewiesen, in der Blockade keine weitere Buchsammlung ausgeführt. **Globaler Pilot nicht bestanden,0/125Bücher vollständig.** Keine Parallelfreigabe für drei UI-Sammler.

Alle neun vorhandenen Originalressourcen auf Jahrgang/Fach/Schulart/Land geprüft, Belege und begründete Schätzungen getrennt in reader-resource-metadata-validated-20261022.jsonl/.md; keine Biblioidentitäten oder Primärquellen hochgeladen. Aktuell drei Luna/medium-Inhaltsaufträge auf vorhandene734PDF-Seiten verteilt: R001Arbeitsheft168, Kopiervorlagen/Lautkarten/Planung197, R002Lehrermaterial369. Arbeit in eigenen Unterverzeichnissen, Einzelseiten/Einzelaufgaben und offene unabhängige Prüfung getrennt. Start ist keine Fertigstellung. Root führt den seriellen Quellenabgleich fort; eine neue R003-Dateianfrage hat bisher keinen bestätigten Downloadpfad. Unsichere Abrufe nicht blind wiederholen.

Ruling: Wegen stockender Readerexporte vorhandene unabhängige lokale Quellen parallel auswerten, statt diese Arbeit an einem Exportblocker aufzuhalten. Weitere Hauptbuch-/Zusatzquellen und alleBücher bleiben offen. Kein Produktcode/Poolimport/Deploy. Bestehende schmutzige Integrationscheckouts nicht angefasst. Angeforderte Worker Luna/medium; tatsächliche Modelle/Usage/Kosten unbekannt. Genau nächster Schritt: R003-Downloadversuch anhand des echten Browser-/Dateistands klären und im funktionierenden Reader weiter sammeln; lokale Inhaltsarbeiter checkpointen je Paket.


## Ausführung V2 — weiterer Checkpoint vom 22.10.2026

**Bücher vollständig: 0/125.** Keine Produkt- oder Deployfreigabe. Steuerungscheckpoint 48fa34b87f460bde6314b6fc4988330bb63513fe ist gepusht. 20 lokale Kontrolltests sind belegt; der vollständige Downloadpilot bleibt offen. R003-Versuch 023650bd31b4492d89c9b188e2b62b5d hat keinen bestätigten Ereignispfad, R100 ist uncertain, bei R115 ist eine Hauptbuchseite tatsächlich archiviert. Die native Browsersteuerung meldet einen gesperrten Mac; der Benutzer wurde um manuelles Entsperren gebeten. Weitere UI-Sammelaktionen warten auf das Entsperren und den Abgleich unklarer Downloads.

Der frische Downloadsabgleich fand 1782 PDF-Dateien mit 1083 unterschiedlichen Hashes und 22 ZIP-Dateien mit 21 unterschiedlichen Hashes. Alle 918 historischen Register-IDs wurden in privaten Originalen oder ZIP-Kindern wiedergefunden. 171 fehlende Originalkopien wurden neu gesichert, 20 gültige ZIPs archiviert und 3371 Kindobjekte per CRC/SHA geprüft: 16 verschachtelte ZIPs, 2749 unterschiedliche Kindhashes und 622 Wiederholungen. Eine weitere ZIP ist leer/defekt; ihr konkreter Ursprung und Ersatz bleiben offen. Diese Archivzählung belegt keine neuen Downloads oder Inhaltsanalysen. Technische Dateinamen und Originale bleiben privat.

197 weitere PDF-Seiten (106 Kopiervorlagen, 40 Lautkarten, 51 Planung) sind vollständig in Text und Bild erstgelesen. Dazu liegen 203/38/48 Aufgaben- beziehungsweise Planungsgruppen vor. Einzelitemverfeinerung und unabhängige Gesamtprüfung bleiben offen. Root hat 27 Kartenpaare und neun Bildstatements begrenzt gegengeprüft. Die 168 Arbeitsheftseiten und 369 Seiten Mathematik-Lehrkraftmaterial laufen als unabhängige lokale Pakete weiter; keine fertigen Summen vorwegnehmen. Drei tatsächliche Luna/medium-Worker; beobachtetes Modell und Kosten unbekannt.

R115, gesicherte Originalseite 8: 63 einzeln gespeicherte Handlungen mit eigenen Lösungen, drei Visuals und drei Didaktikfolgen. Eine vollständige unabhängige Zweitprüfung aller 63 IDs fand keine Rechenabweichung. Das ist kein Gesamtbuch; amtliches Mapping und Laufzeitfreigabe fehlen. Metadaten aller neun Ressourcen plus R115 wurden vom Konzeptchat kalibriert und die begrenzten Korrekturen eingearbeitet. DOC-Fußkonflikt und Kopiervorlagen-Quelljahrgang bleiben offen. Der Konzeptchat bewertet die drei neuen Didaktikfolgen in einer eigenen Datei.

Detaillierte Seiten-, Aufgaben-, Bild- und Audioanalysen bleiben lokal unter analysis/GC-PEDAGOGY-KB-01/media/, Originale und Datenbank unter private-archive/. Dieser Commit sichert eigene anonymisierte Berichte, Metadaten, Konzeptbeitrag und Kontrollnachweise. Nächster Browser-Schritt: Mac manuell entsperren, sichtbaren Downloadstatus abgleichen, dann regulären Exportpilot fortführen. Lokale Inhaltsworker arbeiten währenddessen weiter. Sicherung ist kein Abschluss.
