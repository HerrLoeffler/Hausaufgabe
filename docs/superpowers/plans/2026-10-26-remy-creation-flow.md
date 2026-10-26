# Remy-Erstellung: Material, Bilder und Audio im klaren Ablauf

> Ausführung: bestehender Web-/Cloudowner setzt inline fort; unabhängiger Gesamt-/Deltareview, exakte CI und getrennte Komponentenreceipts vor Live. Der Humanauftrag umfasst Plan UND Umsetzung; keine weitere Planfreigabeschleife.

## Nutzerskizze und feste Entscheidungen

Desktop und iPad quer: eine normale vertikale Abschnittsfolge mit breitem Formular; verwandte Kernfelder zweispaltig innerhalb eines Abschnitts. Phone/iPad hoch: dieselbe Lesereihenfolge einspaltig. Keine Pflicht-Wizardklicks, keine verschachtelte Scrollfläche. Am Ende steht genau einmal die Erstellenaktion.

1. **Test festlegen**: Fach/Klasse/Schulart/Bundesland, Thema; direkt darunter das bestehende testbezogene Wünschefeld `aiCustomNotes` und vorhandenes Mikrofon `gcRemyNotesMic`. Keine zweite Wünscheeingabe. Aufgabenanzahl/Schwierigkeit/Punkte und erlaubte Typen; profilbezogene Vorlieben bleiben als ausdrücklich zukünftige Vorlieben optional.
2. **Material**: eigenständige Quellmaterialfläche, Dateiauswahl/Dropzone, bestehende10Dateien/15MB/MIME-Prüfung, Rechtehaken, Fortschritt/Liste/Entfernen. Bei erstem Upload in einem NEUEN Formular ist **Inhalt auf das Material beschränken** (`materialMode=only`) vorausgewählt. Zweite Option **Material als Anregung verwenden** (`inspiration`). Ohne Material wird kein strict-Materialauftrag versandt. Explizite Auswahl bleibt beim Nachladen/Entfernen erhalten; keine Umdeutung gespeicherter Tests/Entwürfe. Quellfotos sind Material, keine bestellten Aufgabenbilder.
3. **Bilder**: separater optionaler Abschnitt; bestehende Anzahl0–5 generierter Aufgabenbilder, keine Antwortbilder und kein zusätzliches Stilfeld ohne bestehenden Datenvertrag. Bildmotiv bleibt Aufgabe-kontextgebunden. Editor-Direktaktion aus Vorauftrag bleibt erhalten.
4. **Audio**: drei sichtbare kleine HTML-Beispiele statt versteckter Info-Tooltips. A **Hörtext zur Aufgabe**: sichtbare Frage + Aufnahme. B **Antwortmöglichkeiten als Audio**: sichtbare Frage + einzeln hörbare Optionen, deren Texte nicht gezeigt werden. C **Aufgabe und Antworten als Audio**: gesprochener Aufgabeninhalt + einzeln hörbare Optionen; ein klarer neutraler Arbeitsauftrag bleibt sichtbar. Je Kategorie Anzahl0–5; globale bestehende Grenzen je Aufgaben-/Antwortaudio weiterhin höchstens5. Null bedeutet optional/aus. Die dritte Anzahl ist ein gemeinsam gebundener Teil beider Audioquoten, nicht zusätzliche verdeckte TTS-Quote. Der Editor zeigt Quelle/Sprechertext und tatsächliche Sichtbarkeit konsistent.
5. **Test erstellen**: schlanker dynamischer Überblick über Anzahl, Materialnutzung, Bilder und Audiowahl; danach vorhandener Startknopf/Progress/Jobstatus. Unvollständige Uploads blockieren Start mit konkreter Rückmeldung.

## Wortlaut und Sicherheitsgrenze

„Antworten/Lösungen als Hörtext“ wird hier als **auswählbare Antwortoptionen** umgesetzt. Musterlösung/Erklärung ist der vorhandene getrennte Legacy-Lösungsaudiopfad nach Abgabe und serverseitiger Freigabe. Keine Lösung vorzeitig, keine neue Lösungsaudiokonfiguration aus dieser Mehrdeutigkeit. Schüler sehen nie privaten Sprechertext oder Lösungsschlüssel. Nicht unterstützte Nur-Hören-/Antwortaudioveröffentlichung auf Test2026 bleibt gesperrt; Beispiele/Fixtures sind kein Freigabenachweis.

## Wiederverwendung und tatsächliche Datenverträge

