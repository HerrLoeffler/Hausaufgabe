# Band 11 - API-, Nachrichten- und Zustandsprotokoll

## 11.1 Status dieses technischen Vertrags

Die Namen und Payloads dieses Bands sind vorgeschlagene interne GradeCrew-Schnittstellen. Sie sind weder bereits implementierte MCPtools noch offizielle OpenAI-APIendpunkte. Der zuständige Store/APIwriter bestätigt die konkrete Version nach P0 und Codebestandsabgleich.

Alle Mutationen erhalten einen serverseitig authentifizierten ActorContext. Der Client kann ihn nicht im Payload frei wählen. Unbekannte Eingabefelder werden an Mutationsgrenzen zurückgewiesen. Responses haben schemaVersion und einen typisierten Datentyp; inkompatible Majorversion wird vor Aktion abgelehnt.

## 11.2 Gemeinsame Requestregeln

HTTPclient und MCPtools verwenden dieselben ApplicationServices. Die HTTProute enthält keine eigene alternative Fachlogik. MCPadapter übersetzen validierte Argumente und geben denselben ResultEnvelope zurück.

Mutationen haben requestId/idempotencyKey und erwartete Aggregateversion. Ein HTTPclient kann If-Match verwenden; MCPargumente enthalten expectedRevision. Beide werden auf dieselbe interne CAS-Prüfung abgebildet.

Größenvorschlag V1: Auftragstext maximal20.000Zeichen, kurze Titel maximal180, höchstens20Quell-/Attachmentreferenzen pro Submit. Größere Inhalte werden als geschütztes Artefakt übergeben. Diese Produktgrenzen werden im Frontend und Server gleich validiert und im Vertrag versioniert. Sie erweitern keine bestehenden externen Toollimits.

## 11.3 Typen

~~~text
ActorContext:
  actorId, organizationId, roleBindings, policyVersion, authSessionRef

RevisionSet:
  taskRevision, contributionRevision, goalRevision, criterionRevision,
  conceptRevisions[], sourceVersions[], aclVersion, policyVersion,
  recipientProfileVersion

ResultEnvelope<T>:
  schemaVersion, dataType, requestId, taskId?, revision?,
  status, observedAt, data:T, warnings[], errors[]

SourceRef:
  sourceId, observedVersion, observationId, coverage, classification

RemoteBinding:
  adapterId, hostId, runtimeVersion, threadId?, turnId?, runId?,
  remoteRequestId?, lastEventCursor?, briefHash

Error:
  code, message, retryClass, currentRevision?, detailsRef?
~~~

IDs sind stabile opaque Strings, bevorzugt UUID für interne Objekte. TaskexternalKey enthält die vorhandene GC-ID. Datumsangaben sind ISO8601-UTC; Tages-/Geschäftsfristen haben zusätzliche Zeitzone. Nullwerte werden nicht durch leere Strings oder scheinbare Nullbeträge ersetzt.

## 11.4 SubmitRequest FZ-API-01

Vorgeschlagener MCPtoolname gradecrew_submit_request; HTTProute POST /api/v1/requests. Eingaben:

~~~json
{
  "requestId": "UUID",
  "clientMessageId": "UUID",
  "taskRef": "GC-BRAIN-01",
  "intent": "work",
  "areaId": "technology",
  "projectId": "company-center",
  "goalId": "goal-uuid",
  "text": "Pruefe den bestehenden Host-Rueckkanal.",
  "attachmentRefs": [],
  "expectedTaskRevision": 12
}
~~~

intent erlaubt question, work, idea oder note. Ein bestehender Task wird nur mit passender Berechtigung und Version ergänzt. Ein neuer Geschäftstask erhält eine neue stabile interne Identität und nach zuständigem Registerprozess seine kanonische externe Zuordnung; er startet nicht bereits durch Ideenerfassung.

Serverablauf: Actor prüfen; Payload validieren; Idempotenzkey prüfen; Task-/Goal-/Quellenbasis lesen; erlaubten Kontext auflösen; Briefsnapshot erzeugen; Message/Request/Outbox in Transaktion speichern. Der Server bestimmt Ownerrechte und Profile. Eine vom Client angegebene Rolle oder Modellwahl ist höchstens Präferenz, keine Rechtequelle.

Antwortstatus stored bedeutet nur dauerhaft gespeichert. Antwort enthält autoritative IDs/Revision, Briefhash, nächsten zulässigen Schritt und eventuell needs_clarification. Es entsteht kein running-Status.

## 11.5 Lesen und Aktualisierungen FZ-API-02

