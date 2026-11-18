# GradeCrew – Aufgabenliste für Zahlungen, Schulen und Abrechnung

Stand 18. November 2026. Bestehende Aufgabe GC-BILLING-PLAN-01, bestehender Draft-PR411. Arbeitsliste zum [ausführlichen Zahlungsplan](../superpowers/plans/2026-11-18-gradecrew-zahlungsbetrieb.md).

**Aktualisierung während der Umsetzung:** Martin beauftragt die technische Umsetzung in der Testumgebung. Neu gelten14Tage und höchstens fünf Testdateien einschließlich manueller Anlage/Kopie/Import. Persönlich15EUR monatlich oder120EUR jährlich im Voraus, Schule50EUR je Platz/Jahr, als Endpreise einschließlich gegebenenfalls anfallender Umsatzsteuer bestätigt. Verkäuferdaten und Regelbesteuerung bestätigt. Persönliche Schuleinladungen und bewusste Jahresverlängerung bestätigt. [Aktuelle Regeln](business-rules.md) ersetzen ältere abweichende Angaben. Produktbranch feature/billing-product-20261118. Offene Gesamtaufgaben bleiben bis zur tatsächlichen Integration offen.

**Lokal vorbereitet, noch nicht veröffentlicht:** J02–J11 besitzen einen ersten geprüften Produktblock mit echter Kontoanmeldung im Emulator, geschützter Fünferzählung/14-Tage-Frist, Adminfreigaben, Schulplätzen, persönlichen Einladungen und sofortiger Rechteprüfung nach Austritt.509Functions-Fälle,29lokale Transaktions-/Handlerfälle und12Rules-Fälle grün. J05/J08/J09 in den tatsächlichen lokalen Produktkomponenten und375/768/1440px-Layoutprobe geprüft. J18 hat drei private, visuell geprüfte PDF-Muster mit Logo für15/120/50EUR; Teilzahlungs-/Korrekturmuster bleiben offen. Neue Produktlogik noch branch_only; keine vollständige Aufgabe durch diese Teilbelege als erledigt markieren. Die laufenden Cloud-KI-Dienste enthalten andere neuere Funktionen als die Hostingbasis und müssen vor Veröffentlichung gezielt abgeglichen werden.

Diese Liste unterscheidet belegte Ergebnisse, technisch mögliche nächste Arbeiten, fachliche Entscheidungen, externe Einrichtung und die spätere Einführung. Ein offenes Kästchen ist eine ausstehende Aufgabe. Eine geschriebene Spezifikation oder ein lokaler Test gilt nicht als veröffentlichte Produktfunktion.

Der ursprüngliche Listenauftrag war reine Dokumentation. Der anschließende ausdrückliche Umsetzungsauftrag erlaubt nun die technische Arbeit innerhalb der vorhandenen abgegrenzten Testfreigabe. Neue Händlerkonten/API-Schlüssel bleiben ausgeschlossen. Production bleibt ein gesonderter ausdrücklicher Auftrag.

## 1. Bereits erledigt und belegt

