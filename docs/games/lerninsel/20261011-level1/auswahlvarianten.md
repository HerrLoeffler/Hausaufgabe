# Zwei vollständig geplante Auswahlvarianten — D und S

Planpräzisierung vom11.10.2026. **Kein Runtimeumbau.** Martins ursprüngliches bewusstes Gehen über Bodenwörter und seine positive Rückmeldung zu den ersten Bereichen bleiben ein Produktwunsch, keine bloß unerwünschte Altmechanik. D/S sind Auswahlvarianten; Tester A/B sind unabhängige Reviewer und nicht diese Varianten.

## Gemeinsamer Vertrag

Beide verwenden dieselben Wörter, Reihen, Coreaktionen, Rücknahme, automatisch ausgewertete Tore, ganze blaue Steine ohne Häkchen, eigene Saves und denselben Raum. Die kleine Introprobe bleibt wie bisher direkte E/Klick-Auswahl. **D oder S wird nach Martins Entscheidung im gebundenen Referenzprofil festgelegt, nicht durch eine zusätzliche Moduswahl im Kindermenü.** Für einen späteren begrenzten Vergleich können zwei ausdrücklich beschriftete Kandidatenprofile verwendet werden; nicht parallel am selben Save testen. Kein stiller Wechsel während eines Durchlaufs.

Die sichtbaren bis10cm hohen Wortsteine brauchen eine **passende Pawn-blockierende Oberseite**. Ein Spieler steht tatsächlich auf deren Fläche; er läuft nicht durch die sichtbare Geometrie auf einem unsichtbaren Boden darunter. Zusätzliche Pick-/Schrift-Queryflächen dürfen Pawn ignorieren, doch dies betrifft nicht den physischen sichtbaren Steinkörper. Bei beiden Varianten muss Renderoberseite/Floorhit innerhalb2cm übereinstimmen. Ein seitlicher Schriftträger blockiert den Weg nicht; nötige Körperkollision folgt seiner sichtbaren Form.

## D — bewusstes E/Klick als alleiniger Auswahlintent

Das Betreten einer Wortplatte verändert keine Antwort. E/Klick auf den sichtbaren erreichbaren Stein ist die Auswahl. Vorteile: gleiches Intentmodell wie Intro, Lesen/Zurückgehen ohne versehentliche Antwort, unkomplizierte Rücknahme. Nachteil: das Gehen ist eher räumliche Orientierung als eigentlicher Antwortakt; der ursprüngliche Schrittspielcharakter wird reduziert.

Empfehlung für den ersten vergleichbaren Bedienkandidaten: **D**, weil die Missverständnisse über Auswahl und HUD eng begrenzt werden können. Diese Empfehlung überschreibt Martins Schrittwunsch nicht. S ist ebenso vollständig beschrieben und abnehmbar; seine Entscheidung bleibt vor Umsetzung offen.

Pflichtzeile im Verbweg: „Wähle in jeder Reihe ein Verb.“ Hilfe erklärt E/Klick. Aktive Queryflächen sind echtes sichtbares Ziel, ganze Platte blau. `Contact.Update` darf in D keine Intro-/Pathauswahl erzeugen. Fußbewegung bleibt frei.

## S — bewusstes Schrittzentrum mit vorhandenen direkten Aktionen

**Start:** Nach Intro zeigt der Vorplatz drei Reihen und seitlich den bekannten Startpunkt20. Eine bewusste E/Klick-Aktion auf „Verbweg starten“ aktiviert `PathStart`. Alternativ startet wie bisher eine erste direkte gültige Auswahl der Reihe 1. Bloße Gartenbetretung aktiviert nichts. Erneutes E/Klick auf Start20 während aktivem/fehlerhaftem Weg ist state-neutral („Der Weg läuft schon.“); `PathStart` darf vorhandene richtige Reihen nicht löschen. So wird langsames Betrachten nicht unbeabsichtigt zur Antwort.

**Sichere Nebenlaufspur:** Gartenroute führt zunächst in eine140cm breite Spur bei Y−460 (Band etwa−530..−390), außerhalb der Wortzentren Y−180/0/+180. Die Hauptblickachse zeigt Reihen und Tor; kleine seitliche Verbindungen führen zu den Worten. Kein Zwang, auf dem mittleren falschen Wort zu laufen, um weiterzugehen. Rücknahme22 und Hilfe bleiben von der Spur aus erreichbar. Die Geometrie benötigt gleiche Bodenhöhe und klare Stein-/Spurkanten; keine unsichtbare Antwortgrenze.

**Aktive Reihe:** Nur die aus `PathPromptRow` erwartete noch ungelöste Reihe nimmt einen Fußintent an. Bereits erledigte oder zukünftige Reihen erzeugen keine neue automatische Antwort. Bei `pathFailed` bleibt Schrittannahme gesperrt, bis der letzte Schritt bewusst zurückgenommen wurde. Ein kurzer Hinweis nennt die aktive Reihe; keine wiederholte Meldung bei jedem Frame auf einer falschen Reihe.

**Bewusstes Zentrum/Dwell:** Ein Wort bekommt seinen Fußintent nur, wenn die Capsule auf seiner tatsächlichen Oberseite steht, beide horizontalen Abweichungen vom Zentrum≤42cm sind und derselbe Besuch mindestens0,30s ununterbrochen dauert. Das ist der vorhandene Dwellwert als bewusst beibehaltene Grundlage. Das wirksame84×84cm-Zentrum erhält eine ruhige optisch eingelassene Innenkontur im Material (keine höhenändernde Mulde mit abweichendem Collider), die eindeutig zur ganzen Wortplatte gehört und die Schrift nicht verdeckt. Die gesamte ausgewählte Platte bleibt blau, ohne Häkchen. Eine kleine ruhige Rand-/Füllanzeige nur während des bewussten Aufenthalts in der Mitte erklärt den kurzen Dwell; keine neue Timerpflicht. Am Rand oder auf der Nebenlaufspur bleibt der State unverändert. Contact muss Bodenhöhe/Komponente einschließen; reineX/Y-Nähe auf anderemTerrain/oberhalb des Wortes reicht nicht.

