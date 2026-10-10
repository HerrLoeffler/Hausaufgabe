# GC-GAMES-LERNINSEL-L1 — Spiel: Lerninsel

Parent-ID GC-GAMES-ESCAPE-VISUAL-01 erhalten; keine Expeditionarbeit.
Owner GC · Lerninsel · Gameplay & Integration, Chat 01a12568-0502-7831-9451-a7f8d91ce950.
Vorheriger Owner GC · Lerninsel-Zentrale (01a1183f-dad9-7640-8a82-23107c980d6e), jetzt koordinierend.
Übernahme 2026-10-10 UTC. Branch feature/lerninsel-ego-v1, bestehender Draft PR175, Ziel main. Status branch_only; keine Integration, Deploys, Geräteabnahme oder Production.

## Scope / Fachplan / Abnahme

1. Bestand inventarisieren und unverändert im eigenen Checkout sichern.
2. Checkpoint auf bestehendem Branch/PR pushen; lokale Dateien per Gitblob/SHA256 zuordnen.
3. Vorhandene portable und UE-Gameplay-Prüfungen durchführen. Vorschaukarte zusätzlich starten, echte Spielansichten und Kollision prüfen.
4. Nur tatsächlich reproduzierte Überlagerung/Kollision in Weltdateien minimal korrigieren; keine neue Welt/Level/Artproduktion oder Engine-Umbauten.
5. Frische Belege, Restpunkte und nächsten Schritt sichern.

## Bestand / Übernahme

Quellcheckout /Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/gradecrew-lerninsel-unreal bleibt read-only, samt ungesicherten Dateien.
Quell-Head 2496a85f995549b2a48710b2f40c8b71f6a32b5a; Remote 28a60a34695f6c147d9a3ee71633adb09414c32e. Unterschiedliche Historien aus früheren Connector-Sicherungen; kein Force-Push.
Eigenes Checkout /Users/martin/Documents/Codex/2026-10-10/gradecrew-lerninsel-integration/work/lerninsel-l1. Lokaler Klon ohne Hardlinks, 38 offene Lerninsel-Dateien kopiert: Production/L1/source-inventory.json. games/.DS_Store nicht übernommen; .blend1 lokal erhalten.
Prozessprüfung 10:43 UTC: kein UnrealEditor-Spiel-/Import-/Testprozess; Blender PID5200 unberührt. Alter Fachowner idle/koordinierend; keine andere aktive schreibende Lerninsel-Fachrolle gefunden. Andere Chats nicht angeschrieben.
Development Status Run38045027438, Job114192717956: PR175 draft, +17/-68; Überschneidung Design-PR173/.gitignore Web/Security bekannt. Gemeinsame Dateien nicht verändert. sources/ read-only.

## Frische Prüfungen / Grenzen

Tests/run.sh: 66 Regeln +78 Rätsel +7 Steuerung +24 Wasser +12 Fuchs +44 Katalog =231 erfolgreich. UE-/Vorschaukartenprüfung folgt; alte Reports bleiben Historie.
img2threejs auf Eignung geprüft: bestehende Karte/FBX/Gameplay werden integriert, keine Modellrekonstruktion in L1. Verwendet vorhandene Unreal-Werkzeuge. Keine neuen kostenpflichtigen Aufrufe, Versuchshistorie/Budget unverändert.

## TODO / Workstream

Diese Task und Production/L1 sind die fachliche dauerhafte Zuordnung. Bestehender Parent-/Primary-Branch bleibt. Gemeinsame Regelfiles besitzen GC-HOOKS-01; gezielter TODO-Nachtrag als Production/L1/TODO-OWNER-PATCH.md gesichert, keine alten gemeinsamen Dateisnapshots überschrieben. L2–L5 ungestartet.

## Nächster konkreter Schritt

Gesicherten Weltvorschau-Stand bauen und bestehende UE-Checks sowie echte Vorschaukamera-/Kollisionsprüfung ausführen.
