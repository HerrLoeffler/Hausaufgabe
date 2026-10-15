# GradeCrew Secure Layout und Aufgabenführung

Stand: 16. Oktober 2026. Entwurf für die nächste Layoutstufe nach dem auf dem iPad getesteten Staging-Build 0.2.1 (1051). Dieser Auftrag liefert die ausführliche Gestaltung und Umsetzungsplanung. Er verändert weder die installierte App noch Production.

## 1. Was die nächste Version erreichen soll

Schülerinnen und Schüler sollen beim Öffnen sofort erkennen, wo sie den Code und ihren Namen eingeben. Während einer Prüfung müssen sie ihre aktuelle Aufgabe, die verbleibende Zeit und ihren Bearbeitungsstand erkennen, ohne lange zu suchen. Sie sollen wie auf der Website nummerierte Aufgaben direkt anwählen können. Bearbeitete Aufgaben werden grün gekennzeichnet; diese Farbe verrät keine richtige Lösung.

Die Crew macht den Einstieg als GradeCrew erkennbar. Während der Prüfung bleibt sie als kleines Markenbild präsent und überlagert keine Aufgaben. Die erfolgreich getestete Gerätesperre, Zeitsteuerung und Freigabe bleiben der technische Rahmen. Das Layout wird um diesen Rahmen verbessert.

Der Nutzer meldet nach dem ausgelieferten Prüfungsbuild zwei erfolgreiche iPad-Durchläufe: vorzeitig beendet und bis zum Zeitende laufen gelassen, jeweils mit Sperre und anschließender Freigabe. Das ist ein positiver Gerätenachweis aus Nutzersicht. Das konkrete iPad-Modell, die iPadOS-Version, ein sekundengenaues Zeitprotokoll und ein unabhängiger Abgleich der gespeicherten Serverantworten wurden dabei nicht mitgeliefert. Der Ausdruck „vorzeitig abgebrochen“ wird hier als berichteter früher Abschluss dokumentiert; daraus folgt kein neuer frei zugänglicher Abbruchknopf während AAC.

## 2. Geprüfter Ausgangspunkt

Die App nutzt SwiftUI für Einstieg, Prüfungsrahmen und Status. Die Aufgaben werden mit lokal gebündeltem HTML, CSS und JavaScript in einer eingeschränkten WKWebView angezeigt. Der Server stellt den Versuch, die bereinigten Aufgaben, die Frist und die verbindliche Abgabe bereit.

| Bereich | Vorhanden | Lücke oder Konsequenz |
|---|---|---|
| Einstieg | Crew, Logo, Code, Name/Kürzel, Start | Sehr helle Flächen, schwache Feldgrenzen, nicht durchgängig festgelegte Textfarben |
| Prüfungsrahmen | Titel, Name, Countdown, Speicherstatus, Abgeben | Optische Hierarchie und Anpassung bei großen Schriften benötigen gezielte Abnahme |
| Bearbeitungsstand | Anzahl bearbeiteter/offener Aufgaben und Balken | Keine nummerierten Sprungziele in der Secure-App |
| Website | Nummerierte Aufgabenknöpfe, grüne Bearbeitungszustände, aktuelle Aufgabe, Vor/Zurück und aufklappbare Übersicht | Dieses Verhalten muss gezielt in den sicheren Renderer übertragen werden |
| Aufgabentypen | Elf Typen, Bilder, Höraufgaben, verschiedene Antwortformen | Einzelne Bearbeitet-Regeln sind zu prüfen; Sortieraufgaben gelten derzeit schon mit ihrer Anfangsreihenfolge als vollständig |
| Sicherheit | Native AAC-Steuerung, lokale Sicherung, eingefrorene Abgabe, Serverquittung | Eine Layoutaktion darf diese Grenzen nicht erweitern |
| Layouttests | Secure hat DOM- und WK-Smoke-Tests; die Lehrkräfte-App besitzt eine eigene Größenmatrix | Die Secure-App braucht eigene Prüfungen ihrer tatsächlichen Oberflächen |