- [x] **ER01 – Stripe-Testzugang verbunden.** GradeCrew sandbox ist vorhanden und mit Testzugriff nutzbar. Der bestätigte Testbetrieb verwendet livemode=false. Vor einer neuen technischen Arbeit wird der Zugang erneut geprüft, ohne automatisch neue Schlüssel anzulegen.
- [x] **ER02 – PayPal in Stripe getestet.** Erstzahlung und Monatsverlängerung wurden am Testabo bestätigt. Das beweist den Zahlungsablauf in Stripe, noch nicht die komplette Verlängerung regulärer GradeCrew-Konten.
- [x] **ER03 – Zwei Schul-Teilüberweisungen getestet.** Bei einer Rechnung über 30 € blieben nach 10 € noch 20 € offen. Nach weiteren 20 € ordnete Stripe die Beträge zu und meldete bezahlt.
- [x] **ER04 – Erste automatische Freischaltung veröffentlicht getestet.** Der eigene Testserver aktiviert die zugeordnete synthetische persönliche beziehungsweise Schul-Testanmeldung nach geprüftem Zahlungsereignis. Ungültige und fremde Zugriffe wurden gezielt abgewiesen. Nachweis ist der [Cloud-Testbericht](sandbox-v1/receipts/2026-11-18-hosted-sandbox.json).
- [x] **ER05 – Austauschbare Verantwortlichkeiten vorbereitet.** Der Testserver trennt Webzugriff, Zahlungsprüfung und Firestore-Speicherung. 15 lokale Tests sind dokumentiert. Ein vollständiger EU-Umzug wurde dadurch noch nicht erledigt.
- [x] **ER06 – Bestätigte Produktregeln festgehalten.**14Tage kostenlos mit insgesamt fünf neuen Testdateien einschließlich manuell/Kopie/Import, Bearbeiten ohne weitere Einheit während der Testphase, kein Guthaben durch Löschen, kostenlose Kollegiumsfreigaben und spätere Stripe-Rabattcodes sind dokumentiert. Diese Regeln sind lokal vorbereitet, noch nicht vollständig veröffentlicht abgenommen.
- [x] **ER07 – Gesamten Zahlungsbetrieb geplant.** Ausführlicher Einführungsplan mit sieben Paketen, technischen Schnittstellen und 85 geplanten Prüffällen gesichert. Schulverlängerung, Laufzeitbeginn, Kulanz und weitere Vorschläge sind als unbestätigt markiert.

Weitere Belege und Versuchshistorie stehen in der [Aufgabenübergabe](../../workstreams/billing-research-20261104.md). Der veröffentlichte Vorschaukanal hat laut Nachweis ein Ablaufdatum am 25. November 2026. Vor einer weiteren Abnahme ist seine tatsächliche Verfügbarkeit zu prüfen. Ein historisch bestandener Test sagt nichts über die heutige Erreichbarkeit aus.

## 2. Was wir jetzt technisch vorbereiten und in der Testumgebung umsetzen können

Die folgenden Aufgaben brauchen keine echte Firmenabrechnung und keinen Live-Schlüssel. Bestehende Zugriffe und Berechtigungen werden am Beginn geprüft. Wo Geschäftsregeln noch offen sind, werden ausdrücklich gekennzeichnete Testwerte und austauschbare Konfiguration verwendet. Daraus entstehen keine veröffentlichten Kundenbedingungen.

**Verantwortlich für die technische Ausführung ist der beauftragte GradeCrew-Fachchat.** Martin liefert Entscheidungen und fehlende Angaben. Cloud-Veröffentlichung, zusätzliche reale E-Mail-Empfänger oder andere externe Schritte bleiben auf den tatsächlich autorisierten Testumfang begrenzt. Dieser Listenauftrag führt sie selbst nicht aus.

### Erste Priorität – echte Produktkonten und Zugangsrechte

- [ ] **J01 – Aktuellen Produktstand und Testbasis abgleichen.** Regulären Login, vorhandene Testidentitäten, alle Erstellungspfade, Kontenverwaltung und tatsächliche Testdienste erfassen. Den veröffentlichten Quellstand und den Integrationsbranch getrennt prüfen. **Fertig, wenn** eine konkrete Dateikarte, nutzbare Testrollen und die erlaubten Testziele dokumentiert sind. **Planbezug:** Paket B, vor jeder weiteren Implementierung.

- [ ] **J02 – Gemeinsames Konto-, Schul- und Vertragsmodell implementieren.** Person, Anmeldeidentität, Schule, Mitgliedschaft, Rechnungsempfänger, Vertrag, Periode und Berechtigungsquelle trennen. **Fertig, wenn** eine Person mehrere unabhängige Rechte besitzen kann und die notwendigen Transaktionen/Indizes geprüft sind. **Abhängigkeit:** J01. **Planbezug:** B/C.

