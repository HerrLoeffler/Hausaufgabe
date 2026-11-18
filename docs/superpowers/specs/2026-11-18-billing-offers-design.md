# GradeCrew: übersichtlicher Zugang und steuerbare Angebote

Stand: 18. November 2026. Aufgabe: GC-BILLING-PLAN-01, Ergänzung nach Martins Rückmeldung zur veröffentlichten Zahlungstestseite. **Von Martin ausdrücklich zur Umsetzung in der Testumgebung bestätigt. Noch keine neue Preisaktion veröffentlicht.**

## Auftrag und bestätigte Entscheidungen

Die jetzige Kontoseite ist für Martin zu unübersichtlich. Status, Tarife, Rechnungen, Schulverwaltung und Schulbeitritt stehen zu groß untereinander. Er möchte Preiswerbung mit sichtbaren Rabatten sowie jederzeit steuerbare Aktionen für alle oder einzelne Personen; zuvor wurden bereits Aktions-/Influencercodes mit begrenzter Rabattdauer gewünscht.

Martin hat ausdrücklich gewählt: **Rabatte direkt in GradeCrew verwalten; Stripe rechnet im Hintergrund ab.** Bisherige Entscheidung „Rabattcodes später“ wird deshalb für diese neue Priorität vorgezogen. Kostenlose Premiumfreigaben für Kollegen bleiben eigenständige Freigaben ohne Rechnung und werden nicht in Rabattabos umgewandelt.

Unveränderte Grundtarife: 15 € monatlich oder 120 € jährlich im Voraus, Schule 50 € je Platz/Jahr, brutto. 14 Tage und höchstens fünf neu angelegte Dateien kostenlos; jede Neuanlage zählt, Bearbeitung nicht, Löschen erstattet nichts. Kein automatischer kostenpflichtiger Übergang. Schuljahresvertrag zwölf Monate ab vereinbartem Start, Verlängerung bewusst bestätigen.

Ausschließlich eigener Testkanal und vorhandene Stripe-Sandbox. Kein Liveverkauf, keine Livepreise, keine neuen Konten/Schlüssel. Die aktuelle Zahlungstest-Konfiguration gilt genau für das vorhandene freigegebene Testkonto. Ihre Begrenzung wird für die neue Funktion nicht auf weitere Konten ausgeweitet.

## Betrachtete Wege

1. **GradeCrew-Verwaltung mit Stripe als Zahlungsdienst — gewählt.** Eine Oberfläche für Angebotstext, berechtigte Zielgruppe und Abrechnung. Mehr Implementierung, dafür keine manuell auseinanderlaufenden Preise in Website und Checkout.
2. **Zunächst Stripe-Dashboard.** Weniger eigene Verwaltungsoberfläche, aber Wechsel zwischen Systemen und zusätzlicher Abgleich der Werbeanzeige. Martin hat diesen Weg nicht gewählt.

Eine rein optische Preisänderung wäre kein vollständiger Rabatt: Rechnung, Zahlung und Zugangsprüfung müssen dieselbe vereinbarte Ermäßigung verwenden.

## Kundenansicht: kompakt und auf die eigene Situation begrenzt

Die bestehende GradeCrew-Gestaltung (hell, blau, vorhandene Schriften und Komponenten) bleibt die Basis. Keine neue Designsprache oder große Dekoflächen.

