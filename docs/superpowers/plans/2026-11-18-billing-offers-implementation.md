# Kompakte Kontoseite und steuerbare Angebote – Umsetzung

> **For agentic workers:** Use superpowers:executing-plans for the dependent payment/domain tasks. Under superpowers:dispatching-parallel-agents, UI and provider adapters may be implemented independently against the fixed ports below, with disjoint file ownership. One fresh full-change review after integration, then reproducible important fixes. Continue existing worktree/task; do not create accounts, keys or a replacement project.

**Goal:** Lehrkräfte erhalten eine kompakte Kontoseite; berechtigte GradeCrew-Administration kann nachvollziehbare öffentliche, persönliche und codegebundene Rabatte mit korrekter Stripe-Abrechnung verwalten.

**Architecture:** Bestehende Konto-/Schulrechte bleiben Eigentümerin der Freischaltung. Neue reine Angebotsfunktionen berechnen Geld und Bedingungen; ein transaktionaler Angebotsdienst speichert Versionen, Zuweisungen, Preisvorschauen und Reservierungen. Bestehende Zahlungsendpunkte erhalten explizite Aktionen; Stripe bleibt im Adapter. UI und Provider arbeiten gegen die hier festgelegten Ports.

**Tech Stack:** Node22, Stripe23.1.0/API2026-10-28.endive, vorhandene Firebase-Adapter, Browsermodule/JSDOM, vorhandene lokale Auth-/Firestoreemulatoren. Kein Dependency-Upgrade.

**Spec:** [Bestätigter Entwurf](../specs/2026-11-18-billing-offers-design.md). Martin bestätigt ausdrücklich die Umsetzung dieses Entwurfs in der Testumgebung.

## Global Constraints

- Ausschließlich gradecrew-staging-2026, eigener billing-product-Kanal und acct_1UYUaw1l0zkqOtXr mit livemode=false. Bestehende Live-/kanonische Hostingstände nicht ersetzen.
- 15EUR/Monat,120EUR/Jahr,50EUR/Schulplatzjahr brutto. 14Tage/5Dateien unverändert; bestehende Kollegenfreigaben getrennt.
- Kein neuer Account/Schlüssel, keine stillschweigende Rollen-/UID-Erweiterung. Aktuelles freigegebenes Konto ist teacher; tatsächliche Admin-Cloudabnahme braucht separat benanntes vorhandenes Administratorkonto.
- Bereits bezahlte/offene teilgezahlte Rechnungen bleiben unverändert. Öffentliche Aktionen für neue Käufe; bestehende Verträge ausdrücklich auswählen, keine rückwirkenden Änderungen.
- Kein Rabattstapeln. Code und private Ziele nicht öffentlich ausgeben; Kundendaten nur im geschützten Verwaltungspfad.
- Provideraufrufe außerhalb Firestoretransaktionen, stabile Idempotenz, ungeklärte Vorgänge nicht doppelt anlegen. Betrag/IDs/Periode/Rabattversion serverseitig binden. Guthaben/offStripe bleiben kein Zahlungsbeleg.
- Vergleichspreise und Normalpreis nach Rabattende sichtbar und belegbar; Beispielaktionen nicht als echte veröffentlichen.

## Review Focus

1. Einlösen/Bezahlen nach Aktionsende oder verlorener Antwort muss die bereits zugesagte Bestellung erhalten und darf keine zweite Einlösung erzeugen.
2. Ein 100-%-Rabatt darf genau die autorisierte Null-Euro-Periode gewähren; identische Nullrechnung ohne diese Bindung darf nichts freischalten.
3. Bestehendes Jahresabo mit dreimonatigem Rabattfenster darf weder vorzeitig neu berechnet noch anteilig verkürzt werden.
4. Coupon deaktiviert/Einlösefenster beendet darf bereits zugesagte Folgeperioden nicht entfernen; neue Version darf alte Rechnung nicht umdeuten.
5. Parallel veröffentlichte Aktionen, Schulplatzmengen und kundenspezifische Codes dürfen weder Kapazität/Einlöselimit umgehen noch private Ziele preisgeben.

## Gemeinsame Daten- und Aktionsverträge

