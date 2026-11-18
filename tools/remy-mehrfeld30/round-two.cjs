'use strict';
const {core}=require('../../functions/lib/visual-task');
const roundTwoCode='REMYRND2';
const node=label=>({label});
const arrow=(label='')=>({arrow:label});
const field=id=>({field:id});
const choice=(id,label,options,answer)=>({id,label,mode:'choice',options,accepted:[answer]});
const text=(id,label,...accepted)=>({id,label,mode:'text',accepted});
const number=(id,label,answer)=>({id,label,mode:'number',accepted:[String(answer)]});
const route=(title,...steps)=>({title,steps});
function diagram(id,subject,shape,heading,task,paths,fields){
  const branchRoot=id==='r2-bahn'?'8 Fahrten':id==='r2-maus'?'Ist vor dir eine Wand?':null;
  return {id,subject,shape,heading,type:'diagram',text:task,paths,fields,branchRoot,points:fields.length*.5};
}
function connect(id,subject,heading,task,labels,edges){
  const t={...core.example('connections'),id,title:heading,subject,grade:'7',prompt:task,maxPoints:edges.length*.5,
    objective:task,rationale:'Die Pfeilrichtung macht die Beziehung sichtbar.',
    spec:{directed:true,nodes:labels.map(([id,label,x,y])=>({id,label,x,y}))},solution:{edges}};
  return {id,subject,shape:'Pfeile zeichnen',heading,type:'visual',text:task,points:t.maxPoints,visualTask:JSON.stringify(t)};
}

