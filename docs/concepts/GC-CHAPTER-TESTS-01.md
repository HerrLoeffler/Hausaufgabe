# GradeCrew: Tests mit Themenkapiteln

GC-CHAPTER-TESTS-01 · Konzeptentwurf vom 20.10.2026 · keine Produktfreigabe

Konkreter Folgeplan: [Kapitelgrundstruktur](../superpowers/plans/2026-10-20-gradecrew-chapters-foundation.md). Martin beauftragt zuerst die Grundstruktur; Bereichstimer werden danach genauer geplant. Der bestehende Gesamttimer bleibt unverändert. Die aktive Assessmentquelle wurde im Folgeplan berichtigt: main.js → lib/secure-lifecycle.js, nicht der ältere index.js-Handler.

## Urteil

**Gut und realisierbar: 8/10 für optionale Kapitel im bestehenden Test.** Besonders plausibel bei einem breiten Mathetest: Themenplan, Orientierung und thematische Auswertung werden verständlicher. Das ist eine begründete Produkteinschätzung, kein Nachweis besserer Lernergebnisse. Bei kurzen Tests wären sechs Kapitel zusätzliche Bedienlast. Kapitelanzahl deshalb frei wählbar; ohne Kapitel bleibt der heutige Ablauf erhalten.

Unnötig wäre ein Start mit sechs getrennten Prüfungen und eigener Prüfungsengine. Optionale Bereichstimer gehören dagegen als Erweiterung der vorhandenen Testeinstellungen zum Konzept; ihre genaue Zeitlogik ist gesondert festzulegen. Das erhöht Organisationslast, Zustandskomplexität und das Risiko verlorener oder missverständlich abgegebener Antworten. Empfehlung: **ein Test, optionale Kapitel, freie Rückkehr, eine Endabgabe**. Der Nutzen muss anschließend mit Lehrkräften und echten Geräten geprüft werden.

Von Martin am 20.10.2026 präzisiert: Übung und benoteter Test erhalten dieselbe Kapitelstruktur und dieselben optionalen Einstellungen. Das vorhandene Testerstellungssystem wird erweitert. Bundesland/Jahrgang sind keine Voraussetzung für diese Funktion; die vorhandene Lehrplaneinbindung bleibt im bestehenden Hintergrundprozess. Deren Kapitelanbindung wurde hier noch nicht technisch geprüft. Keine zusätzliche Diagnose- oder Erstellungsoberfläche.

## Beispiel: sechs Kapitel Mathematik

Frei gewählter Themenmix, **kein offizieller Jahrgangsstufentest und keine Lehrplanbehauptung**. Die grundlegende Kapitelrealisierung ist unabhängig von einer Festlegung auf Jahrgang, Schulart oder Bundesland. Zahlen dienen nur dazu, Planung und Gewichtung sichtbar zu machen. 18 Aufgaben sind kein Qualitätsziel und keine Aussage über eine passende Bearbeitungszeit.

| Kapitel | Drei vorgeschlagene Aufgaben | Punkte | Schwerpunkt |
|---|---|---:|---|
| 1 Zahlen und Rechnen | Dezimalzahlen ordnen (2); Rechenausdruck auswerten (2); einen Rechenfehler begründen (4) | 8 | Routine und Verständnis |
| 2 Brüche und Anteile | Bruchdarstellung zuordnen (2); einfachen Anteil berechnen (2); zwei Lösungswege vergleichen (4) | 8 | Darstellung und Begründung |
| 3 Zuordnungen und Prozent | Wertetabelle ergänzen (2); Rabatt berechnen (2); Angebot mit kurzer Begründung vergleichen (4) | 8 | Übertragung auf Situationen |
| 4 Geometrie und Messen | Eigenschaft einer Figur auswählen (2); Umfang berechnen (2); Flächenproblem mit Skizze bearbeiten (4) | 8 | Begriffe, Größen und Anwendung |
| 5 Terme und Gleichungen | Term einer Situation zuordnen (2); einfache Gleichung lösen (2); Modellierung erklären (4) | 8 | Symbolverständnis und Modellierung |
| 6 Daten und Zufall | Diagramm ablesen (2); Kennwert berechnen (2); Zufallsaussage begründet beurteilen (4) | 8 | Lesen, Rechnen und Argumentieren |
| Gesamt | 18 Aufgaben | 48 | Unterrichtsbezug noch zu prüfen |

Nicht jede Aufgabe benötigt ein anderes Format. Zahl, Auswahl, Zuordnung und kurze offene Begründung reichen als Ausgangspunkt; offene Begründungen brauchen fachliche Nachsicht. Ein Hörformat ist nur sinnvoll, wenn es zum Lernziel passt, nicht zur künstlichen Formatvielfalt. Sprachlast, erforderliches Vorwissen, Hilfsmittel und Aufwand müssen mitgeplant werden. Ein Tablet ersetzt kein geeignetes Geometriewerkzeug.

