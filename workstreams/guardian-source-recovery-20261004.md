# GC-AUTOMATION-13: Quellenvertrag des diagnostizierten Guardian-Piloten

- Auftrag: Martin, 04.10.2026: den veralteten Web-Quellvertrag lösen und vorhandene Versuche/Budget erhalten.
- Branch: `fix/guardian-source-recovery-20261004`, Ziel `main`, Basis `589fc98a0fc96b4338a08e5d1257f8b1cddd8364`.
- Live-Abgleich: Web `f30fa44a383b279bcc49967d2ef0d1840243b27e`; Ledger `48d7c07c0416313a50e7b2c58df9bba09cdf4b98`; bestehender Pilot-PR #78 unverändert. Keine konkurrierende offene Quellenreparatur festgestellt. Development Status lokal frisch ausgeführt, PR-Abgleich separat über GitHub.

## Ursache und begrenzte Lösung

Recovery 37214298339 verweigert den fortgeschriebenen Web-Branch vor Ledger-Schreiben und Dispatch. Der alte Pilot basiert auf eb80c5e6; seine konkrete Tutorial-CSS ist auf f30fa44a unverändert. Ein optionaler expliziter `sourceUpdate` bindet ursprünglichen vollständigen Auftrag/Hash, neuen Basis-SHA/Hash und alle ausgewählten Blob-SHAs. Ausschließlich `base_sha` darf wechseln. Abstammung, beide Blob-Versionen, aktueller Zielbranch und aktuelle main-Freigabe werden vor einer Ledger-Änderung geprüft.

Der alte Versuch erhält nur den bestehenden Recovery-Marker mit ursprünglichem Zustand/Grund. Seine ursprünglichen taskHash/approvedSha, Publikation, Modellnutzung und Budgetreservierung bleiben stehen. Der nächste reguläre Versuch wird in derselben Historie separat reserviert. Sein Build, seine exakte CI und alle drei unabhängigen Reviews laufen neu. Der alte Kandidat darf als Reparaturkontext dienen; seine Baum-/Elternbindung bleibt am ursprünglichen Commit geprüft. Kein allgemeines Rebase, kein bezahlter Rerun, kein Budgetreset.

Die Homepage-Nachfolge enthält durch PR #91 einen anderen Basis-SHA als ihr alter Aufnahmeauftrag. Beide werden gemeinsam auf die erneuerte Pilotbasis gepinnt, nachdem alle drei genehmigten Homepage-Blobs zwischen altem Auftrag, PR-91-Basis und aktuellem Web unverändert nachgewiesen wurden. Produktbrief, CSS-Allowlist, Kontext, Kostenprofil und Gesamtbudget bleiben erhalten. Aufnahme weiterhin erst nach echten Pilot-Staging-Receipts.

## Belege und Stand

- Regressionen zuerst rot: bestehende Recovery verweigerte `sourceUpdate`; Prepare verweigerte den historischen Kandidatenelternteil.
- Lokal: 97 Automation-Verhaltenstests grün; neuer Quellvertrag/Budget-/Kontext-/Abstammungs-/Widerrufs-/Race-/Prepare-Test enthalten.
- Ursprünglicher bezahlter Run: 37196835882; ein Versuch, 0,85 USD konservativ reserviert, 0,023296 USD bekannte Nutzungsschätzung. Gesamtgrenze weiterhin drei Versuche / 2,55 USD.
- Quellenfix integriert: PR #95, Merge b49793cd9ae0073024f5a17191dd8d623ab523cb. Vier finale Checks grün: Guardian 37217124832, Handoff 37217124802, Development Status 37217124823, vollständige isolierte Web-Rehearsal 37217125121.
- Recovery 37217267732 wurde in der gemeinsamen Status-Warteschlange vor jedem Job abgebrochen (Jobs leer). Guardian 37217267635 bestätigt weiterhin ursprünglichen Stopp / 1 von 3 Versuchen; Ledger und Reservierung unverändert. Folgefix fix/guardian-recovery-queue-20261004 gibt Recovery eine eigene Warteschlange. Übersprungene upstream-Ereignisse erhalten im Stage Guardian ebenfalls eine getrennte Warteschlange, damit sie keinen wartenden regulären Dispatch verdrängen. CAS und dauerhafte Ledger-Reservierungen bleiben das Schreib-/Versuchs-Gate; keine bezahlten Jobs erneut gestartet.
- Production und Geräteabnahme unverändert offen.

