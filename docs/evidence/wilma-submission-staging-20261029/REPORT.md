# Wilma: echter Abgabeweg und kompakte Staging-Prüfung
Task GC-PEDAGOGY-KB-01; geprüft am 29.10.2026. Stufe **staging_deployed**, keine neue Production-Veröffentlichung.

## Quelle und tatsächlich veröffentlichter Umfang
Quelle `747401d0acc8cd9aadfdb096794c2c981e45f33b`, Baum `a499b51c73489f2d2aeef69cec947cfbc81857fd`; Draft [PR387](https://github.com/HerrLoeffler/Hausaufgabe/pull/387). Diese Stagekomposition erhält vorhandene Classroom-/Visualmodule und darf nicht als Ganzes auf den Liveintegrationsbranch übernommen werden.
Normaler Einstieg: https://gradecrew-staging-2026.web.app/wilma/?intent=login
Hostingversion `6fc0af374a768244`:215 öffentliche Runtimehashes geprüft, keine Abweichung;216 Prefixdateien inkl.Manifest.449 andere Hostingdateien und Konfiguration erhalten.
Nur submitAssessmentAttempt aktualisiert, ACTIVE `submitassessmentattempt-00014-kex`. Aktives StageZIP324a33e3… bewusst erhalten; nur lib/assessment-core.js geändert,21 andere Runtimefiles bytegleich. Neues ZIPsha256 df9fa4f0dc12d1cec10dba9653517dce5e7d6621a292d83f450c3d84b3585a9f.
Operation operation-1793228517885-65eee8ccf4619-971ac412-f57fa83d; Build2f1cc23a-a8b4-4f1d-ad82-10ef296e6e16.95 andere Functions nachher identisch. reviewWilmaAnswers unverändert00007-giq. Keine Rules/IAM/Secretsänderung.

## Verhalten
Nichtleere Textnichttreffer sowie unbekannte gefüllte Lücken bleiben offen; keine automatische endgültige Nullbewertung. Leere Textantworten/Lücken brauchen keinen Provider. Bekannte Lückenteile behalten ihre Punkte. Serverseitiger tatsächlicher Einstieg main.js→secure-lifecycle.submitAssessmentAttempt→gradeSubmission→gradeQuestion geprüft.
Ergebnisübersicht startet mit einem Wilma-öffnen-Knopf. Erst Öffnen blendet Aufgaben-/Antwortprüfung ein und die doppelte Ergebnistabelle aus; Zur Übersicht stellt sie wieder her. Antworten klassenweit je Aufgabe, direkte Punkteänderung, Bestätigung, Zurückstellen, Rückgängig.
Staging-Automatik startet erst nach explizitem Öffnen im eigenen Test. Account-/Quizbindung, Schließen stoppt noch ungesendete Folgejobs. Kein Aufruf beim bloßen Ergebnisladen. Allgemeine Liveautomatik bleibt aus.

## Fünf tatsächliche fiktive Abgaben
Eigener Test WILMAFLOW261029;5 Aufgaben/7 Punkte. Tatsächliche öffentliche getAssessmentInfo/startAssessmentAttempt/submitAssessmentAttempt/getAssessmentReceipt verwendet, keine direkt eingesetzten Submissiondokumente.
- A: unbekannter Text + eine leere Lücke →4/7,review,keineEndnote.
- B: akzeptierter Text/alle Lücken bekannt/leere Erklärung →6/7,Note2,graded.
- C: unbekannte gefüllte Lücke →5/7,review,keineEndnote.
- D: längere eigene Erklärung →6/7,review,keineEndnote.
- E: leere Texte und bekannte Lücken →5/7,Note3,graded.
Jede Abgabe mit geändertem Antworttext wiederholt: gespeicherte Felder unverändert. Offene Receipts verbergen Punkte/Prozent/Note; keine Lösungsschlüssel. Bruch1/2 und Visual-Winkel68 behalten1+2Punkte. Fiktive Runde anschließend geschlossen.

## Echte Lehreroberfläche und KI
Normales bereits angemeldetes Stage-Lehrerkonto, ohne Impersonation. C über vorhandenes Inlineformular5/7 bestätigt; D Erklärung1P ergänzt→7/7,Note1.
Wilma explizit geöffnet: ein echter neuer Providerrequest. Aufgabe Haustür, Raster erlaubt0,5P für richtigen Bestandteil; Antwort front →0,5P; kurze Begründung: door fehlt. Direkte Speicherprüfung unmittelbar danach: weiterhin4/7,review,gradeNULL. Der KI-Vorschlag änderte keine Bewertung.
Zurückstellen→Rückgängig→vorhandenen Vorschlag wiederhergestellt. Bestätigen→4,5/7; Plus→5/7; Rückgängig→4,5/7. Vollständiges Neuladen mit erneuter normaler Anmeldungwiederherstellung geprüft; Datenbank und UI bleiben konsistent. Schließen stellt normale Ergebnistabelle wieder her.
Endstand A4,5/7Note3,B6/7Note2,C5/7Note3,D7/7Note1,E5/7Note3. Nur fiktive Ergebnisse geändert.
Pilot6→7/7, alte Jobs unverändert. Cachewiederherstellung erzeugte keinen neuen Providerverbrauch; kein Reset/Erhöhen. Keine zweite KI/selbsttrainierte Engine.

## Prüfungen
[Exakte CI40784002403](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/40784002403): Node22 und WebKit/Chromium erfolgreich.718Web/UI-,416Functions-,144Assessmenttests;97 unabhängige fokussierte Tests/keine wichtigen Befunde.
36 Browserfälle:2Engines×20/40Aufgaben×9Größen/Zoomfälle,320–2560px und200%Zoom; Touchziele/Fokus/Taskscroll. Kein physischer iPadtest behauptet.
Versuchshistorie: fiktiver erster Code WILMAFLOW20261029 überschritt tatsächliche16-Zeichen-Grenze, vor Beginn irgendeines Schülerversuchs abgewiesen. Kein Produktfehler; alle privaten Phasen geplant. Eigene ungültige Fixture geschlossen, gültige separat angelegt, kein Budgetreset. Vorherige Assertion-/Harnessfehler und Korrekturen bleiben in der Arbeitsübergabe erhalten.

## Grenzen und nächster Schritt
Ein echter kurzer Freitextrequest belegt keine99%-Bewertungsqualität. Längere Erklärung im tatsächlichen Abgabe-/Lehrerfluss geprüft, aber nicht zusätzlich bezahlt per KI geprüft; dafür ist bestehendes Kontingent erschöpft. Umfangreicher Textqualitätskorpus, physisches iPad und Lehrerabnahme bleiben offen.
Live gradecrew.de unverändert8188/Layout; kein automatisches Bewerten echter Antworten freigeschaltet. Vor allgemeinem Liveeinsatz: konkrete Kosten-/Inputtokengrenze, Schul-/Dateneignerumfang, LegacyBatchcache-/Einzeljobabgleich, frische minimale Liveorigin-Komposition und Review/CI/gezielter Rollout. Bestehende Budgetfrage bleibt offen; keine erneute Schlüsselanforderung.
Nächster ausführbarer Schritt: Martin prüft den normalen Stage-Einstieg und entscheidet die konkrete Kostengrenze. Danach begrenzte längere Freitext-KI-Proben und separat geprüfte minimale Livepromotion.
