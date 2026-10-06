# Blender → Unreal: Assets reproduzierbar produzieren

Stand: 06.10.2026 · GC-GAMES-PIPELINE-01 · Ergänzt [GREAT_GAMES_WORKFLOW.md](GREAT_GAMES_WORKFLOW.md).

Übernommen aus dem vorhandenen [Blender-Hero-Plan in PR143](https://github.com/HerrLoeffler/Hausaufgabe/blob/docs/gc-design-05-reference-plan-20261006/docs/superpowers/plans/2026-10-06-gradecrew-blender-hero.md): bearbeitbare Quellen, feste Figurenidentität, versionierte Skripte, lokale Verbindung, ein Schreiber je Szene, Wiederöffnungsnachweis, begrenzte Korrekturrunden und getrennte Kosten. Hero-spezifische Video-, Kamera- und Layoutregeln gelten nicht automatisch für ein Echtzeitspiel.

## 1. Werkzeugnachweis vor dem ersten Asset

Die im Games-Text behauptete Unreal-Installation ist in diesem Auftrag nicht lokal verifiziert. Vor Produktion tatsächliche Unreal-/Blender-Version, Betriebssystem, SDKs, Exporter, Plugins und Projektpfade erfassen. Keine alten Versionsvorschläge blind installieren. Versionen für einen Produktionsabschnitt fixieren; Upgrades separat prüfen.

Blender-MCP ist optional. [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender) ist ein Community-Projekt, keine offizielle Blender-Komponente. Die vorhandene Hero-Recherche ersetzt keine aktuelle Prüfung des konkret installierten Addon-/Server-Paars. Vor Aktivierung Commit, Änderungen, Ausführungsmöglichkeiten, Netzwerkziele und optionale externe Dienste prüfen. Lokale Bindung, keine unnötigen Rechte/Secrets; unbekannte Skripte nicht ungeprüft ausführen. Kein automatischer Assetkauf oder bezahlter Generierungsdienst.

Erster Funktionsnachweis: Wegwerf-Szene öffnen → Objekt gezielt ändern → Szene/Vorschau auslesen → speichern → schließen → erneut öffnen. Nur die eigene Collection verändern. Fallback sind versionierte Blender-Python-Skripte. MCP ist Steuerung, kein dauerhafter Speicher und kein Qualitätsnachweis. Unreal-Automatisierung separat prüfen; eine Blender-Verbindung steuert nicht automatisch Unreal.

## 2. Asset bis zur Engine prüfen

1. Referenzblatt: Silhouette, Maßstab, Farben, Materialstil und benötigte Animationen. Bei Crew-Figuren kanonische Identität erhalten; unbekannte Ansichten als Entwurf markieren.
2. Blockout: eine Figur/ein repräsentatives Objekt und ein kleiner Spielbereich. Kamera und Kollisionsgrößen früh testen.
3. Produktion: saubere Geometrie, UVs, Echtzeittexturen, Rig, benötigte Animationen, Kollisionsmesh und passende Detailstufen. Keine eingebrannten Schatten oder unbrauchbaren Gelenke als final akzeptieren.
4. Exportsmoke: Meter-/Zentimeter-Umrechnung, Achsen, Pivot, Rotation/Skalierung, Normalen, Skelett und Animationsdauer anhand eines 1-m-Testwürfels und einer Testbewegung prüfen. Erst nach bestandenem Import das Exportpreset festschreiben.
5. Materialtransfer: Blender-Node-Netze nicht als automatisch identische Unreal-Materialien behandeln. Geeignete PBR-Texturen exportieren/baken und Material in Unreal kontrollieren. Unter tatsächlichem Spielllicht beurteilen, nicht nur im Blender-Render.
6. Reimportprobe: Quelle ändern und neu importieren; keine verlorenen Materialzuordnungen, doppelten Assets oder zerstörten Animationen. Danach in einem paketierten Testbuild prüfen.

FBX ist der erste zu prüfende Austauschweg für Meshes/Skelett/Animation; Epic dokumentiert FBX 2020.2 für seine Importpipeline. Das ist keine Zusage, dass jedes Blender-Exportergebnis ohne Prüfung passt. glTF/USD nur für einen begründeten, getesteten Teilweg, kein pauschaler Formatmix. [Epic: FBX Content Pipeline](https://dev.epicgames.com/documentation/unreal-engine/fbx-content-pipeline)

## 3. Ablage und Übergabe

Geplante Struktur bei späterer Implementierung, jetzt nicht angelegt:

```text
games/great-games/             Unreal-Projekt, Config, Source, Content
art/great-games/<world>/       Blender-Master und Exportskripte
contracts/great-games/        Versionierter Lernschnittstellenvertrag
reports/great-games/<build>/   Test-/Geräte-/Qualitätsnachweise
```

Große `.blend`, `.uasset`, `.umap` und Texturen nur in geprüfter Git-LFS-/Artefaktablage; keine Binärflut in normales Git. Vorher Kosten/Verfügbarkeit und Wiederherstellbarkeit prüfen. Generated, Intermediate, Saved und lokale Caches nicht als Produktionsquellen sichern. Pro Asset Manifest mit ID, Revision, Autor/Herkunft, Nutzungsrechten, Quelldatei/Hash, Exportdatei/Hash, Werkzeugversionen, Preset und abhängigen Texturen. Kostenpflichtige oder fremde Assets nur mit belegter Lizenz und freigegebenem Erwerb.

Ein Autor je binärer Szene/Map; Aufgaben nach getrennten Assets/Levels aufteilen. Vor langen Exporten speichern und konkreten Lauf dokumentieren. Nach Abbruch erst Prozess/Outputs prüfen und nur fehlende Schritte fortsetzen. Der Nachfolger erhält Task-ID, Branch, Hashes, Quellen, letzte bestandene Prüfung und genau den nächsten Schritt.

## 4. Späterer Pilotauftrag

Erst mit Martins ausdrücklichem Spiel-Umsetzungsauftrag:

- [ ] Zielgeräte und native Verteilung/Browseranforderung entscheiden; Werkzeugnachweis sichern.
- [ ] Kleinen Unreal-Build auf Mac und schwächstem vereinbartem Schulgerät starten; Eingaben und Frametimes messen.
- [ ] Ein Blender-Asset inklusive Animation exportieren, importieren, ändern und reproduzierbar reimportieren.
- [ ] Eine originale Amazonas-Interaktion inklusive Matsch-/Lernverhalten als Referenz auswählen und mit lokalen Testdaten umsetzen.
- [ ] Versionierten Lernadapter gegen bestehende Backend-Verträge spezifizieren und getrennt testen.
- [ ] Paketierten Referenzabschnitt technisch, visuell und spielerisch abnehmen; erst danach Ausbau planen.

Heute wurden weder diese Schritte ausgeführt noch Unreal/Blender installiert, ein Spiel migriert oder ein Deployment gestartet.
