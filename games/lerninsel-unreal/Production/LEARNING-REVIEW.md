# Aufgabenführung nach Martins Spieltest

Task GC-GAMES-ESCAPE-VISUAL-01 · bestehender Branch feature/lerninsel-ego-v1 / Draft-PR175. Umfang: direkte Wortauswahl, vollständige Steinfarbe ohne Häkchen, verständliche Aufträge und Verbesserungshinweise. Diese Überarbeitung ist keine Artproduktion und keine öffentliche Veröffentlichung.

## Ergebnis und überprüfte Grenzen

Ein gezieltes Interact wählt das Wort unmittelbar und lässt den Spieler in der Egoansicht. Die erste Probe öffnet nach zwei richtigen Verben automatisch. Beim Verbweg aktiviert ein Wortklick den Weg; nur die aktuelle Reihe kann fortgesetzt werden, drei korrekte Schritte öffnen automatisch. Gespeicherte richtige, bisher unbestätigte Lösungen werden beim Laden ebenfalls ausgewertet. Das vorhandene Saveformat und die Slotnamen bleiben gleich. Falsche Auswahl bleibt korrigierbar; komplette Farbflächen werden nicht zwischen verschiedenen Steinen geteilt.

Dauerhafter Auftrag ab Ankunft, drei nummerierte Reihen, Erklärung Was tut jemand?, sichtbar bleibende Fehlerhilfe links am Weg, Kontextsatz im Nähehinweis. Der Satzbereich zeigt ein weiteres Beispiel und Verb auf Platz 2; alle sechs gültigen bisherigen V2-Anordnungen bleiben möglich. Die Wasser-, Routen- und Küstenaufträge nennen Ziel und nächste konkrete Handlung. Die bislang vereinfachte Art bleibt bestehen.

## Frische Prüfung

Letzter vollständiger Lauf **2026.10.08-13.48.57 UTC**: DevelopmentEditor erfolgreich, **64 Regelchecks +88 Rätselchecks**, **2 Unreal-Spieltests erfolgreich**, **0 Fehler /6 bekannte Umgebungswarnungen**. Alle Warnungen stammen von Epics mitgeliefertem x86 idevice_id auf ARM. Reports/learning-verification.json enthält den Nachweis.

Neue native Prüfungen: direkter einmaliger Auswahlschritt ohne Modal, erneutes Zurücknehmen, falsches Paar hält Gate geschlossen, korrekte automatische Toröffnung, erster Verbwegschritt startet direkt, spätere Reihe kann nicht übersprungen werden, Materialfarbe betrifft allein den ausgewählten Stein, Laden alter unbestätigter korrekter Antworten. Vorher bestehende Torcollision-, Kontakt-, Mengen-, Speicher-, Pointer- und Vier-Rätselprüfungen bleiben im Gesamtlauf enthalten.

Neue Aufnahmen Learning-Selection.png und Learning-Verbweg.png sowie erneuerte Satz-/Routenaufnahmen visuell geprüft. Der ausgewählte Stein ist durchgehend blau und hat kein Häkchen; die andere Platte bleibt neutral. Der zweite Auftrag und die Reihenhinweise sind in der tatsächlichen Szene sichtbar. Dies ist keine Kinder-, iPad- oder vollständige menschliche Geh-Abnahme.

## Versuchshistorie

Acht native Gesamtläufe in diesem Block. Erster Lauf: sechs erwartete Fehler gegen die alte bestätigungspflichtige Interaktion. Nach dem Ablauf-Fix grüner Lauf. Erweiterte Materialprüfung: ein echter Fehler, weil CreateDynamicMaterialInstance bereits dynamische Materialien wiederverwendete. Durch neue separate Instanzen vom Basismaterial behoben. Danach zeigte die bestehende automatische Routendruckprüfung einen instabilen Startdruck; acht Folgefehler wurden gespeichert, nicht als Produktfreigabe gezählt. Das tatsächliche attached Widget wird nun für NativeOnPreviewMouseButtonDown und Slate ProcessReply verwendet; Bewegung, Capture-Verlust, rechts/links-Loslassen und Up bleiben native Slate-Ereignisse. Kein OS-Hittest wird behauptet. Danach Gesamtlauf grün. Neue Alt-Spielstandtests: zwei erwartete rote Fehler; Ladeauswertung ergänzt, finaler Gesamtlauf grün. Alle vier roten Berichte bleiben erhalten.

Ein neuer eingebauter image_gen-Aufruf mit vier Layoutansichten; insgesamt20 Aufrufe und265 Konzeptmotive. Keine Wiederholung alter Bildproduktionen, kein Cloud-/Signierungs-/Production-Vorgang. Vorlage in docs/games/lerninsel/20261008-learning; Prompt dort in generierung.json.

## Nächster Schritt

Martin startet die vorhandene Lerninsel starten.command erneut und spielt Verbweg sowie Satzgarten. Entscheidend ist, ob Auftrag und Korrektur ohne zusätzliche Erklärung verständlich sind. Kinderabnahme, physisches iPad, Browserstreaming und weitere Weltqualität bleiben offen.


## Unabhängige Prüfung dieses begrenzten Nachbesserungsblocks

Read-only-Review gegen da26552: zwei P2-Befunde. Erstens zeigte die dauerhafte Reihenüberschrift nach einem Fehler die nächste statt die zu korrigierende Reihe. PathPromptRow wird nun vom HUD verwendet und unterscheidet den Fehlzustand. Fünf portable Zustandsfälle mit konkreten ersten/zweiten Reihen: vor dem Fix FAIL nach2, danach64Regelchecks bestanden. Zweitens bot die Anleitung Betreten schon vor pathActive an. Vor Aktivierung verlangt der Text jetzt ausdrücklich den ersten Klick/E; erst danach bietet er kurzes Betreten an. Die vorhandene eigentliche Kontaktregel bleibt erhalten. Beide Hinweise wurden anhand der Quellen bestätigt und korrigiert. Reviewerbewertung vor Korrektur8/10 für diesen begrenzten Bedienblock; keine neue Gesamtabnahme behauptet. Kein zweiter Reviewlauf.