Die Beobachtung zu Weiß auf Weiß hat eine konkrete mögliche Ursache: `SecureStagingRootView.swift` zeichnet feste helle Flächen, verwendet für mehrere Texte aber die systemabhängige Standardfarbe. `GradeCrewSecureApp.swift` legt dafür kein einheitliches Erscheinungsbild fest. Der Webteil fordert bereits ein helles Farbschema an. Bei dunkler Geräteeinstellung können native Schrift und feste helle Fläche deshalb auseinanderlaufen. Diese Erklärung ist durch die Codestruktur begründet, aber noch keine am betroffenen Gerät nachgestellte Diagnose.

Quellen im Repository: `native/GradeCrewSecure/Sources/SecureStagingRootView.swift`, `GradeCrewSecureApp.swift`, `SecureExamCoordinator.swift`, `SecureExamWebView.swift`, `Resources/Exam/index.html`, `native-exam.js`, `question-renderer.js` und `exam.css`. Die Website-Referenz stammt aus `app.js` (`setupStudentProgress`, `studentAnswerIsComplete`, `refreshStudentProgress`), `ui-enhancements.js` (`enhanceStudentProgress`) und den zugehörigen Styles. Der lokale Integrationsstand dieser Referenz ist `8f8697901f8c1aea89897be855ca2872c82d0f2b`; er ist keine Aussage über einen späteren Production-Stand.

## 3. Entscheidung zur technischen Richtung

### Empfohlen: nativer Rahmen mit gemeinsamem Aufgabenverhalten

Einstieg, Kopfbereich, Timer, Status und Abgabe bleiben nativ. Die Aufgaben samt Aufgabenübersicht bleiben im vorhandenen lokalen Renderer. Damit kennen die Aufgabenknöpfe dieselben Aufgaben-IDs und Antwortwerte wie das eigentliche Formular. Ein Sprung zwischen Aufgaben benötigt keine neue Serveranfrage und keinen zusätzlichen privilegierten Webkanal.

Das liefert die gewünschte Bedienung und erhält die bestehende Integration. Eine App mit nativen Bereichen und lokal gerenderten Aufgaben kann konsistent und hochwertig aussehen. Dazu müssen Farben, Abstände, Schriftgrößen und Zustände gemeinsam definiert werden.

### Alternative: alle Aufgaben sofort in SwiftUI nachbauen

Dies würde für elf Aufgabentypen, Medien, Antwortserialisierung, Wiederherstellung und Bedienhilfen eine weitere vollständige Darstellung schaffen. Der zusätzliche Pflege- und Prüfaufwand ist erheblich. Diese Variante wird für die nächste Layoutversion verworfen; eine spätere gezielte Ablösung einzelner Typen bleibt möglich.

### Alternative: die vollständige Website in die App laden

Dies würde zwar deren Navigationsleiste mitbringen, aber auch Website-Kopfbereiche, andere Wege und zusätzliche Abhängigkeiten. Der bisher bewusst eingeschränkte sichere Aufgabenteil würde dadurch unnötig ausgeweitet. Auch diese Variante wird verworfen.

## 4. Gestaltungsregeln

Die Oberfläche wirkt wie ein klarer Arbeitsbogen mit blauem GradeCrew-Rahmen: eine erkennbare Hintergrundfläche, klar begrenzte Eingabefelder, dunkle Schrift und wenige eindeutige Aktionen. Weiß darf als Lesefläche dienen; es darf nicht gleichzeitig Fläche, Feldgrenze und Schriftzustand verschlucken.

Für diese Ausbaustufe wird die Secure-Oberfläche ausdrücklich im hellen Erscheinungsbild geführt, auch wenn das Gerät dunkel eingestellt ist. SwiftUI und WKWebView verwenden dieselbe Gestaltung. Die App bekommt damit keine halb umgesetzte Dunkelansicht. Ein echter Dunkelmodus wäre ein späterer eigener Auftrag mit vollständigen Farb- und Medienprüfungen.

### Farbrollen

