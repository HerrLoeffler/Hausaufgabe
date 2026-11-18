# GradeCrew Stripe-Produktpilot – Umsetzung

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Bestehenden Worktree und Task GC-BILLING-PLAN-01 fortsetzen. Keine neue Aufgabe, kein neuer Händleraccount, kein neuer API-Schlüssel.

**Goal:** Ein regulär angemeldetes, ausdrücklich benanntes Testkonto kann in der getrennten Testumgebung ein persönliches Abo erwerben; signierte Stripe-Ereignisse aktivieren und verlängern den Zugang. Schulrechnung und Teilzahlungen bleiben getrennte Käufer-/Periodenvorgänge.

**Architecture:** Bestehende konto-/lizenzbezogene Fachlogik bleibt Eigentümerin der Rechte. Stripe-Adapter übernimmt ausschließlich Zahlungsobjekte, Webhooks und Rechnungsstatus. Serverseitige Bestellungen, Käuferbindungen, Zahlungsperioden und Ereignisbelege verhindern doppelte Käufe und doppelte Freigaben. Aktuell ausgelieferte Cloud-Quellpakete werden gezielt ergänzt, statt durch die Hostingbasis ersetzt.

**Tech Stack:** Node22, festgeschriebener Stripe-Node-SDK23.1.0, explizite Stripe-API2026-10-28.endive, vorhandene Firebase-Adapter, vorhandenes SecretManager und bestehende GradeCrew-Sandbox. Neuere offizielle API-/Registryangaben haben Vorrang vor dem älteren installierten Stripe-Skillstand.

**Spec:** [Bestätigte Regeln und geprüfte Foundation](../../billing/2026-11-18-product-integration.md), [Gesamtplan](2026-11-18-gradecrew-zahlungsbetrieb.md).

## Global Constraints

- Ausschließlich gradecrew-staging-2026 und Stripe acct_1UYUaw1l0zkqOtXr, livemode=false. Provider-Accountbindung und Testschlüsselpräfix vor jedem mutierenden Stripe-Flow prüfen.
- Persönlich15EUR/Monat oder120EUR/Jahr im Voraus; Schule50EUR je Platz/Jahr, Bruttopreise. Keine Livepreise, Steuerregistrierung oder pauschale Steuerkonformitätsbehauptung.
- Neue Testidentität ist ausdrücklich genehmigte Ausnahme. Existierendes produktives Konto und Unterrichtsdaten unverändert. Kennwort ausschließlich vom Nutzer gesetzt, reguläre Anmeldung und Bestätigung serverseitig nachgewiesen. UID/Adresse/Einrichtungslinks außerhalb des öffentlichen Repositories.
- Checkout startet kein zusätzliches Gratisabo. Die lokale14Tage-/Fünferregel bleibt unabhängig vom bewusst bestätigten Kauf.
- Keine Zahlungserlaubnis aus einer Erfolgs-URL oder checkout.session.completed ableiten. Freigabe nur anhand zugeordneter, vollständig bezahlter Providerrechnung und gültiger Leistungsperiode.
- School-Payer bleibt vom persönlichen Käufer getrennt; kein gemeinsamer Schulzugangscode, kein Zugriff auf fremde Tests.
- Kein neuer Schlüssel und kein automatischer echter Mailversand. Vor Änderungen an Sicherheitsberechtigungen konkreten geprüften Funktions-/Rechteumfang dokumentieren; keine pauschale Projektrechteerweiterung.
- Keine kostenpflichtige KI-Generierung als Testnebenwirkung. Gegenproben mit manuellen Dateien und synthetischen Schul-/Zahlungsdaten.
- Konto-/Rechtebasis71892315 bleibt erhalten. Cloudquellen28Oct/09Nov/26Oct vor Veröffentlichung erneut vergleichen. Andere Testkanäle und Production nicht überschreiben.

## Review Focus