- [ ] **J03 – Berechtigungen auf dem Server durchsetzen.** Persönliche Rechte, Schulplatz, Zeitraum, Sperren und kostenlose Freigaben bei jeder geschützten Aktion prüfen. **Fertig, wenn** eine manipulierte Browseranzeige oder direkte Anfrage keinen Zugang erzeugt. **Abhängigkeit:** J02. **Planbezug:** B, Fälle K11/P10/T09/T10/T11.

- [ ] **J04 –14Tage und fünf kostenlose Testdateien verbindlich zählen.** Manuell/KI/Kopie/Import, Verbrauch bei erfolgreicher neuer Speicherung, Wiederholschutz, parallele Anfragen, Fehler und Löschen berücksichtigen. Bearbeitung derselben Tests bleibt während der aktiven Testphase auch bei Rest null möglich. Danach Lesen/Export gemäß offengelegter Annahme. **Fertig, wenn** angepasste K01–K13 in echten Produktpfaden abgenommen sind. **Abhängigkeit:** J02/J03. E03 ist bestätigt.

- [ ] **J05 – Einheitliche Tarifanzeige ergänzen.** Konto, Dashboard und Administration zeigen Zugang, Quellen, Restguthaben und Ablauf. Die spätere App verwendet dieselbe serverseitige Sicht. **Fertig, wenn** neues Login und zweites Gerät denselben Zustand zeigen und noch offene Zahlungen verständlich bleiben. **Abhängigkeit:** J03/J04.

- [ ] **J06 – Kostenlose Premium-Freigaben für Kollegen bauen.** Person oder Schulumfang, Beginn, Ende beziehungsweise ausdrücklich unbefristet, Grund und vergebenden Administrator speichern. **Fertig, wenn** Erteilen, Ablauf und Widerruf protokolliert funktionieren, keine Rechnung entsteht und andere Rechte bestehen bleiben. **Abhängigkeit:** J02/J03. **Planbezug:** C, Fälle A01/A02.

### Zweite Priorität – Schulen und zugeordnete Lehrkräfte

- [ ] **J07 – Schulverwaltung anlegen.** Schule suchen, anlegen und bearbeiten sowie vom rechtlichen Rechnungsempfänger unterscheiden. Bestehende Schulen nicht nach bloßem Namensvergleich doppelt erzeugen. **Fertig, wenn** eine Testschule mit Verwaltungsverantwortung und getrenntem Käuferbezug existiert. **Abhängigkeit:** J02.

- [ ] **J08 – Lehrkräfte Schulen zuordnen.** Mitgliedschaft, Schulrolle, Zustand und Austritt verwalten. Den letzten Schuladministrator schützen. **Fertig, wenn** zugeordnete Personen in Admin- und Schulansicht übereinstimmen und fremde Schulen nicht zugänglich sind. **Abhängigkeit:** J03/J07. **Planbezug:** C.

- [ ] **J09 – Persönliche Einladungen umsetzen.** Einmaligen Link mit Ablauf und gehashtem Token, bestätigter Empfängeridentität, Annahme und Widerruf bauen. **Fertig, wenn** falsche Person, abgelaufener Link und Wiederverwendung keine zusätzliche Mitgliedschaft erzeugen. **Abhängigkeit:** J08. **Vorschlag:** Persönlicher Link als Startmodell, endgültige Bestätigung unter E05.

- [ ] **J10 – Schulplätze zuverlässig verwalten.** Genutzte und reservierte Plätze anzeigen, Kontingent atomar begrenzen und abgelaufene Reservierungen freigeben. **Fertig, wenn** zwei gleichzeitige Annahmen den letzten freien Platz nicht doppelt vergeben. **Abhängigkeit:** J08/J09. **Offene Preis-/Platzregeln:** E02/E04.

- [ ] **J11 – Schulwechsel und überlappende Rechte behandeln.** Mehrere Schulen, eigenes Premium, kostenlose Freigabe und Schul-Austritt gemeinsam prüfen. Datenzugriff und Eigentumszuordnung berücksichtigen. **Fertig, wenn** das Ende einer Schulquelle keine andere Quelle löscht und keine fremden Unterrichtsdaten automatisch übertragen werden. **Abhängigkeit:** J03/J08/J10.

