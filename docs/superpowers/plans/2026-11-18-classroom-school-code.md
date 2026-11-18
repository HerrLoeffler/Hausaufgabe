# GC-CLASSROOM-01 – gemeinsamer Schulcode

> **For agentic workers:** Use superpowers:executing-plans to implement the agreed additive interface task-by-task. Do not start a second seat ledger or publish the unrelated Billing rollout.

**Goal:** Bestehende normale Lehrerkonten treten mit einem gemeinsamen Schulcode ihrer Schule bei; die Verwaltung sieht die tatsächlich belegten Lehrkraftplätze.

**Architecture:** Kanonische Platzautorität billingV2Schools/billingV2Memberships aus feature/billing-product-20261118. Classroom-Schuldaten bleiben bis zur geprüften Verknüpfung eigenständig gesperrt. Schulbeitritt erteilt weder Zugriff auf private Kollegentests noch automatisch auf alle Schülerlisten.

**Tech Stack:** vorhandene Firebase-Auth-, Functions-, Firestore-Transaktions- und Weboberflächen.

**Spec:** Martins Auftrag18Nov2026 und bisheriger Pilotplan2026-11-10-classroom-schulpilot.md. Martin erlaubt direkte Abstimmung mit „GC · Gratisversion, Preise & Zahlungsabwicklung“; Schnittstellenanfrage versendet, Owner hat die Schnittstelle bestätigt.

## Global Constraints

- Ausschließlich gradecrew-staging-2026, kein Production-Deploy.
- Bestehender Login, Konten, Tests und importierte Namen bleiben erhalten.
- Keine ungeprüfte Migration des lokalen ASV-Bestands315/50/21 in die Cloud-Testschule25/2.
- Die ausstehende Billing-IAM-Freigabe wird nicht durch diese Aufgabe ersetzt.
- Ein gemeinsamer Code erlaubt nur den Beitritt als Lehrkraft. Mehrere Verwalter benötigen eine gesonderte berechtigte Rollenzuweisung; niemals Codebesitz allein.

## Review Focus

- Wiederholte Eingabe desselben Kontos darf keinen zweiten Platz belegen und bestehende Verwaltungsrollen nicht herabstufen.
- Zwei gleichzeitige Beitritte beim letzten freien Platz: genau einer erfolgreich, kein Überschreiten von used+reserved<=seats.
- Ungültige, abgelaufene, widerrufene oder durch Rotation ersetzte Codes dürfen keine Zuordnung erzeugen.
- Ein Schulcode ist keine Schüleranmeldung und keine Freigabe fremder Tests oder einer anderen Schule.
- Lehrerimport erzeugt Personen-/Unterrichtszuordnungen, keine Passwörter und keine stillen Authkonten. Eine unsichere Namensgleichheit darf kein Konto verbinden.

### Task1: Schülerzugang2026 wiederherstellen

- [x] Fehlende Hosting-Weiterleitung nachweisen; aktuelle666Dateien samt217Wilma erhalten.
- [x] Erhalt der vollständigen Serving-Konfiguration testen, route-only Version335fff0a6316dcf7 veröffentlichen.
- [x] Vorhandener synthetischer Schüler: Login, Testübersicht, Neuladen, Logout; bestehende Lehrersitzung bleibt erhalten.
- [x] Nachweise docs/classroom/evidence/20261118-pupil-route-repair.json sichern.

### Task2: Schulcode an dieselbe Platzverwaltung anschließen

Files nach bestätigtem Owner-Vertrag: neues functions/lib/billing/school-join-codes.js, neue gezielte Transaktionsprüfungen, minimale Anschlüsse schools.js/handlers.js und billing-school-panel.mjs samt UI-Prüfungen. Eigener Integrationsbranch basiert auf bc5ca823; fremden Checkout nicht verändern.

