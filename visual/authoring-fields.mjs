// Teacher-only structured editing. Drafts are committed only after joint validation.
export function renderAuthoringFields(host, source, commit, options={}) {
  const C=globalThis.GC2, task=C.clone(source), d=host.ownerDocument;
  if(!['timeline','sequence','coordinate','angle','hotspot','labeling'].includes(task.format))return;
  const box=d.createElement('fieldset');box.className='visualAuthoringFields';
  const legend=d.createElement('legend');legend.textContent='Aufgabe anpassen';box.append(legend);
  const hint=d.createElement('p');hint.className='hint';hint.textContent='Prüfe Arbeitsauftrag, Darstellung und Lösung zusammen. Übernimm die Änderungen anschließend in die Vorschau.';box.append(hint);
  const grid=d.createElement('div');grid.className='visualAuthoringGrid';box.append(grid);
  function input(label,value,set,{number=false,min,max,step}={}){
    const row=d.createElement('label');row.textContent=label;const el=d.createElement('input');el.type=number?'number':'text';el.value=String(value??'');
    if(number){if(min!==undefined)el.min=min;if(max!==undefined)el.max=max;el.step=step??'any';}else el.maxLength=900;
    el.addEventListener('input',()=>set(number?(el.value===''?null:Number(el.value)):el.value));row.append(el);grid.append(row);return el;
  }
  function select(label,options,value,set){const row=d.createElement('label');row.textContent=label;const el=d.createElement('select');for(const [id,text]of options){const opt=d.createElement('option');opt.value=id;opt.textContent=text;el.append(opt);}el.value=value;el.addEventListener('change',()=>set(el.value));row.append(el);grid.append(row);}
  // The integrated editor already has the normal question field. Read its latest
  // value when applying, so a stale second copy cannot overwrite teacher edits.
  if(!options.getPrompt)input('Arbeitsauftrag',task.prompt,value=>task.prompt=value);
  const s=task.spec,a=task.solution;
  if(task.format==='timeline'){
    input('Achse von',s.min,v=>s.min=v,{number:true});input('Achse bis',s.max,v=>s.max=v,{number:true});input('Einheit',s.unit,v=>s.unit=v);
    s.events.forEach((e,i)=>input(`Ereignis ${i+1}`,e.text,v=>e.text=v));
    s.ticks.forEach((tick,i)=>{input(`Jahr / Wert ${i+1}`,tick.value,v=>tick.value=v,{number:true});input(`Beschriftung ${i+1}`,tick.label,v=>tick.label=v);select(`Richtige Zuordnung ${i+1}`,s.events.map(e=>[e.id,e.text]),a.assignments[tick.id],v=>a.assignments[tick.id]=v);});
  }else if(task.format==='coordinate'){
    for(const [key,label] of [['minX','x-Achse von'],['maxX','x-Achse bis'],['minY','y-Achse von'],['maxY','y-Achse bis'],['step','Rasterschritt']])input(label,s[key],v=>s[key]=v,{number:true});
    s.labels.forEach((label,i)=>{input(`Punkt ${i+1} · Name`,label,v=>s.labels[i]=v);input(`Punkt ${i+1} · x-Lösung`,a.points[i].x,v=>a.points[i].x=v,{number:true});input(`Punkt ${i+1} · y-Lösung`,a.points[i].y,v=>a.points[i].y=v,{number:true});});
  }else if(task.format==='angle'){
    input('Winkel der Zeichnung',s.degrees,v=>{s.degrees=v;a.value=v;},{number:true,min:10,max:170,step:1});
  }else if(task.format==='sequence'){
    s.items.forEach((item,i)=>input(`Bild ${i+1} · Beschreibung`,item.caption,v=>item.caption=v));
    a.order.forEach((id,i)=>select(`Lösung · Position ${i+1}`,s.items.map(item=>[item.id,item.caption]),id,v=>a.order[i]=v));
  }else if(task.format==='labeling'){
    s.items.forEach((item,i)=>input(`Begriff ${i+1}`,item.text,v=>item.text=v));
    s.regions.forEach((id,i)=>select(`Lösung · Feld ${i+1}`,s.items.map(item=>[item.id,item.text]),a.assignments[id],v=>a.assignments[id]=v));
  }else{
    const scene=C.scenes[s.scene];s.regions.forEach((id,i)=>{const row=d.createElement('label'),el=d.createElement('input');el.type='checkbox';el.checked=a.regions.includes(id);el.addEventListener('change',()=>{a.regions=el.checked?[...a.regions,id]:a.regions.filter(v=>v!==id);});row.append(el,d.createTextNode(`Richtig: ${scene?.labels?.[i]||'Bereich '+(i+1)}`));grid.append(row);});
  }
  const error=d.createElement('p');error.className='hint';error.setAttribute('role','alert');box.append(error);
  const apply=d.createElement('button');apply.type='button';apply.className='button secondary';apply.textContent='Änderungen übernehmen';
  apply.addEventListener('click',()=>{
    const candidate=C.clone(task);if(options.getPrompt)candidate.prompt=options.getPrompt();
    try{const problems=C.validate(candidate);if(problems.length)throw new Error(problems.join(' '));options.validateDraft?.(candidate);}
    catch(problem){error.textContent='Die Änderungen wurden noch nicht übernommen. '+problem.message;return;}
    error.textContent='';commit(candidate);
  });box.append(apply);host.append(box);
}
