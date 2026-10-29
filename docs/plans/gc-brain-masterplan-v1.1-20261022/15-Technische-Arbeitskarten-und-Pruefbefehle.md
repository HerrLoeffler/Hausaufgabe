# Band 15 - Technische Arbeitskarten und Prüfbefehle

## 15.1 Ausführungsregeln für diese Karten

Dies ist der schrittweise Implementationsteil zum Architektur-/Betriebsentwurf. Für die spätere autorisierte Ausführung wird executing-plans verwendet; eine Subagentenausführung nur nach entsprechender Nutzer-/Projektzuweisung. Die Karten sind geplante Arbeit. Keine hier genannten zukünftigen Produktdateien oder Tests wurden durch das Schreiben dieses Dokuments angelegt oder ausgeführt.

Goal: den echten V1-Arbeitskreislauf mit Zielnetz, Firmenwissen, Fachdispatch und sicherer Wiederaufnahme implementieren.

Architecture: bestehende Controlbasis mit einem transaktionalen Firmenservice, klaren Domainmodulen, qualifiziertem Hostadapter und zwei dünnen UIeinstiegen. Der Store/API/Migrationsscope besitzt einen bestätigten Writer.

Tech Stack: vorhandener Node-/ES-Modulbestand, Node-Testläufer und MCPApps; vorgeschlagene SQLite-Persistenz und reproduzierbarer UIbuild nach WP06/15-Qualifikation. Konkrete Versionen werden im jeweiligen Lock-/Runtime-/Migrationsmanifest fixiert.

Spec: Band00-08 und11-13; Paketfolge Band09; Abnahmekatalog Band10. Globale Grenzen: Production ausgenommen; P0 vor P1/P2; bestehende Task-/Budget-/Versuchshistorie; D1-D4; keine neue Chatfamilie; keine privaten Credentialkopien; keine UIrechte aus Freitext.

Review Focus: Ziel-/Konzeptänderung bei gleicher Taskrevision; ACLentzug vor Weitergabe; unbekannter Start-ACK; Restore nach bereits abgeschlossenem Start; untrusted Quelltext/Artefaktpfad. Diese Fälle werden in den Karten12,19 unddenzugehörigen Band10-Fällen ausdrücklich geprüft.

Alle Pfade beginnen unter der bestätigten prototypes/gradecrew-control-local-Basis. Wenn ein gleichwertiges vorhandenes Modul gefunden wird, wird es nach dokumentiertem Abgleich verwendet und der Pfad in der Karte aktualisiert. Eine Pfadentscheidung darf keine zweite Implementierung derselben Funktion erzeugen.

## 15.2 Karte WP06 - Storetransaktion und Migration

Dateien: src/store/database.mjs; src/store/migrations/0001-core.sql; src/store/repositories.mjs; test/store-atomicity.test.mjs; test/legacy-import.test.mjs.

Interface: transaction(actorContext, operation) liefert Promise<Result>; operation verwendet ausschließlich den lokalen Transaktionskontext und keine externen Calls. Repositories erzwingen organizationId und expectedRevision.

- [ ] Test atomic_submit_rolls_back_all_rows definiert Message/Request/Brief/Outbox und provoziert einen Fehler beim letzten Write. Erwartung: null neue fachliche Zeilen nach Rollback.
- [ ] Test idempotency_payload_conflict prüft gleicherKey/gleichePayload und gleicherKey/anderePayload. Vor Implementation muss die Verhaltensprüfung fehlschlagen.
- [ ] Datenbankadapter und Migration mit ForeignKeys, Eindeutigkeiten und versioniertem Migrationsmanifest implementieren. Driver/runtime in diesem Paket prüfen und pinnen.
- [ ] Run: node --test test/store-atomicity.test.mjs test/legacy-import.test.mjs. Erwartung nach Umsetzung: alle Fälle PASS; Import zweimal erzeugt keine neue Identität; beschädigte Quelle bleibt unverändert.
- [ ] Paketcommit plus Schema-/Import-/Rollbackbeleg und verbleibende Grenzen sichern. Kein zweiter aktiver Produktwriter.

## 15.3 Karte WP07 - Fortschritt

Dateien: src/goals/progress.mjs; src/goals/graph.mjs; test/goal-progress.test.mjs; test/goal-graph.test.mjs.

Interface: calculateProgress(goalRevision, basis) liefert derivedRatio|null, displayPercent|null, achieved, basisVersion, sourceRevisions und missingReasons. addGoalEdge(tx, edge, expectedParentRevision) prüft Kante und Zyklus atomar.