## Nächster Schritt / Wiederaufnahme

Review und exakte PR-CI prüfen; Quell-/main-Stand vor Merge erneut abgleichen. Danach automatischen einmaligen Recovery- und regulären Guardian-Lauf anhand Ledger, Jobs und Receipts verfolgen. Bei unbekannten Ergebnissen oder neuem Quellwechsel stoppen und Diagnose festhalten; keine Versuche zurücksetzen.

## Parallele Web-Integration während der Queue-Prüfung

PR #96 wurde inzwischen auf Web integriert: 256609f81f601896a9e683f67945743df6b2f29f. Pilot-CSS, Homepage-CSS und Entry-Kontext unverändert. startup.js hat ausschließlich aktualisierte i18n-Importversionen und den neuen assessment-locale-ui-Import nach app.js. Neuer vollständiger Auftrag/Policy/Recovery werden vor dem ersten neuen Versuch auf diesen aktuellen SHA gepinnt. Homepage-Quellvertrag ebenfalls explizit erneuert: ihr aktualisierter read-only Startup-Kontext wird frisch gelesen/geprüft und mit seinem neuen Blob-SHA gebunden; Produktbrief, zulässige CSS-Datei und Budget bleiben unverändert. Kein früherer Homepage-Versuch vorhanden.

## Echter Recovery- und Ausführungsnachweis

Queue-/Quellvertrag-Folgefix #97 integriert: 2a2a9912cc34c8afed19c3260f254d45ceb613b1. Finale CI am a6f50978: Guardian 37217907190, Handoff 37217907187, Development Status 37217907202 und vollständige isolierte Web-Rehearsal 37217907349 grün.

Recovery 37218071013 / Job 111482576127 erfolgreich. Sein single-use Marker ist dispatched. Ursprüngliche taskHash/approvedSha/Publikation/Usage/Run-Daten und die erste Reservierung wurden mit dem vorigen Ledger feldweise identisch nachgewiesen. Genau ein neuer Versuch run-37218071006-1 wurde reserviert: Gesamthistorie 2/3, Reservierungen 1,70/2,55 USD. Ausführung 37218095594: prepare, build und publish erfolgreich; kombinierte CI läuft noch. Der ursprüngliche Kandidat ist Referenz, der neue Lauf benutzt den aktuellen 256609f-Quellvertrag. Production unverändert; E2E-/Staging-Abschluss noch nicht behauptet.

## Finaler Quellen-/Pilotnachweis

Vollständiger neuer Run 37218095594 mit exakter CI, drei unabhängigen Freigaben und direkter Integration grün. Integrierte CI 37218270539 grün. Staging-Übergabe #102 /1825bad hat vorhandenen Nachweis an beiden unveränderten Staging-Scopes qualifiziert. Hosting 37219916184 nach genau einem dauerhaft reservierten Wiederholungsversuch grün (110 veröffentlichte Dateien), AI Functions 37219916242 grün. Ledger bestätigt staging_deployed mit beiden digest-geprüften Receipts für 2436a432d9a4dc2840d4ba2c22a7b9c000cc2b47. Öffentliches Release-Manifest unabhängig auf denselben SHA geprüft. Alter Versuch/hash/source/publication/usage/reservation feldweise identisch erhalten. Gesamtpilot:2/3Versuche,1,70/2,55USD reserviert,0,100344USD bekannte Nutzungsschätzung.

Der vorher aufgenommene Homepage-Auftrag wurde erst danach automatisch zugelassen unter Run 37220142576. Der Builder stoppt mit unbekanntem Provider-Ergebnis; kein automatischer Retry. Seine separate 2,40-USD-Reservierung bleibt gegen das unveränderte 2,55-USD-Limit erhalten. Provider-Ergebnis/Kosten vor weiterer Zulassung abgleichen. Kein neuer Pilot-Bau, kein Reset. Homepage-Geräte-/Sichtabnahme und Production offen.
