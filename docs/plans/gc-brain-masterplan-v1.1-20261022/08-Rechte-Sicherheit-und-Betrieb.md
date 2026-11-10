# Band 08 - Rechte, Sicherheit, Wiederherstellung und Betrieb

## 8.1 Schutzmodell

Die Firmenzentrale bündelt Wissen aus unterschiedlichen Schutzbereichen. Ein technisch erreichbarer Chat, ein freier Dokumentlink und eine gültige Anmeldung sind keine pauschale Erlaubnis zur Verarbeitung aller Inhalte. Zugriffe werden an Zweck, Actor, Rolle, Task und Datenklasse gebunden.

Vorgeschlagene Klassen: öffentlich; unternehmensintern; vertraulich geschäftlich; besonders eingeschränkt. Tatsächliche Personendaten, Schul-/Prüfungsdaten, Credentials und rechtlich empfindliche Inhalte werden über konkrete Datenprofile behandelt. Die Klassennamen sind Produktvorschläge; der Datenschutzowner bestätigt Beispiele und Weitergaberegeln.

Die Zentrale zeigt bei fehlendem Zugriff „geschützte Information vorhanden“ nur wenn bereits diese Metadaten zulässig sind. Sie nennt keine vertraulichen Titel, Zahlen oder Personennamen aus gesperrten Akten. Berechtigungen werden auf Server und Retrievalservice durchgesetzt.

## 8.2 Rollen und Aktionen

| Rolle | Zulässige Grundaktionen | Ausgeschlossene Selbstermächtigung |
| --- | --- | --- |
| Geschäftsverantwortlicher | berechtigte Ziele/Entscheidungen verwalten, konkrete Freigaben erteilen | keine Umgehung externer Rechte oder fremder Datenzuständigkeit |
| Haupt-/Bereichszentrale | lesen, priorisieren, briefen, passend routen, Status prüfen | keine Produkttools, Shell, Builds, Tests oder Deploys |
| Fachbearbeiter | konkrete zugewiesene Aufgabe mit begrenzten Tools ausführen | keine Ausweitung von Dateien, Daten, Budget oder Provider |
| Unabhängiger Reviewer | eingefrorenen Kandidaten und Nachweise prüfen | keine Selbstannahme eigener Implementierung oder ungefragte Änderungen |
| SourceReader | autorisierte Quellen beobachten | kein Dispatch, keine Kundennachricht und kein Releasewechsel |
| Scheduler | genau zugelassene Definition auslösen | keine Rechte-/Budgetänderung oder neue Taskfamilie |
| Administrationsdienst | technische Konfiguration nach Policy | keine automatische fachliche Ergebnisannahme |

Zulässige Einzelaktionen werden in einer serverseitigen Policytabelle geprüft. Modellprompts erläutern Grenzen, ersetzen aber diese Kontrolle nicht. Wo der vorhandene Host keine harte Tooltrennung bietet, steht „nur als Anweisung begrenzt“. Der entsprechende P0-/Produktgate wird dadurch nicht als erfüllt gemeldet.

## 8.3 Authentifizierung und lokale Grenze

Die vorhandene App bindet auf 127.0.0.1 und prüft Host, Origin und Sitzungstoken für Schreibzugriffe. Das ist ein lokales Prototypmodell. Der Actorstring „Codex“ ist keine belastbare Authentifizierung für mehrere Akteure.

Für den produktiven Scope muss der Firmenservice den echten Nutzer-/Hostactor authentifizieren. MCP-Aufrufe erhalten ihren berechtigten Serverkontext aus der zugelassenen Verbindung. Ein Browser darf actorRole, organizationId oder Ownerrechte nicht frei bestimmen.

Bei lokaler Einzelbenutzernutzung wird klar benannt, welcher Betriebssystemnutzer den Store kontrolliert. Bei späterer Netzwerkfreigabe sind HTTPS, standardkonforme Authentifizierung, sichere Session-/Widerrufsverwaltung, Zugriffstrennung und neue Bedrohungsprüfung Pflicht des konkreten Pakets. Ein offener Loopbackport wird nicht einfach an 0.0.0.0 gebunden.

