# Unabhängige Prüfung — 08.10.2026

Ein frischer gpt-6-astra-Reviewer prüfte read-only ca67f2c..99adf6d im eigenen Checkout. Keine weitere Implementierungsdelegation oder zweite Reviewrunde. 59 Regelprüfungen unabhängig bestanden. Bestehender Enginebericht:1Test,0Fehler,0Warnungen. Drei wichtige Fehler angenommen, ein kleiner Befund zurückgestellt. Die Reviewabnahme ist kein Integrations- oder Deploymentauftrag.

## Wichtige Befunde

1. Nach2/10 oder4/10 auf der Platte bevorzugt Near denselben Zielabstand für403;401 gewinnt den Gleichstand nicht. Spieler kann den Eimer über normale Aktion nicht zurücknehmen. Regression: Tick→Near→Controlleraktion→Korrektur100ml→Platte, für beide Mengen.
2. Rotierende Gitter lassen seitlich vor Ende1.4s eine begehbare Lücke. GateBlocks erfasst nur Winkel. Regression: echte Capsule-Sweeps bei etwa60° und nach vollständiger Öffnung. Unabhängiges, bis zum Animationsende geschlossenes Kollisionsvolumen erforderlich.
3. Defekte Position/Blickrichtung verwirft trotz gültiger Rätselserialisierung den ganzen Fortschritt. Regression: gültiges gelöstes Rätsel, ungültiger Transform, Load→sicherer Start→erneutesSave/Load ohne Verlust.

## Zurückgestellter kleiner Befund

Ein falsch gewähltes Wort trägt dieselbe grüneX-Markierung wie eine richtige Auswahl. Die aktive Pfadanzeige bleibt im Fehlerzustand und verlangt Rücknahme; die Bodenmarkierung soll später zusätzlich dauerhaft ein anderes Symbol/einen Fehlerrand zeigen.

## Grenzen der Prüfung und Entscheidungen

- iPad-Berührung, Unterbrechungen, Leistung und Signierung: nur Desktop-Simulation. Erst nach echtem Gerätetest freigeben; bei falscher Annahme Eingabe-/Leistungsüberarbeitung.
- Streaming, vollständige Achtgebiets-Insel, weitere Hauptmechaniken, Final-Art, Audio und weitere Barrierefreiheit: nächster Ausbau; erster Abschnitt entspricht dem autorisierten Baubeginn. Bei anderer Umfangserwartung größerer erster Lieferblock nötig.
- Bildqualität, Startzeit und Framerate: Reviewer hat keinen Editor gestartet. Autor prüfte reale Bilder; keine finale Grafik- oder Leistungsgarantie. Bei Fehlbewertung Profiling/Art-Revision.
- Nähe statt Kamerastrahl wählt Interaktion, der HUD-Prompt zeigt das gewählte Objekt. Bei unpassender Haptik spätere Strahl-/Bodentippauswahl.
- Bestätigte Wasserlösung bleibt dauerhaft offen, auch wenn der Eimer später verändert wird. Bei anderer Erwartung Fortschrittsregel ändern.
- Flüssigkeitsinterpolation, weitere Hinweise und Transferaufgaben: diskreter100ml-Hub ist der erste spielbare Lernschritt; Ausbau kann zusätzliche Didaktik erfordern.
- Veraltete Übergabe/Plancheckboxen: vor endgültiger Übergabe aktualisieren; sonst irreführende Wiederaufnahme.
- CI, Integration und Deployment: separate Prüfung, Statusbranch_only undDraftPR. Ungeprüfte Integration bleibt Risiko.

Weitere Ausführungsentscheidungen: autonomer Bau ohne neue Freigabepause ist Martins ausdrücklicher Auftrag; bei Fehlverständnis Designrevision, keine Veröffentlichung. Baugrenze Ankunft/Verb/Eimer macht den Start prüfbar; restliche Mechaniken benötigen weiteren Ausbau. Keine neue Bildgenerierung, sieben vorherige Aufrufe erhalten. Kein Production-/CloudGPU-/Provider-Vorgang.

## Korrekturprüfung

Die drei wichtigen Befunde wurden im Engine-Test zuerst reproduziert:8fehlende Assertions,0Warnungen. Getrennte Reviewfehlerdatei Reports/review-regressions-red.json erhalten. Ein Fixdurchgang: Priorität beim Abstandsgleichstand auf Bucket401; unsichtbares festes Tür-Kollisionsvolumen bis90°; gültiger Rätselzustand unabhängig von Transform-Reparatur übernommen. Erneuter voller lokaler Lauf 07.10.2026 23:04UTC:59portable Checks und1UE-Test bestanden,0Fehler,0Warnungen. Tests prüfen2/10 und4/10 über normale Controlleraktion, jeweils100ml-Korrektur zur erfolgreichen3/10-Lösung, physische Sweeps während/nach Öffnung, ungültige Position undNaN-Blick sowie erneute Speicherung. Kein zweiter Reviewer; Korrekturen durch fehlschlagende Regressionen vor Fix und erfolgreichen Gesamtlauf danach nachgewiesen.
