# Angebote und kompakte Kontoseite – Teststand vom 19. November 2026

Martin hat den Entwurf vom 18. November ausdrücklich für die getrennte Testumgebung freigegeben. Dieser Stand betrifft ausschließlich das Projekt `gradecrew-staging-2026`, den eigenen Vorschaukanal `billing-product` und das bereits verbundene Stripe-Testkonto. `gradecrew.de`, der kanonische fremde Vorschaukanal, bestehende Firmenkonten und Schlüssel bleiben unverändert.

## Bedienung

Die Kontoseite trennt **Mein Zugang**, **Rechnungen**, **Meine Schule** und die nur für berechtigte Administratoren sichtbare **Angebotsverwaltung**. Tarife und Schulbeitritt sind zunächst eingeklappt. Persönliches Premium kostet im Test 15 € monatlich oder 120 € jährlich im Voraus, entsprechend 10 € monatlich. Der Jahresvergleich zeigt 60 € bzw. rund 33 % Ersparnis gegenüber zwölf Monatszahlungen. Eine tatsächliche Aktion zeigt zusätzlich den roten Angebotspreis, den Vergleichspreis, die Rabattwirkung und den späteren Normalpreis. Es werden keine erfundenen Aktionen automatisch veröffentlicht.

Administratoren können Entwürfe für alle berechtigten neuen Käufe, bestimmte Personen/Schulen oder einen Aktionscode erstellen. Namen und E-Mail-Adressen dienen der Auswahl. Prozent, Eurobetrag, Einlösezeitraum in Europe/Berlin, Wirkung auf die erste Rechnung, eine Monatsdauer oder ausdrücklich dauerhaft sowie eine Einlösegrenze sind getrennte Felder. Ein fester Schulrabatt benötigt ausdrücklich die Basis je Lehrkraftplatz oder gesamte Rechnung. Veröffentlichen und Beenden sind eigene Schritte; Änderungen erzeugen eine neue Version. Kostenlose Premium-Freigaben für Kollegen bleiben unabhängig davon bestehen.

Laufende persönliche Abos benötigen eine gesonderte Vorschau mit betroffenen Konten, Preis und konkretem Wirksamkeits-/Enddatum sowie einen begründeten Auftrag. Änderungen wirken erst ab der nächsten noch nicht abgerechneten Periode. Offene oder teilweise bestätigte Aufträge behalten ihre Anfragekennung und können auch nach Ablauf der ursprünglichen Vorschau erneut abgeglichen werden. Ein erneutes Öffnen der Verwaltung zeigt solche offenen Aufträge wieder an.

## Verbindliche technische Regeln

- GradeCrew prüft die Preisvorschau, Zielgruppe und Kapazität serverseitig. Browserpreise und vom Browser genannte Couponkennungen schaffen keinen Zahlungsanspruch. Keine Stapelung mehrerer Rabatte.
- Ein persönliches Angebot ersetzt für die Auswahl die allgemeine Werbung. Ein bewusst eingegebener Code ist eine ausdrückliche Alternative. Mehrere gleichzeitig zugewiesene persönliche Angebote müssen zunächst geklärt werden.
- Eine Bestellung bindet ihre ursprüngliche Vorschau. Eine neue abweichende Vorschau darf nicht stillschweigend zu einem älteren Checkout mit anderem Preis führen. Eine frisch geladene Vorschau mit nachweislich denselben Konditionen darf den ursprünglichen Checkout wieder öffnen; die ursprüngliche Bestellung bleibt unverändert.
- Stripe erhält bei Codes ausschließlich die kundengebundene Promotion. Der geschützte Auftrag behält Coupon und Promotion für die spätere Prüfung der tatsächlichen Rechnung. Schulcodes erhalten eine einmal gespeicherte Frist.
- Veröffentlichungen reservieren ihren Zeitraum auch bei unklarer Providerantwort. Die letzte Bestätigung prüft Überschneidungen und die aktuelle Administratorberechtigung erneut.
- Deterministische Coupons werden abgerufen und vollständig geprüft. Wiederholungen hängen nicht von Stripes zeitlich begrenztem Idempotenzspeicher ab.
- Ein abgebrochener Checkout gibt einen Rabattplatz erst nach dem verifizierten Ablauf oder einem vollständigen Abgleich ohne vorhandene Session frei. Ein zeitlich begrenzter Aufrufschutz verhindert die Freigabe während eines laufenden Erstellversuchs. Der nächste Kauf kann einen abgelaufenen Vorgang ebenfalls abgleichen, wenn das Ablaufereignis verspätet eintrifft.
- Für zukünftige Aboänderungen werden die genehmigte Absicht und die Providerbindung vor der wirksamen Änderung dauerhaft gespeichert. Eine verlorene Antwort kann nach dem Periodenwechsel anhand des tatsächlichen Schedules abgeglichen werden, bevor die Folgerechnung geprüft wird. Nur die bestätigte Rechnung gewährt den bezahlten Zugang; wiederholte Ereignisse schaffen keine zusätzlichen Perioden.
- Ein bestehender eigener Checkout-Rabatt kann unter Erhalt seiner laufenden Wirkung in einen Schedule überführt und ab der nächsten Abrechnung ersetzt oder entfernt werden. Fremde/mehrdeutige Verträge bleiben gesperrt.
- Bezahlte Schulverträge speichern eine fortgeltende Rabattvereinbarung. Eine weitere ausdrücklich bestätigte Jahresperiode berücksichtigt diese Zusage auch nach Ende der Werbeaktion. Die Laufzeit beginnt nicht erneut und zählt nicht als weitere Einlösung. Eine allgemeine selbstbedienbare Schulverlängerungsfunktion bleibt ein separater Arbeitspunkt.
- Bekannte, autorisierte 100-%-Rechnungen dürfen freischalten. Beliebige Nullbeträge, Guthaben und außerhalb von Stripe manuell quittierte Beträge bleiben ausgeschlossen. Bestehende bezahlte und teilweise bezahlte Rechnungen werden nicht umgeschrieben.
- Zahlungen zu Normalpreisen bleiben möglich, wenn neue Aktionen nicht freigegeben sind. Jede Gratisphase bleibt 14 Tage und höchstens fünf Neuanlagen; Löschen erstattet nichts.

