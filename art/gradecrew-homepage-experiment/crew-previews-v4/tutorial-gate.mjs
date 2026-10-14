// Preview-only state. No credential or backend API is accepted here.
export function createTutorialGate({name,draft,authenticated=false}){
 const state={name:String(name||'').trim(),draft:structuredClone(draft),authenticated,view:'finish',intent:null,mode:'register'};
 const valid=target=>['settings','create'].includes(target);
 return {
  snapshot:()=>structuredClone(state),
  setName(value){if(state.view==='finish')state.name=String(value).trim().slice(0,60);},
  setMode(mode){if(['register','login'].includes(mode))state.mode=mode;},
  request(target){if(!valid(target))return false;state.intent=target;state.view=state.authenticated?target:'account';return true;},
  cancel(){state.view='finish';},
  returnToFinish(){state.view='finish';},
  showAccount(){if(state.intent&&!state.authenticated)state.view='account';},
  setAuthenticated(value){state.authenticated=Boolean(value);},
  simulateSignIn(){state.authenticated=true;state.view=valid(state.intent)?state.intent:'finish';}
 };
}
