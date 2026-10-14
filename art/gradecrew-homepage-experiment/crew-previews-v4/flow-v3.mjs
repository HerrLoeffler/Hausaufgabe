export const CREW_ORDER=Object.freeze(['coco','remy','emmi','wilma']);
export const LAST_PHASE=Object.freeze({coco:2,remy:3,emmi:2,wilma:2});
export function createDemoFlow({onChange}){
 let current=null;
 const emit=()=>onChange({...current});
 function start(name,tutorial=false){
  if(!CREW_ORDER.includes(name))return false;
  current={name,phase:0,index:CREW_ORDER.indexOf(name),tutorial,running:false,paused:false};emit();return true;
 }
 return {
  start,
  nextPhase(){if(!current||current.phase>=LAST_PHASE[current.name])return false;current.phase++;emit();return true;},
  previousPhase(){if(!current||current.phase===0)return false;current.phase--;emit();return true;},
  replay(){return current?start(current.name,current.tutorial):false;},
  togglePause(){return false;},
  next(){if(!current||current.phase!==LAST_PHASE[current.name]||current.index===CREW_ORDER.length-1)return false;return start(CREW_ORDER[current.index+1],current.tutorial);},
  stop(){current=null;}
 };
}
