# Finale gezielte Browserprüfung

Task GC-LEARNING-WISSENSREISE-01. Remote PR238 Head 7b35f9ff23c5b824ca0e85402a5270751c0b06c5, lokaler Kandidat 1510004509516c64a9b1e14da5f7680fe02f0a60, lokaler Tree 325482b916b5443b7bc001f03ef4a8d2f7070923. Datum 14.10.2026. Eigene QA-Evidenz ausschließlich in diesem Ordner; angefordert Sol/medium, actual/Usage unknown.

## Bindung an die Quelle

Finaler Snapshot /private/tmp/gc-wissensreise-qa-final, Loopback8787. GitHub-Connector bestätigte den Remotecommit; unabhängiger Abgleich der Gitblob-SHAs remote vs Snapshot:

- learning/bootstrap.mjs: 28facdd2d71ac3c1fe359856ba694de92292fcb0
- learning/ui.mjs: dc8fdd26bfb71283dc30e57190001e5eb1b0e53b
- learning/play.mjs: 23d3307d7a1aaed61ead6c4ac6a720cb6f78b4c0

Alle drei Werte stimmen exakt überein. Git-Shelllookup des Remotecommits scheiterte DNS; Connectorzugriff war erfolgreich. Der vollständige Remote-Treeabgleich ist beim Root/Implementer, hier kein zusätzlicher vollständiger Repositorybeweis.

## Tatsächlich ausgeführt

1. Enger Markierungs-Preview-Fixretest über /production-bootstrap/: vollständige Passagen „Der Hund läuft schnell.“ und „Die Katze spielt im Garten.“ sowie vier Kategorien/Farbnamen Artikel(lila), Nomen(blau), Verb(orange), Adjektiv(grün) werden vor Freigabe angezeigt. Der gemeldete Kontext-Preview-Befund ist für diesen Kandidaten geschlossen.
2. Zwei MARK2-Aufgaben, Geführt lernen, 120s, Nachfüllung ausdrücklich deaktiviert; Rechte-/Inhaltscheckboxen gesetzt und Freigabelink erzeugt. Freigabelink verwendet /learning.html?learn=… und damit den tatsächlichen committeten Produktbootstrap.
3. Start bei2:00, Hilfe1 auf erster Markierungsaufgabe, danach Pause und schließen. Jetzt erscheint „Deine Lernpause“ mit Fortsetzen und Zurück zu GradeCrew. Keine sofortige unerwartete Rückkehr ins Spiel; URL bleibt an dieselbe Freigabe gebunden.
4. Fortsetzen öffnet dieselbe Aufgabe/Erklärung-anschauen-Phase, erhält Hilfe1 und reduziert die Zeit von zuvor1:54 auf0:57. Während dieser finalen Probe wurde der QA-Uhrbutton nicht benutzt. Das belegt den Pause-/Resumeweg des Produktbootstrap mit lokalem synthetischem Transport.
5. Konsole error/warn=[] am Ende. Sitzung abschließend über die echte Pausekarte pausiert.

Die zusätzliche QA-Datei tools/learning-fixture/bootstrap-qa.cjs wurde gelesen. Sie ersetzt ausschließlich FirebaseSDKimportURLs durch lokale Auth-/Query-/Callable-Stubs und Firebaseconfig durch syntheticQA; Produktbootstraplogik bleibt bytegleich vor diesen Importersetzungen. Die QA-HTML-Hülle fügt eine ausdrückliche synthetische Kennzeichnung und einen unbenutzten Uhrbutton hinzu. Diese Datei ist nur im QA-Snapshot und nicht im Repo/Hostingbuild. Das ist weder echte Auth noch echter Firebase-/Rules-/Providertransport.

## Beleggrenzen

Die breiteren Prüfungen liegen in QA_852c45d.md (echter120s-Countdown,4Antworten aus2Sourcefragen, Random-/Keyboard-/Mobile-/Cancel) und QA_17e0f40.md (Guidedphasen, Markformen, Outputconversion, Hintresume, synthetische Neustartprobe). Sie bleiben an ihre jeweiligen SHAs gebunden. Der finale Durchlauf prüft die gemeldeten Änderungen und die bisher fehlende Produktbootstrap-Pause gezielt; keine unbeschränkte Wiederholung oder neue Gesamtnote.

Keine offenen reproduzierten Browserbefunde aus den beauftragten Durchläufen nach diesem Fixretest. Echte Lehrkraftanmeldung/gespeicherterTest, CloudTasks/Functions/Ruleslive, reale Generierungs-/QCqualität, physischer QR/iPad, klassengroße Last, Nutzertest, Integration und Deploy bleiben separat und wurden hier nicht geprüft. Keine Merge-/Productionfreigabe aus diesem Bericht.

Screenshots: final-mark-preview.jpg, final-product-bootstrap-pause.jpg, final-product-bootstrap-resume.jpg. Letzter Resume-Screenshot wurde nach dem API-Abgleich gesichert; für den beobachteten0:57-Zustand ist die vorliegende CUA-AX-Ausgabe maßgeblich.

Nächster Schritt: Root verbindet diese lokale unabhängige QA mit exakter CI und Codeprüfung; Hostingpreview und echte Auth-Abnahme bleiben eigene Gates.