### Dritte Priorität – vollständige Zahlung und Laufzeit

- [ ] **J12 – Persönlichen Stripe-Testkauf an reguläre GradeCrew-Konten anbinden.** Serverseitigen Checkout und autorisierte Rechnungs-/Portalsicht mit eindeutiger Personen-/Käuferzuordnung verbinden. Den vorhandenen Testpreis ausschließlich als Testwert verwenden. **Fertig, wenn** PayPal beziehungsweise der vereinbarte Kartentest eine wirkliche geschützte Produktfunktion derselben Testperson freischaltet. **Abhängigkeit:** J01–J05. **Planbezug:** D.

- [ ] **J13 – Zahlungsereignisse dauerhaft und wiederholbar verarbeiten.** Signatur, Umgebung, Rechnung, Käufer und Vertrag prüfen. Inbox, fachliche Deduplizierung, Wiederaufnahme und relevante Fehler-/Erstattungsereignisse ergänzen. **Fertig, wenn** doppelte, verspätete und umgekehrte Ereignisse genau die richtige Vertragsperiode ergeben. **Abhängigkeit:** J02/J03/J12.

- [ ] **J14 – Persönliche Verlängerung, Kündigung und Zahlungsausfall umsetzen.** Bezahlte Periode, vorgemerkte Kündigung, Wiederholungszahlung und konfigurierbare Kulanz abbilden. PayPal-Zustimmungswiderruf berücksichtigen. **Fertig, wenn** P05–P10/P15 mit Produktrechten geprüft sind. **Abhängigkeit:** J13. **Offene Vertragswerte:** E06, keine stillschweigende Übernahme der vorgeschlagenen sieben Tage.

- [ ] **J15 – Schulrechnung mit echter Testschule verbinden.** Bestellung und Schulperiode einer Testrechnung zuordnen. Historischer10+20EUR-Fall gehört ausschließlich zur30EUR-Testrechnung. Beim neuen50EUR-Schulplatz müssen die Teilbeträge zusammen50EUR ergeben, etwa10+40EUR. **Fertig, wenn** eine Teilzahlung nicht freischaltet und erst der vollständig zugeordnete Rechnungsbetrag unter erfüllter Startbedingung den Schulzugang aktiviert. **Abhängigkeit:** J07–J10/J13. **Planbezug:** D, Fälle S03/S04.

- [ ] **J16 – Schulbeginn, gemeinsames Ende und Verlängerung technisch abbilden.** Beitritt während des Jahres, Vorabzahlung, Vertragsende, spätere Zahlung und nächste Periode testen. **Fertig, wenn** Rechnung und Zugang denselben Zeitraum verwenden und ein später Beitritt kein neues Jahr erzeugt. **Abhängigkeit:** J15. **Offene verbindliche Regeln:** E05/E06. Bis dahin nur gekennzeichnete Testszenarien.

### Vierte Priorität – Verwaltung, Belege und Betrieb

- [ ] **J17 – GradeCrew-Abrechnungsübersicht bauen.** Rechnungen, Restbeträge, Käufer, Schule, Vertrag, Zeitraum und Originalbelegverweis anzeigen. Schulfinanzrolle auf die berechtigten Belege begrenzen. **Fertig, wenn** Martin Zahlungs- und Zugangsgrund nachvollziehen kann, ohne unprotokolliert Datenbankfelder zu ändern. **Abhängigkeit:** J13/J15.

- [ ] **J18 – Rechnungsentwürfe mit Logo vorbereiten.** Persönliche Rechnung, Schulrechnung, Teilzahlungsdarstellung und Korrekturbeleg gestalten. Fehlende Verkäufer-/Steuerdaten sichtbar als Platzhalter behandeln. **Fertig, wenn** visuell geprüfte Entwürfe mit konsistenten Summen und Zeiträumen vorliegen. **Abhängigkeit:** Vorhandener Logoentwurf und Testdaten. **Finale Fassung benötigt:** X01/X04.

