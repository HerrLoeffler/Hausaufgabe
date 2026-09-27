# ai29: Änderungen und Prüfstand

Branch: `fix/ai-review-workflow`, Basis `8dbfaaaaf022499610fd0a854fcb2836ebef9528` (ai28).

- Schüleransicht und Lösungen in der Qualitätsprüfung getrennt; sichtbare Belege für Lösungshinweise erforderlich; absichtlich falsche Richtig/Falsch-Aussagen korrekt erklärt.
- Warnungen an Aufgaben-ID und Inhaltsstand gebunden; vollständige Details, Sprungübersicht, gezielte KI-Bearbeitung, Einzelbestätigung und Fehlalarm-Meldung.
- Varianten warten außerhalb des Editorinhalts auf „Übernehmen“. Texteingaben werden bei der Rückkehr einer KI-Anfrage nicht überschrieben. Vorgänge laufen im geöffneten Tab, nicht unabhängig vom Browser.
- Späte Aufgaben-/Bildantworten bei geänderter Aufgabe, anderem Test, anderem Konto oder laufendem veröffentlichtem Test werden nicht angewendet.
- Aufgabenfeedback enthält vollständige typabhängige Lösungen. Prüfer-Fehlalarme werden im Qualitätsgedächtnis und im Adminbereich separat gezählt.
- Aufgabenübersicht, weniger dauerhafte Schaltflächen, KI-Bildfeld mit kurzem Prompt und Kostenhinweis.
- Neutrale KI-Dateinamen, Entfernung von Bildmetadaten mit vorheriger Ausrichtung, Schülerkürzel als Vorgabe, weniger kopierte Profildaten in Aufgabenfeedback.

## Verifikation

Lokal am 27.09.2026: 85 Functions-Tests und 18 Frontend-Tests erfolgreich. ESLint und Syntaxprüfung erfolgreich. Zusätzlich DOM-Prüfung der echten Renderfunktionen: Aufgaben, Warnungsdetails, Übersicht, Bildfeld, Aktionsmenü und Aufgabenzuordnung. Die Tests für KI-Erstellung nutzen simulierte Providerantworten, auch bei 50 Aufgaben mit Bildern. Bildmetadatenbereinigung wurde mit einem echten lokalen Bildpuffer geprüft.

Kein bezahlter OpenAI-Testlauf, kein Firebase-Schreibtest, kein automatisierter Login. Eine visuelle Chromium-Prüfung konnte nicht durchgeführt werden, weil der Browserdownload unvollständige Archive lieferte. Layout und echte Laufzeiten müssen deshalb noch auf Staging geprüft werden. Keine Zusage vollständiger KI-Richtigkeit oder DSGVO-Konformität.

## Staging

`bash deploy-staging-ai29.sh` benötigt den genannten Branch, sauberen Git-Stand, Node 22 sowie die bereits eingerichtete Cloud-Shell-Anmeldung für gcloud/Firebase.

Vor jeder Änderung sichert und vergleicht das Skript den tatsächlich laufenden Quellcode der sechs betroffenen Funktionen. Unbekannte Abweichungen führen zum Abbruch; die ZIP mit dem fehlenden Serverstand bleibt erhalten. Dadurch werden insbesondere unbekannte Queue- oder Diagnoseänderungen nicht mit älterem Git-Code überschrieben. Der Vergleich akzeptiert auch bereits erfolgreich aktualisierte Dateien für eine Wiederholung nach einem Teilfehler.

Aktualisiert werden ausschließlich das Staging-Hosting sowie `getAiStatus`, `generateTest`, `processAiTestJob`, `regenerateQuestion`, `generateQuestionMedia` und `analyzeMaterial`. Keine Änderung an Production, Firestore-Regeln oder Storage-Regeln. Ein Firebase-Deployment mehrerer Funktionen ist nicht atomar; bei einem Fehler muss der Ablauf nach Klärung wiederholt werden.

Der vollständige Datenschutz- und Produktvergleich steht in [PRODUCT_PRIVACY_REVIEW.md](PRODUCT_PRIVACY_REVIEW.md). Die dort benannten P0-Migrationen für Zugänge, privaten Lösungsschlüssel und serverseitige Bewertung sind noch offen.