Je Kapitel plant die Lehrkraft Lernziel/Thema, Aufgabenanzahl, Schwierigkeitsmix, Punktebudget und optional Material. Schwierigkeit ist zunächst eine gewünschte Einschätzung, keine empirisch kalibrierte Eigenschaft. Die drei Aufgabenvorschläge können nach Prüfung reduziert werden.

Gewichtung im Minimalumfang: Punkte addieren. Bei 8 Punkten je Kapitel zählt jedes Kapitel ein Sechstel. Beispiel: 6+4+8+2+6+4 = 30/48 = 62,5 %. Erst für die Anzeige runden, keine Summe gerundeter Kapitelprozente. Bei unterschiedlich großen Kapiteln zählt ein Kapitel mit 12 Punkten doppelt so stark wie eines mit 6 Punkten. Das muss vor Veröffentlichung sichtbar sein. Keine zusätzliche prozentuale Gewichtung im ersten Schritt.

## Drei Varianten im gleichen Vergleich

Alle Skalen: 1 = wenig geeignet, 10 = sehr geeignet. In der Technikspalte bedeutet ein hoher Wert **geringer Aufwand und geringeres Änderungsrisiko**, nicht große Komplexität. Zahlen sind fachliche Einschätzungen; keine Messwerte oder präzisen Kostenprognosen.

| Variante | Nutzen | Bedienklarheit / geringe Mehrarbeit | Technik / geringes Risiko | Alltagstauglichkeit |
|---|---:|---:|---:|---:|
| A Flacher Test mit Abschnittsüberschriften | 5 | 8 | 9 | 7 |
| B Optionale Kapitel im vorhandenen Test | 9 | 8 | 6 | 9 |
| C Eigenständiger erweiterter Test-/Diagnosemodus | 8 | 4 | 3 | 5 |

A schafft schnell Lesestruktur, aber ohne echte Zuordnung keine verlässlichen Kapitelpunkte, Materialzuordnung oder Kapitelstatistik. Überschriften als fingierte Aufgaben wären ungünstig: Aufgabenanzahl, Zufall und Auswertung könnten sie als Aufgaben behandeln. A wäre allenfalls eine begrenzte Darstellungsstufe.

B erfüllt das konkrete Beispiel und übernimmt bestehende Abgabe, Bewertung und Fristen. Der Preis ist eine Änderung quer durch Speicherung, sichere Projektion, Navigation und Auswertung. Deshalb Technik 6/10. Die Bedienung kann für kleine Tests unverändert bleiben. **Empfehlung für den ersten Produktumfang.**

C wäre erst sinnvoll, wenn eigenständige Diagnoseziele mit geprüften Aufgabenpools, Interpretationsregeln und wiederholten Messungen gefordert werden. Kapitel allein rechtfertigen keinen neuen Modus. Getrennte Abgaben wären ein zusätzlicher Produktumfang; optionale Zeitregeln lassen sich innerhalb von B planen; eine zweite Exam-Engine ist nicht vorgesehen. C hat potenziell hohen Nutzen, aber für Martins bisherige Frage unnötig viel Bedien- und Entwicklungsaufwand.

## Konkreter Ablauf in der bestehenden Oberfläche

### Lehrkraft

Im bestehenden Editor unter Titel und Testeinstellungen steht optional „In Kapitel gliedern“. Danach erscheint oberhalb der Aufgaben eine kompakte Themenliste:

> Zahlen und Rechnen · 3 Aufgaben · 8 Punkte · Verschieben · Umbenennen
>
> Brüche und Anteile · 3 Aufgaben · 8 Punkte
>
> + Kapitel hinzufügen

Aufgabenkarten behalten ihre vorhandenen Eingaben und erhalten eine Kapitelzuordnung. Kapitel und Aufgaben lassen sich auch ohne Drag-and-drop per Hoch/Runter bedienen. Umbenennen verändert keine IDs. Beim Löschen eines gefüllten Kapitels müssen Aufgaben in ein anderes Kapitel verschoben oder ausdrücklich mitgelöscht werden; kein stiller Verlust. Leere Kapitel dürfen im Entwurf bestehen, blockieren aber die Veröffentlichung bis sie befüllt oder entfernt sind. Bei aktivierter Kapitelstruktur muss jede Aufgabe genau einem Kapitel angehören.

Für Remy ergänzt der bestehende Erstellungsweg einen Themenplan: sechs Zeilen mit Thema, Ziel, gewünschter Anzahl, Schwierigkeitsmix, Punktebudget und Materialreferenzen. Remy erzeugt **einen vollständigen Entwurf**, keine sechs unabhängigen Tests. Zuteilungen und tatsächlich erzeugte Anzahl/Punkte werden danach gegen den Plan geprüft. Abweichungen erscheinen sichtbar; fehlende Aufgaben werden nicht als erfüllt ausgegeben. Bestehende Job-/Fortsetzen-/Budgetmechanik weiterverwenden. In diesem Konzeptchat werden keine Generierungen gestartet.

