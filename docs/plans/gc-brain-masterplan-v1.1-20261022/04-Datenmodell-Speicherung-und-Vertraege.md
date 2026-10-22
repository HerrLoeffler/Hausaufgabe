# Band 04 - Datenmodell, Speicherung und Konsistenz

## 4.1 Datenhoheit FZ-DATA-01

Die Firmenzentrale braucht eine autoritative Ablage für Geschäftsobjekte und Ausführungszustände. Das bedeutet nicht, alle bestehenden Register zu duplizieren. Die Hoheit wird pro Information festgelegt.

| Information | Kanonischer Ort | Projektion in der Firmenzentrale |
| --- | --- | --- |
| GradeCrew-Taskidentität und Repo-Zuordnung | bestehendes main-TODO/Workstreamregister | Original-ID und referenzierter Quellenstand |
| Aktuelle Git-/PR-/CI-Daten | GitHub/Git und Development Status | datierte Beobachtung mit Commit/Run |
| Release-/Deploymentbelege | bestehende Receipts und GRADECREW_STATE | geprüfte Komponenten-/Umgebungsbeobachtung |
| Ziele, Konzepte und Geschäftsentscheidungen | autorisierter Firmenbestand mit Versionen | identischer Bestand in allen Ansichten |
| Requests, Messages und Executions | transaktionaler Firmenstore | Statusprojektionen, keine manuelle Chatwahrheit |
| Rohdateien, Bilder, Prüfergebnisse | geschützte Artefaktablage | Referenz, Hash, Metadaten und Zugangsprüfung |
| Credentials | zugelassener Secret-/Credentialstore | nur Verbindungsmetadaten, niemals Geheimniswert |

Eine Aufgabe kann im Firmenstore einen stabilen internen Schlüssel haben und auf eine bestehende GC-ID verweisen. Das ist eine technische Repräsentation derselben Aufgabe. Die externe ID wird nicht neu vergeben, nur weil eine andere Oberfläche oder ein neuer Chat verwendet wird.

Neue Produktwünsche erhalten zunächst einen Entwurf. Der zuständige Writer führt die kanonische Repo-Zuordnung einmalig nach den bestehenden Regeln nach. Die Anwendung darf nicht bei jedem Kommentar einen Maincommit auslösen. Rückschreiboperationen haben Versionserwartung und Konfliktzustand; kein stilles Überschreiben anderer Chatänderungen.

## 4.2 Speicherempfehlung FZ-ADR-STORE

Vorschlag für den ersten lokalen Produktbetrieb: ein einzelner autoritativer Service mit relationalem transaktionalem Store, bevorzugt SQLite, plus geschütztem Dateiverzeichnis für Artefakte. Relationale Tabellen und typisierte Kanten reichen für Ziele/Abhängigkeiten aus. Eine zusätzliche Graphdatenbank, Vektordatenbank und verteilte Eventplattform sind kein V1-Grundbedarf.

Die konkrete SQLite-Anbindung wird erst nach dem Codebestandsabgleich auf der tatsächlich verfügbaren Node-Laufzeit gepinnt. Die Migration und ihr Treiber sind im P1-Paket gemeinsam zu prüfen. Es wird kein als stabil vorausgesetztes experimentelles Runtime-Modul eingeplant, ohne die installierte Version zu verifizieren.

Vorgeschlagene Kriterien für den Vergleich: Transaktionen 30 Prozent, geringe Betriebsarbeit 25 Prozent, lokale Wiederherstellung 20 Prozent, bestehende Integration 15 Prozent, späterer Teamweg 10 Prozent. Begründete Eignung: SQLite 9/10 für den lokalen Einzelservice; PostgreSQL 8/10 für späteren gehosteten Teambetrieb; die bisherige vollständige JSON-Datei 4/10 für das neue Nebenläufigkeits-/Revisionsmodell. Die JSON-Datei ist als heutiger Prototypbestand wertvoll, besitzt aber keinen ausreichenden produktiven Multi-Request-/Migration-/Journalvertrag.

Ein späterer Cloudwechsel ist eine eigene Migration mit Authentifizierung, Transport, Backup, Rechteprüfung und Parallelitätsabnahme. Die lokale Datenbank wird nicht in einen Synchronisationsordner gelegt und von mehreren Geräten gleichzeitig beschrieben.

## 4.3 Gemeinsame Feldregeln

Jedes Geschäftsobjekt enthält id, organizationId, revision, createdAt, updatedAt, createdBy, classification und lifecycleState. Revisionen sind monotone Ganzzahlen je Aggregat. Zeitpunkte werden in UTC gespeichert und in der Benutzerzeitzone angezeigt. Geschäftliche Fristen unterscheiden Datum, Zeitzone und gegebenenfalls genaue Uhrzeit.

