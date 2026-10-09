# Aufgabe: GC-IMG2THREEJS-01

- Datum: 09.10.2026 (Europe/Berlin)
- Verantwortlicher Chat: img2threejs in Codex installieren; Chat-Link unbekannt.
- Arbeitszustand: lokale Werkzeuginstallation abgeschlossen; Modellqualität und Codex-Aufruf noch nicht praktisch geprüft.
- Aufgabenbranch: docs/img2threejs-codex-install-20261009
- Basiscommit: 594410fb642e264d822cfd0af211c05985498b80
- Integrationsziel der Dokumentation: main
- PR: keiner
- Betroffene Repo-Dateien: TODO.md, workstreams/img2threejs-codex-install-20261009.md, workstreams/registry.json
- Lokaler Installationspfad: /Users/martin/.codex/skills/img2threejs

## Auftrag und Ergebnis

Screenshot identifiziert als https://github.com/img2threejs/img2threejs.
Martin hat den Einsatz als Werkzeug in Codex gewählt. Keine GradeCrew-Produktintegration beauftragt.
Der offizielle Codex skill-installer hat den gesamten Skill aus Tag v2.0.0 installiert.
Tag v2.0.0 verweist auf Upstream-Commit a669e9a97cea4452b1c2310c5cca6aa0f6657c1f.
SKILL.md nennt name img2threejs, version 2.0.0 und license Apache-2.0.
Vor Installation waren die abgefragten img2threejs-Skill-/Harness-Pfade nicht vorhanden.
Die Basis wurde ohne zusätzliche Domain-Plugins und ohne npm-CLI installiert.

## Tatsächliche Prüfungen

Python: /Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3

- Installationsskript: install-skill-from-github.py --repo img2threejs/img2threejs --path . --name img2threejs --ref v2.0.0 --dest /Users/martin/.codex/skills --method download; Exit 0.
- forge/stage1_intake/probe_image.py auf dem angehängten Screenshot: Exit 0, PNG 788 x 758, technicalSuitability pass. Nur technische Prüfung; der Screenshot ist kein geeignetes Objekt-Referenzbild.
- forge/state.py --help: Exit 0.
- forge/tests/test_workflow_state.py: 23 Tests, alle erfolgreich, Exit 0.
- Kein Gesamt-Testlauf, TypeScript-Build, 3D-Render oder visueller Modellvergleich.

## Koordination und Release

Aktuelle main-Regeln START_HERE, AGENTS, TODO, State, Workstream-README/Registry und CHAT_CONTRACT gelesen.
GitHub-Zugriff nach Sandbox-DNS-Fehler über autorisierten direkten Zugriff und GitHub-Connector bestätigt.
GradeCrew Development Status Run 37918977128 / Job 113782028448 am Basiscommit erfolgreich; Logs gelesen.
Gezielte PR-Suche img2threejs und Branch-Suche img2 ohne Treffer. Keine Behauptung eines vollständigen Repo-Inventars.
Release Train: staging-batch-2026-10-07-web-repair laut gelesener zentraler Statusdatei; durch diese Installation keine Stufenänderung.
Lokale Werkzeuginstallation ist keine App-Release-Stufe. Dokumentation auf eigenem Branch: branch_only.
Kein App-Code, keine App-CI, kein Merge, kein Staging-/Functions-/Rules-/Production-Deploy durch diesen Auftrag.
Keine bezahlten Provider-Aufrufe oder reservierten KI-Budgets. Ein Installationsversuch, erfolgreich.
Synced sources unverändert.

## Nutzung und offene Punkte

Ab nächster Nachricht img2threejs als Skill verwenden. Falls Codex den Eintrag nicht neu entdeckt, Codex neu starten.
Beispiel: „Nutze img2threejs und baue aus diesem Referenzbild ein bearbeitbares Three.js-Modell. Prüfe Proportionen, Farben und die gerenderten Ansichten.“
Ein geeignetes eigenes Referenzbild fehlt noch; automatische Erkennung und vollständige Rekonstruktionspipeline sind nicht praktisch nachgewiesen.
Die Basis erzeugt prozeduralen Three.js-Code. Unreal-Nutzung benötigt einen gesonderten Export-/Import-Auftrag.
Bei Updates die manuelle Installation erhalten: der Upstream-CLI-Installer überschreibt solche Installationen nicht.

