# Testify: Datenschutz, Unterrichtsmaterial und nächste Schritte

Stand: 24.09.2026. Nur Staging-Zweig `feature/ai-integration`; ein Git-Push allein aktiviert die Änderungen nicht in Firebase.

## Tatsächliche Datenflüsse

| Daten | Weg | Status |
| --- | --- | --- |
| Material (Originaldatei) | Browser → Firebase Storage `aiUploads/{uid}` → Cloud Function → OpenAI Responses API | Original wird nach KI-Aufruf auch bei Fehlern serverseitig gelöscht; nie verwendete Uploads werden ab 24 h Alter täglich bereinigt. Löscherfolg nach Staging-Deployment kontrollieren. |
| KI-Bild | Bildbeschreibung aus Testaufgabe → OpenAI Bild-API → WebP im Frage-Dokument | Die Originaldatei geht nicht unmittelbar an die Bild-API. Die Beschreibung kann Informationen aus dem Material enthalten. |
| Thema, Wünsche und ähnlicher Test | Texteingaben bzw. Fragen/Lösungen aus dem Ausgangstest → OpenAI Responses API | Auch ohne Datei können personenbezogene oder geschützte Inhalte übermittelt werden. Der KI-Einstieg und die Aktion „Ähnlichen Test erstellen“ weisen darauf hin. |
| Testfragen, Lösungen, Bilder | Firestore; veröffentlichte Fragen sind für Schüler abrufbar | Lösungen sind in den Frage-Dokumenten enthalten. Das ist für benotete Tests ein Integritätsrisiko. |
| Schülernamen, Antworten, Bewertungen | Browser → Firestore-Subcollection `submissions` | Lehrkraft/Admin können Ergebnisse lesen. Der Browser berechnet und schreibt die Bewertung selbst; Firestore prüft die behauptete Bewertung nicht. |
| KI-Nutzungsereignisse | Firestore `users/{uid}/aiEvents` und `aiUsage` | Metadaten statt vollständiger Prompts/Uploads, derzeit ohne automatische Löschfrist. |

`store: false` verhindert die Speicherung des Responses-Objekts als Anwendungszustand. OpenAI dokumentiert separate Missbrauchsprotokolle, die Eingaben/Ausgaben grundsätzlich bis zu 30 Tage enthalten können. Ob weitere Regional- und Aufbewahrungsoptionen verfügbar sind, ist mit dem konkreten API-Konto zu klären.

## Reihenfolge

### P0 – vor Nutzung mit echtem Schulmaterial und echten Schülerdaten

1. **Staging prüfen:** `./deploy-staging.sh` im authentifizierten Projekt ausführen, Storage-Regeln, neue Funktion `purgeAiUploads` und Löschung nach Erfolg/Fehler anhand unkritischer Testdateien überprüfen. Den Cloud-Scheduler-Job und seine Fehler protokollieren bzw. alarmieren.
2. **Schule und Betreiber klären:** Wer entscheidet über Zwecke/Mittel, und wer sind Auftragsverarbeiter? Mit Schulleitung/Datenschutzbeauftragtem Rechtsgrundlage, Datenarten, Verzeichnis, Informationspflichten, Speicherfristen und ggf. Datenschutz-Folgenabschätzung klären. Verträge und Unterauftragsverarbeiter für Firebase/Google und OpenAI sowie Drittlandtransfers und tatsächliche Datenstandorte prüfen. Solange ungeklärt: keine echten Schülerdaten an die KI.
3. **Materialregeln veröffentlichen:** Nur eigene oder ausdrücklich für externe KI freigegebene Materialien ohne personenbezogene Daten zulassen. Für Schulbuchseiten und Verlagsarbeitsblätter ist die normale Kopiererlaubnis keine Erlaubnis zum KI-Upload. Regelung zum Umgang mit versehentlich hochgeladenem Material und Rechteanfragen dokumentieren; betroffene Uploads und eventuell nachgebildete Ausgaben entfernen.
4. **Prüfungssicherheit herstellen:** Lösungen von öffentlich lesbaren Fragen trennen, Bewertung/Abgabe serverseitig validieren und Versuche an einen sicheren Ablauf binden. Bis dahin keine unbeaufsichtigten benoteten Prüfungen, weil Abruf der Lösungen und frei behauptete Punktzahlen technisch möglich sind.
5. **Live-Tests stabilisieren:** Inhalt und Bewertungsregeln eines gestarteten Tests einfrieren. Änderungen der Lehrkraft als neue Version oder erst für einen neuen Durchlauf übernehmen; Regressionstest für „Aktualisieren beendet den Test“ und Bearbeitung während Schülerantworten offen sind.