- [x] Owner bestätigt Aktionsnamen, Modulgrenze und Integrationsziel.
- [ ] RED: bestätigte Lehrkraft mit Code beitreten; falsches Konto/Schule; Wiederholung; letzter Platz parallel; Reservierungen; Ablauf/Rotation/Widerruf; Rollen dürfen nicht übergeben werden.
- [ ] Verwaltung erstellt zeitlich begrenzten zufälligen Code, erhält ihn einmalig zur Weitergabe; serverseitig Hash statt Klartext, kein Logging. Bestehende Codes nach Reload nur als aktiv/abgelaufen anzeigen und bewusst erneuern lassen.
- [ ] Lehrkraft sieht bei „Deine Schule“ ein Codefeld, überprüft Schulnamen und bestätigt den Beitritt. Keine neue E-Mail und kein zweites Konto erforderlich; bestehende E-Mail-Verifikation bleibt Pflicht.
- [ ] Platz pro aktivem Lehrerkonto atomar vergeben. Beispiel40Plätze: Verwaltung zählt mit,39weitere Lehrkräfte möglich; wiederholter Beitritt desselben Kontos zählt nicht erneut. Austritt/Widerruf gibt Platz frei; letzter Verwalter bleibt geschützt.
- [ ] Verwaltung sieht verwendete/reservierte/freie Plätze, Mitgliedsliste und Code erneuern/deaktivieren. Verwaltungsrollen getrennt vergeben; persönliche Einladungen bleiben als gezielter Weg kompatibel.
- [ ] Bestehende Paid-Period-Prüfung beibehalten: Beitritt allein erzeugt keinen Zahlungsbeleg oder kostenpflichtigen Vertrag.
- [ ] Schule und Klassenrechte serverseitig mit Classroom verknüpfen. Berechtigte Mitglieder wählen wie vereinbart ihre Klassen; nur für diese werden Schülerlisten/Codes/Testzuweisungen freigegeben. Pro fremder Schule negative Zugriffstests.
- [ ] Neue UI auf Handy, Tablet und Desktop im bestehenden Layout prüfen, Quellstand sichern, nur autorisierten2026Umfang veröffentlichen.

### Task3: vorhandenen Import und Kollegenbetrieb anschließen

- [ ] Bereits vorhandenen lokalen Import weiterverwenden; Online-Vorschau/Übernahme serverseitig an aktuelle Schule, Rolle und Revisionsstand binden.
- [ ] Minimalspalten Klasse/Vorname/Nachname, optional stabile Schülerreferenz; keine unnötigen Zusatzspalten übertragen. Gleiche Namen ohne stabile Referenz ausdrücklich prüfen.
- [ ] Importierte Lehrkraft nur über bestätigtes Konto/ausdrückliche Zuordnung verbinden; unklare Namensgleichheit bleibt Entscheidung, keine automatische Rechtevergabe.
- [ ] Fiktiver Durchlauf mit zwei Lehrkräften, einer Klasse und einem Schüler; persönliche Tests bleiben privat. Secure-Abgabe/Lehrer-Eingang separat am tatsächlichen iPad abnehmen.

Status18Nov: Task1 veröffentlicht und browsergeprüft. Task2 Schnittstellenabstimmung läuft, noch kein Schulcodeprodukt oder Lizenzrollout veröffentlicht. Task3 offen. Normale Namen bleiben im vorhandenen Bestand; keine neue rechtliche Freigabe oder Livefreigabe behauptet.

Ausführung18Nov: Schritte Codefactory/Routing/Management/BeitrittsUI/Transaktionen lokal umgesetzt und geprüft, SHAf59d6153 im getrennten Integrationsbranch. Nachweise in dortiger docs/classroom/2026-11-18-school-code-handoff.md. Die nicht abgehakten Schritte bleiben bis zur integrierten Cloudabnahme offen; Checkboxen sind keine Veröffentlichung. Owner hat Bundle zur gezielten Integration erhalten. Classroom-Klassenrechteadapter und Onlineimport bleiben offen.

Nachtrag18Nov: Owner hat Paket in remote d83f7868 integriert und in separatem geschlossenem Billingpilot veröffentlicht (UIRelease98159c65). Eigenständige Publichash-/ACTIVE-/401-/canonicalHostingprüfung dokumentiert in evidence/20261118-school-code-integration.json. Kanonische Klassen-/Schülerrechte sind weiterhin nicht angeschlossen; der Pilot gilt nur für genau eine explizit freigeschaltete Testidentität. Keine automatische Zuordnung der synthetischen Billingtestschule zu echtem ASVbestand.