- [ ] **J19 – E-Mail-Abläufe vorbereiten.** Vorlagen und Versandmatrix für Einladung, Zahlung, Rechnung, Ausfall, Kündigung und Schulverlängerung erstellen. Wiederholschutz und Rückläuferzustände lokal beziehungsweise mit kontrolliertem Testadapter prüfen. **Fertig, wenn** Anlass, Empfänger, Versender und Fehlerfall eindeutig sind. **Abhängigkeit:** J09/J13/J16. **Echter Zustellnachweis benötigt:** X03.

- [ ] **J20 – Beleg- und Buchhaltungsexport vorbereiten.** Rechnung, Zahlung, Gebühr, Erstattung und Auszahlung mit stabilen Referenzen exportierbar machen. Synthetische Muster für die spätere Importprobe erstellen. **Fertig, wenn** Musterbelege und Salden nachvollziehbar sind. **Abhängigkeit:** J13/J15/J17. **Brauchbarer tatsächlicher Import benötigt:** X05/X06. Kein bloßes CSV als fertige DATEV-Anbindung ausgeben.

- [ ] **J21 – Ausnahmen und Wiederanlauf bauen.** Verpasste Ereignisse, nicht zugeordnete Eingänge, Versandfehler, überfällige Zahlungen und Abgleichdifferenzen sichtbar machen. Alarmierung und begrenzte Reparaturläufe vorbereiten. **Fertig, wenn** ein absichtlich unterbrochener Testvorgang ohne doppelte Rechnung oder Berechtigung repariert wird. **Abhängigkeit:** J13/J17/J19.

- [ ] **J22 – Gesamte Testabnahme durchführen und belegen.** Die 85 Fälle des Zahlungsplans je nach Paket automatisiert oder kontrolliert prüfen. Testausführung, wirklicher Produktzugang, Rollen, mobile Ansicht, Sicherheitsgrenzen und verbleibende Fehler getrennt dokumentieren. **Fertig, wenn** jeder einschlägige Fall einen Nachweis besitzt und eine echte Testlehrkraft sowie eine Testschule mit zwei Lehrkräften den vollständigen Ablauf bestehen. **Abhängigkeit:** Betroffene J-Aufgaben und bestätigte erforderliche E-/X-Punkte.

- [ ] **J23 – Bestehende Nutzer sicher überführen.** Datenlose Migrationsvorschau, einmalige Ausstattung, vorhandene Freigaben, laufende Prüfungen und wiederholbare Migration testen. **Fertig, wenn** keine doppelten Rechte entstehen und vorhandene Arbeit nicht überraschend gesperrt wird. **Abhängigkeit:** J02–J06 und Bestandsregel E07. **Planbezug:** F.

- [ ] **J24 – Sicherung, Dokumentation und Übertragbarkeit nachweisen.** Daten-/Adaptervertrag, Export, Wiederherstellung, Rechtebeziehungen und Betriebsanleitung für Testdaten prüfen. Geheimniswechselverfahren dokumentieren. **Fertig, wenn** ein anderer Bearbeiter einen Testfall wiederaufnehmen und die Beziehungen nach Wiederherstellung prüfen kann. **Abhängigkeit:** J02/J13/J21. Kein neuer Schlüssel oder EU-Umzug aus dieser Aufgabe ableiten.

## 3. Welche Entscheidungen wir noch brauchen

Die Werte werden gemeinsam mit Martin festgelegt. Technische Vorbereitung darf mit klar gekennzeichneten Testwerten weitergehen. Das Echtgeldangebot übernimmt keinen offenen Vorschlag automatisch.

