# Baseline — GC-POCOCK-IMPLEMENT-01-SKILLS

Beauftragter Lesetest-Fachchat; angefordert Sol/medium, beobachtetes Runtime-Modell/Aufwand unbekannt. Nur lokale Quellen gelesen; kein Netzwerk, Spielstart, Test, API oder Deploy. GitHub-Aktualität fehlt: Für Wiederaufnahme aktuellen main-Einstieg, STATE, TODO, Development Status und Übergaben anfordern. START_HERE/AGENTS/CHAT_RECOVERY lokal gelesen; Assetqualitätsdokument fehlt im Snapshot. Zentralen koordinieren ausschließlich.

## Lerninsel: Laufzeit und nächster Schritt

**4/10 Nähe zum Acht-Gebiete-Spiel auf dem iPad**, anhand gelieferter Lerninselbelege; keine Gesamtprojektwertung. L1 ist gesichert und lokal geprüft; Gebietszuordnung, vollständige Art-/Gehabnahme und Zielgerät fehlen.

`lerninsel-l1-source.md`: PR175, `feature/lerninsel-ego-v1`, `branch_only`, Remote218726f4a880d36dd2f8f98ffb8324fb414ce1c4, Baum c6e3e91eeb993b635a7da5bc180ecb758bdc8eaf. Finaler Lauf10.10.2026 11:10:38UTC:231 portable Checks/5UE-Suites,0 Fehler/Warnungen,10 Kamerabilder. Hier nicht nachgeprüft. Kulisse nachY14000 verschoben: seitliche visuelle Insel statt begehbarer Acht-Gebiete-Welt. STATE enthält ältere Werte; Quellen nicht gleichsetzen.

`lerninsel-layouts-20261007.md:34` dokumentiert Unreal/PixelStreaming2 lokal; Browserstreaming vorgeschlagen. Native iPad-Auslieferung benötigt eigene Rendering-/Signierungs-/Gerätegates. Kein HTML-Export, Ladezeit, GPU-Budget oder Zielgerät bewiesen. Laufzeitentscheidung offen; Enginewechsel behebt die Asset-/Routenlücke nicht automatisch.

**Ein nächster Schritt:** Bestehender Owner GC · Lerninsel · Gameplay & Integration gleicht PR175/Remote/L1-Handoff und aktive Prozesse frisch ab und bereitet den Nutzerlauf des vorhandenen Kandidaten vor. Task GC-GAMES-LERNINSEL-L1, Parent GC-GAMES-ESCAPE-VISUAL-01 erhalten; L2–L5 ungestartet. Unzugängliche Änderungen/Vorgänge unbekannt; kein Retry/Budgetreset. TODO-Ownerpatch vorhanden, Aufnahme offen. Später Zielgerätversuch mit benanntem iPad/OS und Messung von Startbereitschaft, Bedienung und Stabilität; hier keine Bereitstellung.

## Räumliche Probe vorbereiten

Hypothese: Ankunft → Verbpfad → Satzplatz/Tor →1L-Aufgabe ist ohne Zuruf verständlich. Vor Umbau vorhandenen Kandidaten und feste Startpose verwenden. Nutzerauftrag: nächste Lernorte finden, Aufgaben ausführen, dann Startweg zeigen. Beobachten: erster Weg, Umkehrstellen, Hilfebedarf, Verwechslung seitlicher Kulisse/Spielfläche. Abnahmevorschlag: vier Stationen ohne Wegerklärung finden und Rückweg beschreiben; Eingriffe protokollieren. Bei Scheitern erste konkrete Orientierungsstelle bearbeiten. Nur vorbereitet, kein Verständlichkeitsnachweis.

## PR191: begrenzter Review und PRtext

Gelieferter Head bb1c6bee97ee42fe3981905d9c89123dc96d26bf gegen c3a5fdcf…/feature/gradecrew-app-integration. Diff erfüllt engen Auftrag plausibel: explizites Read, zweite Resetbestätigung, `epoch`+UID gegen verspätete Antworten/Kontowechsel, `textContent`; unbestätigter Reset verlangt erneutes Lesen. Settings/Buildliste eingebunden. Sechs synthetische Regressionen passen dazu. Keine konkrete Regression erkannt; kein Sicherheitsscan. Backend-/Emitterreview und19 bestandene Tests sind dokumentierte Fremdbelege, hier nicht ausgeführt. CombinedCI, finaler Head-Abgleich, echte Auth/API-/Geräteprüfung fehlen; nicht mergefreigegeben.

**PRtext:** „Coco-Gesprächsdaten in Einstellungen bewusst anzeigen und zweistufig zurücksetzen. Kontowechsel invalidieren Antworten; unbestätigter Reset erfordert erneutes Lesen. Präzisere Kopierinformation und begrenztes PRIV01–20-Inventar. Dokumentiert:19 Checks, synthetische Tastaturprobe und Build132; reale Konten, vollständige Geräte-/Rechtsprüfung und CombinedCI offen. Kein Deploy.“

## Fehlversuche und Auth/Rules

PyYAML fehlte beim Validator: vorhandenes Python/Abhängigkeiten prüfen statt Wiederholung. `skills/list errors=[]` und28/28 Quelldateien belegen andere Prüfungen. HTTPS-Push scheiterte an Anmeldung; Connector-Veröffentlichung gelang. Abgeschnittene Reads gezielt begrenzen. Keine Regeln/Memory/Konfiguration geändert; Nutzungsdaten/Kosten unbekannt.

Auth beantwortet „Wer bist du?“ und liefert UID. Firestore Rules entscheiden „Darf diese Identität dieses Dokument lesen/schreiben?“ Anmeldung beweist keine Datenberechtigung. PR191 ruft eine Function auf: serverseitige Ownerprüfung bleibt nötig, Rules ersetzen sie nicht. Skill firebase-auth-basics gelesen. Fehlversuche zeigen keine Auth-/Rules-Tests. Noch unbelegt: abgemeldet, eigener/fremder Owner, Kontowechsel und echter Function-Roundtrip im autorisierten Testsystem. Synthetische DOM-Checks sind getrennte Belege.
