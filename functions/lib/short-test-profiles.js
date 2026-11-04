'use strict';

// Own bounded assessment profiles. PhET supplies pedagogical inspiration only.
// Opt-in through existing teacher notes; no new task type or request schema.
const SHORT_TEST_PROFILES = Object.freeze([
  {
    id: 'KURZ-BRUCH', title: 'Gleichwertige Brüche', subject: 'Mathematik', grade: '6', questionPoints: 2,
    catalogIds: ['EXP01', 'VIS05', 'VIS12', 'VIS13'], formats: ['grid', 'table', 'correction'],
    source: 'https://phet.colorado.edu/de/simulations/fractions-equality',
    instruction: 'Prüfe gleichwertige echte Brüche mit positiven ganzen Zahlen. Nutze nach Lernziel ein gleichmäßig geteiltes Raster, einen fehlenden Zähler bei vorgegebenem Zielnenner oder eine begrenzte Fehlerkorrektur. Beim Raster muss rows*columns*Zähler/Nenner eine ganze Zahl zwischen 1 und Feldzahl-1 ergeben; jede Anordnung dieser Feldanzahl ist richtig. Benenne bei Vergleichen ausdrücklich gleich große Ganze. Bei fehlendem Zähler verlange eine ganze Zahl und prüfe die Gleichheit durch Kreuzmultiplikation. Verwende unterschiedliche Perspektiven und neue Zahlen für Transfer.'
  },
  {
    id: 'KURZ-FUNKTION', title: 'Funktionsmaschinen', subject: 'Mathematik', grade: '6', questionPoints: 2,
    catalogIds: ['EXP03', 'VIS12', 'VIS13'], formats: ['table', 'correction'],
    source: 'https://phet.colorado.edu/en/simulations/function-builder',
    instruction: 'Gib eine Eingabe und eine ausdrücklich geordnete Rechenregel mit zwei Operationen vor. Frage nach einer Ausgabe oder einer eindeutig falschen Auswertung. Berechne zuerst die erste, danach die zweite Operation. Wähle kleine ganzzahlige Ein- und Ausgaben; bei Tabellen answerMode numeric und numericForm integer. Eine einzelne Wertezeile bestimmt keine unbekannte allgemeine Funktion. Keine Grafik einer bedienbaren Maschine voraussetzen.'
  },
  {
    id: 'KURZ-GERADE', title: 'Punkte einer linearen Funktion', subject: 'Mathematik', grade: '8', questionPoints: 2,
    catalogIds: ['EXP03', 'VIS08', 'VIS12'], formats: ['coordinate', 'table'],
    source: 'https://phet.colorado.edu/en/simulations/graphing-lines',
    instruction: 'Gib y=m*x+b mit kleinen ganzzahligen Parametern vor. Verlange bei coordinate im Modus points genau A für x=0 und B für x=2; berechne beide y-Werte unabhängig durch Einsetzen. Labels und Lösungspunkte stehen in derselben Reihenfolge, beide liegen im Raster. Bewertet werden diese verlangten Punkte; andere kollineare Punkte sind keine Alternative. Alternativ eine begrenzte Wertetabelle ergänzen. Keine freie Gerade, Steigungsregler oder dynamische Kopplung behaupten.'
  },
  {
    id: 'KURZ-VEKTOR', title: 'Verschiebungen im Koordinatensystem', subject: 'Mathematik', grade: '7', questionPoints: 2,
    catalogIds: ['VIS08', 'VIS12'], formats: ['coordinate', 'table'],
    source: 'https://phet.colorado.edu/en/simulations/vector-addition',
    instruction: 'Beschreibe zwei ganzzahlige Verschiebungen ab dem Ursprung in klarer Richtungssprache oder bei passendem Vorwissen als Komponenten. Frage ausschließlich nach dem Endpunkt oder seinen beiden Koordinaten. Addiere x- und y-Komponenten getrennt, beachte Links-/Rechts- und Oben-/Unten-Vorzeichen. Bei coordinate genau einen Punkt im Modus points verlangen und das Raster passend wählen. Keine Pfeil- oder Bewegungsanimation voraussetzen.'
  },
  {
    id: 'KURZ-REAKTION', title: 'Reaktionsgleichungen ausgleichen', subject: 'NT', grade: '8', questionPoints: 3,
    catalogIds: ['VIS12'], formats: ['table'],
    source: 'https://phet.colorado.edu/en/simulations/balancing-chemical-equations',
    instruction: 'Nutze einfache Gleichungen mit genau drei festen Formeln, etwa H2 + O2 → H2O, N2 + H2 → NH3, Mg + O2 → MgO oder Fe + O2 → Fe2O3. Verlange ausdrücklich die kleinsten positiven ganzen Koeffizienten einschließlich eingetragener 1. Ändere keine Formelindizes. Prüfe die Atombilanz jedes Elements und den größten gemeinsamen Teiler 1. Genau drei Eingabezellen, answerMode numeric, numericForm integer, je ein Punkt pro Koeffizient; skalierte Vielfache erfüllen den Arbeitsauftrag nicht.'
  },
  {
    id: 'KURZ-ATOM', title: 'Massenzahl und Teilchenladung', subject: 'NT', grade: '9', questionPoints: 2,
    catalogIds: ['VIS12'], formats: ['table'],
    source: 'https://phet.colorado.edu/en/simulations/build-an-atom',
    instruction: 'Gib kleine plausible Zahlen für Protonen p, Neutronen n und Elektronen e eines beschriebenen Teilchens vor. Frage in genau zwei Eingabezellen nach Massenzahl p+n und Nettoladung p-e in Einheiten der Elementarladung. answerMode numeric und numericForm any; bewerte ganze Zahlen nach ihrem Wert, einschließlich äquivalenter Schreibweisen und typografischem Minus; je ein Punkt pro Zelle. Massenzahl ist keine exakte Atommasse, ein geladenes Teilchen kein neutrales Atom. Keine Stabilität, Elektronenkonfiguration oder nicht vorhandene Atomgrafik voraussetzen.'
  },
  {
    id: 'KURZ-OHM', title: 'Stromstärke am ohmschen Widerstand', subject: 'NT', grade: '8', questionPoints: 2,
    catalogIds: ['VIS03', 'VIS12'], formats: ['scale', 'table'],
    source: 'https://phet.colorado.edu/en/simulations/ohms-law',
    instruction: 'Gib Spannung U in V und positiven Widerstand R in Ohm eines idealen ohmschen Widerstands vor. Frage nach I in ausdrücklich festgelegten mA; berechne 1000*U/R. Für scale nutze context numberline und unit mA, wähle ein exakt erreichbares Rasterergebnis und tolerance 0. Alternativ eine einzelne numerische Tabellenzelle mit fester Einheit ergänzen. Keine freie Schaltung oder automatische Einheitenumrechnung durch den Antwortchecker voraussetzen.'
  },
  {
    id: 'KURZ-MENGEN', title: 'Vollständige Pakete und Reste', subject: 'Mathematik', grade: '5', questionPoints: 3,
    catalogIds: ['VIS12'], formats: ['table'],
    source: 'https://phet.colorado.edu/en/simulations/reactants-products-and-leftovers',
    instruction: 'Gib zwei ganzzahlige Vorräte und ein Rezept mit zwei positiven ganzzahligen Mengen vor. Frage ausdrücklich nach der größtmöglichen Zahl vollständiger Pakete und beiden Restmengen. Berechne das Minimum der abgerundeten Vorratsquotienten und subtrahiere den Verbrauch; alle Reste sind nicht negativ, kein weiteres Paket ist möglich. Genau drei Eingabezellen, answerMode numeric, numericForm integer, je ein Punkt pro Zelle. Nutze eigene Karten-/Materialkontexte.'
  }
].map(profile => Object.freeze({
  ...profile,
  catalogIds: Object.freeze(profile.catalogIds),
  formats: Object.freeze(profile.formats)
})));

