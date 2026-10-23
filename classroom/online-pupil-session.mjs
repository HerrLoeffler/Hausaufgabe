// No names or credentials in storage: only lock and local expiry metadata.
export function createPupilSession({api,storage,now=Date.now,onChange=()=>{},onError=()=>{}}){
 const lockKey='gcClassroomPupilRequiresCode',metaKey='gcClassroomPupilExpiry';
 let value=null,revision=0,blocked=false,lastActivityRequest=0;
 const read=key=>{try{return storage.getItem(key);}catch{blocked=true;return null;}};
 const write=(key,v)=>{try{storage.setItem(key,v);}catch{blocked=true;}};
 const meta=()=>{try{return JSON.parse(read(metaKey)||'null');}catch{return null;}};
 const emit=next=>{if(value===next)return;value=next;onChange(next);};
 const locked=()=>blocked||read(lockKey)==='1';
 function lock(){revision++;blocked=true;write(lockKey,'1');emit(null);}
 function checkLocal(){const m=meta();if(locked()){if(value)lock();return true;}if(m&&(m.expiresAt<=now()||(m.mode==='shared'&&m.idleUntil<=now()))){lock();return true;}return false;}
 function accept(next,{fresh=false}={}){const old=meta();if(fresh||!old||old.mode!==next.session.deviceMode){write(metaKey,JSON.stringify({mode:next.session.deviceMode,expiresAt:next.session.expiresAt,idleUntil:now()+300000}));}emit(next);}
 async function login(payload){const current=++revision;blocked=true;write(lockKey,'1');emit(null);const next=await api.pupil('login',payload);if(current!==revision)return;blocked=false;write(lockKey,'0');accept(next,{fresh:true});}
 async function restore(){if(checkLocal())return;const current=revision;try{const next=await api.pupil('me');if(current!==revision||checkLocal())return;accept(next);}catch(e){if(current===revision){if(e.code==='unauthenticated')lock();else onError(e);}}}
 async function poll(){if(!value||checkLocal())return;const current=revision,id=value.student.id;try{const next=await api.pupil('me');if(current!==revision||checkLocal())return;if(next.student.id!==id){lock();return;}accept(next);}catch(e){if(current===revision){if(e.code==='unauthenticated')lock();else{checkLocal();onError(e);}}}}
 async function logout(){lock();try{await api.pupil('logout');}catch(e){onError(e);}}
 async function acknowledge(payload){if(!value||checkLocal())return;const current=revision,id=value.student.id;await api.pupil('acknowledgeResume',payload);if(current!==revision||checkLocal())return;const next=await api.pupil('me');if(current!==revision||checkLocal())return;if(next.student.id!==id){lock();return;}accept(next);}
 function activity(){if(!value||checkLocal())return;const m=meta();if(m?.mode==='shared')write(metaKey,JSON.stringify({...m,idleUntil:now()+300000}));if(now()-lastActivityRequest<30000)return;lastActivityRequest=now();const current=revision;void api.pupil('activity').catch(e=>{if(current===revision&&e.code==='unauthenticated')lock();});}
 function externalChange(key){if(key===lockKey){revision++;blocked=true;emit(null);}}
 return {get value(){return value;},login,restore,poll,logout,acknowledge,activity,checkLocal,externalChange};
}
