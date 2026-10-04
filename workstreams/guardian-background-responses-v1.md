# Guardian OpenAI background responses – 2026-10-04

## Anlass

Der echte Startscreen-Auftrag `startscreen-masterpiece-v2-20261004` wurde am aktuellen, freigegebenen Web-Stand aufgenommen. Der Build-Job in Run `37220142576` erreichte den einzigen GPT-6.1-Sol-Build-Aufruf, lief aber nach ca. 242 Sekunden in den bisherigen synchronen 240-Sekunden-Socket-Timeout. Es entstand kein Kandidat; Publish, Validation, Reviews und Integration wurden nicht ausgeführt. Der Ledger blieb fail-closed bei `stopped`; Production blieb unverändert.

Der vorangegangene kleine Guardian-Pilot hat dagegen Builder, Combined Validation, GPT-6 Astra, Claude Sonnet 5.5, GPT-6 Sol, Integration und Staging-Receipts real erfolgreich belegt. Modellzugriff und Review-Keys sind damit nicht mehr der Blocker.

## Ursache

`tools/automation/model_calls.py` hat OpenAI Responses bisher synchron mit `urlopen(..., timeout=240)` ausgeführt. Größere High-Reasoning-Webaufträge können länger als vier Minuten rechnen. Ein lokaler Socket-Timeout macht das Provider-Ergebnis anschließend absichtlich unbekannt; ein automatischer Retry ist korrekt verboten, weil sonst ein zweiter bezahlter Auftrag entstehen könnte.

## Lösung

OpenAI-Aufrufe werden mit `background: true` gestartet und anschließend ausschließlich über die erhaltene `resp_...`-ID per GET auf denselben Response gepollt.

Sicherheitsregeln:
- genau ein POST / ein bezahlter Modellauftrag;
- Polling erzeugt keinen neuen Modellauftrag;
- `store: false` bleibt gesetzt;
- keine Tools;
- Modell, Tokenlimits, Kostenprofile und Revieweridentitäten bleiben unverändert;
- POST- oder Retrieval-Ambiguität bleibt fail-closed;
- nach 600 Sekunden wird nicht neu erzeugt, sondern mit der bekannten Response-ID gestoppt;
- Build- und Review-Jobs erhalten 15 Minuten Workflow-Zeit, damit Polling nicht vom 8-Minuten-Joblimit abgeschnitten wird.

## Tests

`tools/automation/test_pipeline.py` schützt:
- OpenAI-Aufträge setzen `background: true`;
- ein queued Response wird über dieselbe ID abgeholt;
- es entsteht genau ein POST und danach GET;
- bestehendes fail-closed Verhalten bei unbekanntem Netzwerkergebnis bleibt erhalten.

## Startscreen-Fortsetzung

Der alte Masterpiece-v2-Auftrag wird nicht blind wiederholt und sein 2,40-USD-Reservat nicht zurückgesetzt. Nach Integration dieses Infrastrukturfixes und des separaten Startscreen-i18n-Nachtrags wird ein neuer, explizit gepinnter Designauftrag mit neuer Task-ID zugelassen. Damit ist der neue Auftrag fachlich erweitert (Design + bestätigte bilinguale UI-Grenze) und kein heimlicher Retry des gestoppten Calls.

## Status

- Codefix auf GitHub: ja
- CI: offen bis PR-Checks
- main integriert: nein
- neuer bezahlter Startscreen-Aufruf: nein
- Staging/Production: unverändert
