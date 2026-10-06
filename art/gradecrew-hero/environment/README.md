# Blender-Verbindungsnachweis – GC-DESIGN-05

Blender 5.2.2 LTS (Apple Silicon) und MCP for Blender 2.1.8, Quellcommit `34b7bd277fff75a693cde78930b4359478958a01`, wurden lokal praktisch geprüft. Die offizielle Download-Prüfsumme stimmt. `toolchain-proof.json` enthält Ergebnisse und Dateihashes; `requirements-lock.txt` die installierten Python-Pakete.

`connection-proof.png` zeigt ausschließlich die technische Testszene. Es ist kein Hero-Entwurf. `connection-proof.blend` ist die tatsächlich gespeicherte und in einem separaten Prozess wieder geöffnete Quelle. Objekt GC_ConnectionProof hatte nach Wiederöffnung x=0.35.

## Lokale Werkzeuge

Die Werkzeuge liegen im übergeordneten Projektordner unter `.gradecrew-tools/`: Blender-App, eigener Python-venv und unveränderter Addon-Quellstand. Keine systemweite Installation oder globale Codex-Konfiguration geändert. Start des eigenen GUI-Testprozesses mit `--factory-startup --python art/gradecrew-hero/environment/start_mcp_session.py`; der Bootstrap erwartet diese Repository-Struktur. Alle Befehle müssen mit tatsächlichen absoluten Werkzeugpfaden ausgeführt werden.

`start_mcp_session.py` lädt nur für diese Sitzung den festgelegten Addon-Stand, bindet ausschließlich Loopback mit einem vom Betriebssystem vergebenen Port und unterbindet dessen automatische Updateprüfung. Ein frischer separater Prozess verhindert Eingriffe in eine vorhandene Benutzerdatei. Danach führt `verify_mcp.py` über das echte MCP-Protokoll Szenenabfrage, Objektänderung, Speichern und Rendern aus. Safe Mode und deaktivierte Telemetrie werden am MCP-Server gesetzt. Der Test erzeugt Dateien nur in diesem Nachweisordner.

Die Verbindung wurde über einen lokalen Python-MCP-Client nachgewiesen. Sie ist nicht als dauerhaftes natives Tool in dieser bereits laufenden Codex-Sitzung registriert. Produktionsskripte können Blender unabhängig davon direkt reproduzierbar steuern.

## Beobachtete Umgebungsgrenze

Die Standard-Sandbox blockierte die lokale Socket-Verbindung und führte beim separaten Blender-Dateiöffnen zu einem Prozessabbruch. Eng begrenzte genehmigte Ausführung bestand beide Prüfungen. Das ist kein Modellierungsfehler und kein Grund für einen KI-Modellwechsel. Keine unbekannten Provider-Aufrufe wurden wiederholt.

## Sitzungsisolation

Der Bootstrap schreibt erst nach erfolgreichem Bind eine lokale Sitzungsdatei mit Port und zufälliger Kennung. Der Client liest sie und prüft die Kennung sowie den Namen der Testszene unmittelbar im selben Blender-Code vor jeder Änderung. Ein absichtlich falscher Wert wurde praktisch zurückgewiesen. So wird kein älterer Prozess auf einem festen Port verändert. Die lokale Sitzungsdatei wird nicht versioniert.

## Geprüfte Aufrufe (vom Repository-Ordner aus)

Die Werkzeuge werden mit eigenen Pfaden angesprochen; keine Abhängigkeit von einem globalen `blender`-Kommando:

```sh
../.gradecrew-tools/apps/Blender.app/Contents/MacOS/Blender --factory-startup --python art/gradecrew-hero/environment/start_mcp_session.py
../.gradecrew-tools/mcp-venv/bin/python art/gradecrew-hero/environment/verify_mcp.py
../.gradecrew-tools/apps/Blender.app/Contents/MacOS/Blender -b art/gradecrew-hero/environment/connection-proof.blend --python-expr "import bpy; o=bpy.data.objects['GC_ConnectionProof']; assert abs(o.location.x-0.35)<0.0001; assert bpy.context.scene.name=='GC_ConnectionProofScene'; print('GC_REOPEN_OK')"
```

Den ersten Aufruf als separate GUI-Sitzung laufen lassen, den zweiten aus einer anderen Ausführung starten. In der Codex-Sandbox sind für lokalen Socket/GPU-Zugriff eng begrenzte Freigaben nötig. Nicht einfach die Skripte auf eine fremde offene Szene anwenden. `reopen-proof.txt` enthält den tatsächlichen unabhängigen Wiederöffnungsnachweis.
