# GradeCrew Firmenzentrale — lokale Arbeitsansicht

Task GC-BRAIN-01. Umsetzung der klaren Navigation aus Masterplan 1.1. Diese Ansicht ist ein laufender, isolierter Frontendstand, keine fertig angeschlossene Firmenzentrale.

## Starten

Vom Repositoryverzeichnis:

```sh
python3 tools/serve_firmenzentrale.py --port 8796
```

Danach http://127.0.0.1:8796/ im Browser öffnen. ES-Module benötigen HTTP; index.html nicht direkt per file:// öffnen. Keine Installation, kein API-Schlüssel und keine externen Schrift-/Bilddienste erforderlich.

## Bedienung

- Heute: übernommene Themen und nächste Aufmerksamkeit.
- Eingang: lokale Entwürfe für Aufträge, Ideen, Ziele, Kundenanfragen und Probleme; bearbeiten und als Markdown herunterladen.
- Arbeit: Themenakten, Ziele, Aufgabenqualität, Firmenbereiche und Zusammenhänge. Ein Bereich wird nur einmal gewählt. Seine Unterpunkte erscheinen kontextabhängig links; rechts steht die eigentliche Arbeit.
- Wissen: Quellen mit Herkunft und Stand. Volltextsuche über die Lupe oder Cmd/Ctrl+K findet auch Unteraufgaben, Entscheidungen und lokale Entwürfe.
- Themenakten: Überblick, aufklappbare Aufgaben, Entscheidungen, Gesprächsbezüge, Quellen und Verlauf.

## Daten und Grenzen

data.mjs bewahrt die neun Bereiche und vier Originalthemen der Testseite docs/prototypes/gc-brain-firmenordnung.html bei b912d03. Es ist ein datierter Quellenstand vom 22.10.2026, kein automatisch aktualisiertes Firmenregister. Historische PR-/Testaussagen sind keine aktuellen Freigaben.

Lokale Entwürfe liegen ausschließlich im Browser unter gradecrew-company-personal-drafts-v1. Derselbe Rechner mit anderem Browser, Port oder Profil teilt diese Entwürfe nicht. Browserdatenlöschung entfernt sie; bei wichtigen Texten vorher den Markdownexport nutzen. Speicherfehler werden angezeigt, beschädigte Dokumente nicht still ersetzt. Es gibt noch keinen zentralen Unternehmensspeicher, Import, automatische Sicherung oder zuverlässige Mehrbenutzersynchronisierung. Der Export sendet keinen Auftrag.

Die vorhandene GradeCrew-MCP-Verbindung stellt in dieser Umgebung keine erreichbare App-Fläche für einen bewiesenen Hin-/Rückweg bereit. Aus dieser Ansicht werden keine Chats, Worker, E-Mails oder Provideraufrufe gestartet. connect-src 'self' erlaubt nur das Laden des eigenen Inventars und der kanonischen Markenquellen; externe Verbindungen bleiben gesperrt. Der zugrunde liegende P0 bleibt offen. Produkt-Store, Rechte, Authentifizierung, Versand, Rückmeldung, Automatisierung und angeschlossene Eingangskanäle sind nicht umgesetzt.

Zielprozente erscheinen erst mit vereinbarten, gewichteten und abgenommenen Meilensteinen. Qualitätsanzeigen vergeben keine manuell behauptete Grünfreigabe.

## Prüfen

```sh
node --check docs/prototypes/firmenzentrale/app.mjs
node --test tests/firmenzentrale/model.test.mjs
git diff --check
```

Die eigene CI Firmenzentrale UI checks prüft Syntax und Modellregressionen. Browserprüfung und ihre Grenzen stehen in workstreams/gc-brain-implementation-20261022.md. Eine bestandene Prüfung dieses Frontends ist keine Produkt-V1-Abnahme und kein Deployment.

## Umbau nach Ablehnung am 23.10.2026

Die bisherige inhaltliche und optische Abnahmeannahme ist aufgehoben. Die Hauptansicht zeigt elf große Themenfelder statt vier Web-Akten. inventory.json enthält eine datierte Erfassung der unterstützten APIs; portfolio.mjs eine vorläufige redaktionelle Synthese. Die Quellenabdeckung bleibt ausdrücklich unvollständig, insbesondere bei älteren fehlgeschlagenen Cursorn und der noch offenen redaktionellen Vollauswertung. Originalverläufe und reale Schülerdaten werden nicht exportiert. Die vier bisherigen Akten bleiben historische Detailakten.

Logo, Manifest, Brand Core und Tokens stammen bytegleich aus dem Produktbranch750212e7. Sie liegen unter ihren kanonischen Repo-Pfaden; keine produktbezogene Logo-Neuzeichnung oder Kopie. Der lokale Vorschauhelfer liefert ausschließlich Frontend- und Markenpfade aus.
