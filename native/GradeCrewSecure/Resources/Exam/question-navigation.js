'use strict';
function createQuestionNavigation({paper, root, navRoot, reducedMotion = false}) {
  navRoot.__gcQuestionNavigation?.destroy();
  const numbers = navRoot.querySelector('#secureQuestionNumbers');
  const current = navRoot.querySelector('#secureCurrentQuestion');
  const previous = navRoot.querySelector('#securePrevious');
  const next = navRoot.querySelector('#secureNext');
  const toggle = navRoot.querySelector('#secureOverviewToggle');
  const sections = new Map([...root.querySelectorAll('.secureQuestion')].map(node => [node.dataset.qid, node]));
  const bindings = [], states = new Map();
  let index = 0, locked = false, destroyed = false, navigating = false, timer = null, frame = null, anchor = null;
  const bind = (node, name, callback, options) => { node.addEventListener(name,callback,options);bindings.push(()=>node.removeEventListener(name,callback,options)); };
  const buttons = paper.map((question, i) => {
    const button = document.createElement('button');
    button.type = 'button';button.className = 'secureQuestionNumber';button.dataset.qid = question.id;
    const number = document.createElement('span');number.textContent=String(i+1);
    const badge = document.createElement('span');badge.className='secureQuestionBadge';badge.setAttribute('aria-hidden','true');
    button.append(number,badge);
    bind(button,'click',()=> { setOverview(false);select(question.id,{focus:true}); });
    return button;
  });
  numbers.replaceChildren(...buttons);
  function setOverview(open) {
    if (locked || destroyed) return;
    navRoot.classList.toggle('overviewOpen',open);toggle.setAttribute('aria-expanded',String(open));
    toggle.textContent=open?'Übersicht schließen':'Übersicht';measure();
  }
  function measure() {
    const font=parseFloat(getComputedStyle(numbers).fontSize)||19;
    const compact=font>27 && (navRoot.clientWidth<600 || window.innerHeight<850);
    navRoot.classList.toggle('compactNavigation',compact);
    current.textContent=compact ? `${index+1} / ${paper.length}` : `Aufgabe ${index+1} von ${paper.length}`;
    current.setAttribute('aria-label',`Aufgabe ${index+1} von ${paper.length}`);
    toggle.textContent=navRoot.classList.contains('overviewOpen') ? (compact?'Schließen':'Übersicht schließen') : 'Übersicht';
    const columns=Math.max(1,Math.min(12,Math.floor((numbers.clientWidth+8)/(Math.max(48,font*3.2)+8))));
    numbers.style.setProperty('--secure-nav-columns',String(columns));
    const height=navRoot.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--secure-nav-height',height+'px');
  }
  function sync() {
    if(destroyed) return;
    current.textContent=paper.length ? (navRoot.classList.contains('compactNavigation') ? `${index+1} / ${paper.length}` : `Aufgabe ${index+1} von ${paper.length}`) : 'Keine Aufgaben';
    current.setAttribute('aria-label',`Aufgabe ${index+1} von ${paper.length}`);
    previous.disabled=locked || index<=0;next.disabled=locked || index>=paper.length-1;
    buttons.forEach((button,i)=> {
      const selected=i===index, state=states.get(paper[i].id)||'open';
      button.classList.toggle('current',selected);button.classList.toggle('complete',state==='complete');
      button.classList.toggle('started',state==='started');
      if(selected) button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
      button.querySelector('.secureQuestionBadge').textContent=state==='complete'?'✓':state==='started'?'·':'';
      button.setAttribute('aria-label',`Aufgabe ${i+1} von ${paper.length}, ${state==='complete'?'bearbeitet':state==='started'?'begonnen':'offen'}${selected?', aktuell':''}`);
    });
    const selected=buttons[index];
    if(selected && !navRoot.classList.contains('overviewOpen') && typeof numbers.scrollTo==='function') {
      numbers.scrollTo({left:Math.max(0,selected.offsetLeft-numbers.offsetLeft-numbers.clientWidth/2+selected.offsetWidth/2),behavior:'auto'});
    }
  }
  function select(id,{focus=false}={}) {
    const target=paper.findIndex(q=>q.id===id), section=sections.get(id);
    if(locked || destroyed || target<0 || !section) return false;
    index=target;anchor=id;navigating=true;clearTimeout(timer);sync();measure();
    root.querySelectorAll('audio').forEach(audio=> { if(!section.contains(audio) && !audio.paused) audio.pause(); });
    if(focus) { section.tabIndex=-1;section.focus({preventScroll:true}); }
    const top=section.getBoundingClientRect().top+window.scrollY-navRoot.getBoundingClientRect().height-8;
    window.scrollTo({top:Math.max(0,top),behavior:reducedMotion?'auto':'smooth'});
    timer=setTimeout(()=>{navigating=false;},700);
    root.dispatchEvent(new CustomEvent('securequestionchange',{detail:{questionId:id,index}}));
    return true;
  }
  function scrollSync() {
    if(destroyed || locked || frame!==null) return;
    frame=requestAnimationFrame(()=> {
      frame=null;if(navigating || anchor) return;
      const edge=navRoot.getBoundingClientRect().bottom+9;
      let best=0;
      paper.forEach((q,i)=> { if(sections.get(q.id)?.getBoundingClientRect().top<=edge) best=i; });
      if(index!==best) { index=best;sync();root.dispatchEvent(new CustomEvent('securequestionchange',{detail:{questionId:paper[index]?.id,index}})); }
    });
  }
  bind(previous,'click',()=>select(paper[index-1]?.id,{focus:true}));
  bind(next,'click',()=>select(paper[index+1]?.id,{focus:true}));
  bind(toggle,'click',()=>setOverview(!navRoot.classList.contains('overviewOpen')));
  bind(window,'scroll',scrollSync,{passive:true});
  bind(window,'resize',()=>{measure();realign();scrollSync();});
  const cancelNavigation=()=>{anchor=null;navigating=false;clearTimeout(timer);};
  bind(window,'wheel',cancelNavigation,{passive:true});bind(window,'touchstart',cancelNavigation,{passive:true});
  bind(window,'keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Tab'].includes(event.key))cancelNavigation();});
  bind(root,'pointerdown',cancelNavigation,{passive:true});
  function realign() {
    if(!anchor || destroyed || locked) return;
    const section=sections.get(anchor);if(!section)return;
    const delta=section.getBoundingClientRect().top-navRoot.getBoundingClientRect().height-8;
    if(Math.abs(delta)>1)window.scrollTo({top:Math.max(0,window.scrollY+delta),behavior:'auto'});
  }
  if(window.visualViewport) bind(window.visualViewport,'resize',()=>{measure();realign();scrollSync();});
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>{measure();realign();scrollSync();}):null;
  observer?.observe(navRoot);observer?.observe(root);
  const api={
    refresh(answers,touched) { if(destroyed) return;paper.forEach(q=>states.set(q.id,questionCompletion(q,answers[q.id],touched)));sync(); },
    select,
    freeze() { locked=true;clearTimeout(timer);navRoot.querySelectorAll('button').forEach(b=>{b.disabled=true;}); },
    destroy() { destroyed=true;clearTimeout(timer);if(frame!==null)cancelAnimationFrame(frame);bindings.forEach(remove=>remove());observer?.disconnect(); }
  };
  navRoot.__gcQuestionNavigation=api;sync();measure();return api;
}
