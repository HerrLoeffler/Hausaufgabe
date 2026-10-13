# GC-WEB-REPAIR-20261007 — Material-Uploadlimit 10

## Auftrag und Stand

Martin wollte die aktuelle Grenze von fünf Bildern beim Upload und bei der Testerstellung auf zehn erhöhen. Der vereinbarte Umfang ist die bestehende generische Grenze für hochgeladene Materialien: zehn Dateien insgesamt, darunter Bilder und Dokumente. Diese Änderung steht auf **staging_deployed**: PR [#227](https://github.com/HerrLoeffler/Hausaufgabe/pull/227) ist mit Commit `44ab6540a9ac0cd4a144dd25eb84a7198d22498b` in `feature/gradecrew-app-integration` integriert und als `2.3.1-gc38` auf Preview und kanonischem Staging veröffentlicht.

Das Browser-/Nutzerverhalten mit echten Uploads wurde nicht abgenommen. Autorentests, CI, Review und Deployment belegen die technische Stufe; sie sind kein echter Upload oder Gerätetest. Production wurde nicht angefragt und blieb unverändert.

## Änderung und Grenzen

Der gemeinsame Materiallimitwert ist 10 für die Auswahl und den serialisierten Request; der vorhandene Backend-Sanitizer behält bis zu zehn Materialien. Die vorhandene Überlaufbehandlung bleibt erhalten. MIME-Prüfung, 15-MB-Grenze je Datei, Quoten und sonstige Regeln bleiben unverändert. Generierte Bildfragen bleiben bei 0–5, Audio bei 5. Kein FastQuiz-, Native-, Rules- oder Workflow-Verhalten wurde geändert.

## Nachweise

- Quellbranch `fix/staging-feedback-images10-20261013`, PR-Head `685de7865d52a4549cc00adf7cadeacbbf0b9497`; Basis `fd9a8f990c9951c2b1f7b7a254d8ca009e39fabf`.
- Kandidaten-Node-22-CI: Run `38353390214`, Job `115150651089`, erfolgreich. Merge-CI `38353699126` und Admin-CI `38353699178` erfolgreich.
- 13 gezielte Autorentests bestanden; unabhängiger Review APPROVED, dokumentiert in `analysis/GC-WEB-REPAIR-20261007-IMAGE-LIMIT/review-bdbf59b.md` (SHA-256 `4c1333c332e4721632646b44d0185254db18f87d1104e4e85a635d152edd10fb`).
- Preview-Deploy Run `38353858238`, Receipt `11791359970`, 164 Dateien: https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app
- AI- und Assessment-Functions-Deploy Run `38353858268`, Receipts `11791594353` und `11791976375`, erfolgreich; Quelle jeweils Commit `44ab6540a9ac0cd4a144dd25eb84a7198d22498b`.
- Kanonisches Staging Run `38354325678`, Receipt `11791699830`; der öffentliche Release-Eintrag bestätigt `44ab6540a9ac0cd4a144dd25eb84a7198d22498b`, `2.3.1-gc38` und 164 Dateien: https://hausaufgabe-staging.web.app
- Manifest und ausgelieferte Dateien bestätigen das Limit 10; alle 29 bestehenden Crew-PNGs blieben erhalten. Echte Dateien wurden nicht hochgeladen, keine Testaufgabe mit echten Dateien erstellt und keine kostenpflichtige Generierung ausgelöst.

Die Detailreceipts stehen in [feedback-images10-release-receipts-20261013.json](feedback-images10-release-receipts-20261013.json).

## Nächster Schritt

Martin prüft den tatsächlichen Ablauf mit einem Upload und einer Testerstellung auf dem kanonischen Staging. Danach kann die Nutzer-/Geräteabnahme mit ihrem echten Ergebnis dokumentiert werden. Versuchshistorie und vorhandenes Budget bleiben erhalten; kein weiterer Deploy ist Teil dieses Abschlusses.
