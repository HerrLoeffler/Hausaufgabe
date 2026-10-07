# Bruchpizzeria – native Unreal-Küche

Task GC-GAMES-PIZZA-01. Unreal 5.8.3, eigener C++-Spielcode und originale prozedurale 3D-Objekte. Keine zusätzliche Spielbibliothek. Lokaler Entwicklungsstand; Grafik-, Spielgefühl- und mobile Geräteabnahme sind offen.

## Öffnen und spielen

`Bruchpizzeria.uproject` im installierten Unreal Editor öffnen. Lokale Map `/Game/Maps/Pizzeria` ist vorhanden. Play starten, dann **Los kochen** bzw. E drücken. WASD/Pfeile bewegen, E benutzt die nahe Station, Leertaste sprintet, X legt ab. Links ist ein Touch-Stick, rechts die Aktionen. Q wechselt den Modus für neue Bestellungen.

Teig → Tomate und Käse → optional Pilze → Ofen → Schneidebrett → Portion → passender Gast. Beim Schneiden von Rand zu Rand durch die Mitte ziehen, danach Stücke antippen. 1–4 setzen die vier Schnittwinkel als Desktop-Hilfe. Achtel erfordern vier Durchmesser. Ungleiche Stücke zählen nicht als korrekte Brüche.

Falsche Portionen oder Zutaten pausieren die Küche. Die Lernhilfe führt durch einzelne Schritte; Antworten per Antippen, Tasten 1–4 oder D-Pad/A. Danach lässt sich die Pizza korrigieren. Die Modi ergänzen +/− und anschließend ×/÷. Es gibt keine benotete Schulabgabe oder Online-Tutorverbindung.

## Aus Quellen erzeugen

Generierte `Content`, `Binaries`, `Intermediate` und `Saved` gehören nicht in Git. Mit UnrealBuildTool zuerst `BruchpizzeriaEditor Mac Development` bauen. Danach `UnrealEditor-Cmd Bruchpizzeria.uproject -unattended -ExecutePythonScript=Tools/create_level.py` ausführen (absolute Pfade verwenden); das erzeugt Material und Map. `Tools/update_lighting.py` aktualisiert eine bereits vorhandene Map gezielt. Nicht während eines laufenden Editors dieselbe Map verändern.

`Tests/run.sh` prüft den gemeinsam vom Spiel verwendeten Bruchkern. `GradeCrew.NativeKitchen.CookAndLearn` prüft im echten UE-PIE die Stationszustände, Achtel, pausierte Hilfe und Regressionen; es ersetzt keine echte Eingabe-/Geräteabnahme. `GradeCrew.NativeKitchen.VisualPreview` startet PIE und fordert `Reports/NativeKitchen.png` an. Die Bilddatei selbst prüfen, niemals den Teststatus als grafischen Qualitätsnachweis verwenden.

iOS-Querformat und Touch-Code sind vorbereitet. Ein signierter Handy-Build, Geräteperformance, Audio und die Nutzerabnahme sind noch offen. Nachweise und bekannte Fehlversuche: `Reports/verification.json`, `Reports/run-history.json`, `Production/HANDOFF.md`.
