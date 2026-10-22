# GC-IOS-02 / GC-RELEASE-06 — Rückkehr nach Offline-Abgabe, 22.10.2026

Owner: ausführender Native-Fachchat dieses Gesprächs, Chatlink unbekannt. Basis `aa39a9fbbec550f0cf42bfd22ced6719d02dad60`, Ziel `feature/native-live-staging-20261018`; eigener Branch `fix/secure-return-after-sync-20261022`, eigener wiederverwendeter sauberer Worktree `/private/tmp/gc-material-rights-native-20261021`. Secure 1.0(1141) bleibt ausgelieferter Stand. Kein Website-/Backenddeploy.

## Auftrag und gesicherte Fakten

Martin bestätigt erneut am echten iPad: WLAN-Ausfall, lokal gesicherte Abgabe und spätere Synchronisation funktionieren. Neu gemeldet: Rückkehr zum Menü nach nachträglicher Abgabe geht erst nach App-Neustart. Außerdem fragt er nach Aufwand für iPhone-Unterstützung; keine automatische iPhone-Freigabe aus dieser Frage ableiten.

Frischer Main `b290e469afd449bf46ca6a5a38843d443407906e`: Einstieg/AGENTS/STATE/TODO/workstreams gelesen, Fetch durchgeführt. Development Status 39777429354 / Job119819838961 success: Native-Integration bleibt separater Zielbranch; kein offener Secure-Produktfix-PR gefunden, historische Security-/Web-Branches nicht übernehmen. Fremde Branches unangetastet. Main und Native sind bewusst unterschiedliche Releasebäume.

## Diagnose — noch kein Produktfix

- Coordinator: unabhängiger Receipt → AAC-Ende → dauerhaften Stand löschen → `.completed`, `busy=false`; `restart` wechselt von `.completed` zu `.code`.
- Recovery zeigt einen anderen Knopf für erneute Übertragung; offene Abgaben dürfen bisher keinen neuen Prüfungsstart erlauben. Nicht durch ungeprüftes Löschen/Reset freigeben.
- Bestehende echte SwiftUI/WebKit-Controller-Suite erweitert um Rückkehr nach Receipt, leeres Code-/Namensformular, Vordergrundwechsel und erfolgreiche Preflight-Abfrage für den nächsten Test. Alle fünf Integrationstests bestanden am eigenen iPad-Pro-Simulator, ohne Produktfix. Log `/private/tmp/gc-return-sync-tests-20261022.log`.
- Ein separater nicht verteilter UI-Testhost prüft echte Tastendrücke im echten SwiftUI-Root. Keine AAC-Sperre vorgetäuscht, HTTP/Store ausschließlich synthetische Testimplementierungen im LayoutTests-Verzeichnis. Shipping-Codeänderung bisher nur interne statt private Sichtbarkeit von SecureStagingScreen zum Testen, keine Verhaltensänderung.
- Rückfrage offen: sah Martin „Abgabe gespeichert / Zurück zum Start“ oder „Übertragung ausstehend“? Der gemeldete Gerätefehler ist noch nicht reproduziert. Nicht behaupten, dass er behoben sei; keinen TestFlightupload nur wegen grüner Diagnosetests starten.

## iPhone-Einordnung

Aktueller Generator ist explizit Gerätefamilie2 und iOS/iPadOS17+. Apple's WWDC20-Dokumentation nennt Automatic Assessment Configuration für iPhone, iPad und Mac: https://developer.apple.com/videos/play/wwdc2020/10005/ . Supportübersicht erwähnt nur iPad/Mac; daraus kein iPhone-Verbot ableiten. Für Erweiterung: Universal-Target, schmale Aufgaben-/Antwortnavigation, Tastatur/Safe-Areas/Rotation/DynamicType, iPhone-Simulatorfälle und echte AAC-/Zeitablauf-/Offline-/Anrufunterbrechungs-Geräteabnahme. Keine zweite Serverimplementierung erforderlich, Sperrgleichheit noch nicht am iPhone bewiesen. Aufwand vorläufig wenige Entwicklungstage einschließlich Tests, genaue Schätzung nach schmalem Layout-Smoke.

## Assurance im betroffenen Umfang

SEC14 (Zustandsübergänge), PRIV07/20 (gesicherte Antworten nur nach bestätigter Abgabe entfernen), PRIV13 (bedienbarer Rückweg): vorhandene Sicherheitsgrenzen erhalten; Diagnose-/Teiltests sind keine Gesamtfreigabe. Backend-/Tracking-/Rechts-/Speicherzwecke unverändert. Requested Modell nicht separat vorgegeben, beobachtete Runtime unbekannt; kein Modellwechsel oder bezahlter Provideraufruf.

## Zusätzlicher separater Lehrkräfte-Auftrag

Während der Diagnose eingetroffene autorisierte Zentrale-Delegation: Teacher-App direkt Auth bzw. eigene Tests; vorgeschaltetes Remy-Menü und App-Homebutton entfernen, vorhandene Remy-Implementierung/Assets behalten, Website und Secure unverändert. Noch keine Umsetzung dieses zusätzlichen Scopes und kein Release behauptet. Separater eigener Branch nötig; nicht diese Secure-Diagnose damit vermischen.

Nächster Schritt: Ergebnis des UI-Tastentests und Martins Phasenhinweis abgleichen; erst nach reproduzierbarem Fehler den kleinsten Produktfix mit Rot/Grün-Test umsetzen.

## Checkpoint 14:42 CEST

Echter UI-Tastentest im nicht verteilten Host ebenfalls bestanden: gespeicherter Abgabe-Receipt → „Zurück zum Start“ → leere Code-/Namensfelder → nächster Preflight → echte SwiftUI-Startbestätigung. Sowohl mittiger Tastendruck als auch linke Schaltflächenfläche (6% Breite) funktionieren ohne Produktfix. Logs `/private/tmp/gc-return-sync-ui-20261022-final.log` und `/private/tmp/gc-return-sync-ui-edge-red-20261022.log`; der Dateiname edge-red bezeichnet nur die geplante Falsifikationsprobe, tatsächliches Ergebnis ist **grün**, kein Rot/Grün-Fixbeleg. Erster UI-Lauf scheiterte ausschließlich an einer zusätzlichen Abbrechen-Abfrage nach bereits erfolgreicher Rückkehr; diese nicht zum Fehler gehörende Testabfrage entfernt. Nur iOS27-Simulatorruntime installiert; keine echte AAC-/Touch-/iPadOS-Abnahme. Produktreparatur und TestFlightupload bleiben offen, bis der gemeldete Zustand präzisiert/reproduziert ist.

Gesicherter Diagnose-Commit `fd309adc329962fbfe15a2f4416f387c95b6439e`, [Draft-PR277](https://github.com/HerrLoeffler/Hausaufgabe/pull/277), Zielbranch unverändert; nicht integriert/nicht hochgeladen.
