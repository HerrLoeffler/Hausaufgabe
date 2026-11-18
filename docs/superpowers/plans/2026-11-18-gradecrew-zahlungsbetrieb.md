# GradeCrew Zahlungsbetrieb – Einführungs- und Umsetzungsplan

Stand 18. November 2026. Aufgabe GC-BILLING-PLAN-01. Planentwurf zur fachlichen Abstimmung, keine Freigabe für Echtzahlungen oder Production.

**Übersteuernde Aktualisierung18Nov:** Martin hat die Testumsetzung gestartet. [Aktuelle Geschäftsregeln](../../billing/business-rules.md) ersetzen die früheren unbefristeten fünf KI-Tests durch14Tage und fünf neue Testdateien jeder Erstellungsart. Persönlich vorläufig15EUR monatlich oder120EUR jährlich im Voraus, Schule50EUR je Platz/Jahr. Schuleinladungen und bewusste Verlängerung bestätigt. Ältere abweichende Abschnitte dieses Ursprungsplans sind historisch und werden vor ihrer Umsetzung auf die aktuelle Regel bezogen. Keine Livefreigabe.

**Aktuelle Arbeitsliste:** [Erledigtes, nächste Testarbeiten, Entscheidungen und Einführung](../../billing/2026-11-18-aufgabenliste-zahlungsbetrieb.md). Sie führt Verantwortlichkeiten, Abhängigkeiten und Abschlusskriterien zu diesem Plan.

> Umsetzungshinweis für spätere Bearbeiter: Dieser Gesamtplan beschreibt Produktregeln und Arbeitspakete. Nach fachlicher Bestätigung wird er paketweise mit superpowers:executing-plans umgesetzt. Die unten stehenden Prüfschritte werden vor jeder Paketumsetzung auf den dann aktuellen Produktstand bezogen. Es besteht heute kein Umsetzungsauftrag.

**Ziel** ist ein zusammenhängender Zahlungs- und Lizenzbetrieb für persönliche Premium-Konten und Schulen auf gradecrew.de. Zahlungen, Nutzungsrechte, Schulplätze, Rechnungen und Mitteilungen sollen automatisch verarbeitet werden. Ausnahmen müssen sichtbar und bearbeitbar bleiben.

**Architektur** ist eine eigene GradeCrew-API mit serverseitiger Rechteprüfung, einer von Stripe getrennten Lizenzverwaltung und austauschbaren Speicher- und Identitätsadaptern. Stripe übernimmt die beauftragte Zahlungs- und Rechnungsverarbeitung. GradeCrew entscheidet über die Nutzung des Produkts.

**Technische Grundlage** für die spätere Produktintegration ist der bestehende Node-22-Backendpfad. Der bereits veröffentlichte Python-Testserver liefert einen geprüften Ablauf und Schnittstellenerfahrungen. Er ersetzt die vorhandene Produktanmeldung noch nicht. Das Ziel ist eine gemeinsame Fachlogik für Website und spätere Apps.

**Planungsgrundlage** sind die bestätigten Entscheidungen im Chat, der [Konto- und Zugangsplan](../../billing/2026-11-10-konto-und-zugangsplan.md), der [Sandboxnachweis](../../billing/sandbox-v1/receipts/2026-11-18-hosted-sandbox.json) und die unten genannten Primärquellen. Neue Vorschläge sind ausdrücklich gekennzeichnet. Die tatsächliche Implementierung folgt erst als beauftragter nächster Schritt.

**Review-Schwerpunkte** sind die Trennung von Person, Schule und Rechnungsempfänger, widerspruchsfreie Laufzeiten, konkurrierende Schulplatzbuchungen, mehrfache und verspätete Zahlungsereignisse, der Schutz laufender Prüfungen und vollständige Belegketten.

## 1. Die wichtigsten Antworten

### Wo sieht Martin die Abrechnungen?

