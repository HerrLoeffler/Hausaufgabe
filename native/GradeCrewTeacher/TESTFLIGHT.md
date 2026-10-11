# GradeCrew auf iPhone/iPad – TestFlight und Abnahme

Stand: 11.10.2026. Teacher Bundle-ID `de.gradecrew`; Secure bleibt separat (`de.gradecrew.secure`). Keine neuen App-IDs, Zertifikate oder Schlüssel für die Dateibrücke anlegen.

Letzter auf einem iPhone getesteter Stand: **0.1.9 (Build 19)**. Der TestFlight-Test zeigte Probleme beim Anmelde-Einstieg, bei der Texteingabe-Navigation und beim Abschließen von Remys Rückfragen. **0.1.10 ist noch ein Entwicklungskandidat**; lokale Tests allein bedeuten weder GitHub-CI noch Upload oder Apple-Verarbeitung.

Der autorisierte Ablauf für 0.1.10 ist: PR-Prüfung gegen den kanonischen App-Branch, erfolgreiche native CI, Integration des Staging-Follow-ups und erfolgreicher Preview-/Functions-Deploy, anschließend TestFlight-Upload. Jeder dieser Schritte wird separat bestätigt; Production wird nicht verändert.

Der bestehende Upload archiviert ohne Development-Signing und signiert erst beim App-Store-Connect-Export. Das bewährte Verhalten und vorhandene Apple-Secrets bleiben erhalten. Keine Zertifikate löschen oder widerrufen.

Standard-Web-URL: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/`. Normales Staging ist Fallback. Web-Hosting und native App sind zwei getrennte Updates; ein neuer App-Build veröffentlicht keine Web-Funktionen.

## Physischer Gerätetest für 0.1.10

1. Version/Build in TestFlight prüfen; die Diagnose zeigt die geladene Staging-Domain und den Web-Manifest-Commit.
2. Abgemeldet starten: zuerst **„Mit GradeCrew anmelden“**; danach erscheinen **„Remy fragen“** und **„GradeCrew öffnen“**.
3. Anmeldung schließen und App erneut öffnen: die gespeicherte Sitzung soll ohne tägliche Neuanmeldung erkannt werden.
4. Remy mit nur „Erstelle einen Test“ starten; alle fehlenden Angaben nennen lassen, antworten und prüfen, dass nach angenommener Übergabe der Haken erscheint.
5. Unter Remy **„Stattdessen tippen“** öffnen, Text eingeben und prüfen, dass **Start** und **Eingabe schließen** erreichbar bleiben.
6. Auftrag absenden und über die Zurück-Schaltfläche wieder zur Startseite gehen; anschließend **„GradeCrew öffnen“** und den Entwurf prüfen.
7. Remy-Fehler/Netzwerkfehler: konkrete Meldung und erneuter Versuch; keinen doppelten Auftrag bei wiederholtem Tippen erzeugen.
8. Auf iPad Hoch-/Querformat und angepasste Karten prüfen.
9. CSV/PDF-Teilen, Abbrechen, Upload, Kamera, externe Links und erneutes Öffnen als Regression testen.

Der Gerätetest beginnt erst nach Apple-Verarbeitung und interner TestFlight-Verfügbarkeit; ein grüner Upload allein bestätigt das nicht.
