# Lerninsel – Weltprototyp V1

## Dateien

- `Lerninsel_World_Prototype_V1.blend` – eigenständige Blender-Datei mit der Szene „Lerninsel – Weltprototyp V1“.
- `Export/Lerninsel_World_Prototype_V1.fbx` – FBX-Quelle für den Unreal-Import, ohne Kamera und Lichter.
- `SM_Lerninsel_World_Prototype_V1.uasset` – in Unreal importiertes statisches Weltmesh samt zugehörigen importierten Materialien.
- `Previews/Lerninsel_World_Prototype_V1_Overview.png` – Übersichtsrender der Insel.

## Aufbau

Die längliche Insel zeigt acht Ortsmarken entlang eines hellen, geschwungenen Weges: Verbengarten, Satzdorf, Bruchterrassen, Beobachtungsküste, Heckenlabyrinth, Spiegelgarten, Klangwald und Leuchtturm. Verwendet werden lokale, bereits vorhandene Baum-, Busch-, Blüten-, Fels- und Materialsets. Das Messbechergebiet hat drei blaue Wasserbecken mit Zehntelmarken. Die Szene umfasst rund 1.800 Weltobjekte; die wiederholten Naturmodelle teilen in Blender ihre Mesh-Daten, damit die Arbeitsdatei klein bleibt.

## Unreal-Vorschau

Die FBX wurde in UE 5.8.3 als statisches Mesh importiert und in der separaten Karte `/Game/Maps/Lerninsel_Weltvorschau` platziert. Zum Spielen im Projektordner `Lerninsel Weltvorschau starten.command` doppelklicken. Diese Karte baut zusätzlich die vorhandenen vier interaktiven Haupt-Rätsel auf und verwendet einen eigenen Speicherstand `LerninselWorldArtPreviewV1`; der normale Lerninsel-Fortschritt bleibt davon getrennt.

## Stand und Grenzen

Dies ist ein visueller Welt-Blockout zur Prüfung von Maßstab, Farbverteilung und Routenführung. Der Mesh-Import und die Vorschaukarte sind angelegt. Die Insel ist rein visuell, ohne Kollision. Die bisherige C++-Spielwelt baut ihre Rätsel zusätzlich auf; Rätselobjekte, Tore und Wege sind noch nicht an die acht Blender-Gebiete gekoppelt. Die ersten vier vorhandenen Rätsel sind interaktiv; für Gebiete fünf bis acht fehlen noch Aufgaben. Die Karte wurde im Unreal-Spielmodus gestartet, aber noch nicht mit einem vollständigen Kinder-Test oder einer visuellen Abnahme in der Zielansicht geprüft. iPad-/Browserleistung und Spielbarkeit sind nicht getestet. Fuchs-Rig und Geh-Animationen sind nicht Teil dieses Weltprototyps.

## Lokal öffnen

In Blender **File → Open** wählen und `Lerninsel_World_Prototype_V1.blend` öffnen. Die ursprüngliche Datei `LocalAssetsV2/Lerninsel_LocalAssets_v2.blend` wurde nicht überschrieben. Für einen erneuten Import kann `Tools/import_world_preview.py` im Unreal-Editor Python-Umfeld ausgeführt werden. Der Import wird in `/Game/Art/LerninselWorldV1` abgelegt; die Vorschaukarte liegt getrennt unter `/Game/Maps/`.
