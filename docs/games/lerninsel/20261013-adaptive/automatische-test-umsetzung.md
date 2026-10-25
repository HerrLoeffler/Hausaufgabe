# Korrektur des Eingabekonzepts: Test vorgeben, Level automatisch zusammenstellen

13.10.2026, ausdrückliches menschliches Feedback nach Browserprobe PR234. Task GC-GAMES-LERNINSEL-ADAPTIVE-PLAN-20261013 bleibt. **Der Mensch lehnt die manuelle Rätselkonfiguration ab.** Die Lehrkraft soll wie im bestehenden digitalen Leistungsnachweis zehn gewünschte Aufgaben vorgeben/erstellen und daraus automatisch ein passendes Level erhalten. Bruchzähler, Bechergröße, Lösungshaken und räumliche Parameter gehören nicht in den normalen Lehrerworkflow. Die vorangegangene Probe ist lediglich ein technischer Renderer-/Interaktionsbeleg; ihr Eingabekonzept ist nicht abgenommen.

## Vorgeschlagener Ablauf

1. Im bestehenden Test-erstellen-/Test-auswählen-Weg die gewünschten Aufgaben festlegen: bestätigter vorhandener Test oder ausdrücklich fest vorgegebene Frageliste, etwa zehn Fragen. Fach/Klasse/Materialkontext aus dem bestehenden Workflow übernehmen.
2. Aktion „Als Lerninsel spielen“. Bei bestehenden vollständigen Aufgaben bleiben Frage, Lösungen/Rubric und Punkte unverändert. Bei bloßen Fragetexten ergänzt die vorhandene Generierung strukturiert Antwortregel, Kandidaten und nötige Darstellung; sie darf nicht still die vorgegebenen Fragen durch andere ersetzen. Fehlendes Ausgangsmaterial bzw. fachlich unklare Aufgaben werden konkret gemeldet, nicht erfunden.
3. Ein neuer Mapper erzeugt je Aufgabe einen begrenzten Missionseintrag: passende Vorlage, öffentlich notwendiger Kontext, Antwortabbildung, Datenparameter, ursprüngliche Frage-ID und Versionsbindung. Ein semantischer Vorschlag kann einmalig im Hintergrund entstehen; bekannte strukturierte Fälle werden regelbasiert zugeordnet. Keine neue Generierung je Spieler oder Frame.
4. Ein Validator prüft Informationserhalt, Einheiten, zulässige Antworten, Bewertungsparität, Kapazitäts-/Layoutgrenzen und unpassende Mechaniken. Ungeeignete räumliche Aufgaben erscheinen automatisch als passende Frage-/Eingabestation im Level. Sie werden nicht zu einem anderen Lernziel umgeschrieben.
5. Ein Levelcompiler setzt zehn Missionen in geprüfte Raummodule/Anschlussstellen: Stationen, Wege, Tore, Ziele, Texte und zulässige Variation. Das Ergebnis ist ein kleines Manifest für vorhandene Browserassets; keine neuen Modelle, Scripts oder Enginebuilds pro Test.
6. Die Lehrkraft sieht eine kurze Vorschau „Aufgabe→Handlung“ und bestätigt fachlich die Runde. Sie baut keine Mechanik. Schüler starten die veröffentlichte Variante; bei echtem Assessment bleibt die private serverseitige Bewertung autoritativ.

## Sinnvolle Zuordnung statt beliebiger Dekoration

| Lehreraufgabe | Automatische Umsetzung |
| --- | --- |
| „Berechne 3/4 von 2 Litern.“ | Rechen-/Mengenstation mit denselben Zahlen und derselben verlangten Antwort; Messbecher nur, wenn die Handlung das konkrete Lernziel erhält. Parameter werden aus Aufgabe/Metadaten abgeleitet. |
| „Markiere die Verben in diesem Text.“ | Wort-/Textstation mit dem vollständigen vorgegebenen Kontext, erhaltenen Tokenreferenzen und derselben Markierantwort. |
| „Ordne die Satzteile.“ | Satzbausteine und erlaubte Reihenfolgen aus der bestehenden Aufgabe, nicht neu geratene Grammatik. |
| „Ordne Tier und Lebensraum zu.“ | Paarstation mit den vorgegebenen Begriffen und Informationen. |
| „Begründe deine Entscheidung.“ | verständliche Schreib-/Begründungsstation mit bestehender Rubric/manueller Bewertung, kein erzwungener Auswahlweg. |