| Rolle | Wert | Verwendung |
|---|---|---|
| Hintergrund | `#EFF3F9` | Gesamte Fläche außerhalb von Formular und Aufgaben |
| Lesefläche | `#FFFFFF` | Formular, Aufgaben, native Leisten |
| Eingabefläche | `#F2F6FC` | Textfelder und offene Antwortfelder |
| Haupttext | `#15283F` | Überschriften, Aufgaben, eingegebene Antworten |
| Zweittext | `#4B5E75` | Hinweise, Name, Speichermeldungen |
| Feldgrenze | `#6B7D96` | Sichtbare Grenzen von Eingaben und neutralen Bedienelementen |
| GradeCrew-Blau | `#1857CC` | Hauptaktion, Auswahl, Fokus |
| Bearbeitet | `#0E6547` auf `#DCF3E8` | Grüne Aufgabennummer mit Haken |
| Warnung | `#8A4B08` auf `#FFF1CF` | Verbindung oder verbleibende Minute |
| Fehler | `#B42318` auf `#FEE4E2` | Nicht bestätigte Abgabe, Speicherproblem |

Normale Schrift muss in ihrer tatsächlich dargestellten Kombination mindestens 4,5:1 Kontrast haben; sichtbare Feldgrenzen, Fokus und wichtige grafische Zustände mindestens 3:1 zur angrenzenden Fläche. Ein rechnerisch bestandener Farbwert genügt nicht, wenn eine spätere Transparenz ihn wieder unlesbar macht. Deaktivierte Aktionen behalten lesbaren Text und einen erklärbaren Zustand.

### Schrift und Ausrichtung

Die App verwendet die vorhandene Systemschrift. Eine neue Schriftdatei oder ein neues Markendesign ist nicht nötig. Im Einstieg gilt eine etwa 28-Punkt-Überschrift, Feldbezeichnungen 17 Punkte und Eingaben 20 Punkte, jeweils mit nativer Textskalierung. Im Webteil startet die Antwortschrift bei 19 logischen Pixeln, die Frage bei 23. Die vom Gerät gewünschte Schriftvergrößerung wird ausdrücklich in den Webteil übertragen; sie darf dort nicht verloren gehen.

Logo, Crew und Formular liegen auf einer gemeinsamen Mittelachse. Feldbezeichnungen, Fragen, Antworten und mehrzeilige Hinweise bleiben linksbündig. Symmetrie betrifft Raster, Außenabstände und vergleichbare Aktionen; sie erzwingt keine zentrierten Lesetexte. Zeit und Zahlen stehen ruhig mit gleich breiten Ziffern.

### Größen und Abstände

Außenabstand: 32 Punkte bei breitem Platz, 20 im normalen Hochformat, 16 bei knapper Breite. Formular maximal 560 Punkte, Aufgabenbereich und sein Kopf maximal 880. Der tatsächlich verfügbare Platz entscheidet; keine Fallunterscheidung nach Gerätemodell. Felder und Hauptaktionen mindestens 52 Punkte hoch, andere interaktive Ziele mindestens 44 mal 44. Zwischen Feldbezeichnung und Feld liegen 8 Punkte, zwischen Feldgruppen 20, zwischen großen Abschnitten 24 bis 32. Höhen wachsen mit Inhalt und Schrift.

Rundungen: Formular 24 Punkte, Aufgaben 20, Felder 12. Eine sichtbare Trennlinie ist wichtiger als ein Schatten. Keine zusätzlichen Verläufe, dekorativen Abzeichen oder dauernden Bewegungen. Bestehende Crew-Bilder werden mit vollständigem Seitenverhältnis angezeigt; keine abgeschnittenen Köpfe und keine erneute Bildgenerierung für diesen Schritt.

## 5. Einstieg und Prüfungsstart

Der Einstieg zeigt die Crew kompakt über Logo und „GradeCrew Secure“. Darunter folgt ein gut lesbares Formular mit den beiden Feldern „Testcode“ und „Name oder Kürzel“. Die feste Feldbezeichnung bleibt auch sichtbar, wenn der Platzhalter verschwunden ist. Codeeingaben werden wie bisher nach derselben Regel normalisiert. Kein zusätzlicher Schüleraccount wird eingeführt.

