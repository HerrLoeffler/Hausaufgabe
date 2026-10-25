"use strict";

// Own practice goals below existing, still unreviewed source anchors. No copied
// worksheet text, source certification or historical parent-evidence migration.
const content = require("../../data/competencies56.json");
const families = Object.create(null);
function define(names, levels, help, preferredTool = "none", delivery = "text", scene = "") {
  for (const name of names.split(" ")) families[name] = {levels, help, preferredTool, delivery, scene};
}

define("place", [
  "Den Wert einer markierten Ziffer in einer beschrifteten Stellenwerttafel angeben.",
  "Eine Zahl mit inneren Nullen zwischen Zahlwort, Ziffern und Stellenwerttafel übertragen.",
  "Drei Darstellungen auf Wertgleichheit abgleichen und eine Abweichung lokalisieren.",
  "Eine falsche Deutung einer Ziffer anhand ihrer Stelle und der Rolle der Null widerlegen.",
], [
  "Nur eine markierte Ziffer bei bereits beschrifteter Stelle deuten; keine ganze Zahl übertragen.",
  "Nur Einer, Zehner und Hunderter einer dreistelligen Zahl zuordnen; höhere Stellen entfallen.",
  "Nur die Einer eines dargestellten Zehnerbündels zählen; danach den Stellenwert wieder aufnehmen.",
]);
define("compare round", [
  "Die erste unterschiedliche Stelle oder die vorgegebenen Rundungsnachbarn bestimmen.",
  "Den Vergleich oder die verlangte Rundung ohne vorweggenommene Entscheidung ausführen.",
  "Die Ordnung oder gewählte Rundungsgenauigkeit an der Sachsituation begründen.",
  "Eine unpassende Vergleichs- oder Rundungsentscheidung mit den Nachbarwerten berichtigen.",
], [
  "Nur die entscheidende Stelle betrachten; die übrigen Stellen bleiben gegeben.",
  "Nur die beiden maßgeblichen Ziffern vergleichen; den Stellenwertschritt noch nicht verbinden.",
  "Nur den größeren von zwei kleinen natürlichen Werten nennen; danach zur Zahl zurückkehren.",
]);
define("sequence", [
  "Die Änderung zwischen zwei benachbarten Folgengliedern bestimmen.",
  "Mit der wiederkehrenden Regel ein fehlendes Glied ergänzen.",
  "Die Regel als Rechenanweisung beschreiben und an weiteren Gliedern prüfen.",
  "Zwei vorgeschlagene Regeln an allen gegebenen Gliedern prüfen; Mehrdeutigkeit zulassen.",
], [
  "Nur einen Übergang zweier benachbarter Glieder berechnen.",
  "Nur die Differenz zweier kleiner Werte bestimmen; die restliche Folge ausblenden.",
  "Nur eine kleine Addition aus dem Übergang ausführen; danach den Übergang erneut prüfen.",
]);
define("addNatural subtractNatural multiplyNatural divideNatural", [
  "Eine einzelne Stellen- oder Teilrechnung bei gegebener Zerlegung ausführen.",
  "Ein passendes schriftliches oder halbschriftliches Verfahren selbstständig durchführen.",
  "Stellenwechsel, Teilprodukt oder Rest anhand der gewählten Zerlegung erklären.",
  "Einen konkreten Fehler eines fremden Verfahrens mit einer Gegenprobe korrigieren.",
], [
  "Nur die fehlerhafte Teilrechnung mit gegebener Zerlegung lösen; übrige Schritte bleiben stehen.",
  "Nur die benötigte Grundaufgabe ohne Stellenwechsel lösen; kein mehrstelliges Verfahren verlangen.",
  "Nur kleine Mengen bündeln, wegnehmen oder gleichmäßig verteilen; danach zur Grundaufgabe zurückkehren.",
]);
define("term fractionTerm fractionTermOrder laws", [
  "Die zuerst auszuführende Operation oder passende wertgleiche Gruppierung bestimmen.",
  "Einen kurzen Term mit passender Klammer- und Punkt-vor-Strich-Reihenfolge berechnen.",
  "Die wertgleiche Umformung oder Rechenreihenfolge mit korrekt erhaltenen Zwischentermen erklären.",
  "Eine unzulässige Umformung oder verletzte Rechenreihenfolge an einem konkreten Term widerlegen.",
], [
  "Nur die bereits markierte erste Teilrechnung lösen; der restliche Term bleibt vorgegeben.",
  "Nur die einzelne dafür benötigte Grundoperation lösen; Klammerkoordination entfällt.",
  "Nur einen kleinen natürlichen Rechenschritt dieser Grundoperation ausführen; dann zurückkehren.",
]);
define("model fractionModel", [
  "Die Bezugsgröße, eine relevante Angabe und die gesuchte Größe der Situation nennen.",
  "Benötigte Daten auswählen und die passende Rechnung mit ihrer Bedeutung angeben.",
  "Das Modell auf eine anders formulierte Situation beziehen und unwichtige Daten ausschließen.",
  "Zwei vorgeschlagene Rechnungen auf Passung zum Sachverhalt prüfen und die Wahl begründen.",
], [
  "Nur die gesuchte Größe benennen; Datenwahl und Rechnung entfallen.",
  "Nur entscheiden, ob eine einzelne Zahl zur gesuchten Größe gehört.",
  "Nur eine ausdrücklich benannte Menge in einem kurzen Satz wiederfinden; danach die Frage erneut klären.",
]);
define("check fractionContextCheck volumeProbe", [
  "Die gefragte Größe und erwartete Einheit einer gegebenen Rechnung nennen.",
  "Ein Ergebnis durch passende Umkehrrechnung oder Überschlag prüfen.",
  "Rechenwert, Einheit und Größenordnung getrennt auf den Sachverhalt zurückbeziehen.",
  "Einen rechnerisch möglichen, im Kontext unpassenden Wert mit seiner Bedeutung verwerfen.",
], [
  "Nur einen vorgegebenen Kontrollschritt ausführen; keinen neuen Kontrollweg planen.",
  "Nur die benötigte kleine Grundrechnung ohne Sachtext lösen.",
  "Nur die passende Einheit aus zwei Möglichkeiten auswählen; dann zum Zahlencheck zurückkehren.",
]);
define("signedPosition signedCompare", [
  "Nullpunkt, Einheit und Richtung einer beschrifteten Zahlengeraden bestimmen.",
  "Vorzeichenbehaftete Zustände verorten oder nach ihrer Lage vergleichen.",
  "Lage und Abstand zum Nullpunkt für die Erklärung der Ordnung verwenden.",
  "Die Behauptung, ein größerer Betrag bedeute stets eine größere Zahl, mit negativen Werten widerlegen.",
], [
  "Nur eine Zahl auf der bereits skalierten Achse verorten; der Vergleich entfällt.",
  "Nur entscheiden, auf welcher Seite von null ein negativer Zustand liegt.",
  "Nur Nullpunkt und Richtung steigender Werte an den Marken -1, 0 und 1 zeigen.",
], "number-line", "visual", "Beschriftete gleichmäßige Zahlengerade mit Nullpunkt und negativen wie positiven Werten.");
define("signedChange signedCalculate signedTimes signedDivide", [
  "Ausgangswert, Änderungsrichtung und gegebenenfalls natürliche Schrittanzahl getrennt nennen.",
  "Die im Ziel benannte rationale Änderung mit korrektem Vorzeichen berechnen.",
  "Rechnung und gerichtete Bewegung, wiederholte Änderung oder gleichmäßige Verteilung verbinden.",
  "Einen verwechselt verwendeten Betrag, ein Vorzeichen oder Rechenzeichen mit der Umkehrprobe korrigieren.",
], [
  "Nur den Betrag einer einzelnen Änderung bei gegebenem Vorzeichen berechnen; mehrere Änderungen entfallen.",
  "Nur die entsprechende positive Betrags-Grundrechnung ohne Sachtext lösen.",
  "Nur einen positiven Einheitsschritt oder zwei gleiche kleine Mengen verfolgen; danach zur Betragsrechnung zurückkehren.",
], "number-line");
define("coordinates", [
  "Die x- und y-Koordinate eines markierten Punktes getrennt an beschrifteten Achsen ablesen.",
  "Ein Koordinatenpaar mit korrekter Achsenreihenfolge ablesen oder als Punkt setzen.",
  "Mehrere Punkte einer Figur mit den im Ziel erlaubten Vorzeichen koordinieren und verbinden.",
  "Eine vertauschte Achsenreihenfolge oder ein falsches Vorzeichen durch Punktvergleich erklären.",
], [
  "Nur die x-Koordinate ablesen; die y-Koordinate bleibt angegeben.",
  "Nur den Abstand einer markierten Gitterlinie von null in Einheiten zählen.",
  "Nur Nullpunkt und einen einzelnen Einheitsschritt auf einer Achse zeigen.",
], "none", "visual", "Koordinatengitter mit x/y-Achsen, Nullpunkt und auswählbaren Punkten; Klasse5 erster Quadrant, Klasse6 vier Quadranten.");
define("lines quadrilaterals circle", [
  "Ein ausdrücklich benanntes geometrisches Merkmal an einer sichtbaren Figur identifizieren.",
  "Die Figur anhand der gefragten Seiten-, Winkel- oder Kreiseigenschaften zuordnen beziehungsweise beschriften.",
  "Mehrere Eigenschaften verbinden; Unterklassen wie Quadrat als Rechteck ausdrücklich zulassen.",
  "Eine nur nach optischer Lage begründete falsche Zuordnung an einem geometrischen Merkmal widerlegen.",
], [
  "Nur ein markiertes Merkmal an einer Figur prüfen; die vollständige Klassifikation entfällt.",
  "Nur zwei markierte Streckenlängen oder eine Ecke mit einer Rechtwinkelschablone vergleichen.",
  "Nur die im Auftrag benannte Linie, Ecke oder den Mittelpunkt in der Figur zeigen.",
], "none", "visual", "Geometrisch exakte Linien/Vierecke oder Kreiszeichnung mit sichtbaren Kanten, Winkeln, Mittelpunkt, Radius und Durchmesser passend zum Ziel.");
define("angleRead angleDraw", [
  "Scheitel, Ausgangsschenkel und Nullrichtung der Winkelskala zuordnen.",
  "Den Winkel bis180 Grad auf der richtigen Skala ablesen oder den zweiten Schenkel setzen.",
  "Die Öffnung mit90 Grad vergleichen und die Auswahl der Skalenrichtung erklären.",
  "Einen durch die falsche Doppelskala entstandenen Wert an der tatsächlichen Öffnung widerlegen.",
], [
  "Nur die Nullmarke am Ausgangsschenkel wählen; noch keinen Winkel messen oder zeichnen.",
  "Nur die Öffnung mit einer eingeblendeten rechten Ecke vergleichen.",
  "Nur gemeinsamen Scheitel und beide Schenkel zeigen; anschließend die Nullrichtung erneut bestimmen.",
], "none", "visual", "Exakt berechneter Winkel mit zwei Schenkeln, Scheitel und echter Gradskala; digitales Setzen belegt keinen Umgang mit physischem Geodreieck.");
define("perimeter perimeterMissing", [
  "Randseiten von inneren Hilfslinien einer beschrifteten Figur unterscheiden.",
  "Randseiten summieren oder eine fehlende Randlänge aus dem gegebenen Umfang bestimmen.",
  "Den Rechenweg durch vollständige Randverfolgung und passende Längeneinheit begründen.",
  "Einen Weg mit ausgelassener oder doppelt gezählter Randseite an der Zeichnung korrigieren.",
], [
  "Nur zwei benachbarte Randseiten zusammenrechnen; die restliche Summe bleibt angegeben.",
  "Nur eine markierte Seitenlänge samt Einheit ablesen; noch nicht summieren.",
  "Nur eine äußere Seite von einer inneren Hilfslinie unterscheiden; danach zur Länge zurückkehren.",
], "none", "visual", "Geschlossene bemaßte Dreiecks-/Viereckszeichnung mit tatsächlich sichtbarer Randfolge und konsistenten Seitenmaßen.");
define("areaCount areaRectangle areaComposite areaInverse", [
  "Eine Reihe von Einheitsquadraten oder ein vorgegebenes Teilrechteck erfassen.",
  "Die im Ziel gefragte Rechteckfläche, Flächenzerlegung oder fehlende Seitenlänge bestimmen.",
  "Faktoren beziehungsweise Teilflächen an der Figur erklären und Flächenmaß vom Randmaß unterscheiden.",
  "Eine überlappende Zerlegung oder verwechslte Umfangsrechnung durch die bedeckten Quadrate widerlegen.",
], [
  "Nur ein bereits abgegrenztes kleines Teilrechteck auswerten; Zerlegung und Gesamtsumme entfallen.",
  "Nur Einheitsquadrate einer einzigen Reihe zählen; weitere Reihen ausblenden.",
  "Nur ein Einheitsquadrat als Flächeneinheit kennzeichnen; dann die einzelne Reihe erneut zählen.",
], "none", "visual", "Maßhaltiges quadratisches Flächenraster mit bemaßten Seiten und sichtbarer lückenloser Rechteckzerlegung.");
define("areaUnits volumeUnits units timeMoney", [
  "Ausgangseinheit, Zieleinheit und den tatsächlichen Einheitenfaktor bestimmen.",
  "Die angegebene Größe mit dem fachlich passenden Faktor wertgleich umrechnen.",
  "Die Wertgleichheit über die Größenart erklären; lineare, quadratische, kubische und Zeitfaktoren unterscheiden.",
  "Eine falsche Einheitenrichtung oder einen unpassenden Faktor anhand der konkreten Einheitenbeziehung korrigieren.",
], [
  "Nur den benötigten Faktor bestimmen; die konkrete Maßzahl noch nicht umrechnen.",
  "Nur eine einzige größere Einheit in die kleinere Einheit übersetzen; gemischte Angaben entfallen.",
  "Nur Ausgangs- und Zieleinheit der Größenart zuordnen; dann den Einheitenfaktor erneut prüfen.",
]);
define("estimate", [
  "Eine bekannte Bezugsgröße mit zur gesuchten Größe passender Einheit auswählen.",
  "Eine Alltagsgröße durch Vergleich mit der Bezugsgröße schätzen.",
  "Ein begründetes Intervall statt einer unbelegten exakten Messzahl angeben.",
  "Zwei Schätzungen anhand von Bezugsgröße, Einheit und Alltagssituation prüfen.",
], [
  "Nur die passende von zwei Bezugsgrößen wählen; noch keine Schätzung berechnen.",
  "Nur die Größenart Länge, Masse, Zeit, Geld oder Füllmenge nennen.",
  "Nur eine ausdrücklich beschriftete Bezugsgröße und ihre Einheit benennen.",
]);
define("frequency survey", [
  "Ein Merkmal und eindeutige Kategorien einer kleinen anonymen Erhebung identifizieren.",
  "Daten zuordnen und absolute Häufigkeiten beziehungsweise eine passende Erhebungsfrage angeben.",
  "Strichliste, Tabelle und Gesamtzahl auf Vollständigkeit und eindeutige Zuordnung abgleichen.",
  "Mehrdeutige Kategorien, Doppelzählung oder eine suggestive Frage begründet verbessern.",
], [
  "Nur die Häufigkeit einer vorgegebenen Kategorie in einer kurzen Liste zählen.",
  "Nur einen einzelnen Datenwert einer von zwei eindeutigen Kategorien zuordnen.",
  "Nur das Merkmal eines einzigen Datenwerts benennen; danach die Kategorie erneut zuordnen.",
], "none", "visual", "Sichtbare endliche anonyme Rohdatenliste und konsistente beschriftete Strichliste/Tabelle; keine echten Schülerdaten erheben.");
define("chartRead chartCompare textChart", [
  "Achse, Einheit und einen tatsächlich sichtbaren Diagrammwert zuordnen.",
  "Die für die Leitfrage benötigten Werte aus Diagramm und gegebenenfalls Tabelle oder Text entnehmen.",
  "Werte bei passender Einheit, Bezugsgruppe und Zeitraum verbinden und den Schluss mit Angaben belegen.",
  "Eine irreführende Aussage durch Prüfung von Skala, Bezugsgruppe oder fehlendem Textbeleg berichtigen.",
], [
  "Nur einen Wert an einer markierten Säule ablesen; Vergleich und Textverknüpfung entfallen.",
  "Nur den Wert eines beschrifteten Achsenabstands bestimmen; noch keine Säulenhöhe ablesen.",
  "Nur dargestellte Größenart und Einheit benennen; dann den Skalenabstand wieder aufnehmen.",
], "none", "visual", "Tatsächliches beschriftetes Säulen-/Balkendiagramm, konsistente Daten und Einheit, eindeutige Skala und Bezugsgruppe; keine rein behauptete Abbildung.");
define("mean meanMeaning", [
  "Datenwerte und Anzahl der Werte einer vollständigen kurzen Liste getrennt erfassen.",
  "Die Summe durch die Anzahl teilen beziehungsweise den gegebenen Durchschnitt im Kontext deuten.",
  "Den Durchschnitt als Ausgleich erklären und von einem tatsächlich vorkommenden Einzelwert unterscheiden.",
  "Eine Mittelwertbehauptung mit falschem Divisor oder verwechseltem Höchstwert widerlegen.",
], [
  "Nur die Summe der bereits gezählten Werte bestimmen; Division entfällt.",
  "Nur die vorhandenen Listeneinträge einschließlich null zählen; nicht summieren.",
  "Nur zwei einzelne Listeneinträge als zwei Datenwerte identifizieren.",
], "none", "visual", "Vollständige beschriftete Datenliste; optionales Ausgleichsmodell muss die Summe erhalten.");
define("equation volumeInverse", [
  "Bekannte Größen und die eine gesuchte Zahl in der gegebenen Gleichung oder Formel benennen.",
  "Den unbekannten Wert mit passender Umkehroperation bestimmen.",
  "Den gefundenen Wert in die ursprüngliche Gleichung einsetzen und Gleichheit samt Einheit erklären.",
  "Einen fehlerhaften Umkehrschritt durch die Einsetzprobe prüfen und korrigieren.",
], [
  "Nur die passende Umkehroperation wählen; Berechnung und mehrstufige Verbindung entfallen.",
  "Nur die benötigte kleine Grundaufgabe dieser Umkehroperation lösen.",
  "Nur eine kleine gleiche Verteilung oder ein bekanntes Teilprodukt bestimmen; dann zur Umkehrfrage zurückkehren.",
], "balance");
define("whole equalParts fractionRead fractionRepresent", [
  "Das festgelegte Ganze, gleiche Teile und markierte Teile getrennt identifizieren.",
  "Den gefragten Anteil mit Zähler und Nenner verbinden beziehungsweise darstellen.",
  "Die Bedeutung von Zähler und Nenner an einer anders unterteilten Darstellung erklären.",
  "Eine falsche Anteilsdeutung mit ungleichen Teilgrößen oder geändertem Ganzen begründet zurückweisen.",
], [
  "Nur einen einzelnen gleich großen Teil und das dazugehörige Ganze bestimmen; noch keinen ganzen Bruch nennen.",
  "Nur alle Teile des bereits eindeutig geteilten Ganzen zählen; Markierung ausblenden.",
  "Nur entscheiden, ob zwei gezeigte Teilflächen gleich groß sind; anschließend die ganze Teilung prüfen.",
], "fraction-board", "visual", "Festgelegtes gleichbleibendes Ganzes, gleiche Teilflächen und unabhängige Markierung; für Gleichheitsprüfung auch ausdrücklich ungleiche Teile zulassen.");
define("improper mixed quotientFraction quotientMixed", [
  "Ganze Einheiten und einen verbleibenden gleich großen Bruchteil getrennt erfassen.",
  "Die gefragte unechte, gemischte oder verteilungsbezogene Bruchdarstellung bestimmen.",
  "Mehrere gleiche Ganze und die symbolische Schreibweise beziehungsweise Verteilung verbinden.",
  "Eine Verwechslung von Anzahl ganzer Einheiten und Nenner anhand derselben Bezugsgröße korrigieren.",
], [
  "Nur die Bruchteile eines einzigen Ganzen zählen; die weiteren ganzen Einheiten bleiben vorgegeben.",
  "Nur aus einem Ganzen die Anzahl gleich großer Teile angeben; der markierte Anteil entfällt.",
  "Nur ein vollständiges Ganzes und einen Teil davon zeigen; danach die Teilanzahl erneut prüfen.",
], "none", "visual", "Mehrere gleich große sichtbare Ganze mit identischer Teilung beziehungsweise sichtbares gleichmäßiges Verteilungsmodell.");
define("fractionScale fractionPosition", [
  "Zwischen null und eins beziehungsweise zwei beschrifteten Marken gleich große Abstände zählen.",
  "Den Wert eines Abstandes erschließen und den gefragten Bruch auf der Skala verorten.",
  "Flächenanteil, Bruchschreibweise und Position auch jenseits von eins miteinander verbinden.",
  "Eine Zählung von Strichen statt Abständen an der sichtbaren Skala erläutern und korrigieren.",
], [
  "Nur den Wert eines Abstands zwischen zwei gegebenen Marken bestimmen; Zielposition entfällt.",
  "Nur die Anzahl der Abstände zwischen null und eins zählen.",
  "Nur den ersten Abstand nach null zeigen; null zählt nicht als zurückgelegter Schritt.",
], "number-line", "visual", "Gleichmäßige Zahlengerade mit Nullpunkt und mindestens zwei konsistenten Skalenankern; Werte über eins passend zum Ziel zulassen.");
define("fractionAmountUnit fractionAmount", [
  "Gesamtmenge und Nenner des vorgegebenen Anteils getrennt benennen.",
  "Den Einheitsbruch durch Division und gegebenenfalls mehrere Teilmengen durch Vervielfachen bestimmen.",
  "Die Rechnung mit gleich großen Gruppen der unveränderten Gesamtmenge erklären.",
  "Eine Verwechslung von Nenner und Zähler in der Mengenrechnung mit der Gruppenbedeutung widerlegen.",
], [
  "Nur den Einheitsbruch der gegebenen teilbaren Menge bestimmen; Vervielfachung entfällt.",
  "Nur eine kleine natürliche Menge gleichmäßig auf die vorgegebene Gruppenanzahl verteilen.",
  "Nur die Elemente einer einzigen bereits gebildeten Gruppe zählen; dann zur Verteilung zurückkehren.",
]);
define("expand expandTarget expandMeaning commonDenominator", [
  "Den angegebenen Erweiterungsfaktor beziehungsweise die Unterteilung eines Teils bestimmen.",
  "Zähler und Nenner mit demselben natürlichen Faktor wertgleich umformen; Zielnenner bei Bedarf selbst erschließen.",
  "Den erhaltenen Anteil am konstanten Ganzen erklären beziehungsweise zwei Brüche auf ein gemeinsames Teilmaß bringen.",
  "Eine bloße Nenneränderung durch Vergleich der Wertgleichheit und eine korrekte Erweiterung widerlegen.",
], [
  "Nur die Zählermultiplikation mit bereits gegebenem Faktor berechnen; Nenner und Faktorwahl bleiben vorgegeben.",
  "Nur die entsprechende wiederholte Addition mit vollständig angegebenen Summanden lösen.",
  "Nur eine einzelne kleine Addition aus dieser Summe lösen; anschließend zur Zählermultiplikation zurückkehren.",
], "fraction-board");
define("reduce reduceChoice", [
  "Einen vorgegebenen gemeinsamen Teiler von Zähler und Nenner auf Teilbarkeit prüfen.",
  "Zähler und Nenner durch denselben natürlichen Teiler wertgleich kürzen.",
  "Einen geeigneten gemeinsamen Teiler selbst wählen und die vollständig gekürzte Form begründen.",
  "Eine unzulässige Kürzung durch Wertvergleich oder Rückerweitern widerlegen.",
], [
  "Nur den Zähler durch den vorgegebenen Teiler teilen; Nenner und Teilerwahl entfallen.",
  "Nur die dafür benötigte natürliche Division ohne Bruchschreibweise lösen.",
  "Nur eine kleine Menge gleichmäßig verteilen und eine Gruppengröße zählen.",
], "fraction-board");
define("fractionCompare fractionCompareUnlike", [
  "Die gemeinsame Bezugseinheit und einen bekannten Bezugswert wie ein Halb bestimmen.",
  "Brüche über gleiches Teilmaß, gleichen Zähler oder passende Bezugswerte vergleichen.",
  "Die Ordnung durch wertgleiche Darstellung oder Lage am Zahlenstrahl erklären.",
  "Die Behauptung, der größere Nenner bedeute stets den größeren Anteil, mit gleichem Ganzen widerlegen.",
], [
  "Nur zwei gleichnamige Brüche vergleichen; die Umformung entfällt.",
  "Nur die beiden Zähler bei gleichem vorgegebenem Nenner vergleichen.",
  "Nur zwei kleine Anzahlen gleich großer Teile zählen und die größere Anzahl nennen.",
], "fraction-board");
define("fractionComplement fractionComplementInverse fractionAdd fractionSubtract unlikeAdd unlikeSubtract", [
  "Die Teilgröße und die bei gleichem Nenner betroffenen Teilanzahlen nennen.",
  "Die im Ziel gefragte Ergänzung, Addition oder Subtraktion mit passendem gemeinsamem Teilmaß ausführen.",
  "Das gemeinsame Teilmaß begründen und Ergebnis sowie Größenordnung an einem konstanten Ganzen erklären.",
  "Eine Operation mit fälschlich verändertem Nenner durch die Bedeutung der gleich großen Teile korrigieren.",
], [
  "Nur die entsprechende gleichnamige Rechnung mit bereits gegebenem Teilmaß lösen; Nennerwahl entfällt.",
  "Nur die natürliche Zähleraddition oder Zählersubtraktion bei angegebenem Nenner berechnen.",
  "Nur eine kleine natürliche Addition oder Ergänzung an zwei Teilmengen lösen; dann zur Zählerrechnung zurückkehren.",
], "fraction-board");
define("decimalPlace decimalFraction percentHundred percentConvert", [
  "Die benannte Zehntel- oder Hundertstelstelle beziehungsweise den Hundertstelanteil ablesen.",
  "Die im Ziel benannten Bruch-, Dezimal- oder Prozentdarstellungen wertgleich zuordnen.",
  "Die Wertgleichheit über Stellenwert und gemeinsames Ganzes erklären; Prozent nur als Hundertstelanteil.",
  "Eine verschobene Nachkommastelle oder verwechselte Prozent-Bezugsgröße mit einer korrekten Darstellung widerlegen.",
], [
  "Nur eine gegebene Hundertstel- oder Zehntelangabe einer zweiten Darstellung zuordnen; Umformungskette entfällt.",
  "Nur die Anzahl der markierten Hundertstel beziehungsweise Zehntel bei festem Ganzen zählen.",
  "Nur ein Hundertstel beziehungsweise Zehntel in der vorgegebenen Unterteilung zeigen.",
], "fraction-board");
define("fractionTimesMeaning fractionTimes fractionProductMeaning fractionProduct fractionDivideMeaning fractionDivide", [
  "Den Ausgangsanteil und die natürliche Schrittzahl oder den zweiten Anteil getrennt benennen.",
  "Die konkret benannte Vervielfachung, Anteil-von-Anteil-Handlung oder Teilung durch eine natürliche Zahl ausführen.",
  "Die Rechnung am unveränderten Ganzen erklären und die Größenordnung des Ergebnisses prüfen.",
  "Einen unpassenden Produkt- oder Teilungswert mit Rückprüfung und Bedeutungsbezug widerlegen; keine Bruchdivision neu einführen.",
], [
  "Nur den Anteil einer bereits vorgegebenen Teilmenge beziehungsweise zwei gleiche Anteile bestimmen; Operationskoordination entfällt.",
  "Nur eine benötigte natürliche Teilrechnung mit gegebenen Faktoren oder Gruppen lösen.",
  "Nur die Elemente einer kleinen gleich großen Gruppe zählen; dann die natürliche Teilrechnung erneut lösen.",
], "fraction-board");
define("fractionError fractionEqualityCheck", [
  "Die konkrete behauptete Gleichheit und ihre linke sowie rechte Seite benennen.",
  "Beide Seiten mit korrektem Teilmaß oder wertgleicher Umformung prüfen.",
  "Den verletzten Zusammenhang von Zähler, Nenner und Anteil mit einem eigenen Argument erklären.",
  "Ein tragfähiges Gegenbeispiel oder eine allgemeine Begründung geben und bloße Ergebnisbehauptung davon unterscheiden.",
], [
  "Nur eine Seite der Behauptung mit bereits festgelegtem korrektem Schritt berechnen.",
  "Nur die benötigte Zähler-Grundrechnung bei vorgegebenem Nenner lösen.",
  "Nur zwei kleine Anzahlen gleich großer Teile vergleichen; anschließend die Zählerrechnung aufnehmen.",
]);
define("solids nets netFold surfacePairs surface volumeLayer volume volumeComposite", [
  "Eine markierte Fläche, Kante oder vollständige Würfelschicht einer sichtbaren Körperdarstellung identifizieren.",
  "Die im Ziel benannten Körpermerkmale, Flächenpaare, Netzbeziehungen oder Schichten bestimmen.",
  "Netz und Körper beziehungsweise einzelne Fläche und gesamten Raum mit ihren Maßen begründet verbinden.",
  "Eine Doppelzählung, Überlappung oder Verwechslung von Oberfläche und Volumen an derselben Darstellung korrigieren.",
], [
  "Nur eine bereits markierte Rechteckfläche oder eine vollständige Würfelschicht auswerten; Gesamtberechnung entfällt.",
  "Nur eine Reihe von Einheitsquadraten oder Würfeln zählen; weitere Reihen und Schichten ausblenden.",
  "Nur eine einzelne Fläche oder einen einzelnen Einheitswürfel zeigen und seine Bedeutung nennen.",
], "none", "visual", "Beschriftetes geometrisch korrektes Körperbild mit zugeordnetem Netz oder transparenten Einheitswürfelschichten; verdeckte Elemente müssen aus vollständigen Schichten erschließbar sein, Faltbarkeit nicht nur behaupten.");
define("listenDetail listenSequence listenGap listenQuestion listenResponse", [
  "Nach einem kurzen tatsächlich gehörten Abschnitt eine ausdrücklich genannte Information sichern.",
  "Die gefragte Hörinformation, Reihenfolge oder inhaltlich passende Nachfrage ohne sichtbaren Transkripttext formulieren.",
  "Mehrere gehörte Informationen verbinden und Hauptsache, Nebensache oder unklare Stelle begründet unterscheiden.",
  "Eine unpassende Zusammenfassung oder Rückmeldung mit dem erneut gehörten Zusammenhang berichtigen.",
], [
  "Nur eine Information aus einem kürzeren erneut abgespielten Abschnitt sichern; Zusammenfassung und Verbindung entfallen.",
  "Nur nach einer ausdrücklich genannten Figur oder Handlung fragen; ein einzelner Satz wird erneut abgespielt.",
  "Nur ein vertrautes Schlüsselwort in einer kurzen echten Audioäußerung identifizieren; danach zum Satz zurückkehren.",
], "none", "listen", "Tatsächliches geprüftes Audio, neutrale Frage ohne Lösungsverrat; kein sichtbares Transkript, keine Untertitel als Hörnachweis.");
define("listenVoice", [
  "Eine tatsächlich hörbare Eigenschaft einer kurzen Sprechfassung benennen.",
  "Zwei gehörte Fassungen bezüglich Tempo, Lautstärke oder Tonhöhe unterscheiden.",
  "Die hörbare Veränderung mit einer im Kontext plausiblen Rollenwirkung verbinden.",
  "Eine behauptete Wirkung mit einem konkreten Hörmerkmal begründen oder als nicht belegbar einschränken.",
], [
  "Nur eine hörbare Eigenschaft in zwei sehr kurzen Fassungen vergleichen; Wirkungsdeutung entfällt.",
  "Nur schneller oder langsamer beziehungsweise lauter oder leiser anhand eines Merkmals unterscheiden.",
  "Nur eine einzelne kurze Sprechfassung tatsächlich anhören und die hörbare Stimme identifizieren.",
], "none", "listen", "Zwei echte Audiofassungen mit tatsächlich unterschiedlichem Tempo, Lautstärke oder Tonhöhe, kein bloß gleiches TTS mit verschiedenen Etiketten.");
define("oralPlan oralReportPlan rolePlan oralResponsePlan learningReflection handwritingPlan readingPlan", [
  "Einen für den Sprech-, Schrift- oder Vorleseanlass relevanten Stichpunkt oder ein benanntes Kriterium auswählen.",
  "Die im Ziel verlangte Vorbereitung am kurzen Text, Stichwortzettel oder fiktiven Beitrag ausführen.",
  "Die Auswahl oder Reihenfolge am konkreten Inhalt und vorgesehenen Publikum begründen.",
  "Einen unpassenden Vorbereitungsplan anhand des vereinbarten Inhalts- oder Wirkungskriteriums überarbeiten.",
], [
  "Nur einen bereits benannten Stichpunkt oder eine Textstelle dem gegebenen Kriterium zuordnen; vollständigen Plan weglassen.",
  "Nur zwischen zwei konkreten Varianten für ein einzelnes Kriterium wählen.",
  "Nur benennen, worum es in dem einen Satz beziehungsweise Stichpunkt geht; dann das Kriterium erneut anwenden.",
], "text-workbench");
define("speechStory speechPresentation speechConversation speechRole speechReport speechLearning speechVoice speechRead observeGesture handwriting", [
  "Eine einzelne tatsächliche Sprech-, Beobachtungs- oder Schreibhandlung mit einem vereinbarten Merkmal ausführen.",
  "Die im Ziel genannte kurze reale Handlung unter passenden Beobachtungsbedingungen durchführen.",
  "Die Handlung auf einen neuen Inhalt oder Gesprächsbeitrag beziehen und ihre Wirkung an einer konkreten Beobachtung reflektieren.",
  "Eine eigene oder fremde Ausführung mit den vereinbarten Kriterien vergleichen und eine erneute reale Ausführung gezielt verbessern.",
], [
  "Nur einen Satz, einen Gesprächsanschluss, eine Geste oder eine Schriftzeile unter Beobachtung bearbeiten; Gesamtdarbietung entfällt.",
  "Nur ein einzelnes Wort, ein Ausdrucksmittel oder einen Buchstaben anhand eines konkreten Modells erproben.",
  "Nur das vereinbarte beobachtbare Merkmal am Modell zeigen oder nachmachen; danach zur Einzelhandlung zurückkehren.",
], "none", "speak");
define("textEvidence textSummary", [
  "Eine ausdrücklich genannte Information eines kurzen Absatzes zur vorgegebenen Leitfrage finden.",
  "Die gefragte Antwort mit einer tatsächlich passenden Stelle aus dem verfügbaren Text verbinden.",
  "Wesentliche Informationen mehrerer Sätze in eigenen Worten mit präzisem Textbezug zusammenführen.",
  "Eine zwar wahre, aber als Beleg unpassende Stelle erkennen und die Belegbeziehung korrigieren.",
], [
  "Nur die passende von zwei kurzen Textstellen zur bereits formulierten Aussage auswählen; eigene Zusammenfassung entfällt.",
  "Nur eine ausdrücklich genannte Information aus einem einzelnen Satz entnehmen.",
  "Nur das im Satz gesuchte vertraute Schlüsselwort identifizieren; danach die Satzinformation erneut erfragen.",
], "text-workbench");
define("prediction textFunction textPattern genre", [
  "Ein sichtbares Textsignal wie Überschrift, Anrede, Verszeile oder Aufforderungswort identifizieren.",
  "Die gefragte Erwartung, Textfunktion oder Textform anhand vorhandener Merkmale bestimmen.",
  "Aufbau und Sprachmittel mit dem Textzweck verbinden und die Deutung an Stellen belegen.",
  "Eine nur von einem Schlagwort abgeleitete falsche Einordnung mit dem tatsächlichen Gesamtzusammenhang korrigieren.",
], [
  "Nur ein bereits genanntes Textmerkmal an einem kurzen Beispiel finden; Gesamtzuordnung entfällt.",
  "Nur zwei kurze Sätze hinsichtlich eines konkreten Merkmals vergleichen.",
  "Nur ein ausdrücklich gesuchtes Signalwort oder eine sichtbare Textzeile zeigen; anschließend das Merkmal prüfen.",
], "text-workbench");
define("storySequence literaryReason literaryEvidence literaryTheme narrator", [
  "Eine konkrete Figurenhandlung, Äußerung oder Erzählerstelle aus einem kurzen literarischen Text sichern.",
  "Die im Ziel verlangte Handlungsbeziehung, Eigenschaft, Absicht, Themenaussage oder Perspektive mit Textbezug formulieren.",
  "Mehrere Textinformationen für eine nachvollziehbare Deutung verbinden und eine alternative textgestützte Lesart zulassen.",
  "Eine unbelegte Deutungsbehauptung von einer möglichen textgestützten Erklärung unterscheiden und begrenzt korrigieren.",
], [
  "Nur eine ausdrücklich beschriebene Handlung oder Äußerung wiedergeben; Deutung und Motivverbindung entfallen.",
  "Nur die handelnde oder sprechende Figur in einem einzelnen Satz bestimmen.",
  "Nur den Namen oder das eindeutige Bezugswort der Figur zeigen; danach die Handlung erneut betrachten.",
], "text-workbench");
define("vocabulary idiom morphology", [
  "Ein bedeutungstragendes Wort, einen Wortbaustein oder einen Kontexthinweis identifizieren.",
  "Die gefragte Bedeutung mit dem Satzkontext oder den erkennbaren Wortbausteinen erschließen.",
  "Eine eigene sinngemäße Umschreibung beziehungsweise ein passendes Beispiel bilden und im Kontext prüfen.",
  "Eine nur wörtliche oder unpassende Deutung durch Ersatzprobe und Textzusammenhang widerlegen.",
], [
  "Nur zwischen zwei alltagssprachlichen Bedeutungen im gegebenen Satz wählen; eigene Erklärung entfällt.",
  "Nur einen direkt benachbarten erklärenden Kontexthinweis oder bekannten Wortstamm zuordnen.",
  "Nur ein für den Satz notwendiges vertrautes Grundwort klären; dann den Kontexthinweis wieder aufnehmen.",
], "text-workbench");
define("source mediaIntent mediaVisual mediaResponsibility", [
  "Eine konkrete Information, Urheberangabe, Absicht oder problematische Mitteilung im fiktiven Beispiel benennen.",
  "Die im Ziel verlangte Quellenwahl, Absichtserkennung oder verantwortliche Reaktion mit einem konkreten Merkmal begründen.",
  "Zwei Informations- oder Gestaltungsmöglichkeiten bezüglich Leitfrage, Publikum und beabsichtigter Wirkung vergleichen.",
  "Eine unzureichend belegte Medienentscheidung unter Berücksichtigung von Aktualität, Respekt oder Persönlichkeitsrechten verbessern.",
], [
  "Nur ein vorgegebenes Kriterium an einer kurzen Quelle oder Mitteilung prüfen; Mehrkriterienvergleich entfällt.",
  "Nur die relevante Angabe oder Formulierung aus zwei Stellen auswählen.",
  "Nur den ausdrücklich benannten Empfänger, Urheber oder Gegenstand einer einzelnen Aussage nennen.",
]);
define("layout textImage", [
  "Einen Themenwechsel oder die gemeinsame Information eines Textabschnitts und Bildes erkennen.",
  "Absätze, Überschrift oder Bildbeschriftung passend zum ausdrücklich genannten Textzweck zuordnen.",
  "Die Gliederung oder Bildauswahl am Informationsbeitrag und der Lesbarkeit begründen.",
  "Ein irreführendes Bild oder eine unverständliche Absatzgrenze anhand des Textinhalts berichtigen.",
], [
  "Nur eine Absatzgrenze oder eine einzelne Bildbeschriftung aus zwei Varianten wählen.",
  "Nur die gemeinsame Information zweier kurzer benachbarter Sätze benennen.",
  "Nur das Thema eines einzelnen kurzen Satzes nennen; dann die Satzverbindung erneut prüfen.",
], "none", "visual", "Sichtbar gestalteter kurzer Text mit echten Absätzen beziehungsweise tatsächlich gezeigtes passendes Bild; reines Beschreiben eines fehlenden Layouts genügt nicht.");
define("writingPlan narrative procedure report", [
  "Einen relevanten Ereignis-, Handlungs- oder W-Fragen-Stichpunkt zum Schreibanlass auswählen.",
  "Den im Ziel begrenzten Plan, kurzen Abschnitt oder Vorgang mit verständlicher Reihenfolge schreiben.",
  "Den Abschnitt mit passenden Zeitverbindungen, Verben oder sachlichen Details für den Schreibzweck ausgestalten.",
  "Eine unklare Reihenfolge, unpassende Ausschmückung oder fehlende Kerninformation an der eigenen Fassung überarbeiten.",
], [
  "Nur einen bereits ausgewählten Stichpunkt als klaren Satz formulieren; vollständigen Text oder Plan weglassen.",
  "Nur zwei vorgegebene Handlungsschritte ordnen oder das passende Tätigkeitswort wählen.",
  "Nur die Handlung eines einzigen kurzen Satzes benennen; danach die Zweischrittfolge erneut betrachten.",
], "text-workbench");
define("feedback revision", [
  "Ein vorgegebenes Prüfkriterium und die konkret betroffene Textstelle zuordnen.",
  "Eine respektvolle Rückmeldung oder gezielte Überarbeitung zu genau diesem Kriterium formulieren.",
  "Die Änderung mit Vorher-Nachher-Bezug hinsichtlich Verständlichkeit und Schreibzweck begründen.",
  "Zwischen mehreren Änderungsvorschlägen den kriteriengerechten wählen und eine bloße Geschmacksänderung abgrenzen.",
], [
  "Nur die zum vorgegebenen Kriterium passende von zwei Textstellen wählen; eigenes Feedback entfällt.",
  "Nur eine bereits markierte Stelle zwischen zwei konkreten Fassungen vergleichen.",
  "Nur die Bedeutung eines einzelnen Satzes klären; danach das eine Kriterium wieder anwenden.",
], "text-workbench");
define("argument message register", [
  "Position, Grund, Empfänger oder Kommunikationssituation in einem kurzen Beispiel bestimmen.",
  "Den gefragten kurzen Beitrag mit passender Begründung oder adressatengerechter Formulierung schreiben.",
  "Die Formulierung auf eine andere Situation übertragen und ihren Bezug zu Grund oder Empfänger erklären.",
  "Eine unbegründete Behauptung, unpassende Anrede oder abwertende Ausdruckswahl konkret verbessern.",
], [
  "Nur einen vorgegebenen Grund oder eine Anrede einer klar benannten Situation zuordnen.",
  "Nur zwischen zwei kurzen Formulierungen zu einem einzigen passenden Kriterium wählen.",
  "Nur Empfänger oder Anliegen in einem einzelnen Satz nennen; danach die Formulierung erneut wählen.",
], "text-workbench");
define("wordClass sentencePart clause connective case tense pastPerfect future", [
  "Die gesuchte Wortform, zusammengehörige Wortgruppe oder finite Verbform in einem kurzen Satz identifizieren.",
  "Die im Ziel gefragte grammatische Probe, Zuordnung oder Formbildung an einem eindeutigen Kontext ausführen.",
  "Die Veränderung mit Umstell-, Ersatz- oder Formprobe erklären und die Bedeutung im Satz erhalten.",
  "Eine formal plausible, im Kontext falsche Bestimmung oder Form mit der passenden Probe berichtigen.",
], [
  "Nur eine bereits eingegrenzte Wortgruppe oder Form mit einer vorgegebenen Probe verändern.",
  "Nur zwei kurze Beispielsätze hinsichtlich des einen gesuchten Signals vergleichen.",
  "Nur das benötigte bekannte Grundwort oder die Handlung des Satzes bestimmen; dann zur Probe zurückkehren.",
], "text-workbench");
define("spellingExtend spellingDerive spellingSyllable spellingChoose dictionary capital punctuation clauseComma directSpeech", [
  "Die fragliche Wortstelle, den nominalen Kern oder eine relevante Satzgrenze identifizieren.",
  "Die im Ziel benannte Rechtschreibstrategie, Wörterbuchsuche oder Zeichensetzungsregel am klaren Beispiel anwenden.",
  "Die Schreibung oder Zeichensetzung mit Prüfwort, Satzstruktur beziehungsweise passendem Wörterbucheintrag begründen.",
  "Eine ungeeignete Strategie oder falsche Grenzziehung am Kontext erläutern und gezielt korrigieren.",
], [
  "Nur eine markierte Zweifelsstelle mit bereits vorgegebener Strategie oder Satzgrenze prüfen.",
  "Nur das passende von zwei Prüfwörtern, Begleitern oder Grenzsignalen auswählen.",
  "Nur das bekannte Grundwort beziehungsweise die finite Handlung im einzelnen Satz finden; dann das Prüfsignal erneut wählen.",
], "text-workbench");

