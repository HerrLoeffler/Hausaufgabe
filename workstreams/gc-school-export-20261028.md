# GC-SCHOOL-EXPORT-20261028 · Einzelarbeit exportieren (isolierter Testprototyp)

- Stand: 28.10.2026, nur synthetische lokale Vorschau; kein Production- oder Staging-Deploy.
- Basis: `feature/gradecrew-app-integration` bei `5e45e9df2449ca7e4c4b735ae754452a6f304ab7`.
- Eigener Zweig: `feature/gc-school-export-preview-20261028` im Worktree `implementation/gc-school-export-20261028`.
- Vorgänger: Forschung und Gatevergleich in Draft-PR #366 (`GC-SCHOOL-READINESS-20261028`).
- Entwurf zur Umsetzung: [Draft-PR #374](https://github.com/HerrLoeffler/Hausaufgabe/pull/374) gegen `feature/gradecrew-app-integration`. Der Implementierungs-Commit `e00ac72cc1970d1c5c6cb87399df1c7bdd9b6aac` wurde wegen fehlender Git-CLI-Anmeldung über die verbundene GitHub-Schnittstelle aus dem bytegleichen lokalen Tree `5f732858aa9815ba561f11281b353367fc9eefea` erstellt; der aktuelle PR-Kopf enthält danach ergänzte Übergabeangaben.
- Plan: `docs/superpowers/plans/2026-10-28-school-export-preview.md`.

## Gelieferter Prototyp

Im vorhandenen Ergebnisbildschirm gibt es für die lokale Beispielarbeit „Arbeit exportieren“. Die gleiche Funktion ist in Staging nur mit `?schoolExportPreview=1` und einer persönlich zugewiesenen Klasse sichtbar. Sie lädt ein ZIP mit `work.pdf`, versioniertem `work.json`, `manifest.json` und eingebetteten Bild-/Audiodateien herunter; dazu einen getrennten Prüfbeleg. Der Browser öffnet das ZIP nach Erzeugung erneut und prüft SHA-256 und Längen. Dateinamen enthalten nur Test- und Abgabe-IDs. Es entstehen keine öffentlichen Storage-Links.

Der Assessment-Code enthält einen neuen, auf `gradecrew-staging-2026` beschränkten Callable-Pfad mit Konto-, Eigentümer-, Schule-, Klassenzuordnungs- und Empfängerkontrolle. Alle vier beteiligten Datensätze (Schule, Test, Schüler, Zuweisung) müssen serverseitig `schoolExportSynthetic: true` tragen; ohne ausdrücklich vorbereitete synthetische Staging-Fixtures lehnt der Server auch einen angemeldeten Eigentümer ab. Manuelle Korrektur und Rücknahme schreiben je ein Ereignis mit Vorgangskennung, Anforderungs-Hash, Grund, Akteur, Serverzeit, fortlaufender Nummer und Vorher-/Nachherstand in derselben Transaktion wie die aktuelle Punkteprojektion. Wiederholte identische Anfragen sind idempotent; eine Kennung mit geändertem Inhalt wird abgelehnt. Neue persönliche Abgaben speichern einen gezählten, eingefrorenen Aufgabenstand in privaten Unterdokumenten. Bei geänderter/zu großer Vorlage bleibt die Abgabe möglich; das fehlende Snapshot wird ausdrücklich markiert. Historische und unvollständige Abgaben werden als ungeprüft gekennzeichnet. Die manuelle Test-Bewertungsmaske lädt für Staging den eingefrorenen Aufgabenstand dieser Abgabe.

Die lokale Vorschau verwendet ausschließlich synthetische GradeCrew-Aufgaben und das vorhandene Editor-/Ergebnis-UI. Sie ruft keine OpenAI-Korrektur und kein DMS auf. Visualisierungen werden im PDF textlich beschrieben; die vollständige Interaktionsstruktur steht in `work.json`. Das ist eine offene Darstellungsgrenze. Auch Schule, Aufbewahrungsfrist, Löschkonzept, DMS und Rechtsfreigabe sind nicht entschieden.

## Nachweise

- Lokale Vorschau: `http://127.0.0.1:8786/` (nur erreichbar, solange der lokale Vorschau-Server läuft; Start mit `EXTENDED_PORT=8786 EXTENDED_STATE_DIR=/private/tmp/gc-school-export-preview-20261028 node tools/extended-preview/server.mjs`).
- Browser 28.10.: synthetische Abgabe „Testkind A“, Ergebnis `1/24`, nach Korrektur `2.5/24`, nach Rücknahme wieder `1/24`; Export-Toast bestätigt zwei Downloads und Paketprüfung. Kein Cloud-Schülerdatensatz berührt.
- Beispielartefakte: `output/pdf/school-export-synthetic.pdf`, `output/school-export-synthetic.zip`, `output/school-export-synthetic-receipt.json` (lokal, nicht Teil des PR). PDF mit Poppler gerendert und beide Seiten visuell geprüft.
- Assessment-Suite nach Review-Fixes: 147/147. Schul-Export-/Paketintegritätstests: 4/4 zusätzlich. Staging-Build: 213 Dateien, erfolgreich. Syntaxprüfungen und `git diff --check` grün.
- Quellbibliotheken `pdf-lib` und `JSZip` lokal mit Lizenzen eingebunden; keine externe Skriptquelle bei Export.

## Abgleich und offene Gates

Unabhängiges Read-only-Review des ersten Commits `76256687` fand fehlende Synthetic-Schranke, Wiederholungs-/Reihenfolgebugs, einen leeren Snapshot ohne Lückenhinweis, einen Form-/Snapshot-Widerspruch und fehlende Hinweise für nicht unterstützte Medien. Diese Punkte wurden korrigiert und neu getestet. Das Review des Fix-Commits `592607fd` fand eine globale Zustandsänderung der Aufgabenliste und eine versehentliche Sperre für normale Klassenarbeiten; beides ist im lokalen Commit `48ffbfb9` behoben, Syntax und gezielter Vorschautest grün. **Merge weiterhin blockiert:** Firestore-Regeln und der alte Client erlauben direkte Bewertung ohne Ereignis; Wilmas inzwischen weiterentwickelter Zweig enthält einen eigenen transaktionalen Entscheid-Schreiber (`functions/lib/wilma/teacher-review-write.mjs`). Der hiesige Korrektur-Callable ist ausschließlich isolierter Testcode und darf nicht parallel zu Wilmas kanonischem Beleg integriert oder ausgerollt werden. Vor Merge muss er auf diesen einen Bewertungsweg umgestellt oder entfernt werden; die Exportabfrage muss Wilmas Ereignisschema aufnehmen. Danach ist ein frisches Review nötig.

Es gibt noch keinen öffentlich erreichbaren Previewkanal und keinen echten Staging-Callable-Nachweis. Ein kanonischer Staging-Hosting-Deploy ist untersagt, weil `/wilma/` erhalten bleiben muss. Für eine Remote-Vorschau wären ein eigener Channel, eigene präfixierte Testfunctions und ein ausschließlich synthetisches Testkonto zu paketieren und vor Freigabe gezielt zu prüfen. Production bleibt ohne ausdrückliche Freigabe ausgeschlossen.

## Wiederaufnahme

Zuerst `git status`, aktuelle Wilma-Commits/PRs und Preview-/Deploybelege prüfen. Danach Wilma-Ereignisschema integrieren und direkte Alt-Schreibrechte für Schulabgaben schließen, Browserexport für visuelle Aufgaben verbessern, ZIP/PDF mit weiteren Medienvarianten und fehlenden Transkripten testen, frisches Review auf dem integrierten Stand und erst dann einen getrennten Remote-Previewkanal erwägen. Keine reale Schülerarbeit als Testfixture verwenden.