| Offen | Entscheidung | Zuständig | Betroffener Schritt |
|---|---|---|---|
| [x] E01 | Verkäufer/Anschrift bestätigt, Firma/Gewerbe steht, Regelbesteuerung mit Umsatzsteuer; Details privat hinterlegt | Martin | Steuerkennung und finale Belegprüfung bleiben X01/X04 |
| [x] E02 |15EUR monatlich,120EUR jährlich im Voraus,50EUR je Schulplatz/Jahr; Endpreise einschließlich gegebenenfalls anfallender Umsatzsteuer | Martin | Noch keine Livepreisaktivierung |
| [x] E03 |14Tage und höchstens fünf neue Testdateien; manuell/KI/Kopie/Import zählen, Löschen gibt nichts zurück | Martin | J04/J22 |
| [ ] E04 | Premium-Leistungen, KI-Nutzungslimits, Schulplatzpakete, Mehrplätze und Finanzkontakt ohne Lehrerplatz | Martin | J03/J10 und Tarifdarstellung |
| [x] E05 | Zwölf Monate ab vereinbartem Startdatum, persönliche Einladungen, ausdrücklich bestätigte Verlängerung | Martin | J09/J16 und Schulvertrag |
| [ ] E06 | Zahlungsziel, Kulanz, Erinnerungen, verspätete Zahlung, Erstattung und Schutz laufender Prüfungen | Martin, fachliche Prüfung soweit erforderlich | J14/J16/J19/J22 |
| [ ] E07 | Übergang für bestehende Lehrkräfte und bereits vorhandene Tests/Freigaben | Martin | J23 |
| [ ] E08 | Rechnungsweg, Buchhaltungsumfang und zuständiger Dienstleister | Martin mit gewähltem Dienst | X04–X06 |

**Noch Vorschläge:** sieben Tage persönliche Zahlungskulanz,14Tage Schul-Zahlungsziel und Erinnerungen60/30/7Tage vor Ablauf. Persönliche Einladungen und bewusste Schulverlängerung sind inzwischen bestätigt.

## 4. Was Angaben, externe Einrichtung oder tatsächliche Nachweise benötigt

- [ ] **X01 – Rechnungsstammdaten und Logo freigeben.** Martin liefert tatsächlichen Verkäufer, Anschrift, geschäftlichen Kontakt und freigegebenes Logo. Steuerliche Angaben werden passend zum bestätigten Fall geprüft. **Ergebnis:** endgültige Musterrechnung ohne Platzhalter. **Abhängigkeit:** E01/J18.

- [ ] **X02 – Späteren Händler-/Auszahlungsweg vervollständigen.** Vor dem Echtgeldstart vorhandenen Stripe-Account prüfen, notwendige Unternehmensverifizierung und Geschäftskontozuordnung abschließen. Erforderliche PayPal-Händler-/Abo-Freigaben und tatsächlichen Auszahlungsweg prüfen. **Ergebnis:** nachgewiesene Voraussetzungen für die gewählten Livezahlarten. Diese Liste beauftragt keine Konto- oder Schlüsselneuanlage.

- [ ] **X03 – Tatsächlichen E-Mail-Versand abnehmen.** Kontrolliertes Empfängerpostfach, zulässigen Absender und vorhandenen Mailweg festlegen. Rechnung, Einladung, Kündigung und Fehlerfall mit dem vorgesehenen Versender prüfen. **Ergebnis:** dokumentierter Empfang und funktionierender Umgang mit Rückläufern. **Abhängigkeit:** J19, geeigneter Zugang und Empfänger. Keine Kundennachricht aus einem bloßen Entwurfsstatus senden.

- [ ] **X04 – Rechnung und Schulträger-Anforderungen prüfen.** Tatsächlichen rechtlichen Käufer, Steuerbehandlung, benötigtes Format und Übermittlungsweg klären. Gegebenenfalls Bestellnummer, Leitweg-ID und strukturierte Datei ergänzen. **Ergebnis:** für den ersten betroffenen Käufer akzeptierter Belegweg. **Abhängigkeit:** E01/E05/E08/X01. Ein PDF-Entwurf ist kein Nachweis hierfür.