Der Startknopf heißt „Test starten“. Solange Angaben fehlen, steht darunter konkret, was fehlt. Die Startansicht verlangt keine vorgeschaltete Begrüßungsseite und keinen zweiten Zugangsknopf. Bei kleinen Höhen kann die Seite vertikal scrollen; die Tastatur darf weder das aktive Feld noch die nächste Aktion unerreichbar machen.

Nach erfolgreicher Vorprüfung zeigt die vorhandene Bestätigung Titel, Fach/Klasse soweit geliefert und Zeitlimit. Der Schüler bestätigt den Prüfungsmodus bewusst. Erst Apples bestätigter AAC-Start erlaubt Aufgaben. Vorprüfung und Start sind nicht zwei verschiedene Anmeldungen. Die aktuelle Startlogik bleibt dabei erhalten; es wird kein neuer Probestart erzeugt.

Ein ungültiger Code markiert das Codefeld und zeigt eine verständliche Meldung darunter. Ein Netzfehler löscht weder Code noch Namen. Ein laufender Vorgang blockiert doppelte Startaktionen und zeigt einen Spinner mit Text. In einem gespeicherten Versuch erscheinen Wiederaufnahme und der bekannte Prüfungsstand; ein neues leeres Formular darf diesen Versuch nicht unbemerkt ersetzen.

## 6. Prüfungsrahmen

Oben steht ein kompakter nativer Kopf: kleines GradeCrew-Logo, Testtitel, Name/Kürzel und die verbleibende Zeit. Ein langer Titel darf auf zwei Zeilen wachsen. Bei wenig Breite rückt die Zeit in eine zweite Zeile; sie wird nicht rechts abgeschnitten. Ein Test ohne Frist zeigt „Ohne Zeitlimit“.

Darunter beginnt die WKWebView mit ihrer eigenen angehefteten Aufgabenführung. Deren oberer Rand ist innerhalb der WebView null; die Höhe des nativen Kopfes wird nicht noch einmal als CSS-Abstand addiert. Unten zeigt eine native, sicher innerhalb des nutzbaren Bereichs liegende Leiste den Speicherzustand und „Abgeben“. Bildschirmtastatur und Safe Area werden in die tatsächliche Höhe eingerechnet.

Beim normalen Lesen darf der Inhalt nach oben und unten scrollen. Die Seite erzeugt keinen horizontalen Gesamtscroll. Gezielt horizontales Scrollen ist nur innerhalb der beschrifteten Aufgabennummernleiste zulässig. Ein automatischer Sprung verdeckt die Zielüberschrift nicht unter der angehefteten Navigation.

Während einer Prüfung gibt es keinen Home-Knopf, keine Lehrkräfteverwaltung, keinen Website-Sprachkopf und keinen Coco-Chat. Die Crew ist hier ein Markenmerkmal, kein zusätzlicher Hilfsassistent. Das hält die Aufgabe im Mittelpunkt und erweitert die erlaubten Funktionen während AAC nicht.

## 7. Aufgabenübersicht wie auf der Website

Die Leiste enthält „Aufgabe 3 von 15“, Vorherige/Nächste, eine Reihe anklickbarer Nummern und „Übersicht“. Ein kurzer Bearbeitungsstand bleibt sichtbar. Bei breitem iPad passt dies in zwei ruhige Zeilen. Bei knapper Höhe fällt die Aufgabennummernreihe in die aufklappbare Übersicht; aktuelle Nummer und Wechselaktionen bleiben direkt erreichbar.

Für viele Aufgaben wird nicht jede Zahl in einen immer höheren festen Kopf gepackt. Eine kompakte Reihe scrollt lokal horizontal und hält die aktuelle Nummer sichtbar. „Übersicht“ öffnet ein Raster mit mindestens vier Spalten bei 320 Punkten nutzbarer Breite und höchstens zwölf bei breitem Platz, sofern die vergrößerte Schrift dies zulässt. Bei großer Schrift werden es entsprechend weniger Spalten. Der Rasterbereich erhält maximal 240 Punkte beziehungsweise 40 Prozent der WebView-Höhe, je nachdem was kleiner ist, und scrollt intern. Aktuelle Aufgabe, Legende und Schließen bleiben erreichbar.