Geldbeträge werden als Integer in kleinster Währungseinheit mit expliziter Währung gespeichert. Unknown ist kein Nullbetrag. Mengen/Prozente haben definierte Einheit, Quelle und Zeitraum. Unsicherheit ist ein eigenes Feld oder ein typisierter Zustand.

Objektreferenzen sind echte Fremdschlüssel beziehungsweise validierte IDs. Beliebige URLs werden nicht als Identität einer Aufgabe verwendet. Eingaben begrenzen Länge, Menge und Objektanzahl. Server normalisiert freigegebene Felder; Clientwerte für Rollen, Ownerrechte und Kostenfreigaben sind nicht vertrauenswürdig.

V1 kann auf eine Organisation und einen Nutzer begrenzt sein. Trotzdem wird jede Operation an den tatsächlichen Organisations-/Benutzerkontext gebunden. Dies ist eine Konsistenzvorbereitung, kein behaupteter bereits geprüfter Mehrmandantenbetrieb.

## 4.4 Entitäten und Pflichtinvarianten

### Organization und Actor

Organization speichert bestätigtes Unternehmensprofil, Zeitzone, Basisrichtlinien und zuständige menschliche Personen. Actor speichert Mensch, Hostagent oder Dienst mit eindeutigem Typ. Ein Actor darf nicht frei eine Zentralenrolle behaupten.

### Area und Project

Area enthält Auftrag, fachlichen Owner, zulässige Datenklassen und Zuständigkeitsgrenzen. Project enthält Zweck, Status, Hauptowner und beteiligte Bereiche. Beziehungen sind referenziert. Der gleiche Task kann in mehreren Sichten erscheinen.

### Goal, GoalRevision und GoalEdge

Goal hält stabile Identität; GoalRevision hält Scope, Kriterien, Owner, Aggregationsmodus, Basisversion und bestätigende Entscheidung. GoalEdge hält Parent, Child, Typ, Gewicht und Parentrevision. Aggregierende Kanten sind eindeutig und zyklusfrei.

### Milestone und AcceptanceCriterion

Milestone bindet eine prüfbare Lieferung an die gültige Zielrevision. AcceptanceCriterion beschreibt erwartetes Verhalten, Prüfmethode, notwendige Belege und Annahmerolle. Eine Textnotiz „erledigt“ ist kein AcceptanceEvent.

### Task und TaskContribution

Task hält Original-ID, führenden Bereich, Owner, Priorität, Arbeitsstatus und kanonische Quellenbindung. TaskContribution bindet den Beitrag einer Task an ein Ziel/Kriterium auf einer bestimmten Revision. Eine Task kann mehrere Beiträge besitzen; dieselbe Ergebnisidentität darf in einem aggregierenden Pfad nicht doppelt zählen.

### Conversation und Message

Conversation ist eine Produktfallakte oder ein Bereichsgespräch. Message enthält Autor, Inhalt/Artefaktreferenz, Sichtbarkeit, Requestbezug, clientMessageId und serverTimestamp. Eine Nachricht kann mehrere Attachments haben. Produktnachrichten sind nicht automatisch ein Vollimport fremder Chatverläufe.

### Request und WorkBriefSnapshot

Request enthält taskId, intent, requestId/idempotencyKey, erwartete Revisionen, Auftraggeber, Status und Scope. WorkBriefSnapshot enthält den vollständig aufgelösten, unveränderlichen Arbeitsbrief samt Hash, Quelldateien, Fakten-/Entscheidungsreferenzen und ACL-/Policy-/Empfängerversionen.

### DispatchOutbox und Execution

DispatchOutbox enthält lokalen Zustellauftrag, Status, externe Zielbindung, Deadline, Reservierung, Startintent und vorhandene Quittungen. Execution enthält realen Ausführungsversuch, Runtime/Hostversion, Remote-Thread-/Turn-/Run-IDs, Startbeleg, Ergebnis, Abbruch und unklare Zustände. Ein lokaler queued-Zustand ist kein Remote-Start.

### PendingQuestion und Approval

PendingQuestion enthält die konkret offene fachliche Frage, Executionbezug und erlaubte Antwortform. Approval bindet eine konkrete Aktion mit actionArgumentsHash, Scope, Policy, Frist und zulässiger Entscheiderrolle. Beide besitzen eigene Auflösungsereignisse; eine Standfragenantwort ist keine Runtime-Freigabe.

### Artifact, Evidence und AcceptanceEvent

Artifact hält Datei/Objekt, Typ, Größe, Hash und sicheren Ablageort. Evidence hält die Aussage, welche Eigenschaft der Beleg nachweist, für welchen Commit/Scope/Zeitraum und mit welchen Grenzen. AcceptanceEvent verbindet Kriterium, Zielrevision, Beleg, Entscheider und Entscheidung. Ein Hash identifiziert Inhalt; er beweist ohne vertrauenswürdige Herkunft keine Echtheit.

