const svgNS='http://www.w3.org/2000/svg';
const noteNames={1:'Achtelnote',2:'Viertelnote',4:'Halbe Note',8:'Ganze Note'};
function element(tag,text,className){
  const el=document.createElement(tag);
  if(text)el.textContent=text;
  if(className)el.className=className;
  return el;
}
function selectButton(label,click){
  const b=element('button',label,'secondary');
  b.type='button';b.setAttribute('aria-pressed','false');b.onclick=click;
  return b;
}
function pressOnly(buttons,selected){
  for(const button of buttons)button.setAttribute('aria-pressed',String(button===selected));
}
function note(value){
  const svg=document.createElementNS(svgNS,'svg');
  svg.setAttribute('viewBox','0 0 36 48');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label',noteNames[value]);
  const path=document.createElementNS(svgNS,'path');
  path.setAttribute('d',value===8?'M8 34c0-6 20-7 20 0s-20 7-20 0':value===1?'M22 33V6q10 4 10 12':'M22 33V6');
  path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','2');
  svg.append(path);
  if(value!==8){
    const head=document.createElementNS(svgNS,'ellipse');
    for(const [name,val] of Object.entries({cx:16,cy:34,rx:7,ry:4,fill:value===4?'white':'currentColor',stroke:'currentColor',transform:'rotate(-20 16 34)'}))
      head.setAttribute(name,val);
    svg.append(head);
  }
  return svg;
}
function sources(host,recipe,change){
  const group=element('div','','recipe-source-grid'),left=element('div'),right=element('div');
  left.append(element('h4','Quellen (fiktiv)'));right.append(element('h4','Aussagen'));
  const status=element('p','Wähle zuerst eine Quelle.','recipe-status'),links=element('ul');
  status.setAttribute('role','status');
  let current=null;
  const answers={},buttons=[];
  recipe.sources.forEach((s,i)=>{
    const letter=String.fromCharCode(65+i);
    const b=selectButton(letter+' · '+s.text,()=>{
      current=s.id;
      pressOnly(buttons,b);
      status.textContent='Quelle '+letter+' gewählt. Wähle jetzt die passende Aussage.';
    });
    buttons.push(b);left.append(b);
  });
  recipe.claims.forEach((claim,i)=>{
    right.append(selectButton((i+1)+' · '+claim.text,()=>{
      if(!current){status.textContent='Wähle zuerst eine Quelle.';return;}
      answers[current]=claim.id;change({...answers});
      const selected=recipe.sources.findIndex(s=>s.id===current);
      status.textContent='Quelle '+String.fromCharCode(65+selected)+' mit Aussage '+(i+1)+' verbunden.';
      links.replaceChildren(...recipe.sources.flatMap((s,idx)=>{
        const target=recipe.claims.findIndex(c=>c.id===answers[s.id]);
        return target<0?[]:[element('li',String.fromCharCode(65+idx)+' → '+(target+1))];
      }));
      current=null;pressOnly(buttons,null);
    }));
  });
  group.append(left,right);host.append(status,group,links);
}
function maze(host,recipe,change){
  const answers={};
  const cards=element('div','','recipe-maze-grid');
  recipe.boards.forEach((board,i)=>{
    const card=element('section','','recipe-board'),grid=element('div','','maze-picture');
    const direction={'↑':'oben','→':'rechts','↓':'unten','←':'links'}[board.arrow];
    grid.setAttribute('role','img');
    grid.setAttribute('aria-label','Raster. '+recipe.actor+' in Zeile '+(board.y+1)+', Spalte '+(board.x+1)+', Blickrichtung '+direction+'. X bedeutet Wand. '+board.cells.map((row,y)=>'Zeile '+(y+1)+': '+row.replaceAll('#','X ').replaceAll('.','frei ')).join('. '));
    card.append(element('h4','Bild '+(i+1)+' · '+recipe.actor),grid);
    board.cells.forEach((row,y)=>[...row].forEach((tile,x)=>{
      grid.append(element('span',x===board.x&&y===board.y?board.arrow:tile==='#'?'×':'',x===board.x&&y===board.y?'maze-mouse':tile==='#'?'maze-wall':'maze-path'));
    }));
    const buttons=[];
    for(const [id,label] of [['turn','Nach links drehen'],['forward','Ein Feld vorwärts']]){
      const b=selectButton(label,()=>{answers[board.id]=id;change({...answers});pressOnly(buttons,b);});
      buttons.push(b);card.append(b);
    }
    cards.append(card);
  });
  host.append(cards);
}
function music(host,recipe,change){
  const answers={};
  recipe.bars.forEach((bar,i)=>{
    const card=element('section','','recipe-board'),staff=element('div','','recipe-staff');
    const slot=element('span','?','recipe-note-slot');
    const choices=element('div','','recipe-notes');
    slot.setAttribute('aria-label','Leerer Notenplatz');
    staff.append(element('strong',recipe.meter+'/4'),...bar.notes.map(note),slot);
    const buttons=[];
    for(const value of recipe.noteValues){
      const b=selectButton('',()=>{
        answers[bar.id]=value;change({...answers});pressOnly(buttons,b);
        slot.replaceChildren(note(value));slot.setAttribute('aria-label',noteNames[value]+' eingesetzt');
      });
      b.setAttribute('aria-label','Takt '+(i+1)+': '+noteNames[value]+' einsetzen');
      b.append(note(value),element('span',noteNames[value]));
      buttons.push(b);choices.append(b);
    }
    card.append(element('h4','Takt '+(i+1)),staff,choices);host.append(card);
  });
}
export function mountRecipe(host,recipe,change){
  if(recipe.recipe==='sources')sources(host,recipe,change);
  if(recipe.recipe==='maze')maze(host,recipe,change);
  if(recipe.recipe==='music')music(host,recipe,change);
}