### Bedeutung der Zustände

| Zustand | Darstellung | Bedeutung |
|---|---|---|
| Offen | Helle Fläche, dunkle Nummer, klare Grenze | Noch keine vollständige Eingabe |
| Begonnen | Kleiner blauer Punkt plus Text in der zugänglichen Beschreibung | Teilweise ausgefüllt |
| Bearbeitet | Grüne Fläche, dunkle Nummer und Haken | Die Eingaberegel dieses Typs ist erfüllt |
| Aktuell | Zusätzlicher blauer Rahmen, `aria-current="step"` | Diese Aufgabe ist gerade ausgewählt oder im Lesebereich |

Aktuell und bearbeitet dürfen gleichzeitig gelten. Grün bleibt beim Anwählen erhalten, der blaue Rahmen kommt hinzu. Ein bloßer Klick auf eine Aufgabennummer macht nichts grün. Das Leeren einer Antwort entfernt die grüne Markierung wieder. Es gibt während der Prüfung kein Rot für „falsch“ und keine grüne Aussage über fachliche Richtigkeit.

Der Sprung verwendet die stabile Aufgaben-ID aus der vom Server gelieferten Reihenfolge. Nummern werden nach dieser Reihenfolge angezeigt, niemals nach einer zweiten clientseitigen Sortierung. Auswahl und Scrollen erzeugen keine neuen Aufgaben, keinen neuen Versuch und keine neue Frist. Die vorhandenen Antwortfelder bleiben im DOM, damit Antworten, Cursor und Medienposition nicht durch ein Neurendern verloren gehen.

Vor/Zurück haben an den Enden einen nachvollziehbaren deaktivierten Zustand. Nach dem letzten Eintrag entsteht kein automatischer Abgabedruck. Die Übersicht darf geschlossen werden, ohne Antworten zu ändern. Manuelles Scrollen aktualisiert die aktuelle Nummer; während eines gezielten Sprungs darf ein Zwischenzustand des Scrollens die gewählte Nummer nicht sofort überschreiben. Größenänderungen und nachgeladene Bilder müssen dabei berücksichtigt werden.

## 8. Wann eine Aufgabe als bearbeitet gilt

Diese Regeln beschreiben Eingaben, keine Bewertung. Sie werden gemeinsam von Zähler, grüner Nummer und Zusammenfassung vor der Abgabe genutzt.

| Typ | Vollständig bearbeitet | Wichtiger Sonderfall |
|---|---|---|
| Single Choice | Eine Option gewählt | Eine falsche Option ist trotzdem bearbeitet |
| Multiple Choice | Mindestens eine Option gewählt | Keine Kenntnis der Zahl richtiger Lösungen voraussetzen |
| Wahr/Falsch | Eine der beiden Optionen gewählt | `false` ist eine gültige Antwort, kein leerer Wert |
| Dropdown | Ein echter Eintrag gewählt | Der Platzhalter zählt nicht |
| Freitext | Mindestens ein Zeichen außer Leerraum | Inhalt wird nicht fachlich vorbewertet |
| Zahl | Nicht leere Eingabe | Null zählt; die Formatreferenz darf Dezimalkomma nicht als leer behandeln |
| Lückentext | Jede tatsächlich gerenderte Lücke nicht leer | Eine von drei Lücken ist begonnen, nicht vollständig |
| Zuordnung | Für jeden linken Eintrag ein Ziel gewählt | Fehlende Zuordnung bleibt offen/begonnen |
| Gruppierung | Für jeden zuzuordnenden Eintrag eine Gruppe gewählt | Teilmenge genügt nicht |
| Reihenfolge | Vollständige Liste und ausdrückliche Bearbeitung/Bestätigung | Die voreingestellte Reihenfolge wird nicht schon beim Laden grün |
| Wörter markieren | Mindestens eine Wortmarkierung | Ohne Lösungsschlüssel ist „alle richtigen Wörter“ nicht prüfbar |

