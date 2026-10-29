# GC-BRAIN-01 — Mac-App Umsetzung

Basis: freigegebener bestehender Firmenzentralenentwurf, Humanantwort „Zuerst Mac-App“. Design: ../specs/2026-10-25-firmenzentrale-mac-design.md. Alleinige Umsetzung im bestehenden Checkout; keine Delegation, kein Merge/Deploy.

1. Start-/Identitäts-/Navigationsgrenzen zuerst mit negativen Verhaltenstests festhalten. Bestehende Daten und Versuchszahlen vor Start lesen.
2. Lokalen Bootstrap mit Startlock, Identitätsprüfung, abgekoppeltem Dienst, begrenztem Log und lesbaren Fehlern ergänzen. Minimalen Health-Endpunkt hinzufügen; bestehende Brokerrechte erhalten.
3. Native AppKit/WebKit-Hülle mit persistentem Fenster/Webspeicher, Mac-Menüs, Originalicon, sicheren externen Links und Berichtdownload bauen.
4. Expliziten Paket-Builder implementieren: nur freigegebene Quellen + Pythonstdlib/Lizenz; keine persönlichen Daten/site-packages/Repository-Metadaten. Python intern relocieren, Swift kompilieren, ad-hoc signieren. Lokales Paket außerhalb Git ablegen.
5. Vollständige bestehende Firmenzentralentests und neue Starttests laufen lassen; Swift und Navigationspolicy kompilieren/testen. Lokale Buildversion separat nachweisen.
6. App wirklich starten, Eingang/Ergebnisse/Unterbereiche/Download/Reopen prüfen. Dienst-ID/Versuchszahlen vergleichen. Keine Modellaufträge senden.
7. Benutzeranleitung und konkrete Prüfergebnisse in eigene Übergabe schreiben, lokalen Commit sichern, geänderte Inhalte per erwartetem Remotehead in DraftPR295 übertragen; Blobvergleich und exakte CI. Shared Register bleiben beim zentralen Writer.

Betriebsgrenzen: bestehende Codex-Anmeldung erforderlich; Betrieb nur lokal auf diesem Mac, Dienst bis Logout/Neustart weiter aktiv; kein automatisches Update laufender Dienste. Verbindungsprobleme als solche ausweisen. Offene Produktabnahmen bleiben offen.
