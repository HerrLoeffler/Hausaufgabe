# GC-TEST-CARDS-20261018 · Einheitliche Testkarten

Stand 18.10.2026. Fachagent `test_card_unification`. Eigenständiger Checkout `gradecrew-test-card-unification-20261018`, Branch `fix/test-card-unification-20261018`. Lokale Basis `2e718ae44519fc22a7c64ad354b62dd26a6999ca` auf `feature/gradecrew-app-integration`; nach geprüftem Datei-Vergleich wird der Remote-Review-Commit direkt auf dem neueren Integrationsstand `a425605b9bf8e3c6ae94666b0ae0d8bbba24e14d` gebaut. Kein Merge oder Deploy auf die Schul-Staging-Adresse: parallele Umfeldmigration wird zentral koordiniert.

## Auftrag und Befund

Der Nutzer zeigt unterschiedlich wirkende Testkarten auf der Web-App: bei veröffentlichten Tests wechseln die Primärfarben von „Bearbeiten“ und „Ergebnisse“, der Schülerlink erzeugt eine dritte Aktionsfläche, und Zeit-/Startangaben fehlen je nach Test. Der Löschknopf trägt unnötig das Wort „Löschen“. Die bestehenden Karten werden ebenfalls in mobilen Browsern und der nativen WebView gezeigt; keine zweite Kartenimplementierung wurde gefunden.

`START_HERE.md` und verlinkte Projektregeln auf aktuellem `main` gelesen, ebenso `frontend-design/SKILL.md`. Designentscheidung im bestehenden GradeCrew-System: gleiche Reihenfolge und Hierarchie der zwei Hauptaktionen, vier gleichbleibende Metadatenplätze, responsive Rasterung und ein zugänglicher 44×44-Papierkorb. Statusfarben und zustandsabhängige Berechtigungen behalten ihre Bedeutung. Der veröffentlichte Schülerlink bleibt verfügbar und wandert in die vorhandenen „Weitere Aktionen“; keine neue Aktion oder Datenmutation.

## Umsetzung

- `app.js`: Jede Testkarte zeigt Aufgaben, Punkte, Zeitlimit/„Ohne Zeitlimit“ und Startmodus. „Bearbeiten“ ist stets primär, „Ergebnisse“ stets sekundär. Der zustandsabhängige Schülerlink steht in der nativen Zusatzaktionsliste. Der Papierkorb ist nur als SVG sichtbar, mit `aria-label` und `title`; der bestehende `deleteQuiz`-Handler samt Bestätigung bleibt unverändert.
- `gradecrew-workspace-upgrade.css`: Titel erhalten Mindesthöhe für zwei Zeilen, Statistiken feste vier Spalten (mobil zwei), Hauptaktionen zwei gleich breite Felder (mobil untereinander). Papierkorb 44×44; vorhandener Fokusstil bleibt.
- `shared/i18n/messages-en-GB.mjs`: neue Quelltexte für `Schüler` und das Papierkorb-Label übersetzt.
- `tools/ui/workspace-upgrade.test.mjs`: echte Renderer-Funktion mit synthetischen Entwurf-/Veröffentlicht-/Beendet-Daten geprüft, Hauptaktionen und Schülerlink-Ereignis, vier Metadatenplätze, ikonischer Papierkorb samt DE/EN-Namen und Lösch-Handler, responsive CSS-Regeln.

Review-Nacharbeit: Ein 70–95 Zeichen langer Titel bleibt im Heading vollständig; CSS-Grid-Stretch und `margin-top:auto` richten die Hauptaktionen unabhängig von der Titelhöhe aus. Die vorhandene aufklappbare Volltextanzeige für sehr lange Titel bleibt unverändert, damit keine Tastaturinformation verloren geht. Statistikwerte und Beschriftungen reservieren im engen Viererspalten-Raster Platz für zwei Zeilen (z. B. „Ohne Zeitlimit“); bei 390px gilt das lesbare Zweierspalten-Raster ohne Reservierung. Zusätzliche EN-Labels decken Bearbeiten, Schülerlink, Minuten, Veröffentlichungsschalter und Kartenstatus ab. Die lokale Vorschau hatte durch einen fehlenden `aiJobTitle`-Fixture-Import vor der Karten-Dekoration abgebrochen; `tools/ui/workspace-preview.mjs` lädt nun die unveränderte echte Renderer-Funktion mit ihrem Hilfsstück.

## Belege und Grenzen

`node --test tools/ui/workspace-upgrade.test.mjs`: 17/17 bestanden. `node tools/build-staging.mjs <leeres-temp-verzeichnis>`: 165 Dateien geprüft, erfolgreich. `git diff --check`: sauber. Es wurden keine echten Tests/Konten geändert. Temporärer localhost-Desktop-Headless-Chrome-Screenshot bei 1536px zeigt vier Karten mit einheitlich ausgerichteten Aktionsreihen und stabilen Statistikplätzen; nur synthetische Daten, kein Firebase. Der 390px-Headless-Capture blieb in der Ladephase, deshalb keine Mobil-/iPad-/iPhone-Sichtabnahme behauptet. Zentrale CI bleibt offen.

Frisch verglichen: Integrationsziel `a425605b9bf8e3c6ae94666b0ae0d8bbba24e14d` ist drei Commits vor Basis; die zehn geänderten Dateien betreffen ausschließlich den pädagogischen Pool/Functions, nicht diese vier Dateien. Parallel-PR #242 berührt `app.js` nur in `renderGapfillStudent` um Zeile 6579, diese Kartenänderung nur `renderQuizList` um Zeile 1788; kein hunk-level-Overlap. Trotzdem vor Integration exakten Head, CI und kombinierten Diff erneut prüfen. Kein blindes Rebase und kein eigenständiges Schul-Deployment.

Assurance: SEC15/PRIV15: dynamische Kartenwerte laufen unverändert durch bestehende `escapeHtml`-Pfade; keine neuen externen Eingaben, Berechtigungen oder Persistenz. PRIV14: Fokus/Touch/Sprachlabel konkret geprüft, physische Kontrast-/Geräteabnahme offen. SEC01/03/16/18/20: keine Credential-, Rules-, Upload-, Header- oder Dependencyänderung; kein Vollscan behauptet.
