# GradeCrew Evidence Rule

Status: verbindliche Arbeitsregel für Produkt-, Lernspiel-, Aufgaben-, Feedback- und Bewertungsentscheidungen.

## Zweck

GradeCrew soll didaktische Entscheidungen nicht nur aus Bauchgefühl, Designgeschmack oder einem einzelnen KI-Vorschlag ableiten. Wo eine Entscheidung Lernwirkung, Feedback, Motivation, Transfer, Prüfungsqualität oder Schülerverhalten wesentlich beeinflusst, wird vor der endgültigen Umsetzung ein kurzer evidenzbasierter Review durchgeführt.

Consensus ist dafür das bevorzugte Recherchewerkzeug, weil es direkt peer-reviewte Fachliteratur durchsucht. Die Recherche ersetzt weder Lehrplanprüfung noch pädagogische Verantwortung; sie liefert eine zusätzliche Evidenzschicht.

## Wann der Evidence Check verpflichtend ist

Ein kurzer Consensus-Check ist vor der endgültigen Umsetzung erforderlich bei:
- Fehlerfeedback, Hilfen, Scaffolding und Hint-Stufen;
- Worked Examples, Lösungswegen und Transferaufgaben;
- Adaptivität, Wiederholungslogik und Mastery-/Lernpfaden;
- Motivation, Gamification, Belohnungen und Bestrafungen;
- Aufgabengestaltung, Distraktoren, Prüfungsformaten und automatischem Feedback;
- größeren Änderungen an Lernspielen, die Lernzeit oder Lernverhalten bewusst steuern;
- neuen Bewertungs- oder Korrekturmechanismen mit didaktischer Wirkung.

Nicht erforderlich ist er für rein visuelle, technische oder infrastrukturelle Änderungen ohne plausiblen Einfluss auf Lernen oder Bewertung.

## Datenschutzgrenze

An Consensus dürfen niemals personenbezogene oder vertrauliche GradeCrew-Daten gesendet werden. Insbesondere nicht:
- Namen, E-Mail-Adressen oder Accountdaten;
- Schülerantworten oder Freitexte;
- echte Testinhalte aus nicht veröffentlichten Leistungsnachweisen, wenn sie Rückschlüsse auf Personen oder geschützte Inhalte zulassen;
- Uploads, Prompts oder Logdaten mit personenbezogenem Inhalt.

Recherchefragen werden abstrakt und fachlich formuliert.

## Mindeststandard

Der Evidence Check soll klein bleiben und die Entwicklung nicht blockieren:
1. Forschungsfrage präzisieren.
2. Nach Möglichkeit mindestens eine Meta-Analyse, systematische Übersicht oder mehrere einschlägige Studien prüfen.
3. Befund und Grenzen knapp zusammenfassen.
4. Produktentscheidung daraus ableiten oder begründet davon abweichen.
5. Ergebnis unter `docs/evidence/` dokumentieren, wenn es eine dauerhafte Produktregel oder größere Funktion betrifft.

## Evidence-Notiz

Jede dauerhafte Notiz enthält mindestens:
- **Frage**
- **Evidenz**
- **Grenzen / Übertragbarkeit**
- **GradeCrew-Entscheidung**
- **Was wir messen oder später überprüfen wollen**
- **Quellen**

Eine Studie ist kein Automatismus. Bei widersprüchlicher Evidenz wird die Unsicherheit ausdrücklich dokumentiert.

## Zusammenspiel mit PostHog

Consensus beantwortet vor allem: **Was spricht die Forschung dafür oder dagegen?**

PostHog beantwortet später: **Was passiert bei unseren tatsächlichen Nutzern?**

Für wichtige Lernmechaniken gilt deshalb idealerweise:
`Forschung -> Produktentscheidung -> Staging/Beta -> datensparsame Messung -> Review`.

PostHog-Daten dürfen nicht als Kausalbeweis missverstanden werden. Beobachtete Unterschiede führen bei relevanten didaktischen Fragen zu einem neuen Review, nicht automatisch zu einer Produktänderung.