// Curated concept relations, independent of the order of topics in the file.
// These are navigation/probe suggestions, never a lock or a transfer of evidence.
const links = new Map();
function link(child, predecessors, reason) {
  links.set(child, predecessors.split(" ").map((key) => ({key, reason})));
}
link("math:5:stellenwerte-lesen:k2", "math:5:stellenwerte-lesen:k1", "Zahlübertragungen benötigen die Bedeutung einer einzelnen besetzten Stelle.");
link("math:5:zahlen-vergleichen-und-runden:k1", "math:5:stellenwerte-lesen:k1", "Stellenweiser Vergleich beruht auf dem Wert der ersten unterschiedlichen Stelle.");
link("math:5:zahlen-vergleichen-und-runden:k2", "math:5:stellenwerte-lesen:k1", "Die Rundungsstelle muss als Stellenwert und nicht als bloße Ziffer verstanden werden.");
link("math:5:reihenfolge-und-rechenvorteile:k1", "math:5:grundrechenarten-sicher-anwenden:k1 math:5:grundrechenarten-sicher-anwenden:k3", "Die Koordination der Reihenfolge setzt die einzelnen beteiligten Operationen voraus.");
link("math:5:rechenmodell-und-gegenprobe:k2", "math:5:rechenmodell-und-gegenprobe:k1", "Eine Gegenprobe kontrolliert ein bereits sachgerecht gewähltes Rechenmodell.");
link("math:5:ganze-zahlen-ordnen:k2", "math:5:ganze-zahlen-ordnen:k1", "Vergleichen negativer Zustände benötigt deren gerichtete Lage zum Nullpunkt.");
link("math:5:zustandsaenderungen-beschreiben:k2", "math:5:zustandsaenderungen-beschreiben:k1 math:5:ganze-zahlen-ordnen:k1", "Endzustände verbinden den Ausgangswert mit einer vorher geklärten gerichteten Änderung.");
link("math:5:punkte-und-linien-bestimmen:k2", "math:5:punkte-und-linien-bestimmen:k1", "Das Setzen eines Punktes nutzt die bereits geklärte Achsenreihenfolge.");
link("math:5:winkel-messen-und-zeichnen:k2", "math:5:winkel-messen-und-zeichnen:k1", "Das Setzen eines Winkels braucht Nullrichtung und Bedeutung der Gradskala.");
link("math:5:umfang-bestimmen:k2", "math:5:umfang-bestimmen:k1", "Eine fehlende Randlänge wird aus dem Zusammenhang der gesamten Randsumme erschlossen.");
link("math:5:rechteckflaechen-verstehen:k2", "math:5:rechteckflaechen-verstehen:k1 math:5:grundrechenarten-sicher-anwenden:k3", "Länge mal Breite fasst das Zählen gleich großer Quadrat-Reihen multiplikativ zusammen.");
link("math:5:zusammengesetzte-rechteckflaechen:k1", "math:5:rechteckflaechen-verstehen:k2", "Zusammengesetzte Flächen werden aus bereits verstandenen Rechteckflächen aufgebaut.");
link("math:5:zusammengesetzte-rechteckflaechen:k2", "math:5:rechteckflaechen-verstehen:k1", "Quadratische Einheiten entstehen durch die Flächenunterteilung in Einheitsquadrate.");
link("math:5:alltagsgroessen-abschaetzen:k2", "math:5:alltagsgroessen-abschaetzen:k1", "Ein begründetes Intervall benötigt eine zur Größenart passende Bezugsgröße.");
link("math:5:groessen-umrechnen:k3", "math:5:groessen-umrechnen:k1 math:5:zahlen-vergleichen-und-runden:k2", "Sinnvolles Runden nach Einheitenwechsel verbindet Wertgleichheit mit Rundungsgenauigkeit.");
link("math:5:diagramme-lesen:k2", "math:5:diagramme-lesen:k1", "Eine Datenaussage stützt sich auf korrekt unter Beachtung der Skala abgelesene Werte.");
link("math:5:unbekannte-durch-umkehren-finden:k2", "math:5:rechteckflaechen-verstehen:k2 math:5:unbekannte-durch-umkehren-finden:k1", "Die inverse Rechteckformel verbindet Flächenbedeutung mit der Umkehrung der Multiplikation.");
link("math:6:B01:k2", "math:6:B01:k1", "Gleich große Bruchteile beziehen sich immer auf dasselbe eindeutig festgelegte Ganze.");
link("math:6:B02:k1", "math:6:B01:k2", "Zähler und Nenner bezeichnen Anzahlen gleich großer Teile eines Ganzen.");
link("math:6:B02:k2", "math:6:B02:k1", "Die Darstellung eines vorgegebenen Bruchs benötigt die getrennte Bedeutung von Zähler und Nenner.");
link("math:6:B03:k1", "math:6:B02:k2", "Brüche über eins wiederholen dieselbe Teilgröße an mehreren gleich großen Ganzen.");
link("math:6:B03:k2", "math:6:B03:k1", "Gemischte Schreibweise bündelt gezählte Bruchteile in ganze Einheiten und einen Rest.");
link("math:6:B04:k1", "math:6:B01:k2", "Skalenabstände werden als gleich große Teile einer festgelegten Einheit gelesen.");
link("math:6:B04:k2", "math:6:B04:k1 math:6:B02:k1", "Das Verorten verbindet den Skalenabstand mit der Anzahl der im Bruch benannten Teile.");
link("math:6:B05:k1", "math:6:B01:k1 math:5:grundrechenarten-sicher-anwenden:k4", "Ein Einheitsbruch einer Menge entsteht durch gleichmäßige Division der festgelegten Gesamtmenge.");
link("math:6:B05:k2", "math:6:B05:k1 math:5:grundrechenarten-sicher-anwenden:k3", "Mehrere Bruchteile vervielfachen die zuvor bestimmte Größe eines Einheitsbruchs.");
link("math:6:B06:k1", "math:6:B02:k1 math:5:grundrechenarten-sicher-anwenden:k4", "Der Quotient als Bruch verbindet die gleichmäßige Verteilung mit Zähler und Nenner.");
link("math:6:B06:k2", "math:6:B06:k1 math:6:B03:k2", "Ganze Verteilungsanteile und Restbruchteile benötigen die gemischte Schreibweise.");
link("math:6:B07:k1", "math:6:B02:k1 math:5:grundrechenarten-sicher-anwenden:k3", "Erweitern vervielfacht beide Teilanzahlen mit demselben natürlichen Faktor.");
link("math:6:B07:k2", "math:6:B01:k2 math:6:B02:k2", "Wertgleichheit wird durch feinere gleiche Teile am unveränderten Ganzen begründet.");
link("math:6:B07:k3", "math:6:B07:k1 math:5:grundrechenarten-sicher-anwenden:k4", "Der Zielnenner bestimmt den Faktor durch Division; danach wird korrekt erweitert.");
link("math:6:B08:k1", "math:6:B02:k1 math:5:grundrechenarten-sicher-anwenden:k4", "Kürzen bündelt Teilstücke durch gemeinsames Teilen von Zähler und Nenner.");
link("math:6:B08:k2", "math:6:B08:k1", "Die freie Teilerwahl ergänzt das Kürzverfahren um eine Teilbarkeitsentscheidung.");
link("math:6:B09:k1", "math:6:B02:k1", "Vergleichen bei gleichem Teilmaß setzt das Verständnis der Teilanzahl voraus.");
link("math:6:B09:k2", "math:6:B09:k1 math:6:B07:k1", "Verschiedene Teilmaße lassen sich nach wertgleicher Erweiterung wie gleichnamige vergleichen.");
link("math:6:B10:k1", "math:6:B02:k1", "Ergänzen zum Ganzen nutzt die gesamte Anzahl gleich großer Teile des Nenners.");
link("math:6:B10:k2", "math:6:B10:k1", "Die inverse Ergänzungsfrage verwendet denselben Teil-und-Rest-Zusammenhang.");
link("math:6:B16:k1", "math:6:B02:k1 math:5:stellenwerte-lesen:k1", "Dezimalschreibweise verbindet Bruchteile einer Zehnereinheit mit der Stellenwertidee.");
link("math:6:B16:k2", "math:6:B16:k1", "Die Rückübertragung nutzt die bereits geklärte Bedeutung jeder Nachkommastelle.");
link("math:6:B17:k1", "math:6:B02:k1", "Prozent bezeichnet die Anzahl von Hundertsteln eines festgelegten Ganzen.");
link("math:6:B17:k2", "math:6:B17:k1 math:6:B16:k1 math:6:B07:k1", "Der Darstellungswechsel verbindet Hundertstel, Stellenwert und wertgleiche Erweiterung.");
link("math:6:B11:k1", "math:6:B02:k1", "Gleichnamige Addition zählt Teile desselben Teilmaßes zusammen.");
link("math:6:B11:k2", "math:6:B02:k1", "Gleichnamige Subtraktion entfernt Teile desselben Teilmaßes; Addition belegt sie nicht automatisch.");
link("math:6:B12:k1", "math:6:B07:k1 math:6:B07:k3", "Ein gemeinsames Teilmaß erfordert wertgleiches Erweitern auf selbst bestimmte passende Nenner.");
link("math:6:B12:k2", "math:6:B12:k1 math:6:B11:k1", "Ungleichnamige Addition verbindet die Teilmaßwahl mit der gleichnamigen Addition.");
link("math:6:B12:k3", "math:6:B12:k1 math:6:B11:k2", "Ungleichnamige Subtraktion verbindet die Teilmaßwahl mit gesondert geübter Subtraktion.");
link("math:6:B13:k1", "math:6:B11:k1", "Eine natürliche Vervielfachung lässt sich als wiederholte Addition gleicher Brüche deuten.");
link("math:6:B13:k2", "math:6:B13:k1", "Die symbolische Produktregel fasst die bereits gedeutete wiederholte Addition zusammen.");
link("math:6:B14:k1", "math:6:B02:k2 math:6:B05:k2", "Ein Anteil von einem Anteil benötigt den Bezug des zweiten Anteils auf eine bereits ausgewählte Teilmenge.");
link("math:6:B14:k2", "math:6:B14:k1 math:5:grundrechenarten-sicher-anwenden:k3", "Die Produktrechnung formalisiert die zuvor dargestellte Anteil-von-Anteil-Handlung.");
link("math:6:B15:k1", "math:6:B02:k2 math:6:B06:k1", "Das Teilen eines Bruchanteils nutzt gleichmäßige Verteilung bei konstantem Ganzen.");
link("math:6:B15:k2", "math:6:B15:k1 math:6:B13:k2", "Die Division durch natürliche Zahlen wird durch die passende Vervielfachung rückgeprüft.");
link("math:6:B18:k1", "math:6:B11:k1 math:5:reihenfolge-und-rechenvorteile:k1", "Ein Bruchterm benötigt das einzelne Rechenverfahren und das Klammerverständnis.");
link("math:6:B18:k2", "math:6:B18:k1 math:6:B13:k2", "Gemischte Rechenreihenfolge koordiniert bereits verfügbare Bruchoperationen.");
link("math:6:B19:k1", "math:6:B05:k2", "Anteilsmodellierung benötigt einen geklärten Bezug zwischen Ganzem, Anteil und Teilmenge.");
link("math:6:B19:k2", "math:6:B19:k1", "Die Rückübersetzung und Plausibilitätskontrolle beziehen sich auf das vorher bestimmte Sachmodell.");
link("math:6:B20:k1", "math:6:B11:k1", "Die Fehlererklärung zur Addition nutzt die Bedeutung des gemeinsamen Teilmaßes.");
link("math:6:B20:k2", "math:6:B07:k2 math:6:B08:k1", "Eine Wertgleichheitsbehauptung wird anhand erhaltener Anteile beim Erweitern oder Kürzen geprüft.");
link("math:6:negative-bruchzahlen-einordnen:k1", "math:5:ganze-zahlen-ordnen:k1 math:6:B04:k1", "Negative Brüche verbinden die gerichtete Lage zu null mit Bruchskalenabständen.");
link("math:6:negative-bruchzahlen-einordnen:k2", "math:6:negative-bruchzahlen-einordnen:k1 math:6:B09:k2", "Die Ordnung negativer Brüche verbindet Zahlengeradenlage mit positiver Größenvergleichung.");
link("math:6:mit-rationalen-zustaenden-rechnen:k1", "math:6:negative-bruchzahlen-einordnen:k1 math:5:zustandsaenderungen-beschreiben:k1", "Rationale Bewegungen brauchen Startlage sowie die getrennte Bedeutung einer Änderung.");
link("math:6:mit-rationalen-zustaenden-rechnen:k2", "math:6:mit-rationalen-zustaenden-rechnen:k1", "Der berechnete Endwert formalisiert die zuvor dargestellte rationale Änderung.");
link("math:6:multiplikation-und-umkehrung-deuten:k1", "math:6:mit-rationalen-zustaenden-rechnen:k1", "Ein natürliches Vielfaches einer rationalen Änderung wiederholt denselben gerichteten Schritt.");
link("math:6:multiplikation-und-umkehrung-deuten:k2", "math:6:multiplikation-und-umkehrung-deuten:k1", "Die natürliche Teilung wird mit der vorher verstandenen Vervielfachung kontrolliert.");
link("math:6:vierecke-und-kreise-beschreiben:k1", "math:5:punkte-und-linien-bestimmen:k3", "Viereckklassen werden anhand paralleler und senkrechter Seitenbeziehungen unterschieden.");
link("math:6:koordinaten-in-vier-quadranten:k1", "math:5:punkte-und-linien-bestimmen:k1 math:6:negative-bruchzahlen-einordnen:k1", "Vier Quadranten verbinden die Achsenreihenfolge mit gerichteten negativen Koordinaten.");
link("math:6:koordinaten-in-vier-quadranten:k2", "math:6:koordinaten-in-vier-quadranten:k1", "Das Erzeugen einer Figur nutzt mehrfach die vorher geklärte Koordinatenzuordnung.");
link("math:6:koerper-und-netze-erkennen:k2", "math:6:koerper-und-netze-erkennen:k1", "Die Zuordnung von Netzflächen setzt Flächen und Kanten des Körpers als Merkmale voraus.");
link("math:6:koerper-und-netze-erkennen:k3", "math:6:koerper-und-netze-erkennen:k2", "Die Faltbarkeitsprüfung koordiniert bereits zugeordnete angrenzende und gegenüberliegende Flächen.");
link("math:6:quaderoberflaechen-berechnen:k1", "math:6:koerper-und-netze-erkennen:k2", "Flächenpaare werden über die Zuordnung zwischen Quader und Netz erschlossen.");
link("math:6:quaderoberflaechen-berechnen:k2", "math:6:quaderoberflaechen-berechnen:k1 math:5:rechteckflaechen-verstehen:k2", "Die Oberfläche summiert die bereits identifizierten Paare berechneter Rechteckflächen.");
link("math:6:volumen-mit-einheitswuerfeln:k1", "math:5:rechteckflaechen-verstehen:k1", "Eine vollständige Würfelschicht besitzt eine rechteckige Reihenstruktur.");
link("math:6:volumen-mit-einheitswuerfeln:k2", "math:6:volumen-mit-einheitswuerfeln:k1 math:5:grundrechenarten-sicher-anwenden:k3", "Volumen vervielfacht die Würfelzahl einer Schicht mit der Anzahl vollständiger Schichten.");
link("math:6:volumen-und-einheiten-anwenden:k1", "math:6:volumen-mit-einheitswuerfeln:k2", "Zusammengesetzte Körpervolumina bauen auf dem Schichtenmodell des Quaders auf.");
link("math:6:volumen-und-einheiten-anwenden:k2", "math:6:volumen-mit-einheitswuerfeln:k2", "Kubikeinheiten werden durch Unterteilung in drei Längsrichtungen begründet.");
link("math:6:daten-und-darstellungen-vergleichen:k1", "math:5:diagramme-lesen:k1 math:5:daten-sammeln-und-ordnen:k1", "Der Abgleich nutzt das Lesen von Diagrammskalen und absoluten Häufigkeiten in Tabellen.");
link("math:6:daten-und-darstellungen-vergleichen:k2", "math:6:daten-und-darstellungen-vergleichen:k1", "Kritische Vergleiche benötigen zunächst korrekt zugeordnete Daten und Bezugsrahmen.");
link("math:6:arithmetisches-mittel-verstehen:k1", "math:5:daten-sammeln-und-ordnen:k1 math:5:grundrechenarten-sicher-anwenden:k4", "Der Mittelwert verteilt die Datensumme gleichmäßig auf die tatsächliche Anzahl der Werte.");
link("math:6:arithmetisches-mittel-verstehen:k2", "math:6:arithmetisches-mittel-verstehen:k1", "Die Kontextdeutung bezieht sich auf den bereits bestimmten rechnerischen Ausgleichswert.");
link("math:6:volumenformeln-umkehren:k1", "math:6:volumen-mit-einheitswuerfeln:k2 math:5:unbekannte-durch-umkehren-finden:k1", "Der fehlende Quaderfaktor verbindet die Bedeutung der Volumenformel mit der Umkehroperation.");
link("math:6:volumenformeln-umkehren:k2", "math:6:volumenformeln-umkehren:k1", "Die Einsetzprobe überprüft einen zuvor bestimmten oder vorgeschlagenen fehlenden Faktor.");

