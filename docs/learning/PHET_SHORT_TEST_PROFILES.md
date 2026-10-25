# PhET-inspirierte Kurztestprofile

Stand: 25.10.2026. Task: GC-EXTENDED-QUESTION-TYPES-01.

## Zweck und Status

Acht eigene, begrenzte Aufgabenprofile ergänzen den vorhandenen Remy-/Emmi-Autorenprompt. Jede Aufgabe prüft eine klar benannte Kompetenz und endet in einer kurzen individuellen Antwort. Die Profile benutzen bestehende visuelle Formate; es werden keine PhET-Simulationen, Assets oder fremden Aufgaben eingebettet.

**Erprobt:** acht handgeschriebene Referenzaufgaben, bestehende serverseitige Datenvalidierung, deterministische Bewertung, alternative Antworten, Teilpunkte und Entfernung privater Lösungen aus der Schülerdarstellung. 17 lokale Verhaltenstests bestanden auf Node 24.22.1. Die Referenzaufgaben sind ausdrücklich Vorlagen, keine neu erzeugten KI-Aufgaben.

**Offen:** neue echte Remy-Generierung, Emmi-Überarbeitung, Speicher-/Abgabeweg, neuer Preview-Deploy und Geräteabnahme dieses Patches. Die bereits vorhandenen 24 Pilotprüfungen sind historische Evidenz eines anderen Stands.

## Profile und konkrete Beispiele

Klassen dienen als Pilotvorgabe und müssen von der Lehrkraft an Unterricht und Lerngruppe angepasst werden.

| Profil | Handlung und eigenes Beispiel | Erwartete Antwort | Bewertung des Referenzitems |
|---|---|---|---|
| KURZ-BRUCH | 3/4 in einem Raster mit acht gleich großen Feldern darstellen | sechs beliebige verschiedene Felder | 2 Punkte; alternative Zellmuster gleichwertig |
| KURZ-FUNKTION | Eingabe 5, zuerst mal 3, dann minus 2; Ausgabe eintragen | 13 | 2 Punkte |
| KURZ-GERADE | Für y=2x-1 genau A bei x=0 und B bei x=2 setzen | A(0,-1), B(2,3) | gemeinsam 2 oder 0 Punkte im vorhandenen Koordinatenchecker |
| KURZ-VEKTOR | Ab Ursprung (3,1) und danach (-1,2) verschieben; Endpunkt setzen | (2,3) | 2 Punkte |
| KURZ-REAKTION | H2+O2→H2O mit kleinsten positiven ganzen Koeffizienten ausgleichen | 2,1,2 | je richtigem Koeffizienten 1 Punkt, insgesamt 3 |
| KURZ-ATOM | 6 Protonen, 8 Neutronen, 7 Elektronen; Massenzahl und Ladung bestimmen | 14 und -1 Elementarladungen | je Feld 1 Punkt; gleichwertige Zahlenschreibweisen akzeptiert |
| KURZ-OHM | U=6 V, R=300 Ohm; Stromstärke auf mA-Skala einstellen | 20 mA | 2 Punkte |
| KURZ-MENGEN | Je Paket 2 rote/1 blaue Karte, Vorrat 7 rote/4 blaue; maximale Pakete und Reste | 3 Pakete, 1 rote/1 blaue Karte übrig | je Feld 1 Punkt, insgesamt 3 |

Die vollständigen synthetischen Referenzen stehen in `functions/test/fixtures/short-test-profiles.json`. Sie dienen der Prüfung des Daten- und Bewertungsvertrags. Der neue Autorenprompt fordert eigene Zahlen und passende Transferaufgaben.

## Bewusste Grenzen

- Beim Bruchraster zählt der dargestellte Anteil, nicht das Zellmuster.
- Bei linearen Funktionen werden die ausdrücklich verlangten Punkte bewertet. Eine frei gewählte Gerade wird damit nicht geprüft.
- Bei Reaktionen sind die kleinsten Koeffizienten Teil des Arbeitsauftrags. Feldweise Teilpunkte bescheinigen richtige Einzelkoeffizienten; eine insgesamt ausgeglichene Reaktion ist dafür nicht erforderlich.
- Bei der Atomaufgabe sind Massenzahl und Nettoladung gefragt. Der Auftrag macht keine Aussage über Stabilität oder exakte Atommasse. `numericForm: any` akzeptiert z. B. das typografische Minus und mathematisch gleichwertige ganze Werte.
- Bei Ohm ist die Antwortseinheit fest. Der bestehende Checker rechnet frei eingegebene Einheiten nicht automatisch um.
- Tabellenpunkte sind für Chemie und Mengen bewusst an drei Eingabefelder angepasst. Dadurch entstehen keine verdeckten Rundungsverluste.
- Kein neues Grafikmotiv für Atom, Wippe oder Stromkreis wird vorausgesetzt. Flächenkonstruktion mit Umfangsprüfung, freie Hebel- und Stromkreissimulationen bleiben eigene, noch ungeprüfte Erweiterungen.