- [ ] Tests equal_children_50_0_is_25, empty_basis_is_null, mandatory_gate_caps_display und evidence_retraction_invalidates_parent definieren.
- [ ] Graphfälle second_aggregating_parent_rejected, cycle_rejected und duplicate_evidence_not_counted hinzufügen. Erst passenden Verhaltensfehler bestätigen.
- [ ] D2algorithmus und Graphinvarianten implementieren. Gewichte positiv/endlich, Modus eindeutig; Rundung nur bei Anzeige.
- [ ] Run: node --test test/goal-progress.test.mjs test/goal-graph.test.mjs. Erwartung: PASS mit exakten 25/50/0/null/99-Grenzen.
- [ ] Ein echtes repräsentatives Ziel aus bestätigten Quellen abbilden, Rechnung reproduzierbar exportieren und Paketcommit sichern.

## 15.4 Karte WP09 - Arbeitsbrief

Dateien: src/knowledge/briefs.mjs; src/knowledge/retrieval.mjs; src/knowledge/context-policy.mjs; test/brief-binding.test.mjs; test/context-access.test.mjs.

Interface: buildWorkBrief(actorContext, taskRef, sourceRevisionSet) liefert unveränderlichen Inhalt, berechtigte sourceRefs, coverage und fz-jcs-sha256-v1-Hash. persistBrief(tx, resolvedBrief) speichert den Snapshot ohne spätere Inhaltsupdates.

- [ ] Fixtures gültige/ersetzte/abgelehnte Konzepte, vertrauliche Finanzquelle und widersprüchlichen alten Chatstand anlegen.
- [ ] Tests current_decision_loaded, superseded_excluded, finance_not_in_games und inaccessible_source_is_gap definieren; vor Implementation gezielten Fehler bestätigen.
- [ ] Retrieval vor Modellweitergabe autorisieren; konkrete Auftrags-/Kriterien-/Entscheidungsbasis auflösen; Quellenlücken und Revisionen speichern.
- [ ] Run: node --test test/brief-binding.test.mjs test/context-access.test.mjs. Erwartung: PASS; keine sensible Payload in fremdem Brief oder Fehlertext.
- [ ] Briefbeispiel mit Hash/Quellmanifest und Paketcommit sichern. Keine echte private Quelle als Testfixture committen.

## 15.5 Karte WP10 - Request annehmen

Dateien: src/requests/submit.mjs; src/requests/outbox.mjs; src/requests/conversations.mjs; test/request-submit.test.mjs; test/request-reload.test.mjs.

Interface: submitRequest(actorContext, SubmitRequestInput) liefert ResultEnvelope<StoredRequest>; readRequest(actorContext, requestId) liefert denselben autoritativen Zustand.

- [ ] Tests double_click_one_request, second_tab_same_id, changed_payload_conflict, failed_last_write_no_half_request und foreign_actor_denied definieren.
- [ ] Client-/Servergrenzen aus Band11 als Fixtures fixieren; leeren Text, unbekanntes Intent, Übergröße und falsche Revision prüfen.
- [ ] Submittransaktion auf Store und Briefbuilder aufbauen; status=stored, niemals running allein durch Speicherung.
- [ ] Run: node --test test/request-submit.test.mjs test/request-reload.test.mjs. Erwartung: PASS auch nach echtem Serviceneustart im isolierten Testroot.
- [ ] Paketcommit, Contractversion und Portfreeze für lesende UIansichten sichern.

## 15.6 Karte WP11 - Zentrale und Routing

Dateien: src/routing/registry.mjs; src/routing/claims.mjs; src/routing/route-request.mjs; test/routing.test.mjs; test/coordinator-epoch.test.mjs.

Interface: claimCoordination(actorContext, requestId, expectedRevision, epoch); resolveRoute(actorContext, task, intent) liefert bestätigte Bindung oder needs_assignment.

- [ ] Fünf bestehende Zentralenbindungen als datierte Konfigurationsfixtures, nicht als ewig gültige Onlineannahme, anlegen.
- [ ] Tests two_claims_one_owner, expired_route_blocked, wrong_host_rejected, busy_scope_waits und games_hierarchy_preserves_task definieren.
- [ ] Rollen-/Host-/Capability-/Writerprüfung und atomaren Claim implementieren. Ein ähnlicher Titel oder Fork genügt nicht.
- [ ] Run: node --test test/routing.test.mjs test/coordinator-epoch.test.mjs. Erwartung: PASS; alter Epoch kann keine neue Koordinationsmutation schreiben.
- [ ] Einen erlaubten echten P0-Weiterleitungsbeleg referenzieren; Ergebnis und Paketcommit sichern. Fehlende Nichtzentralenweiterleitung bleibt Produktblocker.

