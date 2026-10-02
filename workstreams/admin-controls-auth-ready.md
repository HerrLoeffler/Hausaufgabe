# Admin controls auth-ready fix

Stand: 02.10.2026. Task-ID: `GC-ADMIN-02`.

## Auftrag

Nutzerbericht: Im Adminbereich erschienen die angekündigten Rollen-/Testkonto-Funktionen nicht zuverlässig bzw. waren nicht nutzbar.

## Ursache

`admin-test-account-controls.mjs` wurde direkt beim Seitenstart geladen und prüfte sofort `auth.currentUser`. Während Firebase einen bestehenden Login noch wiederherstellt, kann dieser Wert kurz `null` sein. Das Modul markierte sich trotzdem als installiert und beendete sich, statt auf den bestätigten Auth-Zustand zu warten.

## Umsetzung

- Fix-Branch `fix/admin-controls-auth-ready` auf Basis von `feature/gradecrew-app-integration@d47265b`.
- Neuer Bootstrap `admin-test-account-bootstrap.mjs` wartet auf Firebase Auth (`onAuthStateChanged`) und lädt erst dann die vorhandenen Admin-Regler.
- Cache-Bust auf V2; Staging-Build enthält Bootstrap und Steuerungsmodul.
- Dedizierte CI `37013804805` grün.
- PR #44 in `feature/gradecrew-app-integration` gemergt.
- Integrationscommit `8aba2a7ce70c75842fbe4b81c4e6491136366768`.
- Vollständiger Integrations-Gate `37013936361` grün.
- Automatischer Preview-Run `37014137329` erfolgreich: Build, Deployment und Hash-/Manifestprüfung grün.
- Production unverändert.

## Aktueller Status

- Branch-Code: gesichert
- CI: grün
- Integration: ja
- Staging-Preview: deployed und hash-verifiziert
- Nutzertest: offen
- Production: unverändert

## Nächster Schritt

Martin öffnet den bestehenden GradeCrew-Integrationspreview neu, geht zu Administration → Lehrkräfte → test1 und prüft, ob `Rolle` sowie `Als Testkonto markieren` erscheinen und eine Testkonto-Markierung gespeichert werden kann. Erst danach den Admin-Fix als nutzerbestätigt markieren.