- [ ] **X05 – Buchhaltungs-/Steuerdienst auswählen.** Leistungsumfang, laufende Buchung, Abgaben, Belegarchiv, Schnittstellen, Gebühren und Ansprechpartner vergleichen. **Ergebnis:** klar benannte Zuständigkeiten und tatsächlich übernommene Leistungen. **Abhängigkeit:** E08. Kein bestimmter kostenpflichtiger Zusatzdienst wird durch die Liste vorausgesetzt.

- [ ] **X06 – Tatsächlichen Buchhaltungsimport prüfen.** Muster mit Abo, Schulrechnung, zwei Teilzahlungen, Gebühren, Erstattung und Auszahlung in den gewählten Weg importieren. Falls DATEV vorgesehen ist, das konkret benötigte Format und die Kontierung abstimmen. **Ergebnis:** bestätigter Import ohne doppelte Erlöse oder ungeklärte Differenzen. **Abhängigkeit:** J20/X05.

- [ ] **X07 – Verträge, Kündigung und Datenschutz fachlich abschließen.** Persönliche Käufe und Schulkäufe getrennt behandeln, Bedingungen und Verbraucherabläufe prüfen sowie benötigte Schul-/Datenschutzunterlagen vervollständigen. **Ergebnis:** tatsächliche, passende Dokumente und umgesetzte erforderliche Abläufe. **Abhängigkeit:** E01–E06. Keine pauschale Rechtsfreigabe durch einen technischen Test.

- [ ] **X08 – Laufenden Betrieb besetzen.** Festlegen, wer Zahlungsklärung, Erstattung, Rechnungsfehler, Monatsabgleich und technische Störung bearbeitet. **Ergebnis:** Verantwortliche, Eskalationsweg und verständliche Anleitung. **Abhängigkeit:** J21/J24/X05. Automatisierung ersetzt nicht diese Zuständigkeit.

## 5. Was erst vor beziehungsweise bei der Liveeinführung ansteht

- [ ] **L01 – Fachlich bestätigte Regeln und finale Konfiguration zusammenführen.** Alle für das erste Angebot einschlägigen E-/X-Punkte schließen. Nicht benötigte spätere Funktionen dürfen deaktiviert bleiben. **Ergebnis:** klar begrenztes, tatsächlich verkaufsfähiges Startangebot.
- [ ] **L02 – Aktuellen Integrationsstand und CI prüfen.** Überschneidungen auflösen, Produktcode gezielt integrieren und einen konkreten Kandidaten benennen. **Ergebnis:** geprüfter Commit mit passender erfolgreicher CI. Der bestehende Draft-PR ist kein Merge- oder Deploystatus.
- [ ] **L03 – Gesamten Kandidaten auf der Testseite abnehmen.** Hosting, Backend, Datenregeln und reale Produktrollen gemeinsam prüfen. Martin sieht Konto, Schulverwaltung und Rechnungen selbst. **Ergebnis:** dokumentierte Testabnahme dieses konkreten Kandidaten.
- [ ] **L04 – Produktionskonfiguration sicher vorbereiten.** Vorhandene erforderliche Livegeheimnisse ausschließlich serverseitig hinterlegen, getrennte Preise und Ereignisziele, Mailweg und Archiv prüfen. Fehlen Konten oder Schlüssel, ist die bisherige Grenze gegen Neuanlage ausdrücklich zu beachten. **Ergebnis:** überprüfbare Konfiguration, noch kein Liveeinsatz.
- [ ] **L05 – Einführung und Rückfallplan freigeben.** Martin erhält Umfang, betroffene Konten, Migration, Kaufabschaltung und konkrete Auswirkungen zur Durchsicht. **Ergebnis:** ausdrücklicher Produktionsauftrag. **Abhängigkeit:** L01–L04.
- [ ] **L06 – Freigegeben einführen und tatsächlichen Betrieb abgleichen.** Genau den bestätigten Stand veröffentlichen, Bestandsübergang prüfen, erste zulässige reale Vorgänge und Buchhaltungsabgleich nachweisen. **Ergebnis:** getrennte Deploy-/Nutzer-/Finanznachweise und benannter Betreiber. Eine echte Zahlung wird nicht aus einem Sandboxauftrag abgeleitet.

