import {createDemoFlow as originalFlow} from './baseline/gradecrew-hero-demo-flow.mjs?v=1';
export function createDemoFlow(options){
 let current=null;
 const original=originalFlow({...options,onChange:next=>{current=next;options.onChange(next);}});
 const own=name=>name==='coco'||name==='remy';
 const emit=()=>options.onChange({...current});
 function start(name,tutorial=false){
  if(!own(name))return original.start(name,tutorial);
  original.stop();current={name,phase:0,index:['coco','remy','emmi','wilma'].indexOf(name),tutorial,running:false,paused:false};emit();
 }
 return {
  start,
  nextPhase(){if(!own(current?.name))return original.nextPhase();const max=current.name==='remy'?3:2;if(current.phase>=max)return false;current.phase++;emit();return true;},
  previousPhase(){if(!own(current?.name)||current.phase===0)return false;current.phase--;emit();return true;},
  replay(){if(own(current?.name))start(current.name,current.tutorial);else original.replay();},
  togglePause(){if(!own(current?.name))original.togglePause();},
  next(){return original.next();},
  stop(){original.stop();current=null;}
 };
}

