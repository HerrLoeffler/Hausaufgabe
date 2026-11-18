'use strict';
const VERSION='dreisatz-20261118-v1';
const RUN='dreisatz60-20261118-v1';
const modes=[
  ['given','given','given','given'],
  ['factor','given','factor','given'],
  ['select','select','given','given'],
  ['free','free','free','free'],
  ['factor','select','free','given']
];
const direct=[
  ['Hefte','Preis (€)',4,6,10,'Hefte kosten alle gleich viel.'],
  ['Äpfel (kg)','Preis (€)',2,5,7,'Der Kilopreis ist konstant.'],
  ['Mehl (g)','Portionen',300,4,750,'Alle Portionen haben dieselbe Größe.'],
  ['Zeit (h)','Strecke (km)',2,12,5,'Ein Radfahrer fährt mit konstanter Geschwindigkeit.'],
  ['Kisten','Flaschen',3,18,8,'Jede Kiste enthält gleich viele Flaschen.'],
  ['Papierpakete','Blätter',5,2500,12,'Alle Papierpakete sind gleich groß.'],
  ['Stoff (m)','Preis (€)',2.5,20,7.5,'Der Stoff kostet je Meter gleich viel.'],
  ['Eintrittskarten','Preis (€)',6,45,14,'Alle Eintrittskarten haben denselben Preis.'],
  ['Wasser (l)','Saft (l)',4,1,10,'Das Mischungsverhältnis bleibt gleich.'],
  ['Kartenstrecke (cm)','Wirkliche Strecke (km)',2,5,6,'Die Karte verwendet einen einheitlichen Maßstab.'],
  ['Zeit (min)','Wasser (l)',3,24,8,'Der Hahn liefert gleichmäßig Wasser.'],
  ['Gläser','Inhalt (ml)',4,800,9,'Jedes Glas wird gleich hoch gefüllt.'],
  ['Schrauben','Masse (g)',8,20,24,'Die Schrauben sind gleich schwer.'],
  ['Reiswaffeln','Preis (€)',3,1.5,11,'Der Stückpreis bleibt gleich.'],
  ['Reis (g)','Portionen',200,2,700,'Die Portionen sind gleich groß.'],
  ['Zeit (h)','Energie (kWh)',2,1.2,5,'Das Gerät hat eine konstante Leistung.'],
  ['Fotos','Preis (€)',10,3,35,'Alle Fotoabzüge kosten gleich viel.'],
  ['Runden','Strecke (m)',3,1200,8,'Eine Runde ist immer gleich lang.'],
  ['Etikettenbögen','Etiketten',4,96,7,'Auf jedem Bogen stehen gleich viele Etiketten.'],
  ['Farbe (l)','Fläche (m²)',2,16,5,'Pro Quadratmeter wird gleich viel Farbe gebraucht.']
];
const inverse=[
  ['Drucker','Zeit (min)',3,24,8,'Alle Drucker sind gleich schnell. Derselbe Auftrag wird gleichmäßig verteilt.'],
  ['Pumpen','Zeit (min)',2,30,5,'Alle Pumpen fördern gleich viel je Minute. Dasselbe Becken wird geleert.'],
  ['Helfer','Zeit (h)',4,6,8,'Alle arbeiten gleich schnell und gleichzeitig. Die Arbeitsmenge bleibt gleich.'],
  ['Maschinen','Zeit (h)',6,10,4,'Alle Maschinen sind gleich schnell. Der Auftrag bleibt gleich groß.'],
  ['Geschwindigkeit (km/h)','Fahrzeit (h)',60,3,90,'Die Strecke bleibt gleich. Es gibt keine Pausen.'],
  ['Wasserhähne','Füllzeit (min)',3,20,4,'Gleiche Hähne füllen denselben leeren Tank, ohne Druckverlust.'],
  ['Anzahl Gruppen','Kinder je Gruppe',4,12,6,'Dieselben Kinder werden in gleich große Gruppen eingeteilt.'],
  ['Portionsgröße (g)','Portionen',200,15,300,'Die vorhandene Gesamtmenge bleibt gleich.'],
  ['Sitzplätze je Bus','Benötigte Busse',40,6,60,'Alle Plätze werden besetzt, dieselben Personen fahren mit.'],
  ['Kartoninhalt (Stück)','Kartons',12,20,8,'Dieselbe Stückzahl wird ohne Rest verpackt.'],
  ['Druckgeschwindigkeit (Seiten/min)','Zeit (min)',20,15,30,'Dasselbe Dokument wird gedruckt.'],
  ['Förderrate (l/min)','Zeit (min)',8,45,12,'Dieselbe Wassermenge wird gefördert.'],
  ['Ausgabemenge je Tag (kg)','Reichweite (Tage)',3,20,5,'Derselbe Vorrat wird täglich gleichmäßig verbraucht.'],
  ['Füllmenge je Flasche (l)','Flaschen',0.5,24,0.75,'Dieselbe Flüssigkeitsmenge wird vollständig abgefüllt.'],
  ['Werkzeuge je Kiste','Kisten',10,18,15,'Dieselbe Gesamtzahl wird ohne Rest verteilt.'],
  ['Leistung (kW)','Zeit (h)',2,6,3,'Die benötigte Energie bleibt gleich, die Leistung ist konstant.'],
  ['Süßigkeiten je Tüte','Tüten',6,20,8,'Dieselbe Gesamtmenge wird ohne Rest aufgeteilt.'],
  ['Streifenbreite (cm)','Streifen',5,12,3,'Dieselbe Papierbreite wird ohne Verschnitt zerschnitten.'],
  ['Computer','Rechenzeit (min)',4,18,6,'Die gleich schnellen Computer teilen dieselbe vollständig parallelisierbare Arbeit.'],
  ['Transportkapazität je Fahrt (kg)','Fahrten',100,12,150,'Dieselbe Gesamtmasse wird in jeweils voll beladenen Fahrten transportiert.']
];
const percent=[
  ['Prozent (%)','Betrag (€)',100,400,25,'Gesucht ist der Prozentwert, keine Preisänderung.'],
  ['Prozent (%)','Länge (m)',100,80,15,'Gesucht ist der entsprechende Längenanteil.'],
  ['Prozent (%)','Masse (kg)',100,250,12,'Gesucht ist der entsprechende Massenanteil.'],
  ['Prozent (%)','Betrag (€)',100,240,15,'Berechne ausschließlich die Höhe des Rabatts.'],
  ['Prozent (%)','Betrag (€)',25,30,100,'25 Prozent entsprechen 30 Euro. Gesucht ist der Grundwert.'],
  ['Prozent (%)','Masse (g)',20,60,100,'20 Prozent entsprechen 60 Gramm. Gesucht ist die Gesamtmasse.'],
  ['Prozent (%)','Länge (cm)',40,120,100,'40 Prozent entsprechen 120 Zentimetern. Gesucht ist die Gesamtlänge.'],
  ['Betrag (€)','Prozent (%)',120,100,30,'Gesucht ist, wie viel Prozent 30 Euro von 120 Euro sind.'],
  ['Masse (g)','Prozent (%)',250,100,50,'Gesucht ist, wie viel Prozent 50 Gramm von 250 Gramm sind.'],
  ['Länge (m)','Prozent (%)',80,100,12,'Gesucht ist, wie viel Prozent 12 Meter von 80 Metern sind.']
];
const negatives=[
  ['Grundgebühr','other','Ein Taxi kostet 4 Euro Grundgebühr und 2 Euro je Kilometer. Was kosten 7 Kilometer?'],
  ['Mengenrabatt','other','Die ersten fünf Hefte kosten je 2 Euro, jedes weitere 1 Euro. Was kosten acht Hefte?'],
  ['Fehlende Angabe','clarify','Hefte kosten pro Stück gleich viel. Was kosten zehn Hefte? Es ist kein Preis genannt.'],
  ['Ungleiche Leistung','clarify','Zwei unterschiedlich schnelle Drucker brauchen gemeinsam 30 Minuten. Wie lange braucht einer allein? Die Einzelgeschwindigkeiten fehlen.'],
  ['Widerspruch','clarify','Drei identische Hefte kosten 6 Euro, fünf kosten 15 Euro. Gleichzeitig soll ein einheitlicher Stückpreis gelten. Was kosten zehn?'],
  ['Zwei Rabatte','other','Ein Fahrrad kostet 200 Euro. Erst 10 Prozent Rabatt, danach nochmals 10 Prozent auf den neuen Preis. Gesucht ist der Endpreis.'],
  ['Temperatur','other','Rechne 20 Grad Celsius mit F = 1,8 × C + 32 in Fahrenheit um.'],
  ['Satzglieder','other','Lass die Klasse Subjekt und Prädikat in einem Satz bestimmen und Felder durch Pfeile verbinden.'],
  ['Quadratische Beziehung','other','Ein Quadrat hat Seitenlänge 3 cm und Fläche 9 cm². Welche Fläche hat ein Quadrat mit 6 cm Seitenlänge?'],
  ['Quellenauftrag','other','Zwei kurze Quellen sollen mit den durch sie belegten Aussagen verbunden werden. Es gibt keine Mengenberechnung.']
];
function positive(row,index,family,kind){
  const [left,right,a,b,c,context]=row;
  const wish='Erstelle eine Aufgabe für Klasse 7. '+context+' '+a+' '+left+' entsprechen '+b+' '+right+
    '. Gesucht ist der Wert in '+right+' für '+c+' '+left+'. Verwende eine passende Darstellung, keine erfundenen Zusatzdaten.';
  return {id:family+'-'+String(index+1).padStart(2,'0'),family,wish,
    expected:{kind,a:String(a),b:String(b),c:String(c)},modes:modes[index%modes.length]};
}
const cases=[
  ...direct.map((r,i)=>positive(r,i,'direct','direct')),
  ...inverse.map((r,i)=>positive(r,i,'inverse','inverse')),
  ...percent.map((r,i)=>positive(r,i,'percent','direct')),
  ...negatives.map(([heading,kind,wish],i)=>({id:'contrast-'+String(i+1).padStart(2,'0'),family:'contrast',wish:'Erstelle eine passende Lernaufgabe für Klasse 7. '+wish,
    heading,expected:{kind},modes:modes[0]}))
];
module.exports={VERSION,RUN,cases,modes};