const SHORT_TEST_PROFILE_RULES = `
Optionale Kurztestprofile für einfache individuelle Leistungsnachweise:
Wende nur ein zum ausdrücklichen Lehrerwunsch passendes Profil an, insbesondere bei Nennung seiner ID. Die Profile sind didaktische Hilfen, keine neue Antwortform und keine globale Formatquote. Die konkrete Anfrage bestimmt Fach, Klasse, Sprache, erlaubte Typen, Aufgabenanzahl, Punkte und Umfang. Bei Emmi nur den angefragten Änderungsumfang bearbeiten; eine Einzeländerung erzeugt keinen ganzen Test. Nutze eigene Aufgaben mit überprüften Lösungen und passenden Zahlen. Halte die vorhandenen visualTask-Verträge ein. Vorlagenbeispiele sind keine Belege für eine ausgeführte KI-Generierung.
Jede Aufgabe ist aus ihrem eigenen Arbeitsauftrag lösbar und endet in einer begrenzten Antwort. Klare Einheiten, erreichbare Rasterwerte, zulässige alternative Antworten und Teilpunkte vorab festlegen. Keine Excel-Bearbeitung, Agentenbedienung, offenen Projekte oder fremden Simulationsassets verlangen. Freie Begründungen eignen sich nicht für endlichen Textvergleich. Klassische Antwortformen bleiben möglich, soweit die Anfrage sie erlaubt.
${SHORT_TEST_PROFILES.map(profile => profile.id + ' — ' + profile.title + ': ' + profile.instruction).join('\n')}
`;

function profileRequest(id) {
  const profile = SHORT_TEST_PROFILES.find(item => item.id === id);
  if (!profile) throw new Error('Unbekanntes Kurztestprofil: ' + String(id));
  return {
    subject: profile.subject,
    grade: profile.grade,
    schoolType: 'Mittelschule',
    region: 'Bayern',
    topic: profile.title,
    count: 4,
    points: 4 * profile.questionPoints,
    difficulty: 'leicht bis mittel',
    allowedTypes: ['visual'],
    imageMode: 'none',
    audioMode: 'none',
    notes: [
      'Kurztestprofil ' + profile.id + '.',
      'Erzeuge vier eigene kurze, unabhängig lösbare Aufgaben mit je ' + profile.questionPoints + ' Punkten.',
      'Dieser gezielte Vorschautest prüft die vorhandenen visuellen Formate: ' + profile.formats.join(', ') + '.',
      profile.instruction,
      'Wähle neue Beispiele und überprüfe jede Lösung unabhängig. Halte alle bestehenden visualTask-Grenzen ein.',
      'Nutze ausschließlich fiktive Sachverhalte. Keine Dateien, externen Simulationen oder Agentenbedienung. Keine freie Begründung automatisch bewerten.'
    ].join(' ')
  };
}

module.exports = { SHORT_TEST_PROFILES, SHORT_TEST_PROFILE_RULES, profileRequest };

