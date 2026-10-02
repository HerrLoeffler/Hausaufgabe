# GradeCrew Release Control

Diese Ebene beantwortet zwei andere Fragen als der Development Status:

- **Development Status:** Wer arbeitet gerade woran, auf welchem Branch und mit welchen Überschneidungen?
- **Release Control:** Welche Produktfunktionen existieren, wie weit sind sie technisch, was ist wirklich auf einem Testziel angekommen und was hat Martin auf genau diesem Stand bereits abgenommen?

## Dateien

- `catalog.json`: langlebiges Feature-/Testinventar. Hier stehen stabile Test-IDs und die Zuordnung zu Workstreams.
- `acceptance.json`: ausschließlich manuelle Abnahmeergebnisse. Ein `passed`, `failed` oder `skipped` muss immer den getesteten `testedSha` enthalten.
- `tools/release_control.py`: read-only Generator; kombiniert Katalog, Abnahme, `GRADECREW_STATE.json`, Registry, Git-Refs und GitHub-Actions-Receipts.
- `.github/workflows/release-control.yml`: erzeugt GitHub Job Summary sowie JSON-/Markdown-Artefakt.

## Manuelle Abnahme

Martin muss die JSON-Datei nicht selbst bearbeiten. Im betreuenden Chat reicht zum Beispiel:

- „Tutorial Sortieren ist auf dem iPad gut.“
- „Remy Sprache setzt das falsche Fach; bitte reparieren.“
- „Secure Load Test überspringen wir für diesen internen Stand.“

Der betreuende Chat prüft zuerst den aktuellen Ziel-SHA und trägt dann die passende Test-ID in `acceptance.json` ein, z. B.:

```json
{
  "TUTORIAL-ORDER-01": {
    "status": "passed",
    "testedSha": "<vollstaendiger SHA>",
    "note": "Auf iPad praktisch geprüft",
    "testedAt": "2026-10-02"
  }
}
```

Bei einem Fehler wird `status: failed` mit einer kurzen reproduzierbaren Beobachtung gespeichert. Der Fehler gehört anschließend in einen eigenen Fix-Workstream/Branch. Sobald sich der Ziel-SHA ändert, zeigt Release Control ein altes `passed` oder `failed` automatisch als **Retest** an. Ein alter Haken darf niemals still auf einen neuen Release übertragen werden.

## Statusbedeutung

- `⬜ pending`: auf dem Testziel vorhanden, manuelle Abnahme offen.
- `✅ passed`: auf exakt diesem Ziel-SHA manuell bestanden.
- `❌ failed`: auf exakt diesem Ziel-SHA Fehler gemeldet.
- `🔁 retest`: Ergebnis stammt von einem älteren Ziel-SHA.
- `🧪 not_on_staging`: Feature/Test ist entwickelt oder geplant, aber noch nicht vollständig auf dem zugehörigen Testziel.
- `➖ skipped`: bewusst nicht Bestandteil dieser Abnahme.

## Sicherheitsgrenzen

Release Control ist **read-only gegenüber Deployments und Produktdaten**. Es darf keine Branches mergen, nichts deployen und niemals Production freigeben. Deployment-Receipts sind Nachweise, keine Deploy-Anweisungen. Production bleibt ausdrücklich manuell freigabepflichtig.


## Nachweisgrenzen nach Audit (02.10.2026)

- Hosting, Functions und Gateway werden aus dem **Inhalt** des neuesten vertrauenswürdigen Deployment-Receipts gelesen. Workflow-Datei, Repository, Event, Zielbranch, ZIP-Digest, Projekt, Scope und Verifikation werden geprüft. Ein Artefaktname allein genügt nicht.
- Ein neuerer fehlgeschlagener/abgebrochener/laufender Deploy sperrt die aktuelle Bestätigung. Alte erfolgreiche Runs werden nicht als Ersatz verwendet.
- Archiv-Tags belegen einen historischen Hosting-Snapshot. Sie beweisen weder den aktuell ausgelieferten Stand noch einen Datenbank-/Functions-Restore.
- Dokumentierter State und Branchspitzen sind keine Deployment-Nachweise. Fehlende Daten bleiben unbekannt. Games-Receipts und die Bindung von iOS-Build plus geladenem Web-Release sind noch offen.
- Die technische Web-Ampel betrifft ausschließlich CI, Hosting und AI-Functions. `stagingComplete` bleibt in V2 gesperrt: Rules-/Security-Nachweis und fachliche Freigabe sind noch nicht angebunden. Production wird durch diesen Bericht weder geprüft noch freigegeben.
- Eine grüne Workflow-Ausführung bedeutet, dass der **Bericht erzeugt** wurde. Sie bedeutet nicht, dass alle Produkt-Gates grün sind.
- Das Board ist eine Actions-Übersicht, noch keine interaktive Abnahme-Weboberfläche. Direkte Eingabe, revisionssichere Fehlerhistorie, Fix-Zuordnung und Retest-Aufträge sind offene Ausbauschritte. Vor Änderung eines bisherigen Ergebnisses dessen Fehlerverlauf in der Workstream-Übergabe erhalten.
- Auch bei gültigen Receipts können spätere manuelle Cloud-Änderungen außerhalb dieser Workflows unbemerkt bleiben. Für laufende Drift-Erkennung fehlen noch Live-Manifest-/Revision-Abgleiche und ein maximales Nachweisalter.

Tests: `python3 -m unittest tools.test_release_control -v`. Sie benötigen weder Cloud-Zugang noch bezahlte KI-Aufrufe.
