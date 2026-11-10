const ns='http://www.w3.org/2000/svg';
let renderCount=0;
function element(tag,text,className){
  const node=document.createElement(tag);
  if(text)node.textContent=text;
  if(className)node.className=className;
  return node;
}
function clef(){
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 42 95');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('preserveAspectRatio','none');
  const path=document.createElementNS(ns,'path');
  path.setAttribute('d','M19 82c-12 1-13-13-3-15 8-2 11 7 5 10 8-4 7-13 5-22L18 18c-2-9 2-17 7-15 6 4 3 16-2 25C17 39 5 43 5 55c0 11 9 17 21 14 11-2 15-13 8-20-7-7-18-1-17 8 1 4 3 6 5 7');
  path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');
  path.setAttribute('stroke-width','4.4');path.setAttribute('stroke-linecap','round');
  svg.append(path);
  return svg;
}
export function mountPitch(host,pitch,change){
  const layout=element('div','','pitch-staff'),prefix='pitch-'+(++renderCount)+'-';
  const clefColumn=element('div','','pitch-clef');
  const staffName=element('strong','Violinschlüssel','pitch-staff-name');
  const clefBody=element('div','','pitch-clef-body');
  for(let i=0;i<9;i++)clefBody.append(element('span','',i%2===0?'pitch-line':'pitch-space'));
  clefBody.append(clef());
  clefColumn.append(staffName,clefBody);layout.append(clefColumn);
  if(pitch.guided)host.append(element('p','Orientierung: Die unterste Linie ist E. Zähle von unten nach oben.','recipe-status'));
  const answer={};
  pitch.notes.forEach((tone,i)=>{
    const group=element('div','','pitch-column');
    group.setAttribute('role','radiogroup');
    group.setAttribute('aria-label','Ton '+(i+1)+': '+tone.label);
    group.append(element('strong',tone.label,'pitch-target'));
    for(let position=8;position>=0;position--){
      const line=position%2===0;
      const label=element('label','',line?'pitch-hit pitch-line':'pitch-hit pitch-space');
      const input=element('input');
      input.type='radio';input.name=prefix+tone.id;input.value=String(position);
      const number=line?position/2+1:(position+1)/2;
      input.setAttribute('aria-label','Ton '+(i+1)+' · '+number+'. '+(line?'Linie':'Zwischenraum')+' von unten');
      const mark=element('span','','pitch-mark');
      mark.setAttribute('aria-hidden','true');
      label.append(input,mark);
      input.addEventListener('change',()=>{answer[tone.id]=position;change({...answer});});
      group.append(label);
    }
    layout.append(group);
  });
  host.append(layout);
}
