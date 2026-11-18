import {note} from './recipe-view.mjs';

const names={n1:'Achtelnote',n2:'Viertelnote',n4:'Halbe Note',r1:'Achtelpause',r2:'Viertelpause',r4:'Halbe Pause'};
function element(tag,text,className){
  const node=document.createElement(tag);
  if(text)node.textContent=text;
  if(className)node.className=className;
  return node;
}
function glyph(code){
  if(code[0]==='n')return note(Number(code[1]));
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 36 48');svg.setAttribute('role','img');svg.setAttribute('aria-label',names[code]);
  const shape=document.createElementNS(ns,'path');
  if(code==='r4'){
    shape.setAttribute('d','M9 23h18v6H9z');
    shape.setAttribute('fill','currentColor');
  }else{
    shape.setAttribute('d',code==='r2'?'M18 7l6 10-9 8 8 8q-11-3-5 7':'M25 17L17 37M24 18q-11 5-12-2q0-5 5-3q4 2 0 6');
    shape.setAttribute('fill','none');shape.setAttribute('stroke','currentColor');shape.setAttribute('stroke-width','2.8');
    shape.setAttribute('stroke-linecap','round');shape.setAttribute('stroke-linejoin','round');
  }
  svg.append(shape);return svg;
}
export function mountRhythm(host,task,listen,change){
  const status=element('p','Der Rhythmus wird geladen …','recipe-status');
  status.setAttribute('role','status');
  const media=element('audio');
  media.controls=true;media.hidden=true;media.preload='auto';
  media.setAttribute('aria-label','Rhythmus mit Einzähler');
  const retry=element('button','Audio erneut laden','secondary');
  retry.type='button';retry.hidden=true;
  const staff=element('div','','recipe-staff rhythm-staff');
  staff.append(element('strong',task.meter+'/4'));
  const choices=element('div');
  const markers=new Map(),answer={};
  let cues=[],disposed=false,frame=0;
  host.append(element('p',task.level+' · '+task.bpm+' Schläge pro Minute'),status,media,retry,staff,choices);
  for(const slot of task.slots){
    if(slot.symbol){staff.append(glyph(slot.symbol));continue;}
    if(!slot.gap){staff.append(element('span','·','rhythm-hidden'));continue;}
    const index=markers.size+1;
    const marker=element('span','?','recipe-note-slot rhythm-gap');
    marker.setAttribute('aria-label','Lücke '+index);
    markers.set(slot.gap,marker);staff.append(marker);
    const buttons=element('div','','recipe-notes');
    for(const code of task.symbols){
      const b=element('button','','secondary');
      b.type='button';b.setAttribute('aria-label','Lücke '+index+': '+names[code]+' einsetzen');
      b.setAttribute('aria-pressed','false');
      b.append(glyph(code),element('span',names[code]));
      b.onclick=()=>{
        answer[slot.gap]=code;
        change({...answer});
        marker.replaceChildren(glyph(code));
        marker.setAttribute('aria-label','Lücke '+index+': '+names[code]+' eingesetzt');
        for(const button of buttons.children)button.setAttribute('aria-pressed',String(button===b));
      };
      buttons.append(b);
    }
    choices.append(element('h4','Lücke '+index),buttons);
  }
  function highlight(){
    for(const [id,marker] of markers)marker.classList.toggle('rhythm-now',cues.some(c=>c.id===id&&media.currentTime>=c.at&&media.currentTime<c.at+.18));
    if(!media.paused&&!media.ended&&!disposed)frame=requestAnimationFrame(highlight);
  }
  function clear(){
    cancelAnimationFrame(frame);
    for(const marker of markers.values())marker.classList.remove('rhythm-now');
  }
  media.onplay=()=>{clear();highlight();};
  media.onpause=clear;media.onended=clear;
  media.onerror=()=>{if(!disposed){status.textContent='Der Rhythmus konnte nicht abgespielt werden.';retry.hidden=false;}};
  async function load(){
    retry.hidden=true;status.textContent='Der Rhythmus wird geladen …';
    try{
      const audio=await listen();
      if(disposed)return;
      cues=audio.cues;
      media.src='data:audio/wav;base64,'+audio.audioBase64;
      media.hidden=false;
      status.textContent='Zum Anhören auf Wiedergabe drücken. Die Lücken leuchten kurz auf.';
    }catch{
      if(!disposed){status.textContent='Der Rhythmus konnte nicht geladen werden.';retry.hidden=false;}
    }
  }
  retry.onclick=load;void load();
  return {destroy(){disposed=true;clear();if(!media.paused)media.pause();media.removeAttribute('src');}};
}
