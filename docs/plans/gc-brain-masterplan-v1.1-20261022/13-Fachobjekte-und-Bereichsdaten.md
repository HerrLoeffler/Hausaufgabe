# Band 13 - Fachobjekte und Bereichsdaten

## 13.1 Fachobjekte als typisierte Akten

Die allgemeine Task-/Wissensstruktur reicht für beliebige Notizen, aber nicht für verlässliche kaufmännische und fachliche Abläufe. Die folgenden typisierten Akten ergänzen den Firmenstore oder referenzieren vorhandene autorisierte Fachsysteme. Ein Fachsystem bleibt kanonisch, wenn es bereits Rechnungen, Verträge oder Kundenfälle verbindlich führt.

Alle Fachobjekte verwenden gemeinsame Identität, Organisation, Revision, Datenklasse, Owner, Quellen und History. Sie werden nicht ungeprüft aus einem Modelltext übernommen. Neue sensible Integrationen brauchen ihr konkretes Daten-/Rechteprofil. Ohne Fachsystemverbindung können berechtigte Menschen bestätigte Daten manuell als quellengebundene Akte pflegen.

## 13.2 Party und Contact

Party beschreibt Organisation oder Person mit eindeutiger Identität, bestätigtem Namen, Typ, Rolle im Geschäftsverhältnis und erlaubten Referenzen. Contact beschreibt einen Kontaktweg und die zulässige Nutzung. Öffentliche Firmendaten und vertrauliche personenbezogene Kontaktdaten haben unterschiedliche Klassifikation.

Felder: partyId, type, displayName, jurisdiction falls bekannt, relationshipType, responsibleActor, sourceRefs, verificationState. Contact zusätzlich channel, addressRef, purpose, permittedUse und lastConfirmedAt. E-Mailadresse wird nicht als universeller Primärschlüssel verwendet.

Beziehungen: Kunde, Anbieter, Vertragspartner oder zuständige Person. Ein potenzieller Lead wird nicht als bestehender Kunde geführt. Zusammenführen zweier Parties braucht nachvollziehbare Identitätsprüfung und Mergegeschichte.

## 13.3 CustomerOrganization und SchoolProfile

CustomerOrganization enthält zugeordnete Party, Produkte, bestätigten Status, zuständigen Kundenowner und relevante Vertragsreferenzen. SchoolProfile ergänzt nur benötigte organisatorische Angaben wie Schulart/Region und freigegebene Einrichtungsvoraussetzungen.

Felder: customerId, partyId, productScopes, relationshipStage, onboardingState, contractRefs, supportRefs und verifiedSourceAt. Rohdaten von Lernenden und Testantworten gehören nicht in dieses Organisationsprofil.

Status: prospect, onboarding, active, paused, ended oder unknown. Ein aktiver Account oder ein Supportkontakt beweist nicht automatisch einen zahlenden Vertrag. Fehlende Informationen bleiben unbestätigt.

## 13.4 SupportCase und IncidentLink

SupportCase erfasst fachliches Kundenproblem, erlaubten Kontaktbezug, gewünschte Antwort, betroffenen Produkt-/Umgebungsscope, führenden Owner und Kommunikationsstatus. IncidentLink verbindet den Fall mit vorhandenem BugOpsincident.

Ein Kundenfall kann mehrere technische Ereignisse betreffen, und ein Incident mehrere Kundenfälle. Die Firmenzentrale gruppiert über Referenzen. Sie kopiert keine unredigierten Diagnose-/Prüfungsdaten in allgemeine Akten.

Status: new, triage, waiting_customer, waiting_internal, diagnosis, solution_prepared, retest_required, resolved, closed. Resolved ist nicht dasselbe wie versandte Antwort oder bestätigte Kundenzufriedenheit. Jede Transition hat Grund und Beleg.

## 13.5 Lead, Opportunity und Offer

Lead speichert zulässigen Kontaktanlass und Zielsegment. Opportunity beschreibt bestätigten Bedarf, geplanten Umfang, zuständigen Owner und nächste Entscheidung. Offer ist eine konkrete versionierte Angebotsakte mit Freigabe-/Versandstatus.

Felder Opportunity: source, customerNeed, productScope, stage, valueEstimateState, currency, amountMinor sofern belastbar, nextAction, decisionOwner, evidenceRefs. Eine geschätzte Abschlusswahrscheinlichkeit wird nur als begründete Prognose gezeigt, nicht als bestätigter Umsatz.