Tool gradecrew_get_case(taskId, sinceRevision?) liefert berechtigte Akte mit Statusachsen, offenen Fragen, bestätigten Quellen, Artefaktmetadaten und Projektion. Tool gradecrew_get_updates(cursor, scope, limit) liefert autorisierte neue Geschäftsevents plus nächsten Cursor.

V1 kann im sichtbaren Client begrenzt pollen. Vorgeschlagener Ausgangswert fünf Sekunden, pausiert bei versteckter Ansicht und mit Backoff bei Fehlern. Das ist kein Modellaufruf. Der Hosttransport muss solche direkten Readtools tatsächlich tragen; ansonsten erfolgt Aktualisierung über vorhandene Resultnotifications und bewussten Refresh.

Standalone kann HTTP/ETag nutzen. Eine MCPiframe fragt über die unterstützte Bridge, nicht über heimliche localhostfetches. Jeder Feedfilter wird serverseitig autorisiert. Ein Cursor gehört zu Scope und Berechtigungsversion; nach ACLwechsel wird er revalidiert.

## 11.6 Koordinationsclaim FZ-API-03

gradecrew_claim_coordination(requestId, expectedRevision, coordinatorEpoch) ist nur für die aktuelle registrierte Zentralenrolle zulässig. Der Claim schreibt OwnerActor, Epoch, Zeit und begrenzte Lease. Ein anderer Claim erhält Konflikt mit sichtbarem aktuellem Zustand.

Eine abgelaufene Lease erzeugt keinen neuen externen Fachstart. Zuerst werden vorhandene Dispatch-/Remoteereignisse abgeglichen. Ein ReplacementCoordinator kann denselben Request übernehmen, wenn die RoleBinding wirksam gewechselt und die Reconciliation vollständig ist.

## 11.7 Routing FZ-API-04

gradecrew_route_request(requestId, routeBindingId, expectedRevision) speichert bestätigte fachliche Zuständigkeit und erforderliche Unterkoordination. Server prüft Route/Scope/Capability/ACL und vorhandene Workstreamarbeit.

Output ist routed oder needs_assignment. Ein Routingerfolg ist noch keine Zustellung. deliverRequest schreibt einen Zustellintent, dann den tatsächlichen Hostbeleg. Bei unbekanntem ACK lautet der Zustand delivery_unknown. Die weitere UIaktion ist Statusabgleich, kein neuer Submit.

Eine Weiterleitung zwischen Zentralen erhält childCoordinationId, aber dieselbe fachliche requestId/parentRequestId-Kette. Der Brief enthält nur für diese Rolle erlaubte Daten.

## 11.8 Dispatchzulassung FZ-API-05

admitDispatch(requestId, expectedRevisionSet) führt atomar folgende Prüfungen aus: aktuelle Task-/Goal-/Kriterien-/Konzeptbasis; gültige ACL/Policy; erlaubtes Empfängerprofil; freie beziehungsweise richtig übernommene Scopelease; gültiger Grant; vorhandenes Budget-/Versuchslimit; kein ungeklärter früherer Start.

Bei Erfolg entsteht AdmissionReceipt mit admissionId, exactBriefHash, RevisionSet, budgetReservationId, attemptNumber, actionProfile und FenceToken. Der eigentliche Runtimeaufruf darf nur diesen gültigen begrenzten Admission verwenden.

Vor Außenwirkung wird der Intent dauerhaft gespeichert. Nach Außenwirkung wird RemoteBinding hinzugefügt. Ein Timeout in diesem Zwischenraum darf kein „fehlgeschlagen, einfach erneut“ erzeugen.

## 11.9 ExecutionEvent FZ-API-06

Vorgeschlagenes Ereignisformat:

~~~json
{
  "eventId": "adapter-stable-event-id",
  "executionId": "execution-uuid",
  "requestId": "request-uuid",
  "type": "tool_completed",
  "observedAt": "2026-10-22T18:00:00Z",
  "remoteBinding": {
    "adapterId": "qualified-host",
    "threadId": "remote-thread",
    "turnId": "remote-turn"
  },
  "briefHash": "sha256-content-identity",
  "artifactRefs": ["artifact-uuid"],
  "sourceReceiptRef": "protected-receipt"
}
~~~

Die Ingressauthentifizierung ist außerhalb des frei erzeugten Payloads. Ereignisse haben sourceTrust: runtime_observed, host_observed oder actor_reported. Ein bloßer Modelltext „ich habe gestartet“ ist actor_reported und reicht nicht als deterministischer Startnachweis.