`OfferInput={name,title,planCode,audience:'public'|'accounts'|'code',targetIds?:string[],code?:string,discountType:'percent'|'fixed',percentOff?:integer1..100,amountOffMinor?:positiveInteger,fixedBasis:'invoice'|'seat',startsOn:'YYYY-MM-DD',endsOn:'YYYY-MM-DD',duration:'once'|'months'|'forever',durationMonths?:integer1..36,maxRedemptions?:integer1..100000,firstTimeOnly:boolean,reason}`. endsOn ist eingeschlossener Berliner Kalendertag; serverseitig Ende exklusiv am folgenden Berliner Mitternacht. School+fixed verlangt Basis explizit. personal zwingend invoice. Normierung entfernt keine fachlichen Felder still.

`OfferRecord={id,...normalizedInput,startsAtMs,endsAtMs,status:'draft'|'syncing'|'active'|'ended'|'sync_error',fingerprint,createdBy,createdAtMs,publishedAtMs?,providerCouponId?,redemptionCount,reservedCount,previousOfferId?}`. Erstellen einer Änderung erzeugt neue ID/Version; bestehende aktive Version nur ausdrücklich beenden.

`OfferQuote={id,kind:'personal'|'school',ownerId,planCode,priceId,quantity,unitAmount,baseAmountMinor,discountAmountMinor,totalMinor,offer:null|{id,couponId?,promotionCodeId?,title,discountType,percentOff?,amountOffMinor?,fixedBasis,duration,durationMonths?,endsAtMs},createdAtMs,expiresAtMs}`. Quotes gelten5Minuten zur Kaufentscheidung; Checkoutpreis wird bei Kaufstart für35Minuten gebunden. Stripeexpires_at auf diesen festen Zeitpunkt; Vorgänge vor neuer Provideranlage nach5Minuten stoppen, verlorene Antwort bleibt über dieselbe Idempotenz wiederaufnehmbar. Einlösefenster am Quote-/Kaufstart prüfen, nicht am verspäteten Webhook.

Serveraktionen am billingPayments-Endpoint:
- `offerTargets({query,kind})` ausschließlich frische Plattformadministration: erlaubte Konten nach Namen/E-Mail bzw. Schule suchen, Labels zurückgeben, IDs nur intern. UI verwendet Auswahlchips statt technischer Kennungen.
- `publicOffers` einzige nicht angemeldete, explizit erlaubte Leseaktion, nur reduzierte öffentliche aktive Angebotsdaten; kein Zugriff auf private Versionen, Ziele, Codes, Quote oder Benutzerstand.
- `offerQuote({planCode,schoolId?,code?,quantity?}) -> {quote,eligible,conflict?}`; Menge Schule ausschließlich aus geschützter Periode, kein Clientpreis. quote.offer enthält keine Zielliste.
- `listOffers`, `saveOffer({offer,requestId,previousOfferId?})`, `publishOffer({offerId,requestId})`, `endOffer({offerId,requestId,reason})`, `previewExistingOffer({offerId,personIds|'all'})`, `applyExistingOffer({previewId,requestId})`; sämtliche Verwaltungsaktionen Plattformadmin, bestätigt, frische Anmeldung.
- `checkout` und `schoolInvoice` akzeptieren optional quoteId und prüfen Eigentümer/Tarif/Menge; ohne Quote bisheriger Normalpreispfad bleibt erhalten. Aktive automatische Angebote erfordern serverseitig Quote statt stiller Normalpreisabweichung.

UI-PublicView `access.offerViews` enthält je eligible Tarif `{planCode,offerId,title,baseAmountMinor,discountAmountMinor,totalMinor,duration,durationMonths,endsAtMs}`; `access.canManageOffers` ausschließlich serverbestimmte boolesche Rolle. Private Ziele niemals im PublicView. UI `onChoose(planCode,{quoteId?})`, `client.request` nutzt obige Aktionsnamen. Adminliste enthält berechtigte vollständige Records, kein Geheimnis.