### Concept, Decision und KnowledgeEntry

Concept hat versionierten Inhalt und Gültigkeitsstatus. Decision hält bestätigte Wahl und Gründe. KnowledgeEntry enthält eine prüfbare Aussage, Quellen, fachliche Gültigkeit, Widersprüche und Zugangsregeln. Generierte Zusammenfassungen sind Ableitungen, keine neue Primärquelle.

### Source und SourceObservation

Source enthält Zugriffspfad, Quelltyp, Klassifikation und Owner. SourceObservation hält den tatsächlich gelesenen Ausschnitt, Quelle/Commit/ETag, Zugriffszeit, Abdeckung und Fehler. Eine historische Beobachtung wird nicht rückwirkend aktualisiert.

### RoleBinding, RouteBinding und CapabilityProfile

RoleBinding verbindet Actor und logische Rolle zeitlich begrenzt. RouteBinding verbindet Rolle/Projekt/Absicht mit einem tatsächlichen Host und Thread oder zulässigen Dienst. CapabilityProfile enthält beobachtete beziehungsweise genehmigte Fähigkeiten und deren Prüfnachweis. Eine Route ohne belegte Fähigkeit bleibt disabled.

### PolicyGrant und BudgetReservation

PolicyGrant enthält erlaubte Aktion, Scope, Datenklasse, Befristung und Widerruf. BudgetReservation enthält Aufgabe, Versuch, Obergrenze, Einheit/Währung, bekannten Verbrauch und unknown-Anteil. Ein neuer Chat erzeugt keine neue Reservierung für dieselbe unklare Ausführung.

### AutomationDefinition, AutomationRun und Notification

Definition hält versionierten Prozessvertrag, Trigger, Profil und Grenzen. Run hält konkreten ausgelösten Versuch mit eigener Ereignis-ID. Notification hält deduplizierten Handlungsbedarf, Zustellkanal, Autorisierung und tatsächlichen Zustellbeleg.

### RecoveryEpoch, JournalPointer und Tombstone

RecoveryEpoch hält Beginn, gesperrten Scope und Abgleichstatus. JournalPointer referenziert unabhängig erhaltene aktuelle Sequenz-/Epochbelege. Tombstone verhindert Wiederbelebung widerrufener oder gelöschter Inhalte durch alte Snapshots. Gelöschte Inhalte werden nicht selbst im Tombstone weitergespeichert.

## 4.5 Transaktionsgrenzen

Ein neuer Auftrag speichert Message, Taskänderung falls zulässig, Request, Briefsnapshot und Outbox in einer gemeinsamen Transaktion. Scheitert ein Teil, bleibt kein halber Auftrag zurück. Die Antwort enthält die autoritative Revision und dieselbe Request-ID.

Ein Belegannahmevorgang speichert AcceptanceEvent, Versionsprüfung und Invalidierung betroffener Projektionen gemeinsam. Die UI kann danach alte Projektionen kurz als „wird aktualisiert“ zeigen, darf aber nicht eine ungeprüfte eigene Prozentzahl berechnen.

Externe Calls liegen außerhalb der Datenbanktransaktion. Vor dem Call werden Startintent, Versuch und Budget dauerhaft gespeichert. Nach Antwort folgt die Remotequittung. Bei Crash dazwischen bleibt ein unklarer Start. Ein Datenbanklock allein garantiert keine genau einmalige Wirkung in einem fremden System.

## 4.6 Revisionsvertrag D1

Vor Dispatch prüft admitDispatch(requestId, expectedRevisionSet) atomar Task-, Contribution-, Goal-, Kriterien-, Konzept-, Quellen-, ACL-, Policy- und Empfängerversion. Ergebnis bei Abweichung: needs_revalidation, kein Start und keine neue Datenweitergabe.

Ein bereits laufender Auftrag bleibt an seinem historischen Brief gebunden. Rechteentzug beendet künftige Kontextweitergabe und löst einen kontrollierten Abbruchwunsch aus. „Gestoppt“ wird erst nach echtem Stopbeleg angezeigt.

acceptResult(executionId, artifactHash, expectedGoalRevision, expectedCriterionRevision, decisionId) prüft die aktuelle Annahmebasis und Rechte. Ein R1-Ergebnis kann gegen R2 nur durch ein ausdrücklich protokolliertes neues Mapping übernommen werden. Die alte Execution wird dabei nicht umgeschrieben.

## 4.7 Idempotenz und Zustellsemantik

requestId ist eine vom Client erzeugte UUID und bleibt bei Wiederaufnahme gleich. Der Server bindet den Key an actorId, organizationId und Payloadhash. Gleicher Key/gleiche Payload liefert dasselbe Ergebnis. Gleicher Key/andere Payload ergibt Konflikt.

