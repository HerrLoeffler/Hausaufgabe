# GradeCrew – aktueller Entscheidungsstand für den Zahlungsbetrieb

Stand18Nov2026, GC-BILLING-PLAN-01. Diese Aktualisierung ersetzt die früheren abweichenden Gratis- und Preisannahmen im Einführungsplan. Autorisiert ist die Umsetzung in der getrennten Testumgebung. Keine Liveänderung, keine neuen Händlerkonten oder API-Schlüssel.

## Testmodell

- Martin wählt zwei Wochen kostenlos und höchstens fünf neue Testdateien insgesamt.
- Jede neue gespeicherte Testdatei zählt, einschließlich manueller Anlage, KI-Test, Kopie und Import.
- Bearbeiten derselben Datei verbraucht keine zusätzliche Einheit. Löschen gibt nichts zurück.
- Es entsteht kein automatisches kostenpflichtiges Abo.
- Offengelegte Umsetzungsannahme: Die14Tage beginnen bei der serverseitig belegten Registrierung, nicht bei jedem Login neu. Innerhalb der aktiven Testphase bleiben bestehende Tests auch bei ausgeschöpften fünf Einheiten bearbeitbar. Danach Lesen/Export und sicherer Abschluss bereits laufender Prüfungen. Die konkrete Folge nach Ablauf wurde als Annahme im Chat genannt und kann vor dem Verkauf korrigiert werden.
- Bestandskonten werden nicht rückwirkend pauschal gesperrt. Ein Übergang benötigt eine eigene bestätigte Regel und kontrollierte Aktivierung.

## Vorläufige Preisvariante

| Angebot | Betrag | Zahlungsintervall | Darstellung |
|---|---:|---|---|
| Persönliches Premium monatlich | 15EUR | monatlich | 15EUR pro Monat |
| Persönliches Premium jährlich | 120EUR im Voraus | jährlich | entspricht10EUR pro Monat,120EUR jährlich |
| Schule | 50EUR je Lehrkraft/Platz | zwölf Monate | eigener Schulvertrag |

Die persönliche10EUR-Monatsvariante ist damit ersetzt. Jahreszahlung ist eine jährliche Vorauszahlung, keine monatliche10EUR-Abbuchung. Steuer-/Bruttobehandlung und endgültige Verkaufsangaben sind offen. Keine Livepreise aus diesem Dokument aktivieren.

## Schulen und Freigaben

- Martin bestätigt zwölf Monate ab vereinbartem Startdatum, persönliche Einladungen und eine bewusst bestätigte Verlängerung.
- Später beitretende Mitglieder erhalten nur die gemeinsame Restlaufzeit.
- Schulzuordnung, Rechnungsempfänger, Platz und Vertragsperiode bleiben getrennt.
- Vollständige Zahlung und erreichter Beginn sind Voraussetzung der bezahlten Schulperiode. Teilzahlung allein erzeugt keine Vollfreigabe.
- Kostenlose Premium-Freigaben für Kollegen erfolgen ohne Rechnung oder Abbuchung durch die berechtigte Administration.
- Rabatt-/Influencercodes folgen später.

## Noch offen

Verkäufer-/Unternehmens-/Steuerdaten, endgültiger Leistungsumfang und KI-Limits, Kulanz, Zahlungsziele, Bestandsübergang, Buchhaltung und gegebenenfalls Schulträger-Rechnungsweg. Diese Punkte verhindern keine reine technische Vorbereitung mit gekennzeichneten Testwerten.

## Umsetzung

Bestehender Dokumentationsbranch docs/billing-research-20261104 und DraftPR411 bleiben erhalten. Verwandter Produktbranch feature/billing-product-20261118 basiert auf veröffentlichter Produktquelle805cba98. Erster gesicherter Remotecheckpoint908d2291 mit Source-Tree09b099f0 enthält die Zugangslogik und atomare Verbrauchs-/Freigabelogik. Geprüft sind497/497 Functions-Tests unterNode22 und acht echte lokale Transaktionsfälle. Noch keine vollständige Produktverkabelung, Cloud-Abnahme oder Veröffentlichung dieser neuen Produktlogik behaupten.

[Aktuelle Aufgabenliste](2026-11-18-aufgabenliste-zahlungsbetrieb.md) und [ursprünglicher Gesamtplan](../superpowers/plans/2026-11-18-gradecrew-zahlungsbetrieb.md) werden nach dem tatsächlichen Umsetzungsstand gepflegt. Der aktuelle Entscheidungsstand hier hat bei älteren widersprechenden Gratis-/Preisannahmen Vorrang.