Providerport (neue Factory in stripe-offers-provider.js, bekommt vorhandenen SDKclient, guarded,testObject,id,idem):
- `createOfferCoupon({offer,quantity=1}) -> {couponId}`; eindeutige ID je OfferVersion/Menge; keineredeem_by am Coupon, damit bestätigte Zukunftsrabatte nicht vor Start ungültig werden.
- `createOfferPromotion({offer,quantity,customerId,couponId,reservationEndsAtMs}) -> {promotionCodeId}`; API2026promotion{type:'coupon',coupon}, kundengebunden, maximal1Einlösung für diesen Kunden/Code, keine öffentliche ungebundene Variante. Codevalidierung bleibt GradeCrew vor Checkout, kein beliebiges Stripecodefeld.
- `retrieveOfferCoupon(couponId) -> authoritative coupon` für Preis-/Dauerkontrolle.
- `scheduleOffer({amendmentId,subscriptionId,customerId,priceId,offer,couponId}) -> {scheduleId,effectiveAtMs,discountStartsAtMs,discountEndsAtMs|null}`. Nur eindeutige unveränderte Pilotabos, keine fremden existierenden Schedules überschreiben. Aus vorhandenem Abo migrieren; laufende Phase komplett erhalten, nächste Phase gleicher Preis/gleiche Menge, proration none. Neue Phase läuft bis zum Ende einer vollen Jahresperiode (12Monate für Monatstarif,1Jahr für Jahrestarif) und release; Couponlaufzeit separat, kein vorzeitiger Jahresneustart. Originalcoupon once/repeating/forever muss nach Freigabe korrekt gelten.
- `retrieveInvoice` expandiert actual SDK23 `discounts.source.coupon` und `discounts.promotion_code`, normalisiert weiterhin exakte Decimalmengen. Kein erfundener alter coupon-Feldpfad.

### Task 1: Kontoseite, klare Bereiche und Rücksprung

Files: billing-panel.mjs/css, billing-school-panel.mjs, app.js, index.html, passende billing-UItests; providerreturnAddress wird im Provider-Task korrigiert.

- [x] RED: Gratisstatus kompakt, Tarifauswahl zuerst geschlossen, Monats/Jahresumschalter, Rechnungen und Schule separat; direkter Einladungs-/Stripe-Rücksprung öffnet richtigen Bereich. Laufendes Abo bietet keine zweite Subscription.
- [x] Bestehende paintBillingPanel-Signatur erhalten, neue Funktionskomponenten fokussiert auslagern. Schulen erst aktiv mounten, ticket/account-Wechsel weiter abweisen. Unterschiede Lehrer vs Schuladmin vs Plattformadmin behalten.
- [x] GREEN: `node --test billing-client.test.mjs billing-product-flow.test.mjs billing-payments-ui.test.mjs billing-school-panel.test.mjs school-join-code-panel.test.mjs` sowie neue UX-Tests. Erwartung: PASS; Commit.

### Task 2: Reiner Angebotsvertrag und rabattierte Rechnung

Files: functions/lib/billing/domain/offers.js, domain/stripe-contracts.js, functions/test/billing-offers.test.js und vorhandene Vertragstests.

- [x] RED: Prozentrechnung/Euro/Schulbasis mit20Plätzen; Zeitfenster/Berliner Sommerzeit, Dauer once/months/forever, unberechtigte0%-/negativeDaten. Invoicevarianten:1200statt1500mitgenehmigtem20%-Coupon, unbekannterCouponabgewiesen,0nurmitgenehmigten100%,expirykeinevorzeitigeJahresrechnung, alteNormaltarifverträgeunverändert.
- [x] `normalizeOffer(input)`, `offerAmount(offer,{unitAmount,quantity})`, `offerWindow(offer,at)`, `discountForInvoice(order,invoice,expandedCoupon)` implementieren. ExakteCentrechnung, Integerprozent. Höchstens1Rabatt, Providerdiscount-Bindung samt IDs/Start/End/Couponparametern prüfen; nach Rabattende wieder Basisbetrag.
- [x] GREEN: `node --test functions/test/billing-offers.test.js functions/test/billing-stripe-contracts.test.js`; Commit.

### Task 3: Stripe-Adapter, Couponversionen und nächste Aboperiode

Files: functions/lib/billing/stripe-offers-provider.js, stripe-provider.js, functions/test/billing-offers-provider.test.js, bestehender Providertest.

- [x] RED anhand echtem gepinnten SDK/HTTPtransport: aktuelle promotion-Neststruktur, Preis-/Dauer-/Kundentestbindung, verloreneAntwortIdempotenz, Schedules mit voller alterPhase, Jaarabo3Monatsrabatt und ohnevorzeitigenAbrechnungsanker, fremdeSchedulesabgewiesen. Rücksprung URLs immer workspace.html plus billing=return/cancel bzw account=... .
- [x] Feste Ports implementieren, bestehende gängigen Baselineaufrufe nicht ändern. PaymentCheckout und schoolInvoice übernehmen ausschließlich übergebene servergenehmigte Rabatt-IDs und fixeCheckoutfrist. `retrieveInvoice` authoritative expandeddiscounts.
- [x] GREEN: alte+neueProvider-/HTTPtests, Syntax/Lint; Commit.

### Task 4: Transaktionale Verwaltung, Quotes und Reservierungen