## Einbindung in den bestehenden KI-Weg

`functions/lib/short-test-profiles.js` liefert Profilregeln und `profileRequest(id)`. `visual-prompts.js` hängt die Regeln an den bereits gemeinsam verwendeten Autorenprompt an. Erstellung, Ersetzung und Emmi behalten ihre vorhandenen Schnittstellen.

Ein Profil gilt nur bei entsprechendem ausdrücklichem Lehrerwunsch. Aufgabenanzahl, Gesamtpunkte, erlaubte Antworttypen, Sprache und Umfang der konkreten Anfrage bleiben verbindlich. Eine Emmi-Einzeländerung erzeugt keinen ganzen Test. Im normalen Lehrkraftablauf ist kein Roh-JSON vorgesehen.

`profileRequest()` erzeugt einen gezielten technischen Pilotauftrag mit vier visuellen Aufgaben. Chemie und Mengen haben zwölf, die übrigen Profile acht Gesamtpunkte. Das ist keine globale Formatquote für normale Tests. Die gelieferten Lehrerwünsche enthalten alle wesentlichen Profilregeln, sodass der begrenzte Pilot auch über den bereits veröffentlichten Remy-Weg angefragt werden kann; der neue globale Hook wird dadurch noch nicht als deployed nachgewiesen.

Für Entwickler, rein lesend:

```sh
node tools/short-test-profiles.cjs
node tools/short-test-profiles.cjs KURZ-BRUCH
node tools/short-test-profiles.cjs KURZ-BRUCH --json
node functions/test/short-test-profiles.test.js
```

Das Werkzeug liest weder Anmeldedaten noch ruft es einen Provider auf. Eine konkrete `clientRequestId` entsteht erst beim echten, dauerhaft protokollierten KI-Aufruf.

## Erster echter Durchlauf

1. Die bestehende isolierte visual255-Lehrkraftvorschau mit einem bereits dafür berechtigten Test-/Admin-Konto öffnen.
2. Remy: Mathematik, Klasse 6, gleichwertige Brüche, vier Aufgaben, acht Punkte. Lehrerwünsche aus KURZ-BRUCH verwenden.
3. Die tatsächlich generierten Aufgaben unabhängig prüfen: Bruchwert, Rastergröße, Lösung, verständlicher Wortlaut und Punkte. Modell-Schlüssel allein genügt nicht als Beweis.
4. Eine geeignete Rasteraufgabe über Emmi zu 2/3 von 24 Feldern überarbeiten; erwarteter Schlüssel 16. Umfang und übrige Fragen erhalten.
5. Den synthetischen Test speichern, vom Server wieder öffnen und über den normalen Vorschau-Schülerweg bearbeiten.
6. Bei vier Aufgaben mit je zwei Punkten drei vollständig richtig, eine vollständig falsch beantworten: erwartet 6/8. Für Teilpunkte die tatsächliche Aufgabenrubrik verwenden.
7. Job-/Quiz-/Attempt-ID, bereitgestellten Stand und Abgabebeleg sichern. Wiederaufnahme und wiederholte Abgabe nur mit derselben Testinstanz prüfen; unklare Providerstarts nicht blind wiederholen.

Dieser Ablauf wurde in diesem Patch noch nicht neu ausgeführt. Die Lehrkraftseite zeigte in dieser Sitzung eine Anmeldemaske. Der lokale Browserzugriff auf Martins `127.0.0.1:8766` war nicht verfügbar; dessen tatsächlich laufende Version ist unbekannt.

## Quellen und Herkunft

Die folgenden offiziellen PhET-Seiten wurden als didaktische Anregungen geprüft. Die Beispiele und Bewertungsentscheidungen oben sind eigene Übertragungen:

- [Brüche: Gleichsetzen](https://phet.colorado.edu/de/simulations/fractions-equality)
- [Function Builder](https://phet.colorado.edu/en/simulations/function-builder)
- [Graphing Lines](https://phet.colorado.edu/en/simulations/graphing-lines)
- [Vector Addition](https://phet.colorado.edu/en/simulations/vector-addition)
- [Balancing Chemical Equations](https://phet.colorado.edu/en/simulations/balancing-chemical-equations)
- [Build an Atom](https://phet.colorado.edu/en/simulations/build-an-atom)
- [Ohm's Law](https://phet.colorado.edu/en/simulations/ohms-law)
- [Reactants, Products and Leftovers](https://phet.colorado.edu/en/simulations/reactants-products-and-leftovers)

Die [HTML-Lizenzseite](https://phet.colorado.edu/en/licensing/html) beschreibt historische Versionen vor dem 29.03.2026; das [aktuelle Help Center](https://phet.colorado.edu/en/help-center/getting-started) beschreibt kommerzielle Lizenzierung. Daraus wird hier keine pauschale Übernahmefreigabe abgeleitet. Dieser Patch kopiert keine PhET-Assets und bindet keine Simulation ein.

