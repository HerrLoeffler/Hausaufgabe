# A/B-Gegenprüfung und gezielte Planrevision

Task GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011. **Nur PLAN, keine Runtimeabnahme.** Erstberichte beziehen sich unabhängig auf Dokumentcommit `1caa38a5f2dfae437d5122bd59d4bfe29a88a53d`, Spielbasis PR175@a5dc474. Erst nach Eingang beider Berichte wurde dem jeweils anderen Prüfer dessen Befundliste gegeben. Dieselben zwei Reviewer prüften diese Befunde und die eng beschriebenen Korrekturvorschläge gegen Quellen; kein dritter Prüfer, keine zweite volle Reviewrunde.

## Tatsächlich ausgeführter Reviewweg

1. A: Technik/Standards, normale Inputs, Gelände, State/Saves; zuerst ohne B-Bericht.
2. B: Produkt-Spec, Grafik/Handhabung/Verständlichkeit für schwächere Leser; zuerst ohne A-Bericht. B simuliert keine getesteten Kinder.
3. A prüfte B1–B5; B prüfte A1–A5. Beide fanden keinen sachlichen Konflikt. Beide unterstützten die begrenzten Korrekturvorschläge, unter den unten festgehaltenen Bedingungen.
4. Dokumentationsowner revidierte gezielt Profil, Startguard, Modus-/Slotvertrag, Farbbedeutung, D/S-Copy, sichtbares Schrittzentrum, ID-Zuordnung und Lesbarkeit. Kein Runtimecode, keine Assetproduktion und kein Testlauf.
5. Der endgültige Text erhielt einen redaktionellen und Quellen-/Scope-Selbstabgleich des Owners. Das ist keine weitere unabhängige Final-Reviewrunde oder Nutzerfreigabe.

## Befundentscheidungen

| Befund | Gegenprüfung | Ownerentscheidung / konkrete Revision | Verbleibender späterer Beleg |
|---|---|---|---|
| A1 Plateau | B stimmt zu; A bestätigt Zahlen | 90-cm-Kuppe; Aufstieg−2650..−2200 unverändert450cm, Plateau−2200..−2000, Abstieg−2000..−1450. W4−1750/Z≈51, W5−1350/Z0. Beide Plateaugrenzen/Endpunkte in M2-Assertions. | Dreiecks-/Cookingprüfung und normaler Lauf; rechnerische16,70° sind kein Terrain-PASS |
| A2 Start20 löscht Reihen | B bestätigt Source und Fairnessimpact | Referenzstart bei aktivem/fehlerhaftem Weg state-neutral; kurze aktuelle Reihen-/Undohilfe. Vollreset nur bestätigter Abschnitt-Neustart; P15. | Native Wiederstartfolge mit unverändertem Array/Count |
| A3 Anschlussisolation | B bestätigt getrennte vorhandene Loads | Explizite Normal/Reference/Continuation-GameModeprofile, konkrete Travelklasse, frühe Save-/Preferencesabfragen vor jedem Load, Session bleibt gebunden, fehlender Handoff kein Produktionsfallback. C07/C08 testen auch nächste Aktion/Preferences/Resume. | Tatsächliche Map-/Save-/Controllerinitialisierung und Dateihashes |
| A4 Character-Recovery | B bestätigt feste alte Tickabkürzung | Nichtnormale Profile protokollieren SafePose vor Reset, valide Flags bleiben; normaler Recoverylauf ist FAIL. S-Resume zunächst Besuch gesperrt. | T16/S11, echte Floor-/Inputbelege |
| A5/B5 redaktionelle Verkettungen | Beiderseitig bestätigt | Meilensteine/Matrix und Kinder-Copy lesbar redigiert; technische Namen als Code erhalten. „Reihe 1 von 3“, „Erst Reihe 1“; D-only-Checks eindeutig. | Spätere tatsächliche Bild-/Leseprüfung weiterhin nötig |
| B1 Ganzsteinblau | A bestätigt Widerspruch und vorhandene grüne/orange Tints | Ausgewählte ganze Platte bleibt blau, auch richtig/falsch; Grün nur Leitung/gesonderte Reihenmarke, Fehler zusätzlich Text/Rand. U04/Materialassertions erfassen alle Zustände. | Neuer Render-/Material-/Normalinputbeleg; kein bloßer Copyfix |
| B2 D/S-Copy | A bestätigt | Hauptablauf/Start-/HUDcopy profilgebunden; Variantenblatt führt S. Kein zusätzliches Kindermenü. | Beide Profile nach Auswahlentscheidung separat prüfen |
| B3 verstecktes Zentrum | A stimmt begrenzt zu | Ruhige84×84cm-Innenkontur im Material, keine separate Mulde über flachem Collider. „Stehe kurz in der Mitte.“; bei nötigem Rearm „Gehe kurz vom Stein.“; aktive Reihe sichtbar. | S-I03/05/07/08 plus Verständnisbeleg; kein neuer Lernmechanismus |
| B4 Task-/TerminalIDs | A bestätigt tatsächliche Datei | Lernaufgaben100/200 und Terminaltargets10/20 ausdrücklich getrennt; Worttargets100–103/200–208 bleiben stabil. Generator bleibt zuständig. | Katalog-/Copycheck am Umsetzungskandidaten |

