# GC-AUDIO-01 · Emmi-Hinweis für einzelne Antwort-Audios

Stand 27.10.2026. Martins Screenshot von gradecrew.de zeigt im Editor pro Antwortspur „Audio fehlt – erzeugen“ und „Audio gefällt mir nicht – neu erzeugen“. Er möchte zusätzlich schreiben können, **was am Audio nicht passt**, damit Emmi dies bei der Neuerzeugung berücksichtigt. Fortsetzung von GC-AUDIO-01 auf dem Web-Quellstand `f1ebf07a9a8bd2731cc5edcd70ceec1fbde8e9cf` in `feature/audio-emmi-feedback-20261027`. Andere öffentliche Kartenänderungen aus PR340 sind bereits live.

## Änderung

- Jede Emmi-Einzelspur zeigt zur Regeneration ein optionales, beschriftetes Feld mit maximal 400 Zeichen. Eingaben überstehen ein erneutes Rendern des Editors; während eines aktiven veröffentlichten Tests sind Feld und Aktionen gesperrt.
- Nur die gewählte Antwortspur erhält den Lehrkrafthinweis. Der bestehende Antworttext und andere Audio-Dateien bleiben unverändert. Der Hinweis wird nicht in Testdaten oder Nutzungsstatistik gespeichert.
- Die Callable `generateQuestionAudio` validiert die Länge und gibt den Hinweis an die vorhandene TTS-Anweisung weiter. Tempo, Betonung, Aussprache und Sprechweise dürfen angepasst werden; der bereitgestellte Hörtext soll exakt gesprochen werden. Textänderungen erfolgen weiterhin im Antworteditor.
- Neue sichtbare Texte sind auf Englisch übersetzt. Keine Änderung an Schüleransicht, Audiofreigabe, Quoten oder automatischer Testgenerierung.

## Nachweise und nächste Schritte

Vor Implementierung liefen der neue UI- und Backend-Test rot. Danach: 57/57 gezielte Web-/Editor-Audiotests, 319/319 Functions-Unit-Tests, JS-Syntax und 206-Dateien-Produktionsaufbau grün. Noch kein echter kostenpflichtiger Spracherzeugungsaufruf, kein Staging-/Production-Deploy und keine physische iPhone-/iPad-Abnahme. Nächster Schritt: Quellstand sichern, PR und exakte CI prüfen; anschließend zuerst den begrenzten Backend-/Hosting-Releasepfad verifizieren und die Änderungen auf gradecrew.de nach der geltenden Produktionsfreigabe veröffentlichen. Bei der Backend-Veröffentlichung nur `functions:ai:generateQuestionAudio` aktualisieren; andere Funktionen und Rules bleiben unberührt.

## Abschluss auf gradecrew.de · 27.10.2026

Die vorstehende Passage dokumentiert den Zustand vor Integration. [PR342](https://github.com/HerrLoeffler/Hausaufgabe/pull/342) wurde mit exakt grünem Quellstand `c9dc8bd9880de47f7465cbc3f5c2f6731a7d056a` in den Schul-Webbranch integriert: Merge `1269509e850d2a0f546c0bd0be366546d0c513d3`, identischer Tree `d93d6af7cb8716266b54927edbf0cba46b44840c`. [AI Staging Checks 40551229144](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/40551229144) grün mit Node-22-Tests und Chromium-/WebKit-Browserjob; Paketprüfung 40551236844 grün. Der Browserjob war zuerst rot, weil sein asynchrones `waitForFunction` vor dem dauerhaften Speichern eines unabhängigen Feedbackbild-Entwurfs weiterlief (diagnostisch 0 Bildbytes unmittelbar vor Reload). Die endgültige Prüfung wartet synchron auf den nachweislich gespeicherten IndexedDB-Eintrag; danach CI grün. Kein Produkt-Feedbackbildcode geändert.

Auf `hausaufgabe-staging` wurde gezielt **nur** `functions:ai:generateQuestionAudio` aktualisiert; Firebase meldete erfolgreichen Updatevorgang, die Funktion ist ACTIVE in `europe-west1` mit Hash `1e18f6ab27cb89f82f79d8753b036d0ada07cd9c`. Danach Hosting-only mit `tools/deploy-release.mjs` veröffentlicht. `tools/verify-staging.mjs` und der erneute öffentliche Abruf von `gradecrew.de/release.json` bestätigten **206/206** öffentliche Dateihashes und Commit `1269509e`. Keine Rules, anderen Functions oder nativen iOS-Binärdateien geändert. Die vorhandene TestFlight-Lehrer-App lädt die Weboberfläche; für dieses Web-/Callable-Update ist kein neuer Build erzeugt worden.

Grenze: Es gab keinen echten kostenpflichtigen TTS-Aufruf mit Lehrerkonto, somit ist die hörbare Umsetzung von Tempo/Betonung/Aussprache noch nicht praktisch bestätigt. Martins nächster sinnvoller Test: Ein vorhandenes Antwort-Audio mit einem kurzen Hinweis neu erzeugen, anhören und Ergebnis beurteilen; physische iPhone-/iPad-Abnahme bleibt offen. Bestehende Antworttexte und andere Clips wurden nur in synthetischen Tests geprüft. Keine neuen bezahlten Providerstarts oder Budgetänderungen durch diesen Release.