## 15.7 Karte WP12 - Dispatch und unknown

Dateien: src/executions/admission.mjs; src/executions/dispatcher.mjs; src/executions/adapters/qualified-host.mjs; test/dispatch-revisions.test.mjs; test/dispatch-unknown.test.mjs.

Interface: admitDispatch(actorContext, requestId, expectedRevisionSet) liefert AdmissionReceipt; dispatch(admissionId) liefert StartReceipt, rejected oder unknown. reconcileExecution liest nur bestehenden Vorgang.

- [ ] Tests goal_changed_same_task_revision, concept_changed_same_task_revision und acl_revoked_before_disclosure definieren.
- [ ] Crashpunkte before_intent, after_intent_before_ack und after_remote_accept_before_local_receipt anlegen. Erwartung bei möglichem Start: unknown und kein automatischer neuer Aufruf.
- [ ] D1prüfung, dauerhaften Intent, Reserve und qualifizierten Adapter implementieren. Externe Calls außerhalb DBtransaktion; keine unsichere Wiederholung.
- [ ] Run: node --test test/dispatch-revisions.test.mjs test/dispatch-unknown.test.mjs. Zusätzlich tatsächlichen P0-Startbeleg gegen denselben Adapter/Hoststand referenzieren.
- [ ] Request-/Remote-/Budgetidentitäten und Paketcommit sichern. Unitmocks ersetzen keine reale Hostqualifikation.

## 15.8 Karte WP13 - Rückfrage und Approval

Dateien: src/executions/pending-requests.mjs; src/executions/approvals.mjs; test/approval-binding.test.mjs; test/pending-reattach.test.mjs.

Interface: resolveApproval(actorContext, approvalId, decision, expectedRevision, decisionId); answerQuestion(actorContext, pendingQuestionId, answer, responseId).

- [ ] Tests foreign_execution, changed_action_hash, expired_approval und duplicate_resolution definieren.
- [ ] PendingRequest-Neustartfall mit tatsächlicher im P0 qualifizierter Semantik festlegen. Falls Host keine Wiederaufnahme unterstützt, kein falsches Mockpass als Produktbeleg.
- [ ] Atomare lokale Entscheidung und getrennte tatsächliche Remoteübermittlung implementieren. answer_stored_not_delivered bleibt sichtbar.
- [ ] Run: node --test test/approval-binding.test.mjs test/pending-reattach.test.mjs. Erwartung: passende Contractfälle PASS; reale Wiederaufnahme mit eigenen Remote-IDs belegt.
- [ ] Paketcommit und echte Fortsetzungs-/Abbruchgrenzen dokumentieren.

## 15.9 Karte WP14 - Ergebnisannahme

Dateien: src/evidence/artifacts.mjs; src/evidence/reviews.mjs; src/evidence/acceptance.mjs; test/result-acceptance.test.mjs; test/artifact-boundaries.test.mjs.

Interface: submitResult(actorContext, executionId, result); acceptResult(actorContext, executionId, artifactHash, expectedGoalRevision, expectedCriterionRevision, decisionId).

- [ ] Tests r1_result_does_not_progress_r2, wrong_hash_rejected und reviewer_candidate_changed definieren.
- [ ] Artefaktfälle path_escape, symlink, oversized_file und unauthorized_download prüfen; tatsächliche Dateien im isolierten Testroot verwenden.
- [ ] Artefaktbindung, unabhängigen Reviewauftrag und Annahme-CAS implementieren. Nur angenommene Kriterien erzeugen Zielbeitrag.
- [ ] Run: node --test test/result-acceptance.test.mjs test/artifact-boundaries.test.mjs. Erwartung: PASS; neue Zielbasis erhält keinen ungeprüften alten Fortschritt.
- [ ] Kandidaten-/Review-/Beleghashes und Paketcommit sichern. Nacharbeit gegen bestehende Versuchshistorie führen.

## 15.10 Karte WP15/16 - UIlieferung und Produktfluss

Dateien: src/ui/standalone.mjs; src/ui/mcp-app.mjs; src/ui/components; src/ui/views; plugin/mcp.mjs-Ressourcenanbindung; test/ui-contracts.test.mjs; buildmanifest.

