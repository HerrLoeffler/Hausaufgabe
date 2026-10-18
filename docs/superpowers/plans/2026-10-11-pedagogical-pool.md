# Automatische pädagogische Poolanbindung

Task: GC-PEDAGOGY-KB-01. Nutzerauftrag: bestehende gute Testgenerierung erhalten und automatisch passende geprüfte Materialien nach Fach, Jahrgang und Schulart als Grundlage für neue Aufgaben nutzen. Inline-Ausführung ist durch „bau jetzt“ beauftragt. Eigener Branch feat/pedagogy-pool-20261011, Basis feature/gradecrew-app-integration@9363fe9842b502c4a2780bf007acef6881af6213. Keine neuen Provider-Credentials, kein externer KI-Testaufruf, keine neue Datenbank oder Oberfläche nötig.

## Entscheidungen

Serverseitiges, versioniertes JSON enthält ausschließlich eigene, anonymisierte und ausdrücklich geprüfte Aufgabenprofile mit belegter Schul-/Jahrgangszuordnung. Keine Buchoriginale, Aufgabenformulierungen, Lösungsschlüssel, Bilder, Audios, Ursprungsdateinamen oder bibliografische Felder im Functions-Paket. Ein kleiner reproduzierbarer Import nimmt nur freigegebene Datensätze auf. Bekannte Quellenfehler und generische Kandidaten ausgeschlossen.

Fach, Jahrgang, Schulart und vorhandenes Bundesland müssen passen; Thema priorisiert tatsächlich verwandte Profile. Maximal sechs Profile und insgesamt höchstens 6.000 Zeichen zusätzlicher Kontext. Gewählte Aufgabenformate sowie Bild-/Audiovorgaben bleiben verbindlich. Bei fehlendem Kontext, unbekannter Zuordnung, leerem Pool, Poolfehler oder keinem Themenmatch bleibt der bisherige Pfad wirksam. Bei „nur mein Material“ und Ausgangstest kein externes Poolwissen verwenden. Höraufgabenmuster nur bei tatsächlich ausgewähltem Audio; neue Hörtexte bleiben im bestehenden Ein-Stimmen-/500-Zeichen-Vertrag.

## Arbeitsschritte

1. Selector-/Datengate-Tests für strikte Fach/Jahrgang/Schulart-Zuordnung, review/curriculum-Status, Themenrelevanz, Medienvertrag, Material-only und Fehlerfallback zuerst schreiben; rot nachweisen.
2. functions/lib/pedagogical-pool.js und functions/data/pedagogical-pool.json anlegen. Auswahl und gekürzte Projektion vollständig unabhängig von Firebase/Provider.
3. functions/index.js: Auswahl einmal pro Test; Kontext in Erstgenerierung, Einzelersatz und Gesamtreparatur; sichere Versions-/ID-Metadaten in Antwort und Hintergrundtest. Bestehende Qualitätsprüfung erhalten.
4. Import-/Schema-/Herkunftsbelege sowie begrenzten geprüften Startbestand erstellen. Ungeprüfte Originalregister nicht automatisch als freigegeben übernehmen.
5. Reale Handler-Tests beweisen Erst-/Reparaturverknüpfung, vorhandene Vorgaben und No-match-Gleichheit. Functions-Gesamtsuite, Syntax und ESLint ausführen. Keine Modellqualitäts-/Live-Nutzertestbehauptung aus Mocktests.
6. Eigenen PR gegen feature/gradecrew-app-integration sichern und unabhängige Prüfung; Übergabe mit Seedumfang, Grenzen und Stufe branch_only. Integration/Deploy sind separate, explizite Releasehandlungen.

## Assurance und Grenzen

SEC06/07: keine klientlesbaren Original-/Lösungspools, nur serverseitige Profile. SEC14/17: begrenzter untrusted Kontext und unveränderte Validierung/Quoten. PRIV07/08/09: anonymes, geprüftes Ableitungsregister ohne neue Personen-/Providerdaten oder Volltextuploads. Belege binden an konkrete Tests/Commit; rechtliche oder Modellqualitätsfreigabe wird nicht behauptet.

Die bestehenden Funktionen für Bilder, Audio, Uploads, Lehrerpräferenzen und Feedbackmemory bleiben im Generatorpfad. Bestehender API-Zugang wird in diesem reinen lokalen Kontext-Retrofit weder geprüft, umkonfiguriert noch für bezahlte Aufrufe verwendet.
