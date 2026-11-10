# GradeCrew Web-Sandbox Implementation Plan — kleiner Durchstich

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task within the existing authorization. Steps use checkbox (`- [ ]`) syntax for tracking. Derselbe Fachchat führt aus; keine Unteragenten, kein neuer Chat. Dieses Dokument erteilt keine Echtgeld-, Konto-, Key-, Vertrags- oder Productionfreigabe.

> **Aktuelle Produktvorgabe vom 10.11.2026.** Der [Konto- und Zugangsplan](../../billing/2026-11-10-konto-und-zugangsplan.md) ersetzt in diesem älteren Plan den Vorschlag von drei durch fünf Startereinheiten und den Nur-Lesen-Zustand für bestehende Free-Tests durch Bearbeitungszugriff. A1 erwartet einmalig fünf statt zehn Einheiten. A2 erwartet nach einer erfolgreichen neuen Speicherung vier verbleibende Einheiten. Löschen ändert den Verbrauch nicht. Die UI-Abnahme mit höchstens einem synthetischen Test und die 72-Stunden-Testnachfrist gelten fort. Schulzahlung und Adminzugang werden in separaten Paketen des neuen Plans abgenommen.

**Goal:** Im vorhandenen GradeCrew-Web einen persönlichen Testzugang von Anmeldung über echte Stripe-Testzahlung bis zu Ablauf und Nur-Lesen nachweisen; zuerst einen prüfbaren kleinen Plan und eine ehrlich ausgewiesene Testseitenvorbereitung liefern.

**Architecture:** Aktueller ausgelieferter Webrahmen, Firebase Auth und bestehender Editor bleiben die Oberfläche. Ein separater Billing-Sandbox-Codebereich verarbeitet ausschließlich Stripe-Testobjekte und schreibt serverseitig Berechtigungen und Kontingente. Ein eigener Hosting-Vorschaukanal nutzt ausschließlich das Testprojekt; dessen gemeinsam genutzte Dienste benötigen zusätzlich echte Zugriffsgrenzen.

**Tech Stack:** vorhandenes Vanilla-JavaScript-Web, Firebase Auth/Firestore, Node22/CommonJS Functions; Stripe Hosted Checkout, Billing Portal und signierte Webhooks ausschließlich im Testmodus. SDK-Version bei Umsetzung anhand offizieller Dokumentation prüfen und fest pinnen, heute nichts installiert.

**Spec:** Folgeauftrag 08.11.2026 in [Handoff](../../../workstreams/billing-research-20261104.md), [maschinenlesbarer Previewvertrag](../../billing/sandbox-v1/preview-contract.json), [belegte Webbaseline](../../billing/2026-11-08-web-baseline.json). Die [Recherche vom 04.11.](../../billing/2026-11-04-entscheidungsbericht.md) bleibt Hintergrund. Deren [39–66-PT-Gesamtplan](2026-11-04-billing.md) ist **keine Voraussetzung für Stage A**.

## Global Constraints

- Task `GC-BILLING-PLAN-01`, Branch `docs/billing-research-20261104`, bestehender Draft-PR411; Integration durch bisherigen Owner. Vor Ausführung main/START_HERE und Übergabe frisch lesen.
- Ausschließlich `gradecrew-staging-2026`; niemals `hausaufgabe-staging`, `gradecrew.de` oder Legacy `hausaufgabe-40294`. Kanonisches Staginghosting nicht überschreiben.
- Keine neuen Providerkonten, Schlüssel, Verträge, echten Zahlungen oder kostenpflichtigen KI-Aufrufe. Bestehende Zugänge zuerst durch deren Betreiber prüfen; keine Schlüsselwerte im Chat oder Repo.
- Nur neu angelegte, ausdrücklich benannte Testpersonen und synthetische Inhalte. Bestehende Browsersitzung ist kein Testkonto. Keine Schüler-/Lehrkraftdaten aus Live übernehmen.
- Höchstens **ein** synthetischer Test wird bei dieser UI-Abnahme erzeugt, deutlich „Beispieltest — ohne KI erzeugt“. Weitere Zustände ausschließlich in lokalen Tests oder getrennten Emulator-Fixtures, niemals als Stripebeleg ausgeben.
- Fehlgeschlagene Erzeugung verbraucht kein Kundenguthaben; Zahlungszustand sperrt/löscht nie das Authkonto. Bereits gestarteter Unterricht einschließlich verspäteter Abgabe bleibt abschließbar.
- Kein Jahresabo, Schul-/Sitzmodell, B2G, SEPA, Apple/IAP, Gutscheinsystem, Appumbau oder eigenständiger Shop in Stage A.
- Konfiguration ohne nachgewiesenen Testprovider bleibt gesperrt: kein Fake-Checkout, kein clientseitiges „bezahlt“, kein Ersatz durch Livezugang.

## Review Focus

1. Zwei Tabs mit letztem Guthaben: genau eine Reservierung; Doppelclick/Retry erzeugt weder doppelten Test noch doppelte Checkoutsession (A2/A3, Q07/Q09).
2. Erfolgsrücksprung ohne Webhook oder mit anderem angemeldeten Konto: keine Freischaltung aus URLparametern, fremde Rechnung bleibt verborgen (A3/A5, Q10/Q19/Q20).
3. Falsches Projekt, Live-Stripeobjekt oder nicht geprüfter KI-Pfad: Abbruch vor schreibendem/kostenpflichtigem Provideraufruf (A0, Q01–Q03).
4. Ablauf während Unterricht/Offlineabgabe: bestehende Runde kann beendet werden, neue kostenpflichtige Aktion bleibt gesperrt (A4, Q17/Q18).
5. Firebase-Vorschau teilt Backend mit Stage: anderer Stagebenutzer darf keine Sandboxdaten lesen; Sandboxakteur darf keine bestehenden KI-Endpunkte nutzen (A0/A2, Q03/Q04).