// German relations connect only specific text, language and planning actions.
link("german:5:schluesselstellen-finden:k2", "german:5:schluesselstellen-finden:k1", "Das Bündeln wichtiger Informationen setzt ihre gezielte Auffindung zur Leitfrage voraus.");
link("german:5:leseerwartung-pruefen:k2", "german:5:leseerwartung-pruefen:k1 german:5:schluesselstellen-finden:k1", "Das Prüfen einer Erwartung verbindet die zuvor formulierte Vermutung mit einem passenden Textbeleg.");
link("german:5:handlung-nachvollziehen:k2", "german:5:handlung-nachvollziehen:k1", "Ursächliche Handlungsbeziehungen beziehen sich auf eine geklärte Ereignisfolge.");
link("german:5:figuren-und-textformen-deuten:k1", "german:5:schluesselstellen-finden:k1", "Figurenmerkmale müssen an einer tatsächlich passenden Handlung oder Äußerung belegt werden.");
link("german:5:sachinformationen-entnehmen:k2", "german:5:sachinformationen-entnehmen:k1", "Eine belegte Antwort verbindet eine bereits gefundene Sachinformation mit der Leitfrage.");
link("german:5:schreibideen-ordnen:k2", "german:5:schreibideen-ordnen:k1", "Ein Schreibplan ordnet zuvor zum Schreibanlass ausgewählte Ideen.");
link("german:5:erzaehlung-ausgestalten:k1", "german:5:schreibideen-ordnen:k2", "Die Formulierung eines Handlungsschritts folgt einer geklärten Planposition.");
link("german:5:rueckmeldung-geben:k2", "german:5:rueckmeldung-geben:k1", "Umsetzbares Feedback bezieht sich auf eine konkrete kriterienbezogen geprüfte Stelle.");
link("german:5:text-gezielt-verbessern:k2", "german:5:text-gezielt-verbessern:k1", "Eine gezielte Revision verändert die zuvor anhand eines Kriteriums gefundene Stelle.");
link("german:5:fachsprache-klaeren:k2", "german:5:fachsprache-klaeren:k1", "Ein neuer Beispielsatz verwendet die zuvor geklärte fachliche Bedeutung.");
link("german:5:sprachbilder-verstehen:k2", "german:5:sprachbilder-verstehen:k1", "Eine sinngemäße Umschreibung setzt die Trennung von wörtlicher und übertragener Bedeutung voraus.");
link("german:5:satzglieder-und-satzbau:k2", "german:5:satzglieder-und-satzbau:k1", "Die Funktionsbestimmung bezieht sich auf als Einheit erkannte Wortgruppen.");
link("german:5:sachlich-beschreiben:k2", "german:5:sachlich-beschreiben:k1", "Eine verständliche Vorgangsbeschreibung braucht eine sachgerechte Schrittfolge.");
link("german:6:hoerinhalte-zusammenfassen:k2", "german:6:hoerinhalte-zusammenfassen:k1", "Die geordnete Hörzusammenfassung bündelt die von Details unterschiedenen Hauptinformationen.");
link("german:6:textaussagen-belegen:k2", "german:6:textaussagen-belegen:k1 german:5:schluesselstellen-finden:k1", "Mehrabsatz-Belege benötigen die Unterscheidung von Aussage und ausdrücklich passender Belegstelle.");
link("german:6:woerter-im-kontext-klaeren:k2", "german:6:woerter-im-kontext-klaeren:k1", "Eine Ersatzprobe überprüft die vorher aus Kontexthinweisen erschlossene Bedeutung.");
link("german:6:figuren-mit-textbelegen-deuten:k1", "german:6:textaussagen-belegen:k1", "Eine Figureninterpretation nutzt ausdrücklich passende statt nur thematisch ähnliche Textbelege.");
link("german:6:figuren-mit-textbelegen-deuten:k2", "german:6:figuren-mit-textbelegen-deuten:k1", "Motive verbinden beobachtete Handlungen und Eigenschaften zu einer begründeten Absichtshypothese.");
link("german:6:sachtext-und-diagramm-verbinden:k2", "german:6:sachtext-und-diagramm-verbinden:k1 german:6:textaussagen-belegen:k1", "Die doppelt belegte Antwort verbindet einen korrekt zugeordneten Diagrammwert mit einer Textinformation.");
link("german:6:quellen-vergleichen:k2", "german:6:quellen-vergleichen:k1", "Eine begründete Quellenauswahl baut auf dem tatsächlich verglichenen Informationsgehalt auf.");
link("german:6:schreibplan-mit-w-fragen:k2", "german:6:schreibplan-mit-w-fragen:k1", "Ein geordneter Schreibplan bündelt nach W-Fragen geklärte Informationen und sichtbare Lücken.");
link("german:6:feedback-fuer-revision-nutzen:k2", "german:6:feedback-fuer-revision-nutzen:k1", "Die begründete Revision setzt einen aus Feedback abgeleiteten ausführbaren Änderungsauftrag voraus.");
link("german:6:zeitformen-funktional-nutzen:k2", "german:6:zeitformen-funktional-nutzen:k1", "Vorzeitigkeit wird relativ zu einem bereits geklärten vergangenen Geschehen ausgedrückt.");
link("german:6:satzverknuepfung-und-flexion:k1", "german:5:satzglieder-und-satzbau:k3", "Die funktionale Satzverknüpfung baut auf dem Erkennen von Haupt- und Nebensatz auf.");
link("german:6:zeichensetzung-erklaeren:k2", "german:5:satzglieder-und-satzbau:k3", "Das Komma an der Haupt-Nebensatz-Grenze benötigt die beiden finiten Verbstrukturen.");
link("german:6:informierend-berichten:k2", "german:6:informierend-berichten:k1", "Der sachliche Bericht verwendet die zuvor ausgewählten wesentlichen Ereignisinformationen.");
link("german:6:behauptung-und-begruendung:k2", "german:6:behauptung-und-begruendung:k1", "Ein eigenes Argument verbindet ausdrücklich unterschiedene Behauptung, Grund und Beispiel.");

