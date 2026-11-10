'use strict';
const {core}=require('../../functions/lib/visual-task');
const {createDreisatz}=require('../../functions/lib/visual/dreisatz-builder');
const {build}=require('./recipe-three.cjs');
const {buildPitch}=require('./pitch.cjs');
const {buildRhythm}=require('./rhythm.cjs');
const mixedCode='REMYMIX6';

const eligibility={
  'locate-scale':['scale','unit','value'], 'pitch-place':['pitch','clef','named-pitches'],
  'source-link':['sources','sources','claims','unique-evidence'], 'plot-coordinate':['coordinate','axes','coordinates'],
  'mark-fraction':['grid','equal-cells','whole-cell-count'], 'trace-rule':['maze','board','position','direction','rule'],
  'find-region':['hotspot','diagram','unique-region'], 'listen-rhythm':['rhythm','audio','meter','scorable-gap'],
  'place-events':['timeline','time-axis','event-times'], 'complete-chain':['diagram','ordered-fields','local-key'],
  'measure-angle':['angle','geometry','instrument','tolerance'], 'complete-meter':['music','meter','durations','unique-gap'],
  'label-parts':['labeling','diagram','named-parts'], 'order-pictures':['sequence','images','order-anchor'],
  'complete-table':['table','column-units','local-key'], 'draw-links':['connections','nodes','directed-rule'],
  'proportional-route':['dreisatz','constant-ratio','units','intermediate']
};
function rankRecipe(intent){
  const rule=Object.hasOwn(eligibility,intent?.action)?eligibility[intent.action]:null;
  if(!rule||!Array.isArray(intent.facts))return null;
  const facts=new Set(intent.facts);
  if(intent.action==='proportional-route'&&facts.has('base-fee'))return null;
  return rule.slice(1).every(required=>facts.has(required))?rule[0]:null;
}
const card=(q,action,...facts)=>({q,intent:{action,facts},recipe:q.type==='visual'?JSON.parse(q.visualTask).spec.layout||JSON.parse(q.visualTask).format:q.type==='recipe'?q.recipe:q.type});
function visual(id,subject,title,text,format,spec,solution,points=1,options={}){
  const sample=core.example(format,options);
  const task={...sample,id,subject,title,prompt:text,objective:text,rationale:'Die Darstellung erlaubt eine direkte und prüfbare Antwort.',maxPoints:points,
    hint:spec?'':sample.hint,spec:spec||sample.spec,solution:solution||sample.solution};
  if(format==='angle')task.hint='Lege den Winkelmesser am Scheitel an. Lies die Skala ab dem Schenkel bei 0° ab.';
  return {id,subject,heading:title,type:'visual',text,points,visualTask:JSON.stringify(task)};
}
function scale(id,subject,title,text,min,max,step,majorStep,unit,value){
  return card(visual(id,subject,title,text,'scale',{context:'numberline',min,max,step,majorStep,unit,card:'Position'}, {value,tolerance:0}), 'locate-scale','unit','scale','value');
}
function angle(id,subject,title,degrees){
  return card(visual(id,subject,title,'Miss den gezeichneten Winkel α und gib den Wert in Grad ein. Ein Messfehler bis 3° ist erlaubt.','angle',
    {degrees,instrument:'aligned-protractor',min:0,max:180},{value:degrees,tolerance:3}),'measure-angle','geometry','instrument','tolerance');
}
function grid(id,subject,title,text,rows,columns,count){
  return card(visual(id,subject,title,text,'grid',{rows,columns},{count}),'mark-fraction','equal-cells','whole-cell-count');
}
function coordinate(id,subject,title,text,labels,points,mode='points'){
  return card(visual(id,subject,title,text,'coordinate',{mode,minX:-5,maxX:5,minY:-4,maxY:4,step:1,labels},{points},points.length*.5),'plot-coordinate','axes','coordinates');
}
function timeline(id,subject,title,text,min,max,unit,ticks,events,assignments){
  return card(visual(id,subject,title,text,'timeline',{min,max,unit,ticks:ticks.map(([id,value,label])=>({id,value,label})),events:events.map(([id,text])=>({id,text}))},{assignments},1.5),'place-events','time-axis','event-times');
}
function sequence(id,subject,title,text,family,order){
  const task=core.example('sequence',{family});
  return card(visual(id,subject,title,text,'sequence',task.spec,{order:order.map(art=>task.spec.items.find(x=>x.illustration===art).id)},2),'order-pictures','images','order-anchor');
}
function source(id,title,sources){
  return card(build({recipe:'sources',title,sources:sources.map(([source,claim])=>({source,claim}))},id),'source-link','sources','claims','unique-evidence');
}
const choice=(id,label,options,correct)=>({id,label,mode:'choice',options,accepted:[correct]});
const written=(id,label,...accepted)=>({id,label,mode:'text',accepted});
const steps=(...parts)=>parts.map(p=>typeof p==='string'?{label:p}:p);
function chain(id,subject,heading,text,paths,fields){
  return card({id,subject,heading,text,type:'diagram',shape:'Zusammenhänge ergänzen',branchRoot:null,
    paths:paths.map(([title,...parts])=>({title,steps:steps(...parts)})),fields,points:.5*fields.length},
    'complete-chain','ordered-fields','local-key');
}
const f=field=>({field});
const a=(arrow='')=>({arrow});
function flowTable(){
  const columns=['Laufstrecke','Runden à 400 m','Zusatzmeter'];
  const rows=[['1.000 m',null,'200 m'],['1.600 m',null,'0 m'],['2.200 m','5',null]];
  const cells=rows.map((r,i)=>r.map((text,j)=>({id:'z'+i+'s'+j,text:text??'',input:text===null})));
  const q=visual('mix-lauf','Sport','Staffeltraining auf der Bahn','Ergänze die fehlenden Rundenzahlen und Zusatzmeter. Trage nur Zahlen ein.','table',
    {columns,rows:cells,answerMode:'numeric',numericForm:'integer'}, {cells:[{id:'z0s1',accepted:['2']},{id:'z1s1',accepted:['4']},{id:'z2s2',accepted:['200']}]},1.5);
  return card(q,'complete-table','column-units','local-key');
}
function proportional(){
  const q=visual('mix-drinks','Wirtschaft','Getränke für die Schülerfirma','6 Flaschen kosten 9 €. Was kosten 14 Flaschen zum gleichen Stückpreis? Rechne über eine Flasche und ergänze nur die offenen Felder.','table',null,null);
  const task=createDreisatz(JSON.parse(q.visualTask),{
    labels:['Flaschen','Preis (€)'],values:[6,9,1,1.5,14,21],
    operations:[{op:'÷',value:6},{op:'÷',value:6},{op:'×',value:14},{op:'×',value:14}],
    modes:['given','factor','given','select'],givens:[true,true,true,false,true,false]});
  return card({...q,points:task.maxPoints,visualTask:JSON.stringify(task)},'proportional-route','constant-ratio','units','intermediate');
}
function area(id,subject,title,text,format,scene,variant=0){
  return card(visual(id,subject,title,text,format,null,null,format==='hotspot'?1:2,{scene,variant}),
    format==='hotspot'?'find-region':'label-parts','diagram',format==='hotspot'?'unique-region':'named-parts');
}
const pitch=(id,title,level,notes)=>card(buildPitch({title,level,notes},id),'pitch-place','clef','named-pitches');
const rhythm=(id,title,level,meter,bpm,events,gaps)=>card(buildRhythm({title,level,meter,bpm,events,gaps},id),'listen-rhythm','audio','meter','scorable-gap');