## 6. Spätere Erweiterungen, keine Voraussetzung für den ersten stabilen Webbetrieb

- [ ] **S01 – Stripe-Rabatt- und Influencercodes.** Produktzuordnung, Einlösefenster, Rabattdauer und Obergrenzen umsetzen. Kampagnenzuordnung und etwaige Provision separat behandeln.
- [ ] **S02 – Zusätzliche Tarife und Zahlarten.** Persönlichen Jahrespreis, zusätzliche Wallets oder Lastschrift nur bei bestätigtem Bedarf und eigener Abnahme ergänzen.
- [ ] **S03 – Erweiterte Schulverträge.** Ausdrücklich vereinbarte automatische Folgeabrechnung und unterjährige Mehrplatz-/Tarifänderungen nach sauberer Preis- und Vertragsregel ergänzen.
- [ ] **S04 – Native Apps anbinden.** Gemeinsamen Zugangsstatus nutzen und Kauf-/Storebedingungen der konkreten App vor Veröffentlichung gesondert klären.
- [ ] **S05 – Tatsächlichen EU-Umzug durchführen.** Nach Anbieterentscheidung Identitäten, Daten, Dateien, Sicherungen und Betrieb geplant migrieren. Die austauschbare Architektur erleichtert das, ersetzt aber keinen Umzugsauftrag und keine Abnahme.

## 7. Empfohlener nächster Arbeitsblock

**Genau nächster ausführbarer Schritt ist J01:** den aktuellen Produkt- und Teststand für reguläre Lehrkräfte prüfen und eine konkrete Anschlusskarte erstellen. Danach J02–J06 als ersten zusammenhängenden Block umsetzen. Das ergibt ein prüfbares Ergebnis mit regulärem Konto, fünf kostenlosen KI-Tests, verständlicher Statusanzeige und kostenloser Adminfreigabe.

Parallel können E01–E08 vorbereitet werden. Preise, Geschäftskonto und Buchhaltungsvertrag sind keine Voraussetzung für die technische Modellierung dieses ersten Blocks. Verbindliche Verkaufs- und Rechnungsregeln werden trotzdem vor dem jeweiligen Echtgeldweg benötigt.

Nach dem ersten Block folgen Schulen J07–J11 und anschließend vollständige Zahlungsabläufe J12–J16. Rechnungsentwurf J18 und E-Mail-Texte J19 lassen sich teilweise vorziehen. Wirklicher Versand und endgültige Belege benötigen ihre jeweils benannten Angaben.

## 8. Pflege dieser Arbeitsliste

- Task-ID, Branch und vorhandene Versuchshistorie beibehalten.
- Vor jeder Umsetzung prüfen, ob die Aufgabe inzwischen auf einem anderen Branch oder in einem Deployment erledigt wurde.
- Ein Kästchen erst mit passendem Nachweis schließen. Bei Teilabschluss den offenen Rest nennen.
- Für jeden Abschluss mindestens Datum, Commit, Umgebung und Prüfergebnis in der Übergabe verknüpfen.
- Ein geänderter Releasezustand wird zusätzlich in GRADECREW_STATE.json dokumentiert. Die Erstellung dieser Liste ändert keinen Releasezustand.
- Bestätigte Regeln im ausführlichen Plan aktualisieren. Diese Liste führt Aufgaben und Abhängigkeiten, keine zweite widersprüchliche Vertragsfassung.
- Quellen unter sources/ bleiben unangetastet. Geheimnisse, Schülerdaten und private Testzugänge gehören nicht in diese Unterlagen.

Dokumentationsstand: Diese Liste, der verknüpfte Gesamtplan, der eigene Abschnitt in TODO.md und die [Aufgabenübergabe](../../workstreams/billing-research-20261104.md) werden zusammen auf dem vorhandenen Aufgabenbranch gesichert. Ein dort gespeicherter Stand ist noch keine Integration nach main und keine Einführung auf gradecrew.de.
