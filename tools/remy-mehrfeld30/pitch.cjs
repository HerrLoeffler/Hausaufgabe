'use strict';
const pitchCode='REMYRND5';
const pitches=['E4','F4','G4','A4','H4','C5','D5','E5','F5'];
const names=['E','F','G','A','H','C','D','hohes E','hohes F'];
const pitchExamples=[
  {title:'G und A auf dem Notensystem',level:'single',notes:['G4','A4']},
  {title:'Eine Tonfolge notieren',level:'sequence',notes:['G4','A4','H4','D5','C5','G4']}
];
function buildPitch(raw,id='pitch-'+raw.level){
  if(typeof raw.title!=='string'||raw.title.trim().length<3||raw.title.length>100||
      !['single','sequence'].includes(raw.level)||!Array.isArray(raw.notes)||
      !raw.notes.every(note=>pitches.includes(note))||new Set(raw.notes).size<2||
      (raw.level==='single'?raw.notes.length!==2:raw.notes.length<3||raw.notes.length>6))
    throw Error('Die Tonaufgabe braucht zwei einzelne Töne oder eine Folge aus drei bis sechs Tönen im Violinschlüssel.');
  const positions=raw.notes.map(note=>pitches.indexOf(note));
  const notes=positions.map((position,i)=>({id:'p'+i,label:names[position]}));
  const guided=raw.level==='single';
  const text=guided
    ?'Setze G und A auf die passende Linie oder in den passenden Zwischenraum. Der Ton über jeder Spalte sagt dir, welche Note dorthin gehört.'
    :'Setze die Tonfolge von links nach rechts. Wähle für jeden Ton die richtige Linie oder den richtigen Zwischenraum im Violinschlüssel.';
  return {id,type:'pitch',heading:raw.title.trim(),subject:'Musik · Tonhöhen im Violinschlüssel',
    text:guided&&!raw.notes.every(n=>['G4','A4'].includes(n))?'Setze jeden angegebenen Ton auf die passende Linie oder in den passenden Zwischenraum.':text,
    display:{notes,guided},solution:Object.fromEntries(notes.map((note,i)=>[note.id,positions[i]])),points:notes.length*.5};
}
function publicPitch(q){return q.display;}
function scorePitch(q,answer){
  if(!answer||typeof answer!=='object'||Array.isArray(answer))return 0;
  return Object.entries(q.solution).reduce((sum,[id,position])=>sum+(Object.hasOwn(answer,id)&&answer[id]===position?0.5:0),0);
}
function pitchWish(wish){return /tonhöh|tonhoeh|tonfolge|violinschlüssel|violinschluessel|zwischenraum|notensystem/i.test(wish)&&/setz|platzier|notier|eintrag|zeichnen/i.test(wish);}
module.exports={buildPitch,publicPitch,scorePitch,pitchCode,pitchExamples,pitches,pitchWish};
