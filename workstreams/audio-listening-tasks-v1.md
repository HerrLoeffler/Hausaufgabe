# Audio / Höraufgaben V1

Stand: 04.10.2026. Basis `feature/gradecrew-app-integration@eb80c5e6a8b6c1ae13deba676709607bfccee208`. Production unverändert.

## Auftrag

GradeCrew soll KI-Höraufgaben erzeugen können. Lehrkräfte wählen ähnlich wie bei Bildern eine exakte Anzahl von 0–5 Höraufgaben; Remy versteht diese Angabe auch aus natürlicher Sprache. Audio muss im Editor prüfbar, im Schülerbereich sicher abspielbar und in Kosten-/Qualitätsmetriken sichtbar sein.

## V1-Produktumfang

- KI-Erstellung: Feld `Höraufgaben mit Audio (0–5)`.
- Exakte Verteilung über große/batchweise generierte Tests.
- V1-Hörtext: eine KI-Stimme, kurze Ansage/Nachricht/Sachtext/Erzählung, maximal 500 Zeichen.
- OpenAI-TTS-Modell: `gpt-4o-mini-tts`, Stimme `marin`, MP3.
- Lehrereditor: privater Hörtext, Audio anhören, erzeugen/neu erzeugen/entfernen.
- Schüler: expliziter Player, kein Autoplay, Kennzeichnung `KI-generierte Stimme`.
- Remy versteht u. a. `davon 3 Höraufgaben` und trägt den Wert ins vorhandene KI-Formular ein.
- Audio und Bilder sind unabhängige Medienkanäle; eine Aufgabe kann perspektivisch beides tragen.
- KI-Bearbeitung/Varianten behalten den Audio-Modus und erzeugen bei Inhaltsänderungen neuen Hörtext/Audio.
- Manuelle Inhaltsänderungen markieren vorhandenes Audio als veraltet; Veröffentlichung ist fail-closed, bis Audio aktualisiert oder entfernt wurde.
- Emmi-Gesamtüberarbeitung sperrt Höraufgaben in V1, damit Hörtext/Frage/Lösung nicht auseinanderlaufen.
- Duplizieren übernimmt private Hörtexte für denselben Eigentümer; endgültiges Löschen räumt sie mit auf.
- Geteilte Vorlagen geben den privaten Transcript nicht an Kollegen weiter; importierte Audioaufgaben müssen vor erneuter Veröffentlichung neu bestätigt/erzeugt werden.

## Datenschutz / Sicherheit

- Der Hörtext wird **nicht** im öffentlich lesbaren Aufgabendokument gespeichert.
- Private Ablage: `quizzes/{quizId}/audioScripts/{questionId}`, nur Eigentümer/Admin.
- Secure Assessment liefert ausschließlich die Audiodatei + technische Kennzeichnung aus.
- `audioScript`, `transcript`, `audioTranscript` sind im serverseitigen Solution-Leak-Guard ausdrücklich verboten.
- Keine Audiodaten/Transcripts in Crew-Telemetrie.
- TTS-Usage speichert nur technische Metadaten wie Modell, Zeichenanzahl und Bytegröße.
- Audio-Erzeugung besitzt eigene Quota.
- Aktiver veröffentlichter Test kann client- und serverseitig nicht am Audio verändert werden.

## Kosten / Telemetrie

- TTS-Aufrufe laufen als `kind=audio` durch die bestehende AI-Usage-/Rollup-Schicht.
- Remys `audioQuestionCount` ist Teil der datensparsamen Feld-Korrekturstatistik.
- Rohes Diktat, Hörtext oder Schülerantworten werden nicht für die Analytics gespeichert.
- Tatsächliche anonyme Schüler-Playback-Zählung ist in V1 noch nicht enthalten; dafür wäre ein eigener serverseitiger, nicht personenbezogener Assessment-Metrikpfad sinnvoll.

## Bewusste V1-Grenzen

- Lösungsaudio/Erklärungsaudio ist **noch nicht freigeschaltet**. Dafür muss die bestehende kontrollierte Lösungsfreigabe erweitert werden, damit vor Testende kein Lösungsasset ausgeliefert werden kann.
- Mehrsprecher-Dialoge und individuelle Stimmen/Geschwindigkeit folgen nach stabiler Einsprecher-V1.
- Audio wird im MVP kompakt als Data-URL im Aufgabendokument gespeichert (hart begrenzt); bei größerem Umfang ist Storage/CDN-Migration vorgesehen.

## Betroffene Hauptbereiche

- `functions/lib/schemas.js`, `validation.js`, `prompts.js`, `test-batches.js`, `ai-job.js`, `audio-flow.js`, `usage.js`
- `functions/index.js`, `ai-client.js`
- `index.html`, `app.js`, `styles.css`
- Remy/Crew-Telemetrie
- `assessment-functions/lib/assessment-core.js`, `secure-student.js/css`
- `firestore.rules`, `firestore.secure-assessment.rules`
- Audio-/Security-/Regressionstests

## Status

- Branch: `feature/audio-listening-tasks-v1`
- GitHub: gesichert
- erster CI-Lauf: rot durch alte Schema-Fixtures + eine eigene Duplikat-Fixture; gezielt korrigiert
- zweiter CI-Lauf: Functions/Security/Rules grün, Browserblock 29/30; VM-Test-Harness kannte neuen Audio-Helfer nicht; Test-Harness korrigiert
- aktueller Feature-CI: läuft
- integriert: nein
- Staging: nein
- Nutzertest: nein
- Production: unverändert

## Nächster Schritt

Aktuellen Feature-CI vollständig grün bekommen. Danach aktuellen Integrationsbranch erneut prüfen, PR öffnen, nur bei sauberem Diff integrieren und Hosting + AI-Functions + Assessment/Rules als getrennte Staging-Gates behandeln. Production bleibt ohne ausdrückliche Freigabe unberührt.
