# Guardian: komplexe Aufgaben, Design und Gesamtaudit

- Aktualisiert: 04.10.2026
- Tasks: GC-AUTOMATION-09–11; bestehender Pilot GC-AUTOMATION-07 hat Vorrang.
- Auftrag: Martin möchte andere KIs bei komplexen/schwierigen Aufgaben früh hinzuziehen; zusätzliche API-Kosten sind für begrenzte anspruchsvolle Arbeit grundsätzlich akzeptiert. Beispiele: Gesamtcode-Prüfung und wiederholt unbefriedigende Startseite.
- Branch: docs/guardian-complex-design-plan-20261004 → main.
- Geprüfte Basis: main 93bfd9eaf8544c9afdd85b62dfe8dbc17c8d9b18.
- Betroffene Dateien: diese Übergabe, TODO.md; keine Produkt-/Controlleränderungen.

## Geprüfter Iststand

AGENTS, START_HERE, State, TODO, Chat-Vertrag, Registry, Execution-/Setup-Dokumentation, Workflows sowie pipeline.py/model_calls.py gelesen. Development Status 37193300739 samt Job-Log geprüft: aktive parallele Aufgaben und Überschneidungen vorhanden; Startscreen-Branches sind unter anderem nicht klassifiziert. Vor Implementierung vorhandene Designarbeit frisch vergleichen, keine konkurrierende CSS-Lösung.

Guardian-main-Run 37192289709: 68 Controller-/Pipeline-Tests bestanden; automatische Fortsetzung übersprungen. Log bestätigt beide Flags leer, drei Secret-Präsenzfelder false, keinen aufgenommenen Pilot. Aktuelle Policy enabled=false/workstreams=[].
Vier separate Aufrufe sind implementiert: Bau sowie unabhängige Korrektheits-, Sicherheits- und QA-Prüfung nach erfolgreicher technischer CI. Der Modelltransport serialisiert Textkontext; Screenshot-/Bildprüfung und vorgeschaltete Mehrmodell-Planung fehlen.
V2 erlaubt höchstens acht ausdrücklich benannte bestehende Web-Dateien und zwölf Kontextdateien im begrenzten Kontext. Dies ist kein unbegrenzter Coding-Agent und keine automatische Verarbeitung aller vorhandenen Branches.

## Gewünschte Erweiterung und empfohlene Ausgestaltung

GC-AUTOMATION-09: komplexe Aufgaben vor Umsetzung prüfen.
- Auftrag anhand betroffener Module, Unsicherheit, Risiko und konkreter Fehlversuche einstufen; zusätzlich ausdrücklich wählbar.
- Bei komplexer Arbeit zunächst unabhängige Architektur-/Auftrag-/UX-Kritik mit gemeinsamen Fakten, aber ohne fremde Urteile.
- Ein verantwortlicher Umsetzer konsolidiert Kritik, begründet Entscheidungen und zerlegt die Umsetzung in kleine überprüfbare Teilaufträge. Keine vier gleichzeitigen Schreibakteure auf denselben Dateien.
- Spätere Freigabe bleibt vom exakten Kandidaten und eigenen unabhängigen Abschlussreviews abhängig; Vorabberatung ersetzt kein Gate.
- Für mehrere Teilaufträge ein dauerhaftes Gesamtbudget und übergreifende Abbruchbedingungen festlegen; keine Umgehung der drei Bauversuche durch neue Task-IDs.
- Offen: maschinenlesbarer Einstufungs-/Planvertrag, fachliche Rollen-/Modellqualifikation, Kostenreservierung und neue Tests. Keine neue Runtime-Funktion implementiert.

GC-AUTOMATION-10: Design an gerendertem Ergebnis prüfen.
- Bestehende Startscreen-/Design-/Aktivierungsbranches und tatsächlich geladene Styles zuerst abgleichen.
- Vor Änderung Referenz, Zielgruppe, Hauptaktion und prüfbare Akzeptanzkriterien festlegen; gemeinsame Tokens/Assets erhalten.
- Isolierten Kandidaten auf Desktop, Tablet und Handy rendern; vorher/nachher und relevante Zustände (Login, leer, Fehler, längere Inhalte) mit synthetischen Daten erfassen.
- Screenshot-Artefakte unveränderlich an Kandidaten-SHA, Build, Viewport und UI-Zustand binden; tatsächliche Bilder an bildfähige Prüfer übertragen. Ein Text über einen Screenshot genügt nicht.
- Unabhängige Kritik zu Hierarchie, Lesbarkeit, Verständlichkeit, Konsistenz und Touch-Nutzung. Technische Browserchecks für Überlagerung, Overflow, Bedienung und Regressionen ergänzen.
- Kritik priorisieren und gezielt reparieren; nach begrenzten erfolglosen Runden nachvollziehbarer Blocker. Keine Optimierung auf erfundene Qualitätsprozente.
- Martin behält visuelle Endabnahme; neue Gates dürfen nicht automatisch user_tested/production setzen.
- Offen: Browser-Rendering, Bildtransport/Providerqualifikation, datensparsame Artefakte, Budget und Gate-Vertrag. Keine Designreparatur oder visuelle Abnahme in diesem Arbeitsblock.

GC-AUTOMATION-11: Gesamtcode-Audit mit mehreren Modellen.
- Exakten Repo-/Integrations-Snapshot einfrieren; Module und Schnittstellen inventarisieren.
- Read-only Prüfaufträge pro Bereich und zusätzlich querliegende Abläufe: Import → Erstellung → Veröffentlichung → Abgabe → Auswertung; Auth/Rollen, Antwortschutz, Datenhaltung, Kosten und Deploy-Grenzen.
- Gemeinsame Befundliste mit Datei/Stelle, Reproduktion, Schwere und Gegenbelegen; Duplikate konsolidieren, Hypothesen kennzeichnen.
- Befunde werden kleine separate Reparaturaufträge mit vorhandenen Security-/Backend-/Games-/Native-Gates. Audit darf keine pauschale Web-Allowlist-Erweiterung auslösen.
- Gesamtbudget, Abdeckung und ausgelassene Bereiche sichtbar dokumentieren. Keine Behauptung eines vollständigen Audits aus wenigen Kontextdateien.
- Offen: Snapshot-/Modulplan, tatsächliche unabhängige Auditläufe und Befunde.

## Grenzen und nächster ausführbarer Schritt

Nur Plan/Anforderungen auf GitHub gesichert; Controller-Erweiterungen, Paid-Pilot, Produktdeploy und Gerätetest offen. Keine Secrets/Flags/Budgets geändert und kein API-/Cloud-Aufruf gestartet.
Nächster ausführbarer Schritt: dedizierte Secrets und Flags sicher einrichten, anschließend GC-AUTOMATION-07 mit einem kleinen aktuellen Web-Auftrag belegen. Danach GC-AUTOMATION-09/10 als gesonderte Controller-Erweiterung entwickeln; GC-AUTOMATION-11 als separat budgetierten Audit vorbereiten.
Aktuelles V2 reserviert maximal $5.50/Versuch, $16.50/Auftrag und $33/UTC-Tag. Das sind konfigurierte Reservierungsgrenzen, keine Zusage tatsächlicher Rechnung oder Preise neuer Prüfmodi.