Files: functions/lib/billing/offers.js, application.js minimale Verdrahtung, payments.js, handlers.js/payment-callables.js/runtime.js, neue echte Emulatorfälle.

- [x] RED: fremde/alteAdminauth abgewiesen; privateTargetsbleibenprivat; Versionimmutable, nur aktive+bestätigt synchronisierte Angebote kaufbar; öffentliche Überschneidungen atomar verweigern, gleicherKaufzählt1, globaleCodesmitkundengebundenenProviderobjekten, Limitkonkurrenz, verloreneProviderantworterneutbedienbar, Quoteexpiry+Eigentümer, Teilzahlungsbetragunverändert.
- [x] Storecollections billingV2Offers/OfferQuotes/OfferReservations/OfferAmendments/Audit; Rechte ausschließlich Adapter. Aktionsverträge oben. Sperren/Anzahl transaktional und genau beim verifizierten Kauf committen; Checkoutexpired authentisch verarbeiten und reservierteAnzahlfreigeben, keineBestellungdoppelt.
- [x] Quotebindung/aktualisierteRechnungsprüfung inpayments. Genehmigte100%-Rechnungen erlauben vollständigePeriode; Guthaben-/Fremd-/OffStripefälleabweisen. BestehenderNormalpreisfallbleibtgleich.
- [x] BestehendeAbovorschau nur gebundene eigene persönlicheAbos,5minSnapshot mit allenbetrroffenenIDs/Preis-/Perioden undexplizitemZiel. Anwendung peridempotenterEinzelaufgabe/Schedule, keinBulk ohnevorherigeVorschau. Cancel-/Zeitdrift failclosed und erneuteVorschau. Alte Preisperiodenbeibehalten.
- [x] GREEN: gesamte serielle Billing/Auth/Rules-Emulatorgruppe plus neueCases. Erneuerte1InvoicevatunknownbleibtStageanahme; Commit.

### Task 5: GradeCrew-Angebotsverwaltung und kundenbezogene Preisvorschau

Files: neue billing-offers-admin.mjs, billing-offer-picker.mjs, billing-panel/client/app.js minimale Verdrahtung, tools/build-staging.mjs, UItests.

- [x] RED: AdminformularProzent/Euro/Schulbasis/Zeitzone/Dauer/Ziele/Code, readonlySyncfehler stattfalscherErfolg; teacher/schooladminsehenkeineManagementaktionen. KundentarifzeigtquoteIDausServer, spätereNormalpreise undJahresvergleich33% korrekt, keineprivateTargets. Konflikt/abgelaufenFehlerrückgabeändertkeineFreigabe.
- [x] Ein separates Verwaltungspanel mit Entwurf/Veröffentlichen/Beenden/Bestandsabovorschau; keine neuen öffentlichen Skriptaufrufe auf privateRecords. Kundencode inGradeCrewTarifauswahl prüfen, keinefreieCouponIDausClient anStripe.
- [x] GREEN: relevante UI/Client/realPath-Tests und lokalerBuild. Desktop+Mobile in eigener synthetischerBrowseransicht prüfen, keinePasswörterabfragen/auslesen; Commit.

### Task 6: Gesamtreview, veröffentlichter Teststand und reale Abnahme

- [x] Neue Gesamtänderung abae53813f von frischem Reviewer bewerten; ReviewFocus abdecken. Wichtige Befunde in einer RED→GREENKorrekturrunde, kleineReste ausdrücklich dokumentieren. Kein behaupteter Test allein aus Reviewertext.
- [x] AktuelleCloudsources aller tatsächlich zuänderndenEndpunkte lesen; neuepayment-/pilot-Source gezieltpatchen undQuell-/IAMkonfigurationerhalten. Keine18KIhandlererneutdeployen, wennderenSchreib-/Rechteschnittunverändertist.
- [x] EigeneVorschau undgeprüfteZahlungsdienste veröffentlichen, Hashes/Revisionen/negativeZugriffe undsignierteEventsprüfen. VorhandenesStripewebhookEventcheckout.session.expired beiBedarfgezieltergänzen, Geheimnisbeibehalten. KeineBeispielrabatteöffentlichaktivieren.
- [ ] FürAdminCloudabnahme erst fertigeprüfbareOberfläche, dannkonkretesvorhandenesAdmin-Kontobenennen/freigeben; keineglobalRoleteacherÄnderung. Unabhängig davonKundenseitefertigstellen/veröffentlichen. Realzahlungen/Premium/Verlängerung/Schulteilzahlungeninkl10+20noch20offenweiteroffen, bisNachweisevorliegen.
