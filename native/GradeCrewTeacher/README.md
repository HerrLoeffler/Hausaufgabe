# GradeCrew Teacher – hybride iPhone-/iPad-App

Die SwiftUI-/WKWebView-App nutzt die vorhandene GradeCrew-Webplattform mit persistenter Web-Anmeldung. Dashboard, Tests, Editor, Remy, Emmi und Games bleiben dort gepflegt. Native Fähigkeiten ergänzen diese Abläufe.

## Stand und lokale Entwicklung

Kanonischer App-Branch: feature/shared-gradecrew-design-system. 0.1.16 (Build33) wurde auf dem iPhone zweimal schnell und erfolgreich mit Remy verwendet. 0.1.17 (Build34) ergänzt Crew und Logo; die Geräte-Rückmeldung bestätigt den ersten Entwurf und fordert echte Laufbewegungen und engeres Anlehnen.

**0.1.18** verwendet je20 erzeugte transparente Lauf-/Anlehnframes für Coco, Remy, Emmi und Wilma. Ein gemeinsamer Startzeitpunkt hält die gesamte dekorative Sequenz auf maximal einer Sekunde; Anmeldung und Navigation warten nicht darauf. Die Timeline hat keine weiteren Einträge nach dem Abschluss, die letzte Pose bleibt stehen. Bei „Bewegung reduzieren“ wird direkt die Endpose gezeigt. PNG-Atlanten werden vor der Nutzung in isolierte Zellen verpackt und auf Beschnitt, echte Transparenz und unterschiedliche Frames geprüft. Coco folgt der aktuellen plüschigen Staging-Referenz. Die Remy-Karte zeigt eine neue Pose mit zum Bildschirm gerichtetem Mikrofon und den Text „Test kurz einsprechen“.

Alle neuen Bilder liegen im gemeinsamen Asset-Manifest. Das bestehende GC-Logo sowie Sprachaufnahme, Testformular und Übermittlung bleiben unverändert. GitHub-CI, TestFlight-Upload, Apple-Verarbeitung und Geräteabnahme werden separat dokumentiert; siehe [TESTFLIGHT.md](TESTFLIGHT.md).

```bash
python3 native/GradeCrewTeacher/prepare_testflight_assets.py
python3 native/GradeCrewTeacher/generate_project.py
open native/GradeCrewTeacher/GradeCrewTeacher.xcodeproj
```

Xcode-Scheme `GradeCrew`, Bundle-ID `de.gradecrew`, iOS/iPadOS 16.0, Gerätfamilien iPhone und iPad. Generiertes Projekt und AppIcon sind lokale Build-Ausgaben. Das Icon stammt aus dem zentralen GradeCrew-SVG; Quick Look wird für die kanonische Build-Pipeline verwendet. Die Codex-Sandbox kann Quick Look und SwiftUI-Compiler-Erweiterungen blockieren; reguläre Xcode-Builds und CI getrennt prüfen.

## Dateibrücke

Nur die ausgewählte HTTPS-Staging-/Preview-Seite im Hauptframe erhält native Aktionen. Andere Webseiten, Firebase-Auth-Seiten, andere Preview-Ursprünge und Unterframes dürfen die Schnittstelle nicht verwenden.

```javascript
const capabilities = await window.GradeCrewNative.capabilities();
const result = await window.GradeCrewNative.shareFile(
  new Blob(['Name;Punkte\nBeispiel;10'], {type: 'text/csv'}),
  'Ergebnisse.csv'
);
// result.status: 'completed' oder 'cancelled'
const diagnostics = await window.GradeCrewNative.diagnostics();
```

PDF, CSV, UTF-8-Text, JSON, PNG und JPEG bis 12 MiB; Endung und MIME müssen passen. Keine Datei- oder Remote-URL als native Dateiquelle. Die Datei landet temporär im App-Sandbox-Verzeichnis und wird nach Abschluss/Abbruch aufgeräumt. Eine Teilen-Aktion gleichzeitig, mit iPad-Popover. Fehler werden als Promise-Fehler zurückgegeben.

Vorhandene gleichursprüngliche Blob-Download-Anker nutzen denselben Vertrag. Dateiinhalt und Web-Erzeugung bleiben erhalten. HTTP-Downloads verwenden weiterhin WKDownload, normale Browser bleiben unverändert. Nicht alle PDF-Exportarten sind Downloads: ein Druckdialog bleibt ein Druckdialog.

Diagnose per Zwei-Finger-Langdruck: App-Version/Build, Umgebung, geladene Domain, Bridge-Version und gegebenenfalls Web-Manifest-Commit. Das Manifest ist ein Deployment-Hinweis; vollständige Datei- und Geräteabnahme sind gesondert zu bestätigen.

## Verifikation

```bash
python3 native/GradeCrewTeacher/test_beta_environment.py
python3 native/GradeCrewTeacher/test_navigation_policy.py
python3 native/GradeCrewTeacher/test_native_bridge.py
node --test native/GradeCrewTeacher/test_native_bridge_js.cjs
```

`GradeCrew Native Checks` prüft den isolierten Kandidaten ohne Signing/Upload. Der bestehende TestFlight-Workflow bleibt eine eigene Release-Stufe. Keine neue Firebase-Apple-SDK-Anmeldung oder native Kopie des Editors ist hierfür nötig.
