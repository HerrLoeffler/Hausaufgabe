import {registerCatalog} from './baseline/shared/i18n/browser-runtime.mjs?v=3';
export {heroText} from './baseline/gradecrew-hero-copy.mjs?v=1';
const de={
 cocoTitle:'Coco zeigt dir den nächsten Schritt.',cocoPhase0:'Du findest Coco unten rechts in der Anwendung.',cocoPhase1:'Stell deine Frage, wenn du nicht weiterweißt.',cocoPhase2:'Coco zeigt dir, wo es weitergeht.',
 cocoSays:'Frag mich einfach. Ich bin für dich da.',myTests:'Meine Tests',newTest:'Neuer Test',exampleQuestion:'Wie erstelle ich einen Test?',cocoAnswer:'Wähle „Neuer Test“. Remy hilft dir dabei, aus deiner Idee einen Test zu machen.',
 exampleLabel:'Beispiel',askCoco:'Coco fragen',questionLabel:'Deine Frage',showAnswer:'Antwort zeigen',showQuestion:'Frage zeigen',prev:'Zurück',demoBoundary:'Vorbereitete Beispiele. Keine echte KI-Anfrage.',
 remyTitle:'Remy erstellt deinen ganzen Test.',remyPhase0:'Ein Wunsch genügt als Ausgangspunkt.',remyPhase1:'Ein vollständiger Entwurf: zehn Aufgaben, Bilder und eine Hörfrage.',remyPhase2:'Eine Bildfrage aus diesem Test – vollständig und lesbar.',remyPhase3:'Auch eine Höraufgabe ist dabei. Hör dir das Beispiel an.',
 remySays:'Sag mir, welchen Test du brauchst.',editDraft:'Du kannst jede Aufgabe noch anpassen.',
 sampleWish:'Dein Beispielwunsch',wish:'„Erstelle einen Englischtest für Klasse 5 zum Thema Farben, mit Bildern und einer Höraufgabe.“',
 fullTest:'Dein vollständiger Entwurf',testMeta:'Englisch · Klasse 5',taskCount:'10 Aufgaben · 14 Punkte',sampleQuestion:'Beispielaufgabe',overviewNext:'Testübersicht ansehen',pictureNext:'Bildfrage ansehen',audioNext:'Hörfrage ansehen',
 singleFormat:'Auswahl',listeningFormat:'Höraufgabe',matchingFormat:'Zuordnen',textFormat:'Kurzantwort',orderingFormat:'Reihenfolge',imageChoiceFormat:'Bildauswahl',
 transcript:'Transkript anzeigen',listeningHint:'Englische Demoaufnahme · 5,5 Sekunden',remyPoint:'Punkt',remyPoints:'Punkte',answerHere:'Antwortfeld',testInstruction:'Aufgabeninhalt: Englisch'
};
const en={
 cocoTitle:'Coco shows you the next step.',cocoPhase0:'Find Coco at the bottom right inside the app.',cocoPhase1:'Ask your question whenever you need a hand.',cocoPhase2:'Coco shows you where to go next.',
 cocoSays:'Just ask me. I’m here to help.',myTests:'My tests',newTest:'New test',exampleQuestion:'How do I create a test?',cocoAnswer:'Choose “New test”. Remy helps you turn your idea into a test.',
 exampleLabel:'Example',askCoco:'Ask Coco',questionLabel:'Your question',showAnswer:'Show answer',showQuestion:'Show question',prev:'Back',demoBoundary:'Prepared examples. No real AI request.',
 remyTitle:'Remy creates your whole test.',remyPhase0:'A request gives Remy a starting point.',remyPhase1:'A complete draft: ten questions, pictures and a listening question.',remyPhase2:'A picture question from this test – complete and readable.',remyPhase3:'A listening question is included. Play the sample recording.',
 remySays:'Tell me what test you need.',editDraft:'You can still adjust every question.',
 sampleWish:'Your sample request',wish:'“Create an English test for Grade 5 about colours, with pictures and a listening question.”',
 fullTest:'Your complete draft',testMeta:'English · Grade 5',taskCount:'10 questions · 14 points',sampleQuestion:'Sample question',overviewNext:'See the whole test',pictureNext:'See a picture question',audioNext:'See a listening question',
 singleFormat:'Multiple choice',listeningFormat:'Listening',matchingFormat:'Matching',textFormat:'Short answer',orderingFormat:'Ordering',imageChoiceFormat:'Picture choice',
 transcript:'Show transcript',listeningHint:'English sample recording · 5.5 seconds',remyPoint:'point',remyPoints:'points',answerHere:'Answer field',testInstruction:'Test content: English'
};
for(const [locale,catalog] of [['de-DE',de],['en-GB',en]])registerCatalog(locale,Object.fromEntries(Object.entries(catalog).map(([k,v])=>['hero.'+k,v])));