const roundTwo=[
  diagram('r2-bahn','Mathematik','Verzweigung','Welche Fahrkarte lohnt sich?','Berechne beide Preise für 8 Fahrten. Wähle dann die günstigere Karte.',[
    route('Einzeltickets',arrow('je 3 €'),field('einzel')),
    route('Mit Rabattkarte',arrow('8 € Grundpreis + 1,50 € je Fahrt'),field('karte')),
    route('Vergleich',node('Beide Preise'),arrow(),field('wahl'))
  ],[number('einzel','Einzeltickets in €',24),number('karte','Rabattkarte in €',20),choice('wahl','Günstiger',['Einzeltickets','Rabattkarte','Gleich teuer'],'Rabattkarte')]),
  diagram('r2-nebel','Physik','Gegenrichtung','Der beschlagene Spiegel','Wähle den Übergang in jeder Richtung.',[
    route('Beim Duschen',node('Wasserdampf'),arrow(),field('hin'),arrow(),node('Wassertröpfchen')),
    route('Beim Trocknen',node('Wassertröpfchen'),arrow(),field('zurueck'),arrow(),node('Wasserdampf'))
  ],[choice('hin','Dampf zu Tröpfchen',['Erstarren','Kondensieren','Verdunsten'],'Kondensieren'),choice('zurueck','Tröpfchen zu Dampf',['Verdunsten','Kondensieren','Schmelzen'],'Verdunsten')]),
  connect('r2-quellen','Geschichte','Welche Quelle stützt welche Aussage?','Zeichne je einen Pfeil von der Quelle zu der Aussage, die sie direkt stützt.',
    [['a','Fahrplan: erster Zug 5:40',138,92],['b','Preisliste: Brot kostet 20 Pfennig',138,250],['c','Angabe zum Brotpreis',555,90],['d','Angabe zur Zugzeit',555,247]],[['a','d'],['b','c']]),
  diagram('r2-stimme','Deutsch','Umformung','Wer berichtet wessen Satz?','Setze die wörtliche Rede in indirekte Rede. Ergänze Pronomen und Verbform.',[
    route('Wörtliche Rede',node('Mia sagt: „Ich bin müde.“'),arrow('indirekte Rede'),node('Mia sagt,'),field('pronomen'),field('verb'),node('müde.'))
  ],[choice('pronomen','Pronomen',['ich','sie','er'],'sie'),text('verb','Konjunktiv I von „ist“','sei')]),
  diagram('r2-reflex','Biologie','Signalkette','Hand weg von der heißen Herdplatte','Wähle die fehlenden Stationen des Reflexbogens.',[
    route('Vom Reiz zur Bewegung',node('Sinneszellen in der Haut'),arrow(),field('hin'),arrow(),node('Rückenmark'),arrow(),field('weg'),arrow(),node('Muskel zieht sich zusammen'))
  ],[choice('hin','Zum Rückenmark',['sensorischer Nerv','motorischer Nerv','Sehne'],'sensorischer Nerv'),choice('weg','Zum Muskel',['sensorischer Nerv','motorischer Nerv','Sehne'],'motorischer Nerv')]),
  diagram('r2-maus','Informatik','Entscheidung','Maus im Labyrinth','Die Figur schaut nach rechts. Wähle für jede Bedingung, was sie nach der Regel tut: „Wand vor dir? Dann links drehen, sonst ein Feld geradeaus.“',[
    route('Wenn ja',arrow(),field('wand')),
    route('Wenn nein',arrow(),field('frei'))
  ],[choice('wand','Aktion bei einer Wand',['links drehen','rechts drehen','geradeaus gehen'],'links drehen'),choice('frei','Aktion bei freiem Weg',['geradeaus gehen','links drehen','stehen bleiben'],'geradeaus gehen')]),
  diagram('r2-rezept','Hauswirtschaft','Zusammenführung','Obstsalat für zwei Schalen','Ergänze die Gesamtmasse und die Masse pro Schale. Beide Schalen werden gleich voll.',[
    route('Zutaten zusammenführen',node('180 g Apfel + 120 g Birne'),arrow('zusammen'),field('gesamt'),arrow('gleichmäßig auf 2 Schalen'),field('portion'))
  ],[number('gesamt','Gesamtmasse in g',300),number('portion','Masse pro Schale in g',150)]),
  diagram('r2-water','Geografie','Kreislauf','Wasser auf dem Weg zurück ins Meer','Wähle zwei Vorgänge im Wasserkreislauf. Die Flüsse führen das Wasser zum Meer zurück.',[
    route('1 · Auf dem Weg nach oben',node('Wasser im Meer'),arrow(),field('hoch'),arrow(),node('Wasserdampf')),
    route('2 · Wolken und Regen',node('Wasserdampf'),arrow('kondensiert'),node('Wolken'),arrow('Niederschlag'),node('Regen über Land')),
    route('3 · Auf dem Weg zurück',node('Regen über Land'),arrow(),field('fluss'),arrow('mündet in'),node('Meer · zurück zum Start'))
  ],[choice('hoch','Wasser wird zu Wasserdampf',['Verdunstung','Niederschlag','Versickerung'],'Verdunstung'),choice('fluss','Wasser fließt oberirdisch ab',['Abfluss im Fluss','Kondensation','Verdunstung'],'Abfluss im Fluss')]),
  connect('r2-nahrung','Biologie','Zwei Wege in einem Nahrungsnetz','Das Rotkehlchen frisst sowohl Raupen als auch Blattläuse. Beide fressen Teile der Eiche. Zeichne alle vier Pfeile vom Futter zum Fresser.',
    [['a','Eiche',116,167],['b','Raupe',345,83],['c','Blattlaus',345,262],['d','Rotkehlchen',568,169]],[['a','b'],['a','c'],['b','d'],['c','d']]),
  diagram('r2-musik','Musik','Rhythmus ergänzen','Vier Schläge pro Takt','Im 4/4-Takt hat eine Viertelnote einen Schlag und eine halbe Note zwei. Wie viele Schläge fehlen in jedem Takt?',[
    route('Takt A',node('Halbe + Viertel'),arrow('ergänze auf 4'),field('a')),
    route('Takt B',node('Viertel + Viertel'),arrow('ergänze auf 4'),field('b'))
  ],[number('a','Fehlende Schläge in Takt A',1),number('b','Fehlende Schläge in Takt B',2)]),
  diagram('r2-north','Englisch','Weg übersetzen','Find the library','Übersetze die zwei Richtungsanweisungen ins Englische.',[
    route('An der Ampel',node('Biege links ab.'),arrow('auf Englisch'),field('links')),
    route('Nach der Brücke',node('Geh geradeaus.'),arrow('auf Englisch'),field('gerade'))
  ],[choice('links','Links abbiegen',['Turn right.','Turn left.','Go straight ahead.'],'Turn left.'),text('gerade','Geradeaus gehen','go straight ahead','go straight','go straight on')]),
  diagram('r2-alarm','Technik','Pfeile beschriften','Vom Rauch zum Warnsignal','Wähle, was auf jeder Verbindung übertragen wird.',[
    route('Signalweg',node('Rauchmelder erkennt Rauch'),arrow(),field('eingang'),arrow(),node('Elektronik'),arrow(),field('ausgang'),arrow(),node('Ohr hört Alarm'))
  ],[choice('eingang','Vom Sensor zur Elektronik',['elektrisches Signal','Schall','Wärmeleitung'],'elektrisches Signal'),choice('ausgang','Vom Gerät zum Ohr',['elektrisches Signal','Schall','Wärmeleitung'],'Schall')])
];

function projectDiagram(q){
  return {paths:q.paths,branchRoot:q.branchRoot,fields:q.fields.map(({id,label,mode,options})=>({id,label,mode,...(options?{options}:{})}))};
}
const normalize=s=>String(s).trim().toLocaleLowerCase('de-DE').replace(/[.!?]+$/,'').replace(/\s+/g,' ');
function scoreDiagram(q,answer){
  if(!answer||typeof answer!=='object'||Array.isArray(answer))return 0;
  return q.fields.reduce((total,f)=>{
    const value=answer[f.id];
    if(!['string','number'].includes(typeof value)||!String(value).trim())return total;
    if(f.mode==='number'){
      const raw=String(value).trim().replace(',','.');
      return /^[+-]?\d+(?:\.\d+)?$/.test(raw)&&Number(raw)===Number(f.accepted[0])?total+.5:total;
    }
    return f.accepted.some(candidate=>normalize(candidate)===normalize(value))?total+.5:total;
  },0);
}
module.exports={roundTwo,roundTwoCode,projectDiagram,scoreDiagram};