Bei Reihenfolge gibt es zusätzlich „Reihenfolge bestätigen“. So kann eine Schülerin eine bereits passende Ausgangsfolge bewusst bestätigen, ohne absichtlich etwas falsch hin- und herzuschieben. Verschieben zählt ebenfalls als Bearbeitung. Ob eine Reihenfolge schon angefasst oder bestätigt wurde, wird als Darstellungsmetadatum lokal gesichert, getrennt vom unveränderten Antwortformat.

Ein älterer gespeicherter Versuch ohne dieses Metadatum bleibt wiederherstellbar. Seine Antworten werden nicht gelöscht. Bei Reihenfolge bleibt die Nummer zunächst offen, bis die vorhandene Folge bestätigt oder verändert wird. Diese vorsichtige Darstellung verändert weder die Antwort noch die spätere Serverbewertung und verhindert keine Abgabe.

## 9. Aufgaben, Antworten und Medien

Jede Aufgabe beginnt mit Nummer und Punkten in einer ruhigen Kopfzeile, anschließend folgt die Frage und direkt der zugehörige Antwortbereich. Ein kleines Typwort kann die Bedienung erklären, darf aber keinen großen Zwischenblock bilden. Für Single Choice und Multiple Choice wird die ganze Antwortzeile ein gut erreichbares Ziel; Auswahl, Fokus und ungewählter Zustand sind deutlich verschieden.

Ein Bild, das zur Lösung benötigt wird, bleibt bei der Frage sichtbar. Eine Höraufgabe mit bewusst verborgenem Fragetext behält diese Präsentationsregel. Die Layoutarbeit darf weder verborgene Texte offenlegen noch notwendige Bilder hinter „optional“ verstecken. Medien werden nicht pauschal unter alle Antworten verschoben, nur um weniger Scrollhöhe zu erzeugen.

Bilder behalten ihr vollständiges Seitenverhältnis. Ein maximales Darstellungsmaß begrenzt die Höhe, beschneidet aber keinen Inhalt. Audioplayer passen in die Aufgabenbreite. Ladeprobleme zeigen unmittelbar am Medium eine verständliche Meldung. Sie dürfen keine falsche Aussage „auf dem Server gesichert“ auslösen. Bei einem ausdrücklichen Sprung zu einer anderen Aufgabe wird laufendes Audio pausiert, aber seine Abspielposition nicht zurückgesetzt. Normales vertikales Lesen löst keine Pause aus.

Mathematische Formeln, lange Wörter, sehr lange Antworttexte, Bildantworten und Audioantworten gehören zu den Layoutfixtures. Die neue Gestaltung erhält die aktuellen Inhalts- und Antwortformen. Ein Umbau des Lehrkräfte-Editors gehört nicht zu diesem Plan.

## 10. Abgabe und Statusseiten

Der Knopf heißt überall „Abgeben“, die Bestätigung „Jetzt abgeben“. Bei offenen Aufgaben zeigt die Bestätigung deren Anzahl und eine Aktion „Weiterarbeiten“. Offene Antworten verhindern eine bewusste Abgabe nicht. Nach Zeitende wird ohne blockierende Nachfrage eingefroren und automatisch abgegeben.

Die Darstellung trennt vier Vorgänge: Antworten sind lokal gesichert; Abgabe wird gesendet; Server bestätigt die Abgabe; iPad wird freigegeben. Ein grüner Abschluss erscheint erst im bestehenden bestätigten Abschlusszustand nach Apples End-Callback. Während des Sendens bleiben Aufgaben verdeckt und nicht bearbeitbar. Die neue Aufgabenübersicht kann diesen Zustand weder verlassen noch eine Freigabe anfordern.

Die Erfolgsseite zeigt Crew/Logo kompakt, einen eindeutigen Haken, „Abgabe gespeichert“ und „Das iPad ist wieder freigegeben“. „Zurück zum Start“ ist die einzige Hauptaktion. Die App wird nicht künstlich beendet; das Gerät kann nach Freigabe wieder normal verwendet werden.