## 1. Stand, der diesem Plan zugrunde liegt

**Am 08.11. tatsächlich geprüft:** main `020f6f3e21bcfff738d572ab7f00019f3dc6f9e3`; öffentlich ausgelieferte Dateien vollständig gegen beide vor/nach Abruf stabilen Manifeste geprüft: Live **215/215**, Stage **230/230**. Livequelle `80c845796fcb1efc324b1a266944a13bb06d7334`, Stagequelle `5be513d6f8cc90520efb63ee3c0d4e878e84df2d`. Nur153 Dateien identisch;39 gemeinsame Pfade abweichend,23 nurLive/38 nurStage. Deshalb aktuelle Livekomposition als UI-Quelle, ausschließlich Stagekonfiguration als Ziel. Manifestbelege beweisen keine Functions-/Rulesbereitstellung.

Der aktuelle Livecode hat direkte Registrierung über Firebase; `sendEmailVerification`/`emailVerified` sind in dieser Registrierung nicht enthalten. Der vorbereitete OTP-/Resendzweig PR303 ist getrennt und laut Übergabe ohne eingerichteten Maildienst. Kein pauschaler Merge dieses Zweigs. Vorhandene Homepage und Dashboard nur lesend betrachtet; erkannte bestehende Livesitzung weder als Testkonto benutzt noch exportiert.

**Zugriffsstand:** Kein verfügbarer Stripeconnector, keine Stripe/Billing-Umgebungsvariablennamen und keine Stripeintegration im untersuchten Produktbestand. Das beweist **nicht**, dass kein Stripekonto oder Cloudsecret existiert. Tatsächliches Stripe-/Secret-Manager-/Cloud-IAM-Inventar und deployfähige Anmeldung sind hier **nicht verifiziert**. Bis A0 besteht, bleiben `checkoutEnabled=false`, `previewUrl=null`. Heute geändert: ausschließlich Dokumentation und Previewvertrag, kein Produktcode, kein Deployment, keine Providerobjekte.

## 2. Enger Ablauf auf der vorhandenen Oberfläche

| Schritt | Vorhandener Ort / kleine Ergänzung | Sichtbares Ergebnis und Nachweis |
|---|---|---|
| Einstieg | Homepage → „Konto erstellen“ → `/workspace.html?intent=register`; vorhandenes `#registerForm` | Dauerhaftes Banner „Testumgebung · keine echten Zahlungen“. Nur neues eingeladenes Testkonto; keinerlei Livesitzungsübernahme. |
| E-Mail | Registrierung/Anmeldung | Falls bestehende Firebase-Testkonfiguration echten Bestätigungsversand erlaubt: Nachricht empfangen, Link öffnen, User/IDtoken erneuern und serverseitig `email_verified` prüfen. Sonst ausdrücklich „E-Mail-Bestätigung nicht eingerichtet“; kein künstlich verifiziertes Konto und kein grüner E-Mail-Abnahmehaken. |
| Starter | `#dashboardView` neben vorhandenem Untertitel | „3 kostenlose Beispieltests“ als **Sandboxvorschlag**; kein Verkaufsversprechen. Server liefert Restwert und Quelle. Einmalige Vergabe pro UID nach A1-Zulassung. |
| Erstellung | `#newQuizBtn`, vorhandener manueller Editor / `#aiView` mit einem klaren Beispiel-Einstieg | Ein deterministischer Beispieldatensatz, keine KI. Alle anderen kostenpflichtigen Crew-/Audio-/Bildpfade in UI und Backend gesperrt. Normaler Editor bleibt bedienbar. |
| Tarif/Testcheckout | `#settingsTopBtn` → bestehendes `#settingsView`, neue Karte „Zugang & Abrechnung“ | Ein persönlicher Monats-Testtarif,1,00EUR Testbetrag,12 Beispieltests/Periode; beide Zahlen nur Testparameter. Weiterleitung zu Stripe Hosted Checkout, niemals eigener Karteneingabe. |
| Rückkehr | Zurück in dasselbe Dashboard/Settings | „Zahlung wird geprüft“, bis Serverstatus aktiv. Schließen/Neuladen/Kontowechsel macht den Kauf nicht verloren. |
| Nutzung | „Meine Tests“, bestehende `#quizList` | Derselbe gespeicherte Beispieltest ist sichtbar und im bisherigen Editor lesbar/bearbeitbar, solange erlaubt. Kein separates Shopdashboard. |
| Verwaltung | Dieselbe Abrechnungskarte | Stripe-Testrechnung anzeigen, Testabo im Stripeportal zum Periodenende kündigen; nach Rückkehr serverseitig aktuellen Zustand neu laden. |
| Ende | Dashboard/Abrechnung + bestehender Unterricht | Testuhr: Periodenende → Zahlung ausstehend/Nachfrist → Nur-Lesen. Bestehender Unterricht endet regulär; Anmeldung, Lesen und erlaubter Export bleiben möglich. |