## 8.4 Secret- und Verbindungsverwaltung

Secrets liegen außerhalb Repo, Artefakttext, UIzustand und allgemeinem Requestlog. Die Oberfläche zeigt nur Anbieter, verbindende Rolle, erlaubte Fähigkeiten, Ablauf und letzten Gesundheitscheck.

Ein Token oder Passwort wird nicht durch einen Chat erfragt oder aus einem fremden Profil kopiert. Login erfolgt nur im tatsächlich zugelassenen Setupweg. Der abgebrochene P0-Login wird nicht als funktionierende Verbindung registriert.

Widerruf sperrt neue Zugriffe sofort im Service. Ausstehende Aufträge, Caches und vorbereitete Briefs mit dieser Verbindung werden revalidiert. Ein früher erteiltes Approval überlebt nicht automatisch die neue Policyversion.

## 8.5 Untrusted Inhalte

Kundenberichte, Dokumenttexte, Quellchatbeiträge und Modellartefakte sind Daten. Sie dürfen weder Rollen vergeben noch Policy umschreiben. Der Brief trennt autorisierte Arbeitsanweisung von Quellenzitat.

Text wird escaped dargestellt. HTML, Links, Dateinamen und strukturierte Modellantworten werden validiert. Ein Artefakt mit Pfad außerhalb erlaubtem Root, Symlink, ausführbarer Datei oder unzulässiger Größe wird zurückgewiesen. Externe URLs werden nicht allein aufgrund eines Textbefehls geöffnet oder abgerufen.

Für spätere URL-/Connectorreader gelten Allowlist, Herkunfts-/Protokollprüfung, Redirectgrenze und Schutz vor Zugriff auf interne Adressen. Freitext wird nicht als Shell, SQL oder Dateipfad ausgeführt.

## 8.6 Budget und Kontingent

Abo-Kontingent, APIkosten, Actions-/Cloudkosten und menschlicher Aufwand sind getrennte Größen. Ein Modelllauf über ein Abo ist nicht kostenfrei im Sinne unbegrenzter Nutzung. Wenn die Laufzeit keine exakten Verbrauchsdaten liefert, steht usage=unknown.

Vor einem externen Start werden Task-/Versuchsgrenze und konservative Reservierung geprüft. Unklare Abrechnung bleibt reserviert. Ein neuer Chat, neue Requestschreibweise, ein Quellen-SHAwechsel oder ein Reviewerwechsel setzt die Historie nicht zurück.

Die bestehende Guardian-Policy mit ihren konkreten Profilen bleibt maßgeblich für einen zugelassenen Guardianauftrag. Historische Preis-/Reservierungswerte im Repo sind keine aktuelle allgemeine Preisliste. Die Firmenzentrale liest das jeweilige gültige Profil; sie kopiert keine alten Preise in eine eigene globale Kostentabelle.

## 8.7 Fachliche und technische Freigabe

Ein Review bindet sich an einen unveränderlichen Kandidaten, Scope, Kriterien und Nachweise. Nach relevantem Code-/Policywechsel werden betroffene Reviews erneuert. Ein neuer Dokumentationscommit allein erzeugt keinen Produkt-Codewechsel; die konkrete Bindung muss dennoch nachvollziehbar sein.

Für größere normale GradeCrew-Änderungen werden die tatsächlich gültigen unabhängigen Reviewrollen benutzt. Die strengere Guardian-Kette mit drei Prüfern wird nie auf zwei reduziert. Ein erheblicher belegter Befund blockiert seinen Scope und wird nicht durch Mehrheitsstimmen aufgehoben.

Martins Sicht-/Geräte-/Produktabnahme ist ein eigener Beleg. Ein Modell darf nicht stellvertretend behaupten, Martin habe einen verbundenen Ablauf praktisch getestet.

