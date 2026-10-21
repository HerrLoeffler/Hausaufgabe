# Testify: Qualität, Bedienung und Datenschutz

Stand: 27.09.2026. Codebasis: `8dbfaaa`, Erweiterung `2.3.1-ai29` auf `fix/ai-review-workflow`. Die öffentlich abrufbare Staging-Oberfläche entsprach bei der Prüfung bytegenau ai28. Keine Einsicht in Firebase-Projekteinstellungen, Verträge oder tatsächliche Datenbankinhalte; keine bestätigte DSGVO-Konformität. Produktion wird nicht verändert.

## Die gemeldeten Qualitätswarnungen

- Die fünf Warnungen zu `[dem]`, `[räumt]`, `[auf]`, `[beginnt]`, `[besichtigt]` und `[der neugierige Tim]` behandeln die interne Lückentextsyntax fälschlich als Schüleransicht. Die Klammerinhalte werden im normalen Aufgabenbild als Eingabefelder dargestellt. Technisch öffentlich abrufbare Lösungsfelder bleiben ein separates Sicherheitsproblem, siehe unten.
- Bei Aufgabe 8 fehlt uns die vollständige Aufgabe samt `correctBoolean`: Ist eine falsche Aussage absichtlich als „Falsch“ hinterlegt, ist das eine zulässige Richtig/Falsch-Aufgabe. Ohne diese Lösung lässt sich der gemeldete fachliche Fehler nicht bestätigen.
- Der Hinweis zu Aufgabe 49 ist plausibel, falls tatsächlich nur „das Heft“ und „die Kinder“ ohne Satzkontext zugeordnet werden sollen. Nominativ und Akkusativ sind dann nicht eindeutig unterscheidbar. Die vollständige Aufgabe wurde nicht übermittelt.

ai29 trennt `studentView` und `answerKey` in der KI-Prüfung. Ein Lösungshinweis muss mit einem wörtlichen Beleg aus dem sichtbaren Aufgaben-/Lesetext begründet werden. Richtige Antwortoptionen, interne Sortierfolgen und absichtlich falsche Richtig/Falsch-Aussagen allein zählen nicht als Fehler. Belegbare Probleme werden automatisch repariert und nochmals geprüft. Falls eine Reparatur nur teilweise gelingt, wird der verbliebene Entwurf erneut geprüft; alte Hinweise werden nicht einfach auf neue Inhalte übertragen.

Die Oberfläche bindet Hinweise an Aufgaben-IDs, zeigt den vollständigen Hinweis direkt an der Aufgabe und bietet „Mit KI verbessern“, „Geprüft“ und „Warnung passt nicht“. Die Nummern in der Übersicht passen sich beim Verschieben an. Änderungen einer Aufgabe werden als neuer Bearbeitungsstand erkannt. Fertige Varianten werden erst auf „Übernehmen“ eingefügt, damit Eingaben und Fokus während der Erstellung erhalten bleiben. Das läuft im geöffneten Tab; es ist noch kein serverseitiger, tabunabhängiger Variantenauftrag.

## Was wir von anderen Angeboten übernehmen können

Untersucht wurden öffentlich zugängliche Produkt-, Hilfe- und Datenschutzseiten. Keine Prüfung eingeloggter Anwendungen und kein unabhängiges Datenschutz-Audit dieser Anbieter.

