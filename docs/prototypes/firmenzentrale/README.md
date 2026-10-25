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
node --test tests/firmenzentrale/*.test.mjs
git diff --check
```

Die eigene CI Firmenzentrale UI checks prüft Syntax und Modellregressionen. Browserprüfung und ihre Grenzen stehen in workstreams/gc-brain-implementation-20261022.md. Eine bestandene Prüfung dieses Frontends ist keine Produkt-V1-Abnahme und kein Deployment.

## Umbau nach Ablehnung am 23.10.2026

Die bisherige inhaltliche und optische Abnahmeannahme ist aufgehoben. Die Hauptansicht zeigt elf große Themenfelder statt vier Web-Akten. inventory.json enthält eine datierte Erfassung der unterstützten APIs; portfolio.mjs eine vorläufige redaktionelle Synthese. Die Quellenabdeckung bleibt ausdrücklich unvollständig, insbesondere bei älteren fehlgeschlagenen Cursorn und der noch offenen redaktionellen Vollauswertung. Originalverläufe und reale Schülerdaten werden nicht exportiert. Die vier bisherigen Akten bleiben historische Detailakten.

Logo, Manifest, Brand Core und Tokens stammen bytegleich aus dem Produktbranch750212e7. Sie liegen unter ihren kanonischen Repo-Pfaden; keine produktbezogene Logo-Neuzeichnung oder Kopie. Der lokale Vorschauhelfer liefert ausschließlich Frontend- und Markenpfade aus.

## Interaktives Unternehmensnetz

Start und Projektlandkarte zeigen denselben zentralen Graphen mit elf Bereichsknoten und21 typisierten, gerichteten Verbindungen. Knoten öffnen Voraussetzungen/Weiterwirkungen und nächste Arbeit. Linien und bei Auswahl erscheinende Beschriftungen öffnen Umfang und Quelle. Gemeldete Engpässe sind begrenzt und datiert; kein Liveverkehr oder pauschaler Produktstatus. Filter, Unterthemensuche, Zoom/Einpassen und Ziehen sind bedienbar. Auf kleinen Bildschirmen steht eine zusätzliche Bereichsauswahl bereit. Vollständige Akten bleiben unter Arbeit/akte/ID erreichbar. Arbeitsaufträge werden als lokale Entwürfe vorbereitet; die echte Chat-Ausführung bleibt offen.

## Bereich in den Mittelpunkt nehmen —25.10.2026

Ein Bereichsklick wechselt in ein fokussiertes Netz. Der gewählte Bereich steht mittig, seine Unterpunkte ringsum. Alle elf Bereiche sind erschlossen:62 explizite Arbeitsumfänge einschließlich „Technische Erneuerungen der Aufgaben“. Unterpunkte besitzen eigene Status-/Dringlichkeitsdaten, Stand, Lücke, nächste Aktion, Abnahmekriterien, Owner und Quelle. Ein Elternblocker wird nicht auf alle Unterpunkte kopiert.

Beispiele: `#/arbeit/landkarte/design` öffnet die fünf Designunterpunkte; `#/arbeit/landkarte/learning/erneuerungen` öffnet das Arbeitsblatt der neuen Aufgabenformate. Gesamtnetz und Bereich sind über Brotkrumen erreichbar. Reload und Browser-Verlauf erhalten die Adressierung. Ungültige IDs haben Meldung und Rückweg. Fokus-Suche/Filter werden beim Bereichs-/Ebenenwechsel zurückgesetzt; beim Unterpunktwechsel bleiben Kartenposition und Filter bestehen.

Auf Handybreite ist die Satellitenübersicht durch eine lesbare Linkauswahl ergänzt. Ein geöffneter Unterpunkt scrollt zum Arbeitsblatt unterhalb der fixierten Kopfzeile. DOM-/Lesereihenfolge entspricht der sichtbaren Reihenfolge. Bewegung wird bei reduzierter Bewegung abgeschaltet. Zoomzahlen bedeuten ausschließlich Vergrößerung.

Konzept: [Bereichsfokus](../../superpowers/specs/2026-10-25-bereichsfokus-design.md). Ausführungsplan: [Implementierung](../../superpowers/plans/2026-10-25-bereichsfokus.md). Daten stammen aus der bisherigen Fachinventur23.10.; neue Konzeptanforderungen tragen25.10. Sie werden nicht als Live-Aktualisierung ausgegeben. Vorbereitete Aufträge enthalten den genauen Unterpunkt samt Abnahme und bleiben ausdrücklich lokal/ungesendet.

## Lokaler Chatanschluss (25.10.2026)

Start mit vorhandenem Codex im PATH und bestehender Anmeldung:

```sh
python3 tools/serve_firmenzentrale.py --port 8796 --data-dir /ABSOLUTER/PRIVATER/PFAD
```

Python3.11+; ausschließlich127.0.0.1. `--codex` erlaubt den expliziten Pfad zur bestehenden CLI. Kein API-Key wird übernommen oder ausgelesen. Der private Datenpfad darf NICHT unter der ausgelieferten App oder in Git liegen. Der Dienst muss laufen; kein System-Autostart und keine Cloudbereitstellung installiert. Auf Martins Rechner liegt der Bestand im bestehenden Konzeptprojekt unter runtime/.

Im Dialog: Entwurf speichern bleibt im Browser; Bearbeitung starten speichert einen Auftrag und öffnet einen eigenen Codex-App-Server-Verlauf. Der Eingang zeigt Status, Rückfragen, Bericht und Ergebnis. Quellenprüfung alle fünf Minuten, UI-Abgleich alle drei Sekunden (im Hintergrund alle zwölf Sekunden). Neue Quellen verändern fachliche Bewertungen nicht automatisch.

**Geprüftes Profil:** Analyse, Konzepte, Texte und Diagnoseberichte. Werkzeuge central_context (gebundener Bestand und historische Textsuche), central_question, central_report (fester Pfad je Auftrag). Environments leer, Shell/Apps/Plugins/Subagenten deaktiviert, keine zusätzlichen Rechtefreigaben. Produktcode, externe Nachrichten und Deployments sind nicht Teil dieses Profils. Zentrale/Coordinator erhält keine durchgereichte beliebige RPC-Schnittstelle.

**Persistenz:** SQLite mit vollständigen Transaktionen, Brief-/Quellenhash und Ereignissen. Browser speichert eine unklare Übermittlung mit derselben Request-ID; Server weist ID/Inhaltskonflikte ab. Nach Dienstneustart bekannte Turns lesend abgleichen; unklare Starts niemals automatisch wiederholen. Unterbrochene Arbeit kann Abgleich nötig bleiben. Kein Backupimport oder automatische Wiederaufnahme verlorener Freigaben implementiert. Vor Übernahme eines Datensnapshots bestehendes Dispatchjournal und Hostzustand abgleichen; nicht einfach einen alten Datenordner über einen aktiven Bestand kopieren.

**Privater Wissensbestand:** Unterstützte App-Server-APIs lesen ausschließlich zugeordnete Firmenchats. Lokale Textkopien sind mit Quellrevision und Herkunft suchbar; pro Nachricht maximal24000Zeichen. Rohdaten und Berichte bleiben im privaten Datenordner, nicht im Repo. Cloudchats werden separat mit Desktopconnector geprüft, als cloud-import.json lokal übernommen und ausdrücklich nicht als automatisch synchronisiert dargestellt. Bilder/Anhänge und private Quellen außerhalb des Auftrags werden nicht erschlossen. Die API-Seitenabdeckung bestätigt keine semantische Vollanalyse. Gemeinsame Identitäten, ACL-/Löschsynchronisation und Firmenbetrieb mit mehreren Nutzern bleiben offene V1-Arbeit.

**Quellen:** GitHub öffentlich/read-only, feste Repoendpunkte, kein Connectorcredential im Dienst. Bei unverändertem main werden Inhaltsdateien wiederverwendet; offene PRs werden erneut gelesen. Fehler behalten den letzten guten Stand mit Fehlermeldung. Kein Auto-Merge oder Deploy. Nach längerer Offlinezeit zuerst Quellenzeitstempel prüfen.

Prüfen ohne Modellaufruf:

```sh
python3 -m unittest discover -s tests/firmenzentrale -p 'test_*.py' -v
node --test tests/firmenzentrale/*.test.mjs
```

Echter lokaler Durchstich und Grenzen: workstreams/gc-brain-implementation-20261022.md. Design/Plan: docs/superpowers/specs/2026-10-25-chatanschluss-design.md und docs/superpowers/plans/2026-10-25-chatanschluss.md. Offizielles Protokoll https://learn.chatgpt.com/docs/app-server, lokal qualifiziert gegen0.163.0-alpha.11.2. Experimentelle dynamische Werkzeuge/Umgebungsfelder benötigen dieselbe Hostqualifikation nach größeren CLI-Wechseln.
