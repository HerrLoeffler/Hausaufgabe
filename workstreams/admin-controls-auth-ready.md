# Admin controls auth-ready fix

Stand: 02.10.2026. Basis `feature/gradecrew-app-integration@d47265bbb190ef6c71a993fc6822e75dddc11f45`. Production unverändert.

## Auftrag

Nutzerbericht: Im Adminbereich lassen sich die angekündigten Rollen-/Testkonto-Funktionen nicht verwenden bzw. erscheinen nicht zuverlässig.

## Ursache

`admin-test-account-controls.mjs` wurde direkt aus `visual-enhancements.js` geladen. Das Modul prüfte sofort `auth.currentUser`. Während Firebase den bestehenden Login beim Seitenstart noch wiederherstellt, kann `auth.currentUser` kurz `null` sein. In diesem Fall setzte das Modul seinen Installationsmarker, erkannte keinen Admin und beendete sich dauerhaft. Es wartete nicht auf `onAuthStateChanged`.

## Änderung

- Neuer kleiner Bootstrap `admin-test-account-bootstrap.mjs`.
- Lädt die eigentliche Admin-Steuerung erst, wenn Firebase einen angemeldeten Benutzer bestätigt hat.
- Bereits vorhandener Login wird sofort verwendet.
- Bei spätem Login wartet der Bootstrap auf `onAuthStateChanged`.
- Ein fehlgeschlagener dynamischer Import wird einmal verzögert erneut versucht.
- Cache-Bust der eigentlichen Admin-Steuerung auf `v=2`.
- Staging-Build und dedizierte Regressionstests berücksichtigen den Bootstrap.
- Keine Änderung an Firestore-Regeln, Auth-Daten, Rollen oder Production.

## Status

- Branch: `fix/admin-controls-auth-ready`
- Code auf GitHub gesichert: ja
- CI: läuft nach Commit/Push
- integriert: nein
- Staging: nein
- Nutzertest: nein
- Production: unverändert

## Nächster Schritt

Dedizierte CI prüfen. Danach PR gegen den aktuellen Integrationsbranch, bei grün kontrolliert integrieren, vollständigen Integrations-Gate und Preview-Deploy abwarten. Anschließend Martin im Preview Rollenänderung und Testkonto-Markierung praktisch testen lassen.
