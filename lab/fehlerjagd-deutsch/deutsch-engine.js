(() => {
  'use strict';

  const SKILLS = {
    strategy: { label: 'Rechtschreibstrategien', short: 'Strategien', group: 'spelling', minGrade: 5, desc: 'Schreibung begründen: verlängern, ableiten, Wortart, Signalwort, Silben, Merkwort.' },
    case: { label: 'Groß- & Kleinschreibung', short: 'Groß/Klein', group: 'spelling', minGrade: 5, desc: 'Nomen, Nominalisierungen, Zeitangaben, Eigennamen und Signalwörter.' },
    spelling: { label: 'Richtige Schreibweise', short: 'Schreibweise', group: 'spelling', minGrade: 5, desc: 'Schärfung, Dehnung, Wortstamm, Fremd- und Lernwörter.' },
    dasdass: { label: 'das / dass', short: 'das/dass', group: 'spelling', minGrade: 6, desc: 'Artikel, Pronomen und Konjunktion sicher unterscheiden.' },
    together: { label: 'Getrennt & zusammen', short: 'Getr./Zus.', group: 'spelling', minGrade: 6, desc: 'Bedeutung und Wortverbindung prüfen.' },
    punctuation: { label: 'Zeichensetzung', short: 'Zeichen', group: 'spelling', minGrade: 5, desc: 'Kommas, wörtliche Rede, Infinitivgruppen und Satzgrenzen.' },
    wordclass: { label: 'Wortarten', short: 'Wortarten', group: 'grammar', minGrade: 5, desc: 'Wortarten im Satz sicher bestimmen – bis zu Pronomenarten und Konjunktionen.' },
    sentenceparts: { label: 'Satzglieder', short: 'Satzglieder', group: 'grammar', minGrade: 5, desc: 'Subjekt, Prädikat, Objekte und Adverbialbestimmungen.' },
    sentencebuild: { label: 'Satzbau', short: 'Satzbau', group: 'grammar', minGrade: 6, desc: 'Haupt-/Nebensatz, Satzreihe, Satzgefüge und Gliedsätze.' },
    tense: { label: 'Zeitformen', short: 'Zeitformen', group: 'grammar', minGrade: 5, desc: 'Präsens bis Futur II erkennen und unterscheiden.' },
    voice: { label: 'Aktiv & Passiv', short: 'Aktiv/Passiv', group: 'grammar', minGrade: 7, desc: 'Handlungsrichtung und Passivformen erkennen.' },
    wordformation: { label: 'Wortbildung & Sprache', short: 'Wortbildung', group: 'grammar', minGrade: 7, desc: 'Wortstamm, Vor-/Nachsilben, Synonyme, Oberbegriffe und Fremdwörter.' }
  };

  const GRADE_HINTS = {
    '5': 'Schwerpunkt: grundlegende Wortarten und Satzglieder, Rechtschreibprinzipien, Großschreibung von Nomen, Satzzeichen und Rechtschreibstrategien.',
    '6': 'Neu bzw. vertieft: Nominalisierungen, das/dass, Getrennt- und Zusammenschreibung, Haupt-/Nebensätze und sichere Fehlerkorrektur.',
    '7': 'Neu bzw. vertieft: Relativ- und Demonstrativpronomen, Satzreihe/Satzgefüge, Kausaladverbiale, Aktiv/Passiv sowie komplexere Rechtschreibstrategien.',
    '8': 'Vertiefung: bekannte Wortarten sicher, Konjunktiv/indirekte Rede, Finaladverbiale und Attribute, komplexe Kommasetzung, Fremdwörter und Schreibvarianten.',
    '9': 'Abschlussniveau Regelklasse: bekannte Wortarten und Satzglieder sicher anwenden, Zweifelsfälle der Rechtschreibung, Fremdwörter, Getrennt-/Zusammenschreibung und Zeichensetzung.',
    qa: 'Quali-Training: eigener Aufgabenmix nach den offiziellen Kompetenzbereichen Rechtschreiben und Sprachbetrachtung – mit Begründungen, Strategien und Grammatik.'
  };

  const LEVEL_LABEL = { n1: 'Niveau 1', n2: 'Niveau 2', n3: 'Niveau 3', n4: 'Niveau 4' };
  const LEVEL_NUM = { n1: 1, n2: 2, n3: 3, n4: 4 };

  function rngFactory(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  function shuffle(rng, list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function S(id, skill, grade, difficulty, prompt, options, correct, explanation, context = '', instruction = 'Wähle die richtige Antwort.') {
    return { id, skill, grade, difficulty, type: 'single', prompt, options, correct, explanation, context, instruction };
  }
  function M(id, skill, grade, difficulty, prompt, options, explanation, context = '', instruction = 'Markiere alle Stellen, die verbessert werden müssen.') {
    return { id, skill, grade, difficulty, type: 'multi', prompt, options, explanation, context, instruction };
  }

  const TASKS = [
    // Rechtschreibstrategien
    S('str-01','strategy',5,1,'Welche Strategie erklärt die Schreibung von „Bäume“ am besten?',['Ableiten: Baum → Bäume','Steigern','Silben trennen','Merkwort'], 'Ableiten: Baum → Bäume','Das ä lässt sich über das verwandte Wort „Baum“ herleiten.'),
    S('str-02','strategy',5,1,'Wie überprüfst du den Endlaut in „Hund“?',['Verlängern: Hunde','Artikelprobe','Steigern','Wort trennen'], 'Verlängern: Hunde','Durch Verlängern wird das d hörbar: Hund – Hunde.'),
    S('str-03','strategy',5,2,'Warum wird „etwas Schönes“ großgeschrieben?',['Signalwort + nominalisiertes Adjektiv','Verbprobe','Verlängern','Merkwort'], 'Signalwort + nominalisiertes Adjektiv','„etwas“ ist ein Signalwort; „Schönes“ wird wie ein Nomen gebraucht.'),
    S('str-04','strategy',5,2,'Welche Strategie hilft bei „rennt“?',['Auf kurzen Vokal achten: Doppelkonsonant','Ableiten zu „Rand“','Artikelprobe','Steigern'], 'Auf kurzen Vokal achten: Doppelkonsonant','Nach kurzem betontem Vokal wird der Konsonant verdoppelt: rennen – rennt.'),
    S('str-05','strategy',6,2,'Wie begründest du „Erlebnis“?',['Nomenendung -nis erkennen','Steigern','Verbprobe','Silbenanfang prüfen'], 'Nomenendung -nis erkennen','Die Endung -nis ist ein typisches Signal für Nomen; deshalb Großschreibung.'),
    S('str-06','strategy',6,2,'Welche Probe hilft bei „täglich“?',['Wortfamilie: Tag – täglich','Mehrzahlprobe','Artikelprobe','Trennprobe'], 'Wortfamilie: Tag – täglich','Der Wortstamm wird über die Wortfamilie sichtbar: Tag – täglich.'),
    S('str-07','strategy',7,3,'Warum schreibt man „im Allgemeinen“ groß?',['„im“ = „in dem“: nominalisiertes Adjektiv','Es ist immer ein Eigenname','Wegen der Endung -en','Weil es am Satzende steht'], '„im“ = „in dem“: nominalisiertes Adjektiv','Der Artikel steckt in „im“ (= in dem); „Allgemeinen“ ist nominalisiert.'),
    S('str-08','strategy',8,3,'Welche Strategie ist bei „interessant“ am zuverlässigsten?',['Als Lern-/Merkwort sichern','Artikelprobe','Steigern, um ss zu hören','Ableiten von „Interesse“ reicht immer vollständig'], 'Als Lern-/Merkwort sichern','Bei Fremd- und Lernwörtern reichen Lautregeln oft nicht; die korrekte Form muss gesichert werden.'),
    S('str-09','strategy',9,4,'Welche Begründung passt zu „eines Abends“?',['Artikelwort zeigt substantivierte Zeitangabe','Adverbien schreibt man grundsätzlich groß','Endung -s erzwingt Großschreibung','Eigenname'], 'Artikelwort zeigt substantivierte Zeitangabe','„eines“ zeigt eine substantivisch gebrauchte Zeitangabe an: eines Abends.'),

    // Groß-/Kleinschreibung
    S('case-01','case',5,1,'Welche Schreibweise ist richtig?',['beim Lesen','beim lesen','Beim lesen','beim LESEN'],'beim Lesen','Nach „beim“ (= bei dem) wird das Verb nominalisiert und großgeschrieben.'),
    S('case-02','case',5,1,'Welche Schreibweise ist richtig?',['die schnelle Antwort','die Schnelle Antwort','die schnelle antwort','Die schnelle Antwort'],'die schnelle Antwort','„Antwort“ ist ein Nomen; „schnelle“ ist hier ein Adjektiv.'),
    S('case-03','case',6,2,'Welche Schreibweise ist richtig?',['etwas Neues entdecken','etwas neues entdecken','Etwas neues Entdecken','etwas Neues Entdecken'],'etwas Neues entdecken','Nach „etwas“ ist „Neues“ ein nominalisiertes Adjektiv.'),
    S('case-04','case',6,2,'Welche Schreibweise passt?',['Sie liebt das Schwimmen.','Sie liebt das schwimmen.','Sie liebt Das Schwimmen.','Sie liebt das Schwimmen'],'Sie liebt das Schwimmen.','Der Artikel „das“ nominalisiert „Schwimmen“.'),
    S('case-05','case',7,2,'Welche Schreibweise ist korrekt?',['morgen früh','Morgen früh','morgen Früh','Morgen Früh'],'morgen früh','Als Adverbien werden „morgen“ und „früh“ kleingeschrieben.'),
    S('case-06','case',7,3,'Welche Schreibweise ist korrekt?',['im Voraus','im voraus','Im voraus','im Vorraus'],'im Voraus','„Voraus“ wird in der festen Verbindung „im Voraus“ großgeschrieben.'),
    S('case-07','case',8,3,'Welche Form ist richtig?',['die Münchner Altstadt','die münchner Altstadt','die Münchner altstadt','die münchner altstadt'],'die Münchner Altstadt','Ableitungen von Ortsnamen auf -er werden großgeschrieben: Münchner.'),
    S('case-08','case',9,4,'Welche Schreibung ist richtig?',['der Erste Weltkrieg','der erste Weltkrieg','der Erste weltkrieg','der erste weltkrieg'],'der Erste Weltkrieg','Bestandteile historischer Eigennamen werden entsprechend der Namensschreibung großgeschrieben.'),

    // allgemeine Rechtschreibung
    S('spell-01','spelling',5,1,'Welche Schreibweise ist richtig?',['Adresse','Addresse','Adrese','Addrese'],'Adresse','„Adresse“ wird mit d und Doppel-s geschrieben.'),
    S('spell-02','spelling',5,1,'Welche Schreibweise ist richtig?',['plötzlich','plözlich','plötztlich','plötslich'],'plötzlich','„plötzlich“ gehört zur Wortfamilie von „plötzlich“/„Platz“ nicht; die Schreibung mit tz muss als korrekte Form gesichert werden.'),
    S('spell-03','spelling',5,2,'Welche Schreibweise ist richtig?',['Fahrrad','Fahrad','Farrad','Fahrradt'],'Fahrrad','Das Wort ist aus „Fahr“ + „Rad“ zusammengesetzt; beide Wortstämme bleiben erhalten.'),
    S('spell-04','spelling',6,2,'Welche Schreibweise ist richtig?',['nämlich','nähmlich','nemlich','nehmlich'],'nämlich','„nämlich“ ist ein Lernwort ohne h nach dem ä.'),
    S('spell-05','spelling',6,2,'Welche Schreibweise ist richtig?',['Ergebnis','Ergebniss','Ergebnies','Ergäbnis'],'Ergebnis','Die Nomenendung lautet -nis; im Singular steht nur ein s.'),
    S('spell-06','spelling',6,2,'Welche Schreibweise ist richtig?',['müssen','müßen','müsen','müsssen'],'müssen','Nach kurzem Vokal steht ss: müssen.'),
    S('spell-07','spelling',7,2,'Welche Schreibweise ist richtig?',['Straße','Strasse','StraSe','Straaße'],'Straße','Nach lang gesprochenem Vokal steht bei diesem s-Laut ß.'),
    S('spell-08','spelling',7,3,'Welche Schreibweise ist richtig?',['interessant','interesant','interressant','interresant'],'interessant','„interessant“ wird mit einem r und Doppel-s geschrieben.'),
    S('spell-09','spelling',8,3,'Welche Schreibweise ist richtig?',['Rhythmus','Rythmus','Rhytmus','Rhythmuss'],'Rhythmus','„Rhythmus“ ist ein Fremdwort mit besonderer Schreibung.'),
    S('spell-10','spelling',8,3,'Welche Schreibweise ist richtig?',['produzieren','produzieren','produtzieren','produziren'],'produzieren','Verben auf -ieren werden mit -ieren geschrieben.'),
    S('spell-11','spelling',9,4,'Welche Schreibweise ist richtig?',['konsequent','konzequent','konsekwent','konzeqent'],'konsequent','Das Fremdwort wird „konsequent“ geschrieben.'),

    // das/dass
    S('dd-01','dasdass',6,1,'Setze richtig ein: „Ich weiß, ___ du morgen kommst.“',['dass','das','daß','Dass'],'dass','„dass“ leitet hier einen Nebensatz ein und ist eine Konjunktion.'),
    S('dd-02','dasdass',6,1,'Setze richtig ein: „___ Fahrrad, ___ dort steht, gehört Mia.“',['Das … das','Dass … das','Das … dass','Dass … dass'],'Das … das','Das erste „Das“ ist Artikel, das zweite „das“ Relativpronomen.'),
    S('dd-03','dasdass',6,2,'Welche Probe hilft bei „das“ in „Das Buch, das ich lese“?',['Ersatz durch „welches“','Ersatz durch „weil“','Steigern','Mehrzahl bilden'],'Ersatz durch „welches“','Kann „das“ durch „welches“ ersetzt werden, ist es ein Pronomen – nicht die Konjunktion „dass“.'),
    S('dd-04','dasdass',7,2,'Welche Schreibung ist korrekt?',['Sie hofft, dass das Wetter hält.','Sie hofft, das dass Wetter hält.','Sie hofft, das das Wetter hält.','Sie hofft dass, das Wetter hält.'],'Sie hofft, dass das Wetter hält.','„dass“ leitet den Nebensatz ein; „das“ gehört als Artikel zu „Wetter“.'),

    // Getrennt/Zusammen
    S('gz-01','together',6,1,'Welche Schreibweise ist korrekt?',['Rad fahren','radfahren','Radfahren gehen','rad fahren'],'Rad fahren','Verbindungen aus Nomen + Verb werden in dieser Verwendung getrennt geschrieben.'),
    S('gz-02','together',6,2,'Welche Schreibweise ist korrekt?',['stattfinden','statt finden','Stattfinden','statt-finden'],'stattfinden','„stattfinden“ ist eine feste Verbverbindung und wird zusammengeschrieben.'),
    S('gz-03','together',7,2,'Welche Schreibweise passt zur Bedeutung „ohne Fahrschein fahren“?',['schwarzfahren','schwarz fahren','Schwarz fahren','schwarz-fahren'],'schwarzfahren','Durch die übertragene Gesamtbedeutung entsteht ein zusammengeschriebenes Verb.'),
    S('gz-04','together',7,3,'Welche Schreibweise passt, wenn eine Wand tatsächlich schwarz gestrichen wird?',['schwarz malen','schwarzmalen','Schwarzmalen','schwarz-malen'],'schwarz malen','Hier beschreibt „schwarz“ konkret die Farbe; deshalb getrennt.'),
    S('gz-05','together',8,3,'Welche Schreibweise ist korrekt?',['spazieren gehen','spazierengehen','Spazieren gehen','spazieren-gehen'],'spazieren gehen','Verb + Verb wird in dieser Verbindung getrennt geschrieben.'),
    S('gz-06','together',9,4,'Welche Schreibweise ist korrekt?',['zurückkommen','zurück kommen','Zurückkommen','zurück-kommen'],'zurückkommen','„zurück-“ ist hier ein Verbzusatz und bildet mit „kommen“ ein Verb.'),

    // Zeichensetzung
    S('pun-01','punctuation',5,1,'Wo gehört das Komma?',['Tom kauft Äpfel, Birnen und Bananen.','Tom kauft, Äpfel Birnen und Bananen.','Tom kauft Äpfel Birnen, und Bananen.','Kein Komma nötig.'],'Tom kauft Äpfel, Birnen und Bananen.','In einer Aufzählung werden gleichrangige Teile durch Komma getrennt.'),
    S('pun-02','punctuation',6,2,'Welche Zeichensetzung ist korrekt?',['Ich bleibe zu Hause, weil ich krank bin.','Ich bleibe, zu Hause weil ich krank bin.','Ich bleibe zu Hause weil, ich krank bin.','Ich bleibe zu Hause weil ich krank bin.'],'Ich bleibe zu Hause, weil ich krank bin.','Nebensätze werden durch Komma vom Hauptsatz getrennt.'),
    S('pun-03','punctuation',6,2,'Welche Form ist korrekt?',['Mia sagt: „Ich komme später.“','Mia sagt „: Ich komme später.“','Mia sagt, „Ich komme später“.','Mia sagt: Ich komme später.'],'Mia sagt: „Ich komme später.“','Nach dem Begleitsatz steht hier ein Doppelpunkt; die wörtliche Rede steht in Anführungszeichen.'),
    S('pun-04','punctuation',7,3,'Welche Zeichensetzung ist korrekt?',['Um pünktlich zu sein, fährt er früher los.','Um pünktlich zu sein fährt, er früher los.','Um, pünktlich zu sein fährt er früher los.','Um pünktlich zu sein fährt er früher los.'],'Um pünktlich zu sein, fährt er früher los.','Die mit „um“ eingeleitete Infinitivgruppe wird durch Komma abgetrennt.'),
    S('pun-05','punctuation',8,3,'Welche Zeichensetzung ist korrekt?',['Frau Kern, unsere Trainerin, beginnt die Stunde.','Frau Kern unsere Trainerin, beginnt die Stunde.','Frau Kern, unsere Trainerin beginnt die Stunde.','Frau Kern unsere Trainerin beginnt, die Stunde.'],'Frau Kern, unsere Trainerin, beginnt die Stunde.','Eine Apposition wird durch Kommas eingeschlossen.'),
    S('pun-06','punctuation',9,4,'Welche Schreibweise ist korrekt?',['Jonas’ Fahrrad','Jonas’s Fahrrad','Jona’s Fahrrad','Jonas Fahrrad'],'Jonas’ Fahrrad','Bei Namen auf s-Laut markiert der Apostroph den Genitiv ohne zusätzliche s-Endung.'),

    // Wortarten
    S('wc-01','wordclass',5,1,'Welche Wortart ist „schnell“ in „Der schnelle Zug fährt ab“?',['Adjektiv','Adverb','Nomen','Verb'],'Adjektiv','„schnelle“ beschreibt das Nomen „Zug“ näher.'),
    S('wc-02','wordclass',5,1,'Welche Wortart ist „wir“?',['Personalpronomen','Artikel','Adjektiv','Konjunktion'],'Personalpronomen','„wir“ steht für Personen und ist ein Personalpronomen.'),
    S('wc-03','wordclass',5,2,'Welche Wortart ist „unter“ in „unter dem Tisch“?',['Präposition','Adverb','Verb','Artikel'],'Präposition','„unter“ stellt eine Beziehung her und verlangt hier den Dativ.'),
    S('wc-04','wordclass',6,2,'Welche Wortart ist „aber“ in „Ich komme, aber später“?',['Konjunktion','Adverb','Pronomen','Adjektiv'],'Konjunktion','„aber“ verbindet Satzteile bzw. Sätze.'),
    S('wc-05','wordclass',6,2,'Welche Wortart ist „mein“ in „mein Heft“?',['Possessivpronomen','Personalpronomen','Artikel','Adverb'],'Possessivpronomen','„mein“ zeigt Besitz/Zugehörigkeit an.'),
    S('wc-06','wordclass',7,2,'Welche Wortart ist „dieser“ in „Dieser Weg ist kürzer“?',['Demonstrativpronomen','Relativpronomen','Personalpronomen','Konjunktion'],'Demonstrativpronomen','„dieser“ weist auf etwas hin.'),
    S('wc-07','wordclass',7,3,'Welche Wortart ist „der“ in „Der Schüler, der lacht, ...“ beim zweiten „der“?',['Relativpronomen','Artikel','Demonstrativpronomen','Präposition'],'Relativpronomen','Das zweite „der“ leitet einen Relativsatz ein und bezieht sich auf „Schüler“.'),
    S('wc-08','wordclass',8,3,'Welche Wortart ist „trotzdem“?',['Adverb','Konjunktion','Adjektiv','Pronomen'],'Adverb','„trotzdem“ ist ein Adverb und kann selbständig ein Satzglied bilden.'),
    S('wc-09','wordclass',9,4,'Welche Wortart ist „obwohl“?',['unterordnende Konjunktion','Adverb','Präposition','Relativpronomen'],'unterordnende Konjunktion','„obwohl“ leitet einen Nebensatz ein.'),

    // Satzglieder
    S('sg-01','sentenceparts',5,1,'Welches Satzglied ist „Die neue Schülerin“?',['Subjekt','Akkusativobjekt','Dativobjekt','Prädikat'],'Subjekt','Das Subjekt beantwortet die Frage „Wer oder was?“: Die neue Schülerin kommt.' ,'Die neue Schülerin kommt heute früher.'),
    S('sg-02','sentenceparts',5,1,'Welches Satzglied ist „den Ball“?',['Akkusativobjekt','Subjekt','Dativobjekt','Lokaladverbiale'],'Akkusativobjekt','Frageprobe: Wen oder was wirft Ben? – den Ball.','Ben wirft den Ball weit.'),
    S('sg-03','sentenceparts',5,2,'Welches Satzglied ist „seiner Schwester“?',['Dativobjekt','Genitivobjekt','Subjekt','Temporaladverbiale'],'Dativobjekt','Frageprobe: Wem hilft Amir? – seiner Schwester.','Amir hilft seiner Schwester am Nachmittag.'),
    S('sg-04','sentenceparts',5,2,'Welches Satzglied ist „morgen“?',['Temporaladverbiale','Lokaladverbiale','Modaladverbiale','Akkusativobjekt'],'Temporaladverbiale','„morgen“ beantwortet die Frage „Wann?“','Wir schreiben morgen einen Test.'),
    S('sg-05','sentenceparts',5,2,'Welches Satzglied ist „im Park“?',['Lokaladverbiale','Temporaladverbiale','Dativobjekt','Prädikat'],'Lokaladverbiale','„im Park“ beantwortet die Frage „Wo?“','Die Klasse trifft sich im Park.'),
    S('sg-06','sentenceparts',7,3,'Welches Satzglied ist „wegen des Regens“?',['Kausaladverbiale','Finaladverbiale','Genitivobjekt','Modaladverbiale'],'Kausaladverbiale','Die Angabe nennt einen Grund: Warum? – wegen des Regens.','Wegen des Regens fällt das Training aus.'),
    S('sg-07','sentenceparts',8,3,'Welches Satzglied ist „für die Prüfung“?',['Finaladverbiale','Kausaladverbiale','Akkusativobjekt','Lokaladverbiale'],'Finaladverbiale','Die Angabe nennt einen Zweck/ein Ziel: Wozu? – für die Prüfung.','Für die Prüfung wiederholt Lena jeden Abend.'),
    S('sg-08','sentenceparts',8,4,'Welche Funktion hat „mit dem roten Umschlag“?',['Attribut zum Nomen','Dativobjekt','Modaladverbiale','Prädikat'],'Attribut zum Nomen','Die Wortgruppe beschreibt „Buch“ näher und ist Teil des Satzglieds.','Das Buch mit dem roten Umschlag liegt hier.'),

    // Satzbau
    S('sb-01','sentencebuild',6,1,'Was ist das? „Ich lerne, weil morgen die Probe stattfindet.“',['Satzgefüge','Satzreihe','einfacher Hauptsatz','Fragesatz'],'Satzgefüge','Ein Hauptsatz und ein untergeordneter Nebensatz bilden ein Satzgefüge.'),
    S('sb-02','sentencebuild',6,2,'Was ist das? „Ich lerne und meine Schwester liest.“',['Satzreihe','Satzgefüge','Nebensatz','Infinitivgruppe'],'Satzreihe','Zwei gleichrangige Hauptsätze sind miteinander verbunden.'),
    S('sb-03','sentencebuild',7,2,'Woran erkennst du einen typischen Nebensatz?',['Das finite Verb steht häufig am Ende.','Er beginnt immer mit einem Nomen.','Er enthält nie ein Subjekt.','Er hat immer genau fünf Wörter.'],'Das finite Verb steht häufig am Ende.','In eingeleiteten Nebensätzen steht das finite Verb typischerweise am Ende.'),
    S('sb-04','sentencebuild',7,3,'Welche Art Gliedsatz ist „Dass du kommst, freut mich.“?',['Subjektsatz','Objektsatz','Relativsatz','Kausalsatz'],'Subjektsatz','Der Nebensatz übernimmt die Funktion des Subjekts: Was freut mich? – Dass du kommst.'),
    S('sb-05','sentencebuild',7,3,'Welche Art Gliedsatz ist „Ich weiß, dass du kommst.“?',['Objektsatz','Subjektsatz','Relativsatz','Temporalsatz'],'Objektsatz','Der Nebensatz übernimmt die Funktion eines Objekts: Was weiß ich? – dass du kommst.'),
    S('sb-06','sentencebuild',8,3,'Welche Konstruktion enthält einen Attributsatz?',['Das Buch, das hier liegt, gehört mir.','Weil es regnet, bleiben wir hier.','Ich weiß, dass er kommt.','Wir laufen, um fit zu bleiben.'],'Das Buch, das hier liegt, gehört mir.','Der Relativsatz „das hier liegt“ beschreibt das Nomen „Buch“ näher.'),

    // Zeitformen
    S('ten-01','tense',5,1,'Welche Zeitform? „Mila spielt Fußball.“',['Präsens','Präteritum','Perfekt','Futur I'],'Präsens','„spielt“ steht im Präsens.'),
    S('ten-02','tense',5,1,'Welche Zeitform? „Mila spielte Fußball.“',['Präteritum','Präsens','Perfekt','Plusquamperfekt'],'Präteritum','„spielte“ ist Präteritum.'),
    S('ten-03','tense',5,2,'Welche Zeitform? „Mila hat Fußball gespielt.“',['Perfekt','Präteritum','Präsens','Futur I'],'Perfekt','Hilfsverb „hat“ + Partizip II bilden das Perfekt.'),
    S('ten-04','tense',6,2,'Welche Zeitform? „Mila hatte Fußball gespielt.“',['Plusquamperfekt','Perfekt','Präteritum','Futur II'],'Plusquamperfekt','„hatte“ + Partizip II bilden das Plusquamperfekt.'),
    S('ten-05','tense',6,2,'Welche Zeitform? „Mila wird Fußball spielen.“',['Futur I','Präsens','Perfekt','Futur II'],'Futur I','„wird“ + Infinitiv bilden das Futur I.'),
    S('ten-06','tense',7,3,'Welche Zeitform? „Mila wird Fußball gespielt haben.“',['Futur II','Futur I','Perfekt','Plusquamperfekt'],'Futur II','„wird“ + Partizip II + „haben“ bilden das Futur II.'),

    // Aktiv/Passiv
    S('vo-01','voice',7,2,'Aktiv oder Passiv? „Die Klasse löst die Aufgabe.“',['Aktiv','Passiv','Konjunktiv','Infinitiv'],'Aktiv','Das handelnde Subjekt „die Klasse“ führt die Handlung aus.'),
    S('vo-02','voice',7,2,'Aktiv oder Passiv? „Die Aufgabe wird von der Klasse gelöst.“',['Passiv','Aktiv','Konjunktiv','Plusquamperfekt'],'Passiv','„wird … gelöst“ ist Vorgangspassiv.'),
    S('vo-03','voice',7,3,'Welche Zeitform des Passivs? „Die Tür wurde geöffnet.“',['Präteritum Passiv','Präsens Passiv','Perfekt Passiv','Futur Passiv'],'Präteritum Passiv','„wurde“ + Partizip II kennzeichnen das Passiv im Präteritum.'),
    S('vo-04','voice',8,3,'Welche Form ist korrektes Passiv Präsens zu „Der Hausmeister schließt die Tür“?',['Die Tür wird vom Hausmeister geschlossen.','Die Tür wurde vom Hausmeister geschlossen.','Die Tür hat der Hausmeister geschlossen.','Die Tür wird den Hausmeister schließen.'],'Die Tür wird vom Hausmeister geschlossen.','Präsens Passiv: werden im Präsens + Partizip II.'),

    // Wortbildung/Sprache
    S('wf-01','wordformation',7,2,'Was ist der Wortstamm von „unfreundlich“?',['freund','un','lich','freundlich'],'freund','„un-“ ist Vorsilbe, „-lich“ Nachsilbe; der Stamm lautet „freund“.'),
    S('wf-02','wordformation',7,2,'Welcher Oberbegriff passt zu „Bus, Bahn, Fahrrad, Auto“?',['Verkehrsmittel','Gebäude','Berufe','Gefühle'],'Verkehrsmittel','Alle Wörter bezeichnen Verkehrsmittel.'),
    S('wf-03','wordformation',7,2,'Welches Wort ist ein Synonym zu „rasch“?',['schnell','laut','breit','selten'],'schnell','„rasch“ und „schnell“ haben hier eine sehr ähnliche Bedeutung.'),
    S('wf-04','wordformation',8,3,'Welche Endung ist typisch für viele Fremdwörter?',['-tion','-chen','-lein','-tum'],'-tion','Viele Fremdwörter enden auf -tion, z. B. Information oder Produktion.'),
    S('wf-05','wordformation',8,3,'Wie ist „Schulweg“ gebildet?',['Zusammensetzung aus zwei Nomen','Ableitung mit Vorsilbe','Steigerung','Kurzwort'],'Zusammensetzung aus zwei Nomen','„Schule“ + „Weg“ bilden ein zusammengesetztes Nomen.'),
    S('wf-06','wordformation',9,4,'Welches Wort ist ein Antonym zu „optimistisch“?',['pessimistisch','realistisch','interessant','logisch'],'pessimistisch','Ein Antonym bezeichnet eine gegensätzliche Bedeutung.'),

    // Mehrfachkorrektur – eigene, quali-nahe Aufgabenformate
    M('multi-01','spelling',6,2,'In diesem Satz stecken drei Rechtschreibfehler.',[
      { label:'aktuel → aktuell',correct:true,correction:'aktuell' },{ label:'Ergebniss → Ergebnis',correct:true,correction:'Ergebnis' },{ label:'interesant → interessant',correct:true,correction:'interessant' },{ label:'heute → Heute',correct:false,correction:'heute' }
    ],'Richtig sind: aktuell, Ergebnis, interessant.','Das aktuel veröffentlichte Ergebniss ist interesant.'),
    M('multi-02','case',7,2,'Welche Stellen müssen verbessert werden?',[{label:'beim lesen → beim Lesen',correct:true},{label:'etwas neues → etwas Neues',correct:true},{label:'am Abend → am abend',correct:false},{label:'morgen → Morgen',correct:false}], '„beim Lesen“ und „etwas Neues“ sind Nominalisierungen.','Beim lesen entdeckt sie immer etwas neues, das sie am Abend noch beschäftigt.'),
    M('multi-03','dasdass',6,2,'Welche beiden Stellen sind falsch?',[{label:'das du → dass du',correct:true},{label:'dass Buch → das Buch',correct:true},{label:'das dort liegt',correct:false},{label:'gelesen hast',correct:false}], 'Die Konjunktion lautet „dass“; vor dem Nomen „Buch“ steht der Artikel „das“.','Ich weiß, das du dass Buch, das dort liegt, schon gelesen hast.'),
    M('multi-04','punctuation',7,3,'Welche Änderungen sind nötig?',[{label:'nach „weiß“ ein Komma',correct:true},{label:'nach „kommst“ ein Komma',correct:false},{label:'vor „weil“ ein Komma',correct:true},{label:'nach „morgen“ ein Komma',correct:false}], 'Nebensätze werden jeweils mit Komma abgetrennt.','Ich weiß dass du kommst weil wir morgen zusammen lernen.'),
    M('multi-05','spelling',8,3,'Finde alle drei fehlerhaften Schreibungen.',[{label:'Möglicher weise → möglicherweise',correct:true},{label:'Rhytmus → Rhythmus',correct:true},{label:'produziren → produzieren',correct:true},{label:'Projekt → projekt',correct:false}], 'Richtig: möglicherweise, Rhythmus, produzieren.','Möglicher weise hilft ein fester Rhytmus dabei, bessere Texte zu produziren.'),
    M('multi-06','case',9,4,'Welche Stellen müssen geändert werden?',[{label:'eines morgens → eines Morgens',correct:true},{label:'im allgemeinen → im Allgemeinen',correct:true},{label:'etwas Besonderes',correct:false},{label:'nach Hause',correct:false}], 'Nach Artikelwörtern werden substantivierte Zeitangaben und Adjektive großgeschrieben.','Eines morgens bemerkte sie, dass im allgemeinen etwas Besonderes passiert, wenn sie früh nach Hause geht.'),
    M('multi-07','wordclass',7,3,'Welche Zuordnungen sind falsch?',[{label:'„dieser“ = Demonstrativpronomen',correct:false},{label:'„weil“ = Präposition',correct:true},{label:'„mein“ = Possessivpronomen',correct:false},{label:'„schnell“ = Nomen',correct:true}], '„weil“ ist eine unterordnende Konjunktion; „schnell“ ist hier kein Nomen.','Prüfe die vier Wortart-Zuordnungen.'),
    M('multi-08','sentenceparts',8,3,'Welche Zuordnungen sind falsch?',[{label:'„morgen“ = Temporaladverbiale',correct:false},{label:'„im Park“ = Lokaladverbiale',correct:false},{label:'„wegen des Regens“ = Kausaladverbiale',correct:false},{label:'„den Ball“ = Dativobjekt',correct:true}], '„den Ball“ ist ein Akkusativobjekt; die anderen Zuordnungen stimmen.','Prüfe die Satzglied-Zuordnungen.'),
    M('multi-09','spelling',9,4,'Welche Schreibungen müssen verbessert werden?',[{label:'konzequent → konsequent',correct:true},{label:'Strasse → Straße',correct:true},{label:'nähmlich → nämlich',correct:true},{label:'Fachbegriffe',correct:false}], 'Richtig sind „konsequent“, „Straße“ und „nämlich“.','Wer konzequent übt, schreibt Wörter wie Strasse und nähmlich sowie viele Fachbegriffe sicherer.'),
    M('multi-10','together',9,4,'Welche beiden Schreibungen sind falsch?',[{label:'Radfahren → Rad fahren',correct:true},{label:'statt finden → stattfinden',correct:true},{label:'spazieren gehen',correct:false},{label:'zurückkommen',correct:false}], '„Rad fahren“ wird getrennt, „stattfinden“ zusammen geschrieben.','Am Wochenende möchte ich Radfahren, danach soll ein Treffen statt finden und später wollen wir spazieren gehen und pünktlich zurückkommen.')
  ];

  function gradeNumber(value) { return value === 'qa' ? 9 : Number(value || 9); }
  function availableSkills(grade) {
    const n = gradeNumber(grade);
    return Object.entries(SKILLS).filter(([, meta]) => meta.minGrade <= n).map(([id]) => id);
  }

  function eligibleTasks(config, skill) {
    const g = gradeNumber(config.grade);
    const level = LEVEL_NUM[config.level] || 2;
    const qa = config.grade === 'qa';
    return TASKS.filter(t => t.skill === skill && t.grade <= g && (qa ? t.difficulty >= 2 : t.difficulty <= Math.min(4, level + 1)) && (level === 1 ? t.difficulty <= 2 : t.difficulty >= Math.max(1, level - 1)));
  }

  function prepareTask(rng, source) {
    const t = JSON.parse(JSON.stringify(source));
    if (t.type === 'single') {
      t.options = shuffle(rng, t.options);
    } else {
      t.options = shuffle(rng, t.options).map((o, index) => ({ ...o, key: `m${index}` }));
    }
    return t;
  }

  function createEngine(config) {
    const rng = rngFactory(config.seed >>> 0);
    const allowed = (config.skills?.length ? config.skills : availableSkills(config.grade)).filter(id => SKILLS[id]);
    const pools = new Map();
    for (const skill of allowed) {
      const pool = eligibleTasks(config, skill);
      if (pool.length) pools.set(skill, pool);
    }
    const activeSkills = [...pools.keys()];
    if (!activeSkills.length) throw new Error('Für diese Auswahl stehen noch keine Aufgaben bereit.');
    let skillCycle = [];
    const seen = new Map();
    function nextSkill() {
      if (!skillCycle.length) skillCycle = shuffle(rng, activeSkills);
      return skillCycle.shift();
    }
    function next() {
      const skill = nextSkill();
      const pool = pools.get(skill);
      const used = seen.get(skill) || new Set();
      let candidates = pool.filter(t => !used.has(t.id));
      if (!candidates.length) { used.clear(); candidates = pool; }
      const source = pick(rng, candidates);
      used.add(source.id); seen.set(skill, used);
      return prepareTask(rng, source);
    }
    return { next, skills: activeSkills };
  }

  window.FehlerjagdDeutsch = { SKILLS, GRADE_HINTS, LEVEL_LABEL, LEVEL_NUM, availableSkills, createEngine };
})();
