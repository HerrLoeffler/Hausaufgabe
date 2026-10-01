# Tutorial Choice & Replay V1

Task: `GC-TUTORIAL-04`

## Ziel

Die GradeCrew-Einführung lädt neue Lehrkräfte stark zum Tutorial ein, hält sie aber nicht mehr in einer unabwählbaren Pflicht-Tour fest.

## Produktregeln

- automatische Einladung nur einmal pro Lehrkraft
- kein automatischer Start der eigentlichen Tour
- primärer CTA: `Tutorial starten · ca. 5–7 Min.`
- sekundär: `Jetzt nicht – später jederzeit über Tutorial`
- die Entscheidung wird zusätzlich im Nutzerprofil gespeichert (`crewTourOfferHandledAt`, `crewTourOfferChoice`), damit die Einladung geräteübergreifend nicht wieder ungefragt erscheint
- lokaler Fallback verhindert Wiederholung, falls die Profilspeicherung vorübergehend scheitert
- Tour ist jederzeit über × oder Escape abbrechbar und führt danach zurück ins Dashboard
- kleiner manueller Tutorial-Button bleibt auch nach Abschluss verfügbar
- Admin: keine automatische Einladung; manueller Button `Tutorial testen`
- bestehende vollständige Crew-Reise bleibt inhaltlich erhalten
- Production nicht verändern

## UX

Die erste Einladung ist bewusst sichtbar statt zwingend: Crew-Grafik, klarer Nutzen, drei kurze Vorteile und ein dominanter Start-CTA. Das Tutorial selbst sperrt weiterhin irrelevante Bedienelemente pro Schritt, besitzt aber nun jederzeit einen echten Ausstieg.

## Zeitmessung

Die bestehende Tour misst bereits lokal `startedAt` bis Abschluss und zeigt die tatsächliche Dauer im Finale an. V1 speichert diese Dauer nicht personenbezogen. Für eine spätere datensparsame Produktmessung sollen nur Start/Abbruch/Abschluss, letzter Schritt und Dauer/Bucket über den separaten Telemetrie-Vertrag erfasst werden; keine Antworten oder Testinhalte. Bis reale Daten vorliegen, wird konservativ `ca. 5–7 Min.` kommuniziert.

## Branch / Nachweis

- Branch: `feature/tutorial-choice-replay-v1`
- Basis: `feature/gradecrew-app-integration` @ `74eb2ec08e81315875abfc4b1ae052d9f78797eb`
- Draft-PR: #16
- Feature-Head bei Übergabe: `d8453750be5965113217636478212d83e704174f`
- vollständiger Testlauf: GitHub Actions `Tutorial Choice V1 Checks` Run `36935628293` ✅
- getestet: neuer Lehrer, Start, Jetzt-nicht, Admin, abgeschlossener Nutzer, Abbruch sowie bestehende komplette Crew-Reise und Responsive-Tutorial-Tests
- nach dem grünen Lauf wurden ausschließlich temporäre Patch-/CI-Hilfsdateien entfernt; Produktdateien blieben unverändert

## Noch offen

1. visuelle Abnahme der Einladung auf Desktop/iPad/iPhone
2. Staging-only Deploy nach Koordination mit dem Web-App-Integrationsstand
3. echte Profilspeicherung der Auswahl mit Testkonto prüfen
4. Abbruch mitten in verschiedenen Tutorial-Phasen am Gerät prüfen
5. reale Dauerwerte erst nach freigegebener Telemetrie auswerten

## Deploy-Status

- GitHub: gesichert
- automatisierte Tests: grün
- Staging: **nicht deployed**
- Production: **nicht deployed**
- Gerätetest: **offen**
