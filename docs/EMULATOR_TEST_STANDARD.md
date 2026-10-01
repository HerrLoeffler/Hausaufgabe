# GradeCrew Emulator-Teststandard

Der Emulator ist ein Pflicht-Gate für Änderungen, die Firebase-Sicherheit, Firestore-Daten, serverseitige Funktionen, Transaktionen oder Berechtigungen berühren.

## Warum

Unit-Tests beweisen einzelne Funktionen. Sie beweisen nicht automatisch, dass Firestore Rules, Functions, Auth-Kontext und Transaktionen zusammen korrekt funktionieren. Der Emulator ergänzt diese Lücke ohne Staging- oder Production-Daten zu verändern.

## Teststufen

1. **Unit/Contract**: reine Logik, Parser, Validatoren, Datenverträge.
2. **Rules Emulator**: echte `firestore.rules` mit anonymen, Lehrer- und Admin-Kontexten.
3. **Functions Emulator**: echte exportierte Callable/HTTP-Funktionen gegen emuliertes Firestore.
4. **Lifecycle Integration**: z. B. Start → Attempt → Submit → Receipt einschließlich Wiederholungen und Fehlerfällen.
5. **Concurrency/Idempotenz**: parallele Starts/Abgaben dürfen keine doppelten oder widersprüchlichen Zustände erzeugen.
6. **CI-Gate**: die gleichen Emulator-Suites laufen in Pull Requests automatisch.
7. **Staging/Gerät**: bleibt separat und wird durch Emulatorerfolg nicht ersetzt.

## Dauerhafte Regeln für neue Entwicklungsbereiche

Ein neuer Firebase-relevanter Workstream muss im Handoff eine kleine Testmatrix führen:

| Änderung | Unit | Rules Emulator | Functions Emulator | Parallel/Idempotenz | Staging/Gerät |
|---|---|---|---|---|---|
| Beispiel | ✅/n. a. | ✅/n. a. | ✅/n. a. | ✅/n. a. | offen |

`n. a.` braucht eine kurze Begründung. "Noch nicht getestet" wird als `offen`, nicht als `n. a.` markiert.

## Zentrale Test-Suite

`emulator-tests/` enthält projektweite Sicherheits- und Lifecycle-Tests. Sie soll gemeinsame Grundgarantien schützen, zum Beispiel:

- fremde private Lehrerdaten sind nicht lesbar;
- Legacy-Abgaben bleiben clientseitig gesperrt;
- serverprivate Collections bleiben clientseitig gesperrt;
- veröffentlichte Testmetadaten können nur im vorgesehenen Umfang gelesen werden;
- Secure Assessment startet atomar;
- das Schülerpapier enthält keine Lösungsschlüssel;
- falsche Attempt-Tokens werden abgewiesen;
- wiederholter Start mit derselben Client-ID ist idempotent;
- parallele/repetierte Abgaben erzeugen nur eine konsistente Submission.

Domänenspezifische Workstreams ergänzen weitere Tests; sie dürfen die zentralen Grundtests nicht ersetzen.

## Lokaler Aufruf

Wenn der Branch `firebase.json` und `firestore.rules` enthält:

```bash
bash tools/run_emulator_tests.sh
```

Das Script installiert nichts global und deployed nichts. Es startet nur lokale Emulatoren und beendet sie nach dem Test.

## CI

`.github/workflows/development-gates.yml` enthält zwei unabhängige Gates:

- **Branch Governance**: Registry, Handoffs, Branch-/PR-Zuordnung und potenzielle Dateiüberschneidungen.
- **Firebase Emulator**: nur wenn der geprüfte Merge-Stand `firebase.json` und `firestore.rules` enthält.

Der Emulator-Job darf keine Deployment-Schritte enthalten und benötigt keine Production-Zugangsdaten.

## Sicherheitsgrenze

Ein grüner Emulator-Test bedeutet **nicht**:

- Staging deployed;
- Production freigegeben;
- echtes iPad/iPhone/Desktop geprüft;
- Lasttest bestanden;
- Datenschutz-/Retention-Freigabe abgeschlossen.

Diese Zustände bleiben getrennt dokumentiert.
