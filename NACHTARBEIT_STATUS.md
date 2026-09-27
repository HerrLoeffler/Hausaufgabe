# Übernahme nach unterbrochenem Work-Chat

Stand: 27.09.2026. Basis: `07def522c50b4e347d6c5ac6d9efeef16d377db3`, Branch `feature/ai-integration`.

## Erreichbarer Stand

- Lokaler alter Projektordner und GitHub hatten denselben sauberen Stand ai25.
- Die am 27.09. abgerufene Staging-Datei app.js stimmt bytegenau mit dieser Basis überein.
- Die zuletzt im hängenden Chat angezeigten uncommitteten Änderungen sind hier nicht vorhanden. Sie wurden nicht als übernommen oder geprüft ausgegeben.
- Der ältere Arbeitsplan dokumentiert, dass der auf Staging laufende Functions-Code noch nicht vollständig in GitHub abgeglichen ist. Die Sperre für vollständige Deployments bleibt bestehen.

## Fertig implementiert: ai26 / gemeldete KI-Fehler

- Bericht und Ausblendstatus werden in einem Firestore-Batch gespeichert: entweder beides erfolgreich oder der Hinweis bleibt erneut meldbar.
- Der Status liegt im Benutzerprofil und wird bei erneuter Anmeldung/Neuladen auch auf einem anderen Gerät berücksichtigt.
- Fehlgeschlagene Aufträge erhalten „Ausblenden“, insbesondere für bereits früher gemeldete Fehler. Alte Berichte werden nicht automatisch nachträglich zugeordnet.
- Laufende Aufträge und erfolgreiche Ergebnisse werden nicht durch die Fehlerquittierung versteckt.
- Beim Löschen eines Teilentwurfs verschwindet auch dessen Fehlerkarte. Das Löschen eines Ausgangstests blendet einen eigenständigen ähnlichen Auftrag nicht aus.
- Fehlerkarten unterscheiden identische Fehlermeldungen verschiedener Aufträge anhand der Job-ID. Beim Kontowechsel werden alte Fehlerkarten entfernt.
- Gespeicherte Teilentwürfe und technische Berichte bleiben erhalten. Keine Änderung an Functions oder Firestore-Regeln.

## Verifikation

- 10 Frontend-Tests erfolgreich, einschließlich tatsächlichem Report-Handler mit simuliertem Firestore-Batch: Erfolg, Schreibfehler, Kontowechsel sowie Sichtbarkeitsregeln.
- 56 vorhandene Functions-Tests erfolgreich nach Installation der Abhängigkeiten.
- Functions-Syntax und ESLint erfolgreich; Browser-Syntax und `git diff --check` erfolgreich.
- Lokal Node 24.19.0; GitHub-CI verwendet wie bisher Node 22.
- Keine authentifizierte Browser-Abnahme und kein Firebase-Deployment aus dieser Umgebung; Firebase-CLI/Cloud-Shell-Zugriff fehlt.

## Noch erforderlich

1. Hosting-Korrektur nach Staging bringen, nach sauberem Pull über `./deploy-staging-hosting.sh`. Vorher lokale Cloud-Shell-Änderungen sichern; keinen Reset und keinen vollständigen Deploy verwenden.
2. Auf Staging Fehler melden, Reload/zweites Gerät, alten Fehler ausblenden und Teilentwurf kontrollieren.
3. Aktuellen Cloud-Shell-Functions-Code und eventuell uncommittete Änderungen aus dem unterbrochenen Chat übernehmen, bevor `quality-review unavailable` bearbeitet wird. Aus der Report-ID RPT-MUJI0DI4-747FF lässt sich keine gesicherte Ursache durch Löschen des Ausgangstests ableiten.

Produktion bleibt unberührt.