- **Mein Zugang:** kompakte Statuszeile mit Ablaufdatum und „5 von 5 Tests übrig“. Eine klare Hauptaktion „Premium ansehen“ bei Gratiszugang bzw. „Abo verwalten“ bei bestehendem Abo. Detaillierte Zählregeln hinter „Details zur Testphase“ statt als permanenter Absatz.
- **Tarifauswahl erst nach Öffnen:** Umschalter monatlich/jährlich, ein gut lesbarer Hauptpreis, tatsächliche Abbuchung und nächster Normalpreis. Jährlich: „10 €/Monat, 120 € jährlich im Voraus“; „60 € weniger als zwölf Monatszahlungen“ bzw. 33 % Jahresvorteil mit expliziter Vergleichsbasis 12 × 15 €. 180 € wird nicht als früherer Jahrestarif ausgegeben.
- **Rechnungen:** eigene Ansicht für persönliche Belege und Link zum geschützten Stripe-Portal. Die UI zeigt lesbare Rechnungsnummern. Schulrechnungen bleiben mit der Schule und ihrer Rechnungsrolle verbunden.
- **Meine Schule:** aktuelle Schulzuordnung und Belegung. Erst nach Öffnen Verwaltungsaktionen oder ein separates Beitrittsformular. Bei einer zugeordneten Schule bleibt „Weiterer Schule beitreten“ eine Nebenaktion. Schulcode und persönlicher Einladungslink sind getrennte Optionen und standardmäßig eingeklappt.
- Einladungslinks und Stripe-Rücksprünge öffnen direkt den relevanten Bereich. Laufende Anfragen, Kontoänderung und Fokusaktualisierung behalten die bestehenden Schutzmechanismen. Mobile Ansicht ohne breite Preis-/Verwaltungskarten.

Werbung bleibt auf Stellen beschränkt, an denen ein Kauf sinnvoll angeboten wird: Preisseite, geöffnete Tarifauswahl und gegebenenfalls ein kleiner Hinweis am Ende des Gratisguthabens. Keine neue Werbeplattform oder Anzeigen Dritter.

## GradeCrew-Administration: Angebote & Rabatte

Nur berechtigte Plattformadministration, bestätigte E-Mail und frische Anmeldung für Änderungen. Ein Schuladmin darf keine globalen oder fremden Rabatte vergeben. Vorhandene Kollegenfreigaben bleiben eine getrennte Verwaltungsaktion.

Eine Aktion besitzt:

- internen Namen und separat freizugebenden kurzen Kundentext;
- Ziel: öffentliches Angebot für berechtigte Neuabschlüsse, bestimmte bestehende Konten/Schulen oder ein Aktionscode;
- Tarifbindung: monatliches Premium, jährliches Premium oder Schulplatz/Jahresvertrag; bei Schule Auswahl des Rechnungskäufers statt einzelner persönlicher Lehrkraftkunden;
- prozentualen Nachlass (bis 100 %) oder festen Eurobetrag in EUR; der Preis wird nie negativ;
- bei einem festen Schulrabatt ausdrücklich die Berechnungsbasis „je Lehrkraftplatz“ oder „gesamte Jahresrechnung“. Diese Auswahl ist bei Schulen verpflichtend, ohne verdeckten Standard. Beispiel bei 20 Plätzen: 10 € je Platz ergibt 800 €; 10 € auf die Gesamtrechnung ergibt 990 €. Das ist ein vorgeschlagenes Verwaltungsfeld, keine bereits aktivierte Preisregel;
- **Einlösefenster** mit Beginn und Ende in Europe/Berlin, optional begrenzter Anzahl und Neukundenbeschränkung;
- davon getrennte **Rabattwirkung nach Einlösung**: erste Rechnung, definierter Zeitraum oder ausdrücklich dauerhaft; tatsächliche Datumsgrenzen und der spätere Normalpreis werden angezeigt;
- Zielgruppe/privat zugewiesene Konten bzw. kundenspezifischer Code; vorhandene GradeCrew-Konten können vor ihrem ersten Stripe-Kauf bereits eine Zuweisung erhalten;
- Entwurf, geplant, aktiv, beendet und technische Synchronisationszustände;
- unveränderliche Version, Änderungsgrund und Auditbeleg ohne Rohdaten von Zahlungen.

Die Verwaltung zeigt eine Vorschau aus Kundensicht, den regulären Preis, Nachlass und geschuldeten Betrag sowie den betroffenen Empfängerkreis. Massenänderungen zeigen Anzahl, Beginn und Folgepreis vor der Ausführung. Keine automatische Anwendung eines neuen öffentlichen Angebots auf alle laufenden Verträge.

