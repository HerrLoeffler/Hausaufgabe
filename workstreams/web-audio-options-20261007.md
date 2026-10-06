# GC-WEB-AUDIO-03 · Web-Audioantworten und Hörmodus

Stand: 2026-10-07. Verantwortlicher Chat: Audio-Subtask unter Main GC; Chat-Link unbekannt. Aufgabenbranch `feature/web-audio-options-20261007`, Basis `4d6ee69a7bf0ff51e037dc69f651ca6237f5106c`. Integrationsziel: `feature/gradecrew-app-integration`. Production unverändert.

## Auftrag

Martins bereits freigegebener Wunsch: Schüler sollen echte Höraufgaben ohne eingeblendeten Fragetext lösen können. Bei Auswahlaufgaben sollen einzelne Antwortmöglichkeiten anhörbar und auswählbar sein. Die bisherige, erst nach Lösungsfreigabe sichtbare Audio-Lösung darf dabei nicht als Antwortaudio umgedeutet oder vorzeitig ausgeliefert werden. Sichtbarer Fragetext und zusätzliche Hörquelle bleiben als eigener Modus möglich. Vorhandene Lehrertexte und alte Daten bleiben erhalten.

## Umsetzung und Sicherheitsvertrag

- `audioPresentation = supplement | listening-only`; alte Aufgaben ohne Feld bleiben bei sichtbarem Text. Bei `listening-only` entfernt der Assessment-Server den Fragetext aus dem Schülerpapier, wenn Audio vorhanden ist.
- `audioAnswerMode = audio-only` nur bei Einzel-/Mehrfachauswahl. Jede Option bekommt ein eigenes TTS-Asset, das Schülerpapier zeigt neutrale Antwortenummern und die Audios, aber keinen Antworttext oder Lösungsschlüssel.
- Die bestehenden `solutionAudio*`-Daten und der Release-Boundary bleiben unangetastet. Neue UI zeigt das alte Lösungsaudio-Panel nur für gespeicherte Altinhalte.
- Editor-/Serverstatus blockiert Veröffentlichung bei fehlenden oder veralteten Frage-/Antwortaudios. Fehlgeschlagene TTS-Serie bleibt als unvollständiger Entwurf sichtbar. Bei fehlerhaften Audio-only-Daten liefert der sichere Assessment-Server kein Schülerpapier aus.
- Bis der tatsächlich deployte Secure-Rules-Cutover belegt ist, bleibt der Release-Schalter in `app.js` und `assessment-functions/lib/audio-release-gate.js` geschlossen. Editor-Publish, Dashboard-Publish und Wiederöffnen sind für neue private Audiomodi gesperrt. Der Assessment-Server prüft beim Start und bei jedem Paper-Refresh zusätzlich die **gespeicherten Fragen**; ein falsches oder fehlendes Quiz-Metadatum umgeht diese Sperre nicht. Normales Text-plus-Audio und alte Lösungsaudios bleiben davon unberührt. Der Client-Gate ist nur Bedienungsschutz; die Firestore-Rules sind die eigentliche Grenze gegen direkte Dokumentreads.
- Gemeinsame Audio-Data-URLs für Frage und Antworten sind pro Aufgabe auf 700.000 Zeichen begrenzt, um Firestore-Dokumentgröße einzuhalten. Audioantworten erlauben zwei bis vier reine Textoptionen; Bildantworten und textabhängige Lücken-/Markieraufgaben nutzen keinen Nur-Hören-Modus.
- `audioAnswerQuestionCount` zählt KI-Aufgaben mit vorgelesenen Antworten getrennt von `audioQuestionCount` und `solutionAudioQuestionCount`. Remy-Parser/HTML-Feld wird in parallelem Workstream zusammengeführt.

## Nachweise und offener Stand

- Lokaler Zwischencommit `3f7e3ed6fd9840e2ab95afd1b06ffeecdd5be6c6`; diese Übergabe liegt im abschließenden zweiten Aufgabencommit. Kein PR, keine Integration, kein Deploy.
- Syntaxcheck aller bearbeiteten JS-Dateien grün mit gebündeltem Node 24.
- 84 gezielte Functions-/Assessment-Tests grün; 28 Root-/Browser-/i18n-/Legacy-Audio-Tests grün. Bestehender Fingerprint für laufende Altversuche bleibt gleich. Provider/TTS in Tests nur als Stub.
- `functions/test/schemas.test.js` benötigt lokales `ajv`, das in diesem Checkout noch nicht verfügbar ist; keine Installation/Providercalls vorgenommen.
- Noch offen: Einbindung des statischen `index.html`-Felds durch Main. Dort `#aiAudioAnswerQuestionCount` (Zahl 0–5) und `#aiAudioAnswerCountHint` ergänzen; altes `#aiSolutionAudioQuestionCount` darf als versteckter Legacywert 0 erhalten bleiben. `crew-telemetry-client.mjs` liegt bei Main und braucht die beiden neuen Zählfelder. `firestore.secure-assessment.rules` schützt Autorendokumente, während das ältere `firestore.rules` veröffentlichte Fragen direkt lesbar macht; Main hat keinen Nachweis des tatsächlichen Rules-Cutovers und keinen Zugriff auf die aktuelle deployte Ruleset-Version. Der echte Schülerlink wird vor Laden von `app.js` nach `secure-student.html` umgeleitet, Lehrer-Vorschau bleibt im Editor. Danach Main-Integration, CI, Staging und echte Geräteabnahme separat.

Freigabeschritt für diesen Modus: tatsächliche deployte Ruleset-Version read-only belegen, direkten Schüler-Read von `quizzes/{code}/questions/{id}` mit Lösungsschlüssel nachweislich verweigern, sicheren Assessment-Start mit Audiooptionen/Hidden-Transcript auf Staging prüfen; erst dann beide Release-Schalter in einem geprüften Deploy öffnen. Ein bloßer UI-Test oder Repository-Rules-Datei beweist die Live-Grenze nicht. Höhere kombinierte Audioanforderungen können das bestehende 20-TTS-pro-Minute-Limit treffen; der Entwurf bleibt dann als unvollständig gesperrt und kann im Editor nacherzeugt werden.

Nächster Schritt: finalen Aufgabencommit sichern und Main mit Commit/Rules-Gate übergeben.