Warte-, Wiederaufnahme-, Speicherfehler-, Verbindungs- und Unterbrechungsseiten verwenden dieselben lesbaren Flächen und dieselbe Breitenbegrenzung wie der Einstieg. Sie unterscheiden Warnung, Fehler und laufenden Vorgang über Text und Symbol, nicht nur Farbe. Nach einem Verbindungsproblem werden keine erfolgreichen Wolken- oder Sync-Symbole gezeigt, solange nur lokaler Speicher bestätigt ist.

Die bestehende Grenze bleibt sichtbar: keine Offline-Neustarts und keine garantierte Abgabe bei langem Ausfall. Der Server lässt derzeit nur 30 Sekunden Nachlauf zu. Lehrer-Notfreigabe und echte Offline-Prüfung sind separate Funktionsarbeiten und werden nicht durch neue Fehlertexte als gelöst dargestellt.

## 11. Geräte, Bedienhilfen und Bewegung

Die erste Abnahme gilt weiterhin iPadOS ab 17 und iPads. Kleine verfügbare Fensterbreiten werden als Robustheitsfall getestet; das ist keine Zusage, dass AAC Multitasking oder Split View während der Prüfung erlaubt. Ein iPhone-Release entsteht nicht aus einem bestandenen schmalen Layouttest.

Pflichtfälle sind iPad mini, normale und große iPads, Hoch- und Querformat, Bildschirmtastatur, externe Tastatur und große Schrift. Bei 320 Punkten verfügbarer Breite müssen Inhalte wachsen oder untereinander stehen. Ein abgeschnittenes Steuerelement wird nicht durch kleinere Schrift oder ausgeblendete Aktionen „repariert“.

VoiceOver liest beispielsweise „Aufgabe 3 von 15, bearbeitet, aktuell“. Es liest „bearbeitet“, nicht „richtig“. Fokus ist sichtbar. Aufgabensprünge fokussieren die Zielüberschrift, ohne die Eingabetastatur unnötig zu öffnen. Timer und Bearbeitungsstand werden nicht jede Sekunde als neue Sprachausgabe aufgedrängt. Bei reduzierter Bewegung erfolgen Sprünge ohne weiche Scrollanimation; es gibt keine erzwungene Crew-Animation.

## 12. Verbindliche Abnahme

Die neue Version ist gestalterisch erst fertig, wenn alle folgenden Ergebnisse vorliegen:

1. Einstieg und sämtliche Statusseiten sind bei heller und dunkler Geräteeinstellung lesbar.
2. Code, Name, Schaltflächen und Hinweise sind bei Tastatur und großer Schrift erreichbar.
3. Jede Aufgabennummer führt zur richtigen Aufgaben-ID; die Frage bleibt nach dem Sprung sichtbar.
4. Bearbeitet-, begonnen- und aktuelle Zustände stimmen für alle elf Typen, auch nach Leeren und Wiederaufnahme.
5. Eine voreingestellte Sortierfolge wird erst nach bewusster Bearbeitung grün.
6. Navigation und Scrollen verändern weder Antworten noch Zeitlimit und senden keine Freigabe.
7. Medien und Fragetexte sind vollständig sichtbar; auch eine lange Aufgabe bleibt benutzbar.
8. Bei Ablauf, Abgabe, Unterbrechung und Prozessverlust kommt kein bearbeitbarer falscher Zwischenzustand zum Vorschein.
9. Vorzeitige und zeitgesteuerte Abgabe mit anschließender Freigabe werden auf dem echten iPad erneut geprüft.
10. GitHub-Quellstand, CI-Ergebnis, signierte AAC-Berechtigung, TestFlight-Upload und tatsächlicher Gerätetest werden getrennt belegt.

Zum Plan gehört eine Screenshot-Matrix mit Messungen und zusätzlicher menschlicher Sichtprüfung. Automatische Prüfungen können Überläufe, Zielgrößen, Zustände und Kontraste nachweisen. Sie ersetzen kein Urteil darüber, ob die Oberfläche ruhig, markentypisch und angenehm zu lesen ist.