### Vorgeschlagene Betriebsregeln (vom Implementierer vorgeschlagen)

1. Öffentliche Aktionen gelten für neue Käufe. Für bestehende Abos gibt es eine ausdrückliche Auswahl einzelner oder aller berechtigten Abos; Änderungen greifen standardmäßig ab der nächsten noch nicht abgerechneten Periode. Keine automatische Erstattung, Gutschrift oder Änderung bereits bezahlter Zeiträume.
2. Rechnungen mit begonnenen Teilüberweisungen und abgeschlossene Kaufaufträge behalten ihren vereinbarten Betrag. Die laufende 50-€-Testrechnung darf nicht durch eine spätere Aktion umgerechnet werden.
3. Ein Rabatt je Kauf/Periode. Pro Tarif kann höchstens eine öffentliche Aktion im selben Einlösezeitraum aktiv sein. Persönliche Zuweisungen und Codes müssen bei Konflikt vor der Aktivierung bzw. Anwendung ausdrücklich aufgelöst werden; kein stilles Stapeln und kein automatisches „bestes Angebot“ nur anhand der ersten Rechnung.
4. Beenden einer Aktion stoppt neue Einlösungen. Bereits zugesagte Rabatte behalten ihre vereinbarte Laufzeit. Vorzeitiges Entfernen eines laufenden Rabatts ist ein gesonderter, begründeter Verwaltungsvorgang mit sichtbarer Vertragswirkung; keine pauschale sofortige Preiserhöhung durch den Schalter „Aktion beenden“.
5. Einlösefrist und Rabattlaufzeit sind getrennt. Drei Monate bedeutet einen datierten Zeitraum, nicht automatisch drei Rechnungen. Bei Jahresabrechnung zeigt die Vorschau explizit, auf welche Jahresrechnung der Nachlass wirkt. Es gibt keine ungeprüfte Rückdatierung oder stille Umrechnung von Monaten in Rechnungsanzahlen.
6. Aktionspreise werden bei Beginn eines Checkout-Vorgangs an die konkrete Bestellung und ihre ausgewiesene Reservierungsdauer gebunden. Änderungen einer Aktion ändern offene Bestellungen nicht still. Vor dem Kauf wird die Preisbindung inklusive Ablauf gezeigt; Stripe-Mindest-/Höchstdauer von Checkout und auslaufende Codes werden im Plan konkret aufeinander abgestimmt.
7. 100-%-Rabatte sind nur mit ausdrücklicher autorisierter Regel gültig. Eine entsprechend korrekt ausgestellte Null-Euro-Rechnung kann eine freigegebene Periode begründen; eine willkürliche Null-/Guthaben-/Off-Stripe-Rechnung darf das weiterhin nicht.

## Umsetzung im bestehenden Zahlungsmodell

Aktuell bindet `normalizeInvoice` den Rechnungsbetrag streng an Standardpreis × Menge. Das absichtlich enge Modell lehnt Rabatte ab. Daher darf das Aktivieren eines Eingabefelds für Stripe-Codes nicht der gesamte Implementierungsschritt sein.

