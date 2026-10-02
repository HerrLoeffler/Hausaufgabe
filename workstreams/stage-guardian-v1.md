# Stage Guardian: automatische Fortsetzung statt bloßer Statusanzeige

Task GC-AUTOMATION-03. Branch `feature/stage-guardian-v1` → main.
Basis `e4f36925a1e315653e1292ef59faf3d78b3ed320` frisch geprüft. Main-Regeln, State, TODO, Registry, Worker, offene PRs und Development Status `37076416951` gelesen. Keine parallele Guardian-Implementierung gefunden.

## Nutzerziel und bisherige Lücke
Funktionen sollen automatisch von Entwicklung über Tests, unabhängige KI-Prüfung, kontrollierte Integration und technischen Staging-Deploy weiterbearbeitet werden. Nach maximal drei erfolglosen Versuchen je Stufe stoppen, Ursache und benötigte Entscheidung sichtbar machen. Geräteabnahme und ausdrückliche Production-Freigabe bleiben menschlich; eine KI darf diese Nachweise nicht erfinden.

Die bisherigen Release-/Development-Boards sind Beobachter. Der vorhandene Codex-Worker liefert lediglich ein Patch-Artefakt. Er veröffentlicht keine PRs, führt keine unabhängigen Multi-Provider-Reviews aus und integriert nicht. Deshalb konnte die gewünschte automatische Kette nicht allein durch diese Boards entstehen.

## Gebauter erster ausführbarer Teil
- Separater Stage-Guardian-Workflow nach CI/Worker/Board-Abschluss, regelmäßig und manuell.
- Explizite auf Task und SHA gebundene Fortsetzungserlaubnis; keine pauschale Bearbeitung sämtlicher unbekannter Branches.
- Tatsächlicher Dispatch des vorhandenen isolierten Workers, wenn Policy/Variablen/Key und Auftrag eingerichtet sind.
- Persistenter Versuchszähler auf eigenem Ledger-Branch, mit Compare-and-swap. Reservierung **vor** Dispatch; Timeout/unklarer Dispatch sperrt Doppelstart.
- Maximal drei Versuche pro Workstream/Stufe; neuer Code-SHA setzt das Budget nicht still zurück. Maximal ein Dispatch je Controller-Lauf.
- Stopps für veränderte Quellen, fehlende Einrichtung, unabhängige Reviews, fehlende Receipts, Nutzerabnahme und Production-Freigabe.
- Nicht konfigurierte Baustellen und weiterhin fehlende Ausführungsschritte im Bericht ausdrücklich sichtbar.

## Grenzen – nicht als komplette Automatik melden
Policy ist deaktiviert, ohne aktive Aufgaben. Noch kein bezahlter KI-Aufruf und keine automatische Integration/Veröffentlichung durch diese Arbeit.
Weiterhin fehlen:
1. Geprüften Worker-Patch auf einen eigenen Branch/PR veröffentlichen, zulässige Dateien und Ausgangs-SHA erzwingen.
2. Unabhängige, SHA-gebundene OpenAI/Claude/Gemini-Reviews samt Konfliktauflösung und begrenztem Kostenbudget.
3. Zusammengeführten PR-Stand vollständig testen und nur explizit zugelassene Integration automatisch durchführen.
4. Abgeschlossene Worker-Runs und Feedback sicher ins Ledger zurückführen; ohne dieses Reconciliation bleibt ein gestarteter Versuch gesperrt. Keine blinden Auto-Retries.
5. Deployment-Receipts aller benötigten Komponenten anschließen; Rules/Security-Cutover bleibt eigener Gate.

## Aktivierung / Nachweis
Der Connector erlaubt in diesem Kontext keine Abfrage von Actions-Variablen/Secrets; deren Vorhandensein wurde nicht aus Erinnerung angenommen. Der neue Actions-Bericht kann Worker-Flag und Key-Präsenz als Boolean prüfen, ohne den Secretwert auszugeben.

15 lokale Verhaltenstests: Policy-/Production-Grenzen, unveränderliche Quellen, Budget-/Replay-Schutz, CAS, tatsächliche Reservierungsreihenfolge, unbekannter Dispatch, fehlendes Credential und neue Quelle zwischen Planung/Ausführung. CI und realer read-only Guardian-Bericht nach Push prüfen.

## Nächster konkreter Schritt
Zuerst Patch→PR-Brücke und unabhängige Reviews fertigstellen. Danach genau einen reversiblen Pilot-Auftrag aufnehmen, Worker-Key/Variablen im sicheren GitHub-Setup bestätigen und vollständigen Durchlauf nachweisen. Erst danach weitere Workstreams aktivieren. Der Guardian ist nicht schon deshalb aktiviert, weil sein Workflow vorhanden ist.