Emmi unterstützt die Überarbeitung im vorhandenen Editor; Wilma kann als fachliche Prüfhilfe einbezogen werden, soweit ihr tatsächlicher Integrationsvertrag das trägt. Das Kapitelbriefing muss beim Prüfen erhalten bleiben. Diese Helfer sind keine automatische Qualitätsgarantie. Vor Veröffentlichung gibt es eine Schüleransicht zur Prüfung des gesamten Tests einschließlich kapitelübergreifender Hinweise.

Material im ersten Schritt als **Entwurfs-/Quellenreferenz je Thema**. Schülerrelevante Texte, Bilder oder Audio bleiben an den jeweiligen Aufgaben. Ein gemeinsames kapitelweites Hörstück mit mehrfachen Referenzen wäre eine spätere Erweiterung mit eigenem Medien-/Freigabevertrag.

### Schüler

Der vorhandene Testeinstieg zeigt danach eine Kapitelübersicht, die jederzeit wieder erreichbar bleibt:

> Mathematik · 18 Aufgaben · 48 Punkte
>
> Zahlen und Rechnen: 2 von 3 Aufgaben mit Antwort
>
> Brüche und Anteile: 0 von 3 Aufgaben mit Antwort
>
> Insgesamt: 7 von 18 Aufgaben mit Antwort · Offene Aufgaben anzeigen

Fortschritt bedeutet **Antwort vorhanden**, nicht richtig oder vollständig richtig. Bei mehrteiligen Aufgaben wird zwischen „noch ohne Antwort“, „teilweise bearbeitet“ und „Antwort vorhanden“ unterschieden; der genaue Zähler muss typbezogen definiert werden. Ein Häkchen darf keine Richtigkeit vortäuschen. Keine Farbcodes aus dem Lösungsschlüssel.

Die neue schmale mobile Aufgabenleiste bleibt bestehen: Vorherige – „Kapitel 2 · Aufgabe 5/18“ – Übersicht – Nächste. Die Übersicht gruppiert die bestehenden Aufgabenbuttons nach Kapitel und bietet den Filter „ohne/mit unvollständiger Antwort“. Kapitel sind keine neuen Seiten mit eigener Antwortspeicherung. Freie Rückkehr und globale Nummerierung bleiben möglich. Keine zweite dauerhafte Leiste, die auf Handy oder iPad Tastatur und Audio verdeckt. Sprünge setzen den Fokus zur Aufgabe; neutraler Text ergänzt Statussymbole.

Am Ende des Tests steht einmal „Test abgeben“. Vor der Bestätigung: „Noch 3 Aufgaben ohne Antwort: …“. Die Lehrkraft darf offene Antworten weiterhin zulassen. Kein Kapitelwechsel gibt ab. Ohne Bereichstimer bleiben Fristablauf und automatische Abgabe globale Vorgänge im vorhandenen Lebenszyklus. Optionale Bereichsfristen müssen diesen Lebenszyklus kontrolliert erweitern (siehe Zeitkonzept). Ein angezeigter Offline-Stand muss klar zwischen lokal gesichert und vom Server bestätigt unterscheiden.

### Ergebnisse

Die bestehende Auswertung erhält unter dem Gesamtergebnis eine Kapiteltabelle: Punkte / Maximalpunkte / Prozent / Bewertungsstatus. Manuell zu prüfende Antworten bleiben auch auf Kapitelebene vorläufig. Nach Korrektur müssen Kapitel- und Gesamtsumme gemeinsam neu berechnet werden.

Beispiel: „Geometrie: 2/8 Punkte, 25 % – Hinweise zum weiteren Üben“. Daraus folgt nicht „kann keine Geometrie“. Wenige Aufgaben decken nur die tatsächlich gestellten Anforderungen ab; Tagesform, Sprache, Format und Hilfsmittel beeinflussen die Interpretation. Keine diagnostische Ampel mit behaupteten Kompetenzstufen und keine Kapitelnoten aus drei Aufgaben.

Übung und benoteter Test verwenden ihre bestehenden Einstellungen. Lösungen bleiben an die zentrale Freigaberegel gebunden; ein fertig bearbeitetes Kapitel schaltet keine Lösungen frei. Kapitelpunkte vor Freigabe nur anzeigen, soweit die bestehende Ergebnispolitik dies erlaubt. Später kann „dieses Thema wiederholen“ einen neuen Übungsentwurf anlegen; Originaltest, Versuch und alte Ergebnisse bleiben unverändert. Die offenen Lernspiel-/Wissensreise-PRs sind Anknüpfungspunkte, noch kein garantierter Kapiteladapter.

