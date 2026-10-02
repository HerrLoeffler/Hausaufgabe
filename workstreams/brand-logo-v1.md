# GradeCrew Hauptlogo V1

Task-ID: `GC-BRAND-01`

## Auftrag
Das aktuell ausgewählte GradeCrew-Hauptsymbol zunächst als Logo der normalen Lehrer-/Web-App einsetzen. Das Secure-Produkt bleibt getrennt und erhält später eine eigene Sicherheits-/Schloss-Variante. Der Logo-Wechsel muss zentral und ohne verteilte harte Pfade möglich sein.

## Basis
- Ausgangsbranch: `feature/gradecrew-app-integration`
- Ausgangscommit: `a61759db01e41f19b7d34e6eb0e88bac42484c1e`
- Arbeitsbranch: `feature/brand-logo-v1`
- Production: nicht verändern

## Technische Entscheidung
- Kanonische Marke liegt unter `assets/gradecrew/` und wird ausschließlich über `shared/gradecrew-design/assets.json` benannt.
- Web und native Shared-Konstanten werden mit `tools/generate-gradecrew-design.mjs` daraus erzeugt.
- Das normale Web-Frontend bindet das Markenzeichen über `GRADECREW_ASSETS.brand.primary` ein; keine mehrfach gepflegten Logo-Pfade.
- Favicon und sichtbares Headerlogo verwenden dieselbe kanonische Quelle.
- Bei einem späteren Logo-Wechsel: neues Asset ablegen, `brand.primary` im Manifest ändern, Generator ausführen. Konsumenten bleiben unverändert.
- Secure-Logo ist ausdrücklich nicht Teil dieses Arbeitsschritts.

## Umfang
- neues vektorbasiertes GradeCrew-Hauptsymbol auf Basis des ausgewählten GC+Bildungs-Entwurfs
- Shared Asset Manifest + Generator + generierte Web/Swift-Konstanten
- Header/Favicon der normalen Web-App
- Regressionstest und Staging-Build-Vertrag

## Status
- Arbeitsbranch angelegt.
- Umsetzung läuft.

## Offen / nächster Schritt
Asset, Manifest und Konsumenten implementieren; danach CI prüfen. Erst nach grünem Branch-Stand kontrolliert in den aktuellen Web-Integrationsbranch integrieren. Kein Production-Deploy.