Für Remoteereignisse gilt eine eindeutige Identität aus Adapter, Remote-ID und Ereignistyp/Sequenz. Doppelte Events erzeugen keine zweite Statusänderung. Späte Events dürfen einen neueren geschlossenen Zustand nicht ohne zulässige Transition überschreiben.

Ein Lease schützt den aktiven lokalen Writer. Ein Fencing-Token verhindert veraltete lokale Folgeoperationen. Der externe Dienst muss zusätzlich unterstützte Idempotenz-/Statusabfrage bieten oder das Ergebnis bleibt bei unklarem ACK unbekannt. Kein allgemeines Exactly-once-Versprechen.

## 4.8 Zustandsachsen

Taskstatus beschreibt fachliche Arbeit: erfasst, geplant, bereit, in Bearbeitung, blockiert, zur Prüfung, angenommen, beendet/abgebrochen. Requeststatus beschreibt Zulassung und Zustellung. Executionstatus beschreibt reale Laufzeit. Releasestufe beschreibt Lieferbelege. Diese Achsen werden getrennt gespeichert und in verständliche kombinierte UItexte projiziert.

Ein completed Turn bedeutet nicht automatisch angenommenes Ergebnis. Eine angenommene Dokumentation bedeutet keine integrierte Software. Ein deployed Hostingartefakt bedeutet keine vollständige V1-Abnahme. Die Projektregeln bleiben im Modell sichtbar.

## 4.9 Artefaktablage

Dateien liegen außerhalb ausführbarer Quellpfade in einem autorisierten Root. Ein Upload erhält zufälligen Objektschlüssel; Dateiname dient nur der Anzeige. MIME, Größe, Pfad und zulässige Inhaltstypen werden geprüft. Symlinks, relative Pfadtricks und Ausführung aus Uploads sind nicht erlaubt.

Download benötigt dieselbe Objektberechtigung wie die Akte. Links enthalten keine dauerhaften Geheimnisse. Exportdateien nennen Klassifikation und Snapshotzeit. Backups und exportierte Akten können sensible Inhalte enthalten und unterliegen denselben Schutz-/Löschregeln.

## 4.10 Projektionen, Index und Löschung

Today, Firmennetz, Suche und Chefbrief sind abgeleitete Projektionen mit sourceRevision und processedEventSequence. Sie können neu aufgebaut werden. Der autoritative Store bleibt maßgeblich.

Zugriff wird vor Suchretrieval und vor Zusammenfassung geprüft. Gelöschte/widerrufene Inhalte werden aus Index, Embeddings falls später vorhanden, Cache und Briefbildung entfernt. Ein alter Index darf keine Rechte umgehen. Der bisherige historische Brief kann zur Nachvollziehbarkeit geschützt erhalten bleiben, soweit zulässig; weitere Offenlegung bleibt gesperrt und Retention wird fachlich festgelegt.

Ein append-only Auditlog bewahrt nicht pauschal alle personenbezogenen Textpayloads. Geschäftsereignis und löschbarer Inhalt werden getrennt. Ein Tombstone enthält nur notwendige technische Referenz und Berechtigungs-/Löschstatus.

## 4.11 Migration vom Prototyp

Vor Import: vorhandene JSON-Datei, Katalog, Fragen, Antworten und Entwürfe inventarisieren; Hash und lesbares Backup erzeugen; fremde untracked Dateien erhalten. Import erfolgt in eigenen Teststore, nicht direkt über die laufende App.

Jede Alt-ID wird über eine eindeutige MigrationMap auf den neuen Datensatz abgebildet. Prepared-Drafts werden nicht als bereit zur Ausführung übernommen. Historisch „running“ gemeldete Drafts brauchen Abgleich; sie werden nicht als tatsächlicher Workerbeleg interpretiert.

Import wird zweimal gegen denselben Bestand ausgeführt und muss dieselbe Anzahl/Identität liefern. Anschließend werden Quell-/Zielzählung, Referenzen, Zeichensätze, unbekannte Zustände und Export lesend verglichen. Produktumschaltung erfolgt nach separatem Migrationstest und mit explizitem Rückweg. Parallelbetrieb mit zwei Schreibern derselben Geschäftsobjekte ist ausgeschlossen.

## 4.12 Qualitäts- und Eingangsobjekte

Band 17 ergänzt versionierte QualificationBasis, QualityDecision, QualityFinding und Verweise auf Testläufe. Band 18 ergänzt IngressMessage, CaseRecord und RoutingSuggestion. Sie verwenden dieselben ACL-, Revisions-, Idempotenz-, Ereignis- und Recoveryverträge. Ein CaseRecord verbindet vorhandene SupportCase-, Task-, Incident- und Kommunikationsobjekte; er kopiert keine fremde Releasewahrheit. Schülerantworten und Lösungsschlüssel bleiben in den bestehenden geschützten Fachsystemen.