- GradeCrew speichert Aktionen, Zuweisungen und veröffentlichte Versionen serverseitig. Stripe-Coupons/Promotioncodes bilden die tatsächliche Abrechnung ab. Erst nach bestätigter Synchronisation darf ein öffentliches Angebot kaufbar erscheinen.
- Öffentlich sichtbare Daten enthalten nur angebotene Tarife und geeignete Werbeinformationen, keine private Zielkundenliste oder Verwaltungsdaten. Jede Berechtigung wird beim Kauf erneut serverseitig geprüft.
- Neue Verwaltungsaktionen verwenden eigene Aktionen/Module unter vorhandener Authentisierung. Stripe-Schlüssel bleiben ausschließlich am Zahlungsadapter. Der normale Kontodienst erhält keine Stripe-Secrets; administrative Zahlungsaktionen laufen über den bestehenden geschützten Zahlungsdienst.
- Die aktuelle freigegebene Testidentität ist global `teacher`, nicht Plattformadministrator. Die geschlossene Pilotliste wird nicht still erweitert und die Rolle nicht automatisch erhöht. Neue Adminfunktionen zunächst lokal mit berechtigten/unberechtigten Identitäten prüfen. Für eine spätere authentifizierte Cloud-Abnahme der Verwaltung muss ein vorhandenes separates Administratorkonto konkret benannt und für genau diesen Test ausdrücklich aufgenommen werden; keine neue Identität oder globale Rollenänderung aus diesem Entwurf ableiten.
- Vorgänge haben stabile Idempotenzkennungen. Provideraufrufe außerhalb lokaler Datenbanktransaktionen; Wiederaufnahme nach verlorener Antwort. Veröffentlichung, technische Synchronisation und tatsächliche Anwendung auf vorhandene Abos sind getrennte Zustände.
- Stripe-Coupons sind nach Veröffentlichung bezüglich ihrer Rabattwerte nicht frei editierbar. Eine Änderung erzeugt eine neue GradeCrew-Version und passende neue Providerobjekte; alte Zusagen bleiben nachvollziehbar.
- Bestellungen und wiederkehrende Vertragsvereinbarungen speichern Grundpreis, autorisierte Rabattversion, Providerbindungen, Laufzeit und vereinbarten Zahlungsbetrag. Mehrere einzelne Folgerechnungen dürfen denselben Grundtarif mit unterschiedlichen, begründeten Rabattzeiträumen verwenden.
- Die Rechnungsprüfung kontrolliert tatsächlichen Käufer, Tarif/Menge, Periode, autorisierten Rabatt und resultierenden Gesamt-/Restbetrag. Bestehende Prüfungen für Fremdkunden, Liveobjekte, Prorationen, nicht genehmigte Gutschriften und manuelle Off-Stripe-Quittierung bleiben erhalten.
- Bezahlter oder regelkonform kostenloser Zeitraum wird erst nach autoritativ geprüftem Rechnungsvorgang zu einer Zugangsquelle. Erfolg im Browser und `checkout.session.completed` allein reichen weiterhin nicht. Nach Rabattende erfolgt die nächste Rechnung zu den vertraglich gezeigten Konditionen, ohne verbleibende bezahlte Rechte abzuschneiden.
- Schulpreis, vereinbarte Periodensumme und Teilzahlungsabgleich müssen bei einem neu autorisierten Rabatt dieselbe Preisgrundlage verwenden. Bestehende Rechnungs-/Periodenbelege bleiben unverändert.
- Kostenlose Kollegenfreigaben bleiben das bestehende manuelle Berechtigungsmodell. Technische Testwerte, tatsächliche Rabattbelege und echte Rechnungspflichten werden nicht vermischt.

## Darstellung und Preiswerbung

Ein aktiver Rabatt darf einen belegbaren Vergleichspreis, einen roten Angebotspreis, Prozent-/Eurovorteil und seine Bedingungen zeigen. Farbe ist ein Akzent, keine ganze Alarmfläche. Der Preis nach Rabattende und die tatsächliche Abrechnungsfrequenz bleiben unmittelbar sichtbar.

Ein noch nicht eingeführter höherer Tarif wird nicht als früher verlangter Preis dargestellt. Allgemeine Preiswerbung muss nach § 5 UWG wahr und belegbar sein. § 11 PAngV formuliert die spezielle 30-Tage-Regel für Waren; sie wird hier nicht pauschal als Rechtsregel für jedes Softwareabo behauptet. Ob spätere konkrete Angebote weitere Pflichten auslösen, wird vor Liveveröffentlichung anhand des konkreten Angebots geprüft. Im Entwurf gezeigte Beispielrabatte sind keine aktivierten Aktionen.