## Codeinventur und notwendige Änderungen

Geprüft: aktuelles Remote-main `c14a8fdee852f6d5105c1b7e12701a0112272263`; Runtime-Integrationsref `4f8b79222a35997852aad4673f8aaf338904f485`, identisch mit der ausschließlich lesend verwendeten lokalen Referenz. main koordiniert; es ist nicht die Runtimequelle. Zusätzlich nativer Branch `feature/native-live-staging-20261018`, dessen Dateien gesondert zu behandeln sind. Keine Datenbankinhalte oder echten Schülerdaten gelesen.

Die Bezeichnungen Draft/Question/Paper/Attempt/Grading/Result sind hier fachliche Datenstufen, **keine Behauptung vorhandener gleichnamiger Klassen**.

| Stufe | Tatsächlich gelesen / Ist | Erforderlich für B |
|---|---|---|
| Draft / Quiz | `app.js:5898` editorDraftSnapshot hat eine explizite Quizfeldauswahl plus Fragenkopie; `editor-drafts.js` speichert lokale Entwürfe in IndexedDB. Quizdokument und Questions-Unterkollektion werden getrennt gespeichert. | Optionale geordnete `chapters`-Liste im Quiz/Entwurf aufnehmen, außerdem bei Speichern, Laden, Kopieren, Vorlagen und Wiederherstellen. Kapitel dürfen nicht beim Autosave verschwinden. |
| Question | `app.js` lädt `quizzes/{id}/questions` nach `position`; IDs und Punkte vorhanden. `assessment-core.js:366` bietet fehlenden IDs Fallbacks; Kommentar nennt auch nicht eindeutige/gekürzte Alt-IDs. | Für neue Kapiteltests eindeutige stabile Question-IDs validieren; pro Frage `chapterId`. Kapitel haben eigene stabile IDs, Titel und Position. Legacy-IDs nicht nachträglich pauschal umschreiben. |
| Generierung / Prüfen | `functions/lib/schemas.js` verwendet explizite Schemas mit `additionalProperties:false`; `functions/lib/whole-test-revision.js` ist vorhandener Überarbeitungspfad. | Kapitelplan und zulässige IDs kontrolliert durch Auftrag, Schema, Validierung, Reparatur und Überarbeitung führen. Kein bloßes Promptwort „Kapitel“, das der Speicher später verwirft. Quellenreferenzen und exakte Gesamtgrenzen prüfen. |
| Paper / Schlüssel | `assessment-functions/lib/assessment-core.js:146,247,355,366` erzeugt sichere öffentliche Fragen, private Schlüssel und Fingerprints. Es gibt keine Kapitelprojektion. Der aktive Startpfad in `lib/secure-lifecycle.js` übergibt die Shuffleoptionen bereits. Der erste Verweis auf index.js war als Runtimebeleg unzutreffend. | Versionierter Vertrag mit Kapitelmetadaten und eingefrorener Zuordnung. Öffentliche Projektion nur freigegebene Titel/Anweisung; keine Lösungen, internen Zielantworten oder privaten Quellen. Zufall im ganzen Aufrufpfad prüfen, nicht aus Editorcheckbox ableiten. |
| Attempt / Resume | Aktiv ist `assessment-functions/main.js` → `lib/secure-lifecycle.js`: gespeichert werden u.a. Frist, Run-ID, Notenschlüssel, private Fingerprints/Schlüssel sowie Decoder-/Lösungssnapshots. Resume rekonstruiert den Vertrag und vergleicht Fingerprints. Kein voll gespeichertes unveränderliches PublicPaper in diesem gelesenen Pfad. | Kapitelstruktur, Fragezuordnung und Vertragsversion beim Start fixieren. Rekonstruktion nur aus unveränderlicher veröffentlichter Revision; alternativ expliziter Snapshot. v1-Hashpfad für laufende Altversuche exakt erhalten. Kapitelwechsel darf Token/Run/Frist nicht wechseln. |
| Grading / Result | `assessment-core.js:503` bewertet nach Schlüssel-ID und summiert Punkte; `lib/secure-lifecycle.js:794` führt die aktive serverseitige Abgabe durch. `app.js:7911` exportiert Einzelantworten, Gesamtpunkte, Prozent und Status als CSV. | Kapitelaggregation anhand serverseitig fixierter Zuordnung, nicht vom Client gemeldeter Kapitel. Review-/Nachkorrekturpfad aktualisieren; Result um Kapitelpunkte/-maxima/-status ergänzen. CSV erhält stabile Kapitelspalten mit ID/Titel. Alte Ergebnisse ohne Metadaten bleiben lesbar; keine erfundene historische Kapitelzuordnung. |
| Lebenszyklus / Regeln | `firestore.secure-assessment.rules:67` begrenzt Änderungen aktiver Tests; Fragenzugriff und private Assessmentdaten sind getrennt. | Kapitel und Zuordnung ebenfalls während Veröffentlichung/laufender Versuche sperren. Keine Aufnahme in allgemeine Liste frei änderbarer Lifecyclefelder. Neue freigegebene Revision erst für neue Versuche. |
| Schüler-Web | `secure-student-navigation.mjs` navigiert bestehende `.secureQuestion[data-qid]` im DOM, ohne eigene Antworten oder Abgabe. `secure-assessment-client.js` nutzt vorhandene Callables. | Gruppierte Übersicht und Fortschritt aus Antwortzustand; bisherige IDs, Fokus-/Scrolllogik und Endabgabe erhalten. Auswertungs-/Freigabepolitik durchgängig nutzen. |
| Offline / Fristen | `assessment-functions/lib/offline-recovery-policy.js` behandelt verspätete Nachlieferung ggf. als Review; sieben Tage Recovery sind keine zusätzliche Prüfungszeit. Serverfrist wird im Submit geprüft. | Metadaten und Navigation in denselben lokalen Versuch aufnehmen. Optionale Bereichsfristen serverseitig ergänzen; keine nur lokal maßgeblichen Fristen oder impliziten Pausen. Nachlieferung, Quittung und Reviewstatus erhalten. Ein lokal gespeicherter Stand ist kein Beleg rechtzeitiger Serverabgabe. |
| App / Secure | Im separaten nativen Branch nutzen `SecureAssessmentAPI.swift` dieselben Callables, `SecureAttemptStore.swift` eine Codable-Identität, `SecureExamWebView.swift` lokale Webdateien. Die native README des Webbranches ist historisch und reicht nicht als aktueller Appnachweis. | API-/Decoderverträglichkeit und mitgelieferte lokale Webassets gesondert prüfen/aktualisieren. Browseränderung allein aktualisiert kein Apppaket. Secure-Sitzung bleibt über alle Kapitel durchgehend; Entsperren erst nach bestehender dauerhafter lokaler Abgabe-/Syncpolitik, kein Entsperren am Kapitelende. Physische Geräteprüfung erforderlich. |
| Druck / PDF | PDF-/Bildimport ist sichtbar vorhanden. Ein dedizierter Test-PDF-/Druckexport wurde in den geprüften Webpfaden nicht nachgewiesen; vorhandener Ergebnisexport ist CSV. | Bei vorhandenem weiteren Druckpfad nachinventarisieren. Minimum für Kapiteldarstellung: druckbare Überschriften/Nummern, keine Navigation im Ausdruck, keine abgeschnittenen Aufgaben. Einen neuen PDFgenerator als separaten Umfang behandeln; Audio im Papier klar kennzeichnen/mit zugelassenem Ersatz, keine Lösungen abdrucken. |

