# GC-GAMES-ESCAPE-VISUAL-01 — lokale Blender-Produktion V2

## Auftrag und belegter Stand, 09.10.2026

Martin möchte zuerst ohne Rodin arbeiten. Cloud-Generierung ist nur bei nachweislich
kostenlosem Restguthaben erlaubt. Dieser Durchgang enthält **keine Generatoranfrage**,
keinen Bild-Upload und keinen neuen Verbrauch von Rodin-/Bildgenerierungs-Credits.
Die Arbeit benötigt weiterhin die normale Codex-Nutzung und lokale Rechenzeit.
Die vorherige Rodin-Anfrage wurde vor Ausführung abgelehnt; keine Job-ID erhalten.
Die frühere Bildhistorie (26 Aufrufe / 385 Motive laut Übergabe) wird nicht zurückgesetzt.

Werkzeug: tatsächlich verbundener lokaler Blender MCP 1.8 / Protokoll 13,
Blender 5.2.2 LTS. Alle Modelle wurden mit bpy über den MCP gebaut, nach mehreren
echten Renders korrigiert und als Blender-Geometrie gespeichert. Die ursprünglichen
167 Szenenobjekte sind erhalten. Sie sind für die neue Einzelmodell-Prüfkamera
vom Render ausgeschlossen; neue Sammlungen tragen LI_Local_* bzw. LI_SM_*.

Neue Quelle: `Content/Art/LocalAssetsV2/Lerninsel_LocalAssets_v2.blend`.
Die Live-Szene wurde unter diesem versionierten Pfad gespeichert. Szene-Zugangsdaten
werden beim Speichern vorübergehend geleert und anschließend nur im laufenden
Blender wiederhergestellt; keine Schlüssel in Exporten oder Dokumentation.

## Umfang

- Ein sitzender Fuchs als detaillierte lokale Modellstudie: zusammenhängender
  Voxel-Sculpt für Körper, Beine und verjüngten Kopf; Ohren, Augen, Nase und Schwanz;
  geometrische Fellbüschel. Oberfläche und Gesicht entsprechen der Vorlage noch
  nicht vollständig. Der Fuchs ist **nicht photorealistisch und nicht visuell abgenommen**.
- Die Studie hat 295.556 Dreiecke und ist ein Arbeitsmodell, kein mobiles Runtime-Budget.
- Zwei bewusst glattere LOD-Studien mit 6.000 und 3.000 Dreiecken. Das dichte Fell
  wurde für diese Varianten weggelassen; es ist noch nicht in Normalmaps übertragen.
- Eine Steinvariante mit 6.000 Dreiecken. Sitzhöhe nach Exportskalierung ca. 0,928 m.
- 44 weitere Assetgruppen, insgesamt 38.360 sichtbare Dreiecke: 1-Liter-Messbecher,
  zwei Eimer, 100-/200-ml-Zulauf, 100-ml-Ablauf, Becken, Torbogen, Tür, Riegel,
  Seilschlaufe, Zaun, Mauer, Wortsteine, Terrainstücke, drei Felsen, drei Büsche,
  drei Bäume, Gras, Blumen, Schild, Brücke, Wegstücke, Muschel, Treibholz,
  Laterne, drei Perspektivbögen, Bodenmarkierung und vier Logikbausteine.
- Kein zusätzlicher humanoider Spieler: Die vereinbarte Spielperspektive ist Ego.

Der Messbecher hat eine zylindrische Wassersäule von 0,16 m und Innenradius
sqrt(0,001 / (pi * 0,16)) m. Die Marken liegen von 1/10 bis 10/10 in gleichen
16-mm-Abständen; die Wasserfläche steht auf 3/10. Beschriftung **1 L**, nicht 8 L.
Der bewusst leicht kleinere Wassermesh-Radius vermeidet Z-Fighting mit der Innenwand.
Der Gameplay-Füllstand ist weiter eine Aufgabe der Unreal-Logik.

Wortsteine sind vollständige Steine. Für die Auswahl ist der Materialtausch des
ganzen Steins vorgesehen, ohne Häkchen. Türursprung ist die linke Scharnierachse;
Riegel und Seilschlaufe sind separate Assets. Kollisionsquader sind bewusst einfach;
der Torbogen verwendet getrennte Pfeiler und Bäume nur Stammkollisionen.

## Nachweise

- `Tools/build_local_fox_v2.py`: Quelle der lokalen Fuchsmodellierung.
- `Tools/build_local_kit_v2.py`: Quelle der 44 Assetgruppen mit UVs und FBX-Export.
- `Tools/review_local_assets_v2.py`: tatsächliche Ansichten, LOD-Export, Geometrieaudit,
  Speichern ohne Szene-Credentials. Bereits bestehende Sammlungen werden von den
  Buildskripten nicht stillschweigend gelöscht; Wiederaufbau verlangt bewusste Auswahl.
- `asset_manifest.json`, `fox_manifest.json`: reale Zählungen und Exportdateien.
- `geometry_audit.json`: 398 neue Meshobjekte; UVs vorhanden, keine negativen
  Skalierungen. Offene Kanten ausschließlich an bewusst zweiseitigen Blattflächen.
  Das ist **kein** Nachweis gegen alle Durchdringungen oder für Deformationsqualität.