**Ein Besuch, ein Intent:** Fußauswahl wird höchstens einmal pro Besuch des Wortzentrums abgegeben. Nach Fehlwahl, Undo, Pause/Fokusverlust oder direkter E/Klick-Auswahl während eines Besuchs muss das Zentrum erst sichtbar verlassen werden, bevor ein weiterer Fußintent möglich ist. Reines `Contact.Reset()` beim Undo darf auf dem noch betretenen falschen Wort nicht nach0,30s denselben Fehler neu wählen. „Besuch konsumiert“ und „erneut außen gewesen“ sind explizite transient Runtimezustände, keine Saveflags. Wenn der Spieler in einem gesperrten Zentrum wartet, erscheint bei Bedarf einmal „Gehe kurz vom Stein.“ Die aktive Reihe bleibt durch ihre eigene Reihenmarke und den kurzen Fortschritt erkennbar. Beim Resume auf Wortmitte wird der aktuelle Besuch zunächst gesperrt; kein neuer Dwell aus verworfenem Contact.

**E/Klick in S:** Bleibt für motorische/Bedienalternativen verfügbar und verwendet denselben Target-/Corepfad. Eine direkte Auswahl konsumiert zugleich den aktuellen Fußbesuch, damit ein späterer Dwell nicht ein zweites Wort auswählt. Footcommit und E/Klick auf dasselbe Ziel im selben Frame zählen als ein Intent. Ein späterer neuer bewusster Press darf hingegen den letzten Schritt zurücknehmen. Keine pauschale Zeitdebounce und keine doppelte `PathStep`-Verarbeitung.

**Rücknahme:** Wie D: Wiederaktivieren des letzten ausgewählten Wortes mit E/Klick oder Rücknahme22 ruft `PathUndo` auf; frühere richtige Reihen bleiben. Danach führt die sichere Spur zur korrigierten Auswahl. Stehenbleiben auf einem zurückgenommenen falschen Stein erzeugt keine sofortige Neuauswahl. Ein falsches Wort wird ruhig zusätzlich mit Text/Form kenntlich; Ganzsteinblau ohne Häkchen bleibt Auswahlgrundlage.

Pflichtzeile in S: „Gehe auf ein Verb in jeder Reihe.“ Der knappe aktivitätsnahe Hinweis erklärt einmal: „Stehe kurz in der Mitte. Du kannst auch E drücken oder klicken.“ Das ist keine zweite permanente HUDwand. Vorteile: ursprüngliche räumliche Antwortmechanik erhalten, Gehen ist Teil des Rätsels. Risiken: intentabhängige Geometrie, langsamere Bewegung/Spielertiming und Fuß-/Pointerkonkurrenz; diese werden ausdrücklich geprüft, nicht pauschal als unbrauchbar bewertet.

## Zusätzlich erforderliche spätere Prüfungen

Alle **NICHTGEPRÜFT**, nur Plan. Für S werden dieselben Core-/Save-/Menü-/Gate-/Normaldurchlaufchecks wie für D benötigt, zusätzlich:

| ID | Ablauf | PASS-Kriterium / Beleg |
|---|---|---|
| S-I01 | Vor `PathStart` alle Wortflächen betreten | Keine Fußantwort; N+State |
| S-I02 | Sichere Spur langsam vor/zurück/quer laufen | Kein Antworttoggle, alle Reihen/Undo erreichbar; N+V |
| S-I03 | Aktive Reihe: Rand, Zentrum0,29s und≥0,30s | Sichtbare Innenkontur und Mittehinweis nachvollziehbar; Rand/kurzer Besuch keine Antwort; ununterbrochenes Zentrum genaueine; F+N getrennt |
| S-I04 | Zukunftsreihe/fertigeReihe/andereHöhe betreten | Keine automatische Antwort; richtige aktive Reihe bleibt; F+N |
| S-I05 | Auf Wort bleiben, Pause/Resume oder Undo | Rearmhinweis sichtbar, kein wiederholter Dwell bis Zentrum verlassen; N+F |
| S-I06 | Im Zentrum E/Klick vor/mit/nachDwell | Keine Doppelwahl; spätere bewusstneue Rücknahme funktioniert; N+F+Eventlog |
| S-I07 | Falsches Wort→Undo→aufgleichem Steinstehenbleiben→verlassen→neu wählen | Kein Wiederfehlertoggle durch Reset; gute Korrektur ohne Verlust alter Reihen; N+F |
| S-I08 | Wortoberseite/Schriftkörper/Randnormal an Capsule prüfen | Fußhöhe tatsächlich Steinoberseite, kein Durchlaufen; N+F+M |
| S-I09 | Langsam reagierende erwachsene Prüferperspektive, mehrminütige Pausen | Keine Strafe/ungewollte Antwort außerhalb bewussten Zentrums; qualitative N-Notiz, keinKinder-/Lernwirknachweis |

## Entscheidungsgate

A prüft technische Tragfähigkeit beider Varianten; B prüft Lesbarkeit/Handhabung und Erhalt des Schrittspielcharakters. Der Owner berichtet Vor-/Nachteile und Konflikte. Martins Freigabe legt D oder S fest. Ohne diese Entscheidung bleibt der Plan fertig zur Durchsicht, **die entsprechende Auswahlimplementierung nicht freigegeben**. Keine neue Reviewrunde außerhalb derselben beiden Planprüfer.