Interface: CaseViewModel, GoalViewModel, DecisionViewModel und UpdateEnvelope aus eingefrorenen Serviceports. UI verändert Geschäftsstatus nur über autorisierte Mutationen.

- [ ] Fixtures für stored, delivery_unknown, running, pending_question, result_submitted, accepted und recovery_blocked fixieren.
- [ ] Beide UIs aus derselben fachlichen ViewModelquelle bauen und ausgelieferte Bundle-/Manifesthashes prüfen.
- [ ] Screens S01-S12 und im jeweiligen Erweiterungsumfang S13-S15 an reale Read-/Mutationsports anschließen; kein direkter DBzugriff, kein Geheimnis und keine Aktivierung beim Laden.
- [ ] Run: node --test test/ui-contracts.test.mjs. Danach tatsächliche Desktop-/iPad-/Mobil-/Tastatur- und Hostproben mit gleichen Task-/Request-IDs durchführen.
- [ ] Martins verbundenen Produktdurchlauf als eigenes Urteil erfassen, UIkandidat sichern und Grenzen nennen.

## 15.11 Karte WP19 - älteres Backup

Dateien: src/recovery/epoch.mjs; src/recovery/reconcile.mjs; src/recovery/backup.mjs; test/restore-after-completed-start.test.mjs; test/restore-journal-completeness.test.mjs.

Interface: beginRestore(actorContext, scope, backupRef); reconcileRecovery(epochId, evidence); completeRecovery(actorContext, epochId, verifiedScope, decisionId).

- [ ] Ausgangssnapshot queued/attempt0 erzeugen; danach externen Abschluss, Verbrauch, Approvalauflösung, Widerruf und Löschung als tatsächliche unabhängige Testquelle festhalten.
- [ ] Altes Backup restaurieren. Test erwartet bis vollständigem Abgleich Dispatch-/Approval-/Anzeigegrenzen und erhaltene konservative Reserve.
- [ ] Fälle mit lückenhaftem Journal, zusammen restauriertem Journal und Intent ohne ACK hinzufügen; alle bleiben bei fehlender Vollständigkeit gesperrt.
- [ ] Run: node --test test/restore-after-completed-start.test.mjs test/restore-journal-completeness.test.mjs. Erwartung: PASS nur bei nachgewiesener unabhängiger Kette oder belegter vollständiger manueller Reconciliation.
- [ ] Eigenen Restorebeleg, freigegebenen Scope, unabhängiges Review und Paketcommit sichern. Kein Restore auf Schul-Live.

## 15.12 Übergabe nach jeder Arbeitskarte

Die Übergabe benennt tatsächliche Dateien, Interfaces, Kandidat, ausgeführte Befehle, Ergebnis, Review-/Releasegrenzen, laufende/unklare Vorgänge und genau den nächsten erlaubten Schritt. Die oben stehenden Sollbefehle werden erst dann in „ausgeführt“ umgewandelt, wenn ihr Output tatsächlich vorliegt.

Eine Karte ist nicht erledigt, weil ihr Text geschrieben wurde. Der zuständige Implementierer muss ihr beobachtbares Ergebnis liefern. Unabhängige Review und menschliche Abnahme bleiben dort erhalten, wo der Plan sie verlangt.

## 15.13 Arbeitskarte Aufgabenqualität

WP23/24 konkretisieren: Original-IDs und Owner lesen; Prüfbasis einfrieren; Q1-Q7 fachlich festlegen; Annahme per CAS und Abhängigkeitsinvalidierung prüfen. Einen Rot-zu-Grün-Fall mit echter Regression und unabhängigem Urteil durchführen. Bestand, laufende Snapshots und Lieferstufen erhalten. AT49-60/71 samt tatsächlichen Grenzen in der bestehenden Übergabe sichern. Vollständige Schritte und Zustände: Band 17.

## 15.14 Arbeitskarte Eingang und Kommunikation

WP25/26 konkretisieren: internen synthetischen Eingang vor externem Kanal liefern. Kontoscope/Rechte bestätigen; atomaren Import, Deduplikation, Zuordnung und ACLgrenzen prüfen. Entwurf, Versand und Zustellung unterscheiden; verlorenen ACK sowie Restore ohne Doppelmail nachweisen. AT61-70/72 im wirklichen Kanalumfang ausführen. Fehlende Providerfähigkeiten offen lassen. Vollständiger Ablauf: Band 18.