- `Previews/`: reale Vorder-, Seiten- und Dreiviertelrenders für alle 44 Gruppen
  und die vier Fuchsausgaben. `Catalogue_01.png` bis `Catalogue_04.png` sind
  Montagen dieser Blender-Renders, keine KI-Ersatzbilder.
- `Fox_Comparison.png`: Detailstudie, LOD0, LOD1 und Stein aus denselben Ansichten.
- `Export/`: 48 FBX-Dateien (44 Kitgruppen und vier Fuchsausgaben).
- Zusätzlich vier Rückansichten des Fuchses: insgesamt 148 einzelne Prüfrenders.
- `roundtrip_validation.json`: unabhängiger Blender-Prozess öffnete die finale
  Datei und importierte Fuchs-LOD0, Messbecher und Torbogen erfolgreich zurück.
  Messbecherhöhe 0,181 m, Fuchshöhe 0,9284 m; berechnete Kapazität 1 Liter.
  Fuchs-LOD0 hat nach FBX-Rückimport 5.992 statt 6.000 Dreiecke. Der anfängliche
  exakte Zähltest schlug fehl; die Differenz bleibt ausdrücklich als Exportwarnung
  erhalten. Die erfolgreichen Prüfungen belegen Maßstab/Budget, keinen verlustlosen
  Topologie-Roundtrip. Quelle hat keine Dreiecke mit Fläche unter 1e-12 m²;
  die Differenz wurde nicht als erwiesene Degeneratbereinigung ausgegeben.
  Der erste CLI-Start im Sandbox-Kontext stürzte vor dem Test ab; separat freigegebener
  lokaler Prozess funktionierte. Python-Skriptfehler erhalten mit --python-exit-code 1
  einen Fehlerstatus; der finale Prüflauf endete mit Status 0.

## Fachliche Werkzeugentscheidung

`docs/games/IMG2THREEJS_AND_ASSET_QUALITY.md` vom aktuellen main wurde gelesen.
img2threejs wurde auf Eignung geprüft, hier aber nicht ausgeführt: Martin verlangt
ausdrücklich Bearbeitung der aktiven Blender-Szene und FBX-Quellen für Unreal.
Ein zusätzlicher Three.js-Rekonstruktions-/Exportweg würde eine zweite Modellquelle
erzeugen. Verwendet wird stattdessen der direkte Blender-bpy-Weg mit eigenen
Mehrwinkelrenders. Die Blender-Körperstudie ist kein Rig und kein Animationsnachweis.

## Offene Qualitätsarbeit und Grenzen

Der lokale Versuch verbessert die frühere primitive Figur, trifft aber noch nicht
die freundliche, klare Fellmodellierung des Referenzfuchses. Fell ist teilweise
zottelig, Ohren relativ geometrisch, der Gesichtsausdruck noch zu starr. Die
reduzierten Modelle haben deutlich weniger Oberflächendetail. Diese Abweichungen
dürfen nicht durch den höheren Meshumfang oder die Zahl der Exporte verdeckt werden.

Kein Armature-Rig, keine Gewichte, keine Aufsteh-/Lauf-/Seilzuganimation für das neue
Modell. Keine neuen Unreal-Imports, keine Ersetzung der Runtime-Geometrie, kein
iPad-/Browserlauf und kein Deployment. Der vorhandene spielbare Prototyp bleibt
auf seinem vorherigen Stand. FBX-Materialnamen und Vertexgeometrie sind vorhanden;
Unreal-Transparenz für Messbecher/Wasser muss dort eigens eingerichtet und geprüft werden.

Status: lokale Asset-Studie / branch_only. Keine visuelle Nutzerabnahme.
Nächster Schritt: den Fuchskopf und das Fell anhand der gesicherten Ansichten
weiter verfeinern; erst danach Rig und Unreal-Integration.

## Branch und Wiederaufnahme

Bestehende Task-ID und lokaler Branch `feature/lerninsel-ego-v1` bleiben erhalten.
Lokaler Ausgangscommit c6cbbeb; frisch geladener main 8698525. Der bestehende Remote-
Featurebranch steht bei 28a60a3 und hat eine andere/squashte Historie. Daher kein
Force-Push und keine Behauptung, PR175 enthalte bereits diese Dateien. Neue Dateien
dieses Durchgangs werden separat gesichert; ältere uncommittete Runtime-/Artänderungen
und `games/.DS_Store` gehören nicht zu diesem Checkpoint.

Development-Status wurde ausgeführt; der Teilklon hat nicht alle Workstream-Refs,
und der PR-API-Abgleich hat keine GitHub-Tokenumgebung. Seine fehlenden Branches
sind eine Auditgrenze, kein Beleg für gelöschte Baustellen. Dieser Chat schreibt
nur neue Asset-V2-Dateien und den zugehörigen Dokumentationsnachtrag.


Sicherungsnachtrag: Asset-Checkpoint 8940538 lokal committed. Push nach checkpoint/lerninsel-local-assets-v2 am 09.10.2026 fehlgeschlagen: Git konnte den HTTPS-Benutzernamen nicht interaktiv beziehen. Kein Remote-Checkpoint bestätigt, kein PR aktualisiert. Die Dateien und der Commit sind lokal erhalten.