1. Verlorene Providerantwort nach tatsächlich erzeugtem Checkout darf weder zweiten Käufer noch zweites Abo erzeugen; Vorgang muss mit derselben Kennung wiederaufnehmbar sein.
2. invoice.paid kann vor checkout.session.completed eintreffen und mehrfach oder verspätet zugestellt werden. Käufer, serverseitige Bestellung, Preis und Periode müssen trotzdem eindeutig bleiben.
3. Bezahlte Folgeperioden können bereits im Testclock-Future liegen. Zusammenhängende bezahlte Zeiträume verlängern Zugang, eine unbezahlte Lücke wird nicht überbrückt.
4. Bereits bezahlte persönliche Rechte und kostenlose Freigaben bleiben bei Schulwechsel oder fehlgeschlagener Verlängerung unabhängig erhalten. Ein Rechnungsstatus allein ist keine Benutzerrolle.
5. Ein veröffentlichter neuer Kaufweg ohne aktualisierte bestehende KI-/Assessment-Guards wäre ein falscher Ende-zu-Ende-Nachweis. Veröffentlichung und tatsächliche Produkteinlösung getrennt prüfen.

### Task 1: Providervertrag und bezahlte Zeiträume

**Files:** functions/lib/billing/domain/stripe-contracts.js, functions/lib/billing/stripe-provider.js, functions/test/billing-stripe-contracts.test.js, functions/test/billing-stripe-provider.test.js, functions/package.json und Lockfile.

**Interfaces:** normalizeInvoice(invoice,expected) liefert geprüfte IDs, Restbetrag, bezahlt/offen und optionalen persönlichen Leistungszeitraum. mergePaidPeriods(periods) liefert sortierte lückenfreie Intervalle. createStripeProvider konfiguriert genau ein SDK-Objekt aus vorhandenen Secretwerten; keine globale API-Key-Konfiguration.

- [ ] Tests schreiben: fremder Kunde/Preis/Währung/Liveobjekt abgewiesen;10/20/50EUR-Zustände; Halbintervall; doppelte/überlappende/verspätete Perioden; Lücke bleibt erhalten.
- [ ] UnterNode22 ausführen: erwartetes RED wegen fehlender Module.
- [ ] Reine Validierung und SDK-Grenze implementieren, Geheimnisse nie loggen. Offizielle aktuelle Invoice-/Lineitem-Felder verwenden, nicht aus Erinnerungen ergänzen.
- [ ] Tests wiederholen: GREEN. Commit mit Schnittstellen und Belegen.

### Task 2: Bestellungen, Käuferbindung und Zahlungsereignisse

**Files:** functions/lib/billing/payments.js, application.js, domain/access.js, tools/rules/billing-payments.emulator.test.cjs.

**Interfaces:** createPaymentOperations erhält vorhandene store/caller/context/key/clock-Schnittstellen plus Providerport. checkout(request), portal(request), schoolInvoice(request) sind explizite Aktionen. processStripeEvent(event) bleibt ausschließlich serverintern. Ereignis-Inbox enthält IDs/Status, keine vollständigen Zahlungs-/Personendaten.

- [ ] Echte lokale Transaktionstests zuerst: eine Bestellung/Käuferbindung, konkurrierende Anfragen, verlorene Antwort und Wiederaufnahme, fremder Zugriff, falsche Metadaten, Rechnung vor Checkout-Ereignis, doppelte Rechnung und Verlängerung, Schulteilbetrag ohne Freigabe.
- [ ] RED ausführen, dann idempotente Bestellphasen implementieren. Provideraufrufe außerhalb von Firestore-Transaktionen mit stabilen Idempotenzkennungen.
- [ ] Persönliche Quelle aus vollständig bezahlten Perioden ableiten; gültige Lücken erhalten. Fehler-/Kündigungsereignis gewährt keine neue Periode und löscht keine fremde Quelle. Erstattung/Streitfälle als explizite Prüffälle erhalten, solange Geschäftsregel offen.
- [ ] Vollständige Testgruppe GREEN, bestehende Zugangs-/Schulfälle erhalten, Commit.

### Task 3: Geschützte Endpunkte und Produktoberfläche

**Files:** functions/lib/billing/payment-callables.js, runtime.js, handlers.js, functions/main.js, app.js, billing-client.mjs, billing-panel.mjs/css und passende Verhaltenstests.