- `index.html`, scoped `styles.css`, `app.js`: bestehende IDs/Mikrofon/Remy-Parser behalten, Abschnitte umordnen, Schlussüberblick, DnD aus bereits gesichertem fe8b616, öffentliche Homepage/Auth/Join unverändert.
- `remy-ai-help.js`: vorhandenes Wünsche-Mikrofon wiederverwenden; nur Anker prüfen, keine neue Sprach-KI oder Pipeline.
- `ai-client.js`: unveränderter Upload-Transport, MIME/15MB/Storagepfad; keine neue SDK/Providerabhängigkeit.
- Neues schmales `functions/lib/creation-contract.js`: deterministische gemeinsame Audio-Slots aus existing task-/answer quotas plus `fullAudioQuestionCount`; Prüfung tatsächlicher Full-Slots mit bestehenden question/audioIntent-Feldern. Nicht nachträglich Fragen sortieren. Batchquoten aus denselben globalen Slots; Worker wählt Antwortaudios für genau diese Full-Slots.
- `functions/index.js`, `test-batches.js`, `prompts.js`, `validation.js`, `audio-answers.js`: Feld validieren/persistieren/planen/generieren/prüfen/medialisieren. Schema für die Fragen bleibt bestehend; keine neuen Aufgabentypen. Nur normale Neugenerierung, Varianten/Bestand erhalten alte Verträge.
- Material-only bekommt einen opt-in strukturierten Suffizienz-/Quellbezug im vorhandenen Erzeugungsaufruf; keine zusätzliche bezahlte Analyse. Unlesbares/zu knappes/unpassend schwieriges Material muss eine konkrete Klärung liefern und den Job vor Medienerzeugung stoppen. Bestehende unabhängige fachliche Review erhält dieselben Quellmaterialien/Quellhinweise. Quellenkennzeichnung ist Modellbeleg, keine mathematische Garantie gegen erfundene Fachinhalte; diese Grenze offen dokumentieren. Pool-/persönliche Beispiele dürfen strict-Materialinhalte nicht als Zusatzwissen überschreiben. Anzahl/Niveau werden nicht still reduziert oder mit Fremdwissen aufgefüllt.
- Fehlende Quellbelege/ungeeignete Audio-Slots gehen durch vorhandene bounded validation/repair oder beenden transparent. Keine zusätzlichen Retryloops; aktuelle Quoten/Medienmaxima bleiben.
- Normale wiederholte Provider/Kostenhinweise liegen in vorhandenen aufklappbaren Datenschutz-/Rechtedetails und Footerrechtsseiten; Materialrechtehaken bleibt unvorbelegt und wird nicht als neue Datenschutz-Einwilligung ausgegeben. Echte Fehler/Limits/KI-Kennzeichnung und bestehende Ja/Nein-Aktionsfreigaben bleiben. Keine Änderung Providerwahl/Datenzweck/Rules/Retention/Vertragsbedingungen.

## Ausführung und Abnahme

- [x] Vorhandene Bild-/Audioarbeit5a9/56d und DnD/Textfe8 sichern; ursprüngliche RemyDifficulty2368bbb und Emmi f5ef650 separat erhalten.
- [ ] Regressionsfälle zuerst rot: Abschnitts-/Fokusreihenfolge; Wünsche+Mic einmal; material-only Default nur mit Material; Nutzerwahl bleibt; source insufficiency stoppt; Audiofullsame-slot über >20/100Fragen;0audio unverändert; Schlüssel/Medien/Anzahl/Punkte erhalten.
- [ ] Kleine DOM-/Vertragsänderungen, bestehende Suiten grün; neue ÜbersetzungenDE/EN.
- [ ] Synthetische echte UI für Erstellung und Editor/Schülerprojektion: Desktop/iPad/Phone hoch/quer/kurze Höhe/Schriftzoom, FileDrop/Input/Child/Abbruch, Keyboard/Fokus, Layout ohne Überlappung. Automatisiert Chromium/WebKit plus CUA. Keine physischen Geräte-/bezahlten Providerbelege erfinden.
- [ ] Unabhängigen Delta-/Gesamtreview auf unveränderlichen Commit, alle relevanten Findings beheben; exakte CI inklusive neuen Tests. Remotecheckpoint2baa bleibt historisch, nicht final.
- [ ] Frischer Development-/Live-/Parallelabgleich, enge Vorschau. Autorisiertes Liveziel gradecrew.de / hausaufgabe-staging, Hosting und tatsächlich betroffene AI-Endpunkte einzeln. Geplante Functions generateQuestionMedia sowie generateTest/startAiTestJob/processAiTestJob; weitere Betroffenheit des CleanInput/QuickRemy-Pfads prüfen, keine pauschale ganze AI-Codebase. Kein Rules/Assessment/402/Analytics/visueller2026-Renderer/Emmi-WIP-Deploy.
- [ ] SourceSHA, exakte Komponenten-/Hostingreceipts, öffentliche Hashes und UI bestätigen; HDF/TODO/STATE gegen frisches main gezielt aktualisieren. Offene physische/providerpädagogische Abnahme und frühere Remy/Emmi Restpunkte getrennt nennen.

Ownerentscheidungen: normales vertikales Formular statt Wizard; drei optionale Audiokategorien mit tatsächlicher Slotbindung; existing schema statt zweiter Generator. Grundlage ist konkreter Humanauftrag26Oct, kein nachträglich behauptetes Review-/Deploy-/Rechtszertifikat. Angefordert Sol/medium, tatsächliche Runtime unbekannt, keine Modellwechsel/Providerstarts für Umsetzungstests.