Offer enthält version, items, pricingBasisRef, termsRef, validity, approver und communicationRef. Ein generierter Entwurf bleibt draft. Sent braucht tatsächlichen Versandbeleg; accepted braucht geeigneten Annahmenachweis. Finanz-/Rechtsrollen prüfen ihren tatsächlichen Scope.

## 13.6 CommunicationDraft und CommunicationReceipt

Draft enthält Empfängerreferenz, Zweck, Textfassung, Quellen, Schutzklasse, vorbereitende Rolle und notwendige Freigabe. Receipt hält den tatsächlichen Versandkanal, Empfängerbindung, Zeitpunkt, externe Nachrichten-ID und Ergebnis.

Freigabe wird an Empfänger, Fassung und Aktion gebunden. Eine Änderung am Angebot oder Empfänger nach Approval invalidiert die konkrete Versandfreigabe. Der technische Versandstatus sagt nichts über inhaltliche Annahme durch den Empfänger.

Automatischer Versand bleibt standardmäßig disabled, bis eine explizit autorisierte Prozessdefinition besteht. Interne Antwortvorbereitung und externe Kommunikation werden im UI deutlich unterschieden.

## 13.7 Contract und ContractRevision

Contract enthält stabile Vertragsidentität, Parteien, Typ, Gegenstand, zuständigen Owner und gültige Fassung. Revision enthält Dokumentreferenz, Status, relevante Daten, Prüfer und bestätigte Annahme-/Unterzeichnungsbelege.

Felder: contractId, parties, subject, documentRef, version, effectiveDate, endDate, renewalConditionRef, terminationConditionRef, signatureState, legalReviewState, privacyReviewRef, obligationRefs. Nicht zuverlässig extrahierte Daten bleiben candidate und erzeugen eine Prüffrage.

Status: draft, under_review, approved_for_use, sent, signed, active, ended, superseded oder disputed. Approved_for_use ist kein Unterzeichnungsbeleg. Ein ausgelaufener Entwurf wird nicht automatisch als wirksamer Vertrag geführt.

## 13.8 Obligation und Deadline

Eine Obligation beschreibt eine tatsächlich bestätigte Verpflichtung mit Quelle, zuständiger Partei, Inhalt, Fälligkeit, Owner und Nachweis der Erfüllung. Eine mögliche Pflicht aus einem ungeprüften Text ist zunächst ein Prüfhinweis.

Felder: obligationId, contractRef oder decisionRef, description, responsibleParty, dueDate, timezone, recurrenceRule sofern bestätigt, consequence, completionEvidence und status. Wiederkehrende Fristen werden anhand des konkreten Vertrags interpretiert, nicht frei als Kalenderintervall geschätzt.

Die Führung sieht offene, gefährdete und erfüllte Verpflichtungen. Eine Erinnerung erfüllt die Verpflichtung nicht. Eine Vertragsänderung revalidiert die betroffenen Fristen.

## 13.9 RightsAndLicense

Diese Akte hält Rechte an Marken, Bildern, Stimmen, Software, Lerninhalten und sonstigen Assets. Felder: assetRef, rightsHolder, source, licenseOrAgreementRef, permittedUses, territory/timeLimit soweit bekannt, attribution, restrictions und verificationState.

Ein lokal vorhandenes Bild oder eine Audiodatei ist kein Beleg für jede öffentliche Nutzung. Eine bestätigte Crewaufnahme für einen Zweck wird nicht automatisch für einen anderen Zweck umbenannt. Öffentliche Assetverwendung referenziert die tatsächlich passende Fassung.

Bei ungeklärter Rechtebasis wird die betreffende Veröffentlichung gesperrt oder ein geklärtes alternatives Asset vorgeschlagen. Andere Produktarbeit muss deshalb nicht pauschal stoppen.

## 13.10 ServiceProvider und ConnectionProfile

ServiceProvider hält bestätigten Anbieter, Dienst, Vertrags-/Datenflussbezug, Kostenakte und Betriebsowner. ConnectionProfile hält technische Bindung, erlaubte Scopes, Credentialreferenz außerhalb des Stores, Ablauf und Capabilitybelege.

Status getrennt: Vertrag geprüft, Datenzweck geprüft, technische Verbindung aktiv, konkrete Produktfähigkeit qualifiziert. Diese vier Werte werden nicht zu einem einzigen „verbunden“-Haken zusammengedrückt.

