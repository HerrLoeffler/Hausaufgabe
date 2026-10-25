export function createOnlineClient({getToken,getAccountId,fetchImpl=globalThis.fetch}={}){
 async function request(command,payload,teacher){
  const account=teacher?getAccountId?.():null;
  const check=()=>{if(teacher&&getAccountId&&getAccountId()!==account){const e=Error('Das Lehrkraftkonto wurde gewechselt. Bitte erneut öffnen.');e.code='account-changed';throw e;}};
  const headers={'Content-Type':'application/json'};if(teacher){const token=await getToken?.();if(!token)throw Error('Bitte als Lehrkraft anmelden.');check();headers.Authorization=`Bearer ${token}`;}
  const response=await fetchImpl('/api/classroom/online',{method:'POST',headers,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(25000),body:JSON.stringify({command,payload:payload||{}})});
  check();let result;try{result=await response.json();}catch{const e=Error('Die Klassenverwaltung konnte nicht geladen werden. Bitte lade die Seite neu oder versuche es kurz später erneut.');e.code='invalid-response';throw e;}check();if(!response.ok){const e=Error(result.error?.message||'Die Schülerverwaltung ist gerade nicht erreichbar.');e.code=result.error?.code;throw e;}return result;
 }
 return {teacher:(command,payload)=>request(command,payload,true),pupil:(command,payload)=>request(command,payload,false)};
}

export function reconcileTeacherViews({main,teacherView,pupilView,pupilActive,page,onLeave}){
 if(pupilActive||teacherView.classList.contains('hidden'))return;
 const visible=[...main.querySelectorAll('.view:not(.hidden)')].filter(v=>v!==teacherView&&v!==pupilView);
 if(!visible.length)return;
 // The original app restores its dashboard after its async profile load. A
 // later user choice in our navigation takes precedence over that restore.
 if(page!=='tests'&&visible.every(v=>['dashboardView','homeView'].includes(v.id))){for(const v of visible)v.classList.add('hidden');return;}
 teacherView.classList.add('hidden');onLeave?.();
}
