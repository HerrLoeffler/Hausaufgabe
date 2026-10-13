// Isolated experiment: every insight is controlled by the reader.
export function createDemoFlow({onChange}) {
  const crew=['coco','remy','emmi','wilma'];
  let state=null;
  const emit=()=>onChange({...state});
  function start(name,tutorial=false) {
    if(!crew.includes(name)) return false;
    state={name,phase:0,index:crew.indexOf(name),tutorial,running:false,paused:false};
    emit(); return true;
  }
  return {
    start,
    nextPhase(){if(!state||state.phase>=2)return false;state.phase++;emit();return true;},
    previousPhase(){if(!state||state.phase<=0)return false;state.phase--;emit();return true;},
    replay(){if(state)start(state.name,state.tutorial);},
    next(){if(!state||state.index>=crew.length-1)return false;return start(crew[state.index+1],state.tutorial);},
    stop(){state=null;}
  };
}