Eine Anbieteränderung verlinkt betroffene Contracts, DataFlows, Budgets, Automationen und offene Executions. Sie startet keine pauschale automatische Migration.

## 13.11 DataFlow und ControlCheck

DataFlow beschreibt Quelle, Datenkategorien, Zweck, Empfänger, Verarbeitungsschritte, Speicherorte, erlaubte Aufbewahrung und zuständige Rollen. Konkrete Rechts-/Vertragsbewertung gehört als bestätigte Referenz dazu, soweit für diesen Fall geklärt.

ControlCheck referenziert einen bestehenden SEC-/PRIV-Katalogpunkt und enthält scope, sourceSha, releaseRef, owner, status, evidenceRefs, limitations und nextStep. Neue Datenflüsse reaktivieren relevante Kontrollen.

Kein DataFlow speichert die übertragenen Geheimnisse selbst. Eine Architekturzeichnung ersetzt keinen Beleg der tatsächlichen Verbindung oder Löschung.

## 13.12 Subscription und Commitment

Subscription erfasst wiederkehrenden Dienstbezug und bestätigte Kostenbasis. Commitment erfasst genehmigte, noch nicht unbedingt abgerechnete Verpflichtung.

Felder: providerRef, contractRef, planName, billingInterval, amountMinor/currency oder unknown, taxTreatmentState soweit fachlich bestätigt, renewalDate, terminationRef, costCenter und owner. Tatsächlich variable Verbrauchskosten erhalten eigene Beobachtungen.

Die Führung sieht, welche Kosten sicher bekannt sind und welche Rechnung oder Konfiguration fehlt. Ein Trialende erzeugt eine Entscheidung, keine automatische Buchung oder Kündigung.

## 13.13 Invoice und PaymentObservation

Invoice beschreibt ein tatsächlich vorliegendes Rechnungsdokument mit Referenz, Aussteller, Empfänger, Rechnungsdatum, Fälligkeit, Betrag/Währung, Kostenstelle und Prüfstatus. OCR-/Modellextraktion bleibt bis Bestätigung candidate.

PaymentObservation referenziert einen bestätigten Zahlungsvorgang aus autorisierter Quelle. Die Firmenzentrale löst in V1 keine Zahlung aus. „Bezahlt“ braucht geeigneten Zahlungsbeleg; eine freigegebene Rechnung ist nicht automatisch bezahlt.

Korrektur, Storno und Erstattung werden als verknüpfte Vorgänge geführt. Alte Beträge werden nicht einfach überschrieben, wenn die Nachvollziehbarkeit betroffen ist.

## 13.14 Budget, Reservation und Forecast

Budget ist eine genehmigte Obergrenze für Scope und Zeitraum. Reservation bindet konservativen Spielraum für einen Versuch. Forecast ist eine begründete Prognose mit Annahmen. ActualCost ist ein bestätigter Istwert. Diese vier Objekte dürfen sich nicht gegenseitig vortäuschen.

Felder: scope, owner, currency/unit, approvedAmount, validPeriod, reservedAmount, knownActual, unknownExposure, policyVersion und sourceRefs. Unterschiedliche Währungen/Kontingente werden ohne bestätigte Umrechnung nicht addiert.

Die Finanzsicht kann Abweichung erklären, aber kein unbekanntes Providerergebnis durch einen neuen Budgetkey verschwinden lassen. Historische Guardiangrenzen bleiben beim jeweiligen Auftrag.

## 13.15 ProductCapability und DeliveryObservation

ProductCapability beschreibt eine konkrete Nutzerfähigkeit mit Kriterien, Produkt-/Plattformscope und Owner. DeliveryObservation beschreibt die für diese Fähigkeit tatsächlich belegte Lieferstufe.

Felder: capabilityId, userOutcome, platforms, acceptanceCriteria, dependencies, sourceRefs. Observation: codeSha, ciRuns, integrationSha, hostingReceipt, functionsReceipt, rulesReceipt, humanTest und productionReceipt jeweils soweit relevant.

Eine Capability kann teilweise geliefert sein. Die Führung zeigt konkrete fehlende Komponenten. Eine einzige globale Prozentzahl ersetzt diese Matrix nicht.

## 13.16 CurriculumReference und PedagogicalCoverage

