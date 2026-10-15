# Lernspiele-Planbuch · GC-GAMES-LEARNING-UX-01

Auftrag15.10.2026, Satz-/Reviewabschluss16.10.2026. Zielgruppe bestätigt: Mittelschule Bayern, Klassen5–10. **Vorschlag, nur Planung.** Keine Produktänderung, Provideranforderung, Gamebuild, Integration oder Veröffentlichung.

## Aktueller Nachtrag zum bestehenden Plan

[Ergänzung: faire Chancen, Punkte und passende Denkzeit](ERGAENZUNG-PUNKTE-ARBEITSWEISEN-20261016.md) erweitert den ursprünglichen Plan um 7.393 Wörter. [Leseweg und Fassungsbezug](LESEREIHENFOLGE.md) verbindet beide Teile. Der Nachtrag enthält die optionale spielbare Punkte-Challenge, drei Lehrerpresets, getrennte Kopf-/Stift-/Denkprofile, transparente Zeit-/Hilferegeln und eine Vorrangmatrix in Kapitel14. Die unten genannten61Seiten/Originalhashes gehören weiterhin zur unveränderten ersten Fassung. Der Nachtrag erhält separate Satz-/Prüf-/Reviewbelege; der alte PASS wird nicht auf ihn übertragen.

## Dateien

- `MASTERPLAN.md`: vollständiger fachlicher Produkt-/UX-/Umsetzungsentwurf,19Hauptkapitel und2Anhänge,13.483Wörter. SHA256`f2e67d9fcb260a1d8d3b084c1e1240976d4a3d18806e3afd0035bc62937c5478`.
- `design/index.html`: statische Galerie; enthält zwölf editierbare SVG-Konzeptansichten aus `design/mockups/`. Keine funktionierende App und keine Live-Screenshots.
- `design/assets/`: eingefrorene vorhandene GC-Markenreferenzen für das Dokument, keine neue Runtime-Markenquelle. Herkunft und Rechtegrenzen im Designhandoff.
- `design/DESIGN_HANDOFF.md`: tatsächliche Werkzeuge/Skills, Layoutregeln, Assetherkunft und Prüfgrenzen.
- `research/RESEARCH.md` und `research/SourceLedger.json`: eigener Recherchebeitrag, fixierte Codebelege und institutionelle/amtliche Quellen; keine unabhängige Gesamtabnahme.
- `manuscript-verification.json`: strukturelle Dokumentprüfung mit Inhaltshash, Kapitelzahl und konkreten Scopeprüfungen; keine Produktprüfung.
- `design/build_book.py`, `render_assets.cjs`, `verify_book.py`: reproduzierbarer Satz-/Prüfweg für diesen Entwurf, kein Produktcode.
- `final/verification.json` und `final/layout-verification.json`: Textverlust-/PDFstruktur- und Safe-Area-Nachweise mit endgültigen Hashes.
- `review/`: unabhängiger Dokumentationsreview des benannten Manuskripthashes.

## PDF und Wiederherstellung

Die druckfähige PDF hat61Seiten und zwölfKonzeptansichten. SHA256`150f68ef7d150ac9b0cd90f94f92a05b7924e51740e519e91bcf2b68a0e92664`. Die eigenständige zusätzliche HTML-Lesefassung liegt daneben unter `final/GradeCrew-Spiele-Masterplan-20261015.html`; vollständig strukturell geprüft, wegen lokalem Browserstartfehler nicht visuell im Browser abgenommen. PDF ist die maßgebliche Satzfassung. Beide fertigen Leseartefakte werden lokal ausgeliefert; das Repo sichert ihre Quellen und Hashes.

Die druckfähige PDF liegt lokal unter `work/games-redesign-20261015/final/GradeCrew-Spiele-Masterplan-20261015.pdf`. Sie wird direkt in Codex ausgeliefert. Die PDF-Binärdatei ist bewusst nicht als GitHub-Commit behauptet; das Repo sichert Manuskript, SVGs, Satzquellen, Provenienz, Research und Prüfhashes.

Zur erneuten Erstellung auf Martins Mac zuerst die gebündelten Workspaceabhängigkeiten über Codex auflösen. Der vorhandene Satzweg nutzt ReportLab, pypdf, pdfplumber, Pillow und Sharp. Lokale Arial-/Trebuchet-Schriften liegen in `/System/Library/Fonts/Supplemental/`; diese Fontdateien sind nicht Teil des Pakets. Vor dem Satz einen `design/preview/`-Ordner anlegen, mit `render_assets.cjs` die vorhandenen SVGs rendern, danach `build_book.py` ausführen und mit `verify_book.py` prüfen. Die Skripte arbeiten relativ zu ihrem eigenen Pfad; keine Cloudrechte oder Providerkeys erforderlich. Fehlende Abhängigkeiten oder Fonts nicht durch eine behauptete identische Ausgabe übergehen.

Konkreter Wiederholungsweg auf dem dokumentierten Mac (aus dem Paketordner, gebündelte Laufzeit zuerst prüfen):

```sh
mkdir -p design/preview final
/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node design/render_assets.cjs
/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 design/build_book.py
/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 design/verify_book.py
```

Der Sharp-Import ist im Satzskript bewusst an den überprüften gebündelten Mac-Pfad gebunden. Auf einem anderen Host erst tatsächliche Laufzeit-/Fontpfade auflösen und dokumentieren; kein Provider- oder Produktstart ist erforderlich. Vorhandene SVGs reichen für den Satz; `create_mockups.py` ist zusätzlich die bearbeitbare Entwurfsquelle.

Die SVG-Galerie bleibt ohne PDF-Compiler lesbar. Ein neuer Render kann technische PDF-Metadaten verändern; der Manuskripthash und die vollständige Text-/Layoutprüfung sind deshalb zusätzlich zum PDFhash zu vergleichen. Der Renderer sichert alle Textblöcke des Manuskripts, interne/externe Links, Inhaltsverzeichnis und Lesezeichen. Sichtprüfung aller Seiten bleibt erforderlich.

## Stand und nächster Schritt

Draft-PR239 gegen main: https://github.com/HerrLoeffler/Hausaufgabe/pull/239. Kein Merge-/Deployauftrag. Nach Prüfung des Planbuchs kann Martin einen klar begrenzten Referenzabschnitt beauftragen: vorhandener eigener Mathetest → verständlicher Start → fünfminütige fortlaufende Runde mit geprüftem Vorrat, Hilfe, Pause-/Deadlinevertrag, Resume und Abschluss. Dieser Bauauftrag ist durch die Dokumentation noch nicht freigegeben.


Nachtragabschluss: 29 Seiten, zwei neue Konzeptansichten, Text-/PDFreview PASS ausschließlich im Dokumentumfang. End-PDF SHA256`e343a4d2848d4f5157494e88b1fb477e75cbc2b3f749e2788ba5bc7f8d15ccdf`. Dateien lokal unter `final/GradeCrew-Spiele-Nachtrag-Adaptive-Runden-20261016.pdf` beziehungsweise `.html`; diese Leseartefakte sind nicht als GitHubcommitted behauptet. Reproduzierbare neue Satz-/SVGquellen in `design/adaptive-addendum/`, eigener Review in `review/ADAPTIVE-REVIEW.md`. Hauptbuch und Nachtrag zusammen90Seiten, unterschiedliche Hashes und getrennte Prüfbelege.
