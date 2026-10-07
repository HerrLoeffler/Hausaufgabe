# Bruchpizzeria – native Unreal-Küche

Task GC-GAMES-PIZZA-01. Unreal 5.8.3, eigener C++-Spielcode und originale prozedurale 3D-Objekte. Keine zusätzliche Spielbibliothek. Lokaler Entwicklungsstand; Grafik-, Spielgefühl- und mobile Geräteabnahme sind offen.

## Öffnen und spielen

`Bruchpizzeria.uproject` im installierten Unreal Editor öffnen. Lokale Map `/Game/Maps/Pizzeria` ist vorhanden. Play starten, dann **Los kochen** bzw. E drücken. WASD/Pfeile bewegen, E benutzt die nahe Station, Leertaste sprintet, X legt ab. Rechts liegen die Aktionen; Controller und linker Stick wurden auf Nutzerwunsch entfernt. Q wechselt den Modus für neue Bestellungen.

Teig → Tomate und Käse → optional Pilze → Ofen → Schneidebrett → Portion → passender Gast. Beim Schneiden deutlich von einer Pizzaseite zur anderen ziehen, danach Stücke antippen. Start und Ende dürfen etwas außerhalb des Randes liegen. Normale schiefe oder leicht versetzte Züge werden großzügig auf sinnvolle Halb-, Viertel- und Achtelschnitte ausgerichtet. Stark seitliche oder schiefe Schnitte erzeugen tatsächlich ungleiche Stücke; mit **Neu teilen** neu beginnen. Für Achtel vier unterschiedliche Schnitte setzen.

Falsche Portionen oder Zutaten pausieren die Küche. Die Lernhilfe führt durch einzelne Schritte; Antworten per Antippen, Tasten 1–4. Danach lässt sich die Pizza korrigieren. Die Modi ergänzen +/− und anschließend ×/÷. Die Schrift wird in passender Pixelgröße neu gerastert, mit größerer Mindestgröße und höherem Kontrast. Es gibt keine benotete Schulabgabe oder Online-Tutorverbindung.

## Aus Quellen erzeugen

Generierte `Content`, `Binaries`, `Intermediate` und `Saved` gehören nicht in Git. Mit UnrealBuildTool zuerst `BruchpizzeriaEditor Mac Development` bauen. Danach `UnrealEditor-Cmd Bruchpizzeria.uproject -unattended -ExecutePythonScript=Tools/create_level.py` ausführen (absolute Pfade verwenden); das erzeugt Material und Map. `Tools/update_lighting.py` aktualisiert eine bereits vorhandene Map gezielt. Nicht während eines laufenden Editors dieselbe Map verändern.

`Tests/run.sh` prüft den gemeinsam vom Spiel verwendeten Bruchkern. `GradeCrew.NativeKitchen.HudPointer` prüft Klickflächen einschließlich schwarzer Fensterränder; `MouseCutting` prüft echte Kamera-Projektion, Zeigerwege, sichtbare Stücke und Tellerübergabe. `GradeCrew.NativeKitchen.CookAndLearn` prüft im echten UE-PIE die Stationszustände, Achtel, pausierte Hilfe und Regressionen; es ersetzt keine echte Eingabe-/Geräteabnahme. `GradeCrew.NativeKitchen.VisualPreview` startet PIE und fordert `Reports/NativeKitchen.png` an. Die Bilddatei selbst prüfen, niemals den Teststatus als grafischen Qualitätsnachweis verwenden.

iOS-Querformat und Touch-Code sind vorbereitet. Ein signierter Handy-Build, Geräteperformance, Audio und die Nutzerabnahme sind noch offen. Nachweise und bekannte Fehlversuche: `Reports/verification.json`, `Reports/run-history.json`, `Production/HANDOFF.md`.

Für den direkten Mac-Start `Bruchpizzeria spielen.command` im Finder doppelklicken. Das normale Spielfenster ist für diesen Test fest in der Größe; schließen/minimieren bleibt möglich. Der tatsächliche Maus-Hardwaretest bleibt getrennt von Engine-Tests: CUA-Proxyklicks liefern hier eine unveränderte globale Zeigerposition und sind deshalb kein verlässlicher End-to-End-Beleg.