CurriculumReference hält die tatsächlich verwendete Quelle mit Land/Bundesland, Schulart, Fach, Klassenstufe, Gültigkeit, Abrufstand und fachlichem Owner. PedagogicalCoverage bindet ein Produkt-/Inhaltselement an Kompetenz/Lernziel und konkrete Prüfkriterien.

Status einer Zelle: not_assessed, candidate, reviewed, accepted, outdated oder not_applicable. Leere Daten werden nicht als unterstützt dargestellt. Ein Quellenwechsel invalidiert abhängige fachliche Aussagen zur erneuten Prüfung.

Abdeckung wird nicht als Marketingversprechen aus der Anzahl generierter Aufgaben berechnet. Eine Inhaltsmenge kann groß sein und trotzdem fachliche Lücken haben.

## 13.17 ContentSpecification und QualityReview

ContentSpecification beschreibt Lernziel, Zielgruppe, Voraussetzungen, Aufgabenformat, Material, erlaubte Hilfen, erwartete Lösung und Bewertungsrahmen. Sensible Lösungsschlüssel bleiben im bestehenden geschützten Produktbackend.

QualityReview beurteilt Richtigkeit, Eindeutigkeit, Lernzielpassung, Schwierigkeit, sprachliche Eignung und Zugänglichkeit. Es hält Prüfer, Inhaltshash, Quelle, Urteil und konkrete Befunde.

Ein gutes Modellurteil ist ein Teilbeleg, keine automatische Unterrichtsfreigabe. Eine Änderung am Lösungsschlüssel oder Lernziel erfordert passende neue Fachprüfung.

## 13.18 MetricDefinition und MetricObservation

MetricDefinition hält Zweck, Definition, Einheit, Nenner, Datenquelle, Zeitraum, Segment, erlaubte Nutzung und bekannte Verzerrungen. Observation hält tatsächlichen Wert oder unknown mit Sourceversion und Abdeckung.

Analyse zeigt beispielsweise Nutzung eines freigegebenen Features nur aus dem bestätigten Analyticsvertrag. Fehlende oder nicht optierte Daten werden nicht als Nullnutzung interpretiert. Ein Trend braucht vergleichbare Erfassungsbedingungen.

Ein KPI kann eine Untersuchung auslösen. Er ist kein Auftrag zur Datenvermehrung, Nutzerprofilbildung oder Produktänderung ohne entsprechenden Zweck und Beschluss.

## 13.19 OrganizationRole und CapacityPlan

OrganizationRole hält Auftrag, zuständige Person, Stellvertretung, Entscheidungsrechte und benötigte Zugriffe. CapacityPlan hält bestätigte verfügbare Kapazität, laufende Verpflichtungen, Einschränkungen und Zeitraum.

KIparallelität und menschliche Kapazität werden getrennt betrachtet. Ein neuer Chat erhöht nicht automatisch die fachliche Review- oder Entscheidungskapazität. Unbekannte Verfügbarkeit wird als Planannahme markiert.

Personal-/Mitarbeiterdaten erhalten beschränkten Scope. Ein Rollenregister ersetzt keine arbeitsrechtliche oder organisatorische Zuständigkeitsklärung.

## 13.20 Domainprofile und Erweiterung

Jedes neue Fachobjekt folgt demselben Muster: bestätigter Zweck, kanonischer Ort, Mindestfelder, Schutzklasse, Owner, Statusmaschine, Quellen, Validierung, Rechte und Abnahmefälle. Eine zusätzliche Maske allein reicht nicht.

V1 kann diese Akten zunächst manuell/quellengebunden führen. Externe Reader und Schreibaktionen werden einzeln angebunden. So kann Martin die ganze Firma strukturiert steuern, während Integrationen nach tatsächlichem Nutzen, Datenzugriff und Betriebsfreigabe wachsen.

## 13.21 Aufgabenqualität und zentraler Eingang

Die konkreten Erweiterungen TaskFormatProfile, ItemReference, QualificationBasis, QualityFinding und QualityDecision sind in Band 17.10 definiert. IngressMessage, CaseRecord und RoutingSuggestion in Band 18.4 ergänzen die vorhandenen SupportCase-/Communicationobjekte. CaseRecord ist die gemeinsame Arbeitsakte, kein Ersatz für die einzelnen Fachverträge. Beide Module behalten Originalquellen und betreiben keine zusätzliche Bewertungs-, Schul-, Incident- oder Release-Datenbank.