### P1 – vor Ausweitung über Admin-Beta hinaus

6. Aufbewahrung und Löschung für Tests, Abgaben, KI-Ereignisse und Backups festlegen; Lösch- und Auskunftsweg implementieren und mit Testkonten prüfen.
7. Firebase App Check für Functions und Storage nach Messung aktivieren; Uploadrate und Gesamtspeicher begrenzen, Dateitypen auch serverseitig prüfen, unnötige Foto-/Dokumentmetadaten minimieren. Ein Häkchen und Prompt-Anweisungen erkennen keine versteckten Daten verlässlich.
8. Rechte- und Datenschutzinformationen im Produkt in einfacher Sprache bereitstellen; Lehrkräfte zu hochgeladenen Dateien und Lizenzbedingungen schulen. Den Entwurf vor Veröffentlichung fachlich und auf unbeabsichtigte Text-/Bildübernahmen prüfen lassen.

### P2 – Qualitäts- und Produktarbeit

9. Per-Test-Kosten sichtbar machen (Text, Reparaturversuch, jede Bildoption), Tagesbudget und Warnschwellen; Bildantworten erzeugen mehrere kostenpflichtige Bilder.
10. Fachliche Qualitätsprüfung mit repräsentativen Aufgaben ergänzen: Lösungen, Dopplungen, Bild-Antwort-Konsistenz, Barrierefreiheit und Altersangemessenheit. Mathematische Graphen und beschriftete Diagramme bei Bedarf deterministisch rendern statt generativ zeichnen.
11. Erstellungsfortschritt im Staging mit echten Laufzeiten kalibrieren; gegenwärtig ist der Prozentwert ausdrücklich eine Schätzung. Editor und Dropdowns mit Lehrkräften erproben.
12. Vor einer späteren KI-Bewertung individueller Schülerleistungen die Einordnung nach der EU-KI-Verordnung gesondert prüfen. Der heutige KI-Pfad erstellt Aufgabenentwürfe; die Schülerbewertung im Browser ist regelbasiert, aber aus Sicherheitsgründen trotzdem zu überarbeiten.

## Herangezogene Primärquellen

- Bundesrecht: [§ 60a UrhG](https://www.gesetze-im-internet.de/urhg/__60a.html), [§ 97 UrhG](https://www.gesetze-im-internet.de/urhg/__97.html).
- Verband Bildungsmedien, [Urheberrecht und KI](https://www.schulbuchkopie.de/index.php/urheberrecht-und-ki) und [Broschüre 2026](https://schulbuchkopie.de/images/files/Schulbuchkopie_2026_Broschuere.pdf).
- Bayerisches Kultusministerium, [Datenschutz an Schulen](https://www.km.bayern.de/recht/datenschutz-an-schulen) und [KI in der Schule](https://www.km.bayern.de/gestalten/digitalisierung/kuenstliche-intelligenz).
- OpenAI, [API-Datenkontrollen](https://developers.openai.com/api/docs/guides/your-data) und [Zusatz zur Datenverarbeitung](https://openai.com/de-DE/policies/data-processing-addendum/).
- Europäische Union, [KI-Verordnung, insbesondere Anhang III Bildung](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/deu).
