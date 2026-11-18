export function attachDictation({window,button,input,status,onChange=()=>{},instruction='Danach kannst du speichern.'}){
  let active=null,session=0,timer=null,finish=null,stopping=null;
  const label=button.textContent;
  function idle(){
    window.clearTimeout(timer);timer=null;active=null;
    button.textContent=label;button.setAttribute('aria-pressed','false');
    if(finish){finish();finish=null;}stopping=null;
  }
  function cancel(){
    const previous=active;session++;idle();
    try{previous?.abort();}catch{}
  }
  function stop(){
    if(!active)return Promise.resolve();
    if(stopping)return stopping;
    let resolveStop;stopping=new Promise(resolve=>{resolveStop=resolve;});
    const pending=stopping;
    {
      finish=resolveStop;
      window.clearTimeout(timer);
      timer=window.setTimeout(()=>{const previous=active;session++;idle();try{previous?.abort();}catch{}},1000);
      try{active.stop();}catch{idle();}
    }
    return pending;
  }
  function start(){
    const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Speech){status.textContent='Browserdiktat ist hier nicht verfügbar. Du kannst den Text tippen.';return;}
    const id=++session,base=input.value.trim(),parts=new Map(),recognition=new Speech();
    active=recognition;recognition.lang='de-DE';recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;
    const listen=(name,callback)=>recognition.addEventListener(name,callback);
    listen('result',event=>{
      if(id!==session)return;
      for(let i=event.resultIndex;i<event.results.length;i++)parts.set(i,String(event.results[i][0]?.transcript||'').trim());
      const words=[base,...[...parts].sort((a,b)=>a[0]-b[0]).map(x=>x[1])].filter(Boolean).join(' ').replace(/\s+/g,' ');
      const limit=input.maxLength>0?input.maxLength:1000;
      input.value=words.slice(0,limit);onChange(input.value);
      input.dispatchEvent(new window.Event('input',{bubbles:true}));
      status.textContent=words.length>limit?'Die maximale Textlänge ist erreicht.':instruction;
    });
    listen('error',event=>{
      if(id!==session)return;
      status.textContent=['not-allowed','service-not-allowed','audio-capture'].includes(event.error)?
        'Mikrofon oder Browserdiktat ist nicht freigegeben. Du kannst den Text tippen.':'Das Diktat wurde unterbrochen. Der erkannte Text bleibt erhalten.';
      session++;idle();
    });
    listen('end',()=>{if(id===session){session++;idle();}});
    try{
      recognition.start();button.textContent='■ Stoppen';button.setAttribute('aria-pressed','true');
      status.textContent='Sprich jetzt. '+instruction;
      timer=window.setTimeout(()=>{void stop();},45000);
    }catch{status.textContent='Das Mikrofon konnte nicht gestartet werden. Du kannst den Text tippen.';session++;idle();}
  }
  const click=()=>{if(active)void stop();else start();};
  button.addEventListener('click',click);button.setAttribute('aria-pressed','false');
  return {stop,cancel,isActive:()=>!!active,destroy(){cancel();button.removeEventListener('click',click);}};
}