## Prüfung und verbleibende Abnahme

Der unabhängige Review des unveröffentlichten Stands fand einen kritischen und neun wichtige Integrationsfehler. Die Korrekturen sind mit reproduzierenden Prüfungen nachgewiesen: 590/590 Serverfälle, 115/115 serielle lokale Datenbank-, Anmelde-, Rechte-, Zahlungs- und Altpfadprüfungen sowie 60/60 Oberflächenprüfungen bestanden. Syntax, Lint und Prüfung auf fehlerhafte Änderungen sind ebenfalls grün. Lokale Transaktions- und SDK-Transporttests sind ausdrücklich kein Beleg für eine tatsächlich durch Stripe abgerechnete PayPal-Verlängerung oder einen echten Überweisungsabgleich.

Vor der endgültigen Abnahme fehlen noch:

1. Ein ausdrücklich freigegebenes Administratorkonto für die neue Verwaltung in der getrennten Testumgebung. Der offizielle Testbenutzer ist bislang eine Lehrkraft und wird nicht automatisch hochgestuft. Die Auswahl ist bei Martin angefragt.
2. Der vollständige angemeldete Zahlungstest des neuen Produktwegs: PayPal-Erstzahlung und Folgeperiode; Schulrechnung zum tatsächlichen Testpreis mit 10 € und 20 € Teilzahlung, danach noch 20 € offen und erst nach vollständiger Zahlung freigeschaltet.
3. Die endgültige Rechnungsdarstellung mit Logo, rechtlichen Verkäuferangaben, Umsatzsteuerangaben, Rechnungsnummern und kontrolliertem Versand. In dieser Runde werden keine Kunden-E-Mails verschickt.
4. Buchhaltungsanbindung, DATEV-/anderer Export, Aufbewahrung, Mahn-/Erstattungsregeln und die steuerliche Inbetriebnahme. Die Zahlungsanbindung übernimmt diese Schritte nicht automatisch vollständig.
5. Der spätere breitere Rollout: indexierte Suche für mehr als 100 freigegebene Zielkonten, echte Schulverlängerungsbedienung, größere Nutzerabnahme und eigene Live-Freigabe.

Kleiner zurückgestellter Reviewpunkt: Bereits ausgestellte ältere Rücksprunglinks auf `/?billing=return` bzw. `/?billing=cancel` erhalten noch keine zusätzliche Weiterleitung. Neu ausgestellte Zahlungs- und Rechnungsverwaltungslinks führen bereits direkt in den Arbeitsbereich.

## Veröffentlichungsnachweis

Veröffentlicht ist Commit `6ad3367d7564658f3385827c376f27b280c65f56` auf [der eigenen GradeCrew-Testseite](https://gradecrew-staging-2026--billing-product-uiwqa85y.web.app/workspace.html?intent=login). Die zehn kritischen ausgelieferten Dateien stimmen mit dem Build überein; der Build enthält 225 Dateien. Eigene Hostingversion: `b007208e3e47b0f1`. Der kanonische Testkanal ist unverändert `4916e09a92376424`.

Die drei geprüften Dienstrevisionen sind `billingpilot-00003-kog`, `billingpayments-00002-rux` und `billingstripewebhook-00002-tud`. Für jeden Dienst wurden alle 172 tatsächlich verwendeten Quelldateien mit dem gesicherten Commit verglichen. Einstellungen, vorhandene Geheimnisbindungen und Aufrufrechte blieben erhalten. Die 51 weiteren bestehenden Schreib-/Altpfade wurden lesend auf unveränderte Quellen und Konfiguration geprüft.

Nur `payments.offersReady` wurde in der geschützten Testkonfiguration aktiviert. Am vorhandenen Stripe-Testeingang ist zusätzlich `checkout.session.expired` angemeldet; bestehende Adresse und Signiergeheimnis sind erhalten. Die drei unberechtigten Aufrufe liefern weiterhin 401/401/400. Ein signiertes Ereignis ohne Zahlungswirkung erzeugt genau einen unveränderten Beleg bei Wiederholung. Die öffentliche Angebotsliste ist leer; es wurde keine Beispielaktion aktiviert. Das offizielle Testkonto behält seine Lehrkraftrolle.

Dieser Veröffentlichungsnachweis bestätigt die bereitgestellte Oberfläche und ihren technischen Anschluss. Er ersetzt nicht die oben offenen angemeldeten Verwaltungs- und Zahlungstests. Der maschinenlesbare Nachweis steht in [evidence/2026-11-19-offers-checkpoint.json](evidence/2026-11-19-offers-checkpoint.json).
