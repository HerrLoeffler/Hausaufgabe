# GradeCrew auf iPhone/iPad – TestFlight und Abnahme

Stand: 11.10.2026. Teacher Bundle-ID `de.gradecrew`; Secure bleibt separat (`de.gradecrew.secure`). Keine neuen App-IDs, Zertifikate oder Schlüssel für die Dateibrücke anlegen.

Letzter auf einem iPhone getesteter Stand: **0.1.9 (Build 19)**. Der TestFlight-Test zeigte Probleme beim Anmelde-Einstieg, bei der Texteingabe-Navigation und beim Abschließen von Remys Rückfragen. **0.1.12 ist der aktuelle Entwicklungskandidat**; lokale Tests allein bedeuten weder GitHub-CI noch Upload oder Apple-Verarbeitung.

Der autorisierte Ablauf für 0.1.12 ist: PR-Prüfung gegen den kanonischen App-Branch, erfolgreiche native CI, Integration des Staging-Follow-ups und erfolgreicher Preview-/Functions-Deploy, anschließend TestFlight-Upload. Jeder dieser Schritte wird separat bestätigt; Production wird nicht verändert.

Der bestehende Upload archiviert ohne Development-Signing und signiert erst beim App-Store-Connect-Export. Das bewährte Verhalten und vorhandene Apple-Secrets bleiben erhalten. Keine Zertifikate löschen oder widerrufen.

Standard-Web-URL: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/`. Normales Staging ist Fallback. Web-Hosting und native App sind zwei getrennte Updates; ein neuer App-Build veröffentlicht keine Web-Funktionen.

## Physischer Gerätetest für 0.1.18

1. Version/Build prüfen. Beim Start müssen die vier Tiere mit tatsächlichen Fuß-/Flügelbewegungen innerhalb einer Sekunde eng ans Logo kommen und anschließend in der Anlehnpose stehen bleiben. Kein abgeschnittener Kopf, keine Nachbarreste oder weißen Bildrahmen.
2. Schnelle Anmeldung: die Bewegung darf beim Übergang vom Laden zum Menü nicht von vorne beginnen. Langsame Anmeldung: Endpose bleibt stehen, keine Endlosschleife. Die Anmeldung darf sofort abschließen.
3. „Bewegung reduzieren“: direkt vollständige Endpose, keine Laufanimation. Während der Bewegung App in den Hintergrund legen und später öffnen: keine nachträgliche Wiederholung.
4. Die Remy-Karte zeigt Remy mit blauem Mikrofon Richtung Bildschirm und „Test kurz einsprechen“. Zweimal Aufnahme und Absenden testen; der bewährte Ablauf bleibt unverändert.
5. „Remy → Start → GradeCrew öffnen“ öffnet weiterhin „Meine Tests“. Auf kleinem iPhone, großer Schrift und iPad Logo, Tiere und beide Karten prüfen.

Die neuen Bilder und die Animation brauchen eine eigene Geräteabnahme. Ein grüner Upload bestätigt nicht allein die Installationsbereitschaft in TestFlight. Production wird nicht verändert.

## Physischer Gerätetest für 0.1.17

1. Version/Build in TestFlight prüfen. Beim Wiederherstellen der Anmeldung müssen alle vier Tiere um das Logo erscheinen und sich kurz einordnen; eine schnelle Anmeldung darf sofort zum Menü wechseln.
2. Im Menü müssen Coco, Remy, Emmi und Wilma rund um das Logo sichtbar sein. „GradeCrew öffnen“ zeigt das GradeCrew-Zeichen statt vier Vierecken.
3. In den iOS-Bedienungshilfen „Bewegung reduzieren“ aktivieren: die Crew bleibt vollständig sichtbar, ohne Einlaufanimation. Große Schrift, kleineres iPhone und iPad ebenfalls prüfen.
4. Remy zweimal aufnehmen/absenden und „Remy → Start → GradeCrew öffnen“ prüfen. Die funktionierende Sprachaufnahme, Formularübernahme und Rückkehr zu „Meine Tests“ bleiben unverändert.

Die Geräte-Rückmeldung vom 11.10.2026 bestätigt zwei erfolgreiche Remy-Durchläufe unter 0.1.16 (Build 33). Das neue Branding ist eine eigene Geräteabnahme. Ein grüner Upload bestätigt nicht allein die Installationsbereitschaft in TestFlight.

## Physischer Gerätetest für 0.1.16

1. Version und Build in TestFlight prüfen. Upload, Apple-Verarbeitung und Installation sind getrennte Zustände.
2. Beim ersten Aufnahmeversuch Remy antippen. „Vierte Klasse Englisch“ sagen, 3–5 Sekunden pausieren, dann „Farben und Schulsachen, fünf Aufgaben, zwei Bilder, zwei Höraufgaben“ ergänzen. Der gehörte Text muss unter Remy gesammelt stehen bleiben. Erst erneut Remy antippen, um die Aufnahme zu beenden und das Formular auszufüllen.
3. Fach, Klasse, Thema, Aufgabenanzahl und Bilder/Audio prüfen. Bei einer Rückfrage weiter einsprechen: frühere Formularangaben müssen erhalten bleiben. Neben „Eigene Wünsche“ „Lustige Sätze“ einsprechen und die Zuordnung prüfen.
4. Den ersten Start nach neuer Installation/erteilten Berechtigungen, mehrere neue Aufnahmen hintereinander und längere Pausen prüfen. Ein leerer Apple-Abschluss darf bereits gehörte Wörter nicht löschen oder als „nichts gehört“ melden.
5. Bei Hintergrundwechsel/Handysperre wird die laufende Aufnahme mit bereits gehörtem Text beendet. Nach Rückkehr den Entwurf prüfen. Navigation weg von Remy oder Kontowechsel beendet und löscht die Aufnahme.
6. Remy öffnen, ohne Absenden auf „Start“ gehen, anschließend „GradeCrew öffnen“: „Meine Tests“ muss erscheinen. Die ausgeblendete Web-Testmaske darf keinen leeren Arbeitsbereich hinterlassen. Der alte Staging-Markierungsbutton darf in der App nicht erscheinen.
7. „Test erstellen“: erst nach bestätigter Übergabe zurück zur nativen Auswahl. In GradeCrew den gespeicherten Entwurf und die tatsächlichen Bild-/Audioaufgaben prüfen; die Medienprüfung meldet Abweichungen.
8. Materialien aus Fotomediathek, Dateien und Kamera hinzufügen, entfernen und übernehmen. Rechtebestätigung, 5 Dateien und 15 MB pro Datei bleiben erhalten.
9. Anmeldung, Upload, CSV/PDF-Teilen, externe Links und iPad-Hoch-/Querformat als Regression prüfen.

Automatische Tests prüfen Start-Rennen, Pausenabschnitte, kumulative/korrigierte Hypothesen, fehlende Zeitstempel, leere Abschlüsse, begrenzte Wiederaufnahme, veraltete Rückmeldungen und den Abschluss ohne Apple-Final-Callback. Der lokale iOS-Archiv-Build bestätigt die Kompilierung. Diese Nachweise ersetzen keinen Mikrofontest auf dem physischen iPhone und liefern keine 100-Prozent-Garantie für Spracherkennung. Production wird nicht verändert.