**E-Mail-Abzweig:** A0 dokumentiert die vorhandene Versandfähigkeit. Gibt es sie, ist echte Bestätigung Pflicht der A1-Abnahme. Gibt es sie nicht, dürfen Plan/UIzustand vorbereitet werden; der vollständige registrierungsbasierte Durchstich bleibt als Teilnachweis offen. Kein neuer Resendvertrag und kein Umschiffen der Prüfung durch ein Adminflag. Firebase unterstützt einen Standard-Bestätigungslink; dessen tatsächliche Zustellung muss separat belegt werden. [Firebase Auth](https://firebase.google.com/docs/auth/web/manage-users#send_a_user_a_verification_email)

## 3. Feste technische Entscheidungen für Stage A

### Dateikarte — geplant, noch nicht implementiert

Die folgenden Produktpfade beziehen sich auf den Webquellbaum der belegten Livekomposition, **nicht** auf den reinen main-Dokumentationsbaum. Vor Änderung isolierten Ausführungsbranch aus genau diesem Webstand aufbauen und aktuelle main-Regeln übernehmen; kein pauschaler Merge aller Web-/Stagebranches.

| Datei | Aufgabe |
|---|---|
| `tools/build-billing-sandbox.mjs`, `firebase.billing-sandbox.json` | vorhandenen Builder kontrolliert verwenden; eigenes Ausgabeziel, feste Projekt-/Originprüfung, ausschließlich Vorschaukanal `billing-plan-01` |
| `tools/build-staging.mjs`, `tools/environments.mjs` | bestehende Inputs/Dateiliste lesen; kleine notwendige Erweiterung für neue Sandboxassets, keine Defaultumstellung |
| `index.html`, `app.js`, `billing-sandbox-ui.mjs`, `billing-sandbox.css` | bestehende Workspace-Quelle/Views anbinden; ausgeliefertes `workspace.html` ist Buildoutput und wird nicht blind als Quellindex zurückkopiert |
| `billing-sandbox-client.mjs`, `billing-sandbox-data.mjs` | Authgebundene Backendaufrufe; normaler Editor liest/speichert ausschließlich in Sandboxnamespace |
| `secure-assessment-client.js`, `secure-student.js` | vorhandene Lehrer-/Schüleransichten für synthetische Runde über Sandboxtransport anbinden; kein neues Unterrichts-UI und keine Live-Schülerendpunkte |
| `functions-billing-sandbox/package.json`, `main.js` | neuer Codebereich `billing-sandbox`, nur neue `billingSandbox*`-Funktionen, keine OpenAIabhängigkeit oder KIsecrets |
| `functions-billing-sandbox/lib/{guard,quota,provider,lifecycle,data}.js` | Zulassung/Projektgrenzen, Reservierungen, Stripeadapter, Zustandsprojektion, Test-/Rundendaten |
| `functions/lib/access.js` + belegte Aufrufer | vorhandenen gemeinsamen KI-Zugang prüfen; Sandboxclaim vor Kostenaufruf ablehnen. Direkte Crew-/Audio-/Bildpfade ohne diesen Guard zusätzlich schließen; Zielnamen erst aus aktuellem Exportinventar ableiten und ins Deployreceipt schreiben. |
| `firestore.secure-assessment.rules`, `firestore.indexes.json` | additive Namespaceregeln und tatsächlich benötigte Indizes. Vollständige Regeln gemeinsam mit Stageowner vergleichen; kein Ersetzen durch vereinfachte Billingregeln. |
| `functions-billing-sandbox/test/*.test.cjs`, `billing-sandbox-*.test.mjs`, `firebase.billing-sandbox-emulator.json` | deterministische Tests/Rulesemulator; kein Zugriff auf echte Provider oder bestehende Stage-/Livekonten |
| `docs/billing/sandbox-v1/receipts/` | später redigierte Build-/Deploy-/Provider-/Abnahmebelege; heute kein Erfolgsreceipt vortäuschen |

**Daten:** Firestore `(default)` laut Repositorykonfiguration; tatsächliche DBedition/Rulesruntime und deployter Regelstand vor Mutation verifizieren. Namespace `billingSandboxes/v1/actors/{uid}` mit Unterkollektionen `quizzes`, `rounds`, `usageOperations`, `usagePeriods`, `subscriptions`, `invoices`, `audit`; private gemeinsame Collections `billingSandboxes/v1/events` und `.../outbox`. Kein Kopieren nach Live oder in vorhandene fremde `quizzes`. Der neue Datenadapter übersetzt die bisherigen UIobjekte in diesen Namespace. Sandboxrunden laufen ausschließlich über Sandboxhandler, nicht über produktive Schüler-/Assessmentendpunkte; synthetische Teilnehmer, keine Schülerkonten.

**Berechtigungen:** Authidentität und bestehender Kontostatus bleiben vom Abo getrennt. Server setzt für eingeladene Test-UIDs einen Sandboxclaim und eine serverseitige Allowlist; beides nötig. Firestoreregeln geben dem UIDinhaber nur eigene, freigegebene Leseansichten; direkte Clientwrites von Kontingenten, Abo, Rechnungslinks, Ereignissen, Test-/Rundenstatus verboten. Clientkontrolle/Originprüfung ersetzt keine Serverautorisierung. Auch alle bisherigen mutierenden Produktpfade müssen Sandboxakteure ablehnen; vollständiges Inventar ist A0-Abnahmebedingung.

**Öffentliche Interfaces** (alle nach Authprüfung; UID nie aus Nutzereingabe):

| Funktion | Input → Ergebnis |
|---|---|
| `billingSandboxGetStatus` | `{}` → `{mode:'stripe_test', membership, cancelAtPeriodEnd, periodEnd, graceUntil, starterRemaining, paidRemaining, allowedActions, version}` |
| `billingSandboxClaimStarter` | `{operationId}` → `{starterRemaining}`; atomare einmalige Vergabe, keine erneute Vergabe nach Logout/Retry |
| `billingSandboxCreateCheckout` | `{operationId}` → `{url, sessionId}`; feste serverseitige Testprice-ID/Origin, keine vom Client gelieferte UID/Price/ReturnURL |
| `billingSandboxCreatePortal` | `{}` → `{url}` für eigenen gebundenen Testcustomer |
| `billingSandboxSaveQuiz` | `{operationId, quizId?, expectedVersion?, draft}` → `{quizId, version}`; neuer manueller Test oder Fixtureerstspeicherung kostet einmal, Bearbeiten desselben Tests nicht |
| `billingSandboxCreateFixture` | `{operationId}` → `{quizId, remaining, fixture:true}`; höchstens eine erfolgreiche Fixtureerzeugung pro Abnahmeakteur |
| `billingSandboxRound` | `{operationId, action:'start'|'submit'|'finish', quizId?, roundId?, payload?}` → `{roundId, status}`; synthetische Runde ohne echte Teilnehmer |
| `billingSandboxStripeWebhook` | Stripe-HTTPbody + Signaturheader → persistenter privater Eventeingang; keine Callable-/Clientstatusmutation |
| `billingSandboxReconcile` | privater Scheduler ohne öffentlichen Nutzerinput → Projektion/Audit korrigiert; keine Kundendaten im Log |

`membership = free | payment_pending | active | past_due | expired`; `cancelAtPeriodEnd` separat. Checkoutsessionstatus ist kein Mitgliedschaftsstatus. `allowedActions` enthält `create`, `edit`, `startRound`, `finishOwnRound`, `read`, `export`; Backend berechnet und prüft es bei jedem Schreibaufruf. `active` sowie `past_due` innerhalb **72 Stunden Testnachfrist** erlauben Bearbeiten/neue Runden; Erstellen benötigt zusätzlich Guthaben. Ohne gültiges bezahltes Recht erlaubt vorhandenes Starterguthaben weiterhin Erstellen/Bearbeiten/neue Runden. Ohne beides gilt Nur-Lesen einschließlich Export/Beenden eigener gestarteter Runde. `payment_pending` nimmt bestehende Starterrechte nicht weg. Nachfrist ist Testparameter, kein beschlossener Kundenvertrag. Starterguthaben verfällt nicht; bezahlte Testeinheiten verfallen mit der jeweiligen Periode, kein Rollover. Verbrauch zuerst bezahlte gültige Periode, dann Starter. Serverstatus zeigt beide getrennt.

**Zeit und Ein-Test-Limit:** Der Server bezieht die Billingzeit eines ausdrücklich gebundenen Testclock-Customers aus dessen verifizierter Stripe-Testuhr; ohne Uhr gilt UTC. Reservierungstimeouts/Queueüberwachung verwenden immer echte Serverzeit. Kein Client darf Zeit/Guthaben vorspulen. Für den Nur-Lesen-UIzustand darf ein privater Operator im ausschließlich synthetischen Abnahmeakteur den verbliebenen Starter auf0 setzen: auditierte Fixture, sichtbar im Receipt, keine öffentliche Seedroute, keine Änderung von Stripe-/Paidzuständen. Dadurch benötigt die Abnahme keinen zweiten/dritten generierten Test. Der Zahlungsnachweis stammt weiterhin ausschließlich aus Stripe.

**Guthabenalgorithmus:** neue Erstellung reserviert atomar eine Einheit mit UID/operationId/Quellenperiode und Payloadhash. Gleiche ID+gleicher Input liefert gleiches Ergebnis; gleiche ID+anderer Input liefert Konflikt. Commit erst wenn vollständiger, validierter Test dauerhaft im selben serverseitigen Commit gespeichert ist; Fehler hebt Reservierung auf. Abgebrochene reservierte Vorgänge werden nach10Minuten durch Reconcile geprüft und freigegeben; bereits committed wird niemals erneut gutgeschrieben. Parallele letzte Einheit reicht für genau eine Operation. Wiederholtes Bearbeiten/Öffnen/Export verbraucht nichts. Lokale Fehlersimulationen sind Ledgernachweise, keine reale KI-Kostenmessung.

**Stripealgorithmus:** Vor jedem Provideraufruf verifizierte Projekt-ID, erwartete Stripe-Testaccount-ID und ausschließlich Testcredentials voraussetzen; Präfixprüfung allein reicht nicht. Customer/Price/Subscription/Invoice/Checkout müssen zum gebundenen Testaccount gehören und `livemode=false` haben. Einziger erlaubter Preis: genau der vorhandene oder vom Betreiber innerhalb schon vorhandener Sandbox zulässige Testpreis; ohne passende vorhandene Konfiguration kein automatisches Erstellen neuer Providerobjekte über den aktuellen Vorbereitungsauftrag hinaus. Erstellung solcher Testobjekte erst im konkret freigegebenen A3-Lauf, keine Konto-/Keyanlage.

Webhook: unveränderten Rawbody gegen Endpointsecret prüfen; falsche Signatur/Liveobjekte vor fachlicher Verarbeitung ablehnen. Event-ID einmalig dauerhaft speichern, dann2xx; Persistenzfehler5xx. Private Workerprojektion mit Retry/Audit, ein ausgeschöpfter Retry landet in Fehlerwarteschlange und wird sichtbar. Doppelte IDs ohne zweite Wirkung; verspätete Ereignisse können neue Zustände nicht zurücksetzen: aktuelle Subscription/Invoice vom gebundenen Testaccount abrufen, Version/Periode transaktional abgleichen. `invoice.paid` bestätigt bezahlte Periode, nur dazu genau einmal12 Testeinheiten. `checkout.session.completed`/SuccessURL allein reicht nicht. Initiale nicht bezahlte Periode bleibt pending; fehlgeschlagene Verlängerung setzt `past_due`, Nachfrist ab serverseitig belegtem Periodenende. Kündigung zum Periodenende lässt Rechte bis dahin bestehen. Vollständig bezahlte Folgeperiode beendet past_due, ohne Starter neu zu vergeben. Reconcile spätestens alle15Minuten im begrenzten Testfenster; Fehlereingang ist Admin-/Operatornachweis, kein offenes Webtool. [Stripe Webhooks](https://docs.stripe.com/events/manage-webhook-endpoints), [Aboereignisse](https://docs.stripe.com/billing/subscriptions/webhooks)

**Isolation/Abbruch:** Builder muss vor Firebaseinitialisierung bei fehlendem/falschem `appEnvironment`, falscher Projekt-ID, fehlender exactOrigin oder fremdem Backend abbrechen; der vorhandene Fallback `appEnvironment || 'production'` ist in der Sandbox unzulässig. Strikte Vorschauorigin und UIDautorisierung, keine URLschalter zu Live. Hostingchannel allein isoliert Firebase-Ressourcen nicht. Bestehende KI- und sonstige mutierende Endpunkte müssen Testclaim serverseitig ablehnen; nur Schaltflächen auszublenden reicht nicht. Kann dies in A0 nicht klein und vollständig belegt werden, endet A0 mit gesperrtem UI-/Buildvorstand und benannter Lücke statt freigeschaltetem Konto. [Firebase Preview](https://firebase.google.com/docs/hosting/test-preview-deploy)

## 4. Ausführungspakete Stage A — 8 bis 13 Personentage

Schätzung für einen mit dem Bestand vertrauten Entwickler, inklusive gezielter Tests und Belege, ohne Beschaffungs-/Freigabewartezeit. Abhängigkeit linear A0→A1→A2→A3→A4→A5→A6; keine neue Parallelorganisation. Ein PT = ein konzentrierter Arbeitstag, keine Terminzusage. Der Umfang gilt nur, wenn vorhandene Projekt-/Sandboxzugänge und gemeinsame Guards tatsächlich wiederverwendbar sind. Bei notwendigem grundlegenden Auth-/Regelumbau vor Ausweitung neu abgrenzen.

### A0: Baseline, bestehende Zugänge und Isolation (1–1,5 PT)

**Files:** Build-/Configpfade, gemeinsame Zugriffsguards und `test/isolation.test.cjs` aus Dateikarte. **Interface:** fail-closed `assertSandboxContext({projectId, stripeAccountId, origin})` → zulässiger Kontext oder Fehler vor Providerinitialisierung.

- [ ] Betreiber liest vorhandene Stage-IAM-/Hosting-/Auth-/Firestoreedition-/Rules- und Stripe-Testkonfiguration read-only; nur Verfügbarkeit, eingeschränkte Secretreferenzen und freigegebene Testaccountbindung dokumentieren. Kein Secretwert exportieren; keine neue Ressource beschaffen.
- [ ] Webstand aus belegtem Commit isoliert herstellen; vor Fachänderung den kontrollierten Build gegen alle215 öffentlichen Livehashes vergleichen, erlaubte Umgebungssubstitution separat ausweisen. Unterschiede durch Quell-/Buildkomposition zuerst klären.
- [ ] Failing tests `wrongProjectStopsBeforeProvider`, `missingConfigDoesNotDefaultProduction`, `sandboxActorCannotCallExistingPaidOrMutationRoutes`, `foreignStageActorCannotReadSandbox` schreiben; Endpointinventar mit tatsächlichen Guard-/Exportnamen als Receipt speichern.
- [ ] Minimalen Builder, Sandboxclaim-/Allowlistgrenze und nötige additive Guards implementieren. Servergrenzen zuerst, erst danach Testkonto zulassen. Keine volle AI-/Assessmentcodebase blind deployen.
- [ ] `node --test functions-billing-sandbox/test/isolation.test.cjs` und ergänzte bestehende Guardtests grün; Rulesprüfung im Emulator. Nur explizit veränderte Functions und abgestimmte Stage-Regeln zielgerichtet freigeben. Deployliste muss auch geänderte bestehende Guards abdecken; nicht nur neuen Codebereich nennen.
- [ ] Checkpoint/Commit mit Zielprojekt, Quellcommit, Dateihashes, unverändertem kanonischem Hosting und offenem Provider-/Mailstatus. Bei fehlendem Zugriff endet Paket ohne Deploy, mit genau benannter fehlender **bestehender** Bindung.

### A1: Neuer Testakteur, Registrierung und Starterfreigabe (1–1,5 PT)

**Files:** bestehende Register-/Loginanbindung `app.js`, `billing-sandbox-ui.mjs`, Backend `guard.js`, `test/actor.test.cjs`. **Interface:** `billingSandboxClaimStarter({operationId})` aus Abschnitt3; verbraucht keine Einheit.

- [ ] Tests für unautorisierte UID, unbestätigtes Token bei aktivierter Verifikation und wiederholte Starteranforderung schreiben; erwartet0/0/insgesamt3 statt6 Einheiten.
- [ ] Vorhandene Register-/Loginmaske an Stage binden, dauerhaften Testbanner ergänzen. Neue Testidentität erst nach A0 mit Betreiberfreigabe registrieren; kein Mailproviderkonto anlegen.
- [ ] Vorhandene Firebase-Mailkonfiguration nutzen, falls verfügbar; Empfang/Verifizierung/erneuertes Token belegen. Andernfalls offenen E-Mailzustand sichtbar lassen und registrierungsbasierte Zahlungsfreigabe gesperrt halten.
- [ ] Backendzulassung mit Allowlist+Claim und gegebenenfalls echter tokenbestätigter E-Mail durchsetzen; initiale3 Einheiten genau einmal vergeben.
- [ ] `node --test functions-billing-sandbox/test/actor.test.cjs` grün; UIabnahme ohne Zahlungs-/Generierungsaufruf, Commit und redigierter Zustellnachweis oder präziser offener Zustand.

### A2: Ein Beispiel im echten Editor, sicheres Kontingent (1–1,5 PT)

**Files:** `quota.js`, `data.js`, Datenadapter, bestehende Editor-/Listenanbindung, `test/quota.test.cjs`, `billing-sandbox-data.test.mjs`. **Interfaces:** SaveQuiz/CreateFixture/Round wie Abschnitt3; ein serverseitiger Datenadapter für dieselben UIobjekte.

- [ ] Failing tests für parallele letzte Einheit, gleicher Retry, Inputkonflikt, Speicherausfall ohne Verbrauch und unzulässigen Fremd-UIDzugriff schreiben.
- [ ] Reservierung/Commit/Reconcile und Sandboxpersistenz umsetzen; Servervalidierung begrenzt Quizgröße/Feldtypen, keine vom Client gesetzten Besitzer-/Billing-/Statusfelder übernehmen.
- [ ] Vorhandenen Editor/„Meine Tests“ und Lehrer-/Schüleransichten an diesen Adapter anbinden; manuelles Speichern, erneutes Öffnen, Bearbeiten und synthetische Runde unterstützen. Kein zweites Unterrichts-UI; KI-/Audio-/Bild-/Crewkostenpfade bleiben servergesperrt.
- [ ] `node --test functions-billing-sandbox/test/quota.test.cjs billing-sandbox-data.test.mjs` grün; Rulesemulator mit Fremd-UID-/direkten Schreibangriffen grün.
- [ ] Genau einen ausdrücklich benannten Beispieltest durch die UI erzeugen; Speicherung/2 verbleibende Starter/Editor/Meine Tests belegen. Alle weiteren Grenztests lokal/emuliert. Commit und Abnahmeledger, keine Providerkostenbehauptung.

### A3: Echter Stripe-Testcheckout und Webhook (2–3 PT)

**Files:** `provider.js`, `main.js`, `test/provider.test.cjs`, Abrechnungskarte/Client. **Interfaces:** CreateCheckout/CreatePortal/Webhook aus Abschnitt3; Provideradapter nimmt ausschließlich servergeprüften Kontext entgegen.

- [ ] Tests mit gemocktem Provider für doppelte operationId, fremde Price-/UIDeingabe, falsche Signatur, Liveobjekt und persistenzfehlgeschlagenen Eingang schreiben. Erwartet keine zweite Checkoutsession/keine Rechte/5xx bei Speicherfehler.
- [ ] Vorhandene Testcredentials durch Betreiber sicher im Stage-Secret-Manager binden, begrenzte serverseitige Berechtigung/Accountbindung prüfen. Fehlt eine vorhandene Bindung, Schaltfläche bleibt gesperrt; keine Schlüssel im Chat erfragen. Webhookendpoint darf erst im ausdrücklich begonnenen Sandboxlauf konfiguriert werden.
- [ ] Testpriceparameter und Portal/Checkoutreturns auf exakte Previeworigin fixieren; erst signierte und serverbestätigte bezahlte Periode vergibt12 Testeinheiten. Auftrag erlaubt keine Livepreise.
- [ ] `node --test functions-billing-sandbox/test/provider.test.cjs` grün; danach getrennten realen Stripe-Testlauf mit Testkarte,3DS und fehlgeschlagener Testzahlung nach offizieller Dokumentation durchführen. Keine echte Karte, keine echten Gelder. [Stripe Testing](https://docs.stripe.com/testing)
- [ ] Testsession-/Event-/Invoice-ID, `livemode=false`, Serverprojektion und Zeitraum redigiert belegen; ungültige/fehlende/doppelte Ereignisse nach Q10–Q13 nachweisen. Erfolgsreturn allein ausdrücklich kein Zahlungsbeleg. Commit/Receipt vor längerer Providerwartezeit.

### A4: Kündigung, Erneuerung, Nachfrist und Unterricht (1–1,5 PT)

**Files:** `lifecycle.js`, `data.js`, privater Reconcileexport, `test/lifecycle.test.cjs`. **Interface:** Projektion liefert genau Status/allowedActions aus Abschnitt3, alle Mutationen prüfen dieselbe Entscheidung.

- [ ] Failing tests für verspätetes altes Event nach neuem `invoice.paid`, gleiches Periodenguthaben zweimal, Zahlungsausfall,72hGrenze, vorhandenes Starterguthaben nach Aboende und aktive Runde bei Ablauf schreiben.
- [ ] Lebenszyklusprojektor/Reconcile und serverseitige Mutationsgrenzen implementieren; keine Authstatusänderung. Beim Rundenstart gebundene Teilnehmer-/Quizversion und erlaubtes Abschlussfenster festhalten; Ablauf hebt Abschlussrechte nicht auf.
- [ ] `node --test functions-billing-sandbox/test/lifecycle.test.cjs` grün, einschließlich Timeout-/Offline-Retry auf derselben Runde.
- [ ] In derselben vorhandenen Stripe-Sandbox Testuhr für dafür geeigneten Testcustomer einsetzen; Verlängerung/Fehlzahlung/Kündigung beschleunigt nachweisen. Billingzeit ausschließlich serverseitig aus dieser gebundenen Uhr beziehen; vor Nur-Lesen den verbleibenden Starter ausschließlich als auditierte synthetische Fixture auf0 setzen. Unterstützt bestehender Customer keine Uhr, eigener benannter Testcustomer innerhalb dieses freigegebenen Laufs oder ehrlicher offener Providernachweis, kein lokaler Zustand als Stripeuhr ausgeben. [Stripe Billing Tests](https://docs.stripe.com/billing/testing)
- [ ] Zwei Belegarten getrennt speichern: Stripe-Lebenszyklus und lokaler/Emulatornachweis der Unterrichtsrechte. Keine zweite UI-Testgenerierung; vorhandenen einen Beispieltest verwenden. Commit.

### A5: Abrechnung im vorhandenen Webrahmen (0,75–1,25 PT)

**Files:** bestehende Settings-/Dashboardeinbindung, `billing-sandbox-ui.mjs`, `.css`, `billing-sandbox-ui.test.mjs`. **Interface:** Status/Portal aus Abschnitt3; eigene Rechnungsansicht über servergeprüfte Invoicezuordnung, niemals aus Clientcustomer-ID.

- [ ] UItests für Pending statt voreiliger Aktivierung, Logout/Kontowechsel nach Return, fremde Invoice-ID und fehlende Providerbindung schreiben.
- [ ] Kleine Karte mit Starter/Periodenguthaben, Monats-Testbetrag, Status, Kündigungsdatum/Nachfrist und Nur-Lesen ergänzen; auf Handy bedienbar, keine neue Marken-/Navigationswelt.
- [ ] Link zur echten Stripe-Testrechnung nur für eigene UID bereitstellen; sichtbar „Testrechnung — kein Zahlungs- oder Steuerbeleg“. Portal zeigt Testkündigung; aktuelle Rechte aus Serverstatus laden.
- [ ] `node --test billing-sandbox-ui.test.mjs` grün; Desktop/Handyablauf in bestehendem Editor und Settings prüfen. Keine privaten Screenshots/Karten-/Maildaten ins öffentliche Repo. Commit.

### A6: Isolierte Vorschau und kompakte Abnahme (1,25–2,25 PT)

**Files:** Build-/Previewconfig, `docs/billing/sandbox-v1/receipts/*`, HDF/TODO-Deltas. **Interface:** Deploymentreceipt mit tatsächlicher URL, Projekt, Channel, Quell-/Buildcommit, Functions-/Rulesnachweisen und Testfallstatus.

- [ ] Alle untenstehenden Q-Fälle ausführen oder exakt als nicht ausgeführt markieren. Gezielte Backend-/Rules-/UItests einmal komplett; bei unveränderten grünen Ergebnissen keine kostenpflichtige Wiederholungsschleife.
- [ ] Nur bei A0-Grenzen und bestehendem Deployzugriff eigene Vorschau veröffentlichen: eigener Kanal `billing-plan-01`, eigenes Ausgabeziel und explizites Projekt `gradecrew-staging-2026`. Kanalnamen allein nicht als Existenzbeleg nennen.
- [ ] Vorschau exakt gegen Buildhashes prüfen; Vorher-/Nachhermanifest der kanonischen Stage und Live vergleichen. Functions, Guards, Regeln und Secretbindung separat belegen; Hostinggrün ersetzt diese Nachweise nicht.
- [ ] UIablauf mit neuem Testakteur belegen, höchstens ein Beispieltest insgesamt. Previewvertrag erst nach beobachtetem Ergebnis auf tatsächliche URL/Status aktualisieren. Bei Providerlücke sichtbar gesperrte Vorschau als UIbeleg, niemals „Payment fertig“.
- [ ] Kontrollierten Rückbau erproben: Vorschaukanal deaktivieren, Sandboxallowlist sperren, nur eigene Worker/Endpoints stoppen, Testdaten nach dokumentierter Frist löschen; bestehendes Stage/Live und Nutzerdaten unangetastet. HDF/Commit/PR/Prüfstatus sichern.

## 5. Kompakte Abnahmematrix

Alle Fälle sind am Planstand **geplant, nicht ausgeführt**. `L` = lokal/Emulator ohne Provider, `S` = echter Stripe-Testmodus, `U` = isolierte Vorschau. Kein Typ ersetzt einen anderen. Nachweis später mit tatsächlicher Case-ID/Run/Datum; keine personenbezogenen Rohdaten.

| ID | Typ | Erwartetes Ergebnis |
|---|---|---|
| Q01 | L | Falsches Firebaseprojekt oder fehlende Umgebung stoppt vor Initialisierung/Mutation. |
| Q02 | L/S | Livekey-/Liveobjekt-/falsche Accountbindung wird abgewiesen, keine Liveoperation. Keytest lokal mit synthetischer Zeichenfolge, keinen echten Livekey laden. |
| Q03 | L/U | Sandboxakteur erreicht keinen bestehenden KI-,Audio-,Bild-,Upload- oder fremden Schreibpfad; Endpointinventar vollständig. |
| Q04 | L | Fremde Stage-UID kann Sandbox nicht lesen/schreiben, Client kann Guthaben/paid nicht setzen. |
| Q05 | L/U | E-Mailstatus ehrlich: echte Bestätigung+Tokenrefresh oder sichtbar offen/Checkout gesperrt. |
| Q06 | L/U | Starter wiederholt angefordert ergibt insgesamt3; Konto bleibt an-/abmeldbar. |
| Q07 | L | Zwei gleichzeitige letzte Reservierungen: eine erfolgreich, eine ohne Guthaben. |
| Q08 | L | Generierungs-/Speicherfehler und abgebrochene Reservierung: keine verbrauchte Kundeneinheit. |
| Q09 | L/S | Doppelclick/Retry erzeugt eine logische Operation und höchstens eine gültige Checkoutsession. |
| Q10 | S/U | SuccessURL ohne verarbeiteten Zahlungsnachweis bleibt pending; Abbruch bleibt ohne Abo. |
| Q11 | L/S | Falsche Webhooksignatur/Liveevent vergibt keine Rechte; Persistenzfehler wird erneut zugestellt. |
| Q12 | L/S | Doppelte Events geben12 Periodeneinheiten insgesamt, nicht24. |
| Q13 | L/S | Altes Ereignis nach neuem paid setzt Status nicht zurück; fehlendes Event wird reconciled. |
| Q14 | S/U | Testkarte mit3DS, Abbruch/Fehlzahlung und Erfolg sind getrennt belegt. |
| Q15 | S/U | Echte Stripe-Testrechnung gehört zur UID, Testkennzeichnung sichtbar; keine Fiskalbehauptung. |
| Q16 | S/U | Portal-Kündigung zum Periodenende: Rechte bis Ende; keine sofortige Kontosperre. |
| Q17 | L/S/U | Fehlverlängerung→72hNachfrist→Nur-Lesen ohne Starterrest; Zahlung stellt neue Periode einmal her. |
| Q18 | L/U | Während Ablauf gestartete Runde kann mit verspäteter/offliner Wiederholung abgeschlossen werden; neue Runde gesperrt. |
| Q19 | L/U | Return nach Logout/Kontowechsel zeigt weder fremden Status noch Rechnungslink. |
| Q20 | L | Fremde UID/Price/Invoice/ReturnURLeingaben und Payloadkonflikt werden verworfen. |
| Q21 | U | Ein einziges klar benanntes Beispiel erscheint in bestehendem Editor/Meine Tests; kein KIaufruf. |
| Q22 | U | Kein Providerzugriff: Abrechnungsaktion sichtbar gesperrt, keine angebliche Zahlung/echte Freischaltung. |
| Q23 | L/U | Ablauf verändert kein Authkonto, Lesen/Export gehen; Starterrest bleibt nutzbar. |
| Q24 | U | Tatsächliche Previewhashes/Projekt/Rules/Functions geprüft; kanonisches Stagehosting und Live unverändert. |

**Stage A fertig** bedeutet: Q01–Q24 mit erforderlichen Typen bestanden, echte Stripe-Testsession+signiertes Event+serverseitiges Recht+Testrechnung+Lifecycle belegt, Vorschau im bestehenden UI überprüft. Ein zugriffsbedingt gesperrter Plan/UIvorstand ist zulässiges **Teilresultat**, kein bestandener Durchstich. Stage A beweist weder reale KIstückkosten noch Verbraucher-/Steuer-/Applefreigabe oder echten Produktionsbetrieb.

## 6. Stage B — kleiner Echtgeldpilot, ausdrücklich nicht gestartet

Nach bestandener Stage A eigener konkreter Auftrag mit Verkäufer, Preis, begrenzter eingeladenen Teilnehmergruppe und Enddatum. Vorschlag: ein persönliches monatliches Webabo für wenige erwachsene Testlehrkräfte in Deutschland, keine Schulen/Schüler, keine Appkäufe. Zusätzliche **6–12 PT aktive Arbeit** grob geschätzt, externe Vertrags-/Steuer-/Prüfwartezeit separat. Die39–66PT für das umfassendere Angebot bleiben eine andere Größenordnung/ein anderer Scope.

Vor erster echter Zahlung müssen sechs Gates als Belege vorliegen:

1. Verkäufer-/Steuerstatus, finale Bruttopreise/Leistungsgrenzen und verantwortlicher Zahlungs-/Rechnungsbetrieb festgelegt; vorhandenes PSPkonto korrekt betriebsfähig. Keine Konto-/Vertragsannahme durch diesen Plan.
2. Qualifizierte Prüfung der echten Bestell-/Widerrufs-/Kündigungs-/Leistungs-/Rechnungstexte und Aufbewahrung; die Novemberrecherche ist Grundlage, keine Rechtsfreigabe. Echte Bestätigung und Rechnung dürfen nicht bloß Testbanner übernehmen.
3. Vollständiges Kostenledger/Budget für alle tatsächlich freigegebenen KI-,Audio-,Bild- und Wiederholungswege; failed generation ohne Kundenverbrauch, keine unkontrollierten Providerretries. Der kostenlose Fixturelauf aus A kann dies nicht belegen; bezahlte Kostenprobe benötigt eigenen begrenzten Auftrag.
4. Datenschutz-/Lösch-/Export-/Subprozessorprüfung und Unterrichts-/Support-/Erstattungsweg passend zum Pilot; keine Schülerdaten an PSP. Bestehende Wilmabudgets nicht als Tarifpreis ausgeben.
5. Produktionskomposition/Backend-/Rules-/Secret-/Reconcile-/Alarm-/Rollbackbelege in isolierter Probe, begrenzte Akteurfreigabe und Zahlungsfehler-/Rechnungsprüfung vollständig. Produktionshosting bleibt bis ausdrücklicher Freigabe unberührt.
6. Schriftliche Freigabe für konkreten Echtgeldpilot und konkretes Deployment. Keine Ableitung aus „Sandbox grün“; Schuljahresverträge, SEPA, E-Rechnung/B2G, Sitze und Apple/IAP separat später.

## 7. Entscheidung und exakt nächster Schritt

**Empfehlung:** Diesen engen Stage-A-Pfad verwenden. Aufwand **8–13 PT** statt das Gesamtangebot vor dem ersten Zahlungsnachweis umzusetzen. Sofort prüfbares Ergebnis dieses Folgeauftrags: Plan, geprüfte Baseline und gesperrter Previewvertrag; **keine tatsächliche Preview-URL vorhanden**.

Maximal drei menschliche Entscheidungen, keine Schlüsseldaten:

- **D1:** Den begrenzten Stage-A-Scope bestätigen;3 Starter/12 Monats-Beispiele/1,00EUR und72h sind ausschließlich vorgeschlagene Sandboxparameter, kein beschlossener Kundentarif.
- **D2:** Betreiber benennt vorhandene Stripe-Sandbox-/Stage-Deploymentbindung und zulässigen neuen Testakteur über den sicheren Betreiberweg. Falls keine bestehende Bindung nutzbar ist, bleibt der Providerlauf gesperrt; eine Beschaffung ist ein eigener Auftrag.
- **D3:** Nach Stage-A-Belegen über einen getrennten Echtgeldpilot entscheiden; heute keine Entscheidung zu Livepreisen/Schule/Apple nötig.

**Genau nächster Testseitenschritt:** A0read-only mit dem vorhandenen Stagebetreiber: Deploy-IAM, Namespace-/Guardgrenzen, vorhandene Stripe-Testaccount-/Secretreferenzen und Mailfähigkeit verifizieren. Sind sie vorhanden, im isolierten Webquellstand den fail-closed Build plus begrenzte Guardänderungen erstellen und prüfen, dann nur Kanal `billing-plan-01` veröffentlichen. Sind sie nicht nachweisbar, keine Keys/Konten improvisieren: fehlende konkrete bestehende Bindung im Receipt nennen, Checkout gesperrt lassen. Dieses Dokument ist keine Behauptung eines bereits erzeugten Buildoutputs oder vorbereiteter Productcodefiles.
