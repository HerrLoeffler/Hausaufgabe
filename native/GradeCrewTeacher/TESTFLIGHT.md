# GradeCrew auf iPhone/iPad – TestFlight und Abnahme

Stand: 06.10.2026. Teacher Bundle-ID `de.gradecrew`; Secure bleibt separat (`de.gradecrew.secure`). Keine neuen App-IDs, Zertifikate oder Schlüssel für die Dateibrücke anlegen.

Letzter bestätigter Upload: **0.1.8 (18)** @ `79598be8`, [Run 37076301215](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37076301215). Der vorherige Run 37075968920 lieferte Build 17. Apple-Verarbeitung, interne Testfreigabe, Installation und Gerätetest sind nicht aus einem grünen Upload ableitbar.

**0.1.9 ist zunächst ein isolierter Entwicklungskandidat.** Native Checks bauen und testen ohne Signing/Upload. Ein Push dieses Aufgabenbranches löst den bestehenden TestFlight-Pushpfad nicht aus. Erst nach Review, exakter CI und bewusstem Release-Schritt darf der kanonische Branch bzw. der manuelle Upload verwendet werden.

Der bestehende Upload archiviert ohne Development-Signing und signiert erst beim App-Store-Connect-Export. Das bewährte Verhalten und vorhandene Apple-Secrets bleiben erhalten. Keine Zertifikate löschen oder widerrufen.

Standard-Web-URL: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/`. Normales Staging ist Fallback. Web-Hosting und native App sind zwei getrennte Updates; ein neuer App-Build veröffentlicht keine Web-Funktionen.

## Physischer Gerätetest für 0.1.9

1. Tatsächlich installierte Version/Build sowie geladene Domain und Web-Manifest-Commit gemeinsam dokumentieren.
2. Login, Wiederöffnung und bestehende Sitzung prüfen.
3. Ergebnis-CSV exportieren → native Teilen-Ansicht → „In Dateien sichern“; gespeicherte Inhalte/UTF-8 prüfen.
4. Vorhandenen PDF-Download teilen; Druck-/Vorschaupfade separat testen.
5. Teilen abbrechen → keine zweite Datei und kein zweites Menü.
6. Auf iPad Hoch-/Querformat, Popover und wiederholtes Teilen prüfen.
7. Datei zu groß/ungültiger Typ und gleichzeitig offenes Menü → verständliche Meldung.
8. Reload/Seitenwechsel während Teilen → Abbruch und anschließend neuer Export möglich.
9. Interne/externe Links, PDF/Bild-Upload, Kamera, Mikrofon und JS-Bestätigungen als Regression prüfen.
10. Offline/Retry und Rückkehr ins normale Staging prüfen.

Gerätetest ist manuell; Production und externe TestFlight-Einladungen/App-Store-Veröffentlichung benötigen eigene Freigabe.