Ein Callback muss gegen den qualifizierten Adapterscope und eigene Remoteidentität geprüft werden. Falls der vorhandene Host keinen verifizierbaren Rückkanal liefern kann, bleibt der zugehörige Produktgate offen. Ein erfundenes signiertes Receiptschema löst diese Fähigkeitsfrage nicht.

## 11.10 PendingQuestion FZ-API-07

Eine Frage enthält pendingQuestionId, requestId, executionId, briefHash, questionType, Text, zulässige Antwortform, zuständige Rolle, createdAt und optional expiresAt. Fachliche Rückfrage und Aktionsfreigabe sind unterschiedliche Typen.

gradecrew_answer_question(pendingQuestionId, answer, expectedRevision, responseId) schreibt die Antwort atomar. Anschließend wird die tatsächliche Antwortübermittlung an die bestehende Runtime gebunden. Bei fehlender Remoteauflösung bleibt answer_stored_not_delivered.

Ein neuer Modellturn als Ersatz wird nur dann genutzt, wenn dies explizit der qualifizierte Runtimevertrag ist und keine offene externe Approval umgangen wird. Es darf nicht als Fortsetzung derselben Runtimefrage ausgegeben werden, wenn der alte Vorgang tatsächlich verloren ist.

## 11.11 Approval FZ-API-08

Approval enthält approvalId, requestId, executionId, remoteRequestId, actionProfile, actionArgumentsHash, targetScope, budgetLimit, briefHash, policyVersion, permittedApprover und expiresAt.

gradecrew_resolve_approval(approvalId, decision, expectedRevision, decisionId) erlaubt approve, reject oder request_change. Der Service prüft Entscheidungsrecht, aktuelle Datenbasis, unveränderte Aktion und noch gültige externe PendingRequestbindung.

Ein Approval ist für genau die sichtbare Aktion gültig. Ein Upgrade von Dateilesen zu Shellausführung, Test zu Production oder fünf zu fünfzig Euro ist eine andere Aktion und benötigt einen neuen konkreten Entscheidungsprozess.

## 11.12 Ergebnis und Annahme FZ-API-09

submitResult(executionId, artifactRefs, summary, limitations, sourceReceipts) führt nur zu result_submitted. Der Server prüft Artefaktzugriff, Hash, Dateityp, Größe und Briefbindung.

requestReview(candidateRef, criteriaRef, reviewerProfile) erzeugt einen unabhängigen Reviewauftrag im zulässigen Scope. Reviewerberichte enthalten Befund, Schweregrad, Auswirkung, Beleg und Urteil. Kein Befund ist ebenfalls ein mögliches Resultat, sofern die Prüfung tatsächlich stattfand.

acceptResult(executionId, artifactHash, expectedGoalRevision, expectedCriterionRevision, decisionId) speichert AcceptanceEvent und Zielbeitrag nur bei gültiger Basis. Das Ergebnis kann auch fachlich abgelehnt oder zur Nacharbeit gegeben werden. Nacharbeit zählt gegen die bestehende Versuchshistorie, soweit es derselbe genehmigte Auftrag ist.

## 11.13 Abbruch und Reconciliation FZ-API-10

requestCancel(executionId, reason, expectedRevision) speichert den Wunsch und sendet den zugelassenen Remoteabbruch. Ergebnis ist cancel_requested, confirmed_stopped oder unknown. Die UI zeigt die tatsächliche Stufe.

reconcileExecution(executionId) darf nur vorhandene eigene/berechtigte Remotevorgänge lesen. Es startet keinen neuen Turn. Abgleichergebnis enthält vorhandene Runs, letzte Events, offene Fragen, Ergebnisartefakte und bekannte Usage. Fehlende Befunde bleiben unklar.

## 11.14 Fehlerklassen

VALIDATION_ERROR: Eingabe nicht im Vertrag, keine Mutation.

NOT_AUTHORIZED: fehlende Berechtigung; kein vertraulicher Objektinhalt in Fehlerdetail.

REVISION_CONFLICT: aktuelle Basis abweichend; Revalidierung, kein stiller Retry.

IDEMPOTENCY_CONFLICT: Key wurde mit anderer Payload verwendet.

CAPABILITY_UNAVAILABLE: benötigte Host-/Runtimefähigkeit nicht qualifiziert.

SOURCE_INCOMPLETE: wesentlicher Kontext nicht belastbar verfügbar.

BUDGET_BLOCKED: Grant/Reservierung/Verbrauch unklar oder Grenze erreicht.

SCOPE_BUSY: exklusiver Writer-/Dateiscope bereits belegt.