const mixedDeck=[
  scale('mix-depth','Geografie','Unter dem Meeresspiegel','Ein Taucher ist 18 m unter dem Meeresspiegel. Markiere seine Höhe auf der Skala.',-30,10,1,5,'m',-18),
  pitch('mix-pitch-pair','F und H im Violinschlüssel','single',['F4','H4']),
  source('mix-bahnarchiv','Was verrät das Bahnhofsarchiv?',[
    ['Auf dem Fahrplan steht: Postzug ab 06:15 Uhr.','Der Postzug fährt um 06:15 Uhr ab.'],
    ['Eine Quittung verzeichnet: Gepäckaufgabe, 10 Pfennig.','Die Gepäckaufgabe kostet 10 Pfennig.'],
    ['Ein Foto zeigt am Eingang ein Schild „Gleis 2“.','Am Eingang hängt ein Schild für Gleis 2.']]),
  coordinate('mix-drones','Informatik','Drei Stopps für die Drohne','Setze Start S(−3 | −2), Messpunkt M(1 | 3) und Landung L(4 | −1).',['S','M','L'],[{x:-3,y:-2},{x:1,y:3},{x:4,y:-1}]),
  grid('mix-mosaic','Kunst','Ein Mosaik für den Pausenhof','Das Mosaik besteht aus 20 gleich großen Fliesen. Färbe zwei Fünftel der Fläche ein.',4,5,8),
  card(build({recipe:'maze',actor:'Roboter',title:'Lieferroboter im Lager',mazes:[
    {cells:['#####','#...#','#.#.#','#...#','#####'],x:3,y:2,facing:'west'},
    {cells:['#####','#...#','#...#','#.#.#','#####'],x:1,y:3,facing:'north'}]},'mix-robot'),'trace-rule','board','position','direction','rule'),
  area('mix-pflanzenteil','Biologie','Auf dem Weg zu den Blättern','Klicke auf die Sprossachse. In ihr laufen die Leitungsbahnen von der Wurzel zu den Blättern.','hotspot','plant',3),
  rhythm('mix-hoerleicht','Eine Lücke im Walzertakt','guided',3,76,['n1','n1','n2','r2'],[3]),
  timeline('mix-mauer','Geschichte','Von der Mauer zur Einheit','Ordne Mauerbau, Mauerfall und deutsche Einheit ihren Jahren zu.',1960,1991,'Jahr',
    [['t1',1961,'1961'],['t2',1989,'1989'],['t3',1990,'1990']],
    [['e1','Deutsche Einheit'],['e2','Bau der Berliner Mauer'],['e3','Fall der Berliner Mauer']],{t1:'e2',t2:'e3',t3:'e1'}),
  chain('mix-trennen','Chemie','Sand und Salz aus einem Gemisch gewinnen','Wähle die zwei fehlenden Trennschritte. Das Salz wurde bereits in Wasser gelöst.',[
    ['Sand abtrennen','Sand in Salzlösung',a(),f('sand'),a(),'Sand bleibt zurück'],
    ['Salz zurückgewinnen','Salzlösung ohne Sand',a(),f('salz'),a(),'Festes Salz bleibt zurück']
  ],[choice('sand','Trennschritt',['Filtrieren','Eindampfen','Magnetisch trennen'],'Filtrieren'),choice('salz','Trennschritt',['Filtrieren','Eindampfen','Dekantieren'],'Eindampfen')]),
  angle('mix-rampe','Technik','Den Öffnungswinkel einer Klappe messen',43),
  card(build({recipe:'music',title:'Drei Lücken im 4/4-Takt',meter:4,bars:[[4],[2,2,2],[4,2,1]]},'mix-notenwerte'),'complete-meter','meter','durations','unique-gap'),
  area('mix-satzbau','Deutsch','Die Aufgabe der Satzteile','Ordne Zeitangabe, Prädikat, Subjekt und Ortsangabe den Satzteilen zu.','labeling','sentence',1),
  sequence('mix-falter','Biologie','Metamorphose ab der Raupe','Beginne mit der Raupe und ordne die nächsten drei Stadien bis zu den neuen Eiern.','butterfly',['caterpillar','chrysalis','butterfly','egg']),
  flowTable(),
  card(visual('mix-strom','Physik','Energie in einer Taschenlampe','Verbinde die drei Stationen in der Reihenfolge, in der Energie übertragen oder umgewandelt wird: von der Batterie bis zum ausgesandten Licht.','connections',
    {directed:true,nodes:[{id:'a',label:'Batterie',x:110,y:180},{id:'b',label:'Lampe',x:350,y:90},{id:'c',label:'Licht',x:590,y:180}]},{edges:[['a','b'],['b','c']]},1),'draw-links','nodes','directed-rule'),
  scale('mix-ph','Chemie','Zitronensaft auf der pH-Skala','Bei einer Messung hat der verdünnte Zitronensaft einen pH-Wert von 3,5. Markiere ihn auf der Skala.',0,14,.5,2,'pH',3.5),
  chain('mix-englisch','Englisch','Lost property at the station','Setze zwei Antworten ein. Wähle zuerst die höfliche Frage und ergänze dann das englische Wort für „Rucksack“.',[
    ['You ask for help','Du suchst etwas Verlorenes',a(),f('frage')],
    ['The clerk asks: What did you lose?','I lost my …',a(),f('wort')]
  ],[choice('frage','Höfliche Frage',['Could you help me, please?','I cannot help you.','What time does it leave?'],'Could you help me, please?'),written('wort','Englisches Wort','backpack','rucksack')]),
  proportional(),
  pitch('mix-pitch-sequence','Eine Melodieform als Tonfolge setzen','sequence',['D5','H4','A4','G4','A4']),
  coordinate('mix-bruecke','Geografie','Brücke im Kartengitter','Setze die Endpunkte (−4 | 1) und (3 | 2) in beliebiger Reihenfolge. Das Raster zeichnet die Brücke als Strecke.',['A','B'],[{x:-4,y:1},{x:3,y:2}],'segment'),
  area('mix-kassenbeleg','Wirtschaft','Wo steht die Zahlungsart?','Tippe auf die Zeile, an der du erkennst, ob bar oder mit Karte bezahlt wurde.','hotspot','receipt',2),
  rhythm('mix-hoerschwer','Zwei Lücken im 4/4-Takt','dictation',4,100,['n1','r1','n2','n2','r2'],[1,3]),
  timeline('mix-reaktion','Chemie','Ein Messprotokoll auf der Zeitachse','Ordne die Messnotizen den Zeitpunkten zu. Die Notizen geben die Zeiten seit Versuchsbeginn an.',0,10,'min',
    [['t1',1,'1 min'],['t2',4,'4 min'],['t3',8,'8 min']],
    [['e1','Nach 8 min: Mischung abkühlen lassen'],['e2','Nach 1 min: erste Blasen beobachten'],['e3','Nach 4 min: Temperatur notieren']],{t1:'e2',t2:'e3',t3:'e1'}),
  chain('mix-abstimmung','Politik','Auszählen und entscheiden','Im Klassenrat stimmen 13 dafür, 9 dagegen und 3 enthalten sich. Für diesen Antrag zählen nur Ja und Nein. Ergänze Zahl und Ergebnis.',[
    ['Stimmen zusammenführen','13 Ja + 9 Nein',a(),f('summe'),a(),'Mehr Ja als Nein?',a(),f('ergebnis')]
  ],[{id:'summe',label:'Gültige Ja- und Nein-Stimmen',mode:'number',accepted:['22']},choice('ergebnis','Ergebnis',['angenommen','abgelehnt','Stimmengleichheit'],'angenommen')]),
  grid('mix-solar','Mathematik','Platz für Solarmodule','Das Dachraster hat 24 gleich große Felder. Markiere 37,5 % der Fläche für Solarmodule.',4,6,9),
  source('mix-schulmuseum','Drei Spuren aus dem Schulmuseum',[
    ['Schulordnung: Unterrichtsbeginn täglich 7:30 Uhr.','Laut Schulordnung beginnt der Unterricht um 7:30 Uhr.'],
    ['Inventarliste: 24 Schiefertafeln im Klassenraum.','Die Liste nennt 24 Schiefertafeln im Klassenraum.'],
    ['Veranstaltungsplakat: Schulfest am 21. Juni.','Das Schulfest war für den 21. Juni angekündigt.']]),
  area('mix-pflanzengrafik','Biologie','Eine Pflanze für das Herbarium beschriften','Ordne Blüte, Sprossachse, Blätter und Wurzel den vier beschriftbaren Bereichen zu.','labeling','plant',2),
  angle('mix-stumpf','Mathematik','Knick im Papier',117),
  sequence('mix-wasserkreislauf','Geografie','Vom Regen zurück zur Wolke','Beginne mit dem Bild, auf dem Regen fällt. Ordne die übrigen Bilder so, wie das Wasser im Kreislauf weiterwandert.','water-cycle',['precipitation','collection','evaporation','condensation'])
];
module.exports={mixedDeck,mixedCode,rankRecipe};