**Vorgeschlagener kleiner Datenvertrag:** Quiz/Entwurf erhält optional `chapterSchemaVersion:1` und `chapters:[{id,title,position}]`; Frage erhält `chapterId`. Globale `position` bleibt aus Kapitelreihenfolge und Aufgabenreihenfolge ableitbar. Nicht zwei unabhängig veränderbare Ordnungen pflegen. Kein neues Collection-System nur für sechs Überschriften. Quellen-/Planungsinformationen bleiben private Autorenmetadaten und werden nicht ungeprüft Teil der PublicPaper.

Für neue Kapiteltests wird die Zuordnung im unveränderlichen Versuchskontext eingefroren und in den neuen Fingerprint einbezogen. Bei Altbeständen ohne Kapitel wird der bestehende v1-Vertrag beibehalten; kein automatisches sichtbares Kapitel „Allgemein“, keine Datenmigration erforderlich. Wenn frühere Appversionen neue Kapitel nicht verlässlich unterstützen, müssen neue Kapiteltests dort vor Start verständlich gesperrt oder in einer nachweislich sicheren flachen Darstellung geöffnet werden. Das entscheidet ein Kompatibilitätstest, kein stiller Fallback.

Zufall: Kapitelreihenfolge zunächst fest; Fragen nur innerhalb ihres Kapitels mischen. Zusammenhängende Aufgaben/Medien dürfen nicht auseinandergerissen werden; solche Blöcke bleiben fest oder werden als Einheit behandelt. Antwortmischung nur in dafür geeigneten Formaten, Zuordnungs-/Audio-/Reihenfolgeschlüssel erhalten. Ein Reload reproduziert exakt dieselbe individuelle Reihenfolge. Im Minimalumfang kein Zufall über Kapitelgrenzen.

## Qualitätsregeln aus bisherigen Problemen

