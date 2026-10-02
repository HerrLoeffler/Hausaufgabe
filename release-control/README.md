# GradeCrew Release Control

Diese Ebene beantwortet zwei andere Fragen als der Development Status:

- **Development Status:** Wer arbeitet gerade woran, auf welchem Branch und mit welchen Überschneidungen?
- **Release Control:** Welche Produktfunktionen existieren, wie weit sind sie technisch, was ist wirklich auf einem Testziel angekommen und was hat Martin auf genau diesem Stand bereits abgenommen?

## Dateien

- `catalog.json`: langlebiges Feature-/Testinventar. Hier stehen stabile Test-IDs und die Zuordnung zu Workstreams.
- `acceptance.json`: ausschließlich manuelle Abnahmeergebnisse. Ein `passed` oder `failed` muss immer den getesteten `testedSha` enthalten.
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

Bei einem Fehler wird `status: failed` mit einer kurzen reproduzierbaren Beobachtung gespeichert. Der Fehler gehört anschließend in einen eigenen Fix-Workstream/Branch. Sobald sich der relevante Ziel-SHA ändert, zeigt Release Control ein altes `passed` oder `failed` automatisch als **Retest** an. Ein alter Haken darf niemals still auf einen neuen Release übertragen werden.

## Statusbedeutung

- `⬜ pending`: auf dem Testziel vorhanden, manuelle Abnahme offen.
- `✅ passed`: auf exakt diesem Ziel-SHA manuell bestanden.
- `❌ failed`: auf exakt diesem Ziel-SHA Fehler gemeldet.
- `🔁 retest`: Ergebnis stammt von einem älteren Ziel-SHA.
- `🧪 not_on_staging`: Feature/Test ist entwickelt oder geplant, aber noch nicht vollständig auf dem zugehörigen Testziel.
- `➖ skipped`: bewusst nicht Bestandteil dieser Abnahme.

## Sicherheitsgrenzen

Release Control ist **read-only gegenüber Deployments und Produktdaten**. Es darf keine Branches mergen, nichts deployen und niemals Production freigeben. Deployment-Receipts sind Nachweise, keine Deploy-Anweisungen. Production bleibt ausdrücklich manuell freigabepflichtig.