## Validierung und Reihenfolge

1. Den freigegebenen UX-Entwurf als kompakte Kundenansicht umsetzen; bestehende Status-, Schulcode-, Einladungs- und Rechnungsfunktionen erhalten. Screenprüfung mobil und Desktop.
2. Serverseitiges Aktions-/Zuweisungsmodell, Adminoberfläche und Stripe-Synchronisation mit Ablauf-/Idempotenznachweisen implementieren.
3. Geprüfte rabattierte und Null-Euro-Rechnungsverträge einschließlich Folgerechnungen, Rabattende, Ausfall und manueller Prüfaufgaben ergänzen. Öffentliche und private Angebote erst danach freischalten.
4. Testmatrix: öffentlicher Rabatt, persönlicher Nachlass, Code/Limit/Ablauf, falsches Konto, Mengen-/Währungs-/Betragsabweichung, 100 %, verlorene Providerantwort, Konflikt, Ende eines Einlösefensters bei laufendem Rabatt, Monats-/Jahreswechsel sowie Schule mit Teilzahlungen. Rechteentzug für fremde Quellen weiterhin abweisen.
5. Eigene Testvorschau publizieren, aktuelle Cloudquellen bewahren. Reguläres angemeldetes Konto und echte Stripe-Sandboxereignisse für Erstzahlung/Folgeperiode/Schulteilzahlungen prüfen. Der bisher bestätigte normale Login und Gratisstatus sind bereits dokumentiert; Zahlungsnachweise stehen noch aus.

Die einzelnen Umsetzungspakete werden nach Bestätigung konkret geplant. Die aktuelle funktionierende Testanbindung wird durch diesen Entwurf nicht deaktiviert, und es wird noch keine Aktion, Rechnung oder Preisänderung ausgelöst.

Zusätzlicher bereits beim Lesen belegter Abnahmefall: Der aktuelle Stripe-Adapter setzt Rücksprungadressen auf `/`; die dortige öffentliche Homepage leitet den Parameter `billing` bisher nicht zur eigentlichen `/workspace.html` weiter. Auch das Portal verwendet die Wurzeladresse. Vor einem tatsächlichen Checkout muss dieser Rücksprung in die Abrechnungsansicht reproduzierend geprüft und korrigiert werden. Die Preis-/Statusanzeige vor dem Kauf war erfolgreich, ein vollständiger Zahlungsrücksprung wurde bisher ausdrücklich nicht als bestanden ausgegeben.

## Begrenzte Entwurfsprüfung

Ein frischer technischer Planungscheck hat eine wichtige Unklarheit gefunden: feste Schulrabatte könnten pro Platz oder auf die gesamte Rechnung gemeint sein. Der Entwurf löst das durch die oben vorgeschlagene ausdrückliche Berechnungsbasis, damit Martin beide Fälle steuern kann. Keine weiteren wichtigen Planungsfragen wurden gemeldet. Das ist ein Entwurfscheck, kein Code-, Cloud- oder Zahlungsnachweis. Die zusätzliche Admin-Testidentität bleibt als gesonderte Aktivierungsvoraussetzung sichtbar.

## Quellen

- Stripe: https://docs.stripe.com/billing/subscriptions/coupons — Coupon-/Codebindung, Dauer, Kundeneinschränkungen, Ende der Einlösbarkeit und laufende Rabatte.
- Stripe: https://docs.stripe.com/payments/checkout/discounts — autorisierte Anwendung im Checkout; konkrete Variante im Implementierungsplan verifizieren.
- UWG § 5: https://www.gesetze-im-internet.de/uwg_2004/BJNR141400004.html — irreführende Preiswerbung und Belegbarkeit der Preisermäßigung.
- PAngV § 11: https://www.gesetze-im-internet.de/pangv_2022/__11.html — ausdrücklich warenbezogene Regelung.