**Interfaces:** Separater billingPayments-Callable für Checkout/Portal/Rechnung mit normalen Firebase-Logins; billingStripeWebhook für signierten rawBody. Bestehender billingPilot bleibt Konto-/Schulverwaltung. Nur jeweilige Zahlungsfunktionen erhalten vorhandene SecretManager-Zugriffe.

- [ ] RED: Signatur fehlt/alt/manipuliert; falsches Testprojekt/Konto; fremde UID/Schule; Rücksprungadresse außerhalb eigener Vorschau; eine Erfolgs-URL schaltet nichts frei.
- [ ] Endpunkte und explizites Aktionsrouting implementieren. Rücksprungadresse ausschließlich aus geschützter Serverkonfiguration. Höchstens1Testinstanz, begrenzte Zeitlimits, keine Rohfehler/Secrets im Client.
- [ ] Preiswahl erst bei serverseitig aktiviertem vollständigem Pfad einschalten. Zugang nach Stripe-Rückkehr frisch vom Server lesen; keine optimistische Premiumanzeige. Normale Web/App-Statusquelle gemeinsam halten.
- [ ] GREEN plus vorhandene UI/Rules-Prüfungen, Commit.

### Task 4: Quellerhalt, isolierter Cloudanschluss und tatsächlicher Test

**Files:** source-preservation builder/receipt unter tools/billing, Nachweise docs/billing und private Testkonfiguration außerhalbGit.

- [ ] Aktuelle Cloudquellen pro betroffenen Dienstgruppe lesen und Fingerabdrücke festhalten. Nur benötigte Billinghunks in diese Quellen übernehmen. VisualTask/Recipe, aktuelle Audio-/Assessment-Sicherheitsregeln und Providerkonfiguration erhalten.
- [ ] Prüfpaket aus genauer Quelle bauen, testen und einmal unabhängig prüfen lassen. Berechtigte wichtige Befunde RED→GREEN korrigieren. Konkrete noch notwendige Sicherheitsfreigaben erst mit reviewbarem Manifest erfragen.
- [ ] Vorhandene Test-Schlüssel lesend an richtige Sandbox binden, Testprodukte/-preise idempotent vorbereiten. Keine Live-Account-/Branding-/Taxregistrierung verändern. Sandbox-Standardsteuerberechnung nur ausdrücklich gekennzeichnete Inlands-Testannahme, automatic_tax ohne geprüfte Registrierung ausgeschaltet lassen.
- [ ] Nur eigene Testdienste/Preview veröffentlichen, Quellen/Hashes/Operationen sichern, bestehende Kanal-/Funktionsstände vergleichen. Erst danach die freigegebene UID in den Pilot aufnehmen.
- [ ] Reguläres Testkonto: vor Kauf verbleibende Gratisrechte sichtbar; nach Verbrauch von fünf manuellen Testdateien echte Neuanlage gesperrt. Sandbox-PayPal-Erstzahlung durch Nutzer bestätigen lassen, signierte Rechnungsfreigabe und tatsächliche sechste Datei prüfen. Verlängerung über Stripe-Testclock separat mit bezahlter Periode und Accessdatum nachweisen.
- [ ] Neue50EUR-Schulrechnung: nach10EUR und weiteren20EUR bleiben20EUR offen. Erst vollständige50EUR erlauben den bezahlten Schulzugang. Historischer30EUR-/10+20-Fall bleibt unverändert dokumentiert und wird nicht als50EUR-Kauf ausgegeben.
- [ ] Konto-/Abrechnungsansicht, Ausfälle, Wiederaufnahme und negative Zugriffe prüfen. Grenzen von Testclock, echten Mails, Buchhaltungsimport und rechtlicher Rechnung ausdrücklich erhalten. Keine Production-Einführung aus diesem Schritt.

## Abnahmegrenze

Der Pilot ist erst als veröffentlicht und zahlungsgeprüft zu bezeichnen, wenn aktueller Quellnachweis, signiertes echtes Testereignis, normales angemeldetes Konto und tatsächliche Produkteinlösung zusammen vorliegen. Eine Spezifikation, ein Commit oder eine erfolgreiche reine Providerzahlung reicht nicht. Buchhaltungsdienst/DATEV-Import, tatsächliche Rechnungs-E-Mails und rechtlicher Liveverkauf bleiben gesonderte Aufgaben.