1. Gesamten Test auf verratene Lösungen prüfen: Überschrift „Multipliziere mit 0,75“ kann das Verfahren einer späteren Rabattaufgabe vorgeben. Neutral „Anwendungen“ oder bewusst als Hilfestellung kennzeichnen. Auch andere Kapitel, Bildalttexte, Materialien und Höranweisungen können Antworten verraten.
2. Jede Aufgabe hat einen eindeutigen Arbeitsauftrag. Beim Hörformat etwa „Höre die Aufgabe und trage das Ergebnis ein“; kein Ersatzauftrag „Lehrkraft fragen“. Ein technischer Fehlerhinweis darf weiterhin Hilfe anfordern.
3. Wahr/Falsch-Verteilung und Antwortpositionen auf auffällige Muster prüfen. Zufall allein garantiert keine Qualität; fachlich eindeutige Distraktoren und ausgewogene Konstruktion sind wichtiger. Kein starres 50:50-Muster erzwingen, das selbst zum Hinweis wird.
4. Bei einmaliger Begriffsverwendung müssen Zuordnungen eindeutig lösbar sein; Mehrfachdeutigkeit nicht durch Ausschluss oder Farbreihenfolge kaschieren.
5. Farben und Fortschritt kodieren Bearbeitungsstand, niemals richtige Lösungen. Keine Farbnamen als Lückenplatzhalter. Der iPad-Farbfehler ist im offenen historischen PR242 dokumentiert; dessen Fix liegt laut aktueller Integrationsübergabe bereits im kombinierten Stand. Keine zweite Reparatur starten.
6. Qualität, Lesbarkeit und Belastung prüfen: wenige geeignete Aufgaben statt automatisch sechs mal zehn. Keine künstliche Format-/Audioquote. Aufgabenabhängigkeiten, Fachsprache und Zeitbedarf manuell prüfen. KI-Prüfhilfen können Fehler übersehen.

## Stufenplan und Aufwand

**Stufe 0 – geklärte Richtung:** B erweitert die vorhandene Testerstellung gleichermaßen für Übung und benoteten Test; keine Bundeslandfestlegung nötig. Vorhandene Lehrplananbindung weiterverwenden. Optionales Zeitkonzept mitführen; dessen Ablaufdetails sind noch Vorschläge. Vor Implementierung exakte Runtimebasis und native Paketbasis erneut feststellen. Dieser Entwurf ist die Entscheidungsgrundlage, kein Startsignal für Entwicklung.

**Stufe 1 – kleinstes zusammenhängendes Produkt:** optionaler Kapitelplan, manuelle Zuordnung, stabile IDs/Validierung, gesicherter Publish-/Resumevertrag, freie Kapitelnavigation mit vorhandener Leiste, eine Endabgabe, einfache Kapitelpunkte samt Reviewstatus, bestehende Freigabe, CSV. Remy-Themenplan kontrolliert in bestehenden Job-/Editorweg integrieren, wenn „vollständigen Test nach Themenplan erstellen“ zum ersten Pilot gehört. Alternativ zuerst manuell testen und KI-Anbindung separat nachziehen; dies wäre eine ausdrücklich reduzierte Pilotvariante. Keine Kapitelgewichte, Sperren oder Teilabgaben.

**Stufe 2 – nach Pilotnutzen:** komfortable Kapitelvorlagen, bessere Plan-/Ist-Prüfung durch Remy/Emmi/Wilma, Themenfilter in Auswertung und Übungsentwurf, druckbare Darstellung, belastbar getestete App-/Securefreigabe. Breite Freigabe erst nach Browser-, nativer Kompatibilitäts- und Geräteabnahme; Stufe 1 darf bis dahin nur gezielt freigegebene Clients bedienen.

**Offene Optionen mit jeweils neuem Auftrag:** Kapitelreihenfolge ändern lassen, Kapitel sperren, getrennte Abgaben, echte Pausen, adaptive Auswahl oder separate Kapitelgewichte. Jede Option braucht eine begründete pädagogische Anforderung und neue Zustands-/Abnahmebedingungen. Bei benoteten Tests könnten unterschiedliche adaptive Wege die Vergleichbarkeit erschweren; das ist hier eine Designfrage, keine geklärte Messmethode.

Aufwand: A ist relativ klein, sofern nur Darstellung betroffen ist. B ist ein **mittleres, mehrere Schichten betreffendes Vorhaben**, kein reiner Editorbutton: ungefähr sieben Arbeitspakete (Vertrag/Legacy; Editor/Draft; Generierung; Server/Resume/Regeln; Navigation/Offline; Auswertung/Export; Geräte/App). C wäre ein großes separates Produktvorhaben. Eine seriöse Kalender- oder Preisangabe ist vor ID-/Fingerprint-/App-Kompatibilitätsprobe und festgelegtem KI-/PDFumfang nicht möglich. Annahme für B: vorhandene Engine und Punktepolitik werden wiederverwendet, keine Bestandsmigration, kein neuer PDFgenerator und keine native Neuentwicklung. Größte Unsicherheit: Kompatibilität alter Versuche und eigenständig ausgelieferter nativer Webassets.