DELIVERY_UNKNOWN oder EXECUTION_UNKNOWN: externe Annahme nicht eindeutig; zuerst abgleichen.

RECOVERY_BLOCKED: Scope wegen Wiederherstellung gesperrt.

UPSTREAM_UNAVAILABLE: Reader/Provider nicht erreichbar; reine Lesewiederholung nur gemäß Policy.

Diese Codes werden in verständliche deutsche UItexte übersetzt. Ein technischer Fehlertext wird nicht unkontrolliert mit Secrets oder internen Payloads ausgegeben.

## 11.15 Zustandstabelle für Requests

~~~text
draft -> stored -> needs_assignment | needs_clarification | ready
ready -> needs_revalidation | admitted
admitted -> dispatch_intent -> started | rejected | execution_unknown
started -> running -> awaiting_question | awaiting_approval | result_submitted
awaiting_question -> answer_stored -> running
awaiting_approval -> decision_stored -> running | cancelled
result_submitted -> under_review -> accepted | changes_required | rejected
running -> cancel_requested -> confirmed_stopped | execution_unknown
unknown -> reconciled existing state | still_unknown
~~~

Nur ausdrücklich zulässige Transitionen sind möglich. Ein terminaler alter Zustand wird durch ein verspätetes Event nicht unkontrolliert geöffnet. Changes_required erzeugt eine begrenzte Nacharbeitsrunde mit derselben Task-/Budgetgeschichte; neue fachliche Anforderungen brauchen eine nachvollziehbare Scopeentscheidung.

## 11.16 SQLentwurf für zentrale Invarianten

Der folgende Ausschnitt zeigt die geplante Bindung. Vollständige DDL und Treiberdetails werden im Storepaket mit ForeignKeys und Transaktionstests umgesetzt.

