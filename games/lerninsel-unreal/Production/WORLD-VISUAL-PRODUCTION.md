# GC-GAMES-ESCAPE-VISUAL-01 — Ausbau der acht Gebiete

## Auftrag

Am 09.10.2026 bat Martin, die gesamte Ego-Spielwelt deutlich über den vorherigen Stand
anzuheben, den laufenden Fuchs zu reparieren und das Ergebnis detailliert auszubauen.
Seine eigene Einordnung der bisherigen Optik: 7/10. Die Arbeit bleibt auf dem
bestehenden Feature-Branch und verwendet ausschließlich lokale Blender-Assets; die
bisherige Charakterqualität wird nicht als Hyperrealismus ausgegeben.

## Geplanter Weltschnitt

`Tools/build_eight_district_world.py` ist ein deterministischer Blender-bpy-Aufbau für
eine zusammenhängende Insel von ungefähr 150 m entlang des vorhandenen Unreal-Spielwegs.
Er liest `Content/Art/LocalAssetsV2/Lerninsel_LocalAssets_v2.blend`, lässt diese Quelldatei
unverändert und soll eine separate .blend-Datei, einen FBX-Weltexport, eine Übersicht und
acht Augenhöhe-Ansichten erzeugen. Es werden keine bezahlten oder Cloud-Generatoren
aufgerufen. Die Gebiete verwenden wiedererkennbare Landmarken und farblich getrennte
Pflanzungen: Verbengarten, Satzdorf, Bruchterrassen, Beobachtungsküste, Heckenlabyrinth,
Spiegelgarten, Klangwald und Leuchtturm. Tor- und Rätsel-Kollisionen sollen beim
vorhandenen Unreal-Spiel bleiben; die neue Landschaft ist reine Darstellung.

Das ist ein lokaler Build-Entwurf, noch kein integrierter oder spielbarer Weltstand.
Koordinaten, Exportmaßstab, Überdeckung mit Rätselobjekten und Lesbarkeit aus Ego-Sicht
müssen nach einem erfolgreichen Blender-Lauf visuell geprüft werden. Die Gebiete 5–7
haben im aktuellen Prototyp noch keine fertigen Rätselsysteme; Landschaftsbau erzeugt
diese Aufgaben nicht automatisch.

## Fuchsbewegung

Der aktuelle Unreal-Fuchs ist ein statisches Sitzmesh, dessen Actor als Ganzes verschoben
wird. Das ergibt sichtbares Rutschen. Eine echte Reparatur braucht ein rigfähiges
Vierbeiner-Mesh, Gewichte und mindestens einen zyklischen Schrittgang; der versteinerte
Fuchs muss als separate ruhende Variante erhalten bleiben. Ein Rig mit wenigen Clips
(Aufwachen, Gehen, Schnuppern/Leine lösen, Zurücktreten) ersetzt 100 Einzelbilder.
Im aktuellen Durchlauf wurden **noch kein Rig und keine Laufclips erstellt**; der
Buildentwurf ändert die Fuchslogik nicht.

## Tatsächliche Prüfung und Blocker

- `Tools/build_eight_district_world.py` ist syntaktisch geprüft (Python `py_compile`).
- Lokales Blender ist 5.2.2. Der installierte CLI-Build stürzt in diesem Arbeitskontext
  schon bei der GPU-/Metal-Initialisierung ab. Ein Lauf in der verbundenen Blender-MCP-
  Instanz begann den Szenenaufbau, brach beim bisherigen globalen Join ab und trennte
  anschließend den Blender-MCP-Server.
- Der globale Join wurde aus dem Skript entfernt; der Export soll stattdessen modulare
  Meshes für den Unreal-FBX-Importer ausgeben. Diese Änderung wurde **noch nicht erneut
  in Blender ausgeführt**.
- Es existiert daher noch kein bestätigter `Lerninsel_Achtgebiete.blend`, FBX-Export,
  Preview-Render oder Unreal-Import aus diesem Ausbau. Nichts hiervon ist visuell
  freigegeben. Die Laufanimation fehlt weiterhin.
- Blender-MCP-Telemetrie meldete vor dem Absturz `false` (ausgeschaltet).

## Nächster konkreter Schritt

Blender-MCP in der aktiven Blender-Instanz neu verbinden und dort die korrigierte
Builddatei ausführen. Erst nach erfolgreichem Export die Übersicht und mindestens die
Verbengarten-/Fuchszone und Bruchterrassen-Renders tatsächlich ansehen, Fehlplatzierungen
beheben, anschließend die acht Augenhöhe-Ansichten prüfen. Danach FBX in Unreal importieren,
mit vorhandenem Boden/Rätseln überlagern und eine Laufansicht im Spiel aufnehmen. Für den
Fuchs zuerst die Laufversion riggen und den Zyklus in Unreal auf dem tatsächlichen Laufweg
prüfen, bevor die restlichen Weltzonen als fertig markiert werden.

## Branch- und Integrationsstand

Task-ID bleibt `GC-GAMES-ESCAPE-VISUAL-01`, Branch `feature/lerninsel-ego-v1`.
Diese Änderungen sind lokale Zwischenarbeit. PR 175 wurde durch diesen Lauf nicht
aktualisiert; es gab keinen Push, Merge, CI-Lauf oder Deploy. Production bleibt unberührt.