## 8.8 Backupentwurf

Ein Backup enthält konsistenten Datenbanksnapshot, Artefaktmanifest mit Hashes, Schemaprofil, Policy-/Quellversionen und Journalpointer. Ein lauffähiges Backupverfahren muss auch Vollständigkeit, Lesbarkeit und Berechtigung des Backups prüfen.

Vorgeschlagener lokaler Startstandard: mindestens täglicher Snapshot und zusätzlicher Checkpoint vor Migration oder riskanter Konfigurationsänderung. Das ist ein Planwert, keine eingerichtete Sicherung. Retention und Schutzort werden anhand tatsächlicher Datenklassen und Wiederherstellungsziele bestätigt.

Vorgeschlagene anfängliche Betriebsziele: maximal 24 Stunden fachlicher Datenverlust aus normalen Snapshotdaten und Wiederaufnahme innerhalb von vier Stunden nach verfügbarem konsistentem Backup. Für externe Ausführungs-/Budget-/Widerrufsereignisse ist ein alter Snapshot allein nicht ausreichend; deren Abgleichvertrag gilt unabhängig davon. Die Ziele sind vor Inbetriebnahme durch reale Tests zu belegen.

## 8.9 D4 - Restore bleibt gesperrt

beginRestore erzeugt eine neue RecoveryEpoch. Dispatch, Outboxstart und Approvalfortsetzung des restaurierten Scopes sind gesperrt. Rechte, Quellenfrische und Grants stehen auf unverified. Löschungen/Widerrufe müssen vor Anzeige, Suche und Briefbildung angewendet werden.

Abzugleichen sind alle seit dem Snapshot möglichen externen Starts, einschließlich bereits abgeschlossener Ausführungen; Versuche, Reservierungen und Verbrauch; aufgelöste Fragen/Approvals; Widerrufe und Löschungen. Es reicht nicht, nur die im alten Snapshot offenen Jobs zu betrachten.

Option A ist ein unabhängig erhaltenes geschütztes Journal außerhalb des restaurierten Snapshotumfangs. Jeder Startintent wird vor externer Wirkung geschrieben. Das Backup hält Journalidentität und Highwatermark. Die Wiederherstellung muss eine lückenlose Kette bis zu einem unabhängig erhaltenen aktuellen Head nachweisen.

Ein zusammen mit dem alten Snapshot zurückgerolltes Journal ist kein vollständiger Beweis. Ein Hash oder eine fehlende Zeile beweist keine Abwesenheit eines späteren Starts. Ein zweites Verzeichnis auf derselben kaputten Festplatte löst keinen vollständigen Rechnerverlust. Bei unzureichender unabhängiger Evidenz bleibt der Scope gesperrt.

Option B ist belegte manuelle Reconciliation aus tatsächlichen externen Quellen. Nicht jedes System bietet vollständige Historie. Fehlende Abdeckung wird ausdrücklich markiert. Unklare Kosten bleiben konservativ gebunden, alte Freigaben ungültig.

completeRecovery gibt nur den nachgewiesenen Scope atomar frei. Vor neuen Starts folgen aktuelle Revisions-, ACL-, Budget- und Frischeprüfungen. Die Sperre darf nicht durch neue IDs oder einen zweiten Datenbankordner umgangen werden.

## 8.10 Löschung und Aufbewahrung

Inhalte, notwendige technische Ereignisse und Geschäftsdokumente haben getrennte Retentionprofile. Konkrete rechtliche Aufbewahrungs-/Löschentscheidungen werden von den zuständigen Personen anhand der tatsächlichen Daten und Verträge festgelegt.

Ein Löschvorgang umfasst Datenbankpayload, Artefakte, Suchindex, abgeleitete Caches und künftige Briefe. Backups brauchen eine dokumentierte Wiederherstellungsbehandlung durch Tombstones beziehungsweise nachgelagerte Löschanwendung. Die Löschung wird nicht als vollständig bestätigt, solange diese Kette nicht geprüft ist.

