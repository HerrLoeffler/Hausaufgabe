# GC-GAMES-ESCAPE-VISUAL-01 — neues Fuchsdesign im Spiel

09.10.2026: Auf ausdrücklichen Auftrag eingebaut. Der detaillierte lokale
Blender-Fuchs liegt als StaticMesh `/Game/Art/FoxV2/SM_Fox_Design` vor und ersetzt
die sichtbare prozedurale Figur in der tatsächlichen Runtime. Die alten Teile
bleiben unsichtbar als vorhandene Controller-/Fallback-Struktur erhalten.
Materialslots bekommen dynamische Farben, die beim richtigen Satz von Stein
zur lebenden Farbpalette übergehen. Der Seilkontakt benutzt den Mundpunkt des
neuen Designs. Auslöser, Zeitfolge und Torfreigabe bleiben im vorhandenen Controller.

`Neuen Fuchs ansehen.command` startet das normale Spiel mit `-FoxDesignPreview`.
Die Vorschau stellt die Figur farbig am Ruheplatz dar und setzt den Spieler auf
eine geprüfte freie Blickposition. Sie verwendet einen eigenen SaveSlot; die
normalen Fortschrittsdaten werden von der Vorschau nicht überschrieben.
WASD und Maus erlauben das Betrachten. Der normale Lerninsel-Starter zeigt
ebenfalls das neue Modell im vorhandenen Rätselablauf.

Geprüft: neuer Editor-Build erfolgreich; `GradeCrew.Lerninsel.Fox` erfolgreich
mit 0 Fehlern und 2 bekannten Mac/iOS-Hilfsprogramm-Warnungen. Die Prüfung lädt
das importierte Modell tatsächlich und fotografiert Statue, Erwachen, Weg,
Seilkontakt, Ziehen, offenes Tor und direkte Designansicht. Die PNGs unter
Reports/Fox-*.png stammen aus dem laufenden Unreal-Viewport.

Importskript `Tools/import_fox_design.py` schrieb das Asset erfolgreich. Der
Import-Editor endete anschließend mit Fehlerstatus; der frische Editor konnte
das gespeicherte Asset laden, darstellen und die Fuchsprüfung abschließen.
Der Importprozess ist daher nicht als fehlerfrei bezeichnet. Die initiale
relative Projektpfadangabe wurde vor dem tatsächlichen Import korrigiert.

**Bewegungsgrenze:** Das neue Modell ist eine statische Sitzfigur, kein neu
geriggter Vierbeiner. Im Ablauf wird die ganze Figur entlang der bestehenden
Route bewegt. Beine, Maul und Schwanz werden im importierten Mesh noch nicht
separat deformiert. Ein vollständiges Aufstehen/Laufen/Kauen ist damit nicht
fertig. Dieser Einbau erfüllt den konkreten Design-Test; eine fertige neue
Charakteranimation wäre eine falsche Behauptung.

Detailmesh ca. 295k Dreiecke, Asset ca. 8,6 MiB; Desktop-Design-Test, kein
belegtes mobiles Budget. Die 44 übrigen Blender-Assets wurden durch diesen
Einbau nicht importiert. Keine Cloud-Generierung, kein Deployment und keine
Production-Veränderung. Status lokal / branch_only. GitHub-Push bleibt wegen
fehlender HTTPS-Anmeldung blockiert, bestehender Remote-Branch nicht überschrieben.

Nächster Schritt: Skelett und Gewichte für Aufstehen/Lauf/Seilzug ausarbeiten
und die Figur im vorhandenen Ablauf deformieren, danach mobile Detailstufen prüfen.