## Spätere Akzeptanzkriterien

| Prüfung | Erwartung |
|---|---|
| Altbestände | Ohne Kapitel unverändertes Erstellen/Öffnen/Bewerten; laufender v1-Versuch kann nach Server-/Clientupdate mit identischem Hash fortgesetzt und abgegeben werden. |
| Sechs Kapitel | 18 Fragen/48 Punkte; Umbenennen/Ordnen ändert keine IDs oder Antworten. Kopie, lokaler Entwurf und Wiederherstellung erhalten Struktur. |
| Leere/ungültige Struktur | Leeres Kapitel im Entwurf erlaubt; Veröffentlichung erklärt Fehler. Fremde/fehlende chapterId und doppelte IDs in neuen Kapiteltests abweisen. Löschen verliert keine Antworten/Aufgaben still. |
| Gemischte Typen/Audio | Alle bisher unterstützten Typen, offene Nachsicht, Bild/Audio und listening-only bleiben bedienbar; Anweisung eindeutig; keine geheimen Felder im DOM/Paper. |
| Zufall | Nur zulässige Aufgaben innerhalb des Kapitels, Medienblöcke zusammen; Schlüsselzuordnung korrekt. Reload/Resume behält Reihenfolge und Antworten. Start-API übernimmt tatsächlich die erlaubten Optionen. |
| Resume/Offline | Kapitelwechsel, Reload, Verbindungsabbruch und Appneustart verlieren keinen gesicherten Stand. Frist gilt global weiter; lokale Abgabe, serverseitige Quittung und verspätete Reviewnachlieferung unterscheidbar. Doppelte Endabgabe bleibt idempotent. |
| Geräte | Desktop mit Tastatur, iPad Safari/App/Secure und schmales Handy mit geöffneter Bildschirmtastatur: Leiste verdeckt nichts, Fokus korrekt, Audio bedienbar, letzte Aufgabe/Abgabe erreichbar. Keine neue Entsperrung am Kapitelende. |
| Punkte / Gewichtung | Kapitelmaxima summieren sich zum Gesamtmaximum; Teilpunkte und Nachkorrekturen konsistent; leeres Maximum erzeugt keine erfundene Prozentzahl. Beispiel 30/48 und ungleiche Kapitelgewichte prüfen. |
| Lösungsfreigabe | Kein Kapitelstatus, CSV für Schüler oder vorzeitiger Ergebnisaufruf umgeht zentrale Freigabe; private Quellen und Lösungen bleiben geschützt. Unveröffentlichte neue Revision verändert keine laufende Prüfung. |
| Generierung / Qualität | Plan/Ergebnisanzahl/-punkte/-zuordnung stimmen oder klare Abweichungsmeldung. Kapitelübergreifende Lösungshinweise, Richtig/Falsch-/Positionsmuster und mehrdeutige Zuordnungen fachlich prüfen. Kein Qualitätsversprechen allein aus grünen Tests. |

## Quellen und Grenzen der Prüfung

