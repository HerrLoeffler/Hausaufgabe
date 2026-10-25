'use strict';
const rows=[
['Mathematik',5,'Brüche und Anteile im Alltag','Gleich große Teile eines Ganzen, einfache Brüche und Zuordnungen zwischen Anteil und Anzahl','grid, scale, table'],
['Mathematik',6,'Winkel und Koordinaten','Winkel mit Winkelmesser messen, Punkte im ersten Quadranten setzen und einfache Messwerte darstellen','angle, coordinate, chart'],
['Mathematik',8,'Prozentrechnung und lineare Zusammenhänge','Prozentanteile, Tabellen und lineare Wertpaare sowie Intervalle','grid, table, coordinate, range'],
['Mathematik',10,'Lineare Funktionen und Dateninterpretation','Funktionswerte und Graphpunkte linearer Funktionen sowie begründete Diagrammaussagen','coordinate, table, chart, evidence'],
['Deutsch',5,'Wortarten und einfache Satzglieder','Nomen, Verben und Adjektive sowie Subjekt und Prädikat an selbst erfundenen kurzen Sätzen erkennen','labeling, connections, correction, evidence'],
['Deutsch',7,'Satzbau und Textbelege','Satzglieder unterscheiden, kurze eigene Alltagstexte verstehen und Aussagen anhand vollständiger Textstellen belegen','labeling, evidence, correction, table'],
['Deutsch',9,'Argumente und sachliches Schreiben','Behauptung, Begründung und Beispiel in eigenen kurzen Texten unterscheiden; sprachlich eindeutige Fehler korrigieren','connections, evidence, correction, table'],
['Deutsch',10,'Quellenkritik und Argumentationsanalyse','Eigene fiktive Quellen mit klaren Fakten nutzen, belegte Aussagen und Argumentationsbeziehungen prüfen','evidence, connections, table, correction'],
['Englisch',5,'Everyday English','Kurze selbst erfundene englische Sätze zu school and daily routines, räumliche Beziehungen und grundlegende Grammatik','labeling, connections, correction, table'],
['Englisch',6,'A day out','Kurze englische Alltagsinformationen zu Uhrzeiten, Orten und Abläufen verstehen und sprachlich bearbeiten','scale, evidence, table, correction'],
['Englisch',8,'Travel and communication','Eigene kurze englische Reiseinformationen und Dialoge, eindeutige Zeitformenfehler und Textbelege','evidence, table, correction, connections'],
['Englisch',9,'Media and opinions','Eigene kurze englische Meldungen und Meinungen auswerten; Aussagen belegen und eindeutige Sprachfehler korrigieren','evidence, connections, correction, table'],
['Natur und Technik',6,'Pflanzen und Wachstumsdaten','Pflanzenteile und ihre Funktionen, einfache selbst konstruierte Wachstumsdaten fachlich nutzen','labeling, hotspot, chart, table'],
['Natur und Technik',7,'Temperatur und Messreihen','Temperaturskalen, Messwerttabellen und Diagramme in einfachen erfundenen Experimenten auswerten','scale, range, chart, table'],
['Natur und Technik',8,'Kraft, Bewegung und Energie','Einfache Messreihen zu Weg und Zeit, Energieübertragungen und begründete Aussagen anhand mitgelieferter Daten','chart, coordinate, table, connections'],
['Natur und Technik',10,'Experimente und wissenschaftliche Aussagen','Kontrollierte Variablen, Messwertauswertung und Grenzen von Schlussfolgerungen an vollständigen fiktiven Versuchsdaten','table, chart, evidence, connections'],
['Geschichte und Geografie',5,'Karten, Richtungen und Zeitabstände','Fiktive Karte und ausdrücklich erfundene Orts-/Ereignisdaten; Himmelsrichtungen, Koordinaten und zeitliche Abstände','coordinate, scale, labeling, table'],
['Geschichte und Geografie',7,'Stadtentwicklung und Klimadaten','Vollständig mitgelieferte fiktive Stadtdaten und monatliche Messwerte räumlich und zeitlich auswerten','scale, chart, table, evidence'],
['Geschichte und Geografie',9,'Bevölkerung und Quellen','Eigene fiktive Bevölkerungsstatistiken, Kartenregionen und zeitgenössische Kurzquellen vergleichen','chart, table, evidence, scale'],
['Geschichte und Geografie',10,'Raumentwicklung und begründete Entscheidungen','Fiktive Standort-/Umweltdaten mit Grenzen; zeitliche Entwicklung und belegte Standortentscheidungen','chart, coordinate, table, evidence'],
['Wirtschaft',6,'Einkaufen und Belege','Fiktive einfache Kassenbons, Preise und Mengen auswerten, Rechenfehler und Bestandteile erkennen','table, correction, labeling, chart'],
['Wirtschaft',7,'Budget und Sparen','Fiktive monatliche Einnahmen und Ausgaben, Sparanteile und Budgetgrenzen auswerten','chart, table, grid, range'],
['Wirtschaft',8,'Angebote und Kostenvergleich','Vollständig definierte fiktive Preisangebote, Stückpreise und lineare Kosten; keine Rechts-/Finanzberatung','table, coordinate, chart, correction'],
['Wirtschaft',9,'Betriebliche Entscheidungen','Fiktive kleine Produktions- und Absatzdaten, Deckungsbeiträge mit gegebener Definition und belegte Entscheidungen','table, chart, evidence, coordinate']
];
module.exports=rows.map(([subject,grade,title,goal,formats],i)=>({id:'P'+String(i+1).padStart(2,'0'),subject,grade,title,goal,formats:formats.split(', '),requestId:'VIS24-20261025-'+String(i+1).padStart(2,'0')+'-A',count:8,points:16}));
