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
- Bei einem späteren Logo-Wechsel: neues Asset ablegen, `brand.primary`, `brand.icon` und `brand.favicon` im Manifest ändern, Manifest-Version erhöhen und Generator ausführen. Konsumenten bleiben unverändert.
- Das bisherige Header-Markup bleibt als No-JavaScript-Fallback bestehen; bei normalem Start wird es durch die zentrale Marke ersetzt.
- Secure-Logo ist ausdrücklich nicht Teil dieses Arbeitsschritts.

## Erledigt
- `assets/gradecrew/brand-primary-v1.svg` als skalierbare Vektorfassung des ausgewählten GC+Bildungs-Entwurfs angelegt.
- `shared/gradecrew-design/assets.json` auf Version `1.1.0` erweitert: `brand.primary`, `brand.icon`, `brand.favicon` zeigen auf die kanonische Marke.
- `generated/gradecrew-assets.js` und `native/Shared/GradeCrewAssets.swift` enthalten dieselbe semantische Brand-Zuordnung.
- Generator erzeugt jetzt auch native `GradeCrewAssets.Brand`-Konstanten.
- `startup.js` setzt Headerlogo und Favicon aus `GRADECREW_ASSETS`, ohne versionsgebundene Logo-Pfade in Seitenlogik zu verteilen.
- `gradecrew-logo.css` kapselt ausschließlich die Darstellung des Markenzeichens.
- Staging-Build nimmt Asset-Map und Logo-CSS mit.
- `gradecrew-brand-assets.test.mjs` schützt Manifest, Web/Swift-Ausgaben und Build-Vertrag.
- Shared-Design-README dokumentiert den späteren Logo-Wechsel.
- CI akzeptiert `feature/brand-*` und prüft die Logo-Dateien explizit.

## Geprüft
- AI Staging Checks Run `36983427461` auf Commit `99d318f1b025443115ab22ac9fd85146cda61954`: vollständig grün.
- Dabei erfolgreich: Functions, Secure-Backend, Firestore-Regeln/Emulator, bestehende Browser-Regressionen, neuer Brand-Test und Staging-Build-Smoke.
- Kein Production-Deploy.

## Status
- Branch-Implementierung: erledigt.
- GitHub gesichert: ja.
- CI: grün auf dem belegten Implementierungscommit.
- In `feature/gradecrew-app-integration` integriert: noch nicht.
- Staging deployed: noch nicht für diesen Logo-Stand.
- Am Gerät bestätigt: noch nicht.
- Production: unverändert.

## Offen / nächster Schritt
Aktuellen Zielbranch erneut prüfen. Wenn keine parallele Überschneidung vorliegt, kontrolliert in `feature/gradecrew-app-integration` integrieren. Danach Integrations-CI und automatische verifizierte Preview abwarten und erst dann als Staging-Stand melden.