Auditlogs enthalten sparsame notwendige Ereignisse und keine vollständigen persönlichen Inhalte. Auch Hashes können sensible Informationen verraten, wenn der mögliche Ursprungswert klein ist; solche Digestwerte werden nicht als anonymes Freigabeticket behandelt.

## 8.11 Monitoring und Betriebskennzahlen

Technische Kennzahlen: tatsächliche Serviceerreichbarkeit, Datenbankfehler, Outboxrückstand, unknown-Zustände, Reconciliationdauer, SourceReaderfehler, abgelaufene Grants, Adaptercapabilityfehler und fehlende Resultatbelege.

Fachliche Kennzahlen: angenommene Ergebnisse, offene Kriterien, Rückfragen ohne zuständigen Entscheider, unzugeordnete Tasks und veraltete kritische Quellen. Nachgewiesene Ergebnisse und bloß beendete Runs bleiben getrennt.

Logs verwenden correlationId, requestId, taskId, executionId und Eventsequenz. Sie enthalten keine Secrets oder unnötigen Kundentexte. Zugriffe auf Audit- und Fehlerdiagnose unterliegen einer eigenen Rolle.

Vorgeschlagene Bedienziele sind schnelle Storeantwort und sichtbar früher Status nach Senden. Konkrete Latenz-SLOs werden erst nach Messung auf dem Zielhost festgelegt. Keine erfundenen P95-Werte oder Erfolgsquoten als Werbeaussage.

## 8.12 Störungen und Notstopp

Bei Datenverlustverdacht, Rechtefehler, unklarem externen Start oder möglicher Geheimnisoffenlegung: neue betroffene Starts sperren, laufende Vorgänge identifizieren, Quellen/Ereignisse sichern, zuständigen Incidentowner benennen und tatsächlichen Zustand abgleichen.

Ein globaler Notstopp sperrt die Ausführung, lässt aber berechtigte lesende Diagnose und Belegsicherung zu. Er löscht keine Geschichte. Ein Stopknopf garantiert nicht den Stop eines bereits laufenden Fremdsystems. Der Unterschied zwischen cancel_requested, confirmed_stopped und unknown ist sichtbar.

Nach Behebung werden Ursache, betroffener Scope, bestätigte Wirkung, Wiederanlaufkriterien und Nacharbeit festgehalten. Ein Incident wird erst nach passendem Retest geschlossen.

## 8.13 Hosting und Bereitstellung

V1 kann lokal im qualifizierten Host beginnen. Installations-/Startpfad, Serviceversion, Datenroot und Backuport müssen eindeutig sein. Die bisherige statische Vorschau an Port 8794 ist keine produktive Firmenserviceinstallation.

Eine spätere gehostete Variante benötigt einen tatsächlich bestimmten Betreiber, erreichbare HTTPSadresse, Auth-/Secretmanagement, Updates, Monitoring, Datenstandort, Backups und Kostenrahmen. Die Schul-Liveumgebung wird nicht automatisch zum Hostingplatz der internen Firmenzentrale.

Deploymentstufen werden getrennt dokumentiert. Ein internes Tool kann ebenso sensible Daten enthalten wie das Schulprodukt; die fehlende öffentliche Sichtbarkeit ist kein Ersatz für Rechteprüfung.

## 8.14 Betriebsübergabe

Vor Übergabe müssen vorhanden sein: Installations-/Versionsmanifest; Start/Stop/Healthcheck; Daten- und Backupverzeichnis; aktive Verbindungen mit Scope; Routingregister; Berechtigungsowner; Wiederherstellungsanleitung; bekannte offene Grenzen; tatsächliche Prüfbelege; letzter gültiger Checkpoint.

Der neue Operator muss einen unbekannten Versandstatus finden, einen Readerausfall erklären, einen Task nach Neustart wiederfinden und eine isolierte Wiederherstellung durchführen können. Erst diese beobachteten Schritte machen das Betriebsbuch praktisch belastbar.

