# Ein Spiel, ein Hauptchat, abgegrenzte Fachaufträge

Stand 06.10.2026 · GC-GAMES-PIPELINE-01. Dies ist eine Arbeitsregel, keine bereits installierte automatische Orchestrierung.

## Zuständigkeiten

Martin entscheidet Ziel und Abnahme. Der Spiele-Hauptchat hält PLAN, Aufgabenbestand und Übergabe aktuell, vergibt Aufträge und integriert seriell. GradeCrew-Main koordiniert gemeinsame Plattform- und Releaseänderungen. Bei kleinen Spielen genügt zunächst ein Bearbeiter plus unabhängige Prüfung; nicht für jedes Objekt einen dauerhaften Chat anlegen.

Bei größerem Umfang nach Bedarf getrennte Pakete:

| Paket | Verantwortung | Grenze |
| --- | --- | --- |
| Spielmechanik | Bewegung, Kamera, Interaktion, Spielzustand | vereinbarte Daten-/Ereignisverträge |
| Welt und Assets | Blockout, Blender, Licht, Materialien, Animation | eigene Assets/Szenen, keine fremden Binärdateien überschreiben |
| Oberfläche und Ton | Bedienung, Rückmeldungen, Audio, Sprache, Zugänglichkeit | gemeinsame UI-/Audioverträge |
| Lernanbindung | Aufgaben, Hilfe, geschützter Fortschritt, Wiederaufnahme | vorhandene Berechtigungen und Learning Guardrails |
| Prüfung und Build | unabhängige Fehlerprüfung, Zielgeräte, Paketierung | keine erfundene Geräteabnahme |

Ein Auftrag darf mehrere Dateien einschließlich Tests benötigen. „Ein System pro Auftrag“ bedeutet klare Verantwortung, nicht künstlich alles in eine riesige Datei schreiben.

## Ablauf

1. Hauptchat klärt Einstieg und Referenzbild, dokumentiert Engineentscheid und Schnittstellen.
2. Ein kleiner kompletter Spielabschnitt beweist Bedienung, Bildstil und technische Eignung.
3. Erst danach unabhängige Pakete verteilen, höchstens drei aktive Umsetzungspakete zugleich. Abhängige Pakete warten auf bestätigte Verträge/Ergebnisse.
4. Jeder Bearbeiter erhält nur die notwendige Kurzübernahme aus der Vorlage, arbeitet in isoliertem Checkout und liefert Commit/PR, Prüfungen und Restpunkte zurück.
5. Unabhängiger Prüfer bewertet die tatsächliche Änderung gegen die Kriterien. Ein Eigenlob oder KI-Score ist keine Freigabe. Prüfung und Korrekturversuche begrenzen; vorhandene Versuchshistorie erhalten.
6. Hauptchat holt Ergebnisse ab, prüft Belege, integriert seriell und aktualisiert Plan und Karte derselben Task-ID. Martin kopiert keine Texte zwischen Chats.
7. Auf dem integrierten Build gemeinsame Abläufe prüfen, Testbuild bereitstellen und Martins Spiel-/Geräteabnahme separat erfassen. Production benötigt ausdrückliche Freigabe.

## Konflikte und Ressourcen vermeiden

Ein Eigentümer je interaktivem Editor und ein Schreiber je Dateibereich; gemeinsame Verträge zuerst festlegen. Binäre `.blend`-/Engine-Szenen exklusiv bearbeiten, bei Bedarf in unabhängige Assets/Levels aufteilen. Auch textuelle Szenendateien können logische Konflikte haben. Kein blindes Zusammenführen allein aufgrund textuell konfliktfreier Diffs.

Luna für Inventar, Quellen-/Dokumentabgleich; Sol für normale Umsetzung und unabhängige technische Prüfung; Astra für begründet schwierige Architektur-/Securityfragen. Die Modellnamen aus dem Video sind keine Einkaufsliste und keine bewiesene Rangliste. Keine zusätzlichen bezahlten Modell-APIs. Neue dauerhafte Nutzerchats nur im autorisierten Rahmen, kurzlebige Fachaufträge können Unteragenten bleiben.

Abgeschlossene Pakete sichern und aus der offenen Ansicht nehmen; Historie behalten. Frischer Arbeitskontext pro abgeschlossenem Paket ist oft hilfreicher als ein langer Chat mit vielen Baustellen. Nicht mitten in einer unklar laufenden Ausführung einen Ersatzautor starten. Kein garantiertes Token-Sparverhältnis aus den Videoanimationen ableiten.

Ergebnisse ereignisbezogen abholen, wenn verfügbar. Automatisches Nachfragen bei unveränderter Arbeit höchstens alle 20 Minuten; früher auf Martins ausdrücklichen Abruf. Nicht gleichzeitig mehrere Poll-Schleifen führen. Tatsächliche automatische Rückführung benötigt angeschlossene Werkzeuge und gespeicherte Zuordnung; diese Dokumentation allein implementiert sie nicht.

## Übersicht: Reife und Arbeit getrennt

| Reifestufe | Erforderlicher Beleg |
| --- | --- |
| 🔴 Entwicklung | Umsetzung oder Prüfung noch offen |
| 🟠 technisch geprüft / integrationsbereit | technische Prüfung und Integrationsstand benannt; fehlenden Merge ausdrücklich zeigen |
| 🟡 Testumgebung | konkreter erreichbarer Testbuild mit Commit und Zielplattform |
| 🔵 abgenommen | Martins Abnahme für genau diesen Build/Gerät dokumentiert |
| 🟢 veröffentlicht | freigegebener veröffentlichter Build mit Nachweis |

Daneben Arbeitszustand: geplant, läuft, wartet auf Abhängigkeit, blockiert oder abgeschlossen. Fehlerpriorität separat anzeigen. Farben nie allein zur Informationsvermittlung verwenden. Ein Webdeploy beweist weder iOS-/Android-Build noch erfolgreiche Spielabnahme. Die genaueren Repository-Stufen bleiben maßgeblich.

## Schlanke Produktionskontrolle

Jeder Bearbeiter verwendet einen eigenen temporären Ausgabeordner. Assetübergabe enthält ID, Ursprung/Lizenz, Quelle, Export, Hash und bestandene Prüfung. Ein externer Job behält seine Request-ID; bei unklarem Ausgang erst prüfen, niemals automatisch neu bezahlen. Bestehende Kostenfreigaben gelten unverändert.

Nur relevante Meilensteine mit reproduzierbarer Ansicht oder kurzem Clip dokumentieren, kein pauschales Dauerrecording. Große Exporte benötigen freien Speicher; Diagnosemedien dürfen Quellen und letzten guten Build nicht verdrängen. Nach erfülltem Auftrag Ergebnis sichern und beenden. Keine Weiterarbeit-Hooks, die ohne konkreten Auftrag immer neue Aufgaben erzeugen. Prüflogik nicht während eines laufenden Tests verändern, um dessen Ergebnis zu beeinflussen.