function buildCompetencies(topics) {
  if (!Array.isArray(topics)) throw new TypeError("topics must be an array");
  const parents = topics.filter((t) => [5, 6].includes(t.grade) && t.track === "R" && ["math", "german"].includes(t.subject));
  const indexed = new Map();
  for (const p of parents) {
    const key = `${p.subject}:${p.grade}:${p.id.split(":").at(-1)}`;
    const definitions = content.definitions[key];
    if (!definitions) throw new Error(`Unmapped 5/6 source anchor: ${p.id}`);
    definitions.forEach((d, i) => indexed.set(`${key}:k${i + 1}`, {p, d, id: `${p.id}:k${i + 1}`}));
  }
  const competencies = [...indexed.entries()].map(([key, {p, d, id}]) => {
    const f = families[d.family];
    if (!f) throw new Error(`Missing didactic family: ${d.family}`);
    const human = /^(speech|observeGesture|handwriting$)/.test(d.family);
    const preparation = d.goal.startsWith("Als Vorbereitung");
    const delivery = ["handwriting", "observeGesture"].includes(d.family) ? "visual" : f.delivery;
    const assessmentScope = human ? "human-observation" : "digital";
    const dependencies = (links.get(key) || []).filter((x) => indexed.has(x.key));
    const prerequisiteRationales = Object.fromEntries(dependencies.map((x) => [indexed.get(x.key).id, x.reason]));
    let boundary = human ? "Erfordert tatsächliche menschliche Beobachtung der im Ziel genannten Handlung. Getippter Text, Transkription oder richtige Planung belegt weder mündliche Darbietung, Gestik, Gruppengespräch noch Handschrift. Keine automatische Bestätigung der Gesamthandlung." :
      preparation ? "Belegt ausschließlich die ausdrücklich benannte digitale Vorbereitung. Kein Nachweis für tatsächliches Sprechen, Vorlesen, Körpersprache, Gruppengespräch oder handschriftliche Ausführung; hierfür bleibt menschliche Beobachtung nötig." :
      delivery === "listen" ? "Hörverstehen ist nur mit tatsächlichem geprüftem Audio ohne sichtbares Transkript auswertbar. Eine Textfassung oder vorgelesene Lösung belegt das Hörziel nicht. Sprechqualität und Gestik sind nicht geprüft." :
      "Belegt ausschließlich die konkret bearbeitete digitale Zielhandlung unter dokumentierten Aufgaben- und Hilfebedingungen. Ein einzelner Treffer oder eine geholfene Lösung belegt keine dauerhafte Beherrschung des ganzen Lehrplanankers.";
    if (f.scene) boundary += ` Benötigte Darstellung: ${f.scene}`;
    const titlePrefix = `${d.title}: `;
    // A goal stays observable and separately assessable; levels alter cognitive
    // coordination, representation and justification, not only number magnitude.
    const learningPlan = {
      levels: f.levels.map((s) => titlePrefix + s),
      help: f.help.map((s) => titlePrefix + s),
      preferredTool: d.family === "volumeInverse" ? "none" : f.preferredTool,
    };
    return {
      id, parentTopicId: p.id, title: d.title, goal: d.goal,
      subject: p.subject, grade: p.grade, track: p.track, area: p.area,
      source: {...p.source}, prerequisites: dependencies.map((x) => indexed.get(x.key).id),
      prerequisiteRationales, prerequisiteRelation: "probe-and-navigation-never-lock-or-evidence-transfer",
      didacticFamily: d.family, delivery, assessmentScope, evidenceBoundary: boundary,
      learningPlan, modality: {listen: "audio", speak: "speaking", visual: "visual", text: "text"}[delivery],
      availability: human ? "requires_human_observation" : delivery === "listen" ? "requires_media_adapter" : delivery === "visual" ? "requires_visual_adapter" : "requires_task_validation",
      reviewStatus: p.reviewStatus || "inhaltliche_Pruefung_offen",
      guidance: `${d.goal} ${boundary} Nur den stockenden Schritt unterstützen; neue unabhängige Probe getrennt von Hilfe dokumentieren.`,
    };
  });
  const groups = {};
  for (const c of competencies) {
    const key = `${c.subject}:${c.grade}`;
    groups[key] ||= {parentCount: 0, competencyCount: 0, digital: 0, humanObservation: 0};
    groups[key].competencyCount++;
    groups[key][c.assessmentScope === "digital" ? "digital" : "humanObservation"]++;
  }
  for (const p of parents) groups[`${p.subject}:${p.grade}`].parentCount++;
  const coverage56 = {
    version: content.version, parentCount: parents.length, competencyCount: competencies.length,
    anchors: parents.map((p) => ({parentTopicId: p.id, source: {...p.source}, competencyIds: competencies.filter((c) => c.parentTopicId === p.id).map((c) => c.id)})),
    byContext: groups,
    sources: [...new Map(parents.map((p) => [p.source.id, {...p.source}])).values()],
    interpretation: "Vollständige Zuordnung der vorhandenen 5/6-Anker zu eigenen Übungszielen; keine amtliche Vollständigkeits-, Quellenfassungs-, Aufgabenqualitäts- oder Wirksamkeitsfreigabe.",
    sourceReviewStatus: "inherited-source-extraction-content-review-open",
    assessmentLimits: ["Keine historische Elternevidenz auf Kinder übertragen.", "Mündliche Darbietung, Gestik, Gruppenhandeln, Handschrift und physische Instrumente benötigen passende menschliche Beobachtung.", "Hören nur mit tatsächlichem Audio ohne Transkript; visuelle Ziele nur mit fachlich passender tatsächlicher Darstellung.", "Längere Schreibprodukte werden nur in begrenzten Teilhandlungen geübt; keine automatische Gesamtaufsatznote."],
  };
  return {version: content.version, competencies, coverage56};
}
module.exports = {buildCompetencies};
