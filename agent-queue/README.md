# Codex-Aufträge

Eine neue JSON-Datei auf main löst nach Aktivierung den Worker aus. Pro Push genau eine neue Aufgabe. Vorher aktuellen Aufgabenbranch und Überschneidungen prüfen. Aufgaben nacheinander einreichen und auf den Abschluss warten: GitHub-Concurrency ist kein dauerhafter Queue-Dienst und kann ältere wartende Runs ersetzen.

Beispiel (nicht als fertige Aufgabe verwenden):

```json
{
  "id": "tutorial-submit-01",
  "base_branch": "feature/gradecrew-app-integration",
  "base_sha": "EXAKTEN_VERIFIZIERTEN_40_STELLIGEN_COMMIT_EINTRAGEN",
  "goal": "Konkretes Fehlerbild und gewünschte Änderung",
  "acceptance": "Reproduzierbarer Ablauf und Erfolgskriterien",
  "constraints": "Betroffene Dateien, nicht verändern, relevante Tests"
}
```

Dateiname = ID + `.json`. Wiederholung über Actions → GradeCrew Codex worker → Run workflow → Task-ID. Eine Wiederholung kann erneut API-Kosten verursachen. Kein automatischer Retry.

Ergebnis: Actions-Artefakt mit `changes.patch`, Basiscommit, Auftrag und Bericht. Auch ein Teilergebnis bleibt bei normalem Fehler gesichert; harte Runner-Abbrüche können die Sicherung verhindern. Nach 30 Tagen läuft das Artefakt ab. Der betreuende Chat muss es prüfen und brauchbare Arbeit auf einem eigenen Branch sichern, testen und integrieren. Der Worker besitzt keine Push-/Deploy-Rechte. Automatische PR-Erstellung ist noch nicht eingerichtet.