~~~sql
CREATE TABLE requests (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL,
 actor_id TEXT NOT NULL,
 task_id TEXT NOT NULL,
 idempotency_key TEXT NOT NULL,
 payload_hash TEXT NOT NULL,
 brief_id TEXT NOT NULL,
 revision INTEGER NOT NULL CHECK (revision > 0),
 status TEXT NOT NULL,
 UNIQUE (organization_id, actor_id, idempotency_key)
);
CREATE TABLE brief_snapshots (
 id TEXT PRIMARY KEY,
 organization_id TEXT NOT NULL,
 content_ref TEXT NOT NULL,
 content_hash TEXT NOT NULL,
 revision_set_json TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE TABLE dispatch_outbox (
 id TEXT PRIMARY KEY,
 request_id TEXT NOT NULL REFERENCES requests(id),
 attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
 admission_id TEXT NOT NULL,
 intent_sequence INTEGER NOT NULL,
 status TEXT NOT NULL,
 UNIQUE (request_id, attempt_number)
);
CREATE TABLE runtime_events (
 id TEXT PRIMARY KEY,
 adapter_id TEXT NOT NULL,
 remote_event_key TEXT NOT NULL,
 execution_id TEXT NOT NULL,
 event_type TEXT NOT NULL,
 receipt_ref TEXT,
 UNIQUE (adapter_id, remote_event_key)
);
~~~

Ein Update mit CAS prüft id plus erwartete revision und zulässigen Vorzustand. Genau eine betroffene Zeile bedeutet Erfolg. Null Zeilen erfordern lesenden Abgleich; der Service setzt nicht die aktuelle Revision blind neu ein.

## 11.17 Hash- und Provenienzregeln

Vorgeschlagener verbindlicher Hashvertrag: SHA-256 über UTF-8 der JCS-Kanonisierung nach RFC8785, Profilname fz-jcs-sha256-v1. Die Implementierung wird im Storepaket mit Konformitätsfixtures geprüft. Doppelte Propertynamen, ungültige Unicodewerte, NaN und Infinity werden abgewiesen. Strings werden nicht heimlich Unicode-normalisiert. Geld-/Revisionsinteger müssen sicher darstellbar sein; größere präzise Werte werden im Vertrag als Strings modelliert. Quelle: [JCS RFC8785](https://www.rfc-editor.org/info/rfc8785/).

Vertrauen kommt zusätzlich aus authentifiziertem Actor, tatsächlichem Adapter, Quelle und geschützter Ereignisgeschichte. Ein Modell kann einen Hash erfinden; deshalb zählt ein Hash im Freitext nicht ohne tatsächliches Artefakt/Receipt.

## 11.18 Kompatibilität und Portfreeze

Jedes Interface hat versionierte Eingabe-/Ausgabeverträge und Contracttests. Ein major-breaking Change braucht abgestimmten Portwechsel und UI-/Adapterkompatibilität. Neue optionale Datenfelder werden so ergänzt, dass alte Clients keine unzulässige Aktion aus einem unbekannten Zustand ableiten.

Portfreeze nennt exakte Typen, Fehlercodes, Rechte, Revisionen und Testfixtures. Ein Screenshot oder eine mündliche Zusage ist kein eingefrorener Port. Design erhält gegen diese Fixtures einen sicheren Scope und greift nicht direkt auf DB oder Credentials zu.



## 11.19 Index- und Invariantenmanifest

Folgende Constraints sind Bestandteil der vollständigen Migration und der Contracttests:

- TaskexternalKey ist je Organisation und kanonischem Register eindeutig.
- Requestidempotenz bindet Organisation, Actor und Key; Payloadhash bleibt unveränderlich.
- Message besitzt je Conversation/Actor eine eindeutige clientMessageId.
- BriefSnapshotinhalt und RevisionSet werden nach Erstellung nicht aktualisiert.
- Aggregierende GoalEdge ist je Child eindeutig; Typ/Parentrevision/Gewicht werden validiert.
- Zyklusprüfung und Edgeinsert laufen in derselben serialisierten Transaktion.
- AcceptanceEvent bindet Kriterium, Grundlage und Belegidentität eindeutig.
- Aktive Scopelease besitzt genau einen gültigen Owner/FenceToken je exklusivem Scope.
- DispatchOutbox bindet Request und Versuch; derselbe Versuch hat maximal einen externen Startintent.
- Runtimeevent ist je Adapter und Remoteeventkey eindeutig.
- Approvalauflösung besitzt genau eine gültige decisionId und unveränderten Aktionshash.
- Artefakthash, Größe und geschützter Objektschlüssel bleiben zum gespeicherten Inhalt konsistent.
- Budgetreserve ist je Aufgabe/Versuch/Aktionsprofil eindeutig; unknown wird nicht als Nullverbrauch aggregiert.
- AutomationRun ist je Definitionsversion/Triggerkey eindeutig.
- Projectioncheckpoint wächst nur nach erfolgreich verarbeiteter Eventsequenz.
- RecoveryEpoch blockiert jede neue relevante Mutation, solange completeRecovery nicht gültig angenommen ist.
- SourceObservation bleibt historisch unveränderlich; ein Refresh erstellt eine neue Beobachtung.
- Tombstone-/Widerrufsversion wird vor Retrieval, Export und Dispatch mitgeprüft.

Diese Regeln sind keine UIvalidierung allein. Die Datenbank erzwingt geeignete Eindeutigkeiten/Fremdschlüssel; der Domainservice erzwingt graph- und profilabhängige Regeln atomar. Die Tests führen jeweils zwei konkurrierende Mutationen beziehungsweise einen Crashpunkt aus, soweit die Invariante dadurch gefährdet werden kann.

## 11.20 Ergänzende interne Fachports

Proposed, noch nicht implementiert: RecordIngressMessage übernimmt bestätigten Kanal-/Accountscope und externe ID; LinkIngressToCase benötigt Case-/Message-Revision und ACLprüfung; CreateQualityBasis bindet vorhandene Format-/Fachquellen; AcceptQualityDecision, WithdrawQualityDecision und RevalidateQualityDecision vergleichen und ändern atomar dieselbe eligibilityRevision der vorhandenen Basis-/Scope-Aggregateversion, einschließlich aktueller blockierender Finding-, Retest- und Entscheidungsrevisionen. Ein bestätigter Befund entzieht auch bei unverändertem basisHash; historische PASSbelege lösen offene Sperren nicht auf. Wiederfreigabe benötigt aktuelle Auflösung und Retests. Die bestehende Aufgabenplattform ordnet aktuelle Gültigkeitsprüfung und tatsächlichen Start atomar gegen Entzug; Queue/Admission ist kein gestarteter Snapshot und wird bei Entzug revalidiert oder gesperrt. Bereits gestartete Snapshots bleiben unverändert und folgen der verantwortlichen Incidententscheidung. Firmenprojektionen folgen nur autoritativen Versionen (Band 17.10–17.11). PrepareCommunication erzeugt nur Entwurf; AdmitCommunicationSend prüft Empfänger/Fassung/Aktion und passende Berechtigung. Alle Ports verwenden ActorContext, Idempotenz, CAS, atomare Events und D1/D4. Die Namen sind GradeCrew-Planvorschläge, keine vorhandenen öffentlichen ChatGPT-/Mailprovider-APIs.