| Angebot | Beobachtung auf den öffentlichen Seiten | Konkrete Entscheidung für Testify |
| --- | --- | --- |
| [paddy](https://paddy.app/) | Ein zentraler Wunsch/Chat-Einstieg, direkte Materialerstellung, Lehrplanbezug als Produktversprechen. | Nächster größerer Entwurf: „Was möchtest du prüfen?“ als Einstieg, erkannte Einstellungen in einer kompakten prüfbaren Zusammenfassung. Der strukturierte Testeditor bleibt für präzise Aufgabenbearbeitung. |
| [fobizz](https://fobizz.com/de/die-fobizz-tools-fuer-schule-und-unterricht/) | Materialien erstellen, teilen und auswerten; zeitlich begrenzte Schülerzugänge mit individuellen Codes und automatischer Löschung. | Abläufe Erstellen → Prüfen → Durchführen → Auswerten klarer ordnen. Schülerzugang und Ablaufdatum als eigenen technischen Arbeitsblock umsetzen. |
| [schulKI](https://schulki.de/) | Arbeitsblätter, Feedback und Medienfunktionen; getrennte Bereiche für unterschiedliche Arbeitsschritte. | KI-Hilfen dort anbieten, wo die Lehrkraft gerade arbeitet. Das KI-Bildfeld liegt direkt beim Aufgabenbild, Warnungen direkt bei der betroffenen Aufgabe. |

Die ai29-Überarbeitung ergänzt eine kompakte Aufgabenübersicht mit Warnmarkierungen. Seltene Aktionen liegen im Menü „•••“. Ein vollständiger Umbau des Dashboards oder eine Chat-Oberfläche ist damit noch nicht umgesetzt. Für präzise Zahlenstrahlen, Graphen und beschriftete Geometrie ist ein berechneter Renderer geeigneter als ein generatives Bild. Das Bild-Prompt-Beispiel wurde deshalb auf ein einfaches Motiv geändert.

Die paddy-FAQ behauptet ausschließlich deutsche Verarbeitung. Die [Datenschutzhinweise](https://paddy.app/datenschutz/) nennen dagegen auch Drittlandtransfers sowie Mistral und Anthropic als KI-Anbieter und erklären, dass personenbezogene Angaben in Prompts weitergegeben werden können. Die Texte sind unterschiedlich datiert. Daraus folgt kein Beweis für einen Rechtsverstoß; das pauschale Marketingversprechen ist damit öffentlich aber nicht hinreichend nachgewiesen. [Dokumentierte Löschfristen](https://paddy.app/aufbewahrungs-und-loeschfristen/) sind ein sinnvoller Standard, den Testify ebenfalls konkret nachweisen muss.

## DSGVO: belegter Stand und offene Arbeit

Ein deutscher Server allein genügt nicht. Rollen, Zweck, Rechtsgrundlage, Dienstleister, Sicherheit, Speicherfristen und Betroffenenrechte müssen für die konkrete Schulnutzung zusammenpassen. Die rechtliche Prüfung muss mit der verantwortlichen Schule und deren Datenschutzbeauftragtem erfolgen. Testify als privates Produkt ist von der Schule als Nutzerin zu unterscheiden.

| Bereich | Im Quellcode / in offiziellen Dokumentationen festgestellt | Was fehlt / wer handelt |
| --- | --- | --- |
| Rollen und Verträge | Technischer Betrieb über Google/Firebase und OpenAI. | Betreiber und Schule: Rollen je Verarbeitung festlegen; AVV Schule–Testify, Unterauftragsverarbeiter, TOM, Informationspflichten und Rechtsgrundlagen prüfen. Der bayerische [Schuldatenschutz-Leitfaden](https://www.km.bayern.de/recht/datenschutz-an-schulen) erklärt diese Verantwortlichkeiten. |
| Datenstandorte | Functions-Region `europe-west1` ist nicht Deutschland. [Firebase Authentication verarbeitet laut Google ausschließlich in den USA](https://firebase.google.com/support/privacy). Datenbank-, Storage- und Backup-Standorte wurden nicht aus dem Projekt ausgelesen. | Betreiber: reale Standorte und Transfergrundlagen dokumentieren. Für ein striktes Deutschland-Versprechen wären u. a. Authentifizierung, KI-Dienst, Protokolle und Sicherungen entsprechend umzustellen. Das ist eine Infrastrukturentscheidung, keine Checkbox. |
| KI-Daten | Server vermittelt API-Aufrufe; `store:false` ist gesetzt. [OpenAI verwendet API-Daten standardmäßig nicht zum Modelltraining](https://developers.openai.com/api/docs/guides/your-data), außer bei ausdrücklicher Freigabe. Missbrauchsprotokolle können dennoch Inhalte enthalten; zusätzliche Aufbewahrungs-/Regionaloptionen hängen von Konto, Freigabe und Endpoint ab. | Betreiber: DPA und konkrete Kontoeinstellungen nachweisen, freiwillige Datenfreigaben prüfen, gegebenenfalls EU-Projekt/geeigneten regionalen Dienst wählen. EU-Datenresidenz ist kein Deutschland-Versprechen und umfasst nicht jede Datenkategorie. |
| Datensparsamkeit | ai29 fordert Schülerkürzel statt Vollnamen an, übermittelt neutrale Materialdateinamen, entfernt Bildmetadaten nach Berücksichtigung der Ausrichtung und kopiert Name/E-Mail nicht zusätzlich in neue Aufgabenbewertungen. | Kürzel bleiben ggf. personenbezogen. Namen innerhalb von PDF/Office-Dokumenten oder Bildpixeln werden dadurch nicht anonymisiert. Eine geprüfte Vorschau mit Schwärzung sowie klare Uploadregeln fehlen noch. |
| Zugriffsrechte | `firestore.rules` enthält eine alte globale `/submissions`-Regel mit öffentlichem Lesen/Anlegen. Veröffentlichte Aufgaben enthalten Lösungen. Veröffentlichte Versuchsdokumente sind beim bekannten Pfad lesbar und enthalten das eingegebene Kürzel/den Namen. | P0: Legacy-Zugriff schließen, Versuche an kurzlebige individuelle Zugangstoken binden, Lehrer-/Schulzugriffe testen. Keine Schülerdatensätze wurden für diesen Bericht ausgelesen. Dieser Regelumbau ist in ai29 noch nicht umgesetzt. |
| Prüfungssicherheit | Der Browser erhält Lösungsfelder und übermittelt selbst berechnete Punkte. | P0: öffentliche Aufgaben von privatem Lösungsschlüssel trennen; Abgabe und Bewertung serverseitig durchführen; gestartete Testversion einfrieren. Dafür sind Datenmigration und Tests des gesamten Schülerablaufs nötig. |
| Löschen und Auskunft | Materialuploads werden nach Verarbeitung gelöscht; zusätzlich existiert ein Bereinigungsjob für verwaiste Uploads. Die tatsächliche Ausführung wurde hier nicht geprüft. | P0/P1: Ablauf-/Löschregeln für Abgaben, Konten, Versuche, Feedback, KI-Ereignisse, lokalen Entwurfsspeicher und Backups festlegen und durchsetzen; Auskunftsexport und nachweisbaren Löschablauf bauen. Schülerleistungen nicht ohne abgestimmte schulrechtliche Frist pauschal löschen. |
| Betrieb und Risiko | App Check für Functions im untersuchten Code nicht erzwungen. KI erstellt Entwürfe, die automatische Punkteberechnung ist derzeit regelbasiert. | App Check nach Kompatibilitätsprüfung, Missbrauchsschutz, Rechte- und Löschtests, Vorfallprozess. Mit der Schule DSFA-Erforderlichkeit bewerten. Vor KI-Bewertung individueller Leistungen zusätzlich EU-KI-Verordnung prüfen. |

Maßgebliche Orientierung: [BayLfD, Datenschutz bei KI-Projekten, 2026](https://www.datenschutz-bayern.de/ki/OH_KI.pdf). Diese technische Bestandsaufnahme ersetzt keine rechtliche Freigabe und enthält keine pauschale Behauptung, Firebase oder OpenAI seien unzulässig.

## Wie Testify konkret aus Fehlern lernt

1. Rückmeldung mit Aufgabeninhalt, Lösung, Grund, Fach, Klasse und Promptversion erfassen. ai29 ergänzt bisher fehlende Lösungsstrukturen; „mehrdeutig“ ist ein eigener Grund.
2. Aufgabenfehler und Prüfer-Fehlalarme getrennt zählen. Ein zurückgewiesener Warnhinweis wird weder zur schlechten Beispielaufgabe noch zum Beweis, dass die ganze Aufgabe gut ist. Der Admin sieht diese Fälle separat.
3. Bestehendes Qualitätsgedächtnis nutzt aggregierte Fehlergründe und Strukturmuster für neue Anfragen. Wiederholte Signale mehrerer Lehrkräfte bekommen besonderes Gewicht. Namen, E-Mails und freie Kommentare werden dafür nicht an die KI weitergegeben. Bekannte negative Aufgaben werden intern verglichen.
4. Jeder bestätigte technische Fehler erhält einen reproduzierbaren Regressionstest. Für diesen Bericht sind Lückentext-Fehlalarme, absichtlich falsche Aussagen, Warnungszuordnung und konkurrierende Editoraktionen abgedeckt.
5. Fachliche Verbesserungen zusätzlich an einer festen, von Lehrkräften geprüften Aufgabensammlung messen: richtige Lösungen, Eindeutigkeit, echte/übersehene Fehler, Fehlalarmquote, Wiederholungen, Dauer und Kosten. Likes allein belegen keine Qualitätssteigerung. Diese fachliche Benchmark-Sammlung und echte Modellläufe müssen noch aufgebaut werden.
6. Lehrpläne als belegte Quellen einbinden: zuerst Bayern/Mittelschule, ausgewählte Fächer und Klassen. Pro Kompetenz Quelle, Abrufstand und Geltungsbereich speichern; nur passende Auszüge in die Erstellung aufnehmen. Beispiel: [Deutsch 5, LehrplanPLUS](https://www.lehrplanplus.bayern.de/fachlehrplan/mittelschule/5/deutsch) führt Hauptsatzarten und die Untersuchung von Satzgliedern auf. Der heutige Prompt mit „Bayern/Mittelschule/Klasse 5“ ersetzt diese Quellenbasis nicht. Kein vollständiger Lehrplanbestand wurde in ai29 eingebaut.

Es findet damit kein automatisches Training des OpenAI-Basismodells statt. Verbessert werden die Vorgaben, Quellen, eigenen Prüfungen und Reparaturschritte.

## Reihenfolge für den nächsten Betriebsschritt

1. ai29 auf Staging übernehmen, vorhandenen Servercode zuvor automatisch abgleichen und sichern. Kein Produktionsdeploy.
2. Mit unkritischen Inhalten: „Satzbaustelle“, 50 Aufgaben/40 Punkte ohne Bild; anschließend mit 1 und 5 Bildern; Varianten erstellen und dabei andere Aufgaben bearbeiten; Warnungen nach Verschieben/Löschen/Speichern erneut öffnen.
3. P0-Datenschutz-/Prüfungsumbau mit Zugangstoken, privatem Lösungsschlüssel und serverseitiger Bewertung umsetzen und migrieren. Parallel rechtliche Unterlagen mit der Schule prüfen.
4. Erst danach eine klar begrenzte Kollegentestphase mit festgelegten Datenarten. Mobile App und vollständiges Dashboard-Redesign anschließend priorisieren.