Das Mapping arbeitet zweistufig: Aufgabentyp bestimmt zunächst den Antwortkern, Lernziel/Inhalt bestimmt die geeignete Inszenierung. Gleicher Typ bedeutet nicht gleiche fachliche Aufgabe. Lehrkraftvorgaben haben Vorrang; Lösungen werden nie zur bequemen Spielmechanik umgedreht. Adaptive Weltgestaltung und neue Aufgabengenerierung sind getrennte Schritte.

## Tempo und Fehlerfall

Das große Browser-/Assetpaket wird wiederverwendet. Aufgabe→bekannte Vorlage und Layoutzusammenstellung sollten bei zehn bereits strukturierten Aufgaben auf Sekunden ausgelegt sein; konkreter Zielwert und p95 müssen erst im echten nächsten Schnitt gemessen werden. Falls freie Fragen KI-Ergänzung brauchen, fällt diese einmal pro Test an, mit sichtbarem Fortschritt, wiederverwendbarem Ergebnis und Inhaltsfingerprintcache. Keine ungeprüfte Zeitgarantie oder versteckte Providerstarts. Neue Medien/Modelle sind für den ersten korrekten Schnitt ausgeschlossen.

Die schnelle sichere Alternative bei fehlender Spezialmechanik ist eine geeignete Standardstation für dieselbe Frage, nicht eine fachlich unpassende schnelle Spezialstation. Fehlender Hörtext, widersprüchliche Einheiten oder unbestimmbare Lösung verlangen eine konkrete Klärung; keine falsche Sicherheit durch bloß gültiges JSON. Automatische Format-/Mappingprüfung ergänzt die bestehende fachliche Testvorschau.

## Frischer Codebeleg und nächste Probe

Tatsächliche Appquelle jetzt `feature/gradecrew-app-integration@8f8697901f8c1aea89897be855ca2872c82d0f2b`. [functions/lib/schemas.js](https://github.com/HerrLoeffler/Hausaufgabe/blob/8f8697901f8c1aea89897be855ca2872c82d0f2b/functions/lib/schemas.js#L80) nennt elf Typen und strukturierte Felder unter anderem numericAnswer/unit/tolerance, passage/targetWords, items/acceptedOrders; testSchemaForRequest124ff bildet eine feste Aufgabenanzahl ab. Diese geprüfte Quelle belegt Datenverfügbarkeit, **keinen schon vorhandenen Levelmapper** und keine Garantie, dass ein Freitextprompt heute zehn vorgegebene Fragen exakt erhält. ai-job/test-variant-Struktur nur lesend eingeordnet; kein Job/API-/Provider-/Deploystart. Der frühere Plan-/Appstand44ab bleibt historischer Beleg, nicht mit8f vermischt.

D1 (Präferenz) normale Lehrer-Eingabe ohne Rätselparameter: durch dieses Nutzerfeedback resolved. D2 (Fakt) strukturiertes Aufgabenmodell: an8f geprüft. D3 (Vorschlag) semantischer Mapper+validierte Bausteinbibliothek: beschrieben, Umsetzung nicht beauftragt durch „Überleg dir“. D4 (Messung) Zeit/Passung bei10Aufgaben: offen.

**Genau nächste vorgeschlagene Probe:** zehn konkrete vorgegebene Aufgaben gemeinsam als Batch übernehmen und automatisch auf die verfügbaren vier bis fünf Vorlagen bzw. eine unveränderte Standard-Fragestation abbilden; Level ohne Lehrer-Parameterformular zusammenstellen. Prüfen: alle zehn Originalfragen erhalten, richtige Mechanik/Antwortabbildung, keine manuelle Bruchkonfiguration, gemessene Laufzeit, verständliche negative Fälle. Der neue richtige Probeauftrag muss diesen Umfang bestätigen; PR234 wird nicht weiter als akzeptierter Teacherflow ausgebaut. Keine UI-/Runtime-/Budget-/Versuchsänderung in diesem Denk-/Dokumentationsschritt.