## Nächster konkreter Schritt

In der nächsten Nachricht ein Objekt-Referenzbild mit dem oben genannten img2threejs-Auftrag verwenden.

## Wiederaufnahme

Letzter gesicherter Schritt: lokale v2.0.0-Installation und 23 erfolgreiche Workflow-Tests.
Keine laufenden oder unklaren Installations-/Provider-Vorgänge.
Vor Wiederholung zuerst den lokalen Skill-Pfad und diese Übergabe prüfen; nicht nochmals installieren.
Dokumentationscommit separat über den Branch nachsehen. Lokale Installation ist maschinenspezifisch und wird nicht durch GitHub auf andere Rechner verteilt.

## 09.10.2026 — Gemeinsamer Games-Zugriff und Qualitätsauftrag

Martin beauftragt, img2threejs für Spielechats auffindbar zu verankern und bei Bedarf tatsächlichen Zugriff sicherzustellen. Rückmeldung: Qualität aktuell noch zu schlecht. Ursprüngliche Task-ID GC-IMG2THREEJS-01 fortgeführt; ein erfolgreicher Installationsversuch und 23 Workflow-Tests bleiben erhalten. Der Skill wird im aktuellen Sitzungskatalog angezeigt und SKILL.md v2.0.0 wurde tatsächlich gelesen.

Geprüfter aktueller main: e50fc0cf6d9264da0857b40b2e82c726e9b55ef1. Bestehender Aufgabenbranch vor Fortsetzung: b5ea792215e7c76a57e9ffccbfea6e3dcff8ef11. Development Status 37919561488 / Job113783935001 erfolgreich; Logs gelesen. Allgemeine Warnungen zu Zielabweichungen, unregistrierten Branches und anderen PRs bleiben separate Aufgaben. PR153 ist offen/konfliktbehaftet; die ausführlichen Great-Games-Dokumente sind auf main noch nicht vorhanden. Kein pauschaler Merge dieses PRs.

Gemeinsame AGENTS-Regel plus docs/games/IMG2THREEJS_AND_ASSET_QUALITY.md ergänzen den tatsächlich gelesenen main-Einstieg. Umfang: bedingte Skill-Nutzung mit Zugriffsnachweis, Hostgrenzen, eigener Assetzustand, Vorlagen-/Mehrwinkel-/Ingameprüfung, offene Qualitätsabnahme und klare Three.js/Unreal-Grenze. Fremde laufende Art-/Runtimearbeit wurde nicht übernommen. TODO, Registry und eigene State-Zeile ergänzt; Release Train unverändert.

Ausgangsbefund laut main-Lerninsel-Übergabe: grober Fuchs und fehlende Rig-/Assetproduktion, frühere Figureneinschätzung ungefähr3/10. Keine neue Gesamtprojektzahl oder erneute visuelle Abnahme. Die allgemeine Qualitätsrückmeldung wird als offener Folgepunkt gespeichert, nicht als Verbesserung verbucht.

Status bei diesem Zwischencommit: Dokumentation branch_only, Integration auf main noch zu verifizieren. Geprüft werden Erhalt der bisherigen Inhalte/State-Felder, Verweise, JSON und exakte Remote-Rücklesung. Keine Produkt-, Engine-, Art-, Szenen- oder Deploymentänderungen. Keine bezahlten Aufrufe, keine neue Budgetreservierung oder neue Rekonstruktion. Chat-Link unbekannt. Kein laufender Installations-/Generierungsvorgang.

Nächster konkreter Schritt: geprüfte Dokumentation nach frischem main-/DevelopmentStatus-Abgleich übernehmen und exakte main-Dateien zurücklesen; danach zuständiger Spielchat prüft einen hochwertigen repräsentativen Abschnitt.

Vor Integration main erneut gelesen: dc52bf88bc9c4a161e1327e081698e7f6cf9f04a. Seit dem ersten Abgleich wurde nur eine fremde Canonical-Staging-Request-Datei ergänzt; diese bleibt vollständig erhalten. Neuer Development-Status-Run37919922565 erfolgreich am aktuellen main. Keine Überschneidung der sechs Dokumentationsdateien mit dieser Änderung.
