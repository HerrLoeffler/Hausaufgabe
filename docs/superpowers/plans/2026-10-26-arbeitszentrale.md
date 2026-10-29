# GC-BRAIN-01 — operative Arbeitszentrale

Human26.10.: Übersicht und gezielte Fachchatsteuerung statt Auftragsstapelung. Direkte Umsetzung im bestehenden PR295, gleicher alleiniger Writer; keine zweite App. Grundlage: unabhängiger UXreview work/gc-brain-ux-review-20261026 und eigene Istzuordnung. Technische Hülle ist keine UX-Abnahme.

**Ziel:** Drei Fragen auf der Startfläche beantworten: Wer bearbeitet welchen Auftrag? Was hängt? Was braucht Martin? Ein Lehrer-App-Vorgang zeigt Auftrag, Owner, Annahmebeleg, letzten Schritt, Rückfrage, Ergebnis und Entscheidung mit echten IDs und Quellen.

**Einbau:** Bestehende SQLite bleibt einzige lokale Ablage. Ergänzung stabiler Arbeitsbindungen (Originaltask/Bereich/Unterpunkt/Owner-Konversation) und Ereignisse; alte Requests/Versuche bleiben unverändert. Fachfortschritt aus belegten Meldungen darstellen; Chatstatus, Versand, Annahme, Ergebnis und Release bleiben verschiedene Achsen. Quellenabruf über unterstützte App-Server-APIs. Keine private Codex-DB.

**Hostgrenze nach realem Read-only-Probe:** CLI0.164.0-alpha.11.1 bietet `app-server proxy`, aber Standardkontrollsocket fehlt. Separater lesender App-Server meldet Teacherthread `notLoaded`/Turn `interrupted`, obwohl Desktopconnector denselben Turn aktiv zeigt. Deshalb kein Takeover/resume eines fremden Chats und kein „arbeitet gerade“ aus diesem Archivstatus. Echter Versand nur über verfügbaren, qualifizierten gemeinsamen Host mit exakt geladenem idle-Thread; im jetzigen Betrieb sichtbar blockiert. Kein Autostart eines neuen Daemons, kein zweiter Worker. Öffnen des vorhandenen Chats plus gespeichertes Briefing bleibt nutzbar. Direkter fortlaufender Analysechat nutzt nur eigene, eindeutig gebundene Analyseverläufe und bestehende Rechte. Quelle: https://learn.chatgpt.com/docs/app-server; tatsächliche CLI-Schemas lokal geprüft.

**Gestaltung:** Gleiches Blau #080e1c/#0b1426, Text #e7efff, Hinweise #a1b1cd, Handlung #2855a0, Aufmerksamkeit #f6c56b. Originalmarke und Schrift bleiben. Start: eine priorisierte Arbeitsliste, daneben „Von dir benötigt“, darunter Bereichszugang. Keine zusätzlichen Kennzahlenblöcke. Bereich: einheitlicher Name, Bestand/offene Arbeit/nächster Schritt, Aufträge + zugehöriger Verlauf + Eingabe. Netz/Quellen/Releases bleiben gezielte Vertiefungen.

- [ ] Zustands-/ID-/Migrationstests: Altbestand, idempotente Zuordnung, Rollen, fehlender Host, fremder/aktiver Thread, unsicherer Versand ohne Wiederholung, Checkpoint vor Ownerwechsel, Quellalter, Beleglücke ≠ Produktlücke.
- [ ] SQLite-Bindungen, begrenzten Chatbeobachter und qualifizierten Versandweg einbauen; Hostfehler konkret zeigen. Bestehendes Requestjournal und Quellenwissen wiederverwenden.
- [ ] Kuratierte Ownerkarte und heutige Auftragszuordnungen mit Quellenbindung übernehmen. Teacherannahme nur mit konkreter Nachricht belegen; aktuelle Meldung automatisch nachlesen. Keine Vollkenntnisbehauptung.
- [ ] Start-/Bereichsansicht und fortlaufenden Analysechat einbetten. Ein gemeinsamer Bereichsname, Details einklappen, Aufgaben/Rückfragen/Ergebnisse im selben Kontext zeigen. Netz optional.
- [ ] Vollständige Firmenzentralensuite, echte lesende Runtimeprobe und Bedienprüfung der drei Fragen. Kein neuer bezahlter Auftrag im Test. Private Daten sichern; kontrollierter Servicewechsel nur ohne eigene aktive Requests.
- [ ] Mac-Paket aktualisieren, Verlauf/Requests erhalten, Nachweisbilder, eigener Checkpoint und PR295/CI. Keine Livewebsiteänderung.

Relevante Kontrollen: SEC14 Idempotenz/unklare Starts, SEC15 fremde Texte, SEC18 Origin-/Hostgrenzen, PRIV07/08 minimale lokale Inhalte, PRIV12 belegter Status, PRIV13 verständliche Bedienung. Selbstreview nach Humanvorgabe; keine unabhängige Assurance behauptet. Neue Modell-/Code-/Providerrechte entstehen nicht durch den UIwechsel.

**Nachträgliche Humankorrektur:** Eine Wiedervorlage nach fünf Tagen ist nur eine unbeschlossene Idee für die Firmenzentrale. Kein Default, Scheduler, Notificationpermission, Heartbeat oder automatischer Lauf wird aktiviert. Bereits geschriebene Fristenlogik ist standardmäßig ausgeschaltet und nur isoliert getestet. Laufende Arbeit ist ausschließlich Zuordnung/Verlauf/Steueransicht.
