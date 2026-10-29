# GC-BRAIN-01 — Firmenzentrale als lokale Mac-App

Humanentscheidung 25.10.2026: zuerst Mac-App; bestehende Zentrale weiterverwenden, Live unverändert. Derselbe Writer/Task/PR295. Vorheriger Auftrag zur alleinigen direkten Umsetzung bleibt gültig.

## Ergebnis und Grenzen
Eine per Doppelklick startbare `.app` mit eigenem Dock-Symbol und Fenster. Bestehende blaue Oberfläche, Netz-/Bereichsnavigation, Eingang, Ergebnisse und Releaseübersicht werden unverändert eingebettet. Keine zweite Datenhaltung und keine erfundene Gesamtfertigstellung. Mac-App ist eine lokale Distribution der vorhandenen Zentrale, keine Erweiterung der Rechte ihres Analyse-/Berichtsprofils.

AppKit/WKWebView (macOS13+, zunächst arm64). Das Paket enthält kompilierten nativen Starter, Frontend, Python-Dienst und isolierte Python-Standardbibliothek. Kein Terminal und kein separat installiertes Python zum Benutzen nötig. Codex/ChatGPT-App und deren bestehende Anmeldung bleiben Voraussetzung für neue KI-Aufträge. Keine zusätzlichen API-Schlüssel.

## Start und Daten
Konfiguration bindet dieses lokale Paket an den bestehenden privaten Datenordner und Port8796. Sie wird nur beim lokalen Build erzeugt und nicht in Git gespeichert. SQLite, Berichte, importierte Chats, Geheimnisse und ungesendete Browserentwürfe werden nicht ins Paket kopiert. Gesendete Aufträge/Ergebnisse bleiben im bisherigen Datenordner; ungesendete Browserentwürfe bleiben im ursprünglichen Browser. WKWebView behält künftig eigene Entwürfe persistent.

Ein Startlock serialisiert gleichzeitige Appstarts. Eine minimale Health-Antwort prüft Dienstidentität, Protokoll und Hash des gebundenen Datenordners. Ein fremder Dienst oder ein Dienst für einen anderen Datenbestand wird weder übernommen noch beendet. Bestehender Dienst wird wiederverwendet. Ohne Dienst startet ein abgekoppelter lokaler Prozess; der vorhandene exklusive Dienstlock bleibt zweite Sicherung gegen Doppelverarbeitung. Beim Fenster-/Appschließen bleibt der Dienst für laufende Arbeit aktiv. Nach Mac-Neustart startet er beim nächsten Appöffnen. Kein Login-Item, kein versteckter Autostart beim Systemlogin, kein automatisches Requeue unklarer Aufträge. Dienstaktualisierungen erfolgen bewusst bei ruhendem Auftragssystem, nicht während einer Bearbeitung.

## Fenster und Navigation
Gleiches Blau/Logo wie Webzentrale; Fenstergröße und Position werden gespeichert. Normale Mac-Menüs für Bearbeiten, Neuladen und Fensteröffnen. Inhalt darf ausschließlich den gebundenen lokalen Ursprung laden. Bewusst geklickte HTTPS-Quellen öffnen im Standardbrowser; andere lokale Ports, Datei- und fremde Schemen sowie automatische externe Navigationen werden abgewiesen. Keine native JavaScript-Brücke und keine zusätzlichen Dateirechte für Chatinhalte. Berichtdownloads verwenden einen nativen Speichern-Dialog. Fehler beim Start/Laden werden mit Wiederholen und lesbarer Erklärung dargestellt; keine Schlüssel/rohen Modellprotokolle.

## Abnahme
1. Relokierbares, lokal ad-hoc-signiertes Paket startet ohne externes Python/Checkout.
2. Echte blaue Firmenoberfläche im nativen Fenster, Originalicon, Menüs und Unterbereiche bedienbar.
3. Beide vorhandenen Aufträge und Ergebnisse mit unveränderter Versuchszahl sichtbar; Chatverbindung meldet echten Zustand.
4. Wiederöffnen verwendet denselben Dienst; fremder Port/Datenordner werden abgewiesen.
5. Navigationsgrenzen, Startfehler, Isolation der Paketinhalte, bestehende UI-/Brokertests geprüft.
6. Keine Produkt-/Liveänderung, keine neue kostenpflichtige Modellbearbeitung für den Verpackungstest.

Lokaler Build ist keine notarisierten Fremdverteilung und keine iPhone-/iPad-App. Kein Versprechen einer vollständigen Firmen-V1 durch die Verpackung. Selbstprüfung, keine unabhängige Assurance. Relevanz: SEC14/15/18, PRIV07/08/12/13. API-Referenz: https://developer.apple.com/documentation/webkit/wknavigationdelegate
