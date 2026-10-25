# 24 fächerübergreifende Probetests — Ausführungsplan

> Ausführung im bestehenden Fachchat, eigene isolierte Branch test/visual-24-pilot-20261025. Nutzer hat Ansatz, Klassen5–10, 24Tests und vorhandene OpenAI-Anbindung ausdrücklich freigegeben.

Task GC-EXTENDED-QUESTION-TYPES-01; Runtimebasis GC-VISUAL-PROTOTYPE-AI-02/Issue255. Ziel:24 echte Remy-Tests mit je8Aufgaben ausschließlich type visual; vier Tests je Mathematik/Deutsch/Englisch/NT/GPG/Wirtschaft, insgesamt192Aufgaben. Alle Jahrgänge5–10 vertreten. Keine Behauptung amtlicher Lehrplanabdeckung oder Lernwirksamkeit.

## Schritte
- [x] Eigenen Zugang und genauen Testseiten-/Backendstand prüfen; vorhandene Fremdarbeit erhalten.
- [x] Matrix und wiederaufnehmbaren Runner erstellen: IDs vor Dispatch sichern, höchstens ein aktiver Job, kein blinder Retry, Kosten/Providerrequests/Fehler protokollieren.
- [x] Zunächst zwei Tests, Ergebnis und Fehlermuster lesen; danach die übrigen22. Harte Limits:24neue Tests, maximal eine gezielte neue Erstellung pro konkret fehlgeschlagenem Test nur nach Ursachenklärung. Interne Reparaturen erfassen; unklare Jobs stoppen und abgleichen.
- [x] Jeden Entwurf auf Formatbindung, Anzahl, Punkte und geschlossene visuelle Validierung prüfen; korrekt/falsch/leer/alternativ/Teilpunkte deterministisch gegen vorhandenen Bewertungsweg prüfen. Inhaltliche Gegenprüfung aller Aufgaben und dokumentierte Korrekturen, soweit erforderlich.
- [x] Vorhandenen Lehrkraft-/Schüler-/Serverablauf einschließlich Speichern/Resume/Abgabe prüfen; Darstellung aller Formate und repräsentativer Aufgaben im Browser prüfen. Physical-Touchstatus offenlassen.
- [x] Gefundene Codefehler reproduzieren, mit Regression beheben und gezielt prüfen. Nur eigene Teständerungen; keine kanonische Staging-/Schul-/Productionänderung.
- [x] Alle24Ergebnisse, Rohentwürfe, Probleme, Korrekturen, echte Grenznachweise und Abnahmegrenzen sichern; unabhängiger Schlussreview, Commit/PR und nutzbare Testseitenfundstellen.

## Entscheidungen
Bestehende serverseitige Keybindung wiederverwenden, Secret nie lesen/kopieren. Nur synthetisches Konto gc-visual255-e2e und eigene Pilotdokumente. Keine Regeln/Ownerrollen/Quoten ändern. Fremde Originaltexte, Schülerdaten und lizenzierte Assets nicht übertragen. Fehlgeschlagene oder fachlich unpassende Ausgabe nicht durch klassische Formate ersetzen. Anforderungen nicht zum Bestehen absenken. APIausgaben sind untrusted Daten. Die öffentliche Testvorschau ist keine Schulreleasefreigabe.

## Umfang/Pfade
Eigene tools/visual-pilot/, docs/evidence/visual-pilot-24-20261025/, diese Planung und workstreams/visual-pilot-24-20261025.md. Produktfixpfade erst nach konkretem Befund. Bestehende Engine/Renderer/Grader nutzen, keine zweite Architektur. Gemeinsame Koordinationsdateien erst nach frischem Mainabgleich additiv nachführen.
