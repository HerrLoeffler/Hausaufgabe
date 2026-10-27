# GC-AUDIO-01 · Emmi-Hinweis für einzelne Antwort-Audios

Stand 27.10.2026. Martins Screenshot von gradecrew.de zeigt im Editor pro Antwortspur „Audio fehlt – erzeugen“ und „Audio gefällt mir nicht – neu erzeugen“. Er möchte zusätzlich schreiben können, **was am Audio nicht passt**, damit Emmi dies bei der Neuerzeugung berücksichtigt. Fortsetzung von GC-AUDIO-01 auf dem Web-Quellstand `f1ebf07a9a8bd2731cc5edcd70ceec1fbde8e9cf` in `feature/audio-emmi-feedback-20261027`. Andere öffentliche Kartenänderungen aus PR340 sind bereits live.

## Änderung

- Jede Emmi-Einzelspur zeigt zur Regeneration ein optionales, beschriftetes Feld mit maximal 400 Zeichen. Eingaben überstehen ein erneutes Rendern des Editors; während eines aktiven veröffentlichten Tests sind Feld und Aktionen gesperrt.
- Nur die gewählte Antwortspur erhält den Lehrkrafthinweis. Der bestehende Antworttext und andere Audio-Dateien bleiben unverändert. Der Hinweis wird nicht in Testdaten oder Nutzungsstatistik gespeichert.
- Die Callable `generateQuestionAudio` validiert die Länge und gibt den Hinweis an die vorhandene TTS-Anweisung weiter. Tempo, Betonung, Aussprache und Sprechweise dürfen angepasst werden; der bereitgestellte Hörtext soll exakt gesprochen werden. Textänderungen erfolgen weiterhin im Antworteditor.
- Neue sichtbare Texte sind auf Englisch übersetzt. Keine Änderung an Schüleransicht, Audiofreigabe, Quoten oder automatischer Testgenerierung.

## Nachweise und nächste Schritte

Vor Implementierung liefen der neue UI- und Backend-Test rot. Danach: 57/57 gezielte Web-/Editor-Audiotests, 319/319 Functions-Unit-Tests, JS-Syntax und 206-Dateien-Produktionsaufbau grün. Noch kein echter kostenpflichtiger Spracherzeugungsaufruf, kein Staging-/Production-Deploy und keine physische iPhone-/iPad-Abnahme. Nächster Schritt: Quellstand sichern, PR und exakte CI prüfen; anschließend zuerst den begrenzten Backend-/Hosting-Releasepfad verifizieren und die Änderungen auf gradecrew.de nach der geltenden Produktionsfreigabe veröffentlichen. Bei der Backend-Veröffentlichung nur `functions:ai:generateQuestionAudio` aktualisieren; andere Funktionen und Rules bleiben unberührt.