Heute sind die erzeugten Testrechnungen im Stripe-Dashboard sichtbar. Dort zuerst ausdrücklich GradeCrew sandbox auswählen. [Rechnungen](https://dashboard.stripe.com/acct_1UYUaw1l0zkqOtXr/test/invoices), [Abonnements](https://dashboard.stripe.com/acct_1UYUaw1l0zkqOtXr/test/subscriptions) und [Kunden](https://dashboard.stripe.com/acct_1UYUaw1l0zkqOtXr/test/customers) gehören zu dieser Testumgebung. Ein abgelaufener Sitzungslink kann eine erneute Anmeldung verlangen.

Im späteren GradeCrew-Adminbereich soll es einen eigenen Bereich Abrechnung geben. Er zeigt Rechnungen, Zahlungen, Teilzahlungen, offene Beträge, Vertragszeiträume, Schulen und Bearbeitungsfälle. Finanzberichte und Belege bleiben mit dem jeweiligen Original bei Stripe beziehungsweise dem gewählten Rechnungsdienst verknüpft. Für Buchhaltung und Steuererklärungen wird zusätzlich ein abgestimmter Buchhaltungsprozess benötigt.

Lehrkräfte sehen unter Konto → Tarif und Rechnungen ausschließlich ihre eigenen persönlichen Käufe. Berechtigte Schulverantwortliche sehen unter Schule → Lizenz und Abrechnung die freigegebenen Schulbelege. Eine normale Lehrkraft erhält dadurch keinen Einblick in die Schulfinanzen.

### Gibt es die Schulzuordnung bereits?

Die geprüfte veröffentlichte Quellfassung 805cba98fc357d2926048311b7672b4fe70f1335 besitzt eine Kontenverwaltung mit Lehrkraft-/Adminrolle, Aktiv-/Sperrstatus, Testkontokennzeichnung, Archivierung und Löschabläufen. In den geprüften Kontenaktionsmodulen gibt es keine Aktion für Schulmitgliedschaft oder zahlungsabhängige Premium-Rechte. Auch ein vorhandener Schulname im Profil wäre noch keine belastbare Mitgliedschaft oder Lizenzzuordnung.

Eine vollständig nutzbare Schulverwaltung mit Mitgliedschaften, Plätzen, Verträgen, Rechnungsrollen und automatischem Lizenzende ist durch die bisherigen Nachweise **nicht belegt**. Dieser Plan behandelt sie deshalb als aufzubauenden Produktbereich. Er behauptet keine vollständige Prüfung aller historischen Entwicklungsbranches.

### Wie erhalten Schulen ein Jahr Zugang?

**Vorschlag zum Start:** Eine Schule bestellt ein Jahrespaket mit festgelegten Plätzen und einem ausdrücklich vereinbarten Zeitraum. Eine berechtigte Person erhält die Schulverwaltung. Lehrkräfte treten über persönliche, zeitlich begrenzte Einladungen bei. Nach vollständiger Zahlung und erreichtem Vertragsbeginn werden die zugeordneten Plätze nutzbar. Alle Plätze enden am gemeinsamen Vertragsende.

Beispiel: Vertrag vom 1. September 2027 bis ausschließlich 1. September 2028, 20 Plätze. Eine Lehrkraft tritt im Januar 2028 bei. Ihr Schulzugang reicht bis zum gemeinsamen Ende im September. Sie erhält durch den Beitritt kein zusätzliches Jahr.

### Verlängert sich eine Schule automatisch?

Das ist eine Vertragsentscheidung. **Empfehlung für den ersten Schulverkauf:** zwölf Monate mit ausdrücklicher Verlängerungsbestätigung. GradeCrew erinnert rechtzeitig und bereitet die nächste Bestellung vor. Eine Überweisung ist keine Erlaubnis für spätere automatische Abbuchungen.

Später kann eine Schule ausdrücklich einen Vertrag mit automatischer Folgeabrechnung vereinbaren. Auch dann sind Vertragsverlängerung, Rechnungserstellung, Zahlungseinzug und Nutzungsfreigabe vier unterschiedliche Vorgänge. Bei Überweisung muss der neue Rechnungsbetrag weiterhin eingehen. Bei einem vereinbarten automatischen Einzug braucht es eine dafür geeignete Zahlungsmethode und Zustimmung.

### Werden Rechnungen automatisch erstellt und versendet?

Das Ziel ist ja. Dafür brauchen wir hinterlegte Verkäuferdaten, Steuerregeln, Rechnungsnummern, Leistungszeiträume, Zahlungsbedingungen, Logo, Empfänger und geprüfte E-Mail-Einstellungen. Stripe unterstützt Rechnungs- und Zahlungs-E-Mails, deren Aktivierung und Vorlagen aber eingerichtet und getestet werden müssen. [Stripe E-Mail-Konfiguration](https://docs.stripe.com/invoicing/send-email)

Für öffentliche Auftraggeber muss zusätzlich geprüft werden, ob eine strukturierte E-Rechnung und ein bestimmter Übermittlungsweg verlangt werden. Ein hübsches PDF allein erfüllt diese Anforderung nicht automatisch. [BMF zur E-Rechnung](https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html)

## 2. Was nachgewiesen ist und was noch fehlt

| Bereich | Tatsächlicher Nachweis | Für den Produktbetrieb zusätzlich erforderlich |
|---|---|---|
| Stripe-Zugang | GradeCrew sandbox, livemode=false | Separater späterer Live-Auftrag, Verkäuferprüfung, Auszahlungskonto |
| PayPal | Erstzahlung und Stripe-interne Monatsverlängerung erfolgreich getestet | Verlängerung der echten GradeCrew-Rechte, Ausfälle, Kündigung und Rückerstattung |
| Schulüberweisung | 10 € plus 20 € automatisch einer 30-€-Rechnung zugeordnet | Individuelle Verträge, tatsächliche Käufer, Schulkontingente und Rechnungsrollen |
| Veröffentlichter Test | Signiertes invoice.paid schaltet zwei synthetische Testanmeldungen frei | Reguläres Login, wirkliche Lehrkräfte-UIDs und alle Produktfunktionen |
| Sicherheit des Durchstichs | Signatur, falsche Origin, anonyme Zugriffe und direkte Statusänderungen geprüft | Vollständige Autorisierung aller Produktendpunkte, Rollen und Betriebsprozesse |
| Kontenverwaltung | Kontoaktionen im bestehenden Produkt vorhanden | Schule, Mitgliedschaft, Finanzrolle, Freigaben und verständliche Tarifanzeige |
| Rechnungslayout | Früherer Logoentwurf vorhanden | Geprüfte rechtliche Daten, Originalbeleg, Versand, Korrektur und Archivierung |
| Übertragbarkeit | Testserver trennt Fachlogik und Firestore-Adapter | Produktweite Daten- und Identitätsschnittstellen, Export und Wiederherstellung |

Der Cloud-Durchstich vom 18. November ist ein Nachweis für die **erste Zahlung und anschließende Freischaltung**. Er ist keine vollständige Aboverwaltung. Insbesondere aktualisiert der bisherige produktferne Testhandler nicht sämtliche Kündigungs-, Verlängerungs- und Ausfallzustände.

Der bestehende Vorschaukanal läuft laut Nachweis am 25. November 2026 aus. Er ist kein dauerhafter Kundenendpunkt. Vor weiteren Nutzertests sind Erreichbarkeit und Ablaufdatum erneut zu prüfen. Keine Testkundendaten, Testrechnungen oder Zugangstoken werden in die spätere Liveumgebung übernommen.

## 3. Festgelegt, vorgeschlagen und noch zu entscheiden

### 3.1 Bereits von Martin festgelegt

1. Persönliches Premium und Schulangebot sollen beim bezahlten Start verfügbar sein.
2. Kostenlos gibt es einmalig fünf vollständig nutzbare KI-Tests.
3. Ein gespeicherter neuer Test verbraucht eine Einheit. Bearbeiten desselben Tests verbraucht keine weitere Einheit. Löschen gibt keine Einheit zurück.
4. Kolleginnen und Kollegen können eine kostenlose Premium-Freigabe durch die Administration erhalten. Dafür wird keine Rechnung und kein künstliches bezahltes Abo erzeugt.
5. Rabatt- und Influencercodes folgen später über Stripe.
6. Zugangsstatus muss in Website, App und Administration konsistent sein.
7. Die Architektur soll einen späteren Wechsel zu einem EU-Anbieter erleichtern.
8. Aktuell sind nur abgegrenzte Tests erlaubt. Keine Liveänderungen und keine neuen Zahlungsanbieter-Konten oder API-Schlüssel aus diesem Plan.

### 3.2 Empfohlene Startregeln, noch keine bestätigten Vertragsbedingungen

| ID | Vorschlag | Grund |
|---|---|---|
| V01 | Persönliches Premium zunächst monatlich, PayPal und Karte über Checkout | Einfacher Einstieg und geringere Komplexität bei Tarifwechseln |
| V02 | Schulvertrag zwölf Kalendermonate mit ausdrücklicher Verlängerung | Passt zu Beschaffung und verhindert unerwartete Folgeforderungen |
| V03 | Feste Schulplätze, persönliche Einladungen, gemeinsam festgelegtes Vertragsende | Kontrollierbare Zuordnung und nachvollziehbare Auslastung |
| V04 | Schulzahlung zunächst per EUR-Überweisung auf zugewiesene Stripe-Bankdaten | Bereits erfolgreich im Test erprobt |
| V05 | Schulzugang erst nach vollständiger Zahlung und erreichtem Beginn | Keine versehentliche Freigabe durch Teilzahlung |
| V06 | Persönliche Folgezahlung erhält sieben Kalendertage Kulanz ab Ende des bezahlten Zeitraums | Kurze Zahlungsprobleme führen nicht sofort zu Unterrichtsproblemen |
| V07 | Schulverlängerung wird 60, 30 und 7 Tage vor Ende angekündigt | Genug Vorlauf für Schulträger und Beschaffung |
| V08 | Neue Schulbestellung standardmäßig 14 Tage Zahlungsziel, möglichst vor Leistungsbeginn | Weniger verspätete Starts, nachvollziehbare Fälligkeit |
| V09 | Beim Ende bleiben vorhandene Materialien lesbar und exportierbar, neue Premium-Erstellung endet | Vermeidet eine überraschende Sperre eigener Arbeit |
| V10 | Rabattcodes, anteilige Tarifwechsel und zusätzliche Zahlungsmethoden kommen nach dem stabilen Kernbetrieb | Spart zunächst Sonderfälle |

Sieben Tage sind eine neue Empfehlung für den späteren Produktbetrieb. Die früher diskutierten 72 Stunden waren eine Testannahme und werden hierdurch nicht stillschweigend zur Vertragsregel. Ebenso ist ein persönlicher Jahrespreis noch nicht beschlossen.

### 3.3 Vor dem ersten Echtgeldvertrag zu entscheiden

- Tatsächliche Verkäuferperson beziehungsweise Gesellschaft, Anschrift, Geschäftsbankkonto und steuerlicher Status.
- Persönlicher Bruttopreis, Schulpreis, Mindest-/Höchstplätze, monatliche oder schulweite KI-Kostenlimits.
- Ob die fünf kostenlosen Einheiten ausschließlich KI-Neuerstellung betreffen. Manuelle Erstellung, Duplizieren und Import sind bisher nicht abschließend festgelegt.
- Premium-Leistungsumfang, angemessene technische Nutzungslimits und eventuelle Zusatzpakete. Unbegrenzte KI-Kosten werden nicht aus dem Wort Premium abgeleitet.
- Vertragsbeginn bei Schulen, Rechnungsempfänger, Kündigungs-/Verlängerungsbedingungen und Umgang mit verspätetem Zahlungseingang.
- Regelung für bereits registrierte Personen. Empfehlung ist ein nachvollziehbarer einmaliger Übergang, keine rückwirkende überraschende Sperre.
- Steuerliche Behandlung, Verbraucherinformationen, Widerruf, Datenschutzvertrag und Rechnungsweg öffentlicher Kunden.
- Buchhaltungspartner beziehungsweise betreuender Dienstleister und dessen tatsächlicher Leistungsumfang.

Diese Entscheidungen blockieren keine weitere technische Vorbereitung in der Testumgebung. Sie blockieren die Aktivierung des zugehörigen Echtgeldangebots.

## 4. Das fachliche Modell

### 4.1 Begriffe und Zuständigkeiten

| Objekt | Bedeutung | Beispiel |
|---|---|---|
| Person | Stabile interne GradeCrew-Identität | Lehrkraft A |
| Anmeldeidentität | Aktueller Loginanbieter mit dessen Kennung | Firebase-UID, später gegebenenfalls OIDC |
| Schule | Organisatorischer Arbeitsbereich | Schule Nord |
| Mitgliedschaft | Beziehung zwischen Person und Schule | Lehrkraft A ist aktives Mitglied |
| Rechnungsadresse / Zahlungskonto | Rechtlicher Käufer und Zahlungspflichtiger | Stadt als Schulträger |
| Vertrag | Gewähltes Produkt, Preisversion, Plätze und Bedingungen | 20 Schulplätze für zwölf Monate |
| Vertragsperiode | Konkretes zeitliches Nutzungsrecht aus einer Bestellung | 01.09.2027 bis 01.09.2028 |
| Zahlung / Rechnung | Finanzieller Vorgang zum Vertrag | Rechnung 2027-00123 |
| Berechtigungsquelle | Grund für eine bestimmte Nutzung | Persönliches Abo, Schulplatz oder Adminfreigabe |

Die Schule ist häufig nicht selbst der rechtliche Rechnungsempfänger. Ein Schulträger kann mehrere Schulen bezahlen. Dieser Zusammenhang muss modelliert werden, damit weder Rechnungen falsch adressiert noch Daten anderer Schulen offengelegt werden.

Ein einziges veränderbares Feld wie accountType=premium reicht nicht aus. Eine Person kann gleichzeitig ein persönliches Abo, eine Schulmitgliedschaft und eine kostenlose Freigabe besitzen. Jede Quelle hat ihren eigenen Umfang und Zeitraum.

### 4.2 Regeln für die wirksame Berechtigung

1. Eine Sperre oder laufende Kontolöschung hat Vorrang vor einer Premiumquelle. Zahlung hebt keine Sicherheitssperre auf.
2. Die API prüft die konkrete Aktion, den Arbeitsbereich, die gültige Zeitspanne und gegebenenfalls das verbleibende Kontingent.
3. Persönliche Rechte gelten für persönliche Arbeit. Schulrechte gelten im zugehörigen Schulkontext gemäß Vertrag.
4. Mehrere passende Quellen können eine Aktion erlauben. Das Ende einer Quelle löscht die anderen nicht.
5. Ein Schulplatz setzt sowohl eine aktive Mitgliedschaft als auch eine gültige, bezahlte Vertragsperiode und Platzzuweisung voraus.
6. Finanzzustand und Produktzustand werden gesondert gespeichert. Eine offene Forderung kann neben noch gültigen bereits bezahlten Rechten bestehen.
7. Darstellung im Browser ist eine Anzeige. Die endgültige Entscheidung fällt bei jedem kostenpflichtigen Servervorgang.
8. Ablaufprüfung erfolgt anhand der Uhrzeit der Anfrage. Ein ausgefallener Hintergrundauftrag verlängert Rechte nicht versehentlich.

Der Server gibt eine verständliche Sicht zurück, beispielsweise Premium über Schule Nord bis 31.08.2028, zusätzlich persönliches Abo bis 15.12.2027. Er gibt dem Browser keine Möglichkeit, diese Quellen selbst zu ändern.

### 4.3 Rollen

| Rolle | Darf | Darf nicht allein aufgrund dieser Rolle |
|---|---|---|
| Lehrkraft | Eigene Tests und persönliche Belege nutzen | Fremde Konten oder Schulfinanzen verwalten |
| Schuladministrator | Mitglieder, Einladungen und vereinbarte Plätze der eigenen Schule verwalten | Fremde Schulen sehen, Zahlungen als bezahlt markieren |
| Schul-Finanzkontakt | Zugeordnete Rechnungen und Vertragsdaten einsehen | Ohne Zusatzrolle Unterrichtsmaterialien aller Lehrkräfte sehen |
| GradeCrew-Support | Definierte Hilfsfälle und Zugangserklärungen bearbeiten | Ohne Finanzberechtigung Erstattungen oder Verkäuferdaten ändern |
| GradeCrew-Finanzadministration | Rechnungen, Forderungen, Korrekturen und Exporte bearbeiten | Unprotokolliert Rechte oder Belege manipulieren |
| GradeCrew-Systemadministration | Freigaben, Sperren und Rollen im freigegebenen Umfang verwalten | Auditverlauf löschen oder serverseitige Zahlungsnachweise vortäuschen |

Für den kleinen Start können dieselben Personen mehrere Rollen tragen. Die Berechtigungen bleiben getrennt definiert. Jede Schule benötigt mindestens eine handlungsfähige Verwaltungsverantwortung. Der letzte Administrator darf nicht beiläufig entfernt werden.

## 5. Kostenloses Konto und persönliches Premium

### 5.1 Registrierung

1. Person registriert sich über die reguläre GradeCrew-Anmeldung und bestätigt die E-Mail-Adresse.
2. Serverseitig entsteht genau einmal das kostenlose Startguthaben von fünf KI-Neuerstellungen.
3. Es wird kein kostenpflichtiges Abo angelegt und kein Zahlungsmittel verlangt.
4. Im Konto steht Kostenlos – noch 5 KI-Tests. Auf der Website führt ein Upgrade zum eigenen angemeldeten Konto.
5. Einladungen zu einer Schule können nach erfolgreicher Identitätsprüfung zusätzlich eingelöst werden.

Eine neue Browserinstallation, ein ausgeloggter Zustand oder das Löschen eines Tests erzeugt kein neues Guthaben. Zusammenführen von Anmeldeidentitäten darf die Person ebenfalls nicht verdoppeln. Missbrauchsschutz gegen massenhafte neue Konten wird verhältnismäßig gestaltet und getrennt von einer bloßen IP-Sperre betrachtet.

### 5.2 Verbrauch der fünf Einheiten

Ein Erfolg ist eine neue, dauerhaft gespeicherte Test-ID. Die API reserviert gegebenenfalls kurzzeitig eine Einheit und bestätigt den Verbrauch atomar mit dem Speichervorgang. Fehlgeschlagene Erstellung gibt eine Reservierung frei. Ein Wiederholungsaufruf mit demselben Auftragskennzeichen erzeugt weder einen zweiten Test noch einen zweiten Verbrauch.

Zwei gleichzeitige Anfragen bei einer übrigen Einheit dürfen höchstens einen neuen Test abschließen. Die Verbrauchshistorie bleibt nach Testlöschung erhalten. Inhalte müssen dafür nicht weiter gespeichert werden. Bearbeitungen derselben Test-ID bleiben nach der bestätigten Regel ohne neue Startguthaben-Einheit.

**Noch zu entscheiden:** Wird ein bearbeiteter Test als vollständig unabhängige Kopie gespeichert, ist das technisch eine neue Test-ID. Empfehlung ist, dies als neue Erstellung zu behandeln und vor dem Klick anzuzeigen. Dasselbe gilt gegebenenfalls für Import und manuelle Neuanlage. Diese Erweiterung ist keine bereits bestätigte Entscheidung zu den fünf KI-Tests.

Nach Ende von Premium wird kein neues Startguthaben vergeben. Nicht verbrauchtes ursprüngliches Guthaben bleibt nach dem vorgeschlagenen Modell erhalten. Premium-Erstellungen verbrauchen das kostenlose Startguthaben nicht. Weitere KI-Aufrufe bei Überarbeitung können technische Kosten verursachen. Dafür brauchen wir sichtbare, faire Tariflimits oder Missbrauchsgrenzen, die nicht heimlich eine zweite Zählung der kostenlosen Tests darstellen.

Die fünf kostenlos erstellten Tests bleiben auch bei Rest null vollständig überarbeitbar. Eine neue Startguthaben-Einheit darf dafür nicht verlangt werden. Spätere technische Nutzungslimits müssen diese bestätigte Produkteigenschaft berücksichtigen. Die Nur-Lesen-Regel nach Ende einer bezahlten Quelle darf diese kostenlosen Testrechte nicht versehentlich aufheben.

### 5.3 Kauf von persönlichem Premium

1. Angemeldete Person wählt Premium. Der Server prüft vorhandene Abos, Schulrechte und offene Kaufvorgänge.
2. Preis, Zahlintervall, Leistungsumfang, Umsatzsteuerbehandlung und Kündigungsregel erscheinen vor dem Kauf.
3. Der Server erstellt einen Checkout für den zugelassenen Stripe-Preis und ordnet ihn der internen Person zu.
4. Die Person zahlt über PayPal oder Karte. Weitere Wallets dürfen nur bei tatsächlicher Verfügbarkeit angezeigt werden.
5. Nach der Rückkehr steht zunächst Zahlung wird geprüft, sofern noch kein bestätigter Beleg verarbeitet ist.
6. Ein überprüftes Zahlungsereignis erzeugt die Berechtigung für die bezahlte Periode.
7. Website, Konto und neue Sitzungen zeigen denselben Status. Die eigentliche Testfunktion prüft ebenfalls diese Berechtigung.
8. Rechnung und Zahlungsbestätigung werden gemäß festgelegtem Versandprozess ausgelöst.

Erfolg in der Rücksprung-URL ist kein Zahlungsbeweis. Abbruch, ausstehende Authentifizierung und asynchrone Zahlungsmethoden bleiben eindeutig dargestellt. Doppelklick und erneutes Öffnen erzeugen kein zweites aktives Abo.

### 5.4 Verlängerung, Kündigung und Zahlungsfehler

| Ereignis | Fachliche Folge | Anzeige / Kommunikation |
|---|---|---|
| Folgeperiode bezahlt | Exakt diese Periode freischalten | Premium aktiv, nächstes Ende und Rechnung |
| Kündigung zum Periodenende | Bereits bezahlte Rechte bleiben bis Ende | Kündigung vorgemerkt, gültig bis Datum |
| Erste Zahlung nicht erfolgreich | Keine bezahlten Rechte erzeugen | Zahlung offen, erneut versuchen |
| Folgezahlung fehlgeschlagen | Bezahlte Periode bleibt bestehen, danach einmalig vorgeschlagene sieben Tage Kulanz | Handlungsaufforderung mit Zahlungslink |
| Zahlung innerhalb der Kulanz | Offene Periode abgleichen, Zustand automatisch bereinigen | Premium aktiv |
| Kulanz endet ohne Zahlung | Nur die abgelaufene persönliche Quelle endet | Kostenlos oder verbleibende andere Quelle |
| Vollständige Erstattung | Vertragsentscheidung und betroffene Periode gesondert behandeln | Erstattung und Zugangsfolge klar bestätigen |
| Teilweise Erstattung | Finanzkorrektur, keine pauschale Kontosperre | Korrekturbeleg und verbleibende Rechte |

Kulanz wird an die konkrete fällige Periode gebunden. Wiederholte Ereignisse oder ein täglicher Auftrag starten sie nicht neu. Eine offene Forderung wird durch Ende der Zugangsrechte nicht automatisch gelöscht.

Stripe meldet Abo- und Rechnungszustände über Ereignisse. Insbesondere kann ein Abo mit Rechnungsversand bereits als active erscheinen, obwohl seine Rechnung unbezahlt ist. Deshalb wird der Produktzugang anhand des geprüften Vertrags- und Zahlungsmodells berechnet. [Stripe Abozustände](https://docs.stripe.com/billing/subscriptions/overview)

## 6. Schulangebot im Detail

### 6.1 Bestellung und Einrichtung

1. Schulverantwortliche Person fordert ein Jahrespaket an oder startet einen strukturierten Bestellprozess.
2. Pflichtdaten sind Schulname und Adresse, berechtigter Kontakt, rechtlicher Käufer, Rechnungsanschrift und E-Mail, Platzanzahl, gewünschter Start, vereinbarter Preis sowie gegebenenfalls Bestellnummer und Leitweg-ID.
3. GradeCrew prüft, ob bereits dieselbe Schule und derselbe Rechnungsempfänger bestehen. Ein Schulname oder eine E-Mail-Domain allein reicht nicht als eindeutiger Schlüssel.
4. Die kaufberechtigte Person bestätigt Angebot und Bedingungen. Der Nachweis wird mit der Vertragsversion gespeichert.
5. Die Schulverwaltung kann vorbereitet werden. Ein noch unbezahlter Vertrag verleiht dabei keine bezahlten Nutzungsrechte.
6. Nach dem fachlich vereinbarten Freigabepunkt wird die Rechnung finalisiert und an den berechtigten Empfänger übermittelt.
7. Stripe liefert die zur Rechnung beziehungsweise zum Kunden passenden Überweisungsanweisungen. Es werden keine eigenen erfundenen IBANs oder konstanten Verwendungszwecke verwendet.
8. Der Status bleibt auf Zahlung ausstehend, bis der volle geschuldete Betrag korrekt zugeordnet ist.
9. Bei vollständiger Zahlung und erreichtem Start werden die Plätze nutzbar. Einladungen verweisen auf den gemeinsamen Zeitraum.

**Vertragszeiträume:** Empfehlung ist ein vor Rechnungsfinalisierung vereinbartes, festes Startdatum mit zwölf Kalendermonaten Laufzeit. Das Zahlungsziel sollte davor liegen. Bei später Zahlung verschiebt die Software den bereits berechneten Leistungszeitraum nicht heimlich. Die vertraglich festgelegte Regel wird angewendet. Ist eine Verschiebung gewünscht, entsteht ein dokumentierter Änderungsfall mit gegebenenfalls korrigiertem Beleg. Damit versprechen Rechnung und Produktoberfläche nicht unterschiedliche Laufzeiten.

Eine alternative Regel zwölf Monate ab vollständigem Eingang ist möglich, erfordert aber einen dazu passenden Bestell-, Anzahlungs- und endgültigen Rechnungsprozess. Sie wird nicht parallel ohne klare Produktentscheidung eingeführt.

### 6.2 Einladungen statt frei weitergebbarem Jahrescode

**Empfehlung:** Schuladministrator gibt eine E-Mail-Adresse ein. GradeCrew versendet einen persönlichen Link. Der Link hat einen zufälligen starken Token, wird nur gehasht gespeichert, ist beispielsweise sieben Tage gültig und lässt sich einmal einlösen.

Einlösen bedeutet:

1. Anmeldung oder Registrierung und Bestätigung der eingeladenen Adresse.
2. Anzeige von Schule, Rolle und gemeinsamem Laufzeitende.
3. Bewusste Annahme der Mitgliedschaft.
4. Serverseitige Prüfung von Einladung, Identität, Schulzustand, Vertrag und freiem Platz.
5. Atomare Zuweisung des Platzes und Entwertung des Tokens.
6. Bestätigung an die Person und sichtbare Aktualisierung in der Schulverwaltung.

Ein wiederverwendeter, abgelaufener oder widerrufener Link erzeugt keine zusätzliche Mitgliedschaft. Bei E-Mail-Wechsel wird die Identität geprüft. Die Mitgliedschaft hängt an der internen Person, nicht dauerhaft nur an einer Zeichenfolge im E-Mail-Feld.

Ein kurzer manuell eintippbarer Code kann später denselben einmaligen Einladungsdatensatz ansprechen. Er braucht ausreichende Entropie, Ablaufdatum, Begrenzung der Versuche und gegebenenfalls Freigabe durch die Schule. Ein einziger für alle gültiger Jahrescode wird für den Start nicht empfohlen.

**Drei Dinge bleiben getrennt:** Einladung zur Schule, kostenloser Premium-Zugang durch die Administration und Rabattcode für einen Kauf. Keines davon darf stillschweigend die Wirkung der anderen erhalten.

### 6.3 Platzverwaltung

- Ein aktiver nutzungsberechtigter Lehrerplatz zählt einmal pro Person und Vertrag. Doppelte Einladungen verbrauchen keine zwei Plätze.
- Ein reiner Finanzkontakt ohne Produktnutzung benötigt nach dem Vorschlag keinen Lehrerplatz. Ein Schuladministrator, der das Produkt als Lehrkraft nutzt, benötigt einen Platz.
- Offene Einladungen können Plätze reservieren, müssen diese aber bei Ablauf freigeben. Verbindlicher Verbrauch und Reservierung werden getrennt angezeigt.
- Bei beispielsweise einem verbleibenden Platz und zwei gleichzeitigen Annahmen darf nur eine erfolgreich sein.
- Entfernen oder Austritt beendet die Schulquelle und gibt den Platz kontrolliert frei. Eigenes Premium der Person bleibt bestehen.
- Einladungen werden nur für vorhandene beziehungsweise vereinbarte Plätze erstellt. Zusätzliche Plätze sind ein Vertragsänderungsvorgang mit vorher angezeigtem Preis.
- Eine geringere Platzanzahl wird zum nächsten vereinbarten Zeitpunkt wirksam. Sie darf aktive Mitglieder nicht zufällig abschalten. Vorher ist eine konkrete Zuordnung erforderlich.
- Für den Start werden unterjährige anteilige Mehrplatzabrechnungen nur nach ausdrücklich definierter Preisregel eingeführt. Sonst manuell bestätigter Vertragsnachtrag mit sauberem Beleg.

Der Schulvertrag gehört der Schule beziehungsweise dem Käufer. Er hängt nicht an der persönlichen Mitgliedschaft eines wechselnden Schulleiters. Ein Verwaltungswechsel überträgt Zuständigkeit, nicht versehentlich die Rechnungsidentität.

### 6.4 Mehrere Schulen und persönliche Abos

Eine Person kann Mitglied mehrerer Schulen sein. Jede Mitgliedschaft hat eigene Rolle, Platzzuweisung und Laufzeit. In GradeCrew muss der aktuelle Arbeitsbereich sichtbar sein. Kostenpflichtige Aktionen werden dem gewählten Bereich zugeordnet.

Ein Wechsel der Schule kopiert keine vertraulichen Unterrichts- oder Schülerdaten automatisch. Ob Materialien persönlich oder schulbezogen sind, muss im Datenmodell und der Oberfläche erkennbar sein. Dieser Plan verleiht Schuladministratoren keinen pauschalen Zugriff auf alle persönlichen Materialien.

Hat eine Lehrkraft schon ein persönliches Abo, erhält sie beim Schulbeitritt einen Hinweis. Empfehlung ist ein bewusster Wechsel zum Ende des bereits bezahlten persönlichen Zeitraums. Keine stille Kündigung, keine automatische Doppelabrechnung ohne Hinweis und keine erfundene Erstattung. Wird der Schulzugang später beendet, darf ein zuvor gekündigtes persönliches Abo nicht ohne Auftrag neu starten.

### 6.5 Ablauf und Verlängerung

Zum Start wird renewal_mode=manual_confirmation vorgeschlagen. 60, 30 und 7 Tage vor Ablauf erhalten berechtigte Kontakte Erinnerungen. Eine Verlängerungsbestellung übernimmt geprüfte Stammdaten und nennt den neuen Zeitraum und Preis ausdrücklich.

- Frühzeitig bezahlte Verlängerung beginnt direkt am bisherigen Ende. Sie überschreibt die laufende Periode nicht.
- Ohne bestätigte Verlängerung entsteht kein ungefragter neuer kostenpflichtiger Jahresvertrag.
- Eine bestätigte, aber unbezahlte Folgeperiode bleibt finanziell und beim Zugang offen. Die bezahlte Vorperiode bleibt bis zu ihrem Ende gültig.
- Nach Ablauf können Schuladministrator und Finanzkontakt weiterhin die für sie vorgesehenen Vertrags- und Beleginformationen erreichen.
- Das Konto wird nicht gelöscht. Mitglieder werden nicht zu anonymen anderen Personen. Persönliche Restrechte und manuelle Freigaben bleiben erhalten.
- Späte Zahlung wird der tatsächlich vereinbarten Folgeperiode zugeordnet. Ein geänderter Beginn erfordert einen dokumentierten Änderungsprozess.

Zeitintervalle werden intern als Beginn einschließlich und Ende ausschließlich in UTC geführt. Die Anzeige erfolgt verständlich in Europe/Berlin. Zwölf Monate sind Kalendermonate. Für einen Start am 29. Februar muss die Datumsbibliothek die vereinbarte Folgeregel eindeutig abbilden. Vertrags- und Rechnungsdarstellung verwenden dieselbe Berechnung.

Laufende Prüfungen benötigen eine eigene Schutzregel. Empfehlung ist, bereits gestartete Schülerabgaben noch sicher abschließen und Ergebnisse exportieren zu lassen, während neue Premium-Erstellungen gesperrt sind. Das ist eine begrenzte Produktfunktion und keine unbegrenzte kostenlose Vertragsverlängerung.

## 7. Kostenlose Freigaben und spätere Aktionen

### 7.1 Premium für Kolleginnen und Kollegen

Die Administration kann eine persönliche oder ausdrücklich schulbezogene Freigabe erteilen. Pflichtfelder sind Person beziehungsweise Schule, Leistungsumfang, Beginn, Ende oder ausdrücklich unbefristet, interner Grund und verantwortliche Person.

Der Eintrag erscheint als kostenlose Freigabe, nicht als bezahlter Kunde. Keine Stripe-Rechnung und kein künstlicher Zahlungsbeleg wird angelegt. Vorhandene echte Abos werden dadurch nicht automatisch beendet. Bei einem bestehenden Abo muss die Administration den Konflikt erkennen und mit der Person klären.

Ändern und Widerrufen erfolgen mit nachvollziehbarem Protokoll. Die Kontenliste zeigt Quelle und Ablauf. Eine Zahlung darf eine widerrufene Freigabe weder wiederherstellen noch überschreiben. Eine kostenlose Freigabe erzeugt keine fiktiven Umsätze in der Auswertung.

### 7.2 Rabatt- und Influencercodes, spätere Phase

Für jeden Aktionscode werden Rabattbetrag oder Prozentsatz, gültige Produkte, Einlösefenster, Rabattdauer, maximale Einlösungen, berechtigte Kundengruppe und Kampagnenzuordnung definiert. Monatlicher Rabatt über drei Perioden und nur bis Ende März einlösbarer Code sind unterschiedliche Eigenschaften.

Ein rabattierter Null-Euro-Zeitraum kann ein vertraglich gültiges Nutzungsrecht erzeugen, aber keinen erfundenen Zahlungseingang. Die Logik muss solche zulässigen Nullrechnungen von kostenlosen Adminfreigaben unterscheiden. Provisionen an Werbepartner und vereinbarte Werbegegenleistungen benötigen einen eigenen rechtlichen und buchhalterischen Prozess. Sie entstehen nicht automatisch durch den technischen Code.

## 8. Oberflächen und Verwaltungswege

### 8.1 Öffentlich und beim persönlichen Konto

- Preis-/Tarifseite mit verständlichen Leistungen, Preisen, Intervallen und Kündigungsregeln.
- Registrierung mit kostenlosem Start und sichtbarem Hinweis auf die fünf Einheiten.
- Einheitliche Kontoanzeige Kostenlos, Premium persönlich, Premium über Schule oder kostenlose Freigabe. Mehrere Quellen sind in Details erkennbar.
- Upgrade, ausstehende Zahlung, Bestätigung, Zahlung verwalten und Kündigung mit eindeutigen Zuständen.
- Eigene Rechnungsliste mit Datum, Betrag, Status und Download beziehungsweise sicherem Originalbeleglink.
- Kein erzwungener Neukauf, wenn bereits ein passender Zugang besteht.

### 8.2 Schulverwaltung

Die Schulseite enthält Übersicht, Mitglieder, offene Einladungen, Plätze, Vertragszeiträume und berechtigte Finanzansicht. Beispielsweise 14 von 20 Plätzen genutzt, 2 reserviert, gültig bis 31.08.2028. Eine unbezahlte Rechnung wird nicht als aktive Lizenz dargestellt.

Für Verwaltungswechsel sind Einladung, Annahme und Übergabe vorgesehen. Der letzte handlungsfähige Schuladministrator wird geschützt. Inhaberlos gewordene Schulen erhalten einen geprüften Supportprozess.

### 8.3 GradeCrew-Administration

Die bestehende Kontentabelle wird um wirksamen Zugang, Quellen, kostenlose Resttests, Schulen und nächstes Ablaufdatum erweitert. Filter sind mindestens Kostenlos, persönliches Premium, Schulzugang, kostenlose Freigabe, Zahlung offen und auslaufend.

Die Detailseite beantwortet Warum hat diese Person Zugang? mit Quelle, Zeitraum und Beleg beziehungsweise Freigabegrund. Schulzuordnung erfolgt über die Mitgliedschaftsfunktion. Ein manuell editierbarer Zahlungsstatus ist nicht vorgesehen.

Der neue Bereich Abrechnung erhält:

1. Rechnungen mit Käufer, Schule, Nummer, Zeitraum, Brutto, Steuerkennzeichnung, offenem Betrag und Originalbeleg.
2. Zahlungen und Teilzahlungen mit Zuordnungen, ohne unnötige Kontodatenoffenlegung.
3. Verträge und aktive/kommende Perioden mit Platzanzahl und Verlängerungsart.
4. Ausnahmen wie nicht zugeordneter Eingang, verspätete Zahlung, Erstattung, Zustellfehler und Rechnungswiderspruch.
5. Exporte und Abgleichstatus für die Buchhaltung.
6. Protokollierte Aktionen mit Vorschau der Auswirkungen. Riskante Änderungen benötigen eine erneute Bestätigung im Produkt.

Das Stripe-Kundenportal eignet sich für persönliche Selbstverwaltung und kann vom GradeCrew-Server als autorisierte Sitzung geöffnet werden. Bei einem Schulträger mit mehreren Schulen darf ein allgemeiner Portalzugang nicht ungeprüft alle Belege des Käufers sichtbar machen. Hier wird entweder eine bewusst auf Käuferseite berechtigte Finanzrolle verwendet oder eine GradeCrew-Ansicht mit schulbezogener Freigabe gebaut. [Stripe Kundenportal](https://docs.stripe.com/customer-management)

## 9. Rechnungen, Belege und automatischer Versand

### 9.1 Ein verbindliches Rechnungssystem pro Vorgang

Für einen Verkauf wird genau ein rechtlich maßgeblicher Rechnungsweg festgelegt. Eine Stripe-Rechnung und eine zweite unabhängig ausgestellte Buchhaltungsrechnung für dieselbe Leistung dürfen nicht versehentlich zwei Forderungen erzeugen.

**Vorschlag:** Stripe ist zunächst das führende System für persönliche Abo-Rechnungen und unterstützte Schulrechnungen. Falls ein E-Rechnungsdienst für bestimmte Schulträger gebraucht wird, muss dessen Rolle eindeutig sein. Entweder erzeugt er aus dem freigegebenen Beleg eine verknüpfte strukturierte Darstellung oder er ist für diesen Vorgang das führende Rechnungssystem. Nummer, Forderung, Steuerbeträge und Korrekturen müssen konsistent bleiben. Der konkrete Dienst ist noch nicht ausgewählt.

Die Zahlung per Banküberweisung, ein Eingangsbeleg und ein Rechnungskorrekturbeleg sind unterschiedliche Dokumente. Zwei Teilüberweisungen bezahlen dieselbe Rechnung. Sie erzeugen nicht automatisch zwei weitere Rechnungen.

### 9.2 Verkäufer- und Rechnungsdaten

Vor Aktivierung sind zu hinterlegen und fachlich zu prüfen:

- Rechtlicher Verkäufername, vollständige Adresse, erreichbarer Support und erforderliche Steuer-/Registerangaben.
- Logo als geeignetes Original und geprüfte Farben. Keine alten Schulnamen oder privaten Platzhalter.
- Eindeutiger Nummernkreis und Belegreferenz, Ausstellungsdatum, Sprache und EUR-Währung.
- Käufername und Anschrift, getrennt von eingeladenen Lehrkräften.
- Konkrete Leistungsbeschreibung, Anzahl Plätze, Leistungszeitraum, Preisbestandteile und anwendbare Steuerbehandlung.
- Fälligkeit, Zahlungsanweisungen und vereinbarte Vertragsreferenzen.
- Für Schulträger gegebenenfalls Bestellnummer, Kostenstelle, Leitweg-ID und geforderter Zustellkanal.

Die Pflichtangaben richten sich nach dem konkreten Rechnungsfall. Dass die Kunden Schulen sind, begründet allein keine Umsatzsteuerbefreiung der verkauften Software. Der tatsächlich zutreffende Steuerfall wird vor dem Angebot hinterlegt. [§ 14 UStG](https://www.gesetze-im-internet.de/ustg_1980/__14.html)

### 9.3 Logoentwurf und Abnahme

Der vorhandene Entwurf wird als Gestaltungsvorlage geprüft. Danach entstehen mit echten, freigegebenen Stammdaten und fiktivem Käufer mindestens vier Testbelege:

1. Persönliche Monatsrechnung mit Preis, Zeitraum und gegebenenfalls Steuer.
2. Schuljahresrechnung mit Plätzen, Käufer und Zahlungsziel.
3. Dieselbe Schulrechnung nach 10 € Eingang und nach insgesamt 30 € mit korrektem Zahlungsstatus.
4. Korrektur-/Erstattungsbeleg mit eindeutiger Referenz zur Ausgangsrechnung.

Bei Verwendung eines strukturierten Formats wird zusätzlich die maschinenlesbare Datei validiert und mit der visuellen Darstellung abgeglichen. Ein PDF-Logoentwurf ist keine steuerliche Freigabe. PDF, XML und Buchung dürfen nicht unterschiedliche Summen oder Zeiträume enthalten.

### 9.4 Versandmatrix

| Anlass | Empfänger | Vorgeschlagener Versender | Wirkung |
|---|---|---|---|
| Kaufbestätigung | Persönlicher Käufer | GradeCrew | Tarif und Zugang erklären |
| Abo-Rechnung / Zahlungsbeleg | Persönlicher Rechnungsempfänger | Stripe | Finanziellen Vorgang belegen |
| Schulrechnung | Verifizierter Käufer-/Finanzkontakt | Stripe oder vereinbarter E-Rechnungsweg | Forderung mit Zahlungsanweisung übermitteln |
| Schulmitgliedschaft | Eingeladene Lehrkraft | GradeCrew | Einmalige Einladung und Schule nennen |
| Schulzahlung vollständig | Schulverwaltung und zulässiger Finanzkontakt | GradeCrew | Start beziehungsweise Aktivierung erklären |
| Folgezahlung fehlgeschlagen | Berechtigter Zahlungspflichtiger | Ein festgelegter Stripe-Prozess | Zahlung aktualisieren, Frist nennen |
| Nutzungsrecht läuft aus | Betroffene Person / Schulverwaltung | GradeCrew | Produktfolge und Handlungsweg erklären |
| Verlängerungsangebot Schule | Bestellberechtigter Kontakt | GradeCrew | Neue Periode bewusst bestätigen lassen |
| Kündigungsbestätigung | Vertragskunde | Festgelegter Vertragsprozess | Eingang und Wirksamkeitsdatum bestätigen |
| Korrektur / Erstattung | Rechnungsempfänger | Führendes Rechnungssystem | Korrektur nachvollziehbar übermitteln |

Für jeden Anlass gibt es genau eine fachlich verantwortliche Versandstrecke. Parallel aktivierte Stripe-Erinnerungen und eigene Erinnerungen dürfen nicht dieselbe Aufforderung mehrfach erzeugen. Versandauftrag, Providerkennung, Zeit, Vorlage und Fehler werden gespeichert. Bei technisch unklarer Zustellung wird vor blindem erneuten Senden der Providerstatus geprüft.

Mehrere automatische Empfänger pro Schulbeleg werden nicht als frei verfügbare Stripe-API-Funktion vorausgesetzt. Der tatsächlich unterstützte Dashboard-/API-Weg wird vor Umsetzung geprüft. Empfehlung für den Start ist ein verifizierter Hauptrechnungsempfänger und gesonderte GradeCrew-Hinweise an berechtigte Schulverantwortliche. Belege werden nicht ungefragt an alle Mitglieder verteilt. [Stripe zusätzliche Rechnungsempfänger](https://docs.stripe.com/invoicing/send-email#additional-email-recipients)

Gesendet bedeutet nicht im Posteingang angekommen. Rückläufer und abgelehnte Nachrichten landen in einer Bearbeitungsübersicht. Eine Rechnung bleibt für berechtigte Personen im Konto erreichbar. Für Liveversand sind Absenderdomain, Zustellbarkeit, Datenschutz und mindestens ein kontrolliertes echtes Empfängerpostfach zu testen. Synthetische Testadressen beweisen keine E-Mail-Zustellung.

### 9.5 Öffentliche Schulen und E-Rechnung

Vor einer Bestellung wird gefragt, wer rechtlich bestellt und welchen Belegweg dieser Käufer benötigt. Bund, Länder und kommunale Schulträger haben unterschiedliche Zuständigkeiten. Bundesvorgaben werden nicht pauschal auf jede Schule übertragen.

Die Bestellung benötigt gegebenenfalls strukturierte Rechnung, Leitweg-ID, Bestellreferenz und Übermittlung über ein bestimmtes Portal oder Peppol. Eine erforderliche Leitweg-ID kommt vom Auftraggeber. Fehlende Daten werden vor Finalisierung geklärt. [Offizielle Hinweise zur Leitweg-ID](https://www.e-rechnung-bund.de/faq/leitweg-id/)

Für Deutschland wird von Anfang an ein strukturierter Rechnungsweg vorgesehen, ohne die jeweils geltende Pflicht für jeden Käufer gleichzusetzen. Die Umsetzung muss vor dem ersten betroffenen Auftrag ein tatsächlich akzeptiertes Dokument samt erfolgreicher Übermittlung nachweisen. Die technischen Übergangsregeln und Ausnahmen werden beim Livebeginn aktuell geprüft. [BMF FAQ](https://www.bundesfinanzministerium.de/Content/DE/FAQ/e-rechnung.html)

### 9.6 Aufbewahrung und Korrektur

Originalbelege, strukturierte Originaldateien, Korrekturen und die relevante Übermittlungshistorie werden unveränderbar beziehungsweise mit nachvollziehbarer Versionierung aufbewahrt. Ein veränderbares PDF im Benutzerprofil reicht nicht als vollständiger Archivierungsprozess.

Für Rechnungen nennt § 14b UStG grundsätzlich acht Jahre. Andere Unterlagen, Sonderfälle und Löschpflichten benötigen eine eigene Aufbewahrungsmatrix. Daher wird weder pauschal alles nach einem Jahr gelöscht noch pauschal jede Datenart zehn Jahre gespeichert. [§ 14b UStG](https://www.gesetze-im-internet.de/ustg_1980/__14b.html)

Nach Finalisierung werden rechtlich relevante Daten nicht unprotokolliert überschrieben. Fehler werden über den abgestimmten Korrekturprozess behandelt. Kontolöschung trennt Produktdaten von gegebenenfalls weiterhin aufzubewahrenden Finanzbelegen. Ein Datenschutzhinweis erklärt diese Trennung verständlich.

## 10. Buchhaltung, DATEV und Dienstleister

Stripe ist kein vollständiger Ersatz für Unternehmensbuchhaltung und Steuererklärungen. Das Ziel lautet automatischer Normalfall und kleine, sichtbare Ausnahmeliste. Welche Meldungen und Abschlüsse tatsächlich erforderlich sind, hängt von Verkäufer, Steuerstatus und Geschäft ab.

### 10.1 Erforderliche Beleg- und Buchungskette

Jeder Verkauf muss von Rechnung über Zahlung bis zur tatsächlichen Auszahlung nachvollziehbar sein. Gebühren, Erstattungen, strittige Zahlungen und gegebenenfalls Fremdwährung werden separat erfasst. Eine Bankauszahlung entspricht regelmäßig nicht einfach dem Umsatz derselben Höhe.

Für PayPal muss der tatsächliche vertragliche Abrechnungs- und Auszahlungsweg des Kontos überprüft werden. Die Integration darf nicht voraussetzen, dass jede PayPal-Zahlung zwingend in derselben Stripe-Auszahlung landet. Der Abgleich muss den tatsächlich verwendeten Zahlungs- und Gebührenbelegen folgen. [Stripe PayPal](https://docs.stripe.com/payments/paypal)

### 10.2 Auswahl eines Buchhaltungswegs

Vor dem Livebeginn werden zwei oder drei geeignete Dienstleister anhand derselben Anforderungen geprüft:

- Verarbeitung von Stripe, PayPal und Bankkonto mit Gebühren und Rückzahlungen.
- Import der Originalbelege und Erhalt stabiler Referenzen.
- Geeignetes Rechnungs-/E-Rechnungsformat und belastbare Archivierung.
- Tatsächlicher DATEV-Export beziehungsweise konkrete Schnittstelle zum betreuenden Betrieb.
- Abgrenzung von Software, laufender Buchführung, steuerlicher Beratung, Voranmeldungen und Jahresabschluss.
- Zugriffskontrolle, Datenexport, Preis bei dem erwarteten Volumen und Kündigungsmöglichkeiten.

Es wird kein pauschal 350 € monatlich kostender Zusatzdienst vorausgesetzt. Der Bedarf entsteht aus den tatsächlichen Ländern, Steuerfällen und übernommenen Leistungen. Ein günstiger Belegexport ohne Bearbeitung der Steuerfälle erfüllt Martins Wunsch nach weitgehender Entlastung allerdings ebenfalls nicht automatisch.

### 10.3 Konkrete Abnahme des Exports

Der künftige betreuende Dienst prüft ein Muster mit persönlichem Abo, Schulrechnung, zwei Teilzahlungen, Gebühren, Erstattung und Auszahlung. Erwartet werden keine doppelt gebuchten Erlöse, keine verschwundenen Gebühren und keine ungeklärte Differenz zwischen Forderung und Eingang.

Bei DATEV werden Format, Kontenrahmen, Steuerschlüssel, Debitorenzuordnung, Beleglinks, Leistungsdaten und Korrekturen abgestimmt. Ein beliebiges CSV mit Rechnungsnummern ist kein Nachweis eines brauchbaren Imports. Die tatsächliche Importprobe und Rückmeldung werden archiviert.

Ein Monatsabschlusslauf listet offene Zuordnungen, nicht übermittelte Belege und Differenzen auf. Erst ein erfolgreicher Abgleich markiert den Monat als buchhalterisch vorbereitet. Steuerliche Abgabe und rechtliche Verantwortung werden einem benannten zuständigen Dienst beziehungsweise dem Unternehmen zugeordnet.

## 11. Sicherheit, Recht und Verantwortlichkeit

### 11.1 Technische Sicherheit

- Zahlungsmitteldaten werden in Stripe Checkout beziehungsweise geeigneten Provideroberflächen erfasst. GradeCrew speichert keine Kartennummern oder PayPal-Passwörter.
- Geheime API- und Signaturschlüssel liegen ausschließlich serverseitig im Secret Manager beziehungsweise später einem gleichwertigen Geheimnisspeicher.
- Öffentlicher Quellcode darf öffentliche Konfiguration und unverfängliche Schlüsselkennungen enthalten. Er darf keine geheimen Schlüssel, Sitzungen, Testpasswörter oder privaten Belegdaten enthalten.
- Test und Live besitzen getrennte Umgebungsprüfung, Providerzuordnung, Preislisten, Datenbestände und Berechtigungen. Ein Livebeleg wird in der Testumgebung abgewiesen.
- Webhookprüfung verwendet den unveränderten Anfragekörper, richtige Signatur und den zur Umgebung gehörenden Endpunkt. Anschließend wird der Beleg in der vorgesehenen Providerumgebung abgeglichen.
- Jeder schreibende Endpunkt prüft Identität, Rolle, Ressourcenzugehörigkeit, Eingaben, Wiederholungskennzeichen und gegebenenfalls Sitzungs-/CSRF-Schutz.
- Schulverwaltung, Gratisfreigaben, Finanzänderungen und Erstattungen werden protokolliert. Administrationskonten benötigen starken Schutz und für sensible Vorgänge eine frische Anmeldung.
- Stripe erhält nur benötigte Kauf-/Kontaktdaten und interne unverfängliche Referenzen. Schülernamen, Antworten und Unterrichtsinhalte gehören nicht in Zahlungsmetadaten.

Stripe reduziert den Aufwand für sichere Zahlungsdatenerfassung. Anwendungssicherheit, Schulzuordnung, Zugriffsregeln, korrekte Verkäuferdaten und das Verhalten bei Ausfällen bleiben eigene beziehungsweise vertraglich zugeordnete Aufgaben.

### 11.2 Verbraucher und Schulverträge

Privat kaufende Lehrkräfte dürfen nicht allein wegen ihres Berufs pauschal als Unternehmer behandelt werden. Vor Liveverkauf werden Käufergruppen und Vertragsbedingungen fachlich geprüft. Für Verbraucher brauchen Checkout und Bestellablauf klare Angaben zu Preis, Dauer und Zahlungspflicht. [§ 312j BGB](https://www.gesetze-im-internet.de/bgb/__312j.html)

Bei einschlägigen online abschließbaren Verbraucherdauerschuldverhältnissen muss die vorgeschriebene Kündigungsmöglichkeit berücksichtigt werden. Ein nur nach Login erreichbares Kundenportal ist nicht ohne Prüfung die vollständige gesetzliche Lösung. Kündigungseingang und Wirksamkeitsdatum werden dauerhaft bestätigt. [§ 312k BGB](https://www.gesetze-im-internet.de/bgb/__312k.html)

Automatische Jahresverlängerung wird nicht als allgemeine Regel für alle Käufer festgeschrieben. Die zulässige Gestaltung von AGB und Verlängerungen unterscheidet sich unter anderem bei Verbraucherverträgen. [§ 309 BGB](https://www.gesetze-im-internet.de/bgb/__309.html)

Widerruf, Beginn der digitalen Leistung, Erstattungsansprüche und gegebenenfalls erforderliche Einwilligungen werden geprüft. Eine Checkbox mit pauschalem Verzicht wird nicht als universelle Lösung eingebaut. Für Schulen werden gegebenenfalls Auftragsverarbeitung, technische Maßnahmen, Unterauftragnehmer, Datenstandorte und Beschaffungsnachweise benötigt.

## 12. Austauschbare technische Umsetzung

### 12.1 Zielbild

Browser oder App → eigene GradeCrew-API → reine Konto-/Vertrags-/Rechtelogik → Stripe-Adapter und Speicheradapter.

Der Loginanbieter wird am Eingang geprüft und auf eine stabile interne Person abgebildet. Stripe-Kundennummern, Firestore-Dokumentpfade und Loginanbieter-UIDs werden nicht zur universellen Geschäftsidentität vermischt.

Für den ersten Produktstand ist der bestehende Node-22-Pfad sinnvoll. Die im Sandboxserver getrennt erprobten Verantwortlichkeiten werden übernommen. Eine zweite vollständige Produktionsanmeldung neben Firebase oder eine dauerhafte doppelte Fachlogik in Python und JavaScript ist nicht Teil des Vorschlags.

### 12.2 Vorgeschlagene Dateien und Verantwortlichkeiten

Die folgenden Pfade sind **geplante neue Dateien**, keine Behauptung bereits implementierter Funktionen. Vor der Umsetzung wird der dann aktuelle Integrationsbranch erneut gelesen.

| Pfad | Verantwortung |
|---|---|
| functions/lib/billing/domain/access.js | Wirksame Berechtigungen und Quellenvorrang, ohne Cloud-Import |
| functions/lib/billing/domain/contracts.js | Perioden, Verlängerungsart, Platzregeln und zulässige Übergänge |
| functions/lib/billing/domain/usage.js | Einmaliges Fünferguthaben, Reservierung und Verbrauch |
| functions/lib/billing/domain/invitations.js | Fachliche Einladung und Mitgliedschaft |
| functions/lib/billing/domain/invoices.js | Interner Rechnungszustand und Zuordnungsregeln |
| functions/lib/billing/application.js | Anwendungsfälle, Transaktionen und Adapterkoordination |
| functions/lib/billing/stripe-adapter.js | Providerzugriff, versionierte Preiszuordnung und Belegabgleich |
| functions/lib/billing/firestore-store.js | Speicherung, Indizes und atomare Schreibvorgänge |
| functions/lib/billing/identity-adapter.js | Anmeldeanbieter auf interne Person abbilden |
| functions/lib/billing/mail-adapter.js | Versandaufträge, Status und Vorlagenreferenzen |
| functions/billing-http.js | HTTP-Anfragen, Authentifizierung, Webhookkörper und Antwortcodes |
| functions/main.js | Bestehenden Exportpfad gezielt um freigegebene Endpunkte ergänzen |
| admin-account-actions.mjs | Bestehende Kontenansicht um autorisierte Zugangs-/Schulfunktionen erweitern |
| billing-account.mjs | Persönliche Tarif-/Rechnungsanzeige |
| school-admin.mjs | Schulmitglieder, Einladungen und Plätze |
| billing-admin.mjs | Finanzübersicht und Ausnahmeliste |
| firestore.rules | Zugriff auf neue Datentypen nach konkretem Modell beschränken |
| functions/test/billing-*.test.js | Fachliche Übergänge, Adapterverträge und Autorisierung |
| docs/billing/operations.md | Betrieb, Abgleich, Wiederanlauf und Support |
| docs/billing/data-and-retention.md | Datenmodell, Export und Aufbewahrung |

Gemeinsame Rechteprüfung wird an **alle** tatsächlichen Erstellungspfade angeschlossen. Dazu gehören KI-Aufträge, Speichern neuer Tests, Kopieren und Import, soweit fachlich als Verbrauch bestätigt. Eine Prüfung nur im Upgrade-Button oder nur im Browser ist unzureichend.

### 12.3 Datenmodell

| Entität | Wesentliche Felder und Invarianten |
|---|---|
| people | Interne ID, Status, verifizierte Kontakte, getrennte Anbieteridentitäten |
| schools | Interne ID, geprüfter Name, Status und Verwaltungsbezug |
| schoolMemberships | Schule, Person, Rolle, Status, Beitritt/Austritt, eindeutiges Paar |
| invitations | Schule, Empfängerbezug, gehashter Token, Rolle, Ablauf, Annahme/Widerruf |
| billingAccounts | Rechtlicher Käufer, Steuer-/Adresssnapshot, berechtigte Finanzkontakte |
| providerCustomers | Umgebung, Providerkonto, Käufer, externe Kundennummer |
| contracts | Käufer, Produkt-/Preisversion, Schul- oder Personenbezug, Bedingungen, renewal_mode |
| contractPeriods | Beginn/Ende, Betrag/Währung, Platzanzahl, zugehörige Rechnung, Status |
| seatAllocations | Vertrag/Periode, Mitgliedschaft, Reservierung/Zuweisung/Ende |
| entitlementGrants | Quelle, Ressourcenumfang, Zeitraum, Ursprung und Widerruf |
| usageLedger | Person/Bereich, Auftrag, neue Test-ID, Reservierung, Verbrauch, unveränderter Zählbezug |
| invoices | Providerkennung, Käufer, Vertrag, Nummer, Beträge, Zahlungsrest, Belegreferenzen |
| paymentAllocations | Providerzahlung, Rechnung, Betrag, Währung, Eingangs-/Zuordnungszeit |
| webhookInbox | Umgebung, Ereignis-ID, Eingang, Verarbeitung, Versuch, Fehlerklasse |
| outbox | Fachlicher Anlass, Empfänger, deduplizierender Schlüssel, Status, Providerkennung |
| billingExceptions | Falltyp, Bezug, Frist, Verantwortlicher und Entscheidung |
| auditLog | Wer, wann, welche erlaubte Änderung, Grund und Vorher-/Nachherreferenz |

Geld wird in kleinsten Währungseinheiten als Ganzzahl geführt. Zeit und Kalenderlogik werden konsistent getrennt. Provider-IDs werden mindestens mit Umgebung und Providerkonto zusammengesetzt. Preise und akzeptierte Vertragsbedingungen erhalten Versionen. Finanzsnapshots bleiben auch bei späterem Adresswechsel nachvollziehbar.

Vor der konkreten Firestore-Struktur werden die notwendigen Abfragen und Transaktionen festgelegt. Besonders wichtig sind eindeutige aktive Mitgliedschaft, nicht überschreitbare Plätze, einmaliger Guthabenverbrauch und ein Berechtigungsdatensatz pro Vertragsperiode. Exportformat und Beziehungen dürfen nicht nur aus anbieterspezifischen Dokumentpfaden ableitbar sein.

### 12.4 API-Vertrag

| Vorgeschlagener Endpunkt | Aufgabe | Zentrale Prüfung |
|---|---|---|
| GET /v1/me/access | Wirksame Rechte und Restguthaben | Angemeldete Person |
| POST /v1/billing/checkouts | Persönlichen Kauf vorbereiten | Eigene Person, zugelassener Preis, kein Doppelabo |
| POST /v1/billing/portal | Autorisierte persönliche Portalsitzung | Serverseitig ermittelter Käufer |
| GET /v1/billing/invoices | Eigene freigegebene Rechnungen | Käufer-/Finanzberechtigung |
| POST /v1/schools/:id/invitations | Einladung erstellen | Verwaltung dieser Schule, Kapazität |
| POST /v1/school-invitations/accept | Mitgliedschaft annehmen | Token, verifizierte Identität, Transaktion |
| POST /v1/schools/:id/members/:person/remove | Schulzuordnung beenden | Schulrolle, letzter Administrator, Auswirkungen |
| GET /v1/schools/:id/license | Plätze und Vertragszeitraum | Schulberechtigung, Finanztiefe nach Rolle |
| POST /v1/admin/access-grants | Kostenlose Freigabe erteilen | Zuständige Adminrolle, Grund, Audit |
| POST /v1/admin/contracts/:id/changes | Definierte Vertragsänderung vorbereiten | Finanzrolle, Vorschau, bestätigter Vorgang |
| POST /v1/webhooks/stripe | Ereignis verlässlich annehmen | Signatur, Konto, Umgebung, Inbox |

Die endgültigen URLs dürfen an den bestehenden Routingstandard angepasst werden. Inhalt und Prüfungen bleiben verbindliche Abnahmekriterien. Der Browser übermittelt niemals verbindlichen Preis, bezahlt=true oder eine ungeprüfte fremde Stripe-Kundennummer.

### 12.5 Verlässliche Ereignisverarbeitung

1. Webhook im richtigen Umfeld authentifizieren und minimal sicher in einer Inbox speichern.
2. Ereignis-ID deduplizieren und erlaubte Ereignistypen prüfen.
3. Aktuellen Providerbeleg lesen und der eigenen Bestellung beziehungsweise dem Vertrag zuordnen.
4. Währung, Kunde, Produkt-/Preisversion, Zeitraum und geschuldeten Betrag prüfen. Rabatte und Steuern gehören in die erwartete Berechnung.
5. Rechnung, Zahlung und betroffene Vertragsperiode atomar beziehungsweise über einen wiederaufnehmbaren Ablauf aktualisieren.
6. Fachliche Eindeutigkeit zusätzlich über Rechnung und Vertragsperiode absichern. Zwei verschiedene Ereignis-IDs dürfen nicht doppelte Rechte erzeugen.
7. Benötigte E-Mails und Statusänderungen als wiederaufnehmbare Aufträge erzeugen.
8. Erfolg und Fehlerzustand protokollieren. Technische Wiederholungen dürfen keine zweite Rechnung, keinen zweiten Platz und keine zweite Lizenzperiode erzeugen.

Ereignisse können mehrfach, verspätet oder in anderer Reihenfolge eintreffen. Alte Ereignisse dürfen aktuelle bezahlte Perioden nicht zurücksetzen. Stripe-Idempotenzschlüssel schützen eigene Provideraufrufe. Sie ersetzen nicht die fachliche Eindeutigkeit im eigenen Speicher. [Stripe Abo-Webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)

Erforderliche Ereignisfamilien sind mindestens relevante Rechnungszustände, erfolgreiche und fehlgeschlagene Zahlungen, Aboänderung/-ende, Erstattungen und Streitfälle. Die exakten Typen werden gegen die gewählte API-Version festgeschrieben. Nicht benötigte Vollereignisse werden nicht unbegrenzt mit personenbezogenen Daten archiviert.

### 12.6 Automatische Aufträge und Abgleich

- Kurzer Wiederanlauf verarbeitet gespeicherte fehlgeschlagene Ereignisse mit Begrenzung und sichtbarer Ausnahmeliste.
- Periodischer Abgleich kontrolliert offene Rechnungen, ausstehende Käufe und strittige Zuordnungen. Er scannt nicht ungezielt alle Lehrkräfte.
- Ablaufauftrag aktualisiert Anzeigen und Mitteilungen. Die eigentliche Zugangsprüfung bleibt zeitabhängig korrekt, auch wenn der Auftrag verspätet ist.
- Einladungslauf gibt abgelaufene Reservierungen frei.
- Erinnerungsauftrag verwendet einen eindeutigen Schlüssel je Vertrag, Periode und Erinnerungsstufe.
- Monatsabgleich kontrolliert Belege, Zahlungen, Gebühren, Erstattungen und Auszahlungen.

Vorläufige Betriebsziele sind Zugang spätestens 60 Sekunden nach verarbeitbarem bestätigtem Ereignis und sichtbare Alarmierung bei länger als fünf Minuten festhängenden normalen Käufen. Das sind eigene Zielwerte, keine garantierten Providerlaufzeiten. Ein zusätzlicher beispielsweise 15-minütiger Abgleich dient der Reparatur verpasster Ereignisse. Wiederherstellung und Alarmierung werden im Test bewiesen.

### 12.7 Späterer EU-Wechsel

Die gemeinsame Fachlogik importiert kein Firebase- oder Stripe-SDK. Speicherzugriff, Authentifizierung, Provider und Versand besitzen eigene Schnittstellen. Transaktionen und Eindeutigkeitsregeln werden explizit beschrieben, damit ein späterer SQL-Adapter dieselben Garantien erbringen kann.

Für einen Umzug braucht es dennoch Export, Datenprüfung, Identitätszuordnung, Testbetrieb, Umschaltplan und Rückfallmöglichkeit. Es wird kein Wechsel mit einem einzigen Konfigurationsfeld versprochen. Firestore-Region und späterer Hostingstandort lösen außerdem nicht automatisch sämtliche Datenschutzfragen zu allen Unterauftragnehmern.

Ein Zahlungsanbieterwechsel lässt eigene Schulen, Mitgliedschaften und Historie bestehen. Aktive Abos und hinterlegte Zahlungsmittel lassen sich dagegen nicht pauschal beliebig kopieren. Die Migration hängt von Providerprozessen, Zahlart, Zustimmung und Vertrag ab. Deshalb bleibt die Produktidentität unabhängig vom Stripe-Kundenkonto.

Für native Apps kann derselbe eigene Zugangsstatus verwendet werden. Ob und wie ein externer Webkauf innerhalb einer konkreten App angeboten werden darf, wird vor dem jeweiligen Store-Release gesondert geprüft. Der Webplan ist keine pauschale Freigabe für eingebettete App-Zahlungsbuttons.

## 13. Finanzielle Sonderfälle

| Fall | Verbindliche technische Behandlung | Fachliche Entscheidung |
|---|---|---|
| 10 € von 30 € bezahlt | Rest 20 €, Zugang dieser Periode bleibt ausstehend | Keine Vollfreigabe allein aufgrund Teilzahlung |
| Weitere 20 € zugeordnet | Einmalig vollständige Rechnung und Periode aktualisieren | Startbedingung zusätzlich prüfen |
| Zu viel überwiesen | Überschuss getrennt ausweisen, keine zweite Jahreslizenz | Erstattung oder vereinbarte Verrechnung |
| Verwendungszweck fehlt | Nicht beliebig einem Benutzerkonto zuweisen | Nachvollziehbarer Zuordnungsfall |
| Ein Käufer, mehrere Rechnungen | Tatsächliche Zuordnung des Providers prüfen | Manuelle Klärung bei Uneindeutigkeit |
| Vollständige Nullrechnung durch erlaubte Aktion | Vertraglich gültigen Nullfall erkennen | Keine erfundene Bankzahlung |
| Zahlung nach Vertragsende | Zugehörige offene Periode erkennen | Vereinbarte Spätzahlungsregel, gegebenenfalls Änderung |
| Rückzahlung nach Aktivierung | Finanzkorrektur und Rechteentscheidung getrennt | Verbrauch, Umfang und Anspruch berücksichtigen |
| Rücklastschrift / Streitfall | Forderung und Risikofall sichtbar machen | Nicht pauschal alle Schulkonten sofort löschen |
| Abo gekündigt, Rechnung noch offen | Kündigung und Forderung getrennt erhalten | Keine erneute Verlängerung ohne Regelgrundlage |
| Stripe vorübergehend nicht erreichbar | Bestehende geprüfte Rechte weiter zeitlich auswerten | Neue Käufe ausstehend, kein Gratis-Premium auf Zuruf |

Die bereits getestete Zuordnung von Teilüberweisungen belegt den konkreten Testfall. Für den Betrieb werden auch Überzahlung, Restguthaben, mehrere offene Rechnungen und ungeklärte Eingänge geprüft. [Stripe Banküberweisungen für Rechnungen](https://docs.stripe.com/invoicing/bank-transfer)

Auch ein als bezahlt markierter Beleg ist nicht in jedem Fall ein neuer Geldfluss. Zulässiger Rabatt, vorhandenes Guthaben und eine manuelle Kennzeichnung außerhalb des normalen Zahlungswegs müssen erkennbar bleiben. Eine manuelle externe Zahlung wird nur über den definierten Finanzprozess mit Nachweis und Audit zugelassen. Ein unbekannter Preis oder ein manipuliertes Null-Euro-Produkt verleiht keinen Zugang.

## 14. Umsetzung in überprüfbaren Arbeitspaketen

Dieser Abschnitt ist der technische Folgeplan, keine heutige Umsetzungserlaubnis. Vor jedem Paket werden der aktuelle Integrationsstand, parallele Arbeiten und die eigenen betroffenen Dateien überprüft. Bestehende Task-ID und Draft-PR bleiben erhalten. Production benötigt später einen eigenen ausdrücklichen Auftrag.

### Paket A – Geschäftsregeln und Vertragsmatrix

**Ergebnis:** Ein versioniertes Regelwerk für Preise, Käufergruppen, Leistungsumfang, Start, Ende, Verlängerung, Kulanz und Belegweg.

1. Entscheidungen aus Abschnitt 3 mit Verantwortlichem und Status in docs/billing/business-rules.md übertragen.
2. Anbieter-/Verkäuferdaten fachlich klären, ohne Konto oder Liveprodukt anzulegen.
3. Konkretes persönliches und schulisches Beispielszenario mit Datum, Betrag, Plätzen und Rechnungsempfänger durchspielen.
4. Steuer-/Vertragsprüfung und Zuständigkeiten für Buchhaltung dokumentieren.
5. Preis- und Bedingungenversion definieren, die später vom Checkout referenziert wird.

**Abnahme:** Keine widersprüchlichen Angaben zwischen Tarifseite, Vertrag, Rechnung und Berechtigungszeitraum. Noch offene Echtgeldentscheidungen sind explizit gesperrt.

### Paket B – Reale Produktidentitäten, Zugang und fünf kostenlose Tests

**Ergebnis:** Regulär angemeldete Testlehrkräfte erhalten serverseitig korrekte Rechte und Guthaben.

1. Aktuelle Erstellungspfade aus app.js und Backend erfassen. Keine Vermutung aus dem alten Vorschaucode übernehmen.
2. Reine access-, contracts- und usage-Module mit fokussierten Fachtests implementieren.
3. Speicheradapter und Identitätszuordnung mit Transaktionen und Indizes ergänzen.
4. GET /v1/me/access und serverseitigen Guard an sämtlichen vereinbarten Verbrauchspfaden anschließen.
5. UI für Restguthaben und Quellen ergänzen.
6. Bestehende aktive Prüfungen und Kontolöschprozesse gegen die neuen Guards prüfen.

**Prüfung:** Node-Tests und vorhandene Functions-Checks, Emulatorprüfung für Speicher-/Zugriffsregeln, zwei echte Testidentitäten in der Testumgebung. Kein Live-UID-Test mit Produktivdaten.

### Paket C – Schulverwaltung und kostenlose Freigaben

**Ergebnis:** Schulen, Mitgliedschaften, Plätze, Einladungen und Adminfreigaben sind unabhängig von Zahlungen testbar.

1. Schul- und Mitgliedschaftsdaten einschließlich Finanzrollen anlegen.
2. Einladung mit gehashtem Token und atomarer Platzzuordnung implementieren.
3. Schulansicht und Admin-Kontendetail erweitern.
4. Kostenlose Freigaben mit Audit und Ablauf implementieren.
5. Wechsel, Austritt, letzte Verwaltungsrolle und mehrere Schulen prüfen.

**Abnahme:** Zwei gleichzeitige Annahmen überschreiten kein Kontingent. Fremde Schulen und deren Rechnungen bleiben unzugänglich. Eine kostenlose Freigabe erzeugt keinen Stripe-Umsatz.

### Paket D – Vollständiger Stripe-Lifecycle in der Testumgebung

**Ergebnis:** Persönlicher Kauf und Schulrechnung steuern wirkliche Produktrechte.

1. Vorhandene Sandboxverbindung und benötigte Geheimnisnamen prüfen. Keine neuen Schlüssel automatisch voraussetzen.
2. Provideradapter, zugelassene Testpreise und interne Käuferzuordnung implementieren.
3. Webhook-Inbox, fachliche Deduplizierung und wiederaufnehmbare Verarbeitung einbauen.
4. Persönlichen Checkout und sichere Portalsitzung verbinden.
5. Schulrechnung dem bestätigten Vertrag und dessen Zeitraum zuordnen.
6. Folgeperioden, Kündigung, Kulanz, Ausfälle und Rückzahlung behandeln.
7. Nachzahlungs-/Teilzahlungsfälle über tatsächliche Sandboxbelege prüfen.
8. Abgleichauftrag implementieren und ein absichtlich ausgefallenes Ereignis reparieren lassen.

**Abnahme:** Premium beziehungsweise Schulnutzung ist in der echten Testfunktion freigeschaltet. Eine reine Statuskarte reicht nicht. Derselbe Zustand bleibt nach Logout, neuem Login und auf einem zweiten Gerät korrekt.

### Paket E – Rechnung, E-Mail und Buchhaltungsprobe

**Ergebnis:** Testbelege sind formal vorbereitet, visuell geprüft, richtig adressiert und nachvollziehbar übermittelt.

1. Verkäufer-/Steuerkonfiguration und Logoentwurf fachlich abgleichen.
2. Vier Belegmuster aus Abschnitt 9.3 erstellen.
3. Versandmatrix mit eindeutiger Zuständigkeit umsetzen.
4. Kontrollierte Empfängerpostfächer und Rückläufer testen.
5. Falls der erste Schulkäufer es benötigt, strukturierten Beleg und tatsächliche Zustellstrecke validieren.
6. Musterexport an den gewählten Buchhaltungsweg importieren lassen und Differenzen klären.

**Abnahme:** Keine doppelte Forderung, korrekte Beträge und Zeiträume, Originalbeleg verfügbar, Empfängerberechtigung richtig, tatsächliche Versand-/Importnachweise dokumentiert.

### Paket F – Migration und Betriebsbereitschaft

**Ergebnis:** Bestehende Konten können nachvollziehbar überführt und Fehler bearbeitet werden.

1. Datenlose Migrationsvorschau mit Anzahl betroffener Konten und Quellen erstellen.
2. Bestandsschutz und kostenlose Übergangsrechte nach bestätigter Regel abbilden.
3. Wiederholbare Migration mit Kennzeichen und Rückfallplan testen.
4. Ausnahmeliste, Metriken, Alarmierung und Supportansichten vervollständigen.
5. Sicherung, Wiederherstellung und Schlüsselwechselverfahren dokumentieren und für Testdaten erproben.
6. Verantwortliche für Finanzfälle, Support und technische Fehler festlegen.

**Abnahme:** Keine überraschende Sperre bestehender laufender Prüfungen. Wiederholung erzeugt keine doppelten Verträge, Guthaben oder Mitgliedschaften. Ein anderer Bearbeiter kann anhand der Dokumentation einen Fall auflösen.

### Paket G – Gesamtabnahme und spätere Einführung

**Ergebnis:** Abgenommener Kandidat auf einer stabilen Testadresse, danach separat freizugebender Liveplan.

1. Aktuellen Zielbranch integrieren und normale CI sowie gezielte Abrechnungstests ausführen.
2. Definierten Quellcommit ausschließlich in die Testumgebung deployen und Laufzeit-/Hostingnachweise sichern.
3. Mit normalen angemeldeten Testlehrkräften und Schulrollen die Abnahmefälle durchführen.
4. Martin prüft die tatsächlichen Konto-, Schul- und Belegansichten.
5. Offene Fehler, fachliche Entscheidungen und Restarbeiten sichtbar dokumentieren.
6. Erst danach Livekonfiguration, Verkäuferprüfung und Einführung als eigenen Auftrag vorbereiten.

Livebeginn erfolgt gegebenenfalls mit begrenztem Kundenkreis und abschaltbaren Kaufwegen. Abschalten eines neuen Kaufs darf laufende bereits bezahlte Rechte nicht löschen. Ein technischer Rückbau löscht keine bestehenden finanziellen Verpflichtungen.

### Reihenfolge und Aufwandseinordnung

A ist die fachliche Grundlage. B und C schaffen die Produktidentität. D verbindet Zahlungen. E kann nach Klärung der Verkäuferdaten teilweise parallel vorbereitet werden, benötigt für die Abnahme aber D. F und G schließen den Betrieb ab.

Eine belastbare Terminzusage ist vor Paket A und der vollständigen Prüfung aktueller Erstellungspfade nicht möglich. Die früher dokumentierten 8–13 Personentage betrafen einen kleineren persönlichen Web-Sandboxumfang. Sie sind keine Zusage für die hier beschriebene vollständige Schul-, Rechnungs- und Betriebsverwaltung. Externe Rechts-/Steuerprüfung, Wartezeit bei Schulträgern und Providerfreigaben werden separat geplant.

## 15. Verbindliche Abnahmefälle

Jeder Fall erhält später Beleg, Quellcommit, Umgebung, Zeitpunkt und Ergebnis. Die Liste beschreibt geplante Prüfungen und behauptet keine bereits bestandenen Tests. Zusammengehörige Fälle können in automatisierten Fachtests gebündelt werden. Zahlungs- und Zustellwege benötigen zusätzlich echte kontrollierte Testnachweise.

### Konto und Guthaben

| ID | Fall | Erwartung |
|---|---|---|
| K01 | Neue verifizierte Person | Genau fünf kostenlose Einheiten |
| K02 | Fünf erfolgreiche neue KI-Tests | Rest null, sechste Erstellung abgewiesen |
| K03 | Bestehenden Test vollständig überarbeiten | Keine neue Startguthaben-Einheit |
| K04 | Test löschen | Verbrauch bleibt bestehen |
| K05 | KI-/Speicherfehler vor Abschluss | Keine dauerhaft verlorene Einheit |
| K06 | Gleichen Auftrag wiederholen | Ein Test und ein Verbrauch |
| K07 | Zwei Aufträge bei einer Einheit | Höchstens ein erfolgreicher neuer Test |
| K08 | Premium endet | Kein neues Fünferguthaben |
| K09 | Loginidentitäten zusammenführen | Eine interne Person und keine Guthabenverdoppelung |
| K10 | Bestandsmigration zweimal ausführen | Keine doppelte Ausstattung |
| K11 | Abonnement bei gesperrtem Konto bezahlen | Sperre bleibt, Finanzfall wird sichtbar |
| K12 | Import/Kopie/manuelle Anlage | Genau die bestätigte Zählregel, vorab verständliche Anzeige |
| K13 | Rest null, einen der fünf kostenlosen Tests überarbeiten | Vollständige Bearbeitung bleibt ohne weitere Startguthaben-Einheit möglich |

### Persönliches Abo

| ID | Fall | Erwartung |
|---|---|---|
| P01 | PayPal-Erstzahlung | Eigene echte Produktfunktion wird freigegeben |
| P02 | Karten-Erstzahlung einschließlich zusätzlicher Authentifizierung | Keine voreilige Freigabe |
| P03 | Checkout abbrechen oder nur Rücksprung-URL öffnen | Keine neuen bezahlten Rechte |
| P04 | Doppelter Kaufklick / bestehendes Abo | Kein zweites ungewolltes Abo |
| P05 | PayPal-Folgeperiode | Rechte verlängern genau einmal auf richtige Periode |
| P06 | Folgezahlung schlägt fehl | Bezahlte Rechte bleiben, definierte Kulanz beginnt einmalig |
| P07 | Zahlung wird innerhalb Kulanz nachgeholt | Automatisch konsistenter aktiver Zustand |
| P08 | Kulanz läuft ab | Nur betroffene Quelle endet |
| P09 | Kündigung zum Ende | Bis dahin Zugang, danach keine ungewollte neue Periode |
| P10 | Andere aktive Rechte bei Kündigung | Schule/Freigabe bleibt wirksam |
| P11 | Zulässige Nullrechnung durch späteren Rabatt | Richtige Periode ohne fiktiven Zahlungseingang |
| P12 | Teilweise und vollständige Erstattung | Beleg und Rechtefolge gemäß Regel getrennt |
| P13 | Konto mit Schulrecht und eigenem Abo | Überlappung sichtbar, keine stille Kündigung |
| P14 | Neues Gerät / neue Sitzung nach Zahlung | Identischer serverseitiger Zugang |
| P15 | PayPal-Zustimmung wird widerrufen | Künftige Zahlungsfähigkeit und Benachrichtigung prüfen, bereits bezahlte Zeit nicht pauschal löschen |
| P16 | Wiederkehrende PayPal-Zahlung nicht für Händler freigegeben | Kein unzutreffendes Aboangebot, Freigabehindernis vor Echtgeldstart sichtbar |

### Schule, Mitgliedschaft und Zeitraum

| ID | Fall | Erwartung |
|---|---|---|
| S01 | Käufer ist Schulträger | Rechnung an richtigen Rechtsträger |
| S02 | Bestellung unbezahlt | Verwaltung gegebenenfalls vorbereitbar, keine bezahlte Nutzung |
| S03 | 10 € auf Rechnung über 30 € | Rest 20 €, Schulperiode nicht freigegeben |
| S04 | Weitere 20 € | Rechnung bezahlt, richtige Schulperiode einmalig aktiv |
| S05 | Bereits vor Vertragsbeginn bezahlt | Nutzung erst ab vereinbartem Beginn |
| S06 | Zu viel überwiesen | Überschuss sichtbar, kein zusätzliches Jahr |
| S07 | Mehrere offene Rechnungen / fehlende Referenz | Eindeutige Zuordnung oder Ausnahmefall |
| S08 | Einladung an bestätigte Person | Genau eine Mitgliedschaft und Platzzuweisung |
| S09 | Einladung weitergegeben / falsche E-Mail | Keine Übernahme durch fremde Person |
| S10 | Link abgelaufen, widerrufen oder schon verwendet | Keine neue Zuordnung |
| S11 | Zwei Annahmen bei einem freien Platz | Kontingent wird nicht überschritten |
| S12 | Reservierung läuft ab | Platz wird wieder verfügbar |
| S13 | Beitritt sechs Monate nach Beginn | Nur gemeinsame Restlaufzeit |
| S14 | Person verlässt Schule | Nur diese Schulquelle endet |
| S15 | Mehrere Schulen | Daten, Plätze und Rechte nach Bereich getrennt |
| S16 | Letzter Schuladministrator tritt aus | Geordnete Übergabe erforderlich |
| S17 | Reiner Finanzkontakt | Keine Schüler-/Unterrichtsdaten und keine unberechtigte Produktnutzung |
| S18 | Ein Käufer bezahlt mehrere Schulen | Kein unbeabsichtigter Einblick in andere Schule |
| S19 | Verlängerung früh bezahlt | Nächste Periode schließt korrekt an |
| S20 | Ohne bestätigte Verlängerung Ende erreicht | Kein ungefragter Jahresvertrag |
| S21 | Verlängerung bestätigt, Zahlung offen | Forderung und Zugang sauber getrennt |
| S22 | Späte Zahlung | Vertraglicher Zeitraum bleibt nachvollziehbar, keine stille Umdatierung |
| S23 | Start 29. Februar / Zeitzonenwechsel | Einheitliche Kalenderregel in Rechnung und Zugang |
| S24 | Vertragsende während laufender Prüfung | Definierter Abschluss-/Exportpfad funktioniert |
| S25 | Eine Überweisung deckt mehrere Schulrechnungen | Tatsächliche Zuordnung je Rechnung, kein versehentlicher doppelter Zeitraum |

### Administration, Belege und Kommunikation

| ID | Fall | Erwartung |
|---|---|---|
| A01 | Kostenlose Premium-Freigabe | Zugang ohne Rechnung und ohne Umsatz |
| A02 | Freigabe endet / wird widerrufen | Andere Quellen bleiben wirksam |
| A03 | Admin ordnet Person Schule zu | Rolle, Platz, Zeitraum und Audit korrekt |
| A04 | Support ohne Finanzrolle | Keine Erstattung und keine Finanzdatenausweitung |
| A05 | Konto zeigt Premium | Quelle und gültiger Zeitraum nachvollziehbar |
| R01 | Logo- und Stammdatenmuster | Lesbar, vollständig, keine Platzhalter |
| R02 | Zwei Teilzahlungen | Eine Rechnung und korrekter Restbetrag |
| R03 | Korrektur nach Finalisierung | Ausgangsbeleg und Korrektur nachvollziehbar |
| R04 | Strukturierter Schulbeleg erforderlich | Formatvalidierung und erfolgreicher Empfang |
| R05 | Unberechtigter Belegabruf / fremde Kunden-ID | Zugriff abgewiesen |
| R06 | Gleicher Ereignisanlass mehrfach | Keine mehrfache Forderung oder unkontrollierte Mehrfachmail |
| R07 | E-Mail-Rückläufer | Sichtbarer Fall, Beleg weiter sicher abrufbar |
| R08 | Tatsächliches kontrolliertes Postfach | Rechnung und Links korrekt angekommen |
| R09 | Export mit Gebühren und Erstattung | Abgestimmter Import ohne Erlösverdoppelung |
| R10 | Kontolöschung | Produktlöschung und erforderliche Belegaufbewahrung getrennt |
| R11 | Käuferadresse nach Finalisierung geändert | Bestehender Beleg bleibt nachvollziehbar, neue Belege verwenden geprüften neuen Stand |

### Sicherheit und Wiederanlauf

| ID | Fall | Erwartung |
|---|---|---|
| T01 | Fehlende / falsche Webhooksignatur | Keine Zustandsänderung |
| T02 | Falsche Umgebung / Providerkonto | Keine Test-/Livevermischung |
| T03 | Gleiches Ereignis erneut | Keine doppelte Wirkung |
| T04 | Verschiedene Ereignisse zur selben Rechnung | Eine fachliche Periode |
| T05 | Ereignisse in umgekehrter Reihenfolge | Neuere bezahlte Rechte bleiben korrekt |
| T06 | Webhook vorübergehend nicht erreichbar | Wiederholung oder Abgleich repariert Zustand |
| T07 | Fehler nach Inboxspeicherung | Wiederaufnahme ohne doppelten Beleg oder Grant |
| T08 | Provider vorübergehend nicht erreichbar | Bestehende geprüfte Rechte bleiben korrekt, Kauf ausstehend |
| T09 | Direkter Browser-/Datenbankschreibversuch | Kein Premium und keine Schulplatzänderung |
| T10 | Fremde Schule oder Person als Parameter | Autorisierung verhindert Zugriff |
| T11 | Ablaufauftrag fällt aus | API verlängert abgelaufene Rechte nicht |
| T12 | Sicherung wiederherstellen / Adaptervertrag | Beziehungen, Salden und Eindeutigkeit bleiben nachvollziehbar |
| T13 | Öffentlicher Build und Protokolle prüfen | Keine Geheimnisse oder privaten Belegdaten |
| T14 | Kaufweg per Funktionsschalter deaktivieren | Bestehende bezahlte Nutzer bleiben korrekt nutzungsberechtigt |
| T15 | Unbekannter Nullpreis / manuell bezahlt ohne freigegebenen Nachweis | Keine unberechtigte Lizenz aus bloßem Finanzstatus |

## 16. Betriebsregeln und Dokumentation

### 16.1 Normalfall und Ausnahme

Automatisch laufen sollen bestätigte Käufe, zugeordnete Zahlungen, zulässige Verlängerungen, Standardbelege, definierte Erinnerungen, Rechteberechnung und planmäßiger Ablauf. Menschliche Bearbeitung bleibt für unklare Käuferdaten, strittige Zahlungen, fehlerhafte Rechnungen, Schulträger-Sonderanforderungen, Kulanzentscheidungen und steuerliche Sonderfälle vorgesehen.

Die Administration zeigt Fälle mit Alter, Betrag, betroffenem Vertrag, letzter technischer Ursache und zuständiger Person. Ein Fall gilt erst als erledigt, wenn sowohl Finanz- als auch Zugangsfolge überprüft sind. Keine Lösung durch unprotokolliertes Bearbeiten einzelner Datenbankfelder.

### 16.2 Betriebsübersicht

Mindestens sichtbar sind offene bezahlte-aber-nicht-freigeschaltete Käufe, unzugeordnete Eingänge, fehlgeschlagene Ereignisse, bald endende Schulverträge, überfällige Forderungen, nicht zugestellte Belege und Exportdifferenzen. Personenbezogene Details werden nur berechtigten Rollen angezeigt.

Die Startphase erhält eine kurze regelmäßige Kontrolle durch den benannten Betreiber. Mit stabilem Betrieb kann sie stärker auf Meldungen und Ausnahmen reduziert werden. Eine vollständig unbeaufsichtigte Abrechnung wird nicht als realistischer Abschluss versprochen.

### 16.3 Erforderliche Dokumente

- Versionierte Geschäftsregeln mit Preis-/Vertragsentscheidungen.
- Daten- und Rechtemodell einschließlich Rollenmatrix und Aufbewahrung.
- API- und Adaptervertrag, Ereignismatrix und Eindeutigkeitsregeln.
- Rechnungsvorlagen, Versandmatrix und Nachweise für strukturierte Belege.
- Anleitung für Schulgründung, Einladungen, Verwaltungswechsel und Austritt.
- Supportanleitung für Zahlung offen, nicht zugeordnet, Erstattung und Kündigung.
- Buchhaltungszuordnung, Exportbeispiel und bestätigte Importprobe.
- Wiederanlauf, Sicherung, Schlüsselwechsel, Störung und kontrollierte Kaufabschaltung.
- Migrationsvorschau, Ergebnis, Rückfallplan und Benachrichtigung bestehender Nutzer.
- CI-, Deploy- und fachliche Abnahmenachweise mit konkretem Commit und Umgebung.

## 17. Was Martin wann bereitstellen muss

### Für die weitere Testentwicklung

Benötigt werden nur der bestehende begrenzte Zugriff auf GradeCrew sandbox, die bereits vorhandenen serverseitigen Testgeheimnisse, das richtige Testprojekt, kontrollierte Testkonten und gegebenenfalls ein kontrolliertes E-Mail-Postfach. Vorhandene Zugänge werden zuerst überprüft. Geheimnisse werden weder in den Chat noch in öffentliche Dateien kopiert.

Für Rollen-/Produktprüfungen müssen normale Testlehrkräfte innerhalb der autorisierten Testumgebung verwendet werden. Die bisherigen zwei synthetischen Sitzungen reichen als vollständige Signup- und Schulabnahme nicht aus. Namen und E-Mails echter Kolleginnen oder Schüler sind dafür nicht erforderlich.

### Für Logo und Rechnungsentwurf

Benötigt werden freigegebenes Logo, tatsächlicher Verkäufername und Anschrift, steuerliche Behandlung, geschäftlicher Kontakt, gewünschte Rechnungs-E-Mail und freigegebene Beispiel-Leistungsbeschreibung. Fehlende Rechts-/Steuerangaben bleiben als Platzhalter markiert. Es wird daraus kein freigegebener Livebeleg gemacht.

### Erst für den späteren Echtgeldstart

Dann sind der verifizierte Stripe-Verkäuferaccount, das passende Geschäftskonto, aktivierte und zulässige Zahlarten, sichere Livegeheimnisse, Domain-/Mailkonfiguration, bestätigte Vertragsbedingungen, Belegarchiv, Buchhaltungsweg und ein ausdrücklicher Produktionsauftrag nötig. PayPal kann abhängig von der tatsächlichen Kontokonfiguration eine zusätzliche Händlerverknüpfung oder Freigabe verlangen. Das wird separat geprüft und nicht aus dem Sandboxerfolg abgeleitet.

## 18. Abschlusskriterien

Der bezahlte GradeCrew-Webbetrieb gilt erst als einführungsbereit, wenn alle folgenden Aussagen nachweisbar wahr sind:

1. Bestätigte Regeln und Preise sind auf Website, Vertrag und Rechnung gleich.
2. Regulär angemeldete Lehrkräfte besitzen serverseitig geprüfte Rechte und genau das vereinbarte kostenlose Guthaben.
3. Schulen haben prüfbare Mitgliedschaften, Kontingente, Rollen und gemeinsame Vertragsperioden.
4. Erstzahlung, Folgezahlung, Teilzahlung, Kündigung, Ablauf und Erstattung haben getestete Folgen.
5. Belege werden richtig erzeugt, berechtigten Empfängern übermittelt und aufbewahrt.
6. Der erste tatsächlich betroffene Schulträger akzeptiert den vorgesehenen Rechnungsweg.
7. Buchhaltungsimport und Zahlungs-/Auszahlungsabgleich sind praktisch geprüft.
8. Wiederanlauf, Alarmierung, Bearbeitungsfälle und verantwortliche Personen sind festgelegt.
9. Bestandskonten und laufende Prüfungen können ohne überraschende Daten-/Zugangsverluste überführt werden.
10. Ein geprüfter Stagingkandidat besitzt nachvollziehbare CI-, Deploy- und Nutzertestnachweise. Die anschließende Production-Einführung wird gesondert freigegeben.

**Nächster sinnvoller Schritt:** Diesen Plan als gemeinsamen Rahmen prüfen, die wenigen Vertrags- und Preisentscheidungen aus Abschnitt 3 festhalten und danach Paket B/C/D in der bestehenden isolierten Testumgebung auf reale Produktkonten erweitern. Die erste konkrete Produktabnahme soll eine echte Testlehrkraft mit persönlichem Premium und eine Schule mit zwei eingeladenen Lehrkräften einschließlich Laufzeitende umfassen.

## 19. Technischer Übergabevertrag für die ersten Umsetzungsschritte

Dieser Anhang legt die Verbindung zwischen den Paketen fest. Die Namen sind vorgeschlagene neue Schnittstellen. Eine spätere Anpassung an vorhandene gleichwertige Produktabstraktionen wird dokumentiert. Unentschiedene Werte aus Paket A werden als versionierte policy übergeben und nicht als zufällige Konstanten verteilt.

### 19.1 Gemeinsame Datentypen

Interne IDs sind undurchsichtige Zeichenfolgen. Zeitpunkte sind UTC-Zeitstempel. Ein Zeitraum hat startInclusive und endExclusive. Geld hat amountMinor als Ganzzahl und currency. Ein Scope hat kind=personal oder school sowie die interne ID. Eine Providerreferenz enthält environment, providerAccountId und externe ID.

AccessDecision enthält allowed, featureCodes, sourceIds, validUntil, freeCreationsRemaining und reasonCode. Es enthält keine geheimen Provider- oder Beleglinks. Erwartete Gründe sind mindestens allowed, authentication_required, account_suspended, quota_exhausted, payment_pending, period_not_started, period_ended und school_seat_required. Übersetzbare Erklärungstexte werden getrennt von den stabilen Codes geführt.

### 19.2 Paket B1 – reine Rechteberechnung

**Datei:** functions/lib/billing/domain/access.js. Schnittstelle evaluateAccess({person, scope, at, grants, periods, memberships, seats, usage, policy}) → AccessDecision. Keine Netzabfrage und kein impliziter Zugriff auf die Systemuhr.

- [ ] In functions/test/billing-access.test.js zuerst die Fälle K08, K11, K13, P10, S05 und S14 abbilden. Die Tests verlangen unter anderem keine Freigabe vor Beginn, keine Aufhebung einer Sperre und erhaltene kostenlose Bearbeitung bei Rest null.
- [ ] node --test functions/test/billing-access.test.js ausführen. Vor Implementierung muss die fehlende Fachfunktion beziehungsweise die noch falsche konkrete Erwartung scheitern.
- [ ] evaluateAccess implementieren. Quellen nur im passenden Scope und Zeitraum berücksichtigen. Keine pauschale Premium-Eigenschaft schreiben.
- [ ] Dieselbe Testdatei erfolgreich ausführen und die Schnittstelle als Paketcheckpoint sichern.

### 19.3 Paket B2 – belastbarer Verbrauch

**Dateien:** domain/usage.js, application.js und firestore-store.js im oben definierten Billing-Verzeichnis. Anwendungsfunktionen reserveCreation({personId, scope, requestId, at}, deps), commitCreation({reservationId, testId, at}, deps) und releaseCreation({reservationId, reason, at}, deps).

Eine Reservierung liefert reservationId, state und gegebenenfalls die schon gespeicherte testId. deps enthält autorisierten Speicher und Fachkonfiguration. Der Server ermittelt die Person aus der Anmeldung. requestId ist innerhalb der Person eindeutig. Die Speicherabstraktion bietet withTransaction(work) und eindeutige Ledger-Schlüssel. Bestätigter Verbrauch und Zuordnung zur gespeicherten Test-ID müssen eine gemeinsam abgesicherte fachliche Operation sein.

- [ ] In functions/test/billing-usage.test.js K02, K04–K07 und K10 mit einer echten Transaktionsprüfung ergänzen.
- [ ] node --test functions/test/billing-usage.test.js ausführen und den konkreten fehlenden Schutz nachweisen.
- [ ] Reservierung, Abschluss, Freigabe und Behandlung abgebrochener Aufträge implementieren.
- [ ] Parallele Ausführung bei einer Rest-Einheit sowie Wiederholung nach einem simulierten Absturz erfolgreich prüfen. Danach erst an die Produktpfade anschließen.

### 19.4 Paket C1 – Einladung und Schulplatz

**Dateien:** domain/invitations.js, application.js und firestore-store.js. Anwendungsfunktion acceptSchoolInvitation({token, authenticatedPersonId, at}, deps) → {membershipId, schoolId, allocationState, validUntil}. Verifizierte E-Mail und Rollen kommen aus dem serverseitig geladenen Identitätsdatensatz, nicht aus einem Browserfeld.

- [ ] In functions/test/billing-school-invitations.test.js S08–S12, S14–S18 abbilden. Zwei Annahmen um den letzten Platz werden gleichzeitig gestartet.
- [ ] node --test functions/test/billing-school-invitations.test.js ausführen und das fehlende Verhalten nachweisen.
- [ ] Tokenprüfung, Rollenprüfung und atomare Mitgliedschaft/Platzzuordnung implementieren. Ein bereits angenommener Vorgang bleibt idempotent derselben Person zugeordnet.
- [ ] Positive Annahme und negative Versuche mit falscher Person, falscher Schule, Ablauf und vollem Kontingent erfolgreich prüfen. Keine nachträgliche Platzprüfung nur im Browser.

### 19.5 Paket D1 – Rechnung auf Periode abbilden

**Dateien:** domain/invoices.js, stripe-adapter.js und application.js. applyInvoiceSnapshot({providerRef, invoice, at}, deps) → {status, periodId, effectIds}. status ist applied, duplicate, rejected oder needs_review. invoice ist der vom Adapter gelesene normalisierte Beleg mit Käufer, Währung, Preis-/Vertragsreferenz, Beträgen, Zahlungsart und Zeitraum. Nicht zuordenbare Daten erzeugen einen Ausnahmefall.

- [ ] In functions/test/billing-invoice-application.test.js S03–S07, S19–S22 und T02–T07/T15 mit expliziten Erwartungen abbilden. Nach 1000 von 3000 EUR-Cent bleibt die Periode pending. Nach weiteren 2000 EUR-Cent entsteht genau ein gültiges Periodenrecht.
- [ ] node --test functions/test/billing-invoice-application.test.js ausführen und fehlende Zuordnung beziehungsweise Deduplizierung nachweisen.
- [ ] Erwartungsprüfung, Transaktion und eindeutige Periodenwirkung implementieren. Der Webhookeingang ruft diesen Anwendungsfall erst nach Signatur und Providerabgleich auf.
- [ ] Tests wiederholen und zusätzlich tatsächliche Stripe-Sandboxereignisse durch den veröffentlichten Testserverpfad verarbeiten. Ein lokal erzeugtes Ereignis belegt nur lokale Fachlogik.

### 19.6 Paket D2/E1 – Wiederanlauf und Versand

**Dateien:** application.js, mail-adapter.js sowie getrennte geplante Jobs in functions/lib/billing/jobs.js. runBillingReconciliation({at, cursor, limit}, deps) → {nextCursor, checked, repaired, exceptionIds}. processOutbox({at, limit}, deps) → {sent, deferred, failed}. Beides arbeitet begrenzt und wiederaufnehmbar.

- [ ] In functions/test/billing-recovery.test.js T03–T08/T11 prüfen. In functions/test/billing-communications.test.js R06–R08 prüfen. Technische Tests verwenden Providerantworten. R08 benötigt zusätzlich einen dokumentierten kontrollierten Postfachnachweis.
- [ ] Beide Dateien mit node --test ausführen und die konkret noch fehlende Wiederaufnahme beziehungsweise Deduplizierung nachweisen.
- [ ] Abgleich und Versandzustände implementieren. Ein unklarer externer Versandstatus wird nicht als garantiert ungesendet behandelt.
- [ ] Nach simulierter Unterbrechung denselben Auftrag erneut verarbeiten. Es dürfen kein zweiter Vertrag und kein unkontrollierter zweiter Versandauftrag entstehen.

### 19.7 Gemeinsame Prüfung und Sicherung je Paket

- [ ] npm --prefix functions test und npm --prefix functions run check mit dem festgelegten Node-22-Werkzeug ausführen. Auf eine syntaktisch erfolgreiche Einzeldatei darf keine Gesamtbehauptung gestützt werden.
- [ ] Bei Rules-Änderungen die bestehenden Emulatorprüfungen um die konkreten neuen Datenpfade erweitern und ausführen. Der genaue vorhandene Emulatorbefehl wird beim Einstieg aus dem aktuellen Produktbranch übernommen.
- [ ] Bei Oberflächenänderungen echte Rollen, mobile Breite, verständliche Fehlermeldungen und erneute Anmeldung prüfen.
- [ ] Eigene Änderungen, erfolgreiche Prüfungen und offene Punkte in derselben Taskübergabe sichern, committen und auf den bestehenden Aufgabenbranch übertragen.
- [ ] Vor einem Testdeployment Commit, Projekt, Dienst und Hostingziel nennen. Anschließend tatsächliche Laufzeit und veröffentlichte Dateien nachweisen. Kein Productiondeploy aus diesem Anhang ableiten.
