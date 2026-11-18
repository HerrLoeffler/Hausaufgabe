# Wilma: tatsächliche Altfallreparatur auf Staging und Live · 18.11.2026

Bestehende Tasks GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01, Workstream wilma-live-grading-20261028 und PR438. Ausführender Web-Chat01a15f06-837c-73b3-93fa-0d07a8104d3a. Martins ausdrückliche Fertigstellen-/Live-Freigabe wurde durch die Zentrale im vorhandenen Auftrag weitergegeben. Keine zweite Task, keine zurückgesetzte Versuchshistorie.

## Ergebnis und unveränderliche Quelle

Die zusätzliche Backendreparatur ist jetzt tatsächlich Production, Quelle `f723e71b1f91c17e39bb96f9e3eae4c6d5c9a450`, Tree `c877184464769428cc772d7dc4609993e49e13cc`. Exakte CI44375566304 vollständig erfolgreich. Vorhandene lokale850Web/UI- und503Functionstests sowie unabhängiger P1-Quellreview gelten für unveränderte Functionsquellen; erneuter unabhängiger Promotionreview prüft146ZIP-Dateien bytegleich gegen Git und das bereits geprüfte Paket. Paket-SHA256 `6f87bff5b8ff527babdc10653b907409b463c1ad517f37ff2bc12f4b39a4e840` in beiden aktiven Cloudquellen erneut heruntergeladen und bestätigt. Keine neue Quelländerung oder unnötige Testwiederholung.

| Bereich | Vorher | Jetzt | Erhalten |
|---|---|---|---|
| Stage reviewWilmaAnswers | reviewwilmaanswers-00010-zud | reviewwilmaanswers-00011-guf ACTIVE | sämtliche serviceConfig;512M,1CPU,max1,concurrency1,180s;97andereFunctions |
| Live reviewWilmaAnswers | reviewwilmaanswers-00005-lax | reviewwilmaanswers-00006-xub ACTIVE | sämtliche serviceConfig;512M,1CPU,max2,concurrency4,180s;61andereFunctions |
| Stage Hosting | e218924764139f91 | unverändert | /wilma/-Kandidat und447übrigeDateien |
| Live Hosting | 73a1e618cab1a0ba | unverändert | bestehenderf723-Abschluss-/Layoutfix, alteLinks undZugänge |

Beide Serverdeploys ändern ausschließlich buildConfig.source. Kein Hosting-, Rules-, Auth-, Ressourcen- oder sonstiger Functionsdeploy. Ein Runtime-Merge in den Zielbranch wird weiterhin nicht behauptet; PR438 ist offen/stacked.

## Echter Altfehler: bestehender fiktiver Stagefall

Vorhandener synthetischer R5NF5L6Y-Fall mit completed/attemptCount1 und abgerechneter Historie. Originalbeleg privat mit SHA256 gesichert; ausschließlich dieser fiktive GCS-Beleg mit Generationbedingung entfernt. Kein neuer Test, Job oder Fingerprint, keine Budget-/Notenrücksetzung. Alter Server reproduzierte den tatsächlichen Fehler: kein Vorschlag und nur manuelle Bewertung. Neuer Server machte nach kostenlosem Statusabgleich „KI erneut prüfen“ samt Kontingenthinweis verfügbar.

Genau ein bewusster Stage-Retry: dieselbe Operation und derselbe Fingerprint, attemptCount1→2, vorheriger Request/Usage/Kostenreservierung/Abrechnung vollständig in History erhalten. Neues Resultat1,5/1,5Punkte. Startzähler10→11, Usagebuchung+970MikroEUR (0,000970EUR; keine Rechnungsbehauptung), Reservierung0. Abgabe weiterhin review/0Punkte/keineNote: Bestätigen nicht gedrückt. Nach vollständigem Browserneuladen derselbe Vorschlag, gesamte gespeicherte Zustände und Kosten unverändert. Der erfolgreiche neue Beleg wird erhalten; Originalbackup nicht darüber zurückgeschrieben. Kein zweiter Stage-Aufruf.

## Kostenlose Live-Wiederaufnahme

Nach dem Serverdeploy ausschließlich vorhandenen synthetischen LLD9SSR8-Beleg geöffnet. Tatsächlicher Live-Browser zeigt den vorhandenen1,5/1,5-Vorschlag. Exact-operation-Read davor/danach bestätigt completed/attemptCount1, gleichen Fingerprint/Request/Kostenstand und unveränderte Abgabe;0neueLiveproviderstarts,0neueUsage,0Reservierung. Livebeleg nicht gelöscht oder beschädigt, kein Retry und keine Bestätigung. Reale Abgaben/Ergebnisansichten nicht geöffnet oder neu bewertet.

## Guards, Grenzen und nächster Schritt

Private-Beleg-/Authentifizierungsgrenzen und Lehrerbestätigung bleiben erhalten. fehlende/beschädigte completed-Belege und failed/createdAt-Altzustände sind nur bei abgerechneter Vorhistorie, stabiler Identität und verbleibendem zweiten Versuch explizit wiederholbar; ungeklärte Reservierungen bleiben geschützt. Gültige Belege werden zuerst kostenlos wiederverwendet. Nie gestartete Antworten behalten ihren getrennten Fortsetzenpfad. Kein automatischer Massenneustart realer Altantworten, keine automatische Notenübernahme.

SEC06/07/08/14/17 und PRIV07/17 im bestehenden Scope: private Originalbelege/Accountdaten bleiben lokal, veröffentlichte Nachweise enthalten nur synthetische Fallkennung und aggregierte Kosten; genaue Quelle/Release/History/Gradeguard überprüft. Kein Rechts-/Schul- oder physischer Gerätefreigabenachweis. Historische erste503-Ursache bleibt unbekannt. BeschädigteBelege/failed/createdAt durch Quelltests, der konkret online reproduzierte Altfall war missing completed receipt; nicht alle Fehlerformen online behauptet.

Secure1.0(1313) ist laut Martins Antwort im zuständigen Nativechat inTestFlight verfügbar. Zusätzlicher kompakter iPhone-Kopf ist dort separat inArbeit; kein zweiter nativer Build durchWeb. Physische Handy/iPad/Tastaturabnahme und bewusstes Fortsetzen realer alter Antworten bleiben Martins nächste Schritte. Der neue Server gilt für Clients mit diesem Callable; keine native Ansicht oder AppStoreänderung durch diesen Deploy behauptet.

Details: [Receipt](receipt.json), [Stageabnahme](stage-acceptance.json), [Liveabnahme](live-acceptance.json), [Promotionreview](promotion-review.json), [Stagesource](stage-source-proof.json), [Livesource](live-source-proof.json). Browserbelege wurden mit ausschließlich fiktiven Antworten lokal gesichert.
