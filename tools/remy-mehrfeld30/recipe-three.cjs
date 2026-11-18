'use strict';
const {createHash}=require('node:crypto');
const recipeCode='REMYRND3';
const names={sources:'Geschichte · Quellen verbinden',maze:'Informatik · Labyrinth',music:'Musik · Notentakt'};
const examples=[
  {recipe:'sources',title:'Was belegt welche Quelle?',sources:[
    {source:'Bahnhofsfahrplan: Erster Zug nach Augsburg 5:40 Uhr.',claim:'Der erste Zug nach Augsburg fährt um 5:40 Uhr.'},
    {source:'Preisschild in der Bäckerei: Brot 20 Pfennig.',claim:'Ein Brot kostet 20 Pfennig.'},
    {source:'Plakat des Stadtmuseums: Eintritt am Sonntag frei.',claim:'Sonntags ist der Eintritt ins Stadtmuseum kostenlos.'}]},
  {recipe:'maze',title:'Maus an der Kreuzung',mazes:[
    {cells:['#####','#...#','#.#.#','#...#','#####'],x:1,y:2,facing:'east'},
    {cells:['#####','#...#','#...#','#.#.#','#####'],x:2,y:2,facing:'north'}]},
  {recipe:'music',title:'Vervollständige die 4/4-Takte',meter:4,bars:[[4,2],[2,2,2],[4,1,2]]}
];
const directions={north:[0,-1,'↑'],east:[1,0,'→'],south:[0,1,'↓'],west:[-1,0,'←']};
const noteValues=[1,2,4,8];
const isText=(v,max)=>typeof v==='string'&&v.trim().length>=3&&v.length<=max;
const unique=arr=>new Set(arr.map(x=>x.trim().toLowerCase().replace(/[.!?]+$/,''))).size===arr.length;
function build(raw,id='recipe-'+raw.recipe){
  const recipe=raw.recipe;
  if(!Object.hasOwn(names,recipe)||!isText(raw.title,100))throw Error('Für diesen Wunsch ist kein passendes Pilotformat verfügbar.');
  let display,solution,text;
  if(recipe==='sources'){
    const rows=raw.sources;
    if(!Array.isArray(rows)||rows.length<2||rows.length>3||!rows.every(x=>isText(x?.source,180)&&isText(x?.claim,140))||
        !unique(rows.map(x=>x.source))||!unique(rows.map(x=>x.claim)))throw Error('Die Quellen müssen unterschiedliche, klare Aussagen belegen.');
    const key=(prefix,value)=>prefix+createHash('sha256').update(prefix+':'+value).digest('hex').slice(0,12);
    const sources=rows.map(x=>({id:key('s',x.source),text:x.source}));
    const claims=rows.map(x=>({id:key('c',x.claim),text:x.claim}));
    const shuffled=[...claims].sort((a,b)=>a.id.localeCompare(b.id));
    if(shuffled.every((c,i)=>c.id===claims[i].id))shuffled.push(shuffled.shift());
    display={sources,claims:shuffled};
    solution=Object.fromEntries(sources.map((source,i)=>[source.id,claims[i].id]));
    text='Lies links die Quellen und rechts die Aussagen. Klicke zuerst eine Quelle an, dann die Aussage, die sie direkt belegt. Verbinde jede Quelle genau einmal.';
  }else if(recipe==='maze'){
    if(!Array.isArray(raw.mazes)||raw.mazes.length!==2)throw Error('Das Labyrinth braucht genau zwei Situationen.');
    const boards=raw.mazes.map((b,i)=>{
      if(!Array.isArray(b?.cells)||b.cells.length!==5||!b.cells.every(row=>typeof row==='string'&&/^[.#]{5}$/.test(row))||
          !Number.isInteger(b.x)||!Number.isInteger(b.y)||b.x<1||b.y<1||b.x>3||b.y>3||b.cells[b.y][b.x]!=='.'||!Object.hasOwn(directions,b.facing))
        throw Error('Das Labyrinth hat keine gültige Startposition.');
      const [dx,dy,arrow]=directions[b.facing];
      return {id:'m'+i,cells:b.cells,x:b.x,y:b.y,arrow,move:b.cells[b.y+dy][b.x+dx]==='#'?'turn':'forward'};
    });
    if(boards[0].move===boards[1].move)throw Error('Zeige einen freien Weg und eine Wand.');
    const actor=['Maus','Roboter','Figur'].includes(raw.actor)?raw.actor:'Maus';
    display={actor,boards:boards.map(({move,...b})=>b)};
    solution=Object.fromEntries(boards.map(b=>[b.id,b.move]));
    text='Der Pfeil zeigt die Blickrichtung. Steht direkt davor eine Wand, dreht sich '+(actor==='Roboter'?'der Roboter':'die '+actor)+' nach links. Sonst geht es ein Feld vorwärts. Wähle für jedes Bild den nächsten Schritt.';
  }else{
    if(![3,4].includes(raw.meter)||!Array.isArray(raw.bars)||raw.bars.length<2||raw.bars.length>4)throw Error('Erstelle zwei bis vier Takte in 3/4 oder 4/4.');
    const total=raw.meter*2;
    const bars=raw.bars.map((notes,i)=>{
      if(!Array.isArray(notes)||notes.length<1||notes.length>5||!notes.every(v=>noteValues.includes(v)))throw Error('Ungültige Notenwerte.');
      const gap=total-notes.reduce((n,v)=>n+v,0);
      if(!noteValues.includes(gap))throw Error('In jeden Takt muss genau eine verfügbare Note passen.');
      return {id:'b'+i,notes,gap};
    });
    display={meter:raw.meter,bars:bars.map(({gap,...b})=>b),noteValues:noteValues.filter(value=>value<=total)};
    solution=Object.fromEntries(bars.map(b=>[b.id,b.gap]));
    text='Setze in jeden leeren Taktplatz genau eine Note ein. Wähle unter dem Takt die Note, die den '+raw.meter+'/4-Takt vollständig macht.';
  }
  return {id,type:'recipe',recipe,heading:raw.title.trim(),subject:names[recipe],text,display,solution,points:Object.keys(solution).length*.5};
}
function publicRecipe(q){return {recipe:q.recipe,...q.display};}
function scoreRecipe(q,answer){
  if(!answer||typeof answer!=='object'||Array.isArray(answer))return 0;
  return Object.entries(q.solution).reduce((n,[id,value])=>n+(Object.hasOwn(answer,id)&&answer[id]===value?0.5:0),0);
}
module.exports={build,examples,recipeCode,publicRecipe,scoreRecipe};
