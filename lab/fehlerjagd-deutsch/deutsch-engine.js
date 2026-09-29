(() => {
  'use strict';

  const SKILLS = {
    strategy: { label: 'Rechtschreibstrategien', short: 'Strategien', group: 'spelling', introducedGrade: 5, recommended: [5,6,7,8,9], desc: 'Schreibungen mit Verlängern, Ableiten, Silben, Wortstamm, Signalwörtern und Merkwörtern begründen.' },
    case: { label: 'Groß- & Kleinschreibung', short: 'Groß/Klein', group: 'spelling', introducedGrade: 5, recommended: [5,6,7,8,9], desc: 'Nomen, Nominalisierungen, Zeitangaben, Namen, Titel und Signalwörter sicher prüfen.' },
    spelling: { label: 'Richtige Schreibweise', short: 'Schreibweise', group: 'spelling', introducedGrade: 5, recommended: [5,6,7,8,9], desc: 'Schärfung, Dehnung, Wortstamm, besondere Schreibungen, Fremd- und Fachwörter.' },
    dasdass: { label: 'das / dass', short: 'das/dass', group: 'spelling', introducedGrade: 6, recommended: [6,7,8,9], desc: 'Artikel, Pronomen und Konjunktion unterscheiden und mit einer Probe begründen.' },
    together: { label: 'Getrennt & zusammen', short: 'Getr./Zus.', group: 'spelling', introducedGrade: 6, recommended: [6,7,8,9], desc: 'Wortverbindungen mithilfe von Bedeutung und Proben richtig schreiben.' },
    punctuation: { label: 'Zeichensetzung', short: 'Zeichen', group: 'spelling', introducedGrade: 5, recommended: [5,6,7,8,9], desc: 'Aufzählung, wörtliche Rede, Haupt-/Nebensatz, Infinitivgruppe, Einschub, Gedankenstrich und Apostroph.' },
    wordclass: { label: 'Wortarten', short: 'Wortarten', group: 'grammar', introducedGrade: 5, recommended: [5,6,7,8,9], desc: 'Wortarten im Satz bestimmen und ihre Funktion erklären.' },
    sentenceparts: { label: 'Satzglieder', short: 'Satzglieder', group: 'grammar', introducedGrade: 5, recommended: [5,6,7,8,9], desc: 'Subjekt, Prädikat, Objekte, Adverbialbestimmungen und später Attribute sicher bestimmen.' },
    sentencebuild: { label: 'Satzbau', short: 'Satzbau', group: 'grammar', introducedGrade: 5, recommended: [5,6,7,8,9], desc: 'Haupt-/Nebensatz, Satzreihe, Satzgefüge, Gliedsätze und komplexe Satzstrukturen.' },
    tense: { label: 'Zeitformen', short: 'Zeitformen', group: 'grammar', introducedGrade: 5, recommended: [5,6,7,8,9], desc: 'Zeitformen erkennen, bilden und in einer sinnvollen Zeitenfolge verwenden.' },
    voice: { label: 'Aktiv & Passiv', short: 'Aktiv/Passiv', group: 'grammar', introducedGrade: 6, recommended: [6,7,8,9], desc: 'Aktiv und Passiv erkennen, bilden und die Handlungsrichtung unterscheiden.' },
    mood: { label: 'Konjunktiv & indirekte Rede', short: 'Konjunktiv', group: 'grammar', introducedGrade: 7, recommended: [7,8,9], desc: 'Konjunktiv I und II erkennen und Äußerungen zunehmend sicher indirekt wiedergeben.' },
    wordformation: { label: 'Wortbildung & Wortschatz', short: 'Wortbildung', group: 'grammar', introducedGrade: 5, recommended: [5,6,7,8,9], desc: 'Wortstamm, Grund-/Bestimmungswort, Vor-/Nachsilben, Ableitung, Zusammensetzung und Bedeutungsbeziehungen.' }
  };

  const GRADE_HINTS = {
    '5': 'Schwerpunkt in Jgst. 5: bekannte Rechtschreibprinzipien sichern; Signalwörter für Großschreibung; Nomen, Verben, Adjektive, Artikel sowie Personal- und Possessivpronomen; grundlegende Satzglieder; Präsens, Präteritum und Perfekt; Haupt- und Nebensätze sowie grundlegende Wortbildung.',
    '6': 'Neu bzw. deutlich erweitert in Jgst. 6: Präpositionen und Konjunktionen, Plusquamperfekt und Futur I, Aktiv/Passiv, verschiedene Nebensätze, das/dass, erste Proben zur Getrennt- und Zusammenschreibung sowie sicherere Fehlerkorrektur.',
    '7': 'Neu bzw. deutlich erweitert in Jgst. 7: Relativ- und Demonstrativpronomen, Futur II und Konjunktiv I, Satzreihe/Satzgefüge, Kausaladverbiale, Subjekt- und Objektsätze sowie weiterführende Getrennt-/Zusammenschreibung.',
    '8': 'Neu bzw. deutlich erweitert in Jgst. 8: Konjunktiv I und II sowie indirekte Rede, Finaladverbiale und Attribute, komplexere Satzstrukturen, Fremd- und Fachwörter, Bedeutungsunterschiede bei Schreibvarianten sowie anspruchsvollere Zeichensetzung.',
    '9': 'Schwerpunkt in Jgst. 9: bekannte Grammatik sicher anwenden; Großschreibung nach Numeralien sowie von Namen und Titeln; Zweifelsfälle der Getrennt-/Zusammenschreibung; Fremd- und Fachwörter; Gedankenstrich und Apostroph; eigene Fehlerschwerpunkte gezielt bearbeiten.',
    qa: 'Quali-Training: eigener Aufgabenmix nach den offiziellen Kompetenzbereichen Rechtschreiben und Sprachbetrachtung. Im Mittelpunkt stehen Erkennen, Korrigieren und Begründen – nicht bloß Auswendigwissen.'
  };

  const LEVEL_LABEL = { n1: 'Niveau 1', n2: 'Niveau 2', n3: 'Niveau 3', n4: 'Niveau 4' };
  const LEVEL_NUM = { n1: 1, n2: 2, n3: 3, n4: 4 };
  const LEVEL_RANGE = { n1: [1,2], n2: [1,2], n3: [2,3], n4: [3,4] };

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
    // RECHTSCHREIBSTRATEGIEN
    S('str-01','strategy',5,1,'Wie kannst du den Endlaut in „Hund“ sicher überprüfen?',['Verlängern: Hunde','Steigern: am hundesten','Artikelprobe','Merkwort lernen'],'Verlängern: Hunde','Durch das Verlängern wird der Endlaut hörbar: Hund – Hunde.'),
    S('str-02','strategy',5,1,'Welche Strategie erklärt das ä in „Bäume“?',['Ableiten: Baum → Bäume','Verlängern: Bäume → Bäumen','Artikelprobe','Silben klatschen'],'Ableiten: Baum → Bäume','Das verwandte Wort „Baum“ zeigt, dass „Bäume“ mit ä geschrieben wird.'),
    S('str-03','strategy',5,2,'Warum wird „Hoffnung“ großgeschrieben?',['Die Endung -ung ist ein typisches Nomen-Signal.','Nach langem Vokal schreibt man groß.','Wörter mit ff sind immer Nomen.','Das Wort steht nach einem Verb.'],'Die Endung -ung ist ein typisches Nomen-Signal.','Endungen wie -ung, -heit, -keit, -schaft, -nis und -tum können auf Nomen hinweisen.'),
    S('str-04','strategy',5,2,'Welche Strategie hilft bei „rennt“?',['Grundform/Wortfamilie prüfen: rennen → rennt','Artikelprobe','Steigern','Mehrzahl bilden'],'Grundform/Wortfamilie prüfen: rennen → rennt','Die Grundform „rennen“ zeigt den Wortstamm und die Doppelkonsonanz.'),
    S('str-05','strategy',5,2,'Wie hilft dir die Silbenprobe bei „kommen“?',['Die erste Silbe endet geschlossen; der kurze Vokal wird durch Doppelkonsonant markiert.','Man hört ein Dehnungs-h.','Die zweite Silbe ist betont.','Die Silbenprobe zeigt Großschreibung.'],'Die erste Silbe endet geschlossen; der kurze Vokal wird durch Doppelkonsonant markiert.','Bei vielen Wörtern hilft der Blick auf offene und geschlossene Silben, um Vokallänge und Konsonantenschreibung zu sichern.'),
    S('str-06','strategy',6,2,'Wie prüfst du „das“ in „Das Heft, das hier liegt“?',['Ersatzprobe: „welches“ passt.','Steigerungsprobe','Verlängerungsprobe','Silbenprobe'],'Ersatzprobe: „welches“ passt.','Kann „das“ durch „welches“ ersetzt werden, ist es ein Pronomen und wird mit einem s geschrieben.'),
    S('str-07','strategy',6,2,'Welche Probe hilft bei „Rad fahren“?',['Wortgruppe erweitern/umstellen und die selbständige Bedeutung der Teile prüfen.','Mehrzahlprobe','Steigerungsprobe','Endlaut verlängern'],'Wortgruppe erweitern/umstellen und die selbständige Bedeutung der Teile prüfen.','Bei Getrennt- und Zusammenschreibung helfen grammatische Proben und die Frage, ob eine feste Gesamtbedeutung entstanden ist.'),
    S('str-08','strategy',7,3,'Warum schreibt man „im Allgemeinen“ groß?',['„im“ = „in dem“; das Adjektiv wird nominalisiert.','Alle Adverbien werden großgeschrieben.','Die Endung -en erzwingt Großschreibung.','Es handelt sich um einen Eigennamen.'],'„im“ = „in dem“; das Adjektiv wird nominalisiert.','Der versteckte Artikel in „im“ zeigt die Nominalisierung an.'),
    S('str-09','strategy',8,3,'Welche Strategie ist bei „Rhythmus“ am zuverlässigsten?',['Als Fremd-/Merkwort sichern und ggf. nachschlagen.','Verlängern','Artikelprobe','Steigern'],'Als Fremd-/Merkwort sichern und ggf. nachschlagen.','Bei Fremdwörtern reichen Lautregeln oft nicht. Wörterbuch und bewusste Merkhilfen sind hier geeignete Strategien.'),
    S('str-10','strategy',9,4,'Warum wird „die Zweite“ in „Sie wurde die Zweite“ großgeschrieben?',['Die Ordnungszahl wird substantivisch gebraucht.','Zahlwörter schreibt man immer groß.','Nach „die“ steht immer ein Nomen.','Weil „Zweite“ am Satzende steht.'],'Die Ordnungszahl wird substantivisch gebraucht.','Wird ein Zahlwort wie ein Nomen verwendet und von einem Artikel begleitet, wird es großgeschrieben.'),

    // GROSS- UND KLEINSCHREIBUNG
    S('case-01','case',5,1,'Welche Schreibweise ist richtig?',['die große Hoffnung','die große hoffnung','die Große Hoffnung','die Große hoffnung'],'die große Hoffnung','„Hoffnung“ ist ein Nomen und wird großgeschrieben; „große“ ist ein Adjektiv.'),
    S('case-02','case',5,1,'Welche Schreibweise ist richtig?',['das neue Fahrrad','das Neue Fahrrad','das neue fahrrad','Das neue Fahrrad'],'das neue Fahrrad','Im Satzinneren wird nur das Nomen „Fahrrad“ großgeschrieben.'),
    S('case-03','case',5,2,'Welches Wort muss großgeschrieben werden? „Wir erleben heute etwas ___ .“',['Besonderes','besonderes','BESONDERES','besonderEs'],'Besonderes','Das Signalwort „etwas“ nominalisiert das Adjektiv: etwas Besonderes.'),
    S('case-04','case',6,2,'Welche Schreibweise ist richtig?',['beim Lesen','beim lesen','Beim Lesen','beim LESEN'],'beim Lesen','„beim“ bedeutet „bei dem“; das Verb „lesen“ wird dadurch nominalisiert.'),
    S('case-05','case',6,2,'Welche Schreibweise ist richtig?',['Sie liebt das Schwimmen.','Sie liebt das schwimmen.','Sie liebt Das Schwimmen.','Sie liebt das Schwimmen'],'Sie liebt das Schwimmen.','Der Artikel „das“ macht aus dem Verb eine Nominalisierung: das Schwimmen.'),
    S('case-06','case',7,3,'Welche Schreibweise ist richtig?',['eines Morgens','eines morgens','Eines morgens','eines MORGens'],'eines Morgens','Nach „eines“ wird die Zeitangabe substantivisch gebraucht und großgeschrieben.'),
    S('case-07','case',8,3,'Welche Schreibung ist korrekt?',['Münchner Altstadt','münchner Altstadt','Münchner altstadt','münchner altstadt'],'Münchner Altstadt','Ableitungen von Ortsnamen auf -er werden großgeschrieben; „Altstadt“ ist ein Nomen.'),
    S('case-08','case',8,4,'Welche Schreibweise ist richtig?',['Ludwig-Maximilians-Universität','ludwig-maximilians-universität','Ludwig maximilians Universität','Ludwig-Maximilians-universität'],'Ludwig-Maximilians-Universität','Mehrteilige Eigennamen werden entsprechend ihrer Namensschreibung großgeschrieben und hier mit Bindestrichen verbunden.'),
    S('case-09','case',9,4,'Welche Schreibweise ist korrekt?',['der Erste Bürgermeister','der erste Bürgermeister','der Erste bürgermeister','der erste bürgermeister'],'der Erste Bürgermeister','Bei Amts- und Funktionsbezeichnungen kann die Großschreibung Teil der offiziellen Bezeichnung sein; hier ist „Erste Bürgermeister“ als Titel gemeint.'),

    // RICHTIGE SCHREIBWEISE
    S('spell-01','spelling',5,1,'Welche Schreibweise ist richtig?',['Fahrrad','Fahrad','Farrad','Fahrradt'],'Fahrrad','Das zusammengesetzte Wort enthält die Wortstämme „fahr-“ und „Rad“: Fahrrad.'),
    S('spell-02','spelling',5,1,'Welche Schreibweise ist richtig?',['Mutter','Muter','Mudder','Muttter'],'Mutter','Der kurze betonte Vokal wird hier durch den Doppelkonsonanten tt markiert.'),
    S('spell-03','spelling',5,2,'Welche Schreibweise ist richtig?',['Zahl','Zal','Zhaal','Zall'],'Zahl','Das Dehnungs-h gehört zur Schreibung des Wortes „Zahl“.'),
    S('spell-04','spelling',5,2,'Welche Schreibweise ist richtig?',['Jacke','Jakke','Jake','Jackke'],'Jacke','Nach kurzem Vokal wird der k-Laut häufig mit ck geschrieben: Jacke.'),
    S('spell-05','spelling',6,2,'Welche Schreibweise ist richtig?',['nämlich','nähmlich','nemlich','nehmlich'],'nämlich','„nämlich“ ist ein Merkwort: Es wird mit ä und ohne h nach dem ä geschrieben.'),
    S('spell-06','spelling',6,2,'Welche Schreibweise ist richtig?',['Ergebnis','Ergebniss','Ergebnies','Ergäbnis'],'Ergebnis','Die Endung lautet -nis. Im Singular steht nur ein s.'),
    S('spell-07','spelling',6,2,'Welche Schreibweise ist richtig?',['müssen','müßen','müsen','müsssen'],'müssen','Nach dem kurzen Vokal ü steht ss.'),
    S('spell-08','spelling',7,3,'Welche Schreibweise ist richtig?',['interessant','interesant','interressant','interresant'],'interessant','Das Fremdwort wird mit einem r und Doppel-s geschrieben.'),
    S('spell-09','spelling',7,3,'Welche Schreibweise ist richtig?',['Adresse','Addresse','Adrese','Addrese'],'Adresse','„Adresse“ ist ein häufiges Fremdwort mit Doppel-s.'),
    S('spell-10','spelling',8,3,'Welche Schreibweise ist richtig?',['produzieren','produtzieren','produziren','produzihren'],'produzieren','Verben auf -ieren werden mit -ieren geschrieben.'),
    S('spell-11','spelling',8,3,'Welche Schreibweise ist richtig?',['Information','Informazion','Informatsion','Informashion'],'Information','Viele Fremdwörter werden mit der Endung -tion geschrieben.'),
    S('spell-12','spelling',8,4,'Welche Schreibweise ist richtig?',['Rhythmus','Rythmus','Rhytmus','Rhythmuss'],'Rhythmus','„Rhythmus“ ist ein Fremd-/Merkwort mit besonderer Schreibung.'),
    S('spell-13','spelling',9,4,'Welche Schreibweise ist richtig?',['konsequent','konzequent','konsekwent','konseqent'],'konsequent','Das Fremdwort wird „konsequent“ geschrieben; die Buchstabenfolge -qu- bleibt erhalten.'),
    S('spell-14','spelling',9,4,'Welche Schreibweise ist richtig?',['professionell','proffessionell','professionel','profesionell'],'professionell','„professionell“ endet auf -ell und enthält Doppel-s.'),

    // DAS / DASS
    S('dd-01','dasdass',6,1,'Setze richtig ein: „Ich weiß, ___ du morgen kommst.“',['dass','das','daß','Dass'],'dass','„dass“ leitet einen Nebensatz ein und ist eine Konjunktion.'),
    S('dd-02','dasdass',6,1,'Setze richtig ein: „___ Fahrrad gehört Mia.“',['Das','Dass','das','dass'],'Das','Vor dem Nomen „Fahrrad“ steht der Artikel „das“; am Satzanfang wird er großgeschrieben.'),
    S('dd-03','dasdass',6,2,'Welche Schreibung ist korrekt?',['Das Buch, das hier liegt, ist neu.','Dass Buch, das hier liegt, ist neu.','Das Buch, dass hier liegt, ist neu.','Dass Buch, dass hier liegt, ist neu.'],'Das Buch, das hier liegt, ist neu.','Das erste „Das“ ist Artikel; das zweite „das“ ist Relativpronomen und lässt sich durch „welches“ ersetzen.'),
    S('dd-04','dasdass',6,2,'Welche Probe hilft bei „das“ in „Das Heft, das ich suche“?',['Ersatz durch „welches“','Ersatz durch „weil“','Steigerungsprobe','Mehrzahlprobe'],'Ersatz durch „welches“','Wenn „welches“ passt, handelt es sich um ein Pronomen: das.'),
    S('dd-05','dasdass',7,3,'Welche Schreibung ist korrekt?',['Sie hofft, dass das Wetter hält.','Sie hofft, das dass Wetter hält.','Sie hofft das, das Wetter hält.','Sie hofft dass das Wetter hält.'],'Sie hofft, dass das Wetter hält.','„dass“ leitet den Nebensatz ein; „das“ ist Artikel zu „Wetter“. Vor dem Nebensatz steht ein Komma.'),
    S('dd-06','dasdass',8,3,'Welche Begründung ist richtig? „Das ist das Ergebnis, das wir erwartet haben.“',['Alle drei Formen sind „das“: Pronomen, Artikel, Relativpronomen.','Das letzte Wort müsste „dass“ heißen.','Alle drei Formen sind Artikel.','Das erste Wort müsste „dass“ heißen.'],'Alle drei Formen sind „das“: Pronomen, Artikel, Relativpronomen.','Die Funktion entscheidet: hinweisendes Pronomen, Artikel vor „Ergebnis“, Relativpronomen mit Ersatzprobe „welches“.'),

    // GETRENNT- UND ZUSAMMENSCHREIBUNG
    S('gz-01','together',6,1,'Welche Schreibweise ist korrekt?',['Rad fahren','Radfahren','rad fahren','Rad-fahren'],'Rad fahren','Verbindungen aus Nomen und Verb werden in dieser Verwendung getrennt geschrieben.'),
    S('gz-02','together',6,2,'Welche Schreibweise ist korrekt?',['stattfinden','statt finden','Stattfinden','statt-finden'],'stattfinden','„stattfinden“ bildet ein festes Verb und wird zusammengeschrieben.'),
    S('gz-03','together',6,2,'Welche Schreibweise ist korrekt?',['teilnehmen','teil nehmen','Teil nehmen','teil-nehmen'],'teilnehmen','„teilnehmen“ ist ein Verb mit festem Verbzusatz und wird zusammengeschrieben.'),
    S('gz-04','together',7,2,'Welche Schreibweise passt zur Bedeutung „ohne Fahrschein fahren“?',['schwarzfahren','schwarz fahren','Schwarz fahren','schwarz-fahren'],'schwarzfahren','Die übertragene Gesamtbedeutung führt zur Zusammenschreibung: schwarzfahren.'),
    S('gz-05','together',7,3,'Welche Schreibweise passt, wenn eine Fläche tatsächlich schwarz gestrichen wird?',['schwarz malen','schwarzmalen','Schwarzmalen','schwarz-malen'],'schwarz malen','„schwarz“ bezeichnet hier konkret die Farbe und bleibt selbständig; deshalb Getrenntschreibung.'),
    S('gz-06','together',8,3,'Welche Schreibweise ist korrekt?',['spazieren gehen','spazierengehen','Spazierengehen','spazieren-gehen'],'spazieren gehen','Die Verbindung aus zwei Verben wird hier getrennt geschrieben.'),
    S('gz-07','together',8,3,'Welche Schreibweise ist korrekt?',['kennenlernen','kennen lernen','Kennenlernen','kennen-lernen'],'kennenlernen','Das Verb „kennenlernen“ wird zusammengeschrieben.'),
    S('gz-08','together',9,4,'Welche Schreibweise ist korrekt?',['zurückkommen','zurück kommen','Zurückkommen','zurück-kommen'],'zurückkommen','„zurück-“ ist hier ein Verbzusatz; zusammen mit „kommen“ bildet es ein Verb.'),

    // ZEICHENSETZUNG
    S('pun-01','punctuation',5,1,'Welche Zeichensetzung ist korrekt?',['Tom kauft Äpfel, Birnen und Bananen.','Tom kauft, Äpfel Birnen und Bananen.','Tom kauft Äpfel Birnen, und Bananen.','Tom kauft Äpfel Birnen und Bananen.'],'Tom kauft Äpfel, Birnen und Bananen.','Gleichrangige Glieder einer Aufzählung werden durch Kommas getrennt.'),
    S('pun-02','punctuation',5,2,'Welche Form der wörtlichen Rede ist korrekt?',['Mia sagt: „Ich komme später.“','Mia sagt „: Ich komme später.“','Mia sagt, „Ich komme später“.','Mia sagt: Ich komme später.'],'Mia sagt: „Ich komme später.“','Nach dem vorangestellten Begleitsatz steht hier ein Doppelpunkt; die wörtliche Rede steht in Anführungszeichen.'),
    S('pun-03','punctuation',6,2,'Welche Zeichensetzung ist korrekt?',['Ich bleibe zu Hause, weil ich krank bin.','Ich bleibe, zu Hause weil ich krank bin.','Ich bleibe zu Hause weil, ich krank bin.','Ich bleibe zu Hause weil ich krank bin.'],'Ich bleibe zu Hause, weil ich krank bin.','Der Nebensatz wird durch ein Komma vom Hauptsatz getrennt.'),
    S('pun-04','punctuation',6,2,'Welche Zeichensetzung ist korrekt?',['Ich lerne, und meine Schwester liest.','Ich lerne und meine Schwester liest.','Ich lerne und, meine Schwester liest.','Ich, lerne und meine Schwester liest.'],'Ich lerne und meine Schwester liest.','Zwischen mit „und“ verbundenen Hauptsätzen ist hier kein Komma erforderlich.'),
    S('pun-05','punctuation',7,3,'Welche Zeichensetzung ist korrekt?',['Um pünktlich zu sein, fährt er früher los.','Um pünktlich zu sein fährt, er früher los.','Um, pünktlich zu sein fährt er früher los.','Um pünktlich zu sein fährt er früher los.'],'Um pünktlich zu sein, fährt er früher los.','Eine mit „um“ eingeleitete Infinitivgruppe wird durch Komma abgetrennt.'),
    S('pun-06','punctuation',7,3,'Welche Zeichensetzung ist korrekt?',['Lena, die neu in der Klasse ist, sitzt vorne.','Lena die neu in der Klasse ist, sitzt vorne.','Lena, die neu in der Klasse ist sitzt vorne.','Lena die neu in der Klasse ist sitzt vorne.'],'Lena, die neu in der Klasse ist, sitzt vorne.','Der eingeschobene Relativsatz wird mit zwei Kommas abgegrenzt.'),
    S('pun-07','punctuation',8,3,'Welche Zeichensetzung ist korrekt?',['Frau Kern, unsere Trainerin, beginnt die Stunde.','Frau Kern unsere Trainerin, beginnt die Stunde.','Frau Kern, unsere Trainerin beginnt die Stunde.','Frau Kern unsere Trainerin beginnt, die Stunde.'],'Frau Kern, unsere Trainerin, beginnt die Stunde.','Eine eingeschobene Apposition wird durch Kommas eingeschlossen.'),
    S('pun-08','punctuation',8,4,'Welches Satzzeichen passt am besten? „Ein Ziel bleibt klar ___ Wir müssen die Fehlerquote senken.“',['Doppelpunkt', 'Komma', 'Apostroph', 'Klammer'],'Doppelpunkt','Der zweite Satz erläutert das zuvor angekündigte Ziel; ein Doppelpunkt passt hier.'),
    S('pun-09','punctuation',9,4,'Welche Schreibweise ist korrekt?',['Jonas’ Fahrrad','Jonas’s Fahrrad','Jona’s Fahrrad','Jonas Fahrrad'],'Jonas’ Fahrrad','Bei Namen auf s-Laut steht im Genitiv nur ein Apostroph, kein zusätzliches s.'),
    S('pun-10','punctuation',9,4,'Welche Zeichensetzung ist stilistisch korrekt?',['Die Lösung – so viel stand fest – musste heute gefunden werden.','Die Lösung, – so viel stand fest – musste heute gefunden werden.','Die Lösung – so viel stand fest, musste heute gefunden werden.','Die Lösung so viel stand fest – musste heute gefunden werden.'],'Die Lösung – so viel stand fest – musste heute gefunden werden.','Ein eingeschobener Zusatz kann mit zwei Gedankenstrichen abgegrenzt werden.'),

    // WORTARTEN
    S('wc-01','wordclass',5,1,'Welche Wortart ist „Haus“?',['Nomen','Verb','Adjektiv','Artikel'],'Nomen','„Haus“ bezeichnet ein Ding und kann mit einem Artikel verbunden werden: das Haus.'),
    S('wc-02','wordclass',5,1,'Welche Wortart ist „laufen“?',['Verb','Nomen','Adjektiv','Artikel'],'Verb','„laufen“ bezeichnet eine Tätigkeit und kann konjugiert werden.'),
    S('wc-03','wordclass',5,1,'Welche Wortart ist „schnell“ in „der schnelle Zug“?',['Adjektiv','Nomen','Verb','Artikel'],'Adjektiv','„schnelle“ beschreibt das Nomen „Zug“ näher.'),
    S('wc-04','wordclass',5,2,'Welche Wortart ist „wir“?',['Personalpronomen','Possessivpronomen','Artikel','Adjektiv'],'Personalpronomen','„wir“ steht stellvertretend für Personen.'),
    S('wc-05','wordclass',5,2,'Welche Wortart ist „unser“ in „unser Heft“?',['Possessivpronomen','Personalpronomen','Verb','Adjektiv'],'Possessivpronomen','„unser“ zeigt Zugehörigkeit bzw. Besitz an.'),
    S('wc-06','wordclass',6,2,'Welche Wortart ist „unter“ in „unter dem Tisch“?',['Präposition','Konjunktion','Adjektiv','Verb'],'Präposition','„unter“ stellt eine Beziehung her und verlangt in diesem Beispiel den Dativ.'),
    S('wc-07','wordclass',6,2,'Welche Wortart ist „weil“?',['Konjunktion','Präposition','Adverb','Artikel'],'Konjunktion','„weil“ verbindet Sätze und leitet einen Nebensatz ein.'),
    S('wc-08','wordclass',7,2,'Welche Wortart ist „dieser“ in „Dieser Weg ist kürzer“?',['Demonstrativpronomen','Relativpronomen','Personalpronomen','Konjunktion'],'Demonstrativpronomen','„dieser“ weist gezielt auf etwas hin.'),
    S('wc-09','wordclass',7,3,'Welche Wortart ist das zweite „der“? „Der Schüler, der lacht, ...“',['Relativpronomen','Artikel','Demonstrativpronomen','Präposition'],'Relativpronomen','Das zweite „der“ leitet einen Relativsatz ein und bezieht sich auf „Schüler“.'),
    S('wc-10','wordclass',8,3,'Welche Wortart ist „trotzdem“ in „Es regnet. Trotzdem gehen wir.“?',['Adverb','Konjunktion','Präposition','Pronomen'],'Adverb','„trotzdem“ ist hier ein Adverb und kann selbständig ein Satzglied bilden.'),
    S('wc-11','wordclass',9,4,'Welche Wortart ist „obwohl“?',['unterordnende Konjunktion','Adverb','Präposition','Relativpronomen'],'unterordnende Konjunktion','„obwohl“ leitet einen Nebensatz ein und ordnet ihn dem Hauptsatz unter.'),

    // SATZGLIEDER
    S('sg-01','sentenceparts',5,1,'Welches Satzglied ist „Die neue Schülerin“?',['Subjekt','Akkusativobjekt','Dativobjekt','Prädikat'],'Subjekt','Frageprobe: Wer kommt heute früher? – Die neue Schülerin.','Die neue Schülerin kommt heute früher.'),
    S('sg-02','sentenceparts',5,1,'Welches Satzglied ist „den Ball“?',['Akkusativobjekt','Subjekt','Dativobjekt','Lokaladverbiale'],'Akkusativobjekt','Frageprobe: Wen oder was wirft Ben? – den Ball.','Ben wirft den Ball weit.'),
    S('sg-03','sentenceparts',5,2,'Welches Satzglied ist „seiner Schwester“?',['Dativobjekt','Genitivobjekt','Subjekt','Temporaladverbiale'],'Dativobjekt','Frageprobe: Wem hilft Amir? – seiner Schwester.','Amir hilft seiner Schwester am Nachmittag.'),
    S('sg-04','sentenceparts',5,2,'Welches Satzglied ist „morgen“?',['Temporaladverbiale','Lokaladverbiale','Modaladverbiale','Akkusativobjekt'],'Temporaladverbiale','„morgen“ beantwortet die Frage „Wann?“.','Wir schreiben morgen einen Test.'),
    S('sg-05','sentenceparts',5,2,'Welches Satzglied ist „im Park“?',['Lokaladverbiale','Temporaladverbiale','Dativobjekt','Prädikat'],'Lokaladverbiale','„im Park“ beantwortet die Frage „Wo?“.','Die Klasse trifft sich im Park.'),
    S('sg-06','sentenceparts',6,2,'Welches Satzglied ist „mit großer Sorgfalt“?',['Modaladverbiale','Lokaladverbiale','Dativobjekt','Subjekt'],'Modaladverbiale','Die Wortgruppe beantwortet die Frage „Wie?“ und beschreibt die Art und Weise.','Mina bearbeitet die Aufgabe mit großer Sorgfalt.'),
    S('sg-07','sentenceparts',7,3,'Welches Satzglied ist „wegen des Regens“?',['Kausaladverbiale','Finaladverbiale','Genitivobjekt','Modaladverbiale'],'Kausaladverbiale','Die Wortgruppe nennt den Grund: Warum fällt das Training aus? – wegen des Regens.','Wegen des Regens fällt das Training aus.'),
    S('sg-08','sentenceparts',8,3,'Welches Satzglied ist „zur Vorbereitung auf die Prüfung“?',['Finaladverbiale','Kausaladverbiale','Akkusativobjekt','Lokaladverbiale'],'Finaladverbiale','Die Wortgruppe nennt einen Zweck: Wozu übt Lena? – zur Vorbereitung auf die Prüfung.','Lena übt zur Vorbereitung auf die Prüfung jeden Abend.'),
    S('sg-09','sentenceparts',8,4,'Welche Funktion hat „mit dem roten Umschlag“?',['Attribut zum Nomen „Buch“','Dativobjekt','Modaladverbiale','Prädikat'],'Attribut zum Nomen „Buch“','Die Wortgruppe beschreibt das Nomen „Buch“ näher und ist Teil des Satzglieds.','Das Buch mit dem roten Umschlag liegt hier.'),
    S('sg-10','sentenceparts',9,4,'Welche Aussage stimmt? „Dass du pünktlich bist, freut mich.“',['Der Nebensatz übernimmt die Funktion des Subjekts.','Der Nebensatz ist ein Akkusativobjekt.','Der Nebensatz ist eine Lokaladverbiale.','Der Nebensatz ist nur ein Attribut.'],'Der Nebensatz übernimmt die Funktion des Subjekts.','Frageprobe: Was freut mich? – Dass du pünktlich bist.'),

    // SATZBAU
    S('sb-01','sentencebuild',5,1,'Welcher Teil ist ein Nebensatz? „Ich bleibe zu Hause, weil ich krank bin.“',['weil ich krank bin','Ich bleibe zu Hause','Ich bleibe','zu Hause'],'weil ich krank bin','Der mit „weil“ eingeleitete Teil ist vom Hauptsatz abhängig; das finite Verb steht am Ende.'),
    S('sb-02','sentencebuild',5,2,'Welche Verbindung enthält Haupt- und Nebensatz?',['Wir gehen hinein, weil es regnet.','Wir gehen hinein und wir warten.','Gehen wir hinein?','Heute regnet es stark.'],'Wir gehen hinein, weil es regnet.','„Wir gehen hinein“ ist Hauptsatz; „weil es regnet“ ist ein untergeordneter Nebensatz.'),
    S('sb-03','sentencebuild',6,2,'Was ist das? „Ich lerne, weil morgen die Probe stattfindet.“',['Satzgefüge','Satzreihe','einfacher Hauptsatz','Ausrufesatz'],'Satzgefüge','Ein Hauptsatz und ein untergeordneter Nebensatz bilden ein Satzgefüge.'),
    S('sb-04','sentencebuild',6,2,'Woran erkennst du einen eingeleiteten Nebensatz besonders häufig?',['Das finite Verb steht am Ende.','Er beginnt immer mit einem Nomen.','Er enthält nie ein Subjekt.','Er hat immer genau fünf Wörter.'],'Das finite Verb steht am Ende.','In eingeleiteten Nebensätzen steht das finite Verb typischerweise am Ende.'),
    S('sb-05','sentencebuild',7,2,'Was ist das? „Ich lerne, und meine Schwester liest.“',['Satzreihe','Satzgefüge','Nebensatz','Infinitivgruppe'],'Satzreihe','Zwei gleichrangige Hauptsätze sind miteinander verbunden.'),
    S('sb-06','sentencebuild',7,3,'Welche Art Gliedsatz ist „Dass du kommst, freut mich.“?',['Subjektsatz','Objektsatz','Relativsatz','Kausalsatz'],'Subjektsatz','Der Nebensatz übernimmt die Funktion des Subjekts: Was freut mich? – Dass du kommst.'),
    S('sb-07','sentencebuild',7,3,'Welche Art Gliedsatz ist „Ich weiß, dass du kommst.“?',['Objektsatz','Subjektsatz','Relativsatz','Temporalsatz'],'Objektsatz','Der Nebensatz übernimmt die Funktion eines Objekts: Was weiß ich? – dass du kommst.'),
    S('sb-08','sentencebuild',8,3,'Welche Konstruktion enthält einen Attributsatz?',['Das Buch, das hier liegt, gehört mir.','Weil es regnet, bleiben wir hier.','Ich weiß, dass er kommt.','Wir laufen, um fit zu bleiben.'],'Das Buch, das hier liegt, gehört mir.','Der Relativsatz „das hier liegt“ beschreibt das Nomen „Buch“ näher und ist ein Attributsatz.'),
    S('sb-09','sentencebuild',8,4,'Was kennzeichnet einen Schachtelsatz?',['Mehrere Satzebenen sind ineinander eingebettet.','Er besteht immer nur aus zwei Wörtern.','Er enthält kein finites Verb.','Er ist immer eine Frage.'],'Mehrere Satzebenen sind ineinander eingebettet.','Beim Schachtelsatz sind Haupt- und Nebensätze bzw. weitere Nebensätze ineinander verschachtelt.'),
    S('sb-10','sentencebuild',9,4,'Welche Umformung macht den Satz übersichtlicher? „Der Schüler, der die Aufgabe, die sehr schwierig war, gelöst hatte, meldete sich.“',['Der Schüler hatte die sehr schwierige Aufgabe gelöst. Danach meldete er sich.','Der Schüler der die Aufgabe die schwierig war gelöst hatte meldete sich.','Der Schüler, die Aufgabe war schwierig, meldete sich, gelöst.','Keine Umformung ist möglich.'],'Der Schüler hatte die sehr schwierige Aufgabe gelöst. Danach meldete er sich.','Komplexe Schachtelsätze können durch sinnvolle Aufteilung verständlicher werden.'),

    // ZEITFORMEN
    S('ten-01','tense',5,1,'Welche Zeitform? „Mila spielt Fußball.“',['Präsens','Präteritum','Perfekt','Futur I'],'Präsens','„spielt“ steht im Präsens.'),
    S('ten-02','tense',5,1,'Welche Zeitform? „Mila spielte Fußball.“',['Präteritum','Präsens','Perfekt','Plusquamperfekt'],'Präteritum','„spielte“ steht im Präteritum.'),
    S('ten-03','tense',5,2,'Welche Zeitform? „Mila hat Fußball gespielt.“',['Perfekt','Präteritum','Präsens','Futur I'],'Perfekt','Hilfsverb „hat“ + Partizip II bilden das Perfekt.'),
    S('ten-04','tense',6,2,'Welche Zeitform? „Mila hatte Fußball gespielt.“',['Plusquamperfekt','Perfekt','Präteritum','Futur II'],'Plusquamperfekt','„hatte“ + Partizip II bilden das Plusquamperfekt.'),
    S('ten-05','tense',6,2,'Welche Zeitform? „Mila wird Fußball spielen.“',['Futur I','Präsens','Perfekt','Futur II'],'Futur I','„wird“ + Infinitiv bilden das Futur I.'),
    S('ten-06','tense',7,3,'Welche Zeitform? „Mila wird Fußball gespielt haben.“',['Futur II','Futur I','Perfekt','Plusquamperfekt'],'Futur II','„wird“ + Partizip II + „haben“ bilden das Futur II.'),
    S('ten-07','tense',8,3,'Welche Zeitenfolge passt? „Nachdem er seine Hausaufgaben ___, ging er hinaus.“',['gemacht hatte','gemacht hat','machen wird','macht'],'gemacht hatte','Die Handlung im Nebensatz liegt vor dem Geschehen im Präteritum; das Plusquamperfekt macht diese Vorzeitigkeit deutlich.'),
    S('ten-08','tense',9,4,'Welche Form beschreibt eine bis zu einem zukünftigen Zeitpunkt abgeschlossene Handlung?',['Futur II','Futur I','Perfekt','Präteritum'],'Futur II','Das Futur II drückt aus, dass etwas zu einem zukünftigen Zeitpunkt abgeschlossen sein wird.'),

    // AKTIV / PASSIV
    S('vo-01','voice',6,1,'Aktiv oder Passiv? „Die Klasse löst die Aufgabe.“',['Aktiv','Passiv','Konjunktiv','Infinitiv'],'Aktiv','Das handelnde Subjekt „die Klasse“ führt die Handlung aus.'),
    S('vo-02','voice',6,1,'Aktiv oder Passiv? „Die Aufgabe wird von der Klasse gelöst.“',['Passiv','Aktiv','Konjunktiv','Plusquamperfekt'],'Passiv','„wird … gelöst“ ist ein Vorgangspassiv.'),
    S('vo-03','voice',6,2,'Welche Form ist korrektes Passiv Präsens zu „Der Hausmeister schließt die Tür“?',['Die Tür wird vom Hausmeister geschlossen.','Die Tür wurde vom Hausmeister geschlossen.','Die Tür hat der Hausmeister geschlossen.','Die Tür wird den Hausmeister schließen.'],'Die Tür wird vom Hausmeister geschlossen.','Präsens Passiv: „werden“ im Präsens + Partizip II.'),
    S('vo-04','voice',7,3,'Welche Zeitform des Passivs? „Die Tür wurde geöffnet.“',['Präteritum Passiv','Präsens Passiv','Perfekt Passiv','Futur Passiv'],'Präteritum Passiv','„wurde“ + Partizip II bilden das Vorgangspassiv im Präteritum.'),
    S('vo-05','voice',8,3,'Welche Wirkung hat das Passiv häufig?',['Die Handlung oder das Ergebnis rückt stärker in den Mittelpunkt als der Handelnde.','Der Satz wird immer persönlicher.','Der Handelnde muss immer genannt werden.','Passiv drückt nur Zukunft aus.'],'Die Handlung oder das Ergebnis rückt stärker in den Mittelpunkt als der Handelnde.','Im Passiv kann der Handelnde zurücktreten oder ganz ungenannt bleiben.'),
    S('vo-06','voice',9,4,'Welche Umformung ist korrekt? „Man überprüft die Ergebnisse sorgfältig.“',['Die Ergebnisse werden sorgfältig überprüft.','Die Ergebnisse haben sorgfältig überprüft.','Die Ergebnisse werden sorgfältig überprüfen.','Die Ergebnisse sind sorgfältig überprüfen.'],'Die Ergebnisse werden sorgfältig überprüft.','Beim Vorgangspassiv wird „werden“ mit dem Partizip II verbunden.'),

    // KONJUNKTIV / INDIREKTE REDE
    S('mood-01','mood',7,2,'Welche Form ist Konjunktiv I?',['er sei','er ist','er wäre','er war'],'er sei','„sei“ ist Konjunktiv I von „sein“.'),
    S('mood-02','mood',7,3,'Welche indirekte Rede ist korrekt? Direkte Rede: „Ich bin müde.“',['Sie sagt, sie sei müde.','Sie sagt, sie ist müde gewesen.','Sie sagt, sie wäre immer müde.','Sie sagt: sie bin müde.'],'Sie sagt, sie sei müde.','In der indirekten Rede kann der Konjunktiv I die Aussage einer anderen Person wiedergeben.'),
    S('mood-03','mood',8,2,'Welche Form steht im Konjunktiv II?',['ich hätte','ich habe','ich hatte','ich werde haben'],'ich hätte','„hätte“ ist Konjunktiv II von „haben“.'),
    S('mood-04','mood',8,3,'Welche indirekte Rede ist korrekt? Direkte Rede: „Wir kommen später.“',['Sie sagen, sie kämen später.','Sie sagen, wir kommen später.','Sie sagen, sie kamen später.','Sie sagen, sie kommen später gewesen.'],'Sie sagen, sie kämen später.','Ist der Konjunktiv I nicht eindeutig oder soll Distanz besonders deutlich werden, kann Konjunktiv II verwendet werden.'),
    S('mood-05','mood',8,4,'Warum wird in Berichten häufig Konjunktiv verwendet?',['Um Aussagen anderer als wiedergegeben und nicht als eigene Behauptung zu kennzeichnen.','Um jeden Satz höflicher zu machen.','Weil Konjunktiv immer Vergangenheit bedeutet.','Weil dadurch kein Komma mehr nötig ist.'],'Um Aussagen anderer als wiedergegeben und nicht als eigene Behauptung zu kennzeichnen.','Der Konjunktiv schafft sprachliche Distanz zur wiedergegebenen Aussage.'),
    S('mood-06','mood',9,4,'Welche Form gibt die Aussage distanziert wieder? Direkte Rede: „Das Ergebnis ist eindeutig.“',['Der Sprecher erklärt, das Ergebnis sei eindeutig.','Der Sprecher erklärt, das Ergebnis ist eindeutig!','Der Sprecher erklärt: Ergebnis eindeutig.','Der Sprecher erklärte, das Ergebnis war eindeutig gewesen.'],'Der Sprecher erklärt, das Ergebnis sei eindeutig.','„sei“ kennzeichnet die indirekte Wiedergabe im Konjunktiv I.'),

    // WORTBILDUNG & WORTSCHATZ
    S('wf-01','wordformation',5,1,'Was ist das Bestimmungswort in „Schulweg“?',['Schul-','-weg','Weg','-ul-'],'Schul-','Das Bestimmungswort grenzt die Bedeutung des Grundwortes „Weg“ ein.'),
    S('wf-02','wordformation',5,1,'Welche Vorsilbe steckt in „unfreundlich“?',['un-','freund','-lich','-und-'],'un-','„un-“ ist die Vorsilbe; „freund“ ist der Wortstamm und „-lich“ eine Nachsilbe.'),
    S('wf-03','wordformation',5,2,'Wie ist „Haustür“ gebildet?',['Zusammensetzung aus zwei Nomen','Steigerung','Ableitung nur mit Nachsilbe','Kurzwort'],'Zusammensetzung aus zwei Nomen','„Haus“ + „Tür“ bilden ein zusammengesetztes Nomen.'),
    S('wf-04','wordformation',6,2,'Welches Wort ist eine Ableitung von „freund“?',['freundlich','Freund','Freund Haus','Freund und'],'freundlich','Durch die Nachsilbe „-lich“ entsteht aus dem Wortstamm „freund“ ein Adjektiv.'),
    S('wf-05','wordformation',6,2,'Welcher Oberbegriff passt zu „Bus, Bahn, Fahrrad, Auto“?',['Verkehrsmittel','Gebäude','Berufe','Gefühle'],'Verkehrsmittel','Alle vier Wörter gehören zum Bedeutungsfeld „Verkehrsmittel“.'),
    S('wf-06','wordformation',7,2,'Welches Wort ist ein Synonym zu „rasch“?',['schnell','laut','breit','selten'],'schnell','„rasch“ und „schnell“ haben in diesem Zusammenhang eine ähnliche Bedeutung.'),
    S('wf-07','wordformation',7,3,'Was ist der Wortstamm von „unfreundlich“?',['freund','un','lich','freundlich'],'freund','„un-“ ist Vorsilbe, „-lich“ Nachsilbe; der Stamm lautet „freund“.'),
    S('wf-08','wordformation',8,3,'Welches Paar besteht aus Antonymen?',['hell – dunkel','schnell – rasch','Auto – Fahrzeug','gehen – laufen'],'hell – dunkel','Antonyme haben gegensätzliche Bedeutungen.'),
    S('wf-09','wordformation',8,3,'Welche Endung ist typisch für viele Fremdwörter?',['-tion','-chen','-lein','-tum'],'-tion','Viele Fremdwörter enden auf -tion, z. B. Information oder Produktion.'),
    S('wf-10','wordformation',9,4,'Was ist eine Reduktion in der Wortbildung?',['Eine verkürzte Form eines längeren Ausdrucks oder Wortes','Die Steigerung eines Adjektivs','Die Bildung einer Mehrzahl','Das Verlängern eines Endlauts'],'Eine verkürzte Form eines längeren Ausdrucks oder Wortes','Reduktion bezeichnet eine Wortbildung durch Kürzung, etwa bei Kurzwörtern.'),

    // QUALI- UND FEHLERJAGD-NAHE MEHRFACHAUFGABEN – neu formuliert
    M('multi-01','spelling',6,2,'In diesem Satz stecken drei Rechtschreibfehler.',[
      { label:'aktuel → aktuell',correct:true },{ label:'Ergebniss → Ergebnis',correct:true },{ label:'interesant → interessant',correct:true },{ label:'heute → Heute',correct:false }
    ],'Verbessert werden müssen „aktuell“, „Ergebnis“ und „interessant“. „heute“ bleibt im Satzinneren kleingeschrieben.','Das aktuel veröffentlichte Ergebniss ist interesant.'),
    M('multi-02','case',6,2,'Welche Stellen müssen verbessert werden?',[{label:'beim lesen → beim Lesen',correct:true},{label:'etwas neues → etwas Neues',correct:true},{label:'am Abend',correct:false},{label:'morgen',correct:false}], '„beim Lesen“ und „etwas Neues“ sind Nominalisierungen; „am Abend“ ist bereits richtig und „morgen“ bleibt hier ein Adverb.','Beim lesen entdeckt sie immer etwas neues, das sie am Abend noch beschäftigt.'),
    M('multi-03','dasdass',6,2,'Welche beiden Stellen sind falsch?',[{label:'das du → dass du',correct:true},{label:'dass Buch → das Buch',correct:true},{label:'das dort liegt',correct:false},{label:'gelesen hast',correct:false}], 'Die Konjunktion lautet „dass“; vor dem Nomen „Buch“ steht der Artikel „das“. Das Relativpronomen „das“ in „das dort liegt“ ist richtig.','Ich weiß, das du dass Buch, das dort liegt, schon gelesen hast.'),
    M('multi-04','punctuation',7,3,'Welche Änderungen sind nötig?',[{label:'nach „weiß“ ein Komma',correct:true},{label:'nach „kommst“ ein Komma',correct:true},{label:'vor „weil“ ein Komma',correct:false},{label:'nach „morgen“ ein Komma',correct:false}], 'Der eingeschobene Nebensatz „dass du kommst“ wird mit zwei Kommas abgegrenzt. Danach folgt der Hauptsatz weiter.','Ich weiß dass du kommst, wir morgen zusammen lernen.'),
    M('multi-05','spelling',8,3,'Finde alle drei fehlerhaften Schreibungen.',[{label:'Möglicher weise → möglicherweise',correct:true},{label:'Rhytmus → Rhythmus',correct:true},{label:'produziren → produzieren',correct:true},{label:'Projekt',correct:false}], 'Richtig sind „möglicherweise“, „Rhythmus“ und „produzieren“.','Möglicher weise hilft ein fester Rhytmus dabei, bessere Texte zu produziren.'),
    M('multi-06','case',9,4,'Welche Stellen müssen geändert werden?',[{label:'eines morgens → eines Morgens',correct:true},{label:'im allgemeinen → im Allgemeinen',correct:true},{label:'etwas Besonderes',correct:false},{label:'nach Hause',correct:false}], '„eines Morgens“ und „im Allgemeinen“ sind substantivische Verwendungen und werden großgeschrieben.','Eines morgens bemerkte sie, dass im allgemeinen etwas Besonderes passiert, wenn sie früh nach Hause geht.'),
    M('multi-07','wordclass',7,3,'Welche Zuordnungen sind falsch?',[{label:'„dieser“ = Demonstrativpronomen',correct:false},{label:'„weil“ = Präposition',correct:true},{label:'„unser“ = Possessivpronomen',correct:false},{label:'„schnell“ = Nomen',correct:true}], '„weil“ ist eine unterordnende Konjunktion; „schnell“ ist hier kein Nomen. Die anderen Zuordnungen stimmen.','Prüfe die vier Wortart-Zuordnungen.'),
    M('multi-08','sentenceparts',8,3,'Welche Zuordnungen sind falsch?',[{label:'„morgen“ = Temporaladverbiale',correct:false},{label:'„im Park“ = Lokaladverbiale',correct:false},{label:'„wegen des Regens“ = Kausaladverbiale',correct:false},{label:'„den Ball“ = Dativobjekt',correct:true}], '„den Ball“ ist ein Akkusativobjekt. Die anderen drei Zuordnungen sind korrekt.','Prüfe die Satzglied-Zuordnungen.'),
    M('multi-09','spelling',9,4,'Welche Schreibungen müssen verbessert werden?',[{label:'konzequent → konsequent',correct:true},{label:'Strasse → Straße',correct:true},{label:'nähmlich → nämlich',correct:true},{label:'Fachbegriffe',correct:false}], 'Richtig sind „konsequent“, „Straße“ und „nämlich“. „Fachbegriffe“ ist bereits korrekt.','Wer konzequent übt, schreibt Wörter wie Strasse und nähmlich sowie viele Fachbegriffe sicherer.'),
    M('multi-10','together',9,4,'Welche beiden Schreibungen sind falsch?',[{label:'Radfahren → Rad fahren',correct:true},{label:'statt finden → stattfinden',correct:true},{label:'spazieren gehen',correct:false},{label:'zurückkommen',correct:false}], '„Rad fahren“ wird getrennt, „stattfinden“ zusammen geschrieben. Die beiden anderen Schreibungen sind richtig.','Am Wochenende möchte ich Radfahren, danach soll ein Treffen statt finden und später wollen wir spazieren gehen und pünktlich zurückkommen.'),
    M('multi-11','punctuation',8,4,'Welche Satzzeichen fehlen?',[{label:'Komma nach „meinte“',correct:true},{label:'Komma nach „Aufgabe“',correct:true},{label:'Komma nach „schwierig“',correct:false},{label:'Apostroph vor „lösen“',correct:false}], 'Der Nebensatz „obwohl die Aufgabe schwierig sei“ wird mit zwei Kommas vom Hauptsatz abgegrenzt.','Die Lehrerin meinte obwohl die Aufgabe schwierig sei könnten wir sie lösen.'),
    M('multi-12','strategy',9,4,'Welche Begründungen sind fachlich sinnvoll?',[{label:'„Hunde“ macht das d in „Hund“ hörbar.',correct:true},{label:'„welches“ kann bei vielen Fällen von „das“ als Ersatzprobe helfen.',correct:true},{label:'Jedes lange Wort wird zusammengeschrieben.',correct:false},{label:'Fremdwörter sollte man bei Unsicherheit nachschlagen.',correct:true}], 'Verlängern, Ersatzprobe und Nachschlagen sind geeignete Strategien. Die Wortlänge entscheidet nicht über Getrennt- oder Zusammenschreibung.','Wähle alle sinnvollen Strategien aus.'),
    S('qa-01','spelling',9,4,'Welche Lösung enthält nur korrekt geschriebene Wörter?',['Vertrauen – interessant – zurückgreifen','Vertrauen – interesant – zurück greifen','Vertrauhen – interessant – zurückgreifen','Vertrauen – interressant – zurückgreifen'],'Vertrauen – interessant – zurückgreifen','Die Aufgabe verbindet unterschiedliche Rechtschreibbereiche: Merkwort/Fremdwort und Getrennt-/Zusammenschreibung.'),
    S('qa-02','strategy',9,4,'Welche Begründung passt zu „zurückgreifen“?',['„zurück-“ ist ein Verbzusatz; das Verb wird zusammengeschrieben.','Verben werden grundsätzlich zusammengeschrieben.','Wegen des ck muss das Wort zusammengeschrieben werden.','„zurück“ ist immer ein Nomen.'],'„zurück-“ ist ein Verbzusatz; das Verb wird zusammengeschrieben.','Die grammatische Struktur und die Funktion des Verbzusatzes begründen die Zusammenschreibung.'),
    S('qa-03','punctuation',9,4,'Welche Fassung ist vollständig korrekt?',['Wer sorgfältig prüft, erkennt, dass nicht jeder scheinbare Fehler wirklich einer ist.','Wer sorgfältig prüft erkennt, dass nicht jeder scheinbare Fehler wirklich einer ist.','Wer sorgfältig prüft, erkennt dass nicht jeder scheinbare Fehler wirklich einer ist.','Wer sorgfältig prüft erkennt dass nicht jeder scheinbare Fehler wirklich einer ist.'],'Wer sorgfältig prüft, erkennt, dass nicht jeder scheinbare Fehler wirklich einer ist.','Der vorangestellte Nebensatz und der dass-Satz werden jeweils durch Komma abgetrennt.'),
    S('qa-04','sentencebuild',9,4,'Wie ist der Satz gebaut? „Wer sorgfältig prüft, erkennt, dass nicht jeder Fehler einer ist.“',['Hauptsatz mit zwei Nebensätzen','Satzreihe aus drei Hauptsätzen','einfacher Hauptsatz','nur ein Nebensatz ohne Hauptsatz'],'Hauptsatz mit zwei Nebensätzen','„erkennt“ bildet den Hauptsatzkern; „Wer sorgfältig prüft“ und „dass ...“ sind Nebensätze mit unterschiedlichen Funktionen.')
  ];

  function gradeNumber(value) { return value === 'qa' ? 9 : Number(value || 9); }
  function availableSkills(grade) {
    if (grade === 'qa') return Object.keys(SKILLS);
    const n = gradeNumber(grade);
    return Object.entries(SKILLS).filter(([, meta]) => meta.recommended.includes(n)).map(([id]) => id);
  }

  function eligibleTasks(config, skill) {
    const g = gradeNumber(config.grade);
    const qa = config.grade === 'qa';
    const meta = SKILLS[skill];
    const intro = meta?.introducedGrade || 5;
    const maxTargetGrade = Math.max(g, intro);
    const level = config.level || 'n2';
    const [minDiff, maxDiff] = qa ? [2,4] : (LEVEL_RANGE[level] || [1,2]);
    const gradeWindow = qa ? 7 : Math.max(5, g - (level === 'n1' ? 4 : level === 'n2' ? 3 : level === 'n3' ? 2 : 1));
    let pool = TASKS.filter(t => t.skill === skill && t.grade <= maxTargetGrade && t.grade >= gradeWindow && t.difficulty >= minDiff && t.difficulty <= maxDiff);
    if (!pool.length) pool = TASKS.filter(t => t.skill === skill && t.grade <= maxTargetGrade && t.difficulty <= maxDiff);
    if (!pool.length) pool = TASKS.filter(t => t.skill === skill);
    return pool;
  }

  function prepareTask(rng, source) {
    const t = JSON.parse(JSON.stringify(source));
    if (t.type === 'single') t.options = shuffle(rng, t.options);
    else t.options = shuffle(rng, t.options).map((o, index) => ({ ...o, key: `m${index}` }));
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