Unveränderlicher Web-Code: [assessment-core.js](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/assessment-functions/lib/assessment-core.js), [aktiver Assessment-Lifecycle](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/assessment-functions/lib/secure-lifecycle.js), [Editor/Auswertung](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/app.js), [Generierungsschemas](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/functions/lib/schemas.js), [Navigation](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/secure-student-navigation.mjs), [Regeln](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/firestore.secure-assessment.rules), [Offlinepolicy](https://github.com/HerrLoeffler/Hausaufgabe/blob/4f8b79222a35997852aad4673f8aaf338904f485/assessment-functions/lib/offline-recovery-policy.js).

Native Zusatzquelle: [Secure-Webview](https://github.com/HerrLoeffler/Hausaufgabe/blob/b43298b73d63707d2270ee4a3f4e49cf980dd606/native/GradeCrewSecure/Sources/SecureExamWebView.swift); Branchinventur und API-/AttemptStore-Dateien wurden zusätzlich gelesen. Keine vollständige native Decoder-/Offlinepaketabnahme, kein Appbuild oder Gerätetest in diesem Konzeptauftrag.

Koordination frisch gelesen: [main-Einstieg](https://github.com/HerrLoeffler/Hausaufgabe/blob/c14a8fdee852f6d5105c1b7e12701a0112272263/START_HERE.md), [Umgebungszuordnung](https://github.com/HerrLoeffler/Hausaufgabe/blob/c14a8fdee852f6d5105c1b7e12701a0112272263/docs/releases/ENVIRONMENTS.md), [Development Status 39372029039](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/39372029039) erfolgreich mit abgeschlossenem Fetch-/Auditjob, frische Remote-Refs und offene PRs zusätzlich inventarisiert. Dessen Gesamtartefakt wurde hier nicht heruntergeladen; keine Behauptung eines vollständigen Konfliktaudits aller Baustellen. Keine explizite Kapiteltest-Zuordnung im aktuellen Register/TODO oder den Branchnamen gefunden; verwandte PR238/240/236 betreffen Lernspiele, keine Kapiteltest-Engine. Suchgrenze: kein lückenloser Inhaltsvergleich jedes historischen Remote-Branches.

Die Schuladresse hausaufgabe-staging ist gemäß aktuellem STATE Production, gc45-rc1 aus 4f8b7922; getrennt gradecrew-staging-2026. Hier wurde nur der belegte Repo-/Refstand geprüft, kein neuer öffentlicher Manifest-/Assetabruf und keine Live-Funktionsprobe vorgenommen. Kein Deployment, keine Release-Stufe angehoben, keine Produkttests ausgeführt. Pädagogische Aussagen sind Entwurfsabwägungen; es wurde keine Wirksamkeit oder offizielle Lehrplankonformität behauptet.

## Optionales Zeitkonzept innerhalb derselben Testerstellung

Von Martin gewünscht: Die Lehrkraft kann optional Gesamtzeit oder Zeiten für einzelne Bereiche einstellen. Diese Möglichkeiten gelten gleich für Übung und benoteten Test. Sie sind keine sechs separaten Tests. Noch keine Implementierung beauftragt.

Vorschlag für die vorhandenen Zeiteinstellungen:

- **Ohne Zeitlimit:** freie Kapitelwahl und Rückkehr.
- **Gesamtzeit:** vorhandener Testtimer; Kapitelwechsel verbraucht keine zusätzliche oder neue Zeit.
- **Bereichszeiten:** je Kapitel optional Minuten, leeres Feld bedeutet kein eigenes Bereichslimit. Als einfacher Startvorschlag beginnt eine Bereichsfrist beim ausdrücklichen ersten Start dieses Bereichs und läuft auch beim Verlassen weiter. Rückkehr bleibt bis zum Fristende möglich. Das Öffnen der Kapitelübersicht startet keinen Timer.

Gesamtzeit und Bereichszeiten zunächst als alternative Einstellungen anbieten. Eine Kombination bleibt mögliches späteres Detail; falls gewünscht gilt die jeweils frühere Frist und die Oberfläche muss beide Grenzen verständlich zeigen. Dies ist ein Vorschlag zur Begrenzung der Bedienkomplexität, keine bereits von Martin entschiedene Beschränkung.

Bei Bereichsfristende schlägt der Entwurf vor, die betreffenden Antworten zu sichern und nur diesen Bereich für Änderungen zu schließen. Der Test läuft weiter; es bleibt eine gemeinsame Endabgabe. Dafür ist eine serverseitig gespeicherte Antwortmomentaufnahme beim Bereichsschluss nötig: bloßes Sperren im Browser reicht nicht. Verspätete/offline übermittelte Antworten benötigen wie bisher einen nachvollziehbaren Reviewpfad. Kapitelzeit niemals beim Reload, Wechsel oder Wiederverbinden zurücksetzen. Andere Kapitel und die Secure-Sitzung werden durch Bereichsende nicht beendet oder entsperrt.

Noch offen vor Timerimplementierung: Soll die Bereichszeit ab erstem Start durchlaufen (Vorschlag) oder nur aktive Bearbeitungszeit zählen? Was geschieht bei Bereichsfristende und Offlinezustand genau? Aktive Bearbeitungszeit hätte deutlich mehr Pause-/Wechsel-/Manipulationsfragen. Diese Detailfragen blockieren den grundlegenden Kapitelentwurf nicht.

Technisch ergänzen: optionales Zeitprofil in Quiz/Draft, eingefrorene Zeitregeln im Versuch, serverseitig bestätigte Bereichsstarts/-fristen und gegebenenfalls gesicherte Bereichsantworten. Bestehende Callables/Lebenszyklus gezielt erweitern, keine zweite Engine. Timer-Akzeptanzfälle: ohne Limit, Gesamtlimit, gemischte begrenzte/unbegrenzte Bereiche, Start erst nach Bestätigung, Wechsel/Reload/Offline ohne Reset, Fristende mit offener Eingabe, idempotentes Bereichsschließen und gemeinsame Endabgabe. Aufwand für Kapitelgrundstruktur und Bereichstimer separat schätzen: Timer benötigen zusätzliche Serverzustände und erhöhen den Umfang.

## Nächster Planungsschritt

Den bestehenden Erstellungsablauf Schritt für Schritt um optionale Kapitel und die Zeiteinstellungen ergänzen. Zuerst Kapitelvertrag, Zuordnung, Veröffentlichung, Navigation und Kapitelpunkte konkretisieren; anschließend Bereichszeitregeln ausarbeiten. Kein eigenständiger Übungs-/Testmodus, keine erneute Bundeslandfrage und kein Nachbau der Oberfläche.
