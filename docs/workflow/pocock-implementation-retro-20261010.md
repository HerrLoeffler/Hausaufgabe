# Gezielte Retro: Quellen, Vertragsfelder und tatsächliche Bereitschaft

GC-POCOCK-IMPLEMENT-01; konkrete Session dieses Toolingpakets am10.10.2026.
Keine regelmäßige Vollretro, globalen Skilländerungen oder neue Prozessdatenbank.

## Drei belegte Beobachtungen

1. Der erste lokale Lauf meldete zwei der114 vorhandenen Automationtests rot.
   Beide JavaScript-Berichtstests hatten kein Node im PATH; derselbe unveränderte
   Testbestand war mit dem gebündelten Node114/114grün. Bestehende Handoff-CI
   hatte Node verfügbar und war bereits grün. **Keine neue Runtime installieren
   oder Produktcode ändern.** Lokale Startvoraussetzung in der Übergabe festhalten.
2. Das native Worktree-Werkzeug fand im Chatverzeichnis kein Gitrepository, der
   reguläre HTTPS-Push keine Anmeldung. Ein isolierter öffentlicher Clone mit
   regulärer Netzwerkberechtigung und der vorhandene GitHubconnector bewahren
   Scope/History. Lokaler1719b0d undRemote9ccab61 besitzen denselbenGitbaum
   5b158096b5eda43f06b981456306481ea33c8ef4. **Keine Credentials beschaffen,
   keine fremden Checkouts resetten.** Quellenbindung getrennt von Gitidentity.
3. Koordinationsschema, Releaseboard und Guardian prüfen vorhandene Verträge;
   sie prüfen bisher keinen konkreten Brief/Claim-/Abhängigkeitsgraph. Im ersten
   CLI-RED konnte kein Brief ausgewertet werden. Ein zusätzlicher gezielter
   RED zeigte, dass fehlende Prioritäten fälschlich gültig waren; ein weiterer
   RED, dass Routine unnötig eine Frage hätte erfinden müssen. **Ausgewähltes
   mechanisches Delta:** opt-in-Vertragsprüfung und read-onlyFrontier in der
   vorhandenen Handoff-CI; keine Verdopplung des Controllers/der Releasegates.

## Tatsächlich angewandte Verbesserung

`tools/workstream_checks.py` validiert deklarierte Quelle, Owner, Scope,
Prioritäten, Abnahme und Recovery-/Reviewfelder. Entscheidungs-IDs müssen eindeutig
sein, Abhängigkeiten bekannt und azyklisch. Unbeanspruchte Fragen sind keine
ausführbare Frontier; laufende/unklare Ergebnisse unterdrücken sie. Fehlende
Pflichtprofile und gelöschte Briefblöcke lassen den bestehenden CIverbraucher
scheitern. Tests bedienen die echte CLI mit getrennten handgeschriebenen Fixtures,
prüfen Exitcode/JSON und unveränderte Datei-Hashes; keine Prosa-/Implementierungs-
Spiegeltests. Der aktuelle Handoff und PR werden tatsächlich mit der Vorlage
erstellt und durch den vorhandenen unabhängigen Reviewer auf beiden Achsen geprüft.

Das ist ein wirksamer deklarativer Guard, **keine** externe SHA-/Kosten-/Reviewer-
Identitätsverifikation, atomare Claim-Sperre oder sichere automatische Retryfreigabe.
Belege und Budgethistorie aus echten Quellen weiter prüfen. Security-/npmstopps,
Production-/Staginggates und separate QA-/Pluginowner bleiben erhalten.

## Reproduktion / Grenzen

```sh
python3 -m unittest discover -s tools -p 'test_workstream_checks.py' -v
python3 tools/workstream_checks.py --registry workstreams/registry.json --require-task GC-POCOCK-IMPLEMENT-01
```

Negative Tests zeigen unbekannte/laufende Ergebnisse ohne ready-Arbeit,
unzulässige Zeiger/fehlende Briefs/Source/Owner/Prioritäten mit Exit1, Routine ohne
Fragen mit leerer Frontier. Keine Netz- oder Provideraufrufe. Original-RED-/GREEN-
Logs stehen lokal unter `/private/tmp/gc-pocock-*`; finale Kandidaten-/CIbindung
und unabhängige Nachfahrt werden in der vorhandenen Aufgabenübergabe ergänzt.
Web-/Native-/OS-/Gerätewirkung und messbare Kostenersparnis sind keine Ergebnisse
dieser CLIprobe. Die echte Games-Savepräferenz bleibt beim Nutzer/Spieleowner.