## Gegenprüfungsberichte und Bedingungen

**A über B:** B1/B2/B4 wichtig und unmittelbar belegt; B3 richtige Klarstellung, aber reale Steinoberfläche darf bei sichtbarer Kontur nicht von Pawnkollision abweichen. B5 reine Redaktion. Plateauwerte, frühe Controller-Preferenceswahl und protokollierte Recovery sind konsistent. „Vom Stein gehen“ ist eine einfache hinreichende Rearmhilfe; Code darf bereits beim Verlassen des Zentrums wieder arming erlauben.

**B über A:** Kuppe braucht echten Ruhebereich, nicht nur Punkt mit flacher Tangente. Wiederstart muss faire Erhaltung richtiger Reihen sicherstellen, ohne neue Bestätigungsfrage. Anschlussklasse ist technischer Vertrag, kein Kindertext. Fehlender Handoff meldet ehrlichen Fehler und lässt den validen Referenzversuch erhalten. Recoveryfeedback bleibt kurz; S-Mittenresume darf Contactreset nicht in neue Antwort verwandeln.

**Keine sachlichen Konflikte.** Die Empfehlung D als erster Vergleichskandidat ist eine Entwurfspräferenz; S bewahrt mehr ursprüngliches Schrittspiel. Beide Reviewer lassen Martins Entscheidung offen. Weder „mehr Vorschläge“ noch Mehrheitswahl erzeugt einen höheren Qualitätswert oder eine Produktfreigabe.

## Annahmen und offene Prüfgrenzen

Actual Modell/Effort beider Reviewer bleibt mangels separater Runtimebeobachtung unknown; requested/dispatch war gpt-6.1-sol/medium. Keine Preise/Usage-/Qualitätsgarantie. Keine Tests/Builds/Spielstarts/OS-Eingaben/Captures oder neue Recherche durch die Reviewer.

Offen bleiben tatsächliche Physics-Cookingwahl, native Inputadapterqualifikation, Wortlesbarkeit/Verständnis, Assetrechte, Performance und echte Kinder-/Geräte-/Lernwirkungsprüfung. Diese Dinge sind in den späteren Gates enthalten und wurden nicht heute „bestanden“. Userapproval zu D/S, Referenz-/Anschlussprofil und Artgestaltung ist offen. Der Plan ist nach den dokumentierten Korrekturen zur Nutzerprüfung bereit; Umsetzung folgt ausschließlich nach eigenem Folgeauftrag.
