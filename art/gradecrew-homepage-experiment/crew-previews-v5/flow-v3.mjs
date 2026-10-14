export const CREW_ORDER=Object.freeze(['coco','remy','emmi','wilma']);
export const LAST_PHASE=Object.freeze({coco:1,remy:3,emmi:2,wilma:2});
export function createDemoFlow({onChange,reducedMotion=false,delay=5000,schedule=setTimeout,cancel=clearTimeout}){
 let current=null,timer=null,suspended=false;
 const clear=()=>{if(timer!==null)cancel(timer);timer=null;};
 const canRun=()=>current&&!reducedMotion&&current.name!=='remy'&&!(current.name==='wilma'&&current.phase===LAST_PHASE.wilma);
 const emit=()=>onChange({...current});
 function arm(){clear();if(!canRun()||current.paused||suspended)return;timer=schedule(()=>{timer=null;if(!current)return;if(current.phase<LAST_PHASE[current.name]){current.phase++;update();}else next();},delay);}
 function update(){current.running=Boolean(canRun());emit();arm();}
 function start(name,tutorial=false){if(!CREW_ORDER.includes(name))return false;clear();current={name,phase:0,index:CREW_ORDER.indexOf(name),tutorial,running:false,paused:false};update();return true;}
 function next(){if(!current||current.phase!==LAST_PHASE[current.name]||current.index===CREW_ORDER.length-1)return false;return start(CREW_ORDER[current.index+1],current.tutorial);}
 return {start,next,
 nextPhase(){if(!current||current.phase>=LAST_PHASE[current.name])return false;current.phase++;update();return true;},
 previousPhase(){if(!current||current.phase===0)return false;current.phase--;update();return true;},
 replay(){return current?start(current.name,current.tutorial):false;},
 togglePause(){if(!canRun())return false;current.paused=!current.paused;update();return true;},
 setSuspended(value){suspended=Boolean(value);arm();},
 stop(){clear();current=null;}
 };
}
