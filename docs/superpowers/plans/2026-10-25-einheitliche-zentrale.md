# Einheitliche Firmenzentrale Implementation Plan

> Ausführung mit executing-plans, allein gemäß Humanauftrag. Direkte Umsetzung ist autorisiert; keine erneute Designfrage.

**Goal:** Eine dunkelblaue, kompakte Oberfläche mit gleichbleibendem Rahmen und verständlichen Hierarchien.
**Architecture:** Gemeinsame statische App-Hülle und Designtokens, bestehendes SVG-Fokusnetz, ergänzte Oberthemengruppen, kompakte Auftrags- und Quellenansichten. Keine Backend-/Liveänderung.
**Tech Stack:** Vorhandenes Vanilla JavaScript/CSS/SVG, bestehende Tests.
**Spec:** Entwurfsentscheidung im folgenden Abschnitt.

## Entwurf

Martins erste Referenz bestimmt die Oberfläche. Nachtblau #080e1c, Flächen #0b1426/#101f35, Konturen #293953, Text #e7efff, Akzent #8cdeef. Rosa kennzeichnet gemeldete Engpässe, Gelb offene Abnahmen, Violett Klärungen. Systemschrift mit einheitlicher 32px-Seitenüberschrift, 20px-Abschnitt, 14px-Fließtext. Ein 84px-Navigationsstreifen und 68px-Kopf bleiben auf Desktop immer gleich; Original-Logo immer54px. Auf Mobil dieselbe48px-Marke und ausklappbare Navigation. Keine Routenklasse ändert Layout oder Palette.

Informationsreihenfolge: Was ist offen? Welcher konkrete Schritt? Erst danach Details/Quellen. Bereich bleibt Mittelpunkt im Netz; alle62Unterpunkte bleiben adressierbar. Oberthemen bündeln die Unterpunkte ohne neue kopierte Akten. Engpassanzahlen stammen aus dem begrenzten Datenbestand; keine erfundenen Prozentwerte. Aufträge zeigen Status und Ergebniszugang, lange Inhalte/IDs werden auf Wunsch geöffnet. Quellen zeigen Abdeckung/Datum zuerst, Listen und Grenzen dahinter.

## Grenzen und Review-Fokus

GC-BRAIN-01, gleicher Checkout/PR295, Original-Assets unverändert, keine Subagenten, Backend unverändert. Formulare dürfen beim Polling keinen Text/Fokus verlieren. Ganze Berichte müssen erreichbar bleiben. Fehler/Rückfragen dürfen durch Filter nicht als erledigt erscheinen. Alle Unterpunkte genau einer Obergruppe zugeordnet; keine automatische Elternblockade. Farben müssen mit Textbeschriftungen verständlich sein. Historische Quellenlimits bleiben zugänglich.

## Schritte

- [x] Einheitliche Hülle: index/app/style sowie neue gemeinsame Farbregeln; Navigation/Logo auf allen Routen gleich.
- [x] Gruppierung für alle elf Bereiche und kompakte Fokusinspektoren; Gruppenvollständigkeit und wahrheitsgetreue Statuszählung testen.
- [x] Eingang/Quellen kürzen, Auftragsfilter und aufklappbare Einzelheiten; Ergebnis-/Rückfragefunktion bewahren.
- [x] Desktop/Tablet/Mobil, Logo-/Rahmenmaße und Farben bei Seitenwechsel vergleichen; alle62Unterpunkte, Formulare und Quellenzugänge kontrollieren.
- [ ] Bestehende Tests, eigene Übergabe, GitHub-Sicherung und exakte CI; Live bleibt unverändert.

## Prüfung

21 JavaScript- und15 Pythonprüfungen bestanden. Zehn Arbeitsansichten mit gleicher Palette und identischen Desktopmaßen (Logo54px, Leiste84px, Kopf68px). Alle elf Bereiche im Browser geöffnet:24 Oberthemen,62 Unterthemen. Dringendfilter, konkrete Aufgabenvorbereitung, vorhandene Ergebnisberichte und Quellenzugang geprüft. Handy390px und Tablet768px ohne Dokumentüberlauf. Mobile Doppelliste entfernt; gruppierte Textlinks bleiben erreichbar. Keine neuen Modellaufträge oder Änderungen an Live. Finale GitHub-Sicherung/CI wird am bestehenden PR295 dokumentiert.
